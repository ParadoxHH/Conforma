import { PrismaClient, Prisma, Role, Trade, InviteRole, InviteStatus, DocumentType, DocumentStatus } from '@prisma/client';
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
      avatarUrl: 'https://images.conforma.com/avatars/admin.png',
      bio: 'Head of escrow operations for Conforma.',
    },
  });
  console.log('Created admin user:', admin.email);

  // Create Homeowner
  const homeownerUser = await prisma.user.create({
    data: {
      email: 'homeowner@test.com',
      password: hashedPassword,
      role: 'HOMEOWNER',
      avatarUrl: 'https://images.conforma.com/avatars/homeowner.png',
      bio: 'Austin homeowner renovating a 1950s bungalow.',
    },
  });

  const homeowner = await prisma.homeowner.create({
    data: {
      userId: homeownerUser.id,
      address: '123 Main St',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      displayName: 'The Martinez Family',
      allowAlias: true,
      phoneNumber: '+15125551000',
    },
  });
  console.log('Created homeowner:', homeownerUser.email);

  // Create Contractor
  const contractorUser = await prisma.user.create({
    data: {
      email: 'contractor@test.com',
      password: hashedPassword,
      role: 'CONTRACTOR',
      avatarUrl: 'https://images.conforma.com/avatars/contractor.png',
      bio: 'Texas roofing contractor focused on residential re-roofs.',
    },
  });

  const contractor = await prisma.contractor.create({
    data: {
      userId: contractorUser.id,
      companyName: 'Reliable Roofers',
      trade: 'Roofing',
      trades: [Trade.ROOFING, Trade.HOME_IMPROVEMENT],
      serviceAreas: ['78701', '78702', '78703'],
      portfolio: [
        { title: 'Barton Hills Roof', url: 'https://portfolio.conforma.com/roofing-1', type: 'IMAGE' },
        { title: 'Westlake Metal Roof', url: 'https://portfolio.conforma.com/roofing-2', type: 'IMAGE' },
      ],
      verifiedKyc: true,
      verifiedLicense: true,
      verifiedInsurance: true,
    },
  });
  console.log('Created contractor:', contractorUser.email);

  await prisma.document.createMany({
    data: [
      {
        userId: contractorUser.id,
        type: DocumentType.LICENSE,
        url: 'https://documents.conforma.com/license.pdf',
        status: DocumentStatus.APPROVED,
        notes: 'Verified by admin seed.',
      },
      {
        userId: contractorUser.id,
        type: DocumentType.INSURANCE,
        url: 'https://documents.conforma.com/insurance.pdf',
        status: DocumentStatus.APPROVED,
      },
    ],
  });

  // Create Job
  const job = await prisma.job.create({
    data: {
      title: 'New Roof Installation',
      description: 'Complete tear-off and replacement of asphalt shingle roof.',
      totalPrice: 10000.0,
      homeownerId: homeowner.id,
      contractorId: contractor.id,
      status: 'COMPLETED',
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

  // Seed messages for job thread
  const attachments: Prisma.JsonArray = [
    { url: 'https://files.conforma.com/selections.pdf', type: 'PDF' },
  ];

  await prisma.message.create({
    data: {
      jobId: job.id,
      senderUserId: homeownerUser.id,
      body: 'Hi team, excited to get started next Monday. Do you need anything else from me?',
    },
  });

  await prisma.message.create({
    data: {
      jobId: job.id,
      senderUserId: contractorUser.id,
      body: 'Thanks! Please review the material selection attached here.',
      attachments,
    },
  });

  // Seed review
  const review = await prisma.review.create({
    data: {
      jobId: job.id,
      contractorId: contractor.id,
      homeownerId: homeowner.id,
      rating: 5,
      comment: 'Reliable Roofers kept every milestone on track and quality was excellent.',
    },
  });
  console.log('Created review:', review.id);

  await prisma.contractor.update({
    where: { id: contractor.id },
    data: {
      ratingAvg: 5,
      ratingCount: 1,
    },
  });

  // Seed invite
  await prisma.invite.create({
    data: {
      jobId: job.id,
      role: InviteRole.CONTRACTOR,
      email: 'futurepartner@roofers.com',
      phone: '+15125551234',
      token: 'seed-token-contractor',
      status: InviteStatus.PENDING,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // Additional contractor for search variety
  const solarUser = await prisma.user.create({
    data: {
      email: 'solar@test.com',
      password: hashedPassword,
      role: Role.CONTRACTOR,
      avatarUrl: 'https://images.conforma.com/avatars/solar.png',
      bio: 'Solar installer focused on Austin and San Antonio.',
    },
  });

  const solarContractor = await prisma.contractor.create({
    data: {
      userId: solarUser.id,
      companyName: 'SunBeam Solar',
      trade: 'Solar',
      trades: [Trade.SOLAR],
      serviceAreas: ['78744', '78205'],
      portfolio: [
        { title: 'South Congress Solar', url: 'https://portfolio.conforma.com/solar-1', type: 'IMAGE' },
      ],
      verifiedKyc: true,
      verifiedLicense: false,
      verifiedInsurance: true,
      ratingAvg: 4.5,
      ratingCount: 12,
    },
  });

  const solarJob = await prisma.job.create({
    data: {
      title: 'Solar Array Maintenance',
      description: 'Annual performance inspection and panel cleaning.',
      totalPrice: 4500,
      homeownerId: homeowner.id,
      contractorId: solarContractor.id,
      status: 'COMPLETED',
    },
  });

  await prisma.review.create({
    data: {
      jobId: solarJob.id,
      contractorId: solarContractor.id,
      homeownerId: homeowner.id,
      rating: 5,
      comment: 'SunBeam Solar delivered on time and improved our output.',
    },
  });

  await prisma.contractor.update({
    where: { id: solarContractor.id },
    data: {
      ratingAvg: 4.7,
      ratingCount: 13,
    },
  });

  console.log('Seeded additional contractor data including solar contractor.');

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
