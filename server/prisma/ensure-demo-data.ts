import { PrismaClient } from '@prisma/client';
import { ensureDemoData } from '../src/utils/ensureDemoData';

const prisma = new PrismaClient();

async function main() {
  await ensureDemoData();
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Error during ensureDemoData execution:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { ensureDemoData };
