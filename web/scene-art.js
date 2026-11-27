import {THREE} from './parts.js';

const backdropCache=new Map(),cardCache=new Map(),dockCache=new Map(),medalCache=new Map(),portraitCache=new Map();

function makeCanvas(w,h,draw){
  const c=document.createElement('canvas');c.width=w;c.height=h;
  const ctx=c.getContext('2d');
  draw(ctx,w,h);
  return c;
}
function gradY(ctx,h,stops){
  const g=ctx.createLinearGradient(0,0,0,h);
  for(const [t,col] of stops)g.addColorStop(t,col);
  return g;
}
function rr(ctx,x,y,w,h,r){
  ctx.beginPath();ctx.roundRect(x,y,w,h,r);
}
function cloud(ctx,x,y,s,color='rgba(255,253,245,.88)'){
  ctx.fillStyle=color;ctx.beginPath();
  ctx.arc(x,y,s*.42,0,Math.PI*2);ctx.arc(x-s*.38,y+s*.08,s*.32,0,Math.PI*2);
  ctx.arc(x+s*.40,y+s*.06,s*.34,0,Math.PI*2);ctx.arc(x+s*.12,y-s*.14,s*.30,0,Math.PI*2);
  ctx.fill();
}
function hill(ctx,w,h,yBase,amp,freq,phase,color){
  ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,h);
  for(let x=0;x<=w;x+=24)ctx.lineTo(x,yBase+Math.sin(x/w*Math.PI*freq+phase)*amp);
  ctx.lineTo(w,h);ctx.closePath();ctx.fill();
}
function stars(ctx,w,h,count,seed=7){
  let s=seed;const rnd=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};
  for(let i=0;i<count;i++){
    const x=rnd()*w,y=rnd()*h,r=1+rnd()*2.8;
    ctx.fillStyle=i%5===0?'#ffe999':'#fffdf2';
    ctx.globalAlpha=.45+rnd()*.55;
    ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;
}
function bunting(ctx,x1,y1,x2,y2,n,colors,drop=24){
  ctx.strokeStyle='#7a6044';ctx.lineWidth=2.5;ctx.beginPath();
  ctx.moveTo(x1,y1);ctx.quadraticCurveTo((x1+x2)/2,(y1+y2)/2+drop,x2,y2);ctx.stroke();
  for(let i=0;i<n;i++){
    const t=(i+.5)/n,mt=1-t;
    const cx=mt*mt*x1+2*mt*t*(x1+x2)/2+t*t*x2;
    const cy=mt*mt*y1+2*mt*t*((y1+y2)/2+drop)+t*t*y2;
    ctx.fillStyle=colors[i%colors.length];ctx.beginPath();
    ctx.moveTo(cx-12,cy);ctx.lineTo(cx+12,cy);ctx.lineTo(cx,cy+22);ctx.closePath();ctx.fill();
  }
}
function pine(ctx,x,y,w,h,color){
  ctx.fillStyle=color;
  for(let i=0;i<3;i++){
    const ty=y-h*(.42+i*.22),bw=w*(1-i*.22);
    ctx.beginPath();ctx.moveTo(x,ty-h*.36);ctx.lineTo(x-bw/2,ty);ctx.lineTo(x+bw/2,ty);ctx.closePath();ctx.fill();
  }
}
function sunGlow(ctx,x,y,r,inner='#fff9cf',outer='rgba(255,232,150,0)'){
  const g=ctx.createRadialGradient(x,y,r*.18,x,y,r*2.4);
  g.addColorStop(0,inner);g.addColorStop(.42,'rgba(255,236,162,.45)');g.addColorStop(1,outer);
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r*2.4,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=inner;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
}

