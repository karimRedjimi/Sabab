// « Commente ton souci » : chercher un travail depuis des mois. Invocation : « Demander de la grâce d’Allah » (Muslim n° 713).
// Textes religieux : public/voix/souci.textes.json (copiés par programme depuis content/programme.ts · fadl et PARCOURS.rizq).
import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, AR, FONT, GOLD, PLUM, W, H, minutage, zone, SousTitres, Voile, Fond, StarP, Scene, Flash, Phone, Pastille, Surligne, Logo, Son, type Sfx } from "../moteur";
import voix from "../../public/voix/souci.json";
import tx from "../../public/voix/souci.textes.json";

const T = minutage(voix);
const { L, mot } = T;
const D = tx.dua;
const GESTE = tx.geste.texte;

// ---------- 1. L’accroche : le souci, tel qu’on le lit souvent ----------
const Souci: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - 2, fps, config: { damping: 11, stiffness: 170 } });
  const rep = spring({ frame: f - 14, fps, config: { damping: 10, stiffness: 200 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", transform: `scale(${rep})` }}>
        <span style={{ display: "inline-block", padding: "14px 34px", borderRadius: 999, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 42 }}>Un souci qu’on lit souvent</span>
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 440, padding: "40px 44px", borderRadius: 40, background: "#fff", boxShadow: "0 30px 90px rgba(0,0,0,0.5)",
        transform: `translateY(${(1 - s) * 140}px) rotate(${(1 - s) * -4}deg)`, opacity: s, display: "flex", gap: 30, alignItems: "center" }}>
        <div style={{ flex: "none", width: 96, height: 96, borderRadius: "50%", background: "#E8DDE6", display: "grid", placeItems: "center" }}>
          <svg width={60} height={60} viewBox="0 0 24 24" fill="#B79CB0"><circle cx="12" cy="8" r="4.2" /><path d="M3.5 21c.8-4.4 4.2-7 8.5-7s7.7 2.6 8.5 7z" /></svg>
        </div>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 52, lineHeight: 1.25, color: PLUM }}>Je cherche du travail depuis des mois, et je n’ai que des refus.</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 2. Un refus ne dit rien de ta valeur : les tampons s’effacent, l’étoile reste ----------
const Refus: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const v = spring({ frame: f - mot(/^valeur/, 1), fps, config: { damping: 11, stiffness: 140 } });
  return (
    <AbsoluteFill>
      {[0, 1, 2, 3].map((i) => {
        const s = spring({ frame: f - L[1] - i * 6, fps, config: { damping: 9, stiffness: 220 } });
        return <div key={i} style={{ position: "absolute", left: 150 + (i % 2) * 380, top: 300 + Math.floor(i / 2) * 250, padding: "16px 30px", border: "6px solid rgba(255,255,255,0.55)", borderRadius: 18,
          fontFamily: FONT, fontWeight: 800, fontSize: 56, letterSpacing: "0.1em", color: "rgba(255,255,255,0.6)", transform: `rotate(${(random("r" + i) - 0.5) * 24}deg) scale(${1.6 - 0.6 * s})`,
          opacity: s * (1 - v) }}>REFUS</div>;
      })}
      <div style={{ position: "absolute", left: 540 - 130, top: 470, transform: `scale(${v})`, opacity: v }}><StarP size={260} glow={60} /></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 70, color: "#fff", opacity: v }}>ta valeur <span style={{ color: GOLD }}>reste</span></div>
    </AbsoluteFill>
  );
};

