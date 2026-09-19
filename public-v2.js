import { auth, db, storage, startCitizenDiscordLogin, startBcsoDiscordLogin, observeAuth } from "./firebase-auth.js";
import { doc, setDoc, serverTimestamp, collection, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-storage.js";
import { ensureConversation, sendPortalMessage, watchMessages } from "./messaging-v2.js";


(()=>{
 const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
 const publicSite=$("#publicSite"), proShell=$("#proShell"), login=$("#publicProLogin"), back=$("#backPublicBtn");
 const store=(k,v)=>localStorage.setItem(k,JSON.stringify(v)), load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
 const uid=()=>auth.currentUser?.uid||null;
 const verifiedUid=()=>{const u=auth.currentUser;if(!u?.uid)throw new Error("Session Firebase absente. Reconnectez-vous avec Discord.");return u.uid;};
 let currentAuth=null, chatUnsub=null, citizenRequestsUnsubs=[];
 let firestoreCitizenContacts=[], firestorePermitRequests=[];
 const authMode=()=>localStorage.getItem("bcso_auth_mode")||"";
 const isCitizenSession=()=>!!auth.currentUser; // Toute session Firebase valide peut utiliser les services citoyens, y compris un agent BCSO connecté.
 const discordProfile=()=>load("bcso_discord_profile",{});

 function route(name){
   $$(".public-view").forEach(x=>x.classList.remove("active"));
   $("#public-"+name)?.classList.add("active");
   $$(".public-nav [data-public-route]").forEach(x=>x.classList.toggle("active",x.dataset.publicRoute===name));
   window.scrollTo({top:0,behavior:"smooth"});
 }
 document.addEventListener("click",e=>{
   const protectedRoute=e.target.closest("[data-citizen-protected]");
   if(protectedRoute && !isCitizenSession()){
     e.preventDefault();
     sessionStorage.setItem("bcso_citizen_pending_action", protectedRoute.dataset.citizenProtected || "profile");
     startCitizenDiscordLogin();
     return;
   }
   const action=e.target.closest("[data-citizen-action]");
   if(action){
     e.preventDefault();
     const target=action.dataset.citizenAction;
     if(!isCitizenSession()){
       sessionStorage.setItem("bcso_citizen_pending_action",target);
       startCitizenDiscordLogin();
       return;
     }
     const el=target==="permit"?$("#permitForm"):$("#contactForm");
     el?.scrollIntoView({behavior:"smooth",block:"start"});
     return;
   }
   const b=e.target.closest("[data-public-route]"); if(b){e.preventDefault();route(b.dataset.publicRoute)}
 });
 function showPublic(){publicSite.style.display="";proShell?.classList.remove("pro-visible");history.replaceState(null,"","#accueil")}
 function showPro(){publicSite.style.display="none";proShell?.classList.add("pro-visible");history.replaceState(null,"","#pro")}
 back?.addEventListener("click",showPublic);
 login?.addEventListener("click",()=>{ sessionStorage.setItem("bcso_pro_pending","1"); startBcsoDiscordLogin(); });
 $("#citizenLoginBtn")?.addEventListener("click",()=>{ sessionStorage.setItem("bcso_citizen_pending_action","services"); startCitizenDiscordLogin(); });
 function syncCitizenGate(){
   const ok=isCitizenSession();
   [$("#permitAppointmentForm"),$("#citizenContactForm")].forEach(form=>{ if(!form)return; form.querySelectorAll("input,select,textarea,button").forEach(el=>el.disabled=!ok); });
   const banner=$("#citizenAuthBanner");
   if(banner){
     banner.classList.toggle("citizen-authenticated",ok);
     const title=banner.querySelector("h2"), desc=banner.querySelector("p"), btn=$("#citizenLoginBtn");
     const p=discordProfile();
     if(ok){
       if(title) title.textContent="Vous êtes déjà connecté avec Discord";
       if(desc) desc.textContent=`Session sécurisée active${p.username||p.global_name ? ` · ${p.global_name||p.username}` : ""}. Vous pouvez envoyer vos demandes et consulter votre suivi.`;
       if(btn) btn.textContent="Accéder à mon espace";
     }else{
       if(title) title.textContent="Connectez-vous avec Discord pour effectuer une démarche";
       if(desc) desc.textContent="La consultation du site reste publique. Discord est demandé uniquement pour déposer une demande, contacter le BCSO ou accéder à votre suivi.";
       if(btn) btn.textContent="Se connecter avec Discord";
     }
   }
 }
 observeAuth(state=>{
   currentAuth=state; const p=discordProfile(); syncCitizenGate();

  // Connexion professionnelle BCSO
  if(state?.claims?.bcso && sessionStorage.getItem("bcso_pro_pending")==="1"){
    sessionStorage.removeItem("bcso_pro_pending");
    showPro();
  }
   if(login) login.innerHTML=state?`<span>●</span> ${p.username||p.global_name||"Mon espace"}`:`<span>♙</span> Se connecter avec Discord`;
   const citizenBtn=$("#citizenLoginBtn"); if(citizenBtn) citizenBtn.textContent=state?"Accéder à mon espace":"Se connecter avec Discord";
   if(state && isCitizenSession()){
     const c=load("bcso_v2_citizen",{});store("bcso_v2_citizen",{...c,uid:state.user.uid,discordId:state.claims.discordId||p.id||"",name:p.global_name||p.username||"Civil"});
     startCitizenRequestsWatch();renderLicenses();
     const pending=sessionStorage.getItem("bcso_citizen_pending_action");
     if(pending){
       sessionStorage.removeItem("bcso_citizen_pending_action");
       if(pending==="profile"){route("profile");}
       else if(pending==="recruitment"){route("recruitment");}
       else {route("services"); setTimeout(()=>{const el=pending==="permit"?$("#permitForm"):pending==="contact"?$("#contactForm"):null;el?.scrollIntoView({behavior:"smooth",block:"start"});},100);}
     }
   }
 });

 window.addEventListener("bcso:citizen-auth-error",e=>{
   const message=e.detail?.message||"Connexion Discord impossible.";
   const banner=$("#citizenAuthBanner");
   if(banner){banner.classList.remove("citizen-authenticated");banner.dataset.authError="1";const p=banner.querySelector("p");if(p)p.textContent=message;}
   route("services");
 });

 syncCitizenGate();
 // Public recruitment form remains visual until citizen auth/backend deployment.
$("#candidateApplication")?.addEventListener("submit",async e=>{
  e.preventDefault();
  const form=e.currentTarget;
  const note=$("#applicationNote");
  let stage="auth";

  try{
    const user=await requireCitizen("recruitment",note);
    if(!user)return;

    if(!characterId()){
      if(note)note.textContent="Créez d’abord votre personnage RP avant de déposer votre candidature.";
      $("#characterModal").hidden=false;
      return;
    }

    const f=new FormData(form);
    const ownerUid=user.uid;
    const id="BCSA-"+new Date().getFullYear()+"-"+String(Date.now()).slice(-6);
    const base=`citizens/${ownerUid}/applications/${id}`;

    if(note)note.textContent="Envoi de votre dossier BCSA…";

    stage="storage";

    const identity=f.get("identity");
    const drivingFiles=f.getAll("drivingLicense").filter(file=>file?.size);
    const cv=f.get("cv");
    const motivation=f.get("motivationLetter");
    const psychological=f.get("psychologicalTest");
    const firearm=f.get("firearmAptitude");

    if(!identity?.size || !drivingFiles.length || !cv?.size ||
       !motivation?.size || !psychological?.size || !firearm?.size){
      throw new Error("Tous les documents demandés sont obligatoires.");
    }

    const identityUrl=await uploadFile(identity,`${base}/identity-${identity.name}`);
    const drivingLicenseUrls=[];

    for(let i=0;i<drivingFiles.length;i++){
      const file=drivingFiles[i];
      drivingLicenseUrls.push(
        await uploadFile(file,`${base}/driving-license-${i+1}-${file.name}`)
      );
    }

    const cvUrl=await uploadFile(cv,`${base}/cv-${cv.name}`);
    const motivationLetterUrl=await uploadFile(motivation,`${base}/motivation-${motivation.name}`);
    const psychologicalTestUrl=await uploadFile(psychological,`${base}/psychological-${psychological.name}`);
    const firearmAptitudeUrl=await uploadFile(firearm,`${base}/firearm-${firearm.name}`);

    const firstName=String(f.get("firstName")||"").trim();
    const lastName=String(f.get("lastName")||"").trim();
    const candidateName=[firstName,lastName].filter(Boolean).join(" ");

    stage="firestore";

    await setDoc(doc(db,"applications",id),{
      id,
      ownerUid,
      citizenUid:ownerUid,
      citizenDiscordId:discordId(),
      characterId:characterId(),
      firstName,
      lastName,
      name:candidateName,
      birthDate:String(f.get("birthDate")||""),
      phone:String(f.get("phone")||""),
      targetService:"bcsa",
      status:"Reçue",
      documents:{
        identityUrl,
        drivingLicenseUrls,
        cvUrl,
        motivationLetterUrl,
        psychologicalTestUrl,
        firearmAptitudeUrl
      },
      createdAt:serverTimestamp(),
      updatedAt:serverTimestamp()
    });

    stage="conversation";

    await ensureConversation({
      conversationId:id,
      kind:"bcsa",
      subject:"Candidature BCSA",
      citizenUid:ownerUid,
      citizenDiscordId:discordId(),
      targetService:"bcsa",
      characterId:characterId(),
      citizenName:candidateName,
      citizenFirstName:firstName,
      citizenLastName:lastName
    });

    stage="message";

    await sendPortalMessage({
      conversationId:id,
      senderId:ownerUid,
      senderType:"citizen",
      senderLabel:candidateName,
      text:"Bonjour, je viens de déposer ma candidature à la Blaine County Sheriff's Academy.",
      targetService:"bcsa"
    });

    if(note)note.innerHTML=`<strong>Candidature ${id} envoyée.</strong><br>Votre dossier a été transmis à la BCSA.`;
    form.reset();
    setTimeout(()=>route("profile"),1200);

  }catch(err){
    console.error("BCSO BCSA submit failed",err);
    if(note)note.textContent=
      err?.code==="permission-denied"
        ? `Firebase bloque l’étape « ${stage} » (permission-denied).`
        : `Impossible d’envoyer la candidature à l’étape « ${stage} » : ${err?.message||err?.code||String(err)}`;
  }
});


 // --- V2.3 Discord account -> RP character ---
 const player=()=>load("bcso_v23_player",{discordId:null,discordName:null,avatar:null,authenticated:false});
 const activeCharacter=()=>load("bcso_v23_active_character",null);
 function characterId(){ return activeCharacter()?.id || null; }
 function renderCharacter(){
   const c=activeCharacter();
   const n=$("#characterName"), r=$("#characterRef");
   if(n)n.textContent=c?`${c.firstName} ${c.lastName}`:"Aucun personnage configuré";
   if(r)r.textContent=c?`${c.id} · Personnage actif`:"Connectez-vous avec Discord puis créez votre identité RP.";
 }
 $("#characterSwitchBtn")?.addEventListener("click",()=>{$("#characterModal").hidden=false});
 $("#closeCharacterModal")?.addEventListener("click",()=>$("#characterModal").hidden=true);
 $("#characterForm")?.addEventListener("submit",e=>{
   e.preventDefault();const f=new FormData(e.currentTarget);
   const id="CHR-"+crypto.getRandomValues(new Uint32Array(1))[0].toString(16).toUpperCase().padStart(8,"0");
   const c={id,firstName:f.get("firstName"),lastName:f.get("lastName"),birthDate:f.get("birthDate"),status:"active",createdAt:new Date().toISOString()};
   const all=load("bcso_v23_characters",[]);all.push(c);store("bcso_v23_characters",all);store("bcso_v23_active_character",c);
   $("#characterModal").hidden=true;renderCharacter();renderCitizenRequests();renderLicenses();
 });
 $("#archiveCharacterBtn")?.addEventListener("click",()=>{
   const c=activeCharacter(); if(!c)return alert("Aucun personnage actif.");
   if(!confirm("Archiver ce personnage ? Ses permis seront invalidés et son historique sera conservé."))return;
   const chars=load("bcso_v23_characters",[]);const x=chars.find(v=>v.id===c.id);if(x){x.status="archived";x.archivedAt=new Date().toISOString()}store("bcso_v23_characters",chars);
   const licenses=load("bcso_v2_licenses",[]);licenses.forEach(p=>{if(p.characterId===c.id){p.status="invalidated";p.invalidatedReason="character_wipe"}});store("bcso_v2_licenses",licenses);
   localStorage.removeItem("bcso_v23_active_character");renderCharacter();renderLicenses();
 });
 renderCharacter();

 async function requireCitizen(action="services", output=null){
   const fail=(message)=>{ if(output) output.textContent=message; else alert(message); };
   try{
     const user=auth.currentUser;
     if(!user?.uid){
       sessionStorage.setItem("bcso_citizen_pending_action",action);
       fail("Connexion Discord requise. Ouverture de l’authentification…");
       startCitizenDiscordLogin();
       return null;
     }
     // Force Firebase à confirmer la session avant toute écriture protégée.
     await user.getIdToken(true);
     return user;
   }catch(err){
     console.error("BCSO citizen auth check failed",err);
     fail("Votre session Discord/Firebase n’est plus valide. Reconnectez-vous puis réessayez. ("+(err?.code||err?.message||"auth-error")+")");
     return null;
   }
 }
 async function uploadFile(file,path){ if(!file||!auth.currentUser)return null; const r=ref(storage,path);await uploadBytes(r,file);return getDownloadURL(r); }
 function discordId(){const p=discordProfile();return p.id||load("bcso_v2_citizen",{}).discordId||"";}
 // Dynamic permit form.
 const permitForm=$("#permitAppointmentForm");
 function refreshPermitRequirements(){
   if(!permitForm)return;
   const permit=permitForm.permitType.value, usage=permitForm.usage.value;
   const personal=usage==="personal";
   $("#physicalProofWrap").hidden=!(personal&&permit==="fishing");
   $("#firearmProofWrap").hidden=!(personal&&permit==="hunting");
   $("#permitPrice").textContent=usage==="professional"?"3 000 $ + 500 $ en liquide pour la carte physique":"6 000 $ + 500 $ en liquide pour la carte physique";
 }
 permitForm?.permitType.addEventListener("change",refreshPermitRequirements);
 permitForm?.usage.addEventListener("change",refreshPermitRequirements);
 refreshPermitRequirements();

 permitForm?.addEventListener("submit",async e=>{
   e.preventDefault();
   const result=$("#permitRequestResult");
   if(result) result.textContent="Vérification de votre session…";
   let stage="auth";
   try{
    const user=await requireCitizen("permit",result); if(!user)return;
    if(!characterId()){
      if(result) result.textContent="Créez d’abord votre personnage RP pour rattacher la demande à la bonne identité.";
      $("#characterModal").hidden=false; return;
    }
    const f=new FormData(permitForm), id="PR-"+new Date().getFullYear()+"-"+String(Date.now()).slice(-6);
    if(result) result.textContent="Envoi de la demande…";
    const ownerUid=user.uid;
    const base=`citizens/${ownerUid}/park-ranger/${id}`;
    const identity=f.get("identity");
    if(!identity?.size) throw new Error("La pièce d’identité est obligatoire.");
    stage="storage-identity";
    const identityUrl=await uploadFile(identity,`${base}/identity-${identity.name||"document"}`);
    const physicalUrl=f.get("physicalProof")?.size?await uploadFile(f.get("physicalProof"),`${base}/physical-${f.get("physicalProof").name}`):null;
    const firearmUrl=f.get("firearmProof")?.size?await uploadFile(f.get("firearmProof"),`${base}/firearm-${f.get("firearmProof").name}`):null;
    const character=activeCharacter();
    const citizenFirstName=character?.firstName||"";
    const citizenLastName=character?.lastName||"";
    const citizenName=[citizenFirstName,citizenLastName].filter(Boolean).join(" ")||String(f.get("name")||"").trim();
    const permitLabel=f.get("permitType")==="fishing"?"Permis de pêche":"Permis de chasse";
    const usageLabel=f.get("usage")==="professional"?"Professionnel":"Personnel";
    const req={id,ownerUid,citizenUid:ownerUid,citizenDiscordId:discordId(),characterId:characterId(),name:citizenName,citizenFirstName,citizenLastName,permitType:f.get("permitType"),usage:f.get("usage"),targetService:"park-ranger",status:"Nouvelle demande",documents:{identityUrl,physicalUrl,firearmUrl},createdAt:serverTimestamp(),appointment:null};
    stage="parkRangerAppointments";
    await setDoc(doc(db,"parkRangerAppointments",id),req);
    stage="conversation";
    await ensureConversation({conversationId:id,kind:"park_ranger",subject:`${permitLabel} · ${usageLabel}`,citizenUid:ownerUid,citizenDiscordId:discordId(),targetService:"park-ranger",characterId:characterId(),citizenName,citizenFirstName,citizenLastName});
    stage="message";
    await sendPortalMessage({conversationId:id,senderId:ownerUid,senderType:"citizen",senderLabel:citizenName,text:"Bonjour, je viens de déposer ma demande de permis et souhaite convenir d’un rendez-vous.",targetService:"park-ranger"});
    if(result) result.innerHTML=`<strong>Demande ${id} envoyée.</strong><br>La discussion avec les Park Rangers est maintenant ouverte depuis « Mon espace ».`;
    permitForm.reset(); refreshPermitRequirements();
    setTimeout(()=>route("profile"),700);
   }catch(err){
    console.error("BCSO permit submit failed",err);
    if(result) result.textContent=err?.code==="permission-denied"?`Firebase bloque l’étape « ${stage} » (permission-denied). UID connecté : ${auth.currentUser?.uid||"absent"}.`:`Impossible d’envoyer la demande à l’étape « ${stage} » : `+(err?.message||err?.code||String(err));
   }
 });

 $("#citizenContactForm")?.addEventListener("submit",async e=>{
   e.preventDefault();
   const form=e.currentTarget, out=$("#contactResult");
   if(out) out.textContent="Vérification de votre session…";
   let stage="auth";
   try{
    const user=await requireCitizen("contact",out); if(!user)return;
    if(!characterId()){
      if(out) out.textContent="Créez d’abord votre personnage RP pour rattacher le message à la bonne identité.";
      $("#characterModal").hidden=false; return;
    }
    const f=new FormData(form), id="CNT-"+new Date().getFullYear()+"-"+String(Date.now()).slice(-6), ownerUid=user.uid;
    stage="citizenContacts";
    if(out) out.textContent="Enregistrement du contact…";
    await setDoc(doc(db,"citizenContacts",id),{id,ownerUid,citizenUid:ownerUid,citizenDiscordId:discordId(),characterId:characterId(),name:f.get("name"),category:f.get("category"),subject:f.get("subject"),status:"Ouvert",createdAt:serverTimestamp()});
    stage="conversation";
    if(out) out.textContent="Ouverture de la conversation…";
    await ensureConversation({conversationId:id,kind:"citizen_contact",subject:f.get("subject"),citizenUid:ownerUid,citizenDiscordId:discordId(),targetService:"citizen_contact",characterId:characterId()});
    stage="message";
    if(out) out.textContent="Envoi du message…";
    await sendPortalMessage({conversationId:id,senderId:ownerUid,senderType:"citizen",senderLabel:f.get("name"),text:f.get("message"),targetService:"citizen_contact"});
    if(out) out.innerHTML=`<strong>Demande ${id} envoyée.</strong> Vous pouvez suivre la réponse dans Mon espace.`;
    form.reset();
    setTimeout(()=>route("profile"),700);
   }catch(err){
    console.error("BCSO contact submit failed",err);
    if(out) out.textContent=err?.code==="permission-denied"?`Firebase bloque l’étape « ${stage} » (permission-denied). UID connecté : ${auth.currentUser?.uid||"absent"}.`:`Impossible d’envoyer à l’étape « ${stage} » : `+(err?.message||err?.code||String(err));
   }
 });

 function permitLabel(r){return `${r.permitType==="fishing"?"Pêche":"Chasse"} · ${r.usage==="professional"?"Professionnel":"Personnel"}`}
 function startCitizenRequestsWatch(){
   citizenRequestsUnsubs.forEach(fn=>{try{fn()}catch{}});
   citizenRequestsUnsubs=[];
   const ownerUid=auth.currentUser?.uid;
   if(!ownerUid){firestoreCitizenContacts=[];firestorePermitRequests=[];renderCitizenRequests();return;}
   const contactsQ=query(collection(db,"citizenContacts"),where("ownerUid","==",ownerUid));
   const permitsQ=query(collection(db,"parkRangerAppointments"),where("ownerUid","==",ownerUid));
   citizenRequestsUnsubs.push(onSnapshot(contactsQ,snap=>{
     firestoreCitizenContacts=snap.docs.map(d=>({id:d.id,...d.data()}));
     renderCitizenRequests();
   },err=>{console.error("Citizen contacts watch failed",err);renderCitizenRequests(err); }));
   citizenRequestsUnsubs.push(onSnapshot(permitsQ,snap=>{
     firestorePermitRequests=snap.docs.map(d=>({id:d.id,...d.data()}));
     renderCitizenRequests();
   },err=>{console.error("Park Ranger requests watch failed",err);renderCitizenRequests(err); }));
 }
 function renderCitizenRequests(loadError=null){
   const box=$("#citizenRequests"); if(!box)return;
   // Les requêtes Firestore sont déjà sécurisées et filtrées par ownerUid.
   // Ne pas filtrer à nouveau par characterId : un changement de personnage actif
   // masquait des demandes pourtant bien enregistrées pour le même compte Discord.
   const contacts=firestoreCitizenContacts.map(r=>({
     ...r, requestKind:"contact", title:r.subject||r.category||"Contact BCSO", status:r.status||"Ouvert"
   }));
   const permits=firestorePermitRequests.map(r=>({
     ...r, requestKind:"permit", title:permitLabel(r), status:r.status||"Nouvelle demande"
   }));
   const a=[...contacts,...permits].sort((x,y)=>{
     const tx=x.createdAt?.toMillis?.()||0, ty=y.createdAt?.toMillis?.()||0; return ty-tx;
   });
   if(!a.length){
     box.innerHTML=`<div class="public-empty">${loadError?"Impossible de charger vos demandes pour le moment.":"Aucune demande pour le moment."}</div>`;
     return;
   }
   box.innerHTML=a.map(r=>`<article class="request-row"><div><small>${r.id}</small><strong>${String(r.title||"Demande").replace(/[<>]/g,"")}</strong><span>${String(r.status||"").replace(/[<>]/g,"")}</span></div><button class="public-secondary open-chat" data-conv="${r.id}">Ouvrir la discussion</button></article>`).join("");
 }
 function renderParkRequests(){
   const box=$("#parkRequests"); if(!box)return; const a=load("bcso_v2_permit_requests",[]);
   box.innerHTML=a.length?a.map(r=>`<article class="pro-request"><div><small>${r.id}</small><b>${r.name||"Civil"}</b><span>${permitLabel(r)} · ${r.status}</span></div><button class="open-chat" data-conv="${r.id}">Discussion</button><button class="fix-appt" data-id="${r.id}">Fixer RDV</button></article>`).join(""):`<p class="muted">Aucune demande.</p>`;
 }
 document.addEventListener("click",e=>{
   const c=e.target.closest(".open-chat"); if(c){store("bcso_v2_current_conversation",c.dataset.conv);openChat(c.dataset.conv)}
   const f=e.target.closest(".fix-appt"); if(f)openAppointmentDialog(f.dataset.id);
 });
 function openChat(id){ const modal=$("#v2ChatModal");if(!modal)return;modal.hidden=false;$("#chatTitle").textContent=`Conversation · ${id}`;if(chatUnsub)chatUnsub(); if(auth.currentUser){chatUnsub=watchMessages(id,msgs=>renderFirestoreMessages(msgs));}else renderMessages(id); }
 function renderFirestoreMessages(msgs){const box=$("#v2ChatMessages");if(!box)return;box.innerHTML=msgs.map(m=>`<div class="chat-msg ${m.senderType}"><small>${m.senderLabel||m.senderType}</small><p>${String(m.text||"").replace(/[<>]/g,"")}</p></div>`).join("");box.scrollTop=box.scrollHeight;}
 $("#closeV2Chat")?.addEventListener("click",()=>$("#v2ChatModal").hidden=true);
 $("#v2ChatForm")?.addEventListener("submit",async e=>{e.preventDefault();const id=load("bcso_v2_current_conversation",""),input=$("#v2ChatInput");if(!id||!input.value.trim())return;const text=input.value.trim();input.value="";try{if(auth.currentUser)await sendPortalMessage({conversationId:id,senderId:uid(),senderType:proShell?.classList.contains("pro-visible")?"bcso":"citizen",senderLabel:proShell?.classList.contains("pro-visible")?"BCSO":(activeCharacter()?`${activeCharacter().firstName} ${activeCharacter().lastName}`:"Civil"),text,targetService:id.startsWith("PR-")?"park-ranger":"citizen_contact"});else throw new Error("Connexion Discord requise");}catch(err){alert(err.message||err);}});
 function renderMessages(id){
   const box=$("#v2ChatMessages"), msgs=load("bcso_v2_messages",{})[id]||[]; if(!box)return;
   box.innerHTML=msgs.map(m=>`<div class="chat-msg ${m.sender}"><small>${m.sender==="bcso"?"BCSO":"Civil"} · ${new Date(m.at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</small><p>${String(m.text).replace(/[<>]/g,"")}</p></div>`).join("");box.scrollTop=box.scrollHeight;
 }
 function openAppointmentDialog(id){
   store("bcso_v2_appt_id",id); $("#appointmentDialog").hidden=false; $("#appointmentDialogId").textContent=id;
 }
 $("#closeAppointmentDialog")?.addEventListener("click",()=>$("#appointmentDialog").hidden=true);
 $("#appointmentForm")?.addEventListener("submit",e=>{
   e.preventDefault(); const id=load("bcso_v2_appt_id",""), f=new FormData(e.currentTarget), a=load("bcso_v2_permit_requests",[]), r=a.find(x=>x.id===id); if(!r)return;
   r.appointment={date:f.get("date"),time:f.get("time"),place:"Poste de Bolingbroke"};r.status="Rendez-vous confirmé";store("bcso_v2_permit_requests",a);$("#appointmentDialog").hidden=true;renderParkRequests();renderCitizenRequests();
   const price=r.usage==="professional"?"3 000 $":"6 000 $";
   alert(`Rendez-vous confirmé\nDate et heure : ${r.appointment.date} à ${r.appointment.time}\nLieu : Poste de Bolingbroke\nInfos : Prévoir ${price} + 500 $ en liquide pour la carte physique.\n\nLe backend Discord enverra ce récapitulatif au civil.`);
 });

 // Citizen permits, 3-month validity.
 function renderLicenses(){
   const box=$("#citizenLicenses");if(!box)return;const a=load("bcso_v2_licenses",[]).filter(x=>!characterId()||x.characterId===characterId());
   box.innerHTML=a.length?a.map(p=>{const exp=new Date(p.expiresAt),days=Math.ceil((exp-Date.now())/86400000),state=days<0?"Expiré":days<=14?"Expire prochainement":"Valide";return `<article class="license-card"><small>${p.id}</small><h3>${p.type}</h3><span class="${state==="Valide"?"ok":"warn"}">${state}</span><p>Délivré : ${new Date(p.issuedAt).toLocaleDateString()}<br>Expire : ${exp.toLocaleDateString()}<br>Carte physique : ${p.cardPhysical?"Délivrée":"Non délivrée"}</p><button class="public-secondary">Renouveler</button></article>`}).join(""):`<div class="public-empty">Aucun permis actif.</div>`;
 }

 renderCitizenRequests();renderParkRequests();renderLicenses();
 if(location.hash==="#pro")showPro();else showPublic();
})();
