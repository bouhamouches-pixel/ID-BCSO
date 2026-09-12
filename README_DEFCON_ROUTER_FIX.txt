CORRECTION DEFCON

Le problème venait du fait que DEFCON avait été ajouté en dehors du système normal de navigation du portail.
Il restait donc affiché sous Procédures, Fiches d'aide, Codes radio et Droits Miranda.

Correction :
- DEFCON est maintenant un bouton AIDES normal avec data-view="defcon"
- sa page est une vraie vue du portail : id="view-defcon"
- elle disparaît automatiquement lorsqu'une autre rubrique est sélectionnée
- le bouton DEFCON n'est plus imbriqué dans Droits Miranda

GitHub uniquement. Aucun changement Firebase / Cloud Shell nécessaire.
