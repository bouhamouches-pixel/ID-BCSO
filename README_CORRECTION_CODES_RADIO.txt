CORRECTION CODES RADIO

Le précédent build avait remplacé le HTML de la page mais l'ancien JavaScript tentait encore
d'écrire dans #radioCodesContent, qui n'existait plus. Cela interrompait le rendu.

Cette version utilise directement RADIO_GROUPS comme source de vérité et remplit la nouvelle
grille compacte #radioCodesGrid. Tous les indicatifs, codes opérationnels et Ten-Codes existants
sont conservés.

GitHub uniquement. Aucun changement Firebase nécessaire.
