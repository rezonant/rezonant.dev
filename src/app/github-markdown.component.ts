import { Component, Input, Output } from "@angular/core";
import { environment } from "./environment";
import { BehaviorSubject } from "rxjs";

@Component({
    selector: `rez-github-markdown`,
    template: `
        @if (readme) {
            <div class="markdown" [innerHTML]="readme | markdownToHtml: { urlTransformer: urlTransformer } | trustHtml"></div>
            @if (showGithubLink) {
                <footer>
                    <a [href]="githubUrl">View source on Github</a>
                </footer>
            }
        }
    `,
    styles: [
        `
        .markdown ::ng-deep {
            img {
                max-width: 100%;
            }
        }

        footer {
            display: block;
            border-top: 1px solid #ff7676;
            padding-top: 1em;
            margin-top: 2em;
            text-align: center;

            a {
                opacity: 0.7;
                font-size: 80%;
            }
        }
        `
    ]
})
export class GithubMarkdownComponent {
    constructor() { }

    private _path!: string;
    private _project!: string;
    private _branch = 'main';

    @Input() showGithubLink = true;
    @Input() urlTransformer?: (url: string) => string;

    /**
     * If true, *this* is the repository being queried. In that case, the markdown is fetched from the local
     * web server
     */
    @Input() self = false;
    @Input() selfPrefix = '/public';

    @Input() consumeTitle = false;

    private _titleChange = new BehaviorSubject<string | undefined>(undefined);
    @Output() titleChange = this._titleChange.asObservable();

    @Input({ required: true }) get path() {
        return this._path;
    }

    set path(value) {
        this._path = value;
        setTimeout(() => {
            this.reload();
        });
    }

    /**
     * The Github project to look in, must be organizdation/repo
     */
    @Input({ required: true }) get project() { return this._project; }
    set project(value) {
        this._project = value;
        setTimeout(() => this.reload());
    }

    /**
     * The Github branch to look in, defaults to 'main'
     */
    @Input() get branch() { return this._branch; }
    set branch(value) {
        this._project = value;
        setTimeout(() => this.reload());
    }

    get url() {
        if (this.self && environment.name === 'development') {
            let path = '/' + this.path.replace(/^\/*/, '');
            if (path.startsWith(this.selfPrefix)) {
                path = path.slice(this.selfPrefix.length);
            }
            return `${environment.baseUrl}/${path}`;
        }

        return `https://raw.githubusercontent.com/${this.project}/${this.branch}/${this.path}`;
    }

    get githubUrl() {
        return `https://github.com/${this.project}/blob/${this.branch}/${this.path}`;
    }

    @Input()
    replacements: [string, string][] = [];

    async reload() {
        let response = await fetch(this.url);
        let readme = await response.text();

        if (this.consumeTitle) {
            let titleRegex = /^# (.*)$/m;
            let titleMatch = readme.match(titleRegex);
            if (titleMatch) {
                this._titleChange.next(titleMatch[1]);
                readme = readme.replace(titleRegex, '');
            }
        }

        for (let [from, to] of this.replacements) {
            readme = readme.replace(new RegExp(from, 'gms'), to);
        }

        this.readme = readme;
    }

    readme?: string;
}
