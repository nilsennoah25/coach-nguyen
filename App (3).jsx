import { useState, useEffect, useRef } from "react";

// ============================================================
// NORWEGIAN CHAR CONSTANTS
// ============================================================
const AE = "\u00e6"; const OE = "\u00f8"; const AA = "\u00e5";
const AEU = "\u00c6"; const OEU = "\u00d8"; const AAU = "\u00c5";

// ============================================================
// FIREBASE STORAGE
// ============================================================
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBtxO-FJ3cf3ZrPc6kA-eXq7IgaegNSZPU",
  authDomain: "coach-nguyen.firebaseapp.com",
  projectId: "coach-nguyen",
  storageBucket: "coach-nguyen.firebasestorage.app",
  messagingSenderId: "275021795217",
  appId: "1:275021795217:web:edd9640c6599afa6771430"
};

// Load Firebase dynamically
let _db = null;
let _firebaseReady = false;
const _firebaseCallbacks = [];
const initFirebase = () => {
  if (_firebaseReady) return;
  const s1 = document.createElement("script");
  s1.src = "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js";
  s1.onload = () => {
    const s2 = document.createElement("script");
    s2.src = "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js";
    s2.onload = () => {
      try {
        if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
        _db = firebase.firestore();
        _firebaseReady = true;
        _firebaseCallbacks.forEach(fn => fn(_db));
        _firebaseCallbacks.length = 0;
      } catch(e) { console.error("Firebase init error:", e); }
    };
    document.head.appendChild(s2);
  };
  document.head.appendChild(s1);
};
if (typeof window !== "undefined") initFirebase();

const getDb = () => new Promise((resolve, reject) => {
  if (_firebaseReady && _db) return resolve(_db);
  _firebaseCallbacks.push(resolve);
  setTimeout(() => reject(new Error("Firebase timeout")), 10000);
});

const SK = "main";
const sv = async d => {
  try {
    const db = await getDb();
    await db.collection("coachapp").doc(SK).set({ data: JSON.stringify(d) });
  } catch(e) {
    console.error("Save error:", e);
    try { localStorage.setItem("coachapp_backup", JSON.stringify(d)); } catch(e2) {}
  }
};
const lv = async () => {
  try {
    const db = await getDb();
    const doc = await db.collection("coachapp").doc(SK).get();
    if (doc.exists) return JSON.parse(doc.data().data);
    // Try localStorage fallback
    const lb = localStorage.getItem("coachapp_backup");
    return lb ? JSON.parse(lb) : null;
  } catch(e) {
    console.error("Load error:", e);
    try { const lb = localStorage.getItem("coachapp_backup"); return lb ? JSON.parse(lb) : null; } catch(e2) { return null; }
  }
};

// ============================================================
// UTILITIES
// ============================================================
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const todayStr = () => new Date().toISOString().split("T")[0];
const nowStr = () => new Date().toLocaleString("no-NO", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" });
const daysSince = d => d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : null;
const weekStart = () => { const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.toISOString().split("T")[0]; };
const PIN = "3364";

// ============================================================
// DESIGN SYSTEM (supports light/dark)
// ============================================================
const makeG = dark => dark ? {
  bg:"#0a0a0a", bg2:"#101010", bg3:"#161616", card:"#121212",
  border:"#1e1e1e", border2:"#252525",
  lime:"#c8f135", blue:"#7eb8ff", orange:"#ff9f7e", green:"#a8e87e",
  purple:"#c4a3ff", red:"#ff5c5c", text:"#f0f0f0", muted:"#666", dim:"#333",
  inputBg:"#0e0e0e", shadow:"rgba(0,0,0,0.4)",
} : {
  bg:"#f4f4f0", bg2:"#ebebeb", bg3:"#e0e0d8", card:"#ffffff",
  border:"#d8d8d0", border2:"#c8c8c0",
  lime:"#5a8a00", blue:"#1a5ca8", orange:"#c05000", green:"#2a6a20",
  purple:"#5030a0", red:"#c02020", text:"#111111", muted:"#777", dim:"#aaa",
  inputBg:"#ffffff", shadow:"rgba(0,0,0,0.12)",
};

let G = makeG(true);

const makeCSS = dark => `
*{box-sizing:border-box;margin:0;padding:0}
body{background:${dark?"#0a0a0a":"#f4f4f0"};color:${dark?"#f0f0f0":"#111111"};font-family:'DM Sans',sans-serif;transition:background .2s,color .2s}
input,textarea,select{background:${dark?"#0e0e0e":"#fff"};border:1px solid ${dark?"#252525":"#d0d0c8"};border-radius:8px;color:${dark?"#f0f0f0":"#111"};font-family:'DM Sans',sans-serif;font-size:13px;padding:7px 11px;outline:none;transition:border-color .15s;width:100%}
input:focus,textarea:focus,select:focus{border-color:${dark?"#444":"#888"}}
input[type=range]{padding:0;background:transparent;border:none;cursor:pointer;accent-color:${dark?"#c8f135":"#5a8a00"}}
input[type=checkbox]{width:auto;cursor:pointer;accent-color:${dark?"#c8f135":"#5a8a00"}}
button{cursor:pointer;font-family:'DM Sans',sans-serif;border:none;transition:all .15s}
.card{background:${dark?"#121212":"#ffffff"};border:1px solid ${dark?"#1e1e1e":"#d8d8d0"};border-radius:13px;padding:16px;box-shadow:${dark?"none":"0 1px 4px rgba(0,0,0,0.07)"}}
.inset{background:${dark?"#101010":"#f0f0ec"};border:1px solid ${dark?"#1e1e1e":"#d8d8d0"};border-radius:10px;padding:12px 14px}
.btn{border:none;border-radius:8px;padding:8px 16px;font-size:13px;font-weight:600;display:inline-flex;align-items:center;gap:5px;cursor:pointer}
.btn-lime{background:${dark?"#c8f135":"#5a8a00"};color:${dark?"#0a0a0a":"#ffffff"}}.btn-lime:hover{opacity:.88}
.btn-ghost{background:transparent;border:1px solid ${dark?"#252525":"#c8c8c0"};color:${dark?"#666":"#555"}}.btn-ghost:hover{border-color:${dark?"#3a3a3a":"#888"};color:${dark?"#ccc":"#111"}}
.btn-red{background:#ff3c3c22;border:1px solid #ff3c3c44;color:#ff5c5c}.btn-red:hover{background:#ff3c3c33}
.btn-sm{padding:5px 11px;font-size:12px;border-radius:7px;font-weight:600;border:none;display:inline-flex;align-items:center;gap:4px;cursor:pointer}
.btn-icon{background:transparent;border:1px solid ${dark?"#252525":"#d0d0c8"};padding:4px 10px;color:${dark?"#888":"#666"};border-radius:6px;font-size:12px;cursor:pointer}.btn-icon:hover{background:${dark?"#1a1a1a":"#e8e8e0"};color:${dark?"#ccc":"#111"};border-color:${dark?"#3a3a3a":"#888"}}
.tab-btn{background:none;border:none;border-bottom:2px solid transparent;color:${dark?"#444":"#999"};font-size:13px;font-weight:500;padding:10px 15px;cursor:pointer;white-space:nowrap;transition:all .15s}
.tab-btn.active{border-bottom-color:${dark?"#c8f135":"#5a8a00"};color:${dark?"#c8f135":"#5a8a00"};font-weight:700}
.chip{background:${dark?"#161616":"#e8e8e0"};border:1px solid ${dark?"#252525":"#d0d0c8"};border-radius:20px;color:${dark?"#666":"#666"};font-size:12px;font-weight:500;padding:4px 12px;cursor:pointer;white-space:nowrap}
.chip:hover{border-color:${dark?"#333":"#888"};color:${dark?"#bbb":"#111"}}
.chip.active{background:${dark?"#c8f13520":"#5a8a0020"};border-color:${dark?"#c8f13555":"#5a8a0055"};color:${dark?"#c8f135":"#5a8a00"}}
.lbl{color:${dark?"#444":"#aaa"};font-size:10px;font-weight:700;letter-spacing:.9px;text-transform:uppercase}
.row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.col{display:flex;flex-direction:column;gap:5px}
.bottom-nav{display:none}
@media(max-width:640px){
  .tab-bar-top{display:none!important}
  .bottom-nav{display:flex;position:fixed;bottom:0;left:0;right:0;background:${dark?"#0e0e0e":"#fafafa"};border-top:1px solid ${dark?"#1e1e1e":"#e0e0d8"};z-index:200;padding-bottom:env(safe-area-inset-bottom,8px)}
  .bnb{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px 2px 6px;gap:2px;font-size:9px;font-weight:600;letter-spacing:.3px;color:${dark?"#555":"#aaa"};background:none;border:none;cursor:pointer;position:relative;min-height:52px}
  .bnb.active{color:${dark?"#c8f135":"#5a8a00"}}
  .bnb .ni{font-size:19px;line-height:1}
  .page-pad{padding-bottom:80px!important}
  .card{border-radius:10px!important;padding:13px!important}
  input,textarea,select{font-size:16px!important}
  .trainer-chip-bar{overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:4px;flex-wrap:nowrap!important}
  .trainer-tabs{overflow-x:auto;-webkit-overflow-scrolling:touch;white-space:nowrap}
}
`;

// ============================================================
// FOOD DATABASE
// ============================================================
const FOOD_DB = [
  { name:"Kyllingbryst", cat:"Kjøtt", kcal:110, protein:23, carbs:0, fat:1.2 },
  { name:"Kyllinglår u/skinn", cat:"Kjøtt", kcal:150, protein:20, carbs:0, fat:8 },
  { name:"Kalkun bryst", cat:"Kjøtt", kcal:104, protein:22, carbs:0, fat:1.5 },
  { name:"Kjøttdeig 5%", cat:"Kjøtt", kcal:121, protein:21, carbs:0, fat:5 },
  { name:"Kjøttdeig 15%", cat:"Kjøtt", kcal:193, protein:18, carbs:0, fat:14 },
  { name:"Kjøttdeig 20%", cat:"Kjøtt", kcal:243, protein:17, carbs:0, fat:20 },
  { name:"Biff indrefilet", cat:"Kjøtt", kcal:158, protein:22, carbs:0, fat:8 },
  { name:"Svinekjøtt filet", cat:"Kjøtt", kcal:121, protein:22, carbs:0, fat:3.5 },
  { name:"Bacon stekt", cat:"Kjøtt", kcal:541, protein:37, carbs:1.4, fat:43 },
  { name:"Skinke kokt", cat:"Kjøtt", kcal:107, protein:18, carbs:1, fat:3.5 },
  { name:"Leverpostei", cat:"Kjøtt", kcal:260, protein:11, carbs:5, fat:22 },
  { name:"Laks fersk", cat:"Fisk", kcal:208, protein:20, carbs:0, fat:14 },
  { name:"Laks røkt", cat:"Fisk", kcal:175, protein:25, carbs:0, fat:9 },
  { name:"Torsk fersk", cat:"Fisk", kcal:82, protein:18, carbs:0, fat:0.7 },
  { name:"Sei fersk", cat:"Fisk", kcal:80, protein:18, carbs:0, fat:0.8 },
  { name:"Makrell fersk", cat:"Fisk", kcal:205, protein:19, carbs:0, fat:14 },
  { name:"Makrell i tomat", cat:"Fisk", kcal:136, protein:15, carbs:3, fat:7 },
  { name:"Tunfisk i vann", cat:"Fisk", kcal:103, protein:24, carbs:0, fat:0.9 },
  { name:"Tunfisk i olje", cat:"Fisk", kcal:198, protein:25, carbs:0, fat:11 },
  { name:"Reker", cat:"Fisk", kcal:99, protein:21, carbs:0, fat:1.5 },
  { name:"Egg M 57g", cat:"Egg", kcal:81, protein:7, carbs:0.4, fat:5.7, perPiece:true, gPerUnit:57 },
  { name:"Egg L 63g", cat:"Egg", kcal:90, protein:7.8, carbs:0.45, fat:6.3, perPiece:true, gPerUnit:63 },
  { name:"Eggehvite", cat:"Egg", kcal:52, protein:11, carbs:0.7, fat:0.2 },
  { name:"Helmelk 3.5%", cat:"Meieri", kcal:61, protein:3.2, carbs:4.8, fat:3.6 },
  { name:"Lettmelk 1.5%", cat:"Meieri", kcal:44, protein:3.4, carbs:4.9, fat:1.5 },
  { name:"Cottage cheese 4%", cat:"Meieri", kcal:97, protein:12, carbs:3.5, fat:4 },
  { name:"Gresk yoghurt 0%", cat:"Meieri", kcal:59, protein:10, carbs:3.6, fat:0.4 },
  { name:"Gresk yoghurt 10%", cat:"Meieri", kcal:133, protein:6, carbs:4, fat:10 },
  { name:"Skyr naturell", cat:"Meieri", kcal:63, protein:11, carbs:4, fat:0.2 },
  { name:"Kvarg 0.2%", cat:"Meieri", kcal:67, protein:12, carbs:4, fat:0.2 },
  { name:"Norvegia ost", cat:"Meieri", kcal:326, protein:27, carbs:0, fat:24 },
  { name:"Jarlsberg ost", cat:"Meieri", kcal:356, protein:27, carbs:0, fat:27 },
  { name:"Brunost", cat:"Meieri", kcal:466, protein:9, carbs:43, fat:29 },
  { name:"Smør", cat:"Meieri", kcal:717, protein:0.9, carbs:0.1, fat:81 },
  { name:"Proteinpulver myse", cat:"Protein", kcal:380, protein:75, carbs:8, fat:4 },
  { name:"Proteinpulver kasein", cat:"Protein", kcal:370, protein:78, carbs:5, fat:2 },
  { name:"Proteinbar Quest 60g", cat:"Protein", kcal:200, protein:21, carbs:22, fat:7, perPiece:true, gPerUnit:60 },
  { name:"Proteinbar Barebells 55g", cat:"Protein", kcal:196, protein:20, carbs:20, fat:6, perPiece:true, gPerUnit:55 },
  { name:"Havregryn fin", cat:"Korn", kcal:366, protein:13, carbs:58, fat:7 },
  { name:"Havregryn grov", cat:"Korn", kcal:362, protein:12, carbs:57, fat:7 },
  { name:"Ris hvit r\u00e5", cat:"Korn", kcal:358, protein:6.5, carbs:79, fat:0.6 },
  { name:"Ris hvit rå", cat:"Korn", kcal:357, protein:7, carbs:78, fat:0.5 },
    { name:"Pasta rå", cat:"Korn", kcal:352, protein:12, carbs:70, fat:1.5 },
  { name:"Quinoa r\u00e5", cat:"Korn", kcal:368, protein:14, carbs:64, fat:6 },
  { name:"Potet r\u00e5", cat:"Korn", kcal:69, protein:1.7, carbs:15, fat:0.1 },
  { name:"Søtpotet kokt", cat:"Korn", kcal:86, protein:1.6, carbs:20, fat:0.1 },
  { name:"Grovt brød skive 35g", cat:"Brød", kcal:85, protein:3.2, carbs:15, fat:1.2, perPiece:true, gPerUnit:35 },
  { name:"Rundstykke 70g", cat:"Brød", kcal:191, protein:6.3, carbs:37, fat:1.9, perPiece:true, gPerUnit:70 },
  { name:"Tortilla 40g", cat:"Brød", kcal:120, protein:3.2, carbs:20.8, fat:2.4, perPiece:true, gPerUnit:40 },
  { name:"Knekkebrød 12g", cat:"Brød", kcal:41, protein:1.2, carbs:7.8, fat:0.36, perPiece:true, gPerUnit:12 },
  { name:"Banan liten 100g", cat:"Frukt", kcal:89, protein:1.1, carbs:23, fat:0.3, perPiece:true, gPerUnit:100 },
  { name:"Banan stor 130g", cat:"Frukt", kcal:116, protein:1.4, carbs:30, fat:0.4, perPiece:true, gPerUnit:130 },
  { name:"Eple 150g", cat:"Frukt", kcal:78, protein:0.5, carbs:21, fat:0.3, perPiece:true, gPerUnit:150 },
  { name:"Jordbær", cat:"Frukt", kcal:32, protein:0.7, carbs:7.7, fat:0.3 },
  { name:"Blåbær", cat:"Frukt", kcal:57, protein:0.7, carbs:14, fat:0.3 },
  { name:"Brokkoli", cat:"Grønnsaker", kcal:34, protein:2.8, carbs:7, fat:0.4 },
  { name:"Blomkål", cat:"Grønnsaker", kcal:25, protein:1.9, carbs:5, fat:0.3 },
  { name:"Spinat", cat:"Grønnsaker", kcal:23, protein:2.9, carbs:3.6, fat:0.4 },
  { name:"Tomat", cat:"Grønnsaker", kcal:18, protein:0.9, carbs:3.9, fat:0.2 },
  { name:"Agurk", cat:"Grønnsaker", kcal:15, protein:0.7, carbs:3.6, fat:0.1 },
  { name:"Paprika rød", cat:"Grønnsaker", kcal:31, protein:1, carbs:6, fat:0.3 },
  { name:"Gulrot", cat:"Grønnsaker", kcal:41, protein:0.9, carbs:10, fat:0.2 },
  { name:"Isbergsalat", cat:"Grønnsaker", kcal:14, protein:0.9, carbs:2.9, fat:0.1 },
  { name:"Mandler", cat:"Nøtter", kcal:579, protein:21, carbs:22, fat:50 },
  { name:"Cashew", cat:"Nøtter", kcal:553, protein:18, carbs:30, fat:44 },
  { name:"Peanøtter", cat:"Nøtter", kcal:567, protein:26, carbs:16, fat:49 },
  { name:"Peanøttsmør", cat:"Nøtter", kcal:588, protein:25, carbs:20, fat:50 },
  { name:"Avokado", cat:"Nøtter", kcal:160, protein:2, carbs:9, fat:15 },
  { name:"Olivenolje", cat:"Nøtter", kcal:884, protein:0, carbs:0, fat:100 },
  { name:"Honning", cat:"Annet", kcal:304, protein:0.3, carbs:82, fat:0 },
  { name:"Hummus", cat:"Annet", kcal:166, protein:8, carbs:14, fat:10 },
  { name:"Sjokolade mørk 70%", cat:"Snacks", kcal:598, protein:8, carbs:46, fat:43 },
];

const DEFAULT_MEAL_TYPES = [
  { id:"frokost", label:"Frokost",   pct:20 },
  { id:"lunsj",   label:"Lunsj",     pct:25 },
  { id:"snack",   label:"Snack",     pct:10 },
  { id:"middag",  label:"Middag",    pct:35 },
  { id:"kvelds",  label:"Kveldsmat", pct:10 },
];

const calcMacros = items => items.reduce((a, i) => ({
  kcal:    a.kcal    + Math.round((i.kcalPer100    || 0) * (i.perPiece ? (i.units || 1) : (i.grams || 0) / 100)),
  protein: a.protein + Math.round((i.proteinPer100 || 0) * (i.perPiece ? (i.units || 1) : (i.grams || 0) / 100)),
  carbs:   a.carbs   + Math.round((i.carbsPer100   || 0) * (i.perPiece ? (i.units || 1) : (i.grams || 0) / 100)),
  fat:     a.fat     + Math.round((i.fatPer100     || 0) * (i.perPiece ? (i.units || 1) : (i.grams || 0) / 100)),
}), { kcal:0, protein:0, carbs:0, fat:0 });

const mkItem = (name, grams) => {
  const f = FOOD_DB.find(x => x.name === name) || { kcal:0, protein:0, carbs:0, fat:0 };
  return { id:uid(), name, grams, kcalPer100:f.kcal, proteinPer100:f.protein, carbsPer100:f.carbs, fatPer100:f.fat, perPiece:false };
};
const mkMeal = (name, time, mt, pairs, imgUrl) => {
  const si = pairs.map(([n,g]) => mkItem(n,g));
  return { id:uid(), name, time, mealType:mt, structuredItems:si, macros:calcMacros(si), imgUrl: imgUrl||"" };
};

const buildDefaultTargets = (types, totalCal) => {
  const t = {};
  types.forEach(mt => { t[mt.id] = Math.round(totalCal * (mt.pct || 20) / 100); });
  return t;
};

const makeDefaultPlan = () => {
  const types = DEFAULT_MEAL_TYPES;
  const cal = 2800;
  return {
    calories: cal, protein: 175, carbs: 320, fat: 85,
    macroRatio: { protein: 30, carbs: 45, fat: 25 },
    mealTypes: types,
    mealCalTargets: buildDefaultTargets(types, cal),
    mealOptions: {
      frokost: [
        mkMeal("Havregryn m/egg", "07:00", "frokost", [["Havregryn fin",80],["Egg L 63g",63],["Blåbær",60]]),
        mkMeal("Yoghurt bowl", "07:00", "frokost", [["Gresk yoghurt 0%",300],["Blåbær",80],["Havregryn fin",40]]),
      ],
      lunsj: [
        mkMeal("Kylling og ris", "12:00", "lunsj", [["Kyllingbryst",180],["Ris hvit r\u00e5",200],["Brokkoli",120]]),
        mkMeal("Tunfisksalat", "12:00", "lunsj", [["Tunfisk i vann",150],["Isbergsalat",80],["Tomat",80]]),
      ],
      snack: [
        mkMeal("Proteinshake", "15:30", "snack", [["Proteinpulver myse",35],["Lettmelk 1.5%",300]]),
      ],
      middag: [
        mkMeal("Laks og søtpotet", "18:30", "middag", [["Laks fersk",200],["Søtpotet kokt",200],["Brokkoli",150]]),
        mkMeal("Kjøttdeig og pasta", "18:30", "middag", [["Kjøttdeig 5%",150],["Pasta r\u00e5",200],["Tomat",100]]),
      ],
      kvelds: [
        mkMeal("Kvargskål", "21:00", "kvelds", [["Kvarg 0.2%",200],["Mandler",25],["Blåbær",60]]),
      ],
    },
    activeSelections: {},
  };
};

const defaultClient = () => ({
  id: uid(), name:"Eksempel Klient", username:"klient1", password:"trening123",
  age:25, weight:80, goal:"Muskelvekst",
  goals: { weightGoalKg: 75, strengthGoals: [{ exercise:"Benkpress", targetKg:100 }], customGoals:[] },
  workoutPlan: {
    days: [
      { id:uid(), day:"Mandag", focus:"Bryst og Triceps", exercises:[
        { id:uid(), name:"Benkpress", sets:4, reps:"6-8", weight:"80kg", rest:"2min", note:"Kontroller ned" },
        { id:uid(), name:"Incline Hantel", sets:3, reps:"10-12", weight:"28kg", rest:"90s", note:"" },
        { id:uid(), name:"Triceps Pushdown", sets:3, reps:"12-15", weight:"25kg", rest:"60s", note:"" },
      ]},
      { id:uid(), day:"Tirsdag", focus:"Rygg og Biceps", exercises:[
        { id:uid(), name:"Markløft", sets:4, reps:"5", weight:"100kg", rest:"3min", note:"Nøytral rygg" },
        { id:uid(), name:"Nedtrekk", sets:4, reps:"8-10", weight:"60kg", rest:"2min", note:"" },
        { id:uid(), name:"Bicep Curl", sets:3, reps:"10-12", weight:"14kg", rest:"60s", note:"" },
      ]},
      { id:uid(), day:"Torsdag", focus:"Bein og Skuldre", exercises:[
        { id:uid(), name:"Knebøy", sets:4, reps:"6-8", weight:"90kg", rest:"3min", note:"Under parallell" },
        { id:uid(), name:"Leg Press", sets:3, reps:"10-12", weight:"140kg", rest:"2min", note:"" },
        { id:uid(), name:"Skulderpress", sets:4, reps:"8-10", weight:"22kg", rest:"90s", note:"" },
      ]},
    ],
  },
  mealPlan: makeDefaultPlan(),
  progressLog:[], sessions:[], bodyWeight:[],
  messages:[{ id:uid(), from:"trainer", text:"Hei! Planen din er klar. Kjør på!", time:nowStr(), read:false }],
});

// ============================================================
// REST TIMER HOOK
// ============================================================
function useRestTimer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [target, setTarget] = useState(90);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const start = (t) => { setTarget(t || target); setSeconds(0); setRunning(true); };
  const stop  = () => { setRunning(false); setSeconds(0); };
  const pct   = Math.min(100, Math.round(seconds / target * 100));
  const done  = seconds >= target;
  const fmt   = s => { const m = Math.floor(s/60); const sec = s%60; return m+":"+(sec<10?"0":"")+sec; };

  return { seconds, running, target, pct, done, start, stop, fmt };
}

