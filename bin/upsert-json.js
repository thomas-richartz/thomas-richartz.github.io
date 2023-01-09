
// Folder with (Y[-Y]) 
// Upsert (Creator or Update) Data in JSON
// Github Action?

const imagesFolder = '../public/assets/images';
const fs = require('fs');
const path = require('path');
const sharp = require('../node_modules/sharp');


const slugify = text =>
    text
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')


const optimizeImage = async (filename) => await sharp(`${filename}`).resize(1920, 1080, { fit: "inside" }).webp({ quality: 80 }).toFile(`${filename}.webp`);

const mv = async(oldPath, newPath) => {
    await fs.promises.rename(oldPath, newPath, (err) => {
        if (err) throw err;
        console.log('Rename complete');
      });
}

const slugifiedPathToCat = {
    '3-monde-2018': '3 Monde (2018)',
    '32-denkmaler-1993-1999': '32 Denkmäler (1993-1999)',
    'africa-europa-2016': 'Africa-Europa (2016)',
    'ametat-2020': 'Ametat (2020)',
    'auswahl-1-1995-2008': 'Auswahl 1 (1995-2008)',
    'auswahl-2-2008-2013': 'Auswahl 2 (2008-2013)',
    'auswahl-3-2008-2012': 'Auswahl 3 (2008-2012)',
    'baudelaire-2009-2012': 'Baudelaire (2009-2012)',
    'berlin-gibt-auf-2015': 'Berlin gibt auf (2015)',
    'bilder-1995-2008': 'Bilder (1995-2008)',
    'buro-2019': 'Büro (2019)',
    'corona-art-2020': 'CORONA-ART (2020)',
    'das-verlorene-jahr2017': 'Das verlorene Jahr(2017)',
    'der-himmel-uber-peking-2014': 'Der Himmel über Peking (2014)',
    'der-schein-trugt-2018': 'Der Schein trügt (2018)',
    'dovcenko2-2022': 'Dovcenko2 (2022)',
    'dystopie-2011': 'Dystopie (2011)',
    'freiheitskampf-2018': 'Freiheitskampf (2018)',
    'geruchtekuche-2017': 'Gerüchteküche (2017)',
    'hallgatas-2014': 'Hallgatás (2014)',
    'kunst-und-so-2000-2021': 'Kunst und so (2000-2021)',
    'la-belle-et-la-bete-2009': 'LA BELLE ET LA BETE (2009)',
    'la-trasformazione-2017': 'La Trasformazione (2017)',
    'reformation-2017': 'Reformation (2017)',
    'religionsunterricht-2013': 'Religionsunterricht (2013)',
    'religionsunterricht-2-2013-2014': 'Religionsunterricht 2 (2013-2014)',
    'verfall-2019-2021': 'Verfall (2019-2021)',
    'wege-aus-dem-ghetto-2016': 'Wege aus dem Ghetto (2016)',
    'wille-und-vorstellung-2018': 'Wille und Vorstellung (2018)'
  };

// check for new folder to slugify
let hasNewSlugifiedPaths = false;
fs.readdirSync(imagesFolder).forEach(folder => {
    // console.log(folder);

    let imagepath = imagesFolder + '/' + folder;

    // if (folder === ".DS_Store") {
    //     fs.unlink(imagepath, (err) => {
    //         if (err) throw err;
    //         console.log(`deleted file: ${imagepath}`);
    //       });
    // }

    if (fs.lstatSync(imagepath).isDirectory()) {
        if (slugify(folder) !== folder) {
            mv(imagepath, imagesFolder + '/' + slugify(folder));
            // console.log(imagepath, imagesFolder + '/' + slugify(folder));
            slugifiedPathToCat[slugify(folder)] = folder; 
            hasNewSlugifiedPaths = true;
            // console.log(`${slugify(folder)}: ${folder}`);
        }
    }
}); 

if (hasNewSlugifiedPaths) {
    console.log(JSON.stringify(slugifiedPathToCat));
    let slugcats = JSON.stringify(slugifiedPathToCat)
    // load slugcats from slugcats.json file into slugcatsOld variable
    let slugcatsOld = fs.readFileSync('slugcats.json', 'utf8');
    console.log(slugcatsOld); 
    // merge slugcatsOld and slugcats
    slugcats = JSON.stringify(Object.assign(JSON.parse(slugcatsOld), JSON.parse(slugcats)));        
    // save merged slugcats to slugcats.json file
    fs.writeFile('slugcats.json', slugcats, (err) => {
        if (err) throw err;
        console.log('slugcats.json saved');
    });
}

// console.log(slugifiedPathToCat);

fs.readdirSync(imagesFolder).forEach(folder => {
    // console.log(folder);

    let imagepath = imagesFolder + '/' + folder;

    if (!fs.lstatSync(imagepath).isDirectory()) return;

    // extract years (range) -YYYY-YYYY or -YYYY
    let range = [];
    if (folder.substring(folder.length-4)) {
        if (!isNaN(folder.substring(folder.length-9, folder.length-5))) {
            range.push(Number(folder.substring(folder.length-9, folder.length-5)));
        }
        range.push(Number(folder.substring(folder.length-4)));        
    }

    // build file entry
    fs.readdirSync(imagepath).forEach(file => {
        // console.log(file);

        // TODO skip hidden files with dot (.DS_Store), *.log and Thumbs.db etc.
        if (file == ".DS_Store") return;

        // rename file to a slugified (lowercase and ascii) filename, due to different fs-formats (macOS (HFS+) uses a decomposed (Unicode NFD) and Windows precomposed characters)
        let title = file.replace(path.extname(file), "");
        if (path.parse(file).ext !== ".webp" && !fs.existsSync(`${imagepath}/${file}.webp`)) {
            if (!fs.existsSync(`${imagepath}/${slugify(file)}.webp`)) {
                optimizeImage(`${imagepath}/${file}`)
            }
            return;
        }

        // let title = path.parse(file).name
        if (path.parse(file).ext === ".webp") {
            let currentSuffix = path.extname(file);
            let currentFilename = file.replace(path.extname(file), "");
            [".jpg", ".JPG", ".jpeg", ".png"].map((originalSuffix) => {
                if (title.includes(originalSuffix)) {
                    title = title.replace(originalSuffix, "");
                    currentFilename = currentFilename.replace(originalSuffix, "");
                    currentSuffix = originalSuffix + currentSuffix;
                }
            });
            let cat = folder;
            if (typeof slugifiedPathToCat[folder] !== "undefined") {
                cat = slugifiedPathToCat[folder];
            }
            if (slugify(currentFilename) !== currentFilename) {
                mv(`${imagepath}/${file}`, `${imagepath}/${slugify(currentFilename)}${currentSuffix}`)
                // console.log(`${imagepath}/${file} -> ${imagepath}/${slugify(currentFilename)}${currentSuffix}`);
                console.log(`{ filename: '${folder}/${slugify(currentFilename)}${currentSuffix}', title: '${title}', cat: '${cat}', range: ${JSON.stringify(range)} },`);
            } else {
                console.log(`{ filename: '${folder}/${file}', title: '${title}', cat: '${cat}', range: ${JSON.stringify(range)} },`);
            }
        }
    });
});

