/* Totone v7.0.0 — Live Non-Destructive Polaroid & Disposable Camera Studio + Basic Canvas Expand */
(function(){
const clamp=(v,lo,hi)=>v<lo?lo:v>hi?hi:v;
const clamp8=v=>v<0?0:v>255?255:v|0;

/* ========== 1. Super Basic Canvas Expand ========== */
$('exp-run')?.addEventListener('click',()=>{
 if(!base){showToast('Open an image first',1400);return}
 const amt=clamp(Math.round(+$('exp-amt')?.value||120),10,1200);
 const sides=$('exp-sides')?.value||'all';
 const fill=$('exp-fill')?.value||'blur';
 const padL=(sides==='all'||sides==='lr')?amt:0;
 const padR=(sides==='all'||sides==='lr')?amt:0;
 const padT=(sides==='all'||sides==='tb')?amt:0;
 const padB=(sides==='all'||sides==='tb'||sides==='bot')?amt:0;
 const nw=W+padL+padR,nh=H+padT+padB;
 if(nw>6000||nh>6000){showToast('Expanded size exceeds 6000px limit',1800);return}

 pushU(cropSnap());
 polSrc=null;polActive=false;
 const srcCv=bc(W,H);
 srcCv.getContext('2d').putImageData(base,0,0);
 const outCv=bc(nw,nh),g=outCv.getContext('2d');

 if(fill==='white'){g.fillStyle='#ffffff';g.fillRect(0,0,nw,nh)}
 else if(fill==='black'){g.fillStyle='#0e0e10';g.fillRect(0,0,nw,nh)}
 else if(fill==='blur'){
  g.save();
  g.filter='blur(24px) brightness(0.92)';
  const sc=Math.max(nw/W,nh/H)*1.12;
  const dw=W*sc,dh=H*sc;
  g.drawImage(srcCv,(nw-dw)/2,(nh-dh)/2,dw,dh);
  g.restore();
 }else if(fill==='edge'){
  g.drawImage(srcCv,0,0,nw,nh);
  if(padL)g.drawImage(srcCv,0,0,2,H,0,padT,padL,H);
  if(padR)g.drawImage(srcCv,W-2,0,2,H,padL+W,padT,padR,H);
  if(padT)g.drawImage(srcCv,0,0,W,2,padL,0,W,padT);
  if(padB)g.drawImage(srcCv,0,H-2,W,2,padL,padT+H,W,padB);
 }
 g.drawImage(srcCv,padL,padT);

 const im=g.getImageData(0,0,nw,nh);
 W=nw;H=nh;c.width=W;c.height=H;
 base=new ImageData(new Uint8ClampedArray(im.data),W,H);
 orig=new ImageData(new Uint8ClampedArray(im.data),W,H);
 sel=null;
 layers.forEach(l=>{l.x+=padL;l.y+=padT});
 outIm=null;fcache=null;cdirty=true;SCR.clear();jit=null;
 if(zoomV&&$('zoom').value!=='0')c.style.width=W*zoomV+'px';
 film?.rememberPixels();
 CR=tab==='crop'?cropInit():null;
 extract();updInfo();refreshLayers();if(typeof cropInfo==='function')cropInfo();draw();
 showToast(`Expanded canvas to ${W} × ${H} px`,1800);
});

/* ========== 2. 12 Authentic Polaroid & Disposable Camera Color Science Stocks ========== */
const POLAROID_STOCKS=[
 {
  id:'quicksnap',name:'QuickSnap 400',tag:'Disposable',
  swatch:'linear-gradient(135deg,#183a2c,#5aa87c,#e8f3dc)',
  lift:[14,22,18],gain:[1.02,1.06,0.97],mid:[0.97,1.04,0.98],
  sat:1.12,con:1.08,grain:22,vig:0.26,warmLeak:0.08,bw:false
 },
 {
  id:'funsaver',name:'FunSaver 800',tag:'Disposable',
  swatch:'linear-gradient(135deg,#2b1c12,#d48332,#fce3a6)',
  lift:[20,16,10],gain:[1.12,1.04,0.88],mid:[1.06,1.01,0.91],
  sat:1.18,con:1.12,grain:30,vig:0.32,warmLeak:0.18,bw:false
 },
 {
  id:'hp5',name:'Ilford HP5',tag:'B&W Disp.',
  swatch:'linear-gradient(135deg,#141414,#6c6c6c,#e6e6e6)',
  lift:[18,18,18],gain:[1.05,1.05,1.05],mid:[1.0,1.0,1.0],
  sat:0,con:1.22,grain:28,vig:0.28,warmLeak:0,bw:true
 },
 {
  id:'cinestill',name:'CineStill 800T',tag:'Tungsten',
  swatch:'linear-gradient(135deg,#0f2238,#3e7ca6,#f29e6d)',
  lift:[8,18,32],gain:[1.10,1.00,0.96],mid:[0.96,1.02,1.08],
  sat:1.14,con:1.12,grain:20,vig:0.24,warmLeak:0.22,bw:false
 },
 {
  id:'gold200',name:'Kodak Gold 200',tag:'35mm Color',
  swatch:'linear-gradient(135deg,#3b2410,#d99a3b,#faecc3)',
  lift:[18,14,8],gain:[1.14,1.06,0.86],mid:[1.07,1.02,0.90],
  sat:1.16,con:1.06,grain:16,vig:0.20,warmLeak:0.14,bw:false
 },
 {
  id:'lomo',name:'Lomo Purple',tag:'Experimental',
  swatch:'linear-gradient(135deg,#281038,#8b4ca8,#e6b8d8)',
  lift:[22,12,26],gain:[1.10,0.88,1.16],mid:[1.08,0.86,1.14],
  sat:1.15,con:1.10,grain:24,vig:0.30,warmLeak:0.12,bw:false
 },
 {
  id:'sx70',name:'Polaroid SX-70',tag:'Instant',
  swatch:'linear-gradient(135deg,#283738,#b8926a,#f4e4c8)',
  lift:[22,26,28],gain:[1.08,1.02,0.90],mid:[1.04,0.99,0.92],
  sat:0.88,con:0.94,grain:16,vig:0.22,warmLeak:0.14,bw:false
 },
 {
  id:'p600',name:'Polaroid 600',tag:'Instant',
  swatch:'linear-gradient(135deg,#1a2c38,#799c94,#e8dfd1)',
  lift:[18,24,26],gain:[1.04,1.03,0.95],mid:[1.02,1.01,0.96],
  sat:0.92,con:1.02,grain:18,vig:0.24,warmLeak:0.10,bw:false
 },
 {
  id:'itype',name:'Polaroid i-Type',tag:'Modern',
  swatch:'linear-gradient(135deg,#1e242c,#8ea2b4,#f5f2ec)',
  lift:[12,15,18],gain:[1.03,1.02,0.98],mid:[1.01,1.0,0.99],
  sat:1.0,con:1.05,grain:12,vig:0.16,warmLeak:0.04,bw:false
 },
 {
  id:'aged98',name:'Aged 1998 Film',tag:'Expired',
  swatch:'linear-gradient(135deg,#382a1e,#a8855c,#e8d6b2)',
  lift:[36,30,22],gain:[1.12,1.01,0.82],mid:[1.08,0.98,0.84],
  sat:0.74,con:0.86,grain:34,vig:0.38,warmLeak:0.32,bw:false
 },
 {
  id:'instax',name:'Instax Flash',tag:'Instant',
  swatch:'linear-gradient(135deg,#2d2734,#c4a8bc,#fbf6f8)',
  lift:[16,16,20],gain:[1.07,1.04,1.08],mid:[1.04,1.02,1.04],
  sat:0.96,con:1.10,grain:10,vig:0.18,warmLeak:0.06,bw:false
 },
 {
  id:'sepia74',name:'Sepia 1974',tag:'Vintage',
  swatch:'linear-gradient(135deg,#2a1e14,#8c694a,#e6d4b8)',
  lift:[26,20,14],gain:[1.15,1.02,0.82],mid:[1.10,0.96,0.78],
  sat:0.18,con:1.04,grain:24,vig:0.34,warmLeak:0.16,bw:false
 }
];

const FRAME_PREVIEWS=[
 {id:'classic',name:'Classic White',bg:'#f5f3ec',photo:'#2a2d34',chin:11},
 {id:'aged',name:'Aged Cream',bg:'#e6dcbf',photo:'#3a3126',chin:11},
 {id:'black',name:'Matte Black',bg:'#18181c',photo:'#2f323b',chin:11,dark:true},
 {id:'wide',name:'Wide Format',bg:'#f5f3ec',photo:'#2a2d34',chin:7,wide:true},
 {id:'mint',name:'Duochrome Mint',bg:'#d7e8dc',photo:'#243029',chin:11},
 {id:'blush',name:'Blush Pink',bg:'#f2dce0',photo:'#332528',chin:11},
 {id:'sky',name:'Sky Pastel',bg:'#d6e6f2',photo:'#222c36',chin:11},
 {id:'terra',name:'Terracotta',bg:'#c96f4d',photo:'#2c211d',chin:11,dark:true},
 {id:'gold',name:'Gold Foil',bg:'linear-gradient(135deg,#d4b26a,#f3df9e,#b58e42)',photo:'#2b261c',chin:11},
 {id:'strip35',name:'35mm Film',bg:'#111113',photo:'#2a2d34',chin:6,strip:true,dark:true},
 {id:'custom',name:'Custom Color',bg:'linear-gradient(135deg,#c9b8a3,#8fa89b,#b896a8)',photo:'#26282e',chin:11},
 {id:'none',name:'Filter Only',bg:'transparent',photo:'#2f7cf6',chin:0,none:true}
];

let selectedStock=POLAROID_STOCKS[6]; // Polaroid SX-70
let polSrc=null; // Clean unframed source image — NEVER overwritten by a framed render!
let polActive=false;
let polTimer=null;
let polRenderSeq=0;
let polOffset={x:0,y:0};

// Clear polSrc whenever a brand new image is opened
$('file')?.addEventListener('change',()=>{polSrc=null;polActive=false;polOffset={x:0,y:0}});
window.resetPolaroidStudio=(silent=false)=>{
 const had=polActive&&polSrc;
 if(had&&!silent){clearPolaroid()}
 else{polSrc=null;polActive=false;polOffset={x:0,y:0}}
 if($('pol-int'))$('pol-int').value='88';
 if($('pol-grain'))$('pol-grain').value='12';
 if($('pol-age'))$('pol-age').value='14';
 if($('pol-frame-age'))$('pol-frame-age').value='0';
 if($('pol-leak'))$('pol-leak').checked=false;
 if($('pol-date'))$('pol-date').checked=false;
 if($('pol-cap'))$('pol-cap').value='';
 if($('pol-capsz'))$('pol-capsz').value='100';
 if($('pol-frame')){$('pol-frame').value='classic';syncFrameGrid()}
 const clr=$('pol-clear');if(clr)clr.disabled=true;
 if(typeof syncAutoOutputs==='function')syncAutoOutputs();
};

function applyColorScience(im,stock,intensity,extraGrain,ageAmt,leakOn){
 const d=im.data,w=im.width,h=im.height;
 const t=clamp(intensity/100,0,1);
 if(t<=0)return;
 const grAmt=(stock.grain*(0.5+t*0.5)+extraGrain)*0.65;
 const age=clamp(ageAmt/100,0,1);
 const cx=w*0.5,cy=h*0.5,maxD=Math.hypot(cx,cy)||1;
 const con=1+(stock.con-1)*t*(1-age*0.25);
 const sat=stock.bw?0:1+(stock.sat-1)*t*(1-age*0.35);

 for(let y=0;y<h;y++){
  const dy=y-cy;
  for(let x=0;x<w;x++){
   const i=(y*w+x)*4;
   const r0=d[i],g0=d[i+1],b0=d[i+2];
   const lum=0.299*r0+0.587*g0+0.114*b0;
   let r=lum+(r0-lum)*sat;
   let g=lum+(g0-lum)*sat;
   let b=lum+(b0-lum)*sat;
   r=(r-128)*con+128;
   g=(g-128)*con+128;
   b=(b-128)*con+128;
   const lNorm=clamp(lum/255,0,1);
   const midW=4*lNorm*(1-lNorm);
   const hiW=lNorm*lNorm;
   const shW=(1-lNorm)*(1-lNorm);
   r=r*(1+(stock.mid[0]-1)*midW+(stock.gain[0]-1)*hiW)+(stock.lift[0]+age*26)*shW;
   g=g*(1+(stock.mid[1]-1)*midW+(stock.gain[1]-1)*hiW)+(stock.lift[1]+age*18)*shW;
   b=b*(1+(stock.mid[2]-1)*midW+(stock.gain[2]-1)*hiW)+(stock.lift[2]+age*6)*shW;
   if(age>0){r+=age*12*hiW;b-=age*16*hiW}
   const dist=Math.hypot(x-cx,dy)/maxD;
   const vig=1-clamp((dist-0.42)*1.35,0,1)*(stock.vig+age*0.16)*t;
   r*=vig;g*=vig;b*=vig;
   if(leakOn){
    const lx=clamp(1-(x/(w*0.42)),0,1);
    const ly=clamp(1-((h-y)/(h*0.75)),0,1);
    const lk=lx*lx*(0.45+0.55*ly)*(0.35+stock.warmLeak+age*0.25)*t;
    r+=lk*155;g+=lk*62;b+=lk*18;
   }
   if(grAmt>0){
    const n=(Math.random()-0.5)*2*grAmt*(0.45+0.55*midW);
    r+=n;g+=n*0.96;b+=n*1.04;
   }
   d[i]=clamp8(r0+(r-r0)*t);
   d[i+1]=clamp8(g0+(g-g0)*t);
   d[i+2]=clamp8(b0+(b-b0)*t);
  }
 }
}

async function drawDateStamp(g,x,y,photoW,photoH){
 try{if(typeof ensureFont==='function')await ensureFont('Orbitron')}catch{}
 const now=new Date();
 const yy=String(now.getFullYear()).slice(-2);
 const mm=String(now.getMonth()+1).padStart(2,'0');
 const dd=String(now.getDate()).padStart(2,'0');
 const txt=`'${yy}  ${mm}  ${dd}`;
 const sz=Math.max(13,Math.round(Math.min(photoW,photoH)*0.036));
 g.save();
 g.font=`700 ${sz}px "Orbitron","VT323",ui-monospace,monospace`;
 g.textAlign='right';g.textBaseline='bottom';
 const px=x+photoW-sz*0.85,py=y+photoH-sz*0.72;
 // Authentic 90s red-orange quartz LED camera phosphor glow
 g.shadowColor='rgba(255,48,0,0.92)';
 g.shadowBlur=Math.max(6,sz*0.38);
 g.fillStyle='#ff5a1f';
 g.fillText(txt,px,py);
 g.shadowBlur=Math.max(2,sz*0.14);
 g.fillStyle='#ff9a44';
 g.fillText(txt,px,py);
 g.restore();
}

async function renderPolaroidLive(){
 if(!base){showToast('Open an image first',1400);return}
 const seq=++polRenderSeq;
 // Capture clean source image ONCE before any Polaroid frame is added (never recapture a framed canvas!)
 if(!polSrc){
  pushU(cropSnap());
  polSrc={
   W,H,
   base:new ImageData(new Uint8ClampedArray(base.data),W,H),
   orig:new ImageData(new Uint8ClampedArray(orig.data),W,H)
  };
  polOffset={x:0,y:0};
 }
 polActive=true;
 const sw=polSrc.W,sh=polSrc.H;
 const frameMode=$('pol-frame')?.value||'classic';
 const intensity=+$('pol-int')?.value||88;
 const extraGrain=+$('pol-grain')?.value||12;
 const ageAmt=+$('pol-age')?.value||14;
 const frameAge=clamp((+$('pol-frame-age')?.value||0)/100,0,1);
 const leakOn=!!$('pol-leak')?.checked;
 const dateOn=!!$('pol-date')?.checked;
 const caption=($('pol-cap')?.value||'').trim();
 const fontStyle=$('pol-font')?.value||'sharpie';
 const inkCol=$('pol-ink')?.value||'#1c1b1a';
 const capSizePct=+$('pol-capsz')?.value||100;
 const customCol=$('pol-col')?.value||'#d6d1c4';

 const photoCv=bc(sw,sh),pg=photoCv.getContext('2d',{willReadFrequently:true});
 const im=new ImageData(new Uint8ClampedArray(polSrc.base.data),sw,sh);
 applyColorScience(im,selectedStock,intensity,extraGrain,ageAmt,leakOn);
 pg.putImageData(im,0,0);
 if(dateOn)await drawDateStamp(pg,0,0,sw,sh);
 if(seq!==polRenderSeq)return;

 let side=0,top=0,bot=0,nw=sw,nh=sh,outCv=photoCv;
 if(frameMode!=='none'){
  if(frameMode==='strip35'){
   side=Math.round(Math.min(sw,sh)*0.09);
   top=Math.round(Math.min(sw,sh)*0.06);
   bot=Math.round(Math.min(sw,sh)*0.11);
  }else{
   side=Math.round(Math.min(sw,sh)*(frameMode==='wide'?0.065:0.075));
   top=side;
   bot=Math.round(Math.min(sw,sh)*(frameMode==='wide'?0.22:0.27));
  }
  nw=sw+side*2;nh=sh+top+bot;
  outCv=bc(nw,nh);
  const g=outCv.getContext('2d');

  if(frameMode==='gold'){
   const gr=g.createLinearGradient(0,0,nw,nh);
   gr.addColorStop(0,'#c9a659');gr.addColorStop(0.5,'#f1dd9c');gr.addColorStop(1,'#ad8639');
   g.fillStyle=gr;
  }else{
   const paperCols={
    classic:'#f5f3ec',aged:'#e7dec6',black:'#17171a',wide:'#f5f3ec',
    mint:'#d7e8dc',blush:'#f2dce0',sky:'#d6e6f2',terra:'#c96f4d',
    strip35:'#111113',custom:customCol
   };
   g.fillStyle=paperCols[frameMode]||'#f5f3ec';
  }
  g.fillRect(0,0,nw,nh);

  // Subtle tactile paper grain + optional Aged Frame yellowing & wear patina on ANY frame
  const pIm=g.getImageData(0,0,nw,nh),pd=pIm.data;
  const totalAge=frameMode==='aged'?Math.max(0.55,frameAge):frameAge;
  const paperNoise=5+totalAge*14;
  for(let i=0;i<pd.length;i+=4){
   const n=(Math.random()-0.5)*paperNoise*2;
   let r=pd[i]+n,gr=pd[i+1]+n,b=pd[i+2]+n;
   if(totalAge>0){
    r-=totalAge*6;gr-=totalAge*14;b-=totalAge*34;
   }
   pd[i]=clamp8(r);pd[i+1]=clamp8(gr);pd[i+2]=clamp8(b);
  }
  g.putImageData(pIm,0,0);

  if(totalAge>0){
   const rad=g.createRadialGradient(nw/2,nh/2,Math.min(nw,nh)*0.30,nw/2,nh/2,Math.max(nw,nh)*0.72);
   rad.addColorStop(0,'rgba(140,104,52,0)');
   rad.addColorStop(1,`rgba(115,82,38,${(0.28*totalAge).toFixed(3)})`);
   g.fillStyle=rad;g.fillRect(0,0,nw,nh);
   // Subtle vintage paper scuffs & speckles
   const specks=Math.round(totalAge*55);
   g.fillStyle=`rgba(92,68,38,${(0.18*totalAge).toFixed(3)})`;
   for(let s=0;s<specks;s++){
    const sx=Math.random()*nw,sy=Math.random()*nh,sr=0.8+Math.random()*2.4;
    g.beginPath();g.arc(sx,sy,sr,0,Math.PI*2);g.fill();
   }
  }

  // 35mm sprocket holes on left & right rails
  if(frameMode==='strip35'){
   g.fillStyle='#ececef';
   const hw=Math.max(8,Math.round(side*0.42)),hh=Math.round(hw*1.35),gap=Math.round(hh*1.65);
   for(let y=top;y<nh-top-hh;y+=gap){
    g.beginPath();g.roundRect(Math.round((side-hw)/2),y,hw,hh,3);g.fill();
    g.beginPath();g.roundRect(nw-side+Math.round((side-hw)/2),y,hw,hh,3);g.fill();
   }
  }

  g.drawImage(photoCv,side,top,sw,sh);
  const isDarkFrame=frameMode==='black'||frameMode==='strip35'||frameMode==='terra';
  g.strokeStyle=isDarkFrame?'rgba(255,255,255,0.09)':'rgba(0,0,0,0.14)';
  g.lineWidth=Math.max(1.5,side*0.025);
  g.strokeRect(side,top,sw,sh);

  // Caption rendering with authentic Sharpie / Pen / Typewriter styles
  if(caption){
   const fontMap={
    sharpie:{fam:'Permanent Marker',wt:'400',scale:0.31,tilt:-0.02,bleed:true},
    hand:{fam:'Caveat',wt:'700',scale:0.37,tilt:-0.015,bleed:false},
    pen:{fam:'Gloria Hallelujah',wt:'400',scale:0.26,tilt:-0.01,bleed:false},
    script:{fam:'Satisfy',wt:'400',scale:0.34,tilt:0,bleed:false},
    typewriter:{fam:'Special Elite',wt:'400',scale:0.26,tilt:0,bleed:false},
    mono:{fam:'Space Mono',wt:'700',scale:0.22,tilt:0,bleed:false}
   };
   const fm=fontMap[fontStyle]||fontMap.sharpie;
   try{if(typeof ensureFont==='function')await ensureFont(fm.fam)}catch{}
   if(seq!==polRenderSeq)return;
   const cSz=Math.max(18,Math.round(bot*fm.scale*(capSizePct/100)));
   g.save();
   g.translate(nw/2,top+sh+bot*0.52);
   if(fm.tilt)g.rotate(fm.tilt);
   g.font=`${fm.wt} ${cSz}px "${fm.fam}",cursive,sans-serif`;
   g.textAlign='center';g.textBaseline='middle';
   // Auto-contrast if user left default dark ink on a dark frame
   const useCol=(isDarkFrame&&inkCol==='#1c1b1a')?'#f2f2f5':inkCol;
   g.fillStyle=useCol;
   if(fm.bleed){
    // Authentic Sharpie felt-tip bleed on matte Polaroid paper
    g.shadowColor=useCol;
    g.shadowBlur=Math.max(1.2,cSz*0.035);
    g.globalAlpha=0.92;
   }else{
    g.globalAlpha=0.88;
   }
   g.fillText(caption,0,0,nw-side*2.2);
   g.restore();
  }
 }

 const finalIm=outCv.getContext('2d').getImageData(0,0,nw,nh);
 // Adjust layer positions relative to previous Polaroid offset so layers never drift
 const dx=side-polOffset.x,dy=top-polOffset.y;
 polOffset={x:side,y:top};
 W=nw;H=nh;c.width=W;c.height=H;
 base=new ImageData(new Uint8ClampedArray(finalIm.data),W,H);
 orig=new ImageData(new Uint8ClampedArray(finalIm.data),W,H);
 sel=null;
 if(dx||dy)layers.forEach(l=>{l.x+=dx;l.y+=dy});
 outIm=null;fcache=null;cdirty=true;SCR.clear();jit=null;
 if(zoomV&&$('zoom').value!=='0')c.style.width=W*zoomV+'px';
 film?.rememberPixels();
 CR=tab==='crop'?cropInit():null;
 extract();updInfo();refreshLayers();if(typeof cropInfo==='function')cropInfo();draw();
 const clr=$('pol-clear');if(clr)clr.disabled=false;
}

function schedulePolaroid(){
 if(!base)return;
 clearTimeout(polTimer);
 polTimer=setTimeout(renderPolaroidLive,45);
}

function clearPolaroid(){
 if(!polSrc||!polActive)return;
 pushU(cropSnap());
 const dx=-polOffset.x,dy=-polOffset.y;
 W=polSrc.W;H=polSrc.H;c.width=W;c.height=H;
 base=new ImageData(new Uint8ClampedArray(polSrc.base.data),W,H);
 orig=new ImageData(new Uint8ClampedArray(polSrc.orig.data),W,H);
 if(dx||dy)layers.forEach(l=>{l.x+=dx;l.y+=dy});
 polSrc=null;polActive=false;polOffset={x:0,y:0};
 outIm=null;fcache=null;cdirty=true;SCR.clear();jit=null;
 if(zoomV&&$('zoom').value!=='0')c.style.width=W*zoomV+'px';
 film?.rememberPixels();
 CR=tab==='crop'?cropInit():null;
 extract();updInfo();refreshLayers();if(typeof cropInfo==='function')cropInfo();draw();
 const clr=$('pol-clear');if(clr)clr.disabled=true;
 showToast('Removed Polaroid / Film look',1400);
}

/* Build 12 Stock Cards — 1-Click Instant Switch! */
const grid=$('pol-stock-grid');
if(grid){
 grid.innerHTML=POLAROID_STOCKS.map((st,idx)=>`<button type="button" class="pol-stock${idx===6?' on':''}" data-ps="${st.id}"><i style="background:${st.swatch}"></i><span>${st.name}</span><small>${st.tag}</small></button>`).join('');
 grid.addEventListener('click',e=>{
  const b=e.target.closest('[data-ps]');if(!b)return;
  const st=POLAROID_STOCKS.find(x=>x.id===b.dataset.ps);if(!st)return;
  selectedStock=st;
  grid.querySelectorAll('.pol-stock').forEach(x=>x.classList.toggle('on',x===b));
  const fr=$('pol-frame');
  if(fr){
   if(st.id==='quicksnap'||st.id==='funsaver'||st.id==='hp5'||st.id==='cinestill'||st.id==='gold200'||st.id==='lomo'){
    if(!polActive)fr.value='none';
   }else if(st.id==='aged98'||st.id==='sepia74'){
    if(fr.value==='none')fr.value='aged';
   }else if(fr.value==='none'){
    fr.value='classic';
   }
   syncFrameGrid();
  }
  renderPolaroidLive();
 });
}

/* Build 12 Visual Polaroid Frame Preview Cards — 1-Click Instant Switch! */
const frameGrid=$('pol-frame-grid');
function syncFrameGrid(){
 const val=$('pol-frame')?.value||'classic';
 frameGrid?.querySelectorAll('.pol-fcard').forEach(b=>b.classList.toggle('on',b.dataset.pf===val));
 const colRow=$('pol-col-row');
 if(colRow)colRow.hidden=val!=='custom';
}
if(frameGrid){
 frameGrid.innerHTML=FRAME_PREVIEWS.map(f=>`<button type="button" class="pol-fcard${f.id==='classic'?' on':''}" data-pf="${f.id}"><span class="pf-mini${f.wide?' wide':''}${f.none?' none':''}${f.strip?' strip':''}" style="background:${f.bg};padding-bottom:${f.chin}px"><i style="background:${f.photo}"></i></span><small>${f.name}</small></button>`).join('');
 frameGrid.addEventListener('click',e=>{
  const b=e.target.closest('[data-pf]');if(!b)return;
  const fr=$('pol-frame');
  if(fr){fr.value=b.dataset.pf;syncFrameGrid();renderPolaroidLive()}
 });
}
$('pol-frame')?.addEventListener('change',()=>{syncFrameGrid();renderPolaroidLive()});
syncFrameGrid();

/* Live-updating sliders, toggles, font, ink & caption */
['pol-int','pol-grain','pol-age','pol-frame-age','pol-capsz','pol-col','pol-ink'].forEach(id=>{
 $(id)?.addEventListener('input',()=>{
  if(polActive||base)schedulePolaroid();
 });
});
['pol-leak','pol-date','pol-font'].forEach(id=>{
 $(id)?.addEventListener('change',()=>{
  if(base)renderPolaroidLive();
 });
});
$('pol-cap')?.addEventListener('input',()=>{
 if(base)schedulePolaroid();
});
document.querySelectorAll('#pol-ink-swatches button').forEach(btn=>{
 btn.addEventListener('click',()=>{
  const ink=$('pol-ink');
  if(ink){ink.value=btn.dataset.ink;if(base)renderPolaroidLive()}
 });
});
$('pol-clear')?.addEventListener('click',()=>window.resetPolaroidStudio(false));
$('pol-reset-top')?.addEventListener('click',()=>window.resetPolaroidStudio(false));
window.openPolaroidMode=()=>{
 document.querySelector('#cat-tabs button[data-cat="color"]')?.click();
 document.querySelector('.tabs button[data-t="film"]')?.click();
 setTimeout(()=>$('polaroid-studio')?.scrollIntoView({behavior:'smooth',block:'start'}),60);
};
})();
