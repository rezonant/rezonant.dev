import { Component, computed, inject, input } from "@angular/core";
import { MassReferenceService } from "../mass-reference.service";

@Component({
    selector: 'rez-mass-element-subclasses',
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
                    @switch (element().type) {
                        @case ('trait') {
                            <mat-icon>tag</mat-icon>
                        } @case ('processor') {
                            <mat-icon>memory</mat-icon>
                        } @case ('tag') {
                            <mat-icon>sell</mat-icon>
                        } @case ('fragment') {
                            <mat-icon>data_object</mat-icon>
                        }
                    }
                    {{ id() }}
                </a>
                &raquo;
                <mat-icon>category</mat-icon>
                Subclasses
            </h1>

            @for (subclass of subclasses(); track subclass.id) {
                <div>
                    <a routerLink="/reference/unreal/mass/{{ subclass.module }}/{{ subclass.id }}">
                        {{ subclass.id }}
                    </a>
                </div>
            }
        }
    `,
    styles: `
        .fact-bar {
            display: flex;
        }


        mat-icon {
            vertical-align: middle;
        }

        h1:has(+ .display-name) {
            margin-bottom: 0;
        }
    `,
    standalone: false
})
export class MassElementSubclassesComponent {
    private ref = inject(MassReferenceService);

    asAny = (t: any) => t;
    moduleId = input.required<string>();
    id = input.required<string>();

    sourceUrl = computed(() => `/reference/unreal/mass/${this.moduleId()}/${this.id()}/source`);

    notFound = computed(() => !this.ref.getElement(this.moduleId(), this.id()));
    module = computed(() => this.ref.getModule(this.moduleId())!);
    element = computed(() => this.ref.getElement(this.moduleId(), this.id())!);
    subclasses = computed(() => this.ref.getSubclasses({ id: this.id(), module: this.moduleId() }));
}