// ---------- 3. Une du’â très courte, puis l’invocation ----------
const Courte: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - mot(/^courte/, 2), fps, config: { damping: 9, stiffness: 200 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 340, right: 340, top: 520, height: 260, borderRadius: 40, background: "rgba(42,12,34,0.92)", boxShadow: `0 0 0 4px ${GOLD}, 0 0 60px rgba(233,196,106,0.5)`,
        transform: `scale(${s})`, display: "grid", placeItems: "center", fontFamily: FONT, fontWeight: 800, fontSize: 60, color: GOLD }}>une phrase</div>
    </AbsoluteFill>
  );
};
const LaDua: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = spring({ frame: f - L[3], fps, config: { damping: 13, stiffness: 140 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 40, right: 40, top: 300, textAlign: "center", direction: "rtl", fontFamily: AR, fontSize: 88, lineHeight: 1.5, color: GOLD, opacity: a, transform: `scale(${0.85 + 0.15 * a})`,
        textShadow: "0 0 50px rgba(233,196,106,0.7)" }}>{D.ar}</div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 560, textAlign: "center", fontFamily: FONT, fontStyle: "italic", fontSize: 46, color: "rgba(255,255,255,0.85)", opacity: interpolate(f, [L[3] + 6, L[3] + 18], [0, 1], C) }}>{D.ph}</div>
      <div style={{ position: "absolute", left: 100, right: 100, top: 700, padding: "36px 40px", borderRadius: 36, background: "rgba(42,12,34,0.9)", boxShadow: "0 0 0 3px rgba(233,196,106,0.6)",
        textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 64, lineHeight: 1.3, color: "#fff", opacity: interpolate(f, [L[3] + 10, L[3] + 22], [0, 1], C) }}>{D.fr}</div>
    </AbsoluteFill>
  );
};

// ---------- 4. En sortant de la mosquée, et la source : la fiche dans l’appli ----------
const E = "ecrans/fiche-fadl";
const ZTITRE = zone(E, /^Demander de la grâce d’Allah$/, 1), ZSRC = zone(E, /^Source : Muslim \(n° 713\)$/);
const Fiche: React.FC = () => <Phone ecran={E} from={L[4] - 4} to={L[6] + 2} entree="bas" sortie="gauche" focus={[{ at: L[4] + 6, px: 0.5, py: 0.3, s: 1.08 }]}>
  <Surligne at={mot(/^Prophète/, 4)} {...ZTITRE} fin={mot(/^Muslim/, 5) - 2} />
  <Pastille at={mot(/^mosquée/, 4)} x={W * 0.5} y={H * 0.6} gold>En sortant de la mosquée</Pastille>
  <Surligne at={mot(/^Muslim/, 5)} {...ZSRC} />
</Phone>;

