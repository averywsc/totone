/* Totone Power Tools — Pro Export Studio (Format + Custom Size + Exact Target MB/KB), Single-Row Header More Menu, Expanded Left Dock, Die-Cut Sticker & Layer FX, Privacy Redact, Auto-Trim, ASCII Art, Seamless Tile, IG Carousel Slicer & Extra Broad Graphics */
(function(){
const clamp=(v,lo=0,hi=1)=>v<lo?lo:v>hi?hi:v;
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
function addLayerFromCanvas(cv,name){
 const d=cv.getContext('2d',{willReadFrequently:true}).getImageData(0,0,cv.width,cv.height);
 pushU(mkSnap('p'));
 const l={cv,d,o:null,lk:false,sh:null,ol:null,x:W/2,y:H/2,s:1,r:0,op:1,bm:'source-over',fl:false,vis:true,cl:0,ct:0,cr:0,cb:0,name};
 layers.push(l);active=l;refreshLayers();draw();
 return l;
}
function fmtBytes(b){
 if(!Number.isFinite(b)||b<=0)return '—';
 if(b<1024)return b+' B';
 if(b<1048576)return (b/1024).toFixed(1)+' KB';
 return (b/1048576).toFixed(2)+' MB';
}

/* ========== 1. Header More Menu & Expanded Left Tool Dock ========== */
const moreBtn=$('hdr-more-btn'),moreMenu=$('hdr-more-menu');
if(moreBtn&&moreMenu){
 moreBtn.onclick=e=>{e.stopPropagation();moreMenu.hidden=!moreMenu.hidden};
 moreMenu.onclick=()=>{moreMenu.hidden=true};
 document.addEventListener('click',e=>{if(!moreMenu.hidden&&!e.target.closest('.hdr-more-wrap'))moreMenu.hidden=true});
 window.addEventListener('keydown',e=>{if(e.key==='Escape')moreMenu.hidden=true});
}

$('tool-dock')?.addEventListener('click',e=>{
 const b=e.target.closest('[data-dock]');if(!b)return;
 const k=b.dataset.dock;
 if(['layerfx','redact','eraser','extras','palette','ba'].includes(k)){
  e.stopImmediatePropagation();window.openProStudioTab?.(k);
 }else if(k==='trim'){
  e.stopImmediatePropagation();runSmartAutoTrim();
 }else if(k==='hist'){
  e.stopImmediatePropagation();
  const cb=$('set-hist');if(cb){cb.checked=!cb.checked;cb.dispatchEvent(new Event('change'))}
  showToast(cb?.checked?'Live RGB Histogram ON':'Live RGB Histogram OFF',1100);
 }else if(k==='grid'){
  e.stopImmediatePropagation();$('grid-toggle')?.click();
 }else if(k==='border'){
  e.stopImmediatePropagation();$('toolbar-border')?.click();
 }else if(k==='history'){
  e.stopImmediatePropagation();$('history-open')?.click();
 }
},true);

/* Hook pro-tabs for the 3 new Pro Studio tabs */
$('pro-tabs')?.addEventListener('click',e=>{
 const b=e.target.closest('[data-pt]');if(!b)return;
 const k=b.dataset.pt;
 if(k==='layerfx')renderLayerFxPreview();
 else if(k==='redact')initRedactStudio();
});

/* ========== 2. Pro Export Studio (Format + Custom Dimensions + Exact MB/KB Target) ========== */
const exw=$('exw'),exf=$('exf'),exs=$('exs'),exq=$('exq'),exqo=$('exqo');
const exCw=$('ex-cw'),exCh=$('ex-ch'),exLock=$('ex-lock'),exCustom=$('ex-custom-dims');
const exLimOn=$('ex-limit-on'),exLimVal=$('ex-limit-val'),exLimUnit=$('ex-limit-unit');
const exEst=$('ex-est-size'),exInfo=$('exinfo');
let estTimer=0,expBaseW=1080,expBaseH=1080;

function getExportSourceDims(){
 const wt=exw?.value||'all';
 if(wt==='print')return [W*2,H*2];
 if(wt==='layer'&&active)return [Math.max(1,Math.round(active.cv.width*(1-active.cl-active.cr))),Math.max(1,Math.round(active.cv.height*(1-active.ct-active.cb)))];
 if(wt==='sel'&&sel&&typeof selBox==='function'){const bb=selBox();if(bb)return [bb[2],bb[3]]}
 return [W||1080,H||1080];
}

function getTargetExportDims(){
 const [sw,sh]=getExportSourceDims();
 const sv=exs?.value||'1';
 if(sv==='custom')return [Math.max(16,parseInt(exCw.value,10)||sw),Math.max(16,parseInt(exCh.value,10)||sh)];
 const n=parseFloat(sv)||1;
 if(n<0){const m=Math.abs(n),sc=Math.min(1,m/Math.max(sw,sh));return [Math.max(1,Math.round(sw*sc)),Math.max(1,Math.round(sh*sc))]}
 return [Math.max(1,Math.round(sw*n)),Math.max(1,Math.round(sh*n))];
}

function getTargetMaxBytes(){
 if(!exLimOn?.checked)return 0;
 const v=parseFloat(exLimVal?.value)||0;
 if(v<=0)return 0;
 return Math.round(v*(exLimUnit?.value==='KB'?1024:1048576));
}

function buildProExportCanvas(targetW,targetH){
 const wt=exw?.value||'all',fmt=exf?.value||'png';
 let src;
 if(wt==='print'&&typeof buildPrint==='function'){
  src=buildPrint(1,fmt==='jpg'?'jpg':'png');
 }else if(wt==='layer'&&active){
  const l=active,sw=Math.max(1,Math.round(l.cv.width*(1-l.cl-l.cr))),sh=Math.max(1,Math.round(l.cv.height*(1-l.ct-l.cb)));
  src=bc(sw,sh);const sg=src.getContext('2d');sg.globalAlpha=l.op;
  if(l.fl){sg.translate(sw,0);sg.scale(-1,1)}
  sg.drawImage(visibleLayer(l).cv,Math.round(l.cl*l.cv.width),Math.round(l.ct*l.cv.height),sw,sh,0,0,sw,sh);
 }else{
  src=captureCanvas(0);
  if(wt==='sel'&&sel&&typeof selBox==='function'){
   const bb=selBox();
   if(bb){
    const [sx,sy,sw,sh]=bb,cutCv=bc(sw,sh),cg=cutCv.getContext('2d');
    cg.drawImage(src,sx,sy,sw,sh,0,0,sw,sh);
    const im=cg.getImageData(0,0,sw,sh);
    for(let y=0;y<sh;y++)for(let x=0;x<sw;x++)im.data[(y*sw+x)*4+3]*=sel[(sy+y)*W+sx+x]/255;
    cg.putImageData(im,0,0);src=cutCv;
   }
  }
 }
 const outW=fmt==='ico'?256:targetW,outH=fmt==='ico'?256:targetH;
 const out=bc(Math.max(1,outW),Math.max(1,outH)),g=out.getContext('2d');
 g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
 if(fmt==='jpg'){g.fillStyle='#ffffff';g.fillRect(0,0,out.width,out.height)}
 g.drawImage(src,0,0,out.width,out.height);
 return out;
}

function makeIcoFromPngBytes(pngBytes,size=256){
 const buf=new ArrayBuffer(22+pngBytes.length);
 const dv=new DataView(buf),u8=new Uint8Array(buf);
 dv.setUint16(0,0,true);dv.setUint16(2,1,true);dv.setUint16(4,1,true);
 u8[6]=size>=256?0:size;u8[7]=size>=256?0:size;u8[8]=0;u8[9]=0;
 dv.setUint16(10,1,true);dv.setUint16(12,32,true);
 dv.setUint32(14,pngBytes.length,true);dv.setUint32(18,22,true);
 u8.set(pngBytes,22);
 return new Blob([buf],{type:'image/x-icon'});
}

async function encodeCanvasWithFormat(cv,fmt,qual){
 if(fmt==='svg'){
  const url=cv.toDataURL('image/png');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${cv.width}" height="${cv.height}" viewBox="0 0 ${cv.width} ${cv.height}"><image width="${cv.width}" height="${cv.height}" href="${url}"/></svg>`;
  return {blob:new Blob([svg],{type:'image/svg+xml'}),ext:'svg',usedFmt:'SVG'};
 }
 if(fmt==='ico'){
  const pngBlob=await new Promise(r=>cv.toBlob(r,'image/png'));
  const bytes=new Uint8Array(await pngBlob.arrayBuffer());
  return {blob:makeIcoFromPngBytes(bytes,cv.width),ext:'ico',usedFmt:'ICO'};
 }
 if(fmt==='pdf'){
  await loadScriptOnce('https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js',()=>!!window.jspdf?.jsPDF);
  const {jsPDF}=window.jspdf;
  const mmW=Math.max(40,cv.width*0.264583),mmH=Math.max(40,cv.height*0.264583);
  const doc=new jsPDF({orientation:mmW>=mmH?'landscape':'portrait',unit:'mm',format:[mmW,mmH]});
  doc.addImage(cv.toDataURL('image/jpeg',qual),'JPEG',0,0,mmW,mmH);
  return {blob:doc.output('blob'),ext:'pdf',usedFmt:'PDF'};
 }
 const mime=fmt==='jpg'?'image/jpeg':fmt==='webp'?'image/webp':fmt==='avif'?'image/avif':'image/png';
 let blob=await new Promise(r=>cv.toBlob(r,mime,qual));
 if(fmt==='avif'&&(!blob||blob.type!=='image/avif')){
  blob=await new Promise(r=>cv.toBlob(r,'image/webp',qual));
  return {blob,ext:'webp',usedFmt:'WebP (AVIF fallback)'};
 }
 return {blob,ext:fmt,usedFmt:fmt.toUpperCase()};
}

async function encodeToTargetSize(baseCv,fmt,startQual,maxBytes){
 let curCv=baseCv,qual=startQual;
 let res=await encodeCanvasWithFormat(curCv,fmt,qual);
 if(!maxBytes||!res.blob||res.blob.size<=maxBytes)return {...res,w:curCv.width,h:curCv.height,q:qual};

 const isLossy=['jpg','webp','avif','pdf'].includes(fmt);
 if(isLossy){
  let lo=0.08,hi=qual,best=null;
  for(let it=0;it<7;it++){
   const mid=(lo+hi)/2;
   const trial=await encodeCanvasWithFormat(curCv,fmt,mid);
   if(trial.blob&&trial.blob.size<=maxBytes){best={...trial,q:mid};lo=mid}
   else hi=mid;
  }
  if(best)return {...best,w:curCv.width,h:curCv.height};
  qual=0.18;
 }
 // Progressive smooth downscale until guaranteed <= maxBytes
 for(let pass=0;pass<12;pass++){
  const ratio=Math.sqrt(maxBytes/Math.max(1,res.blob.size))*0.92;
  const step=clamp(ratio,0.55,0.88);
  const nw=Math.max(32,Math.round(curCv.width*step)),nh=Math.max(32,Math.round(curCv.height*step));
  const nextCv=bc(nw,nh),ng=nextCv.getContext('2d');
  ng.imageSmoothingEnabled=true;ng.imageSmoothingQuality='high';
  ng.drawImage(baseCv,0,0,nw,nh);
  curCv=nextCv;
  res=await encodeCanvasWithFormat(curCv,fmt,isLossy?Math.max(0.55,startQual*0.8):1);
  if(res.blob&&res.blob.size<=maxBytes)break;
 }
 return {...res,w:curCv.width,h:curCv.height,q:qual};
}

function syncProExportUI(){
 if(!base||!exf||!exs)return;
 const [sw,sh]=getExportSourceDims();
 expBaseW=sw;expBaseH=sh;
 const isCustom=exs.value==='custom';
 if(exCustom)exCustom.hidden=!isCustom;
 if(!isCustom&&exCw&&exCh){const [tw,th]=getTargetExportDims();exCw.value=tw;exCh.value=th}
 const fmt=exf.value;
 exq.disabled=['png','ico','svg'].includes(fmt);
 exqo.textContent=exq.value+'%';
 const [tw,th]=getTargetExportDims();
 const maxB=getTargetMaxBytes();
 exInfo.textContent=`${fmt==='ico'?'256 × 256':tw+' × '+th} px · ${fmt.toUpperCase()}${maxB?' · Cap '+fmtBytes(maxB):''}`;
 clearTimeout(estTimer);
 if(exEst){exEst.textContent='Estimating…';exEst.className='exp-est-pill'}
 estTimer=setTimeout(async()=>{
  if($('exp')?.hidden||!base)return;
  try{
   const [w,h]=getTargetExportDims();
   const cv=buildProExportCanvas(w,h);
   const r=await encodeToTargetSize(cv,fmt,+exq.value/100,maxB);
   if(!exEst)return;
   const under=!maxB||r.blob.size<=maxB;
   exEst.textContent=`~${fmtBytes(r.blob.size)}${r.w!==w?` (${r.w}×${r.h})`:''}${maxB?(under?' ✓':' !'):''}`;
   exEst.className='exp-est-pill '+(under?'ok':'warn');
  }catch{if(exEst)exEst.textContent='Ready'}
 },220);
}

exCw?.addEventListener('input',()=>{
 if(exLock?.checked&&expBaseW){exCh.value=Math.max(16,Math.round((+exCw.value||16)*expBaseH/expBaseW))}
 syncProExportUI();
});
exCh?.addEventListener('input',()=>{
 if(exLock?.checked&&expBaseH){exCw.value=Math.max(16,Math.round((+exCh.value||16)*expBaseW/expBaseH))}
 syncProExportUI();
});
[exw,exf,exs,exq,exLimOn,exLimVal,exLimUnit].forEach(el=>el?.addEventListener('input',syncProExportUI));
[exw,exf,exs,exLimOn,exLimUnit].forEach(el=>el?.addEventListener('change',syncProExportUI));

$('ex-limit-presets')?.addEventListener('click',e=>{
 const b=e.target.closest('[data-lim]');if(!b)return;
 const v=b.dataset.lim;
 if(v==='0'){exLimOn.checked=false}
 else if(v.endsWith('KB')){exLimOn.checked=true;exLimVal.value=v.replace('KB','');exLimUnit.value='KB'}
 else{exLimOn.checked=true;exLimVal.value=v.replace('MB','');exLimUnit.value='MB'}
 syncProExportUI();
});

// Override openExp & #exgo cleanly so ALL new formats, custom sizes & MB targets work!
const origOpenExp=typeof openExp==='function'?openExp:null;
if(origOpenExp){
 openExp=function(){
  origOpenExp();
  const pfx=(window.totoneSettings?.prefix||'totone-').replace(/-+$/,'');
  if($('exn')&&$('exn').value==='totone'&&pfx)$('exn').value=pfx;
  syncProExportUI();
 };
 $('export')?.addEventListener('click',()=>setTimeout(syncProExportUI,20));
}

const exgoBtn=$('exgo');
if(exgoBtn){
 const clone=exgoBtn.cloneNode(true);
 exgoBtn.replaceWith(clone);
 clone.onclick=async()=>{
  if(!base)return;
  const msg=t=>{$('exmsg').textContent=t};
  msg('Encoding…');
  try{
   const fmt=exf.value,[tw,th]=getTargetExportDims(),maxB=getTargetMaxBytes();
   const cv=buildProExportCanvas(tw,th);
   const res=await encodeToTargetSize(cv,fmt,+exq.value/100,maxB);
   const stem=($('exn').value||'totone').replace(/[^\w.\- ]+/g,'_').trim()||'totone';
   const suffix=exw.value==='layer'?'-layer':exw.value==='sel'?'-cutout':exw.value==='print'?'-poster':'';
   const fileName=`${stem}${suffix}.${res.ext}`;
   const url=URL.createObjectURL(res.blob);
   const a=document.createElement('a');a.href=url;a.download=fileName;a.click();
   setTimeout(()=>URL.revokeObjectURL(url),4000);
   msg(`Saved ${fileName} (${res.w}×${res.h} · ${fmtBytes(res.blob.size)}${res.q&&res.q<0.99?` · Q${Math.round(res.q*100)}%`:''})`);
   showToast(`Exported ${fileName} (${fmtBytes(res.blob.size)})`,2200);
  }catch(err){msg('Export error: '+err.message)}
 };
}

/* ========== 3. Smart Auto-Trim Transparent Borders ========== */
function runSmartAutoTrim(){
 if(!base){showToast('Open an image first',1400);return}
 if(active&&active.cv){
  const cv=active.cv,w=cv.width,h=cv.height;
  const d=cv.getContext('2d',{willReadFrequently:true}).getImageData(0,0,w,h).data;
  let minX=w,minY=h,maxX=-1,maxY=-1;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   if(d[(y*w+x)*4+3]>10){if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y}
  }
  if(maxX<minX){showToast('Layer is completely transparent',1500);return}
  const nw=maxX-minX+1,nh=maxY-minY+1;
  if(nw===w&&nh===h){showToast('Layer is already tightly trimmed!',1300);return}
  const out=bc(nw,nh);out.getContext('2d').drawImage(cv,minX,minY,nw,nh,0,0,nw,nh);
  pushU(mkSnap('p'));
  active.cv=out;active.d=out.getContext('2d').getImageData(0,0,nw,nh);
  active.cl=active.ct=active.cr=active.cb=0;
  refreshLayers();draw();
  showToast(`Trimmed layer to ${nw} × ${nh} px!`,1500);
 }else{
  showToast('Select a cutout or transparent layer to trim',1600);
 }
}
window.runSmartAutoTrim=runSmartAutoTrim;

/* ========== 4. Layer Styles: Die-Cut Sticker Outline, Drop Shadow & Neon Glow ========== */
function renderStyledCanvas(srcCv){
 const outline=+$('lfx-outline').value,ocol=$('lfx-ocol').value;
 const sblur=+$('lfx-sblur').value,scol=$('lfx-scol').value,sy=+$('lfx-sy').value;
 const glow=+$('lfx-glow').value,gcol=$('lfx-gcol').value;
 const pad=Math.ceil(outline+Math.max(sblur+Math.abs(sy),glow)*1.6+12);
 const w=srcCv.width+pad*2,h=srcCv.height+pad*2;
 const out=bc(w,h),g=out.getContext('2d');

 // Build silhouette canvas tinted with outline color
 let sil=null;
 if(outline>0){
  sil=bc(srcCv.width,srcCv.height);
  const sg=sil.getContext('2d');
  sg.drawImage(srcCv,0,0);
  sg.globalCompositeOperation='source-in';
  sg.fillStyle=ocol;sg.fillRect(0,0,sil.width,sil.height);
 }
 // 1. Outer Neon Glow
 if(glow>0){
  g.save();g.shadowColor=gcol;g.shadowBlur=glow*1.4;
  for(let k=0;k<2;k++)g.drawImage(srcCv,pad,pad);
  g.restore();
 }
 // 2. Drop Shadow
 if(sblur>0){
  g.save();g.shadowColor=scol;g.shadowBlur=sblur;g.shadowOffsetY=sy;
  g.drawImage(sil||srcCv,pad,pad);
  g.restore();
 }
 // 3. Die-Cut Sticker Outline (32-angle radial stamp for crisp smooth stroke)
 if(outline>0&&sil){
  const steps=Math.max(16,Math.min(48,Math.round(outline*2.4)));
  for(let i=0;i<steps;i++){
   const a=i/steps*Math.PI*2;
   g.drawImage(sil,pad+Math.cos(a)*outline,pad+Math.sin(a)*outline);
  }
 }
 // 4. Crisp original layer on top
 g.drawImage(srcCv,pad,pad);
 return out;
}

function getLayerFxSource(){
 if(active&&active.cv)return active.cv;
 if(base)return captureCanvas(800);
 return null;
}

function renderLayerFxPreview(){
 const src=getLayerFxSource(),cv=$('lfx-canvas');if(!src||!cv)return;
 const sc=Math.min(1,420/Math.max(src.width,src.height));
 const sm=bc(Math.max(1,Math.round(src.width*sc)),Math.max(1,Math.round(src.height*sc)));
 sm.getContext('2d').drawImage(src,0,0,sm.width,sm.height);
 const styled=renderStyledCanvas(sm);
 cv.width=styled.width;cv.height=styled.height;
 cv.getContext('2d').drawImage(styled,0,0);
}
['lfx-outline','lfx-sblur','lfx-sy','lfx-glow'].forEach(id=>{
 $(id)?.addEventListener('input',e=>{e.target.nextElementSibling.value=e.target.value+' px';renderLayerFxPreview()});
});
['lfx-ocol','lfx-scol','lfx-gcol'].forEach(id=>$(id)?.addEventListener('input',renderLayerFxPreview));

function setLfxVals(o,oc,sb,sy,gl,gc){
 $('lfx-outline').value=o;$('lfx-outline').nextElementSibling.value=o+' px';
 $('lfx-ocol').value=oc;$('lfx-sblur').value=sb;$('lfx-sblur').nextElementSibling.value=sb+' px';
 $('lfx-sy').value=sy;$('lfx-sy').nextElementSibling.value=sy+' px';
 $('lfx-glow').value=gl;$('lfx-glow').nextElementSibling.value=gl+' px';
 $('lfx-gcol').value=gc;renderLayerFxPreview();
}
$('lfx-preset-sticker')?.addEventListener('click',()=>setLfxVals(14,'#ffffff',18,10,0,'#38bdf8'));
$('lfx-preset-neon')?.addEventListener('click',()=>setLfxVals(3,'#38bdf8',0,0,28,'#38bdf8'));
$('lfx-preset-float')?.addEventListener('click',()=>setLfxVals(0,'#ffffff',32,20,0,'#38bdf8'));
$('lfx-apply')?.addEventListener('click',()=>{
 const src=getLayerFxSource();if(!src){showToast('Open an image or select a layer first',1400);return}
 const styled=renderStyledCanvas(src);
 if(active&&active.cv===src){
  pushU(mkSnap('p'));
  active.cv=styled;active.d=styled.getContext('2d').getImageData(0,0,styled.width,styled.height);
  refreshLayers();draw();
 }else{
  addLayerFromCanvas(styled,'Styled Cutout');
 }
 $('pro-studio-dialog').close();
 showToast('Applied Layer FX / Sticker Outline!',1500);
});

/* ========== 5. Privacy Redact Studio (Blur / Pixelate / Black Bar / Smart Fill) ========== */
const redCv=$('red-canvas');
let redMode='pixel',redBase=null,redW=0,redH=0,redBoxes=[],redDrag=null;

function initRedactStudio(){
 if(!base||!redCv)return;
 redBase=captureCanvas(960);
 redW=redBase.width;redH=redBase.height;
 redCv.width=redW;redCv.height=redH;
 redBoxes=[];redDrag=null;
 renderRedactCanvas(redCv,redBase,redBoxes,1);
}

function applySingleRedaction(g,srcCv,box,scale){
 const x=Math.max(0,Math.round(box.x*scale)),y=Math.max(0,Math.round(box.y*scale));
 const w=Math.max(2,Math.round(box.w*scale)),h=Math.max(2,Math.round(box.h*scale));
 const str=Math.max(4,Math.round(box.str*scale));
 if(box.mode==='bar'){
  g.fillStyle=box.col||'#000000';g.fillRect(x,y,w,h);
 }else if(box.mode==='pixel'){
  const pw=Math.max(1,Math.round(w/str)),ph=Math.max(1,Math.round(h/str));
  const tmp=bc(pw,ph),tg=tmp.getContext('2d');
  tg.drawImage(srcCv,x,y,w,h,0,0,pw,ph);
  g.save();g.imageSmoothingEnabled=false;g.drawImage(tmp,0,0,pw,ph,x,y,w,h);g.restore();
 }else if(box.mode==='blur'){
  g.save();g.beginPath();g.rect(x,y,w,h);g.clip();
  g.filter=`blur(${Math.max(4,Math.round(str*0.9))}px)`;
  g.drawImage(srcCv,0,0);g.restore();
 }else if(box.mode==='match'){
  const sg=srcCv.getContext('2d',{willReadFrequently:true});
  const sx=Math.max(0,x-3),sy=Math.max(0,y-3);
  const p=sg.getImageData(sx,sy,1,1).data;
  g.fillStyle=`rgb(${p[0]},${p[1]},${p[2]})`;g.fillRect(x,y,w,h);
 }
}

function renderRedactCanvas(targetCv,srcCv,boxes,scale,previewBox=null){
 const g=targetCv.getContext('2d');
 g.clearRect(0,0,targetCv.width,targetCv.height);
 g.drawImage(srcCv,0,0);
 for(const b of boxes)applySingleRedaction(g,srcCv,b,scale);
 if(previewBox){
  applySingleRedaction(g,srcCv,previewBox,scale);
  g.save();g.strokeStyle='#38bdf8';g.lineWidth=2;g.setLineDash([4,3]);
  g.strokeRect(previewBox.x,previewBox.y,previewBox.w,previewBox.h);g.restore();
 }
}

$('red-modes')?.addEventListener('click',e=>{
 const b=e.target.closest('[data-rm]');if(!b)return;
 redMode=b.dataset.rm;
 document.querySelectorAll('#red-modes button').forEach(x=>x.classList.toggle('on',x===b));
});
$('red-str')?.addEventListener('input',e=>{e.target.nextElementSibling.value=e.target.value});

function redPt(e){
 const r=redCv.getBoundingClientRect();
 return [(e.clientX-r.left)*redW/r.width,(e.clientY-r.top)*redH/r.height];
}
redCv?.addEventListener('pointerdown',e=>{
 if(!redBase)return;
 redCv.setPointerCapture(e.pointerId);
 const [x,y]=redPt(e);redDrag={x0:x,y0:y,x1:x,y1:y};
});
redCv?.addEventListener('pointermove',e=>{
 if(!redDrag)return;
 const [x,y]=redPt(e);redDrag.x1=x;redDrag.y1=y;
 const bx={x:Math.min(redDrag.x0,x),y:Math.min(redDrag.y0,y),w:Math.abs(x-redDrag.x0),h:Math.abs(y-redDrag.y0),mode:redMode,str:+$('red-str').value,col:$('red-col').value};
 renderRedactCanvas(redCv,redBase,redBoxes,1,bx);
});
redCv?.addEventListener('pointerup',()=>{
 if(!redDrag)return;
 const w=Math.abs(redDrag.x1-redDrag.x0),h=Math.abs(redDrag.y1-redDrag.y0);
 if(w>4&&h>4)redBoxes.push({x:Math.min(redDrag.x0,redDrag.x1),y:Math.min(redDrag.y0,redDrag.y1),w,h,mode:redMode,str:+$('red-str').value,col:$('red-col').value});
 redDrag=null;renderRedactCanvas(redCv,redBase,redBoxes,1);
});
$('red-undo')?.addEventListener('click',()=>{redBoxes.pop();if(redBase)renderRedactCanvas(redCv,redBase,redBoxes,1)});
$('red-clear')?.addEventListener('click',()=>{redBoxes=[];if(redBase)renderRedactCanvas(redCv,redBase,redBoxes,1)});
$('red-apply')?.addEventListener('click',()=>{
 if(!base||!redBoxes.length){showToast('Drag over an area to redact first',1400);return}
 const full=captureCanvas(0),out=bc(W,H);
 renderRedactCanvas(out,full,redBoxes,W/redW);
 addLayerFromCanvas(out,'Privacy Redaction');
 $('pro-studio-dialog').close();
 showToast(`Applied ${redBoxes.length} privacy redaction(s)!`,1500);
});

/* ========== 6. Creative Lab: ASCII Art, Seamless Tile & IG Carousel Slicer ========== */
$('asc-cols')?.addEventListener('input',e=>{e.target.nextElementSibling.value=e.target.value});

function generateAsciiData(){
 const cols=+$('asc-cols').value||88,style=$('asc-style').value;
 const rows=Math.max(12,Math.round(cols*(H/W)*0.55));
 const sm=bc(cols,rows),sg=sm.getContext('2d',{willReadFrequently:true});
 const full=captureCanvas(0);sg.drawImage(full,0,0,cols,rows);
 const d=sg.getImageData(0,0,cols,rows).data;
 const ramp=style==='blocks'?' ░▒▓█':' .:-=+*#%@';
 let text='';const cells=[];
 for(let y=0;y<rows;y++){
  let line='';
  for(let x=0;x<cols;x++){
   const i=(y*cols+x)*4,r=d[i],gr=d[i+1],b=d[i+2];
   const luma=(0.299*r+0.587*gr+0.114*b)/255;
   const ch=ramp[Math.min(ramp.length-1,Math.floor(luma*(ramp.length-0.01)))];
   line+=ch;cells.push({x,y,ch,r,g:gr,b,luma});
  }
  text+=line+'\n';
 }
 return {cols,rows,text,cells,style};
}

$('asc-run')?.addEventListener('click',()=>{
 if(!base){showToast('Open an image first',1400);return}
 const {cols,rows,cells,style}=generateAsciiData();
 const cv=bc(W,H),g=cv.getContext('2d');
 g.fillStyle='#050811';g.fillRect(0,0,W,H);
 const cw=W/cols,ch=H/rows;
 g.font=`700 ${Math.max(7,Math.ceil(ch*1.12))}px "Space Mono",ui-monospace,monospace`;
 g.textBaseline='top';
 for(const c0 of cells){
  if(c0.ch===' ')continue;
  g.fillStyle=style==='matrix'?`rgb(34,${Math.round(120+c0.luma*135)},72)`:style==='mono'?`rgb(${Math.round(c0.luma*255)},${Math.round(c0.luma*255)},${Math.round(c0.luma*255)})`:`rgb(${c0.r},${c0.g},${c0.b})`;
  g.fillText(c0.ch,c0.x*cw,c0.y*ch);
 }
 addLayerFromCanvas(cv,'ASCII Art');
 $('pro-studio-dialog').close();
 showToast('Added ASCII Art layer!',1500);
});
$('asc-copy')?.addEventListener('click',()=>{
 if(!base){showToast('Open an image first',1400);return}
 const {text}=generateAsciiData();
 navigator.clipboard?.writeText(text);
 showToast('Copied ASCII art text to clipboard!',1500);
});

$('tile-mirror')?.addEventListener('click',()=>{
 if(!base)return;
 const src=captureCanvas(0),cv=bc(W,H),g=cv.getContext('2d'),hw=W/2,hh=H/2;
 g.drawImage(src,0,0,hw,hh);
 g.save();g.translate(W,0);g.scale(-1,1);g.drawImage(src,0,0,hw,hh);g.restore();
 g.save();g.translate(0,H);g.scale(1,-1);g.drawImage(src,0,0,hw,hh);g.restore();
 g.save();g.translate(W,H);g.scale(-1,-1);g.drawImage(src,0,0,hw,hh);g.restore();
 addLayerFromCanvas(cv,'Seamless Mirror Tile');
 $('pro-studio-dialog').close();showToast('Created Seamless 2×2 Mirror Tile!',1500);
});
$('tile-offset')?.addEventListener('click',()=>{
 if(!base)return;
 const src=captureCanvas(0),cv=bc(W,H),g=cv.getContext('2d'),hw=Math.round(W/2),hh=Math.round(H/2);
 g.drawImage(src,hw,hh,W-hw,H-hh,0,0,W-hw,H-hh);
 g.drawImage(src,0,hh,hw,H-hh,W-hw,0,hw,H-hh);
 g.drawImage(src,hw,0,W-hw,hh,0,H-hh,W-hw,hh);
 g.drawImage(src,0,0,hw,hh,W-hw,H-hh,hw,hh);
 addLayerFromCanvas(cv,'Offset Half-Wrap');
 $('pro-studio-dialog').close();showToast('Applied Photoshop Offset Half-Wrap!',1500);
});

$('sl-export')?.addEventListener('click',async()=>{
 if(!base){showToast('Open an image first',1400);return}
 try{
  showToast('Slicing image into .ZIP…',1400);
  await loadScriptOnce('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js',()=>!!window.JSZip);
  const [cols,rows]=$('sl-grid').value.split('x').map(Number);
  const full=captureCanvas(0),tw=Math.floor(W/cols),th=Math.floor(H/rows);
  const zip=new window.JSZip();
  let n=1;
  for(let r=0;r<rows;r++)for(let col=0;col<cols;col++){
   const tile=bc(tw,th);tile.getContext('2d').drawImage(full,col*tw,r*th,tw,th,0,0,tw,th);
   const blob=await new Promise(res=>tile.toBlob(res,'image/png'));
   zip.file(`slide-${String(n++).padStart(2,'0')}.png`,blob);
  }
  const zb=await zip.generateAsync({type:'blob'});
  const a=document.createElement('a');a.href=URL.createObjectURL(zb);a.download=`totone-slices-${cols}x${rows}.zip`;a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),3000);
  showToast(`Downloaded ${cols*rows} slices in .ZIP!`,1800);
 }catch(err){showToast('Slicer error: '+err.message,2000)}
});

