Correction définitive carte SEB

Cause :
La pyramide TMS contient 2x2 tuiles au zoom 1, puis double à chaque niveau.
Avec Leaflet CRS.Simple, le monde correspondant doit faire 256 x 256 unités,
pas 16384 x 16384 unités. Les anciennes limites forçaient Leaflet à demander
des coordonnées de tuiles inexistantes.

Correction :
- bounds : [[-256, 0], [0, 256]]
- TMS conservé
- zoom natif 1 à 7
- sur-zoom jusqu'à 9
- sous-zoom à 0 pour les grands écrans
- coordonnées affichées remises à l'échelle x64
- gestion des erreurs de tuiles moins agressive

Tous les autres changements du portail sont conservés.
