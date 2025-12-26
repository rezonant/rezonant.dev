# Assets

All `.uasset` files found in the `Content` folder of your project (or the same folder in a Plugin or the Engine itself) 
are considered assets. 

Each `.uasset` file is a `UPackage` object serialized using the `FArchive` serialization system. A `UPackage` contains 
at least one serialized `UObject` along with any related objects it references. The main object is the one which has 
the same short name as the package object (ie given package `/Game/Content/MyAsset`, the asset is the object inside the 
package with short name `MyAsset`). You may find `UAsset` mentioned around the Unreal codebase in comments, but it is not a C++ type, this just refers to the `.uasset` file format in short.

An object is considered part of a package if it has the `UPackage` in its Outer chain (see [Objects](./cpp/objects.md) 
for more information about Outers). When saving a `UPackage` (using `UPackage::SavePackage()`), the objects that get 
persisted are the main object you pass and any objects referenced by that object which are part of the same `UPackage` 
(ie it has the `UPackage` in its outer chain).

Since assets can reference other assets, Unreal needs not only to save and load an asset's object(s) to/from an 
archived `UPackage`, but also handle "linking" when loading to ensure that when an asset is loaded from disk, the 
external references it had before saving are restored properly, including loading any other assets those references 
point to. This is the job of the "linker" (`FLinkerSave` / `FLinkerLoad`). Each package tracks a set of object 
"exports" and a set of object "imports" so that the linker can efficiently save and load asset packages. 

The simplest way (but most of the time not the correct way) to load an asset package is to use the `LoadPackage()` 
global. This will read the package from disk, reconstruct the `UPackage`, the main object, and all referenced objects, 
load any dependency asset packages, link the new package objects to the objects of the dependencies and return the 
`UPackage` for your use. You can then use `UPackage::FindAssetInPackage()` to obtain the asset object, or use 
`ForEachObjectWithPackage` to iterate over the objects in the package and use them as necessary.

You can check if a package is already loaded into memory (without causing it to load) using `FindPackage(nullptr, PackageName)`.

When calling `LoadPackage`, you can specify the `UPackage` object that will receive the contents of the given 
serialized package if you wish. Doing so is a useful way to acquire an independent copy of the objects that will not 
be inadvertently serialized back to disk if the package at the path you are loading is later saved back to disk. Not doing this means any other code that loads the package will receive the same objects in memory. 

# Learn More

Unreal has several systems built on top of the asset packaging system that make querying and loading assets simpler at
a higher level.

- [Asset Registry](./asset-registry.md) -- Powers the Content Browser, and can be used in your game to query assets at 
  scale
- [Asset Manager](./asset-manager.md) -- Provides high-level querying, grouping, and loading/unloading of "primary" 
  assets
- [Streamable Manager](./streamable-manager.md) -- Provides a common streaming system for large assets which may exist 
  in various streaming states, such as textures, static/skeletal meshes, or audio.
