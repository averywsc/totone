/* Totone Studio Polish — Instant Dock Tooltips, Blend-Mode Scroll Preview, Status Bar Quick Pills, Extended Context Menu, Middle-Click Pan & Double-Click Fit */
(function(){
/* ========== 0. 2-Tier Broad Category Navigation (AI / Color / Edit / Design / FX) & AI Studio Cards ========== */
const catBar=$('cat-tabs'),subBar=document.querySelector('.tabs');
const lastSubByCat={ai:'ai',color:'tone',edit:'crop',layers:'layers',design:'design',fx:'filters'};

function syncCategoryForTab(tabName){
 if(!catBar||!subBar)return;
 const tabBtn=subBar.querySelector(`[data-t="${tabName}"]`);
 if(!tabBtn)return;
 const cat=tabBtn.dataset.cat||'color';
 lastSubByCat[cat]=tabName;
 catBar.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.cat===cat));
 let visibleCount=0;
 subBar.querySelectorAll('[data-t]').forEach(b=>{
  const match=b.dataset.cat===cat;
  b.hidden=!match;
  if(match)visibleCount++;
 });
 subBar.hidden=visibleCount<=1;
}

catBar?.addEventListener('click',e=>{
 const b=e.target.closest('[data-cat]');if(!b)return;
 const cat=b.dataset.cat,targetTab=lastSubByCat[cat]||'tone';
 const tb=subBar?.querySelector(`[data-t="${targetTab}"]`);
 if(tb)tb.click();
});

// Intercept any sub-tab click (including programmatic clicks from dock/shortcuts/Command Palette)
subBar?.addEventListener('click',e=>{
 const tb=e.target.closest('[data-t]');if(!tb)return;
 syncCategoryForTab(tb.dataset.t);
},true);

// Wire Left Dock Remove BG icon directly to our dedicated AI Studio tab
$('tool-dock')?.addEventListener('click',e=>{
 const b=e.target.closest('[data-dock="rmbg"]');
 if(b){
  e.stopImmediatePropagation();
  subBar?.querySelector('[data-t="ai"]')?.click();
  $('rmbg-smart')?.scrollIntoView({block:'nearest',behavior:'smooth'});
 }
},true);

// Wire all 1-click AI Studio & Pro Lab panel cards
document.addEventListener('click',e=>{
 const btn=e.target.closest('[data-ai-act]');if(!btn)return;
 const act=btn.dataset.aiAct;
 if(act==='upscale')$('upscale-open')?.click();
 else if(act==='auto')document.querySelector('[data-dock="auto"]')?.click();
 else if(act==='trim')window.runSmartAutoTrim?.();
 else if(['eraser','ocr','redact','liquify','layerfx','svg','gif','mockup','palette','batch','ba','wm','extras'].includes(act))window.openProStudioTab?.(act);
 else if(['smartcrop','clahe','lowpoly','pxsort','dither','kaleido','scanner','pfp','meme','cvd'].includes(act))window.openTotoneLab10?.(act);
});

syncCategoryForTab('tone');

/* ========== 1. Instant Floating Tooltips for Left Tool Dock ========== */
const dock=$('tool-dock');
if(dock){
 const tip=document.createElement('div');
 tip.id='dock-tooltip';
 document.body.appendChild(tip);
 dock.querySelectorAll('button[title]').forEach(btn=>{
  btn.dataset.tip=btn.title;
  btn.removeAttribute('title');
  btn.addEventListener('pointerenter',()=>{
   const r=btn.getBoundingClientRect();
   const leftSide=document.body.classList.contains('sidebar-left');
   tip.textContent=btn.dataset.tip||'';
   tip.style.top=(r.top+r.height/2-13)+'px';
   if(leftSide){tip.style.left='auto';tip.style.right=(window.innerWidth-r.left+8)+'px'}
   else{tip.style.right='auto';tip.style.left=(r.right+8)+'px'}
   tip.classList.add('show');
  });
  btn.addEventListener('pointerleave',()=>tip.classList.remove('show'));
  btn.addEventListener('pointerdown',()=>tip.classList.remove('show'));
 });
}

