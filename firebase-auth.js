import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth, signInWithCustomToken, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAjndzYCA_HYyitD8FpF28C9zp7UDcgAeg",
  authDomain: "bcsolwwl.firebaseapp.com",
  projectId: "bcsolwwl",
  storageBucket: "bcsolwwl.firebasestorage.app",
  messagingSenderId: "1036005349847",
  appId: "1:1036005349847:web:aa96e3984df18e86fe5392",
  measurementId: "G-R2R7F35X5M"
};
const DISCORD_CLIENT_ID = "1546992548600479856";
const REDIRECT_URI = "https://bouhamouches-pixel.github.io/ID-BCSO/";
const EXCHANGE_URL = "https://europe-west6-bcsolwwl.cloudfunctions.net/discordExchange";
const firebaseApp=initializeApp(firebaseConfig);
const auth=getAuth(firebaseApp);
const db=getFirestore(firebaseApp);

function randomState(){
  const b=new Uint8Array(32); crypto.getRandomValues(b);
  return Array.from(b,x=>x.toString(16).padStart(2,"0")).join("");
}
export function startDiscordLogin(){
  const state=randomState(); sessionStorage.setItem("bcso_oauth_state",state);
  const p=new URLSearchParams({client_id:DISCORD_CLIENT_ID,response_type:"code",redirect_uri:REDIRECT_URI,scope:"identify guilds.members.read",state,prompt:"consent"});
  location.assign(`https://discord.com/oauth2/authorize?${p}`);
}
export async function finishDiscordLoginIfNeeded(){
  const p=new URLSearchParams(location.search), err=p.get("error"), code=p.get("code"), returned=p.get("state");
  if(err){history.replaceState({},document.title,REDIRECT_URI);throw new Error("Connexion Discord annulée ou refusée.");}
  if(!code)return null;
  const expected=sessionStorage.getItem("bcso_oauth_state"); sessionStorage.removeItem("bcso_oauth_state");
  if(!expected||returned!==expected){history.replaceState({},document.title,REDIRECT_URI);throw new Error("Vérification OAuth2 impossible. Recommencez la connexion.");}
  const r=await fetch(EXCHANGE_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code,redirectUri:REDIRECT_URI})});
  const data=await r.json().catch(()=>({})); history.replaceState({},document.title,REDIRECT_URI);
  if(!r.ok)throw new Error(data.message||data.error||"Connexion Discord refusée.");
  await signInWithCustomToken(auth,data.token); return data.profile;
}
export function observeBcsoAuth(cb){return onAuthStateChanged(auth,async u=>{if(!u)return cb(null);const t=await u.getIdTokenResult(true);cb({user:u,claims:t.claims});});}
export function logoutBcso(){sessionStorage.removeItem("bcso_oauth_state");return signOut(auth);}
export { db };
