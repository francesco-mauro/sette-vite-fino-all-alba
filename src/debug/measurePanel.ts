// Il pannello della misura: un riquadro HTML sopra il gioco, con i numeri e i tasti.
// È HTML e non un oggetto di Phaser apposta: così non aggiunge lavoro al gioco che sta misurando,
// e il testo resta nitido a ogni ingrandimento.

export interface MeasurePanel {
  setLines(lines: string[]): void; // le righe di numeri
  setCount(count: number): void; // il numero scritto sul tasto degli sprite
  destroy(): void;
}

export interface MeasurePanelHandlers {
  onNextCount(): void; // premuto il tasto che cambia il numero di sprite
}

// createMeasurePanel: costruisce il riquadro in alto a sinistra e lo aggancia alla pagina.
export function createMeasurePanel(handlers: MeasurePanelHandlers): MeasurePanel {
  const box = document.createElement("div");
  box.id = "misura";
  box.style.cssText =
    "position:fixed;top:4px;left:4px;z-index:10;padding:4px 6px;" +
    "background:rgba(28,33,51,0.85);color:#ffffff;border:1px solid #56638a;font:12px/1.35 monospace;";

  const text = document.createElement("div");
  text.style.whiteSpace = "pre";

  const buttons = document.createElement("div");
  buttons.style.cssText = "margin-top:4px;display:flex;gap:6px;";

  const countButton = makeButton("");
  countButton.addEventListener("click", () => handlers.onNextCount());
  buttons.append(countButton);

  // Il tutto schermo non esiste in ogni browser: il tasto compare solo dove si può usare.
  if (typeof document.documentElement.requestFullscreen === "function") {
    const fullscreenButton = makeButton("tutto schermo");
    fullscreenButton.addEventListener("click", () => toggleFullscreen(fullscreenButton));
    buttons.append(fullscreenButton);
  }

  box.append(text, buttons);
  document.body.append(box);

  return {
    setLines(lines) {
      text.textContent = lines.join("\n");
    },
    setCount(count) {
      countButton.textContent = `sprite: ${count}`;
    },
    destroy() {
      box.remove();
    },
  };
}

// makeButton: un tasto abbastanza grande da premere con il dito.
function makeButton(label: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.style.cssText =
    "font:12px monospace;padding:8px 10px;background:#2c3550;color:#ffffff;border:1px solid #56638a;";
  return button;
}

// toggleFullscreen: entra o esce dal tutto schermo. Se il browser dice di no, lo scrive sul tasto.
function toggleFullscreen(button: HTMLButtonElement) {
  if (document.fullscreenElement) {
    void document.exitFullscreen();
    return;
  }
  document.documentElement.requestFullscreen().catch(() => {
    button.textContent = "tutto schermo negato";
  });
}
