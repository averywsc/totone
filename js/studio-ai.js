/* Totone On-Device AI Studio — Neural Background Removal (RMBG-1.4 / MODNet via Transformers.js), AI Depth Anything V2 Portrait Bokeh, and QR Code Generator */
(function(){
let tfModPromise=null,rmbgPromise=null,modnetPromise=null,depthPromise=null;
let aiBusy=false,lastDepthCache=null;

function loadTransformers(){
 if(!tfModPromise){
  tfModPromise=import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.3.3/+esm').then(mod=>{
   if(mod.env){mod.env.allowLocalModels=false}
   return mod;
  }).catch(e=>{tfModPromise=null;throw e});
 }
 return tfModPromise;
}

function setProg(wrapId,barId,pct){
 const w=$(wrapId),b=$(barId);if(!w||!b)return;
 if(pct==null){w.hidden=true;b.style.width='0%';return}
 w.hidden=false;b.style.width=Math.max(4,Math.min(100,Math.round(pct)))+'%';
}

function ensureTargetLayerForAI(){
 if(!base){showToast('Open an image first',1600);return null}
 let targetLayer=active;
 if($('rmbg-target').value==='base'||!targetLayer){
  if(!targetLayer){
   pushU(mkSnap('all'));
   const cv=bc(W,H),d=new ImageData(new Uint8ClampedArray(base.data),W,H);cv.getContext('2d').putImageData(d,0,0);
   targetLayer={name:'Subject',cv,d,o:null,x:W/2,y:H/2,s:1,r:0,op:1,bm:'source-over',vis:true,fl:false,lk:false,ct:0,cb:0,cl:0,cr:0};
   layers.unshift(targetLayer);active=targetLayer;base.data.fill(0);
  }
 }
 if(targetLayer.lk){showToast('Unlock the selected layer first',1500);return null}
 return targetLayer;
}

async function runNeuralRMBG(targetLayer,modelChoice){
 const statusEl=$('rmbg-status');
 const w=targetLayer.cv.width,h=targetLayer.cv.height;
 statusEl.textContent='Loading AI engine (cached after first use)…';
 setProg('rmbg-prog-wrap','rmbg-prog-bar',8);
 const {AutoModel,AutoProcessor,RawImage,pipeline}=await loadTransformers();

 // Feed clean PNG data URL to RawImage
 const dataUrl=targetLayer.cv.toDataURL('image/png');
 const rawImg=await RawImage.fromURL(dataUrl);
 const progCb=info=>{
  if(info?.status==='progress'&&Number.isFinite(info.progress)){
   const p=Math.round(info.progress);
   setProg('rmbg-prog-wrap','rmbg-prog-bar',10+p*0.72);
   statusEl.textContent=`Downloading ${modelChoice==='ai-rmbg'?'RMBG-1.4':'MODNet'} weights… ${p}%`;
  }
 };

 let alphaBytes=null;
 if(modelChoice==='ai-rmbg'){
  if(!rmbgPromise){
   rmbgPromise=(async()=>{
    const model=await AutoModel.from_pretrained('briaai/RMBG-1.4',{
     config:{model_type:'custom'},progress_callback:progCb
    });
    const processor=await AutoProcessor.from_pretrained('briaai/RMBG-1.4',{
     config:{
      do_normalize:true,do_pad:false,do_rescale:true,do_resize:true,
      image_mean:[0.5,0.5,0.5],feature_extractor_type:'ImageFeatureExtractor',
      image_std:[1,1,1],resample:2,rescale_factor:0.00392156862745098,
      size:{width:1024,height:1024}
     }
    });
    return {model,processor};
   })().catch(e=>{rmbgPromise=null;throw e});
  }
  const {model,processor}=await rmbgPromise;
  statusEl.textContent='Running RMBG-1.4 neural segmentation…';
  setProg('rmbg-prog-wrap','rmbg-prog-bar',86);
  const {pixel_values}=await processor(rawImg);
  const {output}=await model({input:pixel_values});
  const maskRaw=await RawImage.fromTensor(output[0].mul(255).to('uint8')).resize(w,h);
  alphaBytes=maskRaw.data;
 }else{
  if(!modnetPromise){
   modnetPromise=pipeline('image-segmentation','Xenova/modnet',{progress_callback:progCb})
    .catch(e=>{modnetPromise=null;throw e});
  }
  const seg=await modnetPromise;
  statusEl.textContent='Running MODNet portrait segmentation…';
  setProg('rmbg-prog-wrap','rmbg-prog-bar',86);
  const out=await seg(rawImg);
  const maskObj=Array.isArray(out)?out[0]?.mask:out?.mask;
  if(!maskObj)throw Error('No mask returned by MODNet.');
  const resized=await maskObj.resize(w,h);
  alphaBytes=resized.data;
 }

 setProg('rmbg-prog-wrap','rmbg-prog-bar',96);
 const maskCv=bc(w,h),mg=maskCv.getContext('2d'),mim=mg.createImageData(w,h);
 const stride=alphaBytes.length===w*h*4?4:1;
 const sensBias=(+$('rmbg-sens').value-48)*0.65;
 for(let i=0;i<w*h;i++){
  const rawA=alphaBytes[i*stride];
  const adjA=Math.max(0,Math.min(255,Math.round(rawA-sensBias)));
  const j=i*4;
  mim.data[j]=mim.data[j+1]=mim.data[j+2]=255;
  mim.data[j+3]=adjA;
 }
 mg.putImageData(mim,0,0);

 // Optional edge halo decontamination on semi-transparent boundary pixels
 if($('rmbg-decontam')?.checked){
  const src=targetLayer.d.data;
  let br=0,bg=0,bb=0,bn=0;
  for(let i=0;i<w*h;i+=7){if(mim.data[i*4+3]<24){const j=i*4;br+=src[j];bg+=src[j+1];bb+=src[j+2];bn++}}
  if(bn>10){
   br/=bn;bg/=bn;bb/=bn;
   for(let i=0;i<w*h;i++){
    const a=mim.data[i*4+3];
    if(a>12&&a<235){
     const j=i*4,pull=(1-a/255)*0.32;
     src[j]=Math.max(0,Math.min(255,Math.round(src[j]+(src[j]-br)*pull)));
     src[j+1]=Math.max(0,Math.min(255,Math.round(src[j+1]+(src[j+1]-bg)*pull)));
     src[j+2]=Math.max(0,Math.min(255,Math.round(src[j+2]+(src[j+2]-bb)*pull)));
    }
   }
   syncL(targetLayer);
  }
 }

 const feath=+$('rmbg-feath').value;
 if(feath>0){
  const smoothCv=bc(w,h),sg=smoothCv.getContext('2d');
  sg.filter=`blur(${feath}px)`;sg.drawImage(maskCv,0,0);
  replaceMask(smoothCv);
 }else replaceMask(maskCv);

 setProg('rmbg-prog-wrap','rmbg-prog-bar',null);
 $('rmbg-next').hidden=false;
 statusEl.textContent=`AI cutout complete (${modelChoice==='ai-rmbg'?'RMBG-1.4':'MODNet'})! Non-destructive Layer Mask applied.`;
 showToast('AI Background Removed!',1800);
}

