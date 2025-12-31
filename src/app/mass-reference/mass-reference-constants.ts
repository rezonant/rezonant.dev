import { MassElementRef, MassProcessorExecutionFlag } from "./mass-types";

export const M_MASS_COMMON = 'MassCommon';
export const M_MASS_ENTITY = 'MassEntity';

export const F_MASS_TAG: MassElementRef = { id: 'FMassTag', module: M_MASS_ENTITY };
export const F_MASS_FRAGMENT: MassElementRef = { id: 'FMassFragment', module: M_MASS_ENTITY }
export const F_MASS_SHARED_FRAGMENT: MassElementRef = { id: 'FMassSharedFragment', module: M_MASS_ENTITY }
export const F_MASS_CONST_SHARED_FRAGMENT: MassElementRef = { id: 'FMassConstSharedFragment', module: M_MASS_ENTITY }
export const U_MASS_TRANSLATOR: MassElementRef = { id: 'UMassTranslator', module: 'MassSpawner' }
export const U_MASS_PROCESSOR: MassElementRef = { id: 'UMassProcessor', module: M_MASS_ENTITY }
export const U_MASS_ENTITY_TRAIT_BASE: MassElementRef = { id: 'UMassEntityTraitBase', module: 'MassSpawner' }
export const F_OBJECT_WRAPPER_FRAGMENT: MassElementRef = { id: 'FObjectWrapperFragment', module: 'MassCommon' }
export const F_MASS_CHUNK_FRAGMENT: MassElementRef = { id: 'FMassChunkFragment', module: M_MASS_ENTITY }


export const E_ALL_NET_MODES: MassProcessorExecutionFlag[] = ['Standalone', 'Server', 'Client'];
export const E_ALL_WORLD_MODES: MassProcessorExecutionFlag[] = ['Standalone', 'Server', 'Client', 'EditorWorld'];
export const E_ALL: MassProcessorExecutionFlag[] = ['Standalone', 'Server', 'Client', 'Editor', 'EditorWorld'];
export const E_DEFAULT: MassProcessorExecutionFlag[] = ['Server', 'Standalone'];

export const EG_UpdateWorldFromMass = 'UE::Mass::ProcessorGroupNames::UpdateWorldFromMass';
export const EG_SyncWorldToMass = 'UE::Mass::ProcessorGroupNames::SyncWorldToMass';
export const EG_Behavior = 'UE::Mass::ProcessorGroupNames::Behavior';
export const EG_Tasks = 'UE::Mass::ProcessorGroupNames::Tasks';
export const EG_Avoidance = 'UE::Mass::ProcessorGroupNames::Avoidance';
export const EG_ApplyForces = 'UE::Mass::ProcessorGroupNames::ApplyForces';
export const EG_Movement = 'UE::Mass::ProcessorGroupNames::Movement';
export const EG_LODCollector = 'UE::Mass::ProcessorGroupNames::LODCollector';
export const EG_LOD = 'UE::Mass::ProcessorGroupNames::LOD';
export const EG_Representation = 'UE::Mass::ProcessorGroupNames::Representation';
