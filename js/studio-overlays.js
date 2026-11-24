/* Totone Studio Overlays (30+ HD Procedural Overlays), Main Remove BG Triggers & High-Visibility Elements CORS Popup */
(function(){
/* ========== 1. Prominent Remove BG Main Buttons ========== */
function triggerMainRemoveBg(){
 if(!base){showToast('Open an image first to remove its background',1600);return}
 document.querySelector('[data-dock="rmbg"]')?.click();
}
$('hdr-rmbg')?.addEventListener('click',triggerMainRemoveBg);
$('sel-rmbg-main')?.addEventListener('click',triggerMainRemoveBg);

/* ========== 2. High-Visibility Elements Blocked-URL Popup (Inside Top-Layer Dialog) ========== */
let lastBlockedUrl='';
const corsPop=$('el-cors-popup'),corsOpen=$('el-cors-open');

window.showElementsBlockedPopup=function(url=''){
 lastBlockedUrl=url||'';
 if(!corsPop)return;
 if(corsOpen){corsOpen.hidden=!/^https?:\/\//i.test(lastBlockedUrl)}
 corsPop.hidden=false;
};

$('el-cors-ok')?.addEventListener('click',()=>{if(corsPop)corsPop.hidden=true});
corsPop?.addEventListener('click',e=>{if(e.target===corsPop)corsPop.hidden=true});
corsOpen?.addEventListener('click',()=>{if(lastBlockedUrl)window.open(lastBlockedUrl,'_blank','noopener,noreferrer')});
$('el-cors-paste')?.addEventListener('click',async()=>{
 try{
  if(!navigator.clipboard?.read)throw Error('Clipboard read unavailable');
  const items=await navigator.clipboard.read();
  for(const item of items){
   const imgType=item.types.find(t=>t.startsWith('image/'));
   if(imgType){
    const blob=await item.getType(imgType);
    const mode=$('el-mode')?.value||'layer',rmWhite=!!$('el-rmbg')?.checked;
    if(typeof elPlaceBlob==='function')await elPlaceBlob(blob,mode,'Pasted Element',rmWhite);
    if(corsPop)corsPop.hidden=true;
    $('elements-dialog')?.close();
    showToast('Pasted image from clipboard!',1500);
    return;
   }
  }
  showToast('No image found in clipboard yet — right-click the image → Copy image first!',2400);
 }catch{
  showToast('Press Ctrl+V directly right now to paste your copied image!',2400);
 }
});

/* ========== 3. 30+ HD Procedural Studio Overlays Engine ========== */
/* Seeded PRNG (Mulberry32) & 2D fBM Value Noise (adapted from classic Gustavson/Perlin noise patterns) */
function mulberry32(a){
 return function(){let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296};
}
function hash2(x,y,seed){
 let h=Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(seed,1442695041);
 h=(h^(h>>>13))*1274126177;return ((h^(h>>>16))>>>0)/4294967295;
}
function smoothNoise(x,y,seed){
 const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;
 const u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
 const a=hash2(xi,yi,seed),b=hash2(xi+1,yi,seed),c0=hash2(xi,yi+1,seed),d=hash2(xi+1,yi+1,seed);
 return (a*(1-u)+b*u)*(1-v)+(c0*(1-u)+d*u)*v;
}
function fbm(x,y,seed,oct=4){
 let v=0,amp=0.5,freq=1;
 for(let i=0;i<oct;i++){v+=smoothNoise(x*freq,y*freq,seed+i*31)*amp;freq*=2.05;amp*=0.5}
 return v;
}

const STUDIO_OVERLAYS=[
 // Light Leaks (7)
 {id:'kodak-burn',name:'35mm Kodak Burn',cat:'leaks',bm:'screen',sub:'Light Leak'},
 {id:'golden-flare',name:'Golden Hour Flare',cat:'leaks',bm:'screen',sub:'Sun Flare'},
 {id:'anamorphic-cyan',name:'Anamorphic Streak',cat:'leaks',bm:'screen',sub:'Cinema Flare'},
 {id:'prism-rainbow',name:'Prism Rainbow Leak',cat:'leaks',bm:'screen',sub:'Spectral'},
 {id:'sunset-edge',name:'Sunset Edge Burn',cat:'leaks',bm:'screen',sub:'Warm Burn'},
 {id:'dual-cyber-leak',name:'Cyan / Pink Split',cat:'leaks',bm:'screen',sub:'Neon Leak'},
 {id:'amber-corner',name:'Vintage Corner Leak',cat:'leaks',bm:'screen',sub:'Analog Warm'},
 // Bokeh & Sparkles (6)
 {id:'warm-bokeh',name:'Dreamy Warm Bokeh',cat:'bokeh',bm:'screen',sub:'Soft Orbs'},
 {id:'cyber-bokeh',name:'Cyber Neon Bokeh',cat:'bokeh',bm:'screen',sub:'City Lights'},
 {id:'star-sparkles',name:'Starlight Glints',cat:'bokeh',bm:'screen',sub:'4-Point Stars'},
 {id:'fairy-dust',name:'Fairy Dust Shimmer',cat:'bokeh',bm:'screen',sub:'Fine Glitter'},
 {id:'heart-bokeh',name:'Soft Heart Bokeh',cat:'bokeh',bm:'screen',sub:'Dreamcore'},
 {id:'golden-confetti',name:'Golden Sparkle Dust',cat:'bokeh',bm:'screen',sub:'Warm Dust'},
 // Film & Grunge Textures (8)
 {id:'film-dust',name:'35mm Dust & Scratches',cat:'grunge',bm:'screen',sub:'Analog Film'},
 {id:'paper-fold',name:'Folded Paper Crease',cat:'grunge',bm:'overlay',sub:'Poster Fold'},
 {id:'plastic-wrap',name:'Plastic Wrap Sheen',cat:'grunge',bm:'screen',sub:'CD / Vinyl'},
 {id:'wet-glass',name:'Raindrops on Glass',cat:'grunge',bm:'screen',sub:'Aero / Macro'},
 {id:'crt-scanlines',name:'CRT Scanlines & Glow',cat:'grunge',bm:'overlay',sub:'Retro CRT'},
 {id:'vhs-tracking',name:'VHS Tracking Noise',cat:'grunge',bm:'screen',sub:'1995 Tape'},
 {id:'halftone-dots',name:'Halftone Newsprint',cat:'grunge',bm:'overlay',sub:'Print Grain'},
 {id:'vintage-scuff',name:'Sun-Faded Scuff',cat:'grunge',bm:'screen',sub:'Distressed'},
 // Weather & Atmosphere (6)
 {id:'vol-fog',name:'Volumetric Mist / Fog',cat:'weather',bm:'screen',sub:'Atmosphere'},
 {id:'snowfall',name:'Falling Snowflakes',cat:'weather',bm:'screen',sub:'Winter'},
 {id:'heavy-rain',name:'Cinema Rain Streaks',cat:'weather',bm:'screen',sub:'Storm'},
 {id:'sunbeams',name:'Volumetric God Rays',cat:'weather',bm:'screen',sub:'Light Shafts'},
 {id:'smoke-wisps',name:'Ethereal Smoke Wisps',cat:'weather',bm:'screen',sub:'Studio Smoke'},
 {id:'aurora-curtain',name:'Aurora Borealis',cat:'weather',bm:'screen',sub:'Sky Glow'},
 // Frames & Viewfinders (5)
 {id:'rec-1999',name:'1999 Camcorder HUD',cat:'frames',bm:'screen',sub:'REC · VHS'},
 {id:'dslr-hud',name:'35mm DSLR Viewfinder',cat:'frames',bm:'screen',sub:'Camera HUD'},
 {id:'cinema-bars',name:'Cinema 2.39:1 Bars',cat:'frames',bm:'source-over',sub:'Widescreen'},
 {id:'frosted-frame',name:'Frosted Vignette',cat:'frames',bm:'screen',sub:'Soft Frame'},
 {id:'film-sprocket',name:'35mm Sprocket Frame',cat:'frames',bm:'source-over',sub:'Analog Border'}
];

let ovSeed=1337,ovCat='all',ovFlip=false;

function drawStar4(g,x,y,r,col,al){
 g.save();g.translate(x,y);g.globalAlpha=al;
 const gr=g.createRadialGradient(0,0,0,0,0,r);
 gr.addColorStop(0,'#ffffff');gr.addColorStop(0.25,col);gr.addColorStop(1,'rgba(0,0,0,0)');
 g.fillStyle=gr;g.beginPath();g.arc(0,0,r*0.7,0,Math.PI*2);g.fill();
 g.fillStyle='#ffffff';
 g.beginPath();
 g.moveTo(0,-r);g.quadraticCurveTo(r*0.08,-r*0.08,r,0);
 g.quadraticCurveTo(r*0.08,r*0.08,0,r);
 g.quadraticCurveTo(-r*0.08,r*0.08,-r,0);
 g.quadraticCurveTo(-r*0.08,-r*0.08,0,-r);
 g.fill();g.restore();
}

function drawHeart(g,x,y,r){
 g.beginPath();
 g.moveTo(x,y+r*0.35);
 g.bezierCurveTo(x-r,y-r*0.45,x-r*0.55,y-r*1.1,x,y-r*0.45);
 g.bezierCurveTo(x+r*0.55,y-r*1.1,x+r,y-r*0.45,x,y+r*0.35);
 g.closePath();
}

function renderStudioOverlay(id,w,h,seed){
 const cv=bc(w,h),g=cv.getContext('2d');
 const rng=mulberry32(seed+id.split('').reduce((a,ch)=>a*31+ch.charCodeAt(0),7));
 const minD=Math.min(w,h);

 const blob=(x,y,r,c0,c1,c2)=>{
  const gr=g.createRadialGradient(x,y,0,x,y,r);
  gr.addColorStop(0,c0);if(c1)gr.addColorStop(0.45,c1);gr.addColorStop(1,c2||'rgba(0,0,0,0)');
  g.fillStyle=gr;g.fillRect(0,0,w,h);
 };

 if(id==='kodak-burn'){
  blob(w*(0.06+rng()*0.15),h*(0.2+rng()*0.6),w*0.55,'rgba(255,60,18,0.95)','rgba(255,140,20,0.45)');
  blob(w*(0.12+rng()*0.12),h*(0.4+rng()*0.4),w*0.32,'rgba(255,230,140,0.85)','rgba(255,80,10,0.35)');
  blob(w*0.92,h*0.18,w*0.38,'rgba(220,38,38,0.55)','rgba(234,88,12,0.18)');
 }else if(id==='golden-flare'){
  const fx=w*(0.72+rng()*0.18),fy=h*(0.15+rng()*0.25);
  blob(fx,fy,w*0.65,'rgba(255,244,200,0.95)','rgba(251,146,60,0.42)');
  for(let i=1;i<=5;i++){
   const t=i*0.22,px=fx+(w/2-fx)*t*1.7,py=fy+(h/2-fy)*t*1.7,rr=minD*(0.04+rng()*0.07);
   blob(px,py,rr,'rgba(253,224,71,0.35)','rgba(251,113,133,0.16)');
  }
 }else if(id==='anamorphic-cyan'){
  const y=h*(0.35+rng()*0.3),x=w*(0.3+rng()*0.4);
  blob(x,y,minD*0.35,'rgba(224,242,254,0.9)','rgba(56,189,248,0.45)');
  const gr=g.createLinearGradient(0,y,w,y);
  gr.addColorStop(0,'rgba(56,189,248,0)');gr.addColorStop(0.5,'rgba(125,211,252,0.92)');gr.addColorStop(1,'rgba(56,189,248,0)');
  g.fillStyle=gr;g.fillRect(0,y-minD*0.015,w,minD*0.03);
  g.globalAlpha=0.45;g.fillRect(0,y-minD*0.05,w,minD*0.1);
 }else if(id==='prism-rainbow'){
  const gr=g.createLinearGradient(0,0,w,h*0.8);
  gr.addColorStop(0,'rgba(244,63,94,0)');gr.addColorStop(0.22,'rgba(244,63,94,0.62)');
  gr.addColorStop(0.38,'rgba(250,204,21,0.58)');gr.addColorStop(0.55,'rgba(52,211,153,0.5)');
  gr.addColorStop(0.72,'rgba(56,189,248,0.6)');gr.addColorStop(0.88,'rgba(168,85,247,0.5)');gr.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=gr;g.fillRect(0,0,w,h);
  blob(w*0.25,h*0.2,w*0.4,'rgba(255,255,255,0.45)','rgba(251,191,36,0.18)');
 }else if(id==='sunset-edge'){
  const gr=g.createLinearGradient(w,0,w*0.35,0);
  gr.addColorStop(0,'rgba(255,85,20,0.92)');gr.addColorStop(0.4,'rgba(244,63,94,0.45)');gr.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=gr;g.fillRect(0,0,w,h);
  blob(w*0.95,h*0.75,w*0.42,'rgba(253,224,71,0.7)','rgba(249,115,22,0.22)');
 }else if(id==='dual-cyber-leak'){
  blob(w*0.05,h*0.25,w*0.6,'rgba(34,211,238,0.78)','rgba(59,130,246,0.25)');
  blob(w*0.95,h*0.78,w*0.6,'rgba(236,72,153,0.82)','rgba(168,85,247,0.25)');
 }else if(id==='amber-corner'){
  blob(0,h,w*0.72,'rgba(251,146,60,0.82)','rgba(245,158,11,0.28)');
  blob(w,0,w*0.45,'rgba(254,215,170,0.42)','rgba(251,146,60,0.12)');
 }else if(id==='warm-bokeh'||id==='cyber-bokeh'||id==='golden-confetti'){
  const cols=id==='warm-bokeh'?['#fde68a','#fb923c','#fef08a','#fda4af','#ffffff']
   :id==='cyber-bokeh'?['#38bdf8','#f472b6','#a855f7','#22d3ee','#4ade80']
   :['#fef08a','#fbbf24','#f59e0b','#ffffff'];
  const cnt=id==='golden-confetti'?85:38;
  for(let i=0;i<cnt;i++){
   const x=rng()*w,y=rng()*h,r=minD*(id==='golden-confetti'?0.008+rng()*0.025:0.025+rng()*0.09);
   const col=cols[Math.floor(rng()*cols.length)],al=0.14+rng()*0.48;
   const gr=g.createRadialGradient(x,y,r*0.2,x,y,r);
   gr.addColorStop(0,col+'55');gr.addColorStop(0.78,col+'aa');gr.addColorStop(1,col+'00');
   g.save();g.globalAlpha=al;g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();g.restore();
  }
 }else if(id==='star-sparkles'){
  const cols=['#ffffff','#bae6fd','#fde68a','#f5d0fe'];
  for(let i=0;i<26;i++)drawStar4(g,rng()*w,rng()*h,minD*(0.02+rng()*0.07),cols[Math.floor(rng()*cols.length)],0.45+rng()*0.55);
 }else if(id==='fairy-dust'){
  for(let i=0;i<260;i++){
   const x=rng()*w,y=rng()*h,r=minD*(0.002+rng()*0.009);
   g.save();g.globalAlpha=0.25+rng()*0.75;g.fillStyle=rng()>0.35?'#ffffff':'#bae6fd';
   g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();g.restore();
  }
  for(let i=0;i<10;i++)drawStar4(g,rng()*w,rng()*h,minD*(0.025+rng()*0.04),'#e0f2fe',0.85);
 }else if(id==='heart-bokeh'){
  const cols=['#f472b6','#fbcfe8','#fda4af','#ffffff','#c084fc'];
  for(let i=0;i<28;i++){
   const x=rng()*w,y=rng()*h,r=minD*(0.025+rng()*0.065);
   g.save();g.globalAlpha=0.18+rng()*0.42;g.fillStyle=cols[Math.floor(rng()*cols.length)];
   g.filter=`blur(${Math.max(1,r*0.18)}px)`;drawHeart(g,x,y,r);g.fill();g.restore();
  }
 }else if(id==='film-dust'){
  for(let i=0;i<320;i++){
   const x=rng()*w,y=rng()*h,r=0.5+rng()*2.2;
   g.fillStyle=`rgba(255,255,255,${0.18+rng()*0.55})`;
   g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();
  }
  g.strokeStyle='rgba(255,255,255,0.24)';
  for(let i=0;i<18;i++){
   const x=rng()*w;g.lineWidth=0.5+rng()*1.3;g.beginPath();g.moveTo(x,rng()*h);g.lineTo(x+(rng()-0.5)*14,rng()*h);g.stroke();
  }
 }else if(id==='paper-fold'){
  g.fillStyle='#808080';g.fillRect(0,0,w,h);
  const crease=(x1,y1,x2,y2)=>{
   g.save();g.lineWidth=Math.max(2,minD*0.008);
   g.strokeStyle='rgba(255,255,255,0.42)';g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();
   g.strokeStyle='rgba(0,0,0,0.45)';g.beginPath();g.moveTo(x1+2,y1+2);g.lineTo(x2+2,y2+2);g.stroke();
   g.restore();
  };
  crease(0,h*0.5,w,h*0.5);crease(w*0.5,0,w*0.5,h);crease(0,h*0.25,w,h*0.25);crease(0,h*0.75,w,h*0.75);
  for(let i=0;i<1800;i++){
   g.fillStyle=rng()>0.5?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)';
   g.fillRect(rng()*w,rng()*h,2,2);
  }
 }else if(id==='plastic-wrap'){
  for(let i=0;i<22;i++){
   const x1=rng()*w,y1=rng()*h,x2=x1+(rng()-0.5)*w*0.8,y2=y1+(rng()-0.5)*h*0.8;
   const gr=g.createLinearGradient(x1,y1,x2,y2);
   gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(0.5,`rgba(255,255,255,${0.12+rng()*0.26})`);gr.addColorStop(1,'rgba(255,255,255,0)');
   g.strokeStyle=gr;g.lineWidth=minD*(0.004+rng()*0.024);
   g.beginPath();g.moveTo(x1,y1);g.quadraticCurveTo(rng()*w,rng()*h,x2,y2);g.stroke();
  }
 }else if(id==='wet-glass'){
  for(let i=0;i<75;i++){
   const x=rng()*w,y=rng()*h,r=minD*(0.006+rng()*0.026);
   const gr=g.createRadialGradient(x-r*0.3,y-r*0.3,r*0.1,x,y,r);
   gr.addColorStop(0,'rgba(255,255,255,0.85)');gr.addColorStop(0.6,'rgba(186,230,253,0.18)');gr.addColorStop(1,'rgba(125,211,252,0.52)');
   g.fillStyle=gr;g.beginPath();g.ellipse(x,y,r*0.85,r*1.12,0,0,Math.PI*2);g.fill();
  }
 }else if(id==='crt-scanlines'){
  g.fillStyle='#808080';g.fillRect(0,0,w,h);
  const step=Math.max(3,Math.round(h/180));
  for(let y=0;y<h;y+=step){
   g.fillStyle='rgba(0,0,0,0.48)';g.fillRect(0,y,w,Math.max(1,step*0.45));
   g.fillStyle='rgba(255,255,255,0.14)';g.fillRect(0,y+step*0.5,w,1);
  }
 }else if(id==='vhs-tracking'){
  for(let i=0;i<5;i++){
   const y=rng()*h,bh=minD*(0.015+rng()*0.06);
   for(let k=0;k<220;k++){
    g.fillStyle=rng()>0.25?`rgba(255,255,255,${0.12+rng()*0.45})`:`rgba(56,189,248,${0.25+rng()*0.4})`;
    g.fillRect(rng()*w,y+rng()*bh,4+rng()*46,1+rng()*2);
   }
  }
 }else if(id==='halftone-dots'){
  g.fillStyle='#808080';g.fillRect(0,0,w,h);
  const step=Math.max(5,Math.round(minD/72));
  g.fillStyle='rgba(0,0,0,0.35)';
  for(let y=0;y<h;y+=step)for(let x=0;x<w;x+=step){
   g.beginPath();g.arc(x+((y/step)%2?step/2:0),y,step*0.24,0,Math.PI*2);g.fill();
  }
 }else if(id==='vintage-scuff'){
  for(let i=0;i<90;i++){
   g.strokeStyle=`rgba(255,248,235,${0.08+rng()*0.25})`;g.lineWidth=0.6+rng()*2;
   const x=rng()*w,y=rng()*h;g.beginPath();g.moveTo(x,y);g.lineTo(x+(rng()-0.5)*minD*0.18,y+(rng()-0.5)*minD*0.18);g.stroke();
  }
  blob(w*0.5,h*0.5,w*0.8,'rgba(0,0,0,0)','rgba(255,235,200,0.18)','rgba(255,220,170,0.45)');
 }else if(id==='vol-fog'||id==='smoke-wisps'){
  const nw=120,nh=Math.max(60,Math.round(120*h/w));
  const nc=bc(nw,nh),ng=nc.getContext('2d'),im=ng.createImageData(nw,nh),d=im.data;
  for(let y=0;y<nh;y++)for(let x=0;x<nw;x++){
   const n=fbm(x/nw*(id==='smoke-wisps'?5.2:3.2),y/nh*(id==='smoke-wisps'?4.5:2.5),seed,4);
   const fade=id==='vol-fog'?Math.pow(y/nh,0.85):Math.sin(y/nh*Math.PI);
   const v=Math.max(0,Math.min(255,Math.round((n-0.28)*2.1*fade*255)));
   const o=(y*nw+x)*4;d[o]=228;d[o+1]=238;d[o+2]=255;d[o+3]=v;
  }
  ng.putImageData(im,0,0);g.imageSmoothingEnabled=true;g.drawImage(nc,0,0,w,h);
 }else if(id==='snowfall'){
  for(let i=0;i<160;i++){
   const x=rng()*w,y=rng()*h,r=minD*(0.003+rng()*0.013);
   blob(x,y,r*1.8,'rgba(255,255,255,0.92)','rgba(224,242,254,0.45)');
  }
 }else if(id==='heavy-rain'){
  g.strokeStyle='rgba(224,242,254,0.42)';
  for(let i=0;i<240;i++){
   const x=rng()*w,y=rng()*h,len=minD*(0.04+rng()*0.11);
   g.lineWidth=0.6+rng()*1.3;g.beginPath();g.moveTo(x,y);g.lineTo(x-len*0.22,y+len);g.stroke();
  }
 }else if(id==='sunbeams'){
  const ox=w*0.18,oy=-h*0.1;
  for(let i=0;i<9;i++){
   const a=0.25+i*0.13+rng()*0.04,spread=0.05+rng()*0.05;
   const gr=g.createLinearGradient(ox,oy,ox+Math.cos(a)*w*1.4,oy+Math.sin(a)*h*1.4);
   gr.addColorStop(0,'rgba(255,248,210,0.42)');gr.addColorStop(1,'rgba(255,248,210,0)');
   g.fillStyle=gr;g.beginPath();g.moveTo(ox,oy);
   g.lineTo(ox+Math.cos(a-spread)*w*1.6,oy+Math.sin(a-spread)*h*1.6);
   g.lineTo(ox+Math.cos(a+spread)*w*1.6,oy+Math.sin(a+spread)*h*1.6);
   g.closePath();g.fill();
  }
 }else if(id==='aurora-curtain'){
  for(let i=0;i<7;i++){
   const x=w*(0.1+i*0.13),gr=g.createLinearGradient(x,0,x+w*0.1,h*0.75);
   gr.addColorStop(0,'rgba(168,85,247,0)');gr.addColorStop(0.35,'rgba(52,211,153,0.48)');
   gr.addColorStop(0.65,'rgba(56,189,248,0.45)');gr.addColorStop(1,'rgba(0,0,0,0)');
   g.fillStyle=gr;g.beginPath();g.ellipse(x,h*0.32,w*0.12,h*0.42,(rng()-0.5)*0.4,0,Math.PI*2);g.fill();
  }
 }else if(id==='rec-1999'){
  const m=minD*0.06,len=minD*0.07;
  g.strokeStyle='rgba(255,255,255,0.85)';g.lineWidth=Math.max(2,minD*0.005);
  [[m,m,1,1],[w-m,m,-1,1],[m,h-m,1,-1],[w-m,h-m,-1,-1]].forEach(([x,y,dx,dy])=>{
   g.beginPath();g.moveTo(x+dx*len,y);g.lineTo(x,y);g.lineTo(x,y+dy*len);g.stroke();
  });
  const fs=Math.max(12,Math.round(minD*0.042));
  g.fillStyle='#ef4444';g.beginPath();g.arc(m+fs*0.6,m+fs*0.65,fs*0.32,0,Math.PI*2);g.fill();
  g.fillStyle='#ffffff';g.font=`700 ${fs}px "Space Mono",monospace`;
  g.fillText('REC',m+fs*1.2,m+fs*0.95);
  g.textAlign='right';g.fillText('SP 00:04:19',w-m-fs*0.3,m+fs*0.95);
  g.textAlign='left';g.fillText('OCT 24 1999',m+fs*0.3,h-m-fs*0.35);
 }else if(id==='dslr-hud'){
  g.strokeStyle='rgba(255,255,255,0.72)';g.lineWidth=Math.max(1.5,minD*0.003);
  const cx=w/2,cy=h/2,r=minD*0.06;
  g.strokeRect(cx-r*1.3,cy-r,r*2.6,r*2);
  g.beginPath();g.moveTo(cx-r*0.5,cy);g.lineTo(cx+r*0.5,cy);g.moveTo(cx,cy-r*0.5);g.lineTo(cx,cy+r*0.5);g.stroke();
  const fs=Math.max(11,Math.round(minD*0.032));
  g.fillStyle='#4ade80';g.font=`700 ${fs}px "Space Mono",monospace`;g.textAlign='center';
  g.fillText('1/250   f/1.8   ISO 400   RAW',cx,h-minD*0.05);
 }else if(id==='cinema-bars'){
  const bh=Math.round(h*0.12);g.fillStyle='#000000';g.fillRect(0,0,w,bh);g.fillRect(0,h-bh,w,bh);
 }else if(id==='frosted-frame'){
  const bw=Math.round(minD*0.075);
  g.strokeStyle='rgba(255,255,255,0.62)';g.lineWidth=bw;g.strokeRect(bw/2,bw/2,w-bw,h-bw);
  g.strokeStyle='rgba(255,255,255,0.9)';g.lineWidth=2;g.strokeRect(bw,bw,w-bw*2,h-bw*2);
 }else if(id==='film-sprocket'){
  const sw=Math.round(w*0.07);g.fillStyle='#080a10';g.fillRect(0,0,sw,h);g.fillRect(w-sw,0,sw,h);
  g.fillStyle='#e2e8f0';
  const step=Math.max(18,Math.round(h/10));
  for(let y=step*0.3;y<h-step*0.4;y+=step){
   g.fillRect(sw*0.24,y,sw*0.52,step*0.45);g.fillRect(w-sw*0.76,y,sw*0.52,step*0.45);
  }
 }
 return cv;
}

function buildOverlayGrid(){
 const grid=$('sov-grid');if(!grid)return;
 const list=STUDIO_OVERLAYS.filter(o=>ovCat==='all'||o.cat===ovCat);
 grid.innerHTML='';
 for(const item of list){
  const card=document.createElement('button');card.type='button';card.className='sov-card';
  const thumb=renderStudioOverlay(item.id,144,90,ovSeed);
  card.append(thumb);
  const title=document.createElement('span');title.textContent=item.name;
  const sub=document.createElement('small');sub.textContent=item.sub;
  card.append(title,sub);
  card.onclick=()=>applyStudioOverlay(item);
  grid.append(card);
 }
}

function applyStudioOverlay(item){
 if(!base){showToast('Open an image or create a blank design first',1400);return}
 const raw=renderStudioOverlay(item.id,W,H,ovSeed);
 const hue=+$('sov-hue').value||0;
 const out=bc(W,H),g=out.getContext('2d');
 if(hue)g.filter=`hue-rotate(${hue}deg)`;
 if(ovFlip){g.translate(W,0);g.scale(-1,1)}
 g.drawImage(raw,0,0);
 const d=out.getContext('2d',{willReadFrequently:true}).getImageData(0,0,W,H);
 const bmSel=$('sov-bm').value;
 const bm=bmSel==='auto'?item.bm:bmSel;
 const op=(+$('sov-op').value||85)/100;
 pushU(mkSnap('p'));
 const l={cv:out,d,o:null,lk:false,sh:null,ol:null,x:W/2,y:H/2,s:1,r:0,op,bm,fl:false,vis:true,cl:0,ct:0,cr:0,cb:0,name:'Overlay · '+item.name};
 layers.push(l);active=l;refreshLayers();draw();
 showToast(`Added ${item.name} overlay (${bm})!`,1400);
}

$('sov-cats')?.addEventListener('click',e=>{
 const b=e.target.closest('[data-oc]');if(!b)return;
 ovCat=b.dataset.oc;
 document.querySelectorAll('#sov-cats button').forEach(x=>x.classList.toggle('on',x===b));
 buildOverlayGrid();
});
$('sov-op')?.addEventListener('input',e=>{e.target.nextElementSibling.value=e.target.value+'%'});
$('sov-hue')?.addEventListener('input',e=>{e.target.nextElementSibling.value=e.target.value+'°'});
$('sov-rand')?.addEventListener('click',()=>{ovSeed=Math.floor(Math.random()*999999);buildOverlayGrid();showToast('Generated fresh overlay seed!',1000)});
$('sov-flip')?.addEventListener('click',e=>{ovFlip=!ovFlip;e.currentTarget.setAttribute('aria-pressed',String(ovFlip))});

buildOverlayGrid();
})();