/* ========== 2. Photoshop-Style Blend Mode Scroll-Wheel Live Preview ========== */
const bmSel=$('bm');
if(bmSel){
 bmSel.addEventListener('wheel',e=>{
  if(!active||bmSel.disabled)return;
  e.preventDefault();
  const dir=e.deltaY>0?1:-1;
  const next=Math.max(0,Math.min(bmSel.options.length-1,bmSel.selectedIndex+dir));
  if(next!==bmSel.selectedIndex){
   bmSel.selectedIndex=next;
   bmSel.dispatchEvent(new Event('change',{bubbles:true}));
   showToast('Blend: '+bmSel.options[next].text,700);
  }
 },{passive:false});
}

/* ========== 3. Interactive Bottom Status Bar Quick Pills ========== */
$('sb-dims')?.addEventListener('click',()=>$('new-canvas-open')?.click());
$('sb-layers')?.addEventListener('click',()=>document.querySelector('.tabs [data-t="layers"]')?.click());

const GUIDE_CYCLE=[['off','Guides: Off'],['thirds','Thirds'],['golden','Golden'],['reels','Reels Safe'],['yt','YT Safe'],['square','1:1 Crop']];
const sbGuide=$('sb-guide-btn'),sbHist=$('sb-hist-btn');
function syncStatusPills(){
 const p=window.totoneSettings||{};
 if(sbGuide){
  const cur=GUIDE_CYCLE.find(([k])=>k===(p.safezone||'off'))||GUIDE_CYCLE[0];
  sbGuide.textContent=cur[0]==='off'?'Guides: Off':'Guide: '+cur[1];
  sbGuide.classList.toggle('on',cur[0]!=='off');
 }
 if(sbHist)sbHist.classList.toggle('on',!!p.hist);
}
sbGuide?.addEventListener('click',()=>{
 const sel=$('set-safezone');if(!sel)return;
 const idx=GUIDE_CYCLE.findIndex(([k])=>k===sel.value);
 const [nextKey,nextLabel]=GUIDE_CYCLE[(idx+1)%GUIDE_CYCLE.length];
 sel.value=nextKey;sel.dispatchEvent(new Event('change'));
 syncStatusPills();showToast(nextKey==='off'?'Safe-zone guides off':'Guide: '+nextLabel,1000);
});
sbHist?.addEventListener('click',()=>{
 const cb=$('set-hist');if(!cb)return;
 cb.checked=!cb.checked;cb.dispatchEvent(new Event('change'));
 syncStatusPills();
});
$('set-safezone')?.addEventListener('change',syncStatusPills);
$('set-hist')?.addEventListener('change',syncStatusPills);
$('hist-hud-close')?.addEventListener('click',()=>setTimeout(syncStatusPills,20));
syncStatusPills();

/* ========== 4. Extended Right-Click Canvas Context Menu Actions ========== */
$('canvas-menu')?.addEventListener('click',e=>{
 const b=e.target.closest('[data-cm]');if(!b)return;
 const k=b.dataset.cm;
 if(k==='layerfx'){e.stopImmediatePropagation();$('canvas-menu').hidden=true;window.openProStudioTab?.('layerfx')}
 else if(k==='redact'){e.stopImmediatePropagation();$('canvas-menu').hidden=true;window.openProStudioTab?.('redact')}
 else if(k==='trim'){e.stopImmediatePropagation();$('canvas-menu').hidden=true;window.runSmartAutoTrim?.()}
},true);

/* ========== 5. Middle-Click Stage Panning & Double-Click Margin to Fit ========== */
let midPan=null;
stage?.addEventListener('pointerdown',e=>{
 if(e.button!==1||!base)return;
 e.preventDefault();
 midPan={x:e.clientX,y:e.clientY,sl:stage.scrollLeft,st:stage.scrollTop};
 stage.style.cursor='grabbing';
});
window.addEventListener('pointermove',e=>{
 if(!midPan)return;
 stage.scrollLeft=midPan.sl-(e.clientX-midPan.x);
 stage.scrollTop=midPan.st-(e.clientY-midPan.y);
});
window.addEventListener('pointerup',()=>{if(midPan){midPan=null;stage.style.cursor=''}});
stage?.addEventListener('dblclick',e=>{
 if(e.target!==stage||!base)return;
 const z=$('zoom');if(z){z.value='0';z.dispatchEvent(new Event('change'));showToast('Zoom: Fit to screen',900)}
});

