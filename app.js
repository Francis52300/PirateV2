// ============================================================
// app.js — Trésor Pirate (Lac du Der)
// ============================================================

const {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback
} = React;

/* ================================================================
   CONSTANTES
   ================================================================ */
const PLAY_ZONE = [
  { lat: 48.553312, lng: 4.780565 },
  { lat: 48.547617, lng: 4.781299 },
  { lat: 48.550361, lng: 4.791750 },
  { lat: 48.554617, lng: 4.787888 }
];
const CENTER = {
  lat: (48.553312 + 48.547617 + 48.550361 + 48.554617) / 4,
  lng: (4.780565 + 4.781299 + 4.791750 + 4.787888) / 4
};
const BOUNDS = (() => {
  const lats = PLAY_ZONE.map(p => p.lat),
    lngs = PLAY_ZONE.map(p => p.lng);
  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs)
  };
})();
const LEVELS = {
  easy: {
    label: "Facile",
    duration: 30,
    points: 3,
    blurb: "3 balises + retour ponton · idéal en famille",
    emoji: "⚓",
    estMin: 35,
    estMax: 55,
    estNote: "Navigation tranquille, idéale pour découvrir le lac."
  },
  normal: {
    label: "Normal",
    duration: 45,
    points: 4,
    blurb: "4 balises + retour ponton · pour les explorateurs",
    emoji: "🗺️",
    estMin: 50,
    estMax: 75,
    estNote: "Bon rythme d'exploration avec quelques défis."
  },
  expert: {
    label: "Expert",
    duration: 60,
    points: 5,
    blurb: "5 balises + retour ponton · énigmes corsées",
    emoji: "💀",
    estMin: 70,
    estMax: 100,
    estNote: "Parcours sportif — prévoir du temps pour les énigmes."
  }
};
const RENTAL_OPTIONS = [
  { label: "1 h 00", minutes: 60, emoji: "🕐" },
  { label: "1 h 30", minutes: 90, emoji: "🕑" },
  { label: "2 h 00", minutes: 120, emoji: "🕒" }
];
const FINAL_WORDS = {
  3: [
    { word: "DER", hints: ["Nom du lac bâti par l'homme pour calmer les crues.", "On le prononce comme un ordre bref du Capitaine."] },
    { word: "EAU", hints: ["Elle t'entoure du départ jusqu'au coffre maudit.", "Miroir au matin, vagues au vent d'après-midi."] },
    { word: "LAC", hints: ["Mot simple qui décrit tout le terrain de jeu.", "Il rime avec le bruit des pagaies qui claquent."] },
    { word: "ILE", hints: ["Fragment de forêt posé sur la surface, interdit aux intrus.", "Archipel secret pour les oiseaux nicheurs."] },
    { word: "NID", hints: ["Les grues y déposent leurs trésors dans les roseaux.", "Cocon qui flotte parfois au ras de l'eau."] }
  ],
  4: [
    { word: "VENT", hints: ["Invisible, il gonfle les voiles des catamarans.", "Il gifle ton visage quand tu prends de la vitesse."] },
    { word: "ONDE", hints: ["Elle voyage en cercles après chaque éclaboussure.", "Elle transmet le message des bouées virtuelles."] },
    { word: "GRUE", hints: ["Immense voyageuse qui dessine un V dans le ciel.", "Son cri rauque annonce l'automne sur le lac."] },
    { word: "ILOT", hints: ["Petit coin de verdure isolé par les flots.", "On le contourne pour respecter les nichées secrètes."] },
    { word: "CANE", hints: ["Compagne du colvert, elle glisse sans bruit dans les roseaux.", "Elle laisse un sillage en arabesque sur l'eau."] },
    { word: "PONTON", tokens: ["PO", "N", "TO", "N"], hints: ["Lieu où les navires viennent se reposer.", "Le premier pas avant d'embarquer."] }
  ],
  5: [
    { word: "RAMES", hints: ["Sans elles, impossible de diriger le paddle.", "Elles frappent l'eau comme un tambour pirate."] },
    { word: "VAGUE", hints: ["Elle roule vers la rive en portant tes indices.", "Elle se forme quand le vent souffle trop fort."] },
    { word: "FAUNE", hints: ["Rassemble en un mot tous les animaux du lac.", "On l'étudie pour protéger grues, cormorans et hérons."] },
    { word: "ALGUE", hints: ["Je danse sous la surface et oxygène l'eau.", "Je chatouille les pieds des navigateurs inattentifs."] },
    { word: "FLORE", hints: ["Je regroupe toutes les plantes qui parfument les berges.", "Je cache les passerelles secrètes dans les saules."] },
    { word: "GRUES", hints: ["Immenses voyageuses posées sur le lac au crépuscule.", "Elles battent des ailes avant la migration."] },
    { word: "BRUME", hints: ["Je me lève à l'aube et voile l'horizon.", "Je force les pirates à se fier à la boussole."] },
    { word: "SAULE", hints: ["Arbre aux branches souples qui effleurent l'eau.", "Il abrite poissons et têtards dans leur nursery."] },
    { word: "CARPE", hints: ["Poisson massif qui fouille la vase.", "On devine sa présence grâce aux bulles qui remontent."] },
    { word: "HERON", hints: ["Sentinelle grise immobile sur ses longues pattes.", "Il plonge son bec comme une lance pour pêcher."] }
  ]
};
const RIDDLES = [
  { id: "r1", theme: "Roseaux", prompt: "Je plie sous le vent mais ne romps jamais. Qui suis-je lorsque je chante en vert au bord du lac ?", answers: ["roseau", "roseaux"], clue: "Cherche les silhouettes dorées qui dépassent de l'eau.", rewardHint: "Les roseaux murmurent une lettre secrète." },
  { id: "r2", theme: "Vent", prompt: "Je suis invisible mais gonfle les voiles et fais danser les vagues. Que suis-je ?", answers: ["vent"], clue: "Observe la crête des vaguelettes pour garder le cap.", rewardHint: "Un souffle révèle un symbole." },
  { id: "r3", theme: "Eau", prompt: "Je reflète le ciel le jour et les étoiles la nuit. Pourtant je ne suis pas un miroir en verre.", answers: ["eau", "lac", "surface"], clue: "Plus l'eau est calme, plus tu te rapproches.", rewardHint: "La surface lisse cache une lettre." },
  { id: "r4", theme: "Bouées", prompt: "Je garde les aventuriers sur la bonne trajectoire sans être visible. Je suis virtuel.", answers: ["bouee", "bouée", "bouees", "bouées"], clue: "Faire confiance à ton écran te mènera à bon port.", rewardHint: "Une balise digitale te remet un fragment." },
  { id: "r5", theme: "Boussole", prompt: "Je montre le nord même sans étoiles. Je tourne, mais je guide toujours.", answers: ["boussole", "compas"], clue: "Garde ton téléphone à plat pour pointer précisément.", rewardHint: "L'aiguille libère une lettre flamboyante." },
  { id: "r6", theme: "Oiseaux", prompt: "Nous dessinons des V immenses dans le ciel avant de repartir vers le sud.", answers: ["oiseaux", "oiseau", "grues", "grue"], clue: "Regarde les nuées pour deviner la prochaine direction.", rewardHint: "Le vol collectif t'offre une lettre." },
  { id: "r7", theme: "Aube", prompt: "Je colore l'horizon en or et en rose. J'ouvre la journée des navigateurs.", answers: ["aube", "aurore", "lever de soleil"], clue: "Le soleil bas t'indique souvent le prochain alignement.", rewardHint: "L'aurore grave un caractère dans le coffre." },
  { id: "r8", theme: "Îlot", prompt: "Je suis un morceau de forêt posé sur l'eau. On m'approche mais on ne m'accoste pas toujours.", answers: ["ile", "ilot", "île", "îlot"], clue: "Contourne-moi, les vagues répercutent l'écho du trésor.", rewardHint: "L'île partage sa lettre aux navigateurs prudents." },
  { id: "r9", theme: "Pirates", prompt: "Je détourne les regards, cache mes secrets dans un coffre, et ne cède que devant le bon mot.", answers: ["pirate", "pirates"], clue: "Les pirates adorent les mots-code.", rewardHint: "Le capitaine offre un fragment au moussaillon gagnant." },
  { id: "r10", theme: "Nénuphars", prompt: "Je flotte comme un disque vert et ouvre parfois un coeur doré. J'abrite les têtards.", answers: ["nenuphar", "nenuphars", "nénuphar", "nénuphars"], clue: "Repère les zones calmes couvertes de feuilles rondes.", rewardHint: "Le tapis végétal révèle une lettre parfumée." },
  { id: "r11", theme: "Grues", prompt: "Nous volons en formation en V au-dessus du lac avant de migrer vers le sud.", answers: ["grue", "grues", "grue cendree", "grues cendrees"], clue: "Écoute les cris perçants venant du ciel.", rewardHint: "Leur ombre projette un symbole sur ta carte." },
  { id: "r12", theme: "Cormoran", prompt: "Je plonge longtemps pour pêcher puis je sèche mes ailes en croix. Qui suis-je ?", answers: ["cormoran", "cormorans"], clue: "Surveille les poteaux où je déploie mes ailes sombres.", rewardHint: "Le cormoran laisse tomber une lettre brillante." },
  { id: "r13", theme: "Héron", prompt: "Je reste immobile sur mes longues pattes pour guetter les poissons. Qui suis-je ?", answers: ["heron", "herons", "héron", "hérons"], clue: "Une silhouette grise et droite t'indique une zone riche.", rewardHint: "Le héron confie une lettre au marcheur silencieux." },
  { id: "r14", theme: "Carpes", prompt: "Je suis un poisson massif qui fouille la vase et fait frissonner la surface.", answers: ["carpe", "carpes"], clue: "Observe les bulles et remous pour trouver la balise.", rewardHint: "La carpe fait remonter un caractère brillant." },
  { id: "r15", theme: "Brume", prompt: "Je recouvre le lac au petit matin, voilant les berges et les repères. Qui suis-je ?", answers: ["brume", "brouillard"], clue: "Quand la brume tombe, avance doucement et suis ta boussole.", rewardHint: "Le voile blanc révèle un signe secret." },
  { id: "r16", theme: "Saules", prompt: "Je plonge mes branches souples dans l'eau pour offrir de l'ombre aux poissons.", answers: ["saule", "saules", "saule pleureur"], clue: "Cherche les arbres qui effleurent l'eau.", rewardHint: "Le saule te remet une lettre tombée de ses feuilles." },
  { id: "r17", theme: "Barrage", prompt: "Je retiens les eaux du lac et régule les niveaux pour protéger la vallée.", answers: ["barrage", "digue"], clue: "Imagine les digues invisibles pour rester dans la zone.", rewardHint: "La muraille d'eau te délivre une rune protectrice." },
  { id: "r18", theme: "Cygne", prompt: "Entièrement vêtu de blanc, je glisse avec élégance sans faire de vagues. Mon long cou se courbe comme une lettre.", answers: ["cygne", "cygnes"], clue: "Cherche la silhouette blanche qui glisse en silence.", rewardHint: "Le cygne te confie un fragment de sa grâce." },
  { id: "r19", theme: "Brochet", prompt: "Je suis le chasseur camouflé dans les herbiers, prêt à bondir sur ma proie avec mes dents acérées. On m'appelle le requin d'eau douce.", answers: ["brochet", "brochets"], clue: "Observe les zones herbues où les poissons évitent de s'aventurer.", rewardHint: "Le brochet surgit et te remet un symbole." },
  { id: "r20", theme: "Libellule", prompt: "Mes quatre ailes de dentelle me permettent de rester immobile dans les airs avant de foncer comme un éclair bleu ou vert.", answers: ["libellule", "libellules"], clue: "Guette les reflets colorés qui volent sur l'eau.", rewardHint: "La libellule te dépose une lettre brillante." },
  { id: "r21", theme: "Chêne", prompt: "Arbre roi de la forêt du Der, mon bois est solide et mes fruits, les glands, nourrissent les animaux de la rive.", answers: ["chene", "chenes", "chêne", "chênes"], clue: "Cherche le grand arbre aux feuilles découpées sur la berge.", rewardHint: "Le chêne centenaire te glisse un fragment de bois." },
  { id: "r22", theme: "Grenouille", prompt: "Verte ou brune, je chante en chœur la nuit et je fais des bonds impressionnants pour attraper les insectes.", answers: ["grenouille", "grenouilles"], clue: "Écoute les chants nocturnes qui montent des roseaux.", rewardHint: "La grenouille te lance une lettre du bout de sa langue." },
  { id: "r23", theme: "Silure", prompt: "Je suis le colosse à moustaches qui hante les profondeurs sombres du lac. Je peux mesurer plus de deux mètres.", answers: ["silure", "silures"], clue: "Regarde les grandes ombres qui passent sous la surface.", rewardHint: "Le silure remonte du fond avec un caractère rare." },
  { id: "r24", theme: "Coucher de soleil", prompt: "Je peins le ciel en rouge, orange et violet avant de laisser la place aux étoiles et de faire dormir le lac.", answers: ["coucher de soleil", "crepuscule", "crépuscule"], clue: "Oriente-toi vers l'ouest quand les couleurs s'enflamment.", rewardHint: "Le crépuscule grave un signe doré dans ton coffre." },
  { id: "r25", theme: "Barque", prompt: "Sans moteur ou à la force des bras, je glisse silencieusement sur l'onde pour ne pas effrayer les oiseaux.", answers: ["barque", "bateau", "rameur"], clue: "Suis les traces que laisse une embarcation légère sur l'eau.", rewardHint: "La barque t'apporte un fragment porté par le courant." },
  { id: "r26", theme: "Vase", prompt: "Je suis le tapis mou et sombre du fond du lac où les carpes aiment fouiller pour trouver leur nourriture.", answers: ["vase", "limon", "boue"], clue: "Observe les bulles qui remontent là où le fond est trouble.", rewardHint: "La vase libère un caractère enfoui depuis longtemps." },
  { id: "r27", theme: "Moustique", prompt: "Petit et piquant, je danse au-dessus des eaux stagnantes à la tombée de la nuit, cherchant une cible à piquer.", answers: ["moustique", "moustiques"], clue: "Méfie-toi des zones calmes où l'eau ne bouge plus.", rewardHint: "Le moustique te pique et laisse une lettre dans sa morsure." },
  { id: "r28", theme: "Canard colvert", prompt: "Ma tête est d'un vert brillant et mon bec jaune fouille les herbiers. On entend mon \"coin-coin\" de loin.", answers: ["canard", "colvert", "canards"], clue: "Repère le coin-coin qui résonne parmi les roseaux.", rewardHint: "Le colvert plonge la tête et remonte un fragment." },
  { id: "r29", theme: "Sable", prompt: "Je suis fait de milliers de grains d'or et j'accueille les châteaux des enfants sur les plages du lac l'été.", answers: ["sable", "plage"], clue: "Cherche là où le lac effleure la terre en douceur.", rewardHint: "Un grain de sable cache une lettre minuscule." },
  { id: "r30", theme: "Ragondin", prompt: "On me prend souvent pour un gros rat ou un castor, je nage en laissant juste mon museau et mes petites oreilles dépasser.", answers: ["ragondin", "ragondins"], clue: "Guette les petites têtes rondes qui traversent la surface.", rewardHint: "Le ragondin te tend un fragment depuis la berge." },
  { id: "r31", theme: "Pêcheur", prompt: "Je reste patient pendant des heures sur la rive ou mon bateau, une canne à la main, espérant que le bouchon coule.", answers: ["pecheur", "pecheurs", "pêcheur", "pêcheurs"], clue: "Cherche l'homme immobile face à l'eau, concentré en silence.", rewardHint: "Le pêcheur sort une lettre de sa boîte à appâts." },
  { id: "r32", theme: "Lune", prompt: "Mon reflet d'argent danse sur les vagues sombres du lac quand les grues se sont enfin tues.", answers: ["lune", "pleine lune"], clue: "Navigue de nuit et laisse-toi guider par mon miroir argenté.", rewardHint: "La lune grave un symbole lunaire sur ta carte." },
  { id: "r33", theme: "Algues", prompt: "Longues chevelures vertes cachées sous la surface, nous formons une forêt immergée où se cachent les petits poissons.", answers: ["algue", "algues"], clue: "Regarde sous la surface là où l'eau prend une teinte verte.", rewardHint: "Les algues t'offrent une lettre venue des profondeurs." }
];

