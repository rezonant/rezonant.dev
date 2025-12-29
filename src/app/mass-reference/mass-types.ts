

export interface MassElementRef {
    module: string;
    id: string;
}

export interface MassFragmentRef extends MassElementRef {
    const?: boolean;
    shared?: boolean;
}

export interface MassElementBase {
    type: string;
    module?: string;
    plugin?: string;
    parent?: MassElementRef;
    stub?: boolean;
    id: string;
}

export interface MassTrait extends MassElementBase {
    type: 'trait';
    requiredFragments?: MassElementRef[];
    addsFragments?: MassFragmentRef[];
    triggersProcessors?: MassElementRef[];
}

export interface MassFragment extends MassElementBase {
    type: 'fragment';
    properties?: MassFragmentProperty[];
}

export interface MassFragmentProperty {
    name: string;
    type: string;
    parent?: MassElementRef;
    specifiers?: string[];
    metaSpecifiers?: Record<string, string | undefined>;
    category?: string;
    defaultValue?: string;
    comment?: string;
    visibility?: 'private' | 'public' | 'protected';
    mutable?: boolean;
    conditionals?: string[];
}

export interface MassProcessor extends MassElementBase {
    type: 'processor';
    requiresFragments?: MassFragmentRef[];
    relatedTraits?: MassElementRef[];
}

export interface MassTag extends MassElementBase {
    type: 'tag';
    deprecated?: string;
}

export interface MassModule {
    id: string;
    name?: string;
    plugin?: string;
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