// Wrap existing offline remover so both AI Neural and Instant Offline work seamlessly from #rmbg-smart!
const offlineRemoveBg=window.runSmartBackgroundRemover;
async function runUnifiedRemoveBg(){
 if(aiBusy)return;
 const mode=$('rmbg-mode')?.value||'ai-rmbg';
 if(mode!=='ai-rmbg'&&mode!=='ai-modnet'){
  offlineRemoveBg?.();
  if(active?.mask)$('rmbg-next').hidden=false;
  return;
 }
 const targetLayer=ensureTargetLayerForAI();
 if(!targetLayer)return;
 aiBusy=true;$('rmbg-smart').disabled=true;
 try{
  await runNeuralRMBG(targetLayer,mode);
 }catch(e){
  setProg('rmbg-prog-wrap','rmbg-prog-bar',null);
  $('rmbg-status').textContent='AI model unavailable ('+(e?.message||'offline')+'). Running instant offline cutout…';
  offlineRemoveBg?.();
  if(active?.mask)$('rmbg-next').hidden=false;
 }finally{
  aiBusy=false;$('rmbg-smart').disabled=false;
 }
}
window.runSmartBackgroundRemover=runUnifiedRemoveBg;
$('rmbg-smart').onclick=runUnifiedRemoveBg;

// Post-Cutout Quick-Link Actions (connects BG Remover seamlessly to Outline, Shadow, Background, Frames!)
if($('rmbg-next')){
 $('rmbg-next').onclick=e=>{
  const b=e.target.closest('[data-rn]');if(!b)return;
  const cmd=b.dataset.rn;
  if(cmd==='outline'&&active){
   pushU(mkSnap('p'));active.ol={w:Math.max(6,Math.round(Math.min(W,H)*0.014)),c:'#ffffff'};
   refreshLayers();draw();showToast('Added white die-cut sticker outline!',1500);
  }else if(cmd==='shadow'&&active){
   pushU(mkSnap('p'));active.sh={x:0,y:16,b:28,a:0.55,c:'#000000'};
   refreshLayers();draw();showToast('Added studio drop shadow!',1400);
  }else if(cmd==='swapbg'){
   jumpTool('design','bg-fill-mode');showToast('Pick a new background colour/gradient or click Web elements',2000);
  }else if(cmd==='frame'){
   jumpTool('design','frame-grid');
  }
 };
}

