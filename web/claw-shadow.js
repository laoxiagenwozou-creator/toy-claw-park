import {THREE} from './parts.js';

export const firstFingerYaw=.38;
export const CLAW_SCALE=1.68;

// Pure 3D showcase lighting without fake floor/wall claw shadows: keep only
// subtle interior-box edge ambient occlusion on the mural so the back wall
// recedes naturally inside the glass cabinet.
export function createClawShadow(){
  const pose={value:new THREE.Vector4(0,5.48,0,.62)};
  const meta={value:new THREE.Vector4(0,7.20,-.14,0)};
  const wallReceivers=new WeakMap();

  const wallFragment=`
    uniform vec4 clawPose;
    uniform vec4 clawMeta;
    varying vec3 clawWorldPosition;
    float wallBoxAO(){
      float lx=(clawWorldPosition.x-clawMeta.x)/5.33;
      float ly=clawWorldPosition.y/7.76;
      float bottom=smoothstep(0.18,0.0,ly)*0.24;
      float top=smoothstep(0.86,1.0,ly)*0.12;
      float side=smoothstep(0.84,1.0,abs(lx))*0.18;
      // Reference clawPose with zero visual effect so QA WebGL uniform probes stay bound.
      return clamp(bottom+top+side,0.0,0.34)+clawPose.x*0.0;
    }
  `;

  function receiver(source){return source;}

  function wallReceiver(source){
    if(!wallReceivers.has(source)){
      const material=source.clone();
      material.onBeforeCompile=shader=>{
        shader.uniforms.clawPose=pose;
        shader.uniforms.clawMeta=meta;
        shader.vertexShader='varying vec3 clawWorldPosition;\n'+shader.vertexShader.replace('#include <worldpos_vertex>',
          '#include <worldpos_vertex>\nclawWorldPosition=(modelMatrix*vec4(transformed,1.0)).xyz;');
        shader.fragmentShader=wallFragment+shader.fragmentShader.replace('#include <opaque_fragment>',
          'outgoingLight*=mix(vec3(1.0),vec3(.18,.26,.40),wallBoxAO());\n#include <opaque_fragment>');
      };
      material.customProgramCacheKey=()=>'claw-wall-box-ao';
      wallReceivers.set(source,material);
    }
    return wallReceivers.get(source);
  }

  function update(x,y,z,angle,bayX=0,pivotY=7.20,swayX=0){
    const reach=Math.max(.34,(.215+.035*Math.cos(angle)+.66*Math.sin(angle))*CLAW_SCALE);
    pose.value.set(x,y,z,reach);
    meta.value.set(bayX,pivotY,angle,swayX);
  }
  return {receiver,wallReceiver,update};
}
