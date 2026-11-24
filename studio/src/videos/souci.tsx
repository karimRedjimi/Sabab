// « Commente ton souci » : un proche malade. Invocation pour le malade qu’on visite (Hisn al-Muslim hm-162 ; At-Tirmidhî et Abû Dâwûd).
// Textes religieux : public/voix/souci.textes.json (copiés par programme depuis content/citadelle.json · hm-162 et content/programme.ts · PARCOURS.epreuve).
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, AR, FONT, GOLD, PLUM, W, H, minutage, zone, SousTitres, Voile, Fond, StarP, Scene, Flash, Phone, Pastille, Surligne, Logo, Son, type Sfx } from "../moteur";
import voix from "../../public/voix/souci.json";
import tx from "../../public/voix/souci.textes.json";

const T = minutage(voix);
const { L, mot } = T;
const D = tx.dua;
const LIEN = mot(/^lien/, 8);
const SEPT = mot(/^\(7/, 3);

// ---------- 1. L’accroche : le souci, écrit comme une carte ----------
const Souci: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const c = spring({ frame: f - 2, fps, config: { damping: 11, stiffness: 150 } });
  const txt = "« Un proche est malade, et je me sens impuissant. »";
  const n = Math.round(interpolate(f, [6, L[1] - 14], [0, txt.length], C));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center", opacity: c }}>
        <span style={{ display: "inline-block", padding: "14px 36px", borderRadius: 999, background: "rgba(42,12,34,0.92)", boxShadow: `0 0 0 3px ${GOLD}`, color: GOLD, fontFamily: FONT, fontWeight: 800, fontSize: 42, letterSpacing: "0.08em" }}>UN SOUCI FRÉQUENT</span>
      </div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 420, padding: "60px 56px", borderRadius: 48, background: "#fff", boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
        transform: `translateY(${(1 - c) * 300}px) rotate(${(1 - c) * 6 - 1.5}deg)`, opacity: c, minHeight: 360 }}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 70, lineHeight: 1.2, color: PLUM }}>{txt.slice(0, n)}<span style={{ opacity: f % 20 < 10 ? 1 : 0, color: GOLD }}>|</span></div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 2. Ta présence compte : deux lumières côte à côte ----------
const Presence: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = spring({ frame: f - L[1], fps, config: { damping: 14, stiffness: 110 } });
  const b = spring({ frame: f - mot(/^présence/, 1), fps, config: { damping: 12, stiffness: 120 } });
  const pulse = 1 + 0.06 * Math.sin(f / 7);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 300 - 110, top: 560, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,255,255,0.55),rgba(255,255,255,0.08) 70%)", transform: `scale(${a})`, opacity: 0.8 }} />
      <div style={{ position: "absolute", left: 780 - 130, top: 540, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle,#FFF1C4,#E9C46A 55%,rgba(233,196,106,0) 72%)", transform: `scale(${b * pulse})` }} />
      <div style={{ position: "absolute", left: 300, top: 670, width: 480 * b, height: 6, borderRadius: 3, background: "linear-gradient(90deg,rgba(255,255,255,0.4),#E9C46A)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 950, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 76, color: "#fff", opacity: b }}>ta <span style={{ color: GOLD }}>présence</span> compte</div>
    </AbsoluteFill>
  );
};

// ---------- 3. La visite : la porte qui s’ouvre, des pas ----------
const Visite: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - L[2], fps, config: { damping: 13, stiffness: 140 } });
  const pas = interpolate(f, [mot(/^rends/, 2), mot(/^visite/, 2) + 20], [0, 4], C);
  const d = spring({ frame: f - mot(/^du’â/, 2), fps, config: { damping: 8, stiffness: 200 } });
  return (
    <AbsoluteFill>
      <svg width={300} height={400} viewBox="0 0 100 130" style={{ position: "absolute", left: 540 - 150, top: 330, transform: `scale(${s})`, opacity: s }}>
        <rect x={12} y={10} width={76} height={120} rx={6} fill="#FFF1C4" opacity={0.9} style={{ filter: "drop-shadow(0 0 20px rgba(233,196,106,0.8))" }} />
        <rect x={12} y={10} width={76} height={120} rx={6} fill="#3A1236" stroke={GOLD} strokeWidth={3} transform={`translate(12 0) scale(${1 - 0.7 * Math.min(1, pas / 3)} 1) translate(-12 0)`} />
      </svg>
      {[0, 1, 2, 3].map((i) => <div key={i} style={{ position: "absolute", left: (i % 2 ? 570 : 470), top: 1100 - i * 90, width: 44, height: 70, borderRadius: "50%", background: GOLD, opacity: Math.max(0, Math.min(1, pas - i)) * 0.8 }} />)}
      <div style={{ position: "absolute", left: 640, top: 820, padding: "18px 40px", borderRadius: 999, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 60, transform: `scale(${d}) rotate(${(1 - d) * 20}deg)` }}>une du’â</div>
    </AbsoluteFill>
  );
};

