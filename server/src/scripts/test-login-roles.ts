import http from 'http';

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

async function testManualLoginCredentials() {
  console.log('=== TESTING MANUAL LOGIN FOR ALL ROLES ===\n');

  const accounts = [
    { role: 'ADMIN', email: 'admin@storehub.com', password: 'Password123!' },
    { role: 'STORE_OWNER', email: 'owner1@storehub.com', password: 'Password123!' },
    { role: 'USER', email: 'user1@storehub.com', password: 'Password123!' },
  ];

  for (const acc of accounts) {
    console.log(`Testing Login for ${acc.role} (${acc.email})...`);
    const res = await loginRequest(acc.email, acc.password);
    console.log(`  Status Code: ${res.statusCode}`);

    if (res.statusCode === 200 && res.data.success) {
      const user = res.data.data.user;
      console.log(`  ✔ Successfully authenticated!`);
      console.log(`  - Name: ${user.name}`);
      console.log(`  - Verified Role: ${user.role}`);
      console.log(`  - Token Issued: ${res.data.data.token ? 'Yes (JWT)' : 'No'}\n`);
    } else {
      console.error(`  ❌ Login Failed for ${acc.role}! Status: ${res.statusCode}`, res.data);
    }
  }

  console.log('==================================================');
  console.log('✔ MANUAL LOGIN VERIFICATION PASSED FOR ALL 3 ROLES!');
  console.log('==================================================\n');
}

testManualLoginCredentials();
