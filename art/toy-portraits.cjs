// Render the game's actual models to a transparent 8-column WebP contact sheet.
const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const esbuild=require('esbuild'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),scratch=process.env.TOY_CLAW_QA_DIR;
if(!scratch)throw Error('Set TOY_CLAW_QA_DIR to a temporary directory.');
(async()=>{
  fs.mkdirSync(scratch,{recursive:true});
  const {outputFiles}=await esbuild.build({nodePaths:[process.env.TOY_CLAW_NODE_MODULES||path.join(root,'node_modules')],stdin:{contents:`
    import {createToyView} from './web/toy-view.js';
    import {POOLS} from './web/library.js';
    window.makeSheet=async()=>{
      const canvas=document.querySelector('canvas'),view=createToyView(canvas),tile=192,ids=Object.values(POOLS).flat();
      const sheet=document.createElement('canvas');sheet.width=tile*8;sheet.height=tile*Math.ceil(ids.length/8);
      const g=sheet.getContext('2d');for(const [i,id] of ids.entries()){
        await view.show(id,{interactive:false});view.renderAt(tile,tile);g.drawImage(canvas,(i%8)*tile,Math.floor(i/8)*tile,tile,tile);
      }
      const cards={};
      const cast={pony:['ponyDash','ponyShy','ponyTwilight'],peppa:['peppaGeorge','peppaDad','peppaPig'],
        sheriff:['sheriffDobie','sheriffPapillon','sheriffLab'],chicks:['chickJack','chickDuri','chickChip'],
        spidey:['webMiles','webGwen','webPeter']};
      for(const [stage,toys] of Object.entries(cast)){
        const img=new Image();img.src=window.backdrops[stage];await img.decode();
        const card=document.createElement('canvas');card.width=560;card.height=340;
        const ctx=card.getContext('2d'),scale=Math.max(560/img.width,340/img.height);
        ctx.drawImage(img,(560-img.width*scale)/2,(340-img.height*scale)/2,img.width*scale,img.height*scale);
        for(const [k,id] of toys.entries()){
          const [cx,base,side]=[[111,294,219],[438,294,226],[275,326,298]][k];
          const shade=ctx.createRadialGradient(cx,base,2,cx,base,side*.32);
          shade.addColorStop(0,'rgba(31,49,45,.36)');shade.addColorStop(1,'rgba(31,49,45,0)');
          ctx.save();ctx.translate(0,base*.80);ctx.scale(1,.20);ctx.fillStyle=shade;ctx.fillRect(cx-side*.34,base-side*.34,side*.68,side*.68);ctx.restore();
          await view.show(id,{interactive:false});view.renderAt(384,384);
          ctx.drawImage(canvas,cx-side/2,base-side*.86,side,side);
        }
        cards[stage]=card.toDataURL('image/webp',.88).split(',')[1];
      }
      view.dispose();return {count:ids.length,cards,data:sheet.toDataURL('image/webp',.90).split(',')[1]};
    };`,resolveDir:root},bundle:true,write:false,minify:true,loader:{'.glb':'binary','.webp':'dataurl'}});
  const html=path.join(scratch,'portraits-render.html');fs.writeFileSync(html,'<canvas style="width:192px;height:192px"></canvas><script>'+outputFiles[0].text.replace(/<\/script/gi,'<\\/script')+'</script>');
  const browser=await chromium.launch({args:['--use-angle=d3d11']});
  try{const page=await browser.newPage({offline:true});await page.goto(pathToFileURL(html).href);
    const stages=['pony','peppa','sheriff','chicks','spidey'];
    const files=Object.fromEntries(stages.map(s=>[s,'data:image/webp;base64,'+fs.readFileSync(path.join(root,'web/assets',s+'.webp')).toString('base64')]));
    await page.evaluate(files=>{window.backdrops=files},files);
    const {data,count,cards}=await page.evaluate(()=>makeSheet());
    for(const [stage,picture] of Object.entries(cards))fs.writeFileSync(path.join(root,'web/assets','card-'+stage+'.webp'),Buffer.from(picture,'base64'));
    fs.writeFileSync(path.join(root,'web/assets/toy-portraits.webp'),Buffer.from(data,'base64'));
    console.log(count+' toy portraits');}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
