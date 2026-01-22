# Feature 11: Polish & Deploy

**Complexité**: M (Medium)
**Statut**: ⬜ TODO

## Description

Finalisation, tests, responsive, et déploiement sur Vercel.

## Tâches

### Tests & QA
- [ ] Test complet du flow onboarding → écriture → mood → partage
- [ ] Test du mécanisme de jauge (timing correct?)
- [ ] Test des edge cases (fermeture onglet, session déjà faite, etc.)
- [ ] Test export/import (tous formats)
- [ ] Test reset données
- [ ] Test changement de thème
- [ ] Test changement de langue

### Responsive
- [ ] Vérifier sur mobile (utilisable mais pas optimisé)
- [ ] Breakpoints md (768px) et lg (1024px)
- [ ] Taille des textes adaptée
- [ ] Zone d'écriture utilisable sur tablette

### Performance
- [ ] Optimiser le rendu du calendrier (beaucoup de jours)
- [ ] Lazy loading des sessions si nécessaire
- [ ] Bundle size raisonnable

### Accessibilité
- [ ] Navigation clavier
- [ ] Focus visible
- [ ] Contraste suffisant (WCAG AA)
- [ ] Labels pour les inputs

### SEO & Meta
- [ ] Titre et description
- [ ] Open Graph tags pour le partage
- [ ] Favicon
- [ ] manifest.json (PWA basique)

### Landing page
- [ ] Créer `/start` ou `/join` pour les liens partagés
- [ ] Design attractif
- [ ] Call to action clair
- [ ] Explication du concept

### Déploiement
- [ ] Configurer Vercel
- [ ] Vérifier les preview branches
- [ ] Tester en production
- [ ] Monitorer les erreurs (Vercel analytics?)

## Notes

- Desktop-first, mobile utilisable mais pas prioritaire
- PWA basique (manifest) mais pas de service worker pour MVP
- Landing page importante pour la viralité

## Questions ouvertes

- [ ] Nom de domaine final
- [ ] Analytics (respectueux privacy)
- [ ] Error tracking (Sentry?)
