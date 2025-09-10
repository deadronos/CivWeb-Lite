"""generate_grassland_tiles.py

Create three variations of a grassland hex tile inside Blender.

Usage:
  - From Blender's Text Editor: open this file and Run Script.
  - From the command line (headless):
      blender --background --python generate_grassland_tiles.py

Notes:
  - The script uses mathutils.noise for small vertex displacements (so no external libs).
  - It expects a Blender environment (bpy). If bpy is not available the script will print
    an instruction message and exit.

Design choices:
  - Uses hex radius 0.5 and thin hex thickness 0.08 to match the project's DEFAULT_HEX_SIZE
    and tile thickness used in the web renderer.
  - Generates 3 variations by varying counts and density of tufts, rocks and sparse trees.
  - All generated objects are parented into a collection named 'GrasslandTiles'.
"""

import random
import sys
import os
from math import pi, sin, cos

try:
    import bpy
    import bmesh
    from mathutils import Vector, noise
except Exception:  # pragma: no cover - happens outside Blender
    print("This script must be run inside Blender (bpy available).\n"
          "Run it from Blender's Text Editor or: blender --background --python generate_grassland_tiles.py")
    raise SystemExit(1)


# Blender add-on metadata (allows installation via Preferences > Add-ons > Install)
bl_info = {
    'name': 'CivWeb-Lite: Grassland Tile Generator',
    'author': 'Project CivWeb-Lite',
    'version': (0, 1, 0),
    'blender': (3, 0, 0),
    'location': '3D Viewport > Sidebar (N) > Create',
    'description': 'Generate grassland hex tile variations and optionally export',
    'category': 'Add Mesh',
}

# Script directory (for resolving export paths relative to this file)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

def _resolve_export_path(path: str | None) -> str | None:
    if not path:
        return path
    if os.path.isabs(path):
        return path
    return os.path.join(SCRIPT_DIR, path)

# --- Parameters (aligned to repo defaults) ----------------------------------
HEX_RADIUS = 0.5
HEX_THICKNESS = 0.08
SEED = 42


def clear_collection(name: str):
    """Remove an existing collection with the given name (if present)."""
    col = bpy.data.collections.get(name)
    if not col:
        return col
    # unlink objects and remove
    for obj in list(col.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    bpy.data.collections.remove(col)
    return None


def create_base_hex(name: str, radius=HEX_RADIUS, thickness=HEX_THICKNESS):
    """Create a flat-top hexagonal prism (cylinder with 6 vertices) centered at origin."""
    bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=radius, depth=thickness, enter_editmode=False)
    obj = bpy.context.active_object
    obj.name = name
    # Ensure the top is up (default cylinder is aligned on Z)
    return obj


def displace_top_surface(obj, amplitude=0.06, scale=1.5, seed=0):
    """Apply vertex displacement to the top surface using mathutils.noise.

    Only displaces vertices with local Z >= 0 (top hemisphere of the prism).
    """
    me = obj.data
    bm = bmesh.new()
    bm.from_mesh(me)
    for v in bm.verts:
        # Local coordinate
        co = v.co
        if co.z >= 0:
            # noise expects Vector
            n = noise.noise(Vector((co.x * scale + seed, co.y * scale + seed, seed)))
            # push along Z and slightly along vertex normal
            disp = n * amplitude
            # approximate normal by direction from center for lateral component
            lateral = Vector((co.x, co.y, 0)).normalized() if (co.x != 0 or co.y != 0) else Vector((0, 0, 0))
            v.co += Vector((lateral.x, lateral.y, 0)) * (disp * 0.15) + Vector((0, 0, disp))
    bm.to_mesh(me)
    bm.free()
    me.update()


def shade_smooth(obj):
    for p in obj.data.polygons:
        p.use_smooth = True


