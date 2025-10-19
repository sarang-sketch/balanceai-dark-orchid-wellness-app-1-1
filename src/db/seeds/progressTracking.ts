import { db } from '@/db';
import { progressTracking } from '@/db/schema';

async function main() {
    const today = new Date();
    const getDayDate = (daysAgo: number) => {
        const date = new Date(today);
        date.setDate(date.getDate() - daysAgo);
        return date.toISOString().split('T')[0];
    };

    const getDayTimestamp = (daysAgo: number) => {
        const date = new Date(today);
        date.setDate(date.getDate() - daysAgo);
        return date.toISOString();
    };

    const sampleProgressTracking = [
        // User 1 (Sarah) - Consistent healthy patterns
        {
            userId: 1,
            trackingDate: getDayDate(6),
            sleepHours: 7.5,
            screenTimeHours: 3.5,
            steps: 9500,
            calories: 1900,
            stressLevel: 3,
            createdAt: getDayTimestamp(6),
        },
        {
            userId: 1,
            trackingDate: getDayDate(5),
            sleepHours: 8.0,
            screenTimeHours: 3.0,
            steps: 10000,
            calories: 1850,
            stressLevel: 2,
            createdAt: getDayTimestamp(5),
        },
        {
            userId: 1,
            trackingDate: getDayDate(4),
            sleepHours: 7.0,
            screenTimeHours: 4.0,
            steps: 8500,
            calories: 1950,
            stressLevel: 4,
            createdAt: getDayTimestamp(4),
        },
        {
            userId: 1,
            trackingDate: getDayDate(3),
            sleepHours: 7.5,
            screenTimeHours: 3.5,
            steps: 9000,
            calories: 1800,
            stressLevel: 3,
            createdAt: getDayTimestamp(3),
        },
        {
            userId: 1,
            trackingDate: getDayDate(2),
            sleepHours: 8.0,
            screenTimeHours: 3.0,
            steps: 9800,
            calories: 2000,
            stressLevel: 2,
            createdAt: getDayTimestamp(2),
        },
        {
            userId: 1,
            trackingDate: getDayDate(1),
            sleepHours: 7.5,
            screenTimeHours: 3.5,
            steps: 9200,
            calories: 1900,
            stressLevel: 3,
            createdAt: getDayTimestamp(1),
        },
        {
            userId: 1,
            trackingDate: getDayDate(0),
            sleepHours: 7.0,
            screenTimeHours: 4.0,
            steps: 8800,
            calories: 1850,
            stressLevel: 3,
            createdAt: getDayTimestamp(0),
        },

        // User 2 (Michael) - Moderate patterns
        {
            userId: 2,
            trackingDate: getDayDate(6),
            sleepHours: 6.5,
            screenTimeHours: 6.0,
            steps: 6000,
            calories: 2100,
            stressLevel: 6,
            createdAt: getDayTimestamp(6),
        },
        {
            userId: 2,
            trackingDate: getDayDate(5),
            sleepHours: 6.0,
            screenTimeHours: 7.0,
            steps: 5500,
            calories: 2200,
            stressLevel: 7,
            createdAt: getDayTimestamp(5),
        },
        {
            userId: 2,
            trackingDate: getDayDate(4),
            sleepHours: 7.0,
            screenTimeHours: 5.5,
            steps: 6500,
            calories: 2000,
            stressLevel: 5,
            createdAt: getDayTimestamp(4),
        },
        {
            userId: 2,
            trackingDate: getDayDate(3),
            sleepHours: 6.5,
            screenTimeHours: 6.5,
            steps: 5800,
            calories: 2150,
            stressLevel: 6,
            createdAt: getDayTimestamp(3),
        },
        {
            userId: 2,
            trackingDate: getDayDate(2),
            sleepHours: 6.0,
            screenTimeHours: 6.0,
            steps: 5000,
            calories: 2100,
            stressLevel: 7,
            createdAt: getDayTimestamp(2),
        },
        {
            userId: 2,
            trackingDate: getDayDate(1),
            sleepHours: 6.5,
            screenTimeHours: 5.0,
            steps: 7000,
            calories: 2050,
            stressLevel: 5,
            createdAt: getDayTimestamp(1),
        },
        {
            userId: 2,
            trackingDate: getDayDate(0),
            sleepHours: 7.0,
            screenTimeHours: 5.5,
            steps: 6200,
            calories: 2000,
            stressLevel: 5,
            createdAt: getDayTimestamp(0),
        },

        // User 3 (Emily) - Improving patterns
        {
            userId: 3,
            trackingDate: getDayDate(6),
            sleepHours: 5.5,
            screenTimeHours: 9.0,
            steps: 3000,
            calories: 2300,
            stressLevel: 8,
            createdAt: getDayTimestamp(6),
        },
        {
            userId: 3,
            trackingDate: getDayDate(5),
            sleepHours: 5.5,
            screenTimeHours: 8.5,
            steps: 3500,
            calories: 2250,
            stressLevel: 8,
            createdAt: getDayTimestamp(5),
        },
        {
            userId: 3,
            trackingDate: getDayDate(4),
            sleepHours: 6.0,
            screenTimeHours: 8.0,
            steps: 4000,
            calories: 2200,
            stressLevel: 7,
            createdAt: getDayTimestamp(4),
        },
        {
            userId: 3,
            trackingDate: getDayDate(3),
            sleepHours: 6.0,
            screenTimeHours: 7.5,
            steps: 4500,
            calories: 2150,
            stressLevel: 7,
            createdAt: getDayTimestamp(3),
        },
        {
            userId: 3,
            trackingDate: getDayDate(2),
            sleepHours: 6.5,
            screenTimeHours: 7.0,
            steps: 5000,
            calories: 2100,
            stressLevel: 6,
            createdAt: getDayTimestamp(2),
        },
        {
            userId: 3,
            trackingDate: getDayDate(1),
            sleepHours: 6.5,
            screenTimeHours: 6.5,
            steps: 5500,
            calories: 2050,
            stressLevel: 6,
            createdAt: getDayTimestamp(1),
        },
        {
            userId: 3,
            trackingDate: getDayDate(0),
            sleepHours: 7.0,
            screenTimeHours: 6.0,
            steps: 6000,
            calories: 2000,
            stressLevel: 5,
            createdAt: getDayTimestamp(0),
        },
    ];

    await db.insert(progressTracking).values(sampleProgressTracking);
    
    console.log('✅ Progress tracking seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});