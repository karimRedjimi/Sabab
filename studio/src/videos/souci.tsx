// « Commente ton souci » : le manque de régularité dans la prière. « Ô Allah, aide-moi à T’évoquer… » (Hisn al-Muslim, hm-75 ; Abû Dâwûd 2/86, An-Nasâ'î 3/53).
// Textes religieux : public/voix/souci.textes.json (copiés par programme depuis content/citadelle.json · hm-75). Jamais de promesse, jamais de reproche : on demande de l’aide, on reprend.
import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, AR, FONT, GOLD, PLUM, W, H, minutage, zone, englobe, SousTitres, Voile, Fond, StarP, Scene, Flash, Phone, Pastille, Surligne, Logo, Son, type Sfx } from "../moteur";
import voix from "../../public/voix/souci.json";
import tx from "../../public/voix/souci.textes.json";

const T = minutage(voix);
const { L, mot } = T;
const D = tx.dua;
const LIEN = mot(/^lien/, 7);

// ---------- 1. Le commentaire (exemple, sans nom) ----------
const Commentaire: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const b = spring({ frame: f - 2, fps, config: { damping: 11, stiffness: 170 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 40, color: "rgba(255,255,255,0.75)", letterSpacing: "0.12em", opacity: b }}>RÉPONSE À UN COMMENTAIRE</div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 400, padding: "44px 48px", borderRadius: 44, background: "#fff", boxShadow: "0 30px 90px rgba(0,0,0,0.5)", transform: `scale(${b}) rotate(${(1 - b) * 4}deg)`, transformOrigin: "90% 100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 74, height: 74, borderRadius: "50%", background: "#E8DDE5", display: "grid", placeItems: "center" }}>
            <svg width={44} height={44} viewBox="0 0 24 24" fill={PLUM} opacity={0.5}><circle cx={12} cy={8} r={4.2} /><path d="M3.5 21c1.2-4.6 4.6-7 8.5-7s7.3 2.4 8.5 7z" /></svg>
          </div>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 36, color: "rgba(42,12,34,0.55)" }}>Un commentaire</div>
        </div>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 62, lineHeight: 1.2, color: PLUM, marginTop: 24 }}>Je rate des prières, et je n’arrive pas à être régulier.</div>
      </div>
      <div style={{ position: "absolute", right: 160, top: 400 + 450, width: 0, height: 0, borderLeft: "34px solid transparent", borderRight: "34px solid transparent", borderTop: "56px solid #fff", transform: `scale(${b})` }} />
    </AbsoluteFill>
  );
};

// ---------- 2. Beaucoup vivent ça : des lueurs, puis un chemin de pas qui s’allument ----------
const LUEURS = Array.from({ length: 26 }, (_, i) => ({ x: 100 + random("sx" + i) * 880, y: 250 + random("sy" + i) * 420, r: 8 + random("sr" + i) * 12 }));
const PAS = Array.from({ length: 6 }, (_, i) => ({ x: 380 + i * 70 + (i % 2 ? 70 : -70), y: 1340 - i * 80 }));
const PasAPas: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const t0 = L[1], tR = mot(/^reprendre/, 1);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1400} style={{ position: "absolute", inset: 0 }}>
        {LUEURS.map((p, i) => {
          const k = spring({ frame: f - t0 - i * 1.2, fps, config: { damping: 12, stiffness: 160 } });
          return <circle key={i} cx={p.x} cy={p.y} r={p.r * k} fill="#fff" opacity={(0.25 + 0.3 * Math.sin(f / 8 + i)) * k} />;
        })}
        {PAS.map((p, i) => {
          const k = spring({ frame: f - tR - i * 5, fps, config: { damping: 10, stiffness: 200 } });
          return <ellipse key={i} cx={p.x} cy={p.y} rx={34} ry={52} transform={`rotate(${i % 2 ? 12 : -12} ${p.x} ${p.y})`} fill={GOLD} opacity={k} style={{ filter: "drop-shadow(0 0 16px rgba(233,196,106,0.9))" }} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 720, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 88, color: "#fff", opacity: spring({ frame: f - mot(/^silence/, 1), fps, config: { damping: 14 } }) }}>
        en <span style={{ color: GOLD }}>silence</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 3. La Citadelle du musulman : le chapitre de cette invocation ----------
const Chapitre: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const l = spring({ frame: f - L[2], fps, config: { damping: 14, stiffness: 110 } });
  const c = spring({ frame: f - mot(/^aide/, 2), fps, config: { damping: 10, stiffness: 160 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 540 - 230, top: 240, width: 460, height: 560, perspective: 1600, opacity: l }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "18px 40px 40px 18px", background: "linear-gradient(135deg,#5B1E47,#2A0C22)", boxShadow: `inset 18px 0 0 rgba(0,0,0,0.25), 0 0 0 4px ${GOLD}, 0 40px 100px rgba(0,0,0,0.5)`,
          transform: `rotateY(${(1 - l) * -70}deg)`, display: "grid", placeItems: "center", textAlign: "center", padding: 40 }}>
          <div>
            <StarP size={110} glow={20} />
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 44, color: GOLD, marginTop: 30, letterSpacing: "0.06em" }}>HISN AL-MUSLIM</div>
            <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 36, color: "rgba(255,255,255,0.85)", marginTop: 12 }}>La Citadelle du musulman</div>
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 880, textAlign: "center", transform: `scale(${c})`, opacity: c }}>
        <span style={{ display: "inline-block", padding: "26px 44px", borderRadius: 36, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 50, lineHeight: 1.2, boxShadow: "0 0 60px rgba(233,196,106,0.6)" }}>{D.chapitre}</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 4 et 5. L’invocation entière (arabe, phonétique, traduction), puis sa source ----------
