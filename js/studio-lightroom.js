/* Totone Lightroom Studio — Basic Develop, 8-Dot Color Mixer, Point Color (Concert / Stage-Light Skin Recovery), and 3-Up Color Grading Wheels */
(function(){
const clamp=(v,lo=0,hi=1)=>v<lo?lo:v>hi?hi:v;
function rgbToHsl(r,g,b){
 r/=255;g/=255;b/=255;
 const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,l=(max+min)/2;
 if(!d)return [0,0,l];
 const s=d/(1-Math.abs(2*l-1));
 let h=max===r?((g-b)/d)%6:max===g?(b-r)/d+2:(r-g)/d+4;
 h=(h*60+360)%360;
 return [h,s,l];
}
function hslToRgb(h,s,l){
 h=((h%360)+360)%360;s=clamp(s);l=clamp(l);
 const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;
 let r=0,g=0,b=0;
 if(h<60){r=c;g=x}else if(h<120){r=x;g=c}else if(h<180){g=c;b=x}
 else if(h<240){g=x;b=c}else if(h<300){r=x;b=c}else{r=c;b=x}
 return [(r+m)*255,(g+m)*255,(b+m)*255];
}
function shortestHueDelta(fromH,toH){return ((toH-fromH+540)%360)-180}

/* ========== 1. Basic Develop State & Controls ========== */
const BASIC_DEFAULTS={temp:0,tint:0,exp:0,con:0,hi:0,sh:0,wh:0,bl:0,tex:0,cla:0,deh:0,vib:0,sat:0,bw:false,hdr:false};
let basic={...BASIC_DEFAULTS};
let wbPicking=false;

const WB_PRESETS={
 custom:{temp:0,tint:0},
 daylight:{temp:6,tint:2},
 cloudy:{temp:18,tint:4},
 shade:{temp:28,tint:6},
 tungsten:{temp:-34,tint:-4},
 fluorescent:{temp:-14,tint:24},
 concert:{temp:-46,tint:-22}
};

function syncBasicUI(){
 for(const k of ['temp','tint','exp','con','hi','sh','wh','bl','tex','cla','deh','vib','sat']){
  const el=$('lr-'+k);if(!el)continue;
  el.value=basic[k];
  const out=el.nextElementSibling;
  if(out)out.value=k==='exp'?Number(basic[k]).toFixed(2):String(Math.round(basic[k]));
 }
 $('lr-bw').setAttribute('aria-pressed',String(basic.bw));
 $('lr-hdr').setAttribute('aria-pressed',String(basic.hdr));
 $('lr-wb-pick').setAttribute('aria-pressed',String(wbPicking));
}

function basicIsActive(){
 return basic.bw||basic.hdr||['temp','tint','exp','con','hi','sh','wh','bl','tex','cla','deh','vib','sat'].some(k=>basic[k]!==0);
}

for(const k of ['temp','tint','exp','con','hi','sh','wh','bl','tex','cla','deh','vib','sat']){
 const el=$('lr-'+k);if(!el)continue;
 el.oninput=()=>{
  basic[k]=+el.value;
  if(k==='temp'||k==='tint')$('lr-wb').value='custom';
  syncBasicUI();draw();
 };
}
$('lr-wb').onchange=e=>{
 const p=WB_PRESETS[e.target.value];if(!p)return;
 basic.temp=p.temp;basic.tint=p.tint;syncBasicUI();draw();
 if(e.target.value==='concert')showToast('Applied Concert Red Fix WB — refine with Point Color below!',2200);
};
$('lr-bw').onclick=()=>{basic.bw=!basic.bw;syncBasicUI();draw()};
$('lr-hdr').onclick=()=>{
 basic.hdr=!basic.hdr;
 if(basic.hdr){basic.hi=Math.min(basic.hi,-38);basic.sh=Math.max(basic.sh,42);basic.cla=Math.max(basic.cla,22);basic.vib=Math.max(basic.vib,16)}
 else{basic.hi=0;basic.sh=0;basic.cla=0;basic.vib=0}
 syncBasicUI();draw();showToast(basic.hdr?'HDR tone boost on':'HDR tone boost off',1200);
};
$('lr-auto').onclick=()=>{
 if(!base){showToast('Open an image first',1400);return}
 const d=base.data,n=W*H,step=Math.max(1,Math.floor(n/12000));
 let sumL=0,cnt=0,hist=new Uint32Array(256),sr=0,sg=0,sb=0;
 for(let i=0;i<n;i+=step){
  const j=i*4;if(d[j+3]<32)continue;
  const r=d[j],g=d[j+1],b=d[j+2],l=(r*.2126+g*.7152+b*.0722)|0;
  hist[l]++;sumL+=l;sr+=r;sg+=g;sb+=b;cnt++;
 }
 if(!cnt)return;
 const mean=sumL/cnt;
 let acc=0,p5=0,p95=255;
 for(let i=0;i<256;i++){acc+=hist[i];if(acc>=cnt*0.04){p5=i;break}}
 acc=0;for(let i=255;i>=0;i--){acc+=hist[i];if(acc>=cnt*0.04){p95=i;break}}
 basic.exp=Number(clamp((126-mean)/72,-1.6,1.6).toFixed(2));
 basic.con=Math.round(clamp((185-(p95-p5))*0.35,-25,38));
 basic.hi=p95>232?-24:0;
 basic.sh=p5<24?26:0;
 basic.wh=p95<215?Math.round((225-p95)*0.45):0;
 basic.bl=p5>32?-Math.round((p5-20)*0.45):0;
 basic.vib=16;basic.cla=10;
 syncBasicUI();draw();showToast('Auto Basic tone applied',1400);
};
$('lr-basic-reset').onclick=()=>{
 basic={...BASIC_DEFAULTS};$('lr-wb').value='custom';wbPicking=false;
 syncBasicUI();draw();showToast('Basic Develop reset',1200);
};
$('lr-wb-pick').onclick=()=>{
 wbPicking=!wbPicking;if(wbPicking)pcPicking=false;
 syncBasicUI();syncPointUI();
 if(wbPicking)showToast('Click a neutral grey or white area on the photo',1800);
};

/* ========== 2. Point Color + Concert / Stage-Light Skin Recovery ========== */
let pointColors=[];
let pcIdx=-1,pcPicking=false,pcViz=false;

function makePointColor(srcHex='#e02424',targetHex='#d99f7c'){
 const [r,g,b]=rgb(srcHex),[h,s,l]=rgbToHsl(r,g,b);
 return {id:Date.now()+Math.random(),on:true,srcHex,targetHex,sH:h,sS:s,sL:l,hue:0,sat:0,lum:0,variance:58,range:54};
}
function matchPointToTarget(pt,targetHex){
 pt.targetHex=targetHex;
 const [tr,tg,tb]=rgb(targetHex),[tH,tS,tL]=rgbToHsl(tr,tg,tb);
 pt.hue=Math.round(shortestHueDelta(pt.sH,tH));
 pt.sat=Math.round(clamp((tS-pt.sS)*115,-100,100));
 pt.lum=Math.round(clamp((tL-pt.sL)*120,-100,100));
 pt.variance=Math.max(pt.variance,68);
 pt.range=Math.max(pt.range,52);
 pt.on=true;
}

function syncPointUI(){
 $('pc-pick').setAttribute('aria-pressed',String(pcPicking));
 const wrap=$('pc-swatches');wrap.replaceChildren();
 pointColors.forEach((pt,i)=>{
  const b=document.createElement('button');b.type='button';b.className='pc-swatch'+(i===pcIdx?' on':'');
  b.innerHTML=`<i style="background:${pt.srcHex}"></i>→<i style="background:${pt.targetHex}"></i>${pt.on?'':' (off)'}`;
  b.onclick=()=>{pcIdx=i;syncPointUI();draw()};
  wrap.append(b);
 });
 const pt=pointColors[pcIdx];
 $('pc-del').disabled=!pt;
 $('pc-editor').hidden=!pt;
 if(!pt){
  $('pc-msg').textContent=pcPicking?'Click on the photo to sample the colour you want to shift (e.g. red-lit skin).':'Click "Pick colour in photo" then click the photo to sample a colour.';
  return;
 }
 $('pc-src').value=pt.srcHex;
 $('pc-target').value=pt.targetHex;
 $('pc-hue').value=pt.hue;$('pc-hue').nextElementSibling.value=pt.hue+'°';
 $('pc-sat').value=pt.sat;$('pc-sat').nextElementSibling.value=pt.sat;
 $('pc-lum').value=pt.lum;$('pc-lum').nextElementSibling.value=pt.lum;
 $('pc-var').value=pt.variance;$('pc-var').nextElementSibling.value=pt.variance;
 $('pc-range').value=pt.range;$('pc-range').nextElementSibling.value=pt.range;
 $('pc-viz').checked=pcViz;
 $('pc-on').checked=pt.on;
 $('pc-msg').textContent=pcPicking?'Click on the photo to re-sample this Point Color.':'Click a Skin preset or Match colour to convert stage light cleanly — toggle Visualize Range to inspect the mask.';
}

$('pc-pick').onclick=()=>{
 if(!base){showToast('Open an image first',1400);return}
 pcPicking=!pcPicking;if(pcPicking)wbPicking=false;
 syncBasicUI();syncPointUI();
 if(pcPicking)showToast('Click the colour on the photo (e.g. red concert skin)',2000);
};
$('pc-add').onclick=()=>{
 if(pointColors.length>=6){showToast('Up to 6 Point Colors supported',1400);return}
 pointColors.push(makePointColor('#e02424','#d99f7c'));
 pcIdx=pointColors.length-1;pcPicking=true;
 syncPointUI();draw();
 showToast('Click on the photo to pick the new colour',1600);
};
$('pc-del').onclick=()=>{
 if(pcIdx<0)return;
 pointColors.splice(pcIdx,1);pcIdx=Math.min(pcIdx,pointColors.length-1);
 if(!pointColors.length)pcViz=false;
 syncPointUI();draw();
};
$('pc-src').oninput=e=>{
 const pt=pointColors[pcIdx];if(!pt)return;
 pt.srcHex=e.target.value;const [r,g,b]=rgb(pt.srcHex);[pt.sH,pt.sS,pt.sL]=rgbToHsl(r,g,b);
 syncPointUI();draw();
};
$('pc-target').oninput=e=>{
 const pt=pointColors[pcIdx];if(!pt)return;
 pt.targetHex=e.target.value;
};
$('pc-match').onclick=()=>{
 const pt=pointColors[pcIdx];if(!pt)return;
 matchPointToTarget(pt,$('pc-target').value);
 syncPointUI();draw();
 showToast('Matched picked colour to target colour!',1500);
};
$('pc-skin-presets').onclick=e=>{
 const b=e.target.closest('[data-skin]');if(!b)return;
 const pt=pointColors[pcIdx];if(!pt){showToast('Pick a colour on the photo first',1500);return}
 matchPointToTarget(pt,b.dataset.skin);
 syncPointUI();draw();
 showToast(`Converted to ${b.textContent} tone — tweak Range or Variance to refine`,1800);
};
for(const [id,key] of [['pc-hue','hue'],['pc-sat','sat'],['pc-lum','lum'],['pc-var','variance'],['pc-range','range']]){
 $(id).oninput=e=>{
  const pt=pointColors[pcIdx];if(!pt)return;
  pt[key]=+e.target.value;
  syncPointUI();draw();
 };
}
$('pc-viz').onchange=e=>{pcViz=e.target.checked;draw()};
$('pc-on').onchange=e=>{const pt=pointColors[pcIdx];if(pt){pt.on=e.target.checked;syncPointUI();draw()}};
$('pc-reset').onclick=()=>{
 const pt=pointColors[pcIdx];if(!pt)return;
 pt.hue=0;pt.sat=0;pt.lum=0;pt.variance=55;pt.range=52;pcViz=false;
 syncPointUI();draw();
};

// Canvas Eyedropper Handler for Pick WB & Point Color Pick (in Grade tab)
c.addEventListener('pointerdown',e=>{
 if(tab!=='grade'||!base||spaceDown||e.button!==0||(!wbPicking&&!pcPicking))return;
 e.preventDefault();e.stopImmediatePropagation();
 const [px0,py0]=pos(e),src=$('lgrade').checked&&layers.length?flat():base;
 let r=0,g=0,b=0,n=0;
 const cx=Math.floor(px0),cy=Math.floor(py0);
 for(let yy=Math.max(0,cy-2);yy<=Math.min(H-1,cy+2);yy++)for(let xx=Math.max(0,cx-2);xx<=Math.min(W-1,cx+2);xx++){
  const i=(yy*W+xx)*4;if(src.data[i+3]<32)continue;
  r+=src.data[i];g+=src.data[i+1];b+=src.data[i+2];n++;
 }
 if(!n)return;
 r=Math.round(r/n);g=Math.round(g/n);b=Math.round(b/n);
 if(wbPicking){
  const avg=(r+g+b)/3;
  basic.temp=Math.round(clamp((b-r)/Math.max(30,avg)*110,-100,100));
  basic.tint=Math.round(clamp(((r+b)/2-g)/Math.max(30,avg)*110,-100,100));
  wbPicking=false;$('lr-wb').value='custom';
  syncBasicUI();draw();showToast(`White balanced from ${hex(r,g,b)}`,1400);return;
 }
 if(pcPicking){
  const sampledHex=hex(r,g,b);
  if(pcIdx<0||!pointColors[pcIdx]){
   pointColors.push(makePointColor(sampledHex,'#d99f7c'));
   pcIdx=pointColors.length-1;
  }else{
   const pt=pointColors[pcIdx];
   pt.srcHex=sampledHex;[pt.sH,pt.sS,pt.sL]=rgbToHsl(r,g,b);
  }
  pcPicking=false;
  syncPointUI();draw();
  showToast(`Picked ${sampledHex} — click a Skin preset or Match colour!`,2000);
 }
},true);

/* ========== 3. Non-Destructive Real-Time Pro Develop + Point Color Pixel Engine ========== */
function pointColorIsActive(){
 return pointColors.some(pt=>pt.on&&(pt.hue||pt.sat||pt.lum||pcViz));
}
window.proDevelopActive=()=>basicIsActive()||pointColorIsActive();

window.applyProDevelop=function(im,isPreview,splitX,rawInput){
 const w=im.width,h=im.height,d=im.data;
 const useBasic=basicIsActive();
 const activePts=pointColors.filter(pt=>pt.on&&(pt.hue||pt.sat||pt.lum||(isPreview&&pcViz)));
 const vizPt=(isPreview&&pcViz)?pointColors[pcIdx]:null;

 // 1) Basic Develop: Texture / Clarity local-contrast pre-pass (only when needed!)
 let texBlur=null,claBlur=null;
 if(useBasic&&(basic.tex||basic.cla)){
  const srcCv=bc(w,h);srcCv.getContext('2d').putImageData(im,0,0);
  if(basic.tex){
   const tc=bc(w,h),tg=tc.getContext('2d');tg.filter='blur(1.4px)';tg.drawImage(srcCv,0,0);
   texBlur=tg.getImageData(0,0,w,h).data;
  }
  if(basic.cla){
   const cc=bc(w,h),cg=cc.getContext('2d');cg.filter='blur(7px)';cg.drawImage(srcCv,0,0);
   claBlur=cg.getImageData(0,0,w,h).data;
  }
 }

 const expGain=Math.pow(2,basic.exp*0.85);
 const rGain=1+(basic.temp*0.0042)+(basic.tint*0.0018);
 const gGain=1-(basic.tint*0.0038);
 const bGain=1-(basic.temp*0.0042)+(basic.tint*0.0018);
 const conF=1+basic.con/100*0.85;
 const hiF=basic.hi/100,shF=basic.sh/100,whF=basic.wh/100,blF=basic.bl/100;
 const texF=basic.tex/100*1.15,claF=basic.cla/100*0.75,dehF=basic.deh/100;
 const vibF=basic.vib/100,satF=1+basic.sat/100;

 for(let y=0;y<h;y++){
  const row=y*w;
  for(let x=0;x<w;x++){
   if(splitX&&x<splitX)continue;
   const idx=row+x,i=idx*4;
   if(!d[i+3])continue;
   const m=sel?sel[idx]/255:1;
   if(m===0)continue;
   const rOrig=d[i],gOrig=d[i+1],bOrig=d[i+2];
   let r=rOrig,g=gOrig,b=bOrig;

   if(useBasic){
    // Exposure & White Balance
    r*=expGain*rGain;g*=expGain*gGain;b*=expGain*bGain;
    // Texture & Clarity (local micro/midtone contrast)
    if(texBlur){r+=(rOrig-texBlur[i])*texF;g+=(gOrig-texBlur[i+1])*texF;b+=(bOrig-texBlur[i+2])*texF}
    if(claBlur){
     const l0=(r*.2126+g*.7152+b*.0722)/255,midW=4*l0*(1-l0);
     r+=(rOrig-claBlur[i])*claF*midW;g+=(gOrig-claBlur[i+1])*claF*midW;b+=(bOrig-claBlur[i+2])*claF*midW;
    }
    // Dehaze (dark channel lift + contrast + gentle sat boost)
    if(dehF){
     r=(r-dehF*22)*(1+dehF*0.26);g=(g-dehF*22)*(1+dehF*0.26);b=(b-dehF*22)*(1+dehF*0.26);
    }
    // Highlights, Shadows, Whites, Blacks tonal curves
    const lum=clamp((r*.2126+g*.7152+b*.0722)/255);
    let toneDelta=0;
    if(hiF)toneDelta+=hiF*Math.pow(clamp((lum-0.42)/0.58),1.4)*68;
    if(shF)toneDelta+=shF*Math.pow(clamp((0.58-lum)/0.58),1.4)*68;
    if(whF)toneDelta+=whF*Math.pow(clamp((lum-0.68)/0.32),1.8)*58;
    if(blF)toneDelta+=blF*Math.pow(clamp((0.32-lum)/0.32),1.8)*58;
    if(toneDelta){r+=toneDelta;g+=toneDelta;b+=toneDelta}
    // Contrast
    if(conF!==1){r=(r-128)*conF+128;g=(g-128)*conF+128;b=(b-128)*conF+128}
    r=clamp(r,0,255);g=clamp(g,0,255);b=clamp(b,0,255);
    // Vibrance (protects warm skin tones!) & Saturation / B&W
    if(basic.bw){
     const bw=r*.299+g*.587+b*.114;r=g=b=bw;
    }else{
     if(vibF){
      const mx=Math.max(r,g,b),mn=Math.min(r,g,b),s0=(mx-mn)/(mx||1);
      const skinProt=(r>g&&g>b&&r-b>18)?0.55:1;
      const boost=1+vibF*(1-s0)*0.85*skinProt;
      const l=r*.2126+g*.7152+b*.0722;
      r=l+(r-l)*boost;g=l+(g-l)*boost;b=l+(b-l)*boost;
     }
     if(satF!==1){
      const l=r*.2126+g*.7152+b*.0722;
      r=l+(r-l)*satF;g=l+(g-l)*satF;b=l+(b-l)*satF;
     }
    }
    r=clamp(r,0,255);g=clamp(g,0,255);b=clamp(b,0,255);
   }

   // 2) Point Color (Multi-point Luminance-Preserving Stage-Light / Skin Remapper)
   if(activePts.length){
    for(const pt of activePts){
     const [h0,s0,l0]=rgbToHsl(r,g,b);
     const hueSpan=12+pt.range*0.66;
     const satSpan=0.18+pt.range*0.0085;
     const lumSpan=0.30+pt.range*0.0115;
     const hd=Math.abs(shortestHueDelta(pt.sH,h0));
     const sd=Math.abs(s0-pt.sS);
     const ld=Math.abs(l0-pt.sL);
     let w= (1-ss(hueSpan*0.24,hueSpan,hd)) * (1-ss(satSpan*0.24,satSpan,sd)) * (1-ss(lumSpan*0.16,lumSpan,ld));
     if(pt.sS>0.18)w*=ss(0.04,0.16,s0);
     if(vizPt&&pt===vizPt){
      // Lightroom Visualize Range overlay: dim unmatched pixels to monochrome, keep matched pixels vivid!
      const gray=(r*.2126+g*.7152+b*.0722)*0.68;
      if(w>0.01){
       const [nr,ng,nb]=remapPointPixel(r,g,b,h0,s0,l0,pt,w);
       r=gray+(nr-gray)*Math.min(1,w*1.35);
       g=gray+(ng-gray)*Math.min(1,w*1.35);
       b=gray+(nb-gray)*Math.min(1,w*1.35);
      }else{r=g=b=gray}
      continue;
     }
     if(w>0.004){
      [r,g,b]=remapPointPixel(r,g,b,h0,s0,l0,pt,w);
     }
    }
   }

   if(m<1){r=rOrig+(r-rOrig)*m;g=gOrig+(g-gOrig)*m;b=bOrig+(b-bOrig)*m}
   d[i]=clamp(r,0,255);d[i+1]=clamp(g,0,255);d[i+2]=clamp(b,0,255);
  }
 }
};

function remapPointPixel(r,g,b,h0,s0,l0,pt,w){
 // Blend relative shift with unified target chromaticity based on Variance (crucial for concert red-light -> skin recovery!)
 const v=clamp(pt.variance/100);
 const targetH=(pt.sH+pt.hue+360)%360;
 const targetS=clamp(pt.sS+pt.sat/100,0,1);
 const relH=(h0+pt.hue+360)%360;
 const relS=clamp(s0+pt.sat/100,0,1);
 const newH=(relH+shortestHueDelta(relH,targetH)*v+360)%360;
 const newS=relS+(targetS-relS)*v;
 // Preserve facial shading & micro-detail while shifting luminance smoothly
 const newL=clamp(l0+(pt.lum/100)*0.42*(0.35+0.65*(1-Math.abs(l0*2-1))),0.02,0.98);
 const [tr,tg,tb]=hslToRgb(newH,newS,newL);
 // Re-anchor perceived luminance slightly toward original shading so skin never looks flat/plastic!
 const origLum=r*.2126+g*.7152+b*.0722;
 const newLum=tr*.2126+tg*.7152+tb*.0722;
 const desiredLum=clamp(origLum+pt.lum*0.65,0,255);
 const lumFix=(desiredLum-newLum)*0.45;
 const rr=clamp(tr+lumFix,0,255),gg=clamp(tg+lumFix,0,255),bb=clamp(tb+lumFix,0,255);
 return [r+(rr-r)*w,g+(gg-g)*w,b+(bb-b)*w];
}

/* ========== 4. 8-Dot Visual Color Mixer Ring Bar ========== */
const HSL_DOT_COLORS=['#ef4444','#f97316','#eab308','#22c55e','#14b8a6','#3b82f6','#8b5cf6','#ec4899'];
const hslDots=$('hsl-dots');
function buildHslDots(){
 if(!hslDots)return;
 hslDots.replaceChildren();
 const bandSel=$('hsl-band');
 [...bandSel.options].forEach((opt,i)=>{
  const b=document.createElement('button');b.type='button';b.className='hsl-dot';
  b.style.setProperty('--dot',HSL_DOT_COLORS[i]||'#94a3b8');
  b.title=opt.textContent;b.setAttribute('aria-label',opt.textContent+' band');
  b.dataset.band=i;
  b.onclick=()=>{bandSel.value=String(i);bandSel.dispatchEvent(new Event('change'));syncHslDots()};
  hslDots.append(b);
 });
 syncHslDots();
}
function syncHslDots(){
 if(!hslDots)return;
 const cur=+$('hsl-band').value;
 hslDots.querySelectorAll('.hsl-dot').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.band===cur)));
}
$('hsl-band').addEventListener('change',syncHslDots);
buildHslDots();

