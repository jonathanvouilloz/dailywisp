# Feature 03: Onboarding

**Complexité**: S (Small)
**Statut**: ⬜ TODO

## Description

Première expérience utilisateur en 3 écrans pour expliquer le concept et capturer le prénom.

## Tâches

- [ ] Créer la route `/onboarding`
- [ ] Écran 1: Introduction + input prénom
- [ ] Écran 2: Explication de la règle + animation texte qui fade
- [ ] Écran 3: Explication de la jauge + animation jauge
- [ ] Ajouter Wisp sur chaque écran (flottant)
- [ ] Implémenter la navigation entre écrans
- [ ] Auto-détecter la timezone via JavaScript
- [ ] Sauvegarder les données user à la fin
- [ ] Rediriger vers `/write` après onboarding
- [ ] Marquer `onboardingDone: true` dans Settings

## Flow détaillé

### Écran 1
```
[Wisp flottant]

"Hey! I'm Wisp. I'll help you free your thoughts."

[Input: What's your name?]

[Continue →]
```

### Écran 2
```
[Wisp flottant]

"Here's the deal, [prénom]:
Write 300 words without stopping.

If you pause too long...
everything fades away."

[Animation: texte qui s'évapore]

[Continue →]
```

### Écran 3
```
[Wisp pointant la jauge]

"Watch your ink gauge.
Keep writing to stay alive."

[Animation: jauge qui monte/descend]

"Ready to free your mind?"

[Start writing →]
```

## Notes

- Pas de skip possible (3 écrans courts ≈ 15 secondes)
- Prénom obligatoire pour continuer
- Animations subtiles, pas de distraction
- Wisp déjà présent pour familiariser l'utilisateur

## Edge cases

- Si user revient après avoir fermé pendant onboarding → reprendre au début
- Si prénom vide → bouton Continue désactivé