const Invocation: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = spring({ frame: f - L[3], fps, config: { damping: 15, stiffness: 100 } });
  const b = interpolate(f, [L[3] + 16, L[3] + 34], [0, 1], C);
  const s = spring({ frame: f - L[4], fps, config: { damping: 10, stiffness: 180 } });
  const halo = 0.5 + 0.5 * Math.sin(f / 14);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 60, right: 60, top: 220, padding: "50px 40px 40px", borderRadius: 50, background: "rgba(42,12,34,0.92)", textAlign: "center", opacity: a, transform: `scale(${0.94 + 0.06 * a})`,
        boxShadow: `0 0 0 3px rgba(233,196,106,${0.5 + 0.3 * halo}), 0 0 ${40 + 40 * halo}px rgba(233,196,106,0.35), 0 40px 100px rgba(0,0,0,0.5)` }}>
        <div dir="rtl" lang="ar" style={{ fontFamily: AR, fontSize: 92, lineHeight: 1.8, color: GOLD, unicodeBidi: "plaintext", textShadow: "0 0 30px rgba(233,196,106,0.45)" }}>{D.ar}</div>
        <div style={{ fontFamily: FONT, fontStyle: "italic", fontSize: 42, lineHeight: 1.4, color: "rgba(255,255,255,0.8)", marginTop: 14, opacity: b }}>{D.ph}</div>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 52, lineHeight: 1.3, color: "#fff", marginTop: 22, opacity: b }}>{D.fr}</div>
        <div style={{ height: 76, marginTop: 28 }}>
          <span style={{ display: "inline-block", padding: "12px 36px", borderRadius: 999, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 42, transform: `scale(${s})` }}>{D.src}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 6. L’accueil : chaque prière, et la question du moment ----------
const EA = "ecrans/accueil";
const ZP = englobe(zone(EA, /^07:03 Fajr$/), zone(EA, /^18:14 ʿIchâ$/)), ZQ = englobe(zone(EA, /^Tu as prié le ʿAsr \?$/), zone(EA, /^Oui, priée$/), zone(EA, /^Pas encore$/)), ZO = zone(EA, /^Oui, priée$/);
const Accueil: React.FC = () => <Phone ecran={EA} from={L[5] - 4} to={L[6] - 2} entree="droite" sortie="gauche" focus={[{ at: L[5] + 8, px: 0.5, py: 0.4, s: 1.06 }]}>
  <Surligne at={mot(/^prière/, 5)} {...ZP} fin={mot(/^cocher/, 5) - 4} />
  <Surligne at={mot(/^cocher/, 5)} {...ZQ} />
  <Pastille at={mot(/^geste/, 5) + 4} x={(ZO.x + ZO.w / 2) * W} y={(ZO.y + ZO.h) * H + 60} gold>Un geste ✓</Pastille>
</Phone>;

// ---------- 7. Les jours difficiles : le minimum du jour ----------
const EM = "ecrans/minimum";
const ZM = englobe(zone(EM, /^Minimum du jour$/), zone(EM, /^Trois invocations courtes suffisent aujourd’hui\.$/));
const Minimum: React.FC = () => <Phone ecran={EM} from={L[6] - 4} to={L[7] - 2} entree="bascule" sortie="traverse" focus={[{ at: L[6] + 8, px: 0.5, py: 0.42, s: 1.06 }]}>
  <Surligne at={mot(/^minimum/, 6)} {...ZM} />
</Phone>;

const SFX: Sfx[] = [
  ["message", 2, 0.5], ["pop", 10, 0.4],
  ["whoosh", L[1] - 18, 0.4], ["shimmer", L[1] + 2, 0.3], ...[0, 2, 4].map((i) => ["tick", mot(/^reprendre/, 1) + i * 5 + 4, 0.3] as Sfx),
  ["whoosh", L[2] - 18, 0.45], ["tick", L[2] + 14, 0.35], ["pop", mot(/^aide/, 2) + 12, 0.4],
  ["shimmer", L[3] - 8, 0.35],
  ["pop", L[4] + 16, 0.3],
  ["whoosh", L[5] - 18, 0.45], ["tick", mot(/^prière/, 5) + 10, 0.35], ["tap", mot(/^geste/, 5) + 10, 0.4],
  ["whoosh", L[6] - 18, 0.45], ["ding", mot(/^minimum/, 6) + 12, 0.4],
  ["whoosh", L[7] - 18, 0.4], ["impact", L[7] - 2, 0.5], ["shimmer", LIEN + 14, 0.4],
];

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[1], L[3], L[5], L[7], T.DUREE]} />
    <Scene from={0} to={L[1] - 2} zin={0}><Commentaire /></Scene>
    <Scene from={L[1] - 4} to={L[2] - 2}><PasAPas /></Scene>
    <Scene from={L[2] - 4} to={L[3] - 2}><Chapitre /></Scene>
    <Scene from={L[3] - 4} to={L[5] - 4}><Invocation /></Scene>
    <Accueil />
    <Minimum />
    <Scene from={L[7] - 4} to={T.DUREE + 10} zin={0}><Logo at={L[7]} phrase="Le lien est en bio" /></Scene>
    <Flash at={L[2]} />
    <Voile />
    <SousTitres T={T} or={/^(prières|régulier|silence|reprendre|aide|Allah|évoquer|remercier|adorer|Abû|prière|geste|minimum|Sabab)/i} grandsDes={99} />
    <Son voix="souci.mp3" sfx={SFX} />
  </AbsoluteFill>
);
export const video = { id: "souci", component: Video, duree: T.DUREE };
