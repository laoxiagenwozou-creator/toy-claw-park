const assert=require('node:assert/strict'),{chromium}=require('playwright'),{pathToFileURL}=require('node:url');
const {gameHtml}=require('./paths.cjs');
(async()=>{
  const browser=await chromium.launch({args:['--use-angle=d3d11']});
  try{
    const ctx=await browser.newContext({offline:true,reducedMotion:'reduce',viewport:{width:850,height:550}});
    const url=pathToFileURL(gameHtml).href,p=await ctx.newPage();await p.goto(url);
    await p.evaluate(()=>{
      const kinds=['fire','racer','plane','scooter','crane','bus'];
      localStorage.setItem('toy-park-v2',JSON.stringify({town:{slots:[null,...kinds.slice(1)],total:17,round:6,clears:2,next:6,generations:Array(6).fill(0),
        poses:Array(6).fill(null),shelf:{pending:{fire:1},owned:{},order:[],request:'delivery'}}}));
    });
    await p.reload();const other=await ctx.newPage();await other.goto(url);
    // The sixth toy is reachable both above the win screen and from the free-play shelf.
    await p.locator('.stage-card[data-stage=town]').click();await p.locator('#win').waitFor();
    await p.locator('#win-collect').click();
    await other.locator('#shelf-open').click();await other.locator('#waiting-toys [data-kind=fire]').click();
    await Promise.all([p,other].map(q=>q.waitForFunction(()=>document.querySelector('#toy-view').dataset.ready==='true',null,{polling:25})));
    await Promise.all([p,other].map(q=>q.locator('#place-toy').evaluate(el=>el.click())));
    await p.waitForFunction(()=>JSON.parse(localStorage.getItem('toy-park-v2')).town.shelf.owned.fire===1);
    const state=await p.evaluate(()=>JSON.parse(localStorage.getItem('toy-park-v2')).town);
    assert.equal(state.total,17);assert.equal(state.round,6);assert.equal(state.clears,2);
    assert.deepEqual(state.shelf.pending,{});assert.deepEqual(state.shelf.owned,{fire:1});assert.equal(state.shelf.request,'complete');
    console.log('PASS won stage can collect its sixth toy; two windows tried to deliver one waiting fire engine, one toy was shelved; existing score unchanged.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
