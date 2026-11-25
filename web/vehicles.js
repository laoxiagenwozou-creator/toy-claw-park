import { THREE, bake, box, canvasTexture, group, oval, paint, part, profile, rod, torus, tube } from './parts.js';
import {sweep} from './sculpt.js';

const milk = paint('#fff8df');
const ivory = paint('#fffdf0');
const rubber = paint('#2c3551', 'rubber');
const tyreEdge = paint('#46516d', 'rubber');
const steel = paint('#aac3ce', 'chrome');
const glass = paint('#458da9', 'glass');
const glassLight = paint('#c5edeb', 'glass');
const gold = paint('#ffbf36');
const chassis = paint('#3d536c', 'satin');
let windowGlass;

function panel(root, mat, corners) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(corners.flat(), 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute([0,0,1,0,1,1,0,1], 2));
  geo.setIndex([0,1,2,0,2,3]);
  geo.computeVertexNormals();
  return part(root,geo,mat,0,0,0);
}

function windowPane(root, corners) {
  if (!windowGlass) {
    const map = canvasTexture(192,96,(ctx,w,h)=>{
      const sky = ctx.createLinearGradient(0,0,0,h);
      sky.addColorStop(0,'#b2eafa'); sky.addColorStop(0.37,'#66b6cf'); sky.addColorStop(1,'#44839e');
      ctx.fillStyle=sky; ctx.fillRect(0,0,w,h);
      for (const [x,strip] of [[32,18],[61,6]]) {
        ctx.fillStyle='#ebfdff6b'; ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x+strip,0);
        ctx.lineTo(x+strip-42,h); ctx.lineTo(x-42,h); ctx.closePath(); ctx.fill();
      }
    });
    windowGlass=new THREE.MeshStandardMaterial({map,roughness:0.23,metalness:0.12,side:THREE.DoubleSide});
  }
  panel(root,windowGlass,corners);
}

function wheel(root, x, z, radius, cap = ivory, y = radius) {
  const sign = Math.sign(z) || 1;
  const width = Math.max(0.095, radius * 0.79);
  root=group(root,x,y,z);root.name='wheel';x=0;y=0;z=0;
  const axle = (mat, r, depth, offset) => {
    const mesh = tube(root, mat, r, r, depth, x, y, z + sign * offset);
    mesh.rotation.x = Math.PI / 2;
    return mesh;
  };
  axle(rubber, radius * 0.94, width, 0);
  torus(root, rubber, radius * 0.81, radius * 0.19, x, y, z + sign * width * 0.29);
  axle(tyreEdge, radius * 0.72, 0.021, width * 0.51);
  axle(cap, radius * 0.55, 0.024, width * 0.54 + 0.012);
  axle(steel, radius * 0.23, 0.032, width * 0.55 + 0.023);
  box(root,steel,radius*.65,radius*.09,.014,0,0,sign*(width*.55+.038),.005);
}

function wheels(root, xs, z, radius, cap) {
  for (const x of xs) for (const side of [-1, 1]) wheel(root, x, side * z, radius, cap);
}

const decals = new Map();
function label(root, text, bg, fg, width, height, x, y, z, side = 1) {
  const key = [text, bg, fg].join('/');
  if (!decals.has(key)) {
    const texture = canvasTexture(192, 96, (ctx) => {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 192, 96);
      ctx.fillStyle = fg;
      ctx.font = '900 68px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 96, 52, 173);
    });
    decals.set(key, new THREE.MeshStandardMaterial({ map: texture, roughness: 0.46 }));
  }
  const panel = part(root, new THREE.PlaneGeometry(width, height), decals.get(key), x, y, z);
  panel.rotation.y = side < 0 ? Math.PI : 0;
}

