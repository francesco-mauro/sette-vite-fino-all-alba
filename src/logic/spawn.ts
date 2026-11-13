// Dove nascono i nemici: in una cornice appena fuori dallo schermo, intorno al gatto, un'onda da un lato solo, e
// quando uno è rimasto troppo lontano. Logica pura, senza Phaser.
import type { Vec } from "./movement";

// spawnPoint: un punto nella cornice larga `margin` intorno alla vista (centro, mezza larghezza, mezza altezza).
// random restituisce numeri tra 0 e 1, come Math.random: si passa da fuori, così i test usano numeri fissi
// e dalla tappa 3a il generatore con il seme.
// Il primo numero sceglie il lato, pesato sulla sua lunghezza, così i nemici arrivano da tutte le parti
// in modo uniforme; il secondo il punto lungo il lato.
export function spawnPoint(center: Vec, halfWidth: number, halfHeight: number, margin: number, random: () => number): Vec {
  const horizontal = 2 * (halfWidth + margin / 2);
  const vertical = 2 * (halfHeight + margin / 2);
  const d = random() * 2 * (horizontal + vertical);
  const along = random();
  if (d < horizontal) return sidePoint(center, halfWidth, halfHeight, margin, "top", along);
  if (d < 2 * horizontal) return sidePoint(center, halfWidth, halfHeight, margin, "bottom", along);
  if (d < 2 * horizontal + vertical) return sidePoint(center, halfWidth, halfHeight, margin, "left", along);
  return sidePoint(center, halfWidth, halfHeight, margin, "right", along);
}

// I quattro lati della cornice: da uno solo arriva l'onda di un'orda.
export type Side = "top" | "bottom" | "left" | "right";
const SIDES: Side[] = ["top", "bottom", "left", "right"];

// sidePoint: un punto sul lato `side` della cornice, `along` (da 0 a 1) dice dove lungo il lato.
// A metà della cornice: abbastanza fuori da non vederlo nascere, abbastanza vicino da arrivare presto.
export function sidePoint(center: Vec, halfWidth: number, halfHeight: number, margin: number, side: Side, along: number): Vec {
  const w = halfWidth + margin / 2;
  const h = halfHeight + margin / 2;
  if (side === "top") return { x: center.x - w + along * 2 * w, y: center.y - h };
  if (side === "bottom") return { x: center.x - w + along * 2 * w, y: center.y + h };
  if (side === "left") return { x: center.x - w, y: center.y - h + along * 2 * h };
  return { x: center.x + w, y: center.y - h + along * 2 * h };
}

// nextSide: il lato dell'onda dopo, uno degli altri tre, scelto da `random` (da 0 a 1): mai lo stesso due volte di
// fila, così le onde arrivano da parti diverse.
export function nextSide(prev: Side, random: number): Side {
  const others = SIDES.filter((s) => s !== prev);
  return others[Math.min(others.length - 1, Math.floor(random * others.length))];
}

// tooFar: un nemico rimasto a più di `distance` dal gatto. La scena lo riporta in un punto di nascita nuovo
// (spawnPoint): così chi viene seminato non resta vivo lontano a occupare un posto tra i nemici, e scappare
// non svuota lo schermo. Proprio sul limite resta dov'è.
export function tooFar(enemy: Vec, cat: Vec, distance: number): boolean {
  return Math.hypot(enemy.x - cat.x, enemy.y - cat.y) > distance;
}
