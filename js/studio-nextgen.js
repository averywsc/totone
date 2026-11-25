/* Totone Next-Gen Studio — Patch Notes Modal, 3D Surface-Normal Photo Relighting, Reinhard Lab Movie Color Transfer, Optical Camera Lens Lab (Tilt-Shift / 800T Halation / Zoom Blur / Fisheye / Fluted Glass), Interactive 3D Card & Foil Rotator, Pro Bezier Pen Tool & Print/Merch Studio */
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
function hexRgb(h){return [parseInt(h.slice(1,3),16)/255,parseInt(h.slice(3,5),16)/255,parseInt(h.slice(5,7),16)/255]}

/* ========== 0. Patch Notes Modal & Next-Gen Studio Launcher ========== */
$('patch-notes-open')?.addEventListener('click',()=>$('patch-notes-dialog')?.showModal());
$('patch-notes-close')?.addEventListener('click',()=>$('patch-notes-dialog')?.close());
$('patch-notes-dialog')?.addEventListener('click',e=>{if(e.target===$('patch-notes-dialog'))$('patch-notes-dialog').close()});

const ngDlg=$('nextgen-dialog');
function openNextGen(tab='relight'){
 if(!ngDlg)return;
 if(!ngDlg.open)ngDlg.showModal();
 const b=document.querySelector(`#ng-tabs [data-ngt="${tab}"]`);
 if(b)b.click();
}
window.openTotoneNextGen=openNextGen;
$('ng-close')?.addEventListener('click',()=>ngDlg?.close());
ngDlg?.addEventListener('click',e=>{if(e.target===ngDlg)ngDlg.close()});
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-ng]');
 if(b)openNextGen(b.dataset.ng);
});
$('ng-tabs')?.addEventListener('click',e=>{
 const b=e.target.closest('[data-ngt]');if(!b)return;
 const k=b.dataset.ngt;
 document.querySelectorAll('#ng-tabs button').forEach(x=>x.classList.toggle('on',x===b));
 document.querySelectorAll('.ng-pane').forEach(p=>p.hidden=p.id!=='ng-'+k);
 if(k==='relight')initRelight();
 else if(k==='transfer')initColorTransfer();
 else if(k==='lens')renderLensPreview();
 else if(k==='card3d')renderCard3DPreview();
 else if(k==='pen')initPenTool();
 else if(k==='print')renderPrintPreview();
});

/* ========== 1. 3D Photo Relighting (Real Surface-Normal Lambert + Specular Studio Lights) ========== */
const rlCv=$('rl-canvas');
let rlSrc=null,rlLum=null,rlW=0,rlH=0,rlLights=[{x:0.25,y:0.28},{x:0.78,y:0.65}],rlDrag=-1;

function initRelight(){
 if(!base||!rlCv)return;
 const snap=captureCanvas(640);
 rlW=snap.width;rlH=snap.height;rlCv.width=rlW;rlCv.height=rlH;
 rlSrc=snap.getContext('2d',{willReadFrequently:true}).getImageData(0,0,rlW,rlH);
 rlLum=new Float32Array(rlW*rlH);
 const d=rlSrc.data;
 for(let i=0;i<rlLum.length;i++)rlLum[i]=(0.299*d[i*4]+0.587*d[i*4+1]+0.114*d[i*4+2])/255;
 renderRelightCanvas(rlCv,rlSrc,rlLum,true);
}

