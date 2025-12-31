import { Component, computed, inject, input } from "@angular/core";
import { MassReferenceService } from "../mass-reference.service";
import { MassReferenceShellComponent } from "../mass-reference-shell.component";

@Component({
    selector: 'rez-mass-element-source',
    template: `
        @if (notFound()) {
            <rez-not-found title="Element not found" message="">
                <div>
                    It may not be covered by this reference just yet.<br/>
                    Consider <a href="https://github.com/rezonant/rezonant.dev">sending a pull request</a>
                </div>
            </rez-not-found>
        } @else {
            <h1>
                <a routerLink="/reference/unreal/mass/{{ module().id }}/{{ id() }}">
                {{ id() }}
                </a>
                &raquo;
                Source
            </h1>

            Here's the raw data for this specific element.

            <pre>{{ element() | json }}</pre>
        }
    `,
    standalone: false
})
export class MassElementJsonComponent {
    private shell = inject(MassReferenceShellComponent);
    private ref = inject(MassReferenceService);

    asAny = (t: any) => t;
    moduleId = input.required<string>();
    id = input.required<string>();

    notFound = computed(() => !this.ref.getElement(this.moduleId(), this.id()));
    module = computed(() => this.ref.getModule(this.moduleId())!);
    element = computed(() => this.ref.getElement(this.moduleId(), this.id())!);
    subclasses = computed(() => this.ref.getSubclasses({ id: this.id(), module: this.moduleId() }));
}
