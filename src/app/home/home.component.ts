import { isPlatformServer } from '@angular/common';
import { Component, ElementRef, inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { DoodleContext, DoodleUtilities, orbitals, rain, DoodleFactory, scribble, sine, snow, starfield, tendrils, DoodleRenderer, transition } from '../doodles';

const DOODLES = [
    starfield,
    rain,
    snow,
    orbitals
];

@Component({
    selector: 'rez-home',
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {
    private platform = inject(PLATFORM_ID);

    @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
    ngAfterViewInit() {
        if (isPlatformServer(this.platform))
            return;


        this.doodlePlayer = new DoodlePlayer(this.canvas.nativeElement);
        this.pickDoodle();
        this.doodlePlayer.start();

        clearInterval(this.doodlePickTimeout);
        this.doodlePickTimeout = setInterval(() => this.pickDoodle(), 10_000);
    }

    private doodlePickTimeout: any;

    private doodlePlayer!: DoodlePlayer;
    private doodleIndex = 0;

    private chosenDoodleFactory!: DoodleFactory;

    private pickDoodle() {
        let doodle: DoodleFactory;

        doodle = DOODLES[Math.random() * DOODLES.length | 0];
        //doodle = DOODLES[this.doodleIndex++ % DOODLES.length];

        if (doodle !== this.chosenDoodleFactory) {
            this.chosenDoodleFactory = doodle;
            this.doodlePlayer.setDoodle(doodle);
            setTimeout(() => this.doodleName = doodle.name);
        }
    }

    doodleName: string = 'Unknown';
}

export class DoodlePlayer {
    constructor(readonly canvas: HTMLCanvasElement) {
        let context = canvas.getContext('2d') as DoodleContext;
        context.doodle = new DoodleUtilities(context);
        if (!context)
            throw new Error(`Failed to acquire canvas context`);
        this.context = context;

        // Initialize canvas size
        let size = canvas.getBoundingClientRect();
        canvas.width = size.width;
        canvas.height = size.height;

        // Fill background
        context.fillStyle = canvas.computedStyleMap().get('--main-background')?.toString()!;
        context.fillRect(0, 0, size.width, size.height);
    }

    readonly context: DoodleContext;
    private renderer?: DoodleRenderer;

    setDoodle(rendererFactory: DoodleFactory) {
        if (this.renderer) {
            this.renderer = transition(this.renderer, rendererFactory(this.context))(this.context);
        } else {
            this.renderer = rendererFactory(this.context);
        }

    }

    private updateCanvasSize() {
        let size = this.canvas.getBoundingClientRect();
        if ((size.width | 0) !== this.canvas.width || (size.height | 0) !== this.canvas.height) {
            console.log(`============== RESIZE =================`);
            this.canvas.width = size.width;
            this.canvas.height = size.height;
        }
    }

    start() {
        let lastTime = Date.now();
        const loop = () => {
            // Schedule the next frame early
            requestAnimationFrame(loop);

            // Compute delta time
            let newTime = Date.now();
            let deltaTime = (newTime - lastTime) / 1000;
            lastTime = newTime;

            // Ensure canvas size is correct
            this.updateCanvasSize();

            // Render
            this.renderer?.(deltaTime);
        };

        loop();
    }

}
