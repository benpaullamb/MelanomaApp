const tf = require('@tensorflow/tfjs');
const tfn = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');
const { loadImages, printImagesSummary } = require('./imageIO');
const getLeNet5Model = require('./LeNet5Model');
const getAlexNetModel = require('./AlexNetModel');

async function start() {
    // printImagesSummary(imageDir, 10);

    const model = getAlexNetModel([200, 200, 3]);

    const catsTensor = await loadImages(path.join(__dirname, './CatsAndDogs/Cat'), 200, 1000);
    const dogsTensor = await loadImages(path.join(__dirname, './CatsAndDogs/Dog'), 200, 1000);

    const outputArray = [];
    for (let i = 0; i < catsTensor.shape[0]; ++i) {
        outputArray.push([1, 0]);
    }
    for (let i = 0; i < dogsTensor.shape[0]; ++i) {
        outputArray.push([0, 1]);
    }

    xs = tf.concat([catsTensor, dogsTensor]);
    catsTensor.dispose();
    dogsTensor.dispose();
    ys = tf.tensor2d(outputArray);

    const res = await model.fit(xs, ys, {
        shuffle: true,
        epochs: 10,
        batchSize: 128,
        validationSplit: 0.1
    });
    console.log(res);
}
start();