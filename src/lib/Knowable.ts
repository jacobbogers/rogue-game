'use strict';
import {
    isRoom,
    getNameSpace,
    $Item,
} from './Room';

import {
    Vector
} from './math';

import {
    AllSpells,
   //  GeneralContent
} from './Symbols';

/*
export type LearnableType = 'u';
export interface MagicSpellBook extends SymbolBase<'u'> {
    spell: string;
}

*/


import {
    GeneralContainer
} from './GeneralContainer';

export interface $ItemKnowable extends $Item {
    spell: string;
}

export function processKnowable(
    matrix: string[],
    width: number,
    container: GeneralContainer,
    coords: Vector[],
    si: AllSpells) {

    matrix;
    width;

    let itm: $ItemKnowable = {
        tag: si.e,
        p: coords[0],
        spell: si.spell
    };
    //
    //
    let { x, y } = coords[0];
    //
    //  Not hidden it is on the playboard
    //
    if (x >= 0 && y >= 0 && isRoom(container)) {
        let drops = getNameSpace(container, 'drops');
        drops.push(itm);
        console.log('drops', JSON.stringify(itm));
        return;
    }
    if (!isRoom(container)) {
        container.has.push(itm);
        return;
    }


    console.log('Error, not a valid portal its not positioned on a floor tile:', JSON.stringify(itm));
}