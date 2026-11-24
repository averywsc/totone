/* Totone Pro Lab — 10 Open-Source-Powered Pro Tools:
   1. Smart AI Auto-Crop (jwagner/smartcrop.js — MIT)
   2. Low-Poly Delaunay Vector Art (mapbox/delaunator — ISC)
   3. Pixel Sorting Glitch Engine (adapted from kimasendorf/ASDFPixelSort — MIT)
   4. Retro Dithering & CMYK Halftone (adapted from Bill Atkinson 1984 & danielepiccone/ditherjs — MIT)
   5. Color Blindness Simulator & WCAG Checker (adapted from skratchdot/color-blind — MIT & Viénot/Machado)
   6. Kaleidoscope & Mandala Mirror Art
   7. 4-Corner Perspective Un-Skew & Document Scanner (Projective Homography Solver)
   8. Circular Avatar / PFP Studio
   9. Meme & Social Caption Generator
   10. CLAHE Adaptive Contrast & Gray-World Auto White Balance (Zuiderveld 1994)
*/
(function(){
const clamp=(v,lo=0,hi=1)=>v<lo?lo:v>hi?hi:v;
function loadScriptOnce(url,checkFn){
 if(checkFn())return Promise.resolve();
 return new Promise((res,rej)=>{
  const s=document.createElement('script');s.src=url;s.crossOrigin='anonymous';
  s.onload=res;s.onerror=()=>rej(Error('Failed to load '+url.split('/').pop()));
  document.head.appendChild(s);
 });
}
function captureCanvas(maxW=0){
 render(false);
 const sw=W,sh=H,sc=maxW?Math.min(1,maxW/Math.max(sw,sh)):1;
 const cv=bc(Math.max(1,Math.round(sw*sc)),Math.max(1,Math.round(sh*sc)));
 const g=cv.getContext('2d',{willReadFrequently:true});
 g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
 g.drawImage(c,0,0,cv.width,cv.height);
 draw(true);
 return cv;
}
function addLayerCanvas(cv,name){
 const d=cv.getContext('2d',{willReadFrequently:true}).getImageData(0,0,cv.width,cv.height);
 pushU(mkSnap('p'));
 const l={cv,d,o:null,lk:false,sh:null,ol:null,x:W/2,y:H/2,s:1,r:0,op:1,bm:'source-over',fl:false,vis:true,cl:0,ct:0,cr:0,cb:0,name};
 layers.push(l);active=l;refreshLayers();draw();
}

/* ---------- Modal & Tab Launcher ---------- */
const dlg=$('lab10-dialog');
function openLab10(tabKey='smartcrop'){
 if(!dlg)return;
 if(!dlg.open)dlg.showModal();
 const btn=document.querySelector(`#lab10-tabs [data-l10="${tabKey}"]`);
 if(btn)btn.click();
}
window.openTotoneLab10=openLab10;

$('lab10-close')?.addEventListener('click',()=>dlg?.close());
dlg?.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});
$('tool-dock')?.addEventListener('click',e=>{
 const b=e.target.closest('[data-dock="lab10"]');
 if(b){e.stopImmediatePropagation();openLab10('smartcrop')}
},true);

$('lab10-tabs')?.addEventListener('click',e=>{
 const b=e.target.closest('[data-l10]');if(!b)return;
 const k=b.dataset.l10;
 document.querySelectorAll('#lab10-tabs button').forEach(x=>x.classList.toggle('on',x===b));
 document.querySelectorAll('.l10-pane').forEach(p=>p.hidden=p.id!=='l10-'+k);
 if(k==='cvd')renderCvdPreview();
 else if(k==='kaleido')renderKaleidoPreview();
 else if(k==='scanner')initScanner();
 else if(k==='pfp')renderPfpPreview();
 else if(k==='meme')renderMemePreview();
});

/* ========== 1. Smart AI Auto-Crop (jwagner/smartcrop.js — MIT) ========== */
let lastSmartCrop=null;
$('sc-find')?.addEventListener('click',async()=>{
 if(!base){showToast('Open an image first',1400);return}
 const st=$('sc-status');st.textContent='Loading smartcrop.js & analyzing focal points…';
 try{
  await loadScriptOnce('https://cdn.jsdelivr.net/npm/smartcrop@2.0.5/smartcrop.min.js',()=>!!window.smartcrop);
  const snap=captureCanvas(900);
  const [rw,rh]=$('sc-ratio').value.split(':').map(Number);
  const res=await window.smartcrop.crop(snap,{width:rw*200,height:rh*200});
  const crop=res.topCrop;
  const sc=W/snap.width;
  lastSmartCrop={x:Math.round(crop.x*sc),y:Math.round(crop.y*sc),w:Math.round(crop.width*sc),h:Math.round(crop.height*sc)};
  const pv=$('sc-canvas');pv.width=snap.width;pv.height=snap.height;
  const g=pv.getContext('2d');g.drawImage(snap,0,0);
  g.fillStyle='rgba(0,0,0,0.52)';g.fillRect(0,0,snap.width,snap.height);
  g.drawImage(snap,crop.x,crop.y,crop.width,crop.height,crop.x,crop.y,crop.width,crop.height);
  g.strokeStyle='#38bdf8';g.lineWidth=3;g.strokeRect(crop.x,crop.y,crop.width,crop.height);
  $('sc-apply').disabled=false;
  st.textContent=`Best ${rw}:${rh} focal crop found: ${lastSmartCrop.w} × ${lastSmartCrop.h} px at (${lastSmartCrop.x}, ${lastSmartCrop.y})`;
 }catch(err){st.textContent='SmartCrop error: '+err.message}
});
$('sc-apply')?.addEventListener('click',()=>{
 if(!base||!lastSmartCrop)return;
 const full=captureCanvas(0),{x,y,w,h}=lastSmartCrop;
 const cropped=bc(w,h);cropped.getContext('2d').drawImage(full,x,y,w,h,0,0,w,h);
 if(typeof loadCanvasAsBase==='function')loadCanvasAsBase(cropped,'SmartCrop');
 else if(typeof setImg==='function'){
  const i=new Image();i.onload=()=>{setImg(i);showToast(`Smart-cropped to ${w}×${h}!`,1500)};i.src=cropped.toDataURL('image/png');
 }else{addLayerCanvas(cropped,'Smart Crop')}
 dlg.close();
});

