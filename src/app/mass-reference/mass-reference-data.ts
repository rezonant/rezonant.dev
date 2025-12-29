import { MassElement, MassElementRef, MassFragmentRef, MassModule, MassPlugin, MassTag } from "./mass-types";

export const F_MASS_TAG: MassElementRef = { id: 'FMassTag', module: 'MassEntity' };
export const F_MASS_FRAGMENT: MassElementRef = { id: 'FMassFragment', module: 'MassEntity' }
export const F_MASS_CONST_SHARED_FRAGMENT: MassElementRef = { id: 'FMassConstSharedFragment', module: 'MassEntity' }
export const U_MASS_TRANSLATOR: MassElementRef = { id: 'UMassTranslator', module: 'MassSpawner' }
export const U_MASS_PROCESSOR: MassElementRef = { id: 'UMassProcessor', module: 'MassEntity' }
export const U_MASS_ENTITY_TRAIT_BASE: MassElementRef = { id: 'UMassEntityTraitBase', module: 'MassSpawner' }

interface ModuleBuilder {
    ref(id: string, moduleId?: string): MassElementRef;
    frag(id: string, extra?: Partial<MassFragmentRef>): MassFragmentRef;
}
function declareModule(moduleId: string, declarator: (module: ModuleBuilder) => Omit<MassModule, 'id'>) {
    return {
        ...declarator({
            ref: (id: string, otherModuleId?: string) => ({ module: otherModuleId || moduleId, id }),
            frag: (id: string, extra?: Omit<MassFragmentRef, 'id'>) => ({
                id,
                module: moduleId,
                ...(extra || {}),
            })
        }),
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
                    { id: 'FMassFragment' },
                    { id: 'FMassDebugLogFragment' },
                    { id: 'FMassConstSharedFragment' }
                ],
                processors: [
                    { id: 'UMassProcessor' },
                    { id: 'UMassObserverProcessor' },
                    { id: 'UMassCompositeProcessor' }
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
                    { id: 'FMassCrowdLaneTrackingFragment' },
                    { id: 'FMassCrowdObstacleFragment' },
                ],
                traits: [
                    { id: 'UMassCrowdMemberTrait' },
                    { id: 'UMassCrowdServerRepresentationTrait' },

                ],
                processors: [
                    { id: 'UMassCrowdDynamicObstacleProcessor' },
                    { id: 'UMassCrowdServerRepresentationLODProcessor' },
                    { id: 'UMassDebugCrowdVisualizationProcessor' },
                ]
            }))
        ]
    },
    {
        id: 'MassGameplay',
        modules: [
            declareModule('MassActors', m => ({
                fragments: [
                    { id: 'FMassActorInstanceFragment' },
                    {
                        id: 'FCharacterMovementComponentWrapperFragment',
                        parent: m.ref('FObjectWrapperFragment', 'MassCommon'),
                        properties: [
                            {
                                name: 'Component',
                                type: 'TWeakObjectPtr<UCharacterMovementComponent>'
                            }
                        ]
                    },
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
                    { id: 'UMassAgentSyncTrait' },
                ],
                processors: [
                    {
                        id: 'UMassCharacterMovementToMassTranslator',
                        parent: U_MASS_TRANSLATOR
                    },
                    {
                        id: 'UMassCharacterMovementToActorTranslator',
                        parent: U_MASS_TRANSLATOR
                    },
                    {
                        id: 'UMassCharacterOrientationToMassTranslator',
                        parent: U_MASS_TRANSLATOR
                    },
                    {
                        id: 'UMassCharacterOrientationToActorTranslator',
                        parent: U_MASS_TRANSLATOR
                    },

                    {
                        id: 'UMassCapsuleTransformToMassTranslator',
                        parent: U_MASS_TRANSLATOR
                    },
                    {
                        id: 'UMassTransformToActorCapsuleTranslator',
                        parent: U_MASS_TRANSLATOR
                    },
                    {
                        id: 'UMassSceneComponentLocationToMassTranslator',
                        parent: U_MASS_TRANSLATOR
                    },
                    {
                        id: 'UMassSceneComponentLocationToActorTranslator',
                        parent: U_MASS_TRANSLATOR
                    },
                    {
                        id: 'UMassTranslator_BehaviorTree',
                        parent: U_MASS_TRANSLATOR
                    }
                ]
            })),
            declareModule('MassEQS', m => ({
                processors: [
                    { id: 'UMassEnvQueryProcessorBase', parent: U_MASS_PROCESSOR },
                    {
                        id: 'UMassEnvQueryTestProcessor_MassEntityTags',
                        parent: { id: 'UMassEnvQueryProcessorBase', module: 'MassEQS' }
                    },
                    {
                        id: 'UMassEnvQueryGeneratorProcessor_MassEntityHandles',
                        parent: { id: 'UMassEnvQueryProcessorBase', module: 'MassEQS' }
                    }
                ]
            })),
            declareModule('MassGameplayDebug', m => ({
                tags: [
                    declareTag('FMassDebuggableTag')
                ],
                fragments: [
                    { id: 'FSimDebugVisFragment' },
                    { id: 'FDataFragment_DebugVis' }
                ],
                traits: [
                    { id: 'UMassDebugVisualizationTrait' },
                ],
                processors: [
                    { id: 'UDebugVisLocationProcessor' },
                    { id: 'UMassProcessor_UpdateDebugVis' },
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
                    { id: 'FMassViewerInfoFragment' },
                    { id: 'FMassSimulationLODFragment' },
                    { id: 'FMassSimulationVariableTickFragment' },
                    { id: 'FMassSimulationLODParameters', parent: F_MASS_CONST_SHARED_FRAGMENT },
                    { id: 'FMassSimulationVariableTickParameters', parent: F_MASS_CONST_SHARED_FRAGMENT }
                ],
                traits: [
                    { id: 'UMassLODCollectorTrait' },
                    { id: 'UMassDistanceLODCollectorTrait' },
                    { id: 'UMassSimulationLODTrait' },
                ],
                processors: [
                    { id: 'UMassLODCollectorProcessor' },
                    { id: 'UMassLODDistanceCollectorProcessor' },
                    { id: 'UMassSimulationLODProcessor' }
                ]
            })),
            declareModule('MassMovement', m => ({
                tags: [
                    declareTag('FMassSimpleMovementTag'),
                    declareTag('FMassCodeDrivenMovementTag')
                ],
                fragments: [
                    { id: 'FMassVelocityFragment' },
                    { id: 'FMassDesiredMovementFragment' },
                    { id: 'FMassForceFragment' },
                    { id: 'FMassMovementParameters', parent: F_MASS_CONST_SHARED_FRAGMENT },
                ],
                traits: [
                    { id: 'UMassSimpleMovementTrait' },
                    { id: 'UMassVelocityRandomizerTrait' },
                    { id: 'UMassMovementTrait' },
                ],
                processors: [
                    { id: 'UMassSimpleMovementProcessor' },
                    { id: 'UMassApplyForceProcessor' },
                    { id: 'UMassApplyMovementProcessor' }
                ]
            })),
            declareModule('MassReplication', m => ({
                tags: [
                    declareTag('FMassInReplicationGridTag')
                ],
                fragments: [
                    { id: 'FMassNetworkIDFragment' },
                    { id: 'FMassReplicatedAgentFragment' },
                    { id: 'FMassReplicationViewerInfoFragment' },
                    { id: 'FMassReplicationLODFragment' },
                    { id: 'FMassReplicationGridCellLocationFragment' },
                    { id: 'FMassReplicationParameters', parent: F_MASS_CONST_SHARED_FRAGMENT }
                ],
                traits: [
                    { id: 'UMassReplicationTrait' },
                ],
                processors: [
                    { id: 'UMassReplicationGridProcessor' },
                    { id: 'UMassReplicationProcessor' }
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
                    { id: 'FMassRepresentationLODFragment' },
                    { id: 'FMassRepresentationFragment' },
                    { id: 'FMassRepresentationParameters', parent: F_MASS_CONST_SHARED_FRAGMENT },
                    { id: 'FMassVisualizationLODParameters', parent: F_MASS_CONST_SHARED_FRAGMENT },
                    { id: 'FMassDistanceLODParameters', parent: F_MASS_CONST_SHARED_FRAGMENT }
                ],
                traits: [
                    { id: 'UMassDistanceVisualizationTrait' },
                    { id: 'UMassVisualizationTrait' },
                ],
                processors: [
                    { id: 'UMassDistanceLODProcessor' },
                    { id: 'UMassRepresentationProcessor' },
                    { id: 'UMassStationaryISMSwitcherProcessor' },
                    { id: 'UMassUpdateISMProcessor' },
                    { id: 'UMassVisualizationLODProcessor' }
                ]
            })),
            declareModule('MassSignals', m => ({
                processors: [
                    { id: 'UMassSignalProcessorBase' }
                ]
            })),
            declareModule('MassSmartObjects', m => ({
                tags: [
                    declareTag('FMassInActiveSmartObjectsRangeTag'),
                    declareTag('FMassSmartObjectCompletedRequestTag')
                ],
                fragments: [
                    { id: 'FMassSmartObjectUserFragment' },
                    { id: 'FMassSmartObjectTimedBehaviorFragment' },
                    { id: 'FSmartObjectRegistrationFragment' },
                    { id: 'FMassSmartObjectRequestResultFragment' },
                    { id: 'FMassSmartObjectWorldLocationRequestFragment' },
                    { id: 'FMassSmartObjectLaneLocationRequestFragment' },
                ],
                traits: [
                    { id: 'UMassSmartObjectUserTrait' },
                ],
                processors: [
                    { id: 'UMassSmartObjectCandidatesFinderProcessor' },
                    { id: 'UMassSmartObjectTimedBehaviorProcessor' }
                ]
            })),
            declareModule('MassCommon', m => ({
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
                    { id: 'FReplicationTemplateIDFragment' },
                ],
                traits: [
                    { id: 'UMassAssortedFragmentsTrait' },
                ],
                processors: [
                    { id: 'UMassSpawnLocationProcessor' },
                    {
                        id: 'UMassTranslator',
                        parent: m.ref('UMassProcessor', 'MassEntity')
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
                    { id: 'FMassLookAtRequestFragment' },
                    { id: 'FMassLookAtTargetFragment' },
                    { id: 'FMassLookAtTrajectoryFragment' },
                    { id: 'FMassStateTreeInstanceFragment', parent: F_MASS_CONST_SHARED_FRAGMENT },
                    { id: 'FMassZoneGraphAnnotationFragmen' },
                    { id: 'FMassStateTreeSharedFragment', parent: F_MASS_CONST_SHARED_FRAGMENT },
                ],
                traits: [
                    { id: 'UMassLookAtTargetTrait' },
                    { id: 'UMassLookAtTrait' },
                    { id: 'UMassStateTreeTrait' },
                    { id: 'UMassZoneGraphAnnotationTrait' }
                ],
                processors: [
                    { id: 'UMassLookAtProcessor' },
                    { id: 'UMassLookAtTargetGridProcessor' },
                    { id: 'UMassStateTreeActivationProcessor' },
                ]
            })),
            declareModule('MassAIDebug', m => ({
                processors: [
                    { id: 'UMassDebugStateTreeProcessor' },
                ]
            })),
            declareModule('MassNavigation', m => ({
                tags: [
                    declareTag('FMassInNavigationObstacleGridTag')
                ],
                fragments: [
                    { id: 'FMassNavigationEdgesFragment' },
                    { id: 'FMassAvoidanceEntitiesToIgnoreFragment' },
                    { id: 'FMassMoveTargetFragment' },
                    { id: 'FMassGhostLocationFragment' },
                    { id: 'FMassNavigationObstacleGridCellLocationFragment' },
                    { id: 'FMassAvoidanceColliderFragment' },
                    { id: 'FNavigationRelevantFragment' },
                    { id: 'FMassSteeringFragment' },
                    { id: 'FMassStandingSteeringFragment' },
                    { id: 'FMassMovingAvoidanceParameters', parent: F_MASS_CONST_SHARED_FRAGMENT },
                    { id: 'FMassStandingAvoidanceParameters', parent: F_MASS_CONST_SHARED_FRAGMENT },
                    { id: 'FNavigationRelevantParameters', parent: F_MASS_CONST_SHARED_FRAGMENT },
                    { id: 'FMassSmoothOrientationParameters', parent: F_MASS_CONST_SHARED_FRAGMENT },
                    { id: 'FMassMovingSteeringParameters', parent: F_MASS_CONST_SHARED_FRAGMENT },
                    { id: 'FMassStandingSteeringParameters', parent: F_MASS_CONST_SHARED_FRAGMENT },
                ],
                traits: [
                    { id: 'UMassObstacleAvoidanceTrait' },
                    { id: 'UMassNavigationObstacleTrait' },
                    { id: 'UMassSmoothOrientationTrait' },
                    {
                        id: 'UMassSteeringTrait',
                        requiredFragments: [
                            m.frag('FAgentRadiusFragment'),
                            m.frag('FTransformFragment'),
                            m.frag('FMassVelocityFragment'),
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
                    { id: 'UMassOffLODNavigationProcessor' },
                    { id: 'UMassNavigationSmoothHeightProcessor' },
                    { id: 'UMassNavigationObstacleGridProcessor' },
                    { id: 'UMassMovingAvoidanceProcessor' },
                    { id: 'UMassStandingAvoidanceProcessor' },
                    { id: 'UMassSmoothOrientationProcessor' },

                    {
                        id: 'UMassSteerToMoveTargetProcessor',
                        parent: U_MASS_PROCESSOR,
                        requiresFragments: [
                            m.frag('FTransformFragment', { module: 'MassCommon' }),
                            m.frag('FMassMoveTargetFragment'),
                            m.frag('FMassSteeringFragment'),
                            m.frag('FMassStandingSteeringFragment'),
                            m.frag('FMassGhostLocationFragment'),
                            m.frag('FMassForceFragment', { module: 'MassMovement' }),
                            m.frag('FMassDesiredMovementFragment', { module: 'MassMovement' }),
                            m.frag('FMassMovementParameters', { module: 'MassMovement' }),
                            m.frag('FMassMovingSteeringParameters', { const: true, shared: true }),
                            m.frag('FMassStandingSteeringParameters', { const: true, shared: true }),
                        ]
                    }
                ]
            })),
            declareModule('MassNavMeshNavigation', m => ({
                fragments: [
                    { id: 'FMassNavMeshShortPathFragment' },
                    { id: 'FMassNavMeshCachedPathFragment' },
                    { id: 'FMassNavMeshBoundaryFragment' }
                ],
                traits: [
                    { id: 'UMassNavMeshNavigationTrait' },
                ],
                processors: [
                    { id: 'UMassNavMeshNavigationBoundaryProcessor' },
                    { id: 'UMassNavMeshPathFollowProcessor' },
                ]
            })),
            declareModule('MassZoneGraphNavigation', m => ({
                fragments: [
                    { id: 'FMassZoneGraphPathRequestFragment' },
                    { id: 'FMassZoneGraphLaneLocationFragment' },
                    { id: 'FMassZoneGraphCachedLaneFragment' },
                    { id: 'FMassZoneGraphShortPathFragment' },
                    { id: 'FMassLaneCacheBoundaryFragment' },
                    { id: 'FMassZoneGraphNavigationParameters', parent: F_MASS_CONST_SHARED_FRAGMENT },
                ],
                traits: [
                    { id: 'UMassZoneGraphNavigationTrait' },
                ],
                processors: [
                    { id: 'UMassZoneGraphPathFollowProcessor' },
                    { id: 'UMassZoneGraphLaneCacheBoundaryProcessor' },
                ]
            }))
        ]
    }
];
