// I modi di camminare dei nemici senza un attacco loro: la zanzara che ondeggia, la pantegana a scatti, il piccione
// che si ferma a beccare. Così ogni nemico si riconosce anche da come si muove, non solo dal disegno.
// Logica pura, senza Phaser: la scena chiama queste funzioni a ogni fotogramma e applica la velocità.
import type { DashConfig, PeckConfig, ZigzagConfig } from "../data/balance";
import type { Vec } from "./movement";

export type { DashConfig, PeckConfig, ZigzagConfig };

const STILL: Vec = { x: 0, y: 0 };

// la direzione da `from` a `to`, lunga 1; ferma se sono nello stesso punto
function unit(from: Vec, to: Vec): Vec {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  return len === 0 ? STILL : { x: dx / len, y: dy / len };
}

// zigzag: la zanzara va verso il gatto piegando un po' a destra e un po' a sinistra. `t` è il tempo della notte
// (più uno spostamento suo, così non ondeggiano tutte insieme). Alla direzione verso il gatto si somma un pezzo di
// direzione di lato, che va e viene come un'onda: `swing` dice quanto, 1 vuol dire fino a 45 gradi. La velocità
// resta la sua, e la parte verso il gatto non diventa mai zero: si avvicina sempre.
export function zigzag(from: Vec, to: Vec, speed: number, t: number, cfg: ZigzagConfig): Vec {
  const u = unit(from, to);
  if (u === STILL) return STILL;
  const side = Math.sin((2 * Math.PI * t) / cfg.periodMs) * cfg.swing;
  const x = u.x - u.y * side;
  const y = u.y + u.x * side;
  const len = Math.hypot(x, y);
  return { x: (x / len) * speed, y: (y / len) * speed };
}

// La pantegana a scatti: fissa una direzione e la tiene fino a `until`.
export interface DashState {
  dir: Vec;
  until: number;
}

// startDash: lo stato di una pantegana appena nata; al primo passo punta il gatto.
export function startDash(): DashState {
  return { dir: STILL, until: 0 };
}

// dashStep: un passo. Finito lo scatto punta dove è il gatto adesso e tiene quella direzione per `dashMs`, anche
// se il gatto si sposta: così si schiva spostandosi di lato. La velocità si moltiplica a ogni passo, perché nella
// notte cresce.
export function dashStep(state: DashState, from: Vec, to: Vec, now: number, speed: number, cfg: DashConfig): { state: DashState; velocity: Vec } {
  const next = now >= state.until ? { dir: unit(from, to), until: now + cfg.dashMs } : state;
  return { state: next, velocity: { x: next.dir.x * speed, y: next.dir.y * speed } };
}

// Il piccione che becca: cammina (pecking false) o è fermo a beccare (pecking true) fino a `until`.
// until negativo vuol dire appena nato.
export interface PeckState {
  pecking: boolean;
  until: number;
}

// startPeck: lo stato di un piccione appena nato; al primo passo comincia a camminare.
export function startPeck(): PeckState {
  return { pecking: false, until: -1 };
}

// quanto cammina prima di fermarsi: da tre quarti a cinque quarti di `walkMs`, secondo `jitter` (da 0 a 1), che è
// diverso per ogni piccione. Così un gruppo nato insieme non si ferma tutto nello stesso istante.
function walkTime(cfg: PeckConfig, jitter: number): number {
  return cfg.walkMs * (0.75 + 0.5 * jitter);
}

// peckStep: un passo. Dice se adesso il piccione cammina verso il gatto (moving) o è fermo a beccare.
export function peckStep(state: PeckState, now: number, cfg: PeckConfig, jitter: number): { state: PeckState; moving: boolean } {
  if (state.until < 0) return { state: { pecking: false, until: now + walkTime(cfg, jitter) }, moving: true };
  if (now < state.until) return { state, moving: !state.pecking };
  const next = state.pecking
    ? { pecking: false, until: now + walkTime(cfg, jitter) }
    : { pecking: true, until: now + cfg.peckMs };
  return { state: next, moving: !next.pecking };
}
