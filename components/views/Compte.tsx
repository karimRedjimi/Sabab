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

const EMAIL_OK = (e: string) => /^\S+@\S+\.\S+$/.test(e.trim());

/** Un champ mot de passe, avec le bouton pour l’afficher. */
function PasswordField({ value, onChange, label, isNew }: { value: string; onChange: (v: string) => void; label: string; isNew?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <label className="field"><span>{label}</span>
      <span className="pwd">
        <input className="input" type={show ? "text" : "password"} autoComplete={isNew ? "new-password" : "current-password"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={isNew ? "8 caractères au moins" : ""} />
        <button type="button" className="pwdeye" onClick={() => setShow(!show)} aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}>{show ? "Masquer" : "Afficher"}</button>
      </span>
    </label>
  );
}

function SignIn() {
  const { toast } = useStore();
  const [mode, setMode] = useState<"code" | "mdp">("code");
  const [creer, setCreer] = useState(false);
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [sent, setSent] = useState<null | "email" | "signup">(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const redirect = () => `${window.location.origin}/compte`;
  const send = async () => {
    if (!supabase) return;
    if (!EMAIL_OK(email)) { toast("Vérifie ton adresse e-mail"); return; }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true, emailRedirectTo: redirect() } });
    setBusy(false);
    if (error) { toast(errMsg(error)); return; }
    setSent("email"); toast("E-mail envoyé, regarde ta boîte de réception");
  };
  const withPassword = async () => {
    if (!supabase) return;
    if (!EMAIL_OK(email)) { toast("Vérifie ton adresse e-mail"); return; }
    if (pwd.length < 8) { toast("Mot de passe trop court : 8 caractères au moins"); return; }
    setBusy(true);
    if (creer) {
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password: pwd, options: { emailRedirectTo: redirect() } });
      setBusy(false);
      if (error) { toast(errMsg(error)); return; }
      // Adresse déjà inscrite : Supabase ne le dit pas directement.
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) { toast("Un compte existe déjà avec cette adresse : connecte-toi"); setCreer(false); return; }
      if (!data.session) { setSent("signup"); toast("Un code de confirmation t’a été envoyé"); }
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pwd });
    setBusy(false);
    if (error) toast(errMsg(error));
  };
  const forgot = async () => {
    if (!supabase) return;
    if (!EMAIL_OK(email)) { toast("Entre d’abord ton adresse e-mail"); return; }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: redirect() });
    setBusy(false);
    toast(error ? errMsg(error) : "Un lien pour choisir un nouveau mot de passe t’a été envoyé");
  };
  const verify = async () => {
    if (!supabase || !sent) return;
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: sent });
    setBusy(false);
    if (error) { toast("Code incorrect ou expiré"); return; }
  };
  const [google, setGoogle] = useState(false);
  useEffect(() => { googleEnabled().then(setGoogle); }, []);
  const withGoogle = async () => {
    if (!supabase) return;
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirect() } });
    if (error) { setBusy(false); toast(errMsg(error)); }
  };

  if (sent) return (
    <section className="sec">
      <p className="secintro">Un e-mail vient d’être envoyé à {email.trim()}. Saisis le code qu’il contient, ou touche son lien.</p>
      <label className="field"><span>Le code reçu</span>
        <input className="input" inputMode="numeric" autoComplete="one-time-code" maxLength={8} enterKeyHint="go" autoFocus value={code} onKeyDown={(e) => { if (e.key === "Enter" && code.length >= 6) verify(); }} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="123456" /></label>
      <div className="row">
        <button className="navbtn primary" disabled={busy || code.length < 6} onClick={verify}>{sent === "signup" ? "Confirmer mon adresse" : "Me connecter"}</button>
        <button className="link" onClick={() => { setSent(null); setCode(""); }}>Changer d’adresse</button>
      </div>
    </section>
  );

  return (
    <section className="sec">
      {google && (
        <>
          <button className="gbtn" disabled={busy} onClick={withGoogle}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.5 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8z" /><path fill="#34A853" d="M12 23c3 0 5.4-1 7.2-2.7l-3.5-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.2v2.8A11 11 0 0 0 12 23z" /><path fill="#FBBC05" d="M5.8 14.2a6.6 6.6 0 0 1 0-4.3V7.1H2.2a11 11 0 0 0 0 9.9l3.6-2.8z" /><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.6l3.1-3.1A11 11 0 0 0 2.2 7.1l3.6 2.8C6.7 7.3 9.1 5.4 12 5.4z" /></svg>
            Continuer avec Google
          </button>
          <p className="or"><span>ou avec ton e-mail</span></p>
        </>
      )}
      <nav className="seg" aria-label="Comment te connecter ?">
        <a href="#" aria-current={mode === "code" ? "page" : undefined} onClick={(e) => { e.preventDefault(); setMode("code"); }}>Code par e-mail</a>
        <a href="#" aria-current={mode === "mdp" ? "page" : undefined} onClick={(e) => { e.preventDefault(); setMode("mdp"); }}>Mot de passe</a>
      </nav>
      {mode === "code" ? (
        <>
          <form onSubmit={(e) => { e.preventDefault(); send(); }}>
            <label className="field"><span>Ton adresse e-mail</span>
              <input className="input" type="email" autoComplete="email" inputMode="email" enterKeyHint="send" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="prenom@exemple.fr" /></label>
            <button className="navbtn primary" type="submit" disabled={busy}>Recevoir un code</button>
          </form>
          <p className="secintro" style={{ marginTop: 12 }}>Rien à retenir : tu reçois un code à 6 chiffres. Le compte est créé à la première connexion.</p>
        </>
      ) : (
        <>
          <form onSubmit={(e) => { e.preventDefault(); withPassword(); }}>
            <label className="field"><span>Ton adresse e-mail</span>
              <input className="input" type="email" autoComplete={creer ? "email" : "username"} inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="prenom@exemple.fr" /></label>
            <PasswordField label={creer ? "Choisis un mot de passe" : "Ton mot de passe"} value={pwd} onChange={setPwd} isNew={creer} />
            <button className="navbtn primary" type="submit" disabled={busy}>{creer ? "Créer mon compte" : "Me connecter"}</button>
          </form>
          <div className="row" style={{ marginTop: 10, gap: 18 }}>
            <button className="link" onClick={() => setCreer(!creer)}>{creer ? "J’ai déjà un compte" : "Créer un compte"}</button>
            {!creer && <button className="link" onClick={forgot}>Mot de passe oublié ?</button>}
          </div>
        </>
      )}
    </section>
  );
}

