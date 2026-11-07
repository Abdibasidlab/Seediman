import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import type { SceneCue } from '../data/lessonTypes';
import { SHOTS, buildProvision } from './provisionProps';
import { GROWTH_SHOT, buildControl } from './controlProps';
import { TOWN_SHOTS, buildWorship } from './worshipProps';
import { CITY_SHOT, HOUSE_LOW_SHOT, HOUSE_SHOT, buildIslam } from './islamProps';

export interface DawnHandle {
  /** one gentle pulse of the light */
  pulse(): void;
  /** parallax nudge toward a tap, in client coordinates */
  nudge(clientX: number, clientY: number): void;
  /** one small light rises from the meal and comes to rest in the sky (Level 3) */
  release(): void;
}

/** Everything the scene can show; lessons pass a SceneCue and anything unset stays at these defaults. */
const DEFAULTS: Required<SceneCue> = {
  glow: 0.22, settled: false, lift: 0, land: 0, wide: false, tree: 0, birds: false, animal: false,
  shot: 'wide', meal: false, wheat: false, rain: false, rising: 0, settleLights: false,
  time: 'dawn', lapse: 'none', growth: false, storm: false, city: false,
  town: false, worship: 0, windows: 0,
  house: false, pillars: 0, pillarsLit: 0, roof: 0, parts: 0, messengers: 0, trail: 0, marks: 0, trailFull: false,
};

// deterministic noise so the landscape is the same every visit
function rng(seed: number) { return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646; }

function ridge(width: number, base: number, amp: number, valley: number, seed: number, detail = 60) {
  const r = rng(seed);
  const phases = [r() * 6, r() * 6, r() * 6];
  const s = new THREE.Shape();
  s.moveTo(-width / 2, -40);
  for (let i = 0; i <= detail; i++) {
    const x = -width / 2 + (width * i) / detail;
    let y = base + amp * (0.55 * Math.sin(x * 0.09 + phases[0]) + 0.3 * Math.sin(x * 0.23 + phases[1]) + 0.15 * Math.sin(x * 0.61 + phases[2]));
    y -= valley * Math.exp(-(x * x) / 40); // a soft valley at the centre where the light rests
    y += (r() - 0.5) * amp * 0.08;
    s.lineTo(x, y);
  }
  s.lineTo(width / 2, -40);
  s.closePath();
  return new THREE.ShapeGeometry(s);
}

function glowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, 'rgba(255,252,238,1)');
  grd.addColorStop(0.12, 'rgba(255,240,200,.95)');
  grd.addColorStop(0.3, 'rgba(240,205,140,.45)');
  grd.addColorStop(0.6, 'rgba(217,180,120,.12)');
  grd.addColorStop(1, 'rgba(217,196,143,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const SKY_VERT = `varying vec3 vPos; void main(){ vPos = (modelMatrix * vec4(position,1.0)).xyz; gl_Position = projectionMatrix * viewMatrix * vec4(vPos,1.0); }`;
const SKY_FRAG = `
varying vec3 vPos; uniform float uGlow; uniform vec2 uSun; uniform float uPulse; uniform float uNight; uniform float uDay;
void main(){
  float gg = min(uGlow, 1.0);            // sky colour stops at full dawn…
  float h = clamp((vPos.y + 2.0) / 52.0, 0.0, 1.0);
  vec3 top = mix(vec3(0.035,0.10,0.105), vec3(0.09,0.22,0.23), gg);
  vec3 mid = mix(vec3(0.17,0.29,0.33), vec3(0.36,0.47,0.47), gg);
  vec3 hor = mix(vec3(0.70,0.55,0.44), vec3(0.97,0.83,0.60), gg);
  vec3 col = mix(hor, mid, smoothstep(0.0, 0.22, h));
  col = mix(col, top, smoothstep(0.2, 0.95, h));
  float d = length((vPos.xy - uSun) * vec2(0.55, 1.0));
  // …but the light itself keeps radiating further as uGlow grows past 1
  col += vec3(1.0, 0.82, 0.52) * (0.18 + 0.45 * uGlow + 0.25 * uPulse) * exp(-d * max(0.05, 0.16 - 0.05 * uGlow));
  // night: a deep blue sky, a little lighter near the horizon
  vec3 nightCol = mix(vec3(0.07, 0.10, 0.17), vec3(0.015, 0.03, 0.07), smoothstep(0.0, 0.7, h));
  col = mix(col, nightCol, uNight);
  // full day (Level 4 time lapse): a clear blue sky, paler at the horizon
  vec3 dayCol = mix(vec3(0.86, 0.90, 0.86), vec3(0.42, 0.63, 0.78), smoothstep(0.0, 0.8, h));
  col = mix(col, dayCol, uDay * 0.9);
  gl_FragColor = vec4(col, 1.0);
}`;

interface Props { scene: SceneCue }

export const DawnScene = forwardRef<DawnHandle, Props>(function DawnScene({ scene }, ref) {
  const host = useRef<HTMLDivElement>(null);
  const target = { ...DEFAULTS, ...scene };
  const api = useRef({ t: target, pulse: 0, tx: 0, ty: 0, release: () => {}, timeOn: false });
  api.current.t = target;
  // Level 4 drives the time of day; earlier levels keep their fixed dawn light
  api.current.timeOn = scene.time !== undefined || (scene.lapse !== undefined && scene.lapse !== 'none');

  useImperativeHandle(ref, () => ({
    pulse() { api.current.pulse = 1; },
    release() { api.current.release(); },
    nudge(cx, cy) {
      const el = host.current; if (!el) return;
      const r = el.getBoundingClientRect();
      api.current.tx = ((cx - r.left) / r.width - 0.5) * 2;
      api.current.ty = ((cy - r.top) / r.height - 0.5) * 2;
    },
  }), []);

  useEffect(() => {
    const el = host.current!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';

    const world = new THREE.Scene();
    const hazeA = new THREE.Color('#6f7a74'), hazeB = new THREE.Color('#d8c29a'), hazeLit = new THREE.Color('#c9d6c4');
    world.fog = new THREE.Fog(hazeA.clone(), 14, 95);
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 300);
    const look = new THREE.Vector3(0, 6, -40);
    camera.position.set(0, 1.2, 10);

    // sky
    const skyU = { uGlow: { value: api.current.t.glow }, uSun: { value: new THREE.Vector2(0, 1.5) }, uPulse: { value: 0 }, uNight: { value: 0 }, uDay: { value: 0 } };
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(420, 220), new THREE.ShaderMaterial({ vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, uniforms: skyU, fog: false, depthWrite: false }));
    sky.position.set(0, 60, -90); world.add(sky);

    // stars
    const starGeo = new THREE.BufferGeometry(); const sp: number[] = []; const sr = rng(7);
    for (let i = 0; i < 140; i++) sp.push((sr() - 0.5) * 180, 14 + sr() * 70, -85);
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
    const starMat = new THREE.PointsMaterial({ color: '#fdf6e0', size: 0.35, transparent: true, opacity: 0.7, fog: false, depthWrite: false });
    world.add(new THREE.Points(starGeo, starMat));

    // the light
    const tex = glowTexture();
    const mkSprite = (op: number) => new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    const core = mkSprite(1), halo = mkSprite(0.45);
    core.position.set(0, 1.25, -52); halo.position.set(0, 1.25, -53);
    world.add(halo, core);

    // a crescent moon for the night of Level 4's day
    const moonTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d')!;
      g.fillStyle = '#fff4d6'; g.beginPath(); g.arc(64, 64, 40, 0, Math.PI * 2); g.fill();
      g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(82, 54, 36, 0, Math.PI * 2); g.fill();
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
    const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: moonTex, transparent: true, opacity: 0, depthWrite: false, fog: false }));
    moon.scale.setScalar(3.2); world.add(moon);

    // mountains, far → near. Each has a dawn silhouette colour and a fully lit colour (Level 2 switches the world on).
    const layers = [
      { z: -46, base: 3.2, amp: 3.6, valley: 3.0, dark: '#3f5f5a', lit: '#8aa597', seed: 11 },
      { z: -34, base: 1.6, amp: 2.6, valley: 1.6, dark: '#294a43', lit: '#5f8c6c', seed: 23 },
      { z: -24, base: 0.2, amp: 1.8, valley: 0.9, dark: '#1a3931', lit: '#4a7d55', seed: 41 },
    ];
    const tinted: { mat: THREE.MeshBasicMaterial; dark: THREE.Color; lit: THREE.Color; warm: number }[] = [];
    const tint = (mat: THREE.MeshBasicMaterial, dark: string, lit: string, warm = 0) => { tinted.push({ mat, dark: new THREE.Color(dark), lit: new THREE.Color(lit), warm }); return mat; };
    layers.forEach((l, i) => {
      const mesh = new THREE.Mesh(ridge(160, l.base, l.amp, l.valley, l.seed), tint(new THREE.MeshBasicMaterial({ color: l.dark }), l.dark, l.lit, 0.35 - i * 0.1));
      mesh.position.z = l.z; world.add(mesh);
    });

    // near hill with distant trees
    const hillZ = -13;
    const hillY = (x: number) => -1.3 + 0.55 * Math.sin(x * 0.18 + 1.2) + 0.25 * Math.sin(x * 0.47);
    const hs = new THREE.Shape(); hs.moveTo(-60, -30);
    for (let x = -60; x <= 60; x += 1) hs.lineTo(x, hillY(x));
    hs.lineTo(60, -30); hs.closePath();
    const hill = new THREE.Mesh(new THREE.ShapeGeometry(hs), tint(new THREE.MeshBasicMaterial({ color: '#10291f' }), '#10291f', '#3d7348'));
    hill.position.z = hillZ; world.add(hill);

    const tr = rng(99);
    const coneGeo = new THREE.ConeGeometry(1, 1, 7); coneGeo.translate(0, 0.5, 0);
    const roundGeo = new THREE.IcosahedronGeometry(1, 1);
    const treeMat = tint(new THREE.MeshBasicMaterial({ color: '#0d2620' }), '#0d2620', '#2c5e3a');
    const cones = new THREE.InstancedMesh(coneGeo, treeMat, 46), rounds = new THREE.InstancedMesh(roundGeo, treeMat, 22);
    const mtx = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3();
    let ci = 0, ri = 0;
    for (let i = 0; i < 68; i++) {
      let x = (tr() - 0.5) * 70;
      if (Math.abs(x) < 3.2) x += Math.sign(x || 1) * 3.2; // keep the centre open toward the light
      const z = hillZ - 0.3 - tr() * 2.5, y = hillY(x) - 0.15;
      if (tr() < 0.68 && ci < 46) {
        const h = 1.2 + tr() * 1.6, w = 0.35 + tr() * 0.3;
        mtx.compose(v.set(x, y, z), q, s.set(w, h, w)); cones.setMatrixAt(ci++, mtx);
      } else if (ri < 22) {
        const r0 = 0.45 + tr() * 0.4;
        mtx.compose(v.set(x, y + r0 * 0.9, z), q, s.set(r0, r0 * 1.1, r0)); rounds.setMatrixAt(ri++, mtx);
      }
    }
    cones.count = ci; rounds.count = ri;
    world.add(cones, rounds);

    // foreground rise
    const fg = new THREE.Shape(); fg.moveTo(-40, -30);
    for (let x = -40; x <= 40; x += 1) fg.lineTo(x, -2.6 + 0.4 * Math.sin(x * 0.25 + 0.5) + (Math.abs(x) > 4 ? 0.02 * x * x : 0));
    fg.lineTo(40, -30); fg.closePath();
    const fgMesh = new THREE.Mesh(new THREE.ShapeGeometry(fg), tint(new THREE.MeshBasicMaterial({ color: '#0a1f18' }), '#0a1f18', '#2f5d34'));
    fgMesh.position.z = -5; world.add(fgMesh);

    // ---- Level 3: meal, wheat, rain and rising lights ----
    const prov = buildProvision(world, new THREE.Color('#3a6b43'));
    const ctrl = buildControl(world);
    const wor = buildWorship(world, tex, hillY);
    const isl = buildIslam(world, tex);
    let tod = 0.27, lapseLeft = 0, lastLapse = 'none', lapseWait = 0;
    api.current.release = prov.release;
    const camPos = new THREE.Vector3(), camLook = new THREE.Vector3(), wantPos = new THREE.Vector3(), wantLook = new THREE.Vector3();
    let camInit = false;

    // ---- Level 2: a hero tree that appears, then gains detail ----
    const trunkMat = tint(new THREE.MeshBasicMaterial({ color: '#1c1712' }), '#1c1712', '#5a4630');
    const leafMat = tint(new THREE.MeshBasicMaterial({ color: '#12302a' }), '#12302a', '#3f7f4c');
    const leafMat2 = tint(new THREE.MeshBasicMaterial({ color: '#16392f' }), '#16392f', '#5b9a5c');
    const tree = new THREE.Group(); tree.position.set(-3.4, -2.35, -8); world.add(tree);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.16, 1.7, 7), trunkMat); trunk.position.y = 0.85; tree.add(trunk);
    const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.07, 0.8, 5), trunkMat); branch.position.set(0.25, 1.35, 0); branch.rotation.z = -0.7; tree.add(branch);
    const blob = (x: number, y: number, r: number, m: THREE.Material, parent: THREE.Object3D) => { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), m); b.position.set(x, y, 0); parent.add(b); return b; };
    [[0, 2.0, 0.75], [-0.45, 1.75, 0.5], [0.5, 1.8, 0.55]].forEach(([x, y, r]) => blob(x, y, r, leafMat, tree));
    const detail = new THREE.Group(); tree.add(detail); // stage 2: fuller canopy and blossoms of light
    [[0.15, 2.55, 0.5], [-0.75, 2.1, 0.38], [0.85, 2.25, 0.4], [-0.25, 1.45, 0.38]].forEach(([x, y, r]) => blob(x, y, r, leafMat2, detail));
    const blossomGeo = new THREE.BufferGeometry(); const bp: number[] = []; const br = rng(31);
    for (let i = 0; i < 26; i++) { const a = br() * Math.PI * 2, rr = 0.4 + br() * 0.7; bp.push(Math.cos(a) * rr, 2.0 + Math.sin(a) * rr * 0.8, 0.5 + br() * 0.3); }
    blossomGeo.setAttribute('position', new THREE.Float32BufferAttribute(bp, 3));
    const blossomMat = new THREE.PointsMaterial({ color: '#f3dca4', size: 0.11, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    detail.add(new THREE.Points(blossomGeo, blossomMat));
    tree.scale.setScalar(0.001); detail.scale.setScalar(0.001);

    // ---- birds crossing the sky ----
    const birdShape = new THREE.Shape(); birdShape.moveTo(-0.5, 0.16); birdShape.lineTo(0, 0); birdShape.lineTo(0.5, 0.16); birdShape.lineTo(0, 0.06); birdShape.closePath();
    const birdGeo = new THREE.ShapeGeometry(birdShape);
    const birdMat = new THREE.MeshBasicMaterial({ color: '#18302a', transparent: true, opacity: 0, fog: false, side: THREE.DoubleSide });
    const birds = [0, 1, 2, 3].map(i => { const b = new THREE.Mesh(birdGeo, birdMat); b.userData = { off: i * 1.6, y: 6.5 + (i % 2) * 0.9 + i * 0.25, sc: 0.55 - i * 0.06 }; world.add(b); return b; });

    // ---- a distant grazing animal ----
    const animalMat = tint(new THREE.MeshBasicMaterial({ color: '#0c231c', transparent: true, opacity: 0 }), '#0c231c', '#2b4f33');
    const animal = new THREE.Group(); const ax = -8.6; animal.position.set(ax, hillY(ax) - 0.02, hillZ + 0.2); world.add(animal);
    const part = (w: number, h: number, x: number, y: number, rz = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.12), animalMat); m.position.set(x, y, 0); m.rotation.z = rz; animal.add(m); };
    part(0.62, 0.24, 0, 0.42); part(0.07, 0.3, -0.22, 0.17); part(0.07, 0.3, -0.12, 0.17); part(0.07, 0.3, 0.13, 0.17); part(0.07, 0.3, 0.24, 0.17);
    part(0.09, 0.32, -0.36, 0.33, 0.9); part(0.18, 0.11, -0.47, 0.18, 0.4); part(0.12, 0.05, 0.33, 0.47, -0.5);
    animal.scale.setScalar(0.9);

    // drifting motes of light
    const MOTES = 36; const mp = new Float32Array(MOTES * 3); const mr = rng(5); const speeds: number[] = [];
    for (let i = 0; i < MOTES; i++) { mp[i * 3] = (mr() - 0.5) * 16; mp[i * 3 + 1] = -1 + mr() * 9; mp[i * 3 + 2] = -8 - mr() * 16; speeds.push(0.12 + mr() * 0.25); }
    const moteGeo = new THREE.BufferGeometry(); moteGeo.setAttribute('position', new THREE.BufferAttribute(mp, 3));
    const moteMat = new THREE.PointsMaterial({ color: '#f3dca4', size: 0.09, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    world.add(new THREE.Points(moteGeo, moteMat));

    const resize = () => {
      const w = el.clientWidth || 1, h = el.clientHeight || 1;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize); ro.observe(el); resize();

    // every value eases toward its target so changes between beats feel like the world waking, not switching
    const cur = { glow: api.current.t.glow, lift: api.current.t.lift, land: api.current.t.land, wide: api.current.t.wide ? 1 : 0, tree: api.current.t.tree, detail: api.current.t.tree === 2 ? 1 : 0, birds: api.current.t.birds ? 1 : 0, animal: api.current.t.animal ? 1 : 0 };
    const ease = (k: keyof typeof cur, to: number, rate: number, dt: number) => { cur[k] += (to - cur[k]) * Math.min(1, dt * rate); };
    let raf = 0, last = performance.now(), t = 0;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
      const A = api.current, T = A.t;
      ease('glow', T.glow, 0.8, dt); ease('lift', T.lift, 0.7, dt); ease('land', T.land, 0.6, dt); ease('wide', T.wide ? 1 : 0, 0.6, dt);
      ease('tree', T.tree > 0 ? 1 : 0, 1.2, dt); ease('detail', T.tree === 2 ? 1 : 0, 1.0, dt);
      ease('birds', T.birds ? 1 : 0, 0.8, dt); ease('animal', T.animal ? 1 : 0, 0.8, dt);
      A.pulse = Math.max(0, A.pulse - dt * 0.9);
      const p = A.pulse > 0 ? Math.sin(Math.min(1, A.pulse) * Math.PI) ** 2 : 0;
      const breathe = T.settled || reduce ? 0 : Math.sin(t * 1.1) * 0.05;
      // Level 4: time of day. The sun rises in the east (left), crosses the sky and sets in the west (right).
      let night = 0, sx = 0, sy = 1.25 + cur.lift * 5.2;
      if (A.timeOn) {
        // a lapse, once started, always finishes: time never runs backwards
        if (T.lapse !== lastLapse) { lastLapse = T.lapse; if (T.lapse !== 'none') { lapseLeft = 1; lapseWait = 2.4; } } // start once the scene has faded in
        if (lapseWait > 0) lapseWait -= dt;
        else if (lapseLeft > 0) {
          const step = reduce ? 1 : dt / (T.lapse === 'day' ? 20 : 10);
          tod = (tod + step) % 1; lapseLeft -= step; if (lapseLeft <= 0) { lapseLeft = 0; tod = 0.27; }
        } else {
          const want = { dawn: 0.27, day: 0.4, dusk: 0.71, night: 0.02 }[T.time];
          // move forward to the wanted time (dusk to dawn passes through the night)
          let diff = ((want - tod) % 1 + 1) % 1; if (diff > 0.97) diff = 0;
          tod = (tod + diff * Math.min(1, dt * (reduce ? 10 : 0.5))) % 1;
        }
        const ang = (tod - 0.25) * Math.PI * 2, sn = Math.sin(ang);
        sx = -26 * Math.cos(ang); sy = 1.25 + 8.5 * sn; // a low arc, so the sun crosses below the narration
        night = 1 - Math.min(1, Math.max(0, (sn + 0.12) / 0.24));
        skyU.uDay.value = Math.min(1, Math.max(0, (sn - 0.15) / 0.45));
        moon.position.set(-sx * 0.8, Math.max(3, 1.25 - 11 * sn), -60);
      }
      (moon.material as THREE.SpriteMaterial).opacity = night;
      const g = cur.glow * (1 - night * 0.9);
      skyU.uNight.value = night;

      // the light, lifting into the sky when asked
      const ly = sy;
      core.position.set(sx, ly, -52); halo.position.set(sx, ly, -53);
      (core.material as THREE.SpriteMaterial).opacity = 1 - night;
      skyU.uGlow.value = g; skyU.uPulse.value = p; skyU.uSun.value.set(sx * 1.6, A.timeOn ? sy * 1.6 : 1.5 + cur.lift * 8.5);
      const size = 1.1 + g * 2.1;
      core.scale.setScalar(size * (1 + breathe + p * 0.35));
      halo.scale.setScalar(size * (4.2 + g * 2.5) * (1 + p * 0.5));
      (halo.material as THREE.SpriteMaterial).opacity = 0.32 + Math.min(g, 1.3) * 0.3 + p * 0.3;
      starMat.opacity = Math.max(0, 0.75 - g * 0.9, night * 0.9);

      // land: dawn silhouettes warming, then switching on to lit greens
      const gd = Math.min(g, 1);
      (world.fog as THREE.Fog).color.copy(hazeA).lerp(hazeB, gd).lerp(hazeLit, cur.land * 0.6);
      tinted.forEach(({ mat, dark, lit, warm }) => mat.color.copy(dark).lerp(lit, cur.land).lerp(hazeB, gd * warm * (1 - cur.land)).multiplyScalar(1 - night * 0.6));
      (world.fog as THREE.Fog).color.multiplyScalar(1 - night * 0.7);
      animalMat.opacity = cur.animal;

      // tree and its detail grow in
      tree.scale.setScalar(Math.max(0.001, cur.tree));
      detail.scale.setScalar(Math.max(0.001, cur.detail));
      blossomMat.opacity = cur.detail * (0.6 + 0.3 * Math.sin(t * 1.6));
      if (!reduce) tree.rotation.z = Math.sin(t * 0.7) * 0.012 * cur.tree;

      // birds glide left → right in a loose formation and loop
      birdMat.opacity = cur.birds * 0.9;
      birds.forEach(b => {
        const { off, y, sc } = b.userData as { off: number; y: number; sc: number };
        const span = 34, x = ((t * 1.5 + off * 3) % span) - span / 2;
        b.position.set(x + off * 0.4, y + Math.sin(t * 0.8 + off) * 0.25, -22);
        b.scale.set(sc, sc * (0.45 + 0.55 * Math.abs(Math.sin(t * 5 + off))), sc);
      });

      if (!reduce) for (let i = 0; i < MOTES; i++) {
        mp[i * 3 + 1] += speeds[i] * dt; mp[i * 3] += Math.sin(t * 0.6 + i) * 0.003;
        if (mp[i * 3 + 1] > 9) mp[i * 3 + 1] = -1;
      }
      moteGeo.attributes.position.needsUpdate = true;
      moteMat.opacity = 0.35 + gd * 0.35;

      ctrl.update({ growth: T.growth, storm: T.storm, city: T.city }, dt, t, night, reduce);
      wor.update({ town: T.town, worship: T.worship, windows: T.windows }, dt, t, Math.max(gd, cur.land * 0.8), night, reduce);
      isl.update({ house: T.house, pillars: T.pillars, pillarsLit: T.pillarsLit, roof: T.roof, parts: T.parts, messengers: T.messengers, trail: T.trail, marks: T.marks, trailFull: T.trailFull }, dt, t, Math.max(gd, cur.land * 0.8), night, reduce);
      prov.update({ meal: T.meal ? 1 : 0, wheat: T.wheat ? 1 : 0, rain: T.rain ? 1 : 0, rising: T.rising, settle: T.settleLights, ground: ctrl.showsGround() ? 1 : 0 }, dt, t, reduce);

      // camera: the wide view (widening to show more of the world) or one of Level 3's shots, eased between;
      // plus gentle parallax toward the last tap
      const aspect = camera.aspect, wideShot = T.shot === 'wide';
      const fov = wideShot ? (aspect < 0.8 ? 45 : 32) + cur.wide * 8 : (aspect < 0.8 ? 52 : 38);
      if (wideShot) { wantPos.set(0, 1.2, 10 + cur.wide * 1.5); wantLook.copy(look); }
      else { const sh = T.shot === 'growth' ? GROWTH_SHOT : T.shot === 'house' ? HOUSE_SHOT : T.shot === 'houseLow' ? HOUSE_LOW_SHOT : T.shot === 'city' ? CITY_SHOT : T.shot === 'sky' || T.shot === 'town' ? TOWN_SHOTS[T.shot] : SHOTS[T.shot as keyof typeof SHOTS]; wantPos.copy(sh.pos); wantLook.copy(sh.look); }
      if (!camInit) { camPos.copy(wantPos); camLook.copy(wantLook); camera.fov = fov; camInit = true; }
      const k = Math.min(1, dt * (reduce ? 6 : 0.9));
      camPos.lerp(wantPos, k); camLook.lerp(wantLook, k);
      camera.fov += (fov - camera.fov) * k; camera.updateProjectionMatrix();
      const par = wideShot ? 1 : 0.25;
      camera.position.set(camPos.x + A.tx * 0.9 * par, camPos.y - A.ty * 0.35 * par, camPos.z);
      A.tx *= 1 - dt * 0.25; A.ty *= 1 - dt * 0.25;
      camera.lookAt(camLook);

      renderer.render(world, camera);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    const vis = () => { cancelAnimationFrame(raf); if (!document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    document.addEventListener('visibilitychange', vis);

    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); document.removeEventListener('visibilitychange', vis);
      world.traverse(o => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach(x => x.dispose());
      });
      tex.dispose(); moonTex.dispose(); prov.dispose(); renderer.dispose(); renderer.domElement.remove();
    };
  }, []);

  return <div ref={host} style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#10241f' }} aria-hidden />;
});
