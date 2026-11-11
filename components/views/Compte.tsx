"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase, errMsg, googleEnabled, DEBUT_KEY } from "@/lib/supabase";
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
  const [google, setGoogle] = useState(false);
  useEffect(() => { googleEnabled().then(setGoogle); }, []);
  const withGoogle = async () => {
    if (!supabase) return;
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/compte` } });
    if (error) { setBusy(false); toast(errMsg(error)); }
  };
  return (
    <section className="sec">
      {!sent && google && (
        <>
          <button className="gbtn" disabled={busy} onClick={withGoogle}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.5 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8z" /><path fill="#34A853" d="M12 23c3 0 5.4-1 7.2-2.7l-3.5-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.300-1.900-6.200-4.500H2.200v2.800A11 11 0 0 0 12 23z" /><path fill="#FBBC05" d="M5.800 14.200a6.600 6.600 0 0 1 0-4.300V7.100H2.200a11 11 0 0 0 0 9.900l3.600-2.800z" /><path fill="#EA4335" d="M12 5.400c1.600 0 3.100.6 4.200 1.600l3.100-3.100A11 11 0 0 0 2.200 7.100l3.600 2.800C6.700 7.300 9.100 5.400 12 5.400z" /></svg>
            Continuer avec Google
          </button>
          <p className="or"><span>ou avec ton e-mail</span></p>
        </>
      )}
      {!sent ? (
        <>
          <form onSubmit={(e) => { e.preventDefault(); send(); }}>
            <label className="field"><span>Ton adresse e-mail</span>
              <input className="input" type="email" autoComplete="email" inputMode="email" enterKeyHint="send" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="prenom@exemple.fr" /></label>
            <button className="navbtn primary" type="submit" disabled={busy}>Recevoir un code</button>
          </form>
          <p className="secintro" style={{ marginTop: 12 }}>Pas de mot de passe : tu reçois un e-mail avec un code à 6 chiffres ou un lien de connexion.</p>
        </>
      ) : (
        <>
          <p className="secintro">Un e-mail vient d’être envoyé à {email.trim()}. Clique sur le lien qu’il contient, ou saisis le code ci-dessous.</p>
          <label className="field"><span>Le code reçu</span>
            <input className="input" inputMode="numeric" autoComplete="one-time-code" maxLength={8} enterKeyHint="go" autoFocus value={code} onKeyDown={(e) => { if (e.key === "Enter" && code.length >= 6) verify(); }} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="123456" /></label>
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
  // Ouverte à la fin de la configuration du début : on propose le compte, sans l’imposer.
  const router = useRouter();
  const [debut, setDebut] = useState(false);
  useEffect(() => { try { setDebut(sessionStorage.getItem(DEBUT_KEY) === "1"); } catch { /* */ } }, []);
  const leave = () => { try { sessionStorage.removeItem(DEBUT_KEY); } catch { /* */ } setDebut(false); router.replace("/"); };
  useEffect(() => { if (debut && acc.status === "in") { try { sessionStorage.removeItem(DEBUT_KEY); } catch { /* */ } router.replace("/"); } }, [debut, acc.status, router]);
  const welcome = debut && acc.status !== "in";
  return (
    <>
      <div className="page"><h1>{welcome ? "Crée ton compte" : "Mon compte"}</h1>
        <p className="lead">{welcome ? "Pour ne pas perdre ta progression, la retrouver sur tous tes appareils et rejoindre la communauté." : "Pour retrouver ta progression sur tous tes appareils et rejoindre la communauté."}</p></div>
      {acc.status === "off" && <p className="empty">Les comptes ne sont pas encore activés sur cette version. Ta progression reste enregistrée sur cet appareil.</p>}
      {acc.status === "loading" && <p className="empty">Chargement…</p>}
      {acc.status === "out" && <SignIn />}
      {acc.status === "consent" && <Consent />}
      {welcome && acc.status !== "off" && <p className="laterline"><button className="link" onClick={leave}>Plus tard, commencer sans compte</button></p>}
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
