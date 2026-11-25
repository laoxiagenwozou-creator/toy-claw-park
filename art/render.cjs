const {join}=require('node:path');
const {chromium}=require('playwright');
const modules=process.env.TOY_CLAW_NODE_MODULES||join(__dirname,'../node_modules');
const {buildSync}=require(join(modules,'esbuild'));
const {qaDir}=require('../qa/paths.cjs');
const study=process.argv.includes('--study');
const js=buildSync({absWorkingDir:join(__dirname,'..'),entryPoints:[study?'art/pup-study.js':'art/postcards.js'],nodePaths:[modules],bundle:true,write:false,format:'iife',loader:{'.webp':'dataurl','.glb':'binary'}}).outputFiles[0].text;
(async()=>{
  const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  try{
    const p=await browser.newPage({viewport:study?{width:1200,height:790}:{width:840,height:490},offline:true});
    p.on('pageerror',e=>console.error(e));p.on('console',m=>{if(m.type()==='error')console.error(m.text());});
    await p.setContent('<style>*{margin:0}canvas{display:block}</style>');await p.addScriptTag({content:js});
    if(study){await p.waitForFunction(()=>window.ready);await p.screenshot({path:join(qaDir,'sculpts.jpg')});}
    else for(const id of (process.argv.includes('--snow-only')?['snow']:['snow','town','garden','lookout','yard','reef','space'])){
      await p.evaluate(id=>window.renderPostcard(id),id);
      await p.screenshot({path:join(qaDir,'card-'+id+'.png')});
    }
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
