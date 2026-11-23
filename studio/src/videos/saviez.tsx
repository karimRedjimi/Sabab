// « Le saviez-vous ? » : ce qu’on fait et dit quand on a mal (Hisn al-Muslim hm-259, Muslim 4/1728).
// Textes religieux : public/voix/saviez.textes.json (copiés par programme depuis content/citadelle.json · hm-259).
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, AR, FONT, GOLD, PLUM, H, W, minutage, zone, SousTitres, Voile, Fond, StarP, Scene, Flash, Phone, Pastille, Surligne, Son, type Sfx } from "../moteur";
import voix from "../../public/voix/saviez.json";
import tx from "../../public/voix/saviez.textes.json";

const T = minutage(voix);
const { L, mot } = T;
const D = tx.dua;
// Les deux paroles, telles qu’écrites entre guillemets dans la traduction.
const PAROLES = [...D.fr.matchAll(/«\s*(.*?)\s*»/g)].map((m) => m[1]);
if (PAROLES.length !== 2) throw new Error("paroles introuvables dans la traduction");

const Main: React.FC<{ size: number; color?: string }> = ({ size, color = GOLD }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 11V5.5a1.5 1.5 0 0 1 3 0V10M10 9.5V4a1.5 1.5 0 0 1 3 0v6M13 9.5V5a1.5 1.5 0 0 1 3 0v6M16 10.5V8a1.5 1.5 0 0 1 3 0v6.5c0 3.6-2.6 6.5-6.2 6.5h-.6c-2 0-3.6-.9-4.7-2.4L4.3 14.4a1.6 1.6 0 0 1 2.4-2.1L7 12.6" />
  </svg>
);

// ---------- 1. L’accroche : un point de douleur qui pulse, puis le geste et la phrase ----------
const Accroche: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const pill = spring({ frame: f - 2, fps, config: { damping: 9, stiffness: 180 } });
  const g = spring({ frame: f - mot(/^geste/), fps, config: { damping: 9, stiffness: 200 } });
  const ph = spring({ frame: f - mot(/^phrase/), fps, config: { damping: 9, stiffness: 200 } });
  const pulse = (k: number) => ((f / 24 + k / 3) % 1);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", transform: `scale(${pill})` }}>
        <div style={{ display: "inline-block", padding: "18px 40px", borderRadius: 999, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 60, letterSpacing: "0.04em", boxShadow: "0 0 70px rgba(233,196,106,0.7)" }}>LE SAVIEZ-VOUS ?</div>
      </div>
      {[0, 1, 2].map((k) => <div key={k} style={{ position: "absolute", left: 540 - 60 - 160 * pulse(k), top: 640 - 60 - 160 * pulse(k), width: 120 + 320 * pulse(k), height: 120 + 320 * pulse(k), borderRadius: "50%",
        border: "6px solid #E07A5F", opacity: (1 - pulse(k)) * 0.7 * (1 - g) }} />)}
      <div style={{ position: "absolute", left: 540 - 60, top: 580, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle,#FFB199,#E07A5F)", boxShadow: "0 0 60px rgba(224,122,95,0.8)", opacity: 1 - 0.6 * g }} />
      <div style={{ position: "absolute", left: 140, top: 820, width: 340, textAlign: "center", transform: `scale(${g})`, opacity: g }}>
        <div style={{ display: "inline-grid", placeItems: "center", width: 220, height: 220, borderRadius: 60, background: "rgba(42,12,34,0.92)", boxShadow: `0 0 0 4px ${GOLD}` }}><Main size={150} /></div>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 56, color: "#fff", marginTop: 16 }}>un geste</div>
      </div>
      <div style={{ position: "absolute", right: 140, top: 820, width: 340, textAlign: "center", transform: `scale(${ph})`, opacity: ph }}>
        <div style={{ display: "inline-grid", placeItems: "center", width: 220, height: 220, borderRadius: 60, background: "rgba(42,12,34,0.92)", boxShadow: `0 0 0 4px ${GOLD}`, fontFamily: FONT, fontWeight: 800, fontSize: 120, color: GOLD }}>« »</div>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 56, color: "#fff", marginTop: 16 }}>une phrase</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 2 et 3. La pratique : l’arabe entier, la phonétique, puis chaque parole et son nombre ----------
