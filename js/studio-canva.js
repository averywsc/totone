/* Totone Canva Design Studio — New Design, Magic Resize, Templates, 16 Editable Warped Shapes + Freeform 8-Point Mesh, 12 Photo Frames, Font Pairings, Brand Kit */
(function(){
const SIZE_PRESETS=[
 {name:'Instagram Post',w:1080,h:1080,tag:'1:1'},
 {name:'Story / TikTok',w:1080,h:1920,tag:'9:16'},
 {name:'YouTube Thumb',w:1280,h:720,tag:'16:9'},
 {name:'Poster / Portrait',w:1080,h:1350,tag:'4:5'},
 {name:'Album Cover',w:1400,h:1400,tag:'1:1'},
 {name:'X / Web Banner',w:1500,h:500,tag:'3:1'},
 {name:'Presentation',w:1920,h:1080,tag:'16:9'},
 {name:'A4 Flyer',w:1240,h:1754,tag:'A4'},
 {name:'Square Avatar',w:800,h:800,tag:'1:1'}
];

function paintBgCanvas(w,h,mode,c1,c2){
 const cv=bc(w,h),g=cv.getContext('2d');
 if(mode==='solid'){g.fillStyle=c1;g.fillRect(0,0,w,h)}
 else if(mode==='gradient'){
  const gr=g.createLinearGradient(0,0,w,h);
  gr.addColorStop(0,c1);gr.addColorStop(1,c2);
  g.fillStyle=gr;g.fillRect(0,0,w,h);
 }
 return cv;
}

async function createDesignCanvas(w,h,bgMode='solid',c1='#0a1228',c2='#2a1144',title='Design'){
 w=Math.max(64,Math.min(4096,Math.round(w)));
 h=Math.max(64,Math.min(4096,Math.round(h)));
 const cv=paintBgCanvas(w,h,bgMode,c1,c2);
 const blob=await toBlob(cv,'image/png');
 const file=new File([blob],title+'.png',{type:'image/png'});
 await load(file);
 $('bg-fill-mode').value=bgMode;$('bg-c1').value=c1;$('bg-c2').value=c2;
 showToast(`Created ${w} × ${h} px canvas`,1600);
}

function magicResizeCanvas(nw,nh,bgMode,c1,c2){
 if(!base)return;
 nw=Math.max(64,Math.min(4096,Math.round(nw)));
 nh=Math.max(64,Math.min(4096,Math.round(nh)));
 pushU(documentUndo());
 const oldW=W,oldH=H;
 const bgCv=paintBgCanvas(nw,nh,bgMode,c1,c2),g=bgCv.getContext('2d');
 const srcCv=bc(oldW,oldH);srcCv.getContext('2d').putImageData(base,0,0);
 const cover=Math.max(nw/oldW,nh/oldH),dw=oldW*cover,dh=oldH*cover;
 g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
 g.drawImage(srcCv,(nw-dw)/2,(nh-dh)/2,dw,dh);
 const newIm=g.getImageData(0,0,nw,nh);
 const sx=nw/oldW,sy=nh/oldH,sc=Math.min(sx,sy);
 W=nw;H=nh;c.width=W;c.height=H;
 base=new ImageData(new Uint8ClampedArray(newIm.data),W,H);
 orig=new ImageData(new Uint8ClampedArray(newIm.data),W,H);
 for(const l of layers){l.x*=sx;l.y*=sy;l.s*=sc}
 sel=null;
 transformBank(new DOMMatrix().scale(sx,sy),W,H);
 film?.invalidate();extract();refreshLayers();updInfo();$('zoom').value='0';$('zoom').onchange();draw();
 showToast(`Magic Resized to ${W} × ${H} px`,1800);
}

function openNewCanvasDialog(){
 const grid=$('size-presets');
 if(!grid.children.length){
  for(const p of SIZE_PRESETS){
   const b=document.createElement('button');b.type='button';
   b.innerHTML=`<strong>${esc(p.name)}</strong><small>${p.w} × ${p.h} · ${p.tag}</small>`;
   b.onclick=()=>{
    $('nc-w').value=p.w;$('nc-h').value=p.h;
    grid.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));
   };
   grid.append(b);
  }
 }
 $('nc-resize').disabled=!base;
 $('new-canvas-dialog').showModal();
}
window.openNewCanvasDialog=openNewCanvasDialog;
$('new-canvas-open').onclick=openNewCanvasDialog;
$('empty-new').onclick=openNewCanvasDialog;
$('design-new-btn').onclick=openNewCanvasDialog;
$('design-elements-btn').onclick=()=>{if(typeof openElements==='function')openElements()};
$('nc-close').onclick=()=>$('new-canvas-dialog').close();
$('new-canvas-dialog').addEventListener('keydown',e=>e.stopPropagation());
$('nc-create').onclick=async()=>{
 const w=+$('nc-w').value||1080,h=+$('nc-h').value||1080;
 $('new-canvas-dialog').close();
 await createDesignCanvas(w,h,$('nc-bg').value,$('nc-c1').value,$('nc-c2').value,'Design');
 document.querySelector('.tabs [data-t="design"]')?.click();
};
$('nc-resize').onclick=()=>{
 const w=+$('nc-w').value||1080,h=+$('nc-h').value||1080;
 $('new-canvas-dialog').close();
 magicResizeCanvas(w,h,$('nc-bg').value,$('nc-c1').value,$('nc-c2').value);
};

$('bg-apply').onclick=()=>{
 if(!base){createDesignCanvas(1080,1080,$('bg-fill-mode').value,$('bg-c1').value,$('bg-c2').value,'Design');return}
 pushU(mkSnap('all'));
 const cv=paintBgCanvas(W,H,$('bg-fill-mode').value,$('bg-c1').value,$('bg-c2').value);
 const im=cv.getContext('2d').getImageData(0,0,W,H);
 base.data.set(im.data);orig.data.set(im.data);
 extract();draw();showToast('Updated canvas background',1400);
};

/* ---------- 16 Editable Canva Vector Shapes + Full Live Warping Engine ---------- */
const SHAPES=[
 {kind:'rect',name:'Rectangle',svg:'<rect x="4" y="6" width="20" height="16" rx="3" fill="currentColor"/>'},
 {kind:'pill',name:'Pill Badge',svg:'<rect x="3" y="8" width="22" height="12" rx="6" fill="currentColor"/>'},
 {kind:'circle',name:'Circle',svg:'<circle cx="14" cy="14" r="10" fill="currentColor"/>'},
 {kind:'triangle',name:'Triangle',svg:'<polygon points="14,4 24,23 4,23" fill="currentColor"/>'},
 {kind:'diamond',name:'Diamond',svg:'<polygon points="14,3 25,14 14,25 3,14" fill="currentColor"/>'},
 {kind:'star',name:'Star',svg:'<polygon points="14,3 17,10 25,11 19,16 21,24 14,20 7,24 9,16 3,11 11,10" fill="currentColor"/>'},
 {kind:'burst',name:'Sticker Burst',svg:'<polygon points="14,2 16.8,6.2 21.6,4.5 21.2,9.5 26,11.5 22.8,15.5 25,20 20,21 18.5,25.8 14,23.2 9.5,25.8 8,21 3,20 5.2,15.5 2,11.5 6.8,9.5 6.4,4.5 11.2,6.2" fill="currentColor"/>'},
 {kind:'polygon',name:'Polygon',svg:'<polygon points="14,3 23,8 23,20 14,25 5,20 5,8" fill="currentColor"/>'},
 {kind:'arrow',name:'Arrow',svg:'<path d="M3 11h13V6l9 8-9 8v-5H3z" fill="currentColor"/>'},
 {kind:'line',name:'Line',svg:'<rect x="3" y="12.5" width="22" height="3" rx="1.5" fill="currentColor"/>'},
 {kind:'heart',name:'Heart',svg:'<path d="M14 24S4 17.5 4 10.5A5.5 5.5 0 0 1 14 7a5.5 5.5 0 0 1 10 3.5C24 17.5 14 24 14 24z" fill="currentColor"/>'},
 {kind:'arch',name:'Arch',svg:'<path d="M5 24V13a9 9 0 0 1 18 0v11z" fill="currentColor"/>'},
 {kind:'bubble',name:'Speech',svg:'<path d="M4 6h20v13H12l-5 5v-5H4z" fill="currentColor"/>'},
 {kind:'blob',name:'Blob',svg:'<path d="M15 4c6 0 10 4 9 10s-4 10-10 10S3 19 4 13 9 4 15 4z" fill="currentColor"/>'},
 {kind:'bolt',name:'Lightning',svg:'<polygon points="16,2 6,15 13,15 11,26 22,12 15,12" fill="currentColor"/>'},
 {kind:'cross',name:'Plus / Cross',svg:'<path d="M11 4h6v7h7v6h-7v7h-6v-7H4v-6h7z" fill="currentColor"/>'}
];

const DEFAULT_MESH=()=>[[0,0],[0.5,0],[1,0],[1,0.5],[1,1],[0.5,1],[0,1],[0,0.5]];

