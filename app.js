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
  navSections: "bcso_demo_nav_sections",
  sidebarCollapsed: "bcso_sidebar_collapsed",
  materialRequests: "bcso_demo_material_requests",
  notifications: "bcso_demo_notifications",
  convocations: "bcso_demo_convocations"
};

const defaultAvatar = createDefaultAvatar();

const defaultProfile = {
  name: "Agent BCSO",
  rank: "Non synchronisé",
  avatar: null,
  discordAvatar: null,
  discordId: null
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
const navSectionState = load(STORAGE.navSections, { bcso: true, aides: true, supervision: true, bcsa: true, investigation: true, seb: true });

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

// SIDEBAR ENTIÈREMENT REPLIABLE SUR ORDINATEUR
const sidebarCollapseBtn = $("#sidebarCollapseBtn");
const sidebarCollapsed = localStorage.getItem(STORAGE.sidebarCollapsed) === "true";

function setSidebarCollapsed(collapsed) {
  document.body.classList.toggle("sidebar-collapsed", collapsed);
  if (sidebarCollapseBtn) {
    sidebarCollapseBtn.textContent = collapsed ? "›" : "‹";
    sidebarCollapseBtn.setAttribute("aria-label", collapsed ? "Déplier le menu" : "Replier le menu");
    sidebarCollapseBtn.title = collapsed ? "Déplier le menu" : "Replier le menu";
  }
  localStorage.setItem(STORAGE.sidebarCollapsed, String(collapsed));
}

setSidebarCollapsed(sidebarCollapsed);
sidebarCollapseBtn?.addEventListener("click", () => {
  if (window.matchMedia("(max-width: 980px)").matches) return;
  setSidebarCollapsed(!document.body.classList.contains("sidebar-collapsed"));
});

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
  profile.avatar = profile.discordAvatar || null;
  $("#profilePreview").src = profile.avatar || defaultAvatar;
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
    openEquipmentCheck();
  } else {
    sessions.unshift({ start: activeService.start, end: new Date().toISOString() });
    activeService = null;
    save(STORAGE.activeService, activeService);
    save(STORAGE.serviceSessions, sessions);
    renderServices();
  }
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

const seedAgents = [];

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

function makeSeedServices(){ return []; }

const seedActiveServices = [];

let supAgents = load(SUP_STORAGE.agents, seedAgents);
let supServices = load(SUP_STORAGE.services, makeSeedServices());
let supActiveServices = load(SUP_STORAGE.active, seedActiveServices);
let supAudit = load(SUP_STORAGE.audit, []);
const SUP_AGENT_SYNC_VERSION="firebase-agents-v1";
if(localStorage.getItem("bcso_supervision_agent_sync_version")!==SUP_AGENT_SYNC_VERSION){
  supAgents=(supAgents||[]).filter(a=>!["a-191","a-143","a-205","a-172","a-216","a-224","a-118"].includes(String(a.id||"")));
  supServices=(supServices||[]).filter(s=>!String(s.id||"").startsWith("svc-demo-"));
  supActiveServices=(supActiveServices||[]).filter(s=>!String(s.id||"").startsWith("active-demo-"));
  localStorage.setItem("bcso_supervision_agent_sync_version",SUP_AGENT_SYNC_VERSION);
}
save(SUP_STORAGE.agents,supAgents); save(SUP_STORAGE.services,supServices); save(SUP_STORAGE.active,supActiveServices); save(SUP_STORAGE.audit,supAudit);

function agentById(id){ return supAgents.find(a=>a.id===id); }
function agentAvatar(agent){ return agent?.avatar || (agent?.name===profile.name ? (profile.avatar||defaultAvatar) : defaultAvatar); }
function toLocalInput(iso){ const d=new Date(iso); return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16); }
function shortClock(iso){ return new Intl.DateTimeFormat("fr-FR",{hour:"2-digit",minute:"2-digit"}).format(new Date(iso)); }
function shortDate(iso){ return new Intl.DateTimeFormat("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric"}).format(new Date(iso)); }
function hoursValue(ms){ return ms/3600000; }