function truckCab(root, x, body, { width = 0.69, tall = 0.98, visor = ivory } = {}) {
  const cab = group(root, x, 0, 0);
  box(cab, body, 0.72, 0.36, width, 0, 0.50, 0, 0.085);
  const glassShape = [[-0.32, 0.63], [0.335, 0.63], [0.237, tall - 0.035], [-0.29, tall - 0.02]];
  profile(cab, glass, glassShape, width - 0.048, 0, 0, 0, 0.032);
  box(cab, visor, 0.66, 0.082, width + 0.027, -0.02, tall + 0.006, 0, 0.041);
  const zw=width*0.405;
  windowPane(cab,[[0.363,0.674,zw],[0.363,0.674,-zw],[0.278,tall-0.069,-zw],[0.278,tall-0.069,zw]]);
  for (const s of [-1, 1]) {
    const z = s * (width / 2 - 0.011);
    windowPane(cab,[[-0.267,0.676,z],[-0.158,0.676,z],[-0.158,tall-0.065,z],[-0.263,tall-0.065,z]]);
    windowPane(cab,[[-0.086,0.676,z],[0.278,0.676,z],[0.205,tall-0.065,z],[-0.086,tall-0.065,z]]);
    rod(cab, body, [0.344, 0.636, z], [0.243, tall - 0.002, z], 0.025);
    rod(cab, body, [-0.313, 0.633, z], [-0.293, tall, z], 0.032);
    box(cab, body, 0.035, tall - 0.64, 0.024, -0.12, (tall + 0.64) / 2, z, 0.009);
    box(cab, steel, 0.092, 0.024, 0.022, -0.19, 0.577, s * (width / 2), 0.01);
    box(cab, milk, 0.064, 0.083, 0.115, 0.353, 0.48, s * width * 0.335, 0.026);
  }
  box(cab, steel, 0.082, 0.083, width * 0.95, 0.35, 0.362, 0);
  box(cab, chassis, 0.032, 0.071, width * 0.42, 0.367, 0.49, 0, 0.012);
}

function fireEngine(root) {
  const red = paint('#f54c45');
  const cherry = paint('#be303c');
  box(root, chassis, 2.04, 0.18, 0.65, 0, 0.29, 0);
  box(root, red, 1.29, 0.55, 0.82, -0.338, 0.576, 0, 0.085);
  box(root, milk, 1.24, 0.076, 0.81, -0.34, 0.88, 0);
  truckCab(root, 0.664, red, { width: 0.85, tall: 1.08 });
  wheels(root, [-0.692, 0.673], 0.409, 0.229, milk);
  for (const s of [-1, 1]) {
    const z = s * 0.422;
    box(root, milk, 1.85, 0.066, 0.024, 0, 0.51, z);
    box(root, steel, 0.36, 0.27, 0.027, -.18, .684, z);
    for(let k=0;k<3;k++)box(root,ivory,.30,.014,.011,-.18,.603+k*.068,z+s*.019,0);
    const reel=group(root,-.656,.694,z);reel.rotation.y=s>0?0:Math.PI;
    tube(reel,cherry,.158,.158,.038,0,0,.012,24).rotation.x=Math.PI/2;
    const coil=[];
    for(let j=0;j<=42;j++){
      const t=j/42,r=.031+t*.103,a=t*Math.PI*4.2;
      coil.push(new THREE.Vector3(r*Math.cos(a),r*Math.sin(a),.041));
    }
    part(reel,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coil),54,.019,7,false),milk,0,0,0);
    tube(reel,steel,.029,.029,.016,0,0,.058,12).rotation.x=Math.PI/2;
    const end=coil.at(-1).toArray();
    sweep(reel,milk,[end,[.146,.019,.042],[.16,-.044,.040],[.201,-.058,.04]],[.017,.017,.016,.016],{segments:11,sides:7});
    rod(reel,gold,[.183,-.057,.040],[.231,-.056,.040],.025,10);
    label(root, '119', '#d9483e', '#fff8df', 0.296, 0.113, 0.637, 0.573, s * 0.440, s);
    box(root,cherry,.038,.098,.109,-.986,.397,s*.310,.011);
    box(root,milk,.023,.028,.081,-1.007,.414,s*.310,.006);
  }
  tube(root, cherry, 0.265, 0.245, 0.075, -0.54, 0.938, 0);
  const ladder = group(root, -0.45, 1.035, 0);
  ladder.rotation.z = 0.11;
  for (const s of [-1, 1]) {
    box(ladder, steel, 1.70, 0.06, 0.065, 0.20, 0, s * 0.148, 0.02);
    box(ladder, milk, 1.68, 0.044, 0.048, 0.20, 0.11, s * 0.148, 0.015);
    for (let i = 0; i < 7; i++) rod(ladder, steel, [-0.58 + i * 0.24, 0, s * 0.148], [-0.39 + i * 0.24, 0.11, s * 0.148], 0.014);
  }
  for (let i = 0; i < 8; i++) rod(ladder, milk, [-0.55 + i * 0.207, 0.032, -0.146], [-0.55 + i * 0.207, 0.032, 0.146], 0.021);
  for (const s of [-1, 1]) {
    box(root, chassis, 0.22, 0.045, 0.125, 0.83, 1.15, s * 0.28, 0.016);
    const beacon=group(root,.83,1.20,s*.28);beacon.name=s>0?'blue-beacon':'red-beacon';
    box(beacon,s>0?'#37a9e9':'#ff755d',.195,.077,.104,0,0,0,.03);
  }
}

