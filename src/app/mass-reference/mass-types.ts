

export interface MassElementRef {
    module: string;
    id: string;
}

export interface MassFragmentRef extends MassElementRef {
    const?: boolean;
    shared?: boolean;
}

export interface MassTrait {
    type: 'trait';
    module?: string;
    parent?: MassElementRef;
    id: string;
    requiredFragments?: MassElementRef[];
    addsFragments?: MassFragmentRef[];
    triggersProcessors?: MassElementRef[];
}

export interface MassFragment {
    type: 'fragment';
    module?: string;
    id: string;
    parent?: MassElementRef;
    properties?: MassFragmentProperty[];
}

export interface MassFragmentProperty {
    name: string;
    type: string;
    parent?: MassElementRef;
    specifiers?: string[];
    category?: string;
}

export interface MassProcessor {
    type: 'processor';
    module?: string;
    id: string;
    parent?: MassElementRef;
    requiresFragments?: MassFragmentRef[];
    relatedTraits?: MassElementRef[];
}

export interface MassTag {
    type: 'tag';
    module?: string;
    id: string;
    parent?: MassElementRef;
    deprecated?: string;
}

export interface MassModule {
    id: string;
    name?: string;
    traits?: (Omit<MassTrait, 'type'>)[];
    fragments?: (Omit<MassFragment, 'type'>)[];
    tags?: (Omit<MassTag, 'type'>)[];
    processors?: (Omit<MassProcessor, 'type'>)[];
}

export type MassElement = MassProcessor | MassFragment | MassTrait | MassTag;

export interface MassPlugin {
    id: string;
    name?: string;
    modules?: MassModule[];
}
