/* Totone v7.3.0 — Per-Letter Image/Font/Color Studio, Dedicated Pro Borders Mode (incl. Custom Image Borders) & Floating All-Layers Drawer */
(function(){
const clamp=(v,lo,hi)=>v<lo?lo:v>hi?hi:v;
const clamp8=v=>v<0?0:v>255?255:v|0;

/* ==========================================================================
   1. PER-LETTER STUDIO (Edit Color, Font, Scale, Tilt & Image per Letter!)
   ========================================================================== */
const PL_FONTS=['Archivo Black','Playfair Display','Anton','Bebas Neue','Inter','Syne','Orbitron','Permanent Marker','Cormorant Garamond','Space Mono','Abril Fatface','Bungee'];
let plLetters=[];
let plSel=0;
let plLayer=null;

function defaultLetter(ch,idx){
 return {ch,font:'Archivo Black',color:'#ffffff',scale:100,tilt:0,img:null,imgZoom:110,imgX:0,imgY:0};
}

function syncLettersFromText(){
 const txt=($('pl-text')?.value||'TOTONE').slice(0,24);
 const next=[];
 for(let i=0;i<txt.length;i++){
  const prev=plLetters[i];
  if(prev)next.push({...prev,ch:txt[i]});
  else next.push(defaultLetter(txt[i],i));
 }
 plLetters=next;
 if(plSel>=plLetters.length)plSel=Math.max(0,plLetters.length-1);
 renderLetterTiles();
 syncLetterInspector();
}

function renderLetterTiles(){
 const box=$('pl-tiles');if(!box)return;
 box.innerHTML=plLetters.map((lt,i)=>{
  const bg=lt.img?'background:linear-gradient(135deg,#2f7cf6,#60a5fa);color:#fff':`color:${lt.color}`;
  const label=lt.ch===' '?'␣':esc(lt.ch);
  return `<button type="button" class="pl-tile${i===plSel?' on':''}" data-pli="${i}" style="font-family:'${lt.font}',sans-serif;${bg}" title="Letter ${i+1}: ${label}">${label}${lt.img?'<i>IMG</i>':''}</button>`;
 }).join('');
}

function syncLetterInspector(){
 const lt=plLetters[plSel];if(!lt)return;
 if($('pl-cur-label'))$('pl-cur-label').textContent=`Editing letter #${plSel+1}: "${lt.ch===' '?'Space':lt.ch}"`;
 if($('pl-font'))$('pl-font').value=lt.font;
 if($('pl-col'))$('pl-col').value=lt.color;
 if($('pl-scale')){$('pl-scale').value=lt.scale;if($('pl-scale').nextElementSibling)$('pl-scale').nextElementSibling.textContent=lt.scale+'%'}
 if($('pl-tilt')){$('pl-tilt').value=lt.tilt;if($('pl-tilt').nextElementSibling)$('pl-tilt').nextElementSibling.textContent=lt.tilt+'°'}
 if($('pl-img-zoom')){$('pl-img-zoom').value=lt.imgZoom;if($('pl-img-zoom').nextElementSibling)$('pl-img-zoom').nextElementSibling.textContent=lt.imgZoom+'%'}
 if($('pl-img-x')){$('pl-img-x').value=lt.imgX;if($('pl-img-x').nextElementSibling)$('pl-img-x').nextElementSibling.textContent=lt.imgX+'%'}
 if($('pl-img-y')){$('pl-img-y').value=lt.imgY;if($('pl-img-y').nextElementSibling)$('pl-img-y').nextElementSibling.textContent=lt.imgY+'%'}
 if($('pl-img-opts'))$('pl-img-opts').hidden=!lt.img;
 if($('pl-img-clear'))$('pl-img-clear').hidden=!lt.img;
}

async function renderPerLetterLayer(){
 if(!base||!plLetters.length){showToast('Open an image or canvas first',1400);return}
 const baseSz=clamp(+$('pl-size')?.value||160,24,420);
 const track=+$('pl-track')?.value||10;
 const sw=+$('pl-sw')?.value||0;
 const sc=$('pl-scol')?.value||'#000000';

 // Ensure all used fonts are loaded
 const usedFonts=[...new Set(plLetters.map(l=>l.font))];
 for(const f of usedFonts){try{if(typeof ensureFont==='function')await ensureFont(f)}catch{}}

 // Measure each glyph
 const mCv=bc(16,16),mg=mCv.getContext('2d');
 const metrics=plLetters.map(lt=>{
  const sz=Math.round(baseSz*(lt.scale/100));
  mg.font=`800 ${sz}px "${lt.font}",sans-serif`;
  const w=lt.ch===' '?sz*0.42:Math.max(sz*0.28,mg.measureText(lt.ch).width);
  return {sz,w,h:sz*1.25};
 });
 const totalW=Math.ceil(metrics.reduce((a,m)=>a+m.w,0)+Math.max(0,plLetters.length-1)*track+baseSz*0.7);
 const totalH=Math.ceil(Math.max(...metrics.map(m=>m.h))+baseSz*0.65);

 const cv=bc(Math.max(64,totalW),Math.max(64,totalH));
 const g=cv.getContext('2d');
 let cursorX=baseSz*0.35;
 const midY=cv.height/2;

 for(let i=0;i<plLetters.length;i++){
  const lt=plLetters[i],m=metrics[i];
  const cx=cursorX+m.w/2;
  if(lt.ch!==' '){
   // Render each letter onto its own crisp offscreen canvas so per-letter image masking is razor sharp
   const pad=Math.ceil(m.sz*0.45);
   const lw=Math.ceil(m.w+pad*2),lh=Math.ceil(m.sz*1.5+pad);
   const lcv=bc(lw,lh),lg=lcv.getContext('2d');
   lg.font=`800 ${m.sz}px "${lt.font}",sans-serif`;
   lg.textAlign='center';lg.textBaseline='middle';
   lg.fillStyle=lt.color;
   lg.fillText(lt.ch,lw/2,lh/2);

   if(lt.img){
    lg.save();
    lg.globalCompositeOperation='source-in';
    const z=lt.imgZoom/100;
    const cover=Math.max(lw/lt.img.naturalWidth,lh/lt.img.naturalHeight)*z;
    const dw=lt.img.naturalWidth*cover,dh=lt.img.naturalHeight*cover;
    const ox=(lt.imgX/100)*lw*0.5,oy=(lt.imgY/100)*lh*0.5;
    lg.drawImage(lt.img,(lw-dw)/2+ox,(lh-dh)/2+oy,dw,dh);
    lg.restore();
   }
   if(sw>0){
    lg.strokeStyle=sc;lg.lineWidth=sw;lg.lineJoin='round';
    lg.strokeText(lt.ch,lw/2,lh/2);
   }
   g.save();
   g.translate(cx,midY);
   if(lt.tilt)g.rotate(lt.tilt*Math.PI/180);
   g.drawImage(lcv,-lw/2,-lh/2);
   g.restore();
  }
  cursorX+=m.w+track;
 }

 const d=g.getImageData(0,0,cv.width,cv.height);
 if(plLayer&&layers.includes(plLayer)){
  plLayer.cv=cv;plLayer.d=d;plLayer.o=null;plLayer.sil=null;plLayer.gc=null;plLayer.tnc=null;
  plLayer.name='Letters: '+($('pl-text')?.value||'Art').slice(0,16);
  active=plLayer;
 }else{
  pushU(mkSnap('p'));
  plLayer={cv,d,o:null,lk:false,sh:null,ol:null,x:W/2,y:H/2,s:1,r:0,op:1,bm:'source-over',fl:false,vis:true,cl:0,ct:0,cr:0,cb:0,name:'Letters: '+($('pl-text')?.value||'Art').slice(0,16)};
  layers.push(plLayer);active=plLayer;
 }
 refreshLayers();draw();
}

if($('pl-font')){
 $('pl-font').innerHTML=PL_FONTS.map(f=>`<option value="${f}">${f}</option>`).join('');
}
$('pl-text')?.addEventListener('input',()=>{syncLettersFromText();if(plLayer&&layers.includes(plLayer))renderPerLetterLayer()});
$('pl-tiles')?.addEventListener('click',e=>{
 const b=e.target.closest('[data-pli]');if(!b)return;
 plSel=+b.dataset.pli;renderLetterTiles();syncLetterInspector();
});
$('pl-font')?.addEventListener('change',()=>{if(plLetters[plSel]){plLetters[plSel].font=$('pl-font').value;renderLetterTiles();if(plLayer&&layers.includes(plLayer))renderPerLetterLayer()}});
$('pl-col')?.addEventListener('input',()=>{if(plLetters[plSel]){plLetters[plSel].color=$('pl-col').value;renderLetterTiles();if(plLayer&&layers.includes(plLayer))renderPerLetterLayer()}});
$('pl-scale')?.addEventListener('input',()=>{if(plLetters[plSel]){plLetters[plSel].scale=+$('pl-scale').value;syncLetterInspector();if(plLayer&&layers.includes(plLayer))renderPerLetterLayer()}});
$('pl-tilt')?.addEventListener('input',()=>{if(plLetters[plSel]){plLetters[plSel].tilt=+$('pl-tilt').value;syncLetterInspector();if(plLayer&&layers.includes(plLayer))renderPerLetterLayer()}});
$('pl-img-zoom')?.addEventListener('input',()=>{if(plLetters[plSel]){plLetters[plSel].imgZoom=+$('pl-img-zoom').value;syncLetterInspector();if(plLayer&&layers.includes(plLayer))renderPerLetterLayer()}});
$('pl-img-x')?.addEventListener('input',()=>{if(plLetters[plSel]){plLetters[plSel].imgX=+$('pl-img-x').value;syncLetterInspector();if(plLayer&&layers.includes(plLayer))renderPerLetterLayer()}});
$('pl-img-y')?.addEventListener('input',()=>{if(plLetters[plSel]){plLetters[plSel].imgY=+$('pl-img-y').value;syncLetterInspector();if(plLayer&&layers.includes(plLayer))renderPerLetterLayer()}});
['pl-size','pl-track','pl-sw','pl-scol'].forEach(id=>$(id)?.addEventListener('input',()=>{if(plLayer&&layers.includes(plLayer))renderPerLetterLayer()}));

$('pl-img-btn')?.addEventListener('click',()=>$('pl-img-file')?.click());
$('pl-img-file')?.addEventListener('change',e=>{
 const f=e.target.files?.[0];e.target.value='';if(!f||!plLetters[plSel])return;
 const im=new Image(),u=URL.createObjectURL(f);
 im.onload=()=>{
  URL.revokeObjectURL(u);
  plLetters[plSel].img=im;
  renderLetterTiles();syncLetterInspector();
  renderPerLetterLayer();
  showToast(`Filled letter "${plLetters[plSel].ch}" with image!`,1500);
 };
 im.src=u;
});
$('pl-img-clear')?.addEventListener('click',()=>{
 if(!plLetters[plSel])return;
 plLetters[plSel].img=null;renderLetterTiles();syncLetterInspector();
 if(plLayer&&layers.includes(plLayer))renderPerLetterLayer();
});
$('pl-add')?.addEventListener('click',()=>{plLayer=null;renderPerLetterLayer()});
$('edit-by-letter-btn')?.addEventListener('click',()=>{
 const box=$('per-letter-studio');
 const curTxt=($('txt')?.value||active?.tx?.t||'TOTONE').replace(/\s+/g,' ').trim().slice(0,24)||'TOTONE';
 if($('pl-text'))$('pl-text').value=curTxt;
 const curFont=active?.tx?.f||'Archivo Black';
 const curCol=active?.tx?.c||'#ffffff';
 plLetters=[];
 for(let i=0;i<curTxt.length;i++){
  plLetters.push({...defaultLetter(curTxt[i],i),font:PL_FONTS.includes(curFont)?curFont:'Archivo Black',color:curCol});
 }
 plSel=0;
 renderLetterTiles();syncLetterInspector();
 if(box){box.open=true;box.scrollIntoView({behavior:'smooth',block:'nearest'})}
 if(active?.tx&&base){
  // Hide original plain text layer and replace with live per-letter layer at same position
  const ox=active.x,oy=active.y;
  active.vis=false;
  plLayer=null;
  renderPerLetterLayer().then(()=>{
   if(plLayer){plLayer.x=ox;plLayer.y=oy;refreshLayers();draw()}
  });
 }
});
syncLettersFromText();


/* ==========================================================================
   2. DEDICATED PRO BORDERS MODE (Edit -> Borders, incl. Custom Image Borders)
   ========================================================================== */
const BORDER_STYLES=[
 {id:'white',name:'Gallery White',prev:'#f7f6f2'},
 {id:'black',name:'Matte Black',prev:'#141416'},
 {id:'cream',name:'Archival Cream',prev:'#ebe3d2'},
 {id:'pinstripe',name:'Double Pinstripe',prev:'#f7f6f2;box-shadow:inset 0 0 0 3px #18181b'},
 {id:'split',name:'Museum Mat',prev:'#f4f2ec'},
 {id:'deckle',name:'Torn Deckle Paper',prev:'#efe8d8'},
 {id:'film35',name:'35mm Contact',prev:'#101012'},
 {id:'brass',name:'Brushed Gold',prev:'linear-gradient(135deg,#c9a458,#f2dc98,#9e7932)'},
 {id:'wood',name:'Walnut Frame',prev:'linear-gradient(135deg,#3d2618,#5e3c25,#2b1a10)'},
 {id:'custom',name:'Custom Color',prev:'linear-gradient(135deg,#3b82f6,#8b5cf6)'},
 {id:'image',name:'Image Border',prev:'linear-gradient(135deg,#334155,#64748b)'}
];

let brdStyle='white',brdSrc=null,brdActive=false,brdOffset={x:0,y:0},brdImg=null;
$('file')?.addEventListener('change',()=>{brdSrc=null;brdActive=false;brdOffset={x:0,y:0}});
$('rlook')?.addEventListener('click',()=>{brdSrc=null;brdActive=false;brdOffset={x:0,y:0};if($('brd-clear'))$('brd-clear').disabled=true});

function renderBorderLive(){
 if(!base){showToast('Open an image first',1400);return}
 if(!brdSrc){
  pushU(cropSnap());
  brdSrc={W,H,base:new ImageData(new Uint8ClampedArray(base.data),W,H),orig:new ImageData(new Uint8ClampedArray(orig.data),W,H)};
  brdOffset={x:0,y:0};
 }
 brdActive=true;
 const sw=brdSrc.W,sh=brdSrc.H;
 const pct=clamp(+$('brd-size')?.value||8,1,30)/100;
 const rad=clamp(+$('brd-rad')?.value||0,0,80);
 const shd=!!$('brd-shadow')?.checked;
 const col=$('brd-col')?.value||'#2f7cf6';
 const imgFit=$('brd-img-fit')?.value||'cover';

 const pad=Math.max(12,Math.round(Math.min(sw,sh)*pct));
 const padL=pad,padR=pad,padT=pad;
 const padB=brdStyle==='split'?Math.round(pad*1.75):pad;
 const nw=sw+padL+padR,nh=sh+padT+padB;

 const photoCv=bc(sw,sh);
 photoCv.getContext('2d').putImageData(brdSrc.base,0,0);
 const outCv=bc(nw,nh),g=outCv.getContext('2d');

 // Fill border surface
 if(brdStyle==='white'||brdStyle==='pinstripe'||brdStyle==='split'){g.fillStyle='#f6f5f0';g.fillRect(0,0,nw,nh)}
 else if(brdStyle==='black'){g.fillStyle='#131316';g.fillRect(0,0,nw,nh)}
 else if(brdStyle==='cream'||brdStyle==='deckle'){g.fillStyle='#ece4d2';g.fillRect(0,0,nw,nh)}
 else if(brdStyle==='film35'){g.fillStyle='#0c0c0e';g.fillRect(0,0,nw,nh)}
 else if(brdStyle==='brass'){
  const gr=g.createLinearGradient(0,0,nw,nh);
  gr.addColorStop(0,'#b89143');gr.addColorStop(0.45,'#f1da97');gr.addColorStop(0.75,'#c7a050');gr.addColorStop(1,'#8a6627');
  g.fillStyle=gr;g.fillRect(0,0,nw,nh);
 }else if(brdStyle==='wood'){
  const gr=g.createLinearGradient(0,0,nw,nh);
  gr.addColorStop(0,'#3b2416');gr.addColorStop(0.5,'#573722');gr.addColorStop(1,'#29180e');
  g.fillStyle=gr;g.fillRect(0,0,nw,nh);
  g.strokeStyle='rgba(0,0,0,0.16)';g.lineWidth=2;
  for(let y=0;y<nh;y+=6){g.beginPath();g.moveTo(0,y);g.lineTo(nw,y+Math.sin(y*0.04)*4);g.stroke()}
 }else if(brdStyle==='custom'){g.fillStyle=col;g.fillRect(0,0,nw,nh)}
 else if(brdStyle==='image'&&brdImg){
  if(imgFit==='tile'){
   const pat=g.createPattern(brdImg,'repeat');
   if(pat){g.fillStyle=pat;g.fillRect(0,0,nw,nh)}
  }else if(imgFit==='stretch'){
   g.drawImage(brdImg,0,0,nw,nh);
  }else{
   const sc=Math.max(nw/brdImg.naturalWidth,nh/brdImg.naturalHeight);
   const dw=brdImg.naturalWidth*sc,dh=brdImg.naturalHeight*sc;
   g.drawImage(brdImg,(nw-dw)/2,(nh-dh)/2,dw,dh);
  }
 }else{g.fillStyle='#24262d';g.fillRect(0,0,nw,nh)}

 // Special border details
 if(brdStyle==='film35'){
  const hw=Math.max(8,Math.round(pad*0.42)),hh=Math.round(hw*1.35),gap=Math.round(hh*1.65);
  g.fillStyle='#e4e4e8';
  for(let y=padT;y<nh-padB-hh;y+=gap){
   g.beginPath();g.roundRect(Math.round((padL-hw)/2),y,hw,hh,3);g.fill();
   g.beginPath();g.roundRect(nw-padR+Math.round((padR-hw)/2),y,hw,hh,3);g.fill();
  }
  g.fillStyle='#d97706';g.font=`700 ${Math.max(10,Math.round(pad*0.26))}px "Space Mono",monospace`;
  g.fillText('KODAK 400TX   14A        15A',padL,Math.round(padT*0.66));
 }

 // Draw photo with optional rounded corners & inner shadow
 g.save();
 if(shd){g.shadowColor='rgba(0,0,0,0.42)';g.shadowBlur=Math.max(10,pad*0.35);g.shadowOffsetY=Math.round(pad*0.08)}
 if(brdStyle==='deckle'){
  // Organic deckle-edge rough paper cutout around photo
  g.beginPath();
  const seg=12;
  for(let x=padL;x<=padL+sw;x+=seg)g.lineTo(x,padT+(Math.sin(x*0.17)*2.2));
  for(let y=padT;y<=padT+sh;y+=seg)g.lineTo(padL+sw+(Math.cos(y*0.19)*2.2),y);
  for(let x=padL+sw;x>=padL;x-=seg)g.lineTo(x,padT+sh+(Math.sin(x*0.23)*2.2));
  for(let y=padT+sh;y>=padT;y-=seg)g.lineTo(padL+(Math.cos(y*0.15)*2.2),y);
  g.closePath();g.clip();
  g.drawImage(photoCv,padL,padT);
 }else if(rad>0){
  g.beginPath();g.roundRect(padL,padT,sw,sh,rad);g.fillStyle='#000';g.fill();
  g.shadowColor='transparent';g.clip();g.drawImage(photoCv,padL,padT);
 }else{
  g.drawImage(photoCv,padL,padT);
 }
 g.restore();

 if(brdStyle==='pinstripe'){
  const ins=Math.max(6,Math.round(pad*0.28));
  g.strokeStyle='rgba(20,20,24,0.75)';g.lineWidth=Math.max(1.5,pad*0.03);
  g.strokeRect(padL-ins,padT-ins,sw+ins*2,sh+ins*2);
 }

 const finalIm=g.getImageData(0,0,nw,nh);
 const dx=padL-brdOffset.x,dy=padT-brdOffset.y;
 brdOffset={x:padL,y:padT};
 W=nw;H=nh;c.width=W;c.height=H;
 base=new ImageData(new Uint8ClampedArray(finalIm.data),W,H);
 orig=new ImageData(new Uint8ClampedArray(finalIm.data),W,H);
 sel=null;if(dx||dy)layers.forEach(l=>{l.x+=dx;l.y+=dy});
 outIm=null;fcache=null;cdirty=true;SCR.clear();jit=null;
 if(zoomV&&$('zoom').value!=='0')c.style.width=W*zoomV+'px';
 film?.rememberPixels();CR=tab==='crop'?cropInit():null;
 extract();updInfo();refreshLayers();if(typeof cropInfo==='function')cropInfo();draw();
 if($('brd-clear'))$('brd-clear').disabled=false;
}

const brdGrid=$('brd-style-grid');
if(brdGrid){
 brdGrid.innerHTML=BORDER_STYLES.map(s=>`<button type="button" class="brd-card${s.id==='white'?' on':''}" data-bs="${s.id}"><i style="background:${s.prev}"></i><span>${s.name}</span></button>`).join('');
 brdGrid.addEventListener('click',e=>{
  const b=e.target.closest('[data-bs]');if(!b)return;
  brdStyle=b.dataset.bs;
  brdGrid.querySelectorAll('.brd-card').forEach(x=>x.classList.toggle('on',x===b));
  if($('brd-col-row'))$('brd-col-row').hidden=brdStyle!=='custom';
  if($('brd-img-row'))$('brd-img-row').hidden=brdStyle!=='image';
  if(brdStyle==='image'&&!brdImg){$('brd-img-file')?.click();return}
  renderBorderLive();
 });
}
$('brd-img-btn')?.addEventListener('click',()=>$('brd-img-file')?.click());
$('brd-img-file')?.addEventListener('change',e=>{
 const f=e.target.files?.[0];e.target.value='';if(!f)return;
 const im=new Image(),u=URL.createObjectURL(f);
 im.onload=()=>{URL.revokeObjectURL(u);brdImg=im;brdStyle='image';renderBorderLive();showToast('Applied custom image border!',1600)};
 im.src=u;
});
['brd-size','brd-rad','brd-col'].forEach(id=>$(id)?.addEventListener('input',()=>{if(brdActive)renderBorderLive()}));
['brd-shadow','brd-img-fit'].forEach(id=>$(id)?.addEventListener('change',()=>{if(brdActive)renderBorderLive()}));
$('brd-clear')?.addEventListener('click',()=>{
 if(!brdSrc||!brdActive)return;
 pushU(cropSnap());
 const dx=-brdOffset.x,dy=-brdOffset.y;
 W=brdSrc.W;H=brdSrc.H;c.width=W;c.height=H;
 base=new ImageData(new Uint8ClampedArray(brdSrc.base.data),W,H);
 orig=new ImageData(new Uint8ClampedArray(brdSrc.orig.data),W,H);
 if(dx||dy)layers.forEach(l=>{l.x+=dx;l.y+=dy});
 brdSrc=null;brdActive=false;brdOffset={x:0,y:0};
 outIm=null;fcache=null;cdirty=true;SCR.clear();jit=null;
 if(zoomV&&$('zoom').value!=='0')c.style.width=W*zoomV+'px';
 film?.rememberPixels();extract();updInfo();refreshLayers();draw();
 $('brd-clear').disabled=true;
 showToast('Removed border',1200);
});


/* ==========================================================================
   3. FLOATING "ALL LAYERS" DRAWER (Left Side of Canvas — Full Layer View!)
   ========================================================================== */
const alBtn=$('all-layers-btn'),alDrawer=$('all-layers-drawer'),alList=$('all-layers-list'),alCount=$('all-layers-count');
function renderAllLayersDrawer(){
 if(!alCount)return;
 const emp=$('empty'),cv=$('c');
 const hasImg=cv&&getComputedStyle(cv).display!=='none'&&(!emp||getComputedStyle(emp).display==='none');
 if(alBtn)alBtn.hidden=!hasImg;
 if(!hasImg&&alDrawer)alDrawer.hidden=true;
 alCount.textContent=String(layers.length);
 if(!alDrawer||alDrawer.hidden||!alList)return;
 if(!layers.length){
  alList.innerHTML='<p class="note" style="padding:14px 8px;text-align:center">No layers yet. Add text, stickers, shapes, overlays, or paste an image.</p>';
  return;
 }
 alList.innerHTML='';
 for(let i=layers.length-1;i>=0;i--){
  const l=layers[i];
  const row=document.createElement('div');
  row.className='al-row'+(l===active?' on':'')+(l.vis?'':' off');
  const th=document.createElement('canvas');th.width=44;th.height=44;
  if(typeof drawThumbnail==='function')drawThumbnail(th,l);
  else th.getContext('2d').drawImage(l.cv,0,0,44,44);
  const info=document.createElement('div');info.className='al-info';
  info.innerHTML=`<strong>${esc(l.name||'Layer')}</strong><small>${Math.round((l.op??1)*100)}% · ${l.bm||'normal'}</small>`;
  const acts=document.createElement('div');acts.className='al-acts';
  acts.innerHTML=`<button type="button" data-ala="vis" title="Show / hide">${l.vis?'Hide':'Show'}</button><button type="button" data-ala="up" title="Move up">↑</button><button type="button" data-ala="dn" title="Move down">↓</button><button type="button" data-ala="del" title="Delete">✕</button>`;
  row.append(th,info,acts);
  row.addEventListener('click',e=>{
   const act=e.target.closest('[data-ala]')?.dataset.ala;
   if(act==='vis'){l.vis=!l.vis;refreshLayers();draw();renderAllLayersDrawer();return}
   if(act==='up'&&i<layers.length-1){pushU(mkSnap('p'));[layers[i],layers[i+1]]=[layers[i+1],layers[i]];refreshLayers();draw();renderAllLayersDrawer();return}
   if(act==='dn'&&i>0){pushU(mkSnap('p'));[layers[i],layers[i-1]]=[layers[i-1],layers[i]];refreshLayers();draw();renderAllLayersDrawer();return}
   if(act==='del'){pushU(mkSnap('p'));layers.splice(i,1);if(active===l)active=layers[layers.length-1]||null;refreshLayers();draw();renderAllLayersDrawer();return}
   active=l;refreshLayers();draw();renderAllLayersDrawer();
  });
  alList.append(row);
 }
}
alBtn?.addEventListener('click',e=>{
 e.stopPropagation();
 const open=alDrawer.hidden;
 alDrawer.hidden=!open;
 alBtn.setAttribute('aria-expanded',String(open));
 if(open)renderAllLayersDrawer();
});
$('all-layers-close')?.addEventListener('click',()=>{if(alDrawer)alDrawer.hidden=true;alBtn?.setAttribute('aria-expanded','false')});
const llistEl=$('llist');
if(llistEl&&window.MutationObserver){
 new MutationObserver(renderAllLayersDrawer).observe(llistEl,{childList:true,subtree:true,attributes:true});
}
const cvObsEl=$('c');
if(cvObsEl&&window.MutationObserver){
 new MutationObserver(renderAllLayersDrawer).observe(cvObsEl,{attributes:true,attributeFilter:['style','width']});
}
setTimeout(renderAllLayersDrawer,200);
})();
