// L'urlo del gabbiano reale. Logica pura, senza Phaser: la scena chiama screamStep a ogni fotogramma,
// applica la velocità che riceve e, quando `burst` è vero, fa partire l'urlo.
// È una macchina a stati come la picchiata (dive.ts), con tre fasi:
//   approach (si avvicina) -> a tiro -> windup (fermo, carica l'urlo: è l'avviso) -> scade il tempo -> urla
//   -> rest (fermo, riprende fiato) -> scade il tempo -> di nuovo approach
// L'urlo colpisce chi è dentro il raggio in quell'istante: alla carica del gabbiano ci si sposta di lato,
// dall'urlo ci si allontana.
import type { ScreamConfig } from "../data/balance";
import { chase, type Vec } from "./movement";

export type { ScreamConfig };

export type ScreamPhase = "approach" | "windup" | "rest";

export interface ScreamState {
  phase: ScreamPhase;
  // fino a che momento della notte dura la fase (non conta in approach)
  until: number;
}

// startScream: lo stato di un gabbiano reale appena nato.
export function startScream(): ScreamState {
  return { phase: "approach", until: 0 };
}

const STILL: Vec = { x: 0, y: 0 };

// screamStep: un passo. `from` è dov'è il capo, `to` dov'è il gatto, `now` il tempo della notte, `speed`
// la sua velocità quando si avvicina. Restituisce lo stato nuovo, la velocità da dargli adesso e `burst`:
// vero in un fotogramma solo, quello in cui urla.
export function screamStep(state: ScreamState, from: Vec, to: Vec, now: number, speed: number, cfg: ScreamConfig): { state: ScreamState; velocity: Vec; burst: boolean } {
  switch (state.phase) {
    case "windup": {
      if (now < state.until) return { state, velocity: STILL, burst: false };
      return { state: { phase: "rest", until: now + cfg.restMs }, velocity: STILL, burst: true };
    }
    case "rest": {
      if (now < state.until) return { state, velocity: STILL, burst: false };
      return screamStep({ ...state, phase: "approach" }, from, to, now, speed, cfg);
    }
    default: {
      if (Math.hypot(to.x - from.x, to.y - from.y) <= cfg.triggerDistance) {
        return { state: { phase: "windup", until: now + cfg.windupMs }, velocity: STILL, burst: false };
      }
      return { state, velocity: chase(from, to, speed), burst: false };
    }
  }
}

// inScream: il gatto prende l'urlo se in quell'istante è entro `radius` dal capo. Proprio sul bordo lo prende.
export function inScream(boss: Vec, cat: Vec, radius: number): boolean {
  return Math.hypot(cat.x - boss.x, cat.y - boss.y) <= radius;
}

// windupProgress: quanto manca all'urlo, da 0 (ha appena iniziato a caricare) a 1 (urla). Serve a disegnare
// il cerchio che si allarga. Fuori dall'avviso è 0.
export function windupProgress(state: ScreamState, now: number, cfg: ScreamConfig): number {
  if (state.phase !== "windup") return 0;
  return Math.min(1, Math.max(0, 1 - (state.until - now) / cfg.windupMs));
}
