const $=id=>document.getElementById(id);
const c=$('c'),ctx=c.getContext('2d'),hyp=(a,b)=>Math.sqrt(a*a+b*b);
let film=null,suiteReady=false;
let cdirty=true,fcache=null,outIm=null,pickKey=false,ren=-1,guides=[],nudgeT=0,sel=null,tab="tone",showOrig=false,lasso=[],W=0,H=0,base=null,orig=null,edits=[],LUT=null,palette=[],blendImg=null,undoStack=[],maskIdx=-1,raf=0,stops=null;
const wd2=(r,g,b,f)=>{const m=(r+f[0])/2,x=r-f[0],y=g-f[1],z=b-f[2];return((2+m/256)*x*x+4*y*y+(2+(255-m)/256)*z*z)/3};
const wd=(r,g,b,f)=>{const m=(r+f[0])/2,x=r-f[0],y=g-f[1],z=b-f[2];return Math.sqrt(((2+m/256)*x*x+4*y*y+(2+(255-m)/256)*z*z)/3)};
const hex=(r,g,b)=>'#'+[r,g,b].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');
const rgb=h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16));
const P=`Silver gelatin|#050505,#f4f4f1;Hard mono|#000000,#ffffff;Faded mono|#1e1e1e,#d2d2ce;Lifted blacks|#2b2b2b,#f7f7f5;Low key|#000000,#6b6b6b,#d9d9d9;Newsprint|#1b1b1b,#e3dfd0;Photocopy|#111111,#f0f0f0;Graphite|#0c0d0f,#5a5f66,#e8eaed;Cyanotype|#04203c,#2f6f9f,#e9f2f6;Blueprint|#0a2a70,#e0eaff;Sepia|#2a190d,#a9764a,#ecd7ae;Selenium|#18141c,#7d6b86,#dad2dc;Platinum|#2a2523,#b9aca1,#f1ebe4;Riso blue|#1f33a6,#f3efe4;Riso pink|#e8467c,#f6efe2;Riso green|#00805a,#f3f0e2;Riso orange|#ff5f2e,#f4efe3;Teal and orange|#08232b,#2f7f87,#e8a15c,#fbe7c8;Bleach bypass|#101010,#7a7a74,#e8e6df;Noir blue|#02040a,#1d3557,#a8c0d6;Golden hour|#2a0f0a,#b5532a,#f7c673,#fff3d6;Neon night|#0b0620,#5b1a8a,#ff3d81,#ffd1e8;Matrix|#000800,#0a5c1c,#9dff9d;Amber CRT|#100600,#8a3c00,#ffc04d;Game Boy|#0f380f,#306230,#8bac0f,#9bbc0f;Infrared|#12001f,#c2185b,#ffb3c7,#ffffff;Thermal|#000000,#3a0ca3,#e5383b,#ffd60a,#ffffff;Vaporwave|#1a0b3d,#7b2cbf,#ff6ec7,#7df9ff;Mint ice|#0b2b2b,#3fb8a4,#e6fff7;Rust|#1b0e08,#8c3b1a,#e0a46c;Forest|#06130a,#1f5a35,#a9c98a;Deep sea|#00121f,#04567a,#7fd6e8;Dusk|#1c1233,#6a3d7c,#e8806a,#ffd9a0;Polaroid|#2d2a3a,#7e6d7a,#e9c9a5,#fff4e2;Kodak warm|#1a0f0a,#6e4a33,#d9a66a,#fbefd5;Fuji green|#0a1a14,#2f6b57,#b3d1b8,#f4f6ee;Tungsten|#0d0a06,#6b4412,#f2b24a,#fff0cc;Moonlight|#03060f,#27406b,#9db8e0,#f1f5ff;Candy|#3a1c71,#d76d77,#ffaf7b;Terminal red|#0a0000,#7a0c0c,#ff5a4d;Ember|#0a0000,#7a1f00,#ff7a1a,#ffe27a;Ink and paper|#14213d,#fdfaf0;Oxblood|#1a0509,#6d1a2a,#f0d9c8;Olive drab|#0f1408,#4b5a28,#d7d9a8;Lavender haze|#241b3a,#8a77c0,#f1e4f5;Desert|#2b1608,#b9703a,#f2d49b,#fff7e0;Arctic|#0c1b2a,#5f8fb5,#eef6fb;Poison|#0a0a00,#5e2a8c,#b6ff00;Coral reef|#0a2540,#ff6f61,#ffe0b5;Sunflower|#1a1200,#c28a00,#ffe066`.split(';').map(s=>{const[n,v]=s.split('|');return{n,s:v.split(',')}});
const hsl=(h,s,l)=>{const a=s*Math.min(l,1-l),f=n=>{const k=(n+h/30)%12;return l-a*Math.max(-1,Math.min(k-3,9-k,1))};return hex(f(0)*255,f(8)*255,f(4)*255)};
['Red','Orange','Yellow','Lime','Green','Mint','Cyan','Azure','Blue','Violet','Magenta','Rose'].forEach((n,i)=>{const h=i*30;P.push({n:n+' ink',s:[hsl(h,.6,.08),hsl(h,.55,.55),hsl(h,.4,.93)]},{n:n+' / complement',s:[hsl(h,.7,.1),hsl(h+180,.65,.6)]},{n:n+' pastel',s:[hsl(h,.4,.25),hsl(h,.7,.8),'#ffffff']},{n:n+' neon',s:['#000000',hsl(h,1,.5),'#ffffff']})});
P.push({n:'Negative',s:['#ffffff','#000000']},{n:'Sodium lamp',s:['#0a0600','#7a3d00','#ffb347','#fff1c9']});
`Midnight peach|#0b1026,#ffb199;Ocean sunset|#022b3a,#ffa07a;Plum cream|#2b0a3d,#ffe8d6;Forest mist|#0d2818,#e3f4e1;Ink coral|#0a1a3a,#ff7b6b;Cocoa sand|#2a1810,#f1dfc6;Navy gold|#0b1a33,#f5c542;Wine blush|#3a0a1a,#ffd6dd;Teal cream|#003b3b,#fff3d6;Violet lime|#2a0a5e,#c6ff3d;Charcoal mint|#1a1d21,#b9f5e0;Cherry ice|#6b0f1a,#e6f6ff;Deep blue amber|#06143a,#ffb000;Moss lilac|#1f3a1f,#e0d4ff;Espresso rose|#1d0e0b,#f4b6c2;Indigo sun|#1b1464,#ffd04d;Slate peach|#2a3340,#ffcfb3;Pine blush|#0f2f26,#ffc9d4;Mulberry sky|#3a0f3a,#9fd8ff;Jet orange|#0a0a0a,#ff7a00;Cobalt pink|#0033a0,#ffc2e0;Olive cream|#2f3a12,#f7f1d0;Rust teal|#8c2f0f,#9fe0d6;Aubergine mango|#2d0a2e,#ffc65c;Sunset trio|#1a0b3d,#e8506a,#ffd9a0;Aqua dusk|#06243a,#2ec4b6,#fff1c9;Berry cream|#2a0a3a,#d6336c,#fff0e0;Jungle|#04140c,#2d936c,#f2e6a0;Peach fuzz|#3a1c3a,#ff8e7a,#fff2d9;Electric|#0a0033,#4a2cff,#a8fff0;Lagoon|#001f3f,#00a6a6,#f8ffe5;Tangerine|#2b0f00,#ff7a1a,#ffe9b8;Rose gold|#2a1520,#e0a1a8,#fff0e6;Moody blue|#0a1020,#3d5a80,#e0fbfc;Autumn|#2b1200,#b5532a,#f2c14e;Cotton candy|#3b1a5a,#ff8fc8,#c9f0ff;Lemon lime|#0b2a1a,#7bd957,#fff89a;Smoke|#101214,#7a808a,#f5f2ec;Ultraviolet|#14003a,#8a2be2,#ff9ef5;Copper sea|#04202a,#c2703d,#f6e7cf;Cherry cola|#1a0505,#b3202a,#f2d7c9;Mint choc|#2a1a12,#6fcfb0,#f4fff8;Dune|#3a2410,#d9a066,#fff3de;Glacier|#0b2540,#7ec8e3,#ffffff;Sakura|#3a1030,#f78fb3,#fff5f8;Volcano|#0a0000,#d62828,#fcbf49;Lilac mist|#231942,#9d8df1,#f4eefc;Pistachio|#1f2d1a,#93c47d,#fdf6e3`.split(';').forEach(t=>{const[n,v]=t.split('|');P.push({n,s:v.split(',')})});
const POSTERS = [
  ['Marigold', '#101010', '#ffbd18'], ['Pool blue', '#091620', '#129de3'],
  ['Bubblegum', '#170e17', '#ed55a0'], ['Limeade', '#11170d', '#b0d847'],
  ['Tangerine', '#241019', '#ff743a'], ['Ultraviolet', '#19112a', '#b194ff'],
  ['Vermilion', '#1c1014', '#ff5149'], ['Sea glass', '#0c232a', '#64e7c2'],
  ['Midnight lemon', '#22274f', '#fff17b'], ['Plum sorbet', '#50204c', '#ffc7b2'],
  ['Cobalt cream', '#1833a1', '#fff3c9'], ['Cherry blossom', '#8b183c', '#ffd8e9'],
  ['Petrol peach', '#144545', '#ffbd91'], ['Espresso ice', '#432e27', '#bcebff'],
  ['After hours', '#340a57', '#ff915d'], ['Blue orchid', '#263b72', '#e2baff']
].map(([n,ink,paper]) => ({n, s:[ink,paper], map:{curve:'steps',mid:40}, poster:true}));
const printPalettes=[
  ['Prussian apricot','#092e50','#ffbd83'], ['Night ferry','#10253f','#9bede4'],
  ['Brick vellum','#743426','#fff1c8'], ['Sour cherry','#48122c','#ff936d'],
  ['Fig leaf','#263930','#e2eaa6'], ['Denim chalk','#264462','#f0ede4'],
  ['Acid plum','#491547','#d9ff82'], ['Porcelain rose','#582e56','#fee0ec'],
  ['Oxide blue','#294c64','#f8a474'], ['Pine pollen','#183a33','#fbd268'],
  ['Carbon lilac','#242334','#ccbaff'], ['Radio coral','#25224f','#ff796c'],
  ['Bitter orange','#492622','#ffab3f'], ['Indigo frost','#28265e','#b6ecff'],
  ['Red lacquer','#690e2d','#ffb5a1'], ['Bottle glass','#0d4946','#c5f8c1'],
  ['Salt marsh','#193c48','#7ca990','#f7ecd3'], ['Amber negative','#211e36','#bb6546','#ffe5a3'],
  ['Blue enamel','#152740','#447ca8','#ffebbc'], ['Orchid smoke','#2e2540','#a178a6','#ffdfd3'],
  ['Cypress clay','#173f39','#be7856','#fce7bc'], ['Sea holly','#162f40','#618f9c','#edddf2'],
  ['Peony print','#3e2142','#cc5771','#fff1ca'], ['Tea stain','#332d35','#ac805b','#f6e8c3'],
  ['Cinema dusk','#181d38','#613b66','#d47979','#ffddad'],
  ['Verdigris foil','#192e34','#42766d','#a0b07b','#ffe8ae'],
  ['Winter chrome','#172137','#365773','#a5b4c7','#f6eddb'],
  ['Ember wash','#271528','#852e49','#ed763f','#ffd173','#ffefc7']
];
const screenPrints=[
  {n:'Metro ticket',s:['#20273d','#e45d46','#ffdf9d'],pos:[0,43,100]},
  {n:'Surf club',s:['#143956','#3eaaa2','#fff0bc'],pos:[0,57,100]},
  {n:'Record sleeve',s:['#24182e','#aa3c69','#ff954f','#ffe7ac'],pos:[0,35,68,100]},
  {n:'Botanical plate',s:['#193536','#58826a','#b6c880','#faf0c9'],pos:[0,47,76,100]}
];
const tidePalettes=[
  ['Tidal ink','#102d40','#7be2cd'],['Pacific glass','#10464f','#d8ffec'],
  ['Saltwater taffy','#5d2858','#ffbdc5'],['Night swim','#161c40','#65b6ff'],
  ['Kelp print','#1e322f','#bbce6e'],['Lifeguard red','#721d29','#ffc399'],
  ['Harbour fog','#24354f','#acbdd9'],['Pearl shell','#513f5b','#ffe0c3'],
  ['Blue grotto','#092a42','#126e89','#99e9d4'],['Wet sand','#23333b','#9a8774','#fff1ce'],
  ['Rock pool','#132329','#497b66','#c9e1b8'],['Sea fan','#351c4d','#c05272','#ffc7ad'],
  ['Tidal chart','#18233c','#346b86','#7ebca6','#e6eac8'],
  ['Coral atoll','#152d46','#217984','#eb9979','#fff1bc'],
  ['Deep pelagic','#0c142d','#233d68','#317d90','#92d5ae','#f4f0ca'],
  ['Beach bonfire','#251c36','#703853','#d66a4f','#f4bd78','#fff0cd']
];
P.push(...POSTERS,
  ...tidePalettes.map(([n,...s])=>({n,s,map:{curve:'oklab'}})),
  ...printPalettes.map(([n,...s])=>({n,s,map:{curve:'oklab'}})),
  ...screenPrints.map(p=>({...p,map:{curve:'steps',mid:50}})));
const isMono=a=>a.every(h=>{const c=rgb(h);return Math.abs(c[0]-c[1])<14&&Math.abs(c[1]-c[2])<14});
const toneCategory=p=>isMono(p.s)?'mono':p.s.length>3?'multi':p.s.length===3?'trio':'duo';
const categoryOrder={mono:0,multi:1,trio:2,duo:3};
P.sort((a,b)=>categoryOrder[toneCategory(a)]-categoryOrder[toneCategory(b)]);
const BASEN=P.length;
try {
  const saved=JSON.parse(localStorage.getItem('totone:mine')||'[]');
  if (Array.isArray(saved)) P.push(...saved.filter(p=>typeof p?.n==='string' && Array.isArray(p.s) && p.s.length>=2 && p.s.every(colour=>/^#[0-9a-f]{6}$/i.test(colour))));
} catch {}

let pcat='all';
const catOk=(p,i)=>pcat==='all'||(pcat==='mine'?i>=BASEN:i<BASEN&&toneCategory(p)===pcat);
let cur=-1;
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function presetSwatch(p){
  if(p.map?.curve!=='steps')return p.s.join(',');
  const positions=p.pos||p.s.map((_,i)=>i/(p.s.length-1)*100);
  const gamma=Math.log(.5)/Math.log((p.map.mid||50)/100);
  const bands=[p.s[0]];
  for(let i=1;i<p.s.length;i++){
    const boundary=(100*((positions[i-1]+positions[i])/200)**(1/gamma)).toFixed(2)+'%';
    bands.push(p.s[i-1]+' '+boundary,p.s[i]+' '+boundary);
  }
  return bands.join(',');
}
const presetLabels={mono:'Mono',multi:'Multi',trio:'Trio',duo:'Duo',mine:'Mine'};
function showP(q=''){
  const rows=[];let previous='';
  P.forEach((p,i)=>{
    const group=i>=BASEN?'mine':toneCategory(p);
    if(!catOk(p,i)||!p.n.toLowerCase().includes(q.trim()))return;
    if(pcat==='all'&&group!==previous){
      rows.push(`<div class="preset-heading" role="heading" aria-level="4">${presetLabels[group]}</div>`);
      previous=group;
    }
    rows.push(`<button class="p${i===cur?' on':''}" data-i="${i}" aria-pressed="${i===cur}"><i style="background:linear-gradient(90deg,${presetSwatch(p)})"></i>${esc(p.n)}</button>`);
  });
  if(film&&(pcat==='all'||pcat==='film')){
    const looks=film.filmRows(q);if(looks)rows.push('<div class="preset-heading">Film looks</div>'+looks);
  }
  $('plist').innerHTML=rows.join('')||'<p class="note">No matching presets.</p>';
}
$('q').oninput=e=>{showP(e.target.value.toLowerCase());$('plist').scrollTop=0};
$('plist').onclick=e=>{const look=e.target.closest('[data-film]');if(look){film.openRecipe(+look.dataset.film);return}const b=e.target.closest('.p');if(b){if(base)pushU(toneSnapshot());cur=+b.dataset.i;setMapSettings(P[cur].map);setStops(P[cur].s,P[cur].pos);showP($('q').value.toLowerCase());$('plist').querySelector('.on')?.focus({preventScroll:true})}};
showP();
function rot(o,a){const s=Math.sin(a),k=Math.cos(a);return[o.cx+o.ox*k-o.oy*s,o.cy+o.ox*s+o.oy*k]}
const MODES=[],add=(n,f,k)=>MODES.push([n,f,k]),S=Math.sin,C=Math.cos;
for(const[n,k]of[['light',.8],['',1.5],['heavy',3]])add('Push '+n,o=>[o.x-o.dx*o.f*k,o.y-o.dy*o.f*k]);
for(const[n,k]of[['soft',.2],['medium',.45],['strong',.9]]){add('Bloat '+n,o=>[o.x-o.ox*o.f*k,o.y-o.oy*o.f*k]);add('Pinch '+n,o=>[o.x+o.ox*o.f*k,o.y+o.oy*o.f*k])}
for(const[n,k]of[['gentle',.12],['medium',.3],['tight',.7]]){add('Swirl left, '+n,o=>rot(o,-o.f*k));add('Swirl right, '+n,o=>rot(o,o.f*k))}
for(const[n,k]of[['broad',.05],['medium',.12],['fine',.3]]){add('Wave across, '+n,o=>[o.x+S(o.oy*k)*o.f*14,o.y]);add('Wave down, '+n,o=>[o.x,o.y+S(o.ox*k)*o.f*14]);add('Ripple rings, '+n,o=>[o.x+o.ox/(o.d+1)*S(o.d*k)*o.f*14,o.y+o.oy/(o.d+1)*S(o.d*k)*o.f*14])}
for(const[n,k]of[['a little',.3],['a lot',.8]]){add('Stretch wide, '+n,o=>[o.x-o.ox*o.f*k,o.y]);add('Stretch tall, '+n,o=>[o.x,o.y-o.oy*o.f*k])}
for(const[n,k]of[['light',8],['medium',24],['heavy',60]])add('Scatter, '+n,o=>[o.x+(Math.random()-.5)*o.f*k,o.y+(Math.random()-.5)*o.f*k]);
add('Shear sideways',o=>[o.x-o.oy*o.f*.6,o.y]);add('Shear upright',o=>[o.x,o.y-o.ox*o.f*.6]);
add('Melt down',o=>[o.x,o.y-o.f*12]);add('Lift up',o=>[o.x,o.y+o.f*12]);
add('Whirlpool',o=>rot({...o,ox:o.ox*(1+o.f*.4),oy:o.oy*(1+o.f*.4)},o.f*.5));add('Vortex out',o=>rot({...o,ox:o.ox*(1-o.f*.4),oy:o.oy*(1-o.f*.4)},-o.f*.5));
add('Mirror left to right',o=>[o.cx+Math.abs(o.ox)*(o.f>.05?1:Math.sign(o.ox)),o.y]);add('Mirror top to bottom',o=>[o.x,o.cy+Math.abs(o.oy)*(o.f>.05?1:Math.sign(o.oy))]);
for(const[n,k]of[['small',6],['large',16]])add('Mosaic, '+n,o=>o.f>.03?[Math.floor(o.x/k)*k,Math.floor(o.y/k)*k]:[o.x,o.y]);
add('Turbulence, soft',o=>[o.x+S(o.y*.05)*C(o.x*.04)*o.f*20,o.y+C(o.x*.05)*S(o.y*.04)*o.f*20]);add('Turbulence, rough',o=>[o.x+S(o.y*.2+o.x*.1)*o.f*14,o.y+C(o.x*.2-o.y*.1)*o.f*14]);
add('Slices across',o=>[o.x+((o.y/10|0)%2?1:-1)*o.f*24,o.y]);add('Slices down',o=>[o.x,o.y+((o.x/10|0)%2?1:-1)*o.f*24]);
add('Glitch rows',o=>[o.x+(Math.sin((o.y/6|0)*12.9898)*43758.5453%1)*o.f*50,o.y]);add('Pond',o=>[o.x+S(o.d*.25-o.f*9)*o.f*6*o.ox/(o.d+1),o.y+S(o.d*.25-o.f*9)*o.f*6*o.oy/(o.d+1)]);
add('Zigzag',o=>[o.x+(Math.abs((o.y/8)%2-1)*2-1)*o.f*30,o.y]);add('Fisheye',o=>[o.x-o.ox*o.f*Math.min(1,o.d/60)*.6,o.y-o.oy*o.f*Math.min(1,o.d/60)*.6]);add('Bulge wide',o=>[o.x-o.ox*o.f*.9,o.y-o.oy*o.f*.3]);
add('Restore original',o=>[o.x,o.y],'r');for(const[n,k]of[['erase layer (reveal photo)','cE'],['restore layer','cR'],['mix colours with photo','cM'],['colourise layer from photo','cC'],['dissolve layer away','cD'],['reveal photo in highlights','cH'],['reveal photo in shadows','cL'],['bake layer into photo','cB'],['Pixel, pixelate','px'],['Pixel, posterize colours','po'],['Pixel, halftone dots','ht'],['Pixel, scanlines','sl'],['Colour, paint with colour','pc'],['Colour, shift hue','hu'],['Colour, invert','iv'],['Colour, desaturate','ds'],['Colour, saturate','sa'],['Colour, lighten','lt'],['Colour, darken','dk'],['Colour, threshold','th'],['Texture, grain','gn'],['Texture, RGB split','rg'],['Texture, sharpen','sh']])add(k[0]==='c'?'Combine, '+n:n,o=>[o.x,o.y],k);add('Blur',o=>[o.x,o.y],'b');
{const G={};MODES.forEach((m,i)=>{const g=m[0].split(/[ ,]/)[0];(G[g]=G[g]||[]).push(`<option value="${i}">${m[0]}</option>`)});$('mode').innerHTML=Object.entries(G).sort((a,b)=>({Combine:0,Pixel:1,Colour:2,Texture:3}[a[0]]??9)-({Combine:0,Pixel:1,Colour:2,Texture:3}[b[0]]??9)).map(([g,o])=>`<optgroup label="${g}">${o.join('')}</optgroup>`).join('');$('mode').value='0'}
const BM=['source-over','multiply','screen','overlay','soft-light','hard-light','lighter','lighten','darken','color-dodge','color-burn','difference','exclusion','hue','saturation','color','luminosity'],BML={'source-over':'normal','lighter':'add (linear dodge)','color-dodge':'colour dodge','color-burn':'colour burn','soft-light':'soft light','hard-light':'hard light','color':'colour'};
$('bm').innerHTML=BM.map(m=>`<option value="${m}">${BML[m]||m}</option>`).join('');

let imageRequest=0;
function workingScale(w,h){return Math.min(1,+$('mx').value/Math.max(w,h),Math.sqrt(18000000/(w*h)))}
async function load(f){
  if(/\.totone$/i.test(f?.name||''))return openProject(f);
  const firstPhoto=!base,request=++imageRequest;
  let bmp;
  try {bmp=await createImageBitmap(f)} catch {
    if(request===imageRequest)alert('This image could not be opened. Try a PNG, JPEG or WebP file.');
    return;
  }
  if(request!==imageRequest){bmp.close();return}
  const s=workingScale(bmp.width,bmp.height);
  W=Math.max(1,Math.round(bmp.width*s));H=Math.max(1,Math.round(bmp.height*s));c.width=W;c.height=H;
  ctx.drawImage(bmp,0,0,W,H);bmp.close();base=ctx.getImageData(0,0,W,H);orig=new ImageData(new Uint8ClampedArray(base.data),W,H);
  window._totoneInitialStart={W,H,data:new Uint8ClampedArray(base.data)};
  versions=[];resetCorrectionTools();projectTitle=(f.name||'Totone').replace(/\.[^.]+$/,'');cancelPathInput();film?.reset(true,firstPhoto);$('zoom').value='0';$('zoom').onchange();
  lasso=[];cropSrc=null;updCropRestoreUI();CR=tab==='crop'?cropInit():null;if(CR)cropInfo();
  setTypeDrawing(false);undoStack=[];redoS=[];edits=[];maskIdx=-1;sel=null;layers=[];active=null;refreshLayers();drawEdits();updInfo();c.style.display='block';$('empty').style.display='none';extract();film?.afterOpen();draw();syncActionStates();if(typeof showToast==='function')showToast(`Opened ${W} × ${H} px`,1600);return true;
}
function extract(){
  if(!base)return;const K=+$('k').value,d=base.data,n=W*H,pts=[];
  const step=Math.max(1,Math.floor(n/5000));
  for(let i=0;i<n;i+=step)pts.push([d[i*4],d[i*4+1],d[i*4+2]]);
  let cen=[];for(let i=0;i<K;i++)cen.push(pts[Math.floor(i*pts.length/K)].slice());
  for(let it=0;it<8;it++){
    const sum=cen.map(()=>[0,0,0,0]);
    for(const p of pts){let b=0,bd=1e9;cen.forEach((q,j)=>{const e=(p[0]-q[0])**2+(p[1]-q[1])**2+(p[2]-q[2])**2;if(e<bd){bd=e;b=j}});const s=sum[b];s[0]+=p[0];s[1]+=p[1];s[2]+=p[2];s[3]++}
    cen=cen.map((q,j)=>sum[j][3]?[sum[j][0]/sum[j][3],sum[j][1]/sum[j][3],sum[j][2]/sum[j][3]]:q);
  }
  palette=cen.sort((a,b)=>(a[0]*.3+a[1]*.59+a[2]*.11)-(b[0]*.3+b[1]*.59+b[2]*.11));
  paintPalette();
}
function paintPalette(){
  $('pal').innerHTML=palette.map((q,i)=>`<button data-i="${i}" style="background:${hex(...q)}" aria-label="Edit colour ${hex(...q)}" title="${hex(...q)}"></button>`).join('');
}
function addEdit(col){edits.push({f:col.map(Math.round),t:col.map(Math.round),tol:50});maskIdx=-1;drawEdits();draw()}
function drawEdits(){
  $('editsNote').style.display=edits.length?'none':'block';
  $('edits').innerHTML=edits.map((e,i)=>`<div class="row" data-i="${i}"><input type="color" disabled value="${hex(...e.f)}" aria-label="From colour"><span aria-hidden="true">to</span><input type="range" min="5" max="220" value="${e.tol}" aria-label="Tolerance"><input type="color" value="${hex(...e.t)}" aria-label="New colour"><button data-x="${i}" aria-label="Remove edit">&times;</button></div><label style="margin:0 0 6px"><span><input type="checkbox" data-m="${i}" ${maskIdx===i?'checked':''}> Show selection</span><span>tolerance ${e.tol}</span></label>`).join('');
}
$('edits').addEventListener('input',ev=>{
  const row=ev.target.closest('.row');if(!row)return;const e=edits[+row.dataset.i];
  if(ev.target.type==='range'){e.tol=+ev.target.value;row.nextElementSibling.lastElementChild.textContent='tolerance '+e.tol}else e.t=rgb(ev.target.value);
  draw();
});
$('edits').addEventListener('click',ev=>{
  if(ev.target.dataset.x!==undefined){edits.splice(+ev.target.dataset.x,1);maskIdx=-1;drawEdits();draw()}
  if(ev.target.dataset.m!==undefined){maskIdx=ev.target.checked?+ev.target.dataset.m:-1;drawEdits();draw()}
});
$('pal').addEventListener('click',ev=>{const b=ev.target.closest('button');if(b)addEdit(palette[+b.dataset.i])});

function toneSnapshot(mapping=mapSettings()){
  const state={
    cur,stops:stops?.slice(),pos:stopPos?.slice(),custom:cs.map(s=>({...s})),
    enabled:$('gradient-enabled').checked, strength:$('str').value,
    map:mapping,stop:selectedStop
  };
  return ()=>{
    const redo=toneSnapshot();
    cur=state.cur;$('str').value=state.strength;setMapSettings(state.map);
    cs=state.custom.map(s=>({...s}));selectedStop=state.stop;buildC();
    setStops(state.stops,state.pos,false);$('gradient-enabled').checked=state.enabled;
    showP($('q').value.toLowerCase());return redo;
  };
}

let stopPos=null;
const mapSource=$('gm-source'),mapCurve=$('gm-curve'),mapMid=$('gm-mid'),mapValue=$('gm-value');
const mapSettings=()=>({source:mapSource.value,curve:mapCurve.value,mid:+mapMid.value});
let previousMapping=mapSettings(),mappingGesture=false;
function setMapSettings(settings={}){
  mapSource.value=settings.source||'luma';mapCurve.value=settings.curve||'rgb';mapMid.value=settings.mid||50;
  mapValue.textContent=mapMid.value+'%';previousMapping=mapSettings();mappingGesture=false;
}
const toLinear=v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4;
const toSRGB=v=>v<=.0031308?v*12.92:1.055*v**(1/2.4)-.055;
// Linear sRGB ↔ OKLab, from Björn Ottosson's reference transform.
function toOKLab([red,green,blue]){
  const l=Math.cbrt(.4122214708*red+.5363325363*green+.0514459929*blue);
  const m=Math.cbrt(.2119034982*red+.6806995451*green+.1073969566*blue);
  const s=Math.cbrt(.0883024619*red+.2817188376*green+.6299787005*blue);
  return [.2104542553*l+.7936177850*m-.0040720468*s,
    1.9779984951*l-2.4285922050*m+.4505937099*s,
    .0259040371*l+.7827717662*m-.8086757660*s];
}
function fromOKLab([light,a,b]){
  const l=(light+.3963377774*a+.2158037573*b)**3;
  const m=(light-.1055613458*a-.0638541728*b)**3;
  const s=(light-.0894841775*a-1.291485548*b)**3;
  return [4.0767416621*l-3.3077115913*m+.2309699292*s,
    -1.2684380046*l+2.6097574011*m-.3413193965*s,
    -.0041960863*l-.7034186147*m+1.707614701*s];
}
const midpointGamma=mid=>Math.log(.5)/Math.log(mid/100);
function setStops(s,pos,sync=true){
  stops=s;stopPos=pos||null;
  if(sync&&s){
    $('gradient-enabled').checked=true;
    cs=s.map((c,i)=>({c,p:pos?.[i]??Math.round(i/(s.length-1)*100)}));
    selectedStop=0;buildC();
  }
  LUT=s?makeToneTable(s,pos,mapSettings()):null;
  if(!s){$('gradient-enabled').checked=false;updateStopControls()}
  paintGradientRamp();draw(true);
}
function makeToneTable(s,pos,{curve,mid}){
  const r=s.map(rgb),n=r.length,ps=pos&&pos.length===n?pos.map(v=>v/100):r.map((_,i)=>i/(n-1));
  const gamma=midpointGamma(mid),linear=curve==='linear'||curve==='oklab';
  let colors=linear?r.map(c=>c.map(v=>toLinear(v/255))):r;
  if(curve==='oklab')colors=colors.map(toOKLab);
  const table=new Uint8Array(768);
  for(let i=0;i<256;i++){
    const x=(i/255)**gamma;let a=0;
    while(a<n-2&&x>=ps[a+1])a++;
    const span=ps[a+1]-ps[a];
    let t=span>0?Math.min(1,Math.max(0,(x-ps[a])/span)):1;
    if(curve==='smooth')t=t*t*(3-2*t);
    if(curve==='steps')t=t<.5?0:1;
    let mixed=colors[a].map((v,k)=>v+(colors[a+1][k]-v)*t);
    if(curve==='oklab')mixed=fromOKLab(mixed);
    for(let k=0;k<3;k++){
      const v=linear?Math.round(toSRGB(mixed[k])*255):mixed[k];
      table[i*3+k]=Math.max(0,Math.min(255,v));
    }
  }
  return table;
}
function rebuildMap(){mapValue.textContent=mapMid.value+'%';if(stops)setStops(stops,stopPos,false);else paintGradientRamp();updateStopControls()}
function changeMapping(){
  if(base&&!mappingGesture)pushU(toneSnapshot(previousMapping));
  mappingGesture=true;previousMapping=mapSettings();
  if(cur!==-1){cur=-1;showP($('q').value.toLowerCase())}
  rebuildMap();
}
for(const input of [mapSource,mapCurve,mapMid]){
  input.oninput=changeMapping;
  input.onchange=input.onblur=()=>{mappingGesture=false};
}
$('gm-reset').onclick=()=>{
  if(base)pushU(toneSnapshot());
  cur=-1;showP($('q').value.toLowerCase());setMapSettings();rebuildMap();
};
$('gm-auto').onclick=()=>{
  if(!base)return;
  const data=($('lgrade').checked&&layers.length?flat():base).data;
  const bins=new Float64Array(256),tone=mapSampler();
  let total=0,sum=0;
  for(let j=0;j<W*H;j++){
    const i=j*4,weight=data[i+3]*(sel?sel[j]/255:1);
    if(!weight)continue;
    const value=Math.round(tone(data[i],data[i+1],data[i+2]));
    bins[value]+=weight;total+=weight;sum+=weight*value;
  }
  if(!total)return;
  // Otsu's split. Centre tied splits in the gap between two occupied bands.
  let weight=0,moment=0,best=0,first=0,last=0;
  for(let i=0;i<255;i++){
    weight+=bins[i];moment+=bins[i]*i;
    if(!weight||weight>=total)continue;
    const difference=moment/weight-(sum-moment)/(total-weight);
    const score=weight*(total-weight)*difference*difference;
    if(score>best){best=score;first=last=i}
    else if(score===best)last=i;
  }
  const value=best?(first+last+1)/2:sum/total;
  const mid=Math.max(10,Math.min(90,Math.round(value/255*100)));
  if(mid===+mapMid.value)return;
  mapMid.value=mid;changeMapping();mappingGesture=false;
};
$('gradient-enabled').onchange=()=>{if($('gradient-enabled').checked&&!LUT)applyC();else draw(true)};
function mapSampler(){
  switch(mapSource.value){
    case 'light':return (r,g,b)=>(Math.max(r,g,b)+Math.min(r,g,b))*.5;
    case 'red':return r=>r;
    case 'green':return (r,g)=>g;
    case 'blue':return (r,g,b)=>b;
    default:return (r,g,b)=>r*.299+g*.587+b*.114;
  }
}
$('none').onclick=()=>{cur=-1;showP($('q').value.toLowerCase());setStops(null)};
$('rand').onclick=()=>{
  const h=Math.random()*360,hs=(x,s,l)=>{const a=s*Math.min(l,1-l),f=n=>{const k=(n+x/30)%12;return l-a*Math.max(-1,Math.min(k-3,9-k,1))};return hex(f(0)*255,f(8)*255,f(4)*255)};
  const sp=60+Math.random()*180,s=[hs(h,.5,.07),hs(h+sp*.5,.6,.45),hs(h+sp,.55,.9)];
  if(Math.random()<.5)s.splice(2,0,hs(h+sp*.8,.8,.6));cur=-1;showP($('q').value.toLowerCase());setMapSettings();setStops(s);
};
['dt','apx','pxg','pxz','pxc','pxm','pxcm','pxi','pxp','pxinv','pxf','pxr','pxt','pxl','pxk','pxsp','pxls','pxfd','pxb','pxit','lb','lw','lg','sn','s1','s2','spl','spr','str','sov','reduce','ab','ac','as','ah','at','av','ag','ap','ai'].forEach(i=>$(i).oninput=()=>draw(true));
$('k').oninput=()=>{$('kv').textContent=$('k').value;extract();draw()};

function render(ov=true,rect,printTable=null){
  if(ov&&($('lsolo').checked||edgeInspect())&&active&&tab==='layers'){soloDraw();frameOK=false;return}
  let X0=0,Y0=0,X1=W,Y1=H;if(rect){const P0=Math.max(1,+$('apx').value);X0=Math.max(0,Math.floor(rect[0]/P0)*P0);Y0=Math.max(0,Math.floor(rect[1]/P0)*P0);X1=Math.min(W,Math.ceil(rect[2]/P0)*P0);Y1=Math.min(H,Math.ceil(rect[3]/P0)*P0)}
  const original=ov&&showOrig,mask=ov?maskIdx:-1,spl=ov&&$('spl').checked;
  if(ov&&tab==='film'&&!original&&mask<0&&film?.showSubjectMask()){
   if(spl){const cut=Math.floor(W*(+$('spr').value)/100);ctx.putImageData(orig,0,0,0,0,cut,H);ctx.fillStyle='#fff';ctx.fillRect(cut-1,0,2,H)}
   frameOK=false;return;
  }
  const useFilm=!original&&mask<0&&film?.enabled();
  const usePro=!original&&mask<0&&typeof window.proDevelopActive==='function'&&window.proDevelopActive();
  const ident=!useFilm&&!usePro&&!printTable&&isIdent(original,mask,spl),st=rect?1:ov?stride:1,LG=$('lgrade').checked&&layers.length>0&&!original&&!ident,input=original?orig:LG?flat(rect?[X0,Y0,X1,Y1]:undefined):base,s=(useFilm?film.image(input):input).data,raw=input.data,out=getOut(),o=out.data,str=$('str').value/100,red=$('reduce').checked&&palette.length;
  const toneTable=printTable||LUT, mapTone=toneTable&&str&&(printTable||$('gradient-enabled').checked)?mapSampler():null;
  const E=edits.map(e=>({f:e.f,d:[e.t[0]-e.f[0],e.t[1]-e.f[1],e.t[2]-e.f[2]],tol:e.tol,t2:e.tol*e.tol}));
  const N=id=>+$(id).value,br=N('ab')*2.55,ct=1+N('ac')/100,sa=1+N('as')/100,hu=N('ah')*Math.PI/180,tp=N('at')*.6,vg=N('av')/100,gr=N('ag')/100,po=N('ap'),inv=$('ai').checked,hc=Math.cos(hu),hs=Math.sin(hu),lvl=N('lb')>0||N('lw')<255||N('lg')!==100,bp=N('lb'),wp=N('lw'),gm=N('lg')/100,stn=N('sn')/100,dt=N('dt')/100,S1=rgb($('s1').value),S2=rgb($('s2').value),spx=W*N('spr')/100,adj=br||ct!==1||sa!==1||hu||tp||lvl;
  if(ident){if(rect)ctx.putImageData(base,0,0,X0,Y0,X1-X0,Y1-Y0);else ctx.putImageData(base,0,0)}else{
  const out=getOut(),o=out.data;
  const AL0=new Float32Array(256),AL1=new Float32Array(256),AL2=new Float32Array(256),cl_=x=>x<0?0:x>255?255:x;
  if(adj)for(let v=0;v<256;v++){const x=lvl?Math.pow(Math.min(1,Math.max(0,(v-bp)/(wp-bp))),1/gm)*255:v;AL0[v]=cl_((x+br+tp-128)*ct+128);AL1[v]=cl_((x+br-128)*ct+128);AL2[v]=cl_((x+br-tp-128)*ct+128)}
  for(let y_=Y0;y_<Y1;y_+=st)for(let x_=X0;x_<X1;x_+=st){const j=y_*W+x_,i=j*4;
    const r0=raw[i],g0=raw[i+1],b0=raw[i+2];let r=s[i],g=s[i+1],b=s[i+2];const m=sel?sel[j]/255:1;
    const sp=spl&&x_<spx;if(original||m===0||sp){const z=sp?orig.data:raw;o[i]=z[i];o[i+1]=z[i+1];o[i+2]=z[i+2];o[i+3]=z[i+3];continue}
    if(mask>=0){const e=E[mask],t=wd(r0,g0,b0,e.f)/e.tol,v=(t>=1?0:1-t*t*(3-2*t))*255;o[i]=o[i+1]=o[i+2]=v;o[i+3]=255;continue}
    for(let q=0;q<E.length;q++){const e=E[q],dd=wd2(r0,g0,b0,e.f);if(dd<e.t2){const t=Math.sqrt(dd)/e.tol,w=1-t*t*(3-2*t);r+=e.d[0]*w;g+=e.d[1]*w;b+=e.d[2]*w}}
    r=r<0?0:r>255?255:r;g=g<0?0:g>255?255:g;b=b<0?0:b>255?255:b;
    if(adj){r=AL0[r+.5|0];g=AL1[g+.5|0];b=AL2[b+.5|0];
      if(sa!==1){const l=r*.299+g*.587+b*.114;r=l+(r-l)*sa;g=l+(g-l)*sa;b=l+(b-l)*sa}
      if(hu){const y=r*.299+g*.587+b*.114,I=r*.596-g*.274-b*.322,Q=r*.211-g*.523+b*.312,a=I*hc-Q*hs,c2=I*hs+Q*hc;r=y+.956*a+.621*c2;g=y-.272*a-.647*c2;b=y-1.106*a+1.703*c2}
      if(sa!==1||hu){r=r<0?0:r>255?255:r;g=g<0?0:g>255?255:g;b=b<0?0:b>255?255:b}}
    if(stn){const l=(r*.299+g*.587+b*.114)/255,ws=(1-l)*(1-l)*stn,wh=l*l*stn;r+=(S1[0]-r)*ws+(S2[0]-r)*wh;g+=(S1[1]-g)*ws+(S2[1]-g)*wh;b+=(S1[2]-b)*ws+(S2[2]-b)*wh}
    if(dt){const bv=(B4[(x_&3)+4*(y_&3)]/16-.5)*dt*90;r+=bv;g+=bv;b+=bv;r=r<0?0:r>255?255:r;g=g<0?0:g>255?255:g;b=b<0?0:b>255?255:b}
    if(red){let bd=1e9,q=palette[0];for(const p of palette){const d=(r-p[0])**2+(g-p[1])**2+(b-p[2])**2;if(d<bd){bd=d;q=p}}r=q[0];g=q[1];b=q[2]}
    if(mapTone){const L=Math.round(mapTone(r,g,b))*3;r+=(toneTable[L]-r)*str;g+=(toneTable[L+1]-g)*str;b+=(toneTable[L+2]-b)*str}
    if(vg){const dx=x_/W-.5,dy=y_/H-.5,k=1-vg*Math.min(1,(dx*dx+dy*dy)*3.2);r*=k;g*=k;b*=k}
    if(gr){const n=(((Math.sin(j*12.9898)*43758.5453)%1)+1)%1-.5,a=n*gr*90;r+=a;g+=a;b+=a}
    if(po>1){const q=po-1;r=Math.round(r/255*q)/q*255;g=Math.round(g/255*q)/q*255;b=Math.round(b/255*q)/q*255}
    if(inv){r=255-r;g=255-g;b=255-b}
    if(m<1){r=r0+(r-r0)*m;g=g0+(g-g0)*m;b=b0+(b-b0)*m}
    o[i]=r;o[i+1]=g;o[i+2]=b;o[i+3]=m<1?raw[i+3]+(s[i+3]-raw[i+3])*m:s[i+3];
  }
  if(st>1)fillStride(o,st);
  if(usePro&&typeof window.applyProDevelop==='function')window.applyProDevelop(out,ov,spl?spx:0,raw);
  {const P_=N('apx');if(P_>1&&!original&&mask<0)pixelFx(o,P_,spl,spx,X0,Y0,X1,Y1)}
  const SV=$('sov').value;if(ov&&sel&&SV!=='off')for(let y=Y0;y<Y1;y++)for(let x=X0;x<X1;x++){const j=y*W+x,i=j*4,m=sel[j]/255;
    if(SV==='bw'){o[i]=o[i+1]=o[i+2]=sel[j];continue}
    if(SV==='mask'){const t=(1-m)*.55;o[i]+=(255-o[i])*t;o[i+1]+=(40-o[i+1])*t;o[i+2]+=(60-o[i+2])*t;continue}
    if(sel[j]<128){o[i]*=.45;o[i+1]*=.45;o[i+2]*=.45}
    else if((x>0&&sel[j-1]<128)||(x<W-1&&sel[j+1]<128)||(y>0&&sel[j-W]<128)||(y<H-1&&sel[j+W]<128)){o[i]=o[i+1]=o[i+2]=255}}
  if(rect)ctx.putImageData(out,0,0,X0,Y0,X1-X0,Y1-Y0);else ctx.putImageData(out,0,0)}
  if(!LG&&!original&&mask<0){if(rect){ctx.save();ctx.beginPath();ctx.rect(X0,Y0,X1-X0,Y1-Y0);ctx.clip();drawLayers(ctx);ctx.restore()}else drawLayers(ctx)}
  if(!rect)bloom(spl?spx:0,original,mask);
  if(!original&&mask<0)film?.paintFrame(ctx,rect);
  if(ov&&tab==='grade')film?.updateScopes();
  if(spl&&!original){ctx.putImageData(orig,0,0,0,0,Math.floor(spx),H);ctx.fillStyle='#fff';ctx.fillRect(spx-1,0,2,H)}
  if(ov&&lasso.length>1){ctx.beginPath();const T=$('stool').value,A=lasso[0],B=lasso[lasso.length-1];if(T==='rect')ctx.rect(A[0],A[1],B[0]-A[0],B[1]-A[1]);else if(T==='ellipse')ctx.ellipse((A[0]+B[0])/2,(A[1]+B[1])/2,Math.abs(B[0]-A[0])/2||1,Math.abs(B[1]-A[1])/2||1,0,0,7);else lasso.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.lineWidth=Math.max(1.5,W/500);ctx.strokeStyle='#ffffff';ctx.stroke()}
  if(ov&&(tab==='layers'||tab==='text'||tab==='design')){if(typeBox)drawTypeBox();else if(hasMesh())drawEnvelope();else if(active?.vis&&!typeDrawing&&!brushKind()&&!editingVector())drawHandles()}
  if(ov&&tab==='text')textGuides();if(ov&&tab==='grade')film.maskGuides();
  if(ov&&tab==='layers'){drawRepairSource();drawVectorGuides()}
  if(ov&&tab==='crop'&&CR)drawCrop();
  if(!rect)frameOK=ov&&st===1;
}
let stride=1,lastMs=0,idleT=0;
let DR=null,needFull=true,frameOK=false,bud2=0;
function frame(){raf=0;const part=!needFull&&DR&&frameOK&&tab==='warp'&&!(+$('gl').value)&&!showOrig&&!lasso.length&&!pxFull()&&(DR[2]-DR[0])*(DR[3]-DR[1])<.4*W*H;
  if(part){const r=DR;DR=null;render(true,r);return}
  needFull=false;DR=null;stride=lastMs>26?2:1;const t0=performance.now();render();const ms=performance.now()-t0;lastMs=stride>1?ms*3:ms;clearTimeout(idleT);if(stride>1)idleT=setTimeout(()=>{stride=1;idleT=0;render()},160)}
function draw(keep){needFull=true;if(!keep){cdirty=true;film?.invalidate()}if(!base||raf)return;raf=requestAnimationFrame(frame)}
function drawPart(x0,y0,x1,y1){if(!base)return;if(film?.enabled()){draw();return}x0=Math.max(0,Math.floor(x0));y0=Math.max(0,Math.floor(y0));x1=Math.min(W,Math.ceil(x1));y1=Math.min(H,Math.ceil(y1));if(x1<=x0||y1<=y0)return;DR=DR?[Math.min(DR[0],x0),Math.min(DR[1],y0),Math.max(DR[2],x1),Math.max(DR[3],y1)]:[x0,y0,x1,y1];if(!raf)raf=requestAnimationFrame(frame)}
function fillStride(o,st){for(let y=0;y<H;y+=st){const r=y*W*4;for(let x=0;x<W;x+=st){const q=r+x*4;for(let k=1;k<st&&x+k<W;k++){const i=q+k*4;o[i]=o[q];o[i+1]=o[q+1];o[i+2]=o[q+2];o[i+3]=o[q+3]}}for(let k=1;k<st&&y+k<H;k++)o.copyWithin((y+k)*W*4,r,r+W*4)}}

const pos=e=>{const r=c.getBoundingClientRect();return[(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height]};
let down=false,last=null,tick=0,dxy=[0,0],sm=[0,0],moved=false,bud=1;
let pres=1;
function makeOp(kind,src,ob,w,h,d){
  const PX=Math.max(2,+$('bpx').value),LV=+$('blv').value,PC=rgb($('bpc').value),cache=new Map();
  const at=(x,y,k)=>src[(Math.min(h-1,Math.max(0,y))*w+Math.min(w-1,Math.max(0,x)))*4+k];
  const blur=(x,y)=>{const t=[0,0,0];for(let u=-2;u<=2;u+=2)for(let v=-2;v<=2;v+=2)for(let k=0;k<3;k++)t[k]+=at(x+u,y+v,k);return t.map(q=>q/9)};
  const blk=(bx,by)=>{const key=bx*100003+by;let v=cache.get(key);if(!v){v=[0,0,0];let n=0;for(let yy=by*PX;yy<Math.min(h,(by+1)*PX);yy++)for(let xx=bx*PX;xx<Math.min(w,(bx+1)*PX);xx++){const q=(yy*w+xx)*4;v[0]+=src[q];v[1]+=src[q+1];v[2]+=src[q+2];n++}v=[v[0]/n,v[1]/n,v[2]/n];v[3]=(v[0]*.299+v[1]*.587+v[2]*.114)/255;cache.set(key,v)}return v};
  return(x,y,f)=>{const p=(y*w+x)*4,a=Math.min(1,f*2),r=src[p],g=src[p+1],b=src[p+2],lum=r*.299+g*.587+b*.114;let T;
    switch(kind){
      case'r':T=[ob.data[p],ob.data[p+1],ob.data[p+2]];d[p+3]+=(ob.data[p+3]-d[p+3])*a;break;
      case'b':T=blur(x,y);break;
      case'px':T=blk(x/PX|0,y/PX|0);break;
      case'po':{const q=LV-1;T=[r,g,b].map(v=>Math.round(v/255*q)/q*255);break}
      case'ht':{const v=blk(x/PX|0,y/PX|0),cx=((x/PX|0)+.5)*PX,cy=((y/PX|0)+.5)*PX;T=hyp(x-cx,y-cy)<PX*.72*Math.sqrt(1-v[3])?[v[0]*.3,v[1]*.3,v[2]*.3]:[245,242,234];break}
      case'sl':{const per=Math.max(2,PX>>1);T=(y%per)<Math.max(1,per>>1)?[r*.3,g*.3,b*.3]:[r,g,b];break}
      case'rg':{const o2=Math.max(1,Math.round(PX/3));T=[at(x-o2,y,0),g,at(x+o2,y,2)];break}
      case'gn':{const n=(Math.random()-.5)*110;T=[r+n,g+n,b+n];break}
      case'iv':T=[255-r,255-g,255-b];break;
      case'ds':T=[lum,lum,lum];break;
      case'sa':T=[lum+(r-lum)*2.4,lum+(g-lum)*2.4,lum+(b-lum)*2.4];break;
      case'lt':T=[r+(255-r)*.55,g+(255-g)*.55,b+(255-b)*.55];break;
      case'dk':T=[r*.45,g*.45,b*.45];break;
      case'pc':T=PC;break;
      case'th':{const v=lum>128?255:0;T=[v,v,v];break}
      case'hu':{const I=r*.596-g*.274-b*.322,Q=r*.211-g*.523+b*.312,c=Math.cos(1.05),s2=Math.sin(1.05),ni=I*c-Q*s2,nq=I*s2+Q*c;T=[lum+.956*ni+.621*nq,lum-.272*ni-.647*nq,lum-1.106*ni+1.703*nq];break}
      case'sh':{const bl=blur(x,y);T=[r+(r-bl[0])*2.5,g+(g-bl[1])*2.5,b+(b-bl[2])*2.5];break}
      default:return}
    for(let k=0;k<3;k++)d[p+k]+=(T[k]-d[p+k])*a}}
const pxo=()=>{const P=+$('apx').value;$('apxo').textContent=P>1&&W?`About ${Math.ceil(W/P)} \u00d7 ${Math.ceil(H/P)} pixels`:'Off'};
$('apx').addEventListener('input',pxo);
const SCR=new Map();
function snapReg(d,w,h,xa,xb,ya,yb){let b=SCR.get(d.length);if(!b){b=new Uint8ClampedArray(d.length);SCR.set(d.length,b)}for(let y=ya;y<yb;y++){const o=(y*w+xa)*4;b.set(d.subarray(o,(y*w+xb)*4),o)}return b}
let lastBox=null;
function warpOn(B,w,h,cx,cy,dx,dy,R,mask,ob){
  const E=3-2.7*$('hard').value/100,M=MODES[$('mode').value],kind=M[2],fn=M[1],pw=$('pow').value/100*pres,d=B.data,pad=R+120;
  const x0=Math.max(0,Math.floor(cx-R)),x1=Math.min(w-1,Math.ceil(cx+R)),y0=Math.max(0,Math.floor(cy-R)),y1=Math.min(h-1,Math.ceil(cy+R));
  if(x0>x1||y0>y1)return;lastBox=[x0,y0,x1-x0+1,y1-y0+1];snapTouch(d,x0,y0,x1,y1);
  const xa=Math.max(0,Math.floor(cx-pad)),xb=Math.min(w,Math.ceil(cx+pad)+1),ya=Math.max(0,Math.floor(cy-pad)),yb=Math.min(h,Math.ceil(cy+pad)+1),src=snapReg(d,w,h,xa,xb,ya,yb),
    cop=kind?makeOp(kind,src,ob,w,h,d):null,fall=new Float32Array(257);for(let i=0;i<=256;i++)fall[i]=(1-i/256)**E*pw;
  const P={x:0,y:0,ox:0,oy:0,cx,cy,dx,dy,f:0,d:0},mx=xb-1,my=yb-1;
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    const ox=x-cx,oy=y-cy,dist=Math.sqrt(ox*ox+oy*oy);if(dist>=R||(mask&&mask[y*w+x]<128))continue;
    const f=fall[(dist/R*256)|0];if(f<.004)continue;
    if(cop){cop(x,y,f);continue}
    P.x=x;P.y=y;P.ox=ox;P.oy=oy;P.f=f;P.d=dist;const[sx,sy]=fn(P);
    const ix=sx<xa?xa:sx>mx?mx:sx,iy=sy<ya?ya:sy>my?my:sy,a=ix|0,b=iy|0,fx=ix-a,fy=iy-b,p=(b*w+a)*4,q=p+(b<my?w*4:0),right=a<mx?4:0,o=(y*w+x)*4,g0=(1-fx)*(1-fy),g1=fx*(1-fy),g2=(1-fx)*fy,g3=fx*fy;
    d[o]=src[p]*g0+src[p+right]*g1+src[q]*g2+src[q+right]*g3;d[o+1]=src[p+1]*g0+src[p+right+1]*g1+src[q+1]*g2+src[q+right+1]*g3;d[o+2]=src[p+2]*g0+src[p+right+2]*g1+src[q+2]*g2+src[q+right+2]*g3;d[o+3]=src[p+3]*g0+src[p+right+3]*g1+src[q+3]*g2+src[q+right+3]*g3;
  }
}
function warp(cx,cy,dx,dy){
  const K=MODES[$('mode').value][2];if(K&&K[0]==='c'){combine(K,cx,cy);const R0=+$('size').value+4;drawPart(cx-R0,cy-R0,cx+R0,cy+R0);return}
  const R=+$('size').value,t=$('bt').value,A=active;
  if(t!=='layer'||!A)warpOn(base,W,H,cx,cy,dx,dy,R,sel,orig);
  for(const l of t==='bg'?[]:t==='layer'?(A?[A]:[]):layers){if(!l.vis||l.lk)continue;
    const c0=Math.cos(l.r),s0=Math.sin(l.r),
      T=(a,b)=>{let u=(a*c0+b*s0)/l.s;const v=(-a*s0+b*c0)/l.s;if(l.fl)u=-u;return[u,v]},
      [lx,ly]=T(cx-l.x,cy-l.y),Rl=R/l.s;
    if(Math.abs(lx)>l.cv.width*(1-l.cl-l.cr)/2+Rl||Math.abs(ly)>l.cv.height*(1-l.ct-l.cb)/2+Rl)continue;
    if(strokeLayers&&!strokeLayers.has(l)){
      strokeLayers.add(l);
      if(!expandWarpLayer(l,Rl)&&SS)SS.push(tileSnap(l.d.data,l.cv.width,l.cv.height,l));
    }
    const iw=l.cv.width,ih=l.cv.height,sw=iw*(1-l.cl-l.cr),sh=ih*(1-l.ct-l.cb);
    const [vx,vy]=T(dx,dy);
    ensureO(l);lastBox=null;
    warpOn(l.d,iw,ih,lx+l.cl*iw+sw/2,ly+l.ct*ih+sh/2,vx,vy,Rl,null,l.o);
    if(lastBox)syncL(l,lastBox);
  }
  drawPart(cx-R-4,cy-R-4,cx+R+4,cy+R+4);
}
function combine(k,cx,cy){
  const R=+$('size').value,E=3-2.7*$('hard').value/100,pw=$('pow').value/100*pres,l=active||layers[layers.length-1];if(!l||l.lk)return;ensureO(l);
  const iw=l.cv.width,ih=l.cv.height,sw=iw*(1-l.cl-l.cr),sh=ih*(1-l.ct-l.cb),c0=Math.cos(l.r),s0=Math.sin(l.r),ld=l.d.data,lo=l.o.data,bd=base.data,cl=l.cl*iw,ct=l.ct*ih;
  const toL=(x,y)=>{const a=x-l.x,b=y-l.y;let u=(a*c0+b*s0)/l.s;const v=(-a*s0+b*c0)/l.s;if(l.fl)u=-u;return[u+cl+sw/2,v+ct+sh/2]};
  const toW=(x,y)=>{let u=x-cl-sw/2;const v=y-ct-sh/2;if(l.fl)u=-u;return[l.x+l.s*(u*c0-v*s0),l.y+l.s*(u*s0+v*c0)]};
  const[lx,ly]=toL(cx,cy),Rl=R/l.s,x0=Math.max(Math.ceil(cl),Math.floor(lx-Rl)),x1=Math.min(Math.floor(cl+sw)-1,Math.ceil(lx+Rl)),y0=Math.max(Math.ceil(ct),Math.floor(ly-Rl)),y1=Math.min(Math.floor(ct+sh)-1,Math.ceil(ly+Rl)),nb=Math.max(1,Math.ceil(l.s*1.15));
  snapTouch(ld,x0,y0,x1,y1);if(k==='cM'||k==='cB')snapTouch(bd,cx-R-nb-3,cy-R-nb-3,cx+R+nb+3,cy+R+nb+3);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    const dist=hyp(x-lx,y-ly);if(dist>=Rl)continue;const f=(1-dist/Rl)**E*pw,q=(y*iw+x)*4,a=Math.min(1,f*2);
    if(k==='cE'){ld[q+3]*=1-a;continue}
    if(k==='cR'){ld[q+3]+=(lo[q+3]-ld[q+3])*a;continue}
    const[X,Y]=toW(x,y),px=Math.round(X),py=Math.round(Y);if(px<0||py<0||px>=W||py>=H)continue;const p=(py*W+px)*4;
    if(k==='cD'){if(Math.random()<a)ld[q+3]=0}
    else if(k==='cH'||k==='cL'){const lm=(bd[p]*.299+bd[p+1]*.587+bd[p+2]*.114)/255;ld[q+3]*=1-a*(k==='cH'?lm:1-lm)}
    else if(k==='cM'){for(let c=0;c<3;c++){const B=bd[p+c],L=ld[q+c];ld[q+c]=L+(B-L)*a*.5;bd[p+c]=B+(L-B)*a*.5}}
    else if(k==='cC'){const sc=(ld[q]*.299+ld[q+1]*.587+ld[q+2]*.114+1)/(bd[p]*.299+bd[p+1]*.587+bd[p+2]*.114+1);for(let c=0;c<3;c++)ld[q+c]+=(Math.min(255,bd[p+c]*sc)-ld[q+c])*a}
    else if(k==='cB'){const al=ld[q+3]/255*l.op*a;for(let oy=0;oy<nb;oy++)for(let ox=0;ox<nb;ox++){const X2=px+ox-(nb>>1),Y2=py+oy-(nb>>1);if(X2<0||Y2<0||X2>=W||Y2>=H)continue;const p2=(Y2*W+X2)*4;for(let c=0;c<3;c++)bd[p2+c]+=(ld[q+c]-bd[p2+c])*al}ld[q+3]*=1-a}
  }
  syncL(l)}
function stamp(cx,cy,dx,dy){warp(cx,cy,dx,dy);if($('sym').checked)warp(W-cx,cy,-dx,dy)}
c.addEventListener('pointerdown',e=>{
  if(!base)return;const p=pos(e);
  if(tab==='text'||tab==='layers'||tab==='design'){if(typeDrawing){startTypeBox(e,p);return}layerDown(e,p);return}
  if(tab==='glints'){if(e.button===0)placeGlint(p);return}
  if(tab==='colour'){addEdit(px(p));return}
  if(tab==='select'){selDown(e,p);return}
  if(tab!=='warp')return;
  c.setPointerCapture(e.pointerId);down=true;last=p;sm=p;moved=false;pres=e.pointerType==='pen'?Math.max(.1,e.pressure*1.6):1;
  beginStroke();
  tick=setInterval(()=>{if(!moved)stamp(last[0],last[1],0,0);moved=false},60);
});
c.addEventListener('pointermove',e0=>{if(typeBox?.pointer===e0.pointerId){typeBox.end=typePoint(pos(e0));draw(true);return}if(!down)return;const evs=tab==='warp'&&e0.getCoalescedEvents?e0.getCoalescedEvents():[e0];for(const e of evs.length?evs:[e0]){let p=pos(e);if(tab==='text'||tab==='layers'||tab==='design'){layerMove(e,p);return}if(tab==='select'){if($('stool').value==='paint'){paintSel(lastP,p);lastP=p}else{lasso.push(p);draw()}return}
  pres=e.pointerType==='pen'?Math.max(.1,e.pressure*1.6):1;const k=1-(+$('smo').value)/110;sm=[sm[0]+(p[0]-sm[0])*k,sm[1]+(p[1]-sm[1])*k];p=sm;
  const dx=p[0]-last[0],dy=p[1]-last[1],dist=hyp(dx,dy),step=Math.max(2,+$('size').value*$('spc').value/100)*bud,n=Math.min(24,Math.max(1,Math.floor(dist/step)));
  if(dist>.5){const t0=performance.now();for(let i=1;i<=n;i++)stamp(last[0]+dx*i/n,last[1]+dy*i/n,dx/n,dy/n);const ms=performance.now()-t0;bud=ms>10?Math.min(3,bud*1.3):Math.max(1,bud*.95);last=p;moved=true}}});
const up=()=>{if(!down)return;down=false;if(tab==='text'||tab==='layers'||tab==='design'){ls=null;guides=[];refreshLayers();draw();return}if(tab==='select'){endLasso();return}clearInterval(tick);SS=null;strokeLayers=null;extract();refreshLayers();draw()};
c.addEventListener('pointerup',e=>{if(typeBox?.pointer===e.pointerId)finishTypeBox(pos(e));else up()});
c.addEventListener('pointercancel',e=>{if(typeBox?.pointer===e.pointerId)setTypeDrawing(false);else up()});

let redoS=[];
function syncActionStates(){
  const has=!!base;
  $('undo').disabled=!undoStack.length;$('undo').title=undoStack.length?`Undo (${undoStack.length}) · Ctrl+Z`:'Nothing to undo';
  $('redo').disabled=!redoS.length;$('redo').title=redoS.length?`Redo (${redoS.length}) · Ctrl+Y`:'Nothing to redo';
  for(const id of ['cmp','reset','rlook','export','version-open','toolbar-border','htxt','type-draw','zoom','spl','spr']){const el=$(id);if(el)el.disabled=!has}
  const up=$('upscale-open');if(up)up.disabled=!has;
}
const pushU=f=>{if(suiteReady)queueDraft();undoStack.push(f);if(undoStack.length>25)undoStack.shift();redoS=[];syncActionStates()};
$('undo').onclick=()=>{if(!undoStack.length)return;textEdit=null;const u=undoStack.pop();if(u){redoS.push(u());queueDraft();extract();refreshLayers();draw();syncActionStates();if(typeof showToast==='function')showToast('Undid last change',1200)}};
$('redo').onclick=()=>{if(!redoS.length)return;textEdit=null;const u=redoS.pop();if(u){undoStack.push(u());queueDraft();extract();refreshLayers();draw();syncActionStates();if(typeof showToast==='function')showToast('Redid change',1200)}};
$('reset').onclick=()=>{if(base){pushU(mkSnap('all'));base.data.set(orig.data);layers.forEach(l=>{if(l.o){l.d.data.set(l.o.data);syncL(l)}});extract();draw();if(typeof showToast==='function')showToast('Warp reset')}} ;
$('open').onclick=()=>$('file').click();
$('file').onchange=e=>{const file=e.target.files[0];e.target.value='';if(file)load(file)};
$('open2').onclick=()=>$('file2').click();
let dragDepth=0;
$('stage').addEventListener('dragenter',e=>{e.preventDefault();dragDepth++;$('stage').classList.add('drag-over')});
$('stage').addEventListener('dragover',e=>{e.preventDefault()});
$('stage').addEventListener('dragleave',()=>{dragDepth=Math.max(0,dragDepth-1);if(!dragDepth)$('stage').classList.remove('drag-over')});
$('stage').addEventListener('drop',async e=>{e.preventDefault();dragDepth=0;$('stage').classList.remove('drag-over');const f=e.dataTransfer.files[0];if(f){if(/\.totone$/i.test(f.name||'')){openProject(f);return}if(film?.inDouble()){film.openExposureFiles(e.dataTransfer.files);return}importLayerFiles(e.dataTransfer.files);return}const html=e.dataTransfer.getData('text/html'),uri=e.dataTransfer.getData('text/uri-list')||e.dataTransfer.getData('text/plain');const m=html?.match(/<img[^>]+src=["']([^"']+)["']/i);const url=(m?.[1]||uri||'').trim().split(/\r?\n/)[0];if(/^https?:\/\//i.test(url)&&typeof importImageFromUrl==='function')importImageFromUrl(url,'layer')});

const px=p=>{const i=(Math.floor(p[1])*W+Math.floor(p[0]))*4,d=base.data;return[d[i],d[i+1],d[i+2]]};
function setSel(m,md){md=md||$('sm').value;if(!sel&&md==='sub')return;pushU(selSnap());
  if(!sel||md==='replace')sel=m;else for(let i=0;i<m.length;i++)sel[i]=md==='add'?Math.max(sel[i],m[i]):(m[i]?Math.round(sel[i]*(1-m[i]/255)):sel[i]);
  updInfo();draw(true)}
function flood(x,y,ok){const m=new Uint8Array(W*H),st=[y*W+x];if(!ok(st[0]))return m;m[st[0]]=255;
  const t=n=>{if(!m[n]&&ok(n)){m[n]=255;st.push(n)}};
  while(st.length){const j=st.pop(),x=j%W,y=(j/W)|0;if(x>0)t(j-1);if(x<W-1)t(j+1);if(y>0)t(j-W);if(y<H-1)t(j+W)}return m}
function selDown(e,p){
  const t=$('stool').value,md=e.shiftKey?'add':e.altKey?'sub':$('sm').value;lmd=md;
  if(t==='poly'){if(lasso.length>2&&hyp(p[0]-lasso[0][0],p[1]-lasso[0][1])<14*KK()){endLasso(md);return}lasso.push(p);draw();return}
  if(t==='lasso'||t==='rect'||t==='ellipse'){lasso=[p];down=true;c.setPointerCapture(e.pointerId);return}
  if(t==='paint'){if(!sel&&md==='sub')return;pushU(selSnap());if(md==='replace'||!sel)sel=new Uint8Array(W*H);lmd=md==='sub'?'sub':'add';down=true;lastP=p;c.setPointerCapture(e.pointerId);paintSel(p,p);return}
  const x=Math.floor(p[0]),y=Math.floor(p[1]),d=base.data,tol=+$('st').value;
  if(t==='object'){const L=new Uint8Array(W*H);for(let n=0;n<L.length;n++){let bd=1e9;palette.forEach((q,k)=>{const v=(d[n*4]-q[0])**2+(d[n*4+1]-q[1])**2+(d[n*4+2]-q[2])**2;if(v<bd){bd=v;L[n]=k}})}
    const sd=L[y*W+x];setSel(flood(x,y,n=>L[n]===sd),md);return}
  const sd=px(p),ok=n=>wd(d[n*4],d[n*4+1],d[n*4+2],sd)<=tol;
  if(t==='wand')setSel(flood(x,y,ok),md);else{const m=new Uint8Array(W*H);for(let n=0;n<m.length;n++)if(ok(n))m[n]=255;setSel(m,md)}
}
function endLasso(md){md=md||lmd;const T=$('stool').value;
  if(T==='paint'){lastP=null;updInfo();draw(true);return}
  if(lasso.length>(T==='lasso'||T==='poly'?2:1)){const g=document.createElement('canvas');g.width=W;g.height=H;const q=g.getContext('2d');q.beginPath();
    const[a0,b0]=lasso[0],[a1,b1]=lasso[lasso.length-1];if(T==='rect')q.rect(a0,b0,a1-a0,b1-b0);else if(T==='ellipse')q.ellipse((a0+a1)/2,(b0+b1)/2,Math.abs(a1-a0)/2||1,Math.abs(b1-b0)/2||1,0,0,7);else lasso.forEach(([x,y],i)=>i?q.lineTo(x,y):q.moveTo(x,y));q.fill();
    const a=q.getImageData(0,0,W,H).data,m=new Uint8Array(W*H);for(let n=0;n<m.length;n++)m[n]=a[n*4+3]>127?255:0;lasso=[];setSel(m,md)}else{lasso=[];draw()}
}
$('alle').onclick=()=>{palette.forEach(q=>{edits.push({f:q.map(Math.round),t:q.map(Math.round),tol:35})});maskIdx=-1;drawEdits();draw()};
document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{
  const prevTab=tab,nextTab=b.dataset.t;
  if(prevTab==='crop'&&nextTab!=='crop'&&base&&CR&&(Math.round(CR.w)<W-1||Math.round(CR.h)<H-1)){applyCrop(true)}
  tab=nextTab;if(tab!=='layers'&&tab!=='text'&&typeDrawing)setTypeDrawing(false);if(tab!=='text')cancelPathInput();if(tab==='text'){if(!active?.tx)active=layers.findLast(l=>l.tx)||null;cropMode=false;refreshLayers()}document.querySelectorAll('.tabs button').forEach(x=>x.classList.toggle('on',x===b));
  document.querySelectorAll('.pn').forEach(x=>x.classList.toggle('on',x.id==='p-'+tab));lasso=[];
  if(tab==='crop'&&base){
    if(cropSrc){reopenCropCanvas()}else{CR=cropInit()}
  }else{CR=null}
  if(CR)cropInfo();c.style.cursor=tab==='layers'?'default':'crosshair';if(tab==='layers')showOverlays();if(tab==='glints')syncGlintTool();if(tab==='film')film.build();if(tab==='grade'){film.syncGrade();if(!base)film.updateScopes()}draw()});
const cmp=$('cmp');cmp.onpointerdown=()=>{showOrig=true;draw()};['pointerup','pointerleave','pointercancel'].forEach(t=>cmp.addEventListener(t,()=>{if(showOrig){showOrig=false;draw()}}));
let dl=null;
if(window.claude&&claude.use)claude.use('downloads').then(m=>{dl=m;$('psv').hidden=!m;if(typeof syncExp==='function')syncExp()}).catch(()=>{});
$('psv').onclick=async()=>{try{await dl.save({filename:'totone-palette.txt',data:palette.map(q=>hex(...q)).join('\n')})}catch(x){}};

$('adjr').onclick=()=>{['ab','ac','as','ah','at','av','ag','ap','lb','sn'].forEach(i=>$(i).value=0);$('lw').value=255;$('lg').value=100;$('dt').value=0;$('gl').value=0;$('ai').checked=false;draw()};
$('flip').onclick=()=>{if(stops){if(base)pushU(toneSnapshot());cur=-1;setStops([...stops].reverse(),stopPos&&stopPos.map(v=>100-v).reverse());showP($('q').value.toLowerCase())}};
function blurMask(m,r){const t=new Float32Array(W*H),o=new Uint8Array(W*H),n=2*r+1,cl=(v,M)=>v<0?0:v>M?M:v;
  for(let y=0;y<H;y++){let a=0;for(let x=-r;x<=r;x++)a+=m[y*W+cl(x,W-1)];for(let x=0;x<W;x++){t[y*W+x]=a/n;a+=m[y*W+cl(x+r+1,W-1)]-m[y*W+cl(x-r,W-1)]}}
  for(let x=0;x<W;x++){let a=0;for(let y=-r;y<=r;y++)a+=t[cl(y,H-1)*W+x];for(let y=0;y<H;y++){o[y*W+x]=a/n;a+=t[cl(y+r+1,H-1)*W+x]-t[cl(y-r,H-1)*W+x]}}return o}
const selOp=k=>{if(!sel)return;pushU(selSnap());const m=blurMask(sel,+$('fe').value);sel=k==='f'?m:k==='m'?m.map(v=>v>127?255:0):m.map(v=>k==='g'?(v>3?255:0):(v>252?255:0));updInfo();draw(true)};
$('feat').onclick=()=>selOp('f');$('grow').onclick=()=>selOp('g');$('shrk').onclick=()=>selOp('s');
const ring=$('ring');
const activeBrushInput=()=>{const kind=brushKind();if(kind)return $(['show','hide','edge','refine'].includes(kind)?'mask-brush-radius':'repair-radius');if(tab==='warp')return $('size');if(tab==='select'&&$('stool').value==='paint')return $('ssz');return null};
c.addEventListener('pointermove',e=>{const bEl=activeBrushInput(),rs=bEl?+bEl.value:0;if(!rs){ring.style.display='none';return}const r=c.getBoundingClientRect(),d=2*rs*r.width/W;Object.assign(ring.style,{display:'block',width:d+'px',height:d+'px',left:e.clientX-d/2+'px',top:e.clientY-d/2+'px'})});
c.addEventListener('pointerleave',()=>ring.style.display='none');
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&!e.shiftKey&&!e.target.matches('textarea,input[type=text],input[type=search],[contenteditable=true]')){e.preventDefault();$('undo').click()}});

$('p2t').onclick=()=>{if(palette.length>1){cur=-1;setStops(palette.map(q=>hex(...q)));showP($('q').value.toLowerCase())}};
let cc=P.length-BASEN;$('addp').onclick=()=>{if(!stops)return;P.push({n:(stops.length===2?'My duo ':stops.length===3?'My trio ':'My tone ')+(++cc),s:stops.slice(),pos:stopPos?stopPos.slice():null,map:mapSettings()});try{localStorage.setItem('totone:mine',JSON.stringify(P.slice(BASEN)))}catch(e){}cur=P.length-1;$('q').value='';document.querySelector('#pcat [data-c=mine]').click();$('plist').scrollTop=1e6};
$('auto').onclick=()=>{if(!base)return;const h=new Uint32Array(256),d=base.data;for(let i=0;i<d.length;i+=4)h[(d[i]*.299+d[i+1]*.587+d[i+2]*.114)|0]++;const n=W*H;let a=0,lo=0,hi=255;for(let i=0;i<256;i++){a+=h[i];if(a>=n*.01){lo=i;break}}a=0;for(let i=255;i>=0;i--){a+=h[i];if(a>=n*.01){hi=i;break}}$('lb').value=Math.min(100,lo);$('lw').value=Math.max(155,hi);draw()};
document.addEventListener('keydown',e=>{if(e.target.matches&&e.target.matches('input,select,textarea'))return;const k=e.key.toLowerCase();
  if((e.ctrlKey||e.metaKey)&&(k==='y'||(k==='z'&&e.shiftKey))){e.preventDefault();$('redo').click()}
  else if(!e.ctrlKey&&!e.metaKey&&/^[1-9]$/.test(k))document.querySelectorAll('.tabs button')[k-1].click();
  else if(k==='['||k===']'){const el=activeBrushInput()||$('size'),step=e.shiftKey?20:Math.max(2,Math.round((+el.max-+el.min)/30));el.value=Math.max(+el.min,Math.min(+el.max,+el.value+(k==='['?-step:step)));el.dispatchEvent(new Event('input',{bubbles:true}));if(typeof showToast==='function')showToast('Brush size: '+el.value+' px',900)}});

let layers=[],active=null,cropMode=false,ls=null,fcv=null;
const syncL=(l,b)=>{l.ver=(l.ver||0)+1;const g=l.cv.getContext('2d');b?g.putImageData(l.d,0,0,b[0],b[1],b[2],b[3]):g.putImageData(l.d,0,0)};
function mkSnap(k,l){
  if(k==='base'){const d=new Uint8ClampedArray(base.data);return()=>{const cur=mkSnap('base');base.data.set(d);return cur}}
  if(k==='layer'){const d=new Uint8ClampedArray(l.d.data);return()=>{const cur=mkSnap('layer',l);l.d.data.set(d);syncL(l);return cur}}
  const L=layers.slice(),Q=L.map(x=>({...x,fxStack:x.fxStack,mask:x.mask,maskEnabled:x.maskEnabled,maskDensity:x.maskDensity,maskFeather:x.maskFeather,depthMap:x.depthMap,clipBelow:x.clipBelow,vectorMask:x.vectorMask})),a=active;
  if(k==='p')return()=>{const cur=mkSnap('p');layers=L;L.forEach((x,i)=>Object.assign(x,Q[i]));active=a;return cur};
  const b=new Uint8ClampedArray(base.data),ds=L.map(x=>new Uint8ClampedArray(x.d.data));
  return()=>{const cur=mkSnap('all');base.data.set(b);layers=L;L.forEach((x,i)=>{Object.assign(x,Q[i]);x.d.data.set(ds[i]);syncL(x)});active=a;return cur}}
const rgba=(h,a)=>{const c=rgb(h);return`rgba(${c[0]},${c[1]},${c[2]},${a})`};
function silOf(l){const k=(l.ver||0)+'|'+l.ol.c;if(l.sil&&l.sil.k===k)return l.sil.cv;const s=document.createElement('canvas');s.width=l.cv.width;s.height=l.cv.height;const g=s.getContext('2d');g.drawImage(l.cv,0,0);g.globalCompositeOperation='source-in';g.fillStyle=l.ol.c;g.fillRect(0,0,s.width,s.height);l.sil={k,cv:s};return s}
// Local masks use the same cropped, rotated coordinate system as their editable layer.
const maskViews=new WeakMap();
function layerMatrix(l){
 const mx=l.cv.width*(1+l.cl-l.cr)/2,my=l.cv.height*(1+l.ct-l.cb)/2;
 return new DOMMatrix().translate(l.x,l.y).rotate(l.r*180/Math.PI).scale(l.s*(l.fl?-1:1),l.s).translate(-mx,-my);
}
function visibleLayer(l){
 const mask=l.maskEnabled!==false&&l.mask,below=l.clipBelow?layers[layers.indexOf(l)-1]:null;
 const vector=l.vectorMask;
 if(!mask&&!below&&!vector&&!l.fxStack?.length)return l;
 const source=below&&visibleLayer(below),placement=below&&layerMatrix(l).inverse().multiply(layerMatrix(below));
 const clipKey=below&&[placement.a,placement.b,placement.c,placement.d,placement.e,placement.f,below.cl,below.cr,below.ct,below.cb,below.vis,below.op,source.ver].join(',');
 let cache=maskViews.get(l);
 if(!cache||cache.stack!==l.fxStack||cache.density!==l.maskDensity||cache.feather!==l.maskFeather||cache.vector!==vector||cache.mask!==mask||cache.cv!==l.cv||cache.ver!==l.ver||cache.clip!==source?.cv||cache.clipKey!==clipKey){
  const cv=bc(l.cv.width,l.cv.height),g=cv.getContext('2d');
  const surface=l.fxStack?.length?layerEffects(l.cv,l.fxStack):l.cv;
  if(vector){g.save();g.clip(vectorPath(vector,cv.width,cv.height));g.drawImage(surface,0,0);g.restore()}else g.drawImage(surface,0,0);
  g.globalCompositeOperation='destination-in';
  if(mask){
   let stencil=mask;
   if(l.maskFeather||l.maskDensity!=null&&l.maskDensity!==100){
    stencil=bc(cv.width,cv.height);const sg=stencil.getContext('2d');
    if(l.maskFeather)sg.filter='blur('+l.maskFeather+'px)';
    sg.drawImage(mask,0,0,cv.width,cv.height);sg.filter='none';
    sg.globalCompositeOperation='destination-over';sg.globalAlpha=1-(l.maskDensity??100)/100;sg.fillRect(0,0,cv.width,cv.height);
   }
   g.drawImage(stencil,0,0,cv.width,cv.height);
  }
  if(below){
   const stencil=bc(cv.width,cv.height),sg=stencil.getContext('2d'),w=source.cv.width,h=source.cv.height;
   if(below.vis){sg.globalAlpha=below.op;sg.setTransform(placement);
    const rect=[w*below.cl,h*below.ct,w*(1-below.cl-below.cr),h*(1-below.ct-below.cb)];
    sg.drawImage(source.cv,...rect,...rect)}
   g.drawImage(stencil,0,0);
  }
  cache={mask,vector,stack:l.fxStack,density:l.maskDensity,feather:l.maskFeather,cv:l.cv,ver:l.ver,clip:source?.cv,clipKey,view:{cv}};maskViews.set(l,cache);
 }
 const view=cache.view;
 // Effect renderers cache by colour and size on the composited view.
 return Object.assign(view,l,{cv:view.cv,sil:view.sil,gc:view.gc,tnc:view.tnc});
}
function drawLayers(g,list=layers){g.imageSmoothingQuality=down?'low':'high';for(const original of list){if(!original.vis||original.op<=0)continue;
  const l=visibleLayer(original);
  const iw=l.cv.width,ih=l.cv.height,sw=iw*(1-l.cl-l.cr),sh=ih*(1-l.ct-l.cb),fxr=(l.sh?l.sh.b+Math.max(Math.abs(l.sh.x),Math.abs(l.sh.y)):0)+(l.ol?l.ol.w*l.s:0)+(l.gl?l.gl.r*1.7+l.gl.sp+4:0),rr=hyp(sw,sh)*l.s/2+fxr;if(l.x+rr<0||l.y+rr<0||l.x-rr>W||l.y-rr>H)continue;
  g.save();g.globalAlpha=l.op;g.globalCompositeOperation=l.bm;g.translate(l.x,l.y);g.rotate(l.r);g.scale(l.s*(l.fl?-1:1),l.s);
  if(l.gl){const gc=glowOf(l),p=gc.pad;g.globalCompositeOperation=l.gl.m==='source-over'?l.bm:l.gl.m;g.drawImage(gc.cv,l.cl*iw,l.ct*ih,sw+2*p,sh+2*p,-sw/2-p,-sh/2-p,sw+2*p,sh+2*p);g.globalCompositeOperation=l.bm}
  if(l.ol){const s2=silOf(l);for(let i=0;i<16;i++){const a=i/16*Math.PI*2;g.drawImage(s2,l.cl*iw,l.ct*ih,sw,sh,-sw/2+Math.cos(a)*l.ol.w,-sh/2+Math.sin(a)*l.ol.w,sw,sh)}}
  if(l.sh){g.shadowColor=rgba(l.sh.c,l.sh.a);g.shadowBlur=l.sh.b;g.shadowOffsetX=l.sh.x;g.shadowOffsetY=l.sh.y}
  if(l.lf){const fs=filtStr(l.lf);if(fs)g.filter=fs}
  g.drawImage(l.tn?tintOf(l):l.cv,l.cl*iw,l.ct*ih,sw,sh,-sw/2,-sh/2,sw,sh);g.restore()}}
function flat(rb){const ok=!cdirty&&fcache&&fcache.width===W&&fcache.height===H;
  if(ok&&!rb)return fcache;
  if(!fcv||fcv.width!==W||fcv.height!==H){fcv=document.createElement('canvas');fcv.width=W;fcv.height=H}
  const g=fcv.getContext('2d',{willReadFrequently:true});g.globalCompositeOperation='source-over';g.globalAlpha=1;
  if(ok&&rb){const x0=rb[0],y0=rb[1],w=rb[2]-rb[0],h=rb[3]-rb[1];g.putImageData(base,0,0,x0,y0,w,h);g.save();g.beginPath();g.rect(x0,y0,w,h);g.clip();drawLayers(g);g.restore();
    const ri=g.getImageData(x0,y0,w,h).data,d=fcache.data;for(let y=0;y<h;y++)d.set(ri.subarray(y*w*4,(y+1)*w*4),((y0+y)*W+x0)*4);return fcache}
  g.putImageData(base,0,0);drawLayers(g);fcache=g.getImageData(0,0,W,H);cdirty=false;return fcache}
const EXT=l=>[l.cv.width*(1-l.cl-l.cr)*l.s/2,l.cv.height*(1-l.ct-l.cb)*l.s/2];
const LOC=(l,p)=>{const a=p[0]-l.x,b=p[1]-l.y,c0=Math.cos(l.r),s0=Math.sin(l.r);return[a*c0+b*s0,-a*s0+b*c0]};
const KK=()=>W/(c.getBoundingClientRect().width||W);
function drawHandles(){const l=active,k=KK(),[hw,hh]=EXT(l),hs=7*k,pts=cropMode?[[-hw,0],[hw,0],[0,-hh],[0,hh]]:[[-hw,-hh],[hw,-hh],[-hw,hh],[hw,hh]];
  ctx.save();ctx.translate(l.x,l.y);ctx.rotate(l.r);
  for(const[col,w]of[['#050c1f',4*k],['#ffffff',1.5*k]]){ctx.strokeStyle=col;ctx.lineWidth=w;ctx.strokeRect(-hw,-hh,hw*2,hh*2);if(!cropMode){ctx.beginPath();ctx.moveTo(0,-hh);ctx.lineTo(0,-hh-30*k);ctx.stroke();ctx.beginPath();ctx.arc(0,-hh-30*k,hs,0,7);ctx.stroke()}}
  ctx.fillStyle='#fff';ctx.strokeStyle='#050c1f';ctx.lineWidth=1.5*k;for(const[x,y]of pts){ctx.fillRect(x-hs,y-hs,hs*2,hs*2);ctx.strokeRect(x-hs,y-hs,hs*2,hs*2)}ctx.restore();for(const g of guides){ctx.beginPath();if(g.x!==undefined){ctx.moveTo(g.x,0);ctx.lineTo(g.x,H)}else{ctx.moveTo(0,g.y);ctx.lineTo(W,g.y)}ctx.strokeStyle='#7fd4ff';ctx.lineWidth=k;ctx.stroke()}}
function layerHit(l,p){const k=KK(),[u,v]=LOC(l,p),[hw,hh]=EXT(l),t=16*k,Hs=cropMode?{l:[-hw,0],r:[hw,0],t:[0,-hh],b:[0,hh]}:{tl:[-hw,-hh],tr:[hw,-hh],bl:[-hw,hh],br:[hw,hh],rot:[0,-hh-30*k]};
  for(const n in Hs)if(hyp(u-Hs[n][0],v-Hs[n][1])<t)return n;return Math.abs(u)<=hw&&Math.abs(v)<=hh?'body':null}
function layerDown(e,p){
  if(pickKey&&active){const q=layerPix(active,p);if(q)$('tk').value=hex(q[0],q[1],q[2]);pickKey=false;$('tkp').classList.remove('on');return}
  let h=active&&active.vis?layerHit(active,p):null;
  if(!h){for(let i=layers.length-1;i>=0;i--){const l=layers[i];if(l.vis&&(tab!=='text'||l.tx)&&layerHit(l,p)==='body'){active=l;h='body';break}}}
  if(!h){active=null;refreshLayers();draw();return}
  if(active.lk){refreshLayers();draw();return}
  ls={h,started:false};down=true;last=p;c.setPointerCapture(e.pointerId);refreshLayers();draw()}
function layerMove(e,p){const l=active;if(!l||!ls)return;if(!ls.started){
    if(hyp(p[0]-last[0],p[1]-last[1])<KK()*2)return;
    pushU(mkSnap('p'));ls.started=true;
  }
  const h=ls.h,iw=l.cv.width,ih=l.cv.height;
  if(h==='body'){l.x+=p[0]-last[0];l.y+=p[1]-last[1];guides=[];
    if(!e.altKey){const k=KK()*8,[hw,hh]=EXT(l),ax=Math.abs(Math.sin(l.r))<.01,sx=(v,g)=>{if(Math.abs(v-g)<k){guides.push({x:g});return g-v}return 0},sy=(v,g)=>{if(Math.abs(v-g)<k){guides.push({y:g});return g-v}return 0};
      let dx=sx(l.x,W/2);if(!dx&&ax)dx=sx(l.x-hw,0)||sx(l.x+hw,W);let dy=sy(l.y,H/2);if(!dy&&ax)dy=sy(l.y-hh,0)||sy(l.y+hh,H);l.x+=dx;l.y+=dy}}
  else if(h==='rot'){let r=Math.atan2(p[1]-l.y,p[0]-l.x)+Math.PI/2;if(e.shiftKey)r=Math.round(r/(Math.PI/12))*Math.PI/12;l.r=r}
  else if(h.length===2){const hd=hyp(iw*(1-l.cl-l.cr),ih*(1-l.ct-l.cb))/2;l.s=Math.max(.02,hyp(p[0]-l.x,p[1]-l.y)/hd)}
  else{const[u,v]=LOC(l,p),[hw,hh]=EXT(l),horiz=h==='l'||h==='r';let key,m;
    if(horiz){m=h==='l'?u+hw:hw-u;key=(h==='l')!==l.fl?'cl':'cr'}else{m=h==='t'?v+hh:hh-v;key=h==='t'?'ct':'cb'}
    const size=horiz?iw:ih,cur=l[key],oth=l[{cl:'cr',cr:'cl',ct:'cb',cb:'ct'}[key]];
    const nv=Math.max(0,Math.min(.9-oth,cur+m/(size*l.s)));m=(nv-cur)*size*l.s;l[key]=nv;
    const sh=(h==='l'||h==='t')?m/2:-m/2,c0=Math.cos(l.r),s0=Math.sin(l.r);
    if(horiz){l.x+=c0*sh;l.y+=s0*sh}else{l.x+=-s0*sh;l.y+=c0*sh}}
  last=p;draw()}
async function addLayer(f){
  if(!base){await load(f);return}
  const request=imageRequest,bmp=await createImageBitmap(f);if(request!==imageRequest){bmp.close();return}
  const sc=workingScale(bmp.width,bmp.height),w=Math.max(1,Math.round(bmp.width*sc)),h=Math.max(1,Math.round(bmp.height*sc)),cv=document.createElement('canvas');cv.width=w;cv.height=h;
  const g=cv.getContext('2d');g.drawImage(bmp,0,0,w,h);bmp.close();const d=g.getImageData(0,0,w,h);pushU(mkSnap('p'));
  const l={cv,d,o:null,lk:false,sh:null,ol:null,x:W/2,y:H/2,s:Math.min(W*.6/w,H*.6/h),r:0,op:1,bm:'source-over',fl:false,vis:true,cl:0,ct:0,cr:0,cb:0,name:(f.name||'Image').replace(/\.[^.]+$/,'').slice(0,24)};
  layers.push(l);active=l;refreshLayers();draw()}
function drawThumbnail(cv,original){
  const l=visibleLayer(original);
  if(original.thumb?.source!==l.cv||original.thumb.version!==l.ver){
    const preview=bc(36,36),scale=Math.min(36/l.cv.width,36/l.cv.height),w=l.cv.width*scale,h=l.cv.height*scale;
    preview.getContext('2d').drawImage(l.cv,(36-w)/2,(36-h)/2,w,h);
    original.thumb={source:l.cv,version:l.ver,preview};
  }
  const g=cv.getContext('2d');g.clearRect(0,0,36,36);g.drawImage(original.thumb.preview,0,0);
}
function refreshLayers(){const a=active;$('lctl').hidden=!a;$('lnote').hidden=layers.length>0;$('bo').disabled=$('bm').disabled=!a;
  $('llist').innerHTML=layers.map((l,i)=>`<div class="lrow${l===a?' on':''}${l.vis?'':' off'}" role="listitem" draggable="true" data-i="${i}"><button class="ib" data-a="vis" aria-label="${l.vis?'Hide':'Show'} ${esc(l.name)}" aria-pressed="${l.vis}">${l.vis?ICON.eye:ICON.eyeoff}</button><canvas width="36" height="36"></canvas><div class="ln">${ren===i?`<input class="rn" value="${esc(l.name)}" aria-label="Layer name">`:`<span class="nm">${esc(l.name)}</span>`}<small>${l.tx?'Text · ':''}${l.mask?(l.maskEnabled===false?'Mask off · ':'Masked · '):''}${l.vectorMask?'Vector mask · ':''}${l.clipBelow?'Clipped · ':''}${l.bm==='source-over'?'Normal':l.bm} \u00b7 ${Math.round(l.op*100)}%</small></div><button class="ib${l.lk?' lk':''}" data-a="lock" aria-label="${l.lk?'Unlock':'Lock'} ${esc(l.name)}" aria-pressed="${!!l.lk}">${l.lk?ICON.lock:ICON.unlock}</button></div>`).reverse().join('');
  $('llist').querySelectorAll('canvas').forEach((cv,k)=>drawThumbnail(cv,layers[layers.length-1-k]));
  syncOverlay(a);
  syncTextPanel();maskControls();if(tab==='glints')syncGlintTool();
  $('edit-glints').hidden=!(a?.overlay&&OVK[a.overlay.i][1]==='photoGlints'&&!a.o);
  if(base&&tab==='layers'&&previewDocument!==orig)showOverlays();
  if(a){$('bo').value=a.op*100;$('bov').textContent=Math.round(a.op*100)+'%';$('bs').value=Math.round(a.s*100);$('lr').value=Math.round(((a.r*180/Math.PI+180)%360+360)%360-180);$('bm').value=a.bm;$('bm').disabled=!!a.lk;$('lcrop').classList.toggle('on',cropMode)}
  $('ltx').hidden=!(a&&a.tx);if(a&&a.tx){const t=a.tx;if($('txt').value!==t.t)$('txt').value=t.t;$('tfont').value=t.f;markFont(t.f);syncTx(t);$('tsz').value=t.sz;$('tcol').value=t.c;$('tw').value=t.w;$('tit').checked=t.it}syncFx()}
const LS=(id,fn)=>{$(id).onpointerdown=()=>active&&pushU(mkSnap('p'));$(id).oninput=()=>{if(active){fn(active,+$(id).value);$('bov').textContent=Math.round(active.op*100)+'%';draw()}}};
LS('bo',(l,v)=>l.op=v/100);LS('bs',(l,v)=>{if(!l.lk)l.s=v/100});LS('lr',(l,v)=>{if(!l.lk)l.r=v*Math.PI/180});
$('text-blend').innerHTML=$('bm').innerHTML;
for(const id of ['bm','text-blend'])$(id).onchange=e=>{
 if(!active||active.lk||id==='text-blend'&&!active.tx)return;
 pushU(mkSnap('p'));active.bm=e.target.value;refreshLayers();draw();
};
$('lgrade').onchange=()=>draw();
async function importLayerFiles(list){
 const files=Array.from(list).filter(f=>f.type.startsWith('image/'));
 if(!files.length)return;
 if(!base&&!await load(files.shift()))return;
 const doc=imageRequest,failed=[];
 for(const file of files){
  if(doc!==imageRequest)return;
  try{await addLayer(file)}catch{failed.push(file.name||'Image')}
 }
 if(failed.length&&doc===imageRequest)alert('Could not open '+failed.join(', ')+'.');
}
$('file2').onchange=e=>{importLayerFiles(e.target.files);e.target.value=''};
const act=(fn,free)=>()=>{if(!active||(active.lk&&!free))return;pushU(mkSnap('p'));fn(active);refreshLayers();draw()};
$('lflip').onclick=act(l=>l.fl=!l.fl);$('lcen').onclick=act(l=>{l.x=W/2;l.y=H/2});
$('lfit').onclick=act(l=>{l.s=Math.max(W/(l.cv.width*(1-l.cl-l.cr)),H/(l.cv.height*(1-l.ct-l.cb)));l.x=W/2;l.y=H/2});
$('lcrop').onclick=()=>{cropMode=!cropMode;refreshLayers();draw()};
$('lrc').onclick=act(l=>{const ox=(l.cl-l.cr)/2*l.cv.width*l.s*(l.fl?-1:1),oy=(l.ct-l.cb)/2*l.cv.height*l.s,c0=Math.cos(l.r),s0=Math.sin(l.r);l.x-=c0*ox-s0*oy;l.y-=s0*ox+c0*oy;l.cl=l.cr=l.ct=l.cb=0});
$('lup').onclick=act(l=>{const i=layers.indexOf(l);if(i<layers.length-1){layers[i]=layers[i+1];layers[i+1]=l}},1);
$('ldn').onclick=act(l=>{const i=layers.indexOf(l);if(i>0){layers[i]=layers[i-1];layers[i-1]=l}},1);
$('ldel').onclick=act(l=>{layers=layers.filter(x=>x!==l);active=layers[layers.length-1]||null},1);
$('ldup').onclick=act(l=>{const w=l.cv.width,h=l.cv.height,cv=document.createElement('canvas');cv.width=w;cv.height=h;const n={...l,cv,d:new ImageData(new Uint8ClampedArray(l.d.data),w,h),o:l.o?new ImageData(new Uint8ClampedArray(l.o.data),w,h):null,x:l.x+30,y:l.y+30,name:l.name+' copy'};syncL(n);layers.push(n);active=n},1);

let lmd='replace',lastP=null;
const selSnap=()=>{const s0=sel?sel.slice():null;return()=>{const cur=selSnap();sel=s0;updInfo();return cur}};
function updInfo(){maskControls();let t='Nothing selected';if(sel){let n=0;for(let i=0;i<sel.length;i++)if(sel[i]>127)n++;t=n?`${(n/sel.length*100).toFixed(1)}% of the image selected`:'Selection is empty'}$('sinfo').textContent=t}
function paintSel(a,b){if(!sel||!a)return;const r=+$('ssz').value,sub=lmd==='sub',dist=hyp(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(dist/(r/4)));
  for(let i=1;i<=n;i++){const cx=a[0]+(b[0]-a[0])*i/n,cy=a[1]+(b[1]-a[1])*i/n,x0=Math.max(0,Math.floor(cx-r)),x1=Math.min(W-1,Math.ceil(cx+r)),y0=Math.max(0,Math.floor(cy-r)),y1=Math.min(H-1,Math.ceil(cy+r));
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const d=hyp(x-cx,y-cy);if(d>=r)continue;const v=d<r*.7?255:255*(1-(d-r*.7)/(r*.3)),j=y*W+x;sel[j]=sub?Math.min(sel[j],255-v):Math.max(sel[j],v)}}
  draw(true)}
const lumSel=(a,b)=>{if(!base)return;const d=base.data,m=new Uint8Array(W*H);for(let j=0;j<m.length;j++){const l=d[j*4]*.299+d[j*4+1]*.587+d[j*4+2]*.114;m[j]=l>=a&&l<=b?255:0}setSel(m)};
function autoSubject(){if(!base)return;const d=base.data,ring=Math.max(4,Math.round(Math.min(W,H)*.03));let r=0,g=0,b=0,n=0;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(x<ring||y<ring||x>=W-ring||y>=H-ring){const i=(y*W+x)*4;r+=d[i];g+=d[i+1];b+=d[i+2];n++}
  const bg=[r/n,g/n,b/n],tol=+$('st').value*1.3;let m=new Uint8Array(W*H);for(let j=0;j<m.length;j++){const i=j*4;if(wd(d[i],d[i+1],d[i+2],bg)>tol)m[j]=255}
  m=blurMask(m,Math.max(2,Math.round(Math.min(W,H)/150)));for(let j=0;j<m.length;j++)m[j]=m[j]>127?255:0;
  const lab=new Int32Array(W*H),st=new Int32Array(W*H);let best=0,bestId=0,id=0;
  for(let s0=0;s0<m.length;s0++){if(!m[s0]||lab[s0])continue;id++;let sp=0,cnt=0;st[sp++]=s0;lab[s0]=id;
    while(sp){const j=st[--sp],x=j%W,y=(j/W)|0;cnt++;if(x>0&&m[j-1]&&!lab[j-1]){lab[j-1]=id;st[sp++]=j-1}if(x<W-1&&m[j+1]&&!lab[j+1]){lab[j+1]=id;st[sp++]=j+1}if(y>0&&m[j-W]&&!lab[j-W]){lab[j-W]=id;st[sp++]=j-W}if(y<H-1&&m[j+W]&&!lab[j+W]){lab[j+W]=id;st[sp++]=j+W}}
    if(cnt>best){best=cnt;bestId=id}}
  const out=new Uint8Array(W*H);if(bestId)for(let j=0;j<out.length;j++)if(lab[j]===bestId)out[j]=255;setSel(out)}
$('sall').onclick=()=>{if(!base)return;pushU(selSnap());sel=new Uint8Array(W*H).fill(255);updInfo();draw(true)};
$('inv').onclick=()=>{if(!base)return;pushU(selSnap());sel=sel?sel.map(v=>255-v):new Uint8Array(W*H);updInfo();draw(true)};
$('clr').onclick=()=>{if(sel){pushU(selSnap());sel=null;updInfo();draw(true)}};
$('ssh').onclick=()=>lumSel(0,85);$('smd').onclick=()=>lumSel(86,170);$('shi').onclick=()=>lumSel(171,255);$('auto2').onclick=autoSubject;$('smt').onclick=()=>selOp('m');
const HINT={wand:'Wand selects touching colours of similar tone.',range:'Colour range selects that colour everywhere in the image.',object:'Object selects the region of the clicked palette colour.',paint:'Paint a selection with the brush. Subtract mode erases it.',lasso:'Drag to draw freehand around an area.',poly:'Click points, then double-click or click the first point to close.',rect:'Drag a rectangle.',ellipse:'Drag an ellipse.'};
document.querySelectorAll('#stools button').forEach(b=>b.onclick=()=>{$('stool').value=b.dataset.tool;lasso=[];$('shint').textContent=HINT[b.dataset.tool]+' Hold Shift to add, Alt to subtract.';document.querySelectorAll('#stools button').forEach(x=>x.classList.toggle('on',x===b));draw()});
document.querySelectorAll('#smg button').forEach(b=>b.onclick=()=>{$('sm').value=b.dataset.m;document.querySelectorAll('#smg button').forEach(x=>x.classList.toggle('on',x===b))});
c.addEventListener('dblclick',()=>{if(tab==='select'&&$('stool').value==='poly'&&lasso.length>2)endLasso()});
document.addEventListener('keydown',e=>{if(e.target.matches&&e.target.matches('input,select,textarea'))return;if(e.key==='Escape'&&lasso.length){lasso=[];draw()}if(e.key==='Enter'&&tab==='select'&&lasso.length>2)endLasso();if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='d'){e.preventDefault();$('clr').click()}});
$('rst').onclick=()=>{if(base)pushU(toneSnapshot());cur=-1;$('q').value='';$('str').value=100;resetCustom();setMapSettings();setStops(null);showP();$('plist').scrollTop=0};

const svg=b=>`<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">${b}</svg>`,EYE='<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3" fill="currentColor"/>';
const ICON={eye:svg(EYE),eyeoff:svg(EYE+'<path d="M3 3l18 18"/>'),lock:svg('<rect x="5" y="11" width="14" height="10" rx="1" fill="currentColor"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),unlock:svg('<rect x="5" y="11" width="14" height="10" rx="1"/><path d="M8 11V8a4 4 0 0 1 7-2.6"/>')};
const ensureO=l=>{if(!l.o)l.o=new ImageData(new Uint8ClampedArray(l.d.data),l.cv.width,l.cv.height)};
function getOut(){if(!outIm||outIm.width!==W||outIm.height!==H)outIm=new ImageData(W,H);return outIm}
function isIdent(original,mask,split){const N=id=>+$(id).value;return!edits.length&&(!LUT||!N('str')||!$('gradient-enabled').checked)&&!($('reduce').checked&&palette.length)&&!N('ab')&&!N('ac')&&!N('as')&&!N('ah')&&!N('at')&&N('lb')===0&&N('lw')===255&&N('lg')===100&&!N('sn')&&!N('dt')&&!N('av')&&!N('ag')&&N('ap')<=1&&!$('ai').checked&&N('apx')<=1&&!sel&&mask<0&&!split&&!original}
let chk=null;
function edgeInspect(){return tab==='layers'&&$('mask-panel').open&&['refine','edge'].includes($('mask-paint').value)&&$('edge-back').value!=='image'}
function soloDraw(){ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;if(!chk){chk=document.createElement('canvas');chk.width=chk.height=24;const g=chk.getContext('2d');g.fillStyle='#cfd5e4';g.fillRect(0,0,24,24);g.fillStyle='#9aa3bd';g.fillRect(0,0,12,12);g.fillRect(12,12,12,12)}
  ctx.fillStyle=edgeInspect()?($('edge-back').value==='light'?'#f6f6f6':'#171717'):ctx.createPattern(chk,'repeat');ctx.fillRect(0,0,W,H);drawLayers(ctx,[{...visibleLayer(active),fxStack:null,mask:null,vectorMask:null,clipBelow:false,op:1,bm:'source-over',vis:true}]);if(!brushKind()&&!editingVector())drawHandles();drawVectorGuides();drawRepairSource()}
function layerPix(l,p){const iw=l.cv.width,ih=l.cv.height,sw=iw*(1-l.cl-l.cr),sh=ih*(1-l.ct-l.cb),a=p[0]-l.x,b=p[1]-l.y,c0=Math.cos(l.r),s0=Math.sin(l.r);let u=(a*c0+b*s0)/l.s;const v=(-a*s0+b*c0)/l.s;if(l.fl)u=-u;
  const x=Math.round(u+l.cl*iw+sw/2),y=Math.round(v+l.ct*ih+sh/2);if(x<0||y<0||x>=iw||y>=ih)return null;const q=(y*iw+x)*4,d=l.d.data;return[d[q],d[q+1],d[q+2],d[q+3]]}
const ss=(e0,e1,x)=>{const t=Math.min(1,Math.max(0,(x-e0)/(e1-e0||1)));return t*t*(3-2*t)};
function aop(fn){const l=active;if(!l||l.lk)return;ensureO(l);pushU(mkSnap('layer',l));fn(l.d.data,l.cv.width,l.cv.height,l);syncL(l);refreshLayers();draw()}
$('tkp').onclick=()=>{pickKey=!pickKey;$('tkp').classList.toggle('on',pickKey)};
$('tkr').onclick=()=>aop(d=>{const k=rgb($('tk').value),tol=+$('ttl').value,band=Math.max(1,tol*+$('tsf').value/100);for(let i=0;i<d.length;i+=4)d[i+3]*=ss(tol,tol+band,wd(d[i],d[i+1],d[i+2],k))});
$('tgf').onclick=()=>aop((d,iw,ih)=>{const dir=$('tgd').value,len=$('tgl').value/100;for(let y=0;y<ih;y++)for(let x=0;x<iw;x++){const pos=dir==='l'?x/iw:dir==='r'?1-x/iw:dir==='t'?y/ih:1-y/ih;d[(y*iw+x)*4+3]*=ss(0,len,pos)}});
$('tef').onclick=()=>aop((d,iw,ih)=>{const r=Math.max(1,$('ted').value/100*Math.min(iw,ih)/2);for(let y=0;y<ih;y++)for(let x=0;x<iw;x++)d[(y*iw+x)*4+3]*=ss(0,r,Math.min(x,y,iw-1-x,ih-1-y))});
$('tia').onclick=()=>aop(d=>{for(let i=3;i<d.length;i+=4)d[i]=255-d[i]});
$('tra').onclick=()=>aop((d,iw,ih,l)=>{const o=l.o.data;for(let i=3;i<d.length;i+=4)d[i]=o[i]});
const lumKey=lights=>aop(d=>{const th=+$('tth').value;for(let i=0;i<d.length;i+=4){const lum=d[i]*.299+d[i+1]*.587+d[i+2]*.114,t=ss(th-24,th+24,lum);d[i+3]*=lights?1-t:t}});
$('tlt').onclick=()=>lumKey(true);$('tdk').onclick=()=>lumKey(false);
$('lsolo').onchange=()=>draw(true);
function moveLayer(a,b){if(a===b||a<0||b<0||a>=layers.length||b>=layers.length)return;pushU(mkSnap('p'));const[l]=layers.splice(a,1);layers.splice(b,0,l);refreshLayers();draw()}
$('lmrg').onclick=()=>{const l=active,i=layers.indexOf(l);if(!l)return;pushU(i===0?mkSnap('all'):mkSnap('p'));
  if(i===0){cdirty=true;const g=document.createElement('canvas');g.width=W;g.height=H;const q=g.getContext('2d',{willReadFrequently:true});q.putImageData(base,0,0);drawLayers(q,[l]);base.data.set(q.getImageData(0,0,W,H).data);layers=layers.filter(x=>x!==l);active=layers[0]||null;extract()}
  else{const b=layers[i-1],cv=document.createElement('canvas');cv.width=W;cv.height=H;const q=cv.getContext('2d');drawLayers(q,[b,l]);const d=q.getImageData(0,0,W,H);
    const m={cv,d,o:null,lk:false,sh:null,ol:null,x:W/2,y:H/2,s:1,r:0,op:1,bm:'source-over',fl:false,vis:true,cl:0,ct:0,cr:0,cb:0,name:b.name};layers.splice(i-1,2,m);active=m}
  refreshLayers();draw()};
$('lflt').onclick=()=>{if(!base||!layers.length)return;pushU(mkSnap('all'));cdirty=true;base.data.set(flat().data);layers=[];active=null;extract();refreshLayers();draw()};
const L$=$('llist');
function commitRen(v){if(ren<0)return;const l=layers[ren];ren=-1;v=String(v).trim();if(v&&l&&v!==l.name){pushU(mkSnap('p'));l.name=v.slice(0,40)}refreshLayers()}
L$.onclick=e=>{const row=e.target.closest('.lrow');if(!row||e.target.closest('.rn'))return;const l=layers[+row.dataset.i],b=e.target.closest('.ib');
  if(b){pushU(mkSnap('p'));if(b.dataset.a==='vis'){l.vis=!l.vis;if(e.altKey)layers.forEach(x=>x.vis=x===l)}else l.lk=!l.lk}
  active=l;refreshLayers();draw()};
L$.ondblclick=e=>{const nm=e.target.closest('.nm');if(nm){ren=+nm.closest('.lrow').dataset.i;refreshLayers()}};
L$.addEventListener('keydown',e=>{if(e.target.classList.contains('rn')){if(e.key==='Enter')commitRen(e.target.value);else if(e.key==='Escape'){ren=-1;refreshLayers()}}});
L$.addEventListener('focusout',e=>{if(e.target.classList&&e.target.classList.contains('rn'))commitRen(e.target.value)});
let dragI=-1;
L$.addEventListener('dragstart',e=>{const r=e.target.closest('.lrow');if(!r)return;dragI=+r.dataset.i;if(e.dataTransfer){e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',String(dragI))}});
L$.addEventListener('dragover',e=>{if(dragI<0)return;e.preventDefault();L$.querySelectorAll('.dov').forEach(x=>x.classList.remove('dov'));const r=e.target.closest('.lrow');if(r)r.classList.add('dov')});
L$.addEventListener('drop',e=>{e.preventDefault();const r=e.target.closest('.lrow');if(r&&dragI>=0)moveLayer(dragI,+r.dataset.i);dragI=-1});
L$.addEventListener('dragend',()=>{dragI=-1;L$.querySelectorAll('.dov').forEach(x=>x.classList.remove('dov'))});
document.addEventListener('keydown',e=>{const t=e.target;if(t.matches&&t.matches('input,select,textarea'))return;if((tab!=='layers'&&tab!=='text')||!active)return;const k=e.key;
  if(/^Arrow/.test(k)){if(active.lk)return;e.preventDefault();const n=e.shiftKey?10:1,now=Date.now();if(now-nudgeT>800)pushU(mkSnap('p'));nudgeT=now;active.x+=k==='ArrowRight'?n:k==='ArrowLeft'?-n:0;active.y+=k==='ArrowDown'?n:k==='ArrowUp'?-n:0;draw()}
  else if(k==='Delete'||k==='Backspace'){e.preventDefault();$('ldel').click()}});
document.addEventListener('paste',e=>{const it=[...(e.clipboardData&&e.clipboardData.items||[])].find(i=>i.type.startsWith('image/'));const f=it&&it.getAsFile();if(f){e.preventDefault();if(film?.isDouble())film.loadSecond(f);else importLayerFiles([f])}});
refreshLayers();

const B4=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
document.querySelectorAll('#pcat button').forEach(b=>b.onclick=()=>{pcat=b.dataset.c;document.querySelectorAll('#pcat button').forEach(x=>x.classList.toggle('on',x===b));showP($('q').value.toLowerCase());$('plist').scrollTop=0});
$('rlook').onclick=()=>{
  if(!base)return;
  pushU(documentSnapshot());
  if(typeof window.resetPolaroidStudio==='function')window.resetPolaroidStudio(true);
  const st=window._totoneInitialStart;
  if(st&&st.data){
    W=st.W;H=st.H;c.width=W;c.height=H;
    base=new ImageData(new Uint8ClampedArray(st.data),W,H);
    orig=new ImageData(new Uint8ClampedArray(st.data),W,H);
    layers=[];active=null;sel=null;cropSrc=null;updCropRestoreUI();
    outIm=null;fcache=null;cdirty=true;SCR.clear();jit=null;
    if(zoomV&&$('zoom').value!=='0')c.style.width=W*zoomV+'px';
    if(tab==='crop'){CR=cropInit();cropInfo()}
  }
  film.reset(true,false);
  edits=[];maskIdx=-1;drawEdits();cur=-1;
  $('str').value=100;$('reduce').checked=false;$('spl').checked=false;
  $('adjr')?.click();
  $('gp-reset')?.click();
  $('grade-reset')?.click();
  $('pc-reset')?.click();
  $('glint-reset')?.click();
  $('ov-reset')?.click();
  $('ps-skew-reset')?.click();
  ['lr-exp','lr-con','lr-hi','lr-sh','lr-wh','lr-bl','lr-temp','lr-tint','lr-tex','lr-cla','lr-deh','lr-vib','lr-sat','film-angle'].forEach(id=>{
    const el=$(id);if(el){el.value='0';el.dispatchEvent(new Event('input',{bubbles:true}))}
  });
  $('apx').value=1;pxo();setMapSettings();setStops(null);
  if(typeof syncAutoOutputs==='function')syncAutoOutputs();
  refreshLayers();extract();updInfo();showP($('q').value.toLowerCase());draw();
  if(typeof showToast==='function')showToast('Reset everything back to original photo',1800);
};
const help=$('help');$('helpb').onclick=()=>help.hidden=false;help.onclick=()=>help.hidden=true;
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!help.hidden)help.hidden=true});
let textEdit=null;
const TEXT_DEFAULTS={sx:100,sy:100,wrap:0,letterCase:'typed',fill:'solid',end:'#ff628c',stroke:'#000000',strokeWidth:0,boxHeight:0,valign:'top',paragraphGap:0,
  wordSpace:0,fillAngle:45,underline:false,strike:false,bg:false,bgColor:'#111827',bgOpacity:80,bgPadding:12,bgRadius:12};
const textMeasure=document.createElement('canvas').getContext('2d');
const graphemes=new Intl.Segmenter(undefined,{granularity:'grapheme'});
function wrapText(line,limit,measure){
  if(!limit||measure(line)<=limit)return [line];
  const lines=[];
  let row='';
  for(const word of line.match(/\S+|\s+/gu)||[]){
    if(row&&measure(row+word)>limit){lines.push(row.trimEnd());row=''}
    if(!row&&!word.trim())continue;
    if(measure(word)<=limit){row+=word;continue}
    for(const {segment} of graphemes.segment(word)){
      if(row&&measure(row+segment)>limit){lines.push(row);row=''}
      row+=segment;
    }
  }
  if(row||!lines.length)lines.push(row.trimEnd());
  return lines;
}
function measureTextLayout(tx){
  const {wrap,letterCase,strokeWidth,boxHeight,paragraphGap,bg,bgPadding,wordSpace}={...TEXT_DEFAULTS,...tx};
  const m=textMeasure,font=`${tx.it?'italic ':''}${tx.w} ${tx.sz}px ${fam(tx.f)}`,spacing=(tx.ls||0)*tx.sz/100+'px';
  const wordGap=wordSpace*tx.sz/100;
  m.font=font;m.letterSpacing=spacing;m.wordSpacing=wordGap+'px';
  const source=String(tx.t||' '),value=letterCase==='upper'?source.toUpperCase():letterCase==='lower'?source.toLowerCase():source;
  const paragraphs=value.split('\n');
  const lines=paragraphs.flatMap((paragraph,index)=>{
    const rows=wrapText(paragraph,wrap,v=>m.measureText(v).width);
    return rows.map((text,row)=>{
      const justify=tx.al==='justify'&&wrap&&row<rows.length-1;
      if(justify)text=text.trim().replace(/\s+/gu,' ');
      return {text,index,gaps:justify?(text.match(/ /g)||[]).length:0,metrics:m.measureText(text)};
    });
  });
  const fontMetrics=m.measureText('Mg');
  let width=wrap||1,ascent=fontMetrics.fontBoundingBoxAscent||tx.sz,descent=fontMetrics.fontBoundingBoxDescent||tx.sz*.25,overhang=0;
  for(const {metrics:bounds} of lines){
    width=Math.max(width,bounds.width);
    ascent=Math.max(ascent,bounds.actualBoundingBoxAscent);
    descent=Math.max(descent,bounds.actualBoundingBoxDescent);
    overhang=Math.max(overhang,bounds.actualBoundingBoxLeft,bounds.actualBoundingBoxRight-bounds.width);
  }
  const pad=Math.ceil(overhang+strokeWidth+tx.sz*.15+(bg?bgPadding:0)),lh=Math.max(1,tx.sz*(tx.lh||120)/100);
  const contentHeight=ascent+descent+(lines.length-1)*lh+(paragraphs.length-1)*paragraphGap;
  const height=Math.max(contentHeight,boxHeight),w=width+2*pad,h=height+2*pad;
  return {width,height,contentHeight,font,spacing,wordGap,pad,lh,w,h,ascent,lines};
}
function flatTextCanvas(tx){
  const {sx,sy,fill,end,fillAngle,stroke,strokeWidth,valign,paragraphGap,underline,strike,bg,bgColor,bgOpacity,bgRadius}={...TEXT_DEFAULTS,...tx};
  const {width,height,contentHeight,font,spacing,wordGap,pad,lh,w,h,ascent,lines}=measureTextLayout(tx);
  const offset=(height-contentHeight)*(valign==='center'?.5:valign==='bottom'?1:0);
  const scaleX=sx/100,scaleY=sy/100,fit=Math.min(1,4000/(w*scaleX),4000/(h*scaleY),Math.sqrt(6000000/(w*h*scaleX*scaleY)));
  const cv=bc(Math.ceil(w*scaleX*fit),Math.ceil(h*scaleY*fit)),g=cv.getContext('2d',{willReadFrequently:true});
  g.scale(scaleX*fit,scaleY*fit);g.font=font;g.letterSpacing=spacing;
  if(bg&&bgOpacity){
    g.fillStyle=rgba(bgColor,bgOpacity/100);g.beginPath();
    g.roundRect(0,0,w,h,Math.min(bgRadius,w/2,h/2));g.fill();
  }
  g.fillStyle=tx.c;g.strokeStyle=stroke;g.lineWidth=Math.max(1,strokeWidth*2);g.lineJoin='round';
  if(fill==='photo'&&tx.photo){
    const img=tx.photo,k=Math.max(w/img.width,h/img.height)*(tx.photoScale||100)/100;
    const left=(w-img.width*k)*(.5-(tx.photoX||0)/200),top=(h-img.height*k)*(.5-(tx.photoY||0)/200);
    const pattern=g.createPattern(img,'no-repeat');pattern.setTransform(new DOMMatrix().translate(left,top).scale(k));g.fillStyle=pattern;
  }else if(fill!=='solid'&&fill!=='photo'){
    const cx=pad+width/2,cy=pad+height/2;
    let gradient;
    if(fill==='radial'){
      gradient=g.createRadialGradient(cx,cy,0,cx,cy,Math.hypot(width,height)/2);
    }else{
      const angle=(fill==='horizontal'?0:fill==='vertical'?90:fillAngle)*Math.PI/180;
      const dx=Math.cos(angle),dy=Math.sin(angle),length=(Math.abs(dx)*width+Math.abs(dy)*height)/2;
      gradient=g.createLinearGradient(cx-dx*length,cy-dy*length,cx+dx*length,cy+dy*length);
    }
    gradient.addColorStop(0,tx.c);gradient.addColorStop(1,end);g.fillStyle=gradient;
  }
  const position=tx.al==='center'?.5:tx.al==='right'?1:0;
  lines.forEach(({text,index,gaps,metrics},i)=>{
    const extra=gaps?Math.max(0,(width-metrics.width)/gaps):0;
    g.wordSpacing=(wordGap+extra)+'px';
    const x=pad+(width-metrics.width)*position,y=pad+offset+ascent+i*lh+index*paragraphGap;
    if(strokeWidth)g.strokeText(text,x,y);
    g.fillText(text,x,y);
    const lineWidth=metrics.width+gaps*extra,thickness=Math.max(1,tx.sz*.055);
    if(underline)g.fillRect(x,y+tx.sz*.09,lineWidth,thickness);
    if(strike)g.fillRect(x,y-tx.sz*.32,lineWidth,thickness);
  });
  return cv;
}
const TYPE_FORMS={plain:'Straight',arc:'Arc',lower:'Arc lower',upper:'Arc upper',arch:'Arch',bulge:'Bulge',shellLower:'Shell lower',shellUpper:'Shell upper',flag:'Flag',wave:'Wave',fish:'Fish',rise:'Rise',fisheye:'Fisheye',inflate:'Inflate',squeeze:'Squeeze',twist:'Twist',taper:'Taper',custom:'Custom envelope'};
const TYPE_SHAPE={shape:'plain',bend:65,slant:0,knots:null,sideBows:null,band:'off',cut:52,pull:100,rows:1,rowGap:12,travel:0,depth:0,direction:38,side:'#984522',lighting:55,trees:false};
const freshKnots=(count=4)=>Array.from({length:count*2},(_,i)=>[i%count/(count-1),i<count?0:1]);
const typeLimit=(w,h)=>Math.min(1,4000/Math.max(1,w),4000/Math.max(1,h),Math.sqrt(6000000/Math.max(1,w*h)));
function tightFace(cv){
 const g=cv.getContext('2d'),data=g.getImageData(0,0,cv.width,cv.height).data;
 let l=cv.width,r=-1,t=cv.height,b=-1;
 for(let y=0;y<cv.height;y++)for(let x=0;x<cv.width;x++)if(data[(y*cv.width+x)*4+3]){
  if(x<l)l=x;if(x>r)r=x;if(y<t)t=y;if(y>b)b=y;
 }
 if(r<0)return cv;
 const out=bc(r-l+5,b-t+5);out.getContext('2d').drawImage(cv,l,t,r-l+1,b-t+1,2,2,r-l+1,b-t+1);out.inkLeft=l-2;return out;
}
// Insert a narrow cross-section through the ink. Stems extend while bowls and terminals retain their shape.
function letterEdges(tx,original,ink){
 const layout=measureTextLayout(tx),line=layout.lines.reduce((a,b)=>a.metrics.width>=b.metrics.width?a:b);
 const m=textMeasure,scale=original.width/layout.w,justify=line.gaps?Math.max(0,(layout.width-line.metrics.width)/line.gaps):0;
 m.font=layout.font;m.letterSpacing=layout.spacing;m.wordSpacing=(layout.wordGap+justify)+'px';
 const align=tx.al==='center'?.5:tx.al==='right'?1:0;
 const start=(layout.pad+align*(layout.width-line.metrics.width))*scale-(ink.inkLeft||0);
 const edges=[0];let previous='',advance=0;
 for(const {segment} of graphemes.segment(line.text)){
  // Measuring a pair preserves kerning without remeasuring an ever-growing paragraph.
  const pair=m.measureText(previous+segment).width,prev=previous?m.measureText(previous).width:0;
  advance+=pair-prev;previous=segment;
  const edge=Math.max(0,Math.min(ink.width,Math.round(start+advance*scale)));
  if(edge>edges[edges.length-1])edges.push(edge);
 }
 if(edges.length>1)edges[edges.length-1]=ink.width;else edges.push(ink.width);
 return edges;
}
function stretchRows(face,s,edges){
 if((s.band==='off'||!s.pull)&&s.rows===1)return face;
 const horizontal=s.band==='x'||s.band==='letter',vertical=s.band==='y',length=horizontal?face.width:face.height;
 const extra=(horizontal||vertical)?Math.round(length*s.pull/100):0;
 const rowW=face.width+(horizontal?extra:0),rowH=face.height+(vertical?extra:0),step=rowH*(1+s.rowGap/100);
 const height=rowH+step*(s.rows-1),fit=typeLimit(rowW,height),cv=bc(Math.max(1,Math.ceil(rowW*fit)),Math.max(1,Math.ceil(height*fit))),g=cv.getContext('2d');
 g.scale(fit,fit);
 for(let i=0;i<s.rows;i++){
  const at=Math.max(0,Math.min(1,(s.cut+s.travel*(s.rows>1?i/(s.rows-1):0))/100)),cut=Math.min(length-1,Math.floor(at*length));
  g.save();g.translate(0,step*i);
  if(!extra)g.drawImage(face,0,0);
  else if(horizontal){
   let left=cut,right=cut+1;
   if(edges){const end=edges.findIndex(x=>x>cut);left=edges[end-1];right=edges[end]}
   if(left)g.drawImage(face,0,0,left,face.height,0,0,left,face.height);
   g.drawImage(face,left,0,right-left,face.height,left,0,extra+right-left,face.height);
   if(right<length)g.drawImage(face,right,0,length-right,face.height,right+extra,0,length-right,face.height);
  }else{
   if(cut)g.drawImage(face,0,0,face.width,cut,0,0,face.width,cut);
   g.drawImage(face,0,cut,face.width,1,0,cut,face.width,extra+1);
   if(cut+1<length)g.drawImage(face,0,cut+1,face.width,length-cut-1,0,cut+1+extra,face.width,length-cut-1);
  }
  g.restore();
 }
 return cv;
}
function knotAt(knots,row,u,axis){
 const last=knots.length/2-1,z=Math.max(0,Math.min(last,u*last)),i=Math.min(last-1,Math.floor(z)),t=z-i;
 const point=k=>knots[row+Math.max(0,Math.min(last,k))][axis],a=point(i),b=point(i+1);
 const m=i?(b-point(i-1))/2:b-a,n=i<last-1?(point(i+2)-a)/2:b-a;
 return a+(m+((3*(b-a)-2*m-n)+(2*(a-b)+m+n)*t)*t)*t;
}
function envelopeUV(knots,bows,u,v){
 const xt=knotAt(knots,0,u,0),yt=knotAt(knots,0,u,1);
 const count=knots.length/2;let x=xt+(knotAt(knots,count,u,0)-xt)*v,y=yt+(knotAt(knots,count,u,1)-yt)*v;
 if(bows){const cross=4*v*(1-v),a=cross*(1-u)**2,b=cross*u*u;x+=a*bows[0][0]+b*bows[1][0];y+=a*bows[0][1]+b*bows[1][1]}
 return [x,y];
}
function envelopeHandles(tx){
 const k=tx.knots||freshKnots();return [...k,envelopeUV(k,tx.sideBows,0,.5),envelopeUV(k,tx.sideBows,1,.5)];
}
function typeProject(s,w,h,u,v){
 const t=2*u-1,z=2*v-1,cap=1-t*t,a=s.bend/100;
 let x=u*w,y=v*h;
 switch(s.shape){
 case 'arc':{
  if(Math.abs(a)<.001)break;
  const angle=a*1.02,r=w/(2*Math.sin(angle)),radial=(v-.5)*Math.min(h,Math.abs(r)*1.6);
  x=w/2+(r-radial)*Math.sin(t*angle);y=h/2+r*(Math.cos(angle)-Math.cos(t*angle))+radial*Math.cos(t*angle);break;
 }
 case 'upper':y-=a*cap*(1-v)*h*.9;break;
 case 'lower':y+=a*cap*v*h*.9;break;
 case 'arch':y-=a*cap*h*.76;break;
 case 'bulge':y+=a*z*cap*h*.57;break;
 case 'shellUpper':x+=a*t*(1-v)*w*.17;y-=a*(1-v)*cap*h*.95;break;
 case 'shellLower':x+=a*t*v*w*.17;y+=a*v*cap*h*.95;break;
 case 'flag':y+=a*Math.sin(2*Math.PI*u)*h*.43;x+=a*z*cap*w*.015;break;
 case 'wave':y+=a*Math.sin(2*Math.PI*u+.4)*h*(.12+.43*v);break;
 case 'fish':y-=a*z*t*h*.45;x+=a*cap*w*.09;break;
 case 'rise':y-=a*t*h*.63;break;
 case 'fisheye':x+=a*t*cap*w*.27;y+=a*z*cap*h*.24;break;
 case 'inflate':x+=a*t*(1-z*z)*w*.095;y+=a*z*cap*h*.28;break;
 case 'squeeze':x-=a*t*(1-z*z)*w*.17;y-=a*z*cap*h*.25;break;
 case 'twist':x+=a*Math.sin(Math.PI*z)*w*.075;y+=a*Math.sin(Math.PI*t)*h*.3;break;
 case 'taper':y-=a*t*z*h*.42;break;
 case 'custom':{
  const uv=envelopeUV(s.knots,s.sideBows,u,v);x=uv[0]*w;y=uv[1]*h;break;
 }
 }
 return [x+(h/2-y)*Math.tan(s.slant*Math.PI/180),y];
}
// Inverse-sample each mesh triangle with premultiplied alpha to avoid seams at letter edges.
function paintTypeTriangle(input,output,a,b,c){
 const ax=a[0],ay=a[1],bx=b[0]-ax,by=b[1]-ay,cx=c[0]-ax,cy=c[1]-ay,det=bx*cy-by*cx;
 if(Math.abs(det)<.000001)return;
 const x0=Math.max(0,Math.floor(Math.min(ax,b[0],c[0]))),x1=Math.min(output.width,Math.ceil(Math.max(ax,b[0],c[0]))),y0=Math.max(0,Math.floor(Math.min(ay,b[1],c[1]))),y1=Math.min(output.height,Math.ceil(Math.max(ay,b[1],c[1])));
 const pixels=input.data,dest=output.data,iw=input.width,ih=input.height;
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
  const px=x+.5-ax,py=y+.5-ay,u=(px*cy-py*cx)/det,v=(bx*py-by*px)/det;
  if(u<-.00001||v<-.00001||u+v>1.00001)continue;
  const sx=Math.max(0,Math.min(iw-1,a[2]+u*(b[2]-a[2])+v*(c[2]-a[2])-.5)),sy=Math.max(0,Math.min(ih-1,a[3]+u*(b[3]-a[3])+v*(c[3]-a[3])-.5));
  const ix=Math.floor(sx),iy=Math.floor(sy),fx=sx-ix,fy=sy-iy;
  const i=(iy*iw+ix)*4,j=ix+1<iw?i+4:i,k=iy+1<ih?i+iw*4:i,l=k+j-i;
  const wa=(1-fx)*(1-fy)*pixels[i+3],wb=fx*(1-fy)*pixels[j+3],wc=(1-fx)*fy*pixels[k+3],wd=fx*fy*pixels[l+3],alpha=wa+wb+wc+wd;
  if(alpha<.5)continue;const out=(y*output.width+x)*4;dest[out+3]=alpha;
  for(let n=0;n<3;n++)dest[out+n]=(pixels[i+n]*wa+pixels[j+n]*wb+pixels[k+n]*wc+pixels[l+n]*wd)/alpha;
 }
}
function shapeFace(face,s,em){
 const w=face.width,h=face.height,nx=s.shape==='custom'?(s.knots.length/2-1)*Math.max(4,Math.ceil(36/(s.knots.length/2-1))):36,ny=12,grid=[];
 let left=Infinity,top=Infinity,right=-Infinity,bottom=-Infinity;
 for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){
  const u=i/nx,v=j/ny,[x,y]=typeProject(s,w,h,u,v);grid.push([x,y,u*w,v*h]);
  left=Math.min(x,left);right=Math.max(x,right);top=Math.min(y,top);bottom=Math.max(y,bottom);
 }
 const rad=s.direction*Math.PI/180,depth=em*s.depth/100,dx=depth*Math.cos(rad),dy=depth*Math.sin(rad);
 const treePad=s.trees&&s.depth?em*.57:0;
 left+=Math.min(0,dx)-2-treePad*.35;top+=Math.min(0,dy)-2-treePad;right+=Math.max(0,dx)+2+treePad*.35;bottom+=Math.max(0,dy)+2;
 const scale=typeLimit(right-left,bottom-top),cv=bc(Math.max(1,Math.ceil((right-left)*scale)),Math.max(1,Math.ceil((bottom-top)*scale))),g=cv.getContext('2d',{willReadFrequently:true});
 const geometry={x:-left*scale,y:-top*scale,w:w*scale,h:h*scale,slant:s.slant};
 grid.forEach(p=>{p[0]=(p[0]-left)*scale;p[1]=(p[1]-top)*scale});
 const src=face.getContext('2d').getImageData(0,0,w,h),out=g.createImageData(cv.width,cv.height);
 for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const n=j*(nx+1)+i,a=grid[n],b=grid[n+1],c=grid[n+nx+1],d=grid[n+nx+2];
  paintTypeTriangle(src,out,a,b,d);paintTypeTriangle(src,out,a,d,c);
 }
 g.putImageData(out,0,0);cv.typeGeometry=geometry;
 if(!depth)return cv;
 // Sweep the visible silhouette. Its edge normals set the lighting on each exposed side face.
 const side=bc(cv.width,cv.height),sg=side.getContext('2d'),p=out.data,color=rgb(s.side),stride=cv.width*4;
 for(let i=0;i<p.length;i+=4)if(p[i+3]){
  const gx=(p[i-1]||0)-(p[i+7]||0),gy=(p[i-stride+3]||0)-(p[i+stride+3]||0);
  const normal=Math.hypot(gx,gy),light=normal?(-.42*gx-.9*gy)/normal:0;
  const factor=1+light*s.lighting/135;
  for(let n=0;n<3;n++)p[i+n]=Math.min(255,color[n]*factor);
 }
 sg.putImageData(out,0,0);
 const result=bc(cv.width,cv.height),rg=result.getContext('2d'),steps=Math.max(1,Math.ceil(depth*scale));
 // Double the covered distance per pass to keep long extrusions interactive on large text.
 let stamp=side,run=1,offset=0,count=steps;rg.globalCompositeOperation='destination-over';
 while(count>0){
  if(count%2){rg.drawImage(stamp,Math.round(dx*scale*(offset+1)/steps),Math.round(dy*scale*(offset+1)/steps));offset+=run}
  count=Math.floor(count/2);if(!count)break;
  const tile=bc(cv.width,cv.height),tg=tile.getContext('2d');
  tg.drawImage(stamp,Math.round(dx*scale*run/steps),Math.round(dy*scale*run/steps));tg.drawImage(stamp,0,0);stamp=tile;run*=2;
 }
 rg.globalCompositeOperation='source-over';rg.drawImage(cv,0,0);
 if(treePad){
  const size=em*scale,interval=Math.max(12,Math.round(size*.83)),alpha=out.data;
  const trunk=rgb(s.side),shade=rgb(s.c);
  for(let mid=interval*.55,n=0;mid<cv.width;mid+=interval,n++){
   let x=Math.round(mid),y=0;
   for(;y<cv.height;y++)if(alpha[(y*cv.width+x)*4+3]>200)break;
   if(y>=cv.height)continue;
   x+=dx*scale*.34;y+=dy*scale*.34;
   const r=size*(.115+.052*((n*7)%5)/4),root=y,cy=root-r*1.75;
   rg.fillStyle='rgb('+trunk.map(v=>Math.round(v*.55)).join(',')+')';rg.fillRect(x-r*.10,cy,r*.20,root-cy);
   rg.fillStyle=s.side;rg.beginPath();rg.ellipse(x+r*.13,cy,r*1.03,r*1.08,0,0,Math.PI*2);rg.fill();
   rg.fillStyle='rgb('+shade.map(v=>Math.min(255,Math.round(v*1.03))).join(',')+')';
   rg.beginPath();rg.ellipse(x-r*.07,cy-r*.04,r*.93,r*1.03,0,0,Math.PI*2);rg.fill();
  }
 }
 result.typeGeometry=geometry;return result;
}
function letterFace(tx){
 const face=flatTextCanvas(tx),s={...TYPE_SHAPE,...tx};
 if(s.shape==='plain'&&!s.slant&&!s.depth&&s.rows===1&&(s.band==='off'||!s.pull))return face;
 if(!s.knots)s.knots=freshKnots();
 const ink=s.wrap||s.boxHeight||s.bg?face:tightFace(face),stack=stretchRows(ink,s,s.band==='letter'?letterEdges(tx,face,ink):null);
 if(s.shape==='plain'&&!s.slant&&!s.depth)return stack;
 return shapeFace(stack,s,Math.min(ink.height,tx.sz*(s.sy||100)/100)*stack.width/(ink.width*(s.band==='x'||s.band==='letter'?1+s.pull/100:1)));
}


function newTextLayer(changes={},box=null){
  if(!base)return;
  const tx={t:'Your text',f:'Archivo',sz:Math.max(6,Math.min(800,Math.round(H/8))),c:'#ffffff',w:700,it:false,al:'center',ls:0,lh:120,...changes};
  const cv=textCanvas(tx),d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height);
  const l={cv,d,o:null,lk:false,sh:null,ol:null,x:box?box.x+cv.width/2:W/2,y:box?box.y+cv.height/2:H/2,s:1,r:0,op:1,bm:'source-over',fl:false,vis:true,cl:0,ct:0,cr:0,cb:0,name:textLayerName(tx.t),tx};
  pushU(mkSnap('p'));layers.push(l);active=l;refreshLayers();draw();
  return l;
}
const textLayerName=value=>(value.split('\n')[0]||'Text').slice(0,24);
function retext(ch,group=null,continued=false){
  const l=active;if(!l||!l.tx||l.lk)return;
  const now=Date.now(),continuous=group&&textEdit?.layer===l&&textEdit.group===group&&now-textEdit.time<800;
  if(!continuous&&!continued)pushU(mkSnap('p'));
  textEdit=group?{layer:l,group,time:now}:null;
  const tx={...l.tx,...ch},cv=textCanvas(tx);
  if(l.tx.wrap&&tx.wrap){
    const dx=(cv.width-l.cv.width)*(1-l.cl-l.cr)*l.s/2,dy=(cv.height-l.cv.height)*(1-l.ct-l.cb)*l.s/2;
    l.x+=dx*Math.cos(l.r)-dy*Math.sin(l.r);l.y+=dx*Math.sin(l.r)+dy*Math.cos(l.r);
  }
  l.tx=tx;l.cv=cv;l.brushPadding=0;l.sil=null;l.gc=null;l.tnc=null;l.d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height);l.o=null;
  if(ch.t!==undefined)l.name=textLayerName(tx.t);
  const row=group&&$('llist').querySelector('.lrow.on');
  if(row){
    drawThumbnail(row.querySelector('canvas'),l);
    if(ch.t!==undefined){
      syncTextPanel();const label=row.querySelector('.nm');
      if(label)label.textContent=l.name;
      row.querySelector('[data-a="vis"]').setAttribute('aria-label',(l.vis?'Hide ':'Show ')+l.name);
      row.querySelector('[data-a="lock"]').setAttribute('aria-label',(l.lk?'Unlock ':'Lock ')+l.name);
    }
  }else refreshLayers();
  draw();
}
$('ltxt').onclick=()=>{$('htxt').click()};
$('txt').oninput=()=>retext({t:$('txt').value},'txt');$('tfont').onchange=()=>retext({f:$('tfont').value});$('tsz').oninput=()=>{retext({sz:+$('tsz').value},'tsz');if(active?.tx)syncTx(active.tx)};$('tcol').oninput=()=>retext({c:$('tcol').value},'tcol');$('tw').onchange=()=>retext({w:+$('tw').value});$('tit').onchange=()=>retext({it:$('tit').checked});

function syncFx(){const a=active;$('fsh').checked=!!(a&&a.sh);$('fol').checked=!!(a&&a.ol);if(a&&a.sh){$('fsx').value=a.sh.x;$('fsy').value=a.sh.y;$('fsb').value=a.sh.b;$('fsa').value=Math.round(a.sh.a*100);$('fsc').value=a.sh.c}if(a&&a.ol){$('fow').value=a.ol.w;$('foc').value=a.ol.c}syncFx2(a)}
let fxT=0;const setFx=()=>{const l=active;if(!l||l.lk)return;const now=Date.now();if(now-fxT>800)pushU(mkSnap('p'));fxT=now;
  l.sh=$('fsh').checked?{x:+$('fsx').value,y:+$('fsy').value,b:+$('fsb').value,a:$('fsa').value/100,c:$('fsc').value}:null;l.ol=$('fol').checked?{w:+$('fow').value,c:$('foc').value}:null;draw()};
['fsh','fsx','fsy','fsb','fsa','fsc','fol','fow','foc'].forEach(i=>$(i).oninput=setFx);
document.querySelectorAll('[data-al]').forEach(b=>b.onclick=act(l=>{const[hw,hh]=EXT(l),co=Math.abs(Math.cos(l.r)),si=Math.abs(Math.sin(l.r)),ex=hw*co+hh*si,ey=hw*si+hh*co,k=b.dataset.al;if(k==='l')l.x=ex;else if(k==='r')l.x=W-ex;else if(k==='c')l.x=W/2;else if(k==='t')l.y=ey;else if(k==='b')l.y=H-ey;else l.y=H/2}));
$('lr90').onclick=act(l=>{l.r+=Math.PI/2});
let zoomV=0,pan=null,spaceDown=false;const stage=$('stage');
function applyZoom(nz,mx,my){const r=c.getBoundingClientRect(),fx=r.width?(mx-r.left)/r.width:.5,fy=r.height?(my-r.top)/r.height:.5;zoomV=nz;c.style.maxWidth='none';c.style.maxHeight='none';c.style.width=W*nz+'px';
  const r2=c.getBoundingClientRect();stage.scrollLeft+=r2.left+fx*r2.width-mx;stage.scrollTop+=r2.top+fy*r2.height-my;const zc=$('zc');zc.hidden=false;zc.textContent=Math.round(nz*100)+'%';$('zoom').value='c'}
stage.addEventListener('wheel',e=>{if(!base||!(e.ctrlKey||e.metaKey))return;e.preventDefault();const cur=zoomV||(c.getBoundingClientRect().width/W)||1;applyZoom(Math.min(8,Math.max(.1,cur*Math.exp(-e.deltaY*.0015))),e.clientX,e.clientY)},{passive:false});
$('zoom').onchange=()=>{const v=$('zoom').value;if(v==='c')return;const z=+v;zoomV=z;c.style.maxWidth=z?'none':'100%';c.style.maxHeight=z?'none':'100%';c.style.width=z?W*z+'px':''};
const curs=()=>{c.style.cursor=tab==='layers'&&!typeDrawing?'default':'crosshair'};
c.addEventListener('pointerdown',e=>{if(spaceDown||e.button===1){e.stopImmediatePropagation();e.preventDefault();pan={x:e.clientX,y:e.clientY,l:stage.scrollLeft,t:stage.scrollTop};if(c.setPointerCapture)c.setPointerCapture(e.pointerId);c.style.cursor='grabbing'}},true);
c.addEventListener('pointermove',e=>{if(pan){e.stopImmediatePropagation();stage.scrollLeft=pan.l-(e.clientX-pan.x);stage.scrollTop=pan.t-(e.clientY-pan.y)}},true);
c.addEventListener('pointerup',e=>{if(pan){e.stopImmediatePropagation();pan=null;c.style.cursor=spaceDown?'grab':'';curs()}},true);
const isField=t=>t.matches&&t.matches('input,select,textarea,button,[role=button]');
document.addEventListener('keydown',e=>{if(e.code==='Space'&&!isField(e.target)&&base){e.preventDefault();spaceDown=true;c.style.cursor='grab'}
  if((e.ctrlKey||e.metaKey)&&e.key==='0'){e.preventDefault();$('zoom').value='0';$('zoom').onchange()}});
document.addEventListener('keyup',e=>{if(e.code==='Space'){spaceDown=false;if(!pan)curs()}});
document.querySelectorAll('h3').forEach(h=>{const sec=document.createElement('div');sec.className='sec';let n=h.nextElementSibling;while(n&&n.tagName!=='H3'){const nx=n.nextElementSibling;sec.appendChild(n);n=nx}h.after(sec);
  h.tabIndex=0;h.setAttribute('role','button');h.setAttribute('aria-expanded','true');const key='sec:'+h.textContent,tog=v=>{sec.hidden=!v;h.setAttribute('aria-expanded',String(v))};
  try{if(localStorage.getItem(key)==='0')tog(false)}catch(x){}
  h.onclick=()=>{const v=sec.hidden;tog(v);try{localStorage.setItem(key,v?'1':'0')}catch(x){}};h.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();h.click()}}});

const TS=256;let SS=null;
function tileSnap(buf,w,h,layer){const t=new Map();return{buf,layer,
  touch(x0,y0,x1,y1){x0=Math.max(0,x0|0);y0=Math.max(0,y0|0);x1=Math.min(w-1,x1|0);y1=Math.min(h-1,y1|0);
    for(let ty=y0/TS|0;ty<=(y1/TS|0);ty++)for(let tx=x0/TS|0;tx<=(x1/TS|0);tx++){const k=ty*1e4+tx;if(t.has(k))continue;const xs=tx*TS,ys=ty*TS,tw=Math.min(TS,w-xs),th=Math.min(TS,h-ys),a=new Uint8ClampedArray(tw*th*4);
      for(let y=0;y<th;y++){const o=((ys+y)*w+xs)*4;a.set(buf.subarray(o,o+tw*4),y*tw*4)}t.set(k,{xs,ys,tw,th,a})}},
  swap(){for(const T of t.values()){const tmp=new Uint8ClampedArray(T.a.length);for(let y=0;y<T.th;y++){const o=((T.ys+y)*w+T.xs)*4,r=y*T.tw*4;tmp.set(buf.subarray(o,o+T.tw*4),r);buf.set(T.a.subarray(r,r+T.tw*4),o)}T.a=tmp}}}}
const snapTouch=(buf,x0,y0,x1,y1)=>{if(SS)for(const s of SS)if(s.buf===buf){s.touch(x0,y0,x1,y1);return}};
let strokeLayers=null;
function expandWarpLayer(layer,radius){
  const {cv,cl,ct,cr,cb}=layer,sw=cv.width*(1-cl-cr),sh=cv.height*(1-ct-cb);
  const cropped=cl||ct||cr||cb,existing=cropped?0:layer.brushPadding||0;
  const requested=Math.max(0,Math.ceil(radius+4)-existing);
  const maxPad=Math.min((4000-sw)/2,(4000-sh)/2,(Math.sqrt((sw-sh)**2+24000000)-sw-sh)/4);
  const pad=Math.max(0,Math.floor(Math.min(requested,maxPad-1)));
  if(!pad)return false;
  const w=Math.max(1,Math.round(sw))+pad*2,h=Math.max(1,Math.round(sh))+pad*2;
  const padded=bc(w,h),g=padded.getContext('2d');
  g.drawImage(cv,cl*cv.width,ct*cv.height,sw,sh,pad,pad,w-2*pad,h-2*pad);
  const d=g.getImageData(0,0,w,h);
  let original=null;
  if(layer.o){
    const source=bc(cv.width,cv.height),canvas=bc(w,h);
    source.getContext('2d').putImageData(layer.o,0,0);
    const context=canvas.getContext('2d');
    context.drawImage(source,cl*cv.width,ct*cv.height,sw,sh,pad,pad,w-2*pad,h-2*pad);
    original=context.getImageData(0,0,w,h);
  }
  Object.assign(layer,{cv:padded,d,o:original,cl:0,ct:0,cr:0,cb:0,brushPadding:existing+pad,sil:null,gc:null,tnc:null});
  draw();
  return true;
}
function beginStroke(){
  const kind=MODES[$('mode').value][2]||'',combineMode=kind[0]==='c',target=$('bt').value,snaps=[];
  const addLayer=l=>snaps.push(tileSnap(l.d.data,l.cv.width,l.cv.height,l));
  const extend=!kind&&$('warp-extend').checked&&target!=='bg';
  strokeLayers=extend?new Set():null;
  let swapLayers=extend?mkSnap('p'):null;
  if(combineMode){
    if(layers.length){snaps.push(tileSnap(base.data,W,H,null));addLayer(active||layers[layers.length-1])}
  }else{
    if(target!=='layer'||!active)snaps.push(tileSnap(base.data,W,H,null));
    if(!extend){
      if(target==='all')layers.forEach(addLayer);
      else if(target==='layer'&&active)addLayer(active);
    }
  }
  const swap=()=>{
    if(swapLayers)swapLayers=swapLayers();
    for(const snap of snaps){snap.swap();if(snap.layer)syncL(snap.layer)}
    return swap;
  };
  pushU(swap);SS=snaps;
}

const PXS=[];let curPx=0,pxcat='all',PP=8,jit=null;
const ps=(n,c,f,o)=>PXS.push(Object.assign({n,c,f},o)),sdv=Math.abs,frc=x=>x-Math.floor(x),hsh=(a,b,t)=>frc(Math.sin(a*127.1+b*311.7+t*74.7)*43758.5453);
const AA=(r,d)=>{const t=(r-d)*PP*.5+.5;return t<0?0:t>1?1:t},mx2=(u,v)=>Math.max(sdv(u),sdv(v));
const bay=n=>{if(n===1)return[0];const m=bay(n/2),N=n/2,o=Array(n*n);for(let y=0;y<N;y++)for(let x=0;x<N;x++){const v=m[y*N+x]*4;o[y*n+x]=v;o[y*n+x+N]=v+2;o[(y+N)*n+x]=v+3;o[(y+N)*n+x+N]=v+1}return o};
const BY2=bay(2),BY4=bay(4),BY8=bay(8),CLU=[12,5,6,13,4,0,1,7,11,3,2,8,15,10,9,14],dth=(a,n)=>(u,v,l,k)=>l>(a[(k.j%n)*n+(k.i%n)]+.5)/(n*n)?1:0;
ps('Square pixels','Blocks',()=>1);
ps('Gapped tiles','Blocks',(u,v,l,k)=>AA(1-k.g,mx2(u,v)));
ps('Rounded tiles','Blocks',(u,v,l,k)=>{const a=1-k.g,r=.4,qx=sdv(u)-(a-r),qy=sdv(v)-(a-r);return AA(0,Math.sqrt(Math.max(qx,0)**2+Math.max(qy,0)**2)+Math.min(Math.max(qx,qy),0)-r)});
ps('Bevel tiles','Blocks',(u,v,l,k)=>{const m=mx2(u,v);if(m>.72)k.sh=u+v<0?1.35:.6;return AA(1-k.g,m)});
ps('Bricks','Blocks',(u,v,l,k)=>AA(1-k.g,mx2(v<0?u:(u<0?u+1:u-1),(v<0?v+.5:v-.5)*2)));
ps('Diamonds','Blocks',(u,v,l,k)=>AA(1-k.g,sdv(u)+sdv(v)));
ps('Hexagons','Blocks',(u,v,l,k)=>{const x=sdv(u),y=sdv(v);return AA(1-k.g,Math.max(x*.866+y*.5,y))});
ps('Triangles','Blocks',(u,v,l,k)=>{const w=(k.i+k.j)&1?-v:v;return AA(0,(sdv(u)-(w+1)/2*(1-k.g*.5))*.8)*(w<1-k.g?1:AA(1,w))});
ps('Circles','Dots',(u,v,l,k)=>AA((1-k.g)*k.s,hyp(u,v)));
ps('Dots by brightness','Dots',(u,v,l,k)=>AA(1.1*k.s*Math.sqrt(l),hyp(u,v)));
ps('Halftone (dark dots)','Dots',(u,v,l,k)=>AA(1.1*k.s*Math.sqrt(1-l),hyp(u,v)));
ps('Rings','Dots',(u,v,l,k)=>{const d=hyp(u,v),r1=.95*k.s,w=.12+.6*l;return Math.max(0,AA(r1,d)-AA(r1*(1-w),d))});
ps('Squares by brightness','Dots',(u,v,l,k)=>AA(k.s*Math.sqrt(l),mx2(u,v)));
ps('Diamonds by brightness','Dots',(u,v,l,k)=>AA(1.25*k.s*Math.sqrt(l),sdv(u)+sdv(v)));
ps('Plus signs','Dots',(u,v,l,k)=>{const t=.3*k.s+.1,a=1-k.g;return Math.max(AA(t,sdv(u))*AA(a,sdv(v)),AA(t,sdv(v))*AA(a,sdv(u)))});
ps('Crosses','Dots',(u,v,l,k)=>{const t=.28*k.s+.08;return Math.max(AA(t,sdv(u-v)*.707),AA(t,sdv(u+v)*.707))*AA(1-k.g,mx2(u,v))});
ps('Stars','Dots',(u,v,l,k)=>AA(.95*k.s*(.4+.6*l)*(.45+.55*sdv(Math.cos(2.5*Math.atan2(v,u)))),hyp(u,v)));
ps('Horizontal bars','Lines',(u,v,l,k)=>AA(Math.max(.1,l)*k.s,sdv(v))*AA(1-k.g*.5,sdv(u)));
ps('Vertical bars','Lines',(u,v,l,k)=>AA(Math.max(.1,l)*k.s,sdv(u))*AA(1-k.g*.5,sdv(v)));
ps('Scanlines','Lines',(u,v,l,k)=>AA(1-k.g*1.5,sdv(v)));
ps('Vertical lines','Lines',(u,v,l,k)=>AA(1-k.g*1.5,sdv(u)));
ps('Diagonal hatch','Lines',(u,v,l,k)=>AA((1-l)*.4*k.s+.04,sdv(frc(u+v)-.5)*.7));
ps('Cross hatch','Lines',(u,v,l,k)=>Math.max(AA((1-l)*.4*k.s+.04,sdv(frc(u+v)-.5)*.7),l<.55?AA((.55-l)*.5*k.s+.03,sdv(frc(u-v)-.5)*.7):0));
ps('Slashes','Lines',(u,v,l,k)=>AA(.15+.45*(1-l)*k.s,sdv(u+v)*.707));
ps('Backslashes','Lines',(u,v,l,k)=>AA(.15+.45*(1-l)*k.s,sdv(u-v)*.707));
ps('Waves','Lines',(u,v,l,k)=>AA(Math.max(.12,l)*.6*k.s,sdv(v-.6*Math.sin(u*Math.PI))));
ps('Zigzag','Lines',(u,v,l,k)=>AA(Math.max(.12,l)*.6*k.s,sdv(v-.6*(sdv(frc(u*.5+.25)*4-2)-1))));
ps('Concentric rings','Lines',(u,v,l,k)=>AA(.22*k.s+.05,sdv(frc(hyp(u,v)*(1+3*l))-.5)));
ps('Grid mesh','Lines',(u,v,l,k)=>1-AA(1-(.08+.45*(1-l)*k.s),mx2(u,v)));
ps('Bayer 2x2','Dither',dth(BY2,2));ps('Bayer 4x4','Dither',dth(BY4,4));ps('Bayer 8x8','Dither',dth(BY8,8));ps('Clustered dots','Dither',dth(CLU,4));
ps('Random dither','Dither',(u,v,l,k)=>l>hsh(k.i,k.j,1)?1:0);
ps('Interleaved noise','Dither',(u,v,l,k)=>l>frc(52.9829189*frc(.06711056*k.i+.00583715*k.j))?1:0);
ps('Line dither','Dither',(u,v,l,k)=>l>((k.j%4)+.5)/4?1:0);
ps('Checker dither','Dither',(u,v,l,k)=>l>((k.i+k.j)&1?.7:.3)?1:0);
for(const[n,e]of[['Floyd-Steinberg','fs'],['Atkinson','at'],['Sierra lite','sl']])ps(n,'Dither',(u,v,l,k)=>k.edg[k.j*k.cols+k.i],{ed:e,full:true});
const tr=(n,r,o)=>ps(n,'Text',null,Object.assign({ramp:r},o));
tr('ASCII classic',' .:-=+*#%@');tr('ASCII dense',' .\'`^",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$');tr('ASCII blocks',' \u2591\u2592\u2593\u2588');tr('ASCII minimal',' \u00b7:+#');
tr('Binary','01');tr('Digits','0123456789');tr('Letters',' .ilxoOXMW');tr('Symbols',' \u00b7+\u00d7*#%&@');tr('Hash and slash',' ._-/\\|+#');tr('Math symbols',' .+-=\u00d7\u00f7\u2248\u2260');tr('Shapes',' \u00b7\u2022\u25cf\u25c9');tr('Bar blocks',' \u2581\u2582\u2583\u2584\u2585\u2586\u2587\u2588');
const KAT='\uff86\uff97\uff98\uff9c\uff66\uff71\uff73\uff74\uff75\uff76\uff77\uff79\uff7a\uff7b\uff7c\uff7d\uff7e\uff7f\uff80\uff82\uff83\uff85\uff87\uff88\uff8a\uff8b\uff8e\uff8f\uff90\uff91\uff92\uff93\uff94\uff95';
tr('Katakana',KAT,{hash:true});tr('Matrix rain',KAT+'0123456789',{hash:true,ink:'#2bff6a',paper:'#020a04'});
ps('Custom text','Text',null,{seq:true});ps('Custom ramp','Text',null,{custom:true});
ps('LED panel','Art',(u,v,l,k)=>{k.ch=u<-.33?0:u<.33?1:2;return AA(1-k.g,mx2(u,v))});
ps('Lego studs','Art',(u,v,l,k)=>{const r=hyp(u,v);k.sh=r<.55?(r>.45?.7:1.18):1;return AA(1-k.g,mx2(u,v))});
ps('Cubes','Art',(u,v,l,k)=>{k.sh=v<-sdv(u)*.577?1.2:u<0?.8:.5;const x=sdv(u),y=sdv(v);return AA(1-k.g,Math.max(x*.866+y*.5,y))});
ps('Cross-stitch','Art',(u,v,l,k)=>{k.sh=.85+.3*hsh(k.x,k.y,3);const t=.3*k.s+.06;return Math.max(AA(t,sdv(u-v)*.707),AA(t,sdv(u+v)*.707))*AA(.95,mx2(u,v))});
for(const[n,e]of[['Voronoi mosaic','vor'],['Stained glass','glass'],['Pointillism','stip'],['Glitch blocks','glitch']])ps(n,'Art',null,{e,full:true});
const pxFull=()=>+$('apx').value>1&&!!(PXS[curPx].full||PXS[curPx].e);
const atl=new Map();
function atlas(chars,P,font,bold,ital,sc){const key=chars.join('')+'|'+P+'|'+font+'|'+bold+ital+sc;let a=atl.get(key);if(a)return a;if(atl.size>6)atl.clear();
  const cv=document.createElement('canvas');cv.width=cv.height=P;const g=cv.getContext('2d',{willReadFrequently:true});
  a=chars.map(ch=>{g.clearRect(0,0,P,P);g.font=`${ital?'italic ':''}${bold?'700 ':''}${Math.max(4,Math.round(P*.95*(sc||1)))}px ${font}`;g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';g.fillText(ch,P/2,P/2+P*.06);const d=g.getImageData(0,0,P,P).data,m=new Uint8Array(P*P);for(let i=0;i<m.length;i++)m[i]=d[i*4+3];return m});atl.set(key,a);return a}
function errDiff(lm,cols,rows,kind){const e=Float32Array.from(lm),out=new Uint8Array(cols*rows),K={fs:[[1,0,7/16],[-1,1,3/16],[0,1,5/16],[1,1,1/16]],at:[[1,0,.125],[2,0,.125],[-1,1,.125],[0,1,.125],[1,1,.125],[0,2,.125]],sl:[[1,0,.5],[-1,1,.25],[0,1,.25]]}[kind];
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const i=y*cols+x,o=e[i]>.5?1:0;out[i]=o;const er=e[i]-o;for(const[dx,dy,w]of K){const xx=x+dx,yy=y+dy;if(xx>=0&&xx<cols&&yy<rows)e[yy*cols+xx]+=er*w}}return out}
function pixelFx(o,P,spl,spx,X0,Y0,X1,Y1){
  const S=PXS[curPx],cols=Math.ceil(W/P),rows=Math.ceil(H/P),k={g:+$('pxg').value/100,s:+$('pxz').value/100,i:0,j:0,sh:1,ch:-1,x:0,y:0,edg:null,cols};PP=P;
  const cm=$('pxcm').value,inv=$('pxinv').checked,ct=+$('pxc').value/100*2,mixv=+$('pxm').value/100,font=$('pxf').value,bold=$('pxb').checked,ital=$('pxit').checked,lsc=+$('pxls').value/100,fade=+$('pxfd').value/100,lay=$('pxl').value,kase=$('pxk').value,skipSp=$('pxsp').checked;
  let ink=rgb($('pxi').value),paper=rgb($('pxp').value);if(S.ink){ink=rgb(S.ink);paper=rgb(S.paper)}
  const mono=cm==='mono'||!!S.ink,pap=cm==='paper'||mono,over=cm==='over'&&!S.ink,adj=l=>{l=Math.min(1,Math.max(0,(l-.5)*(1+ct)+.5));return inv?1-l:l};
  let chars=null,at=null,idxOf=null;
  if(S.ramp||S.seq||S.custom){let raw=Array.from(S.seq?($('pxt').value.replace(/\n/g,' ')||' '):S.custom?($('pxr').value||' .:-=+*#%@'):S.ramp);
    if(S.seq){if(kase==='up')raw=raw.map(c=>c.toUpperCase());else if(kase==='low')raw=raw.map(c=>c.toLowerCase());if(skipSp)raw=raw.filter(c=>!/\s/.test(c));if(!raw.length)raw=[' '];chars=[...new Set(raw)];idxOf=new Map(chars.map((c,i)=>[c,i]));k.raw=raw}else chars=raw;
    at=atlas(chars,P,font,bold,ital,lsc)}
  const cp=S.e?o.slice():null;
  if(S.e&&(!jit||jit.cols!==cols||jit.rows!==rows||jit.P!==P)){const a=new Float32Array(cols*rows*2);for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){a[(j*cols+i)*2]=(i+.5+(hsh(i,j,1)-.5)*.8)*P;a[(j*cols+i)*2+1]=(j+.5+(hsh(i,j,2)-.5)*.8)*P}jit={cols,rows,P,a}}
  if(S.ed){const lm=new Float32Array(cols*rows);for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){let t=0,n=0;for(let y=j*P;y<Math.min(H,j*P+P);y++)for(let x=i*P;x<Math.min(W,i*P+P);x++){const q=(y*W+x)*4;t+=o[q]*.299+o[q+1]*.587+o[q+2]*.114;n++}lm[j*cols+i]=adj(t/n/255)}k.edg=errDiff(lm,cols,rows,S.ed)}
  for(let by=Y0;by<Y1;by+=P){const j=by/P|0;for(let bx=X0;bx<X1;bx+=P){const i=bx/P|0,x1=Math.min(W,bx+P),y1=Math.min(H,by+P);
    let r=0,g=0,b=0,n=0;for(let y=by;y<y1;y++)for(let x=bx;x<x1;x++){const q=(y*W+x)*4;r+=o[q];g+=o[q+1];b+=o[q+2];n++}r/=n;g/=n;b/=n;
    const l=adj((r*.299+g*.587+b*.114)/255);k.i=i;k.j=j;let mask=null;
    if(at){let idx;if(S.seq){const n=k.raw.length,q=lay==='rows'?i%n:lay==='cols'?(i*rows+j)%n:lay==='rand'?(hsh(i,j,4+pxSeed)*n|0):lay==='lum'?Math.min(n-1,Math.floor(l*n)):(j*cols+i)%n;idx=idxOf.get(k.raw[q])}else idx=S.hash?(hsh(i,j,4)*chars.length|0):Math.min(chars.length-1,Math.floor(l*chars.length));mask=at[idx]}
    const ink0=mono?ink:[r,g,b],pap0=pap?paper:[r*.08,g*.08,b*.08];
    for(let y=by;y<y1;y++)for(let x=bx;x<x1;x++){const jj=y*W+x,q=jj*4,m=sel?sel[jj]/255:1;if(!m||(spl&&x<spx))continue;
      let c=1,R,G,B;
      if(S.e){const e=S.e;
        if(e==='glitch'){const sh=hsh(j,1,5)>.7?Math.round((hsh(j,2,6)-.5)*8)*P:0,xs=Math.min(W-1,Math.max(0,x+sh)),qs=(y*W+xs)*4;R=cp[qs];G=cp[qs+1];B=cp[qs+2]}
        else if(e==='stip'){const a=jit.a,ci=(j*cols+i)*2,d=hyp(x+.5-a[ci],y+.5-a[ci+1]),rad=P*(.18+.34*Math.sqrt(l))*k.s;c=Math.min(1,Math.max(0,rad-d+.5));R=ink0[0];G=ink0[1];B=ink0[2]}
        else{let b1=1e9,b2=1e9,bi=0,bj=0;for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const ii=i+di,jj2=j+dj;if(ii<0||jj2<0||ii>=cols||jj2>=rows)continue;const a=jit.a,ci=(jj2*cols+ii)*2,d=hyp(x+.5-a[ci],y+.5-a[ci+1]);if(d<b1){b2=b1;b1=d;bi=ii;bj=jj2}else if(d<b2)b2=d}
          const ci=(bj*cols+bi)*2,sx=Math.min(W-1,Math.max(0,jit.a[ci]|0)),sy=Math.min(H-1,Math.max(0,jit.a[ci+1]|0)),qs=(sy*W+sx)*4;R=cp[qs];G=cp[qs+1];B=cp[qs+2];
          if(e==='glass'&&b2-b1<1.6+P*.04){R*=.1;G*=.1;B*=.12}else if(mono){const t=(R*.299+G*.587+B*.114)/255;R=paper[0]+(ink[0]-paper[0])*t;G=paper[1]+(ink[1]-paper[1])*t;B=paper[2]+(ink[2]-paper[2])*t}}}
      else{
        if(mask){c=mask[(y-by)*P+(x-bx)]/255;if(S.hash||S.seq)c*=1-fade+fade*l}
        else{k.x=x;k.y=y;k.sh=1;k.ch=-1;c=S.f((x-bx+.5)/P*2-1,(y-by+.5)/P*2-1,l,k)}
        let sh=mask?1:k.sh;R=ink0[0]*sh;G=ink0[1]*sh;B=ink0[2]*sh;if(!mask&&k.ch>=0){if(k.ch!==0)R*=.12;if(k.ch!==1)G*=.12;if(k.ch!==2)B*=.12}}
      const pr=over?o[q]:pap0[0],pg=over?o[q+1]:pap0[1],pb=over?o[q+2]:pap0[2],w=m*mixv;
      const fr0=S.e&&S.e!=='stip'?R:pr+(R-pr)*c,fg=S.e&&S.e!=='stip'?G:pg+(G-pg)*c,fb=S.e&&S.e!=='stip'?B:pb+(B-pb)*c;
      o[q]+=(fr0-o[q])*w;o[q+1]+=(fg-o[q+1])*w;o[q+2]+=(fb-o[q+2])*w}}}}
function showPx(){const q=$('pxq').value.toLowerCase();$('pxlist').innerHTML=PXS.map((s,i)=>[s,i]).filter(([s])=>(pxcat==='all'||s.c===pxcat)&&s.n.toLowerCase().includes(q)).map(([s,i])=>`<button class="p${i===curPx?' on':''}" data-i="${i}">${esc(s.n)}</button>`).join('')}
$('pxq').oninput=showPx;
$('pxlist').onclick=e=>{const b=e.target.closest('.p');if(!b)return;pickPx(+b.dataset.i)};
document.querySelectorAll('#pxcat button').forEach(b=>b.onclick=()=>{pxcat=b.dataset.c;document.querySelectorAll('#pxcat button').forEach(x=>x.classList.toggle('on',x===b));showPx();$('pxlist').scrollTop=0});
$('pxoff').onclick=()=>{$('apx').value=1;pxo();draw(true)};
showPx();

let pxSeed=0;
function pickPx(i){curPx=i;if(+$('apx').value<=1)$('apx').value=8;pxo();showPx();syncPxUI();draw(true)}
function syncPxUI(){const S=PXS[curPx];document.querySelectorAll('#pxtm button').forEach(b=>b.classList.toggle('on',b.dataset.s===S.n));$('pxtx').hidden=!S.seq;$('pxrx').hidden=!S.custom;
  $('pxth').textContent=S.seq?'Your text repeats across the image, coloured from the photo. Pick a layout below.':S.custom?'Type the characters to use, from dark to light.':'Pick Custom text or Custom ramp to use your own characters.'}
document.querySelectorAll('#pxtm button').forEach(b=>b.onclick=()=>pickPx(PXS.findIndex(s=>s.n===b.dataset.s)));
$('pxsam').onchange=()=>{if($('pxsam').value){$('pxt').value=$('pxsam').value;$('pxsam').value='';if(!PXS[curPx].seq)pickPx(PXS.findIndex(s=>s.seq));else draw(true)}};
$('pxrsam').onchange=()=>{if($('pxrsam').value){$('pxr').value=$('pxrsam').value;$('pxrsam').value='';if(!PXS[curPx].custom)pickPx(PXS.findIndex(s=>s.custom));else draw(true)}};
$('pxrev').onclick=()=>{$('pxr').value=Array.from($('pxr').value).reverse().join('');draw(true)};
$('pxsh').onclick=()=>{pxSeed=Math.random()*1000;$('pxl').value='rand';draw(true)};
syncPxUI();

const exp=$('exp');
function selBox(){let x0=W,y0=H,x1=-1,y1=-1;for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(sel[y*W+x]>127){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}return x1<0?null:[x0,y0,x1-x0+1,y1-y0+1]}
function exportScale(w,h){const v=+$('exs').value;return v>0?v:Math.min(1,-v/Math.max(w,h))}
function exportDims(){const wt=$('exw').value;let a=W,b=H;
  if(wt==='print'){a*=2;b*=2}
  if(wt==='layer'&&active){a=Math.round(active.cv.width*(1-active.cl-active.cr));b=Math.round(active.cv.height*(1-active.ct-active.cb))}
  else if(wt==='sel'&&sel){const bb=selBox();if(bb){a=bb[2];b=bb[3]}}
  const sc=exportScale(a,b);return[Math.max(1,Math.round(a*sc)),Math.max(1,Math.round(b*sc))]}
const printPapers=POSTERS.slice(0,4).map(p=>p.s[1]);
function buildPrint(scale,format='png'){
  // Round the sheet once. Odd output dimensions still meet at a shared seam.
  const sheet=bc(Math.max(1,Math.round(2*W*scale)),Math.max(1,Math.round(2*H*scale)));
  const g=sheet.getContext('2d'), midX=Math.round(sheet.width/2), midY=Math.round(sheet.height/2);
  if(format==='jpg'){g.fillStyle='#fff';g.fillRect(0,0,sheet.width,sheet.height)}
  // Layer order, masks and adjustments pass through the regular export renderer.
  const ink=stops?.[0]||POSTERS[0].s[0];
  const mapping={curve:'steps',mid:+mapMid.value};
  g.imageSmoothingQuality='high';
  try {
    printPapers.forEach((paper,index)=>{
      const x=index%2?midX:0, y=index>1?midY:0;
      render(false,null,makeToneTable([ink,paper],null,mapping));
      g.drawImage(c,x,y,index%2?sheet.width-midX:midX,index>1?sheet.height-midY:midY);
    });
  } finally {draw(true)}
  return sheet;
}

function syncExp(){const o=$('exw').options;o[1].disabled=!active;o[2].disabled=!sel;if(o[$('exw').selectedIndex].disabled)$('exw').value='all';
  const fmt=$('exf').value;$('exq').disabled=fmt==='png';$('exqo').textContent=$('exq').value;const[w,h]=exportDims();
  $('exinfo').textContent=`${w} \u00d7 ${h} px \u00b7 ${fmt.toUpperCase()}${fmt==='jpg'?' (no transparency)':''}`;
  $('exgo').textContent='Save file'}
function openExp(){if(!base)return;$('exw').value='all';$('exmsg').textContent='';$('exprev').hidden=true;syncExp();exp.hidden=false}
function buildExport(){const wt=$('exw').value,fmt=$('exf').value;let src,sx=0,sy=0,sw=W,sh=H,cut=false;
  if(wt==='print')return buildPrint(exportScale(2*W,2*H),fmt);
  if(wt==='layer'&&active){const l=active;sw=Math.round(l.cv.width*(1-l.cl-l.cr));sh=Math.round(l.cv.height*(1-l.ct-l.cb));src=document.createElement('canvas');src.width=sw;src.height=sh;const g=src.getContext('2d');g.globalAlpha=l.op;if(l.fl){g.translate(sw,0);g.scale(-1,1)}g.drawImage(visibleLayer(l).cv,Math.round(l.cl*l.cv.width),Math.round(l.ct*l.cv.height),sw,sh,0,0,sw,sh)}
  else{render(false);src=document.createElement('canvas');src.width=W;src.height=H;src.getContext('2d').drawImage(c,0,0);draw();
    if(wt==='sel'&&sel){const bb=selBox();if(bb){[sx,sy,sw,sh]=bb;cut=true}}}
  const sc=exportScale(sw,sh),out=document.createElement('canvas');out.width=Math.max(1,Math.round(sw*sc));out.height=Math.max(1,Math.round(sh*sc));const g=out.getContext('2d');g.imageSmoothingQuality='high';
  if(fmt==='jpg'){g.fillStyle='#fff';g.fillRect(0,0,out.width,out.height)}
  if(cut){const t=document.createElement('canvas');t.width=sw;t.height=sh;const tg=t.getContext('2d');tg.drawImage(src,sx,sy,sw,sh,0,0,sw,sh);const im=tg.getImageData(0,0,sw,sh);
    for(let y=0;y<sh;y++)for(let x=0;x<sw;x++)im.data[(y*sw+x)*4+3]*=sel[(sy+y)*W+sx+x]/255;tg.putImageData(im,0,0);g.drawImage(t,0,0,sw,sh,0,0,out.width,out.height)}
  else g.drawImage(src,sx,sy,sw,sh,0,0,out.width,out.height);
  return out}
const toBlob=(cv,type,q)=>new Promise(r=>cv.toBlob(r,type,q));
async function doExport(copy){const msg=t=>$('exmsg').textContent=t;msg('Working\u2026');
  try{const fmt=$('exf').value,mime=fmt==='jpg'?'image/jpeg':'image/'+fmt,out=buildExport();
    const name=(($('exn').value||'totone').replace(/[^\w.\- ]+/g,'_').trim()||'totone')+($('exw').value==='layer'?'-layer':$('exw').value==='sel'?'-cutout':$('exw').value==='print'?'-four-panel':'')+'.'+fmt;
    if(copy==='share'){const blob=await toBlob(out,mime,$('exq').value/100),file=new File([blob],name,{type:mime});if(navigator.canShare?.({files:[file]}))await navigator.share({files:[file]});else msg('File sharing is unavailable here.');return}
    if(copy){const png=await toBlob(out,'image/png');try{await navigator.clipboard.write([new ClipboardItem({'image/png':png})]);msg('Copied to the clipboard.')}catch(e){msg('Copying is blocked here. Use Save file instead.')}return}
    const blob=await toBlob(out,mime,$('exq').value/100);if(!blob){msg('Could not create the image.');return}
    if(dl){try{await dl.save({filename:name,data:blob});msg('Saved '+name+'.')}catch(e){msg('Saving was cancelled or blocked.')}}
    else{const p=$('exprev');if(p.dataset.u)URL.revokeObjectURL(p.dataset.u);p.dataset.u=URL.createObjectURL(blob);p.src=p.dataset.u;p.hidden=false;
      const link=document.createElement('a');link.href=p.src;link.download=name;
      document.body.append(link);link.click();link.remove();
      msg('Download requested · '+(blob.size/1048576).toFixed(2)+' MB. You can also save the preview below.')}
  }catch(e){msg(e.name==='AbortError'?'Sharing cancelled.':'Export failed: '+e.message)}}
$('film-share').hidden=!navigator.canShare?.({files:[new File([''],'image.png',{type:'image/png'})]});$('film-share').onclick=()=>doExport('share');
$('export').onclick=openExp;$('exx').onclick=()=>{exp.hidden=true};$('exgo').onclick=()=>doExport(false);$('excp').onclick=()=>doExport(true);
exp.addEventListener('click',e=>{if(e.target===exp)exp.hidden=true});
function refreshExportOptions(){
  syncExp();const preview=$('exprev');
  preview.hidden=true;$('exmsg').textContent='';
  if(preview.dataset.u){URL.revokeObjectURL(preview.dataset.u);delete preview.dataset.u}
  if($('exw').value==='print'){
    const sheet=buildPrint(Math.min(.5,300/Math.max(W,H)),$('exf').value);
    preview.src=sheet.toDataURL('image/png');preview.hidden=false;
  }
}
['exw','exf'].forEach(i=>$(i).addEventListener('input',refreshExportOptions));
['exs','exq'].forEach(i=>$(i).addEventListener('input',syncExp));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!exp.hidden)exp.hidden=true;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();openExp()}});

/* ---------- Fonts and text ---------- */
const GENF=/^(serif|sans-serif|monospace|cursive|fantasy)$/,fam=f=>GENF.test(f)?f:`'${f}',sans-serif`,bc=(w,h)=>{const e=document.createElement('canvas');e.width=w;e.height=h;return e};
const ensureFont=f=>document.fonts&&!GENF.test(f)?Promise.all([document.fonts.load(`700 24px ${fam(f)}`),document.fonts.load(`400 24px ${fam(f)}`)]).catch(()=>{}):Promise.resolve();
const FONTS=[['Archivo','Sans'],['Inter','Sans'],['Montserrat','Sans'],['Raleway','Sans'],['Poppins','Sans'],['Syne','Sans'],['Unbounded','Sans'],['Trebuchet MS','Sans'],['Verdana','Sans'],
['Playfair Display','Serif'],['Lora','Serif'],['Cormorant Garamond','Serif'],['DM Serif Display','Serif'],['Cinzel','Serif'],['Yeseva One','Serif'],['Abril Fatface','Serif'],['Georgia','Serif'],['Times New Roman','Serif'],
['Anton','Display'],['Bebas Neue','Display'],['Oswald','Display'],['Archivo Black','Display'],['Alfa Slab One','Display'],['Staatliches','Display'],['Bungee','Display'],['Monoton','Display'],['Rubik Mono One','Display'],['Righteous','Display'],['Impact','Display'],['Arial Black','Display'],
['Pacifico','Script'],['Lobster','Script'],['Dancing Script','Script'],['Satisfy','Script'],['Sacramento','Script'],['Great Vibes','Script'],['Caveat','Script'],['Shrikhand','Script'],
['Space Mono','Mono'],['VT323','Mono'],['Special Elite','Mono'],['Major Mono Display','Mono'],['Courier New','Mono'],['Press Start 2P','Mono'],
['Permanent Marker','Fun'],['Bangers','Fun'],['Fredoka','Fun'],['Black Ops One','Fun'],['Rock Salt','Fun'],['Gloria Hallelujah','Fun'],['Orbitron','Fun']];
let fcat='all';
$('tfont').innerHTML=FONTS.map(f=>`<option>${esc(f[0])}</option>`).join('');
function showF(){const q=$('fq').value.toLowerCase(),cu=$('tfont').value;$('flist').innerHTML=FONTS.filter(f=>(fcat==='all'||f[1]===fcat)&&f[0].toLowerCase().includes(q)).map(f=>`<button class="fi${f[0]===cu?' on':''}" role="option" aria-selected="${f[0]===cu}" data-f="${esc(f[0])}" style="font-family:${fam(f[0])}">${esc(f[0])}</button>`).join('')}
const markFont=f=>document.querySelectorAll('#flist .fi').forEach(b=>{
  const selected=b.dataset.f===f;b.classList.toggle('on',selected);b.setAttribute('aria-selected',String(selected));
});
$('fq').oninput=showF;
document.querySelectorAll('#fcat button').forEach(b=>b.onclick=()=>{fcat=b.dataset.c;document.querySelectorAll('#fcat button').forEach(x=>x.classList.toggle('on',x===b));showF()});
let fontRequest=0;
$('flist').onclick=async e=>{
  const b=e.target.closest('.fi'),l=active;if(!b||!l?.tx||l.lk)return;
  const f=b.dataset.f,request=++fontRequest;
  await ensureFont(f);
  if(active===l&&request===fontRequest)retext({f});
};
showF();
let copiedTextStyle=null;
const typeStyleProperties=['f','w','it','sz','c','al','ls','lh','wordSpace','letterCase','paragraphGap',
  'fill','photo','photoScale','photoX','photoY','fillAngle','end','stroke','strokeWidth','underline','strike','bg','bgColor','bgOpacity','bgPadding','bgRadius',...Object.keys(TYPE_SHAPE)];
$('type-copy-style').onclick=()=>{
  if(!active?.tx)return;
  const tx={...TEXT_DEFAULTS,...TYPE_SHAPE,...active.tx};
  copiedTextStyle=Object.fromEntries(typeStyleProperties.map(key=>[key,tx[key]]));
  $('type-paste-style').disabled=!!active.lk;
  $('tx-fit-note').hidden=false;$('tx-fit-note').textContent='Text style copied.';
};
$('type-paste-style').onclick=()=>{if(copiedTextStyle&&active?.tx&&!active.lk)retext(copiedTextStyle)};
const textControls={
  'tx-width':'sx','tx-height':'sy','tx-wrap':'wrap','tx-case':'letterCase','tx-word':'wordSpace','tx-angle':'fillAngle',
  'tx-fill':'fill','tx-end':'end','tx-stroke':'stroke','tx-stroke-width':'strokeWidth',
  'type-size':'sz','type-box-height':'boxHeight','type-valign':'valign','type-paragraph-gap':'paragraphGap',
  'type-underline':'underline','type-strike':'strike','type-bg':'bg','type-bg-color':'bgColor',
  'type-bg-opacity':'bgOpacity','type-bg-padding':'bgPadding','type-bg-radius':'bgRadius'
};
for(const [id,property] of Object.entries(textControls)){
  const input=$(id);
  input.addEventListener(input.type==='number'?'change':'input',()=>{
    const value=input.type==='checkbox'?input.checked:input.type==='range'||input.type==='number'?Math.round(Math.min(+input.max,Math.max(+input.min,+input.value))):input.value;
    retext({[property]:value},id);
    if(active?.tx)syncTx(active.tx);
  });
}
for(const id of [...Object.keys(textControls),'tsz','tcol','tls','tlh','txt']){
  $(id).addEventListener('blur',()=>{textEdit=null});
  if(id!=='txt')$(id).addEventListener('change',()=>{textEdit=null});
}
$('tx-reset').onclick=()=>retext({sx:100,sy:100});
const syncTx=t=>{
  syncLettering(t);textPathUI(t);$('text-blend').value=active.bm;$('text-blend').disabled=$('fill-import').disabled=!!active.lk;const tx={...TEXT_DEFAULTS,...t};
  for(const [id,property] of Object.entries(textControls)){
    const input=$(id);input.disabled=!!active?.lk;
    if(input.type==='checkbox')input.checked=tx[property];else input.value=tx[property];
  }
  $('tsz').value=tx.sz;$('type-edit').disabled=!!active?.lk;
  $('type-paste-style').disabled=!!active?.lk||!copiedTextStyle;
  for(const id of ['txt','tsz','tcol','tw','tit','tls','tlh','tx-reset'])$(id).disabled=!!active?.lk;
  for(const button of document.querySelectorAll('#tal button,#tsty button'))button.disabled=!!active?.lk;
  $('tx-fit').disabled=!!active?.lk||!tx.wrap||!tx.boxHeight;
  $('tx-fit-note').hidden=true;
  $('tx-angle-row').hidden=tx.fill!=='angled';$('tx-angle-value').textContent=tx.fillAngle+'°';
  $('tx-letter-value').textContent=(tx.ls||0)+'%';$('tx-line-value').textContent=(tx.lh||120)+'%';
  $('type-bg-options').hidden=!tx.bg;
  $('tx-width-value').textContent=tx.sx+'%';$('tx-height-value').textContent=tx.sy+'%';
  $('tx-stroke-value').textContent=tx.strokeWidth+' px';$('tx-end-row').hidden=tx.fill==='solid'||tx.fill==='photo';
$('tls').value=t.ls||0;$('tlh').value=t.lh||120;document.querySelectorAll('#tal button').forEach(b=>b.classList.toggle('on',b.dataset.a===(t.al||'left')))};
$('tls').oninput=()=>{retext({ls:+$('tls').value},'tls');$('tx-letter-value').textContent=$('tls').value+'%'};
$('tlh').oninput=()=>{retext({lh:+$('tlh').value},'tlh');$('tx-line-value').textContent=$('tlh').value+'%'};
$('tx-fit').onclick=()=>{
  const tx=active?.tx;
  if(!tx||active.lk||!tx.wrap||!tx.boxHeight)return;
  let low=6,high=800,best=0;
  while(low<=high){
    const size=Math.floor((low+high)/2),layout=measureTextLayout({...tx,sz:size});
    if(layout.width<=tx.wrap+.01&&layout.contentHeight<=tx.boxHeight){
      best=size;low=size+1;
    }else high=size-1;
  }
  if(tx.sz!==(best||6))retext({sz:best||6});
  const note=$('tx-fit-note');note.hidden=false;
  note.textContent=best?'Fitted at '+best+' px.':'Text exceeds this box at the minimum size of 6 px.';
};
$('tal').onclick=e=>{const b=e.target.closest('button');if(b)retext({al:b.dataset.a})};
const TSTY=[['Title',{f:'Anton',w:400,c:'#ffffff',ls:4,al:'center'},{sh:{x:0,y:6,b:14,a:.6,c:'#000000'}}],
['Neon',{f:'Orbitron',w:700,c:'#ffffff',ls:6},{gl:{c:'#ff3df0',r:34,i:85,sp:2,own:false,m:'screen'}}],
['Poster',{f:'Bebas Neue',w:400,c:'#ffffff',ls:6},{ol:{w:3,c:'#000000'}}],
['Script',{f:'Pacifico',w:400,c:'#ffe3b0',ls:0},{sh:{x:3,y:5,b:10,a:.55,c:'#000000'}}],
['Retro',{f:'Press Start 2P',w:400,c:'#ffd60a',ls:0},{sh:{x:6,y:6,b:0,a:1,c:'#e5383b'}}],
['Soft glow',{f:'Montserrat',w:700,c:'#ffffff',ls:3},{gl:{c:'#ffffff',r:26,i:55,sp:0,own:false,m:'screen'}}],
['Marker',{f:'Permanent Marker',w:400,c:'#ffffff',ls:0},{ol:{w:4,c:'#000000'}}],
['Elegant',{f:'Cinzel',w:700,c:'#f2d49b',ls:14},{sh:{x:0,y:4,b:12,a:.5,c:'#000000'}}],
['Fire',{f:'Anton',w:400,c:'#ffe27a',ls:2},{gl:{c:'#ff5a00',r:38,i:90,sp:3,own:false,m:'screen'}}],
['Typewriter',{f:'Special Elite',w:400,c:'#f4efe3',ls:0},{}],
['Sea glass',{f:'Montserrat',w:700,c:'#ebfff1',end:'#3facc6',fill:'angled',fillAngle:65,ls:2},{sh:{x:0,y:2,b:4,a:.55,c:'#17364c'}}],
['Race bib',{f:'Anton',w:400,c:'#fff2c3',bg:true,bgColor:'#9b2d31',bgOpacity:100,bgRadius:2,bgPadding:14,ls:3},{}],
['Gallery label',{f:'Inter',w:400,c:'#202333',bg:true,bgColor:'#f6efdf',bgOpacity:96,bgPadding:18,bgRadius:1,al:'left',wordSpace:10},{}],
['Foil stamp',{f:'Cinzel',w:700,c:'#fff1b4',end:'#956a42',fill:'radial',stroke:'#453348',strokeWidth:1,ls:6},{}]];
$('tsty').innerHTML=TSTY.map((s,i)=>`<button data-i="${i}" style="font-family:${fam(s[1].f)}">${s[0]}</button>`).join('');
$('tsty').onclick=async e=>{const b=e.target.closest('button');if(!b||!active||!active.tx||active.lk)return;const[,tx,fx]=TSTY[+b.dataset.i];const l=active,request=++fontRequest;await ensureFont(tx.f);if(active!==l||l.lk||request!==fontRequest)return;retext({fill:'solid',strokeWidth:0,bg:false,wordSpace:0,...tx});l.sh=fx.sh||null;l.ol=fx.ol||null;l.gl=fx.gl||null;refreshLayers();draw()};
let typeDrawing=false,typeBox=null,typeDraft=null;
const typeEditor=$('type-editor'),typeInput=$('type-content');
const typePoint=([x,y])=>[Math.min(W,Math.max(0,x)),Math.min(H,Math.max(0,y))];
function setTypeDrawing(enabled){
  if(typeBox&&c.hasPointerCapture(typeBox.pointer))c.releasePointerCapture(typeBox.pointer);
  typeBox=null;typeDrawing=enabled;
  for(const id of ['type-draw','type-draw-side','text-draw'])$(id).setAttribute('aria-pressed',String(enabled));
  $('type-hint').hidden=!enabled;
  c.style.cursor=enabled?'crosshair':tab==='layers'?'default':'crosshair';
  draw(true);
}
function toggleTypeDrawing(){
  if(!base){showTextLayer();return}
  const enabled=!typeDrawing;
  showTextLayer();
  setTypeDrawing(enabled);
}
function startTypeBox(event,point){
  if(event.button!==0||typeBox)return;
  event.preventDefault();
  c.setPointerCapture(event.pointerId);
  typeBox={start:typePoint(point),end:typePoint(point),pointer:event.pointerId};
  draw(true);
}
function typeRect([sx,sy],[ex,ey]){
  return {x:Math.min(sx,ex),y:Math.min(sy,ey),w:Math.abs(sx-ex),h:Math.abs(sy-ey)};
}
function drawTypeBox(){
  const {x,y,w,h}=typeRect(typeBox.start,typeBox.end),scale=KK();
  ctx.save();ctx.fillStyle='#7fd4ff26';ctx.fillRect(x,y,w,h);
  ctx.strokeStyle='#7fd4ff';ctx.lineWidth=scale;ctx.setLineDash([4*scale,3*scale]);
  ctx.strokeRect(x,y,w,h);ctx.restore();
}
function finishTypeBox(point){
  const box=typeRect(typeBox.start,typePoint(point)),minimum=8*KK();
  if(box.w<minimum||box.h<minimum){
    if(c.hasPointerCapture(typeBox.pointer))c.releasePointerCapture(typeBox.pointer);
    typeBox=null;draw(true);return;
  }
  setTypeDrawing(false);
  openTypeEditor({box});
}
function openTypeEditor(draft){
  if(typeEditor.open||draft.layer?.lk)return;
  typeDraft=draft;
  const tx=draft.layer?.tx,rect=c.getBoundingClientRect();
  const x=draft.box?draft.box.x+draft.box.w/2:draft.layer.x;
  const y=draft.box?draft.box.y:draft.layer.y;
  typeInput.value=tx?.t??'';
  typeInput.style.fontFamily=tx?fam(tx.f):'inherit';
  typeInput.style.textAlign=tx?.al==='justify'?'left':tx?.al||'left';
  typeEditor.showModal();
  const w=typeEditor.offsetWidth,h=typeEditor.offsetHeight;
  typeEditor.style.left=Math.max(12,Math.min(innerWidth-w-12,rect.left+x*rect.width/W-w/2))+'px';
  typeEditor.style.top=Math.max(12,Math.min(innerHeight-h-12,rect.top+y*rect.height/H+12))+'px';
  typeInput.focus();
  if(tx){typeInput.selectionStart=typeInput.selectionEnd=typeInput.value.length}
}
$('type-form').onsubmit=event=>{
  event.preventDefault();
  const draft=typeDraft,t=typeInput.value;
  typeDraft=null;typeEditor.close();
  if(!draft)return;
  if(draft.layer){
    if(active===draft.layer&&!active.lk&&t!==active.tx.t)retext({t});
  }else if(t.trim()){
    const {box}=draft;
    const sz=Math.round(Math.max(6,Math.min(120,box.h*.24,box.w*.13)));
    const padding=2*Math.ceil(sz*.15);
    newTextLayer({t,sz,al:'left',wrap:Math.max(1,Math.round(box.w-padding)),boxHeight:Math.max(0,Math.round(box.h-padding))},box);
  }
};
$('type-cancel').onclick=()=>typeEditor.close();
typeEditor.addEventListener('close',()=>{if(!typeEditor.open)typeDraft=null});
typeEditor.addEventListener('keydown',event=>{
  event.stopPropagation();
  if((event.ctrlKey||event.metaKey)&&event.key==='Enter'){
    event.preventDefault();$('type-form').requestSubmit();
  }
});
$('type-draw').onclick=$('type-draw-side').onclick=toggleTypeDrawing;
$('type-edit').onclick=()=>{if(active?.tx)openTypeEditor({layer:active})};
$('htxt').onclick=()=>{
  if(!base){showTextLayer();return}
  showTextLayer();setTypeDrawing(false);
  newTextLayer();$('txt').focus();$('txt').select();
};
c.addEventListener('dblclick',event=>{
  if((tab!=='layers'&&tab!=='text')||typeDrawing||!active?.tx||!active.vis)return;
  const [x,y]=LOC(active,pos(event)),[hw,hh]=EXT(active);
  if(Math.abs(x)<=hw&&Math.abs(y)<=hh)openTypeEditor({layer:active});
});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&typeDrawing){setTypeDrawing(false);return}
  if(isField(event.target)||event.ctrlKey||event.metaKey||event.altKey||event.key.toLowerCase()!=='t'||!base)return;
  event.preventDefault();
  if(event.shiftKey)toggleTypeDrawing();else $('htxt').click();
});

const letteringLooks=[
 ['Curved title',{shape:'arc',bend:44,f:'Arial Black',w:900,ls:2}],
 ['Tapered type',{shape:'taper',bend:92,f:'Impact',w:700}],
 ['Tall stems',{band:'y',pull:155,cut:53,f:'Impact',w:700,letterCase:'upper'}],
 ['Elastic stack',{band:'letter',cut:8,pull:25,rows:6,rowGap:7,travel:84,slant:10,f:'Arial Black',w:900,letterCase:'upper'}],
 ['Orange block',{depth:38,direction:-32,side:'#da701f',lighting:78,slant:0,c:'#f88b32',f:'Impact',ls:8,w:400,letterCase:'upper'}],
 ['Ribbon wave',{shape:'flag',bend:62,depth:9,direction:72,side:'#403576',c:'#d6c6ff',lighting:50,f:'Georgia',w:700}],
 ['Orange grove',{depth:35,direction:-30,side:'#db721c',lighting:70,trees:true,c:'#eb7829',f:'Impact',ls:9,w:400,letterCase:'upper'}],
 ['Flared horn',{shape:'custom',knots:[[0,-.55],[.33,-.07],[.67,.15],[1,.18],[0,1.58],[.33,1.06],[.67,.84],[1,.82]],sideBows:[[.085,0],[0,0]],f:'Impact',w:400,letterCase:'upper'}]
];
function syncTextPanel(){
 const items=layers.map((l,i)=>({l,i})).filter(({l})=>l.tx).reverse(),select=$('text-layer');
 select.replaceChildren(new Option(items.length?'Select a text layer':'No text layers',''),...items.map(({l,i})=>new Option(l.name+(l.lk?' · locked':l.vis?'':' · hidden'),String(i))));
 select.value=active?.tx?String(layers.indexOf(active)):'';select.disabled=!items.length;
 $('edit-text-layer').hidden=!active?.tx;
 $('text-empty').hidden=!!active?.tx;
 $('text-empty').textContent=base?(items.length?'Select a text layer or add another.':'Add text or draw a box on the image.'):'Open a photo or start with a transparent canvas.';
 $('type-blank').hidden=!!base;
 $('text-add').textContent=base?'Add text':'Open photo';
}
function syncLettering(tx){
 const s={...TYPE_SHAPE,...tx},locked=!!active?.lk;
 for(const el of $('type-design').querySelectorAll('[data-prop]')){
  const key=el.dataset.prop;if(el.type==='checkbox')el.checked=!!s[key];else el.value=s[key];el.disabled=locked;
  if(el.nextElementSibling?.tagName==='OUTPUT')el.nextElementSibling.value=s[key]+(el.dataset.unit||'');
 }
 for(const el of $('type-design').querySelectorAll('button')){
  el.disabled=locked;if(el.dataset.shape)el.setAttribute('aria-pressed',String(el.dataset.shape===s.shape));
 }
 $('mesh-tools').hidden=s.shape!=='custom';$('mesh-bend').hidden=s.shape==='custom'||s.shape==='plain';
 $('band-options').hidden=s.band==='off';$('stack-options').hidden=s.rows<=1;$('depth-options').hidden=!s.depth;
 if(s.shape==='custom'){
  const count=(s.knots?.length||8)/2,select=$('mesh-point'),total=count*2+2;
  if(select.length!==total){
   const previous=+select.value||0,index=select.length&&previous>=select.length-2?total-(select.length-previous):Math.min(previous,total-1);
   select.replaceChildren(...Array.from({length:total},(_,i)=>new Option(i<count?'Top '+(i+1):i<count*2?'Bottom '+(i-count+1):i===2*count?'Left edge':'Right edge',i)));
   select.value=index;
  }
  $('mesh-count').value=total;$('mesh-count-value').value=total;$('mesh-count').disabled=locked;
  const k=envelopeHandles(s)[+select.value];
  $('mesh-x').value=Math.round(k[0]*100);$('mesh-y').value=Math.round(k[1]*100);
  for(const id of ['mesh-x','mesh-y','mesh-point'])$(id).disabled=locked;
 }
}
function showTextLayer(){document.querySelector('[data-t="text"]').click()}
$('edit-text-layer').onclick=showTextLayer;
$('text-layer').onchange=e=>{if(e.target.value===''){active=null;refreshLayers();draw();return}active=layers[+e.target.value];textEdit=null;refreshLayers();draw()};
$('text-add').onclick=()=>base?$('htxt').click():$('open').click();
$('text-draw').onclick=()=>base?toggleTypeDrawing():$('open').click();
$('type-blank').onclick=async()=>{
 if(base)return;
 const blank=bc(1200,900);if(await load(await toBlob(blank,'image/png'))){showTextLayer();$('htxt').click()}
};
$('text-in-layers').onclick=()=>document.querySelector('[data-t="layers"]').click();
function shapeTiles(){
 const sample={t:'SHAPE',f:'Impact',sz:40,w:900,c:'#e9edff',al:'center',ls:0,lh:100};
 const grid=$('type-shapes');
 for(const [id,name] of Object.entries(TYPE_FORMS)){
  if(id==='custom')continue;
  const b=document.createElement('button');b.dataset.shape=id;b.setAttribute('aria-pressed','false');
  const img=document.createElement('img'),cv=textCanvas({...sample,shape:id,bend:72,knots:id==='custom'?[[0,-.1],[.33,.15],[.67,-.15],[1,.1],[0,1.2],[.33,1],[.67,.85],[1,1]]:null});
  img.src=cv.toDataURL();img.alt='';b.append(img,document.createTextNode(name));grid.append(b);
 }
}
$('custom-warp').onclick=()=>{if(active?.tx&&!active.lk&&active.tx.shape!=='custom')retext({shape:'custom'})};
$('type-shapes').onclick=e=>{const b=e.target.closest('[data-shape]');if(b&&active?.tx&&!active.lk)retext({shape:b.dataset.shape})};
$('letter-looks').replaceChildren(...letteringLooks.map(([name],i)=>{const b=document.createElement('button');b.textContent=name;b.dataset.look=i;return b}));
$('letter-looks').onclick=e=>{const b=e.target.closest('[data-look]');if(!b||!active?.tx||active.lk)return;
 const changes=letteringLooks[+b.dataset.look][1];
 retext({...TYPE_SHAPE,fill:'solid',strokeWidth:0,bg:false,sx:100,sy:100,...changes});
};
$('letter-reset').onclick=()=>retext({...TYPE_SHAPE});
for(const el of $('type-design').querySelectorAll('[data-prop]')){
 el.oninput=()=>{if(!active?.tx||active.lk)return;retext({[el.dataset.prop]:el.type==='checkbox'?el.checked:el.type==='range'?+el.value:el.value},el.id);syncLettering(active.tx)};
 el.onchange=el.onblur=()=>{textEdit=null};
}
function setKnot(knots,index,x,y){
 const count=knots.length/2,next=knots.map(p=>p.slice()),col=index%count,gap=Math.min(.035,.3/(count-1)),clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
 next[index]=[clamp(x,col?knots[index-1][0]+gap:-.55,col<count-1?knots[index+1][0]-gap:1.55),
  index<count?clamp(y,-1.5,knots[index+count][1]-.09):clamp(y,knots[index-count][1]+.09,2.5)];
 return next;
}
$('mesh-point').onchange=()=>active?.tx&&syncLettering(active.tx);
function adjustEnvelope(knots,bows,i,x,y){
 if(i<knots.length)return {knots:setKnot(knots,i,x,y)};
 const side=i-knots.length,mid=envelopeUV(knots,null,side,.5),next=(bows||[[0,0],[0,0]]).map(p=>p.slice());
 next[side]=[Math.max(-.45,Math.min(.45,x-mid[0])),Math.max(-.37,Math.min(.37,y-mid[1]))];return {sideBows:next};
}
function editKnotField(){if(!active?.tx||active.lk)return;const i=+$('mesh-point').value;
 retext(adjustEnvelope(active.tx.knots||freshKnots(),active.tx.sideBows,i,+$('mesh-x').value/100,+$('mesh-y').value/100));
}
$('mesh-x').onchange=$('mesh-y').onchange=editKnotField;
$('mesh-flat').onclick=()=>{if(active?.tx&&!active.lk)retext({knots:freshKnots((active.tx.knots?.length||8)/2),sideBows:null})};
let densityDrag=null;
$('mesh-count').oninput=e=>{
 const l=active;if(!l?.tx||l.lk)return;
 const initial=densityDrag?.layer===l?densityDrag.knots:l.tx.knots||freshKnots(),count=(+e.target.value-2)/2;
 const knots=Array.from({length:count*2},(_,i)=>{
  const row=i<count?0:initial.length/2,u=i%count/(count-1);
  return [knotAt(initial,row,u,0),knotAt(initial,row,u,1)];
 });
 retext({knots},'mesh-count',densityDrag?.layer===l);densityDrag={layer:l,knots:initial};syncLettering(l.tx);
};
$('mesh-count').onblur=$('mesh-count').onchange=()=>{densityDrag=null;textEdit=null};
function meshPixel(l,x,y){
 const g=l.cv.typeGeometry;return [g.x+g.w*x+(.5-y)*g.h*Math.tan(g.slant*Math.PI/180),g.y+g.h*y];
}
function meshWorld(l,x,y){
 const px=(x-l.cv.width*(1+l.cl-l.cr)/2)*l.s*(l.fl?-1:1),py=(y-l.cv.height*(1+l.ct-l.cb)/2)*l.s,co=Math.cos(l.r),si=Math.sin(l.r);
 return [l.x+co*px-si*py,l.y+si*px+co*py];
}
function hasMesh(){return tab==='text'&&active?.vis&&active.tx?.shape==='custom'&&active.cv.typeGeometry&&!typeDrawing}
function drawEnvelope(){
 const l=active,knots=l.tx.knots||freshKnots(),k=KK(),point=(x,y)=>meshWorld(l,...meshPixel(l,x,y));
 ctx.save();ctx.lineWidth=1.5*k;ctx.strokeStyle='#6dcfff';ctx.beginPath();
 const projected=(u,v)=>point(...envelopeUV(knots,l.tx.sideBows,u,v));
 for(const v of [0,.5,1])for(let j=0;j<=48;j++){const p=projected(j/48,v);if(j)ctx.lineTo(...p);else ctx.moveTo(...p)}
 const columns=knots.length/2;for(let i=0;i<columns;i++)for(let j=0;j<=16;j++){const p=projected(i/(columns-1),j/16);if(j)ctx.lineTo(...p);else ctx.moveTo(...p)}
 ctx.stroke();
 for(const [i,knot] of envelopeHandles(l.tx).entries()){const [x,y]=point(...knot);ctx.beginPath();ctx.arc(x,y,5*k,0,2*Math.PI);ctx.fillStyle=i===+$('mesh-point').value?'#ffbd48':'#fff';ctx.fill();ctx.strokeStyle='#18599c';ctx.stroke()}
 ctx.restore();
}
let meshDrag=null;
c.addEventListener('pointerdown',e=>{
 if(!hasMesh()||active.lk||spaceDown||e.button!==0)return;
 const l=active,p=pos(e),knots=l.tx.knots||freshKnots(),nearest=envelopeHandles(l.tx).map((k,i)=>{const q=meshWorld(l,...meshPixel(l,...k));return {i,d:Math.hypot(q[0]-p[0],q[1]-p[1])}}).sort((a,b)=>a.d-b.d)[0];
 if(nearest.d>12*KK())return;e.stopImmediatePropagation();e.preventDefault();c.setPointerCapture(e.pointerId);
 $('mesh-point').value=nearest.i;syncLettering(l.tx);
 meshDrag={l,i:nearest.i,id:e.pointerId,p,knots,bows:l.tx.sideBows,handle:envelopeHandles(l.tx)[nearest.i],g:l.cv.typeGeometry,origin:meshWorld(l,...meshPixel(l,0,0)),changed:false};
 draw(true);
},true);
function dragEnvelope(e){
 const drag=meshDrag;if(!drag||drag.id!==e.pointerId)return;
 if(active!==drag.l||active.lk||!hasMesh()){meshDrag=null;return}
 const l=active,p=pos(e),dx=p[0]-drag.p[0],dy=p[1]-drag.p[1],co=Math.cos(l.r),si=Math.sin(l.r);
 if(!drag.changed&&Math.hypot(dx,dy)<KK())return;
 const v=(-si*dx+co*dy)/l.s/drag.g.h,u=((co*dx+si*dy)*(l.fl?-1:1)/l.s+v*drag.g.h*Math.tan(drag.g.slant*Math.PI/180))/drag.g.w;
 const k=drag.handle;retext(adjustEnvelope(drag.knots,drag.bows,drag.i,k[0]+u,k[1]+v),'envelope',drag.changed);
 const origin=meshWorld(l,...meshPixel(l,0,0));l.x+=drag.origin[0]-origin[0];l.y+=drag.origin[1]-origin[1];
 drag.changed=true;syncLettering(l.tx);draw();
}
c.addEventListener('pointermove',e=>{if(meshDrag){e.stopImmediatePropagation();dragEnvelope(e)}},true);
function endEnvelope(e){if(meshDrag?.id===e.pointerId){if(e.type==='pointerup')dragEnvelope(e);meshDrag=null;textEdit=null}}
c.addEventListener('pointerup',endEnvelope,true);c.addEventListener('pointercancel',endEnvelope,true);
shapeTiles();syncTextPanel();


/* ---------- Custom tones ---------- */
let cs=[{c:'#101820',p:0},{c:'#d23c2c',p:50},{c:'#f4efe3',p:100}];
function customTable(mid=+mapMid.value){
  return makeToneTable(cs.map(stop=>stop.c),cs.map(stop=>stop.p),{curve:mapCurve.value,mid});
}
function sampleTable(table,position){
  const offset=Math.round(position/100*255)*3;
  return hex(table[offset],table[offset+1],table[offset+2]);
}
let selectedStop=0,stopDrag=null;
const gradientBar=$('ramp'),stopHandles=$('gradient-handles'),stopColour=$('gradient-colour'),stopLocation=$('gradient-location');
const rampCanvas=bc(256,1),rampContext=rampCanvas.getContext('2d'),rampPixels=rampContext.createImageData(256,1);
gradientBar.append(rampCanvas);
function paintGradientRamp(){
  const table=LUT||customTable();
  for(let i=0;i<256;i++){
    for(let k=0;k<3;k++)rampPixels.data[i*4+k]=table[i*3+k];
    rampPixels.data[i*4+3]=255;
  }
  rampContext.putImageData(rampPixels,0,0);
}
const rampToStop=x=>100*(Math.max(0,Math.min(100,x))/100)**midpointGamma(+mapMid.value);
const stopToRamp=p=>100*(p/100)**(1/midpointGamma(+mapMid.value));
function updateStopControls(){
  const stop=cs[selectedStop],fixed=selectedStop===0||selectedStop===cs.length-1;
  stopColour.value=stop.c;stopLocation.value=stop.p;
  stopLocation.disabled=$('gradient-delete').disabled=fixed;
  if(!fixed){stopLocation.min=cs[selectedStop-1].p+1;stopLocation.max=cs[selectedStop+1].p-1}
  [...stopHandles.children].forEach((handle,i)=>{
    const {p,c}=cs[i];
    handle.style.left=stopToRamp(p)+'%';handle.style.setProperty('--stop',c);
    handle.setAttribute('aria-label','Colour stop at '+p+'% of the gradient');
    handle.setAttribute('aria-pressed',String(i===selectedStop));
  });
}
function buildC(){
  stopHandles.replaceChildren(...cs.map((_,i)=>{
    const button=document.createElement('button');
    button.type='button';button.dataset.stop=i;return button;
  }));
  updateStopControls();
  document.querySelectorAll('#ctn button').forEach(b=>b.classList.toggle('on',+b.dataset.n===cs.length));
}
function applyC(){
  if(cur!==-1){cur=-1;showP($('q').value.toLowerCase())}
  $('gradient-enabled').checked=true;
  setStops(cs.map(s=>s.c),cs.map(s=>s.p),false);
}
const setCs=cols=>{
  if(base)pushU(toneSnapshot());
  cs=cols.map((c,i)=>({c,p:Math.round(i/(cols.length-1)*100)}));
  selectedStop=0;buildC();applyC();
};
function resetCustom(){
  cs=[{c:'#101820',p:0},{c:'#d23c2c',p:50},{c:'#f4efe3',p:100}];
  selectedStop=0;buildC();
}
function rampPosition(event){
  const rect=gradientBar.getBoundingClientRect();
  return Math.min(100,Math.max(0,Math.round(rampToStop((event.clientX-rect.left)/rect.width*100))));
}
function moveStop(value){
  if(stopLocation.disabled||!Number.isFinite(value))return;
  const p=Math.min(+stopLocation.max,Math.max(+stopLocation.min,Math.round(value)));
  if(p===cs[selectedStop].p){stopLocation.value=p;return}
  if(base&&!stopDrag?.saved){pushU(toneSnapshot());if(stopDrag)stopDrag.saved=true}
  cs[selectedStop].p=p;updateStopControls();applyC();
}
gradientBar.onclick=event=>{
  const p=rampPosition(event),existing=cs.findIndex(stop=>stop.p===p);
  if(existing>=0){selectedStop=existing;updateStopControls()}
  else{
    if(base)pushU(toneSnapshot());
    selectedStop=cs.findIndex(stop=>stop.p>p);
    cs.splice(selectedStop,0,{p,c:sampleTable(customTable(50),p)});buildC();applyC();
  }
  stopHandles.children[selectedStop].focus();
};
function selectHandle(event){
  const handle=event.target.closest('button');
  if(!handle)return null;
  selectedStop=+handle.dataset.stop;updateStopControls();return handle;
}
stopHandles.onclick=selectHandle;
stopHandles.ondblclick=()=>stopColour.click();
stopHandles.onpointerdown=event=>{
  if(event.button!==0)return;
  const handle=selectHandle(event);
  if(!handle||stopLocation.disabled)return;
  const rect=gradientBar.getBoundingClientRect();
  stopDrag={id:event.pointerId,x:event.clientX,start:stopToRamp(cs[selectedStop].p),width:rect.width,saved:false};
  handle.setPointerCapture(event.pointerId);
};
stopHandles.onpointermove=event=>{
  if(stopDrag?.id===event.pointerId)moveStop(rampToStop(stopDrag.start+(event.clientX-stopDrag.x)/stopDrag.width*100));
};
stopHandles.onlostpointercapture=()=>{stopDrag=null};
stopHandles.onkeydown=event=>{
  if(!['ArrowLeft','ArrowRight','Delete','Backspace'].includes(event.key)||!selectHandle(event))return;
  event.preventDefault();event.stopPropagation();
  if(event.key==='Delete'||event.key==='Backspace')$('gradient-delete').click();
  else moveStop(cs[selectedStop].p+(event.key==='ArrowLeft'?-1:1)*(event.shiftKey?5:1));
};
let colourUndo=null;
stopColour.oninput=()=>{
  if(base&&!colourUndo){colourUndo=toneSnapshot();pushU(colourUndo)}
  cs[selectedStop].c=stopColour.value;updateStopControls();applyC()};
stopColour.onchange=stopColour.onblur=()=>{colourUndo=null};
stopLocation.onchange=()=>moveStop(+stopLocation.value);
$('gradient-delete').onclick=()=>{
  if(stopLocation.disabled)return;
  if(base)pushU(toneSnapshot());
  cs.splice(selectedStop,1);selectedStop--;buildC();applyC();
  stopHandles.children[selectedStop].focus();
};
$('ctn').onclick=e=>{
  const b=e.target.closest('button');if(!b)return;
  const n=+b.dataset.n;
  const table=customTable(50);
  setCs(Array.from({length:n},(_,i)=>sampleTable(table,i/(n-1)*100)));
};
const imgTone=n=>{if(!palette.length)return;const p=palette,cols=[hex(...p[0])];if(n===3){let b=1,bs=-1;for(let i=1;i<p.length-1;i++){const m=Math.max(...p[i])-Math.min(...p[i]);if(m>bs){bs=m;b=i}}cols.push(hex(...p[Math.min(b,p.length-1)]))}cols.push(hex(...p[p.length-1]));setCs(cols)};
$('cimg2').onclick=()=>imgTone(2);$('cimg3').onclick=()=>imgTone(3);
const hueOf=h=>{const[r,g,b]=rgb(h).map(v=>v/255),M=Math.max(r,g,b),m=Math.min(r,g,b),d=M-m;if(!d)return 0;const H=M===r?((g-b)/d)%6:M===g?(b-r)/d+2:(r-g)/d+4;return((H*60)+360)%360};
const HARM={comp:[0,180],tri:[0,120,240],ana:[-30,0,30],split:[0,150,210],tet:[0,90,180,270],mono:[0,0,0]};
document.querySelectorAll('#hrm button').forEach(b=>b.onclick=()=>{const h0=hueOf($('hc').value),hs=HARM[b.dataset.h],n=hs.length;setCs(hs.map((o,i)=>hsl((h0+o+720)%360,.55,.1+.8*i/(n-1))))});
buildC();paintGradientRamp();

/* ---------- Glow, overlays and layer look ---------- */
function glowOf(l){const G=l.gl,iw=l.cv.width,ih=l.cv.height,b=Math.min(300,G.r/l.s),sp=G.sp/l.s,k=[l.ver||0,iw,ih,l.s.toFixed(2),JSON.stringify(G)].join('|');if(l.gc&&l.gc.k===k)return l.gc;
  const pad=Math.ceil(b*1.6+sp)+2,gw=iw+pad*2,gh=ih+pad*2,cv=bc(gw,gh),g=cv.getContext('2d'),passes=Math.max(1,Math.round(G.i/100*5)),al=Math.min(1,.3+G.i/100*.7);
  if(G.own){const src=bc(gw,gh);src.getContext('2d').drawImage(l.cv,pad,pad);const kk=Math.max(2,Math.round(b/3)),s1=bc(Math.max(1,Math.ceil(gw/kk)),Math.max(1,Math.ceil(gh/kk))),g1=s1.getContext('2d');g1.imageSmoothingQuality='high';g1.drawImage(src,0,0,s1.width,s1.height);
    const s2=bc(Math.max(1,s1.width>>1),Math.max(1,s1.height>>1)),g2=s2.getContext('2d');g2.imageSmoothingQuality='high';g2.drawImage(s1,0,0,s2.width,s2.height);g.imageSmoothingQuality='high';g.globalAlpha=al;for(let i=0;i<passes;i++)g.drawImage(s2,0,0,gw,gh)}
  else{const OFF=gw+gh+2000,sOff=sp>.5?Array.from({length:12},(_,i)=>[Math.cos(i/12*6.2832)*sp,Math.sin(i/12*6.2832)*sp]):[[0,0]];g.shadowColor=G.c;g.shadowBlur=b;g.shadowOffsetX=OFF;g.globalAlpha=al;
    for(let p=0;p<passes;p++)for(const[ox,oy]of(p?[[0,0]]:sOff))g.drawImage(l.cv,pad-OFF+ox,pad+oy)}
  l.gc={k,cv,pad};return l.gc}
const filtStr=f=>{const s=[];if(f.b)s.push(`brightness(${1+f.b/100})`);if(f.c)s.push(`contrast(${1+f.c/100})`);if(f.s)s.push(`saturate(${1+f.s/100})`);if(f.h)s.push(`hue-rotate(${f.h}deg)`);if(f.g)s.push(`grayscale(${f.g}%)`);if(f.iv)s.push('invert(1)');if(f.r)s.push(`blur(${f.r}px)`);return s.join(' ')};
function tintOf(l){const k=(l.ver||0)+'|'+l.tn.c+'|'+l.tn.a+'|'+l.cv.width+l.cv.height;if(l.tnc&&l.tnc.k===k)return l.tnc.cv;const s=bc(l.cv.width,l.cv.height),g=s.getContext('2d');g.drawImage(l.cv,0,0);g.globalCompositeOperation='source-atop';g.fillStyle=rgba(l.tn.c,l.tn.a);g.fillRect(0,0,s.width,s.height);l.tnc={k,cv:s};return s}
function syncFx2(a){$('gon').checked=!!(a&&a.gl);if(a&&a.gl){$('gc').value=a.gl.c;$('gr').value=a.gl.r;$('gi').value=a.gl.i;$('gsp').value=a.gl.sp;$('gown').checked=!!a.gl.own;$('gbm').value=a.gl.m}
  const f=(a&&a.lf)||{};$('lkb').value=f.b||0;$('lkc').value=f.c||0;$('lks').value=f.s||0;$('lkh').value=f.h||0;$('lkr').value=f.r||0;$('lkg').value=f.g||0;$('lki').checked=!!f.iv;$('ltn').checked=!!(a&&a.tn);if(a&&a.tn){$('ltc').value=a.tn.c;$('lta').value=Math.round(a.tn.a*100)}}
let glT=0,lkT=0;
const setGl=()=>{const l=active;if(!l||l.lk)return;const n=Date.now();if(n-glT>800)pushU(mkSnap('p'));glT=n;l.gl=$('gon').checked?{c:$('gc').value,r:+$('gr').value,i:+$('gi').value,sp:+$('gsp').value,own:$('gown').checked,m:$('gbm').value}:null;draw()};
['gon','gc','gr','gi','gsp','gown','gbm'].forEach(i=>$(i).oninput=setGl);
const GP={soft:{c:'#ffffff',r:30,i:45,sp:0,own:false,m:'screen'},neon:{c:'#00e5ff',r:40,i:90,sp:2,own:false,m:'screen'},halo:{c:'#fff2b0',r:70,i:70,sp:6,own:false,m:'screen'},fire:{c:'#ff5a00',r:45,i:85,sp:3,own:false,m:'screen'},bloom:{c:'#ffffff',r:60,i:65,sp:0,own:true,m:'screen'},ice:{c:'#8fd8ff',r:50,i:75,sp:2,own:false,m:'screen'}};
$('gpre').onclick=e=>{const b=e.target.closest('button');if(!b||!active||active.lk)return;pushU(mkSnap('p'));active.gl={...GP[b.dataset.g]};refreshLayers();draw()};
const setLk=()=>{const l=active;if(!l||l.lk)return;const n=Date.now();if(n-lkT>800)pushU(mkSnap('p'));lkT=n;l.lf={b:+$('lkb').value,c:+$('lkc').value,s:+$('lks').value,h:+$('lkh').value,r:+$('lkr').value,g:+$('lkg').value,iv:$('lki').checked};l.tn=$('ltn').checked?{c:$('ltc').value,a:$('lta').value/100}:null;draw()};
['lkb','lkc','lks','lkh','lkr','lkg','lki','ltn','ltc','lta'].forEach(i=>$(i).oninput=setLk);
$('lklr').onclick=act(l=>{l.lf=null;l.tn=null});
$('ltone').onclick=()=>{if(!LUT){$('lmsg').textContent='Pick a tone map on the Tone tab first.';return}$('lmsg').textContent='';const L=LUT,s=$('str').value/100,tone=mapSampler();if(!s)return;aop(d=>{for(let i=0;i<d.length;i+=4){const q=Math.round(tone(d[i],d[i+1],d[i+2]))*3;d[i]+=(L[q]-d[i])*s;d[i+1]+=(L[q+1]-d[i+1])*s;d[i+2]+=(L[q+2]-d[i+2])*s}})};
['gl','gls','glt','glc','glo'].forEach(i=>$(i).oninput=()=>draw(true));
function bloom(x0,original,mask){const a=+$('gl').value/100;if(!a||original||mask>=0)return;const k=Math.max(2,+$('gls').value),sw=Math.max(2,Math.ceil(W/k)),sh=Math.max(2,Math.ceil(H/k)),s1=bc(sw,sh),g1=s1.getContext('2d',{willReadFrequently:true});g1.imageSmoothingQuality='high';g1.drawImage(c,0,0,sw,sh);
  const im=g1.getImageData(0,0,sw,sh),d=im.data,th=+$('glt').value/100,own=$('glo').checked,tc=rgb($('glc').value);
  for(let i=0;i<d.length;i+=4){const l=(d[i]*.299+d[i+1]*.587+d[i+2]*.114)/255,t=th?ss(th-.2,th+.2,l):1;if(own){d[i]*=t;d[i+1]*=t;d[i+2]*=t}else{d[i]=tc[0]*l*t;d[i+1]=tc[1]*l*t;d[i+2]=tc[2]*l*t}}
  g1.putImageData(im,0,0);const s2=bc(Math.max(1,sw>>1),Math.max(1,sh>>1)),g2=s2.getContext('2d');g2.imageSmoothingQuality='high';g2.drawImage(s1,0,0,s2.width,s2.height);
  ctx.save();if(x0){ctx.beginPath();ctx.rect(x0,0,W-x0,H);ctx.clip()}ctx.globalCompositeOperation='screen';ctx.imageSmoothingQuality='high';ctx.globalAlpha=Math.min(1,a);ctx.drawImage(s2,0,0,W,H);if(a>.5){ctx.globalAlpha=(a-.5)*2*.5;ctx.drawImage(s2,0,0,W,H)}ctx.restore()}
const OVK=[
  ['Linear gradient','grad','overlay',.8,'Light','#ee8073','#5582e4'],
  ['Radial glow','rad','screen',.75,'Light','#ffe3aa','#ed805e'],
  ['Light leak','leak','screen',.85,'Light','#ff7a1a','#bd335f'],
  ['Sun rays','rays','screen',.7,'Light','#ffdfa1','#fff7df'],
  ['Bokeh','bok','screen',.78,'Light','#f7ae63','#a09de6'],
  ['Film grain','grain','overlay',.55,'Texture','#222222','#eeeeee'],
  ['Dust and scratches','dust','screen',.8,'Texture','#fff6df','#d7bda0'],
  ['Clouds','cloud','soft-light',.9,'Texture','#9dc2ea','#c2abad'],
  ['Vignette','vig','multiply',.9,'Frame','#15101c','#15101c'],
  ['Lens flare','flare','screen',.8,'Light','#ffd097','#519bce'],
  ['Scanlines','scan','multiply',.8,'Pattern','#20202b','#20202b'],
  ['Grid','grid','overlay',.7,'Pattern','#f1f7ff','#b1c9e8'],
  ['Aurora','aurora','screen',.8,'Light','#52e3b5','#8c69f2'],
  ['Stars','stars','screen',.85,'Light','#fff4cb','#a6ccff'],
  ['Paper fibres','paper','soft-light',.8,'Texture','#695646','#f9e3bb'],
  ['Halftone dots','dots','multiply',.8,'Pattern','#261f39','#463559'],
  ['Diagonal stripes','stripes','soft-light',.82,'Pattern','#f0dfba','#7b94de'],
  ['Film frame','film','source-over',1,'Frame','#161419','#e9dfcb'],
  ['Double border','border','source-over',.9,'Frame','#ffffff','#d9bba7'],
  ['Window light','window','soft-light',.95,'Light','#fff2c1','#edbb84',-17],
  ['Prism streak','prism','screen',.85,'Light','#ff9779','#77cfff',-19],
  ['Pool caustics','caustics','screen',.78,'Light','#83dddc','#fff0c1',0],
  ['Engraved waves','engrave','multiply',.82,'Pattern','#202944','#805571',-12],
  ['Moiré screen','moire','multiply',.72,'Pattern','#34334b','#715176',12],
  ['Linen weave','linen','soft-light',.95,'Texture','#4f392f','#fff2d3'],
  ['Ink spatter','spatter','multiply',.88,'Texture','#272136','#7c3f57'],
  ['Folded paper','fold','soft-light',.96,'Texture','#483e44','#fff6dd',-5],
  ['Deckled edge','deckle','source-over',.98,'Frame','#f3e7d2','#bb9f80'],
  ['Photo corners','corners','source-over',.95,'Frame','#27252a','#937b5e'],
  ['Phosphor mask','phosphor','soft-light',.85,'Pattern','#4c7ba8','#d28276'],
  ['Instant print','instant','source-over',1,'Frame','#fff6dc','#887c70'],
  ['Custom border','customBorder','source-over',1,'Frame','#f7efdb','#b89455'],
  ['Rain rings','rainRings','screen',.88,'Water','#8ec9de','#f1fff9'],
  ['Droplets on glass','wetGlass','source-over',.82,'Water','#172e41','#f0ffff'],
  ['Shoreline foam','shoreFoam','screen',.86,'Water','#9ce4d6','#fffbed'],
  ['Underwater sunlight','sunShafts','screen',.78,'Water','#409eae','#fff2c3',-16],
  ['Wave glints','glints','screen',.88,'Water','#73d8d9','#fff4ce'],
  ['Waterfall mist','mist','screen',.82,'Water','#81b8d2','#f2ffff'],
  ['Water reflection','reflection','source-over',1,'Water','#306376','#b9f0df'],
  ['Film halation','halation','screen',.94,'Photo','#ff7848','#ffcc86'],
  ['Highlight glints','photoGlints','screen',.95,'Photo','#ffe0ad','#fff9e3',12],
  ['Etched contours','edgeInk','multiply',.90,'Photo','#162639','#67445c']
];
const usesPhoto=i=>OVK[i][4]==='Photo'||OVK[i][1]==='reflection';
const borderDefaults={style:'double',width:1.3,inset:2,radius:0,gap:1,bottom:5,separate:false};
const waterEffect=i=>OVK[i][4]==='Water'||OVK[i][1]==='caustics';
/* Highlight detection is cached per source photo. Colour and lens edits reuse the same peaks. */
const glintBase={
  mode:'cross',glow:'halation',colour:'prism',kelvin:5200,cut:87,count:5,length:22,angle:-3,
  width:66,fringe:35,coreSize:80,amount:92,radius:4,gain:55,trail:17,direction:12,placement:'auto',a:'#fff1c6',b:'#ff9766'
};
const glintLooks={
  sunstar:{mode:'ten',angle:-12,width:39,length:18,glow:'halation',colour:'source',kelvin:4800,cut:94,coreSize:66},
  jewelry:{mode:'eight',angle:26,width:48,length:10,count:15,glow:'bloom',radius:2,kelvin:7000,fringe:74},
  glass:{mode:'cross',angle:4,width:34,length:27,coreSize:56,glow:'bloom',colour:'source',gain:24},
  chrome:{},filter:{mode:'six',angle:16,length:15,glow:'bloom',colour:'white',kelvin:6100},
  cinema:{mode:'streak',angle:0,length:33,colour:'custom',a:'#76baff',b:'#6b9dff',glow:'bloom',radius:5,kelvin:7600},
  prism:{mode:'eight',length:18,colour:'prism',angle:11,kelvin:6500,glow:'bloom'},
  motion:{mode:'streak',length:12,angle:-16,glow:'motion',trail:24,direction:158,radius:5,gain:82,colour:'custom',a:'#ffe7c3',b:'#ff7256',kelvin:4500},
  mist:{mode:'soft',glow:'bloom',radius:9,gain:82,cut:77,count:14,colour:'source',kelvin:5900}
};
const glintAnalysis=new WeakMap();
function analyseGlints(source){
  if(glintAnalysis.has(source))return glintAnalysis.get(source);
  const scale=Math.min(1,540/Math.max(source.width,source.height));
  const w=Math.max(1,Math.round(source.width*scale)),h=Math.max(1,Math.round(source.height*scale));
  const sample=bc(w,h),g=sample.getContext('2d',{willReadFrequently:true});
  g.drawImage(source,0,0,w,h);
  const pixels=g.getImageData(0,0,w,h).data,light=new Float32Array(w*h);
  const pitch=w+1,integral=new Float64Array(pitch*(h+1)),brightArea=new Float64Array(integral.length);
  for(let y=0;y<h;y++){
    let row=0,brightRow=0;
    for(let x=0;x<w;x++){
      const i=(y*w+x)*4,v=(.2126*pixels[i]+.7152*pixels[i+1]+.0722*pixels[i+2])*pixels[i+3]/65025;
      light[y*w+x]=v;row+=v;
      brightRow+=Math.max(0,(v-.76)/.24)**2;
      const above=y*pitch+x+1;
      integral[above+pitch]=row+integral[above];
      brightArea[above+pitch]=brightRow+brightArea[above];
    }
  }
  function mean(table,x,y,r){
    const l=Math.max(0,x-r),t=Math.max(0,y-r),b=Math.min(h,y+r+1),right=Math.min(w,x+r+1);
    return (table[b*pitch+right]-table[b*pitch+l]-table[t*pitch+right]+table[t*pitch+l])/((right-l)*(b-t));
  }
  const step=Math.max(3,Math.round(Math.min(w,h)/44)),peaks=[];
  for(let top=0;top<h;top+=step)for(let left=0;left<w;left+=step){
    let best=-1,bestScore=0;
    for(let y=top;y<Math.min(h,top+step);y++)for(let x=left;x<Math.min(w,left+step);x++){
      const j=y*w+x,v=light[j];if(v<.29)continue;
      // Favor a coherent bright reflection over isolated noise or a flat white field.
      const local=Math.max(0,v-mean(integral,x,y,step)),wide=Math.max(0,v-mean(integral,x,y,step*5));
      const support=mean(brightArea,x,y,3);
      // A specular point falls off on both sides. A long bright boundary has little falloff along its tangent.
      const span=Math.min(step,5),xl=Math.max(0,x-span),xr=Math.min(w-1,x+span),yt=Math.max(0,y-span),yb=Math.min(h-1,y+span);
      const across=Math.max(0,v-(light[y*w+xl]+light[y*w+xr])/2),along=Math.max(0,v-(light[yt*w+x]+light[yb*w+x])/2);
      const score=(.18*local+.95*wide)*v**4*(.35+1.5*support)*(.7+1.8*Math.min(across,along));
      if(score>bestScore){bestScore=score;best=j}
    }
    if(best<0||bestScore<.008)continue;
    const i=best*4,bx=best%w,by=Math.floor(best/w),floor=light[best]-.05;
    let energy=0,cx=0,cy=0;
    for(let yy=Math.max(0,by-2);yy<=Math.min(h-1,by+2);yy++)for(let xx=Math.max(0,bx-2);xx<=Math.min(w-1,bx+2);xx++){
      const e=Math.max(0,light[yy*w+xx]-floor);energy+=e;cx+=(xx+.5)*e;cy+=(yy+.5)*e;
    }
    peaks.push({x:cx/(energy*w),y:cy/(energy*h),value:light[best],score:bestScore,rgb:[pixels[i],pixels[i+1],pixels[i+2]]});
  }
  const result={peaks:peaks.sort((a,b)=>b.score-a.score),pixels,w,h};
  glintAnalysis.set(source,result);return result;
}
function findGlints(analysis,s,w,h){
  const found=[],spacing=Math.min(w,h)*Math.max(.045,.14/Math.sqrt(s.count/5));
  if(s.placement!=='manual'){
    for(const p of analysis.peaks){
      if(p.value<s.cut/100)continue;
      if(found.length&&p.score<found[0].score*.105)break;
      if(found.some(q=>Math.hypot((q.x-p.x)*w,(q.y-p.y)*h)<spacing))continue;
      found.push(p);if(found.length>=s.count)break;
    }
  }
  const top=found[0]?.score||1;
  const spots=found.map(p=>({...p,weight:Math.min(1,(p.score/top)**.62)*Math.min(1,.55+p.score)}));
  if(s.placement!=='auto')for(const p of s.points||[]){
    const x=Math.min(analysis.w-1,Math.floor(p.x*analysis.w)),y=Math.min(analysis.h-1,Math.floor(p.y*analysis.h)),i=(y*analysis.w+x)*4;
    spots.push({...p,weight:1,rgb:Array.from(analysis.pixels.subarray(i,i+3))});
  }
  return spots;
}
const glintTemps=[[2200,[255,152,69]],[3200,[255,195,139]],[4500,[255,222,187]],[5600,[255,242,223]],[6500,[255,255,255]],[8000,[221,236,255]],[10000,[188,214,255]]];
function glintTemperature(k){
  let i=1;while(i<glintTemps.length-1&&glintTemps[i][0]<k)i++;
  const [lo,a]=glintTemps[i-1],[hi,b]=glintTemps[i],t=Math.max(0,Math.min(1,(k-lo)/(hi-lo)));
  return a.map((v,j)=>v+(b[j]-v)*t);
}
function glintColours(s,spot,temp){
  let light=[255,255,255],halo=s.glow==='halation'||s.glow==='motion'?[255,152,98]:light;
  if(s.colour==='custom'){light=rgb(s.a);halo=rgb(s.b)}
  if(s.colour==='source'){
    const max=Math.max(1,...spot.rgb);
    light=spot.rgb.map(v=>255*(.16+.84*v/max));halo=light;
  }
  const tint=values=>hex(...values.map((v,i)=>Math.round(v*temp[i]/255)));
  return {light:tint(light),halo:tint(halo),core:tint(light.map(v=>235+20*v/255))};
}
function glintHalo(g,x,y,rx,ry,colour,alpha){
  if(rx<=0||ry<=0||alpha<=0)return;
  g.save();g.translate(x,y);g.scale(rx,ry);
  const glow=g.createRadialGradient(0,0,0,0,0,1);
  for(const [position,opacity] of [[0,1],[.14,.83],[.36,.40],[.67,.10],[1,0]])glow.addColorStop(position,rgba(colour,Math.min(1,alpha*opacity)));
  g.fillStyle=glow;g.fillRect(-1,-1,2,2);g.restore();
}
function glintRay(g,length,width,colour,alpha){
  const fade=g.createLinearGradient(0,0,length,0);
  for(const [t,a] of [[0,1],[.12,.91],[.45,.55],[.78,.19],[1,0]])fade.addColorStop(t,rgba(colour,Math.min(1,alpha*a)));
  g.fillStyle=fade;g.beginPath();g.moveTo(0,-width);
  g.bezierCurveTo(length*.12,-width*.23,length*.56,-width*.08,length,0);
  g.bezierCurveTo(length*.56,width*.08,length*.12,width*.23,0,width);g.fill();
}
function drawGlintField(g,w,h,settings,source){
  const s={...glintBase,...settings},spots=findGlints(analyseGlints(source),s,w,h);
  const unit=Math.min(w,h)/100,temp=glintTemperature(s.kelvin),energy=s.amount/100;
  if(!energy)return;
  g.save();g.globalCompositeOperation='screen';
  for(const p of spots){
    const {light,halo,core}=glintColours(s,p,temp),weight=.23+.77*p.weight;
    const ray=unit*s.length*weight,r=unit*s.radius*(.5+.5*weight),gain=s.gain/100*energy;
    g.save();g.translate(p.x*w,p.y*h);
    if(s.glow==='bloom')glintHalo(g,0,0,r*1.7,r*1.7,halo,gain);
    if(s.glow==='halation'){
      glintHalo(g,0,0,r*2,r*2,halo,gain*.85);
      glintHalo(g,0,0,r*.64,r*.64,light,gain);
    }
    if(s.glow==='motion'){
      const trail=s.trail*unit*weight;
      g.save();g.rotate(s.direction*Math.PI/180);
      // Overlapping, fading exposures leave the brightest end at the light source.
      for(let j=17;j>=0;j--){const t=j/17;
        glintHalo(g,t*trail,0,r+trail*.12,r*(.32+.5*t),halo,gain*.42*(1-t*.92)**1.4);
      }
      glintHalo(g,0,0,r,r,light,gain*.6);g.restore();
    }
    if(s.mode!=='soft'){
      g.rotate(s.angle*Math.PI/180);
      const rays=({six:6,eight:8,ten:10})[s.mode]||4;
      const thickness=Math.max(.22,unit*(.24+.34*weight)*s.width/100);
      for(let j=0;j<rays;j++){
        g.save();g.rotate(j*Math.PI*2/rays);
        const len=ray*(s.mode==='streak'?(j%2?.085:1.3):s.mode==='eight'&&j%2?.53:j%2?.89:1);
        if(s.colour==='prism'&&s.fringe){
          const split=.00048*s.fringe;g.save();g.rotate(split);glintRay(g,len*1.07,thickness*.68,'#ff8272',energy*.65);
          g.rotate(-2*split);glintRay(g,len*.95,thickness*.68,'#78beff',energy*.77);g.restore();
        }
        // A faint diffraction skirt blends the bright axial spike into the surrounding reflection.
        glintHalo(g,0,0,len*.58,thickness*2.8,light,energy*.17*weight);
        glintRay(g,len,thickness*2.3,light,energy*.35*weight);
        glintRay(g,len,thickness*.77,core,energy);g.restore();
      }
    }
    const coreRadius=(.6+unit*.85*weight)*s.coreSize/100;
    glintHalo(g,0,0,coreRadius*2.3,coreRadius*2.3,light,energy*.42*weight);
    glintHalo(g,0,0,coreRadius,coreRadius,core,energy*weight);
    g.restore();
  }
  g.restore();
}


function overlayDefaults(i){
  const settings={i,a:OVK[i][5],b:OVK[i][6],amount:60,angle:OVK[i][7]??45,seed:42};
  if(OVK[i][1]==='photoGlints')Object.assign(settings,glintBase,{points:[]});
  if(OVK[i][1]==='customBorder')Object.assign(settings,borderDefaults,{amount:100});
  if(waterEffect(i))settings.waterScale=100;
  if(OVK[i][1]==='reflection'){settings.waterline=57;settings.amount=90}
  return settings;
}
const newSeed=()=>Math.floor(Math.random()*4294967296);
function overlayRandom(seed){
  let state=seed>>>0;
  return ()=>{
    state=(Math.imul(1664525,state)+1013904223)>>>0;
    return state/4294967296;
  };
}
// These patterns use canvas-relative distances so a thumbnail and an export share the same composition.
function drawCaustics(g,w,h,a,b,intensity,angle,random,scalePercent=100){
  // Bright ridges appear between neighbouring cells in a warped distance field.
  const scale=Math.min(1,720/Math.max(w,h)),sw=Math.max(1,Math.round(w*scale)),sh=Math.max(1,Math.round(h*scale));
  const field=bc(sw,sh),context=field.getContext('2d'),image=context.createImageData(sw,sh);
  const pitch=Math.max(1,Math.min(sw,sh)*scalePercent/600,Math.hypot(sw,sh)/60);
  const centre=Math.ceil(Math.hypot(sw,sh)/pitch/2)+4,side=centre*2+1;
  const sites=Array.from({length:side*side},(_,i)=>[i%side+.15+.7*random(),Math.floor(i/side)+.15+.7*random()]);
  const phase=random()*Math.PI*2,co=Math.cos(angle*Math.PI/180),si=Math.sin(angle*Math.PI/180);
  const ink=rgb(a),light=rgb(b);
  for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){
    const px=(x-sw/2)/pitch,py=(y-sh/2)/pitch,u=co*px-si*py,v=si*px+co*py;
    const fx=centre+u+.32*Math.sin(1.6*v+phase)+.14*Math.sin(2.2*u+v);
    const fy=centre+v+.31*Math.sin(1.3*u-phase)+.12*Math.sin(2*v-u);
    const ix=Math.floor(fx),iy=Math.floor(fy);
    let nearest=Infinity,second=Infinity;
    for(let row=iy-1;row<=iy+1;row++)for(let col=ix-1;col<=ix+1;col++){
      const site=sites[row*side+col],distance=(fx-site[0])**2+(fy-site[1])**2;
      if(distance<nearest){second=nearest;nearest=distance}else if(distance<second)second=distance;
    }
    const edge=Math.sqrt(second)-Math.sqrt(nearest),width=.045+.012*Math.sin(u+2*v);
    const ridge=1/(1+(edge/width)**2),halo=.22/(1+(edge/.19)**2);
    const mix=.5+.5*Math.sin(.8*u+.7*v+phase),offset=(y*sw+x)*4;
    for(let k=0;k<3;k++)image.data[offset+k]=ink[k]+(light[k]-ink[k])*mix;
    image.data[offset+3]=255*intensity*(ridge+halo)*(.78+.22*mix);
  }
  context.putImageData(image,0,0);g.drawImage(field,0,0,w,h);
}
function drawPrintOverlay(kind,g,w,h,{a,b,amount,angle,waterScale},random){
  const intensity=amount/100,short=Math.min(w,h),span=Math.hypot(w,h);
  if(kind==='caustics'){
    drawCaustics(g,w,h,a,b,intensity,angle,random,waterScale);return;
  }
  if(kind==='instant'){
    const edge=short*(.028+.05*intensity),bottom=edge*2.7;
    g.fillStyle=a;g.fillRect(0,0,w,h);g.clearRect(edge,edge,w-2*edge,h-edge-bottom);
    g.strokeStyle=rgba(b,.7);g.lineWidth=Math.max(.6,edge*.045);g.strokeRect(edge,edge,w-2*edge,h-edge-bottom);
    return;
  }
  if(kind==='phosphor'){
    const pitch=Math.max(3,Math.round(Math.max(w,h)/150)),subpixel=pitch/3;
    const tile=bc(pitch,pitch),t=tile.getContext('2d');
    for(const [i,colour] of [a,b,'#b6d7ac'].entries()){
      t.fillStyle=rgba(colour,.95*intensity);t.fillRect(i*subpixel,0,subpixel*.86,pitch*.78);
    }
    t.fillStyle=rgba('#18151c',intensity*.7);t.fillRect(0,pitch*.78,pitch,pitch*.22);
    g.fillStyle=g.createPattern(tile,'repeat');g.fillRect(0,0,w,h);return;
  }
  if(kind==='deckle'){
    const edge=short*(.024+.05*intensity);
    const vertices=[];
    // A closed irregular opening keeps the interior fully transparent.
    function side(x,y,dx,dy,nx,ny,length){
      const count=Math.max(2,Math.ceil(length/Math.max(.75,short*.008)));
      let drift=0;
      for(let i=0;i<count;i++){
        drift=.7*drift+.3*(random()-.5);
        const offset=edge*(drift*.63+(random()-.5)*.22);
        vertices.push([x+dx*i/count+nx*offset,y+dy*i/count+ny*offset]);
      }
    }
    const innerW=w-edge*2,innerH=h-edge*2;
    side(edge,edge,innerW,0,0,1,innerW);side(w-edge,edge,0,innerH,-1,0,innerH);
    side(w-edge,h-edge,-innerW,0,0,-1,innerW);side(edge,h-edge,0,-innerH,1,0,innerH);
    g.beginPath();g.rect(0,0,w,h);g.moveTo(...vertices[0]);
    for(const point of vertices)g.lineTo(...point);
    g.closePath();g.fillStyle=a;g.fill('evenodd');
    g.beginPath();g.moveTo(...vertices[0]);for(const point of vertices)g.lineTo(...point);
    g.closePath();g.lineWidth=short*.003;g.strokeStyle=rgba(b,.8);g.stroke();return;
  }
  if(kind==='corners'){
    const size=short*(.07+.11*intensity);
    for(const [x,y,sx,sy] of [[0,0,1,1],[w,0,-1,1],[w,h,-1,-1],[0,h,1,-1]]){
      g.save();g.translate(x,y);g.scale(sx,sy);
      const shade=g.createLinearGradient(0,0,size*.55,size*.55);
      shade.addColorStop(0,a);shade.addColorStop(.7,b);shade.addColorStop(.78,a);shade.addColorStop(.96,b);shade.addColorStop(1,a);
      g.fillStyle=shade;g.beginPath();g.moveTo(0,0);g.lineTo(size,0);g.lineTo(0,size);g.closePath();g.fill();g.restore();
    }
    return;
  }
  if(kind==='spatter'){
    const clusters=8+Math.round(intensity*12);
    for(let i=0;i<clusters;i++){
      const cx=random()*w,cy=random()*h,spread=short*(.035+.15*random());
      const colour=i%3?a:b;
      for(let j=0;j<50;j++){
        const theta=random()*Math.PI*2,distance=spread*random()**.8;
        const x=cx+Math.cos(theta)*distance,y=cy+Math.sin(theta)*distance*.68;
        const radius=short*(.0005+.011*random()**4)*(1-.65*distance/spread);
        g.fillStyle=rgba(colour,(.4+random()*.6)*intensity);g.beginPath();
        g.ellipse(x,y,radius,radius*(.55+random()*.45),theta,0,Math.PI*2);g.fill();
      }
    }
    return;
  }
  if(kind==='linen'){
    const spacing=Math.max(1.1,short/170),width=spacing*.31;
    g.lineWidth=width;
    for(let y=0;y<h;y+=spacing){
      g.strokeStyle=rgba(a,intensity*(.3+.48*random()));g.beginPath();
      g.moveTo(0,y);g.quadraticCurveTo(w*.55,y+spacing*(random()-.5),w,y);g.stroke();
    }
    g.setLineDash([spacing*1.45,spacing*.55]);
    for(let x=0,col=0;x<w;x+=spacing,col++){
      g.lineDashOffset=(col%2)*spacing;g.strokeStyle=rgba(b,intensity*(.5+.5*random()));
      g.beginPath();g.moveTo(x,0);g.lineTo(x+width*(random()-.5),h);g.stroke();
    }
    return;
  }
  g.translate(w/2,h/2);g.rotate(angle*Math.PI/180);
  if(kind==='window'){
    const paneW=span*.24,paneH=short*.56,gap=short*.035;
    g.transform(1,0,-.16,1,-w*.12,-h*.1);
    g.filter='blur('+Math.max(.5,short*.012)+'px)';
    const light=g.createLinearGradient(-paneW,-paneH*.7,paneW*.7,paneH);
    light.addColorStop(0,rgba(a,.92*intensity));light.addColorStop(.65,rgba(a,.68*intensity));light.addColorStop(1,rgba(b,.08*intensity));
    g.fillStyle=light;g.shadowBlur=short*.012;g.shadowColor=rgba(a,.5*intensity);
    for(let row=-1;row<1;row++)for(let col=-1;col<1;col++)g.fillRect(col*paneW+gap/2,row*paneH+gap/2,paneW-gap,paneH-gap);
  }else if(kind==='prism'){
    const cx=(random()-.5)*short*.4,cy=(random()-.5)*short*.45;
    for(let i=0;i<6;i++){
      const colour=i%2?a:b,offset=(i-2.5)*short*.018;
      g.save();g.translate(cx,cy+offset);g.scale(span*(.3+.18*random()),short*(.012+.028*random()));
      const glint=g.createRadialGradient(0,0,0,0,0,1);
      glint.addColorStop(0,rgba(colour,.93*intensity));glint.addColorStop(.42,rgba(colour,.33*intensity));glint.addColorStop(1,rgba(colour,0));
      g.fillStyle=glint;g.fillRect(-1,-1,2,2);g.restore();
    }
  }else if(kind==='fold'){
    for(let i=0;i<3;i++){
      if(i===2)g.rotate(Math.PI/2);
      const x=short*((i===0?-.22:i===1?.23:0)+(random()-.5)*.15);
      const band=short*(.025+.024*random()),crease=g.createLinearGradient(x-band,0,x+band,0);
      crease.addColorStop(0,rgba(a,0));crease.addColorStop(.47,rgba(a,.64*intensity));
      crease.addColorStop(.5,rgba(a,.92*intensity));crease.addColorStop(.52,rgba(b,.96*intensity));crease.addColorStop(1,rgba(b,0));
      g.fillStyle=crease;g.fillRect(x-band,-span,2*band,2*span);
    }
  }else if(kind==='moire'){
    const pitch=Math.max(1.8,short/74);
    for(const colour of [a,b]){
      g.strokeStyle=rgba(colour,.63*intensity);g.lineWidth=pitch*.29;g.beginPath();
      for(let x=-span;x<=span;x+=pitch){g.moveTo(x,-span);g.lineTo(x,span)}
      g.stroke();g.rotate(.105);
    }
  }else if(kind==='engrave'){
    const spacing=Math.max(2,span/160,short/52),phase=random()*Math.PI*2,extent=span*.55;
    for(let y=-extent,row=0;y<=extent;y+=spacing,row++){
      g.lineWidth=spacing*.22;g.strokeStyle=rgba(row%4===0?b:a,intensity*.75);g.beginPath();
      for(let x=-extent;x<=extent+spacing*.28;x+=spacing*.28){
        const u=x/short,v=y/short,dy=short*(.031*Math.sin(13*u+6*v+phase)+.021*Math.sin(7*u-8*v+phase));
        if(x===-extent)g.moveTo(x,y+dy);else g.lineTo(x,y+dy);
      }
      g.stroke();
    }
  }
}
function drawCustomBorder(g,w,h,settings){
  const unit=Math.min(w,h)/100;
  const inset=settings.inset*unit,available=Math.min(w,h)-2*inset;
  const width=Math.min(settings.width*unit,available*.43),radius=settings.radius*unit;
  g.globalAlpha=settings.amount/100;
  function outline(offset,line,colour){
    const x=inset+offset+line/2,bw=w-2*x,bh=h-2*x;
    if(bw<=0||bh<=0)return;
    g.beginPath();g.roundRect(x,x,bw,bh,Math.min(radius,bw/2,bh/2));
    g.strokeStyle=colour;g.lineWidth=line;g.stroke();
  }
  if(settings.style==='mat'){
    const edge=side=>settings.separate?inset+settings[side]*unit:inset+width+(side==='matBottom'?settings.bottom*unit:0);
    const left=edge('matLeft'),top=edge('matTop'),right=edge('matRight'),bottom=edge('matBottom');
    const innerW=w-left-right,innerH=h-top-bottom;
    const innerRadius=Math.max(0,Math.min(radius-Math.min(left,top,right,bottom)+inset,innerW/2,innerH/2));
    g.fillStyle=settings.a;g.beginPath();
    g.roundRect(inset,inset,w-2*inset,h-2*inset,Math.min(radius,available/2));
    if(innerW>0&&innerH>0)g.roundRect(left,top,innerW,innerH,innerRadius);
    g.fill('evenodd');
    if(innerW>0&&innerH>0){g.beginPath();g.roundRect(left,top,innerW,innerH,innerRadius);g.strokeStyle=settings.b;g.lineWidth=Math.max(.35,(Math.min(left,top,right,bottom)-inset)*.1);g.stroke()}
    return;
  }
  if(settings.style==='airmail'){
    const outer=Math.min(radius,available/2),innerW=w-2*(inset+width),innerH=h-2*(inset+width);
    g.beginPath();g.roundRect(inset,inset,w-2*inset,h-2*inset,outer);
    g.roundRect(inset+width,inset+width,innerW,innerH,Math.max(0,Math.min(outer-width,innerW/2,innerH/2)));
    g.clip('evenodd');g.fillStyle='#fff7df';g.fillRect(0,0,w,h);
    const step=Math.max(2,width*1.9);
    for(let x=-h,i=0;x<w;x+=step,i++){
      g.fillStyle=i%2?settings.b:settings.a;g.beginPath();
      g.moveTo(x,0);g.lineTo(x+step*.59,0);g.lineTo(x+h+step*.59,h);g.lineTo(x+h,h);g.fill();
    }
    return;
  }
  if(settings.style==='brackets'){
    const arm=Math.min(available*.42,Math.max(available*.12,radius*.7+width*2));
    g.beginPath();
    for(const x of [inset,w-inset-arm])for(const y of [inset,h-inset-arm])g.rect(x,y,arm,arm);
    g.clip();
  }
  if(settings.style==='dotted'){g.lineCap='round';g.setLineDash([.001,Math.max(.01,width+settings.gap*unit)])}
  if(settings.style==='dashed')g.setLineDash([width*3,settings.gap*unit]);
  outline(0,width,settings.a);
  if(settings.style==='double')outline(width+settings.gap*unit,width*.45,settings.b);
}
function drawWater(g,w,h,settings,random){
  const kind=OVK[settings.i][1],{a,b}=settings,power=settings.amount/100;
  const scale=settings.waterScale/100,short=Math.min(w,h),size=Math.max(1,short*scale);
  if(kind==='rainRings'||kind==='wetGlass'){
    const rings=kind==='rainRings',count=Math.ceil((rings?15:85)/scale);
    for(let i=0;i<count;i++){
      const x=random()*w,y=random()*h,r=size*(rings?.05+.14*random():.007+.048*random()**2);
      g.save();g.translate(x,y);
      if(rings){
        const tilt=(random()-.5)*.24,aspect=.26+.3*random();
        g.rotate(tilt);g.scale(1,aspect);
        for(let band=1;band<=4;band++){
          const radius=r*band/4,start=random()*.6;
          g.beginPath();g.arc(0,0,radius,start,Math.PI*2-.12);g.lineWidth=Math.max(.8,r*.052);
          g.strokeStyle=rgba(a,power*(1-band*.17));g.stroke();
          g.beginPath();g.arc(0,-r*.03,radius,Math.PI*1.03,Math.PI*1.83);
          g.strokeStyle=rgba(b,power*(1.3-band*.16));g.stroke();
        }
      }else{
        g.rotate((random()-.5)*.6);g.scale(1,.95+.55*random());
        const body=g.createRadialGradient(-r*.21,-r*.31,r*.12,0,0,r);
        body.addColorStop(0,rgba(b,.23*power));body.addColorStop(.52,rgba(a,.045*power));
        body.addColorStop(.84,rgba(a,.43*power));body.addColorStop(1,rgba(b,.69*power));
        g.fillStyle=body;g.beginPath();g.arc(0,0,r,0,Math.PI*2);g.fill();
        g.fillStyle=rgba(b,.93*power);g.beginPath();g.ellipse(-r*.31,-r*.44,r*.22,r*.095,-.55,0,Math.PI*2);g.fill();
      }
      g.restore();
    }
    return;
  }
  const phase=random()*Math.PI*2;
  if(kind==='shoreFoam'||kind==='glints'){
    const wave=(u,v)=>Math.sin(u*10/scale+v+phase)*.043+Math.sin(u*23/scale-v*.6)*.016;
    if(kind==='shoreFoam'){
      const level=.45+random()*.18;
      // The crest is a continuous edge, with a lace of bubbles trailing into the water.
      g.save();g.beginPath();
      const coast=(u,v)=>h*(level+v*.20+wave(u,v*4)+.013*Math.sin(u*35+v*12+phase));
      for(let i=0;i<=180;i++){const u=i/180;g.lineTo(w*u,coast(u,0))}
      for(let i=180;i>=0;i--){const u=i/180;g.lineTo(w*u,coast(u,.8+.22*Math.sin(u*19+phase)))}
      g.closePath();g.clip();g.fillStyle=rgba(a,.11*power);g.fillRect(0,0,w,h);
      drawCaustics(g,w,h,a,b,1.22*power,17,random,scale*45);
      g.restore();
      for(let row=0;row<24;row++){
        const v=row/24;g.beginPath();
        for(let i=0;i<=160;i++){
          const u=i/160,y=coast(u,v*.32)+h*.003*Math.sin(u*74+v*20);
          if(i)g.lineTo(u*w,y);else g.moveTo(0,y);
        }
        g.strokeStyle=rgba(row%3?a:b,power*(.07+.5*(1-v)**4));g.lineWidth=short*(.001+.004*(1-v)**2);g.stroke();
      }
      for(let i=0;i<1300;i++){
        const u=random(),v=random()**2,y=coast(u,v);
        g.fillStyle=rgba(b,power*(.12+.48*random()));g.beginPath();g.arc(u*w,y,size*(.0009+.003*random()),0,Math.PI*2);g.fill();
      }
    }else{
      const focus=.12+.76*random();
      for(let i=0;i<1500/scale;i++){
        const v=random(),u=focus+(random()-.5)*(.14+v*.68)+(random()-.5)*.13;
        const y=h*(v+wave(u,v*10)*.25),length=size*(.002+.038*random()**2)*(.48+v);
        g.fillStyle=rgba(i%4?a:b,power*(.1+.8*random()**3));g.beginPath();
        g.ellipse(u*w,y,length,Math.max(.18,length*.1),.08*Math.sin(v*31),0,Math.PI*2);g.fill();
      }
    }
    return;
  }
  // Render soft, low-frequency light at a bounded resolution and upscale it.
  const factor=Math.min(1,640/Math.max(w,h)),sw=Math.max(1,Math.round(w*factor)),sh=Math.max(1,Math.round(h*factor));
  const field=bc(sw,sh),context=field.getContext('2d'),im=context.createImageData(sw,sh);
  const ca=rgb(a),cb=rgb(b),slope=Math.sin(settings.angle*Math.PI/180)*.8;
  for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){
    const u=x/sw,v=y/sh,offset=(y*sw+x)*4;
    let light;
    if(kind==='sunShafts'){
      const t=(u-.5-v*slope)/(1+v*.65)/scale;
      const rays=.53+.24*Math.sin(t*39+phase)+.14*Math.sin(t*69-phase)+.09*Math.cos(t*107);
      light=rays**3.2*(1-.83*v);
    }else{
      const t=u/scale,z=v/scale;
      const billow=.5+.24*Math.sin(t*11+Math.sin(z*7+phase))+.16*Math.sin(t*23-z*14+phase)+.09*Math.cos(t*38+z*26);
      light=Math.max(0,billow)*v**1.65;
    }
    for(let k=0;k<3;k++)im.data[offset+k]=ca[k]+(cb[k]-ca[k])*light;
    im.data[offset+3]=255*power*Math.min(1,light*(kind==='mist'?1.35:1.7));
  }
  context.putImageData(im,0,0);g.drawImage(field,0,0,w,h);
}
function drawReflection(g,w,h,settings,source,random){
  const line=Math.min(h-1,Math.round(h*settings.waterline/100)),level=(line+.5)/h*source.height;
  const scale=settings.waterScale/100,phase=random()*Math.PI*2,amount=settings.amount/100;
  const stretch=Math.max(2,w*.025*scale);
  for(let y=line;y<h;y++){
    const t=(y-line)/Math.max(1,h-line-1),noise=Math.sin(t*79/scale+phase)+.42*Math.sin(t*171/scale-phase);
    const sy=Math.max(0,Math.min(source.height-1,level*(1-.95*t**.85)+noise*t*source.height*.009));
    const shift=stretch*(.1+.59*t)*noise;
    g.globalAlpha=amount*Math.min(1,(y-line+1)/Math.max(1,h*.008));
    g.drawImage(source,0,sy,source.width,1,-stretch+shift,y,w+2*stretch,1);
    g.fillStyle=rgba(settings.a,.12+.28*t);g.fillRect(0,y,w,1);
    if(noise>1) {g.fillStyle=rgba(settings.b,.14*t);g.fillRect(0,y,w,1)}
  }
}
function drawPhotoOverlay(g,w,h,settings,source,random){
  const kind=OVK[settings.i][1],amount=settings.amount/100;
  if(kind==='photoGlints'){drawGlintField(g,w,h,settings,source);return}
  if(kind==='reflection'){drawReflection(g,w,h,settings,source,random);return}
  const scale=Math.min(1,(kind==='edgeInk'?960:360)/Math.max(w,h));
  const sw=Math.max(1,Math.round(w*scale)),sh=Math.max(1,Math.round(h*scale));
  const field=bc(sw,sh),fg=field.getContext('2d',{willReadFrequently:true});
  fg.drawImage(source,0,0,sw,sh);
  const im=fg.getImageData(0,0,sw,sh),d=im.data,luma=new Float32Array(sw*sh);
  for(let j=0;j<luma.length;j++){
    const i=j*4;luma[j]=(.2126*d[i]+.7152*d[i+1]+.0722*d[i+2])*d[i+3]/65025;
  }
  const a=rgb(settings.a),b=rgb(settings.b);
  for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){
    const j=y*sw+x,i=j*4,v=luma[j];
    let mix,alpha;
    if(kind==='halation'){
      const highlight=Math.max(0,(v-.56)/.44);
      mix=highlight;alpha=highlight**1.5;
    }else{
      const left=Math.max(x-1,0),right=Math.min(x+1,sw-1),top=Math.max(y-1,0)*sw,bottom=Math.min(y+1,sh-1)*sw;
      const gx=luma[top+right]+2*luma[y*sw+right]+luma[bottom+right]-luma[top+left]-2*luma[y*sw+left]-luma[bottom+left];
      const gy=luma[bottom+left]+2*luma[bottom+x]+luma[bottom+right]-luma[top+left]-2*luma[top+x]-luma[top+right];
      mix=.5+.5*gx/(Math.abs(gx)+Math.abs(gy)||1);alpha=Math.min(1,Math.max(0,Math.hypot(gx,gy)-.06)*2);
    }
    for(let k=0;k<3;k++)d[i+k]=a[k]+(b[k]-a[k])*mix;
    d[i+3]=Math.round(255*alpha*amount);
  }
  fg.putImageData(im,0,0);
  if(kind==='halation'){
    const halo=bc(sw,sh),hg=halo.getContext('2d');
    for(const blur of [.035,.009]){
      hg.filter='blur('+Math.max(1,Math.min(sw,sh)*blur)+'px)';hg.drawImage(field,0,0);
    }
    hg.filter='none';hg.globalCompositeOperation='destination-out';hg.globalAlpha=.72;hg.drawImage(field,0,0);
    g.drawImage(halo,0,0,w,h);
  }else g.drawImage(field,0,0,w,h);
}
function ovGen(options,w,h,source=null){
  const {i,a:A,b:B,amount,angle,seed}=options,k=OVK[i][1],n=amount/100;
  const cv=bc(w,h),g=cv.getContext('2d',{willReadFrequently:true}),R=overlayRandom(seed),m=Math.max(w,h);
  const ca=a=>rgba(A,a),cb=a=>rgba(B,a);
  if(usesPhoto(i)){if(source)drawPhotoOverlay(g,w,h,options,source,R)}
  else if(k==='customBorder')drawCustomBorder(g,w,h,options);
  else if(OVK[i][4]==='Water')drawWater(g,w,h,options,R);
  else if(k==='grad'){const t=angle*Math.PI/180,dx=Math.cos(t),dy=Math.sin(t),span=(Math.abs(dx)*w+Math.abs(dy)*h)/2,x=dx*span,y=dy*span,gr=g.createLinearGradient(w/2-x,h/2-y,w/2+x,h/2+y);gr.addColorStop(0,ca(n));gr.addColorStop(1,cb(n));g.fillStyle=gr;g.fillRect(0,0,w,h)}
  else if(k==='rad'){const gr=g.createRadialGradient(w/2,h/2,0,w/2,h/2,m*.7);gr.addColorStop(0,ca(1));gr.addColorStop(.55,cb(.55*n+.2));gr.addColorStop(1,cb(0));g.fillStyle=gr;g.fillRect(0,0,w,h)}
  else if(k==='leak'){const side=R()<.5?0:w;[[side,R()*h,A],[side+(side?-1:1)*w*.15,R()*h,B],[R()*w,R()<.5?0:h,A]].forEach(([x,y,c0])=>{const r=m*(.45+R()*.3),gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,rgba(c0,.95*n+.05));gr.addColorStop(1,rgba(c0,0));g.fillStyle=gr;g.fillRect(0,0,w,h)})}
  else if(k==='rays'){const ox=w*(.2+R()*.6),oy=-h*.05,cnt=14;for(let i=0;i<cnt;i++){const a0=i/cnt*Math.PI*.9+Math.PI*.05,a1=a0+Math.PI*.9/cnt*.45,gr=g.createRadialGradient(ox,oy,0,ox,oy,m*1.2);gr.addColorStop(0,ca(.9*n+.1));gr.addColorStop(1,ca(0));g.fillStyle=gr;g.beginPath();g.moveTo(ox,oy);g.lineTo(ox+Math.cos(a0)*m*2,oy+Math.sin(a0)*m*2);g.lineTo(ox+Math.cos(a1)*m*2,oy+Math.sin(a1)*m*2);g.fill()}}
  else if(k==='bok'){const N=Math.round(14+60*n);for(let i=0;i<N;i++){const x=R()*w,y=R()*h,r=m*(.015+R()*.05),c0=R()<.5?A:B,gr=g.createRadialGradient(x,y,r*.6,x,y,r);gr.addColorStop(0,rgba(c0,.12+R()*.25));gr.addColorStop(.85,rgba(c0,.28+R()*.3));gr.addColorStop(1,rgba(c0,0));g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,7);g.fill()}}
  else if(k==='grain'){const A0=rgb(A),B0=rgb(B),im=g.createImageData(w,h),d=im.data;for(let i=0;i<d.length;i+=4){const t=R(),q=t<.5?A0:B0,a=Math.abs(t-.5)*2;for(let c=0;c<3;c++)d[i+c]=128+(q[c]-128)*a;d[i+3]=Math.round(255*n)}g.putImageData(im,0,0)}
  else if(k==='dust'){const N=Math.round(200+1800*n);g.fillStyle=ca(1);for(let i=0;i<N;i++){g.globalAlpha=.2+R()*.6;g.beginPath();g.arc(R()*w,R()*h,R()**4*m*.004+.6,0,7);g.fill()}g.strokeStyle=cb(1);for(let i=0;i<Math.round(8+40*n);i++){g.globalAlpha=.1+R()*.35;g.lineWidth=.5+R();const x=R()*w,y=R()*h,L=m*(.02+R()*.12),a=R()*Math.PI;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*L*.15,y+Math.sin(a)*L);g.stroke()}g.globalAlpha=1}
  else if(k==='cloud'){const nz=bc(w,h),ng=nz.getContext('2d');ng.imageSmoothingQuality='high';[[5,.5],[11,.3],[26,.2]].forEach(([s0,a])=>{const q=bc(Math.ceil(s0*w/m)+2,Math.ceil(s0*h/m)+2),qg=q.getContext('2d'),im=qg.createImageData(q.width,q.height);for(let i=0;i<im.data.length;i+=4){im.data[i]=im.data[i+1]=im.data[i+2]=255;im.data[i+3]=R()*255}qg.putImageData(im,0,0);ng.globalAlpha=a*(.6+n);ng.drawImage(q,0,0,w,h)});
    const gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,ca(1));gr.addColorStop(1,cb(1));g.fillStyle=gr;g.fillRect(0,0,w,h);g.globalCompositeOperation='destination-in';g.drawImage(nz,0,0)}
  else if(k==='vig'){const gr=g.createRadialGradient(w/2,h/2,m*.15,w/2,h/2,m*.75);gr.addColorStop(0,ca(0));gr.addColorStop(1,ca(.35+.65*n));g.fillStyle=gr;g.fillRect(0,0,w,h)}
  else if(k==='flare'){const fx=w*(.6+R()*.3),fy=h*(.1+R()*.3),gr=g.createRadialGradient(fx,fy,0,fx,fy,m*.35);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.2,ca(.8*n+.1));gr.addColorStop(1,ca(0));g.fillStyle=gr;g.fillRect(0,0,w,h);
    for(let i=1;i<=6;i++){const t=i/7,x=fx+(w/2-fx)*t*2,y=fy+(h/2-fy)*t*2,r=m*(.02+R()*.06),c0=i%2?A:B;g.fillStyle=rgba(c0,.18*n+.05);g.beginPath();g.arc(x,y,r,0,7);g.fill();g.strokeStyle=rgba(c0,.35*n);g.lineWidth=Math.max(1,r*.08);g.stroke()}}
  else if(k==='scan'){g.fillStyle=ca(.15+.5*n);const p=Math.max(2,Math.round(m/360));for(let y=0;y<h;y+=p*2)g.fillRect(0,y,w,p)}
  else if(k==='grid'){const p=Math.max(2,Math.round(m/(14+12*(1-n))));g.strokeStyle=ca(.2+.55*n);g.lineWidth=Math.max(1,m/900);g.beginPath();for(let x=0;x<=w;x+=p){g.moveTo(x,0);g.lineTo(x,h)}for(let y=0;y<=h;y+=p){g.moveTo(0,y);g.lineTo(w,y)}g.stroke()}
  else if(k==='aurora'){
    g.globalCompositeOperation='screen';
    for(let band=0;band<5;band++){
      const y=h*(.18+band*.13+(R()-.5)*.14),height=h*.23;
      const fade=g.createLinearGradient(0,y-height,0,y+height);
      const color=band%2?ca:cb;
      fade.addColorStop(0,color(0));fade.addColorStop(.5,color(.6*n));fade.addColorStop(1,color(0));
      g.strokeStyle=fade;g.lineWidth=height;g.beginPath();g.moveTo(-w*.1,y);
      g.bezierCurveTo(w*.2,y-h*.24,w*.55,y+h*.2,w*1.1,y-h*.12);g.stroke();
    }
  }else if(k==='stars'){
    for(let j=0,count=Math.round(24+165*n);j<count;j++){
      const x=R()*w,y=R()*h,r=Math.max(.6,(R()**4+.12)*m*.007),color=j%2?ca:cb;
      g.fillStyle=color(.28+R()*.72);g.beginPath();
      for(let point=0;point<8;point++){
        const a=point*Math.PI/4,d=point%2?r*.28:r;
        g.lineTo(x+Math.cos(a)*d,y+Math.sin(a)*d);
      }
      g.closePath();g.fill();
    }
  }else if(k==='paper'){
    g.fillStyle=cb(.35*n);g.fillRect(0,0,w,h);
    g.lineWidth=Math.max(.5,m/1600);
    for(let j=0,count=Math.round(1000+5500*n);j<count;j++){
      const x=R()*w,y=R()*h,len=(.001+R()*.012)*m,t=R()*Math.PI;
      g.strokeStyle=j%2?ca(.12+R()*.35):cb(.12+R()*.35);
      g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+len*.4,y-len*.3,x+Math.cos(t)*len,y+Math.sin(t)*len);g.stroke();
    }
  }else if(k==='dots'){
    const step=Math.max(4,m/55),r=step*(.16+.31*n);
    for(let y=0,row=0;y<h+step;y+=step,row++){
      g.fillStyle=row%2?ca(.8):cb(.8);g.beginPath();
      for(let x=(row%2)*step/2;x<w+step;x+=step){g.moveTo(x+r,y);g.arc(x,y,r,0,Math.PI*2)}
      g.fill();
    }
  }else if(k==='stripes'){
    const step=Math.max(4,m/24);
    g.translate(w/2,h/2);g.rotate(-angle*Math.PI/180);
    for(let x=-m*1.5,j=0;x<m*1.5;x+=step,j++){
      g.fillStyle=j%2?ca(.7):cb(.65);g.fillRect(x,-m*1.5,step*(.15+n*.7),m*3);
    }
  }else if(k==='film'||k==='border'){
    const edge=Math.max(1,Math.min(w,h)*(.03+.09*n));
    g.fillStyle=ca(1);g.fillRect(0,0,w,h);
    g.clearRect(edge,k==='film'?edge*.6:edge,Math.max(0,w-2*edge),Math.max(0,h-2*(k==='film'?edge*.6:edge)));
    g.fillStyle=cb(.95);
    if(k==='film'){
      for(let y=edge*.5;y<h-edge*.5;y+=edge*1.2){
        for(const x of [edge*.19,w-edge*.77]){
          g.beginPath();g.roundRect(x,y,edge*.58,edge*.56,edge*.13);g.fill();
        }
      }
    }else{
      g.strokeStyle=cb(.65);g.lineWidth=Math.max(1,edge*.09);
      g.strokeRect(edge*.65,edge*.65,w-edge*1.3,h-edge*1.3);
    }
  }else drawPrintOverlay(k,g,w,h,options,R);
  g.globalCompositeOperation='source-over';
  return cv;
}
function overlayPixels(settings,w,h,source){
  const cv=ovGen(settings,w,h,source);
  return {cv,d:cv.getContext('2d').getImageData(0,0,w,h)};
}
function addOv(i,changes={},record=true){
  if(!base)return;
  const [name,,bm,op]=OVK[i],overlay={...overlayDefaults(i),...changes};
  const overlayPhoto=usesPhoto(i)?overlaySourceCanvas():null;
  const l={...overlayPixels(overlay,W,H,overlayPhoto),overlay,overlayPhoto,o:null,lk:false,sh:null,ol:null,x:W/2,y:H/2,s:1,r:0,op,bm,fl:false,vis:true,cl:0,ct:0,cr:0,cb:0,name};
  if(record)pushU(mkSnap('p'));layers.push(l);active=l;refreshLayers();draw();
}
const overlayControls={ova:'a',ovb:'b',ovn:'amount','ov-angle':'angle'};
const borderControls={'border-style':'style','border-width':'width','border-radius':'radius','border-inset':'inset','border-gap':'gap','border-bottom':'bottom','mat-top':'matTop','mat-right':'matRight','mat-bottom':'matBottom','mat-left':'matLeft'};
const borderRecipes={
  keyline:{style:'double',width:.7,inset:2,radius:0,gap:.7,a:'#fffaf0',b:'#292d33'},
  museum:{style:'mat',separate:true,matTop:5,matLeft:5,matRight:5,matBottom:11,inset:0,a:'#f6efdd',b:'#726859'},
  cinema:{style:'mat',separate:true,matTop:13,matBottom:13,matLeft:0,matRight:0,inset:0,a:'#08090b',b:'#08090b'},
  airmail:{style:'airmail',width:3.5,inset:1.4,radius:.5,a:'#b43a3c',b:'#235080'}
};
$('border-recipe').onchange=e=>{
  const recipe=borderRecipes[e.target.value];
  if(recipe)editOverlay({...borderDefaults,...recipe,amount:100});
};
function openBorder(addAnother=false){
  if(!base){$('border-image').click();return}
  if(tab!=='layers')document.querySelector('.tabs [data-t=layers]').click();
  const index=OVK.findIndex(p=>p[1]==='customBorder');
  const editable=l=>l?.overlay?.i===index&&!l.o;
  const existing=editable(active)?active:layers.findLast(editable);
  if(!addAnother&&existing){active=existing;refreshLayers();draw(true)}
  else addOv(index);
  const heading=$('overlay-settings-heading');
  if(heading.getAttribute('aria-expanded')==='false')heading.click();
  heading.scrollIntoView({block:'start'});heading.focus({preventScroll:true});
}
$('toolbar-border').onclick=()=>openBorder();
$('add-border').onclick=()=>openBorder(true);
$('border-image').onchange=async e=>{
  const file=e.target.files[0];e.target.value='';
  if(file&&await load(file))openBorder();
};
function syncOverlay(l){
  const settings=l?.overlay,editing=!!settings&&!l.o&&OVK[settings.i][1]!=='photoGlints';
  $('ov-edit').hidden=!editing;
  if(!editing)return;
  for(const [id,property] of Object.entries(overlayControls)){
    $(id).value=settings[property];$(id).disabled=l.lk;
  }
  $('ov-intensity').textContent=settings.amount+'%';
  $('ov-angle-value').textContent=settings.angle+'°';
  const kind=OVK[settings.i][1];
  const border=kind==='customBorder',water=waterEffect(settings.i);
  $('overlay-settings-heading').textContent=border?'Border settings':'Overlay settings';
  $('border-recipe').disabled=l.lk;
  $('border-controls').hidden=!border;$('water-size-row').hidden=!water;
  $('overlay-colour-a').textContent=border?'Border colour':'Colour A';
  $('overlay-colour-b').textContent=border?'Accent colour':'Colour B';
  if(water){
    $('water-size').value=settings.waterScale??100;$('water-size').disabled=l.lk;
    $('water-size-value').textContent=$('water-size').value+'%';
  }
  $('reflection-line-row').hidden=kind!=='reflection';
  if(kind==='reflection'){
    $('reflection-line').value=settings.waterline;$('reflection-line').disabled=l.lk;
    $('reflection-line-value').textContent=settings.waterline+'%';
  }
  if(border){
    const currentRecipe=Object.entries(borderRecipes).find(([,recipe])=>
      Object.entries({...borderDefaults,...recipe,amount:100}).every(([key,value])=>settings[key]===value));
    $('border-recipe').value=currentRecipe?.[0]||'';
    for(const [id,property] of Object.entries(borderControls)){
      const value=settings[property]??settings.width;
      $(id).value=value;$(id).disabled=l.lk;
      if(property!=='style')$(id+'-value').textContent=value+'%';
    }
    $('border-gap-row').hidden=!['double','dashed','dotted'].includes(settings.style);
    $('border-gap-label').textContent=settings.style==='dotted'?'Dot spacing':settings.style==='dashed'?'Dash spacing':'Line gap';
    const mat=settings.style==='mat',separate=mat&&settings.separate;
    $('mat-link-row').hidden=!mat;$('mat-sides').hidden=!separate;
    $('mat-separate').checked=!!settings.separate;$('mat-separate').disabled=l.lk;
    $('border-width-row').hidden=separate;$('border-bottom-row').hidden=!mat||separate;
  }
  $('ov-angle-row').hidden=!['photoGlints','sunShafts','grad','stripes','window','prism','fold','caustics','engrave','moire'].includes(kind);
  $('ovb-row').hidden=border?!['double','mat','airmail'].includes(settings.style):['rays','vig','scan','grid'].includes(kind);
  $('ov-shuffle').hidden=!water&&!['photoGlints','leak','rays','bok','grain','dust','cloud','flare','aurora','stars','paper','prism','fold','caustics','engrave','deckle','spatter','linen'].includes(kind);
  $('ov-shuffle').disabled=$('ov-reset').disabled=l.lk;
}
function editOverlay(changes,record=true,replace=false){
  const l=active;
  if(!l?.overlay||l.lk||l.o)return;
  const overlay=replace?{...changes}:{...l.overlay,...changes};
  if(Object.keys(overlay).length===Object.keys(l.overlay).length&&Object.keys(overlay).every(key=>l.overlay[key]===overlay[key]))return;
  const pixels=overlayPixels(overlay,l.cv.width,l.cv.height,l.overlayPhoto);
  if(record)pushU(mkSnap('p'));
  Object.assign(l,pixels,{overlay,sil:null,gc:null,tnc:null});
  refreshLayers();draw();
}
$('mat-separate').onchange=()=>{
  const s=active?.overlay;if(!s||active.lk)return;
  const separate=$('mat-separate').checked;
  const margins=separate&&s.matLeft===undefined?{matLeft:s.width,matRight:s.width,matTop:s.width,matBottom:Math.min(24,s.width+s.bottom)}:{};
  editOverlay({...margins,separate});
};
for(const [id,property] of Object.entries(borderControls)){
  const input=$(id);
  let gestureLayer=null;
  const apply=()=>{
    const value=input.type==='range'?+input.value:input.value;
    if(!active?.overlay||active.lk||active.overlay[property]===value)return;
    editOverlay({[property]:value},gestureLayer!==active);gestureLayer=active;
  };
  input.oninput=apply;input.onchange=()=>{apply();gestureLayer=null};
  input.onblur=input.onpointercancel=()=>{gestureLayer=null};
}
$('reflection-line').oninput=()=>{$('reflection-line-value').textContent=$('reflection-line').value+'%'};
$('reflection-line').onchange=()=>editOverlay({waterline:+$('reflection-line').value});
$('water-size').oninput=()=>{$('water-size-value').textContent=$('water-size').value+'%'};
$('water-size').onchange=()=>editOverlay({waterScale:+$('water-size').value});
for(const [id,property] of Object.entries(overlayControls)){
  const input=$(id);
  input.onchange=()=>editOverlay({[property]:input.type==='range'?+input.value:input.value});
}
$('ovn').oninput=()=>{$('ov-intensity').textContent=$('ovn').value+'%'};
$('ov-angle').oninput=()=>{$('ov-angle-value').textContent=$('ov-angle').value+'°'};
$('ov-shuffle').onclick=()=>editOverlay({seed:newSeed()});
$('ov-reset').onclick=()=>{if(active?.overlay)editOverlay(overlayDefaults(active.overlay.i),true,true)};
const overlayPreviews=new Map(),sourceCanvases=new WeakMap();
let previewDocument,previewScene;
function overlaySourceCanvas(){
  if(!sourceCanvases.has(orig)){
    const cv=bc(orig.width,orig.height);cv.getContext('2d').putImageData(orig,0,0);sourceCanvases.set(orig,cv);
  }
  return sourceCanvases.get(orig);
}
function updateOverlayScene(){
  if(previewDocument===orig&&previewScene)return;
  previewDocument=orig;overlayPreviews.clear();
  if(orig){
    const scale=Math.min(368/W,200/H);
    previewScene=bc(Math.max(1,Math.round(W*scale)),Math.max(1,Math.round(H*scale)));
    previewScene.getContext('2d').drawImage(overlaySourceCanvas(),0,0,previewScene.width,previewScene.height);
  }else{
    previewScene=bc(368,160);const g=previewScene.getContext('2d'),grad=g.createLinearGradient(0,160,368,0);
    grad.addColorStop(0,'#21394f');grad.addColorStop(.66,'#819aad');grad.addColorStop(1,'#f9deac');
    g.fillStyle=grad;g.fillRect(0,0,368,160);g.fillStyle='#fce8c2';g.beginPath();g.arc(250,50,24,0,Math.PI*2);g.fill();
  }
}
function overlayCard(i){
  if(overlayPreviews.has(i))return overlayPreviews.get(i);
  const [name,,blend,opacity]=OVK[i],preview=bc(184,80),g=preview.getContext('2d');
  const w=previewScene.width,h=previewScene.height,scale=Math.min(184/w,80/h),dw=w*scale,dh=h*scale,x=(184-dw)/2,y=(80-dh)/2;
  g.fillStyle='#1d2024';g.fillRect(0,0,184,80);g.drawImage(previewScene,x,y,dw,dh);
  g.globalCompositeOperation=blend;g.globalAlpha=opacity;g.drawImage(ovGen(overlayDefaults(i),w,h,previewScene),x,y,dw,dh);
  const card=`<button data-i="${i}"><img src="${preview.toDataURL()}" alt="" width="92" height="40">${esc(name)}</button>`;
  overlayPreviews.set(i,card);return card;
}
function showOverlays(){
  updateOverlayScene();
  const query=$('ov-search').value.trim().toLowerCase(),type=$('ov-category').value;
  const cards=[];
  OVK.forEach(([name,,,,category],i)=>{
    if(OVK[i][1]==='photoGlints')return;
    const water=waterEffect(i);
    if((!type||type===category||(type==='Water'&&water))&&(name+' '+category+(water?' water':'')).toLowerCase().includes(query))cards.push(overlayCard(i));
  });
  $('ovg').innerHTML=cards.join('');$('ov-empty').hidden=!cards.length;
}
$('ov-search').oninput=showOverlays;$('ov-category').onchange=showOverlays;
$('ovg').onclick=e=>{const b=e.target.closest('button');if(b)addOv(+b.dataset.i)};

const glintFields={
  'glint-width':['width','%'],'glint-fringe':['fringe','%'],'glint-core':['coreSize','%'],
  'glint-mode':['mode'],'glint-glow':['glow'],'glint-colour-mode':['colour'],'glint-placement':['placement'],
  'glint-ink':['a'],'glint-halo':['b'],'glint-temp':['kelvin',' K'],'glint-power':['amount','%'],
  'glint-cut':['cut','%'],'glint-count':['count',''],'glint-length':['length','%'],'glint-angle':['angle','°'],
  'glint-radius':['radius','%'],'glint-gain':['gain','%'],'glint-trail':['trail','%'],'glint-direction':['direction','°']
};
const glintIndex=OVK.findIndex(p=>p[1]==='photoGlints');
function editableGlint(){
  const match=l=>l?.overlay?.i===glintIndex&&!l.o;
  return match(active)?active:layers.findLast(match);
}
function syncGlintTool(){
  const l=editableGlint(),s={...glintBase,...l?.overlay},blocked=!base||!!l&&(l.lk||!l.vis);
  $('glint-toggle').textContent=!base?'Open image':!l?'Add glints':l.vis?'Hide glints':'Show glints';
  $('glint-toggle').disabled=!!l?.lk;
  $('glint-reset').disabled=!l||blocked;
  $('glint-look').disabled=blocked;
  $('glint-look').value=Object.keys(glintLooks).find(key=>
    Object.entries({...glintBase,...glintLooks[key]}).every(([prop,val])=>prop==='placement'||s[prop]===val))||'';
  for(const [id,[key,unit]] of Object.entries(glintFields)){
    const input=$(id);input.value=s[key];input.disabled=blocked;
    if(unit!==undefined)input.nextElementSibling.textContent=s[key]+unit;
  }
  const opacity=$('glint-opacity');opacity.disabled=!l||blocked;opacity.value=Math.round(100*(l?.op??OVK[glintIndex][3]));
  opacity.nextElementSibling.value=opacity.value+'%';$('glint-fringe').disabled=blocked||s.colour!=='prism';
  $('glint-detect').hidden=s.placement==='manual';
  $('glint-clear-row').hidden=s.placement==='auto';$('glint-clear').disabled=blocked||!s.points?.length;
  $('glint-rays').hidden=s.mode==='soft';
  $('glint-custom').hidden=s.colour!=='custom';
  $('glint-glow-controls').hidden=s.glow==='none';$('glint-motion').hidden=s.glow!=='motion';
  let msg;
  if(!base)msg='Open a photo to find its reflections.';
  else if(!l)msg='Choose a look or add glints to detect bright reflections.';
  else if(l.lk)msg='Unlock the glints layer in Layers to edit it.';
  else if(!l.vis)msg='Glints are hidden.';
  else{
    const spots=findGlints(analyseGlints(l.overlayPhoto),s,l.cv.width,l.cv.height);
    msg=spots.length?spots.length+' glint'+(spots.length===1?'':'s')+'.':'No glints. ';
    if(s.placement!=='auto')msg+=' Click the image to place a glint.';
    else if(!spots.length)msg+='Lower the cutoff or choose Place on canvas.';
  }
  $('glint-status').textContent=msg;
}
function changeGlints(changes,record=true){
  if(!base)return;
  const l=editableGlint();
  if(!l){addOv(glintIndex,changes);return}
  if(l.lk||!l.vis)return;
  active=l;editOverlay(changes,record);
}
function placeGlint(p){
  let l=editableGlint();
  if(!l||l.lk||!l.vis||l.overlay.placement==='auto')return;
  const iw=l.cv.width,ih=l.cv.height,[u,v]=LOC(l,p);
  const x=(l.fl?-u:u)/(l.s*iw)+(1+l.cl-l.cr)/2,y=v/(l.s*ih)+(1+l.ct-l.cb)/2;
  if(x<l.cl||x>=1-l.cr||y<l.ct||y>=1-l.cb)return;
  changeGlints({points:[...(l.overlay.points||[]),{x,y}]});
}
$('glint-toggle').onclick=()=>{
  if(!base){$('glint-image').click();return}
  const l=editableGlint();
  if(!l){addOv(glintIndex);return}
  if(!l.lk){pushU(mkSnap('p'));active=l;l.vis=!l.vis;refreshLayers();draw()}
};
$('glint-image').onchange=async event=>{
  const file=event.target.files[0];event.target.value='';
  if(file&&await load(file))addOv(glintIndex);
};
$('glint-look').onchange=e=>{
  const look=glintLooks[e.target.value];if(!look)return;
  const l=editableGlint();changeGlints({...glintBase,...look,placement:l?.overlay.placement||'auto'});
};
$('glint-clear').onclick=()=>changeGlints({points:[]});
const glintOpacity=$('glint-opacity');let opacityGesture=null;
glintOpacity.oninput=()=>{
 const l=editableGlint();if(!l||l.lk||!l.vis||l.op===+glintOpacity.value/100)return;
 if(opacityGesture!==l)pushU(mkSnap('p'));opacityGesture=l;l.op=+glintOpacity.value/100;refreshLayers();draw();
};
glintOpacity.onchange=()=>{glintOpacity.oninput();opacityGesture=null};
glintOpacity.onblur=glintOpacity.onpointercancel=()=>{opacityGesture=null};
$('glint-reset').onclick=()=>changeGlints({...glintBase,points:[]});
$('edit-glints').onclick=()=>document.querySelector('.tabs [data-t=glints]').click();
for(const [id,[key]] of Object.entries(glintFields)){
  const input=$(id);
  let gesture=null;
  const apply=()=>{
    const l=editableGlint(),value=input.type==='range'?Number(input.value):input.value;
    if(l?.overlay[key]===value)return;
    changeGlints({[key]:value},!gesture||gesture!==l);gesture=editableGlint();
  };
  input.oninput=apply;input.onchange=()=>{apply();gesture=null};
  input.onblur=input.onpointercancel=()=>{gesture=null};
}


/* ---------- Crop ---------- */
let CR=null,cd=null,cAsp='free';
const ASP={'1:1':1,'4:5':4/5,'5:4':5/4,'3:2':3/2,'2:3':2/3,'4:3':4/3,'3:4':3/4,'16:9':16/9,'9:16':9/16,'21:9':21/9,'1.85:1':1.85,'2.39:1':2.39};
const CURS={tl:'nwse-resize',br:'nwse-resize',tr:'nesw-resize',bl:'nesw-resize',t:'ns-resize',b:'ns-resize',l:'ew-resize',r:'ew-resize',move:'move'};
const cropInit=()=>({x:0,y:0,w:W,h:H});
const aspR=()=>{if(cAsp==='free')return 0;if(cAsp==='orig')return W/H;if(cAsp==='custom'){const a=+$('crw').value,b=+$('crh').value;return a>0&&b>0?a/b:0}return ASP[cAsp]||0};
const clampR=r=>{r.w=Math.min(r.w,W);r.h=Math.min(r.h,H);r.x=Math.min(Math.max(0,r.x),W-r.w);r.y=Math.min(Math.max(0,r.y),H-r.h);return r};
function fitAsp(r){const R=aspR();if(!R)return r;const cx=r.x+r.w/2,cy=r.y+r.h/2;let w=r.w,h=w/R;if(h>r.h){h=r.h;w=h*R}return clampR({x:cx-w/2,y:cy-h/2,w,h})}
function rectFromAnchor(ax,ay,px,py,R){let w=Math.abs(px-ax),h=Math.abs(py-ay);const sx=px<ax?-1:1,sy=py<ay?-1:1;if(R){if(w/R>h)h=w/R;else w=h*R}
  const rx=sx>0?W-ax:ax,ry=sy>0?H-ay:ay;let f=1;if(w>rx)f=Math.min(f,rx/w);if(h>ry)f=Math.min(f,ry/h);if(f<1&&R){w*=f;h*=f}else{w=Math.min(w,rx);h=Math.min(h,ry)}
  return{x:sx>0?ax:ax-w,y:sy>0?ay:ay-h,w,h}}
function cropHit(p){const k=KK(),t=14*k,{x,y,w,h}=CR,px=p[0],py=p[1],nl=Math.abs(px-x)<t,nr=Math.abs(px-x-w)<t,nt=Math.abs(py-y)<t,nb=Math.abs(py-y-h)<t,inx=px>x-t&&px<x+w+t,iny=py>y-t&&py<y+h+t;
  if(nl&&nt)return'tl';if(nr&&nt)return'tr';if(nl&&nb)return'bl';if(nr&&nb)return'br';if(nt&&inx)return't';if(nb&&inx)return'b';if(nl&&iny)return'l';if(nr&&iny)return'r';
  if(w>=W-2&&h>=H-2)return null;
  return px>x&&px<x+w&&py>y&&py<y+h?'move':null}
function cropDrag(p){const{h,p:p0,r}=cd,R=aspR(),dx=p[0]-p0[0],dy=p[1]-p0[1];
  if(h==='move'){CR=clampR({x:r.x+dx,y:r.y+dy,w:r.w,h:r.h});return}
  if(h==='new'){CR=rectFromAnchor(p0[0],p0[1],p[0],p[1],R);return}
  if(h.length===2){CR=rectFromAnchor(h[1]==='l'?r.x+r.w:r.x,h[0]==='t'?r.y+r.h:r.y,r.x+(h[1]==='l'?0:r.w)+dx,r.y+(h[0]==='t'?0:r.h)+dy,R);return}
  let L=r.x,T=r.y,Rt=r.x+r.w,B=r.y+r.h;const px=Math.min(W,Math.max(0,r.x+(h==='l'?0:r.w)+dx)),py=Math.min(H,Math.max(0,r.y+(h==='t'?0:r.h)+dy));
  if(h==='t')T=Math.min(B-10,py);else if(h==='b')B=Math.max(T+10,py);else if(h==='l')L=Math.min(Rt-10,px);else Rt=Math.max(L+10,px);
  const o={x:L,y:T,w:Rt-L,h:B-T};
  if(R){if(h==='t'||h==='b'){o.w=o.h*R;o.x=r.x+r.w/2-o.w/2}else{o.h=o.w/R;o.y=r.y+r.h/2-o.h/2}const s=Math.min(1,W/o.w,H/o.h);if(s<1){const cx=o.x+o.w/2,cy=o.y+o.h/2;o.w*=s;o.h*=s;o.x=cx-o.w/2;o.y=cy-o.h/2}clampR(o)}
  CR=o}
function cropInfo(){if(!CR)return;const w=Math.round(CR.w),h=Math.round(CR.h);$('cinfo').textContent=`${w} \u00d7 ${h} px`+(w&&h?` \u00b7 ratio ${(w/h).toFixed(2)}`:'')}
function drawCrop(){if(CR.x+CR.w>W+.5||CR.y+CR.h>H+.5)CR=cropInit();const{x,y,w,h}=CR,k=KK();ctx.save();ctx.fillStyle='rgba(5,12,31,.62)';ctx.beginPath();ctx.rect(0,0,W,H);ctx.rect(x,y,w,h);ctx.fill('evenodd');
  ctx.lineWidth=1.5*k;ctx.strokeStyle='#fff';ctx.strokeRect(x,y,w,h);
  if($('cgrid').checked){ctx.lineWidth=k;ctx.strokeStyle='rgba(255,255,255,.55)';ctx.beginPath();for(let i=1;i<3;i++){ctx.moveTo(x+w*i/3,y);ctx.lineTo(x+w*i/3,y+h);ctx.moveTo(x,y+h*i/3);ctx.lineTo(x+w,y+h*i/3)}ctx.stroke()}
  const hs=6*k;ctx.fillStyle='#fff';ctx.strokeStyle='#050c1f';ctx.lineWidth=1.5*k;for(const[px,py]of[[x,y],[x+w/2,y],[x+w,y],[x,y+h/2],[x+w,y+h/2],[x,y+h],[x+w/2,y+h],[x+w,y+h]]){ctx.fillRect(px-hs,py-hs,hs*2,hs*2);ctx.strokeRect(px-hs,py-hs,hs*2,hs*2)}ctx.restore()}
let cropSrc=null;
function updCropRestoreUI(){const a=$('c-reedit'),b=$('c-restore');if(a)a.disabled=!cropSrc;if(b)b.disabled=!cropSrc}
function cropSnap(){const s={W,H,b:base,o:orig,sel,cropSrc:cropSrc?{...cropSrc}:null,spatial:film?.space(),pos:layers.map(l=>[l,l.x,l.y])};return()=>{const cur=cropSnap();W=s.W;H=s.H;base=s.b;orig=s.o;sel=s.sel;cropSrc=s.cropSrc?{...s.cropSrc}:null;updCropRestoreUI();film?.restoreSpace(s.spatial);s.pos.forEach(([l,x,y])=>{l.x=x;l.y=y});c.width=W;c.height=H;outIm=null;fcache=null;cdirty=true;SCR.clear();jit=null;if(CR)CR=cropInit();return cur}}
function reopenCropCanvas(){if(!base||!cropSrc)return;const s=cropSrc;
  W=s.W;H=s.H;base=new ImageData(new Uint8ClampedArray(s.base.data),W,H);orig=new ImageData(new Uint8ClampedArray(s.orig.data),W,H);
  sel=null;layers.forEach(l=>{l.x+=s.x;l.y+=s.y});c.width=W;c.height=H;outIm=null;fcache=null;cdirty=true;SCR.clear();jit=null;
  if(zoomV&&$('zoom').value!=='0')c.style.width=W*zoomV+'px';
  film?.rememberPixels();
  cropSrc=null;updCropRestoreUI();
  CR={x:s.x,y:s.y,w:s.w,h:s.h};
  extract();updInfo();refreshLayers();cropInfo()}
function applyCrop(silent=false){if(!base||!CR)return;const x=Math.round(CR.x),y=Math.round(CR.y),w=Math.max(1,Math.min(W-x,Math.round(CR.w))),h=Math.max(1,Math.min(H-y,Math.round(CR.h)));if(w===W&&h===H)return;pushU(cropSnap());
  if(!cropSrc){cropSrc={W,H,base:new ImageData(new Uint8ClampedArray(base.data),W,H),orig:new ImageData(new Uint8ClampedArray(orig.data),W,H),x,y,w,h}}else{cropSrc={...cropSrc,x:cropSrc.x+x,y:cropSrc.y+y,w,h}}
  film?.transformSpace(new DOMMatrix().translate(-x,-y),w,h,null,{kind:'crop',x:x/W,y:y/H,w:w/W,h:h/H});
  const cut=im=>{const o=new ImageData(w,h);for(let j=0;j<h;j++)o.data.set(im.data.subarray(((y+j)*W+x)*4,((y+j)*W+x+w)*4),j*w*4);return o};
  base=cut(base);orig=cut(orig);if(sel){const s2=new Uint8Array(w*h);for(let j=0;j<h;j++)s2.set(sel.subarray((y+j)*W+x,(y+j)*W+x+w),j*w);sel=s2}
  layers.forEach(l=>{l.x-=x;l.y-=y});W=w;H=h;c.width=W;c.height=H;outIm=null;fcache=null;cdirty=true;SCR.clear();jit=null;
  if(zoomV&&$('zoom').value!=='0')c.style.width=W*zoomV+'px';
  film?.rememberPixels();CR=cropInit();updCropRestoreUI();extract();updInfo();refreshLayers();cropInfo();if(!silent)draw()}
function restoreOriginalCrop(reedit){if(!base||!cropSrc)return;pushU(cropSnap());const s=cropSrc;
  W=s.W;H=s.H;base=new ImageData(new Uint8ClampedArray(s.base.data),W,H);orig=new ImageData(new Uint8ClampedArray(s.orig.data),W,H);
  sel=null;layers.forEach(l=>{l.x+=s.x;l.y+=s.y});c.width=W;c.height=H;outIm=null;fcache=null;cdirty=true;SCR.clear();jit=null;
  if(zoomV&&$('zoom').value!=='0')c.style.width=W*zoomV+'px';
  film?.rememberPixels();
  cropSrc=null;updCropRestoreUI();
  if(reedit&&tab!=='crop')document.querySelector('.tabs [data-t="crop"]')?.click();
  CR=reedit?{x:s.x,y:s.y,w:s.w,h:s.h}:cropInit();
  extract();updInfo();refreshLayers();cropInfo();draw();
  if(typeof showToast==='function')showToast(reedit?'Full photo restored with your previous crop box':'Restored original uncropped image',1800)}
c.addEventListener('pointerdown',e=>{if(tab!=='crop'||!CR||!base||spaceDown||e.button===1)return;e.stopImmediatePropagation();e.preventDefault();c.setPointerCapture(e.pointerId);const p=pos(e),h=e.shiftKey?null:cropHit(p);cd=h?{h,p,r:{...CR}}:{h:'new',p,r:null};if(!h)CR={x:p[0],y:p[1],w:0,h:0}},true);
c.addEventListener('pointermove',e=>{if(tab!=='crop'||!CR)return;const p=pos(e);if(!cd){const h=cropHit(p);c.style.cursor=h?CURS[h]:'crosshair';return}e.stopImmediatePropagation();cropDrag(p);cropInfo();draw(true)},true);
const cropUp=()=>{if(!cd)return;const tiny=cd.h==='new'&&(CR.w<8||CR.h<8);cd=null;if(tiny)CR=cropInit();cropInfo();draw(true)};
c.addEventListener('pointerup',cropUp,true);c.addEventListener('pointercancel',cropUp,true);
const setAspUI=()=>document.querySelectorAll('#crat button').forEach(b=>b.classList.toggle('on',b.dataset.r===cAsp));
$('crat').onclick=e=>{const b=e.target.closest('button');if(!b)return;cAsp=b.dataset.r;setAspUI();if(CR){CR=fitAsp(CR);cropInfo();draw(true)}};
['crw','crh'].forEach(i=>$(i).oninput=()=>{cAsp='custom';setAspUI();if(CR){CR=fitAsp(CR);cropInfo();draw(true)}});
$('cswapr').onclick=()=>{if(!CR)return;let a,b;if(cAsp==='orig'){a=W;b=H}else if(cAsp==='custom'){a=+$('crw').value;b=+$('crh').value}else if(ASP[cAsp])[a,b]=cAsp.split(':').map(Number);
  if(a&&b){cAsp='custom';$('crw').value=Math.min(99,Math.round(b));$('crh').value=Math.min(99,Math.round(a));if(cAsp==='custom'&&(a>99||b>99)){$('crw').value=Math.round(b/Math.max(a,b)*99);$('crh').value=Math.round(a/Math.max(a,b)*99)}setAspUI();CR=fitAsp({...CR,w:CR.h,h:CR.w,x:CR.x+(CR.w-CR.h)/2,y:CR.y+(CR.h-CR.w)/2})}
  else CR=clampR({x:CR.x+(CR.w-CR.h)/2,y:CR.y+(CR.h-CR.w)/2,w:CR.h,h:CR.w});cropInfo();draw(true)};
$('cfull').onclick=()=>{if(CR){CR=fitAsp(cropInit());cropInfo();draw(true)}};
$('creset').onclick=()=>{cAsp='free';setAspUI();if(base){CR=cropInit();cropInfo();draw(true)}};
$('cgrid').oninput=()=>draw(true);$('capply').onclick=applyCrop;
$('c-reedit')?.addEventListener('click',()=>restoreOriginalCrop(true));
$('c-restore')?.addEventListener('click',()=>restoreOriginalCrop(false));
document.addEventListener('keydown',e=>{if(tab!=='crop'||!base||isField(e.target))return;if(e.key==='Enter'){e.preventDefault();applyCrop()}else if(e.key==='Escape'){CR=cropInit();cropInfo();draw(true)}});
// Film Lab shares Totone's working image, selection, layer grading and export pass.
film=(()=>{
const ADJ=[['exp','Exposure',-2,2,.05],['bri','Brightness'],['con','Contrast'],['hi','Highlights'],['sh','Shadows'],['sat','Saturation'],['vib','Vibrance'],['tmp','Temperature'],['tint','Tint'],['fade','Fade',0],['vig','Vignette']].map(x=>[x[0],x[1],x[2]??-100,x[3]??100,x[4]??1]);
/* name, saturation, contrast, fade, mono, shadow tone, highlight tone (colours stay in sRGB) */
const FL=[['None',1,1,0,0,[0,0,0],[0,0,0]],['Teal and orange',1.15,1.1,.02,0,[-.04,0,.07],[.07,.02,-.06]],['Warm film',.95,1.05,.04,0,[.02,0,-.02],[.06,.03,-.05]],['Faded',.8,.95,.1,0,[.02,.02,.03],[0,0,0]],['Vivid',1.45,1.12,0,0,[0,0,0],[0,0,0]],['Cool',.95,1.05,.01,0,[0,.01,.06],[-.03,0,.05]],['Moody',.8,1.2,.03,0,[0,.02,.05],[.04,0,0]],['Golden',1.1,1.05,0,0,[.03,.01,0],[.09,.04,-.07]],['Silver',0,1.15,.02,1,[0,0,0],[0,0,0]],['Mono contrast',0,1.35,0,1,[0,0,0],[0,0,0]],['Mono soft',0,.9,.06,1,[0,0,0],[0,0,0]],['Sepia',0,1,.05,1,[.1,.05,0],[.14,.09,0]],['Duotone blue',0,1.05,.02,1,[-.05,0,.14],[.14,.1,-.06]]];

/* ===== Presets data (version 1): name, category, filter index, adjustments, grain, glow, double exposure look ===== */
const BLN=['Screen','Multiply','Overlay','Soft light','Hard light','Add','Lighten','Darken','Difference','Exclusion'],PR=[
['Soft Skin','Portrait',2,{con:-8,sh:20,tmp:6,sat:-5},0,25],['Warm Glow Portrait','Portrait',7,{tmp:10,sh:10,vib:8},0,40],['Studio Clean','Portrait',0,{exp:.15,con:8,vib:5},0,0],['Window Light','Portrait',3,{tmp:-4,sat:-15,fade:12,hi:10},0,0],
['Alpine Clear','Landscape',5,{con:10,vib:25,tmp:-6},0,0],['Deep Forest','Landscape',6,{sh:15,sat:8,tint:-10,vig:15},0,0],['Desert Dust','Landscape',7,{sat:-5,tmp:18,fade:10},0,0],['Coastal Haze','Landscape',3,{tmp:-6,fade:14,hi:-10,exp:.1},0,0],
['Concrete Pop','Street',6,{con:25,sat:-25,vib:15},45,0],['Rain Neon','Street',1,{con:15,sat:20,tmp:-8,tint:12},0,55],['Corner Shop','Street',2,{tmp:20,con:15,sh:-10},25,0],['Late Bus','Street',1,{tint:-15,tmp:8,vig:35,con:10},0,0],
['City Lights','Night',5,{con:20,hi:15,sh:-15,vib:10},0,60],['Sodium Orange','Night',7,{tmp:35,con:20,sh:-20,sat:10},0,40],['Blue Hour','Night',5,{tmp:-18,sat:10,tint:10,fade:6},0,45],['Moon Wash','Night',5,{sat:-45,tmp:-15,exp:-.1},25,35],
['Faded Roll','Film',3,{con:-10,fade:20,tint:-6},30,0],['Warm Negative','Film',2,{tmp:12,fade:14,vig:25},25,0],['Cool Slide','Film',5,{sat:20,con:15,tint:-5},0,0],['Expired Box','Film',3,{tmp:15,tint:12,fade:30,sat:15},60,0],
['Teal and Amber','Cinematic',1,{con:15},0,0],['Desaturated Thriller','Cinematic',6,{sat:-35,tmp:-10,vig:40,con:10},0,0],['Golden Epic','Cinematic',7,{sh:10,tmp:12,con:10},0,40],['Noir Blue','Cinematic',6,{con:25,sat:-30,tmp:-18},0,0],
['Sepia Letter','Vintage',11,{fade:15},20,0],['Seventies Wall','Vintage',2,{tmp:20,fade:22,sat:5},25,0],['Faded Instant','Vintage',3,{tint:-8,fade:20,vib:5},0,0],['Sun Bleached','Vintage',7,{exp:.4,sat:-15,fade:20},0,0],
['Silver Soft','Black and white',10,{},20,0],['Deep Contrast Mono','Black and white',9,{con:20,exp:-.05},0,0],['Newsprint','Black and white',10,{con:-10,tmp:6},55,0],['Low Key Mono','Black and white',9,{exp:-.4,sh:-10},0,30],
['Bright Feed','Social',0,{exp:.2,con:10,vib:20},0,0],['Pastel Pop','Social',3,{sat:10,fade:12,exp:.15},0,30],['Clean Matte','Social',3,{sat:-15,fade:14},0,0],['Sunset Story','Social',7,{tmp:15,tint:8,vib:15},0,35],
['Silhouette Fill','Double exposure',0,{},0,0,{mode:0,bl:0,op:100,thr:50,soft:30,light:0}],['Dream Overlay','Double exposure',0,{fade:8},0,30,{mode:1,bl:0,op:70}],['Ghost Portrait','Double exposure',5,{},0,0,{mode:0,bl:0,op:55,light:1,thr:50,soft:40}],['Soft Screen','Double exposure',0,{vig:15},0,0,{mode:1,bl:0,op:50}]];

const extraFilters=[
 ['Silver retention',.42,1.23,.014,0,[-.018,.003,.022],[.025,.019,.003]],
 ['Tungsten reversal',1.06,1.08,.024,0,[-.045,.012,.082],[.084,.021,-.043]],
 ['Rose print',.88,.98,.043,0,[.012,-.022,.037],[.052,.007,-.023]],
 ['Coastal print',.84,1.04,.042,0,[-.031,.028,.038],[.039,.024,-.008]],
 ['Olive negative',.81,1.1,.027,0,[-.003,.032,-.022],[.049,.028,-.025]],
 ['Midnight cyan',.92,1.15,.018,0,[-.052,.02,.064],[.006,.028,.037]]
];
const extra=[
 ['Silver Retention',13,{sat:-20,con:9,hi:-22,sh:4},32,0],
 ['Tungsten After Dark',14,{exp:-.1,tmp:-8,vib:19,hi:-16},22,30],
 ['Rose Hour',15,{sh:12,hi:-22,tmp:9,vib:8},14,18],
 ['Pacific Overcast',16,{con:-6,sh:16,hi:-18,tmp:-5},18,8],
 ['Olive Western',17,{con:10,tmp:12,sat:-10,vig:18},28,0],
 ['Midnight Platform',18,{exp:-.25,hi:8,sh:-8,tint:7},26,34],
 ['Candlelight Interior',2,{exp:.1,tmp:24,hi:-32,sh:7,tint:6},17,24],
 ['Summer Reversal',4,{con:8,hi:-14,vib:10,tmp:6},20,0],
 ['Day for Night',18,{exp:-.8,tmp:-28,sat:-16,hi:-18,vig:30},12,10],
 ['Desert Road',17,{sh:12,hi:-34,fade:12,tmp:20},35,12],
 ['16 mm Flashback',15,{con:-8,fade:18,hi:-14,sat:-12},63,18],
 ['Hard Light Noir',9,{exp:-.15,con:22,hi:-10,sh:-15,vig:25},38,0]
];
FL.push(...extraFilters);
PR.push(...extra.map(([name,filter,adj,grain,glow])=>[name,'Cinematic',filter,adj,grain,glow]));
// The master curve is sampled at black, quarter tone, middle grey, three-quarter tone and white.
const cinemaPrints=[
 {name:'Rain on Asphalt',filter:18,a:{exp:-.18,sat:-18,hi:-20},grain:18,glow:12,curve:[3,47,122,204,251],shadows:[204,22],highlights:[38,12]},
 {name:'Porcelain Morning',filter:0,a:{exp:.18,con:-6,sh:12,hi:-26},grain:8,glow:11,curve:[12,71,139,203,246],shadows:[221,8],highlights:[40,13]},
 {name:'Copper Canyon',filter:17,a:{tmp:8,vib:12,hi:-18},grain:24,glow:4,curve:[4,55,139,207,249],shadows:[184,12],highlights:[26,27]},
 {name:'Fluorescent Corridor',filter:6,a:{sat:-24,tint:-7,exp:-.12},grain:14,glow:6,curve:[5,50,121,191,238],shadows:[154,18],highlights:[77,12]},
 {name:'Blue Velvet Dusk',filter:5,a:{tmp:-13,hi:-24,vib:12},grain:16,glow:19,curve:[9,52,120,189,245],shadows:[248,24],highlights:[320,14]},
 {name:'Archive Silver',filter:10,a:{con:4,sh:9,hi:-14},grain:39,glow:5,curve:[12,65,133,203,241],shadows:[218,5],highlights:[41,6]},
 {name:'Late Summer Drive',filter:3,a:{tmp:9,sat:-7,hi:-18},grain:23,glow:8,curve:[14,72,139,204,246],shadows:[169,9],highlights:[49,20]},
 {name:'Arctic Searchlight',filter:16,a:{con:7,tmp:-16,hi:-29,sh:-5},grain:11,glow:16,curve:[2,48,128,205,248],shadows:[218,23],highlights:[183,12]},
 {name:'Backstage Tungsten',filter:14,a:{hi:-28,tmp:12,sat:-7,vig:14},grain:28,glow:24,curve:[6,46,125,199,244],shadows:[280,11],highlights:[31,25]},
 {name:'Silent Matinee',filter:9,a:{sh:14,hi:-23},grain:30,glow:9,curve:[2,49,134,217,250],shadows:[0,0],highlights:[0,0]},
 {name:'Dusty Projector',filter:11,a:{sat:-22,fade:7,con:-6},grain:46,glow:17,curve:[20,72,136,198,235],shadows:[22,9],highlights:[48,17]},
 {name:'Magenta Motel',filter:15,a:{tmp:-6,vib:16,con:6,hi:-19},grain:20,glow:22,curve:[7,54,124,202,250],shadows:[191,19],highlights:[329,23]}
];
for(const print of cinemaPrints)PR.push([print.name,'Cinematic',print.filter,print.a,print.grain,print.glow,null,print]);

const blendModes=['screen','multiply','overlay','soft-light','hard-light','lighter','lighten','darken','difference','exclusion'];
// Creative interpretations of still and motion-picture emulsions. Each curve maps five evenly spaced input tones.
const stockPrints=[
 {name:'Kodak Portra 160',filter:0,a:{sat:-7,hi:-11,tmp:3},curve:[3,66,133,197,250],shadows:[205,3],highlights:[35,5],grain:8,size:12,col:4,glow:0},
 {name:'Kodak Portra 400',filter:0,a:{sh:6,hi:-16,vib:6,tmp:5},curve:[5,67,138,202,248],shadows:[178,5],highlights:[32,8],grain:16,size:23,col:7,glow:2},
 {name:'Kodak Portra 800',filter:2,a:{sh:9,hi:-20,tint:3,vib:9},curve:[8,65,135,201,244],shadows:[229,7],highlights:[29,10],grain:26,size:39,col:12,glow:4},
 {name:'Kodak Ektar 100',filter:0,a:{con:8,sat:15,vib:12},curve:[1,52,130,209,253],shadows:[202,5],highlights:[23,7],grain:6,size:9,col:4,glow:0},
 {name:'Kodak Ektachrome E100',filter:0,a:{con:7,sh:-4,hi:2,vib:7,tmp:-3},curve:[1,51,126,207,251],shadows:[226,6],highlights:[48,3],grain:9,size:13,col:5,glow:0},
 {name:'Kodak VISION3 50D',filter:0,a:{con:4,hi:-12,vib:8},curve:[2,61,131,200,249],shadows:[203,5],highlights:[43,6],grain:5,size:8,col:3,glow:1},
 {name:'Kodak VISION3 250D',filter:0,a:{sh:7,hi:-19,sat:2},curve:[5,65,132,198,246],shadows:[185,9],highlights:[40,9],grain:14,size:21,col:7,glow:3},
 {name:'Kodak VISION3 200T',filter:0,a:{tmp:-5,tint:3,hi:-16,con:3},curve:[4,58,129,199,247],shadows:[221,10],highlights:[32,8],grain:13,size:18,col:6,glow:4},
 {name:'Kodak VISION3 500T',filter:14,a:{tmp:-5,sh:11,hi:-24,sat:-4},curve:[6,58,125,190,240],shadows:[209,12],highlights:[30,10],grain:23,size:32,col:9,glow:8},
 {name:'Kodak Tri-X 400',filter:8,a:{con:6,hi:-6},curve:[2,51,127,207,250],shadows:[0,0],highlights:[0,0],grain:33,size:44,col:0,glow:0},
 {name:'Kodak T-Max 100',filter:8,a:{con:2},curve:[0,58,131,201,254],shadows:[0,0],highlights:[0,0],grain:5,size:8,col:0,glow:0},
 {name:'Kodak T-Max 400',filter:8,a:{sh:4,hi:-8},curve:[2,57,128,201,251],shadows:[0,0],highlights:[0,0],grain:13,size:18,col:0,glow:0},
 {name:'Ilford Pan F Plus 50',filter:8,a:{con:9},curve:[0,48,128,213,254],shadows:[0,0],highlights:[0,0],grain:6,size:10,col:0,glow:0},
 {name:'Ilford FP4 Plus 125',filter:8,a:{hi:-5,sh:3},curve:[3,62,132,202,251],shadows:[0,0],highlights:[0,0],grain:12,size:20,col:0,glow:0},
 {name:'Ilford HP5 Plus 400',filter:8,a:{con:-3,sh:8,hi:-11},curve:[5,64,130,199,247],shadows:[0,0],highlights:[0,0],grain:27,size:36,col:0,glow:0},
 {name:'Ilford Delta 3200',filter:8,a:{con:-8,sh:14,hi:-14},curve:[9,66,129,192,240],shadows:[0,0],highlights:[0,0],grain:49,size:58,col:0,glow:2}
];
for(const stock of stockPrints)PR.push([stock.name,'Film stocks',stock.filter,stock.a,stock.grain,stock.glow,null,stock]);
function locatePortraitFace(im,d){
 // Midtones within the silhouette favour the lit cheek over hair and the backdrop.
 if(!im)return;
 let total=0,sx=0,sy=0;
 for(let row=0;row<20;row++)for(let col=0;col<32;col++){
  const u=.12+(col+.5)*.76/32,v=.28+(row+.5)*.36/20;
  const i=4*(Math.floor(v*im.height)*im.width+Math.floor(u*im.width)),p=im.data;
  const lum=(.2126*p[i]+.7152*p[i+1]+.0722*p[i+2])/255;
  const weight=smooth(.10,.64,lum)*(1-smooth(.70,d.thr/100,lum))*p[i+3]/255;
  total+=weight;sx+=u*weight;sy+=v*weight;
 }
 if(total>8){d.faceX=Math.round(100*sx/total);d.faceY=Math.round(100*sy/total)}
}
function subjectWeight(p,i,luma,d){
 if(d.matte===2)return 1;
 const feather=Math.max(.01,d.soft/110);
 if(d.matte===3){
  const delta=Math.hypot(p[i]-d.keyR,p[i+1]-d.keyG,p[i+2]-d.keyB)/(255*Math.sqrt(3));
  return smooth(d.tolerance/100,d.tolerance/100+feather,delta);
 }
 const cutoff=d.thr/100;
 return 1-smooth(cutoff-.75*feather,cutoff+.25*feather,d.matte===1?1-luma:luma);
}
function showSubjectMask(){
 if(section!=='double'||!second||state.d.mode!==2)return false;
 const sampling=$('film-sample-bg')?.getAttribute('aria-pressed')==='true';
 if(!sampling&&!previewSubject)return false;
 const source=$('lgrade').checked&&layers.length?flat():base;
 if(sampling){ctx.putImageData(source,0,0);return true}
 const saved=state.d.matte===4?maskPixels(state.d.savedId,W,H):null;
 const src=source.data,mask=new ImageData(W,H),pixels=mask.data;
 for(let i=0;i<src.length;i+=4){
  const lum=(.2126*src[i]+.7152*src[i+1]+.0722*src[i+2])/255;
  pixels[i]=pixels[i+1]=pixels[i+2]=src[i+3]*(state.d.matte===4?(saved?.[i/4]||0)/255:subjectWeight(src,i,lum,state.d));pixels[i+3]=255;
 }
 ctx.putImageData(mask,0,0);return true;
}
function portraitExposure(im,texture,d,placement){
 const w=im.width,h=im.height,out=new ImageData(new Uint8ClampedArray(im.data),w,h),dst=out.data,src=im.data,tex=texture.data;
 const mono=d.style===0,amount=d.op/100;
 const pw=placement?.w||w,ph=placement?.h||h,inv=placement?.m.inverse();
 const ax=(inv?.a??1)/pw,bx=(inv?.c??0)/pw,tx=(inv?.e??0)/pw;
 const ay=(inv?.b??0)/ph,by=(inv?.d??1)/ph,ty=(inv?.f??0)/ph;
 const radius=Math.max(.01,d.faceRadius/100),rx=radius*Math.min(pw,ph)/pw,ry=radius*1.25*Math.min(pw,ph)/ph;
 const saved=d.matte===4?maskPixels(d.savedId,w,h):null;
 const paper=mono?[218,219,212]:[242,246,246],ink=mono?[12,21,24]:[30,45,43];
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=4*(y*w+x);if(!src[i+3])continue;
  const l=(.2126*src[i]+.7152*src[i+1]+.0722*src[i+2])/255;
  const mask=d.matte===4?(saved?.[i/4]||0)/255:subjectWeight(src,i,l,d);
  const u=ax*x+bx*y+tx,v=ay*x+by*y+ty;
  const dx=(u-d.faceX/100)/rx,dy=(v-d.faceY/100)/ry,protect=(1-smooth(.15,1,dx*dx+dy*dy))*d.keep/100;
  const lum=.2126*tex[i]+.7152*tex[i+1]+.0722*tex[i+2];
  const landscape=smooth(.026,.96,lum/255),opacity=tex[i+3]/255;
  const fill=opacity*(1-protect)*(.95-.22*l);
  const foot=d.foreground/100*smooth(.68,1,v)*(1-mask)*opacity*(1-landscape);
  for(let k=0;k<3;k++){
   const baseColour=mono?ink[k]+(paper[k]-ink[k])*l:.82*src[i+k]+.18*l*255;
   const tone=landscape*(.88+.12*l);
   const secondColour=mono?ink[k]+tone*(paper[k]-ink[k]):Math.max(0,Math.min(255,255*tone+.80*(tex[i+k]-lum)));
   const inside=baseColour+(secondColour-baseColour)*fill;
   const surround=d.originalBg?src[i+k]:paper[k];
   const print=surround+(inside-surround)*mask;
   dst[i+k]=src[i+k]+amount*(print+(secondColour-print)*foot-src[i+k]);
  }
 }
 return out;
}

function grainForRecipe(id){
 const p=PR[id],stock=p[1]==='Film stocks'?p[7]:null;
 return {amt:p[4],size:stock?.size??30,col:stock?.col??0,seed:1,...(stock?{organic:true}:{})};
}


const detailFields=[
 ['clarity','Clarity',-100,100,1,0],['haze','Dehaze',-100,100,1,0],
 ['denoise','Edge-aware smoothing',0,100,1,0],['fringe','Purple / green defringe',0,100,1,0],
 ['sharp','Sharpen amount',0,150,1,0],['radius','Sharpen radius (px)',.5,5,.25,1],['threshold','Sharpen threshold',0,32,1,3]
];
const defaultDetail=()=>Object.fromEntries(detailFields.map(([key,,,,,value])=>[key,value]));
const hasDetail=d=>!!d&&(d.clarity||d.haze||d.denoise||d.fringe||d.sharp);
function validDetail(d){
 return d&&detailFields.every(([key,,min,max])=>Number.isFinite(d[key])&&d[key]>=min&&d[key]<=max);
}
const lumaByte=(p,i)=>.2126*p[i]+.7152*p[i+1]+.0722*p[i+2];
function blurredLuma(im,radius){
 // Blur premultiplied colours so transparent pixels do not contribute dark outlines.
 const cv=bc(im.width,im.height),g=cv.getContext('2d',{willReadFrequently:true});g.filter='blur('+radius+'px)';g.drawImage(asCanvas(im),0,0);
 const rgba=read(cv).data,out=new Uint8Array(im.width*im.height);
 for(let j=0;j<out.length;j++)out[j]=Math.round(lumaByte(rgba,4*j));
 return out;
}
function smoothPhoto(im,amount){
 const d=im.data,src=new Uint8ClampedArray(d),w=im.width,h=im.height,t=amount/100,range=8+24*t;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=4*(y*w+x);if(!src[i+3])continue;
  let r=src[i],g=src[i+1],b=src[i+2],weight=1;
  for(let yy=Math.max(0,y-1);yy<=Math.min(h-1,y+1);yy++)for(let xx=Math.max(0,x-1);xx<=Math.min(w-1,x+1);xx++){
   const q=4*(yy*w+xx);if(q===i||!src[q+3])continue;
   const diff=Math.max(Math.abs(src[q]-src[i]),Math.abs(src[q+1]-src[i+1]),Math.abs(src[q+2]-src[i+2]))/range;
   const squared=diff*diff,k=src[q+3]/(255*(1+squared*squared));r+=src[q]*k;g+=src[q+1]*k;b+=src[q+2]*k;weight+=k;
  }
  d[i]+=(r/weight-d[i])*t;d[i+1]+=(g/weight-d[i+1])*t;d[i+2]+=(b/weight-d[i+2])*t;
 }
}
function developDetail(im,detail){
 if(!hasDetail(detail))return;
 if(detail.denoise)smoothPhoto(im,detail.denoise);
 if(!(detail.clarity||detail.sharp||detail.haze||detail.fringe))return;
 const p=im.data,w=im.width,h=im.height;
 const broad=detail.clarity||detail.haze?blurredLuma(im,Math.max(2,Math.min(w,h)*.012)):null;
 const fine=detail.sharp?blurredLuma(im,detail.radius):null;
 const edge=detail.fringe?new Uint8Array(w*h):null;
 if(edge)for(let j=0;j<edge.length;j++)edge[j]=Math.round(lumaByte(p,4*j));
 for(let j=0;j<w*h;j++){
  const i=4*j;if(!p[i+3])continue;
  const l=lumaByte(p,i);let delta=0;
  if(broad){
   const midtone=1-Math.abs(2*l/255-1)**2;
   delta+=(l-broad[j])*detail.clarity*.017*midtone;
   // Remove a bounded amount of the pale veil in bright, low-contrast regions.
   const veil=Math.min(p[i],p[i+1],p[i+2],broad[j])/255;
   const transmission=1-detail.haze*.0042*veil;
   delta+=(l-235)*(1/transmission-1);
  }
  if(fine){const high=l-fine[j];delta+=Math.sign(high)*Math.max(0,Math.abs(high)-detail.threshold)*detail.sharp*.018}
  let neutral=0;
  if(edge){
   const x=j%w,y=Math.floor(j/w),lo=edge[x?j-1:j],hi=edge[x<w-1?j+1:j],up=edge[y?j-w:j],dn=edge[y<h-1?j+w:j];
   const contrast=Math.max(Math.abs(hi-lo),Math.abs(dn-up),Math.abs(l-lo),Math.abs(l-up));
   const purple=Math.min(p[i],p[i+2])-p[i+1],green=p[i+1]-Math.max(p[i],p[i+2]);
   neutral=detail.fringe*.01*smooth(7,48,contrast)*smooth(9,64,Math.max(purple,green));
  }
  for(let ch=0;ch<3;ch++)p[i+ch]+=delta+(l-p[i+ch])*neutral;
 }
}
function balancePixels(im,gains){
 if(!gains)return;
 const tables=gains.map(g=>Uint8ClampedArray.from({length:256},(_,i)=>255*toSRGB(Math.min(1,toLinear(i/255)*g))));
 const p=im.data;for(let i=0;i<p.length;i+=4)if(p[i+3]){p[i]=tables[0][p[i]];p[i+1]=tables[1][p[i+1]];p[i+2]=tables[2][p[i+2]]}
}

const portraitDefaults={savedId:0,originalBg:0,keyR:255,keyG:255,keyB:255,tolerance:12,style:0,matte:0,faceX:50,faceY:46,faceRadius:26,foreground:40};
const defaults=()=>({detail:defaultDetail(),wb:null,a:Object.fromEntries(ADJ.map(([key])=>[key,0])),f:{i:0,m:100},n:{amt:0,size:30,col:0,seed:1},g:{amt:0,spr:50,thr:60,src:0},d:{...portraitDefaults,on:0,mode:0,bl:0,op:80,fit:0,sc:100,rot:0,fx:0,fy:0,ox:0,oy:0,thr:50,soft:30,light:0,keep:0,bri:0,con:0,sat:0,fade:0,bw:0,inv:0,cl:0,cr:0,ct:0,cb:0},id:-1,k:100});
let previewSubject=false;
const exposurePanels=new Set();
let anchor=null,layoutOrigin=null,paper=null,keepLayout=true,restoreOnOpen=false;
let state=defaults(),second=null,cached=null,secondRequest=0,gesture=null;
const clamp=v=>Math.max(0,Math.min(1,v));
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t)};
const asCanvas=im=>{const cv=bc(im.width,im.height);cv.getContext('2d').putImageData(im,0,0);return cv};
const read=cv=>cv.getContext('2d',{willReadFrequently:true}).getImageData(0,0,cv.width,cv.height);
const getPref=(key,fallback)=>{try{return JSON.parse(localStorage.getItem('totone:film:'+key))??fallback}catch{return fallback}};
const setPref=(key,value)=>{try{localStorage.setItem('totone:film:'+key,JSON.stringify(value))}catch{}};
function recipe(id,k,current=defaults()){
 const p=PR[id],next=defaults(),mix=k/100;
 for(const [q,value] of Object.entries(p[3]))next.a[q]=value*mix;
 next.f={i:p[2],m:k};next.n=grainForRecipe(id);next.n.amt*=mix;next.g.amt=p[5]*mix;
 next.d={...next.d,...current.d};if(p[6])Object.assign(next.d,p[6],{op:p[6].op*mix,on:1});
 if(p[7]){
  const print=p[7],grade=neutralGrade();
  grade.curves.master=[0,64,128,192,255].map((x,i)=>[x,Math.round(x+(print.curve[i]-x)*mix)]);
  for(const zone of ['shadows','highlights']){const [hue,sat]=print[zone];grade.zones[zone]={hue,sat:sat*mix,lum:0}}
  next.grading=grade;
 }
 next.detail={...current.detail};next.wb=current.wb?.slice()||null;
 next.id=id;next.k=k;return next;
}
const curveKeys=['master','red','green','blue'],zoneKeys=['shadows','midtones','highlights'];
const neutralCurve=()=>[[0,0],[255,255]];
const neutralZone=()=>({hue:0,sat:0,lum:0});
function neutralGrade(){
 return {curves:Object.fromEntries(curveKeys.map(k=>[k,neutralCurve()])),zones:Object.fromEntries(zoneKeys.map(k=>[k,neutralZone()])),balance:0,mix:100};
}
const changedCurve=points=>points.some(([x,y])=>x!==y);
function usesGrade(grade){
 return !!grade&&grade.on!==false&&(grade.bands?.some(b=>b.h||b.s||b.l)||grade.masks?.some(m=>m.on&&(m.exposure||m.warmth||m.tint||m.saturation))||curveKeys.some(k=>changedCurve(grade.curves[k]))||(grade.mix>0&&zoneKeys.some(k=>grade.zones[k].sat||grade.zones[k].lum)));
}
// Shape-preserving cubic interpolation keeps local peaks and flat segments within their point values.
function curveTable(points){
 const last=points.length-1,slopes=[],tangents=[],table=new Float32Array(256);
 for(let i=0;i<last;i++)slopes.push((points[i+1][1]-points[i][1])/(points[i+1][0]-points[i][0]));
 tangents.push(slopes[0]);
 for(let i=1;i<last;i++){
  const a=slopes[i-1],b=slopes[i];tangents.push(a*b>0?2*a*b/(a+b):0);
 }
 tangents.push(slopes[last-1]);
 for(let i=0;i<last;i++){
  const [x0,y0]=points[i],[x1,y1]=points[i+1],width=x1-x0;
  for(let x=x0;x<=x1;x++){
   const t=(x-x0)/width,s=1-t;
   table[x]=clamp(((1+2*t)*s*s*y0+t*s*s*width*tangents[i]+t*t*(3-2*t)*y1-t*t*s*width*tangents[i+1])/255);
  }
 }
 return table;
}
function hueColor(degrees){
 const h=degrees/60;return [0,4,2].map(offset=>{const k=(h+offset)%6;return 1-Math.max(0,Math.min(1,k,4-k))});
}
function compileGrade(grade){
 if(!usesGrade(grade))return null;
 let curves=null,tints=null;
 if(curveKeys.some(k=>changedCurve(grade.curves[k]))){
  const master=curveTable(grade.curves.master);
  curves=curveKeys.slice(1).map(key=>{
   const channel=curveTable(grade.curves[key]);
   return Float32Array.from(master,v=>{const x=v*255,i=Math.floor(x);return channel[i]+(channel[Math.min(255,i+1)]-channel[i])*(x-i)});
  });
 }
 if(grade.mix&&zoneKeys.some(k=>grade.zones[k].sat||grade.zones[k].lum)){
  tints=new Float32Array(256*3);
  const colors=zoneKeys.map(key=>{
   const z=grade.zones[key],rgb=hueColor(z.hue),l=.2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];
   return rgb.map(v=>((v-l)*z.sat*.004+z.lum*.0023)*grade.mix/100);
  });
  for(let i=0;i<256;i++){
   const l=clamp(i/255+grade.balance*.003),dark=1-smooth(.05,.55,l),light=smooth(.45,.95,l),middle=1-dark-light;
   for(let k=0;k<3;k++)tints[3*i+k]=dark*colors[0][k]+middle*colors[1][k]+light*colors[2][k];
  }
 }
 return {curves,tints};
}

function enabled(s=state){return !!(s.reference||hasDetail(s.detail)||s.wb||usesGrade(s.grading)||(s.f.i&&s.f.m)||s.n.amt||s.g.amt||(s.d.on&&second&&s.d.op)||Object.values(s.a).some(Boolean))}
function composite(im,s,exposure,placement=null){
 const d=s.d,w=im.width,h=im.height,iw=exposure.width,ih=exposure.height;
 const left=iw*d.cl/100,top=ih*d.ct/100,sw=Math.max(1,Math.min(iw-left,iw*(1-(d.cl+d.cr)/100))),sh=Math.max(1,Math.min(ih-top,ih*(1-(d.ct+d.cb)/100)));
 const pw=placement?.w||w,ph=placement?.h||h;
 const fit=d.fit===1?Math.min(pw/sw,ph/sh):Math.max(pw/sw,ph/sh),dw=d.fit===2?pw:sw*fit,dh=d.fit===2?ph:sh*fit;
 const texture=bc(w,h),g=texture.getContext('2d',{willReadFrequently:true});
 if(placement)g.setTransform(placement.m);
 g.translate(pw*(.5+d.ox/100),ph*(.5+d.oy/100));g.rotate(d.rot*Math.PI/180);g.scale((d.fx?-1:1)*d.sc/100,(d.fy?-1:1)*d.sc/100);
 g.drawImage(exposure,left,top,sw,sh,-dw/2,-dh/2,dw,dh);
 const projected=read(texture),p=projected.data,basePixels=im.data;
 for(let i=0;i<p.length;i+=4){
   if(!p[i+3])continue;
   const luma=(.2126*basePixels[i]+.7152*basePixels[i+1]+.0722*basePixels[i+2])/255;
   const edge=smooth(d.thr/100-d.soft/200,d.thr/100+d.soft/200+.001,luma),mask=d.mode?1:d.light?edge:1-edge;
   const grey=.2126*p[i]+.7152*p[i+1]+.0722*p[i+2];
   for(let k=0;k<3;k++){
     let v=(grey+(p[i+k]-grey)*(d.bw?0:1+d.sat/100))/255;
     if(d.inv)v=1-v;
     p[i+k]=255*(((v+d.bri*.003-.5)*(1+d.con/100)+.5)*(1-d.fade*.0025)+d.fade*.0012);
   }
   if(d.mode!==2)p[i+3]*=mask*d.op/100;
 }
 if(d.mode===2)return portraitExposure(im,projected,d,placement);
 g.putImageData(projected,0,0);
 const cv=asCanvas(im),out=cv.getContext('2d');out.globalCompositeOperation=blendModes[d.bl];out.drawImage(texture,0,0);
 const result=read(cv);if(!d.mode&&d.keep){
  const q=result.data;
  for(let i=0;i<q.length;i+=4){const l=(.2126*basePixels[i]+.7152*basePixels[i+1]+.0722*basePixels[i+2])/255,amt=d.keep/100*p[i+3]/255;
   for(let k=0;k<3;k++){const v=q[i+k]/255,bent=l<.5?v-(1-2*l)*v*(1-v):v+(2*l-1)*(Math.sqrt(v)-v);q[i+k]=(v+(bent-v)*amt)*255}}
 }
 return result;
}
function noise(x,y,seed){
 let h=Math.imul(x+seed*131,374761393)+Math.imul(y,668265263);h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967296-.5;
}
// Rotate and interpolate the coarse noise, then add a fine component to break up the lattice.
function emulsionNoise(x,y,step,seed){
 const u=(.92*x+.39*y)/step,v=(.92*y-.39*x)/step,gx=Math.floor(u),gy=Math.floor(v);
 const fx=u-gx,fy=v-gy,top=noise(gx,gy,seed)*(1-fx)+noise(gx+1,gy,seed)*fx;
 const bottom=noise(gx,gy+1,seed)*(1-fx)+noise(gx+1,gy+1,seed)*fx;
 return (top+(bottom-top)*fy)*1.18+.24*noise(x,y,seed+103);
}
function develop(input,s,exposure,placement=null){
 const im=s.d.on&&s.d.op&&exposure?composite(input,s,exposure,placement):new ImageData(new Uint8ClampedArray(input.data),input.width,input.height);
 balancePixels(im,s.wb);developDetail(im,s.detail);
 const {a,f,n,g}=s,fl=FL[f.i],p=im.data,w=im.width,h=im.height,ev=2**a.exp,ct=1+a.con/100,sat=1+a.sat/100,filterMix=f.i?f.m/100:0;
 const redBias=a.tmp*.001+a.tint*.0003,greenBias=-a.tint*.0006,blueBias=-a.tmp*.001+a.tint*.0003,grainStep=n.organic?
   (.72+n.size*.043)*Math.max(1,Math.min(w,h)/1000):Math.max(1,Math.min(w,h)*(.0006+n.size*.00004));
 const creative=compileGrade(s.grading),mixer=s.grading?.on===false?null:compileMixer(s.grading?.bands),mixed=new Float32Array(3),masks=prepareMasks(s.grading,w,h);
 const doGrade=filterMix||Object.values(a).some(Boolean);
 if(doGrade||creative||n.amt)for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const i=4*(y*w+x);if(!p[i+3])continue;
   let r=p[i]/255,b=p[i+2]/255,green=p[i+1]/255;
   if(doGrade){
    r=(r*ev+a.bri*.003-.5)*ct+.5;green=(green*ev+a.bri*.003-.5)*ct+.5;b=(b*ev+a.bri*.003-.5)*ct+.5;
    let l=.2126*r+.7152*green+.0722*b;
    const lift=a.hi*.003*smooth(.35,1,l)+a.sh*.003*(1-smooth(0,.65,l));
    r+=lift+redBias;green+=lift+greenBias;b+=lift+blueBias;l=.2126*r+.7152*green+.0722*b;
    const chroma=(Math.max(r,green,b)-Math.min(r,green,b))*sat,boost=sat*(1+a.vib*.01*(1-clamp(chroma))),fade=1-a.fade*.0025;
    r=clamp((l+(r-l)*boost)*fade+a.fade*.0012);green=clamp((l+(green-l)*boost)*fade+a.fade*.0012);b=clamp((l+(b-l)*boost)*fade+a.fade*.0012);
    if(filterMix){
     l=.2126*r+.7152*green+.0722*b;const fs=fl[4]?0:fl[1],slope=fl[2]*(1-fl[3]),bias=(l*(1-fs)*fl[2]+.5*(1-fl[2]))*(1-fl[3])+fl[3];
     const lum=(l-.5)*slope+.5*(1-fl[3])+fl[3],shadow=1-smooth(.1,.7,lum),high=smooth(.3,.9,lum);
     r+=(clamp(r*fs*slope+bias+fl[5][0]*shadow+fl[6][0]*high)-r)*filterMix;
     green+=(clamp(green*fs*slope+bias+fl[5][1]*shadow+fl[6][1]*high)-green)*filterMix;
     b+=(clamp(b*fs*slope+bias+fl[5][2]*shadow+fl[6][2]*high)-b)*filterMix;
    }
    if(a.vig){const v=1-a.vig/100*smooth(.35,1,Math.hypot(x/w-.5,y/h-.5)*1.414);r*=v;green*=v;b*=v}
   }
   if(mixer){mixRGB(r,green,b,mixer,mixed);r=mixed[0];green=mixed[1];b=mixed[2]}
   for(const mask of masks){
    const weight=maskWeight(mask,x,y);if(weight<=0)continue;
    const l=.2126*r+.7152*green+.0722*b;
    r+=((l+(r-l)*mask.sat)*mask.gain+mask.red-r)*weight;
    green+=((l+(green-l)*mask.sat)*mask.gain+mask.green-green)*weight;
    b+=((l+(b-l)*mask.sat)*mask.gain+mask.blue-b)*weight;
   }
   if(creative){
    if(creative.curves){
     r=creative.curves[0][Math.round(clamp(r)*255)];green=creative.curves[1][Math.round(clamp(green)*255)];b=creative.curves[2][Math.round(clamp(b)*255)];
    }
    if(creative.tints){
     const j=3*Math.round(clamp(.2126*r+.7152*green+.0722*b)*255);r+=creative.tints[j];green+=creative.tints[j+1];b+=creative.tints[j+2];
    }
   }
   if(n.amt){const gx=Math.floor(x/grainStep),gy=Math.floor(y/grainStep),strength=n.amt*.006*(1-.6*smooth(.35,.95,.2126*r+.7152*green+.0722*b)),v=n.organic?emulsionNoise(x,y,grainStep,n.seed):noise(gx,gy,n.seed),color=n.col/100;
    r+=(v+(noise(gx,gy,n.seed+17)-v)*color)*strength;green+=v*strength;b+=(v+(noise(gx,gy,n.seed+43)-v)*color)*strength}
   p[i]=r*255;p[i+1]=green*255;p[i+2]=b*255;
 }
 if(s.reference)matchReference(im,s.reference);
 if(!g.amt)return im;
 const cv=asCanvas(im),scale=Math.max(1,Math.min(w,h)/280),small=bc(Math.max(1,Math.round(w/scale)),Math.max(1,Math.round(h/scale))),sg=small.getContext('2d',{willReadFrequently:true});
 sg.drawImage(cv,0,0,small.width,small.height);const bright=read(small);
 for(let i=0;i<bright.data.length;i+=4){const q=bright.data,l=(.2126*q[i]+.7152*q[i+1]+.0722*q[i+2])/255;q[i+3]*=g.src?1:smooth(g.thr/100-.15,g.thr/100+.1,l)}
 sg.putImageData(bright,0,0);const out=cv.getContext('2d');out.globalCompositeOperation='screen';out.globalAlpha=g.amt/100;out.filter='blur('+Math.max(.5,Math.min(w,h)*(.001+g.spr*.00018))+'px)';out.drawImage(small,0,0,w,h);
 const result=read(cv);for(let i=3;i<p.length;i+=4)result.data[i]=p[i];return result;
}
function image(im){if(!enabled())return im;if(!cached||cached.input!==im)cached={input:im,result:develop(im,state,second,anchor)};return cached.result}

function expSample(i){const W=1200,H=800,c=Object.assign(document.createElement('canvas'),{width:W,height:H}),x=c.getContext('2d');let s=11+i,g;
const R=()=>(s=s*16807%2147483647)/2147483647,lg=(st)=>{g=x.createLinearGradient(0,0,0,H);st.forEach((a,j)=>g.addColorStop(j/(st.length-1),a));x.fillStyle=g;x.fillRect(0,0,W,H)};
if(i==0){lg(['#d5e4dc','#8aa89c']);for(let L=0;L<4;L++){const by=380+L*110;x.fillStyle=`rgb(${80-L*20},${118-L*26},${108-L*24})`;
for(let px=-30;px<W+30;px+=14+R()*18){const h=110+R()*170+L*10,w=30+R()*30;x.beginPath();x.moveTo(px-w/2,by+h);x.lineTo(px,by-h*.6);x.lineTo(px+w/2,by+h);x.fill()}
x.fillRect(0,by+110,W,H);g=x.createLinearGradient(0,by-40,0,by+220);g.addColorStop(0,'rgba(225,238,232,0)');g.addColorStop(.5,'rgba(225,238,232,.35)');g.addColorStop(1,'rgba(225,238,232,0)');x.fillStyle=g;x.fillRect(0,by-40,W,260)}}
else if(i==1){lg(['#2f2a52','#c46a72','#f4b98a']);x.fillStyle='#ffe3b0';x.beginPath();x.arc(780,520,60,0,7);x.fill();
for(let L=0;L<4;L++){const by=470+L*70,ph=R()*6;x.fillStyle=`rgb(${96-L*22},${70-L*14},${110-L*20})`;x.beginPath();x.moveTo(0,H);for(let px=0;px<=W;px+=8)x.lineTo(px,by-70*Math.sin(px*.004+ph)-35*Math.sin(px*.011+ph*2)-15*Math.sin(px*.03+L));x.lineTo(W,H);x.fill()}}
else if(i==2){lg(['#4f86c6','#bcd8f0']);for(let n=0;n<160;n++){const px=R()*W,py=R()*H*.8,r=60+R()*140;g=x.createRadialGradient(px,py,0,px,py,r);g.addColorStop(0,'rgba(255,255,255,.16)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(px-r,py-r,r*2,r*2)}}
else{lg(['#05060f','#0b1030']);[['120,70,200',300,250],['60,110,220',800,500],['200,70,160',1000,200]].forEach(([k,px,py])=>{g=x.createRadialGradient(px,py,0,px,py,320);g.addColorStop(0,`rgba(${k},.35)`);g.addColorStop(1,`rgba(${k},0)`);x.fillStyle=g;x.fillRect(0,0,W,H)});
for(let n=0;n<1600;n++){x.fillStyle=`rgba(255,255,255,${.2+R()*.7})`;x.fillRect(R()*W,R()*H,1+(R()<.1),1+(R()<.1))}
for(let n=0;n<40;n++){const px=R()*W,py=R()*H;g=x.createRadialGradient(px,py,0,px,py,14);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(px-14,py-14,28,28)}}
return c}
function sampleCity(){const c=document.createElement('canvas');c.width=1600;c.height=1000;const x=c.getContext('2d');let s=7;const R=()=>(s=s*16807%2147483647)/2147483647;
let g=x.createLinearGradient(0,0,0,760);[[0,'#0e1233'],[.5,'#5b4478'],[.82,'#e5866c'],[1,'#f5c089']].forEach(a=>g.addColorStop(a[0],a[1]));x.fillStyle=g;x.fillRect(0,0,1600,1000);
g=x.createRadialGradient(1180,210,0,1180,210,220);g.addColorStop(0,'rgba(255,244,222,.5)');g.addColorStop(1,'rgba(255,244,222,0)');x.fillStyle=g;x.fillRect(900,0,600,460);x.fillStyle='#fff3d6';x.beginPath();x.arc(1180,210,40,0,7);x.fill();
for(let L=0;L<2;L++){for(let px=-20;px<1620;){const w=60+R()*100,h=(L?170:110)+R()*(L?330:220),y=1000-h;x.fillStyle=L?'#0b0c17':'#1c1a35';x.fillRect(px,y,w,h);
for(let wy=y+14;wy<990;wy+=22)for(let wx=px+8;wx<px+w-10;wx+=18)if(R()<(L?.28:.2)){x.fillStyle=R()<.7?'rgba(255,200,110,.9)':'rgba(150,200,255,.85)';x.fillRect(wx,wy,7,10)}px+=w+R()*8}}
for(let i=0;i<7;i++){const lx=120+i*230,ly=830+R()*30;x.fillStyle='#07080f';x.fillRect(lx-3,ly,6,170);g=x.createRadialGradient(lx,ly,0,lx,ly,70);g.addColorStop(0,'rgba(255,230,170,.9)');g.addColorStop(1,'rgba(255,200,120,0)');x.fillStyle=g;x.fillRect(lx-70,ly-70,140,140);x.fillStyle='#fff8e0';x.beginPath();x.arc(lx,ly,7,0,7);x.fill()}
return c}

let category='All',query='',section='presets',favorites=getPref('favorites',[]),recent=getPref('recent',[]),last=getPref('last',null);
// Projects saved with the two retired portrait recipes already contain their full settings.
function migrateExposure(look){if(look?.d?.mode===2&&[80,81].includes(look.id))look.id=-1}
migrateExposure(last);
if(last&&(!last.a||!last.d||!last.g||!last.n||!FL[last.f?.i]||(last.id!==-1&&!PR[last.id])))last=null;
if(!Array.isArray(favorites))favorites=[];if(!Array.isArray(recent))recent=[];
const pane=$('film-controls'),view=$('film-section'),heading=text=>'<h3>'+esc(text)+'</h3>';
const button=(id,name)=>'<button type="button" id="film-'+id+'">'+esc(name)+'</button>';
const bar=(...items)=>'<div class="bar">'+items.join('')+'</div>';
function field(group,key,label,control){return '<label>'+esc(label)+' '+control.replace('FIELD','data-group="'+group+'" data-key="'+key+'" aria-label="'+esc(label)+'"')+'</label>'}
function slider(group,key,label,min,max,step=1){
 const value=group==='preset'?state.k:group==='n'&&key==='amt'&&state.id>=0?(state.grainAmount??PR[state.id][4]):state[group][key];
 const v=Number(value.toFixed(2));
 return field(group,key,label,'<input FIELD type="range" min="'+min+'" max="'+max+'" step="'+step+'" value="'+v+'"><output>'+v+'</output>');
}
function select(group,key,label,options){return field(group,key,label,'<select FIELD>'+options.map((n,i)=>'<option value="'+i+'" '+(i===state[group][key]?'selected':'')+'>'+esc(n)+'</option>').join('')+'</select>')}
function check(group,key,label){return field(group,key,label,'<input FIELD type="checkbox" '+(state[group][key]?'checked':'')+'>')}
function grainControls(){
 return slider('n','amt','Grain amount',0,100)+slider('n','size','Grain size',0,100)+slider('n','col','Grain colour',0,100);
}
function presetStrength(value){
 const amount=state.grainAmount??PR[state.id][4],next=recipe(state.id,value,state);
 next.n={...state.n,amt:amount*value/100};next.grainAmount=amount;return next;
}
function snapshot(withTone=false){
 const prior=structuredClone(state),photo=second,location=anchor,tone=withTone?toneSnapshot():null;
 return ()=>{const redo=snapshot(withTone);if(tone)tone();state=prior;second=photo;anchor=location;thumbs.clear();changed(true);return redo};
}
function changed(rebuild=false){cached=null;draw(true);if(rebuild)build();showP($('q').value.toLowerCase())}
function save(){
 last={...structuredClone(state),geometry:layoutOrigin?.steps||[]};setPref('last',last);
}
function command(fn,withTone=false,record=true){gesture=null;if(base&&record)pushU(snapshot(withTone));fn();save();changed(true)}
function apply(id){
 const resetLayout=!keepLayout&&!!layoutOrigin;
 if(resetLayout)pushU(documentSnapshot(true));
 command(()=>{if(resetLayout)restoreLayout();state=recipe(id,100,state);$('gradient-enabled').checked=false;
   recent=[PR[id][0],...recent.filter(n=>n!==PR[id][0])].slice(0,24);setPref('recent',recent);
   if(PR[id][6])section='double';
 },true,!resetLayout);
}
function matches(p){return (category==='All'||p[1]===category||(category==='Favourites'&&favorites.includes(p[0]))||(category==='Recent'&&recent.includes(p[0])))&&(p[0]+' '+p[1]).toLowerCase().includes(query.trim().toLowerCase())}
function ids(){const list=PR.map((_,i)=>i).filter(i=>matches(PR[i]));if(category==='Recent')list.sort((a,b)=>recent.indexOf(PR[a][0])-recent.indexOf(PR[b][0]));return list}
let thumbs=new Map(),thumbSource=null,thumbImage=null,thumbJob=0;
function thumbnailImage(){
 if(!base)return null;
 if(thumbSource!==base||!thumbImage){const sample=bc(80,48),g=sample.getContext('2d'),source=asCanvas(base),scale=Math.max(80/W,48/H);
  g.drawImage(source,(80-W*scale)/2,(48-H*scale)/2,W*scale,H*scale);thumbImage=read(sample);thumbSource=base;thumbs.clear()}
 return thumbImage;
}
function previews(){
 const job=++thumbJob;if(tab!=='film'||!base)return;
 const cards=[...pane.querySelectorAll('img[data-preview]')];if(!cards.length)return;
 const im=thumbnailImage();
 function next(){
  if(job!==thumbJob||tab!=='film')return;
  for(let count=0;cards.length&&count<4;count++){const img=cards.shift(),id=+img.dataset.preview;
   if(!thumbs.has(id)){
    const st=id<0?defaults():recipe(id,100,state);if(id<0){st.f.i=-id-1;st.detail=state.detail;st.wb=state.wb}
    const source=id>=0&&PR[id][6]?previewExposure():null;thumbs.set(id,asCanvas(develop(im,st,source)).toDataURL());
   }
   img.src=thumbs.get(id);
  }if(cards.length)setTimeout(next,12);
 }next();
}
let sampleExposure=null;
function previewExposure(){return second||(sampleExposure??=expSample(0))}
function list(){
 const target=$('film-list');if(!target)return;
 if($('stock-note'))$('stock-note').hidden=category!=='Film stocks';
 const matches=ids();
 target.innerHTML=matches.map(i=>'<div class="film-card"><button class="p'+(state.id===i?' on':'')+'" data-recipe="'+i+'" aria-pressed="'+(state.id===i)+'">'+(base?'<img data-preview="'+i+'" width="60" height="36" alt="">':'')+esc(PR[i][0])+'</button><button data-favorite="'+i+'" aria-label="Favourite '+esc(PR[i][0])+'" aria-pressed="'+favorites.includes(PR[i][0])+'">'+(favorites.includes(PR[i][0])?'★':'☆')+'</button></div>').join('')||'<p class="note">No matching looks.</p>';previews();
}
function exposurePanel(name,content){
 return '<details data-exposure-panel="'+name+'" '+(exposurePanels.has(name)?'open':'')+'><summary>'+name+'</summary>'+content+'</details>';
}
function exposureSubject(d){
 const sampled=[d.keyR,d.keyG,d.keyB].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');
 return select('d','matte','Subject mask',['Light background','Dark background','Transparency','Sampled colour',...(maskBank.length?['Saved mask']:[])])+
  (d.matte===4?'<label>Saved mask <select data-group="d" data-key="savedId">'+maskBank.map(m=>'<option value="'+m.id+'" '+(m.id===d.savedId?'selected':'')+'>'+esc(m.name)+'</option>').join('')+'</select></label>':'')+
  (d.matte===3?bar(button('sample-bg','Sample background on canvas'),'<span aria-label="Sampled colour #'+sampled+'" title="#'+sampled+'" style="display:inline-block;width:1.4em;height:1.4em;border:1px solid currentColor;background:#'+sampled+'"></span>')+
   '<p class="note" role="status" id="sample-bg-help"></p>'+slider('d','tolerance','Colour tolerance',0,100):'')+
  (d.matte<2?slider('d','thr','Subject cutoff',0,100):'')+(d.matte!==2?slider('d','soft','Edge softness',0,100):'')+
  '<label>Preview subject mask <input type="checkbox" id="exposure-mask" '+(previewSubject?'checked':'')+'></label>'+
  (previewSubject?'<p class="note">White receives the second photo. Black protects the background.</p>':'')+
  select('d','style','Colour treatment',['Monochrome','Colour'])+
  (d.matte!==2?check('d','originalBg','Keep original background')+slider('d','foreground','Blend into lower background',0,100):'')+
  exposurePanel('Protect detail',slider('d','keep','Keep subject detail',0,100)+bar(button('portrait-focus','Place protected area'))+
   '<p class="note" role="status" id="portrait-focus-help">Place the protected area over a detail such as an eye or a sign.</p>'+
   slider('d','faceRadius','Protected area size',5,60)+slider('d','faceX','Protected area X',0,100)+slider('d','faceY','Protected area Y',0,100));
}
function build(){
 if(suiteReady){refreshLooks($('look-list').value);syncReference()}
 if(tab==='grade')syncGrade();
 $('film-sample').hidden=!!base||section==='double';view.value=section;const showPreset=state.id>=0?slider('preset','k','Preset strength',0,100)+grainControls()+
   bar(button('reset-grain','Restore preset grain'))+'<p class="note">Preset strength scales the look and its grain together.</p>':'';
 if(section==='presets'){
 const cats=['All','Cinematic','Film stocks','Favourites','Recent',...new Set(PR.map(p=>p[1]).filter(n=>!['Cinematic','Film stocks'].includes(n)))];
 pane.innerHTML='<label>Collection <select id="film-collection">'+cats.map(n=>'<option '+(category===n?'selected':'')+'>'+esc(n)+'</option>').join('')+'</select></label><input type="search" id="film-search" placeholder="Search looks" aria-label="Search film looks">'+bar(button('surprise','Surprise me'),button('restore','Restore last look'))+showPreset+'<p class="note" id="stock-note" hidden>Original looks inspired by still and motion-picture film stocks.</p><label>Keep my crop and frame <input id="film-keep" type="checkbox" '+(keepLayout?'checked':'')+'></label><div id="film-list"></div>'; $('film-search').value=query;$('film-restore').disabled=!last;list();
 }else if(section==='grade'){
 pane.innerHTML=select('f','i','Color filter',FL.map(f=>f[0]))+(base?'<details id="film-filter-grid"><summary>Preview filters</summary>'+FL.map(([name],i)=>'<button class="film-filter" data-filter="'+i+'"><img data-preview="'+(-i-1)+'" width="60" height="36" alt="">'+esc(name)+'</button>').join('')+'</details>':'')+slider('f','m','Filter strength',0,100)+heading('Light and color')+ADJ.map(([k,n,min,max,step])=>slider('a',k,n,min,max,step)).join('')+bar(button('reset-grade','Reset light and color'));const grid=$('film-filter-grid');if(grid)grid.ontoggle=()=>{if(grid.open)previews()};
 }else if(section==='detail'){
  pane.innerHTML=heading('White balance')+bar(button('wb-pick','Sample neutral colour'),button('wb-clear','Reset white balance'))+
   '<p class="note" id="wb-status" role="status"></p>'+heading('Photo detail')+detailFields.map(([k,label,min,max,step])=>slider('detail',k,label,min,max,step)).join('')+bar(button('detail-reset','Reset detail'));
  $('film-wb-pick').disabled=!base;$('film-wb-pick').setAttribute('aria-pressed','false');$('film-wb-clear').disabled=!state.wb;
  $('wb-status').textContent=state.wb?'White balance sampled from this photo.':'Sample a grey or white area to correct a colour cast.';
 }else if(section==='finish'){
 pane.innerHTML=heading('Film grain')+grainControls()+bar(button('seed','Randomise grain'))+heading('Lens diffusion')+slider('g','amt','Glow amount',0,100)+slider('g','spr','Spread',0,100)+slider('g','thr','Threshold',0,100)+select('g','src','Glow source',['Highlights','Whole image'])+bar(button('reset-finish','Reset grain and glow'));
 }else{
 const d=state.d;
 pane.innerHTML=!base?bar(button('open-pair','Open photos…'))+'<p class="note">Choose or drop two photos. The first is the base and the second fills the subject. You can also open them one at a time.</p>':
  bar(button('choose',second?'Replace second photo':'Add second photo'),button('samples','Try a sample'))+'<div id="film-sample-list" hidden>'+['Pine forest','Mountain range','Cloudscape','Stars'].map((n,i)=>'<button data-sample="'+i+'">'+n+'</button>').join(' ')+'</div>'+
  (second?'':'<p class="note">Choose or drop the image you want to blend into this photo.</p>');
 if(second)pane.insertAdjacentHTML('beforeend','<p class="note">Drag the second photo to move it. Alt-scroll changes its scale.</p>'+check('d','on','Show second photo')+select('d','mode','Exposure mode',['Classic silhouette','Blend','Fill subject'])+(d.mode===2?'':select('d','bl','Blend mode',BLN))+slider('d','op','Opacity',0,100)+(d.mode?'':select('d','light','Fill where base is',['Dark','Light'])+slider('d','thr','Threshold',0,100)+slider('d','soft','Softness',0,100)+slider('d','keep','Keep base detail',0,100))+(d.mode===2?exposureSubject(d):'')+
  exposurePanel('Placement',select('d','fit','Fit',['Fill','Fit','Stretch'])+slider('d','sc','Scale',10,400)+slider('d','rot','Rotation',-180,180)+slider('d','ox','Horizontal position',-100,100)+slider('d','oy','Vertical position',-100,100)+check('d','fx','Flip horizontal')+check('d','fy','Flip vertical')+bar(button('placement','Reset placement')))+
  exposurePanel('Crop second photo',['Left','Right','Top','Bottom'].map((n,i)=>slider('d',['cl','cr','ct','cb'][i],n,0,80)).join('')+bar(button('uncrop','Reset second crop')))+
  exposurePanel('Second photo adjustments',['Brightness','Contrast','Saturation','Fade'].map((n,i)=>slider('d',['bri','con','sat','fade'][i],n,i===3?0:-100,100)).join('')+check('d','bw','Black and white')+check('d','inv','Invert'))+
  bar(button('swap','Swap with base'),button('delete','Remove second photo')));
 for(const panel of pane.querySelectorAll('[data-exposure-panel]'))panel.ontoggle=()=>{if(panel.isConnected){if(panel.open)exposurePanels.add(panel.dataset.exposurePanel);else exposurePanels.delete(panel.dataset.exposurePanel)}};
 }
 $('film-status').textContent=state.id>=0?PR[state.id][0]+' · '+state.k+'%':enabled()?(section==='double'&&state.d.on?'Double exposure':'Custom grade'):'';
}
document.addEventListener('keydown',e=>{
 if(e.key!=='Escape'||tab!=='film'||section!=='double')return;
 const picker=pane.querySelector('button[aria-pressed="true"]');if(picker)picker.click();
});
function setSection(next){section=next;previewSubject=false;build();draw(true)}
view.onchange=()=>setSection(view.value);
$('adjust-detail').onclick=()=>{document.querySelector('.tabs [data-t="film"]').click();setSection('detail')};
function updateField(input){
 const group=input.dataset.group,key=input.dataset.key;if(!group)return;
 if(gesture!==input){if(base)pushU(snapshot());gesture=input}
 const v=input.type==='checkbox'?Number(input.checked):+input.value;
 if(group==='preset')state=presetStrength(v);
 else if(group==='n'&&state.id>=0){
  if(key==='amt'){state.grainAmount=v;state.n.amt=v*state.k/100}else state.n[key]=v;
 }
 else{if(group==='d'&&key==='mode'&&v===2&&state.d.mode!==2&&state.d.originalBg===0&&state.d.keep===0)initialSubject();
 if(group==='d'&&key==='matte'&&v===4&&!maskBank.some(m=>m.id===state.d.savedId))state.d.savedId=maskBank[0]?.id||0;
 state[group][key]=v;if(group==='detail')thumbs.clear();else state.id=-1}
 if(input.nextElementSibling?.tagName==='OUTPUT')input.nextElementSibling.value=v;
 cached=null;draw(true);$('film-status').textContent=state.id>=0?PR[state.id][0]+' · '+state.k+'%':section==='double'?'Double exposure':'Custom grade';
}
pane.addEventListener('input',e=>{if(e.target.id==='film-search'){query=e.target.value;list()}else updateField(e.target)});
pane.addEventListener('change',e=>{const el=e.target;
 if(el.id==='exposure-mask'){previewSubject=el.checked;build();$('exposure-mask')?.focus({preventScroll:true});draw(true);return}
 if(el.id==='film-keep'){keepLayout=el.checked;return}if(el.id==='film-collection'){category=el.value;list();return}
 if(el.dataset.group){if(gesture!==el)updateField(el);gesture=null;save();if(['mode','matte'].includes(el.dataset.key)){build();pane.querySelector('[data-group="d"][data-key="'+el.dataset.key+'"]')?.focus({preventScroll:true})}showP($('q').value.toLowerCase())}});
function initialSubject(){
 Object.assign(state.d,{mode:2,style:1,originalBg:1,thr:82,soft:22,keep:70,foreground:0});
 locatePortraitFace(base,state.d);
}
function setSecond(photo){secondRequest++;command(()=>{if(photo&&!second&&!state.d.on&&state.d.mode===0&&section==='double'&&state.id===-1)initialSubject();
 previewSubject=false;second=photo;anchor=null;state.d.on=photo?1:0;thumbs.clear();thumbJob++})}
async function loadSecond(file){
 if(!file||!base)return;const request=++secondRequest,doc=imageRequest;
 try{const bmp=await createImageBitmap(file);if(doc!==imageRequest||request!==secondRequest){bmp.close();return}
 const scale=Math.min(1,4096/Math.max(bmp.width,bmp.height)),cv=bc(Math.max(1,Math.round(bmp.width*scale)),Math.max(1,Math.round(bmp.height*scale)));
 cv.getContext('2d').drawImage(bmp,0,0,cv.width,cv.height);bmp.close();setSecond(cv);
 }catch{if(doc===imageRequest)$('film-status').textContent='Could not open that second photo.'}
}
$('file').addEventListener('cancel',()=>{restoreOnOpen=false});
async function openExposureFiles(list){
 const files=Array.from(list||[]);if(!files.length)return;
 if(files.length>(base?1:2)||files.some(f=>!f.type.startsWith('image/'))){
  $('film-status').textContent=base?'Choose one image for the second exposure.':'Choose one or two image files.';return;
 }
 if(base){await loadSecond(files[0]);return}
 if(await load(files[0])&&files[1])await loadSecond(files[1]);
}
$('exposure-files').onchange=e=>{openExposureFiles(e.target.files);e.target.value=''};
$('film-file').onchange=e=>{loadSecond(e.target.files[0]);e.target.value=''};
pane.onclick=e=>{
 const el=e.target.closest('button');if(!el)return;
 if(el.dataset.filter!==undefined){command(()=>{state.f.i=+el.dataset.filter;state.f.m=state.f.m||100;state.id=-1});return}
 if(el.dataset.recipe!==undefined){apply(+el.dataset.recipe);return}
 if(el.dataset.favorite!==undefined){const name=PR[+el.dataset.favorite][0];favorites=favorites.includes(name)?favorites.filter(n=>n!==name):[...favorites,name];setPref('favorites',favorites);list();return}
 if(el.dataset.sample!==undefined){if(base)setSecond(expSample(+el.dataset.sample));else $('open').click();return}
 switch(el.id){
 case 'film-open-pair':$('exposure-files').click();break;
 case 'film-sample-bg':{
  const pick=el.getAttribute('aria-pressed')!=='true';el.setAttribute('aria-pressed',String(pick));
  $('film-portrait-focus')?.setAttribute('aria-pressed','false');$('sample-bg-help').textContent=pick?'Click the background in the original photo. Press Escape to cancel.':'';draw(true);break;
 }
 case 'film-portrait-focus':{
  $('film-sample-bg')?.setAttribute('aria-pressed','false');if($('sample-bg-help'))$('sample-bg-help').textContent='';draw(true);
  const on=el.getAttribute('aria-pressed')!=='true';el.setAttribute('aria-pressed',String(on));
  $('portrait-focus-help').textContent=on?'Click a detail on the canvas.':'Placement cancelled.';break;
 }
 case 'film-surprise':{const pool=ids();if(pool.length)apply(pool[Math.floor(Math.random()*pool.length)]);break}
 case 'film-restore':if(last){if(base)restoreLast();else{restoreOnOpen=true;$('file').click()}}break;
 case 'film-wb-pick':{
  const on=el.getAttribute('aria-pressed')!=='true';el.setAttribute('aria-pressed',String(on));
  $('wb-status').textContent=on?'Click a neutral patch on the image.':'Sampling cancelled.';break;
 }
 case 'film-wb-clear':command(()=>{state.wb=null;thumbs.clear()});break;
 case 'film-detail-reset':command(()=>{state.detail=defaultDetail();thumbs.clear()});break;
 case 'film-seed':command(()=>{state.n.seed=1+Math.floor(Math.random()*100000)});break;
 case 'film-reset-grain':if(state.id>=0)command(()=>{state.n=grainForRecipe(state.id);state.n.amt*=state.k/100;delete state.grainAmount});break;
 case 'film-reset-grade':command(()=>{const def=defaults();state.a=def.a;state.f=def.f;state.id=-1});break;
 case 'film-reset-finish':command(()=>{const def=defaults();state.g=def.g;state.n=def.n;state.id=-1});break;
 case 'film-choose':(base?$('film-file'):$('file')).click();break;
 case 'film-samples':$('film-sample-list').hidden=!$('film-sample-list').hidden;break;
 case 'film-delete':setSecond(null);break;
 case 'film-swap':swapBase();break;
 case 'film-placement':command(()=>Object.assign(state.d,{fit:0,sc:100,rot:0,fx:0,fy:0,ox:0,oy:0}));break;
 case 'film-uncrop':command(()=>Object.assign(state.d,{cl:0,cr:0,ct:0,cb:0}));break;
 }
};
function reset(newDoc=false,keepPending=false){previewSubject=false;gesture=null;secondRequest++;if(!keepPending)state=defaults();second=null;anchor=null;if(newDoc){maskBank=[];maskChoice=0;layoutOrigin=null;paper=null}cached=null;thumbSource=null;thumbs.clear();thumbJob++;if(!newDoc||tab==='film')build()}
$('film-off').onclick=()=>command(()=>{state=defaults()});
function filmRows(q){
 return PR.map((p,i)=>({p,i})).filter(({p})=>(p[0]+' '+p[1]+' film').toLowerCase().includes(q.trim().toLowerCase())).map(({p,i})=>'<button class="p'+(i===state.id?' on':'')+'" data-film="'+i+'">'+esc(p[0])+'</button>').join('');
}
function openRecipe(id){document.querySelector('[data-t="film"]').click();category=PR[id][1];section='presets';apply(id)}
function swapBase(){
 if(!base||!second)return;const old=asCanvas(base),k=Math.min(1,+$('mx').value/Math.max(second.width,second.height)),cv=bc(Math.max(1,Math.round(second.width*k)),Math.max(1,Math.round(second.height*k)));
 cv.getContext('2d').drawImage(second,0,0,cv.width,cv.height);pushU(documentSnapshot());const dx=(cv.width-W)/2,dy=(cv.height-H)/2;
 layers.forEach(l=>{l.x+=dx;l.y+=dy});base=read(cv);orig=new ImageData(new Uint8ClampedArray(base.data),base.width,base.height);sel=null;second=old;anchor=null;layoutOrigin=null;paper=null;
 Object.assign(state.d,{sc:100,rot:0,ox:0,oy:0,cl:0,cr:0,ct:0,cb:0});syncDocument();save();build();
}
function documentSnapshot(withTone=false){
 const doc=cropSnap(),props=mkSnap('p'),grade=snapshot(withTone);
 return ()=>{const redo=documentSnapshot(withTone);doc();props();grade();syncDocument();return redo}
}
function syncDocument(){
 W=base.width;H=base.height;c.width=W;c.height=H;outIm=null;fcache=null;cdirty=true;SCR.clear();jit=null;cached=null;thumbSource=null;thumbs.clear();
 if(tab==='crop'){CR=cropInit();cropInfo()}if(zoomV)c.style.width=W*zoomV+'px';extract();updInfo();refreshLayers();draw();
}
function moveDocument(matrix,w,h,frame,step,record=true){
 if(!base)return;if(record)pushU(documentSnapshot());
 function transform(data,fill){
  const cv=bc(w,h),g=cv.getContext('2d');
  if(fill){g.fillStyle=fill;g.fillRect(0,0,w,h)}
  g.setTransform(matrix);if(fill)g.clearRect(0,0,W,H);g.drawImage(asCanvas(data),0,0);return read(cv);
 }
 transformSpace(matrix,w,h,frame,step);
 base=transform(base,frame);orig=transform(orig,frame);
 if(sel){const im=new ImageData(W,H);for(let i=0;i<sel.length;i++)im.data[i*4+3]=sel[i];const data=transform(im).data;sel=new Uint8Array(w*h);for(let i=0;i<sel.length;i++)sel[i]=data[i*4+3]}
 repositionLayers(matrix);rememberPixels();syncDocument();build();
}
function repositionLayers(matrix){
 const mirrored=matrix.a*matrix.d-matrix.b*matrix.c<0;
 for(const l of layers){const p=matrix.transformPoint(new DOMPoint(l.x,l.y)),v=matrix.transformPoint(new DOMPoint(Math.cos(l.r),Math.sin(l.r),0,0));l.x=p.x;l.y=p.y;l.s*=Math.hypot(v.x,v.y);l.r=Math.atan2(v.y,v.x)+(mirrored?Math.PI:0);if(mirrored)l.fl=!l.fl}
}
function paintFrame(g,rect){
 if(!paper)return;
 g.save();if(rect){g.beginPath();g.rect(rect[0],rect[1],rect[2]-rect[0],rect[3]-rect[1]);g.clip()}
 g.globalCompositeOperation='destination-out';g.drawImage(paper.mask,0,0);
 g.globalCompositeOperation='source-over';g.drawImage(paper.color,0,0);g.restore();
}
function transformSpace(matrix,w,h,frame,step){
 transformBank(matrix,w,h);
 transformMasks(matrix,W,H,w,h);
 if(paper||frame){
  function marginCanvas(previous,fill){
   const canvas=bc(w,h),g=canvas.getContext('2d');
   if(fill){g.fillStyle=fill;g.fillRect(0,0,w,h)}
   g.setTransform(matrix);if(fill)g.clearRect(0,0,W,H);if(previous)g.drawImage(previous,0,0);return canvas;
  }
  paper={color:marginCanvas(paper?.color,frame),mask:marginCanvas(paper?.mask,frame?'#fff':null)};
 }
 if(second){const prior=anchor||{w:W,h:H,m:new DOMMatrix()};anchor={...prior,m:matrix.multiply(prior.m)}}
 const start=layoutOrigin||{base,orig,selection:sel?.slice(),w:W,h:H,m:new DOMMatrix()};
 layoutOrigin={...start,steps:[...(start.steps||[]),step],base:layoutOrigin?recoverBase(start):base,m:matrix.multiply(start.m)};
}
function rememberPixels(){if(layoutOrigin){layoutOrigin={...layoutOrigin,reference:new Uint8ClampedArray(base.data)};save()}}
function recoverBase(original){
 const old=original.reference;
 if(!old)return original.base;
 const current=new Uint32Array(base.data.buffer,base.data.byteOffset,base.data.length/4),prior=new Uint32Array(old.buffer,old.byteOffset,old.length/4);
 let delta,mask;
 for(let i=0;i<current.length;i++)if(current[i]!==prior[i]){
  if(!delta){delta=new ImageData(W,H);mask=new ImageData(W,H)}
  delta.data.set(base.data.subarray(i*4,i*4+4),i*4);mask.data[i*4+3]=255;
 }
 if(!delta)return original.base;
 const restored=asCanvas(original.base),g=restored.getContext('2d');
 g.setTransform(original.m.inverse());g.globalCompositeOperation='destination-out';g.drawImage(asCanvas(mask),0,0);
 g.globalCompositeOperation='source-over';g.drawImage(asCanvas(delta),0,0);return read(restored);
}
function restoreLayout(){
 const original=layoutOrigin;if(!original)return;
 const back=original.m.inverse(),restored=recoverBase(original);
 let selection=null;
 if(sel){const out=bc(original.w,original.h),sg=out.getContext('2d'),initial=new ImageData(original.w,original.h);
  if(original.selection)for(let i=0;i<original.selection.length;i++)initial.data[i*4+3]=original.selection[i];
  sg.putImageData(initial,0,0);sg.setTransform(back);sg.clearRect(0,0,W,H);const im=new ImageData(W,H);for(let i=0;i<sel.length;i++)im.data[i*4+3]=sel[i];sg.drawImage(asCanvas(im),0,0);
  const data=read(out).data;selection=new Uint8Array(original.w*original.h);for(let i=0;i<selection.length;i++)selection[i]=data[i*4+3];
 }
 transformBank(back,original.w,original.h);transformMasks(back,W,H,original.w,original.h);repositionLayers(back);if(second){const prior=anchor||{w:W,h:H,m:new DOMMatrix()};anchor={...prior,m:back.multiply(prior.m)}}
 base=new ImageData(new Uint8ClampedArray(restored.data),restored.width,restored.height);orig=original.orig;sel=selection;layoutOrigin=null;paper=null;syncDocument();
}
function geometry(action,tilt=+$('film-angle').value,record=true){
 if(!base)return;const turn=action==='left'||action==='right',angle=turn?(action==='left'?-90:90):action==='straighten'?tilt:0;
 const w=turn?H:W,h=turn?W:H,r=Math.abs(angle)*Math.PI/180,zoom=action==='straighten'?Math.cos(r)+Math.sin(r)*Math.max(W/H,H/W):1;
 if(action==='straighten'&&!angle)return;
 const m=new DOMMatrix().translate(w/2,h/2).rotate(angle).scale((action==='flip-x'?-1:1)*zoom,(action==='flip-y'?-1:1)*zoom).translate(-W/2,-H/2);
 moveDocument(m,w,h,null,{kind:'orient',action,angle},record);$('film-angle').value=0;$('film-angle-value').value='0°';
}
document.querySelectorAll('[data-film-geometry]').forEach(b=>b.onclick=()=>geometry(b.dataset.filmGeometry));
$('film-angle').oninput=e=>$('film-angle-value').value=e.target.value+'°';
const frameSides=['top','right','bottom','left'].map(n=>$('outside-'+n));
frameSides.forEach(el=>el.oninput=()=>{if($('outside-link').checked)frameSides.forEach(v=>v.value=el.value)});
$('outside-link').onchange=()=>{if($('outside-link').checked)frameSides.forEach(v=>v.value=frameSides[0].value)};
function expandFrame(step,record=true){
 const scale=step.unit==='percent'?Math.min(W,H)/100:1;
 const [t,r,b,l]=step.sides.map(v=>Math.round(Math.max(0,Number(v)||0)*scale));
 if(!t&&!r&&!b&&!l)return;
 const w=W+l+r,h=H+t+b;if(w>8192||h>8192||w*h>18000000){$('outside-status').textContent='Reduce the margins to fit the working canvas.';return}
 $('outside-status').textContent='';moveDocument(new DOMMatrix().translate(l,t),w,h,rgba(step.color,step.opacity/100),step,record);
}
$('outside-apply').onclick=()=>{if(base)expandFrame({kind:'frame',sides:frameSides.map(el=>+el.value),unit:$('outside-unit').value,color:$('outside-color').value,opacity:+$('outside-opacity').value})};
function restoreLast(){
 if(!base||!last)return;
 const {geometry:steps=[],...look}=structuredClone(last);
 pushU(documentSnapshot(true));
 if(!keepLayout&&layoutOrigin)restoreLayout();
 if(!layoutOrigin&&Array.isArray(steps))for(const step of steps){
  if(step?.kind==='orient')geometry(step.action,step.angle,false);
  if(step?.kind==='frame'&&Array.isArray(step.sides))expandFrame(step,false);
  if(step?.kind==='crop'){const x=Math.min(W-1,Math.max(0,Math.round(step.x*W))),y=Math.min(H-1,Math.max(0,Math.round(step.y*H))),w=Math.max(1,Math.min(W-x,Math.round(step.w*W))),h=Math.max(1,Math.min(H-y,Math.round(step.h*H)));
   moveDocument(new DOMMatrix().translate(-x,-y),w,h,null,step,false)}
 }
 look.detail=validDetail(look.detail)?look.detail:defaultDetail();look.d={...portraitDefaults,...look.d};state=look;thumbs.clear();$('gradient-enabled').checked=false;save();changed(true);
}
function afterOpen(){if(suiteReady)queueDraft();if(restoreOnOpen){restoreOnOpen=false;restoreLast()}}
$('outside-picker').onclick=async()=>{try{$('outside-color').value=(await new EyeDropper().open()).sRGBHex}catch{}};
$('outside-picker').hidden=!window.EyeDropper;
$('outside-jump').onclick=()=>{document.querySelector('[data-t="crop"]').click();$('outside-frame').open=true;$('outside-frame').scrollIntoView({block:'nearest'})};
$('film-sample').onclick=async()=>{const source=sampleCity();await load(await toBlob(source,'image/png'));build()};
let drag=null,wheelTimer=0,lastTap=0;
const pointers=new Map();
function updatePlacementControl(key){const input=pane.querySelector('[data-group="d"][data-key="'+key+'"]');if(input){input.value=state.d[key];input.nextElementSibling.value=Math.round(state.d[key])}}
function finishPlacement(){save();build();showP($('q').value.toLowerCase())}
function zoomAt(factor,x,y){if(!base)return;const current=zoomV||c.getBoundingClientRect().width/W;applyZoom(Math.min(12,Math.max(.08,current*factor)),x,y)}
function toggleZoom(e){if(zoomV){$('zoom').value='0';$('zoom').onchange()}else applyZoom(1,e.clientX,e.clientY)}
c.addEventListener('dblclick',e=>{if(tab==='film'&&base)toggleZoom(e)});
c.addEventListener('pointerdown',e=>{
 if(tab!=='film'||!base||spaceDown||e.button!==0)return;
 if(section==='detail'&&$('film-wb-pick')?.getAttribute('aria-pressed')==='true'){
  const [x,y]=pos(e),src=$('lgrade').checked&&layers.length?flat():base;
  const sums=[0,0,0];let total=0;
  for(let yy=Math.max(0,Math.floor(y)-2);yy<=Math.min(H-1,Math.floor(y)+2);yy++)for(let xx=Math.max(0,Math.floor(x)-2);xx<=Math.min(W-1,Math.floor(x)+2);xx++){
   const i=4*(yy*W+xx),weight=src.data[i+3]/255;
   for(let ch=0;ch<3;ch++)sums[ch]+=weight*toLinear(src.data[i+ch]/255);total+=weight;
  }
  const gray=(.2126*sums[0]+.7152*sums[1]+.0722*sums[2])/(total||1);
  if(!total||gray<.006||Math.max(...sums)/total>.985){$('wb-status').textContent='Choose a visible patch with detail, away from black or clipped highlights.';return}
  command(()=>{state.wb=sums.map(v=>Math.max(.125,Math.min(8,gray*total/Math.max(.0001,v))));thumbs.clear()});return;
 }
 if(section==='double'&&$('film-sample-bg')?.getAttribute('aria-pressed')==='true'){
  const [x,y]=pos(e),src=$('lgrade').checked&&layers.length?flat():base;
  let r=0,g=0,b=0,n=0;
  for(let yy=Math.max(0,Math.floor(y)-1);yy<=Math.min(H-1,Math.floor(y)+1);yy++)for(let xx=Math.max(0,Math.floor(x)-1);xx<=Math.min(W-1,Math.floor(x)+1);xx++){
   const i=(yy*W+xx)*4,alpha=src.data[i+3]/255;r+=src.data[i]*alpha;g+=src.data[i+1]*alpha;b+=src.data[i+2]*alpha;n+=alpha;
  }
  if(!n){$('sample-bg-help').textContent='Choose a visible background colour, or use Transparency.';return}
  command(()=>{Object.assign(state.d,{keyR:Math.round(r/n),keyG:Math.round(g/n),keyB:Math.round(b/n)});state.id=-1});return;
 }
 if(section==='double'&&$('film-portrait-focus')?.getAttribute('aria-pressed')==='true'){
  let point=new DOMPoint(...pos(e));if(anchor)point=anchor.m.inverse().transformPoint(point);
  command(()=>{state.d.faceX=Math.round(100*clamp(point.x/(anchor?.w||W)));state.d.faceY=Math.round(100*clamp(point.y/(anchor?.h||H)));state.id=-1});
  return;
 }
 c.setPointerCapture(e.pointerId);pointers.set(e.pointerId,[e.clientX,e.clientY]);
 if(pointers.size===2){if(drag?.changed&&drag.exposure)finishPlacement();drag=null;return}
 drag={start:[e.clientX,e.clientY],last:[e.clientX,e.clientY],exposure:section==='double'&&second&&state.d.on,ox:state.d.ox,oy:state.d.oy,changed:false};
});
c.addEventListener('pointermove',e=>{
 if(!pointers.has(e.pointerId))return;const before=pointers.get(e.pointerId);
 pointers.set(e.pointerId,[e.clientX,e.clientY]);
 if(pointers.size===2){const other=[...pointers.entries()].find(([id])=>id!==e.pointerId)[1],distance=Math.hypot(before[0]-other[0],before[1]-other[1]);if(distance>1)zoomAt(Math.hypot(e.clientX-other[0],e.clientY-other[1])/distance,(e.clientX+other[0])/2,(e.clientY+other[1])/2);return}
 if(!drag)return;const dx=e.clientX-drag.start[0],dy=e.clientY-drag.start[1];
 if(!drag.changed&&Math.hypot(dx,dy)<2)return;
 if(drag.exposure){
  if(!drag.changed)pushU(snapshot());
  const box=c.getBoundingClientRect(),reference=anchor||{w:W,h:H,m:new DOMMatrix()};
  const delta=reference.m.inverse().transformPoint(new DOMPoint(dx*W/box.width,dy*H/box.height,0,0));
  state.d.ox=Math.max(-100,Math.min(100,drag.ox+100*delta.x/reference.w));state.d.oy=Math.max(-100,Math.min(100,drag.oy+100*delta.y/reference.h));
  updatePlacementControl('ox');updatePlacementControl('oy');cached=null;draw(true);
 }else{stage.scrollLeft-=e.clientX-drag.last[0];stage.scrollTop-=e.clientY-drag.last[1]}
 drag.changed=true;drag.last=[e.clientX,e.clientY];
});
function endFilmPointer(e){if(!pointers.has(e.pointerId))return;pointers.delete(e.pointerId);if(drag?.exposure&&drag.changed)finishPlacement();
 if(drag&&!drag.changed&&e.type==='pointerup'&&e.pointerType==='touch'){const now=performance.now();if(lastTap&&now-lastTap<300)toggleZoom(e);lastTap=now}drag=null}
c.addEventListener('pointerup',endFilmPointer);c.addEventListener('pointercancel',endFilmPointer);
stage.addEventListener('wheel',e=>{
 if(tab!=='film'||!base||e.ctrlKey||e.metaKey)return;e.preventDefault();
 if(e.altKey&&section==='double'&&second&&state.d.on){
  if(!wheelTimer)pushU(snapshot());clearTimeout(wheelTimer);state.d.sc=Math.min(400,Math.max(10,state.d.sc*Math.exp(-e.deltaY*.002)));updatePlacementControl('sc');cached=null;draw(true);
  wheelTimer=setTimeout(()=>{wheelTimer=0;finishPlacement()},240);
 }else zoomAt(Math.exp(-e.deltaY*.0015),e.clientX,e.clientY);
},{passive:false});
document.addEventListener('keydown',e=>{
 if(e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey||e.target.matches('input,select,textarea,[contenteditable=true]')||!exp.hidden||!help.hidden||typeEditor.open)return;
 const k=e.key.toLowerCase(),r=c.getBoundingClientRect();
 if(k==='o')$('open').click();else if(k==='e')openExp();else if(k==='f')document.querySelector('[data-t="film"]').click();
 else if(k==='d')film.focusDouble();else if(k==='?')$('helpb').click();else if(k==='0'){$('zoom').value='0';$('zoom').onchange()}
 else if(k==='+'||k==='='||k==='-'){e.preventDefault();zoomAt(k==='-'?.8:1.25,r.x+r.width/2,r.y+r.height/2)}
 else if(k==='\\'&&base){e.preventDefault();showOrig=true;draw(true)}
});
const releaseCompare=()=>{if(showOrig){showOrig=false;draw(true)}};
document.addEventListener('keyup',e=>{if(e.key==='\\')releaseCompare()});window.addEventListener('blur',releaseCompare);


let curveChannel='master',pointIndex=0,zoneKey='shadows',gradingGesture=null,curvePointer=null,wheelPointer=null;
const graphColors={master:'#e5ecf8',red:'#ff797f',green:'#70dbaf',blue:'#74a9ff'};
const scopeSample=bc(1,1),sampleContext=scopeSample.getContext('2d',{willReadFrequently:true});
let scopeBins=null,wheelTexture=null;
const currentGrade=()=>state.grading||neutralGrade();
function mutateGrade(key,fn){
 if(gradingGesture!==key){if(base)pushU(snapshot());gradingGesture=key}
 state.grading??=neutralGrade();fn(state.grading);state.id=-1;cached=null;draw(true);syncGrade();
}
function finishGradeEdit(){
 if(!gradingGesture)return;gradingGesture=null;save();showP($('q').value.toLowerCase());
}
function singleGrade(key,fn){finishGradeEdit();mutateGrade(key,fn);finishGradeEdit()}
function gridLines(g,w,h,padding=0){
 g.strokeStyle='#33405a';g.lineWidth=1;g.beginPath();
 for(let k=0;k<=4;k++){const x=padding+(w-2*padding)*k/4,y=padding+(h-2*padding)*k/4;
  g.moveTo(x,padding);g.lineTo(x,h-padding);g.moveTo(padding,y);g.lineTo(w-padding,y)}
 g.stroke();
}
function plotHistogram(g,bins,keys,peak,w,h,padding=0,opacity=.47){
 if(!peak)return;
 g.save();g.globalCompositeOperation='screen';g.globalAlpha=opacity;
 for(const key of keys){
  g.beginPath();g.moveTo(padding,h-padding);
  for(let i=0;i<256;i++)g.lineTo(padding+(w-2*padding)*i/255,h-padding-(h-2*padding)*Math.sqrt(bins[key][i]/peak));
  g.lineTo(w-padding,h-padding);g.closePath();g.fillStyle=graphColors[key];g.fill();
 }
 g.restore();
}
function updateScopes(){
 if(tab!=='grade')return;
 const plot=$('scope-plot'),g=plot.getContext('2d'),w=plot.width,h=plot.height,kind=$('scope-kind').value;
 g.fillStyle='#10192b';g.fillRect(0,0,w,h);gridLines(g,w,h);
 if(!base){scopeBins=null;$('scope-info').textContent='Open an image to see its light distribution.';paintCurve();return}
 const ratio=Math.min(1,360/W,240/H),sw=Math.max(1,Math.round(W*ratio)),sh=Math.max(1,Math.round(H*ratio));
 if(scopeSample.width!==sw||scopeSample.height!==sh){scopeSample.width=sw;scopeSample.height=sh}
 sampleContext.clearRect(0,0,sw,sh);sampleContext.imageSmoothingEnabled=false;sampleContext.drawImage($('scope-source').value==='original'?overlaySourceCanvas():c,0,0,sw,sh);
 const pixels=sampleContext.getImageData(0,0,sw,sh).data,bins=Object.fromEntries(curveKeys.map(k=>[k,new Float32Array(256)]));
 const wave=kind==='wave'?new Float32Array(sw*96):null;let weight=0;
 for(let i=0;i<pixels.length;i+=4){
  const alpha=pixels[i+3]/255;if(!alpha)continue;
  const r=pixels[i],green=pixels[i+1],b=pixels[i+2],v=Math.round(.2126*r+.7152*green+.0722*b);
  bins.master[v]+=alpha;bins.red[r]+=alpha;bins.green[green]+=alpha;bins.blue[b]+=alpha;weight+=alpha;
  if(wave)wave[(95-Math.round(v*95/255))*sw+(i/4)%sw]+=alpha;
 }
 scopeBins=bins;
 if(wave){
  const density=bc(sw,96),dg=density.getContext('2d'),im=dg.createImageData(sw,96);let max=1;for(const v of wave)max=Math.max(max,v);
  for(let i=0;i<wave.length;i++){im.data[4*i]=135;im.data[4*i+1]=235;im.data[4*i+2]=204;im.data[4*i+3]=255*(wave[i]/max)**.36}
  dg.putImageData(im,0,0);g.drawImage(density,0,0,w,h);
 }else{
  const keys=kind==='luma'?['master']:curveKeys.slice(1),peak=Math.max(...keys.map(k=>Math.max(...bins[k])));
  plotHistogram(g,bins,keys,peak,w,h,0,kind==='luma'?.76:.68);
 }
 $('scope-info').textContent=weight?'Luma 0 · '+(100*bins.master[0]/weight).toFixed(1)+'%　 Luma 255 · '+(100*bins.master[255]/weight).toFixed(1)+'%':'The canvas is transparent.';
 plot.setAttribute('aria-label',$('scope-kind').selectedOptions[0].textContent+'. '+$('scope-info').textContent);paintCurve();
}
function paintCurve(){
 const cv=$('curve-plot'),g=cv.getContext('2d'),w=cv.width,h=cv.height,pad=12,points=currentGrade().curves[curveChannel],table=curveTable(points);
 const px=x=>pad+(w-pad*2)*x/255,py=y=>h-pad-(h-pad*2)*y;
 g.fillStyle='#10192b';g.fillRect(0,0,w,h);
 if(scopeBins)plotHistogram(g,scopeBins,[curveChannel],Math.max(...scopeBins[curveChannel]),w,h,pad,.18);
 gridLines(g,w,h,pad);g.strokeStyle='#71809a';g.setLineDash([4,6]);g.beginPath();g.moveTo(px(0),py(0));g.lineTo(px(255),py(1));g.stroke();g.setLineDash([]);
 g.strokeStyle=graphColors[curveChannel];g.lineWidth=3;g.beginPath();for(let i=0;i<256;i++){if(i)g.lineTo(px(i),py(table[i]));else g.moveTo(px(i),py(table[i]))}g.stroke();
 points.forEach(([x,y],i)=>{g.beginPath();g.arc(px(x),py(y/255),i===pointIndex?7:5,0,2*Math.PI);g.fillStyle=i===pointIndex?'#ffc768':'#10192b';g.fill();g.lineWidth=2;g.stroke()});
}
function wheelBackground(){
 if(wheelTexture)return wheelTexture;
 const cv=$('grade-wheel'),size=cv.width,center=size/2,radius=center-10;
 wheelTexture=bc(size,size);const g=wheelTexture.getContext('2d'),im=g.createImageData(size,size);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const dx=x-center,dy=center-y,sat=Math.hypot(dx,dy)/radius;if(sat>1)continue;
  const rgb=hueColor((Math.atan2(dy,dx)*180/Math.PI+360)%360),i=(y*size+x)*4;
  for(let k=0;k<3;k++)im.data[i+k]=170+(242*rgb[k]-170)*sat;
  im.data[i+3]=255*Math.min(1,(1-sat)*radius);
 }
 g.putImageData(im,0,0);return wheelTexture;
}
function paintWheel(z){
 const cv=$('grade-wheel'),g=cv.getContext('2d'),center=cv.width/2,r=center-10,theta=z.hue*Math.PI/180;
 g.clearRect(0,0,cv.width,cv.height);g.drawImage(wheelBackground(),0,0);
 g.strokeStyle='#ffffff66';g.lineWidth=1;g.beginPath();g.arc(center,center,r/2,0,2*Math.PI);g.stroke();
 g.beginPath();g.arc(center+Math.cos(theta)*r*z.sat/100,center-Math.sin(theta)*r*z.sat/100,6,0,2*Math.PI);g.lineWidth=4;g.strokeStyle='#172133';g.stroke();g.lineWidth=2;g.strokeStyle='white';g.stroke();
}
function syncGrade(){if(suiteReady)syncReference();
 studioGradeUI();const grade=currentGrade(),points=grade.curves[curveChannel];pointIndex=Math.min(Math.max(0,pointIndex),points.length-1);
 $('grading-on').checked=grade.on!==false;$('curve-add').disabled=points.length>=32;
 const select=$('curve-point');if(select.length!==points.length)select.replaceChildren(...points.map((_,i)=>new Option('Point '+(i+1),i)));
 select.value=pointIndex;const [x,y]=points[pointIndex],endpoint=!pointIndex||pointIndex===points.length-1;
 $('curve-in').value=x;$('curve-out').value=y;$('curve-in').disabled=endpoint;$('curve-remove').disabled=endpoint;
 $('curve-in').min=endpoint?0:points[pointIndex-1][0]+1;$('curve-in').max=endpoint?255:points[pointIndex+1][0]-1;
 const zone=grade.zones[zoneKey];for(const k of ['hue','sat','lum','balance','mix']){const input=$('zone-'+k),v=k==='mix'||k==='balance'?grade[k]:zone[k];input.value=v;input.nextElementSibling.value=v+(k==='hue'?'°':'%')}
 for(const b of $('grade-zones').children)b.setAttribute('aria-pressed',String(b.dataset.zone===zoneKey));
 paintCurve();paintWheel(zone);if(typeof window.onSyncGrade==='function')window.onSyncGrade(grade);
}
function moveCurvePoint(x,y,key){
 const points=currentGrade().curves[curveChannel],i=pointIndex,prior=points[i];
 const nextX=i===0||i===points.length-1?prior[0]:Math.max(points[i-1][0]+1,Math.min(points[i+1][0]-1,Math.round(x)));
 const nextY=Math.max(0,Math.min(255,Math.round(y)));if(nextX===prior[0]&&nextY===prior[1])return;
 mutateGrade(key,s=>{s.curves[curveChannel][i]=[nextX,nextY]});
}
function graphXY(event){
 const cv=$('curve-plot'),r=cv.getBoundingClientRect(),x=(event.clientX-r.left)*cv.width/r.width,y=(event.clientY-r.top)*cv.height/r.height;
 return [Math.round(255*clamp((x-12)/(cv.width-24))),Math.round(255*clamp(1-(y-12)/(cv.height-24)))];
}
const curveCanvas=$('curve-plot');
curveCanvas.onpointerdown=e=>{
 if(e.button!==0||curvePointer!==null)return;
 const [x,y]=graphXY(e),pts=currentGrade().curves[curveChannel],r=curveCanvas.getBoundingClientRect();
 let nearest=-1,dist=12;
 pts.forEach(([a,b],i)=>{const d=Math.hypot((x-a)*r.width/255,(y-b)*r.height/255);if(d<=dist){nearest=i;dist=d}});
 if(nearest<0){
  const same=pts.findIndex(p=>p[0]===x);if(same>=0)nearest=same;
  else{if(pts.length>=32)return;pointIndex=pts.findIndex(p=>p[0]>x);mutateGrade('curve-drag',s=>s.curves[curveChannel].splice(pointIndex,0,[x,y]));nearest=pointIndex}
 }
 pointIndex=nearest;curvePointer=e.pointerId;curveCanvas.focus({preventScroll:true});curveCanvas.setPointerCapture(e.pointerId);syncGrade();
};
curveCanvas.onpointermove=e=>{if(curvePointer===e.pointerId)moveCurvePoint(...graphXY(e),'curve-drag')};
function endCurve(e){if(e.pointerId===curvePointer){curvePointer=null;finishGradeEdit()}}
curveCanvas.onpointerup=curveCanvas.onpointercancel=curveCanvas.onlostpointercapture=endCurve;
$('curve-channel').onchange=e=>{finishGradeEdit();curveChannel=e.target.value;pointIndex=0;syncGrade()};
$('curve-point').onchange=e=>{pointIndex=+e.target.value;syncGrade()};
for(const id of ['curve-in','curve-out'])$(id).onchange=()=>{moveCurvePoint(+$('curve-in').value,+$('curve-out').value,'curve-fields');finishGradeEdit();syncGrade()};
$('curve-add').onclick=()=>{
 const points=currentGrade().curves[curveChannel];if(points.length>=32)return;
 let end=1;for(let i=2;i<points.length;i++)if(points[i][0]-points[i-1][0]>points[end][0]-points[end-1][0])end=i;
 const x=Math.round((points[end][0]+points[end-1][0])/2),y=Math.round(curveTable(points)[x]*255);
 singleGrade('add-point',s=>{s.curves[curveChannel].splice(end,0,[x,y]);pointIndex=end});curveCanvas.focus({preventScroll:true});
};
$('curve-remove').onclick=()=>{const pts=currentGrade().curves[curveChannel];if(pointIndex>0&&pointIndex<pts.length-1)singleGrade('remove',s=>{s.curves[curveChannel].splice(pointIndex--,1)})};
$('curve-reset').onclick=()=>singleGrade('reset-channel',s=>{s.curves[curveChannel]=neutralCurve();pointIndex=0});
const curvesByName={contrast:[[0,0],[60,46],[128,128],[192,208],[255,255]],matte:[[0,25],[70,75],[180,178],[255,244]],shoulder:[[0,0],[116,116],[192,183],[255,227]],negative:[[0,255],[255,0]]};
$('curve-look').onchange=e=>{if(curvesByName[e.target.value])singleGrade('curve-look',s=>{s.curves[curveChannel]=structuredClone(curvesByName[e.target.value]);pointIndex=0});e.target.value=''};
curveCanvas.onkeydown=e=>{const p=currentGrade().curves[curveChannel][pointIndex],step=e.shiftKey?10:1;
 const delta={ArrowUp:[0,step],ArrowDown:[0,-step],ArrowLeft:[-step,0],ArrowRight:[step,0]}[e.key];
 if(delta){e.preventDefault();moveCurvePoint(p[0]+delta[0],p[1]+delta[1],'curve-key');finishGradeEdit()}
 if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();$('curve-remove').click()}
};
$('grade-zones').onclick=e=>{if(e.target.dataset.zone){finishGradeEdit();zoneKey=e.target.dataset.zone;syncGrade()}};
for(const key of ['hue','sat','lum','balance','mix']){
 const el=$('zone-'+key);el.oninput=()=>mutateGrade(el,s=>{(key==='mix'||key==='balance'?s:s.zones[zoneKey])[key]=+el.value});el.onchange=el.onblur=finishGradeEdit;
}
const wheel=$('grade-wheel');
function pickWheel(e){
 const r=wheel.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=.5-(e.clientY-r.top)/r.height;
 const sat=Math.round(100*clamp(Math.hypot(x,y)/(.5-10/wheel.width))),hue=(Math.round(Math.atan2(y,x)*180/Math.PI)+360)%360;
 mutateGrade('wheel',s=>{const z=s.zones[zoneKey];z.sat=sat;if(sat)z.hue=hue});
}
wheel.onpointerdown=e=>{if(e.button||wheelPointer!==null)return;wheelPointer=e.pointerId;wheel.setPointerCapture(e.pointerId);pickWheel(e)};
wheel.onpointermove=e=>{if(e.pointerId===wheelPointer)pickWheel(e)};
wheel.onpointerup=wheel.onpointercancel=wheel.onlostpointercapture=e=>{if(e.pointerId===wheelPointer){wheelPointer=null;finishGradeEdit()}};
wheel.onkeydown=e=>{
 const delta={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,1],ArrowDown:[0,-1]}[e.key];if(!delta)return;
 e.preventDefault();const step=e.shiftKey?10:1;
 singleGrade('wheel-key',s=>{const z=s.zones[zoneKey];z.hue=(360+z.hue+delta[0]*step)%360;z.sat=Math.max(0,Math.min(100,z.sat+delta[1]*step))});
};
$('grading-on').onchange=e=>singleGrade('grade-switch',s=>{s.on=e.target.checked});
const wheelLooks={teal:[[193,45,0],[25,8,0],[41,37,0]],rose:[[262,32,0],[336,14,1],[23,34,3]],night:[[225,38,-6],[211,23,-3],[185,16,0]]};
$('zone-look').onchange=e=>{const look=wheelLooks[e.target.value];if(look)singleGrade('zone-look',s=>{zoneKeys.forEach((k,i)=>{const [hue,sat,lum]=look[i];s.zones[k]={hue,sat,lum}});s.mix=100;s.balance=0});e.target.value=''};
$('zone-reset').onclick=()=>singleGrade('zone-reset',s=>{s.zones[zoneKey]=neutralZone()});
$('grade-reset').onclick=()=>singleGrade('grade-reset',s=>{s.curves=neutralGrade().curves;s.zones=neutralGrade().zones;s.balance=0;s.mix=100;s.on=true;s.bands=[];s.masks=[];pointIndex=0});
$('scope-kind').onchange=$('scope-source').onchange=()=>{if(base)draw(true);else updateScopes()};
function openGrade(){document.querySelector('[data-t="grade"]').click()}
$('adjust-grading').onclick=$('film-grading').onclick=openGrade;


const hueBands=[['Red',0],['Orange',30],['Yellow',60],['Green',120],['Aqua',170],['Blue',225],['Purple',275],['Magenta',318]];
let selectedBand=0,selectedMask=0,gradePick=false,maskPlace=false,maskDrag=null;
function rgbHue(r,g,b){
 const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;if(!d)return 0;
 return (360+60*(max===r?(g-b)/d:max===g?2+(b-r)/d:4+(r-g)/d))%360;
}
function compileMixer(bands){
 if(!bands?.some(b=>b.h||b.s||b.l))return null;
 const table=new Float32Array(360*3);for(let h=0;h<360;h++)for(const band of bands){
  const diff=Math.abs((h-band.center+540)%360-180),weight=1-smooth(0,Math.max(1,band.width),diff);
  table[h*3]+=band.h*weight;table[h*3+1]+=band.s*weight/100;table[h*3+2]+=band.l*weight/100;
 }
 return table;
}
function mixRGB(r,g,b,table,out){
 const high=Math.max(r,g,b),low=Math.min(r,g,b),chroma=high-low;if(chroma<.001){out[0]=r;out[1]=g;out[2]=b;return}
 const hue=rgbHue(r,g,b),i=Math.round(hue)%360*3,light=(high+low)/2,sat=chroma/(1-Math.abs(2*light-1)||1);
 const h=(hue+table[i]+720)%360,l=clamp(light+table[i+2]*Math.min(sat,1)*.45),s=clamp(sat*(1+table[i+1])+Math.max(0,table[i+1])*(1-sat)*Math.min(1,sat*3));
 const c=(1-Math.abs(2*l-1))*s,k=h/60,x=c*(1-Math.abs(k%2-1)),m=l-c/2;
 out[0]=m+(k<1||k>=5?c:k<2||k>=4?x:0);out[1]=m+(k<1?x:k<3?c:k<4?x:0);out[2]=m+(k<2?0:k<3?x:k<5?c:x);
}
function defaultMask(kind){
 return {name:(kind==='radial'?'Radial':'Linear')+' mask',kind,on:true,invert:false,feather:75,x:.5,y:.5,ex:.76,ey:kind==='radial'?.5:.25,aspect:100,exposure:0,warmth:0,tint:0,saturation:0};
}
function prepareMasks(grading,w,h){
 if(grading?.on===false)return [];
 return (grading?.masks||[]).filter(m=>m.on&&(m.exposure||m.warmth||m.tint||m.saturation)).map(m=>{
  const dx=(m.ex-m.x)*w,dy=(m.ey-m.y)*h,len=Math.max(1,Math.hypot(dx,dy));
  return {...m,bitmap:m.kind==='saved'?maskPixels(m.savedId,w,h):null,stride:w,cx:m.x*w,cy:m.y*h,ux:dx/len,uy:dy/len,radius:len,gain:2**m.exposure,sat:1+m.saturation/100,red:m.warmth*.0015+m.tint*.0005,green:-m.tint*.0008,blue:-m.warmth*.0015+m.tint*.0005};
 });
}
function maskWeight(m,x,y){
 if(m.kind==='saved'){const a=(m.bitmap?.[y*m.stride+x]||0)/255;return m.invert?1-a:a}
 const dx=x-m.cx,dy=y-m.cy,u=(dx*m.ux+dy*m.uy)/m.radius,v=(-dx*m.uy+dy*m.ux)/m.radius;
 const feather=Math.max(.002,m.feather/100);let value;
 if(m.kind==='radial')value=1-smooth(1-feather,1,Math.hypot(u,v*100/m.aspect));
 else value=1-smooth(.5-feather/2,.5+feather/2,u);
 return m.invert?1-value:value;
}
function studioGradeUI(){
 const s=currentGrade();const band=s.bands?.[selectedBand]||{center:hueBands[selectedBand][1],width:40,h:0,s:0,l:0};
 $('hsl-band').value=selectedBand;for(const key of ['center','width','h','s','l']){const el=$('hsl-'+key);el.value=band[key];el.nextElementSibling.value=band[key]+(['s','l'].includes(key)?'%':'°')}
 const masks=s.masks||[],list=$('local-list');selectedMask=Math.max(0,Math.min(selectedMask,masks.length-1));
 list.replaceChildren(...masks.map((m,i)=>new Option((i+1)+'. '+m.name+(m.on?'':' · off'),i)));list.value=selectedMask;list.disabled=!masks.length;
 $('local-edit').hidden=!masks.length;if(!masks.length)return;
 const mask=masks[selectedMask];$('mask-place').disabled=mask.kind==='saved';$('mask-feather-row').hidden=mask.kind==='saved';$('mask-name').value=mask.name;$('mask-on').checked=mask.on;$('mask-invert').checked=mask.invert;$('mask-aspect-row').hidden=mask.kind!=='radial';
 for(const key of ['feather','aspect','exposure','warmth','tint','saturation']){const el=$('mask-'+key);el.value=mask[key];el.nextElementSibling.value=mask[key]+(key==='exposure'?' EV':'%')}
}
$('hsl-band').replaceChildren(...hueBands.map(([name],i)=>new Option(name,i)));
$('hsl-band').onchange=e=>{selectedBand=+e.target.value;studioGradeUI()};
function updateBand(s){if(!s.bands?.length)s.bands=hueBands.map(([,center])=>({center,width:40,h:0,s:0,l:0}));return s.bands[selectedBand]}
for(const key of ['center','width','h','s','l']){const el=$('hsl-'+key);el.oninput=()=>mutateGrade(el,s=>{updateBand(s)[key]=+el.value});el.onchange=el.onblur=finishGradeEdit}
$('hsl-reset').onclick=()=>singleGrade('reset-band',s=>{Object.assign(updateBand(s),{center:hueBands[selectedBand][1],width:40,h:0,s:0,l:0})});
function setGradeTool(pick,place){gradePick=pick;maskPlace=place;$('hsl-pick').setAttribute('aria-pressed',pick);$('mask-place').setAttribute('aria-pressed',place);draw(true)}
$('hsl-pick').onclick=()=>setGradeTool(!gradePick,false);
$('mask-place').onclick=()=>setGradeTool(false,!maskPlace);
$('local-list').onchange=e=>{selectedMask=+e.target.value;studioGradeUI();draw(true)};
for(const kind of ['linear','radial'])$('mask-'+kind).onclick=()=>{singleGrade('add-mask',s=>{s.masks??=[];s.masks.push(defaultMask(kind));selectedMask=s.masks.length-1});setGradeTool(false,true)};
$('mask-remove').onclick=()=>singleGrade('delete-mask',s=>s.masks.splice(selectedMask,1));
for(const key of ['feather','aspect','exposure','warmth','tint','saturation']){const el=$('mask-'+key);el.oninput=()=>mutateGrade(el,s=>{s.masks[selectedMask][key]=+el.value});el.onchange=el.onblur=finishGradeEdit}
for(const key of ['on','invert'])$('mask-'+key).onchange=e=>singleGrade(key,s=>{s.masks[selectedMask][key]=e.target.checked});
$('mask-name').onchange=e=>singleGrade('mask-name',s=>{s.masks[selectedMask].name=e.target.value.trim().slice(0,80)||'Mask'});
function maskGuides(){
 if(tab!=='grade'||!maskPlace||!$('local-tools').open)return;const m=currentGrade().masks?.[selectedMask];if(!m)return;
 const x=m.x*W,y=m.y*H,ex=m.ex*W,ey=m.ey*H,k=KK(),rad=Math.hypot(ex-x,ey-y);
 ctx.save();ctx.strokeStyle='#7cdaff';ctx.lineWidth=1.5*k;ctx.setLineDash([4*k,3*k]);ctx.beginPath();
 if(m.kind==='radial'){ctx.ellipse(x,y,rad,rad*m.aspect/100,Math.atan2(ey-y,ex-x),0,Math.PI*2)}
 else{const dx=(ey-y)/(rad||1)*W,dy=(x-ex)/(rad||1)*W;for(const [a,b] of [[x,y],[ex,ey]]){ctx.moveTo(a-dx,b-dy);ctx.lineTo(a+dx,b+dy)}}
 ctx.moveTo(x,y);ctx.lineTo(ex,ey);ctx.stroke();ctx.setLineDash([]);for(const [a,b,col] of [[x,y,'#ffbe65'],[ex,ey,'#fff']]){ctx.fillStyle=col;ctx.beginPath();ctx.arc(a,b,5*k,0,2*Math.PI);ctx.fill();ctx.stroke()}ctx.restore();
}
c.addEventListener('pointerdown',e=>{
 if(tab!=='grade'||!base||e.button||spaceDown)return;const p=pos(e);
 if(gradePick&&$('hsl-tools').open){e.stopImmediatePropagation();const raw=$('lgrade').checked&&layers.length?flat():base,i=4*(Math.min(H-1,Math.max(0,Math.floor(p[1])))*W+Math.min(W-1,Math.max(0,Math.floor(p[0]))));
  const [r,g,b,a]=raw.data.subarray(i,i+4);if(!a||Math.max(r,g,b)-Math.min(r,g,b)<2){$('hsl-msg').textContent='Pick a colored pixel.';return}
  const hue=Math.round(rgbHue(r,g,b))%360;selectedBand=hueBands.map((v,i)=>[Math.abs((v[1]-hue+540)%360-180),i]).sort((a,b)=>a[0]-b[0])[0][1];singleGrade('pick-hue',s=>{updateBand(s).center=hue});$('hsl-msg').textContent='Sampled hue '+hue+'°';setGradeTool(false,false);return;
 }
 const m=currentGrade().masks?.[selectedMask];if(!m||m.kind==='saved'||!maskPlace||!$('local-tools').open)return;
 e.stopImmediatePropagation();e.preventDefault();c.setPointerCapture(e.pointerId);
 const near=(x,y)=>Math.hypot(x*W-p[0],y*H-p[1])<10*KK();maskDrag={id:e.pointerId,p,mask:{...m},mode:near(m.ex,m.ey)?'edge':near(m.x,m.y)?'move':'new'};
},true);
function dragMask(e){const d=maskDrag;if(!d||e.pointerId!==d.id)return;const [x,y]=pos(e),dx=(x-d.p[0])/W,dy=(y-d.p[1])/H;if(Math.hypot(dx*W,dy*H)<1)return;
 mutateGrade('mask-draw',s=>{const m=s.masks[selectedMask];if(d.mode==='move'){m.x=d.mask.x+dx;m.y=d.mask.y+dy;m.ex=d.mask.ex+dx;m.ey=d.mask.ey+dy}
 else{if(d.mode==='new'){m.x=d.p[0]/W;m.y=d.p[1]/H}m.ex=x/W;m.ey=y/H}})}
c.addEventListener('pointermove',dragMask,true);
function endMask(e){if(maskDrag?.id===e.pointerId){if(e.type==='pointerup')dragMask(e);maskDrag=null;finishGradeEdit()}}
c.addEventListener('pointerup',endMask,true);c.addEventListener('pointercancel',endMask,true);
$('local-tools').ontoggle=()=>draw(true);


function transformMasks(matrix,oldW,oldH,w,h){
 if(!state.grading?.masks)return;
 state.grading.masks=state.grading.masks.map(m=>{const a=matrix.transformPoint(new DOMPoint(m.x*oldW,m.y*oldH)),b=matrix.transformPoint(new DOMPoint(m.ex*oldW,m.ey*oldH));return {...m,x:a.x/w,y:a.y/h,ex:b.x/w,ey:b.y/h}});
}
function restoreProject(data){
 const next=data.state,expected=defaults();
 migrateExposure(next);
 if(next?.d)next.d={...portraitDefaults,...next.d};
 if(!FL[next?.f?.i]||!Number.isInteger(next.id)||next.id!==-1&&!PR[next.id]||!Number.isFinite(next.k)||
    !['a','d','f','g','n'].every(group=>Object.keys(expected[group]).every(key=>Number.isFinite(next[group]?.[key]))))throw Error('Invalid film settings.');
 if(![0,1,2].includes(next.d.mode)||![0,1].includes(next.d.style)||![0,1,2,3,4].includes(next.d.matte)||![0,1].includes(next.d.originalBg)||
    !['keyR','keyG','keyB'].every(k=>next.d[k]>=0&&next.d[k]<=255)||next.d.tolerance<0||next.d.tolerance>100||
    !['faceX','faceY','foreground'].every(k=>next.d[k]>=0&&next.d[k]<=100)||next.d.faceRadius<5||next.d.faceRadius>60)throw Error('Invalid portrait exposure settings.');
 if(next.grainAmount!=null&&(!Number.isFinite(next.grainAmount)||next.grainAmount<0||next.grainAmount>100))throw Error('Invalid preset grain amount.');
 if(next.detail!=null&&!validDetail(next.detail))throw Error('Invalid photo detail settings.');
 if(next.wb!=null&&(!Array.isArray(next.wb)||next.wb.length!==3||!next.wb.every(v=>Number.isFinite(v)&&v>=.125&&v<=8)))throw Error('Invalid white balance.');
 next.detail??=defaultDetail();
 const grade=next.grading;
 if(grade&&(!curveKeys.every(key=>{
   const points=grade.curves?.[key];return Array.isArray(points)&&points.length>=2&&points[0][0]===0&&points.at(-1)[0]===255&&points.every(([x,y],i)=>Number.isInteger(x)&&Number.isFinite(y)&&y>=0&&y<=255&&(!i||x>points[i-1][0]));
 })||!zoneKeys.every(key=>['hue','sat','lum'].every(k=>Number.isFinite(grade.zones?.[key]?.[k])))||
 grade.bands&&(!Array.isArray(grade.bands)||![0,8].includes(grade.bands.length)||!grade.bands.every(b=>['center','width','h','s','l'].every(k=>Number.isFinite(b[k]))))||
 grade.masks&&(!Array.isArray(grade.masks)||!grade.masks.every(m=>['linear','radial','saved'].includes(m.kind)&&typeof m.name==='string'&&['x','y','ex','ey','aspect','feather','exposure','saturation','warmth','tint'].every(k=>Number.isFinite(m[k]))))))throw Error('Invalid grading settings.');
 if(data.second&&!(data.second instanceof HTMLCanvasElement)||data.anchor&&!(data.anchor.m instanceof DOMMatrix)||
    data.paper&&(!(data.paper.mask instanceof HTMLCanvasElement)||!(data.paper.color instanceof HTMLCanvasElement)))throw Error('Invalid film assets.');
 previewSubject=false;state=data.state;second=data.second||null;anchor=data.anchor||null;paper=data.paper||null;layoutOrigin=data.layoutOrigin||null;secondRequest++;cached=null;gesture=null;maskDrag=null;gradePick=false;maskPlace=false;section=data.section||'presets';thumbs.clear();syncDocument();build();
}
function gradeMask(id){singleGrade('saved-mask',s=>{s.masks??=[];s.masks.push({...defaultMask('saved'),savedId:id,name:maskBank.find(m=>m.id===id).name});selectedMask=s.masks.length-1});setGradeTool(false,false)}
function fillMask(id){command(()=>{if(state.d.mode!==2)initialSubject();Object.assign(state.d,{mode:2,savedId:id,matte:4,foreground:0});state.id=-1})}
function effectPixels(im,e){
 let s=defaults();
 if(e.kind==='film')s=recipe(e.recipe,100);
 if(e.kind==='curve'){s.grading=neutralGrade();s.grading.curves.master=[[0,0],[128,e.param],[255,255]]}
 if(e.kind==='grain'){s.n={amt:45,size:e.param,col:0,seed:1,organic:true}}
 return develop(im,s,null);
}
function renderLook(im,settings){return develop(im,{...defaults(),...settings,d:defaults().d},null)}
function applySavedLook(settings){state={...defaults(),...structuredClone(settings),d:state.d};save();changed(true)}
function setReference(ref,record=true){command(()=>{state.reference=ref;state.id=-1},false,record);syncReference()}
$('fx-film').replaceChildren(...PR.flatMap((p,i)=>p[6]?[]:[new Option(p[0],i)]));
return {effectPixels,renderLook,applySavedLook,setReference,gradeMask,fillMask,image,enabled,showSubjectMask,openExposureFiles,inDouble:()=>tab==='film'&&section==='double',reset,build,afterOpen,paintFrame,maskGuides,projectState:()=>({state:structuredClone(state),second,anchor,paper,layoutOrigin,section}),restoreProject,syncGrade,updateScopes,getGrade:currentGrade,setZone:(z,p,fin)=>{mutateGrade('3wheel-'+z,s=>Object.assign(s.zones[z],p));if(fin)finishGradeEdit()},setGradeProp:(k,v,fin)=>{mutateGrade('3wheel-'+k,s=>{s[k]=v});if(fin)finishGradeEdit()},finishGradeEdit,space:()=>({bank:maskBank,anchor,layoutOrigin,paper,masks:state.grading?.masks}),restoreSpace:value=>{if(value){maskBank=value.bank||[];if(state.grading)state.grading.masks=value.masks;anchor=value.anchor;layoutOrigin=value.layoutOrigin;paper=value.paper;cached=null}},transformSpace,rememberPixels,filmRows,openRecipe,loadSecond,invalidate:()=>{cached=null},isDouble:()=>tab==='film'&&section==='double'&&!!base,focusDouble:()=>{document.querySelector('[data-t="film"]').click();setSection('double')},get state(){return state}};
})();
let panelSize=1;
$('panel-height').onclick=()=>{panelSize=(panelSize+1)%3;document.querySelector('aside').style.setProperty('--panel-height',['36%','52%','68%'][panelSize])};
function pathSamples(tx,ink){
 const arc=tx.pathMode==='arc',circle=tx.pathMode==='circle',w=Math.max(80,ink.width),h=Math.max(35,w*.23);
 if(tx.pathMode==='drawn')return tx.typePath?.length>1?tx.typePath:null;
 if(!arc&&!circle)return null;
 return Array.from({length:97},(_,i)=>{const t=i/96;
  if(arc)return [t*w,h*(1-4*t*(1-t))];
  const r=Math.max(ink.height*.85,w/(2*Math.PI)*1.28),a=t*2*Math.PI-Math.PI/2;return [r*(1+Math.cos(a)),r*(1+Math.sin(a))]});
}
function trackData(points){
 const lengths=[0];for(let i=1;i<points.length;i++)lengths.push(lengths[i-1]+Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]));
 return {points,lengths,total:lengths.at(-1)};
}
function trackAt(track,t){
 const d=track.total*Math.min(1,Math.max(0,t)),{lengths,points}=track;let a=1,b=lengths.length-1;
 while(a<b){const k=(a+b)>>1;if(lengths[k]<d)a=k+1;else b=k}
 const p=points[a-1],q=points[a],f=(d-lengths[a-1])/(lengths[a]-lengths[a-1]||1);
 return [p[0]+(q[0]-p[0])*f,p[1]+(q[1]-p[1])*f,Math.atan2(q[1]-p[1],q[0]-p[0])];
}
function textCanvas(tx){
 const face=letterFace(tx);if(!tx.pathMode||tx.pathMode==='off')return face;
 const points=pathSamples(tx,face);if(!points)return face;const track=trackData(points);if(track.total<2)return face;
 const start=(tx.pathStart??0)/100,end=(tx.pathEnd??100)/100,span=Math.max(.01,end-start);
 // Use the original letter advances so counters and serifs rotate together along the path.
 const raw=flatTextCanvas(tx),edges=letterEdges(tx,raw,raw).map(x=>x*face.width/raw.width);
 const pad=face.height*.62+Math.max(...edges.slice(1).map((v,i)=>v-edges[i]))/2+3;
 const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),left=Math.min(...xs)-pad,top=Math.min(...ys)-pad;
 const width=Math.max(...xs)-left+pad,height=Math.max(...ys)-top+pad,fit=typeLimit(width,height);
 const cv=bc(Math.max(1,Math.ceil(width*fit)),Math.max(1,Math.ceil(height*fit))),g=cv.getContext('2d');
 const advance=Math.min(1,track.total*span/face.width);g.scale(fit,fit);g.translate(-left,-top);
 for(let i=1;i<edges.length;i++){
  const x=edges[i-1],sw=edges[i]-x;if(sw<=0)continue;const [cx,cy,angle]=trackAt(track,start+span*(x+sw/2)/face.width);
  g.save();g.translate(cx,cy);g.rotate(angle);g.drawImage(face,x,0,sw,face.height,-sw*advance/2,-face.height/2,sw*advance,face.height);g.restore();
 }
 cv.pathGeometry={points:points.map(([x,y])=>[(x-left)*fit,(y-top)*fit])};return cv;
}
let pathDrawing=false,pathGesture=null,fillGesture=null;
function textPathUI(tx){
 for(const [id,value] of Object.entries({'path-mode':tx.pathMode||'off','path-start':tx.pathStart??0,'path-end':tx.pathEnd??100,'photo-x':tx.photoX||0,'photo-y':tx.photoY||0,'photo-scale':tx.photoScale||100})){
  const el=$(id);el.value=value;if(el.nextElementSibling?.tagName==='OUTPUT')el.nextElementSibling.value=value+'%';
 }
 $('path-options').hidden=!tx.pathMode||tx.pathMode==='off';$('photo-options').hidden=tx.fill!=='photo';$('path-mode').querySelector('[value=drawn]').disabled=!tx.typePath?.length;
 for(const el of document.querySelectorAll('#type-path-section input,#type-path-section select,#type-path-section button,#photo-options input,#photo-options select,#photo-options button'))el.disabled=!!active?.lk;
 const list=$('fill-layer');list.replaceChildren(new Option('Choose a layer',''),...layers.flatMap((l,i)=>l===active?[]:[new Option(l.name,i)]));
}
function applyPhotoFill(cv){if(cv&&active?.tx&&!active.lk)retext({fill:'photo',photo:cv,photoScale:100,photoX:0,photoY:0})}
$('fill-import').onclick=()=>{$('text-fill-status').textContent='';$('fill-file').click()};
$('fill-file').onchange=e=>{const file=e.target.files[0];e.target.value='';importTextPicture(file)};
const photoOptions=$('photo-options');
photoOptions.addEventListener('dragover',e=>{e.preventDefault();e.stopPropagation()});
photoOptions.addEventListener('drop',e=>{e.preventDefault();e.stopPropagation();importTextPicture(e.dataTransfer.files[0])});
let photoFillRequest=0;
async function importTextPicture(f){
 const target=active;if(!f||!target?.tx||target.lk)return;const job=++photoFillRequest;
 try{const img=await createImageBitmap(f);try{if(job!==photoFillRequest||target!==active||!layers.includes(target)||target.lk)return;const k=Math.min(1,4000/Math.max(img.width,img.height)),cv=bc(Math.max(1,Math.round(img.width*k)),Math.max(1,Math.round(img.height*k)));
 cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);applyPhotoFill(cv);$('text-fill-status').textContent='Image applied inside the letters.'}finally{img.close()}}catch{if(job===photoFillRequest&&target===active)$('text-fill-status').textContent='Could not open this image.'}
};
$('fill-base').onclick=()=>applyPhotoFill(overlaySourceCanvas());
$('fill-water').onclick=()=>{
 const cv=bc(800,500),g=cv.getContext('2d'),tide=g.createLinearGradient(0,0,570,500);
 tide.addColorStop(0,'#136983');tide.addColorStop(.44,'#57c6ba');tide.addColorStop(.78,'#267593');tide.addColorStop(1,'#104459');
 g.fillStyle=tide;g.fillRect(0,0,cv.width,cv.height);
 const i=OVK.findIndex(v=>v[1]==='caustics');g.drawImage(ovGen(overlayDefaults(i),cv.width,cv.height),0,0);applyPhotoFill(cv);
};
$('fill-layer').onchange=e=>{if(e.target.value==='')return;const src=layers[+e.target.value]?.cv;if(src){const copy=bc(src.width,src.height);copy.getContext('2d').drawImage(src,0,0);applyPhotoFill(copy)}};
$('path-mode').onchange=e=>retext({pathMode:e.target.value});
for(const [id,k] of [['path-start','pathStart'],['path-end','pathEnd'],['photo-scale','photoScale'],['photo-x','photoX'],['photo-y','photoY']]){
 const el=$(id);el.oninput=()=>{if(!active?.tx||active.lk)return;let v=+el.value;if(k==='pathStart')v=Math.min(v,(active.tx.pathEnd??100)-2);if(k==='pathEnd')v=Math.max(v,(active.tx.pathStart??0)+2);retext({[k]:v},id);textPathUI(active.tx)};el.onchange=()=>textEdit=null;
}
$('path-draw').onclick=()=>{if(!active?.tx||active.lk)return;pathDrawing=!pathDrawing;$('path-draw').setAttribute('aria-pressed',String(pathDrawing));$('path-msg').textContent=pathDrawing?'Draw the reading direction on the image.':'';setTypeDrawing(false)};
function cancelPathInput(){pathDrawing=false;pathGesture=null;fillGesture=null;$('path-draw').setAttribute('aria-pressed','false');$('path-msg').textContent=''}
function pathHandles(track,tx,k){
 const handles=[['pathStart',tx.pathStart??0],['pathEnd',tx.pathEnd??100]].map(([key,t])=>{
  const [x,y]=trackAt(track,t/100);return {key,t,x,y};
 });
 const [start,end]=handles;
 if(Math.hypot(start.x-end.x,start.y-end.y)<14*k){start.y-=7*k;end.y+=7*k}
 return handles;
}
function textGuides(){
 if(tab!=='text'||!active?.vis||!active.tx)return;
 const k=KK();ctx.save();ctx.strokeStyle='#71cdff';ctx.lineWidth=1.5*k;ctx.beginPath();
 if(pathGesture?.kind==='draw'){pathGesture.points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke()}
 else if(active.cv.pathGeometry){
  const points=active.cv.pathGeometry.points.map(p=>meshWorld(active,...p)),track=trackData(points);ctx.setLineDash([3*k,4*k]);points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();ctx.setLineDash([]);
  for(const {key,x,y} of pathHandles(track,active.tx,k)){
   ctx.beginPath();ctx.arc(x,y,6*k,0,Math.PI*2);ctx.fillStyle=key==='pathStart'?'#83ecad':'#ffc674';ctx.fill();ctx.strokeStyle='#172538';ctx.stroke()}
 }
 ctx.restore();
}
function textLocal(l,p){const local=LOC(l,p);return [local[0]*(l.fl?-1:1)/l.s,local[1]/l.s]}
c.addEventListener('pointerdown',e=>{
 if(tab!=='text'||!active?.tx||active.lk||!active.vis||e.button||spaceDown||typeDrawing)return;
 const p=pos(e),l=active;
 if(pathDrawing)pathGesture={id:e.pointerId,kind:'draw',l,points:[p]};
 else if(l.tx.fill==='photo'&&$('fill-move').checked){fillGesture={id:e.pointerId,l,p:textLocal(l,p),x:l.tx.photoX||0,y:l.tx.photoY||0}}
 else if(l.cv.pathGeometry){const track=trackData(l.cv.pathGeometry.points.map(q=>meshWorld(l,...q)));
  const ends=pathHandles(track,l.tx,KK()).map(h=>({...h,d:Math.hypot(p[0]-h.x,p[1]-h.y)})).sort((a,b)=>a.d-b.d);
  if(ends[0].d>12*KK())return;pathGesture={id:e.pointerId,kind:ends[0].key,l,track,initial:ends[0].t};
 }else return;
 e.stopImmediatePropagation();e.preventDefault();c.setPointerCapture(e.pointerId);
},true);
c.addEventListener('pointermove',e=>{
 if((pathGesture?.id!==e.pointerId&&fillGesture?.id!==e.pointerId)||tab!=='text')return;e.stopImmediatePropagation();const p=pos(e);
 if(fillGesture){const f=fillGesture;if(active!==f.l||active.lk)return;const q=textLocal(f.l,p);retext({photoX:Math.max(-100,Math.min(100,f.x+(q[0]-f.p[0])*100/f.l.cv.width)),photoY:Math.max(-100,Math.min(100,f.y+(q[1]-f.p[1])*100/f.l.cv.height))},'fill-drag',!!f.changed);f.changed=true;textPathUI(f.l.tx);return}
 const d=pathGesture;if(active!==d.l||active.lk)return;
 if(d.kind==='draw'){const last=d.points.at(-1);if(Math.hypot(p[0]-last[0],p[1]-last[1])>=(d.spacing||2)*KK()){
  if(d.points.length===512){d.points=d.points.filter((_,i)=>i%2===0);d.spacing=(d.spacing||2)*2}
  d.points.push(p);
 }draw(true)}
 else{let nearest=d.initial,dist=Infinity;for(let i=0;i<=200;i++){const t=i/200,q=trackAt(d.track,t),distance=Math.hypot(p[0]-q[0],p[1]-q[1])+Math.abs(t-d.initial/100)*.001;if(distance<dist){dist=distance;nearest=t*100}}
 const v=d.kind==='pathStart'?Math.min(nearest,(active.tx.pathEnd??100)-2):Math.max(nearest,(active.tx.pathStart??0)+2);retext({[d.kind]:Math.round(v)},'path-range',!!d.changed);d.changed=true;textPathUI(active.tx)}
},true);
function finishPath(e){
 if(fillGesture?.id===e.pointerId){fillGesture=null;textEdit=null;return}
 const d=pathGesture;if(!d||d.id!==e.pointerId)return;pathGesture=null;textEdit=null;
 if(d.kind==='draw'){cancelPathInput();if(e.type==='pointerup'&&active===d.l&&!active.lk&&d.points.length>2){
  const end=pos(e);if(Math.hypot(end[0]-d.points.at(-1)[0],end[1]-d.points.at(-1)[1])>KK()){if(d.points.length===512)d.points.pop();d.points.push(end)}
  const coords=d.points.map(p=>textLocal(d.l,p)),x0=Math.min(...coords.map(p=>p[0])),y0=Math.min(...coords.map(p=>p[1]));
  retext({pathMode:'drawn',typePath:coords.map(([x,y])=>[x-x0,y-y0]),pathStart:0,pathEnd:100});
  const actual=meshWorld(active,...active.cv.pathGeometry.points[0]);active.x+=d.points[0][0]-actual[0];active.y+=d.points[0][1]-actual[1];
 }}draw()
}
c.addEventListener('pointerup',finishPath,true);c.addEventListener('pointercancel',finishPath,true);


// Projects store the editable document plus lossless pixel buffers. The same document bundle backs pinned versions.
const projectControls=[...document.querySelectorAll('#p-adjust input[id],#p-adjust select[id],#p-pixel input[id],#p-pixel select[id],#p-pixel textarea[id],#p-warp input[id],#p-warp select[id],#p-select input[id],#p-select select[id]')]
 .map(el=>el.id).concat(['k','reduce','str','gradient-enabled','lgrade','sov','spl','spr','exn','exs','exf','exq']);
const layerFields=['fxStack','name','x','y','s','r','fl','op','bm','vis','lk','cl','cr','ct','cb','tx','overlay','overlayPhoto','o','sh','ol','tn','gl','lf','brushPadding','mask','maskEnabled','maskDensity','maskFeather','depthMap','clipBelow','retouch','vectorMask','shape','paint'];
let versions=[],projectTitle='Totone',projectJob=0;
function captureDocument(){
 if(!base)throw Error('Open a photo or a blank canvas first.');
 return {base,orig,sel,maskBank,active:layers.indexOf(active),layers:layers.map(l=>{
  const result={pixels:l.d,mesh:l.cv.typeGeometry,path:l.cv.pathGeometry};for(const key of layerFields)if(l[key]!=null)result[key]=l[key];return result;
 }),tone:{stops,pos:stopPos,map:mapSettings(),cs,selectedStop,cur,name:P[cur]?.n,edits,palette},pixel:{curPx,pxSeed},crop:{cAsp,box:CR},film:film.projectState(),tab,
 controls:Object.fromEntries(projectControls.map(id=>{const e=$(id);return [id,e.type==='checkbox'?e.checked:e.value]}))};
}
function packProject(doc,pins=[]){
 const chunks=[],seen=new Map(),assets=[];let offset=0;
 function asset(value,kind,bytes,w,h){
  if(seen.has(value))return {$asset:seen.get(value)};
  const i=assets.length,length=bytes instanceof Blob?bytes.size:bytes.byteLength;
  assets.push({kind,offset,length,w,h});chunks.push(bytes);offset+=length;seen.set(value,i);return {$asset:i};
 }
 function encode(v){
  if(v===null||typeof v!=='object')return v;
  if(v instanceof ImageData)return asset(v,'pixels',v.data,v.width,v.height);
  if(v instanceof HTMLCanvasElement){if(seen.has(v))return {$asset:seen.get(v)};return asset(v,'canvas',v.getContext('2d').getImageData(0,0,v.width,v.height).data,v.width,v.height)}
  if(v instanceof DOMMatrix)return {$matrix:[v.a,v.b,v.c,v.d,v.e,v.f]};
  if(v instanceof Blob)return asset(v,'bundle',v);
  if(ArrayBuffer.isView(v))return asset(v,v instanceof Uint8ClampedArray?'clamped':'bytes',v);
  if(Array.isArray(v))return v.map(encode);
  return Object.fromEntries(Object.entries(v).map(([k,val])=>[k,encode(val)]));
 }
 const root=encode({doc,pins}),manifest=new TextEncoder().encode(JSON.stringify({version:1,root,assets})),len=new Uint8Array(4);
 new DataView(len.buffer).setUint32(0,manifest.length,true);
 return new Blob(['TOTONE1\n',len,manifest,...chunks],{type:'application/octet-stream'});
}
async function unpackProject(file){
 if(file.size<12)throw Error('Incomplete project file.');
 const header=new Uint8Array(await file.slice(0,12).arrayBuffer());
 if(header[0]===31&&header[1]===139){
  if(!window.DecompressionStream)throw Error('This browser cannot decompress this project.');
  file=await new Response(file.stream().pipeThrough(new DecompressionStream('gzip'))).blob();return readBundle(file);
 }
 return readBundle(file);
}
async function readBundle(file){
 const head=await file.slice(0,12).arrayBuffer();
 if(head.byteLength!==12||new TextDecoder().decode(head.slice(0,8))!=='TOTONE1\n')throw Error('Choose a .totone project.');
 const n=new DataView(head).getUint32(8,true),start=12+n;if(n>32000000||start>file.size)throw Error('Invalid project manifest.');
 const manifest=JSON.parse(await file.slice(12,start).text());
 if(manifest.version!==1||!Array.isArray(manifest.assets))throw Error('Unsupported project version.');
 const assets=[];for(const a of manifest.assets){
  if(!Number.isSafeInteger(a.offset)||!Number.isSafeInteger(a.length)||a.offset<0||a.length<0||start+a.offset+a.length>file.size)throw Error('Incomplete project assets.');
  const block=file.slice(start+a.offset,start+a.offset+a.length);
  if(a.kind==='bundle'){assets.push(block);continue}
  if(a.kind==='canvas'||a.kind==='pixels'){
   if(!Number.isInteger(a.w)||!Number.isInteger(a.h)||a.w<1||a.h<1||a.w*a.h>24000000||a.length!==a.w*a.h*4)throw Error('Invalid image dimensions.');
   const im=new ImageData(new Uint8ClampedArray(await block.arrayBuffer()),a.w,a.h);
   if(a.kind==='pixels')assets.push(im);else{const cv=bc(a.w,a.h);cv.getContext('2d').putImageData(im,0,0);assets.push(cv)}
  }else if(a.kind==='bytes'||a.kind==='clamped'){const bytes=await block.arrayBuffer();assets.push(a.kind==='bytes'?new Uint8Array(bytes):new Uint8ClampedArray(bytes))}
  else throw Error('Unknown project asset.');
 }
 function decode(v){
  if(v===null||typeof v!=='object')return v;
  if(Object.hasOwn(v,'$asset')){if(!Number.isInteger(v.$asset)||!assets[v.$asset])throw Error('Missing project asset.');return assets[v.$asset]}
  if(Object.hasOwn(v,'$matrix')){if(v.$matrix.length!==6||!v.$matrix.every(Number.isFinite))throw Error('Invalid transform.');return new DOMMatrix(v.$matrix)}
  if(Array.isArray(v))return v.map(decode);
  return Object.fromEntries(Object.entries(v).filter(([k])=>!['__proto__','constructor','prototype'].includes(k)).map(([k,val])=>[k,decode(val)]));
 }
 const result=decode(manifest.root),d=result?.doc;
 if(!(d?.base instanceof ImageData)||!(d.orig instanceof ImageData)||d.orig.width!==d.base.width||d.orig.height!==d.base.height||!Array.isArray(d.layers)||!d.tone||!d.pixel||!d.film?.state||!Array.isArray(result.pins)||result.pins.length>4)throw Error('Invalid project document.');
 if(d.maskBank!=null&&(!Array.isArray(d.maskBank)||!d.maskBank.every(m=>Number.isInteger(m.id)&&typeof m.name==='string'&&m.cv instanceof HTMLCanvasElement&&m.cv.width===d.base.width&&m.cv.height===d.base.height)))throw Error('Invalid saved mask.');
 for(const l of d.layers)if(l.fxStack!=null&&(!Array.isArray(l.fxStack)||!l.fxStack.every(e=>Object.hasOwn(effectLabels,e.kind)&&Number.isFinite(e.amount)&&e.amount>=0&&e.amount<=100&&Number.isFinite(e.param)&&(!e.mask||e.mask instanceof HTMLCanvasElement)&&$('fx-film').querySelector('option[value="'+Number(e.recipe)+'"]'))))throw Error('Invalid layer effects.');
 const ref=d.film.state.reference;if(ref&&(!Array.isArray(ref.tones)||ref.tones.length!==3||!ref.tones.every(row=>Array.isArray(row)&&row.length===3&&row.every(v=>Number.isFinite(v)&&v>=0&&v<=255))||!Array.isArray(ref.amounts)||ref.amounts.length!==3||!ref.amounts.every(v=>Number.isFinite(v)&&v>=0&&v<=100)))throw Error('Invalid reference colours.');
 if(d.sel&&(!(d.sel instanceof Uint8Array)||d.sel.length!==d.base.width*d.base.height))throw Error('Invalid selection.');
 const between=(n,a,b)=>Number.isFinite(n)&&n>=a&&n<=b;
 const color=v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v);
 const pair=p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite);
 const rgbTriplet=v=>Array.isArray(v)&&v.length===3&&v.every(n=>between(n,0,255));
 const tone=d.tone;
 if(!d.controls||typeof d.controls!=='object'||!Array.isArray(tone.cs)||tone.cs.length<2||!tone.cs.every(s=>color(s.c)&&between(s.p,0,100))||
    !Number.isInteger(tone.selectedStop)||!tone.cs[tone.selectedStop]||!Array.isArray(tone.edits)||!tone.edits.every(e=>rgbTriplet(e.f)&&rgbTriplet(e.t)&&between(e.tol,1,255))||
    !Array.isArray(tone.palette)||!tone.palette.every(rgbTriplet)||tone.stops&&(!Array.isArray(tone.stops)||tone.stops.length<2||!tone.stops.every(color))||
    tone.pos&&(!Array.isArray(tone.pos)||tone.pos.length!==tone.stops?.length||!tone.pos.every(p=>between(p,0,100))))throw Error('Invalid tone settings.');
 for(const l of d.layers){
  if(!['x','y','s','r','op','ct','cb','cl','cr'].every(k=>Number.isFinite(l[k]))||![true,false,0,1].includes(l.vis))throw Error('Invalid layer settings.');
  if(l.vectorMask){
   const {kind,points}=l.vectorMask;
   if(!['ellipse','rect','path'].includes(kind)||!Array.isArray(points)||(kind==='path'?points.length<3||points.length>128:points.length!==2)||
    !points.every(p=>Array.isArray(p)&&between(p[0],0,1)&&between(p[1],0,1)))throw Error('Invalid vector mask.');
  }
  if(l.mask&&!(l.mask instanceof HTMLCanvasElement)||l.depthMap&&!(l.depthMap instanceof HTMLCanvasElement)||l.maskDensity!=null&&!between(l.maskDensity,0,100)||l.maskFeather!=null&&!between(l.maskFeather,0,80))throw Error('Invalid layer mask.');
  const tx=l.tx;
  if(tx&&(typeof tx.t!=='string'||typeof tx.f!=='string'||!between(tx.sz,1,4000)||tx.photo&&!(tx.photo instanceof HTMLCanvasElement)||
     tx.rows!=null&&!between(tx.rows,1,100)||tx.typePath&&(!Array.isArray(tx.typePath)||tx.typePath.length>512||!tx.typePath.every(pair))||
     tx.knots&&(!Array.isArray(tx.knots)||tx.knots.length<4||tx.knots.length>32||tx.knots.length%2||!tx.knots.every(pair))))throw Error('Invalid text settings.');
  if(l.path&&(!Array.isArray(l.path.points)||l.path.points.length<2||l.path.points.length>512||!l.path.points.every(pair)))throw Error('Invalid text path.');
 }
 for(const l of d.layers)if(!(l.pixels instanceof ImageData)||!BM.includes(l.bm)||typeof l.name!=='string'||!Number.isFinite(l.s)||l.s<=0||l.overlay&&!OVK[l.overlay.i])throw Error('Invalid layer.');
 for(const pin of result.pins)if(!(pin.bundle instanceof Blob)||!(pin.preview instanceof HTMLCanvasElement)||typeof pin.name!=='string')throw Error('Invalid pinned version.');
 return result;
}
function installDocument(d,existingLayers=null){
 maskBank=d.maskBank||[];maskChoice=maskBank[0]?.id||0;
 const restored=existingLayers||d.layers.map(item=>{
  const l={};for(const k of layerFields)if(item[k]!=null)l[k]=item[k];
  l.d=item.pixels;l.cv=bc(l.d.width,l.d.height);l.cv.getContext('2d').putImageData(l.d,0,0);
  if(item.mesh)l.cv.typeGeometry=item.mesh;if(item.path)l.cv.pathGeometry=item.path;return l;
 });
 ++imageRequest;++fontRequest;clearInterval(tick);SS=null;strokeLayers=null;guides=[];ren=-1;clearTimeout(idleT);if(raf)cancelAnimationFrame(raf);raf=0;DR=null;needFull=true;down=false;ls=null;meshDrag=null;textEdit=null;typeDraft=null;lasso=[];maskIdx=-1;showOrig=false;
 cancelPathInput();resetCorrectionTools();setTypeDrawing(false);base=d.base;orig=d.orig;W=base.width;H=base.height;sel=d.sel||null;layers=restored;active=layers[d.active]||null;
 for(const id of projectControls){if(!Object.hasOwn(d.controls,id))continue;const el=$(id);if(el.type==='checkbox')el.checked=!!d.controls[id];else el.value=d.controls[id]}
 const t=d.tone;setMapSettings(t.map);cs=t.cs;selectedStop=t.selectedStop;buildC();setStops(t.stops,t.pos,false);$('gradient-enabled').checked=!!d.controls['gradient-enabled'];cur=P.findIndex(p=>p.n===t.name);edits=t.edits||[];palette=t.palette||[];drawEdits();showP($('q').value.toLowerCase());
 curPx=PXS[d.pixel.curPx]?d.pixel.curPx:0;pxSeed=d.pixel.pxSeed||0;pxo();showPx();syncPxUI();cAsp=d.crop?.cAsp||'free';setAspUI();
 c.style.display='block';$('empty').style.display='none';$('zoom').value='0';$('zoom').onchange();film.restoreProject(d.film);palette=t.palette;paintPalette();
 document.querySelectorAll('.tabs [data-t]').forEach(btn=>{if(btn.dataset.t===d.tab)btn.click()});if(tab==='crop'&&d.crop?.box){CR=d.crop.box;cropInfo()}
 for(const family of new Set(layers.flatMap(l=>l.tx?[l.tx.f]:[])))ensureFont(family);
 refreshLayers();updInfo();draw();
}
function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)}
async function saveProject(){
 const msg=$('project-message');try{
  const name=($('project-name').value.trim()||'Totone').replace(/[<>:"/\\|?*]/g,'_');let blob=packProject(captureDocument(),versions);msg.textContent='Saving project…';
  if(window.CompressionStream)blob=await new Response(blob.stream().pipeThrough(new CompressionStream('gzip'))).blob();
  downloadBlob(blob,name+'.totone');projectTitle=name;msg.textContent='Saved '+name+'.totone';
 }catch(e){msg.textContent=e.message}
}
async function openProject(file){
 if(!file)return;const job=++projectJob,request=++imageRequest,dialog=$('project-dialog'),msg=$('project-message');
 if(!dialog.open)dialog.showModal();msg.textContent='Opening project…';
 let previous=null;
 try{const bundle=await unpackProject(file);if(job!==projectJob||request!==imageRequest)return;
  previous=base?documentUndo():null;installDocument(bundle.doc);versions=bundle.pins;undoStack=[];redoS=[];projectTitle=file.name.replace(/\.totone$/i,'');$('project-name').value=projectTitle;updatePins();msg.textContent='';dialog.close();
 }catch(e){if(previous)previous();msg.textContent='Could not open the project. '+e.message}
}
for(const id of ['project-dialog','version-dialog'])$(id).addEventListener('keydown',e=>e.stopPropagation());
$('project-open').onclick=()=>$('project-file').click();$('project-file').onchange=e=>{openProject(e.target.files[0]);e.target.value=''};
$('project-save').onclick=saveProject;$('project-close').onclick=()=>$('project-dialog').close();
$('project-menu').onclick=()=>{$('project-name').value=projectTitle;$('project-message').textContent='';$('project-save').disabled=!base;$('project-dialog').showModal()};


let compareZoom=1,compareCenter=[.5,.5],compareDrag=null,versionJob=0;
function pinCurrent(){
 if(!base||versions.length>=4)return;
 const preview=bc(W,H);render(false);preview.getContext('2d').drawImage(c,0,0);draw(true);
 const name=$('version-name').value.trim()||'Look '+(versions.length+1);
 versions.push({name,preview,bundle:packProject(captureDocument())});$('version-name').value='';updatePins();
}
function drawComparisons(){
 for(const canvas of $('version-grid').querySelectorAll('canvas')){
  const photo=versions[+canvas.dataset.pin]?.preview;if(!photo)continue;
  const rect=canvas.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1),w=Math.max(1,Math.round(rect.width*dpr)),h=Math.max(1,Math.round(rect.height*dpr));if(canvas.width!==w)canvas.width=w;if(canvas.height!==h)canvas.height=h;
  const g=canvas.getContext('2d'),scale=Math.min(w/photo.width,h/photo.height)*compareZoom;
  g.clearRect(0,0,w,h);g.imageSmoothingEnabled=true;g.drawImage(photo,w/2-photo.width*scale*compareCenter[0],h/2-photo.height*scale*compareCenter[1],photo.width*scale,photo.height*scale);
 }
}
function updatePins(){if(suiteReady)queueDraft();
 const grid=$('version-grid');grid.replaceChildren();
 for(const [i,pin] of versions.entries()){
  const card=document.createElement('div'),cv=bc(1,1),bar=document.createElement('div'),name=document.createElement('input');card.className='version-card';bar.className='bar';cv.dataset.pin=i;cv.setAttribute('aria-label',pin.name);
  name.value=pin.name;name.setAttribute('aria-label','Version name');name.onchange=()=>{pin.name=name.value.trim()||'Look '+(i+1);name.value=pin.name;cv.setAttribute('aria-label',pin.name)};
  const use=document.createElement('button'),remove=document.createElement('button');use.textContent='Use look';remove.textContent='Remove';use.onclick=()=>choosePin(pin);remove.onclick=()=>{versions.splice(i,1);updatePins()};
  bar.append(name,use,remove);card.append(cv,bar);grid.append(card);
 }
 $('pin-current').disabled=!base||versions.length>=4;$('version-status').textContent=versions.length?versions.length+' of 4 versions':'Pin the current edit, make another edit, then pin it here.';
 requestAnimationFrame(drawComparisons);
}
function documentUndo(){
 const before=captureDocument(),priorLayers=layers;
 return ()=>{const reverse=documentUndo();installDocument(before,priorLayers);return reverse};
}
async function choosePin(pin){
 const job=++versionJob,request=imageRequest;let undo;
 try{const {doc}=await unpackProject(pin.bundle);if(job!==versionJob||request!==imageRequest||!versions.includes(pin))return;undo=documentUndo();installDocument(doc);pushU(undo);$('version-dialog').close()}catch(e){if(undo)undo();$('version-status').textContent=e.message}
}
$('version-open').onclick=()=>{if($('project-dialog').open)$('project-dialog').close();$('version-dialog').showModal();updatePins()};
$('version-close').onclick=()=>$('version-dialog').close();$('pin-current').onclick=pinCurrent;
$('version-zoom').oninput=e=>{compareZoom=+e.target.value/100;$('version-scale').value=e.target.value+'%';drawComparisons()};
$('version-fit').onclick=()=>{compareCenter=[.5,.5];$('version-zoom').value=100;$('version-zoom').oninput({target:$('version-zoom')})};
const versionGrid=$('version-grid');
versionGrid.onpointerdown=e=>{const cv=e.target.closest('canvas');if(!cv||e.button)return;cv.setPointerCapture(e.pointerId);compareDrag={id:e.pointerId,x:e.clientX,y:e.clientY,cv}};
versionGrid.onpointermove=e=>{if(compareDrag?.id!==e.pointerId)return;const {cv,x,y}=compareDrag,photo=versions[+cv.dataset.pin].preview,box=cv.getBoundingClientRect(),scale=Math.min(box.width/photo.width,box.height/photo.height)*compareZoom;
 compareCenter=[Math.max(0,Math.min(1,compareCenter[0]-(e.clientX-x)/(photo.width*scale))),Math.max(0,Math.min(1,compareCenter[1]-(e.clientY-y)/(photo.height*scale)))];compareDrag.x=e.clientX;compareDrag.y=e.clientY;drawComparisons()};
versionGrid.onpointerup=versionGrid.onpointercancel=()=>{compareDrag=null};
versionGrid.addEventListener('wheel',e=>{if(!e.target.closest('canvas'))return;e.preventDefault();const input=$('version-zoom');input.value=Math.round(compareZoom*100*Math.exp(-e.deltaY*.002));input.oninput({target:input})},{passive:false});
new ResizeObserver(()=>{if($('version-dialog').open)drawComparisons()}).observe(versionGrid);


function maskControls(){
 const l=active,disabled=!l||l.lk,masked=!!l?.mask;
 $('mask-lift').hidden=!!l||!base;
 $('layer-mask-kind').disabled=disabled;
 $('layer-mask-add').disabled=disabled||($('layer-mask-kind').value==='selection'&&!sel);
 $('layer-mask-add').textContent=masked?'Replace mask':'Add mask';
 for(const id of ['layer-mask-invert','layer-mask-remove','layer-mask-on'])$(id).disabled=disabled||!masked;
 $('layer-mask-on').checked=masked&&l.maskEnabled!==false;
 $('layer-clip').checked=!!l?.clipBelow;$('layer-clip').disabled=disabled||layers.indexOf(l)<1;
 const edge=['edge','refine'].includes($('mask-paint').value);
 $('edge-start').disabled=disabled||!l?.vis;$('edge-options').hidden=!edge;
 $('mask-paint').disabled=disabled||!l?.vis||l?.maskEnabled===false;
 for(const opt of $('mask-paint').options)if(['hide','show'].includes(opt.value))opt.disabled=!masked;
 if(suiteReady){syncMaskBank();syncStack()}

 const range=$('layer-mask-kind').value;
 $('mask-luma-options').hidden=!['depth','luma'].includes(range);$('mask-depth-options').hidden=range!=='depth';
 $('depth-choose').disabled=disabled;if(range==='depth'&&!l?.depthMap)$('layer-mask-add').disabled=true;
 for(const [id,k,v,u] of [['mask-density','maskDensity',100,'%'],['layer-mask-feather','maskFeather',0,' px']]){
  const input=$(id);input.value=l?.[k]??v;input.disabled=disabled||!masked;input.nextElementSibling.value=input.value+u;
 }
 const v=l?.vectorMask;
 $('vector-add').disabled=$('vector-kind').disabled=disabled;$('vector-add').textContent=v?'Replace vector mask':'Add vector mask';
 $('vector-remove').disabled=$('vector-edit').disabled=disabled||!v;
 $('vector-anchors').hidden=!v||v.kind!=='path';for(const el of $('vector-anchors').children)el.disabled=disabled||!$('vector-edit').checked;
 if(v?.kind==='path'){$('vector-delete').disabled||=v.points.length<=3;$('vector-insert').disabled||=v.points.length>=128}
 $('repair-mode').disabled=!base;
}
for(const [id,unit] of [['mask-low',''],['mask-high',''],['mask-soft',''],['edge-width',' px'],['edge-flow','%'],['mask-brush-radius',' px'],['mask-hardness','%'],['repair-radius',' px'],['repair-opacity','%']]){
 $(id).oninput=e=>e.target.nextElementSibling.value=e.target.value+unit;
}
$('mask-lift').onclick=()=>{
 if(active||!base)return;
 pushU(mkSnap('all'));const cv=bc(W,H),d=new ImageData(new Uint8ClampedArray(base.data),W,H);cv.getContext('2d').putImageData(d,0,0);
 active={name:'Base photo',cv,d,x:W/2,y:H/2,s:1,r:0,op:1,bm:'source-over',vis:true,fl:false,lk:false,ct:0,cb:0,cl:0,cr:0};
 layers.unshift(active);base.data.fill(0);refreshLayers();draw();
};
$('layer-mask-kind').onchange=maskControls;
for(const [id,key] of [['mask-density','maskDensity'],['layer-mask-feather','maskFeather']]){
 const el=$(id);let layer=null;
 el.oninput=()=>{if(!active?.mask||active.lk)return;if(layer!==active){pushU(mkSnap('p'));layer=active}
  active[key]=+el.value;el.nextElementSibling.value=el.value+(key==='maskDensity'?'%':' px');draw()};
 el.onchange=el.onblur=()=>{layer=null;refreshLayers()};
}
$('depth-choose').onclick=()=>$('depth-file').click();
let depthRequest=0;
$('depth-file').onchange=async e=>{
 const file=e.target.files[0],l=active,job=++depthRequest;e.target.value='';if(!file||!l||l.lk)return;
 try{const img=await createImageBitmap(file);try{
  if(active!==l||l.lk||job!==depthRequest||!layers.includes(l))return;
  const cv=bc(l.cv.width,l.cv.height);cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);
  pushU(mkSnap('p'));l.depthMap=cv;maskControls();$('depth-status').textContent='Depth map ready. Set the limits and apply the mask.';
 }finally{img.close()}}catch{$('depth-status').textContent='Could not read this depth image.'}
};
function layerSelectionStencil(l){
 const stencil=bc(W,H),sg=stencil.getContext('2d'),im=sg.createImageData(W,H);
 for(let i=0;i<sel.length;i++)im.data[4*i+3]=sel[i];sg.putImageData(im,0,0);
 const cv=bc(l.cv.width,l.cv.height),g=cv.getContext('2d');
 g.setTransform(layerMatrix(l).inverse());g.drawImage(stencil,0,0);return cv;
}
function replaceMask(mask){
 const l=active;if(!l||l.lk)return;pushU(mkSnap('p'));l.mask=mask;l.maskEnabled=true;
 if(!mask)$('mask-paint').value='';refreshLayers();draw();
}
$('layer-mask-add').onclick=()=>{
 const l=active;if(!l||l.lk)return;const w=l.cv.width,h=l.cv.height,mask=bc(w,h),g=mask.getContext('2d'),kind=$('layer-mask-kind').value;
 if(kind==='white')g.fillRect(0,0,w,h);
 if(kind==='selection'){
  if(!sel)return;
  g.drawImage(layerSelectionStencil(l),0,0);
 }
 if(kind==='luma'||kind==='depth'){
  if(kind==='depth'){if(!l.depthMap)return;g.drawImage(l.depthMap,0,0,w,h)}
  const im=g.createImageData(w,h),d=kind==='depth'?g.getImageData(0,0,w,h).data:l.d.data,lo=Math.min(+$('mask-low').value,+$('mask-high').value),hi=Math.max(+$('mask-low').value,+$('mask-high').value),f=+$('mask-soft').value;
  for(let i=0;i<d.length;i+=4){const v=.2126*d[i]+.7152*d[i+1]+.0722*d[i+2];im.data[i+3]=(kind==='depth'?d[i+3]:255)*(v<lo?(f?ss(lo-f,lo,v):0):v>hi?(f?1-ss(hi,hi+f,v):0):1)}
  g.putImageData(im,0,0);
 }
 replaceMask(mask);
};
$('layer-mask-remove').onclick=()=>replaceMask(null);
$('layer-mask-invert').onclick=()=>{
 if(!active?.mask||active.lk)return;const old=active.mask,cv=bc(old.width,old.height),g=cv.getContext('2d');
 g.fillRect(0,0,cv.width,cv.height);g.globalCompositeOperation='destination-out';g.drawImage(old,0,0);replaceMask(cv);
};
$('layer-mask-on').onchange=act(l=>l.maskEnabled=$('layer-mask-on').checked);
$('layer-clip').onchange=act(l=>l.clipBelow=$('layer-clip').checked);
let correctionStroke=null,sourcePoint=null,chooseSource=false;
function repairSampleNeeded(){return ['clone','heal'].includes($('repair-mode').value)}
function updateRepair(){
 const sampled=repairSampleNeeded();
 $('repair-source').hidden=!sampled;$('repair-source').setAttribute('aria-pressed',String(sampled&&chooseSource));
 if($('repair-mode').value==='patch'){$('repair-note').textContent='Select the damaged area in Select, then click the centre of a clean source patch.';return}
 $('repair-note').textContent=sampled?(chooseSource||!sourcePoint?'Click the source area first, then paint where the correction belongs.':'Paint to sample from the marked area. Alt-click to pick another source.'):'Paint corrections onto a separate retouch layer.';
}
$('repair-source').onclick=()=>{chooseSource=true;updateRepair()};
$('repair-mode').onchange=()=>{chooseSource=repairSampleNeeded()&&!sourcePoint;if($('repair-mode').value){$('mask-paint').value='';$('vector-edit').checked=false;maskControls()}updateRepair()};
$('mask-paint').onchange=()=>{if($('mask-paint').value){$('vector-edit').checked=false;maskControls();$('repair-mode').value='';updateRepair()}};
function brushKind(){
 if(tab!=='layers'||typeDrawing||!base)return '';
 if($('mask-panel').open&&!$('mask-paint').disabled&&$('mask-paint').value)return $('mask-paint').value;
 return $('retouch-panel').open?$('repair-mode').value:'';
}
function newRepairTarget(){
 // A retouch layer is painted in document coordinates. Start a new one after transforming the old one.
 const l=active;
 if(l?.retouch&&l===layers.at(-1)&&l.vis&&!l.lk&&!l.mask&&!l.vectorMask&&!l.clipBelow&&!l.fl&&!l.r&&l.s===1&&l.op===1&&l.bm==='source-over'&&
    l.x===W/2&&l.y===H/2&&l.cv.width===W&&l.cv.height===H&&!l.ct&&!l.cl&&!l.cr&&!l.cb&&!l.sh&&!l.gl&&!l.lf&&!l.ol&&!l.tn){
  const cv=bc(W,H);cv.getContext('2d').drawImage(l.cv,0,0);l.cv=cv;l.d=new ImageData(new Uint8ClampedArray(l.d.data),W,H);return l;
 }
 const cv=bc(W,H),layer={name:'Retouch',retouch:true,cv,d:cv.getContext('2d').createImageData(W,H),vis:true,lk:false,fl:false,x:W/2,y:H/2,r:0,s:1,op:1,bm:'source-over',cl:0,ct:0,cr:0,cb:0};
 layers.push(layer);active=layer;return layer;
}
function ringMean(data,x,y,r){
 const color=[0,0,0];let total=0;
 for(let i=0;i<20;i++){
  const angle=i*Math.PI/10,px=Math.round(x+Math.cos(angle)*r),py=Math.round(y+Math.sin(angle)*r);
  if(px<0||py<0||px>=W||py>=H)continue;const j=4*(py*W+px),alpha=data[j+3]/255;
  for(let ch=0;ch<3;ch++)color[ch]+=data[j+ch]*alpha;total+=alpha;
 }
 return color.map(v=>v/(total||1));
}
function spotOffset(st,x,y){
 // Match patches by the texture and colour around the blemish, keeping the damaged centre out of the comparison.
 let best=Infinity,offset=[0,0];const r=st.radius,d=st.image;
 for(let i=0;i<16;i++){
  const a=i*Math.PI/8,dx=Math.round(2.4*r*Math.cos(a)),dy=Math.round(2.4*r*Math.sin(a));
  let score=0,n=0;
  for(let j=0;j<12;j++){
   const b=j*Math.PI/6,px=Math.round(x+r*Math.cos(b)),py=Math.round(y+r*Math.sin(b));
   if(px<0||py<0||px>=W||py>=H||px+dx<0||py+dy<0||px+dx>=W||py+dy>=H)continue;
   const k=4*(py*W+px),q=k+4*(dy*W+dx);if(d[q+3]<32||d[k+3]<32)continue;
   for(let ch=0;ch<3;ch++)score+=(d[q+ch]-d[k+ch])**2;n++;
  }
  if(n>=3&&score/n<best){best=score/n;offset=[dx,dy]}
 }
 return offset;
}
function repairDab(st,x,y){
 const r=st.radius,d=st.image,out=st.l.d.data,mode=st.mode;
 const left=Math.max(0,Math.floor(x-r)),right=Math.min(W,Math.ceil(x+r)),top=Math.max(0,Math.floor(y-r)),bottom=Math.min(H,Math.ceil(y+r));
 if(right<=left||bottom<=top)return;
 const [dx,dy]=mode==='spot'?spotOffset(st,x,y):st.offset;
 const heal=mode==='heal'||mode==='spot',shift=[0,0,0];
 if(heal){const a=ringMean(d,x,y,r),b=ringMean(d,x+dx,y+dy,r);for(let ch=0;ch<3;ch++)shift[ch]=a[ch]-b[ch]}
 for(let py=top;py<bottom;py++)for(let px=left;px<right;px++){
  const falloff=1-ss(.4,1,Math.hypot(px+.5-x,py+.5-y)/r),i=py*W+px,j=i*4;
  let a=falloff*st.strength*(sel?sel[i]/255:1);if(!a)continue;
  const sx=px+dx,sy=py+dy;if(sx<0||sy<0||sx>=W||sy>=H)continue;
  const q=4*(sy*W+sx),red=d[q],green=d[q+1],blue=d[q+2];a*=d[q+3]/255;if(a===0)continue;
  if(mode==='redeye'&&(red<55||red<1.3*Math.max(green,blue)))continue;
  const old=out[j+3]/255,alpha=a+old*(1-a),lum=.2126*red+.7152*green+.0722*blue;
  for(let ch=0;ch<3;ch++){
   let value=d[q+ch];
   if(heal)value+=shift[ch];
   else if(mode==='redeye'&&ch===0)value=(green+blue)/2;
   else if(mode==='dodge')value=255*(value/255)**.68;
   else if(mode==='burn')value=255*(value/255)**1.5;
   else if(mode==='sponge')value=lum;
   else if(mode==='blur'||mode==='sharp'){
    const step=Math.max(1,Math.round(r/6)),ix=4*Math.min(step,px),ax=4*Math.min(step,W-1-px),iy=4*W*Math.min(step,py),ay=4*W*Math.min(step,H-1-py);
    const average=(value*2+d[j-ix+ch]+d[j+ax+ch]+d[j-iy+ch]+d[j+ay+ch])/6;
    value=mode==='blur'?average:value+1.8*(value-average);
   }
   out[j+ch]=(Math.max(0,Math.min(255,value))*a+out[j+ch]*old*(1-a))/alpha;
  }
  out[j+3]=255*alpha;
 }
 syncL(st.l,[left,top,right-left,bottom-top]);
}
function correctionDab(st,p){
 if(st.edge){brushEdge(st,p);return}
 if(st.mask){
  const local=st.inverse.transformPoint(new DOMPoint(...p)),g=st.g,r=st.radius/st.l.s;
  g.globalCompositeOperation=st.mode==='hide'?'destination-out':'source-over';
  const brush=g.createRadialGradient(local.x,local.y,0,local.x,local.y,r);
  brush.addColorStop(0,'#fff');brush.addColorStop(Math.min(.999,+$('mask-hardness').value/100),'#fff');brush.addColorStop(1,'transparent');
  if(st.stencil){
   const x=Math.max(0,Math.floor(local.x-r)),y=Math.max(0,Math.floor(local.y-r)),w=Math.min(st.l.cv.width,Math.ceil(local.x+r))-x,h=Math.min(st.l.cv.height,Math.ceil(local.y+r))-y;
   if(w<=0||h<=0)return;
   const tip=st.tip;tip.width=w;tip.height=h;const tg=tip.getContext('2d');tg.translate(-x,-y);tg.fillStyle=brush;tg.fillRect(x,y,w,h);
   tg.globalCompositeOperation='destination-in';tg.drawImage(st.stencil,0,0);g.drawImage(tip,x,y);
  }else{g.fillStyle=brush;g.fillRect(local.x-r,local.y-r,2*r,2*r)}
  maskViews.delete(st.l);
 }else repairDab(st,p[0],p[1]);
}
function repairSourcePixels(){
 if($('lgrade').checked)return flat().data;
 render(false);return ctx.getImageData(0,0,W,H).data;
}
function patchSelection(p){
 const box=sel&&selBox();if(!box){$('repair-note').textContent='Make a selection around the area to repair first.';return}
 const [x,y,w,h]=box,dx=Math.round(p[0]-x-w/2),dy=Math.round(p[1]-y-h/2);
 if(!dx&&!dy)return;
 if(x+dx<0||y+dy<0||x+w+dx>W||y+h+dy>H){$('repair-note').textContent='Choose a source that fits inside the photo.';return}
 const input=repairSourcePixels(),strength=+$('repair-opacity').value/100,delta=[0,0,0];let weight=0;
 // Estimate the colour offset on the selection boundary so the pasted texture meets its surroundings.
 for(let py=y;py<y+h;py++)for(let px=x;px<x+w;px++){
  const i=py*W+px;if(!sel[i])continue;
  if(px>x&&px<x+w-1&&py>y&&py<y+h-1&&sel[i-1]>=sel[i]&&sel[i+1]>=sel[i]&&sel[i-W]>=sel[i]&&sel[i+W]>=sel[i])continue;
  const a=4*i,b=4*(i+dy*W+dx),k=sel[i]/255*input[a+3]*input[b+3]/65025;
  weight+=k;for(let j=0;j<3;j++)delta[j]+=(input[a+j]-input[b+j])*k;
 }
 if(weight)for(let j=0;j<3;j++)delta[j]/=weight;
 pushU(mkSnap('p'));const l=newRepairTarget(),out=l.d.data;
 for(let py=y;py<y+h;py++)for(let px=x;px<x+w;px++){
  const i=py*W+px,j=4*i,q=4*(i+dy*W+dx),a=sel[i]/255*strength*input[q+3]/255;if(!a)continue;
  const old=out[j+3]/255,alpha=a+(1-a)*old;
  for(let ch=0;ch<3;ch++)out[j+ch]=(a*Math.max(0,Math.min(255,input[q+ch]+delta[ch]))+(1-a)*old*out[j+ch])/alpha;
  out[j+3]=255*alpha;
 }
 syncL(l,[x,y,w,h]);refreshLayers();draw();$('repair-note').textContent='Patch applied to the retouch layer.';
}
function resetCorrectionTools(){
 correctionStroke=null;sourcePoint=null;vectorDrag=null;$('vector-edit').checked=false;chooseSource=false;$('repair-mode').value='';$('mask-paint').value='';updateRepair();
}
c.addEventListener('pointerdown',e=>{
 const mode=brushKind();if(!mode||spaceDown||e.button!==0||correctionStroke)return;
 e.preventDefault();e.stopImmediatePropagation();const p=pos(e),mask=['edge','refine','hide','show'].includes(mode);
 if(!mask&&repairSampleNeeded()&&(e.altKey||chooseSource||!sourcePoint||sourcePoint.base!==base)){
  sourcePoint={p,base,offset:null};chooseSource=false;updateRepair();draw(true);return;
 }
 if(!mask&&active?.retouch&&active.lk){$('repair-note').textContent='Unlock the retouch layer to paint.';return}
 if(mode==='patch'){patchSelection(p);return}
 const st={id:e.pointerId,mode,mask,last:p,radius:+$(mask?'mask-brush-radius':'repair-radius').value};
 if(mask){
  st.l=active;if(!st.l||st.l.lk||!st.l.mask&&!['edge','refine'].includes(mode))return;
  pushU(mkSnap('p'));const cv=bc(st.l.cv.width,st.l.cv.height);st.g=cv.getContext('2d');if(st.l.mask)st.g.drawImage(st.l.mask,0,0,cv.width,cv.height);else st.g.fillRect(0,0,cv.width,cv.height);st.l.mask=cv;st.inverse=layerMatrix(st.l).inverse();
  if(sel){st.stencil=layerSelectionStencil(st.l);st.tip=bc(1,1)}
  if(['edge','refine'].includes(mode))beginEdgeStroke(st);
 }else{
  st.image=repairSourcePixels();st.strength=+$('repair-opacity').value/100;
  st.offset=repairSampleNeeded()?(sourcePoint.offset??=sourcePoint.p.map((v,i)=>Math.round(v-p[i]))):[0,0];
  pushU(mkSnap('p'));st.l=newRepairTarget();refreshLayers();
 }
 correctionStroke=st;c.setPointerCapture(e.pointerId);correctionDab(st,p);draw();
},true);
function moveCorrection(e){
 const st=correctionStroke;if(!st||e.pointerId!==st.id)return;
 e.stopImmediatePropagation();if(brushKind()!==st.mode||active!==st.l||active.lk)return;
 const p=pos(e),dx=p[0]-st.last[0],dy=p[1]-st.last[1],d=Math.hypot(dx,dy);if(!d)return;
 const n=Math.ceil(d/Math.max(1,st.radius*.35));
 for(let i=1;i<=n;i++)correctionDab(st,[st.last[0]+dx*i/n,st.last[1]+dy*i/n]);st.last=p;draw();
}
c.addEventListener('pointermove',moveCorrection,true);
function endCorrection(e){if(correctionStroke?.id!==e.pointerId)return;if(e.type==='pointerup')moveCorrection(e);correctionStroke=null;refreshLayers();draw()}
for(const type of ['pointerup','pointercancel','lostpointercapture'])c.addEventListener(type,endCorrection,true);
function drawRepairSource(){
 if(!repairSampleNeeded()||!brushKind()||!sourcePoint||sourcePoint.base!==base)return;
 const [x,y]=sourcePoint.p,k=KK();ctx.save();ctx.lineWidth=1.5*k;ctx.strokeStyle='#75dbff';ctx.beginPath();ctx.arc(x,y,5*k,0,Math.PI*2);ctx.moveTo(x-8*k,y);ctx.lineTo(x+8*k,y);ctx.moveTo(x,y-8*k);ctx.lineTo(x,y+8*k);ctx.stroke();ctx.restore();
}
function vectorPath(v,w,h){
 const p=new Path2D(),points=v.points.map(([x,y])=>[x*w,y*h]),[a,b]=points;
 if(v.kind!=='path'){
  const x=Math.min(a[0],b[0]),y=Math.min(a[1],b[1]),dx=Math.abs(a[0]-b[0]),dy=Math.abs(a[1]-b[1]);
  if(v.kind==='ellipse')p.ellipse(x+dx/2,y+dy/2,dx/2,dy/2,0,0,2*Math.PI);else p.rect(x,y,dx,dy);
 }else{
  p.moveTo(...a);const n=points.length;
  for(let i=0;i<n;i++){
   const j=(i+1)%n,prev=points[(i+n-1)%n],next=points[(j+1)%n],u=points[i],z=points[j];
   if(v.points[i][2]||v.points[j][2]){
    const k=v.points[i][2]?1/6:0,t=v.points[j][2]?1/6:0;
    p.bezierCurveTo(u[0]+k*(z[0]-prev[0]),u[1]+k*(z[1]-prev[1]),z[0]-t*(next[0]-u[0]),z[1]-t*(next[1]-u[1]),...z);
   }else p.lineTo(...z);
  }
 }
 p.closePath();return p;
}
let vectorDrag=null,vectorPoint=0;
function editingVector(){return tab==='layers'&&$('mask-panel').open&&$('vector-edit').checked&&active?.vis&&active.vectorMask&&!active.lk&&!typeDrawing}
function drawVectorGuides(){
 if(!editingVector())return;
 const l=active,v=l.vectorMask,m=layerMatrix(l),k=KK();ctx.save();ctx.transform(m.a,m.b,m.c,m.d,m.e,m.f);
 ctx.strokeStyle='#74d4ff';ctx.lineWidth=1.5*k/l.s;ctx.stroke(vectorPath(v,l.cv.width,l.cv.height));
 v.points.forEach(([x,y],i)=>{ctx.beginPath();ctx.arc(x*l.cv.width,y*l.cv.height,5*k/l.s,0,2*Math.PI);ctx.fillStyle=i===vectorPoint?'#ffc475':'#e7f7ff';ctx.fill();ctx.stroke()});ctx.restore();
}
function setVector(v){
 if(!active||active.lk)return;pushU(mkSnap('p'));active.vectorMask=v;vectorPoint=0;
 $('vector-edit').checked=!!v;$('mask-paint').value='';$('repair-mode').value='';refreshLayers();draw();
}
$('vector-add').onclick=()=>{
 const kind=$('vector-kind').value,points=kind==='path'?[[.15,.78],[.5,.14],[.85,.78]]:[[.12,.12],[.88,.88]];
 setVector({kind,points});
};
$('vector-remove').onclick=()=>setVector(null);
$('vector-edit').onchange=()=>{if($('vector-edit').checked){$('mask-paint').value='';$('repair-mode').value=''}maskControls();draw(true)};
$('mask-panel').addEventListener('toggle',()=>draw(true));
function editVectorPoint(command){
 if(!editingVector())return;const v=active.vectorMask;if(v.kind!=='path')return;
 const points=v.points.map(p=>p.slice()),i=Math.min(vectorPoint,points.length-1);
 if(command==='insert'&&points.length<128){
  const a=points[i],b=points[(i+1)%points.length];points.splice(i+1,0,[(a[0]+b[0])/2,(a[1]+b[1])/2]);vectorPoint=i+1;
 }else if(command==='delete'&&points.length>3){points.splice(i,1);vectorPoint=Math.min(i,points.length-1)}
 else if(command==='curve')points[i][2]=!points[i][2];else return;
 pushU(mkSnap('p'));active.vectorMask={...v,points};refreshLayers();draw();
}
for(const id of ['insert','delete','curve'])$('vector-'+id).onclick=()=>editVectorPoint(id);
c.addEventListener('pointerdown',e=>{
 if(!editingVector()||spaceDown||e.button)return;
 const l=active,m=layerMatrix(l),p=pos(e);
 const hits=l.vectorMask.points.map(([x,y],i)=>{const q=m.transformPoint(new DOMPoint(x*l.cv.width,y*l.cv.height));return {i,d:Math.hypot(p[0]-q.x,p[1]-q.y)}}).sort((a,b)=>a.d-b.d);
 e.stopImmediatePropagation();e.preventDefault();if(hits[0].d>12*KK())return;
 vectorPoint=hits[0].i;vectorDrag={id:e.pointerId,l,inverse:m.inverse(),changed:false};c.setPointerCapture(e.pointerId);draw(true);
},true);
function moveVector(e){
 const st=vectorDrag;if(st?.id!==e.pointerId||active!==st.l||!editingVector())return;e.stopImmediatePropagation();
 const l=st.l,v=l.vectorMask,p=st.inverse.transformPoint(new DOMPoint(...pos(e))),a=v.points[vectorPoint],x=Math.min(1,Math.max(0,p.x/l.cv.width)),y=Math.min(1,Math.max(0,p.y/l.cv.height));
 if(Math.hypot((x-a[0])*l.cv.width,(y-a[1])*l.cv.height)<.3)return;
 if(!st.changed){pushU(mkSnap('p'));st.changed=true}
 l.vectorMask={...v,points:v.points.map((q,i)=>i===vectorPoint?[x,y,!!q[2]]:q)};draw();
}
c.addEventListener('pointermove',moveVector,true);
for(const type of ['pointerup','pointercancel','lostpointercapture'])c.addEventListener(type,e=>{if(vectorDrag?.id!==e.pointerId)return;if(type==='pointerup')moveVector(e);vectorDrag=null;refreshLayers();draw()},true);


let maskBank=[],maskChoice=0;
const maskSamples=new WeakMap();
function maskPixels(id,w,h){
 const item=maskBank.find(m=>m.id===id);if(!item)return null;
 let cache=maskSamples.get(item.cv);
 if(!cache||cache.w!==w||cache.h!==h){const cv=bc(w,h),g=cv.getContext('2d');g.drawImage(item.cv,0,0,w,h);const data=g.getImageData(0,0,w,h).data,alpha=new Uint8Array(w*h);for(let i=0;i<alpha.length;i++)alpha[i]=data[4*i+3];cache={w,h,alpha};maskSamples.set(item.cv,cache)}
 return cache.alpha;
}
function selectionCanvas(){
 if(!sel)return null;
 const cv=bc(W,H),g=cv.getContext('2d'),im=g.createImageData(W,H);for(let i=0;i<sel.length;i++)im.data[4*i+3]=sel[i];g.putImageData(im,0,0);return cv;
}
function layerToMask(l){const cv=bc(W,H),g=cv.getContext('2d');g.setTransform(layerMatrix(l));const view=visibleLayer(l).cv,w=view.width,h=view.height,rect=[l.cl*w,l.ct*h,(1-l.cl-l.cr)*w,(1-l.ct-l.cb)*h];g.drawImage(view,...rect,...rect);return cv}
function localMask(l,cv){const result=bc(l.cv.width,l.cv.height),g=result.getContext('2d');g.setTransform(layerMatrix(l).inverse());g.drawImage(cv,0,0);return result}
function bankUndo(){const old=maskBank,id=maskChoice;return ()=>{const redo=bankUndo();maskBank=old;maskChoice=id;film.invalidate();syncMaskBank();draw();return redo}}
function syncMaskBank(){
 const list=$('saved-mask-list');list.replaceChildren(...maskBank.map(m=>new Option(m.name,m.id)));if(!maskBank.some(m=>m.id===maskChoice))maskChoice=maskBank[0]?.id||0;list.value=maskChoice;
 for(const id of ['mask-recall','mask-to-grade','mask-to-fill'])$(id).disabled=!maskChoice;
 $('mask-to-layer').disabled=!maskChoice||!active||active.lk;$('save-selection-mask').disabled=!sel;$('save-layer-mask').disabled=!active;
}
function storeMask(cv){
 if(!cv)return;
 const name=$('saved-mask-name').value.trim()||'Mask '+(maskBank.length+1),old=maskBank.find(m=>m.name===name);
 pushU(bankUndo());maskChoice=old?.id||Math.max(0,...maskBank.map(m=>m.id))+1;maskBank=[...maskBank.filter(m=>m.id!==maskChoice),{id:maskChoice,name,cv}];
 $('saved-mask-note').textContent='Saved '+name+'.';syncMaskBank();film.invalidate();draw();
}
$('save-selection-mask').onclick=()=>storeMask(selectionCanvas());
$('save-layer-mask').onclick=()=>active&&storeMask(layerToMask(active));
$('saved-mask-list').onchange=e=>{maskChoice=+e.target.value;const m=maskBank.find(m=>m.id===maskChoice);$('saved-mask-name').value=m?.name||''};
$('mask-recall').onclick=()=>{const alpha=maskPixels(maskChoice,W,H);if(alpha){pushU(selSnap());sel=alpha.slice();updInfo();draw()}};
$('mask-to-layer').onclick=()=>{if(active&&!active.lk&&maskChoice){replaceMask(localMask(active,maskBank.find(m=>m.id===maskChoice).cv));jumpTool('layers','mask-panel')}};
$('mask-to-grade').onclick=()=>{if(maskChoice){film.gradeMask(maskChoice);jumpTool('grade','local-tools')}};
$('mask-to-fill').onclick=()=>{if(maskChoice){film.focusDouble();film.fillMask(maskChoice)}};
function transformBank(matrix,w,h){maskBank=maskBank.map(m=>{const cv=bc(w,h),g=cv.getContext('2d');g.setTransform(matrix);g.drawImage(m.cv,0,0);return {...m,cv}})}
function beginEdgeStroke(st){
 const w=st.l.cv.width,h=st.l.cv.height,source=bc(w,h),g=source.getContext('2d');
 g.drawImage(st.l.cv,0,0);g.globalCompositeOperation='destination-in';g.drawImage(st.l.mask,0,0);
 const blurred=bc(w,h),bg=blurred.getContext('2d');bg.filter='blur('+Math.max(.65,+$('edge-width').value/st.l.s)+'px)';bg.drawImage(source,0,0);
 st.edge=bg.getImageData(0,0,w,h).data;st.coverage=g.getImageData(0,0,w,h).data;
 st.source=st.l.d.data;st.width=w;st.height=h;st.flow=+$('edge-flow').value/100;
 if(st.stencil)st.limit=st.stencil.getContext('2d').getImageData(0,0,w,h).data;
}
function brushEdge(st,p){
 const local=st.inverse.transformPoint(new DOMPoint(...p)),r=st.radius/st.l.s,x=Math.max(0,Math.floor(local.x-r)),y=Math.max(0,Math.floor(local.y-r));
 const w=Math.min(st.width,Math.ceil(local.x+r))-x,h=Math.min(st.height,Math.ceil(local.y+r))-y;if(w<=0||h<=0)return;
 const patch=st.g.getImageData(x,y,w,h),out=patch.data,step=Math.max(1,Math.round(+$('edge-width').value/st.l.s/2));
 for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){
  const px=x+xx,py=y+yy,i=4*(py*st.width+px),j=4*(yy*w+xx),alpha=st.source[i+3];if(!alpha)continue;
  const fall=1-ss(Math.min(.99,+$('mask-hardness').value/100),1,Math.hypot(px+.5-local.x,py+.5-local.y)/r);if(!fall)continue;
  let coverage=st.edge[i+3];
  if(st.mode==='refine'&&coverage>1&&coverage<254){
   let sum=0,weight=0;
   for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){
    const sx=px+dx*step,sy=py+dy*step,q=4*(sy*st.width+sx);
    if(sx<0||sx>=st.width||sy<0||sy>=st.height){weight+=.2;continue}
    const distance=Math.abs(st.source[q]-st.source[i])+Math.abs(st.source[q+1]-st.source[i+1])+Math.abs(st.source[q+2]-st.source[i+2]);
    const k=Math.exp(-distance/45-(dx*dx+dy*dy)/5);sum+=k*st.coverage[q+3];weight+=k;
   }
   if(weight)coverage=sum/weight;
  }
  const target=Math.min(255,255*coverage/alpha);out[j+3]+=(target-out[j+3])*fall*st.flow*(st.limit?st.limit[i+3]/255:1);
 }
 st.g.putImageData(patch,x,y);maskViews.delete(st.l);
}
$('edge-start').onclick=()=>{if(!active||active.lk)return;$('mask-panel').open=true;$('mask-paint').value='edge';$('mask-paint').onchange();$('edge-options').hidden=false;$('mask-paint').focus()};


const effectLabels={curve:'Tone curve',film:'Film look',grain:'Film grain',halation:'Halation'};
let effectIndex=0,stackOwner=null;
function layerEffects(cv,stack){
 let current=cv;
 for(const e of stack){
  if(!e.on||!e.amount)continue;
  const w=cv.width,h=cv.height,next=bc(w,h),g=next.getContext('2d'),im=current.getContext('2d').getImageData(0,0,w,h);
  let processed;
  if(e.kind==='halation'){
   const light=bc(w,h),lg=light.getContext('2d'),map=lg.createImageData(w,h);
   for(let i=0;i<map.data.length;i+=4){const p=im.data,l=(.2126*p[i]+.7152*p[i+1]+.0722*p[i+2])/255;map.data[i]=255;map.data[i+1]=69;map.data[i+2]=21;map.data[i+3]=p[i+3]*ss(.55,.96,l)}
   lg.putImageData(map,0,0);g.drawImage(current,0,0);g.globalCompositeOperation='screen';g.filter='blur('+Math.max(.6,e.param*Math.min(w,h)/1200)+'px)';g.drawImage(light,0,0);processed=g.getImageData(0,0,w,h);
  }else processed=film.effectPixels(im,e);
  let mask=null;if(e.mask){g.setTransform(1,0,0,1,0,0);g.filter='none';g.globalCompositeOperation='copy';g.drawImage(e.mask,0,0,w,h);mask=g.getImageData(0,0,w,h).data}
  for(let i=0;i<im.data.length;i+=4){const blend=e.amount/100*(mask?mask[i+3]/255:1);for(let k=0;k<3;k++)im.data[i+k]+=(processed.data[i+k]-im.data[i+k])*blend}
  g.putImageData(im,0,0);current=next;
 }
 return current;
}
function editStack(fn,undo=true){
 if(!active||active.lk)return;if(undo)pushU(mkSnap('p'));active.fxStack=(active.fxStack||[]).map(e=>({...e}));fn(active.fxStack);maskViews.delete(active);draw();
}
function syncStack(){
 const l=active,stack=l?.fxStack||[];if(stackOwner!==l){stackOwner=l;effectIndex=0}
 effectIndex=Math.max(0,Math.min(stack.length-1,effectIndex));const e=stack[effectIndex],list=$('fx-list');
 list.replaceChildren(...stack.map((v,i)=>{const b=document.createElement('button');b.type='button';b.draggable=!l.lk;b.dataset.effect=i;b.setAttribute('aria-pressed',String(i===effectIndex));b.textContent=(i+1)+'. '+effectLabels[v.kind]+(v.on?'':' (off)')+(v.mask?' · masked':'');return b}));
 $('fx-add').disabled=!l||l.lk;$('fx-controls').hidden=!e;if(!e)return;
 $('fx-controls').disabled=l.lk;$('fx-on').checked=e.on;$('fx-amount').value=e.amount;$('fx-amount').nextElementSibling.value=e.amount+'%';
 $('fx-film-row').hidden=e.kind!=='film';$('fx-param-row').hidden=e.kind==='film';
 if(e.kind==='film')$('fx-film').value=e.recipe;else{$('fx-param-name').textContent={curve:'Midtone output',grain:'Grain size',halation:'Glow radius'}[e.kind];$('fx-param').max=e.kind==='curve'?254:100;$('fx-param').value=e.param;$('fx-param').nextElementSibling.value=e.param}
 $('fx-up').disabled=effectIndex===0;$('fx-down').disabled=effectIndex===stack.length-1;
 $('fx-mask').replaceChildren(new Option('Whole layer',''),...(sel?[new Option('Current selection','selection')]:[]),...maskBank.map(m=>new Option(m.name,m.id)),...(e.mask?[new Option(e.maskName||'Effect mask','current')]:[]));$('fx-mask').value=e.mask?'current':'';
}
function moveEffect(from,to){if(!active||to<0||to>=active.fxStack.length||from===to)return;editStack(s=>s.splice(to,0,s.splice(from,1)[0]));effectIndex=to;syncStack()}
$('fx-add').onclick=()=>{const kind=$('fx-kind').value;editStack(s=>{s.push({kind,on:true,amount:70,param:{curve:159,film:0,grain:35,halation:18}[kind],recipe:41});effectIndex=s.length-1});syncStack()};
$('fx-list').onclick=e=>{const b=e.target.closest('[data-effect]');if(b){effectIndex=+b.dataset.effect;syncStack()}};
$('fx-list').ondragstart=e=>e.dataTransfer.setData('text/totone-effect',e.target.dataset.effect);
$('fx-list').ondragover=e=>e.preventDefault();$('fx-list').ondrop=e=>{e.preventDefault();const to=e.target.closest('[data-effect]'),from=e.dataTransfer.getData('text/totone-effect');if(to&&from!=='')moveEffect(+from,+to.dataset.effect)};
$('fx-up').onclick=()=>moveEffect(effectIndex,effectIndex-1);$('fx-down').onclick=()=>moveEffect(effectIndex,effectIndex+1);
$('fx-remove').onclick=()=>{editStack(s=>s.splice(effectIndex,1));syncStack()};
for(const [id,key] of [['fx-on','on'],['fx-amount','amount'],['fx-param','param'],['fx-film','recipe']]){
 const el=$(id);let held=false;el.oninput=()=>{editStack(s=>{s[effectIndex][key]=el.type==='checkbox'?el.checked:+el.value},!held);held=true;syncStack()};el.onchange=el.onblur=()=>{held=false};
}
$('fx-mask').onchange=e=>{const v=e.target.value;if(v==='current')return;const item=maskBank.find(m=>m.id===+v),cv=v==='selection'?selectionCanvas():item?.cv;
 editStack(s=>{s[effectIndex].mask=cv?localMask(active,cv):null;s[effectIndex].maskName=item?.name||'Selection mask'});syncStack()};


function toneStats(im){
 const zones=[[0,0,0,0],[0,0,0,0],[0,0,0,0]],all=[0,0,0,0],p=im.data,step=Math.max(1,Math.floor(Math.sqrt(im.width*im.height/24000)));
 for(let y=0;y<im.height;y+=step)for(let x=0;x<im.width;x+=step){
  const i=4*(y*im.width+x),a=p[i+3]/255;if(!a)continue;
  const lum=(.2126*p[i]+.7152*p[i+1]+.0722*p[i+2])/255;
  for(let z=0;z<3;z++){const k=a*Math.max(0,1-Math.abs(2*lum-z));for(let c=0;c<3;c++)zones[z][c]+=p[i+c]*k;zones[z][3]+=k}
  for(let c=0;c<3;c++)all[c]+=p[i+c]*a;all[3]+=a;
 }
 return zones.map(row=>row.slice(0,3).map((v,c)=>row[3]>1?v/row[3]:all[c]/(all[3]||1)));
}
function matchReference(im,ref){
 if(!ref||!ref.amounts.some(Boolean))return;
 const current=toneStats(im),deltas=current.map((row,z)=>row.map((v,k)=>(ref.tones[z][k]-v)*ref.amounts[z]/100)),p=im.data;
 for(let i=0;i<p.length;i+=4){if(!p[i+3])continue;const r=p[i],g=p[i+1],b=p[i+2],level=(.2126*r+.7152*g+.0722*b)*2/255,z=Math.min(1,Math.floor(level)),f=level-z;
  const skin=ref.skin&&r>g&&g>b&&r-b>12?1-.88*ss(0,.3,(r-g)/(r+1))*(1-ss(.55,.85,(r-b)/(r+1))):1;
  for(let k=0;k<3;k++)p[i+k]+=skin*(deltas[z][k]*(1-f)+deltas[z+1][k]*f);
 }
}
async function photoPixels(file,limit){
 const bitmap=await createImageBitmap(file);
 try{const scale=Math.min(1,limit/Math.max(bitmap.width,bitmap.height),Math.sqrt(18000000/(bitmap.width*bitmap.height))),cv=bc(Math.max(1,Math.round(bitmap.width*scale)),Math.max(1,Math.round(bitmap.height*scale))),g=cv.getContext('2d');g.drawImage(bitmap,0,0,cv.width,cv.height);return g.getImageData(0,0,cv.width,cv.height)}finally{bitmap.close()}
}
let referenceJob=0;
$('ref-file').onchange=async e=>{
 const file=e.target.files[0],doc=imageRequest,job=++referenceJob;e.target.value='';if(!file||!base)return;
 try{const im=await photoPixels(file,240);if(job!==referenceJob||doc!==imageRequest)return;film.setReference({name:file.name,tones:toneStats(im),amounts:[65,65,65],skin:true})}
 catch{$('ref-status').textContent='Could not read the reference photo.'}
};
function syncReference(){
 const ref=film?.state.reference;$('ref-choose').disabled=!base;$('ref-controls').hidden=!ref;$('ref-status').textContent=ref?ref.name:'';
 if(!ref)return;for(const [z,el] of [...document.querySelectorAll('[data-ref-zone]')].entries()){el.value=ref.amounts[z];el.nextElementSibling.value=el.value+'%'}$('ref-skin').checked=ref.skin;
}
$('ref-choose').onclick=()=>$('ref-file').click();$('ref-clear').onclick=()=>film.setReference(null);
for(const el of document.querySelectorAll('[data-ref-zone],#ref-skin')){
 let gesture=false;el.oninput=()=>{const ref=structuredClone(film.state.reference);if(!ref)return;if(el.id==='ref-skin')ref.skin=el.checked;else ref.amounts[+el.dataset.refZone]=+el.value;
 film.setReference(ref,!gesture);gesture=true};el.onchange=el.onblur=()=>{gesture=false};
}
let namedLooks=[];
try{const saved=JSON.parse(localStorage.getItem('totone:looks')||'[]');if(Array.isArray(saved))namedLooks=saved.filter(l=>typeof l.name==='string'&&l.state?.f&&Array.isArray(l.glints))}catch{}
function captureLook(name){
 const state=structuredClone(film.state);delete state.d;if(state.grading)state.grading.masks=state.grading.masks?.filter(m=>m.kind!=='saved');
 return {name,state,glints:layers.filter(l=>l.vis&&l.overlay?.i===glintIndex&&!l.o).map(l=>({settings:structuredClone(l.overlay),opacity:l.op,blend:l.bm}))};
}
function refreshLooks(name){
 const list=$('look-list');list.replaceChildren(...namedLooks.map(l=>new Option(l.name,l.name)));if(name&&namedLooks.some(l=>l.name===name))list.value=name;
 $('look-apply').disabled=!base||!namedLooks.length;$('look-save').disabled=!base;$('batch-files').disabled=!namedLooks.length;
}
$('look-save').onclick=()=>{const name=$('look-name').value.trim();if(!name){$('look-name').focus();return}
 const next=[...namedLooks.filter(l=>l.name!==name),captureLook(name)];
 try{localStorage.setItem('totone:looks',JSON.stringify(next));namedLooks=next;refreshLooks(name);$('look-status').textContent='Saved '+name+' in this browser.'}catch{$('look-status').textContent='Browser storage is full or unavailable.'}
};
$('look-apply').onclick=()=>{const look=namedLooks.find(l=>l.name===$('look-list').value);if(!look||!base)return;
 pushU(documentUndo());layers=layers.filter(l=>l.lk||l.overlay?.i!==glintIndex||l.o);if(!layers.includes(active))active=layers.at(-1)||null;
 film.applySavedLook(look.state);for(const glint of look.glints){addOv(glintIndex,glint.settings,false);active.op=glint.opacity;active.bm=glint.blend}refreshLayers();draw()
};
function batchRender(im,look,ev){
 const state=structuredClone(look.state);state.a.exp+=ev;const output=film.renderLook(im,state),cv=bc(im.width,im.height),g=cv.getContext('2d');g.putImageData(output,0,0);
 if(look.glints.length){const source=bc(im.width,im.height);source.getContext('2d').putImageData(im,0,0);
  for(const glint of look.glints){const layer=overlayPixels(glint.settings,im.width,im.height,source);g.globalAlpha=glint.opacity;g.globalCompositeOperation=glint.blend;g.drawImage(layer.cv,0,0)}}
 return cv;
}
// A stored ZIP keeps already-compressed PNG files intact and downloads the set in one action.
const crcTable=Uint32Array.from({length:256},(_,i)=>{let c=i;for(let j=0;j<8;j++)c=(c>>>1)^((c&1)?0xedb88320:0);return c>>>0});
async function zipPhotos(entries){
 const parts=[],directory=[];let offset=0,centralSize=0;
 for(const [filename,blob] of entries){
  const name=new TextEncoder().encode(filename),data=new Uint8Array(await blob.arrayBuffer());let crc=0xffffffff;for(const byte of data)crc=(crc>>>8)^crcTable[(crc^byte)&255];crc=(crc^0xffffffff)>>>0;
  const head=new Uint8Array(30+name.length),h=new DataView(head.buffer);h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x800,true);h.setUint32(14,crc,true);h.setUint32(18,data.length,true);h.setUint32(22,data.length,true);h.setUint16(26,name.length,true);head.set(name,30);
  const record=new Uint8Array(46+name.length),r=new DataView(record.buffer);r.setUint32(0,0x02014b50,true);r.setUint16(4,20,true);record.set(head.subarray(4,30),6);r.setUint32(42,offset,true);record.set(name,46);
  directory.push(record);parts.push(head,blob);offset+=head.length+data.length;centralSize+=record.length;
  if(offset+centralSize>=0xffffffff||entries.length>65535)throw Error('Choose a smaller set for this ZIP.');
 }
 const end=new Uint8Array(22),v=new DataView(end.buffer);v.setUint32(0,0x06054b50,true);v.setUint16(8,entries.length,true);v.setUint16(10,entries.length,true);v.setUint32(12,centralSize,true);v.setUint32(16,offset,true);
 return new Blob([...parts,...directory,end],{type:'application/zip'});
}
let batch=[],batchJob=0,batchBusy=false;
function previewBatch(row){const look=namedLooks.find(l=>l.name===$('look-list').value);if(!look)return;const view=batchRender(row.thumb,look,row.ev);row.canvas.getContext('2d').drawImage(view,0,0)}
$('look-list').onchange=()=>batch.forEach(previewBatch);
$('batch-files').onchange=async e=>{
 const files=[...e.target.files],job=++batchJob;e.target.value='';if(!files.length)return;batch=[];$('batch-items').replaceChildren();$('batch-export').disabled=true;const failed=[];
 for(const file of files){try{const thumb=await photoPixels(file,128);if(job!==batchJob)return;
  const canvas=bc(thumb.width,thumb.height),label=document.createElement('label'),ev=document.createElement('input');ev.type='number';ev.min=-4;ev.max=4;ev.step=.1;ev.value=0;ev.setAttribute('aria-label',file.name+' exposure in EV');
  const row={file,thumb,canvas,ev:0};batch.push(row);label.append(canvas,document.createTextNode(file.name+' · EV'),ev);$('batch-items').append(label);previewBatch(row);ev.oninput=()=>{row.ev=Math.max(-4,Math.min(4,+ev.value||0));previewBatch(row)}
 }catch{failed.push(file.name)}}if(job!==batchJob)return;$('batch-export').disabled=!batch.length;$('look-status').textContent=batch.length+' photos ready.'+(failed.length?' Could not read '+failed.join(', '):'');
};
$('batch-export').onclick=async()=>{
 const look=namedLooks.find(l=>l.name===$('look-list').value),items=batch.map(r=>({file:r.file,ev:r.ev}));if(!items.length||batchBusy||!look)return;
 batchBusy=true;$('batch-setup').disabled=true;const entries=[],limit=+$('mx').value;
 try{for(const [i,row] of items.entries()){
  $('look-status').textContent='Rendering '+(i+1)+' of '+items.length+'…';const im=await photoPixels(row.file,limit),blob=await toBlob(batchRender(im,look,row.ev),'image/png');if(!blob)throw Error('Could not encode '+row.file.name);
  entries.push([String(i+1).padStart(3,'0')+'-'+row.file.name.replace(/\.[^.]*$/,'').replace(/[\\/:*?"<>|]/g,'_')+'.png',blob])
 }downloadBlob(await zipPhotos(entries),'Totone photos.zip');$('look-status').textContent='Exported '+items.length+' photos.'}catch(e){$('look-status').textContent=e.message}finally{batchBusy=false;$('batch-setup').disabled=false}
};


function jumpTool(tabName,id){
 if(tabName==='dialog'){if(id==='upscale'&&typeof openUpscaler==='function')openUpscaler();else if(id==='elements'&&typeof openElements==='function')openElements();return}
 const tabButton=document.querySelector('.tabs [data-t="'+tabName+'"]');if(!tabButton)return;tabButton.click();
 const el=$(id);if(!el)return;let parent=el;while(parent){if(parent.tagName==='DETAILS')parent.open=true;parent=parent.parentElement}
 const target=el.tagName==='DETAILS'?el.querySelector('summary'):el;target.scrollIntoView({block:'nearest',behavior:'smooth'});target.focus({preventScroll:true});
 target.classList.remove('jump-flash');void target.offsetWidth;target.classList.add('jump-flash');setTimeout(()=>target.classList.remove('jump-flash'),1000);
}
const toolCommands=[
 ['Upscale image (AI / Upscayl)','dialog','upscale','upscale super resolution esrgan enhance sharpen 2x 4x hd quality'],
 ['Search web elements (PNG / Icons / Pinterest / Google)','dialog','elements','elements search stock sticker icon png cutout pinterest google image layer'],
 ['Saved masks','select','saved-masks','subject silhouette hair selection reuse library'],['Select subject','select','auto2','person object cutout'],
 ['Smooth layer edges','layers','edge-start','brush hair refine side feather outline'],['Layer mask','layers','mask-panel','hide reveal mask hair cutout'],
 ['Layer effects stack','layers','fx-panel','order curve grain halation effect'],['Retouch brush','layers','retouch-panel','heal clone spot blemish repair'],
 ['Reference colour match','grade','reference-panel','color copy still protect skin'],['Local grading masks','grade','local-tools','exposure gradient radial'],
 ['Tone curves','grade','curve-plot','contrast rgb graph'],['HSL colour mixer','grade','hsl-tools','hue saturation lightness color'],
 ['Saved looks and batch export','film','batch-panel','set apply series zip grain preset'],['Double exposure','film','film-section','fill subject blend silhouette'],
 ['Film grain','film','film-section','texture stock noise finish'],['White balance','film','film-section','neutral sample temperature'],
 ['Film presets','film','film-section','cinematic stocks looks'],['Photo-filled lettering','text','tx-fill','image type text'],
 ['Custom text warp','text','custom-warp','bend curve lettering'],['Glints','glints','glint-look','star sparkle lens halation'],
 ['Gradient map','tone','gradient-enabled','duo recolour palette'],['Crop and straighten','crop','cgrid','rotate frame aspect ratio']
];
const tabLabelMap={dialog:'Tool',select:'Select',layers:'Layers',grade:'Grade',film:'Film',text:'Text',glints:'Glints',tone:'Tone',crop:'Crop',adjust:'Adjust',warp:'Warp',pixel:'Pixel'};
function searchTools(){
 const q=$('tool-query').value.toLowerCase().trim().split(/\s+/).filter(Boolean);
 const rows=toolCommands.filter(([n,t,,alias])=>q.every(k=>(n+' '+t+' '+alias).toLowerCase().includes(k)));
 const list=$('tool-results');list.replaceChildren(...rows.map(row=>{const b=document.createElement('button');b.innerHTML=`${esc(row[0])}<span>${esc(tabLabelMap[row[1]]||row[1])}</span>`;b.onclick=()=>{$('tool-dialog').close();jumpTool(row[1],row[2]);
  if(row[2]==='film-section'){const section={'Double exposure':'double','Film grain':'finish','White balance':'detail','Film presets':'presets'}[row[0]];$('film-section').value=section;$('film-section').dispatchEvent(new Event('change'))}
 };return b}));if(!rows.length)list.textContent='No matching tools.';
}
function openToolSearch(){if(document.querySelector('dialog[open]'))return;$('tool-query').value='';searchTools();$('tool-dialog').showModal();$('tool-query').focus()}
$('tool-finder').onclick=openToolSearch;$('tool-close').onclick=()=>$('tool-dialog').close();$('tool-query').oninput=searchTools;
$('tool-dialog').onkeydown=e=>{e.stopPropagation();const buttons=[...$('tool-results').querySelectorAll('button')],i=buttons.indexOf(document.activeElement);
 if(e.key==='Enter'&&e.target===$('tool-query')){e.preventDefault();buttons[0]?.click()}
 if((e.key==='ArrowDown'||e.key==='ArrowUp')&&buttons.length){e.preventDefault();buttons[(i+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length].focus()}
};
document.addEventListener('keydown',e=>{
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openToolSearch();return}
 if(e.key==='/'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.target.closest('input,select,textarea,[contenteditable="true"],dialog')){e.preventDefault();openToolSearch()}
});

let toastTimer=0;
function showToast(message,ms=1900){
 const el=$('toast');if(!el||!message)return;
 el.textContent=message;el.classList.add('show');
 clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),ms);
}
function enhanceSliders(root=document){
 root.querySelectorAll('input[type=range]').forEach(el=>{
  if(el.dataset.uxReady)return;el.dataset.uxReady='1';
  if(el.dataset.def===undefined)el.dataset.def=el.value;
  if(!el.title)el.title='Double-click to reset';
  const lbl=el.closest('label');
  if(lbl&&!el.closest('header')&&!lbl.querySelector('output')&&!lbl.querySelector('input[type=number]')){
   const out=document.createElement('output');out.className='auto-out';
   const unit=el.dataset.unit||(el.id==='ah'||el.id==='lkh'||el.id==='lr'?'°':el.id==='size'||el.id==='ssz'||el.id==='fe'||el.id==='lkr'||el.id==='fow'||el.id==='gr'?' px':el.max==='100'&&el.min==='0'||el.id==='bs'||el.id==='lg'?'%':'');
   const sync=()=>{out.value=el.value+unit};
   el._syncOut=sync;
   sync();el.after(out);el.addEventListener('input',sync);el.addEventListener('change',sync);
  }
  el.addEventListener('dblclick',()=>{
   if(el.disabled||el.dataset.def===undefined)return;
   if(el.value===el.dataset.def)return;
   el.value=el.dataset.def;
   el.dispatchEvent(new Event('input',{bubbles:true}));
   el.dispatchEvent(new Event('change',{bubbles:true}));
   const name=el.closest('label')?.childNodes[0]?.textContent?.trim()||'Control';
   showToast(`${name} reset to ${el.value}`,1100);
  });
 });
}
function syncAutoOutputs(){document.querySelectorAll('input[type=range]').forEach(el=>el._syncOut?.())}
enhanceSliders();
new MutationObserver(()=>enhanceSliders($('film-controls'))).observe($('film-controls'),{childList:true,subtree:true});
$('adjr').addEventListener('click',()=>{syncAutoOutputs();showToast('Adjustments reset',1200)});
$('rlook').addEventListener('click',()=>{syncAutoOutputs();showToast('Look reset',1200)});
$('empty-open').onclick=()=>$('open').click();
$('empty-sample').onclick=()=>$('film-sample').click();
$('empty-elements').onclick=()=>{if(typeof openElements==='function')openElements()};
const origRefreshLayers=refreshLayers;
refreshLayers=function(){origRefreshLayers();syncActionStates();syncAutoOutputs()};
syncActionStates();
const draftDB=new Promise((resolve,reject)=>{
 try{const request=indexedDB.open('totone-recovery',1);request.onupgradeneeded=()=>request.result.createObjectStore('drafts',{keyPath:'key'}).createIndex('time','time');
 request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)}catch(e){reject(e)}
});
let draftKey;try{draftKey=sessionStorage.getItem('totone:session')||crypto.randomUUID();sessionStorage.setItem('totone:session',draftKey)}catch{draftKey=String(Date.now())+'-'+Math.random()}
let draftTimer=0,draftDirty=false,draftBusy=false,previousDraft=null,draftRevision=0;
function draftStatus(message){$('draft-status').textContent=message}
const draftReady=draftDB.then(db=>new Promise((done,fail)=>{
 const req=db.transaction('drafts').objectStore('drafts').index('time').openCursor(null,'prev');req.onsuccess=()=>{previousDraft=req.result?.value||null;$('recover-empty').hidden=$('recover-project').hidden=!previousDraft;done()};req.onerror=()=>fail(req.error);
})).catch(()=>draftStatus('Local recovery is unavailable in this browser.'));
function queueDraft(){
 if(!base)return;draftDirty=true;draftRevision++;clearTimeout(draftTimer);draftTimer=setTimeout(writeDraft,1800);
}
async function writeDraft(){
 if(!base||!draftDirty||draftBusy)return;draftBusy=true;const revision=draftRevision;
 try{await draftReady;const db=await draftDB;const record={key:draftKey,time:Date.now(),name:projectTitle,blob:packProject(captureDocument(),versions)};
 await new Promise((done,fail)=>{const tx=db.transaction('drafts','readwrite');tx.objectStore('drafts').put(record);tx.oncomplete=done;tx.onabort=tx.onerror=()=>fail(tx.error)});
 draftStatus('Saved on this device at '+new Date(record.time).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})+'.');
 }catch{draftStatus('Local save failed. Save a project file to keep this edit.')}
 finally{draftBusy=false;draftDirty=revision!==draftRevision;if(draftDirty){clearTimeout(draftTimer);draftTimer=setTimeout(writeDraft,1000)}}
}
async function restoreDraft(){
 if(!previousDraft)return;const doc=imageRequest;
 try{const bundle=await unpackProject(previousDraft.blob);if(doc!==imageRequest)return;const prior=base?documentUndo():null;installDocument(bundle.doc);versions=bundle.pins;projectTitle=previousDraft.name;undoStack=[];redoS=[];if(prior)pushU(prior);updatePins();
 $('recover-empty').hidden=$('recover-project').hidden=true;if($('project-dialog').open)$('project-dialog').close();queueDraft()
 }catch{draftStatus('The recovery copy could not be opened.')}
}
$('recover-empty').onclick=$('recover-project').onclick=restoreDraft;
document.addEventListener('input',e=>{if(e.target.closest('.pn')&&!['search','file'].includes(e.target.type))queueDraft()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)writeDraft()});
window.addEventListener('pagehide',()=>{if(draftDirty)writeDraft()});


/* ---------- AI & Detail Image Upscaler (Upscayl-style) ---------- */
const extScripts=new Map(),upscalerCache=new Map();
function loadExtScript(url){
 if(extScripts.has(url))return extScripts.get(url);
 const p=new Promise((resolve,reject)=>{
  const s=document.createElement('script');s.src=url;s.crossOrigin='anonymous';
  s.onload=resolve;s.onerror=()=>{extScripts.delete(url);reject(Error('Could not load '+url.split('/').pop()))};
  document.head.appendChild(s);
 });
 extScripts.set(url,p);return p;
}
const AI_MODELS={
 'esrgan-medium:2':{url:'https://cdn.jsdelivr.net/npm/@upscalerjs/esrgan-medium@latest/dist/umd/2x.min.js',global:'ESRGANMedium2x',scale:2},
 'esrgan-medium:4':{url:'https://cdn.jsdelivr.net/npm/@upscalerjs/esrgan-medium@latest/dist/umd/4x.min.js',global:'ESRGANMedium4x',scale:4},
 'esrgan-slim:2':{url:'https://cdn.jsdelivr.net/npm/@upscalerjs/esrgan-slim@latest/dist/umd/2x.min.js',global:'ESRGANSlim2x',scale:2},
 'esrgan-slim:4':{url:'https://cdn.jsdelivr.net/npm/@upscalerjs/esrgan-slim@latest/dist/umd/4x.min.js',global:'ESRGANSlim4x',scale:4},
 'esrgan-gan:4':{url:'https://cdn.jsdelivr.net/npm/@upscalerjs/esrgan-legacy@latest/dist/umd/gans.min.js',global:'ESRGANLegacyGANS',scale:4}
};
let upSrc=null,upOut=null,upBusy=false,upAbort=null,upTargetLayer=null,upSplitDrag=false;

function upCaptureSource(){
 const tgt=$('up-target').value;
 if(tgt==='layer'&&active){
  const cv=bc(active.cv.width,active.cv.height);cv.getContext('2d').drawImage(active.cv,0,0);
  upTargetLayer=active;return cv;
 }
 upTargetLayer=null;
 if(!base)return null;
 const cv=bc(W,H);cv.getContext('2d').putImageData(base,0,0);return cv;
}
function upSyncControls(){
 const eng=$('up-engine').value,scSel=$('up-scale');
 const optLayer=$('up-target').querySelector('option[value="layer"]');
 optLayer.disabled=!active||active.lk;
 if($('up-target').value==='layer'&&optLayer.disabled)$('up-target').value='photo';
 scSel.querySelector('option[value="3"]').disabled=eng!=='detail';
 scSel.querySelector('option[value="2"]').disabled=eng==='esrgan-gan';
 if(eng==='esrgan-gan')scSel.value='4';
 else if(eng!=='detail'&&scSel.value==='3')scSel.value='2';
 const src=upSrc||upCaptureSource();
 if(!src){$('up-dims').textContent='Open an image first.';$('up-run').disabled=true;return}
 $('up-run').disabled=upBusy;
 const factor=+scSel.value;
 const maxSide=4096,maxPx=16000000;
 let tw=Math.round(src.width*factor),th=Math.round(src.height*factor),capped=false;
 const cap=Math.min(1,maxSide/Math.max(tw,th),Math.sqrt(maxPx/(tw*th)));
 if(cap<1){tw=Math.max(1,Math.round(tw*cap));th=Math.max(1,Math.round(th*cap));capped=true}
 $('up-dims').textContent=`${src.width} × ${src.height} px → ${tw} × ${th} px (${factor}×${capped?', capped to 4096 px / 16 MP':''})`;
}
function drawUpComparison(){
 const canvas=$('up-canvas'),stageEl=$('upscale-stage');
 const rect=stageEl.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1);
 const cw=Math.max(1,Math.round(rect.width*dpr)),ch=Math.max(1,Math.round(rect.height*dpr));
 if(canvas.width!==cw)canvas.width=cw;if(canvas.height!==ch)canvas.height=ch;
 const g=canvas.getContext('2d');g.clearRect(0,0,cw,ch);
 const before=upSrc,after=upOut||upSrc;if(!before)return;
 const zm=$('up-zoom').value;
 const refW=after.width,refH=after.height;
 const scale=zm==='fit'?Math.min(cw/refW,ch/refH):+zm*dpr*(before.width/refW);
 const dw=refW*scale,dh=refH*scale,dx=(cw-dw)/2,dy=(ch-dh)/2;
 const splitX=Math.round(cw*(+$('up-split').value/100));
 // Left: Original (smooth reference)
 g.save();g.beginPath();g.rect(0,0,splitX,ch);g.clip();
 g.imageSmoothingEnabled=true;g.imageSmoothingQuality='medium';
 g.drawImage(before,dx,dy,dw,dh);g.restore();
 // Right: Upscaled
 g.save();g.beginPath();g.rect(splitX,0,cw-splitX,ch);g.clip();
 g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
 g.drawImage(after,dx,dy,dw,dh);g.restore();
 // Divider & labels
 g.fillStyle='#ffffff';g.fillRect(splitX-1,0,2,ch);
 g.font=`600 ${Math.round(11*dpr)}px Archivo,sans-serif`;
 const pad=8*dpr;
 const tag=(text,x,align)=>{
  const tw=g.measureText(text).width+12*dpr,th=20*dpr,rx=align==='left'?x:x-tw;
  g.fillStyle='rgba(5,12,31,0.78)';g.fillRect(rx,pad,tw,th);
  g.fillStyle='#f4f7ff';g.textBaseline='middle';g.fillText(text,rx+6*dpr,pad+th/2);
 };
 tag('ORIGINAL',pad,'left');
 tag(upOut?'UPSCALED':'PREVIEW',cw-pad,'right');
}
function upPostProcess(cv,denoisePct,sharpPct){
 if(!denoisePct&&!sharpPct)return cv;
 const w=cv.width,h=cv.height,g=cv.getContext('2d',{willReadFrequently:true});
 const im=g.getImageData(0,0,w,h),d=im.data;
 if(denoisePct>0){
  const amt=denoisePct/100*0.65,src=new Uint8ClampedArray(d),thresh=28+denoisePct*0.35;
  for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
   const i=(y*w+x)*4;if(!src[i+3])continue;
   let r=src[i],gr=src[i+1],b=src[i+2],wt=1;
   for(const off of [-4,4,-w*4,w*4]){
    const q=i+off;
    const diff=Math.abs(src[q]-src[i])+Math.abs(src[q+1]-src[i+1])+Math.abs(src[q+2]-src[i+2]);
    if(diff<thresh){const k=1-diff/thresh;r+=src[q]*k;gr+=src[q+1]*k;b+=src[q+2]*k;wt+=k}
   }
   d[i]+=((r/wt)-d[i])*amt;d[i+1]+=((gr/wt)-d[i+1])*amt;d[i+2]+=((b/wt)-d[i+2])*amt;
  }
 }
 if(sharpPct>0){
  const blur=bc(w,h),bg=blur.getContext('2d',{willReadFrequently:true});
  g.putImageData(im,0,0);
  bg.filter='blur(1.1px)';bg.drawImage(cv,0,0);
  const bd=bg.getImageData(0,0,w,h).data,amt=sharpPct/100*1.35;
  for(let i=0;i<d.length;i+=4){
   if(!d[i+3])continue;
   for(let k=0;k<3;k++){
    const diff=d[i+k]-bd[i+k];
    if(Math.abs(diff)>2)d[i+k]=Math.max(0,Math.min(255,d[i+k]+diff*amt));
   }
  }
 }
 g.putImageData(im,0,0);return cv;
}
function upDetailScale(src,tw,th){
 let cur=src;
 while(cur.width*1.65<tw||cur.height*1.65<th){
  const nw=Math.min(tw,Math.round(cur.width*1.5)),nh=Math.min(th,Math.round(cur.height*1.5));
  const step=bc(nw,nh),sg=step.getContext('2d');sg.imageSmoothingEnabled=true;sg.imageSmoothingQuality='high';
  sg.drawImage(cur,0,0,nw,nh);cur=step;
 }
 const out=bc(tw,th),og=out.getContext('2d');og.imageSmoothingEnabled=true;og.imageSmoothingQuality='high';
 og.drawImage(cur,0,0,tw,th);
 return upPostProcess(out,+$('up-denoise').value,Math.max(22,+$('up-sharp').value));
}
async function upRunAI(src,eng,factor,tw,th,signal,onProgress){
 const key=eng+':'+factor,spec=AI_MODELS[key];if(!spec)throw Error('Unsupported AI model.');
 $('up-status').textContent='Loading TensorFlow.js & AI model (first run only)…';
 await loadExtScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js');
 await loadExtScript('https://cdn.jsdelivr.net/npm/upscaler@latest/dist/browser/umd/upscaler.min.js');
 await loadExtScript(spec.url);
 if(signal.aborted)throw new DOMException('Cancelled','AbortError');
 const modelDef=window[spec.global];
 if(!window.Upscaler||!modelDef)throw Error('AI model failed to initialize.');
 let up=upscalerCache.get(key);
 if(!up){up=new window.Upscaler({model:modelDef});upscalerCache.set(key,up)}
 // Fit input if raw factor would exceed cap
 const inScale=Math.min(1,tw/(src.width*spec.scale),th/(src.height*spec.scale));
 let inputCv=src;
 if(inScale<0.99){
  inputCv=bc(Math.max(1,Math.round(src.width*inScale)),Math.max(1,Math.round(src.height*inScale)));
  const ig=inputCv.getContext('2d');ig.imageSmoothingQuality='high';ig.drawImage(src,0,0,inputCv.width,inputCv.height);
 }
 // Detect if source has transparency to preserve crisp alpha
 const srcData=src.getContext('2d').getImageData(0,0,src.width,src.height).data;
 let hasAlpha=false;for(let i=3;i<srcData.length;i+=4)if(srcData[i]<255){hasAlpha=true;break}
 // Flatten onto neutral backdrop for clean RGB ESRGAN inference if transparent
 let feed=inputCv;
 if(hasAlpha){
  feed=bc(inputCv.width,inputCv.height);const fg=feed.getContext('2d');
  fg.fillStyle='#808080';fg.fillRect(0,0,feed.width,feed.height);fg.drawImage(inputCv,0,0);
 }
 $('up-status').textContent='Running AI super-resolution…';
 const patchSize=Math.max(feed.width,feed.height)>360?64:undefined;
 const dataUrl=await up.upscale(feed,{
  patchSize,padding:patchSize?4:0,awaitNextFrame:true,signal,
  progress:(pct)=>onProgress(pct)
 });
 if(signal.aborted)throw new DOMException('Cancelled','AbortError');
 const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(Error('Could not decode AI output'));i.src=dataUrl});
 const out=bc(tw,th),og=out.getContext('2d',{willReadFrequently:true});
 og.imageSmoothingEnabled=true;og.imageSmoothingQuality='high';og.drawImage(img,0,0,tw,th);
 if(hasAlpha){
  const alphaCv=bc(tw,th),ag=alphaCv.getContext('2d',{willReadFrequently:true});
  ag.imageSmoothingEnabled=true;ag.imageSmoothingQuality='high';ag.drawImage(src,0,0,tw,th);
  const aPix=ag.getImageData(0,0,tw,th).data,oIm=og.getImageData(0,0,tw,th),oPix=oIm.data;
  for(let i=3;i<oPix.length;i+=4)oPix[i]=aPix[i];
  og.putImageData(oIm,0,0);
 }
 return upPostProcess(out,+$('up-denoise').value,+$('up-sharp').value);
}
function openUpscaler(){
 if(!base){showToast('Open an image first to upscale',1800);return}
 if($('upscale-dialog').open)return;
 upOut=null;upSrc=upCaptureSource();
 $('up-apply').disabled=true;$('up-download').disabled=true;
 $('up-status').textContent='Choose a model and click Run upscale.';
 $('upscale-progress-wrap').hidden=true;$('upscale-progress-bar').style.width='0%';
 upSyncControls();$('upscale-dialog').showModal();
 requestAnimationFrame(drawUpComparison);
}
$('upscale-open').onclick=openUpscaler;
$('ex-upscale').onclick=()=>{exp.hidden=true;openUpscaler()};
$('up-close').onclick=()=>{if(upAbort)upAbort.abort();$('upscale-dialog').close()};
$('upscale-dialog').addEventListener('keydown',e=>e.stopPropagation());
$('up-target').onchange=()=>{upOut=null;upSrc=upCaptureSource();$('up-apply').disabled=$('up-download').disabled=true;upSyncControls();drawUpComparison()};
$('up-engine').onchange=$('up-scale').onchange=upSyncControls;
$('up-zoom').onchange=drawUpComparison;
$('up-split').oninput=e=>{$('up-split-out').value=e.target.value+'%';drawUpComparison()};
$('up-sharp').oninput=e=>{$('up-sharp-out').value=e.target.value+'%'};
$('up-denoise').oninput=e=>{$('up-denoise-out').value=e.target.value+'%'};
const upStage=$('upscale-stage');
const setUpSplitFromClient=x=>{const r=upStage.getBoundingClientRect();const pct=Math.max(0,Math.min(100,Math.round((x-r.left)/Math.max(1,r.width)*100)));$('up-split').value=pct;$('up-split-out').value=pct+'%';drawUpComparison()};
upStage.onpointerdown=e=>{upSplitDrag=true;upStage.setPointerCapture(e.pointerId);setUpSplitFromClient(e.clientX)};
upStage.onpointermove=e=>{if(upSplitDrag)setUpSplitFromClient(e.clientX)};
upStage.onpointerup=upStage.onpointercancel=()=>{upSplitDrag=false};
new ResizeObserver(()=>{if($('upscale-dialog').open)drawUpComparison()}).observe(upStage);

$('up-cancel').onclick=()=>{if(upAbort)upAbort.abort()};
$('up-run').onclick=async()=>{
 if(upBusy||!upSrc)return;
 const eng=$('up-engine').value,factor=+$('up-scale').value;
 const maxSide=4096,maxPx=16000000;
 let tw=Math.round(upSrc.width*factor),th=Math.round(upSrc.height*factor);
 const cap=Math.min(1,maxSide/Math.max(tw,th),Math.sqrt(maxPx/(tw*th)));
 if(cap<1){tw=Math.max(1,Math.round(tw*cap));th=Math.max(1,Math.round(th*cap))}
 upBusy=true;upAbort=new AbortController();
 $('up-run').disabled=true;$('up-cancel').hidden=false;$('up-apply').disabled=true;$('up-download').disabled=true;
 $('upscale-progress-wrap').hidden=false;$('upscale-progress-bar').style.width='6%';
 const t0=performance.now();
 try{
  if(eng==='detail'){
   $('up-status').textContent='Enhancing detail…';
   await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
   upOut=upDetailScale(upSrc,tw,th);
   $('upscale-progress-bar').style.width='100%';
  }else{
   upOut=await upRunAI(upSrc,eng,factor,tw,th,upAbort.signal,pct=>{
    const p=Math.max(5,Math.min(100,Math.round(pct*100)));
    $('upscale-progress-bar').style.width=p+'%';
    $('up-status').textContent=`AI upscaling… ${p}%`;
   });
   $('upscale-progress-bar').style.width='100%';
  }
  const sec=((performance.now()-t0)/1000).toFixed(1);
  $('up-status').textContent=`Done in ${sec}s · ${tw} × ${th} px. Drag preview to compare.`;
  $('up-apply').disabled=false;$('up-download').disabled=false;
  drawUpComparison();
 }catch(e){
  if(e?.name==='AbortError')$('up-status').textContent='Upscale cancelled.';
  else $('up-status').textContent='Upscale failed: '+(e?.message||e)+' (Try Crisp Detail offline mode.)';
 }finally{
  upBusy=false;upAbort=null;$('up-run').disabled=false;$('up-cancel').hidden=true;
 }
};
$('up-apply').onclick=()=>{
 if(!upOut)return;
 const nw=upOut.width,nh=upOut.height;
 if(upTargetLayer&&layers.includes(upTargetLayer)&&!upTargetLayer.lk){
  pushU(mkSnap('p'));
  const l=upTargetLayer,oldW=l.cv.width;
  const ncv=bc(nw,nh);ncv.getContext('2d').drawImage(upOut,0,0);
  l.cv=ncv;l.d=ncv.getContext('2d').getImageData(0,0,nw,nh);
  if(l.o){const oc=bc(nw,nh),og=oc.getContext('2d');og.imageSmoothingQuality='high';const tmp=bc(oldW,l.o.height);tmp.getContext('2d').putImageData(l.o,0,0);og.drawImage(tmp,0,0,nw,nh);l.o=og.getImageData(0,0,nw,nh)}
  if(l.mask){const mc=bc(nw,nh),mg=mc.getContext('2d');mg.imageSmoothingQuality='high';mg.drawImage(l.mask,0,0,nw,nh);l.mask=mc}
  l.s*=oldW/nw;maskViews.delete(l);refreshLayers();draw();
  $('upscale-dialog').close();showToast(`Upscaled layer "${l.name}" to ${nw} × ${nh} px`);return;
 }
 pushU(documentUndo());
 const sx=nw/W,sy=nh/H,oldW=W,oldH=H;
 const nIm=upOut.getContext('2d').getImageData(0,0,nw,nh);
 W=nw;H=nh;c.width=W;c.height=H;
 base=new ImageData(new Uint8ClampedArray(nIm.data),W,H);
 orig=new ImageData(new Uint8ClampedArray(nIm.data),W,H);
 for(const l of layers){l.x*=sx;l.y*=sy;l.s*=(sx+sy)/2}
 if(sel){const scv=bc(oldW,oldH),sg=scv.getContext('2d'),sim=sg.createImageData(oldW,oldH);for(let i=0;i<sel.length;i++)sim.data[4*i+3]=sel[i];sg.putImageData(sim,0,0);const dst=bc(W,H);dst.getContext('2d').drawImage(scv,0,0,W,H);const dd=dst.getContext('2d').getImageData(0,0,W,H).data;sel=new Uint8Array(W*H);for(let i=0;i<sel.length;i++)sel[i]=dd[4*i+3]}
 transformBank(new DOMMatrix().scale(sx,sy),W,H);
 film?.invalidate();extract();refreshLayers();updInfo();$('zoom').value='0';$('zoom').onchange();draw();
 $('upscale-dialog').close();showToast(`Upscaled photo to ${W} × ${H} px`);
};
$('up-download').onclick=async()=>{
 if(!upOut)return;
 const blob=await toBlob(upOut,'image/png');
 if(blob){downloadBlob(blob,(projectTitle||'totone')+`-upscaled-${upOut.width}x${upOut.height}.png`);showToast('Downloaded upscaled PNG')}
};


/* ---------- Web Elements & Image Search (Wikimedia, Iconify, Pinterest/Google bridge) ---------- */
let elSource='cutouts',elOffset=0,elLastQuery='',elSearchJob=0,elOpenedOnce=false;
const EL_SUGGESTIONS={
 cutouts:['butterfly','flowers','clouds','palm leaf','frame','crown','moon','sparkle','vintage','texture'],
 photos:['sky','ocean','film texture','neon city','sunset','paper grain','forest','mountain','marble','clouds'],
 stickers:['sparkle','heart','star','fire','flower','butterfly','camera','rainbow','crown','lightning'],
 icons:['star','arrow','heart','sparkle','sun','moon','camera','frame','music','leaf']
};
function elRenderSuggestions(){
 const wrap=$('el-suggest');
 wrap.replaceChildren(...(EL_SUGGESTIONS[elSource]||[]).map(term=>{
  const b=document.createElement('button');b.type='button';b.textContent=term;
  b.onclick=()=>{$('el-query').value=term;elRunSearch(false)};
  return b;
 }));
}
async function elRemoveWhiteBg(blob){
 const bmp=await createImageBitmap(blob);
 try{
  const cv=bc(bmp.width,bmp.height),g=cv.getContext('2d',{willReadFrequently:true});
  g.drawImage(bmp,0,0);
  const im=g.getImageData(0,0,cv.width,cv.height),d=im.data;
  // Detect corner background colour (defaults to white if bright)
  const k=[255,255,255];
  for(let i=0;i<d.length;i+=4){
   const dist=wd(d[i],d[i+1],d[i+2],k);
   d[i+3]=Math.round(d[i+3]*ss(20,62,dist));
  }
  g.putImageData(im,0,0);
  return await toBlob(cv,'image/png');
 }finally{bmp.close()}
}
async function elSvgToPngBlob(svgUrl){
 const res=await fetch(svgUrl,{mode:'cors'});if(!res.ok)throw Error('Could not fetch icon.');
 const svgText=await res.text();
 const svgBlob=new Blob([svgText],{type:'image/svg+xml;charset=utf-8'});
 const objUrl=URL.createObjectURL(svgBlob);
 try{
  const img=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('Invalid SVG'));i.src=objUrl});
  const cv=bc(512,512),g=cv.getContext('2d');
  const sc=Math.min(480/(img.naturalWidth||512),480/(img.naturalHeight||512));
  const dw=(img.naturalWidth||512)*sc,dh=(img.naturalHeight||512)*sc;
  g.drawImage(img,(512-dw)/2,(512-dh)/2,dw,dh);
  return await toBlob(cv,'image/png');
 }finally{URL.revokeObjectURL(objUrl)}
}
async function elPlaceBlob(blob,mode,name,removeWhite){
 let finalBlob=blob;
 if(removeWhite)finalBlob=await elRemoveWhiteBg(blob);
 const safeName=(name||'element').replace(/[^\w.\- ]+/g,'_').slice(0,32)+'.png';
 const file=new File([finalBlob],safeName,{type:finalBlob.type||'image/png'});
 if(mode==='double'){
  if(!base)await load(file);
  else{film.focusDouble();await film.loadSecond(file)}
  showToast(`Loaded "${name}" into Double Exposure`);
 }else if(mode==='base'||!base){
  await load(file);
 }else{
  await addLayer(file);
  document.querySelector('.tabs [data-t="layers"]')?.click();
  showToast(`Added "${name}" as layer`);
 }
}
async function importImageFromUrl(url,mode='layer',name='Web image',removeWhite=false){
 const statusEl=$('el-status');
 try{
  if(statusEl&&$('elements-dialog').open)statusEl.textContent='Importing '+name+'…';
  let blob;
  if(/\.svg(\?|$)/i.test(url)||url.includes('api.iconify.design/')){
   blob=await elSvgToPngBlob(url);
  }else{
   const res=await fetch(url,{mode:'cors'});
   if(!res.ok)throw Error('HTTP '+res.status);
   blob=await res.blob();
   if(!blob.type.startsWith('image/'))throw Error('URL is not an image.');
  }
  await elPlaceBlob(blob,mode,name,removeWhite);
  if($('elements-dialog').open)$('elements-dialog').close();
  return true;
 }catch(e){
  const msg='That site blocks direct URL import — right-click the image → "Copy image", then press Ctrl+V right here!';
  if(statusEl&&$('elements-dialog').open)statusEl.textContent=msg;
  if(typeof window.showElementsBlockedPopup==='function')window.showElementsBlockedPopup(url);
  else showToast(msg,3400);
  return false;
 }
}
async function elSearchWikimedia(query,cutoutOnly,offset){
 const search=cutoutOnly?`filetype:bitmap "png" ${query}`:`filetype:bitmap ${query}`;
 const params=new URLSearchParams({
  action:'query',generator:'search',gsrsearch:search,gsrnamespace:'6',gsrlimit:'24',gsroffset:String(offset),
  prop:'imageinfo',iiprop:'url|size|mime',iiurlwidth:'420',format:'json',origin:'*'
 });
 const res=await fetch('https://commons.wikimedia.org/w/api.php?'+params.toString());
 if(!res.ok)throw Error('Wikimedia search unavailable.');
 const data=await res.json();
 const pages=Object.values(data.query?.pages||{}).sort((a,b)=>(a.index||0)-(b.index||0));
 const items=[];
 for(const p of pages){
  const ii=p.imageinfo?.[0];if(!ii)continue;
  if(!/^image\/(png|jpeg|webp|gif)$/i.test(ii.mime||''))continue;
  const thumb=ii.thumburl||ii.url;
  const importUrl=ii.width>1600?thumb.replace(/\/\d+px-/,'/1600px-'):ii.url;
  const label=(p.title||'').replace(/^File:/i,'').replace(/\.[^.]+$/,'').replace(/_/g,' ');
  items.push({label,thumb,importUrl,meta:`${ii.width}×${ii.height}`});
 }
 return {items,nextOffset:data.continue?.gsroffset??null};
}
async function elSearchIconify(query,stickersOnly){
 const params=new URLSearchParams({query,limit:'48'});
 if(stickersOnly)params.set('prefixes','fluent-emoji,noto,twemoji,openmoji');
 const res=await fetch('https://api.iconify.design/search?'+params.toString());
 if(!res.ok)throw Error('Icon search unavailable.');
 const data=await res.json();
 const tint=$('el-tint').value;
 const items=(data.icons||[]).map(id=>{
  const [prefix,name]=id.split(':');
  const q=stickersOnly?'height=160':`height=160&color=${encodeURIComponent(tint)}`;
  const fullQ=stickersOnly?'height=512':`height=512&color=${encodeURIComponent(tint)}`;
  return {
   label:name.replace(/-/g,' '),
   thumb:`https://api.iconify.design/${prefix}/${name}.svg?${q}`,
   importUrl:`https://api.iconify.design/${prefix}/${name}.svg?${fullQ}`,
   meta:prefix
  };
 });
 return {items,nextOffset:null};
}
function elAppendItems(items,append){
 const grid=$('el-grid');if(!append)grid.replaceChildren();
 for(const item of items){
  const card=document.createElement('button');card.type='button';card.className='el-card';
  card.title=`Click to add "${item.label}" (${item.meta})`;
  const box=document.createElement('div');box.className='el-thumb';
  const img=document.createElement('img');img.src=item.thumb;img.alt=item.label;img.loading='lazy';img.decoding='async';img.crossOrigin='anonymous';
  box.append(img);
  const cap=document.createElement('span');cap.textContent=item.label;
  card.append(box,cap);
  card.onclick=async()=>{
   card.disabled=true;
   await importImageFromUrl(item.importUrl,$('el-mode').value,item.label,$('el-rmbg').checked);
   card.disabled=false;
  };
  grid.append(card);
 }
}
async function elRunSearch(append=false){
 const q=($('el-query').value.trim()||(elSource==='cutouts'?'butterfly':elSource==='photos'?'sky':elSource==='stickers'?'sparkle':'star'));
 const job=++elSearchJob;
 if(!append){elOffset=0;elLastQuery=q;$('el-grid').replaceChildren()}
 $('el-more').hidden=true;
 $('el-status').textContent=`Searching ${elSource} for "${q}"…`;
 try{
  const result=(elSource==='cutouts'||elSource==='photos')
   ?await elSearchWikimedia(q,elSource==='cutouts',elOffset)
   :await elSearchIconify(q,elSource==='stickers');
  if(job!==elSearchJob)return;
  elAppendItems(result.items,append);
  elOffset=result.nextOffset??0;
  $('el-more').hidden=!result.nextOffset;
  $('el-status').textContent=result.items.length
   ?`Showing ${$('el-grid').children.length} results for "${q}". Click any item to add it.`
   :`No ${elSource} found for "${q}". Try another keyword or search Pinterest / Google below.`;
 }catch(e){
  if(job!==elSearchJob)return;
  $('el-status').textContent='Search error: '+(e?.message||e);
 }
}
function openElements(){
 if($('elements-dialog').open)return;
 $('el-tint-row').hidden=elSource!=='icons';
 elRenderSuggestions();
 $('elements-dialog').showModal();
 $('el-query').focus();
 if(!elOpenedOnce){elOpenedOnce=true;elRunSearch(false)}
}
$('elements-open').onclick=openElements;
$('layers-elements').onclick=openElements;
$('el-close').onclick=()=>$('elements-dialog').close();
$('elements-dialog').addEventListener('keydown',e=>e.stopPropagation());
$('el-form').onsubmit=e=>{e.preventDefault();elRunSearch(false)};
$('el-more').onclick=()=>elRunSearch(true);
$('el-tint').onchange=()=>{if(elSource==='icons')elRunSearch(false)};
$('el-sources').onclick=e=>{
 const b=e.target.closest('[data-src]');if(!b||b.dataset.src===elSource)return;
 elSource=b.dataset.src;
 $('el-sources').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));
 $('el-tint-row').hidden=elSource!=='icons';
 elRenderSuggestions();elRunSearch(false);
};
$('el-ext-pinterest').onclick=()=>{const q=encodeURIComponent($('el-query').value.trim()||'aesthetic collage png');window.open(`https://www.pinterest.com/search/pins/?q=${q}`,'_blank','noopener')};
$('el-ext-google').onclick=()=>{const q=encodeURIComponent($('el-query').value.trim()||'aesthetic overlay');window.open(`https://www.google.com/search?tbm=isch&q=${q}`,'_blank','noopener')};
$('el-ext-google-png').onclick=()=>{const q=encodeURIComponent(($('el-query').value.trim()||'element')+' png');window.open(`https://www.google.com/search?tbm=isch&tbs=ic:trans&q=${q}`,'_blank','noopener')};
$('el-import-url').onclick=async()=>{
 const url=$('el-url').value.trim();if(!url){$('el-url').focus();return}
 if(await importImageFromUrl(url,$('el-mode').value,'Web import',$('el-rmbg').checked))$('el-url').value='';
};
$('elements-dialog').addEventListener('paste',async e=>{
 const it=[...(e.clipboardData?.items||[])].find(i=>i.type.startsWith('image/'));
 const f=it&&it.getAsFile();
 if(f){
  e.preventDefault();e.stopImmediatePropagation();
  await elPlaceBlob(f,$('el-mode').value,'Pasted element',$('el-rmbg').checked);
  $('elements-dialog').close();
 }
},true);


$('edge-back').onchange=()=>draw(true);suiteReady=true;
maskControls();film.build();showP();
if(['#portraits','#double-exposure'].includes(location.hash))film.focusDouble();
if(location.hash==='#text')showTextLayer();
if(location.hash==='#grade')document.querySelector('[data-t="grade"]').click();
if(location.hash==='#film'||location.hash==='#stocks')document.querySelector('[data-t="film"]').click();
if(location.hash==='#stocks'){const collection=$('film-collection');collection.value='Film stocks';collection.dispatchEvent(new Event('change',{bubbles:true}))}


