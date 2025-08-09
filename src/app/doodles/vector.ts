
export interface Vector {
    x: number;
    y: number;
}

export function radiansToDegrees(radians: number) {
    return radians * (180 / Math.PI);
}

export function degreesToRadians(degrees: number) {
    return degrees * (Math.PI / 180);
}

export function randomRange(min: number, max: number) {
    return min + Math.random() * (max - min);
}

export function randomRangeInt(min: number, max: number) {
    return Math.random() * (max - min + 1) + min | 0
}

function zeroPad(n: number | string, digits = 2) {
    let str = String(n);
    while (str.length < digits)
        str = `0${str}`;
    return str;
}

export function clamp(value: number, min: number = 0, max: number = 1) {
    return Math.max(min, Math.min(value, max));
}

export class Color {
    constructor(
        public red: number,
        public green: number,
        public blue: number,
        public alpha: number
    ){
    }

    get redByte() { return clamp(this.red) * 255 | 0; }
    get greenByte() { return clamp(this.green) * 255 | 0; }
    get blueByte() { return clamp(this.blue) * 255 | 0; }
    get alphaByte() { return clamp(this.alpha) * 255 | 0; }

    toHex() {
        return `#` 
            + `${zeroPad(this.redByte.toString(16))}`
            + `${zeroPad(this.greenByte.toString(16))}`
            + `${zeroPad(this.blueByte.toString(16))}`
            + `${zeroPad(this.alphaByte.toString(16))}`
        ;
    }
    
    drawBackground(context: CanvasRenderingContext2D) {
        let savedFill = context.fillStyle;
        context.fillStyle = this.toHex();
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        context.fillStyle = savedFill;
    }

    static parse(str: string) {
        if (str.startsWith('#')) {
            return this.fromHex(str);
        } else if (str.startsWith('rgb(')) {
            let parts = str.replace(/^rgb\(/, '').replace(/\)$/, '').split(',');
            return new Color(
                Number(parts[0].trim()) / 255, 
                Number(parts[1].trim()) / 255, 
                Number(parts[2].trim()) / 255, 
                1.0
            );
        } else if (str.startsWith('rgba')) {
            let parts = str.replace(/^rgba\(/, '').replace(/\)$/, '').split(',');
            return new Color(
                Number(parts[0].trim()) / 255, 
                Number(parts[1].trim()) / 255, 
                Number(parts[2].trim()) / 255, 
                Number(parts[3].trim()) / 255
            );
        } else {
            throw new Error(`Unsupported color format: '${str}'`);
        }
    }

    static fromHex(hex: string) {
        if (hex.startsWith('#'))
            hex = hex.slice(1);

        let match = hex.match(/(..)(..)(..)(..)?/);
        if (!match)
            throw new Error(`Invalid hex code: ${hex}`);

        return new Color(
            Number.parseInt(match[1], 16) / 255.0, 
            Number.parseInt(match[2], 16) / 255.0, 
            Number.parseInt(match[3], 16) / 255.0, 
            Number.parseInt(match[4] || 'FF', 16) / 255.0
        );
    }

    withAlpha(alpha: number) {
        return new Color(this.red, this.green, this.blue, alpha);
    }
}

export class Vector {
    constructor(public x: number, public y: number) {}

    static zero() { return new Vector(0, 0); }
    static one() { return new Vector(1, 1); }

    static random(maxX: number, maxY: number) {
        return new Vector(Math.random() * maxX, Math.random() * maxY);
    }

    set(x: number, y: number) {
        this.x = x;
        this.y = y;
        return this;
    }

    clone() {
        return new Vector(this.x, this.y);
    }

    subtract(b: Vector): Vector {
        return new Vector(this.x - b.x, this.y - b.y);
    }
    
    add(b: Vector): Vector {
        return new Vector(this.x + b.x, this.y + b.y);
    }
    
    scale(s: number): Vector {
        return new Vector(this.x * s, this.y * s);
    }
    
    pow(exp: number): Vector {
        return new Vector(this.x ** exp, this.y ** exp);
    }
    
    distance(b: Vector): number {
        return Math.sqrt((b.x - this.x) ** 2 + (b.y - this.y) ** 2);
    }
    
    get length() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
    
    normalize() {
        return this.scale(1 / this.length);
    }
    
    rotateDeg(angle: number) {
        return this.rotate(degreesToRadians(angle));
    }

    rotate(angle: number) {
        return new Vector(
            Math.cos(angle) * this.x - Math.sin(angle) * this.y, 
            Math.sin(angle) * this.x + Math.cos(angle) * this.y
        );
    }
    
    dot(b: Vector) {
        return this.x * b.x + this.y * b.y;
    }
    
    angle(b: Vector) {
        let value = Math.atan2(b.y, b.x) - Math.atan2(this.y, this.x);
        if (value > Math.PI)
            value -= 2 * Math.PI;
        else if (value <= -Math.PI)
            value += 2 * Math.PI;
    
        return value;
    }

    drawPoint(context: CanvasRenderingContext2D, size = 10) {
        context!.strokeRect(this.x - size, this.y - size, size, size);
    }
}