// Level 3 additions to the dawn world: a meal laid on the grass, a wheat field, a rain cloud with rain,
// and small lights that rise from the meal and can come to rest in the sky. No people, no faces.
import * as THREE from 'three';

function rng(seed: number) { return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646; }

export const GROUND_Y = -2.64;
export const MEAL_AT = new THREE.Vector3(0.9, GROUND_Y, -2.2);

/** camera position and look-at for each shot; `wide` is handled by the scene itself */
export const SHOTS: Record<'meal' | 'field' | 'rain' | 'cloud', { pos: THREE.Vector3; look: THREE.Vector3 }> = {
  meal: { pos: new THREE.Vector3(1.3, -1.42, -0.55), look: new THREE.Vector3(0.85, -2.42, -2.25) },
  field: { pos: new THREE.Vector3(-1.4, -1.25, 2.4), look: new THREE.Vector3(-4.2, -2.35, -2.4) },
  rain: { pos: new THREE.Vector3(-1.4, -0.7, 3.4), look: new THREE.Vector3(-3.8, 0.9, -3.4) },
  cloud: { pos: new THREE.Vector3(-1.0, 0.7, 4.6), look: new THREE.Vector3(-3.6, 4.6, -4.2) },
};

export interface ProvisionState { meal: number; wheat: number; rain: number; rising: number; settle: boolean; ground?: number }