/* ========== 2. Low-Poly Delaunay Vector Art (mapbox/delaunator — ISC) ========== */
let lastLowPolySvg='',lastLowPolyCv=null;
$('lp-pts')?.addEventListener('input',e=>{e.target.nextElementSibling.value=e.target.value});
$('lp-edge')?.addEventListener('input',e=>{e.target.nextElementSibling.value=e.target.value+'%'});
$('lp-run')?.addEventListener('click',async()=>{
 if(!base){showToast('Open an image first',1400);return}
 try{
  await loadScriptOnce('https://cdn.jsdelivr.net/npm/delaunator@5.0.1/delaunator.min.js',()=>!!window.Delaunator);
  const snap=captureCanvas(720),sw=snap.width,sh=snap.height;
  const d=snap.getContext('2d',{willReadFrequently:true}).getImageData(0,0,sw,sh).data;
  const count=+$('lp-pts').value||560,edgeBias=(+$('lp-edge').value||70)/100;
  // Fast Sobel edge map for smart vertex placement
  const pts=[[0,0],[sw,0],[0,sh],[sw,sh],[sw/2,0],[sw/2,sh],[0,sh/2],[sw,sh/2]];
  for(let i=1;i<8;i++){pts.push([sw*i/8,0],[sw*i/8,sh],[0,sh*i/8],[sw,sh*i/8])}
  let tries=0;
  while(pts.length<count&&tries++<count*12){
   const x=1+Math.floor(Math.random()*(sw-2)),y=1+Math.floor(Math.random()*(sh-2));
   const luma=(px,py)=>{const o=(py*sw+px)*4;return d[o]*0.3+d[o+1]*0.59+d[o+2]*0.11};
   const gx=Math.abs(luma(x+1,y)-luma(x-1,y)),gy=Math.abs(luma(x,y+1)-luma(x,y-1));
   const energy=(gx+gy)/255;
   if(Math.random()<(1-edgeBias)*0.35+energy*edgeBias*1.4)pts.push([x,y]);
  }
  const del=window.Delaunator.from(pts);
  const tris=del.triangles;
  const out=bc(sw,sh),g=out.getContext('2d'),wire=$('lp-wire').checked;
  const svgParts=[`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sw} ${sh}" width="${W}" height="${H}">`];
  for(let i=0;i<tris.length;i+=3){
   const p0=pts[tris[i]],p1=pts[tris[i+1]],p2=pts[tris[i+2]];
   const cx=clamp(Math.round((p0[0]+p1[0]+p2[0])/3),0,sw-1);
   const cy=clamp(Math.round((p0[1]+p1[1]+p2[1])/3),0,sh-1);
   const o=(cy*sw+cx)*4,col=`rgb(${d[o]},${d[o+1]},${d[o+2]})`;
   g.beginPath();g.moveTo(p0[0],p0[1]);g.lineTo(p1[0],p1[1]);g.lineTo(p2[0],p2[1]);g.closePath();
   g.fillStyle=col;g.fill();
   g.strokeStyle=wire?'rgba(255,255,255,0.18)':col;g.lineWidth=wire?0.7:0.6;g.stroke();
   svgParts.push(`<polygon points="${p0[0].toFixed(1)},${p0[1].toFixed(1)} ${p1[0].toFixed(1)},${p1[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}" fill="${col}" stroke="${wire?'rgba(255,255,255,0.18)':col}" stroke-width="0.6"/>`);
  }
  svgParts.push('</svg>');
  lastLowPolySvg=svgParts.join('');lastLowPolyCv=out;
  const pv=$('lp-canvas');pv.width=sw;pv.height=sh;pv.getContext('2d').drawImage(out,0,0);
  $('lp-apply').disabled=false;$('lp-svg').disabled=false;
  showToast(`Generated ${Math.round(tris.length/3)} low-poly triangles!`,1400);
 }catch(err){showToast('Low-Poly error: '+err.message,2000)}
});
$('lp-apply')?.addEventListener('click',()=>{
 if(!lastLowPolyCv||!base)return;
 const full=bc(W,H);full.getContext('2d').drawImage(lastLowPolyCv,0,0,W,H);
 addLayerCanvas(full,'Low-Poly Art');dlg.close();showToast('Added Low-Poly Art layer!',1400);
});
$('lp-svg')?.addEventListener('click',()=>{
 if(!lastLowPolySvg)return;
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([lastLowPolySvg],{type:'image/svg+xml'}));
 a.download='totone-lowpoly.svg';a.click();
});