function traceShapePath(g,kind,w,h,pad,radPct,pts){
 const x=pad,y=pad,bw=w-pad*2,bh=h-pad*2,cx=w/2,cy=h/2;
 g.beginPath();
 if(kind==='rect'||kind==='pill'){
  const r=kind==='pill'?bh/2:Math.min(bw,bh)*(radPct/100);
  g.roundRect(x,y,bw,bh,r);
 }else if(kind==='circle'){
  g.ellipse(cx,cy,bw/2,bh/2,0,0,Math.PI*2);
 }else if(kind==='triangle'){
  g.moveTo(cx,y);g.lineTo(x+bw,y+bh);g.lineTo(x,y+bh);g.closePath();
 }else if(kind==='diamond'){
  g.moveTo(cx,y);g.lineTo(x+bw,cy);g.lineTo(cx,y+bh);g.lineTo(x,cy);g.closePath();
 }else if(kind==='star'||kind==='burst'){
  const n=Math.max(3,Math.min(16,pts||(kind==='burst'?12:5))),ro=Math.min(bw,bh)/2,ri=ro*(kind==='burst'?0.76:0.44);
  for(let i=0;i<n*2;i++){
   const a=-Math.PI/2+i*Math.PI/n,rad=i%2?ri:ro;
   const px=cx+Math.cos(a)*rad,py=cy+Math.sin(a)*rad;
   if(!i)g.moveTo(px,py);else g.lineTo(px,py);
  }
  g.closePath();
 }else if(kind==='polygon'){
  const n=Math.max(3,Math.min(16,pts||6)),ro=Math.min(bw,bh)/2;
  for(let i=0;i<n;i++){
   const a=-Math.PI/2+i*Math.PI*2/n;
   const px=cx+Math.cos(a)*ro,py=cy+Math.sin(a)*ro;
   if(!i)g.moveTo(px,py);else g.lineTo(px,py);
  }
  g.closePath();
 }else if(kind==='arrow'){
  const mid=cy,th=bh*0.32,head=bw*0.34;
  g.moveTo(x,mid-th/2);g.lineTo(x+bw-head,mid-th/2);g.lineTo(x+bw-head,y);
  g.lineTo(x+bw,mid);g.lineTo(x+bw-head,y+bh);g.lineTo(x+bw-head,mid+th/2);
  g.lineTo(x,mid+th/2);g.closePath();
 }else if(kind==='line'){
  const lh=Math.max(12,bh*0.12);
  g.roundRect(x,cy-lh/2,bw,lh,lh/2);
 }else if(kind==='heart'){
  g.moveTo(cx,y+bh*0.92);
  g.bezierCurveTo(x-bw*0.05,y+bh*0.58,x,y+bh*0.14,cx,y+bh*0.32);
  g.bezierCurveTo(x+bw,y+bh*0.14,x+bw*1.05,y+bh*0.58,cx,y+bh*0.92);
  g.closePath();
 }else if(kind==='arch'){
  const r=bw/2;
  g.moveTo(x,y+bh);g.lineTo(x,y+r);g.arc(cx,y+r,r,Math.PI,0,false);g.lineTo(x+bw,y+bh);g.closePath();
 }else if(kind==='bubble'){
  const bodyH=bh*0.76,r=Math.min(bw,bodyH)*0.16;
  g.moveTo(x+r,y);g.lineTo(x+bw-r,y);g.quadraticCurveTo(x+bw,y,x+bw,y+r);
  g.lineTo(x+bw,y+bodyH-r);g.quadraticCurveTo(x+bw,y+bodyH,x+bw-r,y+bodyH);
  g.lineTo(x+bw*0.36,y+bodyH);g.lineTo(x+bw*0.16,y+bh);g.lineTo(x+bw*0.2,y+bodyH);
  g.lineTo(x+r,y+bodyH);g.quadraticCurveTo(x,y+bodyH,x,y+bodyH-r);
  g.lineTo(x,y+r);g.quadraticCurveTo(x,y,x+r,y);g.closePath();
 }else if(kind==='blob'){
  const rx=bw/2,ry=bh/2,n=8;
  const radii=[0.96,0.82,1.0,0.86,0.94,0.78,0.98,0.84];
  const pts2=radii.map((f,i)=>{const a=i*Math.PI*2/n;return [cx+Math.cos(a)*rx*f,cy+Math.sin(a)*ry*f]});
  for(let i=0;i<n;i++){
   const p0=pts2[i],p1=pts2[(i+1)%n],mid=[(p0[0]+p1[0])/2,(p0[1]+p1[1])/2];
   if(!i)g.moveTo((pts2[n-1][0]+p0[0])/2,(pts2[n-1][1]+p0[1])/2);
   g.quadraticCurveTo(p0[0],p0[1],mid[0],mid[1]);
  }
  g.closePath();
 }else if(kind==='bolt'){
  g.moveTo(x+bw*0.58,y);g.lineTo(x+bw*0.14,y+bh*0.54);g.lineTo(x+bw*0.46,y+bh*0.54);
  g.lineTo(x+bw*0.36,y+bh);g.lineTo(x+bw*0.86,y+bh*0.42);g.lineTo(x+bw*0.54,y+bh*0.42);g.closePath();
 }else if(kind==='cross'){
  const t=Math.min(bw,bh)*0.28;
  g.moveTo(cx-t/2,y);g.lineTo(cx+t/2,y);g.lineTo(cx+t/2,cy-t/2);g.lineTo(x+bw,cy-t/2);
  g.lineTo(x+bw,cy+t/2);g.lineTo(cx+t/2,cy+t/2);g.lineTo(cx+t/2,y+bh);g.lineTo(cx-t/2,y+bh);
  g.lineTo(cx-t/2,cy+t/2);g.lineTo(x,cy+t/2);g.lineTo(x,cy-t/2);g.lineTo(cx-t/2,cy-t/2);g.closePath();
 }else if(kind==='torn'){
  const steps=24;
  g.moveTo(x,y+bh*0.04);
  for(let i=0;i<=steps;i++){const px=x+bw*(i/steps),jag=((i*7)%5-2)*bh*0.012;g.lineTo(px,y+bh*0.03+jag)}
  for(let i=0;i<=steps;i++){const py=y+bh*(i/steps),jag=((i*11)%5-2)*bw*0.012;g.lineTo(x+bw*0.97+jag,py)}
  for(let i=steps;i>=0;i--){const px=x+bw*(i/steps),jag=((i*13)%5-2)*bh*0.012;g.lineTo(px,y+bh*0.97+jag)}
  for(let i=steps;i>=0;i--){const py=y+bh*(i/steps),jag=((i*17)%5-2)*bw*0.012;g.lineTo(x+bw*0.03+jag,py)}
  g.closePath();
 }
}

// Quadratic Coons patch evaluator for 8 perimeter handles: [TL, TM, TR, MR, BR, BM, BL, ML]
function evalCoons(mesh,u,v){
 const [p00,p50,p10,p15,p11,p51,p01,p05]=mesh;
 // Quadratic Bézier curves on all 4 edges (converting midpoint p50 to control point 2*p50 - 0.5*(p00+p10))
 const qCurve=(a,m,b,t)=>{
  const c=[2*m[0]-0.5*(a[0]+b[0]),2*m[1]-0.5*(a[1]+b[1])];
  const it=1-t;
  return [it*it*a[0]+2*it*t*c[0]+t*t*b[0],it*it*a[1]+2*it*t*c[1]+t*t*b[1]];
 };
 const top=qCurve(p00,p50,p10,u),bot=qCurve(p01,p51,p11,u);
 const lft=qCurve(p00,p05,p01,v),rgt=qCurve(p10,p15,p11,v);
 const iu=1-u,iv=1-v;
 const x=iv*top[0]+v*bot[0]+iu*lft[0]+u*rgt[0]-(iu*iv*p00[0]+u*iv*p10[0]+iu*v*p01[0]+u*v*p11[0]);
 const y=iv*top[1]+v*bot[1]+iu*lft[1]+u*rgt[1]-(iu*iv*p00[1]+u*iv*p10[1]+iu*v*p01[1]+u*v*p11[1]);
 return [x,y];
}

// Fast affine textured triangle blit onto Canvas 2D
function drawTexturedTri(g,img,sx0,sy0,sx1,sy1,sx2,sy2,dx0,dy0,dx1,dy1,dx2,dy2){
 const denom=(sx1-sx0)*(sy2-sy0)-(sx2-sx0)*(sy1-sy0);
 if(Math.abs(denom)<1e-4)return;
 const a=((dx1-dx0)*(sy2-sy0)-(dx2-dx0)*(sy1-sy0))/denom;
 const b=((dy1-dy0)*(sy2-sy0)-(dy2-dy0)*(sy1-sy0))/denom;
 const c=((sx1-sx0)*(dx2-dx0)-(sx2-sx0)*(dx1-dx0))/denom;
 const d=((sx1-sx0)*(dy2-dy0)-(sx2-sx0)*(dy1-dy0))/denom;
 const e=dx0-a*sx0-c*sy0,f=dy0-b*sx0-d*sy0;
 g.save();
 // Slightly expand triangle clip by ~0.35px to avoid subpixel seams
 const cx=(dx0+dx1+dx2)/3,cy=(dy0+dy1+dy2)/3;
 const exp=(x,y)=>{const vx=x-cx,vy=y-cy,l=Math.hypot(vx,vy)||1;return [x+vx/l*0.45,y+vy/l*0.45]};
 const [p0x,p0y]=exp(dx0,dy0),[p1x,p1y]=exp(dx1,dy1),[p2x,p2y]=exp(dx2,dy2);
 g.beginPath();g.moveTo(p0x,p0y);g.lineTo(p1x,p1y);g.lineTo(p2x,p2y);g.closePath();g.clip();
 g.transform(a,b,c,d,e,f);
 g.drawImage(img,0,0);
 g.restore();
}

function warpShapeMesh(srcCv,mesh,outW,outH,padX,padY){
 const out=bc(outW,outH),g=out.getContext('2d');
 g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
 const N=12,sw=srcCv.width,sh=srcCv.height,innerW=outW-padX*2,innerH=outH-padY*2;
 const pts=[];
 for(let j=0;j<=N;j++){
  const row=[];
  for(let i=0;i<=N;i++){
   const [mx,my]=evalCoons(mesh,i/N,j/N);
   row.push([padX+mx*innerW,padY+my*innerH]);
  }
  pts.push(row);
 }
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){
  const u0=i/N*sw,u1=(i+1)/N*sw,v0=j/N*sh,v1=(j+1)/N*sh;
  const [x00,y00]=pts[j][i],[x10,y10]=pts[j][i+1],[x01,y01]=pts[j+1][i],[x11,y11]=pts[j+1][i+1];
  drawTexturedTri(g,srcCv,u0,v0,u1,v0,u1,v1,x00,y00,x10,y10,x11,y11);
  drawTexturedTri(g,srcCv,u0,v0,u1,v1,u0,v1,x00,y00,x11,y11,x01,y01);
 }
 return out;
}

function warpShapeParametric(srcCv,warp,bendPct,slantPct){
 const sw=srcCv.width,sh=srcCv.height;
 const pad=Math.round(Math.max(sw,sh)*0.22);
 const ow=sw+pad*2,oh=sh+pad*2;
 const out=bc(ow,oh),og=out.getContext('2d');
 const srcData=srcCv.getContext('2d',{willReadFrequently:true}).getImageData(0,0,sw,sh).data;
 const oIm=og.createImageData(ow,oh),dst=oIm.data;
 const bend=bendPct/100,slant=slantPct/100;
 const hx=sw/2,hy=sh/2,cx=ow/2,cy=oh/2;
 for(let y=0;y<oh;y++)for(let x=0;x<ow;x++){
  let nx=(x-cx)/hx,ny=(y-cy)/hy;
  if(warp==='arc'){
   ny+=bend*0.65*(nx*nx-0.45);
   nx-=slant*0.4*ny;
  }else if(warp==='wave'){
   ny+=bend*0.42*Math.sin(nx*Math.PI*1.35+slant*2.2);
   nx+=slant*0.2*Math.sin(ny*Math.PI*1.35);
  }else if(warp==='bulge'){
   const r2=nx*nx+ny*ny;
   const f=Math.max(0.25,1-bend*0.48*Math.max(0,1.25-r2));
   nx*=f;ny*=f;
  }else if(warp==='twist'){
   const r=Math.hypot(nx,ny),ang=bend*2.1*Math.max(0,1.2-r*0.78);
   const co=Math.cos(ang),si=Math.sin(ang),tx=nx*co-ny*si,ty=nx*si+ny*co;
   nx=tx;ny=ty;
  }else if(warp==='perspective'){
   const denomX=Math.max(0.22,1+bend*0.52*ny);
   const denomY=Math.max(0.22,1+slant*0.45*nx);
   nx/=denomX;ny/=denomY;
  }else if(warp==='squeeze'){
   const denom=Math.max(0.25,1-bend*0.5*(1-Math.min(1,ny*ny)));
   nx/=denom;ny*=1+slant*0.22*(1-Math.min(1,nx*nx));
  }else if(warp==='skew'){
   const tx=nx-bend*0.65*ny,ty=ny-slant*0.55*nx;
   nx=tx;ny=ty;
  }
  const sx=nx*hx+hx,sy=ny*hy+hy;
  if(sx<0||sy<0||sx>=sw-1||sy>=sh-1)continue;
  const x0=sx|0,y0=sy|0,fx=sx-x0,fy=sy-y0;
  const i00=(y0*sw+x0)*4,i10=i00+4,i01=i00+sw*4,i11=i01+4;
  const w00=(1-fx)*(1-fy),w10=fx*(1-fy),w01=(1-fx)*fy,w11=fx*fy;
  const di=(y*ow+x)*4;
  dst[di]=srcData[i00]*w00+srcData[i10]*w10+srcData[i01]*w01+srcData[i11]*w11;
  dst[di+1]=srcData[i00+1]*w00+srcData[i10+1]*w10+srcData[i01+1]*w01+srcData[i11+1]*w11;
  dst[di+2]=srcData[i00+2]*w00+srcData[i10+2]*w10+srcData[i01+2]*w01+srcData[i11+2]*w11;
  dst[di+3]=srcData[i00+3]*w00+srcData[i10+3]*w10+srcData[i01+3]*w01+srcData[i11+3]*w11;
 }
 og.putImageData(oIm,0,0);
 return out;
}

