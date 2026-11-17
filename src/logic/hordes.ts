// Il passo 2 contro il blob (disegno approvato da Francesco il 14 novembre 2026): le orde con tre schemi, un lato,
// due lati opposti o alle spalle del gatto, mai lo stesso di fila e mai più di due lati, così un varco resta sempre;
// e il rimescolo, sua idea: una parte dei nemici rimasti fuori schermo dietro al gatto esce dalla minimappa e torna
// con l'orda, da un'altra parte. Logica pura, senza Phaser.
import type { Vec } from "./movement";
import type { Rng } from "./rng";
import { nextSide, type Side } from "./spawn";

export type HordePattern = "one" | "opposite" | "behind";
const PATTERNS: HordePattern[] = ["one", "opposite", "behind"];

// nextPattern: lo schema dell'orda dopo, uno dei due diversi da `prev`, scelto da `random` (da 0 a 1).
export function nextPattern(prev: HordePattern, random: number): HordePattern {
  const others = PATTERNS.filter((p) => p !== prev);
  return others[Math.min(others.length - 1, Math.floor(random * others.length))];
}

const OPPOSITE: Record<Side, Side> = { left: "right", right: "left", top: "bottom", bottom: "top" };

export function oppositeSide(side: Side): Side {
  return OPPOSITE[side];
}

// behindSide: il lato alle spalle del gatto che guarda nella direzione `facing` (in radianti, y verso il basso):
// conta l'asse su cui si muove di più.
export function behindSide(facing: number): Side {
  const dx = Math.cos(facing);
  const dy = Math.sin(facing);
  if (Math.abs(dx) >= Math.abs(dy)) return dx > 0 ? "left" : "right";
  return dy > 0 ? "top" : "bottom";
}

// hordeSides: da quali lati arriva l'orda con lo schema `pattern`. `prevSide` è il primo lato dell'onda prima,
// `random` (da 0 a 1) sceglie il lato nuovo. Al massimo due lati: gli altri due restano liberi.
export function hordeSides(pattern: HordePattern, prevSide: Side, facing: number, random: number): Side[] {
  if (pattern === "behind") return [behindSide(facing)];
  const side = nextSide(prevSide, random);
  return pattern === "opposite" ? [side, oppositeSide(side)] : [side];
}

// pickReshuffle: quali tra `units` (le posizioni dei nemici sciolti e dei centri dei gruppi) si rimescolano. Solo
// chi è fuori dalla vista (mezza larghezza e mezza altezza intorno al gatto) e dietro al gatto rispetto a `facing`;
// ognuno con probabilità `share`, al massimo `max`. Restituisce gli indici.
export function pickReshuffle(units: readonly Vec[], cat: Vec, facing: number, halfWidth: number, halfHeight: number, share: number, max: number, rng: Rng): number[] {
  const fx = Math.cos(facing);
  const fy = Math.sin(facing);
  const picked: number[] = [];
  for (let i = 0; i < units.length && picked.length < max; i++) {
    const dx = units[i].x - cat.x;
    const dy = units[i].y - cat.y;
    const outside = Math.abs(dx) > halfWidth || Math.abs(dy) > halfHeight;
    const behind = dx * fx + dy * fy < 0;
    if (outside && behind && rng() < share) picked.push(i);
  }
  return picked;
}

// reshufflePoint: dove torna un nemico rimescolato: a `beyond` pixel dal gatto sul lato `side`, oltre la minimappa,
// e lungo il lato di `along` (da 0 a 1) dentro una striscia larga `spread`.
export function reshufflePoint(cat: Vec, side: Side, beyond: number, along: number, spread: number): Vec {
  const offset = (along - 0.5) * spread;
  if (side === "left") return { x: cat.x - beyond, y: cat.y + offset };
  if (side === "right") return { x: cat.x + beyond, y: cat.y + offset };
  if (side === "top") return { x: cat.x + offset, y: cat.y - beyond };
  return { x: cat.x + offset, y: cat.y + beyond };
}

// bubblePoint: dove sta il fumetto del passo 3 che avvisa dell'orda, sullo schermo largo `width` e alto `height`: al
// centro del lato `side`, dentro di `radius` più `margin`, così il tondo si vede intero.
export function bubblePoint(side: Side, width: number, height: number, radius: number, margin: number): Vec {
  const inset = radius + margin;
  if (side === "left") return { x: inset, y: height / 2 };
  if (side === "right") return { x: width - inset, y: height / 2 };
  if (side === "top") return { x: width / 2, y: inset };
  return { x: width / 2, y: height - inset };
}
