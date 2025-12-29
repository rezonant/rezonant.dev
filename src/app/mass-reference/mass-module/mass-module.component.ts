import { Component, computed, inject, input } from "@angular/core";
import { MassReferenceService } from "../mass-reference.service";

@Component({
    selector: 'rez-mass-module',
    template: `
        @if (notFound()) {
            <rez-not-found />
        } @else {
            <h1>
                <a routerLink="/reference/unreal/mass">Mass Reference</a>
                &raquo;
                {{ module().name || module().id }}
            </h1>

            @if (module()) {
                <rez-mass-element-list [module]="moduleId()" name="Tags" [elements]="module().tags" />
                <rez-mass-element-list [module]="moduleId()" name="Fragments" [elements]="module().fragments" />
                <rez-mass-element-list [module]="moduleId()" name="Traits" [elements]="module().traits" />
                <rez-mass-element-list [module]="moduleId()" name="Processors" [elements]="module().processors" />
            }
        }
    `,
    styles: ``,
    standalone: false
})
export class MassModuleComponent {
    private ref = inject(MassReferenceService);

    moduleId = input.required<string>();
    notFound = computed(() => !this.ref.getModule(this.moduleId()));
    module = computed(() => this.ref.getModule(this.moduleId())!);
}
