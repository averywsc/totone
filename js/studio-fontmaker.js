/* Totone v7.8.0 — Custom Font Maker, Importer & .OTF Exporter (Draw Glyphs, Mix/Steal Letters from Other Fonts, Install Live & Export .OTF via opentype.js) */
(function(){
const CHARS=[
 ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
 ...'abcdefghijklmnopqrstuvwxyz',
 ...'0123456789',
 '!','?','.',',','-','&','@','#'
];
const BUILTIN_DONORS=['Inter','Archivo Black','Playfair Display','Anton','Bebas Neue','Orbitron','Permanent Marker','Syne','Space Mono','Cormorant Garamond','Caveat','Bungee'];
const PAD=320,BASE_Y=252,CAP_Y=56,X_Y=126,DESC_Y=302;
const UNITS=1000,ASC=800,DESC=-200;

let opentypeLoaded=null;
function ensureOpenType(){
 if(window.opentype)return Promise.resolve(window.opentype);
 if(opentypeLoaded)return opentypeLoaded;
 opentypeLoaded=new Promise((res,rej)=>{
  const s=document.createElement('script');
  s.src='https://cdn.jsdelivr.net/npm/opentype.js@1.3.4/dist/opentype.min.js';
  s.crossOrigin='anonymous';
  s.onload=()=>res(window.opentype);
  s.onerror=()=>rej(Error('Failed to load opentype.js'));
  document.head.appendChild(s);
 });
 return opentypeLoaded;
}

/* Glyph store: char -> { kind:'strokes'|'otpath'|'canvas', strokes:[{pts,w,tip}], otCommands:[...], adv:600, srcName:'' } */
const glyphs=new Map();
let curChar='A';
let donorOTFont=null,donorOTName='';
let drawing=false,curStroke=null;
let ghostOn=true;

const dlg=$('font-maker-dialog');
const pad=$('fm-pad'),pg=pad?pad.getContext('2d'):null;
const gridEl=$('fm-char-grid');
const prevCv=$('fm-live-preview'),prevG=prevCv?prevCv.getContext('2d'):null;

function padToFontX(px){return Math.round((px/PAD)*UNITS)}
function padToFontY(py){return Math.round(((BASE_Y-py)/(BASE_Y-CAP_Y))*ASC)}
function fontToPadX(fx){return (fx/UNITS)*PAD}
function fontToPadY(fy){return BASE_Y-(fy/ASC)*(BASE_Y-CAP_Y)}

/* Convert a polyline stroke into a closed vector ribbon polygon in OpenType coordinates */
function appendStrokeToPath(path,stroke){
 const pts=stroke.pts;if(!pts||!pts.length)return;
 const r=Math.max(4,(stroke.w/PAD)*UNITS*0.5);
 const chisel=stroke.tip==='chisel';
 if(pts.length===1){
  const cx=padToFontX(pts[0][0]),cy=padToFontY(pts[0][1]);
  const segs=12;
  for(let i=0;i<segs;i++){
   const a=(i/segs)*Math.PI*2;
   const x=Math.round(cx+Math.cos(a)*r),y=Math.round(cy+Math.sin(a)*r);
   if(i===0)path.moveTo(x,y);else path.lineTo(x,y);
  }
  path.close();
  return;
 }
 const fpts=pts.map(([x,y])=>[padToFontX(x),padToFontY(y)]);
 const left=[],right=[];
 for(let i=0;i<fpts.length;i++){
  const prev=fpts[Math.max(0,i-1)],next=fpts[Math.min(fpts.length-1,i+1)];
  let dx=next[0]-prev[0],dy=next[1]-prev[1];
  const len=Math.hypot(dx,dy)||1;dx/=len;dy/=len;
  // Normal vector (or fixed 45-degree calligraphy nib for chisel tip)
  const nx=chisel?-0.707*r:-dy*r;
  const ny=chisel?0.707*r:dx*r;
  left.push([Math.round(fpts[i][0]+nx),Math.round(fpts[i][1]+ny)]);
  right.push([Math.round(fpts[i][0]-nx),Math.round(fpts[i][1]-ny)]);
 }
 path.moveTo(left[0][0],left[0][1]);
 for(let i=1;i<left.length;i++)path.lineTo(left[i][0],left[i][1]);
 for(let i=right.length-1;i>=0;i--)path.lineTo(right[i][0],right[i][1]);
 path.close();
}

/* Vectorize a rendered bitmap glyph (from any built-in/web font) into horizontal scanline vector spans */
function traceCanvasToOTCommands(srcCv){
 const w=srcCv.width,h=srcCv.height;
 const d=srcCv.getContext('2d',{willReadFrequently:true}).getImageData(0,0,w,h).data;
 const cmds=[];
 const step=3; // Clean crisp horizontal ribbon scan (fast & 100% valid vector OTF!)
 let minX=w,maxX=0;
 for(let y=0;y<h;y+=step){
  let runStart=-1;
  for(let x=0;x<=w;x++){
   const on=x<w&&d[(y*w+x)*4+3]>120;
   if(on&&runStart<0)runStart=x;
   else if(!on&&runStart>=0){
    const x0=runStart,x1=x;
    if(x0<minX)minX=x0;if(x1>maxX)maxX=x1;
    const fx0=padToFontX(x0),fx1=padToFontX(x1);
    const fy0=padToFontY(y),fy1=padToFontY(Math.min(h,y+step+0.6));
    cmds.push({type:'M',x:fx0,y:fy0});
    cmds.push({type:'L',x:fx1,y:fy0});
    cmds.push({type:'L',x:fx1,y:fy1});
    cmds.push({type:'L',x:fx0,y:fy1});
    cmds.push({type:'Z'});
    runStart=-1;
   }
  }
 }
 const adv=maxX>minX?Math.max(260,Math.min(980,Math.round(((maxX-minX)/w)*UNITS+120))):520;
 return {cmds,adv};
}

function renderPad(){
 if(!pg)return;
 pg.clearRect(0,0,PAD,PAD);
 // Background
 pg.fillStyle='#141418';
 pg.fillRect(0,0,PAD,PAD);
 // Typographic guide lines
 const guide=(y,col,lbl)=>{
  pg.strokeStyle=col;pg.lineWidth=1;pg.setLineDash([4,4]);
  pg.beginPath();pg.moveTo(0,y);pg.lineTo(PAD,y);pg.stroke();
  pg.setLineDash([]);
  pg.fillStyle=col;pg.font='500 10px Inter,sans-serif';pg.fillText(lbl,6,y-4);
 };
 guide(CAP_Y,'rgba(255,255,255,0.16)','Cap');
 guide(X_Y,'rgba(255,255,255,0.10)','x-height');
 guide(BASE_Y,'rgba(59,130,246,0.55)','Baseline');
 guide(DESC_Y,'rgba(255,255,255,0.12)','Desc');
 pg.strokeStyle='rgba(255,255,255,0.06)';pg.beginPath();pg.moveTo(PAD/2,0);pg.lineTo(PAD/2,PAD);pg.stroke();

 // Ghost reference letter
 if(ghostOn){
  const df=$('fm-donor-font')?.value||'Inter';
  pg.save();
  pg.fillStyle='rgba(255,255,255,0.11)';
  pg.font=`700 220px "${df}",sans-serif`;
  pg.textAlign='center';pg.textBaseline='alphabetic';
  pg.fillText(curChar,PAD/2,BASE_Y);
  pg.restore();
 }

 // Draw active glyph
 const g=glyphs.get(curChar);
 if(!g)return;
 if(g.kind==='strokes'&&g.strokes?.length){
  pg.save();
  pg.strokeStyle='#f2f4f8';pg.fillStyle='#f2f4f8';
  pg.lineCap='round';pg.lineJoin='round';
  for(const st of g.strokes){
   if(!st.pts.length)continue;
   if(st.pts.length===1){
    pg.beginPath();pg.arc(st.pts[0][0],st.pts[0][1],st.w/2,0,Math.PI*2);pg.fill();
   }else if(st.tip==='chisel'){
    pg.lineWidth=st.w;pg.lineCap='butt';
    pg.beginPath();pg.moveTo(st.pts[0][0],st.pts[0][1]);
    for(let i=1;i<st.pts.length;i++)pg.lineTo(st.pts[i][0],st.pts[i][1]);
    pg.stroke();
   }else{
    pg.lineWidth=st.w;pg.lineCap='round';
    pg.beginPath();pg.moveTo(st.pts[0][0],st.pts[0][1]);
    for(let i=1;i<st.pts.length;i++)pg.lineTo(st.pts[i][0],st.pts[i][1]);
    pg.stroke();
   }
  }
  pg.restore();
 }else if(g.kind==='otpath'&&g.otCommands?.length){
  pg.save();pg.fillStyle='#f2f4f8';pg.beginPath();
  for(const c of g.otCommands){
   if(c.type==='M')pg.moveTo(fontToPadX(c.x),fontToPadY(c.y));
   else if(c.type==='L')pg.lineTo(fontToPadX(c.x),fontToPadY(c.y));
   else if(c.type==='Q')pg.quadraticCurveTo(fontToPadX(c.x1),fontToPadY(c.y1),fontToPadX(c.x),fontToPadY(c.y));
   else if(c.type==='C')pg.bezierCurveTo(fontToPadX(c.x1),fontToPadY(c.y1),fontToPadX(c.x2),fontToPadY(c.y2),fontToPadX(c.x),fontToPadY(c.y));
   else if(c.type==='Z')pg.closePath();
  }
  pg.fill();pg.restore();
 }
}

function renderLivePreview(){
 if(!prevG||!prevCv)return;
 const txt=$('fm-preview-text')?.value||'Totone Font 2026!';
 const w=prevCv.width,h=prevCv.height;
 prevG.clearRect(0,0,w,h);
 prevG.fillStyle='#141418';prevG.fillRect(0,0,w,h);
 const scale=0.22;
 let cx=18,baseY=h*0.72;
 prevG.fillStyle='#f2f4f8';prevG.strokeStyle='#f2f4f8';
 for(const ch of txt){
  if(ch===' '){cx+=28;continue}
  const g=glyphs.get(ch);
  if(!g){
   prevG.save();prevG.fillStyle='rgba(255,255,255,0.22)';prevG.font='600 44px Inter,sans-serif';
   prevG.fillText(ch,cx,baseY);cx+=30;prevG.restore();continue;
  }
  prevG.save();
  prevG.translate(cx,baseY-BASE_Y*scale);
  prevG.scale(scale,scale);
  if(g.kind==='strokes'&&g.strokes?.length){
   prevG.lineCap='round';prevG.lineJoin='round';
   for(const st of g.strokes){
    if(!st.pts.length)continue;
    prevG.lineWidth=st.w;
    prevG.beginPath();prevG.moveTo(st.pts[0][0],st.pts[0][1]);
    for(let i=1;i<st.pts.length;i++)prevG.lineTo(st.pts[i][0],st.pts[i][1]);
    prevG.stroke();
   }
   cx+=Math.max(24,(g.adv||580)*0.072);
  }else if(g.kind==='otpath'&&g.otCommands?.length){
   prevG.beginPath();
   for(const c of g.otCommands){
    if(c.type==='M')prevG.moveTo(fontToPadX(c.x),fontToPadY(c.y));
    else if(c.type==='L')prevG.lineTo(fontToPadX(c.x),fontToPadY(c.y));
    else if(c.type==='Q')prevG.quadraticCurveTo(fontToPadX(c.x1),fontToPadY(c.y1),fontToPadX(c.x),fontToPadY(c.y));
    else if(c.type==='C')prevG.bezierCurveTo(fontToPadX(c.x1),fontToPadY(c.y1),fontToPadX(c.x2),fontToPadY(c.y2),fontToPadX(c.x),fontToPadY(c.y));
    else if(c.type==='Z')prevG.closePath();
   }
   prevG.fill();
   cx+=Math.max(22,(g.adv||560)*0.072);
  }
  prevG.restore();
  if(cx>w-24)break;
 }
}

function renderCharGrid(){
 if(!gridEl)return;
 gridEl.innerHTML=CHARS.map(ch=>{
  const has=glyphs.has(ch);
  const on=ch===curChar;
  return `<button type="button" class="fm-ch${on?' on':''}${has?' done':''}" data-ch="${esc(ch)}">${esc(ch)}</button>`;
 }).join('');
 const stat=$('fm-count');
 if(stat)stat.textContent=`${glyphs.size} / ${CHARS.length} letters assigned`;
}

function selectChar(ch){
 curChar=ch;
 if($('fm-cur-ch'))$('fm-cur-ch').textContent=ch;
 renderCharGrid();renderPad();
}

/* Pointer Drawing on Glyph Pad */
function padPos(e){
 const r=pad.getBoundingClientRect();
 return [(e.clientX-r.left)*(PAD/r.width),(e.clientY-r.top)*(PAD/r.height)];
}
pad?.addEventListener('pointerdown',e=>{
 if(e.button!==0)return;
 e.preventDefault();pad.setPointerCapture(e.pointerId);
 drawing=true;
 const p=padPos(e);
 let g=glyphs.get(curChar);
 if(!g||g.kind!=='strokes'){g={kind:'strokes',strokes:[],adv:600};glyphs.set(curChar,g)}
 curStroke={pts:[p],w:+$('fm-pen-size')?.value||18,tip:$('fm-pen-tip')?.value||'round'};
 g.strokes.push(curStroke);
 renderPad();renderCharGrid();renderLivePreview();
});
pad?.addEventListener('pointermove',e=>{
 if(!drawing||!curStroke)return;
 const p=padPos(e),last=curStroke.pts[curStroke.pts.length-1];
 if(Math.hypot(p[0]-last[0],p[1]-last[1])>=3){
  curStroke.pts.push(p);
  renderPad();
 }
});
const endDraw=()=>{
 if(!drawing)return;
 drawing=false;
 const g=glyphs.get(curChar);
 if(g&&g.kind==='strokes'&&g.strokes.length){
  let minX=PAD,maxX=0;
  g.strokes.forEach(s=>s.pts.forEach(([x])=>{if(x<minX)minX=x;if(x>maxX)maxX=x}));
  g.adv=maxX>minX?Math.max(280,Math.min(980,Math.round(((maxX-minX)/PAD)*UNITS+140))):580;
 }
 curStroke=null;renderLivePreview();
};
pad?.addEventListener('pointerup',endDraw);
pad?.addEventListener('pointercancel',endDraw);

/* Borrow / Assign a Letter from a Donor Font (Imported .TTF/.OTF OR Built-In Web Font!) */
async function assignCharFromDonor(ch){
 const donorVal=$('fm-donor-font')?.value||'Inter';
 if(donorVal==='__imported__'&&donorOTFont){
  const otg=donorOTFont.charToGlyph(ch);
  if(otg&&otg.path&&otg.path.commands.length){
   const scale=UNITS/(donorOTFont.unitsPerEm||1000);
   const cmds=otg.path.commands.map(c=>{
    const o={type:c.type};
    if(c.x!==undefined)o.x=Math.round(c.x*scale);
    if(c.y!==undefined)o.y=Math.round(c.y*scale);
    if(c.x1!==undefined)o.x1=Math.round(c.x1*scale);
    if(c.y1!==undefined)o.y1=Math.round(c.y1*scale);
    if(c.x2!==undefined)o.x2=Math.round(c.x2*scale);
    if(c.y2!==undefined)o.y2=Math.round(c.y2*scale);
    return o;
   });
   glyphs.set(ch,{kind:'otpath',otCommands:cmds,adv:Math.round((otg.advanceWidth||600)*scale),srcName:donorOTName});
   return true;
  }
 }
 // Built-in / Google font fallback: render crisp glyph & trace vector spans
 try{if(typeof ensureFont==='function')await ensureFont(donorVal)}catch{}
 const tmp=bc(PAD,PAD),tg=tmp.getContext('2d',{willReadFrequently:true});
 tg.fillStyle='#ffffff';
 tg.font=`700 220px "${donorVal}",sans-serif`;
 tg.textAlign='center';tg.textBaseline='alphabetic';
 tg.fillText(ch,PAD/2,BASE_Y);
 const traced=traceCanvasToOTCommands(tmp);
 if(traced.cmds.length){
  glyphs.set(ch,{kind:'otpath',otCommands:traced.cmds,adv:traced.adv,srcName:donorVal});
  return true;
 }
 return false;
}

/* Compile all assigned glyphs into a real installable OpenType .OTF binary! */
async function compileCustomOTF(){
 if(!glyphs.size){showToast('Draw or assign at least 1 letter first!',1800);return null}
 const ot=await ensureOpenType();
 const fontName=($('fm-name')?.value||'My Custom Font').replace(/[^a-zA-Z0-9 _-]/g,'').trim()||'My Custom Font';
 const notdefPath=new ot.Path();
 notdefPath.moveTo(80,0);notdefPath.lineTo(80,700);notdefPath.lineTo(480,700);notdefPath.lineTo(480,0);notdefPath.close();
 const otGlyphs=[
  new ot.Glyph({name:'.notdef',unicode:0,advanceWidth:560,path:notdefPath}),
  new ot.Glyph({name:'space',unicode:32,advanceWidth:320,path:new ot.Path()})
 ];
 for(const [ch,g] of glyphs.entries()){
  const path=new ot.Path();
  if(g.kind==='strokes'&&g.strokes?.length){
   for(const st of g.strokes)appendStrokeToPath(path,st);
  }else if(g.kind==='otpath'&&g.otCommands?.length){
   path.commands=g.otCommands.map(c=>({...c}));
  }
  otGlyphs.push(new ot.Glyph({
   name:ch,
   unicode:ch.charCodeAt(0),
   advanceWidth:g.adv||580,
   path
  }));
 }
 const font=new ot.Font({
  familyName:fontName,
  styleName:'Regular',
  unitsPerEm:UNITS,
  ascender:ASC,
  descender:DESC,
  glyphs:otGlyphs
 });
 const buf=font.toArrayBuffer();
 return {name:fontName,buf};
}

async function installFontIntoTotone(name,buf){
 const face=new FontFace(name,buf);
 await face.load();
 document.fonts.add(face);
 const tfont=$('tfont');
 if(tfont&&![...tfont.options].some(o=>o.value===name)){
  const opt=document.createElement('option');opt.value=name;opt.textContent=name;
  tfont.prepend(opt);
 }
 const plFont=$('pl-font');
 if(plFont&&![...plFont.options].some(o=>o.value===name)){
  const opt=document.createElement('option');opt.value=name;opt.textContent=name;
  plFont.prepend(opt);
 }
 const flist=$('flist');
 if(flist&&!flist.querySelector(`[data-cf="${CSS.escape(name)}"]`)){
  const b=document.createElement('button');b.type='button';b.className='fi';b.dataset.cf=name;
  b.style.fontFamily=`"${name}",sans-serif`;b.textContent=name+' (Custom)';
  b.onclick=()=>{if(tfont){tfont.value=name;tfont.dispatchEvent(new Event('change',{bubbles:true}))}};
  flist.prepend(b);
 }
 if(tfont){tfont.value=name;tfont.dispatchEvent(new Event('change',{bubbles:true}))}
}

/* Populate Donor Font Selector */
const donorSel=$('fm-donor-font');
if(donorSel){
 donorSel.innerHTML=BUILTIN_DONORS.map(f=>`<option value="${f}">${f}</option>`).join('');
}

/* Wire Buttons */
gridEl?.addEventListener('click',e=>{
 const b=e.target.closest('[data-ch]');if(b)selectChar(b.dataset.ch);
});
$('fm-undo')?.addEventListener('click',()=>{
 const g=glyphs.get(curChar);
 if(g&&g.kind==='strokes'&&g.strokes.length){
  g.strokes.pop();
  if(!g.strokes.length)glyphs.delete(curChar);
  renderPad();renderCharGrid();renderLivePreview();
 }
});
$('fm-clear')?.addEventListener('click',()=>{
 glyphs.delete(curChar);renderPad();renderCharGrid();renderLivePreview();
});
$('fm-next')?.addEventListener('click',()=>{
 const idx=CHARS.indexOf(curChar);
 selectChar(CHARS[(idx+1)%CHARS.length]);
});
$('fm-ghost')?.addEventListener('change',e=>{ghostOn=!!e.target.checked;renderPad()});
$('fm-donor-font')?.addEventListener('change',renderPad);
$('fm-preview-text')?.addEventListener('input',renderLivePreview);

$('fm-grab-one')?.addEventListener('click',async()=>{
 const ok=await assignCharFromDonor(curChar);
 if(ok){renderPad();renderCharGrid();renderLivePreview();showToast(`Assigned "${curChar}" from donor font`,1200)}
});
$('fm-fill-missing')?.addEventListener('click',async()=>{
 const btn=$('fm-fill-missing');if(btn)btn.disabled=true;
 showToast('Filling empty letters from donor font…',1600);
 try{
  for(const ch of CHARS){
   if(!glyphs.has(ch))await assignCharFromDonor(ch);
  }
  renderPad();renderCharGrid();renderLivePreview();
  showToast('Filled all missing letters!',1600);
 }finally{if(btn)btn.disabled=false}
});

/* Import Donor Font (.ttf / .otf / .woff) to steal/remix real vector letters */
$('fm-import-donor-btn')?.addEventListener('click',()=>$('fm-import-donor-file')?.click());
$('fm-import-donor-file')?.addEventListener('change',async e=>{
 const f=e.target.files?.[0];e.target.value='';if(!f)return;
 try{
  const ot=await ensureOpenType();
  const buf=await f.arrayBuffer();
  donorOTFont=ot.parse(buf);
  donorOTName=f.name.replace(/\.[^.]+$/,'');
  if(donorSel){
   let opt=donorSel.querySelector('option[value="__imported__"]');
   if(!opt){opt=document.createElement('option');opt.value='__imported__';donorSel.prepend(opt)}
   opt.textContent=`Imported: ${donorOTName}`;
   donorSel.value='__imported__';
  }
  // Also install the imported font into Totone so it's immediately usable!
  await installFontIntoTotone(donorOTName,buf);
  showToast(`Imported "${donorOTName}" — grab any letter or use it in Type!`,2200);
 }catch(err){
  showToast('Could not parse font file (try .ttf or .otf)',2200);
 }
});

/* Install Custom Font Directly Into Totone */
$('fm-install')?.addEventListener('click',async()=>{
 const btn=$('fm-install');if(btn)btn.disabled=true;
 try{
  const res=await compileCustomOTF();if(!res)return;
  await installFontIntoTotone(res.name,res.buf);
  showToast(`Installed "${res.name}" into Totone Type!`,2200);
 }catch(err){
  showToast('Font build failed: '+(err?.message||err),2400);
 }finally{if(btn)btn.disabled=false}
});

/* Export Real Installable .OTF Font File */
$('fm-export-otf')?.addEventListener('click',async()=>{
 const btn=$('fm-export-otf');if(btn)btn.disabled=true;
 try{
  const res=await compileCustomOTF();if(!res)return;
  const blob=new Blob([res.buf],{type:'font/otf'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=res.name.replace(/\s+/g,'-')+'.otf';
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1500);
  showToast(`Exported ${a.download}!`,2000);
 }catch(err){
  showToast('Export failed: '+(err?.message||err),2400);
 }finally{if(btn)btn.disabled=false}
});

function openFontMaker(){
 if(!dlg)return;
 renderCharGrid();renderPad();renderLivePreview();
 dlg.showModal();
}
window.openFontMaker=openFontMaker;
$('font-maker-open')?.addEventListener('click',openFontMaker);
$('fm-close')?.addEventListener('click',()=>dlg?.close());
dlg?.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});
document.querySelectorAll('[data-ai-act="fontmaker"]').forEach(b=>b.addEventListener('click',openFontMaker));
})();
