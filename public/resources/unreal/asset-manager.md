# Asset Manager

The Unreal Asset Manager (not to be confused with the Asset Registry or the Streamable Manager) 
provides dependency management, bundling and introspection of a special group of assets called 
"primary" assets. You define which assets are "primary", and the asset manager determines which 
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

