const tf = require('@tensorflow/tfjs');
const tfn = require('@tensorflow/tfjs-node');

function getLeNet5Model(inputShape) {
    const model = tf.sequential();

    model.add(tf.layers.conv2d({
        filters: 6,
        kernelSize: 5,
        strides: 1,
        activation: 'relu',
        inputShape,
        dtype: 'float32',
        kernelInitializer: 'varianceScaling'
    }));

    model.add(tf.layers.averagePooling2d({
        poolSize: 2
    }));

    model.add(tf.layers.conv2d({
        filters: 16,
        kernelSize: 5,
        strides: 1,
        activation: 'relu',
        kernelInitializer: 'varianceScaling'
    }));

    model.add(tf.layers.averagePooling2d({
        poolSize: 2
    }));

    model.add(tf.layers.flatten());

    model.add(tf.layers.dense({
        units: 120,
        activation: 'relu',
        kernelInitializer: 'varianceScaling'
    }));

    model.add(tf.layers.dropout({ rate: 0.5 }));

    model.add(tf.layers.dense({
        units: 84,
        activation: 'relu',
        kernelInitializer: 'varianceScaling'
    }));

    model.add(tf.layers.dropout({ rate: 0.5 }));

    model.add(tf.layers.dense({
        units: 2,
        activation: 'softmax',
        kernelInitializer: 'varianceScaling'
    }));

    return model;
}

module.exports = getLeNet5Model;