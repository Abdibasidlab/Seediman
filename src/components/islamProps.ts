// Level 6 addition to the dawn world: a house of five pillars in front of the neighbourhood, whose pillars rise and glow
// one at a time and whose roof settles after the fifth, and three lines of light across the sky for the three parts of Islam.
// Plain architecture only: no people, no writing, no symbols of other faiths.
import * as THREE from 'three';

/** the house centred (Quick Check), or low in the frame so words above it sit on open sky (Presentation) */
export const HOUSE_SHOT = { pos: new THREE.Vector3(0, 0.1, 2.5), look: new THREE.Vector3(0, -0.9, -8.5) };
export const HOUSE_LOW_SHOT = { pos: new THREE.Vector3(0, 0.1, 2.5), look: new THREE.Vector3(0, 0.35, -8.5) };
/** Level 7: turned from the house toward the path and the distant city */
export const CITY_SHOT = { pos: new THREE.Vector3(3, 1.2, 11), look: new THREE.Vector3(8.5, 5.5, -40) };

const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

export function buildIslam(world: THREE.Scene, glow: THREE.Texture) {
  const house = new THREE.Group(); house.position.set(0, -2.05, -8.5); world.add(house);
  const mats: { m: THREE.MeshBasicMaterial; c: THREE.Color }[] = [];
  const mat = (c: string) => { const m = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0 }); mats.push({ m, c: new THREE.Color(c) }); return m; };
  const STONE = mat('#efe4cc'), STEP = mat('#d9c7a4'), ROOF = mat('#e6d6b4'), EDGE = mat('#c9a86a');

  // a stepped base
  const base = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.14, 1.3), STEP); base.position.y = 0.07; house.add(base);
  const base2 = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.12, 1.1), STONE); base2.position.y = 0.2; house.add(base2);

  // five pillars that rise from the base, each with its own glow
  const H = 1.3, cols: { g: THREE.Group; m: THREE.MeshBasicMaterial; halo: THREE.Sprite; rise: number; lit: number }[] = [];
  const shaft = new THREE.CylinderGeometry(0.085, 0.1, H, 16); shaft.translate(0, H / 2, 0);
  const cap = new THREE.BoxGeometry(0.28, 0.07, 0.28);
  for (let i = 0; i < 5; i++) {
    const g = new THREE.Group(); g.position.set(-1.1 + i * 0.55, 0.26, 0); house.add(g);
    const m = new THREE.MeshBasicMaterial({ color: '#efe4cc', transparent: true, opacity: 0 });
    g.add(new THREE.Mesh(shaft, m));
    const c1 = new THREE.Mesh(cap, m); c1.position.y = H + 0.035; g.add(c1);
    const c0 = new THREE.Mesh(cap, m); c0.position.y = 0.035; g.add(c0);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    halo.position.set(-1.1 + i * 0.55, 0.26 + H * 0.55, -0.05); halo.scale.set(0.9, 2.2, 1); house.add(halo);
    g.scale.y = 0.001; cols.push({ g, m, halo, rise: 0, lit: 0 });
  }

  // the roof: a flat beam and a low gable, settling down from above
  const roof = new THREE.Group(); house.add(roof);
  const beam = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.16, 1.15), ROOF); beam.position.y = 0.26 + H + 0.15; roof.add(beam);
  const gable = new THREE.Shape(); gable.moveTo(-1.55, 0); gable.lineTo(0, 0.42); gable.lineTo(1.55, 0); gable.closePath();
  const pediment = new THREE.Mesh(new THREE.ExtrudeGeometry(gable, { depth: 1.05, bevelEnabled: false }), ROOF); pediment.position.set(0, 0.26 + H + 0.23, -0.525); roof.add(pediment);
  const trim = new THREE.Mesh(new THREE.BoxGeometry(3.04, 0.04, 1.19), EDGE); trim.position.y = 0.26 + H + 0.235; roof.add(trim);
  const roofHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  roofHalo.position.set(0, 0.26 + H + 0.35, 0.1); roofHalo.scale.set(5, 1.6, 1); house.add(roofHalo);

  // three long lines of light across the sky
  const lines = [0, 1, 2].map(k => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    s.position.set(0, 7.2 + k * 2.1, -40); s.scale.set(0.001, 1, 1); world.add(s);
    return { s, on: 0 };
  });

  // small warm lights, only ever lights: no messenger is drawn
  const dot = () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: '#ffe7a8', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, fog: false })); s.renderOrder = 5; world.add(s); return s; };

  // Level 6: a path of five lights across the horizon, one for each messenger named
  const path = [[-6.2, 0.7], [-3.2, 1.9], [0, 1], [3.1, 2.2], [6, 1.3]].map(([x, y]) => { const s = dot(); s.position.set(x, y, -29); return { s, on: 0 }; });

  // Level 7: a winding path from near the viewer toward the distant city, with three brighter markers along it
  const TRAIL = 14;
  const trail = Array.from({ length: TRAIL }, (_, i) => {
    const f = i / (TRAIL - 1), s = dot();
    s.position.set(-1.6 + 9 * f + Math.sin(f * Math.PI * 2) * 2.2 * (1 - f), -1.5 + 2.6 * f, 4 - 32 * f);
    return { s, on: 0, size: 0.5 + 0.5 * f };
  });
  const markers = [3, 7, 11].map(i => { const s = dot(); s.position.copy(trail[i].s.position); return { s, on: 0, size: trail[i].size * 2.4 }; });

  const cur = { shown: 0, roof: 0, roofGlow: 0, full: 0 };
  function update(t: { house: boolean; pillars: number; pillarsLit: number; roof: number; parts: number; messengers: number; trail: number; marks: number; trailFull: boolean }, dt: number, time: number, light: number, night: number, reduce: boolean) {
    const k = (rate: number) => Math.min(1, dt * (reduce ? 10 : rate));
    cur.shown += ((t.house ? 1 : 0) - cur.shown) * k(1.2);
    house.visible = cur.shown > 0.01;
    const shade = (0.55 + 0.45 * light) * (1 - night * 0.5);
    for (const { m, c } of mats) { m.color.copy(c).multiplyScalar(shade); m.opacity = cur.shown; }
    const warm = new THREE.Color('#ffe7a8'), stone = new THREE.Color('#efe4cc');
    cols.forEach((c, i) => {
      c.rise += ((i < t.pillars ? 1 : 0) - c.rise) * k(1.6);
      c.lit += ((i < t.pillarsLit ? 1 : 0) - c.lit) * k(1.4);
      c.g.scale.y = Math.max(0.001, smooth(0, 1, c.rise));
      c.m.color.copy(stone).multiplyScalar(shade).lerp(warm, c.lit * 0.85); c.m.opacity = cur.shown;
      (c.halo.material as THREE.SpriteMaterial).opacity = c.lit * 0.55 * cur.shown * c.rise * (reduce ? 1 : 0.9 + 0.1 * Math.sin(time * 1.4 + i));
    });
    cur.roof += ((t.roof > 0 ? 1 : 0) - cur.roof) * k(0.9);
    cur.roofGlow += ((t.roof === 2 ? 1 : 0) - cur.roofGlow) * k(0.8);
    roof.visible = cur.roof > 0.01; roof.position.y = (1 - smooth(0, 1, cur.roof)) * 1.6;
    for (const m of [ROOF, EDGE]) m.opacity = cur.shown * smooth(0, 0.6, cur.roof);
    ROOF.color.lerp(warm, cur.roofGlow * 0.5);
    (roofHalo.material as THREE.SpriteMaterial).opacity = cur.roofGlow * 0.7 * cur.shown;
    lines.forEach((l, i) => {
      l.on += ((i < t.parts ? 1 : 0) - l.on) * k(1.1);
      l.s.scale.set(Math.max(0.001, 34 * smooth(0, 1, l.on)), 0.9, 1);
      (l.s.material as THREE.SpriteMaterial).opacity = l.on * 0.75;
    });
    path.forEach((l, i) => {
      l.on += ((i < t.messengers ? 1 : 0) - l.on) * k(1.8);
      l.s.visible = l.on > 0.01;
      const size = 2.3 * smooth(0, 1, l.on) * (reduce ? 1 : 1 + 0.06 * Math.sin(time * 1.3 + i));
      l.s.scale.set(Math.max(0.001, size), Math.max(0.001, size), 1);
      (l.s.material as THREE.SpriteMaterial).opacity = l.on * 0.95;
    });
    cur.full += ((t.trailFull ? 1 : 0) - cur.full) * k(0.9);
    trail.forEach((l, i) => {
      l.on += ((i < t.trail ? 1 : 0) - l.on) * k(1.5);
      l.s.visible = l.on > 0.01;
      const size = l.size * (1 + cur.full * 0.45) * smooth(0, 1, l.on);
      l.s.scale.set(Math.max(0.001, size), Math.max(0.001, size), 1);
      (l.s.material as THREE.SpriteMaterial).opacity = l.on * (0.6 + 0.35 * cur.full) * (reduce ? 1 : 0.94 + 0.06 * Math.sin(time * 1.1 + i * 0.7));
    });
    markers.forEach((l, i) => {
      l.on += ((i < t.marks ? 1 : 0) - l.on) * k(1.6);
      l.s.visible = l.on > 0.01;
      const size = l.size * smooth(0, 1, l.on);
      l.s.scale.set(Math.max(0.001, size), Math.max(0.001, size), 1);
      (l.s.material as THREE.SpriteMaterial).opacity = l.on;
    });
  }
  return { update };
}