function getPersonalAgent(){
  return supAgents.find(a=>a.discordId===profile.discordId) || supAgents.find(a=>a.name===profile.name) || null;
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
  renderNewAgentAlerts();
  const live=currentActiveServices();
  $("#supActiveAgents").textContent=supAgents.filter(a=>a.active).length;
  $("#supOnDutyAgents").textContent=live.length;
  $("#supInactiveAgents").textContent=supAgents.filter(a=>!a.active).length;
  $("#supDivisions").textContent=new Set(supAgents.filter(a=>a.active).map(a=>a.division)).size;
  const q=($("#agentSearch").value||"").toLowerCase(); const rank=$("#agentRankFilter").value,div=$("#agentDivisionFilter").value,st=$("#agentStatusFilter").value;
  const range=periodRange("week");
  const rows=supAgents.filter(a=>{
    const isOn=live.some(s=>s.agentId===a.id); const status=!a.active?"Inactif":isOn?"En service":"Hors service";
    return (!rank||a.rank===rank)&&(!div||a.division===div)&&(!st||status===st)&&[a.badge,a.name,a.rank,a.division,(a.specialties||[]).join(" ")].join(" ").toLowerCase().includes(q);
  });
  $("#agentsTable").innerHTML=`<table class="agents-table"><thead><tr><th>Agent</th><th>Grade</th><th>Division</th><th>Statut</th><th>Cette semaine</th><th>Ce mois</th><th>Actions</th></tr></thead><tbody>${rows.map(a=>{
    const isOn=live.some(s=>s.agentId===a.id); const status=!a.active?"Inactif":isOn?"En service":"Hors service"; const cls=!a.active?"inactive":isOn?"on":"off";
    return `<tr><td><div class="agent-identity"><img class="agent-mini-avatar" src="${agentAvatar(a)}" alt=""><div><div class="agent-name-line">${escapeHtml(a.name)}</div><span class="agent-badge">${a.badge?`#${escapeHtml(a.badge)}`:'<span class="badge warn">À attribuer</span>'}</span></div></div></td><td>${escapeHtml(a.rank)}</td><td>${escapeHtml(a.division)}</td><td><span class="status-inline ${cls}">${status}</span></td><td>${formatShortDuration(agentPeriodMs(a.id,range))}</td><td>${formatShortDuration(agentMonthMs(a.id))}</td><td><div class="table-actions"><button class="secondary-btn" data-agent-profile="${a.id}">Voir le profil</button>${a.active?`<button class="danger-outline" data-agent-toggle="${a.id}">Désactiver</button>`:`<button class="secondary-btn" data-agent-toggle="${a.id}">Réactiver</button>`}</div></td></tr>`;
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
  $("#agentModalTitle").textContent=`${a.badge?`#${a.badge} ・ `:""}${a.name}`;
  $("#agentProfileContent").innerHTML=`
    <div class="agent-profile-head"><img src="${agentAvatar(a)}" alt=""><div><h3>${escapeHtml(a.name)}</h3><div class="meta-row"><span>${escapeHtml(a.rank)}</span><span>${escapeHtml(a.division)}</span><span class="badge ${a.active?'green':'red'}">${a.active?'Actif':'Inactif'}</span>${a.onboardingState==="new"?'<span class="badge warn">Nouvelle connexion</span>':''}</div></div><div class="table-actions">${a.onboardingState==="new"?`<button class="secondary-btn" data-agent-ack="${a.id}">✓ Marquer comme vu</button>`:""}<button class="primary-btn agent-convocation-btn" data-convoke-agent="${a.id}">📨 Convoquer</button></div></div>
    <div class="profile-tabs"><button class="profile-tab ${tab==='info'?'active':''}" data-profile-tab="info">Informations</button><button class="profile-tab ${tab==='services'?'active':''}" data-profile-tab="services">Services</button><button class="profile-tab ${tab==='reports'?'active':''}" data-profile-tab="reports">Rapports</button><button class="profile-tab ${tab==='complaints'?'active':''}" data-profile-tab="complaints">Plaintes</button><button class="profile-tab ${tab==='convocations'?'active':''}" data-profile-tab="convocations">Convocations</button><button class="profile-tab ${tab==='access'?'active':''}" data-profile-tab="access">Accès</button></div>
    <div class="profile-panel ${tab==='info'?'active':''}" data-profile-panel="info"><div class="info-grid"><div class="info-box"><span>Matricule</span><strong>${a.badge?`#${escapeHtml(a.badge)}`:"À attribuer"}</strong><small class="agent-lock-note">${a.badgeLocked?"🔒 Verrouillé — non modifiable par l’agent":"En attente d’attribution"}</small></div><div class="info-box"><span>Grade</span><strong>${escapeHtml(a.rank)}</strong></div><div class="info-box"><span>Division</span><strong>${escapeHtml(a.division)}</strong></div><div class="info-box"><span>Date d'intégration</span><strong>${a.joined?shortDate(a.joined+'T12:00:00'):'—'}</strong></div><div class="info-box"><span>Spécialisations</span><strong>${escapeHtml((a.specialties||[]).join(', ')||'Aucune')}</strong></div><div class="info-box"><span>Statut</span><strong>${a.active?'Actif':'Inactif'}</strong></div></div></div>
    <div class="profile-panel ${tab==='services'?'active':''}" data-profile-panel="services"><div class="supervision-summary"><article class="stat-card"><span>Cette semaine</span><strong>${formatShortDuration(agentPeriodMs(id,range))}</strong><small>temps cumulé</small></article><article class="stat-card"><span>Ce mois</span><strong>${formatShortDuration(agentMonthMs(id))}</strong><small>temps cumulé</small></article><article class="stat-card"><span>Services</span><strong>${agentServices.length}</strong><small>enregistrés</small></article><article class="stat-card"><span>Moyenne</span><strong>${formatShortDuration(agentServices.length?agentServices.reduce((t,s)=>t+(new Date(s.end)-new Date(s.start)),0)/agentServices.length:0)}</strong><small>par service</small></article></div><div class="history-service-list">${agentServices.slice(0,8).map(s=>`<div class="history-service-row"><span><strong>Début</strong><br>${formatDate(s.start)}</span><span><strong>Fin</strong><br>${formatDate(s.end)}</span><span>${formatDuration(new Date(s.end)-new Date(s.start))}</span><div class="table-actions"><button class="secondary-btn" data-edit-service="${s.id}">Modifier</button></div></div>`).join('')||'<div class="empty-state">Aucun service.</div>'}</div></div>
    <div class="profile-panel ${tab==='reports'?'active':''}" data-profile-panel="reports">${agentReports.length?agentReports.slice(0,10).map(reportCard).join(''):'<div class="empty-state">Aucun rapport rédigé.</div>'}</div>
    <div class="profile-panel ${tab==='complaints'?'active':''}" data-profile-panel="complaints">${agentComplaints.length?agentComplaints.map(c=>`<div class="record-card"><span class="badge gold">${escapeHtml(c.id)}</span><h3>${escapeHtml(c.subject)}</h3><div class="meta-row"><span>${escapeHtml(c.status)}</span><span>${escapeHtml(c.assignedTo||'Non assigné')}</span></div></div>`).join(''):'<div class="empty-state">Aucune plainte liée à cet agent.</div>'}</div>
    <div class="profile-panel ${tab==='convocations'?'active':''}" data-profile-panel="convocations">${renderAgentConvocations(id)}</div>
    <div class="profile-panel ${tab==='access'?'active':''}" data-profile-panel="access"><p class="muted small">Dans la version finale, ces accès seront calculés depuis les rôles Discord et ne seront pas modifiables ici.</p><div class="access-list">${(a.roles||[]).map(r=>`<div class="access-item"><span>${escapeHtml(r)}</span><strong class="access-ok">✓ Autorisé</strong></div>`).join('')}</div></div>`;
  $$('[data-profile-tab]').forEach(b=>b.onclick=()=>openAgentProfile(id,b.dataset.profileTab));
  $$('[data-edit-service]').forEach(b=>b.onclick=()=>openEditService(b.dataset.editService));
  $$('[data-agent-ack]').forEach(b=>b.onclick=()=>window.dispatchEvent(new CustomEvent("bcso:ack-agent",{detail:{id:b.dataset.agentAck}})));
  $$('[data-convoke-agent]').forEach(b=>b.onclick=()=>{ closeModal("agentModal"); openConvocationForm(b.dataset.convokeAgent); });
  bindReportViewers();
  openModal("agentModal");
}

// Les agents sont désormais créés automatiquement lors de leur première connexion Discord/Firebase.



function renderNewAgentAlerts(){
  const host=$("#newAgentAlerts"); if(!host)return;
  const pending=supAgents.filter(a=>a.onboardingState==="new");
  host.innerHTML=pending.length?`<div class="new-agent-alert-box">
    <div><strong>🔔 ${pending.length} nouvel${pending.length>1?"s":""} agent${pending.length>1?"s":""} connecté${pending.length>1?"s":""}</strong>
    <span>Fiche créée automatiquement à la première connexion au portail.</span></div>
    <div class="new-agent-alert-list">${pending.map(a=>`<button class="secondary-btn" data-new-agent-open="${a.id}">${a.badge?`#${escapeHtml(a.badge)} ・ `:""}${escapeHtml(a.name)}</button>`).join("")}</div>
  </div>`:"";
  $$("[data-new-agent-open]").forEach(b=>b.onclick=()=>openAgentProfile(b.dataset.newAgentOpen));
}
window.addEventListener("bcso:firebase-agents",e=>{
  const rows=Array.isArray(e.detail)?e.detail:[];
  supAgents=rows.map(a=>({
    id:a.id,discordId:a.discordId||null,badge:a.badge||"",badgeLocked:Boolean(a.badgeLocked),
    name:a.displayName||a.name||a.username||"Agent BCSO",rank:a.gradeLabel||a.rank||"Non classé",
    division:(a.divisions&&a.divisions.length)?a.divisions.map(d=>({bcsa:"BCSA",investigation:"Investigation Division",seb:"SEB",park_ranger:"Park Ranger",highway_patrol:"Highway Patrol"}[d]||d)).join(", "):"Patrol",
    specialties:(a.divisions||[]).map(d=>({bcsa:"BCSA",investigation:"Investigation Division",seb:"SEB",park_ranger:"Park Ranger",highway_patrol:"Highway Patrol"}[d]||d)),
    joined:(a.firstLoginAt||a.createdAt||"").slice?.(0,10)||"",active:a.active!==false,avatar:a.avatarUrl||null,
    roles:a.portalRoles||["BCSO"],onboardingState:a.onboardingState||"active",firstLoginAt:a.firstLoginAt||null,lastLoginAt:a.lastLoginAt||null
  }));
  save(SUP_STORAGE.agents,supAgents);renderSupervision();renderNewAgentAlerts();
});
window.addEventListener("bcso:agent-acknowledged",e=>{
  const a=agentById(e.detail?.id);if(a)a.onboardingState="active";
  save(SUP_STORAGE.agents,supAgents);renderNewAgentAlerts();renderAgentManagement();
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
  old?Object.assign(old,item):events.push(item); save(STORAGE.events,events);
  createPortalNotification({type:"event",title:old?`Événement modifié — ${item.title}`:`Nouvel événement — ${item.title}`,message:`${formatDate(item.date)} • ${item.place}`,target:"all",linkView:"agenda",discord:true,entityId:item.id});
  closeModal("eventManageModal"); renderEvents(); renderAgendaManagement();
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
const INV_STORAGE={
  cases:"bcso_demo_inv_cases",
  suspects:"bcso_demo_inv_suspects",
  witnesses:"bcso_demo_inv_witnesses",
  boards:"bcso_demo_inv_boards"
};
const seedInvCases=[
  {id:"INV-2026-0001",title:"Trafic d’armes — Sandy Shores",status:"En cours",priority:"Élevée",investigators:"K. Belkacem, J. Carter",opened:"2026-09-08",summary:"Enquête portant sur plusieurs transactions suspectes et un possible réseau de revente d’armes.",updatedAt:"2026-09-10T01:42:00",suspectIds:["SUS-2026-0001"],witnessIds:[],reportIds:["R-2026-0004"]},
  {id:"INV-2026-0002",title:"Série de vols — Grapeseed",status:"Ouvert",priority:"Normale",investigators:"M. Owens",opened:"2026-09-09",summary:"Rapprochement de plusieurs faits similaires signalés dans le secteur de Grapeseed.",updatedAt:"2026-09-09T23:10:00",suspectIds:[],witnessIds:[],reportIds:["R-2026-0003"]}
];
const seedInvSuspects=[
  {id:"SUS-2026-0001",lastName:"William",firstName:"John",name:"John William",alias:"JW",danger:"Élevée",group:"Red Vultures",role:"Intermédiaire présumé",vehicles:"Sultan noir — plaque inconnue",notes:"Suspect relié à plusieurs contacts identifiés dans le dossier armes.",photo:null,caseIds:["INV-2026-0001"],createdBy:"K. Belkacem",updatedAt:"2026-09-10T01:30:00"},
  {id:"SUS-2026-0002",lastName:"Carter",firstName:"Michael",name:"Michael Carter",alias:"",danger:"Moyenne",group:"",role:"",vehicles:"Baller gris — 6ABC219",notes:"À vérifier. Présence récurrente sur plusieurs scènes.",photo:null,caseIds:[],createdBy:"J. Carter",updatedAt:"2026-09-09T20:05:00"}
];
const seedInvWitnesses=[];
let invCases=load(INV_STORAGE.cases,seedInvCases),
    invSuspects=load(INV_STORAGE.suspects,seedInvSuspects),
    invWitnesses=load(INV_STORAGE.witnesses,seedInvWitnesses),
    invBoards=load(INV_STORAGE.boards,{});
let currentInvCaseId=null,invZoom=1,invLinkMode=false,invLinkStartId=null,invPendingImageQueue=[];

function normalizeInvData(){
  invCases.forEach(c=>{c.suspectIds=c.suspectIds||[];c.witnessIds=c.witnessIds||[];c.reportIds=c.reportIds||[]});
  invSuspects.forEach(s=>{
    if(!s.firstName&&!s.lastName&&s.name){
      const p=s.name.trim().split(/\s+/);s.firstName=p.shift()||"";s.lastName=p.join(" ")||"";
    }
    s.name=[s.firstName,s.lastName].filter(Boolean).join(" ")||s.name||"Inconnu";
    s.group=s.group||"";s.photo=s.photo||null;s.caseIds=s.caseIds||[];
  });
  Object.values(invBoards).forEach(b=>{b.nodes=b.nodes||[];b.links=b.links||[]});
}
normalizeInvData();
save(INV_STORAGE.cases,invCases);save(INV_STORAGE.suspects,invSuspects);save(INV_STORAGE.witnesses,invWitnesses);save(INV_STORAGE.boards,invBoards);

function invNextId(prefix,items){const y=new Date().getFullYear(),nums=items.filter(x=>x.id.startsWith(`${prefix}-${y}-`)).map(x=>parseInt(x.id.split("-").pop(),10)||0);return `${prefix}-${y}-${String((Math.max(0,...nums)+1)).padStart(4,"0")}`}
function invStatusClass(s){return s==="Classé"?"good":s==="En attente"?"warn":s==="Transmis"?"warn":""}
function invPriorityClass(p){return p==="Critique"?"bad":p==="Élevée"?"warn":""}
function invPersonName(p){return [p.firstName,p.lastName].filter(Boolean).join(" ")||p.name||"Inconnu"}

function invRenderCases(){
  const q=($("#invCaseSearch")?.value||"").toLowerCase(),st=$("#invCaseStatus")?.value||"",pr=$("#invCasePriority")?.value||"";
  const rows=invCases.filter(c=>(!st||c.status===st)&&(!pr||c.priority===pr)&&[c.id,c.title,c.investigators,c.summary].join(" ").toLowerCase().includes(q));
  $("#invActiveCount").textContent=invCases.filter(c=>c.status!=="Classé").length;
  $("#invHighCount").textContent=invCases.filter(c=>["Élevée","Critique"].includes(c.priority)&&c.status!=="Classé").length;
  $("#invClosedCount").textContent=invCases.filter(c=>c.status==="Classé").length;
  $("#invLinkedSuspects").textContent=new Set(invCases.flatMap(c=>c.suspectIds||[])).size;
  $("#invCasesList").innerHTML=rows.map(c=>`<article class="inv-case-card ${c.priority==="Critique"?"priority-critical":c.priority==="Élevée"?"priority-high":""}">
    <div class="inv-case-top"><div><div class="inv-id">${escapeHtml(c.id)}</div><h3>${escapeHtml(c.title)}</h3></div><span class="inv-tag ${invStatusClass(c.status)}">${escapeHtml(c.status)}</span></div>
    <div class="inv-meta"><span>Priorité : <strong>${escapeHtml(c.priority)}</strong></span><span>Ouvert le ${escapeHtml(c.opened.split("-").reverse().join("/"))}</span><span>${(c.suspectIds||[]).length} suspect(s)</span><span>${(c.witnessIds||[]).length} témoin(s)</span><span>${(c.reportIds||[]).length} rapport(s)</span></div>
    <div class="inv-meta">Enquêteur(s) : ${escapeHtml(c.investigators)}</div><p class="inv-summary">${escapeHtml(c.summary||"Aucun résumé.")}</p>
    <div class="inv-actions"><button class="primary-btn" data-inv-open="${c.id}">Ouvrir</button><button class="secondary-btn" data-inv-edit="${c.id}">Modifier</button><button class="danger-outline" data-inv-delete="${c.id}">Supprimer</button></div>
  </article>`).join("")||'<div class="inv-empty">Aucun dossier ne correspond aux filtres.</div>';
  $$('[data-inv-open]').forEach(b=>b.onclick=()=>openInvBoard(b.dataset.invOpen));
  $$('[data-inv-edit]').forEach(b=>b.onclick=()=>openInvCaseForm(b.dataset.invEdit));
  $$('[data-inv-delete]').forEach(b=>b.onclick=()=>deleteInvCase(b.dataset.invDelete));
}
function openInvCaseForm(id=null){
  const c=id?invCases.find(x=>x.id===id):null;$("#invCaseForm").reset();$("#invCaseId").value=c?.id||"";
  $("#invCaseModalTitle").textContent=c?`Modifier ${c.id}`:"Nouveau dossier";$("#invCaseTitle").value=c?.title||"";
  $("#invCaseInvestigators").value=c?.investigators||profile.name;$("#invCaseFormStatus").value=c?.status||"Ouvert";
  $("#invCaseFormPriority").value=c?.priority||"Normale";$("#invCaseOpened").value=c?.opened||new Date().toISOString().slice(0,10);$("#invCaseSummary").value=c?.summary||"";openModal("invCaseModal")
}
function deleteInvCase(id){
  const c=invCases.find(x=>x.id===id);if(!c||!confirm(`Supprimer définitivement ${c.id} — ${c.title} ?`))return;
  invCases=invCases.filter(x=>x.id!==id);invSuspects.forEach(s=>s.caseIds=(s.caseIds||[]).filter(x=>x!==id));invWitnesses.forEach(w=>w.caseIds=(w.caseIds||[]).filter(x=>x!==id));
  delete invBoards[id];save(INV_STORAGE.cases,invCases);save(INV_STORAGE.suspects,invSuspects);save(INV_STORAGE.witnesses,invWitnesses);save(INV_STORAGE.boards,invBoards);invRenderAll()
}

function invRenderSuspects(){
  const q=($("#invSuspectSearch")?.value||"").toLowerCase(),gf=$("#invSuspectGroupFilter")?.value||"",df=$("#invSuspectDangerFilter")?.value||"";
  const rows=invSuspects.filter(s=>(!gf||(gf==="yes"?!!s.group:!s.group))&&(!df||s.danger===df)&&[invPersonName(s),s.alias,s.group,s.role,s.vehicles,s.notes].join(" ").toLowerCase().includes(q));
  $("#invSuspectCount").textContent=invSuspects.length;$("#invGroupCount").textContent=invSuspects.filter(s=>s.group).length;$("#invDangerCount").textContent=invSuspects.filter(s=>["Élevée","Critique"].includes(s.danger)).length;
  $("#invUniqueGroups").textContent=new Set(invSuspects.filter(s=>s.group).map(s=>s.group.trim().toLowerCase())).size;
  $("#invSuspectsList").innerHTML=rows.map(s=>`<article class="inv-suspect-card">
    <div class="inv-suspect-top"><div>${s.photo?`<img class="inv-person-thumb" src="${s.photo}" alt="">`:""}<div class="inv-id">${escapeHtml(s.id)}</div><h3>${escapeHtml(invPersonName(s))}</h3>${s.alias?`<span class="muted">Alias : ${escapeHtml(s.alias)}</span>`:""}</div><span class="inv-tag ${invPriorityClass(s.danger)}">${escapeHtml(s.danger)}</span></div>
    <div class="inv-meta">${s.group?`<span>Appartenance : <strong>${escapeHtml(s.group)}</strong></span>`:'<span>Appartenance : <strong>Non renseignée</strong></span>'}<span>${(s.caseIds||[]).length} dossier(s)</span></div>
    ${s.role?`<div class="inv-meta">Rôle supposé : ${escapeHtml(s.role)}</div>`:""}${s.vehicles?`<div class="inv-meta">Véhicules : ${escapeHtml(s.vehicles)}</div>`:""}
    <p class="inv-summary">${escapeHtml(s.notes||"Aucun commentaire.")}</p><div class="inv-actions"><button class="secondary-btn" data-inv-suspect-edit="${s.id}">Modifier</button><button class="danger-outline" data-inv-suspect-delete="${s.id}">Supprimer</button></div>
  </article>`).join("")||'<div class="inv-empty">Aucune fiche suspect trouvée.</div>';
  $$('[data-inv-suspect-edit]').forEach(b=>b.onclick=()=>openInvSuspectForm(b.dataset.invSuspectEdit));
  $$('[data-inv-suspect-delete]').forEach(b=>b.onclick=()=>deleteInvSuspect(b.dataset.invSuspectDelete));
}
function openInvSuspectForm(id=null){
  const s=id?invSuspects.find(x=>x.id===id):null;$("#invSuspectForm").reset();$("#invSuspectId").value=s?.id||"";
  $("#invSuspectModalTitle").textContent=s?`Modifier ${s.id}`:"Nouvelle fiche suspect";
  $("#invSuspectLastName").value=s?.lastName||"";$("#invSuspectFirstName").value=s?.firstName||"";$("#invSuspectAlias").value=s?.alias||"";
  $("#invSuspectDanger").value=s?.danger||"Faible";$("#invSuspectGroup").value=s?.group||"";$("#invSuspectRole").value=s?.role||"";$("#invSuspectVehicles").value=s?.vehicles||"";$("#invSuspectNotes").value=s?.notes||"";
  $("#invSuspectPhoto").value="";$("#invSuspectPhoto").dataset.current=s?.photo||"";renderPersonPhotoPreview("#invSuspectPhotoPreview",s?.photo);openModal("invSuspectModal")
}
function deleteInvSuspect(id){
  const s=invSuspects.find(x=>x.id===id);if(!s||!confirm(`Supprimer la fiche ${invPersonName(s)} ?`))return;
  invSuspects=invSuspects.filter(x=>x.id!==id);invCases.forEach(c=>c.suspectIds=(c.suspectIds||[]).filter(x=>x!==id));
  Object.values(invBoards).forEach(b=>{b.nodes=(b.nodes||[]).filter(n=>!(n.kind==="Suspect"&&n.refId===id));cleanInvLinks(b)});
  save(INV_STORAGE.suspects,invSuspects);save(INV_STORAGE.cases,invCases);save(INV_STORAGE.boards,invBoards);invRenderAll()
}
function renderPersonPhotoPreview(sel,data){const el=$(sel);if(!el)return;el.innerHTML=data?`<img src="${data}" alt="Aperçu"><span>Photo enregistrée</span>`:'<span class="muted">Aucune photo enregistrée.</span>'}

function invRenderAll(){invRenderCases();invRenderSuspects();if(currentInvCaseId)renderInvBoard()}

// ---------- Investigation board ----------
function getInvBoard(caseId){if(!invBoards[caseId])invBoards[caseId]={nodes:[],links:[]};invBoards[caseId].nodes=invBoards[caseId].nodes||[];invBoards[caseId].links=invBoards[caseId].links||[];return invBoards[caseId]}
function cleanInvLinks(board){const ids=new Set((board.nodes||[]).map(n=>n.id));board.links=(board.links||[]).filter(l=>ids.has(l.from)&&ids.has(l.to))}
function openInvBoard(id){
  const c=invCases.find(x=>x.id===id);if(!c)return;currentInvCaseId=id;invLinkMode=false;invLinkStartId=null;syncInvLinkUI();
  $("#invBoardCaseId").textContent=c.id;$("#invBoardCaseTitle").textContent=c.title;$("#invBoardCaseStatus").value=c.status;invZoom=1;renderInvBoard();openModal("invBoardModal");requestAnimationFrame(()=>centerInvBoard())
}
function centerInvBoard(){const stage=$("#invBoardStage"),wrap=stage.parentElement;stage.style.left=`${Math.max(20,(wrap.clientWidth-2200*invZoom)/2)}px`;stage.style.top=`${Math.max(20,(wrap.clientHeight-1500*invZoom)/2)}px`;applyInvZoom()}
function applyInvZoom(){const stage=$("#invBoardStage");stage.style.transform=`scale(${invZoom})`;$("#invZoomLabel").textContent=`${Math.round(invZoom*100)}%`}
function renderInvBoard(){
  const c=invCases.find(x=>x.id===currentInvCaseId);if(!c)return;const b=getInvBoard(c.id);cleanInvLinks(b);
  $("#invBoardCaseStatus").value=c.status;
  $("#invBoardSuspects").innerHTML=(c.suspectIds||[]).map(id=>invSuspects.find(s=>s.id===id)).filter(Boolean).map(s=>`<div class="inv-linked-item">${s.photo?`<img class="inv-linked-avatar" src="${s.photo}" alt="">`:""}${escapeHtml(invPersonName(s))}${s.group?`<br><small>${escapeHtml(s.group)}</small>`:""}</div>`).join("")||'<span class="muted small">Aucun suspect lié.</span>';
  $("#invBoardWitnesses").innerHTML=(c.witnessIds||[]).map(id=>invWitnesses.find(w=>w.id===id)).filter(Boolean).map(w=>`<div class="inv-linked-item">${w.photo?`<img class="inv-linked-avatar" src="${w.photo}" alt="">`:""}${escapeHtml(invPersonName(w))}<br><small>${escapeHtml(w.type||"Témoin")}</small></div>`).join("")||'<span class="muted small">Aucun témoin lié.</span>';
  $("#invBoardReports").innerHTML=(c.reportIds||[]).map(id=>reports.find(r=>r.id===id)).filter(Boolean).map(r=>`<div class="inv-linked-item">${escapeHtml(r.id)}<br><small>${escapeHtml(r.title)}</small></div>`).join("")||'<span class="muted small">Aucun rapport importé.</span>';
  $("#invBoardNodes").innerHTML=(b.nodes||[]).map(n=>invNodeHtml(n)).join("");
  renderInvLinks();
  $$('.inv-board-node').forEach(el=>{makeInvNodeDraggable(el);el.onclick=e=>handleInvNodeLinkClick(e,el)});
  $$('.node-remove').forEach(btn=>btn.onclick=e=>{e.stopPropagation();const board=getInvBoard(currentInvCaseId);board.nodes=board.nodes.filter(n=>n.id!==btn.dataset.nodeRemove);cleanInvLinks(board);save(INV_STORAGE.boards,invBoards);renderInvBoard()});
  syncInvLinkUI()
}
function sanitizeRichHtml(input){
  const doc=new DOMParser().parseFromString(`<div>${input||""}</div>`,"text/html"),root=doc.body.firstElementChild;
  const allowed=new Set(["P","DIV","BR","B","STRONG","I","EM","U","H2","H3","UL","OL","LI","SPAN","FONT"]);
  [...root.querySelectorAll("*")].forEach(el=>{
    if(!allowed.has(el.tagName)){el.replaceWith(...el.childNodes);return}
    [...el.attributes].forEach(a=>{
      const n=a.name.toLowerCase();
      if(n==="style"){
        const ok=(a.value.match(/(?:color|text-align)\s*:\s*[^;]+/gi)||[]).join("; ");
        if(ok)el.setAttribute("style",ok);else el.removeAttribute("style");
      }else if(el.tagName==="FONT"&&n==="color"){
      }else el.removeAttribute(a.name);
    });
  });
  return root.innerHTML;
}
function invNodeHtml(n){
  const title=n.title||"Élément",img=n.image?`<img src="${n.image}" alt="Image dossier">`:"";
  const rich=n.richHtml?`<div class="inv-node-rich">${sanitizeRichHtml(n.richHtml)}</div>`:`<p>${escapeHtml(n.body||"")}</p>`;
  const cls=`inv-board-node kind-${String(n.kind||"").toLowerCase().replace(/[^a-z0-9]+/g,"-")} ${invLinkStartId===n.id?"link-selected":""}`;
  return `<div class="${cls}" data-node-id="${n.id}" style="left:${n.x}px;top:${n.y}px"><button class="node-remove" data-node-remove="${n.id}">×</button><span class="node-type">${escapeHtml(n.kind)}</span><h4>${escapeHtml(title)}</h4>${rich}${img}</div>`
}
function makeInvNodeDraggable(el){
  let startX,startY,origX,origY,moved=false;
  const down=e=>{
    if(e.target.closest('button')||invLinkMode)return;moved=false;startX=e.clientX;startY=e.clientY;origX=parseFloat(el.style.left)||0;origY=parseFloat(el.style.top)||0;
    el.setPointerCapture?.(e.pointerId);
    const move=ev=>{moved=true;const dx=(ev.clientX-startX)/invZoom,dy=(ev.clientY-startY)/invZoom;el.style.left=`${Math.max(0,origX+dx)}px`;el.style.top=`${Math.max(0,origY+dy)}px`;renderInvLinks()};
    const up=()=>{el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);if(moved){const n=getInvBoard(currentInvCaseId).nodes.find(x=>x.id===el.dataset.nodeId);if(n){n.x=parseFloat(el.style.left);n.y=parseFloat(el.style.top);save(INV_STORAGE.boards,invBoards);renderInvLinks()}}};
    el.addEventListener('pointermove',move);el.addEventListener('pointerup',up)
  };el.addEventListener('pointerdown',down)
}
function addInvNode(kind,title,body="",refId=null,image=null,richHtml=null){
  const b=getInvBoard(currentInvCaseId),i=b.nodes.length;
  b.nodes.push({id:`node-${Date.now()}-${i}`,kind,title,body,refId,image,richHtml,x:380+(i%4)*270,y:170+Math.floor(i/4)*200});
  save(INV_STORAGE.boards,invBoards);renderInvBoard()
}
function renderInvLinks(){
  const svg=$("#invBoardLinks"),b=getInvBoard(currentInvCaseId);if(!svg||!b)return;
  const nodeMap=new Map((b.nodes||[]).map(n=>[n.id,n]));
  svg.innerHTML=(b.links||[]).map((l,i)=>{
    const a=nodeMap.get(l.from),d=nodeMap.get(l.to);if(!a||!d)return"";
    const x1=a.x+120,y1=a.y+70,x2=d.x+120,y2=d.y+70;
    return `<line class="inv-link-line" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><circle class="inv-link-dot" cx="${x1}" cy="${y1}" r="4"/><circle class="inv-link-dot" cx="${x2}" cy="${y2}" r="4"/>`
  }).join("")
}
function syncInvLinkUI(){
  $("#invLinkElementsBtn").hidden=invLinkMode;$("#invCancelLinkBtn").hidden=!invLinkMode;$("#invLinkHint").hidden=!invLinkMode;
  if(invLinkMode)$("#invLinkHint").textContent=invLinkStartId?"Premier élément sélectionné. Cliquez sur le second.":"Sélectionnez le premier élément, puis le second.";
  $$(".inv-board-node").forEach(el=>el.classList.toggle("link-selected",el.dataset.nodeId===invLinkStartId))
}
function handleInvNodeLinkClick(e,el){
  if(!invLinkMode||e.target.closest("button"))return;e.preventDefault();e.stopPropagation();const id=el.dataset.nodeId;
  if(!invLinkStartId){invLinkStartId=id;syncInvLinkUI();return}
  if(invLinkStartId===id){invLinkStartId=null;syncInvLinkUI();return}
  const b=getInvBoard(currentInvCaseId),exists=(b.links||[]).some(l=>(l.from===invLinkStartId&&l.to===id)||(l.to===invLinkStartId&&l.from===id));
  if(!exists)b.links.push({id:`link-${Date.now()}`,from:invLinkStartId,to:id});
  invLinkStartId=null;save(INV_STORAGE.boards,invBoards);renderInvBoard()
}
function openInvPicker(mode){
  const c=invCases.find(x=>x.id===currentInvCaseId);if(!c)return;$("#invPickerSearch").value="";
  $("#invPickerTitle").textContent=mode==="suspect"?"Ajouter un suspect au dossier":"Ajouter un rapport enregistré sur le site";
  const draw=()=>{
    const q=$("#invPickerSearch").value.toLowerCase();let items;
    if(mode==="suspect")items=invSuspects.filter(s=>!(c.suspectIds||[]).includes(s.id)&&[invPersonName(s),s.alias,s.group].join(" ").toLowerCase().includes(q));
    else items=reports.filter(r=>!(c.reportIds||[]).includes(r.id)&&[r.id,r.title,r.author,r.summary].join(" ").toLowerCase().includes(q));
    $("#invPickerList").innerHTML=items.map(x=>`<div class="inv-picker-item"><div><strong>${escapeHtml(mode==="suspect"?invPersonName(x):`${x.id} — ${x.title}`)}</strong><small>${escapeHtml(mode==="suspect"?(x.group?`Appartenance : ${x.group}`:`Dangerosité : ${x.danger}`):`${x.author} • ${formatDate(x.date)}`)}</small></div><button class="primary-btn" data-inv-pick="${x.id}">Ajouter</button></div>`).join("")||'<div class="empty-state">Aucun élément disponible.</div>';
    $$('[data-inv-pick]').forEach(btn=>btn.onclick=()=>{
      const id=btn.dataset.invPick;
      if(mode==="suspect"){
        c.suspectIds=[...(c.suspectIds||[]),id];const s=invSuspects.find(x=>x.id===id);s.caseIds=[...new Set([...(s.caseIds||[]),c.id])];
        addInvNode("Suspect",invPersonName(s),[s.alias?`Alias : ${s.alias}`:"",s.group?`Appartenance : ${s.group}`:"",`Dangerosité : ${s.danger}`,s.notes||""].filter(Boolean).join("\n"),s.id,s.photo||null)
      }else{
        c.reportIds=[...(c.reportIds||[]),id];const r=reports.find(x=>x.id===id);addInvNode("Rapport BCSO",`${r.id} — ${r.title}`,`${r.author}\n${r.summary}`,r.id)
      }
      c.updatedAt=new Date().toISOString();save(INV_STORAGE.cases,invCases);save(INV_STORAGE.suspects,invSuspects);closeModal("invPickerModal");renderInvBoard();invRenderAll()
    })
  };$("#invPickerSearch").oninput=draw;draw();openModal("invPickerModal")
}
function fileToDataUrl(file){return new Promise((resolve,reject)=>{const fr=new FileReader();fr.onload=()=>resolve(fr.result);fr.onerror=reject;fr.readAsDataURL(file)})}

async function compressInvImage(file,maxW=1400,quality=.82){
  const data=await fileToDataUrl(file);const img=new Image();
  await new Promise((res,rej)=>{img.onload=res;img.onerror=rej;img.src=data});
  const scale=Math.min(1,maxW/img.width),w=Math.round(img.width*scale),h=Math.round(img.height*scale);
  const c=document.createElement("canvas");c.width=w;c.height=h;c.getContext("2d").drawImage(img,0,0,w,h);
  return c.toDataURL("image/webp",quality)
}
function setupRichToolbar(toolbar){
  if(!toolbar)return;const editor=$("#"+toolbar.dataset.editorToolbar);
  toolbar.querySelectorAll("[data-rich-cmd]").forEach(b=>b.onclick=()=>{editor.focus();document.execCommand(b.dataset.richCmd,false,null)});
  toolbar.querySelector("[data-rich-block]")?.addEventListener("change",e=>{editor.focus();document.execCommand("formatBlock",false,e.target.value)});
  toolbar.querySelector("[data-rich-color]")?.addEventListener("input",e=>{editor.focus();document.execCommand("foreColor",false,e.target.value)})
}
$$("[data-editor-toolbar]").forEach(setupRichToolbar);

// ---------- Investigation events ----------
$("#invNewCaseBtn").onclick=()=>openInvCaseForm();$("#invCaseSearch").oninput=invRenderCases;$("#invCaseStatus").onchange=invRenderCases;$("#invCasePriority").onchange=invRenderCases;
$("#invCaseForm").onsubmit=e=>{e.preventDefault();const id=$("#invCaseId").value||invNextId("INV",invCases),old=invCases.find(x=>x.id===id),obj={id,title:$("#invCaseTitle").value.trim(),investigators:$("#invCaseInvestigators").value.trim(),status:$("#invCaseFormStatus").value,priority:$("#invCaseFormPriority").value,opened:$("#invCaseOpened").value,summary:$("#invCaseSummary").value.trim(),updatedAt:new Date().toISOString(),suspectIds:old?.suspectIds||[],witnessIds:old?.witnessIds||[],reportIds:old?.reportIds||[]};const i=invCases.findIndex(x=>x.id===id);if(i>=0)invCases[i]=obj;else invCases.unshift(obj);save(INV_STORAGE.cases,invCases);closeModal("invCaseModal");invRenderAll();if(currentInvCaseId===id){$("#invBoardCaseTitle").textContent=obj.title;renderInvBoard()}};

$("#invNewSuspectBtn").onclick=()=>openInvSuspectForm();$("#invSuspectSearch").oninput=invRenderSuspects;$("#invSuspectGroupFilter").onchange=invRenderSuspects;$("#invSuspectDangerFilter").onchange=invRenderSuspects;
$("#invSuspectPhoto").onchange=async e=>{const f=e.target.files?.[0];if(!f)return;if(f.size>5*1024*1024){alert("Photo limitée à 5 Mo.");e.target.value="";return}const d=await compressInvImage(f,900,.82);e.target.dataset.current=d;renderPersonPhotoPreview("#invSuspectPhotoPreview",d)};
$("#invSuspectForm").onsubmit=e=>{e.preventDefault();const id=$("#invSuspectId").value||invNextId("SUS",invSuspects),old=invSuspects.find(x=>x.id===id),firstName=$("#invSuspectFirstName").value.trim(),lastName=$("#invSuspectLastName").value.trim(),obj={id,firstName,lastName,name:[firstName,lastName].filter(Boolean).join(" "),alias:$("#invSuspectAlias").value.trim(),danger:$("#invSuspectDanger").value,group:$("#invSuspectGroup").value.trim(),role:$("#invSuspectRole").value.trim(),vehicles:$("#invSuspectVehicles").value.trim(),notes:$("#invSuspectNotes").value.trim(),photo:$("#invSuspectPhoto").dataset.current||old?.photo||null,caseIds:old?.caseIds||[],createdBy:old?.createdBy||profile.name,updatedAt:new Date().toISOString()};const duplicate=invSuspects.find(s=>s.id!==id&&invPersonName(s).toLowerCase()===invPersonName(obj).toLowerCase());if(duplicate&&!confirm(`Une fiche existe déjà pour ${invPersonName(duplicate)}. Enregistrer quand même ?`))return;const i=invSuspects.findIndex(x=>x.id===id);if(i>=0)invSuspects[i]=obj;else invSuspects.unshift(obj);save(INV_STORAGE.suspects,invSuspects);closeModal("invSuspectModal");invRenderAll()};

$("#invBoardCaseStatus").onchange=()=>{const c=invCases.find(x=>x.id===currentInvCaseId);if(c){c.status=$("#invBoardCaseStatus").value;c.updatedAt=new Date().toISOString();save(INV_STORAGE.cases,invCases);invRenderAll()}};
$("#invBoardEditCase").onclick=()=>{closeModal("invBoardModal");openInvCaseForm(currentInvCaseId)};
$("#invAddSuspectToBoard").onclick=()=>openInvPicker("suspect");
$("#invImportReportBtn").onclick=()=>openInvPicker("report");

$("#invAddRichTextBtn").onclick=()=>{$("#invRichTextForm").reset();$("#invRichTextEditor").innerHTML="";openModal("invRichTextModal")};
$("#invRichTextForm").onsubmit=e=>{e.preventDefault();const raw=$("#invRichTextEditor").innerHTML,title=$("#invRichTextCardTitle").value.trim()||"Note d'enquête";if(!$("#invRichTextEditor").textContent.trim())return alert("Ajoutez du contenu.");addInvNode("Texte",title,"",null,null,sanitizeRichHtml(raw));closeModal("invRichTextModal")};

$("#invAddDocumentBtn").onclick=()=>{$("#invDocumentForm").reset();$("#invDocumentEditor").innerHTML="";openModal("invDocumentModal")};
$("#invDocumentForm").onsubmit=e=>{e.preventDefault();const title=$("#invDocumentTitle").value.trim(),raw=$("#invDocumentEditor").innerHTML;if(!$("#invDocumentEditor").textContent.trim())return alert("Ajoutez du contenu au document.");addInvNode("Document",title,"",null,null,sanitizeRichHtml(raw));closeModal("invDocumentModal")};

$("#invAddWitnessBtn").onclick=()=>{$("#invWitnessForm").reset();$("#invWitnessId").value="";$("#invWitnessPhoto").dataset.current="";renderPersonPhotoPreview("#invWitnessPhotoPreview",null);openModal("invWitnessModal")};
$("#invWitnessPhoto").onchange=async e=>{const f=e.target.files?.[0];if(!f)return;if(f.size>5*1024*1024){alert("Photo limitée à 5 Mo.");e.target.value="";return}const d=await compressInvImage(f,900,.82);e.target.dataset.current=d;renderPersonPhotoPreview("#invWitnessPhotoPreview",d)};
$("#invWitnessForm").onsubmit=e=>{e.preventDefault();const c=invCases.find(x=>x.id===currentInvCaseId);if(!c)return;const id=invNextId("TEM",invWitnesses),w={id,lastName:$("#invWitnessLastName").value.trim(),firstName:$("#invWitnessFirstName").value.trim(),alias:$("#invWitnessAlias").value.trim(),affiliation:$("#invWitnessAffiliation").value.trim(),type:$("#invWitnessType").value,reliability:$("#invWitnessReliability").value,notes:$("#invWitnessNotes").value.trim(),photo:$("#invWitnessPhoto").dataset.current||null,caseIds:[c.id],createdBy:profile.name,updatedAt:new Date().toISOString()};invWitnesses.unshift(w);c.witnessIds=[...(c.witnessIds||[]),id];save(INV_STORAGE.witnesses,invWitnesses);save(INV_STORAGE.cases,invCases);addInvNode("Témoin",invPersonName(w),[w.alias?`Alias : ${w.alias}`:"",`Type : ${w.type}`,w.affiliation?`Appartenance / lien : ${w.affiliation}`:"",`Fiabilité : ${w.reliability}`,w.notes||""].filter(Boolean).join("\n"),w.id,w.photo);closeModal("invWitnessModal");renderInvBoard();invRenderCases()};

$("#invBoardImageInput").onchange=async e=>{
  const files=[...(e.target.files||[])];e.target.value="";if(!files.length)return;
  invPendingImageQueue=[];
  for(const f of files){if(f.size>5*1024*1024){alert(`${f.name} dépasse 5 Mo et a été ignorée.`);continue}invPendingImageQueue.push({name:f.name,data:await compressInvImage(f)})}
  openNextInvImageMeta()
};
function openNextInvImageMeta(){const item=invPendingImageQueue.shift();if(!item)return;$("#invImagePendingData").value=item.data;$("#invImageTitle").value=item.name.replace(/\.[^.]+$/,"");$("#invImageCaption").value="";$("#invImageMetaPreview").innerHTML=`<img src="${item.data}" alt="">`;openModal("invImageMetaModal")}
$("#invImageMetaForm").onsubmit=e=>{e.preventDefault();addInvNode("Photo",$("#invImageTitle").value.trim()||"Photo",$("#invImageCaption").value.trim(),null,$("#invImagePendingData").value);closeModal("invImageMetaModal");setTimeout(openNextInvImageMeta,80)};

$("#invLinkElementsBtn").onclick=()=>{invLinkMode=true;invLinkStartId=null;syncInvLinkUI()};
$("#invCancelLinkBtn").onclick=()=>{invLinkMode=false;invLinkStartId=null;syncInvLinkUI()};
$("#invUndoLinkBtn").onclick=()=>{const b=getInvBoard(currentInvCaseId);if(!b.links.length)return alert("Aucune liaison à supprimer.");b.links.pop();save(INV_STORAGE.boards,invBoards);renderInvLinks()};
$("#invZoomIn").onclick=()=>{invZoom=Math.min(1.6,invZoom+.1);applyInvZoom()};
$("#invZoomOut").onclick=()=>{invZoom=Math.max(.5,invZoom-.1);applyInvZoom()};
$("#invResetView").onclick=centerInvBoard;
invRenderAll();

// ==================== SEB — SPECIAL ENFORCEMENT BUREAU ====================
const SEB_STORAGE={
  operations:"bcso_demo_seb_operations",
  boards:"bcso_demo_seb_boards"
};
const seedSebOperations=[{
  id:"SEB-2026-0001",title:"Intervention — Sandy Shores",lead:"K. Belkacem",
  status:"En préparation",priority:"Élevée",date:"2026-09-12T22:00",
  objective:"Interpellation de plusieurs individus retranchés et sécurisation des lieux.",
  threats:"Présence possible d'armes longues. Nombre d'individus à confirmer.",
  teams:"Alpha — entrée principale\nBravo — couverture / seconde entrée",
  equipment:"Bouclier balistique, bélier, médical tactique.",
  instructions:"Priorité à la sécurisation des civils et à la coordination radio.",
  createdAt:"2026-09-10T02:20:00",updatedAt:"2026-09-10T02:20:00"
}];

let sebOperations=load(SEB_STORAGE.operations,seedSebOperations);
let sebBoards=load(SEB_STORAGE.boards,{});
let currentSebOperationId=null;
let sebLeafletMap=null,sebSatelliteLayer=null,sebPostalLayer=null,sebCurrentLayer="satellite";
let sebLeafletObjects=[],sebActiveTool=null,sebDraftRoute=null,sebDraftRouteLayer=null;

save(SEB_STORAGE.operations,sebOperations);save(SEB_STORAGE.boards,sebBoards);

const SEB_MAP_BOUNDS=[[-16384,0],[0,16384]];
const SEB_TILE_ROOT="https://raw.githubusercontent.com/fivenet-app/livemap-tiles/main/tiles";
const SEB_PLACE_TYPES={
  entry:{label:"Entrée",emoji:"🚪"},
  exit:{label:"Sortie",emoji:"🚨"},
  suspect:{label:"Suspect",emoji:"⚠️"},
  hostage:{label:"Otage",emoji:"🧍"},
  rally:{label:"Rassemblement",emoji:"📍"},
  vehicle:{label:"Véhicule",emoji:"🚙"},
  overwatch:{label:"Overwatch",emoji:"🎯"},
  objective:{label:"Objectif",emoji:"⭐"},
  alpha:{label:"Unité Alpha",emoji:"🟦"},
  bravo:{label:"Unité Bravo",emoji:"🟩"},
  charlie:{label:"Unité Charlie",emoji:"🟨"},
  medic:{label:"Médical",emoji:"🚑"},
  sniper:{label:"Tireur / Observation",emoji:"🔭"},
  custom:{label:"Élément personnalisé",emoji:"😀"}
};

function sebNextId(){
  const y=new Date().getFullYear(),nums=sebOperations.filter(o=>o.id.startsWith(`SEB-${y}-`)).map(o=>parseInt(o.id.split("-").pop(),10)||0);
  return `SEB-${y}-${String(Math.max(0,...nums)+1).padStart(4,"0")}`
}
function sebStatusClass(s){return s==="Prête"?"ready":s==="En cours"?"live":s==="En préparation"?"prep":s==="Annulée"?"cancel":"done"}
function sebRenderOperations(){
  const q=($("#sebOperationSearch")?.value||"").toLowerCase(),st=$("#sebOperationStatus")?.value||"",pr=$("#sebOperationPriority")?.value||"";
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
  </article>`).join("")||'<div class="empty-state">Aucune opération SEB.</div>';
  $$("[data-seb-open]").forEach(b=>b.onclick=()=>openSebBoard(b.dataset.sebOpen));
  $$("[data-seb-edit]").forEach(b=>b.onclick=()=>openSebOperationForm(b.dataset.sebEdit));
  $$("[data-seb-delete]").forEach(b=>b.onclick=()=>deleteSebOperation(b.dataset.sebDelete));
}
function openSebOperationForm(id=null){
  const o=id?sebOperations.find(x=>x.id===id):null;$("#sebOperationForm").reset();$("#sebOperationId").value=o?.id||"";
  $("#sebOperationModalTitle").textContent=o?`Modifier ${o.id}`:"Nouvelle opération SEB";$("#sebOperationTitle").value=o?.title||"";$("#sebOperationLead").value=o?.lead||profile.name;
  $("#sebOperationFormStatus").value=o?.status||"En préparation";$("#sebOperationFormPriority").value=o?.priority||"Normale";$("#sebOperationDate").value=o?.date||"";
  $("#sebOperationObjective").value=o?.objective||"";$("#sebOperationThreats").value=o?.threats||"";$("#sebOperationTeams").value=o?.teams||"";$("#sebOperationEquipment").value=o?.equipment||"";$("#sebOperationInstructions").value=o?.instructions||"";
  openModal("sebOperationModal")
}
function deleteSebOperation(id){
  const o=sebOperations.find(x=>x.id===id);if(!o||!confirm(`Supprimer ${o.id} — ${o.title} ?`))return;
  sebOperations=sebOperations.filter(x=>x.id!==id);delete sebBoards[id];save(SEB_STORAGE.operations,sebOperations);save(SEB_STORAGE.boards,sebBoards);sebRenderOperations()
}
function getSebBoard(id){
  if(!sebBoards[id])sebBoards[id]={markers:[],routes:[],view:null,layer:"satellite"};
  const b=sebBoards[id];b.markers=b.markers||[];b.routes=b.routes||[];b.layer=b.layer||"satellite";return b
}
function sebBriefingHtml(o){
  return `<div><b>Objectif</b><p>${escapeHtml(o.objective||"—")}</p></div><div><b>Menaces</b><p>${escapeHtml(o.threats||"—")}</p></div><div><b>Effectifs</b><p>${escapeHtml(o.teams||"—").replace(/\n/g,"<br>")}</p></div><div><b>Équipement</b><p>${escapeHtml(o.equipment||"—").replace(/\n/g,"<br>")}</p></div><div><b>Consignes</b><p>${escapeHtml(o.instructions||"—").replace(/\n/g,"<br>")}</p></div>`
}
function sebEmojiIcon(emoji,label){
  return L.divIcon({
    className:"seb-leaflet-divicon",
    html:`<div class="seb-emoji-marker"><span>${escapeHtml(emoji)}</span><small>${escapeHtml(label)}</small></div>`,
    iconSize:[82,48],iconAnchor:[41,24]
  })
}
function destroySebLeafletObjects(){
  if(!sebLeafletMap)return;
  sebLeafletObjects.forEach(o=>{try{sebLeafletMap.removeLayer(o)}catch{}});
  sebLeafletObjects=[];
  if(sebDraftRouteLayer){try{sebLeafletMap.removeLayer(sebDraftRouteLayer)}catch{};sebDraftRouteLayer=null}
}
function setSebMapLoadState(message,state="loading"){
  const el=document.querySelector("#sebMapLoadState");
  if(!el)return;
  el.textContent=message;
  el.hidden=!message;
  el.dataset.state=state;
}
function initSebLeafletMap(){
  if(sebLeafletMap)return;
  if(typeof L==="undefined"){alert("Leaflet n'a pas pu être chargé. Vérifiez votre connexion Internet.");return}
  const mapHost=document.querySelector("#sebLeafletMap");
  if(mapHost && !document.querySelector("#sebMapLoadState")){
    const msg=document.createElement("div");
    msg.id="sebMapLoadState";
    msg.className="seb-map-load-state";
    msg.hidden=true;
    mapHost.parentElement?.appendChild(msg);
  }
  sebLeafletMap=L.map("sebLeafletMap",{
    crs:L.CRS.Simple,
    minZoom:1,maxZoom:9,
    zoomSnap:.25,zoomDelta:.5,
    wheelPxPerZoomLevel:70,
    maxBounds:SEB_MAP_BOUNDS,
    maxBoundsViscosity:1,
    attributionControl:false
  });
  const tileOptions={
    minZoom:1,maxZoom:9,maxNativeZoom:7,tileSize:256,noWrap:true,tms:true,bounds:SEB_MAP_BOUNDS,
    keepBuffer:4,updateWhenIdle:false,crossOrigin:true
  };
  sebSatelliteLayer=L.tileLayer(`${SEB_TILE_ROOT}/satellite/{z}/{x}/{y}.webp`,tileOptions);
  sebPostalLayer=L.tileLayer(`${SEB_TILE_ROOT}/postal/{z}/{x}/{y}.webp`,tileOptions);

  [sebSatelliteLayer,sebPostalLayer].forEach(layer=>{
    layer.on("loading",()=>setSebMapLoadState("Chargement de la carte GTA V…","loading"));
    layer.on("load",()=>setSebMapLoadState("","ok"));
    layer.on("tileerror",e=>{
      console.error("SEB map tile error:",e?.tile?.src||e);
      setSebMapLoadState("Impossible de charger certaines tuiles de la carte. Réessayez ou rechargez la page.","error");
    });
  });
  sebSatelliteLayer.addTo(sebLeafletMap);
  sebLeafletMap.fitBounds(SEB_MAP_BOUNDS,{padding:[15,15],animate:false});

  sebLeafletMap.on("mousemove",e=>{
    const x=Math.round(e.latlng.lng),y=Math.round(-e.latlng.lat);
    const r=$("#sebCoordinateReadout");if(r)r.textContent=`X ${x} / Y ${y}`;
  });
  sebLeafletMap.on("click",handleSebLeafletClick);
  sebLeafletMap.on("moveend zoomend",saveSebMapView);
}
function saveSebMapView(){
  if(!currentSebOperationId||!sebLeafletMap)return;
  const c=sebLeafletMap.getCenter(),b=getSebBoard(currentSebOperationId);
  b.view={lat:c.lat,lng:c.lng,zoom:sebLeafletMap.getZoom()};
  save(SEB_STORAGE.boards,sebBoards)
}
function setSebBaseLayer(layerName){
  if(!sebLeafletMap)return;
  const b=getSebBoard(currentSebOperationId);
  if(sebSatelliteLayer)sebLeafletMap.removeLayer(sebSatelliteLayer);
  if(sebPostalLayer)sebLeafletMap.removeLayer(sebPostalLayer);
  (layerName==="postal"?sebPostalLayer:sebSatelliteLayer).addTo(sebLeafletMap);
  sebCurrentLayer=layerName;b.layer=layerName;save(SEB_STORAGE.boards,sebBoards);
  $$("[data-seb-layer]").forEach(x=>x.classList.toggle("active",x.dataset.sebLayer===layerName))
}
function renderSebMapData(){
  if(!sebLeafletMap||!currentSebOperationId)return;
  destroySebLeafletObjects();
  const b=getSebBoard(currentSebOperationId);
  setSebBaseLayer(b.layer||"satellite");

  b.markers.forEach(m=>{
    const marker=L.marker([m.lat,m.lng],{draggable:true,icon:sebEmojiIcon(m.emoji,m.label)}).addTo(sebLeafletMap);
    marker.bindPopup(`<div class="seb-popup"><strong>${escapeHtml(m.label)}</strong>${m.detail?`<p>${escapeHtml(m.detail)}</p>`:""}<button type="button" data-seb-popup-remove="${m.id}">Supprimer</button></div>`);
    marker.on("dragend",()=>{
      const p=marker.getLatLng();m.lat=p.lat;m.lng=p.lng;save(SEB_STORAGE.boards,sebBoards)
    });
    marker.on("popupopen",()=>{
      setTimeout(()=>{
        document.querySelector(`[data-seb-popup-remove="${m.id}"]`)?.addEventListener("click",()=>{
          b.markers=b.markers.filter(x=>x.id!==m.id);save(SEB_STORAGE.boards,sebBoards);renderSebMapData()
        })
      },0)
    });
    sebLeafletObjects.push(marker)
  });

  b.routes.forEach(r=>{
    const opts=r.type==="convoy"?{weight:6,opacity:.9,dashArray:"12 8"}:{weight:5,opacity:.95};
    const line=L.polyline(r.points.map(p=>[p.lat,p.lng]),opts).addTo(sebLeafletMap);
    line.bindPopup(`<div class="seb-popup"><strong>${r.type==="convoy"?"Tracé convoi":"Axe d'assaut"}</strong>${r.label?`<p>${escapeHtml(r.label)}</p>`:""}<button type="button" data-seb-route-remove="${r.id}">Supprimer</button></div>`);
    line.on("popupopen",()=>setTimeout(()=>document.querySelector(`[data-seb-route-remove="${r.id}"]`)?.addEventListener("click",()=>{
      b.routes=b.routes.filter(x=>x.id!==r.id);save(SEB_STORAGE.boards,sebBoards);renderSebMapData()
    }),0));
    sebLeafletObjects.push(line)
  });

  if(b.view)sebLeafletMap.setView([b.view.lat,b.view.lng],b.view.zoom,{animate:false});
  else sebLeafletMap.fitBounds(SEB_MAP_BOUNDS,{padding:[15,15]})
}
function openSebBoard(id){
  const o=sebOperations.find(x=>x.id===id);if(!o)return;
  currentSebOperationId=id;$("#sebBoardOperationId").textContent=o.id;$("#sebBoardOperationTitle").textContent=o.title;$("#sebBoardOperationStatus").value=o.status;$("#sebBoardBriefing").innerHTML=sebBriefingHtml(o);
  clearSebLeafletTool();openModal("sebBoardModal");
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    initSebLeafletMap();
    sebLeafletMap?.invalidateSize();
    renderSebMapData()
  }))
}
function setSebLeafletTool(tool){
  sebActiveTool=tool;sebDraftRoute=null;
  if(sebDraftRouteLayer&&sebLeafletMap){sebLeafletMap.removeLayer(sebDraftRouteLayer);sebDraftRouteLayer=null}
  const status=$("#sebLeafletToolStatus"),finish=$("#sebFinishLeafletRoute"),cancel=$("#sebCancelLeafletTool");
  finish.hidden=!["convoy","assault"].includes(tool);cancel.hidden=!tool;
  if(tool==="convoy")status.textContent="Tracé convoi actif : cliquez successivement sur la route. Terminez avec ✓.";
  else if(tool==="assault")status.textContent="Axe d'assaut actif : cliquez pour créer les points de progression.";
  else if(tool)status.textContent=`${SEB_PLACE_TYPES[tool]?.label||"Élément"} : cliquez à l'endroit où le placer.`;
  else status.textContent="Sélectionnez un repère ou un outil, puis cliquez sur la carte.";
  document.querySelector("#sebLeafletMap")?.classList.toggle("placing",!!tool)
}
function clearSebLeafletTool(){
  sebActiveTool=null;sebDraftRoute=null;
  if(sebDraftRouteLayer&&sebLeafletMap){sebLeafletMap.removeLayer(sebDraftRouteLayer);sebDraftRouteLayer=null}
  const finish=$("#sebFinishLeafletRoute"),cancel=$("#sebCancelLeafletTool"),status=$("#sebLeafletToolStatus");
  if(finish)finish.hidden=true;if(cancel)cancel.hidden=true;if(status)status.textContent="Sélectionnez un repère ou un outil, puis cliquez sur la carte.";
  document.querySelector("#sebLeafletMap")?.classList.remove("placing")
}
function handleSebLeafletClick(e){
  if(!sebActiveTool||!currentSebOperationId)return;
  const b=getSebBoard(currentSebOperationId);
  if(["convoy","assault"].includes(sebActiveTool)){
    if(!sebDraftRoute)sebDraftRoute={type:sebActiveTool,points:[]};
    sebDraftRoute.points.push({lat:e.latlng.lat,lng:e.latlng.lng});
    if(sebDraftRouteLayer)sebLeafletMap.removeLayer(sebDraftRouteLayer);
    sebDraftRouteLayer=L.polyline(sebDraftRoute.points.map(p=>[p.lat,p.lng]),{weight:5,dashArray:sebActiveTool==="convoy"?"12 8":null}).addTo(sebLeafletMap);
    return
  }
  const def=SEB_PLACE_TYPES[sebActiveTool]||SEB_PLACE_TYPES.custom;
  let emoji=def.emoji,label=def.label,detail="";
  if(sebActiveTool==="custom"){
    emoji=prompt("Emoji ou symbole :",def.emoji)||def.emoji;
    label=prompt("Nom de l'élément :","Unité / élément")||"Élément";
  }else if(["alpha","bravo","charlie","medic","sniper"].includes(sebActiveTool)){
    label=prompt("Nom / indicatif de l'unité :",def.label)||def.label
  }
  detail=prompt("Précision / mission (optionnel) :","")||"";
  b.markers.push({id:`seb-m-${Date.now()}`,kind:sebActiveTool,emoji,label,detail,lat:e.latlng.lat,lng:e.latlng.lng});
  save(SEB_STORAGE.boards,sebBoards);renderSebMapData();clearSebLeafletTool()
}
function finishSebLeafletRoute(){
  if(!sebDraftRoute||sebDraftRoute.points.length<2)return alert("Placez au moins deux points.");
  const label=prompt(sebDraftRoute.type==="convoy"?"Nom du convoi / itinéraire :":"Nom de l'axe :",sebDraftRoute.type==="convoy"?"Convoi principal":"Axe Alpha")||"";
  const b=getSebBoard(currentSebOperationId);b.routes.push({id:`seb-r-${Date.now()}`,type:sebDraftRoute.type,label,points:sebDraftRoute.points});
  save(SEB_STORAGE.boards,sebBoards);clearSebLeafletTool();renderSebMapData()
}
function undoSebLeaflet(){
  const b=getSebBoard(currentSebOperationId);
  if(sebDraftRoute?.points?.length){sebDraftRoute.points.pop();if(sebDraftRouteLayer)sebLeafletMap.removeLayer(sebDraftRouteLayer);sebDraftRouteLayer=null;if(sebDraftRoute.points.length)sebDraftRouteLayer=L.polyline(sebDraftRoute.points.map(p=>[p.lat,p.lng]),{weight:5,dashArray:sebDraftRoute.type==="convoy"?"12 8":null}).addTo(sebLeafletMap);return}
  const lastMarker=b.markers[b.markers.length-1],lastRoute=b.routes[b.routes.length-1];
  if(!lastMarker&&!lastRoute)return;
  if(lastMarker&&(!lastRoute||String(lastMarker.id).localeCompare(String(lastRoute.id))>0))b.markers.pop();else b.routes.pop();
  save(SEB_STORAGE.boards,sebBoards);renderSebMapData()
}

