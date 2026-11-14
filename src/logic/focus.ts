// La pausa quando la pagina perde il fuoco, controllata a ogni fotogramma sul telefono, dove la tendina può non
// mandare nessun evento (Francesco, 14 novembre 2026: alzando la tendina la partita non si fermava).
// Logica pura, senza Phaser.

// lostFocus: vero solo nel passaggio da «la pagina ha il fuoco» a «non ce l'ha». Un telefono che dice sempre
// «niente fuoco» non tiene la partita in pausa per sempre: dopo la ripresa si riparte dallo stato di quel momento.
export function lostFocus(wasFocused: boolean, isFocused: boolean): boolean {
  return wasFocused && !isFocused;
}
