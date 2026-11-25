// « Le saviez-vous ? » : le Prophète ﷺ demandait pardon cent fois par jour (programme.ts · istighfar).
// Textes religieux : public/voix/saviez.textes.json (copiés par programme depuis content/programme.ts · istighfar).
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, AR, FONT, GOLD, PLUM, W, H, minutage, zone, englobe, SousTitres, Voile, Fond, Scene, Flash, Phone, Pastille, Surligne, Logo, Son, type Sfx } from "../moteur";
import voix from "../../public/voix/saviez.json";
import tx from "../../public/voix/saviez.textes.json";

const T = minutage(voix);
const { L, mot } = T;
const D = tx.dua;
// La source contient deux références : le verset (Coran, Nûh 71:10-12) et le hadith (Muslim (n° 2702)).
const [SRC_CORAN, SRC_HADITH] = D.src.split(" ; ");
// La citation du verset : le début de la note, jusqu’au premier « ; » (copié tel quel, sans retouche).
const VERSET = D.note.slice(0, D.note.indexOf(" ;")) + " »";
const MOTS_AR = D.ar.split(" ");
const FIN = mot(/^l’oublier/, 6);

// ---------- 1. L’accroche : le compteur qui monte jusqu’à 100 ----------
const Accroche: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const pill = spring({ frame: f - 2, fps, config: { damping: 9, stiffness: 180 } });
  const c0 = mot(/^cent/), c1 = mot(/^jour/);
  const n = Math.round(interpolate(f, [c0 - 10, c1 + 4], [0, 100], { ...C, easing: Easing.out(Easing.cubic) }));
  const big = spring({ frame: f - (c0 - 10), fps, config: { damping: 10, stiffness: 160 } });
  const anneau = interpolate(f, [c0 - 10, c1 + 4], [0, 1], { ...C, easing: Easing.out(Easing.cubic) });
  const q = spring({ frame: f - mot(/^savais/), fps, config: { damping: 7, stiffness: 200 } });
  const pr = spring({ frame: f - mot(/^Prophète/), fps, config: { damping: 12, stiffness: 150 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center", transform: `scale(${pill})` }}>
        <div style={{ display: "inline-block", padding: "18px 40px", borderRadius: 999, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 60, letterSpacing: "0.04em", boxShadow: "0 0 70px rgba(233,196,106,0.7)" }}>LE SAVIEZ-VOUS ?</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 58, color: "#fff", opacity: pr, transform: `translateY(${(1 - pr) * 30}px)` }}>
        Le Prophète <span style={{ fontFamily: AR }}>ﷺ</span>
      </div>
      <svg width={1080} height={1080} style={{ position: "absolute", left: 0, top: 380 }}>
        <circle cx={540} cy={420} r={280} fill="rgba(42,12,34,0.85)" stroke="rgba(255,255,255,0.12)" strokeWidth={16} opacity={big} />
        <circle cx={540} cy={420} r={280} fill="none" stroke={GOLD} strokeWidth={16} strokeLinecap="round" pathLength={1} strokeDasharray={`${anneau} 1`} transform="rotate(-90 540 420)" style={{ filter: "drop-shadow(0 0 16px rgba(233,196,106,0.8))" }} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 660, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 230, lineHeight: 1, color: "#fff", transform: `scale(${big})`, textShadow: "0 0 60px rgba(233,196,106,0.6)" }}>{n}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 900, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 46, color: GOLD, opacity: interpolate(f, [c1 - 4, c1 + 8], [0, 1], C) }}>fois par jour</div>
      <div style={{ position: "absolute", left: 540 + 200, top: 470, width: 130, height: 130, borderRadius: "50%", background: GOLD, display: "grid", placeItems: "center",
        fontFamily: FONT, fontWeight: 800, fontSize: 90, color: PLUM, transform: `scale(${q}) rotate(${(1 - q) * -30}deg)`, boxShadow: "0 0 40px rgba(233,196,106,0.7)" }}>?</div>
    </AbsoluteFill>
  );
};

