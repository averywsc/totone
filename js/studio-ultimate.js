/* Totone Ultimate Suite — PWA Offline App Installer, Screenshot Beautifier (Shots.so), Custom Local Font Uploader (IndexedDB), Figma Smart Alignment Snap Guides, Multi-Page Slideshow Video Exporter (.webm/.mp4), Frequency-Separation Portrait Retouch, Arrows & Callout Annotations, Photoshop .PSD Importer (ag-psd) & Export All Layers .ZIP */
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
function addLayerCanvas(cv,name){
 const d=cv.getContext('2d',{willReadFrequently:true}).getImageData(0,0,cv.width,cv.height);
 pushU(mkSnap('p'));
 const l={cv,d,o:null,lk:false,sh:null,ol:null,x:W/2,y:H/2,s:1,r:0,op:1,bm:'source-over',fl:false,vis:true,cl:0,ct:0,cr:0,cb:0,name};
 layers.push(l);active=l;refreshLayers();draw();
}

/* ========== 1. PWA Service Worker + Install App Prompt ========== */
if('serviceWorker' in navigator&&/^https?:/.test(location.protocol)){
 navigator.serviceWorker.register('./sw.js').catch(()=>{});
}
let deferredInstallPrompt=null;
const installBtn=$('pwa-install-btn');
window.addEventListener('beforeinstallprompt',e=>{
 e.preventDefault();deferredInstallPrompt=e;
 if(installBtn)installBtn.hidden=false;
});
installBtn?.addEventListener('click',async()=>{
 if(!deferredInstallPrompt){showToast('Use your browser menu → "Install App" or "Add to Home Screen"!',2400);return}
 deferredInstallPrompt.prompt();
 const res=await deferredInstallPrompt.userChoice;
 if(res?.outcome==='accepted'){installBtn.hidden=true;showToast('Totone App installed!',2000)}
 deferredInstallPrompt=null;
});

/* Wire Pro Studio cards & tabs for the 4 new studios */
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-ai-act]');if(!b)return;
 const k=b.dataset.aiAct;
 if(['shots','video','portrait','annotate'].includes(k))window.openProStudioTab?.(k);
});
$('pro-tabs')?.addEventListener('click',e=>{
 const b=e.target.closest('[data-pt]');if(!b)return;
 const k=b.dataset.pt;
 if(k==='shots')renderShotsPreview();
 else if(k==='portrait')initPortraitRetouch();
 else if(k==='annotate')initAnnotate();
});

/* ========== 2. Screenshot Beautifier Studio (Shots.so / Ray.so Style) ========== */
const SHOT_BGS=[
 ['#0f172a','#1e3a8a','#38bdf8'],
 ['#3b0764','#be185d','#fb923c'],
 ['#042f2e','#0d9488','#a3e635'],
 ['#1e1b4b','#4f46e5','#ec4899'],
 ['#090d16','#1e293b','#475569'],
 ['#fef3c7','#fda4af','#c084fc'],
 ['#020617','#0f172a','#1e293b'],
 ['#e2e8f0','#f8fafc','#cbd5e1']
];
let shotBgIdx=0;
const shSw=$('sh-bg-swatches');
if(shSw){
 shSw.innerHTML=SHOT_BGS.map((c0,i)=>`<button type="button" data-sbg="${i}" style="background:linear-gradient(135deg,${c0[0]},${c0[1]},${c0[2]})"></button>`).join('');
 shSw.onclick=e=>{const b=e.target.closest('[data-sbg]');if(!b)return;shotBgIdx=+b.dataset.sbg;renderShotsPreview()};
}

