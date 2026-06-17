(function () {
  'use strict';

  /* ============================================================
     ORRION — Chunk 1 JavaScript
     Three.js Intro · Hero Target · Navbar · Sticky Bar
     ============================================================ */

  const introOverlay = document.getElementById('intro-overlay');
  const skipBtn = document.getElementById('skip-btn');
  const site = document.getElementById('site');
  const introSeen = sessionStorage.getItem('orrion_intro_seen');

  // ---- Skip intro if already seen ----
  if (introSeen) {
    introOverlay.style.display = 'none';
    showSite();
  } else {
    playIntro();
  }

  // ============================================================
  //  SHOW SITE
  // ============================================================
  function showSite() {
    site.style.display = 'block';
    requestAnimationFrame(() => {
      site.style.transition = 'opacity 0.4s ease';
      site.style.opacity = '1';
    });
    initHeroTarget();
    initNavbar();
    initStickyBar();
    initHamburger();
  }

  // ============================================================
  //  THREE.JS CINEMATIC INTRO
  // ============================================================
  function playIntro() {
    if (typeof THREE === 'undefined') { skipIntro(); return; }

    const W = window.innerWidth, H = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x080809);
    introOverlay.insertBefore(renderer.domElement, skipBtn);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
    camera.position.set(0, 0, 5);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const dirLight = new THREE.DirectionalLight(0x4a7fd4, 0.8);
    dirLight.position.set(2, 4, 3);
    scene.add(dirLight);

    // ---- Materials ----
    const silverMat = new THREE.MeshStandardMaterial({ color: 0xE8E8E0, transparent: true, opacity: 0 });
    const headMat = new THREE.MeshStandardMaterial({ color: 0xE8E8E0, emissive: 0x2A5298, emissiveIntensity: 0.4, transparent: true, opacity: 0 });
    const fletchMat = new THREE.MeshStandardMaterial({ color: 0x2A5298, side: THREE.DoubleSide, transparent: true, opacity: 0 });
    const bowMat = new THREE.MeshStandardMaterial({ color: 0xC8C8C0, transparent: true, opacity: 0 });
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x2A5298, transparent: true, opacity: 0 });
    const crossMat = new THREE.MeshStandardMaterial({ color: 0x2A5298, transparent: true, opacity: 0.5 });

    // ---- Arrow Group ----
    const arrowGroup = new THREE.Group();
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.5, 8), silverMat);
    arrowGroup.add(shaft);
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.35, 8), headMat);
    head.position.y = 1.425;
    arrowGroup.add(head);
    for (let i = 0; i < 3; i++) {
      const f = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.25), fletchMat);
      f.position.y = -1.05;
      f.rotation.y = (i * Math.PI * 2) / 3;
      arrowGroup.add(f);
    }
    const tipLight = new THREE.PointLight(0x2A5298, 0.6, 2);
    tipLight.position.y = 1.425;
    arrowGroup.add(tipLight);
    arrowGroup.rotation.x = -Math.PI / 2; // Point along +Z (toward camera)
    arrowGroup.position.z = 1.25; // Tail at z=0 (nock point)
    scene.add(arrowGroup);

    // ---- Bow Group ----
    const bowGroup = new THREE.Group();
    const bowArc = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.018, 8, 40, Math.PI), bowMat);
    bowArc.rotation.x = Math.PI / 2;
    bowArc.rotation.z = -Math.PI / 2;
    bowGroup.add(bowArc);

    // Bowstring as line (top → nock → bottom)
    const stringPositions = new Float32Array([0, 0.9, 0, 0, 0, 0, 0, -0.9, 0]);
    const stringGeom = new THREE.BufferGeometry();
    stringGeom.setAttribute('position', new THREE.BufferAttribute(stringPositions, 3));
    const bowstring = new THREE.Line(stringGeom, new THREE.LineBasicMaterial({ color: 0x888880, transparent: true, opacity: 0 }));
    bowGroup.add(bowstring);
    scene.add(bowGroup);

    // ---- Target Group ----
    const targetGroup = new THREE.Group();
    targetGroup.add(new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.025, 8, 60), ringMat.clone()));
    targetGroup.add(new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.018, 8, 60), ringMat.clone()));
    const crossV = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 2.4, 4), crossMat.clone());
    const crossH = crossV.clone();
    crossH.rotation.z = Math.PI / 2;
    targetGroup.add(crossV);
    targetGroup.add(crossH);
    targetGroup.position.set(6, 0, 0); // Off-screen initially
    scene.add(targetGroup);

    // ---- Ghost Arrow for motion blur (Phase 3) ----
    const ghostGroup = arrowGroup.clone(true);
    ghostGroup.traverse(c => {
      if (c.material) { c.material = c.material.clone(); c.material.opacity = 0; }
    });
    ghostGroup.visible = false;
    scene.add(ghostGroup);

    // ---- Trail light for Phase 3 ----
    const trailLight = new THREE.PointLight(0x2A5298, 0, 3);
    scene.add(trailLight);

    // ---- Skip ----
    let introActive = true;
    setTimeout(() => skipBtn.classList.add('visible'), 1500);
    skipBtn.addEventListener('click', skipIntro);

    function skipIntro() {
      if (!introActive) return;
      introActive = false;
      introOverlay.style.opacity = '0';
      setTimeout(() => {
        introOverlay.style.display = 'none';
        cleanupIntro();
        showSite();
        sessionStorage.setItem('orrion_intro_seen', 'true');
      }, 300);
    }

    function cleanupIntro() {
      renderer.dispose();
      scene.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
    }

    // ---- Helper: set opacity for group ----
    function setGroupOpacity(group, val) {
      group.traverse(c => {
        if (c.material && c.material.transparent) c.material.opacity = val;
      });
    }

    // ---- Animation Loop ----
    const startTime = performance.now();
    function animate(now) {
      if (!introActive) return;
      const elapsed = (now - startTime) / 1000;

      if (elapsed < 2.5) {
        // PHASE 1 — Bow Draw
        const t = elapsed;
        const fadeIn = Math.min(t / 0.5, 1);
        setGroupOpacity(arrowGroup, fadeIn);
        setGroupOpacity(bowGroup, fadeIn);
        bowstring.material.opacity = fadeIn;

        // Pull bowstring nock point toward +Z
        const drawProgress = Math.max(0, (t - 0.3) / 2.0);
        const nockZ = Math.sin(Math.min(drawProgress, 1) * Math.PI / 2) * 0.3;
        stringPositions[5] = nockZ; // middle point z
        stringGeom.attributes.position.needsUpdate = true;
        arrowGroup.position.z = 1.25 + nockZ;

        // Camera zoom
        camera.position.z = 5 - (t / 2.5) * 0.4;

      } else if (elapsed < 3.0) {
        // PHASE 2 — Release
        const t2 = elapsed - 2.5;

        // Snap bowstring back
        stringPositions[5] = 0;
        stringGeom.attributes.position.needsUpdate = true;

        // Fade bow
        const bowFade = Math.max(0, 1 - t2 / 0.3);
        setGroupOpacity(bowGroup, bowFade);
        bowstring.material.opacity = bowFade;

        // Arrow accelerates toward camera
        const accel = t2 * t2 * 40;
        arrowGroup.position.z = 1.55 + accel;
        arrowGroup.scale.setScalar(1 + t2 * 2);

      } else if (elapsed < 4.5) {
        // PHASE 3 — Side Flight
        const t3 = elapsed - 3.0;
        const progress = t3 / 1.5;

        if (t3 < 0.01) {
          // Instant reposition
          camera.position.set(0, 0.3, 4);
          camera.lookAt(0, 0, 0);
          bowGroup.visible = false;
          arrowGroup.rotation.set(0, 0, 0);
          arrowGroup.rotation.x = -Math.PI / 2;
          arrowGroup.rotation.y = Math.PI / 2;
          arrowGroup.scale.setScalar(1);
          setGroupOpacity(arrowGroup, 1);
          ghostGroup.visible = true;

          // Target visible
          targetGroup.position.set(2.5, 0, 0);
          targetGroup.rotation.z = Math.PI / 2;
          setGroupOpacity(targetGroup, 1);
          targetGroup.traverse(c => {
            if (c.material && c.material.transparent) c.material.opacity = 0.8;
          });
          trailLight.intensity = 1.2;
        }

        // Ease: fast start, decelerate
        const ease = 1 - Math.pow(1 - progress, 2);
        const arrowX = -4 + ease * 8;
        arrowGroup.position.set(arrowX, 0, 0);

        // Camera shake
        camera.position.y = 0.3 + Math.sin(t3 * 40) * 0.004;

        // Ghost trail
        ghostGroup.position.set(arrowX - 0.3, 0, 0);
        ghostGroup.rotation.copy(arrowGroup.rotation);
        setGroupOpacity(ghostGroup, 0.25);

        // Trail light follows with delay
        trailLight.position.x += (arrowX - 0.4 - trailLight.position.x) * 0.1;

      } else if (elapsed < 5.5) {
        // PHASE 4 — Impact
        const t4 = elapsed - 4.5;

        if (t4 < 0.01) {
          arrowGroup.position.set(2.5, 0, 0);
          ghostGroup.visible = false;
          trailLight.intensity = 0;
        }

        // Target ripple
        if (t4 < 0.2) {
          const ripple = 1 + Math.sin((t4 / 0.2) * Math.PI) * 0.08;
          targetGroup.scale.setScalar(ripple);
        } else {
          targetGroup.scale.setScalar(1);
        }

        // Fade to black at t=5.0 (0.5s into phase 4)
        if (t4 >= 0.5) {
          const fadeOut = (t4 - 0.5) / 0.5;
          introOverlay.style.opacity = String(1 - fadeOut);
        }

      } else {
        // Complete
        introActive = false;
        introOverlay.style.display = 'none';
        cleanupIntro();
        sessionStorage.setItem('orrion_intro_seen', 'true');
        showSite();
        return;
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);

    // Handle resize during intro
    window.addEventListener('resize', () => {
      if (!introActive) return;
      const w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
  }

  // ============================================================
  //  HERO TARGET THREE.JS CANVAS
  // ============================================================
  function initHeroTarget() {
    if (typeof THREE === 'undefined') return;
    const canvas = document.getElementById('hero-target');
    if (!canvas) return;

    const parent = canvas.parentElement;
    const size = Math.min(parent.clientWidth, 460);
    canvas.width = size;
    canvas.height = size;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 50);
    camera.position.z = 3.5;

    scene.add(new THREE.AmbientLight(0xffffff, 0.2));
    const glow = new THREE.PointLight(0x1C3A5E, 1.5, 4);
    glow.position.set(0, 0, 1);
    scene.add(glow);

    const mat = new THREE.MeshStandardMaterial({ color: 0x2A5298, transparent: true, opacity: 0.85 });
    const outerRing = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.025, 8, 60), mat);
    const innerRing = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.018, 8, 60), mat.clone());
    const crossMat = new THREE.MeshStandardMaterial({ color: 0x2A5298, transparent: true, opacity: 0.45 });
    const cV = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 2.4, 4), crossMat);
    const cH = cV.clone();
    cH.rotation.z = Math.PI / 2;
    scene.add(outerRing, innerRing, cV, cH);

    function animateTarget() {
      const t = performance.now() * 0.001;
      outerRing.rotation.z += 0.003;
      innerRing.rotation.z -= 0.005;
      outerRing.scale.setScalar(1 + Math.sin(t * 1.2) * 0.015);
      renderer.render(scene, camera);
      requestAnimationFrame(animateTarget);
    }
    animateTarget();

    window.addEventListener('resize', () => {
      const s = Math.min(parent.clientWidth, 460);
      renderer.setSize(s, s);
    });
  }

  // ============================================================
  //  NAVBAR SCROLL
  // ============================================================
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  // ============================================================
  //  STICKY BOTTOM BAR
  // ============================================================
  function initStickyBar() {
    const bar = document.getElementById('stickyBar');
    if (!bar) return;
    window.addEventListener('scroll', () => {
      bar.classList.toggle('visible', window.scrollY > 300);
    }, { passive: true });
  }

  // ============================================================
  //  HAMBURGER MENU
  // ============================================================
  function initHamburger() {
    const btn = document.getElementById('hamburger');
    const nav = document.getElementById('mobileNav');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      nav.classList.toggle('open');
      document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
    });
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        btn.classList.remove('active');
        nav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

})();
