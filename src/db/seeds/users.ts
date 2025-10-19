import { db } from '@/db';
import { users } from '@/db/schema';

async function main() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sampleUsers = [
        {
            name: 'Sarah Johnson',
            email: 'sarah.johnson@balanceai.com',
            avatarUrl: 'https://i.pravatar.cc/150?img=1',
            createdAt: thirtyDaysAgo.toISOString(),
        },
        {
            name: 'Michael Chen',
            email: 'michael.chen@balanceai.com',
            avatarUrl: 'https://i.pravatar.cc/150?img=12',
            createdAt: thirtyDaysAgo.toISOString(),
        },
        {
            name: 'Emily Rodriguez',
            email: 'emily.rodriguez@balanceai.com',
            avatarUrl: 'https://i.pravatar.cc/150?img=23',
            createdAt: thirtyDaysAgo.toISOString(),
        }
    ];

    await db.insert(users).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});