/** Choisir (ou changer) son mot de passe : après « mot de passe oublié », ou depuis son compte. */
function NewPassword({ title, onDone }: { title: string; onDone: () => void }) {
  const { toast } = useStore();
  const [pwd, setPwd] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form className="sec" onSubmit={async (e) => {
      e.preventDefault();
      if (!supabase) return;
      if (pwd.length < 8) { toast("Mot de passe trop court : 8 caractères au moins"); return; }
      setBusy(true);
      const { error } = await supabase.auth.updateUser({ password: pwd });
      setBusy(false);
      if (error) { toast(errMsg(error)); return; }
      toast("Mot de passe enregistré"); setPwd(""); onDone();
    }}>
      <div className="sechead"><h2>{title}</h2></div>
      <input type="text" autoComplete="username" hidden readOnly />
      <PasswordField label="Nouveau mot de passe" value={pwd} onChange={setPwd} isNew />
      <button className="navbtn primary" type="submit" disabled={busy}>Enregistrer</button>
    </form>
  );
}

export function Compte() {
  const acc = useAccount();
  const { toast } = useStore();
  const [confirmDel, setConfirmDel] = useState(false);
  const [setPwd, setSetPwd] = useState(false);
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
      {acc.recovery && acc.status !== "off" && <NewPassword title="Choisis un nouveau mot de passe" onDone={acc.endRecovery} />}
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
          {setPwd ? <NewPassword title="Mon mot de passe" onDone={() => setSetPwd(false)} />
            : <p style={{ margin: "0 0 22px" }}><button className="link" onClick={() => setSetPwd(true)}>Choisir ou changer mon mot de passe</button></p>}
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