function renderShotsTo(outCv,maxW=0){
 if(!base)return;
 const src=captureCanvas(maxW),sw=src.width,sh=src.height;
 const pad=Math.round((+($('sh-pad')?.value||72))*(sw/1000||1));
 const rad=Math.round((+($('sh-rad')?.value||18))*(sw/1000||1));
 const shad=Math.round((+($('sh-shad')?.value||44))*(sw/1000||1));
 const frame=$('sh-frame')?.value||'mac-dark';
 const barH=(frame==='mac-dark'||frame==='mac-light'||frame==='browser')?Math.max(24,Math.round(sw*0.036)):0;
 const ow=sw+pad*2,oh=sh+barH+pad*2;
 outCv.width=ow;outCv.height=oh;
 const g=outCv.getContext('2d');
 // Rich 3-stop mesh gradient wallpaper
 const cols=SHOT_BGS[shotBgIdx]||SHOT_BGS[0];
 const bgG=g.createLinearGradient(0,0,ow,oh);
 bgG.addColorStop(0,cols[0]);bgG.addColorStop(0.5,cols[1]);bgG.addColorStop(1,cols[2]);
 g.fillStyle=bgG;g.fillRect(0,0,ow,oh);
 // Soft radial glow highlight
 const rg=g.createRadialGradient(ow*0.25,oh*0.2,10,ow*0.25,oh*0.2,ow*0.7);
 rg.addColorStop(0,'rgba(255,255,255,0.18)');rg.addColorStop(1,'rgba(255,255,255,0)');
 g.fillStyle=rg;g.fillRect(0,0,ow,oh);

 // Window drop shadow
 g.save();
 g.shadowColor='rgba(0,0,0,0.58)';g.shadowBlur=shad*1.6;g.shadowOffsetY=shad*0.45;
 g.fillStyle=frame==='mac-light'?'#f1f5f9':'#0f172a';
 g.beginPath();g.roundRect(pad,pad,sw,sh+barH,rad);g.fill();
 g.restore();

 // Clip window body
 g.save();
 g.beginPath();g.roundRect(pad,pad,sw,sh+barH,rad);g.clip();
 if(barH>0){
  g.fillStyle=frame==='mac-light'?'#e2e8f0':'#111827';
  g.fillRect(pad,pad,sw,barH);
  const dotR=Math.max(4,barH*0.17),dy=pad+barH/2;
  ['#ef4444','#f59e0b','#22c55e'].forEach((dc,i)=>{
   g.fillStyle=dc;g.beginPath();g.arc(pad+barH*0.65+i*dotR*3.1,dy,dotR,0,Math.PI*2);g.fill();
  });
  if(frame==='browser'){
   g.fillStyle='rgba(255,255,255,0.08)';
   g.beginPath();g.roundRect(pad+sw*0.28,pad+barH*0.22,sw*0.44,barH*0.56,barH*0.28);g.fill();
  }
 }
 g.drawImage(src,pad,pad+barH);
 g.restore();

 // Crisp glass rim border
 g.strokeStyle=frame==='glass'?'rgba(255,255,255,0.45)':'rgba(255,255,255,0.18)';
 g.lineWidth=frame==='glass'?Math.max(4,sw*0.008):1.5;
 g.beginPath();g.roundRect(pad,pad,sw,sh+barH,rad);g.stroke();
}

function renderShotsPreview(){if($('sh-canvas'))renderShotsTo($('sh-canvas'),760)}
['sh-frame','sh-pad','sh-rad','sh-shad'].forEach(id=>{
 $(id)?.addEventListener('input',e=>{
  if(e.target.type==='range')e.target.nextElementSibling.value=e.target.value+(id==='sh-shad'?'':' px');
  renderShotsPreview();
 });
 $(id)?.addEventListener('change',renderShotsPreview);
});
$('sh-apply')?.addEventListener('click',async()=>{
 if(!base)return;
 const out=bc(10,10);renderShotsTo(out,0);
 const blob=await toBlob(out,'image/png');
 await load(new File([blob],'Beautified-Shot.png',{type:'image/png'}));
 $('pro-studio-dialog').close();showToast('Applied Screenshot Beautifier on a new page!',1600);
});
$('sh-dl')?.addEventListener('click',()=>{
 const out=bc(10,10);renderShotsTo(out,0);
 const a=document.createElement('a');a.href=out.toDataURL('image/png');a.download='totone-shot.png';a.click();
});
$('sh-copy')?.addEventListener('click',async()=>{
 const out=bc(10,10);renderShotsTo(out,0);
 try{const b=await toBlob(out,'image/png');await navigator.clipboard.write([new ClipboardItem({'image/png':b})]);showToast('Copied beautified shot!',1400)}
 catch{showToast('Copy blocked — use Download PNG',1600)}
});

