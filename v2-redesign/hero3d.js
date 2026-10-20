// Freshora hero 3D scene: sculpted molar (SDF + surface nets), swept toothbrush, floating bubbles.
const THREE_URL = "https://unpkg.com/three@0.184.0/build/three.module.js";

// ---------- SDF helpers ----------
const len3 = (x, y, z) => Math.sqrt(x * x + y * y + z * z);
const smin = (a, b, k) => { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; };
const smax = (a, b, k) => -smin(-a, -b, k);
const ellip = (x, y, z, rx, ry, rz) => { const k0 = len3(x / rx, y / ry, z / rz), k1 = len3(x / (rx * rx), y / (ry * ry), z / (rz * rz)); return k1 === 0 ? -Math.min(rx, ry, rz) : (k0 * (k0 - 1)) / k1; };
function cone(px, py, pz, ax, ay, az, bx, by, bz, r1, r2) {
  const bax = bx - ax, bay = by - ay, baz = bz - az, pax = px - ax, pay = py - ay, paz = pz - az;
  const t = Math.min(1, Math.max(0, (pax * bax + pay * bay + paz * baz) / (bax * bax + bay * bay + baz * baz)));
  return len3(pax - bax * t, pay - bay * t, paz - baz * t) - (r1 + (r2 - r1) * t * t * 0.6 - (r1 - r2) * t * 0.4);
}
function capX(x, y, z, cy, cz, hl, r) { const cx = Math.max(-hl, Math.min(hl, x)); return len3(x - cx, y - cy, z - cz) - r; }
function capZ(x, y, z, cy, cx, hl, r) { const cz = Math.max(-hl, Math.min(hl, z)); return len3(x - cx, y - cy, z - cz) - r; }

// Lower molar: four cusps, central fossa, cross grooves, cervical waist, two splayed roots.
function toothSDF(x, y, z) {
  let d = ellip(x, y - 0.4, z, 0.74, 0.5, 0.64);
  let c = 1e9;
  for (const [sx, sz, r] of [[-1, -1, 0.31], [1, -1, 0.3], [-1, 1, 0.3], [1, 1, 0.29]]) c = Math.min(c, len3(x - sx * 0.3, y - 0.74 + (r < 0.3 ? 0.02 : 0), z - sz * 0.26) - r);
  d = smin(d, c, 0.28);
  d = smax(d, -(len3(x, y - 1.06, z) - 0.3), 0.14);
  d = smax(d, -capX(x, y, z, 0.96, 0, 0.42, 0.045), 0.09);
  d = smax(d, -capZ(x, y, z, 0.96, 0, 0.36, 0.045), 0.09);
  d = smin(d, ellip(x, y + 0.02, z, 0.58, 0.32, 0.5), 0.22);
  for (const s of [-1, 1]) {
    const bend = 0.09 * Math.sin(Math.min(1.3, Math.max(0, -y)) * 2.2) * s;
    d = smin(d, cone(x - bend, y, z, s * 0.25, 0.02, 0, s * 0.36, -1.28, s * 0.03, 0.27, 0.05), 0.2);
  }
  return d;
}

