// Le poche cose di Node che usa il progetto: vite.config.ts per scrivere la versione (le variabili
// d'ambiente e git), il test delle icone delle carte per leggere la misura dei PNG.
// Dichiarate qui a mano invece di aggiungere @types/node, che servirebbe solo per queste righe.
declare const process: { env: Record<string, string | undefined> };
declare module "node:child_process" {
  export function execSync(command: string, options: { encoding: "utf8" }): string;
}
declare module "node:fs" {
  export function readFileSync(path: string): { readUInt32BE(offset: number): number };
}
