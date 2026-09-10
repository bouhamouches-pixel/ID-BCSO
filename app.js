const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

const STORAGE = {
  profile: "bcso_demo_profile",
  serviceSessions: "bcso_demo_service_sessions",
  activeService: "bcso_demo_active_service",
  reports: "bcso_demo_reports",
  events: "bcso_demo_events",
  complaints: "bcso_demo_complaints",
  warrants: "bcso_demo_warrants",
  navSections: "bcso_demo_nav_sections"
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

// PANELS REPLIABLES DE LA SIDEBAR
const navSectionState = load(STORAGE.navSections, { bcso: true, supervision: true, bcsa: true });

function setNavSection(section, expanded, persist = true) {
  const toggle = document.querySelector(`[data-nav-section="${section}"]`);
  const content = document.querySelector(`[data-nav-content="${section}"]`);
  if (!toggle || !content) return;

  toggle.setAttribute("aria-expanded", String(expanded));
  content.classList.toggle("collapsed", !expanded);
  navSectionState[section] = expanded;
  if (persist) save(STORAGE.navSections, navSectionState);
}

$$('.nav-section-toggle').forEach(toggle => {
  const section = toggle.dataset.navSection;
  setNavSection(section, navSectionState[section] !== false, false);
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    setNavSection(section, !expanded);
  });
});

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
$("#warrantForm").addEventListener("submit",async e=>{e.preventDefault();const id=$("#warrantEditId").value,ex=id?warrants.find(w=>w.id===id):null,file=$("#warrantImage").files?.[0];let image=ex?.image||null;try{if(file)image=await compressWarrantImage(file)}catch(err){return alert(err.message==="SIZE"?"L'image dépasse 5 Mo.":"Format non accepté. Utilisez PNG, JPG/JPEG ou WebP.")}const p={id:ex?.id||nextWarrantId(),name:$("#warrantName").value.trim(),dob:$("#warrantDob").value,danger:$("#warrantDanger").value,priority:$("#warrantPriority").value,charges:$("#warrantCharges").value.trim(),notes:$("#warrantNotes").value.trim(),author:ex?.author||profile.name,createdAt:ex?.createdAt||new Date().toISOString(),status:ex?.status||"Actif",image};ex?Object.assign(ex,p):warrants.unshift(p);try{save(STORAGE.warrants,warrants)}catch{return alert("Image trop volumineuse pour le stockage local de la démo.")}e.target.reset();closeModal("warrantModal");renderWarrants();renderWarrantManagement()});
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

// ============================================================
// SUPERVISION — DÉMO LOCALE
// Les données ci-dessous seront remplacées par Firestore/Discord.
// ============================================================
const SUP_STORAGE = {
  agents: "bcso_demo_supervision_agents",
  services: "bcso_demo_supervision_services",
  active: "bcso_demo_supervision_active_services",
  audit: "bcso_demo_supervision_service_audit"
};

const nowIso = () => new Date().toISOString();
const isoShift = ({days=0,hours=0,minutes=0}={}) => new Date(Date.now() + days*86400000 + hours*3600000 + minutes*60000).toISOString();

const seedAgents = [
  {id:"a-191",badge:"191",name:"K. Belkacem",rank:"Captain",division:"Command",specialties:["Park Ranger","Highway Patrol"],joined:"2026-05-18",active:true,avatar:null,roles:["BCSO","Supervision","Park Ranger","Highway Patrol"]},
  {id:"a-143",badge:"143",name:"J. Carter",rank:"Sergeant",division:"Patrol",specialties:["Field Training"],joined:"2026-05-24",active:true,avatar:null,roles:["BCSO","Supervision","Patrol"]},
  {id:"a-205",badge:"205",name:"M. Owens",rank:"Deputy",division:"Patrol",specialties:["Highway Patrol"],joined:"2026-06-11",active:true,avatar:null,roles:["BCSO","Patrol","Highway Patrol"]},
  {id:"a-172",badge:"172",name:"A. Johnson",rank:"Deputy",division:"Park Ranger",specialties:["Park Ranger"],joined:"2026-06-18",active:true,avatar:null,roles:["BCSO","Park Ranger"]},
  {id:"a-216",badge:"216",name:"R. Walker",rank:"Deputy",division:"Patrol",specialties:["K-9"],joined:"2026-07-02",active:true,avatar:null,roles:["BCSO","Patrol","K-9"]},
  {id:"a-224",badge:"224",name:"T. Wilson",rank:"Probationary Deputy",division:"Patrol",specialties:[],joined:"2026-08-15",active:true,avatar:null,roles:["BCSO","Patrol"]},
  {id:"a-118",badge:"118",name:"D. Miller",rank:"Deputy",division:"Highway Patrol",specialties:["Highway Patrol"],joined:"2026-04-09",active:false,avatar:null,roles:["BCSO","Highway Patrol"]}
];

function demoDayIso(daysAgo, hour, minute=0) {
  const d = new Date();
  d.setSeconds(0,0);
  d.setDate(d.getDate()-daysAgo);
  d.setHours(hour,minute,0,0);
  return d.toISOString();
}
function demoCrossMidnight(daysAgo, startHour, startMinute, endHour, endMinute) {
  const start = new Date(demoDayIso(daysAgo,startHour,startMinute));
  const end = new Date(start);
  if (endHour < startHour || (endHour===startHour && endMinute<=startMinute)) end.setDate(end.getDate()+1);
  end.setHours(endHour,endMinute,0,0);
  return [start.toISOString(),end.toISOString()];
}

function makeSeedServices(){
  const out=[]; let n=1;
  const patterns = [
    [1,"a-191",20,15,0,35],[1,"a-143",19,40,1,15],[1,"a-205",21,5,2,10],[1,"a-172",22,10,1,50],[1,"a-216",20,45,23,55],
    [2,"a-191",19,55,0,20],[2,"a-143",20,30,2,5],[2,"a-224",21,15,23,50],[2,"a-205",18,50,23,35],
    [3,"a-191",21,0,1,10],[3,"a-172",19,20,0,40],[3,"a-216",20,10,1,30],[3,"a-205",22,0,2,20],[3,"a-143",18,30,23,15],
    [4,"a-143",20,0,0,30],[4,"a-205",20,15,1,45],[4,"a-224",21,10,0,10],
    [5,"a-191",19,10,23,55],[5,"a-143",19,35,1,20],[5,"a-172",21,0,2,35],[5,"a-216",22,10,1,5],[5,"a-205",18,50,0,45],
    [6,"a-191",20,0,2,20],[6,"a-205",20,35,0,50],[6,"a-224",21,30,23,40],[6,"a-143",19,20,1,10],
    [7,"a-172",20,15,1,55],[7,"a-216",19,50,23,45],[7,"a-143",21,10,2,15]
  ];
  for(const [day,agentId,sh,sm,eh,em] of patterns){
    const [start,end]=demoCrossMidnight(day,sh,sm,eh,em);
    out.push({id:`svc-demo-${n++}`,agentId,start,end,source:"agent",closedBy:null});
  }
  return out;
}

const seedActiveServices = [
  {id:"active-demo-1",agentId:"a-143",start:isoShift({hours:-2,minutes:-18})},
  {id:"active-demo-2",agentId:"a-205",start:isoShift({hours:-1,minutes:-36})},
  {id:"active-demo-3",agentId:"a-172",start:isoShift({hours:-9,minutes:-12})}
];

let supAgents = load(SUP_STORAGE.agents, seedAgents);
let supServices = load(SUP_STORAGE.services, makeSeedServices());
let supActiveServices = load(SUP_STORAGE.active, seedActiveServices);
let supAudit = load(SUP_STORAGE.audit, []);
save(SUP_STORAGE.agents,supAgents); save(SUP_STORAGE.services,supServices); save(SUP_STORAGE.active,supActiveServices); save(SUP_STORAGE.audit,supAudit);

function agentById(id){ return supAgents.find(a=>a.id===id); }
function agentAvatar(agent){ return agent?.avatar || (agent?.name===profile.name ? (profile.avatar||defaultAvatar) : defaultAvatar); }
function toLocalInput(iso){ const d=new Date(iso); return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16); }
function shortClock(iso){ return new Intl.DateTimeFormat("fr-FR",{hour:"2-digit",minute:"2-digit"}).format(new Date(iso)); }
function shortDate(iso){ return new Intl.DateTimeFormat("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric"}).format(new Date(iso)); }
function hoursValue(ms){ return ms/3600000; }

function getPersonalAgent(){
  return supAgents.find(a=>a.name===profile.name) || supAgents[0];
}
function currentActiveServices(){
  const list = supActiveServices.filter(s=>agentById(s.agentId)?.active);
  if(activeService){
    const me=getPersonalAgent();
    if(me && !list.some(s=>s.agentId===me.id)) list.push({id:"personal-live",agentId:me.id,start:activeService.start,personal:true});
  }
  return list;
}
function allCompletedServices(){
  const list=[...supServices];
  const me=getPersonalAgent();
  if(me){
    sessions.forEach((s,i)=>{
      if(!list.some(x=>x.id===`personal-${i}-${s.start}`)) list.push({id:`personal-${i}-${s.start}`,agentId:me.id,start:s.start,end:s.end,source:"agent",personal:true});
    });
  }
  return list;
}

function overlapMs(service,start,end,includeActive=false){
  const a=Math.max(new Date(service.start).getTime(),start.getTime());
  const serviceEnd=service.end ? new Date(service.end).getTime() : (includeActive?Date.now():a);
  const b=Math.min(serviceEnd,end.getTime());
  return Math.max(0,b-a);
}
function periodRange(kind){
  const n=new Date();
  if(kind==="month") return [new Date(n.getFullYear(),n.getMonth(),1,0,0,0,0),new Date(n.getFullYear(),n.getMonth()+1,1,0,0,0,0)];
  const thisWeek=startOfWeek(n);
  if(kind==="previousWeek"){ const a=new Date(thisWeek);a.setDate(a.getDate()-7);return[a,thisWeek]; }
  const b=new Date(thisWeek);b.setDate(b.getDate()+7);return[thisWeek,b];
}
function agentPeriodMs(agentId,range){
  const [a,b]=range; let ms=0;
  allCompletedServices().filter(s=>s.agentId===agentId).forEach(s=>ms+=overlapMs(s,a,b));
  currentActiveServices().filter(s=>s.agentId===agentId).forEach(s=>ms+=overlapMs(s,a,b,true));
  return ms;
}
function agentMonthMs(agentId){ return agentPeriodMs(agentId,periodRange("month")); }

function populateAgentFilters(){
  const ranks=[...new Set(supAgents.map(a=>a.rank))].sort();
  const divs=[...new Set(supAgents.map(a=>a.division))].sort();
  const r=$("#agentRankFilter"), d=$("#agentDivisionFilter");
  const rv=r.value,dv=d.value;
  r.innerHTML='<option value="">Tous les grades</option>'+ranks.map(x=>`<option>${escapeHtml(x)}</option>`).join('');
  d.innerHTML='<option value="">Toutes les divisions</option>'+divs.map(x=>`<option>${escapeHtml(x)}</option>`).join('');
  r.value=rv; d.value=dv;
}

function renderAgentManagement(){
  populateAgentFilters();
  const live=currentActiveServices();
  $("#supActiveAgents").textContent=supAgents.filter(a=>a.active).length;
  $("#supOnDutyAgents").textContent=live.length;
  $("#supInactiveAgents").textContent=supAgents.filter(a=>!a.active).length;
  $("#supDivisions").textContent=new Set(supAgents.filter(a=>a.active).map(a=>a.division)).size;
  const q=($("#agentSearch").value||"").toLowerCase(); const rank=$("#agentRankFilter").value,div=$("#agentDivisionFilter").value,st=$("#agentStatusFilter").value;
  const range=periodRange("week");
  const rows=supAgents.filter(a=>{
    const isOn=live.some(s=>s.agentId===a.id); const status=!a.active?"Inactif":isOn?"En service":"Hors service";
    return (!rank||a.rank===rank)&&(!div||a.division===div)&&(!st||status===st)&&[a.badge,a.name,a.rank,a.division,a.specialties.join(" ")].join(" ").toLowerCase().includes(q);
  });
  $("#agentsTable").innerHTML=`<table class="agents-table"><thead><tr><th>Agent</th><th>Grade</th><th>Division</th><th>Statut</th><th>Cette semaine</th><th>Ce mois</th><th>Actions</th></tr></thead><tbody>${rows.map(a=>{
    const isOn=live.some(s=>s.agentId===a.id); const status=!a.active?"Inactif":isOn?"En service":"Hors service"; const cls=!a.active?"inactive":isOn?"on":"off";
    return `<tr><td><div class="agent-identity"><img class="agent-mini-avatar" src="${agentAvatar(a)}" alt=""><div><div class="agent-name-line">${escapeHtml(a.name)}</div><span class="agent-badge">#${escapeHtml(a.badge)}</span></div></div></td><td>${escapeHtml(a.rank)}</td><td>${escapeHtml(a.division)}</td><td><span class="status-inline ${cls}">${status}</span></td><td>${formatShortDuration(agentPeriodMs(a.id,range))}</td><td>${formatShortDuration(agentMonthMs(a.id))}</td><td><div class="table-actions"><button class="secondary-btn" data-agent-profile="${a.id}">Voir le profil</button>${a.active?`<button class="danger-outline" data-agent-toggle="${a.id}">Désactiver</button>`:`<button class="secondary-btn" data-agent-toggle="${a.id}">Réactiver</button>`}</div></td></tr>`;
  }).join("")||'<tr><td colspan="7"><div class="empty-state">Aucun agent trouvé.</div></td></tr>'}</tbody></table>`;
  $$('[data-agent-profile]').forEach(b=>b.onclick=()=>openAgentProfile(b.dataset.agentProfile));
  $$('[data-agent-toggle]').forEach(b=>b.onclick=()=>toggleAgentStatus(b.dataset.agentToggle));
}

function toggleAgentStatus(id){
  const a=agentById(id); if(!a)return;
  const action=a.active?"désactiver":"réactiver";
  if(!confirm(`Voulez-vous ${action} ${a.name} ?`)) return;
  a.active=!a.active; save(SUP_STORAGE.agents,supAgents); renderSupervision();
}

function openAgentProfile(id,tab="info"){
  const a=agentById(id); if(!a)return;
  const range=periodRange("week");
  const agentServices=allCompletedServices().filter(s=>s.agentId===id).sort((x,y)=>new Date(y.start)-new Date(x.start));
  const agentReports=reports.filter(r=>r.author===a.name);
  const agentComplaints=complaints.filter(c=>c.writer===a.name||c.assignedTo===a.name);
  $("#agentModalTitle").textContent=`#${a.badge} ・ ${a.name}`;
  $("#agentProfileContent").innerHTML=`
    <div class="agent-profile-head"><img src="${agentAvatar(a)}" alt=""><div><h3>${escapeHtml(a.name)}</h3><div class="meta-row"><span>${escapeHtml(a.rank)}</span><span>${escapeHtml(a.division)}</span><span class="badge ${a.active?'green':'red'}">${a.active?'Actif':'Inactif'}</span></div></div></div>
    <div class="profile-tabs"><button class="profile-tab ${tab==='info'?'active':''}" data-profile-tab="info">Informations</button><button class="profile-tab ${tab==='services'?'active':''}" data-profile-tab="services">Services</button><button class="profile-tab ${tab==='reports'?'active':''}" data-profile-tab="reports">Rapports</button><button class="profile-tab ${tab==='complaints'?'active':''}" data-profile-tab="complaints">Plaintes</button><button class="profile-tab ${tab==='access'?'active':''}" data-profile-tab="access">Accès</button></div>
    <div class="profile-panel ${tab==='info'?'active':''}" data-profile-panel="info"><div class="info-grid"><div class="info-box"><span>Matricule</span><strong>#${escapeHtml(a.badge)}</strong></div><div class="info-box"><span>Grade</span><strong>${escapeHtml(a.rank)}</strong></div><div class="info-box"><span>Division</span><strong>${escapeHtml(a.division)}</strong></div><div class="info-box"><span>Date d'intégration</span><strong>${shortDate(a.joined+'T12:00:00')}</strong></div><div class="info-box"><span>Spécialisations</span><strong>${escapeHtml(a.specialties.join(', ')||'Aucune')}</strong></div><div class="info-box"><span>Statut</span><strong>${a.active?'Actif':'Inactif'}</strong></div></div></div>
    <div class="profile-panel ${tab==='services'?'active':''}" data-profile-panel="services"><div class="supervision-summary"><article class="stat-card"><span>Cette semaine</span><strong>${formatShortDuration(agentPeriodMs(id,range))}</strong><small>temps cumulé</small></article><article class="stat-card"><span>Ce mois</span><strong>${formatShortDuration(agentMonthMs(id))}</strong><small>temps cumulé</small></article><article class="stat-card"><span>Services</span><strong>${agentServices.length}</strong><small>enregistrés</small></article><article class="stat-card"><span>Moyenne</span><strong>${formatShortDuration(agentServices.length?agentServices.reduce((t,s)=>t+(new Date(s.end)-new Date(s.start)),0)/agentServices.length:0)}</strong><small>par service</small></article></div><div class="history-service-list">${agentServices.slice(0,8).map(s=>`<div class="history-service-row"><span><strong>Début</strong><br>${formatDate(s.start)}</span><span><strong>Fin</strong><br>${formatDate(s.end)}</span><span>${formatDuration(new Date(s.end)-new Date(s.start))}</span><div class="table-actions"><button class="secondary-btn" data-edit-service="${s.id}">Modifier</button></div></div>`).join('')||'<div class="empty-state">Aucun service.</div>'}</div></div>
    <div class="profile-panel ${tab==='reports'?'active':''}" data-profile-panel="reports">${agentReports.length?agentReports.slice(0,10).map(reportCard).join(''):'<div class="empty-state">Aucun rapport rédigé.</div>'}</div>
    <div class="profile-panel ${tab==='complaints'?'active':''}" data-profile-panel="complaints">${agentComplaints.length?agentComplaints.map(c=>`<div class="record-card"><span class="badge gold">${escapeHtml(c.id)}</span><h3>${escapeHtml(c.subject)}</h3><div class="meta-row"><span>${escapeHtml(c.status)}</span><span>${escapeHtml(c.assignedTo||'Non assigné')}</span></div></div>`).join(''):'<div class="empty-state">Aucune plainte liée à cet agent.</div>'}</div>
    <div class="profile-panel ${tab==='access'?'active':''}" data-profile-panel="access"><p class="muted small">Dans la version finale, ces accès seront calculés depuis les rôles Discord et ne seront pas modifiables ici.</p><div class="access-list">${a.roles.map(r=>`<div class="access-item"><span>${escapeHtml(r)}</span><strong class="access-ok">✓ Autorisé</strong></div>`).join('')}</div></div>`;
  $$('[data-profile-tab]').forEach(b=>b.onclick=()=>openAgentProfile(id,b.dataset.profileTab));
  $$('[data-edit-service]').forEach(b=>b.onclick=()=>openEditService(b.dataset.editService));
  bindReportViewers();
  openModal("agentModal");
}

