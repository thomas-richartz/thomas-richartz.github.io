# thomas-richartz.github.io


Fullscreen
https://saimon.org/sigal-demo/photoswipe/Climbing/

https://github.com/matze/splat without fullscren

zine?

## TODO

- [ ] GalleryCats last item margin or padding-bottom?

- [ ] LightBox Styles (from parent?)
- [ ] Find Close on Escape / click
- [ ] GallerySlider swipable?

- [x] remove duplicates in assets
- [x] remove duplicates in assets for each folder - different folder same file (checksum)?
- [x] remove unused images
- [x] lazy load images
- [x] website title
- [x] Lightbox: Title?, mobile?
- [x] Landingpage
- [x] Landingpage: Random
        - [x] Diashow -> SlideShow Fullscreen API
        - [ ]         -> SlideShow Fullscreen API with fallback?
        - [ ] optional "Masonry"
        - [ ] optional Random Texts / Zitate (deutsch / english)
- [ ] Meta Tags - SEO
- [ ] bin/upsert.js: Fix Filenames (replace slugified titles with orignal titles, slugs.json[titles] file?)
- [ ] bin/upsert.js: (make it idompotent) -> slugs.json[cats] file?
- [ ] New Menu: Sculptures ...
        - Skulpturen, Installation: Reformation (2017),
        - Gemälde,
        - Grafik: Baudelaire (2009-2012)
- [ ] GallerySlider Keyboard Events
- [ ] Youtube Link

      <a href="https://www.youtube.com/@thomasrichartz6276" title="YouTube">
          <VideoIcon />
      </a>
        <a href="https://instagram.com/@" title="insta">
          <InstagramLogoIcon />
      </a>



## Deploy

Working:

    docker build -t vite-deploy .

Using ssh keys:

docker run -it --rm \
-v ~/.ssh:/root/.ssh \
vite-deploy bash -c "
git config --global user.name 'pce' && \
git config --global user.email 'info@pc-e.org' && \
npm run deploy
"


ssh readlonly *:ro does not work:

    docker run -it --rm \
    -v ~/.ssh:/root/.ssh:ro \
    vite-deploy bash -c "cp -R /root/.ssh /root/.ssh; npm run deploy"



Buildkit?

    export DOCKER_BUILDKIT=1
    docker build --ssh default -t vite-deploy .


    docker build --ssh default .


## Scripts