function renderRelightCanvas(targetCv,srcIm,lumArr,drawHandles){
 const w=srcIm.width,h=srcIm.height,g=targetCv.getContext('2d');
 const out=g.createImageData(w,h),sd=srcIm.data,dd=out.data;
 const c1=hexRgb($('rl-c1').value),p1=(+$('rl-p1').value)/100;
 const c2=hexRgb($('rl-c2').value),p2=(+$('rl-p2').value)/100;
 const amb=(+$('rl-amb').value)/100,relief=(+$('rl-rel').value)/8;
 const l1x=rlLights[0].x*w,l1y=rlLights[0].y*h,l2x=rlLights[1].x*w,l2y=rlLights[1].y*h;
 const lz=Math.max(w,h)*0.45,falloff=Math.max(w,h)*0.85;

 for(let y=0;y<h;y++){
  const ym=Math.max(0,y-1),yp=Math.min(h-1,y+1);
  for(let x=0;x<w;x++){
   const xm=Math.max(0,x-1),xp=Math.min(w-1,x+1);
   const gx=(lumArr[y*w+xp]-lumArr[y*w+xm])*relief;
   const gy=(lumArr[yp*w+x]-lumArr[ym*w+x])*relief;
   const invLen=1/Math.hypot(-gx,-gy,1);
   const nx=-gx*invLen,ny=-gy*invLen,nz=invLen;

   // Light 1
   const d1x=l1x-x,d1y=l1y-y,dist1=Math.hypot(d1x,d1y,lz);
   const att1=Math.max(0,1-Math.hypot(d1x,d1y)/falloff);
   const dot1=Math.max(0,(nx*d1x+ny*d1y+nz*lz)/dist1);
   const spec1=Math.pow(dot1,14)*0.35;
   const f1=(dot1+spec1)*att1*p1;

   // Light 2
   const d2x=l2x-x,d2y=l2y-y,dist2=Math.hypot(d2x,d2y,lz);
   const att2=Math.max(0,1-Math.hypot(d2x,d2y)/falloff);
   const dot2=Math.max(0,(nx*d2x+ny*d2y+nz*lz)/dist2);
   const spec2=Math.pow(dot2,14)*0.35;
   const f2=(dot2+spec2)*att2*p2;

   const o=(y*w+x)*4;
   dd[o]=clamp(sd[o]*(amb+c1[0]*f1+c2[0]*f2)+spec1*c1[0]*90*att1*p1+spec2*c2[0]*90*att2*p2,0,255);
   dd[o+1]=clamp(sd[o+1]*(amb+c1[1]*f1+c2[1]*f2)+spec1*c1[1]*90*att1*p1+spec2*c2[1]*90*att2*p2,0,255);
   dd[o+2]=clamp(sd[o+2]*(amb+c1[2]*f1+c2[2]*f2)+spec1*c1[2]*90*att1*p1+spec2*c2[2]*90*att2*p2,0,255);
   dd[o+3]=sd[o+3];
  }
 }
 g.putImageData(out,0,0);
 if(drawHandles){
  [[rlLights[0],$('rl-c1').value,'1'],[rlLights[1],$('rl-c2').value,'2']].forEach(([pt,col,lbl])=>{
   const px=pt.x*w,py=pt.y*h;
   g.save();g.shadowColor=col;g.shadowBlur=16;g.fillStyle=col;
   g.beginPath();g.arc(px,py,11,0,Math.PI*2);g.fill();
   g.strokeStyle='#ffffff';g.lineWidth=2.5;g.stroke();
   g.fillStyle='#050c1f';g.font='800 11px Archivo,sans-serif';g.textAlign='center';g.textBaseline='middle';
   g.fillText(lbl,px,py+1);g.restore();
  });
 }
}
['rl-c1','rl-p1','rl-c2','rl-p2','rl-amb','rl-rel'].forEach(id=>{
 $(id)?.addEventListener('input',e=>{
  if(e.target.type==='range')e.target.nextElementSibling.value=e.target.value+(id==='rl-rel'?'':'%');
  if(rlSrc)renderRelightCanvas(rlCv,rlSrc,rlLum,true);
 });
});
rlCv?.addEventListener('pointerdown',e=>{
 if(!rlSrc)return;
 const r=rlCv.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
 rlDrag=rlLights.findIndex(pt=>Math.hypot(pt.x-x,pt.y-y)<0.09);
 if(rlDrag>=0)rlCv.setPointerCapture(e.pointerId);
});
rlCv?.addEventListener('pointermove',e=>{
 if(rlDrag<0||!rlSrc)return;
 const r=rlCv.getBoundingClientRect();
 rlLights[rlDrag]={x:clamp((e.clientX-r.left)/r.width,0,1),y:clamp((e.clientY-r.top)/r.height,0,1)};
 renderRelightCanvas(rlCv,rlSrc,rlLum,true);
});
rlCv?.addEventListener('pointerup',()=>{rlDrag=-1});
$('rl-reset')?.addEventListener('click',()=>{rlLights=[{x:0.25,y:0.28},{x:0.78,y:0.65}];if(rlSrc)renderRelightCanvas(rlCv,rlSrc,rlLum,true)});
$('rl-apply')?.addEventListener('click',()=>{
 if(!base)return;
 const full=captureCanvas(0),im=full.getContext('2d',{willReadFrequently:true}).getImageData(0,0,W,H);
 const lum=new Float32Array(W*H),d=im.data;
 for(let i=0;i<lum.length;i++)lum[i]=(0.299*d[i*4]+0.587*d[i*4+1]+0.114*d[i*4+2])/255;
 const out=bc(W,H);renderRelightCanvas(out,im,lum,false);
 addLayerCanvas(out,'3D Studio Relighting');ngDlg.close();showToast('Applied 3D Relighting layer!',1500);
});

