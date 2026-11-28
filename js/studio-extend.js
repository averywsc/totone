/* Totone v5.4.0 Extensions — Custom PNG Stamp Brushes, Scripting & Macros Runner, Plugin Loader (window.TotoneAPI) & SEO Route ?tool= Zero-Friction Launcher */
(function(){
/* ========== 1. Custom Stamp Brushes (Upload Any PNG + Built-in Stamps with Scatter & Rotation Jitter) ========== */
let customBrushImg=null,customBrushActive=false,cbDown=false,cbLast=null;
const cbGrid=$('cb-presets'),cbUpload=$('cb-upload-file');

function makeBuiltInStamp(kind){
 const s=96,cv=bc(s,s),g=cv.getContext('2d'),cx=s/2,cy=s/2;
 g.fillStyle='#ffffff';
 if(kind==='star'){
  g.beginPath();
  for(let i=0;i<10;i++){const r=i%2?18:42,a=i*Math.PI/5-Math.PI/2;if(i)g.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);else g.moveTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r)}
  g.closePath();g.fill();
 }else if(kind==='sparkle'){
  g.beginPath();g.moveTo(cx,6);g.quadraticCurveTo(cx+6,cy-6,s-6,cy);g.quadraticCurveTo(cx+6,cy+6,cx,s-6);
  g.quadraticCurveTo(cx-6,cy+6,6,cy);g.quadraticCurveTo(cx-6,cy-6,cx,6);g.fill();
 }else if(kind==='heart'){
  g.beginPath();g.moveTo(cx,cy+28);g.bezierCurveTo(cx-44,cy-4,cx-28,cy-40,cx,cy-12);
  g.bezierCurveTo(cx+28,cy-40,cx+44,cy-4,cx,cy+28);g.fill();
 }else if(kind==='cloud'){
  [[32,54,18],[48,42,22],[66,54,17],[48,58,20]].forEach(([x,y,r])=>{g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill()});
 }else if(kind==='splatter'){
  for(let i=0;i<14;i++){const a=i*2.39,r=6+((i*17)%30),sz=3+((i*7)%10);g.beginPath();g.arc(cx+Math.cos(a)*r,cy+Math.sin(a)*r,sz,0,Math.PI*2);g.fill()}
 }
 return cv;
}

function setCustomBrush(imgOrCv,label){
 customBrushImg=imgOrCv;customBrushActive=!!imgOrCv;
 if($('cb-status'))$('cb-status').textContent=customBrushActive?`Active stamp: ${label} — paint on canvas!`:'Custom stamp brush off.';
 if(customBrushActive){
  document.querySelector('.tabs [data-t="draw"]')?.click();
  showToast('Custom Stamp Brush: '+label,1200);
 }
}
cbGrid?.addEventListener('click',e=>{
 const b=e.target.closest('[data-cb]');if(!b)return;
 const k=b.dataset.cb;
 cbGrid.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));
 if(k==='off'){setCustomBrush(null,'Off');return}
 setCustomBrush(makeBuiltInStamp(k),b.textContent);
});
$('cb-upload-btn')?.addEventListener('click',()=>cbUpload?.click());
cbUpload?.addEventListener('change',e=>{
 const f=e.target.files?.[0];e.target.value='';if(!f)return;
 const im=new Image(),u=URL.createObjectURL(f);
 im.onload=()=>{URL.revokeObjectURL(u);setCustomBrush(im,f.name.replace(/\.[^.]+$/,''))};
 im.src=u;
});
['cb-scatter','cb-jitter'].forEach(id=>$(id)?.addEventListener('input',e=>{e.target.nextElementSibling.value=e.target.value+'%'}));

