/* Totone Cutout Pro & 100x UX Suite — Live Erase/Restore/Soft-Edge Cutout Brush, Edge Choke/Grow, Instant Backdrop Swapper, 1-Click Develop Recipes, Layer Align/Fit Bar, Draggable On-Canvas Split Wipe & Zoom Navigator Minimap */
(function(){
/* ========== 1. Interactive Cutout Erase / Restore / Soft-Edge Brush ========== */
let tuMode='off',tuDown=false,tuLast=null,tuUndoStack=[],tuInspectBg='none';
const tuModesEl=$('rmbg-tu-modes'),tuOpts=$('rmbg-tu-opts'),tuSize=$('rmbg-tu-size'),tuSoft=$('rmbg-tu-soft');

function ensureEditableMaskLayer(){
 if(!base)return null;
 if(!active||active.lk){
  // Lift base photo into an editable layer automatically so Erase/Restore ALWAYS works immediately!
  const cv=bc(W,H);cv.getContext('2d').putImageData(base,0,0);
  const d=cv.getContext('2d',{willReadFrequently:true}).getImageData(0,0,W,H);
  pushU(mkSnap('p'));
  const l={cv,d,o:null,lk:false,sh:null,ol:null,x:W/2,y:H/2,s:1,r:0,op:1,bm:'source-over',fl:false,vis:true,cl:0,ct:0,cr:0,cb:0,name:'Subject Cutout'};
  layers.push(l);active=l;
 }
 if(!active.mask){
  const m=bc(active.cv.width,active.cv.height),mg=m.getContext('2d');
  mg.fillStyle='#ffffff';mg.fillRect(0,0,m.width,m.height);
  active.mask=m;active.maskEnabled=true;
 }
 active.maskEnabled=true;
 return active;
}

function setTouchupMode(mode){
 tuMode=mode;
 tuModesEl?.querySelectorAll('[data-tu]').forEach(b=>b.classList.toggle('on',b.dataset.tu===mode));
 if(tuOpts)tuOpts.hidden=mode==='off';
 if(mode!=='off'){
  if(!base){showToast('Open an image first',1400);setTouchupMode('off');return}
  ensureEditableMaskLayer();
  refreshLayers();draw();
  const label=mode==='erase'?'Erase Brush — paint to remove background':mode==='restore'?'Restore Brush — paint back missing areas':'Soft Edge Brush — smooth hair & edges';
  if($('rmbg-status'))$('rmbg-status').textContent=label;
  c.style.cursor='none';
 }else{
  c.style.cursor='';
  const ring=$('ring');if(ring)ring.style.display='none';
  if(tuInspectBg!=='none'){tuInspectBg='none';if($('rmbg-tu-bg'))$('rmbg-tu-bg').value='none';applyInspectBackdrop()}
 }
}

tuModesEl?.addEventListener('click',e=>{
 const b=e.target.closest('[data-tu]');if(!b)return;
 setTouchupMode(b.dataset.tu);
});
tuSize?.addEventListener('input',e=>{e.target.nextElementSibling.value=e.target.value+' px'});
tuSoft?.addEventListener('input',e=>{e.target.nextElementSibling.value=e.target.value+'%'});

function applyInspectBackdrop(){
 if(tuInspectBg==='none'){
  c.style.background='';
 }else{
  c.style.background=tuInspectBg;
 }
}
$('rmbg-tu-bg')?.addEventListener('change',e=>{
 tuInspectBg=e.target.value;applyInspectBackdrop();
});

function canvasPointToLayer(clientX,clientY,l){
 const cr=c.getBoundingClientRect();
 const cx=(clientX-cr.left)*W/cr.width;
 const cy=(clientY-cr.top)*H/cr.height;
 if(typeof layerMatrix==='function'){
  const inv=layerMatrix(l).inverse();
  const pt=inv.transformPoint(new DOMPoint(cx,cy));
  return [pt.x,pt.y];
 }
 return [cx-l.x+l.cv.width/2,cy-l.y+l.cv.height/2];
}

function stampMaskDab(l,lx,ly){
 const m=l.mask;if(!m)return;
 const mg=m.getContext('2d',{willReadFrequently:true});
 const rad=(+(tuSize?.value||34))/Math.max(0.15,l.s||1);
 const soft=(+(tuSoft?.value||40))/100;
 if(tuMode==='soft'){
  const bx=Math.max(0,Math.floor(lx-rad)),by=Math.max(0,Math.floor(ly-rad));
  const bw=Math.min(m.width-bx,Math.ceil(rad*2)),bh=Math.min(m.height-by,Math.ceil(rad*2));
  if(bw<2||bh<2)return;
  const tmp=bc(bw,bh),tg=tmp.getContext('2d');
  tg.filter=`blur(${Math.max(1.5,rad*0.14)}px)`;
  tg.drawImage(m,bx,by,bw,bh,0,0,bw,bh);
  mg.save();mg.beginPath();mg.arc(lx,ly,rad,0,Math.PI*2);mg.clip();
  mg.globalCompositeOperation='copy';
  mg.drawImage(tmp,bx,by);
  mg.restore();
  return;
 }
 mg.save();
 mg.globalCompositeOperation=tuMode==='erase'?'destination-out':'source-over';
 const inner=Math.max(0,rad*(1-soft));
 const gr=mg.createRadialGradient(lx,ly,inner,lx,ly,rad);
 gr.addColorStop(0,'rgba(255,255,255,1)');
 gr.addColorStop(1,'rgba(255,255,255,0)');
 mg.fillStyle=gr;
 mg.beginPath();mg.arc(lx,ly,rad,0,Math.PI*2);mg.fill();
 mg.restore();
}

function pushMaskUndo(l){
 if(!l?.mask)return;
 const snap=bc(l.mask.width,l.mask.height);
 snap.getContext('2d').drawImage(l.mask,0,0);
 if(tuUndoStack.length>=20)tuUndoStack.shift();
 tuUndoStack.push(snap);
}

function updateTouchupRing(e){
 const ring=$('ring');if(!ring)return;
 if(tuMode==='off'||!base){return}
 const cr=c.getBoundingClientRect();
 const screenRad=(+(tuSize?.value||34))*(cr.width/Math.max(1,W));
 const d=Math.max(8,screenRad*2);
 ring.style.display='block';
 ring.style.width=d+'px';ring.style.height=d+'px';
 ring.style.left=(e.clientX-d/2)+'px';ring.style.top=(e.clientY-d/2)+'px';
 ring.style.borderColor=tuMode==='erase'?'#f43f5e':tuMode==='restore'?'#10b981':'#38bdf8';
}

c.addEventListener('pointerdown',e=>{
 if(tuMode==='off'||e.button!==0||!base)return;
 e.preventDefault();e.stopImmediatePropagation();
 const l=ensureEditableMaskLayer();if(!l)return;
 pushMaskUndo(l);pushU(mkSnap('p'));
 tuDown=true;c.setPointerCapture(e.pointerId);
 const [lx,ly]=canvasPointToLayer(e.clientX,e.clientY,l);
 tuLast=[lx,ly];stampMaskDab(l,lx,ly);draw();
},true);

c.addEventListener('pointermove',e=>{
 if(tuMode==='off')return;
 updateTouchupRing(e);
 if(!tuDown||!active?.mask||!tuLast)return;
 e.preventDefault();e.stopImmediatePropagation();
 const [lx,ly]=canvasPointToLayer(e.clientX,e.clientY,active);
 const dist=Math.hypot(lx-tuLast[0],ly-tuLast[1]);
 const step=Math.max(2,(+(tuSize?.value||34))*0.18/Math.max(0.15,active.s||1));
 const steps=Math.max(1,Math.ceil(dist/step));
 for(let i=1;i<=steps;i++)stampMaskDab(active,tuLast[0]+(lx-tuLast[0])*i/steps,tuLast[1]+(ly-tuLast[1])*i/steps);
 tuLast=[lx,ly];draw();
},true);

c.addEventListener('pointerup',e=>{
 if(tuMode==='off'||!tuDown)return;
 e.stopImmediatePropagation();
 tuDown=false;tuLast=null;refreshLayers();draw();
},true);

c.addEventListener('pointerleave',()=>{if(tuMode!=='off'&&$('ring'))$('ring').style.display='none'});

// Keyboard shortcuts while Erase/Restore brush is active: X flips Erase <-> Restore, [ ] changes size, Esc exits
window.addEventListener('keydown',e=>{
 if(tuMode==='off'||/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||''))return;
 const k=e.key.toLowerCase();
 if(k==='x'){e.preventDefault();setTouchupMode(tuMode==='erase'?'restore':'erase');showToast(tuMode==='erase'?'Switched to Erase':'Switched to Restore',800)}
 else if(k==='['){e.preventDefault();tuSize.value=Math.max(4,+tuSize.value-8);tuSize.dispatchEvent(new Event('input'))}
 else if(k===']'){e.preventDefault();tuSize.value=Math.min(180,+tuSize.value+8);tuSize.dispatchEvent(new Event('input'))}
 else if(e.key==='Escape'){setTouchupMode('off')}
});

$('rmbg-tu-undo')?.addEventListener('click',()=>{
 const prev=tuUndoStack.pop();if(!prev||!active?.mask)return;
 const mg=active.mask.getContext('2d');
 mg.clearRect(0,0,active.mask.width,active.mask.height);
 mg.drawImage(prev,0,0);refreshLayers();draw();showToast('Undid mask brush stroke',900);
});

$('rmbg-tu-invert')?.addEventListener('click',()=>{
 const l=ensureEditableMaskLayer();if(!l?.mask)return;
 pushMaskUndo(l);pushU(mkSnap('p'));
 const mg=l.mask.getContext('2d',{willReadFrequently:true}),im=mg.getImageData(0,0,l.mask.width,l.mask.height),d=im.data;
 for(let i=0;i<d.length;i+=4){d[i]=d[i+1]=d[i+2]=255;d[i+3]=255-d[i+3]}
 mg.putImageData(im,0,0);refreshLayers();draw();showToast('Inverted cutout mask!',1100);
});

function morphMaskEdge(dir){
 const l=ensureEditableMaskLayer();if(!l?.mask)return;
 pushMaskUndo(l);pushU(mkSnap('p'));
 const w=l.mask.width,h=l.mask.height,mg=l.mask.getContext('2d',{willReadFrequently:true});
 const im=mg.getImageData(0,0,w,h),src=new Uint8Array(w*h);
 for(let i=0;i<src.length;i++)src[i]=im.data[i*4+3];
 const d=im.data;
 for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
  const idx=y*w+x;
  let val=src[idx];
  const n1=src[idx-1],n2=src[idx+1],n3=src[idx-w],n4=src[idx+w];
  val=dir<0?Math.min(val,n1,n2,n3,n4):Math.max(val,n1,n2,n3,n4);
  d[idx*4]=d[idx*4+1]=d[idx*4+2]=255;d[idx*4+3]=val;
 }
 mg.putImageData(im,0,0);refreshLayers();draw();
 showToast(dir<0?'Shrunk cutout edge 1px':'Expanded cutout edge 1px',900);
}
$('rmbg-tu-shrink')?.addEventListener('click',()=>morphMaskEdge(-1));
$('rmbg-tu-grow')?.addEventListener('click',()=>morphMaskEdge(1));

