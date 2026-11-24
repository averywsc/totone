/* Totone Pro Studio — .CUBE 3D LUT Import/Export, SVG Vectorizer (imagetracerjs), Animated GIF Maker (gifenc), Device Mockups, OCR Grab Text (tesseract.js), Watermark & EXIF Inspector (exifr) */
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
function captureRenderedCanvas(maxW=0){
 render(false);
 const sw=W,sh=H,sc=maxW?Math.min(1,maxW/Math.max(sw,sh)):1;
 const cv=bc(Math.max(1,Math.round(sw*sc)),Math.max(1,Math.round(sh*sc)));
 const g=cv.getContext('2d',{willReadFrequently:true});
 g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
 g.drawImage(c,0,0,cv.width,cv.height);
 draw(true);
 return cv;
}

/* ========== 1. Hollywood .CUBE 3D LUT Importer & Exporter ========== */
let loadedLut=null,lutStrength=1;
function parseCubeLut(text,filename){
 let size=0,title=filename.replace(/\.[^.]+$/,'');
 const rows=[];
 for(const raw of text.split(/\r?\n/)){
  const line=raw.trim();
  if(!line||line.startsWith('#'))continue;
  if(line.startsWith('TITLE')){title=line.slice(5).trim().replace(/^"|"$/g,'')||title;continue}
  if(line.startsWith('LUT_3D_SIZE')){size=parseInt(line.split(/\s+/)[1],10);continue}
  if(/^[A-Z_]+/.test(line))continue;
  const parts=line.split(/\s+/).map(Number);
  if(parts.length>=3&&parts.every(Number.isFinite))rows.push(parts[0],parts[1],parts[2]);
 }
 if(!size||rows.length<size*size*size*3)throw Error('Invalid 3D .cube LUT file.');
 return {title,size,data:new Float32Array(rows.slice(0,size*size*size*3))};
}
function applyCubeLutToImageData(im,lut,strength,splitX){
 const {size,data}=lut,N=size-1,d=im.data,w=im.width,h=im.height;
 const at=(ri,gi,bi,ch)=>data[((bi*size+gi)*size+ri)*3+ch];
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  if(splitX&&x<splitX)continue;
  const idx=y*w+x,i=idx*4;if(!d[i+3])continue;
  const m=sel?sel[idx]/255:1;if(!m)continue;
  const r=d[i]/255*N,g=d[i+1]/255*N,b=d[i+2]/255*N;
  const r0=Math.min(N-1,r|0),g0=Math.min(N-1,g|0),b0=Math.min(N-1,b|0);
  const r1=r0+1,g1=g0+1,b1=b0+1,fr=r-r0,fg=g-g0,fb=b-b0;
  const mix=strength*m;
  for(let ch=0;ch<3;ch++){
   const c000=at(r0,g0,b0,ch),c100=at(r1,g0,b0,ch),c010=at(r0,g1,b0,ch),c110=at(r1,g1,b0,ch);
   const c001=at(r0,g0,b1,ch),c101=at(r1,g0,b1,ch),c011=at(r0,g1,b1,ch),c111=at(r1,g1,b1,ch);
   const c00=c000+(c100-c000)*fr,c10=c010+(c110-c010)*fr;
   const c01=c001+(c101-c001)*fr,c11=c011+(c111-c011)*fr;
   const val=(c00+(c10-c00)*fg)*(1-fb)+(c01+(c11-c01)*fg)*fb;
   d[i+ch]=clamp(d[i+ch]+(val*255-d[i+ch])*mix,0,255);
  }
 }
}

// Chain cleanly into window.proDevelopActive & window.applyProDevelop!
const prevProActive=window.proDevelopActive;
window.proDevelopActive=()=>(prevProActive?.()||false)||!!(loadedLut&&lutStrength>0);
const prevProApply=window.applyProDevelop;
window.applyProDevelop=function(im,ov,splitX,raw){
 prevProApply?.(im,ov,splitX,raw);
 if(loadedLut&&lutStrength>0)applyCubeLutToImageData(im,loadedLut,lutStrength,splitX);
};

