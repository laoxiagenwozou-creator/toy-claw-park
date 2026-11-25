import {THREE} from '../web/parts.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {PRIZES, preparePrizes} from '../web/library.js';
import town from '../web/assets/town.webp';import garden from '../web/assets/garden.webp';
import yard from '../web/assets/yard.webp';import lookout from '../web/assets/lookout.webp';
import reef from '../web/assets/reef.webp';import space from '../web/assets/space.webp';
import snow from '../web/assets/snow.webp';
const settings={
  snow:[snow,'#90bbc3',['lemonChick','snowPenguin','lilacCat'],[.35,-.30,-.45]],
  town:[town,'#dbc398',['racer','fire','plane'],[-.65,-2.45,-.65]],
  lookout:[lookout,'#b1c5bd',['marshall','chase','skye'],[.32,-.40,-.55]],
  yard:[yard,'#bbcc8e',['bingo','bluey','chilli'],[.39,-.43,-.52]],
  garden:[garden,'#c8cb9e',['fern','honey','bells'],[.28,-.4,-.35]],
  reef:[reef,'#9dd3cd',['clown','octopus','turtle'],[.78,.12,-.66]],
  space:[space,'#bdb6c6',['rover','rocket','astronaut'],[.44,.12,-.48]],
};
const r=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,alpha:true});
r.setSize(840,490);document.body.append(r.domElement);
r.toneMapping=THREE.NeutralToneMapping;r.toneMappingExposure=.99;r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();
scene.environment=new THREE.PMREMGenerator(r).fromScene(new RoomEnvironment(),.05).texture;scene.environmentIntensity=.57;
const sun=new THREE.DirectionalLight('#fff3e4',2);sun.position.set(-3,7,5);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.normalBias=.013;
scene.add(sun,new THREE.HemisphereLight('#fffbed','#bed5d6',1.0));
const camera=new THREE.OrthographicCamera(-2.54,2.54,1.482,-1.482,.1,36);camera.position.set(0,2.62,9);camera.lookAt(0,.88,0);
const base=new THREE.Mesh(new THREE.CylinderGeometry(3.1,3.12,.1,64),new THREE.MeshStandardMaterial({roughness:.97}));
base.position.set(0,-.055,-.42);base.scale.z=.68;base.receiveShadow=true;scene.add(base);
const subjects=new THREE.Group();scene.add(subjects);
document.body.style.cssText='background-size:cover;background-position:center 45%;';
window.renderPostcard=async id=>{
  const [back,tone,ids,turns]=settings[id];await preparePrizes(ids);
  const img=new Image();img.src=back;await img.decode();
  document.body.style.backgroundImage='linear-gradient(180deg,rgba(255,250,234,.18),rgba(255,248,225,.43)),url('+back+')';
  base.material.color.set(tone);subjects.clear();
  ids.forEach((key,i)=>{
    const m=PRIZES[key].make();
    const height=m.userData.height;
    const sizes=id==='town'?[1.03,1.55,1.19]:[1.49,1.86,1.46];
    const factor=Math.min(sizes[i]/height,(id==='town'&&i!==1)?1.04:1.59);
    m.scale.multiplyScalar(factor);m.position.set([-1.36,0,1.31][i],0,[.11,-.52,.10][i]);
    m.rotation.y=turns[i];subjects.add(m);
  });
  r.render(scene,camera);await new Promise(requestAnimationFrame);
};
