# Unreal C++ IDEs

> [!NOTE]
> The objectively correct choice between Visual Studio and Jetbrains Rider is Jetbrains Rider.
> However, I've included a section below on Visual Studio in the case that you don't value your time.

# Build Configurations

Unreal has two "dimensions" that are part of each build configuration.

# Target 

First there is the Target (Editor or Game)
- Editor: Builds and runs the [Editor target](./build). C++ is compiled with `WITH_EDITOR` and related macros set to true. This type of build supports loading "normal" (properly "uncooked") Unreal assets as well as cooked assets.
- Game: Builds and runs the [Game target](./build). C++ is compiled with `WITH_EDITOR` cleared. This type of build supports loading _only_ cooked assets. 

When you package your game, Unreal builds the Game target. When you open the editor, Unreal builds (obviously) the Editor target.

# Configuration

The second dimension is how much optimization you want to apply. This is most akin to other development environments where you might have a "Debug" configuration where compiler optimizations are disabled for improved debugging support, and a "Release" configuration where compiler optimizations are present for better end-user performance.

In the case of Unreal there is:
- Debug: Everything (your code and the engine) is compiled without any compiler optimizations for full debuggability
- DebugGame: Your code is compiled without any compiler optimizations for full debuggability
  ✅ This is the one you should use most often
- Development: Your code is compiled at a reasonable balance of optimization and debuggability
- Shipping: Everything (your code and the engine) is fully optimized

When you use a prepackaged Unreal Engine installation (ie a "launcher build") by installing it from the Epic Games Store launcher, the "Debug" configuration is not available, because the launcher build does not ship a version of Unreal that has been compiled with no optimizations. If you build Unreal from source however, this is available to you. Running the editor with optimizations fully disabled can be rather slow, so you'd want to do this only when you need to set breakpoints and inspect variables within the engine code.

Note that it is not impossible to debug the engine's code when you are using DebugGame or Development configurations, but setting or hitting breakpoints may be unreliable and variable inspection may not be available or may even give you incorrect information. It's definitely more efficient and less confusing to use a fully unoptimized build ("Debug") for debugging the engine. 

# Putting It Together

In Visual Studio these two dimensions are shown _together_:
- DebugGame Game
- DebugGame Editor
- Development Game
- Development Editor
- etc

But the above explains how these are constructed.

In Rider this is not the case, the IDE shows two distinct options, one for Target and one for Configuration.

# "Game" Target and Cooking

When you run any of the Game targets, you are running your game as it would behave _when packaged_. That's why you need to cook your assets before using this target. If you fail to cook, you will see an error message telling you that you need to cook, but if your cook is out of date, you can end up with outdated content within the game, or even strange errors due to the older cooked assets not lining up with the newer C++ code that you've compiled. 

But this is important to note, that you _do not need to fully package the game to test how a packaged game should perform_. This has other implications, because you can easily run the Game target from your IDE _in its debugger_ allowing you to more easily investigate problems that only showed up after you packaged the game. 

This isn't perfect, because a packaged game also loads your assets from `.pak` files, and in later versions of Unreal Engine the newer Zenloader and IOStore packaging technologies can introduce additional issues which may not appear until the final packaged game, but these issues are still rare. 

# What Configuration does the Epic Games Launcher use?

The Epic Games Launcher always runs your project in the Development configuration, even if you have been using DebugGame in your IDE. During startup it **does not rebuild your project when it is out of date** by default. You can enable the "Force Compilation at Startup" editor setting to force the editor to rebuild your project when needed. 

This is important because your last Development build may be out of date compared to the code you've written! This can very easily cause problems or prevent the editor from starting or prevent your game from being played.

# Rider

[Jetbrains Rider](https://www.jetbrains.com/rider/) offers Unreal-specific features which are very useful: No need 
for SLNs using their built-in Uproject support, Blueprint stack frames when debugging C++, Unreal asset references, 
built in Unreal log, Unreal specific class templates, and more. It’s free for students and non-commerical use.

Rider uses __Resharper__ underneath the covers to provide intellisense and code completion. Resharper is vastly 
superior to Visual Studio's built-in intellisense systems.

> [!TIP]
> When upgrading your project, Unreal may say "The project failed to compile, would you like to open Rider Uproject"?  
> _This is a lie!_ It will open the SLN file in Rider instead. This can cause silly issues. Make sure that you have 
> opened the `.uproject` file after upgrading. It's a bit tricky to tell that you are no longer in the uproject context.
> 

## RiderLink

You will want to install RiderLink (which is Rider's companion Unreal plugin). When [Live Coding](./hotreload.md) it 
allows you to use the Build button directly in Rider instead of having to use the shortcut or menu items in the editor.

# Visual Studio

> [!TIP]
> If you insist on ~~killing kittens~~ using Visual Studio, at least read 
> [Epic's guide](https://dev.epicgames.com/documentation/en-us/unreal-engine/setting-up-visual-studio-development-environment-for-cplusplus-projects-in-unreal-engine) 
> as well as the following supplementary information.

Out of the box Visual Studio’s Error List and Intellisense can give you false positives because it displays errors 
while it’s still processing the (quite large) Unreal C++ codebase. Epic's guide covers configuring Visual Studio to hide 
the Error List. You can also disable Intellisense entirely or improve your Intellisense performance using Jetbrains 
Resharper.

If you are asking for help in the `#cpp` channel of Unreal Source, _please_ send us the full text from the Output tab
(just paste it, Discord will create a snippet if its too large). The Output tab is the logs from UnrealBuildTool, which
is the *actual* build system for your game.

## I'm getting an error in AutomationTool or some other Engine project!

One of the following has occurred:
- You have the wrong project set as your Startup project. It should be your game project
- You have used the Build Solution button (don't do that)
- You have used the Clean or Rebuild buttons (don't do that)

Unreal builds your project, Visual Studio does not. Some of the features of the Visual Studio IDE don't directly map 
to how [Unreal's build system](./build) works. Make sure to only use the Build, Run and Debug actions within Visual 
Studio.

## Help! There's like... Nuget errors and stuff

If you received an _error_ on Nuget Restore, then one of the following has occurred:
- You have the wrong project set as your Startup project. It should be your game project
- You have used the Build Solution button (don't do that)
- You have used the Clean or Rebuild buttons (don't do that)

If you received a _warning or informational message_ involving Nuget, then ignore it. Close the Error List and switch
to the Output tab where your build is actually failing for a completely different reason. Also check that the above 
(set startup project, do not use Build Solution or Clean). 

Alternatively, seriously switch to Rider where you can just open the `.uproject` -- you are not going to get Nuget 
restore issues on that.
