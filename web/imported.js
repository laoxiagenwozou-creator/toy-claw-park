import {THREE,oval,paint} from './parts.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {assetBuffer} from './asset-bytes.js';
import skyeFile from './assets/skye.glb';
import blueyFile from './assets/bluey.glb';
import bingoFile from './assets/bingo.glb';

const editions={
  bluey:{file:blueyFile,height:1.63,turn:-Math.PI/2,grip:[0,.68,.045,.135,.15]},
  bingo:{file:bingoFile,height:1.46,turn:0,grip:[-.067,.68,.07,.145,.15]},
  skye:{file:skyeFile,height:1.62,turn:0,grip:[0,.48,-.15,.132,.155]},
};
const cache=new Map(),loading=new Map();
export function prepareModel(id){
  if(!editions[id])return Promise.resolve();
  if(!loading.has(id)){
    const spec=editions[id];
    const job=assetBuffer(spec.file).then(bytes=>new GLTFLoader().parseAsync(bytes,'')).then(gltf=>{
      const model=new THREE.Group(),orient=new THREE.Group();
      orient.add(gltf.scene);orient.rotation.y=spec.turn;model.add(orient);
      if(id==='skye')oval(orient,paint('#48353a','satin'),.049,.035,.034,0,.605,.433);
      model.traverse(part=>{
        if(!part.isMesh)return;
        part.castShadow=true;part.receiveShadow=true;
        for(const m of [].concat(part.material)){
          m.metalness=0.035;m.roughness=.62;
          if(id==='bluey'){
            const palette={Blue1:'#80b7d9',blue2:'#496c95',Yellow:'#f4c486',black:'#283847',Material:'#fff4df'};
            if(palette[m.name]){m.map=null;m.color.set(palette[m.name]);m.needsUpdate=true;}
          }
        }
      });
      const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3());
      orient.position.set(-(bounds.max.x+bounds.min.x)/2,-bounds.min.y,-(bounds.max.z+bounds.min.z)/2);
      const scale=spec.height/size.y;model.scale.setScalar(scale);model.userData.height=spec.height;
      const [x,y,z,rx,rz]=spec.grip.map(n=>n*spec.height);
      model.userData.grip={x,y,z,rx,rz};
      cache.set(id,model);
    }).catch(e=>{loading.delete(id);throw e;});
    loading.set(id,job);
  }
  return loading.get(id);
}
export const externalModel=id=>cache.get(id).clone();