def get_or_create_material(name: str, base_color=(0.5, 0.5, 0.5, 1.0), metallic=0.0, roughness=0.6):
    """Return a principled material with given base color. Reuse if already exists."""
    mat = bpy.data.materials.get(name)
    if mat is None:
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
        bsdf = mat.node_tree.nodes.get('Principled BSDF')
        if bsdf:
            bsdf.inputs['Base Color'].default_value = base_color
            bsdf.inputs['Metallic'].default_value = metallic
            bsdf.inputs['Roughness'].default_value = roughness
        # ensure viewport (solid mode) display color matches the Base Color too
        try:
            mat.diffuse_color = base_color
        except Exception:
            pass
    else:
        # material exists - update its principled BSDF and viewport color to the desired values
        try:
            if not mat.use_nodes:
                mat.use_nodes = True
            bsdf = mat.node_tree.nodes.get('Principled BSDF')
            if bsdf:
                bsdf.inputs['Base Color'].default_value = base_color
                bsdf.inputs['Metallic'].default_value = metallic
                bsdf.inputs['Roughness'].default_value = roughness
        except Exception:
            # non-critical if node setup differs
            pass
        try:
            mat.diffuse_color = base_color
        except Exception:
            pass
    return mat


def assign_material_to_object(obj, mat, base_color=(1.0, 1.0, 1.0, 1.0)):
    """Assign material to object and set viewport display color for better visibility in Solid mode.

    This helper ensures the material is present in the object's material slots and sets
    the object color (used by some viewport shading modes) so the user sees color even
    in Solid mode when Material Preview is not available.
    """
    if not obj or not mat:
        return
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)
    try:
        # set object viewport color (RGBA)
        obj.color = base_color
    except Exception:
        pass


def get_grass_material_for_tile(index: int, base_color=(0.22, 0.55, 0.18, 1.0)):
    """Create or return a per-tile grass material with tiny random variation to reduce repetition."""
    name = f"Grass_Mat_v{index}"
    mat = bpy.data.materials.get(name)
    if mat is None:
        # jitter color and roughness slightly
        jitter = (random.uniform(-0.03, 0.03), random.uniform(-0.03, 0.03), random.uniform(-0.03, 0.03), 0)
        color = tuple(max(0.0, min(1.0, base_color[i] + jitter[i])) for i in range(4))
        rough = max(0.2, min(1.0, 0.85 + random.uniform(-0.12, 0.12)))
        mat = get_or_create_material(name, base_color=color, metallic=0.0, roughness=rough)
    return mat


def add_simple_rock(location, scale=0.07, seed=0, name_prefix="rock"):
    """Create a low-poly rock by starting from an icosphere and displacing vertices with noise."""
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=scale, enter_editmode=False, location=location)
    rock = bpy.context.active_object
    rock.name = f"{name_prefix}_{rock.name}"
    # Displace vertices procedurally
    me = rock.data
    bm = bmesh.new()
    bm.from_mesh(me)
    for v in bm.verts:
        n = noise.noise(Vector((v.co.x * 3 + seed, v.co.y * 3 + seed, v.co.z * 3 + seed)))
        v.co += v.co.normalized() * (n * scale * 0.35)
    bm.to_mesh(me)
    bm.free()
    me.update()
    shade_smooth(rock)
    # Assign rock material
    rock_mat = get_or_create_material('Rock_Mat', base_color=(0.45, 0.45, 0.48, 1.0), metallic=0.0, roughness=0.8)
    assign_material_to_object(rock, rock_mat, base_color=(0.45, 0.45, 0.48, 1.0))
    return rock


def add_tuft(location, scale=0.06, name_prefix="tuft"):
    """Create a simple grass tuft as a slightly bent plane (two faces) scaled up in Z axis."""
    # Make a plane, rotate so it stands upright
    bpy.ops.mesh.primitive_plane_add(size=1, enter_editmode=False, location=location)
    tuft = bpy.context.active_object
    tuft.scale = (scale * 0.25, scale * 0.02, scale)
    tuft.rotation_euler[0] = pi / 2  # make it vertical
    tuft.name = f"{name_prefix}_{tuft.name}"
    # Bend the tuft a little by moving its top vertices
    me = tuft.data
    bm = bmesh.new()
    bm.from_mesh(me)
    for v in bm.verts:
        # move top vertices (positive Y in local plane) forward
        if v.co.y > 0:
            v.co.x += (random.uniform(-0.02, 0.02) + 0.02) * scale
            v.co.z += random.uniform(0.01, 0.03) * scale
    bm.to_mesh(me)
    bm.free()
    me.update()
    shade_smooth(tuft)
    # Assign tuft material (a bright grass green)
    tuft_mat = get_or_create_material('Tuft_Mat', base_color=(0.16, 0.6, 0.12, 1.0), metallic=0.0, roughness=0.9)
    assign_material_to_object(tuft, tuft_mat, base_color=(0.16, 0.6, 0.12, 1.0))
    return tuft


