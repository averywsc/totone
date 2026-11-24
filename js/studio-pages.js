/* Totone Multi-Page Studio Engine — Canva-Style Pages Bar, Auto-New-Page on Templates/New Design/Collages/Mockups, Instant Page Switching & Multi-Page Export (All Pages / Custom Page Ranges to Multi-Page PDF or ZIP) */
(function(){
const LR_IDS=['lr-temp','lr-tint','lr-exp','lr-con','lr-hi','lr-sh','lr-wh','lr-bl','lr-tex','lr-cla','lr-deh','lr-vib','lr-sat'];
let pages=[],activeIdx=-1,internalLoad=false,barVisible=false,thumbTimer=0;

function loadScriptOnce(url,checkFn){
 if(checkFn())return Promise.resolve();
 return new Promise((res,rej)=>{
  const s=document.createElement('script');s.src=url;s.crossOrigin='anonymous';
  s.onload=res;s.onerror=()=>rej(Error('Failed to load '+url.split('/').pop()));
  document.head.appendChild(s);
 });
}
function captureThumbUrl(){
 if(!base||!c.width||!c.height)return '';
 const sc=Math.min(1,140/Math.max(c.width,c.height,1));
 const tw=Math.max(1,Math.round(c.width*sc)),th=Math.max(1,Math.round(c.height*sc));
 const cv=bc(tw,th),g=cv.getContext('2d');
 g.imageSmoothingEnabled=true;
 g.drawImage(c,0,0,tw,th);
 return cv.toDataURL('image/webp',0.72);
}
function captureLr(){
 const lr={};LR_IDS.forEach(id=>{const el=$(id);if(el)lr[id]=el.value});return lr;
}
function restoreLr(lr){
 if(!lr)return;
 Object.entries(lr).forEach(([id,v])=>{const el=$(id);if(el){el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}))}});
}

function saveCurrentPageSnapshot(){
 if(!base||activeIdx<0||!pages[activeIdx])return;
 const p=pages[activeIdx];
 p.bundle=packProject(captureDocument(),typeof versions!=='undefined'?versions:[]);
 p.lr=captureLr();
 p.w=W;p.h=H;
 p.thumb=captureThumbUrl();
}

function ensureInitialPage(){
 if(!base)return;
 if(!pages.length){
  pages.push({
   id:'pg_'+Date.now().toString(36),
   name:(typeof projectTitle==='string'&&projectTitle&&projectTitle!=='Totone')?projectTitle:'Page 1',
   w:W,h:H,thumb:captureThumbUrl(),bundle:null,lr:captureLr()
  });
  activeIdx=0;
  renderPagesBar();
 }
}

async function switchToPage(idx){
 if(idx<0||idx>=pages.length||idx===activeIdx)return;
 saveCurrentPageSnapshot();
 const target=pages[idx];
 activeIdx=idx;
 if(target.bundle){
  internalLoad=true;
  try{
   const file=new File([target.bundle],(target.name||'Page')+'.totone');
   const unpacked=await unpackProject(file);
   installDocument(unpacked.doc);
   if(typeof versions!=='undefined')versions=unpacked.pins||[];
   if(typeof undoStack!=='undefined')undoStack=[];
   if(typeof redoS!=='undefined')redoS=[];
   restoreLr(target.lr);
  }finally{internalLoad=false}
 }
 renderPagesBar();
 showToast(`Page ${idx+1} of ${pages.length} (${target.name})`,900);
}

async function addBlankPage(w=W||1080,h=H||1080,name=''){
 ensureInitialPage();
 if(base)saveCurrentPageSnapshot();
 const nextNum=pages.length+1;
 const pageName=name||`Page ${nextNum}`;
 const cv=bc(w,h),g=cv.getContext('2d');
 g.fillStyle=$('bg-c1')?.value||'#0a1228';g.fillRect(0,0,w,h);
 const blob=await toBlob(cv,'image/png');
 const file=new File([blob],pageName+'.png',{type:'image/png'});
 internalLoad=true;
 try{
  await origLoad(file);
 }finally{internalLoad=false}
 // Reset Develop sliders for clean fresh page
 LR_IDS.forEach(id=>{const el=$(id);if(el){el.value='0';el.dispatchEvent(new Event('input',{bubbles:true}))}});
 pages.push({id:'pg_'+Date.now().toString(36)+nextNum,name:pageName,w:W,h:H,thumb:captureThumbUrl(),bundle:null,lr:captureLr()});
 activeIdx=pages.length-1;
 barVisible=true;
 renderPagesBar();
 showToast(`Added ${pageName} (${W}×${H})`,1300);
}

