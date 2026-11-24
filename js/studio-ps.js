/* Totone Photoshop Studio — 8-Tool Draw/Paint Engine, Smart BG Remover w/ Decontamination, 14-Filter Live Preview Studio & Live Perspective/Skew */
(function(){
const DRAW_PALETTE=['#ffffff','#000000','#ff3b5c','#ff9500','#ffd60a','#34c759','#00c7be','#3b82f6','#a855f7','#ec4899','#94a3b8','#78350f'];
let drawTool='brush',drawState=null;

const swWrap=$('draw-swatches');
for(const col of DRAW_PALETTE){
 const b=document.createElement('button');b.type='button';b.style.background=col;b.title=col;b.setAttribute('aria-label','Colour '+col);
 b.onclick=()=>{$('draw-col1').value=col};
 swWrap.append(b);
}
const DRAW_HINTS={
 brush:'Paint smoothly onto a paint layer. Alt-click samples colour, [ ] resizes, X swaps.',
 eraser:'Erase smoothly on the selected layer (preserves base photo).',
 bucket:'Click any region to flood-fill with the foreground colour.',
 gradient:'Drag across the canvas to draw a smooth linear or radial gradient.',
 line:'Drag to draw a crisp straight line or arrow (hold Shift to snap angles).',
 rect:'Drag to draw a rectangle (hold Shift for a perfect square).',
 ellipse:'Drag to draw an ellipse (hold Shift for a perfect circle).',
 eyedrop:'Move over the canvas to inspect hex values, click to sample colour.'
};
function syncDrawToolUI(){
 $('draw-hint').textContent=DRAW_HINTS[drawTool]||'';
 $('draw-brush-opts').hidden=!['brush','eraser','line','rect','ellipse'].includes(drawTool);
 $('draw-bucket-opts').hidden=drawTool!=='bucket';
 $('draw-grad-opts').hidden=drawTool!=='gradient';
 $('draw-line-opts').hidden=drawTool!=='line';
 $('draw-shape-opts').hidden=!['rect','ellipse'].includes(drawTool);
 $('eyedrop-loupe').style.display='none';
}
$('draw-tool-grid').onclick=e=>{
 const b=e.target.closest('[data-dt]');if(!b)return;
 drawTool=b.dataset.dt;
 $('draw-tool-grid').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));
 syncDrawToolUI();
};
$('draw-swap').onclick=()=>{const a=$('draw-col1').value;$('draw-col1').value=$('draw-col2').value;$('draw-col2').value=a};
document.addEventListener('keydown',e=>{
 if(tab!=='draw'||e.target.matches?.('input,select,textarea'))return;
 if(!e.ctrlKey&&!e.metaKey&&e.key.toLowerCase()==='x'){$('draw-swap').click();showToast('Swapped draw colours',900)}
});

function createPaintLayer(name='Paint'){
 const cv=bc(W,H),d=cv.getContext('2d').createImageData(W,H);
 const l={name,paint:true,cv,d,o:null,vis:true,lk:false,fl:false,x:W/2,y:H/2,r:0,s:1,op:1,bm:'source-over',cl:0,ct:0,cr:0,cb:0};
 layers.push(l);active=l;return l;
}
$('draw-new-layer').onclick=()=>{
 if(!base){showToast('Open or create a canvas first',1500);return}
 pushU(mkSnap('p'));createPaintLayer('Paint '+(layers.filter(l=>l.paint).length+1));
 refreshLayers();draw();showToast('Added new paint layer',1200);
};
$('draw-clear-layer').onclick=()=>{
 if(!active||active.lk){showToast('Select an unlocked layer to clear',1400);return}
 pushU(mkSnap('p'));
 active.cv.getContext('2d').clearRect(0,0,active.cv.width,active.cv.height);
 active.d.data.fill(0);maskViews.delete(active);refreshLayers();draw();
 showToast(`Cleared "${active.name}"`,1200);
};

function getDrawTarget(createIfNeeded=true){
 if($('draw-target').value==='base')return {isBase:true};
 if(active&&!active.lk&&!active.tx&&!active.shape&&active.vis&&active.s===1&&active.r===0&&!active.fl&&active.x===W/2&&active.y===H/2&&active.cv.width===W&&active.cv.height===H){
  return {isBase:false,l:active};
 }
 if(!createIfNeeded)return null;
 return {isBase:false,l:createPaintLayer('Paint '+(layers.filter(l=>l.paint).length+1))};
}

function drawDab(g,x,y,r,tip,col,hard,op,angle){
 g.save();
 g.globalAlpha=op;
 if(tip==='neon'){
  // Outer glowing halo + crisp bright core
  const gr=g.createRadialGradient(x,y,0,x,y,r*1.85);
  gr.addColorStop(0,'#ffffff');gr.addColorStop(0.28,col);gr.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=gr;g.beginPath();g.arc(x,y,r*1.85,0,Math.PI*2);g.fill();
 }else if(tip==='pixel'){
  const sz=Math.max(1,Math.round(r*2));
  const gx=Math.floor(x/sz)*sz,gy=Math.floor(y/sz)*sz;
  g.fillStyle=col;g.fillRect(gx,gy,sz,sz);
 }else if(tip==='soft'||(tip==='round'&&hard<0.95)){
  const gr=g.createRadialGradient(x,y,0,x,y,r);
  const stop=tip==='soft'?0.05:Math.max(0.05,Math.min(0.98,hard));
  gr.addColorStop(0,col);gr.addColorStop(stop,col);gr.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();
 }else if(tip==='round'){
  g.fillStyle=col;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();
 }else if(tip==='marker'||tip==='calligraphy'){
  g.translate(x,y);g.rotate(tip==='calligraphy'?-Math.PI/4:angle||-Math.PI/6);
  g.fillStyle=col;
  const rx=r,ry=Math.max(1.5,r*(tip==='calligraphy'?0.24:0.42));
  g.beginPath();g.ellipse(0,0,rx,ry,0,0,Math.PI*2);g.fill();
 }else if(tip==='chalk'){
  g.fillStyle=col;
  const count=Math.max(10,Math.round(r*1.6));
  for(let i=0;i<count;i++){
   const a=Math.random()*Math.PI*2,rad=Math.sqrt(Math.random())*r;
   const sz=Math.max(1,Math.random()*2.5);
   g.globalAlpha=op*(0.35+Math.random()*0.65);
   g.fillRect(x+Math.cos(a)*rad,y+Math.sin(a)*rad,sz,sz);
  }
 }else if(tip==='splatter'){
  g.fillStyle=col;
  const drops=Math.max(5,Math.round(r*0.45));
  for(let i=0;i<drops;i++){
   const a=Math.random()*Math.PI*2,dist=Math.pow(Math.random(),0.6)*r*1.5;
   const dr=Math.max(1,Math.random()*r*0.24);
   g.beginPath();g.arc(x+Math.cos(a)*dist,y+Math.sin(a)*dist,dr,0,Math.PI*2);g.fill();
  }
 }
 g.restore();
}

