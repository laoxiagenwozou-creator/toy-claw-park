import {POOLS} from './library.js';
import {LIMIT} from './playfield.js';
import {recoverShelf} from './keepsakes.js';
const KEY='toy-park-v2',LEGACY='adventure-bay-pup-claw-v1';
export const LOW_STOCK=2;
export const remaining=b=>b.slots.filter(Boolean).length;
const read=key=>{try{return JSON.parse(localStorage.getItem(key));}catch{return null;}};
const count=n=>Number.isSafeInteger(n)&&n>=0?n:0;
const empty=(pool)=>({slots:Array.from({length:6},(_,i)=>pool[i]??null),shelf:recoverShelf(null,pool),poses:Array(6).fill(null),generations:Array(6).fill(0),total:0,round:0,clears:0,next:pool.length?6%pool.length:0});
function recover(raw,pool,stage){
  const b=empty(pool);
  if(!raw || !Array.isArray(raw.slots) || raw.slots.length!==6 ||
    !raw.slots.every(k=>k===null||pool.includes(k)) ||
    new Set(raw.slots.filter(Boolean)).size!==remaining(raw))return b;
  const poses=raw.slots.map((kind,i)=>{
    const p=raw.poses?.[i];
    return kind&&p&&Number.isFinite(p.x)&&Number.isFinite(p.z)&&Number.isFinite(p.angle)&&
      p.x>=LIMIT.left-1&&p.x<=LIMIT.right+1&&p.z>=LIMIT.back-1&&p.z<=LIMIT.front+1?
      {x:p.x,z:p.z,angle:p.angle%(2*Math.PI)}:null;
  });
  return {...b,slots:raw.slots.slice(),shelf:recoverShelf(raw.shelf,pool,stage),poses,generations:Array.from({length:6},(_,i)=>count(raw.generations?.[i])),
    total:count(raw.total),round:Math.min(6,count(raw.round)),clears:Math.max(count(raw.clears),count(raw.round)>=6?1:0),next:pool.length?count(raw.next)%pool.length:0};
}
export function loadBoards(){
  const saved=read(KEY),boards={};
  for(const [id,pool] of Object.entries(POOLS)){
    const legacy=id==='lookout'&&!saved?.[id]?read(LEGACY):null;
    boards[id]=recover(saved?.[id]??legacy,pool,id);
  }
  return boards;
}
// Capture, payout and inventory share one atomic save. Every writer starts from the latest board.
export function changeBoard(boards,id,change){
  const commit=()=>{
    const disk=read(KEY)||{},next=recover(disk[id]||boards[id],POOLS[id],id);
    const result=change(next);
    if(result!==false)localStorage.setItem(KEY,JSON.stringify({...boards,...disk,[id]:next}));
    Object.assign(boards[id],next);
    return result;
  };
  return navigator.locks?navigator.locks.request(KEY,commit):Promise.resolve().then(commit);
}
export function syncBoards(boards){
  const disk=read(KEY)||{};
  for(const [id,board] of Object.entries(boards))if(disk[id])Object.assign(board,recover(disk[id],POOLS[id],id));
}
export function syncShelves(boards){
  const disk=read(KEY)||{};
  for(const [id,board] of Object.entries(boards)){
    if(disk[id])board.shelf=recoverShelf(disk[id].shelf,POOLS[id],id);
  }
}
export function deliver(board,pool){
  if(remaining(board)>LOW_STOCK)return [];
  const onboard=new Set(board.slots.filter(Boolean)),batch=[];
  const candidates=pool.slice(board.next).concat(pool.slice(0,board.next));
  board.slots.forEach((kind,id)=>{
    if(kind!==null)return;
    const next=candidates.find(k=>!onboard.has(k));
    if(!next)return;
    board.next=(pool.indexOf(next)+1)%pool.length;
    onboard.add(next);board.slots[id]=next;board.poses[id]=null;board.generations[id]++;
    batch.push({id,kind:next});
  });
  return batch;
}
export function newRound(board){
  board.round=0;
}
