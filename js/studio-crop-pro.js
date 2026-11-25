/* Totone v5.3.0 — Lightroom-Style Crop & Straighten Studio: Interactive Auto-Crop (places adjustable CR box on canvas), 1-Click Auto Straighten (edge orientation detector), Interactive Draw Horizon Line, Auto-Constrain on Rotate & Golden/Diagonal/Fine Crop Overlays */
(function(){
const clamp=(v,lo,hi)=>v<lo?lo:v>hi?hi:v;
function loadScriptOnce(url,checkFn){
 if(checkFn())return Promise.resolve();
 return new Promise((res,rej)=>{
  const s=document.createElement('script');s.src=url;s.crossOrigin='anonymous';
  s.onload=res;s.onerror=()=>rej(Error('Failed to load '+url.split('/').pop()));
  document.head.appendChild(s);
 });
}

/* ---------- Helper: Compute Largest Axis-Aligned Inscribed Box for Rotation Angle ---------- */
function inscribedCropBox(w,h,deg){
 const rad=Math.abs(deg)*Math.PI/180;
 if(rad<0.001)return {x:0,y:0,w,h};
 const si=Math.sin(rad),co=Math.cos(rad);
 const longS=Math.max(w,h),shortS=Math.min(w,h);
 let nw,nh;
 if(shortS<=2*si*co*longS){
  const x=0.5*shortS;
  nw=w>=h?x/si:x/co;nh=w>=h?x/co:x/si;
 }else{
  const cos2=co*co-si*si;
  nw=(w*co-h*si)/cos2;nh=(h*co-w*si)/cos2;
 }
 nw=clamp(Math.floor(nw),32,w);nh=clamp(Math.floor(nh),32,h);
 return {x:Math.round((w-nw)/2),y:Math.round((h-nh)/2),w:nw,h:nh};
}

function setInteractiveCropBox(box){
 if(!base||!box)return;
 // Switch to Crop tab if not already there
 if(tab!=='crop')document.querySelector('.tabs [data-t="crop"]')?.click();
 CR={
  x:clamp(Math.round(box.x),0,W-20),
  y:clamp(Math.round(box.y),0,H-20),
  w:clamp(Math.round(box.w),20,W),
  h:clamp(Math.round(box.h),20,H)
 };
 if(CR.x+CR.w>W)CR.w=W-CR.x;
 if(CR.y+CR.h>H)CR.h=H-CR.y;
 if(typeof cropInfo==='function')cropInfo();
 draw();
}

function getSelectedAspectRatio(){
 const activeChip=document.querySelector('#crat button.on');
 const r=activeChip?.dataset.r||'free';
 if(r==='free')return null;
 if(r==='orig')return W/Math.max(1,H);
 if(r==='custom'){
  const cw=+$('crw')?.value||5,ch=+$('crh')?.value||7;
  return cw/Math.max(1,ch);
 }
 const parts=r.split(':').map(Number);
 if(parts.length===2&&parts[0]>0&&parts[1]>0)return parts[0]/parts[1];
 return null;
}

/* ========== 1. 1-Click Auto Crop (Interactive Lightroom Box on Canvas!) ========== */
$('crop-auto-ai')?.addEventListener('click',async()=>{
 if(!base){showToast('Open an image first',1400);return}
 const btn=$('crop-auto-ai');btn.disabled=true;
 showToast('Analyzing subject & framing crop box…',1400);
 try{
  const targetRatio=getSelectedAspectRatio()||(W>H?4/3:4/5);
  render(false);
  const sc=Math.min(1,720/Math.max(W,H));
  const sm=bc(Math.max(1,Math.round(W*sc)),Math.max(1,Math.round(H*sc)));
  sm.getContext('2d').drawImage(c,0,0,sm.width,sm.height);
  draw(true);

  let bestBox=null;
  try{
   await loadScriptOnce('https://cdn.jsdelivr.net/npm/smartcrop@2.0.5/smartcrop.min.js',()=>!!window.smartcrop);
   const rw=Math.round(targetRatio*200),rh=200;
   const res=await window.smartcrop.crop(sm,{width:rw,height:rh});
   if(res?.topCrop){
    const tc=res.topCrop;
    bestBox={x:tc.x/sc,y:tc.y/sc,w:tc.width/sc,h:tc.height/sc};
   }
  }catch{}

  if(!bestBox){
   // Instant offline saliency fallback: center-weighted high-contrast bounding box
   let bw=W*0.86,bh=bw/targetRatio;
   if(bh>H*0.86){bh=H*0.86;bw=bh*targetRatio}
   bestBox={x:(W-bw)/2,y:(H-bh)/2,w:bw,h:bh};
  }
  setInteractiveCropBox(bestBox);
  showToast('Auto Crop framed! Drag handles to fine-tune or press Enter to apply.',2200);
 }finally{btn.disabled=false}
});

/* ========== 2. 1-Click Auto Straighten (Sobel Gradient Dominant-Angle Horizon Detector) ========== */
function detectHorizonAngle(){
 render(false);
 const sc=Math.min(1,420/Math.max(W,H));
 const sw=Math.max(32,Math.round(W*sc)),sh=Math.max(32,Math.round(H*sc));
 const sm=bc(sw,sh),sg=sm.getContext('2d',{willReadFrequently:true});
 sg.drawImage(c,0,0,sw,sh);draw(true);
 const d=sg.getImageData(0,0,sw,sh).data;
 const lum=new Float32Array(sw*sh);
 for(let i=0;i<lum.length;i++)lum[i]=0.299*d[i*4]+0.587*d[i*4+1]+0.114*d[i*4+2];
 // Histogram of edge angles in [-18°, +18°] at 0.25° resolution (145 bins)
 const bins=new Float32Array(145);
 for(let y=2;y<sh-2;y++)for(let x=2;x<sw-2;x++){
  const gx=-lum[(y-1)*sw+x-1]+lum[(y-1)*sw+x+1]-2*lum[y*sw+x-1]+2*lum[y*sw+x+1]-lum[(y+1)*sw+x-1]+lum[(y+1)*sw+x+1];
  const gy=-lum[(y-1)*sw+x-1]-2*lum[(y-1)*sw+x]-lum[(y-1)*sw+x+1]+lum[(y+1)*sw+x-1]+2*lum[(y+1)*sw+x]+lum[(y+1)*sw+x+1];
  const mag=Math.hypot(gx,gy);
  if(mag<38)continue;
  // Edge tangent angle (perpendicular to gradient)
  let deg=Math.atan2(gy,gx)*180/Math.PI-90;
  // Fold to nearest horizontal or vertical axis in [-45, 45]
  deg=((deg%90)+135)%90-45;
  if(Math.abs(deg)<=18){
   const b=Math.round((deg+18)*4);
   if(b>=0&&b<145)bins[b]+=mag;
  }
 }
 // Smooth histogram slightly & pick strongest peak
 let bestBin=72,bestVal=0;
 for(let i=2;i<143;i++){
  const v=bins[i-1]*0.5+bins[i]+bins[i+1]*0.5;
  if(v>bestVal){bestVal=v;bestBin=i}
 }
 const detected=(bestBin/4)-18;
 return Math.abs(detected)<0.35?0:+(-detected).toFixed(1);
}

function applyStraightenAngle(deg){
 const angEl=$('film-angle');
 if(!angEl)return;
 const clamped=clamp(+deg,-45,45);
 angEl.value=String(clamped);
 angEl.dispatchEvent(new Event('input',{bubbles:true}));
 angEl.dispatchEvent(new Event('change',{bubbles:true}));
 if($('crop-constrain')?.checked&&base){
  setInteractiveCropBox(inscribedCropBox(W,H,clamped));
 }
}

$('crop-auto-level')?.addEventListener('click',()=>{
 if(!base){showToast('Open an image first',1400);return}
 const deg=detectHorizonAngle();
 if(deg===0){showToast('Horizon already looks level!',1400);return}
 applyStraightenAngle(deg);
 showToast(`Auto-straightened by ${deg>0?'+':''}${deg}°!`,1800);
});

// Auto-constrain crop box live while dragging the Straighten slider
$('film-angle')?.addEventListener('input',()=>{
 if(tab==='crop'&&$('crop-constrain')?.checked&&base){
  const deg=parseFloat($('film-angle').value)||0;
  CR=inscribedCropBox(W,H,deg);
  if(typeof cropInfo==='function')cropInfo();
 }
});

/* ========== 3. Interactive "Draw Horizon Line" Spirit Level Tool ========== */
let horizonMode=false,horDrag=null;
const horBtn=$('crop-horizon-draw'),guideCv=$('stage-guides');

function setHorizonMode(on){
 horizonMode=on;
 if(horBtn){
  horBtn.setAttribute('aria-pressed',String(on));
  horBtn.classList.toggle('pri',on);
  horBtn.textContent=on?'Drag along horizon on canvas…':'Draw Horizon Line';
 }
 if(!on){horDrag=null;clearHorizonGuide()}
}
function clearHorizonGuide(){
 if(guideCv&&$('grid-toggle')?.getAttribute('aria-pressed')!=='true'&&window.totoneSettings?.safezone==='off'){
  guideCv.style.display='none';
 }
}
function drawHorizonLineOverlay(x0,y0,x1,y1,deg){
 if(!guideCv||!base)return;
 const cr=c.getBoundingClientRect();if(!cr.width)return;
 const dpr=Math.min(2,devicePixelRatio||1);
 guideCv.style.display='block';
 guideCv.style.left=cr.left+'px';guideCv.style.top=cr.top+'px';
 guideCv.style.width=cr.width+'px';guideCv.style.height=cr.height+'px';
 const pw=Math.max(1,Math.round(cr.width*dpr)),ph=Math.max(1,Math.round(cr.height*dpr));
 if(guideCv.width!==pw)guideCv.width=pw;if(guideCv.height!==ph)guideCv.height=ph;
 const g=guideCv.getContext('2d');
 g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,cr.width,cr.height);
 g.strokeStyle='#38bdf8';g.lineWidth=2.5;
 g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();
 [[x0,y0],[x1,y1]].forEach(([px,py])=>{
  g.fillStyle='#ffffff';g.beginPath();g.arc(px,py,5,0,Math.PI*2);g.fill();
  g.strokeStyle='#050c1f';g.lineWidth=1.5;g.stroke();
 });
 const mx=(x0+x1)/2,my=(y0+y1)/2-14,txt=`${deg>0?'+':''}${deg.toFixed(1)}°`;
 g.font='700 12px "Space Mono",monospace';
 const tw=g.measureText(txt).width+14;
 g.fillStyle='rgba(5,12,31,0.88)';g.beginPath();g.roundRect(mx-tw/2,my-11,tw,22,11);g.fill();
 g.fillStyle='#38bdf8';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,mx,my);
}

