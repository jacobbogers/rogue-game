

import { Symbol } from './Symbols';
import { Door } from './Door';
import { Vector } from './math';
import { WallCursor, InnerWallCursor } from './WallCursor';
import { factoryAreaScanner, FloorItem } from './FloorItem';


const liquidExtracor = factoryAreaScanner('liquid');
const carpetExtractor = factoryAreaScanner('carpet');
const lanternExtractor = factoryAreaScanner('lantern');
const cobWebsAndSkullsExtractor = factoryAreaScanner('cobweb&Skulls');
const mutexExtractor = factoryAreaScanner('mutexItems');

export interface Layout {
    room: string | string[];
    id: string;
    symbols: Symbol[];
}



export class Room {
    private _id: number;
    public t: number;
    public l: number;
    public doors: Door[];
    public w: number;
    public h: number;
    public room: string[][];


    public get id() {
        return this._id;

    }

    private renderWalls() {
        let cursor = new WallCursor(this);
        cursor.renderWall();
        let fl = this.room[0];
        fl = fl.map((s) => {
            let raw = s.split('');
            let i = 0;
            while (raw[i] === '#') {
                raw[i] = ' ';
                i++;
            }
            i = s.length - 1;
            while (raw[i] === '#') {
                raw[i] = ' ';
                i--;
            }
            return raw.join('');
        });
        this.room[0] = fl;
        try {
            cursor = new InnerWallCursor(this);
            cursor.renderWall();
        }
        catch (e) {
            //no inner wallnothing
        }
    }

    private validateCoords(layer: number, x: number, y: number): string[] | undefined {
        if (x < 0 || x >= this.w || y < 0 || y >= this.h) {
            return undefined;
        }
        let f = this.room[layer];
        if (!f) {
            throw new Error(`This layer ${layer} doesnt exist in room ${this._id}`);
        }
        return f;
    }

    private createBaseLayer(raw: string[][]) {
        if (!this.room) {
            this.room = [];
        }
        // lava , water, mud & acid pools
        let liquidPools: FloorItem[] = [];
        for (let l = liquidExtracor(raw[0]); l; l = liquidExtracor(raw[0])) {
            liquidPools.push(l);
        }



        let carpets: FloorItem[] = [];
        for (let c = carpetExtractor(raw[0]); c; c = carpetExtractor(raw[0])) {
            carpets.push(c);
        }

        let laterns: FloorItem[] = [];
        for (let i = 0; i < raw.length; i++) {
            for (let la = lanternExtractor(raw[i]); la; la = lanternExtractor(raw[i])) {
                laterns.push(la);
            }
        }

        let cobWebsAndSkulls: FloorItem[] = [];
        for (let i = 0; i < raw.length; i++) {
            for (let c = cobWebsAndSkullsExtractor(raw[i], i); c; c = cobWebsAndSkullsExtractor(raw[i], i)) {
                cobWebsAndSkulls.push(c);
            }
        }

        let mutexItems: FloorItem[] = [];
        for (let mu = mutexExtractor(raw[0]); mu; mu = mutexExtractor(raw[0])) {
            mutexItems.push(mu);
        }


        let base = raw[0].slice(0); /*map((line) => {
            let rc = line.replace(/[^IRSwm\#\^><vAKµ]/g, '.');
            console.log(rc, line);
            return rc;
        });*/
        this.room.unshift(base);
        console.log('liquids:', liquidPools);
        console.log('carpets:', carpets);
        console.log('laterns:', laterns);
        console.log('cobWebsAndSkulls:', cobWebsAndSkulls);
        console.log('mutexItems:', mutexItems);
        //add from each layer  carpets, water, lava, skulls
    }

    private getRoomMetrics(raw: string[][]): Vector {

        let roomMetric = raw.reduce((checkRoom, layer, layerIdx, arrLayers) => {
            let layerMetric: Vector = { x: 0, y: 0 };
            layer.reduce((checkLayer, line, y, arr) => {
                if (line.length === 0) {
                    throw new TypeError(`room:${this.id} , layer:${layerIdx} scanline ${y} has width 0, ${arr}`);
                }
                if (checkLayer.x === 0) checkLayer.x = line.length;
                if (checkLayer.x !== line.length) {
                    throw new TypeError(`room:${this.id} , layer:${layerIdx} envelope is not perfectly rectangular, ${arr}`);
                }
                if (y === arr.length - 1) {
                    checkLayer.y = arr.length;
                }
                return checkLayer;
            }, layerMetric);
            if (layerIdx === 0) {
                return layerMetric;
            }
            if (layerMetric.x !== checkRoom.x || layerMetric.y !== checkRoom.y) {
                throw new TypeError(`room:${this.id} , layer:${layerIdx} layout differs from Room, ${arrLayers[layerIdx]}`);
            }
            return layerMetric;
        }, {} as any);
        return roomMetric;
    }

    public getToken(layer: number, v: Vector): string | undefined {
        let f = this.validateCoords(layer, v.x, v.y);
        if (!f) {
            return f;
        }
        return f[v.y][v.x];
    }

    public setToken(layer: number, v: Vector, token: string) {
        let f = this.validateCoords(layer, v.x, v.y);
        if (f) {
            let n = f[v.y].split('');
            n[v.x] = token[0];
            f[v.y] = n.join('');
        }
    }

    public stamp(matrix: string[], w: number) {
        let floor = new Array<string>(this.h * this.w);
        let fl = this.room[0];

        fl.forEach((s, k) => {
            floor.splice(k * this.w, this.w, ...s.split(''));
        });

        this.doors.forEach((d) => {
            d.stamp(floor, this.w);
        });

        for (let i = 0; i < this.h; i++) {
            let s = w * (i + this.t) + this.l;
            matrix.splice(s, this.w, ...floor.slice(i * this.w, (i + 1) * this.w));
        }

    }


    public constructor(roomData: Layout) {

        if (!(roomData.room instanceof Array)) {
            roomData.room = [roomData.room];
        }

        this._id = Number.parseInt(roomData.id);

        if (!Number.isInteger(this._id)) {
            throw new TypeError(`${roomData.id} is not a valid Room ID`);
        }

        this.l = 0;
        this.t = 0;

        let raw = roomData.room.map((layer) => {
            return layer.split(/[\n\r]+/).filter((line) => line.length > 0);
        });

        let p = this.getRoomMetrics(raw);
        this.w = p.x;
        this.h = p.y;
        this.doors = [];

        this.createBaseLayer(raw);

        const createDoor = (dir: string, rx: number, ry: number): Door => {
            if ('^v><'.indexOf(dir) === -1) {
                throw new Error('not a door signature');
            }

            let selected = roomData.symbols.filter((d) => d.e === dir)[0];

            if (selected) {

                if (selected.door) {
                    let door = selected.door.toLocaleLowerCase();
                    return new Door(
                        dir,
                        rx,
                        ry,
                        /^inset:/.test(door),
                        this._id,
                        Number.parseInt(door.replace(/^inset:/, ''))
                    );
                }
            }
            throw new Error('Could not create door');
        };

        this.room[0].forEach((line, y) => {
            //scan for doors
            '^v<>'.split('').forEach((dir) => {
                let x = line.indexOf(dir); // is there a door
                if (x >= 0) {
                    this.doors.push(createDoor(dir, x, y));
                }
            });
        });
        this.renderWalls();

    }
}
