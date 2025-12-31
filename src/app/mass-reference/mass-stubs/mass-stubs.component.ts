import { Component, inject } from "@angular/core";
import { MassReferenceService } from "../mass-reference.service";
import { MassFragment, MassProcessor, MassTag, MassTrait } from "../mass-types";

@Component({
    selector: 'rez-mass-stubs',
    templateUrl: './mass-stubs.component.html',
    styleUrl: './mass-stubs.component.scss',
    standalone: false
})
export class MassStubsComponent {
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
