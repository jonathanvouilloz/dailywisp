import Dexie, { type EntityTable } from 'dexie';
import type { Session, User, Settings, MoodLevel } from '$lib/types';

// Database schema
const db = new Dexie('WispDB') as Dexie & {
	sessions: EntityTable<Session, 'id'>;
	users: EntityTable<User, 'id'>;
	settings: EntityTable<Settings, 'id'>;
};

db.version(1).stores({
	sessions: '++id, date, status, createdAt',
	users: '++id',
	settings: '++id'
});

export { db };

// Helper functions

export async function getUser(): Promise<User | undefined> {
	return db.users.toCollection().first();
}

export async function saveUser(user: Omit<User, 'id'>): Promise<number | undefined> {
	return db.users.add(user as User);
}

export async function updateUser(id: number, updates: Partial<User>): Promise<number> {
	return db.users.update(id, updates);
}

export async function getSettings(): Promise<Settings | undefined> {
	return db.settings.toCollection().first();
}

export async function saveSettings(settings: Omit<Settings, 'id'>): Promise<number | undefined> {
	return db.settings.add(settings as Settings);
}

export async function updateSettings(id: number, updates: Partial<Settings>): Promise<number> {
	return db.settings.update(id, updates);
}

export async function getSessionByDate(date: string): Promise<Session | undefined> {
	return db.sessions.where('date').equals(date).first();
}

export async function getTodaySession(): Promise<Session | undefined> {
	const today = new Date().toISOString().split('T')[0];
	return getSessionByDate(today);
}

export async function saveSession(session: Omit<Session, 'id'>): Promise<number | undefined> {
	return db.sessions.add(session as Session);
}

export async function updateSession(id: number, updates: Partial<Session>): Promise<number> {
	return db.sessions.update(id, updates);
}

export async function getAllSessions(): Promise<Session[]> {
	return db.sessions.orderBy('date').reverse().toArray();
}

export async function getCompletedSessions(): Promise<Session[]> {
	return db.sessions.where('status').equals('completed').toArray();
}

export async function calculateStreak(): Promise<number> {
	const sessions = await db.sessions
		.where('status')
		.equals('completed')
		.sortBy('date');

	if (sessions.length === 0) return 0;

	// Sort by date descending
	sessions.sort((a, b) => b.date.localeCompare(a.date));

	let streak = 0;
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	for (let i = 0; i < sessions.length; i++) {
		const sessionDate = new Date(sessions[i].date);
		sessionDate.setHours(0, 0, 0, 0);

		const expectedDate = new Date(today);
		expectedDate.setDate(expectedDate.getDate() - i);

		// Allow for today or yesterday to be the start of streak
		if (i === 0) {
			const diff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
			if (diff > 1) break; // No session today or yesterday
		}

		const diff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
		if (diff === i || diff === i + 1) {
			streak++;
		} else {
			break;
		}
	}

	return streak;
}

export async function clearAllData(): Promise<void> {
	await db.sessions.clear();
	await db.users.clear();
	await db.settings.clear();
}

export async function exportAllData(): Promise<{
	sessions: Session[];
	user: User | undefined;
	settings: Settings | undefined;
}> {
	return {
		sessions: await getAllSessions(),
		user: await getUser(),
		settings: await getSettings()
	};
}

