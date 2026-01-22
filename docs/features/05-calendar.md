# Feature 05: Calendrier & Historique

**Complexité**: M (Medium)
**Statut**: ⬜ TODO

## Description

Page d'accueil avec visualisation annuelle des sessions sous forme de taches d'encre colorées selon le mood.

## Tâches

- [ ] Créer la route `/` (home = calendrier)
- [ ] Composant `Calendar.svelte` (grille annuelle verticale)
- [ ] Chaque jour = une tache d'encre stylisée
- [ ] Couleur de tache selon mood du jour
- [ ] Jours non complétés = tache vide/transparente
- [ ] Compteur de streak minimaliste
- [ ] Clic sur jour passé → navigation vers `/journal/[date]`
- [ ] Clic sur aujourd'hui (pas fait) → navigation vers `/write`
- [ ] Jours futurs non cliquables (visuellement désactivés)
- [ ] Sessions "faded" non affichées

## Couleurs des moods

| Mood | Emoji | Couleur | Hex |
|------|-------|---------|-----|
| 1 - Struggled | 😫 | Gris ardoise | `#64748b` |
| 2 - Tough | 😕 | Indigo doux | `#6366f1` |
| 3 - Steady | 😐 | Teal | `#14b8a6` |
| 4 - Smooth | 🙂 | Vert sauge | `#22c55e` |
| 5 - Flow | 🌊 | Doré/Ambre | `#f59e0b` |

## Design

```
┌─────────────────────────────────────────┐
│  2026                      🔥 12 days   │
├─────────────────────────────────────────┤
│                                         │
│  January                                │
│  ○ ○ ● ● ○ ● ● ○ ○ ● ● ● ● ○ ○        │
│  ● ● ● ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○      │
│                                         │
│  February                               │
│  ...                                    │
│                                         │
└─────────────────────────────────────────┘

● = jour complété (couleur = mood)
○ = jour sans session
```

## Notes

- Scroll vertical pour naviguer dans l'année
- Année en cours uniquement (pas de navigation année précédente pour MVP)
- Design minimaliste, beaucoup d'espace
- Taches d'encre = style pinceau japonais

## Edge cases

- Nouvel utilisateur → calendrier vide
- Changement d'année → afficher nouvelle année
- Beaucoup de sessions → performance du rendu
