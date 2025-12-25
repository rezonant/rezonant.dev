# Asset Manager

The Unreal Asset Manager (not to be confused with the [Asset Registry](./asset-registry.md) or the 
[Streamable Manager](./streamable-manager.md)) provides dependency management, bundling and introspection of a special 
group of assets called "primary" assets. You define which assets are "primary", and the asset manager determines which 
other assets the primary assets depend on and labels them "secondary" assets.

There are several reasons to do this:
- To be able to enumerate assets of a specific type (for instance "Item") in an efficient manner 
  without needing to load them all at once
- To be able to reference a specific asset via a convenient short name without needing to know the 
  full package name, such as "Item:Apple"
- To ensure assets are cooked and made available in the packaged game even if they are not 
  referenced by your game
- In order to use Unreal's pak chunking to prioritize assets used earlier in your game

# Primary Asset IDs

Primary assets are assigned short identifiers which can be used to reference or load them. The 
asset manager's main job is to enumerate the IDs associated with a _primary asset type_ and to load 
an asset when given a primary asset type and an ID. The engine provides the `FPrimaryAssetId` 
structure to represent a tuple of the primary asset type and the primary asset's ID.

The asset manager determines the primary asset ID by calling `UObject::GetPrimaryAssetId()` on the 
main object of an asset. The default implementation of this function indirectly asks the Asset 
Manager to provide an ID for the asset. Subclasses can instead override this behavior and implement 
their own strategy for determining the primary IDs for their assets.

The asset manager uses `UAssetManager::DeterminePrimaryAssetIdForObject()` to determine what ID 
should be used for an object which does not implement its own `GetPrimaryAssetId()`. This method is 
virtual, and so you can override it in your own asset manager if you want to change the strategy. 
This would be useful if you want to use your own IDs for engine provided assets like `UTexture` (though the default implementation already provides a suitable way to do this).

By default the asset manager will use the rules you specify in its configuration in order to infer 
the Primary Asset Type to use for types which do not implement `GetPrimaryAssetId()` themselves. It 
does this by checking what rules match the directory of the asset, and then using the "Primary 
Asset Type" setting of that rule. 

As a convenience, the engine provides a special `UDataAsset` subclass called `UPrimaryDataAsset`, 
intended for use as the base class for custom data asset classes of your own. This class provides a 
special implementation of `GetPrimaryAssetId()` that infers the Primary Asset Type to be the name 
of the data asset object's Class directly (without consulting the asset manager). 

It's important to note here that for these assets (or any assets with their own 
`GetPrimaryAssetId()` implementation), the "Primary Asset Type" field of the matching asset manager 
rule is *not consulted*. This means you cannot _change_ the type used for assets that match a rule 
via that field like you can for simple assets like textures or materials as described above. And 
yet, as described below, the "Primary Asset Type" field is *also* used to determine which assets 
*match* the rule. So if you set the wrong value in Primary Asset Type and you are targetting assets 
that have their own `GetPrimaryAssetId()` implementation, its likely that none of the assets will 
match. This is a common source of condusion.

# Configuring the Asset Manager

Under Project Settings -> Game -> Asset Manager you will find the configuration for the asset 
manager. Here you can configure rules under "Primary Asset Types" that the asset manager will use 
to determine which assets are indexed as primary assets, and in some cases (see above), what 
primary asset type those assets should be grouped under.

No primary assets will be registered unless they are covered by a Primary Asset Type specified 
within the Asset Manager settings, regardless of whether they inherit from UPrimaryDataAsset or 
override `UObject::GetPrimaryAssetId`. Only the configuration determines whether assets are registered or not.

