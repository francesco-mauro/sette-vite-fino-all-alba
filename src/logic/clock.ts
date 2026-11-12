// L'orologio della notte: i millisecondi di partita scritti come mm:ss. Logica pura, senza Phaser.
export function formatClock(ms: number): string {
  const total = Math.floor(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
