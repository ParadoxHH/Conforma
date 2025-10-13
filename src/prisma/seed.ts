import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const password = 'password123';
  const hashedPassword = await argon2.hash(password);

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@conforma.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log('Created admin user:', admin.email);

  // Create Homeowner
  const homeownerUser = await prisma.user.create({
    data: {
      email: 'homeowner@test.com',
      password: hashedPassword,
      role: 'HOMEOWNER',
    },
  });

  const homeowner = await prisma.homeowner.create({
    data: {
      userId: homeownerUser.id,
      address: '123 Main St',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
    },
  });
  console.log('Created homeowner:', homeownerUser.email);

  // Create Contractor
  const contractorUser = await prisma.user.create({
    data: {
      email: 'contractor@test.com',
      password: hashedPassword,
      role: 'CONTRACTOR',
    },
  });

  const contractor = await prisma.contractor.create({
    data: {
      userId: contractorUser.id,
      companyName: 'Reliable Roofers',
      trade: 'Roofing',
    },
  });
  console.log('Created contractor:', contractorUser.email);

  // Create Job
  const job = await prisma.job.create({
    data: {
      title: 'New Roof Installation',
      description: 'Complete tear-off and replacement of asphalt shingle roof.',
      totalPrice: 10000.0,
      homeownerId: homeowner.id,
      contractorId: contractor.id,
      status: 'PENDING',
    },
  });
  console.log('Created job:', job.title);

  // Create Milestones
  const milestone1 = await prisma.milestone.create({
    data: {
      jobId: job.id,
      title: 'Milestone 1: Materials Deposit',
      price: 4000.0,
      status: 'PENDING',
    },
  });

  const milestone2 = await prisma.milestone.create({
    data: {
      jobId: job.id,
      title: 'Milestone 2: Labor - Half Complete',
      price: 3000.0,
      status: 'PENDING',
    },
  });

  const milestone3 = await prisma.milestone.create({
    data: {
      jobId: job.id,
      title: 'Milestone 3: Project Completion',
      price: 3000.0,
      status: 'PENDING',
    },
  });

  console.log('Created 3 milestones for the job.');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
