BCSO V5.8 — RESTAURATION DES PANNEAUX FIREBASE

Cette version ne refait PAS la migration V6.

Elle lit uniquement les données déjà présentes dans Firestore / sharedState et les réinjecte
dans les panneaux V5 existants, sans écrire ni écraser Firestore.

Panneaux restaurés selon les droits :
- Agenda
- Plaintes
- Mandats
- Matériel
- Notifications / convocations
- BCSA : entretiens, candidats, matricules, dossiers agents, rapports de patrouille
- Investigation : dossiers, suspects, témoins, tableaux
- SEB : opérations, tableaux
- Audit services pour supervision

Agents, services, rapports et formations Park Ranger gardent leurs collections Firebase dédiées.

GitHub uniquement. Ne pas modifier Cloud Shell ni les règles Firestore.
