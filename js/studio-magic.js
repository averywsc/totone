/* Totone Magic & QoL Studio — Interactive Liquify Sculpt, Offline Magic Object Eraser, Dominant Color Palette & Saved Looks, PDF Export (jsPDF), Batch ZIP Converter (JSZip), Before/After Split & Clipboard Copy */
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
function captureCanvas(maxW=0){
 render(false);
 const sw=W,sh=H,sc=maxW?Math.min(1,maxW/Math.max(sw,sh)):1;
 const cv=bc(Math.max(1,Math.round(sw*sc)),Math.max(1,Math.round(sh*sc)));
 const g=cv.getContext('2d',{willReadFrequently:true});
 g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
 g.drawImage(c,0,0,cv.width,cv.height);
 draw(true);
 return cv;
}
function addCanvasAsLayer(cv,name){
 const g=cv.getContext('2d',{willReadFrequently:true});
 const d=g.getImageData(0,0,cv.width,cv.height);
 pushU(mkSnap('p'));
 const l={cv,d,o:null,lk:false,sh:null,ol:null,x:W/2,y:H/2,s:1,r:0,op:1,bm:'source-over',fl:false,vis:true,cl:0,ct:0,cr:0,cb:0,name};
 layers.push(l);active=l;refreshLayers();draw();
}

/* ---------- Unified Pro & Magic Studio Tab Launcher ---------- */
function openProStudioTab(tabKey='svg'){
 const dlg=$('pro-studio-dialog');if(!dlg)return;
 if(!dlg.open)dlg.showModal();
 const btn=document.querySelector(`#pro-tabs [data-pt="${tabKey}"]`);
 if(btn)btn.click();
}
window.openProStudioTab=openProStudioTab;

$('pro-tabs')?.addEventListener('click',e=>{
 const b=e.target.closest('[data-pt]');if(!b)return;
 const k=b.dataset.pt;
 document.querySelectorAll('#pro-tabs button').forEach(x=>x.classList.toggle('on',x===b));
 document.querySelectorAll('.pro-pane').forEach(p=>p.hidden=p.id!=='pt-'+k);
 if(k==='liquify')initLiquify();
 else if(k==='eraser')initMagicEraser();
 else if(k==='palette')renderLooksList();
 else if(k==='ba')renderBeforeAfter();
});

$('tool-dock')?.addEventListener('click',e=>{
 const b=e.target.closest('[data-dock="liquify"]');
 if(b){e.stopImmediatePropagation();openProStudioTab('liquify')}
},true);

/* ========== 1. Copy Composite Canvas PNG to Clipboard (Ctrl+Shift+C) ========== */
async function copyTotoneCanvas(){
 if(!base){showToast('Open an image first',1400);return}
 try{
  const cv=captureCanvas(0);
  const blob=await new Promise(res=>cv.toBlob(res,'image/png'));
  if(navigator.clipboard&&window.ClipboardItem){
   await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);
   showToast('Copied full canvas PNG to clipboard!',1600);
  }else{
   showToast('Clipboard image copy not supported in this browser',1800);
  }
 }catch{showToast('Could not write image to clipboard (check permission)',1800)}
}
window.copyTotoneCanvas=copyTotoneCanvas;
window.addEventListener('keydown',e=>{
 if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='c'){e.preventDefault();copyTotoneCanvas()}
});

/* ========== 2. Interactive Liquify Sculpt Studio ========== */
let liqTool='push',liqSrc=null,liqW=0,liqH=0,liqDx=null,liqDy=null,liqHist=[],liqDown=false,liqLast=null;
const liqCv=$('liq-canvas');

function initLiquify(){
 if(!base||!liqCv)return;
 const snap=captureCanvas(760);
 liqW=snap.width;liqH=snap.height;
 liqCv.width=liqW;liqCv.height=liqH;
 liqSrc=snap.getContext('2d',{willReadFrequently:true}).getImageData(0,0,liqW,liqH);
 liqDx=new Float32Array(liqW*liqH);
 liqDy=new Float32Array(liqW*liqH);
 liqHist=[];
 renderLiquifyPreview();
}

function renderLiquifyPreview(){
 if(!liqSrc||!liqCv)return;
 const g=liqCv.getContext('2d');
 const out=g.createImageData(liqW,liqH);
 warpImageData(liqSrc,out,liqDx,liqDy,liqW,liqH);
 g.putImageData(out,0,0);
}

