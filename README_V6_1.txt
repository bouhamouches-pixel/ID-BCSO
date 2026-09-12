BCSO V6.1 — CORRECTION DES PANNEAUX VIDES

- Un snapshot Firebase vide ne peut plus écraser un cache local non vide.
- Si un document sharedState n'existe pas, les données locales existantes sont réinjectées.
- Les services et rapports locaux existants sont migrés avant d'être remplacés.
- Une sauvegarde locale de sécurité est créée avant chaque modification de donnée opérationnelle.
- En cas d'erreur Firebase, un badge d'avertissement apparaît en bas à droite.

Aucune modification des règles Firestore n'est requise : la V6 Cloud Shell déjà déployée reste valable.