// Auto-turn off touchup mode if user leaves AI tab
document.querySelector('.tabs')?.addEventListener('click',e=>{
 const tb=e.target.closest('[data-t]');
 if(tb&&tb.dataset.t!=='ai'&&tuMode!=='off')setTouchupMode('off');
});

/* ========== 2. Instant Cutout Background Swapper Studio ========== */
const BG_SWATCHES=[
 {label:'Pure White',type:'solid',c1:'#ffffff'},
 {label:'Studio Gray',type:'solid',c1:'#e2e8f0'},
 {label:'Pitch Black',type:'solid',c1:'#050811'},
 {label:'Passport Blue',type:'solid',c1:'#2563eb'},
 {label:'Soft Rose',type:'solid',c1:'#fbcfe8'},
 {label:'Sage',type:'solid',c1:'#a7f3d0'},
 {label:'Sunset Aura',type:'grad',c1:'#f43f5e',c2:'#fb923c'},
 {label:'Cyber Navy',type:'grad',c1:'#050c1f',c2:'#1d4ed8'},
 {label:'Frutiger Sky',type:'grad',c1:'#38bdf8',c2:'#a3e635'},
 {label:'Neon Vapor',type:'grad',c1:'#6366f1',c2:'#ec4899'},
 {label:'Golden Peach',type:'grad',c1:'#fef08a',c2:'#f97316'},
 {label:'Emerald Mist',type:'grad',c1:'#064e3b',c2:'#14b8a6'}
];

