const tf = require('@tensorflow/tfjs');
const tfn = require('@tensorflow/tfjs-node');
const fs = require('fs');

// Computes and displays metrics from the evaluation
(function evaluateSaved() {
    // Takes the results of the actual evaluation stored in JSON
    const evalResJSON = fs.readFileSync('./TensorFlow/eval.json', 'utf8');
    const evalRes = JSON.parse(evalResJSON);
    // Computes the metrics using a manually found threshold
    const metrics = computeMetrics(evalRes.results, 0.74763); // 0.74763
    // Displays them
    printMetrics(metrics);
})();

function printMetrics(metrics) {
    if (!metrics) return;
    console.log(`Threshold: ${metrics.threshold}`);

    console.log('\n\t| Melanoma\t|Nevus');
    console.log(`Predict+| ${metrics.counts.tp}\t\t|${metrics.counts.fp}`);
    console.log(`Predict-| ${metrics.counts.fn}\t\t|${metrics.counts.tn}\n`);

    console.log(`Sensitivity: ${toPercent(metrics.sensitivity)}, Specificity: ${toPercent(metrics.specificity)}`);
    console.log(`Precision: ${toPercent(metrics.precision)}, Recall: ${toPercent(metrics.recall)}`);
}

function computeMetrics(predictions, threshold = 0.75) {
    if (!predictions) return {};

    let tp = 0, tn = 0, fp = 0, fn = 0;

    // For each prediction
    predictions.forEach(prediction => {
        let label = 'Nevus';
        const melanomaChance = prediction.probabilities[0];
        const nevusChance = prediction.probabilities[1];
        // If it was more likely melanoma than benign AND that likelihood was greater than the threshold
        // Then categorise it as melanoma
        if (melanomaChance > nevusChance && melanomaChance >= threshold) label = 'Melanoma';

        // Compare this to the true label to get our true/false positive/negatives
        if (label === 'Melanoma' && prediction.trueLabel === 'Melanoma') tp++;
        if (label === 'Nevus' && prediction.trueLabel === 'Nevus') tn++;
        if (label === 'Nevus' && prediction.trueLabel === 'Melanoma') fn++;
        if (label === 'Melanoma' && prediction.trueLabel === 'Nevus') fp++;
    });

    const classCount = predictions.length / 2;
    // Sensitivity = (True +) / (Class +)
    const sensitivity = tp / classCount;
    // Specificity = (True -) / (Class -)
    const specificity = tn / classCount;

    // Precision = (True +) / ((True +) + (False +))
    const precision = tp / (tp + fp);
    // Recall = (True +) / ((True +) + (False -))
    const recall = tp / (tp + fn);

    return {
        sensitivity,
        specificity,
        precision,
        recall,
        // Keep the counts for the confusion matrix
        counts: {
            tp,
            tn,
            fp,
            fn
        },
        threshold
    };
}

// For printing a real number as a percentage to 1 dp
function toPercent(num) {
    return `${(num * 100).toFixed(1)}%`;
}