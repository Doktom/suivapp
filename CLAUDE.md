# CLAUDE.md — contexte du projet

## Projet
Webapp **personnelle** (un seul utilisateur) de suivi d'habitudes, de tâches et d'agenda, avec une gamification de style RPG (XP, niveaux, avatar évolutif). Ambiance visuelle sobre et zen.

La spécification de référence est `docs/CAHIER_DES_CHARGES.md` : la lire avant toute nouvelle tâche et la mettre à jour quand une décision est prise.

## État actuel
- Phase : **MVP V0.1 codé** (mobile et PC). Reste à brancher Supabase (voir README) ; ensuite V0.2.
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
