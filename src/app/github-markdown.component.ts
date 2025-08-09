import { Component, Input } from "@angular/core";

@Component({
    selector: `rez-github-markdown`,
    template: `
        @if (readme) {
            <div class="markdown" [innerHTML]="readme | markdownToHtml | trustHtml"></div>
            @if (showGithubLink) {
                <footer>
                    <a [href]="githubUrl">View on Github</a>
                </footer>
            }
        }
    `,
    styles: [
        `
        footer { text-align: center;}
        `
    ]
})
export class GithubMarkdownComponent {
    constructor() { }

    private _path!: string;
    private _project!: string;
    private _branch = 'main';

    @Input() showGithubLink = true;

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

        for (let [from, to] of this.replacements) {
            console.log(`FROM: '${from}'`);
            console.log(`  TO: '${to}'`);

            readme = readme.replace(new RegExp(from, 'gms'), to);
        }

        //console.log(readme);

        (window as any).readme = readme;

        this.readme = readme;
    }

    readme?: string;
}
