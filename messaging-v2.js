
import { db } from "./firebase-auth.js";
import {
  collection, addDoc, doc, getDoc, onSnapshot, orderBy, query,
  serverTimestamp, setDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

/**
 * BCSO V2 unified messaging
 * One Firestore document per message. Discord batching is server-side only.
 */
export async function ensureConversation({conversationId, kind, subject, citizenDiscordId, targetService}) {
  const ref = doc(db, "conversations", conversationId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      kind, subject,
      citizenDiscordId,
      targetService,
      status: "open",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
  return ref;
}

export async function sendPortalMessage({
  conversationId, senderId, senderType, senderLabel, text, targetDiscordId = null, targetService = null
}) {
  const clean = String(text || "").trim();
  if (!clean) return;
  await addDoc(collection(db, "conversations", conversationId, "messages"), {
    senderId,
    senderType,             // "citizen" | "bcso"
    senderLabel,
    text: clean,
    createdAt: serverTimestamp(),
    readByCitizen: senderType === "citizen",
    readByBcso: senderType === "bcso",
    targetDiscordId,
    targetService,
    discordNotificationState: "pending"
  });
  await updateDoc(doc(db, "conversations", conversationId), {
    updatedAt: serverTimestamp(),
    lastMessagePreview: clean.slice(0, 160),
    lastSenderType: senderType
  });
}

export function watchMessages(conversationId, callback) {
  const q = query(
    collection(db, "conversations", conversationId, "messages"),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, snap => callback(snap.docs.map(d => ({id:d.id, ...d.data()}))));
}