$('lut-import').onclick=()=>$('lut-file').click();
$('lut-file').onchange=async e=>{
 const f=e.target.files[0];e.target.value='';if(!f)return;
 try{
  loadedLut=parseCubeLut(await f.text(),f.name);
  lutStrength=1;$('lut-str').value=100;$('lut-str').nextElementSibling.value='100%';
  $('lut-str-row').hidden=false;$('lut-clear').disabled=false;
  $('lut-status').textContent=`Loaded 3D LUT: ${loadedLut.title} (${loadedLut.size}³)`;
  draw();showToast(`Loaded 3D LUT "${loadedLut.title}"`,1600);
 }catch(err){$('lut-status').textContent=err.message}
};
$('lut-str').oninput=e=>{lutStrength=+e.target.value/100;e.target.nextElementSibling.value=e.target.value+'%';draw()};
$('lut-clear').onclick=()=>{
 loadedLut=null;$('lut-str-row').hidden=true;$('lut-clear').disabled=true;
 $('lut-status').textContent='No 3D LUT loaded.';draw();showToast('Removed 3D LUT',1100);
};
$('lut-export').onclick=()=>{
 // Bake Totone's current color look (Film + Basic + Point Color + 3D LUT) into a real 17x17x17 .cube LUT!
 const N=17,total=N*N*N;
 const lattice=new ImageData(N*N,N),ld=lattice.data;
 let k=0;
 for(let b=0;b<N;b++)for(let g=0;g<N;g++)for(let r=0;r<N;r++){
  ld[k*4]=Math.round(r/(N-1)*255);ld[k*4+1]=Math.round(g/(N-1)*255);ld[k*4+2]=Math.round(b/(N-1)*255);ld[k*4+3]=255;k++;
 }
 let out=film?.enabled()?film.image(lattice):lattice;
 const copy=new ImageData(new Uint8ClampedArray(out.data),out.width,out.height);
 if(typeof window.applyProDevelop==='function')window.applyProDevelop(copy,false,0,copy.data);
 const lines=[`TITLE "${(projectTitle||'Totone-Look').replace(/"/g,'')}"`,'LUT_3D_SIZE 17','DOMAIN_MIN 0.0 0.0 0.0','DOMAIN_MAX 1.0 1.0 1.0'];
 for(let i=0;i<total;i++){
  const j=i*4;
  lines.push(`${(copy.data[j]/255).toFixed(6)} ${(copy.data[j+1]/255).toFixed(6)} ${(copy.data[j+2]/255).toFixed(6)}`);
 }
 const blob=new Blob([lines.join('\n')+'\n'],{type:'text/plain'});
 downloadBlob(blob,(projectTitle||'totone')+'-look.cube');
 showToast('Exported 17×17×17 .cube 3D LUT!',1800);
};
$('rlook').addEventListener('click',()=>{loadedLut=null;$('lut-str-row').hidden=true;$('lut-clear').disabled=true;$('lut-status').textContent='No 3D LUT loaded.'});

/* ========== 2. Pro Studio Modal Tabs & Entry ========== */
function openProStudio(pane='svg'){
 const dlg=$('pro-studio-dialog');
 if(!dlg.open)dlg.showModal();
 $('pro-tabs').querySelector(`[data-pt="${pane}"]`)?.click();
}
window.openProStudio=openProStudio;
$('pro-close').onclick=()=>$('pro-studio-dialog').close();
$('pro-studio-dialog').addEventListener('keydown',e=>e.stopPropagation());
$('pro-tabs').onclick=e=>{
 const b=e.target.closest('[data-pt]');if(!b)return;
 const id=b.dataset.pt;
 $('pro-tabs').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));
 $('pro-studio-dialog').querySelectorAll('.pro-pane').forEach(p=>p.hidden=p.id!=='pt-'+id);
 if(id==='mockup'&&base)renderMockupPreview();
};
$('tool-dock')?.addEventListener('click',e=>{
 if(e.target.closest('[data-dock="pro"]'))openProStudio('svg');
});
$('sb-exif-btn')?.addEventListener('click',()=>openProStudio('wm'));

