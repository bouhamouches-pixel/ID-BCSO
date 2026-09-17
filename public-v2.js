
(()=>{
  const publicSite=document.getElementById("publicSite");
  const proShell=document.getElementById("proShell");
  const login=document.getElementById("publicProLogin");
  const back=document.getElementById("backPublicBtn");
  const authStatus=document.getElementById("authStatus");

  function route(name){
    document.querySelectorAll(".public-view").forEach(x=>x.classList.remove("active"));
    document.getElementById("public-"+name)?.classList.add("active");
    document.querySelectorAll(".public-nav [data-public-route]").forEach(x=>x.classList.toggle("active",x.dataset.publicRoute===name));
    window.scrollTo({top:0,behavior:"smooth"});
  }
  document.querySelectorAll("[data-public-route]").forEach(b=>b.addEventListener("click",e=>{e.preventDefault();route(b.dataset.publicRoute)}));

  function showPublic(){
    publicSite.style.display="";
    proShell?.classList.remove("pro-visible");
    history.replaceState(null,"","#accueil");
  }
  function showPro(){
    publicSite.style.display="none";
    proShell?.classList.add("pro-visible");
    history.replaceState(null,"","#pro");
  }
  back?.addEventListener("click",showPublic);

  // Reuse the already tested Discord/Firebase auth layer from the professional portal.
  // auth-ui.js exposes the login button handler on #discordLoginBtn, so the public button
  // triggers the same secure OAuth flow without duplicating secrets in the browser.
  login?.addEventListener("click",()=>{
    const legacy=document.getElementById("discordLoginBtn");
    if(legacy) legacy.click();
    else window.location.hash="pro-login";
  });

  // If a valid BCSO session hydrates the existing profile, make the public button an entry to Pro.
  const observer=new MutationObserver(()=>{
    const name=document.getElementById("sidebarName")?.textContent?.trim();
    const gate=document.getElementById("authGate");
    if(name && name!=="K. Belkacem" && (!gate || gate.style.display==="none" || gate.hidden)){
      login.innerHTML="<span>♙</span> Espace BCSO Pro";
      login.onclick=showPro;
    }
  });
  const profile=document.getElementById("sidebarName");
  if(profile)observer.observe(profile,{childList:true,subtree:true,characterData:true});

  document.getElementById("candidateApplication")?.addEventListener("submit",e=>{
    e.preventDefault();
    document.getElementById("applicationNote").textContent="Formulaire prêt. La connexion candidat + Firebase Storage + notifications Discord seront branchées dans le backend recrutement.";
  });

  if(location.hash==="#pro") showPro(); else showPublic();
})();
