CORRECTION MATRICULES FIREBASE

Corrigé :
- reconnaissance automatique des formats [SHF-124], [CMD-133], [CPT-177], [SND-178], etc.
- migration automatique des agents déjà présents dans Firestore et sans matricule ;
- liste BCSA "Attribuer le matricule" alimentée par les vrais agents Firebase ;
- suppression des anciens agents types J. Bright / L. Mook du sélecteur ;
- attribution et retrait manuels écrivent directement dans agents/{uid} ;
- badgeLocked=true après attribution.

Le portail complet conserve le logo BCSO, le menu corrigé, Investigation Pro, SEB et Agent Sync.