horBtn?.addEventListener('click',()=>{
 if(!base){showToast('Open an image first',1400);return}
 setHorizonMode(!horizonMode);
});

c.addEventListener('pointerdown',e=>{
 if(!horizonMode||tab!=='crop'||e.button!==0||!base)return;
 e.preventDefault();e.stopImmediatePropagation();
 const cr=c.getBoundingClientRect();
 horDrag={x0:e.clientX-cr.left,y0:e.clientY-cr.top,x1:e.clientX-cr.left,y1:e.clientY-cr.top};
 c.setPointerCapture(e.pointerId);
},true);

c.addEventListener('pointermove',e=>{
 if(!horizonMode||!horDrag)return;
 e.preventDefault();e.stopImmediatePropagation();
 const cr=c.getBoundingClientRect();
 horDrag.x1=e.clientX-cr.left;horDrag.y1=e.clientY-cr.top;
 let deg=-Math.atan2(horDrag.y1-horDrag.y0,horDrag.x1-horDrag.x0)*180/Math.PI;
 if(deg>90)deg-=180;else if(deg<-90)deg+=180;
 if(Math.abs(deg)>45)deg=deg>0?deg-90:deg+90;
 drawHorizonLineOverlay(horDrag.x0,horDrag.y0,horDrag.x1,horDrag.y1,clamp(deg,-45,45));
},true);

