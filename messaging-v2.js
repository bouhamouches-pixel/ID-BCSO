import { db } from "./firebase-auth.js";
import {collection,addDoc,doc,getDoc,onSnapshot,orderBy,query,serverTimestamp,setDoc,updateDoc} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
export async function ensureConversation({conversationId,kind,subject,citizenUid,citizenDiscordId,targetService,characterId=null}){
 const ref=doc(db,"conversations",conversationId),snap=await getDoc(ref);
 if(!snap.exists())await setDoc(ref,{kind,subject,ownerUid:citizenUid,citizenUid,citizenDiscordId,characterId,targetService,status:"open",createdAt:serverTimestamp(),updatedAt:serverTimestamp()});return ref;
}
export async function sendPortalMessage({conversationId,senderId,senderType,senderLabel,text,targetDiscordId=null,targetService=null}){
 const clean=String(text||"").trim();if(!clean)return;
 await addDoc(collection(db,"conversations",conversationId,"messages"),{senderId,senderType,senderLabel,text:clean,createdAt:serverTimestamp(),readByCitizen:senderType==="citizen",readByBcso:senderType==="bcso",targetDiscordId,targetService,discordNotificationState:"pending"});
 await updateDoc(doc(db,"conversations",conversationId),{updatedAt:serverTimestamp(),lastMessagePreview:clean.slice(0,160),lastSenderType:senderType});
}
export function watchMessages(conversationId,callback){return onSnapshot(query(collection(db,"conversations",conversationId,"messages"),orderBy("createdAt","asc")),s=>callback(s.docs.map(d=>({id:d.id,...d.data()}))))}