/* ========== 2. Movie-Grade Color Transfer (Reinhard et al. l-alpha-beta Statistical Transfer) ========== */
let ctRefStats=null,ctSrcCv=null;
function rgbToLabStat(r,g,b){
 r=Math.max(1/255,r/255);g=Math.max(1/255,g/255);b=Math.max(1/255,b/255);
 const L=Math.log10(0.3811*r+0.5783*g+0.0402*b);
 const M=Math.log10(0.1967*r+0.7244*g+0.0782*b);
 const S=Math.log10(0.0241*r+0.1288*g+0.8444*b);
 return [(L+M+S)*0.57735,(L+M-2*S)*0.40825,(L-M)*0.70711];
}
function labStatToRgb(l,a,b){
 const L=Math.pow(10,l*0.57735+a*0.40825+b*0.70711);
 const M=Math.pow(10,l*0.57735+a*0.40825-b*0.70711);
 const S=Math.pow(10,l*0.57735-a*0.81650);
 return [clamp((4.4679*L-3.5873*M+0.1193*S)*255,0,255),clamp((-1.2186*L+2.3809*M-0.1624*S)*255,0,255),clamp((0.0497*L-0.2439*M+1.2045*S)*255,0,255)];
}
function computeLabStats(im){
 const d=im.data,n=d.length/4;let ml=0,ma=0,mb=0,cnt=0;
 for(let i=0;i<d.length;i+=16){if(d[i+3]<64)continue;const [l,a,b]=rgbToLabStat(d[i],d[i+1],d[i+2]);ml+=l;ma+=a;mb+=b;cnt++}
 cnt=Math.max(1,cnt);ml/=cnt;ma/=cnt;mb/=cnt;
 let sl=0,sa=0,sb=0;
 for(let i=0;i<d.length;i+=16){if(d[i+3]<64)continue;const [l,a,b]=rgbToLabStat(d[i],d[i+1],d[i+2]);sl+=(l-ml)**2;sa+=(a-ma)**2;sb+=(b-mb)**2}
 return {m:[ml,ma,mb],s:[Math.sqrt(sl/cnt)||0.01,Math.sqrt(sa/cnt)||0.01,Math.sqrt(sb/cnt)||0.01]};
}
function applyReinhardToCanvas(srcCv,refStats,mix,keepL){
 const w=srcCv.width,h=srcCv.height,out=bc(w,h),g=out.getContext('2d',{willReadFrequently:true});
 g.drawImage(srcCv,0,0);
 const im=g.getImageData(0,0,w,h),st=computeLabStats(im),d=im.data;
 const rl=clamp(refStats.s[0]/st.s[0],0.45,2.2),ra=clamp(refStats.s[1]/st.s[1],0.45,2.2),rb=clamp(refStats.s[2]/st.s[2],0.45,2.2);
 for(let i=0;i<d.length;i+=4){
  if(d[i+3]<8)continue;
  const [l,a,b]=rgbToLabStat(d[i],d[i+1],d[i+2]);
  const nl=keepL?l:(l-st.m[0])*rl+refStats.m[0];
  const na=(a-st.m[1])*ra+refStats.m[1];
  const nb=(b-st.m[2])*rb+refStats.m[2];
  const [nr,ng,nb2]=labStatToRgb(nl,na,nb);
  d[i]=d[i]+(nr-d[i])*mix;d[i+1]=d[i+1]+(ng-d[i+1])*mix;d[i+2]=d[i+2]+(nb2-d[i+2])*mix;
 }
 g.putImageData(im,0,0);
 return out;
}
function initColorTransfer(){
 if(!base)return;
 ctSrcCv=captureCanvas(680);
 const pv=$('ct-canvas');pv.width=ctSrcCv.width;pv.height=ctSrcCv.height;
 if(ctRefStats)renderColorTransferPreview();
 else pv.getContext('2d').drawImage(ctSrcCv,0,0);
}
function renderColorTransferPreview(){
 if(!ctSrcCv||!ctRefStats)return;
 const res=applyReinhardToCanvas(ctSrcCv,ctRefStats,(+$('ct-mix').value)/100,$('ct-keep-l').checked);
 const pv=$('ct-canvas');pv.width=res.width;pv.height=res.height;pv.getContext('2d').drawImage(res,0,0);
}
$('ct-pick')?.addEventListener('click',()=>$('ct-file')?.click());
$('ct-file')?.addEventListener('change',e=>{
 const f=e.target.files?.[0];e.target.value='';if(!f)return;
 const im=new Image(),u=URL.createObjectURL(f);
 im.onload=()=>{
  URL.revokeObjectURL(u);
  const rc=bc(200,Math.max(1,Math.round(200*im.naturalHeight/im.naturalWidth)));
  rc.getContext('2d').drawImage(im,0,0,rc.width,rc.height);
  ctRefStats=computeLabStats(rc.getContext('2d').getImageData(0,0,rc.width,rc.height));
  $('ct-name').textContent=f.name;$('ct-apply').disabled=false;
  renderColorTransferPreview();showToast('Transferred movie color palette!',1400);
 };
 im.src=u;
});
$('ct-mix')?.addEventListener('input',e=>{e.target.nextElementSibling.value=e.target.value+'%';renderColorTransferPreview()});
$('ct-keep-l')?.addEventListener('change',renderColorTransferPreview);
$('ct-apply')?.addEventListener('click',()=>{
 if(!base||!ctRefStats)return;
 const full=captureCanvas(0);
 const out=applyReinhardToCanvas(full,ctRefStats,(+$('ct-mix').value)/100,$('ct-keep-l').checked);
 addLayerCanvas(out,'Movie Color Transfer');ngDlg.close();showToast('Applied Color Transfer layer!',1500);
});

