import { db } from '@/db';
import { journalEntries } from '@/db/schema';

async function main() {
    const now = new Date();
    
    const sampleJournalEntries = [
        {
            userId: 1,
            entryText: 'Had an amazing workout this morning! Feeling energized and ready to tackle the day. My sleep quality has improved so much since starting the evening routine.',
            moodAnalysis: 'positive',
            createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 1,
            entryText: 'Grateful for this wellness journey. Small changes are adding up to big improvements in how I feel daily.',
            moodAnalysis: 'positive',
            createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 2,
            entryText: 'Work was busy today but managed to take breaks every hour. Still struggling with screen time in the evenings.',
            moodAnalysis: 'neutral',
            createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 2,
            entryText: 'Feeling stressed about deadlines. Need to focus more on meditation practice to manage anxiety.',
            moodAnalysis: 'needs attention',
            createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 3,
            entryText: 'Having trouble sleeping again. Too much on my mind. Need to implement better wind-down routine.',
            moodAnalysis: 'needs attention',
            createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 3,
            entryText: 'Better day today. Digital detox is helping. Still need to work on stress management.',
            moodAnalysis: 'neutral',
            createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 3,
            entryText: 'Feeling much better! The wellness plan is really working. Sleep improved, stress levels down.',
            moodAnalysis: 'positive',
            createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
    ];

    await db.insert(journalEntries).values(sampleJournalEntries);
    
    console.log('✅ Journal entries seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});