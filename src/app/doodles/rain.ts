import { DoodleFactory } from "./types";
import { Color, randomRange, Vector } from "./vector";

const DROP_COUNT = 2000;
const VELOCITY = 1500;

class Drop {
    position = Vector.zero();
    velocity = new Vector(VELOCITY, 0).rotateDeg(48);
    color = Color.fromHex('#ff7676').withAlpha(randomRange(0.2,0.3));

    reset(width: number, height: number) {
        let leftEdge = Math.random() >= 0.5 ? true : false;
        this.position = Vector.random(leftEdge ? width : -100, leftEdge ? -100 : height);
        this.velocity = new Vector(VELOCITY, 0).rotateDeg(randomRange(43, 47));
        return this;
    }

    initialize(width: number, height: number) {
        this.position = Vector.random(width, height);
        return this;
    }

    update(deltaTime: number) {
        this.position = this.position.add(this.velocity.scale(deltaTime));
    }

    wrap(width: number, height: number) {
        if (this.position.x > width && this.position.y > height)
            this.initialize(width, height);
    }
}

export const rain: DoodleFactory = context => {
    const canvas = context.canvas;
    let drops: Drop[] = [];
    
    for (let i = 0, max = DROP_COUNT; i < max; ++i)
        drops.push(new Drop().initialize(canvas.width, canvas.height));

    return (deltaTime: number) => {
        context.doodle.drawBackgroundColor(0.5);

        for (let drop of drops) {
            let startX = drop.position.x;
            let startY = drop.position.y;

            drop.update(deltaTime);

            context.strokeStyle = drop.color.toHex();
            context.beginPath();
            context.moveTo(startX, startY);
            context.lineTo(drop.position.x, drop.position.y);
            context.stroke();

            drop.wrap(canvas.width, canvas.height);
        }

    };
}