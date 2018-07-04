'use strict';
import {
    $Room,
    getNameSpace,
    $Item,
    $GFragment,
    getContentAt
} from './Room';

import {
    Vector
} from './math';

import {
    PortalType,
    Indirection,
    TelePortal
} from './Symbols';

export interface $ItemPortal extends $Item {
    toRoom: number;
    alias?: Indirection;
    portal: Indirection | PortalType;
}

export function processPortal(_matrix: string[], _width: number, room: $Room, coords: Vector[], si: TelePortal) {


    let gui: $GFragment = {
        size: ['pxcb30ps3', 'fsc3'],
        auxClassNames: ['common_floor_objects', 'teleportation'],
        left: 0,
        top: 0,
        zIndex: 0,
        hasShadow: true,
    };

    let itm: $ItemPortal = {
        tag: si.e,
        p: coords[0],
        toRoom:
        si.toRoom,
        portal: si.portal,
        alias: si.m,
        gui
    };

    let other = getContentAt(room, coords[0], '.');

    if (other) {
        let portal = getNameSpace(room, 'portal');
        portal.push(itm);
        console.log({ portal: itm });
        return;
    }
    console.log('Error, not a valid portal its not positioned on a floor tile:', JSON.stringify(itm));
}