$("#sebNewOperationBtn").onclick=()=>openSebOperationForm();
$("#sebOperationSearch").oninput=sebRenderOperations;$("#sebOperationStatus").onchange=sebRenderOperations;$("#sebOperationPriority").onchange=sebRenderOperations;
$("#sebOperationForm").onsubmit=e=>{
  e.preventDefault();const id=$("#sebOperationId").value||sebNextId(),old=sebOperations.find(x=>x.id===id);
  const obj={id,title:$("#sebOperationTitle").value.trim(),lead:$("#sebOperationLead").value.trim(),status:$("#sebOperationFormStatus").value,priority:$("#sebOperationFormPriority").value,date:$("#sebOperationDate").value,objective:$("#sebOperationObjective").value.trim(),threats:$("#sebOperationThreats").value.trim(),teams:$("#sebOperationTeams").value.trim(),equipment:$("#sebOperationEquipment").value.trim(),instructions:$("#sebOperationInstructions").value.trim(),createdAt:old?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};
  const i=sebOperations.findIndex(x=>x.id===id);if(i>=0)sebOperations[i]=obj;else sebOperations.unshift(obj);
  save(SEB_STORAGE.operations,sebOperations);closeModal("sebOperationModal");sebRenderOperations();
  if(currentSebOperationId===id){$("#sebBoardOperationTitle").textContent=obj.title;$("#sebBoardBriefing").innerHTML=sebBriefingHtml(obj)}
};
$("#sebBoardOperationStatus").onchange=()=>{const o=sebOperations.find(x=>x.id===currentSebOperationId);if(o){o.status=$("#sebBoardOperationStatus").value;o.updatedAt=new Date().toISOString();save(SEB_STORAGE.operations,sebOperations);sebRenderOperations()}};
$("#sebBoardEditOperation").onclick=()=>{closeModal("sebBoardModal");openSebOperationForm(currentSebOperationId)};
$$("[data-seb-place]").forEach(b=>b.onclick=()=>setSebLeafletTool(b.dataset.sebPlace));
$$("[data-seb-layer]").forEach(b=>b.onclick=()=>setSebBaseLayer(b.dataset.sebLayer));
$("#sebStartConvoyRoute").onclick=()=>setSebLeafletTool("convoy");
$("#sebStartAssaultRoute").onclick=()=>setSebLeafletTool("assault");
$("#sebFinishLeafletRoute").onclick=finishSebLeafletRoute;
$("#sebCancelLeafletTool").onclick=clearSebLeafletTool;
$("#sebUndoLeaflet").onclick=undoSebLeaflet;
$("#sebFitGtaMap").onclick=()=>sebLeafletMap?.fitBounds(SEB_MAP_BOUNDS,{padding:[15,15]});
$("#sebClearBoardBtn").onclick=()=>{
  if(!confirm("Effacer tous les repères et tracés tactiques de cette opération ?"))return;
  const b=getSebBoard(currentSebOperationId);b.markers=[];b.routes=[];save(SEB_STORAGE.boards,sebBoards);clearSebLeafletTool();renderSebMapData()
};
sebRenderOperations();