$("#addAgentBtn").addEventListener("click",()=>openModal("addAgentModal"));
$("#addAgentForm").addEventListener("submit",e=>{
  e.preventDefault(); const badge=$("#newAgentBadge").value.trim();
  if(supAgents.some(a=>a.badge===badge)) return alert("Ce matricule existe déjà.");
  const specialties=$("#newAgentSpecialties").value.split(',').map(x=>x.trim()).filter(Boolean);
  supAgents.push({id:`a-${Date.now()}`,badge,name:$("#newAgentName").value.trim(),rank:$("#newAgentRank").value.trim(),division:$("#newAgentDivision").value.trim(),specialties,joined:new Date().toISOString().slice(0,10),active:true,avatar:null,roles:["BCSO",$("#newAgentDivision").value.trim()]});
  save(SUP_STORAGE.agents,supAgents); e.target.reset(); closeModal("addAgentModal"); renderSupervision();
});

["agentSearch","agentRankFilter","agentDivisionFilter","agentStatusFilter"].forEach(id=>$("#"+id).addEventListener(id==="agentSearch"?"input":"change",renderAgentManagement));

function renderLiveDuty(){
  const live=currentActiveServices().sort((a,b)=>new Date(a.start)-new Date(b.start));
  $("#trackingOnDuty").textContent=live.length; $("#liveDutyBadge").textContent=`${live.length} en service`; $("#agentsOnDuty").textContent=String(live.length).padStart(2,"0");
  $("#liveDutyList").innerHTML=live.length?live.map(s=>{
    const a=agentById(s.agentId); const ms=Date.now()-new Date(s.start); const warning=ms>=8*3600000;
    return `<div class="live-duty-row ${warning?'warning':''}"><div class="agent-identity"><img class="agent-mini-avatar" src="${agentAvatar(a)}" alt=""><div><div class="agent-name-line">#${escapeHtml(a.badge)} ・ ${escapeHtml(a.name)}</div><span class="agent-badge">${escapeHtml(a.rank)}</span></div></div><div class="live-duty-time"><strong>${formatDuration(ms)}</strong><span>durée actuelle</span></div><div class="live-duty-time"><strong>${shortClock(s.start)}</strong><span>prise de service</span></div><div class="table-actions">${warning?'<span class="badge red">⚠ Service prolongé</span>':''}<button class="danger-btn" data-force-end="${s.agentId}" ${s.personal?'disabled title="Utilisez le bouton de service personnel pour cette session de démo"':''}>Mettre fin au service</button></div></div>`;
  }).join(''):'<div class="empty-state">Aucun agent n’est actuellement en service.</div>';
  $$('[data-force-end]').forEach(b=>b.onclick=()=>openForceEnd(b.dataset.forceEnd));
}

function openForceEnd(agentId){
  const s=supActiveServices.find(x=>x.agentId===agentId); const a=agentById(agentId); if(!s||!a)return;
  $("#forceEndAgentId").value=agentId; $("#forceEndDate").value=toLocalInput(new Date().toISOString());
  $("#forceEndReason").value=""; $("#forceEndOther").value=""; $("#forceEndOtherWrap").classList.add("hidden");
  $("#forceEndAgentSummary").innerHTML=`<strong>#${escapeHtml(a.badge)} ・ ${escapeHtml(a.name)}</strong><div class="muted small">Début du service : ${formatDate(s.start)} ・ ${formatDuration(Date.now()-new Date(s.start))}</div>`;
  openModal("forceEndModal");
}
$("#forceEndReason").addEventListener("change",()=>$("#forceEndOtherWrap").classList.toggle("hidden",$("#forceEndReason").value!=="Autre"));
$("#forceEndForm").addEventListener("submit",e=>{
  e.preventDefault(); const agentId=$("#forceEndAgentId").value, active=supActiveServices.find(s=>s.agentId===agentId), a=agentById(agentId); if(!active||!a)return;
  const end=new Date($("#forceEndDate").value); if(isNaN(end)||end<=new Date(active.start)) return alert("L'heure de fin doit être postérieure au début du service.");
  const reason=$("#forceEndReason").value; const other=$("#forceEndOther").value.trim(); if(reason==="Autre"&&!other)return alert("Veuillez préciser le motif.");
  const completed={id:`svc-${Date.now()}`,agentId,start:active.start,end:end.toISOString(),source:"supervision",closedBy:profile.name,reason:reason==="Autre"?other:reason};
  supServices.unshift(completed); supActiveServices=supActiveServices.filter(s=>s!==active);
  supAudit.unshift({id:`audit-${Date.now()}`,type:"force-end",serviceId:completed.id,agentId,by:profile.name,date:nowIso(),reason:completed.reason,oldEnd:null,newEnd:completed.end});
  save(SUP_STORAGE.services,supServices);save(SUP_STORAGE.active,supActiveServices);save(SUP_STORAGE.audit,supAudit);closeModal("forceEndModal");renderSupervision();
});

function openEditService(id){
  const s=supServices.find(x=>x.id===id); if(!s)return alert("Ce service appartient aux données personnelles de démonstration et ne peut pas être modifié ici.");
  $("#editServiceId").value=id;$("#editServiceStart").value=toLocalInput(s.start);$("#editServiceEnd").value=toLocalInput(s.end);$("#editServiceReason").value="";closeModal("agentModal");openModal("editServiceModal");
}
$("#editServiceForm").addEventListener("submit",e=>{
  e.preventDefault(); const s=supServices.find(x=>x.id===$("#editServiceId").value); if(!s)return;
  const ns=new Date($("#editServiceStart").value),ne=new Date($("#editServiceEnd").value);if(ne<=ns)return alert("L'heure de fin doit être postérieure au début du service.");
  const oldStart=s.start,oldEnd=s.end,reason=$("#editServiceReason").value.trim();s.start=ns.toISOString();s.end=ne.toISOString();
  supAudit.unshift({id:`audit-${Date.now()}`,type:"edit",serviceId:s.id,agentId:s.agentId,by:profile.name,date:nowIso(),reason,oldStart,oldEnd,newStart:s.start,newEnd:s.end});
  save(SUP_STORAGE.services,supServices);save(SUP_STORAGE.audit,supAudit);closeModal("editServiceModal");renderSupervision();
});

function peakConcurrent(services,start,end){
  const events=[];
  services.forEach(s=>{const a=Math.max(new Date(s.start).getTime(),start.getTime()),b=Math.min((s.end?new Date(s.end).getTime():Date.now()),end.getTime());if(b>a){events.push([a,1],[b,-1]);}});
  events.sort((x,y)=>x[0]-y[0]||x[1]-y[1]);let cur=0,peak=0;events.forEach(([,d])=>{cur+=d;peak=Math.max(peak,cur)});return peak;
}
function bcsoDayWindow(date){
  const start=new Date(date);start.setHours(4,0,0,0);const end=new Date(start);end.setDate(end.getDate()+1);return[start,end];
}
function recapForDate(date, includeActive=false){
  const [start,end]=bcsoDayWindow(date);const all=allCompletedServices();if(includeActive)all.push(...currentActiveServices());
  const overlapping=all.filter(s=>overlapMs(s,start,end,includeActive)>0);const total=overlapping.reduce((t,s)=>t+overlapMs(s,start,end,includeActive),0);const unique=new Set(overlapping.map(s=>s.agentId)).size;
  return {date:new Date(start),start,end,total,unique,services:overlapping.length,peak:peakConcurrent(overlapping,start,end),avg:unique?total/unique:0};
}
function latestClosedBcsoDate(){
  const n=new Date();const d=new Date(n);d.setHours(4,0,0,0);if(n<d)d.setDate(d.getDate()-1);d.setDate(d.getDate()-1);return d;
}
function recapLabel(d){return new Intl.DateTimeFormat("fr-FR",{day:"2-digit",month:"long",year:"numeric"}).format(d).toUpperCase();}
function deltaMarkup(v,suffix="") {const cls=v>0?"up":v<0?"down":"neutral",sign=v>0?"+":"";return `<span class="delta ${cls}">${sign}${v}${suffix}</span>`;}
function renderDailyRecaps(){
  const base=latestClosedBcsoDate(); const recaps=[];for(let i=0;i<7;i++){const d=new Date(base);d.setDate(d.getDate()-i);recaps.push(recapForDate(d));}
  const r=recaps[0],prev=recaps[1];
  $("#latestDailyRecap").innerHTML=`<div class="recap-card"><div><div class="recap-date">${recapLabel(r.date)}</div><div class="recap-period">04:00 → 03:59 le lendemain</div></div><div class="recap-metrics"><div class="recap-metric"><span>Agents uniques</span><strong>${r.unique}</strong></div><div class="recap-metric"><span>Temps cumulé</span><strong>${formatShortDuration(r.total)}</strong></div><div class="recap-metric"><span>Durée moyenne / agent</span><strong>${formatShortDuration(r.avg)}</strong></div><div class="recap-metric"><span>Pic simultané</span><strong>${r.peak}</strong></div></div><div class="recap-compare"><span>Comparaison veille</span><span>Agents ${deltaMarkup(r.unique-prev.unique)} ・ Temps ${deltaMarkup(Math.round((r.total-prev.total)/3600000)," h")}</span></div></div>`;
  $("#dailyRecapsTable").innerHTML=`<table class="agents-table"><thead><tr><th>Journée</th><th>Agents uniques</th><th>Temps cumulé</th><th>Durée moyenne</th><th>Pic simultané</th></tr></thead><tbody>${recaps.map(x=>`<tr><td><strong>${shortDate(x.date)}</strong><span class="agent-badge">04:00 → 03:59</span></td><td>${x.unique}</td><td>${formatShortDuration(x.total)}</td><td>${formatShortDuration(x.avg)}</td><td>${x.peak}</td></tr>`).join('')}</tbody></table>`;
}

function renderServiceAgents(){
  const kind=$("#servicePeriodFilter").value,range=periodRange(kind),all=allCompletedServices();const live=currentActiveServices();let total=0,serviceCount=0;const unique=new Set();
  all.forEach(s=>{const ms=overlapMs(s,...range);if(ms){total+=ms;serviceCount++;unique.add(s.agentId)}});live.forEach(s=>{const ms=overlapMs(s,...range,true);if(ms){total+=ms;serviceCount++;unique.add(s.agentId)}});
  $("#trackingHours").textContent=formatShortDuration(total);$("#trackingServices").textContent=serviceCount;$("#trackingUnique").textContent=unique.size;
  const q=($("#serviceAgentSearch").value||"").toLowerCase(),af=$("#serviceActivityFilter").value;
  const rows=supAgents.filter(a=>a.active).map(a=>({a,ms:agentPeriodMs(a.id,range),count:all.filter(s=>s.agentId===a.id&&overlapMs(s,...range)>0).length+(live.some(s=>s.agentId===a.id)?1:0)})).filter(x=>[x.a.badge,x.a.name,x.a.rank].join(' ').toLowerCase().includes(q)).filter(x=>{const h=hoursValue(x.ms);return !af||(af==='under3'&&h<3)||(af==='3to6'&&h>=3&&h<6)||(af==='6to10'&&h>=6&&h<10)||(af==='over10'&&h>=10)}).sort((a,b)=>b.ms-a.ms);
  $("#serviceAgentsTable").innerHTML=`<table class="agents-table"><thead><tr><th>Agent</th><th>Services</th><th>Temps période</th><th>Ce mois</th><th>Dernier service</th><th></th></tr></thead><tbody>${rows.map(({a,ms,count})=>{const last=all.filter(s=>s.agentId===a.id).sort((x,y)=>new Date(y.start)-new Date(x.start))[0];return `<tr><td><div class="agent-identity"><img class="agent-mini-avatar" src="${agentAvatar(a)}" alt=""><div><div class="agent-name-line">#${a.badge} ・ ${escapeHtml(a.name)}</div><span class="agent-badge">${escapeHtml(a.rank)}</span></div></div></td><td>${count}</td><td><strong>${formatShortDuration(ms)}</strong></td><td>${formatShortDuration(agentMonthMs(a.id))}</td><td>${last?shortDate(last.start):'—'}</td><td><button class="secondary-btn" data-service-agent="${a.id}">Détails</button></td></tr>`}).join('')}</tbody></table>`;
  $$('[data-service-agent]').forEach(b=>b.onclick=()=>openAgentProfile(b.dataset.serviceAgent,'services'));
}

