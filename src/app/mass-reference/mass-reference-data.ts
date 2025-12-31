import { unindent } from "../../common-ui";
import { MassElement, MassElementRef, MassFragmentRef, MassModule, MassPlugin, MassProcessingRequirement, MassProcessorExecutionFlag, MassTag } from "./mass-types";

export const F_MASS_TAG: MassElementRef = { id: 'FMassTag', module: 'MassEntity' };
export const F_MASS_FRAGMENT: MassElementRef = { id: 'FMassFragment', module: 'MassEntity' }
export const F_MASS_SHARED_FRAGMENT: MassElementRef = { id: 'FMassSharedFragment', module: 'MassEntity' }
export const F_MASS_CONST_SHARED_FRAGMENT: MassElementRef = { id: 'FMassConstSharedFragment', module: 'MassEntity' }
export const U_MASS_TRANSLATOR: MassElementRef = { id: 'UMassTranslator', module: 'MassSpawner' }
export const U_MASS_PROCESSOR: MassElementRef = { id: 'UMassProcessor', module: 'MassEntity' }
export const U_MASS_ENTITY_TRAIT_BASE: MassElementRef = { id: 'UMassEntityTraitBase', module: 'MassSpawner' }
export const F_OBJECT_WRAPPER_FRAGMENT: MassElementRef = { id: 'FObjectWrapperFragment', module: 'MassCommon' }
export const F_MASS_CHUNK_FRAGMENT: MassElementRef = { id: 'FMassChunkFragment', module: 'MassEntity' }

export const M_MASS_COMMON = 'MassCommon';

export const E_ALL_NET_MODES: MassProcessorExecutionFlag[] = ['Standalone', 'Server', 'Client'];
export const E_ALL_WORLD_MODES: MassProcessorExecutionFlag[] = ['Standalone', 'Server', 'Client', 'EditorWorld'];
export const E_ALL: MassProcessorExecutionFlag[] = ['Standalone', 'Server', 'Client', 'Editor', 'EditorWorld'];
export const E_DEFAULT: MassProcessorExecutionFlag[] = ['Server', 'Standalone'];

const EG_UpdateWorldFromMass = 'UE::Mass::ProcessorGroupNames::UpdateWorldFromMass';
const EG_SyncWorldToMass = 'UE::Mass::ProcessorGroupNames::SyncWorldToMass';
const EG_Behavior = 'UE::Mass::ProcessorGroupNames::Behavior';
const EG_Tasks = 'UE::Mass::ProcessorGroupNames::Tasks';
const EG_Avoidance = 'UE::Mass::ProcessorGroupNames::Avoidance';
const EG_ApplyForces = 'UE::Mass::ProcessorGroupNames::ApplyForces';
const EG_Movement = 'UE::Mass::ProcessorGroupNames::Movement';
const EG_LODCollector = 'UE::Mass::ProcessorGroupNames::LODCollector';
const EG_LOD = 'UE::Mass::ProcessorGroupNames::LOD';
const EG_Representation = 'UE::Mass::ProcessorGroupNames::Representation';

class RefBuilder implements MassElementRef {
    constructor(public id: string, public module: string) {
    }

    remark?: string;

    from(moduleId: string) {
        this.module = moduleId;
        return this;
    }

    withRemark(value: string) {
        this.remark = value;
        return this;
    }

    // Convert to ProcessingRequirementBuilder

    noAccess() { return this.withAccess('None'); }
    readOnly() { return this.withAccess('ReadOnly'); }
    readWrite() { return this.withAccess('ReadWrite'); }

    all() { return this.withPresence('All'); }
    any() { return this.withPresence('Any'); }
    none() { return this.withPresence('None'); }
    optional() { return this.withPresence('Optional'); }

    withAccess(value: 'None' | 'ReadOnly' | 'ReadWrite') {
        return new ProcessingRequirementBuilder(this).withAccess(value);
    }

    withPresence(value: 'All' | 'Any' | 'None' | 'Optional') {
        return new ProcessingRequirementBuilder(this).withPresence(value);
    }
}

class ProcessingRequirementBuilder extends RefBuilder implements MassProcessingRequirement {
    constructor(ref: MassElementRef) {
        super(ref.id, ref.module);
        this.access = 'None';
        this.presence = 'All';
        Object.assign(this, ref);
    }

    access?: 'None' | 'ReadOnly' | 'ReadWrite';
    presence?: 'All' | 'Any' | 'None' | 'Optional';

    override noAccess() { return this.withAccess('None'); }
    override readOnly() { return this.withAccess('ReadOnly'); }
    override readWrite() { return this.withAccess('ReadWrite'); }

    override all() { return this.withPresence('All'); }
    override any() { return this.withPresence('Any'); }
    override none() { return this.withPresence('None'); }
    override optional() { return this.withPresence('Optional'); }

    override withAccess(value: 'None' | 'ReadOnly' | 'ReadWrite') {
        this.access = value;
        return this;
    }

    override withPresence(value: 'All' | 'Any' | 'None' | 'Optional') {
        this.presence = value;
        return this;
    }
}

class ModuleBuilder {
    constructor(private moduleId: string) {
    }

    r(id: string): RefBuilder {
        return new RefBuilder(id, this.moduleId);
    }

    ref(id: string, extra?: Partial<MassElementRef>) {
        return {
            module: extra?.module || this.moduleId,
            ...extra,
            id
        };
    }

    /**
     * @deprecated use ref() instead
     */
    frag(id: string, extra?: Partial<MassFragmentRef>) {
        return {
            id,
            module: this.moduleId,
            ...(extra || {}),
        };
    }
}

function declareModule(moduleId: string, declarator: (module: ModuleBuilder) => Omit<MassModule, 'id'>) {
    return {
        ...declarator(new ModuleBuilder(moduleId)),
        id: moduleId
    };
}

function declareTag(id: string, extra?: Partial<MassTag>): MassTag {
    return { id, parent: F_MASS_TAG, type: 'tag', ...(extra ?? {}) };
}

