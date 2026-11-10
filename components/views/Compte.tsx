"use client";
import Link from "next/link";
import { useState } from "react";
import { supabase, errMsg } from "@/lib/supabase";
import { useAccount } from "../Account";
import { useStore } from "../Store";

export const CONSENT_TEXT =
  "J’accepte que ma progression, mon carnet, mes notes et mon objectif soient enregistrés sur mon compte. Ces informations révèlent ma pratique religieuse : elles restent privées, ne sont jamais vendues ni partagées, et je peux les supprimer à tout moment.";

function Consent() {
  const { giveConsent, signOut } = useAccount();
  const { toast } = useStore();
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <section className="sec">
      <div className="sechead"><h2>Ton accord</h2></div>
      <label className="consent">
        <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} />
        <span>{CONSENT_TEXT}</span>
      </label>
      <div className="row" style={{ marginTop: 14 }}>
        <button className="navbtn primary" disabled={!ok || busy} onClick={async () => {
          setBusy(true);
          try { await giveConsent(); toast("Compte activé, ta progression te suit partout"); } catch (e) { toast(errMsg(e)); }
          setBusy(false);
        }}>Activer mon compte</button>
        <button className="link danger" onClick={signOut}>Annuler</button>
      </div>
    </section>
  );
}

function SignIn() {
  const { toast } = useStore();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const send = async () => {
    if (!supabase) return;
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { toast("Vérifie ton adresse e-mail"); return; }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}/compte` } });
    setBusy(false);
    if (error) { toast(errMsg(error)); return; }
    setSent(true); toast("E-mail envoyé, regarde ta boîte de réception");
  };
  const verify = async () => {
    if (!supabase) return;
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
    setBusy(false);
    if (error) { toast("Code incorrect ou expiré"); return; }
  };
  return (
    <section className="sec">
      {!sent ? (
        <>
          <label className="field"><span>Ton adresse e-mail</span>
            <input className="input" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="prenom@exemple.fr" /></label>
          <button className="navbtn primary" disabled={busy} onClick={send}>Recevoir un code</button>
          <p className="secintro" style={{ marginTop: 12 }}>Pas de mot de passe : tu reçois un e-mail avec un code à 6 chiffres ou un lien de connexion.</p>
        </>
      ) : (
        <>
          <p className="secintro">Un e-mail vient d’être envoyé à {email.trim()}. Clique sur le lien qu’il contient, ou saisis le code ci-dessous.</p>
          <label className="field"><span>Le code reçu</span>
            <input className="input" inputMode="numeric" autoComplete="one-time-code" maxLength={8} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="123456" /></label>
          <div className="row">
            <button className="navbtn primary" disabled={busy || code.length < 6} onClick={verify}>Me connecter</button>
            <button className="link" onClick={() => { setSent(false); setCode(""); }}>Changer d’adresse</button>
          </div>
        </>
      )}
    </section>
  );
}

export function Compte() {
  const acc = useAccount();
  const { toast } = useStore();
  const [confirmDel, setConfirmDel] = useState(false);
  const sync = { idle: "", syncing: "Synchronisation…", ok: "Ta progression est enregistrée sur ton compte et te suit sur tous tes appareils.", error: "La synchronisation a échoué, elle reprendra dès que possible." }[acc.sync];
  return (
    <>
      <div className="page"><h1>Mon compte</h1>
        <p className="lead">Pour retrouver ta progression sur tous tes appareils et rejoindre la communauté.</p></div>
      {acc.status === "off" && <p className="empty">Les comptes ne sont pas encore activés sur cette version. Ta progression reste enregistrée sur cet appareil.</p>}
      {acc.status === "loading" && <p className="empty">Chargement…</p>}
      {acc.status === "out" && <SignIn />}
      {acc.status === "consent" && <Consent />}
      {acc.status === "in" && (
        <>
          <div className="card">
            <h3>{acc.email}</h3>
            <p style={{ margin: 0 }}>{sync}</p>
          </div>
          <div className="row" style={{ margin: "8px 0 26px" }}>
            <button className="navbtn" onClick={async () => { await acc.signOut(); toast("Déconnecté. Ta progression reste sur cet appareil."); }}>Me déconnecter</button>
            {acc.moderator && <Link className="navbtn strong" href="/moderation">Modération</Link>}
          </div>
          <section className="sec"><div className="sechead"><h2>Supprimer mon compte</h2></div>
            <p className="secintro">Supprime définitivement ton compte, tes données enregistrées et tes demandes dans la communauté. Ce qui est sur cet appareil reste, tu peux l’effacer dans <Link href="/donnees">Mes données</Link>.</p>
            {confirmDel ? (
              <div className="row">
                <button className="navbtn primary" onClick={async () => { try { await acc.deleteAccount(); toast("Ton compte a été supprimé"); } catch (e) { toast(errMsg(e)); } }}>Confirmer la suppression</button>
                <button className="link" onClick={() => setConfirmDel(false)}>Annuler</button>
              </div>
            ) : <button className="link danger" onClick={() => setConfirmDel(true)}>Supprimer mon compte</button>}
          </section>
        </>
      )}
    </>
  );
}