function warpImageData(src,dst,dxArr,dyArr,w,h){
 const sd=src.data,dd=dst.data;
 for(let y=0;y<h;y++){
  for(let x=0;x<w;x++){
   const idx=y*w+x;
   const sx=clamp(x-dxArr[idx],0,w-1.001);
   const sy=clamp(y-dyArr[idx],0,h-1.001);
   const x0=sx|0,y0=sy|0,fx=sx-x0,fy=sy-y0;
   const i00=(y0*w+x0)*4,i10=i00+4,i01=i00+w*4,i11=i01+4,o=idx*4;
   const w00=(1-fx)*(1-fy),w10=fx*(1-fy),w01=(1-fx)*fy,w11=fx*fy;
   dd[o]=sd[i00]*w00+sd[i10]*w10+sd[i01]*w01+sd[i11]*w11;
   dd[o+1]=sd[i00+1]*w00+sd[i10+1]*w10+sd[i01+1]*w01+sd[i11+1]*w11;
   dd[o+2]=sd[i00+2]*w00+sd[i10+2]*w10+sd[i01+2]*w01+sd[i11+2]*w11;
   dd[o+3]=sd[i00+3]*w00+sd[i10+3]*w10+sd[i01+3]*w01+sd[i11+3]*w11;
  }
 }
}

function applyLiquifyDab(cx,cy,vx,vy){
 const rad=+$('liq-size').value*(liqW/760||1);
 const str=+$('liq-str').value/100;
 const r2=rad*rad;
 const x0=Math.max(0,Math.floor(cx-rad)),x1=Math.min(liqW-1,Math.ceil(cx+rad));
 const y0=Math.max(0,Math.floor(cy-rad)),y1=Math.min(liqH-1,Math.ceil(cy+rad));
 for(let y=y0;y<=y1;y++){
  for(let x=x0;x<=x1;x++){
   const rx=x-cx,ry=y-cy,d2=rx*rx+ry*ry;
   if(d2>=r2)continue;
   const f=Math.pow(1-Math.sqrt(d2)/rad,2)*str;
   const idx=y*liqW+x;
   if(liqTool==='push'){
    liqDx[idx]+=vx*f*0.95;liqDy[idx]+=vy*f*0.95;
   }else if(liqTool==='bloat'){
    liqDx[idx]+=rx*f*0.18;liqDy[idx]+=ry*f*0.18;
   }else if(liqTool==='pucker'){
    liqDx[idx]-=rx*f*0.18;liqDy[idx]-=ry*f*0.18;
   }else if(liqTool==='twirl-cw'||liqTool==='twirl-ccw'){
    const ang=(liqTool==='twirl-cw'?1:-1)*f*0.24;
    const ca=Math.cos(ang),sa=Math.sin(ang);
    liqDx[idx]+=(rx*ca-ry*sa-rx);
    liqDy[idx]+=(rx*sa+ry*ca-ry);
   }else if(liqTool==='reconstruct'){
    liqDx[idx]*=(1-f*0.5);liqDy[idx]*=(1-f*0.5);
   }
  }
 }
}

function liqCoords(e){
 const r=liqCv.getBoundingClientRect();
 return [(e.clientX-r.left)*liqW/r.width,(e.clientY-r.top)*liqH/r.height];
}
$('liq-tools')?.addEventListener('click',e=>{
 const b=e.target.closest('[data-lt]');if(!b)return;
 liqTool=b.dataset.lt;
 document.querySelectorAll('#liq-tools button').forEach(x=>x.classList.toggle('on',x===b));
});
$('liq-size')?.addEventListener('input',e=>{e.target.nextElementSibling.value=e.target.value+' px'});
$('liq-str')?.addEventListener('input',e=>{e.target.nextElementSibling.value=e.target.value+'%'});

