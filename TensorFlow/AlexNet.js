const tf = require('@tensorflow/tfjs');

const model = tf.sequential();

// Conv Layer 1
model.add(tf.layers.conv2d({
    inputShape: [224, 224, 3],
    filters: 96,
    kernelSize: [11, 11],
    strides: 4,
    activation: 'relu',
    batchSize: 128
}));

// Max Pooling Layer 1
model.add(tf.layers.maxPooling2d({
    poolSize: 2
}));

// Conv Layer 2
model.add(tf.layers.conv2d({
    filters: 256,
    kernelSize: [5, 5],
    strides: 4,
    activation: 'relu'
}));

// Max Pooling Layer 2
model.add(tf.layers.maxPooling2d({
    poolSize: 2
}));

// Conv Layer 3
model.add(tf.layers.conv2d({
    filters: 384,
    kernelSize: [3, 3],
    strides: 4,
    activation: 'relu'
}));

// Conv Layer 4
model.add(tf.layers.conv2d({
    filters: 384,
    kernelSize: [3, 3],
    strides: 4,
    activation: 'relu'
}));

// Conv Layer 5
model.add(tf.layers.conv2d({
    filters: 256,
    kernelSize: [3, 3],
    strides: 4,
    activation: 'relu'
}));

// Max Pooling Layer 3
model.add(tf.layers.maxPooling2d({
    poolSize: 2
}));

// Fully Connected Layer 1
model.add(tf.layers.dense({
    units: 4096,
    activation: 'relu'
}));

// Fully Connected Layer 2
model.add(tf.layers.dense({
    units: 4096,
    activation: 'relu'
}));

// Fully Connected Output Layer
model.add(tf.layers.dense({
    units: 2,
    activation: 'softmax'
}));

model.compile({
    optimizer: tf.train.sgd(0.01),
    loss: 'meanSquaredError'
});