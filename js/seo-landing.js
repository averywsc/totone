/* Shared Zero-Duplication Handoff Script for Totone SEO Tool Landing Routes */
(function(){
const tool=document.body.dataset.tool||'';
const drop=document.getElementById('seo-drop');
const input=document.getElementById('seo-file');
const sampleBtn=document.getElementById('seo-sample');
const status=document.getElementById('seo-status');

function putHandoff(record){
 return new Promise((res,rej)=>{
  const req=indexedDB.open('totone_handoff_db',1);
  req.onupgradeneeded=e=>{if(!e.target.result.objectStoreNames.contains('handoff'))e.target.result.createObjectStore('handoff')};
  req.onsuccess=()=>{
   const tx=req.result.transaction('handoff','readwrite');
   tx.objectStore('handoff').put(record,'pending');
   tx.oncomplete=res;tx.onerror=()=>rej(tx.error);
  };
  req.onerror=()=>rej(req.error);
 });
}

async function launchWithFile(file){
 if(!file)return;
 if(status)status.textContent='Opening '+file.name+' in Totone…';
 try{
  const buf=await file.arrayBuffer();
  await putHandoff({tool,name:file.name,type:file.type,buf,ts:Date.now()});
 }catch{}
 location.href='../index.html?tool='+encodeURIComponent(tool)+'&handoff=1';
}

drop?.addEventListener('click',e=>{if(!e.target.closest('button,a'))input?.click()});
document.getElementById('seo-pick')?.addEventListener('click',e=>{e.stopPropagation();input?.click()});
input?.addEventListener('change',e=>{const f=e.target.files?.[0];if(f)launchWithFile(f)});
drop?.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('over')});
drop?.addEventListener('dragleave',()=>drop.classList.remove('over'));
drop?.addEventListener('drop',e=>{
 e.preventDefault();drop.classList.remove('over');
 const f=e.dataTransfer?.files?.[0];if(f)launchWithFile(f);
});
sampleBtn?.addEventListener('click',e=>{
 e.stopPropagation();
 location.href='../index.html?tool='+encodeURIComponent(tool)+'&sample=1';
});
})();
