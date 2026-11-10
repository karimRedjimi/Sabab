"use client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { merge } from "@/lib/state";
import { clearLocal, exportFileName, exportPayload, parseImport } from "@/lib/storage";
import { useStore } from "../Store";

export function Donnees() {
  const { S, update, toast } = useStore();
  const router = useRouter();
  const file = useRef<HTMLInputElement>(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const days = Object.keys(S.days).length;

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(exportPayload(S), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = exportFileName(); document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Fichier enregistré");
  };
  const importJson = async (f: File) => {
    try {
      const data = merge(parseImport(await f.text()));
      update((s) => { Object.assign(s, data); });
      toast("Données importées");
    } catch { toast("Ce fichier n’est pas un export du Programme du rizq"); }
  };
  const wipe = () => {
    clearLocal();
    update((s) => { Object.assign(s, merge(null)); });
    clearLocal();
    toast("Toutes tes données ont été effacées");
    router.replace("/bienvenue");
  };

  return (
    <>
      <div className="page"><h1>Mes données</h1>
        <p className="lead">Tout ce que tu enregistres t’appartient.</p></div>
      <section className="sec"><div className="sechead"><h2>Exporter</h2></div>
        <p className="secintro">Un fichier lisible (JSON) avec ta progression ({days} jour{days > 1 ? "s" : ""}), tes notes, ton objectif, ton carnet et tes révisions.</p>
        <button className="navbtn primary" onClick={exportJson}>Télécharger mes données</button></section>
      <section className="sec"><div className="sechead"><h2>Importer</h2></div>
        <p className="secintro">Reprends un fichier exporté depuis cette application. Il remplace les données de cet appareil.</p>
        <input ref={file} type="file" accept="application/json,.json" className="sr-only" id="importfile" onChange={(e) => { const f = e.target.files?.[0]; if (f) importJson(f); e.target.value = ""; }} />
        <button className="navbtn strong" onClick={() => file.current?.click()}>Choisir un fichier</button></section>
      <section className="sec"><div className="sechead"><h2>Tout effacer</h2></div>
        <p className="secintro">Supprime définitivement toutes tes données de cet appareil. Pense à les exporter d’abord si tu veux les garder.</p>
        {confirmDel
          ? <div className="row"><button className="navbtn primary" onClick={wipe}>Confirmer l’effacement</button><button className="link" onClick={() => setConfirmDel(false)}>Annuler</button></div>
          : <button className="link danger" onClick={() => setConfirmDel(true)}>Effacer toutes mes données</button>}
      </section>
    </>
  );
}