liqCv?.addEventListener('pointerdown',e=>{
 if(!liqSrc)return;
 liqDown=true;liqCv.setPointerCapture(e.pointerId);
 if(liqHist.length>15)liqHist.shift();
 liqHist.push([new Float32Array(liqDx),new Float32Array(liqDy)]);
 const [x,y]=liqCoords(e);liqLast=[x,y];
 if(liqTool!=='push'){applyLiquifyDab(x,y,0,0);renderLiquifyPreview()}
});
liqCv?.addEventListener('pointermove',e=>{
 if(!liqDown||!liqLast)return;
 const [x,y]=liqCoords(e);
 const dx=x-liqLast[0],dy=y-liqLast[1];
 const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/Math.max(4,+$('liq-size').value*0.18)));
 for(let s=1;s<=steps;s++){
  const t=s/steps;
  applyLiquifyDab(liqLast[0]+dx*t,liqLast[1]+dy*t,dx/steps,dy/steps);
 }
 liqLast=[x,y];renderLiquifyPreview();
});
liqCv?.addEventListener('pointerup',()=>{liqDown=false;liqLast=null});
$('liq-undo')?.addEventListener('click',()=>{
 const prev=liqHist.pop();if(!prev)return;
 liqDx=prev[0];liqDy=prev[1];renderLiquifyPreview();
});
$('liq-reset')?.addEventListener('click',()=>{
 if(!liqDx)return;
 liqDx.fill(0);liqDy.fill(0);liqHist=[];renderLiquifyPreview();
});
$('liq-apply')?.addEventListener('click',()=>{
 if(!base||!liqDx)return;
 const full=captureCanvas(0);
 const fg=full.getContext('2d',{willReadFrequently:true});
 const fSrc=fg.getImageData(0,0,W,H);
 const fOut=fg.createImageData(W,H);
 const upDx=new Float32Array(W*H),upDy=new Float32Array(W*H);
 const sx=W/liqW,sy=H/liqH;
 for(let y=0;y<H;y++){
  const ly=Math.min(liqH-1,y/sy),y0=ly|0,y1=Math.min(liqH-1,y0+1),fy=ly-y0;
  for(let x=0;x<W;x++){
   const lx=Math.min(liqW-1,x/sx),x0=lx|0,x1=Math.min(liqW-1,x0+1),fx=lx-x0;
   const a=y0*liqW+x0,b=y0*liqW+x1,c1=y1*liqW+x0,d1=y1*liqW+x1;
   upDx[y*W+x]=((liqDx[a]*(1-fx)+liqDx[b]*fx)*(1-fy)+(liqDx[c1]*(1-fx)+liqDx[d1]*fx)*fy)*sx;
   upDy[y*W+x]=((liqDy[a]*(1-fx)+liqDy[b]*fx)*(1-fy)+(liqDy[c1]*(1-fx)+liqDy[d1]*fx)*fy)*sy;
  }
 }
 warpImageData(fSrc,fOut,upDx,upDy,W,H);
 fg.putImageData(fOut,0,0);
 addCanvasAsLayer(full,'Liquify Sculpt');
 $('pro-studio-dialog').close();
 showToast('Applied Liquify Sculpt layer!',1500);
});

/* ========== 3. Offline Magic Object Eraser (Multi-Pass Diffusion Inpainting) ========== */
const meCv=$('me-canvas');
let meW=0,meH=0,meBaseCv=null,meMask=null,meDown=false,meLast=null,meDoneCv=null;

function initMagicEraser(){
 if(!base||!meCv)return;
 meBaseCv=captureCanvas(900);
 meW=meBaseCv.width;meH=meBaseCv.height;
 meCv.width=meW;meCv.height=meH;
 meMask=new Uint8Array(meW*meH);
 meDoneCv=null;$('me-apply').disabled=true;
 $('me-status').textContent='Paint red over unwanted objects, blemishes, or text, then click Magic Erase.';
 drawMePreview();
}

function drawMePreview(){
 if(!meBaseCv||!meCv)return;
 const g=meCv.getContext('2d');
 g.clearRect(0,0,meW,meH);
 g.drawImage(meDoneCv||meBaseCv,0,0);
 const ov=g.getImageData(0,0,meW,meH),d=ov.data;
 for(let i=0;i<meMask.length;i++){
  if(meMask[i]){
   const o=i*4;
   d[o]=Math.min(255,d[o]*0.45+244*0.55);
   d[o+1]=d[o+1]*0.45+63*0.55;
   d[o+2]=d[o+2]*0.45+94*0.55;
  }
 }
 g.putImageData(ov,0,0);
}

