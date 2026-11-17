"use client";
// Fabrique, sur cet appareil, les deux clés qui signent les rappels. Rien n’est envoyé nulle part.
import { useState } from "react";
import { useStore } from "../Store";

const b64u = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

export function Cles() {
  const { toast } = useStore();
  const [k, setK] = useState<{ pub: string; priv: string } | null>(null);
  const make = async () => {
    const pair = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
    const pub = b64u(await crypto.subtle.exportKey("raw", pair.publicKey));
    const jwk = await crypto.subtle.exportKey("jwk", pair.privateKey);
    setK({ pub, priv: jwk.d! });
  };
  const copy = async (v: string) => { try { await navigator.clipboard.writeText(v); toast("Copié"); } catch { toast("Sélectionne et copie à la main"); } };
  return (
    <>
      <div className="page"><h1>Clés des rappels</h1>
        <p className="lead">À faire une seule fois, par la personne qui gère l’application. Les clés sont fabriquées sur cet appareil : rien n’est envoyé.</p></div>
      {!k ? <button className="navbtn primary" onClick={make}>Fabriquer les clés</button> : (
        <section className="sec">
          <p className="secintro">Dans Vercel › Settings › Environment Variables, crée ces deux variables (type « Config » pour la première, « Secret » pour la seconde), puis redéploie.</p>
          <label className="field"><span>NEXT_PUBLIC_VAPID_PUBLIC_KEY</span><textarea className="area keybox" readOnly value={k.pub} onFocus={(e) => e.target.select()} /></label>
          <button className="navbtn strong" onClick={() => copy(k.pub)}>Copier la clé publique</button>
          <label className="field" style={{ marginTop: 18 }}><span>VAPID_PRIVATE_KEY</span><textarea className="area keybox" readOnly value={k.priv} onFocus={(e) => e.target.select()} /></label>
          <button className="navbtn strong" onClick={() => copy(k.priv)}>Copier la clé privée</button>
          <p className="warn" style={{ marginTop: 16 }}>La clé privée ne doit aller que dans Vercel : ne l’envoie à personne. Si tu quittes cette page, il faudra en refaire une paire.</p>
        </section>
      )}
    </>
  );
}