function racer(root) {
  const blue = paint('#3066ed');
  const cyan = paint('#72d8ff');
  box(root, chassis, 1.78, 0.11, 0.60, -0.03, 0.183, 0);
  const side = [[-0.89,0.27],[-0.76,0.49],[-0.45,0.59],[0.19,0.54],[0.69,0.435],[0.89,0.34],[0.87,0.245]];
  profile(root, blue, side, 0.78, 0, 0, 0, 0.058);
  oval(root, glass, 0.417, 0.185, 0.284, -0.09, 0.537, 0);
  oval(root, blue, 0.267, 0.063, 0.25, -0.14, 0.679, 0);
  for (const s of [-1, 1]) {
    const z = s * 0.073;
    panel(root,ivory,[[0.29,0.581,z+0.038],[0.69,0.498,z+0.038],[0.69,0.498,z-0.038],[0.29,0.581,z-0.038]]);
    panel(root,ivory,[[0.69,0.498,z+0.038],[0.813,0.443,z+0.038],[0.813,0.443,z-0.038],[0.69,0.498,z-0.038]]);
    box(root, milk, 0.38, 0.015, 0.042, -0.13, 0.741, z, 0.006);
    box(root, ivory, 0.15, 0.045, 0.13, 0.791, 0.45, s * 0.275, 0.020).rotation.z = -0.39;
    for (const axle of [-0.575,0.564]) oval(root,blue,0.27,0.088,0.135,axle,0.423,s*0.336);
    box(root, cyan, 0.87, 0.060, 0.043, -0.040, 0.266, s * 0.40, 0.02);
    box(root, blue, 0.06, 0.20, 0.06, -0.727, 0.583, s * 0.245);
    box(root,chassis,.074,.09,.222,-.873,.373,s*.216,.020);
    box(root,'#ff685e',.036,.041,.177,-.910,.384,s*.216,.013);
    label(root, '07', '#f8f5e6', '#27468f', 0.26, 0.135, -0.005, 0.398, s * 0.395, s);
  }
  box(root, blue, 0.225, 0.084, 1.042, -0.762, 0.71, 0, 0.035);
  box(root,cyan,0.137,0.060,0.76,0.863,0.228,0,0.025);
  box(root,chassis,0.043,0.083,0.38,0.930,0.305,0,0.018);
  for (const s of [-1, 1]) box(root, cyan, 0.236, 0.14, 0.046, -0.763, 0.718, s * 0.515);
  wheels(root, [-0.575, 0.564], 0.390, 0.208, milk);
}

function plane(root) {
  const yellow = paint('#ffca37');
  const navy = paint('#397bb3');
  const coral = paint('#ff654e');
  // Tapered fuselage runs nose first along +X.
  const outline = [[-1.02, 0.042],[-0.88, 0.09],[-0.59,0.15],[-0.24,0.24],[0.16,0.278],[0.48,0.25],[0.65,0.182],[0.74,0.092]];
  const sections = outline.map(([pos, radius]) => new THREE.Vector2(radius, pos));
  const fuselage = part(root, new THREE.LatheGeometry(sections, 32), yellow, 0, 0.57, 0);
  fuselage.rotation.z = -Math.PI / 2;
  oval(root, navy, 0.34, 0.196, 0.187, -0.046, 0.762, 0);
  oval(root, glassLight, 0.175, 0.094, 0.109, 0.072, 0.82, 0.034);
  // Flat wing planforms are extruded in XZ, with softly rounded edges.
  const airfoil = (points, thickness, y, color) => {
    const mesh = profile(root, color, points, thickness, 0, y, 0, 0.028);
    mesh.rotation.x = Math.PI / 2;
    return mesh;
  };
  for (const s of [-1, 1]) {
    airfoil([[-0.28,0.07*s],[0.37,0.08*s],[0.264,0.83*s],[0.15,1.12*s],[-0.10,1.15*s],[-0.19,1.04*s]], 0.102, 0.515, yellow);
    airfoil([[-0.16,0.93*s],[0.204,0.93*s],[0.164,1.05*s],[-0.145,1.05*s]], 0.023, 0.575, coral);
    airfoil([[-0.99,0.02*s],[-0.66,0.02*s],[-0.77,0.44*s],[-1,0.46*s]], 0.06, 0.612, coral);
    rod(root, steel, [0.27,0.49, s * 0.10],[0.17,0.16,s * 0.26],0.032);
  }
  profile(root, coral, [[-1.0,0.596],[-0.96,1.015],[-0.82,1.055],[-0.59,0.641]], 0.102);
  wheels(root, [0.18], 0.284, 0.132, milk);
  wheel(root, -0.78, 0, 0.078, ivory, 0.33);
  const collar = tube(root, coral, 0.216, 0.192, 0.132, 0.63, 0.57, 0);
  collar.rotation.z = -Math.PI / 2;
  const prop = group(root, 0.773, 0.57, 0);
  prop.rotation.x = 0.59;
  for (const s of [-1, 1]) {
    oval(prop, ivory, 0.033, 0.245, 0.076, 0, s * 0.254, 0);
    oval(prop, coral, 0.034, 0.061, 0.05, 0.003, s * 0.414, 0);
  }
  oval(prop, coral, 0.100, 0.103, 0.103, 0.051, 0, 0);
}