/* ========== 3. Custom Local Font Uploader (.ttf / .otf / .woff2 -> IndexedDB) ========== */
const FONT_DB='totone_fonts_db';
function openFontDB(){
 return new Promise((res,rej)=>{
  const req=indexedDB.open(FONT_DB,1);
  req.onupgradeneeded=e=>{if(!e.target.result.objectStoreNames.contains('fonts'))e.target.result.createObjectStore('fonts',{keyPath:'name'})};
  req.onsuccess=()=>res(req.result);req.onerror=()=>rej(req.error);
 });
}
async function registerCustomFont(name,buf,save=true){
 const face=new FontFace(name,buf);
 await face.load();document.fonts.add(face);
 if(save){
  try{const db=await openFontDB();db.transaction('fonts','readwrite').objectStore('fonts').put({name,buf})}catch{}
 }
 const tfont=$('tfont');
 if(tfont&&![...tfont.options].some(o=>o.value===name)){
  const opt=document.createElement('option');opt.value=name;opt.textContent=name+' (Custom)';
  tfont.prepend(opt);
 }
 const flist=$('flist');
 if(flist&&!flist.querySelector(`[data-cf="${CSS.escape(name)}"]`)){
  const b=document.createElement('button');b.type='button';b.className='fi';b.dataset.cf=name;
  b.style.fontFamily=`"${name}",sans-serif`;b.textContent=name+' ★';
  b.onclick=()=>{if(tfont){tfont.value=name;tfont.dispatchEvent(new Event('change',{bubbles:true}))}};
  flist.prepend(b);
 }
}
$('font-upload-btn')?.addEventListener('click',()=>$('font-upload-file')?.click());
$('font-upload-file')?.addEventListener('change',async e=>{
 const files=[...(e.target.files||[])];e.target.value='';
 for(const f of files){
  try{
   const name=f.name.replace(/\.[^.]+$/,'').replace(/[_-]+/g,' ').trim()||'CustomFont';
   const buf=await f.arrayBuffer();
   await registerCustomFont(name,buf,true);
   if($('tfont')){$('tfont').value=name;$('tfont').dispatchEvent(new Event('change',{bubbles:true}))}
   showToast(`Loaded custom font "${name}"!`,1600);
  }catch(err){showToast('Font load failed: '+err.message,2000)}
 }
});
// Auto-restore saved custom fonts on boot
openFontDB().then(db=>{
 const req=db.transaction('fonts','readonly').objectStore('fonts').getAll();
 req.onsuccess=()=>{(req.result||[]).forEach(r=>registerCustomFont(r.name,r.buf,false).catch(()=>{}))};
}).catch(()=>{});

/* ========== 4. Figma-Style Live Smart Alignment Snap Guides ========== */
let smartSnapX=null,smartSnapY=null,snapDragging=false;
const guideCv=$('stage-guides');

function drawSmartSnapLines(){
 if(!snapDragging||(smartSnapX===null&&smartSnapY===null)||!guideCv||!base)return;
 const cr=c.getBoundingClientRect();if(!cr.width)return;
 const dpr=Math.min(2,devicePixelRatio||1);
 guideCv.style.display='block';
 guideCv.style.left=cr.left+'px';guideCv.style.top=cr.top+'px';
 guideCv.style.width=cr.width+'px';guideCv.style.height=cr.height+'px';
 const pw=Math.max(1,Math.round(cr.width*dpr)),ph=Math.max(1,Math.round(cr.height*dpr));
 if(guideCv.width!==pw)guideCv.width=pw;if(guideCv.height!==ph)guideCv.height=ph;
 const g=guideCv.getContext('2d');
 g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,cr.width,cr.height);
 g.strokeStyle='#f43f5e';g.lineWidth=1.5;g.setLineDash([4,3]);
 if(smartSnapX!==null){
  const vx=smartSnapX*(cr.width/W);
  g.beginPath();g.moveTo(vx,0);g.lineTo(vx,cr.height);g.stroke();
 }
 if(smartSnapY!==null){
  const vy=smartSnapY*(cr.height/H);
  g.beginPath();g.moveTo(0,vy);g.lineTo(cr.width,vy);g.stroke();
 }
 g.setLineDash([]);
}

