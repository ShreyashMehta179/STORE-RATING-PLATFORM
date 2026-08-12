import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { Role } from '@prisma/client';

export async function ensureAdminUser(): Promise<void> {
  try {
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

    console.log(`✅ Default Admin user ensured: ${admin.email} (Role: ${admin.role}, Active: ${admin.isActive})`);
  } catch (error) {
    console.error('❌ Error in ensureAdminUser:', error);
  }
}