// ==================== PROCEDURES & AIDES ====================
const PROCEDURES = [
  {id:"rappels-proceduraux",title:"Rappels procéduraux",category:"Rapports",desc:"Règles essentielles concernant les rapports, les avocats, les saisies et l'individualisation des faits.",body:`
    <h3>Avocat & interrogatoire</h3>
    <div class="doc-step">Finir le rapport avant d'appeler l'avocat si celui-ci est demandé.</div>
    <div class="doc-step">Si le suspect demande un avocat, aucun interrogatoire ne doit être effectué avant son arrivée.</div>
    <h3>Statut des rapports</h3>
    <div class="doc-step">Pour les rapports en <strong>cours de rédaction</strong>, un statut dédié a été ajouté.</div>
    <div class="doc-warning"><strong>Vice de forme :</strong> un rapport ne doit plus être modifié une fois le statut <strong>« En cours »</strong> attribué.</div>
    <div class="doc-step"><strong>Relire le rapport</strong> avant son envoi afin d'éviter les erreurs de date, d'identité ou de qualification.</div>
    <h3>Rapports groupés</h3>
    <div class="doc-step">Les chefs d'inculpation doivent être détaillés individuellement pour <strong>chaque suspect</strong>.</div>
    <div class="doc-step">Les saisies doivent être attribuées individuellement à <strong>chaque suspect</strong>.</div>
    <div class="doc-step">L'implication de chaque suspect doit être précisée lorsqu'elle est connue : conducteur, braqueur, négociateur, tireur, etc.</div>
    <div class="doc-step">Éviter les formulations générales visant tout un groupe lorsqu'il est possible d'identifier les actions de chaque individu.</div>
    <div class="doc-tip"><strong>À retenir :</strong> tout chef d'inculpation doit pouvoir être justifié par des faits, témoignages ou preuves mentionnés dans le rapport.</div>`},
  {id:"braquages",title:"Procédure — Braquages",category:"Interventions",desc:"Procédure applicable aux Fleeca, conteneurs, bijouteries et autres scènes de braquage.",body:`
    <h3>1. Avant arrivée</h3><div class="doc-step">Port du gilet pare-balles obligatoire.</div><div class="doc-step">Vérification de l'équipement.</div><div class="doc-step">Premier <strong>SITREP</strong> à l'approche.</div>
    <h3>2. Sécurisation de la scène</h3><div class="doc-step">Mise en place du périmètre externe par les premiers intervenants.</div><div class="doc-step">Mise en place du périmètre interne à l'arrivée du <strong>TARV</strong>, si disponible.</div><div class="doc-step">Positionnement des unités conformément à la formation négociation.</div><div class="doc-step">Éviter les déplacements inutiles dans la zone.</div>
    <h3>3. Phase de négociation</h3><div class="doc-step">Désignation du négociateur et du co-négociateur.</div><div class="doc-step"><strong>Utilisation de la fiche co-négociateur.</strong></div>
    <h3>4. Libération des otages</h3><div class="doc-step">Identification des otages, palpation de sécurité, premiers témoignages et vérification des blessures.</div><div class="doc-step">Prise en charge EMS si nécessaire.</div>
    <h3>5. Interpellations</h3><div class="doc-step">Contrôle et identification des suspects.</div><div class="doc-step">Palpation systématique.</div><div class="doc-step">Inventaire individuel des saisies.</div><div class="doc-step">Test de poudre si usage d'arme à feu.</div>
    <h3>6. Gel de la scène</h3><div class="doc-step">Photographies de la scène, des véhicules, des armes et des impacts.</div><div class="doc-step">Préservation des preuves jusqu'à la fin de l'intervention.</div>
    <h3>7. Rapport</h3><div class="doc-step">Identifier précisément le rôle de chaque suspect : conducteur, négociateur, braqueur.</div><div class="doc-step">Détail individuel des saisies.</div>`},
  {id:"fusillade",title:"Procédure Fusillade — Premiers intervenants",category:"Interventions",desc:"Conduite à tenir pour les premières unités arrivant sur une scène impliquant des tirs ou individus armés.",body:`
    <h3>1. Équipement</h3><div class="doc-step">Port du gilet pare-balles et vérification de l'armement.</div>
    <h3>2. Arrivée sur les lieux</h3><div class="doc-step">Effectuer un <strong>SITREP initial</strong>, évaluer la menace et demander des renforts si nécessaire.</div>
    <h3>3. Sécurisation</h3><div class="doc-step">Levée de doute, recherche de suspects armés, sécurisation des civils et neutralisation de toute menace active.</div>
    <h3>4. Prise en charge des victimes</h3><div class="doc-step">Identifier les blessés, débuter les premiers soins si possible et faire intervenir les EMS.</div>
    <h3>5. Gel de la scène</h3><div class="doc-step">Établir un périmètre de sécurité et interdire l'accès aux personnes non autorisées.</div><div class="doc-step">Photographier la scène, les armes, impacts et véhicules. Éviter tout déplacement non nécessaire.</div>
    <h3>6. Identification</h3><div class="doc-step">Identifier victimes, témoins et suspects, contrôler les personnes présentes et recueillir les premières informations.</div>
    <h3>7. Enquête préliminaire</h3><div class="doc-step">Recherche d'armes, <strong>test de poudre systématique</strong>, recensement des saisies, version des faits et témoignages.</div>
    <h3>8. Compte-rendu</h3><div class="doc-step"><strong>SITREP final</strong>, transmission à la CID et rédaction du rapport si arrestation, usage de la force ou procédure judiciaire.</div>`}
];

