import {startDiscordLogin,finishDiscordLoginIfNeeded,observeBcsoAuth,logoutBcso,db} from "./firebase-auth.js";
import {collection,onSnapshot,doc,updateDoc,setDoc,deleteDoc,query,where} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
const gate=document.querySelector("#authGate"), login=document.querySelector("#discordLoginBtn"), logout=document.querySelector("#logoutBtn"), status=document.querySelector("#authStatus");
function avatar(p){if(!p?.avatar||!p?.discordId)return null;const e=p.avatar.startsWith("a_")?"gif":"webp";return `https://cdn.discordapp.com/avatars/${p.discordId}/${p.avatar}.${e}?size=256`;}
function syncProfile(p){
  if(!p)return; const k="bcso_demo_profile"; let c={}; try{c=JSON.parse(localStorage.getItem(k)||"{}")}catch{}
  const da=avatar(p), next={...c,name:p.displayName||p.username||"Agent BCSO",rank:p.gradeLabel||"Non classé",discordId:p.discordId,badge:p.badge||c.badge||null,badgeLocked:Boolean(p.badgeLocked),discordAvatar:da,avatar:c.avatar&&c.avatar!==c.discordAvatar?c.avatar:da};
  localStorage.setItem(k,JSON.stringify(next));
  [["#sidebarName","textContent",next.name],["#sidebarRank","textContent",next.rank],["#profileName","value",next.name],["#profileRank","value",next.rank]].forEach(([s,k,v])=>{const e=document.querySelector(s);if(e)e[k]=v});
  ["#sidebarAvatar","#profilePreview"].forEach(s=>{const e=document.querySelector(s);if(e&&next.avatar)e.src=next.avatar});
}
function section(s,ok){const a=document.querySelector(`[data-nav-section="${s}"]`),b=document.querySelector(`[data-nav-content="${s}"]`);if(a)a.hidden=!ok;if(b)b.hidden=!ok;}
function permissions(c={}){
  const d=Array.isArray(c.divisions)?c.divisions:[];
  section("supervision",!!c.supervision); section("bcsa",d.includes("bcsa")||!!c.supervision); section("investigation",d.includes("investigation")||!!c.supervision); section("seb",d.includes("seb")||!!c.supervision);
  const site=document.querySelector('[data-view="siteManagement"]');if(site)site.hidden=!c.siteManager;
  window.BCSO_AUTH={claims:c};
  window.dispatchEvent(new CustomEvent("bcso:auth-ready",{detail:{claims:c}}));
}
function show(m){if(gate)gate.hidden=false;if(status)status.textContent=m;if(logout)logout.hidden=true;}
function hide(){if(gate)gate.hidden=true;if(logout)logout.hidden=false;}
login?.addEventListener("click",()=>{if(status)status.textContent="Redirection vers Discord…";startDiscordLogin();});
logout?.addEventListener("click",async()=>{await logoutBcso();location.replace("https://bouhamouches-pixel.github.io/ID-BCSO/");});
show("Vérification de la session…");
try{const p=await finishDiscordLoginIfNeeded();if(p)syncProfile(p);}catch(e){console.error(e);show(e.message);}

