// Le due cose di Node che usa vite.config.ts per scrivere la versione: le variabili d'ambiente e git.
// Dichiarate qui a mano invece di aggiungere @types/node, che servirebbe solo per queste due righe.
declare const process: { env: Record<string, string | undefined> };
declare module "node:child_process" {
  export function execSync(command: string, options: { encoding: "utf8" }): string;
}
