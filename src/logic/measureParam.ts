// Il parametro ?misura dell'indirizzo: logica pura, senza Phaser e senza browser.

// I numeri di sprite tra cui passa il tasto del pannello della misura.
export const MEASURE_COUNTS = [200, 500, 1000];
const DEFAULT_COUNT = MEASURE_COUNTS[0];
// Il numero più alto che si può chiedere dall'indirizzo: è anche la capienza del gruppo di sprite finti.
export const MEASURE_MAX = 5000;

// parseMeasureParam: legge ?misura dalla parte dell'indirizzo che viene dopo il punto di domanda.
// Senza il parametro la misura è spenta (null). Con il parametro da solo, o con un valore strano, sono 200 sprite.
export function parseMeasureParam(search: string): number | null {
  const value = new URLSearchParams(search).get("misura");
  if (value === null) return null;
  if (!/^\d+$/.test(value)) return DEFAULT_COUNT;
  const count = Number(value);
  return count >= 1 && count <= MEASURE_MAX ? count : DEFAULT_COUNT;
}

// nextMeasureCount: il primo numero della lista più grande di quello attuale. Finita la lista, si torna al primo.
export function nextMeasureCount(current: number): number {
  return MEASURE_COUNTS.find((count) => count > current) ?? DEFAULT_COUNT;
}
