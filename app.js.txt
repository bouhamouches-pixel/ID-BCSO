const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

const STORAGE = {
  profile: "bcso_demo_profile",
  serviceSessions: "bcso_demo_service_sessions",
  activeService: "bcso_demo_active_service",
  reports: "bcso_demo_reports",
  events: "bcso_demo_events",
  complaints: "bcso_demo_complaints",
  warrants: "bcso_demo_warrants"
};

const defaultAvatar = createDefaultAvatar();

const defaultProfile = {
  name: "K. Belkacem",
  rank: "Captain",
  avatar: null
};

const seedReports = [
  { id:"R-2026-0004", type:"Rapport d'arrestation", title:"Interpellation — Route 68", author:"K. Belkacem", date:"2026-09-08T20:34", location:"Route 68", persons:"J. Anderson", summary:"Interpellation à la suite d'un contrôle routier.", offenses:"Conduite dangereuse", evidence:"Dashcam unité 214", notes:"", status:"Finalisé" },
  { id:"R-2026-0003", type:"Rapport d'intervention", title:"Renfort — Sandy Shores", author:"J. Carter", date:"2026-09-07T23:12", location:"Sandy Shores", persons:"", summary:"Renfort demandé sur une intervention en cours.", offenses:"", evidence:"", notes:"", status:"Finalisé" },
  { id:"R-2026-0002", type:"Rapport de patrouille", title:"Patrouille secteur Nord", author:"K. Belkacem", date:"2026-09-06T18:00", location:"Paleto Bay", persons:"", summary:"Patrouille de prévention et présence visible.", offenses:"", evidence:"", notes:"", status:"Finalisé" }
];

const seedEvents = [
  {
    id: "evt-1",
    type: "Formation",
    title: "Formation générale BCSO",
    date: "2026-09-12T20:00",
    place: "Sheriff's Office — Sandy Shores",
    organizer: "Command Staff",
    description: "Formation générale et rappel des procédures opérationnelles.",
    max: 15,
    participants: [
      {name:"J. Carter", rank:"Sergeant"},
      {name:"M. Owens", rank:"Deputy"},
      {name:"A. Johnson", rank:"Deputy"}
    ]
  },
  {
    id: "evt-2",
    type: "Réunion",
    title: "Réunion mensuelle",
    date: "2026-09-18T20:30",
    place: "Salle de briefing",
    organizer: "Supervision",
    description: "Point mensuel sur l'activité du service et les objectifs opérationnels.",
    max: null,
    participants: [
      {name:"K. Belkacem", rank:"Captain"},
      {name:"J. Carter", rank:"Sergeant"}
    ]
  }
];


const seedWarrants = [{id:"M-2026-0001",name:"John William",dob:"2003-09-11",danger:"Maximum",priority:"Priorité élevée",charges:"Non présentation à une convocation\nPort illégal d'arme de catégorie C\nDétention / possession d'arme sans PPA\nUsage d'une arme en dehors du cadre établi par le code pénal",notes:"Individu à interpeller et conduire devant l'autorité compétente.",author:"K. Belkacem",createdAt:"2026-08-31T23:24",status:"Actif",image:null}];

const seedComplaints = [
  { id:"P-2026-0042", type:"Plainte contre un agent", writer:"J. Carter", date:"2026-09-08T18:10", subject:"Comportement lors d'un contrôle", assignedTo:null, status:"En attente" },
  { id:"P-2026-0041", type:"Plainte citoyenne", writer:"K. Belkacem", date:"2026-09-07T16:20", subject:"Dégradation de propriété", assignedTo:"M. Owens", status:"En cours" },
  { id:"P-2026-0040", type:"Contestation", writer:"A. Johnson", date:"2026-09-05T21:40", subject:"Contestation d'une verbalisation", assignedTo:null, status:"En attente" }
];

function load(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return v ?? fallback;
  } catch { return fallback; }
}
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