const HELP_SHEETS = [
  {id:"controle-routier",title:"Contrôle routier",category:"Patrouille",desc:"Pense-bête pour conduire un contrôle routier et choisir la mesure adaptée.",body:`<div class="doc-step"><strong>Étape 1</strong> — Identifier le motif du contrôle</div><div class="doc-step"><strong>Étape 2</strong> — Vérifier l'identité</div><div class="doc-step"><strong>Étape 3</strong> — Vérifier le permis</div><div class="doc-step"><strong>Étape 4</strong> — Vérifier le véhicule (recherché, volé, signalé...)</div><div class="doc-step"><strong>Étape 5</strong> — Une infraction est constatée ?</div><div class="doc-flow-choice"><span><strong>Oui</strong> → Avertissement / Verbalisation / Interpellation</span><span><strong>Non</strong> → Fin du contrôle</span></div><div class="doc-step"><strong>Étape 6</strong> — Rédiger un rapport si nécessaire</div><div class="doc-warning"><strong>⚠ Points de vigilance</strong><br>• Un contrôle routier peut évoluer rapidement en interpellation.<br>• Garder un œil sur les passagers, pas uniquement le conducteur.<br>• Rester attentif à l'environnement : circulation, piétons et véhicules arrivant sur les lieux.</div>`},
  {id:"arrestation",title:"Arrestation",category:"Intervention",desc:"Étapes essentielles à respecter lors d'une arrestation.",body:`${["Sécuriser l'individu","Palpation de sécurité","Menottage","Retrait du masque / élément dissimulant le visage","Vérifier l'identité","Lecture des droits Miranda","Fouille complète","Inventaire des saisies","Procédure / Rapport"].map((x,i)=>`<div class="doc-step"><strong>Étape ${i+1}</strong> — ${x}</div>`).join("")}<div class="doc-warning"><strong>⚠ Points de vigilance</strong><br>• Ne jamais tourner le dos à un individu non maîtrisé.<br>• Rester attentif aux personnes présentes autour de l'intervention.<br>• Vérifier que tous les individus sont sécurisés avant de reprendre disponible.</div>`},
  {id:"controle-identite",title:"Contrôle d'identité",category:"Patrouille",desc:"Pense-bête pour un contrôle d'identité justifié et sécurisé.",body:`${["Identifier le motif du contrôle","Demander une pièce d'identité","Vérifier l'identité dans la tablette","Vérifier si la personne est recherchée"].map((x,i)=>`<div class="doc-step"><strong>Étape ${i+1}</strong> — ${x}</div>`).join("")}<div class="doc-step"><strong>Étape 5</strong> — Décision : fin du contrôle / arrestation / verbalisation</div><div class="doc-warning"><strong>⚠ Points de vigilance</strong><br>• Un contrôle d'identité doit toujours être justifié.<br>• Être attentif au comportement de l'individu : stress, fuite, gestes suspects...<br>• Garder une distance de sécurité pendant toute l'interaction.</div>`},
  {id:"blesse",title:"Assistance à un blessé",category:"Secours",desc:"Étapes de sécurisation, évaluation et coordination avec les EMS.",body:`${["Sécuriser et baliser la zone","Évaluer l'état de la victime","Contacter les EMS","Effectuer les premiers gestes si nécessaire","Informer les EMS : état de conscience, blessures visibles et circonstances de l'intervention","Assister les EMS si nécessaire"].map((x,i)=>`<div class="doc-step"><strong>Étape ${i+1}</strong> — ${x}</div>`).join("")}<div class="doc-warning"><strong>⚠ Points de vigilance</strong><br>• Ne jamais intervenir sur une zone non sécurisée.<br>• Laisser les EMS assurer la prise en charge médicale.<br>• Continuer à protéger la victime et les EMS pendant toute l'intervention.</div>`},
  {id:"rapport",title:"Rédaction d'un rapport",category:"Rapports",desc:"Choisir le bon rapport, utiliser les tags et éviter les erreurs de procédure.",body:`<div class="doc-step"><strong>Étape 1</strong> — Identifier le type de rapport</div><div class="doc-flow-choice"><span>Arrestation → <strong>Rapport d'arrestation</strong></span><span>Intervention importante / cas lourd → <strong>Rapport d'intervention</strong></span><span>Sinon → Rapport non nécessaire</span></div>${["Renseigner les personnes impliquées : agents, suspects, civils","Sélectionner le type d'intervention","Ajouter les tags adaptés","Rédiger les faits chronologiquement","Renseigner chefs d'accusation, preuves / saisies, éléments particuliers et décision","Relire et vérifier les informations","Appliquer le statut adapté"].map((x,i)=>`<div class="doc-step"><strong>Étape ${i+2}</strong> — ${x}</div>`).join("")}<h3>Utilisation des tags</h3><div class="doc-tip"><strong>LSPD/BCSO</strong> — rapports du département.<br><strong>En rédaction</strong> — rapport en cours de rédaction.<br><strong>En cours</strong> — individu en attente de comparution. Ne plus modifier le rapport.<br><strong>Clôturé</strong> — procédure terminée.<br><strong>En appel</strong> — procédure faisant l'objet d'un appel.<br><strong>Suspendu</strong> — procédure / dossier suspendu.<br><strong>CID</strong> — affaire pouvant intéresser l'investigation.<br><strong>Possession de drogue</strong> — saisie de stupéfiants.<br><strong>Fabrication de drogue</strong> — production de stupéfiants.<br><strong>Formation</strong> — rapport lié à une formation.</div><div class="doc-warning"><strong>⚠ Points de vigilance</strong><br>• Rédiger les faits dans l'ordre chronologique.<br>• Rester factuel, précis et objectif.<br>• Éviter répétitions et informations sans intérêt pour la procédure.<br>• En arrestation groupée, individualiser les faits, saisies et chefs d'accusation.<br>• Distinguer faits constatés, éléments saisis et déclarations.<br>• Vérifier la cohérence générale du rapport.<br>• Faire une dernière relecture avant de passer le rapport « En cours ».</div>`},
  {id:"co-negociateur",title:"Fiche co-négociateur",category:"Négociation",desc:"Fiche interactive à compléter pendant une négociation de braquage.",interactive:"co"}
];