let stopAgentsSync=null;
function startAgentsSync(claims){
  if(stopAgentsSync){stopAgentsSync();stopAgentsSync=null}
  if(!claims?.bcso)return;
  stopAgentsSync=onSnapshot(collection(db,"agents"),snap=>{
    const agents=snap.docs.map(d=>{
      const x=d.data(),ts=v=>v?.toDate?v.toDate().toISOString():(typeof v==="string"?v:"");
      return {id:d.id,...x,firstLoginAt:ts(x.firstLoginAt),lastLoginAt:ts(x.lastLoginAt),createdAt:ts(x.createdAt),updatedAt:ts(x.updatedAt)};
    });

    // Migration automatique des comptes déjà connectés avant la correction :
    // [SHF-124], [CMD-133], [CPT-177], [SND-178], etc.
    if(claims?.supervision) for(const agent of agents){
      if(agent.badge)continue;
      const source=agent.displayName||agent.globalName||agent.username||"";
      const match=String(source).match(/\[[^\]]*?[-–—]\s*(\d{2,4})\s*\]/i)
        || String(source).match(/#\s*(\d{2,4})\b/)
        || String(source).match(/\[\s*(\d{2,4})\s*\]/);
      if(match){
        updateDoc(doc(db,"agents",agent.id),{
          badge:String(parseInt(match[1],10)),
          badgeLocked:true,
          badgeSource:"discord-display-name"
        }).catch(err=>console.error("Auto badge migration:",agent.id,err));
      }
    }

    window.dispatchEvent(new CustomEvent("bcso:firebase-agents",{detail:agents}));
  },err=>console.error("Agent sync Firestore:",err));
}
window.addEventListener("bcso:set-agent-badge",async e=>{
  const id=e.detail?.id,badge=e.detail?.badge;
  if(!id)return;
  try{
    if(badge!==null&&badge!==undefined){
      const normalized=String(parseInt(badge,10));
      if(!/^\d{3}$/.test(normalized))throw new Error("Matricule invalide");
      await updateDoc(doc(db,"agents",id),{
        badge:normalized,
        badgeLocked:true,
        badgeSource:"manual-supervision"
      });
    }else{
      await updateDoc(doc(db,"agents",id),{
        badge:null,
        badgeLocked:false,
        badgeSource:"manual-supervision"
      });
    }
  }catch(err){
    console.error(err);
    alert("Impossible de modifier le matricule dans Firebase.");
  }
});

window.addEventListener("bcso:ack-agent",async e=>{
  const id=e.detail?.id;if(!id)return;
  try{await updateDoc(doc(db,"agents",id),{onboardingState:"active"});window.dispatchEvent(new CustomEvent("bcso:agent-acknowledged",{detail:{id}}))}
  catch(err){console.error(err);alert("Impossible de valider cette nouvelle connexion.")}
});


let currentSession=null,stopServicesSync=null;
const serviceIso=v=>v?.toDate?v.toDate().toISOString():(typeof v==="string"?v:null);
function serviceDocId(uid,start){const t=Date.parse(start);return `${uid.replace(/[^a-zA-Z0-9_-]/g,"_")}_${Number.isFinite(t)?t:Date.now()}`;}
function startServicesSync(session){
  if(stopServicesSync){stopServicesSync();stopServicesSync=null}
  currentSession=session;if(!session?.claims?.bcso)return;
  const uid=session.user.uid;
  const source=session.claims?.supervision?collection(db,"services"):query(collection(db,"services"),where("agentId","==",uid));
  stopServicesSync=onSnapshot(source,snap=>{
    const services=snap.docs.map(d=>{const x=d.data();return{id:d.id,...x,start:serviceIso(x.start),end:serviceIso(x.end)};}).filter(s=>s.start);
    window.dispatchEvent(new CustomEvent("bcso:firebase-services",{detail:services}));
  },err=>console.error("Services sync Firestore:",err));
}
window.addEventListener("bcso:start-duty",async e=>{
  const s=currentSession;if(!s?.claims?.bcso)return;
  const start=e.detail?.start||new Date().toISOString(),uid=s.user.uid,id=serviceDocId(uid,start);
  try{await setDoc(doc(db,"services",id),{agentId:uid,discordId:s.claims.discordId||null,badge:s.claims.badge||null,grade:s.claims.gradeLabel||null,start,end:null,status:"active",source:"portal",createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()},{merge:true})}
  catch(err){console.error(err);alert("La prise de service n'a pas pu être synchronisée avec Firebase.")}
});
window.addEventListener("bcso:end-duty",async e=>{
  const s=currentSession;if(!s?.claims?.bcso)return;
  const start=e.detail?.start,end=e.detail?.end||new Date().toISOString();if(!start)return;
  const id=e.detail?.id||serviceDocId(s.user.uid,start);
  try{await updateDoc(doc(db,"services",id),{end,status:"completed",updatedAt:new Date().toISOString()})}
  catch(err){console.error(err);alert("La fin de service n'a pas pu être synchronisée avec Firebase.")}
});
window.addEventListener("bcso:migrate-legacy-services",async e=>{
  const s=currentSession;if(!s?.claims?.bcso)return;
  const uid=s.user.uid,data=e.detail||{},legacy=Array.isArray(data.sessions)?data.sessions:[];
  try{
    for(const x of legacy){
      if(!x?.start||!x?.end)continue;
      await setDoc(doc(db,"services",serviceDocId(uid,x.start)),{agentId:uid,discordId:s.claims.discordId||null,badge:s.claims.badge||null,grade:s.claims.gradeLabel||null,start:x.start,end:x.end,status:"completed",source:"legacy-local-migration",createdAt:x.start,updatedAt:new Date().toISOString()},{merge:true});
    }
    if(data.activeService?.start){
      const x=data.activeService;
      await setDoc(doc(db,"services",serviceDocId(uid,x.start)),{agentId:uid,discordId:s.claims.discordId||null,badge:s.claims.badge||null,grade:s.claims.gradeLabel||null,start:x.start,end:null,status:"active",source:"legacy-local-migration",createdAt:x.start,updatedAt:new Date().toISOString()},{merge:true});
    }
  }catch(err){console.error("Migration services:",err)}
});

