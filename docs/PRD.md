# PRD — Wisp

> **Version:** 1.0
> **Date:** 2026-01-18
> **Auteur:** Jonathan Vouilloz
> **Statut:** Draft

---

## 1. Vision & Contexte

### Problème

Les gens ont du mal à écrire librement sans s'auto-censurer. Le syndrome de la page blanche vient souvent de l'over-thinking — on réfléchit trop avant d'écrire, on se relit, on corrige, on bloque.

Les solutions existantes (journaling apps, Morning Pages papier) n'ont pas de mécanisme pour forcer le flow. Sur papier comme sur ordinateur classique, rien n'empêche de s'arrêter, de relire, de douter. Il n'y a pas d'urgence.

### Solution

Une webapp d'écriture quotidienne où le texte s'efface si tu t'arrêtes d'écrire. Une jauge d'encre se vide progressivement pendant les pauses — si elle atteint zéro, tout disparaît. L'objectif : écrire 300 mots sans filtre, chaque jour.

### Utilisateur cible

- Personnes qui veulent développer une habitude d'écriture quotidienne
- Gens qui ont besoin de "vider leur tête" mais bloquent devant la page blanche
- Écrivains, créatifs, ou simplement des personnes introspectives
- Users à l'aise avec l'écriture sur clavier (desktop-first)

### Succès

- L'app est utilisée quotidiennement par son créateur (dogfooding)
- Des utilisateurs complètent des streaks de plusieurs jours
- Le concept "écris ou tout disparaît" résonne et se partage

---

## 2. Scope

### ✅ IN — Ce qu'on fait (MVP)