// Dummy texts for seeding
const DUMMY_TEXTS = [
	`Today I woke up with a strange feeling of clarity. The morning light filtered through the curtains in that particular way that makes everything seem possible. I made coffee, the ritual unchanged after all these years, and sat by the window watching the city slowly come to life. There's something meditative about these early hours, before the noise and demands of the day take over. I've been thinking a lot about time lately, how it seems to slip through our fingers like sand, yet somehow each moment contains infinity. The birds outside don't worry about tomorrow, they simply exist in the now, singing their songs without concern for audience or applause.`,

	`Writing has always been my refuge, a place where thoughts can take shape and find their form. Today the words came easily, flowing like water finding its natural path downhill. I wrote about memories, those fragments of the past that surface unexpectedly, triggered by a smell or a song or the way light falls on a familiar street. Memory is a strange thing, selective and unreliable, yet it shapes so much of who we are. I wonder sometimes if we are anything more than the sum of our remembered moments, the stories we tell ourselves about who we've been.`,

	`The rain started around noon, a gentle persistent rhythm against the windows. I've always loved rainy days for writing, the way they create a cocoon of solitude, an excuse to stay inside and explore inner landscapes. Today I wrote about fear, that constant companion that whispers doubts and what-ifs. But I've learned that fear is often just excitement wearing a different mask, and that the things we're most afraid of are often the things most worth doing.`,

	`Sometimes the best sessions are the ones where you don't know what you're going to write until the words appear on the page. Today was like that, a journey of discovery, each sentence leading to the next in ways I couldn't have predicted. I wrote about connection, the invisible threads that link us to others, the way a kind word can ripple outward in ways we'll never know. In this age of digital everything, real human connection feels both more precious and more elusive.`,

	`I've been reading about creativity lately, how it's less about inspiration and more about showing up, day after day, doing the work even when you don't feel like it. Today was one of those days where I had to push through resistance, that voice that says it's not worth it, that no one will read this anyway. But I've learned that the value isn't in the outcome, it's in the practice itself, in the becoming that happens through consistent effort.`,

	`The afternoon light has a different quality in winter, softer and more forgiving. I sat with my notebook and let my mind wander through the landscape of the past year. So much has changed, and yet the essential things remain. I wrote about gratitude today, not the forced positivity kind, but the deep recognition of all that sustains us, often unnoticed. The friend who checks in, the stranger who holds the door, the body that carries us through each day.`,

	`Today I experimented with writing in a different voice, trying on perspectives like clothes in a fitting room. It's liberating to step outside your usual patterns, to discover what emerges when you let go of the need to sound like yourself. I wrote a letter to my younger self, full of reassurance and gentle warnings, knowing of course that the past is unchangeable but finding value in the exercise nonetheless.`,

	`The blank page is both terrifying and full of possibility. Today I stared at it longer than usual before the first words came, but once they did, they brought friends. I wrote about dreams, not the sleeping kind but the waking ones, the visions we hold for our lives and how they evolve over time. Some dreams we outgrow, others we grow into. The trick is knowing the difference.`,

	`Music was my companion today as I wrote, a playlist of old favorites that seemed to unlock something in my memory. I wrote about the soundtrack of my life, the songs that mark different eras, different versions of myself. How strange that a melody can transport us instantly across years, can make us feel again what we thought we'd forgotten. Music is time travel for the heart.`,

	`I took a different approach today, writing quickly without stopping to edit or second-guess. The result was messier but more alive somehow, like a sketch that captures movement better than a polished portrait. There's something to be said for imperfection, for the rough edges that show the human hand at work. I wrote about authenticity, the courage it takes to be truly yourself in a world that constantly pressures us to be something else.`,

	`The evening came early today, darkness falling like a curtain on the afternoon. I lit candles and wrote by their flickering light, feeling connected to all the writers who came before electricity, who created by firelight and gaslight. I wrote about tradition, the ways we carry the past forward, consciously or not. Every word I write is built on words that came before, a conversation across time.`,

	`Today I wrote about failure, that teacher we never asked for but who shows up anyway. I've failed at so many things, and each failure has been a door to something unexpected. The trick is to fail forward, to let each setback propel you toward the next attempt. Success is just failure that kept trying, or so I tell myself on the hard days.`,

	`Spring is still weeks away but I can feel it stirring, that restless energy of renewal. I wrote about cycles today, the way everything moves in circles, seasons and moods and creative energy. There are fallow times and fertile times, and learning to respect both is part of the craft. You can't harvest what you haven't planted, and you can't plant without first letting the field rest.`,

	`I wrote letters today, actual letters that I'll never send. To people who've hurt me, people I've hurt, people who've vanished from my life for one reason or another. There's power in saying what was never said, even if only to paper. The writing itself is the healing, the act of naming what was unnamed. Some things need to be written to be released.`,

	`The words came slowly today, each one hard-won like water from a deep well. But I've learned to trust the process, to keep showing up even when inspiration is nowhere to be found. Discipline is what carries you through when motivation fails. I wrote about persistence, the quiet heroism of simply continuing, of putting one foot in front of the other when the path is unclear.`,

	`Today marks two weeks of consistent writing, a small victory but a victory nonetheless. I wrote about habits, how they shape us silently, how the small choices we make each day compound into the lives we lead. Every time I sit down to write, I'm voting for the person I want to become. The blank page is a ballot box, and each word is a choice.`,

	`Looking back over these pages, I see someone trying to make sense of things, to find meaning in the everyday. That's really all any of us are doing, isn't it? Trying to understand our place in the vast mystery of existence. Writing is my way of asking questions, even when there are no answers. The asking itself is enough. The practice is the point.`
];