function renderDocCards(data,containerId,searchId,categoryId){
  const q=($(searchId)?.value||"").trim().toLowerCase(),cat=$(categoryId)?.value||"";
  const rows=data.filter(x=>(!cat||x.category===cat)&&[x.title,x.desc,x.category].join(" ").toLowerCase().includes(q));
  $(containerId).innerHTML=rows.map(x=>`<article class="doc-card"><span class="doc-category">${escapeHtml(x.category)}</span><h3>${escapeHtml(x.title)}</h3><p>${escapeHtml(x.desc)}</p><div class="doc-card-actions"><button class="secondary-btn" data-open-doc="${x.id}">Ouvrir</button></div></article>`).join("")||'<div class="empty-state">Aucun résultat.</div>';
  $$('[data-open-doc]').forEach(b=>b.onclick=()=>openDocById(b.dataset.openDoc));
}
function openDocById(id){const d=[...PROCEDURES,...HELP_SHEETS].find(x=>x.id===id);if(!d)return;if(d.interactive==="co"){openModal("coNegotiatorModal");return}$("#docDetailCategory").textContent=d.category;$("#docDetailTitle").textContent=d.title;$("#docDetailBody").innerHTML=d.body;openModal("docDetailModal")}
function renderProcedures(){renderDocCards(PROCEDURES,"#procedureCards","#procedureSearch","#procedureCategory")}
function renderHelpSheets(){renderDocCards(HELP_SHEETS,"#helpSheetCards","#helpSheetSearch","#helpSheetCategory")}
$("#procedureSearch").oninput=renderProcedures;$("#procedureCategory").onchange=renderProcedures;$("#helpSheetSearch").oninput=renderHelpSheets;$("#helpSheetCategory").onchange=renderHelpSheets;
renderProcedures();renderHelpSheets();

const RADIO_GROUPS=[
  {title:"Indicatifs de patrouille",rows:[["Lincoln","Patrouille seule"],["Adam","Patrouille à 2 agents"],["Tango","Patrouille à 3 agents"],["X-Ray","Patrouille à 4 agents"],["Mary","Patrouille à moto"],["ASU","Patrouille en hélicoptère"],["Hubert","Patrouille en bateau"],["Victor","Patrouille à vélo"],["Baker","Patrouille en banalisée"],["Kilo","Patrouille en K-9"],["Charlie","Patrouille avec un VIP"],["Ranger","Patrouille Park Ranger"],["Highway","Patrouille Highway Patrol"]]},
  {title:"Codes opérationnels",rows:[["Code 2","Prioritaire, sans sirène."],["Code 3","Urgent, gyrophare et sirène activés."],["Code 4","Aucune assistance nécessaire, situation stable."],["Code 5","En surveillance, d'autres unités doivent éviter les lieux."],["Code 6","Arrivée sur les lieux."],["Code 99","Agent en danger, besoin d'aide en urgence (10-99)."],["Banane","Mot en cas d'incapacité de dire code 10-99."]]},
  {title:"Ten-Codes",rows:[["10-3","Arrivée sur fréquence"],["10-4","Bien reçu"],["10-5","Négatif"],["10-7","Indisponible"],["10-8","Prise de service"],["10-9","Répéter le call"],["10-10","Fin de service"],["10-12","Attente de dispatch"],["10-15","Suspect arrêté"],["10-19","En route vers..."],["10-20","Votre localisation"],["10-21","Appel téléphonique"],["10-22","Retour en patrouille"],["10-31","Tir d'arme à feu"],["10-35","Demande de renfort"],["10-37","Cambriolage en cours"],["10-38","Contrôle routier"],["10-39","Braquage (ATM / SUP)"],["10-40","Braquage de banque"],["10-41","Prise de patrouille"],["10-42","Fin de patrouille"],["10-50","Accident"],["10-52","Appel EMS"],["10-56","Refus d'obtempérer"],["10-57","Vol de véhicule"],["10-59","Vol de sac à main"],["10-60","Vente de drogue"],["10-61","Braquage de Fleeca"],["10-62","Braquage de bijouterie"],["10-63","Braquage de container"],["10-64","Braquage d'Ammunation"]]}
];
function renderRadioCodes(){const q=($("#radioCodeSearch")?.value||"").toLowerCase();$("#radioCodesContent").innerHTML=RADIO_GROUPS.map(g=>{const rows=g.rows.filter(r=>r.join(" ").toLowerCase().includes(q));if(!rows.length)return"";return `<section class="radio-section"><h3>${escapeHtml(g.title)}</h3><table class="radio-table"><thead><tr><th>Code / Call</th><th>Description</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${escapeHtml(r[0])}</td><td>${escapeHtml(r[1])}</td></tr>`).join("")}</tbody></table></section>`}).join("")||'<div class="empty-state">Aucun code trouvé.</div>'}
$("#radioCodeSearch").oninput=renderRadioCodes;renderRadioCodes();

// Fiche co-négociateur
function coText(){return `🧾 FICHE CO-NÉGOCIATEUR\n\n📍 Braquage : ${$("#coBraquage").value}\n📍 Lieu : ${$("#coLieu").value}\n🕒 Heure : ${$("#coHeure").value}\n\n👥 Nombre de braqueurs : ${$("#coBraqueurs").value}\n🧍 Nombre d’otages / identités : ${$("#coOtages").value}\n🔫 Armement : ${$("#coArmement").value}\n\n📢 Revendications :\n${$("#coRevendications").value}\n\n🚔 Contre-proposition BCSO :\n${$("#coContre").value}\n\n✅ Accord retenu :\n${$("#coAccord").value}\n\n📝 Notes importantes :\n${$("#coNotes").value}`}
$("#resetCoNegotiator").onclick=()=>{if(confirm("Réinitialiser la fiche ?"))$("#coNegotiatorForm").reset()};$("#copyCoNegotiator").onclick=async()=>{try{await navigator.clipboard.writeText(coText());alert("Fiche copiée dans le presse-papiers.")}catch{alert(coText())}};

// ==================== MATERIEL A LA PRISE DE SERVICE ====================
const REQUIRED_EQUIPMENT=["Glock-22 Police","34 munitions","2 Tests GSR","Taser","10 batteries Taser","Gazeuse","5 recharges gazeuse","2 menottes","1 clé","2 bandages","2 garrots","Pistolet radar","Lampe torche","Radio","Matraque","Mégaphone","Paire de jumelles","Appareil photo","Balise","Gilet pare-balles","Herse"];
const MATERIAL_CATALOG=["Glock-22 Police","Munitions","Test GSR","Taser","Batterie Taser","Gazeuse","Recharge gazeuse","Menottes","Clé de menottes","Bandage","Garrot","Pistolet radar","Lampe torche","Radio","Matraque","Mégaphone","Paire de jumelles","Appareil photo","Balise","Gilet pare-balles","Herse"];
let materialRequests=load(STORAGE.materialRequests,[]),materialDraft=[];save(STORAGE.materialRequests,materialRequests);
function openEquipmentCheck(){materialDraft=[];$("#equipmentRequiredList").innerHTML=REQUIRED_EQUIPMENT.map(x=>`<div class="equipment-chip">✓ ${escapeHtml(x)}</div>`).join("");$("#materialRequestItem").innerHTML=MATERIAL_CATALOG.map(x=>`<option>${escapeHtml(x)}</option>`).join("");renderMaterialDraft();openModal("equipmentCheckModal")}
function renderMaterialDraft(){$("#materialRequestDraft").innerHTML=materialDraft.length?materialDraft.map((x,i)=>`<div class="material-draft-item"><span><strong>${x.qty} ×</strong> ${escapeHtml(x.item)}</span><button type="button" data-remove-material="${i}">Retirer</button></div>`).join(""):'<span class="muted">Aucun matériel manquant sélectionné.</span>';$$('[data-remove-material]').forEach(b=>b.onclick=()=>{materialDraft.splice(+b.dataset.removeMaterial,1);renderMaterialDraft()})}
$("#addMaterialRequestItem").onclick=()=>{const item=$("#materialRequestItem").value,qty=Math.max(1,parseInt($("#materialRequestQty").value,10)||1);const existing=materialDraft.find(x=>x.item===item);if(existing)existing.qty+=qty;else materialDraft.push({item,qty});$("#materialRequestQty").value=1;renderMaterialDraft()};
function beginDuty(){activeService={start:new Date().toISOString()};save(STORAGE.activeService,activeService);closeModal("equipmentCheckModal");renderServices()}
$("#startDutyAllGood").onclick=beginDuty;
$("#startDutyWithRequest").onclick=()=>{if(!materialDraft.length){alert("Sélectionnez au moins un équipement manquant ou utilisez « J'ai tout mon équipement ».");return}materialRequests.unshift({id:`MAT-${Date.now()}`,agent:profile.name,rank:profile.rank,date:new Date().toISOString(),items:materialDraft.map(x=>({...x})),status:"En attente"});save(STORAGE.materialRequests,materialRequests);renderMaterialNotifications();beginDuty()};
function renderMaterialNotifications(){const pending=materialRequests.filter(r=>r.status!=="Délivrée").length;$("#materialNotificationCount").textContent=pending;$("#materialNotificationsBtn").classList.toggle("has-alert",pending>0);$("#materialNotificationsList").innerHTML=materialRequests.length?materialRequests.map(r=>`<article class="material-request-card"><div class="request-head"><div><strong>${escapeHtml(r.agent)}</strong><div class="muted">${escapeHtml(r.rank)} • ${formatDate(r.date)}</div></div><span class="request-status">${escapeHtml(r.status)}</span></div><ul class="request-items">${r.items.map(x=>`<li>${x.qty} × ${escapeHtml(x.item)}</li>`).join("")}</ul><div class="request-actions">${r.status==="En attente"?`<button class="secondary-btn" data-material-status="${r.id}|Prise en charge">Prendre en charge</button>`:""}${r.status!=="Délivrée"?`<button class="primary-btn" data-material-status="${r.id}|Délivrée">Marquer comme délivrée</button>`:""}</div></article>`).join(""):'<div class="empty-state">Aucune demande de matériel.</div>';$$('[data-material-status]').forEach(b=>b.onclick=()=>{const [id,status]=b.dataset.materialStatus.split("|");const r=materialRequests.find(x=>x.id===id);if(r){r.status=status;r.updatedAt=new Date().toISOString();save(STORAGE.materialRequests,materialRequests);renderMaterialNotifications()}})}
$("#materialNotificationsBtn").onclick=()=>{renderMaterialNotifications();openModal("materialNotificationsModal")};renderMaterialNotifications();

// ============================================================
// NOTIFICATIONS PORTAIL + GESTION MATERIEL + CONVOCATIONS
// ============================================================
let portalNotifications = load(STORAGE.notifications, []);
let convocations = load(STORAGE.convocations, []);
save(STORAGE.notifications, portalNotifications);
save(STORAGE.convocations, convocations);
let notificationFilter = "all";

function currentAgentId(){ return getPersonalAgent()?.id || null; }
function createPortalNotification({type,title,message,target="all",linkView=null,discord=false,entityId=null}){
  const n={id:`NOT-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,type,title,message,target,linkView,discord,entityId,createdAt:new Date().toISOString(),readBy:[]};
  portalNotifications.unshift(n); save(STORAGE.notifications,portalNotifications); renderNotificationBadge(); return n;
}
function notificationVisibleToMe(n){ return n.target==="all" || n.target===currentAgentId() || n.target==="supervision"; }
function notificationIsRead(n){ return n.readBy?.includes(currentAgentId()||profile.name); }
function markNotificationRead(id){ const n=portalNotifications.find(x=>x.id===id); if(!n)return; const who=currentAgentId()||profile.name; n.readBy=n.readBy||[]; if(!n.readBy.includes(who))n.readBy.push(who); save(STORAGE.notifications,portalNotifications); renderNotificationBadge(); }
function renderNotificationBadge(){
  const unread=portalNotifications.filter(n=>notificationVisibleToMe(n)&&!notificationIsRead(n)).length;
  const materialPending=materialRequests.filter(r=>r.status!=="Délivrée").length;
  const count=unread+materialPending;
  const el=$("#materialNotificationCount"); if(el)el.textContent=count;
  $("#materialNotificationsBtn")?.classList.toggle("has-alert",count>0);
}
function notificationIcon(type){ return type==="event"?"📅":type==="convocation"?"📨":type==="material"?"📦":"🔔"; }
function renderNotificationsCenter(){
  const list=portalNotifications.filter(notificationVisibleToMe).filter(n=>notificationFilter==="all"||n.type===notificationFilter);
  $("#notificationsCenterList").innerHTML=list.length?list.map(n=>`<article class="notification-item ${notificationIsRead(n)?'':'unread'}" data-notification-id="${n.id}"><div class="notification-icon">${notificationIcon(n.type)}</div><div class="notification-body"><div class="notification-title-row"><strong>${escapeHtml(n.title)}</strong><span>${formatDate(n.createdAt)}</span></div><p>${escapeHtml(n.message||"")}</p><div class="notification-meta">${n.discord?'<span class="badge">Discord prévu</span>':''}${!notificationIsRead(n)?'<span class="badge gold">Non lue</span>':'<span class="badge">Lue</span>'}</div></div><div class="notification-actions">${n.type==='convocation'?`<button class="secondary-btn" data-open-convocation="${escapeHtml(n.entityId||'')}">Consulter</button>`:''}${n.linkView?`<button class="secondary-btn" data-notification-view="${n.linkView}">Ouvrir</button>`:''}</div></article>`).join(""):'<div class="empty-state">Aucune notification.</div>';
  $$('[data-notification-id]').forEach(el=>el.onclick=(e)=>{ if(e.target.closest('button'))return; markNotificationRead(el.dataset.notificationId); renderNotificationsCenter(); });
  $$('[data-notification-view]').forEach(b=>b.onclick=()=>{const card=b.closest('[data-notification-id]');if(card)markNotificationRead(card.dataset.notificationId);closeModal('notificationsCenterModal');document.querySelector(`[data-view="${b.dataset.notificationView}"]`)?.click();});
  $$('[data-open-convocation]').forEach(b=>b.onclick=()=>{const card=b.closest('[data-notification-id]');if(card)markNotificationRead(card.dataset.notificationId);openConvocationDetail(b.dataset.openConvocation);});
}
$("#materialNotificationsBtn").onclick=()=>{renderNotificationsCenter();openModal("notificationsCenterModal")};
$("#markAllNotificationsRead")?.addEventListener("click",()=>{const who=currentAgentId()||profile.name;portalNotifications.filter(notificationVisibleToMe).forEach(n=>{n.readBy=n.readBy||[];if(!n.readBy.includes(who))n.readBy.push(who)});save(STORAGE.notifications,portalNotifications);renderNotificationsCenter();renderNotificationBadge();});
$$('[data-notification-filter]').forEach(b=>b.onclick=()=>{notificationFilter=b.dataset.notificationFilter;$$('[data-notification-filter]').forEach(x=>x.classList.toggle('active',x===b));renderNotificationsCenter();});

