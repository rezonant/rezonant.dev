import { Component, inject } from "@angular/core";
import { MassReferenceService } from "../mass-reference.service";
import { MassFragment, MassProcessor, MassTag, MassTrait } from "../mass-types";

@Component({
    selector: 'rez-mass-modules',
    template: `
        <h1>Mass Reference</h1>

        <mat-tab-group [mat-stretch-tabs]="false">
            <mat-tab label="Elements">
                <div class="lists">
                    <div class="plugin-list">
                        <strong>Plugins</strong>
                        <ul>
                        @for (plugin of plugins; track plugin.id) {
                            <li>
                                <a routerLink="/reference/unreal/mass/plugins/{{ plugin.id }}">
                                    {{ plugin.name || plugin.id }}
                                </a>
                            </li>
                        }
                        </ul>
                    </div>

                    <div class="module-list">
                        <strong>Modules</strong>
                        <ul>
                        @for (module of modules; track module.id) {
                            <li>
                                <a routerLink="/reference/unreal/mass/{{ module.id }}">
                                    {{ module.name || module.id }}
                                </a>
                            </li>
                        }
                        </ul>
                    </div>

                    <rez-mass-element-list [showSummary]="true" [showRemarks]="false" name="Traits" [elements]="traits" />
                    <rez-mass-element-list [showSummary]="true" [showRemarks]="false" name="Fragments" [elements]="fragments" />
                    <rez-mass-element-list [showSummary]="true" [showRemarks]="false" name="Processors" [elements]="processors" />
                    <rez-mass-element-list [showSummary]="true" [showRemarks]="false" name="Tags" [elements]="tags" />
                </div>
            </mat-tab>
            <mat-tab label="Stubs">
                    <rez-mass-element-list [showSummary]="true" [showRemarks]="false" name="Traits" [elements]="stubTraits" />
                    <rez-mass-element-list [showSummary]="true" [showRemarks]="false" name="Fragments" [elements]="stubFragments" />
                    <rez-mass-element-list [showSummary]="true" [showRemarks]="false" name="Processors" [elements]="stubProcessors" />
                    <rez-mass-element-list [showSummary]="true" [showRemarks]="false" name="Tags" [elements]="stubTags" />
            </mat-tab>
            <mat-tab label="JSON">
                <pre>{{modules | json}}</pre>
            </mat-tab>
        </mat-tab-group>
    `,
    styles: `
        .lists {
            display: flex;
            flex-wrap: wrap;
            gap: 1em;
            .plugin-list, .module-list, rez-mass-element-list {
                border: 1px solid #23506e;
                border-radius: 5px;
                width: calc(50% - 0.5em);
                padding: 1em;

                & > strong, ::ng-deep .element-list-heading {
                    display: block;
                    margin: 1em 0;
                }
                ::ng-deep ul {
                    margin: 0;
                    padding: 0;

                    li {
                        padding: 0;
                        list-style-type: none;
                        margin: 0;
                    }
                }
            }
        }

        @media (max-width: 450px) {
            .lists {
                .plugin-list, .module-list, rez-mass-element-list {
                    width: calc(100%);
                }
            }
        }
    `,
    standalone: false
})
export class MassModulesComponent {
    private ref = inject(MassReferenceService);

    plugins = this.ref.getPlugins();
    modules = this.ref.getModules();

    traits: MassTrait[] = [];
    fragments: MassFragment[] = [];
    processors: MassProcessor[] = [];
    tags: MassTag[] = [];
    stubTraits: MassTrait[] = [];
    stubFragments: MassFragment[] = [];
    stubProcessors: MassProcessor[] = [];
    stubTags: MassTag[] = [];

    ngOnInit() {
        for (let module of this.modules) {
            this.traits.push(...(module.traits || []) as any);
            this.fragments.push(...(module.fragments || []) as any);
            this.processors.push(...(module.processors || []) as any);
            this.tags.push(...(module.tags || []) as any);

            this.stubTraits = this.traits.filter(x => x.stub);
            this.stubFragments = this.fragments.filter(x => x.stub);
            this.stubProcessors = this.processors.filter(x => x.stub);
            this.stubTags = this.tags.filter(x => x.stub);
        }
    }
}
