/**
 * THE LONDON SALON — HAUTE COUTURE 2090
 * Next-Generation 3D WebGL Digital Experience Engine
 */

(function() {
  'use strict';

  // --- 1. SOUND ARCHITECTURE (WEB AUDIO API) ---
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.isMuted = true;
      this.ambientGain = null;
    }

    init() {
      if (this.ctx) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Ambient drone node
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      this.ambientGain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.value = 55; // A1
      osc2.type = 'triangle';
      osc2.frequency.value = 110; // A2

      filter.type = 'lowpass';
      filter.frequency.value = 180;

      this.ambientGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
    }

    toggleMute() {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.isMuted = !this.isMuted;
      if (this.ambientGain) {
        const target = this.isMuted ? 0.0001 : 0.04;
        this.ambientGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.5);
      }
      return !this.isMuted;
    }

    playChime() {
      if (this.isMuted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.15);

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.35);
      } catch (e) {}
    }

    playWhoosh() {
      if (this.isMuted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.2);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400, now);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.4);
      } catch (e) {}
    }
  }

  const sound = new SoundEngine();

  // --- 2. THREE.JS 3D WORLD ENGINE ---
  let scene, camera, renderer;
  let particleMesh, particleGeo;
  let hairStrandsGroup, floatingObjectsGroup;
  let scissorsGroup, perfumeMesh, dryerGroup, mirrorObject;
  let mouseX = 0, mouseY = 0;
  let targetCamX = 0, targetCamY = 0, targetCamZ = 12;
  let currentCamX = 0, currentCamY = 0, currentCamZ = 12;
  let scrollProgress = 0;

  function initThree() {
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050507, 0.04);

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 12);

    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const goldLight1 = new THREE.PointLight(0xd4af37, 4, 30);
    goldLight1.position.set(5, 5, 8);
    scene.add(goldLight1);

    const goldLight2 = new THREE.PointLight(0xf59e0b, 3, 30);
    goldLight2.position.set(-5, -4, 6);
    scene.add(goldLight2);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.2);
    rimLight.position.set(0, 10, -5);
    scene.add(rimLight);

    // Dynamic Hair Particle System (2,500 particles)
    buildParticleMatrix();

    // Floating Flowing Hair Strands (Bezier curve splines)
    buildFlowingHairStrands();

    // 3D Salon Floating Luxury Objects
    buildSalon3DObjects();

    window.addEventListener('resize', onWindowResize, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScrollUpdate, { passive: true });

    animate();
  }

  function buildParticleMatrix() {
    const count = 2500;
    particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const gold = new THREE.Color(0xd4af37);
    const champagne = new THREE.Color(0xf7e7a9);
    const obsidian = new THREE.Color(0x3a3b45);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Cylinder distribution
      const radius = 3 + Math.random() * 15;
      const angle = Math.random() * Math.PI * 2;
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = (Math.random() - 0.5) * 35;
      positions[i3 + 2] = (Math.random() - 0.5) * 20;

      const choice = Math.random();
      const col = choice > 0.6 ? gold : (choice > 0.25 ? champagne : obsidian);
      colors[i3] = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;

      sizes[i] = Math.random() * 3 + 1;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Custom Particle Texture
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d');
    const grad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(247,231,169,0.8)');
    grad.addColorStop(0.7, 'rgba(212,175,55,0.2)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    pCtx.fillStyle = grad;
    pCtx.fillRect(0, 0, 64, 64);
    const pTex = new THREE.CanvasTexture(pCanvas);

    const mat = new THREE.PointsMaterial({
      size: 0.15,
      map: pTex,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    particleMesh = new THREE.Points(particleGeo, mat);
    scene.add(particleMesh);
  }

  function buildFlowingHairStrands() {
    hairStrandsGroup = new THREE.Group();
    const strandCount = 14;
    const strandMat = new THREE.LineBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.45,
      linewidth: 2
    });

    for (let i = 0; i < strandCount; i++) {
      const points = [];
      const baseY = -10 + i * 1.5;
      for (let j = 0; j < 25; j++) {
        const x = (j - 12) * 0.7;
        const y = baseY + Math.sin(j * 0.5 + i) * 1.8;
        const z = Math.cos(j * 0.3 + i * 0.7) * 2;
        points.push(new THREE.Vector3(x, y, z));
      }
      const curve = new THREE.CatmullRomCurve3(points);
      const curvePoints = curve.getPoints(100);
      const geo = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const line = new THREE.Line(geo, strandMat);
      line.userData = { offset: i, points: points, curve: curve };
      hairStrandsGroup.add(line);
    }

    scene.add(hairStrandsGroup);
  }

  function buildSalon3DObjects() {
    floatingObjectsGroup = new THREE.Group();

    // --- Object 1: Futuristic Scissors ---
    scissorsGroup = new THREE.Group();
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.95,
      roughness: 0.15,
      envMapIntensity: 1.5
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.2
    });

    const bladeGeo = new THREE.ConeGeometry(0.12, 2.5, 4);
    bladeGeo.scale(0.3, 1, 1);

    const blade1 = new THREE.Mesh(bladeGeo, metalMat);
    blade1.position.y = 1.1;
    blade1.rotation.z = -0.15;

    const blade2 = new THREE.Mesh(bladeGeo, metalMat);
    blade2.position.y = 1.1;
    blade2.rotation.z = 0.15;

    const handleRingGeo = new THREE.TorusGeometry(0.35, 0.08, 12, 32);
    const ring1 = new THREE.Mesh(handleRingGeo, goldMat);
    ring1.position.set(-0.4, -0.4, 0);

    const ring2 = new THREE.Mesh(handleRingGeo, goldMat);
    ring2.position.set(0.4, -0.4, 0);

    const pivotGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.25, 16);
    const pivot = new THREE.Mesh(pivotGeo, goldMat);
    pivot.rotation.x = Math.PI / 2;

    scissorsGroup.add(blade1, blade2, ring1, ring2, pivot);
    scissorsGroup.position.set(3.5, 1.5, 2);
    scissorsGroup.scale.set(0.8, 0.8, 0.8);
    floatingObjectsGroup.add(scissorsGroup);

    // --- Object 2: Futuristic Luxury Perfume / Elixir Bottle ---
    const bottleGroup = new THREE.Group();
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x111116,
      transmission: 0.75,
      opacity: 0.9,
      transparent: true,
      roughness: 0.1,
      metalness: 0.1,
      ior: 1.5
    });

    const liquidMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0x996515,
      emissiveIntensity: 0.4,
      metalness: 0.8,
      roughness: 0.3
    });

    const bottleGeo = new THREE.CylinderGeometry(0.7, 0.8, 2.0, 8);
    const bottleMesh = new THREE.Mesh(bottleGeo, glassMat);

    const liquidGeo = new THREE.CylinderGeometry(0.6, 0.7, 1.4, 8);
    const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
    liquidMesh.position.y = -0.2;

    const capGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.6, 16);
    const capMesh = new THREE.Mesh(capGeo, goldMat);
    capMesh.position.y = 1.3;

    bottleGroup.add(bottleMesh, liquidMesh, capMesh);
    bottleGroup.position.set(-3.8, -1.0, 1.5);
    bottleGroup.scale.set(0.85, 0.85, 0.85);
    floatingObjectsGroup.add(bottleGroup);
    perfumeMesh = bottleGroup;

    // --- Object 3: Futuristic Hair Dryer / Styler ---
    dryerGroup = new THREE.Group();
    const bodyGeo = new THREE.CylinderGeometry(0.35, 0.5, 1.8, 24);
    bodyGeo.rotateZ(Math.PI / 2);
    const bodyMesh = new THREE.Mesh(bodyGeo, metalMat);

    const nozzleGeo = new THREE.CylinderGeometry(0.25, 0.35, 0.7, 24);
    nozzleGeo.rotateZ(Math.PI / 2);
    const nozzleMesh = new THREE.Mesh(nozzleGeo, goldMat);
    nozzleMesh.position.x = 1.1;

    const handleDryerGeo = new THREE.CylinderGeometry(0.2, 0.22, 1.3, 16);
    const handleDryer = new THREE.Mesh(handleDryerGeo, glassMat);
    handleDryer.position.set(-0.2, -0.9, 0);
    handleDryer.rotation.z = 0.2;

    const ringLightGeo = new THREE.TorusGeometry(0.36, 0.04, 16, 32);
    ringLightGeo.rotateY(Math.PI / 2);
    const ringLightMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const ringLight = new THREE.Mesh(ringLightGeo, ringLightMat);
    ringLight.position.x = 1.45;

    dryerGroup.add(bodyMesh, nozzleMesh, handleDryer, ringLight);
    dryerGroup.position.set(4.2, -3.5, 0);
    dryerGroup.scale.set(0.7, 0.7, 0.7);
    floatingObjectsGroup.add(dryerGroup);

    // --- Object 4: Floating Cosmic Salon Mirror ---
    mirrorObject = new THREE.Group();
    const mirrorRingGeo = new THREE.TorusGeometry(1.6, 0.1, 16, 64);
    const mirrorFrame = new THREE.Mesh(mirrorRingGeo, goldMat);

    const discGeo = new THREE.CircleGeometry(1.5, 64);
    const discMat = new THREE.MeshStandardMaterial({
      color: 0x050508,
      metalness: 0.98,
      roughness: 0.02
    });
    const discMesh = new THREE.Mesh(discGeo, discMat);

    mirrorObject.add(mirrorFrame, discMesh);
    mirrorObject.position.set(0, -6.5, -1);
    floatingObjectsGroup.add(mirrorObject);

    scene.add(floatingObjectsGroup);
  }

  function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  function onMouseMove(e) {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }

  function onScrollUpdate() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  }

  function animate() {
    requestAnimationFrame(animate);

    const time = performance.now() * 0.001;

    // Fluid Camera lerp based on scroll progress and mouse coordinates
    targetCamX = mouseX * 0.8;
    targetCamY = -scrollProgress * 25 + mouseY * 0.6;
    targetCamZ = 12 + Math.sin(scrollProgress * Math.PI) * 4;

    currentCamX += (targetCamX - currentCamX) * 0.05;
    currentCamY += (targetCamY - currentCamY) * 0.05;
    currentCamZ += (targetCamZ - currentCamZ) * 0.05;

    camera.position.set(currentCamX, currentCamY, currentCamZ);
    camera.lookAt(currentCamX * 0.4, currentCamY * 0.8, 0);

    // Particle Undulation
    if (particleMesh) {
      particleMesh.rotation.y = time * 0.04;
      particleMesh.rotation.x = Math.sin(time * 0.02) * 0.1;
      const pos = particleGeo.attributes.position.array;
      for (let i = 1; i < pos.length; i += 3) {
        pos[i] += Math.sin(time * 2 + pos[i - 1] * 0.5) * 0.006;
      }
      particleGeo.attributes.position.needsUpdate = true;
    }

    // Hair Strands Flow Physics
    if (hairStrandsGroup) {
      hairStrandsGroup.children.forEach((line) => {
        const offset = line.userData.offset;
        line.rotation.z = Math.sin(time * 0.8 + offset) * 0.05;
        line.position.x = Math.cos(time * 0.5 + offset) * 0.2;
      });
    }

    // Floating Objects Animation
    if (scissorsGroup) {
      scissorsGroup.rotation.y = time * 0.6 + mouseX * 0.5;
      scissorsGroup.rotation.x = Math.sin(time * 0.4) * 0.2;
      scissorsGroup.position.y = 1.5 + Math.sin(time * 1.5) * 0.25;
      // Snip blades slightly
      const snip = Math.abs(Math.sin(time * 2)) * 0.25;
      scissorsGroup.children[0].rotation.z = -0.05 - snip;
      scissorsGroup.children[1].rotation.z = 0.05 + snip;
    }

    if (perfumeMesh) {
      perfumeMesh.rotation.y = time * 0.4 - mouseX * 0.4;
      perfumeMesh.rotation.z = Math.cos(time * 0.7) * 0.15;
      perfumeMesh.position.y = -1.0 + Math.cos(time * 1.2) * 0.2;
    }

    if (dryerGroup) {
      dryerGroup.rotation.y = -time * 0.5;
      dryerGroup.position.y = -3.5 + Math.sin(time * 1.3) * 0.2;
    }

    if (mirrorObject) {
      mirrorObject.rotation.y = time * 0.3;
      mirrorObject.rotation.x = Math.sin(time * 0.6) * 0.1;
    }

    renderer.render(scene, camera);
  }

  // --- 3. CUSTOM 3D CURSOR ENGINE ---
  function initCustomCursor() {
    const cursor = document.querySelector('.custom-cursor');
    const dot = document.querySelector('.custom-cursor-dot');
    const cursorText = document.querySelector('.custom-cursor-text');
    if (!cursor || !dot) return;

    let targetX = -100, targetY = -100;
    let currX = -100, currY = -100;

    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    }, { passive: true });

    function renderCursor() {
      currX += (targetX - currX) * 0.2;
      currY += (targetY - currY) * 0.2;
      cursor.style.transform = `translate(${currX}px, ${currY}px)`;
      requestAnimationFrame(renderCursor);
    }
    renderCursor();

    // Hover interactive state triggers
    const interactables = document.querySelectorAll('a, button, .service-card-3d, .gallery-card, .stylist-card-3d, .hologram-stage, .split-handle');
    interactables.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('hovering-interact');
        sound.playChime();
        let label = 'EXPLORE';
        if (el.tagName === 'BUTTON' || el.classList.contains('btn-magnetic')) label = 'SELECT';
        if (el.classList.contains('service-card-3d')) label = 'HAUTE';
        if (el.classList.contains('gallery-card')) label = 'INSPECT';
        if (el.classList.contains('split-handle')) label = 'TRANSFORM';
        if (cursorText) cursorText.textContent = label;
      });

      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hovering-interact');
        if (cursorText) cursorText.textContent = '';
      });
    });
  }

  // --- 4. PORTAL / INTRO GATEWAY UNLOCK ---
  function initPortal() {
    const portal = document.querySelector('.experience-portal');
    const enterBtn = document.querySelector('.portal-btn-enter');
    if (!portal || !enterBtn) return;

    enterBtn.addEventListener('click', () => {
      sound.toggleMute();
      sound.playWhoosh();
      portal.classList.add('unlocked');
      const soundBtn = document.querySelector('.btn-sound');
      if (soundBtn) soundBtn.classList.add('playing');
    });
  }

  // --- 5. INTERACTIVE 3D MIRROR CONTROLLER ---
  function initMirrorController() {
    const modeBtns = document.querySelectorAll('.mirror-mode-btn');
    const wordEl = document.querySelector('.mirror-hologram-word');
    const auraStatus = document.querySelector('.mirror-aura-status');
    if (!modeBtns.length || !wordEl) return;

    const mirrorPhrases = [
      'YOUR STYLE',
      'YOUR CONFIDENCE',
      'YOUR LOOK',
      'HAUTE 2090'
    ];
    let phraseIdx = 0;

    setInterval(() => {
      phraseIdx = (phraseIdx + 1) % mirrorPhrases.length;
      wordEl.style.opacity = '0';
      wordEl.style.transform = 'translateY(10px) scale(0.95)';
      setTimeout(() => {
        wordEl.textContent = mirrorPhrases[phraseIdx];
        wordEl.style.opacity = '1';
        wordEl.style.transform = 'translateY(0) scale(1)';
      }, 400);
    }, 3200);

    modeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        sound.playChime();
        const mode = btn.dataset.mode || 'Champagne';
        if (auraStatus) auraStatus.textContent = `OPTICAL SPECTRUM: ${mode.toUpperCase()} ACTIVE`;
      });
    });
  }

  // --- 6. HOLOGRAPHIC BEFORE / AFTER SLIDER ---
  function initBeforeAfterSlider() {
    const container = document.querySelector('.transformation-container');
    const afterLayer = document.querySelector('.split-image-after');
    const handle = document.querySelector('.split-handle');
    if (!container || !afterLayer || !handle) return;

    let isDragging = false;

    function updateSplit(x) {
      const rect = container.getBoundingClientRect();
      let percent = ((x - rect.left) / rect.width) * 100;
      percent = Math.max(5, Math.min(95, percent));
      afterLayer.style.width = `${percent}%`;
      handle.style.left = `${percent}%`;
    }

    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      updateSplit(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      updateSplit(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Touch support
    container.addEventListener('touchstart', (e) => {
      isDragging = true;
      if (e.touches[0]) updateSplit(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging || !e.touches[0]) return;
      updateSplit(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });
  }

  // --- 7. 5-STEP LUXURY BOOKING WIZARD ---
  const bookingState = {
    service: 'Precision Hair Architecture',
    price: '₹1,500',
    stylist: 'Arjun Mehta',
    date: '',
    time: '',
    name: '',
    phone: '',
    email: '',
    notes: ''
  };

  function initBookingWizard() {
    const stepNodes = document.querySelectorAll('.step-node');
    const panels = document.querySelectorAll('.wizard-panel');
    const nextBtns = document.querySelectorAll('.btn-wizard-next');
    const prevBtns = document.querySelectorAll('.btn-wizard-prev');
    let currentStep = 1;

    function goToStep(step) {
      if (step < 1 || step > 5) return;
      currentStep = step;
      sound.playWhoosh();

      panels.forEach((p, idx) => {
        p.classList.toggle('active', idx + 1 === currentStep);
      });

      stepNodes.forEach((node, idx) => {
        const stepNum = idx + 1;
        node.classList.toggle('active', stepNum === currentStep);
        node.classList.toggle('completed', stepNum < currentStep);
      });
    }

    nextBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        // Simple validation for step 5
        if (currentStep === 5) {
          submitBooking();
          return;
        }
        goToStep(currentStep + 1);
      });
    });

    prevBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        goToStep(currentStep - 1);
      });
    });

    stepNodes.forEach((node) => {
      node.addEventListener('click', () => {
        const targetStep = parseInt(node.dataset.step, 10);
        if (targetStep) goToStep(targetStep);
      });
    });

    // Service selection
    document.querySelectorAll('.selection-card[data-service]').forEach((card) => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.selection-card[data-service]').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        sound.playChime();
        bookingState.service = card.dataset.service;
        bookingState.price = card.dataset.price || '₹1,500';
      });
    });

    // Stylist selection
    document.querySelectorAll('.selection-card[data-stylist]').forEach((card) => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.selection-card[data-stylist]').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        sound.playChime();
        bookingState.stylist = card.dataset.stylist;
      });
    });

    // Date selection
    document.querySelectorAll('.selection-card[data-date]').forEach((card) => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.selection-card[data-date]').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        sound.playChime();
        bookingState.date = card.dataset.date;
      });
    });

    // Time slot selection
    document.querySelectorAll('.selection-card[data-time]').forEach((card) => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.selection-card[data-time]').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        sound.playChime();
        bookingState.time = card.dataset.time;
      });
    });
  }

  function submitBooking() {
    const nameIn = document.getElementById('book-name');
    const phoneIn = document.getElementById('book-phone');
    const emailIn = document.getElementById('book-email');
    const notesIn = document.getElementById('book-notes');

    bookingState.name = nameIn ? nameIn.value.trim() : 'Guest';
    bookingState.phone = phoneIn ? phoneIn.value.trim() : '08171717579';
    bookingState.email = emailIn ? emailIn.value.trim() : '';
    bookingState.notes = notesIn ? notesIn.value.trim() : '';

    if (!bookingState.name || !bookingState.phone) {
      alert('Kindly provide your Name and Contact Phone Number to finalize your haute appointment.');
      return;
    }

    const bookingId = 'TLS-' + Math.floor(1000 + Math.random() * 9000);
    const appointmentRecord = {
      id: bookingId,
      ...bookingState,
      status: 'Confirmed',
      timestamp: new Date().toISOString()
    };

    // Store in localStorage for admin panel synchronization
    const existing = JSON.parse(localStorage.getItem('tls_appointments') || '[]');
    existing.unshift(appointmentRecord);
    localStorage.setItem('tls_appointments', JSON.stringify(existing));

    sound.playChime();

    // Show Confirmation Modal
    const modal = document.querySelector('.booking-modal-overlay');
    const codeEl = document.querySelector('.modal-passcode');
    const detailsEl = document.querySelector('.modal-summary-text');
    const waBtn = document.querySelector('.btn-wa-confirm');

    if (codeEl) codeEl.textContent = bookingId;
    if (detailsEl) {
      detailsEl.innerHTML = `
        <strong>${bookingState.name}</strong> • ${bookingState.service}<br>
        Stylist: <em>${bookingState.stylist}</em><br>
        Schedule: ${bookingState.date || 'Tomorrow'} at ${bookingState.time || '11:00 AM'}<br>
        Location: 2nd Floor, Court Road, Anantapur
      `;
    }

    if (waBtn) {
      const waMsg = encodeURIComponent(`Hello The London Salon, I have confirmed appointment #${bookingId} for ${bookingState.service} with ${bookingState.stylist} on ${bookingState.date || 'Tomorrow'} at ${bookingState.time || '11:00 AM'}. Name: ${bookingState.name}, Phone: ${bookingState.phone}.`);
      waBtn.href = `https://wa.me/918171717579?text=${waMsg}`;
    }

    if (modal) modal.classList.add('active');
  }

  // --- 8. INITIALIZE GLOBAL LISTENERS ---
  window.addEventListener('DOMContentLoaded', () => {
    initThree();
    initCustomCursor();
    initPortal();
    initMirrorController();
    initBeforeAfterSlider();
    initBookingWizard();

    // Sound toggle in nav
    const soundBtn = document.querySelector('.btn-sound');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const active = sound.toggleMute();
        soundBtn.classList.toggle('playing', active);
      });
    }

    // Close booking modal
    const closeBtn = document.querySelector('.btn-modal-close');
    const modal = document.querySelector('.booking-modal-overlay');
    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
      });
    }

    // Header scroll background toggle
    const header = document.querySelector('.site-header');
    window.addEventListener('scroll', () => {
      if (header) {
        header.classList.toggle('scrolled', window.scrollY > 50);
      }
    }, { passive: true });
  });

})();
