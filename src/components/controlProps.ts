// Level 4 additions to the dawn world: a seed that sprouts, an egg that opens and a chick that steps out,
// a wilted flower that lifts after rain, a storm cloud over the mountains, and a distant city whose lights come on.
// No people. The child only watches; nothing here is steered.
import * as THREE from 'three';
import { GROUND_Y } from './provisionProps';

function rng(seed: number) { return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646; }
const lam = (c: string, extra: Partial<THREE.MeshLambertMaterialParameters> = {}) => new THREE.MeshLambertMaterial({ color: c, ...extra });
const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

export const GROWTH_SHOT = { pos: new THREE.Vector3(0, -1.72, -0.55), look: new THREE.Vector3(0, -2.42, -2.45) };

export function buildControl(world: THREE.Scene) {
  // ---------- life and growth, in a row on the grass ----------
  const growth = new THREE.Group(); growth.position.set(0, GROUND_Y, -2.45); world.add(growth);

  // a seed in a small mound of soil, then a stem, then two leaves
  const sprout = new THREE.Group(); sprout.position.x = -0.85; growth.add(sprout);
  const mound = new THREE.Mesh(new THREE.SphereGeometry(0.2, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), lam('#7a5033')); mound.scale.y = 0.45; sprout.add(mound);
  const seed = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), lam('#c9a15a')); seed.scale.set(1.4, 0.9, 1); seed.position.y = 0.09; sprout.add(seed);
  const stemGeo = new THREE.CylinderGeometry(0.012, 0.016, 0.34, 6); stemGeo.translate(0, 0.17, 0);
  const stem = new THREE.Mesh(stemGeo, lam('#5f9a55')); stem.position.y = 0.08; sprout.add(stem);
  const leafGeo = new THREE.SphereGeometry(0.07, 12, 8); leafGeo.scale(1.6, 0.28, 0.8);
  const leafL = new THREE.Mesh(leafGeo, lam('#6fae5f')), leafR = new THREE.Mesh(leafGeo, lam('#6fae5f'));
  leafL.position.set(-0.08, 0.4, 0); leafL.rotation.z = 0.5; leafR.position.set(0.08, 0.38, 0); leafR.rotation.z = -0.5; sprout.add(leafL, leafR);

  // an egg whose top lifts away, and a chick that steps out (a simple rounded shape, no face)
  const egg = new THREE.Group(); growth.add(egg);
  const shell = lam('#f3ead8', { side: THREE.DoubleSide });
  const bottom = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), shell); bottom.scale.y = 1.25; bottom.position.y = 0.16; egg.add(bottom);
  const top = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), shell); top.scale.y = 1.25; top.position.y = 0.16; egg.add(top);
  const chick = new THREE.Group(); chick.position.y = 0.02; egg.add(chick);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 12), lam('#f4cf57')); body.position.y = 0.08; chick.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.048, 14, 10), lam('#f7d866')); head.position.set(0.04, 0.17, 0); chick.add(head);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.04, 6), lam('#e08a3c')); beak.rotation.z = -Math.PI / 2; beak.position.set(0.095, 0.165, 0); chick.add(beak);

  // a wilted flower that lifts its head after a little rain
  const flower = new THREE.Group(); flower.position.x = 0.85; growth.add(flower);
  const fmound = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), lam('#6d8f4f')); fmound.scale.y = 0.4; flower.add(fmound);
  const pivot = new THREE.Group(); pivot.position.y = 0.03; flower.add(pivot);
  const fstemGeo = new THREE.CylinderGeometry(0.01, 0.013, 0.42, 6); fstemGeo.translate(0, 0.21, 0);
  pivot.add(new THREE.Mesh(fstemGeo, lam('#5b8f4c')));
  const bloom = new THREE.Group(); bloom.position.y = 0.44; pivot.add(bloom);
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; const pet = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), lam('#e79aa6')); pet.scale.set(1.2, 0.5, 0.8); pet.position.set(Math.cos(a) * 0.05, 0, Math.sin(a) * 0.05); bloom.add(pet); }
  bloom.add(new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), lam('#f2c94c')));
  const DROPS = 40, dp = new Float32Array(DROPS * 6), dr = rng(12);
  const resetDrop = (i: number, top = false) => { const x = 0.85 + (dr() - 0.5) * 0.6, y = top ? 0.9 : dr() * 0.9, z = (dr() - 0.5) * 0.4; dp.set([x, y, z, x, y - 0.07, z], i * 6); };
  for (let i = 0; i < DROPS; i++) resetDrop(i);
  const dropGeo = new THREE.BufferGeometry(); dropGeo.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dropMat = new THREE.LineBasicMaterial({ color: '#a9c8d6', transparent: true, opacity: 0 });
  growth.add(new THREE.LineSegments(dropGeo, dropMat));
  growth.visible = false;

  // ---------- a storm cloud that passes over the great mountain ----------
  const storm = new THREE.Group(); storm.position.set(-26, 9, -44); world.add(storm);
  const stormMat = lam('#6d7682', { transparent: true, opacity: 0 });
  const sr = rng(4);
  for (let i = 0; i < 14; i++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4 + sr() * 1.6, 2), stormMat); b.position.set((sr() - 0.5) * 11, (sr() - 0.5) * 1.6, (sr() - 0.5) * 3); b.scale.y = 0.6; storm.add(b); }

  // ---------- a distant city on the right; its lights come on ----------
  const city = new THREE.Group(); city.position.set(0, 0, -29); world.add(city);
  const cityMat = new THREE.MeshBasicMaterial({ color: '#34454f', transparent: true, opacity: 0 });
  const cr = rng(29); const win: number[] = [];
  for (let i = 0; i < 16; i++) {
    const w = 0.5 + cr() * 0.7, h = 1 + cr() * 2.6, x = 6.5 + i * 0.62 + cr() * 0.2;
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.5), cityMat); b.position.set(x, 0.6 + h / 2, 0); city.add(b);
    for (let k = 0; k < 5; k++) if (cr() > 0.35) win.push(x + (cr() - 0.5) * w * 0.7, 0.8 + cr() * h * 0.9, 0.3);
  }
  const winGeo = new THREE.BufferGeometry(); winGeo.setAttribute('position', new THREE.Float32BufferAttribute(win, 3));
  const winMat = new THREE.PointsMaterial({ color: '#ffd98a', size: 0.14, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  const wins = new THREE.Points(winGeo, winMat); wins.frustumCulled = false; city.add(wins);

  const cur = { growth: 0, storm: 0, city: 0, grow: 0, stormX: 0 };
  function update(target: { growth: boolean; storm: boolean; city: boolean }, dt: number, t: number, night: number, reduce: boolean) {
    // growth plays once each time it is switched on
    if (target.growth) { cur.growth = Math.min(1, cur.growth + dt * 2); cur.grow = Math.min(1, cur.grow + dt / 7); }
    else { cur.growth = Math.max(0, cur.growth - dt * 2); if (cur.growth === 0) cur.grow = 0; }
    growth.visible = cur.growth > 0.01; growth.scale.setScalar(Math.max(0.001, cur.growth));
    const g = reduce ? 1 : cur.grow;
    stem.scale.y = Math.max(0.001, smooth(0.08, 0.55, g)); seed.visible = g < 0.2;
    leafL.scale.setScalar(Math.max(0.001, smooth(0.45, 0.75, g))); leafR.scale.setScalar(Math.max(0.001, smooth(0.5, 0.8, g)));
    const crack = smooth(0.25, 0.45, g);
    top.position.set(-0.1 * crack, 0.16 + 0.12 * crack, 0); top.rotation.z = crack * 1.1;
    chick.scale.setScalar(Math.max(0.001, smooth(0.35, 0.55, g))); chick.position.x = 0.16 * smooth(0.55, 0.85, g);
    if (!reduce) chick.position.y = 0.02 + Math.abs(Math.sin(t * 6)) * 0.015 * smooth(0.55, 0.85, g) * (1 - smooth(0.85, 0.9, g));
    pivot.rotation.z = 1.05 * (1 - smooth(0.45, 0.95, g));
    dropMat.opacity = 0.8 * (1 - smooth(0.35, 0.5, g)) * cur.growth;
    if (dropMat.opacity > 0.01 && !reduce) { for (let i = 0; i < DROPS; i++) { dp[i * 6 + 1] -= dt * 2.2; dp[i * 6 + 4] -= dt * 2.2; if (dp[i * 6 + 4] < 0) resetDrop(i, true); } dropGeo.attributes.position.needsUpdate = true; }

    // the storm drifts across while shown, and passes on
    cur.storm += ((target.storm ? 1 : 0) - cur.storm) * Math.min(1, dt * 0.8);
    if (target.storm && !reduce) cur.stormX = Math.min(1, cur.stormX + dt / 14); else if (!target.storm && cur.storm < 0.02) cur.stormX = 0;
    storm.position.x = -26 + 52 * cur.stormX; stormMat.opacity = cur.storm * 0.92; storm.visible = cur.storm > 0.01;

    // the city fades in; its windows light up, more strongly as evening comes
    cur.city += ((target.city ? 1 : 0) - cur.city) * Math.min(1, dt * 0.7);
    cityMat.opacity = cur.city * 0.95; city.visible = cur.city > 0.01;
    winMat.opacity = cur.city * (0.45 + 0.55 * night) * smooth(0.3, 1, cur.city);
  }
  return { update, showsGround: () => cur.growth > 0.01 };
}
