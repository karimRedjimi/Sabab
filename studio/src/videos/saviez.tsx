// « Le saviez-vous ? » : la seule chose qu’Allah a ordonné à Son Prophète ﷺ de demander davantage (programme.ts · zidni, Coran, Tâ-Hâ 20:114).
// Textes religieux : public/voix/saviez.textes.json (copiés par programme depuis content/programme.ts · zidni).
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, AR, FONT, GOLD, PLUM, W, H, minutage, zone, SousTitres, Voile, Fond, Scene, Flash, Phone, Pastille, Surligne, Logo, Son, type Sfx } from "../moteur";
import voix from "../../public/voix/saviez.json";
import tx from "../../public/voix/saviez.textes.json";

const T = minutage(voix);
const { L, mot } = T;
const D = tx.dua;
const MOTS_AR = D.ar.split(" ");

// ---------- 1. L’accroche : « LE SAVIEZ-VOUS ? » et un « + » qui grandit ----------
const Accroche: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const b = spring({ frame: f - 3, fps, config: { damping: 8, stiffness: 200 } });
  const plus = spring({ frame: f - mot(/^davantage/), fps, config: { damping: 7, stiffness: 160 } });
  const q = spring({ frame: f - 8, fps, config: { damping: 12, stiffness: 140 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", transform: `scale(${b}) rotate(${(1 - b) * 10}deg)` }}>
        <span style={{ display: "inline-block", padding: "18px 50px", borderRadius: 26, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 76, letterSpacing: "0.06em", boxShadow: "0 0 70px rgba(233,196,106,0.7)" }}>LE SAVIEZ-VOUS ?</span>
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 470, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 82, lineHeight: 1.15, color: "#fff", opacity: q, transform: `translateY(${(1 - q) * 40}px)` }}>
        Une seule chose à demander <span style={{ color: GOLD }}>davantage</span>
      </div>
      <div style={{ position: "absolute", left: 540 - 150, top: 800, width: 300, height: 300, borderRadius: "50%", background: "rgba(42,12,34,0.9)", boxShadow: `0 0 0 6px ${GOLD}, 0 0 ${40 + 60 * plus}px rgba(233,196,106,0.7)`,
        display: "grid", placeItems: "center", transform: `scale(${plus}) rotate(${(1 - plus) * -90}deg)` }}>
        <svg width={170} height={170} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={3} strokeLinecap="round"><path d="M12 4v16M4 12h16" /></svg>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 2. La science : un livre qui s’ouvre et rayonne ----------
const Science: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const un = spring({ frame: f - L[1], fps, config: { damping: 9, stiffness: 200 } });
  const o = spring({ frame: f - mot(/^science/, 1), fps, config: { damping: 13, stiffness: 120 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 64, color: "rgba(255,255,255,0.85)", letterSpacing: "0.12em", transform: `scale(${un})` }}>UNE SEULE CHOSE</div>
      <svg width={1080} height={900} style={{ position: "absolute", left: 0, top: 380 }}>
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2 + f / 60, r1 = 240, r2 = 240 + 150 * o;
          return <line key={i} x1={540 + r1 * Math.cos(a)} y1={420 + r1 * Math.sin(a)} x2={540 + r2 * Math.cos(a)} y2={420 + r2 * Math.sin(a)} stroke={GOLD} strokeWidth={6} strokeLinecap="round" opacity={0.55 * o} />;
        })}
        <g transform={`translate(540 440) scale(${0.6 + 0.4 * o})`}>
          <path d={`M0 -120 C-60 -150 -150 -150 ${-20 - 180 * o} -120 V120 C-150 90 -60 90 0 120 Z`} fill="rgba(42,12,34,0.95)" stroke={GOLD} strokeWidth={8} strokeLinejoin="round" />
          <path d={`M0 -120 C60 -150 150 -150 ${20 + 180 * o} -120 V120 C150 90 60 90 0 120 Z`} fill="rgba(42,12,34,0.95)" stroke={GOLD} strokeWidth={8} strokeLinejoin="round" />
          <path d="M0 -120 V120" stroke={GOLD} strokeWidth={8} />
        </g>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1110, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 120, color: GOLD, opacity: o, transform: `scale(${0.8 + 0.2 * o})`, textShadow: "0 0 50px rgba(233,196,106,0.6)" }}>la science</div>
    </AbsoluteFill>
  );
};

