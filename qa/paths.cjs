const path=require('node:path'),fs=require('node:fs');
const scratch=path.resolve(__dirname,'../../../99_Temp/toy-claw-park');
const qaDir=process.env.TOY_CLAW_QA_DIR||path.join(scratch,'qa');
const buildDir=process.env.TOY_CLAW_BUILD_DIR||path.join(scratch,'build');
fs.mkdirSync(qaDir,{recursive:true});
module.exports={qaDir,gameHtml:process.env.TOY_CLAW_HTML||path.join(buildDir,'desktop','index.html')};