def add_tree(location, trunk_height=0.18, crown_radius=0.16, seed=0, name_prefix="tree"):
    """Create a simple low-poly tree (cylinder trunk + icosphere crown)."""
    # trunk
    bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=trunk_height * 0.12, depth=trunk_height, location=(location[0], location[1], location[2] + trunk_height / 2))
    trunk = bpy.context.active_object
    trunk.name = f"{name_prefix}_trunk_{trunk.name}"
    # crown
    crown_loc = (location[0], location[1], location[2] + trunk_height + crown_radius * 0.6)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=crown_radius, location=crown_loc)
    crown = bpy.context.active_object
    crown.name = f"{name_prefix}_crown_{crown.name}"
    # roughen crown
    me = crown.data
    bm = bmesh.new()
    bm.from_mesh(me)
    for v in bm.verts:
        n = noise.noise(Vector((v.co.x * 2 + seed, v.co.y * 2 + seed, v.co.z * 2 + seed)))
        v.co += v.co.normalized() * (n * crown_radius * 0.12)
    bm.to_mesh(me)
    bm.free()
    me.update()
    shade_smooth(trunk)
    shade_smooth(crown)
    # Assign trunk and crown materials
    trunk_mat = get_or_create_material('Trunk_Mat', base_color=(0.35, 0.2, 0.08, 1.0), metallic=0.0, roughness=0.9)
    leaf_mat = get_or_create_material('Leaf_Mat', base_color=(0.12, 0.5, 0.14, 1.0), metallic=0.0, roughness=0.8)
    assign_material_to_object(trunk, trunk_mat, base_color=(0.35, 0.2, 0.08, 1.0))
    assign_material_to_object(crown, leaf_mat, base_color=(0.12, 0.5, 0.14, 1.0))
    return trunk, crown


def random_point_on_hex(radius=HEX_RADIUS, margin=0.0):
    """Return a random (x, y) point inside a flat-top hexagon by rejection sampling within circle then test distance to hex edges.

    This is cheap and acceptable for small counts.
    """
    attempts = 0
    while True:
        attempts += 1
        # sample within circle first
        r = random.random() ** 0.5 * (radius - margin)
        theta = random.random() * 2 * pi
        x = r * cos(theta)
        y = r * sin(theta)
        # convert to axial basis for flat-top hex check
        # Use the property that in flat-top hex, max(|x'|, |y'|, |z'|) <= radius where x',y',z' are cube coords scaled
        # Quick approximate check: project to hex axial coordinates
        q = (2.0 / 3.0) * x / radius
        r_ax = (-1.0 / 3.0) * x / radius + (1.0 / 3.0) * (2 ** 0.5) * y / radius
        if abs(q) <= 1.0 and abs(r_ax) <= 1.0:
            return x, y
        if attempts > 50:
            # give up and return a near-center point
            return x * 0.5, y * 0.5


