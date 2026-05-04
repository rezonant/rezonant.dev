# Navigation

> NOTE: This article is a work in progress. It currently narrates mostly what the source code does while also trying to
> explain simply the purpose for each component of the overall navigation system, while also providing some useful tips 
> for doing things that I had interest in doing. If you're reading this article and are familiar with the navigation 
> system, I'm **actively looking for feedback on the accuracy of the content**.

# Resources
- [Recast & Detour - Hussein Khalil](https://www.unrealdoc.com/p/navigation-mesh) - An overview of how Unreal integrates
  the Recast/Detour open source project to provide Unreal's Navmesh system.
- [Static Navmesh Generation - Hussein Khalil](https://www.unrealdoc.com/p/navigation-mesh-static-gen) - More detail 
  about how static navmesh generation works

# Bugs

During this deep dive, I found some bugs. These should be reported to Epic and fixed, but whether Epic will take them in
remains to be seen.

- `UPathFollowingComponent` owned by `AController` does not clean up `APawn::OnActorHit` subscription when repossession
  occurs. This implies that possessing pawn A, then later possessing pawn B, then seting pawn B to move to pawn C, if pawn A touches pawn C, the path following component (now associated with pawn B) will incorrectly consider its path finished.

# Multiple Supported Agent Dimensions (and thus Multiple Nav Meshes)

If you specify multiple Supported Agents in your Project Settings (thus giving you multiple `ARecastNavMesh` actors within
your level, one per agent type), the engine will try to map each character that needs to navigate to the closest agent
(and thus nav mesh), preferring an agent definition that is slightly larger over one that is slightly smaller. 
Regardless of what you specify in your Character Movement Component's Agent Radius and Agent Height settings, the size 
of the capsule will be used for considering the agent instead. 

While this is possible, it is difficult to get multiple nav meshes working in simple scenarios, let alone with runtime
navmesh generation. Instead, consider...

# Supporting Many Agent Sizes With One Mesh

> See the talk [Crafting AI for a AAA Souls-Like Game in UE](https://www.youtube.com/watch?v=XKQfMZOXFv0) for more 
> information about this topic.

Using multiple nav meshes for multiple agent sizes is a workable strategy if you only have a small number of agent 
size "classes", otherwise generating a nav mesh for each agent size is prohibitively expensive in memory usage and if 
you are using dynamic navmesh generation, CPU usage. 

Instead a novel strategy is to use a single nav mesh tailored to the smallest supported agent you have and then 
annotating the polygons of the generated nav mesh in such a way that allows you to filter out the considered polygons 
when querying for larger agent sizes. You then just need to take care to ensure your larger agents don't collide with 
the walls at the edges of the nav mesh, which can be done by offsetting the points within a nav path such that they 
are a minimum distance from the edge of the nav mesh. 

# Parts of Unreal's Navigation System

## `UNavigationSystemBase`

The minimal base class of a navigation system. This is the type returned by `UWorld::GetNavigationSystem()`, and the 
base class required for `UNavigationSystemConfig::NavigationSystemClass`, which can be overridden via configuration. If 
you wish to use something other than `UNavigationSystemV1`. To change your navigation system class, you are expected to 
set `NavigationSystemClassName` within the `[/Script/Engine.Engine]` initializer in the Engine configuration.

Despite this class being the absolute minimal base class for a navigation system, practically speaking you must instead
extend `UNavigationSystemV1`, because most of the systems built above the navigation system such as AI (`AIModule`) 
assume that the navigation system will be at least as specialized as `UNavigationSystemV1`.

## `UNavigationSystemV1`

The Navigation System is a singleton object owned by the world (and with the same lifetime). If it were rewritten with 
modern Unreal APIs in mind it would most certainly be implemented as a `UWorldSubsystem` instead, but this class 
pre-dates subsystems.

The Navigation System's responsibilities are:
- To create, manage, and register `ANavigationData` actors according to the project's supported agents
- Resolve an appropriate ANavigationData actor instance given the provided agent properties, including its size and 
  location information (`GetNavDataForProps`)

## `ANavigationData`

An Actor that generates and holds navigation data, and provides a mechanism to query it. 
More generally called a "nav mesh" (and in fact the builtin system uses the `ARecastNavMesh` subclass for actual 
navigation data). 

## `AAbstractNavData`

A special `ANavigationData` subclass that is used for direct (as the crow flies) navigation
without following a ground surface, or avoiding obstacles. Thus, navigation paths generated by 
this nav data always have exactly two points, the start point and the end point. One 
`AAbstractNavData` is created per world regardless of configuration, and is not added to `UNavigationSystemV1::NavDataSet` so it will not be ticked or updated in any way. 

It is only used by the engine code in `AAIController::BuildPathfindingQuery()` when the move 
request is set to not use path finding (`FAIMoveRequest::bUsePathfinding`). This flag is exposed in `AAIController::MoveTo` and most of the higher level APIs built on top of it.

## `ARecastNavMesh`

An `ANavigationData` subclass which uses the open source Recast library for generation and querying. This is the 
builtin nav mesh solution in Unreal and is a pretty good standard option.


## `UNavigationQueryFilter`

Specifies which parts of the navigation data you don't wish to be included during a navigation query. 
This can be used to ignore off-mesh links (ie nav links), ignoring certain navmesh tiles and polygons, assigning 
custom costs to specific areas, etc.

## `FPathFindingQuery`

Represents a request to resolve a path from one point to another with a specified filter and
associated options. This is the primary type of request one can make of `ANavigationData`: How can I move from point A 
to B?

In addition to start and end location, `FPathFindingQuery` has an `Owner`, an optional `NavData` to perform the query 
against (if not provided, the main nav data will be used), a `QueryFilter` to filter what parts of the nav data should 
be used, an optional `CostLimit`, an additional `NavDataFlags` for passing arbitrary flags to the navigation system, 
and queries can be set to allow partial paths and whether to require the end location to be navigable in order for the 
query to succeed.

You can also provide an `FNavigationPath` to fill when executing the query (`PathInstanceToFill`), which allows you to 
reuse them without having to construct new ones on each query. `AAIController` does not make use of this facility.

After you've set up your `FPathFindingQuery`, you can execute the query by calling `UNavigationSystemV1::FindPathSync`
to compute the result immediately, or you can use `UNavigationSystemV1::FindPathAsync` to have
`UNavigationSystemV1::Tick` execute the query within a worker task and notify you when its done.

Async queries are intended to run between the start of `UNavigationSystemV1`'s tick function and 
`FWorldDelegates::OnWorldPostActorTick`. Any queries remaining in the queue at that point will be left for execution in 
the next frame.

## `FAIMoveRequest`

Represents a request for an `AAIController` (and its `UPathFollowingComponent`) to move its controlled pawn to a 
specified location.

## `AAIController`

An `APawn` controller (`AController`) that provides AI behavior for a pawn, and provides a unified API for AI behavior 
to request that the pawn be moved to a location by using navigation data (aka "navmesh") resolved by the 
`UNavigationSystemV1`.

## `UPathFollowingComponent`

Responsible for driving the movement component of an actor (as an `INavMovementInterface`) to make it move along a 
chosen navigation path. The component gets its path inputs via calls to the `RequestMove` method, which accepts the 
move request and a corresponding navigation path.

### Pawn Observation and Discovery of `NavMovementInterface`

`UPathFollowingComponent` can be added directly to `APawn` or to an `AController` actor. In the case that `AController` 
owns it, it will register to react to new pawn possessions on the `AController` owner using the delegate
`AController::OnNewPawn` delegate. Upon a pawn change, the `NavMovementInterface` property will be re-discovered so 
that it matches the movement component of the newly possessed pawn.

Regardless of how the component is attached, after locating its associated `APawn` it will search for a component which 
implements the `INavMovementInterface` interface and assign it to `NavMovementInterface`.

It will also subscribe to `APawn`'s `OnActorHit` delegate. Unfortunately this subscription is never cleaned up, which 
is a bug.

### Block Detection

While executing a move along a path, `UPathFollowingComponent` is interested in knowing when the agent becomes blocked
due to collision (or potentially other reasons that it cannot make forward progress). To do this, it keeps 10 samples
(by default) of the agent's current position relative to its current base actor, gathering a new sample per tick while 
moving. When the sample buffer is full, and the distance between the average of the samples is less than 10 units (by 
default), the agent is considered "blocked" (`IsBlocked()`).

If the agent is detected as blocked during the component's tick, it will prematurely end path finding with status 
`EPathFollowingResult::Blocked`.

### Destination Reached Checks

There are two ways that `UPathFollowingComponent` considers its current move operation to be complete. First, if the pawn being driven collides with the destination goal actor, pathing is immediately considered to be complete. If the goal is a position and not an actor, then a check is done to see if the agent is overlapping the goal position. There are a number of ways to customize and configure this end of pathing condition.

- **Set `UPathFollowingComponent::AcceptanceRadius`**: Defines the radius around the goal position in which navigation 
  is considered to be complete.
- **Implement `INavAgentInterface::GetMoveGoalReachTest` on the Goal Actor**: Allows the destination goal actor to 
  influence the offset, radius, and capsule half height to be used for the overlap check.

## `INavAgentInterface`

Represents an agent that is being moved automatically by the navigation system. Typically this is an `APawn`

## `FNavigationPath`

Represents a computed navigation path intended for an agent (pawn) to follow. These can be global, or relative to a 
"base" actor (see glossary).

## `UCrowdManagerBase`

Base class for crowd managers, which is a generic way to implement avoidance. The builtin `UCrowdManager` uses the 
Detour Crowds avoidance features within Recast. The crowd manager acts as the central authority for 
`UCrowdFollowingComponent`.

## `UCrowdFollowingComponent`

A specialized subclass of `UPathFollowingComponent` which incorporates crowd management and avoidance information from 
`UCrowdManager` when driving the movement of a pawn.

## "Moved Too Far" Check

Because the main purpose of `UCrowdFollowingComponent` is to deviate normal nav paths to route agents around each other
in the "crowd", this comes with several edge cases that must be handled. Normally `UPathFollowingComponent` detects
successful completion of path movement in one of two ways: via a "bump" into the goal (when the goal is an actor) or 
by checking if the agent's capsule overlaps with the goal (for more detail, see `UPathFollowingComponent` section).



### Initialization

The `UCrowdFollowingComponent::Initialize()` override performs its parent class's initialization and then will register 
itself as a Crowd Agent (`ICrowdAgentInterface`) with `UCrowdManager` if it has already been created, and otherwise 
hooks into the `UNavigationSystemV1::OnNavigationInitDone` delegate to perform the registration later. If registration 
is not successful at that point, it disables crowd simulation, which causes it to act the same as 
`UPathFollowingComponent`. In this case it will also attempt to re-set its `NavMovementInterface` value, which seems 
redundant but is intended to ensure that `MyNavData` gets cached in the case that `SetNavMovementInterface` was called 
before the navigation system was ready. If that were the case, `MyNavData` could not have been assigned since nav data 
would not yet be ready.

### Cleanup

The `UCrowdFollowingComponent::Cleanup()` override performs its parent class's cleanup, and then will unregister itself 
with the crowd manager if registration succeeded prior. As part of that, it will also disable crowd simulation on itself
in case the component is used post cleanup.

### AbortMove

Prior to executing its parent implementation, the `UCrowdFollowingComponent::AbortMove()` override will inform the Crowd
Manager of the abortion using `UCrowdManager::ClearAgentMoveTarget()` (assuming it is in a crowd simulation state to 
begin with, and that there is in fact a pending move to abort).

### PauseMove

Prior to executing its parent implementation, the `UCrowdFollowingComponent::PauseMove()` override will inform the crowd
manager that the move is paused using `UCrowdManager::PauseAgent()` (assuming it is in a crowd simulation state to 
begin with, and that there is in fact a pending move to pause).

### ResumeMove

Prior to executing its parent implementation, the `UCrowdFollowingComponent::ResumeMove()` override will inform the 
crowd manager that the move is being resumed using `UCrowdManager::ResumeAgent()` (assuming it is in a crowd simulation 
state to begin with, and that there is in fact a pending move to resume).

## `ICrowdAgentInterface`

Interface implemented by `UCrowdFollowingComponent` which provides information to the crowd manager about the agent's 
location, velocity, collision information, max speed, avoidance group, groups that the agent should avoid, and groups
that the agent should ignore.

## `INavMovementInterface`

Implemented by movement components like `CharacterMovementComponent`, `UPawnMovementComponent` etc, this interface 
handles moving the agent in a certain direction (via `RequestPathMove` and `RequestDirectMove`) and also provides 
feedback information about the agent and its state for use within the navigation system.

`RequestPathMove` accepts a direction vector and strength, with a magnitude 1 ("normal") vector representing full speed.
`RequestDirectMove` accepts an exact velocity.

Additionally it specifies methods for stopping movement, resetting state, updating agent properties of the nav agent, 
and setting braking distance.

## `IPathFollowingAgentInterface`

A simple interface allowing the `INavMovementInterface` to communicate back to the `UPathFollowingComponent` 
(or equivalent) without introducing a direct dependency. This interface allows the movement component to communicate 
certain events such as being unable to move, starting to fall, landing on ground, and movement being blocked by 
collision.

## `FNavigationSystem`

The primary purpose of this namespace is to house delegates that enable connecting the low-level Gameplay Framework 
classes (`AActor`, `UActorComponent`) with the chosen navigation system (`UNavigationSystemBase` subclass) without 
requiring a circular dependency between the `Engine` module and the `NavigationSystem` module. 

The namespace also contains some utility functions that are presumed to be considered useful for various Navigation 
System implementations.

The delegate hooks provided by `FNavigationSystem` are encapsulated within the `NavigationSystem` module within `UNavigationSystemBase`, eg `UNavigationSystemBase::OnActorRegisteredDelegate()`. They are expected to be bound by the active Navigation System class within its CDO constructor, and for `UNavigationSystemV1` you can see it uses the `UNavigationSystemBase::` exposures of the delegates and not the `FNavigationSystem::` exposures of the delegates.

So the lower level Gameplay Framework code in `Engine` modules uses `FNavigationSystem` to call the delegates and the higher level navigation system found in the `NavigationSystem` module uses `UNavigationSystemBase` to bind to the delegates.

## `UPathFollowingManager` / `IPathFollowingManagerInterface`

This is a weird part of the system. At first glance it appears like this code is orphaned, but it's actually not. `AController::StopMovement()` calls `FNavigationSystem::StopMovement()`, which calls `FNavigationSystem::Delegates.StopMovement`. `IPathFollowingManagerInterface::StopMovementDelegate()` returns `FNavigationSystem::Delegates.StopMovement`. `UPathFollowingManager` binds to the delegate returned by `IPathFollowingManagerInterface::StopMovementDelegate()`.

Thus, calling `AController::StopMovement()` ends up executing `UPathFollowingManager::StopMovement()`.

`AController::IsFollowingAPath()` follows a similar chain, ending up executing `UPathFollowingManager::IsFollowingAPath()`. 

The implementations of these methods in `UPathFollowingManager` simply find an owned `UPathFollowingComponent` and delegate to its methods. This is despite the fact that its possible to use a different `IPathFollowingAgentInterface` component for a given custom `AController` subclass...

# Glossary

The following terms are used very commonly in the navigation system and related systems such as the Character system
and AI system

## Based movement, base actor

The Character system supports movement on top of surfaces which are moving (ie vehicles, moving platforms, other 
characters). In that case, care is taken to ensure the movement of the "based" actor is done relative to the "base" 
actor, and that movement of the "base" actor causes the "based" actor to move in kind.