function applySelectionClipToTarget(targetCv,beforeData){
 if(!sel)return;
 const g=targetCv.getContext('2d',{willReadFrequently:true}),im=g.getImageData(0,0,W,H),d=im.data;
 for(let i=0;i<sel.length;i++){
  const m=sel[i]/255,j=i*4;
  if(m>=0.999)continue;
  for(let k=0;k<4;k++)d[j+k]=beforeData[j+k]+(d[j+k]-beforeData[j+k])*m;
 }
 g.putImageData(im,0,0);
}

function runBucketFill(px0,py0){
 const x0=Math.floor(px0),y0=Math.floor(py0);
 if(x0<0||y0<0||x0>=W||y0>=H)return;
 const tol=+$('draw-tol').value,contig=$('draw-contig').checked;
 const col=rgb($('draw-col1').value),op=+$('draw-op').value/100;
 const isBase=$('draw-target').value==='base';
 pushU(isBase?mkSnap('all'):mkSnap('p'));
 const tgt=getDrawTarget(true);
 const refData=isBase?base.data:($('lgrade').checked?flat().data:base.data);
 const srcIdx=(y0*W+x0)*4,seed=[refData[srcIdx],refData[srcIdx+1],refData[srcIdx+2],refData[srcIdx+3]];
 const match=i=>{
  if(sel&&sel[i]<128)return false;
  const j=i*4;
  if(seed[3]<16)return refData[j+3]<16+tol;
  return wd(refData[j],refData[j+1],refData[j+2],seed)<=tol&&Math.abs(refData[j+3]-seed[3])<=tol+32;
 };
 const mask=new Uint8Array(W*H);
 if(contig){
  const st=[y0*W+x0];if(match(st[0]))mask[st[0]]=1;
  while(st.length){
   const j=st.pop(),x=j%W,y=(j/W)|0;
   if(x>0&&!mask[j-1]&&match(j-1)){mask[j-1]=1;st.push(j-1)}
   if(x<W-1&&!mask[j+1]&&match(j+1)){mask[j+1]=1;st.push(j+1)}
   if(y>0&&!mask[j-W]&&match(j-W)){mask[j-W]=1;st.push(j-W)}
   if(y<H-1&&!mask[j+W]&&match(j+W)){mask[j+W]=1;st.push(j+W)}
  }
 }else{
  for(let i=0;i<mask.length;i++)if(match(i))mask[i]=1;
 }
 const outData=isBase?base.data:tgt.l.d.data;
 for(let i=0;i<mask.length;i++){
  if(!mask[i])continue;
  const j=i*4,a=op*(sel?sel[i]/255:1);
  if(isBase){
   for(let k=0;k<3;k++)outData[j+k]+=Math.round((col[k]-outData[j+k])*a);
   outData[j+3]=Math.max(outData[j+3],Math.round(255*a));
  }else{
   const oldA=outData[j+3]/255,na=a+oldA*(1-a);
   if(na>0){for(let k=0;k<3;k++)outData[j+k]=(col[k]*a+outData[j+k]*oldA*(1-a))/na}
   outData[j+3]=Math.round(255*na);
  }
 }
 if(!isBase){syncL(tgt.l);maskViews.delete(tgt.l)}
 extract();refreshLayers();draw();showToast('Filled region',1000);
}

function sampleCanvasHex(p){
 const x=Math.max(0,Math.min(W-1,Math.floor(p[0]))),y=Math.max(0,Math.min(H-1,Math.floor(p[1])));
 const pxData=ctx.getImageData(x,y,1,1).data;
 return hex(pxData[0],pxData[1],pxData[2]);
}

function renderDragShapeOnCtx(g,st){
 const c1=$('draw-col1').value,c2=$('draw-col2').value,op=+$('draw-op').value/100;
 const [x0,y0]=st.start,[x1,y1]=st.cur,sw=Math.max(2,+$('draw-size').value);
 g.save();g.globalAlpha=op;g.globalCompositeOperation='source-over';
 if(st.tool==='gradient'){
  const fade=$('draw-gfade').checked,endCol=fade?c1+'00':c2;
  let gr;
  if($('draw-gtype').value==='radial'){gr=g.createRadialGradient(x0,y0,1,x0,y0,Math.max(4,Math.hypot(x1-x0,y1-y0)))}
  else{gr=g.createLinearGradient(x0,y0,x1,y1)}
  gr.addColorStop(0,c1);gr.addColorStop(1,endCol);
  g.fillStyle=gr;g.fillRect(0,0,W,H);
 }else if(st.tool==='line'){
  g.strokeStyle=c1;g.fillStyle=c1;g.lineWidth=sw;g.lineCap='round';
  g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();
  if($('draw-arrow').checked){
   const ang=Math.atan2(y1-y0,x1-x0),hl=Math.max(14,sw*2.4);
   g.beginPath();g.moveTo(x1,y1);
   g.lineTo(x1-hl*Math.cos(ang-0.42),y1-hl*Math.sin(ang-0.42));
   g.lineTo(x1-hl*Math.cos(ang+0.42),y1-hl*Math.sin(ang+0.42));
   g.closePath();g.fill();
  }
 }else if(st.tool==='rect'||st.tool==='ellipse'){
  const rx=Math.min(x0,x1),ry=Math.min(y0,y1),rw=Math.abs(x1-x0),rh=Math.abs(y1-y0);
  g.beginPath();
  if(st.tool==='rect')g.rect(rx,ry,rw,rh);
  else g.ellipse(rx+rw/2,ry+rh/2,Math.max(1,rw/2),Math.max(1,rh/2),0,0,Math.PI*2);
  if($('draw-shape-fill').checked){g.fillStyle=c1;g.fill()}
  else{g.strokeStyle=c1;g.lineWidth=sw;g.stroke()}
 }
 g.restore();
}

c.addEventListener('pointerdown',e=>{
 if(tab!=='draw'||!base||spaceDown||e.button!==0)return;
 e.preventDefault();e.stopImmediatePropagation();
 const p=pos(e);
 // Alt-click quick eyedropper from any draw tool!
 if(drawTool==='eyedrop'||e.altKey){
  const h=sampleCanvasHex(p);$('draw-col1').value=h;
  showToast('Sampled '+h,1200);return;
 }
 if(drawTool==='bucket'){runBucketFill(p[0],p[1]);return}
 const isBase=$('draw-target').value==='base'&&drawTool!=='eraser';
 pushU(isBase?mkSnap('all'):mkSnap('p'));
 const tgt=isBase?{isBase:true}:getDrawTarget(true);
 const workCv=bc(W,H),wg=workCv.getContext('2d',{willReadFrequently:true});
 const beforeData=new Uint8ClampedArray(isBase?base.data:tgt.l.d.data);
 wg.putImageData(new ImageData(beforeData,W,H),0,0);
 drawState={
  id:e.pointerId,tool:drawTool,tgt,workCv,wg,beforeData,
  start:p,last:p,sm:p,cur:p,
  dragShape:['gradient','line','rect','ellipse'].includes(drawTool)
 };
 c.setPointerCapture(e.pointerId);
 if(!drawState.dragShape){
  paintDrawSegment(drawState,p,p,e.pointerType==='pen'?Math.max(0.15,e.pressure*1.4):1);
  commitDrawWork(drawState);draw();
 }
},true);

