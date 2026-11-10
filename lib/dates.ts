import { MONTHS } from "@/content/reglages";

export const pad = (n: number) => String(n).padStart(2, "0");
export const keyOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export function fromKey(k: string) { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); }
export function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
export function today() { const t = new Date(); t.setHours(0, 0, 0, 0); return t; }
export const sameDay = (a: Date, b: Date) => keyOf(a) === keyOf(b);
export const monday = (d: Date) => addDays(d, -((d.getDay() + 6) % 7));
export const diffDays = (a: Date, b: Date) => Math.round((a.getTime() - b.getTime()) / 86400000);
export const fmtDate = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
export const fmtShort = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]}`;
export const nf = (n: number) => n.toLocaleString("fr-FR");
