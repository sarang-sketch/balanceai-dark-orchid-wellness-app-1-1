import { db } from '@/db';
import { communityPosts } from '@/db/schema';

async function main() {
    const now = new Date();
    const samplePosts = [
        {
            userId: 1,
            content: "Starting my day with 10 minutes of meditation has completely changed my morning routine! Feeling more centered and focused. #MindfulMonday",
            likes: 18,
            createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 2,
            content: "Pro tip: Keep your phone out of the bedroom for better sleep quality. Game changer! 📵😴",
            likes: 23,
            createdAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 3,
            content: "Just completed my first week of digital detox evenings. Reading before bed instead of scrolling - highly recommend!",
            likes: 15,
            createdAt: new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 1,
            content: "Meal prep Sunday! Planning healthy meals ahead saves time and keeps me on track with nutrition goals 🥗",
            likes: 21,
            createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 2,
            content: "Taking short walking breaks during work hours. Already feeling less stressed and more productive!",
            likes: 12,
            createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 3,
            content: "Gratitude journaling before bed has helped reduce my anxiety. Simple but powerful practice 🙏",
            likes: 25,
            createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 1,
            content: "Hydration reminder: I set phone alarms every 2 hours to drink water. Already feeling more energized! 💧",
            likes: 17,
            createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 2,
            content: "Started a morning stretching routine. No more back pain from sitting all day! Anyone else struggling with this?",
            likes: 19,
            createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 3,
            content: "Finding an accountability partner made all the difference in sticking to my wellness goals. We check in daily!",
            likes: 14,
            createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 1,
            content: "Remember: progress over perfection. Celebrate small wins on your wellness journey! 🌟",
            likes: 22,
            createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        }
    ];

    await db.insert(communityPosts).values(samplePosts);
    
    console.log('✅ Community posts seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});