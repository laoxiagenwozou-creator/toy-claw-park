import {THREE,bake} from './parts.js';

// Grip coordinates are supplied in sculpting space then normalized together
// with the mesh. Y is the height at which the fingers wrap the toy.
export function collectable(factory,{height=1.55,width=2.05,grip}) {
  let original;
  return ()=>{
    if(!original){
      original=new THREE.Group();factory(original);bake(original);
      const bounds=new THREE.Box3().setFromObject(original),size=bounds.getSize(new THREE.Vector3());
      const scale=Math.min(height/size.y,width/Math.max(size.x,size.z));
      for(const part of original.children){
        part.position.y-=bounds.min.y;
        if(part.material.transparent){part.castShadow=false;part.receiveShadow=false;part.renderOrder=2;}
      }
      original.scale.setScalar(scale);original.userData.height=size.y*scale;
      const [x,y,z,rx,rz]=grip;
      original.userData.grip={x:x*scale,y:(y-bounds.min.y)*scale,z:z*scale,rx:rx*scale,rz:rz*scale};
    }
    return original.clone();
  };
}
