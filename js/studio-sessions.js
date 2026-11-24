/* Totone Previous Sessions Gallery — IndexedDB Multi-Layer Project Autosave, Visual Thumbnails, Pin, Rename, Export & Instant Lossless Restore */
(function(){
const DB_NAME='totone_sessions_db',STORE='sessions',AUTO_KEY='totone_sessions_auto';
const LR_IDS=['lr-temp','lr-tint','lr-exp','lr-con','lr-hi','lr-sh','lr-wh','lr-bl','lr-tex','lr-cla','lr-deh','lr-vib','lr-sat'];
let dbPromise=null,currentSessionId=null,dirty=false,saving=false,lastSavedHash='';

function openDB(){
 if(dbPromise)return dbPromise;
 dbPromise=new Promise((res,rej)=>{
  const req=indexedDB.open(DB_NAME,1);
  req.onupgradeneeded=e=>{
   const db=e.target.result;
   if(!db.objectStoreNames.contains(STORE)){
    const st=db.createObjectStore(STORE,{keyPath:'id'});
    st.createIndex('updatedAt','updatedAt');
   }
  };
  req.onsuccess=()=>res(req.result);
  req.onerror=()=>rej(req.error);
 });
 return dbPromise;
}

async function idbAll(){
 const db=await openDB();
 return new Promise((res,rej)=>{
  const tx=db.transaction(STORE,'readonly'),req=tx.objectStore(STORE).getAll();
  req.onsuccess=()=>res(req.result||[]);req.onerror=()=>rej(req.error);
 });
}
async function idbGet(id){
 const db=await openDB();
 return new Promise((res,rej)=>{
  const tx=db.transaction(STORE,'readonly'),req=tx.objectStore(STORE).get(id);
  req.onsuccess=()=>res(req.result||null);req.onerror=()=>rej(req.error);
 });
}
async function idbPut(rec){
 const db=await openDB();
 return new Promise((res,rej)=>{
  const tx=db.transaction(STORE,'readwrite'),req=tx.objectStore(STORE).put(rec);
  req.onsuccess=()=>res();req.onerror=()=>rej(req.error);
 });
}
async function idbDel(id){
 const db=await openDB();
 return new Promise((res,rej)=>{
  const tx=db.transaction(STORE,'readwrite'),req=tx.objectStore(STORE).delete(id);
  req.onsuccess=()=>res();req.onerror=()=>rej(req.error);
 });
}

function fmtSize(b){
 if(!b)return '0 KB';
 return b<1048576?(b/1024).toFixed(0)+' KB':(b/1048576).toFixed(2)+' MB';
}
function fmtAgo(ts){
 const s=Math.max(0,Math.floor((Date.now()-ts)/1000));
 if(s<45)return 'Just now';
 if(s<3600)return Math.floor(s/60)+'m ago';
 if(s<86400)return Math.floor(s/3600)+'h ago';
 if(s<604800)return Math.floor(s/86400)+'d ago';
 return new Date(ts).toLocaleDateString(undefined,{month:'short',day:'numeric'});
}
function escapeHtml(s){
 return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function captureThumbnail(){
 if(!c.width||!c.height)return '';
 const maxW=320,sc=Math.min(1,maxW/Math.max(c.width,c.height,1));
 const tw=Math.max(1,Math.round(c.width*sc)),th=Math.max(1,Math.round(c.height*sc));
 const cv=bc(tw,th),g=cv.getContext('2d');
 g.imageSmoothingEnabled=true;
 g.drawImage(c,0,0,tw,th);
 return cv.toDataURL('image/webp',0.78);
}

function captureExtraState(){
 const lr={};
 LR_IDS.forEach(id=>{const el=$(id);if(el)lr[id]=el.value});
 return {lr};
}
function restoreExtraState(extra){
 if(!extra?.lr)return;
 Object.entries(extra.lr).forEach(([id,v])=>{
  const el=$(id);
  if(el){el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}))}
 });
}

async function compressBlob(blob){
 if(window.CompressionStream){
  try{return await new Response(blob.stream().pipeThrough(new CompressionStream('gzip'))).blob()}catch{}
 }
 return blob;
}

