const imagesFolder = '../public/assets/images';
const fs = require('fs');
const path = require('path');
const sharp = require('../node_modules/sharp');

// console.log(process.cwd());

const createPreviewImage = async (filename) => {
    return await sharp(`${filename}`).resize(960, 540, {fit:"inside"}).webp({quality:20}).toFile(`${filename}-s.webp`);
}

fs.readdirSync(imagesFolder).forEach(folder => {
    // console.log(folder);
    
    let imagepath = imagesFolder + '/' + folder;
    
    if (!fs.lstatSync(imagepath).isDirectory()) return; 
    
    fs.readdirSync(imagepath).forEach(file => {
        // console.log(file);
        let title = file.replace(path.extname(file), "");
        console.log(`{ filename: '${folder}/${file}', title: '${title}', cat: '${folder}', range: [2008, 2012]  },`);
        createPreviewImage(`${imagepath}/${file}`)
    });
});

