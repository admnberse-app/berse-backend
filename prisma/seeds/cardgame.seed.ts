/**
 * Card Game Seed Data
 * Seeds topics and questions for the Card Game feature
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedCardGame() {
  console.log('🎴 Seeding Card Game data...');

  try {
    // Seed "Slow Down, You're Doing Fine" topic
    const slowdownTopic = await prisma.cardGameTopic.upsert({
      where: { id: 'slowdown' },
      update: {
        title: 'Slow Down, You\'re Doing Fine',
        description: 'Embrace your pace and find peace in your journey without comparing to others.',
        gradient: 'linear-gradient(135deg, #2ECE98, #4fc3a1, #6ed4b0)',
        totalSessions: 2,
        isActive: true,
        displayOrder: 1,
      },
      create: {
        id: 'slowdown',
        title: 'Slow Down, You\'re Doing Fine',
        description: 'Embrace your pace and find peace in your journey without comparing to others.',
        gradient: 'linear-gradient(135deg, #2ECE98, #4fc3a1, #6ed4b0)',
        totalSessions: 2,
        isActive: true,
        displayOrder: 1,
      },
    });

    console.log('✅ Created topic:', slowdownTopic.title);

    // Seed Session 1 Questions - Recognizing Your Pace
    const session1Questions = [
      'What areas of your life do you feel you\'re "behind" in, and who decided this timeline?',
      'How does social media impact your perception of where you "should" be in life?',
      'When was the last time you celebrated a small win instead of rushing to the next goal?',
      'What would change if you truly believed you\'re exactly where you need to be?',
      'How do you distinguish between healthy ambition and toxic comparison?',
      'What pressures from family or society make you feel like you\'re not doing enough?',
      'In what ways has rushing through life caused you to miss meaningful moments?',
      'How would your younger self view your current achievements?',
      'What does "success" mean to you when you remove everyone else\'s opinions?',
      'How can you practice self-compassion when you feel you\'re falling behind?',
    ];

    // Seed Session 2 Questions - Finding Your Rhythm
    const session2Questions = [
      'What would a day designed entirely around your natural rhythm look like?',
      'How can you set boundaries with people who pressure you to move faster?',
      'What activities help you feel grounded when life feels overwhelming?',
      'How do you want to feel at the end of each day, regardless of productivity?',
      'What would you stop doing if you truly believed you were doing fine?',
      'How can you reframe "rest" as productive rather than lazy?',
      'What permission do you need to give yourself to slow down?',
      'How might your life improve if you focused on depth over speed?',
      'What practices help you stay present instead of constantly planning ahead?',
      'How can you create a life where "fine" is actually enough?',
    ];

    // Create Session 1 questions
    console.log('📝 Creating Session 1 questions...');
    for (let i = 0; i < session1Questions.length; i++) {
      await prisma.cardGameQuestion.upsert({
        where: {
          topicId_sessionNumber_questionOrder: {
            topicId: 'slowdown',
            sessionNumber: 1,
            questionOrder: i + 1,
          },
        },
        update: {
          questionText: session1Questions[i],
        },
        create: {
          topicId: 'slowdown',
          sessionNumber: 1,
          questionOrder: i + 1,
          questionText: session1Questions[i],
          isActive: true,
        },
      });
    }
    console.log(`✅ Created ${session1Questions.length} questions for Session 1`);

    // Create Session 2 questions
    console.log('📝 Creating Session 2 questions...');
    for (let i = 0; i < session2Questions.length; i++) {
      await prisma.cardGameQuestion.upsert({
        where: {
          topicId_sessionNumber_questionOrder: {
            topicId: 'slowdown',
            sessionNumber: 2,
            questionOrder: i + 1,
          },
        },
        update: {
          questionText: session2Questions[i],
        },
        create: {
          topicId: 'slowdown',
          sessionNumber: 2,
          questionOrder: i + 1,
          questionText: session2Questions[i],
          isActive: true,
        },
      });
    }
    console.log(`✅ Created ${session2Questions.length} questions for Session 2`);

    // Summary
    const totalQuestions = await prisma.cardGameQuestion.count({
      where: { topicId: 'slowdown' },
    });

    console.log('\n🎉 Card Game seed completed!');
    console.log(`   Topics: 1`);
    console.log(`   Questions: ${totalQuestions}`);
    console.log(`   Sessions: 2\n`);

  } catch (error) {
    console.error('❌ Error seeding Card Game data:', error);
    throw error;
  }
}

// Run seed if called directly
if (require.main === module) {
  seedCardGame()
    .then(() => {
      console.log('✅ Card Game seed completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Card Game seed failed:', error);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
