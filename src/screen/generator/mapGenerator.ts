import { vec2 } from 'gl-matrix';

const splitChance = 0.70;
const mergeChance = 0.70;
const splitDepth = 3;
const minSplitDepth = 2;

const splitMin = 0.3;
const splitMax = 0.7;

export class MapGenerator {
    public static generateMap(size: vec2) {
        const rooms = [new Room(
            vec2.fromValues(0,0),
            size,
            [],
            0
        )];
        this.split(rooms);
    }

    private static split(rooms: Room[]) {
        console.debug('split');
        for(let i = 0; i < rooms.length; i++){
            const room = rooms[i];
            const result = room.split();
            if(result === false) {
                continue;
            } else {
                rooms.splice(i, 1, ...result);
                i--;
            }
        }
        rooms.forEach((r) => {
            r.neighbour = r.neighbour.filter((n) => rooms.indexOf(n) !== -1);
        })
        this.link(rooms);
    }

    private static allRoomsAccessable(rooms: Room[]){
        const left = rooms.slice();
        const visited: Room[] = [];
        let room = rooms[0];
        const toVisit: Room[] = room.links.slice();
        visited.push(room);
        console.log('visited room:', room.id);
        while(toVisit.length > 0) {
            room = toVisit.pop()!;
            console.log('visited room:', room.id);
            visited.push(room);
            toVisit.push(... room.links.filter(e => visited.indexOf(e) !== -1));
        }
        return visited.length === rooms.length;
    }

    private static link(rooms: Room[]) {

        rooms[0].links.push(rooms[1]);
        console.debug(rooms[0].neighbour);
        console.debug(this.allRoomsAccessable(rooms));


        this.show(rooms);
    }

    private static show(rooms: Room[]) {
        console.debug('show', rooms);
        const container = document.createElement('div');
        container.style.position = 'relative';
        
        rooms.forEach(e => {
            const element = document.createElement('div');
            element.style.position = 'absolute';
            element.style.left = e.position[0] + 'px';
            element.style.top = e.position[1] + 'px';
            element.style.width = e.size[0] + 'px';
            element.style.height = e.size[1] + 'px';
            element.style.background = e.color;

            element.textContent = e.id.toString();

            container.append(element);
        });

        document.addEventListener('DOMContentLoaded', () => {
            document.body.append(container);
        })
    }
}

let id = 0;
class Room {

    color: string = getRandomColor();
    links: Room[] = [];
    id: number = id++;

    constructor(
        public position: vec2,
        public size: vec2,
        public neighbour: Room[],
        public depth: number,
    ) {

    }

    split() {
        // roll if we split
        if(
            (this.depth >= minSplitDepth && Math.random() > splitChance) ||
            this.depth === splitDepth
        ) {
            return false;
        }
        const splitDir = this.size[0] > this.size[1] ? 0 : 1;
        const splitPoint = Math.random() * (splitMax - splitMin) + splitMin;

        let sizeA: vec2;
        let sizeB: vec2;
        let posA: vec2 = vec2.clone(this.position);
        let posB: vec2;

        switch(splitDir){
            case 0:
                sizeA = vec2.fromValues(this.size[0] * splitPoint, this.size[1]);
                sizeB = vec2.fromValues(this.size[0] * (1-splitPoint), this.size[1]);
                posB = vec2.add(vec2.create(), this.position, [sizeA[0], 0]);
                break;
            case 1:
                sizeA = vec2.fromValues(this.size[0], this.size[1] * splitPoint);
                sizeB = vec2.fromValues(this.size[0], this.size[1] * (1-splitPoint));
                posB = vec2.add(vec2.create(), this.position, [0, sizeA[1]]);
                break;
        }

        const roomA = new Room(
            posA,
            sizeA,
            this.neighbour.slice(),
            this.depth + 1,
        )

        const roomB = new Room(
            posB,
            sizeB,
            this.neighbour.slice(),
            this.depth + 1
        )

        roomA.neighbour.push(roomB);
        roomB.neighbour.push(roomA);
        
        return [roomA, roomB];
    }

}



function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }