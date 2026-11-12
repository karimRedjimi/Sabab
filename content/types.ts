export type GradeId = "coran" | "sahih" | "hasan";
export interface Grade { label: string; cls: string }
export interface Slot { l: string; t: number }
export interface Item {
  kind: "dua" | "action";
  title: string;
  moment?: string;
  when?: "fajr" | "lastHour";
  ar?: string;
  ph?: string;
  fr?: string;
  desc?: string;
  grade?: GradeId;
  src?: string;
  note?: string;
  slots?: Slot[];
  optional?: boolean;
  task?: boolean;
  /** false : texte ajouté en attente de vérification par une personne de science. */
  verif?: boolean;
}
export interface Day { name: string; theme: string; items: string[] }
export interface Parcours { title: string; intro: string; duas: string[]; actions: string[] }
export interface ObjCat { l: string; p: string }
export type City = [string, number, number];
export interface Method { l: string; f: number; i: number }
export interface Level { l: string; d: string; show: { ar: boolean; ph: boolean; fr: boolean } }
