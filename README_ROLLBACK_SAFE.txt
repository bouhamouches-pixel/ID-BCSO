BCSO — ROLLBACK SÉCURISÉ V5

Objectif :
Revenir immédiatement à la dernière base stable avant la migration globale V6.

Ce ZIP contient la version V5 du portail avec :
- agents Firebase
- services Firebase
- rapports Firebase
- codes radio catégorisés
- DEFCON correctement routé
- compteur agents en service

Le cache-busting est ajouté dans index.html afin que Safari/iPad recharge réellement
app.js, auth-ui.js, firebase-auth.js et style.css au lieu d'utiliser une V6 en cache.

IMPORTANT :
- GitHub uniquement.
- Ne pas modifier Firestore ni Cloud Shell.
- Les règles V6 actuellement déployées sont compatibles avec cette V5.
