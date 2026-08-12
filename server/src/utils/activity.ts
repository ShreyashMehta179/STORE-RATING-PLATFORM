import { prisma } from './prisma';

export const logActivity = async (
  userId: string | null,
  action: string,
  entity: string,
  entityId?: string,
  metadata?: any
) => {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        metadata: metadata ? metadata : undefined,
      },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
