# thomas-richartz.github.io


## Deploy

`npm run deploy`

`yarn add gh-pages`  
`yarn deploy -- -m "deploy app to github-pages"`


## Getting Started

Run and Build

    docker-compose up

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

    docker-compose build

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.


Docker:

    docker run -it -p 3000:3000 -v $(pwd):/app vite-dev
    docker build -t vite-dev .


## Scripts


Compile Script to JS (`npm install typescript ts-node --save-dev --legacy-peer-deps`) :  
`npx tsc scripts/deduplicate.ts` 

        ➜  thomas-richartz.github.io git:(main) ✗ npx tsc scripts/deduplicate.ts
        ➜  thomas-richartz.github.io git:(main) ✗ node scripts/deduplicate.js   


`node scripts/deduplicate.js` - duplicates 

`bin/upsert.sh` - builds a pipe- or copyable list of files 

`bin/upsert.sh > src/assets/assets.ts`  (idompontent?)


## Zitate

TBD Warum Praeteritum? Praesenz: Gelten, gilt usw.

Das Bestreben dem Dasein einen Sinn ab zu gewinnen, ihm Geheimnisse ein zu schreiben und dann versuchen sie zu entschleiern, ist uraltes Bedürfnis des Menschen und wurde von Religionsstiftern, Philosophen und Wissenschaftlern zu allen Zeiten bedient. In der heutigen Zeit widmen sich auch vermehrt wieder die Künstler dem Hinterfragen des Scheins und der Suche nach „Wirklichkeit“ und „Wahrheit“.

Unsere Vorstellung der Welt ist das Ergebnis von Wertungen und Präferenzen, die gesellschaftlichen Konventionen entspringen. Aber Wertungen, Interpretationen und Definitionen, ist es nicht alles von Menschen gemacht, also relativ und wandelbar? Könnte nicht alles auch ganz anders sein? Das Oben unten, das Schwarze weiß und harmonisch das Disharmonische?



