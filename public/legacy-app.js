// Legacy UI adapter. This remains active while the screens are migrated into
// typed React components; backend integrations live in the Next.js app.
const app = document.querySelector('#app');

const state = {
  page: 'home', name: 'Kamu', room: 'LOVE-7281', frame: 'pink', ready: false,
  stream: null, shots: [], shot: 0, busy: false
};

const icon = (name) => ({
  arrow:'→', camera:'◉', copy:'⧉', link:'↗', check:'✓', download:'↓', rotate:'↻', users:'♧', heart:'♥', magic:'✦'
}[name] || name);

function brand(){ return `<div class="brand" onclick="go('home')"><span class="brand-mark">tb</span><span>togetherbooth</span></div>`; }
function nav(action='Create a booth'){ return `<div class="shell nav">${brand()}<div class="nav-links"><a href="#how">How it works</a><a href="#">About</a><button class="btn btn-dark btn-sm" onclick="go('create')">${action} ${icon('arrow')}</button></div></div>`; }

function render(){
  window.scrollTo(0,0);
  if(state.page==='home') home();
  if(state.page==='create') create();
  if(state.page==='join') join();
  if(state.page==='waiting') waiting();
  if(state.page==='booth') booth();
  if(state.page==='result') result();
}
function go(page){ if(state.stream && (page==='home'||page==='result')) stopCamera(); state.page=page; render(); }

function home(){
  app.innerHTML=`<main class="page">
    ${nav()}
    <section class="shell hero">
      <div class="hero-copy">
        <span class="eyebrow"><i></i> online photobooth for two</span>
        <h1>Miles apart.<br><em>Same frame.</em></h1>
        <p>Create a little memory with someone you love. Start a private booth, share the link, and take four photos together—wherever you both are.</p>
        <div class="hero-actions"><button class="btn btn-dark" onclick="go('create')">Create our booth ${icon('arrow')}</button><button class="btn btn-light" onclick="go('join')">Join with a code</button></div>
        <div class="mini-note"><div class="avatars"><span class="avatar av1">S</span><span class="avatar av2">D</span><span class="avatar av3">♥</span></div>No account needed · Free to try · Photos stay private</div>
      </div>
      <div class="visual">
        <div class="blob"></div><div class="stars"><b class="spark s1">✦</b><b class="spark s2">✦</b><b class="spark s3">✦</b></div>
        <div class="room-chip left"><strong><i class="online-dot"></i>Sarah joined</strong><span>Ready to take photos</span></div>
        <div class="photo-stack"><div class="tape"></div><div class="couple-photo"><div class="portrait"><i class="person"></i></div><div class="portrait two"><i class="person"></i></div><i class="heart-float">♥</i></div><div class="photo-caption">us, from anywhere ♡</div></div>
        <div class="room-chip right"><strong>Room LOVE-7281</strong><span>2 of 2 people here</span></div>
      </div>
    </section>
    <div class="ticker"><div class="ticker-track">${Array(2).fill('<span>Take photos together</span><span>Keep the moment forever</span><span>Same love, different places</span><span>Four poses, one memory</span>').join('')}</div></div>
    <section class="shell how" id="how"><div class="section-heading"><span class="kicker">How it works</span><h2>A memory in three little steps.</h2><p>No complicated setup. Just you, your favorite person, and a few poses worth keeping.</p></div>
      <div class="steps"><article class="step"><span class="step-num">01</span><div class="step-icon">⌁</div><h3>Make a private room</h3><p>Pick a frame and get your unique booth code. Your room is private and expires automatically.</p></article><article class="step"><span class="step-num">02</span><div class="step-icon">♡</div><h3>Invite your person</h3><p>Send the link to someone special. You'll see each other live when they join the room.</p></article><article class="step"><span class="step-num">03</span><div class="step-icon">◉</div><h3>Pose, snap, keep</h3><p>A shared countdown captures four moments and turns them into one beautiful photostrip.</p></article></div>
    </section>
  </main>`;
}

function flowNav(step){ return `<div class="flow-wrap flow-nav">${brand()}<div class="progress"><b>Set up</b><i class="progress-line ${step>1?'on':''}"></i><span>Invite</span><i class="progress-line ${step>2?'on':''}"></i><span>Photos</span><i class="progress-line ${step>3?'on':''}"></i><span>Done</span></div><button class="btn btn-ghost btn-sm" onclick="go('home')">Exit</button></div>`; }

