BCSO V5.2 — FIX BD RAPPORTS

Correction ciblée :
- lecture explicite Firestore de la collection reports au chargement
- lecture explicite des disciplinaryReports selon les droits
- hydratation directe de BD Rapports, Mes rapports et Supervision des rapports
- maintien des listeners temps réel
- indicateur visible avec nombre de rapports Firebase ou erreur exacte
- cache-busting Safari/iPad

Aucune modification Cloud Shell / Firestore rules nécessaire.
