import { Component, computed, inject, input } from "@angular/core";
import { MassReferenceService } from "../mass-reference.service";

@Component({
    selector: 'rez-mass-plugin',
    template: `
        @if (notFound()) {
            <rez-not-found
                title="No such Mass plugin '{{ pluginId() }}'"
                message="It may not have been added to the reference yet."
                />
        } @else {
            <h1>
                <a routerLink="/reference/unreal/mass">Mass Reference</a>
                &raquo;
                {{ plugin().name || plugin().id }}
            </h1>

            <strong>Modules</strong>
            <ul>
            @for (module of plugin().modules; track module.id) {
                <li>
                    <a routerLink="/reference/unreal/mass/{{ module.id }}">
                        {{ module.name || module.id }}
                    </a>
                </li>
            }
            </ul>
        }
    `,
    styles: ``,
    standalone: false
})
export class MassPluginComponent {
    private ref = inject(MassReferenceService);

    pluginId = input.required<string>();
    notFound = computed(() => !this.ref.getPlugin(this.pluginId()));
    plugin = computed(() => this.ref.getPlugin(this.pluginId())!);
}
