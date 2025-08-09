import { DoodleFactory } from "./types";
import { radiansToDegrees, randomRange, randomRangeInt, Vector } from "./vector";

const ORB_COUNT = 50;

class Orb {
    constructor(mx: number, my: number, cw: number, ch: number) {
        var dx = (cw / 2) - mx;
        var dy = (ch / 2) - my;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var angle = Math.atan2(dy, dx);
        
        this.position = new Vector(mx, my);
        this.last = new Vector(mx, my);
        this.hue = 0;
        this.colorAngle = 0;
        this.angle = angle + Math.PI / 2;
        this.size = randomRange(0.5, 0.7);

        this.center = new Vector(cw / 2, ch / 2);
        this.radius = dist;
        this.speed = (randomRangeInt(5, 10) / 1000) * (dist / 750) + .015;
        this.alpha = 1 - Math.abs(dist) / cw;
    }

    position: Vector;
    last: Vector;
    center: Vector;

    hue: number;
    colorAngle: number;
    angle: number;
    size: number;
    radius: number;
    speed: number;
    alpha: number;

    draw(context: CanvasRenderingContext2D) {
        context.strokeStyle = 'hsla(' + this.colorAngle + ',100%,50%,1)';
        context.lineWidth = this.size;
        context.beginPath();
        context.moveTo(this.last.x, this.last.y);
        context.lineTo(this.position.x, this.position.y);
        context.stroke();
    }

    update(width: number, height: number) {
        let mx = this.position.x;
        let my = this.position.y;
        this.last.x = this.position.x;
        this.last.y = this.position.y;
        let x1 = width / 2;
        let y1 = height / 2;
        let x2 = mx;
        let y2 = my;
        let rise = y1 - y2;
        let run = x1 - x2;
        let slope = -(rise / run);
        let radian = Math.atan(slope);
        let angleH = Math.floor(radiansToDegrees(radian));
        if (x2 < x1 && y2 < y1) { angleH += 180; }
        if (x2 < x1 && y2 > y1) { angleH += 180; }
        if (x2 > x1 && y2 > y1) { angleH += 360; }
        if (y2 < y1 && slope === -Infinity) { angleH = 90; }
        if (y2 > y1 && slope === Infinity) { angleH = 270; }
        if (x2 < x1 && slope === 0) { angleH = 180; }
        if (isNaN(angleH)) { angleH = 0; }

        this.colorAngle = angleH;
        this.position.x = this.center.x + Math.sin(this.angle * -1) * this.radius;
        this.position.y = this.center.y + Math.cos(this.angle * -1) * this.radius;
        this.angle += this.speed;
    }
}

export const orbitals: DoodleFactory = context => {
    const canvas = context.canvas;

    context.lineCap = 'round';
    let orbs: Orb[] = [];
    
    for (let i = 0, max = ORB_COUNT; i < max; ++i) {
        orbs.push(new Orb(canvas.width / 2, canvas.height / 2 + (i * 20), canvas.width, canvas.height));
    }
    
    return deltaTime => {
        context.doodle.drawBackgroundColor(0.1);

        for (let orb of orbs) {
            var updateCount = 3;
            while (updateCount--) {
                orb.update(canvas.width, canvas.height);
                orb.draw(context);
            }
        }
    };
}