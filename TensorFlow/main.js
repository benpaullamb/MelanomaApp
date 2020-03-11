const tf = require('@tensorflow/tfjs');
const tfn = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');
const { loadImages, testDataAug } = require('./imageIO');
const { printImagesSummary, getImageCount } = require('./imageSummary');
const getLeNet5Model = require('./Models/LeNet5Model');
const getAlexNetModel = require('./Models/AlexNetModel');

const modelConfig = {
    dataAPath: path.join(__dirname, './Datasets/ISIC/Melanoma'),
    dataBPath: path.join(__dirname, './Datasets/ISIC/Nevus'),
    name: 'model',
    saveDir: 'file://./TensorFlow/Trained Models/isic-alexnet',
    trainResPath: './Trained Models/isic-alexnet/train-res',
    continueFromImageNum: 0
};

const hyperparams = {
    imageSize: 500,
    originalImagesPerBatch: 20,
    epochsPerBatch: 10,
    modelBatchSize: 32,
    validationSplit: 0.2,
    loss: 'categoricalCrossentropy',
    optimizer: tf.train.adam()
};

async function train() {
    console.time('Model Training Duration');
    // Load the model
    const model = await tf.loadLayersModel(`${modelConfig.saveDir}/${modelConfig.name}.json`);
    compileModel(model);

    const cat1Count = await getImageCount(modelConfig.dataAPath);
    const cat2Count = await getImageCount(modelConfig.dataBPath);
    const maxImageCount = Math.min(cat1Count, cat2Count);
    let iteration = 1;

    // Until there are no more images left
    for (let i = modelConfig.continueFromImageNum; i < maxImageCount; i += (hyperparams.originalImagesPerBatch / 2)) {
        console.log(`\nIteration ${iteration}`);
        iteration++;
        // Get the next batch of images
        const { xs, ys } = await getTrainingBatch(modelConfig.dataAPath, modelConfig.dataBPath, i, i + (hyperparams.originalImagesPerBatch / 2));

        // Train the model
        const trainingResults = await model.fit(xs, ys, {
            shuffle: true,
            epochs: hyperparams.epochsPerBatch,
            batchSize: hyperparams.modelBatchSize,
            validationSplit: hyperparams.validationSplit
        });

        xs.dispose();
        ys.dispose();

        // Save the model
        await model.save(modelConfig.saveDir);

        const filePath = path.join(__dirname, `${modelConfig.trainResPath}.json`);
        saveTrainingResults(trainingResults.history, filePath);
    }

    console.timeEnd('Model Training Duration');
}

async function getTrainingBatch(cat1Dir, cat2Dir, startIndex, endIndex) {
    const cat1Tensor = await loadImages(cat1Dir, hyperparams.imageSize, startIndex, endIndex);
    const cat2Tensor = await loadImages(cat2Dir, hyperparams.imageSize, startIndex, endIndex);

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

function avg(arr) {
    const sum = arr.reduce((acc, cur) => acc + cur);
    return (sum / arr.length).toFixed(3);
}

function saveTrainingResults(res, filePath) {
    console.log('Saving training results');

    let prevRes = {
        results: []
    };

    try {
        const prevResJson = fs.readFileSync(filePath, 'utf8');
        prevRes = JSON.parse(prevResJson);
    } catch (err) {
    }

    prevRes.results.push({
        acc: avg(res.acc),
        loss: avg(res.loss),
        valAcc: avg(res.val_acc),
        valLoss: avg(res.val_loss)
    });

    fs.writeFileSync(filePath, JSON.stringify(prevRes));
}

function getLabel(prediction) {
    const dist = prediction.dataSync();
    return dist[0] > dist[1] ? 'Cat' : 'Dog';
}

function compileModel(model) {
    model.compile({
        loss: hyperparams.loss,
        optimizer: hyperparams.optimizer,
        metrics: ['accuracy']
    });
}

async function init() {
    console.log('Saving default model');
    const model = getAlexNetModel([hyperparams.imageSize, hyperparams.imageSize, 3]);
    compileModel(model);
    await model.save(modelConfig.saveDir);
}
// init();

// train();

// testDataAug();

printImagesSummary('./TensorFlow/Datasets/ISIC/Melanoma', 0, 200);