// ---------- 3. Le verset : arabe, phonétique, traduction, source (copiés à l’identique) ----------
const Verset: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = spring({ frame: f - L[2], fps, config: { damping: 14, stiffness: 120 } });
  const ar = spring({ frame: f - mot(/^Seigneur/, 2) + 4, fps, config: { damping: 16, stiffness: 90 } });
  const fr = interpolate(f, [mot(/^Seigneur/, 2), mot(/^Seigneur/, 2) + 14], [0, 1], C);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center", opacity: a }}>
        <span style={{ display: "inline-block", padding: "12px 34px", borderRadius: 999, border: `3px solid ${GOLD}`, color: GOLD, fontFamily: FONT, fontWeight: 700, fontSize: 40, letterSpacing: "0.08em" }}>LE CORAN · SOURATE TÂ-HÂ</span>
      </div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 330, padding: "60px 40px 56px", borderRadius: 50, background: "rgba(42,12,34,0.9)", boxShadow: "0 0 0 3px rgba(233,196,106,0.55), 0 40px 100px rgba(0,0,0,0.5)",
        textAlign: "center", opacity: a, transform: `perspective(1600px) rotateX(${(1 - a) * 50}deg)` }}>
        <div dir="rtl" lang="ar" style={{ fontFamily: AR, fontSize: 150, lineHeight: 1.5, color: GOLD, opacity: ar, transform: `scale(${0.85 + 0.15 * ar})`, textShadow: "0 0 40px rgba(233,196,106,0.5)" }}>{D.ar}</div>
        <div style={{ fontFamily: FONT, fontStyle: "italic", fontSize: 52, color: "rgba(255,255,255,0.85)", marginTop: 10, opacity: fr }}>{D.ph}</div>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 62, lineHeight: 1.25, color: "#fff", marginTop: 34, opacity: fr }}>{D.fr}</div>
        <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 38, color: GOLD, marginTop: 34, opacity: fr }}>{D.src}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 4. Trois mots : chacun apparaît avec son numéro, puis le moment ----------
