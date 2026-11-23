// « Le saviez-vous ? » : l’invocation que le Prophète ﷺ disait après la prière du Fajr (Ibn Mâjah n° 925).
// Textes religieux : public/voix/saviez.textes.json (copiés par programme depuis content/programme.ts · ITEMS.fajr).
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, AR, FONT, GOLD, PLUM, H, W, minutage, zone, SousTitres, Voile, Fond, StarP, Scene, Flash, Phone, Pastille, Surligne, Son, type Sfx } from "../moteur";
import voix from "../../public/voix/saviez.json";
import tx from "../../public/voix/saviez.textes.json";

const T = minutage(voix);
const { L, mot } = T;
const D = tx.dua;
const SCIENCE = mot(/^science/, 2), SUBS = mot(/^subsistance/, 2), OEUVRES = mot(/^œuvres/, 2);
// L’arabe est seulement coupé en trois à l’affichage (après chaque virgule arabe), jamais modifié.
const PARTS = D.ar.split(/(?<=،) /);
// Les trois demandes, telles qu’écrites dans la traduction.
const DEMANDES = ["une science utile", "une subsistance pure", "des œuvres acceptées"].map((d) => { if (!D.fr.includes(d)) throw new Error("demande absente de la traduction : " + d); return d; });

// ---------- 1. L’accroche : le soleil se lève sur l’horizon, « Fajr » ----------
const Aube: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const sun = interpolate(f, [0, L[1]], [0, 1], { ...C, easing: Easing.out(Easing.cubic) });
  const pill = spring({ frame: f - 2, fps, config: { damping: 9, stiffness: 180 } });
  const fajr = spring({ frame: f - mot(/^Fajr/), fps, config: { damping: 8, stiffness: 200 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", transform: `scale(${pill})` }}>
        <div style={{ display: "inline-block", padding: "18px 40px", borderRadius: 999, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 60, letterSpacing: "0.04em", boxShadow: "0 0 70px rgba(233,196,106,0.7)" }}>LE SAVIEZ-VOUS ?</div>
      </div>
      {/* le soleil qui monte derrière l’horizon */}
      <div style={{ position: "absolute", left: 540 - 190, top: 1000 - 260 * sun, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle at 50% 45%, #FFF1C4, #E9C46A 55%, #C98A2E)",
        boxShadow: `0 0 ${120 + 80 * sun}px rgba(233,196,106,0.8)` }} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2 + f / 90, r = 250 + 30 * Math.sin(f / 10 + i);
        return <div key={i} style={{ position: "absolute", left: 540 + Math.cos(a) * r - 4, top: 1190 - 260 * sun + Math.sin(a) * r - 40, width: 8, height: 80, borderRadius: 8, background: GOLD, opacity: 0.35 * sun,
          transform: `rotate(${(a * 180) / Math.PI + 90}deg)` }} />;
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1000, height: 460, background: "linear-gradient(180deg, #1E0A22, #14050F)", borderTop: `4px solid ${GOLD}`, boxShadow: "0 -20px 60px rgba(233,196,106,0.35)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1060, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 170, color: "#fff", letterSpacing: "0.08em",
        transform: `scale(${fajr})`, opacity: fajr, textShadow: "0 0 50px rgba(233,196,106,0.8)" }}>FAJR</div>
    </AbsoluteFill>
  );
};

