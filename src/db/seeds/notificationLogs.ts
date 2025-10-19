import { db } from '@/db';
import { notificationLogs } from '@/db/schema';

async function main() {
    const now = new Date();
    
    const sampleNotificationLogs = [
        // User 1 logs
        {
            userId: 1,
            reminderType: 'wake_up_call',
            notificationMethod: 'email',
            message: 'Good morning! Time to wake up and start your day!',
            sentAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            status: 'sent',
        },
        {
            userId: 1,
            reminderType: 'workout',
            notificationMethod: 'email',
            message: "Time for your workout session! Let's get moving!",
            sentAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
            status: 'sent',
        },
        {
            userId: 1,
            reminderType: 'water',
            notificationMethod: 'whatsapp',
            message: 'Hydration reminder! Time to drink some water.',
            sentAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
            status: 'sent',
        },
        {
            userId: 1,
            reminderType: 'wake_up_call',
            notificationMethod: 'both',
            message: 'Good morning! Time to wake up and start your day!',
            sentAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
            status: 'sent',
        },
        {
            userId: 1,
            reminderType: 'workout',
            notificationMethod: 'both',
            message: "Time for your workout session! Let's get moving!",
            sentAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
            status: 'sent',
        },
        // User 2 logs
        {
            userId: 2,
            reminderType: 'meditation',
            notificationMethod: 'email',
            message: 'Time for your meditation practice. Take a moment to breathe.',
            sentAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
            status: 'sent',
        },
        {
            userId: 2,
            reminderType: 'meal',
            notificationMethod: 'whatsapp',
            message: "Meal reminder! Don't forget to eat healthy and stay nourished.",
            sentAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
            status: 'sent',
        },
        {
            userId: 2,
            reminderType: 'meditation',
            notificationMethod: 'email',
            message: 'Time for your meditation practice. Take a moment to breathe.',
            sentAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
            status: 'sent',
        },
        {
            userId: 2,
            reminderType: 'meal',
            notificationMethod: 'whatsapp',
            message: "Meal reminder! Don't forget to eat healthy and stay nourished.",
            sentAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
            status: 'failed',
        },
        {
            userId: 2,
            reminderType: 'meditation',
            notificationMethod: 'email',
            message: 'Time for your meditation practice. Take a moment to breathe.',
            sentAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
            status: 'sent',
        },
        // User 3 logs
        {
            userId: 3,
            reminderType: 'wake_up_call',
            notificationMethod: 'whatsapp',
            message: 'Good morning! Time to wake up and start your day!',
            sentAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000),
            status: 'sent',
        },
        {
            userId: 3,
            reminderType: 'meditation',
            notificationMethod: 'email',
            message: 'Time for your meditation practice. Take a moment to breathe.',
            sentAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
            status: 'sent',
        },
        {
            userId: 3,
            reminderType: 'water',
            notificationMethod: 'both',
            message: 'Hydration reminder! Time to drink some water.',
            sentAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
            status: 'sent',
        },
        {
            userId: 3,
            reminderType: 'wake_up_call',
            notificationMethod: 'whatsapp',
            message: 'Good morning! Time to wake up and start your day!',
            sentAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
            status: 'sent',
        },
        {
            userId: 3,
            reminderType: 'meditation',
            notificationMethod: 'email',
            message: 'Time for your meditation practice. Take a moment to breathe.',
            sentAt: new Date(now.getTime() - 18 * 60 * 60 * 1000),
            status: 'pending',
        },
    ];

    await db.insert(notificationLogs).values(sampleNotificationLogs);
    
    console.log('✅ Notification logs seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});