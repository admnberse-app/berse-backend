import axios from 'axios';

const API_URL = 'https://prod-backend-production-3b58.up.railway.app';
const email = 'zaydmahdalywork@gmail.com';

async function testCreateCommunity() {
  try {
    // Login first
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${API_URL}/v2/auth/login`, {
      email,
      password: 'super12345'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Logged in successfully\n');
    
    // Try to create community
    console.log('🏗️  Creating community...');
    const communityData = {
      name: "Ahl \u2019Umran Network",
      description: "Building People Through Friendships: Connecting youth through meaningful friendships and shared experiences. We grow together through monthly BerseMukha sessions, weekly sports under Sukan Squad, social gatherings, travels, workshops, and community projects, creating a supportive circle that helps everyone thrive.",
      interests: ["community", "networking", "social_impact", "mentoring", "volunteering", "entrepreneurship", "road_trips", "backpacking", "adventure"],
      category: "other",
      city: "Kuala Lumpur",
      country: "Malaysia",
      latitude: 3.1412,
      longitude: 101.68653,
      requiresApproval: true,
      guidelines: "As a community that welcomes people from all walks of life, we want to keep our spaces warm, respectful, and comfortable for everyone. Let's all do our part by being mindful to:\n\n1. Physical contact between men and women who are not mahram (legally related),\n\n2. Actions or behaviour, towards any gender, that may cause discomfort, unease, mental distress, physical harm, tarnishing a person's reputation and/or damage to property,\n\n3. Engaging in or initiating conversations with sexually suggestive, inappropriate, or disrespectful language, tone, behavior or intention,\n\nEspecially during Ahl 'Umran activities or when wearing our merch.\n\nIf you ever experience or notice something that feels off, please don't hesitate to reach out through our confidential report form so we can handle it according to SOP\n🔗 https://forms.gle/BdsMDGmyc5wvF2nWA\n\nTogether, let's continue to nurture a community built on compassion, sincerity, and friendship, where everyone feels safe.",
      socialLinks: {
        instagram: "https://www.instagram.com/ahl.umran.network/",
        linkedin: "https://www.linkedin.com/company/ahl-umran-network/?viewAsMember=true"
      },
      contactEmail: "ahl.umran.network@gmail.com"
    };
    
    const response = await axios.post(
      `${API_URL}/v2/communities`,
      communityData,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    console.log('✅ Community created successfully!');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error: any) {
    console.error('❌ Error creating community:');
    console.error('Status:', error.response?.status);
    console.error('Error data:', JSON.stringify(error.response?.data, null, 2));
  }
}

testCreateCommunity();
