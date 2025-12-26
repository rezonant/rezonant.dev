# Asset Registry

Unreal's Asset Registry is responsible for creating an index of the assets in your game and providing a centralized way
to manage the loading of those assets. All files found in the `Content` folder of your project (or the same folder in a 
Plugin or the Engine itself) are considered assets. 

# What are Assets?

See the [dedicated overview page for the asset system](./assets.md).

# Obtaining the Asset Registry

The Asset Registry API is provided by the `IAssetRegistry` interface, and can be acquired by obtaining the Asset Registry module's primary module object like so:

```cpp
FAssetRegistryModule& AssetRegistryModule = FModuleManager::LoadModuleChecked<FAssetRegistryModule>(TEXT("AssetRegistry"));
IAssetRegistry& AssetRegistry = AssetRegistryModule.Get();
```

It is typical to wrap this in a `GetAssetRegistry` call with a local cache of the `IAssetRegistry` object.

# Asset Data versus Assets

The asset registry saves numerous details about each asset as `FAssetData` object which can be queried without loading 
the asset itself. 

# Learn More

- [Assets](./assets.md) -- An overview of Unreal's asset system
- [Asset Manager](./asset-manager.md) -- Provides high-level querying, grouping, and loading/unloading of "primary" 
  assets
- [Streamable Manager](./streamable-manager.md) -- Provides a common streaming system for large assets which may exist 
  in various streaming states, such as textures, static/skeletal meshes, or audio.
