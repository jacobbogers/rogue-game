'use strict';

/*
  .enemies {
            background: url('images/enemies.png');
            background-origin: border-box;
            background-size: 1024px 512px; //normal size 48px 48px
            background-size: 1280px 640px; //boss size  60px 60px
            image-rendering: pixelated;

            animation-duration: 1s;
            animation-timing-function: steps(1);
            animation-delay: 0ms;
            animation-iteration-count:infinite;
        }

         <anim name="assassin02_attack" sprite_sheet="enemies" play_mode="play_once" loop="false" speed="300.00">
        <frame duration="300.0">assassin02_01</frame>
        <frame duration="300.0">assassin02_02</frame>
    </anim>

        .assassin02_attack {
            width: 24px;
            height: 24px;
            animation-name: assassin02_01, assassin02_02;
            animation-duration: 600ms, 600ms;
            animation-delay: 0s, 300ms;
            animation-iteration-count: infinite;
        }

        @keyframes assassin02_01 {
            from {
                background-position: -48px -48px;
            }
        }

        @keyframes assassin02_02 {
            from {
                background-position: 0px -48px;
            }
        }

        h2 {

            background-repeat: no-repeat;
            background-clip: border-box;
            background-size: 200% auto;

            image-rendering: pixelated;

            color: white;
            font-weight: bold;
            font-size: 360%;
            height: calc( 100% - 20px);
            line-height: 1;
            padding: 25px;
            text-shadow: 0 0 1px black;
            border: 4px dashed green;
        }
    
css image-rendering: pixelated;

<?xml version="1.0" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" version="1.1"
     width="420px" height="420px">

      <circle cx="200" cy="200" r="75"  />

      <path  
            d="
            M 200, 200
            m -75, 0
            a 75,75 0 0,1 150,0.00001
           
            "
      />

</svg>

circle, path {
    fill: none;
    stroke-width: 5;
    stroke-opacity: 0.5;
}

circle {
    stroke: red;
}

path {
    stroke: blue;
    stroke-opacity: 1;
}
*/

import {
    loadXMLAsset
} from '../lib/tools';

import {
    SpriteSheet,
    //Sprite
} from '../lib/Sprite';

import {
    //Animation,
    AnimationData,
    AnimationSheet
} from '../lib/Animation';


export const entities: { [index: string]: string; } = {
    'enemies.anim': require('./entities/enemies.anim'),
    'enemies.png': require('./entities/enemies.png'),
    'enemies.sheet': require('./entities/enemies.sheet'),
    'heroes.anim': require('./entities/heroes.anim'),
    'heroes.png': require('./entities/heroes.png'),
    'heroes.sheet': require('./entities/heroes.sheet'),
    'shadow.sheet': require('./entities/shadow.sheet'),
    'shadow.png': require('./entities/shadow.png'),
    'shopkeeper.sheet': require('./entities/shopkeeper.sheet'),
    'shopkeeper.anim': require('./entities/shopkeeper.anim'),
};




export const dungeon: { [index: string]: string; } = {
    'common_floor_objects.anim': require('./dungeon/common_floor_objects.anim'),
    'common_floor_objects.png': require('./dungeon/common_floor_objects.png'),
    'common_floor_objects.sheet': require('./dungeon/common_floor_objects.sheet'),
    'dungeon_decor_props.png': require('./dungeon/dungeon_decor_props.png'),
    'dungeon_decor_props.sheet': require('./dungeon/dungeon_decor_props.sheet'),
    'dungeon_objects.anim': require('./dungeon/dungeon_objects.anim'),
    'dungeon_objects.png': require('./dungeon/dungeon_objects.png'),
    'dungeon_objects.sheet': require('./dungeon/dungeon_objects.sheet'),

    'floor_crypt.png': require('./dungeon/floor_crypt.png'),
    'floor_crypt.sheet': require('./dungeon/floor_crypt.png'),

    'liquid_acid.anim': require('./dungeon/liquid_acid.anim'),
    'liquid_acid.png': require('./dungeon/liquid_acid.png'),
    'liquid_acid.sheet': require('./dungeon/liquid_acid.sheet'),
    'liquid_lava.anim': require('./dungeon/liquid_lava.anim'),
    'liquid_lava.png': require('./dungeon/liquid_lava.png'),
    'liquid_lava.sheet': require('./dungeon/liquid_lava.sheet'),
    'liquid_swamp.anim': require('./dungeon/liquid_swamp.anim'),
    'liquid_swamp.png': require('./dungeon/liquid_swamp.png'),
    'liquid_swamp.sheet': require('./dungeon/liquid_swamp.sheet'),
    'liquid_water.anim': require('./dungeon/liquid_water.anim'),
    'liquid_water.png': require('./dungeon/liquid_water.png'),
    'liquid_water.sheet': require('./dungeon/liquid_water.sheet'),
};



export function createStyleSheets(): Promise<any> {
    const xmlEnemies = Object.keys(entities).filter((f) => /\.(anim|sheet)$/.test(f)).reduce((coll, x) => {
        coll[x] = {
            url: x,
            promise: loadXMLAsset('GET', entities[x]),
            data: null
        };
        return coll;
    }, {} as { [index: string]: { url: string; promise: Promise<any>; data: any; } });

    return Promise.all(Object.keys(xmlEnemies).map((m) => xmlEnemies[m].promise))
        .then(() => {
            for (let key in xmlEnemies) {
                // enemies, all promises resolved so thenables are executed immediatly
                xmlEnemies[key].promise.then((data) => {
                    xmlEnemies[key].data = data;
                });

            }
            return xmlEnemies; // thenables will be resolved before return is executed (dark behavior).
        })
        .then(() => {
            //create enemy stylesheet
            //const enemySpriteMapUrl = entities['enemies.png'];
            const enemySheetData = xmlEnemies['enemies.sheet'];
            const enemyAnimationData = xmlEnemies['enemies.anim'];

            let enemySprites = new SpriteSheet({ originalUrl: './enemies.png', actualUrl: './enemies.png', sprites: enemySheetData.data.sheets.sheet });
            enemySprites;
            //some transformations and cleanup
            enemyAnimationData.data.anims.anim.forEach((itm: AnimationData) => {
                itm.spriteSheetName = (itm as any)['sprite_sheet'] + '.png';
                itm.frame = !(itm.frame instanceof Array) ? [itm.frame] : itm.frame;
                itm.frame.forEach((fr) => fr.spriteName = (fr as any)['_Data']);
            });
            let enemyAnimations = new AnimationSheet('enemies', enemyAnimationData.data.anims.anim);
            return enemyAnimations.CSSAscii();
        })
        .catch((e) => {
            //error stuff
            console.log(`%c There was an error: ${JSON.stringify(e)}.`, 'color:red');
        });

}