c.addEventListener('pointerdown',()=>{if(active&&!active.lk&&['layers','design','text'].includes(tab))snapDragging=true});
c.addEventListener('pointermove',e=>{
 if(!snapDragging||!active||e.altKey||!base)return;
 const tol=Math.max(2.5,Math.min(5,Math.round(Math.min(W,H)*0.0035)));
 smartSnapX=null;smartSnapY=null;
 const targetsX=[W/2],targetsY=[H/2];
 layers.forEach(l=>{if(l!==active&&l.vis){targetsX.push(l.x);targetsY.push(l.y)}});
 for(const tx of targetsX)if(Math.abs(active.x-tx)<tol){active.x=tx;smartSnapX=tx;break}
 for(const ty of targetsY)if(Math.abs(active.y-ty)<tol){active.y=ty;smartSnapY=ty;break}
 if(smartSnapX!==null||smartSnapY!==null)requestAnimationFrame(drawSmartSnapLines);
});
window.addEventListener('pointerup',()=>{
 if(!snapDragging)return;
 snapDragging=false;smartSnapX=null;smartSnapY=null;
 if(guideCv&&$('grid-toggle')?.getAttribute('aria-pressed')!=='true'&&window.totoneSettings?.safezone==='off')guideCv.style.display='none';
});

/* ========== 5. Multi-Page Slideshow / Reels Video Exporter (.webm / .mp4) ========== */
let lastVideoUrl='';
$('vid-sec')?.addEventListener('input',e=>{e.target.nextElementSibling.value=e.target.value+' s'});
$('vid-run')?.addEventListener('click',async()=>{
 if(!base){showToast('Open an image or design first',1400);return}
 if(typeof MediaRecorder==='undefined'){showToast('Video recording is not supported in this browser',2200);return}
 const stat=$('vid-status'),progWrap=$('vid-prog-wrap'),progBar=$('vid-prog-bar');
 const sec=+$('vid-sec').value||2.5,mode=$('vid-mode').value,maxRes=+$('vid-res').value||1080;
 const sc=Math.min(1,maxRes/Math.max(W,H));
 const vw=Math.max(2,Math.round(W*sc/2)*2),vh=Math.max(2,Math.round(H*sc/2)*2);
 progWrap.hidden=false;progBar.style.width='4%';stat.textContent='Capturing page frames…';
 try{
  const slides=[];
  const pgs=window.totonePages?.getPages?.()||[];
  if(pgs.length>1){
   for(let i=0;i<pgs.length;i++){
    await window.totonePages.switchToPage(i);
    slides.push(captureCanvas(maxRes));
   }
  }else{
   slides.push(captureCanvas(maxRes));
  }
  const recCv=bc(vw,vh),g=recCv.getContext('2d');
  const mime=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm','video/mp4'].find(m=>MediaRecorder.isTypeSupported(m))||'video/webm';
  const stream=recCv.captureStream(30),rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:5000000});
  const chunks=[];rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
  const doneP=new Promise(r=>rec.onstop=r);
  rec.start();
  const fps=30,framesPerSlide=Math.max(15,Math.round(sec*fps)),totalFrames=slides.length*framesPerSlide;
  stat.textContent=`Recording ${slides.length} slide(s) at ${vw}×${vh}…`;
  for(let f=0;f<totalFrames;f++){
   const si=Math.min(slides.length-1,Math.floor(f/framesPerSlide));
   const localT=(f%framesPerSlide)/framesPerSlide;
   const cur=slides[si],next=slides[(si+1)%slides.length];
   g.fillStyle='#050c1f';g.fillRect(0,0,vw,vh);
   if(mode==='zoom'){
    const z=1+localT*0.14,dw=vw*z,dh=vh*z;
    g.drawImage(cur,(vw-dw)/2,(vh-dh)/2,dw,dh);
   }else if(mode==='glitch'){
    g.drawImage(cur,0,0,vw,vh);
    if(f%7===0){const sy=Math.random()*vh*0.8,sh0=12+Math.random()*44;g.drawImage(cur,0,sy,cur.width,sh0*(cur.height/vh),(Math.random()-0.5)*28,sy,vw,sh0)}
   }else if(mode==='slide'&&slides.length>1&&localT>0.75){
    const t=(localT-0.75)/0.25,ease=t*t*(3-2*t);
    g.drawImage(cur,-ease*vw,0,vw,vh);g.drawImage(next,(1-ease)*vw,0,vw,vh);
   }else{
    g.drawImage(cur,0,0,vw,vh);
    if(slides.length>1&&localT>0.78){g.save();g.globalAlpha=(localT-0.78)/0.22;g.drawImage(next,0,0,vw,vh);g.restore()}
   }
   progBar.style.width=Math.round((f+1)/totalFrames*96)+'%';
   await new Promise(r=>setTimeout(r,1000/fps));
  }
  rec.stop();await doneP;
  const blob=new Blob(chunks,{type:mime});
  if(lastVideoUrl)URL.revokeObjectURL(lastVideoUrl);
  lastVideoUrl=URL.createObjectURL(blob);
  const vp=$('vid-preview');vp.src=lastVideoUrl;vp.hidden=false;$('vid-placeholder').hidden=true;
  $('vid-dl').disabled=false;progBar.style.width='100%';
  const ext=mime.includes('mp4')?'mp4':'webm';
  $('vid-dl').dataset.ext=ext;
  stat.textContent=`Ready! ${(blob.size/1048576).toFixed(2)} MB .${ext.toUpperCase()} (${vw}×${vh})`;
 }catch(err){stat.textContent='Video error: '+err.message}
});
$('vid-dl')?.addEventListener('click',()=>{
 if(!lastVideoUrl)return;
 const a=document.createElement('a');a.href=lastVideoUrl;a.download='totone-video.'+($('vid-dl').dataset.ext||'webm');a.click();
});

