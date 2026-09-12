SERVICES FIREBASE V4

1. Remplace les fichiers du portail GitHub par ceux du ZIP.
2. Copie firestore.rules dans ~/bcso-backend/firestore.rules.
3. Déploie :
   cd ~/bcso-backend
   firebase deploy --only firestore:rules

Les prises et fins de service sont ensuite synchronisées en temps réel.
Les anciens services localStorage présents sur l'appareil de chaque agent sont migrés avec un identifiant déterministe pour éviter les doublons.
