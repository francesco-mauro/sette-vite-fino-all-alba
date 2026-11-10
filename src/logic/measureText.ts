// Le righe di testo del pannello della misura: logica pura.
import type { FrameStats } from "./frameMeter";

// formatStats: la riga dei numeri. Il buco in millisecondi interi, il calcolo medio e quello più lungo con un decimale.
export function formatStats(stats: FrameStats): string {
  const gap = Math.round(stats.maxGapMs);
  const avg = stats.avgWorkMs.toFixed(1);
  const max = stats.maxWorkMs.toFixed(1);
  return `${stats.fps} fps · buco max ${gap} ms · calcolo ${avg} ms (max ${max})`;
}

// formatJoystick: la riga del joystick. La forza va da 0, fermo, a 1, spinto fino al bordo. L'angolo è in gradi.
export function formatJoystick(force: number, angleDeg: number): string {
  if (force <= 0) return "joystick: fermo";
  return `joystick: forza ${Math.min(force, 1).toFixed(2)}, angolo ${Math.round(angleDeg)}°`;
}