const Compteur: React.FC<{ at: number; n: number; parole: string; fin?: number }> = ({ at, n, parole, fin }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 12, stiffness: 160 } });
  const out = fin ? interpolate(f, [fin, fin + 8], [0, 1], C) : 0;
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 880, padding: "34px 40px 34px 220px", borderRadius: 40, background: "rgba(42,12,34,0.92)", boxShadow: `0 0 0 3px ${GOLD}, 0 30px 80px rgba(0,0,0,0.45)`,
      transform: `translateY(${(1 - s) * 80 + out * -60}px)`, opacity: s * (1 - out), minHeight: 220, display: "flex", alignItems: "center" }}>
      <div style={{ position: "absolute", left: 40, top: "50%", marginTop: -75, width: 150, height: 150, borderRadius: "50%", background: GOLD, display: "grid", placeItems: "center",
        fontFamily: FONT, fontWeight: 800, fontSize: 70, color: PLUM }}>×{n}</div>
      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: parole.length > 40 ? 40 : 60, lineHeight: 1.3, color: "#fff" }}>« {parole} »</div>
    </div>
  );
};
const Pratique: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = spring({ frame: f - L[1], fps, config: { damping: 14, stiffness: 140 } });
  const main = spring({ frame: f - mot(/^main/, 1), fps, config: { damping: 10, stiffness: 180 } });
  return (
    <AbsoluteFill>
      <div dir="rtl" lang="ar" style={{ position: "absolute", left: 60, right: 60, top: 150, textAlign: "center", unicodeBidi: "plaintext", fontFamily: AR, fontSize: 50, lineHeight: 1.65, color: "#fff", opacity: a,
        textShadow: "0 0 20px rgba(0,0,0,0.4)" }}>{D.ar}</div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 560, textAlign: "center", fontFamily: FONT, fontStyle: "italic", fontSize: 34, lineHeight: 1.45, color: "rgba(255,255,255,0.82)",
        opacity: interpolate(f, [L[1] + 10, L[1] + 24], [0, 1], C) }}>{D.ph}</div>
      <div style={{ position: "absolute", left: 540 - 70, top: 700, transform: `scale(${main}) rotate(${Math.sin(f / 10) * 4}deg)`, opacity: main * (f < mot(/^dis/, 1) ? 1 : 0.35) }}><Main size={140} /></div>
      <Compteur at={mot(/^nom/, 1) - 4} n={3} parole={PAROLES[0]} fin={L[2] - 6} />
      <Compteur at={L[2] + 4} n={7} parole={PAROLES[1]} />
    </AbsoluteFill>
  );
};

// ---------- 4. La source ----------
const Source: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - L[3], fps, config: { damping: 14, stiffness: 140 } });
  const c = spring({ frame: f - mot(/^Citadelle/, 3), fps, config: { damping: 10, stiffness: 180 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 540 - 60, top: 250, transform: `scale(${c}) rotate(${f * 0.8}deg)` }}><StarP size={120} glow={36} /></div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 430, padding: "56px 50px", borderRadius: 48, background: "rgba(42,12,34,0.88)", boxShadow: "0 0 0 3px rgba(233,196,106,0.6), 0 40px 100px rgba(0,0,0,0.5)",
        transform: `translateY(${(1 - s) * 200}px) rotateX(${(1 - s) * 40}deg)`, opacity: s, textAlign: "center" }}>
        <div style={{ fontFamily: FONT, fontSize: 34, color: "rgba(255,255,255,0.7)", fontWeight: 600, letterSpacing: "0.12em" }}>SOURCE</div>
        <div style={{ fontFamily: FONT, fontSize: 76, color: "#fff", fontWeight: 800, margin: "14px 0 0" }}>{D.src}</div>
        <div style={{ fontFamily: FONT, fontSize: 36, color: GOLD, fontWeight: 700, lineHeight: 1.35, marginTop: 26, opacity: c }}>Hisn al-Muslim · {D.chapitre}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 5. Confier sa douleur : la main se pose, une lumière monte ----------
const Confier: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const m = spring({ frame: f - L[4], fps, config: { damping: 14, stiffness: 120 } });
  const up = interpolate(f, [mot(/^confies/, 4), L[5] - 4], [0, 1], { ...C, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 540 - 130, top: 760, transform: `scale(${m}) translateY(${(1 - m) * 100}px)` }}><Main size={260} /></div>
      <div style={{ position: "absolute", left: 540 - 40, top: 740 - 480 * up, width: 80, height: 80, transform: `scale(${up > 0 ? 1 : 0})`, opacity: up > 0 ? 1 : 0 }}><StarP size={80} glow={40} /></div>
      <div style={{ position: "absolute", left: 535, top: 780 - 480 * up, width: 10, height: 480 * up, borderRadius: 99, background: "linear-gradient(180deg,#FFF1C4,rgba(233,196,106,0))", opacity: 0.7 }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1100, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 60, color: "#fff", opacity: up }}>tu confies, <span style={{ color: GOLD }}>Allah sait</span></div>
    </AbsoluteFill>
  );
};

