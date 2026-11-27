// « Avant / Maintenant » : les adhkâr du matin oubliés. Aucun texte religieux dit.
// Avant (graphisme, gris) : le téléphone d’abord, notifications, café, trajet, « demain je m’y mets ». Maintenant : la journée par moments, la lecture guidée, la barre.
// Écran de lecture visible : programme.ts · dette (At-Tirmidhî n° 3563), affiché par l’appli, non dit.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, FONT, GOLD, PLUM, W, H, minutage, zone, englobe, SousTitres, Voile, Fond, Scene, Flash, Phone, Pastille, Surligne, Logo, Son, type Sfx } from "../moteur";
import voix from "../../public/voix/avant.json";

const T = minutage(voix);
const { L, mot } = T;
const BASCULE = L[3];

// ---------- Le fond « avant » : gris, qui se retire vers le bas à la bascule ----------
const Gris: React.FC = () => {
  const f = useCurrentFrame();
  const p = interpolate(f, [BASCULE - 6, BASCULE + 12], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  if (p >= 1) return null;
  return <AbsoluteFill style={{ background: "linear-gradient(180deg,#17171C,#22222A 60%,#2B2B33)", clipPath: `inset(${p * 100}% 0 0 0)` }} />;
};
const Etiquette: React.FC<{ texte: string; at: number; or?: boolean; top?: number }> = ({ texte, at, or, top = 150 }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 9, stiffness: 200 } });
  return <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", transform: `scale(${s})` }}>
    <span style={{ display: "inline-block", padding: "14px 44px", borderRadius: 999, background: or ? GOLD : "#3A3A44", color: or ? PLUM : "rgba(255,255,255,0.75)", fontFamily: FONT, fontWeight: 800, fontSize: 52, letterSpacing: "0.1em", boxShadow: or ? "0 0 60px rgba(233,196,106,0.7)" : "none" }}>{texte}</span>
  </div>;
};

// ---------- 1. L’accroche : le réveil, les notifications s’empilent, la carte du matin tombe dans la trappe ----------
const NOTIFS = ["12 nouveaux messages", "Vidéo recommandée", "3 mentions", "Promo du jour"];
const Reveil: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - 2, fps, config: { damping: 12, stiffness: 160 } });
  const tTrappe = mot(/^trappe/);
  const ouv = interpolate(f, [tTrappe - 16, tTrappe - 6], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  const chute = interpolate(f, [tTrappe - 8, tTrappe + 10], [0, 1], { ...C, easing: Easing.in(Easing.quad) });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 150, color: "#fff", transform: `scale(${s})`, fontVariantNumeric: "tabular-nums", textShadow: "0 0 40px rgba(140,160,255,0.4)" }}>07:00</div>
      {NOTIFS.map((n, i) => {
        const k = spring({ frame: f - mot(/^téléphone/) - i * 5, fps, config: { damping: 12, stiffness: 200 } });
        return <div key={i} style={{ position: "absolute", left: 140, right: 140, top: 400 + i * 104, height: 86, borderRadius: 26, background: "#3A3A44", display: "flex", alignItems: "center", gap: 20, padding: "0 28px",
          opacity: k, transform: `translateY(${(1 - k) * -60}px) scale(${0.9 + 0.1 * k})`, fontFamily: FONT, fontWeight: 700, fontSize: 38, color: "rgba(255,255,255,0.8)" }}>
          <span style={{ width: 44, height: 44, borderRadius: 12, background: ["#5865F2", "#E1306C", "#1DA1F2", "#F28C28"][i], opacity: 0.6 }} />{n}
        </div>;
      })}
      <div style={{ position: "absolute", left: 300, right: 300, top: 1120, height: 20, borderRadius: 10, background: "#101014", transform: `scaleY(${1 + ouv * 2})` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 900 + chute * 320, textAlign: "center", opacity: 1 - chute, transform: `rotate(${chute * 25}deg) scale(${1 - 0.4 * chute})` }}>
        <span style={{ display: "inline-block", padding: "22px 44px", borderRadius: 30, background: "rgba(233,196,106,0.25)", boxShadow: "0 0 0 3px rgba(233,196,106,0.5)", color: GOLD, fontFamily: FONT, fontWeight: 800, fontSize: 46 }}>Invocations du matin</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 2. Avant : notifications, café, trajet ----------
