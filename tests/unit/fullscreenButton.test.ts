// I test del pulsante dello schermo intero: cosa dice, e quando non c'è.
import { describe, expect, it } from "vitest";
import { fullscreenButton } from "../../src/logic/fullscreenButton";

describe("il pulsante dello schermo intero", () => {
  it("nella finestra del browser invita a entrare", () => {
    expect(fullscreenButton({ available: true, installed: false, isFullscreen: false })).toBe("enter");
  });

  it("a schermo intero invita a uscire", () => {
    expect(fullscreenButton({ available: true, installed: false, isFullscreen: true })).toBe("exit");
  });

  it("nel gioco installato, già a tutto schermo, non c'è", () => {
    expect(fullscreenButton({ available: true, installed: true, isFullscreen: false })).toBeNull();
  });

  it("se il browser non lo permette non c'è", () => {
    expect(fullscreenButton({ available: false, installed: false, isFullscreen: false })).toBeNull();
  });
});