function paintMeCircle(cx,cy){
 const rad=+$('me-size').value*(meW/900||1),r2=rad*rad;
 const x0=Math.max(1,Math.floor(cx-rad)),x1=Math.min(meW-2,Math.ceil(cx+rad));
 const y0=Math.max(1,Math.floor(cy-rad)),y1=Math.min(meH-2,Math.ceil(cy+rad));
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
  if((x-cx)**2+(y-cy)**2<=r2)meMask[y*meW+x]=1;
 }
}
$('me-size')?.addEventListener('input',e=>{e.target.nextElementSibling.value=e.target.value+' px'});
meCv?.addEventListener('pointerdown',e=>{
 if(!meBaseCv)return;
 meDown=true;meCv.setPointerCapture(e.pointerId);
 const r=meCv.getBoundingClientRect();
 const x=(e.clientX-r.left)*meW/r.width,y=(e.clientY-r.top)*meH/r.height;
 meLast=[x,y];paintMeCircle(x,y);drawMePreview();
});
meCv?.addEventListener('pointermove',e=>{
 if(!meDown||!meLast)return;
 const r=meCv.getBoundingClientRect();
 const x=(e.clientX-r.left)*meW/r.width,y=(e.clientY-r.top)*meH/r.height;
 const dist=Math.hypot(x-meLast[0],y-meLast[1]),steps=Math.max(1,Math.ceil(dist/4));
 for(let s=1;s<=steps;s++)paintMeCircle(meLast[0]+(x-meLast[0])*s/steps,meLast[1]+(y-meLast[1])*s/steps);
 meLast=[x,y];drawMePreview();
});
meCv?.addEventListener('pointerup',()=>{meDown=false;meLast=null});
$('me-clear')?.addEventListener('click',()=>{if(meMask){meMask.fill(0);drawMePreview()}});
$('me-reset')?.addEventListener('click',()=>initMagicEraser());

$('me-run')?.addEventListener('click',()=>{
 if(!meBaseCv||!meMask)return;
 const masked=[];
 for(let i=0;i<meMask.length;i++)if(meMask[i])masked.push(i);
 if(!masked.length){$('me-status').textContent='Paint a red mask over the area you want erased first.';return}
 const srcCv=meDoneCv||meBaseCv;
 const outCv=bc(meW,meH),og=outCv.getContext('2d',{willReadFrequently:true});
 og.drawImage(srcCv,0,0);
 const im=og.getImageData(0,0,meW,meH),d=im.data;

 // Stage 1: Onion-peel boundary fill from outside inward (Telea-style distance order)
 const known=new Uint8Array(meW*meH);
 for(let i=0;i<known.length;i++)known[i]=meMask[i]?0:1;
 const rF=new Float32Array(meW*meH),gF=new Float32Array(meW*meH),bF=new Float32Array(meW*meH);
 for(let i=0;i<known.length;i++){const o=i*4;rF[i]=d[o];gF[i]=d[o+1];bF[i]=d[o+2]}

 let remaining=masked.slice();
 const nbrs=[-meW-1,-meW,-meW+1,-1,1,meW-1,meW,meW+1];
 const wts=[0.7,1,0.7,1,1,0.7,1,0.7];
 let guard=0;
 while(remaining.length&&guard++<260){
  const next=[],filled=[];
  for(const idx of remaining){
   let sr=0,sg=0,sb=0,sw=0;
   for(let k=0;k<8;k++){
    const ni=idx+nbrs[k];
    if(ni>=0&&ni<known.length&&known[ni]){sr+=rF[ni]*wts[k];sg+=gF[ni]*wts[k];sb+=bF[ni]*wts[k];sw+=wts[k]}
   }
   if(sw>0){rF[idx]=sr/sw;gF[idx]=sg/sw;bF[idx]=sb/sw;filled.push(idx)}
   else next.push(idx);
  }
  for(const idx of filled)known[idx]=1;
  if(!filled.length)break;
  remaining=next;
 }

 // Stage 2: Harmonic Gauss-Seidel relaxation for smooth gradient continuity
 const iters=$('me-quality').value==='high'?55:24;
 for(let it=0;it<iters;it++){
  for(const idx of masked){
   rF[idx]=0.25*(rF[idx-1]+rF[idx+1]+rF[idx-meW]+rF[idx+meW]);
   gF[idx]=0.25*(gF[idx-1]+gF[idx+1]+gF[idx-meW]+gF[idx+meW]);
   bF[idx]=0.25*(bF[idx-1]+bF[idx+1]+bF[idx-meW]+bF[idx+meW]);
  }
 }
 // Subtle natural film grain matching so fill blends organically
 for(const idx of masked){
  const n=(Math.random()-0.5)*4.5,o=idx*4;
  d[o]=clamp(rF[idx]+n,0,255);d[o+1]=clamp(gF[idx]+n,0,255);d[o+2]=clamp(bF[idx]+n,0,255);d[o+3]=255;
 }
 og.putImageData(im,0,0);
 meDoneCv=outCv;meMask.fill(0);$('me-apply').disabled=false;
 drawMePreview();
 $('me-status').textContent='Erased cleanly! Paint more spots to refine or click Apply to canvas.';
});

