const tf = require('@tensorflow/tfjs');
const tfn = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');
const { loadImages, printImagesSummary, getImageCount, loadImage, testDataAug } = require('./imageIO');
const getLeNet5Model = require('./LeNet5Model');
const getAlexNetModel = require('./AlexNetModel');

async function train() {
    console.time('Model Training Duration');
    // Load the model
    const model = await tf.loadLayersModel('file://./TensorFlow/saved-model/model.json');
    compileModel(model);

    const cat1Dir = path.join(__dirname, './MED-NODE-Dataset/Melanoma');
    const cat2Dir = path.join(__dirname, './MED-NODE-Dataset/Naevus');

    const cat1Count = await getImageCount(cat1Dir);
    const cat2Count = await getImageCount(cat2Dir);
    const maxImageCount = Math.min(cat1Count, cat2Count);
    const epochImageCount = 10;
    let iteration = 1;

    // Until there are no more images left
    for (let i = 0; i < maxImageCount; i += epochImageCount) {
        console.log(`\nIteration ${iteration}`);
        iteration++;
        // Get the next batch of images
        const { xs, ys } = await getTrainingBatch(cat1Dir, cat2Dir, i, i + (epochImageCount / 2));

        // Train the model
        const trainingResults = await model.fit(xs, ys, {
            shuffle: true,
            epochs: 10,
            batchSize: 20,
            validationSplit: 0.2
        });

        xs.dispose();
        ys.dispose();

        // Save the model
        await model.save('file://./TensorFlow/saved-model');
        saveTrainingResults(trainingResults.history);
    }

    console.timeEnd('Model Training Duration');
}

async function getTrainingBatch(cat1Dir, cat2Dir, startIndex, endIndex) {
    const imageSize = 400;
    const cat1Tensor = await loadImages(cat1Dir, imageSize, startIndex, endIndex);
    const cat2Tensor = await loadImages(cat2Dir, imageSize, startIndex, endIndex);

    const outputArray = [];
    for (let i = 0; i < cat1Tensor.shape[0]; ++i) {
        outputArray.push([1, 0]);
    }
    for (let i = 0; i < cat2Tensor.shape[0]; ++i) {
        outputArray.push([0, 1]);
    }

    xs = tf.concat([cat1Tensor, cat2Tensor]);
    cat1Tensor.dispose();
    cat2Tensor.dispose();
    ys = tf.tensor2d(outputArray);

    return {
        xs,
        ys
    };
}

function compileModel(model) {
    model.compile({
        loss: 'categoricalCrossentropy',
        optimizer: tf.train.adam(),
        metrics: ['accuracy']
    });
}

function saveTrainingResults(res) {
    console.log('Saving training results');

    const filePath = path.join(__dirname, 'saved-model/training-results.json');
    const prevResJson = fs.readFileSync(filePath, 'utf8');
    const prevRes = JSON.parse(prevResJson);

    prevRes.results.push({
        acc: avg(res.acc),
        loss: avg(res.loss),
        valAcc: avg(res.val_acc),
        valLoss: avg(res.val_loss)
    });

    fs.writeFileSync(filePath, JSON.stringify(prevRes));
}

function avg(arr) {
    const sum = arr.reduce((acc, cur) => acc + cur);
    return (sum / arr.length).toFixed(3);
}

async function init() {
    console.log('Saving default LeNet model');
    const model = getLeNet5Model([400, 400, 3]);
    compileModel(model);
    await model.save('file://./TensorFlow/saved-model');
}
// init();

async function test() {
    const image = await loadImage(path.join(__dirname, './CatsAndDogs/Dog/125.jpg'), 200);
    const model = await tf.loadLayersModel('file://./TensorFlow/saved-model/model.json');
    compileModel(model);
    console.log(getLabel(model.predict(image)));
}
// test();

function getLabel(prediction) {
    const dist = prediction.dataSync();
    return dist[0] > dist[1] ? 'Cat' : 'Dog';
}

train();

// testDataAug();