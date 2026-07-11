import { prisma } from './db';
import { JWTPayload } from './token';

// Admin: all tasks. TeamLead: tasks belonging to a team they lead.
// TeamMate: tasks they're assigned to.
export async function canAccessTask(user: JWTPayload, taskId: string): Promise<boolean> {
  if (user.role === 'admin') return true;

  if (user.role === 'teamlead') {
    const team = await prisma.team.findFirst({
      where: { leadId: user.userId, tasks: { some: { id: taskId } } },
      select: { id: true },
    });
    return !!team;
  }

  const assignee = await prisma.taskAssignee.findFirst({
    where: { taskId, userId: user.userId },
    select: { id: true },
  });
  return !!assignee;
}

// Admin: any task. TeamLead: only tasks of a team they lead. TeamMate: none (read-only role).
export async function canWriteTask(user: JWTPayload, taskId: string): Promise<boolean> {
  if (user.role === 'admin') return true;

  if (user.role === 'teamlead') {
    const team = await prisma.team.findFirst({
      where: { leadId: user.userId, tasks: { some: { id: taskId } } },
      select: { id: true },
    });
    return !!team;
  }

  return false;
}
