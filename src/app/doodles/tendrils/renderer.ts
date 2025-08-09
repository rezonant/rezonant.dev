import { Oscillator } from "./oscillator";
import { Tendril } from "./tendril";
import { TendrilRendererOptions } from "./options";
import { Subject, Observable } from "rxjs";
import { Vector } from "../vector";
import { DoodleFactory } from "../types";

export const tendrils: DoodleFactory = context => {
    let canvas = context.canvas;
    let started = false;
    let hue = new Oscillator({
        phase: Math.random() * Math.PI * 2,
        amplitude: 85,
        frequency: 0.0015,
        offset: 285
    });
    var settings = {
        debug: false,
        friction: 0.5,
        trails: 10,
        size: 50,
        dampening: 0.1,
        tension: 0.98,
        backgroundColor: 'transparent'
    };

    let target = new Vector(
        Math.random() * canvas.width, 
        Math.random() * canvas.height
    );

    // Set up the tendrils
    let tendrils: Tendril[] = [];
    for (var i = 0; i < settings.trails; i++) {
        tendrils.push(new Tendril(
            settings,
            context,
            target,
            i
        ));
    }

    let newTarget = Vector.zero();
    let timeSpent = 0;

    canvas.addEventListener('mousemove', event => {
        target.x = event.offsetX;
        target.y = event.offsetY;
    });

    return deltaTime => {
        started = true;
        timeSpent += deltaTime;

        if (!canvas.offsetParent)
            return;

        // if (timeSpent > 2) {
        //     newTarget.x = Math.random() * canvas.width;
        //     newTarget.y = Math.random() * canvas.height;
        //     timeSpent = 0;
        // }
        
        // target.x += (newTarget.x - target.x) * 0.1;
        // target.y += (newTarget.y - target.y) * 0.1;

        context.globalCompositeOperation = 'source-over';

        if (settings.backgroundColor === 'transparent') {
            context.clearRect(0, 0, canvas.width, canvas.height);
        } else {
            context.fillStyle = settings.backgroundColor || 'black';
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
        context.globalCompositeOperation = 'lighter';
        context.strokeStyle = 'hsla(' + Math.round(hue.update()) + ',90%,50%,0.25)';
        context.lineWidth = 1;

        for (let tendril of tendrils) {
            tendril.update();
            tendril.draw();
        }
    };
};

export class TendrilRenderer {
    constructor(
        readonly canvas: HTMLCanvasElement, 
        readonly settings: TendrilRendererOptions
    ) {
        this.context = canvas.getContext('2d')!;
        this.hue = new Oscillator({
            phase: Math.random() * Math.PI * 2,
            amplitude: 85,
            frequency: 0.0015,
            offset: 285
        });
    }

    private _resized = new Subject<void>();
    private context: CanvasRenderingContext2D;
    private tendrils: Tendril[] = [];
    private target!: Vector;
    private started = false;
    private hue: Oscillator;

    get resized() : Observable<void> {
        return this._resized;
    }
    
    start() {
        this.target = new Vector(
            Math.random() * this.canvas.width, 
            Math.random() * this.canvas.height
        );

        this.reset();
        this.render();
    }

    changeTarget(x: number, y: number, jump = false) {
        this.target.set(x, y);

        if (jump) {
            for (let tendril of this.tendrils)
                tendril.setLocation(x, y);
        }
    }

    private render() {
        let canvas = this.canvas;

        let sizeMismatch = !this.started
            || canvas.width !== canvas.clientWidth
            || canvas.height !== canvas.clientHeight
            ;

        if (sizeMismatch) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            this.reset();
        }

        this.started = true;

        if (!canvas.offsetParent)
            return;

        let ctx = this.context;
        ctx.globalCompositeOperation = 'source-over';

        if (this.settings.backgroundColor === 'transparent') {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = this.settings.backgroundColor || 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = 'hsla(' + Math.round(this.hue.update()) + ',90%,50%,0.25)';
        ctx.lineWidth = 1;

        for (var i = 0, tendril; i < this.settings.trails; i++) {
            tendril = this.tendrils[i];
            tendril.update();
            tendril.draw();
        }

        requestAnimationFrame(() => this.render());
    }

    reset() {

        // Set up the tendrils
        this.tendrils = [];
        for (var i = 0; i < this.settings.trails; i++) {
            this.tendrils.push(new Tendril(
                this.settings,
                this.context,
                this.target,
                i
            ));
        }

        this._resized.next();
    }
}