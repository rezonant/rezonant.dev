import { Component, input } from "@angular/core";
import { MassProcessor } from "../mass-types";

@Component({
    selector: 'rez-mass-processor',
    template: `
        <rez-mass-element-list [module]="moduleId()" name="Requires Fragments" [elements]="processor().requiresFragments" />
        <rez-mass-element-list [module]="moduleId()" name="Related Traits" [elements]="processor().relatedTraits" />
    `,
    styles: ``,
    standalone: false
})
export class MassProcessorComponent {
    moduleId = input.required<string>();
    processor = input.required<MassProcessor>();
}
