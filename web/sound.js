import musicBytes from './assets/arcade-theme.ogg';
import {assetBuffer} from './asset-bytes.js';
import {REQUESTS} from './requests.js';

import snowVoice from './assets/request-snow.ogg';
import townVoice from './assets/request-town.ogg';
import lookoutVoice from './assets/request-lookout.ogg';
import yardVoice from './assets/request-yard.ogg';
import gardenVoice from './assets/request-garden.ogg';
import reefVoice from './assets/request-reef.ogg';
import spaceVoice from './assets/request-space.ogg';
import ponyVoice from './assets/request-pony.ogg';
import peppaVoice from './assets/request-peppa.ogg';
import sheriffVoice from './assets/request-sheriff.ogg';
import chicksVoice from './assets/request-chicks.ogg';
import spideyVoice from './assets/request-spidey.ogg';
const voiceFiles={snow:snowVoice,town:townVoice,lookout:lookoutVoice,yard:yardVoice,garden:gardenVoice,reef:reefVoice,space:spaceVoice,
  pony:ponyVoice,peppa:peppaVoice,sheriff:sheriffVoice,chicks:chicksVoice,spidey:spideyVoice};
const settingsKey='toy-park-audio';
const $=id=>document.getElementById(id);
const defaults={music:true,effects:true};
function preferences(){
  try{const v=JSON.parse(localStorage.getItem(settingsKey));return {music:v?.music!==false,effects:v?.effects!==false};}
  catch{return {...defaults};}
}
export function createSound(){
  let options=preferences(),ctx,effectsBus,master,noiseBuffer,theme,decoding=false,music,motor;
  let offset=0,game=false,foreground=true,interacted=false,opener;
  let speech=null,speechTicket=0;
  const voices=new Map();
  function stopSpeech(){
    ++speechTicket;
    if(speech){speech.onended=null;speech.stop();speech.disconnect();speech=null;}
    try{window.speechSynthesis?.cancel?.();}catch{}
    if(music&&ctx)music.gain.gain.setTargetAtTime(.31,ctx.currentTime,.09);
  }
  async function readRequest(stage){
    stopSpeech();if(!options.music&&!options.effects)return false;
    unlock();if(!ctx||!visible())return false;
    const ticket=speechTicket;
    if(!voiceFiles[stage]){
      const line=REQUESTS[stage]?.line;
      if(!line)return false;
      try{
        if(ctx.state!=='running')await ctx.resume();
        if(window.speechSynthesis&&typeof SpeechSynthesisUtterance!=='undefined'){
          const utter=new SpeechSynthesisUtterance(line);
          utter.lang='zh-CN';utter.rate=.96;utter.pitch=1.08;
          if(music)music.gain.gain.setTargetAtTime(.09,ctx.currentTime,.045);
          utter.onend=utter.onerror=()=>{if(ticket===speechTicket&&music&&ctx)music.gain.gain.setTargetAtTime(.31,ctx.currentTime,.09);};
          window.speechSynthesis.speak(utter);
          return true;
        }
      }catch{}
      effect('dock');
      return true;
    }
    try{
      if(ctx.state!=='running')await ctx.resume();
      if(!voices.has(stage))voices.set(stage,assetBuffer(voiceFiles[stage]).then(bytes=>ctx.decodeAudioData(bytes)));
      const buffer=await voices.get(stage);
      if(ticket!==speechTicket||!visible())return false;
      const line=ctx.createBufferSource();line.buffer=buffer;line.connect(master);speech=line;
      if(music)music.gain.gain.setTargetAtTime(.09,ctx.currentTime,.045);
      line.onended=()=>{if(speech===line){speech=null;if(music)music.gain.gain.setTargetAtTime(.31,ctx.currentTime,.09);}line.disconnect();};
      line.start();return true;
    }catch{voices.delete(stage);return false;}
  }
  function visible(){return foreground&&!document.hidden;}
  function release(source,nodes){source.onended=()=>{source.disconnect();for(const node of nodes)node.disconnect();};}
  function silenceMusic(){
    if(!music)return;
    const {source,gain,started,from}=music,now=ctx.currentTime;music=null;
    offset=(from+now-started)%theme.duration;
    gain.gain.cancelScheduledValues(now);gain.gain.setTargetAtTime(0,now,.025);source.stop(now+.105);
  }
  function stopMotor(){
    if(!motor)return;
    const {osc,noise,volume}=motor,now=ctx.currentTime;motor=null;
    volume.gain.cancelScheduledValues(now);volume.gain.setTargetAtTime(0,now,.023);
    osc.stop(now+.095);noise.stop(now+.095);
  }
  function startMusic(){
    if(!ctx||!game||!visible()||!options.music||ctx.state!=='running'){silenceMusic();return;}
    if(!theme){
      if(!decoding){
        decoding=true;
        assetBuffer(musicBytes).then(bytes=>ctx.decodeAudioData(bytes)).then(buffer=>{theme=buffer;startMusic();}).catch(()=>{decoding=false;});
      }
      return;
    }
    if(music)return;
    const source=ctx.createBufferSource(),gain=ctx.createGain(),now=ctx.currentTime;
    source.buffer=theme;source.loop=true;source.loopEnd=theme.duration;
    gain.gain.setValueAtTime(0,now);gain.gain.setTargetAtTime(.31,now,.09);
    source.connect(gain).connect(master);release(source,[gain]);source.start(now,offset);
    music={source,gain,started:now,from:offset};
  }
  function initialize(){
    ctx=new AudioContext({latencyHint:'interactive'});
    master=ctx.createDynamicsCompressor();master.threshold.value=-13;master.knee.value=12;master.ratio.value=3;
    master.connect(ctx.destination);
    effectsBus=ctx.createGain();effectsBus.gain.value=options.effects?.76:0;effectsBus.connect(master);
    noiseBuffer=ctx.createBuffer(1,Math.floor(ctx.sampleRate*.64),ctx.sampleRate);
    const samples=noiseBuffer.getChannelData(0);let seed=95677;
    for(let i=0;i<samples.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;samples[i]=seed/2147483648-1;}
    ctx.onstatechange=startMusic;
  }
  function unlock(){
    interacted=true;if(!visible())return;
    try{
      if(!ctx)initialize();
      if(ctx.state!=='running')return ctx.resume().then(startMusic).catch(()=>{});
      else startMusic();
    }catch{/* The controls still work on a device without Web Audio. */}
  }
  function focusAudio(){
    if(!ctx)return;
    if(!visible()){
      stopSpeech();silenceMusic();stopMotor();ctx.suspend().catch(()=>{});
    }else if(interacted)unlock();
  }
  document.addEventListener('visibilitychange',focusAudio);
  window.BudSound={setForeground(on){foreground=!!on;focusAudio();}};
  document.addEventListener('click',unlock,{capture:true});
  document.addEventListener('keydown',e=>{if(!e.repeat)unlock();},{capture:true});

  function note(hz,endHz,duration,amplitude,type='sine',delay=0){
    const start=ctx.currentTime+delay,osc=ctx.createOscillator(),gain=ctx.createGain();
    osc.type=type;osc.frequency.setValueAtTime(hz,start);osc.frequency.exponentialRampToValueAtTime(endHz,start+duration);
    gain.gain.setValueAtTime(.0001,start);gain.gain.linearRampToValueAtTime(amplitude,start+.005);
    gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
    osc.connect(gain).connect(effectsBus);release(osc,[gain]);osc.start(start);osc.stop(start+duration+.015);
  }
  function rustle(hz,duration,amplitude,delay=0,q=.9){
    const start=ctx.currentTime+delay,source=ctx.createBufferSource(),tone=ctx.createBiquadFilter(),gain=ctx.createGain();
    source.buffer=noiseBuffer;source.loop=true;tone.type='bandpass';tone.frequency.value=hz;tone.Q.value=q;
    gain.gain.setValueAtTime(.0001,start);gain.gain.linearRampToValueAtTime(amplitude,start+.007);
    gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
    source.connect(tone).connect(gain).connect(effectsBus);release(source,[tone,gain]);source.start(start);source.stop(start+duration+.012);
  }
  function effect(kind,material='soft',strength=1){
    if(!ctx||!options.effects||!visible()||ctx.state!=='running')return;
    const hard=material==='hard',s=Math.min(1.3,Math.max(.35,strength));
    switch(kind){
      case 'coin':
        for(const [delay,hz,amp] of [[0,1760,.17],[.047,2390,.10],[.105,1318,.12],[.155,2093,.058]])note(hz,hz*.985,.17,amp,'sine',delay);
        rustle(3100,.045,.13);break;
      case 'aisle':rustle(780,.30,.09);note(294,392,.26,.059,'sine',.03);break;
      case 'dock':note(523,523,.17,.072);note(659,659,.20,.074,'sine',.095);break;
      case 'tap':note(610,520,.095,.085);break;
      case 'start':rustle(1320,.052,.15);note(280,158,.15,.12,'triangle');break;
      case 'jaw':rustle(2600,.057,.28);note(790,530,.084,.15,'triangle');note(1390,1220,.072,.067,'sine',.029);break;
      case 'slip':rustle(hard?1780:1040,.14,.13);note(380,205,.105,.072,'triangle');break;
      case 'land':
        note(hard?197:126,hard?106:67,.18,.22*s,'triangle');rustle(hard?1740:690,.17,.24*s);
        if(hard)note(660,588,.095,.054*s,'sine',.023);break;
      case 'roll':
        for(const [delay,amp] of [[0,.15],[.077,.095],[.16,.063],[.25,.034]]){
          rustle(hard?1470:670,.075,amp*s,delay);note(hard?242:146,hard?146:95,.08,.59*amp*s,'triangle',delay);
        }
        break;
      case 'empty':note(292,183,.18,.095,'triangle');rustle(1250,.055,.10,.035);break;
      case 'prize':note(133,70,.19,.23,'triangle');rustle(860,.15,.17);
        [523,659,784].forEach((f,i)=>note(f,f,.28,.15,'sine',.095+i*.105));break;
      case 'gate':rustle(1160,.23,.19);note(175,265,.18,.09,'triangle');break;
      case 'home':note(300,178,.080,.077,'triangle');rustle(1450,.055,.10);break;
      case 'win':[659,784,880,1047].forEach((f,i)=>note(f,f,.34,.13,'sine',.13*i));break;
    }
  }
  function drive(horizontal,vertical){
    if(!ctx||!game||!options.effects||!visible()||ctx.state!=='running'){stopMotor();return;}
    const speed=Math.hypot(horizontal,vertical),now=ctx.currentTime;
    if(speed<.075){stopMotor();return;}
    if(!motor){
      const osc=ctx.createOscillator(),noise=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),volume=ctx.createGain();
      osc.type='triangle';osc.frequency.value=75;noise.buffer=noiseBuffer;noise.loop=true;
      filter.type='bandpass';filter.frequency.value=420;filter.Q.value=2.4;volume.gain.value=.0001;
      osc.connect(volume);noise.connect(filter).connect(volume);volume.connect(effectsBus);
      release(osc,[volume]);release(noise,[filter]);osc.start();noise.start();motor={osc,noise,filter,volume,last:-1};
    }
    if(now-motor.last<.038)return;motor.last=now;
    const amount=Math.min(1,speed/3.4),winding=Math.abs(vertical)>horizontal;
    motor.osc.frequency.setTargetAtTime((winding?86:59)+amount*(winding?46:28),now,.045);
    motor.filter.frequency.setTargetAtTime((winding?540:325)+125*amount,now,.055);
    motor.volume.gain.setTargetAtTime(.022+.052*amount,now,.04);
  }
  function setGame(on){game=on;if(!on)stopMotor();startMusic();}
  const dialog=$('sound-settings');
  function display(){ $('music-on').checked=options.music;$('effects-on').checked=options.effects;
    $('read-request').disabled=!options.music&&!options.effects;
    $('game-sound').setAttribute('aria-label',options.music||options.effects?'声音设置':'声音设置，已静音');}
  for(const id of ['menu-sound','game-sound'])$(id).addEventListener('click',()=>{
    opener=$(id);display();dialog.showModal();$('music-on').focus({preventScroll:true});
  });
  async function change(){
    options={music:$('music-on').checked,effects:$('effects-on').checked};
    try{localStorage.setItem(settingsKey,JSON.stringify(options));}catch{/* Keep this choice for the current game. */}
    if(!options.music&&!options.effects)stopSpeech();
    display();await unlock();
    if(ctx){
      effectsBus.gain.setTargetAtTime(options.effects?.76:0,ctx.currentTime,.012);
      if(!options.effects)stopMotor();
      startMusic();
    }
  }
  $('music-on').addEventListener('change',change);
  $('effects-on').addEventListener('change',async()=>{await change();if(options.effects)effect('coin');});
  $('sound-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));display();
  return {unlock,setGame,effect,drive,readRequest,stopSpeech};
}