// ============================================================
// APP ROOT
// ============================================================
export default function App() {
  const [clients, setClients] = useState([]);
  const [customFoods, setCustomFoods] = useState([]);
  const [brand, setBrand] = useState({
    appName: "COACH NGUYEN",
    tagline: "Personlig trenings- og kostholdsapp",
    accentColor: "#c8f135",
    logoUrl: "",
    latestAppUrl: "",
    trainerPin: "3364",
  });
  const [view, setView] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [ready, setReady] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const saveTimer = useRef(null);

  G = makeG(darkMode);

  useEffect(() => {
    // PWA manifest injection
    try {
      const manifest = { name:"Coach Nguyen", short_name:"CoachNguyen", start_url:window.location.href, display:"standalone",
        background_color:"#0a0a0a", theme_color:"#c8f135", description:"Din personlige trenings- og kostholdsapp",
        icons:[{ src:"https://placehold.co/192x192/c8f135/000000?text=CN", sizes:"192x192", type:"image/png" },
               { src:"https://placehold.co/512x512/c8f135/000000?text=CN", sizes:"512x512", type:"image/png" }] };
      const blob = new Blob([JSON.stringify(manifest)], { type:"application/json" });
      const url = URL.createObjectURL(blob);
      let link = document.querySelector("link[rel=manifest]");
      if (!link) { link = document.createElement("link"); link.rel = "manifest"; document.head.appendChild(link); }
      link.href = url;
      const setMeta = (n, v) => { let el = document.querySelector("meta[name='"+n+"']"); if (!el) { el = document.createElement("meta"); el.name=n; document.head.appendChild(el); } el.content=v; };
      setMeta("apple-mobile-web-app-capable", "yes");
      setMeta("apple-mobile-web-app-status-bar-style", "black-translucent");
      setMeta("apple-mobile-web-app-title", "Coach Nguyen");
      setMeta("theme-color", "#0a0a0a");
      document.title = "Coach Nguyen";
    } catch(e) {}
  }, []);

  useEffect(() => {
    lv().then(d => {
      if (d) {
        if (typeof d.darkMode === "boolean") setDarkMode(d.darkMode);
        if (Array.isArray(d.customFoods)) setCustomFoods(d.customFoods);
        if (d.brand) setBrand(b => ({ ...b, ...d.brand }));
        if (d.clients && d.clients.length > 0) {
          const migrated = d.clients.map(c => {
            if (!c.mealPlan) return c;
            const mp = c.mealPlan;
            if (!mp.mealTypes) return { ...c, mealPlan:{ ...mp, mealTypes:DEFAULT_MEAL_TYPES, mealCalTargets:buildDefaultTargets(DEFAULT_MEAL_TYPES, mp.calories||2800) } };
            if (!mp.mealCalTargets) return { ...c, mealPlan:{ ...mp, mealCalTargets:buildDefaultTargets(mp.mealTypes, mp.calories||2800) } };
            if (!c.goals) return { ...c, goals:{ weightGoalKg:"", strengthGoals:[], customGoals:[] } };
            if (!c.mealPlan.macroRatio) return { ...c, mealPlan:{ ...c.mealPlan, macroRatio:{ protein:30, carbs:45, fat:25 } } };
            return c;
          });
          setClients(migrated);
        } else {
          setClients([defaultClient()]);
        }
      } else {
        setClients([defaultClient()]);
      }
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => sv({ clients, darkMode, customFoods, brand }), 800);
  }, [clients, darkMode, customFoods, brand, ready]);

  useEffect(() => {
    if (!ready) return;
    const iv = setInterval(async () => {
      const d = await lv();
      if (d && d.clients) {
        setClients(prev => {
          const same = JSON.stringify(prev) === JSON.stringify(d.clients);
          return same ? prev : d.clients;
        });
      }
    }, 10000);
    return () => clearInterval(iv);
  }, [ready]);

  const updateClient = (id, fn) => setClients(prev => prev.map(c => c.id === id ? fn(c) : c));
  // Expose for backup/import and force save
  useEffect(() => { window._coachClients = clients; window._coachSetClients = setClients; }, [clients]);
  useEffect(() => {
    window._coachForceSave = (newBrand) => sv({ clients, darkMode, customFoods, brand: newBrand });
  }, [clients, darkMode, customFoods]);
  const client = clients.find(c => c.id === clientId) || null;
  const isTrainer = view === "trainer";

  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline  = () => setIsOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online",  goOnline);
    return () => { window.removeEventListener("offline", goOffline); window.removeEventListener("online", goOnline); };
  }, []);

  useEffect(() => {
    const handler = e => { e.preventDefault(); setInstallPrompt(e); setShowInstallBanner(true); };
    window.addEventListener("beforeinstallprompt", handler);
    // Register service worker for offline support
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!ready) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:G.bg, color:G.muted, fontFamily:"'DM Sans',sans-serif" }}>
      Laster...
    </div>
  );

  if (!view) return (
    <Login clients={clients} darkMode={darkMode} setDarkMode={setDarkMode}
      brand={brand}
      onTrainer={() => { setView("trainer"); setTab("dashboard"); }}
      onClient={id => { setClientId(id); setView("client"); setTab("today"); }}
    />
  );

  return (
    <div style={{ minHeight:"100vh", background:G.bg, color:G.text, fontFamily:"'DM Sans',sans-serif" }}>
      <style>{makeCSS(darkMode)}</style>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Bebas+Neue&display=swap" rel="stylesheet" />
      {isOffline && (
        <div style={{ background:"#ff9f7e33", border:"none", borderBottom:"1px solid #ff9f7e55", padding:"8px 16px", display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:G.orange, flexShrink:0 }} />
          <div style={{ fontSize:12, color:G.orange, fontWeight:600 }}>
            Ingen internettforbindelse  -  Du kan fortsatt bruke appen, endringer lagres når du er tilkoblet igjen
          </div>
        </div>
      )}
      {showInstallBanner && installPrompt && (
        <div style={{ background:G.lime, color:"#000", padding:"10px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:10 }}>
          <div style={{ fontSize:13, fontWeight:600 }}>Legg Coach Nguyen til på hjemskjermen for raskere tilgang!</div>
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={() => { installPrompt.prompt(); setShowInstallBanner(false); }}
              style={{ background:"#000", color:G.lime, border:"none", borderRadius:6, padding:"6px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>Installer</button>
            <button onClick={() => setShowInstallBanner(false)}
              style={{ background:"transparent", color:"#000", border:"1px solid #00000033", borderRadius:6, padding:"6px 10px", fontSize:12, cursor:"pointer" }}>x</button>
          </div>
        </div>
      )}
      <AppHeader isTrainer={isTrainer} clientName={client ? client.name : ""} clients={clients}
        darkMode={darkMode} setDarkMode={setDarkMode} onLogout={() => { setView(null); setTab("dashboard"); }} />
      {isTrainer
        ? <TrainerApp clients={clients} setClients={setClients} clientId={clientId} setClientId={setClientId}
            client={client} updateClient={updateClient} tab={tab} setTab={setTab} darkMode={darkMode} />
        : <ClientApp client={client} updateClient={updateClient} tab={tab} setTab={setTab} customFoods={customFoods} setCustomFoods={setCustomFoods} />
      }
    </div>
  );
}

// ============================================================
// HEADER
// ============================================================
function AppHeader({ isTrainer, clientName, clients, darkMode, setDarkMode, onLogout }) {
  const totalUnread = clients.reduce((s,c) => s + (c.messages||[]).filter(m => m.from==="client" && !m.read).length, 0);
  return (
    <header style={{ background:G.bg, borderBottom:"1px solid "+G.border, position:"sticky", top:0, zIndex:200 }}>
      <div style={{ maxWidth:1000, margin:"0 auto", height:50, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 12px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontFamily:"'Bebas Neue'", fontSize:20, letterSpacing:3, color:G.lime }}>COACH NGUYEN</span>
          {isTrainer && <span style={{ fontSize:9, background:G.lime+"20", color:G.lime, padding:"2px 6px", borderRadius:3, letterSpacing:1, border:"1px solid "+G.lime+"30" }}>TRENER</span>}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          {!isTrainer && clientName && <span style={{ fontSize:11, color:G.muted, maxWidth:90, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{clientName}</span>}
          {isTrainer && totalUnread > 0 && <span style={{ fontSize:11, color:G.orange, fontWeight:600 }}>{totalUnread} uleste</span>}
          <button className="btn-icon" style={{ minWidth:38, minHeight:32 }} onClick={() => setDarkMode(d => !d)}>
            {darkMode ? "Lys" : "Mork"}
          </button>
          <button className="btn btn-ghost" style={{ padding:"5px 10px", fontSize:12, minHeight:32 }} onClick={onLogout}>Ut</button>
        </div>
      </div>
    </header>
  );
}

// ============================================================
// LOGIN
// ============================================================
function Login({ clients, darkMode, setDarkMode, onTrainer, onClient, brand }) {
  const [mode, setMode] = useState("choose");
  const [pin, setPin] = useState("");
  const [un, setUn] = useState(""); const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  const tryTrainer = () => pin === (brand?.trainerPin||PIN) ? onTrainer() : setErr("Feil PIN");
  const tryClient = () => {
    const c = clients.find(x => x.username && x.username.toLowerCase() === un.toLowerCase() && x.password === pw);
    c ? onClient(c.id) : setErr("Feil brukernavn eller passord");
  };

  return (
    <div style={{ minHeight:"100vh", background:G.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'DM Sans',sans-serif" }}>
      <style>{makeCSS(darkMode)}</style>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Bebas+Neue&display=swap" rel="stylesheet" />
      <div style={{ width:"100%", maxWidth:360 }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          {brand && brand.logoUrl
            ? <img src={brand.logoUrl} alt="logo" style={{ maxHeight:80, maxWidth:220, objectFit:"contain", marginBottom:8 }} />
            : <div style={{ fontFamily:"'Bebas Neue'", fontSize:44, letterSpacing:6, color:brand?.accentColor||G.lime }}>{brand?.appName||"COACH NGUYEN"}</div>
          }
          <div style={{ fontSize:13, color:G.dim, marginTop:4 }}>{brand?.tagline||"Personlig trenings- og kostholdsapp"}</div>
          <button className="btn-icon" style={{ marginTop:10 }} onClick={() => setDarkMode(d => !d)}>{darkMode ? "Lys modus" : "Mørk modus"}</button>
        </div>
        {mode === "choose" && (
          <div className="col" style={{ gap:10 }}>
            <button className="btn btn-lime" style={{ padding:17, fontSize:16, justifyContent:"center", borderRadius:12, minHeight:52 }} onClick={() => setMode("trainer")}>Trener</button>
            <button className="btn btn-ghost" style={{ padding:17, fontSize:16, justifyContent:"center", borderRadius:12, minHeight:52 }} onClick={() => setMode("client")}>Klient</button>
          </div>
        )}
        {mode === "trainer" && (
          <div className="card col">
            <div style={{ fontFamily:"'Bebas Neue'", fontSize:20, letterSpacing:2 }}>TRENER PIN</div>
            <input type="password" value={pin} onChange={e => { setPin(e.target.value); setErr(""); }}
              onKeyDown={e => e.key==="Enter" && tryTrainer()} placeholder="PIN"
              style={{ textAlign:"center", fontSize:22, letterSpacing:8 }} autoFocus />
            {err && <div style={{ color:G.red, fontSize:12 }}>{err}</div>}
            <div className="row">
              <button className="btn btn-lime" onClick={tryTrainer}>Logg inn</button>
              <button className="btn btn-ghost" onClick={() => { setMode("choose"); setErr(""); }}>Tilbake</button>
            </div>
          </div>
        )}
        {mode === "client" && (
          <div className="card col">
            <div style={{ fontFamily:"'Bebas Neue'", fontSize:20, letterSpacing:2 }}>LOGG INN</div>
            <input value={un} onChange={e => { setUn(e.target.value); setErr(""); }} placeholder="Brukernavn" autoFocus />
            <input type="password" value={pw} onChange={e => { setPw(e.target.value); setErr(""); }}
              onKeyDown={e => e.key==="Enter" && tryClient()} placeholder="Passord" />
            {err && <div style={{ color:G.red, fontSize:12 }}>{err}</div>}
            <div className="row">
              <button className="btn btn-lime" onClick={tryClient}>Logg inn</button>
              <button className="btn btn-ghost" onClick={() => { setMode("choose"); setErr(""); }}>Tilbake</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// TRAINER APP
// ============================================================
function TrainerApp({ clients, setClients, clientId, setClientId, client, updateClient, tab, setTab, darkMode, customFoods, setCustomFoods, brand, setBrand, installPrompt, showInstallBanner, setShowInstallBanner }) {
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const TABS = [
    { id:"dashboard",  label:"Oversikt" },
    { id:"workout",    label:"Trening" },
    { id:"meals",      label:"Kosthold" },
    { id:"sessions",   label:OEU+"ktlogg" },
    { id:"checkin",    label:"Innsjekk" },
    { id:"weekly",     label:"Ukesrapport" },
    { id:"notes",      label:"Notater" },
    { id:"templates",  label:"Maler" },
    { id:"messages",   label:"Meldinger" },
    { id:"settings",   label:"Innstillinger" },
  ];
  const unreadCount = c => (c.messages||[]).filter(m => m.from==="client" && !m.read).length;

  const deleteClient = id => {
    if (!window.confirm("Slett denne klienten? Dette kan ikke angres.")) return;
    setClients(prev => prev.filter(c => c.id !== id));
    if (clientId === id) { setClientId(null); setTab("dashboard"); }
  };

  return (
    <div style={{ maxWidth:1000, margin:"0 auto", padding:"0 16px 40px" }}>
      {tab !== "dashboard" && (
        <div className="trainer-chip-bar" style={{ borderBottom:"1px solid "+G.border, padding:"10px 0", display:"flex", gap:6, flexWrap:"wrap", alignItems:"center", marginTop:12 }}>
          <span className="lbl" style={{ marginRight:4 }}>KLIENT:</span>
          {clients.map(c => (
            <button key={c.id} className={"chip"+(c.id===clientId?" active":"")} onClick={() => setClientId(c.id)} style={{ position:"relative" }}>
              {c.name}
              {unreadCount(c) > 0 && <span style={{ position:"absolute", top:-2, right:-2, width:7, height:7, borderRadius:"50%", background:G.red, border:"1px solid "+G.bg }} />}
            </button>
          ))}
          <button className="chip" onClick={() => setAddOpen(true)}>+ Ny klient</button>
        </div>
      )}
      <div className="trainer-tabs" style={{ display:"flex", gap:0, borderBottom:"1px solid "+G.border, overflowX:"auto", marginTop: tab==="dashboard" ? 12 : 0 }}>
        {TABS.map(t => <button key={t.id} className={"tab-btn"+(tab===t.id?" active":"")} onClick={() => setTab(t.id)}>{t.label}</button>)}
      </div>
      <div style={{ paddingTop:20 }}>
        {tab==="dashboard" && <Dashboard clients={clients} setClients={setClients}
          onSelect={id => { setClientId(id); setTab("workout"); }}
          onAdd={() => setAddOpen(true)} onEdit={id => setEditId(id)} onDelete={deleteClient} />}
        {tab!=="dashboard" && !client && <div style={{ padding:40, textAlign:"center", color:G.muted }}>Velg en klient ovenfor</div>}
        {client && tab==="workout"  && <WorkoutTab client={client} updateClient={updateClient} isTrainer={true} />}
        {client && tab==="meals"    && <MealsTab client={client} updateClient={updateClient} isTrainer={true} clients={clients} setClients={setClients} customFoods={customFoods} setCustomFoods={setCustomFoods} />}
        {client && tab==="sessions" && <SessionsTab client={client} updateClient={updateClient} isTrainer={true} />}
        {client && tab==="checkin"   && <CheckInTab client={client} updateClient={updateClient} isTrainer={true} />}
        {client && tab==="weekly"    && <WeeklyTab client={client} updateClient={updateClient} />}
        {client && tab==="notes"     && <TrainerNotesTab client={client} updateClient={updateClient} />}
        {client && tab==="templates" && <TemplatesTab client={client} updateClient={updateClient} clients={clients} setClients={setClients} />}
        {client && tab==="messages"  && <MessagesTab client={client} updateClient={updateClient} isTrainer={true} />}
        {tab==="settings" && <AppSettingsTab brand={brand} setBrand={setBrand} darkMode={darkMode} />}
      </div>
      {addOpen && <ClientModal onSave={c => { setClients(p => [...p, c]); setClientId(c.id); setAddOpen(false); setTab("workout"); }} onClose={() => setAddOpen(false)} />}
      {editId && <ClientModal existing={clients.find(c => c.id===editId)} onSave={u => { setClients(p => p.map(c => c.id===editId ? {...c,...u} : c)); setEditId(null); }} onClose={() => setEditId(null)} onDelete={() => { deleteClient(editId); setEditId(null); }} />}
    </div>
  );
}

// ============================================================
// CLIENT APP   -  adds "Dagsplan" tab
// ============================================================
function ClientApp({ client, updateClient, tab, setTab, customFoods, setCustomFoods }) {
  if (!client) return null;
  const [showWelcome, setShowWelcome] = useState(() => {
    const key = "coachnguyen_welcomed_"+client.id;
    try { return !localStorage.getItem(key); } catch(e) { return false; }
  });
  const dismissWelcome = () => {
    try { localStorage.setItem("coachnguyen_welcomed_"+client.id, "1"); } catch(e) {}
    setShowWelcome(false);
  };
  const isNewClient = !(client.sessions||[]).length && !(client.workoutPlan?.days||[]).length;
  const unread = (client.messages||[]).filter(m => m.from==="trainer" && !m.read).length;
  const NAV = [
    { id:"today",    label:"I dag",      icon:"\uD83C\uDFE0" },
    { id:"meals",    label:"Kosthold",   icon:"\uD83E\uDD57" },
    { id:"workout",  label:"Trening",    icon:"\uD83D\uDCAA" },
    { id:"sessions", label:OEU+"ktlogg",icon:"\uD83D\uDCCB" },
    { id:"checkin",  label:"Innsjekk",   icon:"\uD83D\uDCF8" },
    { id:"shopping", label:"Handle",     icon:"\uD83D\uDED2" },
    { id:"messages", label:"Chat",       icon:"\uD83D\uDCAC" },
  ];
  return (
    <div style={{ maxWidth:1000, margin:"0 auto" }}>
      {showWelcome && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex",
          alignItems:"flex-end", justifyContent:"center", zIndex:500, padding:16 }}>
          <div style={{ background:G.card, border:"1px solid "+G.border, borderRadius:18,
            padding:28, width:"100%", maxWidth:420, marginBottom:8 }}>
            <div style={{ fontFamily:"'Bebas Neue'", fontSize:30, letterSpacing:2, color:G.lime, marginBottom:4 }}>
              Hei, {client.name.split(" ")[0]}!
            </div>
            <div style={{ fontSize:14, lineHeight:1.7, color:G.text, marginBottom:20 }}>
              Velkommen til din personlige treningsapp. Her er hva du kan gjøre:
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:22 }}>
              {[
                ["I dag", "Se dagens trening og måltider på én side"],
                ["Trening", "Start økt og logg vekt og reps for hvert sett"],
                ["Kosthold", "Se måltidene treneren har laget til deg"],
                ["Innsjekk", "Last opp ukentlige fremgangsbilder"],
                ["Meldinger", "Chat direkte med treneren din"],
              ].map(([title, desc]) => (
                <div key={title} style={{ display:"flex", gap:12, alignItems:"flex-start",
                  background:G.bg2, borderRadius:10, padding:"10px 14px" }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13, color:G.lime }}>{title}</div>
                    <div style={{ fontSize:12, color:G.muted, marginTop:2 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-lime" style={{ width:"100%", padding:15, fontSize:15,
              justifyContent:"center", borderRadius:12 }} onClick={dismissWelcome}>
              La oss komme i gang!
            </button>
          </div>
        </div>
      )}
      <div className="tab-bar-top" style={{ display:"flex", gap:0, borderBottom:"1px solid "+G.border, overflowX:"auto", marginTop:12 }}>
        {NAV.map(t => (
          <button key={t.id} className={"tab-btn"+(tab===t.id?" active":"")} onClick={() => setTab(t.id)}>
            {t.id==="messages" && unread>0 ? "Meldinger ("+unread+")" : t.label}
          </button>
        ))}
      </div>
      <nav className="bottom-nav">
        {NAV.map(t => (
          <button key={t.id} className={"bnb"+(tab===t.id?" active":"")} onClick={() => setTab(t.id)}>
            <span className="ni">{t.icon}</span>
            <span>{t.label}</span>
            {t.id==="messages" && unread>0 && (
              <span style={{ position:"absolute", top:5, right:"50%", transform:"translateX(12px)", background:"#ff5c5c",
                color:"#fff", borderRadius:"50%", width:14, height:14, fontSize:8, fontWeight:700,
                display:"flex", alignItems:"center", justifyContent:"center" }}>{unread}</span>
            )}
          </button>
        ))}
      </nav>
      <div className="page-pad" style={{ padding:"14px 14px 40px" }}>
        {tab==="today"    && <TodayView client={client} updateClient={updateClient} onGoWorkout={() => setTab("workout")} onGoMeals={() => setTab("meals")} />}
        {tab==="meals"    && <ClientMealsView client={client} updateClient={updateClient} customFoods={customFoods} setCustomFoods={setCustomFoods} />}
        {tab==="workout"  && <WorkoutTab client={client} updateClient={updateClient} isTrainer={false} />}
        {tab==="sessions" && <SessionsTab client={client} updateClient={updateClient} isTrainer={false} />}
        {tab==="checkin"  && <CheckInTab client={client} updateClient={updateClient} isTrainer={false} />}
        {tab==="shopping" && <ShoppingListTab client={client} />}
        {tab==="messages" && <MessagesTab client={client} updateClient={updateClient} isTrainer={false} />}
      </div>
    </div>
  );
}

// ============================================================
// TODAY VIEW (client dagsplan)
// ============================================================
function TodayView({ client, updateClient, onGoWorkout, onGoMeals }) {
  const [bwInput, setBwInput] = useState("");
  const mp = client.mealPlan || makeDefaultPlan();
  const mealTypes = mp.mealTypes || DEFAULT_MEAL_TYPES;
  const mealCalTargets = mp.mealCalTargets || buildDefaultTargets(mealTypes, mp.calories||2800);
  const mealOptions = mp.mealOptions || {};
  const activeSelections = mp.activeSelections || {};
  const days = client.workoutPlan && client.workoutPlan.days ? client.workoutPlan.days : [];

  const dayOfWeek = ["S"+OE+"ndag","Mandag","Tirsdag","Onsdag","Torsdag","Fredag","L"+OE+"rdag"][new Date().getDay()];
  const todayPlan = days.find(d => d.day === dayOfWeek) || null;

  const todaySessions = (client.sessions||[]).filter(s => s.date===todayStr());
  const alreadyDone = todaySessions.length > 0;

  const totalKcalToday = mealTypes.reduce((s, mt) => {
    const opts = mealOptions[mt.id]||[];
    const sel = opts.find(m => m.id===activeSelections[mt.id]) || opts[0];
    return s + (sel && sel.macros ? sel.macros.kcal : 0);
  }, 0);

  const goals = client.goals || {};
  const bwArr = (client.bodyWeight||[]).slice().sort((a,b) => b.date.localeCompare(a.date));
  const lastBw = bwArr[0] || null;
  const bwToday = (client.bodyWeight||[]).find(b => b.date===todayStr()) || null;
  const lastBwAllTime = bwArr[0] || null;
  const logBwToday = () => {
    if (!bwInput) return;
    const kg = parseFloat(bwInput.replace(",","."));
    if (!kg || kg < 20 || kg > 300) return;
    updateClient(client.id, c => ({
      ...c, bodyWeight:[...(c.bodyWeight||[]).filter(b => b.date!==todayStr()), { id:uid(), date:todayStr(), kg }]
    }));
    setBwInput("");
  };
  const weightGoal = parseFloat(goals.weightGoalKg) || null;
  const weightProgress = weightGoal && lastBw ? Math.max(0, Math.min(100, Math.round((1 - Math.abs(lastBw.kg - weightGoal) / Math.max(1, Math.abs((client.weight||80) - weightGoal))) * 100))) : null;

  return (
    <div className="col" style={{ gap:14 }}>
      <div style={{ fontFamily:"'Bebas Neue'", fontSize:26, letterSpacing:2, color:G.lime }}>
        GOD DAG, {(client.name||"").toUpperCase().split(" ")[0]}!
      </div>

      {/* Dagens trening */}
      <div className="card">
        <div className="lbl" style={{ marginBottom:8 }}>DAGENS TRENING</div>
        {todayPlan ? (
          <div>
            <div style={{ fontSize:15, fontWeight:700 }}>{todayPlan.day}  -  {todayPlan.focus}</div>
            <div style={{ fontSize:12, color:G.muted, marginTop:2, marginBottom:10 }}>
              {todayPlan.exercises.length} øvelser planlagt
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
              {todayPlan.exercises.map(ex => (
                <span key={ex.id} style={{ background:G.bg3, border:"1px solid "+G.border2, borderRadius:6, fontSize:11, padding:"3px 9px", color:G.muted }}>
                  {ex.name}
                </span>
              ))}
            </div>
            {alreadyDone
              ? <div style={{ color:G.green, fontWeight:700, fontSize:13 }}>økt fullført i dag!</div>
              : <button className="btn btn-lime" onClick={onGoWorkout}>Start økt</button>
            }
          </div>
        ) : (
          <div style={{ color:G.muted, fontSize:13 }}>
            Ingen trening planlagt for {dayOfWeek}. God hviledag!
          </div>
        )}
      </div>

      {/* Vekt logging */}
      <div className="card">
        <div className="lbl" style={{ marginBottom:8 }}>MIN VEKT</div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:22, fontWeight:800, color:G.blue }}>
              {bwToday ? bwToday.kg+" kg" : (lastBwAllTime ? lastBwAllTime.kg+" kg" : "Ikke logget")}
            </div>
            {!bwToday && lastBwAllTime && (
              <div style={{ fontSize:11, color:G.dim, marginTop:1 }}>Sist: {lastBwAllTime.date}</div>
            )}
            {bwToday && <div style={{ fontSize:11, color:G.green, marginTop:1 }}>Logget i dag!</div>}
          </div>
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            <input style={{ width:80, textAlign:"center", fontSize:18, fontWeight:700 }}
              type="number" step="0.1" value={bwInput}
              onChange={e => setBwInput(e.target.value)}
              onKeyDown={e => e.key==="Enter"&&logBwToday()}
              placeholder="kg" />
            <button className="btn btn-lime btn-sm" onClick={logBwToday}
              style={{ opacity:bwInput?1:0.4 }}>Logg</button>
          </div>
        </div>
      </div>

      {/* Kosthold i dag */}
      <div className="card">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <div className="lbl">DAGENS KOSTHOLD</div>
          <button className="btn-icon" onClick={onGoMeals}>Se alle måltider</button>
        </div>
        <div style={{ fontSize:18, fontWeight:800, color:G.lime, marginBottom:12 }}>
          {totalKcalToday} <span style={{ fontSize:12, color:G.muted, fontWeight:400 }}>/ {mp.calories||2800} kcal mål</span>
        </div>
        <div style={{ height:6, background:G.bg3, borderRadius:3, marginBottom:12 }}>
          <div style={{ height:"100%", background:G.lime, borderRadius:3, width:Math.min(100,Math.round(totalKcalToday/(mp.calories||2800)*100))+"%" }} />
        </div>
        <div className="col" style={{ gap:6 }}>
          {mealTypes.map(mt => {
            const opts = mealOptions[mt.id]||[];
            const sel = opts.find(m => m.id===activeSelections[mt.id]) || opts[0];
            return (
              <div key={mt.id} style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}>
                <span style={{ color:G.muted }}>{mt.label}</span>
                <span style={{ fontWeight:600, color:G.lime }}>
                  {sel && sel.macros ? sel.macros.kcal : mealCalTargets[mt.id]||0} kcal
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fremgang mot maal */}
      {goals && (weightGoal || (goals.strengthGoals||[]).length > 0 || (goals.customGoals||[]).length > 0) && (
        <div className="card">
          <div className="lbl" style={{ marginBottom:10 }}>MINE MåL</div>
          {weightGoal && (
            <div style={{ marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                <span>Kroppsvektmål: {weightGoal} kg</span>
                <span style={{ color:G.lime, fontWeight:700 }}>{lastBw ? lastBw.kg+" kg nå" : "Ikke logget"}</span>
              </div>
              {weightProgress !== null && (
                <div>
                  <div style={{ height:6, background:G.bg3, borderRadius:3 }}>
                    <div style={{ height:"100%", background:G.lime, borderRadius:3, width:weightProgress+"%" }} />
                  </div>
                  <div style={{ fontSize:10, color:G.dim, marginTop:2 }}>{weightProgress}% av veien mot målet</div>
                </div>
              )}
            </div>
          )}
          {(goals.strengthGoals||[]).map((sg, i) => {
            const best = (client.progressLog||[]).filter(l => l.exercise===sg.exercise).sort((a,b) => b.weight-a.weight)[0];
            const pct = best && sg.targetKg ? Math.min(100, Math.round(best.weight/sg.targetKg*100)) : 0;
            return (
              <div key={i} style={{ marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                  <span>{sg.exercise}: mål {sg.targetKg} kg</span>
                  <span style={{ color:G.blue, fontWeight:700 }}>{best ? best.weight+" kg nå" : "Ikke logget"}</span>
                </div>
                <div style={{ height:6, background:G.bg3, borderRadius:3 }}>
                  <div style={{ height:"100%", background:G.blue, borderRadius:3, width:pct+"%" }} />
                </div>
                <div style={{ fontSize:10, color:G.dim, marginTop:2 }}>{pct}% av målet</div>
              </div>
            );
          })}
          {(goals.customGoals||[]).map((cg, i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderTop:"1px solid "+G.border }}>
              <span style={{ fontSize:13 }}>{cg.label}</span>
              <input type="checkbox" checked={!!cg.done} onChange={e => {
                updateClient(client.id, c => ({
                  ...c, goals: { ...c.goals, customGoals: c.goals.customGoals.map((g,j) => j===i ? {...g, done:e.target.checked} : g) }
                }));
              }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// DASHBOARD
// ============================================================
function Dashboard({ clients, setClients, onSelect, onAdd, onEdit, onDelete }) {
  const ws = weekStart();
  const getStats = c => {
    const sessions = c.sessions||[];
    const sorted = sessions.slice().sort((a,b) => b.date.localeCompare(a.date));
    const lastSess = sorted[0]||null;
    const daysAgo = lastSess ? daysSince(lastSess.date) : null;
    const thisWeek = sessions.filter(s => s.date >= ws).length;
    const totalDays = c.workoutPlan && c.workoutPlan.days ? c.workoutPlan.days.length : 0;
    const unread = (c.messages||[]).filter(m => m.from==="client" && !m.read).length;
    const bwArr = (c.bodyWeight||[]).slice().sort((a,b) => b.date.localeCompare(a.date));
    return { daysAgo, thisWeek, totalDays, unread, lastBw: bwArr[0]||null };
  };
  const allUnread = clients.reduce((s,c) => s + getStats(c).unread, 0);
  const inactive = clients.filter(c => { const st=getStats(c); return st.daysAgo!==null && st.daysAgo>=4; }).length;

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:22 }}>
        {[
          { label:"KLIENTER", value:clients.length, color:G.lime },
          { label:"ULESTE MELDINGER", value:allUnread, color: allUnread>0 ? G.orange : G.dim },
          { label:"INAKTIVE 4+ DAGER", value:inactive, color: inactive>0 ? G.red : G.dim },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ textAlign:"center", padding:"14px 10px" }}>
            <div style={{ fontSize:26, fontWeight:800, color, lineHeight:1.1 }}>{value}</div>
            <div className="lbl" style={{ marginTop:4 }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <div className="lbl">KLIENTER</div>
        <button className="btn btn-lime btn-sm" onClick={onAdd}>+ Ny klient</button>
      </div>
      {clients.length === 0 ? (
        <div style={{ textAlign:"center", padding:60, color:G.muted }}>
          <div style={{ fontSize:14, marginBottom:12 }}>Ingen klienter lagt til enda</div>
          <button className="btn btn-lime" onClick={onAdd}>+ Legg til klient</button>
        </div>
      ) : (
        <div className="col" style={{ gap:8 }}>
          {clients.map(c => {
            const st = getStats(c);
            const isInactive = st.daysAgo !== null && st.daysAgo >= 4;
            const actLabel = st.daysAgo===null ? "Ingen økter ennå" : st.daysAgo===0 ? "I dag" : st.daysAgo===1 ? "I g"+AA+"r" : st.daysAgo+" dager siden";
            return (
              <div key={c.id} className="card" style={{ borderColor: isInactive ? G.red+"33" : st.unread>0 ? G.orange+"33" : G.border }}>
                <div style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
                  <div style={{ flex:1, cursor:"pointer" }} onClick={() => onSelect(c.id)}>
                    <div style={{ fontFamily:"'Bebas Neue'", fontSize:19, letterSpacing:1 }}>{c.name.toUpperCase()}</div>
                    <div style={{ fontSize:11, color:G.lime }}>{c.goal}</div>
                    <div style={{ fontSize:10, color:G.muted }}>{c.age} år  -  {c.weight} kg</div>
                  </div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    <StatPill label="MELDINGER" value={st.unread>0 ? st.unread+" nye" : "Ingen"} color={st.unread>0 ? G.orange : G.muted} />
                    <StatPill label="AKTIVITET" value={actLabel} color={isInactive ? G.red : G.blue} />
                    <StatPill label="DENNE UKA" value={st.thisWeek+"/"+st.totalDays+" økter"} color={G.purple} />
                    <StatPill label="VEKT" value={st.lastBw ? st.lastBw.kg+" kg" : "-"} color={G.green} />
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                    <button className="btn-icon" onClick={() => onEdit(c.id)}>Rediger</button>
                    <button className="btn-icon" style={{ color:G.red, borderColor:"#ff3c3c44" }} onClick={() => onDelete(c.id)}>Slett</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatPill({ label, value, color }) {
  return (
    <div style={{ background:G.bg3, border:"1px solid "+G.border, borderRadius:8, padding:"6px 10px", minWidth:100 }}>
      <div className="lbl" style={{ marginBottom:3 }}>{label}</div>
      <div style={{ fontSize:12, fontWeight:600, color }}>{value}</div>
    </div>
  );
}

// ============================================================
// WORKOUT TAB (with rest timer + session notes)
// ============================================================
function WorkoutTab({ client, updateClient, isTrainer }) {
  if (!client) return null;
  const [activeSessionDayId, setActiveSessionDayId] = useState(null);
  const [sessionSets, setSessionSets] = useState({});
  const [sessionNote, setSessionNote] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [editDayId, setEditDayId] = useState(null);
  const [dayForm, setDayForm] = useState({ day:"", focus:"" });
  const [editExId, setEditExId] = useState(null);
  const [editExDayId, setEditExDayId] = useState(null);
  const [exForm, setExForm] = useState({});
  const [viewLogEx, setViewLogEx] = useState(null);
  const [copyWorkoutModal, setCopyWorkoutModal] = useState(false);
  const timer = useRestTimer();

  const days = client.workoutPlan && client.workoutPlan.days ? client.workoutPlan.days : [];

  const lastSessionForDay = dayId => {
    const all = (client.sessions||[]).filter(s => s.dayId===dayId);
    return all.sort((a,b) => b.date.localeCompare(a.date))[0] || null;
  };

  const startSession = day => {
    const prev = lastSessionForDay(day.id);
    const sets = {};
    day.exercises.forEach(ex => {
      const prevEx = prev && prev.exercises ? prev.exercises.find(e => e.name===ex.name) : null;
      sets[ex.id] = Array.from({ length: parseInt(ex.sets)||3 }, (_,i) => ({
        done:false,
        weight: prevEx && prevEx.sets && prevEx.sets[i] ? prevEx.sets[i].weight : "",
        reps:   prevEx && prevEx.sets && prevEx.sets[i] ? prevEx.sets[i].reps   : "",
        prevWeight: prevEx && prevEx.sets && prevEx.sets[i] ? prevEx.sets[i].weight : null,
        prevReps:   prevEx && prevEx.sets && prevEx.sets[i] ? prevEx.sets[i].reps   : null,
      }));
    });
    setSessionSets(sets); setActiveSessionDayId(day.id); setExpanded(day.id); setSessionNote("");
  };

  const finishSession = dayId => {
    const day = days.find(d => d.id===dayId);
    const newLogs = [];
    day.exercises.forEach(ex => {
      (sessionSets[ex.id]||[]).filter(s => s.done && s.weight && s.reps).forEach(s => {
        newLogs.push({ id:uid(), date:todayStr(), exercise:ex.name, weight:parseFloat(s.weight)||0, reps:parseInt(s.reps)||0, note:"" });
      });
    });
    const session = {
      id:uid(), date:todayStr(), dayId, dayName:day.day+"  -  "+day.focus,
      note: sessionNote,
      exercises: day.exercises.map(ex => ({
        name:ex.name,
        sets:(sessionSets[ex.id]||[]).map(s => ({ weight:s.weight, reps:s.reps, done:s.done })),
      })),
    };
    updateClient(client.id, c => ({ ...c, sessions:[...(c.sessions||[]),session], progressLog:[...(c.progressLog||[]),...newLogs] }));
    setActiveSessionDayId(null); setSessionSets({}); setSessionNote(""); timer.stop();
  };

  const updSet = (exId, si, field, val) => {
    setSessionSets(s => ({ ...s, [exId]:s[exId].map((x,i) => i===si ? {...x,[field]:val} : x) }));
  };

  const markSetDone = (exId, si, restSecs) => {
    updSet(exId, si, "done", true);
    timer.start(restSecs);
  };

  const saveDay = () => {
    if (!dayForm.day) return;
    if (editDayId==="new") {
      updateClient(client.id, c => ({ ...c, workoutPlan:{ ...c.workoutPlan, days:[...c.workoutPlan.days,{ ...dayForm, id:uid(), exercises:[] }] } }));
    } else {
      updateClient(client.id, c => ({ ...c, workoutPlan:{ ...c.workoutPlan, days:c.workoutPlan.days.map(d => d.id===editDayId ? {...d,...dayForm} : d) } }));
    }
    setEditDayId(null);
  };

  const deleteDay = id => {
    updateClient(client.id, c => ({ ...c, workoutPlan:{ ...c.workoutPlan, days:c.workoutPlan.days.filter(d => d.id!==id) } }));
  };

  const saveEx = dayId => {
    updateClient(client.id, c => ({
      ...c, workoutPlan:{ ...c.workoutPlan, days:c.workoutPlan.days.map(d => {
        if (d.id!==dayId) return d;
        const exercises = exForm.isNew ? [...d.exercises,{...exForm,id:uid(),isNew:undefined}] : d.exercises.map(e => e.id===exForm.id ? {...e,...exForm} : e);
        return { ...d, exercises };
      })}
    }));
    setEditExId(null); setEditExDayId(null);
  };

  const deleteEx = (dayId, exId) => {
    updateClient(client.id, c => ({ ...c, workoutPlan:{ ...c.workoutPlan, days:c.workoutPlan.days.map(d => d.id!==dayId ? d : {...d, exercises:d.exercises.filter(e => e.id!==exId)}) } }));
  };

  const getExerciseLogs = exName => {
    const logs = [];
    (client.sessions||[]).forEach(sess => {
      const ex = (sess.exercises||[]).find(e => e.name===exName);
      if (ex) {
        const done = (ex.sets||[]).filter(s => s.done && s.weight && s.reps);
        if (done.length>0) logs.push({ date:sess.date, sets:done });
      }
    });
    return logs.sort((a,b) => b.date.localeCompare(a.date));
  };

  const parseRestSecs = str => {
    if (!str) return 90;
    const m = str.match(/(\d+)min/); if (m) return parseInt(m[1])*60;
    const s = str.match(/(\d+)s/); if (s) return parseInt(s[1]);
    return 90;
  };

  return (
    <div className="col" style={{ gap:10 }}>
      {/* Rest timer */}
      {timer.running && (
        <div style={{ background: timer.done ? G.lime+"22" : G.bg2, border:"1px solid "+(timer.done ? G.lime : G.border2), borderRadius:12, padding:"10px 16px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <span style={{ fontSize:13, fontWeight:700, color: timer.done ? G.lime : G.text }}>
              {timer.done ? "Hvile ferdig! Klar for neste sett." : "Hviler: "+timer.fmt(timer.seconds)+" / "+timer.fmt(timer.target)}
            </span>
            <button className="btn-icon" onClick={timer.stop}>Stopp</button>
          </div>
          <div style={{ height:5, background:G.bg3, borderRadius:3 }}>
            <div style={{ height:"100%", background: timer.done ? G.lime : G.blue, borderRadius:3, width:timer.pct+"%" }} />
          </div>
        </div>
      )}

      {activeSessionDayId && (
        <div style={{ background:"#0d1800", border:"1px solid "+G.lime+"33", borderRadius:12, padding:"12px 16px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <div style={{ fontSize:13, fontWeight:700, color:G.lime }}>
              Aktiv økt: {(days.find(d => d.id===activeSessionDayId)||{}).day||""}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn btn-lime btn-sm" onClick={() => finishSession(activeSessionDayId)}>Fullfør økt</button>
              <button className="btn btn-ghost btn-sm" onClick={() => { setActiveSessionDayId(null); setSessionSets({}); timer.stop(); }}>Avbryt</button>
            </div>
          </div>
          <div className="col">
            <span className="lbl">NOTAT TIL DENNE ØKTEN</span>
            <textarea value={sessionNote} onChange={e => setSessionNote(e.target.value)} rows={2}
              placeholder="Hvordan føltes økten? Noe du vil huske til neste gang..." style={{ resize:"vertical" }} />
          </div>
        </div>
      )}

      {days.map(day => {
        const isOpen = expanded === day.id;
        const isActive = activeSessionDayId === day.id;
        const prev = lastSessionForDay(day.id);
        return (
          <div key={day.id} className="card" style={{ padding:0, overflow:"hidden" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"13px 16px", cursor:"pointer", borderBottom: isOpen ? "1px solid "+G.border : "none" }}
              onClick={() => setExpanded(isOpen && !isActive ? null : day.id)}>
              {editDayId===day.id ? (
                <div className="row" onClick={e => e.stopPropagation()}>
                  <input style={{ width:100 }} value={dayForm.day} onChange={e => setDayForm(f => ({...f,day:e.target.value}))} placeholder="Mandag" />
                  <input style={{ width:180 }} value={dayForm.focus} onChange={e => setDayForm(f => ({...f,focus:e.target.value}))} placeholder="Bryst og Triceps" />
                  <button className="btn-sm btn-lime" onClick={saveDay}>Lagre</button>
                  <button className="btn-icon" onClick={() => setEditDayId(null)}>Avbryt</button>
                </div>
              ) : (
                <div>
                  <span style={{ fontWeight:700, fontSize:15 }}>{day.day}</span>
                  <span style={{ color:G.lime, fontSize:13, marginLeft:8 }}> -  {day.focus}</span>
                  <div style={{ fontSize:11, color:G.muted, marginTop:1 }}>
                    {day.exercises.length} øvelser{prev ? "  -  Sist: "+prev.date : ""}
                  </div>
                </div>
              )}
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                {!isTrainer && (
                  <button className={"btn btn-sm "+(isActive?"btn-ghost":"btn-lime")} onClick={e => { e.stopPropagation(); isActive ? (setActiveSessionDayId(null)||setSessionSets({})||timer.stop()) : startSession(day); }}>
                    {isActive ? "Avbryt" : "Start økt"}
                  </button>
                )}
                {isTrainer && editDayId!==day.id && (
                  <div style={{ display:"flex", gap:4 }}>
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); setEditDayId(day.id); setDayForm({day:day.day,focus:day.focus}); }}>Rediger</button>
                    <button className="btn-icon" style={{ color:G.red, borderColor:"#ff3c3c44" }} onClick={e => { e.stopPropagation(); deleteDay(day.id); }}>Slett</button>
                  </div>
                )}
                <span style={{ color:G.dim, fontSize:14 }}>{isOpen ? "^" : "v"}</span>
              </div>
            </div>

            {isOpen && (
              <div>
                {day.exercises.map(ex => (
                  <div key={ex.id}>
                    {editExId===ex.id && editExDayId===day.id ? (
                      <ExForm form={exForm} setForm={setExForm} onSave={() => saveEx(day.id)} onCancel={() => { setEditExId(null); setEditExDayId(null); }} />
                    ) : (
                      <div style={{ padding:"12px 16px", borderBottom:"1px solid "+G.border }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom: isActive ? 10 : 4 }}>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:14, fontWeight:600 }}>{ex.name}</div>
                            {ex.note ? <div style={{ fontSize:10, color:G.lime+"99", marginTop:1 }}>{ex.note}</div> : null}
                            <div style={{ display:"flex", gap:10, marginTop:4, flexWrap:"wrap" }}>
                              <span style={{ fontSize:12, color:G.muted }}><span style={{ color:G.dim, fontSize:10 }}>SETT </span>{ex.sets}</span>
                              <span style={{ fontSize:12, color:G.muted }}><span style={{ color:G.dim, fontSize:10 }}>REPS </span>{ex.reps}</span>
                              <span style={{ fontSize:12, color:G.muted }}><span style={{ color:G.dim, fontSize:10 }}>VEKT </span>{ex.weight}</span>
                              <span style={{ fontSize:12, color:G.muted }}><span style={{ color:G.dim, fontSize:10 }}>PAUSE </span>{ex.rest}</span>
                            </div>
                          </div>
                          {isTrainer && (
                            <div style={{ display:"flex", gap:4, flexShrink:0, marginLeft:8 }}>
                              <button className="btn-icon" onClick={() => { setEditExId(ex.id); setEditExDayId(day.id); setExForm({...ex}); }}>Rediger</button>
                              <button className="btn-icon" style={{ color:G.red, borderColor:"#ff3c3c44" }} onClick={() => deleteEx(day.id, ex.id)}>Slett</button>
                              <button className="btn-icon" style={{ color:G.blue, borderColor:G.blue+"44" }} onClick={() => setViewLogEx(viewLogEx===ex.name?null:ex.name)}>
                                {viewLogEx===ex.name ? "Skjul" : "Se logg"}
                              </button>
                            </div>
                          )}
                        </div>

                        {isActive && (
                          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                            {(sessionSets[ex.id]||[]).map((st, si) => (
                              <div key={si} style={{
                                background: st.done ? G.lime+"0d" : G.bg2,
                                border: "1px solid "+(st.done ? G.lime+"44" : G.border),
                                borderRadius: 10, padding:"10px 12px"
                              }}>
                                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                                  <div style={{ fontSize:13, fontWeight:800, color:G.dim, minWidth:22, textAlign:"center" }}>{si+1}</div>
                                  <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                                    <div>
                                      <div className="lbl" style={{ marginBottom:4 }}>VEKT KG</div>
                                      <input type="number" inputMode="decimal"
                                        style={{ padding:"10px 6px", fontSize:16, textAlign:"center",
                                          background: st.done ? G.lime+"11" : G.inputBg,
                                          borderColor: st.done ? G.lime+"66" : G.border,
                                          width:"100%", borderRadius:8, fontWeight:700 }}
                                        value={st.weight}
                                        onChange={e => updSet(ex.id, si, "weight", e.target.value)}
                                        placeholder={st.prevWeight||"kg"} />
                                      {st.prevWeight && <div style={{ fontSize:9, color:G.dim, textAlign:"center", marginTop:2 }}>Sist: {st.prevWeight}</div>}
                                    </div>
                                    <div>
                                      <div className="lbl" style={{ marginBottom:4 }}>REPS</div>
                                      <input type="number" inputMode="numeric"
                                        style={{ padding:"10px 6px", fontSize:16, textAlign:"center",
                                          background: st.done ? G.lime+"11" : G.inputBg,
                                          borderColor: st.done ? G.lime+"66" : G.border,
                                          width:"100%", borderRadius:8, fontWeight:700 }}
                                        value={st.reps}
                                        onChange={e => updSet(ex.id, si, "reps", e.target.value)}
                                        placeholder={st.prevReps||"reps"} />
                                      {st.prevReps && <div style={{ fontSize:9, color:G.dim, textAlign:"center", marginTop:2 }}>Sist: {st.prevReps}</div>}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => { if (!st.done) markSetDone(ex.id, si, parseRestSecs(ex.rest)); }}
                                    style={{ width:52, height:52, borderRadius:10, flexShrink:0,
                                      border:"2px solid "+(st.done ? G.lime : G.border2),
                                      background: st.done ? G.lime : "transparent",
                                      cursor:"pointer", fontSize:20, fontWeight:900,
                                      color: st.done ? "#000" : G.dim,
                                      display:"flex", alignItems:"center", justifyContent:"center" }}>
                                    {st.done ? "\u2713" : "\u25CB"}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {isTrainer && viewLogEx===ex.name && (
                      <div style={{ background:G.bg2, borderBottom:"1px solid "+G.border, padding:"10px 16px" }}>
                        <div className="lbl" style={{ marginBottom:8 }}>KUNDENS LOGG: {ex.name}</div>
                        {(() => {
                          const logs = getExerciseLogs(ex.name);
                          if (!logs.length) return <div style={{ fontSize:12, color:G.muted }}>Ingen loggede økter ennå</div>;
                          return logs.slice(0,5).map((log,li) => (
                            <div key={li} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6, flexWrap:"wrap" }}>
                              <div style={{ fontSize:11, color:G.muted, width:80 }}>{log.date}</div>
                              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                                {log.sets.map((s,si) => (
                                  <span key={si} style={{ background:G.bg3, border:"1px solid "+G.border2, borderRadius:5, fontSize:11, padding:"2px 8px", color:G.lime }}>
                                    Sett {si+1}: {s.weight}kg x {s.reps} reps
                                  </span>
                                ))}
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    )}
                  </div>
                ))}

                {editExId==="new" && editExDayId===day.id && (
                  <ExForm form={exForm} setForm={setExForm} onSave={() => saveEx(day.id)} onCancel={() => { setEditExId(null); setEditExDayId(null); }} />
                )}
                {isTrainer && (
                  <div style={{ padding:"8px 16px" }}>
                    <button className="btn-sm btn-ghost" onClick={() => { setEditExId("new"); setEditExDayId(day.id); setExForm({isNew:true,name:"",sets:3,reps:"8-12",weight:"",rest:"90s",note:""}); }}>
                      + Legg til øvelse
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {isTrainer && (
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {editDayId==="new" ? (
            <div className="card row" style={{ gap:10, width:"100%" }}>
              <input style={{ width:110 }} value={dayForm.day} onChange={e => setDayForm(f => ({...f,day:e.target.value}))} placeholder="f.eks. Mandag" />
              <input style={{ flex:1 }} value={dayForm.focus} onChange={e => setDayForm(f => ({...f,focus:e.target.value}))} placeholder="f.eks. Bryst og Triceps" />
              <button className="btn btn-lime" onClick={saveDay}>Lagre</button>
              <button className="btn btn-ghost" onClick={() => setEditDayId(null)}>Avbryt</button>
            </div>
          ) : (
            <button className="btn btn-ghost" onClick={() => { setEditDayId("new"); setDayForm({day:"",focus:""}); }}>+ Legg til treningsdag</button>
          )}
          <button className="btn btn-ghost" onClick={() => setCopyWorkoutModal(true)}>Kopier plan til annen klient</button>
        </div>
      )}

      {copyWorkoutModal && (
        <CopyWorkoutModal client={client} onClose={() => setCopyWorkoutModal(false)} updateClient={updateClient} />
      )}
    </div>
  );
}

function ExForm({ form, setForm, onSave, onCancel }) {
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:8, padding:"10px 16px", background:G.bg2, borderBottom:"1px solid "+G.border, alignItems:"flex-end" }}>
      <div className="col">
        <span className="lbl">NAVN</span>
        <input style={{ minWidth:130 }} value={form.name||""} onChange={e => setForm(f => ({...f,name:e.target.value}))} placeholder={OEU+"velsesnavn"} autoFocus />
      </div>
      {[["SETT","sets",50,"number"],["REPS","reps",75,"text"],["VEKT","weight",75,"text"],["PAUSE","rest",75,"text"]].map(([l,k,w,t]) => (
        <div key={k} className="col">
          <span className="lbl">{l}</span>
          <input style={{ width:w }} type={t} value={form[k]||""} onChange={e => setForm(f => ({...f,[k]:e.target.value}))} />
        </div>
      ))}
      <div className="col">
        <span className="lbl">NOTAT</span>
        <input style={{ minWidth:120 }} value={form.note||""} onChange={e => setForm(f => ({...f,note:e.target.value}))} placeholder="Valgfritt" />
      </div>
      <button className="btn-sm btn-lime" onClick={onSave}>Lagre</button>
      <button className="btn-icon" onClick={onCancel}>Avbryt</button>
    </div>
  );
}

// ============================================================
// MEALS TAB (TRAINER)
// ============================================================
function MealsTab({ client, updateClient, isTrainer, clients, setClients, customFoods, setCustomFoods }) {
  const [activeMealType, setActiveMealType] = useState("");
  const [showSetup, setShowSetup] = useState(false);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [editMealId, setEditMealId] = useState(null);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [setupCal, setSetupCal] = useState(2800);
  const [setupTypes, setSetupTypes] = useState([]);

  const mp = client.mealPlan || makeDefaultPlan();
  const mealTypes = mp.mealTypes || DEFAULT_MEAL_TYPES;
  const mealCalTargets = mp.mealCalTargets || buildDefaultTargets(mealTypes, mp.calories||2800);
  const mealOptions = mp.mealOptions || {};
  const activeMT = activeMealType || (mealTypes[0] ? mealTypes[0].id : "");
  const activeMeals = mealOptions[activeMT] || [];
  const activeTypeName = (mealTypes.find(m => m.id===activeMT)||{}).label || "";

  // openSetup replaced by openSetupFull above

  const [setupMacro, setSetupMacro] = useState({ protein:30, carbs:45, fat:25 });

  const openSetupFull = () => {
    setSetupCal(mp.calories||2800);
    setSetupTypes(JSON.parse(JSON.stringify(mealTypes)));
    const mr = mp.macroRatio || { protein:30, carbs:45, fat:25 };
    setSetupMacro({ ...mr });
    setShowSetup(true);
  };

  const saveSetup = () => {
    const cal = +setupCal;
    const mr = setupMacro;
    const newTargets = {};
    setupTypes.forEach(mt => { newTargets[mt.id] = Math.round(cal * (+mt.pct||0) / 100); });
    // Rebuild meal ingredients based on new macro ratio
    const newOptions = {};
    setupTypes.forEach(mt => {
      const existing = mealOptions[mt.id] || [];
      const target = newTargets[mt.id] || 0;
      newOptions[mt.id] = existing.map(meal => {
        const cur = meal.macros ? meal.macros.kcal : 0;
        if (!cur || !target) return meal;
        const ratio = target / cur;
        const si = (meal.structuredItems||[]).map(i => ({...i, grams: Math.max(1, Math.round((i.grams||0)*ratio))}));
        return { ...meal, structuredItems:si, macros:calcMacros(si) };
      });
    });
    updateClient(client.id, c => ({
      ...c, mealPlan:{
        ...c.mealPlan,
        calories: cal,
        macroRatio: mr,
        protein: Math.round(cal * mr.protein / 100 / 4),
        carbs: Math.round(cal * mr.carbs / 100 / 4),
        fat: Math.round(cal * mr.fat / 100 / 9),
        mealTypes: setupTypes,
        mealCalTargets: newTargets,
        mealOptions: newOptions,
      },
    }));
    setShowSetup(false);
    setActiveMealType(setupTypes[0] ? setupTypes[0].id : "");
  };

  const addSetupRow = () => setSetupTypes(prev => [...prev, { id:uid(), label:"Nytt måltid", pct:10 }]);
  const removeSetupRow = id => setSetupTypes(prev => prev.filter(mt => mt.id!==id));
  const updateSetupRow = (id, field, val) => setSetupTypes(prev => prev.map(mt => mt.id===id ? {...mt,[field]:field==="pct"?Math.max(0,Math.min(100,+val)):val} : mt));

  const addMeal = meal => {
    updateClient(client.id, c => {
      const mo = c.mealPlan.mealOptions||{};
      return { ...c, mealPlan:{ ...c.mealPlan, mealOptions:{ ...mo, [activeMT]:[...(mo[activeMT]||[]),meal] } } };
    });
    setShowAddMeal(false);
  };

  const updateMeal = (mealId, updated) => {
    updateClient(client.id, c => {
      const mo = c.mealPlan.mealOptions||{};
      return { ...c, mealPlan:{ ...c.mealPlan, mealOptions:{ ...mo, [activeMT]:(mo[activeMT]||[]).map(m => m.id===mealId?updated:m) } } };
    });
  };

  const deleteMeal = mealId => {
    updateClient(client.id, c => {
      const mo = c.mealPlan.mealOptions||{};
      return { ...c, mealPlan:{ ...c.mealPlan, mealOptions:{ ...mo, [activeMT]:(mo[activeMT]||[]).filter(m => m.id!==mealId) } } };
    });
  };

  const copyPlan = targetId => {
    setClients(cs => cs.map(c => c.id===targetId ? {...c, mealPlan:JSON.parse(JSON.stringify(mp))} : c));
    setShowCopyModal(false);
  };

  const setupPctTotal = setupTypes.reduce((s,mt) => s + (+mt.pct||0), 0);

  return (
    <div>
      {/* Top card */}
      <div className="card" style={{ marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div>
            <div className="lbl" style={{ marginBottom:4 }}>DAGLIG KALORIMåL</div>
            <div style={{ fontSize:26, fontWeight:800, color:G.lime, lineHeight:1 }}>
              {mp.calories||2800}<span style={{ fontSize:13, color:G.muted, fontWeight:400 }}> kcal/dag</span>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:6, flexWrap:"wrap" }}>
              {[
                { label:"Protein", val:mp.protein||0, color:G.blue, pct:(mp.macroRatio||{}).protein||30 },
                { label:"Karbs", val:mp.carbs||0, color:G.orange, pct:(mp.macroRatio||{}).carbs||45 },
                { label:"Fett", val:mp.fat||0, color:G.green, pct:(mp.macroRatio||{}).fat||25 },
              ].map(({ label, val, color, pct }) => (
                <div key={label} style={{ fontSize:11 }}>
                  <span style={{ color, fontWeight:700 }}>{val}g</span>
                  <span style={{ color:G.dim }}> {label} ({pct}%)</span>
                </div>
              ))}
            </div>
          </div>
          {isTrainer && (
            <div style={{ display:"flex", gap:6 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowCopyModal(true)}>Kopier plan</button>
              <button className="btn btn-lime btn-sm" onClick={openSetupFull}>Rediger kalorier og måltider</button>
            </div>
          )}
        </div>
        <div className="lbl" style={{ marginBottom:8 }}>KALORIER PER MåLTID</div>
        <div className="col" style={{ gap:6 }}>
          {mealTypes.map(mt => {
            const target = mealCalTargets[mt.id]||0;
            const meals = mealOptions[mt.id]||[];
            const avg = meals.length > 0 ? Math.round(meals.reduce((s,m) => s+(m.macros?m.macros.kcal:0),0)/meals.length) : 0;
            return (
              <div key={mt.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:G.bg3, borderRadius:8, padding:"8px 12px" }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{mt.label}</div>
                  <div style={{ fontSize:11, color:G.muted }}>{meals.length>0 ? meals.length+" forslag - snitt "+avg+" kcal" : "Ingen forslag enn"+AA}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:16, fontWeight:800, color:G.lime }}>{target} kcal</div>
                  <div style={{ fontSize:10, color:G.dim }}>{mt.pct||0}% av dagmål</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Setup modal */}
      {showSetup && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.82)", display:"flex", alignItems:"flex-start", justifyContent:"center", zIndex:300, padding:16, overflowY:"auto" }}>
          <div style={{ width:"100%", maxWidth:520, marginTop:20 }}>
            <div className="card col" style={{ gap:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ fontFamily:"'Bebas Neue'", fontSize:22, letterSpacing:2 }}>REDIGER KALORIER OG MåLTIDER</div>
                <button className="btn-icon" onClick={() => setShowSetup(false)}>Lukk</button>
              </div>
              <div>
                <div className="lbl" style={{ marginBottom:6 }}>TOTALT DAGLIG KALORIMåL</div>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                  <button className="btn-icon" style={{ fontSize:18, padding:"2px 12px" }} onClick={() => setSetupCal(c => Math.max(1000,+c-50))}>-</button>
                  <input style={{ width:110, textAlign:"center", fontSize:22, fontWeight:800, color:G.lime }} type="number" value={setupCal} onChange={e => setSetupCal(Math.max(1000,+e.target.value))} />
                  <button className="btn-icon" style={{ fontSize:18, padding:"2px 12px" }} onClick={() => setSetupCal(c => +c+50)}>+</button>
                  <span style={{ color:G.muted, fontSize:13 }}>kcal/dag</span>
                </div>
                <input type="range" min="1200" max="5000" step="50" value={setupCal} onChange={e => setSetupCal(+e.target.value)} style={{ width:"100%" }} />
              </div>
              <div style={{ background:G.bg3, borderRadius:8, padding:"12px 14px" }}>
                <div className="lbl" style={{ marginBottom:10 }}>MAKROFORDELING</div>
                <div style={{ fontSize:11, color:G.muted, marginBottom:10 }}>Angi hvor mange prosent av kalorier som skal komme fra hvert makronæringsstoff.</div>
                {(() => {
                  const mr = setupMacro;
                  const total = (+mr.protein||0) + (+mr.carbs||0) + (+mr.fat||0);
                  const pGram = Math.round(+setupCal * (mr.protein||0) / 100 / 4);
                  const cGram = Math.round(+setupCal * (mr.carbs||0) / 100 / 4);
                  const fGram = Math.round(+setupCal * (mr.fat||0) / 100 / 9);
                  return (
                    <div className="col" style={{ gap:10 }}>
                      {[
                        { key:"protein", label:"Protein", color:G.blue, cal:4, gram:pGram },
                        { key:"carbs", label:"Karbohydrater", color:G.orange, cal:4, gram:cGram },
                        { key:"fat", label:"Fett", color:G.green, cal:9, gram:fGram },
                      ].map(({ key, label, color, gram }) => (
                        <div key={key}>
                          <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                            <span style={{ fontWeight:600, color }}>{label}</span>
                            <div style={{ display:"flex", gap:8 }}>
                              <span style={{ color, fontWeight:700 }}>{mr[key]}%</span>
                              <span style={{ color:G.dim }}>{gram}g / dag</span>
                            </div>
                          </div>
                          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <button className="btn-icon" onClick={() => setSetupMacro(m => ({...m,[key]:Math.max(5,+m[key]-5)}))}>-</button>
                            <input type="range" min="5" max="70" step="5" value={mr[key]} onChange={e => setSetupMacro(m => ({...m,[key]:+e.target.value}))} style={{ flex:1 }} />
                            <button className="btn-icon" onClick={() => setSetupMacro(m => ({...m,[key]:Math.min(70,+m[key]+5)}))}>+</button>
                          </div>
                        </div>
                      ))}
                      <div style={{ fontSize:12, fontWeight:700, color:Math.abs(total-100)<=2?G.green:G.red }}>
                        Total: {total}% {Math.abs(total-100)>2?" -  må være 100%!":""}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div>
                <div className="lbl" style={{ marginBottom:8 }}>MåLTIDER OG KALORIFORDELING</div>
                <div className="col" style={{ gap:8 }}>
                  {setupTypes.map((mt) => {
                    const kcal = Math.round(+setupCal * (+mt.pct||0) / 100);
                    return (
                      <div key={mt.id} style={{ background:G.bg3, borderRadius:8, padding:"10px 12px" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                          <input style={{ flex:1, marginRight:8, fontWeight:600 }} value={mt.label} onChange={e => updateSetupRow(mt.id,"label",e.target.value)} placeholder="Navn" />
                          <span style={{ color:G.lime, fontWeight:800, fontSize:15, marginRight:8 }}>{kcal} kcal</span>
                          <span style={{ color:G.dim, fontSize:12, marginRight:8 }}>({mt.pct||0}%)</span>
                          {setupTypes.length > 1 && (
                            <button className="btn-sm" style={{ background:"#ff3c3c22", border:"1px solid #ff3c3c44", color:G.red, borderRadius:6 }} onClick={() => removeSetupRow(mt.id)}>Fjern</button>
                          )}
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <button className="btn-icon" onClick={() => updateSetupRow(mt.id,"pct",Math.max(0,(+mt.pct||0)-1))}>-</button>
                          <input type="range" min="0" max="70" step="1" value={mt.pct||0} onChange={e => updateSetupRow(mt.id,"pct",+e.target.value)} style={{ flex:1 }} />
                          <button className="btn-icon" onClick={() => updateSetupRow(mt.id,"pct",Math.min(70,(+mt.pct||0)+1))}>+</button>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:4 }}>
                          <span style={{ fontSize:11, color:G.dim }}>Direkte kcal:</span>
                          <input
                            type="number" inputMode="numeric"
                            style={{ width:90, padding:"4px 8px", fontSize:13, textAlign:"center", fontWeight:700, borderRadius:6 }}
                            value={kcal}
                            onChange={e => {
                              const newKcal = +e.target.value;
                              if (!isNaN(newKcal) && setupCal > 0) {
                                const newPct = Math.round((newKcal / setupCal) * 100);
                                updateSetupRow(mt.id, "pct", Math.max(0, Math.min(70, newPct)));
                              }
                            }}
                          />
                          <span style={{ fontSize:11, color:G.dim }}>kcal</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:10 }}>
                  <div style={{ fontSize:12, fontWeight:700, color: Math.abs(setupPctTotal-100)<=2 ? G.green : G.red }}>
                    Total: {setupPctTotal}% {Math.abs(setupPctTotal-100)>2 ? " -  må være 100%!" : ""}
                  </div>
                  <button className="btn-sm btn-ghost" onClick={addSetupRow}>+ Legg til måltid</button>
                </div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button className="btn btn-lime" onClick={saveSetup} style={{ opacity:Math.abs(setupPctTotal-100)<=2?1:0.4 }}>Lagre og oppdater måltider</button>
                <button className="btn btn-ghost" onClick={() => setShowSetup(false)}>Avbryt</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meal type tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:14, overflowX:"auto", paddingBottom:2 }}>
        {mealTypes.map(mt => {
          const cnt = (mealOptions[mt.id]||[]).length;
          const target = mealCalTargets[mt.id]||0;
          return (
            <button key={mt.id} className={"chip"+(activeMT===mt.id?" active":"")} onClick={() => setActiveMealType(mt.id)}>
              {mt.label} {target>0?target+"kcal":""} {cnt>0?"("+cnt+")":""}
            </button>
          );
        })}
      </div>

      {activeMT && (
        <div style={{ background:darkBanner(), border:"1px solid "+G.lime+"22", borderRadius:10, padding:"10px 14px", marginBottom:14 }}>
          <div style={{ fontSize:12, color:G.lime, fontWeight:600, marginBottom:2 }}>{activeTypeName}  -  kalorimål</div>
          <div style={{ fontSize:22, fontWeight:800, color:G.lime }}>{mealCalTargets[activeMT]||0} <span style={{ fontSize:13, color:G.muted, fontWeight:400 }}>kcal</span></div>
          <div style={{ fontSize:11, color:G.dim, marginTop:2 }}>Din treners anbefaling for dette måltidet</div>
        </div>
      )}

      <div className="col" style={{ gap:10 }}>
        {activeMeals.length===0 && <div style={{ textAlign:"center", padding:30, color:G.muted }}>Ingen {activeTypeName.toLowerCase()} lagt til ennå</div>}
        {activeMeals.map(meal => (
          <MealCard key={meal.id} meal={meal} isTrainer={isTrainer} calTarget={mealCalTargets[activeMT]||0}
            onUpdate={u => updateMeal(meal.id,u)} onDelete={() => deleteMeal(meal.id)} onEdit={() => setEditMealId(meal.id)} />
        ))}
      </div>

      {isTrainer && (
        <div style={{ marginTop:12 }}>
          <button className="btn btn-lime" onClick={() => setShowAddMeal(true)}>+ Legg til {activeTypeName.toLowerCase()}</button>
        </div>
      )}

      {showAddMeal && <MealEditorModal mealType={activeMT} mealTypeName={activeTypeName} calTarget={mealCalTargets[activeMT]||0} onSave={addMeal} onClose={() => setShowAddMeal(false)} />}
      {editMealId && <MealEditorModal meal={activeMeals.find(m => m.id===editMealId)} mealType={activeMT} mealTypeName={activeTypeName} calTarget={mealCalTargets[activeMT]||0} onSave={u => { updateMeal(editMealId,u); setEditMealId(null); }} onClose={() => setEditMealId(null)} />}
      {showCopyModal && <CopyPlanModal clients={clients} sourceId={client.id} onCopy={copyPlan} onClose={() => setShowCopyModal(false)} />}
    </div>
  );
}

const darkBanner = () => G.bg === "#0a0a0a" ? "#0d1a00" : "#f0f8e8";

// ============================================================
// MEAL CARD (with image support)
// ============================================================
function MealCard({ meal, isTrainer, calTarget, onUpdate, onDelete, onEdit }) {
  const [open, setOpen] = useState(false);
  const [editKcal, setEditKcal] = useState(false);
  const [kcalDraft, setKcalDraft] = useState("");

  const saveKcal = () => {
    const target = Math.max(50, +kcalDraft);
    const current = meal.macros && meal.macros.kcal ? meal.macros.kcal : 1;
    const ratio = current>0 ? target/current : 1;
    const si = (meal.structuredItems||[]).map(i => ({...i, grams:Math.max(1,Math.round((i.grams||0)*ratio))}));
    onUpdate({ ...meal, structuredItems:si, macros:calcMacros(si) });
    setEditKcal(false);
  };

  const kcal = meal.macros ? meal.macros.kcal : 0;
  const p = meal.macros ? meal.macros.protein : 0;
  const carb = meal.macros ? meal.macros.carbs : 0;
  const fat = meal.macros ? meal.macros.fat : 0;
  const diff = calTarget>0 ? kcal-calTarget : 0;

  return (
    <div className="card" style={{ padding:0, overflow:"hidden" }}>
      {meal.imgUrl && (
        <div style={{ height:140, overflow:"hidden", borderRadius:"13px 13px 0 0" }}>
          <img src={meal.imgUrl} alt={meal.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e => { e.target.style.display="none"; }} />
        </div>
      )}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 15px", cursor:"pointer" }} onClick={() => setOpen(!open)}>
        <div>
          <div style={{ fontSize:14, fontWeight:600 }}>{meal.name} <span style={{ fontSize:11, color:G.muted, fontWeight:400 }}>{meal.time}</span></div>
          <div style={{ fontSize:11, color:G.muted, marginTop:1 }}>{(meal.structuredItems||[]).length} ingredienser</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {isTrainer && editKcal ? (
            <div style={{ display:"flex", alignItems:"center", gap:4 }} onClick={e => e.stopPropagation()}>
              <input style={{ width:70, textAlign:"center", fontWeight:800, color:G.lime, fontSize:14 }} type="number" value={kcalDraft} autoFocus
                onChange={e => setKcalDraft(e.target.value)}
                onKeyDown={e => { if(e.key==="Enter") saveKcal(); if(e.key==="Escape") setEditKcal(false); }} />
              <span style={{ fontSize:11, color:G.dim }}>kcal</span>
              <button className="btn-sm btn-lime" onClick={saveKcal}>Lagre</button>
              <button className="btn-icon" onClick={() => setEditKcal(false)}>Avbryt</button>
            </div>
          ) : (
            <div style={{ textAlign:"right", cursor:isTrainer?"pointer":"default" }}
              onClick={isTrainer ? e => { e.stopPropagation(); setEditKcal(true); setKcalDraft(kcal); } : undefined}>
              <div style={{ fontSize:15, fontWeight:800, color:G.lime }}>{kcal} <span style={{ fontSize:10, color:G.dim }}>kcal</span></div>
              <div style={{ fontSize:10, color:G.dim }}>{p}p  -  {carb}k  -  {fat}f</div>
              {calTarget>0 && <div style={{ fontSize:10, color:Math.abs(diff)<50?G.green:G.orange }}>{diff===0?"På mål":(diff>0?"+"+diff:diff)+" kcal"}</div>}
            </div>
          )}
          {isTrainer && (
            <div style={{ display:"flex", gap:4 }}>
              <button className="btn-icon" onClick={e => { e.stopPropagation(); onEdit(); }}>Rediger</button>
              <button className="btn-icon" style={{ color:G.red, borderColor:"#ff3c3c44" }} onClick={e => { e.stopPropagation(); onDelete(); }}>Slett</button>
            </div>
          )}
          <span style={{ color:G.dim, fontSize:13 }}>{open?"^":"v"}</span>
        </div>
      </div>
      {open && (
        <div style={{ borderTop:"1px solid "+G.border }}>
          {(meal.structuredItems||[]).map((item, i) => {
            const iK = Math.round((item.kcalPer100||0)*item.grams/100);
            return (
              <div key={item.id||i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 15px", borderBottom:"1px solid "+G.border }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:500 }}>{item.name}</div>
                  <div style={{ fontSize:10, color:G.dim }}>{iK} kcal</div>
                </div>
                <div style={{ fontSize:13, fontWeight:700 }}>{item.grams}g</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================
// MEAL EDITOR MODAL (with image URL input)
// ============================================================
function MealEditorModal({ meal, mealType, mealTypeName, calTarget, onSave, onClose, customFoods, setCustomFoods }) {
  const defTime = { frokost:"07:00", lunsj:"12:00", snack:"15:00", middag:"18:00", kvelds:"21:00" };
  const [name, setName] = useState(meal ? meal.name : "");
  const [time, setTime] = useState(meal ? meal.time : defTime[mealType]||"");
  const [imgUrl, setImgUrl] = useState(meal ? meal.imgUrl||"" : "");
  const [items, setItems] = useState(meal ? meal.structuredItems||[] : []);
  const [recipeSteps, setRecipeSteps] = useState(meal ? meal.recipeSteps||[""] : [""]);
  const [recipeTips, setRecipeTips] = useState(meal ? meal.recipeTips||"" : "");
  const [searchQ, setSearchQ] = useState("");
  const [selFood, setSelFood] = useState(null);
  const [amount, setAmount] = useState(100);
  const [usePiece, setUsePiece] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manual, setManual] = useState({ name:"", grams:100, kcal:0, protein:0, carbs:0, fat:0 });
  const [editItemIdx, setEditItemIdx] = useState(null);
  const searchRef = useRef(null);
  const [showCustomFoodMgr, setShowCustomFoodMgr] = useState(false);

  const allFoods = [...FOOD_DB, ...(customFoods||[]).map(f => ({...f, isCustom:true}))];
  const filtered = (() => {
    const q = searchQ.toLowerCase().trim();
    if (!q) return allFoods.slice(0,12);
    return allFoods.filter(f => f.name.toLowerCase().includes(q)).slice(0,25);
  })();

  const gramsForAmount = () => selFood && usePiece && selFood.perPiece ? Math.round(amount*(selFood.gPerUnit||1)) : +amount;

  const previewMacros = () => {
    if (!selFood) return null;
    const g = gramsForAmount();
    return { kcal:Math.round(selFood.kcal*g/100), protein:Math.round(selFood.protein*g/100), carbs:Math.round(selFood.carbs*g/100), fat:Math.round(selFood.fat*g/100) };
  };

  const addFood = () => {
    if (!selFood) return;
    const g = gramsForAmount();
    setItems(prev => [...prev, { id:uid(), name:selFood.name, grams:g, kcalPer100:selFood.kcal, proteinPer100:selFood.protein, carbsPer100:selFood.carbs, fatPer100:selFood.fat, perPiece:false }]);
    setSelFood(null); setSearchQ(""); setAmount(100); setUsePiece(false);
    setTimeout(() => searchRef.current && searchRef.current.focus(), 50);
  };

  const addManual = () => {
    if (!manual.name) return;
    setItems(prev => [...prev, { id:uid(), name:manual.name, grams:+manual.grams, kcalPer100:+manual.kcal, proteinPer100:+manual.protein, carbsPer100:+manual.carbs, fatPer100:+manual.fat, perPiece:false }]);
    setManual({ name:"", grams:100, kcal:0, protein:0, carbs:0, fat:0 });
  };

  const saveToCustomFoods = () => {
    if (!manual.name || !setCustomFoods) return;
    const newFood = { id:uid(), name:manual.name, cat:"Egendefinert", kcal:+manual.kcal, protein:+manual.protein, carbs:+manual.carbs, fat:+manual.fat, isCustom:true };
    setCustomFoods(prev => {
      if (prev.some(f => f.name.toLowerCase()===manual.name.toLowerCase())) return prev;
      return [...prev, newFood];
    });
  };

  const removeItem = idx => setItems(prev => prev.filter((_,j) => j!==idx));
  const updateGrams = (idx, g) => setItems(prev => prev.map((x,j) => j===idx ? {...x,grams:Math.max(1,+g)} : x));

  const macros = calcMacros(items);
  const pm = previewMacros();
  const kcalDiff = calTarget>0 ? macros.kcal-calTarget : 0;

  const handleSave = () => {
    if (!name) return;
    const cleanSteps = recipeSteps.filter(s => s.trim());
    onSave({ ...(meal||{}), id:meal?meal.id:uid(), name, time, mealType, imgUrl, structuredItems:items, macros, recipeSteps:cleanSteps, recipeTips });
  };

  return (
    <>
    {showCustomFoodMgr && <CustomFoodManager customFoods={customFoods} setCustomFoods={setCustomFoods} onClose={() => setShowCustomFoodMgr(false)} />}
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"flex-start", justifyContent:"center", zIndex:300, padding:16, overflowY:"auto" }}>
      <div style={{ width:"100%", maxWidth:600, marginTop:20 }}>
        <div className="card col" style={{ gap:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ fontFamily:"'Bebas Neue'", fontSize:20, letterSpacing:2 }}>
              {meal?"REDIGER":"NYTT"} {(mealTypeName||mealType).toUpperCase()}
              {calTarget>0 && <span style={{ fontSize:13, color:G.lime, marginLeft:8, fontFamily:"'DM Sans'", fontWeight:400 }}>Mål: {calTarget} kcal</span>}
            </div>
            <div style={{ display:"flex", gap:6 }}>
              {setCustomFoods && <button className="btn-ghost btn-sm" style={{ fontSize:11 }} onClick={() => setShowCustomFoodMgr(true)}>Egne matvarer</button>}
              <button className="btn-icon" onClick={onClose}>Lukk</button>
            </div>
          </div>

          {items.length>0 && (
            <div style={{ background:G.bg3, borderRadius:8, padding:"10px 12px" }}>
              <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                {[{l:"Kcal",v:macros.kcal,c:G.lime},{l:"Protein",v:macros.protein+"g",c:G.blue},{l:"Karbs",v:macros.carbs+"g",c:G.orange},{l:"Fett",v:macros.fat+"g",c:G.green}].map(({l,v,c}) => (
                  <div key={l} style={{ textAlign:"center" }}>
                    <div style={{ fontSize:16, fontWeight:800, color:c }}>{v}</div>
                    <div style={{ fontSize:9, color:G.dim }}>{l}</div>
                  </div>
                ))}
                {calTarget>0 && <div style={{ fontSize:12, color:Math.abs(kcalDiff)<50?G.green:G.orange, alignSelf:"center", fontWeight:600 }}>
                  {Math.abs(kcalDiff)<50?"På mål!":(kcalDiff>0?"+"+kcalDiff:kcalDiff)+" kcal fra mål"}
                </div>}
              </div>
            </div>
          )}

          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            <div className="col" style={{ flex:1, minWidth:140 }}>
              <span className="lbl">NAVN På MåLTIDET</span>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="f.eks. Havregryn m/egg" autoFocus />
            </div>
            <div className="col">
              <span className="lbl">TIDSPUNKT</span>
              <input style={{ width:80 }} value={time} onChange={e => setTime(e.target.value)} placeholder="07:00" />
            </div>
          </div>

          <div className="col">
            <span className="lbl">BILDE URL (valgfritt)</span>
            <input value={imgUrl} onChange={e => setImgUrl(e.target.value)} placeholder="https://eksempel.com/bilde.jpg" />
            {imgUrl && (
              <div style={{ height:80, overflow:"hidden", borderRadius:6, marginTop:4 }}>
                <img src={imgUrl} alt="Forhåndsvisning" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e => { e.target.style.display="none"; }} />
              </div>
            )}
          </div>

          <div className="col">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
              <span className="lbl">TILBEREDNING  -  STEG FOR STEG</span>
              <button className="btn-sm btn-ghost" onClick={() => setRecipeSteps(s => [...s, ""])}>+ Steg</button>
            </div>
            {recipeSteps.map((step, i) => (
              <div key={i} style={{ display:"flex", gap:6, alignItems:"flex-start" }}>
                <div style={{ minWidth:22, height:22, borderRadius:"50%", background:G.lime+"33", border:"1px solid "+G.lime+"55", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:G.lime, flexShrink:0, marginTop:6 }}>{i+1}</div>
                <input value={step} onChange={e => setRecipeSteps(s => s.map((x,j) => j===i ? e.target.value : x))} placeholder={"Steg "+(i+1)+": f.eks. Kok opp vann..."} style={{ flex:1 }} />
                {recipeSteps.length > 1 && (
                  <button className="btn-icon" style={{ color:G.red, marginTop:4 }} onClick={() => setRecipeSteps(s => s.filter((_,j) => j!==i))}>x</button>
                )}
              </div>
            ))}
          </div>

          <div className="col">
            <span className="lbl">TIPS OG TRIKS (valgfritt)</span>
            <textarea value={recipeTips} onChange={e => setRecipeTips(e.target.value)} rows={2}
              placeholder="F.eks: Kan lages kvelden før. Bytt ut brokkoli med spinat om du vil..." style={{ resize:"vertical" }} />
          </div>

          {items.length>0 && (
            <div>
              <div className="lbl" style={{ marginBottom:8 }}>INGREDIENSER ({items.length})</div>
              {items.map((item, i) => {
                const iK = Math.round((item.kcalPer100||0)*item.grams/100);
                return (
                  <div key={item.id||i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:"1px solid "+G.border }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13 }}>{item.name}</div>
                      <div style={{ fontSize:10, color:G.dim }}>{iK} kcal</div>
                    </div>
                    {editItemIdx===i ? (
                      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                        <input style={{ width:65, textAlign:"center" }} type="number" value={item.grams} onChange={e => updateGrams(i,e.target.value)} autoFocus onKeyDown={e => e.key==="Enter"&&setEditItemIdx(null)} />
                        <span style={{ fontSize:11, color:G.dim }}>g</span>
                        <button className="btn-icon" onClick={() => setEditItemIdx(null)}>Ferdig</button>
                      </div>
                    ) : (
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{ fontSize:13, fontWeight:700 }}>{item.grams}g</span>
                        <button className="btn-icon" onClick={() => setEditItemIdx(i)}>Rediger</button>
                        <button className="btn-icon" style={{ color:G.red }} onClick={() => removeItem(i)}>Fjern</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="inset">
            <div style={{ display:"flex", gap:6, marginBottom:10 }}>
              <button className={"btn-sm"+(!manualMode?" btn-lime":" btn-ghost")} onClick={() => setManualMode(false)}>Søk i database</button>
              <button className={"btn-sm"+(manualMode?" btn-lime":" btn-ghost")} onClick={() => setManualMode(true)}>Manuell innlegging</button>
            </div>

            {!manualMode && (
              <div>
                <input ref={searchRef} value={searchQ} onChange={e => { setSearchQ(e.target.value); if(selFood && e.target.value!==selFood.name) setSelFood(null); }} placeholder="Søk matvare..." style={{ marginBottom:8 }} />
                {!selFood && searchQ && (
                  <div style={{ maxHeight:160, overflowY:"auto", border:"1px solid "+G.border, borderRadius:8, marginBottom:8 }}>
                    {filtered.map((f,i) => (
                      <div key={i} onClick={() => { setSelFood(f); setSearchQ(f.name); setUsePiece(!!f.perPiece); setAmount(f.perPiece?1:100); }}
                        style={{ padding:"7px 12px", cursor:"pointer", borderBottom:i<filtered.length-1?"1px solid "+G.bg3:"none", display:"flex", justifyContent:"space-between" }}
                        onMouseOver={e => e.currentTarget.style.background=G.bg3} onMouseOut={e => e.currentTarget.style.background="transparent"}>
                        <span style={{ fontSize:12 }}>{f.name} <span style={{ fontSize:10, color:G.dim }}>{f.cat}</span></span>
                        <span style={{ fontSize:11, color:G.dim }}>{f.kcal}kcal/100g</span>
                      </div>
                    ))}
                  </div>
                )}
                {selFood && (
                  <div style={{ background:G.bg3, borderRadius:8, padding:"10px 12px", marginBottom:8 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                      <span style={{ fontSize:13, fontWeight:700, color:G.lime }}>{selFood.name}</span>
                      <button className="btn-icon" onClick={() => { setSelFood(null); setSearchQ(""); }}>Fjern</button>
                    </div>
                    {selFood.perPiece && (
                      <div style={{ display:"flex", gap:6, marginBottom:8 }}>
                        <button className={"btn-sm"+(!usePiece?" btn-lime":" btn-ghost")} style={{ fontSize:11 }} onClick={() => { setUsePiece(false); setAmount(selFood.gPerUnit||100); }}>gram</button>
                        <button className={"btn-sm"+(usePiece?" btn-lime":" btn-ghost")} style={{ fontSize:11 }} onClick={() => { setUsePiece(true); setAmount(1); }}>stk</button>
                      </div>
                    )}
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8, flexWrap:"wrap" }}>
                      <button className="btn-icon" onClick={() => setAmount(a => Math.max(usePiece?0.5:5,+a-(usePiece?0.5:5)))}>-</button>
                      <input style={{ width:70, textAlign:"center", fontWeight:700 }} type="number" value={amount} onChange={e => setAmount(+e.target.value)} />
                      <span style={{ fontSize:12, color:G.dim }}>{usePiece?"stk":"g"}</span>
                      <button className="btn-icon" onClick={() => setAmount(a => +a+(usePiece?0.5:5))}>+</button>
                      <input type="range" min={usePiece?0.5:5} max={usePiece?10:500} step={usePiece?0.5:5} value={amount} onChange={e => setAmount(+e.target.value)} style={{ flex:1, minWidth:80 }} />
                      {usePiece && <span style={{ fontSize:11, color:G.dim }}>= {gramsForAmount()}g</span>}
                    </div>
                    {pm && (
                      <div style={{ display:"flex", gap:14, marginBottom:10 }}>
                        {[{l:"Kcal",v:pm.kcal,c:G.lime},{l:"P",v:pm.protein+"g",c:G.blue},{l:"K",v:pm.carbs+"g",c:G.orange},{l:"F",v:pm.fat+"g",c:G.green}].map(({l,v,c}) => (
                          <div key={l} style={{ textAlign:"center" }}>
                            <div style={{ fontSize:14, fontWeight:800, color:c }}>{v}</div>
                            <div style={{ fontSize:9, color:G.dim }}>{l}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    <button className="btn btn-lime btn-sm" onClick={addFood}>+ Legg til ingrediens</button>
                  </div>
                )}
              </div>
            )}

            {manualMode && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, alignItems:"flex-end" }}>
                <div className="col" style={{ flex:2, minWidth:140 }}>
                  <span className="lbl">NAVN</span>
                  <input value={manual.name} onChange={e => setManual(m => ({...m,name:e.target.value}))} autoFocus />
                </div>
                {[["GRAM","grams",65],["KCAL/100G","kcal",75],["P/100G","protein",60],["K/100G","carbs",60],["F/100G","fat",60]].map(([l,k,w]) => (
                  <div key={k} className="col">
                    <span className="lbl">{l}</span>
                    <input style={{ width:w }} type="number" value={manual[k]} onChange={e => setManual(m => ({...m,[k]:e.target.value}))} />
                  </div>
                ))}
                <button className="btn btn-lime btn-sm" onClick={addManual} style={{ opacity:manual.name?1:0.4 }}>+ Legg til</button>
                {manual.name && setCustomFoods && (
                  <button className="btn-ghost btn-sm" style={{ fontSize:11 }}
                    onClick={() => { saveToCustomFoods(); }}>Lagre i database</button>
                )}
              </div>
            )}
          </div>

          <div style={{ display:"flex", gap:8 }}>
            <button className="btn btn-lime" onClick={handleSave} style={{ opacity:name&&items.length>0?1:0.4 }}>
              {meal ? "Oppdater måltid" : "Lagre måltid"}
            </button>
            <button className="btn btn-ghost" onClick={onClose}>Avbryt</button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

// ============================================================
// CLIENT MEALS VIEW
// ============================================================
function ClientMealsView({ client, updateClient }) {
  const [activeMealType, setActiveMealType] = useState(null);
  const mp = client.mealPlan || makeDefaultPlan();
  const mealTypes = mp.mealTypes || DEFAULT_MEAL_TYPES;
  const mealOptions = mp.mealOptions || {};
  const mealCalTargets = mp.mealCalTargets || buildDefaultTargets(mealTypes, mp.calories||2800);
  const activeSelections = mp.activeSelections || {};
  const effectiveActive = activeMealType || (mealTypes[0] && mealTypes[0].id);

  const selectMeal = mealId => {
    updateClient(client.id, c => ({ ...c, mealPlan:{ ...c.mealPlan, activeSelections:{ ...(c.mealPlan.activeSelections||{}), [effectiveActive]:mealId } } }));
  };

  const favs = mp.favoriteMeals || [];
  const isFav = mealId => favs.includes(mealId);
  const toggleFav = mealId => {
    updateClient(client.id, c => {
      const f = c.mealPlan.favoriteMeals || [];
      const newFavs = f.includes(mealId) ? f.filter(id => id!==mealId) : [...f, mealId];
      return { ...c, mealPlan:{ ...c.mealPlan, favoriteMeals:newFavs } };
    });
  };
  const [showFavsOnly, setShowFavsOnly] = useState(false);

  const totals = mealTypes.reduce((acc,mt) => {
    const opts = mealOptions[mt.id]||[];
    const sel = opts.find(m => m.id===activeSelections[mt.id]) || opts[0];
    if (!sel || !sel.macros) return acc;
    return { kcal:acc.kcal+sel.macros.kcal, protein:acc.protein+sel.macros.protein, carbs:acc.carbs+sel.macros.carbs, fat:acc.fat+sel.macros.fat };
  }, { kcal:0, protein:0, carbs:0, fat:0 });
  const totalKcal = totals.kcal;
  const totalProtein = totals.protein;
  const totalCarbs = totals.carbs;
  const totalFat = totals.fat;
  const targetCal = mp.calories||2800;
  const diff = totalKcal - targetCal;

  return (
    <div>
      <div className="card" style={{ marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
          <div>
            <div className="lbl" style={{ marginBottom:4 }}>MIT DAGSTOTAL</div>
            <div style={{ fontSize:24, fontWeight:800, color:G.lime }}>{totalKcal} <span style={{ fontSize:13, color:G.muted, fontWeight:400 }}>/ {targetCal} kcal</span></div>
            <div style={{ display:"flex", gap:10, marginTop:4, flexWrap:"wrap" }}>
              {[
                { label:"Protein", val:totalProtein, goal:mp.protein||0, color:G.blue },
                { label:"Karbs", val:totalCarbs, goal:mp.carbs||0, color:G.orange },
                { label:"Fett", val:totalFat, goal:mp.fat||0, color:G.green },
              ].map(({ label, val, goal, color }) => (
                <div key={label} style={{ fontSize:11 }}>
                  <span style={{ color, fontWeight:700 }}>{val}g</span>
                  <span style={{ color:G.dim }}> / {goal}g {label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ fontSize:12, color:Math.abs(diff)<100?G.green:G.orange, fontWeight:600 }}>
            {Math.abs(diff)<100 ? "På mål!" : (diff<0?diff+" kcal":"+"+diff+" kcal")}
          </div>
        </div>
        <div style={{ height:6, background:G.bg3, borderRadius:3, marginBottom:12 }}>
          <div style={{ height:"100%", background:totalKcal>targetCal?G.red:G.lime, borderRadius:3, width:Math.min(100,Math.round(totalKcal/(targetCal||1)*100))+"%" }} />
        </div>
        <div className="lbl" style={{ marginBottom:8 }}>DITT MåLTIDSPROGRAM</div>
        <div className="col" style={{ gap:5 }}>
          {mealTypes.map(mt => {
            const target = mealCalTargets[mt.id]||0;
            const opts = mealOptions[mt.id]||[];
            const sel = opts.find(m => m.id===activeSelections[mt.id]) || opts[0];
            const actual = sel&&sel.macros ? sel.macros.kcal : 0;
            return (
              <div key={mt.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:12 }}>
                <span style={{ color:effectiveActive===mt.id?G.lime:G.text, fontWeight:effectiveActive===mt.id?700:400 }}>{mt.label}</span>
                <div style={{ display:"flex", gap:8 }}>
                  <span style={{ color:G.lime, fontWeight:700 }}>{actual>0?actual:target}</span>
                  <span style={{ color:G.dim }}>/ {target} kcal</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display:"flex", gap:6, marginBottom:8, overflowX:"auto", paddingBottom:2 }}>
        {mealTypes.map(mt => {
          const opts = mealOptions[mt.id]||[];
          const sel = opts.find(m => m.id===activeSelections[mt.id]) || opts[0];
          const selKcal = sel&&sel.macros ? sel.macros.kcal : 0;
          const target = mealCalTargets[mt.id]||0;
          return (
            <button key={mt.id} className={"chip"+(effectiveActive===mt.id?" active":"")} onClick={() => setActiveMealType(mt.id)}>
              {mt.label} {selKcal>0?selKcal+"kcal":target+"kcal mål"}
            </button>
          );
        })}
      </div>
      <div style={{ display:"flex", gap:6, marginBottom:14 }}>
        <button className={"chip"+(showFavsOnly?" active":"")} onClick={() => setShowFavsOnly(f => !f)}>
          * Favoritter {favs.length>0?"("+favs.length+")":""}
        </button>
      </div>

      {(() => {
        let activeMeals = mealOptions[effectiveActive]||[];
        if (showFavsOnly) activeMeals = activeMeals.filter(m => isFav(m.id));
        const selectedMealId = activeSelections[effectiveActive]||null;
        if (!activeMeals.length) return <div style={{ textAlign:"center", padding:40, color:G.muted }}>Trener har ikke lagt til forslag ennå</div>;
        return (
          <div>
            <div className="lbl" style={{ marginBottom:8 }}>VELG DITT {(mealTypes.find(m => m.id===effectiveActive)||{}).label||""}  -  {activeMeals.length} FORSLAG</div>
            <div className="col" style={{ gap:8 }}>
              {activeMeals.map(meal => {
                const isSel = meal.id===selectedMealId || (activeMeals.length===1 && !selectedMealId);
                return (
                  <div key={meal.id} className="card" style={{ borderColor:isSel?G.lime+"66":G.border, cursor:"pointer", padding:0, overflow:"hidden" }}
                    onClick={() => selectMeal(meal.id)}>
                    {meal.imgUrl && (
                      <div style={{ height:120, overflow:"hidden" }}>
                        <img src={meal.imgUrl} alt={meal.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e => e.target.style.display="none"} />
                      </div>
                    )}
                    <div style={{ padding:"12px 14px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                        <div>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            {isSel && <span style={{ fontSize:12, color:G.lime, fontWeight:700, background:G.lime+"22", border:"1px solid "+G.lime+"44", borderRadius:5, padding:"1px 7px" }}>Valgt</span>}
                            <span style={{ fontSize:14, fontWeight:600, color:isSel?G.lime:G.text }}>{meal.name}</span>
                            <button
                              onClick={e => { e.stopPropagation(); toggleFav(meal.id); }}
                              style={{ background:"none", border:"none", fontSize:18, cursor:"pointer", color:isFav(meal.id)?"#ffcc00":G.dim, lineHeight:1, padding:"0 2px" }}
                              title={isFav(meal.id) ? "Fjern favoritt" : "Legg til favoritt"}>
                              {isFav(meal.id) ? "*" : "o"}
                            </button>
                          </div>
                          <div style={{ fontSize:11, color:G.muted, marginTop:1 }}>{meal.time}</div>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontSize:16, fontWeight:800, color:G.lime }}>{meal.macros?meal.macros.kcal:0} kcal</div>
                          <div style={{ fontSize:10, color:G.dim }}>{meal.macros?meal.macros.protein:0}g protein</div>
                        </div>
                      </div>
                      <div style={{ marginBottom:8 }}>
                        <div className="lbl" style={{ marginBottom:5 }}>INGREDIENSER</div>
                        <div className="col" style={{ gap:4 }}>
                          {(meal.structuredItems||[]).map((item,i) => {
                            const iK = Math.round((item.kcalPer100||0)*item.grams/100);
                            const iP = Math.round((item.proteinPer100||0)*item.grams/100);
                            const iC = Math.round((item.carbsPer100||0)*item.grams/100);
                            const iF = Math.round((item.fatPer100||0)*item.grams/100);
                            return (
                              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:G.bg3, borderRadius:7, padding:"6px 10px" }}>
                                <div>
                                  <span style={{ fontSize:13, fontWeight:500 }}>{item.grams}g {item.name}</span>
                                  <div style={{ fontSize:10, color:G.dim }}>{iP}g p  -  {iC}g k  -  {iF}g f</div>
                                </div>
                                <span style={{ fontSize:12, fontWeight:700, color:G.lime }}>{iK} kcal</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      {(meal.recipeSteps||[]).length > 0 && (
                        <div style={{ marginTop:8 }}>
                          <div className="lbl" style={{ marginBottom:6 }}>TILBEREDNING</div>
                          <div className="col" style={{ gap:5 }}>
                            {meal.recipeSteps.map((step, si) => (
                              <div key={si} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                                <div style={{ minWidth:20, height:20, borderRadius:"50%", background:G.lime+"33", border:"1px solid "+G.lime+"55", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:G.lime, flexShrink:0, marginTop:1 }}>{si+1}</div>
                                <span style={{ fontSize:12, color:G.text, lineHeight:1.5 }}>{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {meal.recipeTips && (
                        <div style={{ marginTop:8, background:G.lime+"11", border:"1px solid "+G.lime+"22", borderRadius:7, padding:"7px 10px" }}>
                          <div className="lbl" style={{ marginBottom:3 }}>TIPS</div>
                          <div style={{ fontSize:12, color:G.text, lineHeight:1.5 }}>{meal.recipeTips}</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ============================================================
// SESSIONS TAB
// ============================================================
function SessionsTab({ client, updateClient, isTrainer }) {
  const [expandedId, setExpandedId] = useState(null);
  const sessions = (client.sessions||[]).slice().sort((a,b) => b.date.localeCompare(a.date));
  return (
    <div>
      <div style={{ marginBottom:16 }}>
        <div style={{ fontFamily:"'Bebas Neue'", fontSize:22, letterSpacing:1, color:G.lime }}>{OEU}KTLOGG</div>
        <div style={{ fontSize:12, color:G.muted }}>{sessions.length} fullførte økter totalt</div>
      </div>
      {!sessions.length ? (
        <div style={{ textAlign:"center", padding:60, color:G.muted }}>
          <div style={{ fontSize:14, marginBottom:4 }}>Ingen loggede økter ennå</div>
          <div style={{ fontSize:12 }}>Start en økt fra Trening-fanen</div>
        </div>
      ) : (
        <div className="col" style={{ gap:8 }}>
          {sessions.map(sess => {
            const isOpen = expandedId===sess.id;
            const totalSets = (sess.exercises||[]).reduce((s,e) => s+(e.sets?e.sets.filter(x=>x.done).length:0),0);
            const totalVol = (sess.exercises||[]).reduce((s,e) => s+(e.sets||[]).filter(x=>x.done&&x.weight&&x.reps).reduce((es,x) => es+(parseFloat(x.weight)||0)*(parseInt(x.reps)||0),0),0);
            return (
              <div key={sess.id} className="card" style={{ padding:0, overflow:"hidden" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 15px", cursor:"pointer" }} onClick={() => setExpandedId(isOpen?null:sess.id)}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14 }}>{sess.dayName}</div>
                    <div style={{ fontSize:11, color:G.muted, marginTop:1 }}>
                      {sess.date}  -  {totalSets} sett  -  {Math.round(totalVol)} kg volum
                    </div>
                    {sess.note && <div style={{ fontSize:11, color:G.lime+"88", marginTop:2, fontStyle:"italic" }}>"{sess.note}"</div>}
                  </div>
                  <span style={{ color:G.dim, fontSize:13 }}>{isOpen?"^":"v"}</span>
                </div>
                {isOpen && (
                  <div style={{ borderTop:"1px solid "+G.border }}>
                    {(sess.exercises||[]).map((ex,i) => {
                      const doneSets = (ex.sets||[]).filter(s => s.done&&s.weight&&s.reps);
                      if (!doneSets.length) return null;
                      const best = doneSets.reduce((b,s) => parseFloat(s.weight)>parseFloat(b.weight)?s:b, doneSets[0]);
                      const vol = doneSets.reduce((s,x) => s+(parseFloat(x.weight)||0)*(parseInt(x.reps)||0),0);
                      return (
                        <div key={i} style={{ padding:"10px 15px", borderBottom:"1px solid "+G.border }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                            <div style={{ fontWeight:600, fontSize:13 }}>{ex.name}</div>
                            <div style={{ textAlign:"right" }}>
                              <div style={{ fontSize:13, fontWeight:700, color:G.lime }}>Beste: {best.weight}kg x {best.reps} reps</div>
                              <div style={{ fontSize:10, color:G.dim }}>Volum: {Math.round(vol)} kg</div>
                            </div>
                          </div>
                          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:6 }}>
                            {doneSets.map((s,j) => (
                              <span key={j} style={{ background:G.bg2, border:"1px solid "+G.border2, borderRadius:5, fontSize:11, padding:"2px 8px", color:G.muted }}>
                                Sett {j+1}: {s.weight}kg x {s.reps} reps
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================
// WEEKLY TAB (with goal tracking)
// ============================================================
function WeeklyTab({ client, updateClient }) {
  const [bwInput, setBwInput] = useState("");
  const [goalForm, setGoalForm] = useState(null);
  const sessions = client.sessions||[];
  const bwLog = (client.bodyWeight||[]).slice().sort((a,b) => b.date.localeCompare(a.date));
  const lastBw = bwLog[0]||null;
  const prevBw = bwLog[1]||null;
  const goals = client.goals || { weightGoalKg:"", strengthGoals:[], customGoals:[] };

  const getWeeks = () => {
    const weeks = [];
    for (let i=0; i<4; i++) {
      const end = new Date(); end.setDate(end.getDate()-i*7);
      const start = new Date(end); start.setDate(end.getDate()-6);
      const ws = start.toISOString().split("T")[0];
      const we = end.toISOString().split("T")[0];
      const sessW = sessions.filter(s => s.date>=ws && s.date<=we);
      const vol = sessW.reduce((sum,sess) => sum+(sess.exercises||[]).reduce((es,ex) => es+(ex.sets||[]).filter(x=>x.done).reduce((ss,set) => ss+(parseFloat(set.weight)||0)*(parseInt(set.reps)||0),0),0),0);
      weeks.push({ ws, we, sessions:sessW.length, volume:Math.round(vol), label:i===0?"Denne uken":i===1?"Forrige uke":i+" uker siden" });
    }
    return weeks;
  };

  const weeks = getWeeks();
  const maxVol = Math.max(...weeks.map(w => w.volume),1);
  const totalDays = client.workoutPlan&&client.workoutPlan.days ? client.workoutPlan.days.length : 3;

  const addBw = () => {
    if (!bwInput) return;
    updateClient(client.id, c => ({ ...c, bodyWeight:[...(c.bodyWeight||[]),{ id:uid(), date:todayStr(), kg:+bwInput }] }));
    setBwInput("");
  };

  const saveGoals = () => {
    updateClient(client.id, c => ({ ...c, goals:goalForm }));
    setGoalForm(null);
  };

  const bestLifts = (() => {
    const map = {};
    (client.progressLog||[]).forEach(l => { if (!map[l.exercise]||l.weight>map[l.exercise].weight) map[l.exercise]={...l}; });
    return Object.values(map).sort((a,b) => b.weight-a.weight).slice(0,6);
  })();

  return (
    <div>
      <div style={{ fontFamily:"'Bebas Neue'", fontSize:22, letterSpacing:1, color:G.lime, marginBottom:16 }}>UKESRAPPORT</div>

      {/* Goals section */}
      <div className="card" style={{ marginBottom:14 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <div className="lbl">MåL OG FREMGANG</div>
          <button className="btn-icon" onClick={() => setGoalForm(JSON.parse(JSON.stringify(goals)))}>Rediger mål</button>
        </div>

        {goalForm && (
          <div className="inset col" style={{ gap:10, marginBottom:12 }}>
            <div className="col">
              <span className="lbl">KROPPSVEKTMåL (KG)</span>
              <input type="number" step="0.1" value={goalForm.weightGoalKg} onChange={e => setGoalForm(f => ({...f,weightGoalKg:e.target.value}))} placeholder="f.eks. 75" />
            </div>
            <div>
              <div className="lbl" style={{ marginBottom:6 }}>STYRKEMåL</div>
              {(goalForm.strengthGoals||[]).map((sg,i) => (
                <div key={i} style={{ display:"flex", gap:6, marginBottom:6 }}>
                  <input style={{ flex:1 }} value={sg.exercise} onChange={e => setGoalForm(f => ({...f,strengthGoals:f.strengthGoals.map((g,j) => j===i?{...g,exercise:e.target.value}:g)}))} placeholder="+OE+velse" />
                  <input style={{ width:80 }} type="number" value={sg.targetKg} onChange={e => setGoalForm(f => ({...f,strengthGoals:f.strengthGoals.map((g,j) => j===i?{...g,targetKg:+e.target.value}:g)}))} placeholder="kg" />
                  <button className="btn-icon" style={{ color:G.red }} onClick={() => setGoalForm(f => ({...f,strengthGoals:f.strengthGoals.filter((_,j) => j!==i)}))}>Fjern</button>
                </div>
              ))}
              <button className="btn-sm btn-ghost" onClick={() => setGoalForm(f => ({...f,strengthGoals:[...(f.strengthGoals||[]),{exercise:"",targetKg:""}]}))}>+ Styrkemål</button>
            </div>
            <div>
              <div className="lbl" style={{ marginBottom:6 }}>EGENDEFINERTE MåL</div>
              {(goalForm.customGoals||[]).map((cg,i) => (
                <div key={i} style={{ display:"flex", gap:6, marginBottom:6 }}>
                  <input style={{ flex:1 }} value={cg.label} onChange={e => setGoalForm(f => ({...f,customGoals:f.customGoals.map((g,j) => j===i?{...g,label:e.target.value}:g)}))} placeholder="Beskrivelse av mål" />
                  <button className="btn-icon" style={{ color:G.red }} onClick={() => setGoalForm(f => ({...f,customGoals:f.customGoals.filter((_,j) => j!==i)}))}>Fjern</button>
                </div>
              ))}
              <button className="btn-sm btn-ghost" onClick={() => setGoalForm(f => ({...f,customGoals:[...(f.customGoals||[]),{label:"",done:false}]}))}>+ Eget mål</button>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn btn-lime" onClick={saveGoals}>Lagre mål</button>
              <button className="btn btn-ghost" onClick={() => setGoalForm(null)}>Avbryt</button>
            </div>
          </div>
        )}

        {/* Weight goal */}
        {goals.weightGoalKg && (
          <div style={{ marginBottom:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:4 }}>
              <span style={{ fontWeight:600 }}>Kroppsvekt: mål {goals.weightGoalKg} kg</span>
              <span style={{ color:G.blue, fontWeight:700 }}>{lastBw ? lastBw.kg+" kg nå" : "Ikke logget"}</span>
            </div>
            {lastBw && (() => {
              const start = parseFloat(client.weight)||80;
              const target = parseFloat(goals.weightGoalKg);
              const current = lastBw.kg;
              const pct = Math.max(0,Math.min(100,Math.round((1-Math.abs(current-target)/Math.max(0.1,Math.abs(start-target)))*100)));
              return (
                <div>
                  <div style={{ height:6, background:G.bg3, borderRadius:3 }}>
                    <div style={{ height:"100%", background:G.blue, borderRadius:3, width:pct+"%" }} />
                  </div>
                  <div style={{ fontSize:10, color:G.dim, marginTop:2 }}>{pct}% av veien mot målet</div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Strength goals */}
        {(goals.strengthGoals||[]).length > 0 && (
          <div>
            <div className="lbl" style={{ marginBottom:8 }}>STYRKEMåL</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:8 }}>
              {(goals.strengthGoals||[]).map((sg,i) => {
                const best = (client.progressLog||[]).filter(l => l.exercise===sg.exercise).sort((a,b) => b.weight-a.weight)[0];
                const pct = best&&sg.targetKg ? Math.min(100,Math.round(best.weight/sg.targetKg*100)) : 0;
                return (
                  <div key={i} style={{ background:G.bg2, border:"1px solid "+G.border, borderRadius:9, padding:"10px 12px" }}>
                    <div style={{ fontSize:12, fontWeight:600, marginBottom:2 }}>{sg.exercise}</div>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                      <span style={{ color:G.muted }}>Nå: {best?best.weight+"kg":" - "}</span>
                      <span style={{ color:G.lime, fontWeight:700 }}>Mål: {sg.targetKg}kg</span>
                    </div>
                    <div style={{ height:4, background:G.bg3, borderRadius:2 }}>
                      <div style={{ height:"100%", background:G.lime, borderRadius:2, width:pct+"%" }} />
                    </div>
                    <div style={{ fontSize:10, color:G.dim, marginTop:2 }}>{pct}% av målet</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!goals.weightGoalKg && !(goals.strengthGoals||[]).length && !goalForm && (
          <div style={{ color:G.muted, fontSize:12 }}>Ingen mål satt ennå. Klikk Rediger mål for å legge til.</div>
        )}
      </div>

      {/* Weekly activity */}
      <div className="card" style={{ marginBottom:14 }}>
        <div className="lbl" style={{ marginBottom:14 }}>UKEOVERSIKT</div>
        {weeks.map((w,i) => (
          <div key={i} style={{ marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
              <span style={{ fontWeight:600, color:i===0?G.lime:G.text }}>{w.label}</span>
              <span style={{ color:G.muted }}>{w.sessions} dager trent  -  {w.volume.toLocaleString("no-NO")} kg volum</span>
            </div>
            <div style={{ display:"flex", gap:4, marginBottom:4 }}>
              {Array.from({length:totalDays}).map((_,di) => (
                <div key={di} style={{ width:20, height:8, borderRadius:2, background:di<w.sessions?G.lime:G.bg3 }} />
              ))}
            </div>
            <div style={{ height:4, background:G.bg3, borderRadius:2 }}>
              <div style={{ height:"100%", background:i===0?G.lime:G.blue+"88", borderRadius:2, width:Math.round(w.volume/maxVol*100)+"%" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Body weight */}
      <div className="card" style={{ marginBottom:14 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <div>
            <div className="lbl" style={{ marginBottom:4 }}>KROPPSVEKT</div>
            <div style={{ fontSize:22, fontWeight:800, color:G.blue }}>{lastBw ? lastBw.kg+" kg" : " - "}</div>
            {lastBw&&prevBw && <div style={{ fontSize:12, color:lastBw.kg>prevBw.kg?G.orange:G.green, marginTop:2 }}>{lastBw.kg>prevBw.kg?"Opp":"Ned"} {Math.abs(lastBw.kg-prevBw.kg).toFixed(1)} kg siden forrige måling</div>}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <input style={{ width:75 }} type="number" step="0.1" value={bwInput} onChange={e => setBwInput(e.target.value)} onKeyDown={e => e.key==="Enter"&&addBw()} placeholder="kg" />
            <button className="btn btn-lime btn-sm" onClick={addBw}>Logg vekt</button>
          </div>
        </div>
        {bwLog.length>1 && (() => {
          const pts = bwLog.slice(0,8).reverse();
          const min = Math.min(...pts.map(p=>p.kg)); const max = Math.max(...pts.map(p=>p.kg));
          const range = max-min||1; const W=280, H=50;
          const coords = pts.map((p,i) => { const x=Math.round(i/Math.max(pts.length-1,1)*(W-10)+5); const y=Math.round(H-5-(p.kg-min)/range*(H-10)); return x+","+y; });
          return (
            <div style={{ overflowX:"auto" }}>
              <svg width={W} height={H}>
                <polyline points={coords.join(" ")} fill="none" stroke={G.blue} strokeWidth="2" />
                {pts.map((p,i) => { const [cx,cy]=coords[i].split(","); return <circle key={i} cx={+cx} cy={+cy} r="3" fill={G.blue} />; })}
              </svg>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:G.dim, marginTop:2 }}>
                <span>{pts[0]?pts[0].date:""}</span><span>{pts[pts.length-1]?pts[pts.length-1].date:""}</span>
              </div>
            </div>
          );
        })()}
      </div>

      {bestLifts.length>0 && (
        <div className="card">
          <div className="lbl" style={{ marginBottom:12 }}>BESTE LØFT (PERSONLIG REKORD)</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:8 }}>
            {bestLifts.map(l => (
              <div key={l.id} style={{ background:G.bg2, border:"1px solid "+G.border, borderRadius:9, padding:"10px 12px" }}>
                <div style={{ fontSize:12, fontWeight:600, marginBottom:2 }}>{l.exercise}</div>
                <div style={{ fontSize:16, fontWeight:800, color:G.lime }}>{l.weight} kg</div>
                <div style={{ fontSize:10, color:G.dim }}>x {l.reps} reps  -  {l.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MESSAGES TAB
// ============================================================
function MessagesTab({ client, updateClient, isTrainer }) {
  const [draft, setDraft] = useState("");
  const endRef = useRef(null);
  const msgs = client.messages||[];

  useEffect(() => { if(endRef.current) endRef.current.scrollIntoView({behavior:"smooth"}); }, [msgs.length]);

  useEffect(() => {
    const fromRole = isTrainer ? "client" : "trainer";
    const hasUnread = msgs.some(m => m.from===fromRole && !m.read);
    if (hasUnread) updateClient(client.id, c => ({ ...c, messages:c.messages.map(m => m.from===fromRole?{...m,read:true}:m) }));
  }, []);

  const send = () => {
    if (!draft.trim()) return;
    const nm = { id:uid(), from:isTrainer?"trainer":"client", text:draft.trim(), time:nowStr(), read:false };
    updateClient(client.id, c => ({ ...c, messages:[...(c.messages||[]),nm] }));
    setDraft("");
  };

  return (
    <div>
      <div style={{ maxHeight:480, overflowY:"auto", marginBottom:12, display:"flex", flexDirection:"column", gap:8, padding:"4px 0" }}>
        {!msgs.length && <div style={{ textAlign:"center", padding:40, color:G.muted }}>Ingen meldinger ennå</div>}
        {msgs.map(m => {
          const mine = (isTrainer&&m.from==="trainer")||(!isTrainer&&m.from==="client");
          return (
            <div key={m.id} style={{ display:"flex", justifyContent:mine?"flex-end":"flex-start" }}>
              <div style={{ maxWidth:"72%" }}>
                <div style={{ background:mine?G.lime+"22":G.bg2, border:"1px solid "+(mine?G.lime+"44":G.border2), borderRadius:mine?"14px 14px 4px 14px":"14px 14px 14px 4px", padding:"9px 13px" }}>
                  <div style={{ fontSize:13, color:mine?G.lime:G.text }}>{m.text}</div>
                </div>
                <div style={{ fontSize:10, color:G.dim, marginTop:2, textAlign:mine?"right":"left" }}>
                  {m.time}{mine?(m.read?"  -  Lest":"  -  Sendt"):""}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <input style={{ flex:1 }} value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key==="Enter"&&!e.shiftKey&&send()} placeholder="Skriv melding..." />
        <button className="btn btn-lime" onClick={send} style={{ opacity:draft.trim()?1:0.4 }}>Send</button>
      </div>
    </div>
  );
}

// ============================================================
// CLIENT MODAL (add/edit)
// ============================================================
function ClientModal({ existing, onSave, onClose, onDelete }) {
  const [f, setF] = useState({
    name:     existing ? existing.name     : "",
    username: existing ? existing.username : "",
    password: existing ? existing.password : "",
    age:      existing ? existing.age      : "",
    weight:   existing ? existing.weight   : "",
    goal:     existing ? existing.goal     : "",
  });
  const [err, setErr] = useState("");

  const save = () => {
    if (!f.name||!f.username||!f.password) { setErr("Navn, brukernavn og passord er påkrevd"); return; }
    if (existing) {
      onSave({ name:f.name, username:f.username, password:f.password, age:+f.age||existing.age, weight:+f.weight||existing.weight, goal:f.goal||existing.goal });
    } else {
      const nc = { ...defaultClient(), id:uid(), name:f.name, username:f.username, password:f.password, age:+f.age||25, weight:+f.weight||80, goal:f.goal||"Muskelvekst", progressLog:[], sessions:[], bodyWeight:[], messages:[] };
      onSave(nc);
    }
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300, padding:16 }}>
      <div className="card col" style={{ width:"100%", maxWidth:440, gap:10 }}>
        <div style={{ fontFamily:"'Bebas Neue'", fontSize:22, letterSpacing:2, marginBottom:6 }}>{existing?"REDIGER KLIENT":"NY KLIENT"}</div>
        {[["Fullt navn *","name","text"],["Brukernavn *","username","text"],["Passord *","password","password"],["Alder","age","number"],["Vekt (kg)","weight","number"],["Trenningsmål","goal","text"]].map(([l,k,t]) => (
          <div key={k} className="col">
            <span className="lbl">{l.toUpperCase()}</span>
            <input type={t} value={f[k]} onChange={e => setF(x => ({...x,[k]:e.target.value}))} />
          </div>
        ))}
        {err && <div style={{ color:G.red, fontSize:12 }}>{err}</div>}
        <div style={{ display:"flex", gap:8, marginTop:6, flexWrap:"wrap" }}>
          <button className="btn btn-lime" onClick={save}>{existing?"Lagre endringer":"Legg til klient"}</button>
          <button className="btn btn-ghost" onClick={onClose}>Avbryt</button>
          {existing && onDelete && <button className="btn btn-red" onClick={() => { onDelete(); onClose(); }}>Slett klient</button>}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COPY WORKOUT PLAN MODAL
// ============================================================
function CopyWorkoutModal({ client, onClose, updateClient, clients }) {
  const [targetId, setTargetId] = useState("");
  const allClients = clients || [];

  const copy = () => {
    if (!targetId) return;
    const plan = JSON.parse(JSON.stringify(client.workoutPlan || { days:[] }));
    updateClient(targetId, c => ({ ...c, workoutPlan: plan }));
    onClose();
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300, padding:16 }}>
      <div className="card col" style={{ width:"100%", maxWidth:400, gap:12 }}>
        <div style={{ fontFamily:"'Bebas Neue'", fontSize:20, letterSpacing:2 }}>KOPIER TRENINGSPLAN</div>
        <div style={{ fontSize:12, color:G.muted }}>Kopierer alle treningsdager og øvelser til valgt klient.</div>
        <div className="col">
          <span className="lbl">TIL KLIENT</span>
          <select value={targetId} onChange={e => setTargetId(e.target.value)}>
            <option value="">Velg klient...</option>
            {allClients.filter(c => c.id!==client.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div style={{ fontSize:11, color:G.orange, background:G.orange+"11", border:"1px solid "+G.orange+"33", borderRadius:6, padding:"8px 10px" }}>
          Advarsel: eksisterende treningsplan for valgt klient erstattes.
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button className="btn btn-lime" onClick={copy} style={{ opacity:targetId?1:0.4 }}>Kopier plan</button>
          <button className="btn btn-ghost" onClick={onClose}>Avbryt</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COPY MEAL PLAN MODAL
// ============================================================
function CopyPlanModal({ clients, sourceId, onCopy, onClose }) {
  const [targetId, setTargetId] = useState("");
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300, padding:16 }}>
      <div className="card col" style={{ width:"100%", maxWidth:400, gap:12 }}>
        <div style={{ fontFamily:"'Bebas Neue'", fontSize:20, letterSpacing:2 }}>KOPIER KOSTHOLDSPLAN</div>
        <div style={{ fontSize:12, color:G.muted }}>Kopierer alle måltidstyper og forslag til valgt klient.</div>
        <div className="col">
          <span className="lbl">TIL KLIENT</span>
          <select value={targetId} onChange={e => setTargetId(e.target.value)}>
            <option value="">Velg klient...</option>
            {clients.filter(c => c.id!==sourceId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div style={{ fontSize:11, color:G.orange, background:G.orange+"11", border:"1px solid "+G.orange+"33", borderRadius:6, padding:"8px 10px" }}>
          Advarsel: eksisterende kostholdsplan for valgt klient erstattes.
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button className="btn btn-lime" onClick={() => targetId&&onCopy(targetId)} style={{ opacity:targetId?1:0.4 }}>Kopier plan</button>
          <button className="btn btn-ghost" onClick={onClose}>Avbryt</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CHECK-IN TAB (weekly physique photos)
// ============================================================
function CheckInTab({ client, updateClient, isTrainer }) {
  const DAYS = ["Mandag","Tirsdag","Onsdag","Torsdag","Fredag","L\u00f8rdag","S\u00f8ndag"];
  const checkinDay = client.checkinDay || "Mandag";
  const checkins = (client.checkins || []).slice().sort((a,b) => b.date.localeCompare(a.date));
  const [photos, setPhotos] = useState([]);
  const [note, setNote] = useState("");
  const [lightbox, setLightbox] = useState(null);
  const fileRef = useRef(null);

  const todayDayName = ["S\u00f8ndag","Mandag","Tirsdag","Onsdag","Torsdag","Fredag","L\u00f8rdag"][new Date().getDay()];
  const isCheckinDay = todayDayName === checkinDay;
  const alreadyCheckedIn = checkins.some(c => c.date === todayStr());

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        // Resize to max 800px wide to keep storage small
        const img = new Image();
        img.onload = () => {
          const maxW = 800;
          const scale = img.width > maxW ? maxW / img.width : 1;
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          setPhotos(prev => prev.length < 4 ? [...prev, dataUrl] : prev);
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removePhoto = idx => setPhotos(p => p.filter((_,i) => i!==idx));

  const submitCheckin = () => {
    if (!photos.length) return;
    const entry = { id: uid(), date: todayStr(), photos, note };
    updateClient(client.id, c => ({ ...c, checkins: [...(c.checkins||[]), entry] }));
    setPhotos([]); setNote("");
  };

  return (
    <div className="col" style={{ gap:14 }}>
      {lightbox !== null && (
        <div onClick={() => setLightbox(null)}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.92)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
          <img src={lightbox} alt="Forstørret" style={{ maxWidth:"95vw", maxHeight:"90vh", borderRadius:8, objectFit:"contain" }} />
          <div style={{ position:"absolute", top:16, right:20, color:"#fff", fontSize:24, fontWeight:700 }}>x</div>
        </div>
      )}

      <div style={{ fontFamily:"'Bebas Neue'", fontSize:22, letterSpacing:1, color:G.lime }}>UKENTLIG INNSJEKK</div>

      {isTrainer ? (
        <div className="card">
          <div className="lbl" style={{ marginBottom:6 }}>INNSJEKK-DAG FOR KLIENT</div>
          <div style={{ fontSize:12, color:G.muted, marginBottom:12 }}>Velg hvilken dag klienten skal sende inn bilder.</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {DAYS.map(d => (
              <button key={d} className={"chip"+(checkinDay===d?" active":"")}
                onClick={() => updateClient(client.id, c => ({ ...c, checkinDay: d }))}>
                {d}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="card" style={{ borderColor: isCheckinDay ? G.lime+"66" : G.border, background: isCheckinDay ? G.lime+"08" : G.card }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div className="lbl" style={{ marginBottom:3 }}>DIN INNSJEKK-DAG</div>
              <div style={{ fontSize:18, fontWeight:800, color:G.lime }}>{checkinDay}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              {isCheckinDay ? (
                alreadyCheckedIn
                  ? <div style={{ color:G.green, fontWeight:700, fontSize:13 }}>Sendt inn i dag!</div>
                  : <div style={{ color:G.orange, fontWeight:700, fontSize:13 }}>Klar til innsjekk!</div>
              ) : (
                <div style={{ fontSize:12, color:G.muted }}>Neste: {checkinDay}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {!isTrainer && !alreadyCheckedIn && (
        <div className="card col" style={{ gap:14 }}>
          <div>
            <div className="lbl" style={{ marginBottom:10 }}>LAST OPP BILDER (maks 4)</div>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display:"none" }}
              onChange={handleFiles} />
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {photos.map((src, i) => (
                <div key={i} style={{ position:"relative", width:90, height:90 }}>
                  <img src={src} alt={"Bilde "+(i+1)} onClick={() => setLightbox(src)}
                    style={{ width:90, height:90, borderRadius:10, objectFit:"cover", cursor:"pointer", border:"2px solid "+G.lime+"44" }} />
                  <button onClick={() => removePhoto(i)}
                    style={{ position:"absolute", top:-6, right:-6, width:22, height:22, borderRadius:"50%", background:G.red, border:"none", color:"#fff", fontSize:13, fontWeight:900, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>x</button>
                </div>
              ))}
              {photos.length < 4 && (
                <div onClick={() => fileRef.current && fileRef.current.click()}
                  style={{ width:90, height:90, borderRadius:10, border:"2px dashed "+G.border2, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer", gap:4 }}>
                  <div style={{ fontSize:28, color:G.dim }}>+</div>
                  <div style={{ fontSize:10, color:G.muted, textAlign:"center" }}>Kamera /<br/>Galleri</div>
                </div>
              )}
            </div>
          </div>
          <div className="col">
            <span className="lbl">NOTAT TIL TRENER (valgfritt)</span>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
              placeholder="Hvordan har uken vært? Form, trening, kosthold..." style={{ resize:"vertical" }} />
          </div>
          <button className="btn btn-lime" style={{ opacity:photos.length?1:0.4, padding:"12px 0", fontSize:15, fontWeight:700 }}
            onClick={submitCheckin}>
            Send inn innsjekk ({photos.length} bilde{photos.length!==1?"r":""})
          </button>
        </div>
      )}

      {alreadyCheckedIn && !isTrainer && (
        <div style={{ background:G.green+"15", border:"1px solid "+G.green+"44", borderRadius:10, padding:"14px 16px" }}>
          <div style={{ fontWeight:700, color:G.green, marginBottom:2 }}>Innsjekk sendt inn i dag!</div>
          <div style={{ fontSize:12, color:G.muted }}>Treneren din vil se gjennom bildene. Neste innsjekk: {checkinDay}.</div>
        </div>
      )}

      <div>
        <div className="lbl" style={{ marginBottom:10 }}>HISTORIKK  -  {checkins.length} INNSJEKK</div>
        {!checkins.length && (
          <div style={{ textAlign:"center", padding:"40px 16px", color:G.muted, fontSize:13 }}>Ingen innsjekk sendt inn enn\u00e5</div>
        )}
        <div className="col" style={{ gap:12 }}>
          {checkins.map(entry => (
            <div key={entry.id} className="card" style={{ padding:0, overflow:"hidden" }}>
              <div style={{ padding:"12px 14px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom: entry.photos.length?"1px solid "+G.border:"none" }}>
                <div style={{ fontWeight:700, fontSize:14 }}>{entry.date}</div>
                <div style={{ fontSize:11, color:G.muted }}>{entry.photos.length} bilde{entry.photos.length!==1?"r":""}</div>
              </div>
              {entry.note && (
                <div style={{ padding:"8px 14px", fontSize:12, color:G.text, fontStyle:"italic", borderBottom: entry.photos.length?"1px solid "+G.border:"none" }}>
                  {entry.note}
                </div>
              )}
              {entry.photos.length > 0 && (
                <div style={{ display:"flex", gap:0 }}>
                  {entry.photos.map((src, i) => (
                    <div key={i} onClick={() => setLightbox(src)}
                      style={{ flex:1, minWidth:0, height:160, cursor:"pointer", overflow:"hidden" }}>
                      <img src={src} alt={"Bilde "+(i+1)} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SHOPPING LIST TAB
// ============================================================
function ShoppingListTab({ client }) {
  const CAT_META = {
    "Kj\u00f8tt og fisk": { icon:"[K]", color:"#ff9f7e", keys:["kylling","laks","biff","torsk","tunfisk","egg","kj\u00f8tt","reker","fisk","kalkun","bacon","skinke","uer","makrell"] },
    "Meieri":            { icon:"[M]", color:"#7eb8ff", keys:["melk","yoghurt","kvarg","skyr","ost","sm\u00f8r","cottage","fl\u00f8te","r\u00f8mme"] },
    "Korn og br\u00f8d":  { icon:"[K]", color:"#f5c842", keys:["havre","ris","pasta","potet","br\u00f8d","knekkebr\u00f8d","rundstykke","tortilla","gryn","mel"] },
    "Gr\u00f8nnsaker":    { icon:"[G]", color:"#a8e87e", keys:["brokkoli","spinat","tomat","paprika","gulrot","agurk","salat","blomk\u00e5l","l\u00f8k","hvitl\u00f8k","erter","b\u00f8nner","linser"] },
    "Frukt":             { icon:"[F]", color:"#f5a142", keys:["banan","eple","jordb\u00e6r","bl\u00e5b\u00e6r","appelsin","kiwi","drue","mango","ananas"] },
    "N\u00f8tter og fett": { icon:"[N]", color:"#c4a3ff", keys:["mandel","cashew","pean\u00f8t","avokado","olje","n\u00f8tt","valnott","sesamfr\u00f8","linolj"] },
    "Tilskudd":          { icon:"[T]", color:"#ff5c5c", keys:["protein","kreatin","bar","shake","vitamin","omega","whey"] },
    "Andre varer":       { icon:"[S]", color:"#888", keys:[] },
  };

  const mp = client.mealPlan || {};
  const mealOptions = mp.mealOptions || {};
  const mealTypes = mp.mealTypes || [];

  // mealQty: { [mealId]: number } - how many times per week this meal is selected
  const [mealQty, setMealQty] = useState({});
  const [checked, setChecked] = useState({});
  const [openCats, setOpenCats] = useState({});
  const [planStep, setPlanStep] = useState("plan"); // "plan" | "list"

  // Get qty for a meal (default 0)
  const getQty = mealId => mealQty[mealId] || 0;
  const setQty = (mealId, val) => setMealQty(m => ({ ...m, [mealId]: Math.max(0, Math.min(7, val)) }));

  // Total meals planned across all types
  const totalMealsPlanned = Object.values(mealQty).reduce((s, v) => s + v, 0);

  const getCat = name => {
    const n = name.toLowerCase();
    for (const [cat, meta] of Object.entries(CAT_META)) {
      if (cat === "Andre varer") continue;
      if (meta.keys.some(k => n.includes(k))) return cat;
    }
    return "Andre varer";
  };

  const formatAmt = grams => {
    if (grams >= 1000) return (grams/1000).toFixed(1).replace(/\.0$/,"") + " kg";
    if (grams >= 100) return Math.round(grams/50)*50 + " g";
    return grams + " g";
  };

  const buildList = () => {
    const items = {};
    mealTypes.forEach(mt => {
      const opts = mealOptions[mt.id] || [];
      opts.forEach(meal => {
        const qty = getQty(meal.id);
        if (!qty) return;
        (meal.structuredItems || []).forEach(item => {
          if (!items[item.name]) items[item.name] = { name:item.name, grams:0, cat:getCat(item.name) };
          items[item.name].grams += Math.round((item.grams || 0) * qty);
        });
      });
    });
    return Object.values(items).filter(x => x.grams > 0);
  };

  const list = buildList();
  const totalItems = list.length;
  const doneItems = list.filter(x => checked[x.name]).length;

  const grouped = {};
  list.forEach(item => {
    if (!grouped[item.cat]) grouped[item.cat] = [];
    grouped[item.cat].push(item);
  });
  Object.values(grouped).forEach(arr => arr.sort((a,b) => a.name.localeCompare(b.name)));
  const catOrder = Object.keys(CAT_META).filter(c => grouped[c]);

  const toggleItem = name => setChecked(c => ({...c, [name]: !c[name]}));
  const toggleCat = cat => setOpenCats(o => ({...o, [cat]: o[cat]===false}));

  return (
    <div className="col" style={{ gap:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ fontFamily:"'Bebas Neue'", fontSize:22, letterSpacing:1, color:G.lime }}>HANDLELISTE</div>
        {planStep === "list" && (
          <div style={{ display:"flex", gap:6 }}>
            {doneItems > 0 && <button className="btn-ghost btn-sm" onClick={() => setChecked({})} style={{ fontSize:11 }}>Nullstill</button>}
            <button className="btn-ghost btn-sm" onClick={() => setPlanStep("plan")} style={{ fontSize:11 }}>Rediger plan</button>
          </div>
        )}
      </div>

      {planStep === "plan" ? (
        <>
          <div style={{ background:G.bg2, borderRadius:10, padding:"12px 14px", fontSize:12, color:G.muted, lineHeight:1.6 }}>
            Velg hvor mange ganger i uken du vil spise hvert maltid. Handlelisten beregnes automatisk.
          </div>

          {mealTypes.map(mt => {
            const opts = mealOptions[mt.id] || [];
            if (!opts.length) return null;
            const mtTotal = opts.reduce((s, m) => s + getQty(m.id), 0);
            return (
              <div key={mt.id} className="card" style={{ padding:0, overflow:"hidden" }}>
                <div style={{ padding:"12px 14px", borderBottom:"1px solid "+G.border, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14 }}>{mt.label}</div>
                    <div style={{ fontSize:11, color:G.muted }}>
                      {mtTotal > 0 ? mtTotal+" gang"+( mtTotal!==1?"er":"")+" i uken valgt" : "Ingen valgt enn\u00e5"}
                    </div>
                  </div>
                  <div style={{ fontSize:11, color:G.dim }}>{opts.length} alternativ{opts.length!==1?"er":""}</div>
                </div>
                <div>
                  {opts.map((meal, i) => {
                    const qty = getQty(meal.id);
                    const kcal = meal.macros ? meal.macros.kcal : 0;
                    const prot = meal.macros ? meal.macros.protein : 0;
                    return (
                      <div key={meal.id}
                        style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px",
                          borderBottom: i<opts.length-1 ? "1px solid "+G.border : "none",
                          background: qty > 0 ? G.lime+"08" : "transparent" }}>
                        {meal.imgUrl && (
                          <div style={{ width:44, height:44, borderRadius:8, overflow:"hidden", flexShrink:0 }}>
                            <img src={meal.imgUrl} alt={meal.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e => e.target.style.display="none"} />
                          </div>
                        )}
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:13, fontWeight:qty>0?700:400, color:qty>0?G.lime:G.text,
                            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{meal.name}</div>
                          <div style={{ fontSize:11, color:G.dim }}>
                            {kcal>0 ? kcal+" kcal" : ""}
                            {prot>0 ? "  "+prot+"g protein" : ""}
                          </div>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                          <button onClick={() => setQty(meal.id, qty-1)}
                            style={{ width:30, height:30, borderRadius:8, border:"1px solid "+G.border2,
                              background: qty>0 ? G.bg3 : "transparent", color:qty>0?G.text:G.dim,
                              fontSize:18, fontWeight:700, cursor:"pointer", lineHeight:1 }}>-</button>
                          <div style={{ width:28, textAlign:"center", fontSize:16, fontWeight:800,
                            color: qty>0 ? G.lime : G.dim }}>{qty}</div>
                          <button onClick={() => setQty(meal.id, qty+1)}
                            style={{ width:30, height:30, borderRadius:8, border:"1px solid "+(qty>0?G.lime+"55":G.border2),
                              background: qty>0 ? G.lime+"22" : G.bg3, color:qty>0?G.lime:G.text,
                              fontSize:18, fontWeight:700, cursor:"pointer", lineHeight:1 }}>+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <button className="btn btn-lime" style={{ padding:"13px 0", fontSize:15, fontWeight:700,
            opacity: totalMealsPlanned > 0 ? 1 : 0.4 }}
            onClick={() => { if (totalMealsPlanned > 0) setPlanStep("list"); }}>
            Generer handleliste  ({totalMealsPlanned} maltider valgt)
          </button>
        </>
      ) : (
        <>
          {list.length === 0 ? (
            <div style={{ textAlign:"center", padding:"50px 20px", color:G.muted }}>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:4 }}>Ingen varer enn\u00e5</div>
              <div style={{ fontSize:12 }}>G\u00e5 tilbake og velg maltider f\u00f8rst</div>
            </div>
          ) : (
            <>
              <div className="card" style={{ padding:"10px 14px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <div style={{ fontSize:13, fontWeight:600 }}>Handlet</div>
                  <div style={{ fontSize:13, fontWeight:700, color:doneItems===totalItems?G.green:G.lime }}>{doneItems} / {totalItems}</div>
                </div>
                <div style={{ height:8, background:G.bg3, borderRadius:4 }}>
                  <div style={{ height:"100%", borderRadius:4, background:doneItems===totalItems?G.green:G.lime,
                    width: totalItems>0 ? Math.round(doneItems/totalItems*100)+"%" : "0%" }} />
                </div>
                {doneItems===totalItems && totalItems>0 && (
                  <div style={{ fontSize:12, color:G.green, fontWeight:700, marginTop:6, textAlign:"center" }}>Alt handlet! Bra jobba!</div>
                )}
              </div>

              {catOrder.map(cat => {
                const meta = CAT_META[cat];
                const items = grouped[cat];
                const catDone = items.filter(x => checked[x.name]).length;
                const isOpen = openCats[cat] !== false;
                return (
                  <div key={cat} className="card" style={{ padding:0, overflow:"hidden" }}>
                    <div onClick={() => toggleCat(cat)}
                      style={{ display:"flex", alignItems:"center", gap:10, padding:"13px 14px", cursor:"pointer",
                        borderBottom: isOpen ? "1px solid "+G.border : "none" }}>
                      <span style={{ fontSize:16, fontWeight:700, color:meta.color }}>{meta.icon}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:14, color:catDone===items.length?G.dim:G.text,
                          textDecoration:catDone===items.length?"line-through":"none" }}>{cat}</div>
                        <div style={{ fontSize:11, color:G.muted }}>{catDone}/{items.length} varer</div>
                      </div>
                      <div style={{ width:32, height:32, borderRadius:"50%", background:meta.color+"22",
                        border:"2px solid "+meta.color+"44", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <div style={{ width:Math.round(32*catDone/Math.max(1,items.length)),
                          height:Math.round(32*catDone/Math.max(1,items.length)), borderRadius:"50%",
                          background:meta.color, transition:"all 0.3s" }} />
                      </div>
                      <span style={{ color:G.dim, fontSize:12 }}>{isOpen?"^":"v"}</span>
                    </div>
                    {isOpen && (
                      <div>
                        {items.map((item, i) => {
                          const done = !!checked[item.name];
                          return (
                            <div key={i} onClick={() => toggleItem(item.name)}
                              style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px",
                                borderBottom: i<items.length-1 ? "1px solid "+G.border : "none",
                                background: done ? G.bg2 : "transparent", cursor:"pointer" }}>
                              <div style={{ width:22, height:22, borderRadius:6, flexShrink:0,
                                border:"2px solid "+(done?meta.color:G.border2),
                                background: done?meta.color:"transparent",
                                display:"flex", alignItems:"center", justifyContent:"center",
                                color:"#000", fontSize:13, fontWeight:900 }}>
                                {done ? "+" : ""}
                              </div>
                              <span style={{ flex:1, fontSize:14, color:done?G.dim:G.text,
                                textDecoration:done?"line-through":"none" }}>{item.name}</span>
                              <span style={{ fontSize:13, fontWeight:700, color:done?G.dim:meta.color }}>
                                {formatAmt(item.grams)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </>
      )}
    </div>
  );
}

// ============================================================
// TRAINER NOTES TAB  (#7)
// ============================================================
function TrainerNotesTab({ client, updateClient }) {
  const notes = client.trainerNotes || [];
  const [body, setBody] = useState("");
  const [tag, setTag] = useState("generelt");
  const [filterTag, setFilterTag] = useState("alle");
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [editBody, setEditBody] = useState("");

  const TAGS = [
    { id:"generelt",    label:"Generelt",    color:"#7eb8ff" },
    { id:"trening",     label:"Trening",     color:"#c8f135" },
    { id:"kosthold",    label:"Kosthold",    color:"#f5a142" },
    { id:"psykisk",     label:"Psykisk",     color:"#c4a3ff" },
    { id:"skade",       label:"Skade/helse", color:"#ff5c5c" },
    { id:"fremgang",    label:"Fremgang",    color:"#a8e87e" },
  ];
  const tagColor = id => (TAGS.find(t => t.id===id)||{}).color || "#888";
  const tagLabel = id => (TAGS.find(t => t.id===id)||{}).label || id;

  const addNote = () => {
    if (!body.trim()) return;
    const note = { id:uid(), date:todayStr(), time:nowStr(), tag, body: body.trim() };
    updateClient(client.id, c => ({ ...c, trainerNotes:[...(c.trainerNotes||[]), note] }));
    setBody("");
  };

  const deleteNote = id => updateClient(client.id, c => ({ ...c, trainerNotes:(c.trainerNotes||[]).filter(n => n.id!==id) }));
  const saveEdit = id => {
    updateClient(client.id, c => ({ ...c, trainerNotes:(c.trainerNotes||[]).map(n => n.id===id ? {...n, body:editBody} : n) }));
    setEditId(null);
  };

  const visible = notes
    .filter(n => filterTag==="alle" || n.tag===filterTag)
    .filter(n => !search || n.body.toLowerCase().includes(search.toLowerCase()))
    .slice().reverse();

  return (
    <div className="col" style={{ gap:14 }}>
      <div style={{ fontFamily:"'Bebas Neue'", fontSize:22, letterSpacing:1, color:G.lime }}>TRENERNOTATER</div>
      <div style={{ background:G.orange+"15", border:"1px solid "+G.orange+"33", borderRadius:8, padding:"8px 12px", fontSize:11, color:G.orange }}>
        Kun synlig for deg som trener. Klienten ser ikke disse notatene.
      </div>

      {/* New note */}
      <div className="card col" style={{ gap:10 }}>
        <div className="lbl">NYTT NOTAT</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
          {TAGS.map(t => (
            <button key={t.id} className={"chip"+(tag===t.id?" active":"")}
              style={tag===t.id ? { background:t.color+"33", borderColor:t.color+"66", color:t.color } : {}}
              onClick={() => setTag(t.id)}>{t.label}</button>
          ))}
        </div>
        <textarea value={body} onChange={e => setBody(e.target.value)} rows={3}
          placeholder={"Skriv notat om "+client.name+"..."} style={{ resize:"vertical" }} />
        <button className="btn btn-lime" onClick={addNote} style={{ opacity:body.trim()?1:0.4 }}>Lagre notat</button>
      </div>

      {/* Filter + search */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Sok i notater..." style={{ flex:1, minWidth:140 }} />
        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
          <button className={"chip"+(filterTag==="alle"?" active":"")} onClick={() => setFilterTag("alle")}>Alle ({notes.length})</button>
          {TAGS.filter(t => notes.some(n => n.tag===t.id)).map(t => (
            <button key={t.id} className={"chip"+(filterTag===t.id?" active":"")}
              style={filterTag===t.id ? { background:t.color+"33", borderColor:t.color+"66", color:t.color } : {}}
              onClick={() => setFilterTag(filterTag===t.id?"alle":t.id)}>{t.label}</button>
          ))}
        </div>
      </div>

      {!visible.length && (
        <div style={{ textAlign:"center", padding:40, color:G.muted, fontSize:13 }}>Ingen notater enn\u00e5</div>
      )}

      <div className="col" style={{ gap:8 }}>
        {visible.map(note => (
          <div key={note.id} className="card" style={{ borderLeft:"3px solid "+tagColor(note.tag), padding:"12px 14px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
              <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                <span style={{ fontSize:11, fontWeight:700, color:tagColor(note.tag), background:tagColor(note.tag)+"22",
                  borderRadius:5, padding:"2px 8px" }}>{tagLabel(note.tag)}</span>
                <span style={{ fontSize:11, color:G.dim }}>{note.date}</span>
              </div>
              <div style={{ display:"flex", gap:4 }}>
                <button className="btn-icon" style={{ fontSize:11 }}
                  onClick={() => { setEditId(note.id); setEditBody(note.body); }}>Rediger</button>
                <button className="btn-icon" style={{ color:G.red, fontSize:11 }}
                  onClick={() => deleteNote(note.id)}>Slett</button>
              </div>
            </div>
            {editId===note.id ? (
              <div className="col" style={{ gap:6 }}>
                <textarea value={editBody} onChange={e => setEditBody(e.target.value)} rows={3} style={{ resize:"vertical" }} />
                <div style={{ display:"flex", gap:6 }}>
                  <button className="btn btn-lime btn-sm" onClick={() => saveEdit(note.id)}>Lagre</button>
                  <button className="btn-ghost btn-sm" onClick={() => setEditId(null)}>Avbryt</button>
                </div>
              </div>
            ) : (
              <div style={{ fontSize:13, lineHeight:1.6, whiteSpace:"pre-wrap" }}>{note.body}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// TEMPLATES TAB  (#6)  - save/load workout + meal plan templates
// ============================================================
const TMPL_SK = "templates";
const saveTmpl = async d => {
  try {
    const db = await getDb();
    await db.collection("coachapp").doc(TMPL_SK).set({ data: JSON.stringify(d) });
  } catch(e) { try { localStorage.setItem("coachapp_templates", JSON.stringify(d)); } catch(e2) {} }
};
const loadTmpl = async () => {
  try {
    const db = await getDb();
    const doc = await db.collection("coachapp").doc(TMPL_SK).get();
    if (doc.exists) return JSON.parse(doc.data().data);
    const lb = localStorage.getItem("coachapp_templates");
    return lb ? JSON.parse(lb) : { workout:[], meal:[] };
  } catch(e) { return { workout:[], meal:[] }; }
};

function TemplatesTab({ client, updateClient, clients, setClients }) {
  const [templates, setTemplates] = useState({ workout:[], meal:[] });
  const [loaded, setLoaded] = useState(false);
  const [activeType, setActiveType] = useState("workout");
  const [savingName, setSavingName] = useState("");
  const [showSave, setShowSave] = useState(false);
  const [applyTarget, setApplyTarget] = useState(client ? client.id : "");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadTmpl().then(t => { setTemplates(t); setLoaded(true); });
  }, []);

  const flash = m => { setMsg(m); setTimeout(() => setMsg(""), 2500); };

  const saveTemplate = async () => {
    if (!savingName.trim()) return;
    const newTmpl = activeType === "workout"
      ? { id:uid(), name:savingName.trim(), createdAt:todayStr(), type:"workout", data: client.workoutPlan ? JSON.parse(JSON.stringify(client.workoutPlan)) : { days:[] } }
      : { id:uid(), name:savingName.trim(), createdAt:todayStr(), type:"meal", data: client.mealPlan ? JSON.parse(JSON.stringify(client.mealPlan)) : {} };
    const updated = { ...templates, [activeType]: [...(templates[activeType]||[]), newTmpl] };
    setTemplates(updated);
    await saveTmpl(updated);
    setSavingName(""); setShowSave(false);
    flash("Mal lagret!");
  };

  const deleteTemplate = async id => {
    const updated = { workout: templates.workout.filter(t => t.id!==id), meal: templates.meal.filter(t => t.id!==id) };
    setTemplates(updated);
    await saveTmpl(updated);
    flash("Mal slettet");
  };

  const applyTemplate = async tmpl => {
    if (!applyTarget) return;
    if (!window.confirm("Erstatte eksisterende "+( tmpl.type==="workout"?"treningsplan":"kostholdsplan")+" for denne klienten?")) return;
    setClients(cs => cs.map(c => {
      if (c.id !== applyTarget) return c;
      const copy = JSON.parse(JSON.stringify(tmpl.data));
      if (tmpl.type==="workout") return { ...c, workoutPlan: copy };
      return { ...c, mealPlan: copy };
    }));
    flash("Mal brukt p\u00e5 " + (clients.find(c=>c.id===applyTarget)||{}).name + "!");
  };

  const list = (templates[activeType]||[]).slice().reverse();

  return (
    <div className="col" style={{ gap:14 }}>
      <div style={{ fontFamily:"'Bebas Neue'", fontSize:22, letterSpacing:1, color:G.lime }}>MAL-BIBLIOTEK</div>
      <div style={{ fontSize:12, color:G.muted, lineHeight:1.6 }}>
        Lagre trenings- og kostholdsplaner som maler. Bruk maler for \u00e5 sette opp nye klienter raskt.
      </div>

      {msg && <div style={{ background:G.green+"22", border:"1px solid "+G.green+"44", borderRadius:8, padding:"8px 14px", color:G.green, fontWeight:700, fontSize:13 }}>{msg}</div>}

      {/* Type tabs */}
      <div style={{ display:"flex", gap:0, borderBottom:"1px solid "+G.border }}>
        {[["workout","Treningsplaner"],["meal","Kostholdsplaner"]].map(([id,label]) => (
          <button key={id} className={"tab-btn"+(activeType===id?" active":"")} onClick={() => setActiveType(id)}>{label}</button>
        ))}
      </div>

      {/* Save from current client */}
      <div className="card" style={{ padding:"12px 14px" }}>
        <div className="lbl" style={{ marginBottom:8 }}>LAGRE {activeType==="workout"?"TRENINGSPLAN":"KOSTHOLDSPLAN"} SOM MAL</div>
        <div style={{ fontSize:12, color:G.muted, marginBottom:10 }}>
          Lagrer gjeldende {activeType==="workout"?"treningsplan":"kostholdsplan"} for {client.name} som en gjenbrukbar mal.
        </div>
        {showSave ? (
          <div style={{ display:"flex", gap:6 }}>
            <input value={savingName} onChange={e => setSavingName(e.target.value)} placeholder="Navn p\u00e5 malen..."
              onKeyDown={e => e.key==="Enter"&&saveTemplate()} style={{ flex:1 }} autoFocus />
            <button className="btn btn-lime btn-sm" onClick={saveTemplate} style={{ opacity:savingName.trim()?1:0.4 }}>Lagre</button>
            <button className="btn-ghost btn-sm" onClick={() => setShowSave(false)}>Avbryt</button>
          </div>
        ) : (
          <button className="btn btn-lime btn-sm" onClick={() => setShowSave(true)}>
            + Lagre som mal
          </button>
        )}
      </div>

      {/* Apply to client */}
      {list.length > 0 && (
        <div className="card" style={{ padding:"12px 14px" }}>
          <div className="lbl" style={{ marginBottom:8 }}>BRUK MAL P\u00c5 KLIENT</div>
          <select value={applyTarget} onChange={e => setApplyTarget(e.target.value)}
            style={{ width:"100%", marginBottom:8, background:G.bg3, color:G.text, border:"1px solid "+G.border, borderRadius:7, padding:"8px 10px" }}>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div style={{ fontSize:11, color:G.muted }}>Trykk "Bruk" p\u00e5 en mal nedenfor</div>
        </div>
      )}

      {!loaded && <div style={{ color:G.muted, fontSize:12, padding:20, textAlign:"center" }}>Laster maler...</div>}
      {loaded && !list.length && (
        <div style={{ textAlign:"center", padding:40, color:G.muted, fontSize:13 }}>
          Ingen {activeType==="workout"?"trenings":"kostholdsplan"}-maler lagret enn\u00e5
        </div>
      )}

      <div className="col" style={{ gap:8 }}>
        {list.map(tmpl => (
          <div key={tmpl.id} className="card" style={{ padding:"12px 14px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ fontWeight:700, fontSize:15 }}>{tmpl.name}</div>
                <div style={{ fontSize:11, color:G.muted, marginTop:2 }}>
                  Lagret: {tmpl.createdAt}
                  {tmpl.type==="workout" && tmpl.data.days ? "  \u2022  " + tmpl.data.days.length + " \u00f8ktdager" : ""}
                  {tmpl.type==="meal" && tmpl.data.calories ? "  \u2022  " + tmpl.data.calories + " kcal" : ""}
                </div>
              </div>
              <div style={{ display:"flex", gap:6 }}>
                <button className="btn btn-lime btn-sm" onClick={() => applyTemplate(tmpl)}>Bruk</button>
                <button className="btn-icon" style={{ color:G.red }} onClick={() => deleteTemplate(tmpl.id)}>Slett</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// CUSTOM FOOD DATABASE MANAGER (shown inside MealEditorModal)
// ============================================================
function CustomFoodManager({ customFoods, setCustomFoods, onClose }) {
  const [name, setName] = useState("");
  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  const add = () => {
    if (!name.trim() || !kcal) return;
    setCustomFoods(prev => [...prev, {
      id:uid(), name:name.trim(), cat:"Egendefinert",
      kcal:+kcal, protein:+protein||0, carbs:+carbs||0, fat:+fat||0, isCustom:true
    }]);
    setName(""); setKcal(""); setProtein(""); setCarbs(""); setFat("");
  };

  const del = id => setCustomFoods(prev => prev.filter(f => f.id!==id));

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:400, padding:16 }}>
      <div style={{ width:"100%", maxWidth:500, background:G.card, borderRadius:14, border:"1px solid "+G.border, overflow:"hidden" }}>
        <div style={{ padding:"14px 16px", borderBottom:"1px solid "+G.border, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontFamily:"'Bebas Neue'", fontSize:18, letterSpacing:1 }}>EGNE MATVARER</div>
          <button className="btn-icon" onClick={onClose}>Lukk</button>
        </div>
        <div style={{ padding:16, maxHeight:"70vh", overflowY:"auto" }}>
          <div className="col" style={{ gap:8, marginBottom:16 }}>
            <div className="lbl">LEGG TIL NY MATVARE</div>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Navn på matvaren" />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
              <div><div className="lbl" style={{ marginBottom:3, fontSize:9 }}>KCAL per 100g</div>
                <input type="number" value={kcal} onChange={e => setKcal(e.target.value)} placeholder="0" /></div>
              <div><div className="lbl" style={{ marginBottom:3, fontSize:9 }}>PROTEIN g</div>
                <input type="number" value={protein} onChange={e => setProtein(e.target.value)} placeholder="0" /></div>
              <div><div className="lbl" style={{ marginBottom:3, fontSize:9 }}>KARBS g</div>
                <input type="number" value={carbs} onChange={e => setCarbs(e.target.value)} placeholder="0" /></div>
              <div><div className="lbl" style={{ marginBottom:3, fontSize:9 }}>FETT g</div>
                <input type="number" value={fat} onChange={e => setFat(e.target.value)} placeholder="0" /></div>
            </div>
            <button className="btn btn-lime" onClick={add} style={{ opacity:name&&kcal?1:0.4 }}>+ Legg til matvare</button>
          </div>

          <div className="lbl" style={{ marginBottom:8 }}>DINE MATVARER ({(customFoods||[]).length})</div>
          {!(customFoods||[]).length && <div style={{ color:G.muted, fontSize:12, textAlign:"center", padding:20 }}>Ingen egendefinerte matvarer ennå</div>}
          <div className="col" style={{ gap:4 }}>
            {(customFoods||[]).map(f => (
              <div key={f.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                background:G.bg3, borderRadius:8, padding:"8px 12px" }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{f.name}</div>
                  <div style={{ fontSize:10, color:G.dim }}>{f.kcal} kcal  |  P:{f.protein}g  K:{f.carbs}g  F:{f.fat}g</div>
                </div>
                <button className="btn-icon" style={{ color:G.red }} onClick={() => del(f.id)}>Slett</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// APP SETTINGS TAB  - admin panel for branding + app URL
// ============================================================
function AppSettingsTab({ brand, setBrand, darkMode }) {
  const [form, setForm] = useState({ ...brand });
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState("brand");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinErr, setPinErr] = useState("");

  // Sync form when brand loads from storage
  useEffect(() => { setForm(b => ({ ...brand, ...b })); }, []);

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = () => {
    if (tab === "pin" && form.trainerPin && form.trainerPin !== pinConfirm) {
      setPinErr("PIN-ene matcher ikke"); return;
    }
    if (form.trainerPin && form.trainerPin.length < 4) {
      alert("PIN ma vaere minst 4 tegn"); return;
    }
    const newBrand = { ...form };
    setBrand(newBrand);
    // Force save to Firebase immediately
    if (window._coachForceSave) window._coachForceSave(newBrand);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const PRESET_COLORS = [
    "#c8f135","#ff9f7e","#7eb8ff","#c4a3ff","#a8e87e",
    "#f5a142","#ff5c5c","#ffffff","#ffd700","#00e5ff"
  ];

  const exportBackup = () => {
    try {
      const data = { exportedAt: new Date().toISOString(), brand, clients: window._coachClients||[] };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type:"application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "coach-nguyen-backup-"+new Date().toISOString().slice(0,10)+".json";
      a.click(); URL.revokeObjectURL(url);
    } catch(e) { alert("Klarte ikke laste ned backup: "+e.message); }
  };

  return (
    <div className="col" style={{ gap:16, maxWidth:560 }}>
      <div style={{ fontFamily:"'Bebas Neue'", fontSize:22, letterSpacing:1, color:G.lime }}>APPINNSTILLINGER</div>

      {saved && (
        <div style={{ background:G.green+"22", border:"1px solid "+G.green+"44", borderRadius:8,
          padding:"10px 16px", color:G.green, fontWeight:700, fontSize:13 }}>
          Innstillinger lagret!
        </div>
      )}

      {/* Sub-tabs */}
      <div style={{ display:"flex", gap:0, borderBottom:"1px solid "+G.border, overflowX:"auto" }}>
        {[["brand","Merkevare"],["url","Oppdater app"],["pin","PIN & Sikkerhet"],["backup","Backup"]].map(([id,label]) => (
          <button key={id} className={"tab-btn"+(tab===id?" active":"")} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {/* -- MERKEVARE -- */}
      {tab === "brand" && (
        <div className="col" style={{ gap:12 }}>

          <div className="card col" style={{ gap:10 }}>
            <div className="lbl">APPNAVN</div>
            <input value={form.appName} onChange={e => upd("appName", e.target.value.toUpperCase())}
              placeholder="COACH NGUYEN" style={{ fontFamily:"'Bebas Neue'", fontSize:18, letterSpacing:2 }} />
            <div style={{ fontSize:11, color:G.muted }}>Vises på innloggingssiden og i nettleserfanen</div>
          </div>

          <div className="card col" style={{ gap:10 }}>
            <div className="lbl">UNDERTITTEL</div>
            <input value={form.tagline} onChange={e => upd("tagline", e.target.value)}
              placeholder="Personlig trenings- og kostholdsapp" />
          </div>

          <div className="card col" style={{ gap:10 }}>
            <div className="lbl">LOGO-URL (valgfritt)</div>
            <input value={form.logoUrl} onChange={e => upd("logoUrl", e.target.value)}
              placeholder="https://din-side.no/logo.png" />
            <div style={{ fontSize:11, color:G.muted }}>Lim inn lenke til et bilde. Erstatter appnavnet på innloggingssiden.</div>
            {form.logoUrl && (
              <img src={form.logoUrl} alt="logo preview"
                style={{ maxHeight:60, maxWidth:180, objectFit:"contain", borderRadius:6, background:"#fff", padding:4 }}
                onError={e => { e.target.style.display="none"; }} />
            )}
          </div>

          <div className="card col" style={{ gap:10 }}>
            <div className="lbl">AKSENTFARGE</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, alignItems:"center" }}>
              {PRESET_COLORS.map(c => (
                <button key={c} onClick={() => upd("accentColor", c)}
                  style={{ width:32, height:32, borderRadius:"50%", background:c, border:form.accentColor===c?"3px solid #fff":"2px solid transparent",
                    cursor:"pointer", flexShrink:0, boxShadow:form.accentColor===c?"0 0 0 2px "+c:"none" }} />
              ))}
              <input type="color" value={form.accentColor} onChange={e => upd("accentColor", e.target.value)}
                style={{ width:36, height:32, padding:0, border:"none", borderRadius:8, cursor:"pointer", background:"transparent" }} />
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:4 }}>
              <div style={{ width:48, height:48, borderRadius:12, background:form.accentColor, display:"flex",
                alignItems:"center", justifyContent:"center", fontFamily:"'Bebas Neue'", fontSize:14, color:"#000" }}>CN</div>
              <div>
                <div style={{ fontWeight:700, color:form.accentColor, fontFamily:"'Bebas Neue'", fontSize:18 }}>{form.appName||"COACH NGUYEN"}</div>
                <div style={{ fontSize:11, color:G.muted }}>Forhåndsvisning</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -- OPPDATER APP -- */}
      {tab === "url" && (
        <div className="col" style={{ gap:12 }}>
          <div className="card col" style={{ gap:10 }}>
            <div className="lbl">SLIK OPPDATERER DU APPEN</div>
            <div style={{ background:G.bg3, borderRadius:8, padding:"12px 14px" }}>
              <div style={{ fontSize:13, lineHeight:1.8 }}>
                <div style={{ marginBottom:6 }}>
                  <span style={{ background:G.lime+"22", color:G.lime, fontWeight:700, borderRadius:4, padding:"1px 7px", marginRight:6 }}>1</span>
                  Gjør endringer her i Claude som vanlig
                </div>
                <div style={{ marginBottom:6 }}>
                  <span style={{ background:G.lime+"22", color:G.lime, fontWeight:700, borderRadius:4, padding:"1px 7px", marginRight:6 }}>2</span>
                  Trykk <strong>Publish</strong> øverst i Claude - kopier den nye lenken
                </div>
                <div style={{ marginBottom:6 }}>
                  <span style={{ background:G.lime+"22", color:G.lime, fontWeight:700, borderRadius:4, padding:"1px 7px", marginRight:6 }}>3</span>
                  Lim inn lenken nedenfor og trykk Lagre
                </div>
                <div>
                  <span style={{ background:G.lime+"22", color:G.lime, fontWeight:700, borderRadius:4, padding:"1px 7px", marginRight:6 }}>4</span>
                  Kundene vil automatisk bli sendt til den nye versjonen
                </div>
              </div>
            </div>
          </div>

          <div className="card col" style={{ gap:10 }}>
            <div className="lbl">NY APP-LENKE (fra Claude Publish)</div>
            <input value={form.latestAppUrl} onChange={e => upd("latestAppUrl", e.target.value)}
              placeholder="https://claude.site/artifacts/..." />
            {form.latestAppUrl && (
              <a href={form.latestAppUrl} target="_blank" rel="noreferrer"
                style={{ fontSize:12, color:G.lime }}>
                Åpne lenken for å teste \u2197
              </a>
            )}
          </div>

          <div className="card" style={{ padding:"12px 14px", borderLeft:"3px solid "+G.orange }}>
            <div style={{ fontSize:12, color:G.muted, lineHeight:1.7 }}>
              <strong style={{ color:G.orange }}>Tips:</strong> Pek ditt eget domene (f.eks. coachnguyenapp.no)
              til den siste Claude.site-lenken via en redirect hos domeneleverandøren din.
              Da trenger kundene aldri å oppdatere bokmerket sitt.
            </div>
          </div>
        </div>
      )}

      {/* -- PIN & SIKKERHET -- */}
      {tab === "pin" && (
        <div className="col" style={{ gap:12 }}>
          <div className="card col" style={{ gap:10 }}>
            <div className="lbl">ENDRE TRENER-PIN</div>
            <div style={{ fontSize:12, color:G.muted }}>Nåværende PIN er skjult. Skriv inn ny PIN (minimum 4 tegn).</div>
            <input type="password" value={form.trainerPin}
              onChange={e => { upd("trainerPin", e.target.value); setPinErr(""); }}
              placeholder="Ny PIN" style={{ letterSpacing:4, textAlign:"center", fontSize:18 }} />
            <input type="password" value={pinConfirm}
              onChange={e => { setPinConfirm(e.target.value); setPinErr(""); }}
              placeholder="Bekreft ny PIN" style={{ letterSpacing:4, textAlign:"center", fontSize:18 }} />
            {pinErr && <div style={{ color:G.red, fontSize:12 }}>{pinErr}</div>}
            {form.trainerPin && form.trainerPin !== pinConfirm && pinConfirm &&
              <div style={{ fontSize:12, color:G.orange }}>PIN-ene matcher ikke ennå</div>}
          </div>
          <div className="card" style={{ padding:"12px 14px", borderLeft:"3px solid "+G.blue }}>
            <div style={{ fontSize:12, color:G.muted, lineHeight:1.7 }}>
              <strong style={{ color:G.blue }}>Merk:</strong> Kun du som trener bruker PIN. Klientene logger inn med brukernavn og passord du har satt for dem.
            </div>
          </div>
        </div>
      )}

      {/* -- BACKUP -- */}
      {tab === "backup" && (
        <div className="col" style={{ gap:12 }}>
          <div className="card col" style={{ gap:10 }}>
            <div className="lbl">LAST NED BACKUP</div>
            <div style={{ fontSize:12, color:G.muted, lineHeight:1.7 }}>
              Laster ned alle klientdata, treningsplaner, kostholdsplaner, innsjekk og meldinger som en JSON-fil.
              Lagre denne filen på en trygg plass jevnlig.
            </div>
            <button className="btn btn-lime" style={{ alignSelf:"flex-start" }} onClick={exportBackup}>
              Last ned backup
            </button>
          </div>
          <div className="card col" style={{ gap:10 }}>
            <div className="lbl">IMPORTER BACKUP</div>
            <div style={{ fontSize:12, color:G.muted, lineHeight:1.7 }}>
              Velg en backup-fil for å gjenopprette data. Dette erstatter alle nåværende data.
            </div>
            <input type="file" accept=".json"
              onChange={e => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => {
                  try {
                    const d = JSON.parse(ev.target.result);
                    if (!d.clients) { alert("Ugyldig backup-fil"); return; }
                    if (!window.confirm("Dette vil erstatte alle nåværende data. Er du sikker?")) return;
                    if (window._coachSetClients) window._coachSetClients(d.clients);
                    if (d.brand && setBrand) setBrand(d.brand);
                    alert("Backup importert! Last inn siden på nytt.");
                  } catch(err) { alert("Klarte ikke lese filen: "+err.message); }
                };
                reader.readAsText(file);
              }}
              style={{ fontSize:13 }} />
            <div style={{ fontSize:11, color:G.orange, background:G.orange+"11", border:"1px solid "+G.orange+"33", borderRadius:6, padding:"8px 10px" }}>
              Advarsel: import erstatter ALL eksisterende data permanent.
            </div>
          </div>
        </div>
      )}

      {tab !== "backup" && (
        <button className="btn btn-lime" style={{ alignSelf:"flex-start", padding:"10px 24px", fontSize:14 }}
          onClick={save}>
          Lagre innstillinger
        </button>
      )}
    </div>
  );
}