/* ========== 3. Optical Camera Lens Lab (Tilt-Shift, 800T Halation, Zoom Blur, Fisheye, Fluted Glass) ========== */
let lnMode='tilt';
function renderLensTo(srcCv,outCv){
 const w=srcCv.width,h=srcCv.height;outCv.width=w;outCv.height=h;
 const g=outCv.getContext('2d',{willReadFrequently:true});
 const str=(+$('ln-str').value)/100,pos=(+$('ln-pos').value)/100;
 if(lnMode==='tilt'){
  const bl=bc(w,h),bg=bl.getContext('2d');
  bg.filter=`blur(${Math.max(2,Math.round(str*22*(w/720||1)))}px)`;bg.drawImage(srcCv,0,0);
  g.drawImage(bl,0,0);
  // Soft focus band mask
  const band=bc(w,h),mg=band.getContext('2d');
  mg.drawImage(srcCv,0,0);mg.globalCompositeOperation='destination-in';
  const fy=pos*h,half=h*0.24,gr=mg.createLinearGradient(0,fy-half,0,fy+half);
  gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(0.35,'rgba(0,0,0,1)');gr.addColorStop(0.65,'rgba(0,0,0,1)');gr.addColorStop(1,'rgba(0,0,0,0)');
  mg.fillStyle=gr;mg.fillRect(0,0,w,h);
  g.drawImage(band,0,0);
 }else if(lnMode==='halation'){
  g.drawImage(srcCv,0,0);
  const hi=bc(w,h),hg=hi.getContext('2d',{willReadFrequently:true});
  hg.drawImage(srcCv,0,0);
  const im=hg.getImageData(0,0,w,h),d=im.data,thr=255-(pos*120+40);
  for(let i=0;i<d.length;i+=4){
   const l=0.299*d[i]+0.587*d[i+1]+0.114*d[i+2];
   if(l>thr){const e=(l-thr)/(255-thr);d[i]=255;d[i+1]=Math.round(68*e);d[i+2]=Math.round(18*e);d[i+3]=Math.round(e*255)}
   else d[i+3]=0;
  }
  hg.putImageData(im,0,0);
  g.save();g.globalCompositeOperation='screen';g.globalAlpha=str*0.95;
  g.filter=`blur(${Math.max(4,Math.round((8+str*26)*(w/720||1)))}px)`;
  g.drawImage(hi,0,0);g.restore();
 }else if(lnMode==='zoom'){
  g.drawImage(srcCv,0,0);
  const steps=12,cx=w*pos,cy=h*0.5;
  g.save();g.globalAlpha=0.14;
  for(let s=1;s<=steps;s++){
   const z=1+(s/steps)*str*0.22;
   g.drawImage(srcCv,cx-cx*z,cy-cy*z,w*z,h*z);
  }
  g.restore();
 }else if(lnMode==='fisheye'||lnMode==='glass'){
  const sd=srcCv.getContext('2d',{willReadFrequently:true}).getImageData(0,0,w,h).data;
  const outIm=g.createImageData(w,h),dd=outIm.data;
  if(lnMode==='fisheye'){
   const k=(str-0.35)*1.4,cx=w/2,cy=h/2,mr=Math.hypot(cx,cy);
   for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const dx=(x-cx)/mr,dy=(y-cy)/mr,r2=dx*dx+dy*dy,f=1+k*r2;
    const sx=clamp(Math.round(cx+dx*f*mr),0,w-1),sy=clamp(Math.round(cy+dy*f*mr),0,h-1);
    const si=(sy*w+sx)*4,oi=(y*w+x)*4;
    dd[oi]=sd[si];dd[oi+1]=sd[si+1];dd[oi+2]=sd[si+2];dd[oi+3]=sd[si+3];
   }
  }else{
   const ribs=Math.max(8,Math.round(12+pos*44)),amp=str*(w/ribs)*0.65;
   for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const wave=Math.sin((x/w)*ribs*Math.PI*2)*amp;
    const sxR=clamp(Math.round(x+wave*1.12),0,w-1),sxG=clamp(Math.round(x+wave),0,w-1),sxB=clamp(Math.round(x+wave*0.88),0,w-1);
    const oi=(y*w+x)*4;
    dd[oi]=sd[(y*w+sxR)*4];dd[oi+1]=sd[(y*w+sxG)*4+1];dd[oi+2]=sd[(y*w+sxB)*4+2];dd[oi+3]=255;
   }
  }
  g.putImageData(outIm,0,0);
 }
}
function renderLensPreview(){if(!base)return;const s=captureCanvas(680);renderLensTo(s,$('ln-canvas'))}
$('ln-modes')?.addEventListener('click',e=>{
 const b=e.target.closest('[data-lm]');if(!b)return;
 lnMode=b.dataset.lm;
 document.querySelectorAll('#ln-modes button').forEach(x=>x.classList.toggle('on',x===b));
 renderLensPreview();
});
['ln-str','ln-pos'].forEach(id=>$(id)?.addEventListener('input',e=>{e.target.nextElementSibling.value=e.target.value+'%';renderLensPreview()}));
$('ln-apply')?.addEventListener('click',()=>{
 if(!base)return;
 const full=captureCanvas(0),out=bc(W,H);renderLensTo(full,out);
 addLayerCanvas(out,'Optical · '+lnMode);ngDlg.close();showToast('Applied Optical Lens FX!',1500);
});