function renderAudit(){
  $("#serviceAuditList").innerHTML=supAudit.length?supAudit.slice(0,8).map(a=>{const ag=agentById(a.agentId);return `<div class="audit-item"><strong>${a.type==='force-end'?'Service terminé par la supervision':'Service modifié'} — #${ag?.badge||'—'} ${escapeHtml(ag?.name||'Agent')}</strong><span>${formatDate(a.date)} ・ Par ${escapeHtml(a.by)} ・ Motif : ${escapeHtml(a.reason)}</span>${a.type==='edit'?`<span>Ancienne fin : ${formatDate(a.oldEnd)} → Nouvelle fin : ${formatDate(a.newEnd)}</span>`:`<span>Fin retenue : ${formatDate(a.newEnd)}</span>`}</div>`;}).join(''):'<div class="empty-state">Aucune modification de service enregistrée.</div>';
}

function renderServiceTracking(){renderLiveDuty();renderServiceAgents();renderDailyRecaps();renderAudit();}
function renderSupervision(){renderAgentManagement();renderServiceTracking();renderAgendaManagement();renderReportSupervision();renderComplaintManagement();renderWarrantManagement();}

$("#servicePeriodFilter").addEventListener("change",renderServiceTracking);$("#serviceAgentSearch").addEventListener("input",renderServiceAgents);$("#serviceActivityFilter").addEventListener("change",renderServiceAgents);
$("#dutyToggle").addEventListener("click",()=>setTimeout(renderSupervision,0));
setInterval(()=>{ if(document.querySelector('#view-serviceTracking.active')) renderServiceTracking(); },30000);

renderSupervision();


// ============================================================
// SUPERVISION — AGENDA / RAPPORTS / PLAINTES / MANDATS
// ============================================================
function asLocalInput(iso){
  if(!iso) return "";
  const d=new Date(iso); const local=new Date(d.getTime()-d.getTimezoneOffset()*60000);
  return local.toISOString().slice(0,16);
}
function confirmAction(message){ return window.confirm(message); }

// GESTION DE L'AGENDA
function renderAgendaManagement(){
  const box=$("#supEventsList"); if(!box) return;
  const q=($("#supEventSearch")?.value||"").toLowerCase();
  const type=$("#supEventType")?.value||"";
  const list=events.filter(e=>(!type||e.type===type)&&[e.title,e.type,e.place,e.organizer,e.description].join(" ").toLowerCase().includes(q))
    .sort((a,b)=>new Date(a.date)-new Date(b.date));
  const now=Date.now();
  $("#supEventTotal").textContent=events.length;
  $("#supEventUpcoming").textContent=events.filter(e=>new Date(e.date).getTime()>=now).length;
  $("#supEventParticipants").textContent=events.reduce((n,e)=>n+(e.participants?.length||0),0);
  const limited=events.filter(e=>Number(e.max)>0);
  $("#supEventSeats").textContent=limited.length?limited.reduce((n,e)=>n+Math.max(0,Number(e.max)-(e.participants?.length||0)),0):"—";
  box.innerHTML=list.length?list.map(e=>`<article class="record-card"><div class="record-top"><div><span class="badge gold">${escapeHtml(e.type)}</span><h3>${escapeHtml(e.title)}</h3><div class="meta-row"><span>${formatDate(e.date)}</span><span>${escapeHtml(e.place)}</span><span>Organisateur : ${escapeHtml(e.organizer)}</span></div></div><span class="badge">${e.participants?.length||0}${e.max?` / ${e.max}`:""} participants</span></div><p class="muted">${escapeHtml(e.description)}</p><div class="event-actions"><button class="secondary-btn" data-sup-event-edit="${escapeHtml(e.id)}">Modifier</button><button class="danger-outline" data-sup-event-delete="${escapeHtml(e.id)}">Supprimer</button></div></article>`).join(""):'<div class="empty-state panel-lite">Aucun événement trouvé.</div>';
  $$('[data-sup-event-edit]').forEach(b=>b.onclick=()=>openEventManager(b.dataset.supEventEdit));
  $$('[data-sup-event-delete]').forEach(b=>b.onclick=()=>{
    const e=events.find(x=>x.id===b.dataset.supEventDelete); if(!e||!confirmAction(`Supprimer l’événement « ${e.title} » ?`))return;
    events=events.filter(x=>x.id!==e.id); save(STORAGE.events,events); renderEvents(); renderAgendaManagement();
  });
}
function openEventManager(id=null){
  const e=id?events.find(x=>x.id===id):null;
  $("#eventManageForm").reset(); $("#eventManageId").value=e?.id||"";
  $("#eventManageTitle").textContent=e?"Modifier l’événement":"Nouvel événement";
  $("#eventManageName").value=e?.title||""; $("#eventManageType").value=e?.type||"Formation";
  $("#eventManageDate").value=e?asLocalInput(e.date):asLocalInput(new Date(Date.now()+86400000).toISOString());
  $("#eventManagePlace").value=e?.place||""; $("#eventManageOrganizer").value=e?.organizer||profile.name;
  $("#eventManageMax").value=e?.max||""; $("#eventManageDescription").value=e?.description||""; openModal("eventManageModal");
}
$("#supNewEventBtn")?.addEventListener("click",()=>openEventManager());
$("#eventManageForm")?.addEventListener("submit",e=>{
  e.preventDefault(); const id=$("#eventManageId").value; const old=id?events.find(x=>x.id===id):null;
  const item={id:old?.id||`evt-${Date.now()}`,title:$("#eventManageName").value.trim(),type:$("#eventManageType").value,date:new Date($("#eventManageDate").value).toISOString(),place:$("#eventManagePlace").value.trim(),organizer:$("#eventManageOrganizer").value.trim(),max:$("#eventManageMax").value?Number($("#eventManageMax").value):null,description:$("#eventManageDescription").value.trim(),participants:old?.participants||[]};
  old?Object.assign(old,item):events.push(item); save(STORAGE.events,events); closeModal("eventManageModal"); renderEvents(); renderAgendaManagement();
});
$("#supEventSearch")?.addEventListener("input",renderAgendaManagement); $("#supEventType")?.addEventListener("change",renderAgendaManagement);

// SUPERVISION DES RAPPORTS
function reportStatusClass(status){return status==="Finalisé"?"green":status==="À vérifier"?"red":"gold";}
function renderReportSupervision(){
  const box=$("#supReportsTable"); if(!box)return;
  reports.forEach(r=>{if(!r.status)r.status="Finalisé"});
  const q=($("#supReportSearch")?.value||"").toLowerCase(), status=$("#supReportStatus")?.value||"";
  const list=reports.filter(r=>(!status||r.status===status)&&[r.id,r.title,r.author,r.type,r.status].join(" ").toLowerCase().includes(q));
  $("#supReportTotal").textContent=reports.length; $("#supReportFinal").textContent=reports.filter(r=>r.status==="Finalisé").length; $("#supReportReview").textContent=reports.filter(r=>r.status==="À vérifier").length; $("#supReportArchived").textContent=reports.filter(r=>r.status==="Archivé").length;
  box.innerHTML=`<table class="agents-table"><thead><tr><th>Rapport</th><th>Auteur</th><th>Type</th><th>Date</th><th>Statut</th><th></th></tr></thead><tbody>${list.map(r=>`<tr><td><strong>${escapeHtml(r.id)}</strong><span class="agent-badge">${escapeHtml(r.title)}</span></td><td>${escapeHtml(r.author)}</td><td>${escapeHtml(r.type)}</td><td>${formatDate(r.date)}</td><td><span class="badge ${reportStatusClass(r.status)}">${escapeHtml(r.status)}</span></td><td><div class="table-actions"><button class="secondary-btn" data-sup-report-view="${escapeHtml(r.id)}">Consulter</button><button class="primary-btn" data-sup-report-edit="${escapeHtml(r.id)}">Gérer</button></div></td></tr>`).join("")}</tbody></table>`;
  $$('[data-sup-report-view]').forEach(b=>b.onclick=()=>{const r=reports.find(x=>x.id===b.dataset.supReportView);alert(`${r.id}\n\n${r.title}\n${r.type}\nAuteur : ${r.author}\nDate : ${formatDate(r.date)}\n\n${r.summary}${r.supervisionNote?`\n\nNote supervision : ${r.supervisionNote}`:""}`)});
  $$('[data-sup-report-edit]').forEach(b=>b.onclick=()=>openReportManager(b.dataset.supReportEdit));
}
function openReportManager(id){const r=reports.find(x=>x.id===id);if(!r)return;$("#reportManageId").value=id;$("#reportManageStatus").value=r.status||"Finalisé";$("#reportManageNote").value=r.supervisionNote||"";$("#reportManageSummary").innerHTML=`<strong>${escapeHtml(r.id)} ・ ${escapeHtml(r.title)}</strong><div class="muted small">${escapeHtml(r.author)} ・ ${formatDate(r.date)}</div>`;openModal("reportManageModal");}
$("#reportManageForm")?.addEventListener("submit",e=>{e.preventDefault();const r=reports.find(x=>x.id===$("#reportManageId").value);if(!r)return;r.status=$("#reportManageStatus").value;r.supervisionNote=$("#reportManageNote").value.trim();save(STORAGE.reports,reports);closeModal("reportManageModal");renderMyReports();renderReportsDb();renderReportSupervision();});
$("#supReportSearch")?.addEventListener("input",renderReportSupervision); $("#supReportStatus")?.addEventListener("change",renderReportSupervision);

// GESTION DES PLAINTES
function renderComplaintManagement(){
  const box=$("#supComplaintsTable");if(!box)return;const q=($("#supComplaintSearch")?.value||"").toLowerCase(),status=$("#supComplaintStatus")?.value||"";
  const list=complaints.filter(c=>(!status||c.status===status)&&[c.id,c.type,c.writer,c.subject,c.assignedTo||"",c.status].join(" ").toLowerCase().includes(q));
  $("#supComplaintTotal").textContent=complaints.length;$("#supComplaintUnassigned").textContent=complaints.filter(c=>!c.assignedTo).length;$("#supComplaintOpen").textContent=complaints.filter(c=>c.status==="En cours"||c.status==="En attente d'informations").length;$("#supComplaintClosed").textContent=complaints.filter(c=>["Traitée","Classée"].includes(c.status)).length;
  box.innerHTML=`<table class="agents-table"><thead><tr><th>Plainte</th><th>Rédacteur</th><th>Agent en charge</th><th>Date</th><th>Statut</th><th></th></tr></thead><tbody>${list.map(c=>`<tr><td><strong>${escapeHtml(c.id)}</strong><span class="agent-badge">${escapeHtml(c.subject)}</span></td><td>${escapeHtml(c.writer)}</td><td>${escapeHtml(c.assignedTo||"Non assignée")}</td><td>${formatDate(c.date)}</td><td><span class="badge ${c.status==="En attente"?"red":"green"}">${escapeHtml(c.status)}</span></td><td><button class="primary-btn" data-sup-complaint="${escapeHtml(c.id)}">Gérer</button></td></tr>`).join("")}</tbody></table>`;
  $$('[data-sup-complaint]').forEach(b=>b.onclick=()=>openComplaintManager(b.dataset.supComplaint));
}
function openComplaintManager(id){const c=complaints.find(x=>x.id===id);if(!c)return;$("#complaintManageId").value=id;const sel=$("#complaintManageAgent");sel.innerHTML='<option value="">Non assignée</option>'+supAgents.filter(a=>a.active).map(a=>`<option value="${escapeHtml(a.name)}">#${escapeHtml(a.badge)} ・ ${escapeHtml(a.name)} — ${escapeHtml(a.rank)}</option>`).join("");sel.value=c.assignedTo||"";$("#complaintManageStatus").value=c.status;$("#complaintManageSummary").innerHTML=`<strong>${escapeHtml(c.id)} ・ ${escapeHtml(c.subject)}</strong><div class="muted small">${escapeHtml(c.type)} ・ Rédacteur : ${escapeHtml(c.writer)}</div>`;openModal("complaintManageModal");}
$("#complaintManageForm")?.addEventListener("submit",e=>{e.preventDefault();const c=complaints.find(x=>x.id===$("#complaintManageId").value);if(!c)return;c.assignedTo=$("#complaintManageAgent").value||null;c.status=$("#complaintManageStatus").value;if(c.assignedTo&&c.status==="En attente")c.status="En cours";save(STORAGE.complaints,complaints);closeModal("complaintManageModal");renderComplaints();renderComplaintManagement();});
$("#supComplaintSearch")?.addEventListener("input",renderComplaintManagement);$("#supComplaintStatus")?.addEventListener("change",renderComplaintManagement);

// GESTION DES MANDATS
function renderWarrantManagement(){
  const box=$("#supWarrantsTable");if(!box)return;const q=($("#supWarrantSearch")?.value||"").toLowerCase(),status=$("#supWarrantStatus")?.value||"";
  const list=warrants.filter(w=>(!status||w.status===status)&&[w.id,w.name,w.author,w.priority,w.danger,w.status].join(" ").toLowerCase().includes(q));
  $("#supWarrantTotal").textContent=warrants.length;$("#supWarrantActive").textContent=warrants.filter(w=>w.status==="Actif").length;$("#supWarrantHigh").textContent=warrants.filter(w=>w.status==="Actif"&&w.priority==="Priorité élevée").length;$("#supWarrantCleared").textContent=warrants.filter(w=>w.status==="Levée").length;
  box.innerHTML=`<table class="agents-table"><thead><tr><th>Mandat</th><th>Individu</th><th>Dangerosité</th><th>Priorité</th><th>Statut</th><th></th></tr></thead><tbody>${list.map(w=>`<tr><td><strong>${escapeHtml(w.id)}</strong><span class="agent-badge">${formatDate(w.createdAt)}</span></td><td>${escapeHtml(w.name)}</td><td>${escapeHtml(w.danger)}</td><td><span class="badge ${w.priority==="Priorité élevée"?"red":"gold"}">${escapeHtml(w.priority)}</span></td><td><span class="badge ${w.status==="Actif"?"green":"gold"}">${escapeHtml(w.status)}</span></td><td><div class="table-actions"><button class="secondary-btn" data-sup-warrant-edit="${escapeHtml(w.id)}">Modifier</button><button class="${w.status==="Actif"?"danger-btn":"secondary-btn"}" data-sup-warrant-toggle="${escapeHtml(w.id)}">${w.status==="Actif"?"Lever":"Réactiver"}</button><button class="danger-outline" data-sup-warrant-delete="${escapeHtml(w.id)}">Supprimer</button></div></td></tr>`).join("")}</tbody></table>`;
  $$('[data-sup-warrant-edit]').forEach(b=>b.onclick=()=>{const w=warrants.find(x=>x.id===b.dataset.supWarrantEdit);if(!w)return;$("#warrantEditId").value=w.id;$("#warrantName").value=w.name;$("#warrantDob").value=w.dob||"";$("#warrantDanger").value=w.danger;$("#warrantPriority").value=w.priority;$("#warrantCharges").value=w.charges;$("#warrantNotes").value=w.notes||"";$("#warrantImage").value="";$("#warrantModalTitle").textContent=`Modifier ${w.id}`;openModal("warrantModal")});
  $$('[data-sup-warrant-toggle]').forEach(b=>b.onclick=()=>{const w=warrants.find(x=>x.id===b.dataset.supWarrantToggle);if(!w)return;w.status=w.status==="Actif"?"Levée":"Actif";save(STORAGE.warrants,warrants);renderWarrants();renderWarrantManagement();});
  $$('[data-sup-warrant-delete]').forEach(b=>b.onclick=()=>{const w=warrants.find(x=>x.id===b.dataset.supWarrantDelete);if(!w||!confirmAction(`Supprimer définitivement ${w.id} ?`))return;warrants=warrants.filter(x=>x.id!==w.id);save(STORAGE.warrants,warrants);renderWarrants();renderWarrantManagement();});
}
$("#supNewWarrantBtn")?.addEventListener("click",()=>{$("#warrantForm").reset();$("#warrantEditId").value="";$("#warrantModalTitle").textContent="Nouveau mandat";openModal("warrantModal")});
$("#supWarrantSearch")?.addEventListener("input",renderWarrantManagement);$("#supWarrantStatus")?.addEventListener("change",renderWarrantManagement);