function stampCustomBrushAt(cx,cy){
 if(!customBrushImg||!base)return;
 if(!active||active.lk||active.tx||active.cv.width!==W||active.cv.height!==H||active.name!=='Stamp Paint'){
  const existing=layers.find(l=>!l.lk&&l.vis&&l.name==='Stamp Paint'&&l.cv.width===W&&l.cv.height===H);
  if(existing){active=existing}
  else{
   const cv=bc(W,H),d=cv.getContext('2d').getImageData(0,0,W,H);
   const l={cv,d,o:null,lk:false,sh:null,ol:null,x:W/2,y:H/2,s:1,r:0,op:1,bm:'source-over',fl:false,vis:true,cl:0,ct:0,cr:0,cb:0,name:'Stamp Paint'};
   layers.push(l);active=l;
  }
 }
 const sz=Math.max(10,Math.round((+($('draw-size')?.value||36))*1.6));
 const op=Math.max(0.05,Math.min(1,(+($('draw-op')?.value||100))/100));
 const scatter=(+($('cb-scatter')?.value||35))/100*sz*1.2;
 const jitter=(+($('cb-jitter')?.value||45))/100*Math.PI;
 const tint=!!$('cb-tint')?.checked,col=$('draw-col1')?.value||'#ffffff';

 const stampCv=bc(sz,sz),sg=stampCv.getContext('2d');
 sg.drawImage(customBrushImg,0,0,sz,sz);
 if(tint){sg.globalCompositeOperation='source-in';sg.fillStyle=col;sg.fillRect(0,0,sz,sz)}

 const g=active.cv.getContext('2d',{willReadFrequently:true});
 const px=cx+(Math.random()-0.5)*scatter-active.x+active.cv.width/2;
 const py=cy+(Math.random()-0.5)*scatter-active.y+active.cv.height/2;
 g.save();g.globalAlpha=op;g.translate(px,py);g.rotate((Math.random()-0.5)*jitter);
 g.drawImage(stampCv,-sz/2,-sz/2);g.restore();
 active.d=g.getImageData(0,0,active.cv.width,active.cv.height);
 active.o=null;active.sil=null;active.gc=null;active.tnc=null;
}

c.addEventListener('pointerdown',e=>{
 if(!customBrushActive||tab!=='draw'||e.button!==0||!base)return;
 e.preventDefault();e.stopImmediatePropagation();
 pushU(mkSnap('p'));cbDown=true;c.setPointerCapture(e.pointerId);
 const cr=c.getBoundingClientRect(),x=(e.clientX-cr.left)*W/cr.width,y=(e.clientY-cr.top)*H/cr.height;
 cbLast=[x,y];stampCustomBrushAt(x,y);draw();
},true);
c.addEventListener('pointermove',e=>{
 if(!cbDown||!customBrushActive||!cbLast)return;
 e.preventDefault();e.stopImmediatePropagation();
 const cr=c.getBoundingClientRect(),x=(e.clientX-cr.left)*W/cr.width,y=(e.clientY-cr.top)*H/cr.height;
 const spacing=Math.max(6,+($('draw-size')?.value||36)*0.55);
 if(Math.hypot(x-cbLast[0],y-cbLast[1])>=spacing){cbLast=[x,y];stampCustomBrushAt(x,y);draw()}
},true);
c.addEventListener('pointerup',e=>{if(cbDown){cbDown=false;cbLast=null;refreshLayers();draw()}},true);

/* ========== 2. Public Plugin & Scripting API (window.TotoneAPI) ========== */
const PLUGINS_KEY='totone_plugins_v1';
const TotoneAPI={
 version:'5.4.0',
 toast:(msg,ms=1800)=>showToast(msg,ms),
 getDimensions:()=>({width:W,height:H,layers:layers.length}),
 setSlider:(id,val)=>{const el=$(id);if(el){el.value=val;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))}},
 openTab:(t)=>document.querySelector(`.tabs [data-t="${t}"]`)?.click(),
 applyGradePreset:(id)=>document.querySelector(`#lr-recipes [data-gpid="${id}"]`)?.click(),
 addLayerFromCanvas:(cv,name='Plugin Layer')=>{
  const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height);
  pushU(mkSnap('p'));
  const l={cv,d,o:null,lk:false,sh:null,ol:null,x:W/2,y:H/2,s:1,r:0,op:1,bm:'source-over',fl:false,vis:true,cl:0,ct:0,cr:0,cb:0,name};
  layers.push(l);active=l;refreshLayers();draw();return l;
 },
 runPixelEffect:(fn,layerName='Script Effect')=>{
  if(!base)return;
  render(false);const cv=bc(W,H),g=cv.getContext('2d',{willReadFrequently:true});
  g.drawImage(c,0,0);draw(true);
  const im=g.getImageData(0,0,W,H);
  fn(im.data,W,H);
  g.putImageData(im,0,0);
  TotoneAPI.addLayerFromCanvas(cv,layerName);
 },
 openExport:()=>$('export')?.click()
};
window.TotoneAPI=TotoneAPI;