Complie Script to JS (`npm install typescript ts-node --save-dev --legacy-peer-deps`) :
`npx tsc scripts/deduplicate.ts`

        ➜  thomas-richartz.github.io git:(main) ✗ npx tsc scripts/deduplicate.ts
        ➜  thomas-richartz.github.io git:(main) ✗ node scripts/deduplicate.js
        Duplicates found: [
        {
        filename: 'ametat-2020/ametat-1.jpg.webp',
        title: 'ametat-1',
        cat: 'Ametat (2020)',
        range: [ 2020 ]
        },
        {
        filename: 'ametat-2020/ametat-2.jpg.webp',
        title: 'ametat-2',
        cat: 'Ametat (2020)',
        range: [ 2020 ]
        },
        {
        filename: 'ametat-2020/ametat-3.jpg.webp',
        title: 'ametat-3',
        cat: 'Ametat (2020)',
        range: [ 2020 ]
        },
        {
        filename: 'ametat-2020/ametat-4.jpg.webp',
        title: 'ametat-4',
        cat: 'Ametat (2020)',
        range: [ 2020 ]
        },
        {
        filename: 'ametat-2020/ametat-5.jpg.webp',
        title: 'ametat-5',
        cat: 'Ametat (2020)',
        range: [ 2020 ]
        },
        {
        filename: 'ametat-2020/ametat-6.jpg.webp',
        title: 'ametat-6',
        cat: 'Ametat (2020)',
        range: [ 2020 ]
        },
        {
        filename: 'auswahl-1-1995-2008/angst-des-kapitalisten-vor-der-einigkeit-der-arbeiter.jpg.webp',
        title: 'angst-des-kapitalisten-vor-der-einigkeit-der-arbeiter',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/auf-einen-grossen-komiker.jpg.webp',
        title: 'auf-einen-grossen-komiker',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/aus-der-sonne-heraus.jpg.webp',
        title: 'aus-der-sonne-heraus',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/das-fest-derunterirdischen.jpg.webp',
        title: 'das-fest-derunterirdischen',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/das-llied-vom-kompromiss.jpg.webp',
        title: 'das-llied-vom-kompromiss',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/der-kritiker-von-koln.jpg.webp',
        title: 'der-kritiker-von-koln',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/der-tod-als-spassmacher.jpg.webp',
        title: 'der-tod-als-spassmacher',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/der-verutschte-hut.jpg.webp',
        title: 'der-verutschte-hut',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/deutsche-malersage.jpg.webp',
        title: 'deutsche-malersage',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/die-frage-der-macht.jpg.webp',
        title: 'die-frage-der-macht',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/die-weinenden-hohenzollern.jpg.webp',
        title: 'die-weinenden-hohenzollern',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/diese-welt-isr-eine-null.jpg.webp',
        title: 'diese-welt-isr-eine-null',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/drei-minuten-gehor.jpg.webp',
        title: 'drei-minuten-gehor',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/du-bist-maler.jpg.webp',
        title: 'du-bist-maler',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/ein-altes-lied.jpg.webp',
        title: 'ein-altes-lied',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/erleuchtung-in-der-wuste.jpg.webp',
        title: 'erleuchtung-in-der-wuste',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/fruhling-im-hochgebirge.jpg.webp',
        title: 'fruhling-im-hochgebirge',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/fruhling.jpg.webp',
        title: 'fruhling',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/gebet-fur-die-gefangenen.jpg.webp',
        title: 'gebet-fur-die-gefangenen',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/gedanken-und-erinnerungen.jpg.webp',
        title: 'gedanken-und-erinnerungen',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/junger-maler.jpg.webp',
        title: 'junger-maler',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/kleine-asiatische-gotter.jpg.webp',
        title: 'kleine-asiatische-gotter',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/kleine-fingerubung.jpg.webp',
        title: 'kleine-fingerubung',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/krieg-dem-krieg.jpg.webp',
        title: 'krieg-dem-krieg',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/land-der-jugend.jpg.webp',
        title: 'land-der-jugend',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/lieb-zur-luge.jpg.webp',
        title: 'lieb-zur-luge',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/limbisches-system.jpg.webp',
        title: 'limbisches-system',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/pelasgischer-schopfungsmythos.jpg.webp',
        title: 'pelasgischer-schopfungsmythos',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/rausgewunken-und-erschossen.jpg.webp',
        title: 'rausgewunken-und-erschossen',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/revolutions-ruckblick.jpg.webp',
        title: 'revolutions-ruckblick',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/rote-melodie.jpg.webp',
        title: 'rote-melodie',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/ruckkehr-zur-natur.jpg.webp',
        title: 'ruckkehr-zur-natur',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/schwarze-locher.jpg.webp',
        title: 'schwarze-locher',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/sekundartugened.jpg.webp',
        title: 'sekundartugened',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/sexuelle-aufklaeung.jpg.webp',
        title: 'sexuelle-aufklaeung',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/sonett-fur-blinde.jpg.webp',
        title: 'sonett-fur-blinde',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/spaniache-krankheit.jpg.webp',
        title: 'spaniache-krankheit',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/spazierganger-in-berlin.jpg.webp',
        title: 'spazierganger-in-berlin',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/trunkenes-lied.jpg.webp',
        title: 'trunkenes-lied',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/tunesischer-versager.jpg.webp',
        title: 'tunesischer-versager',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/unser-militar.jpg.webp',
        title: 'unser-militar',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/unser-taglich-brot.jpg.webp',
        title: 'unser-taglich-brot',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/verfehlte-nacht.jpg.webp',
        title: 'verfehlte-nacht',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/vergelts-gott.jpg.webp',
        title: 'vergelts-gott',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/wenn-die-muse-kut.jpg.webp',
        title: 'wenn-die-muse-kut',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/zeit-du-bist-entehrt.jpg.webp',
        title: 'zeit-du-bist-entehrt',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-1-1995-2008/zerebrale-dominanz.jpg.webp',
        title: 'zerebrale-dominanz',
        cat: 'Auswahl 1 (1995-2008)',
        range: [ 1995, 2008 ]
        },
        {
        filename: 'auswahl-2-2008-2013/altes-lied.jpg.webp',
        title: 'altes-lied',
        cat: 'Auswahl 2 (2008-2013)',
        range: [ 2008, 2013 ]
        }
        ]


`node scripts/deduplicate.js` - duplicates

`bin/upsert.sh` - builds a pipe- or copyable list of files

`bin/upsert.sh > src/assets/assets.ts`  (idompontent?)


# thomas-richartz.github.io


## Getting Started

Run and Build

    docker-compose up

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

    docker-compose build

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

Enter the Container:

    docker exec -it <container_id_or_name> bash

or Run in Container:

    docker run -it --rm app bash -c "npm run build"


Docker:

    docker run -it -p 3000:3000 -v $(pwd):/app vite-dev
    docker build -t vite-dev .

## Deploy

Build a Docker Container "vite-deploy"

    docker build -t vite-deploy .

NPM install:

    docker run -it vite-deploy bash -c "npm i"
    docker run -it vite-deploy bash -c "npm build"

NPM Dev:

    docker run -it -p 3000:3000 -v $(pwd):/app vite-deploy


Using ssh keys:

docker run -it --rm \
-v ~/.ssh:/root/.ssh \
thomas-richartzgithubio-app bash -c "
git config --global user.name 'pce' && \
git config --global user.email 'info@pc-e.org' && \
npm run deploy
"



docker run -it --rm \
-v ~/.ssh:/root/.ssh \
vite-deploy bash -c "
git config --global user.name 'pce' && \
git config --global user.email 'info@pc-e.org' && \
npm run deploy
"


docker run -it 2660241f48d9525b4c18c3875a4d3d99a8cbc8d1416bc5852d6739958a5ba2f0 --rm \
-v ~/.ssh:/root/.ssh \
vite-deploy bash -c "
git config --global user.name 'pce' && \
git config --global user.email 'info@pc-e.org' && \
npm run deploy
"
`npm run deploy`

`yarn add gh-pages`
`yarn deploy -- -m "deploy app to github-pages"`


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