function insertBackdropLayer(cv,name){
 const d=cv.getContext('2d',{willReadFrequently:true}).getImageData(0,0,cv.width,cv.height);
 pushU(mkSnap('p'));
 const l={cv,d,o:null,lk:false,sh:null,ol:null,x:W/2,y:H/2,s:1,r:0,op:1,bm:'source-over',fl:false,vis:true,cl:0,ct:0,cr:0,cb:0,name};
 // Place directly behind the active cutout layer!
 const idx=active?Math.max(0,layers.indexOf(active)):0;
 layers.splice(idx,0,l);
 refreshLayers();draw();
 showToast('Swapped background: '+name,1300);
}

const swBox=$('rmbg-bg-swatches');
if(swBox){
 swBox.innerHTML=BG_SWATCHES.map((s,i)=>`<button type="button" data-bgi="${i}" title="${s.label}" style="background:${s.type==='solid'?s.c1:`linear-gradient(135deg,${s.c1},${s.c2})`}"></button>`).join('');
 swBox.onclick=e=>{
  const b=e.target.closest('[data-bgi]');if(!b||!base)return;
  const s=BG_SWATCHES[+b.dataset.bgi],cv=bc(W,H),g=cv.getContext('2d');
  if(s.type==='solid'){g.fillStyle=s.c1}
  else{const gr=g.createLinearGradient(0,0,W,H);gr.addColorStop(0,s.c1);gr.addColorStop(1,s.c2);g.fillStyle=gr}
  g.fillRect(0,0,W,H);
  insertBackdropLayer(cv,s.label);
 };
}