/* ========== 4. Interactive 3D Card / Poster / Foil Rotator ========== */
const c3Cv=$('c3-canvas');
let c3Drag=null;
function renderCard3DTo(outCv,maxW=0){
 if(!base)return;
 const src=captureCanvas(maxW),sw=src.width,sh=src.height;
 const rx=(+$('c3-rx').value)*Math.PI/180,ry=(+$('c3-ry').value)*Math.PI/180;
 const holo=(+$('c3-holo').value)/100,rad=+$('c3-rad').value*(sw/700||1);
 const ow=Math.round(sw*1.32),oh=Math.round(sh*1.32);
 outCv.width=ow;outCv.height=oh;
 const g=outCv.getContext('2d');
 g.clearRect(0,0,ow,oh);
 // Projective 2.5D card transform via horizontal/vertical slice foreshortening
 const cx=ow/2,cy=oh/2,cosY=Math.cos(ry),sinY=Math.sin(ry),cosX=Math.cos(rx),sinX=Math.sin(rx);
 // Rounded card source
 const card=bc(sw,sh),cg=card.getContext('2d');
 cg.beginPath();cg.roundRect(0,0,sw,sh,rad);cg.clip();cg.drawImage(src,0,0);
 if(holo>0){
  const hg=cg.createLinearGradient(0,0,sw,sh);
  const shift=(ry/(Math.PI/2))*0.35;
  hg.addColorStop(clamp(0.1+shift,0,1),'rgba(56,189,248,0)');
  hg.addColorStop(clamp(0.35+shift,0,1),`rgba(56,189,248,${holo*0.42})`);
  hg.addColorStop(clamp(0.5+shift,0,1),`rgba(255,255,255,${holo*0.58})`);
  hg.addColorStop(clamp(0.65+shift,0,1),`rgba(236,72,153,${holo*0.42})`);
  hg.addColorStop(clamp(0.9+shift,0,1),'rgba(168,85,247,0)');
  cg.globalCompositeOperation='screen';cg.fillStyle=hg;cg.fillRect(0,0,sw,sh);
  cg.globalCompositeOperation='source-over';
 }
 // Soft 3D ambient shadow
 g.save();
 g.translate(cx-sinY*34,cy+sh*0.08-sinX*26);
 g.scale(Math.max(0.25,cosY),Math.max(0.25,cosX));
 g.shadowColor='rgba(0,0,0,0.62)';g.shadowBlur=42;g.fillStyle='rgba(0,0,0,0.45)';
 g.beginPath();g.roundRect(-sw/2,-sh/2,sw,sh,rad);g.fill();
 g.restore();

 // Render foreshortened slices for crisp perspective trapezoid!
 const slices=Math.min(180,Math.max(64,Math.round(sw/4)));
 for(let i=0;i<slices;i++){
  const u0=i/slices-0.5,u1=(i+1)/slices-0.5;
  const x0=u0*sw*cosY,x1=u1*sw*cosY;
  const z=u0*sw*sinY,persp=1/(1-z/(Math.max(sw,sh)*2.4));
  const hScale=persp*Math.max(0.35,cosX);
  const skewY=sinX*u0*sw*0.32;
  g.drawImage(card,i*(sw/slices),0,Math.ceil(sw/slices)+1,sh,cx+x0*persp,cy-(sh*hScale)/2+skewY,Math.max(1,(x1-x0)*persp+1),sh*hScale);
 }
}
function renderCard3DPreview(){if(c3Cv)renderCard3DTo(c3Cv,600)}
['c3-rx','c3-ry','c3-holo','c3-rad'].forEach(id=>$(id)?.addEventListener('input',e=>{
 const suf=id==='c3-holo'?'%':id==='c3-rad'?' px':'°';
 e.target.nextElementSibling.value=e.target.value+suf;renderCard3DPreview();
}));
c3Cv?.addEventListener('pointerdown',e=>{c3Drag={x:e.clientX,y:e.clientY,rx:+$('c3-rx').value,ry:+$('c3-ry').value};c3Cv.setPointerCapture(e.pointerId)});
c3Cv?.addEventListener('pointermove',e=>{
 if(!c3Drag)return;
 $('c3-ry').value=Math.round(clamp(c3Drag.ry+(e.clientX-c3Drag.x)*0.3,-48,48));
 $('c3-rx').value=Math.round(clamp(c3Drag.rx-(e.clientY-c3Drag.y)*0.3,-42,42));
 $('c3-ry').nextElementSibling.value=$('c3-ry').value+'°';
 $('c3-rx').nextElementSibling.value=$('c3-rx').value+'°';
 renderCard3DPreview();
});
c3Cv?.addEventListener('pointerup',()=>{c3Drag=null});
$('c3-reset')?.addEventListener('click',()=>{$('c3-rx').value=-12;$('c3-ry').value=18;$('c3-holo').value=35;renderCard3DPreview()});
$('c3-apply')?.addEventListener('click',()=>{
 const out=bc(10,10);renderCard3DTo(out,0);addLayerCanvas(out,'3D Card Tilt');ngDlg.close();showToast('Added 3D Card layer!',1400);
});
$('c3-dl')?.addEventListener('click',()=>{
 const out=bc(10,10);renderCard3DTo(out,0);
 const a=document.createElement('a');a.href=out.toDataURL('image/png');a.download='totone-3d-card.png';a.click();
});

