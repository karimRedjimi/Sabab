"use client";
import { useStore } from "./Store";

/** Arabe, phonétique, français : trois petits interrupteurs, au moins un reste affiché. */
export function ShowToggles() {
  const { S, update, toast } = useStore();
  const t = (f: "ar" | "ph" | "fr", label: string) => (
    <button aria-pressed={S.show[f]} onClick={() => {
      const others = (["ar", "ph", "fr"] as const).filter((k) => k !== f && S.show[k]);
      if (S.show[f] && !others.length) { toast("Garde au moins un texte affiché"); return; }
      update((x) => { x.show[f] = !x.show[f]; });
    }}>{label}</button>
  );
  return <div className="vtog" role="group" aria-label="Textes affichés">{t("ar", "Arabe")}{t("ph", "Phonétique")}{t("fr", "Français")}</div>;
}