// Rafraîchit les vues supervision après les créations/modifications faites ailleurs.
$("#eventManageModal");
renderAgendaManagement(); renderReportSupervision(); renderComplaintManagement(); renderWarrantManagement();

$$('.nav-item').forEach(btn=>btn.addEventListener('click',()=>{
  if(btn.dataset.view==='agendaManagement') renderAgendaManagement();
  if(btn.dataset.view==='reportSupervision') renderReportSupervision();
  if(btn.dataset.view==='complaintManagement') renderComplaintManagement();
  if(btn.dataset.view==='warrantManagement') renderWarrantManagement();
}));


// ==================== BCSA — BLAINE COUNTY SHERIFF ACADEMY ====================
const BCSA_STORAGE = {
  interviews: "bcso_demo_bcsa_interviews", candidates: "bcso_demo_bcsa_candidates",
  badges: "bcso_demo_bcsa_badges", agentFiles: "bcso_demo_bcsa_agent_files",
  patrolReports: "bcso_demo_bcsa_patrol_reports"
};
const BCSA_WORKSHOPS = [
  {key:"1020",label:"10-20"},{key:"radio",label:"Code radio"},{key:"procedure",label:"Procédure"},
  {key:"legal",label:"Juridique"},{key:"ppa",label:"PPA"},{key:"physical",label:"Physique"},{key:"1031",label:"10-31"}
];
const BCSA_KNOWLEDGE = ["10-Codes","Code radio","Procédures","Juridique","PPA","Intervention","Communication radio","Conduite / poursuite"];
const BCSA_KNOWLEDGE_LEVELS = ["À travailler","En cours d’acquisition","Acquis","Maîtrisé"];
const BCSA_PATROL_SKILLS = ["Procédures","Radio","Contrôles routiers","Arrestations","Conduite","Code pénal","Contact civil","Gestion du stress"];
const BCSA_QUESTIONS = [
  ["Présentez-vous en quelques mots et expliquez votre parcours.",true],
  ["Quelles sont vos motivations pour intégrer le BCSO ?",true],
  ["Pourquoi le BCSO plutôt que le LSPD ?",false],
  ["Selon vous, que représente le BCSO ?",true],
  ["Citez deux qualités et deux défauts. Justifiez chacun d'eux.",false],
  ["Quels sont vos objectifs au sein du BCSO ? (Division(s), spécialisation(s), grade visé, évolution, etc.)",false],
  ["Quelle est la signification des initiales BCSO ?",true],
  ["Quelle est la devise du BCSO ?",true],
  ["Qu'attendez-vous de votre formation à la BCSA ?",false],
  ["Un supérieur vous donne un ordre avec lequel vous n'êtes pas d'accord. Comment réagissez-vous ?",false],
  ["Vous commettez une erreur en intervention. Que faites-vous ?",true],
  ["Un collègue enfreint le règlement devant vous. Quelle est votre réaction ?",false],
  ["Quelles sont, selon vous, les trois qualités indispensables d'un Deputy Sheriff ?",false],
  ["Pourquoi devrions-nous vous recruter plutôt qu'un autre candidat ?",false],
  ["Selon vous, qu'est-ce qui ferait de vous un mauvais Deputy ?",false],
  ["Vous êtes hors service et vous voyez quelqu’un se faire agresser dans la rue avec un couteau. Comment réagissez-vous ?",false],
  ["Vous êtes en service et vous arrivez sur une scène où un collègue est en difficulté face à un individu armé. Vous êtes seul sur place et l'individu représente une menace importante. Quelle est votre réaction ?",false],
  ["Avez-vous quelque chose à ajouter pour convaincre le jury de vous recruter ?",true]
];
const seedBcsaCandidates = ["Delilah Crowne","Jack Bright","Jackson Morrow","Joao Silva","Josh Rupantarra","Kamel Belkacem"].map((name,i)=>({id:`bcsa-c-${i+1}`,name,workshops:Object.fromEntries(BCSA_WORKSHOPS.map(w=>[w.key,{done:i===1&&w.key==="1031",validatedBy:i===1&&w.key==="1031"?"K. Belkacem":null,validatedAt:i===1&&w.key==="1031"?"2026-09-09T22:10":null,comment:""}]))}));
const seedBcsaInterviews = [{id:"INT-2026-0001",candidate:"Jack Bright",date:"2026-09-06",recruiter:"K. Belkacem",answers:BCSA_QUESTIONS.map(()=>({answer:"",evaluation:null})),decision:"Admis à la BCSA",overall:"Profil compatible avec les attentes de l'Academy.",status:"Clôturé"}];
const seedBcsaAgentFiles = [
  {id:"bcsa-a-1",name:"J. Bright",fullName:"Jack Bright",rank:"Deputy Trainee",badge:null,sponsor:null,candidateId:"bcsa-c-2",knowledge:{}},
  {id:"bcsa-a-2",name:"J. Rupantarra",fullName:"Josh Rupantarra",rank:"Deputy Trainee",badge:107,sponsor:null,candidateId:"bcsa-c-5",knowledge:{}},
  {id:"bcsa-a-3",name:"J. Morrow",fullName:"Jackson Morrow",rank:"Deputy Trainee",badge:193,sponsor:null,candidateId:"bcsa-c-3",knowledge:{}},
  {id:"bcsa-a-4",name:"K. Belkacem",fullName:"Kamel Belkacem",rank:"Deputy Trainee",badge:188,sponsor:null,candidateId:"bcsa-c-6",knowledge:{}},
  {id:"bcsa-a-5",name:"L. Mook",fullName:"L. Mook",rank:"Deputy Trainee",badge:null,sponsor:null,candidateId:null,knowledge:{}},
  {id:"bcsa-a-6",name:"M. Vitale",fullName:"M. Vitale",rank:"Deputy I",badge:115,sponsor:"M. Katyusha",candidateId:null,knowledge:{}},
  {id:"bcsa-a-7",name:"O. Vance",fullName:"O. Vance",rank:"Deputy I",badge:112,sponsor:null,candidateId:null,knowledge:{}},
  {id:"bcsa-a-8",name:"W. Kessler",fullName:"W. Kessler",rank:"Deputy I",badge:157,sponsor:null,candidateId:null,knowledge:{}}
];
const seedBcsaPatrolReports = [
  {id:"PR-2026-0010",date:"2026-09-04",traineeId:"bcsa-a-2",trainee:"J. Rupantarra",duration:"3h00",examiner:"C. O’Malley",examBadge:"154",examRank:"Deputy III",interventions:"Contrôle routier et intervention de proximité.",positive:"Bonne communication et attitude professionnelle.",improve:"Fluidifier les annonces radio.",skills:["Radio","Contrôles routiers","Contact civil"],otherSkill:"",overall:"Patrouille sérieuse, progression satisfaisante.",opinion:"Favorable",status:"Finalisé"},
  {id:"PR-2026-0009",date:"2026-09-02",traineeId:"bcsa-a-4",trainee:"K. Belkacem",duration:"3h",examiner:"N. Winchester",examBadge:"166",examRank:"Sergeant",interventions:"Patrouille générale.",positive:"Bon comportement.",improve:"Approfondir les procédures.",skills:["Procédures","Radio"],otherSkill:"",overall:"En progression.",opinion:"Favorable",status:"Finalisé"},
  {id:"PR-2026-0008",date:"2026-09-01",traineeId:"bcsa-a-8",trainee:"W. Kessler",duration:"1h30",examiner:"N. Winchester",examBadge:"166",examRank:"Sergeant",interventions:"Patrouille de secteur.",positive:"Bonne écoute.",improve:"Prendre davantage d'initiatives.",skills:["Contact civil"],otherSkill:"",overall:"Patrouille correcte.",opinion:"Mitigé",status:"Finalisé"}
];
let bcsaInterviews=load(BCSA_STORAGE.interviews,seedBcsaInterviews);
let bcsaCandidates=load(BCSA_STORAGE.candidates,seedBcsaCandidates);
let bcsaAgentFiles=load(BCSA_STORAGE.agentFiles,seedBcsaAgentFiles);
let bcsaPatrolReports=load(BCSA_STORAGE.patrolReports,seedBcsaPatrolReports);
let bcsaBadges=load(BCSA_STORAGE.badges,{});
// hydrate matricules depuis les fiches existantes
bcsaAgentFiles.forEach(a=>{if(a.badge&&!bcsaBadges[a.badge])bcsaBadges[a.badge]={agentId:a.id,name:a.name,rank:a.rank}});
[BCSA_STORAGE.interviews,BCSA_STORAGE.candidates,BCSA_STORAGE.agentFiles,BCSA_STORAGE.patrolReports,BCSA_STORAGE.badges].forEach((k,i)=>save(k,[bcsaInterviews,bcsaCandidates,bcsaAgentFiles,bcsaPatrolReports,bcsaBadges][i]));

function bcsaDateFr(date){return new Intl.DateTimeFormat("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric"}).format(new Date(date+"T12:00:00"))}
function bcsaNextId(prefix,items){const y=new Date().getFullYear();let max=0;items.forEach(x=>{const m=x.id?.match(/(\\d+)$/);if(m)max=Math.max(max,+m[1])});return `${prefix}-${y}-${String(max+1).padStart(4,"0")}`}
function bcsaDecisionClass(d){return d==="Admis à la BCSA"?"admit":d==="Refusé"?"reject":d==="Entretien complémentaire requis"?"extra":""}
function findBcsaAgent(id){return bcsaAgentFiles.find(a=>a.id===id)}
function findBcsaCandidate(id){return bcsaCandidates.find(c=>c.id===id)}
function workshopCount(c){return c?BCSA_WORKSHOPS.filter(w=>c.workshops?.[w.key]?.done).length:0}
function matchingPatrolReports(agent){return bcsaPatrolReports.filter(r=>r.traineeId===agent.id||r.trainee===agent.name||r.trainee===agent.fullName)}

function renderBcsaInterviews(){
  const q=($("#bcsaInterviewSearch")?.value||"").toLowerCase(),f=$("#bcsaInterviewFilter")?.value||"";
  $("#bcsaInterviewTotal").textContent=bcsaInterviews.length;$("#bcsaInterviewAdmitted").textContent=bcsaInterviews.filter(x=>x.decision==="Admis à la BCSA").length;$("#bcsaInterviewExtra").textContent=bcsaInterviews.filter(x=>x.decision==="Entretien complémentaire requis").length;$("#bcsaInterviewRejected").textContent=bcsaInterviews.filter(x=>x.decision==="Refusé").length;
  const rows=bcsaInterviews.filter(x=>(!f||(f==="En cours"?x.status==="Brouillon":x.decision===f))&&[x.candidate,x.recruiter,x.decision].join(" ").toLowerCase().includes(q));
  $("#bcsaInterviewList").innerHTML=rows.map(x=>`<article class="record-card"><div class="record-head"><div><span class="record-id">${escapeHtml(x.id)}</span><h3>${escapeHtml(x.candidate)}</h3></div><span class="interview-status ${bcsaDecisionClass(x.decision)}">${escapeHtml(x.status==="Brouillon"?"En cours":x.decision||"En cours")}</span></div><div class="meta-row"><span>${bcsaDateFr(x.date)}</span><span>Recruteur : ${escapeHtml(x.recruiter)}</span></div><div class="record-actions"><button class="secondary-btn" data-bcsa-open-interview="${x.id}">Consulter</button></div></article>`).join("")||'<div class="empty-state">Aucun entretien trouvé.</div>';
  $$('[data-bcsa-open-interview]').forEach(b=>b.onclick=()=>openBcsaInterview(b.dataset.bcsaOpenInterview));
}
function buildBcsaQuestions(answers=[]){
  $("#bcsaQuestionsContainer").innerHTML=BCSA_QUESTIONS.map(([q,evalable],i)=>{const a=answers[i]||{};return `<section class="bcsa-question"><h4>${i+1}. ${escapeHtml(q)}</h4><label>Réponse / Notes du recruteur<textarea rows="3" data-bcsa-answer="${i}">${escapeHtml(a.answer||"")}</textarea></label>${evalable?`<div class="bcsa-evaluation"><label><input type="radio" name="bcsaEval${i}" value="Satisfaisante" ${a.evaluation==="Satisfaisante"?"checked":""}> ✓ Réponse satisfaisante</label><label><input type="radio" name="bcsaEval${i}" value="Insatisfaisante" ${a.evaluation==="Insatisfaisante"?"checked":""}> ✕ Réponse insatisfaisante</label></div>`:""}</section>`}).join("");
}
function openBcsaInterview(id=null){
  const x=id?bcsaInterviews.find(v=>v.id===id):null;$("#bcsaInterviewForm").reset();$("#bcsaInterviewId").value=x?.id||"";$("#bcsaInterviewCandidate").value=x?.candidate||"";$("#bcsaInterviewDate").value=x?.date||new Date().toISOString().slice(0,10);$("#bcsaInterviewRecruiter").value=x?.recruiter||profile.name;$("#bcsaInterviewOverall").value=x?.overall||"";buildBcsaQuestions(x?.answers||[]);
  if(x?.decision){const r=document.querySelector(`input[name="bcsaDecision"][value="${CSS.escape(x.decision)}"]`);if(r)r.checked=true}
  $("#bcsaInterviewModalTitle").textContent=x?`Entretien — ${x.candidate}`:"Questionnaire d'entretien de recrutement";openModal("bcsaInterviewModal");
}
function collectBcsaInterview(status){
  const id=$("#bcsaInterviewId").value||bcsaNextId("INT",bcsaInterviews),answers=BCSA_QUESTIONS.map(([,e],i)=>({answer:document.querySelector(`[data-bcsa-answer="${i}"]`)?.value.trim()||"",evaluation:e?(document.querySelector(`input[name="bcsaEval${i}"]:checked`)?.value||null):null}));
  const decision=document.querySelector('input[name="bcsaDecision"]:checked')?.value||null;if(status==="Clôturé"&&!decision){alert("Sélectionnez une décision finale.");return null}
  return {id,candidate:$("#bcsaInterviewCandidate").value.trim(),date:$("#bcsaInterviewDate").value,recruiter:$("#bcsaInterviewRecruiter").value.trim(),answers,decision,overall:$("#bcsaInterviewOverall").value.trim(),status};
}
function saveBcsaInterview(status){const x=collectBcsaInterview(status);if(!x)return;const i=bcsaInterviews.findIndex(v=>v.id===x.id);if(i>=0)bcsaInterviews[i]=x;else bcsaInterviews.unshift(x);save(BCSA_STORAGE.interviews,bcsaInterviews);$("#bcsaInterviewId").value=x.id;if(status==="Clôturé"&&x.decision==="Admis à la BCSA"&&!bcsaCandidates.some(c=>c.name.toLowerCase()===x.candidate.toLowerCase())){if(confirm(`${x.candidate} est admis. L'ajouter aux ateliers BCSA ?`)){addBcsaCandidate(x.candidate)}}closeModal("bcsaInterviewModal");renderBcsa();}

