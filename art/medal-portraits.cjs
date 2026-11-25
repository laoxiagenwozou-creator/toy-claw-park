// Render each medal's actual prize to a high-resolution transparent atlas.
const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require('playwright'),esbuild=require('esbuild');
const root=path.resolve(__dirname,'..'),scratch=process.env.TOY_CLAW_QA_DIR;
if(!scratch)throw Error('Set TOY_CLAW_QA_DIR to a temporary directory.');
(async()=>{
  fs.mkdirSync(scratch,{recursive:true});
  const {outputFiles}=await esbuild.build({nodePaths:[process.env.TOY_CLAW_NODE_MODULES||path.join(root,'node_modules')],
    stdin:{resolveDir:root,contents:`
      import {createToyView} from './web/toy-view.js';
      import {MEDALS} from './web/medal-series.js';
      window.renderMedals=async()=>{
        const source=document.querySelector('canvas'),view=createToyView(source),tile=512;
        const atlas=document.createElement('canvas');atlas.width=tile*4;atlas.height=tile*3;
        const ctx=atlas.getContext('2d');
        const crop=document.createElement('canvas');crop.width=crop.height=tile;
        const scan=crop.getContext('2d',{willReadFrequently:true});
        for(const [stage,design] of Object.entries(MEDALS)){
          await view.show(design.kind,{interactive:false});
          view.renderAt(tile,tile);scan.clearRect(0,0,tile,tile);scan.drawImage(source,0,0);
          const rgba=scan.getImageData(0,0,tile,tile).data;
          let left=tile,right=0,top=tile,bottom=0;
          for(let y=0;y<tile;y++)for(let x=0;x<tile;x++){
            if(rgba[(y*tile+x)*4+3]<12)continue;
            left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
          }
          if(right<=left||bottom<=top)throw Error(stage+' did not render');
          const width=right-left+1,height=bottom-top+1,factor=tile*.90/Math.max(width,height);
          const x=(design.number-1)%4*tile+(tile-width*factor)/2;
          const y=Math.floor((design.number-1)/4)*tile+(tile-height*factor)/2;
          ctx.drawImage(crop,left,top,width,height,x,y,width*factor,height*factor);
        }
        view.dispose();return atlas.toDataURL('image/webp',.94).split(',')[1];
      };`},bundle:true,write:false,minify:true,loader:{'.glb':'binary','.webp':'dataurl'}});
  const html=path.join(scratch,'medal-models.html');
  fs.writeFileSync(html,'<canvas style="width:512px;height:512px"></canvas><script>'+outputFiles[0].text.replace(/<\/script/gi,'<\\/script')+'</script>');
  const browser=await chromium.launch({args:['--use-angle=d3d11']});
  try{
    const page=await browser.newPage({offline:true});await page.goto(pathToFileURL(html).href);
    const contents=await page.evaluate(()=>renderMedals());
    fs.writeFileSync(path.join(root,'web/assets/medal-portraits.webp'),Buffer.from(contents,'base64'));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
