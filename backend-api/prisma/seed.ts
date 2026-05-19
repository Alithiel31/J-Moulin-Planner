import { PrismaClient } from '@prisma/client';
import { password } from '../src/lib/password';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.activityLog.deleteMany();
  await prisma.eventAttendee.deleteMany();
  await prisma.event.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.taskAssignee.deleteMany();
  await prisma.task.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  console.log('👥 Creating users...');
  const adminPassword = await password.hash('admin123');
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      password: adminPassword,
      role: 'admin',
    },
  });

  const leadPassword = await password.hash('lead123');
  const lead = await prisma.user.create({
    data: {
      username: 'teamlead',
      password: leadPassword,
      role: 'teamlead',
    },
  });

  const user1Password = await password.hash('user123');
  const user1 = await prisma.user.create({
    data: {
      username: 'user1',
      password: user1Password,
      role: 'teammate',
    },
  });

  const user2Password = await password.hash('user123');
  const user2 = await prisma.user.create({
    data: {
      username: 'user2',
      password: user2Password,
      role: 'teammate',
    },
  });

  // Create teams
  console.log('🏢 Creating teams...');
  const team1 = await prisma.team.create({
    data: {
      name: 'Development Team',
      leadId: lead.id,
      members: {
        connect: [{ id: user1.id }, { id: user2.id }],
      },
    },
  });

  // Update users to be in team
  await prisma.user.update({
    where: { id: user1.id },
    data: { teamId: team1.id },
  });
  await prisma.user.update({
    where: { id: user2.id },
    data: { teamId: team1.id },
  });

  // Create tasks
  console.log('📋 Creating tasks...');
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const task1 = await prisma.task.create({
    data: {
      title: 'Setup authentication system',
      description: 'Implement JWT authentication with Argon2 password hashing',
      category: 'Backend',
      priority: 'high',
      status: 'in_progress',
      startDate: now,
      deadline: nextWeek,
      createdById: admin.id,
      teamId: team1.id,
      assignees: {
        create: [{ userId: user1.id }],
      },
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Create database schema',
      description: 'Design and implement Prisma schema for all entities',
      category: 'Database',
      priority: 'high',
      status: 'done',
      deadline: tomorrow,
      createdById: admin.id,
      teamId: team1.id,
      assignees: {
        create: [{ userId: user2.id }],
      },
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: 'Write API documentation',
      description: 'Document all REST API endpoints',
      category: 'Documentation',
      priority: 'medium',
      status: 'todo',
      deadline: nextWeek,
      createdById: lead.id,
      teamId: team1.id,
      assignees: {
        create: [{ userId: user1.id }, { userId: user2.id }],
      },
    },
  });

  // Create comments
  console.log('💬 Creating comments...');
  await prisma.comment.create({
    data: {
      content: 'Great work on the authentication system! Can we add 2FA support?',
      taskId: task1.id,
      authorId: lead.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'I agree, 2FA would be a great addition. Let me add it to the roadmap.',
      taskId: task1.id,
      authorId: user1.id,
    },
  });

  // Create events
  console.log('📅 Creating events...');
  await prisma.event.create({
    data: {
      title: 'Sprint Planning',
      description: 'Plan tasks for the next sprint',
      startDate: tomorrow,
      endDate: tomorrow,
      location: 'Conference Room A',
      createdById: lead.id,
      teamId: team1.id,
      attendees: {
        create: [{ userId: user1.id }, { userId: user2.id }],
      },
    },
  });

  // Create activity logs
  console.log('📊 Creating activity logs...');
  await prisma.activityLog.create({
    data: {
      action: 'created',
      entityType: 'task',
      entityId: task1.id,
      userId: admin.id,
      taskId: task1.id,
      teamId: team1.id,
    },
  });

  await prisma.activityLog.create({
    data: {
      action: 'updated',
      entityType: 'task',
      entityId: task1.id,
      userId: user1.id,
      taskId: task1.id,
      teamId: team1.id,
    },
  });

  console.log('✅ Database seeding completed!');
  console.log('\n📝 Test credentials:');
  console.log('  Admin: admin / admin123');
  console.log('  TeamLead: teamlead / lead123');
  console.log('  User: user1 / user123');
  console.log('  User: user2 / user123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
