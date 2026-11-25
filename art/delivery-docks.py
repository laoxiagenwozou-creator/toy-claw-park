"""Build two states per theme for the transparent delivery-dock atlas.

Run with Python 3 and Pillow:
    python art/delivery-docks.py --blender D:/Blender/blender.exe
Supply --qa <directory> to keep the individual PNGs and a 92px-wide contact sheet.
All geometry and materials are defined below. No model or artwork is downloaded.
"""
import argparse
import math
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile


THEMES = ("snow", "town", "lookout", "yard", "garden", "reef", "space", "pony", "peppa", "sheriff", "chicks", "spidey")
SIZE = (256, 224)
COLORS = {
    "wood": "E6AE6D", "woodlight": "FFE1AA", "wooddark": "965A37", "cream": "FFF0CD",
    "vanilla": "FFF8E9", "pink": "F7898A", "red": "DA5447", "cherry": "A83535",
    "yellow": "FFC753", "gold": "ECA13B", "ink": "263D52", "blue": "528EB8",
    "navy": "405D90", "ice": "A4D7DB", "teal": "4BA5A1", "sea": "68B8B3",
    "fern": "66A95F", "green": "458972", "lime": "B9D484", "lavender": "A59BC8",
    "shell": "EFAEA6", "apricot": "FFB790", "plum": "6F698E", "dark": "584942",
}
PALETTES = {
    "snow": ("ice", "cream", "teal"), "town": ("red", "cream", "cherry"),
    "lookout": ("navy", "yellow", "blue"), "yard": ("gold", "cream", "red"),
    "garden": ("green", "lime", "fern"), "reef": ("teal", "shell", "sea"),
    "space": ("lavender", "cream", "plum"),
    "pony": ("lavender", "cream", "pink"), "peppa": ("yellow", "vanilla", "red"),
    "sheriff": ("blue", "cream", "navy"), "chicks": ("wood", "lime", "fern"),
    "spidey": ("red", "ice", "navy"),
}


def build_atlas(blender, qa_dir, output):
    from PIL import Image
    with tempfile.TemporaryDirectory(prefix="toy-claw-docks-") as scratch:
        tiles = Path(qa_dir or scratch)
        tiles.mkdir(parents=True, exist_ok=True)
        subprocess.run([blender, "--background", "--factory-startup", "--python-exit-code", "1",
                        "--python", str(Path(__file__).resolve()), "--", "tiles", str(tiles)], check=True)
        atlas = Image.new("RGBA", (SIZE[0] * len(THEMES), SIZE[1] * 2))
        for row, state in enumerate(("idle", "open")):
            for col, theme in enumerate(THEMES):
                with Image.open(tiles / f"dock-{theme}-{state}.png") as source:
                    tile = source.convert("RGBA").resize(SIZE, Image.Resampling.LANCZOS)
                box = tile.getchannel("A").getbbox()
                if not box or min(box[:2]) < 1 or box[2] >= SIZE[0] or box[3] >= SIZE[1]:
                    raise ValueError(f"{theme} {state} geometry clipped: {box}")
                atlas.paste(tile, (col*SIZE[0], row*SIZE[1]))
        atlas.save(output, "WEBP", lossless=True, method=6, exact=True)
        if qa_dir:
            preview = atlas.resize((644, 161), Image.Resampling.LANCZOS)
            ground = Image.new("RGBA", preview.size, "#f6ead5")
            ground.alpha_composite(preview)
            ground.convert("RGB").save(tiles / "dock-small-preview.png")


