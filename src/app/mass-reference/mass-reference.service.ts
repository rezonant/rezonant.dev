import { ElementRef, Injectable } from "@angular/core";
import { MassElement, MassElementRef, MassFragment, MassModule, MassPlugin, MassProcessor, MassTag, MassTrait } from "./mass-types";
import { E_DEFAULT, F_MASS_FRAGMENT, F_MASS_TAG, MASS_REFERENCE, U_MASS_ENTITY_TRAIT_BASE, U_MASS_PROCESSOR } from "./mass-reference-data";

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

    getTraitsThatProvideFragment(fragment: MassFragment) {
        return this.getAllTraits().filter(x => this.doesTraitAddFragment(x, fragment));
    }

    getTraitsThatProvideTag(tag: MassTag) {
        return this.getAllTraits().filter(x => this.doesTraitAddTag(x, tag));
    }

    getAllProcessors() {
        return this.getAllElements().filter(x => x.type === 'processor') as MassProcessor[];
    }

    getAllTraits() {
        return this.getAllElements().filter(x => x.type === 'trait') as MassTrait[];
    }

    getAllFragments() {
        return this.getAllElements().filter(x => x.type === 'fragment') as MassFragment[];
    }

    getAllQueries() {
        return this.getAllProcessors().map(x => x.queries || []).flat();
    }

    getQueriesThatReferenceFragment(fragment: MassFragment) {
        return this.getAllQueries()
            .filter(x => (x.requiresFragments ?? [])
                .some(x => this.isSameElement(fragment, x))
            )
        ;
    }

    getQueriesThatReferenceTag(tag: MassTag) {
        return this.getAllQueries()
            .filter(x => (x.requiresTags ?? [])
                .some(x => this.isSameElement(tag, x))
            )
        ;
    }

    doesTraitAddFragment(trait: MassTrait, fragment: MassFragment) {
        if (!trait.addsFragments)
            return false;

        return trait.addsFragments.some(x => this.isSameElement(fragment, x));
    }

    doesTraitAddTag(trait: MassTrait, tag: MassTag) {
        if (!trait.addsTags)
            return false;

        return trait.addsTags.some(x => this.isSameElement(tag, x));
    }

    isSameElement(a: MassElement | MassElementRef, b: MassElement | MassElementRef) {
        return a.id === b.id && a.module === b.module;
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

    ref(element: MassElement | undefined, extra?: Partial<MassElementRef>): MassElementRef | undefined {
        if (element === undefined)
            return undefined;
        return { ...(extra ?? {}), id: element.id, module: element.module! };
    }

    resolve<T extends MassElement = MassElement>(ref: MassElementRef): T | undefined {
        return this.getAllElements().find(x => this.isSameElement(ref, x)) as T;
    }


    preprocess() {
        // Ensure `type` is set
        for (let module of this.modules) {
            module.traits?.forEach(t => (t as any).type = 'trait');
            module.processors?.forEach(t => (t as any).type = 'processor');
            module.fragments?.forEach(t => (t as any).type = 'fragment');
            module.tags?.forEach(t => (t as any).type = 'tag');
        }

        // Ensure `module` is set
        for (let module of this.modules) {
            module.traits?.forEach(t => (t as any).module = module.id);
            module.processors?.forEach(t => (t as any).module = module.id);
            module.fragments?.forEach(t => (t as any).module = module.id);
            module.tags?.forEach(t => (t as any).module = module.id);
        }

        // Ensure `plugin` is set
        for (let plugin of this.plugins) {
            for (let module of plugin.modules || []) {
                module.plugin = plugin.id;
                module.traits?.forEach(t => t.plugin = plugin.id);
                module.processors?.forEach(t => t.plugin = plugin.id);
                module.fragments?.forEach(t => t.plugin = plugin.id);
                module.tags?.forEach(t => t.plugin = plugin.id);
            }
        }

        const nullCoalesce = <T>(v: T, d: T) => v === null ? v : (v ?? d);

        // Ensure `parent` is default base class unless otherwise specified
        for (let module of this.modules) {
            module.traits?.forEach(t => t.parent = nullCoalesce(t.parent, U_MASS_ENTITY_TRAIT_BASE));
            module.processors?.forEach(t => t.parent = nullCoalesce(t.parent, U_MASS_PROCESSOR));
            module.fragments?.forEach(t => t.parent = nullCoalesce(t.parent, F_MASS_FRAGMENT));
            module.tags?.forEach(t => t.parent = nullCoalesce(t.parent, F_MASS_TAG));
        }

        // Ensure all processor queries reference their owner
        for (let module of this.modules) {
            module.processors?.forEach(t => t.queries?.forEach(q => q.owner = this.ref(t as MassProcessor)));
        }
        // Ensure execution flags are set on all processors
        for (let module of this.modules) {
            module.processors?.forEach(t => t.executionFlags ??= E_DEFAULT);
        }

        // Mark stubs
        for (let module of this.modules) {
            module.traits?.forEach(t => {
                if (t.requiredFragments === undefined && t.addsFragments === undefined && t.properties === undefined) {
                    t.stub = true;
                }
            });
            module.processors?.forEach(t => {
                if (t.queries === undefined) {
                    t.stub = true;
                }
            });
            module.fragments?.forEach(t => {
                if (t.properties === undefined)
                    t.stub = true;
            });
            module.tags?.forEach(t => {
                t.stub = false;
            });
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
