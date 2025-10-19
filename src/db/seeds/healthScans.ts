import { db } from '@/db';
import { healthScans } from '@/db/schema';

async function main() {
    const now = Math.floor(Date.now() / 1000);
    
    const sampleHealthScans = [
        {
            userId: 1,
            overallHealth: 92,
            deficiencies: JSON.stringify(['Vitamin D']),
            recommendations: JSON.stringify([
                'Get 15-20 minutes of sunlight daily',
                'Maintain your current healthy routine',
                'Consider vitamin D supplements during winter'
            ]),
            imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528',
            createdAt: now - (86400 * 30)
        },
        {
            userId: 1,
            overallHealth: 94,
            deficiencies: JSON.stringify([]),
            recommendations: JSON.stringify([
                'Excellent health status',
                'Continue your balanced diet and exercise',
                'Keep up the good work'
            ]),
            imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528',
            createdAt: now - (86400 * 5)
        },
        {
            userId: 2,
            overallHealth: 72,
            deficiencies: JSON.stringify(['Iron', 'Vitamin C']),
            recommendations: JSON.stringify([
                'Increase iron intake with leafy greens and lean meats',
                'Add citrus fruits and bell peppers for vitamin C',
                'Consider iron supplements after consulting a doctor',
                'Pair iron-rich foods with vitamin C sources'
            ]),
            imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061',
            createdAt: now - (86400 * 25)
        },
        {
            userId: 2,
            overallHealth: 76,
            deficiencies: JSON.stringify(['Iron']),
            recommendations: JSON.stringify([
                'Good progress on vitamin C levels',
                'Continue iron supplementation',
                'Include spinach, lentils, and red meat in diet',
                'Monitor iron levels regularly'
            ]),
            imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061',
            createdAt: now - (86400 * 3)
        },
        {
            userId: 3,
            overallHealth: 62,
            deficiencies: JSON.stringify(['Vitamin D', 'Iron', 'Omega-3']),
            recommendations: JSON.stringify([
                'Prioritize sun exposure and vitamin D supplements',
                'Add fatty fish like salmon for omega-3',
                'Include iron-rich foods in every meal',
                'Consider a comprehensive multivitamin',
                'Consult with a healthcare provider for treatment plan'
            ]),
            imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352',
            createdAt: now - (86400 * 20)
        },
        {
            userId: 3,
            overallHealth: 70,
            deficiencies: JSON.stringify(['Vitamin D', 'Iron']),
            recommendations: JSON.stringify([
                'Significant improvement in omega-3 levels',
                'Continue vitamin D and iron supplementation',
                'Maintain current diet with fatty fish',
                'Keep monitoring deficiency levels',
                'Stay consistent with treatment plan'
            ]),
            imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352',
            createdAt: now - (86400 * 2)
        }
    ];

    await db.insert(healthScans).values(sampleHealthScans);
    
    console.log('✅ Health scans seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});