import { Component, computed, inject, input } from "@angular/core";
import { MassElement, MassElementRef } from "./mass-types";
import { MassReferenceService } from "./mass-reference.service";

interface MinimalElement {
    id: string;
    module?: string;
    remark?: string;
    summary?: string;
    access?: 'None' | 'ReadOnly' | 'ReadWrite';
    presence?: 'All' | 'Any' | 'None' | 'Optional';
}

@Component({
    selector: `rez-mass-element-list`,
    template: `
        @if (elements()) {
            <div class="element-list-heading">{{ name() }}</div>
            <ul>
                <!-- Note: Tracks object here because duplicates are possible. -->
                @for (element of elements(); track element) {
                    @let metadata = metadataFor(element);
                    <li [class.exists]="metadata.exists">
                        @if (element.access && metadata?.type !== 'tag') {
                            <div class="type-tag">
                                @switch (element.access) {
                                    @case ('None') {
                                        <mat-icon matTooltip="Query only, no access">search</mat-icon>
                                    }
                                    @case ('ReadOnly') {
                                        <mat-icon matTooltip="Read-only access">input</mat-icon>
                                    }
                                    @case ('ReadWrite') {
                                        <mat-icon matTooltip="Read/write access">output</mat-icon>
                                    }
                                }
                            </div>
                        }
                        @if (element.presence) {
                            <div class="type-tag">
                                @switch (element.presence) {
                                    @case ('None') {
                                        <mat-icon matTooltip="Entity must not contain this element">disabled_by_default</mat-icon>
                                    }
                                    @case ('All') {
                                        <mat-icon matTooltip="Entity must contain this element">select_all</mat-icon>
                                    }
                                    @case ('Any') {
                                        <mat-icon matTooltip="Entity must contain this or another alternative element">alt_route</mat-icon>
                                    }
                                    @case ('Optional') {
                                        <mat-icon matTooltip="Entity may optionally contain this element">border_style</mat-icon>
                                    }
                                }
                            </div>
                        }
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

                        @if (module()) {
                            <mat-icon class="note-tag" matTooltip="Part of module '{{module()}}'">
                                group_work
                            </mat-icon>
                        }

                        @if (!metadata.exists) {
                            <mat-icon class="note-tag" matTooltip="Not documented">question_mark</mat-icon>
                        }

                        @for (tag of tagsFor(element); track tag) {
                            @if (tag === 'requiresMutatingWorldAccess') {
                                <mat-icon class="note-tag" matTooltip="Mutates UWorld">public</mat-icon>
                            } @else if (tag === 'requiresGameThread') {
                                <mat-icon class="note-tag" matTooltip="Runs on Game Thread">sports_esports</mat-icon>
                            } @else if (tag === 'stub') {
                                <mat-icon class="note-tag" matTooltip="This is a stub">broken_image</mat-icon>
                            } @else {
                                <div class="tag note-tag">{{ tag }}</div>
                            }
                        }

                        @if (showSummary() && element.summary) {
                            <blockquote>{{ element.summary }}</blockquote>
                        }

                        @if (showRemarks() && element.remark) {
                            <blockquote>{{ element.remark }}</blockquote>
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
            opacity: 0.5;
        }

        li:not(.exists) {
            opacity: 0.5;
        }

        li blockquote {
            margin-left: 0.75em;
            padding: 0.5em;
            opacity: 0.7;
            font-style: oblique;
            margin-bottom: 0.5em;
        }
    `
})
export class MassElementListComponent {
    private ref = inject(MassReferenceService);

    name = input.required<string>();
    module = input<string>();
    elements = input<MinimalElement[]>();
    showRemarks = input<boolean>(true);
    showSummary = input<boolean>(false);

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
