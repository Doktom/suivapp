# Point d'étape et reprise — 10 novembre 2026

À lire en début de session (avec `CLAUDE.md`). À mettre à jour à chaque fin d'étape.

## Où on en est

| Version | Contenu | État |
|---|---|---|
| V0.1 — MVP | Habitudes simples / durée / quantité, catalogue, séries et jour de grâce, XP et niveaux, tâches, listes, blocs | ✅ codée |
| V0.2 — Profondeur | Niveaux, routines, habitudes à éviter, fréquences (mois, tous les N jours, semaine, week-end), tâches récurrentes, checklists, agenda jour / semaine / mois + événements ; annulation, agenda cliquable, suppression d'habitude, export JSON, thème sombre, XP réglables | ✅ codée |
| V0.3 — Entraînement | Étape 1 : sport en salle, séance guidée, chrono, finisher · Étape 2 : progression, records, volume, éditeur de programme · Étape 3 : mobilité guidée au chrono · Étape 4 : danse (cours, soirées, figures, objectifs) | ✅ étapes 1 à 4 codées · ⬜ étape 5 |
| V0.4 — Confort | Statistiques générales et heatmaps, succès, PWA installable, rappels | ⬜ |

Contrôles du point d'étape : 59 tests au vert, build OK, parcours complet sur une base vierge (habitude, tâche, séance de sport, routine de mobilité, danse, agenda, progression) sans erreur dans la console, affichage vérifié à 375 px et sur PC, thème clair et sombre.

## Hébergement : phase de test, puis serveur privé

- **Maintenant (phase de test)** : l'app se construit et se teste au fur et à mesure sur GitHub Pages (https://doktom.github.io/suivapp/), **sans connexion et sans Supabase** : les données restent dans le navigateur de chaque appareil (pas de synchronisation téléphone / PC). Sauvegarde : Réglages → Exporter mes données. Claude pousse directement sur `main` ; le site se redéploie en 1 à 2 min.
- **À la toute fin** : installation sur le serveur privé de l'utilisateur, **atj-app.com** (hébergement o2switch : Apache + PHP, cPanel, envoi des fichiers par FileZilla). Version prévue :
  - l'app compilée, déposée par FTP dans un dossier (ex. `atj-app.com/suivapp/`, avec une base Vite relative) ;
  - un fichier `api.php` + une base SQLite dans un seul fichier (synchronisation téléphone / PC, sauvegarde par copie du fichier), branché via l'interface `Repo` de `src/data/repo.ts` ;
  - pas d'écran de connexion dans l'app : mot de passe posé sur le dossier depuis le cPanel (une fois par appareil) ;
  - import de l'export JSON pour récupérer les données de la phase de test.
- Supabase (`supabase/*.sql`, mode Supabase de `repo.ts`) n'est plus utilisé ; le code reste en place tant que la version serveur n'existe pas.

## Premiers pas dans l'app (côté utilisateur)
- Saisir les cours fixes de danse (Entraînement → Danse → Cours fixes).
- Ajuster les routines de mobilité de départ et les finishers (ce sont des suggestions).
- Ne pas ajouter d'habitudes sport, étirement ou « Cours de danse » : c'est l'Entraînement qui s'en charge. Si une routine d'étirement existe en habitude, l'importer depuis Entraînement → Mobilité.

## Prochaine étape : V0.3 étape 5, le côté ludique

À proposer à l'utilisateur avant de coder (il valide la liste) :
- **Objectifs sport** avec jauge, comme en danse (ex. « Squat 60 kg », « 12 séances ce mois »), avec les moyens d'y arriver.
- **Badges** propres à l'entraînement : 10 / 50 / 100 séances, tonnage cumulé (1 t, 10 t…), séries de mobilité (7, 30 jours), figures maîtrisées, premier record.
- **Bilan de la semaine** (sport, mobilité, danse) : séances, temps, volume, records, comparaison avec la semaine précédente.
- **Records mis en valeur** : fil des derniers records, célébration plus marquée.
- Peut-être : un encart « Entraînement du jour » sur l'écran Aujourd'hui (prochaine séance, routine du moment, cours du soir).

Ensuite : V0.4 (statistiques, succès, PWA, rappels), puis le programme « maison » à construire avec l'utilisateur.

## Questions ouvertes
- Programme de séances à la maison : à construire ensemble.
- Récompenses réelles : forme et fonctionnement.
- Valeurs d'XP et courbe de niveau : à ajuster à l'usage (les valeurs des habitudes et tâches sont déjà réglables dans Réglages ; celles de l'entraînement ne le sont pas encore).

## Points à surveiller
- Phase de test : chaque appareil a ses propres données ; exporter régulièrement (Réglages) pour pouvoir les réimporter dans la version finale.
- Les séances en cours sont gardées dans le navigateur de l'appareil où elles ont commencé.
- Les données pré-chargées (programme, routines, finishers) ne se recréent pas tant qu'il en existe ; supprimer tout le programme ne le recharge pas.
