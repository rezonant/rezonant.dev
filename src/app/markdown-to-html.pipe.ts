import { Pipe, PipeTransform } from '@angular/core';
import * as marked from 'marked';
import hljs from 'highlight.js';
import { markedHighlight } from 'marked-highlight';
import { wrapMethod } from './utils';

export interface MarkdownToHtmlPipeOptions {
    urlTransformer?: (url: string) => string
}

@Pipe({
  name: 'markdownToHtml'
})
export class MarkdownToHtmlPipe implements PipeTransform {
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

    let markdown = new marked.Marked(
      markedHighlight({
        emptyLangClass: 'hljs',
        langPrefix: 'hljs language-',
        highlight(code, lang, info) {
          const language = hljs.getLanguage(lang) ? lang : 'plaintext';
          return hljs.highlight(code, { language }).value;
        }
      })
    );

    return markdown.parse(value, { renderer: renderer }) as string;
  }
}
