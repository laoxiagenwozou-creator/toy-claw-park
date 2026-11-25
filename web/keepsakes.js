import {REQUESTS} from './requests.js';

const stagesOfRequest=['available','accepted','delivery','complete'];
const safeCount=n=>Number.isSafeInteger(n)&&n>0?n:0;
export function recoverShelf(raw,pool,stage){
  const counts=rows=>Object.fromEntries(pool.filter(id=>safeCount(rows?.[id])).map(id=>[id,rows[id]]));
  const owned=counts(raw?.owned),pending=counts(raw?.pending);
  const order=[...new Set([...(Array.isArray(raw?.order)?raw.order:[]),...Object.keys(owned)])].filter(id=>owned[id]);
  let request=stagesOfRequest.includes(raw?.request)?raw.request:'available';
  if(request==='accepted'&&pending[REQUESTS[stage]?.kind])request='delivery';
  return {pending,owned,order,request};
}
export function awardToy(board,stage,slot,kind,generation){
  if(board.round>=6||board.slots[slot]!==kind||board.generations[slot]!==generation)return false;
  const shelf=board.shelf;
  board.slots[slot]=null;board.poses[slot]=null;
  board.total++;board.round=Math.min(6,board.round+1);
  if(board.round===6)board.clears++;
  shelf.pending[kind]=(shelf.pending[kind]||0)+1;
  if(shelf.request==='accepted'&&REQUESTS[stage].kind===kind)shelf.request='delivery';
  return true;
}
export function takeToy(board,stage,kind){
  const shelf=board.shelf;
  if(!shelf.pending[kind])return false;
  if(--shelf.pending[kind]===0)delete shelf.pending[kind];
  if(!shelf.owned[kind])shelf.order.push(kind);
  shelf.owned[kind]=(shelf.owned[kind]||0)+1;
  if((shelf.request==='accepted'||shelf.request==='delivery')&&kind===REQUESTS[stage].kind)shelf.request='complete';
  return true;
}
export function acceptRequest(board,stage){
  const shelf=board.shelf;
  if(shelf.request!=='available')return false;
  shelf.request=shelf.pending[REQUESTS[stage].kind]?'delivery':'accepted';
  return true;
}
export function moveToy(shelf,kind,step){
  const from=shelf.order.indexOf(kind),to=from+step;
  if(from<0||to<0||to>=shelf.order.length)return false;
  [shelf.order[from],shelf.order[to]]=[shelf.order[to],shelf.order[from]];
  return true;
}
