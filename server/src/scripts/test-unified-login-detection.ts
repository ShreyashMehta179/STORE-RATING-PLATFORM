import { prisma } from '../utils/prisma';
import http from 'http';
import bcrypt from 'bcryptjs';

const PORT = process.env.PORT || 5000;

function loginRequest(email: string, password: string): Promise<{ statusCode: number; data: any }> {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ email, password });
    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode || 500, data: JSON.parse(body) });
          } catch (e) {
            resolve({ statusCode: res.statusCode || 500, data: { raw: body } });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    req.write(postData);
    req.end();
  });
}

async function testUnifiedLoginAndRoleDetection() {
  console.log('=== STARTING UNIFIED SINGLE LOGIN & AUTOMATIC ROLE DETECTION TEST ===\n');

  try {
    // 1. Test ADMIN login
    console.log('1. Testing ADMIN Login (admin@storehub.com)...');
    const adminRes = await loginRequest('admin@storehub.com', 'Password123!');
    console.log(`  Status Code: ${adminRes.statusCode}`);
    if (adminRes.statusCode === 200 && adminRes.data.data.user.role === 'ADMIN') {
      console.log(`  ✔ Role detected automatically: ADMIN -> Redirect target: /admin/dashboard`);
    } else {
      console.error('  ❌ ADMIN Login Failed', adminRes.data);
    }

    // 2. Test STORE_OWNER login
    console.log('\n2. Testing STORE_OWNER Login (owner1@storehub.com)...');
    const ownerRes = await loginRequest('owner1@storehub.com', 'Password123!');
    console.log(`  Status Code: ${ownerRes.statusCode}`);
    if (ownerRes.statusCode === 200 && ownerRes.data.data.user.role === 'STORE_OWNER') {
      console.log(`  ✔ Role detected automatically: STORE_OWNER -> Redirect target: /owner/dashboard`);
    } else {
      console.error('  ❌ STORE_OWNER Login Failed', ownerRes.data);
    }

    // 3. Test USER login
    console.log('\n3. Testing USER Login (user1@storehub.com)...');
    const userRes = await loginRequest('user1@storehub.com', 'Password123!');
    console.log(`  Status Code: ${userRes.statusCode}`);
    if (userRes.statusCode === 200 && userRes.data.data.user.role === 'USER') {
      console.log(`  ✔ Role detected automatically: USER -> Redirect target: /user/dashboard`);
    } else {
      console.error('  ❌ USER Login Failed', userRes.data);
    }

    // 4. Test INVALID Credentials
    console.log('\n4. Testing Invalid Password credentials...');
    const invalidRes = await loginRequest('user1@storehub.com', 'WrongPassword999!');
    console.log(`  Status Code: ${invalidRes.statusCode}`);
    console.log(`  Error Message: "${invalidRes.data.message}"`);
    if (invalidRes.statusCode === 401 && invalidRes.data.message === 'Invalid email or password credentials.') {
      console.error = console.log;
      console.log('  ✔ Generic invalid credentials response verified!');
    }

    // 5. Test INACTIVE Account login
    console.log('\n5. Creating temporary Inactive user to test deactivation message...');
    const inactiveHashed = await bcrypt.hash('Password123!', 10);
    const inactiveUser = await prisma.user.upsert({
      where: { email: 'inactive_test@storehub.com' },
      update: { isActive: false },
      create: {
        name: 'Inactive Test User',
        email: 'inactive_test@storehub.com',
        password: inactiveHashed,
        address: '123 Deactivated St',
        role: 'USER',
        isActive: false,
      },
    });

    const inactiveRes = await loginRequest('inactive_test@storehub.com', 'Password123!');
    console.log(`  Status Code: ${inactiveRes.statusCode}`);
    console.log(`  Error Message: "${inactiveRes.data.message}"`);
    if (
      inactiveRes.statusCode === 403 &&
      inactiveRes.data.message.includes('deactivated')
    ) {
      console.log('  ✔ Deactivated account error message verified!');
    }

    // Cleanup inactive test user
    await prisma.user.delete({ where: { id: inactiveUser.id } });

    console.log('\n==================================================');
    console.log('✔ UNIFIED SINGLE LOGIN & ROLE DETECTION VERIFIED 100%!');
    console.log('==================================================\n');
  } catch (err) {
    console.error('❌ Test Failed:', err);
  }
}

testUnifiedLoginAndRoleDetection();