function materialStatusClass(status){ return status==="En attente"?"red":status==="Prise en charge"?"gold":"green"; }
function materialAgentMeta(r){ const a=r.agentId?agentById(r.agentId):supAgents.find(x=>x.name===r.agent); return a?`${a.rank} • #${a.badge}`:r.rank||"Agent"; }
function materialItemsTotal(r){ return (r.items||[]).reduce((n,x)=>n+Number(x.qty||0),0); }
function setMaterialStatus(id,status){
  const r=materialRequests.find(x=>x.id===id); if(!r)return;
  r.status=status; r.updatedAt=new Date().toISOString();
  if(status==="Prise en charge"){r.handledBy=profile.name;r.handledAt=r.updatedAt;}
  if(status==="Délivrée"){r.deliveredBy=profile.name;r.deliveredAt=r.updatedAt;}
  save(STORAGE.materialRequests,materialRequests);
  createPortalNotification({type:"material",title:`Demande matériel — ${status}`,message:`${r.agent} • ${materialItemsTotal(r)} article(s)`,target:r.agentId||"all",discord:false,entityId:r.id});
  renderMaterialManagement();renderMaterialNotifications();renderNotificationBadge();
}
function renderMaterialRequestCard(r){
  return `<article class="material-request-card"><div class="request-head"><div><strong>${escapeHtml(r.agent)}</strong><div class="muted">${escapeHtml(materialAgentMeta(r))} • ${formatDate(r.date)}</div></div><span class="badge ${materialStatusClass(r.status)}">${escapeHtml(r.status)}</span></div><ul class="request-items">${(r.items||[]).map(x=>`<li><strong>${x.qty} ×</strong> ${escapeHtml(x.item)}</li>`).join("")}</ul>${r.handledBy?`<div class="request-trace"><span>Pris en charge par <strong>${escapeHtml(r.handledBy)}</strong>${r.handledAt?` • ${formatDate(r.handledAt)}`:''}</span>${r.deliveredBy?`<span>Délivré par <strong>${escapeHtml(r.deliveredBy)}</strong> • ${formatDate(r.deliveredAt)}</span>`:''}</div>`:''}<div class="request-actions">${r.status==="En attente"?`<button class="secondary-btn" data-material-manage="${r.id}|Prise en charge">Prendre en charge</button>`:""}${r.status==="Prise en charge"?`<button class="primary-btn" data-material-manage="${r.id}|Délivrée">Marquer comme délivrée</button>`:""}</div></article>`;
}
function renderMaterialManagement(){
  if(!$("#materialManagementList"))return;
  const q=($("#materialManagementSearch")?.value||"").toLowerCase(), status=$("#materialManagementStatus")?.value||"";
  const today=new Date().toISOString().slice(0,10);
  $("#matPendingCount").textContent=materialRequests.filter(r=>r.status==="En attente").length;
  $("#matHandlingCount").textContent=materialRequests.filter(r=>r.status==="Prise en charge").length;
  $("#matDeliveredTodayCount").textContent=materialRequests.filter(r=>r.status==="Délivrée"&&(r.deliveredAt||r.updatedAt||r.date||"").slice(0,10)===today).length;
  $("#matItemsCount").textContent=materialRequests.reduce((n,r)=>n+materialItemsTotal(r),0);
  const list=materialRequests.filter(r=>(!status||r.status===status)&&[r.agent,r.rank,materialAgentMeta(r),...(r.items||[]).map(x=>x.item)].join(" ").toLowerCase().includes(q));
  $("#matVisibleCount").textContent=`${list.length} demande${list.length>1?'s':''}`;
  $("#materialManagementList").innerHTML=list.length?list.map(renderMaterialRequestCard).join(""):'<div class="empty-state">Aucune demande correspondant aux filtres.</div>';
  $$('[data-material-manage]').forEach(b=>b.onclick=()=>{const [id,status]=b.dataset.materialManage.split('|');setMaterialStatus(id,status)});
}
$("#materialManagementSearch")?.addEventListener("input",renderMaterialManagement);
$("#materialManagementStatus")?.addEventListener("change",renderMaterialManagement);

// Remplace l'ancien rendu de la cloche : la supervision conserve un aperçu rapide des demandes.
renderMaterialNotifications = function(){
  const box=$("#materialNotificationsList");
  if(box){box.innerHTML=materialRequests.length?materialRequests.map(renderMaterialRequestCard).join(""):'<div class="empty-state">Aucune demande de matériel.</div>';$$('[data-material-manage]').forEach(b=>b.onclick=()=>{const [id,status]=b.dataset.materialManage.split('|');setMaterialStatus(id,status)});}
  renderNotificationBadge(); renderMaterialManagement();
};

function openConvocationForm(agentId){
  const a=agentById(agentId);if(!a)return;
  $("#convocationForm").reset();$("#convocationAgentId").value=a.id;$("#convocationMandatory").checked=true;$("#convocationSite").checked=true;$("#convocationDiscord").checked=true;
  $("#convocationAgentSummary").innerHTML=`<strong>#${escapeHtml(a.badge)} ・ ${escapeHtml(a.name)}</strong><div class="muted small">${escapeHtml(a.rank)} ・ ${escapeHtml(a.division)}</div>`;
  openModal("convocationModal");
}
function nextConvocationId(){const y=new Date().getFullYear(), nums=convocations.filter(c=>c.id?.startsWith(`CONV-${y}-`)).map(c=>Number(c.id.split('-').pop())).filter(Number.isFinite);return `CONV-${y}-${String((Math.max(0,...nums)+1)).padStart(4,'0')}`;}
function renderAgentConvocations(agentId){
  const list=convocations.filter(c=>c.agentId===agentId).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  return `<div class="convocation-profile-head"><button class="primary-btn" data-convoke-agent="${agentId}">+ Nouvelle convocation</button></div>${list.length?list.map(c=>`<article class="convocation-mini"><div><span class="badge ${c.priority==='Urgente'?'red':c.priority==='Importante'?'gold':''}">${escapeHtml(c.priority)}</span><strong>${escapeHtml(c.reason)}</strong><small>${formatDate(c.createdAt)} • ${escapeHtml(c.status)}</small></div><button class="secondary-btn" data-view-convocation="${c.id}">Ouvrir</button></article>`).join(''):'<div class="empty-state">Aucune convocation pour cet agent.</div>'}`;
}
$("#convocationForm")?.addEventListener("submit",e=>{
  e.preventDefault();const a=agentById($("#convocationAgentId").value);if(!a)return;
  const c={id:nextConvocationId(),agentId:a.id,agent:a.name,badge:a.badge,rank:a.rank,reason:$("#convocationReason").value.trim(),priority:$("#convocationPriority").value,note:$("#convocationNote").value.trim(),mandatory:$("#convocationMandatory").checked,notifySite:$("#convocationSite").checked,notifyDiscord:$("#convocationDiscord").checked,issuer:profile.name,issuerRank:profile.rank,createdAt:new Date().toISOString(),status:"Émise",availability:[],availabilityComment:"",meeting:null};
  convocations.unshift(c);save(STORAGE.convocations,convocations);
  if(c.notifySite)createPortalNotification({type:"convocation",title:`Convocation officielle — ${c.reason}`,message:`Émise par ${c.issuer} • Merci de transmettre vos disponibilités.`,target:a.id,discord:c.notifyDiscord,entityId:c.id});
  closeModal("convocationModal");alert(`Convocation ${c.id} émise.${c.notifyDiscord?'\nLa notification Discord sera envoyée une fois Firebase / le bot connecté.':''}`);renderAgentManagement();
});
function convocationDocument(c){
  return `<div class="official-doc-header"><div class="official-star">★</div><div><strong>BLAINE COUNTY SHERIFF’S OFFICE</strong><span>Convocation Officielle</span></div></div><div class="official-doc-meta"><p><strong>À l’attention de :</strong> ${escapeHtml(c.agent)} / #${escapeHtml(c.badge)}</p><p><strong>Grade :</strong> ${escapeHtml(c.rank)}</p></div><h3>Objet : Convocation officielle – ${escapeHtml(c.reason)}</h3><p>Madame, Monsieur,</p><p>Vous êtes convoqué(e) par le <strong>Blaine County Sheriff’s Office</strong>.</p><div class="official-callout">Merci de créer un fil et de donner vos disponibilités.</div><p>Votre présence est <strong>${c.mandatory?'obligatoire':'requise'}</strong>.<br>En cas d’empêchement majeur, merci de prévenir dans les plus brefs délais un supérieur hiérarchique.</p><p>Nous vous rappelons que cette convocation s’inscrit dans un cadre professionnel et que toute absence injustifiée pourra faire l’objet de mesures disciplinaires.</p>${c.note?`<p><strong>Information complémentaire :</strong><br>${escapeHtml(c.note)}</p>`:''}<p>Dans l’attente de votre présence,</p><p><strong>${escapeHtml(c.issuer)} / ${escapeHtml(c.issuerRank)}</strong><br>Blaine County Sheriff’s Office</p><hr><em>Document officiel – BCSO</em>`;
}
function openConvocationDetail(id){
  const c=convocations.find(x=>x.id===id);if(!c)return;
  const isRecipient=c.agentId===currentAgentId();
  $("#convocationDetailContent").innerHTML=`${convocationDocument(c)}<div class="convocation-status-strip"><span class="badge gold">${escapeHtml(c.status)}</span><span>${c.notifyDiscord?'🔔 Discord prévu':'Portail uniquement'}</span></div>${c.availability?.length?`<div class="availability-read"><h3>Disponibilités proposées</h3>${c.availability.map(x=>`<div>${shortDate(x.date+'T12:00:00')} • ${escapeHtml(x.start)} → ${escapeHtml(x.end)} ${c.meeting===x.id?'<span class="badge green">Retenu</span>':''}${!isRecipient&&!c.meeting?`<button class="secondary-btn" data-select-meeting="${x.id}">Retenir</button>`:''}</div>`).join('')}${c.availabilityComment?`<p class="muted">${escapeHtml(c.availabilityComment)}</p>`:''}</div>`:''}<div class="modal-actions">${isRecipient?`<button class="primary-btn" data-give-availability="${c.id}">Donner mes disponibilités</button>`:''}<button class="secondary-btn" data-close="convocationDetailModal">Fermer</button></div>`;
  $$('[data-close="convocationDetailModal"]').forEach(b=>b.onclick=()=>closeModal('convocationDetailModal'));
  $$('[data-give-availability]').forEach(b=>b.onclick=()=>{closeModal('convocationDetailModal');openAvailabilityForm(b.dataset.giveAvailability)});
  $$('[data-select-meeting]').forEach(b=>b.onclick=()=>{c.meeting=b.dataset.selectMeeting;c.status='Rendez-vous fixé';save(STORAGE.convocations,convocations);createPortalNotification({type:'convocation',title:`Rendez-vous fixé — ${c.reason}`,message:'La supervision a retenu un de vos créneaux.',target:c.agentId,discord:c.notifyDiscord,entityId:c.id});openConvocationDetail(c.id)});
  openModal("convocationDetailModal");
}
function addAvailabilityRow(date="",start="",end=""){$("#availabilitySlots").insertAdjacentHTML('beforeend',`<div class="availability-row"><input type="date" value="${date}" required><input type="time" value="${start}" required><span>→</span><input type="time" value="${end}" required><button type="button" class="danger-outline availability-remove">×</button></div>`);$$('.availability-remove').forEach(b=>b.onclick=()=>b.closest('.availability-row').remove());}
function openAvailabilityForm(id){const c=convocations.find(x=>x.id===id);if(!c)return;$("#availabilityConvocationId").value=id;$("#availabilitySlots").innerHTML='';(c.availability?.length?c.availability:[{}]).forEach(x=>addAvailabilityRow(x.date||'',x.start||'',x.end||''));$("#availabilityComment").value=c.availabilityComment||'';openModal('availabilityModal');}
$("#addAvailabilitySlot")?.addEventListener('click',()=>addAvailabilityRow());
$("#availabilityForm")?.addEventListener('submit',e=>{e.preventDefault();const c=convocations.find(x=>x.id===$("#availabilityConvocationId").value);if(!c)return;const rows=$$('#availabilitySlots .availability-row');c.availability=rows.map((r,i)=>({id:`slot-${Date.now()}-${i}`,date:r.querySelectorAll('input')[0].value,start:r.querySelectorAll('input')[1].value,end:r.querySelectorAll('input')[2].value}));c.availabilityComment=$("#availabilityComment").value.trim();c.status='Disponibilités reçues';save(STORAGE.convocations,convocations);createPortalNotification({type:'convocation',title:`Disponibilités reçues — ${c.agent}`,message:`${c.availability.length} créneau(x) proposé(s) pour ${c.reason}.`,target:'supervision',discord:false,entityId:c.id});closeModal('availabilityModal');alert('Vos disponibilités ont été transmises à la supervision.');});

// Délégation pour les convocations rendues dans les fiches agents.
document.addEventListener('click',e=>{
  const v=e.target.closest('[data-view-convocation]');if(v){openConvocationDetail(v.dataset.viewConvocation);return;}
  const c=e.target.closest('[data-convoke-agent]');if(c&&!c.closest('#agentProfileContent')){openConvocationForm(c.dataset.convokeAgent);}
});

// Les nouvelles demandes de matériel créent aussi une notification supervision.
const originalStartDutyWithRequest = $("#startDutyWithRequest")?.onclick;
if($("#startDutyWithRequest")) $("#startDutyWithRequest").onclick=()=>{
  if(!materialDraft.length){alert("Sélectionnez au moins un équipement manquant ou utilisez « J'ai tout mon équipement ».");return;}
  const me=getPersonalAgent();
  const req={id:`MAT-${Date.now()}`,agentId:me?.id||null,agent:profile.name,rank:profile.rank,date:new Date().toISOString(),items:materialDraft.map(x=>({...x})),status:"En attente"};
  materialRequests.unshift(req);save(STORAGE.materialRequests,materialRequests);
  createPortalNotification({type:'material',title:`Nouvelle demande matériel — ${profile.name}`,message:`${materialItemsTotal(req)} article(s) demandé(s).`,target:'supervision',discord:true,entityId:req.id});
  renderMaterialNotifications();beginDuty();
};

// Rafraîchir les pages ajoutées lors de la navigation.
$$('.nav-item').forEach(btn=>btn.addEventListener('click',()=>{if(btn.dataset.view==='materialManagement')renderMaterialManagement();}));
renderMaterialNotifications();renderNotificationsCenter();renderNotificationBadge();

