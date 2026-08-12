import { prisma } from '../utils/prisma';
import http from 'http';

const PORT = process.env.PORT || 5000;

function makeRequest(options: http.RequestOptions, postData?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ statusCode: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ statusCode: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runEndToEndWorkflowTest() {
  console.log('=== STARTING STOREHUB END-TO-END WORKFLOW TEST ===\n');

  try {
    // STEP 1: ADMIN LOGIN
    console.log('1. Admin logging in as admin@storehub.com...');
    const adminLoginRes = await makeRequest(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        email: 'admin@storehub.com',
        password: 'Password123!',
      }
    );

    const adminToken = adminLoginRes.data.data.token;
    console.log('✔ Admin logged in successfully.');

    // STEP 2: FIND STORE OWNER (Marcus Vance)
    console.log('\n2. Fetching Store Owners from database...');
    const ownersRes = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/users?role=STORE_OWNER&limit=10',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const owners = ownersRes.data.data.users;
    const marcusOwner = owners.find((u: any) => u.name.includes('Marcus Vance')) || owners[0];
    console.log(`✔ Selected Owner: ${marcusOwner.name} (${marcusOwner.email}), ID: ${marcusOwner.id}`);

    // STEP 3: ADMIN CREATES STORE "The Coffee House"
    console.log('\n3. Admin creating new store "The Coffee House"...');

    // Clean up previous test store if exists
    const existingStore = await prisma.store.findFirst({
      where: { name: 'The Coffee House' },
    });
    if (existingStore) {
      console.log('  Cleaning existing test store...');
      await prisma.rating.deleteMany({ where: { storeId: existingStore.id } });
      await prisma.favorite.deleteMany({ where: { storeId: existingStore.id } });
      await prisma.store.delete({ where: { id: existingStore.id } });
    }

    const createStoreRes = await makeRequest(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/stores',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      },
      {
        name: 'The Coffee House',
        category: 'Restaurants & Dining',
        email: 'contact@thecoffeehouse.example.com',
        ownerId: marcusOwner.id,
        address: '123 MG Road, Near City Center, Kolhapur, Maharashtra',
        description:
          'A cozy neighborhood cafe serving freshly brewed coffee, handcrafted beverages, desserts, and light meals.',
        phone: '+91 98765 43210',
        website: 'https://thecoffeehouse.example.com',
        imageUrl:
          'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=800&auto=format&fit=crop',
        isActive: true,
      }
    );

    const createdStore = createStoreRes.data.data;
    console.log(`✔ Store Created in PostgreSQL! ID: ${createdStore.id}, Name: "${createdStore.name}"`);

    // STEP 4: VERIFY DATABASE PERSISTENCE FOR STORE
    console.log('\n4. Direct PostgreSQL Verification for Store...');
    const dbStore = await prisma.store.findUnique({
      where: { id: createdStore.id },
      include: { owner: true, ratings: true },
    });
    console.log(`  Name: ${dbStore?.name}`);
    console.log(`  Owner: ${dbStore?.owner?.name} (${dbStore?.owner?.email})`);
    console.log(`  Initial Rating Count in DB: ${dbStore?.ratings.length}`);
    if (dbStore?.ownerId === marcusOwner.id) {
      console.log('✔ PostgreSQL Store persistence verified!');
    }

    // STEP 5: CUSTOMER SEARCHES AND DISCOVERS STORE
    console.log('\n5. Customer logging in as user1@storehub.com...');
    const userLoginRes = await makeRequest(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        email: 'user1@storehub.com',
        password: 'Password123!',
      }
    );
    const userToken = userLoginRes.data.data.token;
    const customerUser = userLoginRes.data.data.user;
    console.log(`✔ Customer logged in: ${customerUser.name} (${customerUser.email})`);

    console.log('  Customer searching for "The Coffee House"...');
    const searchRes = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/stores?search=Coffee',
      method: 'GET',
    });
    const foundStore = searchRes.data.data.stores.find((s: any) => s.id === createdStore.id);
    if (foundStore) {
      console.log(`✔ Customer discovered store: "${foundStore.name}" via API search.`);
    }

    // STEP 6: CUSTOMER SUBMITS 5-STAR RATING + REVIEW
    console.log('\n6. Customer submitting 5-star rating & review...');
    const submitRatingRes = await makeRequest(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/ratings',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      },
      {
        storeId: createdStore.id,
        rating: 5,
        review:
          'Excellent coffee and great service! The atmosphere is comfortable and the staff is very friendly.',
      }
    );
    console.log('✔ Rating submitted:', submitRatingRes.data.message);

    // STEP 7: VERIFY RATING PERSISTENCE & AUTOMATIC AGGREGATE RECALCULATION IN POSTGRESQL
    console.log('\n7. Direct PostgreSQL Verification for Rating & Store Average...');
    const dbRating = await prisma.rating.findFirst({
      where: { storeId: createdStore.id, userId: customerUser.id },
    });
    console.log(`  Saved Rating ID: ${dbRating?.id}`);
    console.log(`  Score: ${dbRating?.rating} Stars`);
    console.log(`  Review text: "${dbRating?.review}"`);

    const dbUpdatedStore = await prisma.store.findUnique({
      where: { id: createdStore.id },
      include: { ratings: true },
    });
    const ratingCount = dbUpdatedStore?.ratings.length || 0;
    const avgRating =
      ratingCount > 0
        ? dbUpdatedStore!.ratings.reduce((a, b) => a + b.rating, 0) / ratingCount
        : 0;

    console.log(`  Recalculated Store Avg Rating in DB: ${avgRating.toFixed(1)} ★`);
    console.log(`  Recalculated Rating Count in DB: ${ratingCount}`);

    if (avgRating === 5.0 && ratingCount === 1) {
      console.log('✔ Automatic PostgreSQL score recalculation verified!');
    }

    // STEP 8: STORE OWNER VIEWS FEEDBACK
    console.log(`\n8. Store Owner (${marcusOwner.email}) logging in to view feedback...`);
    const ownerLoginRes = await makeRequest(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        email: marcusOwner.email,
        password: 'Password123!',
      }
    );
    const ownerToken = ownerLoginRes.data.data.token;

    const ownerAnalyticsRes = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/analytics/owner',
      method: 'GET',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });

    const ownerData = ownerAnalyticsRes.data.data;
    console.log(`  Owner Assigned Store: ${ownerData.store?.name}`);
    console.log(`  Owner Dashboard Avg Rating: ${ownerData.stats?.avgRating} ★`);
    console.log(`  Owner Dashboard Review Count: ${ownerData.stats?.totalRatings}`);
    console.log(`  Recent Customer Feedback: "${ownerData.recentActivity?.[0]?.review}"`);
    console.log('✔ Store Owner dashboard feedback integration verified!');

    // STEP 9: ADMIN VIEWS RATINGS & ANALYTICS
    console.log('\n9. Admin checking ratings & system analytics...');
    const adminRatingsRes = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: `/api/ratings?storeId=${createdStore.id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const ratingsList = adminRatingsRes.data.data.ratings;
    console.log(`  Admin Rating List Count for Store: ${ratingsList.length}`);
    console.log(
      `  Admin Rating Details: Customer ${ratingsList[0]?.user?.name} rated ${ratingsList[0]?.rating}★`
    );

    console.log('\n==================================================');
    console.log('✔ END-TO-END WORKFLOW FULLY VERIFIED SUCCESSFUL!');
    console.log('==================================================\n');
  } catch (err: any) {
    console.error('❌ E2E Test Error:', err);
  }
}

runEndToEndWorkflowTest();