def build_variation(index: int, col, seed_offset=0, params=None):
    """Build a single tile variation and add it to the given collection.

    Returns the main tile object.
    """
    if params is None:
        params = {}
    random.seed(SEED + seed_offset + index)

    name = f"grassland_tile_{index}"
    obj = create_base_hex(name, radius=HEX_RADIUS, thickness=HEX_THICKNESS)
    # Assign grass material to base tile (use helper to set viewport color)
    grass_mat = get_or_create_material('Grass_Mat', base_color=(0.22, 0.55, 0.18, 1.0), metallic=0.0, roughness=0.9)
    assign_material_to_object(obj, grass_mat, base_color=(0.22, 0.55, 0.18, 1.0))
    obj.location.x = index * (HEX_RADIUS * 2.6)
    # Slight rotation so variations don't look identical
    obj.rotation_euler[2] = random.uniform(0, pi * 2)

    # displace top
    displace_top_surface(obj, amplitude=params.get('height_amp', 0.06), scale=params.get('noise_scale', 1.5), seed=SEED + index + seed_offset)
    shade_smooth(obj)

    # create an empty collection per tile for organization
    tile_col = bpy.data.collections.new(f"tile_{index}_col")
    col.children.link(tile_col)
    tile_col.objects.link(obj)

    # Scatter rocks
    rock_count = params.get('rocks', 3)
    for i in range(rock_count):
        rx, ry = random_point_on_hex(radius=HEX_RADIUS * 0.7, margin=0.02)
        rz = HEX_THICKNESS / 2 + 0.01
        rock_scale = random.uniform(0.045, 0.12) * params.get('rock_scale_mult', 1.0)
        rock = add_simple_rock((obj.location.x + rx, ry, rz), scale=rock_scale, seed=SEED + i + index)
        tile_col.objects.link(rock)

    # Scatter tufts
    tuft_count = params.get('tufts', 18)
    tuft_master = None
    for i in range(tuft_count):
        tx, ty = random_point_on_hex(radius=HEX_RADIUS * 0.92, margin=0.02)
        tz = HEX_THICKNESS / 2 + 0.002
        tuft = add_tuft((obj.location.x + tx, ty, tz), scale=random.uniform(0.04, 0.09))
        tile_col.objects.link(tuft)

    # Add a sparse tree optionally
    tree_prob = params.get('tree_prob', 0.35)
    if random.random() < tree_prob:
        tx, ty = random_point_on_hex(radius=HEX_RADIUS * 0.6, margin=0.05)
        trunk, crown = add_tree((obj.location.x + tx, ty, HEX_THICKNESS / 2), trunk_height=params.get('trunk_height', 0.16), crown_radius=params.get('crown_radius', 0.14))
        tile_col.objects.link(trunk)
        tile_col.objects.link(crown)

    return obj


def main():
    # This main is a thin wrapper kept for backwards compatibility.
    main_with_options(seed=SEED, build_count=3, export_path=None, export_format='GLB')


def export_collection(collection, filepath: str, fmt: str = 'GLB', isolated: bool = True):
    """Export objects in the collection to filepath. fmt is 'GLB' or 'OBJ'.

    When isolated=True, creates a temporary scene with ONLY the collection's
    objects linked (duplicates) so the GLB contains no sibling collections.
    """
    def collect_objects(col):
        objs = list(col.objects)
        for ch in col.children_recursive:
            objs += list(ch.objects)
        return objs

    fmtU = fmt.upper()

    if isolated:
        # Build a temporary scene with only this collection's objects
        src_objs = collect_objects(collection)
        tmp_scene = bpy.data.scenes.new('TMP_EXPORT_SCENE')
        try:
            # Duplicate and link copies to the temp scene
            dupes = []
            for o in src_objs:
                dup = o.copy()
                if o.data:
                    dup.data = o.data.copy()
                tmp_scene.collection.objects.link(dup)
                dupes.append(dup)

            # Make temp scene active
            old_scene = bpy.context.window.scene if bpy.context.window else bpy.context.scene
            if bpy.context.window:
                bpy.context.window.scene = tmp_scene

            # Export entire temp scene (no selection filtering needed)
            if fmtU in ('GLB', 'GLTF'):
                bpy.ops.export_scene.gltf(filepath=filepath, use_selection=False, export_apply=True)
            elif fmtU == 'OBJ':
                bpy.ops.export_scene.obj(filepath=filepath, use_selection=False)
            else:
                raise ValueError('Unsupported export format: ' + str(fmt))

            # Restore scene
            if bpy.context.window:
                bpy.context.window.scene = old_scene
        finally:
            # Clean up temp scene and duplicated data
            try:
                bpy.data.scenes.remove(tmp_scene)
            except Exception:
                pass
    else:
        # Selection-based export in the current scene
        bpy.ops.object.select_all(action='DESELECT')
        for obj in collect_objects(collection):
            obj.select_set(True)
        if fmtU in ('GLB', 'GLTF'):
            bpy.ops.export_scene.gltf(filepath=filepath, use_selection=True, export_apply=True)
        elif fmtU == 'OBJ':
            bpy.ops.export_scene.obj(filepath=filepath, use_selection=True)
        else:
            raise ValueError('Unsupported export format: ' + str(fmt))


