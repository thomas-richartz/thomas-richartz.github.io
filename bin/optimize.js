const imagesFolder = '../public/assets/images';
const fs = require('fs');
const path = require('path');
const sharp = require('../node_modules/sharp');

// console.log(process.cwd());

const optimizeImage = async (filename) => {
    return await sharp(`${filename}`).resize(1920, 1080, {fit:"inside"}).webp({quality:80}).toFile(`${filename}.webp`);
}

fs.readdirSync(imagesFolder).forEach(folder => {
    // console.log(folder);
    
    let imagepath = imagesFolder + '/' + folder;
    
    if (!fs.lstatSync(imagepath).isDirectory()) return; 
    
    fs.readdirSync(imagepath).forEach(file => {
        // console.log(file);
        let title = file.replace(path.extname(file), "");
        optimizeImage(`${imagepath}/${file}`)
    });
});

