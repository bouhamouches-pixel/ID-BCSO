
# BCSO V2.1 — Messagerie + notifications Discord groupées

Cette version ajoute l'infrastructure commune pour :
- Candidat ↔ BCSA
- Civil ↔ Park Ranger
- Civil ↔ BCSO

## Fonctionnement
Chaque message est immédiatement créé dans :
`conversations/{conversationId}/messages/{messageId}`

Aucun message n'est fusionné ou supprimé.

Une Cloud Function ajoute chaque message à un lot Discord de 60 secondes.
Une fonction planifiée expédie ensuite :
- un MP Discord au civil lorsque le BCSO répond ;
- une notification dans le salon du service lorsque le civil écrit.

Les événements prioritaires (rendez-vous confirmé, changement de statut,
permis délivré, document demandé, etc.) sont conçus pour contourner le lot.

## Secrets à créer côté Firebase / Cloud Functions
NE JAMAIS mettre ces valeurs dans GitHub :
- DISCORD_BOT_TOKEN
- DISCORD_BCSA_CHANNEL_ID
- DISCORD_PARK_RANGER_CHANNEL_ID
- DISCORD_CITIZEN_CONTACT_CHANNEL_ID

## Important
`firestore-v2-messaging.rules` est fourni comme base V2 isolée.
Ne remplace pas les règles de production V1 avec ce fichier tant que les autres
collections V2 ne sont pas migrées.

Le frontend contient `messaging-v2.js`, prêt à être utilisé par les écrans
Candidatures, Park Ranger et Contact BCSO.