/* ========== AI Depth Map & DSLR Portrait Bokeh (Depth Anything V2) ========== */
async function computeNeuralDepth(srcCv){
 const sig=srcCv.width+'x'+srcCv.height+':'+srcCv.getContext('2d').getImageData(srcCv.width>>1,srcCv.height>>1,1,1).data.join(',');
 if(lastDepthCache&&lastDepthCache.sig===sig)return lastDepthCache.depthData;
 const statusEl=$('depth-ai-status');
 statusEl.textContent='Loading Depth Anything V2 (cached after first use)…';
 setProg('depth-prog-wrap','depth-prog-bar',10);
 const {pipeline,RawImage}=await loadTransformers();
 if(!depthPromise){
  depthPromise=pipeline('depth-estimation','onnx-community/depth-anything-v2-small',{
   progress_callback:info=>{
    if(info?.status==='progress'&&Number.isFinite(info.progress)){
     const p=Math.round(info.progress);
     setProg('depth-prog-wrap','depth-prog-bar',12+p*0.72);
     statusEl.textContent=`Downloading Depth Anything V2… ${p}%`;
    }
   }
  }).catch(e=>{depthPromise=null;throw e});
 }
 const estimator=await depthPromise;
 statusEl.textContent='Estimating scene depth map…';
 setProg('depth-prog-wrap','depth-prog-bar',88);
 const rawImg=await RawImage.fromURL(srcCv.toDataURL('image/png'));
 const {depth}=await estimator(rawImg);
 const resized=await depth.resize(srcCv.width,srcCv.height);
 const w=srcCv.width,h=srcCv.height,d=resized.data,stride=d.length===w*h*4?4:1;
 const gray=new Uint8Array(w*h);
 for(let i=0;i<w*h;i++)gray[i]=d[i*stride];
 lastDepthCache={sig,depthData:gray};
 setProg('depth-prog-wrap','depth-prog-bar',null);
 return gray;
}

$('ai-depth-bokeh').onclick=async()=>{
 if(!base||aiBusy){if(!base)showToast('Open an image first',1400);return}
 aiBusy=true;$('ai-depth-bokeh').disabled=true;
 try{
  const srcCv=bc(W,H);render(false);srcCv.getContext('2d').drawImage(c,0,0);draw(true);
  const depth=await computeNeuralDepth(srcCv);
  const blurMax=+$('depth-blur-amt').value,focus=+$('depth-focus').value/100;
  // Build 2 progressive blur levels for smooth optical depth-of-field bokeh
  const b1=bc(W,H),g1=b1.getContext('2d');g1.filter=`blur(${Math.max(2,blurMax*0.45)}px)`;g1.drawImage(srcCv,0,0);
  const b2=bc(W,H),g2=b2.getContext('2d');g2.filter=`blur(${Math.max(4,blurMax)}px)`;g2.drawImage(srcCv,0,0);
  const sPix=srcCv.getContext('2d').getImageData(0,0,W,H).data;
  const p1=g1.getImageData(0,0,W,H).data,p2=g2.getImageData(0,0,W,H).data;
  const outCv=bc(W,H),og=outCv.getContext('2d'),oIm=og.createImageData(W,H),od=oIm.data;
  for(let i=0;i<W*H;i++){
   const dep=depth[i]/255,dist=Math.min(1,Math.abs(dep-focus)*2.2);
   const j=i*4;
   if(dist<0.12){od[j]=sPix[j];od[j+1]=sPix[j+1];od[j+2]=sPix[j+2];od[j+3]=sPix[j+3]}
   else if(dist<0.55){
    const t=(dist-0.12)/0.43;
    for(let k=0;k<3;k++)od[j+k]=sPix[j+k]+(p1[j+k]-sPix[j+k])*t;
    od[j+3]=sPix[j+3];
   }else{
    const t=(dist-0.55)/0.45;
    for(let k=0;k<3;k++)od[j+k]=p1[j+k]+(p2[j+k]-p1[j+k])*t;
    od[j+3]=sPix[j+3];
   }
  }
  og.putImageData(oIm,0,0);
  pushU(mkSnap('p'));
  const l={cv:outCv,d:oIm,o:null,lk:false,sh:null,ol:null,x:W/2,y:H/2,s:1,r:0,op:1,bm:'source-over',fl:false,vis:true,cl:0,ct:0,cr:0,cb:0,name:'AI Portrait Bokeh'};
  layers.push(l);active=l;refreshLayers();draw();
  $('depth-ai-status').textContent='Added AI Portrait Bokeh layer! Adjust Focus depth and re-run anytime (depth cached).';
  showToast('Applied AI Portrait Bokeh!',1700);
 }catch(e){
  setProg('depth-prog-wrap','depth-prog-bar',null);
  $('depth-ai-status').textContent='Depth AI failed: '+(e?.message||e);
 }finally{aiBusy=false;$('ai-depth-bokeh').disabled=false}
};

