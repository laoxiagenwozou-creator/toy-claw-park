import bpy
for name in ('body','eyes','suit','goggles','backflything'):
    m=bpy.data.materials[name]
    for node in m.node_tree.nodes:
        if node.type in ('MIX','VALTORGB','ATTRIBUTE','MAPPING','TEX_GRADIENT'):
            print(name,node.name,node.type,getattr(node,'attribute_name',''),[(s.name,s.type,[(l.from_node.name,l.from_socket.name) for l in s.links] if s.is_linked else (s.default_value[:] if hasattr(s.default_value,'__len__') else s.default_value)) for s in node.inputs if s.enabled and not s.hide and hasattr(s,'default_value')][:6])
print('SCENE',bpy.context.scene.render.bake.use_selected_to_active)
