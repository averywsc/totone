/* Totone v7.2.0 — Photorealistic Studio Overlays (Old Paper, Crumpled Parchment, 35mm Grain, Optical Light Leaks & Real Bokeh) */
(function(){
/* ========== 1. Prominent Remove BG Main Buttons ========== */
function triggerMainRemoveBg(){
 if(!base){showToast('Open an image first to remove its background',1600);return}
 document.querySelector('[data-dock="rmbg"]')?.click();
}
$('hdr-rmbg')?.addEventListener('click',triggerMainRemoveBg);
$('sel-rmbg-main')?.addEventListener('click',triggerMainRemoveBg);

/* ========== 2. High-Visibility Elements Blocked-URL Popup ========== */
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

/* ========== 3. Photorealistic Pixel-Synthesized Studio Overlays ========== */
const clamp8=v=>v<0?0:v>255?255:v|0;
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
 // Old Paper & Vintage Print (6 — photorealistic fBM paper fibers, creases & tea stains!)
 {id:'old-parchment',name:'Aged Parchment',cat:'paper',bm:'multiply',sub:'Old Paper'},
 {id:'crumpled-paper',name:'Crumpled Paper',cat:'paper',bm:'overlay',sub:'Creased Print'},
 {id:'tea-stained',name:'Tea-Stained Sheet',cat:'paper',bm:'multiply',sub:'Vintage Stain'},
 {id:'aged-newsprint',name:'1970s Newsprint',cat:'paper',bm:'multiply',sub:'Pulp Paper'},
 {id:'darkroom-matte',name:'Darkroom Paper',cat:'paper',bm:'overlay',sub:'Archival Fiber'},
 {id:'poster-fold',name:'Folded Poster',cat:'paper',bm:'overlay',sub:'Quad Crease'},
 // Film Grain & Analog Textures (6)
 {id:'grain-35mm',name:'35mm Film Grain',cat:'grunge',bm:'overlay',sub:'Silver Halide'},
 {id:'film-dust',name:'35mm Dust & Hair',cat:'grunge',bm:'screen',sub:'Emulsion'},
 {id:'plastic-wrap',name:'Vinyl / Plastic Wrap',cat:'grunge',bm:'screen',sub:'CD Sheen'},
 {id:'vintage-scuff',name:'Worn Print Scuff',cat:'grunge',bm:'screen',sub:'Aged Wear'},
 {id:'crt-scanlines',name:'CRT Aperture Grille',cat:'grunge',bm:'overlay',sub:'Phosphor'},
 {id:'halftone-dots',name:'Print Halftone',cat:'grunge',bm:'overlay',sub:'Litho Dots'},
 // Optical Light Leaks (5)
 {id:'kodak-burn',name:'35mm Kodak Burn',cat:'leaks',bm:'screen',sub:'Light Leak'},
 {id:'golden-flare',name:'Golden Hour Wash',cat:'leaks',bm:'screen',sub:'Sun Flare'},
 {id:'anamorphic-cyan',name:'Anamorphic Streak',cat:'leaks',bm:'screen',sub:'Cinema Lens'},
 {id:'amber-corner',name:'Warm Corner Leak',cat:'leaks',bm:'screen',sub:'Analog Leak'},
 {id:'prism-rainbow',name:'Spectral Prism',cat:'leaks',bm:'screen',sub:'Refraction'},
 // Photographic Bokeh & Atmosphere (5)
 {id:'warm-bokeh',name:'Lens Bokeh (Warm)',cat:'bokeh',bm:'screen',sub:'f/1.4 Discs'},
 {id:'cyber-bokeh',name:'Night City Bokeh',cat:'bokeh',bm:'screen',sub:'f/1.4 Neon'},
 {id:'vol-fog',name:'Soft Mist / Haze',cat:'weather',bm:'screen',sub:'Atmosphere'},
 {id:'sunbeams',name:'Soft Light Shafts',cat:'weather',bm:'screen',sub:'Volumetric'},
 {id:'heavy-rain',name:'Fine Rain Streaks',cat:'weather',bm:'screen',sub:'Weather'},
 // Frames (4)
 {id:'film-sprocket',name:'35mm Sprocket Strip',cat:'frames',bm:'source-over',sub:'Analog Border'},
 {id:'cinema-bars',name:'Cinema 2.39:1 Bars',cat:'frames',bm:'source-over',sub:'Widescreen'},
 {id:'frosted-frame',name:'Darkroom Vignette',cat:'frames',bm:'multiply',sub:'Edge Burn'},
 {id:'dslr-hud',name:'35mm Viewfinder',cat:'frames',bm:'screen',sub:'Optical HUD'}
];

let ovSeed=1337,ovCat='all',ovFlip=false;

function renderNoiseSurface(w,h,seed,fn){
 // Render at crisp half-res for speed & smooth organic grain, then upscale cleanly
 const sw=Math.min(w,420),sh=Math.max(1,Math.round(h*(sw/w)));
 const scv=bc(sw,sh),sg=scv.getContext('2d');
 const im=sg.createImageData(sw,sh),d=im.data;
 fn(d,sw,sh,seed);
 sg.putImageData(im,0,0);
 const out=bc(w,h),og=out.getContext('2d');
 og.imageSmoothingEnabled=true;og.imageSmoothingQuality='high';
 og.drawImage(scv,0,0,w,h);
 return out;
}

function renderStudioOverlay(id,w,h,seed){
 const cv=bc(w,h),g=cv.getContext('2d');
 const rng=mulberry32(seed+id.split('').reduce((a,ch)=>a*31+ch.charCodeAt(0),7));
 const minD=Math.min(w,h);

 const softGlow=(x,y,r,c0,c1)=>{
  const gr=g.createRadialGradient(x,y,0,x,y,r);
  gr.addColorStop(0,c0);if(c1)gr.addColorStop(0.5,c1);gr.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=gr;g.fillRect(0,0,w,h);
 };

 /* --- PHOTOREALISTIC OLD PAPER & PRINT TEXTURES --- */
 if(id==='old-parchment'){
  const tex=renderNoiseSurface(w,h,seed,(d,sw,sh,sd)=>{
   for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){
    const nx=x/sw,ny=y/sh;
    const baseN=fbm(nx*5,ny*5,sd,4);
    const fiber=fbm(nx*32,ny*8,sd+77,3)*0.5+fbm(nx*9,ny*34,sd+99,3)*0.5;
    const fine=(hash2(x,y,sd+5)-0.5)*0.12;
    const edge=Math.hypot(nx-0.5,ny-0.5)*1.35;
    const vig=Math.max(0,edge-0.42)*0.48;
    const shade=0.92-(baseN-0.5)*0.18-(fiber-0.5)*0.14-vig+fine;
    const i=(y*sw+x)*4;
    d[i]=clamp8(244*shade);
    d[i+1]=clamp8(230*shade);
    d[i+2]=clamp8(198*shade);
    d[i+3]=255;
   }
  });
  g.drawImage(tex,0,0);
  // Subtle organic foxing spots
  for(let k=0;k<22;k++){
   softGlow(rng()*w,rng()*h,minD*(0.02+rng()*0.07),'rgba(155,112,62,0.14)','rgba(170,128,74,0.04)');
  }
 }else if(id==='crumpled-paper'){
  const tex=renderNoiseSurface(w,h,seed,(d,sw,sh,sd)=>{
   // Ridged multi-octave noise creates authentic sharp paper crease facets
   for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){
    const nx=x/sw,ny=y/sh;
    const n1=Math.abs(fbm(nx*4.2,ny*4.2,sd,4)*2-1);
    const n2=Math.abs(fbm(nx*10.5,ny*10.5,sd+41,3)*2-1);
    const ridge=Math.pow(1-n1,2.2)*0.65+Math.pow(1-n2,2.5)*0.35;
    const fiber=(hash2(x,y,sd+9)-0.5)*18;
    const v=clamp8(128+(ridge-0.32)*155+fiber);
    const i=(y*sw+x)*4;
    d[i]=v;d[i+1]=clamp8(v-2);d[i+2]=clamp8(v-6);d[i+3]=255;
   }
  });
  g.drawImage(tex,0,0);
 }else if(id==='tea-stained'){
  const tex=renderNoiseSurface(w,h,seed,(d,sw,sh,sd)=>{
   for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){
    const nx=x/sw,ny=y/sh;
    const wash=fbm(nx*3.4,ny*3.4,sd,4);
    const mott=fbm(nx*14,ny*14,sd+19,3);
    const fine=(hash2(x,y,sd+3)-0.5)*0.09;
    const s=0.95-wash*0.26-(mott-0.5)*0.12+fine;
    const i=(y*sw+x)*4;
    d[i]=clamp8(236*s);d[i+1]=clamp8(212*s);d[i+2]=clamp8(170*s);d[i+3]=255;
   }
  });
  g.drawImage(tex,0,0);
  // Subtle organic water/tea tide rings
  for(let k=0;k<3;k++){
   const rx=w*(0.15+rng()*0.7),ry=h*(0.15+rng()*0.7),rr=minD*(0.16+rng()*0.22);
   g.strokeStyle='rgba(128,82,36,0.16)';g.lineWidth=Math.max(2,minD*0.008);
   g.filter='blur(3px)';
   g.beginPath();g.ellipse(rx,ry,rr,rr*(0.85+rng()*0.3),rng()*Math.PI,0,Math.PI*2);g.stroke();
   g.filter='none';
  }
 }else if(id==='aged-newsprint'){
  const tex=renderNoiseSurface(w,h,seed,(d,sw,sh,sd)=>{
   for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){
    const nx=x/sw,ny=y/sh;
    const pulp=fbm(nx*18,ny*18,sd,3);
    const grain=(hash2(x,y,sd+11)-0.5)*0.18;
    const s=0.90-(pulp-0.5)*0.16+grain;
    const i=(y*sw+x)*4;
    d[i]=clamp8(234*s);d[i+1]=clamp8(226*s);d[i+2]=clamp8(204*s);d[i+3]=255;
   }
  });
  g.drawImage(tex,0,0);
 }else if(id==='darkroom-matte'){
  const tex=renderNoiseSurface(w,h,seed,(d,sw,sh,sd)=>{
   for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){
    const nx=x/sw,ny=y/sh;
    const f=fbm(nx*26,ny*26,sd,3);
    const g0=(hash2(x,y,sd+2)-0.5)*34;
    const edge=Math.max(0,Math.hypot(nx-0.5,ny-0.5)-0.38)*65;
    const v=clamp8(128+(f-0.5)*28+g0-edge);
    const i=(y*sw+x)*4;
    d[i]=v;d[i+1]=v;d[i+2]=v;d[i+3]=255;
   }
  });
  g.drawImage(tex,0,0);
 }else if(id==='poster-fold'){
  g.fillStyle='#808080';g.fillRect(0,0,w,h);
  const drawFold=(x1,y1,x2,y2)=>{
   g.save();
   g.strokeStyle='rgba(255,255,255,0.42)';g.lineWidth=Math.max(1.5,minD*0.004);
   g.beginPath();g.moveTo(x1-1,y1-1);g.lineTo(x2-1,y2-1);g.stroke();
   g.strokeStyle='rgba(0,0,0,0.48)';g.lineWidth=Math.max(2,minD*0.005);
   g.beginPath();g.moveTo(x1+1.5,y1+1.5);g.lineTo(x2+1.5,y2+1.5);g.stroke();
   g.restore();
  };
  drawFold(w*0.5,0,w*0.5,h);
  drawFold(0,h*0.333,w,h*0.333);
  drawFold(0,h*0.667,w,h*0.667);
  // Subtle paper grain over fold
  const im=g.getImageData(0,0,w,h),d=im.data;
  for(let i=0;i<d.length;i+=4){const n=(rng()-0.5)*16;d[i]=clamp8(d[i]+n);d[i+1]=clamp8(d[i+1]+n);d[i+2]=clamp8(d[i+2]+n)}
  g.putImageData(im,0,0);

 /* --- FILM GRAIN & ANALOG TEXTURES --- */
 }else if(id==='grain-35mm'){
  const im=g.createImageData(w,h),d=im.data;
  for(let i=0;i<d.length;i+=4){
   // Gaussian-approximated neutral silver-halide grain
   const n=((rng()+rng()+rng())/3-0.5)*92;
   const v=clamp8(128+n);
   d[i]=v;d[i+1]=v;d[i+2]=v;d[i+3]=255;
  }
  g.putImageData(im,0,0);
 }else if(id==='film-dust'){
  // Authentic micro-dust & ultra-thin emulsion scratches (NOT thick cartoons)
  for(let i=0;i<260;i++){
   const x=rng()*w,y=rng()*h,r=0.4+Math.pow(rng(),4)*2.2;
   g.fillStyle=`rgba(248,244,234,${(0.16+rng()*0.48).toFixed(2)})`;
   g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();
  }
  for(let i=0;i<16;i++){
   const x=rng()*w,y=rng()*h,len=minD*(0.015+rng()*0.05),a=rng()*Math.PI*2;
   g.strokeStyle=`rgba(250,245,235,${(0.14+rng()*0.25).toFixed(2)})`;
   g.lineWidth=0.6+rng()*0.7;
   g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+Math.cos(a+0.4)*len*0.5,y+Math.sin(a+0.4)*len*0.5,x+Math.cos(a)*len,y+Math.sin(a)*len);g.stroke();
  }
  for(let i=0;i<5;i++){
   const x=rng()*w;
   g.strokeStyle=`rgba(255,250,240,${(0.06+rng()*0.1).toFixed(2)})`;
   g.lineWidth=0.8;g.beginPath();g.moveTo(x,0);g.lineTo(x+(rng()-0.5)*3,h);g.stroke();
  }
 }else if(id==='plastic-wrap'){
  for(let i=0;i<12;i++){
   const x0=rng()*w,y0=rng()*h,len=minD*(0.3+rng()*0.55),ang=-0.65+(rng()-0.5)*0.45;
   const x1=x0+Math.cos(ang)*len,y1=y0+Math.sin(ang)*len;
   const gr=g.createLinearGradient(x0,y0,x1,y1);
   gr.addColorStop(0,'rgba(255,255,255,0)');
   gr.addColorStop(0.5,`rgba(255,255,255,${(0.08+rng()*0.16).toFixed(2)})`);
   gr.addColorStop(1,'rgba(255,255,255,0)');
   g.strokeStyle=gr;g.lineWidth=minD*(0.008+rng()*0.02);g.lineCap='round';
   g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo((x0+x1)/2+(rng()-0.5)*40,(y0+y1)/2+(rng()-0.5)*40,x1,y1);g.stroke();
  }
 }else if(id==='vintage-scuff'){
  const tex=renderNoiseSurface(w,h,seed,(d,sw,sh,sd)=>{
   for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){
    const nx=x/sw,ny=y/sh;
    const n=fbm(nx*8,ny*8,sd,4);
    const sc=Math.max(0,n-0.58)*2.4;
    const v=clamp8(sc*185);
    const i=(y*sw+x)*4;
    d[i]=clamp8(v*1.05);d[i+1]=v;d[i+2]=clamp8(v*0.92);d[i+3]=clamp8(sc*175);
   }
  });
  g.drawImage(tex,0,0);
 }else if(id==='crt-scanlines'){
  g.fillStyle='#808080';g.fillRect(0,0,w,h);
  const step=Math.max(2,Math.round(h/220));
  for(let y=0;y<h;y+=step*2){
   g.fillStyle='rgba(0,0,0,0.28)';g.fillRect(0,y,w,step);
   g.fillStyle='rgba(255,255,255,0.06)';g.fillRect(0,y+step,w,step);
  }
 }else if(id==='halftone-dots'){
  g.fillStyle='#808080';g.fillRect(0,0,w,h);
  const sp=Math.max(4,Math.round(minD/110));
  g.fillStyle='rgba(0,0,0,0.22)';
  for(let y=0;y<h;y+=sp)for(let x=(Math.floor(y/sp)%2?sp/2:0);x<w;x+=sp){
   g.beginPath();g.arc(x,y,sp*0.24,0,Math.PI*2);g.fill();
  }

 /* --- OPTICAL LIGHT LEAKS (Smooth Photographic Falloff) --- */
 }else if(id==='kodak-burn'){
  softGlow(w*(0.04+rng()*0.1),h*(0.25+rng()*0.5),w*0.62,'rgba(255,72,24,0.82)','rgba(255,148,42,0.28)');
  softGlow(w*(0.08+rng()*0.08),h*(0.35+rng()*0.3),w*0.32,'rgba(255,228,150,0.62)','rgba(255,96,24,0.18)');
 }else if(id==='golden-flare'){
  const fx=w*(0.78+rng()*0.14),fy=h*(0.12+rng()*0.18);
  softGlow(fx,fy,w*0.72,'rgba(255,238,195,0.78)','rgba(251,156,64,0.26)');
  softGlow(w-fx*0.65,h-fy*0.65,minD*0.26,'rgba(253,220,130,0.16)','rgba(251,146,60,0.05)');
 }else if(id==='anamorphic-cyan'){
  const y=h*(0.36+rng()*0.28),x=w*(0.35+rng()*0.3);
  softGlow(x,y,minD*0.34,'rgba(224,244,255,0.72)','rgba(56,189,248,0.24)');
  const gr=g.createLinearGradient(0,y,w,y);
  gr.addColorStop(0,'rgba(56,189,248,0)');gr.addColorStop(0.5,'rgba(147,220,255,0.75)');gr.addColorStop(1,'rgba(56,189,248,0)');
  g.fillStyle=gr;g.filter='blur(6px)';g.fillRect(0,y-minD*0.012,w,minD*0.024);g.filter='none';
 }else if(id==='amber-corner'){
  softGlow(w*0.02,h*0.98,w*0.66,'rgba(245,145,48,0.74)','rgba(220,90,32,0.22)');
 }else if(id==='prism-rainbow'){
  const gr=g.createLinearGradient(0,0,w*0.85,h*0.75);
  gr.addColorStop(0,'rgba(244,63,94,0.28)');gr.addColorStop(0.35,'rgba(250,204,21,0.22)');
  gr.addColorStop(0.65,'rgba(56,189,248,0.24)');gr.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=gr;g.fillRect(0,0,w,h);

 /* --- REAL PHOTOGRAPHIC LENS BOKEH & ATMOSPHERE --- */
 }else if(id==='warm-bokeh'||id==='cyber-bokeh'){
  const cols=id==='warm-bokeh'
   ?['255,220,150','255,180,105','255,244,210','245,158,95']
   :['96,165,250','244,114,182','56,189,248','192,132,252'];
  for(let i=0;i<26;i++){
   const x=rng()*w,y=rng()*h,r=minD*(0.025+Math.pow(rng(),1.5)*0.095);
   const col=cols[Math.floor(rng()*cols.length)],al=0.08+rng()*0.22;
   // Real spherical-aberration lens bokeh disc (softer center, slightly brighter thin rim)
   const gr=g.createRadialGradient(x,y,r*0.1,x,y,r);
   gr.addColorStop(0,`rgba(${col},${(al*0.65).toFixed(3)})`);
   gr.addColorStop(0.82,`rgba(${col},${(al*0.95).toFixed(3)})`);
   gr.addColorStop(0.94,`rgba(${col},${(al*1.25).toFixed(3)})`);
   gr.addColorStop(1,`rgba(${col},0)`);
   g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();
  }
 }else if(id==='vol-fog'){
  const tex=renderNoiseSurface(w,h,seed,(d,sw,sh,sd)=>{
   for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){
    const nx=x/sw,ny=y/sh;
    const f=fbm(nx*2.8,ny*2.2,sd,4);
    const al=Math.max(0,(f-0.32)*1.1)*(0.35+ny*0.65);
    const i=(y*sw+x)*4;
    d[i]=228;d[i+1]=234;d[i+2]=242;d[i+3]=clamp8(al*150);
   }
  });
  g.drawImage(tex,0,0);
 }else if(id==='sunbeams'){
  g.save();g.filter='blur(18px)';
  for(let i=0;i<5;i++){
   const x0=w*(0.08+i*0.18+rng()*0.06);
   const gr=g.createLinearGradient(x0,0,x0+w*0.28,h);
   gr.addColorStop(0,`rgba(255,244,214,${(0.14+rng()*0.14).toFixed(2)})`);
   gr.addColorStop(1,'rgba(255,244,214,0)');
   g.fillStyle=gr;g.beginPath();
   g.moveTo(x0,0);g.lineTo(x0+w*(0.06+rng()*0.05),0);
   g.lineTo(x0+w*0.34,h);g.lineTo(x0+w*0.18,h);g.closePath();g.fill();
  }
  g.restore();
 }else if(id==='heavy-rain'){
  g.strokeStyle='rgba(220,235,250,0.22)';g.lineCap='round';
  for(let i=0;i<180;i++){
   const x=rng()*w,y=rng()*h,len=minD*(0.04+rng()*0.09);
   g.lineWidth=0.6+rng()*0.8;
   g.beginPath();g.moveTo(x,y);g.lineTo(x-len*0.14,y+len);g.stroke();
  }

 /* --- FRAMES --- */
 }else if(id==='film-sprocket'){
  const rail=Math.max(24,Math.round(w*0.075));
  g.fillStyle='#0c0c0e';
  g.fillRect(0,0,rail,h);g.fillRect(w-rail,0,rail,h);
  const hw=Math.round(rail*0.46),hh=Math.round(hw*1.35),gap=Math.round(hh*1.65);
  g.fillStyle='#e5e5ea';
  for(let y=12;y<h-hh;y+=gap){
   g.beginPath();g.roundRect(Math.round((rail-hw)/2),y,hw,hh,3);g.fill();
   g.beginPath();g.roundRect(w-rail+Math.round((rail-hw)/2),y,hw,hh,3);g.fill();
  }
 }else if(id==='cinema-bars'){
  const bar=Math.round(h*0.125);
  g.fillStyle='#08080a';g.fillRect(0,0,w,bar);g.fillRect(0,h-bar,w,bar);
 }else if(id==='frosted-frame'){
  const gr=g.createRadialGradient(w/2,h/2,minD*0.32,w/2,h/2,Math.hypot(w,h)*0.56);
  gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(1,'rgba(72,66,60,1)');
  g.fillStyle=gr;g.fillRect(0,0,w,h);
 }else if(id==='dslr-hud'){
  g.strokeStyle='rgba(255,255,255,0.45)';g.lineWidth=Math.max(1.2,minD*0.0025);
  const m=minD*0.07,len=minD*0.05;
  [[m,m,1,1],[w-m,m,-1,1],[m,h-m,1,-1],[w-m,h-m,-1,-1]].forEach(([x,y,sx,sy])=>{
   g.beginPath();g.moveTo(x,y+sy*len);g.lineTo(x,y);g.lineTo(x+sx*len,y);g.stroke();
  });
  g.beginPath();g.moveTo(w/2-12,h/2);g.lineTo(w/2+12,h/2);g.moveTo(w/2,h/2-12);g.lineTo(w/2,h/2+12);g.stroke();
 }

 return cv;
}

