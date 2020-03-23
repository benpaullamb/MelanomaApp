const tf = require('@tensorflow/tfjs');
const tfn = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');
const { loadImages, testDataAug } = require('./imageIO');
const { printImagesSummary, getImageCount } = require('./imageSummary');
const getLeNet5Model = require('./Models/LeNet5Model');
const getAlexNetModel = require('./Models/AlexNetModel');
const evaluateModel = require('./evaluation');

const modelConfig = {
    dataAPath: path.join(__dirname, './Datasets/ISIC/Melanoma'),
    dataBPath: path.join(__dirname, './Datasets/ISIC/Nevus'),
    name: 'model',
    saveDir: 'file://./TensorFlow/Trained Models/isic',
    trainResPath: './Trained Models/isic/train-res',
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

async function getTrainingBatch(cat1Dir, cat2Dir, startIndex, endIndex, augment = true) {
    const cat1Tensor = await loadImages(cat1Dir, hyperparams.imageSize, startIndex, endIndex, augment);
    const cat2Tensor = await loadImages(cat2Dir, hyperparams.imageSize, startIndex, endIndex, augment);

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

function save(object, filePath) {
    let prevSave = {
        results: []
    };

    try {
        const prevArrJson = fs.readFileSync(filePath, 'utf8');
        prevSave = JSON.parse(prevArrJson);
    } catch (err) {
    }

    prevSave.results.push(object);

    fs.writeFileSync(filePath, JSON.stringify(prevSave));
}

function compileModel(model) {
    model.compile({
        loss: hyperparams.loss,
        optimizer: hyperparams.optimizer,
        metrics: ['accuracy']
    });
}

// async function init() {
//     console.log('Saving default model');
//     const model = getAlexNetModel([hyperparams.imageSize, hyperparams.imageSize, 3]);
//     compileModel(model);
//     await model.save(modelConfig.saveDir);
// }

async function testModel() {
    console.log(`Evaluating model`);

    const model = await tf.loadLayersModel(`${modelConfig.saveDir}/${modelConfig.name}.json`);
    compileModel(model);

    const startIndex = 1500;
    const batchSizePerClass = 50;
    const totalTestSize = 400;

    let accuracies = [];
    let losses = [];

    for (let j = startIndex; j < startIndex + totalTestSize; j += batchSizePerClass) {
        console.log(`Evaluating images ${j} to ${j + batchSizePerClass}`);

        const { xs, ys } = await getTrainingBatch(modelConfig.dataAPath, modelConfig.dataBPath, j, j + batchSizePerClass, false);

        const metrics = model.evaluate(xs, ys, { batchSize: 32 });
        losses.push(metrics[0].dataSync()[0]);
        accuracies.push(metrics[1].dataSync()[0]);
        metrics.forEach(t => t.dispose());

        let trueLabels = tf.split(ys, ys.shape[0]);
        trueLabels = trueLabels.map(y => {
            const intY = y.dataSync().map(prob => Math.round(prob));
            y.dispose();
            return intY[0] === 1 ? 'Melanoma' : 'Nevus';
        });

        const images = tf.split(xs, xs.shape[0]);
        images.forEach((image, i) => {
            const predictionTensor = model.predict(image);
            image.dispose();
            const probabilities = predictionTensor.dataSync();
            predictionTensor.dispose();

            save({
                trueLabel: trueLabels[i],
                probabilities: [probabilities['0'], probabilities['1']]
            }, './TensorFlow/eval.json');
        });

        xs.dispose();
        ys.dispose();
    }

    const accuracy = avg(accuracies);
    const loss = avg(losses);

    console.log(`Accuracy: ${toPercent(accuracy)}, Loss: ${toPercent(loss)}`);
}

function avg(arr) {
    let sum = 0;
    arr.forEach(el => sum += el);
    return sum / arr.length;
}

function toPercent(num) {
    return `${(num * 100).toFixed(1)}%`;
}

testModel();

// init();

// train();

// testDataAug();