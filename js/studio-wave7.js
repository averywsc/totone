/* Totone v5.2.0 Wave — Share Totone Link, 4K Wallpaper Studio, Moodboard & 35mm Contact Sheet Maker, Artist Signature Pad, Animated Before/After Wipe GIF & No-Crop Blur-Fill / RGB Channel Swapper */
(function(){
const clamp=(v,lo=0,hi=1)=>v<lo?lo:v>hi?hi:v;
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

/* ========== 0. Share Totone Button ========== */
$('share-totone-btn')?.addEventListener('click',async()=>{
 const url='https://totone.averybeuth.xyz/';
 if(navigator.share){
  try{await navigator.share({title:'Totone Studio',text:'Free browser photo editor, Lightroom color grader & AI design studio',url});return}catch{}
 }
 try{await navigator.clipboard.writeText(url);showToast('Copied Totone link: '+url,1800)}
 catch{prompt('Share Totone:',url)}
});

$('ng-tabs')?.addEventListener('click',e=>{
 const b=e.target.closest('[data-ngt]');if(!b)return;
 const k=b.dataset.ngt;
 if(k==='wallpaper')renderWallpaperPreview();
 else if(k==='sign')loadSavedSignature();
});

/* ========== 1. 4K Wallpaper Studio (Mesh / Aurora / Marble / Cyber Grid) ========== */
let wpSeed=42;
function renderWallpaperTo(outCv,w,h){
 outCv.width=w;outCv.height=h;
 const g=outCv.getContext('2d');
 const style=$('wp-style').value,c1=$('wp-c1').value,c2=$('wp-c2').value,c3=$('wp-c3').value;
 const grain=+$('wp-grain').value||0;
 let s=wpSeed;const rng=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};
 g.fillStyle=c1;g.fillRect(0,0,w,h);

 if(style==='mesh'||style==='marble'){
  const orbs=style==='marble'?14:7;
  for(let i=0;i<orbs;i++){
   const x=rng()*w,y=rng()*h,r=Math.max(w,h)*(style==='marble'?0.25+rng()*0.35:0.42+rng()*0.4);
   const col=i%3===0?c2:i%3===1?c3:c1;
   const gr=g.createRadialGradient(x,y,0,x,y,r);
   gr.addColorStop(0,col+(style==='marble'?'dd':'cc'));gr.addColorStop(1,col+'00');
   g.fillStyle=gr;g.fillRect(0,0,w,h);
  }
  if(style==='marble'){
   g.strokeStyle='rgba(255,255,255,0.22)';g.lineWidth=Math.max(2,w*0.003);
   for(let i=0;i<9;i++){
    g.beginPath();let y=rng()*h;g.moveTo(0,y);
    for(let x=0;x<=w;x+=w/12)g.lineTo(x,y+Math.sin(x/w*Math.PI*3+i)*h*0.14);
    g.stroke();
   }
  }
 }else if(style==='aurora'){
  for(let i=0;i<6;i++){
   const gr=g.createLinearGradient(0,h*0.1,w,h*0.9);
   gr.addColorStop(0,c2+'00');gr.addColorStop(0.45,c2+'aa');gr.addColorStop(0.65,c3+'bb');gr.addColorStop(1,c3+'00');
   g.fillStyle=gr;g.beginPath();
   const baseY=h*(0.2+i*0.12);g.moveTo(0,baseY);
   for(let x=0;x<=w;x+=w/16)g.lineTo(x,baseY+Math.sin(x/w*Math.PI*2.4+i+wpSeed)*h*0.12);
   for(let x=w;x>=0;x-=w/16)g.lineTo(x,baseY+h*0.16+Math.sin(x/w*Math.PI*2.4+i+0.8+wpSeed)*h*0.1);
   g.closePath();g.fill();
  }
 }else if(style==='grid'){
  const hor=h*0.46;
  const sky=g.createLinearGradient(0,0,0,hor);sky.addColorStop(0,c1);sky.addColorStop(1,c3+'99');
  g.fillStyle=sky;g.fillRect(0,0,w,hor);
  // Retro sun
  const sunR=Math.min(w,h)*0.2,sg=g.createLinearGradient(0,hor-sunR*2,0,hor);
  sg.addColorStop(0,c3);sg.addColorStop(1,c2);
  g.fillStyle=sg;g.beginPath();g.arc(w/2,hor-sunR*0.2,sunR,0,Math.PI*2);g.fill();
  g.fillStyle=c1;g.fillRect(0,hor,w,h-hor);
  // Perspective lines
  g.strokeStyle=c2;g.lineWidth=Math.max(1.5,w*0.0015);
  for(let i=-12;i<=12;i++){g.beginPath();g.moveTo(w/2+i*w*0.03,hor);g.lineTo(w/2+i*w*0.22,h);g.stroke()}
  for(let r=1;r<=12;r++){const y=hor+Math.pow(r/12,2.1)*(h-hor);g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke()}
 }
 if(grain>0){
  const im=g.getImageData(0,0,w,h),d=im.data,amp=grain*1.4;
  for(let i=0;i<d.length;i+=4){const n=(Math.random()-0.5)*amp;d[i]=clamp(d[i]+n,0,255);d[i+1]=clamp(d[i+1]+n,0,255);d[i+2]=clamp(d[i+2]+n,0,255)}
  g.putImageData(im,0,0);
 }
}
function renderWallpaperPreview(){
 const pv=$('wp-canvas');if(!pv)return;
 const [rw,rh]=$('wp-size').value.split('x').map(Number);
 const sc=Math.min(1,520/Math.max(rw,rh));
 renderWallpaperTo(pv,Math.round(rw*sc),Math.round(rh*sc));
}
['wp-style','wp-size','wp-c1','wp-c2','wp-c3','wp-grain'].forEach(id=>{
 $(id)?.addEventListener('input',e=>{if(id==='wp-grain')e.target.nextElementSibling.value=e.target.value;renderWallpaperPreview()});
 $(id)?.addEventListener('change',renderWallpaperPreview);
});
$('wp-rand')?.addEventListener('click',()=>{
 const pals=[['#050c1f','#38bdf8','#ec4899'],['#042f2e','#14b8a6','#a3e635'],['#1e1b4b','#818cf8','#fb7185'],['#1c1917','#f59e0b','#ef4444'],['#0f172a','#22d3ee','#6366f1']];
 const p=pals[Math.floor(Math.random()*pals.length)];
 $('wp-c1').value=p[0];$('wp-c2').value=p[1];$('wp-c3').value=p[2];wpSeed=Math.floor(Math.random()*9999);
 renderWallpaperPreview();
});
$('wp-apply')?.addEventListener('click',async()=>{
 const [rw,rh]=$('wp-size').value.split('x').map(Number),out=bc(rw,rh);
 renderWallpaperTo(out,rw,rh);
 await load(new File([await toBlob(out,'image/png')],'Wallpaper.png',{type:'image/png'}));
 $('nextgen-dialog').close();showToast(`Opened ${rw}×${rh} Wallpaper on new page!`,1500);
});
$('wp-dl')?.addEventListener('click',()=>{
 const [rw,rh]=$('wp-size').value.split('x').map(Number),out=bc(rw,rh);
 renderWallpaperTo(out,rw,rh);
 const a=document.createElement('a');a.href=out.toDataURL('image/png');a.download=`totone-wallpaper-${rw}x${rh}.png`;a.click();
});

/* ========== 2. Moodboard & 35mm Film Contact Sheet Maker ========== */
let mbImgs=[];
function renderMoodboardTo(outCv,w=1400,h=1600){
 if(!mbImgs.length)return;
 outCv.width=w;outCv.height=h;
 const g=outCv.getContext('2d'),style=$('mb-style').value,bg=$('mb-bg').value;
 g.fillStyle=bg;g.fillRect(0,0,w,h);
 const n=mbImgs.length,cols=n<=2?2:n<=4?2:3,rows=Math.ceil(n/cols);
 const pad=Math.round(w*0.055),gap=Math.round(w*0.032);
 const cw=(w-pad*2-gap*(cols-1))/cols,ch=(h-pad*2-gap*(rows-1))/rows;

 mbImgs.forEach((im,i)=>{
  const col=i%cols,row=Math.floor(i/cols),x=pad+col*(cw+gap),y=pad+row*(ch+gap);
  if(style==='contact'){
   g.fillStyle='#04060a';g.fillRect(x-6,y-18,cw+12,ch+32);
   g.fillStyle='#f59e0b';g.font=`700 ${Math.max(11,Math.round(w*0.013))}px "Space Mono",monospace`;
   g.fillText(`${String(i+1).padStart(2,'0')}A   TOTONE 400`,x,y-4);
   drawCover(g,im,x,y,cw,ch);
  }else if(style==='polaroid'){
   const ang=((i%2?1:-1)*(2.5+(i*3)%5))*Math.PI/180;
   g.save();g.translate(x+cw/2,y+ch/2);g.rotate(ang);
   g.shadowColor='rgba(0,0,0,0.55)';g.shadowBlur=20;g.shadowOffsetY=8;
   g.fillStyle='#f8fafc';g.fillRect(-cw/2,-ch/2,cw,ch);g.shadowColor='transparent';
   const p=cw*0.06;drawCover(g,im,-cw/2+p,-ch/2+p,cw-p*2,ch-p*3.4);
   g.restore();
  }else{
   g.save();g.beginPath();g.roundRect(x,y,cw,ch,16);g.clip();
   drawCover(g,im,x,y,cw,ch);g.restore();
  }
 });
}
function drawCover(g,im,x,y,w,h){
 const sc=Math.max(w/im.width,h/im.height),dw=im.width*sc,dh=im.height*sc;
 g.save();g.beginPath();g.rect(x,y,w,h);g.clip();g.drawImage(im,x+(w-dw)/2,y+(h-dh)/2,dw,dh);g.restore();
}
$('mb-pick')?.addEventListener('click',()=>$('mb-files')?.click());
$('mb-files')?.addEventListener('change',async e=>{
 const files=[...(e.target.files||[])].slice(0,9);e.target.value='';if(!files.length)return;
 mbImgs=await Promise.all(files.map(f=>createImageBitmap(f)));
 $('mb-status').textContent=`Loaded ${mbImgs.length} photo(s).`;
 $('mb-apply').disabled=false;$('mb-dl').disabled=false;
 renderMoodboardTo($('mb-canvas'),640,740);
});
['mb-style','mb-bg'].forEach(id=>$(id)?.addEventListener('change',()=>{if(mbImgs.length)renderMoodboardTo($('mb-canvas'),640,740)}));
$('mb-apply')?.addEventListener('click',async()=>{
 const out=bc(1400,1600);renderMoodboardTo(out,1400,1600);
 await load(new File([await toBlob(out,'image/png')],'Moodboard.png',{type:'image/png'}));
 $('nextgen-dialog').close();showToast('Opened Moodboard on new page!',1500);
});
$('mb-dl')?.addEventListener('click',()=>{
 const out=bc(1400,1600);renderMoodboardTo(out,1400,1600);
 const a=document.createElement('a');a.href=out.toDataURL('image/png');a.download='totone-moodboard.png';a.click();
});

/* ========== 3. Artist Signature Pad (Saved Locally in localStorage) ========== */
const sgCv=$('sg-canvas'),SG_KEY='totone_artist_sig_v1';
let sgDown=false,sgLast=null;
function loadSavedSignature(){
 if(!sgCv)return;
 const saved=localStorage.getItem(SG_KEY);
 if(saved){const im=new Image();im.onload=()=>{sgCv.getContext('2d').clearRect(0,0,sgCv.width,sgCv.height);sgCv.getContext('2d').drawImage(im,0,0)};im.src=saved}
}
$('sg-w')?.addEventListener('input',e=>{e.target.nextElementSibling.value=e.target.value+' px'});
sgCv?.addEventListener('pointerdown',e=>{
 sgDown=true;sgCv.setPointerCapture(e.pointerId);
 const r=sgCv.getBoundingClientRect();
 sgLast=[(e.clientX-r.left)*sgCv.width/r.width,(e.clientY-r.top)*sgCv.height/r.height];
});
sgCv?.addEventListener('pointermove',e=>{
 if(!sgDown||!sgLast)return;
 const r=sgCv.getBoundingClientRect(),x=(e.clientX-r.left)*sgCv.width/r.width,y=(e.clientY-r.top)*sgCv.height/r.height;
 const g=sgCv.getContext('2d');
 g.strokeStyle=$('sg-col').value;g.lineWidth=+$('sg-w').value;g.lineCap='round';g.lineJoin='round';
 g.beginPath();g.moveTo(sgLast[0],sgLast[1]);g.lineTo(x,y);g.stroke();
 sgLast=[x,y];
});
sgCv?.addEventListener('pointerup',()=>{sgDown=false;sgLast=null});
$('sg-clear')?.addEventListener('click',()=>{sgCv?.getContext('2d').clearRect(0,0,sgCv.width,sgCv.height)});
$('sg-save')?.addEventListener('click',()=>{
 if(!sgCv)return;
 try{localStorage.setItem(SG_KEY,sgCv.toDataURL('image/png'));showToast('Saved your signature in browser!',1400)}
 catch{showToast('Could not save signature',1400)}
});
$('sg-stamp')?.addEventListener('click',()=>{
 if(!base||!sgCv){showToast('Open an image first',1400);return}
 const copy=bc(sgCv.width,sgCv.height);copy.getContext('2d').drawImage(sgCv,0,0);
 const d=copy.getContext('2d').getImageData(0,0,copy.width,copy.height);
 pushU(mkSnap('p'));
 const sc=Math.min(W*0.32/copy.width,H*0.22/copy.height);
 const l={cv:copy,d,o:null,lk:false,sh:null,ol:null,x:W-copy.width*sc*0.6,y:H-copy.height*sc*0.7,s:sc,r:0,op:0.9,bm:'source-over',fl:false,vis:true,cl:0,ct:0,cr:0,cb:0,name:'Artist Signature'};
 layers.push(l);active=l;refreshLayers();draw();
 $('nextgen-dialog').close();showToast('Stamped Artist Signature layer!',1400);
});

/* ========== 4. Animated Before / After Wipe GIF Exporter (gifenc) ========== */
let lastCompGifUrl='';
$('cg-frames')?.addEventListener('input',e=>{e.target.nextElementSibling.value=e.target.value});
$('cg-run')?.addEventListener('click',async()=>{
 if(!base){showToast('Open an image first',1400);return}
 const stat=$('cg-status'),pw=$('cg-prog-wrap'),pb=$('cg-prog-bar');
 pw.hidden=false;pb.style.width='6%';stat.textContent='Loading gifenc encoder…';
 try{
  const {GIFEncoder,quantize,applyPalette}=await import('https://cdn.jsdelivr.net/npm/gifenc@1.0.3/+esm');
  const maxW=+$('cg-w').value||580,nFrames=+$('cg-frames').value||18;
  const afterCv=captureCanvas(maxW),fw=afterCv.width,fh=afterCv.height;
  const beforeRaw=bc(W,H);beforeRaw.getContext('2d').putImageData(base,0,0);
  const beforeCv=bc(fw,fh);beforeCv.getContext('2d').drawImage(beforeRaw,0,0,fw,fh);
  const frameCv=bc(fw,fh),fg=frameCv.getContext('2d',{willReadFrequently:true});
  const gif=GIFEncoder();
  for(let i=0;i<nFrames;i++){
   const phase=i/nFrames;
   // Smooth ping-pong cosine sweep from 12% -> 88% -> 12%
   const pct=0.5-0.42*Math.cos(phase*Math.PI*2),sx=Math.round(fw*pct);
   fg.drawImage(beforeCv,0,0);
   fg.save();fg.beginPath();fg.rect(sx,0,fw-sx,fh);fg.clip();fg.drawImage(afterCv,0,0);fg.restore();
   fg.fillStyle='#ffffff';fg.fillRect(sx-2,0,4,fh);
   const rgba=fg.getImageData(0,0,fw,fh).data;
   const pal=quantize(rgba,256),idx=applyPalette(rgba,pal);
   gif.writeFrame(idx,fw,fh,{palette:pal,delay:90});
   pb.style.width=Math.round(((i+1)/nFrames)*94)+'%';
   stat.textContent=`Encoding frame ${i+1}/${nFrames}…`;
   await new Promise(r=>setTimeout(r,0));
  }
  gif.finish();
  const blob=new Blob([gif.bytes()],{type:'image/gif'});
  if(lastCompGifUrl)URL.revokeObjectURL(lastCompGifUrl);
  lastCompGifUrl=URL.createObjectURL(blob);
  $('cg-preview').innerHTML=`<img src="${lastCompGifUrl}" alt="Before/After Wipe GIF">`;
  $('cg-dl').disabled=false;pb.style.width='100%';
  stat.textContent=`Ready! ${(blob.size/1024).toFixed(0)} KB looping Before/After Wipe GIF (${fw}×${fh})`;
 }catch(err){stat.textContent='Wipe GIF error: '+err.message}
});
$('cg-dl')?.addEventListener('click',()=>{
 if(!lastCompGifUrl)return;
 const a=document.createElement('a');a.href=lastCompGifUrl;a.download='totone-before-after-wipe.gif';a.click();
});

/* ========== 5. No-Crop Blur-Fill Reframer & RGB Channel Swapper ========== */
$('bf-blur')?.addEventListener('input',e=>{e.target.nextElementSibling.value=e.target.value+' px'});
$('bf-apply')?.addEventListener('click',async()=>{
 if(!base){showToast('Open an image first',1400);return}
 const [rw,rh]=$('bf-ratio').value.split(':').map(Number);
 const blurPx=+$('bf-blur').value||22;
 const src=captureCanvas(0);
 const targetW=rw>=rh?1440:1080,targetH=Math.round(targetW*rh/rw);
 const out=bc(targetW,targetH),g=out.getContext('2d');
 g.save();g.filter=`blur(${blurPx}px) brightness(0.75)`;
 const cov=Math.max(targetW/src.width,targetH/src.height)*1.12;
 g.drawImage(src,(targetW-src.width*cov)/2,(targetH-src.height*cov)/2,src.width*cov,src.height*cov);
 g.restore();
 const fit=Math.min(targetW/src.width,targetH/src.height);
 const dw=src.width*fit,dh=src.height*fit;
 g.save();g.shadowColor='rgba(0,0,0,0.45)';g.shadowBlur=28;
 g.drawImage(src,(targetW-dw)/2,(targetH-dh)/2,dw,dh);g.restore();
 await load(new File([await toBlob(out,'image/png')],`Reframed-${rw}x${rh}.png`,{type:'image/png'}));
 $('nextgen-dialog').close();showToast(`Created ${rw}:${rh} Blur-Fill page!`,1500);
});

document.querySelectorAll('[data-ch]').forEach(btn=>{
 btn.onclick=()=>{
  if(!base){showToast('Open an image first',1400);return}
  const mode=btn.dataset.ch,full=captureCanvas(0),g=full.getContext('2d',{willReadFrequently:true});
  const im=g.getImageData(0,0,W,H),d=im.data;
  for(let i=0;i<d.length;i+=4){
   const r=d[i],gr=d[i+1],b=d[i+2];
   if(mode==='rb'){d[i]=b;d[i+2]=r}
   else if(mode==='rg'){d[i]=gr;d[i+1]=r}
   else if(mode==='gb'){d[i+1]=b;d[i+2]=gr}
   else if(mode==='red'){d[i+1]=0;d[i+2]=0}
   else if(mode==='cyan'){d[i]=r*0.2;d[i+1]=gr;d[i+2]=b}
   else if(mode==='aerochrome'){
    // Kodak Aerochrome infrared: green foliage turns vivid crimson-magenta!
    const greenEx=Math.max(0,gr-(r+b)*0.45);
    d[i]=clamp(r+greenEx*1.85,0,255);d[i+1]=clamp(gr-greenEx*0.95,0,255);d[i+2]=clamp(b+greenEx*0.35,0,255);
   }
  }
  g.putImageData(im,0,0);
  addLayerCanvas(full,'Channel · '+btn.textContent);
  $('nextgen-dialog').close();showToast('Applied '+btn.textContent+'!',1400);
 };
});

if(Array.isArray(window.toolCommands)){
 window.toolCommands.push(
  ['4K Wallpaper Studio (Mesh / Aurora / Marble / Cyber Grid)','dialog','ng-wallpaper','wallpaper 4k mesh aurora marble grid background lockscreen'],
  ['Moodboard & 35mm Film Contact Sheet Maker','dialog','ng-moodboard','moodboard polaroid scatter 35mm contact sheet bento collage'],
  ['Artist Signature Pad (Handwritten Stamp)','dialog','ng-sign','signature autograph watermark sign stamp pad'],
  ['Animated Before / After Wipe GIF Exporter','dialog','ng-compgif','before after wipe gif animation reveal slider loop'],
  ['No-Crop Blur-Fill Reframer & RGB Channel Swapper','dialog','ng-utils','blur fill no crop reframe aspect ratio infrared aerochrome rgb channel swap']
 );
}
})();