$('me-apply')?.addEventListener('click',()=>{
 if(!meDoneCv||!base)return;
 const full=bc(W,H),fg=full.getContext('2d');
 fg.imageSmoothingEnabled=true;fg.imageSmoothingQuality='high';
 fg.drawImage(meDoneCv,0,0,W,H);
 addCanvasAsLayer(full,'Magic Erase');
 $('pro-studio-dialog').close();
 showToast('Applied Magic Erase layer!',1500);
});

/* ========== 4. Dominant Color Palette Extractor & Saved Custom Looks ========== */
let extractedPalette=[];
function rgbHex(r,g,b){return '#'+[r,g,b].map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('')}

$('pal-extract')?.addEventListener('click',()=>{
 if(!base){showToast('Open an image first',1400);return}
 const sm=captureCanvas(120);
 const d=sm.getContext('2d',{willReadFrequently:true}).getImageData(0,0,sm.width,sm.height).data;
 const pts=[];
 for(let i=0;i<d.length;i+=12){if(d[i+3]>128)pts.push([d[i],d[i+1],d[i+2]])}
 if(!pts.length)return;
 const K=6;
 // K-Means++ deterministic-ish farthest initialization
 const centers=[pts[Math.floor(pts.length*0.2)]];
 while(centers.length<K){
  let best=pts[0],bestD=-1;
  for(let i=0;i<pts.length;i+=3){
   let md=Infinity;
   for(const c0 of centers){const dd=(pts[i][0]-c0[0])**2+(pts[i][1]-c0[1])**2+(pts[i][2]-c0[2])**2;if(dd<md)md=dd}
   if(md>bestD){bestD=md;best=pts[i]}
  }
  centers.push(best.slice());
 }
 for(let it=0;it<10;it++){
  const sums=Array.from({length:K},()=>[0,0,0,0]);
  for(const p of pts){
   let bi=0,bd=Infinity;
   for(let k=0;k<K;k++){const dd=(p[0]-centers[k][0])**2+(p[1]-centers[k][1])**2+(p[2]-centers[k][2])**2;if(dd<bd){bd=dd;bi=k}}
   sums[bi][0]+=p[0];sums[bi][1]+=p[1];sums[bi][2]+=p[2];sums[bi][3]++;
  }
  for(let k=0;k<K;k++)if(sums[k][3])centers[k]=[sums[k][0]/sums[k][3],sums[k][1]/sums[k][3],sums[k][2]/sums[k][3]];
 }
 centers.sort((a,b)=>(a[0]*0.299+a[1]*0.587+a[2]*0.114)-(b[0]*0.299+b[1]*0.587+b[2]*0.114));
 extractedPalette=centers.map(c0=>rgbHex(c0[0],c0[1],c0[2]));
 $('pal-swatches').innerHTML=extractedPalette.map(hex=>`<button type="button" class="pal-swatch" data-hex="${hex}" title="Click to copy ${hex}"><i style="background:${hex}"></i><small>${hex}</small></button>`).join('');
 $('pal-to-grad').disabled=false;$('pal-card').disabled=false;
 showToast('Extracted 6 dominant colors!',1300);
});

$('pal-swatches')?.addEventListener('click',e=>{
 const b=e.target.closest('[data-hex]');if(!b)return;
 navigator.clipboard?.writeText(b.dataset.hex);
 showToast('Copied '+b.dataset.hex,1000);
});

$('pal-to-grad')?.addEventListener('click',()=>{
 if(!extractedPalette.length)return;
 if(typeof setCustomGradientStops==='function')setCustomGradientStops(extractedPalette);
 else if(typeof customStops!=='undefined'&&Array.isArray(customStops)){
  customStops.length=0;
  extractedPalette.forEach((col,i)=>customStops.push({c:col,p:Math.round(i/(extractedPalette.length-1)*100)}));
  if($('gradient-enabled')){$('gradient-enabled').checked=true;$('gradient-enabled').dispatchEvent(new Event('change'))}
  draw();
 }
 $('pro-studio-dialog').close();
 showToast('Loaded extracted palette into Gradient Map!',1500);
});

