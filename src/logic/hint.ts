// La scritta d'inizio partita, «muoviti: il gatto attacca da solo»: appena il gatto si muove la regola
// è capita e la scritta se ne va; se resta fermo, sparisce comunque dopo hintMs di notte. Logica pura.

export function hintDone(moved: boolean, elapsed: number, hintMs: number): boolean {
  return moved || elapsed > hintMs;
}