async function duplicatePage(idx){
 if(idx<0||idx>=pages.length)return;
 if(idx===activeIdx)saveCurrentPageSnapshot();
 const src=pages[idx];
 const copy={
  id:'pg_'+Date.now().toString(36)+'_c',
  name:src.name+' copy',
  w:src.w,h:src.h,thumb:src.thumb,
  bundle:src.bundle,lr:{...(src.lr||{})}
 };
 pages.splice(idx+1,0,copy);
 barVisible=true;
 await switchToPage(idx+1);
 showToast(`Duplicated to Page ${idx+2}`,1200);
}

async function deletePage(idx){
 if(pages.length<=1){showToast('Cannot delete the only page',1200);return}
 pages.splice(idx,1);
 const nextIdx=Math.min(idx,pages.length-1);
 activeIdx=-1;
 await switchToPage(nextIdx);
 showToast('Deleted page',1000);
}

function movePage(idx,dir){
 const to=idx+dir;
 if(to<0||to>=pages.length)return;
 if(idx===activeIdx)saveCurrentPageSnapshot();
 [pages[idx],pages[to]]=[pages[to],pages[idx]];
 if(activeIdx===idx)activeIdx=to;
 else if(activeIdx===to)activeIdx=idx;
 renderPagesBar();
}

function renderPagesBar(){
 const bar=$('pages-bar'),list=$('pages-list'),sbBtn=$('sb-pages-btn');
 if(sbBtn){
  const cnt=Math.max(1,pages.length);
  sbBtn.textContent=`Pages: ${cnt}`;
  sbBtn.classList.toggle('on',barVisible||pages.length>1);
 }
 if(!bar||!list)return;
 bar.hidden=!(barVisible||pages.length>1);
 list.innerHTML=pages.map((p,i)=>`
  <div class="page-card${i===activeIdx?' on':''}" data-pi="${i}">
   <img class="page-thumb" src="${p.thumb}" alt="Page ${i+1}">
   <div class="page-info"><strong>${i+1}. ${p.name}</strong><small>${p.w}×${p.h}</small></div>
   <div class="page-acts">
    <button type="button" data-pa="left" title="Move left"${i===0?' disabled':''}>◀</button>
    <button type="button" data-pa="right" title="Move right"${i===pages.length-1?' disabled':''}>▶</button>
    <button type="button" data-pa="dup" title="Duplicate page">⧉</button>
    ${pages.length>1?'<button type="button" class="del" data-pa="del" title="Delete page">✕</button>':''}
   </div>
  </div>`).join('');
 syncExportPagesUI();
}

$('pages-list')?.addEventListener('click',e=>{
 const card=e.target.closest('[data-pi]');if(!card)return;
 const idx=+card.dataset.pi;
 const act=e.target.closest('[data-pa]')?.dataset.pa;
 if(act==='dup'){e.stopPropagation();duplicatePage(idx)}
 else if(act==='del'){e.stopPropagation();deletePage(idx)}
 else if(act==='left'){e.stopPropagation();movePage(idx,-1)}
 else if(act==='right'){e.stopPropagation();movePage(idx,1)}
 else switchToPage(idx);
});
$('page-add-btn')?.addEventListener('click',()=>addBlankPage());
$('sb-pages-btn')?.addEventListener('click',()=>{
 ensureInitialPage();
 barVisible=!barVisible;
 renderPagesBar();
});

