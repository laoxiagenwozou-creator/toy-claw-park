import {THREE} from '../web/parts.js';
import {pupModel} from '../web/pups.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
const scene=new THREE.Scene();scene.background=new THREE.Color('#dde9ee');
const r=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});r.setSize(1200,790);document.body.append(r.domElement);
r.toneMapping=THREE.NeutralToneMapping;r.toneMappingExposure=.94;r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;
scene.environment=new THREE.PMREMGenerator(r).fromScene(new RoomEnvironment(),.05).texture;scene.environmentIntensity=.48;
const sun=new THREE.DirectionalLight('#fff6e3',2.05);sun.position.set(-4,9,6);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.normalBias=.012;scene.add(sun,new THREE.HemisphereLight('#f0fbff','#d8c4b7',.92));
const cam=new THREE.OrthographicCamera(-4.7,4.7,3.094,-3.094,.1,50);cam.position.set(0,4.2,13);cam.lookAt(0,.94,0);
for(const [i,k]of ['chase','marshall','skye','rubble','rocky','zuma'].entries()){
  const m=pupModel(k);m.position.set((i%3-1)*2.64, i<3?.14:-.08,i<3?-2.12:2.05);m.rotation.y=(i%2?-.47:.57);scene.add(m);
}
const deck=new THREE.Mesh(new THREE.PlaneGeometry(36,36),new THREE.MeshStandardMaterial({color:'#d7e2dd',roughness:1}));deck.rotation.x=-Math.PI/2;deck.position.y=-.09;deck.receiveShadow=true;scene.add(deck);
r.render(scene,cam);window.ready=true;