export async function seedDummyData(): Promise<void> {
	// Check if we already have sessions
	const existingSessions = await getAllSessions();
	if (existingSessions.length > 0) {
		console.log('Database already has sessions, skipping seed');
		return;
	}

	// Create sessions from Jan 1 to Jan 17, 2026
	const sessions: Omit<Session, 'id'>[] = [];

	for (let day = 1; day <= 17; day++) {
		const date = `2026-01-${day.toString().padStart(2, '0')}`;
		const text = DUMMY_TEXTS[day - 1] || DUMMY_TEXTS[0];
		const wordCount = text.trim().split(/\s+/).length;
		const durationMs = Math.floor(Math.random() * 600000) + 300000; // 5-15 min
		const mood = (Math.floor(Math.random() * 5) + 1) as MoodLevel;
		const createdAt = new Date(`${date}T${8 + Math.floor(Math.random() * 4)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:00`);

		// Skip some days randomly to make it realistic (skip ~2-3 days)
		if (day === 5 || day === 11 || day === 14) {
			continue; // Skipped days (faded or no session)
		}

		sessions.push({
			date,
			text,
			wordCount,
			durationMs,
			status: 'completed',
			mood,
			createdAt,
			completedAt: new Date(createdAt.getTime() + durationMs)
		});
	}

	// Add all sessions
	for (const session of sessions) {
		await saveSession(session);
	}

	console.log(`Seeded ${sessions.length} sessions`);
}

