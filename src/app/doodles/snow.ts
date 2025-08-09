import { DoodleFactory } from "./types";
import { Color, randomRange, Vector } from "./vector";

const COUNT = 3000;

class Snowflake {
    position = Vector.zero();
    velocity = Vector.zero();
    radius = 0;
    opacity = 0;

    initialize(width: number, height: number) {
        this.position = Vector.random(width, height);
        this.velocity = new Vector(randomRange(-0.5, 0.5), randomRange(1, 4)).scale(60);
        this.radius = randomRange(0.75, 1.25);
        this.opacity = randomRange(0.25, 0.5);
        return this;
    }

    reset(width: number, height: number) {
        this.position = Vector.random(width, -height);
        this.velocity = new Vector(randomRange(-0.5, 0.5), randomRange(1, 4)).scale(60);
        this.radius = randomRange(0.75, 1.25);
        this.opacity = randomRange(0.25, 0.5);
        return this;
    }
}

export const snow: DoodleFactory = (context: CanvasRenderingContext2D) => {
    const canvas = context.canvas;
    let snowflakes: Snowflake[] = [];

    for (let i = 0; i < COUNT; i++) {
        snowflakes.push(new Snowflake().initialize(canvas.width, canvas.height));
    }

    let flakeColor = Color.parse('#ff7676');

    return deltaTime => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        for (let snowflake of snowflakes) {
            snowflake.position = snowflake.position.add(snowflake.velocity.scale(deltaTime));


            context.fillStyle = flakeColor.withAlpha(snowflake.opacity).toHex();
            context.beginPath();
            context.arc(snowflake.position.x, snowflake.position.y, snowflake.radius, 0, Math.PI * 2, false);
            context.closePath();
            context.fill();

            if (snowflake.position.y > canvas.height) {
                snowflake.reset(canvas.width, canvas.height);
            }
        }
    };
}