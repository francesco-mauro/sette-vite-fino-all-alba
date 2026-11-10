// Il contatore dei fotogrammi: logica pura, senza Phaser, così si prova con Vitest.
// Riceve l'ora di partenza di ogni fotogramma e quanto è durato il suo calcolo, e dice come sta andando il gioco.

// Quello che il contatore sa dire in un dato momento.
export interface FrameStats {
  fps: number; // fotogrammi partiti nell'ultimo secondo
  maxGapMs: number; // il buco più lungo tra due fotogrammi, nella finestra
  maxWorkMs: number; // il calcolo più lungo di un fotogramma, nella finestra
  avgWorkMs: number; // il calcolo medio di un fotogramma, nella finestra
}

export interface FrameMeter {
  record(startMs: number, workMs: number): void;
  read(nowMs: number): FrameStats;
  reset(): void; // dimentica tutto: serve quando la scheda torna visibile dopo una pausa
}

export interface FrameMeterOptions {
  windowMs?: number; // quanto indietro guardano buco e calcolo: di serie 5 secondi
  capacity?: number; // quanti fotogrammi tiene a mente: di serie 2048
}

// createFrameMeter: crea un contatore.
// I fotogrammi stanno in un anello di posti già pronti: quando è pieno il più nuovo prende il posto del più vecchio.
// Così il contatore non crea oggetti a ogni fotogramma e non pesa su quello che misura.
export function createFrameMeter(options: FrameMeterOptions = {}): FrameMeter {
  const windowMs = options.windowMs ?? 5000;
  const capacity = options.capacity ?? 2048;
  const starts = new Float64Array(capacity); // quando è partito ogni fotogramma
  const gaps = new Float64Array(capacity); // quanto è passato dal fotogramma prima
  const works = new Float64Array(capacity); // quanto è durato il suo calcolo
  let count = 0; // quanti posti sono occupati
  let next = 0; // il posto dove va il prossimo fotogramma
  let lastStart = Number.NaN; // l'ora dell'ultimo fotogramma, NaN se non ce n'è ancora uno

  return {
    record(startMs, workMs) {
      starts[next] = startMs;
      gaps[next] = Number.isNaN(lastStart) ? 0 : startMs - lastStart;
      works[next] = workMs;
      lastStart = startMs;
      next = (next + 1) % capacity;
      if (count < capacity) count++;
    },
    reset() {
      count = 0;
      next = 0;
      lastStart = Number.NaN;
    },
    read(nowMs) {
      let fps = 0;
      let maxGapMs = 0;
      let maxWorkMs = 0;
      let workSum = 0;
      let inWindow = 0;
      for (let i = 0; i < count; i++) {
        if (starts[i] > nowMs - 1000) fps++;
        if (starts[i] > nowMs - windowMs) {
          if (gaps[i] > maxGapMs) maxGapMs = gaps[i];
          if (works[i] > maxWorkMs) maxWorkMs = works[i];
          workSum += works[i];
          inWindow++;
        }
      }
      // Il più lungo dice se ci sono scatti, il medio dice quanto costa un fotogramma di solito.
      const avgWorkMs = inWindow === 0 ? 0 : workSum / inWindow;
      return { fps, maxGapMs, maxWorkMs, avgWorkMs };
    },
  };
}
