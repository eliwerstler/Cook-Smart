import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

interface User {
  username: string;
  email: string;
  password: string;
}

const testUsers: User[] = [
  {
    username: 'sarah_drinks',
    email: 'sarah@test.com',
    password: 'password123',
  },
  {
    username: 'mike_party',
    email: 'mike@test.com',
    password: 'password123',
  },
  {
    username: 'jen_cocktails',
    email: 'jen@test.com',
    password: 'password123',
  },
  {
    username: 'alex_beers',
    email: 'alex@test.com',
    password: 'password123',
  },
  {
    username: 'chris_wine',
    email: 'chris@test.com',
    password: 'password123',
  },
];

async function createTestUsers() {
  console.log('🚀 Creating test users...\n');

  for (const user of testUsers) {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, user);
      console.log(`✅ Created user: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   ID: ${response.data.user.id}\n`);
    } catch (error: any) {
      if (error.response?.data?.error?.includes('already exists')) {
        console.log(`⚠️  User ${user.username} already exists, skipping...\n`);
      } else {
        console.error(`❌ Error creating ${user.username}:`, error.response?.data || error.message);
      }
    }
  }

  console.log('✨ Done! You can now log in with any of these accounts:');
  console.log('\nTest Credentials:');
  testUsers.forEach(user => {
    console.log(`- Username: ${user.username} / Email: ${user.email} / Password: ${user.password}`);
  });
}

createTestUsers().catch(console.error);
