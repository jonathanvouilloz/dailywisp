# Style Guide - Wisp

## Conventions de nommage

### Fichiers

| Type | Convention | Exemple |
|------|------------|---------|
| Composants Svelte | PascalCase | `InkGauge.svelte`, `WispMascot.svelte` |
| Fichiers utils | camelCase | `formatDate.ts`, `exportToPdf.ts` |
| Stores | camelCase | `userStore.ts`, `sessionStore.ts` |
| Routes | kebab-case | `/journal/2024-01-15` |
| CSS | kebab-case | `ink-gauge.css` |

### Code

| Type | Convention | Exemple |
|------|------------|---------|
| Variables | camelCase | `currentStreak`, `wordCount` |
| Fonctions | camelCase | `calculateGauge()`, `saveSession()` |
| Constantes | SCREAMING_SNAKE | `MAX_WORDS`, `GAUGE_DECAY_RATE` |
| Types/Interfaces | PascalCase | `Session`, `UserSettings` |
| Enums | PascalCase | `MoodLevel`, `SessionStatus` |
| Props Svelte | camelCase | `isActive`, `onComplete` |

---

## Structure des fichiers

### Composant Svelte type

```svelte
<script lang="ts">
  // 1. Imports
  import { onMount } from 'svelte';
  import type { Session } from '$lib/types';

  // 2. Props
  export let session: Session;
  export let onComplete: () => void;

  // 3. State local
  let isLoading = false;

  // 4. Reactive statements
  $: wordCount = session.text?.split(/\s+/).length ?? 0;

  // 5. Fonctions
  function handleClick() {
    // ...
  }

  // 6. Lifecycle
  onMount(() => {
    // ...
  });
</script>

<!-- Template -->
<div class="component-name">
  <!-- ... -->
</div>

<style>
  .component-name {
    /* ... */
  }
</style>
```

### Fichier TypeScript type

```typescript
// 1. Imports (types d'abord)
import type { User, Session } from './types';
import { db } from './db';

// 2. Constantes
const DEFAULT_GAUGE = 50;

// 3. Types locaux (si nécessaire)
interface LocalOptions {
  // ...
}

// 4. Fonctions (exportées en dernier)
function privateHelper(): void {
  // ...
}

export function publicFunction(param: string): number {
  // ...
}
```

---

## CSS & Design

### CSS Variables (app.css)

```css
:root {
  /* Colors - Light mode */
  --color-bg: #FAF9F6;
  --color-bg-alt: #F5F1EB;
  --color-text: #1A1A1A;
  --color-text-muted: #6B6B6B;
  --color-accent: #6366f1;
  --color-success: #22c55e;
  --color-danger: #f59e0b;

  /* Moods */
  --mood-struggled: #9B95A5;
  --mood-tough: #8AACC8;
  --mood-steady: #9CB8A0;
  --mood-smooth: #E8B89D;
  --mood-flow: #E8C87D;

  /* Typography */
  --font-body: 'Lora', serif;  /* À confirmer */
  --font-ui: system-ui, sans-serif;

  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 2rem;
  --space-xl: 4rem;

  /* Borders */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 300ms ease;
  --transition-slow: 500ms ease;
}

[data-theme="dark"] {
  --color-bg: #121212;
  --color-bg-alt: #1E1E1E;
  --color-text: #F5F1EB;
  --color-text-muted: #A0A0A0;
}
```

### Classes utilitaires (à utiliser avec parcimonie)

```css
/* Spacing */
.mt-sm { margin-top: var(--space-sm); }
.mt-md { margin-top: var(--space-md); }
.mt-lg { margin-top: var(--space-lg); }

/* Text */
.text-muted { color: var(--color-text-muted); }
.text-center { text-align: center; }

/* Layout */
.flex { display: flex; }
.flex-center { display: flex; justify-content: center; align-items: center; }
```

### Animations

```css
/* Animations lentes et fluides (direction Zen) */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes evaporate {
  to {
    opacity: 0;
    transform: translateY(-20px);
    filter: blur(4px);
  }
}

/* Durées standard */
.animate-float { animation: float 3s ease-in-out infinite; }
.animate-fade-in { animation: fade-in 0.5s ease; }
```

---

## Patterns de code

### Gestion d'erreurs

```typescript
// Toujours avec try/catch explicite
async function saveSession(session: Session): Promise<boolean> {
  try {
    await db.sessions.add(session);
    return true;
  } catch (error) {
    console.error('Failed to save session:', error);
    return false;
  }
}
```

### Typage strict

```typescript
// ✅ Bon
function calculateGauge(wordCount: number, elapsedMs: number): number {
  // ...
}

// ❌ Mauvais
function calculateGauge(wordCount, elapsedMs) {
  // ...
}
```

### Stores Svelte

```typescript
// stores/session.ts
import { writable, derived } from 'svelte/store';
import type { Session } from '$lib/types';

function createSessionStore() {
  const { subscribe, set, update } = writable<Session | null>(null);

  return {
    subscribe,
    start: () => update(s => ({ ...initialSession })),
    addWord: () => update(s => s ? { ...s, wordCount: s.wordCount + 1 } : s),
    reset: () => set(null)
  };
}

export const session = createSessionStore();
```

---

## Commits

### Format Conventional Commits

```
<type>(<scope>): <description>

[body optionnel]
```

### Types

| Type | Usage |
|------|-------|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `docs` | Documentation uniquement |
| `style` | Formatage (pas de changement de code) |
| `refactor` | Refactoring (pas de nouvelle feature ni fix) |
| `test` | Ajout/modification de tests |
| `chore` | Maintenance, dépendances |

### Exemples

```bash
feat(writing): add ink gauge component
fix(session): prevent double save on completion
docs: update README with setup instructions
refactor(db): simplify session queries
chore: upgrade svelte to 4.2.0
```

### Scopes suggérés

`writing`, `calendar`, `journal`, `onboarding`, `settings`, `export`, `db`, `ui`, `store`

---

## À éviter

- `any` en TypeScript
- Logique métier dans les composants (extraire dans utils/stores)
- `console.log` en production (utiliser un wrapper si nécessaire)
- Styles inline (sauf cas très spécifique)
- Magic numbers (utiliser des constantes nommées)
- Composants de plus de 200 lignes (découper)