def parse_args(argv=None):
    """Parse arguments passed after -- in Blender invocation. Returns dict of options."""
    if argv is None:
        argv = sys.argv
    # Blender puts args before and after a '--' marker; we want the after part
    if '--' in argv:
        args = argv[argv.index('--') + 1:]
    else:
        args = []
    out = {'seed': SEED, 'build_count': 3, 'export_path': None, 'export_format': 'GLB'}
    i = 0
    while i < len(args):
        a = args[i]
        if a in ('--seed', '-s') and i + 1 < len(args):
            out['seed'] = int(args[i + 1]); i += 2; continue
        if a in ('--count', '-c') and i + 1 < len(args):
            out['build_count'] = int(args[i + 1]); i += 2; continue
        if a in ('--export', '-e') and i + 1 < len(args):
            out['export_path'] = args[i + 1]; i += 2; continue
        if a in ('--format', '-f') and i + 1 < len(args):
            out['export_format'] = args[i + 1]; i += 2; continue
        i += 1
    return out


def main_with_options(seed=42, build_count=3, export_path=None, export_format='GLB', enable_ao=False, enable_lights=True, export_per_variant=True):
    """Main generation entry with options. build_count <= 3 (we have 3 predefined variations).

    New params:
    - enable_ao: toggle Eevee AO when running interactively
    - enable_lights: add the simple area light setup
    - export_per_variant: when export_path is a directory, export each variant separately
    """
    random.seed(seed)
    col_name = 'GrasslandTiles'
    clear_collection(col_name)
    top_col = bpy.data.collections.new(col_name)
    bpy.context.scene.collection.children.link(top_col)

    variations = [
        {'tufts': 22, 'rocks': 2, 'tree_prob': 0.45, 'height_amp': 0.06},
        {'tufts': 12, 'rocks': 5, 'rock_scale_mult': 1.6, 'tree_prob': 0.25, 'height_amp': 0.05},
        {'tufts': 14, 'rocks': 3, 'tree_prob': 0.6, 'trunk_height': 0.2, 'crown_radius': 0.18, 'height_amp': 0.07},
    ]

    # clamp build_count
    build_count = max(1, min(build_count, len(variations)))
    for i in range(build_count):
        params = variations[i]
        # per-tile material variation: apply distinct grass material
        tile_obj = build_variation(i, top_col, seed_offset=100, params=params)
        # replace first material (grass) with a per-tile variant
        if tile_obj and tile_obj.data:
            mat = get_grass_material_for_tile(i)
            if tile_obj.data.materials:
                tile_obj.data.materials[0] = mat
            else:
                tile_obj.data.materials.append(mat)

    # camera layout (best-effort)
    try:
        cam = bpy.data.objects.get('Camera') or next((o for o in bpy.data.objects if o.type == 'CAMERA'), None)
        if cam:
            cam.location = Vector((HEX_RADIUS * 2.6, -1.2, 1.0))
            cam.rotation_euler = (pi / 3.5, 0, pi / 8)
    except Exception:
        pass

    print(f'Generated {build_count} grassland tile variations in collection: {col_name}')

    # Apply lighting / viewport preferences when running inside Blender UI
    try:
        if enable_lights:
            setup_simple_lighting()
        enable_eevee_ao(enable_ao)
        # if we're in interactive Blender, switch 3D views to Material Preview so Base Color shows
        try:
            for area in bpy.context.screen.areas:
                if area.type == 'VIEW_3D':
                    for space in area.spaces:
                        if space.type == 'VIEW_3D':
                            # set to 'MATERIAL' preview (shows node-based materials)
                            space.shading.type = 'MATERIAL'
        except Exception:
            pass
    except Exception:
        # be resilient in headless runs where context.screen may not exist
        pass

    # Handle export if requested (for operator/interactive runs)
    export_path = _resolve_export_path(export_path)
    if export_path:
        try:
            top_col = bpy.data.collections.get(col_name)
            if not top_col:
                print('No collection found for export:', col_name)
                return
            # If path looks like a directory or export_per_variant is requested, export each child
            export_dir_mode = (
                export_per_variant or
                export_path.endswith(os.sep) or export_path.endswith('/') or os.path.isdir(export_path)
            )
            out_dir = export_path
            if export_dir_mode:
                if not os.path.isdir(out_dir):
                    # If a filename was given but export_per_variant is True, use its directory or script dir
                    out_dir = os.path.dirname(export_path) or SCRIPT_DIR
                os.makedirs(out_dir, exist_ok=True)
                for i, child in enumerate(top_col.children):
                    fname = f'grassland_v{i}.glb' if export_format.upper() in ('GLB', 'GLTF') else f'grassland_v{i}.obj'
                    outp = os.path.join(out_dir, fname)
                    export_collection(child, outp, fmt=export_format, isolated=True)
                    print('Exported variant', i, '->', outp)
            else:
                export_collection(top_col, export_path, fmt=export_format, isolated=True)
                print('Exported collection ->', export_path)
        except Exception as ex:
            print('Export failed:', ex)


