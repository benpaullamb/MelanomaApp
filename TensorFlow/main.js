const tf = require('@tensorflow/tfjs');
const tfn = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');
const { loadImages, printImagesSummary } = require('./imageIO');

async function start() {
    const imageDir = path.join(__dirname, './CatsAndDogs/Cat');
    printImagesSummary(imageDir, 10);

    // const tensor = await loadImages(imageDir, 10);
    // console.log(tensor.shape);
}
start();