/* ========== 3. SVG Vectorizer (imagetracerjs — MIT) ========== */
let lastSvgStr='';
$('svg-colors').oninput=e=>{e.target.nextElementSibling.value=e.target.value};
$('svg-run').onclick=async()=>{
 if(!base){showToast('Open an image first',1400);return}
 $('svg-status').textContent='Loading imagetracerjs & tracing vectors…';
 $('svg-run').disabled=true;
 try{
  await loadScriptOnce('https://cdn.jsdelivr.net/npm/imagetracerjs@1.2.6/imagetracer_v1.2.6.js',()=>!!window.ImageTracer);
  const srcCv=captureRenderedCanvas(520);
  const im=srcCv.getContext('2d').getImageData(0,0,srcCv.width,srcCv.height);
  const preset=$('svg-preset').value;
  const opts={...(window.ImageTracer.optionpresets[preset]||{}),numberofcolors:+$('svg-colors').value,viewbox:true};
  lastSvgStr=window.ImageTracer.imagedataToSVG(im,opts);
  const prev=$('svg-preview');
  const blob=new Blob([lastSvgStr],{type:'image/svg+xml;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const img=document.createElement('img');img.src=url;img.alt='Traced SVG preview';
  img.onload=()=>URL.revokeObjectURL(url);
  prev.replaceChildren(img);
  $('svg-download').disabled=false;$('svg-add-layer').disabled=false;
  $('svg-status').textContent=`Traced clean SVG (${(lastSvgStr.length/1024).toFixed(1)} KB · ${$('svg-colors').value} colours).`;
 }catch(err){$('svg-status').textContent='Vectorize failed: '+(err?.message||err)}
 finally{$('svg-run').disabled=false}
};
$('svg-download').onclick=()=>{
 if(!lastSvgStr)return;
 downloadBlob(new Blob([lastSvgStr],{type:'image/svg+xml;charset=utf-8'}),(projectTitle||'totone')+'-vector.svg');
 showToast('Downloaded .SVG vector!',1400);
};
$('svg-add-layer').onclick=async()=>{
 if(!lastSvgStr)return;
 const blob=new Blob([lastSvgStr],{type:'image/svg+xml;charset=utf-8'});
 const url=URL.createObjectURL(blob);
 try{
  const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=url});
  const cv=bc(W,H);cv.getContext('2d').drawImage(img,0,0,W,H);
  const d=cv.getContext('2d').getImageData(0,0,W,H);
  pushU(mkSnap('p'));
  const l={cv,d,o:null,lk:false,sh:null,ol:null,x:W/2,y:H/2,s:1,r:0,op:1,bm:'source-over',fl:false,vis:true,cl:0,ct:0,cr:0,cb:0,name:'Vector Trace'};
  layers.push(l);active=l;refreshLayers();draw();
  $('pro-studio-dialog').close();showToast('Added vectorized layer!',1500);
 }finally{URL.revokeObjectURL(url)}
};