$('rmbg-bg-blur')?.addEventListener('click',()=>{
 if(!base)return;
 const src=bc(W,H);src.getContext('2d').putImageData(base,0,0);
 const cv=bc(W,H),g=cv.getContext('2d');
 g.filter=`blur(${Math.max(10,Math.round(Math.min(W,H)*0.018))}px)`;
 g.drawImage(src,-24,-24,W+48,H+48);
 insertBackdropLayer(cv,'Blurred Bokeh Backdrop');
});
$('rmbg-bg-photo')?.addEventListener('click',()=>$('rmbg-bg-file')?.click());
$('rmbg-bg-file')?.addEventListener('change',e=>{
 const f=e.target.files?.[0];e.target.value='';if(!f||!base)return;
 const img=new Image(),u=URL.createObjectURL(f);
 img.onload=()=>{
  URL.revokeObjectURL(u);
  const cv=bc(W,H),g=cv.getContext('2d');
  const sc=Math.max(W/img.naturalWidth,H/img.naturalHeight);
  const dw=img.naturalWidth*sc,dh=img.naturalHeight*sc;
  g.drawImage(img,(W-dw)/2,(H-dh)/2,dw,dh);
  insertBackdropLayer(cv,'Photo Backdrop');
 };
 img.src=u;
});
$('rmbg-bg-close')?.addEventListener('click',()=>{$('rmbg-bg-studio').hidden=true});

// Wire #rmbg-next quick buttons to our upgraded tools!
$('rmbg-next')?.addEventListener('click',e=>{
 const b=e.target.closest('[data-rn]');if(!b)return;
 const k=b.dataset.rn;
 if(k==='outline'){e.stopImmediatePropagation();window.openProStudioTab?.('layerfx');$('lfx-preset-sticker')?.click()}
 else if(k==='shadow'){e.stopImmediatePropagation();window.openProStudioTab?.('layerfx');$('lfx-preset-float')?.click()}
 else if(k==='swapbg'){e.stopImmediatePropagation();$('rmbg-bg-studio').hidden=false}
 else if(k==='trim'){e.stopImmediatePropagation();window.runSmartAutoTrim?.()}
},true);

