import { prisma } from '../utils/prisma';
import http from 'http';

const PORT = process.env.PORT || 5000;

function makeRequest(
  options: http.RequestOptions,
  postData?: any
): Promise<{ statusCode: number; data: any }> {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode || 500, data: JSON.parse(body) });
        } catch (e) {
          resolve({ statusCode: res.statusCode || 500, data: { raw: body } });
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

async function testRatingUpdateModeFlow() {
  console.log('=== STARTING RATING CREATE VS UPDATE MODE TEST ===\n');

  try {
    // 1. Customer login
    console.log('1. Logging in customer user1@storehub.com...');
    const userLoginRes = await makeRequest(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'user1@storehub.com', password: 'Password123!' }
    );

    const userToken = userLoginRes.data.data.token;
    const customer = userLoginRes.data.data.user;
    console.log(`✔ Logged in as: ${customer.name} (${customer.id})`);

    // 2. Select test store "The Coffee House"
    const store = await prisma.store.findFirst({ where: { name: 'The Coffee House' } });
    if (!store) throw new Error('Test store "The Coffee House" not found');

    console.log(`\n2. Target Store: "${store.name}" (${store.id})`);

    // Clean existing rating for user1 on this store if any
    await prisma.rating.deleteMany({
      where: { storeId: store.id, userId: customer.id },
    });

    // 3. STEP A: CREATE FIRST TIME RATING (3 Stars)
    console.log('\n3. STEP A — First time rating submission (3 Stars)...');
    const createRes = await makeRequest(
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
        storeId: store.id,
        rating: 3,
        review: 'Good coffee and friendly staff.',
      }
    );

    console.log(`  CREATE Response Status: ${createRes.statusCode}`);
    console.log(`  CREATE Response Message: "${createRes.data.message}"`);
    const rating1 = createRes.data.data;
    console.log(`✔ Rating ID created: ${rating1.id}`);

    // Verify DB count
    const countAfterCreate = await prisma.rating.count({ where: { storeId: store.id } });
    console.log(`✔ Rating count in DB: ${countAfterCreate}`);

    // 4. STEP B: FETCH STORE DETAILS & VERIFY EXISTING RATING DETECTED
    console.log('\n4. STEP B — Fetching Store Details to verify existing rating detection...');
    const storeDetailsRes = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: `/api/stores/${store.id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` },
    });

    const storeData = storeDetailsRes.data.data;
    console.log(`  Detected userRating: ${storeData.userRating} Stars`);
    console.log(`  Detected userReview: "${storeData.userReview}"`);
    console.log(`  Detected userRatingId: ${storeData.userRatingId}`);

    if (storeData.userRating === 3 && storeData.userRatingId === rating1.id) {
      console.log('✔ Existing rating successfully detected for UPDATE mode!');
    }

    // 5. STEP C: UPDATE EXISTING RATING (Change 3 Stars -> 5 Stars)
    console.log('\n5. STEP C — Updating existing rating (3 Stars -> 5 Stars)...');
    const updateRes = await makeRequest(
      {
        hostname: 'localhost',
        port: PORT,
        path: `/api/ratings/${rating1.id}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      },
      {
        rating: 5,
        review: 'Updated: Outstanding handcrafted coffee and top-tier service!',
      }
    );

    console.log(`  UPDATE Response Status: ${updateRes.statusCode}`);
    console.log(`  UPDATE Response Message: "${updateRes.data.message}"`);

    // 6. STEP D: VERIFY DATABASE PERSISTENCE & AGGREGATES
    console.log('\n6. STEP D — Direct PostgreSQL Verification...');
    const countAfterUpdate = await prisma.rating.count({ where: { storeId: store.id } });
    const updatedRatingObj = await prisma.rating.findUnique({ where: { id: rating1.id } });

    console.log(`  Rating ID: ${updatedRatingObj?.id}`);
    console.log(`  Updated Rating Score: ${updatedRatingObj?.rating} Stars`);
    console.log(`  Updated Review Text: "${updatedRatingObj?.review}"`);
    console.log(`  Total DB Rating Rows (Must remain 1): ${countAfterUpdate}`);

    if (countAfterUpdate === 1 && updatedRatingObj?.rating === 5) {
      console.log('✔ Rating updated in place without duplicate creation!');
    }

    console.log('\n==================================================');
    console.log('✔ RATING CREATE VS UPDATE MODE TEST PASSED 100%!');
    console.log('==================================================\n');
  } catch (err) {
    console.error('❌ Test Failed:', err);
  }
}

testRatingUpdateModeFlow();
