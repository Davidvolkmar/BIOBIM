/* =====================================================================
   OBJETOS DEL TERRITORIO · territorio.html
   ---------------------------------------------------------------------
   El detalle cercano que hace creíble el lugar, a la manera de Messenger
   (abeto): bancas, canecas, jardineras, rejillas y tapas en el piso,
   cebras en cada ramal, señales hacia las salas, kioscos con máquina de
   bebidas, y en el jardín postes de luz con cables que cuelgan.
   Todo es geometría propia e instanciada (pocas llamadas de dibujo).
   ===================================================================== */
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function buildProps(C) {
  const { scene, toon, M, curve, LEN, sideAt, HW, DECK, GATE, SIDE, N, nearBranch, heightAt, distRiver, distToStations, START, END, t0, LOW, blockers, years } = C;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const UP = new THREE.Vector3(0, 1, 0), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), one = new THREE.Vector3(1, 1, 1);
  const flat = (hex) => new THREE.MeshBasicMaterial({ color: hex, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  const mat = {
    wood: toon(0xb3804f), bin: toon(0x3f8a5a), lid: toon(0x2c3136), shrub: toon(0x4f8a3e), shrub2: toon(0x6fa04a),
    pole: toon(0xc4beb2), cable: toon(0x23282c), ins: toon(0x7fa7b8), trafo: toon(0x8a9197), kiosk: toon(0x2f6fb0), kioskRoof: toon(0xe9e4d8),
    paint: flat(0xf2efe6), grate: flat(0x3a4046), tank: toon(0x2b2f33),
  };
  const at = (d, sg, off) => {
    const u = clamp(d / LEN), p = curve.getPointAt(u), sd = sideAt(u), t = curve.getTangentAt(u);
    return { x: p.x + sd.x * sg * off, z: p.z + sd.z * sg * off, u, sd, t, rot: Math.atan2(t.x, t.z) };
  };
  const nearPlaza = (x, z, r = 0) => Math.hypot(START.x - x, START.z - z) < 12 + r || Math.hypot(END.x - x, END.z - z) < 14 + r;
  const lampNear = (d) => { const k = (((d - 16) % 13) + 13) % 13; return k < 1.6 || k > 11.4; };
  // Instanciado a partir de una lista de matrices
  const inst = (geo, material, list, shadow = true) => {
    if (!list.length) return null;
    const im = new THREE.InstancedMesh(geo, material, list.length);
    list.forEach((mm, i) => im.setMatrixAt(i, mm));
    im.castShadow = shadow; im.receiveShadow = true; scene.add(im);
    return im;
  };
  const Mx = (x, y, z, rot = 0, s = one) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromAxisAngle(UP, rot), s);
  const box = (w, h, d, x = 0, y = 0, z = 0, rx = 0) => { const g = new THREE.BoxGeometry(w, h, d); if (rx) g.rotateX(rx); return g.translate(x, y, z); };

  /* ---------------- Mobiliario sobre la pasarela ---------------- */
  // Banca: listones de madera sobre marcos metálicos (mira hacia el centro del paseo)
  const benchWood = mergeGeometries([box(1.8, 0.05, 0.13, 0, 0.46, -0.15), box(1.8, 0.05, 0.13, 0, 0.46, 0), box(1.8, 0.05, 0.13, 0, 0.46, 0.15), box(1.8, 0.11, 0.04, 0, 0.66, -0.25, -0.18), box(1.8, 0.11, 0.04, 0, 0.82, -0.28, -0.18)]);
  const benchMetal = mergeGeometries([-0.78, 0.78].flatMap((x) => [box(0.05, 0.45, 0.05, x, 0.22, 0.17), box(0.05, 0.86, 0.05, x, 0.43, -0.22), box(0.05, 0.05, 0.44, x, 0.44, -0.02)]));
  const binG = new THREE.CylinderGeometry(0.24, 0.21, 0.82, 14).translate(0, 0.41, 0), lidG = new THREE.CylinderGeometry(0.265, 0.265, 0.07, 14).translate(0, 0.85, 0);
  const planterG = box(1.7, 0.55, 0.62, 0, 0.275, 0), shrubG = new THREE.IcosahedronGeometry(0.5, 1).scale(1.5, 0.75, 0.55).translate(0, 0.78, 0);
  const benches = [], bins = [], planters = [], shrubs = [];
  let side = 1;
  for (let d = 24; d < LEN - 10; d += LOW ? 44 : 30) {
    let dd = d; if (lampNear(dd)) dd += 3;
    side = -side;
    const P = at(dd, side, HW - 0.75);
    if (nearBranch(P.x, P.z, 4.2) || nearPlaza(P.x, P.z)) continue;
    const rot = Math.atan2(-P.sd.x * side, -P.sd.z * side);              // de frente al paseo
    const k = Math.round(d / 30) % 3;
    if (k === 0) {                                                        // banca con caneca al lado
      benches.push(Mx(P.x, DECK, P.z, rot));
      const B = at(dd + 1.5, side, HW - 0.55); bins.push(Mx(B.x, DECK, B.z));
    } else if (k === 1) {                                                 // jardinera con arbusto
      planters.push(Mx(P.x, DECK, P.z, rot)); shrubs.push(Mx(P.x, DECK, P.z, rot + Math.random() * 0.3));
    } else {                                                              // banca y jardinera juntas
      benches.push(Mx(P.x, DECK, P.z, rot));
      const Q = at(dd + 2.4, side, HW - 0.75); planters.push(Mx(Q.x, DECK, Q.z, rot)); shrubs.push(Mx(Q.x, DECK, Q.z, rot));
    }
  }
  inst(benchWood, mat.wood, benches); inst(benchMetal, M.metal, benches);
  inst(binG, mat.bin, bins); inst(lidG, mat.lid, bins);
  inst(planterG, M.conc, planters); inst(shrubG, mat.shrub, shrubs);

  /* ---------------- Piso: rejillas, tapas y cebras ---------------- */
  const grates = [], holes = [], zebra = [];
  for (let d = 9; d < LEN - 4; d += 17) for (const sg of [1, -1]) {
    const P = at(d + (sg > 0 ? 0 : 8), sg, HW - 0.42);
    if (!nearBranch(P.x, P.z, 3) && !nearPlaza(P.x, P.z)) grates.push(Mx(P.x, DECK + 0.012, P.z, P.rot));
  }
  for (let d = 30; d < LEN - 10; d += 46) { const P = at(d, 1, 1.25); if (!nearBranch(P.x, P.z, 3)) holes.push(Mx(P.x, DECK + 0.013, P.z, Math.random() * 6)); }
  const grateTex = (() => {
    const c = document.createElement("canvas"); c.width = 128; c.height = 48; const x = c.getContext("2d");
    x.fillStyle = "#4a5056"; x.fillRect(0, 0, 128, 48); x.fillStyle = "#1e2226"; for (let i = 0; i < 12; i++) x.fillRect(6 + i * 10, 6, 5, 36);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const holeTex = (() => {
    const c = document.createElement("canvas"); c.width = 128; c.height = 128; const x = c.getContext("2d");
    x.fillStyle = "#5b6166"; x.beginPath(); x.arc(64, 64, 62, 0, 7); x.fill();
    x.strokeStyle = "#353a3f"; x.lineWidth = 4; for (let r = 18; r < 60; r += 12) { x.beginPath(); x.arc(64, 64, r, 0, 7); x.stroke(); }
    for (let a = 0; a < 8; a++) { x.beginPath(); x.moveTo(64, 64); x.lineTo(64 + Math.cos(a * 0.785) * 60, 64 + Math.sin(a * 0.785) * 60); x.stroke(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  inst(new THREE.PlaneGeometry(0.95, 0.36).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: grateTex, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }), grates, false);
  inst(new THREE.CircleGeometry(0.42, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: holeTex, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }), holes, false);
  for (let i = 0; i < N; i++) {
    const u = C.US[i], t = curve.getTangentAt(u), sd = sideAt(u), rot = Math.atan2(sd.x * SIDE[i], sd.z * SIDE[i]);
    for (let k = -2; k <= 2; k++) {
      const c = GATE[i].clone().addScaledVector(t, k * 0.85).addScaledVector(sd, SIDE[i] * HW * 0.5);
      zebra.push(Mx(c.x, DECK + 0.011, c.z, rot));
    }
  }
  inst(new THREE.PlaneGeometry(0.42, HW * 0.9).rotateX(-Math.PI / 2), mat.paint, zebra, false);

  /* ---------------- Señales hacia cada sala ---------------- */
  const signTex = (i, arrowRight) => {
    const c = document.createElement("canvas"); c.width = 320; c.height = 110; const x = c.getContext("2d");
    const draw = () => {
      x.fillStyle = "#1f5f8b"; x.fillRect(0, 0, 320, 110); x.strokeStyle = "#f4f1ea"; x.lineWidth = 5; x.strokeRect(7, 7, 306, 96);
      x.fillStyle = "#f4f1ea"; x.textBaseline = "middle";
      x.font = "400 44px Bungee, 'Space Grotesk', sans-serif"; x.textAlign = arrowRight ? "left" : "right";
      x.fillText(`SALA ${String(i + 1).padStart(2, "0")}`, arrowRight ? 24 : 296, 46);
      x.font = "500 20px 'JetBrains Mono', monospace"; x.fillText(years(i), arrowRight ? 26 : 294, 84);
      // flecha
      x.beginPath(); const ax = arrowRight ? 262 : 58, s = arrowRight ? 1 : -1;
      x.moveTo(ax - s * 26, 44); x.lineTo(ax + s * 6, 44); x.lineTo(ax + s * 6, 30); x.lineTo(ax + s * 30, 55); x.lineTo(ax + s * 6, 80); x.lineTo(ax + s * 6, 66); x.lineTo(ax - s * 26, 66); x.closePath(); x.fill();
      tex.needsUpdate = true;
    };
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    draw(); if (document.fonts) document.fonts.ready.then(draw);
    return tex;
  };
  const postG = new THREE.CylinderGeometry(0.045, 0.05, 2.7, 8).translate(0, 1.35, 0);
  const signPosts = [];
  for (let i = 0; i < N; i++) {
    const u = C.US[i], t = curve.getTangentAt(u), sd = sideAt(u), right = new THREE.Vector3().crossVectors(t, UP);
    const branchRight = sd.clone().multiplyScalar(SIDE[i]).dot(right) > 0;
    const p = GATE[i].clone().addScaledVector(sd, SIDE[i] * (HW - 0.55)).addScaledVector(t, -2.6);
    signPosts.push(Mx(p.x, DECK, p.z));
    const face = new THREE.MeshBasicMaterial({ map: signTex(i, branchRight) }), back = new THREE.MeshBasicMaterial({ map: signTex(i, !branchRight) });
    const edge = toon(0x1f5f8b);
    const board = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.45, 0.05), [edge, edge, edge, edge, back, face]);
    board.position.set(p.x, DECK + 2.35, p.z); board.rotation.y = Math.atan2(t.x, t.z); board.castShadow = true; scene.add(board);
  }
  inst(postG, M.metal, signPosts);

  /* ---------------- Kioscos con máquina de bebidas ---------------- */
  const vendTex = (() => {
    const c = document.createElement("canvas"); c.width = 160; c.height = 320; const x = c.getContext("2d");
    x.fillStyle = "#2f6fb0"; x.fillRect(0, 0, 160, 320);
    x.fillStyle = "#dfe9ee"; x.fillRect(14, 40, 132, 176);
    const cols = ["#e8743a", "#c9483c", "#6f9a5b", "#ffb547", "#4f8fa8", "#f1ece2"];
    for (let r = 0; r < 5; r++) for (let k = 0; k < 5; k++) { x.fillStyle = cols[(r * 3 + k) % cols.length]; x.fillRect(22 + k * 25, 50 + r * 33, 14, 24); x.fillStyle = "#9aa7ad"; x.fillRect(18, 76 + r * 33, 124, 3); }
    x.fillStyle = "#f4f1ea"; x.font = "400 22px Bungee, sans-serif"; x.textAlign = "center"; x.fillText("TINTO", 80, 30);
    x.fillStyle = "#1b2226"; x.fillRect(22, 236, 70, 44); x.fillStyle = "#ffcf4a"; x.fillRect(106, 236, 30, 14); x.fillStyle = "#1b2226"; x.fillRect(110, 262, 22, 30);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    if (document.fonts) document.fonts.ready.then(() => { x.fillStyle = "#2f6fb0"; x.fillRect(0, 0, 160, 38); x.fillStyle = "#f4f1ea"; x.font = "400 22px Bungee, sans-serif"; x.fillText("TINTO", 80, 30); t.needsUpdate = true; });
    return t;
  })();
  const vend = (x, z, rot) => {
    const front = new THREE.MeshBasicMaterial({ map: vendTex });
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.85, 0.72), [mat.kiosk, mat.kiosk, mat.kiosk, mat.kiosk, front, mat.kiosk]);
    m.position.set(x, DECK + 0.925, z); m.rotation.y = rot; m.castShadow = true; m.receiveShadow = true; scene.add(m);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.08, 0.95), mat.kioskRoof); roof.position.set(0, 0.97, 0.08); m.add(roof);
  };
  { const p = START.clone().addScaledVector(t0, 7).addScaledVector(new THREE.Vector3(-t0.z, 0, t0.x), 6.5); vend(p.x, p.z, Math.atan2(t0.z, -t0.x)); }
  for (const i of [3, 7, 10]) {
    if (i >= N) continue;
    const u = C.US[i], sd = sideAt(u), t = curve.getTangentAt(u);
    const p = GATE[i].clone().addScaledVector(sd, -SIDE[i] * (HW - 0.55)).addScaledVector(t, 3.5);
    vend(p.x, p.z, Math.atan2(sd.x * SIDE[i], sd.z * SIDE[i]));
  }

  /* ---------------- Postes de luz y cables en el jardín ---------------- */
  const poles = [], arms = [], insul = [], trafos = [], tops = [];
  let prevRun = null;
  for (let d = 6; d < LEN; d += 30) {
    let P = null;
    for (const [sg, off] of [[1, 13], [-1, 13], [1, 18], [-1, 18]]) {
      const c = at(d, sg, off);
      if (distRiver(c.x, c.z) > 5.5 && distToStations(c.x, c.z) > 4 && !nearBranch(c.x, c.z, 5) && !nearPlaza(c.x, c.z, 4)) { P = c; break; }
    }
    if (!P) { prevRun = null; continue; }
    const g = heightAt(P.x, P.z), H = 11.5;
    poles.push(Mx(P.x, g, P.z)); blockers.push({ x: P.x, z: P.z, r: 2.2 });
    const armRot = Math.atan2(P.sd.x, P.sd.z);
    arms.push(Mx(P.x, g + H - 0.7, P.z, armRot));
    const pts = [-0.75, 0, 0.75].map((o) => new THREE.Vector3(P.x + P.sd.x * o, g + H - 0.55 + (o === 0 ? 0.35 : 0), P.z + P.sd.z * o));
    pts.forEach((p) => insul.push(Mx(p.x, p.y - 0.02, p.z)));
    if (Math.round(d / 30) % 4 === 1) trafos.push(Mx(P.x - P.t.x * 0.45, g + H - 2.6, P.z - P.t.z * 0.45));
    if (prevRun && prevRun[0].distanceTo(pts[0]) < 46) tops.push([prevRun, pts]);
    prevRun = pts;
  }
  inst(new THREE.CylinderGeometry(0.13, 0.2, 11.5, 8).translate(0, 5.75, 0), mat.pole, poles);
  inst(box(1.8, 0.12, 0.12), mat.pole, arms);
  inst(new THREE.CylinderGeometry(0.05, 0.07, 0.16, 6), mat.ins, insul, false);
  inst(new THREE.CylinderGeometry(0.28, 0.28, 0.75, 10), mat.trafo, trafos);
  // Cables con catenaria: todos en una sola geometría
  const cables = [];
  for (const [A, B] of tops) for (let k = 0; k < 3; k++) {
    const a = A[k], b = B[k], pts = [];
    for (let s = 0; s <= 12; s++) { const f = s / 12; pts.push(new THREE.Vector3().lerpVectors(a, b, f).setY(a.y + (b.y - a.y) * f - Math.sin(Math.PI * f) * (0.9 + k * 0.15))); }
    cables.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, 0.022, 3, false));
  }
  if (cables.length) { const cm = new THREE.Mesh(mergeGeometries(cables), mat.cable); scene.add(cm); }

  return { materials: Object.values(mat) };
}
