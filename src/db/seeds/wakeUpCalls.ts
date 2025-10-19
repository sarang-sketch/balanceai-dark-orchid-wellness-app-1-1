import { db } from '@/db';
import { wakeUpCalls } from '@/db/schema';

async function main() {
    const now = Date.now();
    const daysInMs = 24 * 60 * 60 * 1000;
    
    const sampleWakeUpCalls = [
        {
            userId: 1,
            scheduledTime: '06:30',
            enabled: true,
            createdAt: new Date(now - 25 * daysInMs),
        },
        {
            userId: 1,
            scheduledTime: '08:00',
            enabled: false,
            createdAt: new Date(now - 20 * daysInMs),
        },
        {
            userId: 1,
            scheduledTime: '07:15',
            enabled: true,
            createdAt: new Date(now - 15 * daysInMs),
        },
        {
            userId: 2,
            scheduledTime: '05:45',
            enabled: true,
            createdAt: new Date(now - 28 * daysInMs),
        },
        {
            userId: 2,
            scheduledTime: '07:00',
            enabled: false,
            createdAt: new Date(now - 22 * daysInMs),
        },
        {
            userId: 2,
            scheduledTime: '06:00',
            enabled: true,
            createdAt: new Date(now - 18 * daysInMs),
        },
        {
            userId: 3,
            scheduledTime: '07:30',
            enabled: true,
            createdAt: new Date(now - 30 * daysInMs),
        },
        {
            userId: 3,
            scheduledTime: '09:00',
            enabled: true,
            createdAt: new Date(now - 24 * daysInMs),
        },
        {
            userId: 3,
            scheduledTime: '08:15',
            enabled: true,
            createdAt: new Date(now - 17 * daysInMs),
        },
    ];

    await db.insert(wakeUpCalls).values(sampleWakeUpCalls);
    
    console.log('✅ Wake-up calls seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});