// Level 5 addition to the dawn world: an ordinary neighbourhood of flat roofed houses and a small mosque on the near hill.
// Its windows light up one by one, and small lights gather over it, one for each act of worship. No people.
import * as THREE from 'three';

function rng(seed: number) { return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646; }

export const TOWN_SHOTS = {
  sky: { pos: new THREE.Vector3(0, 3.2, 10), look: new THREE.Vector3(0, 14, -40) },
  town: { pos: new THREE.Vector3(0, 0.75, 4.5), look: new THREE.Vector3(0.3, 0.9, -12) }, // the neighbourhood sits in the lower third, the words on open sky
};

/** hillY: the near hill's ridge height at x (the houses stand along it) */
export function buildWorship(world: THREE.Scene, glow: THREE.Texture, hillY: (x: number) => number) {
  const town = new THREE.Group(); world.add(town);
  const r = rng(53);
  const mats: { m: THREE.MeshBasicMaterial; c: THREE.Color }[] = [];
  const mat = (c: string) => { const m = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0 }); mats.push({ m, c: new THREE.Color(c) }); return m; };
  const WALLS = ['#e9dcc2', '#dcc6a2', '#c98a66', '#b9c7ae', '#e4d3b8', '#cfae8c'].map(mat);
  const ROOF = mat('#8c6a52'), DOOR = mat('#6b4a35'), DOME = mat('#d8b567'), WHITE = mat('#f1e8d6');
  const winDark = new THREE.Color('#4a4d4a'), winLit = new THREE.Color('#ffd98a');
  const windows: { m: THREE.MeshBasicMaterial; x: number; on: number; halo: THREE.Sprite }[] = [];
  const box = (w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); town.add(b); return b; };
  const addWindow = (x: number, y: number, z: number, s: number) => {
    const m = new THREE.MeshBasicMaterial({ color: winDark.clone(), transparent: true, opacity: 0 });
    const q = new THREE.Mesh(new THREE.PlaneGeometry(s, s * 1.2), m); q.position.set(x, y, z); town.add(q);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    halo.position.set(x, y, z + 0.02); halo.scale.setScalar(s * 3.2); town.add(halo);
    windows.push({ m, x, on: 0, halo });
  };

  // two loose rows of houses along the hill, the centre kept a little open toward the light
  const spots: { x: number; z: number; drop: number }[] = [];
  for (let x = -11; x <= 11; x += 1.25 + r() * 0.35) if (Math.abs(x - 1.4) > 1.2) spots.push({ x, z: -11.4 - r() * 0.5, drop: 0.3 });
  for (let x = -9.4; x <= 9.4; x += 1.6 + r() * 0.5) if (Math.abs(x - 1.4) > 1.6) spots.push({ x, z: -10.2 - r() * 0.3, drop: 0.85 });
  for (const s of spots) {
    const w = 0.75 + r() * 0.45, h = 0.55 + r() * 0.45, d = 0.6, base = hillY(s.x) - s.drop;
    box(w, h, d, WALLS[Math.floor(r() * WALLS.length)], s.x, base + h / 2, s.z);
    box(w + 0.06, 0.06, d + 0.06, ROOF, s.x, base + h + 0.03, s.z); // a flat roof with a thin parapet
    const front = s.z + d / 2 + 0.005;
    box(0.16, 0.3, 0.01, DOOR, s.x + (r() - 0.5) * w * 0.4, base + 0.15, front);
    const n = w > 0.9 ? 2 : 1;
    for (let k = 0; k < n; k++) addWindow(s.x + (n === 1 ? (r() > 0.5 ? 0.22 : -0.22) : (k ? 0.26 : -0.26)) * w, base + h * 0.62, front + 0.004, 0.17);
  }

  // a small mosque with a dome and a minaret
  const mx = 1.4, mz = -11, mb = hillY(mx) - 0.55;
  box(1.5, 0.8, 0.9, WHITE, mx, mb + 0.4, mz);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), DOME); dome.position.set(mx, mb + 0.8, mz); dome.scale.y = 1.25; town.add(dome);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), DOME); tip.position.set(mx, mb + 1.36, mz); town.add(tip);
  const minaret = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 1.7, 12), WHITE); minaret.position.set(mx + 0.95, mb + 0.85, mz); town.add(minaret);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.3, 12), DOME); cap.position.set(mx + 0.95, mb + 1.85, mz); town.add(cap);
  box(0.28, 0.46, 0.01, DOOR, mx, mb + 0.23, mz + 0.455);
  addWindow(mx - 0.48, mb + 0.5, mz + 0.46, 0.17); addWindow(mx + 0.48, mb + 0.5, mz + 0.46, 0.17);

  // windows light from the centre outward, so the first ones are always in view
  windows.sort((a, b) => Math.abs(a.x - 0.4) - Math.abs(b.x - 0.4));

  // small lights over the neighbourhood, one for each act of worship (centre first)
  const LIGHTS = 30, lr = rng(71);
  const lights = Array.from({ length: LIGHTS }, () => {
    const x = (lr() - 0.5) * 20, s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    s.position.set(x, hillY(x) + 0.7 + lr() * 1.3, -10.6 - lr() * 1.2); s.scale.setScalar(0.001); town.add(s);
    return { s, x, on: 0, ph: lr() * 6 };
  }).sort((a, b) => Math.abs(a.x) - Math.abs(b.x));

  let shown = 0;
  function update(target: { town: boolean; worship: number; windows: number }, dt: number, t: number, light: number, night: number, reduce: boolean) {
    shown += ((target.town ? 1 : 0) - shown) * Math.min(1, dt * 1.2);
    town.visible = shown > 0.01;
    if (!town.visible) return;
    const shade = (0.45 + 0.55 * light) * (1 - night * 0.55);
    for (const { m, c } of mats) { m.color.copy(c).multiplyScalar(shade); m.opacity = shown; }
    windows.forEach((w, k) => {
      w.on += ((k < target.windows ? 1 : 0) - w.on) * Math.min(1, dt * (reduce ? 10 : 1.6));
      w.m.color.copy(winDark).multiplyScalar(shade).lerp(winLit, w.on); w.m.opacity = shown;
      (w.halo.material as THREE.SpriteMaterial).opacity = w.on * 0.8 * shown;
    });
    lights.forEach((l, k) => {
      l.on += ((k < target.worship ? 1 : 0) - l.on) * Math.min(1, dt * (reduce ? 10 : 1.3));
      const breathe = reduce ? 1 : 1 + Math.sin(t * 1.3 + l.ph) * 0.12;
      l.s.scale.setScalar(Math.max(0.001, l.on * 0.55 * breathe));
      (l.s.material as THREE.SpriteMaterial).opacity = l.on * shown;
    });
  }
  return { update };
}