function renderShapeCanvas(sh){
 const asp=(sh.aspect??100)/100;
 const baseW=sh.w||520,baseH=sh.h||520;
 const w=Math.max(120,Math.round(baseW*(asp>=1?asp:1)));
 const h=Math.max(120,Math.round(baseH*(asp<1?1/asp:1)));
 const cv=bc(w,h),g=cv.getContext('2d');
 const pad=Math.max(24,(sh.sw||0)+14);
 g.save();
 if(sh.shadow){g.shadowColor='rgba(0,0,0,0.48)';g.shadowBlur=sh.shBlur||22;g.shadowOffsetY=Math.round((sh.shBlur||22)*0.32)}
 traceShapePath(g,sh.kind,w,h,pad,sh.radius??12,sh.points??5);
 if(sh.fillType==='photo'&&base){
  g.save();g.clip();
  const srcCv=bc(W,H);srcCv.getContext('2d').putImageData(base,0,0);
  const cov=Math.max(w/W,h/H),dw=W*cov,dh=H*cov;
  g.drawImage(srcCv,(w-dw)/2,(h-dh)/2,dw,dh);
  g.restore();
 }else if(sh.fillType!=='none'){
  if(sh.fillType==='linear'){
   const rad=(sh.angle??135)*Math.PI/180,dx=Math.cos(rad)*w/2,dy=Math.sin(rad)*h/2;
   const gr=g.createLinearGradient(w/2-dx,h/2-dy,w/2+dx,h/2+dy);
   gr.addColorStop(0,sh.fill);gr.addColorStop(1,sh.fill2||'#4f46e5');
   g.fillStyle=gr;
  }else if(sh.fillType==='radial'){
   const gr=g.createRadialGradient(w/2,h/2,10,w/2,h/2,Math.max(w,h)/2);
   gr.addColorStop(0,sh.fill);gr.addColorStop(1,sh.fill2||'#4f46e5');
   g.fillStyle=gr;
  }else g.fillStyle=sh.fill;
  g.fill();
 }
 // Optional Y2K / Frutiger Aero / Cybercore Surface Finish clipped inside shape
 const fin=sh.finish||'flat';
 if(fin!=='flat'&&sh.fillType!=='none'){
  g.save();
  traceShapePath(g,sh.kind,w,h,pad,sh.radius??12,sh.points??5);
  g.clip();
  if(fin==='aero'){
   // Iconic 2006 Frutiger Aero curved glass dome highlight + luminous bottom bounce
   const dome=g.createLinearGradient(0,pad,0,h*0.58);
   dome.addColorStop(0,'rgba(255,255,255,0.88)');
   dome.addColorStop(0.55,'rgba(255,255,255,0.28)');
   dome.addColorStop(1,'rgba(255,255,255,0)');
   g.fillStyle=dome;
   g.beginPath();g.ellipse(w/2,pad+h*0.16,w*0.56,h*0.36,0,0,Math.PI*2);g.fill();
   const bounce=g.createRadialGradient(w/2,h-pad,4,w/2,h-pad,w*0.5);
   bounce.addColorStop(0,'rgba(200,255,255,0.58)');bounce.addColorStop(1,'rgba(0,210,255,0)');
   g.fillStyle=bounce;g.fillRect(0,h*0.45,w,h*0.55);
   g.strokeStyle='rgba(255,255,255,0.72)';g.lineWidth=4;
   traceShapePath(g,sh.kind,w,h,pad+2,sh.radius??12,sh.points??5);g.stroke();
  }else if(fin==='chrome'){
   // Y2K Liquid Chrome horizon reflection bands + metallic rim
   const ch=g.createLinearGradient(0,pad,0,h-pad);
   ch.addColorStop(0,'rgba(255,255,255,0.92)');
   ch.addColorStop(0.28,'rgba(175,205,255,0.55)');
   ch.addColorStop(0.49,'rgba(12,18,44,0.85)');
   ch.addColorStop(0.54,'rgba(245,252,255,0.95)');
   ch.addColorStop(0.76,'rgba(85,125,220,0.45)');
   ch.addColorStop(1,'rgba(255,255,255,0.82)');
   g.fillStyle=ch;g.fillRect(0,0,w,h);
   g.strokeStyle='rgba(255,255,255,0.9)';g.lineWidth=5;
   traceShapePath(g,sh.kind,w,h,pad+2,sh.radius??12,sh.points??5);g.stroke();
  }else if(fin==='neon'){
   const glow=g.createRadialGradient(w/2,h/2,6,w/2,h/2,Math.max(w,h)*0.5);
   glow.addColorStop(0,'rgba(255,255,255,0.75)');glow.addColorStop(0.45,'rgba(255,255,255,0.12)');glow.addColorStop(1,'rgba(0,0,0,0.35)');
   g.fillStyle=glow;g.fillRect(0,0,w,h);
  }
  g.restore();
  if(fin==='neon'){
   g.save();g.shadowColor=sh.fill||'#22ff44';g.shadowBlur=28;g.strokeStyle='#ffffff';g.lineWidth=4;
   traceShapePath(g,sh.kind,w,h,pad,sh.radius??12,sh.points??5);g.stroke();g.restore();
  }
 }
 g.shadowColor='transparent';
 if(sh.sw>0){traceShapePath(g,sh.kind,w,h,pad,sh.radius??12,sh.points??5);g.lineWidth=sh.sw;g.strokeStyle=sh.stroke||'#ffffff';g.lineJoin='round';g.stroke()}
 g.restore();

 const warp=sh.warp||'none';
 if(warp==='custom'){
  const mesh=sh.mesh||DEFAULT_MESH();
  const mPadX=Math.round(w*0.26),mPadY=Math.round(h*0.26);
  const res=warpShapeMesh(cv,mesh,w+mPadX*2,h+mPadY*2,mPadX,mPadY);
  res._meshMeta={padX:mPadX,padY:mPadY,innerW:w,innerH:h};
  return res;
 }
 if(warp!=='none'){
  return warpShapeParametric(cv,warp,sh.bend??40,sh.slant??0);
 }
 return cv;
}

async function addShapeLayer(kind,overrides={}){
 if(!base)await createDesignCanvas(1080,1080,'solid','#0a1228','#2a1144','Design');
 const isWide=kind==='pill'||kind==='arrow'||kind==='line'||kind==='bubble';
 const sh={
  kind,w:isWide?600:500,h:kind==='pill'?240:kind==='line'?180:isWide?390:500,
  fillType:'solid',finish:'flat',fill:$('sh-fill').value||'#ff5f7e',fill2:$('sh-fill2').value||'#4f46e5',
  angle:135,stroke:'#ffffff',sw:0,radius:kind==='rect'?12:0,points:kind==='burst'?12:kind==='polygon'?6:5,
  aspect:100,shadow:false,shBlur:22,warp:'none',bend:40,slant:0,mesh:DEFAULT_MESH(),...overrides
 };
 const cv=renderShapeCanvas(sh),d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height);
 pushU(mkSnap('p'));
 const name=SHAPES.find(s=>s.kind===kind)?.name||'Shape';
 const l={cv,d,o:null,lk:false,sh:null,ol:null,x:W/2,y:H/2,s:Math.min(W*0.42/cv.width,H*0.42/cv.height),r:0,op:1,bm:'source-over',fl:false,vis:true,cl:0,ct:0,cr:0,cb:0,name,shape:sh};
 layers.push(l);active=l;refreshLayers();draw();
 showToast(`Added ${name} shape`,1300);
 return l;
}
window.addShapeLayer=addShapeLayer;

function syncShapeEditor(){
 const l=active,sh=l?.shape;
 $('shape-edit').hidden=!sh;if(!sh)return;
 $('shape-edit-label').textContent='Editing: '+l.name;
 const warp=sh.warp||'none';
 $('sh-warp').value=warp;
 $('sh-bend').value=sh.bend??40;
 $('sh-slant').value=sh.slant??0;
 $('sh-warp-sliders').hidden=warp==='none'||warp==='custom';
 $('sh-mesh-hint').hidden=warp!=='custom';
 $('sh-warp-custom-btn').classList.toggle('on',warp==='custom');
 $('sh-fill-type').value=sh.fillType||'solid';
 if($('sh-finish'))$('sh-finish').value=sh.finish||'flat';
 $('sh-fill').value=sh.fill||'#ff5f7e';
 $('sh-fill2').value=sh.fill2||'#4f46e5';
 $('sh-angle').value=sh.angle??135;
 $('sh-aspect').value=sh.aspect??100;
 $('sh-stroke').value=sh.stroke||'#ffffff';
 $('sh-sw').value=sh.sw||0;
 $('sh-rad').value=sh.radius??12;
 $('sh-pts').value=sh.points??5;
 $('sh-shadow').checked=!!sh.shadow;
 $('sh-shblur').value=sh.shBlur??22;
 $('sh-fill-row').hidden=sh.fillType==='none'||sh.fillType==='photo';
 $('sh-fill2-row').hidden=!['linear','radial'].includes(sh.fillType);
 $('sh-angle-row').hidden=sh.fillType!=='linear';
 $('sh-rad-row').hidden=sh.kind!=='rect';
 $('sh-pts-row').hidden=!['star','polygon','burst'].includes(sh.kind);
 syncAutoOutputs();
}

function updateSelectedShape(patch,record=true){
 const l=active;if(!l?.shape||l.lk)return;
 if(record)pushU(mkSnap('p'));
 const prevW=l.cv.width;
 l.shape={...l.shape,...patch};
 if(l.shape.warp==='custom'&&!l.shape.mesh)l.shape.mesh=DEFAULT_MESH();
 const cv=renderShapeCanvas(l.shape);
 // Preserve visual scale nicely when toggling padded warp modes
 if(prevW&&cv.width!==prevW&&patch.warp!==undefined){l.s*=prevW/cv.width}
 l.cv=cv;l.d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height);l.o=null;maskViews.delete(l);
 syncShapeEditor();refreshLayers();draw();
}

for(const [id,key,mode] of [
 ['sh-warp','warp','str'],['sh-bend','bend','num'],['sh-slant','slant','num'],
 ['sh-fill-type','fillType','str'],['sh-finish','finish','str'],['sh-fill','fill','str'],['sh-fill2','fill2','str'],
 ['sh-angle','angle','num'],['sh-aspect','aspect','num'],['sh-stroke','stroke','str'],
 ['sh-sw','sw','num'],['sh-rad','radius','num'],['sh-pts','points','num'],
 ['sh-shadow','shadow','bool'],['sh-shblur','shBlur','num']
]){
 const el=$(id);if(!el)continue;let held=false;
 el.oninput=()=>{
  const val=mode==='bool'?el.checked:mode==='num'?+el.value:el.value;
  updateSelectedShape({[key]:val},!held);held=true;
 };
 el.onchange=el.onblur=()=>{held=false};
}
$('sh-warp-custom-btn').onclick=()=>{
 if(!active?.shape||active.lk)return;
 const next=active.shape.warp==='custom'?'none':'custom';
 updateSelectedShape({warp:next,mesh:active.shape.mesh||DEFAULT_MESH()},true);
 showToast(next==='custom'?'Drag the 8 cyan handles on canvas to warp shape':'Exited freeform mesh warp',1800);
};
$('sh-warp-reset').onclick=()=>{
 if(!active?.shape||active.lk)return;
 updateSelectedShape({warp:'none',bend:40,slant:0,mesh:DEFAULT_MESH()},true);
 showToast('Shape warp reset',1200);
};

