// « Le saviez-vous ? » : ce que le Prophète ﷺ répétait cent fois dans une même assise (Hisn al-Muslim, hm-211 ; At-Tirmidhî 3/153, Ibn Mâjah 2/321).
// Textes religieux : public/voix/saviez.textes.json (copiés par programme depuis content/citadelle.json · hm-211).
// L’arabe, la phonétique et la traduction sont seulement COUPÉS en deux (le récit d’Ibn ‘Umar / l’invocation), jamais modifiés.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, AR, FONT, GOLD, PLUM, minutage, zone, SousTitres, Voile, Fond, Scene, Flash, Phone, Surligne, Logo, StarP, Son, type Sfx } from "../moteur";
import voix from "../../public/voix/saviez.json";
import tx from "../../public/voix/saviez.textes.json";

const T = minutage(voix);
const { L, mot } = T;
const D = tx.dua;
const coupe = (s: string, apres: string) => { const i = s.indexOf(apres); if (i < 0) throw new Error("coupure introuvable : " + apres); return [s.slice(0, i + apres.length).trim(), s.slice(i + apres.length).trim()]; };
const AR2 = coupe(D.ar, "يَقُومَ:"), PH2 = coupe(D.ph, "yaqūma:"), FR2 = coupe(D.fr, "cent répétitions de :");
// ﷺ s’affiche mal en DM Sans : la police Amiri pour ce seul signe.
const AvecSalut: React.FC<{ t: string }> = ({ t }) => <>{t.split(/(ﷺ)/).map((p, i) => p === "ﷺ" ? <span key={i} style={{ fontFamily: AR }}>{p}</span> : p)}</>;

// ---------- 1. L’accroche : une assemblée en cercle, une place se lève ----------
const Accroche: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const b = spring({ frame: f - 3, fps, config: { damping: 8, stiffness: 200 } });
  const c = spring({ frame: f - 10, fps, config: { damping: 15, stiffness: 60 } });
  const lever = spring({ frame: f - mot(/^quitter/), fps, config: { damping: 12, stiffness: 140 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", transform: `scale(${b}) rotate(${(1 - b) * 10}deg)` }}>
        <span style={{ display: "inline-block", padding: "18px 50px", borderRadius: 26, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 76, letterSpacing: "0.06em", boxShadow: "0 0 70px rgba(233,196,106,0.7)" }}>LE SAVIEZ-VOUS ?</span>
      </div>
      <svg width={1080} height={900} style={{ position: "absolute", left: 0, top: 420 }}>
        <circle cx={540} cy={420} r={250} fill="none" stroke="rgba(233,196,106,0.3)" strokeWidth={4} strokeDasharray="4 18" strokeLinecap="round" opacity={c} />
        {Array.from({ length: 9 }, (_, i) => {
          const a = (i / 9) * Math.PI * 2 - Math.PI / 2, s = interpolate(c, [i / 14, i / 14 + 0.35], [0, 1], C);
          const moi = i === 0, dy = moi ? -lever * 70 : 0;
          return <g key={i} transform={`translate(${540 + 250 * Math.cos(a)} ${420 + 250 * Math.sin(a) + dy}) scale(${s})`}>
            <circle r={moi ? 46 : 38} fill={moi ? GOLD : "rgba(42,12,34,0.95)"} stroke={GOLD} strokeWidth={5} style={{ filter: moi ? `drop-shadow(0 0 ${20 + 30 * lever}px rgba(233,196,106,0.9))` : undefined }} />
          </g>;
        })}
      </svg>
      <div style={{ position: "absolute", left: 540 - 60, top: 420 + 420 - 60, transform: `scale(${c}) rotate(${f * 0.6}deg)` }}><StarP size={120} glow={30} /></div>
    </AbsoluteFill>
  );
};

// ---------- 2. Cent fois : le compteur, et le récit d’Ibn ‘Umar (copié) ----------
const Cent: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = spring({ frame: f - L[1], fps, config: { damping: 14, stiffness: 130 } });
  const t0 = mot(/^comptaient/, 1), t1 = mot(/^cent/, 1) + 10;
  const n = Math.round(interpolate(f, [t0, t1], [0, 100], { ...C, easing: Easing.out(Easing.cubic) }));
  const fin = spring({ frame: f - t1, fps, config: { damping: 7, stiffness: 220 } });
  return (
    <AbsoluteFill>
      <svg width={1080} height={760} style={{ position: "absolute", left: 0, top: 170 }}>
        <circle cx={540} cy={340} r={260} fill="rgba(42,12,34,0.88)" stroke="rgba(255,255,255,0.14)" strokeWidth={20} opacity={a} />
        <circle cx={540} cy={340} r={260} fill="none" stroke={GOLD} strokeWidth={20} strokeLinecap="round" pathLength={1} strokeDasharray={`${n / 100} 1`} transform="rotate(-90 540 340)" style={{ filter: "drop-shadow(0 0 16px rgba(233,196,106,0.8))" }} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 170 + 340 - 150, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 230, lineHeight: 1.1, color: "#fff", opacity: a, transform: `scale(${1 + 0.12 * fin * Math.max(0, 1 - (f - t1) / 20)})`, textShadow: "0 0 60px rgba(233,196,106,0.6)" }}>{n}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 170 + 340 + 120, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 44, color: GOLD, letterSpacing: "0.12em", opacity: a }}>FOIS</div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 990, padding: "30px 36px", borderRadius: 36, background: "rgba(42,12,34,0.88)", boxShadow: "0 0 0 2px rgba(233,196,106,0.45)", textAlign: "center",
        fontFamily: FONT, fontWeight: 600, fontSize: 38, lineHeight: 1.4, color: "rgba(255,255,255,0.92)", opacity: interpolate(f, [L[1] + 6, L[1] + 18], [0, 1], C) }}><AvecSalut t={FR2[0]} /></div>
    </AbsoluteFill>
  );
};