/* ========== 3. Kim Asendorf Pixel Sorter (adapted from kimasendorf/ASDFPixelSort — MIT) ========== */
let lastSortCv=null;
$('ps-lo')?.addEventListener('input',e=>{e.target.nextElementSibling.value=e.target.value});
$('ps-hi')?.addEventListener('input',e=>{e.target.nextElementSibling.value=e.target.value});
function pixelMetric(r,g,b,mode){
 if(mode==='luma')return 0.299*r+0.587*g+0.114*b;
 const mx=Math.max(r,g,b),mn=Math.min(r,g,b),df=mx-mn;
 if(mode==='sat')return mx?df/mx*255:0;
 let h=0;if(df){if(mx===r)h=((g-b)/df)%6;else if(mx===g)h=(b-r)/df+2;else h=(r-g)/df+4}
 return ((h*60+360)%360)/360*255;
}
$('ps-run')?.addEventListener('click',()=>{
 if(!base){showToast('Open an image first',1400);return}
 const snap=captureCanvas(900),sw=snap.width,sh=snap.height;
 const g=snap.getContext('2d',{willReadFrequently:true}),im=g.getImageData(0,0,sw,sh),d=im.data;
 const dir=$('ps-dir').value,mode=$('ps-mode').value,lo=+$('ps-lo').value,hi=+$('ps-hi').value;
 const sortSpan=(line,len)=>{
  let i=0;
  while(i<len){
   while(i<len&&(line[i].m<lo||line[i].m>hi))i++;
   const start=i;
   while(i<len&&line[i].m>=lo&&line[i].m<=hi)i++;
   if(i-start>1){
    const slice=line.slice(start,i).sort((a,b)=>a.m-b.m);
    for(let k=0;k<slice.length;k++)line[start+k]=slice[k];
   }
  }
 };
 if(dir==='horizontal'){
  for(let y=0;y<sh;y++){
   const line=[];
   for(let x=0;x<sw;x++){const o=(y*sw+x)*4;line.push({r:d[o],g:d[o+1],b:d[o+2],a:d[o+3],m:pixelMetric(d[o],d[o+1],d[o+2],mode)})}
   sortSpan(line,sw);
   for(let x=0;x<sw;x++){const o=(y*sw+x)*4,p=line[x];d[o]=p.r;d[o+1]=p.g;d[o+2]=p.b;d[o+3]=p.a}
  }
 }else{
  for(let x=0;x<sw;x++){
   const line=[];
   for(let y=0;y<sh;y++){const o=(y*sw+x)*4;line.push({r:d[o],g:d[o+1],b:d[o+2],a:d[o+3],m:pixelMetric(d[o],d[o+1],d[o+2],mode)})}
   sortSpan(line,sh);
   for(let y=0;y<sh;y++){const o=(y*sw+x)*4,p=line[y];d[o]=p.r;d[o+1]=p.g;d[o+2]=p.b;d[o+3]=p.a}
  }
 }
 g.putImageData(im,0,0);lastSortCv=snap;
 const pv=$('ps-canvas');pv.width=sw;pv.height=sh;pv.getContext('2d').drawImage(snap,0,0);
 $('ps-apply').disabled=false;
});
$('ps-apply')?.addEventListener('click',()=>{
 if(!lastSortCv||!base)return;
 const full=bc(W,H);full.getContext('2d').drawImage(lastSortCv,0,0,W,H);
 addLayerCanvas(full,'Pixel Sort Glitch');dlg.close();showToast('Added Pixel Sort layer!',1400);
});

