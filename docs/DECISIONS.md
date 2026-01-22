# Log des décisions techniques - Wisp

Format: Date | Décision | Contexte | Alternatives considérées

---

## 2026-01-19

### DECISION-001: SvelteKit comme framework
**Contexte**: Besoin d'un framework léger avec bonne gestion de l'interactivité pour l'écriture en temps réel.
**Décision**: SvelteKit 2.x
**Alternatives**:
- Next.js (trop lourd, React overhead)
- Vue/Nuxt (moins familier)
- Vanilla JS (trop de boilerplate)
**Justification**: Réactivité native, bundle léger, familiarité du développeur.

---

### DECISION-002: Dexie.js pour la persistence locale
**Contexte**: Toutes les données doivent rester en local (privacy), avec support offline.
**Décision**: Dexie.js (wrapper IndexedDB)
**Alternatives**:
- localStorage (limité à 5MB, pas adapté pour beaucoup de texte)
- IndexedDB natif (API complexe)
- PouchDB (overkill, sync non nécessaire)
**Justification**: API simple, performant, support des index, compatible avec les types TypeScript.

---

### DECISION-003: CSS vanilla (pas de Tailwind)
**Contexte**: Design "Zen Cosy" avec animations fluides et contrôle précis.
**Décision**: CSS vanilla avec CSS variables
**Alternatives**:
- Tailwind (trop utilitaire, perte de contrôle sur les animations)
- SCSS (pas nécessaire, CSS moderne suffit)
**Justification**: Contrôle total sur le design, animations natives CSS, cohérence avec la philosophie minimaliste.

---

### DECISION-004: Pas d'authentification
**Contexte**: Privacy-first, pas de tracking, pas de compte.
**Décision**: Aucun système d'auth, tout en local
**Alternatives**:
- Auth anonyme (complexifie inutilement)
- Passkeys (overkill pour un MVP)
**Justification**: Simplicité maximale, respect total de la vie privée, pas de backend à maintenir.

---

### DECISION-005: Structure de features en fichiers séparés
**Contexte**: Organisation du projet pour faciliter le suivi et la collaboration.
**Décision**: Un fichier markdown par feature dans `docs/features/`
**Alternatives**:
- Tout dans un seul fichier (difficile à naviguer)
- Issues GitHub (nécessite un repo)
**Justification**: Navigation facile, historique clair, indépendant de GitHub.

---

## Template pour nouvelles décisions

```markdown
### DECISION-XXX: [Titre court]
**Contexte**: [Pourquoi cette décision est nécessaire]
**Décision**: [Ce qui a été décidé]
**Alternatives**:
- [Option 1]
- [Option 2]
**Justification**: [Pourquoi cette option a été choisie]
```