let profile = load(STORAGE.profile, defaultProfile);
let sessions = load(STORAGE.serviceSessions, []);
let activeService = load(STORAGE.activeService, null);
let reports = load(STORAGE.reports, seedReports);
let events = load(STORAGE.events, seedEvents);
let complaints = load(STORAGE.complaints, seedComplaints);
let warrants = load(STORAGE.warrants, seedWarrants);

save(STORAGE.reports, reports);
save(STORAGE.events, events);
save(STORAGE.complaints, complaints);
save(STORAGE.warrants, warrants);

function createDefaultAvatar() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
    <rect width="512" height="512" fill="#22272e"/>
    <circle cx="256" cy="205" r="96" fill="#c6a86d"/>
    <path d="M85 470c24-103 88-155 171-155s147 52 171 155" fill="#c6a86d"/>
    <circle cx="256" cy="256" r="242" fill="none" stroke="#3b414a" stroke-width="20"/>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function formatDate(iso) {
  return new Intl.DateTimeFormat("fr-FR", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" }).format(new Date(iso));
}
function formatDuration(ms) {
  const totalMin = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h} h ${String(m).padStart(2, "0")} min`;
}
function formatShortDuration(ms) {
  const totalMin = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h} h ${String(m).padStart(2, "0")}`;
}

function applyProfile() {
  $("#sidebarName").textContent = profile.name;
  $("#sidebarRank").textContent = profile.rank;
  $("#sidebarAvatar").src = profile.avatar || defaultAvatar;
  $("#profilePreview").src = profile.avatar || defaultAvatar;
  $("#profileName").value = profile.name;
  $("#profileRank").value = profile.rank;
}
applyProfile();

$$(".nav-item").forEach(btn => {
  btn.addEventListener("click", () => {
    $$(".nav-item").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    $$(".view").forEach(v => v.classList.remove("active"));
    $(`#view-${btn.dataset.view}`).classList.add("active");
    $("#pageTitle").textContent = btn.querySelector("span:last-child").textContent;
    $("#sidebar").classList.remove("open");
  });
});
$("#mobileMenu").addEventListener("click", () => $("#sidebar").classList.toggle("open"));

function openModal(id) {
  const modal = document.getElementById(id);
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}
function closeModal(id) {
  const modal = document.getElementById(id);
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}
$("#openProfile").addEventListener("click", () => openModal("profileModal"));
$("#newReportBtn").addEventListener("click", () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0,16);
  $("#reportDate").value = local;
  openModal("reportModal");
});
$("#newWarrantBtn").addEventListener("click", () => { $("#warrantForm").reset(); $("#warrantEditId").value=""; $("#warrantModalTitle").textContent="Nouveau mandat"; openModal("warrantModal"); });
$$("[data-close]").forEach(btn => btn.addEventListener("click", () => closeModal(btn.dataset.close)));
$$(".modal").forEach(modal => modal.addEventListener("click", e => {
  if (e.target === modal) closeModal(modal.id);
}));

$("#saveProfile").addEventListener("click", () => {
  profile.name = $("#profileName").value.trim() || profile.name;
  save(STORAGE.profile, profile);
  applyProfile();
  renderEvents();
  renderMyReports();
  renderReportsDb();
  renderComplaints();
  closeModal("profileModal");
});

$("#restoreAvatar").addEventListener("click", () => {
  profile.avatar = null;
  $("#profilePreview").src = defaultAvatar;
  save(STORAGE.profile, profile);
  applyProfile();
});

$("#avatarInput").addEventListener("change", async e => {
  const file = e.target.files?.[0];
  if (!file) return;
  const allowed = ["image/png", "image/jpeg", "image/webp"];
  if (!allowed.includes(file.type)) {
    alert("Format non accepté. Utilisez PNG, JPG/JPEG ou WebP.");
    e.target.value = "";
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    alert("L'image dépasse la limite de 5 Mo.");
    e.target.value = "";
    return;
  }

  try {
    const dataUrl = await compressAvatar(file);
    profile.avatar = dataUrl;
    save(STORAGE.profile, profile);
    applyProfile();
  } catch {
    alert("Impossible de traiter cette image.");
  }
});