// Surface nets: smooth, watertight mesh from an SDF, normals from the field gradient.
function surfaceNets(THREE, f, min, max, h) {
  const nx = Math.ceil((max[0] - min[0]) / h) + 1, ny = Math.ceil((max[1] - min[1]) / h) + 1, nz = Math.ceil((max[2] - min[2]) / h) + 1;
  const F = new Float32Array(nx * ny * nz), I = (i, j, k) => i + nx * (j + ny * k);
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) F[I(i, j, k)] = f(min[0] + i * h, min[1] + j * h, min[2] + k * h);
  const cx = nx - 1, cy = ny - 1, cz = nz - 1, C = new Int32Array(cx * cy * cz).fill(-1), CI = (i, j, k) => i + cx * (j + cy * k);
  const pos = [], v = new Float32Array(8);
  for (let k = 0; k < cz; k++) for (let j = 0; j < cy; j++) for (let i = 0; i < cx; i++) {
    let mask = 0;
    for (let c = 0; c < 8; c++) { v[c] = F[I(i + (c & 1), j + ((c >> 1) & 1), k + ((c >> 2) & 1))]; if (v[c] < 0) mask |= 1 << c; }
    if (mask === 0 || mask === 255) continue;
    let sx = 0, sy = 0, sz = 0, n = 0;
    for (let c = 0; c < 8; c++) for (const bit of [1, 2, 4]) {
      if (c & bit) continue; const b = c | bit;
      if ((v[c] < 0) === (v[b] < 0)) continue;
      const t = v[c] / (v[c] - v[b]);
      sx += (c & 1) + (bit === 1 ? t : 0); sy += ((c >> 1) & 1) + (bit === 2 ? t : 0); sz += ((c >> 2) & 1) + (bit === 4 ? t : 0); n++;
    }
    C[CI(i, j, k)] = pos.length / 3;
    pos.push(min[0] + (i + sx / n) * h, min[1] + (j + sy / n) * h, min[2] + (k + sz / n) * h);
  }
  const idx = [];
  const quad = (a, b, c, d, flip) => { if (a < 0 || b < 0 || c < 0 || d < 0) return; if (flip) idx.push(a, c, b, a, d, c); else idx.push(a, b, c, a, c, d); };
  for (let k = 1; k < cz; k++) for (let j = 1; j < cy; j++) for (let i = 0; i < cx; i++) { const a = F[I(i, j, k)] < 0; if (a === (F[I(i + 1, j, k)] < 0)) continue; quad(C[CI(i, j - 1, k - 1)], C[CI(i, j, k - 1)], C[CI(i, j, k)], C[CI(i, j - 1, k)], !a); }
  for (let k = 1; k < cz; k++) for (let j = 0; j < cy; j++) for (let i = 1; i < cx; i++) { const a = F[I(i, j, k)] < 0; if (a === (F[I(i, j + 1, k)] < 0)) continue; quad(C[CI(i - 1, j, k - 1)], C[CI(i - 1, j, k)], C[CI(i, j, k)], C[CI(i, j, k - 1)], !a); }
  for (let k = 0; k < cz; k++) for (let j = 1; j < cy; j++) for (let i = 1; i < cx; i++) { const a = F[I(i, j, k)] < 0; if (a === (F[I(i, j, k + 1)] < 0)) continue; quad(C[CI(i - 1, j - 1, k)], C[CI(i, j - 1, k)], C[CI(i, j, k)], C[CI(i - 1, j, k)], !a); }
  // normals from gradient; fix any inconsistent winding against them
  const nrm = new Float32Array(pos.length), e = h * 0.5;
  for (let p = 0; p < pos.length; p += 3) {
    const x = pos[p], y = pos[p + 1], z = pos[p + 2];
    let gx = f(x + e, y, z) - f(x - e, y, z), gy = f(x, y + e, z) - f(x, y - e, z), gz = f(x, y, z + e) - f(x, y, z - e);
    const l = Math.hypot(gx, gy, gz) || 1; nrm[p] = gx / l; nrm[p + 1] = gy / l; nrm[p + 2] = gz / l;
  }
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
    const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2], vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2];
    const fx = uy * vz - uz * vy, fy = uz * vx - ux * vz, fz = ux * vy - uy * vx;
    if (fx * (nrm[a] + nrm[b] + nrm[c]) + fy * (nrm[a + 1] + nrm[b + 1] + nrm[c + 1]) + fz * (nrm[a + 2] + nrm[b + 2] + nrm[c + 2]) < 0) { const s = idx[t + 1]; idx[t + 1] = idx[t + 2]; idx[t + 2] = s; }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.BufferAttribute(nrm, 3));
  g.setIndex(idx);
  return g;
}