const TroisMots: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const t0 = mot(/^trois/, 3);
  const m = spring({ frame: f - mot(/^avant/, 3), fps, config: { damping: 10, stiffness: 170 } });
  return (
    <AbsoluteFill>
      <div dir="rtl" style={{ position: "absolute", left: 60, right: 60, top: 420, display: "flex", justifyContent: "center", gap: 36 }}>
        {MOTS_AR.map((w, i) => {
          const s = spring({ frame: f - t0 - i * 7, fps, config: { damping: 9, stiffness: 200 } });
          return <div key={i} style={{ width: 280, padding: "40px 0 30px", borderRadius: 40, background: "rgba(42,12,34,0.92)", boxShadow: `0 0 0 4px ${GOLD}`, textAlign: "center", transform: `scale(${s}) translateY(${(1 - s) * 80}px)`, opacity: Math.min(1, s * 1.5) }}>
            <div lang="ar" style={{ fontFamily: AR, fontSize: 96, lineHeight: 1.4, color: GOLD }}>{w}</div>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 52, color: "#fff", marginTop: 6 }}>{i + 1}</div>
          </div>;
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", transform: `scale(${m})`, opacity: m }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 22, padding: "24px 48px", borderRadius: 999, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 52, boxShadow: "0 0 60px rgba(233,196,106,0.6)" }}>
          <svg width={56} height={56} viewBox="0 0 24 24" fill="none" stroke={PLUM} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><circle cx={12} cy={12} r={9} /><path d="M12 7v5l3 2" /></svg>
          {D.moment}
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 5 et 6. Dans Sabab : la fiche entière, la source, le bouton ----------
const E = "ecrans/fiche-zidni";
const ZT = zone(E, /^Accroître sa science$/, 1), ZS = zone(E, /^Source : Coran, Tâ-Hâ/), ZB = zone(E, /^Apprendre par cœur$/);
const FIN = L[6];
const Fiche: React.FC = () => <Phone ecran={E} from={L[4] - 4} to={FIN - 2} entree="iris" sortie="traverse" focus={[{ at: L[4] + 8, px: 0.5, py: 0.28, s: 1.08 }]}>
  <Surligne at={mot(/^bibliothèque/, 4)} {...ZT} fin={mot(/^source/, 4) - 2} />
  <Surligne at={mot(/^source/, 4)} {...ZS} fin={mot(/^apprendre/, 4) - 2} />
  <Surligne at={mot(/^apprendre/, 4)} {...ZB} />
  <Pastille at={mot(/^révisions/, 5)} x={W * 0.5} y={H * 0.56} gold>Dans tes révisions ✓</Pastille>
</Phone>;

// ---------- 7. Enregistre : le signet qui se remplit ----------
const Signet: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - mot(/^Enregistre/, 6), fps, config: { damping: 9, stiffness: 180 } });
  const plein = interpolate(f, [mot(/^vidéo/, 6), mot(/^vidéo/, 6) + 10], [0, 1], C);
  return <div style={{ position: "absolute", left: 540 - 70, top: 1040, transform: `scale(${s})`, opacity: s }}>
    <svg width={140} height={160} viewBox="0 0 24 28"><path d="M5 3h14v22l-7-5-7 5z" fill={GOLD} fillOpacity={plein} stroke={GOLD} strokeWidth={2.2} strokeLinejoin="round" /></svg>
  </div>;
};

const SFX: Sfx[] = [
  ["pop", 3, 0.6], ["impact", 9, 0.5], ["whoosh", mot(/^Prophète/) - 18, 0.35], ["pop", mot(/^davantage/) + 10, 0.55],
  ["whoosh", L[1] - 18, 0.45], ["impact", L[1] - 2, 0.45], ["shimmer", mot(/^science/, 1) + 12, 0.4],
  ["shimmer", L[2] - 6, 0.35],
  ["whoosh", L[3] - 18, 0.4], ...[0, 1, 2].map((i) => ["tick", mot(/^trois/, 3) + i * 7 + 4, 0.45] as Sfx), ["pop", mot(/^avant/, 3) + 12, 0.35],
  ["whoosh", L[4] - 18, 0.45], ["tick", mot(/^bibliothèque/, 4) + 12, 0.35], ["tick", mot(/^source/, 4) + 10, 0.35], ["tap", mot(/^apprendre/, 4) + 12, 0.4],
  ["ding", mot(/^révisions/, 5) + 10, 0.4],
  ["whoosh", FIN - 18, 0.4], ["impact", FIN - 2, 0.45], ["pop", mot(/^vidéo/, 6) + 12, 0.35],
];

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[1], L[2] + 10, L[4], L[5], T.DUREE]} />
    <Scene from={0} to={L[1] - 2} zin={0}><Accroche /></Scene>
    <Scene from={L[1] - 4} to={L[2] - 2}><Science /></Scene>
    <Scene from={L[2] - 4} to={L[3] - 2}><Verset /></Scene>
    <Scene from={L[3] - 4} to={L[4] - 4}><TroisMots /></Scene>
    <Fiche />
    <Scene from={FIN - 4} to={T.DUREE + 10} zin={0}><Logo at={FIN} phrase="Enregistre cette vidéo" /><Signet /></Scene>
    <Flash at={L[1] + 2} />
    <Voile />
    <SousTitres T={T} or={/^(Allah|davantage|seule|science|Coran|Seigneur|trois|travail|Sabab|source|révisions|Enregistre)/i} grandsDes={6} />
    <Son voix="saviez.mp3" sfx={SFX} />
  </AbsoluteFill>
);
export const video = { id: "saviez", component: Video, duree: T.DUREE };