let stopReportsSync=null,stopDisciplinarySync=null;
let publicReportsCache=[],disciplinaryReportsCache=[];

function cleanFirestoreValue(value){
  if(Array.isArray(value))return value.map(cleanFirestoreValue);
  if(value&&typeof value==="object"){
    const out={};
    for(const [k,v] of Object.entries(value)){
      if(v!==undefined && !k.startsWith("_"))out[k]=cleanFirestoreValue(v);
    }
    return out;
  }
  return value;
}
function reportDocId(uid,id){
  return `${String(uid).replace(/[^a-zA-Z0-9_-]/g,"_")}_${String(id||Date.now()).replace(/[^a-zA-Z0-9_-]/g,"_")}`;
}
function emitReports(){
  window.dispatchEvent(new CustomEvent("bcso:firebase-reports",{detail:[...publicReportsCache,...disciplinaryReportsCache]}));
}
function startReportsSync(session){
  if(stopReportsSync){stopReportsSync();stopReportsSync=null}
  if(stopDisciplinarySync){stopDisciplinarySync();stopDisciplinarySync=null}
  publicReportsCache=[];disciplinaryReportsCache=[];
  if(!session?.claims?.bcso)return;
  const uid=session.user.uid;

  stopReportsSync=onSnapshot(collection(db,"reports"),snap=>{
    publicReportsCache=snap.docs.map(d=>({firestoreDocId:d.id,_collection:"reports",...d.data()}));
    emitReports();
  },err=>console.error("Reports sync Firestore:",err));

  const disciplinarySource=session.claims?.supervision
    ? collection(db,"disciplinaryReports")
    : query(collection(db,"disciplinaryReports"),where("authorUid","==",uid));

  stopDisciplinarySync=onSnapshot(disciplinarySource,snap=>{
    disciplinaryReportsCache=snap.docs.map(d=>({firestoreDocId:d.id,_collection:"disciplinaryReports",...d.data()}));
    emitReports();
  },err=>console.error("Disciplinary reports sync Firestore:",err));
}

