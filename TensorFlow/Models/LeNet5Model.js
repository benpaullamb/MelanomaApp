const tf = require('@tensorflow/tfjs');
const tfn = require('@tensorflow/tfjs-node');

// Wrapped in a function to allow for easy changing of the inputted image size
function getLeNet5Model(inputShape) {
    const model = tf.sequential();

    // Convolutional layer
    model.add(tf.layers.conv2d({
        filters: 6,
        kernelSize: 5,
        strides: 1,
        activation: 'relu',
        inputShape,
        dtype: 'float32',
        kernelInitializer: 'varianceScaling',
        kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
    }));

    // Pooling layer
    model.add(tf.layers.averagePooling2d({
        poolSize: 2
    }));

    // Convolutional layer
    model.add(tf.layers.conv2d({
        filters: 16,
        kernelSize: 5,
        strides: 1,
        activation: 'relu',
        kernelInitializer: 'varianceScaling',
        kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
    }));

    // Pooling layer
    model.add(tf.layers.averagePooling2d({
        poolSize: 2
    }));

    // Flatterning
    model.add(tf.layers.flatten());

    // Fully connected layer
    model.add(tf.layers.dense({
        units: 120,
        activation: 'relu',
        kernelInitializer: 'varianceScaling',
        kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
    }));

    // Dropout
    model.add(tf.layers.dropout({ rate: 0.5 }));

    // Fully connected layer
    model.add(tf.layers.dense({
        units: 84,
        activation: 'relu',
        kernelInitializer: 'varianceScaling',
        kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
    }));

    // Dropout
    model.add(tf.layers.dropout({ rate: 0.5 }));

    // Fully connected layer
    model.add(tf.layers.dense({
        units: 2,
        activation: 'softmax',
        kernelInitializer: 'varianceScaling'
    }));

    return model;
}

module.exports = getLeNet5Model;