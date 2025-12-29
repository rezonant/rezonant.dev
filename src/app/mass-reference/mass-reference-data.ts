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
                    { id: 'FMassFragment', properties: [] },
                    {
                        id: 'FMassDebugLogFragment',
                        properties: [
                            {
                                name: 'LogOwner',
                                type: 'TWeakObjectPtr<const UObject>'
                            }
                        ]
                    },
                    { id: 'FMassConstSharedFragment', properties: [] }
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
                    }
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
                    }
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
                    }
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
                    {
                        id: 'FReplicationTemplateIDFragment',
                        properties: [
                            { specifiers: ['Transient'], type: 'FMassEntityTemplateID', name: 'ID' }
                        ]
                    },
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
                                defaultValue: '{static_cast<uint8>(EMassLookAtPriorities::LowestPriority)}'
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
                                defaultValue: '{static_cast<uint8>(EMassLookAtPriorities::LowestPriority)}'
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
                    { id: 'UMassNavMeshNavigationTrait' },
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
