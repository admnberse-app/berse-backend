/**
 * Migration Script: Fix HTML-Encoded Image Keys
 * 
 * This script decodes HTML entities in image keys that were incorrectly
 * encoded by the XSS protection middleware.
 * 
 * Affected entities:
 * - Marketplace listings (images array)
 * - User profiles (avatar, profilePicture)
 * - Events (coverImage)
 * - Any other entities with storage keys
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Decode HTML entities in a string
function decodeHTMLEntities(text: string): string {
  const entities: { [key: string]: string } = {
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#x2F;': '/',
    '&amp;': '&',
  };

  let decoded = text;
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.replace(new RegExp(entity, 'g'), char);
  }
  return decoded;
}

async function fixMarketplaceListingImages() {
  console.log('\n🔍 Checking marketplace listings...');
  
  const listings = await prisma.marketplaceListing.findMany({
    where: {
      images: {
        isEmpty: false,
      },
    },
    select: {
      id: true,
      images: true,
    },
  });

  console.log(`Found ${listings.length} listings with images`);

  let fixedCount = 0;
  for (const listing of listings) {
    const hasEncodedKeys = listing.images.some((img) => 
      img.includes('&#x2F;') || img.includes('&lt;') || img.includes('&gt;')
    );

    if (hasEncodedKeys) {
      const decodedImages = listing.images.map(decodeHTMLEntities);
      
      await prisma.marketplaceListing.update({
        where: { id: listing.id },
        data: { images: decodedImages },
      });

      console.log(`✅ Fixed listing ${listing.id}`);
      console.log(`   Before: ${listing.images[0]}`);
      console.log(`   After:  ${decodedImages[0]}`);
      fixedCount++;
    }
  }

  console.log(`✅ Fixed ${fixedCount} marketplace listings\n`);
}

async function fixUserProfilePictures() {
  console.log('🔍 Checking user profile pictures...');
  
  const profiles = await prisma.userProfile.findMany({
    where: {
      profilePicture: { contains: '&#x2F;' },
    },
    select: {
      userId: true,
      profilePicture: true,
    },
  });

  console.log(`Found ${profiles.length} user profiles with encoded pictures`);

  for (const profile of profiles) {
    if (profile.profilePicture) {
      await prisma.userProfile.update({
        where: { userId: profile.userId },
        data: { profilePicture: decodeHTMLEntities(profile.profilePicture) },
      });

      console.log(`✅ Fixed user profile ${profile.userId}`);
      console.log(`   Before: ${profile.profilePicture}`);
      console.log(`   After:  ${decodeHTMLEntities(profile.profilePicture)}`);
    }
  }

  console.log(`✅ Fixed ${profiles.length} user profile pictures\n`);
}

async function fixEventImages() {
  console.log('🔍 Checking event images...');
  
  const events = await prisma.event.findMany({
    where: {
      images: {
        isEmpty: false,
      },
    },
    select: {
      id: true,
      images: true,
    },
  });

  console.log(`Found ${events.length} events with images`);

  let fixedCount = 0;
  for (const event of events) {
    const hasEncodedKeys = event.images.some((img) => 
      img.includes('&#x2F;') || img.includes('&lt;') || img.includes('&gt;')
    );

    if (hasEncodedKeys) {
      const decodedImages = event.images.map(decodeHTMLEntities);
      
      await prisma.event.update({
        where: { id: event.id },
        data: { images: decodedImages },
      });

      console.log(`✅ Fixed event ${event.id}`);
      fixedCount++;
    }
  }

  console.log(`✅ Fixed ${fixedCount} event images\n`);
}

async function fixCommunityImages() {
  console.log('🔍 Checking community images...');
  
  const communities = await prisma.community.findMany({
    where: {
      imageUrl: { contains: '&#x2F;' },
    },
    select: {
      id: true,
      imageUrl: true,
    },
  });

  console.log(`Found ${communities.length} communities with encoded images`);

  for (const community of communities) {
    if (community.imageUrl?.includes('&#x2F;')) {
      await prisma.community.update({
        where: { id: community.id },
        data: { imageUrl: decodeHTMLEntities(community.imageUrl) },
      });

      console.log(`✅ Fixed community ${community.id}`);
    }
  }

  console.log(`✅ Fixed ${communities.length} community images\n`);
}

async function main() {
  console.log('🚀 Starting image key migration...\n');
  
  try {
    await fixMarketplaceListingImages();
    await fixUserProfilePictures();
    await fixEventImages();
    await fixCommunityImages();
    
    console.log('✅ Migration complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();