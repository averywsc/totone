/* Totone Pro Studio UX — Floating Context Bar, Rulers & Grid Overlay, History Timeline, Ctrl+J Layer via Copy, Tool Finder Sync */
(function(){
/* ---------- Canva-Style Floating Layer Context Bar ---------- */
const floatBar=$('layer-float-bar');
function positionFloatBar(){
 const show=base&&active&&active.vis&&['layers','text','design'].includes(tab)&&!down&&!typeDrawing&&!brushKind()&&!editingVector()&&!document.querySelector('dialog[open]');
 if(!show){floatBar.hidden=true;return}
 const cr=c.getBoundingClientRect(),sr=stage.getBoundingClientRect();
 if(!cr.width||!W){floatBar.hidden=true;return}
 const scaleX=cr.width/W,scaleY=cr.height/H;
 const hw=(active.cv.width*(1-active.cl-active.cr)*active.s)/2;
 const hh=(active.cv.height*(1-active.ct-active.cb)*active.s)/2;
 const co=Math.abs(Math.cos(active.r)),si=Math.abs(Math.sin(active.r));
 const topY=active.y-(hw*si+hh*co);
 const cx=cr.left+active.x*scaleX;
 let y=cr.top+topY*scaleY-44;
 if(y<sr.top+8)y=Math.min(sr.bottom-42,cr.top+(active.y+(hw*si+hh*co))*scaleY+12);
 const barW=floatBar.offsetWidth||340;
 const clampedX=Math.max(sr.left+barW/2+8,Math.min(sr.right-barW/2-8,cx));
 floatBar.hidden=false;
 floatBar.style.left=clampedX+'px';
 floatBar.style.top=Math.max(sr.top+6,y)+'px';
 const lkBtn=floatBar.querySelector('[data-fl="lock"]');
 if(lkBtn)lkBtn.textContent=active.lk?'Unlock':'Lock';
 const wpBtn=floatBar.querySelector('[data-fl="warp"]');
 if(wpBtn){wpBtn.hidden=!active.shape;wpBtn.classList.toggle('on',active.shape?.warp==='custom')}
 const opSlider=$('fl-op');
 if(opSlider&&document.activeElement!==opSlider)opSlider.value=Math.round((active.op??1)*100);
}
let flOpHeld=false;
if($('fl-op')){
 $('fl-op').oninput=e=>{if(!active)return;if(!flOpHeld){pushU(mkSnap('p'));flOpHeld=true}active.op=+e.target.value/100;$('bo').value=e.target.value;$('bov').textContent=e.target.value+'%';draw()};
 $('fl-op').onchange=$('fl-op').onblur=()=>{flOpHeld=false;refreshLayers()};
}
floatBar.onclick=e=>{
 const b=e.target.closest('[data-fl]');if(!b||!active)return;
 const actName=b.dataset.fl;
 if(actName==='warp'){
  document.querySelector('.tabs [data-t="design"]')?.click();
  $('sh-warp-custom-btn')?.click();
  $('shape-edit')?.scrollIntoView({block:'nearest',behavior:'smooth'});
 }
 else if(actName==='dup')$('ldup').click();
 else if(actName==='flip')$('lflip').click();
 else if(actName==='center')$('lcen').click();
 else if(actName==='up')$('lup').click();
 else if(actName==='down')$('ldn').click();
 else if(actName==='del')$('ldel').click();
 else if(actName==='lock'){pushU(mkSnap('p'));active.lk=!active.lk;refreshLayers();draw();showToast(active.lk?'Layer locked':'Layer unlocked',1000)}
 else if(actName==='rmbg'&&typeof runSmartBackgroundRemover==='function')runSmartBackgroundRemover();
 else if(actName==='frame')jumpTool('design','frame-grid');
};

/* ---------- Photoshop Rulers & Snap Grid Overlay ---------- */
let gridOn=false;
const guideCv=$('stage-guides');
function drawStageGuides(){
 if(!gridOn||!base){guideCv.style.display='none';return}
 const cr=c.getBoundingClientRect();
 if(!cr.width||!cr.height){guideCv.style.display='none';return}
 const dpr=Math.min(2,devicePixelRatio||1),ruler=18;
 const left=cr.left-ruler,top=cr.top-ruler,w=cr.width+ruler,h=cr.height+ruler;
 guideCv.style.display='block';
 guideCv.style.left=left+'px';guideCv.style.top=top+'px';
 guideCv.style.width=w+'px';guideCv.style.height=h+'px';
 const pw=Math.max(1,Math.round(w*dpr)),ph=Math.max(1,Math.round(h*dpr));
 if(guideCv.width!==pw)guideCv.width=pw;if(guideCv.height!==ph)guideCv.height=ph;
 const g=guideCv.getContext('2d');
 g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);
 // Rulers background
 g.fillStyle='rgba(9,21,52,0.88)';
 g.fillRect(ruler,0,cr.width,ruler);g.fillRect(0,ruler,ruler,cr.height);
 g.fillStyle='rgba(22,37,77,0.95)';g.fillRect(0,0,ruler,ruler);
 // Grid lines inside canvas area
 const stepPx=W>1600?200:W>700?100:50;
 const sx=cr.width/W,sy=cr.height/H;
 g.strokeStyle='rgba(125,211,252,0.22)';g.lineWidth=1;
 g.beginPath();
 for(let x=stepPx;x<W;x+=stepPx){const vx=ruler+x*sx;g.moveTo(vx,ruler);g.lineTo(vx,ruler+cr.height)}
 for(let y=stepPx;y<H;y+=stepPx){const vy=ruler+y*sy;g.moveTo(ruler,vy);g.lineTo(ruler+cr.width,vy)}
 g.stroke();
 // Center crosshair
 g.strokeStyle='rgba(255,255,255,0.34)';g.setLineDash([4,4]);
 g.beginPath();
 g.moveTo(ruler+cr.width/2,ruler);g.lineTo(ruler+cr.width/2,ruler+cr.height);
 g.moveTo(ruler,ruler+cr.height/2);g.lineTo(ruler+cr.width,ruler+cr.height/2);
 g.stroke();g.setLineDash([]);
 // Ruler ticks & numbers
 g.strokeStyle='rgba(141,156,196,0.75)';g.fillStyle='#8d9cc4';g.font='10px Archivo,sans-serif';
 g.beginPath();
 for(let x=0;x<=W;x+=stepPx){
  const vx=ruler+x*sx;g.moveTo(vx,ruler-6);g.lineTo(vx,ruler);
  if(x>0&&x<W-20)g.fillText(String(x),vx+2,11);
 }
 for(let y=0;y<=H;y+=stepPx){
  const vy=ruler+y*sy;g.moveTo(ruler-6,vy);g.lineTo(ruler,vy);
 }
 g.stroke();
}
function toggleGrid(){
 gridOn=!gridOn;
 $('grid-toggle').setAttribute('aria-pressed',String(gridOn));
 drawStageGuides();
 showToast(gridOn?'Grid & rulers on':'Grid & rulers off',1100);
}
$('grid-toggle').onclick=toggleGrid;

/* ---------- Visual Photoshop History Timeline ---------- */
let historyUndoLabels=[],historyRedoLabels=[];
const origUndoPush=undoStack.push.bind(undoStack);
// Track human-readable edit labels alongside undo/redo stacks cleanly
function inferEditLabel(){
 const tMap={tone:'Tone edit',adjust:'Adjustment',colour:'Colour edit',select:'Selection',warp:'Warp stroke',layers:'Layer edit',design:'Design edit',draw:'Paint stroke',filters:'Filter / BG',pixel:'Pixel art',crop:'Crop / frame',glints:'Glint edit',film:'Film look',text:'Text edit',grade:'Grade edit'};
 const time=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'});
 return `${tMap[tab]||'Edit'} · ${time}`;
}
function syncHistoryLabels(){
 while(historyUndoLabels.length<undoStack.length)historyUndoLabels.push(inferEditLabel());
 if(historyUndoLabels.length>undoStack.length)historyUndoLabels.length=undoStack.length;
 while(historyRedoLabels.length<redoS.length)historyRedoLabels.push('Undone step');
 if(historyRedoLabels.length>redoS.length)historyRedoLabels.length=redoS.length;
}
function renderHistoryModal(){
 syncHistoryLabels();
 const list=$('history-list');list.replaceChildren();
 const mkBtn=(label,cls,onClick)=>{
  const b=document.createElement('button');b.type='button';if(cls)b.className=cls;
  b.textContent=label;b.onclick=onClick;return b;
 };
 list.append(mkBtn('Original / Session start',!undoStack.length?'current':'',()=>{
  while(undoStack.length)$('undo').click();renderHistoryModal();
 }));
 historyUndoLabels.forEach((lbl,idx)=>{
  const isCurrent=idx===historyUndoLabels.length-1;
  list.append(mkBtn(`${idx+1}. ${lbl}`,isCurrent?'current':'',()=>{
   const stepsBack=historyUndoLabels.length-1-idx;
   for(let i=0;i<stepsBack;i++)$('undo').click();
   renderHistoryModal();
  }));
 });
 for(let i=historyRedoLabels.length-1;i>=0;i--){
  const stepsForward=historyRedoLabels.length-i;
  list.append(mkBtn(`Redo · ${historyRedoLabels[i]}`,'future',()=>{
   for(let k=0;k<stepsForward;k++)$('redo').click();
   renderHistoryModal();
  }));
 }
 $('hist-undo').disabled=!undoStack.length;
 $('hist-redo').disabled=!redoS.length;
}
function openHistoryDialog(){
 if(!base){showToast('Open an image first',1400);return}
 renderHistoryModal();
 $('history-dialog').showModal();
}
window.openHistoryDialog=openHistoryDialog;
$('history-open').onclick=openHistoryDialog;
$('hist-close').onclick=()=>$('history-dialog').close();
$('history-dialog').addEventListener('keydown',e=>e.stopPropagation());
$('hist-undo').onclick=()=>{$('undo').click();renderHistoryModal()};
$('hist-redo').onclick=()=>{$('redo').click();renderHistoryModal()};

/* ---------- Photoshop Ctrl+J (Selection to New Layer OR Duplicate Layer) ---------- */
function layerViaCopy(){
 if(!base)return;
 if(sel){
  const box=selBox();if(!box)return;
  const [x,y,bw,bh]=box;
  const src=($('lgrade').checked&&layers.length)?flat():base;
  const cv=bc(bw,bh),g=cv.getContext('2d'),im=g.createImageData(bw,bh);
  for(let yy=0;yy<bh;yy++)for(let xx=0;xx<bw;xx++){
   const si=(y+yy)*W+(x+xx),di=(yy*bw+xx)*4,sj=si*4;
   im.data[di]=src.data[sj];im.data[di+1]=src.data[sj+1];im.data[di+2]=src.data[sj+2];
   im.data[di+3]=Math.round(src.data[sj+3]*sel[si]/255);
  }
  g.putImageData(im,0,0);
  pushU(mkSnap('p'));
  const l={cv,d:im,o:null,lk:false,sh:null,ol:null,x:x+bw/2,y:y+bh/2,s:1,r:0,op:1,bm:'source-over',fl:false,vis:true,cl:0,ct:0,cr:0,cb:0,name:'Selection copy'};
  layers.push(l);active=l;sel=null;updInfo();refreshLayers();draw();
  document.querySelector('.tabs [data-t="layers"]')?.click();
  showToast('Copied selection to new layer (Ctrl+J)',1600);
 }else if(active){
  $('ldup').click();showToast('Duplicated layer (Ctrl+J)',1300);
 }
}
document.addEventListener('keydown',e=>{
 if(e.target.matches?.('input,select,textarea,[contenteditable="true"]'))return;
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='j'){e.preventDefault();layerViaCopy()}
 else if((e.ctrlKey||e.metaKey)&&e.key==="'"){e.preventDefault();toggleGrid()}
});

