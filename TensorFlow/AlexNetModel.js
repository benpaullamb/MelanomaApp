const tf = require('@tensorflow/tfjs');
const tfn = require('@tensorflow/tfjs-node');

function getAlexNetModel(inputShape) {
    const model = tf.sequential();

    model.add(tf.layers.conv2d({
        filters: 96,
        kernelSize: 11,
        strides: 4,
        activation: 'relu',
        inputShape,
        dtype: 'float32'
    }));

    model.add(tf.layers.maxPooling2d({
        poolSize: 3,
        strides: 2
    }));

    model.add(tf.layers.conv2d({
        filters: 256,
        kernelSize: 5,
        strides: 1,
        padding: 'same',
        activation: 'relu'
    }));

    model.add(tf.layers.maxPooling2d({
        poolSize: 3,
        strides: 2
    }));

    model.add(tf.layers.conv2d({
        filters: 384,
        kernelSize: 3,
        strides: 1,
        padding: 'same',
        activation: 'relu'
    }));

    model.add(tf.layers.conv2d({
        filters: 384,
        kernelSize: 3,
        strides: 1,
        padding: 'same',
        activation: 'relu'
    }));

    model.add(tf.layers.conv2d({
        filters: 256,
        kernelSize: 3,
        strides: 1,
        padding: 'same',
        activation: 'relu'
    }));

    model.add(tf.layers.maxPooling2d({
        poolSize: 3,
        strides: 2
    }));

    model.add(tf.layers.flatten());

    model.add(tf.layers.dense({
        units: 4096,
        activation: 'relu'
    }));

    model.add(tf.layers.dense({
        units: 4096,
        activation: 'relu'
    }));

    model.add(tf.layers.dense({
        units: 2,
        activation: 'softmax'
    }));

    model.compile({
        loss: 'categoricalCrossentropy',
        optimizer: 'sgd',
        metrics: ['accuracy']
    });

    return model;
}

module.exports = getAlexNetModel;