// ---------- 2 et 3. Deux mots : l’arabe, mot par mot, puis la phonétique et la traduction ----------
const DeuxMots: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const m1 = spring({ frame: f - (mot(/^deux/, 1) - 4), fps, config: { damping: 11, stiffness: 170 } });
  const m2 = spring({ frame: f - (mot(/^mots/, 1) - 2), fps, config: { damping: 11, stiffness: 170 } });
  const ph = interpolate(f, [L[2] - 8, L[2] + 8], [0, 1], C);
  const tr = spring({ frame: f - mot(/^pardon/, 2), fps, config: { damping: 14, stiffness: 140 } });
  const t0 = spring({ frame: f - L[1], fps, config: { damping: 14, stiffness: 140 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center", opacity: t0 }}>
        <span style={{ display: "inline-block", padding: "10px 30px", borderRadius: 999, border: `3px solid ${GOLD}`, color: GOLD, fontFamily: FONT, fontWeight: 700, fontSize: 38, letterSpacing: "0.1em" }}>{D.title.toUpperCase()}</span>
      </div>
      {/* Deux mots, lus de droite à gauche : le premier mot arabe est à droite. */}
      <div style={{ position: "absolute", left: 40, right: 40, top: 420, display: "flex", flexDirection: "row-reverse", justifyContent: "center", gap: 50 }}>
        {[m1, m2].map((s, i) => (
          <div key={i} style={{ textAlign: "center", opacity: s, transform: `translateY(${(1 - s) * 80}px)` }}>
            <div style={{ width: 84, height: 84, margin: "0 auto 24px", borderRadius: "50%", background: GOLD, color: PLUM, display: "grid", placeItems: "center", fontFamily: FONT, fontWeight: 800, fontSize: 50, transform: `scale(${s})` }}>{i + 1}</div>
            <div dir="rtl" lang="ar" style={{ padding: "10px 44px", borderRadius: 40, background: "rgba(42,12,34,0.9)", boxShadow: `0 0 0 3px ${GOLD}, 0 30px 80px rgba(0,0,0,0.4)`, fontFamily: AR, fontSize: 100, lineHeight: 1.7, color: "#fff", textShadow: "0 0 30px rgba(233,196,106,0.5)" }}>{MOTS_AR[i]}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 920, textAlign: "center", fontFamily: FONT, fontStyle: "italic", fontSize: 66, color: GOLD, opacity: ph }}>{D.ph}</div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 1060, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 58, color: "#fff", opacity: tr, transform: `scale(${0.9 + 0.1 * tr})` }}>{D.fr}</div>
    </AbsoluteFill>
  );
};

// ---------- 4. Le verset ----------
const Verset: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - L[3], fps, config: { damping: 14, stiffness: 120 } });
  const src = spring({ frame: f - mot(/^tant/, 3), fps, config: { damping: 12, stiffness: 160 } });
  return (
    <AbsoluteFill>
      <svg width={260} height={200} viewBox="0 0 120 90" style={{ position: "absolute", left: 540 - 130, top: 330, opacity: s, transform: `translateY(${(1 - s) * -60}px)`, filter: "drop-shadow(0 0 20px rgba(233,196,106,0.6))" }}>
        <path d="M60 18 C44 8 22 8 6 14 V80 C22 74 44 74 60 84 C76 74 98 74 114 80 V14 C98 8 76 8 60 18z" fill="rgba(42,12,34,0.9)" stroke={GOLD} strokeWidth={3} strokeLinejoin="round" />
        <path d="M60 18 V84" stroke={GOLD} strokeWidth={3} />
      </svg>
      <div style={{ position: "absolute", left: 80, right: 80, top: 600, padding: "54px 50px", borderRadius: 48, background: "rgba(42,12,34,0.9)", boxShadow: "0 0 0 3px rgba(233,196,106,0.6), 0 40px 100px rgba(0,0,0,0.5)",
        opacity: s, transform: `translateY(${(1 - s) * 120}px)`, textAlign: "center" }}>
        <div style={{ fontFamily: FONT, fontSize: 60, color: "#fff", fontWeight: 800, lineHeight: 1.3 }}>{VERSET}</div>
        <div style={{ fontFamily: FONT, fontSize: 42, color: GOLD, fontWeight: 700, marginTop: 30, opacity: src }}>{SRC_CORAN}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 5. Le hadith : cent fois par jour, cent points qui s’allument ----------
const Cent: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = interpolate(f, [L[4], mot(/^jour/, 4) + 6], [0, 100], { ...C, easing: Easing.out(Easing.cubic) });
  const s = spring({ frame: f - (mot(/^Muslim/, 4) - 4), fps, config: { damping: 10, stiffness: 180 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 540 - 330, top: 250, width: 660, display: "grid", gridTemplateColumns: "repeat(10, 48px)", gap: 20, justifyContent: "center" }}>
        {Array.from({ length: 100 }, (_, i) => <div key={i} style={{ width: 48, height: 48, borderRadius: "50%", background: i < a ? GOLD : "rgba(255,255,255,0.14)", boxShadow: i < a ? "0 0 14px rgba(233,196,106,0.7)" : "none" }} />)}
      </div>
      <div style={{ position: "absolute", left: 160, right: 160, top: 990, padding: "30px 30px", borderRadius: 40, background: "rgba(42,12,34,0.92)", boxShadow: `0 0 0 3px ${GOLD}`, textAlign: "center", transform: `scale(${s})`, opacity: s }}>
        <div style={{ fontFamily: FONT, fontSize: 32, color: "rgba(255,255,255,0.7)", fontWeight: 600, letterSpacing: "0.12em" }}>SOURCE</div>
        <div style={{ fontFamily: FONT, fontSize: 56, color: "#fff", fontWeight: 800, marginTop: 10 }}>{SRC_HADITH}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 6. Dans Sabab : la fiche, puis le bilan de la semaine ----------
const EF = "ecrans/fiche-istighfar", EB = "ecrans/bilan";
const ZT = zone(EF, /^Istighfâr$/), ZA = englobe(zone(EF, /^أَسْتَغْفِرُ/), zone(EF, /^Je demande pardon à Allah\.$/));
const ZB = englobe(zone(EB, /^400$/), zone(EB, /^istighfâr$/)), ZW = zone(EB, /^Cette semaine$/);
const BILAN = mot(/^bilan/, 5);
const Fiche: React.FC = () => <Phone ecran={EF} from={L[5] - 4} to={BILAN - 2} entree="iris" sortie="gauche">
  <Surligne at={mot(/^Sabab/, 5) + 2} {...ZT} fin={mot(/^journée/, 5) - 2} />
  <Surligne at={mot(/^journée/, 5)} {...ZA} />
  <Pastille at={mot(/^journée/, 5) + 4} x={W * 0.5} y={H * 0.54} gold>{D.slots[0].l} : {D.slots[0].t}</Pastille>
</Phone>;
const Bilan: React.FC = () => <Phone ecran={EB} from={BILAN - 4} to={L[6] + 2} entree="droite" sortie="traverse">
  <Surligne at={BILAN + 2} {...ZW} fin={mot(/^compte/, 5) - 2} />
  <Surligne at={mot(/^compte/, 5)} {...ZB} />
</Phone>;

// ---------- 7. Enregistre : le signet, puis l’étoile Sabab ----------
const Fin: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - L[6], fps, config: { damping: 8, stiffness: 180 } });
  const out = interpolate(f, [FIN, FIN + 10], [0, 1], C);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 540 - 130, top: 420, transform: `scale(${s * (1 - out)}) rotate(${(1 - s) * 20}deg)`, opacity: 1 - out }}>
        <svg width={260} height={320} viewBox="0 0 24 30"><path d="M3 2h18v26l-9-6-9 6z" fill={GOLD} /></svg>
      </div>
      <Logo at={FIN + 4} phrase={D.ph.replace(/\.$/, "")} />
    </AbsoluteFill>
  );
};