/* ========== 3. 24 Cinema Grade Presets (Calibrated Basic Develop + 3-Way Color Grading Wheels + Live Intensity) ========== */
const GRADE_PRESETS=[
 // Night & Neon
 {id:'neon-city',name:'Neon City',sub:'Electric Cyan & Magenta',cat:'neon',sw:'linear-gradient(90deg,#0a194e,#22d3ee,#ec4899)',
  b:{temp:-14,tint:16,exp:0.05,con:22,hi:-14,sh:12,wh:14,bl:-14,cla:22,deh:10,vib:32,sat:6},
  z:{shadows:{hue:215,sat:52,lum:-6},midtones:{hue:312,sat:28,lum:0},highlights:{hue:188,sat:34,lum:6}},mix:78,bal:-10},
 {id:'tokyo-rain',name:'Tokyo Rain',sub:'Teal Asphalt & Sodium Gold',cat:'neon',sw:'linear-gradient(90deg,#082f49,#06b6d4,#f59e0b)',
  b:{temp:-10,tint:-4,exp:-0.05,con:20,hi:-18,sh:16,wh:8,bl:-12,cla:18,deh:14,vib:20,sat:-4},
  z:{shadows:{hue:202,sat:58,lum:-8},midtones:{hue:196,sat:18,lum:0},highlights:{hue:36,sat:46,lum:6}},mix:80,bal:-6},
 {id:'cyber-2099',name:'Cyberpunk 2099',sub:'Ultraviolet & Hot Aqua',cat:'neon',sw:'linear-gradient(90deg,#1e1b4b,#a855f7,#22d3ee)',
  b:{temp:-18,tint:22,exp:0.05,con:28,hi:-12,sh:8,wh:16,bl:-16,cla:26,deh:12,vib:36,sat:10},
  z:{shadows:{hue:268,sat:54,lum:-6},midtones:{hue:324,sat:32,lum:0},highlights:{hue:182,sat:44,lum:8}},mix:84,bal:0},
 {id:'midnight-drive',name:'Midnight Drive',sub:'Indigo Night & Crimson Glow',cat:'neon',sw:'linear-gradient(90deg,#090d28,#3730a3,#e11d48)',
  b:{temp:-16,tint:8,exp:-0.15,con:24,hi:-20,sh:6,wh:8,bl:-18,cla:16,deh:14,vib:18,sat:-6},
  z:{shadows:{hue:228,sat:52,lum:-10},midtones:{hue:350,sat:24,lum:-2},highlights:{hue:206,sat:20,lum:4}},mix:76,bal:-14},
 {id:'vapor-dusk',name:'Vaporwave Dusk',sub:'Violet Haze & Pink Sunset',cat:'neon',sw:'linear-gradient(90deg,#312e81,#c084fc,#fb7185)',
  b:{temp:-6,tint:20,exp:0.12,con:-4,hi:-16,sh:20,wh:8,bl:16,cla:6,deh:-8,vib:24,sat:4},
  z:{shadows:{hue:254,sat:44,lum:4},midtones:{hue:304,sat:22,lum:2},highlights:{hue:338,sat:44,lum:6}},mix:74,bal:10},
 // Nature & Earth
 {id:'warm-forest',name:'Warm Forest',sub:'Deep Pine & Golden Sun',cat:'nature',sw:'linear-gradient(90deg,#064e3b,#15803d,#f59e0b)',
  b:{temp:16,tint:-4,exp:0.05,con:14,hi:-20,sh:18,wh:6,bl:10,cla:12,deh:6,vib:18,sat:-4},
  z:{shadows:{hue:152,sat:40,lum:-8},midtones:{hue:95,sat:14,lum:0},highlights:{hue:42,sat:46,lum:6}},mix:78,bal:6},
 {id:'emerald-moody',name:'Emerald Moody',sub:'Nordic Moss & Deep Shadows',cat:'nature',sw:'linear-gradient(90deg,#052e16,#0f766e,#a7f3d0)',
  b:{temp:-6,tint:-10,exp:-0.1,con:18,hi:-22,sh:8,wh:4,bl:-12,cla:16,deh:10,vib:10,sat:-16},
  z:{shadows:{hue:164,sat:48,lum:-12},midtones:{hue:150,sat:22,lum:-4},highlights:{hue:48,sat:16,lum:2}},mix:80,bal:-12},
 {id:'golden-coast',name:'Golden Coast',sub:'Sunlit Amber & Aqua Surf',cat:'nature',sw:'linear-gradient(90deg,#0e7490,#38bdf8,#fbbf24)',
  b:{temp:20,tint:4,exp:0.15,con:10,hi:-22,sh:20,wh:10,bl:6,cla:10,deh:4,vib:22,sat:4},
  z:{shadows:{hue:188,sat:32,lum:-2},midtones:{hue:36,sat:16,lum:2},highlights:{hue:38,sat:48,lum:6}},mix:74,bal:10},
 {id:'autumn-woods',name:'Autumn Woods',sub:'Copper Leaves & Espresso',cat:'nature',sw:'linear-gradient(90deg,#451a03,#c2410c,#facc15)',
  b:{temp:24,tint:8,exp:0.05,con:16,hi:-18,sh:14,wh:8,bl:4,cla:14,deh:6,vib:20,sat:2},
  z:{shadows:{hue:24,sat:36,lum:-8},midtones:{hue:28,sat:38,lum:0},highlights:{hue:44,sat:40,lum:4}},mix:76,bal:4},
 {id:'nordic-frost',name:'Nordic Frost',sub:'Glacier Blue & Crisp Ice',cat:'nature',sw:'linear-gradient(90deg,#1e3a8a,#60a5fa,#e0f2fe)',
  b:{temp:-22,tint:-4,exp:0.1,con:14,hi:-12,sh:16,wh:16,bl:-4,cla:16,deh:8,vib:12,sat:-14},
  z:{shadows:{hue:210,sat:44,lum:-4},midtones:{hue:204,sat:16,lum:0},highlights:{hue:198,sat:22,lum:6}},mix:72,bal:-6},
 {id:'desert-sunset',name:'Desert Sunset',sub:'Terracotta & Rose Gold',cat:'nature',sw:'linear-gradient(90deg,#7c2d12,#fb7185,#fde047)',
  b:{temp:28,tint:10,exp:0.08,con:14,hi:-24,sh:18,wh:10,bl:6,cla:12,deh:4,vib:24,sat:4},
  z:{shadows:{hue:18,sat:40,lum:-6},midtones:{hue:22,sat:24,lum:0},highlights:{hue:34,sat:54,lum:8}},mix:78,bal:8},
 {id:'oceanic-deep',name:'Oceanic Deep',sub:'Abyssal Teal & Seafoam',cat:'nature',sw:'linear-gradient(90deg,#042f2e,#0284c7,#5eead4)',
  b:{temp:-16,tint:-8,exp:0,con:18,hi:-16,sh:10,wh:10,bl:-10,cla:16,deh:12,vib:18,sat:-4},
  z:{shadows:{hue:194,sat:54,lum:-10},midtones:{hue:178,sat:30,lum:-2},highlights:{hue:168,sat:20,lum:4}},mix:78,bal:-8},
 // Cinema & Film
 {id:'teal-orange',name:'Teal & Orange',sub:'Hollywood Blockbuster',cat:'cinema',sw:'linear-gradient(90deg,#0f4c5c,#0891b2,#f97316)',
  b:{temp:8,tint:2,exp:0.05,con:22,hi:-18,sh:14,wh:12,bl:-10,cla:18,deh:10,vib:20,sat:0},
  z:{shadows:{hue:194,sat:56,lum:-6},midtones:{hue:26,sat:14,lum:0},highlights:{hue:30,sat:48,lum:6}},mix:84,bal:0},
 {id:'blade-amber',name:'Dune / Blade Amber',sub:'Smoky Charcoal & Gold',cat:'cinema',sw:'linear-gradient(90deg,#1c1917,#b45309,#fcd34d)',
  b:{temp:26,tint:4,exp:-0.05,con:26,hi:-20,sh:6,wh:8,bl:-14,cla:20,deh:16,vib:14,sat:-8},
  z:{shadows:{hue:200,sat:28,lum:-14},midtones:{hue:32,sat:34,lum:-2},highlights:{hue:36,sat:64,lum:6}},mix:86,bal:6},
 {id:'a24-green',name:'A24 Indie Film',sub:'Wong Kar-Wai Olive & Cream',cat:'cinema',sw:'linear-gradient(90deg,#14532d,#4d7c0f,#fef3c7)',
  b:{temp:6,tint:-12,exp:0,con:10,hi:-18,sh:14,wh:4,bl:18,cla:10,deh:4,vib:8,sat:-12},
  z:{shadows:{hue:142,sat:38,lum:-4},midtones:{hue:128,sat:14,lum:0},highlights:{hue:44,sat:28,lum:4}},mix:76,bal:-4},
 {id:'portra-400',name:'Kodak Portra 400',sub:'Warm Peach Skin & Matte',cat:'cinema',sw:'linear-gradient(90deg,#334155,#d99f7c,#fef3c7)',
  b:{temp:10,tint:4,exp:0.12,con:6,hi:-22,sh:20,wh:6,bl:14,cla:4,deh:-4,vib:14,sat:-8},
  z:{shadows:{hue:212,sat:16,lum:2},midtones:{hue:32,sat:16,lum:2},highlights:{hue:36,sat:28,lum:4}},mix:68,bal:8},
 {id:'fuji-velvia',name:'Fuji Velvia Lush',sub:'Vivid Slide Film Punch',cat:'cinema',sw:'linear-gradient(90deg,#1e3a8a,#16a34a,#f59e0b)',
  b:{temp:4,tint:4,exp:0.05,con:22,hi:-14,sh:10,wh:14,bl:-10,cla:14,deh:10,vib:34,sat:14},
  z:{shadows:{hue:204,sat:28,lum:-6},midtones:{hue:140,sat:12,lum:0},highlights:{hue:44,sat:24,lum:6}},mix:70,bal:0},
 {id:'vintage-78',name:'Vintage 1978',sub:'Sun-Faded Retro Print',cat:'cinema',sw:'linear-gradient(90deg,#134e4a,#d97706,#fef08a)',
  b:{temp:16,tint:2,exp:0.08,con:-6,hi:-16,sh:18,wh:-4,bl:24,cla:-4,deh:-6,vib:6,sat:-18},
  z:{shadows:{hue:174,sat:32,lum:4},midtones:{hue:38,sat:20,lum:2},highlights:{hue:42,sat:44,lum:4}},mix:78,bal:6},
 // Portrait & Clean
 {id:'natural-pop',name:'Natural Pop',sub:'Crisp Balanced Editorial',cat:'portrait',sw:'linear-gradient(90deg,#1e293b,#64748b,#f8fafc)',
  b:{temp:4,tint:0,exp:0.15,con:14,hi:-16,sh:18,wh:12,bl:-4,cla:10,deh:4,vib:18,sat:2},
  z:{shadows:{hue:210,sat:8,lum:-2},midtones:{hue:34,sat:6,lum:0},highlights:{hue:40,sat:10,lum:4}},mix:50,bal:0},
 {id:'dreamy-pastel',name:'Dreamy Pastel',sub:'Airy Rose & Lavender',cat:'portrait',sw:'linear-gradient(90deg,#818cf8,#f9a8d4,#fff1f2)',
  b:{temp:6,tint:12,exp:0.22,con:-10,hi:-18,sh:24,wh:10,bl:20,cla:-6,deh:-10,vib:14,sat:-8},
  z:{shadows:{hue:248,sat:22,lum:6},midtones:{hue:332,sat:14,lum:4},highlights:{hue:348,sat:26,lum:6}},mix:68,bal:12},
 {id:'parisian-matte',name:'Parisian Matte',sub:'Soft Editorial Charcoal',cat:'portrait',sw:'linear-gradient(90deg,#292524,#78716c,#f5f5f4)',
  b:{temp:8,tint:2,exp:0.1,con:8,hi:-20,sh:16,wh:4,bl:22,cla:8,deh:0,vib:4,sat:-20},
  z:{shadows:{hue:28,sat:18,lum:2},midtones:{hue:34,sat:10,lum:0},highlights:{hue:40,sat:22,lum:4}},mix:64,bal:4},
 {id:'concert-fix',name:'Concert Red Fix',sub:'Rescue Red Stage Lights',cat:'portrait',sw:'linear-gradient(90deg,#991b1b,#14b8a6,#f0c3a6)',
  b:{temp:-24,tint:-20,exp:0.2,con:10,hi:-26,sh:30,wh:8,bl:4,cla:10,deh:6,vib:16,sat:-14},
  z:{shadows:{hue:190,sat:24,lum:2},midtones:{hue:178,sat:28,lum:4},highlights:{hue:44,sat:14,lum:2}},mix:64,bal:0},
 // B&W
 {id:'silver-noir',name:'Silver Noir',sub:'Dramatic Leica B&W',cat:'bw',sw:'linear-gradient(90deg,#020617,#475569,#f8fafc)',
  b:{temp:0,tint:0,exp:0.05,con:32,hi:-10,sh:8,wh:18,bl:-18,cla:26,deh:12,vib:0,sat:-100},
  z:{shadows:{hue:212,sat:12,lum:-6},midtones:{hue:0,sat:0,lum:0},highlights:{hue:208,sat:8,lum:6}},mix:55,bal:0},
 {id:'sepia-film',name:'Warm Sepia Film',sub:'Archival Darkroom Print',cat:'bw',sw:'linear-gradient(90deg,#292018,#78593c,#f5e6d3)',
  b:{temp:12,tint:2,exp:0.08,con:18,hi:-14,sh:16,wh:6,bl:14,cla:12,deh:4,vib:0,sat:-100},
  z:{shadows:{hue:28,sat:22,lum:-2},midtones:{hue:34,sat:20,lum:2},highlights:{hue:38,sat:30,lum:4}},mix:78,bal:6}
];

