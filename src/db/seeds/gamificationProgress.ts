import { db } from '@/db';
import { gamificationProgress } from '@/db/schema';

async function main() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sampleGamificationProgress = [
        {
            userId: 1,
            level: 5,
            experiencePoints: 850,
            streakDays: 14,
            badges: [
                {
                    id: 'early_bird',
                    name: 'Early Bird',
                    description: 'Complete 7 morning meditations',
                    earnedAt: '2024-01-15'
                },
                {
                    id: 'consistency',
                    name: 'Consistency Champion',
                    description: 'Maintain 14-day streak',
                    earnedAt: '2024-01-20'
                },
                {
                    id: 'wellness_warrior',
                    name: 'Wellness Warrior',
                    description: 'Complete all wellness assessments',
                    earnedAt: '2024-01-18'
                }
            ],
            lastActivityDate: today.toISOString().split('T')[0],
            createdAt: thirtyDaysAgo.toISOString(),
        },
        {
            userId: 2,
            level: 3,
            experiencePoints: 420,
            streakDays: 5,
            badges: [
                {
                    id: 'first_steps',
                    name: 'First Steps',
                    description: 'Complete first meditation',
                    earnedAt: '2024-01-12'
                },
                {
                    id: 'stress_buster',
                    name: 'Stress Buster',
                    description: 'Complete 5 stress relief sessions',
                    earnedAt: '2024-01-19'
                }
            ],
            lastActivityDate: yesterday.toISOString().split('T')[0],
            createdAt: thirtyDaysAgo.toISOString(),
        },
        {
            userId: 3,
            level: 4,
            experiencePoints: 580,
            streakDays: 8,
            badges: [
                {
                    id: 'digital_detox',
                    name: 'Digital Detox',
                    description: 'Reduce screen time by 30%',
                    earnedAt: '2024-01-14'
                },
                {
                    id: 'sleep_master',
                    name: 'Sleep Master',
                    description: 'Improve sleep score by 20 points',
                    earnedAt: '2024-01-21'
                },
                {
                    id: 'progress_tracker',
                    name: 'Progress Tracker',
                    description: 'Log progress for 7 consecutive days',
                    earnedAt: '2024-01-17'
                }
            ],
            lastActivityDate: today.toISOString().split('T')[0],
            createdAt: thirtyDaysAgo.toISOString(),
        }
    ];

    await db.insert(gamificationProgress).values(sampleGamificationProgress);
    
    console.log('✅ Gamification progress seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});