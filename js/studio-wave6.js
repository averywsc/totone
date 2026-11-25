/* Totone v5.1.0 Wave — Shareable Color Grade Links (?look=), Live Webcam/Phone Photo Booth, Full Favicon & App-Icon Pack Builder (.ZIP) & Photoshop-Style Layer Search + Color Tags */
(function(){
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

/* ========== 1. Shareable Color Grade Links (?look=...) ========== */
const BASIC_KEYS=['temp','tint','exp','con','hi','sh','wh','bl','tex','cla','deh','vib','sat'];

function encodeCurrentGrade(){
 const b={};
 BASIC_KEYS.forEach(k=>{const v=parseFloat($('lr-'+k)?.value||'0');if(v)b[k]=v});
 const gr=film?.getGrade?.();
 const z={};
 if(gr?.zones){
  ['shadows','midtones','highlights'].forEach(zn=>{
   const o=gr.zones[zn];
   if(o&&(o.sat||o.lum))z[zn]={h:Math.round(o.hue||0),s:Math.round(o.sat||0),l:Math.round(o.lum||0)};
  });
 }
 const payload={b,z,m:gr?.mix??100,bal:gr?.balance??0};
 return btoa(unescape(encodeURIComponent(JSON.stringify(payload)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}

function applySharedGradePayload(p){
 if(!p)return;
 BASIC_KEYS.forEach(k=>{
  const el=$('lr-'+k);if(!el)return;
  el.value=p.b?.[k]??0;
  el.dispatchEvent(new Event('input',{bubbles:true}));
 });
 if($('grading-on')){$('grading-on').checked=true;$('grading-on').dispatchEvent(new Event('change'))}
 ['shadows','midtones','highlights'].forEach(zn=>{
  const o=p.z?.[zn];
  film?.setZone?.(zn,o?{hue:o.h||0,sat:o.s||0,lum:o.l||0}:{hue:0,sat:0,lum:0},false);
 });
 film?.setGradeProp?.('mix',p.m??100,false);
 film?.setGradeProp?.('balance',p.bal??0,true);
}

$('gp-share-link')?.addEventListener('click',async()=>{
 const token=encodeCurrentGrade();
 const url=new URL(location.href);
 url.searchParams.set('look',token);
 try{
  await navigator.clipboard.writeText(url.toString());
  showToast('Copied shareable Color Grade link to clipboard!',2000);
 }catch{
  prompt('Copy your shareable Color Grade link:',url.toString());
 }
});

// Auto-apply ?look= on boot (and re-apply once the user opens their first photo!)
(function checkSharedLookUrl(){
 const tok=new URLSearchParams(location.search).get('look');
 if(!tok)return;
 try{
  const b64=tok.replace(/-/g,'+').replace(/_/g,'/');
  const payload=JSON.parse(decodeURIComponent(escape(atob(b64))));
  setTimeout(()=>{
   applySharedGradePayload(payload);
   document.querySelector('.tabs [data-t="grade"]')?.click();
   showToast('Loaded shared Color Grade — open any photo to see it!',2800);
  },350);
 }catch{}
})();

/* ========== 2. Live Webcam / Phone Camera Photo Booth ========== */
const camCv=$('cam-canvas'),camCount=$('cam-countdown'),camStat=$('cam-status');
let camStream=null,camVideo=null,camRAF=0,camFacing='user';

function stopCamera(){
 cancelAnimationFrame(camRAF);camRAF=0;
 if(camStream){camStream.getTracks().forEach(t=>t.stop());camStream=null}
 if(camVideo){camVideo.srcObject=null;camVideo=null}
 if($('cam-snap'))$('cam-snap').disabled=true;
 if($('cam-timer'))$('cam-timer').disabled=true;
 if($('cam-snap-layer'))$('cam-snap-layer').disabled=true;
 if($('cam-start'))$('cam-start').textContent='Start Camera';
}

function getCamFilterCss(){
 const fx=$('cam-fx')?.value||'none';
 if(fx==='neon')return 'contrast(1.25) saturate(1.65) hue-rotate(-14deg)';
 if(fx==='warm')return 'sepia(0.28) contrast(1.08) saturate(1.25) brightness(1.05)';
 if(fx==='noir')return 'grayscale(1) contrast(1.42) brightness(0.96)';
 if(fx==='aero')return 'contrast(1.12) saturate(1.35) hue-rotate(12deg) brightness(1.06)';
 if(fx==='vhs')return 'contrast(1.18) saturate(1.3) sepia(0.18)';
 return 'none';
}

function drawCamFrame(){
 if(!camVideo||!camCv)return;
 const vw=camVideo.videoWidth||640,vh=camVideo.videoHeight||480;
 if(camCv.width!==vw||camCv.height!==vh){camCv.width=vw;camCv.height=vh}
 const g=camCv.getContext('2d');
 g.save();
 g.filter=getCamFilterCss();
 if($('cam-mirror')?.checked){g.translate(vw,0);g.scale(-1,1)}
 g.drawImage(camVideo,0,0,vw,vh);
 g.restore();
 if($('cam-fx')?.value==='vhs'){
  g.fillStyle='rgba(0,0,0,0.16)';
  for(let y=0;y<vh;y+=4)g.fillRect(0,y,vw,1);
 }
 camRAF=requestAnimationFrame(drawCamFrame);
}

async function startCamera(){
 stopCamera();
 if(!navigator.mediaDevices?.getUserMedia){camStat.textContent='Camera API unavailable in this browser.';return}
 camStat.textContent='Requesting camera access…';
 try{
  camStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:camFacing,width:{ideal:1280},height:{ideal:720}},audio:false});
  camVideo=document.createElement('video');camVideo.srcObject=camStream;camVideo.playsInline=true;camVideo.muted=true;
  await camVideo.play();
  $('cam-snap').disabled=false;$('cam-timer').disabled=false;$('cam-snap-layer').disabled=!base;
  $('cam-start').textContent='Stop Camera';
  camStat.textContent='Camera live! Pick a filter and click Snap Photo.';
  drawCamFrame();
 }catch(err){camStat.textContent='Camera error: '+err.message}
}

async function snapFromCamera(asLayer=false){
 if(!camVideo||!camCv)return;
 const snap=bc(camCv.width,camCv.height);snap.getContext('2d').drawImage(camCv,0,0);
 if(asLayer&&base){
  const d=snap.getContext('2d').getImageData(0,0,snap.width,snap.height);
  pushU(mkSnap('p'));
  const sc=Math.min(1,W*0.75/snap.width,H*0.75/snap.height);
  const l={cv:snap,d,o:null,lk:false,sh:null,ol:null,x:W/2,y:H/2,s:sc,r:0,op:1,bm:'source-over',fl:false,vis:true,cl:0,ct:0,cr:0,cb:0,name:'Camera Snap'};
  layers.push(l);active=l;refreshLayers();draw();
  showToast('Added camera snap as layer!',1400);
 }else{
  const blob=await toBlob(snap,'image/png');
  await load(new File([blob],'Camera-Snap.png',{type:'image/png'}));
  showToast('Captured photo to canvas!',1500);
 }
 stopCamera();$('nextgen-dialog')?.close();
}

$('cam-start')?.addEventListener('click',()=>{if(camStream)stopCamera();else startCamera()});
$('cam-flip')?.addEventListener('click',()=>{camFacing=camFacing==='user'?'environment':'user';if(camStream)startCamera()});
$('cam-snap')?.addEventListener('click',()=>snapFromCamera(false));
$('cam-snap-layer')?.addEventListener('click',()=>snapFromCamera(true));
$('cam-timer')?.addEventListener('click',async()=>{
 if(!camVideo)return;
 camCount.hidden=false;
 for(let n=3;n>=1;n--){camCount.textContent=String(n);await new Promise(r=>setTimeout(r,850))}
 camCount.hidden=true;snapFromCamera(false);
});
$('nextgen-dialog')?.addEventListener('close',stopCamera);

/* ========== 3. Full Favicon & App-Icon Pack Builder (.ZIP) ========== */
function renderFaviconAt(size){
 const src=(active&&active.cv)?active.cv:(base?captureCanvas(0):null);
 const cv=bc(size,size),g=cv.getContext('2d');
 const shape=$('fav-shape')?.value||'round',padPct=(+($('fav-pad')?.value||8))/100;
 const trans=!!$('fav-trans')?.checked,bg=$('fav-bg')?.value||'#050c1f';
 const rad=shape==='circle'?size/2:shape==='round'?size*0.22:0;
 g.save();
 if(rad>0){g.beginPath();g.roundRect(0,0,size,size,rad);g.clip()}
 if(!trans){g.fillStyle=bg;g.fillRect(0,0,size,size)}
 if(src){
  const pad=size*padPct,avail=size-pad*2;
  const sc=Math.min(avail/src.width,avail/src.height);
  const dw=src.width*sc,dh=src.height*sc;
  g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
  g.drawImage(src,(size-dw)/2,(size-dh)/2,dw,dh);
 }
 g.restore();
 return cv;
}
function renderFaviconPreviews(){
 [[128,'fav-p128'],[48,'fav-p48'],[24,'fav-p16']].forEach(([sz,id])=>{
  const el=$(id);if(!el)return;
  const r=renderFaviconAt(sz);
  el.width=sz;el.height=sz;el.getContext('2d').drawImage(r,0,0);
 });
}
['fav-shape','fav-pad','fav-bg','fav-trans'].forEach(id=>{
 $(id)?.addEventListener('input',e=>{if(id==='fav-pad')e.target.nextElementSibling.value=e.target.value+'%';renderFaviconPreviews()});
 $(id)?.addEventListener('change',renderFaviconPreviews);
});
$('ng-tabs')?.addEventListener('click',e=>{
 if(e.target.closest('[data-ngt="favicon"]'))renderFaviconPreviews();
});

function buildIcoBlob(pngBytes,size=64){
 const buf=new ArrayBuffer(22+pngBytes.length),dv=new DataView(buf),u8=new Uint8Array(buf);
 dv.setUint16(0,0,true);dv.setUint16(2,1,true);dv.setUint16(4,1,true);
 u8[6]=size>=256?0:size;u8[7]=size>=256?0:size;u8[8]=0;u8[9]=0;
 dv.setUint16(10,1,true);dv.setUint16(12,32,true);
 dv.setUint32(14,pngBytes.length,true);dv.setUint32(18,22,true);
 u8.set(pngBytes,22);
 return new Blob([buf],{type:'image/x-icon'});
}

$('fav-export')?.addEventListener('click',async()=>{
 if(!base){showToast('Open a logo or image first',1400);return}
 try{
  showToast('Building full Favicon & App-Icon Pack (.ZIP)…',1600);
  await loadScriptOnce('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js',()=>!!window.JSZip);
  const zip=new window.JSZip();
  const sizes=[[16,'favicon-16x16.png'],[32,'favicon-32x32.png'],[180,'apple-touch-icon.png'],[192,'android-chrome-192x192.png'],[512,'android-chrome-512x512.png']];
  for(const [sz,name] of sizes){
   const cv=renderFaviconAt(sz);
   zip.file(name,await toBlob(cv,'image/png'));
  }
  const icoPng=await toBlob(renderFaviconAt(64),'image/png');
  zip.file('favicon.ico',buildIcoBlob(new Uint8Array(await icoPng.arrayBuffer()),64));
  const appName=($('fav-name')?.value||'My App').trim()||'My App',bgCol=$('fav-bg')?.value||'#050c1f';
  zip.file('site.webmanifest',JSON.stringify({
   name:appName,short_name:appName,
   icons:[{src:'/android-chrome-192x192.png',sizes:'192x192',type:'image/png'},{src:'/android-chrome-512x512.png',sizes:'512x512',type:'image/png'}],
   theme_color:bgCol,background_color:bgCol,display:'standalone'
  },null,2));
  zip.file('head-tags.html',`<link rel="icon" href="/favicon.ico" sizes="any">\n<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">\n<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">\n<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">\n<link rel="manifest" href="/site.webmanifest">\n<meta name="theme-color" content="${bgCol}">\n`);
  const zb=await zip.generateAsync({type:'blob'});
  const a=document.createElement('a');a.href=URL.createObjectURL(zb);a.download='totone-favicon-pack.zip';a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),3000);
  showToast('Downloaded totone-favicon-pack.zip!',1800);
 }catch(err){showToast('Favicon pack error: '+err.message,2200)}
});