$('pal-card')?.addEventListener('click',()=>{
 if(!base||!extractedPalette.length)return;
 const barH=Math.max(88,Math.round(H*0.14)),pad=Math.round(barH*0.14);
 const cv=bc(W,H),g=cv.getContext('2d');
 g.fillStyle='rgba(8,14,28,0.92)';
 g.fillRect(0,H-barH,W,barH);
 const n=extractedPalette.length,gap=Math.round(pad*0.7);
 const swW=(W-pad*2-gap*(n-1))/n,swH=barH-pad*2-20;
 g.font=`600 ${Math.max(11,Math.round(barH*0.13))}px "Space Mono",monospace`;
 g.textAlign='center';
 extractedPalette.forEach((hex,i)=>{
  const x=pad+i*(swW+gap),y=H-barH+pad;
  g.fillStyle=hex;g.fillRect(x,y,swW,Math.max(18,swH));
  g.fillStyle='#f8fafc';g.fillText(hex.toUpperCase(),x+swW/2,H-pad*0.75);
 });
 addCanvasAsLayer(cv,'Color Palette Strip');
 $('pro-studio-dialog').close();
 showToast('Added Color Palette Strip layer!',1400);
});

/* Saved Custom Looks Manager */
const LOOKS_KEY='totone_custom_looks_v1';
const LOOK_SLIDERS=['lr-temp','lr-tint','lr-exp','lr-con','lr-hi','lr-sh','lr-wh','lr-bl','lr-tex','lr-cla','lr-deh','lr-vib','lr-sat','str','b','ct','sat','warm','fade','vig','gr'];
function readLooks(){try{return JSON.parse(localStorage.getItem(LOOKS_KEY)||'[]')}catch{return[]}}
function writeLooks(arr){try{localStorage.setItem(LOOKS_KEY,JSON.stringify(arr))}catch{}}

function renderLooksList(){
 const list=$('mlook-list');if(!list)return;
 const looks=readLooks();
 if(!looks.length){list.innerHTML='<p class="note">No saved custom looks yet. Dial in a grade and save it above!</p>';return}
 list.innerHTML=looks.map((lk,i)=>`<div class="look-row"><span>${lk.name}</span><button type="button" data-la="${i}" class="pri">Apply</button><button type="button" data-ld="${i}">✕</button></div>`).join('');
}

$('mlook-save')?.addEventListener('click',()=>{
 const name=($('mlook-name').value||'').trim()||`Look ${readLooks().length+1}`;
 const vals={};
 LOOK_SLIDERS.forEach(id=>{const el=$(id);if(el)vals[id]=el.value});
 const looks=readLooks();looks.unshift({name,vals,savedAt:Date.now()});
 writeLooks(looks.slice(0,40));$('mlook-name').value='';
 renderLooksList();showToast('Saved look: '+name,1400);
});