- [ ] Zone d'écriture avec jauge d'encre (mécanisme anti-stop)
- [ ] Objectif fixe : 300 mots pour valider une session
- [ ] Mascotte "Wisp" (esprit de vapeur) qui réagit à la jauge
- [ ] Sauvegarde locale (IndexedDB, 100% privacy)
- [ ] Calendrier annuel vertical (taches d'encre, visualisation streak)
- [ ] Historique consultable (page journal par jour)
- [ ] Mood rating post-session (5 niveaux + note optionnelle)
- [ ] Partage post-session (templates + copie + boutons réseaux)
- [ ] Export données (JSON, Markdown, TXT, Google Doc, PDF)
- [ ] Import JSON (restauration de données)
- [ ] Onboarding (3 écrans, Wisp guide)
- [ ] Settings (thème clair/sombre/auto, langue EN/FR, reset données)

### ❌ OUT — Ce qu'on ne fait PAS (MVP)

- Notifications push
- Gamification poussée (badges, achievements, leaderboards)
- Multi-device sync (pas de base de données serveur)
- Sons / ambiance lofi
- Configuration de la jauge ou de l'objectif de mots
- Analyse IA du texte

### 🔮 LATER — V2 et au-delà

- Intégration IA locale (WebLLM) pour analyser les pensées et extraire thèmes/émotions
- Sons d'ambiance optionnels
- Modes alternatifs (Sprint 150 / Standard 300 / Deep 500)
- Configuration de la vitesse de jauge (Zen / Normal / Hardcore)
- Streak indéfinie (jauge sans plafond pour récompenser les longues sessions)
- Design avancé de Wisp (Lottie animations, expressions multiples)

---

## 3. User Stories & Flows

### Story 1: Session d'Écriture (Core Feature)

**En tant que** utilisateur
**Je veux** écrire 300 mots sans pouvoir m'arrêter
**Afin de** libérer mes pensées sans filtre ni over-thinking

**Flow détaillé:**
1. J'ouvre l'app → zone d'écriture directement visible, Wisp flotte dans le coin inférieur droit
2. Je tape ma première lettre → la jauge démarre à 50%
3. J'écris → la jauge se remplit (+X% par mot, plafonnée à 100%)
4. Je m'arrête → la jauge se vide (-Y% par seconde)
5. Wisp devient de plus en plus transparent à mesure que la jauge baisse
6. Si jauge = 0% → le texte s'évapore doucement, session "faded" (échouée)
7. Si j'atteins 300 mots → notification subtile "Session validée ✓", la jauge disparaît
8. Je peux continuer à écrire sans pression ou cliquer "Terminer"
9. Écran mood rating → je sélectionne un emoji (obligatoire)
10. Note optionnelle → je peux ajouter un commentaire
11. Écran de partage → je peux partager ou skip
12. Retour au calendrier, session sauvegardée

**Critères d'acceptation:**
- [ ] Jauge démarre à la première frappe
- [ ] Jauge visible, style trait d'encre japonais courbé
- [ ] Affichage du pourcentage uniquement (pas de compteur de mots brut)
- [ ] Wisp flotte doucement en permanence
- [ ] Wisp change d'opacité selon le niveau de jauge
- [ ] Animation d'évaporation douce si échec (texte qui fade)
- [ ] Notification claire à 300 mots atteints
- [ ] Bouton "Terminer" apparaît après 300 mots
- [ ] Auto-save en background (protection contre fermeture accidentelle)
- [ ] Une seule session par jour autorisée

**Edge cases:**
- Si je ferme l'onglet pendant une session non validée → session perdue (pas de brouillon)
- Si je suis à 299 mots et la jauge tombe à 0 → tout perdu, pas de pitié
- Si j'ai déjà complété une session aujourd'hui → accès en lecture seule à la page du jour

**Mécanisme de la jauge (à tester/ajuster):**
```
Départ: 50%
Chaque mot: +3%
Chaque seconde sans écrire: -8%
Plafond: 100%
Seuil de mort: 0%

Exemple:
- À 50%, tu as ~6 secondes avant la mort
- À 100%, tu as ~12 secondes de buffer
```

---

### Story 2: Calendrier & Historique

**En tant que** utilisateur
**Je veux** voir mon historique d'écriture et relire mes sessions passées
**Afin de** suivre ma progression et me remémorer mes pensées

**Flow — Calendrier:**
1. Je vois une grille annuelle verticale stylisée (chaque jour = une tache d'encre)
2. Tache remplie = jour complété (couleur selon le mood)
3. Tache vide = pas écrit ce jour
4. Streak affichée de manière minimaliste (compteur simple, pas de pression)
5. Clic sur jour passé → ouvre la page journal
6. Clic sur aujourd'hui (pas fait) → lance la session d'écriture
7. Clic sur jour futur → bloqué (non cliquable)

**Flow — Page Journal (lecture):**
1. Header: date + nombre de mots + durée + mood emoji
2. Corps: texte complet de la session
3. Navigation: flèches ← → pour jour précédent/suivant
4. Icône export subtile pour exporter cette session
5. Bouton retour au calendrier

**Couleurs des moods sur le calendrier:**
| Mood | Emoji | Label EN | Couleur | Hex |
|------|-------|----------|---------|-----|
| 1 | 😫 | Struggled | Gris ardoise | `#64748b` |
| 2 | 😕 | Tough | Indigo doux | `#6366f1` |
| 3 | 😐 | Steady | Teal | `#14b8a6` |
| 4 | 🙂 | Smooth | Vert sauge | `#22c55e` |
| 5 | 🌊 | Flow | Doré/Ambre | `#f59e0b` |

**Critères d'acceptation:**
- [ ] Grille annuelle verticale avec taches d'encre stylisées
- [ ] Couleur de tache selon mood
- [ ] Streak counter minimaliste visible
- [ ] Page journal avec toutes les infos
- [ ] Navigation fluide entre jours
- [ ] Export individuel depuis page journal
- [ ] Jours futurs non cliquables
- [ ] Sessions "faded" non affichées (comme si rien ne s'était passé)

---

### Story 3: Mood Rating Post-Session

**En tant que** utilisateur
**Je veux** noter comment s'est passée ma session
**Afin de** tracker mes patterns d'écriture sur le long terme

**Flow:**
1. Session validée (300+ mots) → je clique "Terminer"
2. Écran mood: "How was your session today?"
3. 5 emojis cliquables: 😫 😕 😐 🙂 🌊
4. Je sélectionne obligatoirement un emoji
5. Champ texte optionnel: "Add a note (optional)"
6. Bouton "Continue" → passe à l'écran de partage

**Critères d'acceptation:**
- [ ] Écran dédié post-session
- [ ] 5 niveaux de mood avec emojis
- [ ] Sélection obligatoire pour continuer
- [ ] Note textuelle optionnelle
- [ ] UI cohérente avec l'ambiance zen

---

### Story 4: Partage Post-Session

**En tant que** utilisateur
**Je veux** partager ma progression sur les réseaux
**Afin de** célébrer ma discipline et faire découvrir l'app

**Flow:**
1. Après mood rating → écran de partage
2. Je vois plusieurs templates de message prédéfinis
3. Je peux sélectionner un template ou écrire custom
4. Bouton "Copy to clipboard"
5. Boutons réseaux directs (Twitter, LinkedIn)
6. Bouton "Skip" pour ignorer
7. Le lien dans le message pointe vers une landing page dédiée (/start ou /join)
8. Retour au calendrier

**Templates de base:**
```
A) "I wrote [X] words in [Xmin Xs] today. Free your thoughts → [lien]"
B) "Day [X] 🔥 [X] words. Join me → [lien]"
C) "Brain dump complete. [X] words, no filter. → [lien]"
D) [Custom - champ éditable]
```

**Critères d'acceptation:**
- [ ] Écran partage après mood rating
- [ ] 3 templates prédéfinis minimum
- [ ] Variables dynamiques (mots, temps, streak)
- [ ] Champ éditable pour personnaliser
- [ ] Bouton "Copy to clipboard"
- [ ] Boutons Twitter et LinkedIn (minimum)
- [ ] Lien vers landing page dédiée
- [ ] Bouton "Skip" visible

---

### Story 5: Export / Import

**En tant que** utilisateur
**Je veux** exporter et importer mes données
**Afin de** sauvegarder mon historique et le transférer entre devices

**Flow — Export global (Settings):**
1. Je vais dans Settings
2. Section "My data"
3. Bouton "Export all"
4. Choix du format: JSON, Markdown, TXT, Google Doc, PDF
5. Téléchargement du fichier

**Flow — Export session individuelle (Page journal):**
1. Sur une page journal, icône export (subtile, coin supérieur)
2. Même choix de formats
3. Télécharge uniquement cette session

**Flow — Import:**
1. Settings → "Import data"
2. Upload fichier JSON
3. Si conflit détecté (données existantes) → modal "Merge or Replace?"
   - Merge: ajoute les nouvelles, garde les existantes
   - Replace: écrase tout
4. Confirmation → données restaurées

**Critères d'acceptation:**
- [ ] Export global depuis Settings
- [ ] Export individuel depuis page journal (icône subtile)
- [ ] 5 formats: JSON, Markdown, TXT, Google Doc, PDF
- [ ] Import JSON uniquement (seul format réimportable)
- [ ] Détection de conflit avec choix user
- [ ] Double confirmation avant écrasement

---

### Story 6: Onboarding

**En tant que** nouvel utilisateur
**Je veux** comprendre rapidement le concept
**Afin de** commencer ma première session sans friction

**Flow — 3 écrans:**

**Écran 1: Introduction**
```
[Wisp apparaît, flottant]

"Hey! I'm Wisp. I'll help you free your thoughts."

[Input: What's your name?]

[Continue →]
```

**Écran 2: La règle**
```
[Wisp flotte à côté du texte]

"Here's the deal, [prénom]:
Write 300 words without stopping.

If you pause too long...
everything fades away."

[Animation: texte qui s'évapore]

[Continue →]
```

**Écran 3: La jauge**
```
[Wisp pointe vers une jauge animée]

"Watch your ink gauge.
Keep writing to stay alive."

[Animation: jauge qui monte/descend]

"Ready to free your mind?"

[Start writing →]
```

**Comportement:**
- Timezone auto-détectée via JavaScript
- Prénom stocké localement
- Pas de skip (3 écrans courts = ~15 secondes)
- Après onboarding → lance directement la première session
- Onboarding affiché une seule fois (flag localStorage)

**Critères d'acceptation:**
- [ ] 3 écrans maximum
- [ ] Wisp présent et animé sur chaque écran
- [ ] Input prénom obligatoire
- [ ] Auto-détection timezone (pas de question)
- [ ] Animations subtiles (texte fade, jauge)
- [ ] CTA final lance directement la session
- [ ] Flag "onboarding_completed" en localStorage

---

### Story 7: Settings & Configuration

**En tant que** utilisateur
**Je veux** configurer l'app selon mes préférences
**Afin de** personnaliser mon expérience

**Settings MVP:**
| Setting | Options | Défaut |
|---------|---------|--------|
| Theme | Light / Dark / Auto | Auto |
| Language | EN / FR | EN |
| Export all | - | - |
| Import data | - | - |
| Delete all data | - | - |

**Flow — Reset données:**
1. Settings → "Delete all my data"
2. Modal 1: "Are you sure? This action cannot be undone."
3. Modal 2: "Type DELETE to confirm"
4. Input correct → données effacées → retour état initial (onboarding)

**Critères d'acceptation:**
- [ ] Toggle thème (light/dark/auto)
- [ ] Switch langue (EN/FR)
- [ ] Section export/import
- [ ] Bouton reset avec double confirmation
- [ ] Pas de config jauge/objectif (valeurs fixes MVP)

---

## 4. Data Model

### Entités principales

```
┌─────────────────────────────────────────────────────────┐
│                         USER                            │
├─────────────────────────────────────────────────────────┤
│ id              : string (UUID)                         │
│ name            : string                                │
│ timezone        : string (ex: "Europe/Zurich")          │
│ currentStreak   : number                                │
│ longestStreak   : number                                │
│ createdAt       : datetime                              │
│ settings        : Settings (embedded)                   │
└─────────────────────────────────────────────────────────┘
                            │
                            │ 1:N
                            ▼
┌─────────────────────────────────────────────────────────┐
│                        SESSION                          │
├─────────────────────────────────────────────────────────┤
│ id              : string (UUID)                         │
│ date            : date (YYYY-MM-DD, unique)             │
│ status          : enum ("completed", "faded")           │
│ text            : string (nullable si faded)            │
│ wordCount       : number                                │
│ durationSeconds : number                                │
│ mood            : number (1-5)                          │
│ note            : string (nullable)                     │
│ createdAt       : datetime                              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   SETTINGS (embedded)                   │
├─────────────────────────────────────────────────────────┤
│ theme           : enum ("light", "dark", "auto")        │
│ language        : enum ("en", "fr")                     │
│ onboardingDone  : boolean                               │
└─────────────────────────────────────────────────────────┘
```

### Notes sur le modèle

- **Une seule session par `date`** — contrainte unique sur le champ date
- **`text` nullable** — si `status = faded`, le texte n'est pas sauvegardé visiblement mais stocké en hidden (pour analytics futures)
- **`mood` en 1-5** — 1 = struggled (😫), 5 = flow (🌊)
- **Streaks calculées ET stockées** — mise à jour à chaque session complétée
- **100% local** — IndexedDB via Dexie.js, aucune donnée serveur

### Structure Dexie.js

```javascript
import Dexie from 'dexie';

const db = new Dexie('WispDB');

db.version(1).stores({
  user: 'id',
  sessions: 'id, date, status, mood, createdAt'
});

// Types
interface User {
  id: string;
  name: string;
  timezone: string;
  currentStreak: number;
  longestStreak: number;
  createdAt: Date;
  settings: Settings;
}

interface Session {
  id: string;
  date: string; // YYYY-MM-DD
  status: 'completed' | 'faded';
  text: string | null;
  wordCount: number;
  durationSeconds: number;
  mood: 1 | 2 | 3 | 4 | 5;
  note: string | null;
  createdAt: Date;
}

interface Settings {
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'fr';
  onboardingDone: boolean;
}
```

---

## 5. Stack Technique

### Stack choisie

| Couche | Choix | Justification |
|--------|-------|---------------|
| Framework | **SvelteKit** | Interactivité native, léger, familier |
| Database | **Dexie.js** (IndexedDB) | 100% local, persistant, performant |
| Auth | **Aucune** | Pas de compte, tout en local |
| Hosting | **Vercel** | Gratuit, simple, preview branches |
| Styling | **CSS vanilla + CSS variables** | Contrôle total, pas de Tailwind |
| Animations | **Svelte transitions + CSS** | Natif, léger |
| Export PDF | **jsPDF** ou **html2pdf** | Génération côté client |

### Fonts (au choix lors du dev)

- **Libre Baskerville** — Classique, élégant
- **Lora** — Moderne mais warm
- **Crimson Text** — Littéraire, book-like
- **EB Garamond** — Très traditionnel

### Dépendances clés

```json
{
  "dependencies": {
    "dexie": "^4.x",
    "jspdf": "^2.x"
  },
  "devDependencies": {
    "@sveltejs/kit": "^2.x",
    "svelte": "^4.x",
    "typescript": "^5.x"
  }
}
```

---

## 6. Règles & Conventions

### Structure du projet

```
src/
├── lib/
│   ├── components/       # Composants UI réutilisables
│   │   ├── Wisp.svelte
│   │   ├── InkGauge.svelte
│   │   ├── Calendar.svelte
│   │   └── ...
│   ├── stores/           # Svelte stores (état global)
│   │   ├── user.ts
│   │   └── session.ts
│   ├── db/               # Dexie setup et queries
│   │   └── index.ts
│   └── utils/            # Fonctions utilitaires
│       ├── export.ts
│       └── time.ts
├── routes/
│   ├── +page.svelte      # Calendrier (home)
│   ├── write/
│   │   └── +page.svelte  # Session d'écriture
│   ├── journal/
│   │   └── [date]/
│   │       └── +page.svelte  # Page journal
│   ├── onboarding/
│   │   └── +page.svelte
│   └── settings/
│       └── +page.svelte
├── app.css               # Styles globaux + variables
└── app.d.ts              # Types globaux
```

### Conventions de code

**Nommage:**
- Composants: PascalCase (`InkGauge.svelte`)
- Fichiers utilitaires: camelCase (`formatDate.ts`)
- Routes: kebab-case (`/journal/2024-01-15`)
- Variables/fonctions: camelCase
- Constantes: SCREAMING_SNAKE_CASE
- Types/Interfaces: PascalCase

**Patterns obligatoires:**
- Toujours typer les fonctions (paramètres + retour)
- Séparer la logique métier des composants UI
- Un composant = une responsabilité
- Error handling explicite (try/catch)

**À éviter:**
- `any` en TypeScript
- Logique métier complexe dans les composants
- Console.log en production

---

## 7. UI/UX Guidelines

### Style général

**Direction: "Zen Cosy"**

Minimaliste, chaleureux, respirant. Beaucoup d'espace blanc. Tons neutres avec accents d'encre. Animations lentes et fluides comme de la fumée.

### Principes

| Aspect | Direction |
|--------|-----------|
| Espace | Généreux, le contenu respire |
| Couleurs | Palette réduite, tons neutres chauds |
| Typo | Serif pour contenu (journal), sans-serif pour UI |
| Formes | Douces, arrondies |
| Animations | Lentes, fluides, comme de la fumée |
| Densité | Faible, un élément à la fois |

### Palette de couleurs

**Mode clair:**
| Usage | Couleur | Hex |
|-------|---------|-----|
| Background | Blanc cassé / Crème | `#FAF9F6` |
| Background alt | Beige très léger | `#F5F1EB` |
| Texte principal | Encre profonde | `#1A1A1A` |
| Texte secondaire | Gris chaud | `#6B6B6B` |
| Accent (Wisp) | Indigo doux | `#6366f1` |
| Succès | Vert sauge | `#22c55e` |
| Danger (jauge basse) | Ambre | `#f59e0b` |

**Mode sombre:**
| Usage | Couleur | Hex |
|-------|---------|-----|
| Background | Noir encre | `#121212` |
| Background alt | Gris profond | `#1E1E1E` |
| Texte principal | Blanc cassé | `#F5F1EB` |
| Texte secondaire | Gris clair | `#A0A0A0` |
| Accents | Mêmes que light | — |

**Couleurs Mood:**
| Mood | Couleur | Hex |
|------|---------|-----|
| Struggled | Gris ardoise | `#64748b` |
| Tough | Indigo doux | `#6366f1` |
| Steady | Teal | `#14b8a6` |
| Smooth | Vert sauge | `#22c55e` |
| Flow | Doré/Ambre | `#f59e0b` |

### Écran d'écriture (vision)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                                                             │
│         Write. Don't stop.                                  │
│         The words flow like water through my mind and I     │
│         keep typing because stopping means losing           │
│         everything I've written so far..._                  │
│                                                             │
│                                                             │
│                                                             │
│                                                    47%      │
│                                                  ╭────╮     │
│                                                  │ 👻 │     │
│                                                  ╰────╯     │
│                                                  Wisp       │
└─────────────────────────────────────────────────────────────┘
```

- Pas de header
- Pas de menu visible
- Juste le texte, le pourcentage, la jauge, et Wisp
- Wisp pulse doucement, flotte en permanence
- Jauge = trait d'encre japonais courbé au-dessus de Wisp

### Responsive

- **Desktop-first** (écriture au clavier)
- Mobile: utilisable mais pas optimisé
- Breakpoints: md (768px), lg (1024px)

### Mascotte: Wisp

- Petit esprit de vapeur/fumée
- Style: éthéré, translucide, flottant
- Comportement: flotte doucement en permanence
- Opacité: liée au niveau de jauge (transparent quand danger)
- Implémentation: À définir (CSS, SVG, ou Lottie)

### Jauge d'encre

- Style: trait de pinceau calligraphique japonais courbé
- Position: au-dessus de Wisp
- Affichage: pourcentage uniquement
- Animation: se remplit/vide fluidement
- Implémentation: À tester en CSS, sinon SVG

---

## 8. API & Intégrations

### Endpoints internes

Aucun — tout est local, pas de serveur.

### Intégrations externes

| Service | Usage | Notes |
|---------|-------|-------|
| Vercel | Hosting | Gratuit |
| Google Fonts | Polices | CDN |

---

## 9. Sécurité & Auth

### Authentification

- [x] **Pas d'auth** — tout est local, pas de compte utilisateur

### Données sensibles

- Textes personnels stockés uniquement en IndexedDB (navigateur local)
- Aucune donnée envoyée à un serveur
- Export possible pour backup personnel
- Reset complet possible via Settings

---

## 10. Déploiement & Environnement

### Variables d'environnement

Aucune requise pour le MVP (tout est client-side).

```env
# Optionnel: analytics
PUBLIC_ANALYTICS_ID=
```

### Environnements

| Env | URL | Notes |
|-----|-----|-------|
| Local | localhost:5173 | Dev |
| Preview | pr-xxx.vercel.app | PR preview |
| Prod | [domaine à définir] | Production |

---

## 11. Questions ouvertes

- [ ] **Nom de domaine** — inkwisp.com? inkflow.app? autre?
- [ ] **Police exacte** — à choisir parmi: Libre Baskerville, Lora, Crimson Text, EB Garamond
- [ ] **Design Wisp** — style visuel exact, couleur, expressions
- [ ] **Design jauge** — trait d'encre japonais à tester en CSS, sinon SVG
- [ ] **Valeurs de jauge** — à tester et ajuster (départ 50%, +3%/mot, -8%/sec)
- [ ] **Landing page /start** — design et contenu pour les liens partagés

---

## 12. Changelog

| Date | Version | Changements |
|------|---------|-------------|
| 2026-01-18 | 1.0 | Création initiale |