function paintDrawSegment(st,a,b,pres){
 const r=Math.max(0.5,+$('draw-size').value/2*pres);
 const op=+$('draw-op').value/100,hard=+$('draw-hard').value/100;
 const tip=$('draw-tip').value,col=$('draw-col1').value,sym=$('draw-sym').checked;
 const g=st.wg;
 g.globalCompositeOperation=st.tool==='eraser'?'destination-out':'source-over';
 const dx=b[0]-a[0],dy=b[1]-a[1],dist=Math.hypot(dx,dy),angle=Math.atan2(dy,dx);
 const step=Math.max(1,r*(tip==='splatter'?0.9:tip==='chalk'?0.4:tip==='pixel'?0.5:0.24));
 const n=Math.max(1,Math.ceil(dist/step));
 for(let i=0;i<=n;i++){
  const x=a[0]+dx*i/n,y=a[1]+dy*i/n;
  drawDab(g,x,y,r,st.tool==='eraser'?'round':tip,col,hard,op,angle);
  if(sym)drawDab(g,W-x,y,r,st.tool==='eraser'?'round':tip,col,hard,op,-angle);
 }
}
function commitDrawWork(st){
 if(sel)applySelectionClipToTarget(st.workCv,st.beforeData);
 const im=st.wg.getImageData(0,0,W,H);
 if(st.tgt.isBase){base.data.set(im.data)}
 else{st.tgt.l.d.data.set(im.data);syncL(st.tgt.l);maskViews.delete(st.tgt.l)}
}

c.addEventListener('pointermove',e=>{
 if(tab==='draw'&&(drawTool==='eyedrop'||e.altKey)&&base&&!spaceDown&&!drawState){
  const loupe=$('eyedrop-loupe'),h=sampleCanvasHex(pos(e));
  loupe.style.display='flex';loupe.style.left=(e.clientX+16)+'px';loupe.style.top=(e.clientY-16)+'px';
  loupe.querySelector('i').style.background=h;loupe.querySelector('span').textContent=h;
  return;
 }
 if(!drawState||e.pointerId!==drawState.id)return;
 e.stopImmediatePropagation();
 let p=pos(e);
 if(drawState.dragShape){
  if(e.shiftKey){
   const dx=p[0]-drawState.start[0],dy=p[1]-drawState.start[1];
   if(drawState.tool==='line'){
    const ang=Math.round(Math.atan2(dy,dx)/(Math.PI/4))*(Math.PI/4),len=Math.hypot(dx,dy);
    p=[drawState.start[0]+Math.cos(ang)*len,drawState.start[1]+Math.sin(ang)*len];
   }else if(drawState.tool==='rect'||drawState.tool==='ellipse'){
    const side=Math.max(Math.abs(dx),Math.abs(dy));
    p=[drawState.start[0]+Math.sign(dx||1)*side,drawState.start[1]+Math.sign(dy||1)*side];
   }
  }
  drawState.cur=p;
  // Live preview of gradient/line/rect/ellipse right on the target layer!
  drawState.wg.clearRect(0,0,W,H);
  drawState.wg.putImageData(new ImageData(drawState.beforeData,W,H),0,0);
  renderDragShapeOnCtx(drawState.wg,drawState);
  commitDrawWork(drawState);draw();
  return;
 }
 const k=1-(+$('draw-smooth').value)/105;
 drawState.sm=[drawState.sm[0]+(p[0]-drawState.sm[0])*k,drawState.sm[1]+(p[1]-drawState.sm[1])*k];
 const pres=e.pointerType==='pen'?Math.max(0.15,e.pressure*1.4):1;
 paintDrawSegment(drawState,drawState.last,drawState.sm,pres);
 drawState.last=drawState.sm.slice();
 commitDrawWork(drawState);draw();
},true);

function finishDraw(e){
 if(!drawState||e.pointerId!==drawState.id)return;
 drawState=null;refreshLayers();draw();
}
for(const ev of ['pointerup','pointercancel','lostpointercapture'])c.addEventListener(ev,finishDraw,true);
c.addEventListener('pointerleave',()=>{$('eyedrop-loupe').style.display='none'});

c.addEventListener('pointermove',e=>{
 if(tab!=='draw'||!base||!['brush','eraser'].includes(drawTool))return;
 const r=c.getBoundingClientRect(),d=+$('draw-size').value*r.width/W;
 Object.assign($('ring').style,{display:'block',width:d+'px',height:d+'px',left:e.clientX-d/2+'px',top:e.clientY-d/2+'px'});
});
document.addEventListener('keydown',e=>{
 if(tab!=='draw'||e.target.matches?.('input,select,textarea'))return;
 if(e.key==='['||e.key===']'){
  e.stopImmediatePropagation();
  const el=$('draw-size'),step=e.shiftKey?16:4;
  el.value=Math.max(+el.min,Math.min(+el.max,+el.value+(e.key==='['?-step:step)));
  el.dispatchEvent(new Event('input',{bubbles:true}));
  showToast('Brush size: '+el.value+' px',800);
 }
},true);

