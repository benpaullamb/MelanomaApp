const tf = require('@tensorflow/tfjs');
const tfn = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');
const augmentImages = require('./imageAugment');

// Returns a single tensor containing all the specified pre-processed images in the directory
// Handles discovering, loading, augmentation, resizing, batching, normalising
async function loadImages(dir, imageSize, startIndex, endIndex, augment = true) {
    console.time('Load Images Duration');
    console.log('--------------------------------');
    console.log(`Loading images from ${dir}`);

    // Discovering files
    console.log('Finding images');
    const imagePaths = await getImagePaths(dir, startIndex, endIndex);
    console.log(`${imagePaths.length} images found`);

    // Loading, augmenting, and converting to tensors
    console.log('Augmenting');
    const augmentedImages = await augmentImages(imagePaths, augment);
    console.log(`${augmentedImages.length} augmented images generated`);

    console.log(`Number of tensors in memory: ${tf.memory().numTensors}`);

    // Resizing images to all one size
    console.log('Resizing');
    const resizedImages = resizeImages(augmentedImages, imageSize);
    augmentedImages.forEach(t => t.dispose());

    console.log(`Number of tensors in memory: ${tf.memory().numTensors}`);

    // Batching into one tensor
    console.log('Batching');
    const batchedTensor = batchTensors(resizedImages);
    resizedImages.forEach(t => t.dispose());

    console.log(`Number of tensors in memory: ${tf.memory().numTensors}`);

    // Normalising pixel data for input into the CNN
    console.log('Normalising');
    const tensor = normaliseImages(batchedTensor);
    batchedTensor.dispose();

    console.log(tensor.shape);

    console.log(`Number of tensors in memory: ${tf.memory().numTensors}`);
    console.timeEnd('Load Images Duration');

    return tensor;
}

// Saves a tensor as an image
// Used for making sure the augmentation function works
function saveImages(tensor, dir) {
    tf.tidy(() => {
        // De-batches them into multiple 3D tensors (width, height, alpha)
        const imageTensors = tf.split(tensor, tensor.shape[0]);
        const imageTensors3d = imageTensors.map(image => tf.unstack(image)[0]);

        // For each image
        imageTensors3d.forEach(async (image, i) => {
            // Encode it as a jpeg image for the OS
            const jpeg = await tfn.node.encodeJpeg(image, 'rgb');
            // Write it to a file
            fs.writeFile(path.join(dir, `${i + 1}.jpg`), jpeg, err => {
                if (err) return console.log(err);
            });
        });
    });
}

// Converts pixel data to 0 - 1 by dividing each value by 255
function normaliseImages(tensor) {
    const scalar = tf.scalar(255);
    const normalised = tf.div(tensor, scalar);
    scalar.dispose();
    return normalised;
}

function batchTensors(tensors) {
    return tf.concat(tensors);
}

function resizeImages(tensors, size) {
    // These two values are used by the final TensorFlow resizing function
    const cropSize = [size, size];
    const boxInd = [0];

    // Turns the 3D tensors into 4D tensors, required for resizing
    const tensors4d = tensors.map(tensor => tf.expandDims(tensor));

    // For each image
    const resizedImages = tensors4d.map(image => {
        const width = image.shape[2];
        const height = image.shape[1];

        // Get the smaller side to the nearest 100 (for simplicity) inside the bounds
        // For finding the largest box that would fit into this image
        let croppedSize = 0;
        if (width < height) {
            croppedSize = Math.floor(width / 100) * 100;
        } else {
            croppedSize = Math.floor(height / 100) * 100;
        }

        // Determine the box's coordinates
        const y1 = (height / 2) - (croppedSize / 2);
        const x1 = (width / 2) - (croppedSize / 2);

        const y2 = (height / 2) + (croppedSize / 2);
        const x2 = (width / 2) + (croppedSize / 2);

        const boxes = [
            [y1 / height, x1 / width, y2 / height, x2 / width]
        ];

        // Crop and scale up/down if needed
        return tf.image.cropAndResize(image, boxes, boxInd, cropSize);
    });

    tensors4d.forEach(t => t.dispose());

    return resizedImages;
}

async function getImagePaths(dir, startIndex, endIndex) {
    const res = await new Promise((res, rej) => {
        fs.readdir(dir, (err, imageNames) => {

            if (err) return rej(err);

            // There's only a function for getting image names
            // So their path is appended to it before being returned
            const imagePaths = imageNames.map(imageName => {
                return path.join(dir, imageName);
            });

            return res(imagePaths);
        });
    });

    return res.slice(startIndex, endIndex);
}

// Tests the augmentation function by running a smaller version of the loadImages function
async function testDataAug() {
    console.log('Testing Data Augmentation');
    console.log('--------------------------------');

    console.log('Finding images');
    const imagePaths = await getImagePaths(path.join(__dirname, './Datasets/ISIC/Melanoma'), 0, 1);
    console.log(`${imagePaths.length} images found`);

    console.log('Augmenting');
    const augmentedTensors = await augmentImages(imagePaths);
    console.log(`${augmentedTensors.length} augmented images generated`);

    console.log('Resizing');
    const resizedImages = await resizeImages(augmentedTensors, 500);
    augmentedTensors.forEach(t => t.dispose());

    console.log('Batching');
    const tensor = batchTensors(resizedImages);
    resizedImages.forEach(t => t.dispose());

    const savePath = path.join(__dirname, './Datasets/Test Images');
    console.log(`Saving to ${savePath}`);
    saveImages(tensor, savePath);
}

module.exports = {
    loadImages,
    getImagePaths,
    testDataAug
};