const Icone: React.FC<{ at: number; x: number; children: React.ReactNode; label: string }> = ({ at, x, children, label }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const k = spring({ frame: f - at, fps, config: { damping: 9, stiffness: 200 } });
  return <div style={{ position: "absolute", left: x - 140, top: 520, width: 280, textAlign: "center", transform: `scale(${k}) translateY(${(1 - k) * 60}px)`, opacity: k }}>
    <div style={{ width: 230, height: 230, margin: "0 auto", borderRadius: 60, background: "#33333C", boxShadow: "inset 0 0 0 3px rgba(255,255,255,0.12)", display: "grid", placeItems: "center" }}>
      <svg width={130} height={130} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">{children}</svg>
    </div>
    <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 40, color: "rgba(255,255,255,0.7)", marginTop: 20 }}>{label}</div>
  </div>;
};
const Matinee: React.FC = () => (
  <AbsoluteFill>
    <Etiquette texte="AVANT" at={L[1] - 6} />
    <Icone at={mot(/^notifications/, 1)} x={200} label="Notifications"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" /></Icone>
    <Icone at={mot(/^café/, 1)} x={540} label="Café"><path d="M17 8h1a4 4 0 0 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" /><path d="M7 2v3M11 2v3M15 2v3" /></Icone>
    <Icone at={mot(/^trajet/, 1)} x={880} label="Trajet"><rect x={4} y={3} width={16} height={14} rx={3} /><path d="M4 11h16M8 21l-1.5-4M16 21l1.5-4" /><circle cx={8} cy={14} r={0.8} /><circle cx={16} cy={14} r={0.8} /></Icone>
  </AbsoluteFill>
);

// ---------- 3. Avant : le soir, « demain, je m’y mets » ----------
const Demain: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const l = spring({ frame: f - L[2], fps, config: { damping: 14, stiffness: 120 } });
  const b = spring({ frame: f - mot(/^demain/, 2), fps, config: { damping: 10, stiffness: 180 } });
  return (
    <AbsoluteFill>
      <Etiquette texte="AVANT" at={L[2] - 6} />
      <svg width={260} height={260} viewBox="0 0 24 24" style={{ position: "absolute", left: 540 - 130, top: 330, opacity: l, transform: `rotate(${(1 - l) * -40}deg)` }}><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" fill="rgba(255,255,255,0.55)" /></svg>
      <div style={{ position: "absolute", left: 160, right: 160, top: 700, padding: "40px 30px", borderRadius: 60, background: "#3A3A44", textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 64, color: "rgba(255,255,255,0.85)", transform: `scale(${b})` }}>
        Demain, je m’y mets…
      </div>
      {[0, 1].map((i) => <div key={i} style={{ position: "absolute", left: 300 - i * 50, top: 950 + i * 50, width: 46 - i * 16, height: 46 - i * 16, borderRadius: "50%", background: "#3A3A44", transform: `scale(${b})` }} />)}
    </AbsoluteFill>
  );
};

// ---------- 4. Maintenant : la journée commence par le matin ----------
const EJ = "ecrans/journee";
const ZM = zone(EJ, /^Le matin 3 sur 5/), ZB = englobe(zone(EJ, /^Ta journée$/), zone(EJ, /^46$/), zone(EJ, /^6 sur 13 · encore 7$/));
const Matin: React.FC = () => <Phone ecran={EJ} from={BASCULE + 10} to={L[4] - 2} entree="iris" sortie="gauche" focus={[{ at: BASCULE + 8, px: 0.5, py: 0.4, s: 1.06 }]}>
  <Surligne at={mot(/^matin/, 3)} {...ZM} />
</Phone>;

