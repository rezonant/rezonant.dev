# Asset Registry

Unreal's Asset Registry is responsible for creating an index of the assets in your game and providing a centralized way
to manage the loading of those assets. All files found in the `Content` folder of your project (or the same folder in a 
Plugin or the Engine itself) are considered assets. 

# What are Assets?

Each `.uasset` file found in a `Content` directory is a serialized `UPackage` object. A `UPackage` contains a 
collection of serialized `UObject` objects. Each asset package has a "main object" which is considered the "asset" 
object. The main object is the one which has the same short name as the package object (ie given package 
`/Game/Content/MyAsset`, the asset is the object inside the package with short name `MyAsset`).

An object is considered part of a package if it has the `UPackage` in its Outer chain (see [Objects](./cpp/objects.md) for more information about Outers). A `UPackage`

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
