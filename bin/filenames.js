
const imagesFolder = '../public/assets/images';
const fs = require('fs');
const path = require('path');

// console.log(process.cwd());

fs.readdirSync(imagesFolder).forEach(folder => {
    // console.log(folder);
    
    let imagepath = imagesFolder + '/' + folder;
    
    if (!fs.lstatSync(imagepath).isDirectory()) return; 
    
    fs.readdirSync(imagepath).forEach(file => {
        // console.log(file);
        let title = file.replace(path.extname(file), "");
        console.log(`{ filename: '${folder}/${file}', title: '${title}', cat: '${folder}', range: [2008, 2012]  },`);

    });
});

