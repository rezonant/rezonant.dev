import { TendrilNode } from "./node";
import { TendrilRendererOptions } from "./options";
import { Vector } from "../vector";

// ========================================================================================
// Tendril
// ----------------------------------------------------------------------------------------

export interface TendrilOptions {
    context : CanvasRenderingContext2D;
    target : Vector;
    spring : number;
}

export class Tendril {
    constructor(
        readonly settings : TendrilRendererOptions, 
        readonly context : CanvasRenderingContext2D, 
        readonly target : Vector,
        readonly index : number
    ) {
        let fixedSpring = 0.45 + 0.025 * (index / this.settings.trails);
        this.spring = fixedSpring + (Math.random() * 0.1) - 0.05;

        this.friction = this.settings.friction + (Math.random() * 0.01) - 0.005;
        this.nodes = [];

        for (var i = 0, node; i < this.settings.size; i++) {
            node = new TendrilNode();
            node.x = this.target.x;
            node.y = this.target.y;

            this.nodes.push(node);
        }
    }

    spring: number;
    friction: number;
    nodes: TendrilNode[];

    setLocation(x: number, y: number) {
        this.target.x = x;
        this.target.y = y;

        for (var i = 0, node; i < this.nodes.length; i++) {
            node = this.nodes[i];
            node.x = x;
            node.y = y;
            node.vx = 0;
            node.vy = 0;
        }
    }

    update() {
        var target = this.target;

        var spring = this.spring,
            node = this.nodes[0];

        node.vx += (target.x - node.x) * spring;
        node.vy += (target.y - node.y) * spring;

        for (var prev, i = 0, n = this.nodes.length; i < n; i++) {

            node = this.nodes[i];

            if (i > 0) {

                prev = this.nodes[i - 1];

                node.vx += (prev.x - node.x) * spring;
                node.vy += (prev.y - node.y) * spring;
                node.vx += prev.vx * this.settings.dampening;
                node.vy += prev.vy * this.settings.dampening;
            }

            node.vx *= this.friction;
            node.vy *= this.friction;
            node.x += node.vx;
            node.y += node.vy;

            spring *= this.settings.tension;
        }
    }

    draw() {
        var ctx = this.context;
        var x = this.nodes[0].x,
            y = this.nodes[0].y,
            a, b;

        ctx.beginPath();
        ctx.moveTo(x, y);

        for (var i = 1, n = this.nodes.length - 2; i < n; i++) {

            a = this.nodes[i];
            b = this.nodes[i + 1];
            x = (a.x + b.x) * 0.5;
            y = (a.y + b.y) * 0.5;

            ctx.quadraticCurveTo(a.x, a.y, x, y);
        }

        a = this.nodes[i];
        b = this.nodes[i + 1];

        ctx.quadraticCurveTo(a.x, a.y, b.x, b.y);
        ctx.stroke();
        ctx.closePath();
    }
}
