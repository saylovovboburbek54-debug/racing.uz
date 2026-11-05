(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  if (!window.THREE) { alert('3D kutubxonasi yuklanmadi. Internetni tekshirib, sahifani qayta oching.'); return; }
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9db5c2);
  scene.fog = new THREE.Fog(0x9db5c2, 65, 260);
  const camera = new THREE.PerspectiveCamera(63, innerWidth / innerHeight, .1, 650);
  camera.position.set(0, 5.5, 11.5);
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.6)); renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.shadowMap.autoUpdate = true;
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.12;
  $('game').prepend(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xdcecff, 0x3b4639, 2.15));
  const sun = new THREE.DirectionalLight(0xffedcf, 3.2); sun.position.set(-24, 34, 14); sun.castShadow = true; sun.shadow.mapSize.set(1536,1536); sun.shadow.bias=-0.00025; sun.shadow.camera.left=-25; sun.shadow.camera.right=25; sun.shadow.camera.top=35; sun.shadow.camera.bottom=-25; scene.add(sun);
  const mat = (color, roughness=.65, metalness=.05, extra={}) => new THREE.MeshStandardMaterial({color, roughness, metalness, ...extra});
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1200,1200), mat(0x4d6741)); ground.rotation.x=-Math.PI/2; ground.position.y=-.16; ground.receiveShadow=true; scene.add(ground);
  const roadMat=mat(0x20252b,.92,.03), lineMat=mat(0xf3f1df,.72), edgeMat=mat(0xffc928,.42,.25,{emissive:0x332000}), blackMat=mat(0x090c10,.4,.25), glassMat=mat(0x0b1c2b,.12,.55), chromeMat=mat(0xb8c5ce,.25,.8), barrierMat=mat(0x8c989f,.34,.65), barrierPostMat=mat(0xd5d8d8,.45,.3), reflectorMat=mat(0xffffff,.25,.1,{emissive:0x555555});
  const roadParts=[]; const segmentLength=14, roadCount=38;
  function curveAt(z, d=0) { return Math.sin((d + z*1.15) * .00145)*5.4 + Math.sin((d + z*.55)*.00075)*2.1; }
  function createRoadPart(z) {
    const g=new THREE.Group();
    const slab=new THREE.Mesh(new THREE.BoxGeometry(12,.12,segmentLength),roadMat); slab.position.y=-.04; slab.receiveShadow=true; g.add(slab);
    for(const x of [-5.92,5.92]){const e=new THREE.Mesh(new THREE.BoxGeometry(.14,.04,segmentLength),edgeMat);e.position.set(x,.04,0);g.add(e); const rail=new THREE.Mesh(new THREE.BoxGeometry(.12,.28,segmentLength),barrierMat);rail.position.set(x*1.13,.42,0);rail.castShadow=true;g.add(rail); for(let z=-5;z<=5;z+=5){const post=new THREE.Mesh(new THREE.BoxGeometry(.16,.65,.16),barrierPostMat);post.position.set(x*1.13,.22,z);post.castShadow=true;g.add(post);}}
    for(const x of [-2,2]){const dash=new THREE.Mesh(new THREE.BoxGeometry(.10,.025,4.4),lineMat);dash.position.set(x,.035,0);g.add(dash);}
    for(const x of [-5.65,5.65]){const reflector=new THREE.Mesh(new THREE.BoxGeometry(.12,.035,.34),reflectorMat);reflector.position.set(x,.055,0);g.add(reflector);}
    g.position.z=z; scene.add(g); roadParts.push(g); return g;
  }
  for(let i=0;i<roadCount;i++) createRoadPart(-i*segmentLength-10);
  // Background mountains
  for(let i=0;i<34;i++){const h=12+Math.random()*25;const m=new THREE.Mesh(new THREE.ConeGeometry(8+Math.random()*11,h,5),mat(i%2?0x81949a:0x6f858b));m.position.set((i%2?1:-1)*(24+Math.random()*58),h/2-2,-80-Math.random()*360);m.rotation.y=Math.random()*1.5;scene.add(m);}

  const cars = [
    {name:'APEX SPORT',color:0xffcf22,top:320,accel:1.0,handling:1.0,desc:'SPORT COUPE • 320 KM/H',shape:0},
    {name:'NIGHT GT',color:0x26a5e8,top:350,accel:.94,handling:.93,desc:'GRAND TOURER • 350 KM/H',shape:1},
    {name:'SCARLET RS',color:0xe93c43,top:305,accel:1.12,handling:1.08,desc:'RALLY SPORT • 305 KM/H',shape:2},
    {name:'VIPER X',color:0xeeeeef,top:370,accel:1.05,handling:.9,desc:'HYPERCAR • 370 KM/H',shape:3},
    {name:'STEALTH',color:0x343b48,top:330,accel:.98,handling:1.18,desc:'TRACK SPEC • 330 KM/H',shape:4}
  ];
  let selectedCar=0;
  function makeCar(color, options={}) {
    const group=new THREE.Group(), bodyMat=mat(color,.26,.42), lightMat=mat(0xfff2c4,.25,.1,{emissive:0x66552b}), tailMat=mat(0xff2525,.28,.1,{emissive:0x5a0000});
    function box(w,h,l,material,x,y,z){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,l),material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;}
    box(1.72,.43,3.25,bodyMat,0,.68,0); box(1.58,.20,1.08,bodyMat,0,.83,-1.08); box(1.52,.15,.72,bodyMat,0,.77,1.27);
    // Hood lines, mirrors, bumpers and exhausts give the low-poly body more car-like detail.
    for(const x of [-.48,.48]){const hoodLine=new THREE.Mesh(new THREE.BoxGeometry(.025,.012,.72),chromeMat);hoodLine.position.set(x,.794,-.72);group.add(hoodLine);box(.16,.10,.23,bodyMat,x*1.95,.91,-.22);}
    box(1.78,.12,.16,blackMat,0,.48,-1.68); box(1.78,.12,.16,blackMat,0,.48,1.68);
    for(const x of [-.48,.48]){const exhaust=new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,.12,10),chromeMat);exhaust.rotation.x=Math.PI/2;exhaust.position.set(x,.48,1.73);group.add(exhaust);}
    const cabin=new THREE.Mesh(new THREE.BoxGeometry(1.18,.56,1.42),glassMat);cabin.position.set(0,1.08,.12);cabin.castShadow=true;group.add(cabin);
    box(1.04,.075,.96,bodyMat,0,1.38,.1); box(1.6,.16,.2,blackMat,0,.48,-1.58); box(1.62,.13,.2,blackMat,0,.48,1.58);
    for(const x of [-.58,.58]){box(.34,.13,.045,lightMat,x,.79,-1.64);box(.29,.12,.045,tailMat,x,.75,1.64);}
    const wheels=[];
    for(const x of [-.88,.88])for(const z of [-1.08,1.08]){
      const w=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,.23,24),blackMat);w.rotation.z=Math.PI/2;w.position.set(x,.39,z);w.castShadow=true;group.add(w);
      const hub=new THREE.Mesh(new THREE.CylinderGeometry(.19,.19,.245,16),chromeMat);hub.rotation.z=Math.PI/2;hub.position.copy(w.position);group.add(hub);
      const rimDark=mat(0x202832,.28,.8), spokeMat=mat(0xd4dbe0,.22,.85);
      const rim=new THREE.Mesh(new THREE.TorusGeometry(.235,.035,8,20),rimDark);rim.rotation.y=Math.PI/2;rim.position.copy(w.position);group.add(rim);
      for(let k=0;k<5;k++){const spoke=new THREE.Mesh(new THREE.BoxGeometry(.035,.29,.045),spokeMat);spoke.position.copy(w.position);spoke.position.y+=Math.sin(k*Math.PI*2/5)*.105;spoke.position.z+=Math.cos(k*Math.PI*2/5)*.105;spoke.rotation.x=k*Math.PI*2/5;group.add(spoke);}
      wheels.push(w);
    }
    // Sport-car details: windshield, side skirts, mirrors, front grille and rear diffuser.
    const windshield=new THREE.Mesh(new THREE.BoxGeometry(1.05,.34,.055),glassMat);windshield.position.set(0,1.15,-.58);windshield.rotation.x=-.34;group.add(windshield);
    const rearGlass=new THREE.Mesh(new THREE.BoxGeometry(1.02,.27,.05),glassMat);rearGlass.position.set(0,1.16,.78);rearGlass.rotation.x=.38;group.add(rearGlass);
    for(const x of [-.86,.86]){box(.12,.14,2.1,blackMat,x,.49,0);box(.12,.11,.18,bodyMat,x*1.12,.9,-.35);}
    box(.72,.12,.06,blackMat,0,.59,-1.72);
    for(const x of [-.55,-.28,0,.28,.55])box(.035,.13,.04,chromeMat,x,.59,-1.76);
    // Bright LED headlamps and tail lamps.
    for(const x of [-.57,.57]){
      const led=mat(0xeaf8ff,.18,.15,{emissive:0x9bcfff,emissiveIntensity:1.5});box(.37,.10,.055,led,x,.81,-1.67);
      box(.34,.09,.055,mat(0xff1717,.22,.1,{emissive:0x9a0000,emissiveIntensity:1.2}),x,.76,1.67);
    }
    if(options.player){box(1.22,.07,.22,blackMat,0,1.02,1.43);box(1.45,.06,.14,bodyMat,0,1.34,1.03);}
    if(options.police){box(.95,.12,.25,blackMat,0,1.42,.05);const red=mat(0xff1e38,.25,.1,{emissive:0xaa0010});const blue=mat(0x168cff,.25,.1,{emissive:0x002d99});box(.28,.11,.16,red,-.22,1.5,.05);box(.28,.11,.16,blue,.22,1.5,.05);}
    group.userData.wheels=wheels; group.userData.bodyMat=bodyMat; return group;
  }
  const player=makeCar(cars[selectedCar].color,{player:true});player.position.set(0,0,3);scene.add(player);
  const headlightMaterial=new THREE.MeshBasicMaterial({color:0xd9f2ff,transparent:true,opacity:.075,side:THREE.DoubleSide,depthWrite:false});
  const headlightBeams=[];
  for(const x of [-.56,.56]){const lamp=new THREE.SpotLight(0xd9efff,0,42,Math.PI/7,.55,1.5);lamp.position.set(x,.82,1.35);lamp.target.position.set(x,.25,-15);player.add(lamp);player.add(lamp.target);const beam=new THREE.Mesh(new THREE.ConeGeometry(2.8,19,24,1,true),headlightMaterial.clone());beam.rotation.x=-Math.PI/2;beam.position.set(x,.43,-8);beam.visible=false;player.add(beam);headlightBeams.push(beam);}
  const nitroGlow=mat(0x00cfff,.25,.2,{emissive:0x00aaff,emissiveIntensity:2});
  const exhaustGlows=[];for(const x of [-.48,.48]){const flame=new THREE.Mesh(new THREE.ConeGeometry(.085,.42,8),nitroGlow);flame.rotation.x=-Math.PI/2;flame.position.set(x,.48,1.91);flame.visible=false;player.add(flame);exhaustGlows.push(flame);}

  // Reusable roadside scenery
  const trees=[];const trunkMat=mat(0x5b422d),leafMatA=mat(0x426b48),leafMatB=mat(0x31573b);const treeSpan=Math.ceil((25+410)/12)*12; // length of the tree ring: keeps spacing even when a tree wraps to the far end
  function addTree(x,z,scale=1){const g=new THREE.Group();const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.15*scale,.24*scale,1.6*scale,7),trunkMat);trunk.position.y=.8*scale;trunk.castShadow=true;g.add(trunk);for(let i=0;i<3;i++){const c=new THREE.Mesh(new THREE.ConeGeometry((1.1-i*.16)*scale,1.7*scale,7),i===1?leafMatB:leafMatA);c.position.y=(1.65+i*.62)*scale;c.castShadow=true;g.add(c);}g.position.set(x,0,z);g.userData.offset=x;scene.add(g);trees.push(g);}
  for(let z=-410;z<25;z+=12){addTree(-10-Math.random()*5,z,.7+Math.random()*.65);addTree(10+Math.random()*5,z-5,.7+Math.random()*.65);}
  const opponents=[];const opponentColors=[0xd83b32,0x2674ce,0xe5e7eb,0x292d34,0x34a77a];
  function disposeCar(m){m.traverse(c=>{if(c.geometry)c.geometry.dispose();});}
  function spawnOpponent(z, police=false){const car=makeCar(police?0xf3f4f5:opponentColors[Math.floor(Math.random()*opponentColors.length)],{police});car.rotation.y=Math.PI;scene.add(car);const lane=[-4,-2,0,2,4][Math.floor(Math.random()*5)];car.position.set(curveAt(z),0,z);opponents.push({mesh:car,z,lane,speed:police?23:12+Math.random()*10,passed:false,police,boss:false,aiTimer:0});}
  for(let i=0;i<5;i++)spawnOpponent(-42-i*47);
  const policeCar=makeCar(0xf3f4f5,{police:true});policeCar.position.set(2,0,13);policeCar.visible=false;scene.add(policeCar);
  const keys={};let state='menu',speed=0,distance=0,score=0,elapsed=0,last=performance.now(),playerX=0,nitro=100,nitroUsed=false,policePressure=0,crashCooldown=0,level=1,nextLevelDistance=1200;
  let damage=0,heat=0,credits=0,bossActive=false,weather='clear',weatherClock=0,levelReward=0;
  try{credits=Number(localStorage.getItem('apexDriveCredits')||0);}catch(e){}
  const unlockedLevels=[1,3,5,7,9];
  function isCarUnlocked(i){try{return i===0||level>=unlockedLevels[i]||JSON.parse(localStorage.getItem('apexDriveUnlocked')||'[0]').includes(i);}catch(e){return i===0||level>=unlockedLevels[i];}}
  function saveProgress(){try{localStorage.setItem('apexDriveCredits',String(credits));localStorage.setItem('apexDriveUnlocked',JSON.stringify(cars.map((_,i)=>i).filter(isCarUnlocked)));}catch(e){} updateGarageUI();}
  function updateGarageUI(){if($('credits'))$('credits').textContent=credits.toLocaleString('en-US');if($('unlockedCars'))$('unlockedCars').textContent=cars.filter((_,i)=>isCarUnlocked(i)).length+'/'+cars.length;}
  function updateDamageUI(){$('damage').textContent=Math.round(damage);$('heat').textContent=Math.round(heat);$('damage').style.color=damage>70?'#ff3434':damage>35?'#ff9b4d':'#ffffff';}
  function setWeather(next){const changed=next!==weather;weather=next;weatherClock=0;const looks={clear:{bg:0x9db5c2,fog:0x9db5c2,label:'☀ QURUQ'},rain:{bg:0x596975,fog:0x596975,label:'🌧 YOMG‘IR'},fog:{bg:0x9aa4a8,fog:0x9aa4a8,label:'〰 TUMAN'},night:{bg:0x101722,fog:0x101722,label:'☾ TUN'}};const v=looks[next]||looks.clear;scene.background.setHex(v.bg);scene.fog.color.setHex(v.fog);scene.fog.near=next==='fog'?24:65;scene.fog.far=next==='fog'?125:260;$('weatherLabel').textContent=v.label;sun.intensity=next==='night'?0.45:next==='rain'?1.2:3.2;scene.traverse(o=>{if(o.isSpotLight)o.intensity=next==='night'?24:0;});ground.material.color.setHex(next==='rain'?0x35453f:next==='night'?0x222d2c:0x4d6741);if(changed)toast('OB-HAVO: '+v.label);}
  function applyLevelDifficulty(){const tier=Math.min(4,Math.floor((level-1)/3));const options=['clear','clear','rain','fog','night'];setWeather(options[tier]);if(level%5===0){spawnBoss();toast('BOSS LEVEL '+level+'!');sound('police');}if(level>=3&&level%2===1){const index=Math.min(cars.length-1,Math.floor(level/2));if(index>0){try{let arr=JSON.parse(localStorage.getItem('apexDriveUnlocked')||'[0]');if(!arr.includes(index)){arr.push(index);localStorage.setItem('apexDriveUnlocked',JSON.stringify(arr));credits+=500;saveProgress();toast(cars[index].name+' OCHILDI +500');}}catch(e){}}}}
  function spawnBoss(){if(bossActive)return;const car=makeCar(0x8e44ff,{police:true});car.scale.set(1.18,1.08,1.18);car.rotation.y=Math.PI;car.position.set(curveAt(-110,distance),0,-110);scene.add(car);const boss={mesh:car,z:-110,lane:0,speed:31+level*1.3,passed:false,police:true,boss:true,health:100};opponents.push(boss);bossActive=true;}
  function hitPlayer(amount,reason){if(crashCooldown>0)return;damage=clamp(damage+amount,0,100);crashCooldown=1.2;speed*=.62;nitro=Math.max(0,nitro-18);flash();sound('crash');updateDamageUI();toast(reason+'  SHIKAST '+Math.round(damage)+'%',true);if(damage>=100){endGame(false,'Mashina jiddiy shikastlandi! Garajda boshqa avtomobil tanla.');}}
  // Cheksiz poyga: finish masofasi yo‘q, faqat to‘qnashuvda tugaydi.
  let audioCtx=null,engineOsc=null,engineOsc2=null,engineOsc3=null,engineGain=null,engineFilter=null,windSource=null,windGain=null,windFilter=null,tireOsc=null,tireGain=null,audioEnabled=true;
  let sirenOsc=null,sirenOsc2=null,sirenGain=null,policeChaseActive=false;
  let bestScore=0;try{bestScore=Number(localStorage.getItem('apexDriveBest')||0);}catch(e){} $('bestScore').textContent=String(bestScore).padStart(6,'0');
  function initAudio(){if(audioCtx)return;try{audioCtx=new(window.AudioContext||window.webkitAudioContext)();engineOsc=audioCtx.createOscillator();engineOsc2=audioCtx.createOscillator();engineOsc3=audioCtx.createOscillator();engineGain=audioCtx.createGain();engineFilter=audioCtx.createBiquadFilter();engineFilter.type='lowpass';engineFilter.frequency.value=720;engineFilter.Q.value=1.1;engineOsc.type='sawtooth';engineOsc2.type='sawtooth';engineOsc3.type='triangle';engineOsc.frequency.value=48;engineOsc2.frequency.value=96;engineOsc3.frequency.value=24;engineGain.gain.value=.0001;engineOsc.connect(engineFilter);engineOsc2.connect(engineFilter);engineOsc3.connect(engineFilter);engineFilter.connect(engineGain);engineGain.connect(audioCtx.destination);engineOsc.start();engineOsc2.start();engineOsc3.start();
      // Procedural wind/road noise and tire squeal; no external audio files required.
      const noiseBuffer=audioCtx.createBuffer(1,audioCtx.sampleRate*2,audioCtx.sampleRate),noiseData=noiseBuffer.getChannelData(0);for(let i=0;i<noiseData.length;i++)noiseData[i]=(Math.random()*2-1)*.55;
      windSource=audioCtx.createBufferSource();windSource.buffer=noiseBuffer;windSource.loop=true;windFilter=audioCtx.createBiquadFilter();windFilter.type='lowpass';windFilter.frequency.value=380;windGain=audioCtx.createGain();windGain.gain.value=.0001;windSource.connect(windFilter);windFilter.connect(windGain);windGain.connect(audioCtx.destination);windSource.start();
      tireOsc=audioCtx.createOscillator();tireOsc.type='triangle';tireGain=audioCtx.createGain();tireGain.gain.value=.0001;tireOsc.frequency.value=1250;tireOsc.connect(tireGain);tireGain.connect(audioCtx.destination);tireOsc.start();
      sirenOsc=audioCtx.createOscillator();sirenOsc2=audioCtx.createOscillator();sirenGain=audioCtx.createGain();
      sirenOsc.type='sawtooth';sirenOsc2.type='square';sirenOsc.frequency.value=650;sirenOsc2.frequency.value=900;sirenGain.gain.value=.0001;
      const sirenFilter=audioCtx.createBiquadFilter();sirenFilter.type='lowpass';sirenFilter.frequency.value=1800;
      sirenOsc.connect(sirenFilter);sirenOsc2.connect(sirenFilter);sirenFilter.connect(sirenGain);sirenGain.connect(audioCtx.destination);sirenOsc.start();sirenOsc2.start();}catch(e){audioEnabled=false;}}
  // Engine, wind, tyre and siren gains are only driven while the race is running, so silence them on pause / game over / garage.
  let audioQuiet=true;
  function muteAudio(){if(!audioCtx)return;const t=audioCtx.currentTime;[engineGain,windGain,tireGain,sirenGain].forEach(g=>{if(g)g.gain.setTargetAtTime(.0001,t,.06);});}
  function sound(type){if(!audioEnabled)return;initAudio();if(!audioCtx)return;if(audioCtx.state==='suspended')audioCtx.resume();try{const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.connect(gain);gain.connect(audioCtx.destination);const now=audioCtx.currentTime;const presets={crash:[95,.22,'sawtooth'],nitro:[720,.12,'triangle'],pass:[520,.07,'sine'],start:[440,.13,'square'],police:[880,.1,'square']};const p=presets[type]||[350,.1,'sine'];osc.type=p[2];osc.frequency.setValueAtTime(p[0],now);osc.frequency.exponentialRampToValueAtTime(Math.max(40,p[0]*.55),now+p[1]);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(type==='crash'?.22:.09,now+.015);gain.gain.exponentialRampToValueAtTime(.0001,now+p[1]);osc.start(now);osc.stop(now+p[1]+.02);}catch(e){}}
  function updateCarChoice(){if(!isCarUnlocked(selectedCar))selectedCar=0;const c=cars[selectedCar];$('carName').textContent=c.name;$('carSpecs').textContent=c.desc;player.userData.bodyMat.color.setHex(c.color);const variants=[ [1,1,1], [1.02,.98,1.08], [1.04,1.02,.96], [1.08,.94,1.02], [.98,1.04,1.01] ];const v=variants[c.shape]||variants[0];player.scale.set(v[0],v[1],v[2]);updateGarageUI();}
  $('prevCar').addEventListener('click',()=>{for(let n=1;n<=cars.length;n++){const i=(selectedCar+cars.length-n)%cars.length;if(isCarUnlocked(i)){selectedCar=i;break;}}updateCarChoice();sound('pass');});$('nextCar').addEventListener('click',()=>{for(let n=1;n<=cars.length;n++){const i=(selectedCar+n)%cars.length;if(isCarUnlocked(i)){selectedCar=i;break;}}updateCarChoice();sound('pass');});
  const setStatus=t=>$('statusText').textContent=t;
  function flash(){ $('flash').style.opacity='.3';setTimeout(()=>$('flash').style.opacity='0',140); }
  // Toasts are queued so that a level-up, weather change, boss and unlock message no longer overwrite each other in the same frame.
  const toastQueue=[];let toastTimer=0,toastBusy=false;
  function showToast(){const t=toastQueue.shift();clearTimeout(toastTimer);if(t===undefined){toastBusy=false;$('toast').classList.add('hidden');return;}toastBusy=true;$('toast').textContent=t;$('toast').classList.remove('hidden');toastTimer=setTimeout(showToast,toastQueue.length?900:1400);}
  // Urgent toasts (crashes) jump to the front and show at once, but no longer wipe the queued level / boss / unlock messages.
  function toast(text,urgent){if(toastQueue.length>=4)toastQueue.shift();if(urgent)toastQueue.unshift(text);else toastQueue.push(text);if(urgent||!toastBusy)showToast();}
  function resetGame(){toastQueue.length=0;initAudio();if(audioCtx&&audioCtx.state==='suspended')audioCtx.resume();state='countdown';speed=0;distance=0;score=0;elapsed=0;playerX=0;level=1;nextLevelDistance=1200;damage=0;heat=0;bossActive=false;levelReward=0;setWeather('clear');$('level').textContent='1';nitro=100;nitroUsed=false;policePressure=0;policeChaseActive=false;policeCar.visible=false;if(sirenGain&&audioCtx)sirenGain.gain.setTargetAtTime(.0001,audioCtx.currentTime,.08);crashCooldown=0;player.position.set(0,0,3);player.rotation.set(0,0,0);updateCarChoice();opponents.forEach(o=>{scene.remove(o.mesh);disposeCar(o.mesh);});opponents.length=0;for(let i=0;i<6;i++)spawnOpponent(-42-i*45);updateDamageUI();policeCar.position.set(2,0,13);$('startScreen').classList.add('hidden');$('endScreen').classList.add('hidden');$('pauseScreen').classList.add('hidden');$('countdown').classList.remove('hidden');$('countdown').textContent='3';$('pauseBtn').textContent='Ⅱ';$('progressBar').style.width='100%';$('progressText').textContent='∞';$('nitroBar').style.width='100%';setStatus('POYGA BOSHLANMOQDA');sound('start');}
  function endGame(win,reason){if(state==='ended')return;state='ended';speed=0;credits+=Math.max(0,Math.floor(distance/100)*2+Math.floor(score/1000)*5);saveProgress();$('countdown').classList.add('hidden');$('resultEyebrow').textContent=win?'RACE COMPLETE / SIM 01':'RACE OVER / SIM 01';$('resultTitle').textContent=win?'FINISH!':'GAME OVER';$('resultTitle').style.color=win?'#ffd43b':'#ff6a60';$('resultText').textContent=reason;$('finalScore').textContent=Math.floor(score).toLocaleString('en-US');$('finalDistance').textContent=Math.floor(distance)+' m';if(score>bestScore){bestScore=Math.floor(score);try{localStorage.setItem('apexDriveBest',String(bestScore));}catch(e){}$('bestScore').textContent=String(bestScore).padStart(6,'0');toast('YANGI REKORD!');} $('finalBest').textContent=bestScore.toLocaleString('en-US');$('endScreen').classList.remove('hidden');setStatus(win?'POYGA TUGADI':'POYGA YAKUNLANDI');if(!win)sound('crash');}
  function togglePause(){if(state==='running'){state='paused';$('pauseScreen').classList.remove('hidden');$('pauseBtn').textContent='▶';setStatus('PAUZA');}else if(state==='paused'){state='running';$('pauseScreen').classList.add('hidden');$('pauseBtn').textContent='Ⅱ';setStatus('POYGA DAVOM ETMOQDA');}}
  $('startBtn').addEventListener('click',resetGame);$('restartBtn').addEventListener('click',resetGame);$('pauseRestartBtn').addEventListener('click',resetGame);$('resumeBtn').addEventListener('click',togglePause);$('pauseBtn').addEventListener('click',togglePause);$('garageBtn').addEventListener('click',()=>{$('endScreen').classList.add('hidden');$('startScreen').classList.remove('hidden');state='menu';});
  window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();keys[e.key.toLowerCase()]=true;if(e.key==='Escape')togglePause();if(e.key==='Enter'&&(state==='menu'||state==='ended'))resetGame();if(e.key.toLowerCase()==='r'&&state!=='menu')resetGame();});window.addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);window.addEventListener('blur',()=>{Object.keys(keys).forEach(k=>keys[k]=false);});
  document.querySelectorAll('#mobileControls button').forEach(btn=>{const key=btn.dataset.key;const down=e=>{e.preventDefault();keys[key]=true;btn.classList.add('active');if(key==='shift'&&!nitroUsed)sound('nitro');};const up=e=>{e.preventDefault();keys[key]=false;btn.classList.remove('active');};btn.addEventListener('pointerdown',down);btn.addEventListener('pointerup',up);btn.addEventListener('pointercancel',up);btn.addEventListener('pointerleave',up);});
  function update(dt){
    if(state==='running')audioQuiet=false;else if(!audioQuiet){muteAudio();audioQuiet=true;}
    if(state==='countdown'){elapsed+=dt;const n=3-Math.floor(elapsed);if(n>=1)$('countdown').textContent=String(n);else if(elapsed<3.7)$('countdown').textContent='GO!';else{state='running';elapsed=0;$('countdown').classList.add('hidden');setStatus('POYGA DAVOM ETMOQDA');}return;}
    if(state!=='running')return;elapsed+=dt;crashCooldown=Math.max(0,crashCooldown-dt);
    const car=cars[selectedCar],accelerating=keys.arrowup||keys.w,braking=keys.arrowdown||keys.s||keys[' '],steering=(keys.arrowleft||keys.a?-1:0)+(keys.arrowright||keys.d?1:0),boost=!!(keys.shift||keys.nitro)&&nitro>0;
    // Progressive difficulty: each level adds traffic pace and tighter police pressure.
    const difficulty=1+Math.min(1.55,(level-1)*.075);heat=clamp(heat+dt*(speed>45?0.7:0.18)+ (boost?dt*.9:0),0,100);policePressure=clamp(policePressure+Math.max(0,heat-35)*dt*.012,0,12);
    const roadCenterNow=curveAt(3,distance),curveAhead=curveAt(-7,distance)-roadCenterNow;
    if(speed>12)playerX-=clamp(curveAhead*.035,-.035,.035)*speed*dt;
    if(accelerating)speed+=4.6*car.accel*dt;else speed-=1.25*dt;if(braking)speed-=10*dt;
    // Leaving the asphalt costs grip and speed, like a simplified driving simulator.
    if(Math.abs(playerX)>4.55)speed-=Math.min(16,Math.abs(playerX)-4.2)*dt;
    if(boost){speed+=7.5*dt;nitro=Math.max(0,nitro-29*dt);nitroUsed=true;if(Math.random()<.025)sound('nitro');}else nitro=Math.min(100,nitro+5.5*dt);
    speed=clamp(speed,0,car.top/3.6);playerX+=steering*(4.2+speed*.07)*car.handling*dt;playerX=clamp(playerX,-5.15,5.15);
    const roadCenter=curveAt(3,distance);player.position.x=roadCenter+playerX;player.rotation.z=-steering*.075;player.rotation.y=-steering*.035;player.userData.wheels.forEach(w=>w.rotation.x+=speed*dt*.7);
    distance+=speed*dt*1.6;score+=speed*dt*(boost?2.6:1.55);
    if(distance>=nextLevelDistance){level++;nextLevelDistance+=1200+level*180;const reward=250+level*100;credits+=reward;levelReward+=reward;$('level').textContent=String(level);toast('LEVEL '+level+' · +'+reward+' KREDIT');sound('start');applyLevelDifficulty();saveProgress();/* saveProgress oxirida: avval unlock tekshiruvi ishlasin, aks holda yangi mashina "allaqachon ochilgan" deb hisoblanib, +500 va xabar yo'qolardi */}
    for(const part of roadParts){part.position.z+=speed*dt;if(part.position.z>18)part.position.z-=roadCount*segmentLength;part.position.x=curveAt(part.position.z,distance);const ahead=curveAt(part.position.z+2,distance)-curveAt(part.position.z-2,distance);part.rotation.y=Math.atan2(ahead,4);}
    for(const tree of trees){tree.position.z+=speed*dt;if(tree.position.z>25)tree.position.z-=treeSpan;tree.position.x=tree.userData.offset+curveAt(tree.position.z,distance);}
    for(const o of opponents){o.aiTimer=(o.aiTimer||0)-dt;if(o.aiTimer<=0){o.aiTimer=.7+Math.random()*1.3;if(o.boss){o.lane=clamp(-playerX*.55+(Math.random()-.5)*2,-4,4);}else if(o.police&&heat>25){o.lane=clamp(-playerX*.45+(Math.random()-.5)*2.5,-4,4);}else if(level>=4&&Math.abs(o.mesh.position.z-player.position.z)<32){o.lane=clamp(o.lane+(playerX>o.lane?1:-1),-4,4);}}o.mesh.position.z+=(speed+o.speed*difficulty)*dt*.62;o.mesh.position.x=curveAt(o.mesh.position.z,distance)+o.lane;o.mesh.userData.wheels.forEach(w=>w.rotation.x+=(speed+o.speed)*dt*.4);const dz=Math.abs(o.mesh.position.z-player.position.z),dx=Math.abs(o.mesh.position.x-player.position.x);if(dz<2.35&&dx<1.42&&crashCooldown<=0){if(o.boss){hitPlayer(32,'BOSS bilan to‘qnashuv');}else{hitPlayer(o.police?25:18,o.police?'Politsiya urildi':'Raqib bilan to‘qnashuv');}if(state==='ended')return;}if(!o.passed&&o.mesh.position.z>player.position.z+5){o.passed=true;score+=o.boss?1500:o.police?500:250;sound('pass');if(o.boss){bossActive=false;credits+=1000;saveProgress();toast('BOSS YENGILDI · +1000 KREDIT');}}if(o.mesh.position.z>22){if(o.boss){bossActive=false;scene.remove(o.mesh);disposeCar(o.mesh);opponents.splice(opponents.indexOf(o),1);break;}o.mesh.position.z=-170-Math.random()*120;o.lane=[-4,-2,0,2,4][Math.floor(Math.random()*5)];o.speed=o.police?23+level*1.2:12+Math.random()*10+Math.min(9,elapsed*.1)+level*1.1;o.passed=false;}}
    // Politsiya faqat 300 km/soatdan oshganda quvishni boshlaydi.
    const speedKmh=speed*3.6;
    if(!policeChaseActive&&speedKmh>300){
      policeChaseActive=true;policeCar.visible=true;policePressure=1;
      toast('300 KM/H! POLITSIYA QUVMOQDA!');sound('police');
    }
    if(policeChaseActive){
      policePressure=clamp(policePressure+(speed<18?dt*(.75+level*.025):boost?-dt*.8:-dt*.24)+Math.max(0,heat-45)*dt*.01,0,12);
      policeCar.position.z=player.position.z+13-policePressure*.72;
      policeCar.position.x=curveAt(policeCar.position.z,distance)+clamp(2.4-playerX*.28,-4.3,4.3);
      policeCar.userData.wheels.forEach(w=>w.rotation.x+=speed*dt*.6);
      if(sirenGain&&audioCtx){
        const sirenLevel=.035+Math.min(.045,policePressure*.003);
        sirenGain.gain.setTargetAtTime(sirenLevel,audioCtx.currentTime,.12);
        const sweep=650+Math.sin(elapsed*5.2)*230;
        sirenOsc.frequency.setTargetAtTime(sweep,audioCtx.currentTime,.06);
        sirenOsc2.frequency.setTargetAtTime(1050-Math.sin(elapsed*5.2)*260,audioCtx.currentTime,.06);
      }
      if(policePressure>10.8&&speed<11){setStatus('POLITSIYA YAQINLASHMOQDA');}
      else if(boost){setStatus('NITRO FAOL · POLITSIYA QUVMOQDA');}
      else setStatus('POLITSIYA QUVMOQDA');
    } else {
      if(sirenGain&&audioCtx)sirenGain.gain.setTargetAtTime(.0001,audioCtx.currentTime,.1);
      policeCar.visible=false;
      if(boost)setStatus('NITRO FAOL');else setStatus('POYGA DAVOM ETMOQDA');
    }
    camera.position.x+=(player.position.x*.40-camera.position.x)*Math.min(1,dt*2.1);camera.position.y=5.0+Math.sin(elapsed*13)*.025*(speed/40);camera.position.z=12.4;camera.lookAt(player.position.x*.22,.82,-9);camera.fov=61+(boost?4:0);camera.updateProjectionMatrix();headlightBeams.forEach(b=>{b.visible=weather==='night';});exhaustGlows.forEach(f=>{f.visible=boost;f.scale.setScalar(.8+Math.random()*.6);});
    if(engineOsc&&audioCtx){const rpm=clamp(speed/(cars[selectedCar].top/3.6),0,1),rev=38+rpm*260+(boost?42:0)+(accelerating?20:0);engineOsc.frequency.setTargetAtTime(rev,audioCtx.currentTime,.045);engineOsc2.frequency.setTargetAtTime(rev*2.01,audioCtx.currentTime,.04);engineOsc3.frequency.setTargetAtTime(rev*.49,audioCtx.currentTime,.06);engineFilter.frequency.setTargetAtTime(420+rpm*2700+(boost?850:0),audioCtx.currentTime,.07);engineGain.gain.setTargetAtTime(state==='running'?.022+rpm*.064+(boost?.022:0):.0001,audioCtx.currentTime,.08);if(windGain){windGain.gain.setTargetAtTime(state==='running'?.0001+Math.pow(rpm,1.5)*.055:.0001,audioCtx.currentTime,.18);windFilter.frequency.setTargetAtTime(260+rpm*1700,audioCtx.currentTime,.16);}if(tireGain){const squeal=state==='running'&&Math.abs(steering)>.3&&speed>24?Math.min(.055,Math.abs(steering)*speed*.0009):.0001;tireGain.gain.setTargetAtTime(squeal,audioCtx.currentTime,.08);tireOsc.frequency.setTargetAtTime(900+speed*9,audioCtx.currentTime,.08);}}
    $('speed').textContent=Math.round(speed*3.6);$('distance').textContent=Math.floor(distance);$('score').textContent=String(Math.floor(score)).padStart(6,'0');const roadPulse=(distance%1000)/1000*100;$('progressBar').style.width=(25+roadPulse*.75)+'%';$('progressText').textContent='∞';$('nitroBar').style.width=nitro+'%';$('mobileNitro').classList.toggle('nitro-active',boost);updateDamageUI();
    // Rain reduces grip; fog/night cycle visibility and grip challenges ramp with level.
    if(weather==='rain'&&Math.abs(steering)>0&&speed>35)playerX+=steering*.11*dt;
    if(weather==='night'&&sun.intensity!==0.45)sun.intensity=0.45;
  }
  function animate(now){requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.04);last=now;update(dt);renderer.render(scene,camera);}
  window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio||1,innerWidth<700?1.15:1.6));});
  updateCarChoice();updateDamageUI();setWeather('clear');requestAnimationFrame(animate);
})();
