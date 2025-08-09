import { DoodleFactory } from "./types";
import { Vector } from "./vector";

export const sine: DoodleFactory = context => {
    const canvas = context.canvas;

    let lastPicked = 0;
    let currentPoint = Vector.zero();
    let lastPoint = currentPoint.clone();
    let nextPoint = currentPoint.clone().set(1, 0);
    let velocity = new Vector(0, 100);
    let speed = 100;

    return (deltaTime: number) => {
        if (Date.now() - lastPicked > 1000.0) {
            lastPoint = nextPoint.clone();
            lastPicked = Date.now();
            nextPoint = new Vector(nextPoint.x * 2, 0);
        }

        let margin = 20;
        if (currentPoint.x < margin || currentPoint.x > canvas.width - margin * 2) {
            velocity.x *= -1;
        }
        if (currentPoint.y < margin || currentPoint.y > canvas.height - margin * 2) {
            velocity.y *= -1;
        }

        let deltaAngle = velocity.angle(nextPoint.subtract(currentPoint));
        velocity = velocity.rotate(deltaAngle * 0.05);

        context.doodle.drawBackgroundColor(0.01);

        context.beginPath();
        context.moveTo(currentPoint.x, currentPoint.y);
        context.lineTo(currentPoint.x + velocity.x * deltaTime, currentPoint.y + velocity.y * deltaTime);

        // update

        currentPoint.x += velocity.x * deltaTime;
        currentPoint.y += velocity.y * deltaTime;

        let desiredSpeed = Math.max(30, 100 - currentPoint.distance(nextPoint)) * 10;
        //speed = (speed * 4 + desiredSpeed) / 5;
        velocity = velocity.normalize().scale(speed);

        context.strokeStyle = '#ff7676';
        context.stroke();
    };
}