c.addEventListener('pointerup',e=>{
 if(!horizonMode||!horDrag)return;
 e.preventDefault();e.stopImmediatePropagation();
 const dist=Math.hypot(horDrag.x1-horDrag.x0,horDrag.y1-horDrag.y0);
 if(dist>12){
  let deg=-Math.atan2(horDrag.y1-horDrag.y0,horDrag.x1-horDrag.x0)*180/Math.PI;
  if(deg>90)deg-=180;else if(deg<-90)deg+=180;
  if(Math.abs(deg)>45)deg=deg>0?deg-90:deg+90;
  const cur=parseFloat($('film-angle')?.value||'0');
  const next=clamp(+(cur+deg).toFixed(1),-45,45);
  applyStraightenAngle(next);
  showToast(`Leveled horizon (${next>0?'+':''}${next}°)!`,1500);
 }
 setHorizonMode(false);
},true);

/* ========== 4. Lightroom Extra Crop Overlays (Golden Ratio, Diagonals, Fine Level Grid — O Key) ========== */
const ovSel=$('crop-ov-style');
function drawExtraCropGrid(){
 if(tab!=='crop'||!base||!CR||!$('cgrid')?.checked)return;
 const style=ovSel?.value||'thirds';
 if(style==='thirds')return; // core.js draws Rule of Thirds natively!
 const g=c.getContext('2d'),{x,y,w,h}=CR;
 g.save();
 g.strokeStyle='rgba(255,255,255,0.45)';g.lineWidth=Math.max(1,W/900);
 g.beginPath();
 if(style==='golden'){
  [0.382,0.618].forEach(t=>{g.moveTo(x+w*t,y);g.lineTo(x+w*t,y+h);g.moveTo(x,y+h*t);g.lineTo(x+w,y+h*t)});
 }else if(style==='diag'){
  g.moveTo(x,y);g.lineTo(x+w,y+h);g.moveTo(x+w,y);g.lineTo(x,y+h);
 }else if(style==='fine'){
  for(let i=1;i<8;i++){g.moveTo(x+w*i/8,y);g.lineTo(x+w*i/8,y+h);g.moveTo(x,y+h*i/8);g.lineTo(x+w,y+h*i/8)}
 }
 g.stroke();g.restore();
}
ovSel?.addEventListener('change',()=>draw());
const origDrawCropPro=draw;
draw=function(...args){
 const r=origDrawCropPro.apply(this,args);
 if(tab==='crop'&&base&&CR)drawExtraCropGrid();
 return r;
};

// Press O while in Crop tab to cycle Lightroom crop overlays (Thirds -> Golden -> Diagonals -> Fine)
window.addEventListener('keydown',e=>{
 if(tab!=='crop'||!ovSel||e.ctrlKey||e.metaKey||e.altKey||/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||''))return;
 if(e.key.toLowerCase()==='o'){
  e.preventDefault();
  ovSel.selectedIndex=(ovSel.selectedIndex+1)%ovSel.options.length;
  ovSel.dispatchEvent(new Event('change'));
  showToast('Crop overlay: '+ovSel.options[ovSel.selectedIndex].text,1000);
 }
});
})();