/* ========== 6. Frequency-Separation Portrait Retouch (Skin / Eyes / Teeth / Glow) ========== */
const porCv=$('por-canvas');
let porMode='skin',porOrig=null,porWork=null,porUndo=[],porDown=false,porLast=null;

function initPortraitRetouch(){
 if(!base||!porCv)return;
 porOrig=captureCanvas(900);
 porWork=bc(porOrig.width,porOrig.height);porWork.getContext('2d').drawImage(porOrig,0,0);
 porCv.width=porWork.width;porCv.height=porWork.height;
 porCv.getContext('2d').drawImage(porWork,0,0);
 porUndo=[];
}
function applyPortraitDab(cx,cy){
 const rad=+$('por-size').value*(porWork.width/900||1),str=(+$('por-str').value)/100;
 const x0=Math.max(0,Math.floor(cx-rad)),y0=Math.max(0,Math.floor(cy-rad));
 const bw=Math.min(porWork.width-x0,Math.ceil(rad*2)),bh=Math.min(porWork.height-y0,Math.ceil(rad*2));
 if(bw<2||bh<2)return;
 const g=porWork.getContext('2d',{willReadFrequently:true});
 const im=g.getImageData(x0,y0,bw,bh),d=im.data;
 let blurD=null;
 if(porMode==='skin'||porMode==='glow'){
  const tmp=bc(bw,bh),tg=tmp.getContext('2d',{willReadFrequently:true});
  tg.filter=`blur(${Math.max(2,Math.round(rad*0.22))}px)`;
  tg.drawImage(porWork,x0,y0,bw,bh,0,0,bw,bh);
  blurD=tg.getImageData(0,0,bw,bh).data;
 }
 for(let y=0;y<bh;y++)for(let x=0;x<bw;x++){
  const dist=Math.hypot(x0+x-cx,y0+y-cy);if(dist>=rad)continue;
  const f=Math.pow(1-dist/rad,1.6)*str*0.42;
  const o=(y*bw+x)*4;
  if(porMode==='skin'&&blurD){
   // Frequency-preserving skin smooth: blends low-freq smoothly while keeping micro-texture!
   for(let ch=0;ch<3;ch++){
    const diff=d[o+ch]-blurD[o+ch];
    const edgeProtect=Math.abs(diff)>26?0.2:1;
    d[o+ch]=clamp(d[o+ch]-(diff*f*edgeProtect),0,255);
   }
  }else if(porMode==='eyes'){
   for(let ch=0;ch<3;ch++)d[o+ch]=clamp(d[o+ch]+(255-d[o+ch])*f*0.35+(d[o+ch]-128)*f*0.25,0,255);
  }else if(porMode==='teeth'){
   // Reduce yellow (boost blue slightly & desaturate warmth) + lift brightness
   const avg=(d[o]+d[o+1]+d[o+2])/3;
   d[o]=clamp(d[o]+(avg-d[o])*f*0.6+18*f,0,255);
   d[o+1]=clamp(d[o+1]+(avg-d[o+1])*f*0.5+18*f,0,255);
   d[o+2]=clamp(d[o+2]+(avg-d[o+2])*f*0.3+26*f,0,255);
  }else if(porMode==='glow'&&blurD){
   for(let ch=0;ch<3;ch++)d[o+ch]=clamp(d[o+ch]+blurD[o+ch]*f*0.35,0,255);
  }
 }
 g.putImageData(im,x0,y0);
 porCv.getContext('2d').drawImage(porWork,0,0);
}
$('por-modes')?.addEventListener('click',e=>{
 const b=e.target.closest('[data-pm]');if(!b)return;
 porMode=b.dataset.pm;
 document.querySelectorAll('#por-modes button').forEach(x=>x.classList.toggle('on',x===b));
});
$('por-size')?.addEventListener('input',e=>{e.target.nextElementSibling.value=e.target.value+' px'});
$('por-str')?.addEventListener('input',e=>{e.target.nextElementSibling.value=e.target.value+'%'});
porCv?.addEventListener('pointerdown',e=>{
 if(!porWork)return;
 const snap=bc(porWork.width,porWork.height);snap.getContext('2d').drawImage(porWork,0,0);
 if(porUndo.length>15)porUndo.shift();porUndo.push(snap);
 porDown=true;porCv.setPointerCapture(e.pointerId);
 const r=porCv.getBoundingClientRect();
 const x=(e.clientX-r.left)*porWork.width/r.width,y=(e.clientY-r.top)*porWork.height/r.height;
 porLast=[x,y];applyPortraitDab(x,y);
});
porCv?.addEventListener('pointermove',e=>{
 if(!porDown||!porLast)return;
 const r=porCv.getBoundingClientRect();
 const x=(e.clientX-r.left)*porWork.width/r.width,y=(e.clientY-r.top)*porWork.height/r.height;
 if(Math.hypot(x-porLast[0],y-porLast[1])>5){porLast=[x,y];applyPortraitDab(x,y)}
});
porCv?.addEventListener('pointerup',()=>{porDown=false;porLast=null});
$('por-undo')?.addEventListener('click',()=>{
 const p=porUndo.pop();if(!p||!porWork)return;
 porWork.getContext('2d').drawImage(p,0,0);porCv.getContext('2d').drawImage(p,0,0);
});
$('por-reset')?.addEventListener('click',()=>initPortraitRetouch());
$('por-apply')?.addEventListener('click',()=>{
 if(!porWork||!base)return;
 const full=bc(W,H);full.getContext('2d').drawImage(porWork,0,0,W,H);
 addLayerCanvas(full,'Portrait Retouch');$('pro-studio-dialog').close();showToast('Applied Portrait Retouch layer!',1500);
});

