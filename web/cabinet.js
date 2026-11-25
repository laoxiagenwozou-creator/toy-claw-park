import {THREE,bake,box,canvasTexture,group,paint,part} from './parts.js';
import {ROOF} from './playfield.js';

const aluminum=paint('#adb5c5','chrome'),bright=paint('#f6f1e7','chrome'),gasket=paint('#535968','satin');
const trim=paint('#8da1b2','satin'),ivory=paint('#f3ede0');
const tickLight=paint('#ffe9a8','enamel'),tickDark=paint('#5a6c7e','satin');
const carpets={snow:'#31727d',road:'#638189',paw:'#5a8184',sun:'#809774',leaf:'#7e9f8e',wave:'#649b9b',star:'#748096',
  rainbow:'#9880a7',hill:'#72a692',shield:'#6f929d',nest:'#879973',web:'#7484a2'};

let ceilingTex;
function ceilingTexture(){
  if(!ceilingTex){
    ceilingTex=canvasTexture(512,512,(ctx,w,h)=>{
      // Airy bright showcase ceiling with gentle depth falloff.
      const g=ctx.createLinearGradient(0,0,0,h);
      g.addColorStop(0,'#d4dce7');g.addColorStop(.30,'#e8edf3');
      g.addColorStop(.80,'#f4f4ef');g.addColorStop(1,'#fbf8f0');
      ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
      const sides=ctx.createLinearGradient(0,0,w,0);
      sides.addColorStop(0,'rgba(30,48,68,.18)');sides.addColorStop(.12,'rgba(30,48,68,.04)');
      sides.addColorStop(.22,'rgba(30,48,68,0)');sides.addColorStop(.78,'rgba(30,48,68,0)');
      sides.addColorStop(.88,'rgba(30,48,68,.04)');sides.addColorStop(1,'rgba(30,48,68,.18)');
      ctx.fillStyle=sides;ctx.fillRect(0,0,w,h);
    });
  }
  return ceilingTex;
}

export function cabinetCarpet(theme){
  return canvasTexture(768,512,(ctx,w,h)=>{
    ctx.fillStyle=carpets[theme.mark];ctx.fillRect(0,0,w,h);
    // Warm overhead showcase pool brightening the center playfield for 3D depth.
    const pool=ctx.createRadialGradient(w*.50,h*.56,w*.05,w*.50,h*.56,w*.56);
    pool.addColorStop(0,'rgba(240,255,245,.18)');pool.addColorStop(.65,'rgba(232,250,242,.05)');pool.addColorStop(1,'rgba(232,250,242,0)');
    ctx.fillStyle=pool;ctx.fillRect(0,0,w,h);
    // Strong interior wall-seam ambient occlusion grounds the back wall and side ledges.
    const backFront=ctx.createLinearGradient(0,0,0,h);
    backFront.addColorStop(0,'rgba(10,28,44,.54)');backFront.addColorStop(.16,'rgba(14,36,52,.16)');
    backFront.addColorStop(.84,'rgba(14,36,52,0)');backFront.addColorStop(1,'rgba(10,28,44,.22)');
    ctx.fillStyle=backFront;ctx.fillRect(0,0,w,h);
    const sides=ctx.createLinearGradient(0,0,w,0);
    sides.addColorStop(0,'rgba(10,28,44,.42)');sides.addColorStop(.09,'rgba(14,36,52,.10)');
    sides.addColorStop(.19,'rgba(14,36,52,0)');sides.addColorStop(.81,'rgba(14,36,52,0)');
    sides.addColorStop(.91,'rgba(14,36,52,.10)');sides.addColorStop(1,'rgba(10,28,44,.42)');
    ctx.fillStyle=sides;ctx.fillRect(0,0,w,h);
    let seed=51;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    for(let i=0;i<14500;i++){ctx.fillStyle=i%2?'rgba(252,250,238,.08)':'rgba(20,34,48,.08)';ctx.fillRect(random()*w,random()*h,random()*2+.5,.85);}
  });
}
function rail(p,x,z,c,front=false){
  if(front){
    // Chunky multi-stepped front architectural pillar anchoring the screen-plane window.
    box(p,gasket,.26,ROOF,.25,x,ROOF/2,z-.02,.022);
    box(p,c,.18,ROOF,.24,x,ROOF/2,z+.028,.024);
    box(p,bright,.048,ROOF,.26,x-Math.sign(x)*.065,ROOF/2,z+.024,.009);
  }else{
    box(p,gasket,.20,ROOF,.20,x,ROOF/2,z,.019);
    box(p,c,.13,ROOF,.21,x,ROOF/2,z+.026,.022);
    box(p,bright,.028,ROOF,.22,x-Math.sign(x)*.048,ROOF/2,z+.022,.007);
  }
}
// Softly frosted/reflective side glass separates the active diorama bay from
// neighboring machines while keeping neighbors clearly visible and tappable.
const sideGlass=new THREE.ShaderMaterial({
  transparent:true,depthWrite:false,side:THREE.DoubleSide,forceSinglePass:true,
  vertexShader:`
    varying vec2 paneUV;
    varying vec3 sight;
    void main(){
      vec4 world=modelMatrix*vec4(position,1.);
      paneUV=uv;sight=cameraPosition-world.xyz;
      gl_Position=projectionMatrix*viewMatrix*world;
    }`,
  fragmentShader:`
    varying vec2 paneUV;
    varying vec3 sight;
    void main(){
      vec3 eye=normalize(sight);
      float grazing=1.-min(1.,abs(eye.x)*1.95);
      float edge=exp(-15.*min(paneUV.x,1.-paneUV.x));
      float topEdge=exp(-14.*(1.-paneUV.y));
      float line=paneUV.y-(.80+.14*paneUV.x+.22*eye.x+.22*eye.y);
      float strip=exp(-120.*abs(line))+.26*exp(-16.*abs(line));
      float foot=exp(-13.*paneUV.y);
      float alpha=.12+.14*grazing+.12*edge+.07*topEdge+.24*strip+.10*foot;
      vec3 tint=mix(vec3(.88,.93,.97),vec3(1.0,.98,.92),min(1.,strip+edge*.35+topEdge*.25));
      gl_FragColor=vec4(tint,min(.54,alpha));
      #include <colorspace_fragment>
    }`
});
const warmStrip=new THREE.MeshBasicMaterial({color:'#fff5d8',toneMapped:false});
const coolStrip=new THREE.MeshBasicMaterial({color:'#defaff',toneMapped:false});

