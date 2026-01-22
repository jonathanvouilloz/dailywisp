# Plan d'exécution - Wisp

## Vue d'ensemble

| # | Feature | Complexité | Statut | Fichier détail |
|---|---------|------------|--------|----------------|
| 1 | Setup & Foundation | M | ✅ DONE | [01-setup.md](features/01-setup.md) |
| 2 | Database & Data Model | M | ✅ DONE | [02-database.md](features/02-database.md) |
| 3 | Onboarding | S | ✅ DONE | [03-onboarding.md](features/03-onboarding.md) |
| 4 | Session d'écriture (Core) | L | ✅ DONE | [04-writing-session.md](features/04-writing-session.md) |
| 5 | Calendrier & Historique | M | ✅ DONE | [05-calendar.md](features/05-calendar.md) |
| 6 | Page Journal | S | ✅ DONE | [06-journal.md](features/06-journal.md) |
| 7 | Mood Rating | S | ✅ DONE | [07-mood-rating.md](features/07-mood-rating.md) *(intégré dans /write)* |
| 8 | Partage Post-Session | S | ✅ DONE | [08-sharing.md](features/08-sharing.md) |
| 9 | Export / Import | M | ✅ DONE | [09-export-import.md](features/09-export-import.md) |
| 10 | Settings | S | ✅ DONE | [10-settings.md](features/10-settings.md) |
| 11 | Polish & Deploy | M | 🟡 EN COURS | [11-polish.md](features/11-polish.md) |

**Légende complexité**: S = Small (1-2h), M = Medium (3-5h), L = Large (6h+)

---

## Ordre d'exécution recommandé

### Phase 1: Foundation (Features 1-2)
Objectif: Avoir un projet fonctionnel avec la base de données en place.

1. **Setup & Foundation** - SvelteKit + structure + styles de base
2. **Database & Data Model** - Dexie.js + types + stores

### Phase 2: Core Loop (Features 3-4-7)
Objectif: Le cœur de l'app fonctionne de bout en bout.

3. **Onboarding** - Première expérience utilisateur
4. **Session d'écriture** - La feature principale (jauge, Wisp, timer)
7. **Mood Rating** - Flow post-session obligatoire

### Phase 3: Navigation & Historique (Features 5-6)
Objectif: L'utilisateur peut revoir son historique.

5. **Calendrier** - Home page avec visualisation annuelle
6. **Page Journal** - Lecture des sessions passées

### Phase 4: Extras (Features 8-9-10)
Objectif: Fonctionnalités secondaires mais importantes.

8. **Partage** - Templates et boutons réseaux
9. **Export/Import** - Sauvegarde des données
10. **Settings** - Préférences utilisateur

### Phase 5: Finalisation (Feature 11)
Objectif: Prêt pour la production.

11. **Polish & Deploy** - Tests, responsive, déploiement Vercel

---

## Prochaines étapes immédiates

1. ✅ Initialiser le projet SvelteKit
2. ✅ Installer les dépendances (Dexie, jsPDF)
3. ✅ Créer la structure de dossiers
4. ✅ Configurer les CSS variables et thèmes
5. ✅ Implémenter le modèle de données Dexie
6. 🟡 Polish final et déploiement

---

## Questions résolues

- [x] Choix de la police → **Lora** (serif pour contenu)
- [x] Design exact de Wisp → **CSS avec animations**
- [x] Design de la jauge → **CSS InkGauge component**
- [ ] Nom de domaine

---

## Notes

- **Desktop-first** - L'app est conçue pour l'écriture au clavier
- **100% local** - Aucune donnée serveur, tout en IndexedDB
- **Une session/jour** - Contrainte métier importante
