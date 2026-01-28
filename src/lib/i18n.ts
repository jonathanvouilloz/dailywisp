// Internationalization for Wisp
// Supports EN and FR

import { settingsStore } from '$lib/stores';

type TranslationKey = keyof typeof translations.en;

const translations = {
	en: {
		// Common
		'common.back': 'Back',
		'common.continue': 'Continue',
		'common.cancel': 'Cancel',
		'common.loading': 'Loading...',
		'common.viewCalendar': 'View calendar',
		'common.backToCalendar': 'Back to calendar',
		'common.backHome': 'Back home',
		'common.skipForNow': 'Skip for now',
		'common.post': 'Post',

		// Home page
		'home.title': 'Wisp - Your writing journey',
		'home.loading': 'Loading your journey...',
		'home.hello': 'Hello, {name}',
		'home.goodMorning': 'Good morning',
		'home.goodAfternoon': 'Good afternoon',
		'home.goodEvening': 'Good evening',
		'home.todayComplete': "Today's writing complete",
		'home.todayDone': 'Done for today',
		'home.todayDoneDesc': 'Your words are safe. See you tomorrow!',
		'home.readyToWrite': 'Ready to write?',
		'home.readyToWriteDesc': 'Your daily 300 words await.',
		'home.yourYear': 'Your year in ink',
		'home.totalSessions': 'total sessions',
		'home.currentStreak': 'current streak',
		'home.longestStreak': 'best streak',
		'home.dayStreak': 'day streak',
		'home.sessions': 'sessions',
		'home.words': 'words',
		'home.startWriting': "Start today's writing",
		'home.tagline': 'Write 300 words without stopping.\nIf you pause, everything fades away.',
		'home.getStarted': 'Get started',

		// Write page
		'write.title': 'Write | Wisp',
		'write.preparing': 'Preparing your writing space...',
		'write.alreadyDone': 'Already written today!',
		'write.alreadyDoneDesc': 'Your words for today are safe. Come back tomorrow for a new session.',
		'write.readyTitle': 'Ready to write?',
		'write.readyDesc': 'Write {target} words without stopping.\nKeep typing or the ink will fade away.',
		'write.startWriting': 'Start writing',
		'write.placeholder': 'Start typing...',
		'write.finish': 'Finish',
		'write.complete': 'Session complete!',
		'write.wordsIn': '{words} words in {duration}',
		'write.howFeel': 'How did it feel?',
		'write.moodNotePlaceholder': 'How was your writing experience? (optional)',
		'write.faded': 'Your words faded away...',
		'write.fadedDesc': "It's okay.\nTake a breath and try again.",
		'write.interrupted': 'Session interrupted',
		'write.interruptedDesc': 'Your text is saved in your history. You can start a new session or resume from where you left off.',
		'write.tryAgain': 'Try again',
		'write.pasteBlocked': 'Write your own words...',

		// Settings page
		'settings.title': 'Settings',
		'settings.appearance': 'Appearance',
		'settings.theme': 'Theme',
		'settings.themeDesc': 'Choose your preferred color scheme',
		'settings.light': 'Light',
		'settings.dark': 'Dark',
		'settings.auto': 'Auto',
		'settings.language': 'Language',
		'settings.languageDesc': 'Interface language',
		'settings.writing': 'Writing',
		'settings.mode': 'Mode',
		'settings.zenDesc': 'Zen mode: no pressure, write at your own pace',
		'settings.normalDesc': 'Normal mode: the ink fades if you stop writing',
		'settings.normal': 'Normal',
		'settings.zen': 'Zen',
		'settings.data': 'Your Data',
		'settings.export': 'Export',
		'settings.exportDesc': 'Download all your writing sessions',
		'settings.exportJson': 'JSON',
		'settings.exportJsonDesc': 'Full data backup',
		'settings.exportMarkdown': 'Markdown',
		'settings.exportMarkdownDesc': 'Readable format',
		'settings.exportPdf': 'PDF',
		'settings.exportPdfDesc': 'Printable document',
		'settings.exporting': 'Exporting...',
		'settings.exportSuccess': 'Export completed!',
		'settings.exportError': 'Export failed. Please try again.',
		'settings.import': 'Import',
		'settings.importDesc': 'Restore from a JSON backup',
		'settings.importChooseFile': 'Choose JSON file...',
		'settings.importing': 'Importing...',
		'settings.importSuccess': 'Import completed!',
		'settings.importError': 'Import failed. Make sure the file is a valid Wisp export.',
		'settings.danger': 'Danger Zone',
		'settings.reset': 'Reset Everything',
		'settings.resetDesc': 'Permanently delete all your data. This cannot be undone.',
		'settings.resetAllData': 'Reset All Data',
		'settings.resetConfirm': 'Type DELETE to confirm:',
		'settings.resetPlaceholder': 'Type DELETE',
		'settings.deleteEverything': 'Delete Everything',
		'settings.resetError': 'Reset failed. Please try again.',
		'settings.appInfo': 'Your words, stored locally on your device.',

		// Calendar
		'calendar.january': 'January',
		'calendar.february': 'February',
		'calendar.march': 'March',
		'calendar.april': 'April',
		'calendar.may': 'May',
		'calendar.june': 'June',
		'calendar.july': 'July',
		'calendar.august': 'August',
		'calendar.september': 'September',
		'calendar.october': 'October',
		'calendar.november': 'November',
		'calendar.december': 'December',
		'calendar.noEntry': 'No entry',
		'calendar.completedSession': 'completed session',
		'calendar.today': 'today',
		'calendar.viewEntry': 'View entry',
		'calendar.writeToday': 'Write today',
		'calendar.listView': 'List view',
		'calendar.gridView': 'Grid view',
		'calendar.weekdays': 'Mo,Tu,We,Th,Fr,Sa,Su',

		// Onboarding
		'onboarding.title': 'Welcome to Wisp',
		'onboarding.imWisp': "Hey! I'm Wisp.",
		'onboarding.helpYou': "I'll help you free your thoughts, one word at a time.",
		'onboarding.yourName': "What's your name?",
		'onboarding.namePlaceholder': 'Type your name...',
		'onboarding.justAMoment': 'Just a moment...',
		'onboarding.theDeal': "Here's the deal, {name}:",
		'onboarding.writeWords': 'Write {target} words without stopping.',
		'onboarding.ifYouPause': 'If you pause too long...',
		'onboarding.everythingFades': 'everything fades away.',
		'onboarding.iUnderstand': 'I understand',
		'onboarding.watchGauge': 'Watch your ink gauge.',
		'onboarding.keepWriting': 'Keep writing to stay visible.',
		'onboarding.gaugeEmpty': 'Empty',
		'onboarding.gaugeFull': 'Full',
		'onboarding.readyToFree': 'Ready to free your mind?',
		'onboarding.gettingReady': 'Getting ready...',
		'onboarding.privacyTitle': 'Your thoughts stay private',
		'onboarding.privacyDesc': 'Everything is stored locally on your device.\nNo account, no server, no one can read your words.',
		'onboarding.backupNote': 'This means: backup = your job.\nWe\'ll remind you to export your data regularly.',
		'onboarding.gotIt': 'Got it',

		// Journal
		'journal.title': '{date} | Wisp Journal',
		'journal.loading': 'Loading entry...',
		'journal.note': 'Note:',
		'journal.noEarlier': 'No earlier entry',
		'journal.noLater': 'No later entry',
		'journal.keyboardHint': 'Use ← → to navigate, Esc to go back',
		'journal.notFound': 'Entry not found',
		'journal.notFoundDesc': "This writing session doesn't exist or isn't completed yet.",
		'journal.interruptedSession': 'Interrupted session',
		'journal.resumeText': 'Resume this text',

		// Share
		'share.title': 'Share | Wisp',
		'share.readyToShare': 'Ready to share your progress?',
		'share.minimal': 'Minimal',
		'share.streak': 'Streak',
		'share.journey': 'Journey',
		'share.drafts': 'Drafts',
		'share.everyone': 'Everyone',

		// Drafts
		'drafts.title': 'Drafts',
		'drafts.pageTitle': 'Drafts | Wisp',
		'drafts.empty': 'No drafts',
		'drafts.emptyDesc': 'Interrupted sessions will appear here.',
		'drafts.resume': 'Resume',
		'drafts.words': '{count} words',
		'drafts.startNew': 'Start a new session',

		// Mood
		'mood.title': 'Mood | Wisp',
		'mood.howWas': 'How was your session?',
		'mood.comingSoon': 'Mood rating coming soon...',

		// Moods (from MOODS constant)
		'mood.struggled': 'Struggled',
		'mood.tough': 'Tough',
		'mood.steady': 'Steady',
		'mood.smooth': 'Smooth',
		'mood.flow': 'Flow',

		// Components
		'component.wisp': 'Wisp, your writing companion',
		'component.moodIcon': 'Mood: {mood}',

		// Backup reminder
		'backup.title': 'Time for a backup!',
		'backup.message': "You've completed {count} sessions!",
		'backup.description': 'Your words are precious. Export a backup to keep them safe.',
		'backup.exportNow': 'Export now',
		'backup.remindLater': 'Remind me later',

		// Premium / History limit
		'premium.lockedTitle': 'Session locked',
		'premium.lockedDesc': 'This session is older than 90 days.',
		'premium.unlockWith': 'Unlock unlimited history with Wisp+',
		'premium.upgradeBtn': 'Learn about Wisp+',

		// Settings - Wisp+
		'settings.wispPlus': 'Wisp+',
		'settings.comingSoon': 'Coming soon',
		'settings.unlockFull': 'Unlock the full experience:',
		'settings.featureHistory': 'Unlimited history',
		'settings.featureFonts': '5 beautiful fonts',
		'settings.featurePdf': 'Styled PDF export',
		'settings.featureBackup': 'Encrypted cloud backup',
		'settings.featureStats': 'Advanced writing stats',
		'settings.priceTag': '$29 one-time, forever yours',

		// Error pages
		'error.title': 'Lost in the ink...',
		'error.notFound': "This page doesn't exist.",
		'error.generic': 'Something went wrong.'
	},

	fr: {
		// Common
		'common.back': 'Retour',
		'common.continue': 'Continuer',
		'common.cancel': 'Annuler',
		'common.loading': 'Chargement...',
		'common.viewCalendar': 'Voir le calendrier',
		'common.backToCalendar': 'Retour au calendrier',
		'common.backHome': 'Retour',
		'common.skipForNow': 'Passer',
		'common.post': 'Publier',

		// Home page
		'home.title': "Wisp - Ton voyage d'écriture",
		'home.loading': 'Chargement de ton parcours...',
		'home.hello': 'Bonjour, {name}',
		'home.goodMorning': 'Bonjour',
		'home.goodAfternoon': 'Bon après-midi',
		'home.goodEvening': 'Bonsoir',
		'home.todayComplete': 'Écriture du jour terminée',
		'home.todayDone': "Terminé pour aujourd'hui",
		'home.todayDoneDesc': 'Tes mots sont en sécurité. À demain !',
		'home.readyToWrite': 'Prêt à écrire ?',
		'home.readyToWriteDesc': "Tes 300 mots du jour t'attendent.",
		'home.yourYear': 'Ton année en encre',
		'home.totalSessions': 'sessions totales',
		'home.currentStreak': 'série actuelle',
		'home.longestStreak': 'meilleure série',
		'home.dayStreak': 'jours consécutifs',
		'home.sessions': 'sessions',
		'home.words': 'mots',
		'home.startWriting': "Commencer l'écriture",
		'home.tagline': "Écris 300 mots sans t'arrêter.\nSi tu fais une pause, tout s'efface.",
		'home.getStarted': 'Commencer',

		// Write page
		'write.title': 'Écrire | Wisp',
		'write.preparing': 'Préparation de ton espace...',
		'write.alreadyDone': "Déjà écrit aujourd'hui !",
		'write.alreadyDoneDesc': 'Tes mots sont en sécurité. Reviens demain pour une nouvelle session.',
		'write.readyTitle': 'Prêt à écrire ?',
		'write.readyDesc': "Écris {target} mots sans t'arrêter.\nContinue d'écrire ou l'encre s'effacera.",
		'write.startWriting': 'Commencer',
		'write.placeholder': 'Commence à écrire...',
		'write.finish': 'Terminer',
		'write.complete': 'Session terminée !',
		'write.wordsIn': '{words} mots en {duration}',
		'write.howFeel': "Comment c'était ?",
		'write.moodNotePlaceholder': "Comment s'est passée ta session ? (optionnel)",
		'write.faded': 'Tes mots se sont évaporés...',
		'write.fadedDesc': "C'est pas grave.\nRespire et réessaie.",
		'write.interrupted': 'Session interrompue',
		'write.interruptedDesc': "Ton texte est sauvegardé dans l'historique. Tu peux démarrer une nouvelle session ou reprendre là où tu t'es arrêté.",
		'write.tryAgain': 'Réessayer',
		'write.pasteBlocked': 'Écris tes propres mots...',

		// Settings page
		'settings.title': 'Paramètres',
		'settings.appearance': 'Apparence',
		'settings.theme': 'Thème',
		'settings.themeDesc': "Choisis ton mode d'affichage",
		'settings.light': 'Clair',
		'settings.dark': 'Sombre',
		'settings.auto': 'Auto',
		'settings.language': 'Langue',
		'settings.languageDesc': "Langue de l'interface",
		'settings.writing': 'Écriture',
		'settings.mode': 'Mode',
		'settings.zenDesc': 'Mode Zen : sans pression, écris à ton rythme',
		'settings.normalDesc': "Mode Normal : l'encre s'efface si tu t'arrêtes",
		'settings.normal': 'Normal',
		'settings.zen': 'Zen',
		'settings.data': 'Tes données',
		'settings.export': 'Exporter',
		'settings.exportDesc': 'Télécharge toutes tes sessions',
		'settings.exportJson': 'JSON',
		'settings.exportJsonDesc': 'Sauvegarde complète',
		'settings.exportMarkdown': 'Markdown',
		'settings.exportMarkdownDesc': 'Format lisible',
		'settings.exportPdf': 'PDF',
		'settings.exportPdfDesc': 'Document imprimable',
		'settings.exporting': 'Export en cours...',
		'settings.exportSuccess': 'Export terminé !',
		'settings.exportError': "L'export a échoué. Réessaie.",
		'settings.import': 'Importer',
		'settings.importDesc': 'Restaurer depuis une sauvegarde JSON',
		'settings.importChooseFile': 'Choisir un fichier JSON...',
		'settings.importing': 'Import en cours...',
		'settings.importSuccess': 'Import terminé !',
		'settings.importError': "L'import a échoué. Vérifie que le fichier est un export Wisp valide.",
		'settings.danger': 'Zone de danger',
		'settings.reset': 'Tout effacer',
		'settings.resetDesc': 'Supprime définitivement toutes tes données. Irréversible.',
		'settings.resetAllData': 'Effacer les données',
		'settings.resetConfirm': 'Tape DELETE pour confirmer :',
		'settings.resetPlaceholder': 'Tape DELETE',
		'settings.deleteEverything': 'Tout supprimer',
		'settings.resetError': 'La réinitialisation a échoué. Réessaie.',
		'settings.appInfo': 'Tes mots, stockés localement sur ton appareil.',

		// Calendar
		'calendar.january': 'Janvier',
		'calendar.february': 'Février',
		'calendar.march': 'Mars',
		'calendar.april': 'Avril',
		'calendar.may': 'Mai',
		'calendar.june': 'Juin',
		'calendar.july': 'Juillet',
		'calendar.august': 'Août',
		'calendar.september': 'Septembre',
		'calendar.october': 'Octobre',
		'calendar.november': 'Novembre',
		'calendar.december': 'Décembre',
		'calendar.noEntry': "Pas d'entrée",
		'calendar.completedSession': 'session terminée',
		'calendar.today': "aujourd'hui",
		'calendar.viewEntry': "Voir l'entrée",
		'calendar.writeToday': "Écrire aujourd'hui",
		'calendar.listView': 'Vue liste',
		'calendar.gridView': 'Vue grille',
		'calendar.weekdays': 'Lu,Ma,Me,Je,Ve,Sa,Di',

		// Onboarding
		'onboarding.title': 'Bienvenue sur Wisp',
		'onboarding.imWisp': "Salut ! Moi c'est Wisp.",
		'onboarding.helpYou': "Je vais t'aider à libérer tes pensées, un mot à la fois.",
		'onboarding.yourName': "Comment tu t'appelles ?",
		'onboarding.namePlaceholder': 'Ton prénom...',
		'onboarding.justAMoment': 'Un instant...',
		'onboarding.theDeal': "Voilà le deal, {name} :",
		'onboarding.writeWords': "Écris {target} mots sans t'arrêter.",
		'onboarding.ifYouPause': 'Si tu fais une pause...',
		'onboarding.everythingFades': "tout s'efface.",
		'onboarding.iUnderstand': "J'ai compris",
		'onboarding.watchGauge': "Surveille ta jauge d'encre.",
		'onboarding.keepWriting': 'Continue à écrire pour rester visible.',
		'onboarding.gaugeEmpty': 'Vide',
		'onboarding.gaugeFull': 'Plein',
		'onboarding.readyToFree': 'Prêt à libérer ton esprit ?',
		'onboarding.gettingReady': 'Préparation...',
		'onboarding.privacyTitle': 'Tes pensées restent privées',
		'onboarding.privacyDesc': 'Tout est stocké localement sur ton appareil.\nPas de compte, pas de serveur, personne ne peut lire tes mots.',
		'onboarding.backupNote': "Du coup : la sauvegarde, c'est toi.\nOn te rappellera d'exporter tes données régulièrement.",
		'onboarding.gotIt': 'Compris',

		// Journal
		'journal.title': '{date} | Journal Wisp',
		'journal.loading': "Chargement de l'entrée...",
		'journal.note': 'Note :',
		'journal.noEarlier': 'Pas d\'entrée précédente',
		'journal.noLater': 'Pas d\'entrée suivante',
		'journal.keyboardHint': 'Utilise ← → pour naviguer, Échap pour revenir',
		'journal.notFound': 'Entrée non trouvée',
		'journal.notFoundDesc': "Cette session d'écriture n'existe pas ou n'est pas encore terminée.",
		'journal.interruptedSession': 'Session interrompue',
		'journal.resumeText': 'Reprendre ce texte',

		// Share
		'share.title': 'Partager | Wisp',
		'share.readyToShare': 'Prêt à partager ta progression ?',
		'share.minimal': 'Minimal',
		'share.streak': 'Série',
		'share.journey': 'Parcours',
		'share.drafts': 'Brouillons',
		'share.everyone': 'Tout le monde',

		// Drafts
		'drafts.title': 'Brouillons',
		'drafts.pageTitle': 'Brouillons | Wisp',
		'drafts.empty': 'Aucun brouillon',
		'drafts.emptyDesc': 'Les sessions interrompues apparaîtront ici.',
		'drafts.resume': 'Reprendre',
		'drafts.words': '{count} mots',
		'drafts.startNew': 'Commencer une nouvelle session',

		// Mood
		'mood.title': 'Humeur | Wisp',
		'mood.howWas': "Comment s'est passée ta session ?",
		'mood.comingSoon': 'Évaluation de mood bientôt...',

		// Moods (from MOODS constant)
		'mood.struggled': 'Difficile',
		'mood.tough': 'Laborieux',
		'mood.steady': 'Régulier',
		'mood.smooth': 'Fluide',
		'mood.flow': 'Flow',

		// Components
		'component.wisp': "Wisp, ton compagnon d'écriture",
		'component.moodIcon': 'Humeur : {mood}',

		// Backup reminder
		'backup.title': "C'est l'heure du backup !",
		'backup.message': 'Tu as complété {count} sessions !',
		'backup.description': 'Tes mots sont précieux. Exporte une sauvegarde pour les garder en sécurité.',
		'backup.exportNow': 'Exporter maintenant',
		'backup.remindLater': 'Me rappeler plus tard',

		// Premium / History limit
		'premium.lockedTitle': 'Session verrouillée',
		'premium.lockedDesc': 'Cette session a plus de 90 jours.',
		'premium.unlockWith': "Débloque l'historique illimité avec Wisp+",
		'premium.upgradeBtn': 'Découvrir Wisp+',

		// Settings - Wisp+
		'settings.wispPlus': 'Wisp+',
		'settings.comingSoon': 'Bientôt disponible',
		'settings.unlockFull': "Débloque l'expérience complète :",
		'settings.featureHistory': 'Historique illimité',
		'settings.featureFonts': '5 belles polices',
		'settings.featurePdf': 'Export PDF stylisé',
		'settings.featureBackup': 'Sauvegarde cloud chiffrée',
		'settings.featureStats': "Statistiques d'écriture avancées",
		'settings.priceTag': '29€ une fois, à vie',

		// Error pages
		'error.title': "Perdu dans l'encre...",
		'error.notFound': "Cette page n'existe pas.",
		'error.generic': "Quelque chose s'est mal passé."
	}
} as const;