def setup_simple_lighting():
    """Add a simple 3-point-ish light setup (area lights) for thumbnails; idempotent."""
    # Remove existing helper lights created by this script
    for o in [o for o in bpy.data.objects if o.name.startswith('GW_Light_')]:
        bpy.data.objects.remove(o, do_unlink=True)
    # Key
    bpy.ops.object.light_add(type='AREA', location=(1.5, -2.0, 2.0))
    key = bpy.context.active_object
    key.name = 'GW_Light_Key'
    key.data.energy = 600
    key.data.size = 0.8
    # Fill
    bpy.ops.object.light_add(type='AREA', location=(-1.2, -1.2, 1.0))
    fill = bpy.context.active_object
    fill.name = 'GW_Light_Fill'
    fill.data.energy = 180
    fill.data.size = 1.0
    # Rim
    bpy.ops.object.light_add(type='AREA', location=(0.0, 2.0, 1.6))
    rim = bpy.context.active_object
    rim.name = 'GW_Light_Rim'
    rim.data.energy = 120
    rim.data.size = 1.5


def enable_eevee_ao(enable=True):
    """Enable screen-space ambient occlusion in Eevee for nicer thumbnails."""
    try:
        if bpy.context.scene.render.engine == 'BLENDER_EEVEE':
            bpy.context.scene.eevee.use_gtao = enable
    except Exception:
        pass


def run_headless_from_args():
    opts = parse_args()
    seed = opts.get('seed', SEED)
    count = opts.get('build_count', 3)
    export_path = _resolve_export_path(opts.get('export_path'))
    export_format = opts.get('export_format', 'GLB')

    # If export_path is a directory, we'll export per-variant files into it
    export_dir_mode = False
    if export_path and (export_path.endswith(os.sep) or export_path.endswith('/') or os.path.isdir(export_path)):
        export_dir_mode = True
        out_dir = export_path if os.path.isdir(export_path) else (os.path.dirname(export_path) or SCRIPT_DIR)
        if not os.path.exists(out_dir):
            os.makedirs(out_dir, exist_ok=True)

    main_with_options(seed=seed, build_count=count, export_path=None, export_format=export_format)

    top_col = bpy.data.collections.get('GrasslandTiles')
    if not top_col:
        print('No GrasslandTiles collection found after generation.')
        return

    if export_path:
        if export_dir_mode:
            # export each variant as separate file
            for i, child in enumerate(top_col.children):
                fname = f'grassland_v{i}.glb' if export_format.upper() in ('GLB','GLTF') else f'grassland_v{i}.obj'
                outp = os.path.join(out_dir, fname)
                export_collection(child, outp, fmt=export_format)
                print('Exported variant', i, '->', outp)
        else:
            export_collection(top_col, export_path, fmt=export_format)
            print('Exported collection ->', export_path)