/* ========== 5. Pro Bezier Pen Tool ========== */
const penCv=$('pen-canvas');
let penBase=null,penPts=[],penDrag=false;
function initPenTool(){
 if(!base||!penCv)return;
 penBase=captureCanvas(860);penCv.width=penBase.width;penCv.height=penBase.height;
 penPts=[];drawPenPreview();
}
function traceBezierPath(g,pts,sc,close=true){
 if(pts.length<2)return;
 g.beginPath();g.moveTo(pts[0].x*sc,pts[0].y*sc);
 for(let i=1;i<pts.length;i++){
  const p0=pts[i-1],p1=pts[i];
  const cp1x=(p0.x+p0.hx)*sc,cp1y=(p0.y+p0.hy)*sc,cp2x=(p1.x-p1.hx)*sc,cp2y=(p1.y-p1.hy)*sc;
  g.bezierCurveTo(cp1x,cp1y,cp2x,cp2y,p1.x*sc,p1.y*sc);
 }
 if(close&&pts.length>2){
  const p0=pts[pts.length-1],p1=pts[0];
  g.bezierCurveTo((p0.x+p0.hx)*sc,(p0.y+p0.hy)*sc,(p1.x-p1.hx)*sc,(p1.y-p1.hy)*sc,p1.x*sc,p1.y*sc);
  g.closePath();
 }
}
function drawPenPreview(){
 if(!penBase||!penCv)return;
 const g=penCv.getContext('2d');g.clearRect(0,0,penCv.width,penCv.height);g.drawImage(penBase,0,0);
 if(penPts.length){
  g.save();g.strokeStyle='#38bdf8';g.lineWidth=2.5;
  traceBezierPath(g,penPts,1,$('pen-out').value!=='stroke');g.stroke();
  penPts.forEach(p=>{
   if(p.hx||p.hy){
    g.strokeStyle='rgba(255,255,255,0.6)';g.lineWidth=1;
    g.beginPath();g.moveTo(p.x-p.hx,p.y-p.hy);g.lineTo(p.x+p.hx,p.y+p.hy);g.stroke();
    g.fillStyle='#f43f5e';g.beginPath();g.arc(p.x+p.hx,p.y+p.hy,4,0,Math.PI*2);g.fill();
   }
   g.fillStyle='#ffffff';g.strokeStyle='#050c1f';g.lineWidth=2;
   g.beginPath();g.arc(p.x,p.y,5.5,0,Math.PI*2);g.fill();g.stroke();
  });
  g.restore();
 }
}
$('pen-w')?.addEventListener('input',e=>{e.target.nextElementSibling.value=e.target.value+' px'});
penCv?.addEventListener('pointerdown',e=>{
 if(!penBase)return;
 const r=penCv.getBoundingClientRect();
 const x=(e.clientX-r.left)*penBase.width/r.width,y=(e.clientY-r.top)*penBase.height/r.height;
 penPts.push({x,y,hx:0,hy:0});penDrag=true;penCv.setPointerCapture(e.pointerId);drawPenPreview();
});
penCv?.addEventListener('pointermove',e=>{
 if(!penDrag||!penPts.length)return;
 const r=penCv.getBoundingClientRect(),p=penPts[penPts.length-1];
 p.hx=(e.clientX-r.left)*penBase.width/r.width-p.x;
 p.hy=(e.clientY-r.top)*penBase.height/r.height-p.y;
 drawPenPreview();
});
penCv?.addEventListener('pointerup',()=>{penDrag=false});
$('pen-undo')?.addEventListener('click',()=>{penPts.pop();drawPenPreview()});
$('pen-clear')?.addEventListener('click',()=>{penPts=[];drawPenPreview()});
$('pen-apply')?.addEventListener('click',()=>{
 if(!base||penPts.length<2){showToast('Place at least 2 points first',1400);return}
 const mode=$('pen-out').value,sc=W/penBase.width,out=bc(W,H),g=out.getContext('2d');
 if(mode==='cutout'){
  const full=captureCanvas(0);
  g.save();traceBezierPath(g,penPts,sc,true);g.clip();g.drawImage(full,0,0);g.restore();
  addLayerCanvas(out,'Bezier Vector Cutout');
 }else if(mode==='fill'){
  g.fillStyle=$('pen-col').value;traceBezierPath(g,penPts,sc,true);g.fill();
  addLayerCanvas(out,'Bezier Vector Shape');
 }else{
  g.strokeStyle=$('pen-col').value;g.lineWidth=(+$('pen-w').value)*sc;g.lineCap='round';g.lineJoin='round';
  traceBezierPath(g,penPts,sc,false);g.stroke();
  addLayerCanvas(out,'Bezier Vector Path');
 }
 ngDlg.close();showToast('Applied Bezier Pen layer!',1500);
});

