const tf = require('@tensorflow/tfjs');
const tfn = require('@tensorflow/tfjs-node');
const fs = require('fs');
const { getImagePaths } = require('./imageIO');

// Prints a summary of the sizes of the images in the given directory
async function printImagesSummary(dir, startIndex, endIndex) {
    // Gets the images from the directory (as tensors)
    const tensors = await getImageDirTensors(dir, startIndex, endIndex);

    console.log(`Images Summary`);
    console.log('--------------------------------');

    // Starts min off at a large number so that even a large image will be smaller
    // To avoid missing any images
    const min = {
        width: 10000,
        height: 10000
    };
    // Starts max off at 0 so that even a small image will be bigger
    // To avoid missing any images
    const max = {
        width: 0,
        height: 0
    };

    // The list of sizes to be scanning for
    const sizes = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
    // Stores the counts as an object with a key for each size
    const countsAbove = {};
    sizes.forEach(size => {
        countsAbove[size] = 0;
    });

    // Go through each image (as a tensor)
    tensors.forEach(tensor => {
        const width = tensor.shape[1];
        const height = tensor.shape[0];

        // Update the min
        if (width < min.width) min.width = width;
        if (height < min.height) min.height = height;

        // Update the max
        if (width > max.width) max.width = width;
        if (height > max.height) max.height = height;

        // Update the individual sizes
        sizes.forEach(size => {
            if (width >= size && height >= size) countsAbove[size]++;
        });
    });

    // Get rid of tensors we're no longer using for memory purposes
    tensors.forEach(t => t.dispose());

    // Display the results
    console.log(`Min: ${min.width}x${min.height}`);
    console.log(`Max: ${max.width}x${max.height}`);
    // Mean based on min and max
    console.log(`Mean: ${min.width + ((max.width - min.width) / 2)}x${min.height + ((max.height - min.height) / 2)}`);

    console.log(`% of images above each size:`);
    sizes.forEach(size => {
        console.log(`${size}: ${((countsAbove[size] / tensors.length) * 100).toFixed(1)}%`);
    });
}

// Loads all the images in a directory into tensors
async function getImageDirTensors(dir, startIndex, endIndex) {
    console.log('Finding images');
    // First gets a list of file paths
    const imagePaths = await getImagePaths(dir, startIndex, endIndex);
    console.log(`${imagePaths.length} images found`);

    console.log('Converting images into tensors');
    // Next loads them into tensors
    const tensors = await getImageTensors(imagePaths);
    console.log(`${tensors.length} tensors created`);

    return tensors;
}

// Loading multiple images given a list of paths
async function getImageTensors(imagePaths) {
    const res = await Promise.allSettled(imagePaths.map(imagePath => getImageTensor(imagePath)));
    // Improve object formatting and only keep ones we managed to load
    return res.map(obj => obj.value).filter(value => value);
}

// Can only read and decode one image at a time into a tensor
async function getImageTensor(path) {
    // Wrapping the callback code in a promise allows us to use async await syntax
    return new Promise((res, rej) => {
        fs.readFile(path, (err, imageBuffer) => {

            if (err) return rej(err);

            try {
                // Convert into a tensor - we don't need it in any other format
                // So might as well do it straight away
                const imageTensor = tfn.node.decodeJpeg(imageBuffer, 3);

                return res(imageTensor);
            } catch (err) {
                return rej(err);
            }
        });
    });
}

// Counts the number of images in a directory
async function getImageCount(dir) {
    const imagePaths = await getImagePaths(dir);
    return imagePaths.length;
}

module.exports = {
    printImagesSummary,
    getImageCount
};