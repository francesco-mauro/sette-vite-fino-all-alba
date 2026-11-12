// La vita del gatto: il danno, l'attimo di invulnerabilità dopo un colpo o alla ripresa del gioco, la cura e la rigenerazione. Logica pura, senza Phaser.
// Ogni funzione restituisce uno stato nuovo e non cambia quello vecchio: così i test sono semplici.

export interface Health {
  current: number;
  max: number;
  // fino a questo istante (in millisecondi di gioco) i colpi non contano
  invulnerableUntil: number;
}

export function createHealth(max: number): Health {
  return { current: max, max, invulnerableUntil: 0 };
}

// takeHit: un colpo da `damage` all'istante `now`. Se il gatto è ancora invulnerabile non succede niente.
// Senza l'attimo di invulnerabilità un piccione appoggiato al gatto toglierebbe vita a ogni fotogramma.
export function takeHit(
  health: Health,
  damage: number,
  now: number,
  invulnerabilityMs: number,
): { health: Health; hit: boolean } {
  if (now < health.invulnerableUntil) return { health, hit: false };
  return {
    health: {
      ...health,
      current: Math.max(0, health.current - damage),
      invulnerableUntil: now + invulnerabilityMs,
    },
    hit: true,
  };
}

// protect: un attimo in cui i colpi non contano, alla ripresa dopo una carta o una pausa, per riprendere in mano
// il gatto. Se è già invulnerabile più a lungo (una vita appena persa) resta così.
export function protect(health: Health, now: number, ms: number): Health {
  return { ...health, invulnerableUntil: Math.max(health.invulnerableUntil, now + ms) };
}

// regenerate: `perSecond` di vita al secondo per `ms` millisecondi di gioco, senza superare la vita massima.
// Un gatto a terra non si rialza da solo: per quello c'è la vita persa.
export function regenerate(health: Health, perSecond: number, ms: number): Health {
  if (perSecond <= 0 || health.current <= 0 || health.current >= health.max) return health;
  return { ...health, current: Math.min(health.max, health.current + (perSecond * ms) / 1000) };
}

export function heal(health: Health, amount: number): Health {
  return { ...health, current: Math.min(health.max, health.current + amount) };
}

export function isDead(health: Health): boolean {
  return health.current <= 0;
}