/* ========== 6. Print & Merch Studio (CMYK Soft-Proof, Sticker Sheet Packager & 300 DPI Crop-Mark PDF) ========== */
function buildStickerSheet(cols,rows,outW=1200,outH=1600){
 const src=(active&&active.cv)?active.cv:captureCanvas(0);
 const out=bc(outW,outH),g=out.getContext('2d');
 g.fillStyle='#f8fafc';g.fillRect(0,0,outW,outH);
 const pad=Math.round(outW*0.045),cw=(outW-pad*2)/cols,ch=(outH-pad*2)/rows;
 for(let r=0;r<rows;r++)for(let col=0;col<cols;col++){
  const sc=Math.min((cw*0.84)/src.width,(ch*0.84)/src.height);
  const dw=src.width*sc,dh=src.height*sc;
  const x=pad+col*cw+(cw-dw)/2,y=pad+r*ch+(ch-dh)/2;
  g.save();g.shadowColor='rgba(15,23,42,0.22)';g.shadowBlur=10;g.shadowOffsetY=4;
  g.drawImage(src,x,y,dw,dh);g.restore();
 }
 return out;
}
function renderPrintPreview(){
 if(!base)return;
 const mode=$('pr-mode').value,pv=$('pr-canvas');
 if(mode==='sheet'){
  const [cols,rows]=$('pr-grid').value.split('x').map(Number);
  const sh=buildStickerSheet(cols,rows,600,800);
  pv.width=sh.width;pv.height=sh.height;pv.getContext('2d').drawImage(sh,0,0);
  return;
 }
 const snap=captureCanvas(680),g=snap.getContext('2d',{willReadFrequently:true});
 const im=g.getImageData(0,0,snap.width,snap.height),d=im.data;
 for(let i=0;i<d.length;i+=4){
  const r=d[i]/255,gr=d[i+1]/255,b=d[i+2]/255;
  const maxC=Math.max(r,gr,b),minC=Math.min(r,gr,b),sat=maxC?(maxC-minC)/maxC:0;
  const outOfGamut=sat>0.78&&maxC>0.68&&(gr>0.65||b>0.75);
  if(mode==='gamut'&&outOfGamut){d[i]=255;d[i+1]=0;d[i+2]=220}
  else{
   // Realistic CMYK paper ink gamut compression (slightly softer highlights & muted neons)
   const k=1-maxC,c0=(1-r-k)/(1-k||1),m0=(1-gr-k)/(1-k||1),y0=(1-b-k)/(1-k||1);
   d[i]=clamp((1-c0*0.86)*(1-k*0.92)*248+6,0,255);
   d[i+1]=clamp((1-m0*0.88)*(1-k*0.92)*246+6,0,255);
   d[i+2]=clamp((1-y0*0.84)*(1-k*0.92)*242+8,0,255);
  }
 }
 g.putImageData(im,0,0);
 pv.width=snap.width;pv.height=snap.height;pv.getContext('2d').drawImage(snap,0,0);
}
$('pr-mode')?.addEventListener('change',renderPrintPreview);
$('pr-grid')?.addEventListener('change',renderPrintPreview);
$('pr-sheet-apply')?.addEventListener('click',async()=>{
 if(!base)return;
 const [cols,rows]=$('pr-grid').value.split('x').map(Number);
 const sh=buildStickerSheet(cols,rows,1800,2400);
 await load(new File([await toBlob(sh,'image/png')],`Sticker-Sheet-${cols}x${rows}.png`,{type:'image/png'}));
 ngDlg.close();showToast('Opened printable Sticker Sheet on new page!',1600);
});
$('pr-pdf')?.addEventListener('click',async()=>{
 if(!base)return;
 try{
  showToast('Generating 300 DPI Print PDF with crop marks…',1600);
  await loadScriptOnce('https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js',()=>!!window.jspdf?.jsPDF);
  const {jsPDF}=window.jspdf;
  const inW=Math.max(1,+$('pr-inw').value||8),bleed=Math.max(0,+$('pr-bleed').value||3);
  const artW=inW*25.4,artH=artW*(H/W),mark=10;
  const pageW=artW+bleed*2+mark*2,pageH=artH+bleed*2+mark*2;
  const doc=new jsPDF({orientation:pageW>=pageH?'landscape':'portrait',unit:'mm',format:[pageW,pageH]});
  const full=captureCanvas(0);
  doc.addImage(full.toDataURL('image/jpeg',0.97),'JPEG',mark,mark,artW+bleed*2,artH+bleed*2);
  // Crisp print-shop trim crop marks at all 4 corners
  doc.setDrawColor(20,20,20);doc.setLineWidth(0.25);
  const tx0=mark+bleed,ty0=mark+bleed,tx1=tx0+artW,ty1=ty0+artH,len=6;
  [[tx0,ty0,-1,-1],[tx1,ty0,1,-1],[tx0,ty1,-1,1],[tx1,ty1,1,1]].forEach(([x,y,dx,dy])=>{
   doc.line(x+dx*2,y,x+dx*(2+len),y);doc.line(x,y+dy*2,x,y+dy*(2+len));
  });
  doc.save(`totone-print-300dpi-${inW}in.pdf`);
  showToast('Exported 300 DPI Print PDF with crop marks!',1800);
 }catch(err){showToast('Print PDF error: '+err.message,2200)}
});