function compressAvatar(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const size = 512;
        const canvas = document.createElement("canvas");
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext("2d");

        const srcSize = Math.min(img.width, img.height);
        const sx = (img.width - srcSize) / 2;
        const sy = (img.height - srcSize) / 2;
        ctx.drawImage(img, sx, sy, srcSize, srcSize, 0, 0, size, size);

        let quality = 0.84;
        let out = canvas.toDataURL("image/webp", quality);
        while (out.length > 700000 && quality > 0.52) {
          quality -= 0.08;
          out = canvas.toDataURL("image/webp", quality);
        }
        resolve(out);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// SERVICES
$("#dutyToggle").addEventListener("click", () => {
  if (!activeService) {
    activeService = { start: new Date().toISOString() };
    save(STORAGE.activeService, activeService);
  } else {
    sessions.unshift({
      start: activeService.start,
      end: new Date().toISOString()
    });
    activeService = null;
    save(STORAGE.activeService, activeService);
    save(STORAGE.serviceSessions, sessions);
  }
  renderServices();
});

function startOfWeek(d = new Date()) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7;
  x.setHours(0,0,0,0);
  x.setDate(x.getDate() - day);
  return x;
}

function renderServices() {
  const btn = $("#dutyToggle");
  const label = $("#dutyLabel");
  const state = $("#serviceState");
  const subtitle = $("#serviceSubtitle");

  if (activeService) {
    btn.classList.remove("off");
    btn.classList.add("on");
    label.textContent = "Terminer mon service";
    state.textContent = "En service";
    subtitle.textContent = `Depuis ${formatDate(activeService.start)}`;
  } else {
    btn.classList.remove("on");
    btn.classList.add("off");
    label.textContent = "Prendre mon service";
    state.textContent = "Hors service";
    subtitle.textContent = "Aucun service en cours.";
    $("#liveTimer").textContent = "00 h 00 min";
  }

  const week = startOfWeek();
  let weeklyMs = 0, totalMs = 0, weeklyCount = 0;

  for (const s of sessions) {
    const ms = new Date(s.end) - new Date(s.start);
    totalMs += ms;
    if (new Date(s.start) >= week) {
      weeklyMs += ms;
      weeklyCount++;
    }
  }
  if (activeService) {
    const ms = Date.now() - new Date(activeService.start);
    totalMs += ms;
    if (new Date(activeService.start) >= week) weeklyMs += ms;
  }

  $("#weeklyServices").textContent = weeklyCount + (activeService && new Date(activeService.start) >= week ? 1 : 0);
  $("#weeklyTime").textContent = formatShortDuration(weeklyMs);
  $("#totalServices").textContent = sessions.length + (activeService ? 1 : 0);
  $("#totalTime").textContent = formatShortDuration(totalMs);

  $("#serviceHistory").innerHTML = sessions.length
    ? sessions.slice(0,5).map(s => {
        const ms = new Date(s.end) - new Date(s.start);
        return `<div class="history-item"><strong>${formatDate(s.start)} → ${formatDate(s.end)}</strong><span>Durée : ${formatDuration(ms)}</span></div>`;
      }).join("")
    : `<div class="empty-state">Aucun service terminé pour le moment.</div>`;

  drawServiceChart();
}

setInterval(() => {
  if (activeService) {
    $("#liveTimer").textContent = formatDuration(Date.now() - new Date(activeService.start));
    renderServices();
  }
}, 60000);

