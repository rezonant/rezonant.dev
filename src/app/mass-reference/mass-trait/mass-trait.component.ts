import { Component, input } from "@angular/core";
import { MassTrait } from "../mass-types";

@Component({
    selector: 'rez-mass-trait',
    template: `
        <blockquote>
            <rez-mass-element-list [module]="moduleId()" name="Required Fragments" [elements]="trait().requiredFragments" />
            <rez-mass-element-list [module]="moduleId()" name="Adds Fragments" [elements]="trait().addsFragments" />
            <rez-mass-element-list [module]="moduleId()" name="Triggers Processors" [elements]="trait().triggersProcessors" />
        </blockquote>
    `,
    standalone: false
})
export class MassTraitComponent {
    moduleId = input.required<string>();
    trait = input.required<MassTrait>();
}
