const tf = require('@tensorflow/tfjs');
const tfn = require('@tensorflow/tfjs-node');
const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

async function loadImages(dir, imageSize, startIndex, endIndex) {
    console.time('Load Images Duration');
    console.log('--------------------------------');
    console.log(`Loading images from ${dir}`);

    // const imageTensors = await getImageTensorsFromDir(dir, startIndex, endIndex);
    const imageNames = await getImageNames(dir, startIndex, endIndex);
    const imagePaths = imageNames.map(name => path.join(dir, name));
    console.log('Augmenting images');
    const jimpImages = await augmentImages(imagePaths);

    console.log('Converting images into tensors');
    const imageTensors = await Promise.all(jimpImages.map(async ji => {
        const buffer = await ji.getBufferAsync(Jimp.MIME_JPEG);
        return tfn.node.decodeJpeg(buffer, 3);
    }));

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

async function testDataAug() {
    const imageNames = await getImageNames(path.join(__dirname, './MED-NODE-Dataset/Melanoma'), 0, 2);
    const imagePaths = imageNames.map(name => path.join(__dirname, './MED-NODE-Dataset/Melanoma', name));
    const jimpImages = await augmentImages(imagePaths);

    const imageTensors = await Promise.all(jimpImages.map(async ji => {
        const buffer = await ji.getBufferAsync(Jimp.MIME_JPEG);
        return tfn.node.decodeJpeg(buffer, 3);
    }));

    const resizedImages = await resizeImages(imageTensors, 200);

    const tensor = batchTensors(resizedImages);
    saveTensorAsImages(tensor, path.join(__dirname, './test'));
}

async function augmentImages(imagePaths) {
    if (!imagePaths) return;

    try {
        const images2d = await Promise.all(imagePaths.map(async imagePath => {
            const origImage = await Jimp.read(imagePath);
            const augImages = [origImage];
            for (let i = 0; i < 10; ++i) {
                let image = origImage.clone();

                const rotation = (Math.random() * 90) - 45; // -45 to 45
                const brightness = Math.random() - 0.5; // -0.5 to 0.5
                const blur = Math.ceil(Math.random() * 3); // 1, 2, 3

                const crop = {
                    x: 0,
                    y: 0,
                    width: image.bitmap.width,
                    height: image.bitmap.height
                };
                if (Math.random() > 0.5) {
                    crop.x += Math.round(Math.random() * crop.width * 0.2);
                    crop.width -= crop.x;
                }
                if (Math.random() > 0.5) {
                    crop.y += Math.round(Math.random() * crop.height * 0.2);
                    crop.height -= crop.y;
                }
                if (Math.random() > 0.5) crop.width -= Math.round(Math.random() * crop.width * 0.2);
                if (Math.random() > 0.5) crop.height -= Math.round(Math.random() * crop.height * 0.2);

                if (Math.random() > 0.3) image.crop(crop.x, crop.y, crop.width, crop.height);
                if (Math.random() > 0.3) image.flip(Math.random() > 0.5, Math.random() > 0.5);
                if (Math.random() > 0.3) image.rotate(rotation, false);
                if (Math.random() > 0.3) image.brightness(brightness);
                if (Math.random() > 0.3) image.blur(blur);

                augImages.push(image);
            }

            return augImages;
        }));

        const flattenedImages = [];
        images2d.forEach(imageSet => {
            flattenedImages.push(...imageSet);
        });

        return flattenedImages;

    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    loadImages,
    printImagesSummary,
    saveTensorAsImages,
    getImageCount,
    loadImage,
    testDataAug
};