const SK = "lacder-pirate-records";
const EMPTY_REC = { easy: null, normal: null, expert: null };
const CAPTAIN = "Capitaine Francis BlackWood";

/* ================================================================
   UTILITAIRES
   ================================================================ */
const toRad = d => d * Math.PI / 180;
const toDeg = r => r * 180 / Math.PI;
function havDist(a, b) {
  const R = 6371e3,
    dL = toRad(b.lat - a.lat),
    dN = toRad(b.lng - a.lng);
  const s = Math.sin(dL / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dN / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}
function bearing(f, t) {
  const la1 = toRad(f.lat),
    la2 = toRad(t.lat),
    dl = toRad(t.lng - f.lng);
  return (toDeg(Math.atan2(Math.sin(dl) * Math.cos(la2), Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(dl))) + 360) % 360;
}
function lerp(a, b, t) {
  const c = Math.min(1, Math.max(0, t));
  return { lat: a.lat + (b.lat - a.lat) * c, lng: a.lng + (b.lng - a.lng) * c };
}
function inPoly(p, poly) {
  let ins = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].lng, yi = poly[i].lat, xj = poly[j].lng, yj = poly[j].lat;
    if (yi > p.lat !== yj > p.lat && p.lng < (xj - xi) * (p.lat - yi) / (yj - yi) + xi) ins = !ins;
  }
  return ins;
}
function rnd(a, b) { return Math.random() * (b - a) + a; }
function shuffle(a) {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}
function randInPoly(poly) {
  const lats = poly.map(p => p.lat), lngs = poly.map(p => p.lng);
  const [ml, xl] = [Math.min(...lats), Math.max(...lats)], [mn, xn] = [Math.min(...lngs), Math.max(...lngs)];
  for (let i = 0; i < 100; i++) {
    const c = { lat: rnd(ml, xl), lng: rnd(mn, xn) };
    if (inPoly(c, poly)) return c;
  }
  return poly[0];
}
function splitWord(w, n) {
  const s = w.replace(/\s+/g, "");
  if (s.length === n) return s.split("");
  if (s.length < n) return s.padEnd(n, s[s.length - 1]).split("").slice(0, n);
  const base = Math.floor(s.length / n), rem = s.length % n, out = [];
  let c = 0;
  for (let i = 0; i < n; i++) {
    const sz = base + (i < rem ? 1 : 0);
    out.push(s.slice(c, c + sz));
    c += sz;
  }
  return out;
}
function norm(v) { return v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, ""); }
function matchAns(e, arr) { return arr.some(a => norm(a) === norm(e)); }
function fmtTime(ms) {
  if (!ms || isNaN(ms)) return "00:00";
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/* ================================================================
   COMPOSANT CARTE LEAFLET
   ================================================================ */
function PirateMap({
  mapId,
  points,
  activeIdx,
  solvedIds,
  userPos,
  isOutside,
  hasGps,
  stage,
  returning = false
}) {
  const mapRef = useRef(null);
  const boatRef = useRef(null);
  const wpsRef = useRef([]);
  const zoneRef = useRef(null);
  const routeRef = useRef(null);
  const capRef = useRef(null);
  const wakeRef = useRef(null);
  const wakePts = useRef([]);
  const startMkRef = useRef(null);

  const makeBoatIcon = useCallback(angleDeg => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="-20 -20 40 40">
      <g transform="rotate(${angleDeg})">
        <ellipse rx="6" ry="3.5" cy="2" fill="#1e3a5f" stroke="#60a5fa" stroke-width="1"/>
        <line x1="0" y1="1.5" x2="0" y2="-13" stroke="#94a3b8" stroke-width="1.2"/>
        <path d="M0 -12 L7 0 L0 1Z" fill="#fef3c7" fill-opacity=".95" stroke="#c8a97e" stroke-width=".6"/>
        <rect x="0" y="-14" width="5.5" height="3" rx=".6" fill="#1a1008"/>
        <text x="2.75" y="-11.2" text-anchor="middle" font-size="3" fill="#fef3c7" font-family="serif">☠</text>
      </g>
      <circle r="2" fill="#93c5fd"/>
      <circle r="9" fill="#3b82f6" fill-opacity=".15" stroke="none">
        <animate attributeName="r" values="6;12;6" dur="1.8s" repeatCount="indefinite"/>
        <animate attributeName="fill-opacity" values=".25;0;.25" dur="1.8s" repeatCount="indefinite"/>
      </circle>
    </svg>`;
    return L.divIcon({ html: svg, className: "lf-marker-boat", iconSize: [40, 40], iconAnchor: [20, 20] });
  }, []);

  const makeStartIcon = useCallback(() => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="-24 -24 48 48">
      <circle r="20" fill="#fbbf24" fill-opacity=".25" stroke="none">
        <animate attributeName="r" values="14;22;14" dur="1.4s" repeatCount="indefinite"/>
        <animate attributeName="fill-opacity" values=".35;.05;.35" dur="1.4s" repeatCount="indefinite"/>
      </circle>
      <circle r="13" fill="#fef3c7" stroke="#92400e" stroke-width="2.5"/>
      <text x="0" y="5" text-anchor="middle" font-size="14" fill="#b45309" font-family="serif">★</text>
      <text x="0" y="22" text-anchor="middle" font-size="5" fill="#5c2d0f" font-family="Pirata One,serif">Départ</text>
    </svg>`;
    return L.divIcon({ html: svg, className: "lf-marker-boat", iconSize: [48, 48], iconAnchor: [24, 24] });
  }, []);

  const makeWpIcon = useCallback((label, isCurrent, isSolved) => {
    const fill = isSolved ? "#14532d" : isCurrent ? "#b45309" : "#3b1b0b";
    const stroke = isSolved ? "#86efac" : isCurrent ? "#fde68a" : "#fef3c7";
    const txt = isSolved ? "✓" : String(label);
    const pulse = isCurrent && !isSolved ? `<circle r="20" fill="#fbbf24" fill-opacity=".5" stroke="none"><animate attributeName="r" values="14;22;14" dur="2s" repeatCount="indefinite"/><animate attributeName="fill-opacity" values=".5;.1;.5" dur="2s" repeatCount="indefinite"/></circle>` : "";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="-18 -18 36 36">
      ${pulse}
      <circle r="10" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
      <text x="0" y="3.5" text-anchor="middle" font-size="${isSolved ? 11 : 9}" fill="${stroke}" font-family="Pirata One,serif" font-weight="bold">${txt}</text>
    </svg>`;
    return L.divIcon({ html: svg, className: "lf-marker-wp", iconSize: [36, 36], iconAnchor: [18, 18] });
  }, []);

  useEffect(() => {
    if (mapRef.current) return;
    const el = document.getElementById(mapId);
    if (!el) return;
    const map = L.map(el, { center: [CENTER.lat, CENTER.lng], zoom: 14, zoomControl: true, attributionControl: true });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd', maxZoom: 19
    }).addTo(map);
    L.rectangle([[BOUNDS.minLat - 0.02, BOUNDS.minLng - 0.02], [BOUNDS.maxLat + 0.02, BOUNDS.maxLng + 0.02]], {
      color: 'transparent', weight: 0, fillColor: '#7aadcc', fillOpacity: .18
    }).addTo(map);
    const zone = L.polygon(PLAY_ZONE.map(p => [p.lat, p.lng]), {
      color: '#5c2c0a', weight: 3.5, opacity: 1, fillColor: '#a8c8e0', fillOpacity: .55, dashArray: '7 4', lineJoin: 'round'
    }).addTo(map);
    zoneRef.current = zone;
    map.fitBounds(zone.getBounds(), { padding: [30, 30] });
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [mapId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    wpsRef.current.forEach(m => m.remove());
    wpsRef.current = [];
    if (routeRef.current) { routeRef.current.remove(); routeRef.current = null; }
    if (capRef.current) { capRef.current.remove(); capRef.current = null; }
    if (!points.length) return;

    const deptSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="38" height="46" viewBox="-19 -32 38 46">
      <circle r="11" fill="#fef3c7" stroke="#92400e" stroke-width="2"/>
      <text x="0" y="4" text-anchor="middle" font-size="12" fill="#b45309" font-family="serif">★</text>
      <text x="0" y="18" text-anchor="middle" font-size="5" fill="#5c2d0f" font-family="Pirata One,serif">Départ</text>
    </svg>`;
    const deptIcon = L.divIcon({ html: deptSvg, className: "lf-marker-boat", iconSize: [38, 46], iconAnchor: [19, 32] });
    const deptMk = L.marker([PLAY_ZONE[0].lat, PLAY_ZONE[0].lng], { icon: deptIcon, zIndexOffset: 500 })
      .bindPopup('<div style="font-family:Pirata One,serif;color:#4a2510;font-size:.85rem;padding:4px">⚓ Ponton de départ</div>')
      .addTo(map);
    wpsRef.current.push(deptMk);

    const fullRoute = [[PLAY_ZONE[0].lat, PLAY_ZONE[0].lng], ...points.map(p => [p.location.lat, p.location.lng])];
    routeRef.current = L.polyline(fullRoute, { color: '#7a3912', weight: 2.5, opacity: .65, dashArray: '8 5' }).addTo(map);
    const greenLeg = L.polyline([[PLAY_ZONE[0].lat, PLAY_ZONE[0].lng], [points[0].location.lat, points[0].location.lng]], {
      color: '#15803d', weight: 2.5, opacity: .8, dashArray: '5 4'
    }).addTo(map);
    wpsRef.current.push(greenLeg);

    points.forEach((pt, idx) => {
      const isSolved = solvedIds.includes(pt.id);
      const isCurrent = idx === activeIdx;
      const icon = makeWpIcon(idx + 1, isCurrent, isSolved);
      const pop = L.popup({ className: 'pirate-popup' }).setContent(`<div style="font-family:Pirata One,serif;color:#4a2510;font-size:.85rem;padding:4px 2px"><div style="font-weight:700;margin-bottom:3px">Balise ${idx + 1}</div><div style="font-family:IM Fell English,serif;font-size:.78rem;color:#593018">${isSolved ? "✓ Validée" : isCurrent ? "⚓ En cours" : "À venir"}</div></div>`);
      const mk = L.marker([pt.location.lat, pt.location.lng], { icon }).bindPopup(pop).addTo(map);
      wpsRef.current.push(mk);
    });

    if (userPos && points[activeIdx] && !solvedIds.includes(points[activeIdx].id)) {
      const tgt = points[activeIdx];
      capRef.current = L.polyline([[userPos.lat, userPos.lng], [tgt.location.lat, tgt.location.lng]], {
        color: '#fbbf24', weight: 2, opacity: .8, dashArray: '5 4'
      }).addTo(map);
    }
  }, [points, activeIdx, solvedIds, userPos, makeWpIcon]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userPos) return;
    wakePts.current.push([userPos.lat, userPos.lng]);
    if (wakePts.current.length > 30) wakePts.current.shift();
    if (wakeRef.current) wakeRef.current.remove();
    if (wakePts.current.length > 1) {
      wakeRef.current = L.polyline(wakePts.current, { color: '#60a5fa', weight: 3, opacity: .55, dashArray: '4 3' }).addTo(map);
    }
    let angleDeg = 0;
    if (points[activeIdx] && !solvedIds.includes(points[activeIdx].id)) {
      angleDeg = bearing(userPos, points[activeIdx].location);
    }
    const icon = makeBoatIcon(angleDeg);
    if (boatRef.current) {
      boatRef.current.setLatLng([userPos.lat, userPos.lng]);
      boatRef.current.setIcon(icon);
    } else {
      boatRef.current = L.marker([userPos.lat, userPos.lng], { icon, zIndexOffset: 1000 }).addTo(map);
    }
  }, [userPos, points, activeIdx, solvedIds, makeBoatIcon]);

  useEffect(() => { wakePts.current = []; }, [activeIdx]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (returning) {
      if (!startMkRef.current) {
        startMkRef.current = L.marker([PLAY_ZONE[0].lat, PLAY_ZONE[0].lng], { icon: makeStartIcon(), zIndexOffset: 900 }).addTo(map);
      }
      if (capRef.current) { capRef.current.remove(); capRef.current = null; }
      if (userPos) {
        capRef.current = L.polyline([[userPos.lat, userPos.lng], [PLAY_ZONE[0].lat, PLAY_ZONE[0].lng]], {
          color: '#fbbf24', weight: 2.5, opacity: .85, dashArray: '6 4'
        }).addTo(map);
      }
    } else {
      if (startMkRef.current) { startMkRef.current.remove(); startMkRef.current = null; }
    }
  }, [returning, userPos, makeStartIcon]);

  useEffect(() => {
    if (!userPos && boatRef.current) { boatRef.current.remove(); boatRef.current = null; }
  }, [userPos]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userPos) return;
    if (!map.getBounds().contains([userPos.lat, userPos.lng])) {
      map.panTo([userPos.lat, userPos.lng], { animate: true, duration: .8 });
    }
  }, [userPos]);

  return React.createElement("div", { style: { position: "relative" } },
    React.createElement("div", { id: mapId, style: { width: "100%", height: 320, borderRadius: 14, overflow: "hidden" } }),
    React.createElement("div", { className: "map-badge" },
      React.createElement("span", { className: `map-badge-dot ${hasGps && !isOutside ? "active" : ""}`, style: { background: isOutside ? "#c0392b" : hasGps ? "#27ae60" : "#e67e22" } }),
      isOutside ? "⚠ Hors zone" : hasGps ? "⚓ GPS actif" : "⏳ Attente GPS"
    ),
    React.createElement("div", { className: "map-legend" },
      React.createElement("div", { className: "map-legend-row" },
        React.createElement("svg", { width: "14", height: "14", viewBox: "-7 -7 14 14" },
          React.createElement("circle", { r: "6", fill: "#fef3c7", stroke: "#92400e", strokeWidth: "1.5" }),
          React.createElement("text", { x: "0", y: "3", textAnchor: "middle", fontSize: "7", fill: "#b45309" }, "★")
        ),
        React.createElement("span", null, "Ponton départ")
      ),
      React.createElement("div", { className: "map-legend-row" },
        React.createElement("svg", { width: "12", height: "12", viewBox: "-6 -6 12 12" },
          React.createElement("circle", { r: "5", fill: "#3b82f6", stroke: "#93c5fd", strokeWidth: "1" })
        ),
        React.createElement("span", null, "Embarcation")
      ),
      React.createElement("div", { className: "map-legend-row" },
        React.createElement("svg", { width: "12", height: "12", viewBox: "-6 -6 12 12" },
          React.createElement("circle", { r: "5", fill: "#b45309", stroke: "#fde68a", strokeWidth: "1" })
        ),
        React.createElement("span", null, "Balise cible")
      ),
      React.createElement("div", { className: "map-legend-row" },
        React.createElement("svg", { width: "12", height: "12", viewBox: "-6 -6 12 12" },
          React.createElement("circle", { r: "5", fill: "#14532d", stroke: "#86efac", strokeWidth: "1" })
        ),
        React.createElement("span", null, "Validée")
      ),
      React.createElement("div", { className: "map-legend-row" },
        React.createElement("svg", { width: "14", height: "4", viewBox: "0 0 14 4" },
          React.createElement("line", { x1: "0", y1: "2", x2: "14", y2: "2", stroke: "#15803d", strokeWidth: "2", strokeDasharray: "4 2" })
        ),
        React.createElement("span", null, "Départ → balise 1")
      )
    ),
    isOutside && React.createElement("div", { className: "map-outside-warn" }, "☠ Hors zone de jeu")
  );
}

