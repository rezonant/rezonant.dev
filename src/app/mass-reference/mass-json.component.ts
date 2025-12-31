import { Component, inject } from "@angular/core";
import { MassReferenceService } from "./mass-reference.service";

@Component({
    selector: 'rez-massref-json',
    template: `
        <h1>Source</h1>
        <p>The source code for this reference is <a href="{{githubUrl}}" target="_blank">GitHub</a>.

        <h2>JSON</h2>

        Find below the complete JSON data for the reference, all {{ json.length | number }} bytes of it.
        If you find that more useful.


        <pre>{{ json }}</pre>
    `,
    styles: `
        pre {
            width: 100%;
            max-width: 100%;
            overflow-x: auto;
        }
    `
})
export class MassJsonComponent {
    private ref = inject(MassReferenceService);
    data = this.ref.getPlugins();
    json = JSON.stringify(this.data, undefined, 4);
    githubUrl = `https://github.com/rezonant/rezonant.dev/blob/main/src/app/mass-reference/mass-reference-data.ts`;

}
