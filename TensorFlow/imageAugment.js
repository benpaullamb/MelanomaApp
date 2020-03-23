const Jimp = require('jimp');
const tf = require('@tensorflow/tfjs');
const tfn = require('@tensorflow/tfjs-node');

// All settings that we may want to change put at the top for easy access
let verbose = false;

const augmentRate = 10;
const augmentChance = 0.5;
const flipChance = 0.5;
const cropSideChance = 0.5;

const maxCrop = 0.2;
const maxRotation = 45;
const maxBrighten = 0.5;
const maxBlur = 3;

// Returns a list of images X times larger than the paths given
// Augment can be turned off to skip and just load into tensors
// Uses normal for loops to only do one image at a time for limited memory reasons
async function augmentImages(imagePaths, augment = true) {
    if (!imagePaths) return;

    try {
        const augmentedImages = [];

        // For each original image
        for (let i = 0; i < imagePaths.length; ++i) {
            // Load it
            const original = await Jimp.read(imagePaths[i]);

            // Keep a copy of the original
            augmentedImages.push(await jimpToTensor(original));

            if (!augment) continue;

            // For each number of augmentations to make
            for (let j = 0; j < (augmentRate - 1); ++j) {
                if (verbose) console.log(`${i + 1}: ${j + 1}`);
                // Make a copy so we don't change the original
                const image = original.clone();

                // Get random values to augment it by
                const crop = getRandomCrop(image, maxCrop, cropSideChance);
                // Doubled and subtracted by the max to centre it on 0
                // E.g. instead of 0 to 90, it'll be -45 to +45
                const rotation = (Math.random() * maxRotation * 2) - maxRotation;
                const brightness = (Math.random() * maxBrighten * 2) - maxBrighten;
                const blur = Math.ceil(Math.random() * maxBlur);

                // A random check for each augmentation
                if (Math.random() < augmentChance) image.crop(crop.x, crop.y, crop.width, crop.height);
                if (Math.random() < augmentChance) image.flip(Math.random() < flipChance, Math.random() < flipChance);
                if (Math.random() < augmentChance) image.rotate(rotation, false);
                if (Math.random() < augmentChance) image.brightness(brightness);
                if (Math.random() < augmentChance) image.blur(blur);

                // Save this new image
                augmentedImages.push(await jimpToTensor(image));
            }
        }

        return augmentedImages;
    } catch (err) {
        console.log(err);
    }

    return [];
}

// Used for each loops and async functions to do more than one conversion at a time

// async function augmentImages(imagePaths) {
//     if (!imagePaths) return;

//     try {
//         const jimpImages = await Promise.all(imagePaths.map(async imagePath => await Jimp.read(imagePath)));
//         const augmentedImages = [];

//         jimpImages.forEach((original, j) => {
//             console.log(`${j + 1}`);
//             augmentedImages.push(original);

//             for (let i = 0; i < (augmentRate - 1); ++i) {
//                 console.log(`${j + 1}: ${i + 1}`);
//                 const image = original.clone();

//                 const crop = getRandomCrop(image, maxCrop, cropSideChance);
//                 const rotation = (Math.random() * maxRotation * 2) - maxRotation;
//                 const brightness = (Math.random() * maxBrighten * 2) - maxBrighten;
//                 const blur = Math.ceil(Math.random() * maxBlur);

//                 if (Math.random() < augmentChance) image.crop(crop.x, crop.y, crop.width, crop.height);
//                 if (Math.random() < augmentChance) image.flip(Math.random() < flipChance, Math.random() < flipChance);
//                 if (Math.random() < augmentChance) image.rotate(rotation, false);
//                 if (Math.random() < augmentChance) image.brightness(brightness);
//                 if (Math.random() < augmentChance) image.blur(blur);

//                 augmentedImages.push(image);
//             }
//         });

//         return jimpsToTensors(augmentedImages);

//     } catch (err) {
//         console.log(err);
//     }
// }

// Returns an object with random values to be used when cropping this image
function getRandomCrop(image) {
    if (!image) return {};

    // The return format
    const crop = {
        x: 0,
        y: 0,
        width: image.bitmap.width,
        height: image.bitmap.height
    };

    // A random check for each side
    if (Math.random() < cropSideChance) {
        // Adds a percentage of the width to the X, scaled by maxCrop and rounded to an integer
        crop.x += Math.round(Math.random() * crop.width * maxCrop);
        // Reduce the width by the same amount to stay within the bounds of the image
        crop.width -= crop.x;
    }
    if (Math.random() < cropSideChance) {
        crop.y += Math.round(Math.random() * crop.height * maxCrop);
        crop.height -= crop.y;
    }
    if (Math.random() < cropSideChance) crop.width -= Math.round(Math.random() * crop.width * maxCrop);
    if (Math.random() < cropSideChance) crop.height -= Math.round(Math.random() * crop.height * maxCrop);

    return crop;
}

// Converts many images at once
async function jimpsToTensors(images) {
    return await Promise.all(images.map(async image => {
        const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);
        return tfn.node.decodeJpeg(buffer, 3);
    }));
}

// Converts a jimp loaded image into a tensor
async function jimpToTensor(jimp) {
    // First converts it to a buffer
    const buffer = await jimp.getBufferAsync(Jimp.MIME_JPEG);
    // Then decodes into a tensor
    const t = tfn.node.decodeJpeg(buffer, 3);
    if (verbose) console.log(t.shape);
    return t;
}

module.exports = augmentImages;