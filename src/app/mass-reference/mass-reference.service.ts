import { ElementRef, Injectable } from "@angular/core";
import { MassElement, MassElementRef, MassFragment, MassModule, MassPlugin, MassProcessor, MassTag, MassTrait } from "./mass-types";
import { F_MASS_FRAGMENT, F_MASS_TAG, MASS_REFERENCE, U_MASS_ENTITY_TRAIT_BASE, U_MASS_PROCESSOR } from "./mass-reference-data";

@Injectable()
export class MassReferenceService {
    constructor() {
        this.plugins = structuredClone(MASS_REFERENCE);
        this.modules = this.plugins.map(x => x.modules || []).flat();
        this.preprocess();
    }

    private plugins: MassPlugin[];
    private modules: MassModule[];

    getSubclasses(type: MassElementRef) {
        return this.getAllElements().filter(x => x.parent?.module === type.module && x.parent?.id === type.id);
    }

    getAllElements() {
        return this.modules.map(x => this.getElements(x.id)).flat();
    }

    getPlugins() {
        return this.plugins;
    }

    getPlugin(id: string): MassPlugin | undefined {
        return this.plugins.find(x => x.id === id);
    }

    getModule(id: string): MassModule | undefined {
        return this.modules.find(x => x.id === id);
    }

    getModules(): MassModule[] {
        return this.modules;
    }

    getElement(moduleId: string, id: string) {
        return this.getElements(moduleId).find(x => x.id === id);
    }

    getElements(moduleId: string): MassElement[] {
        let module = this.getModule(moduleId);
        if (!module)
            return [];

        return [
            (module.fragments ?? []) as MassFragment[],
            (module.processors ?? []) as MassProcessor[],
            (module.traits ?? []) as MassTrait[],
            (module.tags ?? []) as MassTag[],
        ].flat();
    }

    getElementFromRef(ref: MassElementRef) {
        return this.getElement(ref.module, ref.id);
    }

    preprocess() {
        for (let module of this.modules) {
            module.traits?.forEach(t => (t as any).type = 'trait');
            module.processors?.forEach(t => (t as any).type = 'processor');
            module.fragments?.forEach(t => (t as any).type = 'fragment');
            module.tags?.forEach(t => (t as any).type = 'tag');
        }

        for (let module of this.modules) {
            module.traits?.forEach(t => (t as any).module = module.id);
            module.processors?.forEach(t => (t as any).module = module.id);
            module.fragments?.forEach(t => (t as any).module = module.id);
            module.tags?.forEach(t => (t as any).module = module.id);
        }

        for (let module of this.modules) {
            module.traits?.forEach(t => t.parent ??= U_MASS_ENTITY_TRAIT_BASE);
            module.processors?.forEach(t => t.parent ??= U_MASS_PROCESSOR);
            module.fragments?.forEach(t => t.parent ??= F_MASS_FRAGMENT);
            module.tags?.forEach(t => t.parent ??= F_MASS_TAG);
        }

        // Relate processors to traits
        for (let module of this.modules) {
            for (let trait of module.traits || []) {
                for (let processorRef of trait.triggersProcessors || []) {
                    let processor = this.getElementFromRef(processorRef) as MassProcessor;
                    processor.relatedTraits ??= [];
                    processor.relatedTraits.push({ module: module.id, id: trait.id });
                }
            }
        }
    }
}