/* ========== Auto-New-Page Hook on load(file) (Templates, New Design, Collages, Mockups, Sample) ========== */
const origLoad=typeof load==='function'?load:null;
if(origLoad){
 load=async function(file,...rest){
  const hadBase=!!base;
  if(hadBase&&!internalLoad){
   ensureInitialPage();
   saveCurrentPageSnapshot();
  }
  const res=await origLoad.call(this,file,...rest);
  if(!internalLoad&&base){
   const cleanName=(file?.name||'').replace(/\.[^.]+$/,'')||`Page ${pages.length+1}`;
   if(!hadBase&&!pages.length){
    pages=[{id:'pg_'+Date.now().toString(36),name:cleanName,w:W,h:H,thumb:captureThumbUrl(),bundle:null,lr:captureLr()}];
    activeIdx=0;
   }else{
    pages.push({id:'pg_'+Date.now().toString(36)+pages.length,name:cleanName,w:W,h:H,thumb:captureThumbUrl(),bundle:null,lr:captureLr()});
    activeIdx=pages.length-1;
    barVisible=true;
    showToast(`Opened "${cleanName}" on Page ${pages.length}!`,1500);
   }
   renderPagesBar();
  }
  return res;
 };
}

// Keep current page thumbnail fresh cleanly (debounced, NEVER triggers draw())
const origDrawPages=draw;
draw=function(...args){
 const r=origDrawPages.apply(this,args);
 if(base&&!pages.length&&!internalLoad){
  pages.push({
   id:'pg_'+Date.now().toString(36),
   name:(typeof projectTitle==='string'&&projectTitle&&projectTitle!=='Totone')?projectTitle:'Page 1',
   w:W,h:H,thumb:'',bundle:null,lr:captureLr()
  });
  activeIdx=0;
  renderPagesBar();
 }
 if(base&&activeIdx>=0&&pages[activeIdx]){
  clearTimeout(thumbTimer);
  thumbTimer=setTimeout(()=>{
   if(!base||!pages[activeIdx]||!c.width)return;
   pages[activeIdx].w=W;pages[activeIdx].h=H;
   if(barVisible||pages.length>1){
    pages[activeIdx].thumb=captureThumbUrl();
    const imgEl=document.querySelector(`.page-card[data-pi="${activeIdx}"] .page-thumb`);
    if(imgEl)imgEl.src=pages[activeIdx].thumb;
   }
  },900);
 }
 return r;
};

/* ========== Multi-Page Export Integration (Current / All Pages / Custom Pages -> Multi-Page PDF or ZIP) ========== */
const exPagesWrap=$('ex-pages-wrap'),exPagesMode=$('ex-pages-mode'),exPagesCustomRow=$('ex-pages-custom-row'),exPagesRange=$('ex-pages-range');

function syncExportPagesUI(){
 if(!exPagesWrap)return;
 const multi=pages.length>1;
 exPagesWrap.hidden=!multi;
 if(!multi&&exPagesMode)exPagesMode.value='current';
 if(exPagesMode){
  exPagesMode.options[1].textContent=`All pages (${pages.length})`;
  if(exPagesCustomRow)exPagesCustomRow.hidden=exPagesMode.value!=='custom';
 }
}
exPagesMode?.addEventListener('change',syncExportPagesUI);
$('export')?.addEventListener('click',()=>setTimeout(syncExportPagesUI,25));

function parsePageSelection(total){
 const mode=exPagesMode?.value||'current';
 if(mode==='current')return [activeIdx];
 if(mode==='all')return Array.from({length:total},(_,i)=>i);
 const raw=(exPagesRange?.value||'').trim();
 const set=new Set();
 raw.split(/[,\s]+/).forEach(tok=>{
  if(!tok)return;
  const m=tok.match(/^(\d+)-(\d+)$/);
  if(m){
   const a=Math.max(1,Math.min(total,+m[1])),b=Math.max(1,Math.min(total,+m[2]));
   for(let i=Math.min(a,b);i<=Math.max(a,b);i++)set.add(i-1);
  }else if(/^\d+$/.test(tok)){
   const n=+tok;if(n>=1&&n<=total)set.add(n-1);
  }
 });
 return set.size?[...set].sort((a,b)=>a-b):[activeIdx];
}

