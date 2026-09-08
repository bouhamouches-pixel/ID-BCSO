# BCSO — Portail agents (démo statique)

Première maquette fonctionnelle du portail BCSO.

## Fonctionnalités incluses

- Services
  - prise / fin de service
  - compteur en direct
  - statistiques
  - historique
  - graphique 7 jours
- Agenda
  - événements
  - inscription / désinscription
  - participants en liste déroulante
- Mes rapports
  - création de rapports
  - recherche et filtres
- BD Rapports
  - tous les rapports
  - numéro unique `R-AAAA-XXXX`
- Plaintes
  - liste et filtres
  - agent rédacteur
  - agent en charge
  - bouton de prise en charge
- Profil
  - avatar personnalisable
  - PNG/JPG/WebP
  - limite de 5 Mo
  - recadrage carré 512 × 512
  - compression WebP avant stockage local

## Important

Cette version est uniquement une démo frontend.

Les données sont enregistrées avec `localStorage`, donc :
- elles sont propres au navigateur utilisé ;
- elles peuvent disparaître si le stockage du navigateur est vidé ;
- il n'y a encore aucune authentification ;
- il n'y a encore aucune connexion Firebase / Discord.

## Mise en ligne GitHub Pages

1. Décompresser le dossier.
2. Envoyer tous les fichiers à la racine de votre dépôt GitHub.
3. Ouvrir `Settings > Pages`.
4. Dans `Build and deployment`, choisir `Deploy from a branch`.
5. Sélectionner la branche `main` et le dossier `/root`.
6. Enregistrer.

Le site pourra ensuite être testé directement depuis GitHub Pages.
