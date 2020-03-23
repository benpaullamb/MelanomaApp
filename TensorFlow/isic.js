const fs = require('fs');
const csvParse = require('csv-parse');

// Automatically runs this function when the file is executed
// Used to extract all melanoma images and an equal number of benign images
// From the ISIC Archive into a separate folder for ease of use
(async function () {
    // const imageNames = await getImageNames('nevus', 0, 2168);
    // const imagePaths = await getImagePaths(imageNames);
    // moveFiles(imagePaths, './ISIC/Nevus');
})();

function getFolderSize(dir) {
    if (!dir) return 0;
    return fs.readdirSync(dir).length;
}

// Moves a list of files to a new directory
// Used when accidentally saving to the wrong place
function moveFiles(paths, destBase) {
    if (!paths) return;

    // For each file path
    paths.forEach(path => {
        const pathSplit = path.split('/');
        // Get the filename off the end of the path
        const file = pathSplit[pathSplit.length - 1];
        // Copy it to a new path
        fs.copyFile(path, `${destBase}/${file}`, err => {
            if (err) console.log(err);
        });
    });
}

// Takes the image names, finds their corresponding dataset, and builds each images full file path
function getImagePaths(imageNames) {
    if (!imageNames) return [];
    const basePath = './ISIC-images';
    // Dataset folders in the archive
    const datasets = ['2018 JID Editorial Images', 'HAM10000', 'MSK-1', 'MSK-2', 'MSK-3', 'MSK-4', 'MSK-5', 'SONIC', 'UDA-1', 'UDA-2'];
    const imagePaths = [];

    // For each dataset
    datasets.forEach(dataset => {
        const dsImageNames = fs.readdirSync(`${basePath}/${dataset}`);
        // For each image
        imageNames.forEach(imageName => {
            // If this image is in this dataset, we can know the full image path
            if (dsImageNames.includes(imageName)) {
                imagePaths.push(`${basePath}/${dataset}/${imageName}`);
            }
        })
    });

    return imagePaths;
}

// Returns the list of filenames from the spreadsheet the ISIC Archive came with
async function getImageNames(diagnosis = 'melanoma', startIndex, endIndex) {
    const csv = fs.readFileSync('./ISIC-images/metadata.csv', 'utf8');

    // Uses a promise to use async await with csvParse
    const requestedRecords = await new Promise((res, rej) => {
        // Converts the CSV to a js array
        csvParse(csv, (err, metadata) => {
            if (err) return rej(err);

            const records = metadata.map(record => {
                // Takes out the filename and the diagnosis
                return {
                    filename: `${record[1]}.jpg`,
                    diagnosis: record[6]
                };
                // Only keeps the requested diagnosis
            }).filter(record => record.diagnosis === diagnosis);

            res(records);
        });
    });
    // Only take the amount of records we want so it doesn't have to be every single file
    return requestedRecords.map(record => record.filename).slice(startIndex, endIndex);
}