function scooter(root) {
  const aqua = paint('#18bfba');
  const pink = paint('#ff7492');
  box(root, aqua, 1.19, 0.122, 0.347, -0.13, 0.189, 0, 0.056);
  box(root, milk, 0.79, 0.027, 0.225, -0.19, 0.26, 0, 0.012);
  for (let k = 0; k < 5; k++) box(root, aqua, 0.029, 0.013, 0.14, -0.48 + k * 0.135, 0.282, 0, 0.006);
  for (const x of [-0.666, 0.586]) {
    wheel(root, x, 0, 0.203, pink);
    const fender = part(root, new THREE.TorusGeometry(0.205, 0.063, 9, 22, Math.PI * 0.91), aqua, x, 0.222, 0);
    fender.rotation.z = Math.PI * 0.055;
  }
  for (const s of [-1, 1]) rod(root, aqua, [0.588,0.20,s * 0.094],[0.522,0.486,s * 0.094],0.046);
  rod(root, aqua, [0.525,0.39,0],[0.348,1.246,0],0.061);
  rod(root, steel,[0.446,0.811,0],[0.325,1.37,0],0.038);
  rod(root, steel,[0.325,1.36,-0.34],[0.325,1.36,0.34],0.041);
  for (const s of [-1, 1]) rod(root, pink,[0.325,1.36,s * 0.17],[0.325,1.36,s * 0.402],0.066);
  rod(root,steel,[.34,1.334,.143],[.398,1.289,.304],.020);
  sweep(root,rubber,[[.346,1.324,.142],[.467,1.233,.133],[.512,1.039,.064],
    [.485,.817,.061],[.542,.464,.083],[.588,.253,.101]],[.011,.013,.013,.012,.012,.010],{sides:7,segments:19});
  oval(root, gold, 0.064, 0.058, 0.067, 0.331, 1.428, 0.098);
  oval(root, milk, 0.048, 0.074, 0.07, 0.493, 0.904, 0);
  rod(root, steel, [-0.21,0.20,0],[-0.27,0.05,-0.28],0.023);
}

function craneTruck(root) {
  const yellow = paint('#ffbd2a');
  const orange = paint('#f28b24');
  box(root, chassis, 1.97, 0.21, 0.67, 0, 0.315, 0);
  box(root, yellow, 1.87, 0.155, 0.792, -0.012, 0.455, 0);
  truckCab(root, 0.624, yellow, { tall: 0.89, width: 0.73, visor: yellow });
  wheels(root, [-0.70, -0.22, 0.64], 0.369, 0.202, yellow);
  tube(root, chassis, 0.285, 0.298, 0.10, -0.455, 0.566, 0);
  box(root, orange, 0.76, 0.31, 0.66, -0.442, 0.751, 0);
  box(root, yellow, 0.36, 0.39, 0.318, -0.665, 0.961, 0.135);
  box(root, glass, 0.288, 0.225, 0.326, -0.662, 1.01, 0.14);
  const boom = group(root, -0.58, 0.973, -0.105);
  boom.name='boom';boom.rotation.z = 0.54;
  for(const side of [-1,1]){
    const z=-.105+side*.109;
    rod(root,chassis,[-.291,.817,z],[-.047,1.108,z],.053,12);
    rod(root,steel,[-.047,1.108,z],[.116,1.307,z],.029,12);
    rod(root,orange,[.116,1.307,z-.022],[.116,1.307,z+.022],.057,12);
    rod(boom,steel,[0,0,side*.083],[0,0,side*.128],.075,16);
  }
  box(boom, yellow, 1.16, 0.168, 0.20, 0.478, 0, 0);
  box(boom, milk, 0.72, 0.096, 0.137, 1.245, 0, 0, 0.025);
  box(boom, orange, 0.166, 0.148, 0.182, 1.61, 0, 0, 0.035);
  const tipX = -0.58 + Math.cos(0.54) * 1.61;
  const tipY = 0.973 + Math.sin(0.54) * 1.61;
  const line=group(root,tipX,tipY,-.105);line.name='hook-line';
  rod(line,chassis,[0,0,0],[0,-.414,0],.014);
  const hook = part(line, new THREE.TorusGeometry(0.075, 0.023, 9, 20, Math.PI * 1.57), steel,.045,-.459,0);
  hook.rotation.z = Math.PI * 0.73;
  for (const s of [-1, 1]) {
    for (let k = 0; k < 4; k++) {
      const stripe = box(root, chassis, 0.054, 0.116, 0.014, -0.70 + k * 0.13, 0.743, s * 0.334, 0.003);
      stripe.rotation.z = -0.45;
    }
  }
}

