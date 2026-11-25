import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export { THREE };
const finishes = {
  enamel: { roughness: 0.31, metalness: 0.08 },
  satin: { roughness: 0.63, metalness: 0.02 },
  chrome: { roughness: 0.24, metalness: 0.59 },
  glass: { roughness: 0.12, metalness: 0.34 },
  rubber: { roughness: 0.83, metalness: 0.01 },
};
const paints = new Map();
const batched = new Map();
const geometries = new Map();
const singleUse = new WeakSet();
export function singleUseGeometry(geometry) { singleUse.add(geometry); return geometry; }
const yAxis = new THREE.Vector3(0, 1, 0);

function cached(key, create) {
  if (!geometries.has(key)) geometries.set(key, create());
  return geometries.get(key);
}

export function paint(color, finish = 'enamel') {
  const key = color + finish;
  if (!paints.has(key)) {
    const mat = new THREE.MeshStandardMaterial({ color, ...finishes[finish] });
    mat.userData.finish = finish;
    paints.set(key, mat);
  }
  return paints.get(key);
}

export function group(parent, x = 0, y = 0, z = 0) {
  const child = new THREE.Group();
  child.position.set(x, y, z);
  parent.add(child);
  return child;
}

export function part(parent, geometry, material, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(geometry, typeof material === 'string' ? paint(material) : material);
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

export function box(parent, mat, w, h, d, x, y, z, radius = 0.04) {
  const r = Math.min(radius, w * 0.48, h * 0.48, d * 0.48);
  const geometry = cached(`box/${w}/${h}/${d}/${r}`, () =>
    r < 0.009 ? new THREE.BoxGeometry(w, h, d) : new RoundedBoxGeometry(w, h, d, 2, r));
  return part(parent, geometry, mat, x, y, z);
}

export function oval(parent, mat, rx, ry, rz, x, y, z) {
  const unit = cached('sphere', () => new THREE.SphereGeometry(1, 24, 16));
  const obj = part(parent, unit, mat, x, y, z);
  obj.scale.set(rx, ry, rz);
  return obj;
}

export function tube(parent, mat, rTop, rBottom, height, x, y, z, sides = 24) {
  const mesh = cached(`tube/${rTop}/${rBottom}/${height}/${sides}`, () =>
    new THREE.CylinderGeometry(rTop, rBottom, height, sides));
  return part(parent, mesh, mat, x, y, z);
}

export function rod(parent, mat, a, b, radius, sides = 10) {
  const va = new THREE.Vector3(...a);
  const vb = new THREE.Vector3(...b);
  const delta = vb.clone().sub(va);
  const mid = va.add(vb).multiplyScalar(0.5);
  const mesh = tube(parent, mat, radius, radius, delta.length(), mid.x, mid.y, mid.z, sides);
  mesh.quaternion.setFromUnitVectors(yAxis, delta.normalize());
  return mesh;
}

export function torus(parent, mat, radius, wire, x, y, z) {
  const geometry = cached(`ring/${radius}/${wire}`, () => new THREE.TorusGeometry(radius, wire, 8, 28));
  return part(parent, geometry, mat, x, y, z);
}

// Extrude a side profile in the XY plane, centered on z.
export function profile(parent, mat, points, depth, x = 0, y = 0, z = 0, radius = 0.025) {
  const shape = new THREE.Shape(points.map(([sx, sy]) => new THREE.Vector2(sx, sy)));
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.002, depth - 2 * radius), steps: 1, bevelEnabled: radius > 0,
    bevelSize: radius, bevelThickness: radius, bevelSegments: 3, curveSegments: 10,
  });
  geometry.translate(0, 0, -Math.max(0.002, depth - 2 * radius) / 2);
  return part(parent, singleUseGeometry(geometry), mat, x, y, z);
}

export function canvasTexture(width, height, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext('2d'), width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

// Merge static parts by finish; separately baked joints can still move.
export function bake(root, {castShadow = true, receiveShadow = true} = {}) {
  root.updateWorldMatrix(true, true);
  const inverse = root.matrixWorld.clone().invert();
  const buckets = new Map();
  const consumed = new Set();
  root.traverse((mesh) => {
    if (!mesh.isMesh) return;
    const surface = mesh.material;
    const finish = surface.userData.finish;
    if (finish && !batched.has(finish)) {
      const batch=surface.clone();
      batch.color.set(0xffffff);
      batch.vertexColors=true;
      delete batch.userData.finish;
      batched.set(finish,batch);
    }
    const material = finish ? batched.get(finish) : surface;
    const buffer = mesh.geometry.clone();
    if(singleUse.has(mesh.geometry))consumed.add(mesh.geometry);
    // Keep the shared vertices of curved toys when different parts are merged.
    if (!buffer.index) {
      const count = buffer.attributes.position.count;
      const indices = count > 65535 ? new Uint32Array(count) : new Uint16Array(count);
      for (let i = 0; i < count; i++) indices[i] = i;
      buffer.setIndex(new THREE.BufferAttribute(indices, 1));
    }
    buffer.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse, mesh.matrixWorld));
    buffer.clearGroups();
    if (finish) {
      const colors = new Float32Array(buffer.attributes.position.count * 3);
      const tint=buffer.getAttribute('color');
      for (let i=0;i<colors.length/3;i++) {
        colors[i*3]=surface.color.r*(tint?tint.getX(i):1);
        colors[i*3+1]=surface.color.g*(tint?tint.getY(i):1);
        colors[i*3+2]=surface.color.b*(tint?tint.getZ(i):1);
      }
      buffer.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }
    if (!buckets.has(material)) buckets.set(material, []);
    buckets.get(material).push(buffer);
  });
  root.clear();
  for(const geometry of consumed)geometry.dispose();
  for (const [material, pieces] of buckets) {
    const mesh = part(root, mergeGeometries(pieces, false), material, 0, 0, 0);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = receiveShadow;
    for (const piece of pieces) piece.dispose();
  }
  return root;
}
