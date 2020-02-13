const tf = require('@tensorflow/tfjs');
const tfn = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');
const augmentImages = require('./imageAugment');

async function loadImages(dir, imageSize, startIndex, endIndex) {
    console.time('Load Images Duration');
    console.log('--------------------------------');
    console.log(`Loading images from ${dir}`);

    console.log('Finding images');
    const imagePaths = await getImagePaths(dir, startIndex, endIndex);
    console.log(`${imagePaths.length} images found`);

    console.log('Augmenting');
    const augmentedImages = await augmentImages(imagePaths);
    console.log(`${augmentedImages.length} augmented images generated`);

    console.log(`Number of tensors in memory: ${tf.memory().numTensors}`);

    console.log('Resizing');
    const resizedImages = resizeImages(augmentedImages, imageSize);
    augmentedImages.forEach(t => t.dispose());

    console.log(`Number of tensors in memory: ${tf.memory().numTensors}`);

    console.log('Batching');
    const batchedTensor = batchTensors(resizedImages);
    resizedImages.forEach(t => t.dispose());

    console.log(`Number of tensors in memory: ${tf.memory().numTensors}`);

    console.log('Normalising');
    const tensor = normaliseImages(batchedTensor);
    batchedTensor.dispose();

    console.log(tensor.shape);

    console.log(`Number of tensors in memory: ${tf.memory().numTensors}`);
    console.timeEnd('Load Images Duration');

    return tensor;
}

function saveImages(tensor, dir) {
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

    const tensors4d = tensors.map(tensor => tf.expandDims(tensor));

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

async function getImagePaths(dir, startIndex, endIndex) {
    const res = await new Promise((res, rej) => {
        fs.readdir(dir, (err, imageNames) => {

            if (err) return rej(err);

            const imagePaths = imageNames.map(imageName => {
                return path.join(dir, imageName);
            });

            return res(imagePaths);
        });
    });

    return res.slice(startIndex, endIndex);
}

async function testDataAug() {
    console.log('Testing Data Augmentation');
    console.log('--------------------------------');

    console.log('Finding images');
    const imagePaths = await getImagePaths(path.join(__dirname, './MED-NODE-Dataset/Melanoma'), 0, 2);
    console.log(`${imagePaths.length} images found`);

    console.log('Augmenting');
    const augmentedTensors = await augmentImages(imagePaths);
    console.log(`${augmentedTensors.length} augmented images generated`);

    console.log('Resizing');
    const resizedImages = await resizeImages(augmentedTensors, 400);
    augmentedTensors.forEach(t => t.dispose());

    console.log('Batching');
    const tensor = batchTensors(resizedImages);
    resizedImages.forEach(t => t.dispose());

    const savePath = path.join(__dirname, './MED-NODE-Dataset/augment-test');
    console.log(`Saving to ${savePath}`);
    saveImages(tensor, savePath);
}

module.exports = {
    loadImages,
    getImagePaths,
    testDataAug
};