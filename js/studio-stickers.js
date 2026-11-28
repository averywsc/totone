/* Totone v7.2.0 — Sticker Mode Studio (Upload Stickers + Live Metallic, Holo, Gold, Silver, Die-Cut, Frame & Shadow Filters) */
(function(){
const clamp=(v,lo,hi)=>v<lo?lo:v>hi?hi:v;
const clamp8=v=>v<0?0:v>255?255:v|0;

function ensureStickerSource(l){
 if(!l)return null;
 if(!l._stkSrc){
  const cv=bc(l.cv.width,l.cv.height);
  cv.getContext('2d').drawImage(l.cv,0,0);
  l._stkSrc=cv;
 }
 return l._stkSrc;
}

function renderStickerLayer(l){
 const src=ensureStickerSource(l);
 if(!src)return;
 const finish=$('stk-finish')?.value||'matte';
 const frame=$('stk-frame')?.value||'diecut-white';
 const shadow=$('stk-shadow')?.value||'soft';
 const borderW=clamp(Math.round(+$('stk-bw')?.value||14),0,48);
 const sheenAmt=clamp((+$('stk-sheen')?.value||65)/100,0,1);
 const borderCol=$('stk-bcol')?.value||'#ffffff';

 const sw=src.width,sh=src.height;
 const pad=Math.max(borderW+28,44);
 const nw=sw+pad*2,nh=sh+pad*2;

 // Step 1: Process metallic / foil / glossy finish onto a working copy of the sticker artwork
 const artCv=bc(sw,sh),ag=artCv.getContext('2d',{willReadFrequently:true});
 ag.drawImage(src,0,0);

 if(finish!=='matte'){
  const im=ag.getImageData(0,0,sw,sh),d=im.data;
  for(let y=0;y<sh;y++){
   const ny=y/Math.max(1,sh);
   for(let x=0;x<sw;x++){
    const i=(y*sw+x)*4;
    if(d[i+3]<6)continue;
    const nx=x/Math.max(1,sw);
    const diag=(nx*0.75+ny*0.65);
    const wave=Math.sin(diag*Math.PI*3.2)*0.5+0.5;
    const spec=Math.pow(Math.max(0,Math.cos((diag-0.45)*Math.PI*2.4)),6);
    let r=d[i],g=d[i+1],b=d[i+2];
    const lum=0.299*r+0.587*g+0.114*b;

    if(finish==='chrome'){
     const cr=clamp8((lum-128)*1.55+132+wave*48*sheenAmt+spec*115*sheenAmt);
     const cg=clamp8((lum-128)*1.55+136+wave*52*sheenAmt+spec*120*sheenAmt);
     const cb=clamp8((lum-128)*1.55+148+wave*58*sheenAmt+spec*130*sheenAmt);
     r=r*(1-sheenAmt*0.78)+cr*(sheenAmt*0.78);
     g=g*(1-sheenAmt*0.78)+cg*(sheenAmt*0.78);
     b=b*(1-sheenAmt*0.78)+cb*(sheenAmt*0.78);
    }else if(finish==='holo'){
     const ang=(nx*1.8+ny*1.3+lum/255)*Math.PI*2;
     const hr=128+127*Math.sin(ang);
     const hg=128+127*Math.sin(ang+2.094);
     const hb=128+127*Math.sin(ang+4.188);
     const mix=sheenAmt*(0.38+0.42*wave);
     r=r*(1-mix)+hr*mix+spec*80*sheenAmt;
     g=g*(1-mix)+hg*mix+spec*80*sheenAmt;
     b=b*(1-mix)+hb*mix+spec*85*sheenAmt;
    }else if(finish==='gold'){
     const gl=clamp(lum/255,0,1);
     const gr=clamp8(gl*245+38+spec*95*sheenAmt+wave*24);
     const gg=clamp8(gl*196+20+spec*75*sheenAmt+wave*16);
     const gb=clamp8(gl*88+6+spec*40*sheenAmt);
     r=r*(1-sheenAmt*0.78)+gr*(sheenAmt*0.78);
     g=g*(1-sheenAmt*0.78)+gg*(sheenAmt*0.78);
     b=b*(1-sheenAmt*0.78)+gb*(sheenAmt*0.78);
    }else if(finish==='silver'){
     const sv=clamp8(lum*1.12+16+wave*32*sheenAmt+spec*90*sheenAmt);
     r=r*(1-sheenAmt*0.75)+sv*(sheenAmt*0.75);
     g=g*(1-sheenAmt*0.75)+(sv+4)*(sheenAmt*0.75);
     b=b*(1-sheenAmt*0.75)+(sv+10)*(sheenAmt*0.75);
    }else if(finish==='glossy'){
     const band=Math.pow(Math.max(0,1-Math.abs((nx*0.8+ny*0.6)-0.52)*4.2),2)*115*sheenAmt;
     r+=band;g+=band;b+=band;
    }
    d[i]=clamp8(r);d[i+1]=clamp8(g);d[i+2]=clamp8(b);
   }
  }
  ag.putImageData(im,0,0);
 }

 // Step 2: Build silhouette + frame / die-cut border onto composition canvas
 const compCv=bc(nw,nh),cg=compCv.getContext('2d');
 const outCol=frame==='diecut-white'?'#f8f8fa':frame==='diecut-black'?'#141418':frame==='diecut-custom'?borderCol:'#f8f8fa';

 if(frame==='square'||frame==='stamp'){
  const fx=pad-borderW,fy=pad-borderW,fw=sw+borderW*2,fh=sh+borderW*2;
  cg.fillStyle=outCol;
  if(frame==='square'){
   cg.beginPath();cg.roundRect(fx,fy,fw,fh,Math.max(8,borderW*0.7));cg.fill();
  }else{
   // Postage stamp perforated border
   cg.fillRect(fx,fy,fw,fh);
   cg.save();cg.globalCompositeOperation='destination-out';
   const r=Math.max(5,Math.round(Math.min(fw,fh)*0.028)),step=r*2.8;
   for(let x=fx+step/2;x<fx+fw;x+=step){
    cg.beginPath();cg.arc(x,fy,r,0,Math.PI*2);cg.fill();
    cg.beginPath();cg.arc(x,fy+fh,r,0,Math.PI*2);cg.fill();
   }
   for(let y=fy+step/2;y<fy+fh;y+=step){
    cg.beginPath();cg.arc(fx,y,r,0,Math.PI*2);cg.fill();
    cg.beginPath();cg.arc(fx+fw,y,r,0,Math.PI*2);cg.fill();
   }
   cg.restore();
  }
  cg.drawImage(artCv,pad,pad);
 }else if(frame.startsWith('diecut')&&borderW>0){
  // Smooth multi-angle die-cut vinyl silhouette
  const silCv=bc(sw,sh),sg=silCv.getContext('2d');
  sg.drawImage(src,0,0);
  sg.globalCompositeOperation='source-in';
  sg.fillStyle=outCol;
  sg.fillRect(0,0,sw,sh);
  const steps=24;
  for(let k=0;k<steps;k++){
   const a=(k/steps)*Math.PI*2;
   cg.drawImage(silCv,pad+Math.cos(a)*borderW,pad+Math.sin(a)*borderW);
  }
  if(borderW>8){
   for(let k=0;k<12;k++){
    const a=(k/12)*Math.PI*2;
    cg.drawImage(silCv,pad+Math.cos(a)*borderW*0.5,pad+Math.sin(a)*borderW*0.5);
   }
  }
  cg.drawImage(artCv,pad,pad);
 }else{
  cg.drawImage(artCv,pad,pad);
 }

 // Step 3: Apply shadow / peel / neon glow onto final output canvas
 const outCv=bc(nw,nh),og=outCv.getContext('2d');
 og.save();
 if(shadow==='soft'){
  og.shadowColor='rgba(0,0,0,0.48)';og.shadowBlur=18;og.shadowOffsetX=0;og.shadowOffsetY=10;
 }else if(shadow==='peel'){
  og.shadowColor='rgba(0,0,0,0.58)';og.shadowBlur=26;og.shadowOffsetX=10;og.shadowOffsetY=18;
 }else if(shadow==='hard'){
  og.shadowColor='rgba(0,0,0,0.82)';og.shadowBlur=0;og.shadowOffsetX=9;og.shadowOffsetY=9;
 }else if(shadow==='neon'){
  og.shadowColor=borderCol==='#ffffff'?'#38bdf8':borderCol;og.shadowBlur=22;og.shadowOffsetX=0;og.shadowOffsetY=0;
 }
 og.drawImage(compCv,0,0);
 og.restore();

 l.cv=outCv;
 l.d=og.getImageData(0,0,nw,nh);
 l.o=null;l.sil=null;l.gc=null;l.tnc=null;
 refreshLayers();draw();
}

/* Upload Sticker File (PNG / WebP / Image) */
$('stk-upload-btn')?.addEventListener('click',()=>$('stk-upload-file')?.click());
$('stk-upload-file')?.addEventListener('change',e=>{
 const f=e.target.files?.[0];e.target.value='';if(!f)return;
 if(!base){showToast('Open a photo or create a canvas first',1600);return}
 const im=new Image(),u=URL.createObjectURL(f);
 im.onload=()=>{
  URL.revokeObjectURL(u);
  const maxS=Math.round(Math.min(W,H)*0.48);
  const sc=Math.min(1,maxS/Math.max(im.naturalWidth||1,im.naturalHeight||1));
  const sw=Math.max(24,Math.round((im.naturalWidth||200)*sc));
  const sh=Math.max(24,Math.round((im.naturalHeight||200)*sc));
  const cv=bc(sw,sh);
  cv.getContext('2d').drawImage(im,0,0,sw,sh);
  const d=cv.getContext('2d').getImageData(0,0,sw,sh);
  pushU(mkSnap('p'));
  const l={cv,d,o:null,lk:false,sh:null,ol:null,x:W/2,y:H/2,s:1,r:0,op:1,bm:'source-over',fl:false,vis:true,cl:0,ct:0,cr:0,cb:0,name:'Sticker: '+f.name.replace(/\.[^.]+$/,'').slice(0,18)};
  l._stkSrc=cv;
  layers.push(l);active=l;
  renderStickerLayer(l);
  showToast('Sticker added! Adjust finish, frame & shadow live.',1800);
 };
 im.src=u;
});

/* Apply Sticker FX live when changing any Sticker control */
['stk-finish','stk-frame','stk-shadow'].forEach(id=>{
 $(id)?.addEventListener('change',()=>{
  const colRow=$('stk-bcol-row');
  if(colRow)colRow.hidden=$('stk-frame')?.value!=='diecut-custom'&&$('stk-shadow')?.value!=='neon';
  if(active&&!active.lk)renderStickerLayer(active);
 });
});
['stk-bw','stk-sheen','stk-bcol'].forEach(id=>{
 $(id)?.addEventListener('input',()=>{
  if(active&&!active.lk&&active._stkSrc)renderStickerLayer(active);
 });
});
$('stk-apply-active')?.addEventListener('click',()=>{
 if(!active||active.lk){showToast('Select an unlocked layer first (or upload a sticker)',1800);return}
 pushU(mkSnap('p'));
 renderStickerLayer(active);
 showToast('Applied Sticker Mode to active layer!',1600);
});
})();
