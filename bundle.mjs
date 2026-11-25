import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = dirname(fileURLToPath(import.meta.url));
const modules = process.env.TOY_CLAW_NODE_MODULES || join(project, 'node_modules');
const esbuild = createRequire(import.meta.url)(join(modules, 'esbuild'));
const buildDir = process.env.TOY_CLAW_BUILD_DIR || resolve(project, '../../99_Temp/toy-claw-park/build');
const assets = join(buildDir, 'assets');
const desktop = resolve(process.argv[2] || join(buildDir, 'desktop', 'index.html'));
const common = {absWorkingDir:project, entryPoints:['web/game.js'], nodePaths:[modules],
  bundle:true, write:false, format:'iife', target:'chrome105', minify:true, charset:'utf8'};
// The iPad shell supplies locally converted Apple Lossless tracks for Web Audio.
// Plain desktop and Android builds use the original Ogg files.
const ipadAudio = process.env.TOY_CLAW_IPAD_AUDIO_DIR;
const audioPlugins = ipadAudio ? [{
  name: 'ipad-audio',
  setup(build) {
    build.onLoad({filter: /\.ogg$/}, async ({path}) => ({
      contents: await readFile(join(ipadAudio, basename(path, '.ogg') + '.m4a')),
      loader: 'binary'
    }));
  }
}] : [];
const [template, css, ipadTouchCSS, threeLicense, modelLicense, logo, icon, standalone, native] = await Promise.all([
  readFile(join(project,'web/index.html'),'utf8'),
  Promise.all(['style.css', 'playroom.css', 'medals.css'].map(name=>readFile(join(project,'web',name),'utf8'))).then(x=>x.join('\n')),
  ipadAudio ? readFile(join(project,'iPad/App/Touch.css'),'utf8') : '',
  readFile(join(modules,'three/LICENSE'),'utf8'), readFile(join(project,'art/bluey-source-LICENSE'),'utf8'),
  readFile(join(project,'web/assets/park-logo.webp')), readFile(join(project,'web/assets/park-favicon.png')),
  esbuild.build({...common, plugins:audioPlugins, loader:{'.webp':'dataurl','.glb':'binary','.ogg':'binary'}}),
  esbuild.build({...common, outdir:assets, entryNames:'game', assetNames:'media/[name]',
    loader:{'.webp':'file','.glb':'file','.ogg':'file'}})
]);
async function save(path, contents) {
  await mkdir(dirname(path),{recursive:true});
  await writeFile(path,contents);
}
const source = template.replace('/* MODEL LICENSE */',()=>modelLicense).replace('/* LICENSE */',()=>threeLicense);
const html = source.replace('__PARK_LOGO__',()=> 'data:image/webp;base64,'+logo.toString('base64'))
  .replace('__PARK_FAVICON__',()=> 'data:image/png;base64,'+icon.toString('base64'))
  .replace('/* STYLES */',()=>ipadTouchCSS ? css+'\n'+ipadTouchCSS : css)
  .replace('/* BUNDLE */',()=>standalone.outputFiles[0].text.replace(/<\/script/gi,'<\\/script'));
const nativeHtml = source.replace('__PARK_LOGO__','media/park-logo.webp').replace('__PARK_FAVICON__','media/park-favicon.png')
  .replace("<style>/* STYLES */</style>",'<link rel="stylesheet" href="park.css">')
  .replace("<script>/* BUNDLE */</script>",'<script src="game.js"></script>')
  .replace("script-src 'unsafe-inline'", "script-src 'self'").replace("style-src 'unsafe-inline'", "style-src 'self' 'unsafe-inline'")
  .replace("img-src data:", "img-src 'self' data:").replace("connect-src blob:", "connect-src 'self' blob:");
await Promise.all([save(desktop,html), save(join(assets,'index.html'),nativeHtml), save(join(assets,'park.css'),css),
  save(join(assets,'media/park-logo.webp'),logo), save(join(assets,'media/park-favicon.png'),icon),
  ...native.outputFiles.map(file=>save(file.path,file.contents))]);
console.log('Desktop '+Buffer.byteLength(html)+' bytes; Android entry '+Buffer.byteLength(nativeHtml)+' bytes, '+native.outputFiles.length+' bundled script/media files.');
