# Feature 08: Partage Post-Session

**Complexité**: S (Small)
**Statut**: ⬜ TODO

## Description

Écran optionnel pour partager sa progression sur les réseaux sociaux après le mood rating.

## Tâches

- [ ] Créer la route `/share` (ou modal/overlay)
- [ ] Afficher 3-4 templates de message prédéfinis
- [ ] Variables dynamiques: mots, temps, streak
- [ ] Champ éditable pour personnaliser le message
- [ ] Bouton "Copy to clipboard"
- [ ] Bouton Twitter (intent link)
- [ ] Bouton LinkedIn (intent link)
- [ ] Bouton "Skip" bien visible
- [ ] Lien vers landing page dans les messages
- [ ] Retour au calendrier après action

## Templates de messages

```
A) "I wrote [X] words in [Xmin Xs] today. Free your thoughts → [lien]"

B) "Day [X] 🔥 [X] words. Join me → [lien]"

C) "Brain dump complete. [X] words, no filter. → [lien]"

D) [Custom - champ éditable]
```

## Layout

```
┌─────────────────────────────────────────────────┐
│                                                 │
│        Share your progress                      │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │ ○ I wrote 347 words in 4m 23s today.   │   │
│   │   Free your thoughts → wisp.app        │   │
│   └─────────────────────────────────────────┘   │
│   ┌─────────────────────────────────────────┐   │
│   │ ○ Day 12 🔥 347 words. Join me →        │   │
│   │   wisp.app                              │   │
│   └─────────────────────────────────────────┘   │
│   ┌─────────────────────────────────────────┐   │
│   │ ● Brain dump complete. 347 words,      │   │
│   │   no filter. → wisp.app                │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │ Edit your message...                    │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   [📋 Copy]    [𝕏 Tweet]    [in LinkedIn]      │
│                                                 │
│                   [Skip]                        │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Notes

- Templates sélectionnables (radio buttons)
- Custom = édition libre du texte
- Lien landing page à créer séparément (`/start` ou `/join`)
- Skip doit être visible et accessible (pas de dark pattern)

## Edge cases

- Pas de streak encore → template B sans streak
- Copie réussie → feedback visuel "Copied!"
- Réseau social bloqué → le lien s'ouvre quand même (external)
