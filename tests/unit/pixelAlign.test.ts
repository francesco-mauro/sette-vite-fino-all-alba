// I test delle scritte e delle icone fisse sullo schermo messe su pixel interi.
// Francesco, 13 novembre 2026: «Quando mi muovo le scritte dei boss e i cuori tremano un po'».
// Misurato il 14 novembre: il bordo sinistro dei cuori cadeva a 12,5 e in 4 foto su 32 saltava di un pixel.
import { describe, expect, it } from "vitest";
import { alignedPosition } from "../../src/logic/pixelAlign";

describe("bordi su pixel interi", () => {
  it("il cuore largo 9 con l'origine al centro: il bordo sinistro diventa intero", () => {
    const x = alignedPosition(17, 9, 0.5);
    expect(x - 9 / 2).toBe(Math.round(x - 9 / 2));
    expect(Math.abs(x - 17)).toBeLessThanOrEqual(0.5);
  });

  it("una scritta centrata di larghezza dispari: il bordo diventa intero", () => {
    const x = alignedPosition(240, 47, 0.5);
    expect(Number.isInteger(x - 47 / 2)).toBe(true);
  });

  it("con l'origine in basso: il bordo alto diventa intero", () => {
    const y = alignedPosition(249, 13, 1);
    expect(Number.isInteger(y - 13)).toBe(true);
  });

  it("chi è già su un pixel intero resta dov'è", () => {
    expect(alignedPosition(240, 46, 0.5)).toBe(240);
    expect(alignedPosition(12, 9, 0)).toBe(12);
  });
});
