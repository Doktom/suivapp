# CLAUDE.md — contexte du projet

## Projet
Webapp **personnelle** (un seul utilisateur) de suivi d'habitudes, de tâches et d'agenda, avec une gamification de style RPG (XP, niveaux, avatar évolutif). Ambiance visuelle sobre et zen.

La spécification de référence est `docs/CAHIER_DES_CHARGES.md` : la lire avant toute nouvelle tâche et la mettre à jour quand une décision est prise.

## État actuel
- Phase : **V0.2 codée** (2026-11-10) : niveaux, routines, habitudes à éviter, fréquences mensuelle et tous les N jours, tâches récurrentes, checklists, agenda + événements. Base Supabase à migrer avec `supabase/migration_v0.2.sql`. Améliorations du 2026-11-10 : annulation, agenda cliquable, suppression d'habitude, export JSON, thème sombre, XP réglables. V0.3 étape 1 codée (2026-11-10) : onglet Entraînement, sport de base (programme de salle pré-chargé, séance en cours, chrono de repos, finisher, historique, régularité) ; base à migrer avec `supabase/migration_v0.3.sql`. Étape 2 codée aussi : progression par exercice, volume par semaine, records, détail des séances, éditeur de programme et d'exercices. Prochaine étape : V0.3 étape 3 (mobilité).
- Sans variables Supabase, l'app tourne en mode démo (localStorage). Règles métier testées dans `src/domain/`.
- Workflow : `git pull` au début, push sur `main` à la fin (déploie la prod sur GitHub Pages). Fichier de reprise `.md` seulement si demandé en fin de session.
- Dépôt GitHub : `Doktom/suivapp`.
- Priorité : mécaniques et fonctionnalités avant le graphisme.

## Conventions
- Langue : français pour la documentation, les échanges et les textes de l'interface ; anglais pour le code (noms de variables, fonctions).
- Dépôt **public** : ne jamais committer de secret (`.env*` sauf `.env.example`).
- Stack validée : React + TypeScript + Vite, Tailwind + shadcn/ui, Supabase (Postgres + Auth + RLS), hébergement GitHub Pages ou Vercel.

## Journal des décisions
- 2026-11-09 : un seul utilisateur ; téléphone et PC ; pas de hors-ligne ; pas de synchro Google pour l'instant.
- 2026-11-09 : suivi simple fait / pas fait par défaut, avec nuances possibles (durée, quantité, paliers) ; fréquences configurables finement.
- 2026-11-09 : agenda multi-vues (jour / semaine / mois), affichant habitudes, tâches et événements, avec filtres.
- 2026-11-09 : gamification RPG (XP, niveaux) + avatar évolutif ; ambiance sobre et zen pour le prototype.
- 2026-11-09 : code hébergé sur GitHub en public, avec les fichiers Claude pour reprendre le travail sur un autre PC.
- 2026-11-09 : stack validée (React + TS + Vite, Tailwind + shadcn/ui, Supabase, hébergement gratuit).
- 2026-11-09 : 1 jour de grâce par semaine et par habitude ; journée qui bascule à 4 h.
- 2026-11-09 : blocs de tâches = projets (MVP) + checklists réutilisables (V0.2) ; routines à étapes en V0.2 ; habitudes « à éviter » en V0.2.
- 2026-11-09 : rappels et notifications en V0.3 ; récompenses réelles et avatar (arbre qui grandit) plus tard : mécaniques d'abord, graphisme ensuite.
- 2026-11-09 : familles par défaut modifiables (dont Danse et Souplesse) + catalogue d'habitudes extensible par l'utilisateur.
- 2026-11-09 : sous-tâche = 5 XP ; moments matin / journée / soir dès le MVP ; quota hebdomadaire : une séance manquée pardonnée (minimum 1 séance).
- 2026-11-10 : conception V0.2 validée. Rester simple (pas de verres d'eau, litres ou nombre de pas) ; type « compteur » abandonné.
- 2026-11-10 : niveaux par habitude ou routine (Rapide / Normal / Complet, 1 à 4 niveaux) ; XP 10 puis +5 par niveau ; le niveau le plus léger garde la série.
- 2026-11-10 : habitudes à éviter avec heure limite (« ne pas fumer avant 12 h ») et tolérance (« pas trop de sucre ») ; réussite créditée à la bascule de 4 h.
- 2026-11-10 : routines = étapes stockées sur l'habitude (pas via les blocs de tâches) ; chaque niveau choisit ses étapes.
- 2026-11-10 : checklists réutilisables = chaque lancement crée un nouveau bloc ; tâches récurrentes en deux modes (calendrier fixe ou après réalisation).
- 2026-11-10 : agenda validé tel que spécifié ; habitudes « X fois par semaine » dans un bandeau « cette semaine » ; table événements dédiée.
- 2026-11-10 : agenda en composant maison (pas FullCalendar) ; XP routine = 2 XP par étape faite + XP du niveau atteint ; écarts notés sur un jour passé comptent toujours ; crédit automatique des habitudes à éviter sur 30 jours en arrière au maximum.
- 2026-11-10 : fréquences « En semaine » (lun.→ven.) et « Le week-end » (sam. et dim.) = préréglages de « certains jours » ; familles affichées en cartes colorées (Habitudes et catalogue) ; agenda semaine en lignes par jour (événements, habitudes par moment, tâches) avec icônes d'état, mois avec barre de progression.
- 2026-11-10 : bandeau « Annuler » 6 s après chaque action ; agenda cliquable pour valider (pas les habitudes à venir) ; suppression définitive d'habitude avec confirmation ; correction sur 13 jours ; thème choisi par appareil (localStorage) ; XP réglables dans profile.xp (validations futures seulement) ; logique automatique dans src/domain/automation.ts.
- 2026-11-10 : onglet unique **Entraînement** (sport, mobilité, danse : salsa, bachata, kizomba), dans la même app mais en module autonome `src/training/` ; programme de salle de 3 séances en rotation (cahier des charges 3.11), échauffement + finisher WOD à chaque séance ; séries détaillées (répétitions et charge) ; chrono partout ; pas de suivi de douleur ; habitudes sport et étirement migrent vers l'Entraînement. Devient la V0.3 (statistiques et rappels en V0.4).
- 2026-11-10 : « /15 » = par côté (unilatéral) ou 2e mouvement enchaîné (add/abd) ; finisher = bibliothèque de WODs au choix + tirage au hasard ; danse = cours fixes, soirées, pratique, temps, figures, objectifs avec moyens d'y arriver ; programme maison à faire plus tard. Étapes V0.3 : 1 sport base, 2 sport suivi, 3 mobilité, 4 danse, 5 ludique.
