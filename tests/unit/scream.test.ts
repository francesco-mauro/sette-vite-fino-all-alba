// I test dell'urlo del gabbiano reale: si avvicina, a tiro si ferma e carica l'urlo, urla, riprende fiato.
import { describe, expect, it } from "vitest";
import { inScream, screamStep, startScream, windupProgress, type ScreamConfig } from "../../src/logic/scream";

const CFG: ScreamConfig = { triggerDistance: 50, windupMs: 900, radius: 60, restMs: 1500 };
const SPEED = 30;
const cat = { x: 0, y: 0 };

describe("l'urlo del gabbiano reale", () => {
  it("da lontano si avvicina come gli altri nemici, senza urlare", () => {
    const { state, velocity, burst } = screamStep(startScream(), { x: 200, y: 0 }, cat, 0, SPEED, CFG);
    expect(state.phase).toBe("approach");
    expect(velocity).toEqual({ x: -SPEED, y: 0 });
    expect(burst).toBe(false);
  });

  it("arrivato a tiro si ferma e carica l'urlo", () => {
    const { state, velocity, burst } = screamStep(startScream(), { x: 50, y: 0 }, cat, 1000, SPEED, CFG);
    expect(state.phase).toBe("windup");
    expect(state.until).toBe(1900);
    expect(velocity).toEqual({ x: 0, y: 0 });
    expect(burst).toBe(false);
  });

  it("mentre carica resta fermo, anche se il gatto scappa", () => {
    const loading = screamStep(startScream(), { x: 50, y: 0 }, cat, 1000, SPEED, CFG).state;
    const { state, velocity, burst } = screamStep(loading, { x: 50, y: 0 }, { x: -300, y: 0 }, 1899, SPEED, CFG);
    expect(state.phase).toBe("windup");
    expect(velocity).toEqual({ x: 0, y: 0 });
    expect(burst).toBe(false);
  });

  it("finito l'avviso urla, una volta sola, e poi riprende fiato", () => {
    const loading = screamStep(startScream(), { x: 50, y: 0 }, cat, 1000, SPEED, CFG).state;
    const scream = screamStep(loading, { x: 50, y: 0 }, cat, 1900, SPEED, CFG);
    expect(scream.burst).toBe(true);
    expect(scream.state.phase).toBe("rest");
    expect(scream.state.until).toBe(3400);
    expect(scream.velocity).toEqual({ x: 0, y: 0 });
    const after = screamStep(scream.state, { x: 50, y: 0 }, cat, 1916, SPEED, CFG);
    expect(after.burst).toBe(false);
    expect(after.state.phase).toBe("rest");
    expect(after.velocity).toEqual({ x: 0, y: 0 });
  });

  it("ripreso fiato torna a inseguire il gatto", () => {
    const resting = { phase: "rest" as const, until: 3400 };
    const { state, velocity, burst } = screamStep(resting, { x: 200, y: 0 }, cat, 3400, SPEED, CFG);
    expect(state.phase).toBe("approach");
    expect(velocity).toEqual({ x: -SPEED, y: 0 });
    expect(burst).toBe(false);
  });

  it("se dopo il riposo il gatto è ancora a tiro, ricarica subito", () => {
    const resting = { phase: "rest" as const, until: 3400 };
    const { state } = screamStep(resting, { x: 30, y: 0 }, cat, 3400, SPEED, CFG);
    expect(state.phase).toBe("windup");
    expect(state.until).toBe(4300);
  });
});

describe("chi prende l'urlo", () => {
  it("il gatto dentro il raggio lo prende, anche proprio sul bordo", () => {
    expect(inScream({ x: 0, y: 0 }, { x: 30, y: 0 }, 60)).toBe(true);
    expect(inScream({ x: 0, y: 0 }, { x: 60, y: 0 }, 60)).toBe(true);
  });

  it("il gatto che si è allontanato no", () => {
    expect(inScream({ x: 0, y: 0 }, { x: 61, y: 0 }, 60)).toBe(false);
    // in diagonale conta la distanza vera: 50 e 50 fanno quasi 71
    expect(inScream({ x: 0, y: 0 }, { x: 50, y: 50 }, 60)).toBe(false);
  });
});

describe("quanto manca all'urlo", () => {
  it("va da 0, appena inizia a caricare, a 1, quando urla", () => {
    const loading = { phase: "windup" as const, until: 1900 };
    expect(windupProgress(loading, 1000, CFG)).toBeCloseTo(0);
    expect(windupProgress(loading, 1450, CFG)).toBeCloseTo(0.5);
    expect(windupProgress(loading, 1900, CFG)).toBeCloseTo(1);
  });

  it("fuori dall'avviso è 0: il cerchio non si disegna", () => {
    expect(windupProgress(startScream(), 500, CFG)).toBe(0);
    expect(windupProgress({ phase: "rest", until: 3400 }, 2000, CFG)).toBe(0);
  });
});
