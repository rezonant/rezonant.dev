import { inject, Pipe, PipeTransform } from '@angular/core';
import * as marked from 'marked';
import hljs from 'highlight.js';
import { markedHighlight } from 'marked-highlight';
import markedAlert from 'marked-alert';
import { wrapMethod } from './utils';
import * as yaml from 'yaml';
import { renderError, RichContentService } from './rich-content.service';

export interface MarkdownToHtmlPipeOptions {
    urlTransformer?: (url: string) => string
}

@Pipe({
    name: 'markdownToHtml'
})
export class MarkdownToHtmlPipe implements PipeTransform {
    private richContent = inject(RichContentService);
    transform(value: string, options?: MarkdownToHtmlPipeOptions): string {
        if (!value)
            return '';

        let renderer = new marked.Renderer();

        renderer.link = wrapMethod(renderer.link, ($, token) => {
            let { href, title, text } = token;
            if (options?.urlTransformer)
                token.href = options.urlTransformer(token.href);
            return $(token);
        });

        renderer.image = wrapMethod(renderer.image, ($, token) => {
            token.href = token.href.replace(/^\/public/, '');
            return $(token);
        });

        renderer.code = wrapMethod(renderer.code, ($, token) => {

            let rawContent = token.raw.trim().replace(/^```.*\n/, '').replace(/```$/, '');
            if (token.lang && ['yaml', 'json'].includes(token.lang)) {

                let object: any;

                if (token.lang === 'json') {
                    try {
                        object = JSON.parse(rawContent);
                    } catch (e: any) {
                        console.log(`Failed to parse JSON snippet in Markdown: ${e.stack}`);
                        return $(token);
                    }
                } else if (token.lang === 'yaml') {
                    try {
                        object = yaml.parse(rawContent);
                    } catch (e: any) {
                        console.log(`Failed to parse YAML snippet in Markdown: ${e.stack}`);
                        return $(token);
                    }
                }

                if (object.$type) {
                    return this.richContent.render(object, { resolveUrl: options?.urlTransformer });
                }
            }
            return $(token);
        });

        let markdown = new marked.Marked(
            markedHighlight({
                emptyLangClass: 'hljs',
                langPrefix: 'hljs language-',
                highlight(code, lang, info) {
                    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                    return hljs.highlight(code, { language }).value;
                }
            }),
            markedAlert()
        );

        return markdown.parse(value, { renderer: renderer }) as string;
    }
}
