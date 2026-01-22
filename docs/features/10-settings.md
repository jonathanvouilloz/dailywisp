# Feature 10: Settings

**Complexité**: S (Small)
**Statut**: ⬜ TODO

## Description

Page de configuration avec préférences utilisateur, export/import, et reset des données.

## Tâches

- [ ] Créer la route `/settings`
- [ ] Section "Appearance"
  - [ ] Toggle thème: Light / Dark / Auto
  - [ ] Persistence du choix
  - [ ] Application immédiate
- [ ] Section "Language"
  - [ ] Switch EN / FR
  - [ ] Persistence du choix
  - [ ] Rechargement des textes
- [ ] Section "My Data"
  - [ ] Bouton "Export all" → modal formats
  - [ ] Bouton "Import data" → file picker
- [ ] Section "Danger Zone"
  - [ ] Bouton "Delete all my data"
  - [ ] Double confirmation (modal + input "DELETE")
  - [ ] Reset complet → retour à l'onboarding
- [ ] Bouton retour (vers calendrier)
- [ ] Affichage version de l'app

## Layout

```
┌─────────────────────────────────────────────────┐
│  ←  Settings                                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  APPEARANCE                                     │
│  ┌─────────────────────────────────────────┐    │
│  │ Theme          [Light] [Dark] [Auto]    │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  LANGUAGE                                       │
│  ┌─────────────────────────────────────────┐    │
│  │ Language       [EN] [FR]                │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  MY DATA                                        │
│  ┌─────────────────────────────────────────┐    │
│  │ Export all data          [Export]       │    │
│  │ Import from backup       [Import]       │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  DANGER ZONE                                    │
│  ┌─────────────────────────────────────────┐    │
│  │ Delete all my data       [Delete]       │    │
│  │ This cannot be undone.                  │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│                              v1.0.0             │
└─────────────────────────────────────────────────┘
```

## Settings disponibles (MVP)

| Setting | Options | Défaut |
|---------|---------|--------|
| Theme | Light / Dark / Auto | Auto |
| Language | EN / FR | EN |

## Notes

- Pas de config jauge/objectif (valeurs fixes pour MVP)
- Auto theme = suit les préférences système
- Langue change tous les textes de l'interface
- Version affichée en bas de page

## Edge cases

- Reset pendant une session active → annuler la session
- Import échoué → ne pas perdre les données existantes
- Changement de langue → recharger tous les composants
