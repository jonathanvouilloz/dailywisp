# Feature 04: Session d'écriture (Core)

**Complexité**: L (Large)
**Statut**: ⬜ TODO

## Description

La feature principale de l'app: zone d'écriture avec jauge d'encre qui se vide si l'utilisateur arrête d'écrire. Wisp réagit visuellement au niveau de la jauge.

## Tâches

### Zone d'écriture
- [ ] Créer la route `/write`
- [ ] Composant textarea plein écran (pas de header/menu)
- [ ] Placeholder "Write. Don't stop."
- [ ] Focus automatique au chargement
- [ ] Compteur de mots interne (non affiché directement)

### Jauge d'encre
- [ ] Composant `InkGauge.svelte`
- [ ] Style trait d'encre japonais courbé (CSS ou SVG)
- [ ] Position: coin inférieur droit, au-dessus de Wisp
- [ ] Affichage du pourcentage uniquement
- [ ] Animation fluide de remplissage/vidage

### Mécanisme de jauge
- [ ] Démarrage à 50% à la première frappe
- [ ] +3% par mot tapé
- [ ] -8% par seconde d'inactivité
- [ ] Plafond à 100%
- [ ] Seuil de mort à 0%

### Wisp mascotte
- [ ] Composant `Wisp.svelte`
- [ ] Animation flottante permanente
- [ ] Opacité liée au niveau de jauge
- [ ] Position coin inférieur droit

### Validation session
- [ ] Objectif: 300 mots
- [ ] Notification subtile "Session validée ✓" à 300 mots
- [ ] Jauge disparaît après validation
- [ ] Bouton "Terminer" apparaît
- [ ] Possibilité de continuer à écrire sans pression

### Échec session
- [ ] Si jauge = 0% → animation d'évaporation du texte
- [ ] Texte fade out doucement
- [ ] Session marquée "faded" (non sauvegardée visiblement)
- [ ] Redirection vers calendrier

### Auto-save
- [ ] Sauvegarde en background toutes les 10 secondes
- [ ] Protection contre fermeture accidentelle (pendant session validée)

### Navigation post-session
- [ ] Bouton "Terminer" → écran Mood Rating
- [ ] Session sauvegardée avec toutes les métadonnées

## Valeurs de la jauge (à ajuster)

```
Départ: 50%
Chaque mot: +3%
Chaque seconde sans écrire: -8%
Plafond: 100%
Seuil de mort: 0%

Exemple:
- À 50%, tu as ~6 secondes avant la mort
- À 100%, tu as ~12 secondes de buffer
```

## Notes

- Interface minimaliste: juste texte, %, jauge, Wisp
- Desktop-first (clavier)
- Une seule session par jour autorisée

## Edge cases

- Fermeture onglet pendant session non validée → session perdue
- 299 mots et jauge à 0% → tout perdu, pas de pitié
- Session déjà complétée aujourd'hui → accès lecture seule à la page du jour
- Copier-coller → compter les mots collés normalement
