import { ElementRef, Injectable } from "@angular/core";
import { MassElement, MassElementRef, MassFragment, MassModule, MassPlugin, MassProcessor, MassQuery, MassTag, MassTrait } from "./mass-types";
import { E_DEFAULT, F_MASS_FRAGMENT, F_MASS_TAG, U_MASS_ENTITY_TRAIT_BASE, U_MASS_PROCESSOR } from "./mass-reference-constants";
import stringDistance from 'js-levenshtein';
import { MASS_REFERENCE } from "./mass-reference-data";

export interface SearchResult {
    label: string;
    value: string;
}

export interface IndexEntry {
    text: string;
    lowercase: string;
    typeLabel: string;
    label: string;
    summary?: string;
    object: { type?: string };
}

@Injectable()
export class MassReferenceService {
    constructor() {
        this.plugins = structuredClone(MASS_REFERENCE);
        this.modules = this.plugins.map(x => x.modules || []).flat();
        this.elements = this.modules.map(x => this.getElements(x.id)).flat();
        this.preprocess();

        // Cached bins
        this.traits = this.elements.filter(x => x.type === 'trait') as MassTrait[];
        this.fragments = this.elements.filter(x => x.type === 'fragment') as MassFragment[];
        this.tags = this.elements.filter(x => x.type === 'tag') as MassTag[];
        this.processors = this.elements.filter(x => x.type === 'processor') as MassProcessor[];
        this.queries = this.processors.map(x => x.queries || []).flat();
    }

    private plugins: MassPlugin[];
    private modules: MassModule[];
    private elements: MassElement[];
    private processors: MassProcessor[];
    private traits: MassTrait[];
    private fragments: MassFragment[];
    private tags: MassTag[];
    private queries: MassQuery[];
    private index: IndexEntry[] = [];
    private symbolMap = new Map<string, IndexEntry>;

    getAllElements() { return this.elements; }
    getAllProcessors() { return this.processors; }
    getAllTraits() { return this.traits; }
    getAllFragments() { return this.fragments; }
    getAllQueries() { return this.queries; };

    private rankResult(query: string, symbol: string) {
        let rank = this.rankResultCore(query, symbol);
        return rank;
    }

    private rankResultCore(query: string, symbol: string) {
        if (symbol === query)
            return -10_000_000;

        if (symbol.startsWith(query))
            return -9_000_000 * 1 / ((symbol.length - query.length) || 1);

        let rank = stringDistance(query, symbol);

        if (symbol.includes(query))
            rank *= 0.5;

        return rank;
    }

    search(query: string): IndexEntry[] {
        if (!query)
            return this.index;

        let lowercaseQuery = query.toLowerCase().replace(/ +/g, '');
        let exactMatch = this.symbolMap.get(lowercaseQuery);
        if (exactMatch)
            return [exactMatch];

        this.index.sort((a, b) => {
            return this.rankResult(lowercaseQuery, a.lowercase) - this.rankResult(lowercaseQuery, b.lowercase);
        });

        return this.index;
    }

    getSubclasses(type: MassElementRef) {
        return this.getAllElements().filter(x => x.parent?.module === type.module && x.parent?.id === type.id);
    }

    getTraitsThatProvideFragment(fragment: MassFragment) {
        return this.getAllTraits().filter(x => this.doesTraitAddFragment(x, fragment));
    }

    getTraitsThatProvideTag(tag: MassTag) {
        return this.getAllTraits().filter(x => this.doesTraitAddTag(x, tag));
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
        this.plugins.forEach(p => p.type = 'plugin');
        this.modules.forEach(m => m.type = 'module');

        for (let module of this.modules) {
            module.traits?.forEach(t => (t as any).type = 'trait');
            module.processors?.forEach(t => (t as any).type = 'processor');
            module.fragments?.forEach(t => (t as any).type = 'fragment');
            module.tags?.forEach(t => (t as any).type = 'tag');
        }

        // Ensure `module` is set
        for (let module of this.modules) {
            module.traits?.forEach(t => t.module = module.id);
            module.processors?.forEach(t => t.module = module.id);
            module.fragments?.forEach(t => t.module = module.id);
            module.tags?.forEach(t => t.module = module.id);
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

        // Build search index
        this.plugins.forEach(p => this.addToIndex({
            typeLabel: 'Plugin',
            label: p.id,
            text: p.id,
            object: p,
            summary: p.summary || p.comment
        }));
        this.modules.forEach(m => this.addToIndex({
            typeLabel: 'Module',
            label: m.id,
            text: m.id,
            object: m,
            summary: m.summary || m.comment
        }));
        this.elements.forEach(e => this.addToIndex({
            typeLabel: `${this.elementTypeToLabel[e.type] || e.type}`,
            label: e.id,
            text: e.id,
            object: e,
            summary: e.summary || e.comment
        }));
    }

    private elementTypeToLabel = {
        fragment: 'Fragment',
        trait: 'Trait',
        processor: 'Processor',
        tag: 'Tag',
        query: 'Query'
    };

    private addToIndex(symbolInit: Omit<IndexEntry, 'lowercase'>) {

        if (symbolInit.label.includes('undefined'))
            debugger;

        let symbol: IndexEntry = { ...symbolInit, lowercase: symbolInit.text.toLowerCase() };

        this.index.push(symbol);
        this.symbolMap.set(symbol.lowercase, symbol);
    }
}