// ===== GESTION DYNAMIQUE DU SITE =====
const SITE_STORAGE={categories:'bcso_site_categories',pages:'bcso_site_pages',settings:'bcso_site_settings',audit:'bcso_site_audit',preview:'bcso_site_preview'};
let siteCategories=load(SITE_STORAGE.categories,[]),sitePages=load(SITE_STORAGE.pages,[]),siteSettings=load(SITE_STORAGE.settings,{portalName:'BCSO',subtitle:"Blaine County Sheriff's Office",notice:''}),siteAudit=load(SITE_STORAGE.audit,[]),sitePreview=load(SITE_STORAGE.preview,false);
const COMMAND_RANKS=['Captain','Commander','Undersheriff','Sheriff'];
function siteSlug(v){return String(v||'page').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,50)||'page'}
function uid(prefix){return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`}
function auditSite(action,detail){siteAudit.unshift({id:uid('AUD'),action,detail,by:profile.name,at:new Date().toISOString()});siteAudit=siteAudit.slice(0,80);save(SITE_STORAGE.audit,siteAudit)}
function canManageSite(){return Boolean(window.BCSO_AUTH?.claims?.siteManager) || COMMAND_RANKS.includes(profile.rank)}
function splitRoles(v){return String(v||'').split(',').map(x=>x.trim()).filter(Boolean)}
function siteTemplateLabel(t){return ({documentation:'Documentation',table:'Tableau / Registre',form:'Formulaire',dashboard:'Dashboard',custom:'Page personnalisée'})[t]||t}
function siteStatusBadge(s){return `<span class="badge ${s==='published'?'green':'gold'}">${s==='published'?'Publié':'Brouillon'}</span>`}
function applySiteSettings(){
  const brandStrong=document.querySelector('.brand strong'),brandSub=document.querySelector('.brand span');
  if(brandStrong)brandStrong.textContent=siteSettings.portalName||'BCSO'; if(brandSub)brandSub.textContent=siteSettings.subtitle||"Blaine County Sheriff's Office";
  const n=document.getElementById('sitePortalName'),s=document.getElementById('sitePortalSubtitle'),m=document.getElementById('sitePortalNotice'); if(n)n.value=siteSettings.portalName||'';if(s)s.value=siteSettings.subtitle||'';if(m)m.value=siteSettings.notice||'';
}
function renderDynamicPageBody(page){
  const lines=String(page.content||'').split('\n').map(x=>x.trim()).filter(Boolean);
  if(page.template==='dashboard'){
    const stats=lines.map(x=>{const [label,...rest]=x.split('|');return {label:label||'Indicateur',value:rest.join('|')||'—'}});
    return `<div class="dynamic-dashboard">${(stats.length?stats:[{label:'Indicateur',value:'—'}]).map(x=>`<article class="dynamic-stat"><span>${escapeHtml(x.label)}</span><strong>${escapeHtml(x.value)}</strong></article>`).join('')}</div>`;
  }
  if(page.template==='table'){
    const rows=lines.map(x=>x.split('|').map(c=>c.trim())); const head=rows.shift()||['Colonne 1','Colonne 2'];
    return `<div class="dynamic-table-wrap"><table class="dynamic-table"><thead><tr>${head.map(c=>`<th>${escapeHtml(c)}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.map(r=>`<tr>${head.map((_,i)=>`<td>${escapeHtml(r[i]||'')}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${head.length}" class="muted">Aucune donnée.</td></tr>`}</tbody></table></div>`;
  }
  if(page.template==='form'){
    const fields=lines.map((x,i)=>{const [label,type='text',opts='']=x.split('|').map(v=>v.trim());let control='';if(type==='textarea')control=`<textarea rows="4"></textarea>`;else if(type==='select')control=`<select><option value="">Sélectionner…</option>${opts.split(';').filter(Boolean).map(o=>`<option>${escapeHtml(o)}</option>`).join('')}</select>`;else if(type==='date')control='<input type="date">';else if(type==='number')control='<input type="number">';else control='<input type="text">';return `<label>${escapeHtml(label||`Champ ${i+1}`)}${control}</label>`});
    return `<form class="dynamic-form" onsubmit="event.preventDefault();alert('Formulaire de démonstration — le stockage sera relié à Firebase.')">${fields.join('')||'<p class="muted">Ajoutez des champs depuis Gestion du site.</p>'}<button class="primary-btn" type="submit">Enregistrer</button></form>`;
  }
  const paras=String(page.content||'').split(/\n\s*\n/).filter(x=>x.trim());
  return `<div class="dynamic-doc">${(paras.length?paras:['Aucun contenu pour le moment.']).map(p=>`<p>${escapeHtml(p.trim())}</p>`).join('')}</div>`;
}
function dynamicViewHtml(page,preview=false){return `<div class="dynamic-view-header"><div><p class="eyebrow">${escapeHtml(siteCategories.find(c=>c.id===page.categoryId)?.name||'Portail')}</p><h2>${escapeHtml(page.title)}</h2>${page.description?`<p class="dynamic-page-description">${escapeHtml(page.description)}</p>`:''}</div>${preview||page.status==='draft'?'<span class="dynamic-draft-badge">APERÇU / BROUILLON</span>':''}</div>${renderDynamicPageBody(page)}`}
function openDynamicView(viewId){
  $$('.nav-item').forEach(b=>b.classList.remove('active')); const btn=document.querySelector(`[data-view="${CSS.escape(viewId)}"]`);btn?.classList.add('active');
  $$('.view').forEach(v=>v.classList.remove('active')); const v=document.getElementById(`view-${viewId}`);if(v)v.classList.add('active');
  const page=sitePages.find(p=>`dyn-${p.id}`===viewId);if(page)$('#pageTitle').textContent=page.title;$('#sidebar')?.classList.remove('open');
}
function renderDynamicSite(){
  const mount=$('#dynamicSidebarMount'); if(!mount)return;
  $$('.dynamic-generated-view').forEach(v=>v.remove());
  const cats=siteCategories.slice().sort((a,b)=>(a.order||999)-(b.order||999));
  mount.innerHTML=cats.filter(c=>c.status==='published'||sitePreview).map(c=>{
    const pages=sitePages.filter(p=>p.categoryId===c.id&&(p.status==='published'||sitePreview)).sort((a,b)=>(a.order||999)-(b.order||999));
    if(!pages.length&&!sitePreview)return '';
    return `<div class="dynamic-sidebar-section ${c.status==='draft'?'draft-preview':''}" data-dynamic-category="${c.id}"><button class="nav-label nav-section-toggle dynamic-toggle" type="button" aria-expanded="true"><span>${escapeHtml(c.icon||'◈')} ${escapeHtml(c.name.toUpperCase())}</span><span class="nav-section-chevron">⌄</span></button><nav class="nav nav-section dynamic-nav">${pages.map(p=>`<button class="nav-item" data-view="dyn-${p.id}"><span>${escapeHtml(p.icon||'•')}</span><span>${escapeHtml(p.title)}</span></button>`).join('')||'<div class="site-empty-pages">Aucune page publiée</div>'}</nav></div>`;
  }).join('');
  cats.forEach(c=>sitePages.filter(p=>p.categoryId===c.id&&(p.status==='published'||sitePreview)).forEach(p=>{
    const sec=document.createElement('section');sec.className='view dynamic-generated-view';sec.id=`view-dyn-${p.id}`;sec.innerHTML=dynamicViewHtml(p,p.status==='draft');document.querySelector('.main')?.appendChild(sec);
  }));
  mount.querySelectorAll('.dynamic-toggle').forEach(t=>t.onclick=()=>{const nav=t.nextElementSibling,open=t.getAttribute('aria-expanded')==='true';t.setAttribute('aria-expanded',String(!open));nav.style.display=open?'none':'';t.querySelector('.nav-section-chevron').textContent=open?'›':'⌄'});
  mount.querySelectorAll('.nav-item').forEach(b=>b.onclick=()=>openDynamicView(b.dataset.view));
}
function refreshSiteManager(){
  if(!$('#siteStructureList'))return; const cats=siteCategories.slice().sort((a,b)=>(a.order||999)-(b.order||999));
  $('#siteCategoryCount').textContent=cats.length;$('#sitePublishedCount').textContent=sitePages.filter(p=>p.status==='published').length;$('#siteDraftCount').textContent=sitePages.filter(p=>p.status==='draft').length+siteCategories.filter(c=>c.status==='draft').length;$('#siteAuditCount').textContent=siteAudit.length;
  $('#sitePreviewToggle').classList.toggle('site-preview-active',sitePreview);$('#sitePreviewToggle').textContent=sitePreview?'👁 Aperçu activé':'👁 Aperçu public';
  $('#siteStructureList').innerHTML=cats.length?cats.map((c,ci)=>{const pages=sitePages.filter(p=>p.categoryId===c.id).sort((a,b)=>(a.order||999)-(b.order||999));return `<article class="site-category-block"><div class="site-category-head"><div class="site-category-title"><span class="site-category-icon">${escapeHtml(c.icon||'◈')}</span><div><strong>${escapeHtml(c.name)}</strong><small>${c.type==='specialization'?'Spécialisation':'Catégorie générale'} • ${(c.roles||[]).length?escapeHtml(c.roles.join(', ')):'Tous les agents'} ${c.commandAccess?'• État-major inclus':''}</small></div></div><div class="site-inline-actions">${siteStatusBadge(c.status)}<button class="secondary-btn" data-cat-up="${c.id}" ${ci===0?'disabled':''}>↑</button><button class="secondary-btn" data-cat-down="${c.id}" ${ci===cats.length-1?'disabled':''}>↓</button><button class="secondary-btn" data-edit-cat="${c.id}">Modifier</button><button class="danger-outline" data-delete-cat="${c.id}">Supprimer</button></div></div><div class="site-page-list">${pages.length?pages.map((p,pi)=>`<div class="site-page-row"><div class="site-page-main"><span>${escapeHtml(p.icon||'•')}</span><div><strong>${escapeHtml(p.title)}</strong><small>${siteTemplateLabel(p.template)} • ${p.status==='published'?'Publié':'Brouillon'}</small></div></div><div class="site-inline-actions"><button class="secondary-btn" data-page-up="${p.id}" ${pi===0?'disabled':''}>↑</button><button class="secondary-btn" data-page-down="${p.id}" ${pi===pages.length-1?'disabled':''}>↓</button><button class="secondary-btn" data-preview-page="${p.id}">Voir</button><button class="secondary-btn" data-edit-page="${p.id}">Modifier</button><button class="danger-outline" data-delete-page="${p.id}">Supprimer</button></div></div>`).join(''):'<div class="site-empty-pages">Aucune page. Utilisez « Nouvelle page » pour commencer.</div>'}</div></article>`}).join(''):'<div class="empty-state">Aucune catégorie dynamique. Créez votre première spécialisation ou catégorie.</div>';
  $('#siteAuditList').innerHTML=siteAudit.length?siteAudit.slice(0,10).map(a=>`<div class="site-audit-item"><strong>${escapeHtml(a.action)} — ${escapeHtml(a.detail)}</strong><span>${escapeHtml(a.by)} • ${formatDate(a.at)}</span></div>`).join(''):'<div class="muted">Aucune modification enregistrée.</div>';
  applySiteSettings(); bindSiteManagerActions(); renderDynamicSite();
}
function fillCategorySelect(selected=''){$('#sitePageCategory').innerHTML=siteCategories.length?siteCategories.slice().sort((a,b)=>(a.order||999)-(b.order||999)).map(c=>`<option value="${c.id}" ${c.id===selected?'selected':''}>${escapeHtml(c.name)}</option>`).join(''):'<option value="">Créez d’abord une catégorie</option>'}
function openSiteCategory(id=null){const c=id?siteCategories.find(x=>x.id===id):null;$('#siteCategoryForm').reset();$('#siteCategoryId').value=c?.id||'';$('#siteCategoryModalTitle').textContent=c?'Modifier la catégorie':'Nouvelle catégorie';$('#siteCategoryName').value=c?.name||'';$('#siteCategoryIcon').value=c?.icon||'';$('#siteCategoryType').value=c?.type||'specialization';$('#siteCategoryStatus').value=c?.status||'draft';$('#siteCategoryRoles').value=(c?.roles||[]).join(', ');$('#siteCategoryCommandAccess').checked=c?.commandAccess!==false;openModal('siteCategoryModal')}
function openSitePage(id=null){if(!siteCategories.length){alert('Créez d’abord une catégorie.');openSiteCategory();return}const p=id?sitePages.find(x=>x.id===id):null;$('#sitePageForm').reset();$('#sitePageId').value=p?.id||'';$('#sitePageModalTitle').textContent=p?'Modifier la page':'Nouvelle page';$('#sitePageTitleInput').value=p?.title||'';$('#sitePageIcon').value=p?.icon||'';fillCategorySelect(p?.categoryId||siteCategories[0].id);$('#sitePageTemplate').value=p?.template||'documentation';$('#sitePageStatus').value=p?.status||'draft';$('#sitePageOrder').value=p?.order||Math.max(1,sitePages.filter(x=>x.categoryId===(p?.categoryId||siteCategories[0].id)).length+1);$('#sitePageDescription').value=p?.description||'';$('#sitePageContent').value=p?.content||'';updateTemplateHelp();openModal('sitePageModal')}
function updateTemplateHelp(){const t=$('#sitePageTemplate')?.value;if(!t)return;const h={documentation:'Texte libre. Séparez les blocs avec une ligne vide.',table:'Première ligne = colonnes séparées par |. Lignes suivantes = données. Exemple : Agent | Grade | Statut',form:'Un champ par ligne : Libellé | type. Types : text, textarea, date, number, select. Pour select : Libellé | select | Option 1;Option 2',dashboard:'Une statistique par ligne : Libellé | Valeur. Exemple : Agents actifs | 24',custom:'Texte libre présenté en blocs sécurisés.'};$('#siteTemplateHelp').textContent=h[t]||''}
function previewPageObject(p){$('#sitePagePreviewContent').innerHTML=dynamicViewHtml(p,true);openModal('sitePagePreviewModal')}
function pageFromForm(){return {id:$('#sitePageId').value||uid('PAGE'),title:$('#sitePageTitleInput').value.trim(),icon:$('#sitePageIcon').value.trim()||'📄',categoryId:$('#sitePageCategory').value,template:$('#sitePageTemplate').value,status:$('#sitePageStatus').value,order:Number($('#sitePageOrder').value)||1,description:$('#sitePageDescription').value.trim(),content:$('#sitePageContent').value,updatedAt:new Date().toISOString()}}
function reorder(list,id,dir,filter=()=>true){const subset=list.filter(filter).sort((a,b)=>(a.order||999)-(b.order||999)),i=subset.findIndex(x=>x.id===id),j=i+dir;if(i<0||j<0||j>=subset.length)return;[subset[i].order,subset[j].order]=[subset[j].order||j+1,subset[i].order||i+1]}
function bindSiteManagerActions(){
  $$('[data-edit-cat]').forEach(b=>b.onclick=()=>openSiteCategory(b.dataset.editCat));$$('[data-edit-page]').forEach(b=>b.onclick=()=>openSitePage(b.dataset.editPage));$$('[data-preview-page]').forEach(b=>b.onclick=()=>{const p=sitePages.find(x=>x.id===b.dataset.previewPage);if(p)previewPageObject(p)});
  $$('[data-delete-cat]').forEach(b=>b.onclick=()=>{const c=siteCategories.find(x=>x.id===b.dataset.deleteCat);if(!c||!confirm(`Supprimer « ${c.name} » et toutes ses pages ?`))return;siteCategories=siteCategories.filter(x=>x.id!==c.id);sitePages=sitePages.filter(x=>x.categoryId!==c.id);save(SITE_STORAGE.categories,siteCategories);save(SITE_STORAGE.pages,sitePages);auditSite('Catégorie supprimée',c.name);refreshSiteManager()});
  $$('[data-delete-page]').forEach(b=>b.onclick=()=>{const p=sitePages.find(x=>x.id===b.dataset.deletePage);if(!p||!confirm(`Supprimer la page « ${p.title} » ?`))return;sitePages=sitePages.filter(x=>x.id!==p.id);save(SITE_STORAGE.pages,sitePages);auditSite('Page supprimée',p.title);refreshSiteManager()});
  $$('[data-cat-up]').forEach(b=>b.onclick=()=>{reorder(siteCategories,b.dataset.catUp,-1);save(SITE_STORAGE.categories,siteCategories);auditSite('Ordre modifié','Catégories');refreshSiteManager()});$$('[data-cat-down]').forEach(b=>b.onclick=()=>{reorder(siteCategories,b.dataset.catDown,1);save(SITE_STORAGE.categories,siteCategories);auditSite('Ordre modifié','Catégories');refreshSiteManager()});
  $$('[data-page-up]').forEach(b=>b.onclick=()=>{const p=sitePages.find(x=>x.id===b.dataset.pageUp);if(!p)return;reorder(sitePages,p.id,-1,x=>x.categoryId===p.categoryId);save(SITE_STORAGE.pages,sitePages);auditSite('Ordre modifié',p.title);refreshSiteManager()});$$('[data-page-down]').forEach(b=>b.onclick=()=>{const p=sitePages.find(x=>x.id===b.dataset.pageDown);if(!p)return;reorder(sitePages,p.id,1,x=>x.categoryId===p.categoryId);save(SITE_STORAGE.pages,sitePages);auditSite('Ordre modifié',p.title);refreshSiteManager()});
}
$('#newSiteCategoryBtn')?.addEventListener('click',()=>openSiteCategory());$('#newSitePageBtn')?.addEventListener('click',()=>openSitePage());$('#sitePageTemplate')?.addEventListener('change',updateTemplateHelp);
$('#siteCategoryForm')?.addEventListener('submit',e=>{e.preventDefault();const id=$('#siteCategoryId').value||uid('CAT'),existing=siteCategories.find(c=>c.id===id),obj={id,name:$('#siteCategoryName').value.trim(),icon:$('#siteCategoryIcon').value.trim()||'◈',type:$('#siteCategoryType').value,status:$('#siteCategoryStatus').value,roles:splitRoles($('#siteCategoryRoles').value),commandAccess:$('#siteCategoryCommandAccess').checked,order:existing?.order||siteCategories.length+1,updatedAt:new Date().toISOString()};if(existing)Object.assign(existing,obj);else siteCategories.push(obj);save(SITE_STORAGE.categories,siteCategories);auditSite(existing?'Catégorie modifiée':'Catégorie créée',obj.name);closeModal('siteCategoryModal');refreshSiteManager()});
$('#sitePageForm')?.addEventListener('submit',e=>{e.preventDefault();const obj=pageFromForm(),existing=sitePages.find(p=>p.id===obj.id);if(existing)Object.assign(existing,obj);else sitePages.push(obj);save(SITE_STORAGE.pages,sitePages);auditSite(existing?'Page modifiée':'Page créée',obj.title);closeModal('sitePageModal');refreshSiteManager()});
$('#previewSitePageBtn')?.addEventListener('click',()=>previewPageObject(pageFromForm()));
$('#sitePreviewToggle')?.addEventListener('click',()=>{sitePreview=!sitePreview;save(SITE_STORAGE.preview,sitePreview);refreshSiteManager()});
$('#saveSiteSettings')?.addEventListener('click',()=>{siteSettings={portalName:$('#sitePortalName').value.trim()||'BCSO',subtitle:$('#sitePortalSubtitle').value.trim()||"Blaine County Sheriff's Office",notice:$('#sitePortalNotice').value.trim()};save(SITE_STORAGE.settings,siteSettings);auditSite('Paramètres modifiés',siteSettings.portalName);refreshSiteManager();alert('Paramètres du portail enregistrés.')});
// Rafraîchissement à l'ouverture de la page Gestion du site.
document.querySelector('[data-view="siteManagement"]')?.addEventListener('click',refreshSiteManager);
applySiteSettings();renderDynamicSite();refreshSiteManager();


// Force mouse-wheel / trackpad scrolling on the fixed sidebar.
const sidebarWheelTarget = document.querySelector("#sidebar");
if (sidebarWheelTarget && !sidebarWheelTarget.dataset.wheelScrollBound) {
  sidebarWheelTarget.dataset.wheelScrollBound = "true";
  sidebarWheelTarget.addEventListener("wheel", (event) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    const maxScroll = sidebarWheelTarget.scrollHeight - sidebarWheelTarget.clientHeight;
    if (maxScroll <= 0) return;
    event.preventDefault();
    sidebarWheelTarget.scrollTop += event.deltaY;
  }, { passive: false });
}
