"""Make static, offline toy editions of the authors' models. Run with Blender --disable-autoexec."""
import sys, math, bpy, bmesh
from pathlib import Path
from mathutils import Matrix, Vector

here=Path(__file__).resolve().parent
raw=here.parents[2]/'30_Assets'/'toy-claw-park'/'source-art'
kind=sys.argv[sys.argv.index('--')+1]
if kind in ('bluey','bingo'):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    filename='BlueyMinifig' if kind=='bluey' else 'bingo'
    bpy.ops.import_scene.gltf(filepath=str(raw/('bluey-source-'+filename+'.glb')))
allowed={'body','eye_L','eyes_R','gums_T','teeth_T','gums_B','teeth_B','tounge','back','medal','suit','headgear1','headgear2'}
items=[o for o in bpy.context.scene.objects if o.type=='MESH' and (o.name in allowed if kind=='skye' else not o.hide_render) and not any(c.name=='glTF_not_exported' for c in o.users_collection)]
scene=bpy.context.scene
if kind=='skye':
    for o in items:
        o.hide_render=False
        o.hide_viewport=False
        o.hide_set(False)
        for mod in list(o.modifiers):
            if mod.type in ('NODES','PARTICLE_SYSTEM','CLOTH','COLLISION','MULTIRES'):
                o.modifiers.remove(mod)
            elif mod.type=='SUBSURF': mod.levels=1
    for m in bpy.data.materials:
        if not m.node_tree: continue
        tree=m.node_tree
        p=next((n for n in tree.nodes if n.type=='BSDF_PRINCIPLED'),None)
        output=next((n for n in tree.nodes if n.type=='OUTPUT_MATERIAL' and n.is_active_output),None)
        if not p or not output: continue
        em=tree.nodes.new('ShaderNodeEmission')
        if m.name=='glass': em.inputs[0].default_value=(.19,.43,.49,1)
        elif p.inputs['Base Color'].is_linked: tree.links.new(p.inputs['Base Color'].links[0].from_socket,em.inputs[0])
        else: em.inputs[0].default_value=p.inputs['Base Color'].default_value
        tree.links.new(em.outputs[0],output.inputs['Surface'])
bpy.context.view_layer.update()
deps=bpy.context.evaluated_depsgraph_get()
prepared=[]
for original in items:
    evaluated=original.evaluated_get(deps)
    mesh=bpy.data.meshes.new_from_object(evaluated,preserve_all_data_layers=True,depsgraph=deps)
    if not mesh.polygons: continue
    obj=bpy.data.objects.new('toy_'+original.name,mesh)
    scene.collection.objects.link(obj)
    obj.matrix_world=original.matrix_world.copy()
    for key in original.keys():
        if key not in ('_RNA_UI',):
            try: obj[key]=original[key]
            except: pass
    omit={'eyeglass'} if kind=='skye' else {'outline'}
    b=bmesh.new();b.from_mesh(mesh)
    faces=[f for f in b.faces if f.material_index<len(mesh.materials) and mesh.materials[f.material_index] and mesh.materials[f.material_index].name in omit]
    if faces: bmesh.ops.delete(b,geom=faces,context='FACES')
    b.to_mesh(mesh);b.free()
    if not len(mesh.polygons): bpy.data.objects.remove(obj,do_unlink=True);continue
    prepared.append(obj)
for o in list(scene.objects):
    if o not in prepared: bpy.data.objects.remove(o,do_unlink=True)
bpy.context.view_layer.update()
def select(objects):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects: o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
if kind=='skye':
    scene.render.engine='CYCLES'
    scene.cycles.samples=1
    scene.render.bake.target='VERTEX_COLORS'
    scene.render.bake.use_selected_to_active=False
    for o in prepared:
        layer=o.data.color_attributes.new(name='ToyColor',type='BYTE_COLOR',domain='CORNER')
        o.data.color_attributes.active_color=layer
        o.data.color_attributes.render_color_index=o.data.color_attributes.find(layer.name)
    select(prepared)
    print('BAKE',bpy.ops.object.bake(type='EMIT',target='VERTEX_COLORS',use_selected_to_active=False))
    m=bpy.data.materials.new('Painted rescue figure');m.use_nodes=True
    bsdf=m.node_tree.nodes.get('Principled BSDF');attr=m.node_tree.nodes.new('ShaderNodeVertexColor');attr.layer_name='ToyColor'
    m.node_tree.links.new(attr.outputs['Color'],bsdf.inputs['Base Color'])
    bsdf.inputs['Roughness'].default_value=.65
    for o in prepared:
        layer=o.data.color_attributes['ToyColor']
        print('PAINT',o.name,[tuple(round(c,2) for c in layer.data[i].color[:3]) for i in range(0,len(layer.data),max(1,len(layer.data)//4))][:4])
        for old in list(o.data.color_attributes):
            if old.name!='ToyColor':o.data.color_attributes.remove(old)
        o.data.materials.clear();o.data.materials.append(m)
        for poly in o.data.polygons:poly.material_index=0
for o in prepared:
    o.data.calc_loop_triangles()
    tris=len(o.data.loop_triangles)
    if (kind=='bluey' and tris>2000) or (kind=='skye' and tris>800):
        select([o]);dec=o.modifiers.new(name='Tablet detail',type='DECIMATE')
        dec.ratio=max(550/tris,.065 if kind=='bluey' else .34)
        bpy.ops.object.modifier_apply(modifier=dec.name)
select(prepared);bpy.ops.object.join()
obj=bpy.context.object;obj.name=kind
# Bake object transforms, put the toy on its feet and center its footprint.
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
if kind=='bingo':
    # Replace the author's horizontal rigging pose with one lowered arm and a wave.
    for vert in obj.data.vertices:
        p=vert.co;side=1 if p.x>=0 else -1;rx=abs(p.x)-.82
        if rx<=0 or not 2.15<p.z<2.65:continue
        angle=(.57 if side>0 else -1.11)*min(1,rx/.32)
        h=p.z-2.39
        p.x=side*(.82+rx*math.cos(angle)-h*math.sin(angle))
        p.z=2.39+rx*math.sin(angle)+h*math.cos(angle)
        p.y-=.11*min(1,rx/.85)
    obj.data.update()
vs=[v.co.copy() for v in obj.data.vertices]
low=Vector([min(v[i] for v in vs) for i in range(3)]);high=Vector([max(v[i] for v in vs) for i in range(3)])
obj.data.transform(Matrix.Translation(Vector((-(low.x+high.x)/2,-(low.y+high.y)/2,-low.z))))
obj.data.transform(Matrix.Scale(1/max(.000001,high.z-low.z),4))
target=here.parent/'web'/'assets'/(kind+'.glb')
bpy.ops.export_scene.gltf(filepath=str(target),use_selection=True,export_format='GLB',export_animations=False,export_skins=False,export_morph=False,export_cameras=False,export_lights=False,export_extras=False)
print('TOYFILE',kind,'bounds',list(low),list(high),'bytes',target.stat().st_size)