/* ========== 4. Animated GIF Maker (gifenc — MIT) ========== */
let lastGifBlob=null,gifEncPromise=null;
$('gif-frames').oninput=e=>{e.target.nextElementSibling.value=e.target.value};
$('gif-fps').oninput=e=>{e.target.nextElementSibling.value=e.target.value};
$('gif-run').onclick=async()=>{
 if(!base){showToast('Open an image first',1400);return}
 $('gif-run').disabled=true;$('gif-download').disabled=true;
 $('gif-prog-wrap').hidden=false;$('gif-prog-bar').style.width='8%';
 $('gif-status').textContent='Loading gifenc encoder…';
 try{
  if(!gifEncPromise)gifEncPromise=import('https://cdn.jsdelivr.net/npm/gifenc@1.0.3/+esm');
  const {GIFEncoder,quantize,applyPalette}=await gifEncPromise;
  const style=$('gif-style').value,maxW=+$('gif-width').value,fps=+$('gif-fps').value;
  const delay=Math.round(1000/fps);
  const baseCv=captureRenderedCanvas(maxW),gw=baseCv.width,gh=baseCv.height;
  const frameCount=style==='layers'?Math.max(2,layers.filter(l=>l.vis).length):+$('gif-frames').value;
  const gif=GIFEncoder();
  const workCv=bc(gw,gh),wg=workCv.getContext('2d',{willReadFrequently:true});
  const visLayers=layers.filter(l=>l.vis);

  for(let f=0;f<frameCount;f++){
   const t=f/frameCount,wave=Math.sin(t*Math.PI*2);
   wg.clearRect(0,0,gw,gh);
   if(style==='layers'&&visLayers.length){
    wg.fillStyle='#050c1f';wg.fillRect(0,0,gw,gh);
    const l=visLayers[f%visLayers.length];
    const sc=Math.min(gw/l.cv.width,gh/l.cv.height)*0.92;
    wg.drawImage(visibleLayer(l).cv,(gw-l.cv.width*sc)/2,(gh-l.cv.height*sc)/2,l.cv.width*sc,l.cv.height*sc);
   }else if(style==='zoom'){
    const z=1+0.18*(0.5-0.5*Math.cos(t*Math.PI*2));
    wg.drawImage(baseCv,(gw-gw*z)/2,(gh-gh*z)/2,gw*z,gh*z);
   }else if(style==='spin'){
    wg.fillStyle='#050c1f';wg.fillRect(0,0,gw,gh);
    wg.save();wg.translate(gw/2,gh/2);wg.rotate(t*Math.PI*2);wg.drawImage(baseCv,-gw/2,-gh/2);wg.restore();
   }else{
    wg.drawImage(baseCv,0,0);
    const im=wg.getImageData(0,0,gw,gh),s=new Uint8ClampedArray(im.data),d=im.data;
    if(style==='glitch'){
     const sh=Math.round(4+18*Math.abs(wave));
     for(let y=0;y<gh;y++){
      const band=((y>>4)*11+f*7)%15,tear=band<3?(band-1)*sh:0,scan=y%3===0?0.85:1;
      for(let x=0;x<gw;x++){
       const sx=Math.max(0,Math.min(gw-1,x+tear)),rx=Math.max(0,Math.min(gw-1,sx+4)),bx=Math.max(0,Math.min(gw-1,sx-4));
       const i=(y*gw+x)*4;
       d[i]=s[(y*gw+rx)*4]*scan;d[i+1]=s[(y*gw+sx)*4+1]*scan;d[i+2]=s[(y*gw+bx)*4+2]*scan;
      }
     }
    }else if(style==='chroma'){
     const sh=Math.round(2+12*(0.5+0.5*wave));
     for(let y=0;y<gh;y++)for(let x=0;x<gw;x++){
      const i=(y*gw+x)*4,rx=Math.min(gw-1,x+sh),bx=Math.max(0,x-sh);
      d[i]=s[(y*gw+rx)*4];d[i+1]=s[i+1];d[i+2]=s[(y*gw+bx)*4+2];
     }
    }else if(style==='holo'){
     const pulse=0.75+0.45*(0.5+0.5*wave),scanPos=Math.floor(t*gh);
     for(let y=0;y<gh;y++){
      const bar=Math.abs(y-scanPos)<10?1.6:1,scn=y%3===0?0.62:1;
      for(let x=0;x<gw;x++){
       const i=(y*gw+x)*4,l=(s[i]*.299+s[i+1]*.587+s[i+2]*.114)/255;
       d[i]=Math.min(255,l*70*pulse*bar*scn);d[i+1]=Math.min(255,l*170*pulse*bar*scn);d[i+2]=Math.min(255,l*255*pulse*bar*scn);
      }
     }
    }
    wg.putImageData(im,0,0);
   }
   const rgba=wg.getImageData(0,0,gw,gh).data;
   const palette256=quantize(rgba,256);
   const index=applyPalette(rgba,palette256);
   gif.writeFrame(index,gw,gh,{palette:palette256,delay,repeat:0});
   $('gif-prog-bar').style.width=Math.round(((f+1)/frameCount)*100)+'%';
   $('gif-status').textContent=`Encoding frame ${f+1} of ${frameCount}…`;
   await new Promise(r=>requestAnimationFrame(r));
  }
  gif.finish();
  lastGifBlob=new Blob([gif.bytes()],{type:'image/gif'});
  const url=URL.createObjectURL(lastGifBlob);
  const img=document.createElement('img');img.src=url;img.alt='Animated GIF preview';
  $('gif-preview').replaceChildren(img);
  $('gif-download').disabled=false;
  $('gif-status').textContent=`Ready! ${frameCount} frames · ${(lastGifBlob.size/1024).toFixed(0)} KB animated GIF.`;
 }catch(err){$('gif-status').textContent='GIF render failed: '+(err?.message||err)}
 finally{$('gif-run').disabled=false;$('gif-prog-wrap').hidden=true}
};
$('gif-download').onclick=()=>{
 if(!lastGifBlob)return;
 downloadBlob(lastGifBlob,(projectTitle||'totone')+'-loop.gif');
 showToast('Downloaded animated .GIF!',1500);
};

