// Il passo 3 contro il blob (piano approvato da Francesco il 17 novembre 2026): i gettoni d'attacco, l'anello di
// respiro e la varietà. Al massimo pochi nemici alla volta possono toccare il gatto: gli altri non stanno fermi ma
// restano fuori da un anello intorno a lui, così il gatto si vede sempre. Ogni nemico ha una velocità e un angolo
// d'arrivo un po' suoi, così due piccioni uguali non fanno la stessa strada. In più il giro dello stormo e il
// passaggio dritto dello sciame. Logica pura, senza Phaser.
import type { Vec } from "./movement";

// Il gettone di un nemico: fino a quando lo tiene (0 se non ce l'ha) e fino a quando riposa dopo averlo lasciato.
export interface Token {
  until: number;
  rest: number;
}

export interface TokenConfig {
  // quanti gettoni ci sono
  max: number;
  // entro che distanza dal gatto si prende e si tiene
  range: number;
  // per quanto al massimo si tiene
  holdMs: number;
  // per quanto, dopo averlo lasciato, non si riprende
  restMs: number;
}

// assignTokens: i gettoni di questo fotogramma. `distances[i]` è la distanza dal gatto del nemico i, `held[i]` il suo
// gettone di prima. Chi ce l'ha lo tiene finché resta entro `range` e non è scaduto; chi lo lascia riposa per
// `restMs`. I posti liberi, fino a `max`, vanno ai più vicini entro `range` che non hanno il gettone e non riposano.
// Non tocca gli array ricevuti.
export function assignTokens(distances: readonly number[], held: readonly Token[], now: number, cfg: TokenConfig): Token[] {
  const out = held.map((t, i) => {
    if (t.until === 0) return { ...t };
    if (distances[i] <= cfg.range && now < t.until) return { ...t };
    return { until: 0, rest: now + cfg.restMs };
  });
  let free = cfg.max - out.filter((t) => t.until > 0).length;
  if (free <= 0) return out;
  const candidates = out
    .map((t, i) => ({ t, i }))
    .filter(({ t, i }) => t.until === 0 && now >= t.rest && distances[i] <= cfg.range)
    .toSorted((a, b) => distances[a.i] - distances[b.i]);
  for (const { i } of candidates) {
    if (free <= 0) break;
    out[i] = { until: now + cfg.holdMs, rest: 0 };
    free--;
  }
  return out;
}

// keepRing: la spinta che tiene fuori dall'anello di raggio `radius` intorno al gatto chi non ha il gettone. Vale 1
// sopra il gatto e scende a zero sul bordo dell'anello; fuori è zero. Come le spinte leggere, va in withPush.
// Sopra il gatto esatto non c'è una direzione: spinge a destra.
export function keepRing(pos: Vec, cat: Vec, radius: number): Vec {
  const dx = pos.x - cat.x;
  const dy = pos.y - cat.y;
  const d = Math.hypot(dx, dy);
  if (d >= radius) return { x: 0, y: 0 };
  if (d === 0) return { x: 1, y: 0 };
  const push = 1 - d / radius;
  // almeno un po' anche vicino al bordo, così chi entra viene sempre rimandato fuori
  const k = Math.max(push, 0.25);
  return { x: (dx / d) * k, y: (dy / d) * k };
}

// ringTarget: il punto dell'anello di raggio `radius` intorno al gatto, all'angolo `angle` (in radianti).
export function ringTarget(cat: Vec, angle: number, radius: number): Vec {
  return { x: cat.x + Math.cos(angle) * radius, y: cat.y + Math.sin(angle) * radius };
}

// variedSpeed: la velocità di un nemico, `base` più o meno `spread` (0,1 = 10%), da `jitter` (da 0 a 1).
export function variedSpeed(base: number, jitter: number, spread: number): number {
  return base * (1 + (2 * jitter - 1) * spread);
}

// arrivalAngle: l'angolo d'arrivo di un nemico, da `jitter` (da 0 a 1): sparpagliato su tutto il giro con la
// sezione aurea, così due numeri vicini danno angoli lontani.
export function arrivalAngle(jitter: number): number {
  const turns = (jitter * 7.0710678 * 0.6180339887) % 1;
  return turns * Math.PI * 2;
}

export interface FlockRing {
  // entro che distanza dal gatto lo stormo si mette sull'anello
  near: number;
  // il raggio dell'anello dello stormo
  radius: number;
  // il gatto è «lento» se va al massimo a questa volta la velocità dello stormo
  slowFactor: number;
}

// flockGoal: dove va il centro dello stormo. Vicino a un gatto lento si mette sull'anello, al suo angolo, e becca da
// lì; se il gatto è lontano o scappa, lo insegue come prima (il gatto stesso).
export function flockGoal(center: Vec, cat: Vec, catSpeed: number, flockSpeed: number, angle: number, cfg: FlockRing): Vec {
  const near = Math.hypot(center.x - cat.x, center.y - cat.y) <= cfg.near;
  const slow = catSpeed <= flockSpeed * cfg.slowFactor;
  if (!near || !slow) return { x: cat.x, y: cat.y };
  return ringTarget(cat, angle, cfg.radius);
}

// lockHeading: la direzione dello sciame che passa. Finché non è in vista non ce l'ha (null); appena entra prende
// la direzione verso il gatto di quel momento, e poi la tiene: va dritto e se ne va, senza girarsi.
export function lockHeading(heading: number | null, center: Vec, cat: Vec, inView: boolean): number | null {
  if (heading !== null) return heading;
  if (!inView) return null;
  return Math.atan2(cat.y - center.y, cat.x - center.x);
}

// Il gettone più alto che si può chiedere dall'indirizzo.
export const TOKENS_PARAM_MAX = 200;

// parseTokensParam: legge ?gettoni dalla parte dell'indirizzo dopo il punto di domanda, per le prove. Senza il
// parametro, o con un valore che non è un intero tra 1 e TOKENS_PARAM_MAX, vale `fallback`.
export function parseTokensParam(search: string, fallback: number): number {
  const value = new URLSearchParams(search).get("gettoni");
  if (value === null || !/^\d+$/.test(value)) return fallback;
  const n = Number(value);
  return n >= 1 && n <= TOKENS_PARAM_MAX ? n : fallback;
}
