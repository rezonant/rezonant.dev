import { Pipe, PipeTransform } from '@angular/core';
import * as marked from 'marked';
import hljs from 'highlight.js';
import { markedHighlight } from 'marked-highlight';
import markedAlert from 'marked-alert';
import { wrapMethod } from './utils';
import * as yaml from 'yaml';

export interface MarkdownToHtmlPipeOptions {
    urlTransformer?: (url: string) => string
}

interface DiscordMessage {
    link: string;
    author: string;
    content: string;
    date: string;
}

@Pipe({
  name: 'markdownToHtml'
})
export class MarkdownToHtmlPipe implements PipeTransform {
  transform(value: string, options?: MarkdownToHtmlPipeOptions): string {
    if (!value)
      return '';

    function renderError(message: string) {
        return `<pre class="error">${message}</pre>`;
    }

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

            if (object.$type === 'discord') {
                let message: DiscordMessage = object;

                if (!message) {
                    return renderError(`Could not parse this Discord message: '${token.text}'`);
                }

                if (!message.author || !message.date || !message.content) {
                    return renderError(`Discord message is missing required fields. Message is ${JSON.stringify(message, undefined, 2)}`);
                }

                return `
                    <blockquote class="discord-message">
                        <div class="byline">
                            <div class="author">${message.author}</div>
                            <time>${message.date}</time>
                        </div>
                        <div class="discord-message-content">
                            ${message.content.replace(/\n/g, '<br/>')}
                        </div>
                        ${ message.link ?
                            `
                                <a class="discord-link" href="${message.link}">View original message</a>
                            ` : `` }
                    </blockquote>
                `;
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