/* ========== 5. Lightroom 3-Up Color Grading Wheels (Midtones / Shadows / Highlights) ========== */
let miniWheelTex=null;
function getMiniWheelTex(size){
 if(miniWheelTex&&miniWheelTex.width===size)return miniWheelTex;
 const cv=bc(size,size),g=cv.getContext('2d'),im=g.createImageData(size,size),center=size/2,r=center-6;
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const dx=x-center,dy=center-y,dist=Math.hypot(dx,dy)/r;if(dist>1)continue;
  const h=(Math.atan2(dy,dx)*180/Math.PI+360)%360;
  const [R,G,B]=hslToRgb(h,Math.min(1,dist),0.52-0.12*dist);
  const i=4*(y*size+x);
  im.data[i]=R;im.data[i+1]=G;im.data[i+2]=B;im.data[i+3]=Math.round(255*(1-ss(0.95,1,dist)));
 }
 g.putImageData(im,0,0);miniWheelTex=cv;return cv;
}
function drawAllThreeWheels(grade){
 const gr=grade||film?.getGrade?.();if(!gr)return;
 document.querySelectorAll('.lr-mini-wheel').forEach(cv=>{
  const zName=cv.dataset.wzone,z=gr.zones?.[zName]||{hue:0,sat:0,lum:0};
  const g=cv.getContext('2d'),s=cv.width,c0=s/2,r=c0-6;
  g.clearRect(0,0,s,s);
  g.drawImage(getMiniWheelTex(s),0,0);
  // Dark-navy center reticle & inner ring
  g.strokeStyle='rgba(255,255,255,0.32)';g.lineWidth=1;
  g.beginPath();g.arc(c0,c0,r*0.5,0,Math.PI*2);g.stroke();
  g.beginPath();g.arc(c0,c0,r,0,Math.PI*2);g.stroke();
  g.beginPath();g.moveTo(c0-5,c0);g.lineTo(c0+5,c0);g.moveTo(c0,c0-5);g.lineTo(c0,c0+5);g.stroke();
  // Active color pip
  const th=z.hue*Math.PI/180,px=c0+Math.cos(th)*r*(z.sat/100),py=c0-Math.sin(th)*r*(z.sat/100);
  g.beginPath();g.moveTo(c0,c0);g.lineTo(px,py);g.strokeStyle='rgba(255,255,255,0.55)';g.lineWidth=1.5;g.stroke();
  g.beginPath();g.arc(px,py,5.5,0,Math.PI*2);
  g.fillStyle=z.sat>1?`hsl(${z.hue} 85% 58%)`:'#ffffff';g.fill();
  g.lineWidth=2;g.strokeStyle='#050c1f';g.stroke();
  g.lineWidth=1.5;g.strokeStyle='#ffffff';g.stroke();
 });
 document.querySelectorAll('.lr-mini-lum').forEach(inp=>{
  const z=gr.zones?.[inp.dataset.wzone];if(z&&document.activeElement!==inp)inp.value=z.lum||0;
 });
}

