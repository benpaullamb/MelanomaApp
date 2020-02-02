const tf = require('@tensorflow/tfjs');
const tfn = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');
const loadImages = require('./imageIO');

// LeNet-5 architecture
const model = tf.sequential();

model.add(tf.layers.conv2d({
    filters: 6,
    kernelSize: 5,
    stride: 1,
    inputShape: [962, 888, 3],
    batchSize: 1
}));

model.add(tf.layers.averagePooling2d({
    poolSize: 2,
    strides: 2
}));

model.add(tf.layers.conv2d({
    filters: 16,
    kernelSize: 5,
    stride: 1
}));

model.add(tf.layers.averagePooling2d({
    poolSize: 2,
    strides: 2
}));

model.add(tf.layers.flatten());

model.add(tf.layers.dense({
    units: 84
}));

model.add(tf.layers.dense({
    units: 2,
    activation: 'softmax'
}));

const optimizer = tf.train.sgd(0.01);

model.compile({
    optimizer,
    loss: 'meanSquaredError'
});

async function start() {
    const tensors = await loadImages(path.join(__dirname, './MED-NODE-Dataset/Melanoma'));
    // console.log(tensors[0]);

    // const ys = tf.tensor([0]);

    // model.fit(tensors[0], ys);
}
start();