/* ==========================================================================
   hero3d.js — the WebGL scene behind the hero. Loaded lazily by js/app.js
   (dynamic import) only when WebGL is available. Enhancement only: the hero
   already shows a still render of this same scene (assets/hero-still-*.webp)
   before this file runs, and keeps showing it if anything here fails.

   What it draws: an abstract "growth landscape": a field of rounded columns
   that rises from left to right and breathes slowly over time, a gold line
   threaded across it, and a spark that runs along the line every few
   seconds. The camera drifts slowly and follows the pointer and scroll. It is decoration, not data; no
   numbers are attached to it, and it is aria-hidden.

   Performance rules:
     * one instanced mesh for all columns (a single draw call), one shadow map
     * devicePixelRatio capped (2 desktop, 1.75 small screens)
     * the loop runs only while the hero is on screen and the tab is visible
     * reduced motion: one settled frame is rendered, no loop
   ========================================================================== */
import {
  WebGLRenderer, Scene, PerspectiveCamera, Color, Fog,
  HemisphereLight, DirectionalLight, InstancedMesh, MeshStandardMaterial,
  Object3D, PlaneGeometry, ShadowMaterial, Mesh, CatmullRomCurve3, Vector3,
  TubeGeometry, SphereGeometry, PCFShadowMap, SRGBColorSpace,
  RoundedBoxGeometry
} from './vendor/three.subset.min.js';

const WHITE = 0xffffff;