function drawScene(ctx,w,h,id){
  ctx.save();
  switch(id){
    case 'recycle':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#69b8e6'],[.55,'#bce6f7'],[1,'#ebf8e8']]);ctx.fillRect(0,0,w,h);
      sunGlow(ctx,w*.82,h*.18,w*.055);
      cloud(ctx,w*.2,h*.18,w*.08);cloud(ctx,w*.56,h*.14,w*.065);
      hill(ctx,w,h,h*.63,h*.05,2.2,.4,'#8ccf88');
      hill(ctx,w,h,h*.72,h*.04,1.8,1.8,'#69b86c');
      // Wind turbines
      for(const [tx,ty,sc] of [[w*.18,h*.54,.85],[w*.30,h*.58,.68],[w*.78,h*.55,.78]]){
        ctx.strokeStyle='#f5fafc';ctx.lineWidth=6*sc;ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(tx,ty-h*.22*sc);ctx.stroke();
        const hy=ty-h*.22*sc;
        for(let a=0;a<3;a++){
          const ang=a*Math.PI*2/3+.35;
          ctx.beginPath();ctx.moveTo(tx,hy);ctx.lineTo(tx+Math.cos(ang)*w*.07*sc,hy+Math.sin(ang)*w*.07*sc);ctx.stroke();
        }
        ctx.fillStyle='#5aa86e';ctx.beginPath();ctx.arc(tx,hy,6*sc,0,Math.PI*2);ctx.fill();
      }
      // Eco station shelter & 4 colored recycling bins
      ctx.fillStyle='#5a6b73';ctx.fillRect(0,h*.77,w,h*.23);
      ctx.fillStyle='#d8e4e6';ctx.fillRect(0,h*.76,w,h*.022);
      ctx.fillStyle='#f4f8ef';rr(ctx,w*.22,h*.52,w*.56,h*.25,14);ctx.fill();
      ctx.fillStyle='#2e8f5e';rr(ctx,w*.18,h*.46,w*.64,h*.08,16);ctx.fill();
      ctx.fillStyle='#eaf9ef';ctx.font=`900 ${Math.round(h*.042)}px sans-serif`;ctx.textAlign='center';
      ctx.fillText('♻ 环保分类站',w*.5,h*.515);
      const bins=[['#2b7cd3','可回收'],['#38a354','厨余'],['#d9423a','有害'],['#697582','其他']];
      bins.forEach(([col,lbl],i)=>{
        const bx=w*(.27+i*.122),by=h*.60,bw=w*.095,bh=h*.175;
        ctx.fillStyle=col;rr(ctx,bx,by,bw,bh,10);ctx.fill();
        ctx.fillStyle='rgba(255,255,255,.22)';rr(ctx,bx-4,by-8,bw+8,14,7);ctx.fill();
        ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(bx+bw/2,by+bh*.46,bw*.22,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=col;ctx.font=`800 ${Math.round(h*.022)}px sans-serif`;ctx.fillText(lbl,bx+bw/2,by+bh*.82);
      });
      break;
    }
    case 'dino':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#f69d52'],[.45,'#fbd38d'],[.85,'#a6d486'],[1,'#5f9653']]);ctx.fillRect(0,0,w,h);
      sunGlow(ctx,w*.22,h*.22,w*.065,'#fff4c2');
      // Volcano
      ctx.fillStyle='#6c534c';ctx.beginPath();ctx.moveTo(w*.45,h*.68);ctx.lineTo(w*.66,h*.26);ctx.lineTo(w*.74,h*.26);ctx.lineTo(w*.95,h*.68);ctx.closePath();ctx.fill();
      ctx.fillStyle='#ff6a2e';ctx.beginPath();ctx.moveTo(w*.66,h*.26);ctx.lineTo(w*.74,h*.26);ctx.lineTo(w*.72,h*.36);ctx.lineTo(w*.69,h*.31);ctx.lineTo(w*.67,h*.38);ctx.closePath();ctx.fill();
      cloud(ctx,w*.72,h*.16,w*.085,'rgba(255,235,215,.72)');cloud(ctx,w*.65,h*.11,w*.06,'rgba(240,210,190,.62)');
      hill(ctx,w,h,h*.66,h*.055,2.4,.5,'#72ad5d');
      hill(ctx,w,h,h*.75,h*.045,2.1,2.2,'#4b8544');
      // Pterosaurs silhouettes
      ctx.strokeStyle='#5a453c';ctx.lineWidth=4;
      for(const [px,py,ps] of [[w*.35,h*.24,22],[w*.44,h*.18,16],[w*.28,h*.31,14]]){
        ctx.beginPath();ctx.moveTo(px-ps,py+ps*.2);ctx.quadraticCurveTo(px-ps*.4,py-ps*.45,px,py);
        ctx.quadraticCurveTo(px+ps*.4,py-ps*.45,px+ps,py+ps*.2);ctx.stroke();
      }
      // Prehistoric palms & giant ferns
      for(const [tx,ty,sc] of [[w*.12,h*.74,1],[w*.88,h*.76,.92]]){
        ctx.strokeStyle='#7a5133';ctx.lineWidth=14*sc;ctx.beginPath();ctx.moveTo(tx,ty);ctx.quadraticCurveTo(tx+20*sc,ty-h*.18,tx-8*sc,ty-h*.30*sc);ctx.stroke();
        const lx=tx-8*sc,ly=ty-h*.30*sc;
        ctx.fillStyle='#3a7a3b';
        for(let a=0;a<6;a++){
          const ang=a*Math.PI/3-.3;
          ctx.beginPath();ctx.ellipse(lx+Math.cos(ang)*46*sc,ly+Math.sin(ang)*28*sc,52*sc,14*sc,ang,0,Math.PI*2);ctx.fill();
        }
      }
      break;
    }
    case 'construct':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#5aaee8'],[.55,'#b8e1f8'],[1,'#f2dfb7']]);ctx.fillRect(0,0,w,h);
      sunGlow(ctx,w*.16,h*.18,w*.052);
      cloud(ctx,w*.42,h*.16,w*.075);cloud(ctx,w*.78,h*.18,w*.065);
      // City skyline under construction
      const bldgs=[[w*.06,h*.38,w*.13],[w*.22,h*.32,w*.14],[w*.68,h*.36,w*.15],[w*.84,h*.42,w*.12]];
      for(const [bx,by,bw] of bldgs){
        ctx.fillStyle='#90a6b8';rr(ctx,bx,by,bw,h*.42,6);ctx.fill();
        ctx.fillStyle='#d8ebf7';
        for(let r=0;r<4;r++)for(let c=0;c<3;c++)ctx.fillRect(bx+bw*(.14+c*.28),by+h*.04+r*h*.07,bw*.18,h*.045);
      }
      // Yellow tower crane
      ctx.strokeStyle='#e8a517';ctx.lineWidth=8;
      ctx.strokeRect(w*.47,h*.22,w*.055,h*.54);
      ctx.beginPath();ctx.moveTo(w*.28,h*.24);ctx.lineTo(w*.82,h*.24);ctx.lineTo(w*.50,h*.14);ctx.lineTo(w*.28,h*.24);ctx.stroke();
      ctx.strokeStyle='#3d4954';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(w*.74,h*.24);ctx.lineTo(w*.74,h*.48);ctx.stroke();
      // Dirt mound & striped barrier
      hill(ctx,w,h,h*.74,h*.05,2.5,.3,'#c89b63');
      ctx.fillStyle='#f4b92e';ctx.fillRect(w*.08,h*.74,w*.84,h*.055);
      ctx.fillStyle='#2b3138';
      for(let i=0;i<11;i++){ctx.beginPath();ctx.moveTo(w*(.10+i*.078),h*.74);ctx.lineTo(w*(.135+i*.078),h*.74);ctx.lineTo(w*(.115+i*.078),h*.795);ctx.lineTo(w*(.08+i*.078),h*.795);ctx.closePath();ctx.fill();}
      break;
    }
    case 'train':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#69a9d8'],[.5,'#c8e5f4'],[.82,'#f6e5c3'],[1,'#7ba872']]);ctx.fillRect(0,0,w,h);
      sunGlow(ctx,w*.82,h*.20,w*.052);
      cloud(ctx,w*.26,h*.16,w*.08);cloud(ctx,w*.54,h*.19,w*.07);
      hill(ctx,w,h,h*.60,h*.06,2.1,.9,'#8bb882');
      // Stone viaduct arches
      ctx.fillStyle='#c9b69a';ctx.fillRect(0,h*.52,w,h*.22);
      ctx.fillStyle='#8bb882';
      for(let i=0;i<5;i++){
        ctx.beginPath();ctx.arc(w*(.1+i*.2),h*.74,w*.065,Math.PI,0);ctx.fill();
      }
      // Classic red-brick station house & clock tower
      ctx.fillStyle='#c45a4a';rr(ctx,w*.32,h*.36,w*.36,h*.38,8);ctx.fill();
      ctx.fillStyle='#3f5a70';ctx.beginPath();ctx.moveTo(w*.28,h*.37);ctx.lineTo(w*.50,h*.22);ctx.lineTo(w*.72,h*.37);ctx.closePath();ctx.fill();
      ctx.fillStyle='#fff9e6';ctx.beginPath();ctx.arc(w*.50,h*.34,w*.045,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#2c3b4a';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(w*.5,h*.34);ctx.lineTo(w*.5,h*.305);ctx.moveTo(w*.5,h*.34);ctx.lineTo(w*.525,h*.35);ctx.stroke();
      // Tracks
      ctx.fillStyle='#6c7a82';ctx.fillRect(0,h*.74,w,h*.26);
      ctx.fillStyle='#b8c4ca';ctx.fillRect(0,h*.79,w,6);ctx.fillRect(0,h*.85,w,6);
      break;
    }
    case 'farm':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#69c0ee'],[.52,'#c7ecfb'],[1,'#eef5c9']]);ctx.fillRect(0,0,w,h);
      sunGlow(ctx,w*.78,h*.19,w*.06);
      cloud(ctx,w*.24,h*.17,w*.08);cloud(ctx,w*.56,h*.15,w*.065);
      hill(ctx,w,h,h*.62,h*.055,1.8,.2,'#a4cf6c');
      hill(ctx,w,h,h*.71,h*.045,2.2,1.6,'#7db954');
      // Red barn
      ctx.fillStyle='#cc4339';ctx.beginPath();ctx.moveTo(w*.18,h*.72);ctx.lineTo(w*.18,h*.48);ctx.lineTo(w*.25,h*.35);ctx.lineTo(w*.38,h*.29);ctx.lineTo(w*.51,h*.35);ctx.lineTo(w*.58,h*.48);ctx.lineTo(w*.58,h*.72);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#fff8e8';ctx.lineWidth=6;ctx.strokeRect(w*.30,h*.50,w*.16,h*.20);
      ctx.beginPath();ctx.moveTo(w*.30,h*.50);ctx.lineTo(w*.46,h*.70);ctx.moveTo(w*.46,h*.50);ctx.lineTo(w*.30,h*.70);ctx.stroke();
      // Silo & Windmill
      ctx.fillStyle='#e8dfc8';rr(ctx,w*.60,h*.36,w*.10,h*.36,18);ctx.fill();
      ctx.fillStyle='#a8413a';ctx.beginPath();ctx.arc(w*.65,h*.37,w*.052,Math.PI,0);ctx.fill();
      // White picket fence
      ctx.fillStyle='#fff9eb';ctx.fillRect(0,h*.76,w,8);ctx.fillRect(0,h*.83,w,8);
      for(let i=0;i<16;i++)rr(ctx,w*(.02+i*.064),h*.72,w*.022,h*.16,4),ctx.fill();
      break;
    }
    case 'bakery':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#ffd6df'],[.55,'#fff0df'],[1,'#f6d9ba']]);ctx.fillRect(0,0,w,h);
      // Striped pastel wallpaper
      ctx.fillStyle='rgba(255,190,205,.25)';
      for(let i=0;i<12;i+=2)ctx.fillRect(i*w/12,0,w/12,h);
      // Bakery striped awning
      const aw=w/10;
      for(let i=0;i<10;i++){
        ctx.fillStyle=i%2?'#fffaf0':'#f07c92';
        ctx.beginPath();ctx.rect(i*aw,0,aw,h*.17);ctx.fill();
        ctx.beginPath();ctx.arc(i*aw+aw/2,h*.17,aw/2,0,Math.PI);ctx.fill();
      }
      // Display arch window & shelves
      ctx.fillStyle='#fffaf2';rr(ctx,w*.16,h*.28,w*.68,h*.48,28);ctx.fill();
      ctx.strokeStyle='#d69d6d';ctx.lineWidth=10;ctx.stroke();
      for(const sy of [h*.46,h*.61]){
        ctx.fillStyle='#d9a374';ctx.fillRect(w*.20,sy,w*.60,10);
      }
      // Cute cake silhouettes on shelf
      for(const [cx,cy,col] of [[w*.32,h*.44,'#ff9db0'],[w*.50,h*.44,'#f8d278'],[w*.68,h*.44,'#9ed8a8'],[w*.38,h*.59,'#d4a6e8'],[w*.62,h*.59,'#ffae80']]){
        ctx.fillStyle=col;rr(ctx,cx-34,cy-36,68,36,12);ctx.fill();
        ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(cx,cy-42,10,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#e84a5f';ctx.beginPath();ctx.arc(cx,cy-50,6,0,Math.PI*2);ctx.fill();
      }
      bunting(ctx,w*.06,h*.24,w*.94,h*.24,10,['#ff8fab','#ffd166','#a0e7e5','#c8b6ff'],22);
      break;
    }
    case 'fruit':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#76cdf4'],[.55,'#d4f2fa'],[1,'#eef6c2']]);ctx.fillRect(0,0,w,h);
      sunGlow(ctx,w*.82,h*.18,w*.058);
      cloud(ctx,w*.22,h*.17,w*.075);cloud(ctx,w*.54,h*.14,w*.065);
      hill(ctx,w,h,h*.63,h*.055,2.0,.3,'#98cf6a');
      hill(ctx,w,h,h*.73,h*.04,2.4,1.9,'#6fb451');
      // Orchard trees loaded with colorful fruits
      const trees=[[w*.18,h*.66,1,'#e84a43'],[w*.50,h*.62,1.15,'#ff9f2e'],[w*.82,h*.66,1,'#e84a43']];
      for(const [tx,ty,sc,fcol] of trees){
        ctx.fillStyle='#8c5c38';ctx.fillRect(tx-14*sc,ty-h*.18*sc,28*sc,h*.20*sc);
        ctx.fillStyle='#4f9e48';ctx.beginPath();ctx.arc(tx,ty-h*.24*sc,w*.095*sc,0,Math.PI*2);
        ctx.arc(tx-w*.06*sc,ty-h*.19*sc,w*.07*sc,0,Math.PI*2);ctx.arc(tx+w*.06*sc,ty-h*.19*sc,w*.07*sc,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=fcol;
        for(const [fx,fy] of [[-40,-20],[28,-38],[0,-8],[-18,-54],[42,-12]]){
          ctx.beginPath();ctx.arc(tx+fx*sc,ty-h*.20*sc+fy*sc,10*sc,0,Math.PI*2);ctx.fill();
        }
      }
      bunting(ctx,w*.18,h*.42,w*.82,h*.42,9,['#ff6b6b','#ffd93d','#6bcb77','#ff922b'],26);
      break;
    }
    case 'kitchen':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#f7e2be'],[.62,'#fff3dc'],[1,'#d4a272']]);ctx.fillRect(0,0,w,h);
      // Warm subway tile grid
      ctx.strokeStyle='rgba(195,155,112,.22)';ctx.lineWidth=2;
      for(let y=0;y<h*.68;y+=38){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
      for(let x=0;x<w;x+=76){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h*.68);ctx.stroke();}
      // Noren curtains
      for(let i=0;i<5;i++){
        ctx.fillStyle=i%2?'#365d7a':'#c94c3e';
        rr(ctx,w*(.08+i*.172),0,w*.155,h*.22,8);ctx.fill();
        ctx.fillStyle='#fff6df';ctx.beginPath();ctx.arc(w*(.157+i*.172),h*.12,w*.032,0,Math.PI*2);ctx.fill();
      }
      // Pendant lamps
      for(const lx of [w*.26,w*.50,w*.74]){
        ctx.strokeStyle='#5a4532';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(lx,h*.22);ctx.lineTo(lx,h*.33);ctx.stroke();
        sunGlow(ctx,lx,h*.38,w*.038,'#fff4be');
        ctx.fillStyle='#e38a42';ctx.beginPath();ctx.arc(lx,h*.36,w*.045,Math.PI,0);ctx.fill();
      }
      // Wooden counter
      ctx.fillStyle='#b87846';ctx.fillRect(0,h*.68,w,h*.32);
      ctx.fillStyle='#e3b17e';ctx.fillRect(0,h*.66,w,h*.04);
      break;
    }
    case 'bamboo':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#bfe8d4'],[.55,'#e5f7e8'],[1,'#8ac794']]);ctx.fillRect(0,0,w,h);
      sunGlow(ctx,w*.52,h*.24,w*.072,'#fff9dc');
      // Misty ink karst mountains
      hill(ctx,w,h,h*.54,h*.11,3.2,.5,'rgba(116,168,144,.42)');
      hill(ctx,w,h,h*.64,h*.08,2.6,1.7,'rgba(92,150,118,.58)');
      // Traditional pavilion roof
      ctx.fillStyle='#b84038';ctx.beginPath();ctx.moveTo(w*.34,h*.56);ctx.quadraticCurveTo(w*.50,h*.42,w*.66,h*.56);ctx.lineTo(w*.62,h*.59);ctx.lineTo(w*.38,h*.59);ctx.closePath();ctx.fill();
      ctx.fillStyle='#c94a42';ctx.fillRect(w*.41,h*.59,10,h*.16);ctx.fillRect(w*.58,h*.59,10,h*.16);
      // Tall bamboo stalks on left & right
      for(const [bx,bw,col] of [[w*.08,20,'#4f9e56'],[w*.14,15,'#64b868'],[w*.20,12,'#7ecc78'],[w*.80,12,'#7ecc78'],[w*.86,16,'#64b868'],[w*.92,22,'#4f9e56']]){
        ctx.fillStyle=col;ctx.fillRect(bx,0,bw,h);
        ctx.fillStyle='#d8f2c2';
        for(let y=h*.12;y<h;y+=h*.16)ctx.fillRect(bx-2,y,bw+4,4);
        ctx.fillStyle='#3c8c46';
        for(let y=h*.14;y<h*.72;y+=h*.18){
          ctx.beginPath();ctx.ellipse(bx+bw+20,y,24,7,-.35,0,Math.PI*2);ctx.fill();
          ctx.beginPath();ctx.ellipse(bx-16,y+12,22,6,.4,0,Math.PI*2);ctx.fill();
        }
      }
      // Red lanterns
      for(const lx of [w*.38,w*.62]){
        ctx.fillStyle='#e33b35';ctx.beginPath();ctx.ellipse(lx,h*.63,16,20,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#f4c84c';ctx.fillRect(lx-8,h*.60,16,5);ctx.fillRect(lx-8,h*.655,16,5);
      }
      break;
    }
    case 'insect':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#a2e0b4'],[.5,'#e3f7c8'],[1,'#78be66']]);ctx.fillRect(0,0,w,h);
      sunGlow(ctx,w*.50,h*.18,w*.065,'#fffad2');
      // Soft bokeh sparkles
      for(let i=0;i<18;i++){
        ctx.fillStyle='rgba(255,253,220,.38)';
        ctx.beginPath();ctx.arc(w*(.08+(i*19%86)/100),h*(.12+(i*23%54)/100),10+(i%4)*7,0,Math.PI*2);ctx.fill();
      }
      // Giant macro flowers & clover stems
      const flowers=[[w*.18,h*.42,52,'#ff8fab'],[w*.52,h*.36,44,'#ffd166'],[w*.82,h*.44,54,'#b8a9ff']];
      for(const [fx,fy,fr,col] of flowers){
        ctx.strokeStyle='#4c9a4a';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(fx,h);ctx.quadraticCurveTo(fx-14,h*.72,fx,fy);ctx.stroke();
        ctx.fillStyle=col;
        for(let p=0;p<6;p++){
          const a=p*Math.PI/3;
          ctx.beginPath();ctx.arc(fx+Math.cos(a)*fr*.62,fy+Math.sin(a)*fr*.62,fr*.46,0,Math.PI*2);ctx.fill();
        }
        ctx.fillStyle='#ffcb47';ctx.beginPath();ctx.arc(fx,fy,fr*.38,0,Math.PI*2);ctx.fill();
      }
      hill(ctx,w,h,h*.76,h*.04,3.2,.4,'#5aa852');
      break;
    }
    case 'safari':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#e87a42'],[.46,'#f8b962'],[.76,'#fce194'],[1,'#c9964c']]);ctx.fillRect(0,0,w,h);
      sunGlow(ctx,w*.50,h*.44,w*.10,'#fff5c4');
      hill(ctx,w,h,h*.64,h*.04,2.4,.5,'#d49b4e');
      hill(ctx,w,h,h*.74,h*.035,1.8,1.5,'#b8823c');
      // Acacia trees
      for(const [ax,ay,sc] of [[w*.18,h*.70,1.05],[w*.82,h*.72,.92]]){
        ctx.strokeStyle='#543c24';ctx.lineWidth=14*sc;ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(ax,ay-h*.22*sc);ctx.stroke();
        ctx.lineWidth=8*sc;ctx.beginPath();ctx.moveTo(ax,ay-h*.14*sc);ctx.lineTo(ax-55*sc,ay-h*.22*sc);ctx.moveTo(ax,ay-h*.16*sc);ctx.lineTo(ax+58*sc,ay-h*.23*sc);ctx.stroke();
        ctx.fillStyle='#4c6b36';ctx.beginPath();ctx.ellipse(ax,ay-h*.24*sc,108*sc,24*sc,0,0,Math.PI*2);ctx.fill();
      }
      break;
    }
    case 'polar':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#173257'],[.42,'#2a5c88'],[.76,'#8fd0ec'],[1,'#dff6ff']]);ctx.fillRect(0,0,w,h);
      stars(ctx,w,h*.46,55,19);
      // Aurora borealis ribbons
      for(const [y0,col] of [[h*.18,'rgba(92,240,185,.34)'],[h*.26,'rgba(148,155,255,.28)'],[h*.32,'rgba(115,245,235,.26)']]){
        ctx.strokeStyle=col;ctx.lineWidth=42;ctx.lineCap='round';ctx.beginPath();
        ctx.moveTo(w*.05,y0);ctx.bezierCurveTo(w*.32,y0-58,w*.68,y0+58,w*.96,y0-20);ctx.stroke();
      }
      // Icebergs
      ctx.fillStyle='#c8edfa';
      for(const [ix,iw,ih] of [[w*.14,w*.24,h*.28],[w*.54,w*.32,h*.34],[w*.84,w*.22,h*.24]]){
        ctx.beginPath();ctx.moveTo(ix-iw/2,h*.72);ctx.lineTo(ix-iw*.15,h*.72-ih);ctx.lineTo(ix+iw*.18,h*.72-ih*.82);ctx.lineTo(ix+iw/2,h*.72);ctx.closePath();ctx.fill();
      }
      ctx.fillStyle='#4aa0c8';ctx.fillRect(0,h*.71,w,h*.29);
      ctx.fillStyle='#eefaff';hill(ctx,w,h,h*.78,h*.03,2.6,.4,'#eefaff');
      break;
    }
    case 'castle':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#8fa4f2'],[.48,'#e3c0f7'],[.82,'#ffe4df'],[1,'#b5dfa8']]);ctx.fillRect(0,0,w,h);
      // Rainbow arc
      const rcols=['#ff8ba7','#ffd166','#9be5aa','#8ecae6','#c8b6ff'];
      rcols.forEach((col,i)=>{
        ctx.strokeStyle=col;ctx.lineWidth=14;ctx.globalAlpha=.55;
        ctx.beginPath();ctx.arc(w*.50,h*.72,w*.42-i*14,Math.PI,0);ctx.stroke();
      });
      ctx.globalAlpha=1;
      cloud(ctx,w*.16,h*.22,w*.075);cloud(ctx,w*.84,h*.20,w*.07);
      // Fairytale castle spires
      const towers=[[w*.32,h*.38,w*.075,h*.34],[w*.50,h*.25,w*.10,h*.47],[w*.68,h*.38,w*.075,h*.34]];
      for(const [tx,ty,tw,th] of towers){
        ctx.fillStyle='#fff6fa';rr(ctx,tx-tw/2,ty,tw,th,6);ctx.fill();
        ctx.fillStyle='#8c7be8';ctx.beginPath();ctx.moveTo(tx-tw*.66,ty+4);ctx.lineTo(tx,ty-tw*1.15);ctx.lineTo(tx+tw*.66,ty+4);ctx.closePath();ctx.fill();
        ctx.fillStyle='#ff8cb8';ctx.beginPath();ctx.moveTo(tx,ty-tw*1.15);ctx.lineTo(tx+28,ty-tw*1.02);ctx.lineTo(tx,ty-tw*.90);ctx.closePath();ctx.fill();
      }
      ctx.fillStyle='#fcebf4';rr(ctx,w*.34,h*.48,w*.32,h*.25,8);ctx.fill();
      ctx.fillStyle='#6d5ca8';ctx.beginPath();ctx.arc(w*.50,h*.73,w*.045,Math.PI,0);ctx.fill();
      hill(ctx,w,h,h*.74,h*.04,2.0,.2,'#93cf8d');
      stars(ctx,w,h*.38,24,41);
      break;
    }
    case 'pirate':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#48a8de'],[.48,'#9ee3f7'],[.66,'#fce6b3'],[1,'#2997b8']]);ctx.fillRect(0,0,w,h);
      sunGlow(ctx,w*.20,h*.20,w*.06);
      cloud(ctx,w*.56,h*.17,w*.08);cloud(ctx,w*.84,h*.22,w*.065);
      // Turquoise sea
      ctx.fillStyle='#2495b5';ctx.fillRect(0,h*.62,w,h*.38);
      // Distant pirate ship
      ctx.fillStyle='#6b4226';ctx.beginPath();ctx.moveTo(w*.66,h*.60);ctx.lineTo(w*.84,h*.60);ctx.lineTo(w*.80,h*.66);ctx.lineTo(w*.69,h*.66);ctx.closePath();ctx.fill();
      ctx.fillStyle='#fff6e2';ctx.beginPath();ctx.moveTo(w*.74,h*.42);ctx.lineTo(w*.81,h*.57);ctx.lineTo(w*.69,h*.57);ctx.closePath();ctx.fill();
      // Treasure island & palm tree
      ctx.fillStyle='#f4cf7a';ctx.beginPath();ctx.ellipse(w*.28,h*.72,w*.26,h*.12,0,Math.PI,0);ctx.fill();
      ctx.strokeStyle='#8c5a32';ctx.lineWidth=14;ctx.beginPath();ctx.moveTo(w*.22,h*.64);ctx.quadraticCurveTo(w*.16,h*.46,w*.26,h*.34);ctx.stroke();
      ctx.fillStyle='#3f994a';
      for(let a=0;a<5;a++){const ang=a*.95-2.2;ctx.beginPath();ctx.ellipse(w*.26+Math.cos(ang)*46,h*.34+Math.sin(ang)*22,48,13,ang,0,Math.PI*2);ctx.fill();}
      // Waves
      ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=5;
      for(let i=0;i<5;i++){ctx.beginPath();ctx.arc(w*(.15+i*.18),h*.76,w*.07,Math.PI*.15,Math.PI*.85);ctx.stroke();}
      break;
    }
    case 'robot':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#1f3154'],[.52,'#355380'],[1,'#567ba6']]);ctx.fillRect(0,0,w,h);
      // Futuristic perspective blueprint grid
      ctx.strokeStyle='rgba(122,235,255,.20)';ctx.lineWidth=2;
      for(let x=0;x<=w;x+=w/10){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
      for(let y=0;y<=h;y+=h/8){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
      // Glowing energy ring portal
      ctx.strokeStyle='#6cf0ff';ctx.lineWidth=14;ctx.beginPath();ctx.arc(w*.50,h*.46,w*.18,0,Math.PI*2);ctx.stroke();
      ctx.strokeStyle='rgba(108,240,255,.35)';ctx.lineWidth=28;ctx.beginPath();ctx.arc(w*.50,h*.46,w*.21,0,Math.PI*2);ctx.stroke();
      // Hangar side columns
      for(const sx of [w*.10,w*.82]){
        ctx.fillStyle='#3b5170';rr(ctx,sx,h*.14,w*.08,h*.64,10);ctx.fill();
        ctx.fillStyle='#72f4ff';for(let j=0;j<4;j++)rr(ctx,sx+w*.02,h*(.20+j*.13),w*.04,h*.06,5),ctx.fill();
      }
      ctx.fillStyle='#304663';ctx.fillRect(0,h*.74,w,h*.26);
      break;
    }
    case 'music':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#462c6e'],[.52,'#7c4d9e'],[1,'#e89c6a']]);ctx.fillRect(0,0,w,h);
      // Warm stage spotlights
      for(const [sx,ang] of [[w*.22,.28],[w*.50,0],[w*.78,-.28]]){
        ctx.fillStyle='rgba(255,235,165,.20)';ctx.beginPath();ctx.moveTo(sx,0);ctx.lineTo(sx-w*.16+ang*w*.3,h*.82);ctx.lineTo(sx+w*.16+ang*w*.3,h*.82);ctx.closePath();ctx.fill();
      }
      // Red stage curtains
      ctx.fillStyle='#b83244';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(w*.18,0);ctx.quadraticCurveTo(w*.12,h*.42,w*.06,h*.76);ctx.lineTo(0,h*.76);ctx.closePath();ctx.fill();
      ctx.beginPath();ctx.moveTo(w,0);ctx.lineTo(w*.82,0);ctx.quadraticCurveTo(w*.88,h*.42,w*.94,h*.76);ctx.lineTo(w,h*.76);ctx.closePath();ctx.fill();
      // Floating musical notes
      ctx.fillStyle='#ffe28a';ctx.font=`900 ${Math.round(h*.09)}px sans-serif`;ctx.textAlign='center';
      for(const [nx,ny,ch] of [[w*.28,h*.36,'♪'],[w*.44,h*.26,'♫'],[w*.62,h*.38,'♪'],[w*.74,h*.27,'♫']]){
        ctx.fillText(ch,nx,ny);
      }
      // Stage wood floor
      ctx.fillStyle='#b87747';ctx.fillRect(0,h*.74,w,h*.26);
      ctx.fillStyle='#ffd27d';for(let i=0;i<9;i++){ctx.beginPath();ctx.arc(w*(.10+i*.10),h*.75,8,0,Math.PI*2);ctx.fill();}
      break;
    }
    case 'sports':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#4aa6e8'],[.5,'#aee0fa'],[1,'#6fc267']]);ctx.fillRect(0,0,w,h);
      sunGlow(ctx,w*.82,h*.17,w*.052);
      cloud(ctx,w*.24,h*.16,w*.075);cloud(ctx,w*.56,h*.14,w*.065);
      // Stadium stands
      ctx.fillStyle='#d8e4ed';ctx.beginPath();ctx.moveTo(0,h*.68);ctx.lineTo(0,h*.44);ctx.quadraticCurveTo(w*.5,h*.34,w,h*.44);ctx.lineTo(w,h*.68);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#9cb3c4';ctx.lineWidth=4;
      for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(0,h*(.50+i*.045));ctx.quadraticCurveTo(w*.5,h*(.42+i*.045),w,h*(.50+i*.045));ctx.stroke();}
      // Floodlights
      for(const fx of [w*.16,w*.84]){
        ctx.fillStyle='#5c6e7e';ctx.fillRect(fx-6,h*.18,12,h*.28);
        ctx.fillStyle='#fffbe0';rr(ctx,fx-28,h*.14,56,24,6);ctx.fill();
      }
      // Green soccer pitch stripes
      ctx.fillStyle='#5ab356';ctx.fillRect(0,h*.66,w,h*.34);
      ctx.fillStyle='#6ac464';for(let i=0;i<10;i+=2)ctx.fillRect(i*w/10,h*.66,w/10,h*.34);
      ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.strokeRect(w*.34,h*.54,w*.32,h*.14);
      bunting(ctx,w*.05,h*.36,w*.95,h*.36,11,['#ff6b6b','#ffd93d','#4d96ff','#6bcb77'],18);
      break;
    }
    case 'camp':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#17284a'],[.45,'#2a4a75'],[.82,'#537c8a'],[1,'#345746']]);ctx.fillRect(0,0,w,h);
      stars(ctx,w,h*.52,65,29);
      // Crescent moon
      ctx.fillStyle='#fff4b8';ctx.beginPath();ctx.arc(w*.78,h*.20,w*.052,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#203962';ctx.beginPath();ctx.arc(w*.805,h*.185,w*.046,0,Math.PI*2);ctx.fill();
      hill(ctx,w,h,h*.60,h*.07,2.4,.5,'#2f524a');
      // Pine silhouettes
      for(const [px,py,pw,ph] of [[w*.10,h*.74,w*.12,h*.28],[w*.22,h*.72,w*.10,h*.22],[w*.78,h*.72,w*.10,h*.24],[w*.90,h*.74,w*.13,h*.30]]){
        pine(ctx,px,py,pw,ph,'#23423a');
      }
      // Glowing triangle tent & warm campfire glow
      sunGlow(ctx,w*.50,h*.66,w*.07,'#ffcf70','rgba(255,155,62,0)');
      ctx.fillStyle='#e8823c';ctx.beginPath();ctx.moveTo(w*.36,h*.74);ctx.lineTo(w*.50,h*.48);ctx.lineTo(w*.64,h*.74);ctx.closePath();ctx.fill();
      ctx.fillStyle='#ffe89c';ctx.beginPath();ctx.moveTo(w*.45,h*.74);ctx.lineTo(w*.50,h*.58);ctx.lineTo(w*.55,h*.74);ctx.closePath();ctx.fill();
      break;
    }
    case 'circus':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#5485cf'],[.52,'#a7cff4'],[1,'#f8d99a']]);ctx.fillRect(0,0,w,h);
      sunGlow(ctx,w*.50,h*.32,w*.09,'#fff7c8');
      // Giant striped Big Top circus tent
      ctx.save();ctx.beginPath();ctx.moveTo(w*.14,h*.74);ctx.lineTo(w*.22,h*.46);ctx.lineTo(w*.50,h*.18);ctx.lineTo(w*.78,h*.46);ctx.lineTo(w*.86,h*.74);ctx.closePath();ctx.clip();
      for(let i=0;i<10;i++){ctx.fillStyle=i%2?'#fff6de':'#e04343';ctx.fillRect(w*(.12+i*.076),h*.16,w*.076,h*.60);}
      ctx.restore();
      ctx.fillStyle='#f4c23d';ctx.beginPath();ctx.moveTo(w*.50,h*.18);ctx.lineTo(w*.56,h*.13);ctx.lineTo(w*.50,h*.10);ctx.closePath();ctx.fill();
      // Tent archway
      ctx.fillStyle='#3d243b';ctx.beginPath();ctx.arc(w*.50,h*.74,w*.075,Math.PI,0);ctx.fill();
      bunting(ctx,w*.04,h*.28,w*.96,h*.28,12,['#ff595e','#ffca3a','#8ac926','#1982c4'],30);
      ctx.fillStyle='#e3b268';ctx.fillRect(0,h*.74,w,h*.26);
      break;
    }
    case 'amusement':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#5d79cf'],[.44,'#f5a4b8'],[.76,'#ffe1a8'],[1,'#a7d89c']]);ctx.fillRect(0,0,w,h);
      sunGlow(ctx,w*.20,h*.34,w*.065,'#fff4c2');
      // Soft fireworks sparkles
      for(const [fx,fy,col] of [[w*.20,h*.20,'#ffe47a'],[w*.80,h*.22,'#9bf6ff']]){
        ctx.strokeStyle=col;ctx.lineWidth=3;
        for(let a=0;a<10;a++){const ang=a*Math.PI/5;ctx.beginPath();ctx.moveTo(fx+Math.cos(ang)*10,fy+Math.sin(ang)*10);ctx.lineTo(fx+Math.cos(ang)*36,fy+Math.sin(ang)*36);ctx.stroke();}
      }
      // Giant Ferris Wheel
      const wx=w*.52,wy=h*.45,wr=h*.27;
      ctx.strokeStyle='#fff7e0';ctx.lineWidth=6;ctx.beginPath();ctx.arc(wx,wy,wr,0,Math.PI*2);ctx.stroke();
      ctx.lineWidth=3;
      for(let i=0;i<12;i++){
        const a=i*Math.PI/6,gx=wx+Math.cos(a)*wr,gy=wy+Math.sin(a)*wr;
        ctx.beginPath();ctx.moveTo(wx,wy);ctx.lineTo(gx,gy);ctx.stroke();
        ctx.fillStyle=['#ff6b8b','#ffd166','#63d2ff','#98e882'][i%4];
        rr(ctx,gx-10,gy-6,20,16,5);ctx.fill();
      }
      ctx.strokeStyle='#e8edf2';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(wx,wy);ctx.lineTo(wx-wr*.45,h*.76);ctx.moveTo(wx,wy);ctx.lineTo(wx+wr*.45,h*.76);ctx.stroke();
      // Roller coaster track wave
      ctx.strokeStyle='#ff708d';ctx.lineWidth=6;ctx.beginPath();
      ctx.moveTo(0,h*.68);ctx.bezierCurveTo(w*.18,h*.48,w*.30,h*.72,w*.44,h*.62);
      ctx.bezierCurveTo(w*.62,h*.50,w*.78,h*.44,w,h*.66);ctx.stroke();
      hill(ctx,w,h,h*.75,h*.03,2.2,.5,'#89ca84');
      break;
    }
    case 'airport':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#4aa2e6'],[.55,'#b8e4fa'],[1,'#d4e0e8']]);ctx.fillRect(0,0,w,h);
      sunGlow(ctx,w*.84,h*.18,w*.052);
      cloud(ctx,w*.20,h*.18,w*.08);cloud(ctx,w*.56,h*.14,w*.07);
      // Terminal building + glass concourse + control tower
      ctx.fillStyle='#e8eff5';rr(ctx,w*.12,h*.48,w*.54,h*.26,14);ctx.fill();
      ctx.fillStyle='#7ec4ea';rr(ctx,w*.16,h*.54,w*.46,h*.14,8);ctx.fill();
      ctx.fillStyle='#dce6ee';rr(ctx,w*.74,h*.26,w*.07,h*.48,6);ctx.fill();
      ctx.fillStyle='#2f74b8';rr(ctx,w*.69,h*.18,w*.17,h*.12,10);ctx.fill();
      ctx.fillStyle='#9ee0fa';rr(ctx,w*.71,h*.21,w*.13,h*.06,4);ctx.fill();
      // Distant airplane taking off
      ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(w*.38,h*.26,w*.07,h*.022,-.18,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#ef5a52';ctx.beginPath();ctx.moveTo(w*.32,h*.27);ctx.lineTo(w*.30,h*.22);ctx.lineTo(w*.35,h*.26);ctx.closePath();ctx.fill();
      // Runway tarmac & dashed centerline
      ctx.fillStyle='#5c6c78';ctx.fillRect(0,h*.72,w,h*.28);
      ctx.fillStyle='#fff6d8';for(let i=0;i<8;i++)ctx.fillRect(w*(.04+i*.13),h*.82,w*.07,8);
      break;
    }
    case 'hospital':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#76c4ec'],[.55,'#d4f0fa'],[1,'#a8db9a']]);ctx.fillRect(0,0,w,h);
      sunGlow(ctx,w*.18,h*.18,w*.052);cloud(ctx,w*.74,h*.16,w*.075);
      hill(ctx,w,h,h*.70,h*.03,2.0,.4,'#8ec984');
      // Friendly bright white clinic with red cross emblem
      ctx.fillStyle='#fffaf2';rr(ctx,w*.20,h*.30,w*.60,h*.44,18);ctx.fill();
      ctx.fillStyle='#4aa4d8';rr(ctx,w*.18,h*.27,w*.64,h*.06,12);ctx.fill();
      // Red cross badge
      ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(w*.50,h*.42,w*.065,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#e64545';ctx.fillRect(w*.50-w*.042,h*.42-h*.018,w*.084,h*.036);ctx.fillRect(w*.50-w*.015,h*.42-h*.050,w*.030,h*.10);
      // Windows & arched entrance
      ctx.fillStyle='#a8dff5';
      for(const wx of [w*.26,w*.35,w*.60,w*.69])for(const wy of [h*.38,h*.52])rr(ctx,wx,wy,w*.06,h*.09,6),ctx.fill();
      ctx.fillStyle='#6ac2b8';ctx.beginPath();ctx.arc(w*.50,h*.74,w*.065,Math.PI,0);ctx.fill();
      ctx.fillStyle='#d4e2e6';ctx.fillRect(0,h*.74,w,h*.26);
      break;
    }
    case 'firehouse':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#69b4e8'],[.55,'#c8e6f7'],[1,'#e6d9c2']]);ctx.fillRect(0,0,w,h);
      sunGlow(ctx,w*.82,h*.18,w*.055);cloud(ctx,w*.24,h*.16,w*.075);
      // Red brick firehouse + bell tower
      ctx.fillStyle='#c9423a';rr(ctx,w*.16,h*.32,w*.68,h*.44,12);ctx.fill();
      ctx.fillStyle='#a8322c';rr(ctx,w*.42,h*.16,w*.16,h*.20,8);ctx.fill();
      ctx.fillStyle='#f4c842';ctx.beginPath();ctx.arc(w*.50,h*.26,w*.035,0,Math.PI*2);ctx.fill();
      // Two wide garage bays
      for(const gx of [w*.24,w*.54]){
        ctx.fillStyle='#3c4a58';rr(ctx,gx,h*.50,w*.22,h*.26,10);ctx.fill();
        ctx.fillStyle='#f2ede0';ctx.fillRect(gx+8,h*.52,w*.22-16,h*.05);
      }
      ctx.fillStyle='#6c7882';ctx.fillRect(0,h*.74,w,h*.26);
      break;
    }
    case 'harbor':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#54a8e2'],[.52,'#b8e4f7'],[.64,'#2d82b5'],[1,'#4d6b80']]);ctx.fillRect(0,0,w,h);
      sunGlow(ctx,w*.18,h*.18,w*.055);cloud(ctx,w*.52,h*.16,w*.08);
      // Striped lighthouse on headland
      ctx.fillStyle='#fffaf0';ctx.beginPath();ctx.moveTo(w*.14,h*.62);ctx.lineTo(w*.17,h*.28);ctx.lineTo(w*.23,h*.28);ctx.lineTo(w*.26,h*.62);ctx.closePath();ctx.fill();
      ctx.fillStyle='#df433b';ctx.fillRect(w*.16,h*.36,w*.08,h*.08);ctx.fillRect(w*.15,h*.50,w*.10,h*.08);
      ctx.fillStyle='#ffd662';ctx.beginPath();ctx.arc(w*.20,h*.24,w*.032,0,Math.PI*2);ctx.fill();
      // Port gantry crane + colorful container stack
      ctx.strokeStyle='#357ac0';ctx.lineWidth=10;ctx.strokeRect(w*.66,h*.28,w*.16,h*.36);
      ctx.beginPath();ctx.moveTo(w*.52,h*.30);ctx.lineTo(w*.92,h*.30);ctx.stroke();
      const cols=['#e3544a','#3894d6','#f2b832','#46a868'];
      for(let i=0;i<4;i++){ctx.fillStyle=cols[i];rr(ctx,w*(.48+i*.095),h*.54,w*.088,h*.09,4);ctx.fill();}
      ctx.fillStyle='#2a7eb0';ctx.fillRect(0,h*.62,w,h*.16);
      ctx.fillStyle='#7c8a94';ctx.fillRect(0,h*.75,w,h*.25);
      break;
    }
    case 'school':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#69c0ee'],[.52,'#cceef9'],[1,'#a6d482']]);ctx.fillRect(0,0,w,h);
      sunGlow(ctx,w*.84,h*.18,w*.052);cloud(ctx,w*.24,h*.16,w*.075);
      hill(ctx,w,h,h*.68,h*.035,2.0,.3,'#88c46e');
      // Cheerful yellow & brick schoolhouse with clock gable
      ctx.fillStyle='#f6d99a';rr(ctx,w*.18,h*.38,w*.64,h*.36,12);ctx.fill();
      ctx.fillStyle='#d45a4a';ctx.beginPath();ctx.moveTo(w*.14,h*.40);ctx.lineTo(w*.50,h*.18);ctx.lineTo(w*.86,h*.40);ctx.closePath();ctx.fill();
      ctx.fillStyle='#fff9e8';ctx.beginPath();ctx.arc(w*.50,h*.32,w*.045,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#2c3b4a';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(w*.50,h*.32);ctx.lineTo(w*.50,h*.285);ctx.moveTo(w*.50,h*.32);ctx.lineTo(w*.525,h*.33);ctx.stroke();
      ctx.fillStyle='#96d8f2';
      for(const wx of [w*.24,w*.34,w*.60,w*.70])rr(ctx,wx,h*.48,w*.065,h*.12,6),ctx.fill();
      ctx.fillStyle='#8c5834';rr(ctx,w*.45,h*.54,w*.10,h*.20,8);ctx.fill();
      bunting(ctx,w*.08,h*.28,w*.92,h*.28,10,['#ff6b6b','#ffd93d','#6bcb77','#4d96ff'],24);
      break;
    }
    case 'festival':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#7a1f2d'],[.48,'#c83c38'],[.82,'#f08e46'],[1,'#e6c086']]);ctx.fillRect(0,0,w,h);
      // Golden fireworks bursts
      for(const [fx,fy,col] of [[w*.22,h*.20,'#ffe47a'],[w*.78,h*.18,'#ffb870'],[w*.50,h*.15,'#fff2a6']]){
        ctx.strokeStyle=col;ctx.lineWidth=4;
        for(let a=0;a<12;a++){const ang=a*Math.PI/6;ctx.beginPath();ctx.moveTo(fx+Math.cos(ang)*10,fy+Math.sin(ang)*10);ctx.lineTo(fx+Math.cos(ang)*42,fy+Math.sin(ang)*42);ctx.stroke();}
      }
      // Traditional festive archway
      ctx.fillStyle='#b82c2c';ctx.fillRect(w*.22,h*.38,18,h*.38);ctx.fillRect(w*.76,h*.38,18,h*.38);
      ctx.fillStyle='#e6b83c';ctx.beginPath();ctx.moveTo(w*.14,h*.42);ctx.quadraticCurveTo(w*.50,h*.26,w*.86,h*.42);ctx.lineTo(w*.82,h*.46);ctx.lineTo(w*.18,h*.46);ctx.closePath();ctx.fill();
      // Hanging red lanterns
      for(const lx of [w*.16,w*.34,w*.50,w*.66,w*.84]){
        ctx.fillStyle='#ee3832';ctx.beginPath();ctx.ellipse(lx,h*.52,22,28,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#f6ca44';ctx.fillRect(lx-10,h*.48,20,6);ctx.fillRect(lx-10,h*.55,20,6);
      }
      ctx.fillStyle='#d4a062';ctx.fillRect(0,h*.74,w,h*.26);
      break;
    }
    case 'egypt':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#f2883e'],[.48,'#fac86e'],[.80,'#fce49e'],[1,'#d4a254']]);ctx.fillRect(0,0,w,h);
      sunGlow(ctx,w*.50,h*.28,w*.09,'#fff5c0');
      // Three Great Pyramids
      ctx.fillStyle='#d9a44c';
      ctx.beginPath();ctx.moveTo(w*.04,h*.72);ctx.lineTo(w*.24,h*.34);ctx.lineTo(w*.44,h*.72);ctx.closePath();ctx.fill();
      ctx.beginPath();ctx.moveTo(w*.34,h*.72);ctx.lineTo(w*.62,h*.24);ctx.lineTo(w*.90,h*.72);ctx.closePath();ctx.fill();
      ctx.fillStyle='#b88234';
      ctx.beginPath();ctx.moveTo(w*.62,h*.24);ctx.lineTo(w*.90,h*.72);ctx.lineTo(w*.70,h*.72);ctx.closePath();ctx.fill();
      hill(ctx,w,h,h*.74,h*.04,2.4,.6,'#e2b25c');
      break;
    }
    case 'sakura':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#8cc6f2'],[.52,'#ffdce8'],[1,'#f2c8d4']]);ctx.fillRect(0,0,w,h);
      sunGlow(ctx,w*.50,h*.36,w*.09,'#fff4df');
      // Distant Mt. Fuji
      ctx.fillStyle='#7292c4';ctx.beginPath();ctx.moveTo(w*.20,h*.68);ctx.lineTo(w*.44,h*.32);ctx.lineTo(w*.56,h*.32);ctx.lineTo(w*.80,h*.68);ctx.closePath();ctx.fill();
      ctx.fillStyle='#fffaf6';ctx.beginPath();ctx.moveTo(w*.44,h*.32);ctx.lineTo(w*.56,h*.32);ctx.lineTo(w*.60,h*.42);ctx.lineTo(w*.50,h*.38);ctx.lineTo(w*.40,h*.42);ctx.closePath();ctx.fill();
      // Vermilion Torii gate + cherry blossom canopy
      ctx.fillStyle='#de4336';ctx.fillRect(w*.38,h*.50,14,h*.26);ctx.fillRect(w*.60,h*.50,14,h*.26);
      ctx.fillRect(w*.30,h*.48,w*.40,14);ctx.fillRect(w*.34,h*.55,w*.32,10);
      for(const [cx,cy,cr] of [[w*.12,h*.28,74],[w*.22,h*.22,56],[w*.86,h*.26,78],[w*.76,h*.20,54]]){
        ctx.fillStyle='rgba(255,176,204,.88)';ctx.beginPath();ctx.arc(cx,cy,cr,0,Math.PI*2);ctx.fill();
      }
      hill(ctx,w,h,h*.74,h*.03,2.2,.4,'#b8d89c');
      break;
    }
    case 'desert':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#e87842'],[.48,'#f8ba68'],[.80,'#f4d898'],[1,'#c88848']]);ctx.fillRect(0,0,w,h);
      sunGlow(ctx,w*.78,h*.24,w*.068,'#fff4c2');
      // Red-rock mesas
      ctx.fillStyle='#c46642';
      ctx.beginPath();ctx.moveTo(w*.06,h*.68);ctx.lineTo(w*.12,h*.40);ctx.lineTo(w*.32,h*.40);ctx.lineTo(w*.38,h*.68);ctx.closePath();ctx.fill();
      ctx.beginPath();ctx.moveTo(w*.62,h*.68);ctx.lineTo(w*.68,h*.44);ctx.lineTo(w*.88,h*.44);ctx.lineTo(w*.94,h*.68);ctx.closePath();ctx.fill();
      // Saguaro cacti silhouettes
      for(const [cx,cy,sc] of [[w*.20,h*.74,1],[w*.82,h*.74,.85]]){
        ctx.fillStyle='#4a8c4a';rr(ctx,cx-10*sc,cy-110*sc,20*sc,110*sc,10*sc);ctx.fill();
        rr(ctx,cx-36*sc,cy-78*sc,28*sc,14*sc,7*sc);ctx.fill();rr(ctx,cx-36*sc,cy-100*sc,14*sc,34*sc,7*sc);ctx.fill();
        rr(ctx,cx+8*sc,cy-64*sc,28*sc,14*sc,7*sc);ctx.fill();rr(ctx,cx+22*sc,cy-88*sc,14*sc,36*sc,7*sc);ctx.fill();
      }
      hill(ctx,w,h,h*.72,h*.04,2.0,.8,'#d49452');
      break;
    }
    case 'aquarium':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#17588c'],[.48,'#2684b8'],[.82,'#4cb8d6'],[1,'#226a96']]);ctx.fillRect(0,0,w,h);
      // Underwater glass tunnel ribs & sunbeams
      for(const bx of [w*.24,w*.52,w*.78]){
        ctx.fillStyle='rgba(170,242,255,.14)';ctx.beginPath();ctx.moveTo(bx,0);ctx.lineTo(bx-80,h*.78);ctx.lineTo(bx+80,h*.78);ctx.closePath();ctx.fill();
      }
      ctx.strokeStyle='rgba(205,244,255,.32)';ctx.lineWidth=14;
      ctx.beginPath();ctx.arc(w*.50,h*.82,w*.46,Math.PI,0);ctx.stroke();
      ctx.beginPath();ctx.arc(w*.50,h*.82,w*.32,Math.PI,0);ctx.stroke();
      // Rising bubbles & kelp silhouettes
      ctx.fillStyle='rgba(220,250,255,.45)';
      for(let i=0;i<18;i++){ctx.beginPath();ctx.arc(w*(.08+(i*19%84)/100),h*(.12+(i*29%60)/100),5+(i%4)*5,0,Math.PI*2);ctx.fill();}
      ctx.fillStyle='#2a9478';
      for(const kx of [w*.10,w*.16,w*.84,w*.90]){ctx.beginPath();ctx.ellipse(kx,h*.68,14,90,.08,0,Math.PI*2);ctx.fill();}
      break;
    }
    case 'artstudio':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#fff6e6'],[.65,'#faecd2'],[1,'#d8b48c']]);ctx.fillRect(0,0,w,h);
      // Big sunlit studio window + colorful framed paintings
      ctx.fillStyle='#b8e4f7';rr(ctx,w*.34,h*.14,w*.32,h*.38,14);ctx.fill();
      ctx.strokeStyle='#a87c4f';ctx.lineWidth=10;ctx.stroke();
      ctx.beginPath();ctx.moveTo(w*.50,h*.14);ctx.lineTo(w*.50,h*.52);ctx.moveTo(w*.34,h*.33);ctx.lineTo(w*.66,h*.33);ctx.stroke();
      for(const [fx,fy,col] of [[w*.10,h*.24,'#ff8fab'],[w*.74,h*.24,'#ffd166'],[w*.12,h*.50,'#72d6c8'],[w*.72,h*.50,'#b8a4ff']]){
        ctx.fillStyle='#fff';rr(ctx,fx,fy,w*.14,h*.18,8);ctx.fill();
        ctx.fillStyle=col;rr(ctx,fx+10,fy+10,w*.14-20,h*.18-20,4);ctx.fill();
      }
      bunting(ctx,w*.04,h*.12,w*.96,h*.12,11,['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#c77dff'],20);
      ctx.fillStyle='#c49566';ctx.fillRect(0,h*.74,w,h*.26);
      break;
    }
    case 'icecreamshop':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#c4f2ee'],[.52,'#fff3e6'],[1,'#ffd6e4']]);ctx.fillRect(0,0,w,h);
      // Mint & pink parlor awning
      const aw=w/10;
      for(let i=0;i<10;i++){
        ctx.fillStyle=i%2?'#ff98b6':'#7ad8cc';
        ctx.fillRect(i*aw,0,aw,h*.17);
        ctx.beginPath();ctx.arc(i*aw+aw/2,h*.17,aw/2,0,Math.PI);ctx.fill();
      }
      // Giant ice cream cone sign & pastel parlor counter
      ctx.fillStyle='#fffaf2';rr(ctx,w*.20,h*.28,w*.60,h*.44,24);ctx.fill();
      ctx.strokeStyle='#ff98b6';ctx.lineWidth=8;ctx.stroke();
      ctx.fillStyle='#e3a058';ctx.beginPath();ctx.moveTo(w*.45,h*.54);ctx.lineTo(w*.55,h*.54);ctx.lineTo(w*.50,h*.68);ctx.closePath();ctx.fill();
      ctx.fillStyle='#ff8eb0';ctx.beginPath();ctx.arc(w*.48,h*.48,34,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#8ae6c4';ctx.beginPath();ctx.arc(w*.53,h*.46,32,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fff3c4';ctx.beginPath();ctx.arc(w*.50,h*.38,28,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#f4b8c8';ctx.fillRect(0,h*.74,w,h*.26);
      break;
    }
    case 'petshop':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#ffe4b8'],[.55,'#fff6e2'],[1,'#e6c89c']]);ctx.fillRect(0,0,w,h);
      // Cozy cafe wall with paw-print wallpaper & cat shelves
      ctx.fillStyle='rgba(218,162,104,.24)';
      for(let i=0;i<10;i++){
        const px=w*(.08+(i%5)*.21),py=h*(.18+Math.floor(i/5)*.26);
        ctx.beginPath();ctx.arc(px,py,16,0,Math.PI*2);ctx.fill();
        for(const [dx,dy] of [[-14,-16],[0,-22],[14,-16]]){ctx.beginPath();ctx.arc(px+dx,py+dy,7,0,Math.PI*2);ctx.fill();}
      }
      ctx.fillStyle='#fffaf0';rr(ctx,w*.28,h*.22,w*.44,h*.36,20);ctx.fill();
      ctx.strokeStyle='#b88254';ctx.lineWidth=10;ctx.stroke();
      ctx.fillStyle='#b8e4f7';rr(ctx,w*.31,h*.25,w*.38,h*.30,12);ctx.fill();
      ctx.fillStyle='#c48a54';rr(ctx,w*.12,h*.52,w*.14,h*.04,8);ctx.fill();rr(ctx,w*.74,h*.46,w*.14,h*.04,8);ctx.fill();
      ctx.fillStyle='#d4a672';ctx.fillRect(0,h*.74,w,h*.26);
      break;
    }
    case 'greenhouse':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#b8e8df'],[.55,'#e8f7e4'],[1,'#96c888']]);ctx.fillRect(0,0,w,h);
      sunGlow(ctx,w*.50,h*.20,w*.075,'#fffad4');
      // Botanical conservatory glass arches
      ctx.strokeStyle='#ffffff';ctx.lineWidth=10;
      for(let i=0;i<4;i++){
        ctx.beginPath();ctx.arc(w*(.15+i*.233),h*.40,w*.116,Math.PI,0);ctx.lineTo(w*(.15+i*.233)+w*.116,h*.74);ctx.stroke();
      }
      // Wooden plant bench + potted succulents
      ctx.fillStyle='#b88250';ctx.fillRect(w*.08,h*.64,w*.84,h*.06);
      for(let i=0;i<5;i++){
        const px=w*(.18+i*.16);
        ctx.fillStyle='#d4724a';rr(ctx,px-22,h*.54,44,h*.10,6);ctx.fill();
        ctx.fillStyle=i%2?'#52b064':'#78c884';ctx.beginPath();ctx.arc(px,h*.51,26,0,Math.PI*2);ctx.fill();
      }
      ctx.fillStyle='#7cb86e';ctx.fillRect(0,h*.74,w,h*.26);
      break;
    }
    case 'library':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#5c4338'],[.55,'#8a664c'],[1,'#b88e64']]);ctx.fillRect(0,0,w,h);
      // Warm arched library window + glowing bookshelves
      ctx.fillStyle='#f8e8c8';ctx.beginPath();ctx.arc(w*.50,h*.36,w*.14,Math.PI,0);ctx.lineTo(w*.64,h*.66);ctx.lineTo(w*.36,h*.66);ctx.closePath();ctx.fill();
      const bcols=['#e35454','#3b88d6','#4cb268','#f4be36','#9c68d4'];
      for(const sx of [w*.06,w*.70]){
        ctx.fillStyle='#6c4832';rr(ctx,sx,h*.16,w*.24,h*.58,8);ctx.fill();
        for(let r=0;r<4;r++){
          for(let c=0;c<6;c++){
            ctx.fillStyle=bcols[(r*3+c)%5];
            rr(ctx,sx+12+c*(w*.036),h*(.20+r*.13),w*.030,h*.10,3);ctx.fill();
          }
        }
      }
      sunGlow(ctx,w*.50,h*.26,w*.045,'#fff4be');
      ctx.fillStyle='#a8784c';ctx.fillRect(0,h*.74,w,h*.26);
      break;
    }
    case 'cloudland':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#69b8f2'],[.48,'#b6e2fc'],[.82,'#fce4f0'],[1,'#eef6ff']]);ctx.fillRect(0,0,w,h);
      sunGlow(ctx,w*.22,h*.22,w*.065,'#fff7c4');
      // Big vivid rainbow arch across clouds
      const rcols=['#ff6b78','#ffb048','#ffe058','#68cc78','#56b4f0','#b88cff'];
      rcols.forEach((col,i)=>{
        ctx.strokeStyle=col;ctx.lineWidth=16;ctx.beginPath();ctx.arc(w*.50,h*.76,w*.42-i*16,Math.PI,0);ctx.stroke();
      });
      for(const [cx,cy,cs] of [[w*.14,h*.68,w*.12],[w*.34,h*.74,w*.11],[w*.68,h*.72,w*.12],[w*.88,h*.68,w*.12],[w*.74,h*.24,w*.08]]){
        cloud(ctx,cx,cy,cs,'rgba(255,255,255,.94)');
      }
      break;
    }
    case 'halloween':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#241b48'],[.48,'#4e3278'],[.82,'#8e4878'],[1,'#3a284c']]);ctx.fillRect(0,0,w,h);
      stars(ctx,w,h*.48,50,61);
      sunGlow(ctx,w*.76,h*.24,w*.075,'#ffe894','rgba(255,210,100,0)');
      hill(ctx,w,h,h*.66,h*.05,2.2,.4,'#382652');
      // Cute haunted-castle silhouette + glowing smiling pumpkins
      ctx.fillStyle='#2a1d42';rr(ctx,w*.22,h*.36,w*.20,h*.34,6);ctx.fill();
      ctx.beginPath();ctx.moveTo(w*.19,h*.38);ctx.lineTo(w*.32,h*.20);ctx.lineTo(w*.45,h*.38);ctx.closePath();ctx.fill();
      ctx.fillStyle='#ffcf54';rr(ctx,w*.28,h*.44,w*.035,h*.07,4);ctx.fill();rr(ctx,w*.34,h*.44,w*.035,h*.07,4);ctx.fill();
      for(const [px,py,pr] of [[w*.64,h*.68,28],[w*.76,h*.70,22]]){
        ctx.fillStyle='#f27a24';ctx.beginPath();ctx.ellipse(px,py,pr*1.15,pr,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#ffe87a';ctx.beginPath();ctx.arc(px-8,py-4,4,0,Math.PI*2);ctx.arc(px+8,py-4,4,0,Math.PI*2);ctx.fill();
      }
      break;
    }
    case 'christmas':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#1a3662'],[.48,'#2c588e'],[.80,'#8ec4e6'],[1,'#eef8ff']]);ctx.fillRect(0,0,w,h);
      stars(ctx,w,h*.50,65,73);
      hill(ctx,w,h,h*.66,h*.04,2.0,.4,'#dceef8');
      // Decorated snowy pine trees + warm glowing cottage
      for(const [px,py,pw,ph] of [[w*.14,h*.72,w*.14,h*.34],[w*.84,h*.72,w*.14,h*.32]]){
        pine(ctx,px,py,pw,ph,'#2a7a48');
        ctx.fillStyle='#ffd652';ctx.beginPath();ctx.arc(px,py-ph*.94,10,0,Math.PI*2);ctx.fill();
      }
      ctx.fillStyle='#b8443c';rr(ctx,w*.36,h*.46,w*.28,h*.26,8);ctx.fill();
      ctx.fillStyle='#fffaf6';ctx.beginPath();ctx.moveTo(w*.32,h*.48);ctx.lineTo(w*.50,h*.32);ctx.lineTo(w*.68,h*.48);ctx.closePath();ctx.fill();
      ctx.fillStyle='#ffe282';rr(ctx,w*.42,h*.54,w*.06,h*.08,4);ctx.fill();rr(ctx,w*.52,h*.54,w*.06,h*.08,4);ctx.fill();
      ctx.fillStyle='#eef8ff';ctx.fillRect(0,h*.72,w,h*.28);
      break;
    }
    case 'gemmine':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#261e44'],[.52,'#3c3468'],[1,'#4d4466']]);ctx.fillRect(0,0,w,h);
      // Cavern arch + glowing crystal clusters
      ctx.strokeStyle='#5a4e7c';ctx.lineWidth=24;ctx.beginPath();ctx.arc(w*.50,h*.78,w*.44,Math.PI,0);ctx.stroke();
      const gems=[[w*.16,h*.68,'#b668ff',64],[w*.24,h*.70,'#4cd6f0',48],[w*.76,h*.68,'#ff5e84',60],[w*.84,h*.70,'#4ce094',50],[w*.50,h*.32,'#ffd858',40]];
      for(const [gx,gy,col,gh] of gems){
        ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(gx-gh*.32,gy);ctx.lineTo(gx,gy-gh);ctx.lineTo(gx+gh*.32,gy);ctx.closePath();ctx.fill();
      }
      stars(ctx,w,h*.68,36,83);
      ctx.fillStyle='#5c526e';ctx.fillRect(0,h*.74,w,h*.26);
      break;
    }
    case 'superhero':{
      ctx.fillStyle=gradY(ctx,h,[[0,'#3a8ae0'],[.50,'#9ed8fa'],[1,'#626c78']]);ctx.fillRect(0,0,w,h);
      sunGlow(ctx,w*.82,h*.18,w*.052);cloud(ctx,w*.24,h*.16,w*.075);
      // Grandstand & checkered gantry banner
      ctx.fillStyle='#e2eaf0';rr(ctx,w*.06,h*.44,w*.88,h*.22,12);ctx.fill();
      ctx.fillStyle='#df433b';ctx.fillRect(w*.06,h*.42,w*.88,h*.05);
      // Start/finish checkered gantry arch
      ctx.fillStyle='#3c4654';ctx.fillRect(w*.22,h*.24,18,h*.48);ctx.fillRect(w*.76,h*.24,18,h*.48);
      for(let r=0;r<2;r++)for(let c=0;c<12;c++){
        ctx.fillStyle=(r+c)%2?'#fff':'#222a34';
        ctx.fillRect(w*.22+c*(w*.56/12),h*.24+r*h*.045,w*.56/12,h*.045);
      }
      // Asphalt racetrack + red/white curbs
      ctx.fillStyle='#4e5864';ctx.fillRect(0,h*.70,w,h*.30);
      for(let i=0;i<16;i++){ctx.fillStyle=i%2?'#fff':'#df433b';ctx.fillRect(i*w/16,h*.70,w/16,12);}
      break;
    }
    default:{
      ctx.fillStyle='#cde6f2';ctx.fillRect(0,0,w,h);
    }
  }
  ctx.restore();
}