function drawServiceChart() {
  const canvas = $("#serviceChart");
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const w = rect.width, h = rect.height;
  ctx.clearRect(0,0,w,h);

  const days = [];
  for (let i=6;i>=0;i--) {
    const d = new Date();
    d.setHours(0,0,0,0);
    d.setDate(d.getDate()-i);
    days.push(d);
  }

  const values = days.map(day => {
    const next = new Date(day); next.setDate(next.getDate()+1);
    let ms = 0;
    for (const s of sessions) {
      const start = new Date(s.start), end = new Date(s.end);
      const a = Math.max(start, day), b = Math.min(end, next);
      if (b > a) ms += b - a;
    }
    if (activeService) {
      const start = new Date(activeService.start), end = new Date();
      const a = Math.max(start, day), b = Math.min(end, next);
      if (b > a) ms += b - a;
    }
    return ms/3600000;
  });

  const pad = {l:36,r:12,t:16,b:35};
  const cw = w-pad.l-pad.r, ch = h-pad.t-pad.b;
  const max = Math.max(8, Math.ceil(Math.max(...values, 0)));

  ctx.strokeStyle = "#292e36";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#7f8791";
  ctx.font = "11px Inter";
  for (let i=0;i<=4;i++) {
    const y = pad.t + ch*(i/4);
    ctx.beginPath(); ctx.moveTo(pad.l,y); ctx.lineTo(w-pad.r,y); ctx.stroke();
    const val = Math.round(max*(1-i/4));
    ctx.fillText(val+"h", 4, y+4);
  }

  const bw = Math.max(16, cw/7*.55);
  const gap = cw/7;
  values.forEach((v,i) => {
    const bh = Math.max(v/max*ch, v ? 3 : 0);
    const x = pad.l + i*gap + (gap-bw)/2;
    const y = pad.t + ch - bh;

    const grad = ctx.createLinearGradient(0,y,0,pad.t+ch);
    grad.addColorStop(0, "#ddbf7e");
    grad.addColorStop(1, "#8f7649");
    ctx.fillStyle = grad;
    roundRect(ctx, x,y,bw,bh,5);
    ctx.fill();

    ctx.fillStyle = "#969da7";
    const label = new Intl.DateTimeFormat("fr-FR",{weekday:"short"}).format(days[i]).replace(".","");
    ctx.fillText(label, x + bw/2 - 10, h-12);
  });
}

function roundRect(ctx,x,y,w,h,r) {
  if (h <= 0) return;
  r = Math.min(r,w/2,h/2);
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}
window.addEventListener("resize", drawServiceChart);

// AGENDA
function renderEvents() {
  $("#eventsList").innerHTML = events.map(evt => {
    const joined = evt.participants.some(p => p.name === profile.name);
    return `
      <article class="event-card">
        <div class="event-top">
          <div>
            <span class="badge gold">${escapeHtml(evt.type)}</span>
            <h3>${escapeHtml(evt.title)}</h3>
            <div class="meta-row">
              <span>📅 ${formatDate(evt.date)}</span>
              <span>📍 ${escapeHtml(evt.place)}</span>
              <span>👤 ${escapeHtml(evt.organizer)}</span>
            </div>
          </div>
        </div>
        <p class="muted">${escapeHtml(evt.description)}</p>
        <button class="participants-toggle" data-event-toggle="${evt.id}">
          👥 Participants : ${evt.participants.length}${evt.max ? ` / ${evt.max}` : ""} <span>▼</span>
        </button>
        <div class="participants-list" id="participants-${evt.id}">
          ${evt.participants.length ? evt.participants.map((p,i) => `
            <div class="participant">
              <span>#${String(101+i).padStart(3,"0")} ・ ${escapeHtml(p.name)} ${p.name===profile.name ? '<span class="badge gold">Vous</span>' : ""}</span>
              <span class="muted">${escapeHtml(p.rank)}</span>
            </div>`).join("") : `<div class="empty-state">Aucun participant.</div>`}
        </div>
        <div class="event-actions">
          <button class="${joined ? "danger-btn" : "primary-btn"}" data-event-join="${evt.id}">
            ${joined ? "Se retirer de l'événement" : "Participer à l'événement"}
          </button>
        </div>
      </article>`;
  }).join("");

  $$("[data-event-toggle]").forEach(btn => btn.addEventListener("click", () => {
    const list = $(`#participants-${btn.dataset.eventToggle}`);
    list.classList.toggle("open");
    btn.querySelector("span:last-child").textContent = list.classList.contains("open") ? "▲" : "▼";
  }));

  $$("[data-event-join]").forEach(btn => btn.addEventListener("click", () => {
    const evt = events.find(e => e.id === btn.dataset.eventJoin);
    const idx = evt.participants.findIndex(p => p.name === profile.name);
    if (idx >= 0) evt.participants.splice(idx,1);
    else {
      if (evt.max && evt.participants.length >= evt.max) return alert("Cet événement est complet.");
      evt.participants.push({name:profile.name, rank:profile.rank});
    }
    save(STORAGE.events, events);
    renderEvents();
  }));
}

