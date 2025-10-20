import {
  PrismaClient,
  Prisma,
  Role,
  Trade,
  InviteRole,
  InviteStatus,
  DocumentType,
  DocumentStatus,
  DocumentAiStatus,
  SubscriptionTier,
  SubscriptionStatus,
  PayoutType,
  PayoutStatus,
  AiDisputeSuggestion,
  AnalyticsSnapshotKind,
  ReferralEventType,
} from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const password = 'password123';
  const hashedPassword = await argon2.hash(password);
  const generateReferralCode = (prefix: string) =>
    `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const adminReferralCode = generateReferralCode('ADMIN');

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@conforma.com',
      password: hashedPassword,
      role: 'ADMIN',
      avatarUrl: 'https://images.conforma.com/avatars/admin.png',
      bio: 'Head of escrow operations for Conforma.',
      referralCode: adminReferralCode,
    },
  });
  console.log('Created admin user:', admin.email);

  const homeownerReferralCode = generateReferralCode('HOME');

  // Create Homeowner
  const homeownerUser = await prisma.user.create({
    data: {
      email: 'homeowner@test.com',
      password: hashedPassword,
      role: 'HOMEOWNER',
      avatarUrl: 'https://images.conforma.com/avatars/homeowner.png',
      bio: 'Austin homeowner renovating a 1950s bungalow.',
      referralCode: homeownerReferralCode,
      referredByCode: adminReferralCode,
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

  const contractorReferralCode = generateReferralCode('PRO');

  // Create Contractor
  const contractorUser = await prisma.user.create({
    data: {
      email: 'contractor@test.com',
      password: hashedPassword,
      role: 'CONTRACTOR',
      avatarUrl: 'https://images.conforma.com/avatars/contractor.png',
      bio: 'Texas roofing contractor focused on residential re-roofs.',
      referralCode: contractorReferralCode,
      referredByCode: homeownerReferralCode,
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
      subscriptionTier: SubscriptionTier.VERIFIED,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      instantPayoutEnabled: true,
      stripeCustomerId: 'cus_seed_verified',
      stripeSubscriptionId: 'sub_seed_verified',
      subscriptionRenewalAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    },
  });
  console.log('Created contractor:', contractorUser.email);

  const dayMs = 24 * 60 * 60 * 1000;
  await prisma.document.create({
    data: {
      userId: contractorUser.id,
      type: DocumentType.LICENSE,
      url: 'https://documents.conforma.com/license.pdf',
      status: DocumentStatus.APPROVED,
      aiStatus: DocumentAiStatus.APPROVED,
      aiConfidence: new Prisma.Decimal('0.94'),
      aiReason: 'AI verified license number, issuer, and active dates.',
      issuer: 'Texas Department of Licensing and Regulation',
      policyNumber: 'LIC-987654',
      effectiveFrom: new Date(Date.now() - 180 * dayMs),
      effectiveTo: new Date(Date.now() + 365 * dayMs),
      notes: 'Verified by admin seed.',
    },
  });

  await prisma.document.create({
    data: {
      userId: contractorUser.id,
      type: DocumentType.INSURANCE,
      url: 'https://documents.conforma.com/insurance.pdf',
      status: DocumentStatus.NEEDS_REVIEW,
      aiStatus: DocumentAiStatus.NEEDS_REVIEW,
      aiConfidence: new Prisma.Decimal('0.58'),
      aiReason: 'Coverage limit missing; flagged for human review.',
      issuer: 'Lone Star General Insurance Co.',
      policyNumber: 'GL-554321',
      effectiveFrom: new Date(Date.now() - 30 * dayMs),
      effectiveTo: new Date(Date.now() + 60 * dayMs),
    },
  });

  await prisma.document.create({
    data: {
      userId: contractorUser.id,
      type: DocumentType.INSURANCE,
      url: 'https://documents.conforma.com/certificate.pdf',
      status: DocumentStatus.EXPIRED,
      aiStatus: DocumentAiStatus.REJECTED,
      aiConfidence: new Prisma.Decimal('0.31'),
      aiReason: 'Policy expired 15 days ago.',
      issuer: 'Lone Star General Insurance Co.',
      policyNumber: 'GL-554320',
      effectiveFrom: new Date(Date.now() - 400 * dayMs),
      effectiveTo: new Date(Date.now() - 15 * dayMs),
      notes: 'Expired certificate retained for audit.',
    },
  });

  const jobFeeBreakdown: Prisma.JsonObject = {
    platformFee: 150,
    escrowFees: 90,
    instantPayoutFee: 0,
  };

  // Create Job
  const job = await prisma.job.create({
    data: {
      title: 'New Roof Installation',
      description: 'Complete tear-off and replacement of asphalt shingle roof.',
      totalPrice: 10000.0,
      homeownerId: homeowner.id,
      contractorId: contractor.id,
      status: 'COMPLETED',
      platformFeeBps: 150,
      feeAmounts: jobFeeBreakdown,
      stateCode: 'TX',
    },
  });
  console.log('Created job:', job.title);

  await prisma.riskConfig.upsert({
    where: { id: 1 },
    update: {
      maxJobAmountByTrade: {
        ROOFING: 30000,
        SOLAR: 55000,
        TREE_TRIMMING: 15000,
      } as Prisma.JsonObject,
    },
    create: {
      id: 1,
      allowThreshold: 25,
      blockThreshold: 50,
      maxJobAmountByTrade: {
        ROOFING: 30000,
        SOLAR: 55000,
        TREE_TRIMMING: 15000,
      } as Prisma.JsonObject,
    },
  });

  await prisma.riskEvent.create({
    data: {
      jobId: job.id,
      score: 55,
      reasons: ['JOB_AMOUNT_ABOVE_TRADE_CAP', 'DISPOSABLE_EMAIL_DOMAIN'],
    },
  });

  await prisma.payout.create({
    data: {
      jobId: job.id,
      contractorId: contractor.id,
      amount: 985000,
      type: PayoutType.STANDARD,
      status: PayoutStatus.SETTLED,
      processorRef: 'po_standard_seed',
      metadata: {
        channel: 'ACH',
        bank: 'Seed Credit Union',
        settledAt: new Date().toISOString(),
      },
    },
  });

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
      status: 'DISPUTED',
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

  const dispute = await prisma.dispute.create({
    data: {
      milestoneId: milestone2.id,
      reasonText: 'Homeowner requested additional photographic evidence before release.',
      status: 'OPEN',
      resolutionNotes: null,
    },
  });

  await prisma.aiDisputeSummary.create({
    data: {
      disputeId: dispute.id,
      summary:
        'Materials delivered late by one day; homeowner requests partial refund of delivery costs but accepts workmanship.',
      suggestion: AiDisputeSuggestion.PARTIAL_REFUND,
      confidence: new Prisma.Decimal('0.78'),
      modelInfo: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        temperature: 0.2,
      } as Prisma.JsonObject,
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
  const solarReferralCode = generateReferralCode('SOLAR');

  const solarUser = await prisma.user.create({
    data: {
      email: 'solar@test.com',
      password: hashedPassword,
      role: Role.CONTRACTOR,
      avatarUrl: 'https://images.conforma.com/avatars/solar.png',
      bio: 'Solar installer focused on Austin and San Antonio.',
      referralCode: solarReferralCode,
      referredByCode: contractorReferralCode,
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
      subscriptionTier: SubscriptionTier.PRO,
      subscriptionStatus: SubscriptionStatus.PAST_DUE,
      instantPayoutEnabled: false,
      stripeCustomerId: 'cus_seed_solar',
      stripeSubscriptionId: 'sub_seed_solar',
      subscriptionRenewalAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.document.create({
    data: {
      userId: solarUser.id,
      type: DocumentType.CERT,
      url: 'https://documents.conforma.com/solar-nabcep.pdf',
      status: DocumentStatus.PENDING,
      aiStatus: DocumentAiStatus.NONE,
      aiConfidence: new Prisma.Decimal('0'),
      issuer: 'NABCEP',
      policyNumber: 'NABCEP-2245',
      effectiveFrom: new Date(Date.now() - 10 * dayMs),
      effectiveTo: new Date(Date.now() + 350 * dayMs),
    },
  });

  const solarFeeBreakdown: Prisma.JsonObject = {
    platformFee: 67.5,
    escrowFees: 45,
    instantPayoutFee: 22.5,
  };

  const solarJob = await prisma.job.create({
    data: {
      title: 'Solar Array Maintenance',
      description: 'Annual performance inspection and panel cleaning.',
      totalPrice: 4500,
      homeownerId: homeowner.id,
      contractorId: solarContractor.id,
      status: 'COMPLETED',
      platformFeeBps: 175,
      feeAmounts: solarFeeBreakdown,
      stateCode: 'TX',
    },
  });

  await prisma.riskEvent.create({
    data: {
      jobId: solarJob.id,
      score: 18,
      reasons: ['PROFILE_HEALTHY', 'HISTORICAL_PERFORMANCE_STRONG'],
    },
  });

  await prisma.payout.create({
    data: {
      jobId: solarJob.id,
      contractorId: solarContractor.id,
      amount: 380000,
      type: PayoutType.INSTANT,
      status: PayoutStatus.SENT,
      processorRef: 'po_instant_seed',
      metadata: {
        method: 'instant_transfer',
        submittedAt: new Date().toISOString(),
      },
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

  const now = new Date();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  await prisma.analyticsSnapshot.createMany({
    data: [
      {
        kind: AnalyticsSnapshotKind.CONTRACTOR,
        userId: contractorUser.id,
        periodStart: thirtyDaysAgo,
        periodEnd: now,
        payload: {
          jobsWon: 6,
          jobsLost: 2,
          winRate: 0.75,
          revenueNetOfFees: 82500,
          averagePayoutDays: 3,
          instantPayoutUsage: 0.4,
          disputesOpened: 1,
        },
      },
      {
        kind: AnalyticsSnapshotKind.HOMEOWNER,
        userId: homeownerUser.id,
        periodStart: thirtyDaysAgo,
        periodEnd: now,
        payload: {
          totalSpend: 14500,
          approvedMilestones: 5,
          disputedMilestones: 1,
          averageCompletionDays: 28,
          approvalRate: 0.83,
        },
      },
      {
        kind: AnalyticsSnapshotKind.ADMIN,
        userId: null,
        periodStart: ninetyDaysAgo,
        periodEnd: now,
        payload: {
          mrr: 12400,
          arpu: 185,
          churnRate: 0.06,
          feeRevenue: 32100,
          instantPayoutRevenue: 2800,
          disputeSlaHours: 26,
        },
      },
    ],
  });

  await prisma.referralEvent.createMany({
    data: [
      {
        referrerUserId: homeownerUser.id,
        referredUserId: contractorUser.id,
        event: ReferralEventType.SIGNED_UP,
      },
      {
        referrerUserId: homeownerUser.id,
        referredUserId: contractorUser.id,
        event: ReferralEventType.FIRST_FUNDED_JOB,
      },
      {
        referrerUserId: contractorUser.id,
        referredUserId: solarUser.id,
        event: ReferralEventType.SIGNED_UP,
      },
      {
        referrerUserId: contractorUser.id,
        referredUserId: solarUser.id,
        event: ReferralEventType.FIRST_FUNDED_JOB,
      },
    ],
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
