# Blueprint Search

Have you ever wondered how the "Find In Blueprints" search syntax works?

## Where does it happen?

The search string you type is ultimately processed in `FFiBSearchInstance::DoSearchQuery` defined in `FiBSearchInstance.cpp`.

## How does it work?

The FiB system doesn't actually search Blueprints- rather it searches "imaginary" data, which is a representation of Blueprint
or Blueprint elements which contain raw strings instead of structured data, which is more useful for the purpose of searches.
The base class of "imaginary" data elements is `FImaginaryFiBData`. 

Find In Blueprints supports filters which scope the search to specific elements. The "imaginary" elements 
that represent the actual Blueprint elements elect to be searched by declaring that they are compatible with one or more 
of these filters. For instance, `FImaginaryGraphNode`, which represents a Blueprint node within a graph, accepts `AllFilter`
and `NodesFilter`.

## Available Filters

The following filters can be used to limit search to specific elements of the Blueprints examined. For instance you could 
use `Functions(MyFunctionName)` to only return Blueprints or Blueprint elements which contain a function which matches the 
search query `MyFunctionName`.

- `All(searchtext)`
- `Blueprint(searchtext)`
- `Graphs(searchtext)`
- `EventGraphs(searchtext)`
- `Functions(searchtext)`
- `Macros(searchtext)`
- `Properties(searchtext)`
- `Variables(searchtext)` -- Searches within the variables of the Blueprints that are in scope
- `Components(searchtext)`
- `Nodes(searchtext)` -- Searches within the nodes of the Blueprints that are in scope
- `Pins(searchtext)`

## Object and Property Searches

In addition to the special filter "functions" shown above, you can also scope your search query to specific parts of the 
textual object representation of the Blueprint elements. 

The specifiable properties are the same as what's exposed via Unreal's text serialization format. So for instance, 

```
Nodes(VariableReference(MemberName=+"mScreenDamage" && MemberGuid(A=-1840187992 && B=1285617816 && C=1499148451 && D=-674400758)) || Name="(mScreenDamage)") || Pins(Binding="mScreenDamage") || Binding="mScreenDamage"
```

Begin Object Class=/Script/BlueprintGraph.K2Node_VariableGet Name="K2Node_VariableGet_1522" ExportPath="/Script/BlueprintGraph.K2Node_VariableGet'/Game/Chameleon/Chameleon.Chameleon:Create Material Instances.K2Node_VariableGet_1522'"
   VariableReference=(MemberName="mScreenDrops",MemberGuid=93E2B631429EBDBBD6A5329F9B42A852,bSelfContext=True)
   NodePosX=80
   NodePosY=144
   NodeGuid=B9B357714AE29014E457BA87032AC502
   CustomProperties Pin (PinId=9DD6F7014F325DFD5CB520BB092CBAE0,PinName="mScreenDrops",Direction="EGPD_Output",PinType.PinCategory="object",PinType.PinSubCategory="",PinType.PinSubCategoryObject="/Script/CoreUObject.Class'/Script/Engine.Material'",PinType.PinSubCategoryMemberReference=(),PinType.PinValueType=(),PinType.ContainerType=None,PinType.bIsReference=False,PinType.bIsConst=False,PinType.bIsWeakPointer=False,PinType.bIsUObjectWrapper=False,PinType.bSerializeAsSinglePrecisionFloat=False,LinkedTo=(K2Node_CallMaterialParameterCollectionFunction_9 4418B6F64E64B1EECA16F8A8B2678E58,),PersistentGuid=00000000000000000000000000000000,bHidden=False,bNotConnectable=False,bDefaultValueIsReadOnly=False,bDefaultValueIsIgnored=False,bAdvancedView=False,bOrphanedPin=False,)
   CustomProperties Pin (PinId=7AD04990407E517BDBC4DBBB6B49D9D1,PinName="self",PinFriendlyName=NSLOCTEXT("K2Node", "Target", "Target"),PinType.PinCategory="object",PinType.PinSubCategory="",PinType.PinSubCategoryObject="/Script/Engine.BlueprintGeneratedClass'/Game/Chameleon/Chameleon.Chameleon_C'",PinType.PinSubCategoryMemberReference=(),PinType.PinValueType=(),PinType.ContainerType=None,PinType.bIsReference=False,PinType.bIsConst=False,PinType.bIsWeakPointer=False,PinType.bIsUObjectWrapper=False,PinType.bSerializeAsSinglePrecisionFloat=False,PersistentGuid=00000000000000000000000000000000,bHidden=True,bNotConnectable=False,bDefaultValueIsReadOnly=False,bDefaultValueIsIgnored=False,bAdvancedView=False,bOrphanedPin=False,)
End Object


Nodes(Get && Name="Get m")