// Sweep an elliptical section along y with a keyed width/depth profile (closed, smooth ends).
function sweep(THREE, keys, L, curveZ, scaleFn, t0 = 0, t1 = 1, segs = 180, rad = 48) {
  const prof = (t) => {
    let i = 0; while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
    const [ta, wa, da] = keys[i], [tb, wb, db] = keys[i + 1], u = Math.min(1, Math.max(0, (t - ta) / (tb - ta))), s = u * u * (3 - 2 * u);
    return [wa + (wb - wa) * s, da + (db - da) * s];
  };
  const pos = [], idx = [];
  for (let i = 0; i <= segs; i++) {
    const t = t0 + (t1 - t0) * (i / segs), [w, d] = prof(t), k = scaleFn ? scaleFn((i / segs)) : 1;
    for (let j = 0; j <= rad; j++) {
      const a = (j / rad) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      const sc = Math.sign(c) * Math.pow(Math.abs(c), 0.85), ss = Math.sign(s) * Math.pow(Math.abs(s), 0.85);
      pos.push(sc * w * k, t * L, curveZ(t) + ss * d * k);
    }
  }
  for (let i = 0; i < segs; i++) for (let j = 0; j < rad; j++) { const a = i * (rad + 1) + j, b = a + rad + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}

export async function mount(canvas, opts = {}) {
  const THREE = await import(THREE_URL);
  const state = { autorotate: opts.autorotate ?? true, brush: opts.brush ?? true, bubbles: opts.bubbles ?? true };

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0.3, 7.6);

  // Studio environment: soft overhead box, side strips, teal bounce from below.
  const pm = new THREE.PMREMGenerator(renderer);
  const env = new THREE.Scene();
  env.add(new THREE.Mesh(new THREE.SphereGeometry(30, 32, 16), new THREE.MeshBasicMaterial({ color: 0x0d2b3a, side: THREE.BackSide })));
  const panel = (c, i, w, h, x, y, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m); };
  panel(0xffffff, 4.5, 10, 10, 0, 12, 3);
  panel(0xffffff, 3.2, 3, 12, -10, 2, 6);
  panel(0xffffff, 1.6, 2, 12, 10, 2, 6);
  panel(0x2bc1b1, 2.2, 6, 12, 9, 0, -6);
  panel(0x158c96, 1.4, 16, 4, 0, -10, 0);
  panel(0xffffff, 1.2, 6, 4, 0, 2, 12);
  scene.environment = pm.fromScene(env, 0.03).texture;

  const key = new THREE.DirectionalLight(0xfff8f0, 1.6); key.position.set(-3, 5, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0x4fd3c4, 2.4); rim.position.set(4, 2, -4); scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x12435c, 0.35));

  const enamel = new THREE.MeshPhysicalMaterial({ name: "enamel", vertexColors: true, roughness: 0.32, metalness: 0, clearcoat: 0.85, clearcoatRoughness: 0.18, ior: 1.62, specularIntensity: 0.9, sheen: 0.35, sheenRoughness: 0.6, sheenColor: new THREE.Color(0xffffff) });
  const plastic = new THREE.MeshPhysicalMaterial({ name: "handle_teal", color: 0x158c96, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.06, ior: 1.5 });
  const rubber = new THREE.MeshStandardMaterial({ name: "grip_navy", color: 0x12435c, roughness: 0.78 });
  const bristleMint = new THREE.MeshPhysicalMaterial({ name: "bristle_mint", color: 0x2bc1b1, roughness: 0.35, transmission: 0.25, thickness: 0.2 });
  const bristleWhite = new THREE.MeshPhysicalMaterial({ name: "bristle_white", color: 0xf4fbfa, roughness: 0.35, transmission: 0.25, thickness: 0.2 });
  const glass = new THREE.MeshPhysicalMaterial({ name: "bubble", color: 0xbff3ec, roughness: 0, metalness: 0, clearcoat: 1, clearcoatRoughness: 0, iridescence: 0.8, iridescenceIOR: 1.3, envMapIntensity: 2.2, transparent: true, opacity: 0.32, depthWrite: false });

  const root = new THREE.Group(); scene.add(root);

  // Tooth
  const tg = surfaceNets(THREE, toothSDF, [-0.98, -1.45, -0.86], [0.98, 1.16, 0.86], 0.02);
  const p = tg.attributes.position, col = new Float32Array(p.count * 3), crownC = new THREE.Color(0xf8f7f2), rootC = new THREE.Color(0xe6d7b8), tmp = new THREE.Color();
  for (let i = 0; i < p.count; i++) { const y = p.getY(i), u = Math.min(1, Math.max(0, (0.06 - y) / 0.4)); tmp.copy(crownC).lerp(rootC, u * u * (3 - 2 * u)); col.set([tmp.r, tmp.g, tmp.b], i * 3); }
  tg.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const tooth = new THREE.Mesh(tg, enamel); tooth.name = "molar";
  const toothPivot = new THREE.Group(); toothPivot.name = "tooth"; toothPivot.add(tooth);
  tooth.rotation.x = 0.28; toothPivot.position.set(0.15, 0.1, 0);
  root.add(toothPivot);

  // Toothbrush
  const L = 3.4, cz = (t) => 0.05 * Math.sin(Math.PI * t) - (t > 0.78 ? 0.03 * ((t - 0.78) / 0.22) : 0);
  const keys = [[0, 0.015, 0.015], [0.012, 0.085, 0.065], [0.05, 0.112, 0.082], [0.28, 0.128, 0.09], [0.48, 0.105, 0.078], [0.62, 0.068, 0.056], [0.72, 0.046, 0.042], [0.79, 0.05, 0.042], [0.83, 0.092, 0.05], [0.965, 0.09, 0.05], [0.993, 0.05, 0.04], [1, 0.01, 0.01]];
  const brush = new THREE.Group(); brush.name = "toothbrush";
  const handle = new THREE.Mesh(sweep(THREE, keys, L, cz), plastic); handle.name = "handle"; brush.add(handle);
  const grip = new THREE.Mesh(sweep(THREE, keys, L, cz, (u) => 0.97 + 0.07 * Math.sin(Math.PI * u), 0.1, 0.46, 90, 48), rubber); grip.name = "grip"; brush.add(grip);
  const tuft = new THREE.CapsuleGeometry(0.021, 0.17, 4, 12); tuft.rotateX(Math.PI / 2);
  const spots = [];
  for (let r = 0; r < 11; r++) for (let c = 0; c < 4; c++) {
    if ((r === 0 || r === 10) && (c === 0 || c === 3)) continue;
    const t = 0.845 + r * 0.0108, x = (c - 1.5) * 0.042, wave = 0.025 * Math.sin(r * 0.9) + (c === 0 || c === 3 ? 0.02 : 0);
    spots.push({ x, y: t * L, z: cz(t) + 0.05 + 0.1 + wave, mint: c === 0 || c === 3 || r % 4 === 0 });
  }
  const m4 = new THREE.Matrix4();
  for (const [mat, flag, name] of [[bristleMint, true, "bristles_mint"], [bristleWhite, false, "bristles_white"]]) {
    const list = spots.filter((s) => s.mint === flag), im = new THREE.InstancedMesh(tuft, mat, list.length); im.name = name;
    list.forEach((s, i) => im.setMatrixAt(i, m4.makeTranslation(s.x, s.y, s.z)));
    brush.add(im);
  }
  brush.position.set(1.35, -1.85, -0.9); brush.rotation.set(0.15, -0.55, -0.42);
  root.add(brush);

  // Bubbles
  const bubbles = new THREE.Group(); bubbles.name = "bubbles";
  const bGeo = new THREE.SphereGeometry(1, 40, 28), seeds = [];
  for (let i = 0; i < 11; i++) {
    const m = new THREE.Mesh(bGeo, glass); m.name = `bubble_${i + 1}`;
    seeds.push({ x: (Math.random() - 0.5) * 4.4, z: (Math.random() - 0.5) * 2 - 0.2, r: 0.04 + Math.random() * 0.13, off: Math.random() * 6, sp: 0.1 + Math.random() * 0.15 });
    bubbles.add(m);
  }
  root.add(bubbles);

  // Interaction
  let px = 0, py = 0, spin = -0.5, vel = 0, dragging = false, lastX = 0;
  const el = canvas;
  const onMove = (e) => { const r = el.getBoundingClientRect(); px = ((e.clientX - r.left) / r.width - 0.5) * 2; py = ((e.clientY - r.top) / r.height - 0.5) * 2; if (dragging) { vel = (e.clientX - lastX) * 0.012; spin += vel; lastX = e.clientX; } };
  const onDown = (e) => { dragging = true; lastX = e.clientX; el.style.cursor = "grabbing"; };
  const onUp = () => { dragging = false; el.style.cursor = "grab"; };
  el.style.cursor = "grab"; el.style.touchAction = "pan-y";
  window.addEventListener("pointermove", onMove); el.addEventListener("pointerdown", onDown); window.addEventListener("pointerup", onUp);

  const resize = () => { const w = el.clientWidth || 1, h = el.clientHeight || 1; renderer.setSize(w, h, false); camera.aspect = w / h; camera.position.z = w / h < 0.9 ? 9.2 : 7.6; camera.updateProjectionMatrix(); };
  const ro = new ResizeObserver(resize); ro.observe(el); resize();

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clock = new THREE.Clock();
  let raf = 0, t = 0;
  const loop = () => {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), 0.05); if (!reduce) t += dt;
    if (!dragging) { vel *= 0.94; spin += vel + (state.autorotate && !reduce ? dt * 0.3 : 0); }
    toothPivot.rotation.y = spin;
    toothPivot.position.y = 0.1 + Math.sin(t * 1.1) * 0.07;
    toothPivot.rotation.z = Math.sin(t * 0.7) * 0.04;
    brush.visible = state.brush;
    brush.position.y = -1.85 + Math.sin(t * 0.9 + 1.4) * 0.08;
    brush.rotation.y = -0.55 + Math.sin(t * 0.5) * 0.1;
    bubbles.visible = state.bubbles;
    seeds.forEach((s, i) => { const m = bubbles.children[i], y = ((t * s.sp + s.off) % 6) - 3; m.position.set(s.x + Math.sin(t + s.off) * 0.1, y, s.z); m.scale.setScalar(s.r * Math.min(1, (3 - Math.abs(y)) * 1.5)); });
    root.rotation.y += (px * 0.22 - root.rotation.y) * 0.05;
    root.rotation.x += (py * 0.1 - root.rotation.x) * 0.05;
    renderer.render(scene, camera);
  };
  loop();

  return {
    update(o) { Object.assign(state, o); },
    dispose() { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); el.removeEventListener("pointerdown", onDown); renderer.dispose(); pm.dispose(); },
  };
}
