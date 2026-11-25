import bpy
from pathlib import Path
from mathutils import Vector
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(Path(__file__).resolve().parents[3]/'30_Assets'/'toy-claw-park'/'source-art'/'bluey-source-bingo.glb'))
for o in bpy.context.scene.objects:
    if o.type!='MESH' or len(o.data.polygons)<100: continue
    pts=[o.matrix_world@v.co for v in o.data.vertices]
    for lo,hi in [(.70,.88),(.88,1.1),(1.1,1.25),(1.25,1.5),(1.55,1.70),(2.,2.3)]:
        q=[p for p in pts if lo<abs(p.x)<hi]
        if q:print('ARM',o.name,lo,hi,min(p.z for p in q),max(p.z for p in q),min(p.y for p in q),max(p.y for p in q))