/* ---------- Upgraded One-Click Smart Background Remover ---------- */
function runSmartBackgroundRemover(){
 if(!base){showToast('Open an image first',1600);return}
 let targetLayer=active;
 if($('rmbg-target').value==='base'||!targetLayer){
  if(!targetLayer){
   pushU(mkSnap('all'));
   const cv=bc(W,H),d=new ImageData(new Uint8ClampedArray(base.data),W,H);cv.getContext('2d').putImageData(d,0,0);
   targetLayer={name:'Subject',cv,d,o:null,x:W/2,y:H/2,s:1,r:0,op:1,bm:'source-over',vis:true,fl:false,lk:false,ct:0,cb:0,cl:0,cr:0};
   layers.unshift(targetLayer);active=targetLayer;base.data.fill(0);
  }
 }
 if(targetLayer.lk){showToast('Unlock the selected layer first',1500);return}
 const w=targetLayer.cv.width,h=targetLayer.cv.height,src=targetLayer.d.data;
 const sens=+$('rmbg-sens').value,feath=+$('rmbg-feath').value,mode=$('rmbg-mode')?.value||'auto';
 const tol=18+sens*1.15;

 const seeds=[];
 if(mode==='white'){
  seeds.push([255,255,255]);
  // Also sample top-left corner if opaque
  if(src[3]>200)seeds.push([src[0],src[1],src[2]]);
 }else{
  const stepX=Math.max(1,Math.floor(w/44)),stepY=Math.max(1,Math.floor(h/44));
  const samples=[];
  for(let x=0;x<w;x+=stepX){samples.push([x,0],[x,h-1])}
  for(let y=0;y<h;y+=stepY){samples.push([0,y],[w-1,y])}
  for(const [x,y] of samples){
   const i=(y*w+x)*4;if(src[i+3]<20)continue;
   const rgb0=[src[i],src[i+1],src[i+2]];
   if(!seeds.some(s=>wd(rgb0[0],rgb0[1],rgb0[2],s)<24))seeds.push(rgb0);
   if(seeds.length>=14)break;
  }
 }
 if(!seeds.length){$('rmbg-status').textContent='Layer is already transparent around the edges.';return}

 const bg=new Uint8Array(w*h);
 const minDistToSeeds=j=>{
  let best=999;const r=src[j],g=src[j+1],b=src[j+2];
  for(const s of seeds){const d=wd(r,g,b,s);if(d<best)best=d}
  return best;
 };

 if(mode==='white'){
  for(let i=0;i<w*h;i++){const j=i*4;if(src[j+3]<16||minDistToSeeds(j)<=tol)bg[i]=1}
 }else{
  const q=new Int32Array(w*h);let qh=0,qt=0;
  const cx=w/2,cy=h/2;
  const localTol=(x,y)=>{
   if(mode!=='center')return tol;
   const distNorm=Math.hypot((x-cx)/(w*0.38),(y-cy)/(h*0.42));
   return distNorm<1?tol*0.58:tol*1.1;
  };
  const trySeed=(x,y)=>{const idx=y*w+x,j=idx*4;if(!bg[idx]&&(src[j+3]<16||minDistToSeeds(j)<=localTol(x,y))){bg[idx]=1;q[qt++]=idx}};
  for(let x=0;x<w;x++){trySeed(x,0);trySeed(x,h-1)}
  for(let y=0;y<h;y++){trySeed(0,y);trySeed(w-1,y)}
  const edgeMax=tol*0.72+24;
  while(qh<qt){
   const idx=q[qh++],x=idx%w,y=(idx/w)|0,j0=idx*4;
   const r0=src[j0],g0=src[j0+1],b0=src[j0+2];
   const check=(nx,ny)=>{
    const n=ny*w+nx;if(bg[n])return;
    const j=n*4;
    if(src[j+3]<16){bg[n]=1;q[qt++]=n;return}
    if(wd(src[j],src[j+1],src[j+2],[r0,g0,b0])<=edgeMax&&minDistToSeeds(j)<=localTol(nx,ny)){bg[n]=1;q[qt++]=n}
   };
   if(x>0)check(x-1,y);if(x<w-1)check(x+1,y);if(y>0)check(x,y-1);if(y<h-1)check(x,y+1);
  }
  // Auto interior pocket cleanup (tight match to background seeds)
  if(mode==='auto'){
   const pocketTol=tol*0.52;
   for(let i=0;i<w*h;i++){if(!bg[i]&&minDistToSeeds(i*4)<=pocketTol)bg[i]=1}
  }
 }

 const maskCv=bc(w,h),mg=maskCv.getContext('2d'),mim=mg.createImageData(w,h);
 for(let i=0;i<w*h;i++){
  const j=i*4;let a=bg[i]?0:255;
  if(bg[i]&&src[j+3]>20){
   const best=minDistToSeeds(j);
   if(best>tol*0.72)a=Math.round(255*ss(tol*0.72,tol*1.08,best));
  }
  mim.data[j]=mim.data[j+1]=mim.data[j+2]=255;mim.data[j+3]=a;
 }
 mg.putImageData(mim,0,0);

 // Optional edge halo decontamination (gently pulls semi-transparent boundary pixels away from bg colour)
 if($('rmbg-decontam')?.checked){
  const bgMean=seeds[0];
  for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
   const i=y*w+x;if(bg[i])continue;
   if(bg[i-1]||bg[i+1]||bg[i-w]||bg[i+w]){
    const j=i*4;
    for(let k=0;k<3;k++)src[j+k]=Math.max(0,Math.min(255,Math.round(src[j+k]+(src[j+k]-bgMean[k])*0.22)));
   }
  }
  syncL(targetLayer);
 }

 if(feath>0){
  const smoothCv=bc(w,h),sg=smoothCv.getContext('2d');
  sg.filter=`blur(${feath}px)`;sg.drawImage(maskCv,0,0);
  replaceMask(smoothCv);
 }else replaceMask(maskCv);
 $('rmbg-status').textContent='Background masked non-destructively! Use Refine hair / edges to polish.';
 showToast('Background removed (Layer Mask created)',1800);
}
window.runSmartBackgroundRemover=runSmartBackgroundRemover;
$('rmbg-smart').onclick=runSmartBackgroundRemover;
$('rmbg-refine').onclick=()=>{
 if(!active){showToast('Remove background or select a layer first',1500);return}
 jumpTool('layers','edge-start');$('edge-start').click();
};

/* ---------- 22-Filter Photoshop + Y2K / Frutiger Aero / Cybercore Studio w/ Everything Target & Live Preview ---------- */
let psFxKind='holoscan',fxPrevSnap=null,fxCompositePreviewCv=null;
const FX_NEEDS_ANGLE=new Set(['motion','tiltshift','chroma','emboss','glitch','xboxflare','marble']);
const BAYER4=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];

