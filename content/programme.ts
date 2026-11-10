/*
 * Contenu religieux du programme : invocations, sources, thèmes du jour, parcours.
 *
 * Copié à l’identique du prototype de référence (reference/rizq.html).
 * RÈGLE : ne jamais modifier un texte arabe, une phonétique, une traduction ou une source
 * sans demande explicite. Le test tests/content.test.ts vérifie l’identité avec le prototype.
 */
import type { Grade, Item, Day, Parcours, ObjCat } from "./types";

export const GRADES: Record<string, Grade> = {
  coran: { label: "Coran", cls: "g-coran" },
  sahih: { label: "Sahîh", cls: "g-sahih" },
  hasan: { label: "Hasan", cls: "g-hasan" }
};

export const ITEMS: Record<string, Item> = {
  fajr: {
    kind: "dua",
    title: "Invocation après le Fajr",
    moment: "Après la prière du Fajr",
    when: "fajr",
    ar: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا",
    ph: "Allâhumma innî as’aluka ʿilman nâfiʿan, wa rizqan tayyiban, wa ʿamalan mutaqabbalan.",
    fr: "Ô Allah, je Te demande une science utile, une subsistance pure et des œuvres acceptées.",
    grade: "sahih",
    src: "Ibn Mâjah (n° 925), authentifié par Al-Albânî",
    note: "Le Prophète ﷺ la disait après avoir terminé la prière du Fajr. Elle place le rizq « pur » au cœur de la journée, dès son ouverture."
  },
  sayyid: {
    kind: "dua",
    title: "Sayyid al-istighfâr",
    moment: "Matin et soir",
    ar: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    ph: "Allâhumma anta rabbî, lâ ilâha illâ ant, khalaqtanî wa ana ʿabduk, wa ana ʿalâ ʿahdika wa waʿdika mastataʿt, aʿûdhu bika min sharri mâ sanaʿt, abû’u laka bi niʿmatika ʿalayy, wa abû’u bi dhanbî faghfir lî, fa innahu lâ yaghfirudh-dhunûba illâ ant.",
    fr: "Ô Allah, Tu es mon Seigneur, il n’y a de divinité que Toi. Tu m’as créé et je suis Ton serviteur. Je respecte Ton pacte et Ta promesse autant que je le peux. Je cherche refuge auprès de Toi contre le mal que j’ai commis. Je reconnais Tes bienfaits envers moi et je reconnais mon péché : pardonne-moi, car nul ne pardonne les péchés en dehors de Toi.",
    grade: "sahih",
    src: "Al-Bukhârî (n° 6306)",
    note: "Le « maître des demandes de pardon ». Celui qui la dit le jour avec certitude et meurt avant le soir fait partie des gens du Paradis, et de même s’il la dit le soir et meurt avant le matin.",
    slots: [
      { l: "Matin", t: 1 },
      { l: "Soir", t: 1 }
    ]
  },
  istighfar: {
    kind: "dua",
    title: "Istighfâr",
    moment: "Tout au long de la journée",
    ar: "أَسْتَغْفِرُ اللَّهَ",
    ph: "Astaghfirullâh.",
    fr: "Je demande pardon à Allah.",
    grade: "coran",
    src: "Coran, Nûh 71:10-12 ; Muslim (n° 2702)",
    note: "« Implorez le pardon de votre Seigneur, Il pardonne tant ; Il vous enverra du ciel une pluie abondante, vous accordera biens et enfants, et vous donnera jardins et rivières. » Le Prophète ﷺ demandait lui-même pardon cent fois par jour.",
    slots: [
      { l: "Objectif du jour", t: 100 }
    ]
  },
  hasbi: {
    kind: "dua",
    title: "Hasbiyallâh",
    moment: "7 fois le matin, 7 fois le soir",
    ar: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
    ph: "Hasbiyallâhu lâ ilâha illâ huwa, ʿalayhi tawakkaltu wa huwa rabbul-ʿarshil-ʿazîm.",
    fr: "Allah me suffit, il n’y a de divinité que Lui ; en Lui je place ma confiance, et Il est le Seigneur du Trône immense.",
    grade: "coran",
    src: "Coran, At-Tawba 9:129 ; le nombre de 7 vient d’Abû Dâwûd (n° 5081)",
    note: "Le verset est coranique. La pratique des 7 répétitions est rapportée d’Abû ad-Dardâ’ (un Compagnon) ; son authenticité est discutée par les savants. Tu peux la garder comme habitude, sans t’attacher à une promesse précise.",
    slots: [
      { l: "Matin", t: 7 },
      { l: "Soir", t: 7 }
    ]
  },
  hayy: {
    kind: "dua",
    title: "Yâ Hayyu yâ Qayyûm",
    moment: "Matin et soir",
    ar: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
    ph: "Yâ Hayyu yâ Qayyûm, bi rahmatika astaghîth, aslih lî sha’nî kullah, wa lâ takilnî ilâ nafsî tarfata ʿayn.",
    fr: "Ô Vivant, ô Celui qui subsiste par Lui-même, c’est par Ta miséricorde que je demande secours : arrange toutes mes affaires, et ne me confie pas à moi-même, ne serait-ce que le temps d’un clin d’œil.",
    grade: "hasan",
    src: "An-Nasâ’î (As-Sunan al-Kubrâ) et Al-Hâkim, jugé hasan par Al-Albânî",
    note: "Le Prophète ﷺ l’a enseignée à sa fille Fâtima pour le matin et le soir. Elle demande qu’Allah arrange « toutes » tes affaires : travail, projets, famille.",
    slots: [
      { l: "Matin", t: 1 },
      { l: "Soir", t: 1 }
    ]
  },
  musa: {
    kind: "dua",
    title: "L’invocation de Moïse",
    moment: "Autant que possible dans la journée",
    ar: "رَبِّ إِنِّي لِمَا أَنْزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ",
    ph: "Rabbi innî limâ anzalta ilayya min khayrin faqîr.",
    fr: "Seigneur, j’ai grand besoin du bien que Tu feras descendre vers moi.",
    grade: "coran",
    src: "Coran, Al-Qasas 28:24",
    note: "Moïse la prononce seul, exilé et épuisé, après avoir aidé deux femmes à abreuver leur troupeau. Juste après, Allah lui accorde un travail, un foyer et la sécurité (28:25-28)."
  },
  jeuneLun: {
    kind: "action",
    title: "Jeûner le lundi",
    optional: true,
    desc: "Sunna recommandée, facultative. Elle ne compte pas dans ton pourcentage.",
    grade: "sahih",
    src: "Muslim (n° 1162) ; At-Tirmidhî (n° 747)",
    note: "Le Prophète ﷺ jeûnait le lundi et le jeudi, et expliquait que les œuvres sont présentées à Allah ces jours-là, et qu’il aimait que les siennes le soient pendant qu’il jeûnait."
  },
  dette: {
    kind: "dua",
    title: "Invocation contre les dettes",
    moment: "Après les prières, ou au moins une fois",
    ar: "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ",
    ph: "Allâhumma-kfinî bi halâlika ʿan harâmik, wa aghninî bi fadlika ʿamman siwâk.",
    fr: "Ô Allah, suffis-moi par Ton licite pour que je me passe de Ton illicite, et enrichis-moi par Ta grâce pour que je n’aie besoin de personne d’autre que Toi.",
    grade: "hasan",
    src: "At-Tirmidhî (n° 3563)",
    note: "ʿAlî l’a enseignée à un homme accablé par une dette, en lui disant que même avec une dette grande comme une montagne, Allah l’en acquitterait."
  },
  detteAct: {
    kind: "action",
    title: "Régler ou planifier une dette",
    desc: "Même petite : un remboursement, un échéancier, un appel pour régulariser. L’invocation accompagne l’effort, elle ne le remplace pas.",
    task: true
  },
  hamm: {
    kind: "dua",
    title: "Refuge contre le souci et la paresse",
    moment: "Matin et soir",
    ar: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ، وَغَلَبَةِ الرِّجَالِ",
    ph: "Allâhumma innî aʿûdhu bika minal-hammi wal-hazan, wal-ʿajzi wal-kasal, wal-bukhli wal-jubn, wa dalaʿid-dayni wa ghalabatir-rijâl.",
    fr: "Ô Allah, je cherche refuge auprès de Toi contre le souci et la tristesse, l’incapacité et la paresse, l’avarice et la lâcheté, le poids des dettes et la domination des hommes.",
    grade: "sahih",
    src: "Al-Bukhârî (n° 6369)",
    note: "Anas rapporte que le Prophète ﷺ la disait très souvent. Elle vise exactement ce qui bloque l’abondance : l’angoisse, la procrastination et l’endettement.",
    slots: [
      { l: "Matin", t: 1 },
      { l: "Soir", t: 1 }
    ]
  },
  hammAct: {
    kind: "action",
    title: "Avancer sur la tâche que tu repousses",
    desc: "Celle que tu reportes depuis le plus longtemps. Même trente minutes suffisent pour casser le blocage.",
    task: true
  },
  sabr: {
    kind: "dua",
    title: "Invocation de la patience",
    moment: "Dans la journée",
    ar: "رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَتَوَفَّنَا مُسْلِمِينَ",
    ph: "Rabbanâ afrigh ʿalaynâ sabran wa tawaffanâ muslimîn.",
    fr: "Seigneur, déverse sur nous l’endurance et fais-nous mourir entièrement soumis à Toi.",
    grade: "coran",
    src: "Coran, Al-Aʿrâf 7:126",
    note: "C’est l’invocation des magiciens de Pharaon devenus croyants, au moment où ils étaient menacés. Elle demande une patience qui se « déverse » en abondance."
  },
  jeuneJeu: {
    kind: "action",
    title: "Jeûner le jeudi",
    optional: true,
    desc: "Sunna recommandée, facultative. Elle ne compte pas dans ton pourcentage.",
    grade: "sahih",
    src: "At-Tirmidhî (n° 747)",
    note: "Les œuvres sont présentées à Allah le lundi et le jeudi."
  },
  bilan: {
    kind: "action",
    title: "Faire le bilan de la semaine",
    desc: "Qu’est-ce qui a avancé, qu’est-ce qui a bloqué ? Écris-le dans la note du jour, en bas de page.",
    task: true
  },
  salawat: {
    kind: "dua",
    title: "Prière sur le Prophète ﷺ",
    moment: "En abondance toute la journée",
    ar: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ",
    ph: "Allâhumma salli ʿalâ Muhammadin wa ʿalâ âli Muhammad.",
    fr: "Ô Allah, prie sur Muhammad et sur la famille de Muhammad.",
    grade: "sahih",
    src: "Abû Dâwûd (n° 1047) ; At-Tirmidhî (n° 2457, hasan)",
    note: "Le Prophète ﷺ a demandé de multiplier les prières sur lui le vendredi. Ubayy ibn Kaʿb voulait leur consacrer toute son invocation ; il lui fut répondu : alors tes soucis te seront épargnés et tes péchés pardonnés. L’objectif de 100 est un repère, pas un nombre fixé par le hadith.",
    slots: [
      { l: "Objectif conseillé", t: 100 }
    ]
  },
  kahf: {
    kind: "action",
    title: "Lire la sourate Al-Kahf",
    desc: "Entre le coucher du soleil du jeudi et celui du vendredi.",
    grade: "sahih",
    src: "Al-Hâkim et Al-Bayhaqî, authentifié par Al-Albânî",
    note: "Celui qui la lit le vendredi est éclairé d’une lumière jusqu’au vendredi suivant."
  },
  heure: {
    kind: "action",
    title: "Invoquer avant le Maghreb",
    when: "lastHour",
    desc: "Garde la dernière heure avant le Maghreb pour tes demandes personnelles : rizq, projets, famille.",
    grade: "sahih",
    src: "Abû Dâwûd (n° 1048)",
    note: "Il y a le vendredi une heure où aucun musulman ne demande quelque chose à Allah sans qu’Il le lui accorde ; le hadith indique de la chercher à la dernière heure après le ʿAsr."
  },
  sadaqa: {
    kind: "action",
    title: "Donner une aumône",
    desc: "Le montant importe peu : la régularité compte plus que la taille.",
    grade: "coran",
    src: "Coran, Saba’ 34:39",
    note: "« Tout ce que vous dépensez, Il le remplace, et Il est le meilleur des pourvoyeurs. »"
  },
  anas: {
    kind: "dua",
    title: "La barakah dans ce qu’on a",
    moment: "Dans la journée",
    ar: "اللَّهُمَّ أَكْثِرْ مَالِي وَوَلَدِي، وَبَارِكْ لِي فِيمَا أَعْطَيْتَنِي",
    ph: "Allâhumma akthir mâlî wa waladî, wa bârik lî fîmâ aʿtaytanî.",
    fr: "Ô Allah, augmente mes biens et ma descendance, et bénis-moi dans ce que Tu m’as donné.",
    grade: "sahih",
    src: "Al-Bukhârî (n° 6334) ; Muslim (n° 2481)",
    note: "Le Prophète ﷺ l’a faite pour Anas, à la demande de sa mère ; elle est ici adaptée à la première personne. Anas raconta plus tard que ses biens et sa descendance étaient devenus très nombreux."
  },
  rahim: {
    kind: "action",
    title: "Appeler ou visiter un proche",
    desc: "Un parent, un frère, une tante, quelqu’un avec qui le lien s’est distendu.",
    grade: "sahih",
    src: "Al-Bukhârî (n° 5986)",
    note: "Que celui qui aime voir sa subsistance élargie et sa vie prolongée entretienne les liens de parenté."
  },
  atina: {
    kind: "dua",
    title: "Le bien des deux mondes",
    moment: "Dans la journée et dans la prosternation",
    ar: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    ph: "Rabbanâ âtinâ fid-dunyâ hasanah, wa fil-âkhirati hasanah, wa qinâ ʿadhâban-nâr.",
    fr: "Seigneur, accorde-nous une belle part ici-bas, une belle part dans l’au-delà, et protège-nous du châtiment du Feu.",
    grade: "coran",
    src: "Coran, Al-Baqara 2:201 ; Al-Bukhârî (n° 6389)",
    note: "Anas rapporte que c’était l’invocation la plus fréquente du Prophète ﷺ."
  },
  yunus: {
    kind: "dua",
    title: "L’invocation de Yûnus",
    moment: "Dans la journée",
    ar: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    ph: "Lâ ilâha illâ anta, subhânaka, innî kuntu minaz-zâlimîn.",
    fr: "Il n’y a de divinité que Toi, gloire à Toi ! J’ai été parmi les injustes.",
    grade: "coran",
    src: "Coran, Al-Anbiyâ’ 21:87 ; At-Tirmidhî (n° 3505)",
    note: "Yûnus l’a prononcée dans le ventre de la baleine. Aucun musulman ne l’invoque pour quelque chose sans qu’Allah lui réponde."
  },
  plan: {
    kind: "action",
    title: "Planifier la semaine à venir",
    desc: "Trois priorités concrètes, pas plus. Le tawakkul commence par un plan.",
    task: true
  },
  fadl: {
    kind: "dua",
    title: "Demander de la grâce d’Allah",
    moment: "En sortant de la mosquée, et dans la journée",
    ar: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
    ph: "Allâhumma innî as’aluka min fadlik.",
    fr: "Ô Allah, je Te demande de Ta grâce.",
    grade: "sahih",
    src: "Muslim (n° 713)",
    note: "Le Prophète ﷺ enseignait de la dire en sortant de la mosquée : on y entre en demandant la miséricorde, on en sort en demandant la grâce, c’est-à-dire les biens de ce monde."
  },
  faqr: {
    kind: "dua",
    title: "Refuge contre la pauvreté",
    moment: "Matin et soir",
    ar: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ",
    ph: "Allâhumma innî aʿûdhu bika minal-kufri wal-faqr.",
    fr: "Ô Allah, je cherche refuge auprès de Toi contre la mécréance et la pauvreté.",
    grade: "hasan",
    src: "Abû Dâwûd (n° 5090) ; An-Nasâ’î (n° 1347)",
    note: "Le Prophète ﷺ la disait le matin et le soir, et après la prière. Associer la pauvreté à la mécréance montre combien la détresse matérielle peut fragiliser la foi.",
    slots: [
      { l: "Matin", t: 1 },
      { l: "Soir", t: 1 }
    ]
  },
  azwaj: {
    kind: "dua",
    title: "Pour un foyer qui réjouit le cœur",
    moment: "Dans la journée et dans la prosternation",
    ar: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا",
    ph: "Rabbanâ hab lanâ min azwâjinâ wa dhurriyyâtinâ qurrata aʿyun, wajʿalnâ lil-muttaqîna imâmâ.",
    fr: "Seigneur, fais que nos épouses et nos descendants soient la joie de nos yeux, et fais de nous un modèle pour les pieux.",
    grade: "coran",
    src: "Coran, Al-Furqân 25:74",
    note: "Allah la cite parmi les invocations des « serviteurs du Tout Miséricordieux ». Elle demande non seulement un foyer, mais un foyer qui apaise."
  },
  zidni: {
    kind: "dua",
    title: "Accroître sa science",
    moment: "Avant chaque séance de travail",
    ar: "رَبِّ زِدْنِي عِلْمًا",
    ph: "Rabbi zidnî ʿilmâ.",
    fr: "Seigneur, accroît ma science.",
    grade: "coran",
    src: "Coran, Tâ-Hâ 20:114",
    note: "C’est la seule chose dont Allah a ordonné à Son Prophète ﷺ de demander davantage."
  },
  sharh: {
    kind: "dua",
    title: "L’invocation avant l’épreuve orale",
    moment: "Avant un examen, un entretien, une prise de parole",
    ar: "رَبِّ اشْرَحْ لِي صَدْرِي، وَيَسِّرْ لِي أَمْرِي، وَاحْلُلْ عُقْدَةً مِنْ لِسَانِي، يَفْقَهُوا قَوْلِي",
    ph: "Rabbi-shrah lî sadrî, wa yassir lî amrî, wahlul ʿuqdatan min lisânî, yafqahû qawlî.",
    fr: "Seigneur, ouvre-moi ma poitrine, facilite-moi ma tâche, et dénoue le nœud de ma langue, afin qu’ils comprennent mes paroles.",
    grade: "coran",
    src: "Coran, Tâ-Hâ 20:25-28",
    note: "Moïse la prononce au moment d’être envoyé parler à Pharaon. Elle convient à toute situation où il faut convaincre."
  },
  infaani: {
    kind: "dua",
    title: "Une science qui profite",
    moment: "Après l’étude",
    ar: "اللَّهُمَّ انْفَعْنِي بِمَا عَلَّمْتَنِي، وَعَلِّمْنِي مَا يَنْفَعُنِي، وَزِدْنِي عِلْمًا",
    ph: "Allâhumma-nfaʿnî bimâ ʿallamtanî, wa ʿallimnî mâ yanfaʿunî, wa zidnî ʿilmâ.",
    fr: "Ô Allah, fais-moi profiter de ce que Tu m’as appris, apprends-moi ce qui me sera utile, et accroît ma science.",
    grade: "hasan",
    src: "At-Tirmidhî (n° 3599) ; Ibn Mâjah (n° 251)",
    note: "Le savoir demandé ici n’est pas une accumulation : c’est celui qui transforme la vie."
  },
  ujurni: {
    kind: "dua",
    title: "L’invocation dans l’épreuve",
    moment: "Quand l’épreuve se fait sentir",
    ar: "إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ، اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي وَأَخْلِفْ لِي خَيْرًا مِنْهَا",
    ph: "Innâ lillâhi wa innâ ilayhi râjiʿûn, Allâhumma’jurnî fî musîbatî wa akhlif lî khayran minhâ.",
    fr: "Nous appartenons à Allah et c’est vers Lui que nous retournons. Ô Allah, récompense-moi dans mon épreuve et donne-moi en échange quelque chose de meilleur.",
    grade: "sahih",
    src: "Muslim (n° 918)",
    note: "Umm Salama la prononça à la mort de son mari Abû Salama, en se demandant qui pourrait être meilleur que lui. Allah lui donna ensuite pour époux le Prophète ﷺ."
  },
  mayyit: {
    kind: "dua",
    title: "Pour la personne disparue",
    moment: "Chaque jour, en pensant à elle",
    ar: "اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ، وَعَافِهِ وَاعْفُ عَنْهُ",
    ph: "Allâhumma-ghfir lahu warhamhu, wa ʿâfihi waʿfu ʿanhu.",
    fr: "Ô Allah, pardonne-lui, fais-lui miséricorde, préserve-le et efface ses fautes.",
    grade: "sahih",
    src: "Muslim (n° 963)",
    note: "C’est le début de l’invocation de la prière funéraire. Pour une femme : اللَّهُمَّ اغْفِرْ لَهَا وَارْحَمْهَا، وَعَافِهَا وَاعْفُ عَنْهَا (Allâhumma-ghfir lahâ warhamhâ, wa ʿâfihâ waʿfu ʿanhâ)."
  }
};

