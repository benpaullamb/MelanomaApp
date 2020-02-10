const tf = require('@tensorflow/tfjs');
const tfn = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');

async function loadImages(dir, imageSize, startIndex, endIndex) {
    console.time('Load Images Duration');
    console.log('--------------------------------');
    console.log(`Loading images from ${dir}`);

    const imageTensors = await getImageTensorsFromDir(dir, startIndex, endIndex);
    console.log(`Number of tensors in memory: ${tf.memory().numTensors}`);

    console.log('Resizing images');
    const resizedImages = resizeImages(imageTensors, imageSize);
    imageTensors.forEach(t => t.dispose());
    console.log(`Number of tensors in memory: ${tf.memory().numTensors}`);

    console.log('Batching tensors');
    const batchedTensor = batchTensors(resizedImages);
    resizedImages.forEach(t => t.dispose());
    console.log(`Number of tensors in memory: ${tf.memory().numTensors}`);

    console.log('Normalising image data');
    const tensor = normaliseImages(batchedTensor);
    batchedTensor.dispose();
    console.log(tensor.shape);

    console.log(`Number of tensors in memory: ${tf.memory().numTensors}`);
    console.timeEnd('Load Images Duration');

    return tensor;
}

async function loadImage(path, size) {
    console.log(`Loading Single Image ${path}`);

    const imageTensor = await getImageTensor(path);

    console.log('Resizing images');
    const resizedImage = resizeImages([imageTensor], size)[0];
    imageTensor.dispose();

    console.log('Normalising image data');
    const tensor = normaliseImages(resizedImage);
    resizedImage.dispose();
    console.log(tensor.shape);

    return tensor;
}

function saveTensorAsImages(tensor, dir) {
    tf.tidy(() => {
        const imageTensors = tf.split(tensor, tensor.shape[0]);
        const imageTensors3d = imageTensors.map(image => tf.unstack(image)[0]);

        imageTensors3d.forEach(async (image, i) => {
            const jpeg = await tfn.node.encodeJpeg(image, 'rgb');
            fs.writeFile(path.join(dir, `${i + 1}.jpg`), jpeg, err => {
                if (err) return console.log(err);
            });
        });
    });
}

function normaliseImages(tensor) {
    return tf.div(tensor, tf.scalar(255));
}

function batchTensors(tensors) {
    return tf.concat(tensors);
}

function resizeImages(tensors, size) {
    const cropSize = [size, size];
    const boxInd = [0];

    tensors4d = tensors.map(tensor => tf.expandDims(tensor));

    const resizedImages = tensors4d.map(image => {
        const width = image.shape[2];
        const height = image.shape[1];

        let croppedSize = 0;
        if (width < height) {
            croppedSize = Math.floor(width / 100) * 100;
        } else {
            croppedSize = Math.floor(height / 100) * 100;
        }

        const y1 = (height / 2) - (croppedSize / 2);
        const x1 = (width / 2) - (croppedSize / 2);

        const y2 = (height / 2) + (croppedSize / 2);
        const x2 = (width / 2) + (croppedSize / 2);

        const boxes = [
            [y1 / height, x1 / width, y2 / height, x2 / width]
        ];

        return tf.image.cropAndResize(image, boxes, boxInd, cropSize);
    });

    tensors4d.forEach(t => t.dispose());

    return resizedImages;
}

async function printImagesSummary(dir, startIndex, endIndex) {
    console.time('Print Images Summary Duration');

    const tensors = await getImageTensorsFromDir(dir, startIndex, endIndex);

    console.log('--------------------------------');
    console.log(`Images Summary`);

    const min = {
        width: 10000,
        height: 10000
    };
    const max = {
        width: 0,
        height: 0
    };

    const sizes = [200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100];
    const countsAbove = {};
    sizes.forEach(size => {
        countsAbove[size] = 0;
    });

    tensors.forEach((tensor, i) => {
        const width = tensor.shape[1];
        const height = tensor.shape[0];

        if (width < min.width) min.width = width;
        if (height < min.height) min.height = height;

        if (width > max.width) max.width = width;
        if (height > max.height) max.height = height;

        sizes.forEach(size => {
            if (width >= size && height >= size) countsAbove[size]++;
        });
    });

    tensors.forEach(t => t.dispose());

    console.log(`Min: ${min.width}x${min.height}`);
    console.log(`Max: ${max.width}x${max.height}`);
    console.log(`Mean: ${min.width + ((max.width - min.width) / 2)}x${min.height + ((max.height - min.height) / 2)}`);

    console.log(`% of images above each size:`);
    sizes.forEach((size, i) => {
        console.log(`${size}: ${((countsAbove[size] / tensors.length) * 100).toFixed(1)}%`);
    });

    console.timeEnd('Print Images Summary Duration');
    console.log('--------------------------------');
}

async function getImageTensorsFromDir(dir, startIndex, endIndex) {
    console.log('Reading filenames');
    const imageNames = await getImageNames(dir, startIndex, endIndex);
    console.log(`${imageNames.length} images found`);

    console.log('Reading image data into tensors');
    const tensors = await getImageTensors(dir, imageNames);
    console.log(`${tensors.length} tensors created`);

    return tensors;
}

async function getImageTensors(dir, imageNames) {
    const res = await Promise.allSettled(imageNames.map(imageName => getImageTensor(path.join(dir, imageName))));
    return res.map(obj => obj.value).filter(value => value);
}

async function getImageTensor(path) {
    return new Promise((res, rej) => {
        fs.readFile(path, (err, imageBuffer) => {

            if (err) return rej(err);

            try {
                const imageTensor = tfn.node.decodeJpeg(imageBuffer, 3);
                // console.log(`Decoded: ${path}`);
                return res(imageTensor);
            } catch (err) {
                return rej(err);
            }
        });
    });
}

async function getImageCount(dir) {
    const imageNames = await getImageNames(dir);
    return imageNames.length;
}

async function getImageNames(dir, startIndex, endIndex) {
    const res = await new Promise((res, rej) => {
        fs.readdir(dir, (err, imageNames) => {

            if (err) return rej(err);

            return res(imageNames);
        });
    });

    return res.slice(startIndex, endIndex);
}

module.exports = {
    loadImages,
    printImagesSummary,
    saveTensorAsImages,
    getImageCount,
    loadImage
};