const SAMPLE_MACROS={
 'neon-export':`// Apply Neon City Grade + Open Export Studio\nTotoneAPI.applyGradePreset('neon-city');\nTotoneAPI.toast('Applied Neon City macro!');`,
 'invert-red':`// Custom Pixel Script: Boost Warmth & Subtle Vignette\nTotoneAPI.runPixelEffect((d, w, h) => {\n  for (let i = 0; i < d.length; i += 4) {\n    d[i] = Math.min(255, d[i] * 1.12);\n    d[i+2] = d[i+2] * 0.9;\n  }\n}, 'Warm Script');`,
 'cinema-bars':`// Add 2.39:1 Cinema Letterbox Layer\nconst {width:w, height:h} = TotoneAPI.getDimensions();\nconst cv = document.createElement('canvas'); cv.width = w; cv.height = h;\nconst g = cv.getContext('2d'); g.fillStyle = '#000';\ng.fillRect(0, 0, w, h * 0.12); g.fillRect(0, h * 0.88, w, h * 0.12);\nTotoneAPI.addLayerFromCanvas(cv, 'Cinema Bars');`
};

function readPlugins(){try{return JSON.parse(localStorage.getItem(PLUGINS_KEY)||'[]')}catch{return[]}}
function writePlugins(a){try{localStorage.setItem(PLUGINS_KEY,JSON.stringify(a))}catch{}}
function renderPluginList(){
 const list=$('plug-list');if(!list)return;
 const arr=readPlugins();
 if(!arr.length){list.innerHTML='<p class="note">No saved plugins or macros yet.</p>';return}
 list.innerHTML=arr.map((p,i)=>`<div class="look-row"><span>${p.name}</span><button type="button" data-prun="${i}" class="pri">Run</button><button type="button" data-pdel="${i}">✕</button></div>`).join('');
}
function runUserScript(code){
 try{
  new Function('TotoneAPI',code)(TotoneAPI);
  if($('script-status'))$('script-status').textContent='Script executed cleanly!';
 }catch(err){
  if($('script-status'))$('script-status').textContent='Script error: '+err.message;
 }
}
$('script-preset')?.addEventListener('change',e=>{
 const code=SAMPLE_MACROS[e.target.value];
 if(code&&$('script-code'))$('script-code').value=code;
});
$('script-run')?.addEventListener('click',()=>runUserScript($('script-code')?.value||''));
$('script-save')?.addEventListener('click',()=>{
 const code=($('script-code')?.value||'').trim();if(!code)return;
 const name=($('script-name')?.value||'').trim()||`Macro ${readPlugins().length+1}`;
 const arr=readPlugins();arr.unshift({name,code});writePlugins(arr.slice(0,30));
 $('script-name').value='';renderPluginList();showToast('Saved script: '+name,1400);
});
$('plug-upload-btn')?.addEventListener('click',()=>$('plug-upload-file')?.click());
$('plug-upload-file')?.addEventListener('change',async e=>{
 const f=e.target.files?.[0];e.target.value='';if(!f)return;
 const code=await f.text(),name=f.name.replace(/\.js$/i,'');
 const arr=readPlugins();arr.unshift({name,code});writePlugins(arr.slice(0,30));
 renderPluginList();runUserScript(code);showToast('Installed & ran plugin: '+name,1600);
});
$('plug-list')?.addEventListener('click',e=>{
 const r=e.target.closest('[data-prun]'),d=e.target.closest('[data-pdel]');
 const arr=readPlugins();
 if(r&&arr[+r.dataset.prun])runUserScript(arr[+r.dataset.prun].code);
 else if(d){arr.splice(+d.dataset.pdel,1);writePlugins(arr);renderPluginList()}
});
renderPluginList();

/* ========== 3. SEO Landing Route Zero-Friction Auto-Launcher (?tool=...) ========== */
function popHandoff(){
 return new Promise(res=>{
  const req=indexedDB.open('totone_handoff_db',1);
  req.onupgradeneeded=e=>{if(!e.target.result.objectStoreNames.contains('handoff'))e.target.result.createObjectStore('handoff')};
  req.onsuccess=()=>{
   const db=req.result,tx=db.transaction('handoff','readwrite'),st=tx.objectStore('handoff');
   const get=st.get('pending');
   get.onsuccess=()=>{const val=get.result||null;if(val)st.delete('pending');res(val)};
   get.onerror=()=>res(null);
  };
  req.onerror=()=>res(null);
 });
}

