// La conferma a due tocchi, per «esci dalla partita» nella pausa: il primo tocco chiede «sicuro?»,
// il secondo, se arriva entro windowMs, conferma. Passato il tempo la domanda scade e si ricomincia.
// Logica pura: il tempo lo passa chi la usa.

export interface Confirm {
  // press: un tocco al tempo now; true se è il secondo, entro il tempo
  press(now: number): boolean;
  // armed: se al tempo now la domanda è ancora aperta
  armed(now: number): boolean;
}

export function createConfirm(windowMs: number): Confirm {
  let askedAt: number | null = null;
  const armed = (now: number) => askedAt !== null && now - askedAt <= windowMs;
  return {
    press(now) {
      if (armed(now)) {
        askedAt = null;
        return true;
      }
      askedAt = now;
      return false;
    },
    armed,
  };
}