$('mlook-list')?.addEventListener('click',e=>{
 const a=e.target.closest('[data-la]'),dBtn=e.target.closest('[data-ld]');
 const looks=readLooks();
 if(a){
  const lk=looks[+a.dataset.la];if(!lk)return;
  Object.entries(lk.vals||{}).forEach(([id,v])=>{
   const el=$(id);if(el){el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))}
  });
  showToast('Applied look: '+lk.name,1400);
 }else if(dBtn){
  looks.splice(+dBtn.dataset.ld,1);writeLooks(looks);renderLooksList();
 }
});
$('look-export')?.addEventListener('click',()=>{
 const blob=new Blob([JSON.stringify(readLooks(),null,2)],{type:'application/json'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='totone-looks.json';a.click();
 setTimeout(()=>URL.revokeObjectURL(a.href),1500);
});
$('look-import')?.addEventListener('click',()=>$('look-import-file').click());
$('look-import-file')?.addEventListener('change',async e=>{
 const f=e.target.files?.[0];e.target.value='';if(!f)return;
 try{
  const arr=JSON.parse(await f.text());
  if(!Array.isArray(arr))throw Error();
  writeLooks([...arr,...readLooks()].slice(0,60));renderLooksList();showToast(`Imported ${arr.length} look(s)!`,1400);
 }catch{showToast('Invalid looks JSON',1600)}
});

/* ========== 5. Print-Ready PDF (jsPDF) & Batch Image Converter (JSZip) ========== */
$('pdf-margin')?.addEventListener('input',e=>{e.target.nextElementSibling.value=e.target.value+' mm'});
$('bz-qual')?.addEventListener('input',e=>{e.target.nextElementSibling.value=e.target.value+'%'});

$('pdf-export')?.addEventListener('click',async()=>{
 if(!base){showToast('Open an image first',1400);return}
 try{
  showToast('Loading jsPDF…',1200);
  await loadScriptOnce('https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js',()=>!!window.jspdf?.jsPDF);
  const {jsPDF}=window.jspdf;
  const cv=captureCanvas(0);
  const dataUrl=cv.toDataURL('image/jpeg',0.95);
  const mode=$('pdf-size').value,margin=+$('pdf-margin').value;
  let doc;
  if(mode==='fit'){
   const mmW=Math.max(40,cv.width*0.264583),mmH=Math.max(40,cv.height*0.264583);
   doc=new jsPDF({orientation:mmW>=mmH?'landscape':'portrait',unit:'mm',format:[mmW+margin*2,mmH+margin*2]});
   doc.addImage(dataUrl,'JPEG',margin,margin,mmW,mmH);
  }else{
   const orient=cv.width>=cv.height?'landscape':'portrait';
   const fmt=mode==='square'?[210,210]:mode;
   doc=new jsPDF({orientation:orient,unit:'mm',format:fmt});
   const pw=doc.internal.pageSize.getWidth()-margin*2,ph=doc.internal.pageSize.getHeight()-margin*2;
   const sc=Math.min(pw/cv.width,ph/cv.height),dw=cv.width*sc,dh=cv.height*sc;
   doc.addImage(dataUrl,'JPEG',margin+(pw-dw)/2,margin+(ph-dh)/2,dw,dh);
  }
  const pfx=(window.totoneSettings?.prefix||'totone-');
  doc.save(`${pfx}print.pdf`);
  showToast('Exported print-ready PDF!',1600);
 }catch(err){showToast('PDF export error: '+err.message,2400)}
});

$('bz-pick')?.addEventListener('click',()=>$('bz-files').click());
$('bz-files')?.addEventListener('change',async e=>{
 const files=[...(e.target.files||[])];e.target.value='';if(!files.length)return;
 const progWrap=$('bz-prog-wrap'),progBar=$('bz-prog-bar'),stat=$('bz-status');
 progWrap.hidden=false;progBar.style.width='4%';
 stat.textContent=`Loading JSZip to convert ${files.length} image(s)…`;
 try{
  await loadScriptOnce('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js',()=>!!window.JSZip);
  const zip=new window.JSZip();
  const fmt=$('bz-fmt').value,qual=+$('bz-qual').value/100,maxW=+$('bz-maxw').value||0;
  const pfx=$('bz-prefix').value||'',ext=fmt==='image/webp'?'webp':fmt==='image/jpeg'?'jpg':'png';
  let inBytes=0,outBytes=0;
  for(let i=0;i<files.length;i++){
   const f=files[i];inBytes+=f.size;
   stat.textContent=`Converting ${i+1}/${files.length}: ${f.name}`;
   progBar.style.width=Math.round(((i+0.5)/files.length)*90)+'%';
   const bmp=await createImageBitmap(f);
   const sc=maxW&&bmp.width>maxW?maxW/bmp.width:1;
   const w=Math.max(1,Math.round(bmp.width*sc)),h=Math.max(1,Math.round(bmp.height*sc));
   const cv=bc(w,h),g=cv.getContext('2d');
   if(fmt==='image/jpeg'){g.fillStyle='#ffffff';g.fillRect(0,0,w,h)}
   g.drawImage(bmp,0,0,w,h);bmp.close?.();
   const blob=await new Promise(res=>cv.toBlob(res,fmt,qual));
   outBytes+=blob.size;
   const stem=f.name.replace(/\.[^.]+$/,'');
   zip.file(`${pfx}${stem}.${ext}`,blob);
  }
  stat.textContent='Packing .ZIP archive…';progBar.style.width='96%';
  const zipBlob=await zip.generateAsync({type:'blob'});
  const a=document.createElement('a');a.href=URL.createObjectURL(zipBlob);a.download=`${pfx||'totone-'}batch-${files.length}.zip`;a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),3000);
  progBar.style.width='100%';
  const savedPct=inBytes?Math.round((1-outBytes/inBytes)*100):0;
  stat.textContent=`Done! Converted ${files.length} images (${(inBytes/1024).toFixed(0)} KB → ${(outBytes/1024).toFixed(0)} KB, ${savedPct>=0?savedPct+'% smaller':'resized'}).`;
 }catch(err){stat.textContent='Batch convert error: '+err.message}
});