function create(){
 app.innerHTML=`<main class="flow-page">${flowNav(1)}<div class="flow-wrap setup-grid"><section class="setup-copy"><span class="eyebrow"><i></i> create your room</span><h1>Make it feel like <em>yours.</em></h1><p>Choose a name and your favorite frame. You can change everything again before the photos begin.</p></section><section class="card">
  <div class="field"><label>What should we call you?</label><input id="name" class="input" value="${state.name==='Kamu'?'':state.name}" placeholder="Your name" maxlength="20"></div>
  <div class="field"><label>Who's this booth for?</label><div class="choice-row"><button class="choice active"><b>♡ Someone special</b><small>A date, anniversary, or just because</small></button><button class="choice"><b>☺ My bestie</b><small>Long-distance friendship memories</small></button></div></div>
  <div class="field"><label>Choose a frame</label><div class="frames">${frameOptions()}</div></div>
  <div class="form-footer"><button class="btn btn-dark" onclick="makeRoom()">Create room ${icon('arrow')}</button></div>
 </section></div></main>`;
}
function frameOptions(){ return [
 ['pink','Blush',''],['black','Classic',''],['cream','Vanilla',''],['sage','Sage',''],['blue','Cloud',''],
 ['toystory','Toy Story','★'],['avengers','Avengers','A'],['spiderman','Spider-Man','🕸']
].map(([f,n,badge])=>`<button class="frame-choice ${state.frame===f?'active':''}" onclick="pickFrame('${f}',this)"><div class="frame-mini f-${f}" data-badge="${badge}"><i></i><i></i><i></i>${themeCharacterArt(f)}</div><span>${n}</span></button>`).join(''); }
function themeCharacterArt(theme,large=false){
 const cls=`theme-characters ${large?'large':''}`;
 if(theme==='toystory')return `<div class="${cls}" aria-label="Cute cowboy and space ranger characters"><svg viewBox="0 0 180 90" aria-hidden="true"><g class="chibi-shadow"><ellipse cx="90" cy="82" rx="75" ry="7"/></g><g><path fill="#8a542f" d="M15 28h66v10H15z"/><path fill="#9c6338" d="M27 11h42l7 20H20z"/><circle fill="#f2bd8c" cx="48" cy="43" r="20"/><circle fill="#29231f" cx="41" cy="43" r="2.5"/><circle fill="#29231f" cx="55" cy="43" r="2.5"/><path fill="none" stroke="#9d4f4a" stroke-width="2" d="M41 51q7 6 14 0"/><path fill="#f0bd27" d="M25 61q23-14 46 0v24H25z"/><path fill="#d73535" d="m38 59 10 10 10-10-10-6z"/><circle fill="#fff" cx="65" cy="69" r="6"/><path fill="#d5a62c" d="m65 64 2 4 4 .5-3 3 1 4-4-2-4 2 1-4-3-3 4-.5z"/></g><g><path fill="#7f4bac" d="M115 25q20-22 40 0l-5 13h-30z"/><circle fill="#e9b78d" cx="135" cy="43" r="19"/><circle fill="#29231f" cx="128" cy="43" r="2.5"/><circle fill="#29231f" cx="142" cy="43" r="2.5"/><path fill="#fff" d="M109 61q26-16 52 0v24h-52z"/><path fill="#77bd43" d="m109 64 17-8 9 14 9-14 17 8v21h-52z"/><path fill="#68439a" d="M128 68h14v9h-14z"/><path fill="#d64745" d="M132 71h4v4h-4z"/><path fill="#d9e5ed" d="m110 64-13-10v26l13-5zM160 64l13-10v26l-13-5z"/></g></svg></div>`;
 if(theme==='avengers')return `<div class="${cls}" aria-label="Cute armored hero and shield hero characters"><svg viewBox="0 0 180 90" aria-hidden="true"><g class="chibi-shadow"><ellipse cx="90" cy="82" rx="75" ry="7"/></g><g><circle fill="#c52c32" cx="48" cy="40" r="25"/><path fill="#e4a44a" d="M33 22h30l6 18-10 17H37L27 40z"/><path fill="#f4d18b" d="M37 34h22v16H37z"/><path fill="#dcefff" d="m37 37 8 2-8 5zM59 37l-8 2 8 5z"/><path fill="#ad2029" d="M23 62q25-15 50 0v23H23z"/><path fill="#f0b944" d="M42 61h12l-6 13z"/><circle fill="#8fe4ff" cx="48" cy="70" r="5"/></g><g><circle fill="#235496" cx="135" cy="40" r="25"/><path fill="#fff" d="m135 16 5 11h-10z"/><path fill="#f0bd91" d="M119 34h32v22h-32z"/><path fill="#235496" d="M115 26h40v15l-9-9-11 8-11-8-9 9z"/><circle fill="#2a2522" cx="128" cy="43" r="2.5"/><circle fill="#2a2522" cx="142" cy="43" r="2.5"/><path fill="#214d87" d="M110 63q25-16 50 0v22h-50z"/><circle fill="#d82e38" cx="158" cy="67" r="17"/><circle fill="#fff" cx="158" cy="67" r="12"/><circle fill="#2860a4" cx="158" cy="67" r="7"/><path fill="#fff" d="m158 61 2 4 4 .5-3 3 1 4-4-2-4 2 1-4-3-3 4-.5z"/></g></svg></div>`;
 if(theme==='spiderman')return `<div class="${cls}" aria-label="Cute red and black spider hero characters"><svg viewBox="0 0 180 90" aria-hidden="true"><g class="chibi-shadow"><ellipse cx="90" cy="82" rx="75" ry="7"/></g><g><circle fill="#cf2530" cx="48" cy="41" r="25"/><path fill="#fff" stroke="#202020" stroke-width="2" d="m30 34 14 5-10 10zM66 34l-14 5 10 10z"/><g fill="none" stroke="#2d2927" stroke-width="1.4"><path d="M48 16v50M25 27l46 28M71 27L25 55"/><path d="M31 22q17 15 34 0M25 40q23 13 46 0"/></g><path fill="#be1e28" d="M22 64q26-17 52 0v21H22z"/><path fill="#1d4777" d="M22 72h52v13H22z"/><path fill="#202020" d="m48 63 4 7-4 8-4-8z"/></g><g><circle fill="#17191d" cx="135" cy="41" r="25"/><path fill="#f5f5f5" stroke="#d82232" stroke-width="3" d="m116 33 15 6-11 11zM154 33l-15 6 11 11z"/><path fill="#16181c" d="M109 64q26-17 52 0v21h-52z"/><path fill="#d72332" d="M109 70h52v6h-52z"/><path fill="#d72332" d="m135 62 5 8-5 10-5-10z"/><g fill="none" stroke="#d72332" stroke-width="1.4"><path d="M135 16v49M115 26l40 29M155 26l-40 29"/></g></g></svg></div>`;
 return '';
}
function pickFrame(f,el){ state.frame=f; document.querySelectorAll('.frame-choice').forEach(x=>x.classList.remove('active')); el.classList.add('active'); }
function makeRoom(){ state.name=document.querySelector('#name').value.trim()||'Kamu'; state.room=randomRoom(); go('waiting'); }
function randomRoom(){ const words=['LOVE','DATE','US','MOON','PINK']; return `${words[Math.floor(Math.random()*words.length)]}-${Math.floor(1000+Math.random()*9000)}`; }

