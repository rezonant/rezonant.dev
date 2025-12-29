import { Injectable } from "@angular/core";
import { renderDiscordMessage } from "./discord-message.renderer";

export interface RendererContext {
    resolveUrl: (url: string) => string;
}

@Injectable()
export class RichContentService {
    private renderers = new Map<string, (object: any, context: RendererContext) => string>();

    constructor() {
        this.addRenderer('discord', renderDiscordMessage);
    }

    addRenderer<T>(type: string, renderer: (object: T, context: RendererContext) => string) {
        this.renderers.set(type, renderer);
    }

    render(object: any, context?: Partial<RendererContext>) {
        context ??= {};
        context.resolveUrl ??= url => url;

        return this.renderers.get(object.$type)?.(object, { resolveUrl: url => url, ...context })
            ?? renderError(`No renderer for type '${object.$type}'`, object);
    }
}

export function renderError(message: string, inputObject: any) {
    return `<pre class="error">${message}\nObject being rendered:\n${JSON.stringify(inputObject, undefined, 2)}</pre>`;
}

export function forEach<T>(array: T[], renderer: (t: T) => string): string {
    return array.map(renderer).join('');
}