/* ---------- Interactive Canvas Handles for Custom 8-Point Shape Mesh Warp ---------- */
let shapeMeshDrag=null,shapeMeshActiveIdx=0;
function isShapeMeshActive(){
 return !!(base&&active?.shape&&active.shape.warp==='custom'&&active.vis&&!active.lk&&['design','layers'].includes(tab)&&!typeDrawing&&!brushKind()&&!editingVector());
}
function shapeMeshHandleDocPoints(l){
 const meta=l.cv._meshMeta||{padX:Math.round(l.cv.width*0.17),padY:Math.round(l.cv.height*0.17),innerW:Math.round(l.cv.width*0.66),innerH:Math.round(l.cv.height*0.66)};
 const mesh=l.shape.mesh||DEFAULT_MESH(),m=layerMatrix(l);
 return mesh.map(([u,v])=>{
  const lx=meta.padX+u*meta.innerW,ly=meta.padY+v*meta.innerH;
  const pt=m.transformPoint(new DOMPoint(lx,ly));
  return [pt.x,pt.y];
 });
}
function drawShapeMeshGuides(){
 if(!isShapeMeshActive())return;
 const l=active,mesh=l.shape.mesh||DEFAULT_MESH(),k=KK();
 const meta=l.cv._meshMeta||{padX:Math.round(l.cv.width*0.17),padY:Math.round(l.cv.height*0.17),innerW:Math.round(l.cv.width*0.66),innerH:Math.round(l.cv.height*0.66)};
 const m=layerMatrix(l);
 const toDoc=(u,v)=>{const [mx,my]=evalCoons(mesh,u,v);const pt=m.transformPoint(new DOMPoint(meta.padX+mx*meta.innerW,meta.padY+my*meta.innerH));return [pt.x,pt.y]};
 ctx.save();
 // Internal 3x3 curved mesh lines
 ctx.strokeStyle='rgba(56,189,248,0.45)';ctx.lineWidth=1*k;
 for(const t of [0.333,0.667]){
  ctx.beginPath();for(let s=0;s<=16;s++){const [x,y]=toDoc(s/16,t);if(!s)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.stroke();
  ctx.beginPath();for(let s=0;s<=16;s++){const [x,y]=toDoc(t,s/16);if(!s)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.stroke();
 }
 // Outer perimeter curved cage
 ctx.strokeStyle='#38bdf8';ctx.lineWidth=1.8*k;
 ctx.beginPath();
 for(let s=0;s<=16;s++){const [x,y]=toDoc(s/16,0);if(!s)ctx.moveTo(x,y);else ctx.lineTo(x,y)}
 for(let s=1;s<=16;s++){const [x,y]=toDoc(1,s/16);ctx.lineTo(x,y)}
 for(let s=1;s<=16;s++){const [x,y]=toDoc(1-s/16,1);ctx.lineTo(x,y)}
 for(let s=1;s<=16;s++){const [x,y]=toDoc(0,1-s/16);ctx.lineTo(x,y)}
 ctx.closePath();ctx.stroke();
 // 8 Draggable handles
 const pts=shapeMeshHandleDocPoints(l);
 pts.forEach(([x,y],i)=>{
  const isCorner=i%2===0;
  ctx.beginPath();ctx.arc(x,y,(isCorner?6.5:5.2)*k,0,Math.PI*2);
  ctx.fillStyle=i===shapeMeshActiveIdx?'#fbbf24':isCorner?'#ffffff':'#38bdf8';
  ctx.strokeStyle='#050c1f';ctx.lineWidth=1.6*k;ctx.fill();ctx.stroke();
 });
 ctx.restore();
}
window.drawShapeMeshGuides=drawShapeMeshGuides;

c.addEventListener('pointerdown',e=>{
 if(!isShapeMeshActive()||spaceDown||e.button!==0)return;
 const p=pos(e),pts=shapeMeshHandleDocPoints(active),k=KK();
 let best=-1,bestD=16*k;
 pts.forEach(([hx,hy],i)=>{const d=Math.hypot(p[0]-hx,p[1]-hy);if(d<bestD){bestD=d;best=i}});
 if(best<0)return;
 e.preventDefault();e.stopImmediatePropagation();
 shapeMeshActiveIdx=best;
 const meta=active.cv._meshMeta||{padX:Math.round(active.cv.width*0.17),padY:Math.round(active.cv.height*0.17),innerW:Math.round(active.cv.width*0.66),innerH:Math.round(active.cv.height*0.66)};
 shapeMeshDrag={id:e.pointerId,idx:best,l:active,inv:layerMatrix(active).inverse(),meta,recorded:false};
 c.setPointerCapture(e.pointerId);
 draw(true);
},true);

c.addEventListener('pointermove',e=>{
 if(!shapeMeshDrag||e.pointerId!==shapeMeshDrag.id)return;
 e.stopImmediatePropagation();
 const st=shapeMeshDrag,l=st.l;if(active!==l)return;
 const lp=st.inv.transformPoint(new DOMPoint(...pos(e)));
 const u=Math.max(-0.32,Math.min(1.32,(lp.x-st.meta.padX)/st.meta.innerW));
 const v=Math.max(-0.32,Math.min(1.32,(lp.y-st.meta.padY)/st.meta.innerH));
 const nextMesh=(l.shape.mesh||DEFAULT_MESH()).map(pt=>pt.slice());
 nextMesh[st.idx]=[u,v];
 if(!st.recorded){pushU(mkSnap('p'));st.recorded=true}
 l.shape={...l.shape,mesh:nextMesh};
 const cv=renderShapeCanvas(l.shape);
 l.cv=cv;l.d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height);l.o=null;maskViews.delete(l);
 draw();
},true);

for(const ev of ['pointerup','pointercancel','lostpointercapture']){
 c.addEventListener(ev,e=>{if(shapeMeshDrag?.id===e.pointerId){shapeMeshDrag=null;refreshLayers();draw()}},true);
}

const shapeGrid=$('shape-grid');
for(const s of SHAPES){
 const b=document.createElement('button');b.type='button';b.className='studio-card';
 b.innerHTML=`<svg viewBox="0 0 28 28" aria-hidden="true">${s.svg}</svg><span>${esc(s.name)}</span>`;
 b.onclick=()=>addShapeLayer(s.kind);
 shapeGrid.append(b);
}

/* ---------- Y2K · Frutiger Aero · Cybercore Procedural Graphics ---------- */
const Y2K_ELEMENTS=[
 {id:'globe',name:'Wireframe Globe',sub:'Y2K · 3D Grid'},
 {id:'orbit-star',name:'Orbit Star Ring',sub:'Y2K · Cyber'},
 {id:'win98',name:'Win98 OS Window',sub:'Retro UI Frame'},
 {id:'barcode',name:'Cyber Barcode',sub:'Tech Stamp'},
 {id:'restricted',name:'R · Restricted',sub:'Y2K Warning'},
 {id:'cd',name:'Holographic CD',sub:'2000s Disc'},
 {id:'aero-orb',name:'Aero Glass Orb',sub:'Frutiger Gloss'},
 {id:'aero-pill',name:'Aero Gel Pill',sub:'Vista Glass'},
 {id:'droplets',name:'Water Droplets',sub:'Frutiger Aero'},
 {id:'xbox-arc',name:'Energy Arc Flare',sub:'Xbox 2001'},
 {id:'sparkles',name:'Holo Sparkles',sub:'Cybercore'},
 {id:'hud',name:'HUD Tech Grid',sub:'Sci-Fi UI'},
 {id:'chrome-swirl',name:'Chrome Swirl',sub:'Liquid Metal'},
 {id:'aurora',name:'Aero Aurora Wave',sub:'Frutiger Ribbon'}
];

function renderY2KElementCanvas(id,accent='#2b6cff'){
 const [ar,ag,ab]=rgb(accent||'#2b6cff');
 const rgba=(a)=>`rgba(${ar},${ag},${ab},${a})`;
 if(id==='globe'){
  const s=520,cv=bc(s,s),g=cv.getContext('2d'),cx=s/2,cy=s/2,r=210;
  g.strokeStyle=accent;g.lineWidth=3.2;g.shadowColor=accent;g.shadowBlur=14;
  g.beginPath();g.arc(cx,cy,r,0,Math.PI*2);g.stroke();
  for(const f of [0.22,0.5,0.78]){g.beginPath();g.ellipse(cx,cy,r*f,r,0,0,Math.PI*2);g.stroke()}
  for(const dy of [-0.72,-0.38,0,0.38,0.72]){
   const ry=Math.sqrt(1-dy*dy)*r;
   g.beginPath();g.ellipse(cx,cy+dy*r,ry,Math.max(4,ry*0.24),0,0,Math.PI*2);g.stroke();
  }
  g.beginPath();g.moveTo(cx,cy-r);g.lineTo(cx,cy+r);g.stroke();
  return {cv,bm:'screen',name:'Wireframe Globe'};
 }
 if(id==='orbit-star'){
  const w=620,h=360,cv=bc(w,h),g=cv.getContext('2d'),cx=w/2,cy=h/2;
  g.strokeStyle=accent;g.fillStyle=accent;g.shadowColor=accent;g.shadowBlur=16;
  g.lineWidth=10;g.beginPath();g.ellipse(cx,cy,255,105,-0.16,0,Math.PI*2);g.stroke();
  g.lineWidth=4;g.beginPath();g.ellipse(cx,cy,205,65,-0.16,0,Math.PI*2);g.stroke();
  // 4-point sharp Y2K star in center
  g.beginPath();
  for(let i=0;i<8;i++){const a=i*Math.PI/4,rad=i%2?36:135;const x=cx+Math.cos(a)*rad,y=cy+Math.sin(a)*rad;if(!i)g.moveTo(x,y);else g.lineTo(x,y)}
  g.closePath();g.fill();
  g.fillStyle='#ffffff';g.beginPath();
  for(let i=0;i<8;i++){const a=i*Math.PI/4,rad=i%2?14:64;const x=cx+Math.cos(a)*rad,y=cy+Math.sin(a)*rad;if(!i)g.moveTo(x,y);else g.lineTo(x,y)}
  g.closePath();g.fill();
  return {cv,bm:'screen',name:'Y2K Orbit Star'};
 }
 if(id==='win98'){
  const w=740,h=540,cv=bc(w,h),g=cv.getContext('2d');
  // Classic Win98 3D beveled frame with transparent inner viewport!
  g.fillStyle='#c0c7d6';g.fillRect(0,0,w,h);
  g.clearRect(14,82,w-28,h-98);
  // Outer 3D bevel
  g.fillStyle='#ffffff';g.fillRect(0,0,w,3);g.fillRect(0,0,3,h);
  g.fillStyle='#40485c';g.fillRect(0,h-3,w,3);g.fillRect(w-3,0,3,h);
  // Title bar gradient
  const tb=g.createLinearGradient(8,8,w-8,8);
  tb.addColorStop(0,'#081b5c');tb.addColorStop(1,accent);
  g.fillStyle=tb;g.fillRect(8,8,w-16,38);
  g.fillStyle='#ffffff';g.font='700 20px "Space Mono",monospace';g.textBaseline='middle';
  g.fillText('CYBER_PLAYER.EXE',20,27);
  // Window buttons _ [] X
  const btns=['_','□','×'];
  btns.forEach((ch,i)=>{
   const bx=w-108+i*32,by=14;
   g.fillStyle='#c8d0df';g.fillRect(bx,by,26,26);
   g.fillStyle='#ffffff';g.fillRect(bx,by,26,2);g.fillRect(bx,by,2,26);
   g.fillStyle='#2b3142';g.fillRect(bx,by+24,26,2);g.fillRect(bx+24,by,2,26);
   g.fillStyle='#0a0f1e';g.font='700 17px monospace';g.textAlign='center';g.fillText(ch,bx+13,by+14);
  });
  // Menu bar
  g.textAlign='left';g.fillStyle='#0a0f1e';g.font='600 16px Archivo,sans-serif';
  g.fillText('File    Edit    View    Play    Tools    Help',18,64);
  // Inner viewport recessed border
  g.strokeStyle='#3d4558';g.lineWidth=3;g.strokeRect(13,81,w-26,h-96);
  return {cv,bm:'source-over',name:'Win98 Window'};
 }
 if(id==='barcode'){
  const w=620,h=200,cv=bc(w,h),g=cv.getContext('2d');
  g.fillStyle=accent;g.shadowColor=accent;g.shadowBlur=10;
  let x=24;
  for(let i=0;i<54&&x<w-24;i++){
   const bw=((i*7+3)%4+1)*3.2,gap=((i*5+1)%3+1)*2.8;
   g.fillRect(x,18,bw,126);x+=bw+gap;
  }
  g.font='700 24px "Space Mono",monospace';g.textAlign='center';g.fillText('CYBER // 2000 // 0419-Y2K',w/2,174);
  return {cv,bm:'screen',name:'Cyber Barcode'};
 }
 if(id==='restricted'){
  const w=640,h=190,cv=bc(w,h),g=cv.getContext('2d');
  g.strokeStyle=accent;g.fillStyle=accent;g.shadowColor=accent;g.shadowBlur=12;
  g.lineWidth=5;g.strokeRect(10,10,w-20,h-20);
  g.fillRect(10,10,130,h-20);
  g.fillStyle='#050c1f';g.font='900 120px Impact,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('R',75,h/2+6);
  g.fillStyle=accent;g.textAlign='left';g.font='800 34px "Space Mono",monospace';
  g.fillText('RESTRICTED',164,54);
  g.lineWidth=3;g.beginPath();g.moveTo(156,82);g.lineTo(w-20,82);g.stroke();
  g.font='600 19px "Space Mono",monospace';
  g.fillText('CYBERNETIC AUDIO-VISUAL FEED',164,116);
  g.fillText('EST. 2000 · DIRECT-X ARCHIVE',164,148);
  return {cv,bm:'screen',name:'R Restricted Stamp'};
 }
 if(id==='cd'){
  const s=560,cv=bc(s,s),g=cv.getContext('2d'),cx=s/2,cy=s/2,R=250,rIn=54;
  g.save();
  g.beginPath();g.arc(cx,cy,R,0,Math.PI*2);g.arc(cx,cy,rIn,0,Math.PI*2,true);g.clip('evenodd');
  const baseGrad=g.createRadialGradient(cx,cy,rIn,cx,cy,R);
  baseGrad.addColorStop(0,'#cfd8e3');baseGrad.addColorStop(0.55,'#9fb2c8');baseGrad.addColorStop(1,'#e2e8f0');
  g.fillStyle=baseGrad;g.fillRect(0,0,s,s);
  // Iridescent rainbow holographic conic sheen
  const conic=g.createConicGradient(-0.6,cx,cy);
  conic.addColorStop(0,'rgba(255,255,255,0.75)');conic.addColorStop(0.14,'rgba(56,189,248,0.65)');
  conic.addColorStop(0.28,'rgba(168,85,247,0.58)');conic.addColorStop(0.42,'rgba(244,114,182,0.55)');
  conic.addColorStop(0.55,'rgba(255,255,255,0.85)');conic.addColorStop(0.72,'rgba(52,211,153,0.55)');
  conic.addColorStop(0.86,rgba(0.65));conic.addColorStop(1,'rgba(255,255,255,0.75)');
  g.fillStyle=conic;g.fillRect(0,0,s,s);
  // Subtle micro-tracks
  g.strokeStyle='rgba(255,255,255,0.22)';g.lineWidth=1.5;
  for(let rr=85;rr<R-12;rr+=18){g.beginPath();g.arc(cx,cy,rr,0,Math.PI*2);g.stroke()}
  // Inner hub ring
  g.strokeStyle='rgba(15,23,42,0.45)';g.lineWidth=12;g.beginPath();g.arc(cx,cy,rIn+22,0,Math.PI*2);g.stroke();
  g.restore();
  g.strokeStyle='rgba(255,255,255,0.8)';g.lineWidth=3;g.beginPath();g.arc(cx,cy,R-1,0,Math.PI*2);g.stroke();
  return {cv,bm:'source-over',name:'Holographic CD'};
 }
 if(id==='aero-orb'){
  const s=520,cv=bc(s,s),g=cv.getContext('2d'),cx=s/2,cy=s/2,R=215;
  g.save();
  // Soft luminous outer aura
  const aura=g.createRadialGradient(cx,cy,R*0.65,cx,cy,R*1.16);
  aura.addColorStop(0,rgba(0.55));aura.addColorStop(1,rgba(0));
  g.fillStyle=aura;g.fillRect(0,0,s,s);
  // Main glossy sphere body
  g.beginPath();g.arc(cx,cy,R,0,Math.PI*2);g.clip();
  const body=g.createRadialGradient(cx-R*0.18,cy-R*0.32,R*0.1,cx,cy,R);
  body.addColorStop(0,'rgba(255,255,255,0.92)');
  body.addColorStop(0.32,rgba(0.68));
  body.addColorStop(0.78,`rgba(${Math.round(ar*0.35)},${Math.round(ag*0.55)},${Math.round(ab*0.75)},0.82)`);
  body.addColorStop(1,'rgba(190,255,255,0.88)');
  g.fillStyle=body;g.fillRect(0,0,s,s);
  // Top curved glass specular dome
  const spec=g.createLinearGradient(0,cy-R,0,cy-R*0.05);
  spec.addColorStop(0,'rgba(255,255,255,0.96)');spec.addColorStop(0.65,'rgba(255,255,255,0.38)');spec.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=spec;g.beginPath();g.ellipse(cx,cy-R*0.44,R*0.76,R*0.48,0,0,Math.PI*2);g.fill();
  // Bottom aqua caustic bounce
  const bot=g.createRadialGradient(cx,cy+R*0.72,10,cx,cy+R*0.72,R*0.65);
  bot.addColorStop(0,'rgba(210,255,255,0.85)');bot.addColorStop(1,'rgba(0,255,220,0)');
  g.fillStyle=bot;g.fillRect(0,cy,s,s/2);
  g.restore();
  g.strokeStyle='rgba(255,255,255,0.75)';g.lineWidth=3.5;g.beginPath();g.arc(cx,cy,R-1,0,Math.PI*2);g.stroke();
  return {cv,bm:'source-over',name:'Aero Glass Orb'};
 }
 if(id==='aero-pill'){
  const w=620,h=210,cv=bc(w,h),g=cv.getContext('2d'),p=20,r=(h-p*2)/2;
  g.save();g.shadowColor=rgba(0.55);g.shadowBlur=22;g.shadowOffsetY=8;
  g.beginPath();g.roundRect(p,p,w-p*2,h-p*2,r);
  const bg=g.createLinearGradient(0,p,0,h-p);
  bg.addColorStop(0,rgba(0.95));bg.addColorStop(0.52,`rgba(${Math.round(ar*0.42)},${Math.round(ag*0.58)},${Math.round(ab*0.72)},0.96)`);bg.addColorStop(1,'rgba(165,255,245,0.94)');
  g.fillStyle=bg;g.fill();g.restore();
  g.save();g.beginPath();g.roundRect(p+4,p+4,w-p*2-8,(h-p*2)*0.48,r);
  const hl=g.createLinearGradient(0,p+4,0,h*0.52);
  hl.addColorStop(0,'rgba(255,255,255,0.92)');hl.addColorStop(1,'rgba(255,255,255,0.12)');
  g.fillStyle=hl;g.fill();g.restore();
  g.strokeStyle='rgba(255,255,255,0.82)';g.lineWidth=3;g.beginPath();g.roundRect(p,p,w-p*2,h-p*2,r);g.stroke();
  return {cv,bm:'source-over',name:'Aero Gel Pill'};
 }
 if(id==='droplets'){
  const s=640,cv=bc(s,s),g=cv.getContext('2d');
  const drops=[[170,180,58],[330,130,34],[450,210,72],[240,360,44],[420,420,52],[130,460,28],[520,330,26],[310,270,22],[490,115,20]];
  for(const [x,y,r] of drops){
   g.save();
   g.shadowColor='rgba(0,24,48,0.45)';g.shadowBlur=r*0.32;g.shadowOffsetX=r*0.14;g.shadowOffsetY=r*0.22;
   const dg=g.createRadialGradient(x-r*0.28,y-r*0.32,r*0.08,x,y,r);
   dg.addColorStop(0,'rgba(255,255,255,0.85)');dg.addColorStop(0.35,'rgba(210,250,255,0.22)');
   dg.addColorStop(0.82,rgba(0.32));dg.addColorStop(1,'rgba(255,255,255,0.78)');
   g.fillStyle=dg;g.beginPath();g.ellipse(x,y,r,r*0.92,0.2,0,Math.PI*2);g.fill();
   g.shadowColor='transparent';
   g.fillStyle='rgba(255,255,255,0.95)';g.beginPath();g.ellipse(x-r*0.32,y-r*0.34,r*0.26,r*0.15,-0.5,0,Math.PI*2);g.fill();
   g.restore();
  }
  return {cv,bm:'source-over',name:'Water Droplets'};
 }
 if(id==='xbox-arc'){
  const s=760,cv=bc(s,s),g=cv.getContext('2d'),cx=s/2,cy=s/2;
  g.save();
  // Glowing curved energy rings & laser streak (Image 1 style!)
  for(const [rad,lw,blur,al] of [[310,24,38,0.55],[310,10,14,0.85],[310,3,4,1],[250,14,24,0.45]]){
   g.strokeStyle=al===1?'#ffffff':accent;g.globalAlpha=al;g.lineWidth=lw;g.shadowColor=accent;g.shadowBlur=blur;
   g.beginPath();g.arc(cx,cy,rad,-0.8,2.2);g.stroke();
  }
  // Diagonal energy laser flare
  g.globalAlpha=0.95;g.shadowColor=accent;g.shadowBlur=32;
  const beam=g.createLinearGradient(60,cy-90,s-40,cy+110);
  beam.addColorStop(0,rgba(0));beam.addColorStop(0.45,accent);beam.addColorStop(0.5,'#ffffff');beam.addColorStop(0.58,accent);beam.addColorStop(1,rgba(0));
  g.strokeStyle=beam;g.lineWidth=18;g.beginPath();g.moveTo(60,cy-90);g.lineTo(s-40,cy+110);g.stroke();
  g.lineWidth=4;g.strokeStyle='#ffffff';g.beginPath();g.moveTo(140,cy-68);g.lineTo(s-120,cy+86);g.stroke();
  // Flare starburst node
  const fl=g.createRadialGradient(cx+40,cy+14,4,cx+40,cy+14,130);
  fl.addColorStop(0,'#ffffff');fl.addColorStop(0.28,rgba(0.85));fl.addColorStop(1,rgba(0));
  g.fillStyle=fl;g.fillRect(0,0,s,s);
  g.restore();
  return {cv,bm:'screen',name:'Xbox Energy Arc'};
 }
 if(id==='sparkles'){
  const s=680,cv=bc(s,s),g=cv.getContext('2d');
  const pts=[[110,130,36],[540,120,44],[260,80,20],[610,270,26],[90,410,32],[520,480,48],[340,560,24],[180,290,18],[440,260,22],[600,560,20],[230,520,30]];
  for(const [x,y,r] of pts){
   g.save();g.shadowColor=accent;g.shadowBlur=r*0.9;
   const gr=g.createRadialGradient(x,y,1,x,y,r);
   gr.addColorStop(0,'#ffffff');gr.addColorStop(0.35,rgba(0.85));gr.addColorStop(1,rgba(0));
   g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();
   g.fillStyle='#ffffff';g.beginPath();
   for(let i=0;i<8;i++){const a=i*Math.PI/4,rad=i%2?r*0.14:r;const px=x+Math.cos(a)*rad,py=y+Math.sin(a)*rad;if(!i)g.moveTo(px,py);else g.lineTo(px,py)}
   g.closePath();g.fill();g.restore();
  }
  return {cv,bm:'screen',name:'Cybercore Sparkles'};
 }
 if(id==='hud'){
  const w=800,h=600,cv=bc(w,h),g=cv.getContext('2d');
  g.strokeStyle=accent;g.fillStyle=accent;g.shadowColor=accent;g.shadowBlur=10;g.lineWidth=2.5;
  // Corner L brackets
  const L=64,p=24;
  g.beginPath();
  g.moveTo(p,p+L);g.lineTo(p,p);g.lineTo(p+L,p);
  g.moveTo(w-p-L,p);g.lineTo(w-p,p);g.lineTo(w-p,p+L);
  g.moveTo(p,h-p-L);g.lineTo(p,h-p);g.lineTo(p+L,h-p);
  g.moveTo(w-p-L,h-p);g.lineTo(w-p,h-p);g.lineTo(w-p,h-p-L);
  g.stroke();
  // Thin horizontal telemetry line + dot matrix block
  g.lineWidth=1.5;g.beginPath();g.moveTo(p,h*0.78);g.lineTo(w-p,h*0.78);g.stroke();
  for(let r=0;r<4;r++)for(let c2=0;c2<10;c2++){if((r+c2)%3)g.fillRect(w-180+c2*14,44+r*14,6,6)}
  g.font='600 15px "Space Mono",monospace';
  g.fillText('SYS // DIRECT-X 2001.11',p+10,h*0.78-10);
  g.fillText('COORD [ 35.6762 N / 139.6503 E ]',p+10,h*0.78+22);
  return {cv,bm:'screen',name:'Cyber HUD Frame'};
 }
 if(id==='chrome-swirl'){
  const w=440,h=640,cv=bc(w,h),g=cv.getContext('2d'),im=g.createImageData(w,h),d=im.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const nx=x/w*6,ny=y/h*8;
   const t=Math.sin(nx+Math.cos(ny*1.2+Math.sin(nx*1.6)*1.4)*1.9);
   const v=0.5+0.5*Math.sin(t*5.5+ny*1.5);
   const hi=Math.pow(v,3);
   const i=(y*w+x)*4;
   d[i]=Math.min(255,14+v*175+ar*0.24*v+hi*90);
   d[i+1]=Math.min(255,20+v*185+ag*0.24*v+hi*90);
   d[i+2]=Math.min(255,40+v*205+ab*0.32*v+hi*90);
   d[i+3]=255;
  }
  g.putImageData(im,0,0);
  return {cv,bm:'source-over',name:'Liquid Chrome Swirl'};
 }
 // Frutiger Aero Aurora Ribbons
 const w=820,h=460,cv=bc(w,h),g=cv.getContext('2d');
 const drawRibbon=(yOff,amp,colA,colB,al)=>{
  g.save();g.globalAlpha=al;
  const gr=g.createLinearGradient(0,0,w,h);
  gr.addColorStop(0,colA);gr.addColorStop(0.5,'rgba(255,255,255,0.85)');gr.addColorStop(1,colB);
  g.fillStyle=gr;g.beginPath();g.moveTo(0,h);
  for(let x=0;x<=w;x+=20){const y=yOff+Math.sin(x/w*Math.PI*2.2)*amp;g.lineTo(x,y)}
  for(let x=w;x>=0;x-=20){const y=yOff+95+Math.sin(x/w*Math.PI*2.2+0.7)*(amp*0.8);g.lineTo(x,y)}
  g.closePath();g.fill();g.restore();
 };
 drawRibbon(150,70,accent,'#a3e635',0.72);
 drawRibbon(220,55,'#38bdf8','#34d399',0.68);
 drawRibbon(115,45,'#ffffff',accent,0.45);
 return {cv,bm:'screen',name:'Aero Aurora Wave'};
}

