// I test della vita: il danno, l'attimo di invulnerabilità dopo un colpo e quello alla ripresa del gioco.
import { describe, expect, it } from "vitest";
import { CAT } from "../../src/data/balance";
import { contactHit, createHealth, heal, isDead, protect, regenerate, takeHit } from "../../src/logic/health";

describe("la vita del gatto", () => {
  it("un colpo toglie vita e apre l'attimo di invulnerabilità", () => {
    const { health, hit } = takeHit(createHealth(100), 10, 1000, 800);
    expect(hit).toBe(true);
    expect(health.current).toBe(90);
    expect(health.invulnerableUntil).toBe(1800);
  });

  it("durante l'invulnerabilità i colpi non contano", () => {
    const first = takeHit(createHealth(100), 10, 1000, 800).health;
    const second = takeHit(first, 10, 1500, 800);
    expect(second.hit).toBe(false);
    expect(second.health.current).toBe(90);
  });

  it("finita l'invulnerabilità il colpo conta di nuovo", () => {
    const first = takeHit(createHealth(100), 10, 1000, 800).health;
    expect(takeHit(first, 10, 1800, 800).health.current).toBe(80);
  });

  it("la vita non scende sotto zero, e a zero il gatto è a terra", () => {
    const { health } = takeHit(createHealth(5), 10, 0, 800);
    expect(health.current).toBe(0);
    expect(isDead(health)).toBe(true);
    expect(isDead(createHealth(1))).toBe(false);
  });

  it("la cura non supera la vita massima", () => {
    const hurt = takeHit(createHealth(100), 30, 0, 800).health;
    expect(heal(hurt, 10).current).toBe(80);
    expect(heal(hurt, 50).current).toBe(100);
  });
});

describe("l'attimo di protezione alla ripresa", () => {
  it("dopo una carta o una pausa i colpi non contano per un attimo", () => {
    const safe = protect(createHealth(100), 5000, 1000);
    expect(safe.invulnerableUntil).toBe(6000);
    expect(takeHit(safe, 10, 5500, 800).hit).toBe(false);
    expect(takeHit(safe, 10, 6000, 800).hit).toBe(true);
  });

  it("non accorcia un'invulnerabilità più lunga già in corso", () => {
    const respawn = { ...createHealth(100), invulnerableUntil: 9000 };
    expect(protect(respawn, 5000, 1000).invulnerableUntil).toBe(9000);
  });

  it("non tocca la vita", () => {
    const hurt = takeHit(createHealth(100), 30, 0, 800).health;
    expect(protect(hurt, 5000, 1000).current).toBe(70);
  });

  // Francesco, 13 novembre 2026: «Andiamo un secondo e mezzo ad impulnerabilità sia quando selezioniamo il
  // potenziamento sia quando usciamo dalla pausa».
  it("dura un secondo e mezzo, dopo la carta come dopo la pausa", () => {
    expect(CAT.resumeInvulnerabilityMs).toBe(1500);
    const safe = protect(createHealth(100), 5000, CAT.resumeInvulnerabilityMs);
    expect(takeHit(safe, 10, 6400, 800).hit).toBe(false);
    expect(takeHit(safe, 10, 6500, 800).hit).toBe(true);
  });
});

describe("la rigenerazione", () => {
  it("rende vita piano, in proporzione al tempo passato", () => {
    const hurt = takeHit(createHealth(100), 30, 0, 800).health;
    expect(regenerate(hurt, 0.5, 2000).current).toBeCloseTo(71);
  });

  it("non supera la vita massima", () => {
    const hurt = takeHit(createHealth(100), 1, 0, 800).health;
    expect(regenerate(hurt, 1, 5000).current).toBe(100);
  });

  it("senza pancia piena non cambia niente", () => {
    const hurt = takeHit(createHealth(100), 30, 0, 800).health;
    expect(regenerate(hurt, 0, 5000)).toBe(hurt);
  });

  it("non fa rialzare un gatto a terra", () => {
    const down = takeHit(createHealth(10), 10, 0, 800).health;
    expect(regenerate(down, 1, 1000).current).toBe(0);
  });
});

// Un secondo di contatto, un fotogramma ogni 16 millisecondi: quanti colpi prende il gatto da `n` nemici appoggiati.
function hitsInOneSecond(n: number, perEnemyMs: number, gapMs: number): number {
  let health = createHealth(10_000);
  const readyAt = Array.from({ length: n }, () => 0);
  let hits = 0;
  for (let now = 0; now < 1000; now += 16) {
    for (let i = 0; i < n; i++) {
      const step = contactHit(health, readyAt[i], 1, now, perEnemyMs, gapMs);
      health = step.health;
      readyAt[i] = step.readyAt;
      if (step.hit) hits++;
    }
  }
  return hits;
}

describe("la folla fa male", () => {
  it("un nemico solo colpisce una volta ogni sua pausa, come prima", () => {
    // a 0 e a 704 (il primo fotogramma dopo i 700)
    expect(hitsInOneSecond(1, 700, 250)).toBe(2);
  });

  it("una folla colpisce più di un nemico solo, fino al tetto", () => {
    // il tetto: un colpo ogni 250 millisecondi, quattro al secondo, anche con trenta nemici addosso
    expect(hitsInOneSecond(3, 700, 250)).toBe(4);
    expect(hitsInOneSecond(30, 700, 250)).toBe(4);
  });

  it("un nemico fermato dal tetto colpisce appena il tetto lo lascia, senza aspettare un'altra pausa sua", () => {
    const first = contactHit(createHealth(100), 0, 10, 0, 700, 250);
    const blocked = contactHit(first.health, 0, 10, 100, 700, 250);
    expect(blocked.hit).toBe(false);
    expect(blocked.readyAt).toBe(0);
    const later = contactHit(blocked.health, blocked.readyAt, 10, 260, 700, 250);
    expect(later.hit).toBe(true);
    expect(later.health.current).toBe(80);
    expect(later.readyAt).toBe(960);
  });

  it("durante la protezione (ripresa, vita persa) nessun nemico colpisce", () => {
    const safe = protect(createHealth(100), 0, 1000);
    expect(contactHit(safe, 0, 10, 500, 700, 250).hit).toBe(false);
  });
});
