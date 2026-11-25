(function () {
const A = LX.Art, N = 64, OUT = '#1c1530', DK = '#3a1f2a', CREAM = '#ffe9a8', GOLD = '#ffd23f', ORG = '#f3912b', BLUE = '#2d63b3', BL = '#e8f6ff';
const COL = { d: '#1f7a73', m: '#2fb3a3', l: '#6fdccb' }, FAR = { d: '#14524d', m: '#1b6a64', l: '#1b6a64' };
function P(g,x,y,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),1,1)}
function R(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h)}
function E(g,cx,cy,rx,ry,c){g.fillStyle=c;for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++){const dy=(y+.5-cy)/ry;if(Math.abs(dy)>1)continue;const h=rx*Math.sqrt(1-dy*dy),a=Math.round(cx-h),b=Math.round(cx+h);if(b>a)g.fillRect(a,y,b-a,1)}}
function ray(g,cx,cy,deg,r0,r1,c){const a=deg*Math.PI/180;for(let r=r0;r<=r1;r+=.5)R(g,cx+Math.cos(a)*r,cy+Math.sin(a)*r,2,2,c)}
function cr(pts,t){const n=pts.length,i=Math.min(Math.floor(t),n-2),u=t-i,p0=pts[Math.max(i-1,0)],p1=pts[i],p2=pts[i+1],p3=pts[Math.min(i+2,n-1)];return[0,1,2].map(k=>.5*((2*p1[k])+(-p0[k]+p2[k])*u+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*u*u+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*u*u*u))}
function pass(pts,a,b,f){for(let t=a;t<=b+1e-6;t+=.04){const q=cr(pts,t);f(q[0],q[1],q[2],t)}}
function tube(g,pts,s,c){const b=pts.length-1;pass(pts,0,b,(x,y,r)=>E(g,x,y,r*s,r*s,c.d));pass(pts,0,b,(x,y,r)=>{if(r*s>1.6)E(g,x-.6,y-.9,r*s*.78,r*s*.78,c.m)});pass(pts,0,b,(x,y,r)=>{if(r*s>3)E(g,x-1.4,y-1.8,r*s*.42,r*s*.42,c.l)})}
function toes(g,x,y,c){R(g,x-3,y+1,2,2,c);R(g,x-1,y+2,2,2,c);R(g,x+2,y+1,2,2,c)}
function outline(g){const d=g.getImageData(0,0,N,N).data,m=[];const a=(x,y)=>x>=0&&y>=0&&x<N&&y<N&&d[(y*N+x)*4+3]>40;for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(!a(x,y)&&(a(x-1,y)||a(x+1,y)||a(x,y-1)||a(x,y+1)))m.push([x,y]);g.fillStyle=OUT;m.forEach(([x,y])=>g.fillRect(x,y,1,1))}
const SP=[[8.5,30,2.4],[12,28.5,4.8],[16,27,6.4],[23,30,4.6],[29,35,5.8],[36,38,6],[43,38,5.2],[49,36,4.2],[54,31,3.4],[57,25,2.8],[56,19,2.2],[52,14,1.7],[47,12,1.3]];
const FL=[[27,40,2.4],[24,46,2],[20,50,1.8]],FR=[[41,41,3],[45,46,2.4],[49,50,1.9]],FL2=[[31,40,2.2],[30,46,1.8],[27,50.5,1.6]],FR2=[[37,41,2.8],[39,47,2.2],[41,51,1.8]];
function draw(g,o,ph,blink){g.clearRect(0,0,N,N);const s=o.s,w=ph?1:0;
if(o.stage===3){E(g,19,28,12,12,ORG);for(let k=0;k<30;k++)ray(g,19,28,k*12,10,(k%2?19:15)+w,k%2?ORG:GOLD);for(let k=0;k<30;k++)ray(g,19,28,k*12+6,9,13+w,k%2?GOLD:'#ffe066');E(g,19,28,10,10,GOLD);E(g,19,28,8,8,'#ffe066')}
else if(o.stage===2){for(let k=0;k<15;k++)ray(g,20,27,-165+k*13,7,(k%2?13:10)+w,k%2?ORG:GOLD);for(let k=0;k<14;k++)ray(g,20,27,-158+k*13,6,9+w,'#ffe066');E(g,20,27,8,8,GOLD)}
else{for(let k=0;k<9;k++)ray(g,21,26,-120+k*14,6,(k%2?12:10)+w,k%2?ORG:GOLD);E(g,21,26,6,6,GOLD)}
tube(g,FL2,s,FAR);toes(g,27,50.5,FAR.d);tube(g,FR2,s,FAR);toes(g,41,51,FAR.d);
tube(g,SP,s,COL);
pass(SP,3,6.6,(x,y,r)=>E(g,x+.8,y+r*s*.5,r*s*.45,r*s*.4,CREAM));
pass(SP,1.2,3,(x,y,r)=>E(g,x+.3,y+r*s*.55,r*s*.4,r*s*.3,CREAM));
[9.9,10.7,11.5].forEach(t=>{const q=cr(SP,t);E(g,q[0],q[1],q[2]*s*.8,q[2]*s*.8,CREAM)});
for(let t=3.3;t<=6.9;t+=.3){const q=cr(SP,t);P(g,q[0],q[1]-q[2]*s*.9,GOLD)}
for(let t=3.4;t<=6.6;t+=o.stage>1?.45:.55){const q=cr(SP,t),x=Math.round(q[0]),y=Math.round(q[1]-q[2]*s*.55);P(g,x,y,BL);P(g,x-1,y,BLUE);P(g,x+1,y,BLUE);P(g,x,y-1,BLUE);P(g,x,y+1,BLUE)}
for(let t=3.6;t<=6.5;t+=.7){const q=cr(SP,t);P(g,q[0]+1,q[1]+q[2]*s*.05,GOLD)}
tube(g,FL,s,COL);toes(g,20,50,COL.m);tube(g,FR,s,COL);toes(g,49,50,COL.m);
if(blink){R(g,11,25,6,1,DK);R(g,11,26,6,1,'#1f7a73')}else{E(g,14,25,3.6,3.6,'#fff7e0');E(g,13.5,25.5,2.7,2.9,'#f2b705');E(g,13.2,25.7,1.5,2,'#2c1d18');P(g,12,24,'#ffffff');P(g,13,23,'#ffffff');P(g,14,27,'#ffe9a8')}
[[10,22],[11,22],[12,21],[13,21],[14,21],[15,21],[16,22]].forEach(q=>P(g,q[0],q[1],DK));
[[8.5,31.5],[9.5,32.5],[11,33],[12.5,33],[13.5,32]].forEach(q=>P(g,q[0],q[1],DK));
P(g,9,29,'#17120f');P(g,13.5,32.5,'#f08e6a');E(g,15.5,30.2,1.7,1.1,'#f08e6a');
if(o.stage>1){[[19,19],[22,18],[25,19]].forEach(q=>{R(g,q[0],q[1],2,3,ORG);P(g,q[0],q[1]-1,GOLD)})}
const tp=cr(SP,12),tx=tp[0],ty=tp[1],sr=(o.stage===3?4:o.stage===2?3.5:3)+(ph?.6:0);
for(let k=0;k<8;k++)ray(g,tx,ty,k*45+(ph?22:0),sr+.5,sr+3,k%2?ORG:GOLD);E(g,tx,ty,sr,sr,GOLD);E(g,tx,ty,sr-1.2,sr-1.2,'#fff3b0');P(g,tx-1,ty-1,'#ffffff');
outline(g)}
const ST={1:{s:1,stage:1},2:{s:1.06,stage:2},3:{s:1.12,stage:3}};
A.holamander=function(stage,phase,blink){const c=document.createElement('canvas');c.width=c.height=N;const g=c.getContext('2d',{willReadFrequently:true});g.imageSmoothingEnabled=false;draw(g,ST[stage],phase,blink);return c};
})();
