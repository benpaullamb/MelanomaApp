const tf = require('@tensorflow/tfjs');
const tfn = require('@tensorflow/tfjs-node');
const fs = require('fs');
const { getImagePaths } = require('./imageIO');

async function printImagesSummary(dir, startIndex, endIndex) {
    const tensors = await getImageDirTensors(dir, startIndex, endIndex);

    console.log(`Images Summary`);
    console.log('--------------------------------');

    const min = {
        width: 10000,
        height: 10000
    };
    const max = {
        width: 0,
        height: 0
    };

    const sizes = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
    const countsAbove = {};
    sizes.forEach(size => {
        countsAbove[size] = 0;
    });

    tensors.forEach(tensor => {
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
    sizes.forEach(size => {
        console.log(`${size}: ${((countsAbove[size] / tensors.length) * 100).toFixed(1)}%`);
    });
}

async function getImageDirTensors(dir, startIndex, endIndex) {
    console.log('Finding images');
    const imagePaths = await getImagePaths(dir, startIndex, endIndex);
    console.log(`${imagePaths.length} images found`);

    console.log('Converting images into tensors');
    const tensors = await getImageTensors(imagePaths);
    console.log(`${tensors.length} tensors created`);

    return tensors;
}

async function getImageTensors(imagePaths) {
    const res = await Promise.allSettled(imagePaths.map(imagePath => getImageTensor(imagePath)));
    return res.map(obj => obj.value).filter(value => value);
}

async function getImageTensor(path) {
    return new Promise((res, rej) => {
        fs.readFile(path, (err, imageBuffer) => {

            if (err) return rej(err);

            try {
                const imageTensor = tfn.node.decodeJpeg(imageBuffer, 3);

                return res(imageTensor);
            } catch (err) {
                return rej(err);
            }
        });
    });
}

async function getImageCount(dir) {
    const imagePaths = await getImagePaths(dir);
    return imagePaths.length;
}

module.exports = {
    printImagesSummary,
    getImageCount
};