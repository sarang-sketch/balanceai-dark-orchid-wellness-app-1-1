import { db } from '@/db';
import { notifications } from '@/db/schema';

async function main() {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

    const sampleNotifications = [
        {
            userId: 1,
            notificationType: 'reminder',
            message: 'Time for your evening meditation session',
            isRead: false,
            createdAt: now.toISOString(),
        },
        {
            userId: 1,
            notificationType: 'achievement',
            message: "Congratulations! You've maintained a 7-day streak!",
            isRead: true,
            createdAt: fiveDaysAgo.toISOString(),
        },
        {
            userId: 1,
            notificationType: 'update',
            message: 'Your wellness plan has been updated with new goals',
            isRead: true,
            createdAt: tenDaysAgo.toISOString(),
        },
        {
            userId: 2,
            notificationType: 'check_in',
            message: 'How are you feeling today? Complete your daily check-in',
            isRead: false,
            createdAt: now.toISOString(),
        },
        {
            userId: 2,
            notificationType: 'reminder',
            message: "Don't forget your afternoon breathing exercise",
            isRead: false,
            createdAt: now.toISOString(),
        },
        {
            userId: 2,
            notificationType: 'achievement',
            message: "You've completed 5 meditation sessions this week!",
            isRead: true,
            createdAt: threeDaysAgo.toISOString(),
        },
        {
            userId: 3,
            notificationType: 'update',
            message: 'New wellness tips available in the community feed',
            isRead: false,
            createdAt: oneDayAgo.toISOString(),
        },
        {
            userId: 3,
            notificationType: 'reminder',
            message: 'Time to log your daily progress',
            isRead: true,
            createdAt: twoDaysAgo.toISOString(),
        },
        {
            userId: 3,
            notificationType: 'achievement',
            message: 'Great job! Your screen time has decreased by 30%',
            isRead: true,
            createdAt: sevenDaysAgo.toISOString(),
        },
        {
            userId: 3,
            notificationType: 'check_in',
            message: 'Weekly wellness check-in ready',
            isRead: false,
            createdAt: now.toISOString(),
        },
    ];

    await db.insert(notifications).values(sampleNotifications);
    
    console.log('✅ Notifications seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});