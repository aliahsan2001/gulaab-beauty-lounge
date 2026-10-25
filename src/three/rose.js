/* The rose. Petals sit on a golden-angle spiral, smallest inside. Each is a curved sheet reshaped
   on the CPU as it opens: tightly cupped and leaning in for the bud; in bloom the outer petals
   spread, their tips and edges roll back, while the centre stays furled the way a real rose does.
   A painted petal texture (veins, a pale heart, darker rims), soft self-shadowing, a light-through
   rim glow and a few dew drops do the rest. setBloom(b) opens rings from the outside in, so
   b = 1/3, 2/3 and 1 open three rings in turn. */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;
const rand = (s) => { const x = Math.sin(s * 127.1) * 43758.5453; return x - Math.floor(x); };

/* ---------- painted textures ---------- */
function petalTexture() {
  const S = 512, c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  // base to tip: a pale, slightly warm heart, then deep rose, then lighter, cooler edges
  const lin = g.createLinearGradient(0, S, 0, 0);
  lin.addColorStop(0, '#f3d9c4');
  lin.addColorStop(0.16, '#d97a8c');
  lin.addColorStop(0.45, '#c2425f');
  lin.addColorStop(0.8, '#d4607a');
  lin.addColorStop(1, '#e48a9c');
  g.fillStyle = lin;
  g.fillRect(0, 0, S, S);
  // darker, saturated rim along the sides
  const side = g.createLinearGradient(0, 0, S, 0);
  side.addColorStop(0, 'rgba(120,16,44,.45)');
  side.addColorStop(0.18, 'rgba(120,16,44,0)');
  side.addColorStop(0.82, 'rgba(120,16,44,0)');
  side.addColorStop(1, 'rgba(120,16,44,.45)');
  g.fillStyle = side;
  g.fillRect(0, 0, S, S);
  // fine veins fanning out from the base
  g.globalCompositeOperation = 'multiply';
  for (let i = 0; i < 46; i++) {
    const t = i / 45, x0 = S / 2 + (t - 0.5) * 30, x1 = t * S;
    g.strokeStyle = `rgba(150,40,70,${0.08 + rand(i) * 0.1})`;
    g.lineWidth = 0.8 + rand(i + 9) * 1.4;
    g.beginPath();
    g.moveTo(x0, S);
    g.bezierCurveTo(x0 + (x1 - x0) * 0.2, S * 0.6, x1 + (rand(i + 3) - 0.5) * 30, S * 0.3, x1, -10);
    g.stroke();
  }
  // soft mottling
  g.globalCompositeOperation = 'soft-light';
  for (let i = 0; i < 260; i++) {
    g.fillStyle = rand(i + 50) > 0.5 ? 'rgba(255,255,255,.06)' : 'rgba(80,0,20,.06)';
    g.beginPath();
    g.arc(rand(i + 70) * S, rand(i + 90) * S, 6 + rand(i + 110) * 30, 0, Math.PI * 2);
    g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function leafTexture() {
  const S = 256, c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  const lin = g.createLinearGradient(0, S, 0, 0);
  lin.addColorStop(0, '#2c4524');
  lin.addColorStop(1, '#55703f');
  g.fillStyle = lin;
  g.fillRect(0, 0, S, S);
  g.strokeStyle = 'rgba(190,210,150,.5)';
  g.lineWidth = 2.5;
  g.beginPath(); g.moveTo(S / 2, S); g.lineTo(S / 2, 0); g.stroke();
  g.lineWidth = 1.2;
  for (let i = 1; i < 9; i++) {
    const y = S - (i / 9) * S;
    g.strokeStyle = 'rgba(190,210,150,.28)';
    g.beginPath(); g.moveTo(S / 2, y); g.quadraticCurveTo(S * 0.3, y - 14, 0, y - 34); g.stroke();
    g.beginPath(); g.moveTo(S / 2, y); g.quadraticCurveTo(S * 0.7, y - 14, S, y - 34); g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// light coming through the petal at grazing angles: a soft rim glow in the petal's own colour
function addRim(mat, amount) {
  mat.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      float rimF = pow(1.0 - abs(dot(normalize(vViewPosition), normal)), 2.2);
      totalEmissiveRadiance += diffuseColor.rgb * rimF * ${amount.toFixed(2)};`);
  };
}

/* ---------- one petal (or leaf): a plane we bend whenever its openness changes ---------- */
function makePetal(spec, mat) {
  const [sx, sy] = spec.detail;
  const geo = new THREE.PlaneGeometry(1, 1, sx, sy);
  const base = geo.attributes.position.array.slice();
  // per-petal tint: inner petals deeper and darker, a little variation between neighbours
  const colors = new Float32Array(base.length);
  const tint = new THREE.Color();
  const shade = spec.leaf ? 1 : 0.62 + 0.38 * spec.t + (rand(spec.seed * 99) - 0.5) * 0.08;
  for (let i = 0; i < base.length; i += 3) {
    const v = base[i + 1] + 0.5;
    // the very base of each petal sits in shadow inside the flower
    const ao = spec.leaf ? 1 : mix(0.55, 1, smooth(0, 0.3, v));
    tint.setRGB(shade * ao, shade * ao * (spec.leaf ? 1 : 0.96), shade * ao * (spec.leaf ? 1 : 0.98));
    colors.set([tint.r, tint.g, tint.b], i);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = mesh.receiveShadow = !!spec.shadows;
  const pivot = new THREE.Group();
  pivot.add(mesh);
  pivot.position.set(Math.cos(spec.phi) * spec.r, spec.y, Math.sin(spec.phi) * spec.r);
  pivot.rotation.y = Math.PI / 2 - spec.phi; // local +z points away from the centre
  return { ...spec, geo, base, mesh, pivot, open: -1, drops: [] };
}

function shape(p, o) {
  const pos = p.geo.attributes.position.array, b = p.base;
  const width = p.width * mix(0.8, 1.1, o);
  // curvature across the petal: wrapped round the bud when closed, nearly flat when open
  const k = p.leaf ? 0 : mix(p.kC, 2 * p.cupO, o);
  // how far the tip leans in: enough to meet the axis in the bud; the centre keeps some in bloom
  const leanD = p.leaf ? 0 : (p.r + 0.55 / p.kC) * p.lean * (1 - o * p.unfurl);
  for (let i = 0; i < b.length; i += 3) {
    const u = b[i], v = b[i + 1] + 0.5;
    let wp;
    if (p.leaf) wp = Math.pow(Math.sin(Math.PI * v), 0.85) * (1 - 0.06 * Math.abs(Math.sin(v * Math.PI * 13))); // serrated
    else wp = v < 0.68 ? Math.pow(Math.sin((Math.PI / 2) * Math.max(0.03, v / 0.68)), 0.7) : Math.sqrt(Math.max(0.015, 1 - Math.pow((v - 0.68) / 0.32, 2)));
    const x0 = u * width * wp + p.asym * v * v * 0.06;
    const au = Math.abs(u) * 2 * wp; // distance from the midrib, 0..1, following the outline
    const y = v * p.len;
    let x = x0, z;
    if (p.leaf) z = -p.cupC * Math.abs(x0) * 0.5 + p.reflex * v * v * p.len;
    else {
      if (k > 0.05) { const th = x0 * k; x = Math.sin(th) / k; z = -(1 - Math.cos(th)) / k; } // bend round a cylinder
      else z = -0.5 * k * x0 * x0;
      z -= leanD * v * v;                                               // tips lean in
      z += (1 - o) * p.bulge * Math.sin(Math.PI * v);                   // the bud swells at the middle
      z += o * p.reflex * p.len * v * v * v;                            // tips roll back
      z += o * p.roll * Math.pow(au, 3) * smooth(0.35, 1, v) * p.len;   // edges roll outward
      z += p.ruffle * Math.sin(u * 11 + p.seed * 9) * v * v * (0.4 + o) * wp; // a soft wave on the rim
    }
    pos[i] = x; pos[i + 1] = y; pos[i + 2] = z;
  }
  p.geo.attributes.position.needsUpdate = true;
  p.geo.computeVertexNormals();
  p.mesh.rotation.x = mix(p.tiltC, p.tiltO, o);
  p.open = o;
  // dew drops ride on the petal surface
  p.drops.forEach((d) => {
    const q = d.vi * 3;
    d.mesh.position.set(pos[q], pos[q + 1], pos[q + 2] + 0.012);
  });
}

export function createRose({ simple = false } = {}) {
  const group = new THREE.Group();
  const petalMap = petalTexture();
  const petalMat = simple
    ? new THREE.MeshStandardMaterial({ map: petalMap, vertexColors: true, side: THREE.DoubleSide, roughness: 0.55 })
    : new THREE.MeshPhysicalMaterial({ map: petalMap, vertexColors: true, side: THREE.DoubleSide, roughness: 0.5, sheen: 1, sheenRoughness: 0.32, sheenColor: new THREE.Color('#ffc9d6'), clearcoat: 0.04 });
  addRim(petalMat, simple ? 0.25 : 0.42);
  const leafMat = new THREE.MeshStandardMaterial({ map: leafTexture(), vertexColors: true, side: THREE.DoubleSide, roughness: 0.62 });
  const greenMat = new THREE.MeshStandardMaterial({ color: '#334d2b', roughness: 0.6 });

  const N = simple ? 24 : 40;
  const detail = simple ? [8, 12] : [18, 26];
  const petals = [];
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1); // 0 inner .. 1 outer
    const p = makePetal({
      t, detail, seed: (i * 0.618) % 1, shadows: !simple,
      phi: i * GOLDEN,
      r: 0.012 + 0.085 * Math.sqrt(t),
      y: 0.035 * (1 - t),
      len: 0.3 + 0.66 * Math.pow(t, 0.85),
      width: 0.44 + 0.52 * t,
      kC: 1 / (0.07 + 0.16 * t), cupO: mix(3.2, 0.7, smooth(0.15, 1, t)), bulge: 0.02 + 0.05 * t,
      tiltC: 0.02, tiltO: 0.04 + 1.12 * Math.pow(t, 1.7),
      lean: mix(0.95, 0.8, t), unfurl: smooth(0.2, 0.8, t),
      reflex: 0.05 + 0.48 * Math.pow(t, 1.4), roll: 0.04 + 0.14 * Math.pow(t, 1.5),
      ruffle: 0.004 + 0.01 * t, asym: (rand(i + 5) - 0.5),
      start: (1 - t) * 0.62, // outer petals open first
    }, petalMat);
    group.add(p.pivot);
    petals.push(p);
  }

  // a few dew drops on the outer petals (full model only)
  if (!simple) {
    const dropMat = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.02, transmission: 1, thickness: 0.04, ior: 1.33, transparent: true, opacity: 0.9 });
    const dropGeo = new THREE.SphereGeometry(1, 16, 12);
    [N - 1, N - 3, N - 6, N - 9, N - 12].forEach((pi, k) => {
      const p = petals[pi];
      const [sx] = p.detail;
      const row = 12 + (k % 3) * 4, col = Math.round(sx * (0.35 + rand(k) * 0.3));
      const vi = row * (sx + 1) + col;
      const m = new THREE.Mesh(dropGeo, dropMat);
      const s = 0.012 + rand(k + 4) * 0.012;
      m.scale.set(s, s, s * 0.6);
      p.mesh.add(m);
      p.drops.push({ mesh: m, vi });
    });
  }

  // sepals curl down beneath the flower
  const sepals = [];
  for (let i = 0; i < 5; i++) {
    const s = makePetal({ leaf: true, t: 1, detail: [4, 10], seed: i / 5, phi: (i / 5) * Math.PI * 2 + 0.3, r: 0.07, y: -0.03, len: 0.5, width: 0.15, cupC: 1.4, cupO: 1.4, tiltC: 0.55, tiltO: 2.05, lean: 0, unfurl: 0, reflex: 0.3, roll: 0, ruffle: 0, asym: 0 }, leafMat);
    s.reshape = (o) => { if (Math.abs(o - s.open) > 0.002) { shape(s, 1); s.mesh.rotation.x = mix(s.tiltC, s.tiltO, o); s.open = o; } };
    s.reshape(0);
    sepals.push(s);
    group.add(s.pivot);
  }
  const hip = new THREE.Mesh(new THREE.SphereGeometry(0.11, 24, 16), greenMat);
  hip.scale.set(1, 0.9, 1);
  hip.position.y = -0.06;
  group.add(hip);
  const stemCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, -0.1, 0), new THREE.Vector3(0.03, -1, 0.02), new THREE.Vector3(0.12, -2.2, 0.06), new THREE.Vector3(0.08, -4.2, 0.1)]);
  group.add(new THREE.Mesh(new THREE.TubeGeometry(stemCurve, simple ? 24 : 64, 0.042, 10, false), greenMat));
  // thorns
  const thornGeo = new THREE.ConeGeometry(0.022, 0.09, 6);
  [0.18, 0.31, 0.47, 0.6].forEach((at, k) => {
    const pt = stemCurve.getPointAt(at), tan = stemCurve.getTangentAt(at);
    const th = new THREE.Mesh(thornGeo, greenMat);
    const side = new THREE.Vector3(Math.cos(k * 2.4), 0, Math.sin(k * 2.4));
    th.position.copy(pt).addScaledVector(side, 0.05);
    th.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), side.clone().addScaledVector(tan, 0.6).normalize());
    group.add(th);
  });
  // two leaves on short stalks
  [[-1.05, 0.5, 1.15], [-1.7, 3.6, 1.0]].forEach(([y, phi, tilt], k) => {
    const leaf = makePetal({ leaf: true, t: 1, detail: [8, 14], seed: 0.3 + k, phi, r: 0.05, y: 0, len: 0.72, width: 0.4, cupC: 0.8, cupO: 0.8, tiltC: tilt, tiltO: tilt, lean: 0, unfurl: 0, reflex: 0.18, roll: 0, ruffle: 0, asym: 0.4 }, leafMat);
    shape(leaf, 1);
    leaf.pivot.position.set(stemCurve.getPointAt(0.25 + k * 0.15).x, y, 0.02);
    leaf.mesh.castShadow = !simple;
    group.add(leaf.pivot);
  });

  function setBloom(b) {
    petals.forEach((p) => {
      const o = smooth(p.start, p.start + 0.38, b);
      if (Math.abs(o - p.open) > 0.0015) shape(p, o);
    });
    sepals.forEach((s) => s.reshape(smooth(0, 0.35, b)));
  }
  setBloom(0);
  return {
    group, setBloom,
    dispose: () => {
      petalMap.dispose(); leafMat.map?.dispose();
      group.traverse((o) => { o.geometry?.dispose(); [].concat(o.material || []).forEach((m) => m.dispose?.()); });
    },
  };
}

/* A small stage for the rose: a warm key light with soft shadows, a cool rim light behind it, a
   slow turn and gentle mouse parallax. bloom is eased toward its target every frame, so
   scroll-driven changes feel smooth. */
export function mountRose(canvas, { simple = false, bloom = 0, distance = 4.1, lookY = 0.25, offsetX = 0, dark = false } = {}) {
  const wrap = canvas.parentElement;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, simple ? 1.5 : 2));
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = dark ? 1.15 : 1.0;
  if (!simple) { renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; }
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = dark ? 0.18 : 0.3;
  scene.add(new THREE.HemisphereLight('#fff1ea', dark ? '#3a1520' : '#b06a7c', dark ? 0.35 : 0.65));
  const key = new THREE.DirectionalLight('#ffe9dc', dark ? 2.8 : 2.2);
  key.position.set(2.2, 3.6, 2.8);
  if (!simple) {
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = key.shadow.camera.bottom = -1.4;
    key.shadow.camera.right = key.shadow.camera.top = 1.4;
    key.shadow.camera.near = 1; key.shadow.camera.far = 9;
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.02;
    key.shadow.radius = 4;
  }
  scene.add(key);
  const rim = new THREE.DirectionalLight(dark ? '#ffd6e2' : '#ffc0d0', dark ? 2.4 : 1.2);
  rim.position.set(-2.5, 1.8, -2.6);
  scene.add(rim);
  const fill = new THREE.PointLight('#ff9fb4', dark ? 3 : 2, 8);
  fill.position.set(-1.5, -0.5, 2);
  scene.add(fill);

  const rose = createRose({ simple });
  rose.group.rotation.x = 0.32; // tilt the flower towards us
  scene.add(rose.group);
  key.target = rose.group;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 50);

  let target = bloom, current = bloom;
  rose.setBloom(bloom);

  function layout() {
    const w = wrap.clientWidth, h = wrap.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    kick();
  }

  const mouse = new THREE.Vector2(), sm = new THREE.Vector2();
  const onMove = (e) => mouse.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  addEventListener('pointermove', onMove, { passive: true });

  let raf = 0, last = performance.now(), visible = true, dead = false, time = 0;
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) kick(); });
  io.observe(wrap);
  function frame(now) {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); // rAF time can predate last
    last = now;
    time += dt;
    current += (target - current) * (1 - Math.pow(0.05, dt));
    if (Math.abs(target - current) < 0.0005) current = target;
    rose.setBloom(current);
    sm.lerp(mouse, 1 - Math.pow(0.04, dt));
    rose.group.rotation.y = time * 0.12 + sm.x * 0.3;
    rose.group.rotation.x = 0.3 - sm.y * 0.1 + current * 0.16 + Math.sin(time * 0.6) * 0.015;
    const d = distance * (1 + current * 0.16);
    camera.position.set(offsetX, lookY + 0.4, d);
    camera.lookAt(offsetX, lookY, 0);
    if (dead || renderer.getContext().isContextLost()) { raf = 0; return; } // context gone after a page change
    renderer.render(scene, camera);
    if (visible && !document.hidden && !dead) raf = requestAnimationFrame(frame);
    else raf = 0;
  }
  function kick() { if (!raf && !dead) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  const onVis = () => !document.hidden && kick();
  document.addEventListener('visibilitychange', onVis);

  const ro = new ResizeObserver(layout);
  ro.observe(wrap);
  layout();
  frame(performance.now());
  canvas.classList.add('is-ready');

  return {
    setBloom(b, instant = false) { target = b; if (instant) { current = b; rose.setBloom(b); } kick(); },
    get bloom() { return current; },
    scene, camera, rose,
    dispose() {
      dead = true;
      cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect();
      removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVis);
      rose.dispose();
      scene.environment?.dispose(); pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