async function addY2KElement(id,customColor){
 if(!base)await createDesignCanvas(1080,1350,'solid','#03050c','#0a1530','Y2K-Design');
 const col=customColor||$('y2k-col')?.value||'#2b6cff';
 const {cv,bm,name}=renderY2KElementCanvas(id,col);
 const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height);
 pushU(mkSnap('p'));
 const sc=Math.min(W*0.58/cv.width,H*0.58/cv.height);
 const l={cv,d,o:null,lk:false,sh:null,ol:null,x:W/2,y:H/2,s:sc,r:0,op:1,bm:bm||'source-over',fl:false,vis:true,cl:0,ct:0,cr:0,cb:0,name};
 layers.push(l);active=l;refreshLayers();draw();
 showToast(`Added ${name}`,1300);
 return l;
}
window.addY2KElement=addY2KElement;

const y2kGrid=$('y2k-grid');
if(y2kGrid){
 for(const item of Y2K_ELEMENTS){
  const b=document.createElement('button');b.type='button';b.className='studio-card';
  b.innerHTML=`<span>${esc(item.name)}</span><small>${esc(item.sub)}</small>`;
  b.onclick=()=>addY2KElement(item.id);
  y2kGrid.append(b);
 }
}
document.querySelectorAll('[data-yc]').forEach(b=>b.onclick=()=>{$('y2k-col').value=b.dataset.yc});