function addStudioOverlayToCanvas(ov){
 if(!base){showToast('Open an image first',1400);return}
 const ovCv=renderStudioOverlay(ov.id,W,H,ovSeed);
 const hue=+$('sov-hue')?.value||0;
 const op=(+$('sov-op')?.value||85)/100;
 const bmSel=$('sov-bm')?.value||'auto';
 const bm=bmSel==='auto'?ov.bm:bmSel;
 const finalCv=bc(W,H),fg=finalCv.getContext('2d');
 fg.save();
 if(hue)fg.filter=`hue-rotate(${hue}deg)`;
 if(ovFlip){fg.translate(W,0);fg.scale(-1,1)}
 fg.drawImage(ovCv,0,0);
 fg.restore();
 const d=fg.getImageData(0,0,W,H);
 pushU(mkSnap('p'));
 const l={cv:finalCv,d,o:null,lk:false,sh:null,ol:null,x:W/2,y:H/2,s:1,r:0,op,bm,fl:false,vis:true,cl:0,ct:0,cr:0,cb:0,name:ov.name};
 layers.push(l);active=l;refreshLayers();draw();
 showToast(`Added "${ov.name}" overlay (${bm})`,1500);
}

const sovGrid=$('sov-grid');
let sovBuilt=false;
function buildOverlayGrid(){
 if(!sovGrid)return;
 sovBuilt=true;
 const list=ovCat==='all'?STUDIO_OVERLAYS:STUDIO_OVERLAYS.filter(o=>o.cat===ovCat);
 sovGrid.innerHTML='';
 for(const ov of list){
  const b=document.createElement('button');b.type='button';b.className='sov-card';
  const th=renderStudioOverlay(ov.id,136,88,ovSeed);
  th.className='sov-thumb';
  b.append(th);
  const sp=document.createElement('span');sp.textContent=ov.name;
  const sm=document.createElement('small');sm.textContent=ov.sub;
  b.append(sp,sm);
  b.onclick=()=>addStudioOverlayToCanvas(ov);
  sovGrid.append(b);
 }
}

