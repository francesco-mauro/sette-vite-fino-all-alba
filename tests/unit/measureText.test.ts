// I test delle righe del pannello della misura: sono i numeri che poi si leggono sullo schermo e nelle schermate.
import { describe, expect, it } from "vitest";
import { formatJoystick, formatStats } from "../../src/logic/measureText";

describe("le righe del pannello della misura", () => {
  it("scrive fotogrammi, buco più lungo, calcolo medio e calcolo più lungo", () => {
    expect(formatStats({ fps: 120, maxGapMs: 8.6, maxWorkMs: 3.14, avgWorkMs: 2.06 })).toBe(
      "120 fps · buco max 9 ms · calcolo 2.1 ms (max 3.1)",
    );
  });

  it("il joystick fermo è scritto come fermo", () => {
    expect(formatJoystick(0, 0)).toBe("joystick: fermo");
  });

  it("il joystick spinto mostra la forza da 0 a 1 e l'angolo in gradi", () => {
    expect(formatJoystick(0.826, 134.6)).toBe("joystick: forza 0.83, angolo 135°");
  });

  it("la forza scritta non supera mai 1", () => {
    expect(formatJoystick(1.7, -90)).toBe("joystick: forza 1.00, angolo -90°");
  });
});
