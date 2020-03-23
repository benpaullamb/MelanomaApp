const tf = require('@tensorflow/tfjs');
const tfn = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');
const { loadImages, testDataAug } = require('./imageIO');
const { printImagesSummary, getImageCount } = require('./imageSummary');
const getLeNet5Model = require('./Models/LeNet5Model');
const getAlexNetModel = require('./Models/AlexNetModel');
const evaluateModel = require('./evaluation');

// File saving configuration
const modelConfig = {
    dataAPath: path.join(__dirname, './Datasets/ISIC/Melanoma'),
    dataBPath: path.join(__dirname, './Datasets/ISIC/Nevus'),
    name: 'model',
    saveDir: 'file://./TensorFlow/Trained Models/isic',
    trainResPath: './Trained Models/isic/train-res',
    continueFromImageNum: 0
};

// Model training hyperparameters
const hyperparams = {
    imageSize: 500,
    originalImagesPerBatch: 20,
    epochsPerBatch: 10,
    modelBatchSize: 32,
    validationSplit: 0.2,
    loss: 'categoricalCrossentropy',
    optimizer: tf.train.adam()
};

// The main training function
async function train() {
    console.time('Model Training Duration');
    // Load the model
    const model = await tf.loadLayersModel(`${modelConfig.saveDir}/${modelConfig.name}.json`);
    compileModel(model);

    // Get an even number of images from both positive/negative image categories
    const cat1Count = await getImageCount(modelConfig.dataAPath);
    const cat2Count = await getImageCount(modelConfig.dataBPath);
    // If we have more of one than the other, use the smaller number
    // So that the model doesn't overtrain on one category
    const maxImageCount = Math.min(cat1Count, cat2Count);
    let iteration = 1;

    // Until there are no more images left
    // Only increase by half a batch as one batch is made up of half of each category
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
        // Save training information
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

    // Attempt to load previous results if they exist
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

// Model needs to be compiled after loading
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

// Does the actual evaluating of the model
async function testModel() {
    console.log(`Evaluating model`);

    // Loads the model
    const model = await tf.loadLayersModel(`${modelConfig.saveDir}/${modelConfig.name}.json`);
    compileModel(model);

    // Declare the images to evaluate on
    // Images past about 1100 have not been seen by the model
    const startIndex = 1500;
    const batchSizePerClass = 50;
    const totalTestSize = 400;

    let accuracies = [];
    let losses = [];

    // For each batch
    for (let j = startIndex; j < startIndex + totalTestSize; j += batchSizePerClass) {
        console.log(`Evaluating images ${j} to ${j + batchSizePerClass}`);
        // Load the images without augmentation
        const { xs, ys } = await getTrainingBatch(modelConfig.dataAPath, modelConfig.dataBPath, j, j + batchSizePerClass, false);

        // Use TensorFlows evaluate method to get the accuracy and loss
        const metrics = model.evaluate(xs, ys, { batchSize: 32 });
        losses.push(metrics[0].dataSync()[0]);
        accuracies.push(metrics[1].dataSync()[0]);
        metrics.forEach(t => t.dispose());

        // Convert the true labels tensor into an array of words
        let trueLabels = tf.split(ys, ys.shape[0]);
        trueLabels = trueLabels.map(y => {
            const intY = y.dataSync().map(prob => Math.round(prob));
            y.dispose();
            return intY[0] === 1 ? 'Melanoma' : 'Nevus';
        });

        const images = tf.split(xs, xs.shape[0]);
        // For each image
        images.forEach((image, i) => {
            // Run it through the model and get a prediction
            const predictionTensor = model.predict(image);
            image.dispose();
            const probabilities = predictionTensor.dataSync();
            predictionTensor.dispose();

            // Save the true label and the probabilities of each category from the prediction
            // Separates the metrics calculations and the length evaluation process
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

// function avg(arr) {
//     let sum = 0;
//     arr.forEach(el => sum += el);
//     return sum / arr.length;
// }

function toPercent(num) {
    return `${(num * 100).toFixed(1)}%`;
}

testModel();

// init();

// train();

// testDataAug();