/* ========== 5. Studio Device & Physical Media Mockup Generator ========== */
let lastMockupCv=null;
function buildMockupCanvas(type,bgCol){
 const src=captureRenderedCanvas(1200);
 const mw=1200,mh=type==='iphone'?1350:type==='laptop'?860:1100;
 const cv=bc(mw,mh),g=cv.getContext('2d');
 // Rich studio radial backdrop
 const [br,bg,bb]=rgb(bgCol||'#0a1228');
 const rad=g.createRadialGradient(mw/2,mh*0.42,40,mw/2,mh/2,mw*0.72);
 rad.addColorStop(0,`rgb(${Math.min(255,br+34)},${Math.min(255,bg+40)},${Math.min(255,bb+54)})`);
 rad.addColorStop(1,bgCol||'#0a1228');
 g.fillStyle=rad;g.fillRect(0,0,mw,mh);

 const drawCover=(x,y,w,h,r=0)=>{
  g.save();if(r){g.beginPath();g.roundRect(x,y,w,h,r);g.clip()}else{g.beginPath();g.rect(x,y,w,h);g.clip()}
  const cov=Math.max(w/src.width,h/src.height),dw=src.width*cov,dh=src.height*cov;
  g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
  g.drawImage(src,x+(w-dw)/2,y+(h-dh)/2,dw,dh);
  g.restore();
 };

 if(type==='iphone'){
  const pw=540,ph=1110,px=(mw-pw)/2,py=(mh-ph)/2;
  g.save();g.shadowColor='rgba(0,0,0,0.65)';g.shadowBlur=55;g.shadowOffsetY=28;
  g.fillStyle='#1c212c';g.beginPath();g.roundRect(px,py,pw,ph,74);g.fill();g.restore();
  g.strokeStyle='#475569';g.lineWidth=4;g.beginPath();g.roundRect(px+2,py+2,pw-4,ph-4,72);g.stroke();
  drawCover(px+20,py+20,pw-40,ph-40,56);
  // Dynamic island + glass reflection
  g.fillStyle='#05070c';g.beginPath();g.roundRect(mw/2-72,py+38,144,36,18);g.fill();
  const gl=g.createLinearGradient(px,py,px+pw*0.6,py+ph*0.45);
  gl.addColorStop(0,'rgba(255,255,255,0.16)');gl.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=gl;g.beginPath();g.roundRect(px+20,py+20,pw-40,ph-40,56);g.fill();
 }else if(type==='laptop'){
  const sw=880,sh=560,sx=(mw-sw)/2,sy=110;
  g.save();g.shadowColor='rgba(0,0,0,0.6)';g.shadowBlur=48;g.shadowOffsetY=22;
  g.fillStyle='#161a24';g.beginPath();g.roundRect(sx-24,sy-24,sw+48,sh+48,22);g.fill();g.restore();
  g.strokeStyle='#475569';g.lineWidth=3;g.beginPath();g.roundRect(sx-23,sy-23,sw+46,sh+46,21);g.stroke();
  drawCover(sx,sy,sw,sh,6);
  // Aluminum base deck
  const deck=g.createLinearGradient(0,sy+sh+24,0,sy+sh+64);
  deck.addColorStop(0,'#cbd5e1');deck.addColorStop(0.5,'#64748b');deck.addColorStop(1,'#334155');
  g.fillStyle=deck;g.beginPath();g.roundRect(sx-96,sy+sh+24,sw+192,34,[4,4,18,18]);g.fill();
  g.fillStyle='#475569';g.beginPath();g.roundRect(mw/2-70,sy+sh+24,140,10,[0,0,8,8]);g.fill();
 }else if(type==='cdcase'){
  const cw=780,ch=700,cx=(mw-cw)/2,cy=(mh-ch)/2;
  g.save();g.shadowColor='rgba(0,0,0,0.65)';g.shadowBlur=48;g.shadowOffsetY=24;
  g.fillStyle='rgba(220,235,255,0.18)';g.fillRect(cx,cy,cw,ch);g.restore();
  // Spine tray ridges on left
  g.fillStyle='#1e293b';g.fillRect(cx+8,cy+8,78,ch-16);
  g.strokeStyle='rgba(255,255,255,0.14)';g.lineWidth=2;
  for(let y=cy+18;y<cy+ch-16;y+=9){g.beginPath();g.moveTo(cx+14,y);g.lineTo(cx+80,y);g.stroke()}
  drawCover(cx+94,cy+14,cw-108,ch-28,2);
  // Plastic jewel case glare + tabs
  const glare=g.createLinearGradient(cx,cy,cx+cw*0.7,cy+ch*0.6);
  glare.addColorStop(0,'rgba(255,255,255,0.32)');glare.addColorStop(0.45,'rgba(255,255,255,0.03)');glare.addColorStop(0.5,'rgba(255,255,255,0.18)');glare.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=glare;g.fillRect(cx,cy,cw,ch);
  g.strokeStyle='rgba(255,255,255,0.48)';g.lineWidth=4;g.strokeRect(cx+2,cy+2,cw-4,ch-4);
 }else if(type==='vinyl'){
  const sl=660,sx=140,sy=(mh-sl)/2,vx=sx+sl+110,vy=mh/2,vr=sl*0.47;
  // Vinyl record disc peeking out on right
  g.save();g.shadowColor='rgba(0,0,0,0.6)';g.shadowBlur=38;
  g.fillStyle='#0c0e14';g.beginPath();g.arc(vx,vy,vr,0,Math.PI*2);g.fill();g.restore();
  g.strokeStyle='rgba(255,255,255,0.08)';g.lineWidth=1.5;
  for(let r=vr*0.42;r<vr-8;r+=8){g.beginPath();g.arc(vx,vy,r,0,Math.PI*2);g.stroke()}
  drawCover(vx-96,vy-96,192,192,96);
  g.fillStyle='#0c0e14';g.beginPath();g.arc(vx,vy,14,0,Math.PI*2);g.fill();
  // Album sleeve on left
  g.save();g.shadowColor='rgba(0,0,0,0.65)';g.shadowBlur=44;g.shadowOffsetX=14;g.shadowOffsetY=18;
  g.fillStyle='#111';g.fillRect(sx,sy,sl,sl);g.restore();
  drawCover(sx,sy,sl,sl,2);
 }else{
  // Framed Gallery Print
  const fw=780,fh=880,fx=(mw-fw)/2,fy=(mh-fh)/2;
  g.save();g.shadowColor='rgba(0,0,0,0.68)';g.shadowBlur=50;g.shadowOffsetY=24;
  g.fillStyle='#18181b';g.fillRect(fx,fy,fw,fh);g.restore();
  g.fillStyle='#f8f6f1';g.fillRect(fx+28,fy+28,fw-56,fh-56);
  drawCover(fx+84,fy+84,fw-168,fh-168,0);
  g.strokeStyle='rgba(0,0,0,0.12)';g.lineWidth=2;g.strokeRect(fx+84,fy+84,fw-168,fh-168);
 }
 return cv;
}
function renderMockupPreview(){
 if(!base)return;
 lastMockupCv=buildMockupCanvas($('mk-type').value,$('mk-bg').value);
 const dst=$('mk-canvas');dst.width=lastMockupCv.width;dst.height=lastMockupCv.height;
 dst.getContext('2d').drawImage(lastMockupCv,0,0);
}
$('mk-type').onchange=$('mk-bg').oninput=renderMockupPreview;
$('mk-apply').onclick=async()=>{
 if(!lastMockupCv)renderMockupPreview();
 if(!lastMockupCv)return;
 const blob=await toBlob(lastMockupCv,'image/png');
 $('pro-studio-dialog').close();
 await load(new File([blob],(projectTitle||'totone')+'-mockup.png',{type:'image/png'}));
 showToast('Applied studio mockup to canvas!',1600);
};
$('mk-download').onclick=async()=>{
 if(!lastMockupCv)renderMockupPreview();
 if(!lastMockupCv)return;
 const blob=await toBlob(lastMockupCv,'image/png');
 if(blob){downloadBlob(blob,(projectTitle||'totone')+'-mockup.png');showToast('Downloaded mockup PNG!',1400)}
};