/* ========== 4. Retro Dithering & CMYK Halftone (Atkinson 1984 / Floyd-Steinberg / Bayer 8x8 / Game Boy / CMYK) ========== */
let lastDitherCv=null;
$('dh-scale')?.addEventListener('input',e=>{e.target.nextElementSibling.value=e.target.value+'×'});
const hexRgb=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const BAYER8=[
 [0,32,8,40,2,34,10,42],[48,16,56,24,50,18,58,26],[12,44,4,36,14,46,6,38],[60,28,52,20,62,30,54,22],
 [3,35,11,43,1,33,9,41],[51,19,59,27,49,17,57,25],[15,47,7,39,13,45,5,37],[63,31,55,23,61,29,53,21]
];
$('dh-run')?.addEventListener('click',()=>{
 if(!base){showToast('Open an image first',1400);return}
 const algo=$('dh-algo').value,sc=+$('dh-scale').value||2;
 const full=captureCanvas(900);
 const out=bc(full.width,full.height),og=out.getContext('2d');
 if(algo==='cmyk'){
  const sw=full.width,sh=full.height,d=full.getContext('2d',{willReadFrequently:true}).getImageData(0,0,sw,sh).data;
  og.fillStyle='#f8f6f0';og.fillRect(0,0,sw,sh);
  const step=Math.max(4,sc*4);
  og.globalCompositeOperation='multiply';
  const plates=[['#00b4d8',0,0],['#ec4899',step*0.3,step*0.2],['#facc15',step*0.15,step*0.45],['#111827',step*0.45,step*0.1]];
  for(let y=0;y<sh;y+=step)for(let x=0;x<sw;x+=step){
   const o=(Math.min(sh-1,y)*sw+Math.min(sw-1,x))*4;
   const r=d[o]/255,gr=d[o+1]/255,b=d[o+2]/255;
   const k=1-Math.max(r,gr,b),cc=(1-r-k)/(1-k||1),mm=(1-gr-k)/(1-k||1),yy=(1-b-k)/(1-k||1);
   [cc,mm,yy,k*0.85].forEach((val,pi)=>{
    const rad=Math.sqrt(clamp(val,0,1))*step*0.52;
    if(rad>0.5){og.fillStyle=plates[pi][0];og.beginPath();og.arc(x+plates[pi][1],y+plates[pi][2],rad,0,Math.PI*2);og.fill()}
   });
  }
  og.globalCompositeOperation='source-over';
 }else{
  const dw=Math.max(24,Math.round(full.width/sc)),dh=Math.max(24,Math.round(full.height/sc));
  const sm=bc(dw,dh),sg=sm.getContext('2d',{willReadFrequently:true});
  sg.drawImage(full,0,0,dw,dh);
  const im=sg.getImageData(0,0,dw,dh),d=im.data;
  const fg=hexRgb($('dh-fg').value),bg=hexRgb($('dh-bg').value);
  const gb=[[15,56,15],[48,98,48],[139,172,15],[155,188,15]];
  if(algo==='atkinson'){
   const lum=new Float32Array(dw*dh);
   for(let i=0;i<lum.length;i++)lum[i]=0.299*d[i*4]+0.587*d[i*4+1]+0.114*d[i*4+2];
   const spread=[[1,0],[2,0],[-1,1],[0,1],[1,1],[0,2]];
   for(let y=0;y<dh;y++)for(let x=0;x<dw;x++){
    const idx=y*dw+x,old=lum[idx],nw=old>127?255:0,err=(old-nw)/8;
    const col=nw?bg:fg,o=idx*4;d[o]=col[0];d[o+1]=col[1];d[o+2]=col[2];d[o+3]=255;
    for(const [dx,dy] of spread){const nx=x+dx,ny=y+dy;if(nx>=0&&nx<dw&&ny<dh)lum[ny*dw+nx]+=err}
   }
  }else if(algo==='floyd'){
   const f=new Float32Array(d);
   for(let y=0;y<dh;y++)for(let x=0;x<dw;x++){
    const o=(y*dw+x)*4;
    for(let ch=0;ch<3;ch++){
     const old=f[o+ch],nw=Math.round(old/64)*64,err=old-nw;d[o+ch]=clamp(nw,0,255);
     if(x+1<dw)f[o+4+ch]+=err*7/16;
     if(y+1<dh){
      if(x>0)f[o+dw*4-4+ch]+=err*3/16;
      f[o+dw*4+ch]+=err*5/16;
      if(x+1<dw)f[o+dw*4+4+ch]+=err/16;
     }
    }
   }
  }else if(algo==='bayer'||algo==='gameboy'){
   for(let y=0;y<dh;y++)for(let x=0;x<dw;x++){
    const o=(y*dw+x)*4,l=0.299*d[o]+0.587*d[o+1]+0.114*d[o+2];
    const thr=(BAYER8[y&7][x&7]/64-0.5)*72;
    if(algo==='gameboy'){
     const idx=clamp(Math.floor((l+thr)/64),0,3),c0=gb[idx];
     d[o]=c0[0];d[o+1]=c0[1];d[o+2]=c0[2];
    }else{
     const col=(l+thr)>127?bg:fg;d[o]=col[0];d[o+1]=col[1];d[o+2]=col[2];
    }
   }
  }
  sg.putImageData(im,0,0);
  og.imageSmoothingEnabled=false;og.drawImage(sm,0,0,out.width,out.height);
 }
 lastDitherCv=out;
 const pv=$('dh-canvas');pv.width=out.width;pv.height=out.height;pv.getContext('2d').drawImage(out,0,0);
 $('dh-apply').disabled=false;
});
$('dh-apply')?.addEventListener('click',()=>{
 if(!lastDitherCv||!base)return;
 const full=bc(W,H),fg=full.getContext('2d');fg.imageSmoothingEnabled=false;fg.drawImage(lastDitherCv,0,0,W,H);
 addLayerCanvas(full,'Retro Dither');dlg.close();showToast('Added Dither / Halftone layer!',1400);
});

/* ========== 5. Color Blindness Simulator (skratchdot/color-blind matrices) & WCAG Checker ========== */
const CVD_MAT={
 normal:[1,0,0, 0,1,0, 0,0,1],
 protanopia:[0.567,0.433,0, 0.558,0.442,0, 0,0.242,0.758],
 deuteranopia:[0.625,0.375,0, 0.7,0.3,0, 0,0.3,0.7],
 tritanopia:[0.95,0.05,0, 0,0.433,0.567, 0,0.475,0.525],
 achromatopsia:[0.299,0.587,0.114, 0.299,0.587,0.114, 0.299,0.587,0.114]
};
function renderCvdPreview(){
 if(!base)return;
 const snap=captureCanvas(680),g=snap.getContext('2d',{willReadFrequently:true});
 const im=g.getImageData(0,0,snap.width,snap.height),d=im.data,m=CVD_MAT[$('cvd-type').value]||CVD_MAT.normal;
 for(let i=0;i<d.length;i+=4){
  const r=d[i],gr=d[i+1],b=d[i+2];
  d[i]=clamp(r*m[0]+gr*m[1]+b*m[2],0,255);
  d[i+1]=clamp(r*m[3]+gr*m[4]+b*m[5],0,255);
  d[i+2]=clamp(r*m[6]+gr*m[7]+b*m[8],0,255);
 }
 g.putImageData(im,0,0);
 const pv=$('cvd-canvas');pv.width=snap.width;pv.height=snap.height;pv.getContext('2d').drawImage(snap,0,0);
}
$('cvd-type')?.addEventListener('change',renderCvdPreview);
function relLum(hex){
 const [r,g,b]=hexRgb(hex).map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)});
 return 0.2126*r+0.7152*g+0.0722*b;
}
function updateWcag(){
 const l1=relLum($('wcag-fg').value),l2=relLum($('wcag-bg').value);
 const ratio=(Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);
 const badge=$('wcag-badge');if(!badge)return;
 const grade=ratio>=7?'AAA Pass':ratio>=4.5?'AA Pass':ratio>=3?'AA Large':'Fail';
 badge.textContent=`${ratio.toFixed(2)}:1 · ${grade}`;
 badge.className='exp-est-pill '+(ratio>=4.5?'ok':'warn');
}
$('wcag-fg')?.addEventListener('input',updateWcag);
$('wcag-bg')?.addEventListener('input',updateWcag);
updateWcag();

