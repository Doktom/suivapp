# Cahier des charges — Suivapp (webapp personnelle d'habitudes)

> Version 0.3 — 10 novembre 2026 — statut : **MVP livré, conception V0.2 validée**
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

Principe : rester **simple**. On ne cherche pas à mesurer finement (litres d'eau, nombre de pas, verres) ; la nuance passe par les **niveaux**.

- *Simple* (par défaut) : fait / pas fait.
- *Durée* / *Quantité* : objectif en minutes ou chiffré (existant depuis le MVP, à garder léger, sans le développer davantage).
- *Niveaux* **[V0.2]** : plusieurs façons de réaliser l'habitude, du plus léger au plus complet, chacune rapportant plus d'XP. Exemple, étirements du matin : **Rapide** (2 min), **Normal** (5 min), **Complet** (10 min).
  - Chaque niveau a un nom (Rapide / Normal / Complet par défaut, renommables), une durée ou une description facultative.
  - 1 à 4 niveaux par habitude. Le principe s'applique à n'importe quelle habitude ou routine.
  - À la validation, on choisit le niveau réalisé en un geste. Le niveau le plus léger suffit pour garder la série.
- *À éviter* **[V0.2]** : jour réussi si aucun écart n'est noté ; on note les écarts quand ils arrivent. Variantes :
  - interdiction simple (« ne pas fumer ») ;
  - **avec heure limite** (« ne pas fumer avant 12 h », « pas d'écran après 22 h ») : seuls les écarts dans le créneau comptent ;
  - **avec tolérance** (« pas trop de sucre ») : un nombre d'écarts tolérés par jour ou par semaine avant que la journée soit manquée.
  - La réussite est constatée automatiquement à la bascule de la journée (4 h) et l'XP créditée à ce moment-là ; on peut aussi confirmer « tenu » le soir pour la voir tout de suite.
- *Compteur* : abandonné (trop détaillé). Une habitude comme « boire de l'eau » se suit en simple ou en niveaux.

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
- **1 jour de grâce par semaine** et par habitude : un oubli isolé ne casse pas la série. Il s'applique automatiquement et reste visible dans l'historique. Pour un quota hebdomadaire, cela revient à pardonner une séance manquée, avec au moins une séance réalisée dans la semaine.

### 3.3 Catalogue d'habitudes

Modèles prêts à l'emploi, avec des réglages suggérés modifiables à l'ajout. On peut **ajouter ses propres modèles** au catalogue, ou enregistrer une habitude existante comme modèle.

| Famille | Habitude | Suivi suggéré | Fréquence suggérée |
|---|---|---|---|
| Danse | Cours de danse | Durée (60 min) | 2 à 3 fois / semaine |
| Danse | Entraînement perso / révision de chorégraphie | Niveaux (15 / 30 / 45 min) | 2 fois / semaine |
| Danse | Travail technique (pointes, tours, isolations…) | Durée (15 min) | 3 fois / semaine |
| Souplesse | Routine étirements du matin | Routine en niveaux (Rapide 2 min / Normal 5 min / Complet 10 min) | Tous les jours, matin |
| Souplesse | Routine étirements du soir | Routine en niveaux (Rapide / Normal / Complet) | Tous les jours, soir |
| Souplesse | Séance grand écart / souplesse profonde | Durée (20 min) | 2 fois / semaine |
| Sport | Renforcement musculaire | Durée (30 min) | 2 à 3 fois / semaine |
| Sport | Gainage | Niveaux (2 / 4 / 6 min) | Tous les jours |
| Sport | Cardio (course, vélo, corde) | Durée (30 min) | 2 fois / semaine |
| Sport | Marche | Niveaux (courte / normale / longue) | Tous les jours |
| Skincare & soins | Routine skincare du matin | Routine (nettoyant, sérum, crème, SPF) | Tous les jours, matin |
| Skincare & soins | Routine skincare du soir | Routine (démaquillage, nettoyant, soin, crème) | Tous les jours, soir |
| Skincare & soins | Masque / exfoliation | Simple | 1 à 2 fois / semaine |
| Skincare & soins | Soin des cheveux | Simple | 1 fois / semaine |
| Santé | Boire de l'eau | Simple | Tous les jours |
| Santé | Se coucher avant 23 h | Simple | Tous les jours |
| Santé | Manger des légumes | Simple | Tous les jours |
| Santé | Pas de grignotage | À éviter | Tous les jours |
| Santé | Pas trop de sucre | À éviter (tolérance : 1 écart / jour) | Tous les jours |
| Santé | Ne pas fumer avant 12 h | À éviter (heure limite) | Tous les jours |
| Mental & bien-être | Méditation | Durée (10 min) | Tous les jours |
| Mental & bien-être | Journal / gratitude | Simple | Tous les jours, soir |
| Mental & bien-être | Pas d'écran après 22 h | À éviter | Tous les jours |
| Maison | Faire son lit | Simple | Tous les jours, matin |
| Maison | Vaisselle / cuisine rangée | Simple | Tous les jours, soir |
| Maison | 15 min de rangement | Durée (15 min) | Tous les jours |
| Maison | Grand ménage | Bloc de tâches (checklist réutilisable) | 1 fois / semaine |
| Maison | Lessive | Simple | 2 fois / semaine |
| Apprentissage & créativité | Lecture | Niveaux (quelques pages / un chapitre / une longue session) | Tous les jours |
| Apprentissage & créativité | Langue étrangère | Durée (15 min) | 5 fois / semaine |

### 3.4 Routines **[V0.2]**

- Une routine est une **habitude composée d'étapes** à cocher dans l'ordre (ex. étirements du soir : ischios → fessiers → dos → épaules).
- Elle est validée quand toutes les étapes sont faites ; validation partielle possible (XP au prorata).
- Étapes ajoutables, supprimables, réordonnables ; durée facultative par étape.
- **Routine en niveaux** : chaque niveau (Rapide / Normal / Complet) choisit les étapes qu'il contient. Ex. étirements du matin Rapide = 2 étapes, Complet = toutes.
- Techniquement : les étapes sont stockées sur l'habitude, et la validation enregistre les étapes cochées. On ne passe pas par les blocs de tâches, ce qui garde la logique de séries et d'XP des habitudes.

### 3.5 Tâches

- **Tâche simple** : titre, note, échéance facultative, priorité (basse / normale / haute).
- **Listes** : regrouper des tâches par thème (Courses, Admin, Maison…).
- **Blocs de tâches (projets)** : une tâche parente avec sous-tâches cochables et une barre de progression. **[MVP]**
- **Checklists réutilisables** : un modèle de bloc (« préparer un voyage », « ménage du dimanche ») qu'on relance quand on veut, ou automatiquement selon une fréquence. Chaque lancement crée un **nouveau bloc**, ce qui garde l'historique des fois précédentes. **[V0.2]**
- **Tâches récurrentes** **[V0.2]**, deux modes au choix par tâche :
  - *calendrier fixe* : la tâche revient à date fixe, même si la précédente n'est pas faite (ex. « payer le loyer » le 5 de chaque mois) ;
  - *après réalisation* : l'occurrence suivante est créée quand on coche la tâche, à N jours / semaines / mois de la date de réalisation (ex. « changer les draps » 2 semaines après la dernière fois).
  - Le même réglage de récurrence sert aux checklists réutilisables.
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
- Les habitudes sans jour fixe (« X fois par semaine ») ne sont pas placées sur un jour : elles apparaissent dans un **bandeau « cette semaine »** avec leur avancement (ex. 1 / 3).
- Événements : nouvelle table dédiée (section 5).

### 3.7 Gamification (mécaniques RPG)

**XP et niveaux**
- Chaque validation rapporte de l'XP :
  - habitude simple : 10 XP ;
  - habitude en niveaux : 10 XP au premier niveau, +5 XP par niveau au-dessus (ex. Rapide 10, Normal 15, Complet 20) ;
  - habitude durée / quantité : XP proportionnelle à l'objectif atteint ;
  - habitude à éviter : 10 XP par journée tenue, créditée à la bascule de la journée ;
  - routine : 10 XP + 2 XP par étape ;
  - tâche : 5 / 10 / 20 XP selon la priorité ; sous-tâche d'un bloc : 5 XP ; bloc terminé : bonus de 25 XP ;
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
ModèleHabitude  (id, famille_id, nom, type_suivi, objectif, unité, niveaux[], fréquence, moment,
                 étapes[], prédéfini [catalogue d'origine ou ajouté par l'utilisateur])
Habitude        (id, famille_id, nom, description, icône,
                 type_suivi[simple|quantité|durée|niveaux|à_éviter|routine],
                 objectif, unité,
                 niveaux[{nom, durée?, description?, étapes[]?}],
                 évitement{heure_limite?, tolérance?, période_tolérance[jour|semaine]},
                 fréquence{type[quotidien|jours_semaine|x_par_période|tous_les_n_jours], jours[], nb, période, intervalle},
                 moments[matin|journée|soir], horaire,
                 date_début, date_fin, en_pause, archivée)
ÉtapeRoutine    (id, habitude_id, nom, ordre, durée)
Écart           (id, habitude_id, date_jour, heure, note)
Validation      (id, habitude_id, date_jour, moment, valeur, niveau_atteint, étapes_faites[],
                 jour_de_grâce, xp_gagnée)
Liste           (id, nom, couleur)
Tâche           (id, liste_id, parent_id [blocs], titre, note, échéance, priorité,
                 récurrence{mode[fixe|après_réalisation], intervalle, unité[jour|semaine|mois]},
                 modèle_id, terminée_le, xp_gagnée)
ModèleBloc      (id, nom, sous_tâches[], récurrence)
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
- Habitudes : types simple, durée, quantité ; fréquences quotidienne, jours de la semaine, X fois par semaine ; moments matin / journée / soir.
- Catalogue d'habitudes (ajout en un clic, ajout de modèles perso).
- Vue Aujourd'hui, séries avec jour de grâce, bascule de journée à 4 h.
- XP, niveau global, caractéristiques (affichage simple).
- Tâches simples, listes, blocs de tâches (projets).

**V0.2 — Profondeur**
- Niveaux (Rapide / Normal / Complet) ; habitudes à éviter (heure limite, tolérance) ; routines à étapes, en niveaux ; fréquences avancées.
- Checklists réutilisables, tâches récurrentes (calendrier fixe ou après réalisation).
- Agenda (jour / semaine / mois) avec filtres, événements, bandeau « cette semaine ».

**V0.3 — Confort**
- Statistiques et heatmaps, succès.
- PWA installable, rappels et notifications.

**Plus tard**
- Avatar (arbre qui grandit) et travail graphique.
- Récompenses réelles et boutique.
- Synchronisation Google Calendar, export et import.

## 8. Questions ouvertes

Aucune question bloquante pour la V0.2. À rediscuter le moment venu :
1. Récompenses réelles : forme et fonctionnement.
2. Valeurs exactes d'XP et courbe de niveau, à ajuster à l'usage.
3. Agenda : FullCalendar ou composant maison, à trancher au début du lot agenda.