/* ========== 6. OCR Magic Grab Text (Tesseract.js — Apache-2.0) ========== */
$('ocr-run').onclick=async()=>{
 if(!base){showToast('Open an image first',1400);return}
 $('ocr-run').disabled=true;$('ocr-prog-wrap').hidden=false;$('ocr-prog-bar').style.width='8%';
 $('ocr-status').textContent='Loading Tesseract.js OCR engine…';
 try{
  await loadScriptOnce('https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js',()=>!!window.Tesseract);
  const srcCv=captureRenderedCanvas(1400);
  const result=await window.Tesseract.recognize(srcCv,'eng',{
   logger:m=>{
    if(m.status&&Number.isFinite(m.progress)){
     $('ocr-prog-bar').style.width=Math.max(10,Math.round(m.progress*100))+'%';
     $('ocr-status').textContent=`${m.status}… ${Math.round(m.progress*100)}%`;
    }
   }
  });
  const text=(result?.data?.text||'').trim();
  $('ocr-out').value=text;
  $('ocr-copy').disabled=!text;$('ocr-to-layer').disabled=!text;
  $('ocr-status').textContent=text?`Extracted ${text.split(/\s+/).length} words locally!`:'No readable text detected.';
 }catch(err){$('ocr-status').textContent='OCR failed: '+(err?.message||err)}
 finally{$('ocr-run').disabled=false;$('ocr-prog-wrap').hidden=true}
};
$('ocr-copy').onclick=async()=>{
 const t=$('ocr-out').value;if(!t)return;
 try{await navigator.clipboard.writeText(t);showToast('Copied extracted text!',1400)}catch{showToast('Select & copy from the box above',1500)}
};
$('ocr-to-layer').onclick=()=>{
 const t=$('ocr-out').value.trim();if(!t||!base)return;
 $('pro-studio-dialog').close();
 newTextLayer({t,sz:Math.max(24,Math.round(Math.min(W,H)*0.055)),wrap:Math.round(W*0.75)});
 document.querySelector('.tabs [data-t="text"]')?.click();
 showToast('Converted extracted OCR text into editable layer!',1700);
};

