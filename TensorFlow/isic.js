const fs = require('fs');
const csvParse = require('csv-parse');

(async function () {
    // const imageNames = await getImageNames('nevus', 0, 2168);
    // const imagePaths = await getImagePaths(imageNames);
    // moveFiles(imagePaths, './ISIC/Nevus');
})();

function getFolderSize(dir) {
    if (!dir) return 0;
    return fs.readdirSync(dir).length;
}

function moveFiles(paths, destBase) {
    if (!paths) return;

    paths.forEach(path => {
        const pathSplit = path.split('/');
        const file = pathSplit[pathSplit.length - 1];

        fs.copyFile(path, `${destBase}/${file}`, err => {
            if (err) console.log(err);
        });
    });
}

function getImagePaths(imageNames) {
    if (!imageNames) return [];
    const basePath = './ISIC-images';
    const datasets = ['2018 JID Editorial Images', 'HAM10000', 'MSK-1', 'MSK-2', 'MSK-3', 'MSK-4', 'MSK-5', 'SONIC', 'UDA-1', 'UDA-2'];
    const imagePaths = [];

    datasets.forEach(dataset => {
        const dsImageNames = fs.readdirSync(`${basePath}/${dataset}`);

        imageNames.forEach(imageName => {

            if (dsImageNames.includes(imageName)) {
                imagePaths.push(`${basePath}/${dataset}/${imageName}`);
            }
        })
    });

    return imagePaths;
}

async function getImageNames(diagnosis = 'melanoma', startIndex, endIndex) {
    const csv = fs.readFileSync('./ISIC-images/metadata.csv', 'utf8');

    const requestedRecords = await new Promise((res, rej) => {
        csvParse(csv, (err, metadata) => {
            if (err) return rej(err);

            const records = metadata.map(record => {
                return {
                    filename: `${record[1]}.jpg`,
                    diagnosis: record[6]
                };
            }).filter(record => record.diagnosis === diagnosis);

            res(records);
        });
    });

    return requestedRecords.map(record => record.filename).slice(startIndex, endIndex);
}