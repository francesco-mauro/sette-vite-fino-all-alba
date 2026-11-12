// I test della vita: il danno e l'attimo di invulnerabilità dopo un colpo.
import { describe, expect, it } from "vitest";
import { createHealth, heal, isDead, takeHit } from "../../src/logic/health";

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