export async function generateTestData(): Promise<void> {
	// Clear all existing sessions
	await db.sessions.clear();

	const sessions: Omit<Session, 'id'>[] = [];

	// Sample texts for completed sessions
	const sampleTexts = [
		`Today I woke up with a strange feeling of clarity. The morning light filtered through the curtains in that particular way that makes everything seem possible. I made coffee, the ritual unchanged after all these years, and sat by the window watching the city slowly come to life. There's something meditative about these early hours, before the noise and demands of the day take over. I've been thinking a lot about time lately, how it seems to slip through our fingers like sand, yet somehow each moment contains infinity.`,
		`Writing has always been my refuge, a place where thoughts can take shape and find their form. Today the words came easily, flowing like water finding its natural path downhill. I wrote about memories, those fragments of the past that surface unexpectedly, triggered by a smell or a song or the way light falls on a familiar street. Memory is a strange thing, selective and unreliable, yet it shapes so much of who we are.`,
		`The rain started around noon, a gentle persistent rhythm against the windows. I've always loved rainy days for writing, the way they create a cocoon of solitude, an excuse to stay inside and explore inner landscapes. Today I wrote about fear, that constant companion that whispers doubts and what-ifs. But I've learned that fear is often just excitement wearing a different mask.`,
		`Sometimes the best sessions are the ones where you don't know what you're going to write until the words appear on the page. Today was like that, a journey of discovery, each sentence leading to the next in ways I couldn't have predicted. I wrote about connection, the invisible threads that link us to others, the way a kind word can ripple outward in ways we'll never know.`,
		`I've been reading about creativity lately, how it's less about inspiration and more about showing up, day after day, doing the work even when you don't feel like it. Today was one of those days where I had to push through resistance, that voice that says it's not worth it. But I've learned that the value isn't in the outcome, it's in the practice itself.`,
		`The afternoon light has a different quality in winter, softer and more forgiving. I sat with my notebook and let my mind wander through the landscape of the past year. So much has changed, and yet the essential things remain. I wrote about gratitude today, not the forced positivity kind, but the deep recognition of all that sustains us.`,
		`Today I experimented with writing in a different voice, trying on perspectives like clothes in a fitting room. It's liberating to step outside your usual patterns, to discover what emerges when you let go of the need to sound like yourself. I wrote a letter to my younger self, full of reassurance and gentle warnings.`,
		`The blank page is both terrifying and full of possibility. Today I stared at it longer than usual before the first words came, but once they did, they brought friends. I wrote about dreams, not the sleeping kind but the waking ones, the visions we hold for our lives and how they evolve over time.`,
		`Music was my companion today as I wrote, a playlist of old favorites that seemed to unlock something in my memory. I wrote about the soundtrack of my life, the songs that mark different eras, different versions of myself. How strange that a melody can transport us instantly across years.`,
		`I took a different approach today, writing quickly without stopping to edit or second-guess. The result was messier but more alive somehow, like a sketch that captures movement better than a polished portrait. There's something to be said for imperfection, for the rough edges that show the human hand at work.`,
		`The evening came early today, darkness falling like a curtain on the afternoon. I lit candles and wrote by their flickering light, feeling connected to all the writers who came before electricity. I wrote about tradition, the ways we carry the past forward, consciously or not.`,
		`Today I wrote about failure, that teacher we never asked for but who shows up anyway. I've failed at so many things, and each failure has been a door to something unexpected. The trick is to fail forward, to let each setback propel you toward the next attempt.`,
		`Spring is still weeks away but I can feel it stirring, that restless energy of renewal. I wrote about cycles today, the way everything moves in circles, seasons and moods and creative energy. There are fallow times and fertile times, and learning to respect both is part of the craft.`,
		`I wrote letters today, actual letters that I'll never send. To people who've hurt me, people I've hurt, people who've vanished from my life. There's power in saying what was never said, even if only to paper. The writing itself is the healing, the act of naming what was unnamed.`,
		`The words came slowly today, each one hard-won like water from a deep well. But I've learned to trust the process, to keep showing up even when inspiration is nowhere to be found. Discipline is what carries you through when motivation fails.`,
		`Today marks another day of consistent writing, a small victory but a victory nonetheless. I wrote about habits, how they shape us silently, how the small choices we make each day compound into the lives we lead. Every time I sit down to write, I'm voting for the person I want to become.`
	];

	// Draft texts (shorter, incomplete)
	const draftTexts = [
		`I started writing about something today but couldn't quite find the words. There's this feeling I've been trying to capture, something about the way time moves differently when you're`,
		`The conversation I had yesterday keeps playing in my mind. She said something that I can't stop thinking about. Maybe if I write it down I can understand why it bothered me so much. It was about`
	];

	// Create completed sessions for Jan 1-20, skipping some days
	const skipDays = [5, 11, 14]; // Days without sessions
	const draftDays = [18, 19]; // Days with interrupted sessions (drafts)
	let textIndex = 0;

	for (let day = 1; day <= 20; day++) {
		const date = `2026-01-${day.toString().padStart(2, '0')}`;

		// Skip some days entirely
		if (skipDays.includes(day)) continue;

		// Create draft (interrupted) sessions
		if (draftDays.includes(day)) {
			const draftIndex = draftDays.indexOf(day);
			const text = draftTexts[draftIndex];
			const wordCount = text.trim().split(/\s+/).length;
			const createdAt = new Date(`${date}T09:30:00`);

			sessions.push({
				date,
				text,
				wordCount,
				durationMs: Math.floor(Math.random() * 120000) + 60000, // 1-3 min
				status: 'interrupted',
				createdAt
			});
			continue;
		}

		// Create completed session
		const text = sampleTexts[textIndex % sampleTexts.length];
		const wordCount = text.trim().split(/\s+/).length;
		const durationMs = Math.floor(Math.random() * 600000) + 300000; // 5-15 min
		const mood = (Math.floor(Math.random() * 5) + 1) as MoodLevel;
		const hour = 8 + Math.floor(Math.random() * 4);
		const minute = Math.floor(Math.random() * 60);
		const createdAt = new Date(`${date}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`);

		sessions.push({
			date,
			text,
			wordCount,
			durationMs,
			status: 'completed',
			mood,
			createdAt,
			completedAt: new Date(createdAt.getTime() + durationMs)
		});

		textIndex++;
	}

	// Add all sessions to database
	for (const session of sessions) {
		await saveSession(session);
	}

	console.log(`Generated ${sessions.length} test sessions (${sessions.filter(s => s.status === 'interrupted').length} drafts)`);
}

export async function importData(data: {
	sessions?: Session[];
	user?: User;
	settings?: Settings;
}, mode: 'merge' | 'replace'): Promise<void> {
	if (mode === 'replace') {
		await clearAllData();
	}

	if (data.user) {
		const existing = await getUser();
		if (!existing) {
			await saveUser(data.user);
		} else if (mode === 'replace') {
			await saveUser(data.user);
		}
	}

	if (data.settings) {
		const existing = await getSettings();
		if (!existing) {
			await saveSettings(data.settings);
		} else if (mode === 'replace') {
			await saveSettings(data.settings);
		}
	}

	if (data.sessions) {
		for (const session of data.sessions) {
			const existing = await getSessionByDate(session.date);
			if (!existing) {
				await saveSession(session);
			} else if (mode === 'replace') {
				await updateSession(existing.id!, session);
			}
		}
	}
}
