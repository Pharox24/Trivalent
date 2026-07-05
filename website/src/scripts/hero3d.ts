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
  const host = document.querySelector<HTMLElement>('.hero-visual');
  const canvas = document.querySelector<HTMLCanvasElement>('.hero-mol3d');
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

  scene.add(new THREE.AmbientLight(0xffffff, 0.25));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(3, 4, 5);
  scene.add(key);

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

  const bondMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#0d6b6b'),
    roughness: 0.18,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    envMapIntensity: 1.2,
  });
  const atomMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#eef4f4'),
    roughness: 0.22,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.15,
    envMapIntensity: 1.0,
  });
  const labelAtomMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#10151c'),
    roughness: 0.28,
    metalness: 0.9,
    envMapIntensity: 1.1,
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
    const rect = canvas.getBoundingClientRect();
    W = rect.width || 1;
    H = rect.height || 1;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener('resize', resize);

  const steer = { x: 0, y: 0, tx: 0, ty: 0 };
  const onMove = (e: PointerEvent) => {
    steer.tx = (e.clientX / innerWidth - 0.5) * 0.7;
    steer.ty = (e.clientY / innerHeight - 0.5) * 0.45;
  };
  window.addEventListener('pointermove', onMove, { passive: true });

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

    steer.x += (steer.tx - steer.x) * 0.04;
    steer.y += (steer.ty - steer.y) * 0.04;
    group.rotation.y = now / 12000 + steer.x;
    group.rotation.x = -0.32 + Math.sin(now / 9000) * 0.08 + steer.y;

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
