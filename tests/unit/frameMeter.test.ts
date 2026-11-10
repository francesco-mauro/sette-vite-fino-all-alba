// I test del contatore dei fotogrammi. Tempi in millisecondi, come li dà performance.now().
import { describe, expect, it } from "vitest";
import { createFrameMeter } from "../../src/logic/frameMeter";

describe("il contatore dei fotogrammi", () => {
  it("senza fotogrammi dà tutto a zero", () => {
    const meter = createFrameMeter();

    expect(meter.read(1000)).toEqual({ fps: 0, maxGapMs: 0, maxWorkMs: 0, avgWorkMs: 0 });
  });

  it("conta i fotogrammi partiti nell'ultimo secondo", () => {
    const meter = createFrameMeter();
    // un fotogramma ogni 10 ms per due secondi: nell'ultimo secondo ce ne sono 100
    for (let t = 0; t <= 2000; t += 10) meter.record(t, 1);

    expect(meter.read(2000).fps).toBe(100);
  });

  it("il buco più lungo è la distanza più grande tra due fotogrammi vicini", () => {
    const meter = createFrameMeter();
    for (const t of [0, 16, 32, 100, 116]) meter.record(t, 1);

    expect(meter.read(116).maxGapMs).toBe(68);
  });

  it("un buco più vecchio della finestra non conta più", () => {
    const meter = createFrameMeter({ windowMs: 5000 });
    meter.record(0, 1);
    meter.record(200, 1); // un buco di 200 ms, all'inizio
    for (let t = 216; t <= 7000; t += 16) meter.record(t, 1);

    expect(meter.read(7000).maxGapMs).toBe(16);
  });

  it("il calcolo più lungo è il più grande tra quelli nella finestra", () => {
    const meter = createFrameMeter({ windowMs: 5000 });
    meter.record(0, 30); // un calcolo lungo, ma vecchio
    for (const [t, work] of [[6000, 2], [6016, 9], [6032, 3]]) meter.record(t, work);

    expect(meter.read(6032).maxWorkMs).toBe(9);
  });

  it("il calcolo medio è la media dei calcoli nella finestra", () => {
    const meter = createFrameMeter({ windowMs: 5000 });
    meter.record(0, 100); // vecchio: fuori dalla finestra, non entra nella media
    for (const [t, work] of [[6000, 2], [6016, 4], [6032, 6]]) meter.record(t, work);

    expect(meter.read(6032).avgWorkMs).toBe(4);
  });

  it("dopo l'azzeramento riparte da capo, e il primo fotogramma non fa da buco", () => {
    const meter = createFrameMeter();
    meter.record(0, 40);
    meter.record(16, 40);

    meter.reset();
    meter.record(10000, 1);
    meter.record(10016, 2);

    expect(meter.read(10016)).toEqual({ fps: 2, maxGapMs: 16, maxWorkMs: 2, avgWorkMs: 1.5 });
  });

  it("quando l'anello è pieno i fotogrammi più vecchi escono", () => {
    const meter = createFrameMeter({ capacity: 4 });
    for (const t of [0, 100, 110, 120, 130, 140]) meter.record(t, 1);

    // restano 110, 120, 130 e 140: il buco da 100 ms tra i primi due non c'è più
    expect(meter.read(140)).toEqual({ fps: 4, maxGapMs: 10, maxWorkMs: 1, avgWorkMs: 1 });
  });
});