function join(){
 app.innerHTML=`<main class="flow-page">${flowNav(1)}<div class="flow-wrap setup-grid"><section class="setup-copy"><span class="eyebrow"><i></i> someone is waiting</span><h1>Join them in the <em>same frame.</em></h1><p>Enter the private room code they shared with you. No account or download needed.</p></section><section class="card"><div class="field"><label>Room code</label><input id="code" class="input" value="LOVE-7281" placeholder="e.g. LOVE-7281" style="text-transform:uppercase;letter-spacing:.12em"></div><div class="field"><label>Your name</label><input id="name" class="input" placeholder="Your name" maxlength="20"></div><div class="form-footer"><button class="btn btn-dark" onclick="joinRoom()">Join photobooth ${icon('arrow')}</button></div></section></div></main>`;
}
function joinRoom(){ state.room=(document.querySelector('#code').value||'LOVE-7281').toUpperCase(); state.name=document.querySelector('#name').value.trim()||'Kamu'; go('waiting'); }

function waiting(){
 app.innerHTML=`<main class="flow-page">${flowNav(2)}<div class="flow-wrap"><header class="waiting-head"><span class="eyebrow"><i></i> waiting room</span><h1>Almost picture time.</h1><p>Check your camera, invite your person, then get ready together.</p></header>
  <div class="room-bar"><div><div class="code-label">Your private room</div><div class="code">${state.room}</div></div><div class="room-actions"><button class="btn btn-light btn-sm" onclick="copyRoom()">${icon('copy')} <span>Copy code</span></button><button class="btn btn-pink btn-sm" onclick="copyInvite()">${icon('link')} <span>Copy invite link</span></button></div></div>
  <div class="camera-grid"><article class="camera-card"><div class="camera-view" id="my-camera"><div class="cam-placeholder"><div><span>◉</span><b>Camera preview</b><br><small>Enable your camera to get ready</small></div></div></div><div class="camera-meta"><span class="person-name">${state.name} <small>· you</small></span><span id="my-status" class="status wait">Camera off</span></div></article>
  <article class="camera-card"><div class="camera-view"><div class="demo-face"></div></div><div class="camera-meta"><span class="person-name">Mika</span><span class="status">● Ready</span></div></article></div>
  <div class="waiting-footer"><button id="camera-btn" class="btn btn-light" onclick="startCamera()">◉ Enable camera</button><button id="ready-btn" class="btn btn-dark" onclick="toggleReady()" disabled>I'm ready ${icon('check')}</button></div>
 </div><div class="notice" id="notice"></div></main>`;
}
async function startCamera(){
 try { state.stream=await navigator.mediaDevices.getUserMedia({video:{width:{ideal:1280},height:{ideal:960}},audio:false}); const box=document.querySelector('#my-camera'); box.innerHTML='<video autoplay playsinline muted></video>'; box.querySelector('video').srcObject=state.stream; }
 catch(e){ document.querySelector('#my-camera').innerHTML='<div class="demo-face"></div>'; toast('Camera unavailable — demo preview enabled'); }
 document.querySelector('#my-status').className='status'; document.querySelector('#my-status').textContent='● Camera on'; document.querySelector('#camera-btn').textContent='↻ Check camera'; document.querySelector('#ready-btn').disabled=false;
}
function toggleReady(){ state.ready=!state.ready; const b=document.querySelector('#ready-btn'); b.textContent=state.ready?'Start photobooth →':`I'm ready ${icon('check')}`; b.className=`btn ${state.ready?'btn-pink':'btn-dark'}`; if(state.ready) b.onclick=()=>go('booth'); }
function copyRoom(){ navigator.clipboard?.writeText(state.room); toast('Room code copied'); }
function copyInvite(){ navigator.clipboard?.writeText(`${location.href.split('#')[0]}?room=${state.room}`); toast('Invitation link copied'); }
function toast(t){ const n=document.querySelector('#notice'); if(!n)return;n.textContent=t;n.classList.add('show');setTimeout(()=>n.classList.remove('show'),2200); }

