import {startDiscordLogin,finishDiscordLoginIfNeeded,observeBcsoAuth,logoutBcso,db} from "./firebase-auth.js";
import {collection,onSnapshot,doc,updateDoc,setDoc,query,where} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
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
observeBcsoAuth(async s=>{if(!s){show("Connexion requise. Votre compte doit posséder le rôle BCSO.");return;}if(!s.claims?.bcso){await logoutBcso();show("Accès refusé : rôle BCSO requis.");return;}permissions(s.claims);startAgentsSync(s.claims);startServicesSync(s);hide();});