// ---------- 4. L’invocation : l’arabe, la phonétique, le compteur jusqu’à 7 ----------
const Invocation: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = spring({ frame: f - L[3], fps, config: { damping: 14, stiffness: 130 } });
  const ph = interpolate(f, [L[3] + 14, L[3] + 30], [0, 1], C);
  const n = Math.max(1, Math.min(7, Math.floor(interpolate(f, [SEPT - 6, SEPT + 24], [1, 7.99], C))));
  const c = spring({ frame: f - SEPT + 6, fps, config: { damping: 9, stiffness: 200 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center" }}>
        <span style={{ display: "inline-block", padding: "10px 30px", borderRadius: 999, border: `3px solid ${GOLD}`, color: GOLD, fontFamily: FONT, fontWeight: 700, fontSize: 34, letterSpacing: "0.08em", opacity: a }}>EN VISITANT LE MALADE</span>
      </div>
      <div dir="rtl" lang="ar" style={{ position: "absolute", left: 60, right: 60, top: 320, textAlign: "center", unicodeBidi: "plaintext", fontFamily: AR, fontSize: 76, lineHeight: 1.75, color: "#fff", opacity: a,
        transform: `translateY(${(1 - a) * 40}px)`, textShadow: "0 0 30px rgba(233,196,106,0.5)" }}>{D.ar}</div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 780, textAlign: "center", fontFamily: FONT, fontStyle: "italic", fontSize: 42, lineHeight: 1.45, color: "rgba(255,255,255,0.85)", opacity: ph }}>{D.ph}</div>
      <div style={{ position: "absolute", left: 540 - 100, top: 1000, width: 200, height: 200, borderRadius: "50%", background: GOLD, display: "grid", placeItems: "center", boxShadow: "0 0 60px rgba(233,196,106,0.7)",
        transform: `scale(${c})`, fontFamily: FONT, fontWeight: 800, fontSize: 100, color: PLUM }}>×{n}</div>
    </AbsoluteFill>
  );
};

// ---------- 5. La source, sur la fiche de la bibliothèque ----------
const EF = "ecrans/fiche-malade";
const ZST = zone(EF, /^Invocation en faveur du malade lors de sa visite$/, 1), ZSRC = zone(EF, /^Source : At-Tirmidhî et Abû Dâwûd$/);
const Fiche: React.FC = () => <Phone ecran={EF} from={L[4] - 4} to={L[5] - 2} entree="bas" sortie="droite" focus={[{ at: L[4] + 6, px: 0.5, py: 0.62, s: 1.08 }]}>
  <Surligne at={L[4] + 4} {...ZST} fin={mot(/^At-Tirmidhî/, 4) - 2} />
  <Surligne at={mot(/^At-Tirmidhî/, 4)} {...ZSRC} />
  <Pastille at={mot(/^rapporté/, 4)} x={W * 0.5} y={H * 0.29} gold>Hisn al-Muslim</Pastille>
</Phone>;

// ---------- 6. Tu demandes, tu confies : la demande devient une étoile qui monte ----------
const Confier: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const d = spring({ frame: f - mot(/^demandes/, 5), fps, config: { damping: 12, stiffness: 160 } });
  const up = interpolate(f, [mot(/^confies/, 5), L[6] - 4], [0, 1], { ...C, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 540 - 60, top: 980 - 560 * up, transform: `scale(${d}) rotate(${up * 180}deg)` }}><StarP size={120} glow={20 + 40 * up} /></div>
      <div style={{ position: "absolute", left: 535, top: 1100 - 560 * up, width: 10, height: 560 * up, borderRadius: 99, background: "linear-gradient(180deg,#FFF1C4,rgba(233,196,106,0))", opacity: 0.6 }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1150, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 64, color: "#fff", opacity: d }}>tu demandes, <span style={{ color: GOLD, opacity: up > 0 ? 1 : 0 }}>tu confies</span></div>
    </AbsoluteFill>
  );
};