function applyPsFilterToImageData(im,kind,amt,angleDeg,accentHex='#2b6cff'){
 const w=im.width,h=im.height,src=new Uint8ClampedArray(im.data),dst=im.data;
 const acc=rgb(accentHex||'#2b6cff');
 if(kind==='holoscan'){
  // Cybercore Holographic Scanline Edge Glow (Image 3 style!)
  const gain=0.8+amt/22;
  const lum=(x,y)=>{const q=(Math.max(0,Math.min(h-1,y))*w+Math.max(0,Math.min(w-1,x)))*4;return src[q]*.299+src[q+1]*.587+src[q+2]*.114};
  const edgeCv=bc(w,h),eg=edgeCv.getContext('2d'),eim=eg.createImageData(w,h),ed=eim.data;
  for(let y=0;y<h;y++){
   const scan=(y%3===0)?0.42:1.0;
   for(let x=0;x<w;x++){
    const gx=-lum(x-1,y-1)-2*lum(x-1,y)-lum(x-1,y+1)+lum(x+1,y-1)+2*lum(x+1,y)+lum(x+1,y+1);
    const gy=-lum(x-1,y-1)-2*lum(x,y-1)-lum(x+1,y-1)+lum(x-1,y+1)+2*lum(x,y+1)+lum(x+1,y+1);
    const l=lum(x,y)/255;
    const dot=(x%3===0&&y%3===0)?1.22:0.86;
    const e=Math.min(1,(Math.hypot(gx,gy)/255*gain*0.85+Math.pow(l,2.2)*0.55)*scan*dot);
    const core=Math.pow(e,2.6);
    const i=(y*w+x)*4;
    ed[i]=Math.min(255,acc[0]*e*1.25+255*core);
    ed[i+1]=Math.min(255,acc[1]*e*1.25+255*core);
    ed[i+2]=Math.min(255,acc[2]*e*1.25+255*core);
    ed[i+3]=src[i+3];
   }
  }
  eg.putImageData(eim,0,0);
  const outCv=bc(w,h),og=outCv.getContext('2d');
  og.fillStyle='#02040a';og.fillRect(0,0,w,h);
  og.drawImage(edgeCv,0,0);
  og.globalCompositeOperation='screen';
  og.filter=`blur(${Math.max(2,Math.round(Math.min(w,h)*0.012))}px)`;
  og.drawImage(edgeCv,0,0);
  og.filter=`blur(${Math.max(5,Math.round(Math.min(w,h)*0.028))}px)`;
  og.globalAlpha=0.75;og.drawImage(edgeCv,0,0);
  const od=og.getImageData(0,0,w,h).data;
  for(let i=0;i<dst.length;i+=4){dst[i]=od[i];dst[i+1]=od[i+1];dst[i+2]=od[i+2];dst[i+3]=src[i+3]}
  return;
 }
 if(kind==='chrome'){
  // Y2K Liquid Chrome Metallic Solarized Curve (Image 2 style!)
  const freq=1.6+(amt/100)*2.6,tintMix=0.32;
  for(let i=0;i<dst.length;i+=4){
   const l=(src[i]*.299+src[i+1]*.587+src[i+2]*.114)/255;
   const wave=0.5+0.5*Math.sin(l*Math.PI*freq-Math.PI/2);
   const spec=Math.pow(wave,0.75)*255;
   const hi=Math.pow(Math.max(0,wave-0.65)/0.35,2)*255;
   dst[i]=Math.min(255,spec*(1-tintMix)+acc[0]*wave*tintMix+hi*0.45);
   dst[i+1]=Math.min(255,spec*(1-tintMix)+acc[1]*wave*tintMix+hi*0.45);
   dst[i+2]=Math.min(255,spec*(1-tintMix)+acc[2]*wave*tintMix+hi*0.45);
  }
  return;
 }
 if(kind==='aerogloss'){
  // Frutiger Aero 2006 Glossy Aqua Sky Bloom + Curved Glass Dome Highlight!
  const mix=amt/100;
  const srcCv=bc(w,h);srcCv.getContext('2d').putImageData(im,0,0);
  const bloomCv=bc(w,h),bg=bloomCv.getContext('2d');
  bg.filter=`blur(${Math.max(4,Math.round(Math.min(w,h)*0.025))}px)`;
  bg.drawImage(srcCv,0,0);
  const bd=bg.getImageData(0,0,w,h).data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const i=(y*w+x)*4;
   // Boost aqua/mint vibrancy + dreamy soft bloom
   let r=src[i]*0.94+bd[i]*0.32*mix;
   let g=src[i+1]*1.04+bd[i+1]*0.36*mix+acc[1]*0.06*mix;
   let b=src[i+2]*1.08+bd[i+2]*0.42*mix+acc[2]*0.1*mix;
   // Curved glossy glass reflection sweep across top arc
   const nx=(x/w-0.5)*2,curveY=0.44-0.16*nx*nx,ny=y/h;
   if(ny<curveY){
    const gloss=(1-ny/Math.max(0.05,curveY))*0.42*mix;
    r+=(255-r)*gloss;g+=(255-g)*gloss;b+=(255-b)*gloss;
   }
   dst[i]=Math.min(255,r);dst[i+1]=Math.min(255,g);dst[i+2]=Math.min(255,b);
  }
  return;
 }
 if(kind==='y2kdither'){
  // Y2K Cobalt/Neon Ordered Bayer 4x4 Halftone Dither (Image 2 collage style!)
  const scale=Math.max(1,Math.round(1+amt/34));
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const i=(y*w+x)*4;
   const lum=(src[i]*.299+src[i+1]*.587+src[i+2]*.114)/255;
   const thr=(BAYER4[((y/scale|0)&3)*4+((x/scale|0)&3)]+0.5)/16;
   const level=lum*2+(thr-0.5)*0.85;
   if(level<0.65){dst[i]=5;dst[i+1]=8;dst[i+2]=22}
   else if(level<1.38){dst[i]=acc[0];dst[i+1]=acc[1];dst[i+2]=acc[2]}
   else{dst[i]=242;dst[i+1]=248;dst[i+2]=255}
  }
  return;
 }
 if(kind==='crt'){
  // Retro CRT Phosphor Aperture Grille + Glow
  const str=amt/100;
  for(let y=0;y<h;y++){
   const scan=(y%3===0)?(1-0.48*str):1+0.08*str;
   for(let x=0;x<w;x++){
    const i=(y*w+x)*4,sub=x%3;
    const pr=sub===0?1+0.25*str:1-0.18*str;
    const pg=sub===1?1+0.25*str:1-0.18*str;
    const pb=sub===2?1+0.25*str:1-0.18*str;
    dst[i]=Math.min(255,src[i]*scan*pr);
    dst[i+1]=Math.min(255,src[i+1]*scan*pg);
    dst[i+2]=Math.min(255,src[i+2]*scan*pb);
   }
  }
  return;
 }
 if(kind==='xboxflare'){
  // 2001 Xbox Energy Streaks & High-Contrast Matrix Glow (Image 1 style!)
  const rad=angleDeg*Math.PI/180,len=Math.max(8,Math.round(amt*0.9)),taps=16;
  const dx=Math.cos(rad)*len/taps,dy=Math.sin(rad)*len/taps,half=(taps-1)/2;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   let glow=0;
   for(let t=0;t<taps;t++){
    const sx=Math.max(0,Math.min(w-1,Math.round(x+(t-half)*dx))),sy=Math.max(0,Math.min(h-1,Math.round(y+(t-half)*dy)));
    const q=(sy*w+sx)*4,l=(src[q]*.299+src[q+1]*.587+src[q+2]*.114)/255;
    if(l>0.48)glow+=(l-0.48)*1.92;
   }
   glow=Math.min(1.5,glow/taps*2.4);
   const i=(y*w+x)*4,l=(src[i]*.299+src[i+1]*.587+src[i+2]*.114)/255;
   const dark=Math.pow(l,1.55);
   dst[i]=Math.min(255,acc[0]*(dark*0.7+glow*1.1)+src[i]*0.32+glow*glow*110);
   dst[i+1]=Math.min(255,acc[1]*(dark*0.7+glow*1.1)+src[i+1]*0.32+glow*glow*110);
   dst[i+2]=Math.min(255,acc[2]*(dark*0.7+glow*1.1)+src[i+2]*0.32+glow*glow*110);
  }
  return;
 }
 if(kind==='marble'){
  // Y2K Liquid Chrome Marble Turbulence Displacement (Image 2 swirl panel!)
  const amp=Math.max(4,amt*0.75),freq=0.018+(angleDeg/360)*0.025;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const wx=Math.sin(y*freq+Math.cos(x*freq*0.8)*2.2)*amp;
   const wy=Math.cos(x*freq+Math.sin(y*freq*0.8)*2.2)*amp;
   const sx=Math.max(0,Math.min(w-1,Math.round(x+wx))),sy=Math.max(0,Math.min(h-1,Math.round(y+wy)));
   const i=(y*w+x)*4,q=(sy*w+sx)*4;
   const sheen=0.5+0.5*Math.sin((wx+wy)*0.12);
   dst[i]=Math.min(255,src[q]*0.82+acc[0]*sheen*0.24+sheen*26);
   dst[i+1]=Math.min(255,src[q+1]*0.82+acc[1]*sheen*0.24+sheen*26);
   dst[i+2]=Math.min(255,src[q+2]*0.82+acc[2]*sheen*0.24+sheen*26);
   dst[i+3]=src[q+3];
  }
  return;
 }
 if(kind==='caustics'){
  // Frutiger Aero Underwater Caustic Light Shimmer
  const mix=amt/100,f=0.024;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const v1=Math.sin(x*f+Math.sin(y*f*0.7)*2.1);
   const v2=Math.cos(y*f*1.1-Math.cos(x*f*0.8)*1.9);
   const web=Math.pow(1-Math.min(1,Math.abs(v1+v2)*0.75),4)*mix;
   const i=(y*w+x)*4;
   dst[i]=Math.min(255,src[i]+(acc[0]*0.55+150)*web);
   dst[i+1]=Math.min(255,src[i+1]+(acc[1]*0.7+185)*web);
   dst[i+2]=Math.min(255,src[i+2]+(acc[2]*0.8+210)*web);
  }
  return;
 }
 if(kind==='gaussian'){
  const srcCv=bc(w,h);srcCv.getContext('2d').putImageData(im,0,0);
  const outCv=bc(w,h),og=outCv.getContext('2d');
  og.filter=`blur(${Math.max(0.5,amt*0.35)}px)`;og.drawImage(srcCv,0,0);
  dst.set(og.getImageData(0,0,w,h).data);return;
 }
 if(kind==='motion'){
  const rad=angleDeg*Math.PI/180,len=Math.max(2,Math.round(amt*0.55)),taps=Math.min(21,Math.max(5,len|1));
  const dx=Math.cos(rad)*len/taps,dy=Math.sin(rad)*len/taps,half=(taps-1)/2;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   let r=0,g=0,b=0,a=0;
   for(let t=0;t<taps;t++){
    const sx=Math.max(0,Math.min(w-1,Math.round(x+(t-half)*dx))),sy=Math.max(0,Math.min(h-1,Math.round(y+(t-half)*dy)));
    const q=(sy*w+sx)*4;r+=src[q];g+=src[q+1];b+=src[q+2];a+=src[q+3];
   }
   const i=(y*w+x)*4;dst[i]=r/taps;dst[i+1]=g/taps;dst[i+2]=b/taps;dst[i+3]=a/taps;
  }
  return;
 }
 if(kind==='radial'){
  const cx=w/2,cy=h/2,strength=amt/100*0.18,taps=12;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   let r=0,g=0,b=0,a=0;
   for(let t=0;t<taps;t++){
    const f=1-strength*(t/taps),sx=Math.max(0,Math.min(w-1,Math.round(cx+(x-cx)*f))),sy=Math.max(0,Math.min(h-1,Math.round(cy+(y-cy)*f)));
    const q=(sy*w+sx)*4;r+=src[q];g+=src[q+1];b+=src[q+2];a+=src[q+3];
   }
   const i=(y*w+x)*4;dst[i]=r/taps;dst[i+1]=g/taps;dst[i+2]=b/taps;dst[i+3]=a/taps;
  }
  return;
 }
 if(kind==='tiltshift'){
  const srcCv=bc(w,h);srcCv.getContext('2d').putImageData(im,0,0);
  const blurCv=bc(w,h),bg=blurCv.getContext('2d');
  bg.filter=`blur(${Math.max(2,amt*0.28)}px)`;bg.drawImage(srcCv,0,0);
  const bd=bg.getImageData(0,0,w,h).data,focusY=(angleDeg/360)*h,band=h*0.16;
  for(let y=0;y<h;y++){
   const dist=Math.abs(y-focusY),mix=ss(band*0.4,band*1.8,dist);
   for(let x=0;x<w;x++){const i=(y*w+x)*4;for(let k=0;k<3;k++)dst[i+k]=src[i+k]+(bd[i+k]-src[i+k])*mix}
  }
  return;
 }
 if(kind==='chroma'){
  const rad=angleDeg*Math.PI/180,shift=Math.max(1,Math.round(amt*0.24));
  const ox=Math.round(Math.cos(rad)*shift),oy=Math.round(Math.sin(rad)*shift);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const i=(y*w+x)*4;
   const rx=Math.max(0,Math.min(w-1,x+ox)),ry=Math.max(0,Math.min(h-1,y+oy));
   const bx=Math.max(0,Math.min(w-1,x-ox)),by=Math.max(0,Math.min(h-1,y-oy));
   dst[i]=src[(ry*w+rx)*4];dst[i+1]=src[i+1];dst[i+2]=src[(by*w+bx)*4+2];
  }
  return;
 }
 if(kind==='glitch'){
  const shift=Math.max(2,Math.round(amt*0.42)),seed=Math.round(angleDeg+1);
  for(let y=0;y<h;y++){
   const band=((y>>4)*13+seed)%17;
   const tear=band<3?Math.round((band-1)*shift*1.6):0;
   const scan=(y%3===0)?0.86:1;
   for(let x=0;x<w;x++){
    const sx=Math.max(0,Math.min(w-1,x+tear));
    const rx=Math.max(0,Math.min(w-1,sx+Math.round(shift*0.45)));
    const bx=Math.max(0,Math.min(w-1,sx-Math.round(shift*0.45)));
    const i=(y*w+x)*4;
    dst[i]=src[(y*w+rx)*4]*scan;dst[i+1]=src[(y*w+sx)*4+1]*scan;dst[i+2]=src[(y*w+bx)*4+2]*scan;dst[i+3]=src[(y*w+sx)*4+3];
   }
  }
  return;
 }
 if(kind==='halftone'){
  const cell=Math.max(4,Math.round(4+amt*0.22));
  for(let by=0;by<h;by+=cell)for(let bx=0;bx<w;bx+=cell){
   let r=0,g=0,b=0,n=0;
   const y1=Math.min(h,by+cell),x1=Math.min(w,bx+cell);
   for(let y=by;y<y1;y++)for(let x=bx;x<x1;x++){const q=(y*w+x)*4;r+=src[q];g+=src[q+1];b+=src[q+2];n++}
   r/=n;g/=n;b/=n;
   const lum=(r*.299+g*.587+b*.114)/255,rad=cell*0.56*Math.sqrt(1-lum*0.82),cx=bx+cell/2,cy=by+cell/2;
   for(let y=by;y<y1;y++)for(let x=bx;x<x1;x++){
    const i=(y*w+x)*4,d=Math.hypot(x-cx,y-cy),inDot=d<rad;
    dst[i]=inDot?r*0.85:244;dst[i+1]=inDot?g*0.85:240;dst[i+2]=inDot?b*0.85:232;
   }
  }
  return;
 }
 if(kind==='bokeh'){
  const srcCv=bc(w,h);srcCv.getContext('2d').putImageData(im,0,0);
  const blurCv=bc(w,h),bg=blurCv.getContext('2d');
  bg.filter=`blur(${Math.max(2,amt*0.32)}px)`;bg.drawImage(srcCv,0,0);
  const bd=bg.getImageData(0,0,w,h).data;
  for(let i=0;i<dst.length;i+=4){
   const lum=(bd[i]*.299+bd[i+1]*.587+bd[i+2]*.114)/255;
   const bloom=lum>0.55?1+(lum-0.55)*1.1:1;
   for(let k=0;k<3;k++)dst[i+k]=Math.min(255,bd[i+k]*bloom);
  }
  return;
 }
 if(kind==='thermal'){
  const mix=amt/100;
  const ramp=[[10,4,40],[112,18,168],[228,45,68],[255,180,28],[255,252,215]];
  for(let i=0;i<dst.length;i+=4){
   const l=(src[i]*.299+src[i+1]*.587+src[i+2]*.114)/255*(ramp.length-1);
   const idx=Math.min(ramp.length-2,l|0),t=l-idx,a=ramp[idx],b=ramp[idx+1];
   for(let k=0;k<3;k++)dst[i+k]=src[i+k]+((a[k]+(b[k]-a[k])*t)-src[i+k])*mix;
  }
  return;
 }
 if(kind==='oil'){
  const rad=Math.max(2,Math.min(5,Math.round(amt/18))),bins=10;
  const cnt=new Int32Array(bins),sr=new Int32Array(bins),sg=new Int32Array(bins),sb=new Int32Array(bins);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   cnt.fill(0);sr.fill(0);sg.fill(0);sb.fill(0);
   const y0=Math.max(0,y-rad),y1=Math.min(h-1,y+rad),x0=Math.max(0,x-rad),x1=Math.min(w-1,x+rad);
   for(let yy=y0;yy<=y1;yy++)for(let xx=x0;xx<=x1;xx++){
    const q=(yy*w+xx)*4,b=Math.min(bins-1,((src[q]+src[q+1]+src[q+2])/768*bins)|0);
    cnt[b]++;sr[b]+=src[q];sg[b]+=src[q+1];sb[b]+=src[q+2];
   }
   let best=0,bn=0;for(let b=0;b<bins;b++)if(cnt[b]>bn){bn=cnt[b];best=b}
   const i=(y*w+x)*4;if(bn){dst[i]=sr[best]/bn;dst[i+1]=sg[best]/bn;dst[i+2]=sb[best]/bn}
  }
  return;
 }
 if(kind==='fisheye'){
  const cx=w/2,cy=h/2,R=Math.hypot(cx,cy),k=(amt-50)/50*0.65;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const nx=(x-cx)/R,ny=(y-cy)/R,r2=nx*nx+ny*ny,f=1+k*r2;
   const sx=Math.max(0,Math.min(w-1,Math.round(cx+nx*f*R))),sy=Math.max(0,Math.min(h-1,Math.round(cy+ny*f*R)));
   const i=(y*w+x)*4,q=(sy*w+sx)*4;
   dst[i]=src[q];dst[i+1]=src[q+1];dst[i+2]=src[q+2];dst[i+3]=src[q+3];
  }
  return;
 }
 if(kind==='highpass'){
  const srcCv=bc(w,h);srcCv.getContext('2d').putImageData(im,0,0);
  const blurCv=bc(w,h),bg=blurCv.getContext('2d');
  bg.filter=`blur(${Math.max(1,amt*0.12)}px)`;bg.drawImage(srcCv,0,0);
  const bd=bg.getImageData(0,0,w,h).data,gain=0.6+amt/100*1.4;
  for(let i=0;i<dst.length;i+=4)for(let k=0;k<3;k++)dst[i+k]=Math.max(0,Math.min(255,src[i+k]+(src[i+k]-bd[i+k])*gain));
  return;
 }
 if(kind==='emboss'){
  const rad=angleDeg*Math.PI/180,ox=Math.round(Math.cos(rad)*2)||1,oy=Math.round(Math.sin(rad)*2)||1,gain=amt/35;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const i=(y*w+x)*4,x2=Math.max(0,Math.min(w-1,x+ox)),y2=Math.max(0,Math.min(h-1,y+oy)),q=(y2*w+x2)*4;
   const d=((src[i]-src[q])*.299+(src[i+1]-src[q+1])*.587+(src[i+2]-src[q+2])*.114)*gain;
   const v=Math.max(0,Math.min(255,128+d));dst[i]=dst[i+1]=dst[i+2]=v;
  }
  return;
 }
 if(kind==='edges'){
  const gain=0.6+amt/35;
  const lum=(x,y)=>{const q=(Math.max(0,Math.min(h-1,y))*w+Math.max(0,Math.min(w-1,x)))*4;return src[q]*.299+src[q+1]*.587+src[q+2]*.114};
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const gx=-lum(x-1,y-1)-2*lum(x-1,y)-lum(x-1,y+1)+lum(x+1,y-1)+2*lum(x+1,y)+lum(x+1,y+1);
   const gy=-lum(x-1,y-1)-2*lum(x,y-1)-lum(x+1,y-1)+lum(x-1,y+1)+2*lum(x,y+1)+lum(x+1,y+1);
   const v=Math.max(0,Math.min(255,255-Math.hypot(gx,gy)*gain));
   const i=(y*w+x)*4;dst[i]=dst[i+1]=dst[i+2]=v;
  }
 }
}