// ---------- 6. Dans Sabab : la fiche entière ----------
const E = "ecrans/fiche-douleur";
const ZT = zone(E, /^Ce que dit et fait celui qui ressent une douleur/, 1), ZA = zone(E, /^ضَعْ/), ZP = zone(E, /^Bismi Llāh/);
const Fiche: React.FC = () => <Phone ecran={E} from={L[5] - 4} to={L[6] + 2} entree="bas" sortie="traverse" focus={[{ at: L[5] + 6, px: 0.5, py: 0.42, s: 1.06 }]}>
  <Surligne at={mot(/^bibliothèque/, 5)} {...ZT} fin={mot(/^l’arabe/, 5) - 2} />
  <Surligne at={mot(/^l’arabe/, 5)} {...ZA} fin={mot(/^phonétique/, 5) - 2} />
  <Surligne at={mot(/^phonétique/, 5)} {...ZP} />
  <Pastille at={mot(/^Sabab/, 5)} x={W * 0.62} y={H * 0.2} gold>Quand on a mal</Pastille>
</Phone>;

// ---------- 7. Enregistre : le signet, puis l’étoile Sabab ----------
const Fin: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - L[6], fps, config: { damping: 8, stiffness: 180 } });
  const logo = spring({ frame: f - mot(/^l’oublier/, 6), fps, config: { damping: 11, stiffness: 140 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 540 - 130, top: 300, transform: `scale(${s * (1 - 0.6 * logo)}) translateY(${-logo * 150}px)` }}>
        <svg width={260} height={320} viewBox="0 0 24 30"><path d="M3 2h18v26l-9-6-9 6z" fill={GOLD} style={{ filter: "drop-shadow(0 0 2px rgba(233,196,106,0.9))" }} /></svg>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", transform: `scale(${logo})`, opacity: logo }}>
        <StarP size={180} glow={50} />
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 120, color: "#fff", marginTop: 10 }}>Sabab</div>
      </div>
    </AbsoluteFill>
  );
};

const SFX: Sfx[] = [
  ["impact", 2, 0.6], ["coeur", 8, 0.5], ["pop", mot(/^geste/) + 2, 0.5], ["pop", mot(/^phrase/) + 2, 0.5],
  ["shimmer", L[1] - 4, 0.5],
  ["whoosh", L[3] - 6, 0.4], ["ding", mot(/^Citadelle/, 3) + 6, 0.4],
  ["whoosh", L[4] - 6, 0.4], ["shimmer", mot(/^confies/, 4) + 8, 0.4],
  ["whoosh", L[5] - 6, 0.6], ["tick", mot(/^bibliothèque/, 5) + 8, 0.4], ["tick", mot(/^phonétique/, 5) + 10, 0.4],
  ["whoosh", L[6] - 6, 0.5], ["pop", L[6] + 2, 0.5], ["impact", mot(/^l’oublier/, 6) + 10, 0.6], ["shimmer", mot(/^l’oublier/, 6) + 12, 0.5],
];

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[1] - 8, L[1] + 10, L[5] - 6, L[5] + 14, T.DUREE]} />
    <Scene from={0} to={L[1] - 2} zin={0}><Accroche /></Scene>
    <Scene from={L[1] - 4} to={L[3] - 2}><Pratique /></Scene>
    <Scene from={L[3] - 4} to={L[4] - 2}><Source /></Scene>
    <Scene from={L[4] - 4} to={L[5] - 2}><Confier /></Scene>
    <Fiche />
    <Scene from={L[6] - 4} to={T.DUREE + 10} zin={0}><Fin /></Scene>
    <Flash at={L[1]} />
    <Voile />
    <SousTitres T={T} or={/^(mal|geste|phrase|main|douloureux|fois|protection|Muslim|Citadelle|confies|douleur|Sabab|Enregistre)/i} grandsDes={6} />
    <Son voix="saviez.mp3" sfx={SFX} />
  </AbsoluteFill>
);
export const video = { id: "saviez", component: Video, duree: T.DUREE };
