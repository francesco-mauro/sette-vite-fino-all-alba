// I gruppi che restano gruppi: lo stormo di piccioni, lo sciame di zanzare, la fila di pantegane.
// Prima ogni nemico, appena nato, inseguiva il gatto per conto suo: i gruppi si scioglievano e da tutti i lati
// finivano in una palla sola (Francesco, 13 novembre 2026: «le orde di nemici sarebbe meglio se spawnassero in
// gruppi di nemici, tutti omogenei ognuno con il suo comportamtneo»). Adesso il gruppo ha un centro che si muove
// a modo suo, e ogni nemico tiene il suo posto intorno al centro. Logica pura, senza Phaser: la scena calcola i
// posti a ogni fotogramma e applica la velocità.
import type { Vec } from "./movement";

const STILL: Vec = { x: 0, y: 0 };
// l'angolo d'oro: girando ogni volta di tanto, i punti si spargono senza mai allinearsi
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

// centroid: il centro del gruppo, la media dei punti. Fermo nell'origine se il gruppo è vuoto.
export function centroid(points: readonly Vec[]): Vec {
  if (points.length === 0) return STILL;
  let x = 0;
  let y = 0;
  for (const p of points) {
    x += p.x;
    y += p.y;
  }
  return { x: x / points.length, y: y / points.length };
}

// flockSlot: il posto del piccione numero `index` (da 0) nello stormo, rispetto al centro: a spirale, come i semi
// del girasole, in un mucchietto tondo e ordinato. Con 0,65 i vicini stanno ad almeno `spacing` l'uno dall'altro e
// venti piccioni in un cerchio di raggio meno di tre `spacing` (misurato il 13 novembre 2026). Serve anche per far
// nascere vicini i nemici di ogni gruppo, prima che prendano la loro forma.
export function flockSlot(index: number, spacing: number): Vec {
  const r = 0.65 * spacing * Math.sqrt(index + 0.5);
  const a = index * GOLDEN_ANGLE;
  return { x: Math.cos(a) * r, y: Math.sin(a) * r };
}

// groupRadius: quanto è largo dal centro un gruppo di `size` nato con flockSlot: la distanza del posto più lontano,
// che è l'ultimo della spirale. La scena fa nascere il centro così più in fuori, perché nessuno spunti in vista.
export function groupRadius(size: number, spacing: number): number {
  return size <= 0 ? 0 : 0.65 * spacing * Math.sqrt(size - 1 + 0.5);
}

// swarmSlot: il posto della zanzara numero `index` nello sciame all'istante `t`: gira intorno al centro, a una
// distanza sua tra metà `radius` e `radius`, un giro ogni `periodMs`. Una sì e una no girano al contrario, così lo
// sciame ronza invece di ruotare come una ruota.
export function swarmSlot(index: number, t: number, radius: number, periodMs: number): Vec {
  const r = radius * (0.5 + 0.5 * ((index * 0.6180339887) % 1));
  const turn = index % 2 === 0 ? 1 : -1;
  const a = index * GOLDEN_ANGLE + (turn * 2 * Math.PI * t) / periodMs;
  return { x: Math.cos(a) * r, y: Math.sin(a) * r };
}

// trailTarget: nella fila di pantegane, il posto di quella in `me` dietro a quella davanti, in `ahead`: sulla linea
// tra le due, a `spacing` da quella davanti. Così la fila segue la prima come un serpente, anche quando gira.
export function trailTarget(ahead: Vec, me: Vec, spacing: number): Vec {
  const dx = me.x - ahead.x;
  const dy = me.y - ahead.y;
  const d = Math.hypot(dx, dy);
  if (d === 0) return { x: ahead.x, y: ahead.y };
  return { x: ahead.x + (dx / d) * spacing, y: ahead.y + (dy / d) * spacing };
}

// groupPushes: le spinte tra gruppi, come quelle tra nemici (separation.ts) ma tra gruppi interi. Due gruppi si
// spingono quando i loro centri sono più vicini della somma dei raggi più `gap`: forte quando sono uno sopra
// l'altro, zero al limite. Senza, tutti i gruppi arrivano sul gatto e tornano una palla sola; con le spinte gli
// stanno intorno più staccati. Ogni spinta è lunga al massimo 1: la scena la moltiplica per la velocità.
// Due centri nello stesso punto si separano lungo l'orizzontale, il primo a sinistra.
export function groupPushes(centers: readonly Vec[], radii: readonly number[], gap: number): Vec[] {
  const out = centers.map(() => ({ x: 0, y: 0 }));
  for (let i = 0; i < centers.length; i++) {
    for (let j = i + 1; j < centers.length; j++) {
      const limit = radii[i] + radii[j] + gap;
      const dx = centers[i].x - centers[j].x;
      const dy = centers[i].y - centers[j].y;
      const d = Math.hypot(dx, dy);
      if (d >= limit) continue;
      const ux = d === 0 ? -1 : dx / d;
      const uy = d === 0 ? 0 : dy / d;
      const push = 1 - d / limit;
      out[i].x += ux * push;
      out[i].y += uy * push;
      out[j].x -= ux * push;
      out[j].y -= uy * push;
    }
  }
  for (const v of out) {
    const len = Math.hypot(v.x, v.y);
    if (len > 1) {
      v.x /= len;
      v.y /= len;
    }
  }
  return out;
}

// followSlot: la velocità di un nemico che tiene il suo posto nel gruppo. Va con il gruppo (`groupVelocity`) e in
// più rincorre il suo posto, tanto più forte quanto più è lontano (`pull`, per secondo: 3 vuol dire che a 10 pixel
// dal posto corre 30 pixel al secondo in più verso il posto). Mai oltre `maxSpeed`: chi è rimasto indietro
// recupera, ma non vola.
export function followSlot(pos: Vec, target: Vec, groupVelocity: Vec, maxSpeed: number, pull: number): Vec {
  const x = groupVelocity.x + (target.x - pos.x) * pull;
  const y = groupVelocity.y + (target.y - pos.y) * pull;
  const len = Math.hypot(x, y);
  if (len <= maxSpeed) return { x, y };
  return { x: (x / len) * maxSpeed, y: (y / len) * maxSpeed };
}