/** Le socle quotidien. */
export const SOCLE: string[] = ["fajr", "sayyid", "istighfar", "hasbi", "hayy"];
/** Le minimum du jour. */
export const MINIMUM: string[] = ["fajr", "sayyid", "hayy"];
/** Semaine 1 du démarrage en douceur. */
export const RAMP1: string[] = ["fajr", "sayyid", "istighfar"];
export const MOMENT_OF: Record<string, "matin" | "soir"> = { fajr: "matin", heure: "soir" };

/** Indexé par Date.getDay() : 0 = dimanche. */
export const DAYS: Day[] = [
  {
    name: "Dimanche",
    theme: "Le bien des deux mondes",
    items: ["atina", "yunus", "plan"]
  },
  {
    name: "Lundi",
    theme: "Ouvrir les portes du rizq",
    items: ["musa", "jeuneLun"]
  },
  {
    name: "Mardi",
    theme: "Se libérer des dettes",
    items: ["dette", "detteAct"]
  },
  {
    name: "Mercredi",
    theme: "Chasser l’angoisse et la paresse",
    items: ["hamm", "hammAct"]
  },
  {
    name: "Jeudi",
    theme: "La patience et la constance",
    items: ["sabr", "jeuneJeu", "bilan"]
  },
  {
    name: "Vendredi",
    theme: "Le jour le plus fort de la semaine",
    items: ["salawat", "kahf", "heure", "sadaqa"]
  },
  {
    name: "Samedi",
    theme: "La barakah dans ce qu’on a",
    items: ["anas", "rahim"]
  }
];