async function saveSession({asNew=false,customName='',silent=false}={}){
 if(!base||saving)return null;
 saving=true;
 try{
  const id=(asNew||!currentSessionId)?('ses_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6)):currentSessionId;
  const existing=(!asNew&&currentSessionId)?await idbGet(id):null;
  const fallbackName=(typeof projectTitle==='string'&&projectTitle&&projectTitle!=='Totone')?projectTitle:`Edit ${new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}`;
  const name=(customName||'').trim()||existing?.name||fallbackName;
  const rawBlob=packProject(captureDocument(),typeof versions!=='undefined'?versions:[]);
  const blob=await compressBlob(rawBlob);
  const thumb=captureThumbnail();
  const rec={
   id,name,thumb,blob,
   size:blob.size,w:W,h:H,layers:layers.length,
   pinned:existing?.pinned||false,
   createdAt:existing?.createdAt||Date.now(),
   updatedAt:Date.now(),
   extra:captureExtraState()
  };
  await idbPut(rec);
  currentSessionId=id;
  dirty=false;
  lastSavedHash=`${W}x${H}:${layers.length}:${undoStack?.length||0}:${name}`;
  // Auto-prune unpinned sessions beyond 24 so storage stays fast
  const all=await idbAll();
  const unpinned=all.filter(x=>!x.pinned).sort((a,b)=>b.updatedAt-a.updatedAt);
  for(let i=24;i<unpinned.length;i++)await idbDel(unpinned[i].id);
  if(!silent)showToast(`Saved session "${name}" (${fmtSize(blob.size)})`,1600);
  if($('sessions-dialog')?.open)renderSessionsGrid();
  return rec;
 }catch(err){
  if(!silent)showToast('Could not save session: '+err.message,2200);
  return null;
 }finally{saving=false}
}

async function openSavedSession(id){
 try{
  const rec=await idbGet(id);
  if(!rec||!rec.blob){showToast('Session data not found',1600);return}
  showToast(`Opening "${rec.name}"…`,1200);
  const file=new File([rec.blob],(rec.name||'Totone')+'.totone',{type:rec.blob.type||'application/octet-stream'});
  const bundle=await unpackProject(file);
  installDocument(bundle.doc);
  if(typeof versions!=='undefined')versions=bundle.pins||[];
  if(typeof undoStack!=='undefined')undoStack=[];
  if(typeof redoS!=='undefined')redoS=[];
  if(typeof projectTitle!=='undefined')projectTitle=rec.name;
  if($('project-name'))$('project-name').value=rec.name;
  if(typeof updatePins==='function')updatePins();
  restoreExtraState(rec.extra);
  currentSessionId=rec.id;
  dirty=false;
  $('sessions-dialog')?.close();
  showToast(`Loaded "${rec.name}" (${rec.w}×${rec.h})`,1600);
 }catch(err){
  showToast('Failed to open session: '+err.message,2400);
 }
}

async function renderSessionsGrid(){
 const grid=$('ses-grid'),stats=$('ses-stats');if(!grid)return;
 const q=($('ses-search')?.value||'').trim().toLowerCase();
 let list=[];
 try{list=await idbAll()}catch{grid.innerHTML='<div class="ses-empty">Browser IndexedDB storage is unavailable in this mode.</div>';return}
 list.sort((a,b)=>(b.pinned?1:0)-(a.pinned?1:0)||b.updatedAt-a.updatedAt);
 const totalBytes=list.reduce((s,x)=>s+(x.size||0),0);
 if(stats)stats.textContent=`${list.length} saved session${list.length===1?'':'s'} · ${fmtSize(totalBytes)} in browser`;
 const shown=q?list.filter(x=>(x.name||'').toLowerCase().includes(q)):list;
 if(!shown.length){
  grid.innerHTML=list.length?'<div class="ses-empty">No sessions match your search.</div>':'<div class="ses-empty">No previous sessions saved yet.<br>Open an image and edit — Totone auto-saves your sessions here, or click <b>Save current</b> above!</div>';
  return;
 }
 grid.innerHTML=shown.map(s=>{
  const isCur=s.id===currentSessionId;
  return `<div class="ses-card${isCur?' current':''}" data-sid="${s.id}">
   <div class="ses-thumb-wrap" data-sact="open" title="Click to open ${escapeHtml(s.name)}">
    <img src="${s.thumb}" alt="${escapeHtml(s.name)}">
    ${isCur?'<span class="ses-badge">Active</span>':''}
    <button type="button" class="ses-pin-btn${s.pinned?' pinned':''}" data-sact="pin" title="${s.pinned?'Unpin session':'Pin to top'}">★</button>
   </div>
   <div class="ses-body">
    <div class="ses-title" title="${escapeHtml(s.name)}">${escapeHtml(s.name)}</div>
    <div class="ses-meta">${s.w}×${s.h} · ${s.layers} layer${s.layers===1?'':'s'} · ${fmtSize(s.size)} · ${fmtAgo(s.updatedAt)}</div>
    <div class="ses-actions">
     <button type="button" class="pri" data-sact="open">Open</button>
     <button type="button" class="ses-ic" data-sact="rename" title="Rename session">✎</button>
     <button type="button" class="ses-ic" data-sact="download" title="Download .totone file">↓</button>
     <button type="button" class="ses-ic danger-btn" data-sact="del" title="Delete session">✕</button>
    </div>
   </div>
  </div>`;
 }).join('');
}

function openSessionsModal(){
 const dlg=$('sessions-dialog');if(!dlg)return;
 $('ses-save-now').disabled=!base;
 $('ses-save-copy').disabled=!base;
 $('ses-save-name').value='';
 renderSessionsGrid();
 if(!dlg.open)dlg.showModal();
}
window.openTotoneSessions=openSessionsModal;

$('sessions-open')?.addEventListener('click',openSessionsModal);
$('empty-sessions')?.addEventListener('click',openSessionsModal);
$('ses-close')?.addEventListener('click',()=>$('sessions-dialog')?.close());
$('sessions-dialog')?.addEventListener('click',e=>{if(e.target===$('sessions-dialog'))$('sessions-dialog').close()});
$('ses-search')?.addEventListener('input',renderSessionsGrid);

$('tool-dock')?.addEventListener('click',e=>{
 const b=e.target.closest('[data-dock="sessions"]');
 if(b){e.stopImmediatePropagation();openSessionsModal()}
},true);

$('ses-save-now')?.addEventListener('click',async()=>{
 await saveSession({asNew:false,customName:$('ses-save-name').value});
 $('ses-save-name').value='';
});
$('ses-save-copy')?.addEventListener('click',async()=>{
 await saveSession({asNew:true,customName:$('ses-save-name').value});
 $('ses-save-name').value='';
});
$('ses-clear-unpinned')?.addEventListener('click',async()=>{
 const all=await idbAll();
 let count=0;
 for(const s of all){if(!s.pinned){await idbDel(s.id);count++}}
 if(currentSessionId&&!all.find(x=>x.id===currentSessionId&&x.pinned))currentSessionId=null;
 renderSessionsGrid();
 showToast(count?`Cleared ${count} unpinned session(s)`:'No unpinned sessions to clear',1500);
});

$('ses-grid')?.addEventListener('click',async e=>{
 const actBtn=e.target.closest('[data-sact]');
 const card=e.target.closest('[data-sid]');
 if(!actBtn||!card)return;
 e.stopPropagation();
 const id=card.dataset.sid,act=actBtn.dataset.sact;
 if(act==='open'){
  await openSavedSession(id);
 }else if(act==='pin'){
  const rec=await idbGet(id);if(!rec)return;
  rec.pinned=!rec.pinned;await idbPut(rec);renderSessionsGrid();
 }else if(act==='rename'){
  const rec=await idbGet(id);if(!rec)return;
  const next=prompt('Rename session:',rec.name||'');
  if(next&&next.trim()){rec.name=next.trim();await idbPut(rec);renderSessionsGrid()}
 }else if(act==='download'){
  const rec=await idbGet(id);if(!rec?.blob)return;
  const a=document.createElement('a');a.href=URL.createObjectURL(rec.blob);
  a.download=(rec.name||'totone').replace(/[<>:"/\\|?*]/g,'_')+'.totone';a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),3000);
 }else if(act==='del'){
  await idbDel(id);
  if(currentSessionId===id)currentSessionId=null;
  renderSessionsGrid();showToast('Deleted session',1100);
 }
});

/* ---------- Smart Background Auto-Save ---------- */
const autoEl=$('ses-auto');
try{const savedAuto=localStorage.getItem(AUTO_KEY);if(savedAuto!==null&&autoEl)autoEl.checked=savedAuto==='1'}catch{}
autoEl?.addEventListener('change',()=>{try{localStorage.setItem(AUTO_KEY,autoEl.checked?'1':'0')}catch{}});

// Reset currentSessionId when opening a brand new file or blank canvas so previous work stays safely archived!
$('file')?.addEventListener('change',()=>{currentSessionId=null;dirty=true},true);
$('nc-create')?.addEventListener('click',()=>{currentSessionId=null;dirty=true},true);
$('empty-sample')?.addEventListener('click',()=>{currentSessionId=null;dirty=true},true);

// Mark session dirty whenever user draws/edits
const origDrawSes=draw;
draw=function(...args){
 if(base)dirty=true;
 return origDrawSes.apply(this,args);
};

// Auto-save every 25s when dirty & enabled, plus on tab hide
setInterval(()=>{
 if(!base||!dirty||!(autoEl?.checked))return;
 const h=`${W}x${H}:${layers.length}:${undoStack?.length||0}`;
 if(h===lastSavedHash&&currentSessionId)return;
 saveSession({asNew:false,silent:true});
},25000);

document.addEventListener('visibilitychange',()=>{
 if(document.visibilityState==='hidden'&&base&&dirty&&autoEl?.checked){
  saveSession({asNew:false,silent:true});
 }
});

// Register in Command Palette
if(Array.isArray(window.toolCommands)){
 window.toolCommands.push(
  ['Previous Sessions & Saved Browser Projects','dialog','open-sessions','sessions recent projects history autosave saved browser'],
  ['Save Current Session to Browser','dialog','save-session-now','save session snapshot bookmark project']
 );
}
const prevJumpSes=jumpTool;
jumpTool=function(tabName,id){
 if(tabName==='dialog'&&id==='open-sessions'){openSessionsModal();return}
 if(tabName==='dialog'&&id==='save-session-now'){saveSession({asNew:false});return}
 prevJumpSes(tabName,id);
};

// Update empty screen button badge with count of saved sessions on boot!
idbAll().then(list=>{
 if(list.length&&$('empty-sessions'))$('empty-sessions').textContent=`Previous sessions (${list.length})`;
}).catch(()=>{});
})();