function makeConcertSampleFile(){
 const cv=bc(960,720),g=cv.getContext('2d');
 const bg=g.createLinearGradient(0,0,960,720);bg.addColorStop(0,'#2a040c');bg.addColorStop(0.5,'#880818');bg.addColorStop(1,'#180208');
 g.fillStyle=bg;g.fillRect(0,0,960,720);
 // Red concert spotlight beams
 for(let i=0;i<3;i++){
  const gr=g.createRadialGradient(260+i*220,80,10,260+i*220,300,340);
  gr.addColorStop(0,'rgba(255,40,65,0.85)');gr.addColorStop(1,'rgba(255,0,30,0)');
  g.fillStyle=gr;g.fillRect(0,0,960,720);
 }
 // Stylized singer silhouette bathed in harsh red stage light
 g.fillStyle='#dc2626';g.beginPath();g.arc(480,290,98,0,Math.PI*2);g.fill();
 g.fillStyle='#b91c1c';g.beginPath();g.roundRect(365,390,230,330,80);g.fill();
 g.fillStyle='#f87171';g.beginPath();g.arc(452,265,34,0,Math.PI*2);g.fill();
 return toBlob(cv,'image/png').then(b=>new File([b],'concert-red-light-sample.png',{type:'image/png'}));
}

async function activateToolPreset(tool){
 if(tool==='discord'){
  $('export')?.click();
  setTimeout(()=>{
   if($('exf')){$('exf').value='webp';$('exf').dispatchEvent(new Event('change'))}
   document.querySelector('#ex-limit-presets [data-lim="10MB"]')?.click();
   showToast('Ready! Export is pre-set to Discord 10 MB max.',2600);
  },180);
 }else if(tool==='concert'){
  document.querySelector('.tabs [data-t="grade"]')?.click();
  setTimeout(()=>{
   $('pc-add')?.click();
   if($('pc-src')){$('pc-src').value='#dc2626';$('pc-src').dispatchEvent(new Event('input'))}
   document.querySelector('#pc-skin-presets [data-skin="#d99f7c"]')?.click();
   $('lr-point-color')?.scrollIntoView({block:'nearest',behavior:'smooth'});
   showToast('Point Color ready! Click "Pick colour in photo" or adjust Range.',2800);
  },220);
 }else if(tool==='psd'){
  document.querySelector('.tabs [data-t="layers"]')?.click();
  showToast('Photoshop .PSD loaded into Layers!',2200);
 }else if(tool==='rmbg'){
  document.querySelector('.tabs [data-t="ai"]')?.click();
  setTimeout(()=>{
   $('rmbg-smart')?.click();
   showToast('Running on-device AI Background Removal (RMBG-1.4)…',2600);
  },260);
 }else if(tool==='exif'){
  $('export')?.click();
  setTimeout(()=>{
   showToast('EXIF & GPS metadata are automatically stripped on export — click Save file!',3000);
  },180);
 }
}

(async function bootFromSeoRoute(){
 const params=new URLSearchParams(location.search);
 const tool=params.get('tool');if(!tool)return;
 const hasHandoff=params.get('handoff')==='1';
 const wantSample=params.get('sample')==='1';
 if(hasHandoff){
  const rec=await popHandoff();
  if(rec?.buf){
   const f=new File([rec.buf],rec.name||'image.png',{type:rec.type||'image/png'});
   if(tool==='psd'&&/\.psd$/i.test(f.name)){
    const dt=new DataTransfer();dt.items.add(f);
    const inp=$('psd-import-file');
    if(inp){inp.files=dt.files;inp.dispatchEvent(new Event('change'))}
    document.querySelector('.tabs [data-t="layers"]')?.click();
    return;
   }
   await load(f);
   activateToolPreset(tool);
   return;
  }
 }
 if(wantSample){
  if(tool==='concert'){
   await load(await makeConcertSampleFile());
   activateToolPreset(tool);
  }else{
   $('empty-sample')?.click();
   setTimeout(()=>activateToolPreset(tool),650);
  }
 }
})();
})();
