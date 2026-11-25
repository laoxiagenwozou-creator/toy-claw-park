const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const median=values=>{const sorted=values.slice().sort((a,b)=>a-b);return sorted[Math.floor(sorted.length/2)];};
const range=values=>Math.max(...values)-Math.min(...values);
const deadband=(old,next,width)=>Math.abs(next-old)<=width?old:next-Math.sign(next-old)*width;

// One-Euro adaptive low-pass filter: velvet-smooth when still, fast follow when moving.
function euroStep(prev,value,dt,minCutoff,beta){
  const safeDt=clamp(dt,.008,.25);
  const speed=Math.abs(value-prev)/safeDt;
  const cutoff=minCutoff+beta*speed;
  const tau=1/(2*Math.PI*cutoff);
  const alpha=1/(1+tau/safeDt);
  return prev+alpha*(value-prev);
}

// Hardware Camera2 face tracking (and CPU fallback) reports face center & span.
// Lateral parallax uses low-latency spike-guarded One-Euro filtering without
// multi-frame median lag. Depth is latched only after a centered, quiet,
// sustained change so sideways motion cannot pump the zoom.
export function headTracker(){
  let raw=[],history=[],origin=null,rotation=null,last=-Infinity,candidate=0,since=0;
  let x=0,y=0,prevRawX=null,prevRawY=null,zoom=1;
  const pose={x:0,y:0,distance:1};
  function reset(){
    raw=[];history=[];origin=null;rotation=null;last=-Infinity;candidate=0;since=0;
    x=y=0;prevRawX=prevRawY=null;zoom=1;
    Object.assign(pose,{x:0,y:0,distance:1});
  }
  function calibrate(){
    if(!history.length){reset();return;}
    const recent=history.slice(-5);
    origin={x:median(recent.map(s=>s.x)),y:median(recent.map(s=>s.y)),log:median(recent.map(s=>s.log))};
    x=origin.x;y=origin.y;prevRawX=origin.x;prevRawY=origin.y;zoom=1;candidate=0;since=0;
    Object.assign(pose,{x:0,y:0,distance:1});
  }
  function sample(px,py,span,angle,at){
    if(![px,py,span,angle,at].every(Number.isFinite)||px<0||px>1||py<0||py>1||span<.032||span>.65)return false;
    if(at<=last)return false;
    if(rotation!==angle){reset();rotation=angle;}
    const dt=(at-last)/1000;
    if(at-last>360){raw=[];history=[];candidate=0;prevRawX=prevRawY=null;}
    last=at;
    raw.push({x:px,y:py,log:Math.log(span),at});
    raw=raw.filter(s=>at-s.at<=420).slice(-5);
    if(raw.length<2)return false;
    const recent=raw.slice(-3);
    // Reject single-frame detector glitches (>0.07 jump) without adding median lag to normal motion.
    const medX=median(recent.map(s=>s.x)),medY=median(recent.map(s=>s.y));
    const liveX=(prevRawX!==null&&Math.abs(px-prevRawX)>.07)?medX:px;
    const liveY=(prevRawY!==null&&Math.abs(py-prevRawY)>.07)?medY:py;
    prevRawX=px;prevRawY=py;
    const point={x:medX,y:medY,log:median(raw.map(s=>s.log)),at};
    history.push(point);history=history.filter(s=>at-s.at<=610);
    if(!origin){
      if(raw.length<3)return false;
      calibrate();return true;
    }
    // Scale against the eye separation captured at calibration. Turning one's head
    // changes the current separation and must not change the lateral sensitivity.
    const restingSpan=clamp(Math.exp(origin.log),.052,.24);
    const lateralDeadband=restingSpan*.005;
    const filteredX=euroStep(x,liveX,dt,2.6,20);
    const filteredY=euroStep(y,liveY,dt,2.2,18);
    x=Math.abs(liveX-origin.x)<=lateralDeadband?origin.x:deadband(x,filteredX,lateralDeadband*.4);
    y=deadband(y,filteredY,.0012);
    const eyeWidths=(x-origin.x)/restingSpan;
    const eyeHeights=(origin.y-y)/restingSpan;
    // Paired with restEye=10.8 and chamber gain, a natural lean gives ~21 deg and full lean ~36 deg.
    pose.x=7.0*Math.tanh(eyeWidths*5.75/7.0);
    pose.y=4.4*Math.tanh(eyeHeights*3.2/4.4);
    const quiet=history.filter(s=>at-s.at<=455);
    const centered=Math.abs(point.x-origin.x)<.057&&Math.abs(point.y-origin.y)<.074;
    if(!centered||quiet.length<3||at-quiet[0].at<285||
      range(quiet.map(s=>s.x))>.014||range(quiet.map(s=>s.y))>.019||range(quiet.map(s=>s.log))>.056){
      candidate=0;return true;
    }
    const desired=clamp(origin.log-median(quiet.map(s=>s.log)),Math.log(.77),Math.log(1.34));
    const change=desired-Math.log(zoom),direction=Math.sign(change);
    if(Math.abs(change)<Math.log(1.092)){candidate=0;return true;}
    if(candidate!==direction){candidate=direction;since=at;return true;}
    if(at-since>=390){
      zoom=Math.abs(desired)<.032?1:Math.exp(desired);
      pose.distance=zoom;candidate=0;
    }
    return true;
  }
  return {pose,sample,reset,calibrate};
}