/* ========== 7. Tiled Watermark Layer + Camera EXIF Inspector (exifr — MIT) ========== */
$('wm-op').oninput=e=>{e.target.nextElementSibling.value=e.target.value+'%'};
$('wm-ang').oninput=e=>{e.target.nextElementSibling.value=e.target.value+'°'};
$('wm-apply').onclick=()=>{
 if(!base){showToast('Open an image first',1400);return}
 const txt=($('wm-text').value||'© TOTONE').trim();if(!txt)return;
 const col=$('wm-col').value,op=+$('wm-op').value/100,ang=+$('wm-ang').value*Math.PI/180;
 const cv=bc(W,H),g=cv.getContext('2d');
 g.save();g.translate(W/2,H/2);g.rotate(ang);
 const fontSize=Math.max(18,Math.round(Math.min(W,H)*0.042));
 g.font=`700 ${fontSize}px Archivo,sans-serif`;g.fillStyle=col;g.globalAlpha=op;g.textAlign='center';g.textBaseline='middle';
 const stepX=Math.max(180,Math.round(g.measureText(txt).width+fontSize*2.4)),stepY=Math.round(fontSize*3.8);
 const diag=Math.hypot(W,H);
 for(let y=-diag;y<=diag;y+=stepY)for(let x=-diag;x<=diag;x+=stepX)g.fillText(txt,x+(Math.round(y/stepY)%2?stepX/2:0),y);
 g.restore();
 const d=g.getImageData(0,0,W,H);
 pushU(mkSnap('p'));
 const l={cv,d,o:null,lk:false,sh:null,ol:null,x:W/2,y:H/2,s:1,r:0,op:1,bm:'source-over',fl:false,vis:true,cl:0,ct:0,cr:0,cb:0,name:'Watermark'};
 layers.push(l);active=l;refreshLayers();draw();
 $('pro-studio-dialog').close();showToast('Added tiled watermark layer!',1400);
};