// ---------- 5. Tu demandes, et tu continues : les candidatures partent, les portes attendent ----------
const Candidatures: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const porte = spring({ frame: f - mot(/^porte/, 6), fps, config: { damping: 12, stiffness: 140 } });
  return (
    <AbsoluteFill>
      {[0, 1, 2, 3, 4].map((i) => {
        const t = interpolate(f, [mot(/^candidatures/, 6) - 10 + i * 7, mot(/^candidatures/, 6) + 30 + i * 7], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
        const x = 540 + (i - 2) * 190 * t, y = 980 - 520 * t;
        return <svg key={i} width={130} height={100} viewBox="0 0 26 20" style={{ position: "absolute", left: x - 65, top: y - 50, opacity: t > 0 && t < 1 ? 1 : t >= 1 ? 0.35 : 0, transform: `rotate(${(i - 2) * 8 * t}deg)` }}>
          <rect x={1} y={1} width={24} height={18} rx={3} fill="#fff" /><path d="M1 3l12 9 12-9" fill="none" stroke={PLUM} strokeWidth={1.6} />
        </svg>;
      })}
      {[-1, 0, 1].map((k) => (
        <div key={k} style={{ position: "absolute", left: 540 + k * 260 - 80, top: 260, width: 160, height: 240, borderRadius: "80px 80px 12px 12px", border: `6px solid ${GOLD}`,
          background: k === 0 ? `rgba(233,196,106,${0.5 * porte})` : "rgba(42,12,34,0.6)", boxShadow: k === 0 ? `0 0 ${70 * porte}px rgba(233,196,106,0.9)` : "none", opacity: 0.5 + 0.5 * porte }} />
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1110, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 62, color: "#fff", opacity: porte }}>d’où viendra la porte ? <span style={{ color: GOLD }}>Allah sait.</span></div>
    </AbsoluteFill>
  );
};

// ---------- 6. Dans Sabab : le besoin sur l’accueil ----------
const A = "ecrans/emploi-accueil";
const ZBESOIN = zone(A, /^Trouver un travail$/), ZCONT = zone(A, /^Continuer · Le matin$/);
const Besoin: React.FC = () => <Phone ecran={A} from={L[7] - 4} to={L[8] + 2} entree="droite" sortie="recul" focus={[{ at: L[7] + 6, px: 0.5, py: 0.45, s: 1.08 }]}>
  <Surligne at={mot(/^besoin/, 7)} {...ZBESOIN} fin={mot(/^invocation/, 7) - 2} />
  <Surligne at={mot(/^invocation/, 7)} {...ZCONT} />
</Phone>;

// ---------- 7. Le geste du jour, tel qu’écrit dans le parcours ----------
const Geste: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - L[8] - 6, fps, config: { damping: 12, stiffness: 160 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 40, letterSpacing: "0.1em", color: GOLD, opacity: s }}>LE GESTE DU JOUR</div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 470, padding: "44px 44px 44px 150px", borderRadius: 36, background: "rgba(42,12,34,0.92)", boxShadow: `0 0 0 3px ${GOLD}, 0 30px 70px rgba(0,0,0,0.4)`,
        transform: `translateY(${(1 - s) * 200}px)`, opacity: s, fontFamily: FONT, fontWeight: 700, fontSize: 52, lineHeight: 1.3, color: "#fff" }}>
        <div style={{ position: "absolute", left: 44, top: "50%", marginTop: -38, width: 76, height: 76, borderRadius: 20, border: `5px solid ${GOLD}`, display: "grid", placeItems: "center" }}>
          <svg width={46} height={46} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" style={{ opacity: interpolate(f, [mot(/^repoussais/, 8), mot(/^repoussais/, 8) + 6], [0, 1], C) }}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        </div>
        {GESTE}
      </div>
    </AbsoluteFill>
  );
};

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[2] - 8, L[3] + 10, L[7] - 6, L[9] - 4, T.DUREE]} />
    <Scene from={0} to={L[1] - 2} zin={0}><Souci /></Scene>
    <Scene from={L[1] - 4} to={L[2] - 2}><Refus /></Scene>
    <Scene from={L[2] - 4} to={L[3] - 2}><Courte /></Scene>
    <Scene from={L[3] - 4} to={L[4] - 2}><LaDua /></Scene>
    <Fiche />
    <Scene from={L[6] - 4} to={L[7] - 2}><Candidatures /></Scene>
    <Besoin />
    <Scene from={L[8] - 4} to={L[9] - 2}><Geste /></Scene>
    <Scene from={L[9] - 4} to={T.DUREE + 10} zin={0}><Logo at={L[9]} phrase="Demander, agir, tenir" /></Scene>
    <Flash at={L[3]} />
    <Voile />
    <SousTitres T={T} or={/^(refus|valeur|courte|grâce|Prophète|mosquée|Muslim|candidatures|porte|besoin|invocation|geste|candidature|Sabab|tenir)/i} grandsDes={9} />
    <Son voix="souci.mp3" sfx={SFX} />
  </AbsoluteFill>
);
const SFX: Sfx[] = [
  ["message", 3, 0.5], ["pop", 16, 0.4],
  ["whoosh", L[1] - 6, 0.5], ...[0, 1, 2, 3].map((i) => ["impact", L[1] + i * 6, 0.25] as Sfx), ["shimmer", mot(/^valeur/, 1) + 8, 0.5],
  ["whoosh", L[2] - 6, 0.4], ["pop", mot(/^courte/, 2) + 8, 0.5],
  ["shimmer", L[3] - 4, 0.6],
  ["whoosh", L[4] - 6, 0.5], ["ding", mot(/^mosquée/, 4) + 10, 0.4], ["tick", mot(/^Muslim/, 5) + 8, 0.4],
  ["whoosh", L[6] - 6, 0.5], ["envol", mot(/^candidatures/, 6) + 14, 0.3], ["shimmer", mot(/^porte/, 6) + 8, 0.4],
  ["whoosh", L[7] - 6, 0.6], ["tick", mot(/^besoin/, 7) + 8, 0.4],
  ["whoosh", L[8] - 6, 0.5], ["pop", mot(/^repoussais/, 8) + 10, 0.5],
  ["impact", L[9], 0.6], ["shimmer", L[9] + 2, 0.6],
];
export const video = { id: "souci", component: Video, duree: T.DUREE };