function captureFullCompositeImageData(){
 const prevCv=fxCompositePreviewCv;fxCompositePreviewCv=null;
 render(false);
 const im=ctx.getImageData(0,0,W,H);
 fxCompositePreviewCv=prevCv;
 return im;
}

function cancelFxPreview(silent=false){
 const hadComp=!!fxCompositePreviewCv;
 fxCompositePreviewCv=null;
 if(fxPrevSnap){
  const snap=fxPrevSnap;fxPrevSnap=null;
  if(snap.layer&&layers.includes(snap.layer)){
   snap.layer.d.data.set(snap.pixels);syncL(snap.layer);maskViews.delete(snap.layer);
  }else if(!snap.layer&&base&&base.data.length===snap.pixels.length){
   base.data.set(snap.pixels);
  }
 }
 $('psfx-cancel').hidden=true;
 if(!silent&&(hadComp||true)){draw();$('psfx-status').textContent='Preview cancelled.'}
}

let fxDebounce=0;
function runFxPreview(){
 if(!base||!$('psfx-live').checked)return;
 const targetMode=$('psfx-target').value;
 const amt=+$('psfx-amt').value,ang=+$('psfx-angle').value,col=$('psfx-col')?.value||'#2b6cff';
 if(targetMode==='all-layer'||targetMode==='all-flat'){
  if(fxPrevSnap)cancelFxPreview(true);
  const comp=captureFullCompositeImageData();
  const before=sel?new Uint8ClampedArray(comp.data):null;
  applyPsFilterToImageData(comp,psFxKind,amt,ang,col);
  if(sel&&before){for(let i=0;i<sel.length;i++){const m=sel[i]/255,j=i*4;for(let k=0;k<4;k++)comp.data[j+k]=before[j+k]+(comp.data[j+k]-before[j+k])*m}}
  const cv=bc(W,H);cv.getContext('2d').putImageData(comp,0,0);
  fxCompositePreviewCv=cv;
  $('psfx-cancel').hidden=false;
  $('psfx-status').textContent='Live preview on EVERYTHING — click Apply filter to keep or Cancel.';
  draw(true);
  return;
 }
 fxCompositePreviewCv=null;
 const useLayer=targetMode==='layer'&&active&&!active.lk;
 const targetLayer=useLayer?active:null;
 if(fxPrevSnap&&fxPrevSnap.layer!==targetLayer)cancelFxPreview(true);
 if(!fxPrevSnap){
  const srcPixels=targetLayer?targetLayer.d.data:base.data;
  fxPrevSnap={layer:targetLayer,pixels:new Uint8ClampedArray(srcPixels)};
 }
 const dstIm=targetLayer?targetLayer.d:base;
 dstIm.data.set(fxPrevSnap.pixels);
 applyPsFilterToImageData(dstIm,psFxKind,amt,ang,col);
 if(!targetLayer&&sel){
  for(let i=0;i<sel.length;i++){const m=sel[i]/255,j=i*4;for(let k=0;k<4;k++)dstIm.data[j+k]=fxPrevSnap.pixels[j+k]+(dstIm.data[j+k]-fxPrevSnap.pixels[j+k])*m}
 }
 if(targetLayer){syncL(targetLayer);maskViews.delete(targetLayer)}
 $('psfx-cancel').hidden=false;
 $('psfx-status').textContent='Live preview active — click Apply filter to keep or Cancel.';
 draw();
}

