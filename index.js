
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const {defineSecret} = require("firebase-functions/params");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const DISCORD_BOT_TOKEN = defineSecret("DISCORD_BOT_TOKEN");
const DISCORD_BCSA_CHANNEL_ID = defineSecret("DISCORD_BCSA_CHANNEL_ID");
const DISCORD_PARK_RANGER_CHANNEL_ID = defineSecret("DISCORD_PARK_RANGER_CHANNEL_ID");
const DISCORD_CITIZEN_CONTACT_CHANNEL_ID = defineSecret("DISCORD_CITIZEN_CONTACT_CHANNEL_ID");

const REGION = "europe-west6";
const BATCH_WINDOW_MS = 60 * 1000;

function serviceSecret(service) {
  if (service === "bcsa") return DISCORD_BCSA_CHANNEL_ID;
  if (service === "park-ranger") return DISCORD_PARK_RANGER_CHANNEL_ID;
  return DISCORD_CITIZEN_CONTACT_CHANNEL_ID;
}

async function discord(path, token, body) {
  const res = await fetch(`https://discord.com/api/v10${path}`, {
    method: "POST",
    headers: {"Authorization": `Bot ${token}`, "Content-Type": "application/json"},
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`Discord ${res.status}: ${await res.text()}`);
  return res.json();
}

async function sendDm(userId, token, content) {
  const dm = await discord("/users/@me/channels", token, {recipient_id: userId});
  return discord(`/channels/${dm.id}/messages`, token, {content});
}

function truncate(s, n=450) {
  s = String(s || "").replace(/\s+/g, " ").trim();
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

/**
 * Triggered for EVERY site message.
 * The message remains its own Firestore document.
 * We only attach it to a notification batch.
 */
exports.queuePortalDiscordNotification = onDocumentCreated(
  {
    document: "conversations/{conversationId}/messages/{messageId}",
    region: REGION
  },
  async event => {
    const msg = event.data.data();
    const conversationId = event.params.conversationId;
    const convRef = db.doc(`conversations/${conversationId}`);
    const convSnap = await convRef.get();
    if (!convSnap.exists) return;
    const conv = convSnap.data();

    const recipientKey = msg.senderType === "citizen"
      ? `service:${msg.targetService || conv.targetService || "general"}`
      : `citizen:${msg.targetDiscordId || conv.citizenDiscordId}`;

    // Stable 60-second bucket. Concurrent messages enter the same batch.
    const bucket = Math.floor(Date.now() / BATCH_WINDOW_MS);
    const batchId = `${conversationId}__${recipientKey.replace(/[^a-zA-Z0-9_-]/g,"_")}__${bucket}`;
    const batchRef = db.doc(`discordNotificationBatches/${batchId}`);

    await db.runTransaction(async tx => {
      const b = await tx.get(batchRef);
      const base = b.exists ? b.data() : {
        conversationId,
        recipientKey,
        recipientType: msg.senderType === "citizen" ? "bcso" : "citizen",
        targetService: msg.targetService || conv.targetService || "general",
        targetDiscordId: msg.targetDiscordId || conv.citizenDiscordId || null,
        subject: conv.subject || conversationId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        sendAfter: admin.firestore.Timestamp.fromMillis(Date.now() + BATCH_WINDOW_MS),
        sent: false,
        messageIds: [],
        previews: []
      };
      const ids = [...(base.messageIds || []), event.params.messageId];
      const previews = [...(base.previews || []), truncate(msg.text, 350)];
      tx.set(batchRef, {...base, messageIds: ids, previews, count: ids.length}, {merge:true});
      tx.update(event.data.ref, {
        discordNotificationState: "queued",
        notificationBatchId: batchId
      });
    });
  }
);

/**
 * Runs once per minute. Only Discord alerts are grouped.
 * Firestore messages are never merged or deleted.
 */
exports.flushPortalDiscordNotifications = onSchedule(
  {
    schedule: "every 1 minutes",
    region: REGION,
    secrets: [
      DISCORD_BOT_TOKEN,
      DISCORD_BCSA_CHANNEL_ID,
      DISCORD_PARK_RANGER_CHANNEL_ID,
      DISCORD_CITIZEN_CONTACT_CHANNEL_ID
    ]
  },
  async () => {
    const now = admin.firestore.Timestamp.now();
    const snap = await db.collection("discordNotificationBatches")
      .where("sent", "==", false)
      .where("sendAfter", "<=", now)
      .limit(50)
      .get();

    const token = DISCORD_BOT_TOKEN.value();

    for (const d of snap.docs) {
      const b = d.data();
      try {
        const lines = (b.previews || []).slice(0, 5).map((x,i)=>`**${i+1}.** ${x}`).join("\n");
        const more = (b.count || 0) > 5 ? `\n… et ${(b.count || 0)-5} autre(s) message(s).` : "";
        const content =
          `🔔 **${b.count || 1} nouveau${(b.count||1)>1?"x":""} message${(b.count||1)>1?"s":""} — BCSO**\n` +
          `**Dossier :** ${b.subject}\n\n${lines}${more}\n\n` +
          `Consultez le portail BCSO pour ouvrir la conversation et répondre.`;

        if (b.recipientType === "citizen") {
          if (!b.targetDiscordId) throw new Error("Missing citizen Discord ID");
          await sendDm(b.targetDiscordId, token, content);
        } else {
          const secret = serviceSecret(b.targetService);
          const channelId = secret.value();
          if (!channelId) throw new Error(`Missing Discord channel for ${b.targetService}`);
          await discord(`/channels/${channelId}/messages`, token, {content});
        }

        await d.ref.update({
          sent: true,
          sentAt: admin.firestore.FieldValue.serverTimestamp()
        });

        const writes = db.batch();
        for (const id of b.messageIds || []) {
          writes.update(db.doc(`conversations/${b.conversationId}/messages/${id}`), {
            discordNotificationState: "sent"
          });
        }
        await writes.commit();
      } catch (err) {
        await d.ref.update({
          lastError: String(err.message || err),
          lastAttemptAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }
  }
);

/**
 * IMPORTANT EVENTS: call this server-side from appointment/status workflows.
 * These bypass the 60-second message batch.
 */
exports.sendPriorityPortalNotification = async function({
  citizenDiscordId, service, content
}) {
  const token = DISCORD_BOT_TOKEN.value();
  if (citizenDiscordId) return sendDm(citizenDiscordId, token, content);
  const channelId = serviceSecret(service).value();
  return discord(`/channels/${channelId}/messages`, token, {content});
};
