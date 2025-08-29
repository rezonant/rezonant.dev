# Nanite

Some notes on Nanite.

## Performance

The easily-gettable performance advice on Nanite is to avoid overdraw as shown in the Nanite Overdraw visualizer in 
editor, and to avoid using masked materials, among other things. I've gathered here some of the tips that are harder to 
find.

When only shipping Nanite:
- Disable Reverse Index Buffers and Depth Only Buffers [Source](https://youtu.be/vgsZGZ0csVQ?si=rFMtxC4ekFVeqPqG&t=297)
- Disable "Evaluate WPO" on actors which don't need it (or modify the engine to default this to off)

Also, settings Evaluate WPO on static meshes using materials that don't use WPO means Nanite doesn't have to do a bunch 
of unnecessary stuff.
