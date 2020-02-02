const tf = require('@tensorflow/tfjs');
const tfn = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');

async function loadImages(dir) {
    console.log('Reading filenames');
    const imageNames = await getImageNames(dir);
    console.log(`${imageNames.length} images found`);

    console.log('Reading image data into tensors');
    const imageTensors = await getImageTensors(dir, imageNames);
    console.log(`${imageTensors.length} tensors created`);

    return imageTensors;
}

async function getImageNames(path) {
    return new Promise((res, rej) => {
        fs.readdir(path, (err, imageNames) => {

            if (err) return rej(err);

            return res(imageNames);
        });
    });
}

async function getImageTensors(dir, imageNames) {
    return Promise.all(imageNames.map(imageName => getImageTensor(path.join(dir, imageName))));
}

async function getImageTensor(path) {
    return new Promise((res, rej) => {
        fs.readFile(path, (err, imageBuffer) => {

            if (err) return rej(err);

            const imageTensor = tfn.node.decodeJpeg(imageBuffer, 3);
            return res(imageTensor);
        });
    });
}

module.exports = loadImages;