export function stageBackdrop(id){
  if(!backdropCache.has(id)){
    const canvas=makeCanvas(1024,768,(ctx,w,h)=>drawScene(ctx,w,h,id));
    const tex=new THREE.CanvasTexture(canvas);
    tex.colorSpace=THREE.SRGBColorSpace;
    tex.needsUpdate=true;
    backdropCache.set(id,tex);
  }
  return backdropCache.get(id);
}

export function disposeStageBackdrop(id){
  const tex=backdropCache.get(id);
  if(tex){tex.dispose();backdropCache.delete(id);}
}

export function stageCardUrl(id){
  if(!cardCache.has(id)){
    const canvas=makeCanvas(320,214,(ctx,w,h)=>{
      drawScene(ctx,w,h,id);
      const vig=ctx.createLinearGradient(0,h*.62,0,h);
      vig.addColorStop(0,'rgba(24,38,44,0)');vig.addColorStop(1,'rgba(24,38,44,.22)');
      ctx.fillStyle=vig;ctx.fillRect(0,0,w,h);
    });
    cardCache.set(id,canvas.toDataURL('image/jpeg',.85));
  }
  return cardCache.get(id);
}

// Styled emblem drawer used for medals (13-32), delivery docks (13-32), and toy portraits (120 new toys).
function drawEmblem(ctx,cx,cy,r,kind,bgColor,fgColor,accentColor='#ffe28a'){
  ctx.save();
  ctx.translate(cx,cy);
  // Soft rounded badge backdrop when bgColor provided
  if(bgColor){
    ctx.fillStyle=bgColor;
    ctx.beginPath();ctx.arc(0,0,r*.92,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=r*.07;ctx.stroke();
  }
  ctx.fillStyle=fgColor;ctx.strokeStyle='#243640';ctx.lineWidth=Math.max(2,r*.055);
  ctx.lineJoin='round';ctx.lineCap='round';

  const drawBin=(col)=>{
    ctx.fillStyle=col;rr(ctx,-r*.40,-r*.34,r*.80,r*.86,r*.12);ctx.fill();ctx.stroke();
    rr(ctx,-r*.46,-r*.50,r*.92,r*.20,r*.08);ctx.fill();ctx.stroke();
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,r*.10,r*.20,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=col;ctx.beginPath();ctx.arc(0,r*.10,r*.09,0,Math.PI*2);ctx.fill();
  };
  const drawTruck=(body,cab)=>{
    ctx.fillStyle=body;rr(ctx,-r*.58,-r*.34,r*.72,r*.56,r*.10);ctx.fill();ctx.stroke();
    ctx.fillStyle=cab;rr(ctx,r*.10,-r*.22,r*.46,r*.44,r*.10);ctx.fill();ctx.stroke();
    ctx.fillStyle='#dff4ff';rr(ctx,r*.22,-r*.14,r*.24,r*.18,r*.05);ctx.fill();
    for(const wx of [-r*.32,r*.30]){
      ctx.fillStyle='#2f3a44';ctx.beginPath();ctx.arc(wx,r*.28,r*.16,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#e5edf2';ctx.beginPath();ctx.arc(wx,r*.28,r*.07,0,Math.PI*2);ctx.fill();
    }
  };
  const drawDino=(col,belly)=>{
    ctx.fillStyle=col;
    ctx.beginPath();ctx.ellipse(-r*.06,r*.18,r*.38,r*.30,0,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.ellipse(r*.18,-r*.26,r*.30,r*.24,0,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(-r*.34,r*.22);ctx.lineTo(-r*.64,r*.32);ctx.lineTo(-r*.28,r*.38);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle=belly;ctx.beginPath();ctx.ellipse(r*.04,r*.20,r*.20,r*.18,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#1f2a33';ctx.beginPath();ctx.arc(r*.26,-r*.30,r*.055,0,Math.PI*2);ctx.fill();
  };
  const drawAnimal=(col,earCol,spotCol=null)=>{
    ctx.fillStyle=earCol;
    ctx.beginPath();ctx.arc(-r*.34,-r*.34,r*.18,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.arc(r*.34,-r*.34,r*.18,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.fillStyle=col;
    ctx.beginPath();ctx.arc(0,r*.02,r*.48,0,Math.PI*2);ctx.fill();ctx.stroke();
    if(spotCol){
      ctx.fillStyle=spotCol;
      ctx.beginPath();ctx.ellipse(-r*.18,-r*.06,r*.14,r*.11,-.3,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.ellipse(r*.18,-r*.06,r*.14,r*.11,.3,0,Math.PI*2);ctx.fill();
    }
    ctx.fillStyle='#1e2730';
    ctx.beginPath();ctx.arc(-r*.17,-r*.06,r*.055,0,Math.PI*2);ctx.arc(r*.17,-r*.06,r*.055,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ff9cab';ctx.beginPath();ctx.ellipse(0,r*.14,r*.15,r*.10,0,0,Math.PI*2);ctx.fill();
  };
  const drawCake=(base,icing)=>{
    ctx.fillStyle=base;rr(ctx,-r*.46,-r*.10,r*.92,r*.54,r*.12);ctx.fill();ctx.stroke();
    ctx.fillStyle=icing;rr(ctx,-r*.48,-r*.26,r*.96,r*.28,r*.12);ctx.fill();ctx.stroke();
    ctx.fillStyle='#e63946';ctx.beginPath();ctx.arc(0,-r*.38,r*.14,0,Math.PI*2);ctx.fill();ctx.stroke();
  };
  const drawFruit=(col,leaf)=>{
    ctx.fillStyle=col;ctx.beginPath();ctx.arc(0,r*.10,r*.44,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.fillStyle=leaf;ctx.beginPath();ctx.ellipse(r*.14,-r*.38,r*.22,r*.10,-.4,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.45)';ctx.beginPath();ctx.ellipse(-r*.16,-r*.04,r*.10,r*.16,.3,0,Math.PI*2);ctx.fill();
  };
  const drawBowl=(bowlCol,topCol)=>{
    ctx.fillStyle=topCol;ctx.beginPath();ctx.ellipse(0,-r*.06,r*.48,r*.22,0,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.fillStyle=bowlCol;ctx.beginPath();ctx.arc(0,-r*.04,r*.48,0,Math.PI);ctx.closePath();ctx.fill();ctx.stroke();
  };
  const drawBug=(col,wings)=>{
    ctx.fillStyle=wings;ctx.beginPath();ctx.ellipse(-r*.26,0,r*.26,r*.38,-.2,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.ellipse(r*.26,0,r*.26,r*.38,.2,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(0,r*.04,r*.24,r*.42,0,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.fillStyle='#1f262e';ctx.beginPath();ctx.arc(0,-r*.34,r*.16,0,Math.PI*2);ctx.fill();
  };
  const drawBot=(col,screen)=>{
    ctx.fillStyle=col;rr(ctx,-r*.40,-r*.36,r*.80,r*.72,r*.16);ctx.fill();ctx.stroke();
    ctx.fillStyle=screen;rr(ctx,-r*.28,-r*.22,r*.56,r*.28,r*.08);ctx.fill();
    ctx.fillStyle='#72f6ff';ctx.beginPath();ctx.arc(-r*.12,-r*.08,r*.06,0,Math.PI*2);ctx.arc(r*.12,-r*.08,r*.06,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.moveTo(0,-r*.36);ctx.lineTo(0,-r*.56);ctx.stroke();
    ctx.fillStyle=accentColor;ctx.beginPath();ctx.arc(0,-r*.58,r*.09,0,Math.PI*2);ctx.fill();ctx.stroke();
  };
  const drawStarItem=(col)=>{
    ctx.fillStyle=col;ctx.beginPath();
    for(let i=0;i<10;i++){
      const rad=i%2?r*.24:r*.52,a=i*Math.PI/5-Math.PI/2;
      ctx[i?'lineTo':'moveTo'](Math.cos(a)*rad,Math.sin(a)*rad);
    }
    ctx.closePath();ctx.fill();ctx.stroke();
  };
  const drawWheel=(col)=>{
    ctx.strokeStyle=col;ctx.lineWidth=r*.09;ctx.beginPath();ctx.arc(0,0,r*.48,0,Math.PI*2);ctx.stroke();
    ctx.lineWidth=r*.045;
    for(let i=0;i<8;i++){const a=i*Math.PI/4;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*r*.48,Math.sin(a)*r*.48);ctx.stroke();}
    ctx.fillStyle=accentColor;ctx.beginPath();ctx.arc(0,0,r*.14,0,Math.PI*2);ctx.fill();
  };
  const drawTent=(c1,c2)=>{
    ctx.fillStyle=c1;ctx.beginPath();ctx.moveTo(-r*.52,r*.42);ctx.lineTo(0,-r*.46);ctx.lineTo(r*.52,r*.42);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle=c2;ctx.beginPath();ctx.moveTo(-r*.20,r*.42);ctx.lineTo(0,-r*.06);ctx.lineTo(r*.20,r*.42);ctx.closePath();ctx.fill();
  };
  const drawChest=(c1,c2)=>{
    ctx.fillStyle=c1;rr(ctx,-r*.50,-r*.28,r*1.0,r*.72,r*.12);ctx.fill();ctx.stroke();
    ctx.fillStyle=c2;ctx.fillRect(-r*.50,-r*.04,r*1.0,r*.14);
    rr(ctx,-r*.12,-r*.10,r*.24,r*.26,r*.06);ctx.fill();ctx.stroke();
  };

  if(kind==='binBlue')drawBin('#2b7cd3');
  else if(kind==='binGreen')drawBin('#38a354');
  else if(kind==='binRed')drawBin('#d9423a');
  else if(kind==='binGray')drawBin('#6e7b88');
  else if(['truckGreen','truckYellow','excavator','bulldozer','mixerTruck','roller','coneCart','steamEngine','coachCar','coalCar','bulletTrain','railCrane','farmTractor','pumpkinCoach','hoverCar','coasterCar','bumperCar','airliner','luggageCart','boardingStair','ambulance','ladderTruck','fireBoat','cargoShip','tugBoat','sailBoat','schoolBus','wagonCart','submarine','sleighCar','mineCart','f1Racer','driftCar','monsterTruck'].includes(kind)){
    drawTruck(fgColor,accentColor);
  }else if(kind.startsWith('dino')||['dragonHead'].includes(kind)){
    drawDino(fgColor,accentColor);
  }else if(['farmCow','farmSheep','farmPig','farmRooster','giantPanda','redPanda','giraffe','lionCub','babyElephant','zebra','hippo','croc','polarBear','orcaWhale','babySeal','blueWhale','snowFox','unicorn','babyDragon','parrot','octopusCap','circusBear','magicHatRabbit','carouselHorse','pilotBear','nurseRabbit','fireDog','owlTeacher','lionDance','fortuneCat','sphinxCat','camelToy','shibaInu','westernHorse','seahorse','hermitCrab','clownFish','corgiPup','calicoCat','hamsterWheel','lopBunny','parakeet','teddyReader','cuteGhost','blackCat','batBuddy','santaClaus','reindeer','gingerbread','minerMole'].includes(kind)){
    drawAnimal(fgColor,accentColor,kind==='giantPanda'?'#232930':kind==='farmCow'||kind==='fireDog'?'#3b3530':null);
  }else if(['shortcake','donutPink','croissant','macaronTower','bearCookie','matchaCupcake','cottonCandy','popcornTub','softServe','popsicle','sundaeCup','shavedIce','bobaTea','waffleCone','tanghulu','dangoStick','sakuraMochi','candyBucket','giftBox'].includes(kind)){
    drawCake(fgColor,accentColor);
  }else if(['strawberry','watermelon','pineapple','redApple','bananaBoat','grapeCluster','bambooShoot','oasisPalm','cactusPot','succulentRose','sunflowerPot','bonsaiTree','tulipPot','pumpkinLantern','christmasTree'].includes(kind)){
    drawFruit(fgColor,'#4ca84a');
  }else if(['shrimpSushi','ramenBowl','burger','pizzaSlice','fryPanEgg','teaPot','porcelainCup','marshmallow','clayJar','wateringCan','cloudPillow','goldIngot'].includes(kind)){
    drawBowl(fgColor,accentColor);
  }else if(['ladybug','butterfly','honeyBee','beetle','mantis','snail','scarabGem','jellyfish','mantaRay','origamiCrane'].includes(kind)){
    drawBug(fgColor,accentColor);
  }else if(['retroBot','sphereAI','mechWalker','quadDrone','powerCore','thermometer','capsuleToy','paintTube','crayonRocket','retroRadio','globeLamp'].includes(kind)){
    drawBot(fgColor,accentColor);
  }else if(['campTent','circusTent','igloo','farmBarn','fairyTower','signalTower','controlTower','lighthouse','pyramid','toriiGate','mushroomHouse','catHouse','easelBoard','storyClock','witchHat','amethyst','emeraldGem'].includes(kind)){
    drawTent(fgColor,accentColor);
  }else if(['treasureChest','pirateShip','goldAnchor','spyglassBarrel','backpack','redLantern','campLantern','campfire','suitcase','medKit','fireHydrant','extinguisher','harborCrane','schoolBag','crayonBox','bookStack','drumToy','pharaohMask','guitarBoot','koinobori','checkeredFlag','goldPickaxe','featherQuill'].includes(kind)){
    drawChest(fgColor,accentColor);
  }else if(['ferrisWheel','soccerBall','basketball','unicycle','compass','bambooFan','hotBalloon','stethoscope','fireHelmet','lifeBuoy','globeToy','daruma','cowboyHat','paletteToy','rainbowArch','sunBuddy','crescentMoon','raindropToy','windMill','racingHelmet'].includes(kind)){
    drawWheel(fgColor);
  }else{
    drawStarItem(fgColor);
  }
  ctx.restore();
}

const TOY_PALETTE={
  // recycle
  binBlue:['#d9ecff','#2b7cd3','#fff'],binGreen:['#daf5df','#38a354','#fff'],binRed:['#ffe0de','#d9423a','#fff'],binGray:['#e4eaef','#6e7b88','#fff'],
  truckGreen:['#d8f5df','#3aa856','#f5f9f2'],truckYellow:['#fff1c7','#f2b724','#3a9c5a'],
  // dino
  dinoTrex:['#ddf4d6','#4e9e4c','#d8ee9c'],dinoTricera:['#f8e2c4','#c97c3e','#f5d49a'],dinoBrachio:['#d9eef7','#4e99b5','#bfe4ef'],
  dinoStego:['#e6f2cf','#6fa848','#f0a442'],dinoPtero:['#f7dff0','#b35fa0','#f7c583'],dinoEgg:['#fff4d8','#f0e0b2','#64b86c'],
  // construct
  excavator:['#fff0c2','#f2b41d','#3d4752'],bulldozer:['#ffe8b8','#e8981e','#48525c'],mixerTruck:['#e2f0fa','#e67a2e','#f5f5f0'],
  roller:['#fff2cc','#e6ad22','#6b7885'],hardHat:['#fff3c4','#f2c21a','#ffffff'],coneCart:['#ffe3cc','#ee6c2e','#ffffff'],
  // train
  steamEngine:['#ffe0dc','#cc3f39','#333b44'],coachCar:['#d9f0df','#3b8c58','#f5e6ba'],coalCar:['#dfe6ec','#4a5562','#2b3138'],
  bulletTrain:['#dff2fc','#eef4f8','#2c78c4'],railCrane:['#fff0cc','#e6a622','#455a6e'],signalTower:['#e2ebf0','#c84b42','#f2eee4'],
  // farm
  farmCow:['#eef5e1','#f7f5ee','#3b3530'],farmSheep:['#eef6f8','#fffaf0','#e0bfa0'],farmPig:['#ffe2ea','#f6a2b5','#e87b95'],
  farmRooster:['#fff0d4','#f2b03a','#d93f36'],farmTractor:['#ffe2dc','#d4443b','#ffd24c'],farmBarn:['#ffe4de','#cc4339','#fff6e6'],
  // bakery
  shortcake:['#ffe4ec','#f8d9a8','#fffaf2'],donutPink:['#ffe0eb','#f2a666','#ff7ea6'],croissant:['#fff0d4','#e39b3e','#f8cf7a'],
  macaronTower:['#f2e2ff','#ff9bb8','#9be6cc'],bearCookie:['#f5e4cf','#b87a46','#6b4426'],matchaCupcake:['#e2f5dc','#68b058','#f8d79c'],
  // fruit
  strawberry:['#ffe0e6','#e63b52','#4ca84a'],watermelon:['#dff6e2','#e84a5f','#469e4a'],pineapple:['#fff2cc','#f2b629','#4ea34c'],
  redApple:['#ffe0de','#db3a34','#52a84a'],bananaBoat:['#fff6cc','#f7d238','#e6a822'],grapeCluster:['#efe0fa','#8648b8','#52a34c'],
  // kitchen
  shrimpSushi:['#ffe8dc','#fffaf0','#f27a42'],ramenBowl:['#ffe6d4','#c84238','#f7d47c'],burger:['#fff0d2','#e39c42','#4fa34a'],
  pizzaSlice:['#ffebd2','#f2b638','#d94238'],fryPanEgg:['#e3e8ee','#454f59','#fff8dc'],teaPot:['#dff2ee','#5aa89a','#f5d78e'],
  // bamboo
  giantPanda:['#e2f5e4','#ffffff','#242930'],redPanda:['#ffe5d4','#c95d32','#f7e6d2'],bambooShoot:['#e2f4d4','#88b852','#64963c'],
  redLantern:['#ffe0dc','#e03a34','#f5c84c'],porcelainCup:['#e2f0fa','#f6f9fc','#3c74b8'],bambooFan:['#e4f5dc','#6cb05a','#e8c574'],
  // insect
  ladybug:['#ffe0e0','#e03b3b','#262b32'],butterfly:['#dff0ff','#3a8de6','#7ad4ff'],honeyBee:['#fff4cc','#f2c029','#2e2924'],
  beetle:['#eaded4','#6b4632','#a67554'],mantis:['#e0f6d8','#58b84c','#9ae078'],snail:['#f7ead6','#e6954c','#f2d49a'],
  // safari
  giraffe:['#fff1cc','#f2b838','#9e6228'],lionCub:['#ffebc8','#e8a238','#a85a24'],babyElephant:['#e4edf4','#889eb0','#b8cad8'],
  zebra:['#eaedf0','#f7f7f7','#2a2f36'],hippo:['#ebe2f4','#8a7ba8','#b8a8d4'],croc:['#ddf4d8','#4fa856','#96d67a'],
  // polar
  polarBear:['#dff3fc','#f7fbff','#b4d8ea'],orcaWhale:['#d8ecf7','#222b36','#f5faff'],babySeal:['#e4f4fc','#f0f7fa','#a8c8dc'],
  blueWhale:['#d9effa','#3a82b8','#b8e2f8'],snowFox:['#e8f4fc','#f7fafd','#9ec4dc'],igloo:['#dff4fc','#eaf8ff','#7ab8d8'],
  // castle
  unicorn:['#f5e4ff','#fff7fc','#f29ad8'],babyDragon:['#e2f5e4','#54b87a','#ffd166'],crownPrince:['#fff1cc','#f2c038','#5a7ee6'],
  magicWand:['#f4e2ff','#c87ef2','#ffe27a'],pumpkinCoach:['#ffebd0','#f08b2d','#ffd666'],fairyTower:['#f5e2fa','#f7edf8','#9a7be8'],
  // pirate
  treasureChest:['#fff0cc','#9e622d','#f5c63d'],pirateShip:['#e4edf4','#7a4b2a','#fff6e2'],parrot:['#ffe0de','#e03f38','#42a8e6'],
  octopusCap:['#f4e0f5','#b8489a','#2d3642'],goldAnchor:['#fff1cc','#d9a632','#f5d670'],spyglassBarrel:['#f0e4d4','#9e693c','#e8b842'],
  // robot
  retroBot:['#e0ecf7','#7b9bb8','#223a54'],sphereAI:['#ddf4fc','#eef6fa','#2c86b8'],mechWalker:['#e2e8f5','#5c72a8','#ff9a42'],
  quadDrone:['#e2f2fa','#4a647a','#5ce6ff'],hoverCar:['#e0ecfa','#3b82d6','#7af0ff'],powerCore:['#ddf6fa','#347a9e','#72f7ff'],
  // music
  miniPiano:['#eae8f4','#2e333e','#f7f5ee'],acousticGuitar:['#f7ead6','#c97c3e','#f2c882'],jazzDrum:['#ffe2e0','#db443a','#fff6e6'],
  goldTrumpet:['#fff2cc','#e6b22e','#ffe27a'],miniViolin:['#f5e2d4','#a84e28','#e39652'],xylophone:['#fff0da','#f26457','#ffd166'],
  // sports
  soccerBall:['#e4f4e4','#f7f9fa','#2a323a'],basketball:['#ffe6d0','#e87228','#4a2c1a'],goldTrophy:['#fff2c4','#f2bd2e','#ffe682'],
  shuttleSet:['#e2f4f0','#f5f9fa','#3ba89a'],skateboard:['#e2ebfa','#4a7ae6','#ff8a4c'],boxingGlove:['#ffe0de','#d93832','#fff2e0'],
  // camp
  campTent:['#ffead4','#e87d34','#ffe496'],campfire:['#ffe4d0','#f26b2e','#ffd44c'],campLantern:['#fff0cc','#387a68','#ffe27a'],
  backpack:['#e2f2e4','#4a8c58','#e8a642'],marshmallow:['#fff2e2','#fff8ef','#c98c58'],compass:['#f7ecd4','#cfa038','#e04a3e'],
  // circus
  circusBear:['#f7ead8','#b87846','#e84a5f'],clownHat:['#ffe2e8','#e64252','#ffd242'],circusTent:['#ffe4e0','#e04343','#fff5dc'],
  unicycle:['#e2effa','#3a82d6','#ffd242'],magicHatRabbit:['#ece4f8','#323846','#ffffff'],hotBalloon:['#ffe8e0','#ff6b6b','#ffd166'],
  // amusement
  ferrisWheel:['#e2f2fc','#ff7096','#ffd166'],carouselHorse:['#f8e4f5','#fff6fa','#f29ec4'],coasterCar:['#ffe2dc','#e64c42','#ffd24c'],
  popcornTub:['#fff0d4','#e04343','#ffe484'],cottonCandy:['#ffe4f2','#ff9ac8','#8ce0ff'],bumperCar:['#e2f2fa','#3a96d6','#ffd24c'],
  // airport
  airliner:['#dff2fc','#ffffff','#3fa6e8'],luggageCart:['#fff2cc','#f4c236','#e35464'],controlTower:['#e2eff8','#e9eef4','#2f78c4'],
  boardingStair:['#e4f0fa','#3a88d4','#f2b632'],suitcase:['#dff0fc','#3c92d8','#f6c945'],pilotBear:['#f5e8d8','#b87948','#263d66'],
  // hospital
  ambulance:['#ffe4e4','#ffffff','#e64545'],nurseRabbit:['#ffe8ee','#fff7f4','#f7a4b8'],medKit:['#ffe2e2','#ffffff','#e64545'],
  stethoscope:['#dff4f4','#3ca4b8','#2d4a5e'],thermometer:['#e2f6f2','#f4f9fc','#4cb5a8'],capsuleToy:['#ffe4e4','#f25c5c','#fff7e8'],
  // firehouse
  ladderTruck:['#ffe0dc','#df433b','#b8c5d0'],fireBoat:['#dff0fa','#d93b34','#4ca8e0'],fireHydrant:['#ffe0dc','#df433b','#f4c84b'],
  fireHelmet:['#ffe2dc','#df433b','#f4c438'],extinguisher:['#ffe0dc','#df433b','#2a2e38'],fireDog:['#edf2f6','#fffaf2','#df433b'],
  // harbor
  cargoShip:['#dff0fa','#2d5a82','#e3544a'],tugBoat:['#e2eff8','#e65245','#f6b73c'],lighthouse:['#ffe4e0','#fffaf2','#df433b'],
  harborCrane:['#e0eef8','#3886c9','#f4be36'],lifeBuoy:['#ffe6e0','#fffaf2','#df433b'],sailBoat:['#dff2fc','#2f78c4','#fff9eb'],
  // school
  schoolBus:['#fff2cc','#f4c133','#2a2e38'],schoolBag:['#ffe2e6','#e65865','#ffd15c'],globeToy:['#dff2fc','#3b98db','#5ab862'],
  crayonBox:['#fff2cc','#f4c438','#e84a43'],deskLamp:['#e0f5f0','#4cb5a4','#ffd668'],owlTeacher:['#f5eadc','#8a6246','#f4c438'],
  // festival
  lionDance:['#ffe0dc','#de3d38','#f3c43c'],goldIngot:['#fff4cc','#f3c43c','#ffe070'],tanghulu:['#ffe0e4','#d93232','#f6ebd4'],
  dragonHead:['#ffe0dc','#e6483e','#4db87a'],fortuneCat:['#fff2dc','#fffaf2','#df3c38'],drumToy:['#ffe2dc','#de3d38','#f6ebd4'],
  // egypt
  pyramid:['#fff0cc','#e6b963','#f6d24c'],sphinxCat:['#f8ebd0','#e3ba72','#2c6bb8'],camelToy:['#f7e8d2','#d8a05a','#d94646'],
  pharaohMask:['#fff1cc','#f3c43c','#2862b0'],scarabGem:['#dff0fc','#2c88d8','#f2c444'],oasisPalm:['#e4f4dc','#4ca84a','#eed18a'],
  // sakura
  daruma:['#ffe0e2','#de3d38','#f6ebd4'],shibaInu:['#ffeed6','#e69c4c','#df4646'],dangoStick:['#ffe8ee','#ffb0c4','#86c470'],
  toriiGate:['#ffe0dc','#de4336','#f3c43c'],koinobori:['#ffe4e8','#e64c56','#3b8be0'],sakuraMochi:['#ffe4ee','#ffaac4','#52a656'],
  // desert
  cowboyHat:['#f4e4d0','#9e6238','#d84a3e'],cactusPot:['#e2f4dc','#4ea854','#ff7ea6'],wagonCart:['#f7ecd6','#9e683c','#f8eed6'],
  westernHorse:['#f4e2d2','#9e5a32','#d8483c'],sheriffStar:['#fff2cc','#f3c43c','#9e683c'],guitarBoot:['#f5e4d2','#b05e34','#f4c438'],
  // aquarium
  jellyfish:['#efe2fc','#c88cff','#f2c8ff'],mantaRay:['#dff0fa','#2d6da8','#e6f4fc'],seahorse:['#ffecd4','#f4983c','#ffe08c'],
  submarine:['#fff3cc','#f4c42e','#e3543b'],hermitCrab:['#ffe4dc','#e68a5c','#e84a3c'],clownFish:['#ffe8d4','#f47428','#fffaf2'],
  // artstudio
  easelBoard:['#f5eadc','#b07846','#78c8f4'],paletteToy:['#fff4e0','#f6ebd4','#e84a43'],paintTube:['#dff0fc','#4896e8','#fff6df'],
  origamiCrane:['#ffe4ec','#ff8fab','#f4dfbe'],clayJar:['#f5e2d6','#d87c52','#3b86b8'],crayonRocket:['#ffe2e2','#ff6b6b','#ffe066'],
  // icecreamshop
  softServe:['#ffe8f0','#ff9cb6','#df9c54'],popsicle:['#ffe2e6','#f25264','#4cb562'],sundaeCup:['#ffe8f2','#ff9ab8','#8ed8f2'],
  shavedIce:['#dff2fc','#4c8be6','#b8e8ff'],bobaTea:['#f5ead8','#e6bd8a','#ff789a'],waffleCone:['#f7ead2','#d89448','#ff8eb0'],
  // petshop
  corgiPup:['#ffeed6','#e69848','#fffaf2'],calicoCat:['#f5ece2','#fffaf2','#e68e3c'],hamsterWheel:['#dff6f2','#5ec4b8','#f0b670'],
  lopBunny:['#f7ece2','#edd4be','#f69ab2'],parakeet:['#e2f7e0','#6cd47a','#ffe25c'],catHouse:['#ffe6ee','#ffb0c8','#dfbc86'],
  // greenhouse
  succulentRose:['#e2f5e6','#6ec28e','#e69a74'],sunflowerPot:['#fff4cc','#ffd238','#6b4226'],mushroomHouse:['#ffe2e0','#e64545','#f6ebd4'],
  wateringCan:['#dff4ec','#52b88a','#f4c438'],bonsaiTree:['#e2f2e4','#4ca358','#3b6e8c'],tulipPot:['#ffe4ee','#ff6896','#f2c864'],
  // library
  bookStack:['#f4e8dc','#e65252','#3b88d6'],storyClock:['#f5e6d6','#a86c3e','#c8443a'],retroRadio:['#dff4f0','#4aa8a0','#f4e6c8'],
  teddyReader:['#f5e6d4','#c4844c','#3b88d6'],featherQuill:['#ffe4ee','#ff82a8','#2e4c7a'],globeLamp:['#e6e8fa','#6274cc','#f4c438'],
  // cloudland
  cloudPillow:['#e4f4fc','#f6fbff','#ff9eb8'],rainbowArch:['#e8f4fc','#ff6b78','#56b4f0'],sunBuddy:['#fff4cc','#ffd238','#ff9e32'],
  crescentMoon:['#e8eefa','#ffe270','#ff9eb8'],raindropToy:['#dff2fc','#62c4f6','#ff7a96'],windMill:['#e8f6ec','#ff6b78','#4ea2f0'],
  // halloween
  pumpkinLantern:['#ffe8d4','#f27a24','#4c8c42'],cuteGhost:['#ece8f6','#fffaf2','#ff9eb4'],witchHat:['#ece2f8','#5a3b8c','#f29c2e'],
  blackCat:['#e6e4f2','#2d313d','#7a44a8'],candyBucket:['#ffead4','#f28828','#ff5e7e'],batBuddy:['#eae2f6','#62448c','#463066'],
  // christmas
  santaClaus:['#ffe2e0','#df413c','#fffaf2'],christmasTree:['#dff4e2','#389452','#f4c63a'],reindeer:['#f4e4d6','#a86c3e','#df413c'],
  giftBox:['#ffe2e6','#e64552','#f4c63a'],gingerbread:['#f5e4d2','#b8743c','#df413c'],sleighCar:['#ffe2dc','#df413c','#f4c63a'],
  // gemmine
  mineCart:['#e6eaf0','#5a6675','#a45ce6'],amethyst:['#efe2fc','#9e52e0','#c484ff'],rubyHeart:['#ffe0e8','#e63858','#f4c63a'],
  emeraldGem:['#dff6e8','#34b870','#f4c63a'],goldPickaxe:['#fff2cc','#f4c63a','#9e6438'],minerMole:['#ede6e2','#66564e','#f4c42e'],
  // superhero
  f1Racer:['#ffe0dc','#df413c','#fffaf2'],driftCar:['#dff0fc','#3684d6','#f4c63a'],monsterTruck:['#e0f5e2','#48b85a','#262a34'],
  checkeredFlag:['#eaedf0','#262d38','#fffaf2'],racingHelmet:['#ffe2dc','#e64545','#f4c63a'],podiumCup:['#fff2cc','#f4c63a','#df413c'],
};

const STAGE_MEDAL_KIND={
  recycle:'truckGreen',dino:'dinoTrex',construct:'excavator',train:'steamEngine',farm:'farmCow',
  bakery:'shortcake',fruit:'strawberry',kitchen:'shrimpSushi',bamboo:'giantPanda',insect:'ladybug',
  safari:'giraffe',polar:'polarBear',castle:'unicorn',pirate:'treasureChest',robot:'retroBot',
  music:'miniPiano',sports:'goldTrophy',camp:'campTent',circus:'circusBear',amusement:'ferrisWheel',
  airport:'airliner',hospital:'ambulance',firehouse:'ladderTruck',harbor:'cargoShip',school:'schoolBus',
  festival:'lionDance',egypt:'pyramid',sakura:'shibaInu',desert:'cowboyHat',aquarium:'submarine',
  artstudio:'easelBoard',icecreamshop:'softServe',petshop:'corgiPup',greenhouse:'mushroomHouse',library:'teddyReader',
  cloudland:'rainbowArch',halloween:'pumpkinLantern',christmas:'santaClaus',gemmine:'mineCart',superhero:'f1Racer',
};

export function toyPortraitUrl(kind){
  if(!portraitCache.has(kind)){
    const [bg,fg,acc]=TOY_PALETTE[kind]||['#e8f2ee','#5a8e8a','#ffe28a'];
    const canvas=makeCanvas(160,160,(ctx,w,h)=>drawEmblem(ctx,w/2,h/2,w*.44,kind,bg,fg,acc));
    portraitCache.set(kind,canvas.toDataURL('image/png'));
  }
  return portraitCache.get(kind);
}

export function medalUrl(stageId){
  if(!medalCache.has(stageId)){
    const kind=STAGE_MEDAL_KIND[stageId]||'truckGreen';
    const [,fg,acc]=TOY_PALETTE[kind]||['#fff','#ffd166','#fff'];
    const canvas=makeCanvas(256,256,(ctx,w,h)=>{
      // Crisp bright silhouette emblem centered on transparent canvas (works both earned & locked silhouette)
      drawEmblem(ctx,w/2,h/2,w*.42,kind,null,fg,acc);
    });
    medalCache.set(stageId,canvas.toDataURL('image/png'));
  }
  return medalCache.get(stageId);
}

export function dockSpriteUrl(stageId){
  if(!dockCache.has(stageId)){
    const kind=STAGE_MEDAL_KIND[stageId]||'truckGreen';
    const [bg,fg,acc]=TOY_PALETTE[kind]||['#e8f2ee','#5a8e8a','#ffe28a'];
    // 1x2 vertical sprite: top = resting dock badge, bottom = glowing open/celebrating dock
    const canvas=makeCanvas(120,210,(ctx,w)=>{
      // Top frame (0..105)
      ctx.fillStyle='#f7ead0';rr(ctx,10,10,100,85,18);ctx.fill();
      ctx.strokeStyle='#b88b58';ctx.lineWidth=4.5;ctx.stroke();
      drawEmblem(ctx,w/2,52.5,36,kind,bg,fg,acc);
      // Bottom frame (105..210) - glowing welcome state
      ctx.fillStyle='#fff6cf';rr(ctx,8,113,104,90,20);ctx.fill();
      ctx.strokeStyle='#48a882';ctx.lineWidth=5;ctx.stroke();
      drawEmblem(ctx,w/2,158,39,kind,bg,fg,acc);
    });
    dockCache.set(stageId,canvas.toDataURL('image/png'));
  }
  return dockCache.get(stageId);
}
