// La picchiata della cornacchia. Logica pura, senza Phaser: la scena chiama diveStep a ogni fotogramma
// e applica la velocità che riceve.
// È una piccola macchina a stati, cioè un nemico che in ogni momento è in una fase sola e passa alla
// successiva quando succede una cosa precisa:
//   approach (si avvicina) -> a tiro -> aim (ferma, prende la mira) -> scade il tempo -> dive (dritta, veloce)
//   -> scade il tempo -> rest (ferma, riprende fiato) -> scade il tempo -> di nuovo approach
import type { DiveConfig } from "../data/balance";
import { chase, type Vec } from "./movement";

export type { DiveConfig };

export type DivePhase = "approach" | "aim" | "dive" | "rest";

export interface DiveState {
  phase: DivePhase;
  // fino a che momento della notte dura la fase (non conta in approach)
  until: number;
  // la direzione della picchiata, fissata quando parte
  dir: Vec;
}

// startDive: lo stato di una cornacchia appena nata.
export function startDive(): DiveState {
  return { phase: "approach", until: 0, dir: { x: 0, y: 0 } };
}

const STILL: Vec = { x: 0, y: 0 };

// diveStep: un passo. `from` è dov'è la cornacchia, `to` dov'è il gatto, `now` il tempo della notte,
// `speed` la sua velocità quando si avvicina. Restituisce lo stato nuovo e la velocità da darle adesso.
// La direzione si decide nell'istante in cui si lancia e non cambia più: per questo spostandosi di lato
// la si schiva, e l'attesa della mira è l'avviso che sta per partire.
export function diveStep(state: DiveState, from: Vec, to: Vec, now: number, speed: number, cfg: DiveConfig): { state: DiveState; velocity: Vec } {
  switch (state.phase) {
    case "aim": {
      if (now < state.until) return { state, velocity: STILL };
      const dir = chase(from, to, 1);
      return { state: { phase: "dive", until: now + cfg.diveMs, dir }, velocity: { x: dir.x * cfg.diveSpeed, y: dir.y * cfg.diveSpeed } };
    }
    case "dive": {
      if (now < state.until) return { state, velocity: { x: state.dir.x * cfg.diveSpeed, y: state.dir.y * cfg.diveSpeed } };
      return { state: { ...state, phase: "rest", until: now + cfg.restMs }, velocity: STILL };
    }
    case "rest": {
      if (now < state.until) return { state, velocity: STILL };
      return diveStep({ ...state, phase: "approach" }, from, to, now, speed, cfg);
    }
    default: {
      if (Math.hypot(to.x - from.x, to.y - from.y) <= cfg.triggerDistance) {
        return { state: { ...state, phase: "aim", until: now + cfg.aimMs }, velocity: STILL };
      }
      return { state, velocity: chase(from, to, speed) };
    }
  }
}
