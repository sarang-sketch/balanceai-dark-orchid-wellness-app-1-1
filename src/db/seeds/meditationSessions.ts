import { db } from '@/db';
import { meditationSessions } from '@/db/schema';

async function main() {
    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const getDateBetween = (daysAgo: number) => {
        const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        return date.toISOString();
    };

    const sampleSessions = [
        // User 1 (Sarah - ID: 1): Regular morning mindfulness practitioner
        {
            userId: 1,
            sessionType: 'morning_mindfulness',
            durationMinutes: 15,
            completedAt: getDateBetween(13),
        },
        {
            userId: 1,
            sessionType: 'morning_mindfulness',
            durationMinutes: 20,
            completedAt: getDateBetween(11),
        },
        {
            userId: 1,
            sessionType: 'evening_calm',
            durationMinutes: 10,
            completedAt: getDateBetween(9),
        },
        {
            userId: 1,
            sessionType: 'morning_mindfulness',
            durationMinutes: 15,
            completedAt: getDateBetween(6),
        },
        {
            userId: 1,
            sessionType: 'stress_relief',
            durationMinutes: 12,
            completedAt: getDateBetween(3),
        },
        {
            userId: 1,
            sessionType: 'morning_mindfulness',
            durationMinutes: 20,
            completedAt: getDateBetween(1),
        },

        // User 2 (Michael - ID: 2): Evening and stress relief focused
        {
            userId: 2,
            sessionType: 'evening_calm',
            durationMinutes: 15,
            completedAt: getDateBetween(12),
        },
        {
            userId: 2,
            sessionType: 'stress_relief',
            durationMinutes: 20,
            completedAt: getDateBetween(10),
        },
        {
            userId: 2,
            sessionType: 'digital_detox',
            durationMinutes: 10,
            completedAt: getDateBetween(7),
        },
        {
            userId: 2,
            sessionType: 'evening_calm',
            durationMinutes: 15,
            completedAt: getDateBetween(4),
        },
        {
            userId: 2,
            sessionType: 'stress_relief',
            durationMinutes: 15,
            completedAt: getDateBetween(2),
        },

        // User 3 (Emily - ID: 3): Sleep and digital detox focused
        {
            userId: 3,
            sessionType: 'digital_detox',
            durationMinutes: 20,
            completedAt: getDateBetween(14),
        },
        {
            userId: 3,
            sessionType: 'sleep_preparation',
            durationMinutes: 15,
            completedAt: getDateBetween(12),
        },
        {
            userId: 3,
            sessionType: 'evening_calm',
            durationMinutes: 12,
            completedAt: getDateBetween(10),
        },
        {
            userId: 3,
            sessionType: 'sleep_preparation',
            durationMinutes: 18,
            completedAt: getDateBetween(8),
        },
        {
            userId: 3,
            sessionType: 'digital_detox',
            durationMinutes: 15,
            completedAt: getDateBetween(5),
        },
        {
            userId: 3,
            sessionType: 'sleep_preparation',
            durationMinutes: 20,
            completedAt: getDateBetween(2),
        },
        {
            userId: 3,
            sessionType: 'evening_calm',
            durationMinutes: 10,
            completedAt: getDateBetween(1),
        },
    ];

    await db.insert(meditationSessions).values(sampleSessions);
    
    console.log('✅ Meditation sessions seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});