function addBcsaCandidate(name){const c={id:`bcsa-c-${Date.now()}`,name,workshops:Object.fromEntries(BCSA_WORKSHOPS.map(w=>[w.key,{done:false,validatedBy:null,validatedAt:null,comment:""}]))};bcsaCandidates.push(c);save(BCSA_STORAGE.candidates,bcsaCandidates);return c}
function renderBcsaWorkshops(){const q=($("#bcsaWorkshopSearch")?.value||"").toLowerCase();const rows=bcsaCandidates.filter(c=>c.name.toLowerCase().includes(q));$("#bcsaWorkshopTable").innerHTML=`<table class="agents-table"><thead><tr><th>Candidat</th>${BCSA_WORKSHOPS.map(w=>`<th>${escapeHtml(w.label)}</th>`).join("")}<th>Progression</th></tr></thead><tbody>${rows.map(c=>{const n=workshopCount(c);return `<tr><td><button class="bcsa-candidate-link" data-bcsa-candidate="${c.id}">${escapeHtml(c.name)}</button></td>${BCSA_WORKSHOPS.map(w=>`<td><button class="bcsa-workshop-check ${c.workshops?.[w.key]?.done?"done":""}" title="${c.workshops?.[w.key]?.done?"Cliquer pour voir la validation":"Valider l'atelier"}" data-bcsa-workshop="${c.id}:${w.key}">${c.workshops?.[w.key]?.done?"✓":""}</button></td>`).join("")}<td><span class="progress-pill"><span>${n}/7</span><span class="progress-bar-mini"><i style="width:${n/7*100}%"></i></span></span></td></tr>`}).join("")}</tbody></table>`;$$('[data-bcsa-workshop]').forEach(b=>b.onclick=()=>toggleBcsaWorkshop(b.dataset.bcsaWorkshop));}
function toggleBcsaWorkshop(v){const [cid,key]=v.split(":"),c=findBcsaCandidate(cid),w=c?.workshops?.[key];if(!c||!w)return;if(!w.done){w.done=true;w.validatedBy=profile.name;w.validatedAt=new Date().toISOString();w.comment="";save(BCSA_STORAGE.candidates,bcsaCandidates);renderBcsaWorkshops();return}openBcsaWorkshopDetail(cid,key)}
function openBcsaWorkshopDetail(cid,key){const c=findBcsaCandidate(cid),def=BCSA_WORKSHOPS.find(w=>w.key===key),w=c.workshops[key];$("#bcsaWorkshopCandidateId").value=cid;$("#bcsaWorkshopKey").value=key;$("#bcsaWorkshopDetailTitle").textContent=`${def.label} — ${c.name}`;$("#bcsaWorkshopSummary").innerHTML=`<strong>✓ Atelier réussi</strong><div class="muted small">Validé par ${escapeHtml(w.validatedBy||"—")} ${w.validatedAt?`• ${formatDate(w.validatedAt)}`:""}</div>`;$("#bcsaWorkshopComment").value=w.comment||"";openModal("bcsaWorkshopDetailModal")}

function renderBcsaBadges(){let assigned=0;for(let n=100;n<=199;n++)if(bcsaBadges[n])assigned++;$("#bcsaBadgeAvailable").textContent=100-assigned;$("#bcsaBadgeAssigned").textContent=assigned;$("#bcsaBadgeRate").textContent=`${assigned}%`;const q=($("#bcsaBadgeSearch")?.value||"").toLowerCase(),f=$("#bcsaBadgeFilter")?.value||"";let out="";for(let n=100;n<=199;n++){const a=bcsaBadges[n],assignedNow=!!a;if(f==="available"&&assignedNow||f==="assigned"&&!assignedNow)continue;if(!String(n).includes(q)&&!(a?.name||"").toLowerCase().includes(q))continue;out+=`<article class="bcsa-badge-card"><div><div class="bcsa-badge-top"><span class="bcsa-badge-number"># ${n}</span><span class="bcsa-badge-state ${assignedNow?"assigned":"available"}">${assignedNow?"Attribué":"Disponible"}</span></div>${assignedNow?`<div class="bcsa-badge-person"><strong>${escapeHtml(a.name)}</strong><span>${escapeHtml(a.rank||"")}</span></div>`:""}</div><div class="bcsa-badge-actions">${assignedNow?`<button class="danger-outline" data-bcsa-unassign-badge="${n}">Retirer</button>`:`<button class="secondary-btn" data-bcsa-assign-badge="${n}">Attribuer</button>`}</div></article>`}$("#bcsaBadgeGrid").innerHTML=out||'<div class="empty-state">Aucun matricule trouvé.</div>';$$('[data-bcsa-assign-badge]').forEach(b=>b.onclick=()=>openBcsaBadgeAssign(+b.dataset.bcsaAssignBadge));$$('[data-bcsa-unassign-badge]').forEach(b=>b.onclick=()=>unassignBcsaBadge(+b.dataset.bcsaUnassignBadge))}
function openBcsaBadgeAssign(n){const availableAgents=bcsaAgentFiles.filter(a=>!a.badge&&!Object.values(bcsaBadges).some(b=>b.agentId===a.id));if(!availableAgents.length){alert("Aucun agent sans matricule n'est disponible dans le panel BCSA.");return}$("#bcsaBadgeNumber").value=n;$("#bcsaBadgeAssignTitle").textContent=`Attribuer le matricule #${n}`;$("#bcsaBadgeAgentSelect").innerHTML='<option value="">Sélectionner...</option>'+availableAgents.map(a=>`<option value="${a.id}">${escapeHtml(a.name)} — ${escapeHtml(a.rank)}</option>`).join("");openModal("bcsaBadgeAssignModal")}
function unassignBcsaBadge(n){const b=bcsaBadges[n];if(!b||!confirm(`Retirer le matricule #${n} à ${b.name} ?`))return;const a=findBcsaAgent(b.agentId);if(a)a.badge=null;delete bcsaBadges[n];save(BCSA_STORAGE.badges,bcsaBadges);save(BCSA_STORAGE.agentFiles,bcsaAgentFiles);renderBcsa()}

function renderBcsaAgents(){const q=($("#bcsaAgentSearch")?.value||"").toLowerCase(),g=$("#bcsaAgentGradeFilter")?.value||"",f=$("#bcsaAgentFileFilter")?.value||"";const rows=bcsaAgentFiles.filter(a=>["Deputy Trainee","Deputy I"].includes(a.rank)&&(!g||a.rank===g)&&(!f||(f==="linked"?!!a.candidateId:!a.candidateId))&&[a.name,a.fullName,a.badge].join(" ").toLowerCase().includes(q));$("#bcsaAgentsTable").innerHTML=`<table class="agents-table"><thead><tr><th>Agent</th><th>Grade</th><th>Matricule</th><th>Fiche</th><th>Parrain</th><th>Rapports</th><th>Actions</th></tr></thead><tbody>${rows.map(a=>{const prs=matchingPatrolReports(a);return `<tr><td><strong>${escapeHtml(a.name)}</strong></td><td>${escapeHtml(a.rank)}</td><td>${a.badge?`#${a.badge}`:"—"}</td><td>${a.candidateId?'<span class="access-ok">⛓ Liée</span>':'—'}</td><td>${escapeHtml(a.sponsor||"—")}</td><td>${prs.filter(r=>r.examiner===a.name).length} rédigé · ${prs.length} concernant</td><td><button class="secondary-btn" data-bcsa-agent-file="${a.id}">Voir la fiche</button></td></tr>`}).join("")}</tbody></table>`;$$('[data-bcsa-agent-file]').forEach(b=>b.onclick=()=>openBcsaAgentFile(b.dataset.bcsaAgentFile))}
function openBcsaAgentFile(id){const a=findBcsaAgent(id);if(!a)return;const c=findBcsaCandidate(a.candidateId),prs=matchingPatrolReports(a),n=workshopCount(c),acquired=BCSA_KNOWLEDGE.filter(k=>["Acquis","Maîtrisé"].includes(a.knowledge?.[k]?.level)).length;$("#bcsaAgentFileContent").innerHTML=`<div class="bcsa-file-head"><div><h2>${escapeHtml(a.name)}</h2><p class="muted">${escapeHtml(a.rank)} · Matricule ${a.badge?`#${a.badge}`:"—"}</p></div><span class="badge ${a.rank==="Deputy I"?"green":"gold"}">${escapeHtml(a.rank)}</span></div><h3>Parrain</h3><div class="bcsa-sponsor-row"><label>Agent référent<input id="bcsaSponsorInput" value="${escapeHtml(a.sponsor||"")}" placeholder="Nom du parrain..."></label><button class="secondary-btn" data-bcsa-save-sponsor="${a.id}">Enregistrer</button></div><div class="bcsa-file-metrics"><article class="info-box"><span>Ateliers</span><strong>${n}/7</strong></article><article class="info-box"><span>Connaissances acquises</span><strong>${acquired}/${BCSA_KNOWLEDGE.length}</strong></article><article class="info-box"><span>Patrouilles</span><strong>${prs.length}</strong></article><article class="info-box"><span>Questionnaire</span><strong>${bcsaInterviews.some(x=>[a.name,a.fullName].includes(x.candidate)&&x.decision==="Admis à la BCSA")?"Admis":"—"}</strong></article></div><h3 class="bcsa-section-title">Ateliers</h3><div class="bcsa-linked-workshops">${BCSA_WORKSHOPS.map(w=>`<div class="bcsa-linked-workshop ${c?.workshops?.[w.key]?.done?"done":""}">${c?.workshops?.[w.key]?.done?"✓":"×"} ${escapeHtml(w.label)}</div>`).join("")}</div><h3 class="bcsa-section-title">Connaissances de l'agent</h3><div class="bcsa-knowledge-grid">${BCSA_KNOWLEDGE.map(k=>{const x=a.knowledge?.[k]||{};return `<div class="bcsa-knowledge-row"><label><strong>${escapeHtml(k)}</strong><select data-bcsa-knowledge="${escapeHtml(k)}">${BCSA_KNOWLEDGE_LEVELS.map(l=>`<option ${x.level===l?"selected":""}>${escapeHtml(l)}</option>`).join("")}</select></label><div class="bcsa-knowledge-meta">${x.updatedBy?`Mis à jour par ${escapeHtml(x.updatedBy)} • ${formatDate(x.updatedAt)}`:"Aucune évaluation enregistrée"}</div></div>`}).join("")}</div><div class="modal-actions"><button class="primary-btn" data-bcsa-save-knowledge="${a.id}">Enregistrer les connaissances</button></div><h3 class="bcsa-section-title">Rapports de patrouille (${prs.length})</h3><div class="history-list">${prs.map(r=>`<div class="history-item"><div><strong>${bcsaDateFr(r.date)} — ${escapeHtml(r.duration)}</strong><span>Par ${escapeHtml(r.examiner)} • ${escapeHtml(r.opinion||r.status)}</span></div><button class="secondary-btn" data-bcsa-open-patrol="${r.id}">Ouvrir</button></div>`).join("")||'<div class="empty-state">Aucun rapport de patrouille.</div>'}</div>`;
  document.querySelector(`[data-bcsa-save-sponsor="${id}"]`).onclick=()=>{a.sponsor=$("#bcsaSponsorInput").value.trim()||null;save(BCSA_STORAGE.agentFiles,bcsaAgentFiles);openBcsaAgentFile(id);renderBcsaAgents()};document.querySelector(`[data-bcsa-save-knowledge="${id}"]`).onclick=()=>{$$('[data-bcsa-knowledge]').forEach(s=>a.knowledge[s.dataset.bcsaKnowledge]={level:s.value,updatedBy:profile.name,updatedAt:new Date().toISOString()});save(BCSA_STORAGE.agentFiles,bcsaAgentFiles);openBcsaAgentFile(id);renderBcsaAgents()};$$('[data-bcsa-open-patrol]').forEach(b=>b.onclick=()=>openBcsaPatrolReport(b.dataset.bcsaOpenPatrol,true));openModal("bcsaAgentFileModal")}