export const MASS_REFERENCE: MassPlugin[] = [
    {
        id: 'Mass',
        modules: [
            declareModule('MassEntity', m => ({
                tags: [
                    {
                        id: 'FMassTag'
                    }
                ],
                fragments: [
                    { id: 'FMassFragment', parent: null, properties: [] },
                    { id: 'FMassSharedFragment', parent: null, properties: [] },
                    { id: 'FMassConstSharedFragment', parent: null, properties: [] },
                    { id: 'FMassChunkFragment', parent: null, properties: [] },
                    {
                        id: 'FMassDebugLogFragment',
                        properties: [
                            {
                                name: 'LogOwner',
                                type: 'TWeakObjectPtr<const UObject>'
                            }
                        ]
                    },
                ],
                processors: [
                    {
                        id: 'UMassProcessor',
                        parent: null,
                        queries: [],
                    },
                    {
                        id: 'UMassObserverProcessor',
                        parent: U_MASS_PROCESSOR,
                        queries: [],
                    },
                    {
                        id: 'UMassCompositeProcessor',
                        parent: U_MASS_PROCESSOR,
                        queries: [],
                    }
                ]
            })),
        ]
    },
    {
        id: 'MassCrowd',
        modules: [
            declareModule('MassCrowd', m => ({
                tags: [
                    declareTag('FMassCrowdTag')
                ],
                fragments: [
                    {
                        id: 'FMassCrowdLaneTrackingFragment',
                        properties: [
                            {
                                name: 'TrackedLaneHandle',
                                type: 'FZoneGraphLaneHandle'
                            }
                        ]
                    },
                    {
                        id: 'FMassCrowdObstacleFragment',
                        properties: [
                            {
                                comment: 'Obstacle ID reported to the obstruction annotation.',
                                type: 'FMassLaneObstacleID', name: 'LaneObstacleID'
                            },
                            {
                                comment: 'Position of the obstacle when it last moved.',
                                type: 'FVector', name: 'LastPosition', defaultValue: 'FVector::ZeroVector'
                            },
                            {
                                comment: 'Time since the obstacle has not moved based on speed tolerance.',
                                type: 'float', name: 'TimeSinceStopped', defaultValue: '0.0f'
                            },
                            {
                                comment: 'True of the current obstacle state is moving.',
                                type: 'bool', name: 'bIsMoving', defaultValue: 'true'
                            },
                        ]
                    },
                ],
                traits: [
                    {
                        id: 'UMassCrowdMemberTrait',
                        addsFragments: [
                            m.frag('FMassCrowdLaneTrackingFragment')
                        ],
                        addsTags: [
                            m.ref('FMassCrowdTag')
                        ]
                    },
                    {
                        id: 'UMassCrowdServerRepresentationTrait',
                        properties: [
                            {
                                comment: `Actor class of this agent when spawned on server`,
                                specifiers: ['EditAnywhere'],
                                category: 'Mass|Visual',
                                name: 'TemplateActor',
                                type: 'TSubclassOf<AActor>'
                            },
                            {
                                comment: `Configuration parameters for the representation processor`,
                                specifiers: ['EditAnywhere'],
                                category: 'Mass|Visual',
                                name: 'Params',
                                type: 'FMassRepresentationParameters'
                            },
                        ],
                        requiredFragments: [
                            m.frag('FMassViewerInfoFragment', { module: 'MassLOD' }),
                            m.frag('FTransformFragment', { module: M_MASS_COMMON }),
                            m.frag('FMassActorFragment', { module: 'MassActors' }),
                        ],
                        addsFragments: [
                            m.frag('FMassRepresentationSubsystemSharedFragment', {
                                module: 'MassRepresentation',
                                shared: true
                            }),
                            m.frag('FMassRepresentationParameters', {
                                module: 'MassRepresentation',
                                const: true,
                                shared: true
                            }),
                            m.frag('FMassRepresentationFragment', {
                                module: 'MassRepresentation',
                            }),
                            m.frag('FMassRepresentationLODFragment', {
                                module: 'MassRepresentation',
                            }),
                            m.frag('FMassVisualizationChunkFragment', {
                                module: 'MassLOD'
                            })
                        ]
                    },

                ],
                processors: [
                    {
                        id: 'UMassCrowdDynamicObstacleProcessor',
                        queries: [
                            {
                                id: 'EntityQuery_Conditional',
                                requiresFragments: [
                                    m.r('FTransformFragment').from(M_MASS_COMMON).readOnly(),
                                    m.r('FMassVelocityFragment').from('MassMovement').readOnly().optional(),
                                    m.r('FAgentRadiusFragment').from(M_MASS_COMMON).readOnly(),
                                    m.r('FMassCrowdObstacleFragment').readWrite(),
                                    m.r('FMassSimulationVariableTickFragment').from('MassLOD').readOnly().optional(),
                                    m.r('FMassSimulationVariableTickChunkFragment').from('MassLOD').readOnly().optional(),
                                ]
                            }
                        ]
                    },
                    {
                        id: 'UMassCrowdServerRepresentationLODProcessor',
                        queries: [
                            {
                                id: 'EntityQuery',
                                requiresFragments: [
                                    m.r('FTransformFragment').from(M_MASS_COMMON).readOnly(),
                                    m.r('FMassViewerInfoFragment').from('MassLOD').readOnly(),
                                    m.r('FMassRepresentationLODFragment').from('MassRepresentation').readWrite(),
                                ],
                                requiresTags: [
                                    m.r('FMassCrowdTag').all()
                                ],
                            }
                        ],
                        requiresSubsystems: [
                            m.r('UMassLODSubsystem').from('MassLOD').readOnly()
                        ]
                    },
                    {
                        id: 'UMassDebugCrowdVisualizationProcessor',
                        requiresMutatingWorldAccess: true,
                        queries: [
                            {
                                id: 'EntityQuery',
                                requiresTags: [
                                    m.r('FMassCrowdTag').all()
                                ],
                                requiresFragments: [
                                    m.r('FTransformFragment').from(M_MASS_COMMON).readOnly(),
                                    m.r('FMassRepresentationFragment').from('MassRepresentation').readWrite(),
                                    m.r('FMassActorFragment').from('MassActors').readWrite(),
                                ]
                            }
                        ]
                    },
                    {
                        id: 'UMassCrowdLODCollectorProcessor',
                        parent: m.r('UMassLODCollectorProcessor').from('MassLOD'),
                        comment: 'Created a crowd version for parallelization of the crowd with the traffic',
                        displayName: 'Crowd LOD Collection',
                        executionFlags: E_ALL_NET_MODES,
                        executionGroup: EG_LODCollector,
                        executeAfter: [EG_SyncWorldToMass],
                        requiresSubsystems: [
                            m.r('UMassLODSubsystem')
                        ],
                        queries: [
                            {
                                id: 'BaseQuery',
                                remark: unindent(
                                    `
                                    All other queries are based on this one.
                                    `
                                ),
                                requiresFragments: [
                                    m.r('FTransformFragment').from(M_MASS_COMMON).readOnly(),
                                    m.r('FMassViewerInfoFragment').from('MassLOD').readWrite(),
                                    m.r('FMassSimulationVariableTickChunkFragment').from('MassLOD').readOnly().optional(),
                                    m.r('FMassVisualizationChunkFragment').from('MassLOD').readOnly().optional(),
                                ],
                                requiresTags: [
                                    m.r('FMassCollectLODViewerInfoTag').from('MassLOD').all(),
                                ]
                            },
                            {
                                id: 'EntityQuery_VisibleRangeAndOnLOD',
                                remark: `(Includes the requirements of BaseQuery)`,
                                comment: `
                                    All entities that are in visible range and are On LOD
                                `,
                                requiresTags: [
                                    m.r('FMassVisibilityCulledByDistanceTag').none(),
                                    m.r('FMassOffLODTag').none(),
                                ]
                            },
                            {
                                id: 'EntityQuery_VisibleRangeOnly',
                                remark: `(Includes the requirements of BaseQuery)`,
                                comment: `
                                    All entities that are in visible range but are Off LOD
                                `,
                                requiresTags: [
                                    m.r('FMassVisibilityCulledByDistanceTag').none(),
                                    m.r('FMassOffLODTag').all(),
                                ]
                            },
                            {
                                id: 'EntityQuery_OnLODOnly',
                                remark: `(Includes the requirements of BaseQuery)`,
                                comment: `
                                    All entities that are NOT in visible range but are On LOD
                                `,
                                requiresTags: [
                                    m.r('FMassVisibilityCulledByDistanceTag').all(),
                                    m.r('FMassOffLODTag').none(),
                                ]
                            },
                            {
                                id: 'EntityQuery_NotVisibleRangeAndOffLOD',
                                remark: `(Includes the requirements of BaseQuery)`,
                                comment: `
                                    All entities that are Not in visible range and are at Off LOD
                                `,
                                requiresTags: [
                                    m.r('FMassVisibilityCulledByDistanceTag').all(),
                                    m.r('FMassOffLODTag').all(),
                                ]
                            },
                        ]
                    }
                ]
            }))
        ]
    },
    {
        id: 'MassGameplay',
        modules: [
            declareModule('MassActors', m => ({
                fragments: [
                    {
                        id: 'FMassActorInstanceFragment',
                        properties: [
                            {
                                name: 'Handle',
                                type: 'FActorInstanceHandle',
                                specifiers: []
                            }
                        ]
                    },
                    {
                        id: 'FMassActorFragment',
                        parent: F_OBJECT_WRAPPER_FRAGMENT,
                        properties: [
                            {
                                comment: `
                                    made visible for debugging purposes. It will show up in Mass's gameplay
                                    debugger category when viewing fragment details
                                `,
                                specifiers: ['VisibleAnywhere', 'Transient'],
                                category: 'Mass',
                                type: 'TWeakObjectPtr<AActor>',
                                name: 'Actor'
                            },
                            {
                                comment: `Ownership of the actor`,
                                type: 'bool',
                                name: 'bIsOwnedByMass',
                                defaultValue: 'false'
                            }
                        ]
                    },
                    {
                        id: 'FCapsuleComponentWrapperFragment',
                        parent: F_OBJECT_WRAPPER_FRAGMENT,
                        properties: [
                            {
                                type: 'TWeakObjectPtr<UCapsuleComponent>',
                                name: 'Component'
                            }
                        ]
                    },
                    {
                        id: 'FCharacterMovementComponentWrapperFragment',
                        parent: F_OBJECT_WRAPPER_FRAGMENT,
                        properties: [
                            {
                                name: 'Component',
                                type: 'TWeakObjectPtr<UCharacterMovementComponent>'
                            }
                        ]
                    },
                    {
                        id: 'FMassSceneComponentWrapperFragment',
                        parent: F_OBJECT_WRAPPER_FRAGMENT
                    },
                    {
                        id: 'FDataFragment_BehaviorTreeComponentWrapper',
                        poarent: F_OBJECT_WRAPPER_FRAGMENT
                    }
                ],
                tags: [
                    declareTag('FMassCapsuleTransformCopyToMassTag'),
                    declareTag('FMassCapsuleTransformCopyToActorTag'),
                    declareTag('FMassCharacterMovementCopyToMassTag'),
                    declareTag('FMassCharacterMovementCopyToActorTag'),
                    declareTag('FMassCharacterOrientationCopyToMassTag'),
                    declareTag('FMassCharacterOrientationCopyToActorTag'),
                    declareTag('FMassSceneComponentLocationCopyToMassTag'),
                    declareTag('FMassSceneComponentLocationCopyToActorTag')
                ],
                traits: [
                    {
                        id: 'UMassAgentSyncTrait',
                        properties: [
                            {
                                specifiers: ['EditAnywhere'],
                                category: 'Mass',
                                type: 'EMassTranslationDirection',
                                name: 'SyncDirection',
                                defaultValue: 'EMassTranslationDirection::BothWays'
                            },
                        ]
                    },
                    {
                        id: 'UMassAgentCapsuleCollisionSyncTrait',
                        parent: m.ref('UMassAgentSyncTrait'),
                        properties: [
                            {
                                specifiers: ['EditAnywhere'],
                                category: 'Mass',
                                type: 'bool',
                                name: 'bSyncTransform',
                                defaultValue: 'true'
                            }
                        ],
                        addsFragments: [
                            m.frag('FCapsuleComponentWrapperFragment'),
                            m.frag('FAgentRadiusFragment', { module: M_MASS_COMMON }),
                            m.frag('FTransformFragment', {
                                module: M_MASS_COMMON,
                                remark: `
                                    Only added if bSyncTransform is true
                                `
                            }),
                        ],
                        addsTranslators: [
                            m.ref('UMassCapsuleTransformToMassTranslator', {
                                remark: `
                                    When SyncDirection includes ActorToMass
                                `
                            }),
                            m.ref('UMassTransformToActorCapsuleTranslator', {
                                remark: `
                                    When SyncDirection includes MassToActor
                                `
                            }),
                        ]
                    },
                    {
                        id: 'UMassAgentMovementSyncTrait',
                        parent: m.ref('UMassAgentSyncTrait'),
                        remark: unindent(
                            `
                            # Additional
                            The agent actor must inherit from \`ACharacter\`
                            `
                        ),
                        properties: [],
                        addsFragments: [
                            m.ref('FCharacterMovementComponentWrapperFragment'),
                            m.ref('FMassVelocityFragment', { module: 'MassMovement' }),
                        ],
                        addsTranslators: [
                            m.ref('UMassCharacterMovementToMassTranslator', {
                                remark: `
                                    Only when SyncDirection includes ActorToMass
                                `
                            }),
                            m.ref('UMassCharacterMovementToActorTranslator', {
                                remark: `
                                    Only when SyncDirection includes MassToActor
                                `
                            })
                        ]
                    },
                    {
                        id: 'UMassAgentOrientationSyncTrait',
                        parent: m.ref('UMassAgentSyncTrait'),
                        requiredFragments: [
                            m.frag('FCharacterMovementComponentWrapperFragment')
                        ],
                        addsTranslators: [
                            m.ref('UMassCharacterOrientationToMassTranslator', {
                                remark: `Only when SyncDirection includes ActorToMass`
                            }),
                            m.ref('UMassCharacterOrientationToActorTranslator', {
                                remark: `Only when SyncDirection includes MassToActor`
                            }),
                        ]
                    },
                    {
                        id: 'UMassAgentFeetLocationSyncTrait',
                        parent: m.ref('UMassAgentSyncTrait'),
                        addsFragments: [
                            m.frag('FMassSceneComponentWrapperFragment'),
                            m.frag('FTransformFragment', { module: M_MASS_COMMON }),
                        ]
                    },
                ],
                processors: [
                    {
                        id: 'UMassCharacterMovementToMassTranslator',
                        parent: U_MASS_TRANSLATOR,
                        executionFlags: E_ALL_NET_MODES,
                        executionGroup: EG_SyncWorldToMass,
                        requiresGameThread: true,
                        queries: [
                            {
                                id: 'EntityQuery',
                                requiresFragments: [
                                    m.r('FCharacterMovementComponentWrapperFragment').readOnly(),
                                    m.r('FTransformFragment').from(M_MASS_COMMON).readWrite(),
                                    m.r('FMassVelocityFragment').from('MassMovement').readWrite(),
                                ],
                                requiresTags: [
                                    m.r('FMassCharacterMovementCopyToMassTag').all()
                                ]
                            }
                        ]
                    },
                    {
                        id: 'UMassCharacterMovementToActorTranslator',
                        parent: U_MASS_TRANSLATOR,
                        requiresGameThread: true,
                        executionFlags: E_ALL_NET_MODES,
                        executionGroup: EG_UpdateWorldFromMass,
                        executeAfter: [
                            EG_Movement
                        ],
                        queries: [
                            {
                                id: 'EntityQuery',
                                requiresTags: [
                                    m.r('FMassCharacterMovementCopyToActorTag').all()
                                ],
                                requiresFragments: [
                                    m.r('FCharacterMovementComponentWrapperFragment').readWrite(),
                                    m.r('FMassVelocityFragment').from('MassMovement').readOnly()
                                ]
                            }
                        ]
                    },
                    {
                        id: 'UMassCharacterOrientationToMassTranslator',
                        parent: U_MASS_TRANSLATOR,
                        requiresGameThread: true,
                        executionFlags: E_ALL_NET_MODES,
                        executionGroup: EG_SyncWorldToMass,
                        queries: [
                            {
                                id: 'EntityQuery',
                                requiresTags: [
                                    m.r('FMassCharacterOrientationCopyToMassTag').all()
                                ],
                                requiresFragments: [
                                    m.r('FCharacterMovementComponentWrapperFragment').readOnly(),
                                    m.r('FTransformFragment').from(M_MASS_COMMON).readWrite()
                                ]
                            }
                        ]
                    },
                    {
                        id: 'UMassCharacterOrientationToActorTranslator',
                        parent: U_MASS_TRANSLATOR,
                        requiresMutatingWorldAccess: true,
                        requiresGameThread: true,
                        executionFlags: E_ALL_NET_MODES,
                        executionGroup: EG_UpdateWorldFromMass,
                        executeAfter: [EG_Movement],
                        queries: [
                            {
                                id: 'EntityQuery',
                                requiresTags: [
                                    m.r('FMassCharacterOrientationCopyToActorTag').all()
                                ],
                                requiresFragments: [
                                    m.r('FCharacterMovementComponentWrapperFragment').readWrite(),
                                    m.r('FTransformFragment').from(M_MASS_COMMON).readOnly(),
                                ]
                            }
                        ]
                    },
                    {
                        id: 'UMassCapsuleTransformToMassTranslator',
                        parent: U_MASS_TRANSLATOR,
                        requiresGameThread: true,
                        executionFlags: E_ALL_NET_MODES,
                        executionGroup: EG_SyncWorldToMass,
                        queries: [
                            {
                                id: 'EntityQuery',
                                requiresTags: [
                                    m.r('FMassCapsuleTransformCopyToMassTag').all()
                                ],
                                requiresFragments: [
                                    m.r('FCapsuleComponentWrapperFragment').readOnly(),
                                    m.r('FTransformFragment').from(M_MASS_COMMON).readWrite(),
                                ]
                            }
                        ]
                    },
                    {
                        id: 'UMassTransformToActorCapsuleTranslator',
                        parent: U_MASS_TRANSLATOR,
                        requiresGameThread: true,
                        requiresMutatingWorldAccess: true,
                        executionFlags: E_ALL_NET_MODES,
                        executionGroup: EG_UpdateWorldFromMass,
                        executeAfter: [EG_Movement],
                        queries: [
                            {
                                id: 'EntityQuery',
                                requiresTags: [
                                    m.r('FMassCapsuleTransformCopyToActorTag').all()
                                ],
                                requiresFragments: [
                                    m.r('FCapsuleComponentWrapperFragment').readWrite(),
                                    m.r('FTransformFragment').from(M_MASS_COMMON).readOnly(),
                                ]
                            }
                        ]
                    },
                    {
                        id: 'UMassSceneComponentLocationToMassTranslator',
                        parent: U_MASS_TRANSLATOR,
                        executionFlags: E_ALL_NET_MODES,
                        executionGroup: EG_SyncWorldToMass,
                        requiresGameThread: true,
                        queries: [
                            {
                                id: 'EntityQuery',
                                requiresTags: [
                                    m.r('FMassSceneComponentLocationCopyToMassTag').all()
                                ],
                                requiresFragments: [
                                    m.r('FMassSceneComponentWrapperFragment').readOnly(),
                                    m.r('FTransformFragment').from(M_MASS_COMMON).readWrite(),
                                ]
                            }
                        ]
                    },
                    {
                        id: 'UMassSceneComponentLocationToActorTranslator',
                        parent: U_MASS_TRANSLATOR,
                        executionFlags: E_ALL_NET_MODES,
                        executionGroup: EG_UpdateWorldFromMass,
                        executeAfter: [EG_Movement],
                        queries: [
                            {
                                id: 'EntityQuery',
                                requiresTags: [
                                    m.r('FMassSceneComponentLocationCopyToActorTag').all()
                                ],
                                requiresFragments: [
                                    m.r('FMassSceneComponentWrapperFragment').readOnly(),
                                    m.r('FTransformFragment').from(M_MASS_COMMON).readWrite()
                                ],
                            }
                        ],
                        requiresMutatingWorldAccess: true
                    },
                    {
                        id: 'UMassTranslator_BehaviorTree',
                        parent: U_MASS_TRANSLATOR,
                        autoRegisters: false,
                        queries: [
                            {
                                id: 'EntityQuery',
                                requiresFragments: [
                                    m.r('FDataFragment_BehaviorTreeComponentWrapper').readWrite()
                                ]
                            }
                        ]
                    }
                ]
            })),
            declareModule('MassEQS', m => ({
                processors: [
                    {
                        id: 'UMassEnvQueryProcessorBase',
                        parent: U_MASS_PROCESSOR,
                        queries: []
                    },
                    {
                        id: 'UMassEnvQueryTestProcessor_MassEntityTags',
                        comment: `
                            Processor for completing MassEQSSubsystem Requests sent from
                            UMassEnvQueryTest_MassEntityTags
                        `,
                        displayName: 'Mass EQS Processor Base',
                        parent: { id: 'UMassEnvQueryProcessorBase', module: 'MassEQS' },
                        requiresSubsystems: [
                            m.r('UMassEQSSubsystem').readWrite()
                        ],
                        queries: []
                    },
                    {
                        id: 'UMassEnvQueryGeneratorProcessor_MassEntityHandles',
                        parent: { id: 'UMassEnvQueryProcessorBase', module: 'MassEQS' },
                        comment: `
                            Processor for completing MassEQSSubsystem Requests sent from
                            UMassEnvQueryGenerator_MassEntityHandles
                        `,
                        displayName: 'Mass Entity Handles Generator Processor',
                        queries: [
                            {
                                id: 'EntityQuery',
                                requiresFragments: [
                                    m.r('FTransformFragment').from(M_MASS_COMMON)
                                ],
                            }
                        ],
                        requiresSubsystems: [
                            m.r('UMassEQSSubsystem').readWrite()
                        ]
                    }
                ]
            })),
            declareModule('MassGameplayDebug', m => ({
                tags: [
                    declareTag('FMassDebuggableTag')
                ],
                fragments: [
                    {
                        id: 'FSimDebugVisFragment',
                        properties: [
                            { type: 'int32', name: 'InstanceIndex', defaultValue: 'INDEX_NONE' },
                            { type: 'int16', name: 'VisualType', defaultValue: 'INDEX_NONE' },
                        ]
                    },
                    {
                        id: 'FDataFragment_DebugVis',
                        properties: [
                            {
                                category: 'Debug',
                                specifiers: ['EditAnywhere'],
                                type: 'EMassEntityDebugShape',
                                name: 'Shape',
                                defaultValue: 'EMassEntityDebugShape::Box'
                            }
                        ]
                    }
                ],
                traits: [
                    {
                        id: 'UMassDebugVisualizationTrait',
                        properties: [
                            {
                                conditionals: ['WITH_EDITORONLY_DATA'],
                                specifiers: ['EditAnywhere'],
                                category: 'Mass|Spawn',
                                type: 'FAgentDebugVisualization',
                                name: 'DebugShape'
                            }
                        ],
                        addsFragments: [
                            m.frag('FSimDebugVisFragment', {
                                remark: 'Only in editor builds (WITH_EDITORONLY_DATA)'
                            }),
                            m.frag('FDataFragment_DebugVis', {
                                remark: `Will use editor-only shape 'WireShape' in editor builds`
                            }),
                            m.frag('FAgentRadiusFragment', { module: M_MASS_COMMON }),
                            m.frag('FTransformFragment', { module: M_MASS_COMMON }),
                        ],
                        addsTags: [
                            m.ref('FMassDebuggableTag', {
                                remark: 'Except in shipping and test builds'
                            })
                        ]
                    },
                ],
                processors: [
                    {
                        id: 'UDebugVisLocationProcessor',
                        executeAfter: [EG_SyncWorldToMass],
                        requiresGameThread: true,
                        queryBasedPruning: 'Never',
                        queries: [
                            {
                                id: 'EntityQuery',
                                requiresFragments: [
                                    m.r('FTransformFragment').from(M_MASS_COMMON).readOnly(),
                                    m.r('FSimDebugVisFragment').readOnly(),
                                ],
                                requiresTags: [
                                    m.r('FMassDebuggableTag').all()
                                ],
                            },
                            {
                                id: 'AllLocationEntitiesQuery',
                                requiresFragments: [
                                    m.r('FTransformFragment').from(M_MASS_COMMON).readOnly()
                                ]
                            }
                        ],
                        requiresSubsystems: [
                            m.r('UMassDebuggerSubsystem').readWrite()
                        ]
                    },
                    {
                        id: 'UMassProcessor_UpdateDebugVis',
                        executeAfter: [EG_UpdateWorldFromMass],
                        requiresGameThread: true,
                        queries: [
                            {
                                id: 'EntityQuery',
                                requiresFragments: [
                                    m.r('FTransformFragment').from(M_MASS_COMMON).readOnly(),
                                    m.r('FDataFragment_DebugVis').readWrite(),
                                    m.r('FAgentRadiusFragment').from(M_MASS_COMMON).readWrite()
                                ],
                                requiresTags: [
                                    m.r('FMassDebuggableTag').all()
                                ],
                            }
                        ],
                        requiresSubsystems: [
                            m.r('UMassDebuggerSubsystem')
                        ]
                    },
                ]
            })),
            declareModule('MassLOD', m => ({
                tags: [
                    declareTag('FMassHighLODTag'),
                    declareTag('FMassMediumLODTag'),
                    declareTag('FMassLowLODTag'),
                    declareTag('FMassOffLODTag'),
                    declareTag('FMassCollectLODViewerInfoTag'),
                    declareTag('FMassCollectDistanceLODViewerInfoTag'),
                    declareTag('FMassVisibilityCanBeSeenTag'),
                    declareTag('FMassVisibilityCulledByFrustumTag'),
                    declareTag('FMassVisibilityCulledByDistanceTag'),
                ],
                fragments: [
                    {
                        id: 'FMassViewerInfoFragment',
                        properties: [
                            {
                                comment: 'Closest viewer distance',
                                specifiers: [],
                                type: 'float',
                                name: 'ClosestViewerDistanceSq',
                                defaultValue: 'FLT_MAX'
                            },
                            {
                                comment: 'Closest distance to frustum',
                                specifiers: [],
                                type: 'float',
                                name: 'ClosestDistanceToFrustum',
                                defaultValue: 'FLT_MAX'
                            },
                        ]
                    },
                    {
                        id: 'FMassSimulationLODFragment',
                        properties: [
                            {
                                comment: 'Saved closest ViewerDistance',
                                type: 'float',
                                name: 'ClosestViewerDistanceSq',
                                defaultValue: 'FLT_MAX'
                            },
                            {
                                comment: 'OD information',
                                type: 'TEnumAsByte<EMassLOD::Type>',
                                name: 'LOD',
                                defaultValue: 'EMassLOD::Max'
                            },
                            {
                                comment: 'Previous LOD informatio',
                                type: 'TEnumAsByte<EMassLOD::Type>',
                                name: 'PrevLOD',
                                defaultValue: 'EMassLOD::Max'
                            },
                        ]
                    },
                    {
                        id: 'FMassSimulationVariableTickFragment',
                        properties: [
                            {
                                comment: 'Accumulated delta time to use upon next tick',
                                type: 'double', name: 'LastTickedTime', defaultValue: '0.'
                            },
                            { type: 'float', name: 'DeltaTime', defaultValue: '0.0f' }
                        ]
                    },
                    {
                        id: 'FMassSimulationLODParameters',
                        parent: F_MASS_CONST_SHARED_FRAGMENT,
                        properties: [
                            {
                                comment: 'Distance where each LOD becomes relevant',
                                category: 'LOD',
                                specifiers: ['EditAnywhere', 'config'],
                                type: 'float[EMassLOD::Max]',
                                name: 'LODDistance'
                            },
                            {
                                comment: 'Hysteresis percentage on delta between the LOD distances',
                                category: 'LOD',
                                specifiers: ['EditAnywhere', 'config'],
                                metaSpecifiers: {
                                    ClampMin: "0.0",
                                    UIMin: "0.0"
                                },
                                type: 'float',
                                name: 'BufferHysteresisOnDistancePercentage',
                                defaultValue: '10.0f'
                            },

                            {
                                comment: 'Maximum limit of entity per LOD',
                                category: 'LOD',
                                specifiers: ['EditAnywhere', 'config'],
                                type: 'int32[EMassLOD::Max]',
                                name: 'LODMaxCount'
                            },
                            {
                                comment: 'If true, will set the associated LOD tag on the entity',
                                category: 'LOD',
                                specifiers: ['EditAnywhere', 'config'],
                                type: 'bool',
                                name: 'bSetLODTags',
                                defaultValue: 'false'
                            }
                        ]
                    },
                    {
                        id: 'FMassSimulationVariableTickParameters',
                        parent: F_MASS_CONST_SHARED_FRAGMENT,
                        properties: [
                            {
                                comment: 'Rate in seconds at which entities should update when in this LOD',
                                specifiers: ['EditAnywhere', 'config'],
                                category: 'VariableTick',
                                type: 'float[EMassLOD::Max]',
                                name: 'TickRates',
                            },
                            {
                                comment: 'If true, will spread the first simulation update over TickRate period',
                                specifiers: ['EditAnywhere', 'config'],
                                category: 'VariableTick',
                                type: 'bool',
                                name: 'bSpreadFirstSimulationUpdate',
                                defaultValue: 'false'
                            }
                        ]
                    },
                    {
                        id: 'FMassVisualizationChunkFragment',
                        parent: F_MASS_CHUNK_FRAGMENT,
                        properties: [
                            {
                                comment: `
                                    Visibility of the current chunk, should never change
                                `,
                                specifiers: [],
                                type: 'EMassVisibility',
                                name: 'Visibility',
                                defaultValue: 'EMassVisibility::Max'
                            },
                            {
                                comment: `
                                    Not visible chunks, might contains entity that are newly visible and not yet moved.
                                `,
                                specifiers: [],
                                type: 'bool',
                                name: 'bContainsNewlyVisibleEntity',
                                defaultValue: 'true'
                            },
                            {
                                comment: `
                                    Not visible chunks delta time until next update
                                `,
                                specifiers: [],
                                type: 'float',
                                name: 'DeltaTime',
                                defaultValue: '0'
                            },
                        ]
                    },
                    {
                        id: 'FMassSimulationLODSharedFragment',
                        parent: F_MASS_SHARED_FRAGMENT
                    },
                    {
                        id: 'FMassVariableTickChunkFragment',
                        parent: F_MASS_CHUNK_FRAGMENT
                    },
                    {
                        id: 'FMassSimulationVariableTickChunkFragment',
                        parent: m.ref('FMassVariableTickChunkFragment')
                    },
                    {
                        id: 'FMassSimulationVariableTickSharedFragment',
                        parent: F_MASS_SHARED_FRAGMENT
                    }
                ],
                traits: [
                    {
                        id: 'UMassLODCollectorTrait',
                        properties: [
                            {
                                comment: `
                                    Whether we should verify that the LOD collector processor associated with this
                                    trait is enabled by default
                                `,
                                specifiers: ['EditAnywhere', 'config'],
                                metaSpecifiers: {
                                    AdvancedDisplay: ''
                                },
                                category: 'LOD',
                                type: 'bool',
                                name: 'bTestCollectorProcessor',
                                defaultValue: 'true'
                            },
                        ],
                        addsFragments: [
                            m.ref('FMassViewerInfoFragment'),
                        ],
                        addsTags: [
                            m.ref('FMassCollectLODViewerInfoTag')
                        ],
                        requiredFragments: [
                            m.ref('FTransformFragment', { module: M_MASS_COMMON })
                        ],
                        requiredProcessors: [
                            m.ref('UMassLODCollectorProcessor', {
                                remark: `
                                    Only when bTestCollectorProcessor is enabled
                                `
                            })
                        ]
                    },
                    {
                        id: 'UMassDistanceLODCollectorTrait',
                        properties: [
                            {
                                comment: `
                                    Whether we should verify that the LOD collector processor associated with this
                                    trait is enabled by default
                                `,
                                specifiers: ['EditAnywhere', 'config'],
                                metaSpecifiers: {
                                    AdvancedDisplay: ''
                                },
                                category: 'LOD',
                                type: 'bool',
                                name: 'bTestCollectorProcessor',
                                defaultValue: 'true'
                            },
                        ],
                        addsFragments: [
                            m.ref('FMassViewerInfoFragment'),
                        ],
                        addsTags: [
                            m.ref('FMassCollectLODViewerInfoTag')
                        ],
                        requiredFragments: [
                            m.ref('FTransformFragment', { module: M_MASS_COMMON })
                        ],
                        requiredProcessors: [
                            m.ref('UMassLODDistanceCollectorProcessor', {
                                remark: `
                                    Only when bTestCollectorProcessor is enabled
                                `
                            })
                        ]
                    },
                    {
                        id: 'UMassSimulationLODTrait',
                        properties: [
                            {
                                specifiers: ['EditAnywhere'],
                                category: 'Config',
                                type: 'FMassSimulationLODParameters',
                                name: 'Params'
                            },

                            {
                                specifiers: ['EditAnywhere'],
                                category: 'Config',
                                type: 'bool',
                                name: 'bEnableVariableTicking',
                                defaultValue: 'false'
                            },

                            {
                                specifiers: ['EditAnywhere'],
                                category: 'Config',
                                type: 'FMassSimulationVariableTickParameters',
                                name: 'VariableTickParams',
                                metaSpecifiers: {
                                    EditCondition: "bEnableVariableTicking",
                                    EditConditionHides: ''
                                }
                            },
                        ],
                        requiredFragments: [
                            m.ref('FMassViewerInfoFragment'),
                            m.ref('FTransformFragment', { module: M_MASS_COMMON })
                        ],
                        addsFragments: [
                            m.ref('FMassSimulationLODFragment'),
                            m.ref('FMassSimulationLODParameters'),
                            m.ref('FMassSimulationLODSharedFragment'),
                            m.ref('FMassSimulationVariableTickFragment', {
                                remark: `
                                    Only when bEnableVariableTicking
                                `
                            }),
                            m.ref('FMassSimulationVariableTickChunkFragment', {
                                remark: `
                                    Only when bEnableVariableTicking
                                `
                            }),
                            m.ref('FMassSimulationVariableTickParameters', {
                                remark: `
                                    Only when bEnableVariableTicking
                                `
                            }),
                            m.ref('FMassSimulationVariableTickSharedFragment', {
                                remark: `
                                    Only when bEnableVariableTicking
                                `
                            })
                        ],
                        addsTags: [
                            m.ref('FMassOffLODTag', {
                                remark: `Only if Params.bSetLODTags or bEnableVariableTicking is set`
                            })
                        ]
                    },
                ],
                processors: [
                    {
                        id: 'UMassLODCollectorProcessor',
                        parent: U_MASS_PROCESSOR,
                        comment: `
                            LOD collector which combines collection of LOD information for both Viewer and Simulation
                            LODing when possible.
                        `,
                        displayName: 'LOD Collector',
                        autoRegisters: false,
                        executionFlags: E_ALL_NET_MODES,
                        executionGroup: EG_LODCollector,
                        executeAfter: [EG_SyncWorldToMass],
                        requiresSubsystems: [m.r('UMassLODSubsystem').readOnly()],
                        queries: [
                            {
                                id: 'BaseQuery',
                                remark: unindent(
                                    `
                                    All other queries are based on this query.
                                    `
                                ),
                                requiresTags: [
                                    m.r('FMassCollectLODViewerInfoTag').all()
                                ],
                                requiresFragments: [
                                    m.r('FTransformFragment').from(M_MASS_COMMON).readOnly(),
                                    m.r('FMassViewerInfoFragment').readWrite(),
                                    m.r('FMassSimulationVariableTickChunkFragment').readOnly().optional(),
                                    m.r('FMassVisualizationChunkFragment').readOnly().optional(),
                                ]
                            },
                            {
                                id: 'EntityQuery_VisibleRangeAndOnLOD',
                                remark: `(Includes the requirements of BaseQuery)`,
                                comment: `
                                    All entities that are in visible range and are On LOD
                                `,
                                requiresTags: [
                                    m.r('FMassVisibilityCulledByDistanceTag').none(),
                                    m.r('FMassOffLODTag').none()
                                ]
                            },
                            {
                                id: 'EntityQuery_VisibleRangeOnly',
                                remark: `(Includes the requirements of BaseQuery)`,
                                comment: `
                                    All entities that are in visible range but are Off LOD
                                `,
                                requiresTags: [
                                    m.r('FMassVisibilityCulledByDistanceTag').none(),
                                    m.r('FMassOffLODTag').all()
                                ]
                            },
                            {
                                id: 'EntityQuery_OnLODOnly',
                                remark: `(Includes the requirements of BaseQuery)`,
                                comment: `
                                    All entities that are NOT in visible range but are On LOD
                                `,
                                requiresTags: [
                                    m.r('FMassVisibilityCulledByDistanceTag').all(),
                                    m.r('FMassOffLODTag').none()
                                ]
                            },
                            {
                                id: 'EntityQuery_NotVisibleRangeAndOffLOD',
                                remark: `(Includes the requirements of BaseQuery)`,
                                comment: `
                                    All entities that are Not in visible range and are at Off LOD
                                `,
                                requiresTags: [
                                    m.r('FMassVisibilityCulledByDistanceTag').all(),
                                    m.r('FMassOffLODTag').all()
                                ]
                            },
                        ]
                    },
                    {
                        id: 'UMassLODDistanceCollectorProcessor',
                        parent: U_MASS_PROCESSOR,
                        comment: `
                            LOD Distance collector which combines collection of LOD information for both Viewer and
                            Simulation LODing. This collector cares only about the entities' distance to LOD viewer
                            location, nothing else. Matches MassDistanceLODProcessor logic which uses the same
                            Calculator LODLogic
                        `,
                        displayName: 'LOD Distance Collector',
                        requiresSubsystems: [m.r('UMassLODSubsystem')],
                        executionFlags: E_ALL_NET_MODES,
                        executionGroup: EG_LODCollector,
                        executeAfter: [EG_SyncWorldToMass],
                        queries: [
                            {
                                id: 'BaseQuery',
                                remark: unindent(
                                    `
                                    All other queries are based on this query.
                                    `
                                ),
                                requiresTags: [
                                    m.r('FMassCollectDistanceLODViewerInfoTag').all(),
                                ],
                                requiresFragments: [
                                    m.r('FTransformFragment').from(M_MASS_COMMON).readOnly(),
                                    m.r('FMassViewerInfoFragment').readWrite(),
                                    m.r('FMassSimulationVariableTickChunkFragment').readOnly().optional(),
                                    m.r('FMassVisualizationChunkFragment').readOnly().optional(),
                                ]
                            },
                            {
                                id: 'EntityQuery_RelevantRangeAndOnLOD',
                                comment: 'All entities that are in relevant range and are On LOD',
                                remark: `(Includes the requirements of BaseQuery)`,
                                requiresTags: [
                                    m.r('FMassVisibilityCulledByDistanceTag').none(),
                                    m.r('FMassOffLODTag').none()
                                ]
                            },
                            {
                                id: 'EntityQuery_RelevantRangeOnly',
                                comment: 'All entities that are in relevant range but are Off LOD',
                                remark: `(Includes the requirements of BaseQuery)`,
                                requiresTags: [
                                    m.r('FMassVisibilityCulledByDistanceTag').none(),
                                    m.r('FMassOffLODTag').all(),
                                ]
                            },
                            {
                                id: 'EntityQuery_OnLODOnly',
                                comment: 'All entities that are NOT in relevant range but are On LOD',
                                remark: `(Includes the requirements of BaseQuery)`,
                                requiresTags: [
                                    m.r('FMassVisibilityCulledByDistanceTag').all(),
                                    m.r('FMassOffLODTag').none(),
                                ]
                            },
                            {
                                id: 'EntityQuery_NotRelevantRangeAndOffLOD',
                                comment: 'All entities that are Not in relevant range and are at Off LOD',
                                remark: `(Includes the requirements of BaseQuery)`,
                                requiresTags: [
                                    m.r('FMassVisibilityCulledByDistanceTag').all(),
                                    m.r('FMassOffLODTag').all(),
                                ]
                            },
                        ]
                    },
                    {
                        id: 'UMassSimulationLODProcessor',
                        displayName: 'Simulation LOD',
                        parent: U_MASS_PROCESSOR,
                        executionFlags: E_ALL_NET_MODES,
                        executionGroup: EG_LOD,
                        executeAfter: [EG_LODCollector],
                        requiresSubsystems: [m.r('UMassLODSubsystem').readOnly(),],
                        queries: [
                            {
                                id: 'EntityQuery',
                                requiresFragments: [
                                    m.r('FTransformFragment').from(M_MASS_COMMON).readOnly(),
                                    m.r('FMassViewerInfoFragment').readOnly(),
                                    m.r('FMassSimulationLODFragment').readWrite(),
                                    m.r('FMassSimulationLODParameters'),
                                    m.r('FMassSimulationLODSharedFragment').readWrite(),
                                    m.r('FMassSimulationVariableTickChunkFragment').readOnly().optional(),
                                    m.r('FMassSimulationVariableTickSharedFragment').readOnly().optional(),
                                ]
                            },
                            {
                                id: 'EntityQueryCalculateLOD',
                                remark: unindent(
                                    `
                                    Same requirements as EntityQuery, with a chunk filter looking for chunks that need
                                    LOD calculated.
                                    `
                                ),
                            },
                            {
                                id: 'EntityQueryAdjustDistances',
                                remark: unindent(
                                    `
                                    Same requirements as EntityQuery, with a chunk filter looking for chunks that need
                                    distances to be adjusted.
                                    `
                                ),
                            },
                            {
                                id: 'EntityQueryVariableTick',
                                requiresFragments: [
                                    m.r('FMassSimulationLODFragment'),
                                    m.r('FMassSimulationVariableTickFragment'),
                                    m.r('FMassSimulationVariableTickParameters'),
                                    m.r('FMassSimulationVariableTickChunkFragment'),
                                    m.r('FMassSimulationVariableTickSharedFragment'),
                                ]
                            },
                            {
                                id: 'EntityQuerySetLODTag',
                                requiresFragments: [
                                    m.r('FMassSimulationLODFragment'),
                                    m.r('FMassSimulationVariableTickFragment'),
                                    m.r('FMassSimulationLODParameters'),
                                ]
                            },
                        ]
                    }
                ]
            })),
            declareModule('MassMovement', m => ({
                tags: [
                    declareTag('FMassSimpleMovementTag'),
                    declareTag('FMassCodeDrivenMovementTag')
                ],
                fragments: [
                    {
                        id: 'FMassVelocityFragment',
                        properties: [

                            {
                                type: 'FVector',
                                name: 'Value',
                                defaultValue: 'FVector::ZeroVector'
                            },
                            {
                                conditionals: ['WITH_MASSGAMEPLAY_DEBUG'],
                                type: 'FVector',
                                name: 'DebugPreviousValue',
                                defaultValue: 'FVector::ZeroVector'
                            }
                        ]
                    },
                    {
                        id: 'FMassDesiredMovementFragment',
                        properties: [
                            { type: 'FVector', name: 'DesiredVelocity', defaultValue: 'FVector::ZeroVector' },
                            { type: 'FQuat', name: 'DesiredFacing', defaultValue: 'FQuat::Identity' },
                            { type: 'float', name: 'DesiredMaxSpeedOverride', defaultValue: 'FLT_MAX' },
                        ]
                    },
                    {
                        id: 'FMassForceFragment',
                        properties: [
                            { type: 'FVector', name: 'Value', defaultValue: 'FVector::ZeroVector' },
                        ]
                    },
                    {
                        id: 'FMassMovementParameters',
                        parent: F_MASS_CONST_SHARED_FRAGMENT,
                        properties: [
                            {
                                comment: 'Maximum speed (cm/s).',
                                category: 'Movement',
                                metaSpecifiers: {
                                    ClampMin: "0",
                                    ForceUnits: "cm/s"
                                },
                                specifiers: ['EditAnywhere'],
                                type: 'float',
                                name: 'MaxSpeed',
                                defaultValue: '200.f'
                            },
                            {
                                comment: '200..600 Smaller steering maximum acceleration makes the steering more \"calm\" but less opportunistic, may not find solution, or gets stuck.',
                                category: 'Movement',
                                metaSpecifiers: {
                                    UIMin: '0.0',
                                    ClampMin: '0.0',
                                    ForceUnits: "cm/s^2"
                                },
                                specifiers: ['config', 'EditAnywhere'],
                                type: 'float',
                                name: 'MaxAcceleration',
                                defaultValue: '250.f'
                            },
                            {
                                comment: 'Default desired speed (cm/s).',
                                category: 'Movement',
                                metaSpecifiers: {
                                    ClampMin: "0",
                                    ForceUnits: "cm/s"
                                },
                                specifiers: ['EditAnywhere'],
                                type: 'float',
                                name: 'DefaultDesiredSpeed',
                                defaultValue: '140.f'
                            },
                            {
                                comment: 'How much default desired speed is varied randomly.',
                                category: 'Movement',
                                metaSpecifiers: {
                                    ClampMin: "0",
                                    ClampMax: "1"
                                },
                                specifiers: ['EditAnywhere'],
                                type: 'float',
                                name: 'DefaultDesiredSpeedVariance',
                                defaultValue: '0.1f'
                            },
                            {
                                comment: 'The time it takes the entity position to catchup to the requested height.',
                                category: 'Movement',
                                metaSpecifiers: {
                                    ClampMin: "0.0",
                                    ForceUnits: "s"
                                },
                                specifiers: ['EditAnywhere'],
                                type: 'float',
                                name: 'HeightSmoothingTime',
                                defaultValue: '0.2f'
                            },

                            {
                                comment: 'List of supported movement styles for this configuration.',
                                category: 'Movement',
                                specifiers: ['EditAnywhere'],
                                type: 'TArray<FMassMovementStyleParameters>',
                                name: 'MovementStyles'
                            },
                            {
                                comment: `
                                    Indicate whether mass AI has direct control over the mass agent's velocity.
                                    If true, desired velocity will be written directly to velocity every frame
                                `,
                                category: 'Movement',
                                specifiers: ['EditAnywhere'],
                                type: 'bool',
                                name: 'bIsCodeDrivenMovement',
                                defaultValue: 'true'
                            },
                        ]
                    },
                ],
                traits: [
                    {
                        id: 'UMassSimpleMovementTrait',
                        properties: [],
                        addsFragments: [
                            m.ref('FTransformFragment', { module: M_MASS_COMMON }),
                            m.ref('FMassVelocityFragment', { module: 'MassMovement' })
                        ],
                        addsTags: [
                            m.ref('FMassSimpleMovementTag')
                        ]
                    },
                    {
                        id: 'UMassVelocityRandomizerTrait',
                        addsFragments: [
                            m.ref('FMassVelocityFragment', {
                                remark: unindent(
                                    `
                                    Initialized to X=MinSpeed, Y=MaxSpeed and Z=1 (if bSetZComponent, otherwise set to
                                    0). This is a hack to support sending these parameters to initializer.
                                    `
                                )
                            })
                        ],
                        properties: [
                            {
                                comment: `
                                    The speed is expressed in UnrealUnits per second, which usually translates to
                                    0.01m/s
                                `,
                                specifiers: ['EditAnywhere'],
                                category: 'Velocity',
                                metaSpecifiers: {
                                    UIMin: '0.0',
                                    ClampMin: '0.0'
                                },
                                type: 'float',
                                name: 'MinSpeed',
                                defaultValue: '0.f'
                            },
                            {
                                comment: `
                                    The speed is expressed in UnrealUnits per second, which usually translates to
                                    0.01m/s
                                `,
                                specifiers: ['EditAnywhere'],
                                category: 'Velocity',
                                metaSpecifiers: {
                                    UIMin: '1.0',
                                    ClampMin: '1.0'
                                },
                                type: 'float',
                                name: 'MaxSpeed',
                                defaultValue: '200.f'
                            },
                            {
                                specifiers: ['EditAnywhere'],
                                category: 'Velocity',
                                type: 'bool',
                                name: 'bSetZComponent',
                                defaultValue: 'false'
                            },
                        ]
                    },
                    {
                        id: 'UMassMovementTrait',
                        requiredFragments: [
                            m.ref('FAgentRadiusFragment', { module: M_MASS_COMMON }),
                            m.ref('FTransformFragment', { module: M_MASS_COMMON }),
                        ],
                        addsFragments: [
                            m.ref('FMassVelocityFragment'),
                            m.ref('FMassForceFragment'),
                            m.ref('FMassDesiredMovementFragment'),
                            m.ref('FMassMovementParameters'),
                        ],
                        addsTags: [
                            m.ref('FMassCodeDrivenMovementTag', {
                                remark: unindent(
                                    `
                                    Only when Movement.bIsCodeDrivenMovement is true
                                    `
                                )
                            })
                        ],
                        properties: [
                            {
                                category: 'Movement',
                                specifiers: ['EditAnywhere'],
                                type: 'FMassMovementParameters',
                                name: 'Movement'
                            },
                        ]
                    },
                ],
                processors: [
                    {
                        id: 'UMassSimpleMovementProcessor',
                        executionFlags: E_ALL_NET_MODES,
                        executionGroup: EG_Avoidance,
                        queries: [
                            {
                                id: 'EntityQuery',
                                requiresFragments: [
                                    m.r('FMassVelocityFragment').readOnly(),
                                    m.r('FTransformFragment').from(M_MASS_COMMON).readWrite(),
                                    m.r('FMassSimulationVariableTickFragment').from('MassLOD').readOnly().optional(),
                                    m.r('FMassSimulationVariableTickChunkFragment').from('MassLOD').readOnly().optional(),
                                ],
                                requiresTags: [
                                    m.r('FMassSimpleMovementTag').all()
                                ]
                            }
                        ]
                    },
                    {
                        id: 'UMassApplyForceProcessor',
                        comment: `
                            Calculate desired movement based on input forces
                        `,
                        executionFlags: E_ALL_NET_MODES,
                        executionGroup: EG_ApplyForces,
                        executeAfter: [EG_Avoidance],
                        queries: [
                            {
                                id: 'EntityQuery',
                                requiresFragments: [
                                    m.r('FMassDesiredMovementFragment').readWrite(),
                                    m.r('FMassForceFragment').readWrite(),
                                ],
                                requiresTags: [
                                    m.r('FMassOffLODTag').from('MassLOD').none()
                                ]
                            }
                        ]
                    },
                    {
                        id: 'UMassApplyMovementProcessor',
                        parent: U_MASS_PROCESSOR,
                        comment: `
                            Updates entities position based on desired velocity.
                            Only required for agents that have code driven displacement
                            Not applied on Off-LOD entities.
                        `,
                        executionFlags: E_ALL_NET_MODES,
                        executionGroup: EG_Movement,
                        executeAfter: [EG_ApplyForces],
                        queries: [
                            {
                                id: 'EntityQuery',
                                requiresFragments: [
                                    m.r('FMassVelocityFragment').readWrite(),
                                    m.r('FTransformFragment').readWrite(),
                                    m.r('FMassDesiredMovementFragment').readOnly(),
                                ],
                                requiresTags: [
                                    m.r('FMassOffLODTag').none(),
                                    m.r('FMassCodeDrivenMovementTag').all()
                                ]
                            }
                        ]
                    }
                ]
            })),
            declareModule('MassReplication', m => ({
                tags: [
                    declareTag('FMassInReplicationGridTag')
                ],
                fragments: [
                    {
                        id: 'FMassNetworkIDFragment',
                        properties: [
                            { type: 'FMassNetworkID', name: 'NetID' }
                        ]
                    },
                    {
                        id: 'FMassReplicatedAgentFragment',
                        properties: [
                            { type: 'FMassReplicatedAgentData', name: 'AgentData' }
                        ]
                    },
                    {
                        id: 'FMassReplicationViewerInfoFragment',
                        properties: [
                            {
                                comment: `Closest viewer distance`,
                                type: 'float',
                                name: 'ClosestViewerDistanceSq'
                            },
                            {
                                comment: `Distance between each viewer and entity`,
                                type: 'TArray<float>',
                                name: 'DistanceToViewerSq'
                            },
                        ]
                    },
                    {
                        id: 'FMassReplicationLODFragment',
                        properties: [
                            {
                                comment: `LOD information `,
                                type: 'TEnumAsByte<EMassLOD::Type>',
                                name: 'LOD',
                                defaultValue: 'EMassLOD::Max'
                            },
                            {
                                comment: ` Previous LOD information`,
                                type: 'TEnumAsByte<EMassLOD::Type>',
                                name: 'PrevLOD',
                                defaultValue: 'EMassLOD::Max'
                            },
                        ]
                    },
                    {
                        id: 'FMassReplicationGridCellLocationFragment',
                        properties: [
                            { type: 'FReplicationHashGrid2D::FCellLocation', name: 'CellLoc' }
                        ]
                    },
                    {
                        id: 'FMassReplicationParameters',
                        parent: F_MASS_CONST_SHARED_FRAGMENT,
                        properties: [
                            {
                                comment: `Distance where each LOD becomes relevant`,
                                category: `Mass|LOD`,
                                specifiers: ['EditAnywhere', 'config'],
                                type: 'float[EMassLOD::Max]',
                                name: 'LODDistance',
                            },
                            {
                                comment: `Hysteresis percentage on delta between the LOD distances`,
                                category: `Mass|LOD`,
                                metaSpecifiers: {
                                    ClampMin: "0.0",
                                    UIMin: "0.0"
                                },
                                specifiers: ['EditAnywhere', 'config'],
                                type: 'float',
                                name: 'BufferHysteresisOnDistancePercentage',
                                defaultValue: '10.0f'
                            },
                            {
                                comment: `Maximum limit of entity per LOD`,
                                category: `Mass|LOD`,
                                specifiers: ['EditAnywhere', 'config'],
                                type: 'int32[EMassLOD::Max]',
                                name: 'LODMaxCount',
                            },
                            {
                                comment: `Maximum limit of entity per LOD per viewer`,
                                category: `Mass|LOD`,
                                specifiers: ['EditAnywhere', 'config'],
                                type: 'int32[EMassLOD::Max]',
                                name: 'LODMaxCountPerViewer',
                            },
                            {
                                comment: `Distance where each LOD becomes relevant`,
                                category: `Mass|LOD`,
                                specifiers: ['EditAnywhere', 'config'],
                                type: 'float[EMassLOD::Max]',
                                name: 'UpdateInterval',
                            },
                            {
                                specifier: ['EditAnywhere', 'config'],
                                category: `Mass|Replication`,
                                type: 'TSubclassOf<AMassClientBubbleInfoBase>',
                                name: 'BubbleInfoClass'
                            },
                            {
                                specifier: ['EditAnywhere', 'config'],
                                category: `Mass|Replication`,
                                type: 'TSubclassOf<UMassReplicatorBase>',
                                name: 'ReplicatorClass'
                            },
                        ]
                    },
                    {
                        id: 'FMassReplicationSharedFragment',
                        parent: F_MASS_SHARED_FRAGMENT
                    }
                ],
                traits: [
                    {
                        id: 'UMassReplicationTrait',
                        remark: unindent(
                            `
                            # Additional Requirements
                            Has no effect on Standalone (local multiplayer) worlds.
                            `
                        ),
                        properties: [
                            {
                                specifiers: ['EditAnywhere'],
                                category: 'Mass|Replication',
                                type: 'FMassReplicationParameters',
                                name: 'Params'
                            },
                        ],
                        addsFragments: [
                            m.ref('FReplicationTemplateIDFragment', { module: 'MassSpawner' }),
                            m.ref('FMassNetworkIDFragment'),
                            m.ref('FMassReplicatedAgentFragment'),
                            m.ref('FMassReplicationViewerInfoFragment'),
                            m.ref('FMassReplicationLODFragment'),
                            m.ref('FMassReplicationGridCellLocationFragment'),
                            m.ref('FMassReplicationParameters'),
                            m.ref('FMassReplicationSharedFragment')
                        ]
                    },
                ],
                processors: [
                    {
                        id: 'UMassReplicationGridProcessor',
                        comment: `
                            Processor to update entity in the replication grid used to fetch entities close to
                            clients
                        `,
                        remark: unindent(
                            `
                            <br/>

                            > [!WARNING]
                            > The query setup for this processor is a bit complicated, I may have made mistakes in
                            > the queries below.

                            <br/>
                            `
                        ),
                        executionFlags: ['Server'], // TODO: This is conditionally compiled
                        processingPhase: 'PostPhysics',
                        queries: [
                            {
                                id: 'AddToGridEntityQuery',
                                requiresFragments: [
                                    m.r('FTransformFragment').from(M_MASS_COMMON).readOnly(),
                                    m.r('FMassReplicationGridCellLocationFragment').readWrite(),
                                    m.r('FAgentRadiusFragment').from(M_MASS_COMMON).readOnly()
                                ],
                                requiresTags: [
                                    m.r('FMassOffLODTag').from('MassLOD').none(),
                                    m.r('FMassInReplicationGridTag').none(),
                                ],
                                requiresSubsystems: [
                                    m.r('UMassReplicationSubsystem').readWrite()
                                ]
                            },
                            {
                                id: 'RemoveFromGridEntityQuery',
                                requiresFragments: [
                                    m.r('FTransformFragment').from(M_MASS_COMMON).readOnly(),
                                    m.r('FMassReplicationGridCellLocationFragment').readWrite(),
                                ],
                                requiresTags: [
                                    m.r('FMassOffLODTag').none(),
                                    m.r('FMassInReplicationGridTag').all()
                                ],
                                requiresSubsystems: [
                                    m.r('UMassReplicationSubsystem').readWrite()
                                ]
                            },
                            {
                                id: 'UpdateGridEntityQuery',
                                requiresFragments: [
                                    m.r('FTransformFragment').from(M_MASS_COMMON).readOnly(),
                                    m.r('FMassReplicationGridCellLocationFragment').readWrite(),
                                    m.r('FAgentRadiusFragment').from(M_MASS_COMMON).readOnly()
                                ],
                                requiresTags: [
                                    m.r('FMassOffLODTag').from('MassLOD').none(),
                                    m.r('FMassInReplicationGridTag').all(),
                                ],
                                requiresSubsystems: [
                                    m.r('UMassReplicationSubsystem').readWrite()
                                ]
                            }
                        ]

                    },
                    {
                        id: 'UMassReplicationProcessor',
                        comment: `
                            Base processor that handles replication and only runs on the server. You should derive from
                            this per entity type (that require different replication processing). It and its derived
                            classes query Mass entity fragments and set those values for replication when appropriate,
                            using the MassClientBubbleHandler.
                        `,
                        executionFlags: ['Server'], // TODO: conditional
                        processingPhase: 'PostPhysics',
                        requiresGameThread: true,
                        requiresSubsystems: [
                            m.r('UMassLODSubsystem').readOnly(),
                        ],
                        queries: [
                            {
                                id: 'SyncClientData',
                                requiresFragments: [
                                    m.r('FMassReplicationLODFragment').readWrite(),
                                    m.r('FMassReplicatedAgentFragment').readWrite(),
                                ]
                            },
                            {
                                id: 'CollectorViewerInfoQuery',
                                requiresFragments: [
                                    m.r('FTransformFragment').from(M_MASS_COMMON).readOnly(),
                                    m.r('FMassReplicationViewerInfoFragment').readWrite(),
                                    m.r('FMassReplicationSharedFragment').readWrite(),
                                ]
                            },
                            {
                                id: 'CalculateLODQuery',
                                requiresFragments: [
                                    m.r('FMassReplicationViewerInfoFragment').readOnly(),
                                    m.r('FMassReplicationLODFragment').readWrite(),
                                    m.r('FMassReplicationParameters'),
                                    m.r('FMassReplicationSharedFragment').readWrite(),
                                ]
                            },
                            {
                                id: 'AdjustLODDistancesQuery',
                                requiresFragments: [
                                    m.r('FMassReplicationViewerInfoFragment').readOnly(),
                                    m.r('FMassReplicationLODFragment').readWrite(),
                                    m.r('FMassReplicationSharedFragment').readWrite(),
                                ]
                            },
                            {
                                id: 'EntityQuery',
                                requiresFragments: [
                                    m.r('FMassNetworkIDFragment').readOnly(),
                                    m.r('FReplicationTemplateIDFragment').readOnly(),
                                    m.r('FMassReplicationLODFragment').readWrite(),
                                    m.r('FMassReplicatedAgentFragment').readWrite(),
                                    m.r('FMassReplicationParameters'),
                                    m.r('FMassReplicationSharedFragment').readWrite(),
                                ]
                            }
                        ]
                    }
                ]
            })),
            declareModule('MassRepresentation', m => ({
                tags: [
                    declareTag('FMassDistanceLODProcessorTag'),
                    declareTag('FMassStaticRepresentationTag'),
                    declareTag('FMassVisualizationProcessorTag'),
                    declareTag('FMassStationaryISMSwitcherProcessorTag'),
                    declareTag('FMassVisualizationLODProcessorTag')
                ],
                fragments: [
                    {
                        id: 'FMassRepresentationLODFragment',
                        properties: [
                            {
                                comment: `LOD information`,
                                specifiers: [],
                                type: 'TEnumAsByte<EMassLOD::Type>', name: 'LOD', defaultValue: 'EMassLOD::Max'
                            },
                            {
                                specifiers: [],
                                type: 'TEnumAsByte<EMassLOD::Type>', name: 'PrevLOD', defaultValue: 'EMassLOD::Max'
                            },
                            {
                                comment: `Visibility Info`,
                                specifiers: [],
                                type: 'EMassVisibility', name: 'Visibility', defaultValue: 'EMassVisibility::Max'
                            },
                            {
                                specifiers: [],
                                type: 'EMassVisibility', name: 'PrevVisibility', defaultValue: 'EMassVisibility::Max'
                            },
                            {
                                comment: `Value scaling from 0 to 3, 0 highest LOD we support and 3 being completely off LOD`,
                                specifiers: [],
                                type: 'float', name: 'LODSignificance', defaultValue: '0.0f'
                            },
                        ]
                    },
                    {
                        id: 'FMassRepresentationFragment',
                        properties: [
                            {
                                specifiers: [],
                                type: 'EMassRepresentationType', name: 'CurrentRepresentation', defaultValue: 'EMassRepresentationType::None'
                            },
                            {
                                specifiers: [],
                                type: 'EMassRepresentationType', name: 'PrevRepresentation', defaultValue: 'EMassRepresentationType::None'
                            },
                            {
                                specifiers: [],
                                type: 'int16', name: 'HighResTemplateActorIndex', defaultValue: 'INDEX_NONE'
                            },
                            {
                                specifiers: [],
                                type: 'int16', name: 'LowResTemplateActorIndex', defaultValue: 'INDEX_NONE'
                            },
                            {
                                specifiers: [],
                                type: 'FStaticMeshInstanceVisualizationDescHandle', name: 'StaticMeshDescHandle'
                            },
                            {
                                specifiers: [],
                                type: 'FMassActorSpawnRequestHandle', name: 'ActorSpawnRequestHandle'
                            },
                            {
                                specifiers: [],
                                type: 'FTransform', name: 'PrevTransform'
                            },
                            {
                                comment: 'Value scaling from 0 to 3, 0 highest LOD we support and 3 being completely off LOD',
                                specifiers: [],
                                type: 'float', name: 'PrevLODSignificance', defaultValue: '-1.0f'
                            },
                        ]
                    },
                    {
                        id: 'FMassRepresentationParameters',
                        parent: F_MASS_CONST_SHARED_FRAGMENT,
                        properties: [
                            {
                                comment: `Allow subclasses to override the representation actor management behavior`,
                                specifiers: ['EditAnywhere'],
                                category: 'Mass|Visual',
                                metaSpecifiers: {
                                    EditCondition: 'bCanModifyRepresentationActorManagementClass'
                                },
                                type: 'TSubclassOf<UMassRepresentationActorManagement>',
                                name: 'RepresentationActorManagementClass'
                            },
                            {
                                comment: `What should be the representation of this entity for each specific LOD`,
                                specifiers: ['EditAnywhere', 'config'],
                                category: 'Mass|Representation',
                                type: 'EMassRepresentationType[EMassLOD::Max]',
                                name: 'LODRepresentation',
                                defaultValue: '{ EMassRepresentationType::HighResSpawnedActor, EMassRepresentationType::LowResSpawnedActor, EMassRepresentationType::StaticMeshInstance, EMassRepresentationType::None }'
                            },

                            {
                                comment: `
                                    If true, forces UMassRepresentationProcessor to override the
                                    WantedRepresentationType to actor representation whenever an external (non Mass
                                    owned) actor is set on an entitie's FMassActorFragment fragment. If / when the
                                    actor fragment is reset, WantedRepresentationType resumes selecting the
                                    appropriate representation for the current representation LOD.

                                    Useful for server-authoritative actor spawning to force actor representation on
                                    clients for replicated actors.
                                `,
                                specifiers: ['EditAnywhere', 'config'],
                                category: 'Mass|Representation',
                                type: 'uint8:1',
                                name: 'bForceActorRepresentationForExternalActors',
                                defaultValue: 'false'
                            },
                            {
                                comment: ``,
                                specifiers: ['EditAnywhere', 'config'],
                                category: 'Mass|Representation',
                                type: 'uint8:1',
                                name: 'bKeepLowResActors',
                                defaultValue: 'true'
                            },
                            {
                                comment: `
                                    When switching to ISM keep the actor an extra frame, helps cover rendering
                                    glitches (i.e. occlusion query being one frame late)
                                `,
                                specifiers: ['EditAnywhere', 'config'],
                                category: 'Mass|Representation',
                                type: 'uint8:1',
                                name: 'bKeepActorExtraFrame'
                            },
                            {
                                comment: `
                                    If true, will spread the first visualization update over the period specified
                                    in NotVisibleUpdateRate member
                                `,
                                specifiers: ['EditAnywhere', 'config'],
                                category: 'Mass|Representation',
                                type: 'uint8:1',
                                name: 'bSpreadFirstVisualizationUpdate',
                                defaultValue: 'false'
                            },
                            {
                                comment: `the property is marked like this to ensure it won't show up in UI`,
                                specifiers: ['EditDefaultsOnly'],
                                category: 'Mass|Visual',
                                type: 'uint8:1',
                                conditionals: ['WITH_EDITORONLY_DATA'],
                                name: 'bCanModifyRepresentationActorManagementClass',
                                defaultValue: 'true'
                            },
                            {
                                comment: `
                                    World Partition grid name to test collision against, default None will be the
                                    main grid
                                `,
                                specifiers: ['EditAnywhere', 'config'],
                                category: 'Mass|Representation',
                                type: 'FName',
                                name: 'WorldPartitionGridNameContainingCollision'
                            },
                            {
                                comment: `At what rate should the not visible entity be updated in seconds`,
                                specifiers: ['EditAnywhere', 'config'],
                                category: 'Mass|Visualization',
                                type: 'float',
                                name: 'NotVisibleUpdateRate',
                                defaultValue: '0.5f'
                            },
                            {
                                comment: `Default representation when unable to spawn an actor, gets calculated at initialization`,
                                specifiers: ['Transient'],
                                category: '',
                                type: 'EMassRepresentationType',
                                mutable: true,
                                name: 'CachedDefaultRepresentationType',
                                defaultValue: 'EMassRepresentationType::None',
                            },
                            {
                                comment: ``,
                                specifiers: ['Transient'],
                                category: '',
                                mutable: true,
                                type: 'TObjectPtr<UMassRepresentationActorManagement>',
                                name: 'CachedRepresentationActorManagement',
                                defaultValue: 'nullptr'
                            }
                        ]
                    },
                    {
                        id: 'FMassRepresentationSubsystemSharedFragment',
                        parent: F_MASS_SHARED_FRAGMENT,
                        properties: [
                            {
                                specifiers: ['Transient'],
                                type: 'TObjectPtr<UMassRepresentationSubsystem>',
                                name: 'RepresentationSubsystem',
                                defaultValue: 'nullptr'
                            }
                        ]
                    },
                    {
                        id: 'FMassVisualizationLODParameters',
                        parent: F_MASS_CONST_SHARED_FRAGMENT,
                        properties: [
                            {
                                comment: `Distances where each LOD becomes relevant`,
                                specifiers: ['EditAnywhere', 'config'],
                                category: 'Mass|LOD',
                                type: 'float[EMassLOD::Max]',
                                name: 'BaseLODDistance',
                                defaultValue: '{ 0.f, 1000.f, 2500.f, 10000.f }'
                            },
                            {
                                comment: ``,
                                specifiers: ['EditAnywhere', 'config'],
                                category: 'Mass|LOD',
                                type: 'float[EMassLOD::Max]',
                                name: 'VisibleLODDistance',
                                defaultValue: '{ 0.f, 2000.f, 4000.f, 15000.f }'
                            },
                            {
                                comment: ``,
                                specifiers: ['EditAnywhere', 'config'],
                                category: 'Mass|LOD',
                                type: 'float',
                                name: 'BufferHysteresisOnDistancePercentage',
                                metaSpecifiers: {
                                    ClampMin: "0.0",
                                    UIMin: "0.0"
                                },
                                defaultValue: '10.0f'
                            },
                            {
                                comment: `Maximum limit for each entity per LOD`,
                                specifiers: ['EditAnywhere', 'config'],
                                category: 'Mass|LOD',
                                type: 'int32[EMassLOD::Max]',
                                name: 'LODMaxCount',
                                defaultValue: '{50, 100, 500, MAX_int32}'
                            },
                            {
                                comment: `Entities within this distance from frustum will be considered visible. Expressed in Unreal Units.`,
                                specifiers: ['EditAnywhere', 'config'],
                                category: 'Mass|LOD',
                                type: 'float',
                                name: 'DistanceToFrustum',
                                metaSpecifiers: {
                                    ClampMin: "0.0",
                                    UIMin: "0.0"
                                },
                                defaultValue: '0.0f'
                            },
                            {
                                comment: `
                                    Once visible how much further than DistanceToFrustum does the entities need to be
                                    before being cull again

                                    Once an entity is visible how far away from frustum does it need to get to lose
                                    "visible" state. Expressed in Unreal Units and is added to DistanceToFrustum to
                                    arrive at the final value to be used for testing.
                                `,
                                specifiers: ['EditAnywhere', 'config'],
                                category: 'Mass|LOD',
                                type: 'float',
                                name: 'DistanceToFrustumHysteresis',
                                metaSpecifiers: {
                                    ClampMin: "0.0",
                                    UIMin: "0.0"
                                },
                                defaultValue: '0.0f'
                            },
                            {
                                comment: `Filter these settings with specified tag`,
                                specifiers: ['EditAnywhere'],
                                category: 'Mass|LOD',
                                type: 'TObjectPtr<UScriptStruct>',
                                name: 'FilterTag',
                                metaSpecifiers: {
                                    BaseStruct: "/Script/MassEntity.MassTag"
                                },
                                defaultValue: 'nullptr'
                            },
                        ]
                    },
                    {
                        id: 'FMassDistanceLODParameters',
                        parent: F_MASS_CONST_SHARED_FRAGMENT,
                        properties: [
                            {
                                comment: `Distances where each LOD becomes relevant`,
                                specifiers: ['EditAnywhere', 'config'],
                                category: 'Mass|LOD',
                                type: 'float[EMassLOD::Max]',
                                name: 'LODDistance',
                                defaultValue: '{ 0.f, 1000.f, 2500.f, 10000.f }'
                            },

                            {
                                specifiers: ['EditAnywhere', 'config'],
                                category: "Mass|LOD",
                                metaSpecifiers: {
                                    ClampMin: "0.0",
                                    UIMin: "0.0"
                                },
                                type: 'float',
                                name: 'BufferHysteresisOnDistancePercentage',
                                defaultValue: '10.0f'
                            },

                            {
                                comment: `Filter these settings with specified tag`,
                                specifiers: ['EditAnywhere'],
                                category: "Mass|LOD",
                                metaSpecifiers: {
                                    BaseStruct: "/Script/MassEntity.MassTag"
                                },
                                type: 'TObjectPtr<UScriptStruct>',
                                name: 'FilterTag',
                                defaultValue: 'nullptr'
                            },
                        ]
                    },
                    { id: 'FMassDistanceLODSharedFragment', parent: F_MASS_SHARED_FRAGMENT },
                    { id: 'FMassVisualizationLODSharedFragment', parent: F_MASS_SHARED_FRAGMENT },
                ],
                traits: [
                    {
                        id: 'UMassDistanceVisualizationTrait',
                        remark: unindent(
                            `
                            # Additional Requirements
                            Only applies to DedicatedServer worlds if bAllowServerSideVisualization is set.
                            `
                        ),
                        requiredFragments: [
                            m.ref('FMassViewerInfoFragment', { module: 'MassLOD' }),
                            m.ref('FTransformFragment', { module: M_MASS_COMMON }),
                            m.ref('FMassActorFragment', { module: 'MassActors' }),
                        ],
                        addsFragments: [
                            m.ref('FMassRepresentationSubsystemSharedFragment'),
                            m.ref('FMassRepresentationParameters'),
                            m.ref('FMassRepresentationFragment'),
                            m.ref('FMassDistanceLODParameters'),
                            m.ref('FMassDistanceLODSharedFragment'),
                            m.ref('FMassRepresentationLODFragment'),
                            m.ref('FMassVisualizationChunkFragment', { module: 'MassLOD' })
                        ],
                        addsTags: [
                            m.ref('FMassVisibilityCulledByDistanceTag'),
                            m.ref('FMassDistanceLODProcessorTag'),
                            m.ref('FMassVisualizationProcessorTag'),
                        ],
                        properties: [
                            {
                                specifiers: ['EditAnywhere'],
                                category: 'Mass|Visual',
                                comment: `
                                    Instanced static mesh information for this agent
                                `,
                                type: 'FStaticMeshInstanceVisualizationDesc',
                                name: 'StaticMeshInstanceDesc',
                                mutable: true
                            },
                            {
                                specifiers: ['EditAnywhere'],
                                category: 'Mass|Visual',
                                comment: `
                                    Actor class of this agent when spawned in high resolutio
                                `,
                                type: 'TSubclassOf<AActor>',
                                name: 'HighResTemplateActor'
                            },
                            {
                                specifiers: ['EditAnywhere'],
                                category: 'Mass|Visual',
                                comment: `
                                    Actor class of this agent when spawned in low resolutio
                                `,
                                type: 'TSubclassOf<AActor>',
                                name: 'LowResTemplateActor'
                            },
                            {
                                specifiers: ['EditAnywhere'],
                                metaSpecifiers: {
                                    EditCondition: "bCanModifyRepresentationSubsystemClass"
                                },
                                category: 'Mass|Visual',
                                comment: `
                                    Allow subclasses to override the representation subsystem to use
                                `,
                                type: 'TSubclassOf<UMassRepresentationSubsystem>',
                                name: 'RepresentationSubsystemClass'
                            },
                            {
                                specifiers: ['EditAnywhere'],
                                category: 'Mass|Visual',
                                comment: `
                                    Configuration parameters for the representation processor
                                `,
                                type: 'FMassRepresentationParameters',
                                name: 'Params'
                            },
                            {
                                specifiers: ['EditAnywhere'],
                                category: 'Mass|Visual',
                                comment: `
                                    Configuration parameters for the Distance LOD processor
                                `,
                                type: 'FMassDistanceLODParameters',
                                name: 'LODParams'
                            },
                            {
                                specifiers: ['EditAnywhere'],
                                category: 'Mass|Visual',
                                comment: `
                                    If set to true will result in the visualization-related fragments being added to
                                    server-size entities as well. By default only the clients require visualization
                                    fragments
                                `,
                                type: 'bool',
                                name: 'bAllowServerSideVisualization',
                                defaultValue: 'false'
                            },
                            {
                                conditionals: ['WITH_EDITORONLY_DATA'],
                                comment: `the property is marked like this to ensure it won't show up in UI`,
                                specifiers: ['EditDefaultsOnly'],
                                category: 'Mass|Visual',
                                type: 'bool',
                                name: 'bCanModifyRepresentationSubsystemClass',
                                defaultValue: 'true'
                            },
                            {
                                visibility: 'protected',
                                comment: `
                                    Controls whether StaticMeshInstanceDesc gets registered via FindOrAddStaticMeshDesc
                                    call. Setting it to \`false\` can be useful for subclasses to avoid needlessly
                                    creating visualization data in RepresentationSubsystem, data that will never be
                                    used.
                                `,
                                type: 'bool',
                                name: 'bRegisterStaticMeshDesc',
                                defaultValue: 'true'
                            },
                        ]
                    },
                    {
                        id: 'UMassVisualizationTrait',
                        remark: unindent(
                            `
                            # Additional Requirements
                            Only applies to DedicatedServer worlds if bAllowServerSideVisualization is set.

                            # Validation

                            It is a validation error to set any LOD to StaticMesh when the StaticMeshInstanceDesc does
                            not point to a valid static mesh asset. In the event this happens, the parameters will be
                            adjusted to use LOD level None instead.
                            `
                        ),
                        requiredFragments: [
                            m.ref('FMassViewerInfoFragment', { module: 'MassLOD' }),
                            m.ref('FTransformFragment', { module: M_MASS_COMMON }),
                            m.ref('FMassActorFragment', { module: 'MassActors' }),
                        ],
                        addsFragments: [
                            m.ref('FMassRepresentationSubsystemSharedFragment'),
                            m.ref('FMassRepresentationFragment'),
                            m.ref('FMassRepresentationParameters'),
                            m.ref('FMassVisualizationLODParameters'),
                            m.ref('FMassRepresentationLODFragment'),
                        ],
                        addsTags: [
                            m.ref('FMassVisibilityCulledByDistanceTag'),
                            m.ref('FMassVisualizationLODProcessorTag'),
                            m.ref('FMassVisualizationProcessorTag')
                        ],
                        properties: [
                            {
                                comment: `
                                    Instanced static mesh information for this agent
                                `,
                                category: 'Mass|Visual',
                                specifiers: ['EditAnywhere'],
                                type: 'FStaticMeshInstanceVisualizationDesc',
                                name: 'StaticMeshInstanceDesc',
                                mutable: true
                            },
                            {
                                comment: `
                                    Actor class of this agent when spawned in high resolution
                                `,
                                category: 'Mass|Visual',
                                specifiers: ['EditAnywhere'],
                                type: 'TSubclassOf<AActor>',
                                name: 'HighResTemplateActor'
                            },
                            {
                                comment: `
                                    Actor class of this agent when spawned in low resolution
                                `,
                                category: 'Mass|Visual',
                                specifiers: ['EditAnywhere'],
                                type: 'TSubclassOf<AActor>',
                                name: 'LowResTemplateActor'
                            },
                            {
                                comment: `
                                    Allow subclasses to override the representation subsystem to use
                                `,
                                category: 'Mass|Visual',
                                specifiers: ['EditAnywhere'],
                                metaSpecifiers: {
                                    EditCondition: "bCanModifyRepresentationSubsystemClass"
                                },
                                type: 'TSubclassOf<UMassRepresentationSubsystem>',
                                name: 'RepresentationSubsystemClass'
                            },
                            {
                                comment: `
                                    Configuration parameters for the representation processor
                                `,
                                category: 'Mass|Visual',
                                specifiers: ['EditAnywhere'],
                                type: 'FMassRepresentationParameters',
                                name: 'Params'
                            },
                            {
                                comment: `
                                    Configuration parameters for the visualization LOD processor
                                `,
                                category: 'Mass|Visual',
                                specifiers: ['EditAnywhere'],
                                type: 'FMassVisualizationLODParameters',
                                name: 'LODParams'
                            },
                            {
                                comment: `
                                    If set to true will result in the visualization-related fragments being added to server-size entities as well.
                                    By default only the clients require visualization fragments
                                `,
                                specifiers: ['EditAnywhere'],
                                category: 'Mass|Visual',
                                type: 'bool',
                                name: 'bAllowServerSideVisualization',
                                defaultValue: 'false'
                            },
                            {
                                conditionals: ['WITH_EDITORONLY_DATA'],
                                comment: `the property is marked like this to ensure it won't show up in UI`,
                                specifiers: ['EditDefaultsOnly'],
                                category: 'Mass|Visual',
                                type: 'bool',
                                name: 'bCanModifyRepresentationSubsystemClass',
                                defaultValue: 'true'
                            },
                            {
                                visibility: 'protected',
                                comment: `
                                    Controls whether StaticMeshInstanceDesc gets registered via FindOrAddStaticMeshDesc
                                    call. Setting it to \`false\` can be useful for subclasses to avoid needlessly
                                    creating visualization data in RepresentationSubsystem, data that will never be
                                    used.
                                `,
                                type: 'bool',
                                name: 'bRegisterStaticMeshDesc',
                                defaultValue: 'true'
                            },
                        ]
                    },
                ],
                processors: [
                    {
                        id: 'UMassDistanceLODProcessor',
                        executionFlags: E_ALL_NET_MODES,
                        executionGroup: EG_LOD,
                        executeAfter: [EG_LODCollector],
                        queries: [
                            {
                                id: 'BaseQuery',
                                remark: unindent(
                                    `
                                    All other queries are based on this one.
                                    `
                                ),
                                requiresTags: [
                                    m.r('FMassDistanceLODProcessorTag').all()
                                ],
                                requiresFragments: [
                                    m.r('FMassViewerInfoFragment').readOnly(),
                                    m.r('FMassRepresentationLODFragment').readWrite(),
                                    m.r('FTransformFragment').readOnly(),
                                    m.r('FMassDistanceLODParameters'),
                                    m.r('FMassDistanceLODSharedFragment').readWrite(),
                                ]
                            },
                            {
                                id: 'CloseEntityQuery',
                                remark: `(Includes the requirements of BaseQuery)`,
                                requiresTags: [
                                    m.r('FMassVisibilityCulledByDistanceTag').none(),
                                ]
                            },
                            {
                                id: 'FarEntityQuery',
                                remark: `(Includes the requirements of BaseQuery)`,
                                requiresTags: [
                                    m.r('FMassVisibilityCulledByDistanceTag').all(),
                                ],
                                requiresFragments: [
                                    m.r('FMassVisualizationChunkFragment').readOnly(),
                                ]
                            },
                            {
                                id: 'DebugEntityQuery',
                                remark: `(Includes the requirements of BaseQuery)`,
                            },
                        ]
                    },
                    {
                        id: 'UMassRepresentationProcessor',
                        autoRegisters: false,
                        executionGroup: EG_Representation,
                        executeAfter: [EG_LOD],
                        queries: [
                            {
                                id: 'EntityQuery',
                                requiresFragments: [
                                    m.r('FTransformFragment').from(M_MASS_COMMON).readOnly(),
                                    m.r('FMassRepresentationFragment').readWrite(),
                                    m.r('FMassRepresentationLODFragment').readOnly(),
                                    m.r('FMassActorFragment').from('MassActors').readWrite(),
                                    m.r('FMassRepresentationParameters'),
                                    m.r('FMassRepresentationSubsystemSharedFragment').readWrite(),
                                ],
                                requiresSubsystems: [
                                    m.r('UMassActorSubsystem').readWrite()
                                ]
                            }
                        ]
                    },
                    {
                        id: 'UMassStationaryISMSwitcherProcessor',
                        comment: `
                            This processor's sole responsibility is to process all entities tagged with FMassStaticRepresentationTag
                            and check if they've switched to or away from EMassRepresentationType::StaticMeshInstance; and acordingly add or remove
                            the entity from the appropriate FMassInstancedStaticMeshInfoArrayView.
                        `,
                        executionGroup: EG_Representation,
                        executeAfter: ['UMassVisualizationProcessor'],
                        executionFlags: E_ALL_NET_MODES,
                        queries: [
                            {
                                id: 'EntityQuery',
                                requiresTags: [
                                    m.r('FMassStaticRepresentationTag').all(),
                                    m.r('FMassStationaryISMSwitcherProcessorTag').all(),
                                ],
                                requiresFragments: [
                                    m.r('FMassRepresentationLODFragment').readOnly(),
                                    m.r('FTransformFragment').from(M_MASS_COMMON).readOnly(),
                                    m.r('FMassRepresentationFragment').readWrite(),
                                    m.r('FMassRepresentationParameters'),
                                    m.r('FMassRepresentationSubsystemSharedFragment').readWrite(),
                                ]
                            }
                        ]

                    },
                    {
                        id: 'UMassUpdateISMProcessor',
                        executionFlags: ['Client', 'Standalone'],
                        executeAfter: [EG_Representation],
                        requiresGameThread: true,
                        queries: [
                            {
                                id: 'EntityQuery',
                                requiresFragments: [
                                    m.r('FTransformFragment').from(M_MASS_COMMON).readOnly(),
                                    m.r('FMassRepresentationFragment').readWrite(),
                                    m.r('FMassRepresentationLODFragment').readOnly(),
                                    m.r('FMassVisualizationChunkFragment').from('MassLOD').readWrite(),
                                    m.r('FMassRepresentationSubsystemSharedFragment').readWrite(),
                                ],
                                requiresTags: [
                                    m.r('FMassStaticRepresentationTag').none()
                                ]
                            }
                        ]
                    },
                    {
                        id: 'UMassVisualizationLODProcessor',
                        autoRegisters: false,
                        executionGroup: EG_LOD,
                        executeAfter: [EG_LODCollector],
                        requiresSubsystems: [
                            m.r('UMassLODSubsystem')
                        ],
                        queries: [
                            {
                                id: 'BaseQuery',
                                remark: unindent(
                                    `
                                    All other queries are based on this one.
                                    `
                                ),
                                requiresTags: [
                                    m.r('FMassVisualizationLODProcessorTag').all(),
                                ],
                                requiresFragments: [
                                    m.r('FMassViewerInfoFragment').from('MassLOD').readOnly(),
                                    m.r('FMassRepresentationLODFragment').readWrite(),
                                    m.r('FTransformFragment').from(M_MASS_COMMON).readOnly(),
                                    m.r('FMassVisualizationLODParameters'),
                                    m.r('FMassVisualizationLODSharedFragment').from('MassRepresentation').readWrite(),
                                ]
                            },
                            {
                                id: 'CloseEntityQuery',
                                remark: `(Includes the requirements of BaseQuery)`,
                                requiresTags: [
                                    m.r('FMassVisibilityCulledByDistanceTag').from('MassLOD').none()
                                ]
                            },
                            {
                                id: 'CloseEntityAdjustDistanceQuery',
                                remark: unindent(
                                    `
                                    Same as CloseEntityQuery, but adds a chunk filter to match chunks with
                                    LODSharedFragment.bHasAdjustedDistancesFromCount
                                    `
                                ),
                            },
                            {
                                id: 'FarEntityQuery',
                                remark: `(Includes the requirements of BaseQuery)`,
                                requiresTags: [
                                    m.r('FMassVisibilityCulledByDistanceTag').from('MassLOD').all(),
                                ],
                                requiresFragments: [
                                    m.r('FMassVisualizationChunkFragment').from('MassLOD').readOnly()
                                ]
                            },
                            {
                                id: 'DebugEntityQuery',
                                remark: `(Includes the requirements of BaseQuery)`,
                            },

                        ]
                    }
                ]
            })),
            declareModule('MassSignals', m => ({
                processors: [
                    {
                        id: 'UMassSignalProcessorBase',
                        executionFlags: E_ALL_NET_MODES,
                        comment: `
                            Processor for executing signals on each targeted entities
                            The derived classes only need to implement the method SignalEntities to actually received
                            the raised signals for the entities they subscribed to
                        `,
                        queries: []
                    }
                ]
            })),
            declareModule('MassSmartObjects', m => ({
                tags: [
                    declareTag('FMassInActiveSmartObjectsRangeTag'),
                    declareTag('FMassSmartObjectCompletedRequestTag')
                ],
                fragments: [
                    {
                        id: 'FMassSmartObjectUserFragment',
                        properties: [
                            {
                                comment: `Tags describing the smart object user.`,
                                specifiers: ['Transient'],
                                type: 'FGameplayTagContainer',
                                name: 'UserTags'
                            },
                            {
                                comment: `Claim handle for the currently active smart object interaction.`,
                                specifiers: ['Transient'],
                                type: 'FSmartObjectClaimHandle',
                                name: 'InteractionHandle'
                            },
                            {
                                comment: `Status of the current active smart object interaction.`,
                                specifiers: ['Transient'],
                                type: 'EMassSmartObjectInteractionStatus',
                                name: 'InteractionStatus',
                                defaultValue: 'EMassSmartObjectInteractionStatus::Unset'
                            },
                            {
                                comment: `
                                    World time in seconds before which the user is considered in cooldown and
                                    won't look for new interactions (value of 0 indicates no cooldown).
                                `,
                                specifiers: ['Transient'],
                                type: 'double',
                                name: 'InteractionCooldownEndTime',
                                defaultValue: '0.'
                            }
                        ]
                    },
                    {
                        id: 'FMassSmartObjectTimedBehaviorFragment',
                        properties: [
                            {
                                specifiers: ['Transient'],
                                type: 'float',
                                name: 'UseTime',
                                defaultValue: '0.f'
                            }
                        ]
                    },
                    {
                        id: 'FSmartObjectRegistrationFragment',
                        properties: [
                            {
                                specifiers: [],
                                type: 'TWeakObjectPtr<USmartObjectDefinition>',
                                name: 'Asset'
                            },
                            {
                                specifiers: [],
                                type: 'FSmartObjectHandle',
                                name: 'Handle'
                            },
                        ]
                    },
                    {
                        id: 'FMassSmartObjectRequestResultFragment',
                        properties: [
                            {
                                specifiers: ['Transient'],
                                type: 'FMassSmartObjectCandidateSlots',
                                name: 'Candidates'
                            },
                            {
                                specifiers: ['Transient'],
                                type: 'bool',
                                name: 'bProcessed',
                                defaultValue: 'false'
                            },
                        ]
                    },
                    {
                        id: 'FMassSmartObjectWorldLocationRequestFragment',
                        properties: [
                            {
                                specifiers: ['Transient'],
                                type: 'FVector',
                                name: 'SearchOrigin',
                                defaultValue: 'FVector::ZeroVector'
                            },
                            {
                                specifiers: ['Transient'],
                                type: 'FMassEntityHandle',
                                name: 'RequestingEntity',
                            },
                            {
                                specifiers: ['Transient'],
                                type: 'FGameplayTagContainer',
                                name: 'UserTags',
                            },
                            {
                                specifiers: ['Transient'],
                                type: 'FGameplayTagQuery',
                                name: 'ActivityRequirements',
                            },
                        ]
                    },
                    {
                        id: 'FMassSmartObjectLaneLocationRequestFragment',
                        properties: [
                            {
                                specifiers: ['Transient'],
                                type: 'FMassEntityHandle',
                                name: 'RequestingEntity'
                            },
                            {
                                specifiers: ['Transient'],
                                type: 'FGameplayTagContainer',
                                name: 'UserTags'
                            },
                            {
                                specifiers: ['Transient'],
                                type: 'FGameplayTagQuery',
                                name: 'ActivityRequirements'
                            },
                        ]
                    },
                ],
                traits: [
                    {
                        id: 'UMassSmartObjectUserTrait',
                        properties: [
                            {
                                comment: `Tags describing the SmartObject user. Used when searching smart objects.`,
                                specifiers: ['EditAnywhere'],
                                category: 'Parameter',
                                type: 'FGameplayTagContainer',
                                name: 'UserTags'
                            }
                        ],
                        addsFragments: [
                            m.ref('FMassSmartObjectUserFragment')
                        ]
                    },
                ],
                processors: [
                    {
                        id: 'UMassSmartObjectCandidatesFinderProcessor',
                        comment: `Processor that builds a list of candidates objects for each users.`,
                        executeBefore: [EG_Behavior],
                        requiresSubsystems: [
                            m.r('UMassSignalSubsystem'),
                            m.r('UZoneGraphAnnotationSubsystem'),
                        ],
                        queries: [
                            {
                                id: 'WorldRequestQuery',
                                comment: `
                                    Query to fetch and process requests to find smart objects using spacial query
                                    around a given world location.
                                `,
                                requiresFragments: [
                                    m.r('FMassSmartObjectWorldLocationRequestFragment').readOnly(),
                                    m.r('FMassSmartObjectRequestResultFragment').readWrite(),
                                ],
                                requiresTags: [
                                    m.r('FMassSmartObjectCompletedRequestTag').none(),
                                ],
                                requiresSubsystems: [
                                    m.r('USmartObjectSubsystem').readOnly()
                                ]
                            },
                            {
                                id: 'LaneRequestQuery',
                                comment: `
                                    Query to fetch and process requests to find smart objects on zone graph lanes.
                                `,
                                requiresFragments: [
                                    m.r('FMassSmartObjectLaneLocationRequestFragment').readOnly(),
                                    m.r('FMassSmartObjectRequestResultFragment').readWrite(),
                                ],
                                requiresTags: [
                                    m.r('FMassSmartObjectCompletedRequestTag').none()
                                ],
                                requiresSubsystems: [
                                    m.r('UZoneGraphSubsystem').readOnly(),
                                    m.r('USmartObjectSubsystem').readOnly(),
                                ]
                            },
                        ]
                    },
                    {
                        id: 'UMassSmartObjectTimedBehaviorProcessor',
                        comment: `
                            Processor for time based user's behavior that waits x seconds then releases its claim on
                            the object
                        `,
                        executionGroup: EG_SyncWorldToMass,
                        requiresSubsystems: [
                            m.r('UMassSignalSubsystem').readWrite()
                        ],
                        queries: [
                            {
                                id: 'EntityQuery',
                                requiresFragments: [
                                    m.r('FMassSmartObjectUserFragment'),
                                    m.r('FMassSmartObjectTimedBehaviorFragment'),
                                ],
                                requiresSubsystems: [
                                    m.r('USmartObjectSubsystem').readOnly()
                                ]
                            }
                        ]
                    }
                ]
            })),
            declareModule(M_MASS_COMMON, m => ({
                fragments: [
                    {
                        id: 'FTransformFragment',
                        properties: [
                            { name: 'Transform', type: 'FTransform', specifiers: ['Transient'] }
                        ]
                    },
                    {
                        id: 'FAgentRadiusFragment',
                        properties: [
                            { name: 'Radius', type: 'float', specifiers: ['EditAnywhere'] }
                        ]
                    },
                    {
                        id: 'FObjectWrapperFragment',
                        properties: []
                    }
                ]
            })),
            declareModule('MassSpawner', m => ({
                fragments: [
                    {
                        id: 'FReplicationTemplateIDFragment',
                        properties: [
                            { specifiers: ['Transient'], type: 'FMassEntityTemplateID', name: 'ID' }
                        ]
                    },
                ],
                traits: [
                    {
                        id: 'UMassAssortedFragmentsTrait',
                        remark: unindent(
                            `
                            Adds whatever Fragments and/or Tags you wish to add.
                            `
                        ),
                        properties: [
                            {
                                specifiers: ['EditAnywhere'],
                                category: 'Mass',
                                metaSpecifiers: {
                                    BaseStruct: '/Script/MassEntity.MassFragment',
                                    ExcludeBaseStruct: ''
                                },
                                type: 'TArray<FInstancedStruct>',
                                name: 'Fragments'
                            },
                            {
                                specifiers: ['EditAnywhere'],
                                category: 'Mass',
                                metaSpecifiers: {
                                    BaseStruct: '/Script/MassEntity.MassTag',
                                    ExcludeBaseStruct: ''
                                },
                                type: 'TArray<FInstancedStruct>',
                                name: 'Tags'
                            },
                        ]
                    },
                ],
                processors: [
                    {
                        id: 'UMassSpawnLocationProcessor',
                        autoRegisters: false,
                        queries: [
                            {
                                id: 'EntityQuery',
                                requiresFragments: [
                                    m.r('FTransformFragment').from(M_MASS_COMMON).readWrite()
                                ]
                            }
                        ]
                    },
                    {
                        id: 'UMassTranslator',
                        comment: `
                            A class that's responsible for translation between UObjects and Mass. A translator knows
                            how to initialize fragments related to the UClass that the given translator cares about.
                            It can also be used at runtime to copy values from UObjects to fragments and back.
                        `,
                        executionFlags: E_ALL,
                        parent: m.ref('UMassProcessor', { module: 'MassEntity' }),
                        queries: []
                    }
                ]
            })),

        ]
    },
    {
        id: 'MassAI',
        modules: [
            declareModule('MassAIBehavior', m => ({
                tags: [
                    declareTag('FMassLookAtTargetTag', {
                        deprecated: 'Use FMassLookAtTargetFragment instead'
                    }),
                    declareTag('FMassInLookAtTargetGridTag'),
                    declareTag('FMassStateTreeActivatedTag')
                ],
                fragments: [
                    {
                        id: 'FMassLookAtFragment',
                        properties: [
                            { type: 'FVector', name: 'MainTargetLocation', specifiers: ['Transient'] },
                            { type: 'FVector', name: 'GazeTargetLocation', specifiers: ['Transient'] },
                            { type: 'FVector', name: 'Direction', specifiers: ['Transient'] },
                            { type: 'FVector', name: 'GazeDirection', specifiers: ['Transient'] },
                            { type: 'FMassEntityHandle', name: 'TrackedEntity', specifiers: ['Transient'] },
                            { type: 'FMassEntityHandle', name: 'GazeTrackedEntity', specifiers: ['Transient'] },
                            { type: 'double', name: 'GazeStartTime', specifiers: ['Transient'] },
                            { type: 'float', name: 'GazeDuration', specifiers: ['Transient'] },
                            { type: 'uint16', name: 'LastSeenActionID', specifiers: ['Transient'] },
                            { type: 'EMassLookAtMode', name: 'LookAtMode', specifiers: ['Transient'] },
                            { type: 'EMassLookAtInterpolationSpeed', name: 'InterpolationSpeed', specifiers: ['Transient'] },
                            { type: 'float', name: 'CustomInterpolationSpeed', specifiers: ['Transient'] },
                            { type: 'EMassLookAtGazeMode', name: 'RandomGazeMode', specifiers: ['Transient'] },
                            { type: 'uint8', name: 'RandomGazeYawVariation', specifiers: ['Transient'] },
                            { type: 'uint8', name: 'RandomGazePitchVariation', specifiers: ['Transient'] },
                            { type: 'uint8', name: 'bRandomGazeEntities', specifiers: ['Transient'] },
                        ]
                    },
                    {
                        id: 'FMassLookAtRequestFragment',
                        properties: [
                            {
                                specifiers: ['Transient'],
                                type: 'FMassEntityHandle',
                                name: 'ViewerEntity',
                            },
                            {
                                specifiers: ['Transient'],
                                type: 'FMassEntityHandle',
                                name: 'TargetEntity',
                            },
                            {
                                specifiers: ['Transient'],
                                type: 'FMassLookAtPriority',
                                name: 'Priority',
                                defaultValue: 'EMassLookAtPriorities::LowestPriority'
                            },
                            {
                                specifiers: ['Transient'],
                                type: 'EMassLookAtMode',
                                name: 'LookAtMode',
                                defaultValue: 'EMassLookAtMode::LookForward'
                            },
                            {
                                specifiers: ['Transient'],
                                type: 'EMassLookAtInterpolationSpeed',
                                name: 'InterpolationSpeed',
                                defaultValue: 'EMassLookAtInterpolationSpeed::Regular'
                            },
                            {
                                specifiers: ['Transient'],
                                type: 'float',
                                name: 'CustomInterpolationSpeed',
                                defaultValue: 'UE::Mass::LookAt::DefaultCustomInterpolationSpeed'
                            },
                        ]
                    },
                    {
                        id: 'FMassLookAtTargetFragment',
                        properties: [
                            {
                                comment: `
                                    Offset in local space to add to the target transform to get the final
                                    location
                                `,
                                specifiers: ['Transient'],
                                type: 'FVector',
                                name: 'Offset',
                                defaultValue: 'FVector::ZeroVector'
                            },
                            {
                                comment: `
                                    When a viewer is searching for a random target this priority will influence the
                                    selected target
                                `,
                                specifiers: ['Transient'],
                                type: 'FMassLookAtPriority',
                                name: 'Priority',
                                defaultValue: 'EMassLookAtPriorities::LowestPriority'
                            },
                            {
                                type: 'UE::Mass::LookAt::FTargetHashGrid2D::FCellLocation',
                                name: 'CellLocation'
                            },
                        ]
                    },
                    {
                        id: 'FMassLookAtTrajectoryFragment',
                        properties: [
                            {
                                comment: `Path points`,
                                type: 'TStaticArray<FMassLookAtTrajectoryPoint, MaxPoints>',
                                name: 'Points'
                            },
                            {
                                comment: `Lane handle the trajectory was build for.`,
                                type: 'FZoneGraphLaneHandle',
                                name: 'LaneHandle'
                            },
                            {
                                comment: `Number of points on path.`,
                                type: 'uint8',
                                name: 'NumPoints',
                                defaultValue: '0'
                            },
                            {
                                type: 'bool',
                                name: 'bMoveReverse',
                                defaultValue: 'false'
                            },
                        ]
                    },
                    {
                        id: 'FMassStateTreeInstanceFragment',
                        parent: F_MASS_CONST_SHARED_FRAGMENT,
                        properties: [
                            {
                                comment: `Handle to a StateTree instance data in MassStateTreeSubsystem.`,
                                type: 'FMassStateTreeInstanceHandle',
                                name: 'InstanceHandle'
                            },
                            {
                                comment: `The last update time use to calculate ticking delta time.`,
                                type: 'double',
                                name: 'LastUpdateTimeInSeconds',
                                defaultValue: '0.'
                            }
                        ]
                    },
                    {
                        id: 'FMassZoneGraphAnnotationFragment',
                        properties: [
                            {
                                comment: `Behavior tags for current lane`,
                                type: 'FZoneGraphTagMask', name: 'Tags', specifiers: []
                            }
                        ]
                    },
                    {
                        id: 'FMassStateTreeSharedFragment',
                        parent: F_MASS_CONST_SHARED_FRAGMENT,
                        properties: [
                            {
                                specifiers: [],
                                type: 'TObjectPtr<UStateTree>',
                                name: 'StateTree',
                                defaultValue: 'nullptr'
                            }
                        ]
                    },
                    {
                        id: 'FMassZoneGraphAnnotationVariableTickChunkFragment',
                        parent: F_MASS_CHUNK_FRAGMENT
                    }
                ],
                traits: [
                    {
                        id: 'UMassLookAtTargetTrait',
                        properties: [
                            {
                                comment: `
                                    Indicates whether the trait will use an initializer to set target offset using the
                                    height of the capsule component if available.
                                `,
                                specifiers: ['EditAnywhere', 'config'],
                                category: 'LookAt',
                                type: 'bool',
                                name: 'bShouldUseCapsuleComponentToSetTargetOffset',
                                defaultValue: 'true'
                            },
                            {
                                comment: `
                                    Priority assigned to the target to influence target selection
                                `,
                                specifiers: ['EditAnywhere', 'config'],
                                category: 'LookAt',
                                type: 'FMassLookAtPriority',
                                name: 'Priority',
                                defaultValue: 'EMassLookAtPriorities::LowestPriority'
                            },
                        ],
                        addsFragments: [
                            m.ref('FTransformFragment', { module: M_MASS_COMMON }),
                            m.ref('FMassLookAtTargetFragment'),
                        ]
                    },
                    {
                        id: 'UMassLookAtTrait',
                        properties: [],
                        addsFragments: [
                            m.ref('FMassLookAtFragment'),
                            m.ref('FMassLookAtTrajectoryFragment'),
                        ]
                    },
                    {
                        id: 'UMassStateTreeTrait',
                        comment: `
                            Feature that adds StateTree execution functionality to a mass agent.
                        `,
                        remark: unindent(
                            `
                            # Validation
                            - \`UMassStateTreeSubsystem\` must be available
                            - The \`StateTree\` property must be set.
                            - All subsystems needed by the selected state tree must be available
                            - All Mass fragments needed by the selected state tree must be available on the current
                              entity
                            `
                        ),
                        displayName: 'StateTree',
                        addsFragments: [
                            m.ref('FMassStateTreeSharedFragment'),
                            m.ref('FMassStateTreeInstanceFragment')
                        ],
                        properties: [
                            {
                                category: 'StateTree',
                                specifiers: ['EditAnywhere'],
                                metaSpecifiers: {
                                    RequiredAssetDataTags: "Schema=/Script/MassAIBehavior.MassStateTreeSchema"
                                },
                                type: 'TObjectPtr<UStateTree>',
                                name: 'StateTree'
                            }
                        ]
                    },
                    {
                        id: 'UMassZoneGraphAnnotationTrait',
                        properties: [],
                        addsFragments: [
                            m.r('FMassZoneGraphAnnotationFragment'),
                            m.r('FMassZoneGraphAnnotationVariableTickChunkFragment'),
                        ]
                    }
                ],
                processors: [
                    {
                        id: 'UMassLookAtProcessor',
                        comment: `Processor to choose and assign LookAt configurations`,
                        executionFlags: ['Client', 'Standalone'],
                        executionGroup: EG_Tasks,
                        executeAfter: [EG_Representation],
                        queries: [
                            {
                                id: 'EntityQuery_Conditional',
                                requiresFragments: [
                                    m.r('FMassLookAtFragment').readWrite(),
                                    m.r('FTransformFragment').from(M_MASS_COMMON).readOnly(),
                                    m.r('FMassMoveTargetFragment').from('MassNavigation').readOnly().optional(),
                                    m.r('FMassZoneGraphLaneLocationFragment').from('MassZoneGraphNavigation').readOnly().optional(),
                                    m.r('FMassLookAtTrajectoryFragment').readWrite().optional(),
                                    m.r('FMassZoneGraphShortPathFragment').from('MassZoneGraphNavigation').readOnly().optional(),
                                    m.r('FMassVisualizationChunkFragment').from('MassLOD').readOnly().optional(),

                                ],
                                requiresTags: [
                                    m.r('FMassMediumLODTag').from('MassLOD').none(),
                                    m.r('FMassLowLODTag').from('MassLOD').none(),
                                    m.r('FMassOffLODTag').from('MassLOD').none(),
                                ],
                                requiresSubsystems: [
                                    m.r('UMassNavigationSubsystem').readOnly(),
                                    m.r('UMassLookAtSubsystem').readOnly(),
                                    m.r('UZoneGraphSubsystem').readOnly(),
                                ]
                            }
                        ]
                    },
                    {
                        id: 'UMassLookAtTargetGridProcessor',
                        comment: `
                            Processor to maintain a list of LookAt targets in a spatial query structure in the
                            subsystem
                        `,
                        executionFlags: E_ALL_NET_MODES,
                        executeBefore: [EG_Tasks],
                        queries: [
                            {
                                id: 'BaseQuery',
                                remark: unindent(
                                    `
                                    All other queries are based on this one.
                                    `
                                ),
                                requiresFragments: [
                                    m.r('FTransformFragment').from(M_MASS_COMMON).readOnly(),
                                    m.r('FMassLookAtTargetFragment').readWrite(),
                                ],
                                requiresSubsystems: [
                                    m.r('UMassLookAtSubsystem').readWrite()
                                ]
                            },
                            {
                                id: 'AddToGridQuery',
                                remark: `(Includes the requirements of BaseQuery)`,
                                requiresTags: [
                                    m.r('FMassOffLODTag').from('MassLOD').none(),
                                    m.r('FMassInLookAtTargetGridTag').none(),
                                ]
                            },
                            {
                                id: 'UpdateGridQuery',
                                remark: `(Includes the requirements of BaseQuery)`,
                                requiresTags: [
                                    m.r('FMassOffLODTag').from('MassLOD').none(),
                                    m.r('FMassInLookAtTargetGridTag').all(),
                                ]
                            },
                            {
                                id: 'RemoveFromGridQuery',
                                remark: `(Includes the requirements of BaseQuery)`,
                                requiresTags: [
                                    m.r('FMassOffLODTag').from('MassLOD').all(),
                                    m.r('FMassInLookAtTargetGridTag').all(),
                                ]
                            },
                        ]
                    },
                    {
                        id: 'UMassStateTreeActivationProcessor',
                        comment: `
                            Processor to send the activation signal to the state tree which will execute the first
                            tick
                        `,
                        executeAfter: [EG_LOD],
                        executeBefore: [EG_Behavior],
                        requiresGameThread: true,
                        requiresSubsystems: [
                            m.r('UMassSignalSubsystem').readWrite()
                        ],
                        queries: [
                            {
                                id: 'EntityQuery',
                                requiresTags: [
                                    m.r('FMassStateTreeActivatedTag').none()
                                ],
                                requiresFragments: [
                                    m.r('FMassStateTreeInstanceFragment').readWrite(),
                                    m.r('FMassStateTreeSharedFragment'),
                                    m.r('FMassSimulationVariableTickChunkFragment').from('MassLOD').readOnly().optional(),
                                ]
                            }
                        ]
                    },
                ]
            })),
            declareModule('MassAIDebug', m => ({
                processors: [
                    {
                        id: 'UMassDebugStateTreeProcessor',
                        executionGroup: EG_Behavior,
                        executeAfter: ['MassStateTreeProcessor'],
                        requiresGameThread: true,
                        queries: [
                            {
                                id: 'EntityQuery',
                                requiresFragments: [
                                    m.r('FMassStateTreeInstanceFragment').from('MassAIBehavior').readOnly(),
                                    m.r('FMassStateTreeSharedFragment').from('MassAIBehavior'),
                                    m.r('FTransformFragment').from(M_MASS_COMMON).readOnly(),
                                ]
                            }
                        ]
                    },
                ]
            })),
            declareModule('MassNavigation', m => ({
                tags: [
                    declareTag('FMassInNavigationObstacleGridTag')
                ],
                fragments: [
                    {
                        id: 'FMassNavigationEdgesFragment',
                        properties: [
                            {
                                type: 'TArray<FNavigationAvoidanceEdge, TFixedAllocator<MaxEdgesCount>>',
                                name: 'AvoidanceEdges'
                            },
                            {
                                comment: `Set to true if the edges already account for the agent radius.`,
                                type: 'bool',
                                name: 'bExtrudedEdges',
                                defaultValue: 'false'
                            },
                        ]
                    },
                    {
                        id: 'FMassAvoidanceEntitiesToIgnoreFragment',
                        properties: [
                            {
                                type: 'TArray<FMassEntityHandle, TFixedAllocator<EntityCount>>',
                                name: 'EntitiesToIgnore'
                            }
                        ]
                    },
                    {
                        id: 'FMassMoveTargetFragment',
                        properties: [
                            {
                                name: 'Center',
                                type: 'FVector',
                                comment: `Center of the move target.`,
                                defaultValue: 'FVector::ZeroVector',
                            },
                            {
                                name: 'Forward',
                                type: 'FVector',
                                comment: `Forward direction of the movement target. `,
                                defaultValue: 'FVector::ZeroVector',
                            },
                            {
                                name: 'DistanceToGoal',
                                type: 'float',
                                comment: `Distance remaining to the movement goal.`,
                                defaultValue: '0.0f',
                            },
                            {
                                name: 'EntityDistanceToGoal',
                                type: 'float',
                                comment: `Projected progress distance of the entity using the path.`,
                                defaultValue: 'UnsetDistance',
                            },
                            {
                                name: 'SlackRadius',
                                type: 'float',
                                comment: `Allowed deviation around the movement target.`,
                                defaultValue: '0.0f',
                            },
                            {
                                name: 'CurrentActionWorldStartTime',
                                type: 'double',
                                comment: `World time in seconds when the action started.`,
                                defaultValue: '0.0',
                                visibility: 'private'
                            },
                            {
                                name: 'CurrentActionServerStartTime',
                                type: 'double',
                                comment: `Server time in seconds when the action started.`,
                                defaultValue: '0.0',
                                visibility: 'private'
                            },
                            {
                                name: 'CurrentActionID',
                                type: 'uint16',
                                comment: `
                                Number incremented each time new action (i.e move, stand, animation) is started.
                                `,
                                defaultValue: '0',
                                visibility: 'private'
                            },
                            {
                                name: 'DesiredSpeed',
                                type: 'FMassInt16Real',
                                comment: `Requested movement speed.`,
                                defaultValue: 'FMassInt16Real(0.0f)',
                            },
                            {
                                name: 'IntentAtGoal',
                                type: 'EMassMovementAction',
                                comment: `Intended movement action at the target.`,
                                defaultValue: 'EMassMovementAction::Move',
                            },
                            {
                                name: 'CurrentAction',
                                type: 'EMassMovementAction',
                                comment: `Current movement action.`,
                                defaultValue: 'EMassMovementAction::Move',
                                visibility: 'private'
                            },
                            {
                                name: 'PreviousAction',
                                type: 'EMassMovementAction',
                                comment: `Previous movement action.`,
                                defaultValue: 'EMassMovementAction::Move',
                                visibility: 'private'
                            },
                            {
                                type: 'uint8:1',
                                name: 'bNetDirty',
                                visibility: 'private'
                            },
                            {
                                type: 'uint8:1',
                                name: 'bOffBoundaries',
                                comment: `True if the movement target is assumed to be outside navigation boundaries.`,
                            },
                            {
                                type: 'uint8:1',
                                name: 'bSteeringFallingBehind',
                                comment: `True if the movement target is assumed to be outside navigation boundaries.`,
                            },
                        ]
                    },
                    {
                        id: 'FMassGhostLocationFragment',
                        properties: [
                            {
                                comment: `The action ID the ghost was initialized for`,
                                type: 'uint16',
                                name: 'LastSeenActionID',
                                defaultValue: '0',
                            },
                            {
                                comment: `Location of the ghost`,
                                type: 'FVector',
                                name: 'Location',
                                defaultValue: 'FVector::ZeroVector',
                            },
                            {
                                comment: `Velocity of the ghost`,
                                type: 'FVector',
                                name: 'Velocity',
                                defaultValue: 'FVector::ZeroVector',
                            },
                        ]
                    },
                    {
                        id: 'FMassNavigationObstacleGridCellLocationFragment',
                        properties: [
                            {
                                type: 'FNavigationObstacleHashGrid2D::FCellLocation',
                                name: 'CellLoc'
                            }
                        ]
                    },
                    {
                        id: 'FMassAvoidanceColliderFragment',
                        properties: [
                            { type: 'float[2]', name: 'Data' },
                            { type: 'EMassColliderType', name: 'Type' },
                        ]
                    },
                    {
                        id: 'FNavigationRelevantFragment',
                        properties: [
                            {
                                comment: `Handle to the Navigation element created and registered for the entity`,
                                type: 'FNavigationElementHandle',
                                name: 'Handle'
                            }
                        ]
                    },
                    {
                        id: 'FMassSteeringFragment',
                        properties: [
                            {
                                comment: `Cached desired velocity from steering. Note: not used for moving the entity.`,
                                type: 'FVector',
                                name: 'DesiredVelocity',
                                defaultValue: 'FVector::ZeroVector'
                            }
                        ]
                    },
                    {
                        id: 'FMassStandingSteeringFragment',
                        properties: [
                            {
                                comment: `Selected steer target based on ghost, updates periodically.`,
                                type: 'FVector',
                                name: 'TargetLocation',
                                defaultValue: 'FVector::ZeroVector'
                            },
                            {
                                comment: `Used during target update to see when the target movement stops`,
                                type: 'float',
                                name: 'TrackedTargetSpeed',
                                defaultValue: '0.0f'
                            },
                            {
                                comment: `Cooldown between target updates`,
                                type: 'float',
                                name: 'TargetSelectionCooldown',
                                defaultValue: '0.0f'
                            },
                            {
                                comment: `True if the target is being updated`,
                                type: 'bool',
                                name: 'bIsUpdatingTarget',
                                defaultValue: 'false'
                            },
                            {
                                comment: `True if we just entered from move action`,
                                type: 'bool',
                                name: 'bEnteredFromMoveAction',
                                defaultValue: 'false'
                            },
                        ]
                    },
                    {
                        id: 'FMassMovingAvoidanceParameters',
                        parent: F_MASS_CONST_SHARED_FRAGMENT,
                        properties: [
                            {
                                comment: `
                                    The distance at which neighbour agents are detected. Range: 200...600
                                `,
                                type: 'float',
                                name: 'ObstacleDetectionDistance',
                                defaultValue: '400.f',
                                specifiers: ['EditAnywhere'],
                                category: 'General',
                                metaSpecifiers: {
                                    ClampMin: "0.0",
                                    ForceUnits: "cm"
                                }
                            },
                            {
                                comment: `
                                    The time the agent is considered to be near the start of the path when starting to move. Range: 0..3
                                `,
                                type: 'float',
                                name: 'StartOfPathDuration',
                                defaultValue: '1.0f',
                                specifiers: ['EditAnywhere'],
                                category: 'General',
                                metaSpecifiers: {
                                    ClampMin: "0",
                                    ForceUnits: "s"
                                }
                            },
                            {
                                comment: `
                                    The time the agent is considered to be near the end of the path when approaching end. Range: 0..3
                                `,
                                type: 'float',
                                name: 'EndOfPathDuration',
                                defaultValue: '0.5f',
                                specifiers: ['EditAnywhere'],
                                category: 'General',
                                metaSpecifiers: {
                                    ClampMin: "0",
                                    ForceUnits: "s"
                                }
                            },
                            {
                                comment: `
                                    How much to tune down the avoidance at the start of the path. Range: 0..1.
                                `,
                                type: 'float',
                                name: 'StartOfPathAvoidanceScale',
                                defaultValue: '0.0f',
                                specifiers: ['EditAnywhere'],
                                category: 'General',
                                metaSpecifiers: {
                                    ClampMin: "0",
                                    ForceUnits: "x"
                                }
                            },
                            {
                                comment: `
                                    How much to tune down the avoidance towards the end of the path. Range: 0..1
                                `,
                                type: 'float',
                                name: 'EndOfPathAvoidanceScale',
                                defaultValue: '0.1f',
                                specifiers: ['EditAnywhere'],
                                category: 'General',
                                metaSpecifiers: {
                                    ClampMin: "0",
                                    ForceUnits: "x"
                                }
                            },
                            {
                                comment: `
                                    How much to tune down the avoidance when an obstacle is standing. This allows the agents to pass through standing agents more easily. Range: 0..1
                                `,
                                type: 'float',
                                name: 'StandingObstacleAvoidanceScale',
                                defaultValue: '0.65f',
                                specifiers: ['EditAnywhere'],
                                category: 'General',
                                metaSpecifiers: {
                                    ClampMin: "0",
                                    ForceUnits: "x"
                                }
                            },
                            {
                                comment: `
                                    Agent radius scale for avoiding static obstacles near wall. If the clarance between obstacle and wall is less than the scaled radius, the agent will not try to move through the gap. Range: 0..1
                                `,
                                type: 'float',
                                name: 'StaticObstacleClearanceScale',
                                defaultValue: '0.7f',
                                specifiers: ['EditAnywhere'],
                                category: 'General',
                                metaSpecifiers: {
                                    ClampMin: "0",
                                    ForceUnits: "x"
                                }
                            },
                            {
                                comment: `
                                    Agent radius scale for separation. Making it smaller makes the separation softer. Range: 0.8..1
                                `,
                                type: 'float',
                                name: 'SeparationRadiusScale',
                                defaultValue: '0.9f',
                                specifiers: ['EditAnywhere'],
                                category: 'Separation',
                                metaSpecifiers: {
                                    ClampMin: "0",
                                    ForceUnits: "x"
                                }
                            },
                            {
                                comment: `
                                    Separation force stiffness between agents and obstacles. Range: 100..500 N/cm
                                `,
                                type: 'float',
                                name: 'ObstacleSeparationStiffness',
                                defaultValue: '250.f',
                                specifiers: ['EditAnywhere'],
                                category: 'Separation',
                                metaSpecifiers: {
                                    ClampMin: "0"
                                }
                            },
                            {
                                comment: `
                                    Separation force effect distance. The actual observed separation distance will be smaller. Range: 0..100
                                `,
                                type: 'float',
                                name: 'ObstacleSeparationDistance',
                                defaultValue: '75.f',
                                specifiers: ['EditAnywhere'],
                                category: 'Separation',
                                metaSpecifiers: {
                                    ClampMin: "0",
                                    ForceUnits: "cm"
                                }
                            },
                            {
                                comment: `
                                    Environment separation force stiffness between agents and walls. Range: 200..1000 N/cm
                                `,
                                type: 'float',
                                name: 'EnvironmentSeparationStiffness',
                                defaultValue: '500.f',
                                specifiers: ['EditAnywhere'],
                                category: 'Separation',
                                metaSpecifiers: {
                                    ClampMin: "0",
                                }
                            },
                            {
                                comment: `
                                    Environment separation force effect distance. The actual observed separation distance will be smaller. Range: 0..200
                                `,
                                type: 'float',
                                name: 'EnvironmentSeparationDistance',
                                defaultValue: '50.f',
                                specifiers: ['EditAnywhere'],
                                category: 'Separation',
                                metaSpecifiers: {
                                    ClampMin: "0",
                                    ForceUnits: "cm"
                                }
                            },
                            {
                                comment: `
                                    How far in the future the agent reacts to collisions. Range: 1..3, Indoor humans 1.4, outdoor humans 2.4 (seconds).
                                `,
                                type: 'float',
                                name: 'PredictiveAvoidanceTime',
                                defaultValue: '2.5f',
                                specifiers: ['EditAnywhere'],
                                category: 'Predictive Avoidance',
                                metaSpecifiers: {
                                    ClampMin: "0.1",
                                    ForceUnits: "s"
                                }
                            },
                            {
                                comment: `
                                    Agent radius scale for anticipatory avoidance. Making the scale smaller makes the agent more eager to squeeze through other agents. Range: 0.5..1
                                `,
                                type: 'float',
                                name: 'PredictiveAvoidanceRadiusScale',
                                defaultValue: '0.65f',
                                specifiers: ['EditAnywhere'],
                                category: 'Predictive Avoidance',
                                metaSpecifiers: {
                                    ClampMin: "0",
                                    ForceUnits: "x"
                                }
                            },
                            {
                                comment: `
                                    Predictive avoidance force effect distance. The avoidance force is applied at the point in future where the agents are closest. The actual observed separation distance will be smaller. Range: 0..200
                                `,
                                type: 'float',
                                name: 'PredictiveAvoidanceDistance',
                                defaultValue: '75.f',
                                specifiers: ['EditAnywhere'],
                                category: 'Predictive Avoidance',
                                metaSpecifiers: {
                                    ClampMin: "0",
                                    ForceUnits: "cm"
                                }
                            },
                            {
                                comment: `
                                    Predictive avoidance force stiffness between agents and obstacles. Range: 400..1000 N/cm
                                `,
                                type: 'float',
                                name: 'ObstaclePredictiveAvoidanceStiffness',
                                defaultValue: '700.f',
                                specifiers: ['EditAnywhere'],
                                category: 'Predictive Avoidance',
                                metaSpecifiers: {
                                    ClampMin: "0",
                                }
                            },
                            {
                                comment: `
                                    Predictive avoidance force stiffness between agents and walls. Range: 400..1000 N/cm
                                `,
                                type: 'float',
                                name: 'EnvironmentPredictiveAvoidanceStiffness',
                                defaultValue: '200.f',
                                specifiers: ['EditAnywhere'],
                                category: 'Predictive Avoidance',
                                metaSpecifiers: {
                                    ClampMin: "0",
                                }
                            },
                        ]
                    },
                    {
                        id: 'FMassStandingAvoidanceParameters',
                        parent: F_MASS_CONST_SHARED_FRAGMENT,
                        properties: [
                            {
                                comment: `
                                    The distance at which neighbour agents are detected when updating the ghost.
                                `,
                                specifiers: ['EditAnywhere'],
                                category: 'General',
                                metaSpecifiers: {
                                    ClampMin: "0.0",
                                    ForceUnits: "cm"
                                },
                                type: 'float',
                                name: 'GhostObstacleDetectionDistance',
                                defaultValue: '300.f',
                            },

                            {
                                comment: `
                                    How far the ghost can deviate from the target location.
                                `,
                                specifiers: ['EditAnywhere'],
                                category: 'Ghost',
                                metaSpecifiers: {
                                    ClampMin: "0",
                                    ForceUnits: "cm"
                                },
                                type: 'float',
                                name: 'GhostToTargetMaxDeviation',
                                defaultValue: '80.0f',
                            },

                            {
                                comment: ``,
                                specifiers: ['EditAnywhere'],
                                category: 'Ghost',
                                metaSpecifiers: {
                                    ClampMin: "0",
                                    ForceUnits: "s"
                                },
                                type: 'float',
                                name: 'GhostSteeringReactionTime',
                                defaultValue: '2.0f',
                            },
                            {
                                comment: `
                                    The steering will slow down when the ghost is closer than this distance to the
                                    target. Range: 5..50
                                `,
                                specifiers: ['EditAnywhere'],
                                category: 'Ghost',
                                metaSpecifiers: {
                                    ClampMin: "0",
                                    ForceUnits: "cm"
                                },
                                type: 'float',
                                name: 'GhostStandSlowdownRadius',
                                defaultValue: '15.0f',
                            },
                            {
                                comment: `
                                    Mas speed the ghost can move.
                                `,
                                specifiers: ['EditAnywhere'],
                                category: 'Ghost',
                                metaSpecifiers: {
                                    ClampMin: "0",
                                    ForceUnits: "cm/s"
                                },
                                type: 'float',
                                name: 'GhostMaxSpeed',
                                defaultValue: '250.0f',
                            },
                            {
                                comment: `
                                    Max acceleration of the ghost. Making this larger than the agent speed will make
                                    the ghost react quickly.
                                `,
                                specifiers: ['EditAnywhere'],
                                category: 'Ghost',
                                metaSpecifiers: {
                                    ClampMin: "0",
                                    ForceUnits: "cm/s"
                                },
                                type: 'float',
                                name: 'GhostMaxAcceleration',
                                defaultValue: '300.0f',
                            },
                            {
                                comment: `
                                    How quickly the ghost speed goes to zero. The smaller the value, the more the
                                    movement is dampened.
                                `,
                                specifiers: ['EditAnywhere'],
                                category: 'Ghost',
                                metaSpecifiers: {
                                    ClampMin: "0",
                                    ForceUnits: "s"
                                },
                                type: 'float',
                                name: 'GhostVelocityDampingTime',
                                defaultValue: '0.4f',
                            },
                            {
                                comment: `
                                    Agent radius scale for separation. Making it smaller makes the separation softer.
                                    Range: 0.8..1
                                `,
                                specifiers: ['EditAnywhere'],
                                category: 'Ghost',
                                metaSpecifiers: {
                                    ClampMin: "0",
                                    ForceUnits: "x"
                                },
                                type: 'float',
                                name: 'GhostSeparationRadiusScale',
                                defaultValue: '0.8f',
                            },
                            {
                                specifiers: ['EditAnywhere'],
                                category: 'Ghost',
                                metaSpecifiers: {
                                    ClampMin: "0",
                                    ForceUnits: "cm"
                                },
                                type: 'float',
                                name: 'GhostSeparationDistance',
                                defaultValue: '20.0f',
                            },
                            {
                                specifiers: ['EditAnywhere'],
                                category: 'Ghost',
                                metaSpecifiers: {
                                    ClampMin: "0",
                                    ForceUnits: "N/cm"
                                },
                                type: 'float',
                                name: 'GhostSeparationStiffness',
                                defaultValue: '200.0f',
                            },
                            {
                                comment: `
                                    How much avoidance is scaled for moving obstacles. Range: 1..5.
                                `,
                                specifiers: ['EditAnywhere'],
                                category: 'Ghost',
                                metaSpecifiers: {
                                    ClampMin: "0",
                                    ForceUnits: "x"
                                },
                                type: 'float',
                                name: 'MovingObstacleAvoidanceScale',
                                defaultValue: '3.0f',
                            },
                            {
                                comment: `
                                    How much the ghost avoidance is tuned down when the moving obstacle is moving away
                                    from the ghost. Range: 0..1
                                `,
                                specifiers: ['EditAnywhere'],
                                category: 'Ghost',
                                metaSpecifiers: {
                                    ClampMin: "0",
                                    ForceUnits: "x"
                                },
                                type: 'float',
                                name: 'MovingObstacleDirectionalScale',
                                defaultValue: '0.1f',
                            },
                            {
                                comment: `
                                    How much extra space is preserved in front of moving obstacles (relative to their
                                    size). Range: 1..5
                                `,
                                specifiers: ['EditAnywhere'],
                                category: 'Ghost',
                                metaSpecifiers: {
                                    ClampMin: "0",
                                    ForceUnits: "x"
                                },
                                type: 'float',
                                name: 'MovingObstaclePersonalSpaceScale',
                                defaultValue: '3.0f',
                            },
                        ]
                    },
                    {
                        id: 'FNavigationRelevantParameters',
                        parent: F_MASS_CONST_SHARED_FRAGMENT,
                        properties: [
                            {
                                comment: `If set, navmesh will not be generated under the surface of the geometry`,
                                specifiers: [],
                                type: 'bool',
                                name: 'bFillCollisionUnderneathForNavData',
                                defaultValue: 'false'
                            },
                        ]
                    },
                    {
                        id: 'FMassSmoothOrientationParameters',
                        parent: F_MASS_CONST_SHARED_FRAGMENT,
                        properties: [
                            {
                                comment: `The time it takes the orientation to catchup to the requested orientation.`,
                                type: 'float',
                                name: 'EndOfPathDuration',
                                defaultValue: '1.0f',
                                specifiers: ['EditAnywhere'],
                                category: 'Orientation',
                                metaSpecifiers: {
                                    ClampMin: "0.0",
                                    ForceUnits: "s"
                                }
                            },
                            {
                                comment: `The time it takes the orientation to catchup to the requested orientation.`,
                                type: 'float',
                                name: 'OrientationSmoothingTime',
                                defaultValue: '0.3f',
                                specifiers: ['EditAnywhere'],
                                category: 'Orientation',
                                metaSpecifiers: {
                                    ClampMin: "0.0",
                                    ForceUnits: "s"
                                }
                            },
                            {
                                comment: `Orientation blending weights while moving.`,
                                type: 'FMassSmoothOrientationWeights',
                                name: 'Moving',
                                defaultValue: 'FMassSmoothOrientationWeights(/*MoveTarget*/0.4f, /*Velocity*/0.6f)',
                                specifiers: ['EditAnywhere'],
                                category: 'Orientation'
                            },
                            {
                                comment: `Orientation blending weights while standing.`,
                                type: 'FMassSmoothOrientationWeights',
                                name: 'Standing',
                                defaultValue: 'FMassSmoothOrientationWeights(/*MoveTarget*/0.95f, /*Velocity*/0.05f)',
                                specifiers: ['EditAnywhere'],
                                category: 'Orientation'
                            }
                        ]
                    },
                    {
                        id: 'FMassMovingSteeringParameters',
                        parent: F_MASS_CONST_SHARED_FRAGMENT,
                        properties: [
                            {
                                comment: `
                                    Steering reaction time in seconds.
                                `,
                                type: 'float',
                                name: 'ReactionTime',
                                defaultValue: '0.3f',
                                specifiers: ['config', 'EditAnywhere'],
                                category: 'Moving',
                                metaSpecifiers: {
                                    ClampMin: "0.05",
                                    ForceUnits: "s"
                                }
                            },
                            {
                                comment: `
                                    How much we look ahead when steering. Affects how steeply we steer towards the
                                    goal and when to start to slow down at the end of the path.
                                `,
                                type: 'float',
                                name: 'LookAheadTime',
                                defaultValue: '1.0f',
                                specifiers: ['EditAnywhere'],
                                category: 'Moving',
                                metaSpecifiers: {
                                    ClampMin: "0",
                                    ForceUnits: "s"
                                }
                            },
                            {
                                comment: `
                                    Allow directional and catchup speed variance.
                                `,
                                type: 'bool',
                                name: 'bAllowSpeedVariance',
                                defaultValue: 'true',
                                specifiers: ['EditAnywhere'],
                                category: 'Moving'
                            },
                        ]
                    },
                    {
                        id: 'FMassStandingSteeringParameters',
                        parent: F_MASS_CONST_SHARED_FRAGMENT,
                        properties: [
                            {
                                comment: `
                                    How much the ghost should deviate from the target before updating the target.
                                `,
                                type: 'float',
                                name: 'TargetMoveThreshold',
                                defaultValue: '15.0f',
                                specifiers: ['EditAnywhere'],
                                category: 'Standing',
                                metaSpecifiers: {
                                    ClampMin: "0.05",
                                    ForceUnits: "cm"
                                }
                            },
                            {
                                type: 'float',
                                name: 'TargetMoveThresholdVariance',
                                category: 'Standing',
                                specifiers: ['EditAnywhere'],
                                defaultValue: '0.1f'
                            },
                            {
                                comment: `
                                    If the velocity is below this threshold, it is clamped to 0. This allows to
                                    prevent jittery movement when trying to be stationary.
                                `,
                                type: 'float',
                                name: 'LowSpeedThreshold',
                                defaultValue: '3.0f',
                                specifiers: ['EditAnywhere'],
                                category: 'Movement',
                                metaSpecifiers: {
                                    ClampMin: "0.0",
                                    ForceUnits: "cm/s"
                                }
                            },
                            {
                                comment: `
                                    How much the max speed can drop before we stop tracking it.
                                `,
                                type: 'float',
                                name: 'TargetSpeedHysteresisScale',
                                defaultValue: '0.85f',
                                specifiers: ['EditAnywhere'],
                                category: 'Standing',
                                metaSpecifiers: {
                                    ClampMin: "0.05",
                                    ForceUnits: "x"
                                }
                            },
                            {
                                comment: `
                                    Time between updates, varied randomly.
                                `,
                                type: 'float',
                                name: 'TargetSelectionCooldown',
                                defaultValue: '1.5f',
                                specifiers: ['EditAnywhere'],
                                category: 'Standing',
                                metaSpecifiers: {
                                    ClampMin: "0.05",
                                    ForceUnits: "s"
                                }
                            },
                            {
                                type: 'float',
                                name: 'TargetSelectionCooldownVariance',
                                specifiers: ['EditAnywhere'],
                                category: 'Standing',
                                defaultValue: '0.5f',
                            },
                            {
                                comment: `
                                    How much the target should deviate from the current location before updating the
                                    force on the agent.
                                `,
                                type: 'float',
                                name: 'DeadZoneRadius',
                                defaultValue: '15.0f',
                                specifiers: ['EditAnywhere'],
                                category: 'Standing',
                                metaSpecifiers: {
                                    ForceUnits: "cm"
                                }
                            },
                        ]
                    },
                ],
                traits: [
                    {
                        id: 'UMassObstacleAvoidanceTrait',
                        requiredFragments: [
                            m.ref('FAgentRadiusFragment', { module: M_MASS_COMMON }),
                            m.ref('FTransformFragment', { module: M_MASS_COMMON }),
                            m.ref('FMassVelocityFragment', { module: 'MassMovement' }),
                            m.ref('FMassForceFragment', { module: 'MassMovement' }),
                            m.ref('FMassMoveTargetFragment'),
                        ],
                        addsFragments: [
                            m.ref('FMassNavigationEdgesFragment'),
                            m.ref('FMassMovingAvoidanceParameters'),
                            m.ref('FMassStandingAvoidanceParameters'),
                        ],
                        properties: [
                            {
                                specifiers: ['EditAnywhere'],
                                category: '',
                                type: 'FMassMovingAvoidanceParameters',
                                name: 'MovingParameters'
                            },
                            {
                                specifiers: ['EditAnywhere'],
                                category: '',
                                type: 'FMassStandingAvoidanceParameters',
                                name: 'StandingParameters'
                            },
                        ]
                    },
                    {
                        id: 'UMassNavigationObstacleTrait',
                        properties: [],
                        requiredFragments: [
                            m.ref('FTransformFragment', { module: M_MASS_COMMON }),
                            m.ref('FAgentRadiusFragment', { module: M_MASS_COMMON }),
                        ],
                        addsFragments: [
                            m.ref('FMassNavigationObstacleGridCellLocationFragment')
                        ]
                    },
                    {
                        id: 'UMassSmoothOrientationTrait',
                        properties: [
                            {
                                specifiers: ['EditAnywhere'],
                                category: '',
                                type: 'FMassSmoothOrientationParameters',
                                name: 'Orientation'
                            },
                        ],
                        requiredFragments: [
                            m.ref('FMassMoveTargetFragment'),
                            m.ref('FMassVelocityFragment', { module: 'MassMovement' }),
                            m.ref('FTransformFragment', { module: M_MASS_COMMON }),
                        ],
                        addsFragments: [
                            m.ref('FMassSmoothOrientationParameters')
                        ]

                    },
                    {
                        id: 'UMassSteeringTrait',
                        requiredFragments: [
                            m.frag('FAgentRadiusFragment'),
                            m.frag('FTransformFragment'),
                            m.frag('FMassVelocityFragment', { module: 'MassMovement' }),
                            m.frag('FMassForceFragment', { module: 'MassMovement' }),
                        ],
                        addsFragments: [
                            m.frag('FMassMoveTargetFragment'),
                            m.frag('FMassSteeringFragment'),
                            m.frag('FMassStandingSteeringFragment'),
                            m.frag('FMassGhostLocationFragment'),
                            m.frag('FMassMovingSteeringParameters', { const: true, shared: true }),
                            m.frag('FMassStandingSteeringParameters', { const: true, shared: true })
                        ],
                        triggersProcessors: [
                            m.ref('UMassSteerToMoveTargetProcessor')
                        ]
                    }
                ],
                processors: [
                    {
                        id: 'UMassOffLODNavigationProcessor',
                        comment: `Updates Off-LOD entities position to move targets position.`,
                        executionFlags: E_ALL_NET_MODES,
                        executionGroup: EG_Movement,
                        executeAfter: [EG_Avoidance],
                        queries: [
                            {
                                id: 'EntityQuery_Conditional',
                                requiresFragments: [
                                    m.r('FTransformFragment').from(M_MASS_COMMON).readWrite(),
                                    m.r('FMassMoveTargetFragment').readOnly(),
                                    m.r('FMassSimulationVariableTickChunkFragment').from('MassLOD').readOnly().optional(),
                                ],
                                requiresTags: [
                                    m.r('FMassOffLODTag').from('MassLOD').all(),
                                ]
                            }
                        ]
                    },
                    {
                        id: 'UMassNavigationSmoothHeightProcessor',
                        comment: `
                            Updates entities height to move targets position smoothly.
                            Does not update Off-LOD entities.
                        `,
                        executionFlags: E_ALL_NET_MODES,
                        executeAfter: [ EG_Movement ],
                        queries: [
                            {
                                id: 'EntityQuery',
                                requiresFragments: [
                                    m.r('FTransformFragment').from(M_MASS_COMMON).readWrite(),
                                    m.r('FMassMoveTargetFragment').readOnly(),
                                    m.r('FMassMovementParameters').all(),
                                ],
                                requiresTags: [
                                    m.r('FMassOffLODTag').none(),
                                ]
                            }
                        ]
                    },
                    { id: 'UMassNavigationObstacleGridProcessor' },
                    { id: 'UMassMovingAvoidanceProcessor' },
                    { id: 'UMassStandingAvoidanceProcessor' },
                    { id: 'UMassSmoothOrientationProcessor' },

                    {
                        id: 'UMassSteerToMoveTargetProcessor',
                        parent: U_MASS_PROCESSOR,
                        queries: [
                            {
                                id: 'EntityQuery',
                                requiresFragments: [
                                    m.r('FTransformFragment').from(M_MASS_COMMON),
                                    m.r('FMassMoveTargetFragment'),
                                    m.r('FMassSteeringFragment'),
                                    m.r('FMassStandingSteeringFragment'),
                                    m.r('FMassGhostLocationFragment'),
                                    m.r('FMassForceFragment').from('MassMovement'),
                                    m.r('FMassDesiredMovementFragment').from('MassMovement'),
                                    m.r('FMassMovementParameters').from('MassMovement'),
                                    m.r('FMassMovingSteeringParameters'),
                                    m.r('FMassStandingSteeringParameters'),
                                ],
                                requiresTags: []
                            }
                        ]
                    }
                ]
            })),
            declareModule('MassNavMeshNavigation', m => ({
                fragments: [
                    {
                        id: 'FMassNavMeshShortPathFragment',
                        properties: [
                            {
                                comment: `
                                    Portal points
                                `,
                                type: 'TStaticArray<FMassNavMeshPathPoint, MaxPoints>',
                                name: 'Points'
                            },
                            {
                                comment: `
                                    Current progress distance along the short path.
                                `,
                                type: 'float',
                                name: 'MoveTargetProgressDistance',
                                defaultValue: '0.f'
                            },
                            {
                                comment: `
                                    Distance from the end of path used to confirm that the destination is reached.
                                `,
                                type: 'float',
                                name: 'EndReachedDistance',
                                defaultValue: '20.f'
                            },
                            {
                                comment: `
                                    Number of points on path.
                                `,
                                type: 'uint8',
                                name: 'NumPoints',
                                defaultValue: '0'
                            },
                            {
                                comment: `
                                    Intent at the end of the path.
                                `,
                                type: 'EMassMovementAction',
                                name: 'EndOfPathIntent',
                                defaultValue: 'EMassMovementAction::Stand'
                            },
                            {
                                comment: `
                                    True if the path was partial.
                                `,
                                type: 'uint8:1',
                                name: 'bPartialResult',
                                defaultValue: 'false'
                            },
                            {
                                comment: `
                                    True when path follow is completed.
                                `,
                                type: 'uint8:1',
                                name: 'bDone',
                                defaultValue: 'false'
                            },
                            {
                                comment: `
                                    True when the path has been initalized.
                                `,
                                type: 'uint8:1',
                                name: 'bInitialized',
                                defaultValue: 'false'
                            },
                        ]
                    },
                    {
                        id: 'FMassNavMeshCachedPathFragment',
                        properties: [
                            {
                                comment: `
                                    Reference to a FNavigationPath.
                                `,
                                type: 'FNavPathSharedPtr',
                                name: 'NavPath'
                            },
                            {
                                comment: `
                                    Reference to an FNavCorridor. Built out of a navigation path.
                                `,
                                type: 'TSharedPtr<FNavCorridor>',
                                name: 'Corridor'
                            },
                            {
                                comment: `
                                    Index used to keep track of progression on the navmesh path.
                                `,
                                type: 'uint16',
                                name: 'NavPathNextStartIndex',
                                defaultValue: '0'
                            },
                        ]
                    },
                    {
                        id: 'FMassNavMeshBoundaryFragment',
                        properties: [
                            {
                                comment: `
                                    MovementTarget position when UMassNavMeshNavigationBoundaryProcessor was last
                                    updated. Used to identify when a new update is needed.
                                `,
                                type: 'FVector',
                                name: 'LastUpdatePosition',
                                defaultValue: 'FVector::ZeroVector'
                            }
                        ]
                    }
                ],
                traits: [
                    {
                        id: 'UMassNavMeshNavigationTrait',
                        displayName: 'NavMesh Navigation',
                        properties: [],
                        requiredFragments: [
                            m.ref('FMassMoveTargetFragment', { module: 'MassNavigation' }),
                        ],
                        addsFragments: [
                            m.ref('FMassNavMeshCachedPathFragment'),
                            m.ref('FMassNavMeshShortPathFragment'),
                            m.ref('FMassNavMeshBoundaryFragment'),
                        ]
                    },
                ],
                processors: [
                    { id: 'UMassNavMeshNavigationBoundaryProcessor' },
                    { id: 'UMassNavMeshPathFollowProcessor' },
                ]
            })),
            declareModule('MassZoneGraphNavigation', m => ({
                fragments: [
                    {
                        id: 'FMassZoneGraphPathRequestFragment',
                        properties: [
                            {
                                comment: `Short path request Handle to current lane.`,
                                specifiers: ['Transient'],
                                type: 'FZoneGraphShortPathRequest',
                                name: 'PathRequest'
                            }
                        ]
                    },
                    {
                        id: 'FMassZoneGraphLaneLocationFragment',
                        properties: [
                            {
                                comment: `Handle to current lane.`,
                                type: 'FZoneGraphLaneHandle',
                                name: 'LaneHandle'
                            },
                            {
                                comment: `Distance along current lane.`,
                                type: 'float',
                                name: 'DistanceAlongLane',
                                defaultValue: '0.0f'
                            },
                            {
                                comment: `Cached lane length, used for clamping and testing if at end of lane.`,
                                type: 'float',
                                name: 'LaneLength',
                                defaultValue: '0.0f'
                            },
                        ]
                    },
                    {
                        id: 'FMassZoneGraphCachedLaneFragment',
                        properties: [
                            {
                                type: 'FZoneGraphLaneHandle',
                                name: 'LaneHandle'
                            },
                            {
                                comment: `
                                    Lane points
                                `,
                                type: 'TStaticArray<FVector, MaxPoints>',
                                name: 'LanePoints'
                            },
                            {
                                comment: `
                                    Cached length of the lane.
                                `,
                                type: 'float',
                                name: 'LaneLength',
                                defaultValue: '0.0f'
                            },
                            {
                                comment: `
                                    Lane tangents
                                `,
                                type: 'TStaticArray<FMassSnorm8Vector2D, MaxPoints>',
                                name: 'LaneTangentVectors'
                            },
                            {
                                comment: `
                                    lane Advance distances
                                `,
                                type: 'TStaticArray<FMassInt16Real10, MaxPoints>',
                                name: 'LanePointProgressions'
                            },
                            {
                                comment: `
                                    Cached width of the lane.
                                `,
                                defaultValue: 'FMassInt16Real(0.0f)',
                                type: 'FMassInt16Real',
                                name: 'LaneWidth',
                            },
                            {
                                comment: `
                                    Additional space left of the lane
                                `,
                                type: 'FMassInt16Real',
                                name: 'LaneLeftSpace',
                                defaultValue: 'FMassInt16Real(0.0f)',
                            },
                            {
                                comment: `
                                    Additional space right of the lane
                                `,
                                type: 'FMassInt16Real',
                                name: 'LaneRightSpace',
                                defaultValue: 'FMassInt16Real(0.0f)',
                            },
                            {
                                comment: `
                                    ID incremented each time the cache is updated.
                                `,
                                type: 'uint16',
                                name: 'CacheID',
                                defaultValue: '0'
                            },
                            {
                                comment: `
                                    Number of points on path.
                                `,
                                type: 'uint8',
                                name: 'NumPoints',
                                defaultValue: '0'
                            },
                        ]
                    },
                    {
                        id: 'FMassZoneGraphShortPathFragment',
                        properties: [
                            {
                                conditionals: ['WITH_MASSGAMEPLAY_DEBUG'],
                                type: 'FZoneGraphLaneHandle',
                                name: 'DebugLaneHandle',
                                comment: `
                                    Current lane handle, for debug
                                `,
                            },

                            {
                                type: 'FZoneGraphLaneHandle',
                                name: 'NextLaneHandle',
                                comment: `
                                    If valid, the this lane will be set as current lane after the path follow is completed.
                                `,
                            },

                            {
                                type: 'float',
                                name: 'ProgressDistance',
                                defaultValue: '0.0f',
                                comment: `
                                    Current progress distance along the lane.
                                `,
                            },

                            {
                                type: 'TStaticArray<FMassZoneGraphPathPoint, MaxPoints>',
                                name: 'Points',
                                comment: `
                                    Path points
                                `,
                            },

                            {
                                type: 'EZoneLaneLinkType',
                                name: 'NextExitLinkType',
                                defaultValue: 'EZoneLaneLinkType::None',
                                comment: `
                                    If next lane is set, this is how to reach the lane from current lane.
                                `,
                            },

                            {
                                type: 'uint8',
                                name: 'NumPoints',
                                defaultValue: '0',
                                comment: `
                                    Number of points on path.
                                `,
                            },

                            {
                                type: 'EMassMovementAction',
                                name: 'EndOfPathIntent',
                                defaultValue: 'EMassMovementAction::Stand',
                                comment: `
                                    Intent at the end of the path.
                                `,
                            },

                            {
                                type: 'uint8:1',
                                name: 'bMoveReverse',
                                comment: `
                                    True if we're moving reverse
                                `,
                            },

                            {
                                type: 'uint8:1',
                                name: 'bPartialResult',
                                comment: `
                                    True if the path was partial.
                                `,
                            },

                            {
                                type: 'uint8:1',
                                name: 'bDone',
                                comment: `
                                    True when path follow is completed.
                                `,
                            },
                        ]
                    },
                    {
                        id: 'FMassLaneCacheBoundaryFragment',
                        properties: [
                            {
                                comment: `Last update position.`,
                                type: 'FVector',
                                name: 'LastUpdatePosition',
                                defaultValue: 'FVector::ZeroVector'
                            },
                            {
                                comment: `Lane cached ID at last update.`,
                                type: 'uint16',
                                name: 'LastUpdateCacheID',
                                defaultValue: '0'
                            },
                        ]
                    },
                    {
                        id: 'FMassZoneGraphNavigationParameters',
                        parent: F_MASS_CONST_SHARED_FRAGMENT,
                        properties: [
                            {
                                comment: `Filter describing which lanes can be used when spawned.`,
                                specifiers: ['EditAnywhere'],
                                category: 'Navigation',
                                type: 'FZoneGraphTagFilter',
                                name: 'LaneFilter',
                            },
                            {
                                comment: `Query radius when trying to find nearest lane when spawned.`,
                                specifiers: ['EditAnywhere'],
                                category: 'Navigation',
                                type: 'float',
                                name: 'QueryRadius',
                                defaultValue: '500.0f',
                                metaSpecifiers: {
                                    UIMin: '0.0',
                                    ClampMin: '0.0',
                                    ForceUnits: "cm"
                                }
                            },
                        ]
                    },
                ],
                traits: [
                    {
                        id: 'UMassZoneGraphNavigationTrait',
                        displayName: 'ZoneGraph Navigation',
                        requiredFragments: [
                            m.ref('FAgentRadiusFragment', { module: M_MASS_COMMON }),
                            m.ref('FTransformFragment', { module: M_MASS_COMMON }),
                            m.ref('FMassVelocityFragment', { module: 'MassMovement' }),
                            m.ref('FMassMoveTargetFragment', { module: 'MassNavigation' }),
                        ],
                        addsFragments: [
                            m.ref('FMassZoneGraphLaneLocationFragment'),
                            m.ref('FMassZoneGraphPathRequestFragment'),
                            m.ref('FMassZoneGraphShortPathFragment'),
                            m.ref('FMassZoneGraphCachedLaneFragment'),
                            m.ref('FMassLaneCacheBoundaryFragment'),
                            m.ref('FMassZoneGraphNavigationParameters'),
                        ],
                        properties: [
                            {
                                category: 'Movement',
                                specifiers: ['EditAnywhere'],
                                type: 'FMassZoneGraphNavigationParameters',
                                name: 'NavigationParameters'
                            },
                        ]
                    },
                ],
                processors: [
                    { id: 'UMassZoneGraphPathFollowProcessor' },
                    { id: 'UMassZoneGraphLaneCacheBoundaryProcessor' },
                ]
            }))
        ]
    }
];