// REPORTS
function nextReportId() {
  const year = new Date().getFullYear();
  const nums = reports
    .map(r => {
      const m = r.id.match(/^R-\d{4}-(\d+)$/);
      return m ? Number(m[1]) : 0;
    });
  const next = Math.max(0,...nums)+1;
  return `R-${year}-${String(next).padStart(4,"0")}`;
}

$("#reportForm").addEventListener("submit", e => {
  e.preventDefault();
  reports.unshift({
    id: nextReportId(),
    type: $("#reportType").value,
    title: $("#reportTitle").value.trim(),
    author: profile.name,
    date: new Date($("#reportDate").value).toISOString(),
    location: $("#reportLocation").value.trim(),
    persons: $("#reportPersons").value.trim(),
    summary: $("#reportSummary").value.trim(),
    offenses: $("#reportOffenses").value.trim(),
    evidence: $("#reportEvidence").value.trim(),
    notes: $("#reportNotes").value.trim(),
    status: "Finalisé"
  });
  save(STORAGE.reports, reports);
  e.target.reset();
  closeModal("reportModal");
  renderMyReports();
  renderReportsDb();
});

function reportCard(r) {
  return `
    <article class="record-card">
      <div class="record-top">
        <div>
          <span class="badge gold">${escapeHtml(r.id)}</span>
          <h3>${escapeHtml(r.title)}</h3>
          <div class="meta-row">
            <span>${escapeHtml(r.type)}</span>
            <span>Auteur : ${escapeHtml(r.author)}</span>
            <span>${formatDate(r.date)}</span>
          </div>
        </div>
        <span class="badge green">${escapeHtml(r.status)}</span>
      </div>
      <div class="record-actions">
        <button class="secondary-btn" data-report-view="${escapeHtml(r.id)}">Consulter</button>
      </div>
    </article>`;
}

function renderMyReports() {
  const q = ($("#myReportSearch").value || "").toLowerCase();
  const type = $("#myReportFilter").value;
  const list = reports.filter(r => r.author === profile.name)
    .filter(r => !type || r.type === type)
    .filter(r => [r.id,r.title,r.type,r.author].join(" ").toLowerCase().includes(q));
  $("#myReportsList").innerHTML = list.length ? list.map(reportCard).join("") : `<div class="empty-state panel-lite">Aucun rapport trouvé.</div>`;
  bindReportViewers();
}
function renderReportsDb() {
  const q = ($("#dbSearch").value || "").toLowerCase();
  const type = $("#dbTypeFilter").value;
  const list = reports
    .filter(r => !type || r.type === type)
    .filter(r => [r.id,r.title,r.type,r.author,r.persons].join(" ").toLowerCase().includes(q));
  $("#reportsDbList").innerHTML = list.length ? list.map(reportCard).join("") : `<div class="empty-state panel-lite">Aucun rapport trouvé.</div>`;
  bindReportViewers();
}
function bindReportViewers() {
  $$("[data-report-view]").forEach(btn => btn.onclick = () => {
    const r = reports.find(x => x.id === btn.dataset.reportView);
    alert(`${r.id}\n\n${r.title}\n${r.type}\nAuteur : ${r.author}\nDate : ${formatDate(r.date)}\n\n${r.summary}`);
  });
}
$("#myReportSearch").addEventListener("input", renderMyReports);
$("#myReportFilter").addEventListener("change", renderMyReports);
$("#dbSearch").addEventListener("input", renderReportsDb);
$("#dbTypeFilter").addEventListener("change", renderReportsDb);