def render_tiles(directory):
    import bpy
    from mathutils import Vector
    scene = bpy.context.scene
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    scene.render.engine = "CYCLES"
    scene.cycles.samples = 20
    scene.cycles.use_denoising = True
    scene.cycles.max_bounces = 4
    scene.cycles.transparent_max_bounces = 4
    scene.render.resolution_x, scene.render.resolution_y = (384, 336)
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Medium High Contrast"
    scene.world.color = (.43, .43, .43)
    scene.world.use_nodes = True
    scene.world.node_tree.nodes["Background"].inputs[0].default_value = (.8, .83, .88, 1)
    scene.world.node_tree.nodes["Background"].inputs[1].default_value = .55

    def track(obj, point):
        obj.rotation_euler = (Vector(point) - obj.location).to_track_quat("-Z", "Y").to_euler()

    bpy.ops.object.camera_add(location=(4.2, -12.3, 5.1))
    camera = bpy.context.object
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = 3.95
    track(camera, (0, -.04, 1.30))
    scene.camera = camera
    for pos, energy, size, tint in [
        ((-4, -6, 9), 790, 5.0, (1.0, .89, .73)),
        ((5, -3, 5.5), 390, 4.0, (.86, .94, 1.0)),
        ((2, 4, 6), 650, 4.0, (1.0, .85, .67)),
    ]:
        bpy.ops.object.light_add(type="AREA", location=pos)
        lamp = bpy.context.object
        lamp.data.energy, lamp.data.shape, lamp.data.size, lamp.data.color = energy, "DISK", size, tint
        track(lamp, (0, 0, 1))

    materials = {}
    def linear(c):
        return c/12.92 if c <= .04045 else ((c+.055)/1.055)**2.4

    for key, color in COLORS.items():
        mat = bpy.data.materials.new(key)
        mat.use_fake_user = True
        mat.use_nodes = True
        shader = mat.node_tree.nodes.get("Principled BSDF")
        shader.inputs["Base Color"].default_value = tuple(linear(int(color[i:i+2], 16)/255) for i in (0,2,4)) + (1,)
        shader.inputs["Roughness"].default_value = .43 if key not in ("navy", "teal", "red") else .35
        if key.startswith("wood"):
            noise = mat.node_tree.nodes.new("ShaderNodeTexNoise")
            noise.inputs["Scale"].default_value = 8
            noise.inputs["Detail"].default_value = 1.3
            bump = mat.node_tree.nodes.new("ShaderNodeBump")
            bump.inputs["Strength"].default_value = .19
            bump.inputs["Distance"].default_value = .012
            mat.node_tree.links.new(noise.outputs["Fac"], bump.inputs["Height"])
            mat.node_tree.links.new(bump.outputs["Normal"], shader.inputs["Normal"])
        materials[key] = mat

    objects = []
    def finish(obj, material, bevel=0, smooth=False):
        objects.append(obj)
        obj.data.materials.append(materials[material])
        if smooth:
            for face in obj.data.polygons:
                face.use_smooth = True
        if bevel:
            mod = obj.modifiers.new("soft molded edge", "BEVEL")
            mod.width, mod.segments = bevel, 4
            mod = obj.modifiers.new("broad face normals", "WEIGHTED_NORMAL")
        return obj

    def box(pos, dims, material, bevel=.055, rot=(0,0,0)):
        bpy.ops.mesh.primitive_cube_add(size=1, location=pos)
        obj = bpy.context.object
        obj.dimensions = dims
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        obj.rotation_euler = rot
        return finish(obj, material, bevel, True)

    def ball(pos, radii, material, rot=(0,0,0)):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, location=pos)
        obj = bpy.context.object
        obj.scale = radii
        obj.rotation_euler = rot
        return finish(obj, material, smooth=True)

    def peg(pos, radius, height, material, r2=None, vertices=40, rot=(0,0,0)):
        bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=radius, radius2=radius if r2 is None else r2,
                                         depth=height, location=pos)
        obj = bpy.context.object
        obj.rotation_euler = rot
        return finish(obj, material, min(.028,height*.17), True)

    def plank(points, front, depth, material, bevel=.035):
        # Front is negative Y. The front polygon runs counterclockwise in X-Z.
        area = sum(x*z2-x2*z for (x,z),(x2,z2) in zip(points, points[1:]+points[:1]))
        pts = points if area > 0 else list(reversed(points))
        n = len(pts)
        vs = [(x,y,z) for y in (front, front+depth) for x,z in pts]
        fs = [tuple(range(n)), tuple(reversed(range(n,2*n)))]
        fs.extend(((i+1)%n, i, i+n, (i+1)%n+n) for i in range(n))
        mesh = bpy.data.meshes.new("shaped block")
        mesh.from_pydata(vs, [], fs)
        mesh.update()
        obj = bpy.data.objects.new("shaped block", mesh)
        scene.collection.objects.link(obj)
        return finish(obj, material, bevel, True)

    def link(a, b, radius, mat):
        a, b = Vector(a), Vector(b)
        delta = b-a
        obj = peg((a+b)/2, radius, delta.length, mat)
        obj.rotation_euler = delta.to_track_quat("Z","Y").to_euler()
        return obj

    def badge(cx, cz, scale, points, material, y=-.79):
        return plank([(cx+x*scale,cz+z*scale) for x,z in points], y, .095, material, .015)

    def roof(peak, eave, top, trim):
        pitch = math.atan2(peak-eave,1.22)
        slope = math.hypot(peak-eave,1.22)
        for side in (-1,1):
            box((side*.61,-.005,(peak+eave)/2),(slope+.13,1.69,.16),top,.075,(0,side*pitch,0))
        plank([(-1.06,eave-.11),(0,peak-.12),(1.06,eave-.11)],-.765,1.45,trim,.045)

    def paw(x,y,z,size):
        ball((x,y,z-.015*size),(.15*size,.036,.115*size),"cream")
        for dx,dz,tilt in [(-.17,.115,-.55),(-.062,.19,-.2),(.062,.19,.2),(.17,.115,.55)]:
            ball((x+dx*size,y,z+dz*size),(.049*size,.035,.071*size),"cream",(0,tilt,0))

    def motif(theme):
        if theme == "pony":
            box((0,0,1.86),(2.38,1.61,.16),"lavender",.07)
            for x in (-.87,.87):
                peg((x,-.49,2.05),.25,.47,"shell",vertices=12)
                peg((x,-.49,2.40),.30,.31,"plum",r2=.035,vertices=10)
                ball((x,-.49,2.58),(.065,.065,.065),"gold")
            badge(0,1.94,.24,[(0,1),(.26,.27),(.96,.22),(.41,-.2),(.54,-.88),(0,-.46),(-.54,-.88),(-.4,-.2),(-.96,.22),(-.25,.27)],"gold",-.88)
        if theme == "peppa":
            roof(2.51,1.85,"red","yellow")
            box((.62,.27,2.28),(.22,.24,.57),"cherry",.03)
            for x in (-.74,.74):
                box((x,-.82,1.68),(.25,.07,.25),"ice",.025)
                box((x,-.88,1.68),(.025,.018,.24),"vanilla",.006)
                box((x,-.88,1.68),(.24,.018,.025),"vanilla",.006)
        if theme == "sheriff":
            box((0,0,1.88),(2.49,1.62,.18),"navy",.07)
            box((0,.09,2.05),(1.76,.97,.26),"blue",.07)
            badge(0,2.08,.31,[(-.85,.62),(0,.94),(.85,.62),(.71,-.22),(0,-.93),(-.71,-.22)],"gold",-.86)
            paw(0,-.94,2.08,.83)
        if theme == "chicks":
            for i in range(7):
                x=(i-3)*.29
                ball((x,-.01,1.93+.24*(1-abs(i-3)/3)),(.40,.75,.34),"fern" if i%2 else "green")
            for i in range(5):
                x=(i-2)*.23
                link((x-.27,-.82,1.70),(x+.25,-.84,1.90),.042,"wooddark")
                link((x-.25,-.83,1.91),(x+.21,-.84,1.73),.034,"wood")
            for x in (-.22,.02,.24):ball((x,-.78,1.94),(.12,.105,.17),"cream")
        if theme == "spidey":
            box((0,0,1.88),(2.43,1.64,.18),"navy",.07)
            peg((.57,.15,2.14),.32,.44,"red",vertices=12)
            peg((.57,.15,2.45),.39,.20,"plum",r2=.045,vertices=12)
            for x in (-.37,0,.37):
                link((0,-.86,1.69),(x,-.86,2.07),.021,"ice")
            for t in (.51,.81):
                link((-.37*t,-.86,1.69+.38*t),(0,-.86,1.68+.28*t),.016,"ice")
                link((0,-.86,1.68+.28*t),(.37*t,-.86,1.69+.38*t),.016,"ice")
        if theme == "town":
            box((0,0,1.86),(2.53,1.68,.20),"red",.095)
            box((0,0,1.99),(2.25,1.47,.12),"cream",.055)
            box((0,-.02,2.09),(1.06,.49,.15),"navy",.065)
            for x,c in [(-.267,"red"),(.267,"blue")]:
                peg((x,-.02,2.22),.18,.22,c,r2=.15)
                ball((x,-.02,2.32),(.15,.15,.07),c)
            badge(0,1.79,.26,[(-.6,-.7),(-.87,-.02),(-.4,.35),(-.43,.06),(.12,1.1),(.36,.49),(.65,.64),(.83,-.04),(.55,-.67),(0,-.88)],"gold",-.91)
            for x in (-.86,.86):
                ball((x,-.74,1.77),(.077,.043,.069),"yellow")
        if theme == "snow":
            roof(2.62,1.85,"vanilla","teal")
            box((.67,.39,2.28),(.36,.37,.76),"wooddark",.05)
            box((.67,.39,2.66),(.44,.44,.12),"vanilla",.055)
            for x,z in [(-.78,1.98),(0,2.43),(.72,2.0)]:
                ball((x,-.78,z),(.22,.12,.098),"vanilla")
            for a in (0,math.pi/3,-math.pi/3):
                box((0,-.835,2.03),(.087,.075,.43),"vanilla",.037,(0,a,0))
        if theme == "lookout":
            box((0,0,1.84),(2.48,1.65,.19),"navy",.082)
            peg((0,.1,2.05),.52,.31,"cream",r2=.55,vertices=8)
            peg((0,.1,2.31),.62,.25,"yellow",r2=.31,vertices=8)
            peg((0,.1,2.49),.09,.18,"navy")
            for x in (-.31,0,.31):
                box((x,-.403,2.05),(.16,.068,.17),"blue",.033)
            badge(0,1.82,.36,[(-.85,.64),(0,.95),(.85,.64),(.69,-.33),(0,-.93),(-.69,-.33)],"gold",-.86)
            paw(0,-.91,1.81,.89)
        if theme == "yard":
            # A striped fabric canopy and gingham picnic rug distinguish this pavilion.
            roof(2.42,1.83,"cream","woodlight")
            for i in range(7):
                x=(i-3)*.334
                mat = "red" if i%2 == 0 else "cream"
                z=2.42-abs(x)*.48
                tilt=(-1 if x<0 else 1)*.45
                box((x,-.005,z+.095),(.36,1.7,.082),mat,.03,(0,tilt,0))
                ball((x,-.80,1.84),(.169,.08,.14),mat)
            box((0,-.90,.287),(1.82,.68,.052),"red",.023)
            for x in (-.64,-.24,.16,.56):
                box((x,-.90,.317),(.085,.62,.012),"shell",.005)
            for y in (-1.12,-.93,-.73):
                box((0,y,.322),(1.75,.073,.012),"cream",.005)
        if theme == "garden":
            roof(2.52,1.82,"ice","lime")
            for side in (-1,1):
                for y in (-.76,-.035,.70):
                    link((0,y,2.58),(side*1.23,y,1.88),.055,"green")
            box((0,0,2.56),(.115,1.63,.11),"green",.05)
            for side in (-1,1):
                ball((side*.13,-.83,2.01),(.106,.062,.22),"fern",(0,side*.85,0))
            for x in (-.97,.97):
                peg((x,-.86,.54),.11,.25,"apricot",r2=.15)
                for dx,dz,t in [(-.05,.01,-.53),(.036,.12,.4)]:
                    ball((x+dx,-.87,.71+dz),(.065,.06,.13),"fern",(0,t,0))
        if theme == "reef":
            box((0,-.015,1.8),(2.47,1.6,.14),"teal",.066)
            for i in range(-3,4):
                angle=i*.26
                x=.66*math.sin(angle)
                z=1.93+.22*math.cos(angle)
                ball((x,-.04,z),(.20,.43,.49),"shell" if i%2 else "apricot",(0,angle,0))
                box((x,-.47,z-.005),(.043,.04,.55),"cream",.019,(0,angle,0))
            for sx in (-1,1):
                x=sx*.98
                link((x,-.86,.45),(x+sx*.04,-.86,1.07),.058,"pink")
                for dz,sign in [(0,1),(.18,-1)]:
                    a=(x+sx*.025,-.86,.64+dz)
                    b=(x+sx*.14*sign,-.87,.76+dz)
                    c=(b[0],b[1],b[2]+.12)
                    link(a,b,.048,"pink");link(b,c,.046,"pink")
                    ball(c,(.049,.049,.05),"pink")
        if theme == "space":
            box((0,0,1.84),(2.46,1.63,.18),"plum",.08)
            ball((.18,.08,1.94),(.72,.56,.36),"cream")
            peg((.18,.08,1.96),.71,.10,"lavender")
            peg((-.65,-.025,2.16),.115,.39,"cream")
            peg((-.65,-.025,2.43),.12,.23,"red",r2=.012)
            for dx in (-.12,.12):
                ball((-.65+dx,-.025,2.02),(.046,.078,.11),"gold",(0,dx*2.3,0))
            ball((-.65,-.13,2.20),(.044,.021,.045),"blue")
            for x in (-.83,.80):
                ball((x,-.78,1.77),(.066,.043,.07),"ice")
            points=[]
            for i in range(10):
                angle=math.pi/2+i*math.pi/5
                r=1 if i%2==0 else .46
                points.append((r*math.cos(angle),r*math.sin(angle)))
            badge(0,1.82,.208,points,"yellow",-.86)

    def build(theme, is_open):
        main, accent, dark = PALETTES[theme]
        # Hollow, deep bay. Separate back wall, cheeks and floor provide real occlusion.
        box((0,-.045,.145),(2.58,1.95,.24),"woodlight",.11)
        box((0,-.015,.30),(2.32,1.48,.12),"wood",.05)
        box((0,.596,1.02),(2.23,.23,1.47),dark,.075)
        for x in (-.98,.98):
            box((x,.00,1.025),(.35,1.49,1.46),"woodlight",.082)
            box((x,-.733,1.02),(.23,.14,1.42),main,.065)
        box((0,-.005,1.68),(2.28,1.48,.30),main,.085)
        box((0,-.005,1.52),(1.64,1.39,.083),dark,.035)
        box((1.165,.07,1.1),(.08,.78,.64),dark,.04)
        for y in (-.105,.245):
            box((1.216,y,1.11),(.027,.24,.40),"ice",.014)
        # Shutters occupy the same front plane in both poses, with the last slats visible overhead.
        if is_open:
            for i in range(2):
                box((0,-.682,1.50-i*.085),(1.66,.135,.095),accent if i else "woodlight",.034)
            for x in (-.63,.63):
                box((x,-.02,.375),(.065,1.14,.025),accent,.012)
        else:
            for i in range(6):
                material=accent if theme not in ("town","snow","garden") or i%2==0 else "woodlight"
                box((0,-.685,.46+i*.185),(1.65,.13,.191),material,.052)
            box((0,-.785,.61),(.42,.105,.085),dark,.037)
        for x in (-.97,.97):
            ball((x,-.84,.43),(.051,.025,.051),"gold")
        motif(theme)

    for theme in THEMES:
        for state in ("idle","open"):
            build(theme, state=="open")
            scene.render.filepath = str(directory / f"dock-{theme}-{state}.png")
            bpy.ops.render.render(write_still=True)
            for obj in objects:
                bpy.data.objects.remove(obj, do_unlink=True)
            objects.clear()
            bpy.ops.outliner.orphans_purge(do_recursive=True)


if __name__ == "__main__":
    if "--" in sys.argv and sys.argv[sys.argv.index("--")+1] == "tiles":
        render_tiles(Path(sys.argv[-1]))
    else:
        parser = argparse.ArgumentParser(description=__doc__)
        parser.add_argument("--blender", default=os.environ.get("BLENDER_BIN") or shutil.which("blender") or "blender")
        parser.add_argument("--qa")
        parser.add_argument("--output", type=Path, default=Path(__file__).resolve().parents[1]/"web/assets/delivery-docks.webp")
        args = parser.parse_args()
        build_atlas(args.blender, args.qa, args.output)
