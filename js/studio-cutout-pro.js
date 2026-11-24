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

/* ========== 3. 1-Click Cinematic Develop Recipes (Lightroom Tab) ========== */
const RECIPES=[
 {name:'Natural Pop',v:{'lr-exp':10,'lr-con':14,'lr-hi':-18,'lr-sh':22,'lr-cla':12,'lr-vib':18,'lr-sat':4}},
 {name:'Kodak Warm',v:{'lr-temp':18,'lr-tint':6,'lr-con':10,'lr-hi':-20,'lr-sh':16,'lr-bl':12,'lr-vib':14,'lr-sat':-4}},
 {name:'Teal & Orange',v:{'lr-temp':12,'lr-con':22,'lr-hi':-16,'lr-sh':14,'lr-cla':18,'lr-deh':10,'lr-vib':20}},
 {name:'Concert Fix',v:{'lr-temp':-22,'lr-tint':-14,'lr-exp':14,'lr-hi':-28,'lr-sh':34,'lr-sat':-14,'lr-vib':16}},
 {name:'Editorial B&W',v:{'lr-con':28,'lr-hi':-12,'lr-sh':18,'lr-wh':16,'lr-bl':-14,'lr-cla':24,'lr-sat':-100}},
 {name:'Golden Hour',v:{'lr-temp':28,'lr-tint':8,'lr-exp':8,'lr-hi':-22,'lr-sh':20,'lr-deh':-8,'lr-vib':22}},
 {name:'Clean Studio',v:{'lr-exp':12,'lr-con':8,'lr-wh':14,'lr-sh':18,'lr-tex':10,'lr-cla':8,'lr-vib':8}},
 {name:'Cyber Neon',v:{'lr-temp':-20,'lr-tint':24,'lr-con':26,'lr-bl':-12,'lr-cla':20,'lr-vib':36,'lr-sat':14}}
];
const recBar=$('lr-recipes');
if(recBar){
 recBar.innerHTML=RECIPES.map((r,i)=>`<button type="button" data-rec="${i}">${r.name}</button>`).join('');
 recBar.onclick=e=>{
  const b=e.target.closest('[data-rec]');if(!b)return;
  const r=RECIPES[+b.dataset.rec];if(!r)return;
  ['lr-temp','lr-tint','lr-exp','lr-con','lr-hi','lr-sh','lr-wh','lr-bl','lr-tex','lr-cla','lr-deh','lr-vib','lr-sat'].forEach(id=>{
   const el=$(id);if(!el)return;
   el.value=r.v[id]??0;
   el.dispatchEvent(new Event('input',{bubbles:true}));
  });
  showToast('Applied recipe: '+r.name,1200);
 };
}

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