// MANDATS D'ARRÊT
function nextWarrantId(){const y=new Date().getFullYear();const n=warrants.map(w=>{const m=w.id.match(/^M-\d{4}-(\d+)$/);return m?Number(m[1]):0});return `M-${y}-${String(Math.max(0,...n)+1).padStart(4,"0")}`}
function displayDob(v){return v?new Intl.DateTimeFormat("fr-FR").format(new Date(v+"T12:00:00")):"Non renseignée"}
function compressWarrantImage(file){return new Promise((resolve,reject)=>{const ok=["image/png","image/jpeg","image/webp"];if(!ok.includes(file.type))return reject(new Error("FORMAT"));if(file.size>5*1024*1024)return reject(new Error("SIZE"));const r=new FileReader();r.onerror=reject;r.onload=()=>{const img=new Image();img.onerror=reject;img.onload=()=>{const maxW=1200,s=Math.min(1,maxW/img.width),c=document.createElement("canvas");c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);const x=c.getContext("2d");x.drawImage(img,0,0,c.width,c.height);let q=.82,out=c.toDataURL("image/webp",q);while(out.length>1800000&&q>.48){q-=.08;out=c.toDataURL("image/webp",q)}resolve(out)};img.src=r.result};r.readAsDataURL(file)})}
$("#warrantForm").addEventListener("submit",async e=>{e.preventDefault();const id=$("#warrantEditId").value,ex=id?warrants.find(w=>w.id===id):null,file=$("#warrantImage").files?.[0];let image=ex?.image||null;try{if(file)image=await compressWarrantImage(file)}catch(err){return alert(err.message==="SIZE"?"L'image dépasse 5 Mo.":"Format non accepté. Utilisez PNG, JPG/JPEG ou WebP.")}const p={id:ex?.id||nextWarrantId(),name:$("#warrantName").value.trim(),dob:$("#warrantDob").value,danger:$("#warrantDanger").value,priority:$("#warrantPriority").value,charges:$("#warrantCharges").value.trim(),notes:$("#warrantNotes").value.trim(),author:ex?.author||profile.name,createdAt:ex?.createdAt||new Date().toISOString(),status:ex?.status||"Actif",image};ex?Object.assign(ex,p):warrants.unshift(p);try{save(STORAGE.warrants,warrants)}catch{return alert("Image trop volumineuse pour le stockage local de la démo.")}e.target.reset();closeModal("warrantModal");renderWarrants()});
function renderWarrants(){const q=($("#warrantSearch").value||"").toLowerCase(),pr=$("#warrantPriorityFilter").value,st=$("#warrantStatusFilter").value;const list=warrants.filter(w=>(!pr||w.priority===pr)&&(!st||w.status===st)&&[w.id,w.name,w.danger,w.priority,w.charges,w.notes,w.author,w.status].join(" ").toLowerCase().includes(q));$("#warrantsList").innerHTML=list.length?list.map(w=>`<article class="warrant-card ${w.priority==="Priorité élevée"?"priority-high":""}"><div class="warrant-header"><div><div class="warrant-id">${escapeHtml(w.id)}</div><h3>${escapeHtml(w.name)}</h3><div class="meta-row"><span class="badge ${w.priority==="Priorité élevée"?"red":"gold"}">● ${escapeHtml(w.priority)}</span><span class="badge ${w.status==="Actif"?"status-active":"status-cleared"}">${escapeHtml(w.status)}</span></div></div></div><div class="warrant-facts"><div class="warrant-fact"><span>Date de naissance</span><strong>${displayDob(w.dob)}</strong></div><div class="warrant-fact"><span>Dangerosité</span><strong>${escapeHtml(w.danger)}</strong></div></div><div class="warrant-charges"><h4>Faits reprochés</h4><p>${escapeHtml(w.charges)}</p></div>${w.notes?`<div class="warrant-charges"><h4>Informations</h4><p>${escapeHtml(w.notes)}</p></div>`:""}${w.image?`<img class="warrant-doc" src="${w.image}" alt="Document du mandat ${escapeHtml(w.id)}">`:""}<div class="warrant-footer"><div class="warrant-author"><img src="${profile.avatar||defaultAvatar}" alt=""><div><strong>${escapeHtml(w.author)}</strong><div class="muted small">${formatDate(w.createdAt)}</div></div></div><div class="warrant-actions"><button class="secondary-btn" data-edit-warrant="${escapeHtml(w.id)}">Modifier</button><button class="${w.status==="Actif"?"danger-btn":"secondary-btn"}" data-toggle-warrant="${escapeHtml(w.id)}">${w.status==="Actif"?"Lever le mandat":"Réactiver"}</button></div></div></article>`).join(""):`<div class="empty-state panel-lite">Aucun mandat trouvé.</div>`;$$('[data-edit-warrant]').forEach(b=>b.addEventListener('click',()=>{const w=warrants.find(x=>x.id===b.dataset.editWarrant);$("#warrantEditId").value=w.id;$("#warrantName").value=w.name;$("#warrantDob").value=w.dob||"";$("#warrantDanger").value=w.danger;$("#warrantPriority").value=w.priority;$("#warrantCharges").value=w.charges;$("#warrantNotes").value=w.notes||"";$("#warrantImage").value="";$("#warrantModalTitle").textContent=`Modifier ${w.id}`;openModal("warrantModal")}));$$('[data-toggle-warrant]').forEach(b=>b.addEventListener('click',()=>{const w=warrants.find(x=>x.id===b.dataset.toggleWarrant);w.status=w.status==="Actif"?"Levée":"Actif";save(STORAGE.warrants,warrants);renderWarrants()}))}
$("#warrantSearch").addEventListener("input",renderWarrants);$("#warrantPriorityFilter").addEventListener("change",renderWarrants);$("#warrantStatusFilter").addEventListener("change",renderWarrants);

