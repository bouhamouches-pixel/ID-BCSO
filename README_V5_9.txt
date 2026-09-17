BCSO V5.9 — Firebase Stable Sync
- Agents, services et sharedState démarrent immédiatement en temps réel.
- Un module secondaire en erreur ne bloque plus les autres panneaux.
- Le compteur En service ignore les anciens services actifs hors journée BCSO 04:00→03:59.
- Un seul service actif est compté par agent.
- Les anciens services actifs du cache local ne sont plus recréés dans Firebase.
- Une nouvelle prise de service clôt les anciens services ouverts du même agent.
- Aucun changement des règles Firestore.
- GitHub uniquement.