/* ---------- Photo Collage Grid Maker (2-Up, Stack, Triptych, 2x2) ---------- */
let pendingCollageLayout='2x2';
const COLLAGE_LAYOUTS={
 '2h':{w:1400,h:900,slots:[[0,0,0.5,1],[0.5,0,0.5,1]]},
 '2v':{w:1080,h:1350,slots:[[0,0,1,0.5],[0,0.5,1,0.5]]},
 '3h':{w:1500,h:900,slots:[[0,0,1/3,1],[1/3,0,1/3,1],[2/3,0,1/3,1]]},
 '2x2':{w:1200,h:1200,slots:[[0,0,0.5,0.5],[0.5,0,0.5,0.5],[0,0.5,0.5,0.5],[0.5,0.5,0.5,0.5]]}
};
async function buildCollageFromFiles(files,layoutKey){
 const spec=COLLAGE_LAYOUTS[layoutKey]||COLLAGE_LAYOUTS['2x2'];
 const gap=+$('collage-gap')?.value||14,rad=+$('collage-rad')?.value||12;
 await createDesignCanvas(spec.w,spec.h,'solid',$('bg-c1')?.value||'#0a1228',$('bg-c2')?.value||'#1e293b','Collage');
 const imgs=[];
 for(const f of files.slice(0,spec.slots.length)){
  try{imgs.push(await createImageBitmap(f))}catch{}
 }
 if(!imgs.length){showToast('Select 1 or more photos for the collage',1600);return}
 for(let i=0;i<spec.slots.length;i++){
  const [fx,fy,fw,fh]=spec.slots[i],bmp=imgs[i%imgs.length];
  const sx=Math.round(fx*W+gap/2),sy=Math.round(fy*H+gap/2);
  const sw=Math.max(40,Math.round(fw*W-gap)),sh=Math.max(40,Math.round(fh*H-gap));
  const cv=bc(sw,sh),g=cv.getContext('2d');
  g.save();g.beginPath();g.roundRect(0,0,sw,sh,rad);g.clip();
  const cov=Math.max(sw/bmp.width,sh/bmp.height),dw=bmp.width*cov,dh=bmp.height*cov;
  g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
  g.drawImage(bmp,(sw-dw)/2,(sh-dh)/2,dw,dh);
  g.restore();
  const d=g.getImageData(0,0,sw,sh);
  layers.push({cv,d,o:null,lk:false,sh:null,ol:null,x:sx+sw/2,y:sy+sh/2,s:1,r:0,op:1,bm:'source-over',fl:false,vis:true,cl:0,ct:0,cr:0,cb:0,name:`Photo ${i+1}`});
 }
 imgs.forEach(b=>b.close());
 active=layers.at(-1)||null;refreshLayers();draw();
 showToast(`Built ${spec.slots.length}-slot photo collage!`,1800);
}
if($('collage-grid')){
 $('collage-grid').onclick=e=>{
  const b=e.target.closest('[data-col]');if(!b)return;
  pendingCollageLayout=b.dataset.col;
  $('collage-files').click();
 };
 $('collage-files').onchange=e=>{
  const files=[...e.target.files];e.target.value='';
  if(files.length)buildCollageFromFiles(files,pendingCollageLayout);
 };
}

/* ---------- 12 Canva Photo Frames (Non-Destructive Mask Shapes + Optional Border) ---------- */
const FRAMES=[
 {id:'circle',name:'Circle',svg:'<circle cx="14" cy="14" r="10" fill="none" stroke="currentColor" stroke-width="2.5"/>'},
 {id:'arch',name:'Arch',svg:'<path d="M5 24V13a9 9 0 0 1 18 0v11z" fill="none" stroke="currentColor" stroke-width="2.5"/>'},
 {id:'squircle',name:'Rounded',svg:'<rect x="4" y="4" width="20" height="20" rx="6" fill="none" stroke="currentColor" stroke-width="2.5"/>'},
 {id:'diamond',name:'Diamond',svg:'<polygon points="14,3 25,14 14,25 3,14" fill="none" stroke="currentColor" stroke-width="2.2"/>'},
 {id:'star',name:'Star',svg:'<polygon points="14,3 17,10 25,11 19,16 21,24 14,20 7,24 9,16 3,11 11,10" fill="none" stroke="currentColor" stroke-width="2"/>'},
 {id:'burst',name:'Burst',svg:'<polygon points="14,2 17,6 22,5 21,10 26,12 23,16 25,20 20,21 18,26 14,23 10,26 8,21 3,20 5,16 2,12 7,10 6,5 11,6" fill="none" stroke="currentColor" stroke-width="1.8"/>'},
 {id:'heart',name:'Heart',svg:'<path d="M14 24S4 17.5 4 10.5A5.5 5.5 0 0 1 14 7a5.5 5.5 0 0 1 10 3.5C24 17.5 14 24 14 24z" fill="none" stroke="currentColor" stroke-width="2"/>'},
 {id:'polaroid',name:'Polaroid',svg:'<rect x="5" y="3" width="18" height="22" rx="1" fill="none" stroke="currentColor" stroke-width="2"/><rect x="7" y="5" width="14" height="14" fill="currentColor" opacity=".35"/>'},
 {id:'phone',name:'Phone',svg:'<rect x="7" y="3" width="14" height="22" rx="3" fill="none" stroke="currentColor" stroke-width="2"/>'},
 {id:'torn',name:'Torn Paper',svg:'<polygon points="4,5 9,3 14,6 19,3 24,5 25,14 23,23 18,25 14,22 9,25 4,23 3,14" fill="none" stroke="currentColor" stroke-width="2"/>'},
 {id:'blob',name:'Organic',svg:'<path d="M15 4c6 0 10 4 9 10s-4 10-10 10S3 19 4 13 9 4 15 4z" fill="none" stroke="currentColor" stroke-width="2"/>'},
 {id:'clear',name:'Clear frame',svg:'<path d="M6 6l16 16M22 6L6 22" stroke="currentColor" stroke-width="2.5"/>'}
];

function applyPhotoFrame(frameId){
 if(!base){showToast('Open an image first',1600);return}
 if(!active){
  pushU(mkSnap('all'));
  const cv=bc(W,H),d=new ImageData(new Uint8ClampedArray(base.data),W,H);cv.getContext('2d').putImageData(d,0,0);
  active={name:'Photo',cv,d,x:W/2,y:H/2,s:1,r:0,op:1,bm:'source-over',vis:true,fl:false,lk:false,ct:0,cb:0,cl:0,cr:0};
  layers.unshift(active);base.data.fill(0);
 }
 if(active.lk){showToast('Unlock the layer first',1400);return}
 if(frameId==='clear'){active.ol=null;replaceMask(null);showToast('Removed frame mask',1300);return}
 const w=active.cv.width,h=active.cv.height,mask=bc(w,h),g=mask.getContext('2d');
 g.fillStyle='#ffffff';
 const pad=Math.min(w,h)*0.04;
 if(frameId==='squircle'){g.beginPath();g.roundRect(pad,pad,w-pad*2,h-pad*2,Math.min(w,h)*0.22);g.fill()}
 else if(frameId==='polaroid'){g.fillRect(w*0.07,h*0.06,w*0.86,h*0.72)}
 else if(frameId==='phone'){const pw=Math.min(w*0.9,h*0.52),ph=Math.min(h*0.92,pw*1.92);g.beginPath();g.roundRect((w-pw)/2,(h-ph)/2,pw,ph,pw*0.14);g.fill()}
 else{traceShapePath(g,frameId,w,h,pad,18,frameId==='burst'?14:5);g.fill()}
 if($('frame-outline')?.checked){active.ol={w:Math.max(4,Math.round(Math.min(w,h)*0.015)),c:$('frame-border-col').value||'#ffffff'}}
 replaceMask(mask);
 showToast(`Applied ${FRAMES.find(f=>f.id===frameId)?.name||frameId} frame`,1400);
}
window.applyPhotoFrame=applyPhotoFrame;

