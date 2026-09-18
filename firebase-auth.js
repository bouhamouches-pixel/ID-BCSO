import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth, signInWithCustomToken, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-storage.js";

const firebaseConfig={apiKey:"AIzaSyAjndzYCA_HYyitD8FpF28C9zp7UDcgAeg",authDomain:"bcsolwwl.firebaseapp.com",projectId:"bcsolwwl",storageBucket:"bcsolwwl.firebasestorage.app",messagingSenderId:"1036005349847",appId:"1:1036005349847:web:aa96e3984df18e86fe5392",measurementId:"G-R2R7F35X5M"};
const DISCORD_CLIENT_ID="1546992548600479856";
const REDIRECT_URI="https://bouhamouches-pixel.github.io/ID-BCSO/";
const BCSO_EXCHANGE_URL="https://europe-west6-bcsolwwl.cloudfunctions.net/discordExchange";
const CITIZEN_EXCHANGE_URL="https://europe-west6-bcsolwwl.cloudfunctions.net/discordCitizenExchange";
const firebaseApp=initializeApp(firebaseConfig), auth=getAuth(firebaseApp), db=getFirestore(firebaseApp), storage=getStorage(firebaseApp);
function randomState(){const b=new Uint8Array(32);crypto.getRandomValues(b);return Array.from(b,x=>x.toString(16).padStart(2,"0")).join("")}
function startDiscordLogin(mode="bcso"){
 const state=randomState();sessionStorage.setItem("bcso_oauth_state",state);sessionStorage.setItem("bcso_oauth_mode",mode);
 const scope=mode==="citizen"?"identify":"identify guilds.members.read";
 const p=new URLSearchParams({client_id:DISCORD_CLIENT_ID,response_type:"code",redirect_uri:REDIRECT_URI,scope,state,prompt:"consent"});
 location.assign(`https://discord.com/oauth2/authorize?${p}`);
}
export const startBcsoDiscordLogin=()=>startDiscordLogin("bcso");
export const startCitizenDiscordLogin=()=>startDiscordLogin("citizen");
export { startDiscordLogin };
export async function finishDiscordLoginIfNeeded(){
 const p=new URLSearchParams(location.search),err=p.get("error"),code=p.get("code"),returned=p.get("state");
 if(err){history.replaceState({},document.title,REDIRECT_URI);throw new Error("Connexion Discord annulée ou refusée.")}
 if(!code)return null;
 const expected=sessionStorage.getItem("bcso_oauth_state"),mode=sessionStorage.getItem("bcso_oauth_mode")||"bcso";sessionStorage.removeItem("bcso_oauth_state");sessionStorage.removeItem("bcso_oauth_mode");
 if(!expected||returned!==expected){history.replaceState({},document.title,REDIRECT_URI);throw new Error("Vérification OAuth2 impossible. Recommencez la connexion.")}
 const endpoint=mode==="citizen"?CITIZEN_EXCHANGE_URL:BCSO_EXCHANGE_URL;
 const r=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code,redirectUri:REDIRECT_URI})});
 const data=await r.json().catch(()=>({}));history.replaceState({},document.title,REDIRECT_URI);
 if(!r.ok)throw new Error(data.message||data.error||"Connexion Discord refusée.");
 await signInWithCustomToken(auth,data.token);localStorage.setItem("bcso_auth_mode",mode);if(data.profile)localStorage.setItem("bcso_discord_profile",JSON.stringify(data.profile));return {...data.profile,mode};
}
export function observeBcsoAuth(cb){return onAuthStateChanged(auth,async u=>{if(!u)return cb(null);const t=await u.getIdTokenResult(true);cb({user:u,claims:t.claims,mode:localStorage.getItem("bcso_auth_mode")||"bcso"})})}
export const observeAuth=observeBcsoAuth;
export function logoutBcso(){sessionStorage.removeItem("bcso_oauth_state");localStorage.removeItem("bcso_auth_mode");localStorage.removeItem("bcso_discord_profile");return signOut(auth)}
export { auth, db, storage };