// ---------- 3. L’invocation : arabe, phonétique, traduction (copiés à l’identique) ----------
const Dua: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = spring({ frame: f - L[2], fps, config: { damping: 14, stiffness: 120 } });
  const b = interpolate(f, [L[2] + 14, L[2] + 30], [0, 1], C);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 190, textAlign: "center", opacity: a }}>
        <span style={{ display: "inline-block", padding: "12px 34px", borderRadius: 999, border: `3px solid ${GOLD}`, color: GOLD, fontFamily: FONT, fontWeight: 700, fontSize: 40, letterSpacing: "0.08em" }}>CENT FOIS, AVANT DE SE LEVER</span>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 300, padding: "50px 40px", borderRadius: 50, background: "rgba(42,12,34,0.9)", boxShadow: "0 0 0 3px rgba(233,196,106,0.55), 0 40px 100px rgba(0,0,0,0.5)",
        textAlign: "center", opacity: a, transform: `perspective(1600px) rotateX(${(1 - a) * 50}deg)` }}>
        <div dir="rtl" lang="ar" style={{ fontFamily: AR, fontSize: 92, lineHeight: 1.7, color: GOLD, textShadow: "0 0 40px rgba(233,196,106,0.5)" }}>{AR2[1]}</div>
        <div style={{ fontFamily: FONT, fontStyle: "italic", fontSize: 40, lineHeight: 1.4, color: "rgba(255,255,255,0.85)", marginTop: 14, opacity: b }}>{PH2[1]}</div>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 48, lineHeight: 1.3, color: "#fff", marginTop: 24, opacity: b }}>{FR2[1]}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 4. La source : la carte qui pivote ----------
const Source: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - L[3], fps, config: { damping: 14, stiffness: 150 } });
  const b = spring({ frame: f - mot(/^At-Tirmidhî/, 3), fps, config: { damping: 9, stiffness: 200 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 100, right: 100, top: 520, padding: "56px 50px", borderRadius: 48, background: "rgba(42,12,34,0.9)", boxShadow: "0 0 0 3px rgba(233,196,106,0.6), 0 40px 100px rgba(0,0,0,0.5)",
        transform: `perspective(1600px) rotateY(${(1 - s) * 70}deg)`, opacity: s, textAlign: "center" }}>
        <div style={{ fontFamily: FONT, fontSize: 32, color: "rgba(255,255,255,0.7)", fontWeight: 600, letterSpacing: "0.1em", lineHeight: 1.4 }}>HISN AL-MUSLIM · {D.chapitre.toUpperCase()}</div>
        <div style={{ fontFamily: FONT, fontSize: 62, color: "#fff", fontWeight: 800, lineHeight: 1.3, marginTop: 24, transform: `scale(${0.92 + 0.08 * b})` }}>{D.src}</div>
      </div>
      <div style={{ position: "absolute", left: 540 - 50, top: 370, transform: `scale(${b}) rotate(${f}deg)` }}><StarP size={100} glow={30} /></div>
    </AbsoluteFill>
  );
};