/* ========== 7. Extra Broad Graphics & Stickers (Polaroid, Tape, Burst, Film, Aura, Tag) ========== */
const EXTRA_GRAPHICS=[
 {id:'polaroid',name:'Polaroid Frame',sub:'Photo · Classic'},
 {id:'washi',name:'Tape Strip',sub:'Scrapbook · Texture'},
 {id:'burst',name:'Promo Burst',sub:'Sticker · Badge'},
 {id:'filmstrip',name:'35mm Film Strip',sub:'Analog · Border'},
 {id:'spec-tag',name:'Minimal Tag',sub:'Editorial · Label'},
 {id:'aura-blob',name:'Soft Aura Glow',sub:'Gradient · Ambient'}
];

function renderExtraGraphic(id,accent){
 if(id==='polaroid'){
  const w=520,h=620,cv=bc(w,h),g=cv.getContext('2d');
  g.fillStyle='#f8fafc';g.fillRect(0,0,w,h);
  g.clearRect(32,34,w-64,452);
  g.strokeStyle='rgba(0,0,0,0.12)';g.lineWidth=2;g.strokeRect(32,34,w-64,452);
  g.fillStyle='#334155';g.font='600 18px "Space Mono",monospace';g.textAlign='center';
  g.fillText('MEMORIES · 2026',w/2,556);
  return {cv,bm:'source-over',name:'Polaroid Frame'};
 }
 if(id==='washi'){
  const w=420,h=110,cv=bc(w,h),g=cv.getContext('2d');
  g.fillStyle=accent;g.globalAlpha=0.72;
  g.beginPath();g.moveTo(14,14);g.lineTo(w-14,10);
  for(let y=10;y<h-10;y+=14)g.lineTo(w-14+(y%28?10:0),y);
  g.lineTo(w-14,h-12);g.lineTo(14,h-14);
  for(let y=h-14;y>14;y-=14)g.lineTo(14-(y%28?10:0),y);
  g.closePath();g.fill();
  g.strokeStyle='rgba(255,255,255,0.28)';g.lineWidth=1.5;g.stroke();
  return {cv,bm:'source-over',name:'Tape Strip'};
 }
 if(id==='burst'){
  const s=420,cv=bc(s,s),g=cv.getContext('2d'),cx=s/2,cy=s/2,pts=22;
  g.beginPath();
  for(let i=0;i<pts*2;i++){
   const r=i%2?142:188,a=i/(pts*2)*Math.PI*2;
   const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;
   if(i)g.lineTo(x,y);else g.moveTo(x,y);
  }
  g.closePath();g.fillStyle=accent;g.fill();
  g.strokeStyle='#ffffff';g.lineWidth=8;g.stroke();
  g.fillStyle='#ffffff';g.font='800 44px Archivo,sans-serif';g.textAlign='center';g.textBaseline='middle';
  g.fillText('NEW!',cx,cy);
  return {cv,bm:'source-over',name:'Promo Burst'};
 }
 if(id==='filmstrip'){
  const w=860,h=140,cv=bc(w,h),g=cv.getContext('2d');
  g.fillStyle='#090b10';g.fillRect(0,0,w,h);
  g.clearRect(0,26,w,h-52);
  g.fillStyle='#e2e8f0';
  for(let x=14;x<w-18;x+=36){g.fillRect(x,6,18,13);g.fillRect(x,h-19,18,13)}
  return {cv,bm:'source-over',name:'35mm Film Strip'};
 }
 if(id==='spec-tag'){
  const w=440,h=110,cv=bc(w,h),g=cv.getContext('2d');
  g.fillStyle='rgba(8,14,28,0.88)';g.strokeStyle=accent;g.lineWidth=3;
  g.beginPath();g.roundRect(4,4,w-8,h-8,18);g.fill();g.stroke();
  g.fillStyle=accent;g.beginPath();g.arc(38,h/2,12,0,Math.PI*2);g.fill();
  g.fillStyle='#ffffff';g.font='700 22px "Space Mono",monospace';g.textBaseline='middle';
  g.fillText('EDITION // 01',70,h/2-12);
  g.fillStyle='#94a3b8';g.font='500 14px "Space Mono",monospace';
  g.fillText('TOTONE STUDIO ARCHIVE',70,h/2+16);
  return {cv,bm:'source-over',name:'Minimal Tag'};
 }
 // aura-blob
 const s=560,cv=bc(s,s),g=cv.getContext('2d');
 const gr=g.createRadialGradient(s/2,s/2,10,s/2,s/2,s/2);
 gr.addColorStop(0,accent);gr.addColorStop(0.45,accent+'88');gr.addColorStop(1,accent+'00');
 g.fillStyle=gr;g.fillRect(0,0,s,s);
 return {cv,bm:'screen',name:'Soft Aura Glow'};
}

