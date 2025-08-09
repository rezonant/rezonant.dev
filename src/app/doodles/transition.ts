import { DoodleFactory, DoodleRenderer } from "./types";
import { clamp, Color } from "./vector";

export const transition = (from: DoodleRenderer, to: DoodleRenderer, duration = 1000): DoodleFactory => {
    return context => {
        let startTime = Date.now();
        let finished = false;

        let transitionColor = context.doodle.backgroundColor;
        let halfwayPoint = false;
        return (deltaTime: number) => {
            if (finished)
                return to(deltaTime);

            let progress = clamp((Date.now() - startTime) / duration);
            if (progress >= 1)
                finished = true;

            if (progress < 0.5) {
                from(deltaTime);
                context.globalAlpha = 1;
                transitionColor.withAlpha(progress / 0.5).drawBackground(context);
            } else {
                if (!halfwayPoint) {
                    transitionColor.withAlpha(1).drawBackground(context);
                    halfwayPoint = true;
                }
                to(deltaTime);
                context.globalAlpha = 1;
                transitionColor.withAlpha(1 - ((progress - 0.5) / 0.5)).drawBackground(context);
            }
        };
    }
}