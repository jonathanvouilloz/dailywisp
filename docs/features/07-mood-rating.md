# Feature 07: Mood Rating

**Complexité**: S (Small)
**Statut**: ⬜ TODO

## Description

Écran post-session obligatoire pour noter le ressenti avec un emoji et une note optionnelle.

## Tâches

- [ ] Créer la route `/mood` (ou modal/overlay)
- [ ] Titre "How was your session today?"
- [ ] 5 emojis cliquables en ligne
- [ ] Sélection visuelle claire (highlight)
- [ ] Champ texte optionnel "Add a note (optional)"
- [ ] Bouton "Continue" (désactivé si pas de mood sélectionné)
- [ ] Sauvegarde du mood et note dans la session
- [ ] Navigation vers écran de partage

## Moods disponibles

| Niveau | Emoji | Label EN | Description |
|--------|-------|----------|-------------|
| 1 | 😫 | Struggled | Session difficile |
| 2 | 😕 | Tough | Un peu laborieux |
| 3 | 😐 | Steady | Normal, neutre |
| 4 | 🙂 | Smooth | Fluide, agréable |
| 5 | 🌊 | Flow | État de flow total |

## Layout

```
┌─────────────────────────────────────────────────┐
│                                                 │
│                                                 │
│        How was your session today?              │
│                                                 │
│         😫    😕    😐    🙂    🌊              │
│                         [●]                     │
│                                                 │
│        ┌─────────────────────────────────┐      │
│        │ Add a note (optional)           │      │
│        │                                 │      │
│        └─────────────────────────────────┘      │
│                                                 │
│               [ Continue → ]                    │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Notes

- UI zen, cohérente avec le reste de l'app
- Sélection obligatoire (pas de skip)
- Note limitée à ~200 caractères
- Emojis assez grands pour être cliquables facilement

## Edge cases

- Fermeture de l'onglet avant validation → session sauvegardée sans mood (à gérer?)
- Très long texte dans la note → tronquer ou limiter