function bus(root) {
  const peach = paint('#ff9a4f');
  box(root, peach, 1.98, 0.63, 0.79, 0, 0.566, 0, 0.139);
  box(root, glass, 1.865, 0.34, 0.756, 0, 0.862, 0, 0.114);
  box(root, milk, 1.95, 0.139, 0.798, 0, 1.043, 0, 0.062);
  for (const s of [-1, 1]) {
    for (const [x,w] of [[-0.565,0.196],[-0.223,0.273],[0.136,0.274],[0.481,0.232]]) {
      const z=s*0.384;
      windowPane(root,[[x-w/2,0.757,z],[x+w/2,0.757,z],[x+w/2,0.959,z],[x-w/2,0.959,z]]);
    }
    for (const x of [-0.70, -0.40, -0.045, 0.315, 0.655]) box(root, milk, 0.041, 0.26, 0.024, x, 0.851, 0.373 * s, 0.009);
    box(root, milk, 1.75, 0.072, 0.023, -0.02, 0.58, s * 0.394);
  }
  for (const z of [-0.247, 0.247]) oval(root, milk, 0.028, 0.065, 0.071, 0.975, 0.493, z);
  wheels(root, [-0.618, 0.615], 0.376, 0.205, milk);
}

function tipper(root) {
  const aqua = paint('#38b8c7');
  const apricot = paint('#ff9842');
  box(root, chassis, 1.9, 0.22, 0.68, 0, 0.29, 0);
  truckCab(root, 0.61, aqua, { tall: 1.01, width: 0.79 });
  profile(root, apricot, [[-0.97,0.857],[-0.80,0.484],[0.05,0.484],[0.19,0.943],[0.18,1.00],[-0.97,0.93]], 0.80);
  for (const s of [-1,1]) {
    for (let i = 0; i < 3; i++) box(root, gold, 0.065, 0.286, 0.032, -0.72 + i * 0.241, 0.728, s * 0.407).rotation.z = -0.16;
    box(root, gold, 1.22, 0.07, 0.063, -0.395, 0.934, s * 0.38);
  }
  wheels(root, [-0.65, 0.60], 0.378, 0.233, milk);
}

function iceCreamVan(root) {
  const pink = paint('#fb809f');
  const mint = paint('#8ee1d6');
  box(root, pink, 1.84, 0.63, 0.79, 0, 0.545, 0, 0.14);
  box(root, milk, 1.66, 0.335, 0.74, -0.02, 0.867, 0, 0.088);
  box(root, glass, 0.42, 0.232, 0.744, 0.535, 0.848, 0);
  for (const s of [-1,1]) {
    box(root, mint, 0.73, 0.26, 0.035, -0.29, 0.859, s * 0.372);
    box(root, milk, 0.82, 0.047, 0.09, -0.29, 0.70, s * 0.388);
    for (let i=0;i<6;i++) box(root, i % 2 ? milk : pink, 0.137, 0.072, 0.15, -0.634 + i * 0.137, 1.012, s * 0.40, 0.021);
  }
  tube(root, gold, 0.144, 0.073, 0.20, -0.23, 1.127, 0);
  oval(root, pink, 0.165, 0.137, 0.165, -0.23, 1.27, 0);
  oval(root, milk, 0.126, 0.119, 0.126, -0.216, 1.366, 0);
  oval(root, pink, 0.066, 0.089, 0.068, -0.183, 1.45, 0);
  wheels(root, [-0.561, 0.583], 0.377, 0.204, mint);
}

