import { db } from '@/db';
import { plans } from '@/db/schema';

async function main() {
    const now = new Date();
    const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

    const samplePlans = [
        {
            userId: 1,
            goalId: 'fitness',
            goalTitle: '30-Day Fitness Challenge',
            planItems: [
                {
                    category: 'exercise',
                    title: 'Morning Yoga',
                    target: '15 min daily',
                    description: 'Start with gentle stretches and sun salutations to energize your morning',
                    completed: true,
                },
                {
                    category: 'exercise',
                    title: 'Evening Walk',
                    target: '30 min daily',
                    description: 'Take a brisk walk to clear your mind and boost cardiovascular health',
                    completed: true,
                },
                {
                    category: 'exercise',
                    title: 'Core Strengthening',
                    target: '10 min 3x/week',
                    description: 'Build core stability with planks, bridges, and leg raises',
                    completed: false,
                },
                {
                    category: 'nutrition',
                    title: 'Hydration Goal',
                    target: '8 glasses daily',
                    description: 'Track water intake throughout the day for optimal hydration',
                    completed: true,
                },
            ],
            createdAt: daysAgo(18),
            updatedAt: daysAgo(17),
        },
        {
            userId: 2,
            goalId: 'mental',
            goalTitle: 'Mindfulness Practice',
            planItems: [
                {
                    category: 'meditation',
                    title: 'Morning Meditation',
                    target: '10 min daily',
                    description: 'Start each day with focused breathing and body scan meditation',
                    completed: true,
                },
                {
                    category: 'meditation',
                    title: 'Gratitude Journaling',
                    target: '5 min daily',
                    description: 'Write down three things you are grateful for each evening',
                    completed: true,
                },
                {
                    category: 'stress-relief',
                    title: 'Deep Breathing Breaks',
                    target: '3x daily',
                    description: 'Practice 4-7-8 breathing technique during work breaks',
                    completed: false,
                },
                {
                    category: 'meditation',
                    title: 'Guided Sleep Meditation',
                    target: 'Nightly',
                    description: 'Use calming meditation to prepare mind and body for restful sleep',
                    completed: true,
                },
                {
                    category: 'stress-relief',
                    title: 'Nature Connection',
                    target: '20 min 3x/week',
                    description: 'Spend time outdoors practicing mindful observation of nature',
                    completed: false,
                },
            ],
            createdAt: daysAgo(15),
            updatedAt: daysAgo(14),
        },
        {
            userId: 3,
            goalId: 'digital',
            goalTitle: 'Digital Detox Program',
            planItems: [
                {
                    category: 'screen-time',
                    title: 'Phone-Free Mornings',
                    target: 'First 60 min after waking',
                    description: 'Start your day without checking phone to reduce morning stress',
                    completed: true,
                },
                {
                    category: 'screen-time',
                    title: 'Social Media Limits',
                    target: '30 min daily max',
                    description: 'Set app timers to control social media usage throughout the day',
                    completed: false,
                },
                {
                    category: 'boundaries',
                    title: 'Evening Digital Curfew',
                    target: '9 PM daily',
                    description: 'Stop using all screens 2 hours before bedtime for better sleep',
                    completed: true,
                },
                {
                    category: 'alternatives',
                    title: 'Offline Hobbies',
                    target: '1 hour daily',
                    description: 'Engage in reading, crafts, or other screen-free activities',
                    completed: false,
                },
            ],
            createdAt: daysAgo(12),
            updatedAt: daysAgo(10),
        },
        {
            userId: 1,
            goalId: 'sleep',
            goalTitle: 'Better Sleep Routine',
            planItems: [
                {
                    category: 'sleep-hygiene',
                    title: 'Consistent Sleep Schedule',
                    target: '10:30 PM - 6:30 AM',
                    description: 'Go to bed and wake up at the same time every day, including weekends',
                    completed: true,
                },
                {
                    category: 'sleep-hygiene',
                    title: 'Bedroom Environment',
                    target: 'Optimize nightly',
                    description: 'Keep room cool (65-68°F), dark, and quiet for optimal sleep conditions',
                    completed: false,
                },
                {
                    category: 'relaxation',
                    title: 'Wind-Down Routine',
                    target: '30 min before bed',
                    description: 'Create calming pre-sleep ritual: dim lights, gentle stretching, reading',
                    completed: true,
                },
            ],
            createdAt: daysAgo(10),
            updatedAt: daysAgo(9),
        },
    ];

    await db.insert(plans).values(samplePlans);
    
    console.log('✅ Plans seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});