/* ========== 6. Kaleidoscope & Mandala Mirror Art ========== */
function renderKaleidoTo(srcCv,outCv){
 const sw=srcCv.width,sh=srcCv.height,sd=srcCv.getContext('2d',{willReadFrequently:true}).getImageData(0,0,sw,sh).data;
 const ow=outCv.width,oh=outCv.height,og=outCv.getContext('2d'),im=og.createImageData(ow,oh),dd=im.data;
 const segs=+$('kal-seg').value||8,angOff=(+$('kal-ang').value||0)*Math.PI/180,zoom=(+$('kal-zoom').value||100)/100;
 const sector=Math.PI*2/segs,cx=ow/2,cy=oh/2,scx=sw/2,scy=sh/2;
 for(let y=0;y<oh;y++)for(let x=0;x<ow;x++){
  const dx=x-cx,dy=y-cy,rad=Math.hypot(dx,dy)/zoom;
  let a=Math.atan2(dy,dx)+angOff;
  a=((a%(Math.PI*2))+Math.PI*2)%(Math.PI*2);
  let s=a%sector;if(s>sector/2)s=sector-s;
  const sx=clamp(Math.round(scx+Math.cos(s)*rad*(sw/ow)),0,sw-1);
  const sy=clamp(Math.round(scy+Math.sin(s)*rad*(sh/oh)),0,sh-1);
  const si=(sy*sw+sx)*4,oi=(y*ow+x)*4;
  dd[oi]=sd[si];dd[oi+1]=sd[si+1];dd[oi+2]=sd[si+2];dd[oi+3]=sd[si+3];
 }
 og.putImageData(im,0,0);
}
function renderKaleidoPreview(){
 if(!base)return;
 const snap=captureCanvas(480),pv=$('kal-canvas');
 pv.width=snap.width;pv.height=snap.height;renderKaleidoTo(snap,pv);
}
['kal-seg','kal-ang','kal-zoom'].forEach(id=>{
 $(id)?.addEventListener('input',e=>{
  const suf=id==='kal-ang'?'°':id==='kal-zoom'?'%':'';
  e.target.nextElementSibling.value=e.target.value+suf;renderKaleidoPreview();
 });
});
$('kal-apply')?.addEventListener('click',()=>{
 if(!base)return;
 const full=captureCanvas(0),out=bc(W,H);renderKaleidoTo(full,out);
 addLayerCanvas(out,'Kaleidoscope Art');dlg.close();showToast('Added Kaleidoscope layer!',1400);
});

/* ========== 7. 4-Corner Perspective Un-Skew & Document Scanner (Homography Solver) ========== */
const scanCv=$('scan-canvas');
let scanBase=null,scanPts=[],scanDrag=-1;
function initScanner(){
 if(!base||!scanCv)return;
 scanBase=captureCanvas(760);scanCv.width=scanBase.width;scanCv.height=scanBase.height;
 const m=0.1;
 scanPts=[[m,m],[1-m,m],[1-m,1-m],[m,1-m]];
 drawScanner();
}
function drawScanner(){
 if(!scanBase||!scanCv)return;
 const g=scanCv.getContext('2d'),w=scanCv.width,h=scanCv.height;
 g.clearRect(0,0,w,h);g.drawImage(scanBase,0,0);
 g.strokeStyle='#38bdf8';g.lineWidth=2.5;g.beginPath();
 scanPts.forEach(([px,py],i)=>{if(i)g.lineTo(px*w,py*h);else g.moveTo(px*w,py*h)});
 g.closePath();g.stroke();
 scanPts.forEach(([px,py])=>{
  g.fillStyle='#050c1f';g.beginPath();g.arc(px*w,py*h,10,0,Math.PI*2);g.fill();
  g.strokeStyle='#38bdf8';g.lineWidth=3;g.stroke();
 });
}
scanCv?.addEventListener('pointerdown',e=>{
 if(!scanBase)return;
 const r=scanCv.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
 scanDrag=scanPts.findIndex(([px,py])=>Math.hypot(px-x,py-y)<0.07);
 if(scanDrag>=0)scanCv.setPointerCapture(e.pointerId);
});
scanCv?.addEventListener('pointermove',e=>{
 if(scanDrag<0)return;
 const r=scanCv.getBoundingClientRect();
 scanPts[scanDrag]=[clamp((e.clientX-r.left)/r.width,0,1),clamp((e.clientY-r.top)/r.height,0,1)];
 drawScanner();
});
scanCv?.addEventListener('pointerup',()=>{scanDrag=-1});
$('scan-reset')?.addEventListener('click',()=>{scanPts=[[0.1,0.1],[0.9,0.1],[0.9,0.9],[0.1,0.9]];drawScanner()});

