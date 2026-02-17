# Things I Wish You Wouldn't Do In #cpp

Just collecting some things I really wish you wouldn't do when asking for help in #cpp on [Unreal Source](../../unrealsource.md).

## Posting a callstack without symbols

You need to install the Editor Debug Symbols for the engine. That's not negotiable. Yes it's large. No, I don't care.
Without it, not only are crash reports unusable, but you also cannot debug the editor, and if you are writing C++, you 
should be able to debug the editor.

## Posting only the callstack

When you post _only_ the callstack for the crash you are experiencing, you are doing yourself a disservice. When the 
engine tells you, for instance, "Access Violation at 0x000000c0", that _means something_. Did you know it doesn't have 
to say "Access Violation"? It could say "Stack Overflow" or "Breakpoint hit" or all kinds of other things! 

Always post the entire crash report, not just the callstack.

## Posting screenshots of the Visual Studio Error List

There are few things that have been more thoroughly explained than this in #cpp. Visual Studio will show you 
_intellisense_ errors in this list. Visual Studio also _[doesn't build your code](../../unreal/cpp/build.md)_ 
(Unreal does). 

Instead, click the Output tab near the bottom of your IDE and look at the UnrealBuildTool output. That's the _actual_ 
errors.
