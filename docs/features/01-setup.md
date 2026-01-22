# Feature 01: Setup & Foundation

**Complexité**: M (Medium)
**Statut**: ⬜ TODO

## Description

Initialisation du projet SvelteKit avec toute la configuration de base, les styles globaux, et la structure de dossiers.

## Tâches

- [ ] Initialiser le projet SvelteKit
- [ ] Installer les dépendances principales (Dexie, jsPDF)
- [ ] Créer la structure de dossiers (`lib/components`, `lib/stores`, `lib/db`, `lib/utils`)
- [ ] Configurer TypeScript (strict mode)
- [ ] Créer `app.css` avec les CSS variables (light/dark mode)
- [ ] Configurer le layout de base (`+layout.svelte`)
- [ ] Ajouter les fonts (Google Fonts)
- [ ] Créer les types globaux (`app.d.ts`)
- [ ] Configurer Vercel pour le déploiement

## Décisions techniques

- **Font à choisir**: Lora, Libre Baskerville, Crimson Text, ou EB Garamond (à tester visuellement)

## Notes

- Desktop-first, breakpoints à md (768px) et lg (1024px)
- Pas de Tailwind, CSS vanilla uniquement
- Transitions Svelte natives pour les animations

## Edge cases

- N/A pour cette feature de setup
