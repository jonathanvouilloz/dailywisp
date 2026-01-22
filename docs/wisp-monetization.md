# Wisp — Monétisation & Data Safety

> **Version:** 1.0
> **Date:** 2026-01-20
> **Statut:** Draft

---

## 1. Contexte: Stockage Local

### Comment ça fonctionne

Wisp stocke toutes les données en local via IndexedDB (navigateur). Aucun serveur, aucun compte utilisateur. Privacy-first.

### Risques de perte de données

| Action utilisateur | Données perdues? |
|-------------------|------------------|
| Effacer cookies seuls | ❌ Non |
| Effacer historique de navigation | ❌ Non |
| Effacer "données de site" / "stockage" | ✅ Oui |
| "Clear all browsing data" (tout coché) | ✅ Oui |
| Navigation privée / incognito | ✅ Jamais sauvegardé |
| Changer de navigateur | ✅ Pas de données |
| Réinstaller le navigateur | ✅ Tout perdu |
| Nouvel ordinateur | ✅ Tout perdu |

### Conséquence

L'utilisateur est responsable de ses backups. On doit:
1. L'informer clairement (onboarding)
2. Lui rappeler régulièrement (reminder)
3. Lui offrir une solution premium (cloud backup)

---

## 2. Ajouts au MVP (Free)

### A. Mention Onboarding

Ajouter un 4ème écran ou intégrer dans l'écran existant:

```
┌────────────────────────────────────────┐
│                                        │
│   🔒 Your thoughts stay private        │
│                                        │
│   Everything is stored locally on      │
│   your device. No account, no server,  │
│   no one can read your words.          │
│                                        │
│   This means: backup = your job.       │
│   We'll remind you to export           │
│   your data regularly.                 │
│                                        │
│              [Got it →]                │
│                                        │
└────────────────────────────────────────┘
```

### B. Backup Reminder (toutes les 10 sessions)

**Trigger:** À chaque 10ème session complétée (10, 20, 30...)

**UI:**

```
┌────────────────────────────────────────┐
│                                        │
│   💾 Protect your thoughts             │
│                                        │
│   You've completed 10 sessions!        │
│   Your data is stored locally only.    │
│                                        │
│   Export a backup to keep it safe.     │
│                                        │
│   [Export now]    [Remind me later]    │
│                                        │
└────────────────────────────────────────┘
```

**Comportement:**
- "Export now" → ouvre le flow d'export
- "Remind me later" → ferme, réapparaît dans 10 sessions
- Dismiss (X) → compte comme "remind me later"

### C. Data Model Update

```typescript
interface User {
  // ... existing fields
  totalSessions: number;           // Compteur pour reminder
  lastBackupReminder: number;      // Session # du dernier reminder
}
```

---

## 3. Wisp+ (Tier Payant)

### Pricing

| Option | Prix |
|--------|------|
| **Lifetime** | $29 (one-time) |

Pas d'abonnement. Un achat, accès à vie.

### Comparatif Free vs Wisp+

| Feature | Free | Wisp+ |
|---------|------|-------|
| Sessions illimitées | ✅ | ✅ |
| Calendrier annuel | ✅ | ✅ |
| Mood tracking | ✅ | ✅ |
| Streak | ✅ | ✅ |
| Partage post-session | ✅ | ✅ |
| Export JSON | ✅ | ✅ |
| Export TXT | ✅ | ✅ |
| Export Markdown | ✅ | ✅ |
| **Historique** | 90 jours | ✅ Illimité |
| **Polices** | Lora uniquement | ✅ 5 choix |
| **Export PDF stylisé** | ❌ | ✅ |
| **Export Google Doc** | ❌ | ✅ |
| **Cloud backup chiffré** | ❌ | ✅ |
| **Stats avancées** | ❌ | ✅ |

---

## 4. Détail des Features Wisp+

### A. Historique Illimité

**Free:** Les sessions de plus de 90 jours sont archivées et non accessibles.
- L'utilisateur voit un message: "Sessions older than 90 days. Upgrade to Wisp+ to unlock."
- Les données ne sont PAS supprimées, juste masquées.

**Wisp+:** Accès complet à tout l'historique, peu importe l'ancienneté.

### B. Polices (5 choix)

| # | Nom | Police | Vibe |
|---|-----|--------|------|
| 1 | Classic | Lora | Défaut (aussi en Free) |
| 2 | Literary | Libre Baskerville | Raffiné, book-like |
| 3 | Typewriter | Courier Prime | Raw, nostalgique |
| 4 | Gentle | Merriweather | Rond, cozy |
| 5 | Poetic | Crimson Text | Doux, romantique |

**Free:** Lora uniquement.
**Wisp+:** Choix parmi les 5 dans Settings.

### C. Export PDF Stylisé

**Free:** Export JSON, TXT, Markdown (brut, sans style).

**Wisp+:** Export PDF avec mise en page soignée:
- Header avec date, nombre de mots, mood
- Police choisie appliquée
- Marges élégantes
- Option: exporter une session ou toutes les sessions

### D. Export Google Doc

**Wisp+:** Bouton "Export to Google Doc" qui:
1. Authentifie avec Google (OAuth)
2. Crée un nouveau doc dans le Drive de l'utilisateur
3. Formate proprement le contenu

