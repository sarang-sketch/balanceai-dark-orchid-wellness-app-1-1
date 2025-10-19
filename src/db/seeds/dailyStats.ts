import { db } from '@/db';
import { dailyStats } from '@/db/schema';

async function main() {
    const now = Math.floor(Date.now() / 1000);
    
    const records = [
        // User 1 - High activity user (7 days)
        {
            userId: 1,
            date: '2025-01-15',
            steps: 10500,
            caloriesBurned: 2350,
            workoutMinutes: 75,
            waterIntake: 10,
            createdAt: now - (86400 * 6),
            updatedAt: now - (86400 * 6)
        },
        {
            userId: 1,
            date: '2025-01-16',
            steps: 11200,
            caloriesBurned: 2450,
            workoutMinutes: 85,
            waterIntake: 11,
            createdAt: now - (86400 * 5),
            updatedAt: now - (86400 * 5)
        },
        {
            userId: 1,
            date: '2025-01-17',
            steps: 9800,
            caloriesBurned: 2200,
            workoutMinutes: 60,
            waterIntake: 9,
            createdAt: now - (86400 * 4),
            updatedAt: now - (86400 * 4)
        },
        {
            userId: 1,
            date: '2025-01-18',
            steps: 12000,
            caloriesBurned: 2500,
            workoutMinutes: 90,
            waterIntake: 12,
            createdAt: now - (86400 * 3),
            updatedAt: now - (86400 * 3)
        },
        {
            userId: 1,
            date: '2025-01-19',
            steps: 10800,
            caloriesBurned: 2400,
            workoutMinutes: 70,
            waterIntake: 10,
            createdAt: now - (86400 * 2),
            updatedAt: now - (86400 * 2)
        },
        {
            userId: 1,
            date: '2025-01-20',
            steps: 8500,
            caloriesBurned: 2100,
            workoutMinutes: 50,
            waterIntake: 8,
            createdAt: now - 86400,
            updatedAt: now - 86400
        },
        {
            userId: 1,
            date: '2025-01-21',
            steps: 11500,
            caloriesBurned: 2480,
            workoutMinutes: 80,
            waterIntake: 11,
            createdAt: now,
            updatedAt: now
        },
        
        // User 2 - Moderate activity user (7 days)
        {
            userId: 2,
            date: '2025-01-15',
            steps: 6500,
            caloriesBurned: 2000,
            workoutMinutes: 45,
            waterIntake: 7,
            createdAt: now - (86400 * 6),
            updatedAt: now - (86400 * 6)
        },
        {
            userId: 2,
            date: '2025-01-16',
            steps: 7200,
            caloriesBurned: 2100,
            workoutMinutes: 55,
            waterIntake: 8,
            createdAt: now - (86400 * 5),
            updatedAt: now - (86400 * 5)
        },
        {
            userId: 2,
            date: '2025-01-17',
            steps: 5800,
            caloriesBurned: 1900,
            workoutMinutes: 35,
            waterIntake: 6,
            createdAt: now - (86400 * 4),
            updatedAt: now - (86400 * 4)
        },
        {
            userId: 2,
            date: '2025-01-18',
            steps: 7800,
            caloriesBurned: 2200,
            workoutMinutes: 60,
            waterIntake: 9,
            createdAt: now - (86400 * 3),
            updatedAt: now - (86400 * 3)
        },
        {
            userId: 2,
            date: '2025-01-19',
            steps: 6800,
            caloriesBurned: 2050,
            workoutMinutes: 50,
            waterIntake: 8,
            createdAt: now - (86400 * 2),
            updatedAt: now - (86400 * 2)
        },
        {
            userId: 2,
            date: '2025-01-20',
            steps: 5500,
            caloriesBurned: 1850,
            workoutMinutes: 30,
            waterIntake: 6,
            createdAt: now - 86400,
            updatedAt: now - 86400
        },
        {
            userId: 2,
            date: '2025-01-21',
            steps: 7500,
            caloriesBurned: 2150,
            workoutMinutes: 58,
            waterIntake: 9,
            createdAt: now,
            updatedAt: now
        },
        
        // User 3 - Low activity user (7 days)
        {
            userId: 3,
            date: '2025-01-15',
            steps: 5200,
            caloriesBurned: 1800,
            workoutMinutes: 25,
            waterIntake: 6,
            createdAt: now - (86400 * 6),
            updatedAt: now - (86400 * 6)
        },
        {
            userId: 3,
            date: '2025-01-16',
            steps: 6500,
            caloriesBurned: 1950,
            workoutMinutes: 40,
            waterIntake: 7,
            createdAt: now - (86400 * 5),
            updatedAt: now - (86400 * 5)
        },
        {
            userId: 3,
            date: '2025-01-17',
            steps: 3800,
            caloriesBurned: 1650,
            workoutMinutes: 18,
            waterIntake: 5,
            createdAt: now - (86400 * 4),
            updatedAt: now - (86400 * 4)
        },
        {
            userId: 3,
            date: '2025-01-18',
            steps: 7000,
            caloriesBurned: 2000,
            workoutMinutes: 45,
            waterIntake: 8,
            createdAt: now - (86400 * 3),
            updatedAt: now - (86400 * 3)
        },
        {
            userId: 3,
            date: '2025-01-19',
            steps: 5800,
            caloriesBurned: 1850,
            workoutMinutes: 32,
            waterIntake: 7,
            createdAt: now - (86400 * 2),
            updatedAt: now - (86400 * 2)
        },
        {
            userId: 3,
            date: '2025-01-20',
            steps: 3500,
            caloriesBurned: 1600,
            workoutMinutes: 15,
            waterIntake: 4,
            createdAt: now - 86400,
            updatedAt: now - 86400
        },
        {
            userId: 3,
            date: '2025-01-21',
            steps: 6200,
            caloriesBurned: 1900,
            workoutMinutes: 38,
            waterIntake: 7,
            createdAt: now,
            updatedAt: now
        }
    ];

    await db.insert(dailyStats).values(records);
    
    console.log('✅ Daily stats seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});