// Draw live "Everything" composite preview on top of canvas cleanly
const prevRenderPsFx=render;
render=function(ov=true,rect,printTable=null){
 prevRenderPsFx(ov,rect,printTable);
 if(ov&&!rect&&fxCompositePreviewCv&&tab==='filters'){
  ctx.save();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
  ctx.drawImage(fxCompositePreviewCv,0,0);ctx.restore();
 }
};

$('psfx-grid').onclick=e=>{
 const b=e.target.closest('[data-fx]');if(!b)return;
 psFxKind=b.dataset.fx;
 $('psfx-grid').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));
 $('psfx-angle-row').hidden=!FX_NEEDS_ANGLE.has(psFxKind);
 if($('psfx-live').checked&&base)runFxPreview();
};
$('psfx-angle-row').hidden=true;
for(const id of ['psfx-amt','psfx-angle','psfx-col','psfx-target']){
 const el=$(id);if(!el)continue;
 el.addEventListener('input',()=>{
  if(!$('psfx-live').checked||!base)return;
  clearTimeout(fxDebounce);fxDebounce=setTimeout(runFxPreview,35);
 });
}
document.querySelectorAll('[data-fc]').forEach(b=>b.onclick=()=>{
 $('psfx-col').value=b.dataset.fc;
 if($('psfx-live').checked&&base)runFxPreview();
});
$('psfx-live').onchange=()=>{if(!$('psfx-live').checked)cancelFxPreview();else if(base)runFxPreview()};
$('psfx-cancel').onclick=()=>cancelFxPreview();
document.querySelectorAll('.tabs button').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.t!=='filters')cancelFxPreview(true)}));

