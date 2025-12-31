import { Component, computed, inject, input } from "@angular/core";
import { MassReferenceService } from "../mass-reference.service";
import { MassProcessor } from "../mass-types";

@Component({
    selector: 'rez-mass-element',
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
                <a routerLink="/reference/unreal/mass/{{ module().id }}">
                    {{ module().id }}
                </a>
                &raquo;
                {{ id() }}
            </h1>


            @if (element().displayName) {
                <div class="property display-name">
                    <label>Display Name</label>
                    {{ element().displayName }}
                </div>
                <br/>
            }

            <ul class="facts">
                @if (element().stub) {
                    <li>
                        <mat-icon matTooltip="This is a stub">broken_image</mat-icon>
                    </li>
                }
                @let parent = element().parent;
                @if (parent) {
                    <li>Extends <a routerLink="/reference/unreal/mass/{{ parent.module }}/{{ parent.id }}">
                        {{ parent.id }}
                    </a></li>
                }
                @if (module()) {
                    <li>
                    <a routerLink="/reference/unreal/mass/{{ module().id }}">
                        <mat-icon class="inline">group_work</mat-icon>
                        {{ module().id }}
                    </a>
                    </li>
                }

                @let plugin = module().plugin;
                @if (plugin) {
                    <li>
                        <a routerLink="/reference/unreal/mass/plugins/{{ plugin }}">
                            @if (plugin === 'Mass') {
                                <mat-icon class="inline">foundation</mat-icon>
                                Core
                            } @else {
                                <mat-icon class="inline">extension</mat-icon>
                                {{ plugin }}
                            }
                        </a>
                    </li>
                }
            </ul>

            @let comment = element().comment;
            @if (comment) {
                <blockquote>{{ comment }}</blockquote>
            }
            @let remark = element().remark;
            @if (remark) {
                <div
                    [innerHTML]="remark | markdownToHtml | trustHtml"
                    ></div>
            }


            <mat-tab-group [mat-stretch-tabs]="false">
                <mat-tab label="Details">
                    @switch (element().type) {
                        @case ('trait') {
                            <rez-mass-trait [moduleId]="module().id" [trait]="asAny(element())" />
                        }
                        @case ('processor') {
                            <rez-mass-processor [moduleId]="module().id" [processor]="asAny(element())" />
                        }
                        @case ('fragment') {
                            <rez-mass-fragment [moduleId]="module().id" [fragment]="asAny(element())" />
                        }
                        @case ('tag') {
                            <rez-mass-tag [moduleId]="module().id" [tag]="asAny(element())" />
                        }
                        @default {
                            <em>Unknown element type {{ element().type }}</em>
                        }
                    }
                </mat-tab>
                @if (subclasses().length > 0) {
                    <mat-tab label="Subclasses">
                        <br/>
                        @for (subclass of subclasses(); track subclass.id) {
                            <div>
                                <a routerLink="/reference/unreal/mass/{{ subclass.module }}/{{ subclass.id }}">
                                    {{ subclass.id }}
                                </a>
                            </div>
                        }
                    </mat-tab>
                }
                <mat-tab label="JSON">
                    <pre>{{ element() | json }}</pre>
                </mat-tab>
            </mat-tab-group>

        }
    `,
    styles: `

        mat-icon {
            vertical-align: middle;
        }

        h1:has(+ .display-name) {
            margin-bottom: 0;
        }
    `,
    standalone: false
})
export class MassElementComponent {
    private ref = inject(MassReferenceService);

    asAny = (t: any) => t;
    moduleId = input.required<string>();
    id = input.required<string>();

    notFound = computed(() => !this.ref.getElement(this.moduleId(), this.id()));
    module = computed(() => this.ref.getModule(this.moduleId())!);
    element = computed(() => this.ref.getElement(this.moduleId(), this.id())!);
    subclasses = computed(() => this.ref.getSubclasses({ id: this.id(), module: this.moduleId() }));
}
