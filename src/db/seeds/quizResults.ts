import { db } from '@/db';
import { quizResults } from '@/db/schema';

async function main() {
    const twentyDaysAgo = new Date();
    twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);
    
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    
    const twentyFiveDaysAgo = new Date();
    twentyFiveDaysAgo.setDate(twentyFiveDaysAgo.getDate() - 25);
    
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const sampleQuizResults = [
        {
            userId: 1,
            answers: {
                q1: 'good',
                q2: 'good',
                q3: 'often',
                q4: 'moderate',
                q5: 'good',
                q6: 'sometimes',
                q7: 'good',
                q8: 'moderate',
                q9: 'often',
                q10: 'good',
                q11: 'sometimes',
                q12: 'moderate',
                q13: 'good',
                q14: 'often',
                q15: 'good',
                q16: 'moderate',
                q17: 'good'
            },
            moodResult: 'balanced',
            balanceScore: 78,
            physicalScore: 75,
            cognitiveScore: 82,
            digitalScore: 80,
            createdAt: twentyDaysAgo.toISOString(),
        },
        {
            userId: 1,
            answers: {
                q1: 'excellent',
                q2: 'excellent',
                q3: 'always',
                q4: 'good',
                q5: 'excellent',
                q6: 'often',
                q7: 'excellent',
                q8: 'good',
                q9: 'always',
                q10: 'excellent',
                q11: 'often',
                q12: 'good',
                q13: 'excellent',
                q14: 'always',
                q15: 'excellent',
                q16: 'good',
                q17: 'excellent'
            },
            moodResult: 'balanced',
            balanceScore: 87,
            physicalScore: 85,
            cognitiveScore: 90,
            digitalScore: 86,
            createdAt: twoDaysAgo.toISOString(),
        },
        {
            userId: 2,
            answers: {
                q1: 'moderate',
                q2: 'moderate',
                q3: 'sometimes',
                q4: 'poor',
                q5: 'moderate',
                q6: 'rarely',
                q7: 'moderate',
                q8: 'poor',
                q9: 'sometimes',
                q10: 'moderate',
                q11: 'rarely',
                q12: 'poor',
                q13: 'moderate',
                q14: 'sometimes',
                q15: 'moderate',
                q16: 'poor',
                q17: 'moderate'
            },
            moodResult: 'needs_attention',
            balanceScore: 58,
            physicalScore: 55,
            cognitiveScore: 62,
            digitalScore: 57,
            createdAt: fifteenDaysAgo.toISOString(),
        },
        {
            userId: 3,
            answers: {
                q1: 'poor',
                q2: 'poor',
                q3: 'rarely',
                q4: 'poor',
                q5: 'poor',
                q6: 'never',
                q7: 'poor',
                q8: 'poor',
                q9: 'rarely',
                q10: 'poor',
                q11: 'never',
                q12: 'poor',
                q13: 'poor',
                q14: 'rarely',
                q15: 'poor',
                q16: 'poor',
                q17: 'poor'
            },
            moodResult: 'overloaded',
            balanceScore: 42,
            physicalScore: 35,
            cognitiveScore: 48,
            digitalScore: 45,
            createdAt: twentyFiveDaysAgo.toISOString(),
        },
        {
            userId: 3,
            answers: {
                q1: 'moderate',
                q2: 'moderate',
                q3: 'sometimes',
                q4: 'moderate',
                q5: 'good',
                q6: 'sometimes',
                q7: 'moderate',
                q8: 'moderate',
                q9: 'sometimes',
                q10: 'good',
                q11: 'sometimes',
                q12: 'moderate',
                q13: 'good',
                q14: 'sometimes',
                q15: 'moderate',
                q16: 'moderate',
                q17: 'good'
            },
            moodResult: 'needs_attention',
            balanceScore: 65,
            physicalScore: 60,
            cognitiveScore: 70,
            digitalScore: 66,
            createdAt: threeDaysAgo.toISOString(),
        },
    ];

    await db.insert(quizResults).values(sampleQuizResults);
    
    console.log('✅ Quiz results seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});