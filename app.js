/* ==========================================================================
   THE LONDON SALON — COURT ROAD, ANANTAPUR
   Interactive Core Engine: Three.js, Web Audio, Lookbook, Booking & Gallery
   ========================================================================== */

(function() {
  'use strict';

  // 1. OPENING EXPERIENCE PORTAL
  const portal = document.getElementById('experience-portal');
  const btnEnter = document.getElementById('btn-enter-experience');
  if (btnEnter && portal) {
    btnEnter.addEventListener('click', () => {
      portal.classList.add('portal-hidden');
      initAudioOnFirstInteraction();
    });
  }

  // 2. STICKY HEADER SCROLL STATE
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 3. CUSTOM 3D CURSOR
  const cursor = document.querySelector('.custom-cursor');
  const cursorDot = document.querySelector('.custom-cursor-dot');
  if (cursor && cursorDot) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    function renderCursor() {
      cursorX += (mouseX - cursorX) * 0.18;
      cursorY += (mouseY - cursorY) * 0.18;
      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;
      requestAnimationFrame(renderCursor);
    }
    renderCursor();

    const interactives = document.querySelectorAll('a, button, input, select, textarea, .gallery-card, .service-card-3d');
    interactives.forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hovering-interact'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hovering-interact'));
    });
  }

  // 4. THREE.JS 3D BACKGROUND ENGINE
  const canvas = document.getElementById('webgl-canvas');
  if (canvas && typeof THREE !== 'undefined') {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 45;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Stardust Gold Particles
    const particleCount = 2200;
    const posArray = new Float32Array(particleCount * 3);
    const colorArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 120;
      posArray[i + 1] = (Math.random() - 0.5) * 120;
      posArray[i + 2] = (Math.random() - 0.5) * 80;

      // Subtle gold & champagne tone variations
      const tone = Math.random();
      if (tone > 0.7) {
        colorArray[i] = 0.95;     // Gold
        colorArray[i + 1] = 0.82;
        colorArray[i + 2] = 0.35;
      } else if (tone > 0.3) {
        colorArray[i] = 0.9;      // Champagne
        colorArray[i + 1] = 0.85;
        colorArray[i + 2] = 0.72;
      } else {
        colorArray[i] = 0.45;     // Deep bronze
        colorArray[i + 1] = 0.40;
        colorArray[i + 2] = 0.25;
      }
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.28,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particleGeo, particleMat);
    scene.add(particlesMesh);

    // Floating 3D Geometric Salon Elements
    const ringGeo = new THREE.TorusGeometry(12, 0.25, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, wireframe: true, transparent: true, opacity: 0.12 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(20, -5, -10);
    scene.add(ringMesh);

    const octaGeo = new THREE.OctahedronGeometry(6, 0);
    const octaMat = new THREE.MeshBasicMaterial({ color: 0xf7e7a9, wireframe: true, transparent: true, opacity: 0.15 });
    const octaMesh = new THREE.Mesh(octaGeo, octaMat);
    octaMesh.position.set(-24, 10, -15);
    scene.add(octaMesh);

    // Mouse Interaction
    let targetX = 0;
    let targetY = 0;
    window.addEventListener('mousemove', (e) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 4;
      targetY = (e.clientY / window.innerHeight - 0.5) * 4;
    });

    function animateThree() {
      requestAnimationFrame(animateThree);
      particlesMesh.rotation.y += 0.0006;
      particlesMesh.rotation.x += 0.0002;

      ringMesh.rotation.x += 0.002;
      ringMesh.rotation.y += 0.003;
      octaMesh.rotation.y += 0.004;
      octaMesh.rotation.z += 0.002;

      camera.position.x += (targetX - camera.position.x) * 0.03;
      camera.position.y += (-targetY - camera.position.y) * 0.03;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    }
    animateThree();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  // 5. WEB AUDIO SYNTHESIZER: RELAXING LUXURY SALON LOUNGE SOUND
  let audioCtx = null;
  let isSoundPlaying = false;
  let loungeOscillators = [];
  let masterGain = null;

  function initAudioOnFirstInteraction() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
  }

  function startLoungeAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 3);
    masterGain.connect(audioCtx.destination);

    // Warm chords: E major 9th warm acoustic ambient harmony
    const baseFreqs = [164.81, 207.65, 246.94, 329.63, 370.00]; // E3, G#3, B3, E4, F#4
    loungeOscillators = baseFreqs.map((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      // Low pass filter for warm, velvety texture
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450 + (idx * 120), audioCtx.currentTime);

      oscGain.gain.setValueAtTime(0.04, audioCtx.currentTime);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start();

      return osc;
    });

    isSoundPlaying = true;
    updateSoundBtnState(true);
  }

  function stopLoungeAudio() {
    if (masterGain && audioCtx) {
      masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);
      setTimeout(() => {
        loungeOscillators.forEach(osc => {
          try { osc.stop(); osc.disconnect(); } catch(e) {}
        });
        loungeOscillators = [];
      }, 1300);
    }
    isSoundPlaying = false;
    updateSoundBtnState(false);
  }

  const btnSound = document.getElementById('btn-sound-toggle');
  function updateSoundBtnState(playing) {
    if (!btnSound) return;
    const statusText = btnSound.querySelector('.sound-status-text');
    if (playing) {
      btnSound.classList.add('playing');
      if (statusText) statusText.textContent = 'SOUND: ON';
    } else {
      btnSound.classList.remove('playing');
      if (statusText) statusText.textContent = 'LOUNGE AUDIO';
    }
  }

  if (btnSound) {
    btnSound.addEventListener('click', () => {
      initAudioOnFirstInteraction();
      if (!isSoundPlaying) {
        startLoungeAudio();
      } else {
        stopLoungeAudio();
      }
    });
  }

  // 6. HERO SECTION: INTERACTIVE REAL SALON VIEWS
  const heroTabs = document.querySelectorAll('.hero-tab-btn');
  const heroViews = document.querySelectorAll('.hologram-view');
  let autoRotateInterval = null;

  function switchHeroView(targetId) {
    heroTabs.forEach(t => {
      t.classList.toggle('active', t.getAttribute('data-view') === targetId);
    });
    heroViews.forEach(v => {
      v.classList.toggle('active', v.id === targetId);
    });
  }

  heroTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const viewId = tab.getAttribute('data-view');
      switchHeroView(viewId);
      clearInterval(autoRotateInterval); // user took control
    });
  });

  // Auto rotate hero views every 5 seconds
  let currentHeroIndex = 0;
  const viewIds = ['view-interior', 'view-exterior', 'view-lounge'];
  autoRotateInterval = setInterval(() => {
    currentHeroIndex = (currentHeroIndex + 1) % viewIds.length;
    switchHeroView(viewIds[currentHeroIndex]);
  }, 5000);

  // 7. VIRTUAL LOOKBOOK & CONSULTATION SELECTOR
  const lookbookBtns = document.querySelectorAll('.mirror-mode-btn');
  const lookbookImg = document.getElementById('lookbook-active-img');
  const lookbookBadge = document.getElementById('lookbook-active-badge');
  const lookbookTitle = document.getElementById('lookbook-title');
  const lookbookDesc = document.getElementById('lookbook-desc');
  const lookbookTime = document.getElementById('lookbook-time');
  const lookbookPrice = document.getElementById('lookbook-price');
  const btnBookLookbook = document.getElementById('btn-book-lookbook-style');

  lookbookBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      lookbookBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const img = btn.getAttribute('data-img');
      const title = btn.getAttribute('data-title');
      const desc = btn.getAttribute('data-desc');
      const time = btn.getAttribute('data-time');
      const price = btn.getAttribute('data-price');
      const styleName = btn.querySelector('.mode-name').textContent.replace('✦', '').trim();

      if (lookbookImg) {
        lookbookImg.style.opacity = '0';
        setTimeout(() => {
          lookbookImg.src = img;
          lookbookImg.style.opacity = '1';
        }, 200);
      }
      if (lookbookBadge) lookbookBadge.textContent = styleName.toUpperCase();
      if (lookbookTitle) lookbookTitle.textContent = title;
      if (lookbookDesc) lookbookDesc.textContent = desc;
      if (lookbookTime) lookbookTime.textContent = `⏱ ${time}`;
      if (lookbookPrice) lookbookPrice.textContent = price;
    });
  });

  if (btnBookLookbook) {
    btnBookLookbook.addEventListener('click', () => {
      const activeBtn = document.querySelector('.mirror-mode-btn.active');
      if (activeBtn) {
        const style = activeBtn.getAttribute('data-style');
        // Pre-check corresponding service checkbox
        const checkboxes = document.querySelectorAll('input[name="services"]');
        checkboxes.forEach(cb => {
          if (style === 'balayage' && cb.value.includes('Balayage')) cb.checked = true;
          if (style === 'precision' && cb.value.includes('Couture Haircut')) cb.checked = true;
          if (style === 'nails' && cb.value.includes('Nail Art')) cb.checked = true;
          if (style === 'bridal' && cb.value.includes('Bridal')) cb.checked = true;
          if (style === 'scalp' && cb.value.includes('Head Spa')) cb.checked = true;
        });
      }
    });
  }

  // 8. BEFORE & AFTER TRANSFORMATION SLIDER
  const transContainer = document.querySelector('.transformation-container');
  const afterLayer = document.querySelector('.split-image-after');
  const splitHandle = document.querySelector('.split-handle');

  if (transContainer && afterLayer && splitHandle) {
    let isDragging = false;

    function updateSlider(clientX) {
      const rect = transContainer.getBoundingClientRect();
      let pos = (clientX - rect.left) / rect.width;
      if (pos < 0.05) pos = 0.05;
      if (pos > 0.95) pos = 0.95;
      afterLayer.style.width = `${pos * 100}%`;
      splitHandle.style.left = `${pos * 100}%`;
    }

    transContainer.addEventListener('mousedown', (e) => {
      isDragging = true;
      updateSlider(e.clientX);
    });
    window.addEventListener('mouseup', () => { isDragging = false; });
    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      updateSlider(e.clientX);
    });

    transContainer.addEventListener('touchstart', (e) => {
      isDragging = true;
      updateSlider(e.touches[0].clientX);
    }, { passive: true });
    window.addEventListener('touchend', () => { isDragging = false; });
    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      updateSlider(e.touches[0].clientX);
    }, { passive: true });
  }

  // 9. GALLERY FILTERING & LIGHTBOX
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const galleryCards = document.querySelectorAll('.gallery-card');
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');

      galleryCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  galleryCards.forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('.gallery-card-img');
      const title = card.querySelector('.gallery-title');
      if (lightbox && lightboxImg && img) {
        lightboxImg.src = img.src;
        if (lightboxCaption && title) {
          lightboxCaption.textContent = title.textContent;
        }
        lightbox.classList.add('active');
      }
    });
  });

  if (lightboxClose && lightbox) {
    lightboxClose.addEventListener('click', () => lightbox.classList.remove('active'));
    lightbox.addEventListener('click', (e) => {
      if (e.target.classList.contains('lightbox-overlay')) {
        lightbox.classList.remove('active');
      }
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        lightbox.classList.remove('active');
      }
    });
  }

  // 10. 5-STEP LUXURY BOOKING WIZARD & WHATSAPP SYNC
  const wizardSteps = document.querySelectorAll('.wizard-step');
  const stepPanels = document.querySelectorAll('.step-panel');
  const nextBtns = document.querySelectorAll('.btn-next');
  const prevBtns = document.querySelectorAll('.btn-prev');
  const bookingForm = document.getElementById('booking-form');

  // Set minimum date to today
  const dateInput = document.getElementById('booking-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
  }

  function goToStep(stepNumber) {
    wizardSteps.forEach(s => {
      const num = parseInt(s.getAttribute('data-step'), 10);
      s.classList.toggle('active', num <= stepNumber);
    });
    stepPanels.forEach(p => {
      p.classList.toggle('active', p.id === `step-${stepNumber}`);
    });
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  nextBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const nextStep = parseInt(btn.getAttribute('data-next'), 10);
      if (nextStep === 2) {
        // Validate at least one service selected
        const selected = document.querySelectorAll('input[name="services"]:checked');
        if (selected.length === 0) {
          alert('Please select at least one luxury service to continue.');
          return;
        }
      }
      if (nextStep === 4) {
        // Validate date
        if (!dateInput.value) {
          alert('Please choose your preferred appointment date.');
          return;
        }
      }
      goToStep(nextStep);
    });
  });

  prevBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const prevStep = parseInt(btn.getAttribute('data-prev'), 10);
      goToStep(prevStep);
    });
  });

  // Pre-fill service buttons from service cards
  document.querySelectorAll('.service-btn-book').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = btn.closest('.service-card-3d');
      if (card) {
        const title = card.querySelector('.service-title').textContent.trim();
        const checkboxes = document.querySelectorAll('input[name="services"]');
        checkboxes.forEach(cb => {
          if (cb.value.toLowerCase().includes(title.toLowerCase().slice(0, 10))) {
            cb.checked = true;
          }
        });
      }
    });
  });

  // Handle Booking Form Submission
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const selectedServices = Array.from(document.querySelectorAll('input[name="services"]:checked')).map(cb => cb.value);
      const selectedStylist = (document.querySelector('input[name="stylist"]:checked') || {}).value || 'Any Available Senior Stylist';
      const dateVal = document.getElementById('booking-date').value;
      const timeVal = document.getElementById('booking-time').value;
      const nameVal = document.getElementById('guest-name').value.trim();
      const phoneVal = document.getElementById('guest-phone').value.trim();
      const notesVal = (document.getElementById('guest-notes') || {}).value || '';

      const appointment = {
        id: 'LON-' + Date.now().toString().slice(-5),
        name: nameVal,
        phone: phoneVal,
        services: selectedServices,
        stylist: selectedStylist,
        date: dateVal,
        time: timeVal,
        notes: notesVal,
        status: 'Confirmed',
        timestamp: new Date().toISOString()
      };

      // Save to localStorage for staff portal
      try {
        const stored = JSON.parse(localStorage.getItem('london_salon_appointments') || '[]');
        stored.unshift(appointment);
        localStorage.setItem('london_salon_appointments', JSON.stringify(stored));
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }

      // Display Confirmation
      document.getElementById('conf-name').textContent = nameVal;
      const summaryBox = document.getElementById('conf-summary');
      if (summaryBox) {
        summaryBox.innerHTML = `
          <div class="conf-row"><span class="conf-label">Booking ID:</span><span class="conf-val">${appointment.id}</span></div>
          <div class="conf-row"><span class="conf-label">Service(s):</span><span class="conf-val">${selectedServices.join(', ')}</span></div>
          <div class="conf-row"><span class="conf-label">Senior Stylist:</span><span class="conf-val">${selectedStylist}</span></div>
          <div class="conf-row"><span class="conf-label">Date & Time:</span><span class="conf-val">${dateVal} at ${timeVal}</span></div>
          <div class="conf-row"><span class="conf-label">Location:</span><span class="conf-val">The London Salon, 2nd Floor, Court Rd, Anantapur</span></div>
        `;
      }

      // Generate WhatsApp Direct Chat Link
      const waBtn = document.getElementById('btn-whatsapp-conf');
      if (waBtn) {
        const msg = encodeURIComponent(
          `*The London Salon Appointment Request*\n` +
          `Booking ID: ${appointment.id}\n` +
          `Guest Name: ${nameVal}\n` +
          `Phone: ${phoneVal}\n` +
          `Services: ${selectedServices.join(', ')}\n` +
          `Stylist: ${selectedStylist}\n` +
          `Date: ${dateVal} at ${timeVal}\n` +
          `Notes: ${notesVal || 'None'}`
        );
        waBtn.href = `https://wa.me/918171717579?text=${msg}`;
      }

      goToStep(5);
    });

    const btnAnother = document.getElementById('btn-book-another');
    if (btnAnother) {
      btnAnother.addEventListener('click', () => {
        bookingForm.reset();
        goToStep(1);
      });
    }
  }

  // 11. MOBILE MENU TOGGLE
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenuWrap = document.querySelector('.nav-menu-wrap');
  if (mobileToggle && navMenuWrap) {
    mobileToggle.addEventListener('click', () => {
      navMenuWrap.classList.toggle('mobile-open');
    });
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenuWrap.classList.remove('mobile-open');
      });
    });
  }

})();
