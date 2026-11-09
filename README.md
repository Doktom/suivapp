# Suivapp

Webapp personnelle de suivi d'habitudes, de tâches et d'agenda, avec une progression ludique de style RPG (XP, niveaux, avatar qui évolue).

- Cahier des charges : [`docs/CAHIER_DES_CHARGES.md`](docs/CAHIER_DES_CHARGES.md)
- Contexte pour Claude Code : [`CLAUDE.md`](CLAUDE.md)

Statut : MVP V0.1 codé. Production : <https://doktom.github.io/suivapp/> (déployée à chaque push sur `main`).

## Développement

```bash
npm install
npm run dev
npm test
```

Sans fichier `.env.local`, l'app tourne en **mode démo** : les données restent dans le navigateur.

## Brancher Supabase (une seule fois)

1. Créer un projet sur [supabase.com](https://supabase.com).
2. Dans l'éditeur SQL, exécuter [`supabase/schema.sql`](supabase/schema.sql).
3. Dans Authentication → URL Configuration, mettre `https://doktom.github.io/suivapp/` en Site URL.
4. Dans le dépôt GitHub (Settings → Secrets and variables → Actions), ajouter `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`, puis relancer le déploiement.
5. Se connecter une première fois, puis désactiver les inscriptions dans Authentication → Sign In / Providers, pour que le compte reste unique.
