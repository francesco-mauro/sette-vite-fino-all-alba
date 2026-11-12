// I test dell'arco della coda a frusta: chi sta davanti al gatto, entro il raggio, viene colpito.
import { describe, expect, it } from "vitest";
import { inArc } from "../../src/logic/arc";

const cat = { x: 0, y: 0 };
const RIGHT = 0;
const HALF = Math.PI / 3; // 60 gradi per parte: un arco di 120

describe("l'arco della coda a frusta", () => {
  it("colpisce chi sta davanti, dentro il raggio", () => {
    expect(inArc(cat, RIGHT, HALF, 40, { x: 30, y: 0 })).toBe(true);
    expect(inArc(cat, RIGHT, HALF, 40, { x: 20, y: 20 })).toBe(true);
  });

  it("non colpisce chi sta dietro o di lato oltre l'arco", () => {
    expect(inArc(cat, RIGHT, HALF, 40, { x: -30, y: 0 })).toBe(false);
    expect(inArc(cat, RIGHT, HALF, 40, { x: 5, y: 30 })).toBe(false);
  });

  it("non colpisce chi sta davanti ma troppo lontano", () => {
    expect(inArc(cat, RIGHT, HALF, 40, { x: 50, y: 0 })).toBe(false);
  });

  it("funziona anche quando il gatto guarda a sinistra, dove l'angolo passa da più a meno pi greco", () => {
    expect(inArc(cat, Math.PI, HALF, 40, { x: -30, y: 5 })).toBe(true);
    expect(inArc(cat, Math.PI, HALF, 40, { x: -30, y: -5 })).toBe(true);
    expect(inArc(cat, Math.PI, HALF, 40, { x: 30, y: 0 })).toBe(false);
  });
});