/* ========== 6. Multi-Image Drag-and-Drop Support ========== */
window.addEventListener('drop',e=>{
 const files=[...(e.dataTransfer?.files||[])].filter(f=>f.type?.startsWith('image/'));
 if(files.length>1&&base){
  e.preventDefault();e.stopImmediatePropagation();
  let placed=0;
  files.forEach(f=>{
   const img=new Image(),u=URL.createObjectURL(f);
   img.onload=()=>{
    URL.revokeObjectURL(u);
    const cv=bc(img.naturalWidth,img.naturalHeight);
    cv.getContext('2d').drawImage(img,0,0);
    const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height);
    const sc=Math.min(1,W*0.7/cv.width,H*0.7/cv.height);
    pushU(mkSnap('p'));
    const l={cv,d,o:null,lk:false,sh:null,ol:null,x:W/2+(placed*18),y:H/2+(placed*18),s:sc,r:0,op:1,bm:'source-over',fl:false,vis:true,cl:0,ct:0,cr:0,cb:0,name:f.name.replace(/\.[^.]+$/,'')};
    layers.push(l);active=l;placed++;
    if(placed===files.length){refreshLayers();draw();showToast(`Added ${placed} dropped layers!`,1600)}
   };
   img.src=u;
  });
 }
},true);
/* ========== 7. Mobile Native Bottom-Sheet Drag Handle & Quick Actions ========== */
(function initMobileUX(){
 $('hdr-more-menu')?.addEventListener('click',e=>{
  const b=e.target.closest('[data-mob]');if(!b)return;
  const k=b.dataset.mob;
  if(k==='search')$('cmd-open')?.click();
  else if(k==='new')$('new-canvas-open')?.click();
  else if(k==='sessions')$('sessions-open')?.click();
  else if(k==='project')$('project-menu')?.click();
  else if(k==='split'){const cb=$('spl');if(cb){cb.checked=!cb.checked;cb.dispatchEvent(new Event('change',{bubbles:true}))}}
 });

 const handle=$('panel-height'),asideEl=document.querySelector('aside');
 if(!handle||!asideEl)return;
 // Clean 1-tap collapse/expand on Presets/Color/Crop, AND smooth drag-to-expand ONLY in "All Tools" mode!
 const fresh=handle.cloneNode(true);
 handle.replaceWith(fresh);
 let dragY=0,startVh=62,dragging=false,moved=false;
 fresh.addEventListener('pointerdown',e=>{
  if(window.innerWidth>760)return;
  if(!document.body.classList.contains('mob-mode-all'))return;
  dragging=true;moved=false;dragY=e.clientY;
  startVh=parseFloat(asideEl.style.getPropertyValue('--all-h'))||62;
  asideEl.classList.add('dragging');
  fresh.setPointerCapture(e.pointerId);
 });
 fresh.addEventListener('pointermove',e=>{
  if(!dragging)return;
  const dy=dragY-e.clientY;
  if(Math.abs(dy)>5)moved=true;
  if(!moved)return;
  const vh=Math.max(36,Math.min(86,startVh+(dy/window.innerHeight)*100));
  asideEl.style.setProperty('--all-h',vh.toFixed(1)+'dvh');
 });
 const endAllDrag=()=>{
  if(!dragging)return;
  dragging=false;asideEl.classList.remove('dragging');
 };
 fresh.addEventListener('pointerup',endAllDrag);
 fresh.addEventListener('pointercancel',endAllDrag);
 fresh.addEventListener('click',()=>{
  if(window.innerWidth>760||moved){moved=false;return}
  document.body.classList.toggle('mob-sheet-closed');
  asideEl.classList.remove('sheet-peek','dragging');
 });
})();
})();
