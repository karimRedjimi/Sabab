// Le verset du jour en image, dessinée sur le téléphone (rien n’est envoyé à un serveur).
// Aucune donnée personnelle dans l’image : le verset, sa référence, la date, et la marque.
import { starPoints } from "@/components/Star";

/** Coupe un texte en lignes qui tiennent dans `max` (mesure fournie, pour pouvoir tester sans navigateur). */
export function wrapWords(text: string, max: number, measure: (s: string) => number): string[] {
  const words = text.split(/\s+/).filter(Boolean), lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (cur && measure(t) > max) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}

export interface VersetImage { ar: string; fr: string; ref: string; date: string }

const W = 1080, H = 1350;
const cssVar = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

function star(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  const pts = starPoints(x, y, r).split(" ").map((p) => p.split(",").map(Number));
  ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.closePath();
}

export async function dessinerVerset(v: VersetImage): Promise<Blob> {
  const amiri = cssVar("--font-amiri") || "serif", sans = cssVar("--font-dmsans") || "sans-serif";
  await Promise.all([document.fonts.load(`64px ${amiri}`, v.ar), document.fonts.load(`38px ${sans}`, v.fr), document.fonts.load(`600 30px ${sans}`, "Sabab")]).catch(() => {});
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;
  // Le ciel prune
  const g = ctx.createRadialGradient(W / 2, 80, 40, W / 2, 200, 1250);
  g.addColorStop(0, "#8B3A6E"); g.addColorStop(0.45, "#5B1E47"); g.addColorStop(1, "#2A0C22");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, 330, 10, W / 2, 330, 520);
  glow.addColorStop(0, "rgba(233,196,106,0.22)"); glow.addColorStop(1, "rgba(233,196,106,0)");
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(255,255,255,0.10)"; ctx.lineWidth = 2;
  for (const [x, y, r] of [[110, 140, 120], [990, 90, 70], [960, 1060, 170], [90, 1180, 80]]) { star(ctx, x, y, r); ctx.stroke(); }

  // En-tête
  ctx.textAlign = "center"; ctx.textBaseline = "alphabetic"; ctx.direction = "ltr";
  ctx.fillStyle = "#E9C46A"; ctx.font = `600 28px ${sans}`;
  ctx.fillText("UN JOUR, UN VERSET", W / 2, 150);
  ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.font = `400 28px ${sans}`;
  ctx.fillText(v.date, W / 2, 196);

  // L’arabe : la taille s’adapte à la longueur du verset
  let size = 70, arLines: string[] = [], frLines: string[] = [];
  for (; size >= 40; size -= 4) {
    ctx.font = `${size}px ${amiri}`; ctx.direction = "rtl";
    arLines = wrapWords(v.ar, 900, (s) => ctx.measureText(s).width);
    ctx.font = `400 ${Math.round(size * 0.52)}px ${sans}`; ctx.direction = "ltr";
    frLines = wrapWords(v.fr, 880, (s) => ctx.measureText(s).width);
    const h = arLines.length * size * 1.95 + 70 + frLines.length * size * 0.52 * 1.45;
    if (h < 760) break;
  }
  const frSize = Math.round(size * 0.52), blockH = arLines.length * size * 1.95 + 70 + frLines.length * frSize * 1.45;
  let y = 250 + (820 - blockH) / 2 + size * 1.3;
  ctx.fillStyle = "#FFFFFF"; ctx.font = `${size}px ${amiri}`; ctx.direction = "rtl";
  for (const l of arLines) { ctx.fillText(l, W / 2, y); y += size * 1.95; }
  y += -size * 0.9 + 20;
  ctx.fillStyle = "#E9C46A"; star(ctx, W / 2, y, 12); ctx.fill();
  y += 64;
  ctx.direction = "ltr"; ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.font = `400 ${frSize}px ${sans}`;
  for (const l of frLines) { ctx.fillText(l, W / 2, y); y += frSize * 1.45; }

  // Référence et marque
  ctx.fillStyle = "rgba(255,255,255,0.65)"; ctx.font = `400 28px ${sans}`;
  ctx.fillText(v.ref, W / 2, H - 150);
  ctx.fillStyle = "#E9C46A"; star(ctx, W / 2 - 62, H - 82, 20); ctx.fill();
  ctx.fillStyle = "#FFFFFF"; ctx.font = `600 34px ${sans}`; ctx.textAlign = "left";
  ctx.fillText("Sabab", W / 2 - 30, H - 70);

  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("image"))), "image/png"));
}

/** Partage l’image (feuille de partage du téléphone), sinon la télécharge. */
export async function partagerVerset(v: VersetImage): Promise<"partagé" | "téléchargé" | "annulé"> {
  const blob = await dessinerVerset(v);
  const file = new File([blob], "sabab-verset-du-jour.png", { type: "image/png" });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try { await nav.share({ files: [file], title: "Un jour, un verset" }); return "partagé"; }
    catch (e) { if ((e as Error).name === "AbortError") return "annulé"; }
  }
  const url = URL.createObjectURL(blob), a = document.createElement("a");
  a.href = url; a.download = file.name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return "téléchargé";
}