export function buildProvision(world: THREE.Scene, groundColor: THREE.Color) {
  // soft light for the few shaded (Lambert) objects; the rest of the world is flat colour
  const hemi = new THREE.HemisphereLight('#fff6e4', '#7d9a70', 2.3);
  const sun = new THREE.DirectionalLight('#ffe6bd', 2.4); sun.position.set(3, 7, 5);
  world.add(hemi, sun);

  // ground between the camera and the foreground rise, shown only when something stands on it
  const groundMat = new THREE.MeshBasicMaterial({ color: groundColor.clone(), transparent: true, opacity: 0 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 14), groundMat);
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, GROUND_Y - 0.01, 1.8); world.add(ground);

  // --- the meal: a cloth with bread, a small bowl of dates and a jug of water ---
  const meal = new THREE.Group(); meal.position.copy(MEAL_AT); world.add(meal);
  const lam = (c: string) => new THREE.MeshLambertMaterial({ color: c });
  const border = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.006, 0.9), lam('#b86b4b')); meal.add(border);
  const cloth = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.01, 0.8), lam('#f1e6cc')); cloth.position.y = 0.004; meal.add(cloth);
  const bread = new THREE.Mesh(new THREE.SphereGeometry(0.19, 24, 16), lam('#cf904f'));
  bread.scale.set(1, 0.55, 0.78); bread.position.set(-0.12, 0.09, -0.12); meal.add(bread);
  [-0.07, 0.02, 0.11].forEach(z => { const cut = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.012, 0.012), lam('#8a5527')); cut.position.set(-0.12, 0.19, z * 0.8 - 0.12); cut.rotation.y = 0.5; meal.add(cut); });
  const bowlGeo = new THREE.CylinderGeometry(0.13, 0.09, 0.07, 20, 1, true);
  const bowl = new THREE.Mesh(bowlGeo, new THREE.MeshLambertMaterial({ color: '#a8683f', side: THREE.DoubleSide })); bowl.position.set(-0.3, 0.04, 0.22); meal.add(bowl);
  const dr = rng(8);
  for (let i = 0; i < 6; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), lam('#7a3d22')); d.scale.set(1.7, 0.8, 0.9); d.position.set(-0.3 + (dr() - 0.5) * 0.14, 0.07 + dr() * 0.02, 0.22 + (dr() - 0.5) * 0.12); d.rotation.y = dr() * 3; meal.add(d); }
  const jugPts = [[0, 0], [0.09, 0], [0.12, 0.08], [0.12, 0.18], [0.08, 0.28], [0.06, 0.34], [0.075, 0.37]].map(([x, y]) => new THREE.Vector2(x, y));
  const jug = new THREE.Mesh(new THREE.LatheGeometry(jugPts, 24), new THREE.MeshLambertMaterial({ color: '#d68c60', side: THREE.DoubleSide })); jug.position.set(0.3, 0.005, 0.05); meal.add(jug);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.013, 8, 16, Math.PI), lam('#b06a45')); handle.position.set(0.42, 0.2, 0.05); handle.rotation.z = -Math.PI / 2; meal.add(handle);
  const water = new THREE.Mesh(new THREE.CircleGeometry(0.058, 16), lam('#7fa9b8')); water.rotation.x = -Math.PI / 2; water.position.set(0.3, 0.35, 0.05); meal.add(water);
  meal.scale.setScalar(0.001);

  // --- a field of golden wheat on the ground to the left ---
  const wheat = new THREE.Group(); world.add(wheat);
  const STALKS = 520, wr = rng(17);
  const stalkGeo = new THREE.CylinderGeometry(0.008, 0.012, 0.55, 4); stalkGeo.translate(0, 0.275, 0);
  const headGeo = new THREE.SphereGeometry(0.035, 6, 5); headGeo.scale(0.55, 2.4, 0.55); headGeo.translate(0, 0.6, 0);
  const stalks = new THREE.InstancedMesh(stalkGeo, lam('#e0bf6c'), STALKS), heads = new THREE.InstancedMesh(headGeo, lam('#f5d680'), STALKS);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3();
  for (let i = 0; i < STALKS; i++) {
    const x = -7.2 + wr() * 5.6, z = -4.7 + wr() * 4.3, h = 0.8 + wr() * 0.45;
    q.setFromEuler(e.set((wr() - 0.5) * 0.25, wr() * 3, (wr() - 0.5) * 0.25));
    m.compose(v.set(x, GROUND_Y, z), q, s.set(1, h, 1)); stalks.setMatrixAt(i, m); heads.setMatrixAt(i, m);
  }
  wheat.add(stalks, heads); wheat.scale.set(1, 0.001, 1);

  // --- a rain cloud and its rain over the field ---
  const cloud = new THREE.Group(); cloud.position.set(-3.6, 4.4, -4.2); world.add(cloud);
  const cloudMat = new THREE.MeshLambertMaterial({ color: '#e4e9ec', transparent: true, opacity: 0 });
  const cr = rng(3);
  for (let i = 0; i < 11; i++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55 + cr() * 0.55, 2), cloudMat); b.position.set((cr() - 0.5) * 3.6, (cr() - 0.5) * 0.6, (cr() - 0.5) * 1.2); b.scale.y = 0.72; cloud.add(b); }
  const DROPS = 420, rp = new Float32Array(DROPS * 6), rr = rng(21);
  const resetDrop = (i: number, top = false) => {
    const x = -6.4 + rr() * 5.6, z = -5 + rr() * 4, y = top ? 4 : GROUND_Y + rr() * 6.6;
    rp.set([x, y, z, x + 0.02, y - 0.22, z], i * 6);
  };
  for (let i = 0; i < DROPS; i++) resetDrop(i);
  const rainGeo = new THREE.BufferGeometry(); rainGeo.setAttribute('position', new THREE.BufferAttribute(rp, 3));
  const rainMat = new THREE.LineBasicMaterial({ color: '#b9d0dc', transparent: true, opacity: 0 });
  world.add(new THREE.LineSegments(rainGeo, rainMat));

  // --- small lights rising from the meal ---
  const MAX = 160;
  const lp = new Float32Array(MAX * 3).fill(-999);
  const lights = Array.from({ length: MAX }, () => ({ on: false, keep: false, vx: 0, vy: 0, home: new THREE.Vector3(), age: 0 }));
  const lightGeo = new THREE.BufferGeometry(); lightGeo.setAttribute('position', new THREE.BufferAttribute(lp, 3));
  const tex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d')!; const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,248,220,1)'); r.addColorStop(0.35, 'rgba(246,220,150,.8)'); r.addColorStop(1, 'rgba(240,200,120,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const lightMat = new THREE.PointsMaterial({ map: tex, size: 0.55, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
  const lightPoints = new THREE.Points(lightGeo, lightMat);
  lightPoints.frustumCulled = false; // lights start parked off-screen; don't let the renderer skip them
  world.add(lightPoints);
  const lr = rng(55);
  const spawn = (keep = false) => {
    const k = lights.findIndex(l => !l.on); if (k < 0) return;
    const L = lights[k];
    Object.assign(L, { on: true, keep, age: 0, vx: (lr() - 0.5) * 1.6, vy: 0.45 + lr() * 0.6 });
    L.home.set((lr() - 0.5) * 30, 7 + lr() * 11, -34 - lr() * 10);
    lp.set([MEAL_AT.x + (lr() - 0.5) * 0.5, MEAL_AT.y + 0.25, MEAL_AT.z + (lr() - 0.5) * 0.3], k * 3);
  };
  let emitAcc = 0, risingTime = 0;

  const cur: ProvisionState = { meal: 0, wheat: 0, rain: 0, rising: 0, settle: false };
  function update(target: ProvisionState, dt: number, t: number, reduce: boolean) {
    const ease = (k: 'meal' | 'wheat' | 'rain', to: number, rate: number) => { cur[k] += (to - cur[k]) * Math.min(1, dt * rate); };
    ease('meal', target.meal, 1.4); ease('wheat', target.wheat, 1); ease('rain', target.rain, 1.1);
    cur.rising = target.rising; cur.settle = target.settle;
    const shown = Math.max(cur.meal, cur.wheat, target.ground ?? 0);
    groundMat.opacity = Math.min(1, shown * 1.5); ground.visible = shown > 0.01;
    meal.scale.setScalar(Math.max(0.001, cur.meal)); meal.visible = cur.meal > 0.01;
    wheat.scale.y = Math.max(0.001, cur.wheat); wheat.visible = cur.wheat > 0.01;
    if (!reduce) wheat.rotation.z = Math.sin(t * 0.9) * 0.01;
    cloudMat.opacity = cur.rain * 0.95; cloud.visible = cur.rain > 0.01;
    rainMat.opacity = cur.rain * 0.7;
    if (cur.rain > 0.01 && !reduce) {
      for (let i = 0; i < DROPS; i++) { rp[i * 6 + 1] -= dt * 7; rp[i * 6 + 4] -= dt * 7; if (rp[i * 6 + 4] < GROUND_Y) resetDrop(i, true); }
      rainGeo.attributes.position.needsUpdate = true;
    }
    // emission: a few, then more, then too many to follow
    if (cur.rising > 0) {
      risingTime += dt;
      const rate = cur.rising === 1 ? 1 : cur.rising === 2 ? 3.5 : Math.min(18, 1.5 + risingTime * 2.2);
      emitAcc += rate * dt;
      while (emitAcc >= 1) { spawn(); emitAcc -= 1; }
    } else { risingTime = 0; emitAcc = 0; }
    for (let k = 0; k < MAX; k++) {
      const L = lights[k]; if (!L.on) continue;
      L.age += dt;
      const i = k * 3;
      if (cur.settle || L.keep && L.age > 2.4) {
        // come to rest in the sky
        lp[i] += (L.home.x - lp[i]) * Math.min(1, dt * 0.9); lp[i + 1] += (L.home.y - lp[i + 1]) * Math.min(1, dt * 0.9); lp[i + 2] += (L.home.z - lp[i + 2]) * Math.min(1, dt * 0.9);
      } else {
        lp[i] += L.vx * dt + Math.sin(t * 1.3 + k) * 0.004; lp[i + 1] += L.vy * dt; lp[i + 2] -= dt * 0.35;
        if (!L.keep && lp[i + 1] > 12) { L.on = false; lp.set([-999, -999, -999], i); }
      }
    }
    lightGeo.attributes.position.needsUpdate = true;
    lightMat.size = 0.55 + Math.sin(t * 2) * 0.05;
  }

  return {
    update,
    /** one light rises from the meal and stays in the sky (Quick Check answers) */
    release: () => spawn(true),
    dispose: () => tex.dispose(),
  };
}