const frameGrid=$('frame-grid');
for(const f of FRAMES){
 const b=document.createElement('button');b.type='button';b.className='studio-card';
 b.innerHTML=`<svg viewBox="0 0 28 28" aria-hidden="true">${f.svg}</svg><span>${esc(f.name)}</span>`;
 b.onclick=()=>applyPhotoFrame(f.id);
 frameGrid.append(b);
}

/* ---------- 12 Studio-Crafted Multi-Layer Design Templates ---------- */
function addAmbientGlowLayer(cx,cy,radius,colHex,opacity=0.65){
 const cv=bc(W,H),g=cv.getContext('2d'),[r,gr,b]=rgb(colHex);
 const rad=g.createRadialGradient(cx,cy,4,cx,cy,radius);
 rad.addColorStop(0,`rgba(${r},${gr},${b},${opacity})`);
 rad.addColorStop(0.5,`rgba(${r},${gr},${b},${opacity*0.32})`);
 rad.addColorStop(1,`rgba(${r},${gr},${b},0)`);
 g.fillStyle=rad;g.fillRect(0,0,W,H);
 const d=g.getImageData(0,0,W,H);
 layers.push({cv,d,o:null,lk:false,sh:null,ol:null,x:W/2,y:H/2,s:1,r:0,op:1,bm:'screen',fl:false,vis:true,cl:0,ct:0,cr:0,cb:0,name:'Ambient Glow'});
}

const TEMPLATES=[
 {
  name:'Cyberworld 2000',w:1080,h:1350,bg:'solid',c1:'#03050c',c2:'#070e24',
  previewBg:'linear-gradient(135deg,#03050a,#2b6cff 60%,#dbeafe)',previewTxt:'CYBER 2000',
  async build(){
   addAmbientGlowLayer(W*0.36,H*0.46,W*0.65,'#2b6cff',0.48);
   await addY2KElement('win98','#2b6cff');active.x=W*0.37;active.y=H*0.46;active.s=0.84;
   await addY2KElement('cd','#3b82f6');active.x=W*0.81;active.y=H*0.27;active.s=0.52;
   await addY2KElement('chrome-swirl','#2b6cff');active.x=W*0.80;active.y=H*0.56;active.s=0.56;
   await addY2KElement('globe','#2b6cff');active.x=W*0.74;active.y=H*0.78;active.s=0.35;
   await addY2KElement('globe','#60a5fa');active.x=W*0.89;active.y=H*0.78;active.s=0.35;
   await addY2KElement('restricted','#3b82f6');active.x=W*0.24;active.y=H*0.91;active.s=0.54;
   await addY2KElement('orbit-star','#60a5fa');active.x=W*0.53;active.y=H*0.91;active.s=0.36;
   await addY2KElement('barcode','#3b82f6');active.x=W*0.82;active.y=H*0.91;active.s=0.48;
   await addY2KElement('sparkles','#60a5fa');active.x=W*0.37;active.y=H*0.46;active.s=0.95;active.op=0.85;
   await ensureFont('Orbitron');await ensureFont('Space Mono');
   let t=newTextLayer({t:'CYBERWORLD',f:'Orbitron',sz:112,c:'#93c5fd',w:900,ls:4,stroke:'#2563eb',strokeWidth:4});t.y=H*0.095;
   t=newTextLayer({t:'VIRTUAL REALITY // 2000',f:'Space Mono',sz:26,c:'#93c5fd',w:700,ls:10});t.x=W*0.37;t.y=H*0.79;
  }
 },
 {
  name:'Xbox 2001 Energy',w:1200,h:1200,bg:'solid',c1:'#010402',c2:'#010402',
  previewBg:'radial-gradient(circle at 60% 45%,#22ff44,#021506 60%,#000)',previewTxt:'X · 2001',
  async build(){
   addAmbientGlowLayer(W*0.58,H*0.48,W*0.58,'#22ff44',0.58);
   await addY2KElement('xbox-arc','#22ff44');active.x=W*0.56;active.y=H*0.48;active.s=1.35;
   await addY2KElement('xbox-arc','#86efac');active.x=W*0.48;active.y=H*0.52;active.s=0.95;active.r=1.8;active.op=0.62;
   await addY2KElement('hud','#22ff44');active.x=W/2;active.y=H/2;active.s=1.34;
   await addY2KElement('sparkles','#22ff44');active.x=W*0.5;active.y=H*0.5;active.s=1.35;
   await ensureFont('Orbitron');await ensureFont('Space Mono');
   let t=newTextLayer({t:'DIRECT·X',f:'Orbitron',sz:140,c:'#ffffff',w:900,ls:12,stroke:'#16a34a',strokeWidth:5});t.x=W*0.44;t.y=H*0.50;
   t=newTextLayer({t:'NOVEMBER 2001 // NEXT-GEN ENGINE',f:'Space Mono',sz:22,c:'#86efac',w:700,ls:12});t.x=W*0.44;t.y=H*0.61;
  }
 },
 {
  name:'Frutiger Aero 06',w:1080,h:1350,bg:'gradient',c1:'#0284c7',c2:'#65a30d',
  previewBg:'linear-gradient(155deg,#0ea5e9,#38bdf8 48%,#84cc16)',previewTxt:'AERO 06',
  async build(){
   addAmbientGlowLayer(W*0.5,H*0.18,W*0.75,'#e0f2fe',0.55);
   await addY2KElement('aurora','#00e5ff');active.x=W*0.5;active.y=H*0.56;active.s=1.38;
   await addY2KElement('aero-orb','#00d8ff');active.x=W*0.28;active.y=H*0.39;active.s=0.92;
   await addY2KElement('aero-orb','#a3e635');active.x=W*0.74;active.y=H*0.47;active.s=0.66;
   await addY2KElement('aero-orb','#ffffff');active.x=W*0.64;active.y=H*0.28;active.s=0.34;active.op=0.85;
   await addY2KElement('droplets','#38bdf8');active.x=W*0.52;active.y=H*0.56;active.s=1.28;
   await addY2KElement('aero-pill','#00d8ff');active.x=W*0.5;active.y=H*0.84;active.s=0.92;
   await ensureFont('Poppins');await ensureFont('Inter');
   let t=newTextLayer({t:'PURE FUTURE',f:'Poppins',sz:112,c:'#ffffff',w:800,ls:4});t.y=H*0.15;t.sh={x:0,y:6,b:18,a:0.28,c:'#0c4a6e'};
   t=newTextLayer({t:'HUMAN · NATURE · TECHNOLOGY',f:'Inter',sz:26,c:'#ffffff',w:700,ls:14});t.y=H*0.84;
  }
 },
 {
  name:'Cybercore Holo',w:1080,h:1080,bg:'solid',c1:'#01030a',c2:'#01030a',
  previewBg:'radial-gradient(circle,#2b6cff,#020617 70%)',previewTxt:'HOLO 00',
  async build(){
   addAmbientGlowLayer(W/2,H*0.44,W*0.58,'#2563eb',0.55);
   await addY2KElement('sparkles','#3b82f6');active.x=W/2;active.y=H/2;active.s=1.48;
   await addY2KElement('globe','#2563eb');active.x=W/2;active.y=H*0.44;active.s=0.95;active.op=0.72;
   await addY2KElement('orbit-star','#60a5fa');active.x=W/2;active.y=H*0.44;active.s=1.12;
   await addY2KElement('hud','#3b82f6');active.x=W/2;active.y=H/2;active.s=1.25;
   await ensureFont('VT323');await ensureFont('Space Mono');
   let t=newTextLayer({t:'connected to the wired',f:'VT323',sz:78,c:'#dbeafe',w:400,ls:6});t.y=H*0.77;
   t=newTextLayer({t:'// SIGNAL LOCKED · 00:00',f:'Space Mono',sz:22,c:'#60a5fa',w:600,ls:10});t.y=H*0.86;
  }
 },
 {
  name:'Magazine Cover',w:1080,h:1350,bg:'gradient',c1:'#0e0c1e',c2:'#3a1235',
  previewBg:'linear-gradient(135deg,#0e0c1e,#701a5c)',previewTxt:'ATELIER',
  async build(){
   addAmbientGlowLayer(W*0.5,H*0.45,W*0.62,'#f472b6',0.38);
   await addShapeLayer('arch',{w:660,h:760,fillType:'linear',fill:'#fb7185',fill2:'#4c1d95',angle:170,shadow:true});
   active.x=W/2;active.y=H*0.52;active.s=0.88;active.name='Editorial arch';
   await addShapeLayer('rect',{w:960,h:1230,fillType:'none',stroke:'#f5e6d3',sw:4,radius:0});
   active.x=W/2;active.y=H/2;active.s=1;active.name='Cover border';
   await addShapeLayer('pill',{w:360,h:76,fillType:'solid',fill:'#f5c542',shadow:true});
   active.x=W/2;active.y=H*0.86;active.s=0.9;active.name='Issue pill';
   await ensureFont('Playfair Display');await ensureFont('Montserrat');
   let t=newTextLayer({t:'ATELIER',f:'Playfair Display',sz:182,c:'#fdf6ec',w:900,ls:10});t.y=H*0.15;
   t=newTextLayer({t:'THE FUTURE OF LIGHT & COLOUR',f:'Montserrat',sz:30,c:'#fde68a',w:700,ls:14});t.y=H*0.76;
   t=newTextLayer({t:'ISSUE 09 · AUTUMN',f:'Montserrat',sz:24,c:'#141226',w:800,ls:10});t.y=H*0.86;
  }
 },
 {
  name:'YouTube Thumb',w:1280,h:720,bg:'gradient',c1:'#070b1a',c2:'#1d2b64',
  previewBg:'linear-gradient(135deg,#070b1a,#e11d48)',previewTxt:'WATCH NOW',
  async build(){
   addAmbientGlowLayer(W*0.78,H*0.45,W*0.52,'#ff2e55',0.58);
   addAmbientGlowLayer(W*0.22,H*0.5,W*0.45,'#38bdf8',0.38);
   await addShapeLayer('burst',{w:310,h:310,fillType:'linear',finish:'aero',fill:'#ff2e55',fill2:'#ff8a00',points:14,shadow:true});
   active.x=W*0.82;active.y=H*0.26;active.s=0.82;active.name='Burst badge';
   await addShapeLayer('arrow',{w:340,h:190,fillType:'solid',fill:'#ffd60a',warp:'arc',bend:35,shadow:true});
   active.x=W*0.64;active.y=H*0.62;active.s=0.65;active.r=-0.22;active.name='Curved arrow';
   await ensureFont('Anton');await ensureFont('Archivo Black');
   let t=newTextLayer({t:'10X!',f:'Archivo Black',sz:54,c:'#ffffff',w:900});t.x=W*0.82;t.y=H*0.26;
   t=newTextLayer({t:'INSANE\nRESULTS',f:'Anton',sz:168,c:'#ffffff',w:700,al:'left',lh:94,stroke:'#000000',strokeWidth:9});t.x=W*0.28;t.y=H*0.52;
  }
 },
 {
  name:'Streetwear Poster',w:1080,h:1350,bg:'solid',c1:'#09090b',c2:'#09090b',
  previewBg:'linear-gradient(135deg,#09090b,#bef264)',previewTxt:'RAW 01',
  async build(){
   addAmbientGlowLayer(W*0.5,H*0.48,W*0.62,'#a3e635',0.38);
   await addShapeLayer('circle',{w:620,h:620,fillType:'linear',finish:'chrome',fill:'#c6ff3d',fill2:'#22d3ee',angle:120,warp:'bulge',bend:32});
   active.x=W*0.5;active.y=H*0.48;active.s=0.88;active.name='Chrome orb';
   await addShapeLayer('star',{w:220,h:220,fillType:'solid',fill:'#c6ff3d',points:8});
   active.x=W*0.82;active.y=H*0.18;active.s=0.68;active.name='Star stamp';
   await addY2KElement('barcode','#c6ff3d');active.x=W*0.26;active.y=H*0.16;active.s=0.45;
   await ensureFont('Syne');await ensureFont('Space Mono');
   let t=newTextLayer({t:'KINETIC\nSTUDIO',f:'Syne',sz:148,c:'#ffffff',w:800,lh:94,stroke:'#09090b',strokeWidth:4});t.y=H*0.48;
   t=newTextLayer({t:'LIMITED EDITION · DROP 04 · TOKYO / NYC',f:'Space Mono',sz:24,c:'#c6ff3d',w:700,ls:10});t.y=H*0.88;
  }
 },
 {
  name:'Album Cover',w:1400,h:1400,bg:'gradient',c1:'#0f172a',c2:'#4c1d95',
  previewBg:'linear-gradient(135deg,#0f172a,#7c3aed)',previewTxt:'MIDNIGHT',
  async build(){
   addAmbientGlowLayer(W*0.5,H*0.52,W*0.64,'#f472b6',0.46);
   await addShapeLayer('arch',{w:720,h:880,fillType:'linear',finish:'aero',fill:'#f472b6',fill2:'#fb923c',angle:180,shadow:true});
   active.x=W/2;active.y=H*0.53;active.s=0.88;active.name='Sunset arch';
   await addY2KElement('sparkles','#fde68a');active.x=W/2;active.y=H*0.5;active.s=1.45;active.op=0.75;
   await ensureFont('Unbounded');await ensureFont('Raleway');
   let t=newTextLayer({t:'AFTERHOURS',f:'Unbounded',sz:106,c:'#ffffff',w:700,ls:8});t.y=H*0.14;
   t=newTextLayer({t:'DELUXE EDITION',f:'Raleway',sz:32,c:'#fde68a',w:600,ls:24});t.y=H*0.90;
  }
 },
 {
  name:'Minimal Quote',w:1080,h:1080,bg:'solid',c1:'#f3efe6',c2:'#f3efe6',
  previewBg:'#f3efe6;color:#1b1b1b',previewTxt:'“CREATE”',
  async build(){
   await addShapeLayer('rect',{w:960,h:960,fillType:'none',stroke:'#d6cfc2',sw:4,radius:18});
   active.x=W/2;active.y=H/2;active.s=1;active.name='Subtle frame';
   await addShapeLayer('line',{w:240,h:36,fillType:'solid',fill:'#18181b'});
   active.x=W/2;active.y=H*0.65;active.s=0.65;active.name='Divider rule';
   await ensureFont('Playfair Display');await ensureFont('Inter');
   let t=newTextLayer({t:'“Make things\nworth staring at.”',f:'Playfair Display',sz:86,c:'#18181b',w:700,it:true,lh:115});t.y=H*0.43;
   t=newTextLayer({t:'TOTONE STUDIO',f:'Inter',sz:24,c:'#52525b',w:700,ls:22});t.y=H*0.74;
  }
 },
 {
  name:'Story / Reel Promo',w:1080,h:1920,bg:'gradient',c1:'#0f0726',c2:'#064e3b',
  previewBg:'linear-gradient(160deg,#0f0726,#10b981)',previewTxt:'STORY',
  async build(){
   addAmbientGlowLayer(W*0.5,H*0.36,W*0.78,'#10b981',0.48);
   await addShapeLayer('pill',{w:620,h:128,fillType:'linear',finish:'aero',fill:'#ffffff',fill2:'#d1fae5',shadow:true});
   active.x=W/2;active.y=H*0.82;active.s=0.92;active.name='CTA Button';
   await addY2KElement('sparkles','#6ee7b7');active.x=W/2;active.y=H*0.38;active.s=1.35;
   await ensureFont('Bebas Neue');await ensureFont('Poppins');
   let t=newTextLayer({t:'WEEKEND\nCOLLECTION',f:'Bebas Neue',sz:192,c:'#ffffff',w:700,lh:96,ls:6});t.y=H*0.36;
   t=newTextLayer({t:'SWIPE UP TO EXPLORE',f:'Poppins',sz:32,c:'#064e3b',w:800,ls:6});t.y=H*0.82;
  }
 },
 {
  name:'Y2K Cyber Flyer',w:1080,h:1350,bg:'gradient',c1:'#090418',c2:'#2e1065',
  previewBg:'linear-gradient(135deg,#090418,#06b6d4)',previewTxt:'Y2K LIVE',
  async build(){
   addAmbientGlowLayer(W*0.5,H*0.5,W*0.65,'#06b6d4',0.5);
   await addShapeLayer('rect',{w:740,h:340,fillType:'linear',finish:'chrome',fill:'#06b6d4',fill2:'#a855f7',warp:'wave',bend:48,slant:20});
   active.x=W/2;active.y=H*0.52;active.s=0.96;active.name='Chrome wave ribbon';
   await addShapeLayer('bolt',{w:180,h:240,fillType:'solid',finish:'neon',fill:'#fde047'});
   active.x=W*0.18;active.y=H*0.2;active.s=0.62;active.name='Neon bolt';
   await addY2KElement('orbit-star','#22d3ee');active.x=W*0.82;active.y=H*0.74;active.s=0.52;
   await ensureFont('Orbitron');await ensureFont('VT323');
   let t=newTextLayer({t:'HYPER\nCLUB',f:'Orbitron',sz:130,c:'#ffffff',w:900,lh:96});t.y=H*0.27;
   t=newTextLayer({t:'SAT NOV 28 // DOORS 22:00 // LEVEL 09',f:'VT323',sz:44,c:'#67e8f9',w:400,ls:6});t.y=H*0.86;
  }
 },
 {
  name:'Product Launch',w:1080,h:1080,bg:'gradient',c1:'#141418',c2:'#27272f',
  previewBg:'linear-gradient(135deg,#141418,#f97316)',previewTxt:'LAUNCH',
  async build(){
   addAmbientGlowLayer(W*0.52,H*0.54,W*0.6,'#f97316',0.48);
   await addShapeLayer('blob',{w:640,h:640,fillType:'linear',finish:'aero',fill:'#f97316',fill2:'#ec4899',angle:45,shadow:true});
   active.x=W*0.52;active.y=H*0.54;active.s=0.86;active.name='Glossy hero blob';
   await addShapeLayer('pill',{w:320,h:72,fillType:'solid',fill:'#ffffff'});
   active.x=W*0.5;active.y=H*0.86;active.s=0.88;active.name='Release badge';
   await ensureFont('Unbounded');await ensureFont('Inter');
   let t=newTextLayer({t:'SERIES X',f:'Unbounded',sz:116,c:'#ffffff',w:800});t.y=H*0.17;
   t=newTextLayer({t:'OUT NOW · 2026',f:'Inter',sz:26,c:'#18181b',w:800,ls:12});t.y=H*0.86;
  }
 }
];

