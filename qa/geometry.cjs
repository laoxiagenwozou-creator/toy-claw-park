const {qaDir,gameHtml}=require('./paths.cjs');
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const modules=path.resolve(__dirname,'../node_modules');
const src=require(path.join(modules,'esbuild')).buildSync({entryPoints:[path.join(__dirname,'geometry.js')],nodePaths:[modules],bundle:true,write:false,format:'iife',loader:{'.glb':'binary'}}).outputFiles[0].text;
(async()=>{const browser=await chromium.launch({headless:true});try{const page=await browser.newPage({offline:true});await page.setContent('<body/>');await page.addScriptTag({content:src});const rows=await page.evaluate(()=>window.checkSculpts());fs.writeFileSync(path.join(qaDir,'geometry.json'),JSON.stringify(rows,null,2));console.log(rows.length,'solid prizes; center, reachable edge win/slip and empty miss at 10 poses per prize');console.log(rows.filter(x=>['bluey','bingo','skye'].includes(x.id)));}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
