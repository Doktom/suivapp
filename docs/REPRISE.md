# Point d'étape et reprise — 10 novembre 2026

À lire en début de session (avec `CLAUDE.md`). À mettre à jour à chaque fin d'étape.

## Où on en est

| Version | Contenu | État |
|---|---|---|
| V0.1 — MVP | Habitudes simples / durée / quantité, catalogue, séries et jour de grâce, XP et niveaux, tâches, listes, blocs | ✅ en production |
| V0.2 — Profondeur | Niveaux, routines, habitudes à éviter, fréquences (mois, tous les N jours, semaine, week-end), tâches récurrentes, checklists, agenda jour / semaine / mois + événements ; annulation, agenda cliquable, suppression d'habitude, export JSON, thème sombre, XP réglables | ✅ codée |
| V0.3 — Entraînement | Étape 1 : sport en salle, séance guidée, chrono, finisher · Étape 2 : progression, records, volume, éditeur de programme · Étape 3 : mobilité guidée au chrono · Étape 4 : danse (cours, soirées, figures, objectifs) | ✅ étapes 1 à 4 codées · ⬜ étape 5 |
| V0.4 — Confort | Statistiques générales et heatmaps, succès, PWA installable, rappels | ⬜ |

Contrôles du point d'étape : 59 tests au vert, build OK, parcours complet sur une base vierge (habitude, tâche, séance de sport, routine de mobilité, danse, agenda, progression) sans erreur dans la console, affichage vérifié à 375 px et sur PC, thème clair et sombre.

## Mettre en ligne (à faire par l'utilisateur)

1. **Supabase** (éditeur SQL), selon l'état de la base :
   - base créée en V0.1 (cas actuel) : exécuter `supabase/migration_v0.2.sql`, puis `supabase/migration_v0.3.sql` ;
   - nouvelle base : exécuter seulement `supabase/schema.sql`.
   Les scripts se relancent sans risque.
2. **GitHub** : remplacer le contenu du dépôt par celui du dossier (Add file → Upload files, glisser tout le contenu), valider sur `main`. Le déploiement se lance seul (onglet Actions, 1 à 2 min).
3. **Dans l'app**, après la mise en ligne :
   - archiver les anciennes habitudes devenues doublons (sport, « Cours de danse ») ;
   - importer les routines d'étirement depuis Entraînement → Mobilité (bouton dédié) ;
   - saisir les cours fixes de danse (Entraînement → Danse → Cours fixes) ;
   - ajuster les routines de mobilité de départ et les finishers (ce sont des suggestions).

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
- Le schéma SQL n'a pas été exécuté sur une vraie base Postgres pendant cette session (il a été écrit pour être relançable) : en cas d'erreur à l'exécution, la copier dans la session suivante.
- Les séances en cours sont gardées dans le navigateur de l'appareil où elles ont commencé.
- Les données pré-chargées (programme, routines, finishers) ne se recréent pas tant qu'il en existe ; supprimer tout le programme ne le recharge pas.