document.querySelectorAll('.lr-mini-wheel').forEach(cv=>{
 const zName=cv.dataset.wzone;
 let dragging=false;
 const updateFromEvent=(e,fin=false)=>{
  const rect=cv.getBoundingClientRect(),cx=rect.left+rect.width/2,cy=rect.top+rect.height/2,rad=rect.width/2-6;
  const dx=e.clientX-cx,dy=cy-e.clientY;
  const hue=Math.round((Math.atan2(dy,dx)*180/Math.PI+360)%360);
  const sat=Math.round(Math.min(1,Math.hypot(dx,dy)/rad)*100);
  film?.setZone?.(zName,{hue,sat},fin);
 };
 cv.onpointerdown=e=>{if(e.button!==0)return;dragging=true;cv.setPointerCapture(e.pointerId);updateFromEvent(e,false)};
 cv.onpointermove=e=>{if(dragging)updateFromEvent(e,false)};
 cv.onpointerup=cv.onpointercancel=e=>{if(!dragging)return;dragging=false;updateFromEvent(e,true)};
 cv.ondblclick=()=>{film?.setZone?.(zName,{hue:0,sat:0,lum:0},true);showToast(`Reset ${zName} wheel`,1000)};
});
document.querySelectorAll('.lr-mini-lum').forEach(inp=>{
 const zName=inp.dataset.wzone;
 inp.oninput=()=>film?.setZone?.(zName,{lum:+inp.value},false);
 inp.onchange=inp.onblur=()=>film?.finishGradeEdit?.();
 inp.ondblclick=()=>{inp.value=0;film?.setZone?.(zName,{lum:0},true)};
});
$('lr-wheel-mode-bar').onclick=e=>{
 const b=e.target.closest('[data-wmode]');if(!b)return;
 const is3up=b.dataset.wmode==='3up';
 $('lr-wheel-mode-bar').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));
 $('lr-wheels-3up').hidden=!is3up;$('lr-wheel-single').hidden=is3up;
 if(is3up)drawAllThreeWheels();
};

window.onSyncGrade=grade=>{syncHslDots();drawAllThreeWheels(grade)};

// Reset Basic & Point Color cleanly when user hits global "Reset look" or loads a new photo
$('rlook').addEventListener('click',()=>{
 basic={...BASIC_DEFAULTS};pointColors=[];pcIdx=-1;pcViz=false;wbPicking=false;pcPicking=false;
 $('lr-wb').value='custom';syncBasicUI();syncPointUI();
});

// Register in Tool Finder (/ and Ctrl+K)
toolCommands.push(
 ['Basic Develop (Exposure / Highlights / Shadows / Clarity / Dehaze / HDR)','grade','lr-basic','lightroom basic auto bw hdr temp tint texture vibrance whites blacks'],
 ['Point Color · Stage Light & Skin Tone Fix','grade','lr-point-color','point color concert red light skin tone recovery remap hue shift range visualize'],
 ['3-Up Color Grading Wheels (Shadows / Midtones / Highlights)','grade','lr-wheels-3up','color grading wheels 3-way shadows midtones highlights balance blending']
);

syncBasicUI();syncPointUI();drawAllThreeWheels();
enhanceSliders($('lr-basic'));
enhanceSliders($('lr-point-color'));
})();
