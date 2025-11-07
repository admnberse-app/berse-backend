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

    // Seed "Fear of Missing Out" topic
    const fomoTopic = await prisma.cardGameTopic.upsert({
      where: { id: 'fomo' },
      update: {
        title: 'Fear of Missing Out',
        description: 'Explore FOMO and learn to manage anxiety about missing experiences while finding balance in a connected world.',
        gradient: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)',
        totalSessions: 2,
        isActive: true,
        displayOrder: 2,
      },
      create: {
        id: 'fomo',
        title: 'Fear of Missing Out',
        description: 'Explore FOMO and learn to manage anxiety about missing experiences while finding balance in a connected world.',
        gradient: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)',
        totalSessions: 2,
        isActive: true,
        displayOrder: 2,
      },
    });

    console.log('✅ Created topic:', fomoTopic.title);

    // Seed FOMO Session 1 Questions - Triggers & Impacts
    const fomoSession1Questions = [
      'How would you define FOMO in your own words? Can it be a healthy motivator, or is it always negative?',
      'Have you ever experienced FOMO in your life? What was the situation?',
      'How do you think FOMO impacts a person\'s decision-making process, both in personal and professional contexts?',
      'What role does peer pressure play in intensifying or alleviating FOMO?',
      'Do you think there are specific social media platforms or behaviors that amplify FOMO?',
      'How does FOMO manifest in personal relationships or friendships?',
      'Do you think there are societal pressures that intensify FOMO?',
      'How does the fear of missing out relate to the need for social validation?',
      'Do you agree that FOMO affects self-esteem and self-worth?',
      'In your own words, what role does the constant stream of information on social media play in FOMO?',
      'Do you believe FOMO is a modern phenomenon, or has it existed in different forms throughout history?',
      'What roles does advertising and marketing play in exacerbating FOMO?',
      'Have you noticed any positive aspects of comparison in the context of FOMO?',
      'Do you adopt the habit of constantly comparing your life to others on social media? Does it affect your overall well-being and happiness?',
      'Can you share a motivational drive that you have received in the context of FOMO?',
    ];

    // Seed FOMO Session 2 Questions - Psychological and Emotional Aspects
    const fomoSession2Questions = [
      'Share your favorite way to stay in the loop with what\'s happening in your social circle?',
      'Are there apps or tools that can help individuals combat FOMO?',
      'How do you strike a balance between staying connected & avoiding FOMO-related burnout?',
      'Have you ever made a spontaneous decision just to avoid FOMO? Were there any regrets?',
      'Do you think that it is possible to turn FOMO into a source of motivation or inspiration?',
      'How can one strike a balance between encouraging participation in social activities and respecting people\'s need for downtime?',
      'Do you think FOMO affects different age groups differently?',
      'How does practicing gratitude and appreciating the present moment help you promote a more positive mindset?',
      'How do you think advertisements and marketing campaigns exploit FOMO to drive sales? Have you seen one?',
      'In what ways has FOMO inspired you to connect with like-minded individuals or communities who share your interests and passions?',
      'How does self-acceptance and self-compassion play a role in combating the negative impacts of FOMO?',
      'Do you think that society\'s expectations and standards affect physical health in regards to FOMO?',
      'What roles does empathy play in dealing with the FOMO concerns of your friends?',
      'How can you strike a balance between sharing the highlights of your life on social media while also being transparent about the less glamorous aspects?',
      'In what way can FOMO be a reminder of the abundance of experiences and possibilities available to us?',
    ];

    // Create FOMO Session 1 questions
    console.log('📝 Creating FOMO Session 1 questions...');
    for (let i = 0; i < fomoSession1Questions.length; i++) {
      await prisma.cardGameQuestion.upsert({
        where: {
          topicId_sessionNumber_questionOrder: {
            topicId: 'fomo',
            sessionNumber: 1,
            questionOrder: i + 1,
          },
        },
        update: {
          questionText: fomoSession1Questions[i],
        },
        create: {
          topicId: 'fomo',
          sessionNumber: 1,
          questionOrder: i + 1,
          questionText: fomoSession1Questions[i],
          isActive: true,
        },
      });
    }
    console.log(`✅ Created ${fomoSession1Questions.length} questions for FOMO Session 1`);

    // Create FOMO Session 2 questions
    console.log('📝 Creating FOMO Session 2 questions...');
    for (let i = 0; i < fomoSession2Questions.length; i++) {
      await prisma.cardGameQuestion.upsert({
        where: {
          topicId_sessionNumber_questionOrder: {
            topicId: 'fomo',
            sessionNumber: 2,
            questionOrder: i + 1,
          },
        },
        update: {
          questionText: fomoSession2Questions[i],
        },
        create: {
          topicId: 'fomo',
          sessionNumber: 2,
          questionOrder: i + 1,
          questionText: fomoSession2Questions[i],
          isActive: true,
        },
      });
    }
    console.log(`✅ Created ${fomoSession2Questions.length} questions for FOMO Session 2`);

    // Seed "Onion Aunty Society" topic
    const onionAuntyTopic = await prisma.cardGameTopic.upsert({
      where: { id: 'onion-aunty' },
      update: {
        title: 'Onion Aunty Society',
        description: 'Explore the cultural phenomenon of gossip, its impact on relationships, and how to navigate it responsibly in our communities.',
        gradient: 'linear-gradient(135deg, #f093fb, #f5576c, #feca57)',
        totalSessions: 2,
        isActive: true,
        displayOrder: 3,
      },
      create: {
        id: 'onion-aunty',
        title: 'Onion Aunty Society',
        description: 'Explore the cultural phenomenon of gossip, its impact on relationships, and how to navigate it responsibly in our communities.',
        gradient: 'linear-gradient(135deg, #f093fb, #f5576c, #feca57)',
        totalSessions: 2,
        isActive: true,
        displayOrder: 3,
      },
    });

    console.log('✅ Created topic:', onionAuntyTopic.title);

    // Seed Onion Aunty Session 1 Questions - Past
    const onionAuntySession1Questions = [
      'Share gossip from the past that left a lasting impression on you. How did it shape your perspective on gossip?',
      'Discuss a time when you were the topic of gossip. How did it make you feel?',
      'Describe a time when you intentionally avoided gossip. Did it contribute to a healthier social environment?',
      'Reflect on a gossip you regret participating in. How did it affect your relationships, and what did you learn from it?',
      'Share an instance where gossip had a positive impact. How can constructive gossip contribute to community bonding?',
      'Discuss gossip that taught you a valuable lesson. How did it shape your intentions in future interactions?',
      'Explore how gossip can influence perception. Share an experience where gossip shaped your views of a person or situation.',
      'Empathy is not commonly associated with gossip. Does empathy play a role in handling or reacting to gossip?',
      'Share a story where the dynamics of gossip shifted positively. How can intentional communication change gossip culture?',
      'Discuss the concept of responsible gossip. How can gossip be shared in a way that promotes understanding rather than harm?',
    ];

    // Seed Onion Aunty Session 2 Questions - Future
    const onionAuntySession2Questions = [
      'Envision a future without harmful gossip. How can communication shape a gossip-free society?',
      'Explore the role of gossip in community dynamics. How can gossip contribute to community building?',
      'Share strategies for managing gossip in the future. How can interventions mitigate the impact of harmful gossip?',
      'Discuss the challenges and opportunities of gossip in the digital age. How can we navigate online gossip?',
      'Share ideas on how the way gossip is told can transform narratives. How can storytelling reshape gossip dynamics?',
      'Explore the connection between gossip and mental health. What could support your mental well-being in the face of gossip?',
      'Discuss how cultural perspectives influence gossip. How can intentional cross-cultural communication address differences in gossip norms?',
      'Share experiences of gossip in the workplace. How can honest communication foster a positive work environment?',
      'Explore educational approaches to address gossip. How can education help individuals navigate gossip responsibly?',
      'Gossip has seeped into our culture due to the non confrontational nature, but what\'s said behind closed doors still holds toxic potential. How can we use our culture positively to build a gossip free society?',
    ];

    // Create Onion Aunty Session 1 questions
    console.log('📝 Creating Onion Aunty Session 1 questions...');
    for (let i = 0; i < onionAuntySession1Questions.length; i++) {
      await prisma.cardGameQuestion.upsert({
        where: {
          topicId_sessionNumber_questionOrder: {
            topicId: 'onion-aunty',
            sessionNumber: 1,
            questionOrder: i + 1,
          },
        },
        update: {
          questionText: onionAuntySession1Questions[i],
        },
        create: {
          topicId: 'onion-aunty',
          sessionNumber: 1,
          questionOrder: i + 1,
          questionText: onionAuntySession1Questions[i],
          isActive: true,
        },
      });
    }
    console.log(`✅ Created ${onionAuntySession1Questions.length} questions for Onion Aunty Session 1`);

    // Create Onion Aunty Session 2 questions
    console.log('📝 Creating Onion Aunty Session 2 questions...');
    for (let i = 0; i < onionAuntySession2Questions.length; i++) {
      await prisma.cardGameQuestion.upsert({
        where: {
          topicId_sessionNumber_questionOrder: {
            topicId: 'onion-aunty',
            sessionNumber: 2,
            questionOrder: i + 1,
          },
        },
        update: {
          questionText: onionAuntySession2Questions[i],
        },
        create: {
          topicId: 'onion-aunty',
          sessionNumber: 2,
          questionOrder: i + 1,
          questionText: onionAuntySession2Questions[i],
          isActive: true,
        },
      });
    }
    console.log(`✅ Created ${onionAuntySession2Questions.length} questions for Onion Aunty Session 2`);

    // Seed "Intentions" topic
    const intentionsTopic = await prisma.cardGameTopic.upsert({
      where: { id: 'intentions' },
      update: {
        title: 'Intentions',
        description: 'Navigate the dance between past and future, exploring how our intentions shape who we were and who we aspire to become.',
        gradient: 'linear-gradient(135deg, #fa709a, #fee140, #30cfd0)',
        totalSessions: 2,
        isActive: true,
        displayOrder: 4,
      },
      create: {
        id: 'intentions',
        title: 'Intentions',
        description: 'Navigate the dance between past and future, exploring how our intentions shape who we were and who we aspire to become.',
        gradient: 'linear-gradient(135deg, #fa709a, #fee140, #30cfd0)',
        totalSessions: 2,
        isActive: true,
        displayOrder: 4,
      },
    });

    console.log('✅ Created topic:', intentionsTopic.title);

    // Seed Intentions Session 1 Questions - Past
    const intentionsSession1Questions = [
      'Life is a journey, but throughout this journey you did not intentionally pave each and every step reaching the present moment. How does intention play a part?',
      'Narrate a challenge you overcame. How did this experience influence your intentions for future endeavors?',
      'Reflect on a choice you initially regretted. How did this experience shape your current approach to decision-making?',
      'Share an experience that drastically changed your perspective. How have your intentions evolved since embracing this new outlook?',
      'Describe a mistake that positively shaped your intentions. How do you apply these lessons moving forward?',
      'Discuss a pivotal self-discovery moment. How has it influenced your intentional actions since then?',
      'Reflect on a moment that instilled gratitude. How does expressing gratitude align with your intentional living?',
      'Can redemption be achieved without acknowledging mistakes? Share a story that emphasizes redemption through self-awareness?',
      'Share a moment that brings immense joy. How does sustaining happiness impact your intentional living?',
      'How have past relationships influenced your intentions for personal growth? Share an example that impacted your path.',
    ];

    // Seed Intentions Session 2 Questions - Future
    const intentionsSession2Questions = [
      'Successful people often are those that have a sense of purpose. How do your intentions contribute to your purpose of life?',
      'When you have a dream big or small, then when you realize your daily actions go against personal main intention. How do you handle that situation?',
      'We know that time is something we cannot control. How do you intentionally use your time in fulfilling your plan?',
      'Change often arrives uninvited. Every change, whether big or small, carries opportunities for personal growth? How do we prepare ourselves?',
      'Describe an intentional change for personal transformation. What motivates this intention for self-evolution?',
      'How do you envision continuous improvement in your future? Share intentional steps you\'re taking toward that vision.',
      'Every life will in some way impact the community around you. How do your intentions contribute to this vision of service for others?',
      'Share a goal focused on personal redemption. How do your intentions guide you in the pursuit of this redemptive path?',
      'Discuss your intentions for career growth. How are you intentionally positioning yourself for professional development?',
      'We cannot control the outcome, only the process. What is the fine line between actively adapting to changes and accepting it is enough?',
    ];

    // Create Intentions Session 1 questions
    console.log('📝 Creating Intentions Session 1 questions...');
    for (let i = 0; i < intentionsSession1Questions.length; i++) {
      await prisma.cardGameQuestion.upsert({
        where: {
          topicId_sessionNumber_questionOrder: {
            topicId: 'intentions',
            sessionNumber: 1,
            questionOrder: i + 1,
          },
        },
        update: {
          questionText: intentionsSession1Questions[i],
        },
        create: {
          topicId: 'intentions',
          sessionNumber: 1,
          questionOrder: i + 1,
          questionText: intentionsSession1Questions[i],
          isActive: true,
        },
      });
    }
    console.log(`✅ Created ${intentionsSession1Questions.length} questions for Intentions Session 1`);

    // Create Intentions Session 2 questions
    console.log('📝 Creating Intentions Session 2 questions...');
    for (let i = 0; i < intentionsSession2Questions.length; i++) {
      await prisma.cardGameQuestion.upsert({
        where: {
          topicId_sessionNumber_questionOrder: {
            topicId: 'intentions',
            sessionNumber: 2,
            questionOrder: i + 1,
          },
        },
        update: {
          questionText: intentionsSession2Questions[i],
        },
        create: {
          topicId: 'intentions',
          sessionNumber: 2,
          questionOrder: i + 1,
          questionText: intentionsSession2Questions[i],
          isActive: true,
        },
      });
    }
    console.log(`✅ Created ${intentionsSession2Questions.length} questions for Intentions Session 2`);

    // Seed "Unity in Diversity" topic
    const unityTopic = await prisma.cardGameTopic.upsert({
      where: { id: 'unity-diversity' },
      update: {
        title: 'Unity in Diversity',
        description: 'Explore how individuals and communities can come together across differences to foster harmony, peace, and progress.',
        gradient: 'linear-gradient(135deg, #4facfe, #00f2fe, #43e97b)',
        totalSessions: 2,
        isActive: true,
        displayOrder: 5,
      },
      create: {
        id: 'unity-diversity',
        title: 'Unity in Diversity',
        description: 'Explore how individuals and communities can come together across differences to foster harmony, peace, and progress.',
        gradient: 'linear-gradient(135deg, #4facfe, #00f2fe, #43e97b)',
        totalSessions: 2,
        isActive: true,
        displayOrder: 5,
      },
    });

    console.log('✅ Created topic:', unityTopic.title);

    // Seed Unity Session 1 Questions - Factors of Unity
    const unitySession1Questions = [
      'What does Unity mean to you on a personal level and does it align with your beliefs?',
      'How does Unity play a crucial role in fostering harmony, peace and progress?',
      'What are the challenges that organizations face in fostering Unity in a multiracial working environment?',
      'Do you agree that Unity can only be achieved if everyone shares identical beliefs and perspectives?',
      'What is the significance of unity and how does it relate to diversity within a multi-racial community?',
      'What role does leadership from different ethnic backgrounds play in fostering unity?',
      'Is "Unity" a one-time event and does not require ongoing commitment?',
      'Have you ever experienced Unity in your childhood?',
      'How can values like compassion, justice, and empathy guide us in celebrating cultural diversity?',
      'Can you describe a situation where practicing certain qualities helped resolve conflicts related to racial differences?',
      'How can principles such as brotherhood and sisterhood be applied to promote unity among diverse racial groups?',
      'How can we create hubs for promoting understanding and cooperation among different racial groups?',
      'How can leaders within the community exemplify qualities to encourage unity among diverse racial backgrounds?',
      'How does your personal reasoning (your own perspective) can be applied to address racial issues within the community?',
      'How do we unify our community through diversity, and what practical steps can individuals and organizations take to achieve this unity?',
    ];

    // Seed Unity Session 2 Questions - Education and Awareness
    const unitySession2Questions = [
      'How can education promote understanding and respect for different cultures and backgrounds universally?',
      'What\'s one initiative or project that has significantly influenced your perspective on unity and diversity?',
      'How can storytelling and the arts be used as tools to promote awareness and understanding among communities?',
      'Share an example of a grassroots awareness campaign that had a positive impact.',
      'How can schools and universities collaborate internationally to promote cultural awareness and unity?',
      'Do you think there are enough platforms for young people worldwide to voice their opinions on social and cultural issues?',
      'Share a personal experience of how education has broadened your understanding of global diversity.',
      'What can individuals do on a universal level to combat stereotypes and promote cultural sensitivity in their daily lives?',
      'How can international exchange programs and cultural immersion experiences foster unity and understanding?',
      'Share an idea for a creative project that could raise awareness about unity and diversity.',
      'What can an individual do to spread or implement values that spreads awareness to their own surrounding',
      'Do you think that unity is somehow affected by the actions of our family members towards others?',
      'Can you provide examples of community projects that actively promote unity by celebrating cultural diversity?',
      'What reference do we have to guide us in actively challenging stereotypes and prejudices related to racial diversity?',
      'What is the best way to self educate on the topic of Unity in Diversity?',
    ];

    // Create Unity Session 1 questions
    console.log('📝 Creating Unity in Diversity Session 1 questions...');
    for (let i = 0; i < unitySession1Questions.length; i++) {
      await prisma.cardGameQuestion.upsert({
        where: {
          topicId_sessionNumber_questionOrder: {
            topicId: 'unity-diversity',
            sessionNumber: 1,
            questionOrder: i + 1,
          },
        },
        update: {
          questionText: unitySession1Questions[i],
        },
        create: {
          topicId: 'unity-diversity',
          sessionNumber: 1,
          questionOrder: i + 1,
          questionText: unitySession1Questions[i],
          isActive: true,
        },
      });
    }
    console.log(`✅ Created ${unitySession1Questions.length} questions for Unity Session 1`);

    // Create Unity Session 2 questions
    console.log('📝 Creating Unity in Diversity Session 2 questions...');
    for (let i = 0; i < unitySession2Questions.length; i++) {
      await prisma.cardGameQuestion.upsert({
        where: {
          topicId_sessionNumber_questionOrder: {
            topicId: 'unity-diversity',
            sessionNumber: 2,
            questionOrder: i + 1,
          },
        },
        update: {
          questionText: unitySession2Questions[i],
        },
        create: {
          topicId: 'unity-diversity',
          sessionNumber: 2,
          questionOrder: i + 1,
          questionText: unitySession2Questions[i],
          isActive: true,
        },
      });
    }
    console.log(`✅ Created ${unitySession2Questions.length} questions for Unity Session 2`);

    // Summary
    const topicCounts = await Promise.all([
      prisma.cardGameQuestion.count({ where: { topicId: 'slowdown' } }),
      prisma.cardGameQuestion.count({ where: { topicId: 'fomo' } }),
      prisma.cardGameQuestion.count({ where: { topicId: 'onion-aunty' } }),
      prisma.cardGameQuestion.count({ where: { topicId: 'intentions' } }),
      prisma.cardGameQuestion.count({ where: { topicId: 'unity-diversity' } }),
    ]);

    const [slowdownCount, fomoCount, onionAuntyCount, intentionsCount, unityCount] = topicCounts;
    const totalQuestions = topicCounts.reduce((sum, count) => sum + count, 0);

    console.log('\n🎉 Card Game seed completed!');
    console.log(`   Topics: 5`);
    console.log(`   Total Questions: ${totalQuestions}`);
    console.log(`   - Slowdown: ${slowdownCount} questions`);
    console.log(`   - FOMO: ${fomoCount} questions`);
    console.log(`   - Onion Aunty Society: ${onionAuntyCount} questions`);
    console.log(`   - Intentions: ${intentionsCount} questions`);
    console.log(`   - Unity in Diversity: ${unityCount} questions`);
    console.log(`   Sessions per topic: 2\n`);

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
