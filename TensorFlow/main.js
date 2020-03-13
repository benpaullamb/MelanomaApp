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

// async function init() {
//     console.log('Saving default model');
//     const model = getAlexNetModel([hyperparams.imageSize, hyperparams.imageSize, 3]);
//     compileModel(model);
//     await model.save(modelConfig.saveDir);
// }

// Results on 800 images (400/class - 1500-1900)
// Accuracy: 67.6%, Loss: 59.0%

// Threshold: 0.5
//         | Melanoma      |Nevus
// Predict+| 382           |241
// Predict-| 18            |159
// Sensitivity: 96.0%, Specificity: 39.75%
// Precision: 61.3%, Recall: 95.5%

// Threshold: 0.625
//         | Melanoma      |Nevus
// Predict+| 373           |237
// Predict-| 27            |163

// Sensitivity: 93.3%, Specificity: 40.8%
// Precision: 61.1%, Recall: 93.3%

// Threshold: 0.7


// Threshold: 0.75
//         | Melanoma      |Nevus
// Predict+| 277           |72
// Predict-| 123           |328
// Sensitivity: 69.3%, Specificity: 82.0%
// Precision: 79.4%, Recall: 69.3%

async function evalModel() {
    console.log(`Evaluating model`);

    const model = await tf.loadLayersModel(`${modelConfig.saveDir}/${modelConfig.name}.json`);
    compileModel(model);

    const startInd = 1500;
    const classCount = 50;
    const maxTesting = 400;
    const threshold = 0.7;

    let accuracies = [];
    let losses = [];
    let tp = 0, tn = 0, fp = 0, fn = 0;

    for (let j = startInd; j < startInd + maxTesting; j += classCount) {
        console.log(`Evaluating images ${j} to ${j + classCount}`);

        const { xs, ys } = await getTrainingBatch(modelConfig.dataAPath, modelConfig.dataBPath, j, j + classCount, false);

        const metrics = model.evaluate(xs, ys, { batchSize: 32 });
        losses.push(metrics[0].dataSync()[0]);
        accuracies.push(metrics[1].dataSync()[0]);

        metrics.forEach(t => t.dispose());

        const images = tf.split(xs, xs.shape[0]);

        let trueLabels = tf.split(ys, ys.shape[0]);
        trueLabels = trueLabels.map(y => {
            const intY = y.dataSync().map(prob => Math.round(prob));

            y.dispose();

            return intY[0] === 1 ? 'Melanoma' : 'Nevus';
        });

        images.forEach((image, i) => {
            const predictionTensor = model.predict(image);
            const prediction = predictionTensor.dataSync().map(prob => prob > threshold ? 1 : 0);
            const label = prediction[0] === 1 ? 'Melanoma' : 'Nevus';

            predictionTensor.dispose();
            image.dispose();

            if (label === 'Melanoma' && trueLabels[i] === 'Melanoma') tp++;
            if (label === 'Nevus' && trueLabels[i] === 'Nevus') tn++;
            if (label === 'Nevus' && trueLabels[i] === 'Melanoma') fn++;
            if (label === 'Melanoma' && trueLabels[i] === 'Nevus') fp++;
        });

        xs.dispose();
        ys.dispose();
    }

    const accuracy = avg(accuracies);
    const loss = avg(losses);

    console.log('================================');
    console.log(`Accuracy: ${toPerc(accuracy)}, Loss: ${toPerc(loss)}`);

    console.log('\n\t| Melanoma\t|Nevus');
    console.log(`Predict+| ${tp}\t\t|${fp}`);
    console.log(`Predict-| ${fn}\t\t|${tn}\n`);

    // Sensitivity = (True +) / (Class +)
    const sensitivity = tp / maxTesting;
    // Specificity = (True -) / (Class -)
    const specificity = tn / maxTesting;
    console.log(`Sensitivity: ${toPerc(sensitivity)}, Specificity: ${toPerc(specificity)}`);

    // Precision = (True +) / ((True +) + (False +))
    const precision = tp / (tp + fp);
    // Recall = (True +) / ((True +) + (False -))
    const recall = tp / (tp + fn);
    console.log(`Precision: ${toPerc(precision)}, Recall: ${toPerc(recall)}`);
    console.log('================================');
}

function avg(arr) {
    let sum = 0;
    arr.forEach(el => sum += el);
    return sum / arr.length;
}

function toPerc(num) {
    return `${(num * 100).toFixed(1)}%`;
}

evalModel();

// init();

// train();

// testDataAug();