// PLAINTES
function renderComplaints() {
  const q = ($("#complaintSearch").value || "").toLowerCase();
  const status = $("#complaintStatusFilter").value;
  const list = complaints
    .filter(c => !status || c.status === status)
    .filter(c => [c.id,c.type,c.writer,c.subject,c.assignedTo||"",c.status].join(" ").toLowerCase().includes(q));

  $("#complaintsList").innerHTML = list.length ? list.map(c => `
    <article class="record-card">
      <div class="record-top">
        <div>
          <span class="badge gold">${escapeHtml(c.id)}</span>
          <h3>${escapeHtml(c.subject)}</h3>
          <div class="meta-row">
            <span>Type : ${escapeHtml(c.type)}</span>
            <span>Rédacteur : ${escapeHtml(c.writer)}</span>
            <span>${formatDate(c.date)}</span>
          </div>
        </div>
        <span class="badge ${c.status==="En attente" ? "red" : "green"}">${escapeHtml(c.status)}</span>
      </div>
      <div class="event-actions">
        <span class="badge">Agent en charge : ${escapeHtml(c.assignedTo || "Non assigné")}</span>
        ${c.assignedTo ? "" : `<button class="primary-btn" data-claim="${escapeHtml(c.id)}">Prendre en charge</button>`}
      </div>
    </article>
  `).join("") : `<div class="empty-state panel-lite">Aucune plainte trouvée.</div>`;

  $$("[data-claim]").forEach(btn => btn.addEventListener("click", () => {
    const c = complaints.find(x => x.id === btn.dataset.claim);
    if (!c || c.assignedTo) return;
    c.assignedTo = profile.name;
    c.status = "En cours";
    save(STORAGE.complaints, complaints);
    renderComplaints();
  }));
}
$("#complaintSearch").addEventListener("input", renderComplaints);
$("#complaintStatusFilter").addEventListener("change", renderComplaints);

function escapeHtml(v="") {
  return String(v).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

renderServices();
renderEvents();
renderMyReports();
renderReportsDb();
renderWarrants();
renderComplaints();
