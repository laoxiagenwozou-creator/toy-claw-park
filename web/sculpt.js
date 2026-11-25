import {THREE, paint, part, singleUseGeometry} from './parts.js';

const materialOf=m=>typeof m==='string'?paint(m,'satin'):m;
const smooth=(a,b,c,d,t)=>b+.5*t*((c-a)+t*((2*a-5*b+4*c-d)+t*(3*b-a-3*c+d)));

// Cross-sections run from bottom to top: height, x/z radii, z offset, x offset.
// Keeping a closed seam makes silhouettes and shadows hold up from behind.
export function loft(parent,material,sections,{sides=32,steps=3,tint,exponent=1}={}) {
  const vertices=[],uv=[],colors=[],indices=[];
  const last=sections.length-1, rows=last*steps+1;
  const white=new THREE.Color(0xffffff);
  for(let r=0;r<rows;r++) {
    const j=Math.min(last-1,Math.floor(r/steps)),t=r/steps-j;
    const value=k=>smooth(sections[Math.max(0,j-1)][k]||0,sections[j][k]||0,
      sections[j+1][k]||0,sections[Math.min(last,j+2)][k]||0,t);
    const rx=Math.max(.001,value(1)),rz=Math.max(.001,value(2)),cz=value(3),cx=value(4);
    const y=THREE.MathUtils.lerp(sections[j][0],sections[j+1][0],t);
    for(let i=0;i<sides;i++) {
      const u=i/sides,a=u*2*Math.PI;
      const sx=Math.sin(a),sz=Math.cos(a);
      const x=cx+rx*Math.sign(sx)*Math.pow(Math.abs(sx),exponent);
      const z=cz+rz*Math.sign(sz)*Math.pow(Math.abs(sz),exponent);
      vertices.push(x,y,z);uv.push(u,r/(rows-1));
      if(tint){const col=tint(x,y,z,a)||white;colors.push(col.r,col.g,col.b);}
      if(r===rows-1)continue;
      const k=r*sides+i,n=r*sides+(i+1)%sides;
      indices.push(k,n,k+sides,n,n+sides,k+sides);
    }
  }
  for(let i=1;i<sides-1;i++){
    indices.push(0,i+1,i);
    const top=(rows-1)*sides;indices.push(top,top+i,top+i+1);
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  if(tint) geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  geo.setIndex(indices);geo.computeVertexNormals();
  return part(parent,singleUseGeometry(geo),materialOf(material));
}

// A canine torso, muzzle or fish body, sculpted nose-to-tail in the Z direction.
export function barrel(parent,material,rings,options) {
  const mesh=loft(parent,material,rings.map(([z,rx,ry,y,x])=>[z,rx,ry,-y,x||0]),options);
  mesh.rotation.x=Math.PI/2;
  return mesh;
}

// Closed tapered 3-D stroke, used for curved tails, stems, hoses and flippers.
export function sweep(parent,material,points,radii,{sides=10,segments=18,flat=1}={}) {
  const line=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal');
  const frames=line.computeFrenetFrames(segments,false),vertices=[],uv=[],indices=[];
  const p=new THREE.Vector3(),offset=new THREE.Vector3();
  for(let j=0;j<=segments;j++){
    const t=j/segments,at=t*(radii.length-1),i=Math.min(radii.length-2,Math.floor(at));
    const radius=THREE.MathUtils.lerp(radii[i],radii[i+1],at-i);
    line.getPointAt(t,p);
    for(let s=0;s<sides;s++){
      const a=s/sides*Math.PI*2;
      offset.copy(frames.normals[j]).multiplyScalar(Math.cos(a)*radius)
        .addScaledVector(frames.binormals[j],Math.sin(a)*radius*flat).add(p);
      vertices.push(offset.x,offset.y,offset.z);uv.push(s/sides,t);
      if(j===segments)continue;
      const k=j*sides+s,n=j*sides+(s+1)%sides;
      indices.push(k,n,k+sides,n,n+sides,k+sides);
    }
  }
  for(let s=1;s<sides-1;s++){
    indices.push(0,s+1,s);
    const end=segments*sides;indices.push(end,end+s,end+s+1);
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
  return part(parent,singleUseGeometry(g),materialOf(material));
}

const smallSphere=new THREE.SphereGeometry(1,14,10);
export function bead(parent,material,rx,ry,rz,x,y,z) {
  const mesh=part(parent,smallSphere,materialOf(material),x,y,z);mesh.scale.set(rx,ry,rz);return mesh;
}
