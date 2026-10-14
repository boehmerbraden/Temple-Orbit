/* Presentation only. Cached procedural scenery and sprites; no simulation state. */
(()=>{
'use strict';
const palettes=[
 ['#071e25','#245147','#68ead0','#bbd888'],
 ['#111b35','#334567','#a3caff','#b7cbdc'],
 ['#172721','#4b5741','#d7e69b','#dfc97e'],
 ['#082a34','#225763','#64e7ec','#97cabd'],
 ['#281b24','#624336','#ffa658','#d7b57a'],
 ['#17152f','#3d3c62','#bd9dff','#d8c0ef']
];
const colors=['#ff5075','#34f1df','#ffcf43','#a78bff','#a0f04f','#ff923f','#eef4ff'];
function disk(c,x,y,r,fill,stroke,w=1){c.beginPath();c.arc(x,y,r,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.stroke();}}
function line(c,points,color,width=1){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function glow(c,x,y,r,color){let g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,color.slice(0,7)+'00');disk(c,x,y,r,g);}
function rune(c,x,y,size,angle,color){c.save();c.translate(x,y);c.rotate(angle);line(c,[[-size,0],[0,-size],[size,0],[0,size],[-size,0]],color,1.1);line(c,[[0,-size],[0,size]],color,1);c.restore();}
function leaf(c,x,y,length,angle,color){c.save();c.translate(x,y);c.rotate(angle);c.beginPath();c.moveTo(0,0);c.bezierCurveTo(-length*.38,-length*.3,-length*.18,-length*.85,0,-length);c.bezierCurveTo(length*.28,-length*.67,length*.28,-length*.25,0,0);c.fillStyle=color;c.fill();line(c,[[0,0],[0,-length*.87]],'#bacb8a18');c.restore();}
function background(game){const canvas=document.createElement('canvas');canvas.width=980;canvas.height=640;const c=canvas.getContext('2d'),[night,stone,magic,gold]=palettes[game.level];let seed=345+game.level*92;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 const sky=c.createLinearGradient(0,0,0,640);sky.addColorStop(0,night);sky.addColorStop(.5,stone);sky.addColorStop(1,night);c.fillStyle=sky;c.fillRect(0,0,980,640);
 // Distant steps, ruined sanctuary and soft shafts of light.
 glow(c,490,50,390,magic+'24');for(let i=0;i<6;i++){c.fillStyle='#061a2070';c.fillRect(300+i*24,42-i*14,380-i*48,85+i*8);line(c,[[300+i*24,42-i*14],[680-i*24,42-i*14]],gold+'22',2);}
 for(let i=0;i<5;i++){c.beginPath();c.moveTo(130+i*175,-20);c.lineTo(235+i*160,640);c.lineTo(360+i*160,640);c.lineTo(155+i*175,-20);c.fillStyle=magic+'05';c.fill();}
 for(let y=0;y<640;y+=64)for(let x=-60+(y%128?50:0);x<980;x+=100){let g=c.createLinearGradient(x,y,x+100,y+64);g.addColorStop(0,'#9baa8a09');g.addColorStop(1,'#00000015');c.fillStyle=g;c.fillRect(x+1,y+1,98,62);line(c,[[x+1,y+61],[x+1,y+1],[x+98,y+1]],'#d6d3ad09');if(rand()>.6)line(c,[[x+35,y],[x+43,y+13],[x+39,y+27],[x+52,y+34]],'#0000001a');}
 // Weathered column pairs with carved bands and hanging vines.
 for(let x of[24,914]){c.fillStyle='#07191e';c.fillRect(x-8,58,57,522);let g=c.createLinearGradient(x,0,x+40,0);g.addColorStop(0,'#233c3c');g.addColorStop(.4,'#607067');g.addColorStop(1,'#1a3033');c.fillStyle=g;c.fillRect(x,54,40,520);for(let y=68;y<590;y+=58){c.fillStyle=stone;c.fillRect(x-7,y,54,12);line(c,[[x-7,y],[x+47,y]],gold+'60',2);rune(c,x+20,y+32,8,0,gold+'52');}line(c,[[x+9,90],[x+14,182],[x+8,222],[x+21,275]],'#081b21',2);}
 // Recessed double-bevel track; tessellated edges and gold inlay.
 const trace=(width,color)=>{c.beginPath();game.path.samples.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.strokeStyle=color;c.lineWidth=width;c.lineJoin='round';c.lineCap='round';c.stroke();};
 c.save();c.translate(0,7);trace(65,'#00000055');c.restore();trace(62,'#071b20');trace(58,gold+'7a');trace(54,'#617268');trace(49,'#293e40');trace(42,'#0b2026');trace(35,'#142b31');trace(2,magic+'13');
 for(let s=0;s<game.path.length;s+=29){let p=game.path.at(s),t=game.path.tangent(s),a=Math.atan2(t.y,t.x);c.save();c.translate(p.x,p.y);c.rotate(a);for(let side of[-1,1]){line(c,[[-10,side*25],[10,side*25]],gold+'60',2);line(c,[[12,side*22],[12,side*29]],'#091d25',2);if(Math.floor(s/29)%3===0)rune(c,0,side*25,2,0,magic+'8a');}c.restore();}
 // Damp moss and textured stone; generated once per board.
 for(let i=0;i<1800;i++){let x=rand()*980,y=rand()*640;c.fillStyle=i%3?'#e9f1c707':'#0000000c';c.fillRect(x,y,rand()*4+1,rand()*2+1);}
 for(let i=0;i<35;i++){let side=i%2,x=side?970:10,y=rand()*640;leaf(c,x,y,40+rand()*85,(side?-1:1)*(.5+rand()),i%3?'#0b292b':'#205043');}
 for(let i=0;i<22;i++){let x=rand()*980;leaf(c,x,-8,35+rand()*70,Math.PI+(rand()-.5),i%2?'#0b252b':'#1c4036');leaf(c,x,652,25+rand()*40,(rand()-.5)*2,'#12352d');}
 let [x,y]=game.cfg.shooter;glow(c,x,y,120,magic+'17');disk(c,x,y+5,80,'#00000055');disk(c,x,y,79,'#183238',gold+'78',3);disk(c,x,y,72,'#263f3f','#091f28',3);disk(c,x,y,65,null,gold+'75',1);disk(c,x,y,55,'#122e34',magic+'22',2);for(let i=0;i<20;i++){let a=i/20*Math.PI*2;rune(c,x+Math.cos(a)*70,y+Math.sin(a)*70,3.2,a,gold+'af');}return canvas;
}
const sprites=new Map();function marble(c,x,y,color,r=15,power=null,rotation=0){let sprite=sprites.get(color);if(!sprite){sprite=document.createElement('canvas');sprite.width=sprite.height=100;let g=sprite.getContext('2d'),fill=g.createRadialGradient(35,29,1,52,52,37);fill.addColorStop(0,'#fffcec');fill.addColorStop(.18,colors[color]);fill.addColorStop(.62,colors[color]);fill.addColorStop(1,'#122134');glow(g,50,50,49,colors[color]+'30');disk(g,50,50,38,'#071c29');disk(g,50,49,36,fill,'#efffff65',1.5);
 g.save();g.beginPath();g.arc(50,49,35,0,7);g.clip();g.strokeStyle='#ffffff27';g.lineWidth=4;g.beginPath();g.ellipse(50,51,31,17,-.8,0,7);g.stroke();g.lineWidth=1;g.strokeStyle='#fff9d459';g.beginPath();g.arc(48,48,30,.2,2.2);g.stroke();g.restore();g.fillStyle='#ffffffc7';g.beginPath();g.ellipse(38,29,11,5,-.5,0,7);g.fill();disk(g,31,39,2,'#fff');rune(g,52,56,8,color*.4,'#07263880');rune(g,51,55,8,color*.4,'#fff8cfa0');sprites.set(color,sprite);}
 c.save();c.translate(x,y);c.rotate(rotation);c.drawImage(sprite,-r*1.32,-r*1.32,r*2.64,r*2.64);if(power){disk(c,0,0,r+2,null,'#fff0b3',1.5);c.fillStyle='#fffbe8';c.textAlign='center';c.textBaseline='middle';c.font='bold 15px Georgia';c.shadowColor='#102434';c.shadowBlur=4;c.fillText({slow:'◷',reverse:'↶',bomb:'✹',aim:'⌖'}[power],0,0);}c.restore();}
function guardian(c,game,angle,time,kick){let [x,y]=game.cfg.shooter,accent=palettes[game.level][2];c.save();c.translate(x,y);c.rotate(angle+Math.PI/2);c.translate(0,kick*5);const breath=1+Math.sin(time*2)*.018;c.scale(breath,breath);glow(c,0,0,59,accent+'17');
 const jade=c.createLinearGradient(-40,-45,35,40);jade.addColorStop(0,'#d4d9ad');jade.addColorStop(.24,'#93b190');jade.addColorStop(.55,'#577e73');jade.addColorStop(1,'#1e434a');c.shadowColor='#0009';c.shadowBlur=8;c.shadowOffsetY=6;
 for(let side of[-1,1]){c.fillStyle=jade;c.strokeStyle='#b0bd8c';c.lineWidth=1.5;c.beginPath();c.moveTo(side*20,-13);c.bezierCurveTo(side*56,-17,side*58,36,side*33,42);c.lineTo(side*13,26);c.closePath();c.fill();c.stroke();for(let j=0;j<3;j++)line(c,[[side*(31+j*5),29],[side*(32+j*5),38]],'#173b42',2);}
 c.fillStyle=jade;c.beginPath();c.moveTo(0,-38);c.bezierCurveTo(-34,-44,-37,-4,-28,23);c.quadraticCurveTo(0,55,28,23);c.bezierCurveTo(37,-4,34,-44,0,-38);c.fill();c.strokeStyle='#c4cba0';c.lineWidth=2;c.stroke();c.shadowBlur=0;c.shadowOffsetY=0;
 // Gold carved brow, cheeks, cracks and a luminous central seal.
 for(let side of[-1,1]){line(c,[[side*6,-26],[side*18,-18],[side*22,11],[side*12,28]],'#d1c38a',2);line(c,[[side*18,1],[side*25,8],[side*19,16]],'#213f43',1.5);line(c,[[side*28,3],[side*23,-3],[side*27,-10]],'#122f3680');disk(c,side*21,-25,14,jade,'#d8cd98',2);disk(c,side*21,-27,8,'#102e38','#79967f',1);glow(c,side*21,-27,12,accent+'60');disk(c,side*21,-27,5,accent);line(c,[[side*21,-31],[side*21,-24]],'#eaffdb',2);}
 disk(c,0,12,16,'#183c43','#cfb87e',2);rune(c,0,12,11,0,accent);disk(c,0,12,4,accent);c.fillStyle='#16343e';c.fillRect(-12,-44,24,21);c.strokeStyle='#d3c28e';c.lineWidth=2;c.strokeRect(-12,-44,24,21);for(let x of[-7,0,7])line(c,[[x,-43],[x,-38]],'#a9b58c');c.restore();
 marble(c,x+Math.cos(angle)*31,y+Math.sin(angle)*31,game.current,12);
}
function portal(c,game,time){let p=game.path.at(game.path.length),danger=game.pressure||0,magic=palettes[game.level][2],accent=danger>.5?'#ff745d':magic;glow(c,p.x,p.y,60+danger*20,accent+'38');disk(c,p.x,p.y,31,'#112b35','#c2ac78',3);disk(c,p.x,p.y,25,'#04101c','#648e8b',2);c.save();c.translate(p.x,p.y);c.rotate(time*(.4+danger));for(let i=0;i<8;i++){let a=i*Math.PI/4;rune(c,Math.cos(a)*28,Math.sin(a)*28,3,a,accent);c.beginPath();c.arc(0,0,6+i*2,a+time*.3,a+1.2+time*.3);c.strokeStyle=accent+(i%2?'65':'32');c.lineWidth=2;c.stroke();}c.restore();disk(c,p.x,p.y,6,'#030811');if(danger>.5){c.textAlign='center';c.font='bold 9px system-ui';c.fillStyle='#ffc8a0';c.fillText('DANGER',p.x,p.y+46);}}
function atmosphere(c,game,time,reduced){const accent=palettes[game.level][2];for(let i=0;i<24;i++){let x=(i*137.2+Math.sin(time*.23+i)*12+980)%980,y=(i*53.7+Math.cos(time*.17+i)*8+640)%640;disk(c,x,y,1+Math.sin(time+i)*.35,accent+'55');}if(!reduced){for(let i=0;i<3;i++){let x=(time*5+i*410)%1400-200,y=150+i*180;let fog=c.createRadialGradient(x,y,0,x,y,170);fog.addColorStop(0,accent+'06');fog.addColorStop(1,accent+'00');c.fillStyle=fog;c.fillRect(x-170,y-170,340,340);}}if(game.pressure>.45){c.strokeStyle=`rgba(255,94,65,${(game.pressure-.45)*(.5+.2*Math.sin(time*5))})`;c.lineWidth=6;c.strokeRect(3,3,974,634);}}
// Covered bridges are drawn over the procession. Geometry comes from collision data.
const coverCache=new WeakMap();
function covers(c,game,time,reduced){
 let cached=coverCache.get(game);
 if(!cached){cached=document.createElement('canvas');cached.width=980;cached.height=640;let g=cached.getContext('2d');
  for(let tunnel of game.tunnels){
   const trace=(w,color,offset=0)=>{g.beginPath();let first=true;for(let s=tunnel.start;s<=tunnel.end+5;s+=5){let p=game.path.at(Math.min(s,tunnel.end));first?g.moveTo(p.x,p.y+offset):g.lineTo(p.x,p.y+offset);first=false;}g.strokeStyle=color;g.lineWidth=w;g.lineCap='round';g.lineJoin='round';g.stroke();};
   trace(66,'#00000066',6);trace(60,'#061822');trace(55,'#b3aa7c');trace(50,'#536960');trace(40,'#324b49');trace(24,'#536d60');
   for(let s=tunnel.start+10;s<tunnel.end;s+=25){let p=game.path.at(s),t=game.path.tangent(s);g.save();g.translate(p.x,p.y);g.rotate(Math.atan2(t.y,t.x));line(g,[[0,-24],[0,24]],'#172e36',2);line(g,[[2,-22],[2,22]],'#b4b78e44');rune(g,12,0,5,0,'#c9c59488');g.restore();}
   for(let s of[tunnel.start,tunnel.end]){let p=game.path.at(s),t=game.path.tangent(s);g.save();g.translate(p.x,p.y);g.rotate(Math.atan2(t.y,t.x));g.fillStyle='#1b3338';g.fillRect(-5,-30,10,60);line(g,[[-5,-29],[-5,29]],'#c4b579',2);for(let side of[-1,1])disk(g,0,side*25,3,'#8effdb');g.restore();}
  }
  // Direction glyphs make inward and outward routes legible before the wave arrives.
  for(let s=100;s<game.path.length-100;s+=230){if(game.isCovered(s))continue;let p=game.path.at(s),t=game.path.tangent(s);g.save();g.translate(p.x,p.y);g.rotate(Math.atan2(t.y,t.x));line(g,[[-4,-5],[3,0],[-4,5]],'#dcddaf38',1.3);g.restore();}
  coverCache.set(game,cached);
 }
 c.drawImage(cached,0,0);
 const entry=game.path.at(0);disk(c,entry.x,entry.y,19,'#163733','#91c8a1',2);rune(c,entry.x,entry.y,10,Math.atan2(game.path.tangent(0).y,game.path.tangent(0).x),'#abf0c5');
 if(game.bonus){let b=game.bonus,pulse=reduced?1:1+Math.sin(time*4)*.05;c.save();c.translate(b.x,b.y);c.scale(pulse,pulse);glow(c,0,0,37,'#ffca5845');disk(c,0,0,16,'#715025','#fff1ad',2);disk(c,0,0,12,'#edbd57','#ffed94',1);rune(c,0,0,8,0,'#775120');c.beginPath();c.arc(0,0,21,-Math.PI/2,-Math.PI/2+Math.PI*2*b.life/b.maxLife);c.strokeStyle=b.life<2?'#ff9670':'#ffeac0';c.lineWidth=2;c.stroke();c.fillStyle='#fff0ba';c.font='bold 10px system-ui';c.textAlign='center';c.fillText('+'+b.value,0,36);c.restore();}
}

window.OrbitArt={covers,background,marble,guardian,portal,atmosphere,colors};
})();
