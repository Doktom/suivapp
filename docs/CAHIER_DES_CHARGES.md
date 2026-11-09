# Cahier des charges — Suivapp (webapp personnelle d'habitudes)

> Version 0.2 — 9 novembre 2026 — statut : **validé pour démarrer le MVP**
> Les points marqués **[Plus tard]** sont actés mais repoussés après le MVP.

---

## 1. Vision

Une webapp personnelle pour **mettre en place, suivre et tenir des habitudes** dans la durée, organiser ses **tâches** et voir le tout dans un **agenda**.
La motivation repose sur une **progression de type RPG** : chaque action rapporte de l'XP et fait monter de niveau.

**Priorité : les mécaniques et les fonctionnalités d'abord.** Le graphisme (avatar, illustrations, animations) vient après, une fois le cœur de l'app solide. Ambiance du prototype : **sobre et zen**, interface épurée.

## 2. Contexte et contraintes

| Point | Choix |
|---|---|
| Utilisateurs | Une seule personne. Pas de multi-utilisateur. |
| Supports | Téléphone **et** PC → interface responsive, mobile d'abord. |
| Hors-ligne | Non requis. |
| Synchro agenda externe | Non (Google Calendar éventuellement plus tard). |
| Code source | Dépôt GitHub public `Doktom/suivapp`, avec les fichiers Claude (`CLAUDE.md`) pour reprendre le travail depuis n'importe quel PC. |
| Données | Privées : protégées par authentification, **jamais** stockées dans le dépôt. |
| Début de journée | La journée bascule à **4 h du matin** : une validation à 1 h compte pour la veille. Réglable. |

## 3. Périmètre fonctionnel

### 3.1 Familles d'habitudes

Familles proposées au départ. Toutes sont **modifiables, supprimables**, et on peut en **ajouter** (nom, couleur, icône, ordre).

| Famille | Exemples | Caractéristique liée |
|---|---|---|
| Santé | eau, sommeil, alimentation | Vitalité |
| Sport | renforcement, cardio, marche | Force |
| Danse | cours, entraînement, chorégraphie | Grâce |
| Souplesse | étirements matin et soir | Souplesse |
| Skincare & soins | routines matin et soir, masques | Éclat |
| Mental & bien-être | méditation, journal, déconnexion | Sérénité |
| Maison | ménage, rangement, linge | Ordre |
| Apprentissage & créativité | lecture, langue, projet perso | Savoir |

Supprimer une famille qui contient des habitudes demande de les déplacer ou de les archiver d'abord.

### 3.2 Habitudes

**Création**
- Depuis le **catalogue** (section 3.3) en un clic, puis personnalisable.
- Ou **de zéro** : nom, famille, description facultative, icône.