function helicopter(root) {
  const purple = paint('#9976e5');
  oval(root, purple, 0.62, 0.363, 0.334, 0.123, 0.54, 0);
  oval(root, glassLight, 0.352, 0.271, 0.30, 0.435, 0.59, 0);
  profile(root, purple, [[-0.24,0.48],[-1.07,0.68],[-1.12,0.93],[-1.02,0.94],[-0.85,0.76],[-0.20,0.72]],0.132);
  for (const s of [-1,1]) {
    rod(root, steel, [-0.23,0.45,s*0.16],[-0.28,0.086,s*0.28],0.029);
    rod(root, steel, [0.36,0.45,s*0.16],[0.39,0.086,s*0.28],0.029);
    box(root, milk, 1.14, 0.075, 0.088, 0.07,0.06,s*0.28);
  }
  tube(root, steel, 0.041, 0.041, 0.22, 0.05, 0.938, 0);
  const rotor = group(root, 0.05, 1.052, 0);
  rotor.rotation.y = 0.45;
  box(rotor, milk, 1.96, 0.036, 0.145, 0,0,0,0.018);
  box(rotor, milk, 0.145,0.035,1.46,0,0.012,0,0.017);
  oval(rotor, gold,0.094,0.062,0.094,0,0.04,0);
  box(root, gold,0.081,0.34,0.045,-1.005,0.787,0.112).rotation.z = Math.PI / 4;
}

function convertible(root) {
  const rose = paint('#e76691');
  profile(root, rose, [[-0.88,0.25],[-0.81,0.46],[-0.51,0.53],[0.27,0.53],[0.74,0.48],[0.87,0.36],[0.84,0.25]],0.76,0,0,0,0.06);
  box(root, chassis, 0.68,0.07,0.57,-0.08,0.53,0,0.026);
  for (const z of [-0.16,0.16]) box(root, milk,0.116,0.236,0.217,-0.32,0.62,z,0.055).rotation.z = 0.12;
  const screen = box(root, glassLight,0.052,0.25,0.54,0.255,0.641,0,0.025);
  screen.rotation.z = 0.33;
  for (const s of [-1,1]) {
    oval(root, ivory,0.063,0.071,0.073,0.789,0.439,s*0.248);
    box(root, milk,0.88,0.057,0.032,-0.018,0.353,s*0.385);
  }
  wheels(root,[-0.55,0.54],0.372,0.195,milk);
}

export const CATALOG = {
  fire: { name: '消防车', make: fireEngine, scale: 1.12, reach: 0.76 },
  racer: { name: '赛车', make: racer, scale: 1.09, reach: 0.67 },
  plane: { name: '螺旋桨飞机', make: plane, scale: 1.07, reach: 0.70 },
  scooter: { name: '滑板车', make: scooter, scale: 1.14, reach: 0.59 },
  crane: { name: '吊车', make: craneTruck, scale: 1.03, reach: 0.73 },
  bus: { name: '小巴士', make: bus, scale: 0.95, reach: 0.71 },
  tipper: { name: '翻斗车', make: tipper, scale: 0.96, reach: 0.71 },
  icecream: { name: '冰淇淋车', make: iceCreamVan, scale: 0.99, reach: 0.71 },
  helicopter: { name: '直升机', make: helicopter, scale: 0.99, reach: 0.68 },
  convertible: { name: '敞篷车', make: convertible, scale: 1, reach: 0.66 },
};

const models = new Map();
export function toyModel(kind,interactive=false) {
  const spec=CATALOG[kind],key=interactive?kind+'-play':kind;
  if (!models.has(key)) {
    const model = new THREE.Group();
    spec.make(model);
    const joints=interactive?model.children.filter(part=>kind==='racer'?part.name==='wheel':
      kind==='fire'?part.name.endsWith('-beacon'):kind==='crane'&&['boom','hook-line'].includes(part.name)):[]; 
    for(const joint of joints){model.remove(joint);bake(joint);}
    bake(model);for(const joint of joints)model.add(joint);
    const bounds = new THREE.Box3().setFromObject(model);
    for (const part of model.children) part.position.y -= bounds.min.y;
    model.userData.height = (bounds.max.y - bounds.min.y) * spec.scale;
    model.scale.setScalar(spec.scale);
    models.set(key, model);
  }
  return models.get(key).clone();
}
