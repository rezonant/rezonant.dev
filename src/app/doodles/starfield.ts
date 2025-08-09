import { DoodleFactory } from './types';

interface Star {
    x: number;
    y: number;
    z: number;
    px: number;
    py: number;
}

export const starfield: DoodleFactory = (context) => {
    const canvas = context.canvas;
    let speed: number = 0.1;
    let centerX = canvas.width / 2;
    let centerY = canvas.height / 2;

    let highDensityUnits = 1000;
    let units = highDensityUnits;
    let stars: Star[] = [];
    let warpZ = 12;
    let cycle = 0;

    // function to reset a star object
    function resetStar(a: Star) {
        a.x = (Math.random() * canvas.width - (canvas.width * 0.5)) * warpZ;
        a.y = (Math.random() * canvas.height - (canvas.height * 0.5)) * warpZ;
        a.z = warpZ;
        a.px = 0;
        a.py = 0;
    }

    // initial star setup
    for (let i = 0, n; i < units; i++) {
        n = {} as any;
        resetStar(n);
        stars.push(n);
    }

    let currentTime = 0;
    return deltaTime => {
        currentTime += deltaTime;
        speed = (1 + Math.sin(currentTime / 2)) / 2 * 0.5;

        context.globalAlpha = 0.25 - 0.15 * Math.max(0, (speed - 0.01) / 0.5);
        //context.doodle.backgroundColor.withAlpha(1).drawBackground(context);
        context.clearRect(0, 0, canvas.width, canvas.height);

        // mouse position to head towards
        let cx = (centerX - canvas.width / 2) + (canvas.width / 2),
            cy = (centerY - canvas.height / 2) + (canvas.height / 2);

        // update all stars
        let sat = Math.floor(speed * 500);       // Z range 0.01 -> 0.5
        if (sat > 100)
            sat = 100;

        for (let i = 0; i < units; i++) {
            let star = stars[i],            // the star
                xx = star.x / star.z,          // star position
                yy = star.y / star.z,
                e = (1.0 / star.z + 1) * 2;   // size i.e. z

            if (star.px !== 0) {
                // hsl colour from a sine wave

                context.strokeStyle = "hsl(" + ((cycle * i) % 360) + "," + sat + "%,80%)";
                context.lineWidth = e;
                context.beginPath();
                context.moveTo(xx + cx, yy + cy);
                context.lineTo(star.px + cx, star.py + cy);
                context.stroke();
            }

            // update star position values with new settings
            star.px = xx;
            star.py = yy;
            star.z -= speed;

            // reset when star is out of the view field
            if (star.z < speed || star.px > canvas.width || star.py > canvas.height) {
                // reset star
                resetStar(star);
            }
        }

        // colour cycle sinewave rotation
        cycle += 0.01;
    };
}