async function inspectExifFile(file){
 if(!file||!file.type?.startsWith('image/')){if($('sb-exif-btn'))$('sb-exif-btn').hidden=true;return}
 try{
  await loadScriptOnce('https://cdn.jsdelivr.net/npm/exifr@7.1.3/dist/lite.umd.js',()=>!!window.exifr);
  const meta=await window.exifr.parse(file);
  if(!meta||!Object.keys(meta).length){
   $('sb-exif-btn').hidden=true;
   $('exif-table').textContent='No EXIF camera metadata found in this file.';return;
  }
  const rows=[];
  if(meta.Make||meta.Model)rows.push(['Camera',[meta.Make,meta.Model].filter(Boolean).join(' ')]);
  if(meta.LensModel)rows.push(['Lens',meta.LensModel]);
  if(meta.FocalLength)rows.push(['Focal Length',meta.FocalLength+' mm']);
  if(meta.FNumber)rows.push(['Aperture','f/'+meta.FNumber]);
  if(meta.ExposureTime)rows.push(['Shutter',meta.ExposureTime<1?`1/${Math.round(1/meta.ExposureTime)} s`:meta.ExposureTime+' s']);
  if(meta.ISO)rows.push(['ISO',meta.ISO]);
  if(meta.DateTimeOriginal)rows.push(['Taken',new Date(meta.DateTimeOriginal).toLocaleString()]);
  if(meta.latitude&&meta.longitude)rows.push(['GPS (stripped on export)',`${meta.latitude.toFixed(4)}, ${meta.longitude.toFixed(4)}`]);
  if(!rows.length){$('sb-exif-btn').hidden=true;return}
  $('sb-exif-btn').hidden=false;
  $('sb-exif-btn').textContent=meta.Model?`EXIF · ${String(meta.Model).slice(0,18)}`:'EXIF';
  $('exif-table').innerHTML='<table>'+rows.map(([k,v])=>`<tr><td>${esc(k)}</td><td>${esc(String(v))}</td></tr>`).join('')+'</table><p class="note">Totone automatically strips private EXIF &amp; GPS data when exporting.</p>';
 }catch{$('sb-exif-btn').hidden=true}
}
$('file').addEventListener('change',e=>{const f=e.target.files?.[0];if(f)inspectExifFile(f)},true);

toolCommands.push(
 ['3D LUT (.cube) Import & Export','grade','lr-lut-panel','lut cube davinci premiere lightroom color grade 3d'],
 ['SVG Image Vectorizer (Illustrator Image Trace)','dialog','pro-svg','svg vector trace illustrator logo convert'],
 ['Animated GIF & Glitch Loop Maker','dialog','pro-gif','gif animation loop video glitch flipbook spin'],
 ['Device & Media Mockups (iPhone / MacBook / CD / Vinyl)','dialog','pro-mockup','mockup iphone macbook cd jewel case vinyl frame'],
 ['OCR Grab Text from Image (Tesseract AI)','dialog','pro-ocr','ocr extract grab text scan screenshot'],
 ['Tiled Watermark & EXIF Camera Inspector','dialog','pro-wm','watermark copyright exif camera iso lens gps privacy']
);
const prevJumpPro=jumpTool;
jumpTool=function(tabName,id){
 if(tabName==='dialog'&&id.startsWith('pro-')){openProStudio(id.slice(4));return}
 prevJumpPro(tabName,id);
};
})();
