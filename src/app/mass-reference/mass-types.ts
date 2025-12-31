

export interface MassElementRef {
    module: string;
    id: string;
    remark?: string;
}

export interface MassFragmentRef extends MassElementRef {
    const?: boolean;
    shared?: boolean;
}

export interface MassElementBase {
    type: string;
    module?: string;
    plugin?: string;
    parent?: MassElementRef | null;
    comment?: string;
    displayName?: string;
    remark?: string;
    summary?: string;
    stub?: boolean;
    id: string;
}

export interface MassTrait extends MassElementBase {
    type: 'trait';
    properties?: MassProperty[];
    requiredFragments?: MassElementRef[];
    addsFragments?: MassFragmentRef[];
    addsTranslators?: MassElementRef[];
    requiredProcessors?: MassElementRef[];
    addsTags?: MassElementRef[];
    triggersProcessors?: MassElementRef[];
}

export interface MassFragment extends MassElementBase {
    type: 'fragment';
    properties?: MassProperty[];
}

export interface MassProperty {
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

export interface MassProcessingRequirement extends MassElementRef {
    access?: 'None' | 'ReadOnly' | 'ReadWrite';
    presence?: 'All' | 'Any' | 'None' | 'Optional';
}

export interface MassQuery {
    id: string;
    type?: 'query';
    owner?: MassElementRef;
    comment?: string;
    remark?: string;
    requiresFragments?: MassProcessingRequirement[];
    requiresTags?: MassProcessingRequirement[];
    requiresSubsystems?: MassProcessingRequirement[];
}

/**
 * Default is PrePhysics
 */
export type MassProcessingPhase =
    'PrePhysics' | 'StartPhysics' | 'DuringPhysics' | 'EndPhysics'
    | 'PostPhysics' | 'FrameEnd';
;
export interface MassProcessor extends MassElementBase {
    type: 'processor';
    requiresSubsystems?: MassProcessingRequirement[];
    queries?: MassQuery[];
    requiresMutatingWorldAccess?: boolean;
    autoRegisters?: boolean;
    requiresGameThread?: boolean;
    executionFlags?: MassProcessorExecutionFlag[];
    processingPhase?: MassProcessingPhase;
    executionGroup?: string;
    executeBefore?: string[];
    executeAfter?: string[];
    queryBasedPruning?: 'Prune' | 'Never';
    relatedTraits?: MassProcessingRequirement[];
}

export type MassProcessorExecutionFlag = 'Standalone' | 'Server' | 'Client' | 'Editor' | 'EditorWorld';

export interface MassTag extends MassElementBase {
    type: 'tag';
    deprecated?: string;
}

export interface MassModule {
    id: string;
    type?: 'module';
    name?: string;
    summary?: string;
    remark?: string;
    comment?: string;
    plugin?: string;
    traits?: (Omit<MassTrait, 'type'>)[];
    fragments?: (Omit<MassFragment, 'type'>)[];
    tags?: (Omit<MassTag, 'type'>)[];
    processors?: (Omit<MassProcessor, 'type'>)[];
}

export type MassElement = MassProcessor | MassFragment | MassTrait | MassTag;

export interface MassPlugin {
    id: string;
    type?: 'plugin';
    summary?: string;
    remark?: string;
    comment?: string;
    name?: string;
    modules?: MassModule[];
}
