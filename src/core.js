/* Temple Orbit — deterministic, DOM-free simulation. Units are path arc length. */
(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.OrbitCore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const D=34,R=15,COLORS=['#ef6577','#55d8d0','#efbb50','#8e8afa','#8ecd67','#fa995e','#eef4ff'];
// Balance only forward travel; retraction, projectiles, scoring and relics stay intact.
const PACE=Object.freeze({startMultiplier:1.65,maxMultiplier:2.4,rampSeconds:90,endpointZone:.24,endpointBoost:.22,responseSeconds:2});
const LEVELS=[
 {name:'The Emerald Gate',subtitle:'Awaken the guardian',speed:24,count:54,colors:4,shooter:[490,355],points:[[-40,120],[160,120],[390,90],[720,100],[866,220],[850,465],[710,555],[450,565],[195,520],[115,365],[190,240],[360,205],[650,210],[724,330],[670,440]]},
 {name:'Moonwater Gardens',subtitle:'Follow the silver river',speed:28,count:68,colors:4,shooter:[490,320],points:[[-40,490],[140,530],[290,485],[265,330],[120,245],[165,110],[410,90],[710,105],[865,240],[800,495],[605,540],[395,535],[365,430],[650,420],[690,285],[590,230]]},
 {name:'Serpent’s Stair',subtitle:'Every opening is an opportunity',speed:32,count:78,colors:5,shooter:[490,360],points:[[-40,100],[190,100],[420,135],[700,100],[860,180],[835,320],[760,520],[550,560],[285,555],[130,470],[155,330],[235,220],[410,215],[645,200],[705,285],[650,450]]},
 {name:'The Sunken Crown',subtitle:'Hold back the tide',speed:35,count:88,colors:5,shooter:[490,330],points:[[70.0,330.0],[89.62,270.93],[132.16,217.17],[194.29,171.75],[271.6,137.11],[358.94,114.97],[450.71,106.23],[541.28,110.99],[625.27,128.49],[697.93,157.27],[755.35,195.23],[794.72,239.77],[814.42,288.0],[814.11,336.92],[794.67,383.57],[758.11,425.25],[707.4,459.67],[646.25,485.05],[578.84,500.24],[509.54,504.74],[442.63,498.73],[382.05,483.02],[331.13,458.97],[292.45,428.4],[267.7,393.45],[257.61,356.42],[261.95,319.65],[279.58,285.35],[308.61,255.46],[346.53,231.57],[390.42,214.82],[437.13,205.84],[483.56,204.74],[526.82,211.16],[564.4,224.24],[594.36,242.8],[615.4,265.34]]},
 {name:'Ember Sanctuary',subtitle:'The temple remembers',speed:39,count:100,colors:6,shooter:[490,330],points:[[490.0,220.0],[526.49,219.17],[564.28,224.39],[601.18,235.77],[634.91,253.04],[663.21,275.59],[684.0,302.45],[695.52,332.38],[696.46,363.87],[686.02,395.26],[664.06,424.81],[631.09,450.79],[588.29,471.6],[537.49,485.83],[481.06,492.4],[421.84,490.59],[362.98,480.1],[307.76,461.13],[259.43,434.33],[221.01,400.82],[195.1,362.12],[183.75,320.12],[188.27,276.94],[209.15,234.86],[246.0,196.17],[297.53,163.1],[361.59,137.61],[435.25,121.35],[514.92,115.52],[596.55,120.81],[675.83,137.31],[748.4,164.53],[810.1,201.39],[857.21,246.23],[886.66,296.95],[896.23,351.03],[884.69,405.71]]},
 {name:'Heart of the Eclipse',subtitle:'One final constellation',speed:43,count:112,colors:7,shooter:[490,330],points:[[490.0,580.0],[371.42,565.92],[266.7,533.05],[183.94,484.68],[129.15,425.27],[105.82,360.06],[114.68,294.59],[153.79,234.26],[218.75,183.83],[303.21,147.11],[399.41,126.62],[498.97,123.46],[593.52,137.25],[675.5,166.23],[738.69,207.42],[778.71,256.97],[793.33,310.46],[782.52,363.34],[748.39,411.26],[694.92,450.5],[627.5,478.19],[552.45,492.55],[476.39,493.0],[405.71,480.14],[345.99,455.67],[301.58,422.16],[275.28,382.84],[268.19,341.26],[279.7,300.98],[307.65,265.29],[348.58,236.9],[398.15,217.76],[451.54,208.93],[503.93,210.54],[550.92,221.81],[588.92,241.19],[615.4,266.52]]}
];

// Structural difficulty is configured independently of the forward speed curve.
const CHALLENGES=[
 {start:480,singleChance:0,tunnels:[],hint:'Open sightlines · four colors'},
 {start:540,singleChance:.08,tunnels:[[.34,.385]],hint:'Stone tunnel · shoot exposed marbles'},
 {start:610,singleChance:.16,tunnels:[[.24,.285],[.61,.655]],hint:'Five colors · two covered passages'},
 {start:500,singleChance:.23,tunnels:[[.33,.37],[.72,.755]],hint:'Inward spiral · overlapping shooting angles'},
 {start:380,singleChance:.28,tunnels:[[.22,.26],[.58,.62]],hint:'Outward spiral · six colors · shorter escape time'},
 {start:1040,singleChance:.34,tunnels:[[.21,.25],[.51,.55],[.79,.825]],hint:'Ivory marbles · three tunnels · narrow safety margin'}
];
LEVELS.forEach((level,i)=>Object.assign(level,CHALLENGES[i]));

class Path{
 constructor(points){this.samples=[];this.length=0;let last=null;for(let i=0;i<points.length-1;i++){let p0=points[Math.max(0,i-1)],p1=points[i],p2=points[i+1],p3=points[Math.min(points.length-1,i+2)];for(let j=0;j<80;j++){let t=j/80,t2=t*t,t3=t2*t;let xy=[0,1].map(k=>.5*((2*p1[k])+(-p0[k]+p2[k])*t+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t2+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t3));if(last)this.length+=Math.hypot(xy[0]-last.x,xy[1]-last.y);last={x:xy[0],y:xy[1],s:this.length};this.samples.push(last);}}let p=points.at(-1);this.length+=Math.hypot(p[0]-last.x,p[1]-last.y);this.samples.push({x:p[0],y:p[1],s:this.length});}
 at(s){let a=this.samples;if(s<=0){let t=this.tangent(0);return{x:a[0].x+t.x*s,y:a[0].y+t.y*s};}if(s>=this.length)return{x:a.at(-1).x,y:a.at(-1).y};let l=0,h=a.length-1;while(h-l>1){let m=(l+h)>>1;if(a[m].s<s)l=m;else h=m;}let f=(s-a[l].s)/(a[h].s-a[l].s);return{x:a[l].x+(a[h].x-a[l].x)*f,y:a[l].y+(a[h].y-a[l].y)*f};}
 tangent(s){let a=this.atSafe(s-2),b=this.atSafe(s+2),d=Math.hypot(b.x-a.x,b.y-a.y)||1;return{x:(b.x-a.x)/d,y:(b.y-a.y)/d};}
 atSafe(s){if(s<=0)return this.samples[0];if(s>=this.length)return this.samples.at(-1);return this.at(s);}
}
function swept(ax,ay,bx,by,cx,cy,r){let dx=bx-ax,dy=by-ay,fx=ax-cx,fy=ay-cy,A=dx*dx+dy*dy;if(!A)return null;let C=fx*fx+fy*fy-r*r;if(C<=0)return 0;let B=2*(fx*dx+fy*dy),det=B*B-4*A*C;if(det<0)return null;let t=(-B-Math.sqrt(det))/(2*A);return t>=0&&t<=1?t:null;}
class Game{
 constructor(level=0,random=Math.random){this.level=level;this.cfg=LEVELS[level];this.path=new Path(this.cfg.points);this.rng=random;this.tunnels=this.cfg.tunnels.map(([a,b])=>({start:a*this.path.length,end:b*this.path.length}));this.tunnelRoof=[];for(let tunnel of this.tunnels)for(let pos=tunnel.start;pos<=tunnel.end+10;pos+=10)this.tunnelRoof.push(this.path.at(Math.min(pos,tunnel.end)));this.bonus=null;this.nextBonus=10;this.bonusIndex=0;this.bonusCollected=0;this.chain=[];this.shots=[];this.events=[];this.score=0;this.combo=0;this.maxCombo=0;this.cleared=0;this.fired=0;this.matches=0;this.time=0;this.speedMultiplier=PACE.startMultiplier;this.pressure=0;this.cooldown=0;this.state='playing';this.effects={slow:0,reverse:0,aim:0};this.id=0;let color=0,run=0;for(let i=0;i<this.cfg.count;i++){if(!run){color=Math.floor(random()*this.cfg.colors);run=random()<this.cfg.singleChance?1:2+Math.floor(random()*2);}run--;this.chain.push({id:this.id++,s:this.cfg.start-(this.cfg.count-1-i)*D,color,power:i%13===7?['slow','reverse','bomb','aim'][Math.floor(i/13)%4]:null,depth:0});}this.current=this.pickColor();this.next=this.pickColor();}
 isCovered(s){return this.tunnels.some(t=>s>=t.start&&s<=t.end);}
 obstacleHit(ax,ay,bx,by){let nearest=null;for(let p of this.tunnelRoof){const t=swept(ax,ay,bx,by,p.x,p.y,37);if(t!==null&&(nearest===null||t<nearest))nearest=t;}return nearest;}
 updateBonus(dt){
  if(this.level===0)return;
  if(this.bonus){this.bonus.life-=dt;if(this.bonus.life<=0){this.bonus=null;this.nextBonus=this.time+12;}return;}
  if(this.time<this.nextBonus)return;
  const [sx,sy]=this.cfg.shooter;
  const candidates=[[83,67],[897,67],[83,577],[897,577],[490,55],[490,605],[70,330],[910,330]];
  const safe=candidates.filter(([x,y])=>Math.hypot(x-sx,y-sy)>180&&this.path.samples.every(p=>Math.hypot(p.x-x,p.y-y)>53)&&this.obstacleHit(sx,sy,x,y)===null);
  if(!safe.length){this.nextBonus=this.time+12;return;}
  const [x,y]=safe[this.bonusIndex++%safe.length];this.bonus={x,y,life:7,maxLife:7,value:500+this.level*100};this.emit('bonusReady');
 }
 emit(type,data={}){this.events.push({type,...data});}
 pickColor(){let visible=this.chain.filter(m=>m.s>=0);let pool=visible.length?visible:this.chain;return pool.length?pool[Math.floor(this.rng()*pool.length)].color:0;}
 swap(){if(this.state!=='playing')return;[this.current,this.next]=[this.next,this.current];this.emit('swap');}
 shoot(x,y){if(this.state!=='playing'||this.cooldown>0)return false;let [sx,sy]=this.cfg.shooter,dx=x-sx,dy=y-sy,n=Math.hypot(dx,dy);if(n<12)return false;this.shots.push({x:sx+dx/n*37,y:sy+dy/n*37,vx:dx/n*1000,vy:dy/n*1000,color:this.current,distance:0,gap:false});this.current=this.next;this.next=this.pickColor();this.cooldown=.19;this.fired++;this.emit('shoot');return true;}
 group(index){let c=this.chain,m=c[index];if(!m)return[];let l=index,r=index;while(l>0&&c[l-1].color===m.color&&c[l].s-c[l-1].s<=D+.1)l--;while(r<c.length-1&&c[r+1].color===m.color&&c[r+1].s-c[r].s<=D+.1)r++;return Array.from({length:r-l+1},(_,i)=>l+i);}
 match(index,depth=1,bonus=0){let group=this.group(index);if(group.length<3)return false;this.remove(group,depth,bonus);return true;}
 remove(indices,depth=1,bonus=0){let set=new Set(indices),c=this.chain;for(let i of indices)if(c[i]?.power==='bomb')for(let j=Math.max(0,i-2);j<=Math.min(c.length-1,i+2);j++)set.add(j);let removed=[...set].sort((a,b)=>a-b).map(i=>c[i]).filter(Boolean);if(!removed.length)return;for(let m of removed){if(m.power&&m.power!=='bomb'){this.effects[m.power]=m.power==='aim'?12:6;this.emit('power',{power:m.power});}this.emit('burst',{...this.path.at(m.s),color:m.color});}let first=Math.min(...set),last=Math.max(...set),tail=c[first-1],head=c[last+1];this.chain=c.filter((_,i)=>!set.has(i));if(head)head.depth=Math.max(head.depth,depth);if(tail)tail.depth=Math.max(tail.depth,depth);this.combo=depth;this.maxCombo=Math.max(this.maxCombo,depth);let pts=removed.length*100*depth+bonus;this.score+=pts;this.cleared+=removed.length;this.matches++;let p=this.path.at(removed[Math.floor(removed.length/2)].s);this.emit('match',{...p,points:pts,depth,bonus});}
 insert(index,shot){let m=this.chain[index],p=this.path.at(m.s),t=this.path.tangent(m.s);let ahead=(shot.x-p.x)*t.x+(shot.y-p.y)*t.y>0;let at=index+(ahead?1:0);let s=ahead?m.s+D:m.s;for(let bead of this.chain)if(bead.drawS===undefined)bead.drawS=bead.s;let n={id:this.id++,s,color:shot.color,power:null,depth:0,drawS:m.drawS+(ahead?D*.15:-D*.15)};this.chain.splice(at,0,n);for(let i=at+1;i<this.chain.length;i++)this.chain[i].s=Math.max(this.chain[i].s,this.chain[i-1].s+D);let bonus=shot.gap?250:shot.distance>360?100:0;this.emit('insert',{...this.path.at(n.s)});if(!this.match(at,1,bonus))this.combo=0;}
 updatePace(dt){
  const head=this.chain.at(-1);
  this.pressure=head?Math.max(0,Math.min(1,1-(this.path.length-head.s)/(this.path.length*PACE.endpointZone))):0;
  const t=Math.min(1,this.time/PACE.rampSeconds),ease=t*t*(3-2*t);
  const target=Math.min(PACE.maxMultiplier,PACE.startMultiplier+(PACE.maxMultiplier-PACE.startMultiplier-PACE.endpointBoost)*ease+PACE.endpointBoost*this.pressure*this.pressure);
  this.speedMultiplier+=(target-this.speedMultiplier)*(1-Math.exp(-dt/PACE.responseSeconds));
 }
 step(dt){if(this.state!=='playing')return;this.time+=dt;this.updatePace(dt);this.updateBonus(dt);this.cooldown=Math.max(0,this.cooldown-dt);for(let k in this.effects)this.effects[k]=Math.max(0,this.effects[k]-dt);let c=this.chain,base=this.cfg.speed*this.speedMultiplier*(this.effects.slow>0?.4:1)*(this.effects.reverse>0?-1.5:1);let seams=[];let segments=[];for(let i=0;i<c.length;i++){if(i===0||c[i].s-c[i-1].s>D+.1)segments.push({start:i,end:i});else segments.at(-1).end=i;}for(let k=0;k<segments.length;k++){let seg=segments[k],v=k===0?base:-190;let delta=v*dt;if(k>0){let prev=c[seg.start-1];delta=Math.max(delta,prev.s+D-c[seg.start].s);}for(let i=seg.start;i<=seg.end;i++)c[i].s+=delta;if(k>0&&c[seg.start].s-c[seg.start-1].s<=D+.1)seams.push(c[seg.start].id);}for(let id of seams){let i=this.chain.findIndex(m=>m.id===id);if(i>0&&this.chain[i].color===this.chain[i-1].color)this.match(i,Math.max(this.chain[i].depth,this.chain[i-1].depth)+1);}
 for(let shot of [...this.shots]){let ox=shot.x,oy=shot.y;shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;shot.distance+=1000*dt;let hit=-1,best=2;for(let i=0;i<this.chain.length;i++){let m=this.chain[i];if(m.s<0||this.isCovered(m.s))continue;let p=this.path.at(m.s),t=swept(ox,oy,shot.x,shot.y,p.x,p.y,R*2-1);if(t!==null&&t<best){best=t;hit=i;}if(i>0&&m.s-this.chain[i-1].s>D*2){let gap=this.path.at((m.s+this.chain[i-1].s)/2);if(swept(ox,oy,shot.x,shot.y,gap.x,gap.y,D)!==null)shot.gap=true;}}const wall=this.obstacleHit(ox,oy,shot.x,shot.y);const coin=this.bonus?swept(ox,oy,shot.x,shot.y,this.bonus.x,this.bonus.y,25):null;
 if(wall!==null&&wall<=best&&(coin===null||wall<=coin)){this.emit('blocked',{x:ox+(shot.x-ox)*wall,y:oy+(shot.y-oy)*wall});this.shots.splice(this.shots.indexOf(shot),1);}
 else if(coin!==null&&coin<best){const b=this.bonus;this.score+=b.value;this.bonusCollected++;this.emit('bonusCollected',{...b,points:b.value});this.bonus=null;this.nextBonus=this.time+12;this.shots.splice(this.shots.indexOf(shot),1);}
 else if(hit>=0){shot.x=ox+(shot.x-ox)*best;shot.y=oy+(shot.y-oy)*best;this.insert(hit,shot);this.shots.splice(this.shots.indexOf(shot),1);}else if(shot.x< -50||shot.x>1030||shot.y< -50||shot.y>690)this.shots.splice(this.shots.indexOf(shot),1);}
 if(this.chain.some(m=>m.s>=this.path.length)){this.state='lost';this.emit('lost');}else if(!this.chain.length){this.state='won';this.emit('won');}
 // Avoid ammunition colors which have disappeared entirely.
 let colors=new Set(this.chain.map(m=>m.color));if(colors.size&&!colors.has(this.current))this.current=this.pickColor();if(colors.size&&!colors.has(this.next))this.next=this.pickColor();
 }
}
return{D,R,COLORS,PACE,LEVELS,Path,Game,swept};
});
