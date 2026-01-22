# Wisp - Guide de développement

## Skill à utiliser
Utiliser le skill `frontend-design` pour tous les composants UI:
- Interfaces distinctives et production-grade
- Éviter l'esthétique générique AI
- Design "Zen Cosy" (minimaliste, chaleureux, respirant)

## Stack
- SvelteKit 2.x
- Dexie.js (IndexedDB)
- CSS vanilla (pas de Tailwind)
- TypeScript strict

## Design direction
- Tons neutres chauds (#FAF9F6 light, #121212 dark)
- Animations lentes et fluides (comme de la fumée)
- Police serif pour contenu (Lora)
- Desktop-first

## Architecture
```
src/
├── lib/
│   ├── components/    # UI components (Wisp, InkGauge, Calendar...)
│   ├── stores/        # Svelte stores
│   ├── db/            # Dexie setup
│   ├── utils/         # Helpers
│   └── types.ts       # Types globaux
├── routes/
│   ├── +layout.svelte
│   ├── +page.svelte   # Home (Calendar)
│   ├── write/
│   ├── journal/[date]/
│   ├── onboarding/
│   ├── mood/
│   ├── share/
│   └── settings/
└── app.css
```

## Constantes clés
- `WORD_TARGET = 300` - Mots à atteindre
- `GAUGE_START = 50` - Jauge initiale (%)
- `GAUGE_PER_WORD = 3` - Gain par mot (%)
- `GAUGE_DECAY_PER_SEC = 8` - Perte par seconde (%)

## Références
- PRD: docs/PRD.md
- Style Guide: docs/STYLEGUIDE.md
- Décisions: docs/DECISIONS.md
- Features: docs/features/