export const PARCOURS: Record<string, Parcours> = {
  rizq: {
    title: "Ouvrir les portes du rizq",
    intro: "Pour une recherche d’emploi, un lancement d’activité ou des revenus à faire grandir.",
    duas: ["fadl", "musa", "anas"],
    actions: ["Écris en une phrase ce que tu demandes à Allah, et pourquoi.", "Envoie une candidature, une offre ou une relance que tu repoussais.", "Recense tes sources de revenu et note celle qui a le plus de potentiel.", "Contacte une personne de ton réseau qui peut t’ouvrir une porte.", "Vérifie qu’aucun de tes revenus n’est douteux sur le plan du halal.", "Donne une aumône, même petite.", "Apprends une compétence pendant 30 minutes.", "Remercie Allah par écrit pour trois choses que tu as déjà.", "Améliore un détail concret de ton offre, de ton CV ou de ton produit.", "Fais une demande que tu n’osais pas faire."]
  },
  dettes: {
    title: "Sortir des dettes",
    intro: "Pour voir clair, rembourser pas à pas et retrouver la sérénité.",
    duas: ["dette", "hamm", "faqr"],
    actions: ["Liste toutes tes dettes : montant, créancier, échéance.", "Choisis la dette à rembourser en premier.", "Identifie une dépense à supprimer ce mois-ci.", "Appelle un créancier pour proposer un échéancier.", "Rembourse une somme, même symbolique.", "Vérifie tes abonnements et résilie l’inutile.", "Mets de côté une petite somme pour l’imprévu.", "Note une source de revenu complémentaire possible.", "Évite tout nouvel achat à crédit aujourd’hui.", "Fais le point : qu’est-ce qui a baissé depuis le début du parcours ?"]
  },
  mariage: {
    title: "Le mariage",
    intro: "Pour celui ou celle qui cherche un conjoint pieux et un foyer apaisé.",
    duas: ["azwaj", "musa"],
    actions: ["Écris les trois qualités essentielles que tu recherches.", "Écris ce que toi, tu apportes à un foyer.", "Parle de ton projet à une personne de confiance de ta famille.", "Travaille une qualité qui te manque encore.", "Lis sur les droits et devoirs des époux.", "Prie deux unités de prière et confie ton projet à Allah.", "Demande à un proche s’il connaît une personne sérieuse.", "Fais une invocation pour ton futur conjoint, où qu’il soit.", "Revois tes critères : sont-ils ceux de la religion ou de l’image ?", "Rends service à un couple marié de ton entourage."]
  },
  etudes: {
    title: "Études et examens",
    intro: "Pour réviser avec régularité et aborder les épreuves avec calme.",
    duas: ["zidni", "sharh", "infaani"],
    actions: ["Fais le planning de révision jusqu’à l’examen.", "Révise 45 minutes sans téléphone.", "Explique à voix haute une notion difficile.", "Fais un sujet d’annale en conditions réelles.", "Corrige tes erreurs d’hier.", "Dors suffisamment cette nuit.", "Aide un camarade sur une notion que tu maîtrises.", "Fais une fiche de synthèse d’un chapitre.", "Remercie un enseignant ou quelqu’un qui t’a aidé.", "Fais le point sur ce qui reste à revoir."]
  },
  epreuve: {
    title: "Traverser une épreuve",
    intro: "Pour un moment difficile : perte d’emploi, maladie d’un proche, échec.",
    duas: ["ujurni", "sabr", "yunus"],
    actions: ["Écris ce qui te pèse, sans te juger.", "Parle à une personne de confiance.", "Sors marcher vingt minutes.", "Note une chose qui va bien malgré tout.", "Fais une action concrète, même petite, sur le problème.", "Lis le récit de Yûnus dans le Coran.", "Accorde-toi une vraie pause aujourd’hui.", "Aide quelqu’un d’autre : ça allège le cœur.", "Demande de l’aide professionnelle si le poids devient trop lourd.", "Écris comment tu étais il y a quelques jours, et comment tu es aujourd’hui."]
  },
  deuil: {
    title: "Le deuil",
    intro: "Pour accompagner la perte d’un proche et continuer à lui faire du bien.",
    duas: ["ujurni", "mayyit"],
    actions: ["Écris un souvenir heureux de la personne.", "Donne une aumône en son nom.", "Lis une sourate en pensant à elle.", "Appelle un proche qui partage ton chagrin.", "Règle une affaire qu’elle laissait en suspens, si tu le peux.", "Rends visite à sa tombe si c’est possible.", "Prends soin de toi : repas, sommeil, marche.", "Pense à une œuvre durable en son nom : un puits, un Coran, un savoir transmis.", "Accepte de pleurer : le Prophète ﷺ a pleuré son fils Ibrâhîm.", "Écris ce qu’elle t’a transmis et que tu veux garder."]
  }
};

export const PARCOURS_DAYS = 40;
export const OBJ_CATS: Record<string, ObjCat> = {
  emploi: { l: "Emploi ou revenus", p: "rizq" },
  activite: { l: "Lancer ou développer une activité", p: "rizq" },
  dette: { l: "Rembourser une dette", p: "dettes" },
  mariage: { l: "Se marier", p: "mariage" },
  etudes: { l: "Réussir des études ou un examen", p: "etudes" },
  epreuve: { l: "Traverser une épreuve", p: "epreuve" },
  autre: { l: "Autre objectif", p: "rizq" }
};