// Intercept #exgo cleanly ONLY when exporting multiple pages (All or Custom)
document.addEventListener('click',async e=>{
 const btn=e.target.closest('#exgo');if(!btn)return;
 const mode=exPagesMode?.value||'current';
 if(pages.length<=1||mode==='current')return;
 e.preventDefault();e.stopImmediatePropagation();
 const indices=parsePageSelection(pages.length);
 if(!indices.length){$('exmsg').textContent='Enter valid page numbers (e.g. 1, 2-4).';return}
 const msg=t=>{$('exmsg').textContent=t};
 const fmt=$('exf')?.value||'png',qual=(+($('exq')?.value||92))/100;
 const stem=(($('exn')?.value||'totone').replace(/[^\w.\- ]+/g,'_').trim()||'totone');
 const prevIdx=activeIdx;
 saveCurrentPageSnapshot();
 try{
  if(fmt==='pdf'){
   msg(`Rendering ${indices.length} page(s) into multi-page PDF…`);
   await loadScriptOnce('https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js',()=>!!window.jspdf?.jsPDF);
   const {jsPDF}=window.jspdf;
   let doc=null;
   for(let k=0;k<indices.length;k++){
    await switchToPage(indices[k]);
    render(false);
    const cv=bc(W,H);cv.getContext('2d').drawImage(c,0,0);draw(true);
    const mmW=Math.max(40,cv.width*0.264583),mmH=Math.max(40,cv.height*0.264583);
    const orient=mmW>=mmH?'landscape':'portrait';
    if(!doc)doc=new jsPDF({orientation:orient,unit:'mm',format:[mmW,mmH]});
    else doc.addPage([mmW,mmH],orient);
    doc.addImage(cv.toDataURL('image/jpeg',qual),'JPEG',0,0,mmW,mmH);
   }
   await switchToPage(prevIdx);
   doc.save(`${stem}-${indices.length}pages.pdf`);
   msg(`Exported ${indices.length}-page PDF!`);
   showToast(`Exported ${indices.length}-page PDF!`,1800);
  }else{
   msg(`Packing ${indices.length} page(s) into .ZIP…`);
   await loadScriptOnce('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js',()=>!!window.JSZip);
   const zip=new window.JSZip();
   const mime=fmt==='jpg'?'image/jpeg':fmt==='webp'?'image/webp':'image/png';
   const ext=fmt==='jpg'?'jpg':fmt==='webp'?'webp':'png';
   for(let k=0;k<indices.length;k++){
    const pi=indices[k];
    msg(`Encoding Page ${pi+1} (${k+1}/${indices.length})…`);
    await switchToPage(pi);
    render(false);
    const cv=bc(W,H),g=cv.getContext('2d');
    if(fmt==='jpg'){g.fillStyle='#ffffff';g.fillRect(0,0,W,H)}
    g.drawImage(c,0,0);draw(true);
    const blob=await new Promise(res=>cv.toBlob(res,mime,qual));
    zip.file(`${stem}-page-${String(pi+1).padStart(2,'0')}.${ext}`,blob);
   }
   await switchToPage(prevIdx);
   const zBlob=await zip.generateAsync({type:'blob'});
   const a=document.createElement('a');a.href=URL.createObjectURL(zBlob);a.download=`${stem}-${indices.length}pages.zip`;a.click();
   setTimeout(()=>URL.revokeObjectURL(a.href),4000);
   msg(`Saved ${stem}-${indices.length}pages.zip (${indices.length} pages)!`);
   showToast(`Exported ${indices.length} pages in .ZIP!`,1800);
  }
 }catch(err){
  await switchToPage(prevIdx);
  msg('Multi-page export error: '+err.message);
 }
},true);

window.totonePages={addBlankPage,switchToPage,duplicatePage,deletePage,getPages:()=>pages};
if(Array.isArray(window.toolCommands)){
 window.toolCommands.push(
  ['Add New Page (Multi-Page Design)','dialog','pg-add','page add new slide multi page canva deck'],
  ['Toggle Pages Strip','dialog','pg-toggle','pages strip slides deck switch']
 );
}
const prevJumpPg=jumpTool;
jumpTool=function(tabName,id){
 if(tabName==='dialog'&&id==='pg-add'){addBlankPage();return}
 if(tabName==='dialog'&&id==='pg-toggle'){$('sb-pages-btn')?.click();return}
 prevJumpPg(tabName,id);
};
})();