let activeGradePreset=null,activeGradeCat='all';
const recBar=$('lr-recipes'),gpInt=$('gp-intensity'),gpIntOut=$('gp-int-out');

function applyGradePreset(preset,scale=1,announce=false){
 const keys=['temp','tint','exp','con','hi','sh','wh','bl','tex','cla','deh','vib','sat'];
 keys.forEach(k=>{
  const el=$('lr-'+k);if(!el)return;
  let v=(preset?.b?.[k]??0);
  // Keep B&W full desaturation crisp when sat === -100
  if(k==='sat'&&v===-100)v=scale>0?-100:0;
  else v=k==='exp'?+(v*scale).toFixed(2):Math.round(v*scale);
  el.value=v;
  el.dispatchEvent(new Event('input',{bubbles:true}));
 });
 if($('grading-on')){$('grading-on').checked=true;$('grading-on').dispatchEvent(new Event('change'))}
 const z=preset?.z||{};
 ['shadows','midtones','highlights'].forEach(zn=>{
  const cfg=z[zn]||{hue:0,sat:0,lum:0};
  film?.setZone?.(zn,{hue:cfg.hue||0,sat:Math.min(100,Math.round((cfg.sat||0)*scale)),lum:Math.round((cfg.lum||0)*scale)},false);
 });
 film?.setGradeProp?.('mix',preset?Math.min(100,Math.round((preset.mix??70)*scale)):100,false);
 film?.setGradeProp?.('balance',preset?Math.round((preset.bal??0)*scale):0,true);
 if(announce&&preset)showToast(`Grade: ${preset.name}`,1200);
}