$('sov-cats')?.addEventListener('click',e=>{
 const b=e.target.closest('[data-oc]');if(!b)return;
 ovCat=b.dataset.oc;
 $('sov-cats').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));
 buildOverlayGrid();
});
$('sov-rand')?.addEventListener('click',()=>{ovSeed=Math.floor(Math.random()*99999);buildOverlayGrid();showToast('Generated new overlay seed',1200)});
$('sov-flip')?.addEventListener('click',e=>{ovFlip=!ovFlip;e.currentTarget.setAttribute('aria-pressed',String(ovFlip))});
['sov-op','sov-hue'].forEach(id=>$(id)?.addEventListener('input',e=>{
 const o=e.target.nextElementSibling;if(o)o.value=e.target.value+(id==='sov-op'?'%':'°');
}));

/* Sync Default Film Grain slider inside Overlays tab directly with #ag */
const ovGrain=$('ov-grain-sync');
if(ovGrain){
 ovGrain.addEventListener('input',()=>{
  const ag=$('ag');if(!ag)return;
  ag.value=ovGrain.value;
  ag.dispatchEvent(new Event('input',{bubbles:true}));
  const o=ovGrain.nextElementSibling;if(o)o.textContent=ovGrain.value;
 });
 $('ag')?.addEventListener('input',()=>{
  ovGrain.value=$('ag').value;
  const o=ovGrain.nextElementSibling;if(o)o.textContent=ovGrain.value;
 });
}

document.querySelectorAll('.tabs button[data-t="glints"], #cat-tabs button[data-cat="edit"]').forEach(btn=>{
 btn.addEventListener('click',()=>{if(!sovBuilt)setTimeout(buildOverlayGrid,20)});
});
})();
