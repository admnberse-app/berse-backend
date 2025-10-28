import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addTicketTiers() {
  try {
    console.log('Finding paid events without ticket tiers...');

    // Get all paid events (including past events for seeding)
    const paidEvents = await prisma.event.findMany({
      where: {
        isFree: false,
        status: 'PUBLISHED',
      },
      include: {
        tier: true,
      },
    });

    console.log(`Found ${paidEvents.length} paid events`);

    // Filter events without tiers
    const eventsWithoutTiers = paidEvents.filter(e => e.tier.length === 0);
    console.log(`${eventsWithoutTiers.length} events need ticket tiers`);

    for (const event of eventsWithoutTiers) {
      console.log(`\nAdding tiers to: ${event.title}`);

      // Create 2-3 tiers per event with varying prices
      const eventType = event.type;
      let tiers = [];

      if (eventType === 'SPORTS') {
        tiers = [
          {
            tierName: 'Regular Entry',
            description: 'Standard access to the sports event',
            price: 20.0,
            currency: 'MYR',
            totalQuantity: 50,
            soldQuantity: 0,
            displayOrder: 1,
          },
          {
            tierName: 'Premium Entry',
            description: 'Premium access with reserved seating',
            price: 40.0,
            currency: 'MYR',
            totalQuantity: 20,
            soldQuantity: 0,
            displayOrder: 2,
          },
        ];
      } else if (eventType === 'SOCIAL') {
        tiers = [
          {
            tierName: 'Early Bird',
            description: 'Early bird special pricing',
            price: 30.0,
            currency: 'MYR',
            totalQuantity: 30,
            soldQuantity: 0,
            displayOrder: 1,
          },
          {
            tierName: 'General Admission',
            description: 'Standard entry ticket',
            price: 50.0,
            currency: 'MYR',
            totalQuantity: 100,
            soldQuantity: 0,
            displayOrder: 2,
          },
          {
            tierName: 'VIP Pass',
            description: 'VIP access with exclusive perks',
            price: 120.0,
            currency: 'MYR',
            totalQuantity: 15,
            soldQuantity: 0,
            displayOrder: 3,
          },
        ];
      } else if (eventType === 'ILM' || eventType === 'CAFE_MEETUP') {
        tiers = [
          {
            tierName: 'Standard Ticket',
            description: 'Includes entry and materials',
            price: 25.0,
            currency: 'MYR',
            totalQuantity: 40,
            soldQuantity: 0,
            displayOrder: 1,
          },
          {
            tierName: 'Workshop Bundle',
            description: 'Entry plus take-home materials',
            price: 45.0,
            currency: 'MYR',
            totalQuantity: 20,
            soldQuantity: 0,
            displayOrder: 2,
          },
        ];
      } else if (eventType === 'TRIP' || eventType === 'LOCAL_TRIP') {
        tiers = [
          {
            tierName: 'Basic Package',
            description: 'Transportation and guide included',
            price: 80.0,
            currency: 'MYR',
            totalQuantity: 25,
            soldQuantity: 0,
            displayOrder: 1,
          },
          {
            tierName: 'All-Inclusive',
            description: 'Meals, transport, and activities included',
            price: 150.0,
            currency: 'MYR',
            totalQuantity: 15,
            soldQuantity: 0,
            displayOrder: 2,
          },
        ];
      } else {
        // Default tiers for other event types
        tiers = [
          {
            tierName: 'General Entry',
            description: 'Standard admission ticket',
            price: 35.0,
            currency: 'MYR',
            totalQuantity: 50,
            soldQuantity: 0,
            displayOrder: 1,
          },
          {
            tierName: 'Premium Entry',
            description: 'Enhanced experience with extra benefits',
            price: 70.0,
            currency: 'MYR',
            totalQuantity: 20,
            soldQuantity: 0,
            displayOrder: 2,
          },
        ];
      }

      // Create the tiers
      for (const tier of tiers) {
        await prisma.eventTicketTier.create({
          data: {
            eventId: event.id,
            ...tier,
          },
        });
        console.log(`  ✓ Created tier: ${tier.tierName} - ${tier.currency} ${tier.price}`);
      }
    }

    console.log('\n✅ Ticket tiers added successfully!');
  } catch (error) {
    console.error('❌ Error adding ticket tiers:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addTicketTiers();