// ---------- 2. Une phrase, trois demandes : le « 1 » se divise en trois étoiles ----------
const UneEnTrois: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const un = spring({ frame: f - mot(/^seule/, 1), fps, config: { damping: 8, stiffness: 200 } });
  const trois = spring({ frame: f - mot(/^trois/, 1), fps, config: { damping: 11, stiffness: 150 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 64, color: "#fff", opacity: un * (1 - trois) }}>une seule phrase</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 460, color: GOLD, lineHeight: 1,
        transform: `scale(${un * (1 - 0.7 * trois)})`, opacity: 1 - trois, textShadow: "0 0 80px rgba(233,196,106,0.7)" }}>1</div>
      {[-1, 0, 1].map((k, i) => (
        <div key={i} style={{ position: "absolute", left: 540 - 90 + k * 300 * trois, top: 560 - 60 * Math.abs(k) * trois, transform: `scale(${trois})`, opacity: trois }}><StarP size={180} glow={36} /></div>
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: 860, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 96, color: "#fff", opacity: trois, transform: `translateY(${(1 - trois) * 60}px)` }}>
        3 <span style={{ color: GOLD }}>demandes</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 3. L’invocation : les trois parts de l’arabe s’allument avec la traduction ----------
const LaDua: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const seuils = [SCIENCE, SUBS, OEUVRES];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 50, right: 50, top: 170, textAlign: "center", direction: "rtl" }}>
        {PARTS.map((p, i) => {
          const s = spring({ frame: f - (i === 0 ? L[2] : seuils[i]), fps, config: { damping: 14, stiffness: 160 } });
          const actif = f >= seuils[i] && (i === 2 || f < seuils[i + 1]);
          return <div key={i} style={{ fontFamily: AR, fontSize: 84, lineHeight: 1.6, color: actif ? GOLD : "#fff", opacity: 0.15 + 0.85 * s, transform: `scale(${0.92 + 0.08 * s})`,
            textShadow: actif ? "0 0 40px rgba(233,196,106,0.8)" : "0 0 20px rgba(0,0,0,0.4)" }}>{p}</div>;
        })}
      </div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 660, textAlign: "center", fontFamily: FONT, fontStyle: "italic", fontSize: 36, lineHeight: 1.45, color: "rgba(255,255,255,0.82)",
        opacity: interpolate(f, [L[2] + 8, L[2] + 22], [0, 1], C) }}>{D.ph}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 860, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        {DEMANDES.map((d, i) => {
          const s = spring({ frame: f - seuils[i], fps, config: { damping: 10, stiffness: 200 } });
          return <div key={d} style={{ padding: "16px 38px", borderRadius: 999, background: "rgba(42,12,34,0.92)", boxShadow: `0 0 0 3px ${GOLD}, 0 0 36px rgba(233,196,106,0.5)`,
            fontFamily: FONT, fontWeight: 700, fontSize: 46, color: "#fff", transform: `scale(${s})`, opacity: s }}>{i + 1}. {d}</div>;
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- 4. La source ----------
const Source: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - L[3], fps, config: { damping: 14, stiffness: 140 } });
  const ok = spring({ frame: f - mot(/^authentifié/, 3), fps, config: { damping: 9, stiffness: 200 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 540 - 60, top: 250, transform: `scale(${ok}) rotate(${f * 0.8}deg)` }}><StarP size={120} glow={36} /></div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 430, padding: "60px 50px", borderRadius: 48, background: "rgba(42,12,34,0.88)", boxShadow: "0 0 0 3px rgba(233,196,106,0.6), 0 40px 100px rgba(0,0,0,0.5)",
        transform: `translateY(${(1 - s) * 200}px) rotateX(${(1 - s) * 40}deg)`, opacity: s, textAlign: "center" }}>
        <div style={{ fontFamily: FONT, fontSize: 36, color: "rgba(255,255,255,0.7)", fontWeight: 600, letterSpacing: "0.12em" }}>SOURCE</div>
        <div style={{ fontFamily: FONT, fontSize: 60, color: "#fff", fontWeight: 800, lineHeight: 1.3, margin: "18px 0 0" }}>{D.src}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 5. Dès le début de la journée : les trois demandes se rangent autour du soleil levant ----------
const Journee: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = spring({ frame: f - L[4], fps, config: { damping: 12, stiffness: 140 } });
  const deb = spring({ frame: f - mot(/^début/, 4), fps, config: { damping: 10, stiffness: 180 } });
  return (
    <AbsoluteFill>
      <svg width={1080} height={1440} style={{ position: "absolute", inset: 0 }}>
        <path d="M 200 1110 A 340 340 0 0 1 880 1110" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={6} strokeDasharray="14 18" />
        <path d="M 200 1110 A 340 340 0 0 1 880 1110" fill="none" stroke={GOLD} strokeWidth={8} pathLength={1} strokeDasharray={`${0.2 * deb} 1`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", left: 540 - 340 * Math.cos(Math.PI * 0.2 * deb) - 50, top: 1110 - 340 * Math.sin(Math.PI * 0.2 * deb) - 50, width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle,#FFF1C4,#E9C46A)", boxShadow: "0 0 70px rgba(233,196,106,0.9)", transform: `scale(${a})` }} />
      {DEMANDES.map((d, i) => {
        const s = spring({ frame: f - L[4] - 4 - i * 6, fps, config: { damping: 11, stiffness: 170 } });
        return <div key={d} style={{ position: "absolute", left: 540, top: 300 + i * 150, transform: `translate(-50%, 0) scale(${s})`, opacity: s, whiteSpace: "nowrap",
          padding: "18px 40px", borderRadius: 999, background: i === 1 ? GOLD : "rgba(42,12,34,0.92)", color: i === 1 ? PLUM : "#fff", boxShadow: `0 0 0 3px ${GOLD}, 0 0 40px rgba(233,196,106,0.5)`,
          fontFamily: FONT, fontWeight: 800, fontSize: 52 }}>{d}</div>;
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1180, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 64, color: "#fff", opacity: deb }}>dès le début de la journée</div>
    </AbsoluteFill>
  );
};

