// Script to generate VAPID keys for push notifications
const webpush = require('web-push');

console.log('🔑 Generating VAPID keys for push notifications...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ VAPID keys generated successfully!\n');
console.log('Add these to your .env file:\n');
console.log(`VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"`);
console.log(`VAPID_PRIVATE_KEY="${vapidKeys.privateKey}"`);
console.log('VAPID_EMAIL="mailto:admin@bersemuka.com"');

console.log('\n📝 Railway Environment Variables:');
console.log('Add these in Railway Dashboard → Variables:\n');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log('VAPID_EMAIL=mailto:admin@bersemuka.com');

console.log('\n⚠️  Important:');
console.log('- Keep the private key secure and never expose it publicly');
console.log('- The public key will be used in your frontend code');
console.log('- These keys should be the same across all environments');

console.log('\n🚀 Next steps:');
console.log('1. Add these variables to your .env file');
console.log('2. Add them to Railway Dashboard');
console.log('3. Update frontend service to use the public key');
console.log('4. Run database migration: npm run prisma:migrate:prod');