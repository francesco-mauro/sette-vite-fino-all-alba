// I test del movimento: diagonale, joystick, inseguimento.
import { describe, expect, it } from "vitest";
import { chase, clampToUnit, joystickVector, keyboardVector } from "../../src/logic/movement";

const length = (v: { x: number; y: number }) => Math.hypot(v.x, v.y);

describe("la diagonale", () => {
  it("con due frecce premute il gatto non va più veloce: il vettore è lungo 1, non 1,41", () => {
    const v = keyboardVector({ left: false, right: true, up: true, down: false });
    expect(length(v)).toBeCloseTo(1);
    expect(v.x).toBeCloseTo(Math.SQRT1_2);
    expect(v.y).toBeCloseTo(-Math.SQRT1_2);
  });

  it("con una freccia sola il vettore è lungo 1, e senza frecce è fermo", () => {
    expect(keyboardVector({ left: true, right: false, up: false, down: false })).toEqual({ x: -1, y: 0 });
    expect(keyboardVector({ left: false, right: false, up: false, down: false })).toEqual({ x: 0, y: 0 });
  });

  it("due frecce opposte si annullano", () => {
    expect(keyboardVector({ left: true, right: true, up: false, down: false })).toEqual({ x: 0, y: 0 });
  });

  it("un vettore più corto di 1 resta com'è: il joystick spinto a metà va a metà velocità", () => {
    expect(clampToUnit(0.3, 0.4)).toEqual({ x: 0.3, y: 0.4 });
  });
});

describe("il joystick che compare sotto il pollice", () => {
  const start = { x: 100, y: 200 };

  it("trascinato fino al bordo, o oltre, dà un vettore lungo 1", () => {
    expect(length(joystickVector(start, { x: 130, y: 200 }, 30))).toBeCloseTo(1);
    expect(length(joystickVector(start, { x: 100, y: 300 }, 30))).toBeCloseTo(1);
  });

  it("trascinato a metà raggio dà metà velocità, nella direzione del dito", () => {
    const v = joystickVector(start, { x: 100, y: 185 }, 30);
    expect(v.x).toBeCloseTo(0);
    expect(v.y).toBeCloseTo(-0.5);
  });

  it("un tremolio del dito vicino al centro non muove il gatto", () => {
    expect(joystickVector(start, { x: 102, y: 201 }, 30)).toEqual({ x: 0, y: 0 });
  });
});

describe("l'inseguimento", () => {
  it("il nemico va verso il gatto alla sua velocità, in qualsiasi direzione", () => {
    const v = chase({ x: 0, y: 0 }, { x: 30, y: 40 }, 35);
    expect(length(v)).toBeCloseTo(35);
    expect(v.x).toBeCloseTo(21);
    expect(v.y).toBeCloseTo(28);
  });

  it("sopra il gatto si ferma, senza dividere per zero", () => {
    expect(chase({ x: 5, y: 5 }, { x: 5, y: 5 }, 35)).toEqual({ x: 0, y: 0 });
  });
});
