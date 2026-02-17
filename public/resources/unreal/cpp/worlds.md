# Worlds

A 3D scene in Unreal is composed of `AActors` which inhabit a `UWorld`. 

When your game is running, Unreal will manage a single `UWorld` at a time, which is created when a map is loaded, and is destroyed when the map is unloaded. 

## Editor Worlds

When you are editing a map within the Unreal editor, that is represented by a UWorld, simply called the Editor World. There can be one of these at a time, just like in your game, except this one is for editing, not playing. 

## Play In Editor

When you use the Play In Editor (PIE) and Simulate In Editor (SIE) feature to play a map within the editor, there are some special features:
- The editor doesn't have to fully reload the level when starting a play session
- You can edit your level and immediately play your game with those changes, without needing to save the level
- The editor's Outliner panel live updates showing the current actors, and you can view the Details for those actors and modify them on the fly. The changes will immediately reflect in the game world
- During play you can right click any actor and choose "Keep Simulation Changes", and the state of that actor will be saved after you end your play session and return to the editor

All of these features are thanks to Unreal's use of Worlds! 
Clicking Play or Simulate causes Unreal to duplicate the editor UWorld in memory. The game then takes place within that UWorld, and when you finish, the UWorld is discarded. 

## Pocket Worlds

> - [Presentation by Andrew Joy from 2Bit Studios](https://youtu.be/mu7I4PsXY44?si=4_xDdRqiyDExIaSw&t=88)
> - [Lyra's Pocket Worlds Plugin](https://github.com/EpicGames/UnrealEngine/tree/release/Samples/Games/Lyra/Plugins/PocketWorlds)