// ---------- 7. Le parcours « Traverser une épreuve » ----------
const EP = "ecrans/epreuve-parcours";
const ZPT = zone(EP, new RegExp("^" + tx.parcours.texte + "$")), ZINTRO = zone(EP, /^Pour un moment difficile/);
const Parcours: React.FC = () => <Phone ecran={EP} from={L[6] - 4} to={L[7] - 2} entree="droite" sortie="gauche" focus={[{ at: L[6] + 6, px: 0.5, py: 0.33, s: 1.06 }]}>
  <Surligne at={mot(/^parcours/, 6)} {...ZPT} fin={mot(/^épreuve/, 6) + 6} />
  <Surligne at={mot(/^épreuve/, 6) + 8} {...ZINTRO} />
</Phone>;

// ---------- 8. L’accueil : chaque jour, une invocation et un geste ----------
const EA = "ecrans/epreuve-accueil";
const ZOBJ = zone(EA, /^7 TON OBJECTIF Soutenir un proche malade/), ZCONT = zone(EA, /^Continuer · Le matin$/);
const Accueil: React.FC = () => <Phone ecran={EA} from={L[7] - 4} to={LIEN - 2} entree="iris" sortie="recul" focus={[{ at: L[7] + 6, px: 0.5, py: 0.68, s: 1.06 }]}>
  <Surligne at={L[7] + 4} {...ZOBJ} fin={mot(/^invocation/, 7) - 2} />
  <Surligne at={mot(/^invocation/, 7)} {...ZCONT} />
  <Pastille at={mot(/^geste/, 7)} x={W * 0.5} y={H * 0.255} gold size={30}>{tx.geste.texte}</Pastille>
</Phone>;

const SFX: Sfx[] = [
  ["message", 2, 0.5], ["clavier", 8, 0.3], ["pop", L[1] - 16, 0.4],
  ["whoosh", L[1] - 6, 0.4], ["coeur", mot(/^présence/, 1), 0.4],
  ["whoosh", L[2] - 6, 0.4], ["tap", mot(/^rends/, 2) + 4, 0.3], ["pop", mot(/^du’â/, 2) + 4, 0.5],
  ["shimmer", L[3] - 4, 0.5],
  ["whoosh", L[4] - 6, 0.6], ["tick", mot(/^At-Tirmidhî/, 4) + 4, 0.4],
  ["whoosh", L[5] - 6, 0.4], ["shimmer", mot(/^confies/, 5) + 4, 0.4],
  ["whoosh", L[6] - 6, 0.6], ["tick", mot(/^parcours/, 6) + 4, 0.4], ["pop", mot(/^épreuve/, 6) + 8, 0.4],
  ["whoosh", L[7] - 6, 0.5], ["tick", mot(/^invocation/, 7) + 4, 0.4], ["pop", mot(/^geste/, 7) + 6, 0.4],
  ["impact", LIEN, 0.6], ["shimmer", LIEN + 2, 0.6],
];

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[1] - 6, L[3] + 10, L[6] - 6, L[7] + 14, T.DUREE]} />
    <Scene from={0} to={L[1] - 2} zin={0}><Souci /></Scene>
    <Scene from={L[1] - 4} to={L[2] - 2}><Presence /></Scene>
    <Scene from={L[2] - 4} to={L[3] - 2}><Visite /></Scene>
    <Scene from={L[3] - 4} to={L[4] - 2}><Invocation /></Scene>
    <Fiche />
    <Scene from={L[5] - 4} to={L[6] - 2}><Confier /></Scene>
    <Parcours />
    <Accueil />
    <Scene from={LIEN - 4} to={T.DUREE + 10} zin={0}><Logo at={LIEN} phrase="Tu n’es pas seul" /></Scene>
    <Flash at={L[3]} />
    <Voile />
    <SousTitres T={T} or={/^(malade|impuissant|présence|visite|guérir|Immense|At-Tirmidhî|Abû|confies|épreuve|tenir|geste|seul|Sabab)/i} grandsDes={99} />
    <Son voix="souci.mp3" sfx={SFX} />
  </AbsoluteFill>
);
export const video = { id: "souci", component: Video, duree: T.DUREE };