function solveHomography(src,dst){
 // Solve 8x8 linear system A*h = b mapping dst(u,v) -> src(x,y)
 const A=[],b=[];
 for(let i=0;i<4;i++){
  const [u,v]=dst[i],[x,y]=src[i];
  A.push([u,v,1,0,0,0,-u*x,-v*x]);b.push(x);
  A.push([0,0,0,u,v,1,-u*y,-v*y]);b.push(y);
 }
 for(let i=0;i<8;i++){
  let mx=i;for(let j=i+1;j<8;j++)if(Math.abs(A[j][i])>Math.abs(A[mx][i]))mx=j;
  [A[i],A[mx]]=[A[mx],A[i]];[b[i],b[mx]]=[b[mx],b[i]];
  const piv=A[i][i]||1e-9;
  for(let k=i;k<8;k++)A[i][k]/=piv;b[i]/=piv;
  for(let j=0;j<8;j++)if(j!==i){const f=A[j][i];for(let k=i;k<8;k++)A[j][k]-=f*A[i][k];b[j]-=f*b[i]}
 }
 return [b[0],b[1],b[2],b[3],b[4],b[5],b[6],b[7],1];
}
$('scan-run')?.addEventListener('click',()=>{
 if(!base||scanPts.length!==4)return;
 const full=captureCanvas(0),sd=full.getContext('2d',{willReadFrequently:true}).getImageData(0,0,W,H).data;
 const srcPts=scanPts.map(([px,py])=>[px*W,py*H]);
 const dstPts=[[0,0],[W,0],[W,H],[0,H]];
 const Hmat=solveHomography(srcPts,dstPts);
 const out=bc(W,H),og=out.getContext('2d'),im=og.createImageData(W,H),dd=im.data;
 const bw=$('scan-bw').checked;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const den=Hmat[6]*x+Hmat[7]*y+1;
  const sx=clamp((Hmat[0]*x+Hmat[1]*y+Hmat[2])/den,0,W-1.001);
  const sy=clamp((Hmat[3]*x+Hmat[4]*y+Hmat[5])/den,0,H-1.001);
  const x0=sx|0,y0=sy|0,fx=sx-x0,fy=sy-y0;
  const i00=(y0*W+x0)*4,i10=i00+4,i01=i00+W*4,i11=i01+4,o=(y*W+x)*4;
  const w00=(1-fx)*(1-fy),w10=fx*(1-fy),w01=(1-fx)*fy,w11=fx*fy;
  let r=sd[i00]*w00+sd[i10]*w10+sd[i01]*w01+sd[i11]*w11;
  let gr=sd[i00+1]*w00+sd[i10+1]*w10+sd[i01+1]*w01+sd[i11+1]*w11;
  let b=sd[i00+2]*w00+sd[i10+2]*w10+sd[i01+2]*w01+sd[i11+2]*w11;
  if(bw){const l=clamp(((0.299*r+0.587*gr+0.114*b)-110)*2.4+128,0,255);r=gr=b=l}
  dd[o]=r;dd[o+1]=gr;dd[o+2]=b;dd[o+3]=255;
 }
 og.putImageData(im,0,0);
 addLayerCanvas(out,bw?'Scanned Document':'Perspective Flattened');
 dlg.close();showToast('Flattened perspective!',1500);
});

/* ========== 8. Circular Avatar / PFP Studio ========== */
function renderPfpTo(outCv){
 if(!base)return;
 const snap=captureCanvas(0),s=outCv.width,g=outCv.getContext('2d');
 g.clearRect(0,0,s,s);
 const zoom=+$('pfp-zoom').value/100,ox=+$('pfp-x').value/100,oy=+$('pfp-y').value/100;
 const bw=+$('pfp-bw').value*(s/320),c1=$('pfp-c1').value,c2=$('pfp-c2').value;
 const r=s/2-bw/2;
 g.save();g.beginPath();g.arc(s/2,s/2,Math.max(10,s/2-bw),0,Math.PI*2);g.clip();
 const baseSc=Math.max(s/snap.width,s/snap.height)*zoom;
 const dw=snap.width*baseSc,dh=snap.height*baseSc;
 g.drawImage(snap,s/2-dw/2+ox*s,s/2-dh/2+oy*s,dw,dh);
 g.restore();
 if(bw>0){
  const gr=g.createLinearGradient(0,0,s,s);gr.addColorStop(0,c1);gr.addColorStop(1,c2);
  g.strokeStyle=gr;g.lineWidth=bw;g.beginPath();g.arc(s/2,s/2,r,0,Math.PI*2);g.stroke();
 }
}
function renderPfpPreview(){renderPfpTo($('pfp-canvas'))}
['pfp-zoom','pfp-x','pfp-y','pfp-bw','pfp-c1','pfp-c2'].forEach(id=>{
 $(id)?.addEventListener('input',e=>{
  if(e.target.type==='range'){const suf=id==='pfp-bw'?' px':'%';e.target.nextElementSibling.value=e.target.value+suf}
  renderPfpPreview();
 });
});
$('pfp-dl')?.addEventListener('click',()=>{
 const out=bc(512,512);renderPfpTo(out);
 const a=document.createElement('a');a.href=out.toDataURL('image/png');a.download='totone-avatar-512.png';a.click();
 showToast('Downloaded 512×512 Avatar PNG!',1400);
});
$('pfp-layer')?.addEventListener('click',()=>{
 const out=bc(512,512);renderPfpTo(out);
 addLayerCanvas(out,'Circular Avatar');dlg.close();showToast('Added Circular Avatar layer!',1400);
});

