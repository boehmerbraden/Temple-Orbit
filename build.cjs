// Dependency-free release: static website and one self-contained offline HTML.
const fs=require('node:fs'),path=require('node:path');
const root=__dirname,read=p=>fs.readFileSync(path.join(root,p),'utf8');
let html=read('index.html').replace('<link rel="stylesheet" href="style.css">',()=>`<style>${read('style.css')}</style>`);
for(let name of['core','audio','art','game'])html=html.replace(`<script src="src/${name}.js"></script>`,()=>`<script>\n${read('src/'+name+'.js')}\n</script>`);
fs.mkdirSync(path.join(root,'dist'),{recursive:true});
fs.writeFileSync(path.join(root,'dist/index.html'),html);
fs.writeFileSync(path.join(root,'Temple-Orbit.html'),html);
console.log('Built dist/index.html and Temple-Orbit.html; no external requests or runtime dependencies.');
