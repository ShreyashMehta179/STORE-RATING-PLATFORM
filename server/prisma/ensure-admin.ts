import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🛡️ Ensuring default Admin account exists (safe & idempotent)...');

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.upsert({
    where: {
      email: 'admin@storehub.com',
    },
    update: {
      role: Role.ADMIN,
      isActive: true,
    },
    create: {
      name: 'Shreyash Nilesh Mehta - Administrator',
      email: 'admin@storehub.com',
      password: hashedPassword,
      address: '100 Commercial Plaza, MG Road, Shivajinagar, Pune, Maharashtra 411005',
      role: Role.ADMIN,
      isActive: true,
      lastLoginAt: new Date(),
    },
  });

  console.log(`✅ Admin account initialized safely: ${admin.email} (Role: ${admin.role}, Active: ${admin.isActive})`);
}

main()
  .catch((e) => {
    console.error('❌ Error during ensure-admin execution:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