/* ========== 7. Interactive Arrows, Numbered Steps & Callout Annotations ========== */
const annCv=$('ann-canvas');
let annMode='arrow',annBase=null,annItems=[],annDrag=null,annStepNum=1;

function initAnnotate(){
 if(!base||!annCv)return;
 annBase=captureCanvas(900);annCv.width=annBase.width;annCv.height=annBase.height;
 annItems=[];annDrag=null;annStepNum=1;
 drawAnnotations(annCv,annBase,annItems,1);
}
function drawOneAnnotation(g,it,sc){
 const x0=it.x0*sc,y0=it.y0*sc,x1=it.x1*sc,y1=it.y1*sc,lw=it.w*sc;
 g.save();g.strokeStyle=it.col;g.fillStyle=it.col;g.lineWidth=lw;g.lineCap='round';g.lineJoin='round';
 if(it.mode==='arrow'){
  g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();
  const a=Math.atan2(y1-y0,x1-x0),hl=Math.max(12*sc,lw*3.4);
  g.beginPath();g.moveTo(x1,y1);
  g.lineTo(x1-hl*Math.cos(a-0.48),y1-hl*Math.sin(a-0.48));
  g.lineTo(x1-hl*Math.cos(a+0.48),y1-hl*Math.sin(a+0.48));
  g.closePath();g.fill();
 }else if(it.mode==='box'){
  g.shadowColor=it.col;g.shadowBlur=10*sc;
  g.beginPath();g.roundRect(Math.min(x0,x1),Math.min(y0,y1),Math.abs(x1-x0),Math.abs(y1-y0),8*sc);g.stroke();
 }else if(it.mode==='step'){
  const r=Math.max(16*sc,lw*3.8);
  g.shadowColor='rgba(0,0,0,0.45)';g.shadowBlur=8*sc;
  g.beginPath();g.arc(x0,y0,r,0,Math.PI*2);g.fill();
  g.strokeStyle='#ffffff';g.lineWidth=Math.max(2*sc,lw*0.45);g.stroke();
  g.fillStyle='#ffffff';g.font=`800 ${Math.round(r*1.15)}px Archivo,sans-serif`;g.textAlign='center';g.textBaseline='middle';
  g.fillText(String(it.num||1),x0,y0+1*sc);
 }else if(it.mode==='callout'){
  const txt=it.txt||'Note',fs=Math.max(14*sc,lw*3.2);
  g.font=`700 ${fs}px Archivo,sans-serif`;
  const tw=g.measureText(txt).width+fs*1.3,th=fs*1.75;
  g.shadowColor='rgba(0,0,0,0.45)';g.shadowBlur=10*sc;
  g.beginPath();g.roundRect(x0-tw/2,y0-th/2,tw,th,th/2);g.fill();
  g.fillStyle='#ffffff';g.textAlign='center';g.textBaseline='middle';
  g.fillText(txt,x0,y0+1*sc);
 }
 g.restore();
}
function drawAnnotations(targetCv,bgCv,items,sc,preview=null){
 const g=targetCv.getContext('2d');
 g.clearRect(0,0,targetCv.width,targetCv.height);
 if(bgCv)g.drawImage(bgCv,0,0);
 items.forEach(it=>drawOneAnnotation(g,it,sc));
 if(preview)drawOneAnnotation(g,preview,sc);
}
$('ann-modes')?.addEventListener('click',e=>{
 const b=e.target.closest('[data-am]');if(!b)return;
 annMode=b.dataset.am;
 document.querySelectorAll('#ann-modes button').forEach(x=>x.classList.toggle('on',x===b));
});
$('ann-w')?.addEventListener('input',e=>{e.target.nextElementSibling.value=e.target.value+' px'});
annCv?.addEventListener('pointerdown',e=>{
 if(!annBase)return;
 const r=annCv.getBoundingClientRect();
 const x=(e.clientX-r.left)*annBase.width/r.width,y=(e.clientY-r.top)*annBase.height/r.height;
 if(annMode==='step'||annMode==='callout'){
  annItems.push({mode:annMode,x0:x,y0:y,x1:x,y1:y,col:$('ann-col').value,w:+$('ann-w').value,num:annMode==='step'?annStepNum++:0,txt:$('ann-txt').value});
  drawAnnotations(annCv,annBase,annItems,1);
 }else{
  annCv.setPointerCapture(e.pointerId);
  annDrag={mode:annMode,x0:x,y0:y,x1:x,y1:y,col:$('ann-col').value,w:+$('ann-w').value};
 }
});
annCv?.addEventListener('pointermove',e=>{
 if(!annDrag)return;
 const r=annCv.getBoundingClientRect();
 annDrag.x1=(e.clientX-r.left)*annBase.width/r.width;annDrag.y1=(e.clientY-r.top)*annBase.height/r.height;
 drawAnnotations(annCv,annBase,annItems,1,annDrag);
});
annCv?.addEventListener('pointerup',()=>{
 if(!annDrag)return;
 if(Math.hypot(annDrag.x1-annDrag.x0,annDrag.y1-annDrag.y0)>6)annItems.push(annDrag);
 annDrag=null;drawAnnotations(annCv,annBase,annItems,1);
});
$('ann-undo')?.addEventListener('click',()=>{const p=annItems.pop();if(p?.mode==='step')annStepNum=Math.max(1,annStepNum-1);if(annBase)drawAnnotations(annCv,annBase,annItems,1)});
$('ann-clear')?.addEventListener('click',()=>{annItems=[];annStepNum=1;if(annBase)drawAnnotations(annCv,annBase,annItems,1)});
$('ann-apply')?.addEventListener('click',()=>{
 if(!base||!annItems.length){showToast('Draw an arrow, step, or box first',1400);return}
 const out=bc(W,H);drawAnnotations(out,null,annItems,W/annBase.width);
 addLayerCanvas(out,'Annotations');$('pro-studio-dialog').close();showToast('Added Annotations layer!',1400);
});

