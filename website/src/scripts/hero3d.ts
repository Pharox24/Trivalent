// Desktop hero centerpiece: the C60 molecule rendered with real materials —
// polished teal ceramic-glass bonds, porcelain atoms, dark-metal labeled
// atoms — lit by a studio environment. Three.js is imported lazily so this
// chunk only ever loads on fine-pointer desktops; phones keep the 2D canvas
// version and no-JS keeps the static SVG.
import { c60, assemblyOrder, labelIndices, LABELS, type Vec3 } from '../data/molecule3d';
import { prefersReduced, isTouch } from './motion';

let cleanup: (() => void) | null = null;

// Returns true when this renderer owns the hero (or the page has no hero);
// false tells the caller to fall back to the 2D canvas version.
export async function initHero3D(): Promise<boolean> {
  const canvas = document.querySelector<HTMLCanvasElement>('.hero-mol3d');
  // Labels live in the moving molecule box so they travel with it along the path.
  const host = canvas?.parentElement as HTMLElement | null;
  if (!host || !canvas) return true;
  if (prefersReduced()) return true; // static SVG stays
  if (isTouch()) return false; // 2D canvas path

  const THREE = await import('three');
  const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
  if (!document.contains(canvas)) return true; // page swapped during import

  let renderer: InstanceType<typeof THREE.WebGLRenderer>;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch {
    return false;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0, 4.4);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;

  // Neutral studio rig for polished metal: a warm-white key upper-right, a cool
  // white rim from behind-left for a steel edge, and a soft front fill. The
  // chrome look itself comes mostly from the reflected environment.
  scene.add(new THREE.AmbientLight(0xffffff, 0.32));
  const key = new THREE.DirectionalLight(0xffffff, 1.45);
  key.position.set(3, 4, 5);
  const rim = new THREE.DirectionalLight(0xdce8ff, 1.15);
  rim.position.set(-4, 1.5, -3.5);
  const fill = new THREE.PointLight(0xffffff, 0.7, 26);
  fill.position.set(-3, -2, 4);
  scene.add(key, rim, fill);

  const { verts, edges } = c60();
  const order = assemblyOrder(verts.length, edges);
  const edgeSlot = new Array(edges.length).fill(0);
  order.forEach((ei, slot) => (edgeSlot[ei] = slot));
  const nodeSlot = verts.map((_, vi) =>
    Math.min(...edges.map((e, i) => (e[0] === vi || e[1] === vi ? edgeSlot[i] : Infinity)))
  );
  const labeled = labelIndices(verts);
  const labeledSet = new Set(labeled);

  const group = new THREE.Group();
  scene.add(group);

  // Polished gunmetal bonds — mirror-metal, so most of the look is reflection.
  const bondMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#78818c'),
    metalness: 1,
    roughness: 0.22,
    clearcoat: 1,
    clearcoatRoughness: 0.16,
    envMapIntensity: 1.7,
    emissive: new THREE.Color('#aeb9c7'), // cool steel — proximity flare only
    emissiveIntensity: 0,
  });
  // Porcelain-chrome atoms: bright, near-white, softly metallic to pop off bonds.
  const atomMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#f4f7f9'),
    metalness: 0.55,
    roughness: 0.12,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.5,
  });
  // Near-black polished accent nodes.
  const labelAtomMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#0c0f14'),
    metalness: 1,
    roughness: 0.3,
    envMapIntensity: 1.4,
  });

  const bonds = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.014, 0.014, 1, 12, 1, true),
    bondMat,
    edges.length
  );
  const plainIdx = verts.map((_, i) => i).filter((i) => !labeledSet.has(i));
  const atoms = new THREE.InstancedMesh(new THREE.SphereGeometry(0.036, 24, 16), atomMat, plainIdx.length);
  const labelAtoms = new THREE.InstancedMesh(new THREE.SphereGeometry(0.055, 28, 20), labelAtomMat, labeled.length);
  group.add(bonds, atoms, labelAtoms);

  // HTML overlay labels (crisp text, no i18n needed — chemical formulas)
  const labelEls = labeled.map((_, li) => {
    const el = document.createElement('span');
    el.className = 'mol3d-label';
    el.textContent = LABELS[li];
    host.appendChild(el);
    return el;
  });

  let W = 0, H = 0;
  const resize = () => {
    // Layout size (ignores the dock transform) so the render buffer stays
    // full-res even while the molecule is scaled down in the corner.
    W = canvas.offsetWidth || 1;
    H = canvas.offsetHeight || 1;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener('resize', resize);

  // Pointer in viewport px; proximity to the molecule's (moving) on-screen box
  // drives the "come alive" reaction. Off-screen sentinel until first move.
  let mouseX = -1e5, mouseY = -1e5;
  const onMove = (e: PointerEvent) => { mouseX = e.clientX; mouseY = e.clientY; };
  const onLeave = () => { mouseX = -1e5; mouseY = -1e5; };
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerleave', onLeave, { passive: true });

  // Eased motion state
  const lean = { x: 0, y: 0 };
  let prox = 0; // 0 far → 1 cursor at centre
  let rotY = 0; // accumulated spin
  let last = 0;

  let visible = true;
  const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
  io.observe(canvas);

  const ASSEMBLY_MS = 2400;
  const WAVE = 14;
  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
  const backOut = (t: number) => {
    const c = 1.70158;
    return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
  };

  const dummy = new THREE.Object3D();
  const up = new THREE.Vector3(0, 1, 0);
  const va = new THREE.Vector3();
  const vb = new THREE.Vector3();
  const dir = new THREE.Vector3();
  const world = new THREE.Vector3();
  const vec = (v: Vec3) => ({ x: v[0], y: v[1], z: v[2] });

  let start = 0;
  let raf = 0;

  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    if (!visible) return;
    if (!start) start = now;

    const t = Math.min(1, (now - start) / ASSEMBLY_MS);
    const wave = easeOut(t) * (order.length + WAVE);

    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;

    // Proximity to the molecule's current on-screen box — works while docked
    // too, since the box's rect reflects its live transform.
    const rect = canvas.getBoundingClientRect();
    const mcx = rect.left + rect.width / 2;
    const mcy = rect.top + rect.height / 2;
    const reach = Math.max(rect.width, rect.height) * 1.5 + 90;
    const dx = mouseX - mcx;
    const dy = mouseY - mcy;
    const targetProx = Math.max(0, 1 - Math.hypot(dx, dy) / reach);
    prox += (targetProx - prox) * 0.09;
    const e = prox * prox * (3 - 2 * prox); // smoothstep

    // Lean toward the cursor — a subtle tilt far out, an assertive turn up close.
    const nx = Math.max(-1, Math.min(1, dx / reach));
    const ny = Math.max(-1, Math.min(1, dy / reach));
    lean.x += (nx * (0.18 + e * 0.6) - lean.x) * 0.06;
    lean.y += (ny * (0.14 + e * 0.5) - lean.y) * 0.06;

    // Calm turntable: a slow, steady spin on the vertical axis with a fixed
    // tilt, plus a subtle lean toward the cursor. No perpetual tumble or float
    // — the molecule reads as a poised, engineered object on display. The spin
    // eases up a touch as the cursor closes in.
    rotY += (0.14 + e * 0.5) * dt;
    group.rotation.y = rotY + lean.x;
    group.rotation.x = -0.28 + lean.y;
    group.rotation.z = 0;
    group.position.y = 0;
    group.scale.setScalar(1 + e * 0.06);

    // Polished metal doesn't glow — but near the cursor a cool steel sheen
    // rises across the bonds, like the alloy catching the light.
    bondMat.emissiveIntensity = e * 0.4;

    for (let i = 0; i < edges.length; i++) {
      const prog = Math.max(0, Math.min(1, (wave - edgeSlot[i]) / WAVE));
      const [a, b] = edges[i];
      va.copy(vec(verts[a]) as any);
      vb.copy(vec(verts[b]) as any);
      dir.subVectors(vb, va);
      const len = dir.length();
      dir.normalize();
      dummy.position.copy(va).addScaledVector(dir, (len * prog) / 2);
      dummy.quaternion.setFromUnitVectors(up, dir);
      dummy.scale.set(1, Math.max(0.0001, len * prog), 1);
      dummy.updateMatrix();
      bonds.setMatrixAt(i, dummy.matrix);
    }
    bonds.instanceMatrix.needsUpdate = true;

    const placeAtom = (mesh: InstanceType<typeof THREE.InstancedMesh>, list: number[]) => {
      list.forEach((vi, k) => {
        const prog = Math.max(0, Math.min(1, (wave - nodeSlot[vi]) / WAVE));
        const s = prog > 0 ? Math.max(0.0001, backOut(prog)) : 0.0001;
        dummy.position.copy(vec(verts[vi]) as any);
        dummy.quaternion.identity();
        dummy.scale.setScalar(s);
        dummy.updateMatrix();
        mesh.setMatrixAt(k, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    };
    placeAtom(atoms, plainIdx);
    placeAtom(labelAtoms, labeled);

    // Project labels to screen space; fade when their atom faces away
    labeled.forEach((vi, li) => {
      world.copy(vec(verts[vi]) as any).applyQuaternion(group.quaternion);
      const facing = world.z; // toward camera when positive
      const prog = Math.max(0, Math.min(1, (wave - nodeSlot[vi]) / WAVE));
      const alpha = Math.max(0, Math.min(1, (facing - 0.15) / 0.5)) * prog;
      const el = labelEls[li];
      if (alpha <= 0.02) {
        el.style.opacity = '0';
        return;
      }
      const p = world.clone().project(camera);
      el.style.opacity = String(alpha * 0.95);
      el.style.transform = `translate(${((p.x + 1) / 2) * W + 14}px, ${((1 - p.y) / 2) * H - 22}px)`;
    });

    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(loop);
  canvas.closest('.hero')?.classList.add('molecule-live');

  cleanup = () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerleave', onLeave);
    io.disconnect();
    labelEls.forEach((el) => el.remove());
    bonds.geometry.dispose();
    atoms.geometry.dispose();
    labelAtoms.geometry.dispose();
    bondMat.dispose();
    atomMat.dispose();
    labelAtomMat.dispose();
    envTex.dispose();
    pmrem.dispose();
    renderer.dispose();
  };
  return true;
}

export function destroyHero3D() {
  cleanup?.();
  cleanup = null;
}