function videoPane(local=false){
 if(local && state.stream) return `<video class="live-video" autoplay playsinline muted></video>`;
 return `<div class="demo-face"></div>`;
}
function booth(){
 app.innerHTML=`<main class="booth-page">${flowNav(3)}<div class="flow-wrap"><div class="booth-top"><div><h2>Four little moments</h2><p>Look at the camera and have fun with it.</p></div><div><div class="shot-dots">${[0,1,2,3].map(i=>`<i class="shot-dot ${i<state.shot?'done':''}"></i>`).join('')}</div><p style="text-align:right">${state.shot} of 4</p></div></div><div class="live-grid" id="live-grid"><div class="camera-view">${videoPane(true)}<span class="cam-label">● ${state.name}</span></div><div class="camera-view">${videoPane()}<span class="cam-label">● Mika</span></div></div><div class="booth-controls"><span style="color:#aaa79f;font-size:12px;width:80px">${state.shot===0?'Ready?':'Great pose!'}</span><button class="shutter" id="shutter" onclick="takePhoto()" aria-label="Take photo"></button><span style="color:#aaa79f;font-size:12px;width:80px">Photo ${state.shot+1}/4</span></div></div></main>`;
 if(state.stream){ const v=document.querySelector('.live-video'); if(v)v.srcObject=state.stream; }
}
async function takePhoto(){
 if(state.busy)return; state.busy=true; const shutter=document.querySelector('#shutter'); shutter.disabled=true;
 for(const n of ['3','2','1']){ await showCount(n); }
 const grid=document.querySelector('#live-grid'); const flash=document.createElement('div');flash.className='flash';grid.append(flash);
 captureFrame(); await wait(600); state.shot++; state.busy=false;
 if(state.shot>=4){ go('result'); return; }
 booth(); setTimeout(()=>takePhoto(),2500);
}
function showCount(n){ const grid=document.querySelector('#live-grid'); const o=document.createElement('div');o.className='countdown-overlay';o.innerHTML=`<div class="countdown-number"><small>Photo ${state.shot+1} of 4</small>${n}</div>`;grid.append(o);return new Promise(res=>setTimeout(()=>{o.remove();res()},900)); }
function wait(ms){ return new Promise(r=>setTimeout(r,ms)); }
function captureFrame(){
 const c=document.createElement('canvas');c.width=600;c.height=450;const x=c.getContext('2d'); const v=document.querySelector('.live-video');
 if(v&&v.videoWidth){ drawImageCover(x,v,0,0,c.width,c.height,true); }
 else { x.fillStyle=['#d8c2b6','#c8d2c6','#d5c1aa','#bbc8cf'][state.shot];x.fillRect(0,0,c.width,c.height);x.fillStyle='#2d2925';x.beginPath();x.arc(300,205,85,0,Math.PI*2);x.fill();x.fillRect(155,280,290,210); }
 state.shots.push(c.toDataURL('image/jpeg',.9));
}

