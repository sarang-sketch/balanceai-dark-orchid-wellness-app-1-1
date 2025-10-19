import { db } from '@/db';
import { reminderPreferences } from '@/db/schema';

async function main() {
    const twentyDaysAgo = new Date();
    twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);
    
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const sampleReminderPreferences = [
        // User 1 (userId: 1) - Active morning person
        {
            userId: 1,
            reminderType: 'wake_up_call',
            notificationMethod: 'email',
            scheduleTime: '06:30',
            daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            enabled: true,
            createdAt: twentyDaysAgo,
            updatedAt: twentyDaysAgo,
        },
        {
            userId: 1,
            reminderType: 'workout',
            notificationMethod: 'both',
            scheduleTime: '18:00',
            daysOfWeek: ['monday', 'wednesday', 'friday'],
            enabled: true,
            createdAt: twentyDaysAgo,
            updatedAt: twentyDaysAgo,
        },
        {
            userId: 1,
            reminderType: 'water',
            notificationMethod: 'whatsapp',
            scheduleTime: '10:00',
            daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
            enabled: true,
            createdAt: twentyDaysAgo,
            updatedAt: twentyDaysAgo,
        },
        // User 2 (userId: 2) - Evening focused
        {
            userId: 2,
            reminderType: 'meditation',
            notificationMethod: 'email',
            scheduleTime: '20:00',
            daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
            enabled: true,
            createdAt: twentyDaysAgo,
            updatedAt: twentyDaysAgo,
        },
        {
            userId: 2,
            reminderType: 'meal',
            notificationMethod: 'whatsapp',
            scheduleTime: '12:30',
            daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            enabled: true,
            createdAt: twentyDaysAgo,
            updatedAt: twentyDaysAgo,
        },
        {
            userId: 2,
            reminderType: 'workout',
            notificationMethod: 'both',
            scheduleTime: '19:00',
            daysOfWeek: ['tuesday', 'thursday', 'saturday'],
            enabled: false,
            createdAt: twentyDaysAgo,
            updatedAt: fiveDaysAgo,
        },
        // User 3 (userId: 3) - Mixed schedule
        {
            userId: 3,
            reminderType: 'wake_up_call',
            notificationMethod: 'whatsapp',
            scheduleTime: '07:00',
            daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            enabled: true,
            createdAt: twentyDaysAgo,
            updatedAt: twentyDaysAgo,
        },
        {
            userId: 3,
            reminderType: 'meditation',
            notificationMethod: 'email',
            scheduleTime: '06:00',
            daysOfWeek: ['monday', 'wednesday', 'friday'],
            enabled: true,
            createdAt: twentyDaysAgo,
            updatedAt: twentyDaysAgo,
        },
        {
            userId: 3,
            reminderType: 'water',
            notificationMethod: 'both',
            scheduleTime: '14:00',
            daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
            enabled: true,
            createdAt: twentyDaysAgo,
            updatedAt: twentyDaysAgo,
        },
    ];

    await db.insert(reminderPreferences).values(sampleReminderPreferences);
    
    console.log('✅ Reminder preferences seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});