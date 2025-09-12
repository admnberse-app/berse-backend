const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFeedback() {
  console.log('Checking CardGame feedback in database...\n');
  
  try {
    // Check if CardGameFeedback table exists and has data
    const feedbackCount = await prisma.cardGameFeedback.count();
    console.log(`Total feedback entries: ${feedbackCount}`);
    
    if (feedbackCount > 0) {
      // Get recent feedback
      const recentFeedback = await prisma.cardGameFeedback.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          user: {
            select: {
              fullName: true,
              email: true
            }
          }
        }
      });
      
      console.log('\nRecent feedback entries:');
      console.log('========================');
      recentFeedback.forEach((feedback, index) => {
        console.log(`\n${index + 1}. Feedback ID: ${feedback.id}`);
        console.log(`   User: ${feedback.user?.fullName || 'Unknown'} (${feedback.user?.email || 'N/A'})`);
        console.log(`   Topic: ${feedback.topicId}`);
        console.log(`   Session: ${feedback.sessionNumber}`);
        console.log(`   Question: ${feedback.questionId}`);
        console.log(`   Rating: ${'⭐'.repeat(feedback.rating)} (${feedback.rating}/5)`);
        console.log(`   Comment: ${feedback.comment || 'No comment'}`);
        console.log(`   Created: ${feedback.createdAt}`);
      });
      
      // Check for feedback from today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todaysFeedback = await prisma.cardGameFeedback.count({
        where: {
          createdAt: {
            gte: today
          }
        }
      });
      
      console.log(`\n📊 Feedback submitted today: ${todaysFeedback}`);
      
      // Check stats table
      const stats = await prisma.cardGameStats.findMany();
      if (stats.length > 0) {
        console.log('\n📈 Topic Statistics:');
        stats.forEach(stat => {
          console.log(`   ${stat.topicId}: Avg Rating ${stat.averageRating.toFixed(1)}/5, Total: ${stat.totalFeedback}`);
        });
      }
      
    } else {
      console.log('\n❌ No feedback found in database.');
      console.log('This could mean:');
      console.log('1. The feedback wasn\'t saved (check if you were logged in)');
      console.log('2. Database connection issue');
      console.log('3. API endpoint not working');
    }
    
    // Test if the table structure is correct
    console.log('\n✅ Database connection successful!');
    console.log('CardGameFeedback table exists and is accessible.');
    
  } catch (error) {
    console.error('\n❌ Error checking feedback:', error.message);
    if (error.code === 'P2021') {
      console.log('The CardGameFeedback table does not exist in the database.');
      console.log('Migrations may not have been applied.');
    } else if (error.code === 'P2002') {
      console.log('Database connection failed.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkFeedback();