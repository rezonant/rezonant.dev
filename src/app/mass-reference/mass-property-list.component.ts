import { Component, input } from "@angular/core";
import { MassProperty } from "./mass-types";

@Component({
    selector: 'rez-mass-property-list',
    template: `
        @if (showName()) {
            <strong>{{ name() }}</strong>
        }

        <ul class="properties">
            @for (prop of properties(); track prop.name) {
                <li>
                    <div class="name">
                        {{ prop.name }}
                    </div>
                    @if (prop.type) {
                        <div class="property">
                            <label>Type</label>
                            <code>{{ prop.type }}</code>
                        </div>
                    }
                    @if (prop.comment) {
                        <div class="property">
                            <label>Comment</label>
                            <blockquote>
                                {{ prop.comment }}
                            </blockquote>
                        </div>
                    }
                    @if (prop.category) {
                        <div class="property">
                            <label>Category</label>
                            {{ prop.category }}
                        </div>
                    }
                    <div class="property">
                        <label>Reflected</label>
                        {{ prop.specifiers !== undefined ? 'Yes' : 'No' }}
                    </div>

                    @if ((prop.specifiers?.length ?? 0) > 0) {
                        <div class="property">
                            <label>Specifiers</label>
                            <div>
                                <code>
                                    {{ (prop.specifiers || []).join(', ') }}
                                </code>
                            </div>
                        </div>
                    }
                    @if ((prop.conditionals?.length ?? 0) > 0) {
                        <div class="property">
                            <label>Compiled when</label>
                            <div>
                                @for (conditional of prop.conditionals; track conditional) {
                                    <div>
                                        <code>{{conditional}}</code>
                                    </div>
                                }
                            </div>
                        </div>
                    }
                    @if (prop.defaultValue !== undefined) {
                        <div class="property">
                            <label>Default</label>
                            <div>
                                <code>{{ prop.defaultValue }}</code>
                            </div>
                        </div>
                    }
                    @if (keys(prop.metaSpecifiers || {}).length > 0) {
                        <div class="property">
                            <label>Meta</label>
                            <div>
                                @for (key of keys(prop.metaSpecifiers); track key) {
                                    <div>
                                        <code>
                                            {{ key }}={{ prop.metaSpecifiers?.[key] }}
                                        </code>
                                    </div>
                                }
                            </div>
                        </div>
                    }
                </li>
            } @empty {
                <li>None</li>
            }
        </ul>
    `,
    styles: `
        ul.properties {
            padding: 0;
            display: flex;
            flex-direction: column;
            gap: 1em;

            li {
                list-style-type: none;
                border-left: 1px solid white;
                padding: 1em;

                div.name {
                    font-size: 120%;
                    display: flex;
                }

                blockquote {
                    margin: 0;
                }

                code {
                    font-size: 110%;
                }
            }
        }
    `
})
export class MassPropertyListComponent {
    properties = input.required<MassProperty[]>();
    name = input<string>('Properties');
    showName = input<boolean>(true);

    keys(o: any) {
        return Object.keys(o);
    }
}
