# Brief : version « RPG coloré et décalé » de Suivapp

À donner au début d'une **nouvelle session**, dans un **nouveau dépôt**. Ne rien développer dans `Doktom/suivapp` (qui reste la version sobre et zen).

## Objectif
Refaire Suivapp avec une **grosse couche graphique RPG** : coloré, fun, décalé, plein de personnalité. Les fonctions restent celles de Suivapp V0.4 ; ce qui change, c'est l'univers visuel, le ton des textes et la mise en scène de la progression (XP, niveaux, badges, séries, victoires).

## Point de départ
- Dépôt source : https://github.com/Doktom/suivapp, tag **`v0.4-base`** (commit de la V0.4, figé).
- Méthode déjà utilisée pour les autres variantes (ex. `rpg-habitudes-v2`) : créer un **nouveau dépôt** à partir du tag, sans toucher au dépôt d'origine.
  ```bash
  git clone --branch v0.4-base https://github.com/Doktom/suivapp.git suivapp-rpg
  cd suivapp-rpg && rm -rf .git && git init -b main
  gh repo create Doktom/suivapp-rpg --public --source . --push
  ```
  (nom du dépôt à confirmer avec l'utilisateur ; penser à changer la `base` de `vite.config.ts`, le titre, le manifest et le nom dans `CLAUDE.md`).
- Lire d'abord : `CLAUDE.md`, `docs/CAHIER_DES_CHARGES.md`, `docs/REPRISE.md` de la base.

## À garder tel quel (ne pas réécrire)
- Toute la logique métier : `src/domain/`, `src/training/*.ts`, `src/data/`, les tests (81 au vert). C'est de la logique pure, indépendante de l'habillage.
- Les règles de travail du `CLAUDE.md` (français pour l'interface, code en anglais, simplicité, tests + build avant de pousser).

## À refaire (la couche visuelle)
- Thème : palette vive (plusieurs couleurs par famille / caractéristique), polices à caractère, formes arrondies, ombres, animations (gain d'XP, passage de niveau, coche d'une habitude, badge débloqué).
- Personnage / avatar évolutif, classe et caractéristiques mises en scène (Force, Souplesse, Grâce…), barre d'XP spectaculaire.
- Vocabulaire et ton : quêtes (habitudes), missions (tâches), donjon (séance de sport), butin, boss de la semaine, etc. Humour décalé, messages d'encouragement variés.
- Composants : `src/components/ui.tsx`, `src/index.css` (variables `--color-*`), puis chaque écran (Aujourd'hui, Habitudes, Entraînement, Tâches, Agenda, Trophées, Réglages).
- Garder : mobile d'abord (375 px), cibles tactiles ≥ 44 px, thème clair / sombre, accessibilité (contrastes, texte lisible malgré les couleurs).

## Façon de faire proposée
1. **Proposer d'abord** à l'utilisateur 2 ou 3 directions artistiques (planches / maquettes rapides) et attendre son choix, comme le demande le `CLAUDE.md` pour les demandes ouvertes.
2. Poser le thème et les composants de base, puis refaire écran par écran en commençant par Aujourd'hui et Trophées.
3. À chaque étape : tests + build + essai navigateur (375 px et PC), pousser sur `main` du nouveau dépôt, suivre le déploiement GitHub Pages.

## Phrase pour lancer la nouvelle session
> Lis `docs/BRIEF_VERSION_RPG.md` du dépôt Doktom/suivapp (tag v0.4-base) et crée la version RPG coloré et décalé dans un nouveau dépôt, sans toucher à suivapp.
