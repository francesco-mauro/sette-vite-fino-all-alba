// I test della picchiata della cornacchia: si avvicina, si ferma a prendere la mira, si lancia dritta,
// riprende fiato, ricomincia.
import { describe, expect, it } from "vitest";
import { diveStep, startDive, type DiveConfig } from "../../src/logic/dive";

const CFG: DiveConfig = { triggerDistance: 80, aimMs: 400, diveMs: 600, diveSpeed: 200, restMs: 700 };
const SPEED = 40;
const cat = { x: 0, y: 0 };

describe("la picchiata della cornacchia", () => {
  it("da lontano si avvicina come gli altri nemici", () => {
    const { state, velocity } = diveStep(startDive(), { x: 300, y: 0 }, cat, 0, SPEED, CFG);
    expect(state.phase).toBe("approach");
    expect(velocity).toEqual({ x: -SPEED, y: 0 });
  });

  it("arrivata a tiro si ferma e prende la mira", () => {
    const { state, velocity } = diveStep(startDive(), { x: 80, y: 0 }, cat, 1000, SPEED, CFG);
    expect(state.phase).toBe("aim");
    expect(state.until).toBe(1400);
    expect(velocity).toEqual({ x: 0, y: 0 });
  });

  it("finché prende la mira resta ferma", () => {
    const aiming = diveStep(startDive(), { x: 80, y: 0 }, cat, 1000, SPEED, CFG).state;
    const { state, velocity } = diveStep(aiming, { x: 80, y: 0 }, cat, 1399, SPEED, CFG);
    expect(state.phase).toBe("aim");
    expect(velocity).toEqual({ x: 0, y: 0 });
  });

  it("poi si lancia verso il punto dov'è il gatto in quel momento", () => {
    const aiming = diveStep(startDive(), { x: 80, y: 0 }, cat, 1000, SPEED, CFG).state;
    // mentre prendeva la mira il gatto si è spostato sopra di lei
    const { state, velocity } = diveStep(aiming, { x: 80, y: 0 }, { x: 80, y: -50 }, 1400, SPEED, CFG);
    expect(state.phase).toBe("dive");
    expect(state.until).toBe(2000);
    expect(velocity.x).toBeCloseTo(0);
    expect(velocity.y).toBeCloseTo(-CFG.diveSpeed);
  });

  it("in picchiata va dritta: se il gatto si sposta, lo manca", () => {
    const aiming = diveStep(startDive(), { x: 80, y: 0 }, cat, 1000, SPEED, CFG).state;
    const diving = diveStep(aiming, { x: 80, y: 0 }, cat, 1400, SPEED, CFG).state;
    const { state, velocity } = diveStep(diving, { x: 40, y: 0 }, { x: 40, y: 200 }, 1600, SPEED, CFG);
    expect(state.phase).toBe("dive");
    expect(velocity.x).toBeCloseTo(-CFG.diveSpeed);
    expect(velocity.y).toBeCloseTo(0);
  });

  it("finita la picchiata riprende fiato, ferma", () => {
    const aiming = diveStep(startDive(), { x: 80, y: 0 }, cat, 1000, SPEED, CFG).state;
    const diving = diveStep(aiming, { x: 80, y: 0 }, cat, 1400, SPEED, CFG).state;
    const { state, velocity } = diveStep(diving, { x: -40, y: 0 }, cat, 2000, SPEED, CFG);
    expect(state.phase).toBe("rest");
    expect(state.until).toBe(2700);
    expect(velocity).toEqual({ x: 0, y: 0 });
  });

  it("ripreso fiato ricomincia: lontana si avvicina, vicina prende di nuovo la mira", () => {
    const resting = { phase: "rest" as const, until: 2700, dir: { x: -1, y: 0 } };
    expect(diveStep(resting, { x: 300, y: 0 }, cat, 2700, SPEED, CFG).state.phase).toBe("approach");
    expect(diveStep(resting, { x: 30, y: 0 }, cat, 2700, SPEED, CFG).state.phase).toBe("aim");
  });

  it("se il gatto le è esattamente sopra non si rompe", () => {
    const aiming = diveStep(startDive(), cat, cat, 0, SPEED, CFG).state;
    const { velocity } = diveStep(aiming, cat, cat, 400, SPEED, CFG);
    expect(Number.isFinite(velocity.x)).toBe(true);
    expect(Number.isFinite(velocity.y)).toBe(true);
  });

  it("non tocca lo stato che riceve", () => {
    const state = startDive();
    diveStep(state, { x: 80, y: 0 }, cat, 1000, SPEED, CFG);
    expect(state).toEqual(startDive());
  });
});