// Draw like CSS object-fit: cover. The source ratio is preserved and only the
// excess edges are cropped, preventing faces from becoming narrow or flat.
function drawImageCover(x,source,dx,dy,dw,dh,mirror=false){
 const sw=source.videoWidth||source.naturalWidth||source.width;
 const sh=source.videoHeight||source.naturalHeight||source.height;
 if(!sw||!sh)return;
 const sourceRatio=sw/sh,targetRatio=dw/dh;
 let sx=0,sy=0,cropW=sw,cropH=sh;
 if(sourceRatio>targetRatio){cropW=sh*targetRatio;sx=(sw-cropW)/2;}
 else if(sourceRatio<targetRatio){cropH=sw/targetRatio;sy=(sh-cropH)/2;}
 x.save();
 if(mirror){x.translate(dx+dw,dy);x.scale(-1,1);x.drawImage(source,sx,sy,cropW,cropH,0,0,dw,dh);}
 else x.drawImage(source,sx,sy,cropW,cropH,dx,dy,dw,dh);
 x.restore();
}

function result(){
 const pics=Array.from({length:4},(_,i)=>`<div class="strip-photo"><div class="strip-pane">${state.shots[i]?`<canvas data-img="${state.shots[i]}"></canvas>`:'<div class="demo-face"></div>'}</div><div class="strip-pane"><div class="demo-face"></div></div></div>`).join('');
 const themeCharacters=themeCharacterArt(state.frame,true);
 app.innerHTML=`<main class="result-page">${nav('New booth')}<div class="shell result-layout"><section class="strip-wrap"><b class="confetti c1">✦</b><b class="confetti c2">♡</b><b class="confetti c3">✦</b><div class="strip f-${state.frame}" id="strip"><div class="strip-title">${state.name} & Mika ♡</div>${pics}${themeCharacters}<div class="strip-footer">${new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'})} · togetherbooth</div></div></section><section class="result-copy"><span class="eyebrow"><i></i> your photos are ready</span><h1>A little piece of <em>us.</em></h1><p>Four moments, one frame, and no distance in sight. Save it somewhere special—or send it to someone who'll smile.</p><div class="result-actions"><button class="btn btn-dark" onclick="downloadStrip()">${icon('download')} Download photostrip</button><button class="btn btn-light" onclick="shareResult()">${icon('link')} Share</button><button class="btn btn-ghost" onclick="retake()">${icon('rotate')} Retake</button></div><div class="result-info"><span>Private by default</span><span>Room expires in 24:00</span></div></section></div><div class="notice" id="notice"></div></main>`;
 document.querySelectorAll('canvas[data-img]').forEach(c=>{const im=new Image();im.onload=()=>{c.width=300;c.height=220;drawImageCover(c.getContext('2d'),im,0,0,c.width,c.height);};im.src=c.dataset.img;});
}
function retake(){ state.shots=[];state.shot=0;go('waiting'); }
function shareResult(){ if(navigator.share)navigator.share({title:'Our TogetherBooth',text:'Even miles apart, we’re still in the same frame.',url:location.href});else{navigator.clipboard?.writeText(location.href);toast('Share link copied');} }
function downloadStrip(){
 const c=document.createElement('canvas');c.width=900;c.height=1960;const x=c.getContext('2d'); const colors={pink:'#edabb0',black:'#292724',cream:'#e9ddc8',sage:'#aebc98',blue:'#aabecd',toystory:'#39a8df',avengers:'#152f55',spiderman:'#c8212c'};x.fillStyle=colors[state.frame];x.fillRect(0,0,c.width,c.height);drawFrameTheme(x,state.frame,c.width,c.height);x.fillStyle=['black','avengers','spiderman'].includes(state.frame)?'white':'#282621';x.textAlign='center';x.font='italic 58px Georgia';x.fillText(`${state.name} & Mika ♡`,450,85);
 const jobs=state.shots.map((src,i)=>new Promise(res=>{const im=new Image();im.onload=()=>{const y=125+i*420;drawImageCover(x,im,35,y,410,360);drawImageCover(x,im,455,y,410,360,true);res();};im.src=src;}));
 Promise.all(jobs).then(async()=>{await drawCuteCharacters(x,state.frame,450,1810);x.font='28px Arial';x.fillText(`${new Date().toLocaleDateString('en-GB')} · TOGETHERBOOTH`,450,1905);const a=document.createElement('a');a.download=`togetherbooth-${state.room}.png`;a.href=c.toDataURL('image/png');a.click();toast('Photostrip downloaded');});
}
function drawCuteCharacters(x,theme,cx,y){
 const markup=themeCharacterArt(theme,true);if(!markup)return Promise.resolve();
 const holder=document.createElement('div');holder.innerHTML=markup;const svg=holder.querySelector('svg');
 return new Promise(resolve=>{const image=new Image();image.onload=()=>{x.drawImage(image,cx-145,y-72,290,145);resolve();};image.onerror=resolve;image.src=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.outerHTML)}`;});
}
function drawFrameTheme(x,theme,w,h){
 if(theme==='toystory'){
 x.fillStyle='#fff';for(let i=0;i<16;i++){x.beginPath();x.arc((i*137)%w,(i*239)%h,22+(i%3)*9,0,Math.PI*2);x.fill();}
  x.fillStyle='#f5d13d';x.fillRect(0,h-105,w,105);
 }
 if(theme==='avengers'){
  x.strokeStyle='rgba(120,198,255,.35)';x.lineWidth=5;for(let r=100;r<600;r+=95){x.beginPath();x.arc(w/2,h/2,r,0,Math.PI*2);x.stroke();}
  x.fillStyle='#cf2c3a';x.fillRect(0,h-105,w,105);
 }
 if(theme==='spiderman'){
  x.strokeStyle='rgba(255,255,255,.42)';x.lineWidth=4;for(let i=0;i<=w;i+=90){x.beginPath();x.moveTo(w/2,0);x.lineTo(i,h);x.stroke();}for(let r=130;r<1000;r+=110){x.beginPath();x.arc(w/2,0,r,0,Math.PI);x.stroke();}
  x.fillStyle='#1262a3';x.fillRect(0,h-105,w,105);
 }
}
function stopCamera(){ state.stream?.getTracks().forEach(t=>t.stop());state.stream=null; }
window.addEventListener('beforeunload',stopCamera);
render();