// ---------- 6. Dans Sabab : la fiche de l’invocation, entière, avec l’arabe et la phonétique surlignés ----------
const E = "ecrans/fiche-fajr";
const ZT = zone(E, /^Invocation après le Fajr$/), ZA = zone(E, /^اللَّهُمَّ/), ZP = zone(E, /^Allâhumma innî/);
const Fiche: React.FC = () => <Phone ecran={E} from={L[5] - 4} to={L[6] + 2} entree="bas" sortie="traverse" focus={[{ at: L[5] + 6, px: 0.5, py: 0.35, s: 1.08 }]}>
  <Surligne at={mot(/^Sabab/, 5)} {...ZT} fin={mot(/^l’arabe/, 5) - 2} />
  <Surligne at={mot(/^l’arabe/, 5)} {...ZA} fin={mot(/^phonétique/, 5) - 2} />
  <Surligne at={mot(/^phonétique/, 5)} {...ZP} />
  <Pastille at={mot(/^matin/, 5)} x={W * 0.5} y={H * 0.86} gold>Chaque matin</Pastille>
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
  ["impact", 2, 0.7], ["riser", 4, 0.3], ["ding", mot(/^Fajr/), 0.6],
  ["whoosh", L[1] - 4, 0.6], ["pop", mot(/^seule/, 1), 0.6], ["pop", mot(/^trois/, 1), 0.5], ["pop", mot(/^trois/, 1) + 4, 0.5], ["pop", mot(/^trois/, 1) + 8, 0.5],
  ["shimmer", L[2] - 2, 0.6], ["shimmer", SUBS, 0.35], ["shimmer", OEUVRES, 0.35],
  ["whoosh", L[3] - 4, 0.5], ["ding", mot(/^authentifié/, 3), 0.5],
  ["whoosh", L[4] - 4, 0.6], ...[0, 1, 2].map((i) => ["pop", L[4] + 4 + i * 6, 0.45] as Sfx), ["shimmer", mot(/^début/, 4), 0.5],
  ["whoosh", L[5] - 4, 0.7], ["tick", mot(/^Sabab/, 5), 0.5], ["tick", mot(/^l’arabe/, 5), 0.5], ["tick", mot(/^phonétique/, 5), 0.5], ["ding", mot(/^matin/, 5), 0.5],
  ["whoosh", L[6] - 4, 0.6], ["pop", L[6] + 2, 0.7], ["impact", mot(/^l’oublier/, 6), 0.7], ["shimmer", mot(/^l’oublier/, 6) + 2, 0.6],
];

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[1] - 8, L[1] + 10, L[5] - 6, L[5] + 14, T.DUREE]} />
    <Scene from={0} to={L[1] - 2} zin={0}><Aube /></Scene>
    <Scene from={L[1] - 4} to={L[2] - 2}><UneEnTrois /></Scene>
    <Scene from={L[2] - 4} to={L[3] - 2}><LaDua /></Scene>
    <Scene from={L[3] - 4} to={L[4] - 2}><Source /></Scene>
    <Scene from={L[4] - 4} to={L[5] - 2}><Journee /></Scene>
    <Fiche />
    <Scene from={L[6] - 4} to={T.DUREE + 10} zin={0}><Fin /></Scene>
    <Flash at={L[2]} />
    <Flash at={mot(/^l’oublier/, 6)} />
    <Voile />
    <SousTitres T={T} or={/^(Fajr|seule|trois|science|subsistance|œuvres|Mâjah|Albânî|début|Sabab|matin|Enregistre)/i} grandsDes={6} />
    <Son voix="saviez.mp3" sfx={SFX} />
  </AbsoluteFill>
);
export const video = { id: "saviez", component: Video, duree: T.DUREE };