const gGrid=$('y2k-grid');
if(gGrid){
 for(const item of EXTRA_GRAPHICS){
  const b=document.createElement('button');b.type='button';b.className='studio-card';
  b.innerHTML=`<span>${item.name}</span><small>${item.sub}</small>`;
  b.onclick=()=>{
   if(!base){showToast('Open an image or create a blank design first',1400);return}
   const col=$('y2k-col')?.value||'#38bdf8';
   const {cv,bm,name}=renderExtraGraphic(item.id,col);
   const l=addLayerFromCanvas(cv,name);
   l.bm=bm;l.s=Math.min(W*0.58/cv.width,H*0.58/cv.height);
   refreshLayers();draw();showToast('Added '+name,1200);
  };
  gGrid.prepend(b);
 }
}

if(Array.isArray(window.toolCommands)){
 window.toolCommands.push(
  ['Layer Styles: Die-Cut Sticker Outline, Shadow & Neon Glow','dialog','pro-layerfx','sticker outline die cut border shadow glow layer style'],
  ['Privacy Redact: Blur, Pixelate or Black-Bar Sensitive Info','dialog','pro-redact','redact censor blur pixelate hide privacy card email face'],
  ['ASCII & Matrix Art Converter','dialog','pro-extras','ascii matrix text art unicode blocks'],
  ['Seamless Texture Tile & Photoshop Offset Wrap','dialog','pro-extras','seamless tile pattern mirror offset wrap'],
  ['Instagram Carousel & 3×3 Grid Slicer (.ZIP)','dialog','pro-extras','slice split carousel instagram grid zip'],
  ['Auto-Trim Transparent Borders','dialog','trim-now','trim crop transparent margin autocrop']
 );
}
const prevJumpPower=jumpTool;
jumpTool=function(tabName,id){
 if(tabName==='dialog'&&id==='trim-now'){runSmartAutoTrim();return}
 prevJumpPower(tabName,id);
};
})();
