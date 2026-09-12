BCSO V6.2 — SYNCHRONISATION FIREBASE DIRECTE

Diagnostic :
Les captures Firebase confirment que les données existent bien :
- agents : plusieurs documents présents
- services : documents actifs présents
- sharedState : données BCSA / Investigation / SEB / matériel, etc.

Le problème est donc côté affichage/synchronisation frontend.

Corrections :
- les snapshots Firestore appellent maintenant directement les fonctions d'hydratation de l'interface ;
- les CustomEvents restent présents comme compatibilité ;
- ajout d'un indicateur "Firebase synchronisé" en bas à droite ;
- toucher l'indicateur affiche l'état détaillé des flux agents/services/rapports/sharedState ;
- cache-busting sur app.js, auth-ui.js, firebase-auth.js et style.css pour empêcher Safari/iPad de charger une ancienne version.

Aucune modification Firestore rules n'est nécessaire.