/* ========== 6. Before / After Comparison PNG Generator ========== */
function renderBeforeAfter(){
 const out=$('ba-canvas');if(!out||!base)return;
 const afterCv=captureCanvas(0);
 const beforeCv=bc(W,H);
 beforeCv.getContext('2d').putImageData(base,0,0);
 const layout=$('ba-layout').value,showLabels=$('ba-labels').checked;
 const gap=Math.max(6,Math.round(Math.min(W,H)*0.012));
 const g=out.getContext('2d');
 if(layout==='side'){
  out.width=W*2+gap;out.height=H;
  g.fillStyle='#050c1f';g.fillRect(0,0,out.width,out.height);
  g.drawImage(beforeCv,0,0);g.drawImage(afterCv,W+gap,0);
 }else if(layout==='stack'){
  out.width=W;out.height=H*2+gap;
  g.fillStyle='#050c1f';g.fillRect(0,0,out.width,out.height);
  g.drawImage(beforeCv,0,0);g.drawImage(afterCv,0,H+gap);
 }else if(layout==='split'){
  out.width=W;out.height=H;
  g.drawImage(beforeCv,0,0);
  g.save();g.beginPath();g.rect(W/2,0,W/2,H);g.clip();g.drawImage(afterCv,0,0);g.restore();
  g.fillStyle='#ffffff';g.fillRect(W/2-2,0,4,H);
 }else{
  out.width=W;out.height=H;
  g.drawImage(beforeCv,0,0);
  g.save();g.beginPath();g.moveTo(W*0.62,0);g.lineTo(W,0);g.lineTo(W,H);g.lineTo(W*0.38,H);g.closePath();g.clip();g.drawImage(afterCv,0,0);g.restore();
  g.strokeStyle='#ffffff';g.lineWidth=4;g.beginPath();g.moveTo(W*0.62,0);g.lineTo(W*0.38,H);g.stroke();
 }
 if(showLabels){
  const fs=Math.max(16,Math.round(Math.min(W,H)*0.036)),padX=fs*0.65,padY=fs*0.32;
  const badge=(txt,x,y,alignRight=false)=>{
   g.font=`800 ${fs}px Archivo,sans-serif`;
   const tw=g.measureText(txt).width+padX*2,th=fs+padY*2;
   const bx=alignRight?x-tw:x;
   g.fillStyle='rgba(5,12,31,0.78)';g.fillRect(bx,y,tw,th);
   g.strokeStyle='rgba(255,255,255,0.45)';g.lineWidth=1.5;g.strokeRect(bx,y,tw,th);
   g.fillStyle='#ffffff';g.textBaseline='middle';g.fillText(txt,bx+padX,y+th/2+1);
  };
  const m=Math.max(12,Math.round(fs*0.75));
  badge('BEFORE',m,m,false);
  if(layout==='stack')badge('AFTER',m,H+gap+m,false);
  else badge('AFTER',out.width-m,m,true);
 }
}
$('ba-layout')?.addEventListener('change',renderBeforeAfter);
$('ba-labels')?.addEventListener('change',renderBeforeAfter);
$('ba-render')?.addEventListener('click',renderBeforeAfter);
$('ba-download')?.addEventListener('click',()=>{
 renderBeforeAfter();
 const a=document.createElement('a');a.href=$('ba-canvas').toDataURL('image/png');
 a.download=(window.totoneSettings?.prefix||'totone-')+'before-after.png';a.click();
 showToast('Downloaded Before / After PNG!',1400);
});
$('ba-copy')?.addEventListener('click',async()=>{
 renderBeforeAfter();
 try{
  const blob=await new Promise(res=>$('ba-canvas').toBlob(res,'image/png'));
  await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);
  showToast('Copied Before / After PNG!',1400);
 }catch{showToast('Clipboard copy failed — use Download PNG',1600)}
});

})();