/* Palette: the site's greens, plus the gold accent. */
const LOW  = new Color('#DCEFE6');
const MID  = new Color('#2F8A66');
const HIGH = new Color('#0B5540');
const GOLD = new Color('#C9952E');

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const hash = (i, j) => {
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

export function mount(stage, options) {
  const opts = Object.assign({ reduced: false, small: false }, options || {});
  const small = opts.small;

  /* ------------------------------------------------------------ renderer */
  const renderer = new WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.75 : 2));
  renderer.setClearColor(WHITE, 1);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;

  const canvas = renderer.domElement;
  canvas.className = 'hero__canvas';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.setAttribute('role', 'presentation');

  /* --------------------------------------------------------------- scene */
  const scene = new Scene();
  scene.background = new Color(WHITE);
  scene.fog = new Fog(WHITE, 28, 58);

  const camera = new PerspectiveCamera(30, 1, 0.1, 120);

  scene.add(new HemisphereLight(0xffffff, 0xd9e6df, 1.55));

  const sun = new DirectionalLight(0xfff6e8, 2.1);
  sun.position.set(-9, 18, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  sun.shadow.camera.left = -18;
  sun.shadow.camera.right = 18;
  sun.shadow.camera.top = 14;
  sun.shadow.camera.bottom = -14;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 60;
  sun.shadow.bias = -0.0006;
  sun.shadow.radius = 4;
  scene.add(sun);

  const fill = new DirectionalLight(0xe6f2ec, 0.7);
  fill.position.set(14, 6, -6);
  scene.add(fill);

  /* ------------------------------------------------------------ the field */
  const COLS = small ? 16 : 22;
  const ROWS = small ? 9 : 12;
  const GAP = 1.0;
  const FOOT = 0.7;
  const COUNT = COLS * ROWS;

  const geo = new RoundedBoxGeometry(FOOT, 1, FOOT, 2, 0.09);
  geo.translate(0, 0.5, 0);                 // grow from the floor up

  const mat = new MeshStandardMaterial({ roughness: 0.42, metalness: 0.04 });
  const bars = new InstancedMesh(geo, mat, COUNT);
  bars.castShadow = true;
  bars.receiveShadow = true;
  scene.add(bars);

  const x0 = -((COLS - 1) * GAP) / 2;
  const z0 = -((ROWS - 1) * GAP) / 2;
  const seed = new Float32Array(COUNT);
  for (let j = 0; j < ROWS; j++) {
    for (let i = 0; i < COLS; i++) seed[j * COLS + i] = hash(i, j);
  }

  /* The landscape: rises left to right and toward the front, with a slow
     travelling swell. Purely decorative. */
  function heightAt(i, j, t) {
    const u = i / (COLS - 1);
    const v = j / (ROWS - 1);
    const trend = 0.18 + 5.2 * Math.pow(clamp(u * 0.85 + (1 - v) * 0.15, 0, 1), 2.2);
    const swell = (0.22 + 0.3 * u) * Math.sin(u * 6.5 - t * 0.6 + v * 2.4) * Math.cos(v * 3.1 + t * 0.4);
    const grain = (seed[j * COLS + i] - 0.5) * (0.3 + 0.6 * u);
    return Math.max(0.1, trend + swell + grain);
  }

  const floor = new Mesh(new PlaneGeometry(80, 80), new ShadowMaterial({ opacity: 0.10 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  /* ---------------------------------------------------------- gold line */
  const pts = [];
  for (let k = 0; k <= 12; k++) {
    const u = 0.32 + 0.68 * (k / 12);
    const i = u * (COLS - 1);
    const v = 0.55;                          // threads through the middle rows
    const y = 0.18 + 5.2 * Math.pow(u * 0.85 + (1 - v) * 0.15, 2.2) + 1.25 + 0.16 * Math.sin(k * 1.7);
    pts.push(new Vector3(x0 + i * GAP, y, z0 + v * (ROWS - 1) * GAP));
  }
  const curve = new CatmullRomCurve3(pts, false, 'centripetal');
  const tubeGeo = new TubeGeometry(curve, 200, small ? 0.1 : 0.085, 10, false);
  const goldMat = new MeshStandardMaterial({
    color: GOLD, emissive: GOLD, emissiveIntensity: 0.45, roughness: 0.28, metalness: 0.45,
    fog: false
  });
  const tube = new Mesh(tubeGeo, goldMat);
  tube.castShadow = true;
  scene.add(tube);

  const dot = new Mesh(new SphereGeometry(small ? 0.3 : 0.26, 32, 20), goldMat);
  dot.castShadow = true;
  dot.position.copy(curve.getPointAt(1));
  scene.add(dot);

  /* A small spark that runs along the line every few seconds. */
  const spark = new Mesh(new SphereGeometry(small ? 0.17 : 0.14, 20, 14), goldMat);
  spark.visible = false;
  scene.add(spark);

  /* -------------------------------------------------------------- camera */
  const target = small ? new Vector3(2.6, 2.0, 0.5) : new Vector3(4.0, 0.9, 0.5);
  const view = { az: 0, el: 0, r: 0 };
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let scrollP = 0;

  let drift = 0;                              // slow, endless orbit
  function frameCamera() {
    const aspect = camera.aspect;
    // Wider stage → camera can come closer; narrow → step back.
    const base = (small ? 31 : 35) + (aspect < 1.15 ? (1.15 - aspect) * 20 : 0);
    const az = 0.5 + Math.sin(drift * 0.16) * 0.07 + pointer.x * 0.1 + scrollP * 0.2;
    const el = 0.36 + pointer.y * 0.05 + scrollP * 0.18;
    const r = base * (1 - scrollP * 0.12);
    view.az = az; view.el = el; view.r = r;
    camera.position.set(
      target.x + r * Math.cos(el) * Math.sin(az),
      target.y + r * Math.sin(el),
      target.z + r * Math.cos(el) * Math.cos(az)
    );
    camera.lookAt(target);
  }

  /* -------------------------------------------------------------- update */
  const tmp = new Object3D();
  const col = new Color();

  function update(t, introT) {
    for (let j = 0; j < ROWS; j++) {
      for (let i = 0; i < COLS; i++) {
        const n = j * COLS + i;
        const h = heightAt(i, j, t) * (1 + scrollP * 0.22);
        tmp.position.set(x0 + i * GAP, 0, z0 + j * GAP);
        tmp.scale.set(1, h, 1);
        tmp.updateMatrix();
        bars.setMatrixAt(n, tmp.matrix);

        const q = clamp(h / 5.0, 0, 1);
        if (q < 0.5) col.copy(LOW).lerp(MID, q * 2);
        else col.copy(MID).lerp(HIGH, (q - 0.5) * 2);
        bars.setColorAt(n, col);
      }
    }
    bars.instanceMatrix.needsUpdate = true;
    if (bars.instanceColor) bars.instanceColor.needsUpdate = true;

    // Spark: travels the line in 2.6s, rests 3.4s, repeats.
    const cycle = (introT % 6.0) / 2.6;
    spark.visible = !opts.reduced && cycle < 1;
    if (spark.visible) {
      spark.position.copy(curve.getPointAt(easeOut(cycle) * 0.999));
      const s = Math.sin(Math.PI * cycle);
      spark.scale.setScalar(0.4 + 0.8 * s);
    }
    goldMat.emissiveIntensity = 0.42 + 0.14 * Math.sin(t * 2.0);
  }

  /* --------------------------------------------------------------- sizing */
  function resize() {
    const w = stage.clientWidth || 1;
    const h = stage.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  /* ---------------------------------------------------------------- loop */
  let running = false;
  let onScreen = true;
  let raf = 0;
  let first = true;
  const t0 = performance.now();

  function render(now) {
    // The live scene starts on exactly the frame of the still render
    // (scene time 2.0, no drift), so the crossfade from still to live is
    // seamless; from there it simply keeps moving.
    const elapsed = Math.max(0, (now - t0) / 1000);
    const t = 2.0 + (opts.reduced ? 0 : elapsed);
    const introT = elapsed;
    drift = opts.reduced ? 0 : elapsed;
    pointer.x += (pointer.tx - pointer.x) * 0.06;     // inertia
    pointer.y += (pointer.ty - pointer.y) * 0.06;
    frameCamera();
    update(t, introT);
    renderer.render(scene, camera);
    if (first) {
      first = false;
      stage.classList.add('is-live');
    }
  }

  function loop(now) {
    raf = 0;
    if (!running) return;
    render(now);
    raf = requestAnimationFrame(loop);
  }

  function start() {
    if (opts.reduced) { render(performance.now()); return; }
    if (running || !onScreen || document.hidden) return;
    running = true;
    raf = requestAnimationFrame(loop);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  stage.appendChild(canvas);
  resize();

  const ro = new ResizeObserver(() => { resize(); if (!running) render(performance.now()); });
  ro.observe(stage);

  const io = new IntersectionObserver((entries) => {
    onScreen = entries[0].isIntersecting;
    if (onScreen) start(); else stop();
  });
  io.observe(stage);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else start();
  });

  /* Pointer (desktop) and scroll (all) feed the camera. */
  if (!opts.reduced) {
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
    const onScroll = () => {
      const h = stage.getBoundingClientRect();
      scrollP = clamp(-h.top / Math.max(1, h.height), 0, 1);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  start();

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    stop();
    stage.classList.remove('is-live');      // the still render shows again
  });

  return {
    /* Used by the screenshot tooling to produce assets/hero-still-*.webp. */
    snapshot(settled) {
      if (settled) { opts.reduced = true; }
      render(performance.now());
      return canvas.toDataURL('image/png');
    },
    stop
  };
}