/* ========== 8. Photoshop .PSD Multi-Layer Importer (ag-psd) & Export All Layers (.ZIP) ========== */
$('psd-import-btn')?.addEventListener('click',()=>$('psd-import-file')?.click());
$('psd-import-file')?.addEventListener('change',async e=>{
 const f=e.target.files?.[0];e.target.value='';if(!f)return;
 showToast('Parsing Photoshop .PSD layers…',2200);
 try{
  const mod=await import('https://cdn.jsdelivr.net/npm/ag-psd@28.1.0/+esm');
  const buf=await f.arrayBuffer();
  const psd=mod.readPsd(buf,{skipThumbnail:true});
  const pw=psd.width||1080,ph=psd.height||1080;
  // Create clean transparent base canvas matching PSD dimensions
  const blank=bc(pw,ph);
  if(psd.canvas)blank.getContext('2d').drawImage(psd.canvas,0,0);
  await load(new File([await toBlob(blank,'image/png')],f.name.replace(/\.psd$/i,'')+'.png',{type:'image/png'}));
  const flatList=[];
  const walk=(nodes)=>{
   if(!nodes)return;
   for(const n of nodes){
    if(n.children)walk(n.children);
    else if(n.canvas&&n.canvas.width&&n.canvas.height)flatList.push(n);
   }
  };
  walk(psd.children);
  if(flatList.length){
   // Clear composite base to transparent when individual layers exist so layers are 100% independent!
   const emptyBg=bc(W,H);base=emptyBg.getContext('2d').getImageData(0,0,W,H);
   const sc=W/pw;
   for(const nl of flatList){
    const lcv=bc(nl.canvas.width,nl.canvas.height);
    lcv.getContext('2d').drawImage(nl.canvas,0,0);
    const ld=lcv.getContext('2d').getImageData(0,0,lcv.width,lcv.height);
    const lx=((nl.left||0)+lcv.width/2)*sc,ly=((nl.top||0)+lcv.height/2)*sc;
    const op=nl.opacity!=null?(nl.opacity>1?nl.opacity/255:nl.opacity):1;
    layers.push({cv:lcv,d:ld,o:null,lk:false,sh:null,ol:null,x:lx,y:ly,s:sc,r:0,op:clamp(op,0,1),bm:'source-over',fl:false,vis:!nl.hidden,cl:0,ct:0,cr:0,cb:0,name:nl.name||'PSD Layer'});
   }
   active=layers[layers.length-1];refreshLayers();draw();
   showToast(`Imported .PSD with ${flatList.length} editable layer(s)!`,2200);
  }else{
   showToast('Imported flattened .PSD composite!',1600);
  }
 }catch(err){showToast('PSD import failed: '+err.message,2600)}
});

