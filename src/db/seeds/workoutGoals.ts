import { db } from '@/db';
import { workoutGoals } from '@/db/schema';

async function main() {
    const now = Math.floor(Date.now() / 1000);
    
    const goals = [
        {
            userId: 1,
            goalType: 'daily_steps',
            targetValue: 10000,
            currentValue: 8500,
            createdAt: now - (86400 * 20),
            updatedAt: now - (86400 * 2)
        },
        {
            userId: 1,
            goalType: 'weekly_workouts',
            targetValue: 5,
            currentValue: 4,
            createdAt: now - (86400 * 18),
            updatedAt: now - (86400 * 1)
        },
        {
            userId: 1,
            goalType: 'monthly_calories',
            targetValue: 60000,
            currentValue: 45000,
            createdAt: now - (86400 * 25),
            updatedAt: now - (86400 * 3)
        },
        {
            userId: 1,
            goalType: 'running_distance',
            targetValue: 25,
            currentValue: 18,
            createdAt: now - (86400 * 22),
            updatedAt: now - (86400 * 1)
        },
        {
            userId: 2,
            goalType: 'daily_steps',
            targetValue: 7500,
            currentValue: 5000,
            createdAt: now - (86400 * 15),
            updatedAt: now - (86400 * 2)
        },
        {
            userId: 2,
            goalType: 'weight_loss',
            targetValue: 10,
            currentValue: 3,
            createdAt: now - (86400 * 30),
            updatedAt: now - (86400 * 4)
        },
        {
            userId: 2,
            goalType: 'strength_training',
            targetValue: 3,
            currentValue: 2,
            createdAt: now - (86400 * 12),
            updatedAt: now - (86400 * 1)
        },
        {
            userId: 2,
            goalType: 'monthly_calories',
            targetValue: 40000,
            currentValue: 22000,
            createdAt: now - (86400 * 28),
            updatedAt: now - (86400 * 3)
        },
        {
            userId: 3,
            goalType: 'daily_steps',
            targetValue: 5000,
            currentValue: 3500,
            createdAt: now - (86400 * 10),
            updatedAt: now - (86400 * 1)
        },
        {
            userId: 3,
            goalType: 'weekly_workouts',
            targetValue: 3,
            currentValue: 1,
            createdAt: now - (86400 * 8),
            updatedAt: now - (86400 * 2)
        },
        {
            userId: 3,
            goalType: 'running_distance',
            targetValue: 15,
            currentValue: 5,
            createdAt: now - (86400 * 14),
            updatedAt: now - (86400 * 3)
        },
        {
            userId: 3,
            goalType: 'strength_training',
            targetValue: 2,
            currentValue: 1,
            createdAt: now - (86400 * 7),
            updatedAt: now - (86400 * 1)
        }
    ];

    await db.insert(workoutGoals).values(goals);
    
    console.log('✅ Workout goals seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});