### Blender Operator + Panel (for in-Blender UI) ---------------------------
class GW_OT_generate_grassland(bpy.types.Operator):
    bl_idname = 'gw.generate_grassland'
    bl_label = 'Generate Grassland Tiles'
    bl_options = {'REGISTER', 'UNDO'}

    seed: bpy.props.IntProperty(name='Seed', default=SEED)
    build_count: bpy.props.IntProperty(name='Variants', default=3, min=1, max=3)
    export: bpy.props.BoolProperty(name='Export After', default=False)
    export_format: bpy.props.EnumProperty(name='Format', items=[('GLB','GLB',''),('OBJ','OBJ','')], default='GLB')
    export_path: bpy.props.StringProperty(name='Export Path', default='')
    export_dir_per_variant: bpy.props.BoolProperty(name='Export per-variant', default=True)
    enable_ao: bpy.props.BoolProperty(name='Enable AO', default=False)
    enable_lights: bpy.props.BoolProperty(name='Add light setup', default=True)

    def execute(self, context):
        main_with_options(seed=self.seed, build_count=self.build_count, export_path=self.export_path if self.export else None, export_format=self.export_format, export_per_variant=self.export_dir_per_variant, enable_ao=self.enable_ao, enable_lights=self.enable_lights)
        return {'FINISHED'}


class GW_PT_grassland_panel(bpy.types.Panel):
    bl_label = 'Grassland Tile Generator'
    bl_idname = 'GW_PT_grassland'
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = 'Create'

    def draw(self, context):
        layout = self.layout
        scene = context.scene
        props = scene.gw_props
        layout.label(text='Generate grassland hex tiles')
        layout.prop(props, 'seed')
        layout.prop(props, 'build_count')
        layout.prop(props, 'enable_ao')
        layout.prop(props, 'enable_lights')
        layout.separator()
        layout.label(text='Export')
        layout.prop(props, 'export')
        layout.prop(props, 'export_format')
        layout.prop(props, 'export_path')
        layout.prop(props, 'export_dir_per_variant')
        layout.operator(GW_OT_generate_grassland.bl_idname)


class GWProps(bpy.types.PropertyGroup):
    seed: bpy.props.IntProperty(name='Seed', default=SEED)
    build_count: bpy.props.IntProperty(name='Variants', default=3, min=1, max=3)
    export: bpy.props.BoolProperty(name='Export After', default=False)
    export_format: bpy.props.EnumProperty(name='Format', items=[('GLB','GLB',''),('OBJ','OBJ','')], default='GLB')
    export_path: bpy.props.StringProperty(name='Export Path', default='')
    export_dir_per_variant: bpy.props.BoolProperty(name='Export per-variant', default=True)
    enable_ao: bpy.props.BoolProperty(name='Enable AO', default=False)
    enable_lights: bpy.props.BoolProperty(name='Add light setup', default=True)


def register():
    bpy.utils.register_class(GW_OT_generate_grassland)
    bpy.utils.register_class(GW_PT_grassland_panel)
    bpy.utils.register_class(GWProps)
    bpy.types.Scene.gw_props = bpy.props.PointerProperty(type=GWProps)


def unregister():
    del bpy.types.Scene.gw_props
    bpy.utils.unregister_class(GWProps)
    bpy.utils.unregister_class(GW_PT_grassland_panel)
    bpy.utils.unregister_class(GW_OT_generate_grassland)



if __name__ == '__main__':
    # If running headless (from CLI), parse args and export
    if bpy.app.background:
        run_headless_from_args()
    else:
        # Running from Blender UI/Text Editor: register UI so the panel appears
        try:
            register()
            print('Grassland Tile Generator registered. Open 3D View > N-panel > Create.')
        except Exception as ex:
            print('Registration failed:', ex)