const tplGrid=$('tpl-grid');
for(const tpl of TEMPLATES){
 const b=document.createElement('button');b.type='button';b.className='tpl-card';
 b.innerHTML=`<div class="tpl-swatch" style="background:${tpl.previewBg}">${esc(tpl.previewTxt)}</div><span>${esc(tpl.name)}</span>`;
 b.onclick=async()=>{
  await createDesignCanvas(tpl.w,tpl.h,tpl.bg,tpl.c1,tpl.c2,tpl.name);
  await tpl.build();
  refreshLayers();draw();
  showToast(`Loaded "${tpl.name}" template`,1800);
 };
 tplGrid.append(b);
}

/* ---------- Canva Font Pairings ---------- */
const FONT_PAIRS=[
 {name:'Editorial Luxury',head:'Playfair Display',sub:'Montserrat',hTxt:'TIMELESS',sTxt:'AUTUMN COLLECTION · 2026'},
 {name:'Bold Streetwear',head:'Anton',sub:'Space Mono',hTxt:'NO LIMITS',sTxt:'DROP 01 // LIMITED RUN'},
 {name:'Modern Tech',head:'Unbounded',sub:'Inter',hTxt:'NEXT GEN',sTxt:'Designed for speed and precision'},
 {name:'Retro Groovy',head:'Shrikhand',sub:'Poppins',hTxt:'Golden Hour',sTxt:'ANALOG VIBES · SUMMER 79'},
 {name:'Y2K Cyber',head:'Orbitron',sub:'VT323',hTxt:'HYPERDRIVE',sTxt:'SYSTEM ONLINE // 04:20'},
 {name:'Journal Script',head:'Dancing Script',sub:'Lora',hTxt:'Sunday Notes',sTxt:'Handcrafted memories & film scans'}
];
const pairList=$('font-pair-list');
for(const p of FONT_PAIRS){
 const b=document.createElement('button');b.type='button';b.className='pair-btn';
 b.innerHTML=`<strong style="font-family:'${p.head}',sans-serif">${esc(p.hTxt)}</strong><small style="font-family:'${p.sub}',sans-serif">${esc(p.name)} · ${esc(p.head)} + ${esc(p.sub)}</small>`;
 b.onclick=async()=>{
  if(!base)await createDesignCanvas(1080,1080,'solid','#0a1228','#2a1144','Design');
  await Promise.all([ensureFont(p.head),ensureFont(p.sub)]);
  const hSz=Math.max(24,Math.round(Math.min(W,H)*0.11));
  const sSz=Math.max(14,Math.round(hSz*0.30));
  const l1=newTextLayer({t:p.hTxt,f:p.head,sz:hSz,c:'#ffffff',w:700});
  l1.y=H*0.44;
  const l2=newTextLayer({t:p.sTxt,f:p.sub,sz:sSz,c:'#cbd5e1',w:600,ls:12});
  l2.y=H*0.44+hSz*0.85;
  refreshLayers();draw();
  showToast(`Added "${p.name}" font pairing`,1500);
 };
 pairList.append(b);
}

/* ---------- Brand Kit Swatches ---------- */
const DEFAULT_BRAND=['#ffffff','#050c1f','#ff4d79','#ffd60a','#22d3ee','#a855f7','#c6ff3d'];
let brandColors=DEFAULT_BRAND.slice();
try{const saved=JSON.parse(localStorage.getItem('totone:brand')||'null');if(Array.isArray(saved)&&saved.length)brandColors=saved}catch{}
function saveBrand(){try{localStorage.setItem('totone:brand',JSON.stringify(brandColors.slice(0,18)))}catch{}}
function renderBrand(){
 const row=$('brand-swatches');row.replaceChildren();
 for(const col of brandColors){
  const b=document.createElement('button');b.type='button';b.className='brand-dot';
  b.style.background=col;b.title=`Apply ${col} (Right-click to remove)`;b.setAttribute('aria-label',`Apply brand colour ${col}`);
  b.onclick=()=>{
   if(active?.shape)updateSelectedShape({fill:col},true);
   else if(active?.tx)retext({c:col});
   else if($('draw-col1')){$('draw-col1').value=col;$('bg-c1').value=col}
   showToast(`Applied ${col}`,1000);
  };
  b.oncontextmenu=e=>{e.preventDefault();brandColors=brandColors.filter(c=>c!==col);saveBrand();renderBrand()};
  row.append(b);
 }
}
$('brand-add').onclick=()=>{const c=$('brand-pick').value.toLowerCase();if(!brandColors.includes(c)){brandColors.unshift(c);saveBrand();renderBrand();showToast(`Saved ${c} to Brand Kit`,1200)}};
$('brand-from-img').onclick=()=>{
 if(!base||!palette.length){showToast('Open an image first',1400);return}
 for(const p of palette){const h=hex(...p);if(!brandColors.includes(h))brandColors.push(h)}
 brandColors=brandColors.slice(0,18);saveBrand();renderBrand();showToast('Extracted photo colours into Brand Kit',1500);
};
renderBrand();

// Hook into refreshLayers and render so shape editor & freeform mesh handles stay live!
const prevRefreshCanva=refreshLayers;
refreshLayers=function(){prevRefreshCanva();syncShapeEditor()};
const prevRenderCanva=render;
render=function(ov=true,rect,printTable=null){
 prevRenderCanva(ov,rect,printTable);
 if(ov&&!rect)drawShapeMeshGuides();
};
enhanceSliders($('p-design'));
})();
