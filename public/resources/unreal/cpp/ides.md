# Unreal C++ IDEs

> [!NOTE]
> The objectively correct choice between Visual Studio and Jetbrains Rider is Jetbrains Rider.
> However, I've included a section below on Visual Studio in the case that you don't value your time.

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