const SFX: Sfx[] = [
  ["impact", 2, 0.6], ["pop", mot(/^Prophète/) + 4, 0.35], ["tick", mot(/^cent/) - 8, 0.3],
  ["pop", mot(/^deux/, 1) - 2, 0.4], ["pop", mot(/^mots/, 1) + 6, 0.4],
  ["shimmer", L[2] - 4, 0.4],
  ["whoosh", L[3] - 18, 0.4], ["shimmer", L[3] + 2, 0.3],
  ["whoosh", L[4] - 18, 0.4], ["tick", mot(/^Muslim/, 4) + 10, 0.4],
  ["whoosh", L[5] - 18, 0.5], ["tick", mot(/^journée/, 5) + 8, 0.4], ["whoosh", BILAN - 16, 0.4], ["tick", mot(/^compte/, 5) + 8, 0.4],
  ["whoosh", L[6] - 18, 0.45], ["pop", L[6] + 4, 0.45], ["impact", FIN + 12, 0.6], ["shimmer", FIN + 14, 0.5],
];

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[1] - 8, L[2] + 10, L[5] - 6, L[5] + 14, T.DUREE]} />
    <Scene from={0} to={L[1] - 2} zin={0}><Accroche /></Scene>
    <Scene from={L[1] - 4} to={L[3] - 2}><DeuxMots /></Scene>
    <Scene from={L[3] - 4} to={L[4] - 2}><Verset /></Scene>
    <Scene from={L[4] - 4} to={L[5] - 2}><Cent /></Scene>
    <Fiche />
    <Bilan />
    <Scene from={L[6] - 4} to={T.DUREE + 10} zin={0}><Fin /></Scene>
    <Flash at={L[2]} />
    <Voile />
    <SousTitres T={T} or={/^(Prophète|cent|savais|deux|pardon|Coran|Seigneur|Muslim|Sabab|bilan|Enregistre)/i} grandsDes={6} />
    <Son voix="saviez.mp3" sfx={SFX} />
  </AbsoluteFill>
);
export const video = { id: "saviez", component: Video, duree: T.DUREE };
