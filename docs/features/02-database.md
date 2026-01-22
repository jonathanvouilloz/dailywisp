# Feature 02: Database & Data Model

**Complexité**: M (Medium)
**Statut**: ⬜ TODO

## Description

Mise en place de Dexie.js pour la persistence locale des données utilisateur et sessions.

## Tâches

- [ ] Créer le fichier `lib/db/index.ts` avec la config Dexie
- [ ] Définir les types TypeScript (`User`, `Session`, `Settings`)
- [ ] Créer la table `user` (singleton)
- [ ] Créer la table `sessions` avec index sur `date`, `status`, `mood`
- [ ] Créer les fonctions CRUD pour User
- [ ] Créer les fonctions CRUD pour Sessions
- [ ] Créer le store Svelte `userStore` avec sync Dexie
- [ ] Créer le store Svelte `sessionStore` pour la session en cours
- [ ] Implémenter le calcul de streak (current + longest)
- [ ] Ajouter des helpers pour les dates (timezone-aware)

## Schéma de données

```typescript
interface User {
  id: string;           // UUID
  name: string;
  timezone: string;     // ex: "Europe/Zurich"
  currentStreak: number;
  longestStreak: number;
  createdAt: Date;
  settings: Settings;
}

interface Session {
  id: string;           // UUID
  date: string;         // YYYY-MM-DD (unique)
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

## Notes

- Une seule session par `date` (contrainte unique)
- `text` stocké même si `faded` (pour analytics futures, mais non affiché)
- Streaks calculées à chaque session complétée
- Timezone détectée automatiquement à l'onboarding

## Edge cases

- Si IndexedDB non supporté → message d'erreur clair
- Si corruption de données → possibilité de reset via Settings
