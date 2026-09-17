
(()=>{
 const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
 const publicSite=$("#publicSite"), proShell=$("#proShell"), login=$("#publicProLogin"), back=$("#backPublicBtn");
 const store=(k,v)=>localStorage.setItem(k,JSON.stringify(v)), load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
 const uid=()=>load("bcso_v2_citizen",{uid:"demo-citizen",discordId:"",name:"Civil"}).uid;

 function route(name){
   $$(".public-view").forEach(x=>x.classList.remove("active"));
   $("#public-"+name)?.classList.add("active");
   $$(".public-nav [data-public-route]").forEach(x=>x.classList.toggle("active",x.dataset.publicRoute===name));
   window.scrollTo({top:0,behavior:"smooth"});
 }
 document.addEventListener("click",e=>{
   const b=e.target.closest("[data-public-route]"); if(b){e.preventDefault();route(b.dataset.publicRoute)}
 });
 function showPublic(){publicSite.style.display="";proShell?.classList.remove("pro-visible");history.replaceState(null,"","#accueil")}
 function showPro(){publicSite.style.display="none";proShell?.classList.add("pro-visible");history.replaceState(null,"","#pro")}
 back?.addEventListener("click",showPublic);
 login?.addEventListener("click",()=>{$("#discordLoginBtn")?.click()});

 // Public recruitment form remains visual until citizen auth/backend deployment.
 $("#candidateApplication")?.addEventListener("submit",e=>{
   e.preventDefault();
   const note=$("#applicationNote"); if(note) note.textContent="Dossier prêt à être transmis. Connectez l'authentification candidat Firebase pour l'envoi réel.";
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

 permitForm?.addEventListener("submit",e=>{
   e.preventDefault(); if(!characterId()){ $("#characterModal").hidden=false; return; }
   const f=new FormData(permitForm), id="PR-"+new Date().getFullYear()+"-"+String(Date.now()).slice(-4);
   const req={
     id, citizenUid:uid(), characterId:characterId(), name:f.get("name"), 
     permitType:f.get("permitType"), usage:f.get("usage"), status:"Nouvelle demande",
     createdAt:new Date().toISOString(), appointment:null, unreadCitizen:0, unreadBcso:1
   };
   const a=load("bcso_v2_permit_requests",[]);a.unshift(req);store("bcso_v2_permit_requests",a);
   store("bcso_v2_current_conversation",id);
   $("#permitRequestResult").innerHTML=`<strong>Demande ${id} enregistrée.</strong><br>Une notification Discord de confirmation sera envoyée par le backend. Vous pouvez maintenant discuter avec les Park Rangers afin de fixer le rendez-vous.`;
   renderCitizenRequests(); renderParkRequests();
 });

 $("#citizenContactForm")?.addEventListener("submit",e=>{
   e.preventDefault(); if(!characterId()){ $("#characterModal").hidden=false; return; } const f=new FormData(e.currentTarget), id="CNT-"+new Date().getFullYear()+"-"+String(Date.now()).slice(-4);
   const a=load("bcso_v2_contacts",[]); a.unshift({id,characterId:characterId(),name:f.get("name"),category:f.get("category"),subject:f.get("subject"),message:f.get("message"),status:"Ouvert",createdAt:new Date().toISOString()}); store("bcso_v2_contacts",a);
   $("#contactResult").textContent=`Votre demande ${id} a été enregistrée. Le BCSO pourra vous répondre depuis le portail.`;
 });

 function permitLabel(r){return `${r.permitType==="fishing"?"Pêche":"Chasse"} · ${r.usage==="professional"?"Professionnel":"Personnel"}`}
 function renderCitizenRequests(){
   const box=$("#citizenRequests"); if(!box)return; const a=load("bcso_v2_permit_requests",[]).filter(x=>!characterId()||x.characterId===characterId());
   box.innerHTML=a.length?a.map(r=>`<article class="request-row"><div><small>${r.id}</small><strong>${permitLabel(r)}</strong><span>${r.status}</span></div><button class="public-secondary open-chat" data-conv="${r.id}">Ouvrir la discussion</button></article>`).join(""):`<div class="public-empty">Aucune demande pour le moment.</div>`;
 }
 function renderParkRequests(){
   const box=$("#parkRequests"); if(!box)return; const a=load("bcso_v2_permit_requests",[]);
   box.innerHTML=a.length?a.map(r=>`<article class="pro-request"><div><small>${r.id}</small><b>${r.name||"Civil"}</b><span>${permitLabel(r)} · ${r.status}</span></div><button class="open-chat" data-conv="${r.id}">Discussion</button><button class="fix-appt" data-id="${r.id}">Fixer RDV</button></article>`).join(""):`<p class="muted">Aucune demande.</p>`;
 }
 document.addEventListener("click",e=>{
   const c=e.target.closest(".open-chat"); if(c){store("bcso_v2_current_conversation",c.dataset.conv);openChat(c.dataset.conv)}
   const f=e.target.closest(".fix-appt"); if(f)openAppointmentDialog(f.dataset.id);
 });
 function openChat(id){
   const modal=$("#v2ChatModal"); if(!modal)return; modal.hidden=false; $("#chatTitle").textContent=`Conversation · ${id}`; renderMessages(id);
 }
 $("#closeV2Chat")?.addEventListener("click",()=>$("#v2ChatModal").hidden=true);
 $("#v2ChatForm")?.addEventListener("submit",e=>{
   e.preventDefault(); const id=load("bcso_v2_current_conversation",""); const input=$("#v2ChatInput"); if(!id||!input.value.trim())return;
   const msgs=load("bcso_v2_messages",{}); msgs[id]=msgs[id]||[]; msgs[id].push({id:crypto.randomUUID?.()||Date.now(),text:input.value.trim(),sender:proShell?.classList.contains("pro-visible")?"bcso":"citizen",at:new Date().toISOString(),notificationState:"pending"});store("bcso_v2_messages",msgs);input.value="";renderMessages(id);
 });
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
