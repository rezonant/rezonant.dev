import { Component, input } from "@angular/core";
import { MassFragment } from "../mass-types";

@Component({
    selector: 'rez-mass-fragment',
    template: `
        <blockquote>
            <strong>Properties</strong>
            <ul>
                @for (prop of fragment().properties; track prop.name) {
                    <li>
                        @if ((prop.specifiers?.length ?? 0) > 0) {
                            <div>
                                <code>UPROPERTY({{ prop.specifiers!.join(', ') }})</code>
                            </div>
                        }
                        <code>{{ prop.type }} {{ prop.name }}</code>
                    </li>
                } @empty {
                    <li>None</li>
                }
            </ul>
        </blockquote>
    `,
    standalone: false
})
export class MassFragmentComponent {
    moduleId = input.required<string>();
    fragment = input.required<MassFragment>();
}
