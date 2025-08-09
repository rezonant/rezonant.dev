import { Color } from "./vector";

export class DoodleUtilities {
    constructor(readonly context: CanvasRenderingContext2D) {
    }
    
    get canvas() { return this.context.canvas; }

    get backgroundColor() {
        return Color.parse(this.canvas.computedStyleMap().get('--main-background')?.toString()!);
    }

    drawBackgroundColor(opacity = 1) {
        this.backgroundColor.withAlpha(opacity).drawBackground(this.context);
    }
}

export type DoodleContext = CanvasRenderingContext2D & { 
    doodle: DoodleUtilities;
};

export type DoodleRenderer = (deltaTime: number) => void;
export type DoodleFactory = (context: DoodleContext) => DoodleRenderer;
