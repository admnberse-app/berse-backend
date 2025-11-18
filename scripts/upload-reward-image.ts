/**
 * Upload Reward Image to Digital Ocean Spaces
 * 
 * Usage:
 *   npm run upload:reward-image
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';
import { config } from '../src/config';

const s3Client = new S3Client({
  endpoint: config.spaces.endpoint,
  region: config.spaces.region,
  credentials: {
    accessKeyId: config.spaces.accessKeyId,
    secretAccessKey: config.spaces.secretAccessKey,
  },
});

async function uploadRewardImage() {
  const localImagePath = path.join(__dirname, '../rewardmukha.jpeg');
  
  console.log('🚀 Starting reward image upload...\n');
  console.log(`📂 Reading image from: ${localImagePath}`);
  
  // Check if file exists
  if (!fs.existsSync(localImagePath)) {
    console.error(`❌ Error: File not found at ${localImagePath}`);
    process.exit(1);
  }
  
  const fileBuffer = fs.readFileSync(localImagePath);
  const fileSize = (fileBuffer.length / 1024).toFixed(2);
  console.log(`📊 File size: ${fileSize} KB`);
  
  const uploadTasks = [
    {
      key: 'rewards/mukha-cafe-voucher.jpeg',
      description: 'Mukha Cafe voucher/poster image',
    },
    {
      key: 'rewards/mukha-cafe-poster.jpeg',
      description: 'Mukha Cafe poster (voucherImageUrl)',
    },
    {
      key: 'rewards/lunchbear-voucher.jpeg',
      description: 'Lunchbear TTDI voucher',
    },
  ];
  
  console.log(`\n📤 Uploading to ${uploadTasks.length} locations...\n`);
  
  for (const task of uploadTasks) {
    try {
      const command = new PutObjectCommand({
        Bucket: config.spaces.bucket,
        Key: task.key,
        Body: fileBuffer,
        ACL: 'public-read',
        ContentType: 'image/jpeg',
        CacheControl: 'public, max-age=31536000',
      });
      
      await s3Client.send(command);
      
      const cdnUrl = config.spaces.cdnEndpoint
        ? `${config.spaces.cdnEndpoint}/${task.key}`
        : `https://${config.spaces.bucket}.${config.spaces.region}.digitaloceanspaces.com/${task.key}`;
      
      console.log(`✅ ${task.description}`);
      console.log(`   URL: ${cdnUrl}\n`);
    } catch (error) {
      console.error(`❌ Failed to upload ${task.key}:`, error);
    }
  }
  
  console.log('='.repeat(70));
  console.log('✨ Upload complete!\n');
  console.log('📋 Image URLs to use in rewards:');
  console.log('='.repeat(70));
  
  const baseUrl = config.spaces.cdnEndpoint || `https://${config.spaces.bucket}.${config.spaces.region}.digitaloceanspaces.com`;
  
  uploadTasks.forEach(task => {
    console.log(`${task.description}:`);
    console.log(`  ${baseUrl}/${task.key}\n`);
  });
  
  console.log('🎯 Next step: Run the rewards seed script');
  console.log('   npm run seed:rewards:prod\n');
}

async function main() {
  try {
    await uploadRewardImage();
  } catch (error) {
    console.error('❌ Upload failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { uploadRewardImage };
