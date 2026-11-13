// Le spinte leggere tra nemici: chi sta troppo vicino a un altro si scosta un po', così intorno al gatto
// si vede una folla e non un mucchio di sprite uno sopra l'altro. E la misura del mucchio, per i numeri.
// Logica pura, senza Phaser.
import type { Vec } from "./movement";

// Quante caselle per riga nella chiave della griglia: basta che le chiavi non si scontrino. Le chiavi restano
// diverse finché le caselle stanno entro mezzo milione per parte, cioè milioni di pixel: nel gioco il gatto arriva
// a qualche decina di migliaia.
const ROW = 1_048_576;

// La griglia: ogni punto va nella casella grande quanto `size` che lo contiene. Due punti più vicini di `size`
// stanno nella stessa casella o in due accanto, quindi per ogni punto bastano le nove caselle intorno, invece di
// guardare tutti gli altri. Con trecento nemici sono poche migliaia di confronti invece di quarantacinquemila.
function buildGrid(points: readonly Vec[], size: number): Map<number, number[]> {
  const grid = new Map<number, number[]>();
  for (let i = 0; i < points.length; i++) {
    const key = Math.floor(points[i].x / size) * ROW + Math.floor(points[i].y / size);
    const cell = grid.get(key);
    if (cell) cell.push(i);
    else grid.set(key, [i]);
  }
  return grid;
}

// Chiama `visit(i, j)` una volta sola per ogni coppia di punti più vicini di `size` (i < j).
function forEachClosePair(points: readonly Vec[], size: number, visit: (i: number, j: number, dx: number, dy: number, d: number) => void) {
  const grid = buildGrid(points, size);
  for (let i = 0; i < points.length; i++) {
    const cx = Math.floor(points[i].x / size);
    const cy = Math.floor(points[i].y / size);
    for (let ox = -1; ox <= 1; ox++) {
      for (let oy = -1; oy <= 1; oy++) {
        const cell = grid.get((cx + ox) * ROW + (cy + oy));
        if (!cell) continue;
        for (const j of cell) {
          if (j <= i) continue;
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const d = Math.hypot(dx, dy);
          if (d < size) visit(i, j, dx, dy, d);
        }
      }
    }
  }
}

// separation: per ogni punto, la spinta che lo allontana dai vicini più stretti di `radius`. Da ogni vicino arriva
// una spinta che vale `strength` quando sono uno sopra l'altro e scende a zero alla distanza `radius`; le spinte si
// sommano, ma il totale non supera mai `strength`. Due punti esattamente uguali non hanno una direzione: il primo
// della lista va a sinistra, l'altro a destra, invece di restare incollati.
export function separation(points: readonly Vec[], radius: number, strength: number): Vec[] {
  const out = points.map(() => ({ x: 0, y: 0 }));
  forEachClosePair(points, radius, (i, j, dx, dy, d) => {
    const ux = d === 0 ? -1 : dx / d;
    const uy = d === 0 ? 0 : dy / d;
    const push = strength * (1 - d / radius);
    out[i].x += ux * push;
    out[i].y += uy * push;
    out[j].x -= ux * push;
    out[j].y -= uy * push;
  });
  for (const v of out) {
    const len = Math.hypot(v.x, v.y);
    if (len > strength) {
      v.x = (v.x / len) * strength;
      v.y = (v.y / len) * strength;
    }
  }
  return out;
}

// withPush: la corsa di un nemico con la spinta dei vicini. `push` viene da separation (lungo al massimo 1) e si
// moltiplica per la sua velocità e per `factor` (CROWD.push); poi la corsa si accorcia alla sua velocità, se la
// supera. Così la spinta lo sposta di lato o lo frena, ma non lo fa mai correre più di prima.
export function withPush(velocity: Vec, push: Vec, speed: number, factor: number): Vec {
  const x = velocity.x + push.x * speed * factor;
  const y = velocity.y + push.y * speed * factor;
  const len = Math.hypot(x, y);
  if (len <= speed) return { x, y };
  return { x: (x / len) * speed, y: (y / len) * speed };
}

// crowding: la parte dei punti, da 0 a 1, che ne hanno un altro più vicino di `distance`, cioè quasi addosso.
// È la misura del mucchio che la partita automatica legge prima e dopo le spinte.
export function crowding(points: readonly Vec[], distance: number): number {
  if (points.length === 0) return 0;
  const close = new Set<number>();
  forEachClosePair(points, distance, (i, j) => {
    close.add(i);
    close.add(j);
  });
  return close.size / points.length;
}
