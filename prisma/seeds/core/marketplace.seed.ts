/**
 * MARKETPLACE SEED - Products & Services
 * 
 * Seeds marketplace with diverse listings:
 * - Electronics & Gadgets
 * - Fashion & Accessories
 * - Home & Living
 * - Books & Media
 * - Sports & Fitness
 * - Services (Professional, Creative, Wellness)
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });

import { PrismaClient, ListingStatus, ListingType, PriceStructureType, PaymentMethodType } from '@prisma/client';

const prisma = new PrismaClient();

const MARKETPLACE_LISTINGS = [
  // ===== ELECTRONICS & GADGETS =====
  {
    title: 'iPhone 14 Pro Max 256GB',
    description: 'Like new condition, barely used for 3 months. Comes with original box, charger, and accessories. No scratches, battery health 100%. Space Black color.',
    category: 'Electronics',
    type: ListingType.PRODUCT,
    price: 4500,
    currency: 'MYR',
    quantity: 1,
    location: 'Kuala Lumpur',
    images: ['marketplace/electronics/iphone-14-pro.jpg'],
    status: ListingStatus.ACTIVE,
  },
  {
    title: 'Sony WH-1000XM5 Noise Cancelling Headphones',
    description: 'Premium wireless headphones with industry-leading noise cancellation. Used for 2 months, excellent condition. Includes carrying case and all accessories.',
    category: 'Electronics',
    type: ListingType.PRODUCT,
    price: 950,
    currency: 'MYR',
    quantity: 1,
    location: 'Penang',
    images: ['marketplace/electronics/sony-headphones.jpg'],
    status: ListingStatus.ACTIVE,
  },
  {
    title: 'MacBook Air M2 16GB 512GB',
    description: '2023 model, Space Grey. Perfect condition, barely used. Original packaging and accessories included. Still under Apple warranty.',
    category: 'Electronics',
    type: ListingType.PRODUCT,
    price: 5200,
    currency: 'MYR',
    quantity: 1,
    location: 'Kuala Lumpur',
    images: ['marketplace/electronics/macbook-air-m2.jpg'],
    status: ListingStatus.ACTIVE,
  },
  {
    title: 'iPad Pro 12.9" 128GB with Apple Pencil',
    description: '2022 model with M2 chip. Includes Magic Keyboard and Apple Pencil 2nd gen. Screen protector applied, case included.',
    category: 'Electronics',
    type: ListingType.PRODUCT,
    price: 4200,
    currency: 'MYR',
    quantity: 1,
    location: 'Johor Bahru',
    images: ['marketplace/electronics/ipad-pro.jpg'],
    status: ListingStatus.ACTIVE,
  },

  // ===== FASHION & ACCESSORIES =====
  {
    title: 'Nike Air Max 270 - Limited Edition',
    description: 'Brand new, never worn. Size US 9 / UK 8 / EU 42.5. Limited edition colorway. Comes with original box and tags.',
    category: 'Fashion',
    type: ListingType.PRODUCT,
    price: 480,
    currency: 'MYR',
    quantity: 1,
    location: 'Kuala Lumpur',
    images: ['marketplace/fashion/nike-airmax.jpg'],
    status: ListingStatus.ACTIVE,
  },
  {
    title: 'Vintage Leather Messenger Bag',
    description: 'Genuine leather, handcrafted messenger bag. Perfect for professionals or students. Multiple compartments, laptop sleeve included.',
    category: 'Fashion',
    type: ListingType.PRODUCT,
    price: 280,
    currency: 'MYR',
    quantity: 2,
    location: 'Penang',
    images: ['marketplace/fashion/leather-bag.jpg'],
    status: ListingStatus.ACTIVE,
  },
  {
    title: 'Ray-Ban Aviator Sunglasses',
    description: 'Authentic Ray-Ban Classic Aviators. Gold frame with green lens. Comes with original case and cleaning cloth.',
    category: 'Fashion',
    type: ListingType.PRODUCT,
    price: 420,
    currency: 'MYR',
    quantity: 1,
    location: 'Kuala Lumpur',
    images: ['marketplace/fashion/rayban-aviator.jpg'],
    status: ListingStatus.ACTIVE,
  },

  // ===== HOME & LIVING =====
  {
    title: 'Dyson V11 Cordless Vacuum Cleaner',
    description: 'Powerful cordless vacuum with multiple attachments. Like new condition, used for 6 months. Excellent battery life, comes with all accessories.',
    category: 'Home & Living',
    type: ListingType.PRODUCT,
    price: 1650,
    currency: 'MYR',
    quantity: 1,
    location: 'Kuala Lumpur',
    images: ['marketplace/home/dyson-vacuum.jpg'],
    status: ListingStatus.ACTIVE,
  },
  {
    title: 'IKEA Standing Desk with Cable Management',
    description: 'Adjustable height standing desk (120cm x 70cm). White tabletop with black legs. Excellent condition, all hardware included.',
    category: 'Home & Living',
    type: ListingType.PRODUCT,
    price: 850,
    currency: 'MYR',
    quantity: 1,
    location: 'Petaling Jaya',
    images: ['marketplace/home/standing-desk.jpg'],
    status: ListingStatus.ACTIVE,
  },
  {
    title: 'Nespresso Coffee Machine with Milk Frother',
    description: 'Essenza Mini with Aeroccino milk frother. Perfect condition, descaled regularly. Includes 20 coffee capsules.',
    category: 'Home & Living',
    type: ListingType.PRODUCT,
    price: 580,
    currency: 'MYR',
    quantity: 1,
    location: 'Kuala Lumpur',
    images: ['marketplace/home/nespresso.jpg'],
    status: ListingStatus.ACTIVE,
  },

  // ===== BOOKS & MEDIA =====
  {
    title: 'Programming Books Bundle (5 Books)',
    description: 'Clean Code, Design Patterns, Refactoring, The Pragmatic Programmer, and Head First Design Patterns. All in excellent condition.',
    category: 'Books',
    type: ListingType.PRODUCT,
    price: 180,
    currency: 'MYR',
    quantity: 1,
    location: 'Kuala Lumpur',
    images: ['marketplace/books/programming-bundle.jpg'],
    status: ListingStatus.ACTIVE,
  },
  {
    title: 'Vinyl Record Collection - Classic Rock',
    description: 'Collection of 15 classic rock vinyl records including Pink Floyd, Led Zeppelin, The Beatles. All in excellent condition with original sleeves.',
    category: 'Books & Media',
    type: ListingType.PRODUCT,
    price: 680,
    currency: 'MYR',
    quantity: 1,
    location: 'Penang',
    images: ['marketplace/books/vinyl-collection.jpg'],
    status: ListingStatus.ACTIVE,
  },

  // ===== SPORTS & FITNESS =====
  {
    title: 'Adjustable Dumbbell Set (2.5kg - 24kg)',
    description: 'Space-saving adjustable dumbbells. Perfect for home workouts. Like new condition, barely used. Includes stand.',
    category: 'Sports & Fitness',
    type: ListingType.PRODUCT,
    price: 1280,
    currency: 'MYR',
    quantity: 1,
    location: 'Kuala Lumpur',
    images: ['marketplace/sports/adjustable-dumbbells.jpg'],
    status: ListingStatus.ACTIVE,
  },
  {
    title: 'Road Bike - Giant TCR Advanced',
    description: 'Carbon fiber road bike, Shimano 105 groupset. Size Medium (54cm). Well maintained, serviced regularly. Includes pedals and bottle cages.',
    category: 'Sports & Fitness',
    type: ListingType.PRODUCT,
    price: 3800,
    currency: 'MYR',
    quantity: 1,
    location: 'Petaling Jaya',
    images: ['marketplace/sports/road-bike.jpg'],
    status: ListingStatus.ACTIVE,
  },
  {
    title: 'Yoga Mat Premium with Carrying Strap',
    description: 'Extra thick (6mm) non-slip yoga mat. Eco-friendly material, easy to clean. Perfect for yoga, pilates, or home workouts.',
    category: 'Sports & Fitness',
    type: ListingType.PRODUCT,
    price: 95,
    currency: 'MYR',
    quantity: 3,
    location: 'Kuala Lumpur',
    images: ['marketplace/sports/yoga-mat.jpg'],
    status: ListingStatus.ACTIVE,
  },

  // ===== PROFESSIONAL SERVICES =====
  {
    title: 'Web Development - Custom Website Design',
    description: 'Full-stack web development services. React/Node.js expert. Portfolio includes e-commerce, corporate sites, and web apps. Free consultation included.',
    category: 'Professional Services',
    type: ListingType.SERVICE,
    location: 'Kuala Lumpur',
    images: ['marketplace/services/web-development.jpg'],
    status: ListingStatus.ACTIVE,
    priceStructure: PriceStructureType.PROJECT,
    price: 2500,
    currency: 'MYR',
  },
  {
    title: 'Professional Photography Services',
    description: 'Portrait, event, and product photography. 10+ years experience. Includes photo editing and retouching. Flexible packages available.',
    category: 'Professional Services',
    type: ListingType.SERVICE,
    location: 'Kuala Lumpur',
    images: ['marketplace/services/photography.jpg'],
    status: ListingStatus.ACTIVE,
    priceStructure: PriceStructureType.PER_HOUR,
    price: 250,
    currency: 'MYR',
  },
  {
    title: 'Graphic Design & Branding Services',
    description: 'Logo design, brand identity, marketing materials. Creative professional with 8+ years experience. Unlimited revisions until satisfied.',
    category: 'Professional Services',
    type: ListingType.SERVICE,
    location: 'Penang',
    images: ['marketplace/services/graphic-design.jpg'],
    status: ListingStatus.ACTIVE,
    priceStructure: PriceStructureType.PACKAGE,
    price: 500,
    currency: 'MYR',
  },
  {
    title: 'Digital Marketing Consultation',
    description: 'SEO, social media marketing, content strategy. Help grow your business online. Free initial assessment. Monthly retainer packages available.',
    category: 'Professional Services',
    type: ListingType.SERVICE,
    location: 'Kuala Lumpur',
    images: ['marketplace/services/digital-marketing.jpg'],
    status: ListingStatus.ACTIVE,
    priceStructure: PriceStructureType.PROJECT,
    price: 1200,
    currency: 'MYR',
  },

  // ===== CREATIVE SERVICES =====
  {
    title: 'Video Editing & Production',
    description: 'Professional video editing for YouTube, social media, corporate videos. Adobe Premiere Pro expert. Fast turnaround time.',
    category: 'Creative Services',
    type: ListingType.SERVICE,
    location: 'Kuala Lumpur',
    images: ['marketplace/services/video-editing.jpg'],
    status: ListingStatus.ACTIVE,
    priceStructure: PriceStructureType.PER_HOUR,
    price: 180,
    currency: 'MYR',
  },
  {
    title: 'Music Production & Audio Mixing',
    description: 'Professional music production, mixing, and mastering. Work with all genres. Home studio with professional equipment.',
    category: 'Creative Services',
    type: ListingType.SERVICE,
    location: 'Petaling Jaya',
    images: ['marketplace/services/music-production.jpg'],
    status: ListingStatus.ACTIVE,
    priceStructure: PriceStructureType.PROJECT,
    price: 800,
    currency: 'MYR',
  },
  {
    title: 'Content Writing & Copywriting',
    description: 'SEO-optimized blog posts, website copy, product descriptions. Native English speaker, experienced in various industries.',
    category: 'Creative Services',
    type: ListingType.SERVICE,
    location: 'Kuala Lumpur',
    images: ['marketplace/services/content-writing.jpg'],
    status: ListingStatus.ACTIVE,
    priceStructure: PriceStructureType.PER_HOUR,
    price: 120,
    currency: 'MYR',
  },

  // ===== WELLNESS SERVICES =====
  {
    title: 'Personal Training - Fitness & Nutrition',
    description: 'Certified personal trainer with 5+ years experience. Customized workout plans and nutrition guidance. Online and in-person sessions available.',
    category: 'Wellness',
    type: ListingType.SERVICE,
    location: 'Kuala Lumpur',
    images: ['marketplace/services/personal-training.jpg'],
    status: ListingStatus.ACTIVE,
    priceStructure: PriceStructureType.PER_SESSION,
    price: 150,
    currency: 'MYR',
  },
  {
    title: 'Yoga Classes - Private or Group',
    description: 'RYT-200 certified yoga instructor. Hatha, Vinyasa, Yin styles. Suitable for all levels. Home visits or studio sessions.',
    category: 'Wellness',
    type: ListingType.SERVICE,
    location: 'Petaling Jaya',
    images: ['marketplace/services/yoga-classes.jpg'],
    status: ListingStatus.ACTIVE,
    priceStructure: PriceStructureType.PER_SESSION,
    price: 100,
    currency: 'MYR',
  },
  {
    title: 'Massage Therapy - Swedish & Deep Tissue',
    description: 'Licensed massage therapist. Swedish, deep tissue, sports massage. Mobile service available. Relaxation and pain relief.',
    category: 'Wellness',
    type: ListingType.SERVICE,
    location: 'Kuala Lumpur',
    images: ['marketplace/services/massage-therapy.jpg'],
    status: ListingStatus.ACTIVE,
    priceStructure: PriceStructureType.PER_SESSION,
    price: 180,
    currency: 'MYR',
  },

  // ===== EDUCATION & TUTORING =====
  {
    title: 'English Tutoring - IELTS/TOEFL Preparation',
    description: 'Native English speaker, TEFL certified. Specialized in IELTS and TOEFL test preparation. Online lessons with flexible schedule.',
    category: 'Education',
    type: ListingType.SERVICE,
    location: 'Kuala Lumpur',
    images: ['marketplace/services/english-tutoring.jpg'],
    status: ListingStatus.ACTIVE,
    priceStructure: PriceStructureType.PER_SESSION,
    price: 120,
    currency: 'MYR',
  },
  {
    title: 'Programming & Coding Lessons',
    description: 'Learn Python, JavaScript, React, or Node.js. Beginner to advanced levels. Project-based learning with real-world examples.',
    category: 'Education',
    type: ListingType.SERVICE,
    location: 'Kuala Lumpur',
    images: ['marketplace/services/coding-lessons.jpg'],
    status: ListingStatus.ACTIVE,
    priceStructure: PriceStructureType.PER_SESSION,
    price: 150,
    currency: 'MYR',
  },
  {
    title: 'Math & Science Tutoring (SPM/IGCSE)',
    description: 'Experienced tutor for secondary school students. SPM, IGCSE, O-Level. Math, Physics, Chemistry. Home or online lessons.',
    category: 'Education',
    type: ListingType.SERVICE,
    location: 'Petaling Jaya',
    images: ['marketplace/services/math-tutoring.jpg'],
    status: ListingStatus.ACTIVE,
    priceStructure: PriceStructureType.PER_SESSION,
    price: 80,
    currency: 'MYR',
  },
];

async function main() {
  console.log('🏪 Seeding marketplace listings...\n');

  // Get test users to assign as sellers
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: [
          'alice@test.com',
          'bob@test.com',
          'sarah.host@berseapp.com',
          'david.tech@berseapp.com',
        ],
      },
    },
    select: { id: true, email: true },
  });

  if (users.length === 0) {
    console.error('❌ No test users found. Please run users seed first.');
    return;
  }

  let createdCount = 0;
  let skippedCount = 0;

  for (const listingData of MARKETPLACE_LISTINGS) {
    try {
      // Randomly assign to a user
      const seller = users[Math.floor(Math.random() * users.length)];

      // Check if listing already exists
      const existing = await prisma.marketplaceListing.findFirst({
        where: {
          title: listingData.title,
          userId: seller.id,
        },
      });

      if (existing) {
        console.log(`⏭️  Skipping: ${listingData.title} (already exists)`);
        skippedCount++;
        continue;
      }

      // Extract pricing info for separate pricing option
      const { priceStructure, price, currency, ...listingFields } = listingData as any;

      const listing = await prisma.marketplaceListing.create({
        data: {
          ...listingFields,
          userId: seller.id,
          pricingOptions: {
            create: {
              pricingType: 'MONEY',
              price: price,
              currency: currency || 'MYR',
              priceStructure: priceStructure || 'FIXED',
              isDefault: true,
            },
          },
        },
      });

      console.log(`✅ Created: ${listing.title}`);
      createdCount++;
    } catch (error) {
      console.error(`❌ Failed to create: ${listingData.title}`, error);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Created: ${createdCount} listings`);
  console.log(`   ⏭️  Skipped: ${skippedCount} listings (already exist)`);
  console.log(`   📦 Total: ${MARKETPLACE_LISTINGS.length} listings\n`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