function renderGradePresetGrid(){
 if(!recBar)return;
 const shown=GRADE_PRESETS.filter(p=>activeGradeCat==='all'||p.cat===activeGradeCat);
 recBar.innerHTML=shown.map(p=>`<button type="button" class="gp-card${activeGradePreset?.id===p.id?' on':''}" data-gpid="${p.id}"><span class="gp-swatch" style="background:${p.sw}"></span><strong>${p.name}</strong><small>${p.sub}</small></button>`).join('');
}

$('gp-cats')?.addEventListener('click',e=>{
 const b=e.target.closest('[data-gc]');if(!b)return;
 activeGradeCat=b.dataset.gc;
 document.querySelectorAll('#gp-cats button').forEach(x=>x.classList.toggle('on',x===b));
 renderGradePresetGrid();
});

recBar?.addEventListener('click',e=>{
 const b=e.target.closest('[data-gpid]');if(!b)return;
 const p=GRADE_PRESETS.find(x=>x.id===b.dataset.gpid);if(!p)return;
 activeGradePreset=p;
 const sc=(+(gpInt?.value||100))/100;
 renderGradePresetGrid();
 applyGradePreset(p,sc,true);
});

gpInt?.addEventListener('input',()=>{
 if(gpIntOut)gpIntOut.textContent=gpInt.value+'%';
 if(activeGradePreset)applyGradePreset(activeGradePreset,(+gpInt.value)/100,false);
});

$('gp-reset')?.addEventListener('click',()=>{
 activeGradePreset=null;
 if(gpInt){gpInt.value='100';if(gpIntOut)gpIntOut.textContent='100%'}
 applyGradePreset(null,0,false);
 renderGradePresetGrid();
 showToast('Reset Grade preset & wheels',1100);
});

renderGradePresetGrid();