// ---------- 5. La lecture guidée : arabe, phonétique, traduction ----------
const EL = "ecrans/lecture";
const ZA = zone(EL, /^[\u0621-\u064A]/), ZP = zone(EL, /^Allâhumma-kfinî/), ZF = zone(EL, /^Ô Allah, suffis-moi/);
const Lecture: React.FC = () => <Phone ecran={EL} from={L[4] - 4} to={L[5] - 2} entree="droite" sortie="bas" focus={[{ at: L[4] + 8, px: 0.5, py: 0.5, s: 1.05 }]}>
  <Surligne at={mot(/arabe/, 4)} {...ZA} fin={mot(/^phonétique/, 4) - 2} />
  <Surligne at={mot(/^phonétique/, 4)} {...ZP} fin={mot(/^traduction/, 4) - 2} />
  <Surligne at={mot(/^traduction/, 4)} {...ZF} />
</Phone>;

// ---------- 6. Un geste, et la barre avance ----------
const Barre: React.FC = () => <Phone ecran={EJ} from={L[5] - 4} to={L[6] - 2} entree="bas" sortie="traverse" focus={[{ at: L[5] + 6, px: 0.5, py: 0.25, s: 1.08 }]}>
  <Surligne at={mot(/^barre/, 5)} {...ZB} />
  <Pastille at={mot(/^geste/, 5) + 2} x={W * 0.5} y={H * 0.08} gold>+1 ✓</Pastille>
</Phone>;

const FIN = L[6];
const SFX: Sfx[] = [
  ["alarme", 2, 0.4], ...[0, 1, 2, 3].map((i) => ["message", mot(/^téléphone/) + i * 5 + 2, 0.25] as Sfx), ["whoosh", mot(/^trappe/) - 10, 0.3],
  ["pop", mot(/^notifications/, 1) + 4, 0.35], ["pop", mot(/^café/, 1) + 4, 0.35], ["pop", mot(/^trajet/, 1) + 8, 0.35],
  ["whoosh", L[2] - 18, 0.35], ["pop", mot(/^demain/, 2) + 2, 0.3],
  ["whoosh", BASCULE - 18, 0.5], ["shimmer", BASCULE - 4, 0.4], ["tick", mot(/^matin/, 3) + 10, 0.35],
  ["whoosh", L[4] - 18, 0.45], ["tick", mot(/arabe/, 4) + 10, 0.3], ["tick", mot(/^phonétique/, 4) + 12, 0.3], ["tick", mot(/^traduction/, 4) + 14, 0.3],
  ["whoosh", L[5] - 18, 0.45], ["tap", mot(/^geste/, 5) + 6, 0.4], ["ding", mot(/^avance/, 5) + 12, 0.4],
  ["whoosh", FIN - 18, 0.4], ["impact", FIN - 2, 0.5], ["shimmer", mot(/^lien/, 6) + 14, 0.4],
];

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, BASCULE, BASCULE + 20, L[5], FIN, T.DUREE]} />
    <Gris />
    <Scene from={0} to={L[1] - 2} zin={0}><Reveil /></Scene>
    <Scene from={L[1] - 4} to={L[2] - 2}><Matinee /></Scene>
    <Scene from={L[2] - 4} to={BASCULE - 2}><Demain /></Scene>
        <Matin />
    <Scene from={BASCULE - 6} to={BASCULE + 14} zout={0.1}><Etiquette texte="MAINTENANT" at={BASCULE - 4} or top={760} /></Scene>
    <Lecture />
    <Barre />
    <Scene from={FIN - 4} to={T.DUREE + 10} zin={0}><Logo at={FIN} phrase="Le lien est en bio" /></Scene>
    <Flash at={BASCULE} />
    <Voile />
    <SousTitres T={T} or={/^(matin|téléphone|trappe|notifications|demain|Maintenant|Sabab|carte|arabe|phonétique|traduction|geste|barre)/i} grandsDes={99} />
    <Son voix="avant.mp3" sfx={SFX} />
  </AbsoluteFill>
);
export const video = { id: "avant", component: Video, duree: T.DUREE };