/* ========== 9. Meme & Social Caption Wrapper ========== */
function wrapLines(g,txt,maxW){
 const words=(txt||'').split(/\s+/).filter(Boolean),lines=[];let cur='';
 for(const w of words){const t=cur?cur+' '+w:w;if(g.measureText(t).width>maxW&&cur){lines.push(cur);cur=w}else cur=t}
 if(cur)lines.push(cur);return lines;
}
function renderMemeTo(outCv,maxW=0){
 if(!base)return;
 const src=captureCanvas(maxW),sw=src.width,sh=src.height,style=$('mm-style').value;
 const fs=Math.round((+$('mm-sz').value||54)*(sw/900)),top=$('mm-top').value||'',bot=$('mm-bot').value||'';
 const g=outCv.getContext('2d');
 if(style==='bar'){
  g.font=`800 ${fs}px Archivo,sans-serif`;
  const lines=wrapLines(g,top||'YOUR CAPTION HERE',sw*0.9);
  const barH=Math.max(fs*1.9,lines.length*fs*1.25+fs*0.9);
  outCv.width=sw;outCv.height=sh+barH;
  g.fillStyle='#ffffff';g.fillRect(0,0,sw,barH);
  g.drawImage(src,0,barH);
  g.fillStyle='#0f172a';g.font=`800 ${fs}px Archivo,sans-serif`;g.textAlign='center';g.textBaseline='middle';
  lines.forEach((ln,i)=>g.fillText(ln,sw/2,fs*0.9+i*fs*1.22));
 }else if(style==='demot'){
  const pad=Math.round(sw*0.09),botH=Math.round(fs*3.2);
  outCv.width=sw+pad*2;outCv.height=sh+pad+botH;
  g.fillStyle='#050507';g.fillRect(0,0,outCv.width,outCv.height);
  g.drawImage(src,pad,pad);
  g.strokeStyle='#ffffff';g.lineWidth=Math.max(2,sw*0.004);g.strokeRect(pad-6,pad-6,sw+12,sh+12);
  g.fillStyle='#ffffff';g.font=`700 ${Math.round(fs*1.15)}px "Playfair Display",Georgia,serif`;g.textAlign='center';
  g.fillText((top||'TITLE').toUpperCase(),outCv.width/2,pad+sh+fs*1.35);
  g.fillStyle='#cbd5e1';g.font=`400 ${Math.round(fs*0.58)}px Archivo,sans-serif`;
  g.fillText(bot||'Subtitle goes here.',outCv.width/2,pad+sh+fs*2.35);
 }else{
  outCv.width=sw;outCv.height=sh;g.drawImage(src,0,0);
  g.font=`900 ${fs}px Impact,Anton,"Archivo Black",sans-serif`;g.textAlign='center';g.fillStyle='#ffffff';g.strokeStyle='#000000';g.lineWidth=Math.max(3,fs*0.14);g.lineJoin='round';
  const drawBlock=(txt,yStart,dir)=>{
   const lns=wrapLines(g,txt.toUpperCase(),sw*0.92);
   lns.forEach((ln,i)=>{
    const y=dir>0?yStart+i*fs*1.15:yStart-(lns.length-1-i)*fs*1.15;
    g.strokeText(ln,sw/2,y);g.fillText(ln,sw/2,y);
   });
  };
  if(top)drawBlock(top,fs*1.2,1);
  if(bot)drawBlock(bot,sh-fs*0.45,-1);
 }
}
function renderMemePreview(){renderMemeTo($('mm-canvas'),720)}
['mm-style','mm-sz','mm-top','mm-bot'].forEach(id=>{
 $(id)?.addEventListener('input',e=>{if(id==='mm-sz')e.target.nextElementSibling.value=e.target.value+' px';renderMemePreview()});
 $(id)?.addEventListener('change',renderMemePreview);
});
$('mm-apply')?.addEventListener('click',()=>{
 const out=bc(10,10);renderMemeTo(out,0);
 addLayerCanvas(out,'Meme Caption');dlg.close();showToast('Added Meme Caption layer!',1400);
});
$('mm-dl')?.addEventListener('click',()=>{
 const out=bc(10,10);renderMemeTo(out,0);
 const a=document.createElement('a');a.href=out.toDataURL('image/png');a.download='totone-meme.png';a.click();
});

/* ========== 10. CLAHE Adaptive Contrast & Gray-World Auto White Balance (Zuiderveld 1994) ========== */
let lastClaheCv=null;
$('cl-clip')?.addEventListener('input',e=>{e.target.nextElementSibling.value=(e.target.value/10).toFixed(1)});
$('cl-mix')?.addEventListener('input',e=>{e.target.nextElementSibling.value=e.target.value+'%'});