/* ================================================================
   APP PRINCIPALE
   ================================================================ */
function App() {
  const [stage, setStage] = useState("intro");
  const [level, setLevel] = useState(null);
  const [points, setPoints] = useState([]);
  const [aIdx, setAIdx] = useState(0);
  const [userPos, setUserPos] = useState(null);
  const [dist, setDist] = useState(null);
  const [geoErr, setGeoErr] = useState(null);
  const [oPerm, setOPerm] = useState("unknown");
  const [heading, setHeading] = useState(0);
  const [unlocked, setUnlocked] = useState([]);
  const [solved, setSolved] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [objective, setObjective] = useState(null);
  const [guess, setGuess] = useState("");
  const [guessFb, setGuessFb] = useState(null);
  const [opened, setOpened] = useState(false);
  const [mood, setMood] = useState("idle");
  const [ans, setAns] = useState("");
  const [ansFb, setAnsFb] = useState(null);
  const [tStart, setTStart] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [records, setRecords] = useState(EMPTY_REC);
  const [mapOpen, setMapOpen] = useState(false);
  const [returning, setReturning] = useState(false);
  const [distReturn, setDistReturn] = useState(null);
  const RETURN_RADIUS = 80;
  const [rentalMinutes, setRentalMinutes] = useState(60);
  const geoRef = useRef(null);
  const gpsHeadingRef = useRef(null);
  const gpsHeadingTimer = useRef(null);
  const lCfg = level ? LEVELS[level] : null;
  const curPt = stage === "playing" ? points[aIdx] : undefined;
  const pct = points.length ? Math.round(solved.length / points.length * 100) : 0;

  const rentalMs = rentalMinutes * 60 * 1000;
  const remainingMs = Math.max(0, rentalMs - elapsed);
  const countdownPct = Math.max(0, Math.min(100, remainingMs / rentalMs * 100));
  const isWarning = remainingMs <= 15 * 60 * 1000 && remainingMs > 5 * 60 * 1000;
  const isDanger = remainingMs <= 5 * 60 * 1000;
  const countdownColor = isDanger ? "#c0392b" : isWarning ? "#d97706" : "#1d5c3b";

  useEffect(() => {
    try {
      const s = localStorage.getItem(SK);
      if (s) setRecords({ ...EMPTY_REC, ...JSON.parse(s) });
    } catch {}
  }, []);
  const saveRec = useCallback((lv, t) => {
    setRecords(p => {
      const c = p[lv];
      if (c !== null && c <= t) return p;
      const n = { ...p, [lv]: t };
      try { localStorage.setItem(SK, JSON.stringify(n)); } catch {}
      return n;
    });
  }, []);

  const reqOrient = useCallback(async () => {
    try {
      const D = window.DeviceOrientationEvent;
      if (!D) { setOPerm("denied"); return; }
      if (typeof D.requestPermission === "function") {
        const r = await D.requestPermission();
        setOPerm(r === "granted" ? "granted" : "denied");
      } else setOPerm("granted");
    } catch { setOPerm("denied"); }
  }, []);

  useEffect(() => {
    if (oPerm !== "granted") return;
    let ssin = 0, scos = 1, hasAbs = false;
    const ALPHA = 0.12;
    const process = (raw) => {
      const rad = raw * Math.PI / 180;
      ssin = ssin * (1 - ALPHA) + Math.sin(rad) * ALPHA;
      scos = scos * (1 - ALPHA) + Math.cos(rad) * ALPHA;
      const smooth = (Math.atan2(ssin, scos) * 180 / Math.PI + 360) % 360;
      setHeading(h => {
        if (gpsHeadingRef.current !== null) return h;
        return Math.round(smooth * 10) / 10;
      });
    };
    const hAbs = e => {
      hasAbs = true;
      if (typeof e.alpha !== "number") return;
      const screenAngle = window.screen?.orientation?.angle ?? 0;
      const raw = (360 - e.alpha + screenAngle) % 360;
      process(raw);
    };
    const hRel = e => {
      if (hasAbs) return;
      if (typeof e.webkitCompassHeading === "number" && e.webkitCompassHeading >= 0) {
        process(e.webkitCompassHeading);
        return;
      }
      if (typeof e.alpha !== "number") return;
      const screenAngle = window.screen?.orientation?.angle ?? 0;
      const raw = (360 - e.alpha + screenAngle) % 360;
      process(raw);
    };
    window.addEventListener("deviceorientationabsolute", hAbs, true);
    window.addEventListener("deviceorientation", hRel, true);
    return () => {
      window.removeEventListener("deviceorientationabsolute", hAbs, true);
      window.removeEventListener("deviceorientation", hRel, true);
    };
  }, [oPerm]);

  useEffect(() => {
    if (stage !== "playing") {
      if (geoRef.current !== null && "geolocation" in navigator) {
        navigator.geolocation.clearWatch(geoRef.current);
        geoRef.current = null;
      }
      return;
    }
    if (!("geolocation" in navigator)) { setGeoErr("GPS non supporté."); return; }
    geoRef.current = navigator.geolocation.watchPosition(p => {
      setGeoErr(null);
      setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy ?? 0 });
      if (typeof p.coords.heading === "number" && !isNaN(p.coords.heading) && p.coords.speed > 0.3) {
        gpsHeadingRef.current = p.coords.heading;
        setHeading(p.coords.heading);
        if (gpsHeadingTimer.current) clearTimeout(gpsHeadingTimer.current);
        gpsHeadingTimer.current = setTimeout(() => { gpsHeadingRef.current = null; }, 3000);
      }
    }, e => setGeoErr(e.message || "Accès GPS refusé."), { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 });
    return () => {
      if (geoRef.current !== null) navigator.geolocation.clearWatch(geoRef.current);
    };
  }, [stage]);

  useEffect(() => {
    if (!returning || distReturn === null) return;
    if (distReturn <= RETURN_RADIUS) {
      const tot = Date.now() - (tStart ?? Date.now());
      setElapsed(tot);
      setReturning(false);
      setStage("vault");
    }
  }, [returning, distReturn, tStart]);

  useEffect(() => {
    if (stage !== "playing" || !tStart) return;
    const id = setInterval(() => setElapsed(Date.now() - tStart), 1000);
    return () => clearInterval(id);
  }, [stage, tStart]);

  useEffect(() => {
    if (!userPos || !curPt) { setDist(null); return; }
    setDist(havDist(userPos, curPt.location));
  }, [userPos, curPt]);

  const activePointIdRef = useRef(null);
  useEffect(() => { if (curPt) activePointIdRef.current = curPt.id; }, [curPt]);

  useEffect(() => {
    if (!curPt || dist === null) return;
    if (curPt.id !== activePointIdRef.current) return;
    if (dist <= curPt.radius) {
      if (curPt.isPonton) {
        const tot = Date.now() - (tStart ?? Date.now());
        setElapsed(tot);
        setStage("vault");
      } else {
        setUnlocked(p => p.includes(curPt.id) ? p : [...p, curPt.id]);
      }
    }
  }, [curPt, dist, tStart]);

  useEffect(() => {
    if (!returning || !userPos) { setDistReturn(null); return; }
    setDistReturn(havDist(userPos, PLAY_ZONE[0]));
  }, [returning, userPos]);

  const brgTarget = useMemo(() => userPos && curPt ? curPt.location : null, [userPos, curPt]);
  const brg = useMemo(() => !userPos || !brgTarget ? 0 : bearing(userPos, brgTarget), [userPos, brgTarget]);
  const rot = useMemo(() => { const h = oPerm === "granted" ? heading : 0; return (brg - h + 360) % 360; }, [brg, heading, oPerm]);

  const routeSummary = useMemo(() => points.map((p, i) => ({ point: p, status: solved.includes(p.id) ? "done" : stage === "playing" && i === aIdx ? "current" : stage === "briefing" && i === 0 ? "current" : "upcoming" })), [points, solved, aIdx, stage]);

  const startGame = (lv, md = "field") => {
    const cfg = LEVELS[lv];
    const pool = FINAL_WORDS[cfg.points];
    const base = pool[Math.floor(Math.random() * pool.length)];
    const obj = { ...base, hints: shuffle(base.hints) };
    const toks = (base.tokens && base.tokens.length === cfg.points ? base.tokens : splitWord(obj.word.toUpperCase(), cfg.points)).map(t => t.toUpperCase());
    const puzz = shuffle(RIDDLES).slice(0, cfg.points);
    const gen = toks.map((tok, i) => ({ id: i + 1, location: randInPoly(PLAY_ZONE), radius: Math.round(rnd(20, 40)), riddle: puzz[i] ?? RIDDLES[i % RIDDLES.length], reward: tok }));
    const shuffled = shuffle(gen).map((p, i) => ({ ...p, id: i + 1 }));
    const pontonBalise = { id: shuffled.length + 1, location: PLAY_ZONE[0], radius: 60, riddle: null, reward: null, isPonton: true };
    const routed = [...shuffled, pontonBalise];
    setLevel(lv);
    setPoints(routed);
    setObjective(obj);
    setStage("briefing");
    setMapOpen(true);
    setAIdx(0);
    setUserPos(null);
    setDist(null);
    setUnlocked([]);
    setSolved([]);
    setTokens([]);
    setAns("");
    setAnsFb(null);
    setGuess("");
    setGuessFb(null);
    setOpened(false);
    setMood("idle");
    setGeoErr(null);
    setTStart(null);
    setElapsed(0);
    setOPerm("unknown");
    setHeading(0);
    setReturning(false);
    setDistReturn(null);
  };

  const beginMission = () => {
    setStage("playing");
    setMapOpen(false);
    setTStart(Date.now());
    setElapsed(0);
  };

  const handleRiddle = () => {
    if (!curPt || !ans.trim()) return;
    if (!matchAns(ans, curPt.riddle.answers)) { setAnsFb("Mauvaise réponse, réessaie !"); return; }
    setSolved(p => [...p, curPt.id]);
    setTokens(p => [...p, curPt.reward]);
    setAnsFb("✅ Bonne réponse ! Tu as gagné un fragment du mot secret. 🏴‍☠️");
    setTimeout(() => {
      setAnsFb(null);
      setAns("");
      setUnlocked([]);
      setDist(null);
      setAIdx(p => Math.min(p + 1, points.length - 1));
    }, 1700);
  };

  const handleFinal = () => {
    if (!objective || !guess.trim()) return;
    if (matchAns(guess, [objective.word])) {
      setGuessFb(`${CAPTAIN} ouvre son coffre et te remercie !`);
      setOpened(true);
      setMood("success");
      if (level && tStart) saveRec(level, elapsed || Date.now() - tStart);
    } else {
      setOpened(false);
      setMood("failure");
      setGuessFb(`${CAPTAIN} secoue la tête : ce mot ne correspond pas.`);
    }
  };

  const resetGame = () => {
    if (geoRef.current !== null && "geolocation" in navigator) navigator.geolocation.clearWatch(geoRef.current);
    setStage("intro");
    setMapOpen(false);
    setLevel(null);
    setPoints([]);
    setAIdx(0);
    setUserPos(null);
    setDist(null);
    setGeoErr(null);
    setUnlocked([]);
    setSolved([]);
    setTokens([]);
    setObjective(null);
    setGuess("");
    setGuessFb(null);
    setOpened(false);
    setMood("idle");
    setTStart(null);
    setElapsed(0);
    setAns("");
    setAnsFb(null);
    setReturning(false);
    setDistReturn(null);
  };

  const isOutside = !!userPos && !inPoly(userPos, PLAY_ZONE);

  // Styles (simplifiés ici, reprenez les vôtres dans le rendu final)
  const S = {
    page: { position: "relative", minHeight: "100vh", overflow: "hidden" },
    wrap: { position: "relative", zIndex: 10, maxWidth: 560, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem", padding: "1.5rem 1rem" },
    // ... (tous vos styles existants)
  };

  // JSX rendu (très long, je donne la structure complète dans l'extrait final)
  return React.createElement("div", { style: S.page },
    React.createElement("div", { style: S.wrap },
      // ... contenu (identique à votre index.html)
    )
  );
}

// Rend l'application
ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));