// Fiqh: a calm morning room for the walkthrough Presentation and the Quick Check. Objects, water and light only:
// no person ever appears, and nothing is shown behind the door.
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import type { DawnHandle } from './DawnScene';
import type { SceneCue } from '../data/lessonTypes';

type Focus = NonNullable<SceneCue['focus']>;
const SHOTS: Record<Focus, { pos: [number, number, number]; look: [number, number, number] }> = {
  room: { pos: [0, 2.3, 5.6], look: [0, 1.75, -1] },
  tap: { pos: [-1.3, 2.0, 2.6], look: [-2.0, 1.6, -1.2] },
  shelf: { pos: [0, 2.2, 2.4], look: [0, 1.85, -1.9] },
  door: { pos: [1.1, 2.1, 2.6], look: [2.0, 1.75, -1.9] },
  mat: { pos: [0.4, 2.9, 3.4], look: [0.5, 1.3, -0.4] },
};

const DEFAULTS = { light: 0.5, focus: 'room' as Focus, tap: false, panels: 0, shelf: 0, tags: 0, door: 0, matOpen: false, roomLit: 0 };
const smooth = (x: number) => { const t = Math.min(1, Math.max(0, x)); return t * t * (3 - 2 * t); };

function glowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d')!, r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.35, 'rgba(255,240,200,.55)'); r.addColorStop(1, 'rgba(255,230,180,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

export const RoomScene = forwardRef<DawnHandle, { scene: SceneCue }>(function RoomScene({ scene }, ref) {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef({ t: { ...DEFAULTS, ...scene }, pulse: 0, tx: 0, ty: 0 });
  api.current.t = { ...DEFAULTS, ...scene } as typeof DEFAULTS;

  useImperativeHandle(ref, () => ({
    pulse() { api.current.pulse = 1; },
    release() {},
    nudge(cx, cy) {
      const el = host.current; if (!el) return;
      const r = el.getBoundingClientRect();
      api.current.tx = ((cx - r.left) / r.width - 0.5) * 2; api.current.ty = ((cy - r.top) / r.height - 0.5) * 2;
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
    world.background = new THREE.Color('#e9dfc9');
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 60);
    const tex = glowTexture();
    const std = (c: string, o: Partial<THREE.MeshStandardMaterialParameters> = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.9, ...o });
    const add = (g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = world) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); parent.add(o); return o; };
    const sprite = (color: string, sx: number, sy: number, x: number, y: number, z: number) => {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
      s.scale.set(sx, sy, 1); s.position.set(x, y, z); world.add(s); return s;
    };

    // light
    const amb = new THREE.HemisphereLight('#fff6e4', '#c9b48e', 0.9); world.add(amb);
    const sun = new THREE.DirectionalLight('#ffe2ad', 1.2); sun.position.set(-3, 4, 3); world.add(sun);

    // the room: a warm floor, cream walls and a window of morning light
    add(new THREE.BoxGeometry(7, 0.1, 6), std('#c9a77c'), 0, -0.05, 0.5);
    for (let i = 0; i < 7; i++) add(new THREE.BoxGeometry(7, 0.005, 0.02), std('#b8946a'), 0, 0.002, -2 + i * 0.85);
    add(new THREE.BoxGeometry(7, 3.6, 0.1), std('#f3ead6'), 0, 1.8, -2.05);
    add(new THREE.BoxGeometry(0.1, 3.6, 6), std('#efe4cc'), -3.4, 1.8, 0.5);
    add(new THREE.BoxGeometry(0.1, 3.6, 6), std('#efe4cc'), 3.4, 1.8, 0.5);
    add(new THREE.BoxGeometry(7, 0.12, 0.08), std('#e2d3b3'), 0, 0.06, -1.97);
    add(new THREE.BoxGeometry(7, 0.1, 6), std('#f6efdf'), 0, 3.6, 0.5); // ceiling
    const win = add(new THREE.PlaneGeometry(1.3, 1.6), new THREE.MeshBasicMaterial({ color: '#fff3d6' }), -1.25, 2.25, -1.99);
    add(new THREE.BoxGeometry(1.42, 0.06, 0.06), std('#d8c39b'), -1.25, 3.08, -1.96); add(new THREE.BoxGeometry(1.42, 0.06, 0.06), std('#d8c39b'), -1.25, 1.42, -1.96);
    add(new THREE.BoxGeometry(0.05, 1.6, 0.05), std('#d8c39b'), -1.25, 2.25, -1.96);
    const shaft = sprite('#ffe7b0', 3.2, 4.5, -0.6, 1.6, -0.8);
    win.scale.setScalar(0.92);

    // the tap and basin, with water that runs and one drop that lights up
    add(new THREE.BoxGeometry(0.9, 1.0, 0.6), std('#d9cbb0'), -2.3, 0.5, -1.55);
    add(new THREE.CylinderGeometry(0.34, 0.26, 0.16, 32), std('#fbf6ea', { roughness: 0.4 }), -2.3, 1.08, -1.5);
    const chrome = std('#c9ccd0', { metalness: 0.7, roughness: 0.25 });
    add(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 16), chrome, -2.3, 1.32, -1.78);
    const spout = add(new THREE.CylinderGeometry(0.03, 0.03, 0.28, 16), chrome, -2.3, 1.5, -1.66); spout.rotation.x = Math.PI / 2;
    const stream = add(new THREE.CylinderGeometry(0.018, 0.024, 0.36, 12), new THREE.MeshStandardMaterial({ color: '#9fd0ea', transparent: true, opacity: 0 }), -2.3, 1.3, -1.53);
    const drop = sprite('#cfeeff', 0.35, 0.35, -2.3, 1.2, -1.5);

    // the shelf: a small tap, a hose, three smooth stones and a roll of tissue, one at a time
    add(new THREE.BoxGeometry(1.7, 0.06, 0.32), std('#b98f63'), 0.15, 1.55, -1.85);
    const shelf: THREE.Object3D[] = [];
    const g0 = new THREE.Group(); add(new THREE.CylinderGeometry(0.035, 0.035, 0.22, 16), chrome, 0, 0.11, 0, g0); const s0 = add(new THREE.CylinderGeometry(0.025, 0.025, 0.16, 16), chrome, 0, 0.2, 0.07, g0); s0.rotation.x = Math.PI / 2;
    g0.position.set(-0.45, 1.58, -1.82); world.add(g0); shelf.push(g0);
    const g1 = new THREE.Group(); const coil = add(new THREE.TorusGeometry(0.1, 0.025, 10, 28), std('#8fb3a3'), 0, 0.12, 0, g1); coil.rotation.x = Math.PI / 2.4; add(new THREE.CylinderGeometry(0.03, 0.035, 0.1, 12), chrome, 0.12, 0.14, 0.04, g1);
    g1.position.set(-0.05, 1.58, -1.82); world.add(g1); shelf.push(g1);
    const g2 = new THREE.Group(); [[-0.08, 0.05], [0.06, 0.045], [0.0, 0.11]].forEach(([x, y], i) => { const st = add(new THREE.SphereGeometry(0.07, 18, 12), std(['#cdbb9c', '#bfae90', '#d7c7a8'][i]), x, y, 0, g2); st.scale.set(1.2, 0.65, 1); });
    g2.position.set(0.35, 1.58, -1.82); world.add(g2); shelf.push(g2);
    const g3 = new THREE.Group(); add(new THREE.CylinderGeometry(0.1, 0.1, 0.2, 24), std('#ffffff', { roughness: 0.8 }), 0, 0.1, 0, g3); add(new THREE.CylinderGeometry(0.035, 0.035, 0.205, 16), std('#d9cdb4'), 0, 0.1, 0, g3);
    g3.position.set(0.72, 1.58, -1.82); world.add(g3); shelf.push(g3);
    shelf.forEach(g => g.scale.setScalar(0.001));
    const tagWater = sprite('#bfe6ff', 0.9, 0.5, -0.45, 1.66, -1.7), tagStone = sprite('#ffe2a8', 1.2, 0.5, 0.55, 1.66, -1.7);

    // two soft panels of light: wudu on the left, removing impurity on the right
    const panel = (c: string, x: number) => add(new THREE.PlaneGeometry(1.35, 2.5), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, depthWrite: false }), x, 1.45, -1.6);
    const panelL = panel('#9fd3ee', -0.72), panelR = panel('#ffd98f', 0.72);
    const garment = add(new THREE.BoxGeometry(0.5, 0.1, 0.38), std('#f6efe0'), 1.55, 0.05, -1.3);
    const cloth = add(new THREE.BoxGeometry(0.34, 0.04, 0.3), std('#e8dcc4'), 2.15, 0.02, -1.0);

    // the door: closed and softly glowing, then open a little with light coming through (nothing behind it)
    const doorPivot = new THREE.Group(); doorPivot.position.set(2.45, 0, -1.98); world.add(doorPivot);
    const doorM = std('#9a6b43'); const door = add(new THREE.BoxGeometry(0.95, 2.15, 0.06), doorM, -0.475, 1.075, 0.03, doorPivot);
    add(new THREE.SphereGeometry(0.035, 12, 8), std('#d8b45e', { metalness: 0.5, roughness: 0.4 }), -0.85, 1.05, 0.08, doorPivot);
    add(new THREE.BoxGeometry(1.1, 0.08, 0.1), std('#d8c39b'), 1.975, 2.2, -1.97);
    const gap = add(new THREE.PlaneGeometry(0.93, 2.13), new THREE.MeshBasicMaterial({ color: '#fff1c8', transparent: true, opacity: 0 }), 1.975, 1.075, -1.995);
    const doorGlow = sprite('#ffd98a', 1.9, 3.0, 1.975, 1.1, -1.85);

    // the prayer mat: folded in the corner, then opening flat and clean on the floor
    const matM = std('#7f9f86'), edgeM = std('#e6d8b6');
    const folded = new THREE.Group(); add(new THREE.BoxGeometry(0.55, 0.14, 0.38), matM, 0, 0.07, 0, folded); add(new THREE.BoxGeometry(0.56, 0.02, 0.39), edgeM, 0, 0.145, 0, folded);
    folded.position.set(0.9, 0, -1.45); world.add(folded);
    const open = new THREE.Group(); add(new THREE.BoxGeometry(0.85, 0.02, 1.55), matM, 0, 0.012, 0, open); add(new THREE.BoxGeometry(0.62, 0.022, 1.3), std('#97b59c'), 0, 0.014, 0, open);
    const arch = add(new THREE.CylinderGeometry(0.24, 0.24, 0.024, 32, 1, false, 0, Math.PI), edgeM, 0, 0.016, -0.45, open); arch.rotation.y = Math.PI / 2;
    open.position.set(0.55, 0, -0.35); open.scale.set(1, 1, 0.001); world.add(open);
    const matGlow = sprite('#fff0c4', 2.0, 2.4, 0.55, 0.5, -0.3);

    // drifting motes in the sunlight
    const N = 70, mp = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { mp[i * 3] = -2 + Math.random() * 3.4; mp[i * 3 + 1] = 0.3 + Math.random() * 2.8; mp[i * 3 + 2] = -1.5 + Math.random() * 2.5; }
    const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.BufferAttribute(mp, 3));
    const motes = new THREE.Points(mg, new THREE.PointsMaterial({ color: '#fff4d4', map: tex, size: 0.06, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending })); world.add(motes);

    const cur = { light: 0.5, tap: 0, pl: 0, pr: 0, shelf: [0, 0, 0, 0], tw: 0, ts: 0, door: 0, open: 0, lit: [0, 0, 0], pulse: 0 };
    const camPos = new THREE.Vector3(...SHOTS.room.pos), camLook = new THREE.Vector3(...SHOTS.room.look), wantPos = new THREE.Vector3(), wantLook = new THREE.Vector3();
    const resize = () => { const w = el.clientWidth || 1, h = el.clientHeight || 1; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w / h < 0.8 ? 62 : 46; camera.updateProjectionMatrix(); };
    resize(); const ro = new ResizeObserver(resize); ro.observe(el);

    let raf = 0, last = performance.now(), t = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
      const T = api.current.t, k = (r: number) => Math.min(1, dt * (reduce ? 10 : r));
      cur.light += (T.light - cur.light) * k(1.2);
      cur.tap += ((T.tap ? 1 : 0) - cur.tap) * k(2);
      cur.pl += ((T.panels >= 1 ? 1 : 0) - cur.pl) * k(1.4); cur.pr += ((T.panels >= 2 ? 1 : 0) - cur.pr) * k(1.4);
      cur.shelf = cur.shelf.map((v, i) => v + ((i < T.shelf ? 1 : 0) - v) * k(2.2));
      cur.tw += ((T.tags >= 1 ? 1 : 0) - cur.tw) * k(1.6); cur.ts += ((T.tags >= 2 ? 1 : 0) - cur.ts) * k(1.6);
      cur.door += (T.door - cur.door) * k(1.1);
      cur.open += ((T.matOpen ? 1 : 0) - cur.open) * k(0.9);
      cur.lit = cur.lit.map((v, i) => v + ((i < T.roomLit ? 1 : 0) - v) * k(1.5));
      api.current.pulse *= 1 - k(2.2);
      const p = api.current.pulse, L = cur.light;

      amb.intensity = 0.55 + 0.6 * L + 0.25 * p; sun.intensity = 0.5 + 1.1 * L;
      (win.material as THREE.MeshBasicMaterial).color.setRGB(0.9 + 0.08 * L, 0.84 + 0.08 * L, 0.68 + 0.12 * L);
      (shaft.material as THREE.SpriteMaterial).opacity = 0.1 + 0.22 * L + 0.2 * cur.lit[2];
      (stream.material as THREE.MeshStandardMaterial).opacity = 0.75 * cur.tap; stream.scale.y = Math.max(0.001, smooth(cur.tap));
      (drop.material as THREE.SpriteMaterial).opacity = cur.tap * (0.55 + 0.45 * Math.abs(Math.sin(t * 1.6))) + 0.6 * cur.lit[0];
      (panelL.material as THREE.MeshBasicMaterial).opacity = 0.42 * cur.pl; (panelR.material as THREE.MeshBasicMaterial).opacity = 0.42 * cur.pr;
      garment.scale.setScalar(Math.max(0.001, 0.4 + 0.6 * Math.max(cur.pr, cur.open * 0))); cloth.scale.setScalar(Math.max(0.001, 0.4 + 0.6 * cur.pr));
      shelf.forEach((g, i) => { const s = smooth(cur.shelf[i]); g.scale.setScalar(Math.max(0.001, s)); g.position.y = 1.58 + (1 - s) * 0.15; });
      (tagWater.material as THREE.SpriteMaterial).opacity = 0.7 * cur.tw; (tagStone.material as THREE.SpriteMaterial).opacity = 0.7 * cur.ts;
      const glowOn = Math.min(1, cur.door) + 0.6 * cur.lit[1];
      (doorGlow.material as THREE.SpriteMaterial).opacity = 0.5 * glowOn * (reduce ? 1 : 0.9 + 0.1 * Math.sin(t * 1.3));
      doorPivot.rotation.y = smooth(Math.max(0, cur.door - 1)) * 0.5;
      (gap.material as THREE.MeshBasicMaterial).opacity = smooth(Math.max(0, cur.door - 1));
      doorM.emissive.setRGB(0.12 * glowOn, 0.07 * glowOn, 0.02 * glowOn); void door;
      const o = smooth(cur.open);
      folded.scale.setScalar(Math.max(0.001, 1 - o)); open.scale.set(1, 1, Math.max(0.001, o));
      (matGlow.material as THREE.SpriteMaterial).opacity = 0.45 * o + 0.15 * p;
      for (let i = 0; i < N; i++) { mp[i * 3 + 1] += dt * 0.05; mp[i * 3] += Math.sin(t * 0.4 + i) * 0.0008; if (mp[i * 3 + 1] > 3.2) mp[i * 3 + 1] = 0.3; }
      mg.attributes.position.needsUpdate = true;

      const sh = SHOTS[T.focus] ?? SHOTS.room;
      wantPos.set(...sh.pos); wantLook.set(...sh.look);
      camPos.lerp(wantPos, k(0.8)); camLook.lerp(wantLook, k(0.8));
      camera.position.set(camPos.x + api.current.tx * 0.12, camPos.y - api.current.ty * 0.06, camPos.z);
      camera.lookAt(camLook);
      renderer.render(world, camera);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); el.removeChild(renderer.domElement); };
  }, []);

  return <div ref={host} style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#e9dfc9' }} aria-hidden />;
});