if(Array.isArray(window.toolCommands)){
 window.toolCommands.push(
  ['Patch Notes & Version History','dialog','open-patch-notes','patch notes changelog updates versions history'],
  ['3D Photo Relighting (Virtual Studio Lights)','dialog','ng-relight','3d relight studio lighting normal map key rim light'],
  ['Movie-Grade Color Transfer (Steal Any Color Grade)','dialog','ng-transfer','color transfer steal grade movie reference reinhard lab'],
  ['Optical Camera Lens Lab (Tilt-Shift / Halation / Fisheye / Glass)','dialog','ng-lens','tilt shift halation 800t zoom blur fisheye fluted glass lens'],
  ['Interactive 3D Card & Foil Rotator','dialog','ng-card3d','3d card tilt foil holographic poster rotator'],
  ['Pro Bezier Pen Tool (Vector Cutout & Shapes)','dialog','ng-pen','bezier pen vector path trace cutout curve'],
  ['Print & Merch Studio (Sticker Sheet / CMYK / 300 DPI PDF)','dialog','ng-print','print merch sticker sheet cmyk proof bleed crop marks dpi']
 );
}
const prevJumpNG=jumpTool;
jumpTool=function(tabName,id){
 if(tabName==='dialog'&&id==='open-patch-notes'){$('patch-notes-dialog')?.showModal();return}
 if(tabName==='dialog'&&id.startsWith('ng-')){openNextGen(id.slice(3));return}
 prevJumpNG(tabName,id);
};
})();