### E. Cloud Backup Chiffré

**Concept:**
- Backup optionnel (pas obligatoire)
- Chiffré end-to-end (on ne peut pas lire les données)
- Sync entre devices si l'utilisateur le souhaite

**Flow:**
1. Settings → "Enable cloud backup"
2. Créer un compte (email uniquement) ou connecter existant
3. Données chiffrées côté client avec une clé dérivée d'un mot de passe
4. Upload du blob chiffré sur notre serveur
5. Restore possible sur n'importe quel device

**Important:** Le mot de passe de chiffrement n'est JAMAIS envoyé au serveur. Si l'utilisateur le perd, les données sont irrécupérables. C'est le deal privacy.

### F. Stats Avancées

**Free:** Stats basiques visibles (streak actuelle, total sessions).

**Wisp+:** Dashboard stats avec:
- Mots écrits (total, ce mois, cette semaine)
- Moyenne de mots par session
- Durée moyenne de session
- Distribution des moods (pie chart ou bar)
- Streak la plus longue (record)
- Jours les plus actifs (lundi vs dimanche, etc.)
- Graphique de progression (30/90/365 jours)
- Heatmap d'activité style GitHub

---

## 5. Implémentation Technique

### License Key System

Pas besoin de serveur permanent. Utiliser un service comme:
- **Polar.sh** (recommandé, indie-friendly)
- **LemonSqueezy**
- **Gumroad**

**Flow:**
1. User achète sur la page de vente
2. Reçoit un license key par email
3. Entre le key dans Wisp (Settings → "Activate Wisp+")
4. Validation one-time via API du provider
5. Key stocké en localStorage
6. Features premium débloquées

**Code:**
```typescript
// Check premium status
const isPremium = (): boolean => {
  return localStorage.getItem('wisp_license_valid') === 'true';
};

// Validate license (one-time on entry)
const validateLicense = async (key: string): Promise<boolean> => {
  const response = await fetch('https://api.polar.sh/validate', {
    method: 'POST',
    body: JSON.stringify({ key })
  });
  const { valid } = await response.json();
  if (valid) {
    localStorage.setItem('wisp_license_key', key);
    localStorage.setItem('wisp_license_valid', 'true');
  }
  return valid;
};
```

### Cloud Backup Architecture (V2)

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Client    │      │   Server    │      │   Storage   │
│   (Wisp)    │      │   (API)     │      │   (S3/R2)   │
└──────┬──────┘      └──────┬──────┘      └──────┬──────┘
       │                    │                    │
       │  1. Encrypt data   │                    │
       │     locally        │                    │
       │                    │                    │
       │  2. Upload blob ──►│  3. Store blob ───►│
       │                    │                    │
       │  4. Download ◄─────│  5. Retrieve ◄─────│
       │                    │                    │
       │  6. Decrypt        │                    │
       │     locally        │                    │
       │                    │                    │
```

**Stack suggérée:**
- API: Cloudflare Workers (serverless, pas cher)
- Storage: Cloudflare R2 (compatible S3, pas d'egress fees)
- Auth: Simple email + password (ou magic link)
- Chiffrement: Web Crypto API (AES-256-GCM)

---

## 6. Roadmap

### MVP (maintenant)
- [ ] Onboarding mention privacy/backup
- [ ] Backup reminder toutes les 10 sessions
- [ ] Historique limité à 90 jours (données gardées, accès masqué)
- [ ] Placeholder "Wisp+" dans Settings (coming soon)

### V1.1 (post-launch)
- [ ] Page de vente Wisp+
- [ ] Intégration Polar.sh
- [ ] License key system
- [ ] Déblocage polices
- [ ] Export PDF stylisé
- [ ] Stats avancées

### V1.2
- [ ] Export Google Doc
- [ ] Cloud backup chiffré

---

## 7. Messaging & Copywriting

### Free User Prompts

**Quand il atteint la limite de 90 jours:**
```
"Your older sessions are waiting.
 Unlock your full history with Wisp+."
 
 [Upgrade $29] [Maybe later]
```

**Quand il essaie de changer de police:**
```
"Want to write in Courier Prime?
 Unlock 5 fonts with Wisp+."
 
 [See all fonts] [Stay with Lora]
```

**Quand il exporte:**
```
"Export as PDF with beautiful styling?
 Available with Wisp+."
 
 [Upgrade] [Export as TXT]
```

### Page de Vente — Points Clés

1. **Keep your thoughts forever** — Historique illimité
2. **Write your way** — 5 polices au choix
3. **Beautiful exports** — PDF stylisé, Google Doc
4. **Never lose anything** — Cloud backup chiffré
5. **See your journey** — Stats et graphiques
6. **One price, forever** — $29, pas d'abonnement

---

## 8. Résumé

| Aspect | Décision |
|--------|----------|
| Modèle | Freemium doux |
| Prix | $29 lifetime |
| Free limits | 90 jours historique, 1 police, exports basiques |
| Paid unlock | Historique illimité, 5 polices, PDF, Google Doc, cloud backup, stats |
| Reminder backup | Toutes les 10 sessions |
| Onboarding | Mention claire privacy + responsabilité backup |
| Provider paiement | Polar.sh (recommandé) |