$('layers-export-zip')?.addEventListener('click',async()=>{
 if(!base){showToast('Open an image first',1400);return}
 try{
  showToast('Exporting all layers to .ZIP…',1600);
  await loadScriptOnce('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js',()=>!!window.JSZip);
  const zip=new window.JSZip();
  const baseCv=bc(W,H);baseCv.getContext('2d').putImageData(base,0,0);
  zip.file('00-base-background.png',await toBlob(baseCv,'image/png'));
  for(let i=0;i<layers.length;i++){
   const l=layers[i],visCv=typeof visibleLayer==='function'?visibleLayer(l).cv:l.cv;
   const safeName=(l.name||`layer-${i+1}`).replace(/[^\w\- ]+/g,'_').trim();
   zip.file(`${String(i+1).padStart(2,'0')}-${safeName}.png`,await toBlob(visCv,'image/png'));
  }
  const zb=await zip.generateAsync({type:'blob'});
  const a=document.createElement('a');a.href=URL.createObjectURL(zb);a.download='totone-layers.zip';a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),3000);
  showToast(`Exported ${layers.length+1} layers in totone-layers.zip!`,1800);
 }catch(err){showToast('Layer ZIP failed: '+err.message,2000)}
});

if(Array.isArray(window.toolCommands)){
 window.toolCommands.push(
  ['Screenshot Beautifier (Shots.so / macOS / Glass / Mesh)','dialog','pro-shots','screenshot beautifier shots ray macos window gradient shadow'],
  ['Multi-Page Slideshow / Reels Video Exporter (.WebM/.MP4)','dialog','pro-video','video slideshow reels tiktok export webm mp4 animation'],
  ['Portrait Retouch (Smooth Skin / Eyes / Teeth)','dialog','pro-portrait','portrait retouch smooth skin whiten teeth brighten eyes face'],
  ['Arrows, Numbered Steps & Callout Annotations','dialog','pro-annotate','arrow annotation step badge callout box tutorial'],
  ['Upload Custom Font (.ttf / .otf / .woff2)','text','font-upload-btn','upload font custom ttf otf woff2 typeface'],
  ['Import Photoshop .PSD Multi-Layer File','layers','psd-import-btn','psd photoshop import layers open'],
  ['Export All Layers as Separate PNGs (.ZIP)','layers','layers-export-zip','export layers zip png separate assets']
 );
}
})();
