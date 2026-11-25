const {spawnSync}=require('node:child_process');
const adb='C:/Users/13388/AppData/Local/Android/Sdk/platform-tools/adb.exe';
const args=process.argv.slice(2);
if(!['tap','swipe'].includes(args[0])||args.length!==(args[0]==='tap'?3:6)||args.slice(1).some(a=>!/^\d{1,4}$/.test(a)))throw Error('Expected an on-screen touch');
const check=spawnSync(adb,['-s','d0f3bf40','shell','dumpsys','window'],{encoding:'utf8'});
if(!check.stdout.split('\n').some(l=>l.includes('mCurrentFocus=')&&l.includes('dev.playroom.pupclaw')))throw Error('Game does not have focus');
const input=spawnSync(adb,['-s','d0f3bf40','shell','input','touchscreen',...args],{stdio:'inherit'});process.exitCode=input.status??1;