/* ---------- Register all Canva + Photoshop Tools in Tool Finder (/ & Ctrl+K) ---------- */
const extraTools=[
 ['New Design / Magic Resize (Canva sizes)','dialog','new-canvas','blank instagram tiktok youtube poster banner story resize'],
 ['Design Templates (Magazine / YouTube / Poster)','design','tpl-grid','canva template layout starter cover quote story'],
 ['Editable Vector Shapes (16 Shapes + Warp + Aero/Chrome Finish)','design','shape-grid','canva shape circle pill polygon blob speech bubble burst lightning diamond gloss chrome'],
 ['Warp Shape (Freeform 8-Point Mesh / Arc / Wave / Bulge / Twist)','design','sh-warp','warp shape mesh distort bend curve freeform envelope illustrator'],
 ['Y2K · Frutiger Aero · Cybercore Graphics (Globe / Win98 / Orbs / Xbox Arc)','design','y2k-grid','y2k frutiger aero cybercore xbox globe win98 window cd chrome orb droplets sparkles hud barcode'],
 ['Cybercore & Frutiger Aero Filters (Everything / Holo-Scan / Chrome / Dither)','filters','psfx-grid','everything composite filter holo scanline chrome dither frutiger aero gloss crt xbox marble caustics'],
 ['Canva Photo Frames (Circle / Arch / Polaroid / Phone)','design','frame-grid','clip frame mask polaroid phone arch star heart'],
 ['Font Pairings (Headline + Subtitle combos)','design','font-pair-list','typography pairing title combo canva'],
 ['Brand Kit Swatches','design','brand-swatches','palette brand colours save extract'],
 ['Draw & Paint Brush / Eraser / Bucket / Gradient / Eyedropper','draw','draw-tool-grid','photoshop paint brush airbrush chalk splatter fill gradient color picker'],
 ['One-Click Background Remover (PS / Canva)','filters','rmbg-smart','remove bg cutout transparent subject mask'],
 ['Photoshop Filters (Blur / Tilt-Shift / Oil Paint / RGB Split / Fisheye)','filters','psfx-grid','gaussian motion radial zoom blur chromatic aberration emboss sketch high pass'],
 ['Perspective & Skew Transform','filters','ps-skewx','distort tilt keystone warp geometry'],
 ['History Timeline','dialog','history','undo redo steps timeline snapshot'],
 ['Canvas Grid & Rulers','dialog','grid','guides snap rulers alignment overlay']
];
toolCommands.push(...extraTools);
tabLabelMap.design='Design';tabLabelMap.draw='Draw';tabLabelMap.filters='Filters';

const origJumpTool=jumpTool;
jumpTool=function(tabName,id){
 if(tabName==='dialog'){
  if(id==='new-canvas'){openNewCanvasDialog();return}
  if(id==='history'){openHistoryDialog();return}
  if(id==='grid'){toggleGrid();return}
 }
 origJumpTool(tabName,id);
};

// Keep floating bar, rulers, history labels & action states synced cleanly
const origSyncStatesUX=syncActionStates;
syncActionStates=function(){
 origSyncStatesUX();
 $('history-open').disabled=!base;
 syncHistoryLabels();
};
const origDrawUX=draw;
draw=function(keep){
 origDrawUX(keep);
 requestAnimationFrame(()=>{positionFloatBar();drawStageGuides()});
};
stage.addEventListener('scroll',()=>{positionFloatBar();drawStageGuides()},{passive:true});
window.addEventListener('resize',()=>{positionFloatBar();drawStageGuides()});
document.querySelectorAll('.tabs button').forEach(b=>b.addEventListener('click',()=>requestAnimationFrame(()=>{positionFloatBar();drawStageGuides()})));
syncActionStates();
})();
