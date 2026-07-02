import { prisma } from './db';

export const logActivity = async (
  userId: string,
  action: string,
  entityType: 'task' | 'team' | 'comment' | 'attachment' | 'event',
  entityId: string,
  taskId?: string,
  teamId?: string
) => {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        taskId,
        teamId,
      },
    });
  } catch (error) {
    // Silently fail on logging errors to not disrupt main operations
    console.error('Failed to log activity:', error);
  }
};
