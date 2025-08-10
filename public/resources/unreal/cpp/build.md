# Unreal C++ Build Tooling

> [!WARNING] 
> This article is a work in progress. Please ping me on Unreal Source (@rezonant) if you have feedback or find 
> inaccuracies!

<br/>

> Resources from Epic:  
> - [UnrealBuildTool Documentation](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-build-tool-in-unreal-engine)
> - [Modules - Overview and Structure](https://dev.epicgames.com/community/learning/knowledge-base/GDD9/unreal-engine-modules-overview-and-structure)
> Resources from the community:
> - [UE4 Modules - flassari](https://www.youtube.com/watch?v=DqqQ_wiWYOw)

When you build your Unreal game from your [IDE](./ides), the IDE itself has nothing to do with how the project is built.
The Build and Start options simply call out to Unreal's own build system, called **Unreal Build Tool**.

Unreal Build Tool is part of the engine. It is a program written in C# which knows how to build not only your game,
but also the majority of the engine itself. When you use **Visual Studio**, the SLN (solution) file that you open is 
a specially crafted solution created by the engine to wrap Unreal Build Tool in a way that Visual Studio knows how to 
use. Therefore, the **Solution settings** have virtually no effect on how your application is built, and should be ignored.
For more information, see [IDEs](./ides).

The rest of this document covers how UBT works, and how you can control what it does.

# Unreal Build Tool: A 'make' for your Unreal Project

In the C/C++ community there is no shortage of "build orchestrators", or "make" tools. There is GNU Make, Ninja, CMake,
BSD Make, and of course Microsoft's alternative which is known as MSBuild and the Visual Studio Solution (SLN) system.

It is extremely common for Unreal developers to be using Windows workstations to develop their games. As the most common
operating system and the primary PC operating system that your players will use to play your game, it is natural to be 
using Windows. It's also usually a guarantee that platform-specific SDKs provided by console manufacturers will be usable 
on this platform. 

However, Unreal supports deploying your games to other operating systems like Linux and macOS. You can even use the Unreal
Editor on those systems to create assets for your game. So the Unreal Engine codebase is designed to be platform-agnostic,
and to do this it has the `FPlatform` family of classes which abstract platform-specific operations for the rest of the 
engine (and your game) to use. 

Since Unreal Engine (and your game) can be built on non-Windows platforms, Unreal cannot simply use Microsoft's build tools 
to compile and link C++ source code. Those tools are Windows-only, and do not work on Linux and macOS. Instead of finding 
a cross-platform solution like CMake or Ninja (both of which did not exist when Unreal Engine began development sometime 
around 1998), Epic made its own build tool specifically for the engine and called it Unreal Build Tool.

# Targets and Modules

Much like any other build system, Unreal Build Tool supports two concepts that define _what_ is being built. There are 
"targets" which represent the output being built (and what type of output it is), and "modules" which define a link 
boundary and provide a mechanism for encapsulating implementation details and code organization.

# The Source folder

Unreal Build Tool looks for C++ source files as well as Target and Module definitions within the Source folder of a 
given project. Target definitions are located at the top level (just inside Source) and Modules are located in their 
own subfolders. You can have as many or as few organizational folders above an Unreal module as you need.

# Targets

A Target is recognized by existence of a file ending in ".Target.cs" being present within the Source folder. Typically 
a game project has two targets, a Game target and an Editor target. A game with the name of "ActionRPG" for instance would have:

- `ActionRPG.Target.cs` -- this is the Game target
- `ActionRPGEditor.Target.cs` -- this is the Editor target.

A game project can have multiple game and editor targets, which may be useful for creating specific builds that have 
different modules included, different build configurations, etc. This is rare in most simple projects.

A Target can be one of the following types:

- **Game**  
  A "game" target is one which results in a game executable being built. The editor-specific parts of the engine codebase
  are removed, leaving only the code that will be shipped to the end user. As a result of this, these builds cannot use 
  assets which require Unreal Editor functionality. All assets can be processed into what's called a "cooked" version which
  strips out the parts that require Editor code, while also optimizing the assets and preparing them for efficient use 
  at runtime. 

- **Editor**  
  An "editor" target is one which results in an Unreal Editor executable being built. Here your project-specific code 
  is combined with the Unreal Engine's editor code to produce the final editor that you run. In this way, the Unreal Editor
  is **part of your project**. Think of it like a very very large code library that comes with its own user interface and 
  also handles the entrypoint to your program. 

- **Client**  
  A "client" target is a specialized Game target which is intended for use as a client build of a client/server multiplayer 
  game. It omits code and assets that are only required for acting as a server for the game.

- **Server**  
  A "server" target is a specialized Game target which is intended for use as a dedicated server build of a client/server 
  multiplayer game. It omits code and assets that are only required for acting as a client for the game.

- **Program**  
  A "program" target is a non-game target which results in a normal executable. The benefit here is that you can still 
  leverage the Unreal Engine codebase to create that program. This is typically done for creating specific tooling, 
  automations, etc.

By default a Target includes the parts of the engine necessary to bootstrap the resulting executable. In the case of 
the Editor, this is all the core engine modules and all the modules that are part of plugins enabled for your project 
(see the Plugins section of the `.uproject` file). 

You add more code to the target by using `ExtraModuleNames`. In the ActionRPG example above you would include 
at least `ActionRPG` in this list. Note that this will not be the only module included, as modules can declare other 
modules as dependencies, and doing so will result in those modules being included in the target's final module list.

Modules that are not included as part of the default target type, are not specified in the `ExtraModuleNames` property
of the target definition, and are not referenced within the dependency tree of those modules, will not be built or 
included for this target. Thus having separate Game and Editor targets is very useful, because you can include specific 
modules that should only be built for the editor or for the game (and in the case of editor-only modules that means you
don't have to conditionally compile references to editor-only declarations since the module will only be built when 
building the editor).

The Target also specifies global build settings such as what architectures are being built, what version of C++ should be used, whether to use UBT's Unity Build feature for more efficient compilation of large projects, how C++ includes should be ordered for compatibility with older project code, and much much more. Most of these settings can be overridden at the module level as well, and you can even programmatically receive the target configuration from within your module configuration and use it to determine how to configure your module.

# Build Types (Modular / Monolithic)

Unreal Build Tool can build a final executable in one of two ways: using dynamic linking (DLLs) and using static linking (library files). UBT refers to dynamic linking as a "modular" build because the final result will have the code for each module existing in its own DLL, versus a "monolithic" build which will consist only of the EXE (and a few auxiliary DLLs that are not statically compiled).

You can choose which build type you want for both your Game target and your Editor target. By default Unreal uses a modular build for the Editor target and a monolithic build for the Game target.

Modular builds reduce the link time required to produce the final executable at the expense of disk space and load-time complexity. Monolithic builds take longer to link but reduce disk space requirements, filesystem complexity, and load-time complexity. 

# Modules

Modules are the building blocks of Unreal, both for the engine and your project. Modules are detected by UnrealBuildTool by finding a `.Build.cs` file within a folder underneath `Source`. You cannot nest modules, but you can have as many organizational folders as you want above the module's folder. Within the module's folder, all .cpp files found within will be built by Unreal Build Tool. It is convention for modules to have a `Public` folder and `Private` folder, and for the C++ source files and private headers to be placed in `Private` and the headers meant for other modules to use to be found in the `Public` folder. Unreal Build Tool does not treat these folders specially however, it only knows about them because the `.Build.cs` file specifies these folders using the `PrivateIncludePaths` and `PublicIncludePaths` options. 

# Static/Dynamic Linking

In Modular builds (see above), each module is built as a dynamic library or shared object (ie a `.dll` or `.so`), 
which means the symbols in each module must be _linked_ to the code which uses them. 

In dynamic linking, each shared object has a "symbol table" which contains a set of entries, one per function. Each 
entry has a textual symbol name along with the address within the object binary where the code for that function can 
be found. 

C/C++ compilers on platforms which use executable binary formats with well-designed symbol tables (such as the ELF 
format on Linux) typically export every function/variable defined within the library as a symbol by default. This is 
because the format allows a maximum of 2<sup>64</sup> symbols to be listed in the symbol table, so there isn't a point 
to restricting it. 

However for Windows DLLs this is not the case. DLLs (like EXEs) use the Portable Executable (PE) format. That format 
uses a 16-bit index into the symbol table, meaning the maximum number of symbols that can be exported by a single 
DLL is 2<sup>16</sup> or 65,536 symbols. 

For smaller libraries this is not a problem, but since the resource is technically limited and there is of course 
value in allowing the library author to avoid a symbol being created for a specific function/variable, Microsoft 
Visual C++ only exports symbols for functions you specifically request to be exported via the 
[`__declspec(dllexport)` modifier](https://learn.microsoft.com/en-us/cpp/cpp/dllexport-dllimport?view=msvc-170), 
which must be placed on the function or class declaration. When placed on a class declaration, all function symbols 
within the class are exported automatically for convenience. All non-adorned functions/variables default to "internal" 
linkage, in which case a symbol is not created in the symbol table for that address.

Just as MSVC has `dllexport`, so to does it have `dllimport`. When you declare a function or class that you intend to 
import from a DLL you must mark it with `__declspec(dllimport)`. 

Many C++ library codebases avoid having two header files (one meant for internal use within a library and another 
meant for library consumers to include) by conditionally declaring a macro which resolves to `__declspec(dllexport)` 
when compiling the library itself, and `__declspec(dllimport)` when the header is included from a program _consuming_ 
the library. Unreal does exactly this using the `MODULENAME_API` macros that are automatically injected by Unreal 
Build Tool.

When building the C++ files of the module "Foo", UnrealBuildTool specifies a macro of `FOO_API` which resolves to `__declspec(dllexport)`. You can use this within your declarations like so:

```c++
// Foo/Public/MyFunction.h
void FOO_API MyFunction(int a);
```

When building the C++ files of modules which _depend_ on module "Foo", UBT defines `FOO_API` to be `__declspec(dllimport)`. 

So the source files of the Foo module itself end up declaring:

```c++
// Foo/Public/MyFunction.h
void __declspec(dllexport) MyFunction(int a);
```

...and the source files of dependent modules end up declaring:

```c++
// Foo/Public/MyFunction.h
void __declspec(dllimport) MyFunction(int a);
```

# Engine Modules & Exported Symbol Limits

You might think 65k symbols is plenty (and for most cases it is). When would you ever need more than that? In the 
case of Unreal, the engine is _already_ sliced up into lots of DLLs (via Unreal Modules), so the limit really applies 
to how many functions a _specific Unreal module_ can export. 

To avoid any one module hitting the symbol export limit when building Modular builds, modern releases of Unreal are 
careful to only export "useful" functions as symbols for use by other modules. Unfortunately Epic frequently overlooks 
symbols which should be exported, and will even upon occasion export functions which cannot be used because a 
different dependent function is *not* exported. This leads to a lot of frustration amongst developers making games 
with, and tooling for, Unreal. 

The `Engine` module of the engine _is_ quite large- rumor has it that Epic has struggled with the symbol table for 
this module in the past. The size of this module is an artifact of a time before the engine had grown _quite so_ 
large as it is now (remember that every function, constructor, destructor etc must have a symbol). 

In Unreal 5.6.0 for example, the editor build of the Engine module (`UnrealEditor-Engine.dll`) exports 37,961 symbols,
and that's _after_ Epic stopped exporting a lot of symbols that developers didn't "need", so you can see how 
exporting every single symbol could actually exceed the 65k limit.

You might suggest that Epic would use exports as a way to control access to specific functionality, but thats what 
`public/protected/private/friend` visibility modifiers are for, and exports do not affect monolithic builds at all -- 
all variables/functions are available to all compilation units, since the symbol table is not used to resolve these 
at all during static linking. Not exporting a symbol doesn't mean you should not use it, it means not enough people 
want to use it for Epic to justify paying the cost. 

Note that most engine modules are _significantly_ smaller than this, the module with the next largest symbol table is
 `UnrealEd` with 8,968 symbols.

# The Module Class & Lifecycle Events

Modules must declare an implementation class and register it with the module system using one of the `IMPLEMENT_MODULE`
macros within one of the module's source (.cpp) files, typically the implementation file for the module class itself. 
Failing to do this will cause the module manager to fail to initialize the module at startup. 

Module classes implement the `IModuleInterface` interface which provides the ability to run code during several 
lifecycle events (ie load/shutdown, etc). This can be used to initialize your module if needed.

# Game Modules

> [Epic's docs](https://dev.epicgames.com/documentation/en-us/unreal-engine/gameplay-modules-in-unreal-engine)

Every game project has at least one module which is known as the Primary Game Module. This module
will be the "launch module" for the target unless otherwise specified. You must have at least one of these.

```cpp
IMPLEMENT_PRIMARY_GAME_MODULE(FNameOfModuleClass, ModuleName, "ProjectName");
```

In the above statement, `FNameOfModuleClass` would be the module class (for responding to load/unload events and other 
lifecycle operations), `ModuleName` is the name of the module as specified by the UBT `ModuleName.build.cs` 
module configuration, and `"ProjectName"` can be whatever you feel like, but conventionally should be the name of the 
uproject, without the `.uproject` suffix. This last parameter is unused.

> [!NOTE]
> This parameter previously determined the result returned by `FApp::GetProjectName()`, but UBT now injects the 
> preprocessor directive `UE_PROJECT_NAME`. For content-only projects and invocations of the editor the name of 
> the `.uproject` is parsed from the command line instead (see `LaunchEngineLoop.cpp`, `LaunchSetGameName()`).

You can also use `IMPLEMENT_GAME_MODULE` for additional modules in place of `IMPLEMENT_MODULE`. Epic's documentation 
hints that this creates additional DLLs whereas `IMPLEMENT_MODULE` does not, but this is not true. There appears to be 
no functional difference between using `IMPLEMENT_GAME_MODULE` and `IMPLEMENT_MODULE`. Please ping me on Unreal Source
if you know otherwise.

> [!NOTE]
> The special built-in UnrealGame target (and corresponding empty module) is used for content-only projects (also 
> known as Blueprint projects) which do not have their own C++ primary game module. This is needed for example when 
> building monolithic executables and plugins are used (as they need to be compiled in).

