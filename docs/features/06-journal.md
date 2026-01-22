# Feature 06: Page Journal

**Complexité**: S (Small)
**Statut**: ⬜ TODO

## Description

Page de lecture d'une session passée avec toutes ses métadonnées et navigation entre jours.

## Tâches

- [ ] Créer la route `/journal/[date]`
- [ ] Header avec date formatée
- [ ] Affichage du nombre de mots
- [ ] Affichage de la durée
- [ ] Affichage du mood (emoji)
- [ ] Affichage de la note optionnelle (si présente)
- [ ] Corps: texte complet de la session
- [ ] Navigation ← → entre jours adjacents (sessions existantes)
- [ ] Icône export subtile (coin supérieur)
- [ ] Bouton retour au calendrier
- [ ] Style typographique soigné (font serif)

## Layout

```
┌─────────────────────────────────────────────────┐
│  ←  January 15, 2026              [export]  ×   │
├─────────────────────────────────────────────────┤
│                                                 │
│  347 words • 4m 23s • 🌊                        │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  The words flowed today like never before.      │
│  I started thinking about my childhood and      │
│  how the memories come back in fragments,       │
│  like pieces of a dream you try to hold...      │
│                                                 │
│  [... texte complet ...]                        │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  Note: "Felt really good today"                 │
│                                                 │
│                      ←  Jan 14    Jan 16  →     │
└─────────────────────────────────────────────────┘
```

## Notes

- Lecture seule, pas d'édition possible
- Navigation uniquement vers les jours avec sessions complétées
- Export déclenche le même flow que Settings (choix format)
- Font serif pour le texte (style journal)

## Edge cases

- Session sans note → ne pas afficher la section note
- Premier jour de l'utilisateur → pas de flèche ←
- Dernier jour avec session → pas de flèche →
- Date invalide dans l'URL → rediriger vers calendrier