function runClaheOnCanvas(srcCv,clipFactor,mix,doWb){
 const w=srcCv.width,h=srcCv.height,out=bc(w,h),g=out.getContext('2d',{willReadFrequently:true});
 g.drawImage(srcCv,0,0);
 const im=g.getImageData(0,0,w,h),d=im.data,n=w*h;
 // Step A: Gray-World Auto White Balance
 let mr=0,mg=0,mb=0;
 if(doWb){
  for(let i=0;i<d.length;i+=4){mr+=d[i];mg+=d[i+1];mb+=d[i+2]}
  mr/=n;mg/=n;mb/=n;const avg=(mr+mg+mb)/3;
  const kr=clamp(avg/(mr||1),0.65,1.5),kg=clamp(avg/(mg||1),0.65,1.5),kb=clamp(avg/(mb||1),0.65,1.5);
  for(let i=0;i<d.length;i+=4){
   d[i]=clamp(d[i]*(1-mix)+d[i]*kr*mix,0,255);
   d[i+1]=clamp(d[i+1]*(1-mix)+d[i+1]*kg*mix,0,255);
   d[i+2]=clamp(d[i+2]*(1-mix)+d[i+2]*kb*mix,0,255);
  }
 }
 // Step B: 8x8 Tiled CLAHE with Bilinear CDF Interpolation
 const tx=8,ty=8,tw=w/tx,th=h/ty;
 const cdfs=Array.from({length:ty},()=>Array.from({length:tx},()=>new Float32Array(256)));
 for(let gy=0;gy<ty;gy++)for(let gx=0;gx<tx;gx++){
  const x0=Math.floor(gx*tw),x1=Math.min(w,Math.floor((gx+1)*tw));
  const y0=Math.floor(gy*th),y1=Math.min(h,Math.floor((gy+1)*th));
  const hist=new Float32Array(256),cnt=Math.max(1,(x1-x0)*(y1-y0));
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
   const o=(y*w+x)*4;hist[(d[o]*77+d[o+1]*150+d[o+2]*29)>>8]++;
  }
  const lim=Math.max(1,(cnt/256)*clipFactor);let excess=0;
  for(let i=0;i<256;i++){if(hist[i]>lim){excess+=hist[i]-lim;hist[i]=lim}}
  const add=excess/256;let acc=0;
  for(let i=0;i<256;i++){acc+=hist[i]+add;cdfs[gy][gx][i]=clamp(acc/cnt*255,0,255)}
 }
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const fx=clamp((x+0.5)/tw-0.5,0,tx-1.001),fy=clamp((y+0.5)/th-0.5,0,ty-1.001);
  const gx0=fx|0,gy0=fy|0,gx1=Math.min(tx-1,gx0+1),gy1=Math.min(ty-1,gy0+1),ux=fx-gx0,uy=fy-gy0;
  const o=(y*w+x)*4,l=(d[o]*77+d[o+1]*150+d[o+2]*29)>>8;
  const eq=(cdfs[gy0][gx0][l]*(1-ux)+cdfs[gy0][gx1][l]*ux)*(1-uy)+(cdfs[gy1][gx0][l]*(1-ux)+cdfs[gy1][gx1][l]*ux)*uy;
  const target=l*(1-mix)+eq*mix,ratio=target/Math.max(1,l);
  d[o]=clamp(d[o]*ratio,0,255);d[o+1]=clamp(d[o+1]*ratio,0,255);d[o+2]=clamp(d[o+2]*ratio,0,255);
 }
 g.putImageData(im,0,0);
 return out;
}

$('cl-run')?.addEventListener('click',()=>{
 if(!base){showToast('Open an image first',1400);return}
 const snap=captureCanvas(840);
 const res=runClaheOnCanvas(snap,+$('cl-clip').value/10,+$('cl-mix').value/100,$('cl-wb').checked);
 lastClaheCv=res;
 const pv=$('cl-canvas');pv.width=res.width;pv.height=res.height;pv.getContext('2d').drawImage(res,0,0);
 $('cl-apply').disabled=false;
});
$('cl-apply')?.addEventListener('click',()=>{
 if(!base)return;
 const full=captureCanvas(0);
 const res=runClaheOnCanvas(full,+$('cl-clip').value/10,+$('cl-mix').value/100,$('cl-wb').checked);
 addLayerCanvas(res,'CLAHE Auto Restore');dlg.close();showToast('Applied CLAHE + Auto WB restoration!',1500);
});

/* Register all 10 tools in Command Palette */
if(Array.isArray(window.toolCommands)){
 window.toolCommands.push(
  ['1. Smart AI Auto-Crop (smartcrop.js)','dialog','l10-smartcrop','smart crop face focal auto ratio'],
  ['2. Low-Poly Delaunay Vector Art (Delaunator)','dialog','l10-lowpoly','low poly triangle delaunay vector svg art'],
  ['3. Pixel Sorting Glitch (ASDFPixelSort)','dialog','l10-pxsort','pixel sort glitch melt streak asdf'],
  ['4. Retro Dithering & CMYK Halftone (Atkinson/Bayer/GameBoy)','dialog','l10-dither','dither atkinson floyd bayer gameboy cmyk halftone'],
  ['5. Color Blindness Simulator & WCAG Contrast Checker','dialog','l10-cvd','color blind accessibility protanopia deuteranopia wcag contrast'],
  ['6. Kaleidoscope & Mandala Symmetry Art','dialog','l10-kaleido','kaleidoscope mandala mirror symmetry radial'],
  ['7. 4-Corner Perspective Un-Skew & Document Scanner','dialog','l10-scanner','scanner document perspective homography flatten unskew receipt'],
  ['8. Circular Avatar & PFP Studio (Discord/X/Steam)','dialog','l10-pfp','pfp avatar circle profile picture ring discord'],
  ['9. Meme & Social Caption Wrapper','dialog','l10-meme','meme caption impact white bar demotivational'],
  ['10. CLAHE Adaptive Contrast & Auto White Balance Restore','dialog','l10-clahe','clahe dehaze underwater fog restore white balance gray world']
 );
}
const prevJumpLab10=jumpTool;
jumpTool=function(tabName,id){
 if(tabName==='dialog'&&id.startsWith('l10-')){openLab10(id.slice(4));return}
 prevJumpLab10(tabName,id);
};
})();
