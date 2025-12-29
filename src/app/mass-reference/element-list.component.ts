import { Component, computed, inject, input } from "@angular/core";
import { MassElement, MassElementRef } from "./mass-types";
import { MassReferenceService } from "./mass-reference.service";

interface MinimalElement {
    id: string;
    module?: string;
}

@Component({
    selector: `rez-mass-element-list`,
    template: `
        @if (elements()) {
            <div class="element-list-heading">{{ name() }}</div>
            <ul>
                @for (element of elements(); track element.id) {
                    @let metadata = metadataFor(element);

                    <li [class.exists]="metadata.exists">
                        <div class="type-tag">
                            @switch (metadata.type) {
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
                        </div>
                        <a routerLink="/reference/unreal/mass/{{ element.module || module() }}/{{ element.id }}">
                            {{ element.id }}
                        </a>

                        @if (!metadata.exists) {
                            <div class="note-tag">
                                <mat-icon matTooltip="Not documented">question_mark</mat-icon>
                            </div>
                        } @else if (metadata.stub) {
                            <div class="note-tag">
                                <mat-icon matTooltip="This is a stub">broken_image</mat-icon>
                            </div>

                        }

                        @if (module()) {
                            <div class="note-tag">
                                <mat-icon matTooltip="Part of module '{{module()}}'">
                                    group_work
                                </mat-icon>
                            </div>
                        }

                        @for (tag of tagsFor(element); track tag) {
                            <div class="tag">{{ tag }}</div>
                        }
                    </li>
                } @empty {
                    <li>None</li>
                }
            </ul>
        }
    `,
    styles: `
        .element-list-heading {
            font-weight: bold;
        }

        .type-tag {
            display: inline-block;
            vertical-align: middle;
        }

        .note-tag {
            display: inline-block;
            vertical-align: middle;

        }

        li:not(.exists) {
            opacity: 0.5;
        }
    `
})
export class MassElementListComponent {
    private ref = inject(MassReferenceService);

    name = input.required<string>();
    module = input<string>();
    elements = input<MinimalElement[]>();

    metadataFor(element: MinimalElement) {
        let moduleId = element.module || this.module();
        let exists = false;
        let type: string | undefined;
        let stub = false;

        if (moduleId) {
            let metadata = this.ref.getElement(moduleId, element.id);
            if (metadata) {
                exists = true;
                type = metadata.type;
                stub = metadata.stub ?? false;
            }
        }


        return { exists, type, stub };
    }

    tagsFor(element: MinimalElement) {
        return Object.keys(element).filter(x => !['module', 'id'].includes(x) && (element as any)[x] === true);
    }
}