/* ========== 4. Figma/Canva Layer Alignment & Fit Bar ========== */
$('layer-align-bar')?.addEventListener('click',e=>{
 const b=e.target.closest('[data-al]');if(!b)return;
 if(!active||!base){showToast('Select a layer first',1200);return}
 if(active.lk){showToast('Layer is locked',1100);return}
 const lw=active.cv.width*(1-active.cl-active.cr)*active.s;
 const lh=active.cv.height*(1-active.ct-active.cb)*active.s;
 pushU(mkSnap('p'));
 const k=b.dataset.al;
 if(k==='left')active.x=lw/2;
 else if(k==='cx')active.x=W/2;
 else if(k==='right')active.x=W-lw/2;
 else if(k==='top')active.y=lh/2;
 else if(k==='cy')active.y=H/2;
 else if(k==='bottom')active.y=H-lh/2;
 else if(k==='fit'){active.s=Math.min(W/active.cv.width,H/active.cv.height);active.x=W/2;active.y=H/2;active.r=0}
 else if(k==='fill'){active.s=Math.max(W/active.cv.width,H/active.cv.height);active.x=W/2;active.y=H/2;active.r=0}
 refreshLayers();draw();
});

/* ========== 5. Interactive On-Canvas Draggable Split-Screen Wipe Handle ========== */
const splChk=$('spl'),splRng=$('spr'),splHandle=$('split-handle');
let splDragging=false;
function positionSplitHandle(){
 if(!splHandle||!splChk?.checked||!base){if(splHandle)splHandle.hidden=true;return}
 const cr=c.getBoundingClientRect();
 if(!cr.width){splHandle.hidden=true;return}
 const pct=(+(splRng?.value||50))/100;
 splHandle.hidden=false;
 splHandle.style.left=(cr.left+cr.width*pct)+'px';
 splHandle.style.top=(cr.top+cr.height/2)+'px';
}
splHandle?.addEventListener('pointerdown',e=>{
 splDragging=true;splHandle.setPointerCapture(e.pointerId);e.preventDefault();
});
window.addEventListener('pointermove',e=>{
 if(!splDragging||!splRng)return;
 const cr=c.getBoundingClientRect();
 const pct=Math.max(1,Math.min(99,Math.round((e.clientX-cr.left)/cr.width*100)));
 splRng.value=String(pct);
 splRng.dispatchEvent(new Event('input',{bubbles:true}));
 positionSplitHandle();
});
window.addEventListener('pointerup',()=>{splDragging=false});
splChk?.addEventListener('change',positionSplitHandle);
splRng?.addEventListener('input',positionSplitHandle);

/* ========== 6. Zoom Navigator Minimap (Auto-Shows When Zoomed In) ========== */
const miniWrap=$('nav-minimap'),miniCv=$('nav-mini-cv'),miniBox=$('nav-mini-box');
let miniDrag=false;

function updateNavigatorMinimap(){
 if(!miniWrap||!miniCv||!miniBox||!base||!stage){if(miniWrap)miniWrap.hidden=true;return}
 const overflowX=stage.scrollWidth>stage.clientWidth+18;
 const overflowY=stage.scrollHeight>stage.clientHeight+18;
 if(!overflowX&&!overflowY){miniWrap.hidden=true;return}
 miniWrap.hidden=false;
 const mw=144,mh=Math.max(36,Math.min(108,Math.round(144*H/Math.max(1,W))));
 if(miniCv.width!==mw||miniCv.height!==mh){miniCv.width=mw;miniCv.height=mh}
 miniCv.getContext('2d').drawImage(c,0,0,mw,mh);
 const cr=c.getBoundingClientRect(),sr=stage.getBoundingClientRect();
 const visL=Math.max(0,(sr.left-cr.left)/cr.width);
 const visT=Math.max(0,(sr.top-cr.top)/cr.height);
 const visW=Math.min(1,sr.width/cr.width);
 const visH=Math.min(1,sr.height/cr.height);
 miniBox.style.left=(4+visL*mw)+'px';
 miniBox.style.top=(4+visT*mh)+'px';
 miniBox.style.width=Math.max(14,visW*mw)+'px';
 miniBox.style.height=Math.max(10,visH*mh)+'px';
}

function panStageFromMini(e){
 const r=miniCv.getBoundingClientRect();
 const fx=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));
 const fy=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));
 stage.scrollLeft=fx*stage.scrollWidth-stage.clientWidth/2;
 stage.scrollTop=fy*stage.scrollHeight-stage.clientHeight/2;
 updateNavigatorMinimap();
}
miniWrap?.addEventListener('pointerdown',e=>{miniDrag=true;miniWrap.setPointerCapture(e.pointerId);panStageFromMini(e)});
miniWrap?.addEventListener('pointermove',e=>{if(miniDrag)panStageFromMini(e)});
miniWrap?.addEventListener('pointerup',()=>{miniDrag=false});
stage?.addEventListener('scroll',()=>{positionSplitHandle();updateNavigatorMinimap()});
window.addEventListener('resize',()=>{positionSplitHandle();updateNavigatorMinimap()});

const origDrawCutout=draw;
draw=function(...args){
 const r=origDrawCutout.apply(this,args);
 requestAnimationFrame(()=>{positionSplitHandle();updateNavigatorMinimap()});
 return r;
};

/* Also bind Ctrl+E to Export Studio */
window.addEventListener('keydown',e=>{
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='e'){e.preventDefault();$('export')?.click()}
});
})();
