# Feature 09: Export / Import

**Complexité**: M (Medium)
**Statut**: ⬜ TODO

## Description

Permettre l'export des données dans plusieurs formats et l'import JSON pour restauration/transfert.

## Tâches

### Export global (Settings)
- [ ] Section "My data" dans Settings
- [ ] Bouton "Export all"
- [ ] Modal de choix de format
- [ ] Export JSON (format réimportable)
- [ ] Export Markdown (un fichier par session)
- [ ] Export TXT (texte brut, un fichier)
- [ ] Export Google Doc (via API ou format .docx)
- [ ] Export PDF (via jsPDF)
- [ ] Téléchargement du fichier généré

### Export session individuelle
- [ ] Icône export sur page journal
- [ ] Mêmes formats disponibles
- [ ] Export de cette session uniquement

### Import
- [ ] Section "Import data" dans Settings
- [ ] Upload fichier JSON uniquement
- [ ] Validation du format JSON
- [ ] Détection de conflit (données existantes)
- [ ] Modal "Merge or Replace?"
  - Merge: ajoute les nouvelles sessions, garde les existantes
  - Replace: écrase tout
- [ ] Double confirmation avant écrasement
- [ ] Feedback succès/erreur

## Formats de fichiers

### JSON (réimportable)
```json
{
  "version": "1.0",
  "exportedAt": "2026-01-19T10:30:00Z",
  "user": {
    "name": "Jonathan",
    "timezone": "Europe/Zurich",
    "currentStreak": 12,
    "longestStreak": 45
  },
  "sessions": [
    {
      "date": "2026-01-15",
      "text": "...",
      "wordCount": 347,
      "durationSeconds": 263,
      "mood": 5,
      "note": "Felt great"
    }
  ]
}
```

### Markdown
```markdown
# Wisp Journal - Jonathan

## January 15, 2026
**347 words** • 4m 23s • 🌊

The words flowed today...

---

## January 14, 2026
...
```

### TXT
```
WISP JOURNAL - Jonathan

---
January 15, 2026 (347 words, 4m 23s, Flow)

The words flowed today...

---
January 14, 2026...
```

## Notes

- JSON seul format réimportable
- PDF généré côté client avec jsPDF
- Google Doc = export .docx (Microsoft Word format, compatible)
- Markdown = fichier .md unique avec toutes les sessions

## Edge cases

- Export de données volumineuses → feedback de progression
- JSON invalide à l'import → message d'erreur clair
- Conflit de dates → stratégie de merge (garder la plus récente?)