export function cabinetShell(scene,theme){
  const shell=group(scene);
  const enamel=paint(theme.base,'satin');
  const barY=ROOF-.30;
  const depthMarks=[1.45,-.35,-2.15];

  for(const s of [-1,1]){
    const x=s*5.40;
    rail(shell,x,3.015,aluminum,true);rail(shell,x,-4.18,trim,false);
    // Bold stepped inner side-floor moldings create strong converging 3D perspective tracks.
    box(shell,ivory,.26,.20,7.24,x-s*.11,.100,-.56,.022);
    box(shell,enamel,.11,.11,7.18,x-s*.26,.055,-.56,.014);
    box(shell,bright,.055,.038,7.20,x-s*.19,.195,-.56,.009);
    // Top side frame beam.
    box(shell,aluminum,.18,.15,7.25,x,ROOF-.02,-.56,.018);
    box(shell,bright,.21,.036,7.22,x,ROOF+.055,-.56,.010);
    // Side glass partition pane.
    const glass=part(scene,new THREE.PlaneGeometry(7.13,ROOF-.22),sideGlass,x,(ROOF+.06)/2,-.57);
    glass.rotation.y=Math.PI/2;glass.renderOrder=5;
    // Recessed overhead ceiling LED cove strips and subtle floor-edge cove glow.
    box(shell,s<0?warmStrip:coolStrip,.080,.032,6.96,x-s*.48,ROOF-.10,-.59,.010);
    box(shell,s<0?warmStrip:coolStrip,.042,.024,6.98,x-s*.27,.175,-.57,.005);
    // Clean, slender bright side Z-rails near the upper edge with subtle depth marks.
    box(shell,bright,.15,.11,7.16,s*5.02,barY,-.56,.020);
    for(const z of depthMarks){
      box(shell,tickDark,.17,.14,.09,s*5.03,barY,z,.012);
      box(shell,tickLight,.09,.042,.12,x-s*.25,.115,z,.008);
    }
  }
  // Front bottom sill & bright inner lip.
  box(shell,aluminum,10.82,.15,.22,0,.020,3.025,.020);
  box(shell,bright,10.78,.042,.23,0,.085,3.025,.012);
  // Front top header fascia & recessed inner bevel.
  box(shell,ivory,10.86,1.32,.34,0,ROOF+.60,3.014,.047);
  box(shell,aluminum,10.86,.15,.34,0,ROOF-.012,3.015,.026);
  box(shell,bright,10.70,.046,.14,0,ROOF-.082,3.028,.016);
  box(shell,enamel,10.58,.18,.052,0,ROOF+.24,3.185,.024);
  // Airy, clean illuminated ceiling soffit recessed above the glass opening.
  const ceilingMat=new THREE.MeshBasicMaterial({map:ceilingTexture(),toneMapped:false});
  const ceilingPlane=part(scene,new THREE.PlaneGeometry(10.72,7.18),ceilingMat,0,ROOF+.08,-.55);
  ceilingPlane.rotation.x=Math.PI/2;
  // Rear bottom trim & sleek upper white reference strip along the back wall top edge.
  box(shell,aluminum,10.78,.12,.16,0,.060,-4.19,.021);
  box(shell,bright,10.42,.055,.06,0,ROOF-.42,-4.19,.010);
  bake(shell,{castShadow:false});
}