$('psfx-apply').onclick=()=>{
 if(!base){showToast('Open an image first',1500);return}
 const targetMode=$('psfx-target').value;
 const amt=+$('psfx-amt').value,ang=+$('psfx-angle').value,col=$('psfx-col')?.value||'#2b6cff';
 const label=$('psfx-grid').querySelector('.on')?.textContent||psFxKind;
 // Restore clean pre-preview state so Undo captures exact original!
 cancelFxPreview(true);
 if(targetMode==='all-layer'){
  const comp=captureFullCompositeImageData();
  const before=sel?new Uint8ClampedArray(comp.data):null;
  applyPsFilterToImageData(comp,psFxKind,amt,ang,col);
  if(sel&&before){for(let i=0;i<sel.length;i++){const m=sel[i]/255,j=i*4;for(let k=0;k<4;k++)comp.data[j+k]=before[j+k]+(comp.data[j+k]-before[j+k])*m}}
  const cv=bc(W,H);cv.getContext('2d').putImageData(comp,0,0);
  pushU(mkSnap('p'));
  const l={cv,d:comp,o:null,lk:false,sh:null,ol:null,x:W/2,y:H/2,s:1,r:0,op:1,bm:'source-over',fl:false,vis:true,cl:0,ct:0,cr:0,cb:0,name:('FX · '+label).slice(0,24)};
  layers.push(l);active=l;refreshLayers();draw();
  $('psfx-status').textContent=`Applied ${label} to everything as a new top FX layer.`;
  showToast(`Applied ${label} to everything (new FX layer)`,1600);
  return;
 }
 if(targetMode==='all-flat'){
  const comp=captureFullCompositeImageData();
  const before=sel?new Uint8ClampedArray(comp.data):null;
  applyPsFilterToImageData(comp,psFxKind,amt,ang,col);
  if(sel&&before){for(let i=0;i<sel.length;i++){const m=sel[i]/255,j=i*4;for(let k=0;k<4;k++)comp.data[j+k]=before[j+k]+(comp.data[j+k]-before[j+k])*m}}
  pushU(documentUndo());
  base.data.set(comp.data);layers=[];active=null;
  extract();refreshLayers();draw();
  $('psfx-status').textContent=`Flattened & baked ${label} onto the entire canvas.`;
  showToast(`Baked ${label} onto whole canvas`,1600);
  return;
 }
 const useLayer=targetMode==='layer'&&active&&!active.lk;
 if(useLayer){
  pushU(mkSnap('p'));
  applyPsFilterToImageData(active.d,psFxKind,amt,ang,col);
  syncL(active);maskViews.delete(active);refreshLayers();draw();
 }else{
  pushU(mkSnap('all'));
  const before=sel?new Uint8ClampedArray(base.data):null;
  applyPsFilterToImageData(base,psFxKind,amt,ang,col);
  if(sel&&before){for(let i=0;i<sel.length;i++){const m=sel[i]/255,j=i*4;for(let k=0;k<4;k++)base.data[j+k]=before[j+k]+(base.data[j+k]-before[j+k])*m}}
  extract();draw();
 }
 $('psfx-status').textContent=`Applied ${label}. Press Ctrl+Z to undo.`;
 showToast(`Applied ${label}`,1400);
};

/* ---------- Perspective & Skew Layer Bake ---------- */
$('ps-skew-apply').onclick=()=>{
 if(!active||active.lk){showToast('Select an unlocked layer to skew',1600);return}
 const sx=Math.tan(+$('ps-skewx').value*Math.PI/180),sy=Math.tan(+$('ps-skewy').value*Math.PI/180),persp=+$('ps-persp').value/100;
 if(!sx&&!sy&&!persp)return;
 pushU(mkSnap('p'));
 const src=active.cv,sw=src.width,sh=src.height;
 const padX=Math.ceil(Math.abs(sx)*sh+Math.abs(persp)*sw*0.45)+8,padY=Math.ceil(Math.abs(sy)*sw)+8;
 const nw=Math.min(3600,sw+padX*2),nh=Math.min(3600,sh+padY*2);
 const out=bc(nw,nh),og=out.getContext('2d');
 og.imageSmoothingEnabled=true;og.imageSmoothingQuality='high';
 if(persp){
  for(let y=0;y<sh;y++){
   const t=y/Math.max(1,sh-1)-0.5,rowScale=Math.max(0.2,1+persp*t*1.25);
   const rw=sw*rowScale,rx=(nw-rw)/2+sx*(y-sh/2),ry=padY+y;
   og.drawImage(src,0,y,sw,1,rx,ry,rw,1.4);
  }
 }else{
  og.setTransform(1,sy,sx,1,nw/2-sw/2-sx*sh/2,nh/2-sh/2-sy*sw/2);
  og.drawImage(src,0,0);
 }
 active.cv=out;active.d=out.getContext('2d').getImageData(0,0,nw,nh);active.o=null;maskViews.delete(active);
 $('ps-skewx').value=0;$('ps-skewy').value=0;$('ps-persp').value=0;syncAutoOutputs();
 refreshLayers();draw();showToast('Applied perspective / skew to layer',1500);
};
$('ps-skew-reset').onclick=()=>{$('ps-skewx').value=0;$('ps-skewy').value=0;$('ps-persp').value=0;syncAutoOutputs()};

syncDrawToolUI();
enhanceSliders($('p-draw'));
enhanceSliders($('p-filters'));
})();