**Type de suivi**
- *Simple* (par défaut) : fait / pas fait.
- *Quantité* : objectif chiffré + unité (ex. 2 L d'eau, 10 pages).
- *Durée* : objectif en minutes (ex. 60 min de danse).
- *Paliers* : plusieurs niveaux de réussite (ex. 10 / 20 / 30 min), chaque palier rapportant plus d'XP.
- *Compteur* : plusieurs fois par jour (ex. 8 verres d'eau).
- *À éviter* (« ne pas fumer », « pas d'écran après 22 h ») : jour réussi si rien n'est noté ; on note les écarts. **[V0.2]**

**Fréquence**
- Tous les jours (par défaut).
- Certains jours de la semaine (ex. lundi, mercredi, vendredi).
- X fois par semaine ou par mois, jours libres (ex. danse 3 fois par semaine).
- Tous les N jours.
- Plusieurs moments dans la journée (matin / soir), ex. étirements matin **et** soir.

**Autres réglages**
- Horaire facultatif (ex. 07:30) → l'habitude apparaît à cette heure dans l'agenda.
- Date de début, et date de fin facultative.
- Pause (vacances, maladie, blessure) sans casser la série.
- Archivage, qui garde l'historique.

**Suivi au quotidien**
- Vue « Aujourd'hui » : habitudes du jour groupées par moment (matin / journée / soir) ou par famille, validables en un geste.
- Pour les types nuancés : saisie rapide de la valeur (boutons +/−, curseur, paliers).
- Correction possible des 7 derniers jours.

**Séries (streaks)**
- Série actuelle et meilleure série par habitude.
- Pour les fréquences « X fois par semaine », la série se compte en semaines réussies.
- **1 jour de grâce par semaine** et par habitude : un oubli isolé ne casse pas la série. Il s'applique automatiquement et reste visible dans l'historique.

### 3.3 Catalogue d'habitudes

Modèles prêts à l'emploi, avec des réglages suggérés modifiables à l'ajout. On peut **ajouter ses propres modèles** au catalogue, ou enregistrer une habitude existante comme modèle.

| Famille | Habitude | Suivi suggéré | Fréquence suggérée |
|---|---|---|---|
| Danse | Cours de danse | Durée (60 min) | 2 à 3 fois / semaine |
| Danse | Entraînement perso / révision de chorégraphie | Durée (paliers 15 / 30 / 45 min) | 2 fois / semaine |
| Danse | Travail technique (pointes, tours, isolations…) | Durée (15 min) | 3 fois / semaine |
| Souplesse | Routine étirements du matin | Routine (étapes) | Tous les jours, matin |
| Souplesse | Routine étirements du soir | Routine (étapes) | Tous les jours, soir |
| Souplesse | Séance grand écart / souplesse profonde | Durée (20 min) | 2 fois / semaine |
| Sport | Renforcement musculaire | Durée (30 min) | 2 à 3 fois / semaine |
| Sport | Gainage | Durée (paliers 2 / 4 / 6 min) | Tous les jours |
| Sport | Cardio (course, vélo, corde) | Durée (30 min) | 2 fois / semaine |
| Sport | Marche | Quantité (8 000 pas) | Tous les jours |
| Skincare & soins | Routine skincare du matin | Routine (nettoyant, sérum, crème, SPF) | Tous les jours, matin |
| Skincare & soins | Routine skincare du soir | Routine (démaquillage, nettoyant, soin, crème) | Tous les jours, soir |
| Skincare & soins | Masque / exfoliation | Simple | 1 à 2 fois / semaine |
| Skincare & soins | Soin des cheveux | Simple | 1 fois / semaine |
| Santé | Boire de l'eau | Compteur (8 verres) | Tous les jours |
| Santé | Se coucher avant 23 h | Simple | Tous les jours |
| Santé | Manger des légumes à chaque repas | Compteur (2 / 2) | Tous les jours |
| Santé | Pas de grignotage | À éviter | Tous les jours |
| Mental & bien-être | Méditation | Durée (10 min) | Tous les jours |
| Mental & bien-être | Journal / gratitude | Simple | Tous les jours, soir |
| Mental & bien-être | Pas d'écran après 22 h | À éviter | Tous les jours |
| Maison | Faire son lit | Simple | Tous les jours, matin |
| Maison | Vaisselle / cuisine rangée | Simple | Tous les jours, soir |
| Maison | 15 min de rangement | Durée (15 min) | Tous les jours |
| Maison | Grand ménage | Bloc de tâches (checklist réutilisable) | 1 fois / semaine |
| Maison | Lessive | Simple | 2 fois / semaine |
| Apprentissage & créativité | Lecture | Quantité (10 pages) | Tous les jours |
| Apprentissage & créativité | Langue étrangère | Durée (15 min) | 5 fois / semaine |

### 3.4 Routines **[V0.2]**

- Une routine est une **habitude composée d'étapes** à cocher dans l'ordre (ex. étirements du soir : ischios → fessiers → dos → épaules).
- Elle est validée quand toutes les étapes sont faites ; validation partielle possible (XP au prorata).
- Étapes ajoutables, supprimables, réordonnables ; durée facultative par étape.
- Techniquement, elle réutilise le système des blocs de tâches.

### 3.5 Tâches

- **Tâche simple** : titre, note, échéance facultative, priorité (basse / normale / haute).
- **Listes** : regrouper des tâches par thème (Courses, Admin, Maison…).
- **Blocs de tâches (projets)** : une tâche parente avec sous-tâches cochables et une barre de progression. **[MVP]**
- **Checklists réutilisables** : un modèle de bloc (« préparer un voyage », « ménage du dimanche ») qu'on relance quand on veut, ou automatiquement selon une fréquence. **[V0.2]**
- Tâches récurrentes (ex. « payer le loyer » chaque mois). **[V0.2]**
- Les tâches avec échéance apparaissent dans l'agenda.
- Vue « Aujourd'hui » : tâches dues aujourd'hui et en retard, sous les habitudes.

### 3.6 Agenda

- **Vues** : jour, semaine, mois.
- **Contenu affiché**
  - Habitudes planifiées (selon leur fréquence, leur moment et leur horaire).
  - Tâches avec échéance.
  - Événements ponctuels créés directement dans l'agenda (titre, date, heure de début et de fin, note), par exemple un spectacle de danse ou un rendez-vous.
- **Filtres** : par type (habitudes / tâches / événements), par famille, par liste de tâches.
- État visuel : fait / à faire / manqué / jour de grâce.
- Création rapide d'un événement ou d'une tâche en cliquant sur un créneau.

### 3.7 Gamification (mécaniques RPG)

**XP et niveaux**
- Chaque validation rapporte de l'XP :
  - habitude simple : 10 XP ;
  - habitude nuancée : XP proportionnelle à l'objectif atteint, avec un bonus par palier ;
  - routine : 10 XP + 2 XP par étape ;
  - tâche : 5 / 10 / 20 XP selon la priorité ; bloc terminé : bonus de 25 XP ;
  - bonus de série : +10 % à 7 jours, +25 % à 30 jours, +50 % à 100 jours.
- Niveau global : XP nécessaire pour le niveau suivant = 100 × niveau^1,5 (valeurs réglables).
- Barre d'XP toujours visible.

**Caractéristiques**
- Chaque famille nourrit une caractéristique, qui a son propre niveau (voir le tableau de la section 3.1).
- Affichage sobre au départ : barres de progression ou graphique radar, pour voir l'équilibre entre domaines.
- Une famille ajoutée par l'utilisateur crée sa propre caractéristique.

**Succès (badges)**
- Ex. « Première semaine parfaite », « 30 jours d'étirements », « 50 cours de danse », « 100 tâches terminées ». **[V0.3]**

**Bienveillance** : manquer un jour ne fait jamais perdre d'XP, seule la série est affectée (et protégée par le jour de grâce).

**Avatar [Plus tard]**
- Direction retenue : une **plante ou un arbre qui grandit**, avec une branche par famille. À faire seulement une fois les mécaniques stables.

**Récompenses réelles [Plus tard]**
- Monnaie gagnée avec l'XP, échangeable contre des récompenses que l'on définit soi-même. À rediscuter.

### 3.8 Statistiques

- Taux de réussite par habitude et par famille (semaine, mois).
- Calendrier « heatmap » par habitude (style contributions GitHub).
- Évolution de l'XP, des niveaux et des caractéristiques.

### 3.9 Rappels et notifications **[V0.3]**

- Rappel à l'horaire d'une habitude ou à l'échéance d'une tâche.
- Nécessite l'app installée sur le téléphone (PWA).

## 4. Écrans

1. **Aujourd'hui** (accueil) : niveau + barre d'XP, habitudes du jour par moment, tâches du jour.
2. **Habitudes** : liste par famille, création (catalogue ou de zéro), édition, détail avec historique et heatmap.
3. **Tâches** : listes, blocs, tâches.
4. **Agenda** : vues jour / semaine / mois + filtres.
5. **Progression** : niveau, caractéristiques, succès (et plus tard avatar et récompenses).
6. **Statistiques**.
7. **Réglages** : familles, catalogue, valeurs d'XP, heure de bascule de la journée, export des données, thème clair / sombre.

Navigation : barre d'onglets en bas sur mobile, barre latérale sur PC.

## 5. Modèle de données

```
Famille         (id, nom, couleur, icône, caractéristique, ordre)
ModèleHabitude  (id, famille_id, nom, type_suivi, objectif, unité, paliers[], fréquence, moment,
                 étapes[], prédéfini [catalogue d'origine ou ajouté par l'utilisateur])
Habitude        (id, famille_id, nom, description, icône,
                 type_suivi[simple|quantité|durée|paliers|compteur|à_éviter|routine],
                 objectif, unité, paliers[],
                 fréquence{type[quotidien|jours_semaine|x_par_période|tous_les_n_jours], jours[], nb, période, intervalle},
                 moments[matin|journée|soir], horaire,
                 date_début, date_fin, en_pause, archivée)
ÉtapeRoutine    (id, habitude_id, nom, ordre, durée)
Validation      (id, habitude_id, date_jour, moment, valeur, palier_atteint, étapes_faites[],
                 jour_de_grâce, xp_gagnée)
Liste           (id, nom, couleur)
Tâche           (id, liste_id, parent_id [blocs], titre, note, échéance, priorité,
                 récurrence, modèle_id, terminée_le, xp_gagnée)
ModèleBloc      (id, nom, sous_tâches[], fréquence)
Événement       (id, titre, début, fin, note, couleur)
Profil          (niveau, xp_totale, heure_bascule_journée, réglages_xp)
Caractéristique (famille_id, niveau, xp)
Succès          (id, code, débloqué_le)
```

## 6. Choix techniques (validés)

| Besoin | Choix | Pourquoi |
|---|---|---|
| Interface | **React + TypeScript + Vite** | Standard, rapide, très bien outillé. |
| Style | **Tailwind CSS** + composants **shadcn/ui** | Rendu sobre et propre rapidement. |
| Agenda | **FullCalendar** ou composant maison | Vues jour / semaine / mois prêtes à l'emploi. |
| Données + connexion | **Supabase** (Postgres + Auth, offre gratuite) | Données privées protégées par Row Level Security ; accessibles depuis le téléphone et le PC. |
| Hébergement | **GitHub Pages** ou **Vercel** (gratuits) | Déploiement automatique à chaque push. |
| Installation sur téléphone | **PWA** (icône sur l'écran d'accueil, sans mode hors-ligne) | Effet « vraie app » sans store ; nécessaire pour les notifications. |

**Sécurité, le dépôt étant public**
- Aucune clé secrète dans le code : seule la clé publique `anon` de Supabase est exposée, ce qui est prévu pour ; la protection repose sur la RLS.
- Un fichier `.env.local` ignoré par git ; `.env.example` versionné.
- Connexion par lien magique (email) ou mot de passe, pour un seul compte.

## 7. Feuille de route

**V0.1 — MVP (mécaniques de base)**
- Authentification.
- Familles par défaut, modifiables.
- Habitudes : types simple, durée, quantité ; fréquences quotidienne, jours de la semaine, X fois par semaine ; moments matin / soir.
- Catalogue d'habitudes (ajout en un clic, ajout de modèles perso).
- Vue Aujourd'hui, séries avec jour de grâce, bascule de journée à 4 h.
- XP, niveau global, caractéristiques (affichage simple).
- Tâches simples, listes, blocs de tâches (projets).

**V0.2 — Profondeur**
- Types paliers, compteur, à éviter ; routines à étapes ; fréquences avancées.
- Checklists réutilisables, tâches récurrentes.
- Agenda (jour / semaine / mois) avec filtres, événements.

**V0.3 — Confort**
- Statistiques et heatmaps, succès.
- PWA installable, rappels et notifications.

**Plus tard**
- Avatar (arbre qui grandit) et travail graphique.
- Récompenses réelles et boutique.
- Synchronisation Google Calendar, export et import.

## 8. Questions ouvertes

Aucune question bloquante pour démarrer le MVP. À rediscuter le moment venu :
1. Récompenses réelles : forme et fonctionnement.
2. Valeurs exactes d'XP et courbe de niveau, à ajuster à l'usage.