async function upsertReport(raw,source="portal"){
  const s=currentSession;if(!s?.claims?.bcso||!raw?.id)return;
  const uid=s.user.uid;
  const disciplinary=raw.type==="Rapport disciplinaire";
  const targetCollection=disciplinary?"disciplinaryReports":"reports";
  const oldCollection=raw._collection;
  const oldDocId=raw.firestoreDocId;

  const data=cleanFirestoreValue({
    ...raw,
    authorUid:raw.authorUid||uid,
    authorDiscordId:raw.authorDiscordId||s.claims.discordId||null,
    source,
    updatedAt:new Date().toISOString()
  });
  delete data.firestoreDocId;

  // Never let a normal agent save a report under somebody else's identity.
  if(!s.claims.supervision)data.authorUid=uid;

  const id=oldDocId&&oldCollection===targetCollection ? oldDocId : reportDocId(data.authorUid,data.id);
  await setDoc(doc(db,targetCollection,id),data,{merge:true});

  if(oldDocId&&oldCollection&&oldCollection!==targetCollection){
    await deleteDoc(doc(db,oldCollection,oldDocId));
  }
}

window.addEventListener("bcso:save-report",async e=>{
  try{await upsertReport(e.detail?.report,"portal");}
  catch(err){console.error("Save report Firestore:",err);alert("Le rapport a été sauvegardé localement, mais la synchronisation Firebase a échoué.");}
});

window.addEventListener("bcso:migrate-legacy-reports",async e=>{
  const s=currentSession;if(!s?.claims?.bcso)return;
  const list=Array.isArray(e.detail?.reports)?e.detail.reports:[];
  for(const r of list){
    try{
      // Only migrate reports that belong to the currently connected agent.
      if(r.authorDiscordId && s.claims.discordId && String(r.authorDiscordId)!==String(s.claims.discordId))continue;
      await upsertReport(r,"legacy-local-migration");
    }catch(err){console.error("Legacy report migration:",r?.id,err)}
  }
});


const SHARED_STATE_MAP={
  "bcso_demo_events":"agenda",
  "bcso_demo_complaints":"complaints",
  "bcso_demo_warrants":"warrants",
  "bcso_demo_material_requests":"materialRequests",
  "bcso_demo_notifications":"notifications",
  "bcso_demo_convocations":"convocations",
  "bcso_demo_supervision_service_audit":"serviceAudit",
  "bcso_demo_bcsa_interviews":"bcsaInterviews",
  "bcso_demo_bcsa_candidates":"bcsaCandidates",
  "bcso_demo_bcsa_badges":"bcsaBadges",
  "bcso_demo_bcsa_agent_files":"bcsaAgentFiles",
  "bcso_demo_bcsa_patrol_reports":"bcsaPatrolReports",
  "bcso_demo_inv_cases":"investigationCases",
  "bcso_demo_inv_suspects":"investigationSuspects",
  "bcso_demo_inv_witnesses":"investigationWitnesses",
  "bcso_demo_inv_boards":"investigationBoards",
  "bcso_demo_seb_operations":"sebOperations",
  "bcso_demo_seb_boards":"sebBoards",
  "bcso_site_categories":"siteCategories",
  "bcso_site_pages":"sitePages",
  "bcso_site_settings":"siteSettings",
  "bcso_site_audit":"siteAudit"
};
const SHARED_STATE_REVERSE=Object.fromEntries(Object.entries(SHARED_STATE_MAP).map(([k,v])=>[v,k]));
let stopSharedStateSync=[];

function cleanLegacyDemoState(key,value){
  if(!Array.isArray(value))return value;
  const removeIds={
    "bcso_demo_events":new Set(["evt-1","evt-2"]),
    "bcso_demo_complaints":new Set(["P-2026-0040","P-2026-0041","P-2026-0042"]),
    "bcso_demo_warrants":new Set(["M-2026-0001"]),
    "bcso_demo_bcsa_interviews":new Set(["INT-2026-0001"]),
    "bcso_demo_inv_cases":new Set(["INV-2026-0001","INV-2026-0002"]),
    "bcso_demo_inv_suspects":new Set(["SUS-2026-0001","SUS-2026-0002"]),
    "bcso_demo_seb_operations":new Set(["SEB-2026-0001"])
  };
  const set=removeIds[key];
  if(set)value=value.filter(x=>!set.has(String(x?.id||"")));
  if(key==="bcso_demo_bcsa_candidates")value=value.filter(x=>!/^bcsa-c-[1-6]$/.test(String(x?.id||"")));
  return value;
}

