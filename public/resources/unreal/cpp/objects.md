# Unreal Objects

Here's some notes about Unreal's object system.

## Auto Nulling

> [!IMPORTANT]
> TLDR: Auto nulling applies to **all objects, not only Actors and Components.**

The [Epic documentation](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-object-handling-in-unreal-engine?application_version=5.5) for Unreal Object Handling is incorrect at worst or misleadingly worded at best. Consider this quote from the Unreal documentation (emphasis mine):

> When an **AActor or UActorComponent** is destroyed or otherwise removed from play, all references to it that are visible to the reflection system (UProperty pointers and pointers stored in Unreal Engine container classes such as TArray) are automatically nulled. This is beneficial in that it prevents dangling pointers from persisting and causing trouble down the road, but it also means that **AActor and UActorComponent** pointers can become null if some other piece of code destroys them.

> It is important to realize that this feature **applies only to UActorComponent or AActor** references marked with UPROPERTY or stored in an Unreal Engine container class.

The problem with this documentation is that it creates the impression that Unreal's automatic nulling only applies to Actors and Components. This is not true. Any UObject can be auto-nulled if its `MarkAsGarbage()` method is called. Unfortunately, this documentation, despite being called "Unreal Object Handling" is almost exclusively focused on Actors and Components, despite much of its contents applying to UObjects in general. 

If you know that auto-nulling applies to all UObjects which are marked as garbage, you realize that the intended emphasis is elsewhere:

> It is important to realize that this feature applies only to [UActorComponent or AActor references] **marked with UPROPERTY** or stored in an Unreal Engine container class.

That is to say, they are trying to describe that auto-nulling doesn't magically locate pointers stored outside of UPROPERTY fields, which is true. 


# An Accurate Edit of Epic's Docs
> See below for an edited version of Epic's documentation that removes the misleading phrasing

When a `UObject` (such as `AActor` and `UActorComponent`) instance is destroyed or otherwise removed from play, the object is marked as garbage (see `MarkAsGarbage`). All references to it that are visible to the reflection system (`UPROPERTY` pointers and pointers stored in Unreal Engine container classes such as `TArray`) are automatically nulled. This is beneficial in that it prevents dangling pointers from persisting and causing trouble down the road, but it also means that `UObject` pointers can become null if some other piece of code destroys them. The ultimate advantage of this is that null-checking is more reliable, as it detects both standard-case null pointers and cases where a non-null pointer would have been pointing at deleted memory.

It is important to realize that this feature applies only to pointers stored in fields marked with `UPROPERTY` or stored in an Unreal Engine container class (such as `TArray`). A `UObject` pointer stored elsewhere will be unknown to the Unreal Engine, and will not be automatically nulled, nor will it prevent garbage collection. Note this does not mean that all `UObject*` fields must be marked as `UPROPERTY`. If you want a field that is not marked `UPROPERTY` (whether in a `UCLASS` or not), consider using `TWeakObjectPtr`. This is a "weak" pointer, meaning it will not prevent garbage collection, but it can be queried for validity before being accessed and will be set to null if the Object it points to is destroyed.

Another case where a referenced `UObject` `UPROPERTY` will be automatically null'ed is when using 'Force Delete' on an asset in the editor. As a result, all code operating on `UObject` instances which are assets must handle these pointers becoming null.