Each entry has the following fields:
- **Primary Asset Type**: This will be the primary asset type that all matches will be registered 
  under. Only assets which match this primary asset type (as returned by their implementation of 
  `GetPrimaryAssetId()` will match **unless the asset does not have its own implementation of 
  `GetPrimaryAssetId()`**, in which case this field will be used to determine the primary asset 
  type for those assets, assuming all other constraints in entry match.
- **Asset Base Class**: Only assets which are instances of this class, or are instances of a subclass of this class, will match this entry. 
- **Has Blueprint Classes**: When true, only Blueprints will match this entry. When false, only 
  normal objects (data assets or other non-Blueprint assets) will match this entry. It is not 
  possible to match both: either an asset type contains "Classes" (ie blueprints) or "Objects" (ie 
  instances of classes, whether Blueprint or native C++ classes), not both. A common mistake here 
  is creating a Blueprint class inheriting from `UPrimaryDataAsset`, but then creating Blueprint 
  _subclasses_ of that class when you should have created Data Assets which use that class instead. 
  If you did that, you should recreate the assets as Data Assets unless you explicitly need every 
  primary asset of this type to be a class (which will need to be instantiated into an object after 
  load!)
- **Is Editor Only**: When true, the assets will be indexed and made available in the editor, but not in a cooked game.
- **Directories**: Directories to look in to find potential matches for this rule. These directories are always scanned recursively.
- **Specific Assets**: A list of specific assets to consider for matching this rule (they must still satisfy all other parts of the rule).
- **Rules**: 
    * **Priority**: Determines how the asset manager chooses which primary asset should manage
      which secondary assets (ie the dependencies of the primary assets) in the case where two or 
      more primary assets depend on the same secondary assets. Higher priority wins. Equal priority 
      is shared custody.
    * **Chunk ID**: When using chunked paks, determines which chunk primary assets of this type 
      should be placed in by default. This can be overridden for specific assets in the "Primary 
      Asset Rules" option.
    * **Apply Recursively**: Whether the relevant settings of this primary asset type (Chunk ID, 
      Cook Rule) should apply to only immediate dependency secondary assets (false) or those and 
      their dependencies (and so on) recursively (true). _This has nothing to do with the 
      Directories property!_
    * **Cook Rule**: Allows you to influence how cooking applies to the primary asset and its 
      secondary assets. You can enforce that a primary asset will always be cooked, never cooked (generating an error if something uses it), or various other rules. You usually want to use "Always Cook" here if you want these assets to always be enumerable and available for loading in cooked builds, even if nothing otherwise directly depends on them.

# Better Primary Asset Type Names

A common pattern is to override `GetPrimaryAssetId()` for the purpose of changing the primary asset type name that 
your assets use. For instance if you have a class `URPGItem`, you may want your assets to use the primary asset type 
`Item` instead of `RPGItem`. You can call `Super::GetPrimaryAssetId()` and use the ID portion of the result along 
with your custom type for an easy implementation.

## Blueprint-based Primary Data Asset Base Classes

For reasons as yet unknown, there is no way to override `GetPrimaryAssetId()` from within a Blueprint subclass of 
`UPrimaryDataAsset` (shown as "Primary Data Asset" within the Blueprint editor). This not only means you are stuck 
with using the Blueprint class name as the primary asset type, but since it will be based on the Blueprint _Generated Class_ name, it will be suffixed with "_C". There is no way around this without a C++ base class, you will have to use (for instance) "BP_Item_C" as the primary asset type. **Make sure to include the _C suffix in the Primary Asset Type configuration in your Asset Manager settings or else they won't match!**

# Inspecting Primary Assets

You don't need to actually play your game to inspect how the asset manager has applied your rules to your assets. 
Instead, use Asset Audit tool! Find it under Tools -> Asset Audit.

To see what assets have been assigned to a specific Primary Asset type, click "Add Primary Asset Type" and choose the 
type you want. If you make changes to your rules, you'll need to click "Clear Assets" and then choose your Primary 
Asset Type again.

# Loading Behavior

Primary Assets are not loaded automatically for you (you wouldn't want this behavior anyway if your assets are very 
large). You must load them by using the "Load Async Primary Assets" (or related Blueprint nodes) or by using 
`GEngine->AssetManager->LoadPrimaryAssetsWithType()` (or related functions). Unlike loading an asset in other ways,
once you load a primary asset, it will remain loaded until you request that the asset be unloaded via the asset manager.

When unloading assets via the asset manager, it only releases the lock on them that keeps them loaded when unreferenced.
If something else references them, they will continue to be loaded. Thus it is a common pattern to Load a primary asset,
set a reference to the asset somewhere, and then immediately Unload that primary asset so that it can be automatically
freed once it is no longer used.

## Loading in the Editor

During Play In Editor/Simulate In Editor (PIE/SIE), your game world shares the Asset Manager with the editor world. 
Since the editor marks assets that are loaded in asset windows with the `RF_Standalone` flag (which tells the GC to 
leave it loaded even when unreferenced), calls that do not perform loading like `GEngine->AssetManager->GetPrimaryAssetObject()`, the "Get Object from Primary Asset Id" Blueprint node, or resolving a
`TSoftObjectPtr` or Blueprint soft object reference without first ensuring its loaded may immediately return the object
when in PIE, but will not work when you play your game in Standalone (`-game`) or when playing a cooked/packaged game.

To ensure you are properly handling loading and not unintentionally relying on assets already loaded in the editor, you should try your experience in Standalone mode where assets (primary or not) will not be loaded ahead of play.

# Custom Asset Managers

Like many other Unreal Engine classes, you can substitute in your own `UAssetManager` subclass to be used instead of 
relying on `UAssetManager` itself. To do this, visit Project Settings -> Engine -> General Settings and set your class
in the "Asset Manager Class" property, or set `AssetManagerClassName` in the `/Script/Engine.Engine` section of `DefaultEngine.ini`.

This enables a lot of customization opportunities for how primary assets work, are loaded, etc. One example mentioned 
above is customizing the primary asset types and/or IDs assigned to engine-provided asset classes like textures and 
materials, but there are many other useful customizations that can be made. Consult the virtual methods of 
`UAssetManager` for more information.