function allowedSharedStateIds(claims){
  const ids=["agenda","complaints","warrants","materialRequests","notifications","convocations"];
  if(claims?.supervision)ids.push("serviceAudit");
  const div=Array.isArray(claims?.divisions)?claims.divisions:[];
  if(claims?.supervision||div.includes("bcsa"))ids.push("bcsaInterviews","bcsaCandidates","bcsaBadges","bcsaAgentFiles","bcsaPatrolReports");
  if(claims?.supervision||div.includes("investigation"))ids.push("investigationCases","investigationSuspects","investigationWitnesses","investigationBoards");
  if(claims?.supervision||div.includes("seb"))ids.push("sebOperations","sebBoards");
  if(claims?.siteManager||claims?.admin)ids.push("siteCategories","sitePages","siteSettings","siteAudit");
  return ids;
}
function startSharedStateSync(session){
  stopSharedStateSync.forEach(fn=>{try{fn()}catch{}});stopSharedStateSync=[];
  if(!session?.claims?.bcso)return;
  for(const id of allowedSharedStateIds(session.claims)){
    const stop=onSnapshot(doc(db,"sharedState",id),snap=>{
      if(!snap.exists())return;
      const data=snap.data();
      const key=SHARED_STATE_REVERSE[id];
      if(key)window.dispatchEvent(new CustomEvent("bcso:shared-state",{detail:{key,value:data.value}}));
    },err=>console.error("Shared state",id,err));
    stopSharedStateSync.push(stop);
  }
}
async function writeSharedState(key,value,source="portal"){
  const s=currentSession;if(!s?.claims?.bcso)return;
  const id=SHARED_STATE_MAP[key];if(!id)return;
  const json=JSON.stringify(value??null);
  if(json.length>850000){
    console.error("Shared state trop volumineux",id,json.length);
    alert("Cette donnée est trop volumineuse pour être synchronisée telle quelle avec Firebase. Réduisez les images/pièces jointes de ce module.");
    return;
  }
  await setDoc(doc(db,"sharedState",id),{
    value:cleanFirestoreValue(value),
    updatedAt:new Date().toISOString(),
    updatedBy:s.user.uid,
    source
  },{merge:true});
}
window.addEventListener("bcso:shared-state-write",e=>{
  const {key,value}=e.detail||{};
  writeSharedState(key,value).catch(err=>{console.error("Shared state write",key,err);});
});
window.addEventListener("bcso:migrate-shared-state",async e=>{
  const s=currentSession;if(!s?.claims?.bcso)return;
  const states=e.detail?.states||{};
  const allowed=new Set(allowedSharedStateIds(s.claims));
  for(const [key,raw] of Object.entries(states)){
    const id=SHARED_STATE_MAP[key];if(!id||!allowed.has(id))continue;
    const value=cleanLegacyDemoState(key,raw);
    // N'envoie pas les états vides pendant une migration.
    const empty=Array.isArray(value)?value.length===0:(value&&typeof value==="object"?Object.keys(value).length===0:false);
    if(empty)continue;
    try{
      // merge true: si le doc existe déjà, on n'écrase pas silencieusement depuis un appareil ancien
      // Migration uniquement si ce client a des données; snapshots temps réel prennent ensuite le relais.
      await setDoc(doc(db,"sharedState",id),{
        value:cleanFirestoreValue(value),
        updatedAt:new Date().toISOString(),
        updatedBy:s.user.uid,
        source:"legacy-local-migration"
      },{merge:true});
    }catch(err){console.error("Shared migration",id,err)}
  }
});
observeBcsoAuth(async s=>{if(!s){show("Connexion requise. Votre compte doit posséder le rôle BCSO.");return;}if(!s.claims?.bcso){await logoutBcso();show("Accès refusé : rôle BCSO requis.");return;}currentSession=s;permissions(s.claims);startAgentsSync(s.claims);startServicesSync(s);startReportsSync(s);startSharedStateSync(s);hide();});