// ---------- 5. Dans Sabab : la fiche entière, surlignée au fil de la voix ----------
const E = "ecrans/fiche-assise";
const ZT = zone(E, /^Ce que l'on dit dans une assemblée$/, 1), ZA = zone(E, /^عَنِ ابْنِ عُمَرَ/), ZP = zone(E, /^‘An Ibni ‘Umara/);
const FIN = L[5];
const Fiche: React.FC = () => <Phone ecran={E} from={L[4] - 4} to={FIN - 2} entree="bascule" sortie="traverse" focus={[{ at: L[4] + 8, px: 0.5, py: 0.4, s: 1.06 }]}>
  <Surligne at={mot(/^bibliothèque/, 4)} {...ZT} fin={mot(/arabe/, 4) - 2} />
  <Surligne at={mot(/arabe/, 4)} {...ZA} fin={mot(/^phonétique/, 4) - 2} />
  <Surligne at={mot(/^phonétique/, 4)} {...ZP} />
</Phone>;

// ---------- 6. Enregistre : le signet qui se remplit ----------
const Signet: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - mot(/^Enregistre/, 5), fps, config: { damping: 9, stiffness: 180 } });
  const plein = interpolate(f, [mot(/^vidéo/, 5), mot(/^vidéo/, 5) + 10], [0, 1], C);
  return <div style={{ position: "absolute", left: 540 - 70, top: 1040, transform: `scale(${s})`, opacity: s }}>
    <svg width={140} height={160} viewBox="0 0 24 28"><path d="M5 3h14v22l-7-5-7 5z" fill={GOLD} fillOpacity={plein} stroke={GOLD} strokeWidth={2.2} strokeLinejoin="round" /></svg>
  </div>;
};

const SFX: Sfx[] = [
  ["pop", 3, 0.6], ["impact", 9, 0.5],
  ["whoosh", L[1] - 18, 0.45], ["impact", L[1] - 2, 0.35], ["tick", mot(/^comptaient/, 1) + 8, 0.3],
  ["shimmer", L[2] + 2, 0.3],
  ["whoosh", L[3] - 18, 0.45], ["pop", L[4] - 12, 0.35],
  ["whoosh", L[4] - 18, 0.4], ["tick", mot(/^bibliothèque/, 4) + 12, 0.35], ["tick", mot(/arabe/, 4) + 10, 0.35], ["tick", mot(/^phonétique/, 4) + 14, 0.35],
  ["whoosh", FIN - 18, 0.4], ["impact", FIN - 2, 0.45], ["pop", mot(/^vidéo/, 5) + 12, 0.35],
];

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[1], L[2] + 10, L[4], L[5], T.DUREE]} />
    <Scene from={0} to={L[1] - 2} zin={0}><Accroche /></Scene>
    <Scene from={L[1] - 4} to={L[2] - 2}><Cent /></Scene>
    <Scene from={L[2] - 4} to={L[3] - 2}><Dua /></Scene>
    <Scene from={L[3] - 4} to={L[4] - 4}><Source /></Scene>
    <Fiche />
    <Scene from={FIN - 4} to={T.DUREE + 10} zin={0}><Logo at={FIN} phrase="Enregistre cette vidéo" /><Signet /></Scene>
    <Flash at={L[1] + 2} />
    <Voile />
    <SousTitres T={T} or={/^(Prophète|assemblée|cent|assise|Seigneur|pardonne|repentir|Pardonneur|At-Tirmidhî|Sabab|Enregistre)/i} grandsDes={5} />
    <Son voix="saviez.mp3" sfx={SFX} />
  </AbsoluteFill>
);
export const video = { id: "saviez", component: Video, duree: T.DUREE };
