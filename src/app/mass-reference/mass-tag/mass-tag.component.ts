import { Component, input } from "@angular/core";
import { MassFragment, MassTag } from "../mass-types";

@Component({
    selector: 'rez-mass-tag',
    template: `
        <!-- TODO -->
    `,
    standalone: false
})
export class MassTagComponent {
    moduleId = input.required<string>();
    tag = input.required<MassTag>();
}
