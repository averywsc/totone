/* Totone Settings Studio, Theme Engine, Safe-Zone Overlays, Live RGB Histogram HUD, Mouse-Wheel Zoom & Spotlight Command Palette */
(function(){
const STORE_KEY='totone_settings_v1';
const THEMES=[
 {id:'navy',name:'Totone Navy',bg:'#050c1f',panel:'#091534',ink:'#f4f7ff',acc:'#ffffff',scheme:'dark'},
 {id:'oled',name:'Midnight OLED',bg:'#030407',panel:'#0b0e14',ink:'#f1f5f9',acc:'#38bdf8',scheme:'dark'},
 {id:'cyber',name:'Cybercore Lime',bg:'#040a06',panel:'#0a170e',ink:'#ecfdf5',acc:'#4ade80',scheme:'dark'},
 {id:'aero',name:'Frutiger Aero',bg:'#06192c',panel:'#0b2742',ink:'#f0f9ff',acc:'#38e8ff',scheme:'dark'},
 {id:'sakura',name:'Sakura Dusk',bg:'#140813',panel:'#220f21',ink:'#fdf2f8',acc:'#f472b6',scheme:'dark'},
 {id:'obsidian',name:'Studio Neutral',bg:'#111215',panel:'#1b1d22',ink:'#f3f4f6',acc:'#e5e7eb',scheme:'dark'},
 {id:'amber',name:'Warm Film',bg:'#130f0a',panel:'#211a11',ink:'#fffbeb',acc:'#fbbf24',scheme:'dark'},
 {id:'paper',name:'Paper Light',bg:'#e8edf5',panel:'#ffffff',ink:'#0f172a',acc:'#2563eb',scheme:'light'}
];
const DEFAULTS={
 theme:'navy',acc:'#ffffff',bg:'#050c1f',panel:'#091534',ink:'#f4f7ff',
 radius:'4px',density:'normal',font:'Archivo',side:'right',panelw:360,
 motion:false,glass:true,pixelated:'smooth',stagebg:'theme',stagebgCustom:'#111827',
 checker:'dark',safezone:'off',dock:true,statusbar:true,floatbar:true,
 hist:false,border:true,donate:true,wheel:'zoom',paste:'layer',prefix:'totone-',toast:2600
};

function hexToRgb(h){
 const m=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec((h||'').trim());
 return m?[parseInt(m[1],16),parseInt(m[2],16),parseInt(m[3],16)]:[9,21,52];
}
function rgbToHex(r,g,b){return '#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('')}
function mixHex(a,b,t){const A=hexToRgb(a),B=hexToRgb(b);return rgbToHex(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t)}
function lumaHex(h){const [r,g,b]=hexToRgb(h);return (0.299*r+0.587*g+0.114*b)/255}

let prefs={...DEFAULTS};
try{const raw=localStorage.getItem(STORE_KEY);if(raw)prefs={...DEFAULTS,...JSON.parse(raw)}}catch{}
window.totoneSettings=prefs;

function savePrefs(){
 window.totoneSettings=prefs;
 try{localStorage.setItem(STORE_KEY,JSON.stringify(prefs))}catch{}
}

function applyPrefs(){
 const r=document.documentElement.style;
 const isLight=lumaHex(prefs.panel)>0.55;
 const line=mixHex(prefs.panel,prefs.ink,isLight?0.14:0.12);
 const edge=mixHex(prefs.panel,prefs.ink,isLight?0.28:0.27);
 const mute=mixHex(prefs.ink,prefs.panel,isLight?0.42:0.44);
 const accInk=lumaHex(prefs.acc)>0.56?'#050c1f':'#ffffff';
 r.setProperty('--bg',prefs.bg);
 r.setProperty('--panel',prefs.panel);
 r.setProperty('--ink',prefs.ink);
 r.setProperty('--mute',mute);
 r.setProperty('--line',line);
 r.setProperty('--edge',edge);
 r.setProperty('--acc',prefs.acc);
 r.setProperty('--accink',accInk);
 r.setProperty('--ui-radius',prefs.radius||'4px');
 r.setProperty('--panel-w',(prefs.panelw||360)+'px');
 r.setProperty('--stage-bg',prefs.stagebg==='theme'?prefs.bg:prefs.stagebg==='custom'?prefs.stagebgCustom:prefs.stagebg);
 const fontMap={
  Archivo:'Archivo,"Helvetica Neue",Arial,sans-serif',
  Inter:'Inter,system-ui,sans-serif',
  Poppins:'Poppins,system-ui,sans-serif',
  'Space Mono':'"Space Mono",ui-monospace,monospace',
  'system-ui':'system-ui,-apple-system,"Segoe UI",sans-serif'
 };
 r.setProperty('--ui-font',fontMap[prefs.font]||fontMap.Archivo);
 document.documentElement.style.colorScheme=isLight?'light':'dark';

 const b=document.body.classList;
 b.toggle('density-compact',prefs.density==='compact');
 b.toggle('density-cozy',prefs.density==='cozy');
 b.toggle('sidebar-left',prefs.side==='left');
 b.toggle('reduce-motion',!!prefs.motion);
 b.toggle('glass-ui',!!prefs.glass);
 b.toggle('canvas-pixelated',prefs.pixelated==='pixelated');
 b.toggle('canvas-noborder',!prefs.border);
 b.toggle('hide-dock',!prefs.dock);
 b.toggle('hide-statusbar',!prefs.statusbar);
 b.toggle('hide-floatbar',!prefs.floatbar);
 b.toggle('hide-donate',!prefs.donate);
 b.toggle('checker-light',prefs.checker==='light');
 b.toggle('checker-contrast',prefs.checker==='contrast');
 b.toggle('checker-solid',prefs.checker==='solid');

 const hud=$('hist-hud');
 if(hud){hud.hidden=!prefs.hist;if(prefs.hist)scheduleHistogram()}
 drawSafeZones();
 syncSettingsUI();
}

function syncSettingsUI(){
 if(!$('settings-dialog'))return;
 $('set-acc').value=prefs.acc;
 $('set-bg').value=prefs.bg;
 $('set-panel').value=prefs.panel;
 $('set-ink').value=prefs.ink;
 $('set-radius').value=prefs.radius;
 $('set-density').value=prefs.density;
 $('set-font').value=prefs.font;
 $('set-side').value=prefs.side;
 $('set-panelw').value=prefs.panelw;
 $('set-panelw-out').textContent=prefs.panelw+' px';
 $('set-motion').checked=!!prefs.motion;
 $('set-glass').checked=!!prefs.glass;
 $('set-pixelated').value=prefs.pixelated;
 $('set-stagebg').value=prefs.stagebg;
 $('set-stagebg-custom-row').hidden=prefs.stagebg!=='custom';
 $('set-stagebg-custom').value=prefs.stagebgCustom;
 $('set-checker').value=prefs.checker;
 $('set-safezone').value=prefs.safezone;
 $('set-dock').checked=!!prefs.dock;
 $('set-statusbar').checked=!!prefs.statusbar;
 $('set-floatbar').checked=!!prefs.floatbar;
 $('set-hist').checked=!!prefs.hist;
 $('set-border').checked=!!prefs.border;
 $('set-donate').checked=!!prefs.donate;
 $('set-wheel').value=prefs.wheel;
 $('set-paste').value=prefs.paste;
 $('set-prefix').value=prefs.prefix;
 $('set-toast').value=String(prefs.toast);
 document.querySelectorAll('#set-themes .theme-chip').forEach(el=>{
  el.classList.toggle('on',el.dataset.tid===prefs.theme);
 });
}

/* ---------- Theme Grid & Settings Modal Wiring ---------- */
const themeGrid=$('set-themes');
if(themeGrid){
 themeGrid.innerHTML=THEMES.map(t=>`<button type="button" class="theme-chip" data-tid="${t.id}"><span class="swatches"><i style="background:${t.bg}"></i><i style="background:${t.panel}"></i><i style="background:${t.acc}"></i></span><small>${t.name}</small></button>`).join('');
 themeGrid.onclick=e=>{
  const btn=e.target.closest('.theme-chip');if(!btn)return;
  const t=THEMES.find(x=>x.id===btn.dataset.tid);if(!t)return;
  prefs.theme=t.id;prefs.bg=t.bg;prefs.panel=t.panel;prefs.ink=t.ink;prefs.acc=t.acc;
  savePrefs();applyPrefs();showToast('Theme: '+t.name,1200);
 };
}

function bindSet(id,key,parse=v=>v,customTheme=false){
 const el=$(id);if(!el)return;
 const ev=el.type==='checkbox'||el.tagName==='SELECT'?'change':'input';
 el.addEventListener(ev,()=>{
  prefs[key]=el.type==='checkbox'?el.checked:parse(el.value);
  if(customTheme)prefs.theme='custom';
  savePrefs();applyPrefs();
 });
}
bindSet('set-acc','acc',v=>v,true);
bindSet('set-bg','bg',v=>v,true);
bindSet('set-panel','panel',v=>v,true);
bindSet('set-ink','ink',v=>v,true);
bindSet('set-radius','radius');
bindSet('set-density','density');
bindSet('set-font','font');
bindSet('set-side','side');
bindSet('set-panelw','panelw',Number);
bindSet('set-motion','motion');
bindSet('set-glass','glass');
bindSet('set-pixelated','pixelated');
bindSet('set-stagebg','stagebg');
bindSet('set-stagebg-custom','stagebgCustom');
bindSet('set-checker','checker');
bindSet('set-safezone','safezone');
bindSet('set-dock','dock');
bindSet('set-statusbar','statusbar');
bindSet('set-floatbar','floatbar');
bindSet('set-hist','hist');
bindSet('set-border','border');
bindSet('set-donate','donate');
bindSet('set-wheel','wheel');
bindSet('set-paste','paste');
bindSet('set-prefix','prefix');
bindSet('set-toast','toast',Number);

$('set-tabs')?.addEventListener('click',e=>{
 const b=e.target.closest('[data-st]');if(!b)return;
 document.querySelectorAll('#set-tabs button').forEach(x=>x.classList.toggle('on',x===b));
 document.querySelectorAll('.set-pane').forEach(p=>p.hidden=p.id!=='st-'+b.dataset.st);
 if(b.dataset.st==='workflow')updateStorageInfo();
});

function updateStorageInfo(){
 const el=$('set-storage-info');if(!el)return;
 try{
  let bytes=0;
  for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);bytes+=(k.length+(localStorage.getItem(k)||'').length)*2}
  el.textContent=`Local browser storage used: ${(bytes/1024).toFixed(1)} KB across ${localStorage.length} saved entries (settings, custom looks, recovery session).`;
 }catch{el.textContent='Local browser storage is active.'}
}

function openSettings(tab='theme'){
 syncSettingsUI();updateStorageInfo();
 const btn=document.querySelector(`#set-tabs [data-st="${tab}"]`);
 if(btn)btn.click();
 $('settings-dialog').showModal();
}
window.openTotoneSettings=openSettings;
$('settings-open')?.addEventListener('click',()=>openSettings('theme'));
$('set-close')?.addEventListener('click',()=>$('settings-dialog').close());
$('settings-dialog')?.addEventListener('click',e=>{if(e.target===$('settings-dialog'))$('settings-dialog').close()});
$('tool-dock')?.addEventListener('click',e=>{
 const b=e.target.closest('[data-dock="settings"]');
 if(b){e.stopImmediatePropagation();openSettings('theme')}
},true);

$('set-reset')?.addEventListener('click',()=>{
 prefs={...DEFAULTS};savePrefs();applyPrefs();showToast('All settings reset to default',1500);
});
$('set-export')?.addEventListener('click',()=>{
 const blob=new Blob([JSON.stringify(prefs,null,2)],{type:'application/json'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='totone-settings.json';a.click();
 setTimeout(()=>URL.revokeObjectURL(a.href),1500);
 showToast('Exported totone-settings.json',1400);
});
$('set-import')?.addEventListener('click',()=>$('set-import-file').click());
$('set-import-file')?.addEventListener('change',async e=>{
 const f=e.target.files?.[0];e.target.value='';if(!f)return;
 try{
  const parsed=JSON.parse(await f.text());
  prefs={...DEFAULTS,...parsed};savePrefs();applyPrefs();
  showToast('Settings imported!',1400);
 }catch{showToast('Invalid settings JSON file',1800)}
});

/* ---------- Searchable Shortcuts Cheat-Sheet ---------- */
const SHORTCUTS=[
 ['Ctrl + K / /','Open Spotlight Command Palette'],
 ['Ctrl + ,','Open Settings & Theme Customizer'],
 ['Ctrl + Z / Ctrl + Y','Undo / Redo edit'],
 ['Ctrl + J','Duplicate active layer (Layer via Copy)'],
 ['Ctrl + V','Paste image from clipboard onto canvas'],
 ['Ctrl + Shift + C','Copy full rendered canvas PNG to clipboard'],
 ["Ctrl + '",'Toggle Canvas Rulers & Snap Grid'],
 ['Hold Space / Cmp','Compare original before/after'],
 ['V / W / B / U','Move Layers · Select · Brush · Shapes/Design'],
 ['T / C / G / Q','Typography · Crop · Lightroom Grade · Warp'],
 ['[ / ]','Decrease / Increase active brush size'],
 ['Double-Click Slider','Reset any slider to default value'],
 ['Right-Click Canvas','Quick Layer & AI Action Context Menu'],
 ['Scroll Wheel','Smooth Zoom canvas (configurable in Settings)']
];
function renderShortcuts(q=''){
 const list=$('set-key-list');if(!list)return;
 const s=q.trim().toLowerCase();
 list.innerHTML=SHORTCUTS.filter(([k,d])=>!s||k.toLowerCase().includes(s)||d.toLowerCase().includes(s))
  .map(([k,d])=>`<div class="key-row"><span>${d}</span><kbd>${k}</kbd></div>`).join('')||'<div class="key-row"><span>No matching shortcuts</span></div>';
}
renderShortcuts();
$('set-key-q')?.addEventListener('input',e=>renderShortcuts(e.target.value));

/* ---------- Safe-Zone & Composition Guides Overlay ---------- */
const guideCv=$('stage-guides');
function drawSafeZones(){
 if(!base||!guideCv||prefs.safezone==='off'){
  if(guideCv&&$('grid-toggle')?.getAttribute('aria-pressed')!=='true')guideCv.style.display='none';
  return;
 }
 const cr=c.getBoundingClientRect();
 if(!cr.width||!cr.height)return;
 const gridOn=$('grid-toggle')?.getAttribute('aria-pressed')==='true';
 const dpr=Math.min(2,devicePixelRatio||1),ruler=gridOn?18:0;
 if(!gridOn){
  guideCv.style.display='block';
  guideCv.style.left=cr.left+'px';guideCv.style.top=cr.top+'px';
  guideCv.style.width=cr.width+'px';guideCv.style.height=cr.height+'px';
  const pw=Math.max(1,Math.round(cr.width*dpr)),ph=Math.max(1,Math.round(cr.height*dpr));
  if(guideCv.width!==pw)guideCv.width=pw;if(guideCv.height!==ph)guideCv.height=ph;
 }
 const g=guideCv.getContext('2d');
 g.save();g.setTransform(dpr,0,0,dpr,0,0);
 if(!gridOn)g.clearRect(0,0,cr.width,cr.height);
 const ox=ruler,oy=ruler,w=cr.width,h=cr.height;
 const mode=prefs.safezone;
 g.strokeStyle='rgba(56,189,248,0.75)';g.lineWidth=1;g.setLineDash([5,4]);
 if(mode==='thirds'){
  g.beginPath();
  [1/3,2/3].forEach(t=>{g.moveTo(ox+w*t,oy);g.lineTo(ox+w*t,oy+h);g.moveTo(ox,oy+h*t);g.lineTo(ox+w,oy+h*t)});
  g.stroke();
 }else if(mode==='golden'){
  g.beginPath();
  [0.382,0.618].forEach(t=>{g.moveTo(ox+w*t,oy);g.lineTo(ox+w*t,oy+h);g.moveTo(ox,oy+h*t);g.lineTo(ox+w,oy+h*t)});
  g.stroke();
 }else if(mode==='cross'){
  g.beginPath();
  g.moveTo(ox+w/2,oy);g.lineTo(ox+w/2,oy+h);g.moveTo(ox,oy+h/2);g.lineTo(ox+w,oy+h/2);
  g.stroke();
  g.beginPath();g.arc(ox+w/2,oy+h/2,Math.min(w,h)*0.08,0,Math.PI*2);g.stroke();
 }else if(mode==='reels'){
  g.fillStyle='rgba(244,63,94,0.16)';
  g.fillRect(ox,oy,w,h*0.13);g.fillRect(ox,oy+h*0.76,w,h*0.24);g.fillRect(ox+w*0.84,oy+h*0.35,w*0.16,h*0.41);
  g.strokeStyle='rgba(251,113,133,0.9)';g.strokeRect(ox+w*0.05,oy+h*0.13,w*0.79,h*0.63);
  g.fillStyle='rgba(255,255,255,0.85)';g.font='600 10px system-ui';g.fillText('REELS / TIKTOK SAFE ZONE',ox+w*0.07,oy+h*0.13+14);
 }else if(mode==='yt'){
  g.fillStyle='rgba(251,191,36,0.22)';
  g.fillRect(ox+w*0.82,oy+h*0.84,w*0.16,h*0.13);
  g.strokeStyle='rgba(251,191,36,0.85)';g.strokeRect(ox+w*0.04,oy+h*0.06,w*0.92,h*0.88);
  g.fillStyle='rgba(255,255,255,0.9)';g.font='600 10px system-ui';g.fillText('TIMESTAMP',ox+w*0.83,oy+h*0.92);
 }else if(mode==='square'){
  const s=Math.min(w,h),sx=ox+(w-s)/2,sy=oy+(h-s)/2;
  g.fillStyle='rgba(0,0,0,0.42)';
  if(w>h){g.fillRect(ox,oy,(w-s)/2,h);g.fillRect(sx+s,oy,(w-s)/2,h)}
  else{g.fillRect(ox,oy,w,(h-s)/2);g.fillRect(ox,sy+s,w,(h-s)/2)}
  g.strokeStyle='rgba(255,255,255,0.85)';g.strokeRect(sx,sy,s,s);
 }
 g.restore();
}
window.drawTotoneSafeZones=drawSafeZones;

/* ---------- Live Floating RGB Histogram HUD ---------- */
let histRAF=0;
function drawHistogramHUD(){
 histRAF=0;
 const hud=$('hist-hud'),hc=$('hist-hud-canvas');
 if(!hud||hud.hidden||!base||!c.width)return;
 const sm=bc(160,Math.max(1,Math.round(160*c.height/c.width)));
 const sg=sm.getContext('2d',{willReadFrequently:true});
 sg.drawImage(c,0,0,sm.width,sm.height);
 const d=sg.getImageData(0,0,sm.width,sm.height).data;
 const hr=new Uint32Array(256),hg=new Uint32Array(256),hb=new Uint32Array(256),hl=new Uint32Array(256);
 for(let i=0;i<d.length;i+=4){
  if(d[i+3]<16)continue;
  hr[d[i]]++;hg[d[i+1]]++;hb[d[i+2]]++;
  hl[(d[i]*77+d[i+1]*150+d[i+2]*29)>>8]++;
 }
 let mx=1;
 for(let i=2;i<254;i++)mx=Math.max(mx,hr[i],hg[i],hb[i],hl[i]);
 const g=hc.getContext('2d'),w=hc.width,h=hc.height;
 g.clearRect(0,0,w,h);
 g.strokeStyle='rgba(255,255,255,0.08)';g.lineWidth=1;
 for(const x of [0.25,0.5,0.75]){g.beginPath();g.moveTo(w*x,0);g.lineTo(w*x,h);g.stroke()}
 const plot=(arr,col)=>{
  g.fillStyle=col;g.beginPath();g.moveTo(0,h);
  for(let i=0;i<256;i++){const x=i/255*w,y=h-Math.min(1,arr[i]/mx)*(h-4);g.lineTo(x,y)}
  g.lineTo(w,h);g.closePath();g.fill();
 };
 g.globalCompositeOperation='screen';
 plot(hr,'rgba(248,113,113,0.58)');
 plot(hg,'rgba(74,222,128,0.58)');
 plot(hb,'rgba(96,165,250,0.58)');
 g.globalCompositeOperation='source-over';
 g.strokeStyle='rgba(255,255,255,0.55)';g.beginPath();
 for(let i=0;i<256;i++){const x=i/255*w,y=h-Math.min(1,hl[i]/mx)*(h-4);if(i)g.lineTo(x,y);else g.moveTo(x,y)}
 g.stroke();
}
function scheduleHistogram(){if(!histRAF)histRAF=requestAnimationFrame(drawHistogramHUD)}
$('hist-hud-close')?.addEventListener('click',()=>{prefs.hist=false;savePrefs();applyPrefs()});

// Make Histogram HUD draggable by its header
(function makeHudDraggable(){
 const hud=$('hist-hud'),head=hud?.querySelector('.hud-head');if(!hud||!head)return;
 head.style.cursor='grab';
 let drag=null;
 head.onpointerdown=e=>{
  if(e.target.tagName==='BUTTON')return;
  const r=hud.getBoundingClientRect(),sr=stage.getBoundingClientRect();
  drag={dx:e.clientX-r.left,dy:e.clientY-r.top,sr};
  head.setPointerCapture(e.pointerId);
 };
 head.onpointermove=e=>{
  if(!drag)return;
  hud.style.right='auto';
  hud.style.left=Math.max(6,Math.min(drag.sr.width-hud.offsetWidth-6,e.clientX-drag.sr.left-drag.dx))+'px';
  hud.style.top=Math.max(6,Math.min(drag.sr.height-hud.offsetHeight-6,e.clientY-drag.sr.top-drag.dy))+'px';
 };
 head.onpointerup=()=>{drag=null};
})();

/* ---------- Hook into draw() for Safe Zones & Live Histogram ---------- */
const origDrawSettings=draw;
draw=function(...args){
 const res=origDrawSettings.apply(this,args);
 if(prefs.safezone!=='off')requestAnimationFrame(drawSafeZones);
 if(prefs.hist)scheduleHistogram();
 return res;
};
window.addEventListener('resize',()=>{if(prefs.safezone!=='off')drawSafeZones()});

/* ---------- Photoshop-Style Mouse Wheel Canvas Zoom ---------- */
stage?.addEventListener('wheel',e=>{
 if(!base)return;
 if(prefs.wheel==='ctrl'&&!e.ctrlKey&&!e.metaKey)return;
 if(e.target.closest('dialog,#hist-hud,#layer-float-bar'))return;
 e.preventDefault();
 const selZ=$('zoom');if(!selZ)return;
 const cur=parseFloat(selZ.value)||1;
 const factor=e.deltaY<0?1.15:1/1.15;
 const next=Math.max(0.15,Math.min(8,+(cur*factor).toFixed(2)));
 const zc=$('zc');
 if(zc){zc.value=String(next);zc.textContent=Math.round(next*100)+'%';zc.hidden=false;selZ.value=String(next)}
 selZ.dispatchEvent(new Event('change'));
},{passive:false});

/* ---------- Toast Duration Integration & Export Filename Prefix ---------- */
const origShowToast=showToast;
showToast=function(msg,ms){
 const scaled=ms?ms:prefs.toast;
 return origShowToast(msg,scaled);
};

/* ---------- Spotlight Command Palette (Ctrl+K) ---------- */
const cmdDlg=$('cmd-dialog'),cmdIn=$('cmd-input'),cmdList=$('cmd-list');
let cmdItems=[],cmdSel=0;

function buildCommandItems(){
 const items=[
  {label:'⚙ Open Settings & Theme Customizer',cat:'Settings',run:()=>openSettings('theme')},
  {label:'Liquify Sculpt Studio (Push / Bloat / Pucker / Twirl)',cat:'Magic Studio',run:()=>window.openProStudioTab?.('liquify')},
  {label:'Magic Object Eraser (Offline Inpainting)',cat:'Magic Studio',run:()=>window.openProStudioTab?.('eraser')},
  {label:'Extract Dominant Color Palette & Swatch Card',cat:'Magic Studio',run:()=>window.openProStudioTab?.('palette')},
  {label:'Saved Custom Color Looks Manager',cat:'Magic Studio',run:()=>window.openProStudioTab?.('palette')},
  {label:'Export Print-Ready PDF (jsPDF)',cat:'Export',run:()=>window.openProStudioTab?.('batch')},
  {label:'Batch Image Converter & Compressor (.ZIP)',cat:'Export',run:()=>window.openProStudioTab?.('batch')},
  {label:'Before / After Split Comparison PNG',cat:'Export',run:()=>window.openProStudioTab?.('ba')},
  {label:'SVG Image Vectorizer (Image Trace)',cat:'Pro Studio',run:()=>window.openProStudioTab?.('svg')},
  {label:'Animated GIF & VHS Glitch Loop Maker',cat:'Pro Studio',run:()=>window.openProStudioTab?.('gif')},
  {label:'Device & Media Mockups (iPhone / MacBook / CD / Vinyl)',cat:'Pro Studio',run:()=>window.openProStudioTab?.('mockup')},
  {label:'OCR Grab Text from Image (Tesseract AI)',cat:'Pro Studio',run:()=>window.openProStudioTab?.('ocr')},
  {label:'Tiled Copyright Watermark & EXIF Inspector',cat:'Pro Studio',run:()=>window.openProStudioTab?.('wm')},
  {label:'Copy Full Canvas PNG to Clipboard (Ctrl+Shift+C)',cat:'Quick QoL',run:()=>window.copyTotoneCanvas?.()},
  {label:'Toggle Live Floating RGB Histogram HUD',cat:'View',run:()=>{prefs.hist=!prefs.hist;savePrefs();applyPrefs();showToast(prefs.hist?'RGB Histogram ON':'RGB Histogram OFF',1100)}},
  {label:'Toggle Pixel Art Nearest-Neighbor Mode',cat:'View',run:()=>{prefs.pixelated=prefs.pixelated==='pixelated'?'smooth':'pixelated';savePrefs();applyPrefs();showToast('Rendering: '+prefs.pixelated,1200)}},
  {label:'Toggle Rulers & Snap Grid',cat:'View',run:()=>$('grid-toggle')?.click()},
  {label:'1-Click Smart Auto Enhance',cat:'AI / Color',run:()=>document.querySelector('[data-dock="auto"]')?.click()},
  {label:'AI Remove Background (RMBG-1.4)',cat:'AI',run:()=>document.querySelector('[data-dock="rmbg"]')?.click()},
  {label:'AI Image Upscaler (ESRGAN 2x / 4x)',cat:'AI',run:()=>$('upscale-open')?.click()},
  {label:'Web Elements Search (PNGs / Icons / Pinterest)',cat:'Design',run:()=>$('elements-open')?.click()},
  {label:'New Blank Design / Magic Resize',cat:'Design',run:()=>$('new-canvas-open')?.click()},
  {label:'Visual History Timeline',cat:'Edit',run:()=>$('history-open')?.click()}
 ];
 THEMES.forEach(t=>items.push({
  label:`Theme: ${t.name}`,cat:'Appearance',
  run:()=>{prefs.theme=t.id;prefs.bg=t.bg;prefs.panel=t.panel;prefs.ink=t.ink;prefs.acc=t.acc;savePrefs();applyPrefs();showToast('Theme: '+t.name,1200)}
 }));
 [['off','Off'],['thirds','Rule of Thirds'],['golden','Golden Ratio'],['reels','TikTok / Reels Safe Zone'],['yt','YouTube Thumbnail Safe Zone'],['square','1:1 Square Crop Guide']].forEach(([k,n])=>{
  items.push({label:`Safe-Zone Overlay: ${n}`,cat:'Guides',run:()=>{prefs.safezone=k;savePrefs();applyPrefs();showToast('Guide: '+n,1200)}});
 });
 if(Array.isArray(window.toolCommands)){
  for(const [name,tab,id,kw] of window.toolCommands){
   items.push({label:name,cat:tab,kw,run:()=>jumpTool(tab,id)});
  }
 }
 return items;
}

function renderCmdList(q=''){
 const terms=q.trim().toLowerCase().split(/\s+/).filter(Boolean);
 const all=buildCommandItems();
 cmdItems=all.filter(it=>{
  if(!terms.length)return true;
  const hay=(it.label+' '+it.cat+' '+(it.kw||'')).toLowerCase();
  return terms.every(t=>hay.includes(t));
 }).slice(0,30);
 cmdSel=Math.min(cmdSel,Math.max(0,cmdItems.length-1));
 cmdList.innerHTML=cmdItems.map((it,i)=>`<button type="button" class="cmd-item${i===cmdSel?' on':''}" data-ci="${i}"><span>${it.label}</span><small>${it.cat}</small></button>`).join('')||'<p class="note" style="padding:8px">No matching commands.</p>';
}
function openCommandPalette(){
 cmdSel=0;cmdIn.value='';renderCmdList('');cmdDlg.showModal();cmdIn.focus();
}
$('cmd-open')?.addEventListener('click',openCommandPalette);
cmdIn?.addEventListener('input',()=>{cmdSel=0;renderCmdList(cmdIn.value)});
cmdIn?.addEventListener('keydown',e=>{
 if(e.key==='ArrowDown'){e.preventDefault();cmdSel=(cmdSel+1)%Math.max(1,cmdItems.length);renderCmdList(cmdIn.value)}
 else if(e.key==='ArrowUp'){e.preventDefault();cmdSel=(cmdSel-1+Math.max(1,cmdItems.length))%Math.max(1,cmdItems.length);renderCmdList(cmdIn.value)}
 else if(e.key==='Enter'&&cmdItems[cmdSel]){e.preventDefault();const fn=cmdItems[cmdSel].run;cmdDlg.close();fn()}
});
cmdList?.addEventListener('click',e=>{
 const b=e.target.closest('[data-ci]');if(!b)return;
 const it=cmdItems[+b.dataset.ci];if(!it)return;
 cmdDlg.close();it.run();
});
cmdDlg?.addEventListener('click',e=>{if(e.target===cmdDlg)cmdDlg.close()});

window.addEventListener('keydown',e=>{
 const mod=e.ctrlKey||e.metaKey;
 if(mod&&e.key.toLowerCase()==='k'){e.preventDefault();openCommandPalette()}
 else if(mod&&e.key===','){e.preventDefault();openSettings('theme')}
 else if(!mod&&e.key==='/'&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||'')){e.preventDefault();openCommandPalette()}
});

applyPrefs();
})();