function opinionClass(o){return ["Très favorable","Favorable"].includes(o)?"good":o==="Mitigé"?"mid":"bad"}
function renderBcsaPatrolReports(){const q=($("#bcsaPatrolSearch")?.value||"").toLowerCase(),f=$("#bcsaPatrolOpinionFilter")?.value||"";const rows=bcsaPatrolReports.filter(r=>(!f||r.opinion===f)&&[r.trainee,r.examiner].join(" ").toLowerCase().includes(q)).sort((a,b)=>b.date.localeCompare(a.date));$("#bcsaPatrolReportsList").innerHTML=rows.map(r=>`<article class="bcsa-patrol-card"><h3>${escapeHtml(r.trainee)}</h3><div class="bcsa-patrol-meta"><span>${bcsaDateFr(r.date)}</span><span>— ${escapeHtml(r.duration)}</span></div><div class="bcsa-patrol-meta" style="margin-top:7px"><span>Par ${escapeHtml(r.examiner)}</span></div><span class="bcsa-opinion ${opinionClass(r.opinion)}">${escapeHtml(r.status==="Brouillon"?"Brouillon":r.opinion)}</span><div class="bcsa-patrol-actions"><button class="secondary-btn" data-bcsa-open-patrol="${r.id}">Ouvrir</button>${r.status==="Brouillon"?`<button class="danger-outline" data-bcsa-delete-patrol="${r.id}">Supprimer</button>`:""}</div></article>`).join("")||'<div class="empty-state">Aucun rapport trouvé.</div>';$$('[data-bcsa-open-patrol]').forEach(b=>b.onclick=()=>openBcsaPatrolReport(b.dataset.bcsaOpenPatrol));$$('[data-bcsa-delete-patrol]').forEach(b=>b.onclick=()=>{if(confirm("Supprimer ce brouillon ?")){bcsaPatrolReports=bcsaPatrolReports.filter(r=>r.id!==b.dataset.bcsaDeletePatrol);save(BCSA_STORAGE.patrolReports,bcsaPatrolReports);renderBcsaPatrolReports()}})}
function canCreateBcsaPatrol(){const ranks=["Deputy Trainee","Deputy I","Deputy II","Deputy III","Senior Deputy","Corporal","Sergeant","Lieutenant","Captain","Undersheriff","Sheriff"];return ranks.indexOf(profile.rank)>=ranks.indexOf("Deputy III")||["Captain","Lieutenant","Sergeant","Sheriff","Undersheriff"].includes(profile.rank)}
function populatePatrolSkills(selected=[]){$("#bcsaPatrolSkills").innerHTML=BCSA_PATROL_SKILLS.map(s=>`<label><input type="checkbox" value="${escapeHtml(s)}" ${selected.includes(s)?"checked":""}> ${escapeHtml(s)}</label>`).join("")}
function openBcsaPatrolReport(id=null,readOnly=false){const r=id?bcsaPatrolReports.find(x=>x.id===id):null;if(r&&r.status==="Finalisé"){showBcsaPatrolRead(r);return}if(!r&&!canCreateBcsaPatrol()){alert("La création des rapports de patrouille est réservée aux Deputy III et grades supérieurs.");return}$("#bcsaPatrolReportForm").reset();$("#bcsaPatrolReportId").value=r?.id||"";$("#bcsaPatrolDate").value=r?.date||new Date().toISOString().slice(0,10);$("#bcsaPatrolExamBadge").value=r?.examBadge||supAgents.find(a=>a.name===profile.name)?.badge||"—";$("#bcsaPatrolExamRank").value=r?.examRank||profile.rank;$("#bcsaPatrolDuration").value=r?.duration||"";$("#bcsaPatrolInterventions").value=r?.interventions||"";$("#bcsaPatrolPositive").value=r?.positive||"";$("#bcsaPatrolImprove").value=r?.improve||"";$("#bcsaPatrolOverall").value=r?.overall||"";$("#bcsaPatrolOtherSkill").value=r?.otherSkill||"";$("#bcsaPatrolTrainee").innerHTML='<option value="">Sélectionner...</option>'+bcsaAgentFiles.filter(a=>["Deputy Trainee","Deputy I"].includes(a.rank)).map(a=>`<option value="${a.id}" ${r?.traineeId===a.id?"selected":""}>${escapeHtml(a.name)} — ${escapeHtml(a.rank)} ${a.badge?`#${a.badge}`:""}</option>`).join("");populatePatrolSkills(r?.skills||[]);if(r?.opinion){const o=document.querySelector(`input[name="bcsaPatrolOpinion"][value="${CSS.escape(r.opinion)}"]`);if(o)o.checked=true}openModal("bcsaPatrolReportModal")}
function collectPatrolReport(status){const aid=$("#bcsaPatrolTrainee").value,a=findBcsaAgent(aid);if(!a){alert("Sélectionnez l'agent supervisé.");return null}const id=$("#bcsaPatrolReportId").value||bcsaNextId("PR",bcsaPatrolReports),opinion=document.querySelector('input[name="bcsaPatrolOpinion"]:checked')?.value||null;if(status==="Finalisé"&&!opinion){alert("Sélectionnez l'avis de l'examinateur.");return null}return {id,date:$("#bcsaPatrolDate").value,traineeId:a.id,trainee:a.name,duration:$("#bcsaPatrolDuration").value.trim(),examiner:profile.name,examBadge:$("#bcsaPatrolExamBadge").value,examRank:$("#bcsaPatrolExamRank").value,interventions:$("#bcsaPatrolInterventions").value.trim(),positive:$("#bcsaPatrolPositive").value.trim(),improve:$("#bcsaPatrolImprove").value.trim(),skills:$$('#bcsaPatrolSkills input:checked').map(x=>x.value),otherSkill:$("#bcsaPatrolOtherSkill").value.trim(),overall:$("#bcsaPatrolOverall").value.trim(),opinion,status}}
function savePatrolReport(status){const r=collectPatrolReport(status);if(!r)return;const i=bcsaPatrolReports.findIndex(x=>x.id===r.id);if(i>=0)bcsaPatrolReports[i]=r;else bcsaPatrolReports.unshift(r);save(BCSA_STORAGE.patrolReports,bcsaPatrolReports);closeModal("bcsaPatrolReportModal");renderBcsa()}
function showBcsaPatrolRead(r){$("#bcsaAgentFileContent").innerHTML=`<div class="bcsa-file-head"><div><p class="eyebrow">Rapport de patrouille</p><h2>${escapeHtml(r.trainee)}</h2><p class="muted">${bcsaDateFr(r.date)} • ${escapeHtml(r.duration)} • ${escapeHtml(r.id)}</p></div><span class="bcsa-opinion ${opinionClass(r.opinion)}">${escapeHtml(r.opinion)}</span></div><div class="info-grid"><div class="info-box"><span>Examinateur</span><strong>${escapeHtml(r.examiner)}</strong></div><div class="info-box"><span>Grade</span><strong>${escapeHtml(r.examRank)}</strong></div><div class="info-box"><span>Matricule</span><strong>#${escapeHtml(r.examBadge)}</strong></div><div class="info-box"><span>Agent supervisé</span><strong>${escapeHtml(r.trainee)}</strong></div></div><div class="bcsa-read-section"><h4>Interventions réalisées</h4><p>${escapeHtml(r.interventions)}</p></div><div class="bcsa-read-section"><h4>Points positifs</h4><p>${escapeHtml(r.positive)}</p></div><div class="bcsa-read-section"><h4>Points à améliorer</h4><p>${escapeHtml(r.improve)}</p></div><div class="bcsa-read-section"><h4>Compétences travaillées</h4><div class="bcsa-patrol-read-skills">${[...r.skills,r.otherSkill].filter(Boolean).map(s=>`<span>${escapeHtml(s)}</span>`).join("")}</div></div><div class="bcsa-read-section"><h4>Appréciation générale</h4><p>${escapeHtml(r.overall)}</p></div>`;openModal("bcsaAgentFileModal")}

function renderBcsa(){renderBcsaInterviews();renderBcsaWorkshops();renderBcsaBadges();renderBcsaAgents();renderBcsaPatrolReports()}

// BCSA events
$("#bcsaNewInterviewBtn").onclick=()=>openBcsaInterview();$("#bcsaInterviewSearch").oninput=renderBcsaInterviews;$("#bcsaInterviewFilter").onchange=renderBcsaInterviews;$("#bcsaInterviewForm").onsubmit=e=>{e.preventDefault();saveBcsaInterview("Clôturé")};$("#bcsaSaveInterviewDraft").onclick=()=>saveBcsaInterview("Brouillon");
$("#bcsaAddCandidateBtn").onclick=()=>openModal("bcsaAddCandidateModal");$("#bcsaWorkshopSearch").oninput=renderBcsaWorkshops;$("#bcsaAddCandidateForm").onsubmit=e=>{e.preventDefault();addBcsaCandidate($("#bcsaCandidateName").value.trim());e.target.reset();closeModal("bcsaAddCandidateModal");renderBcsaWorkshops()};
$("#bcsaWorkshopDetailForm").onsubmit=e=>{e.preventDefault();const c=findBcsaCandidate($("#bcsaWorkshopCandidateId").value),w=c.workshops[$("#bcsaWorkshopKey").value];w.comment=$("#bcsaWorkshopComment").value.trim();save(BCSA_STORAGE.candidates,bcsaCandidates);closeModal("bcsaWorkshopDetailModal");renderBcsaWorkshops()};$("#bcsaWorkshopInvalidateBtn").onclick=()=>{const c=findBcsaCandidate($("#bcsaWorkshopCandidateId").value),w=c.workshops[$("#bcsaWorkshopKey").value];w.done=false;w.validatedBy=null;w.validatedAt=null;w.comment="";save(BCSA_STORAGE.candidates,bcsaCandidates);closeModal("bcsaWorkshopDetailModal");renderBcsaWorkshops()};
$("#bcsaBadgeSearch").oninput=renderBcsaBadges;$("#bcsaBadgeFilter").onchange=renderBcsaBadges;$("#bcsaBadgeAssignForm").onsubmit=e=>{e.preventDefault();const n=+$("#bcsaBadgeNumber").value,id=$("#bcsaBadgeAgentSelect").value,a=findBcsaAgent(id);if(!a)return;if(a.badge||Object.values(bcsaBadges).some(b=>b.agentId===id)){alert("Cet agent possède déjà un matricule.");return}bcsaBadges[n]={agentId:id,name:a.name,rank:a.rank};a.badge=n;save(BCSA_STORAGE.badges,bcsaBadges);save(BCSA_STORAGE.agentFiles,bcsaAgentFiles);closeModal("bcsaBadgeAssignModal");renderBcsa()};
$("#bcsaAgentSearch").oninput=renderBcsaAgents;$("#bcsaAgentGradeFilter").onchange=renderBcsaAgents;$("#bcsaAgentFileFilter").onchange=renderBcsaAgents;
$("#bcsaPatrolSearch").oninput=renderBcsaPatrolReports;$("#bcsaPatrolOpinionFilter").onchange=renderBcsaPatrolReports;$("#bcsaNewPatrolReportBtn").onclick=()=>openBcsaPatrolReport();$("#bcsaPatrolReportForm").onsubmit=e=>{e.preventDefault();savePatrolReport("Finalisé")};$("#bcsaPatrolSaveDraft").onclick=()=>savePatrolReport("Brouillon");
renderBcsa();


// ================= INVESTIGATION DIVISION =================
const INV_STORAGE={cases:"bcso_demo_inv_cases",suspects:"bcso_demo_inv_suspects",boards:"bcso_demo_inv_boards"};
const seedInvCases=[
  {id:"INV-2026-0001",title:"Trafic d’armes — Sandy Shores",status:"En cours",priority:"Élevée",investigators:"K. Belkacem, J. Carter",opened:"2026-09-08",summary:"Enquête portant sur plusieurs transactions suspectes et un possible réseau de revente d’armes.",updatedAt:"2026-09-10T01:42:00",suspectIds:["SUS-2026-0001"],reportIds:["R-2026-0004"]},
  {id:"INV-2026-0002",title:"Série de vols — Grapeseed",status:"Ouvert",priority:"Normale",investigators:"M. Owens",opened:"2026-09-09",summary:"Rapprochement de plusieurs faits similaires signalés dans le secteur de Grapeseed.",updatedAt:"2026-09-09T23:10:00",suspectIds:[],reportIds:["R-2026-0003"]}
];
const seedInvSuspects=[
  {id:"SUS-2026-0001",name:"John William",alias:"JW",danger:"Élevée",grouped:"yes",group:"Red Vultures",role:"Intermédiaire présumé",vehicles:"Sultan noir — plaque inconnue",notes:"Suspect relié à plusieurs contacts identifiés dans le dossier armes.",caseIds:["INV-2026-0001"],createdBy:"K. Belkacem",updatedAt:"2026-09-10T01:30:00"},
  {id:"SUS-2026-0002",name:"Michael Carter",alias:"",danger:"Moyenne",grouped:"no",group:"",role:"",vehicles:"Baller gris — 6ABC219",notes:"À vérifier. Présence récurrente sur plusieurs scènes.",caseIds:[],createdBy:"J. Carter",updatedAt:"2026-09-09T20:05:00"}
];
let invCases=load(INV_STORAGE.cases,seedInvCases),invSuspects=load(INV_STORAGE.suspects,seedInvSuspects),invBoards=load(INV_STORAGE.boards,{}),currentInvCaseId=null,invZoom=1;
save(INV_STORAGE.cases,invCases);save(INV_STORAGE.suspects,invSuspects);save(INV_STORAGE.boards,invBoards);
function invNextId(prefix,items){const y=new Date().getFullYear(),nums=items.filter(x=>x.id.startsWith(`${prefix}-${y}-`)).map(x=>parseInt(x.id.split("-").pop(),10)||0);return `${prefix}-${y}-${String((Math.max(0,...nums)+1)).padStart(4,"0")}`}
function invStatusClass(s){return s==="Classé"?"good":s==="En attente"?"warn":s==="Transmis"?"warn":""}
function invPriorityClass(p){return p==="Critique"?"bad":p==="Élevée"?"warn":""}
function invRenderCases(){const q=($("#invCaseSearch")?.value||"").toLowerCase(),st=$("#invCaseStatus")?.value||"",pr=$("#invCasePriority")?.value||"";const rows=invCases.filter(c=>(!st||c.status===st)&&(!pr||c.priority===pr)&&[c.id,c.title,c.investigators,c.summary].join(" ").toLowerCase().includes(q));$("#invActiveCount").textContent=invCases.filter(c=>c.status!=="Classé").length;$("#invHighCount").textContent=invCases.filter(c=>["Élevée","Critique"].includes(c.priority)&&c.status!=="Classé").length;$("#invClosedCount").textContent=invCases.filter(c=>c.status==="Classé").length;$("#invLinkedSuspects").textContent=new Set(invCases.flatMap(c=>c.suspectIds||[])).size;$("#invCasesList").innerHTML=rows.map(c=>`<article class="inv-case-card ${c.priority==="Critique"?"priority-critical":c.priority==="Élevée"?"priority-high":""}"><div class="inv-case-top"><div><div class="inv-id">${escapeHtml(c.id)}</div><h3>${escapeHtml(c.title)}</h3></div><span class="inv-tag ${invStatusClass(c.status)}">${escapeHtml(c.status)}</span></div><div class="inv-meta"><span>Priorité : <strong>${escapeHtml(c.priority)}</strong></span><span>Ouvert le ${escapeHtml(c.opened.split("-").reverse().join("/"))}</span><span>${(c.suspectIds||[]).length} suspect(s)</span><span>${(c.reportIds||[]).length} rapport(s)</span></div><div class="inv-meta">Enquêteur(s) : ${escapeHtml(c.investigators)}</div><p class="inv-summary">${escapeHtml(c.summary||"Aucun résumé.")}</p><div class="inv-actions"><button class="primary-btn" data-inv-open="${c.id}">Ouvrir</button><button class="secondary-btn" data-inv-edit="${c.id}">Modifier</button><button class="danger-outline" data-inv-delete="${c.id}">Supprimer</button></div></article>`).join("")||'<div class="inv-empty">Aucun dossier ne correspond aux filtres.</div>';$$('[data-inv-open]').forEach(b=>b.onclick=()=>openInvBoard(b.dataset.invOpen));$$('[data-inv-edit]').forEach(b=>b.onclick=()=>openInvCaseForm(b.dataset.invEdit));$$('[data-inv-delete]').forEach(b=>b.onclick=()=>deleteInvCase(b.dataset.invDelete))}
function openInvCaseForm(id=null){const c=id?invCases.find(x=>x.id===id):null;$("#invCaseForm").reset();$("#invCaseId").value=c?.id||"";$("#invCaseModalTitle").textContent=c?`Modifier ${c.id}`:"Nouveau dossier";$("#invCaseTitle").value=c?.title||"";$("#invCaseInvestigators").value=c?.investigators||profile.name;$("#invCaseFormStatus").value=c?.status||"Ouvert";$("#invCaseFormPriority").value=c?.priority||"Normale";$("#invCaseOpened").value=c?.opened||new Date().toISOString().slice(0,10);$("#invCaseSummary").value=c?.summary||"";openModal("invCaseModal")}
function deleteInvCase(id){const c=invCases.find(x=>x.id===id);if(!c||!confirm(`Supprimer définitivement ${c.id} — ${c.title} ?`))return;invCases=invCases.filter(x=>x.id!==id);invSuspects.forEach(s=>s.caseIds=(s.caseIds||[]).filter(x=>x!==id));delete invBoards[id];save(INV_STORAGE.cases,invCases);save(INV_STORAGE.suspects,invSuspects);save(INV_STORAGE.boards,invBoards);invRenderAll()}
function invRenderSuspects(){const q=($("#invSuspectSearch")?.value||"").toLowerCase(),gf=$("#invSuspectGroupFilter")?.value||"",df=$("#invSuspectDangerFilter")?.value||"";const rows=invSuspects.filter(s=>(!gf||s.grouped===gf)&&(!df||s.danger===df)&&[s.name,s.alias,s.group,s.role,s.vehicles,s.notes].join(" ").toLowerCase().includes(q));$("#invSuspectCount").textContent=invSuspects.length;$("#invGroupCount").textContent=invSuspects.filter(s=>s.grouped==="yes").length;$("#invDangerCount").textContent=invSuspects.filter(s=>["Élevée","Critique"].includes(s.danger)).length;$("#invUniqueGroups").textContent=new Set(invSuspects.filter(s=>s.grouped==="yes"&&s.group).map(s=>s.group.trim().toLowerCase())).size;$("#invSuspectsList").innerHTML=rows.map(s=>`<article class="inv-suspect-card"><div class="inv-suspect-top"><div><div class="inv-id">${escapeHtml(s.id)}</div><h3>${escapeHtml(s.name)}</h3>${s.alias?`<span class="muted">Alias : ${escapeHtml(s.alias)}</span>`:""}</div><span class="inv-tag ${invPriorityClass(s.danger)}">${escapeHtml(s.danger)}</span></div><div class="inv-meta"><span>Groupuscule : <strong>${s.grouped==="yes"?"Oui":"Non"}</strong></span>${s.grouped==="yes"?`<span class="group-name">${escapeHtml(s.group||"Non renseigné")}</span>`:""}<span>${(s.caseIds||[]).length} dossier(s)</span></div>${s.role?`<div class="inv-meta">Rôle supposé : ${escapeHtml(s.role)}</div>`:""}${s.vehicles?`<div class="inv-meta">Véhicules : ${escapeHtml(s.vehicles)}</div>`:""}<p class="inv-summary">${escapeHtml(s.notes||"Aucune note.")}</p><div class="inv-actions"><button class="secondary-btn" data-inv-suspect-edit="${s.id}">Modifier</button><button class="danger-outline" data-inv-suspect-delete="${s.id}">Supprimer</button></div></article>`).join("")||'<div class="inv-empty">Aucune fiche suspect trouvée.</div>';$$('[data-inv-suspect-edit]').forEach(b=>b.onclick=()=>openInvSuspectForm(b.dataset.invSuspectEdit));$$('[data-inv-suspect-delete]').forEach(b=>b.onclick=()=>deleteInvSuspect(b.dataset.invSuspectDelete))}
function openInvSuspectForm(id=null){const s=id?invSuspects.find(x=>x.id===id):null;$("#invSuspectForm").reset();$("#invSuspectId").value=s?.id||"";$("#invSuspectModalTitle").textContent=s?`Modifier ${s.id}`:"Nouvelle fiche suspect";$("#invSuspectName").value=s?.name||"";$("#invSuspectAlias").value=s?.alias||"";$("#invSuspectDanger").value=s?.danger||"Faible";$("#invSuspectGrouped").value=s?.grouped||"no";$("#invSuspectGroup").value=s?.group||"";$("#invSuspectRole").value=s?.role||"";$("#invSuspectVehicles").value=s?.vehicles||"";$("#invSuspectNotes").value=s?.notes||"";toggleInvGroupField();openModal("invSuspectModal")}
function toggleInvGroupField(){$("#invSuspectGroup").disabled=$("#invSuspectGrouped").value!=="yes";if($("#invSuspectGroup").disabled)$("#invSuspectGroup").value=""}
function deleteInvSuspect(id){const s=invSuspects.find(x=>x.id===id);if(!s||!confirm(`Supprimer la fiche ${s.name} ?`))return;invSuspects=invSuspects.filter(x=>x.id!==id);invCases.forEach(c=>c.suspectIds=(c.suspectIds||[]).filter(x=>x!==id));Object.values(invBoards).forEach(b=>b.nodes=(b.nodes||[]).filter(n=>!(n.kind==="suspect"&&n.refId===id)));save(INV_STORAGE.suspects,invSuspects);save(INV_STORAGE.cases,invCases);save(INV_STORAGE.boards,invBoards);invRenderAll()}
function invRenderAll(){invRenderCases();invRenderSuspects();if(currentInvCaseId)renderInvBoard()}

// Investigation board
function getInvBoard(caseId){if(!invBoards[caseId])invBoards[caseId]={nodes:[]};return invBoards[caseId]}
function openInvBoard(id){const c=invCases.find(x=>x.id===id);if(!c)return;currentInvCaseId=id;$("#invBoardCaseId").textContent=c.id;$("#invBoardCaseTitle").textContent=c.title;$("#invBoardCaseStatus").value=c.status;invZoom=1;renderInvBoard();openModal("invBoardModal");requestAnimationFrame(()=>centerInvBoard())}
function centerInvBoard(){const stage=$("#invBoardStage"),wrap=stage.parentElement;stage.style.left=`${Math.max(20,(wrap.clientWidth-2200*invZoom)/2)}px`;stage.style.top=`${Math.max(20,(wrap.clientHeight-1500*invZoom)/2)}px`;applyInvZoom()}
function applyInvZoom(){const stage=$("#invBoardStage");stage.style.transform=`scale(${invZoom})`;$("#invZoomLabel").textContent=`${Math.round(invZoom*100)}%`}
function renderInvBoard(){const c=invCases.find(x=>x.id===currentInvCaseId);if(!c)return;const b=getInvBoard(c.id);$("#invBoardCaseStatus").value=c.status;$("#invBoardSuspects").innerHTML=(c.suspectIds||[]).map(id=>invSuspects.find(s=>s.id===id)).filter(Boolean).map(s=>`<div class="inv-linked-item">${escapeHtml(s.name)}${s.group?`<br><small>${escapeHtml(s.group)}</small>`:""}</div>`).join("")||'<span class="muted small">Aucun suspect lié.</span>';$("#invBoardReports").innerHTML=(c.reportIds||[]).map(id=>reports.find(r=>r.id===id)).filter(Boolean).map(r=>`<div class="inv-linked-item">${escapeHtml(r.id)}<br><small>${escapeHtml(r.title)}</small></div>`).join("")||'<span class="muted small">Aucun rapport importé.</span>';$("#invBoardNodes").innerHTML=(b.nodes||[]).map(n=>invNodeHtml(n)).join("");$$('.inv-board-node').forEach(el=>makeInvNodeDraggable(el));$$('.node-remove').forEach(btn=>btn.onclick=e=>{e.stopPropagation();const board=getInvBoard(currentInvCaseId);board.nodes=board.nodes.filter(n=>n.id!==btn.dataset.nodeRemove);save(INV_STORAGE.boards,invBoards);renderInvBoard()})}
function invNodeHtml(n){let title=n.title||"Élément",body=n.body||"",img=n.image?`<img src="${n.image}" alt="Image dossier">`:"";return `<div class="inv-board-node" data-node-id="${n.id}" style="left:${n.x}px;top:${n.y}px"><button class="node-remove" data-node-remove="${n.id}">×</button><span class="node-type">${escapeHtml(n.kind)}</span><h4>${escapeHtml(title)}</h4><p>${escapeHtml(body)}</p>${img}</div>`}
function makeInvNodeDraggable(el){let startX,startY,origX,origY,moved=false;const down=e=>{if(e.target.closest('button'))return;moved=false;startX=e.clientX;startY=e.clientY;origX=parseFloat(el.style.left)||0;origY=parseFloat(el.style.top)||0;el.setPointerCapture?.(e.pointerId);const move=ev=>{moved=true;const dx=(ev.clientX-startX)/invZoom,dy=(ev.clientY-startY)/invZoom;el.style.left=`${Math.max(0,origX+dx)}px`;el.style.top=`${Math.max(0,origY+dy)}px`};const up=ev=>{el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);if(moved){const n=getInvBoard(currentInvCaseId).nodes.find(x=>x.id===el.dataset.nodeId);if(n){n.x=parseFloat(el.style.left);n.y=parseFloat(el.style.top);save(INV_STORAGE.boards,invBoards)}}};el.addEventListener('pointermove',move);el.addEventListener('pointerup',up)};el.addEventListener('pointerdown',down)}
function addInvNode(kind,title,body,refId=null,image=null){const b=getInvBoard(currentInvCaseId),i=b.nodes.length;b.nodes.push({id:`node-${Date.now()}-${i}`,kind,title,body,refId,image,x:380+(i%4)*270,y:170+Math.floor(i/4)*180});save(INV_STORAGE.boards,invBoards);renderInvBoard()}
function openInvPicker(mode){const c=invCases.find(x=>x.id===currentInvCaseId);if(!c)return;$("#invPickerSearch").value="";$("#invPickerTitle").textContent=mode==="suspect"?"Ajouter un suspect au dossier":"Importer un rapport BCSO";const draw=()=>{const q=$("#invPickerSearch").value.toLowerCase();let items;if(mode==="suspect")items=invSuspects.filter(s=>![...(c.suspectIds||[])].includes(s.id)&&[s.name,s.alias,s.group].join(" ").toLowerCase().includes(q));else items=reports.filter(r=>![...(c.reportIds||[])].includes(r.id)&&[r.id,r.title,r.author,r.summary].join(" ").toLowerCase().includes(q));$("#invPickerList").innerHTML=items.map(x=>`<div class="inv-picker-item"><div><strong>${escapeHtml(mode==="suspect"?x.name:`${x.id} — ${x.title}`)}</strong><small>${escapeHtml(mode==="suspect"?(x.grouped==="yes"?`Groupuscule : ${x.group}`:`${x.danger} • Sans groupuscule`):`${x.author} • ${formatDate(x.date)}`)}</small></div><button class="primary-btn" data-inv-pick="${x.id}">Ajouter</button></div>`).join("")||'<div class="empty-state">Aucun élément disponible.</div>';$$('[data-inv-pick]').forEach(b=>b.onclick=()=>{const id=b.dataset.invPick;if(mode==="suspect"){c.suspectIds=[...(c.suspectIds||[]),id];const s=invSuspects.find(x=>x.id===id);s.caseIds=[...new Set([...(s.caseIds||[]),c.id])];addInvNode("Suspect",s.name,[s.alias?`Alias : ${s.alias}`:"",s.grouped==="yes"?`Groupuscule : ${s.group}`:"Sans groupuscule",`Dangerosité : ${s.danger}`].filter(Boolean).join("\n"),s.id)}else{c.reportIds=[...(c.reportIds||[]),id];const r=reports.find(x=>x.id===id);addInvNode("Rapport BCSO",`${r.id} — ${r.title}`,`${r.author}\n${r.summary}`,r.id)}c.updatedAt=new Date().toISOString();save(INV_STORAGE.cases,invCases);save(INV_STORAGE.suspects,invSuspects);closeModal("invPickerModal");renderInvBoard();invRenderAll()})};$("#invPickerSearch").oninput=draw;draw();openModal("invPickerModal")}
function fileToDataUrl(file){return new Promise((resolve,reject)=>{const fr=new FileReader();fr.onload=()=>resolve(fr.result);fr.onerror=reject;fr.readAsDataURL(file)})}

$("#invNewCaseBtn").onclick=()=>openInvCaseForm();$("#invCaseSearch").oninput=invRenderCases;$("#invCaseStatus").onchange=invRenderCases;$("#invCasePriority").onchange=invRenderCases;
$("#invCaseForm").onsubmit=e=>{e.preventDefault();const id=$("#invCaseId").value||invNextId("INV",invCases),old=invCases.find(x=>x.id===id),obj={id,title:$("#invCaseTitle").value.trim(),investigators:$("#invCaseInvestigators").value.trim(),status:$("#invCaseFormStatus").value,priority:$("#invCaseFormPriority").value,opened:$("#invCaseOpened").value,summary:$("#invCaseSummary").value.trim(),updatedAt:new Date().toISOString(),suspectIds:old?.suspectIds||[],reportIds:old?.reportIds||[]};const i=invCases.findIndex(x=>x.id===id);if(i>=0)invCases[i]=obj;else invCases.unshift(obj);save(INV_STORAGE.cases,invCases);closeModal("invCaseModal");invRenderAll();if(currentInvCaseId===id){$("#invBoardCaseTitle").textContent=obj.title;renderInvBoard()}};
$("#invNewSuspectBtn").onclick=()=>openInvSuspectForm();$("#invSuspectSearch").oninput=invRenderSuspects;$("#invSuspectGroupFilter").onchange=invRenderSuspects;$("#invSuspectDangerFilter").onchange=invRenderSuspects;$("#invSuspectGrouped").onchange=toggleInvGroupField;
$("#invSuspectForm").onsubmit=e=>{e.preventDefault();const id=$("#invSuspectId").value||invNextId("SUS",invSuspects),old=invSuspects.find(x=>x.id===id),obj={id,name:$("#invSuspectName").value.trim(),alias:$("#invSuspectAlias").value.trim(),danger:$("#invSuspectDanger").value,grouped:$("#invSuspectGrouped").value,group:$("#invSuspectGrouped").value==="yes"?$("#invSuspectGroup").value.trim():"",role:$("#invSuspectRole").value.trim(),vehicles:$("#invSuspectVehicles").value.trim(),notes:$("#invSuspectNotes").value.trim(),caseIds:old?.caseIds||[],createdBy:old?.createdBy||profile.name,updatedAt:new Date().toISOString()};const duplicate=invSuspects.find(s=>s.id!==id&&s.name.toLowerCase()===obj.name.toLowerCase());if(duplicate&&!confirm(`Une fiche existe déjà pour ${duplicate.name}. Créer / enregistrer quand même ?`))return;const i=invSuspects.findIndex(x=>x.id===id);if(i>=0)invSuspects[i]=obj;else invSuspects.unshift(obj);save(INV_STORAGE.suspects,invSuspects);closeModal("invSuspectModal");invRenderAll()};
$("#invBoardCaseStatus").onchange=()=>{const c=invCases.find(x=>x.id===currentInvCaseId);if(c){c.status=$("#invBoardCaseStatus").value;c.updatedAt=new Date().toISOString();save(INV_STORAGE.cases,invCases);invRenderAll()}};$("#invBoardEditCase").onclick=()=>{closeModal("invBoardModal");openInvCaseForm(currentInvCaseId)};$("#invAddSuspectToBoard").onclick=()=>openInvPicker("suspect");$("#invImportReportBtn").onclick=()=>openInvPicker("report");$("#invAddNoteBtn").onclick=()=>{const t=prompt("Titre de la note :","Note enquêteur");if(t===null)return;const body=prompt("Contenu de la note :","");if(body===null)return;addInvNode("Note",t,body)};$("#invBoardImageInput").onchange=async e=>{const f=e.target.files?.[0];if(!f)return;if(f.size>5*1024*1024){alert("Image limitée à 5 Mo.");e.target.value="";return}const data=await fileToDataUrl(f);addInvNode("Image",f.name,"",null,data);e.target.value=""};$("#invZoomIn").onclick=()=>{invZoom=Math.min(1.6,invZoom+.1);applyInvZoom()};$("#invZoomOut").onclick=()=>{invZoom=Math.max(.5,invZoom-.1);applyInvZoom()};$("#invResetView").onclick=centerInvBoard;
invRenderAll();

// ==================== SEB — SPECIAL ENFORCEMENT BUREAU ====================
const SEB_STORAGE = {
  operations: "bcso_demo_seb_operations",
  boards: "bcso_demo_seb_boards"
};
const seedSebOperations = [
  {
    id:"SEB-2026-0001", title:"Intervention — Sandy Shores", lead:"K. Belkacem",
    status:"En préparation", priority:"Élevée", date:"2026-09-12T22:00",
    objective:"Interpellation de plusieurs individus retranchés et sécurisation des lieux.",
    threats:"Présence possible d'armes longues. Nombre d'individus à confirmer.",
    teams:"Alpha — entrée principale\nBravo — couverture / seconde entrée",
    equipment:"Bouclier balistique, bélier, médical tactique.",
    instructions:"Priorité à la sécurisation des civils et à la coordination radio.",
    createdAt:"2026-09-10T02:20:00", updatedAt:"2026-09-10T02:20:00"
  }
];
let sebOperations = load(SEB_STORAGE.operations, seedSebOperations);
let sebBoards = load(SEB_STORAGE.boards, {});
let currentSebOperationId = null, sebZoom = 1, sebTool = "select", sebDraftLine = null;
save(SEB_STORAGE.operations, sebOperations); save(SEB_STORAGE.boards, sebBoards);

function sebNextId(){const y=new Date().getFullYear(),nums=sebOperations.filter(o=>o.id.startsWith(`SEB-${y}-`)).map(o=>parseInt(o.id.split("-").pop(),10)||0);return `SEB-${y}-${String(Math.max(0,...nums)+1).padStart(4,"0")}`}
function sebStatusClass(s){return s==="Prête"?"ready":s==="En cours"?"live":s==="En préparation"?"prep":s==="Annulée"?"cancel":"done"}
function sebRenderOperations(){
  const q=($("#sebOperationSearch")?.value||"").toLowerCase(), st=$("#sebOperationStatus")?.value||"", pr=$("#sebOperationPriority")?.value||"";
  const rows=sebOperations.filter(o=>(!st||o.status===st)&&(!pr||o.priority===pr)&&[o.id,o.title,o.lead,o.objective].join(" ").toLowerCase().includes(q));
  $("#sebPrepCount").textContent=sebOperations.filter(o=>o.status==="En préparation").length;
  $("#sebReadyCount").textContent=sebOperations.filter(o=>o.status==="Prête").length;
  $("#sebLiveCount").textContent=sebOperations.filter(o=>o.status==="En cours").length;
  $("#sebDoneCount").textContent=sebOperations.filter(o=>o.status==="Terminée").length;
  $("#sebOperationsList").innerHTML=rows.map(o=>`<article class="seb-operation-card ${o.priority==="Critique"?"critical":o.priority==="Élevée"?"high":""}">
    <div class="seb-operation-top"><div><div class="seb-operation-id">${escapeHtml(o.id)}</div><h3>${escapeHtml(o.title)}</h3></div><span class="seb-state ${sebStatusClass(o.status)}">${escapeHtml(o.status)}</span></div>
    <div class="seb-operation-meta"><span>Priorité : <strong>${escapeHtml(o.priority)}</strong></span><span>Lead : ${escapeHtml(o.lead)}</span>${o.date?`<span>${formatDate(o.date)}</span>`:""}</div>
    <p class="seb-operation-summary">${escapeHtml(o.objective||"Aucun objectif renseigné.")}</p>
    <div class="seb-operation-actions"><button class="primary-btn" data-seb-open="${o.id}">Ouvrir la carte</button><button class="secondary-btn" data-seb-edit="${o.id}">Modifier</button><button class="danger-outline" data-seb-delete="${o.id}">Supprimer</button></div>
  </article>`).join("")||'<div class="inv-empty">Aucune opération ne correspond aux filtres.</div>';
  $$('[data-seb-open]').forEach(b=>b.onclick=()=>openSebBoard(b.dataset.sebOpen));
  $$('[data-seb-edit]').forEach(b=>b.onclick=()=>openSebOperationForm(b.dataset.sebEdit));
  $$('[data-seb-delete]').forEach(b=>b.onclick=()=>deleteSebOperation(b.dataset.sebDelete));
}
function openSebOperationForm(id=null){
  const o=id?sebOperations.find(x=>x.id===id):null; $("#sebOperationForm").reset();
  $("#sebOperationId").value=o?.id||""; $("#sebOperationModalTitle").textContent=o?`Modifier ${o.id}`:"Nouvelle opération";
  $("#sebOperationTitle").value=o?.title||""; $("#sebOperationLead").value=o?.lead||profile.name;
  $("#sebOperationFormStatus").value=o?.status||"En préparation"; $("#sebOperationFormPriority").value=o?.priority||"Normale";
  $("#sebOperationDate").value=o?.date||""; $("#sebOperationObjective").value=o?.objective||""; $("#sebOperationThreats").value=o?.threats||"";
  $("#sebOperationTeams").value=o?.teams||""; $("#sebOperationEquipment").value=o?.equipment||""; $("#sebOperationInstructions").value=o?.instructions||"";
  openModal("sebOperationModal");
}
function deleteSebOperation(id){const o=sebOperations.find(x=>x.id===id);if(!o||!confirm(`Supprimer définitivement ${o.id} — ${o.title} ?`))return;sebOperations=sebOperations.filter(x=>x.id!==id);delete sebBoards[id];save(SEB_STORAGE.operations,sebOperations);save(SEB_STORAGE.boards,sebBoards);sebRenderOperations()}
function getSebBoard(id){if(!sebBoards[id])sebBoards[id]={background:null,markers:[],lines:[]};return sebBoards[id]}
function openSebBoard(id){
  const o=sebOperations.find(x=>x.id===id); if(!o)return; currentSebOperationId=id; sebZoom=1; sebTool="map"; sebDraftLine=null;
  $("#sebBoardOperationId").textContent=o.id; $("#sebBoardOperationTitle").textContent=o.title; $("#sebBoardOperationStatus").value=o.status;
  setSebTool("map"); renderSebBoard(); openModal("sebBoardModal"); requestAnimationFrame(centerSebBoard);
}
function sebBriefingHtml(o){const items=[["Objectif",o.objective],["Menaces",o.threats],["Escouades",o.teams],["Équipement",o.equipment],["Consignes",o.instructions]];return items.map(([k,v])=>`<div class="seb-briefing-card"><span>${k}</span><p>${escapeHtml(v||"—")}</p></div>`).join("")}
function centerSebBoard(){const stage=$("#sebMapStage");stage.style.left="0px";stage.style.top="0px";applySebZoom()}
function applySebZoom(){const stage=$("#sebMapStage");stage.style.transform=`scale(${sebZoom})`;$("#sebZoomLabel").textContent=`${Math.round(sebZoom*100)}%`}
const SEB_MARKERS={
  entry:{label:"Point d'entrée",icon:"↪",color:"#55c98f"},exit:{label:"Point de sortie",icon:"↩",color:"#67b7ff"},suspect:{label:"Position suspect",icon:"!",color:"#f05f67"},
  hostage:{label:"Otage",icon:"●",color:"#f6c64d"},rally:{label:"Rassemblement",icon:"◆",color:"#ad82ef"},vehicle:{label:"Véhicule",icon:"▣",color:"#fb9852"},
  overwatch:{label:"Overwatch",icon:"◎",color:"#59cbd4"},objective:{label:"Objectif",icon:"★",color:"#f5d65f"},squad:{label:"Escouade",icon:"A",color:"#e7edf0"},note:{label:"Note",icon:"N",color:"#c6a86d"}
};
function renderSebBoard(){
  const o=sebOperations.find(x=>x.id===currentSebOperationId);if(!o)return;const b=getSebBoard(o.id);
  $("#sebBoardOperationStatus").value=o.status; $("#sebBoardBriefing").innerHTML=sebBriefingHtml(o);
  const bg=$("#sebMapBackground"),forge=$("#sebForgeMap");
  bg.style.backgroundImage=b.background?`url("${b.background}")`:"none";
  $("#sebMapStage").classList.toggle("has-bg",!!b.background);
  if(forge) forge.classList.toggle("hidden",!!b.background); $("#sebMapWrap").classList.toggle("map-interaction",sebTool==="map"&&!b.background);
  $("#sebMapMarkers").innerHTML=(b.markers||[]).map(sebMarkerHtml).join("");
  renderSebLines(); $$('.seb-map-marker').forEach(makeSebMarkerDraggable); $$('.seb-marker-remove').forEach(btn=>btn.onclick=e=>{e.stopPropagation();const board=getSebBoard(currentSebOperationId);board.markers=board.markers.filter(m=>m.id!==btn.dataset.sebRemove);save(SEB_STORAGE.boards,sebBoards);renderSebBoard()});
}
function sebMarkerHtml(m){const def=SEB_MARKERS[m.kind]||SEB_MARKERS.note;return `<div class="seb-map-marker" data-seb-marker-id="${m.id}" style="left:${m.x}px;top:${m.y}px;--marker:${m.color||def.color}"><button class="seb-marker-remove" data-seb-remove="${m.id}">×</button><span class="seb-marker-icon">${escapeHtml(m.icon||def.icon)}</span><strong>${escapeHtml(m.label||def.label)}</strong>${m.detail?`<small>${escapeHtml(m.detail)}</small>`:""}</div>`}
function renderSebLines(preview=null){
  const b=getSebBoard(currentSebOperationId),svg=$("#sebMapLines");
  const defs=`<defs><marker id="sebArrowHead" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#ffd34d"/></marker></defs>`;
  const lines=(b.lines||[]).map(l=>{if(l.type==="route")return `<polyline class="seb-line" points="${l.points.map(p=>`${p.x},${p.y}`).join(" ")}"/>`;return `<line class="seb-line seb-line-arrow" x1="${l.x1}" y1="${l.y1}" x2="${l.x2}" y2="${l.y2}"/>`}).join("");
  const pv=preview?(preview.type==="route"?`<polyline class="seb-line-preview" points="${preview.points.map(p=>`${p.x},${p.y}`).join(" ")}"/>`:`<line class="seb-line-preview" x1="${preview.x1}" y1="${preview.y1}" x2="${preview.x2}" y2="${preview.y2}"/>`):"";
  svg.innerHTML=defs+lines+pv;
}
function addSebMarker(kind){
  const def=SEB_MARKERS[kind]||SEB_MARKERS.note; let label=def.label,detail="";
  if(kind==="squad"){label=prompt("Nom de l'escouade :","Alpha")||"Alpha";detail=prompt("Membres / mission :","")||""}
  else if(kind==="note"){label=prompt("Titre de la note :","Note")||"Note";detail=prompt("Contenu :","")||""}
  else detail=prompt(`${def.label} — précision (optionnel) :`,"")||"";
  const b=getSebBoard(currentSebOperationId),i=b.markers.length;b.markers.push({id:`seb-m-${Date.now()}-${i}`,kind,label,detail,icon:def.icon,color:def.color,x:900+(i%4)*60,y:600+(i%3)*60});save(SEB_STORAGE.boards,sebBoards);renderSebBoard();
}
function makeSebMarkerDraggable(el){
  el.onpointerdown=e=>{if(sebTool!=="select"||e.target.closest("button"))return;e.stopPropagation();const startX=e.clientX,startY=e.clientY,ox=parseFloat(el.style.left),oy=parseFloat(el.style.top);el.setPointerCapture?.(e.pointerId);const move=ev=>{el.style.left=`${Math.max(0,Math.min(1800,ox+(ev.clientX-startX)/sebZoom))}px`;el.style.top=`${Math.max(0,Math.min(1200,oy+(ev.clientY-startY)/sebZoom))}px`};const up=()=>{el.removeEventListener("pointermove",move);el.removeEventListener("pointerup",up);const m=getSebBoard(currentSebOperationId).markers.find(x=>x.id===el.dataset.sebMarkerId);if(m){m.x=parseFloat(el.style.left);m.y=parseFloat(el.style.top);save(SEB_STORAGE.boards,sebBoards)}};el.addEventListener("pointermove",move);el.addEventListener("pointerup",up)};
}
function setSebTool(tool){sebTool=tool;sebDraftLine=null;$$(`[data-seb-tool]`).forEach(b=>b.classList.toggle("active",b.dataset.sebTool===tool));$("#sebMapStage").classList.toggle("tool-line",tool==="line");$("#sebMapStage").classList.toggle("tool-route",tool==="route");$("#sebMapWrap").classList.toggle("map-interaction",tool==="map"&&!getSebBoard(currentSebOperationId).background);renderSebLines()}
function sebStagePoint(e){const stage=$("#sebMapStage"),r=stage.getBoundingClientRect();return{x:Math.max(0,Math.min(1800,(e.clientX-r.left)/sebZoom)),y:Math.max(0,Math.min(1200,(e.clientY-r.top)/sebZoom))}}
function handleSebStageClick(e){
  if(sebTool==="map")return;
  if(e.target.closest('.seb-map-marker'))return;const p=sebStagePoint(e),b=getSebBoard(currentSebOperationId);
  if(sebTool==="line"){
    if(!sebDraftLine){sebDraftLine={type:"line",x1:p.x,y1:p.y,x2:p.x,y2:p.y};renderSebLines(sebDraftLine)}else{sebDraftLine.x2=p.x;sebDraftLine.y2=p.y;b.lines.push(sebDraftLine);sebDraftLine=null;save(SEB_STORAGE.boards,sebBoards);renderSebLines()}
  } else if(sebTool==="route"){
    if(!sebDraftLine)sebDraftLine={type:"route",points:[p]}; else sebDraftLine.points.push(p); renderSebLines(sebDraftLine);
  }
}
function finishSebRoute(){if(sebTool!=="route"||!sebDraftLine||sebDraftLine.points.length<2)return;getSebBoard(currentSebOperationId).lines.push(sebDraftLine);sebDraftLine=null;save(SEB_STORAGE.boards,sebBoards);renderSebLines()}
function initSebPan(){
  const stage=$("#sebMapStage");stage.addEventListener("pointerdown",e=>{if(sebTool!=="move"||e.target.closest('.seb-map-marker'))return;e.preventDefault();const sx=e.clientX,sy=e.clientY,sl=parseFloat(stage.style.left)||0,st=parseFloat(stage.style.top)||0;stage.setPointerCapture?.(e.pointerId);const move=ev=>{stage.style.left=`${sl+(ev.clientX-sx)}px`;stage.style.top=`${st+(ev.clientY-sy)}px`};const up=()=>{stage.removeEventListener("pointermove",move);stage.removeEventListener("pointerup",up)};stage.addEventListener("pointermove",move);stage.addEventListener("pointerup",up)})
}

$("#sebNewOperationBtn").onclick=()=>openSebOperationForm(); $("#sebOperationSearch").oninput=sebRenderOperations; $("#sebOperationStatus").onchange=sebRenderOperations; $("#sebOperationPriority").onchange=sebRenderOperations;
$("#sebOperationForm").onsubmit=e=>{e.preventDefault();const id=$("#sebOperationId").value||sebNextId(),old=sebOperations.find(x=>x.id===id),obj={id,title:$("#sebOperationTitle").value.trim(),lead:$("#sebOperationLead").value.trim(),status:$("#sebOperationFormStatus").value,priority:$("#sebOperationFormPriority").value,date:$("#sebOperationDate").value,objective:$("#sebOperationObjective").value.trim(),threats:$("#sebOperationThreats").value.trim(),teams:$("#sebOperationTeams").value.trim(),equipment:$("#sebOperationEquipment").value.trim(),instructions:$("#sebOperationInstructions").value.trim(),createdAt:old?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};const i=sebOperations.findIndex(x=>x.id===id);if(i>=0)sebOperations[i]=obj;else sebOperations.unshift(obj);save(SEB_STORAGE.operations,sebOperations);closeModal("sebOperationModal");sebRenderOperations();if(currentSebOperationId===id){$("#sebBoardOperationTitle").textContent=obj.title;renderSebBoard()}};
$("#sebBoardOperationStatus").onchange=()=>{const o=sebOperations.find(x=>x.id===currentSebOperationId);if(o){o.status=$("#sebBoardOperationStatus").value;o.updatedAt=new Date().toISOString();save(SEB_STORAGE.operations,sebOperations);sebRenderOperations();renderSebBoard()}};
$("#sebBoardEditOperation").onclick=()=>{closeModal("sebBoardModal");openSebOperationForm(currentSebOperationId)};
$$('[data-seb-marker]').forEach(b=>b.onclick=()=>addSebMarker(b.dataset.sebMarker)); $("#sebAddNoteBtn").onclick=()=>addSebMarker("note");
$("#sebMapImageInput").onchange=async e=>{const f=e.target.files?.[0];if(!f)return;if(f.size>8*1024*1024){alert("Carte limitée à 8 Mo pour la démo.");e.target.value="";return}const data=await fileToDataUrl(f);getSebBoard(currentSebOperationId).background=data;save(SEB_STORAGE.boards,sebBoards);renderSebBoard();e.target.value=""};
$("#sebClearMapBtn").onclick=()=>{if(!confirm("Revenir à la carte Forge par défaut pour cette opération ?"))return;getSebBoard(currentSebOperationId).background=null;save(SEB_STORAGE.boards,sebBoards);renderSebBoard()};
$$('[data-seb-tool]').forEach(b=>b.onclick=()=>setSebTool(b.dataset.sebTool)); $("#sebMapStage").addEventListener("click",handleSebStageClick); $("#sebMapStage").addEventListener("dblclick",e=>{if(sebTool==="route"){e.preventDefault();finishSebRoute()}}); initSebPan();
$("#sebFinishRoute").onclick=finishSebRoute;
$("#sebUndoLine").onclick=()=>{const b=getSebBoard(currentSebOperationId);if(sebDraftLine){sebDraftLine=null;renderSebLines();return}b.lines.pop();save(SEB_STORAGE.boards,sebBoards);renderSebLines()};
$("#sebZoomIn").onclick=()=>{sebZoom=Math.min(1.8,sebZoom+.1);applySebZoom()}; $("#sebZoomOut").onclick=()=>{sebZoom=Math.max(.45,sebZoom-.1);applySebZoom()}; $("#sebResetView").onclick=centerSebBoard;
$("#sebClearBoardBtn").onclick=()=>{if(!confirm("Effacer tous les marqueurs et tracés de cette carte ? Le fond de carte sera conservé."))return;const b=getSebBoard(currentSebOperationId);b.markers=[];b.lines=[];sebDraftLine=null;save(SEB_STORAGE.boards,sebBoards);renderSebBoard()};
sebRenderOperations();
