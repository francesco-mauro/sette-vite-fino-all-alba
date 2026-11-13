// Dove nascono i nemici: in una cornice appena fuori dallo schermo, intorno al gatto, e quando uno è rimasto
// troppo lontano. Logica pura, senza Phaser.
import type { Vec } from "./movement";

// spawnPoint: un punto nella cornice larga `margin` intorno alla vista (centro, mezza larghezza, mezza altezza).
// random restituisce numeri tra 0 e 1, come Math.random: si passa da fuori, così i test usano numeri fissi
// e dalla tappa 3a il generatore con il seme.
// Il primo numero sceglie il lato, pesato sulla sua lunghezza, così i nemici arrivano da tutte le parti
// in modo uniforme; il secondo il punto lungo il lato.
export function spawnPoint(center: Vec, halfWidth: number, halfHeight: number, margin: number, random: () => number): Vec {
  const w = halfWidth + margin / 2;
  const h = halfHeight + margin / 2;
  const horizontal = 2 * w;
  const vertical = 2 * h;
  const perimeter = 2 * (horizontal + vertical);
  let d = random() * perimeter;
  const along = random();
  // a metà della cornice: abbastanza fuori da non vederlo nascere, abbastanza vicino da arrivare presto
  if (d < horizontal) return { x: center.x - w + along * horizontal, y: center.y - h };
  d -= horizontal;
  if (d < horizontal) return { x: center.x - w + along * horizontal, y: center.y + h };
  d -= horizontal;
  if (d < vertical) return { x: center.x - w, y: center.y - h + along * vertical };
  return { x: center.x + w, y: center.y - h + along * vertical };
}

// groupOffset: il posto del nemico numero `index` (da 0) nel suo gruppo, rispetto al punto in cui il gruppo nasce.
// Tre per fila, vicini ma non uno sopra l'altro.
export function groupOffset(index: number): Vec {
  return { x: (index % 3) * 14, y: Math.floor(index / 3) * 12 };
}

// tooFar: un nemico rimasto a più di `distance` dal gatto. La scena lo riporta in un punto di nascita nuovo
// (spawnPoint): così chi viene seminato non resta vivo lontano a occupare un posto tra i nemici, e scappare
// non svuota lo schermo. Proprio sul limite resta dov'è.
export function tooFar(enemy: Vec, cat: Vec, distance: number): boolean {
  return Math.hypot(enemy.x - cat.x, enemy.y - cat.y) > distance;
}