/**
 * Get a translated string by key
 * Supports variable interpolation with {variable} syntax
 */
export function t(key: TranslationKey, vars?: Record<string, string | number>): string {
	const lang = settingsStore.language;
	let text: string = translations[lang][key] ?? translations.en[key] ?? key;

	if (vars) {
		for (const [varKey, value] of Object.entries(vars)) {
			text = text.replace(new RegExp(`\\{${varKey}\\}`, 'g'), String(value));
		}
	}

	return text;
}

/**
 * Get month names array based on current language
 */
export function getMonthNames(): string[] {
	const lang = settingsStore.language;
	const prefix = 'calendar.';
	const months = [
		'january', 'february', 'march', 'april', 'may', 'june',
		'july', 'august', 'september', 'october', 'november', 'december'
	];
	return months.map(m => translations[lang][`${prefix}${m}` as TranslationKey] ?? m);
}

/**
 * Get mood label based on current language
 */
export function getMoodLabel(level: 1 | 2 | 3 | 4 | 5): string {
	const lang = settingsStore.language;
	const moodKeys: Record<number, TranslationKey> = {
		1: 'mood.struggled',
		2: 'mood.tough',
		3: 'mood.steady',
		4: 'mood.smooth',
		5: 'mood.flow'
	};
	return translations[lang][moodKeys[level]] ?? '';
}

// Export translations for direct access if needed
export { translations };