$('ai-depth-mask').onclick=async()=>{
 if(!base||aiBusy){if(!base)showToast('Open an image first',1400);return}
 const l=ensureTargetLayerForAI();if(!l)return;
 aiBusy=true;$('ai-depth-mask').disabled=true;
 try{
  const depth=await computeNeuralDepth(l.cv);
  const w=l.cv.width,h=l.cv.height,dcv=bc(w,h),dg=dcv.getContext('2d'),dim=dg.createImageData(w,h);
  for(let i=0;i<w*h;i++){const v=depth[i],j=i*4;dim.data[j]=dim.data[j+1]=dim.data[j+2]=v;dim.data[j+3]=255}
  dg.putImageData(dim,0,0);
  pushU(mkSnap('p'));l.depthMap=dcv;
  jumpTool('layers','mask-panel');
  $('layer-mask-kind').value='depth';$('layer-mask-kind').dispatchEvent(new Event('change'));
  $('depth-status').textContent='AI Depth Map ready! Adjust Dark/Light limits and click Add mask.';
  $('depth-ai-status').textContent='Saved AI Depth Map to layer mask panel!';
  showToast('AI Depth Map saved to Layer Mask!',1800);
 }catch(e){
  setProg('depth-prog-wrap','depth-prog-bar',null);
  $('depth-ai-status').textContent='Depth AI failed: '+(e?.message||e);
 }finally{aiBusy=false;$('ai-depth-mask').disabled=false}
};

/* ========== Custom QR Code Layer Generator (qrcode-generator CDN) ========== */
let qrScriptPromise=null;
$('qr-add').onclick=async()=>{
 const text=($('qr-text').value||'https://buymeacoffee.com/averyuwubaka').trim();
 if(!text){$('qr-text').focus();return}
 try{
  if(!window.qrcode){
   if(!qrScriptPromise)qrScriptPromise=new Promise((res,rej)=>{
    const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js';s.crossOrigin='anonymous';
    s.onload=res;s.onerror=()=>{qrScriptPromise=null;rej(Error('Could not load QR generator'))};document.head.appendChild(s);
   });
   await qrScriptPromise;
  }
  if(!base){
   const blank=bc(1080,1080),g0=blank.getContext('2d');g0.fillStyle='#0a1228';g0.fillRect(0,0,1080,1080);
   await load(new File([await toBlob(blank,'image/png')],'QR-Design.png',{type:'image/png'}));
  }
  const qr=window.qrcode(0,'M');qr.addData(text);qr.make();
  const count=qr.getModuleCount(),size=512,pad=32,cell=(size-pad*2)/count;
  const cv=bc(size,size),g=cv.getContext('2d');
  if(!$('qr-trans').checked){g.fillStyle=$('qr-bg').value;g.beginPath();g.roundRect(0,0,size,size,24);g.fill()}
  g.fillStyle=$('qr-fg').value;
  const rounded=$('qr-round').checked;
  for(let r=0;r<count;r++)for(let c2=0;c2<count;c2++){
   if(!qr.isDark(r,c2))continue;
   const x=pad+c2*cell,y=pad+r*cell;
   if(rounded){g.beginPath();g.roundRect(x+0.5,y+0.5,cell-1,cell-1,cell*0.35);g.fill()}
   else g.fillRect(x,y,Math.ceil(cell),Math.ceil(cell));
  }
  const d=g.getImageData(0,0,size,size);
  pushU(mkSnap('p'));
  const sc=Math.min(W*0.34/size,H*0.34/size);
  const l={cv,d,o:null,lk:false,sh:null,ol:null,x:W/2,y:H/2,s:sc,r:0,op:1,bm:'source-over',fl:false,vis:true,cl:0,ct:0,cr:0,cb:0,name:'QR Code'};
  layers.push(l);active=l;refreshLayers();draw();
  showToast('Added QR Code layer!',1400);
 }catch(e){showToast('QR failed: '+(e?.message||e),2200)}
};

toolCommands.push(
 ['AI Neural Background Remover (RMBG-1.4 / MODNet)','filters','rmbg-smart','withoutbg rembg rmbg modnet ai remove background cutout transparent hair'],
 ['AI Portrait Bokeh & Depth Map (Depth Anything V2)','filters','ai-depth-bokeh','depth anything ai bokeh portrait blur dslr background blur depth mask'],
 ['QR Code Generator','design','qr-text','qr code link url barcode scan canva']
);
enhanceSliders($('ai-depth-box'));
})();