/* ========== 4. Photoshop-Style Layer Search & Color-Coded Layer Tags ========== */
const lSearch=$('layer-search'),lTags=$('layer-tags');
function applyLayerSearchAndTags(){
 const list=$('llist');if(!list)return;
 const q=(lSearch?.value||'').trim().toLowerCase();
 const rows=[...list.querySelectorAll('.lrow')];
 // core.js renders layers top-to-bottom (reversed from layers[])
 rows.forEach((row,ri)=>{
  const layer=layers[layers.length-1-ri];
  if(!layer)return;
  row.style.borderLeft=layer.tagColor?`4px solid ${layer.tagColor}`:'';
  const match=!q||(layer.name||'').toLowerCase().includes(q);
  row.style.display=match?'':'none';
 });
}
lSearch?.addEventListener('input',applyLayerSearchAndTags);
lTags?.addEventListener('click',e=>{
 const b=e.target.closest('[data-ltag]');if(!b)return;
 if(!active){showToast('Select a layer first to color-tag it',1200);return}
 active.tagColor=b.dataset.ltag||'';
 applyLayerSearchAndTags();
 showToast(active.tagColor?'Tagged layer':'Cleared layer tag',900);
});
if(typeof refreshLayers==='function'){
 const origRefreshW6=refreshLayers;
 refreshLayers=function(...args){
  const r=origRefreshW6.apply(this,args);
  applyLayerSearchAndTags();
  return r;
 };
}

if(Array.isArray(window.toolCommands)){
 window.toolCommands.push(
  ['Copy Shareable Color Grade Link (?look=)','grade','gp-share-link','share look link url grade preset copy'],
  ['Live Camera & Webcam Photo Booth','dialog','ng-camera','camera webcam photo booth selfie snap timer'],
  ['Full Favicon & App-Icon Pack Builder (.ZIP)','dialog','ng-favicon','favicon ico apple touch icon webmanifest zip pack'],
  ['Search & Color-Tag Layers','layers','layer-search','search filter layers color tag organize']
 );
}
})();
