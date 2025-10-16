import { UserTier } from '../src/constants/enums';
import bcrypt from 'bcrypt';

import prisma from "../src/config/database";

// Sample user data
const sampleUsers = [
  {
    fullname: 'Admin User',
    email: 'admin@example.com',
    phone: '+2348012345678',
    password: 'admin123',
    roles: 'ADMIN' as const,
    tier: UserTier.PLATINUM,
    isVerified: true,
  },
  {
    fullname: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+2348012345679',
    password: 'password123',
    roles: 'USER' as const,
    tier: UserTier.GOLD,
    isVerified: true,
  },
  {
    fullname: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+2348012345680',
    password: 'password123',
    roles: 'USER' as const,
    tier: UserTier.SILVER,
    isVerified: true,
  },
  {
    fullname: 'Michael Johnson',
    email: 'michael.johnson@example.com',
    phone: '+2348012345681',
    password: 'password123',
    roles: 'USER' as const,
    tier: UserTier.GOLD,
    isVerified: true,
  },
  {
    fullname: 'Sarah Williams',
    email: 'sarah.williams@example.com',
    phone: '+2348012345682',
    password: 'password123',
    roles: 'USER' as const,
    tier: UserTier.BASIC,
    isVerified: true,
  },
  {
    fullname: 'David Brown',
    email: 'david.brown@example.com',
    phone: '+2348012345683',
    password: 'password123',
    roles: 'USER' as const,
    tier: UserTier.SILVER,
    isVerified: true,
  },
  {
    fullname: 'Lisa Davis',
    email: 'lisa.davis@example.com',
    phone: '+2348012345684',
    password: 'password123',
    roles: 'USER' as const,
    tier: UserTier.BASIC,
    isVerified: true,
  },
  {
    fullname: 'Robert Wilson',
    email: 'robert.wilson@example.com',
    phone: '+2348012345685',
    password: 'password123',
    roles: 'USER' as const,
    tier: UserTier.GOLD,
    isVerified: true,
  },
  {
    fullname: 'Emily Jones',
    email: 'emily.jones@example.com',
    phone: '+2348012345686',
    password: 'password123',
    roles: 'USER' as const,
    tier: UserTier.PLATINUM,
    isVerified: true,
  },
  {
    fullname: 'Christopher Garcia',
    email: 'chris.garcia@example.com',
    phone: '+2348012345687',
    password: 'password123',
    roles: 'USER' as const,
    tier: UserTier.BASIC,
    isVerified: true,
  },
];

// Sample wallet balances (in NGN)
const walletBalances = [
  50000.00, // Admin - higher balance
  25000.00, // User 1
  15000.00, // User 2
  30000.00, // User 3
  5000.00,  // User 4
  18000.00, // User 5
  8000.00,  // User 6
  22000.00, // User 7
  35000.00, // User 8
  12000.00, // User 9
];

async function main() {
  console.log('🌱 Starting database seeding...');

  try {

    // Create users and their related data
    for (let i = 0; i < sampleUsers.length; i++) {
      const userData = sampleUsers[i];

      console.log(`👤 Creating user: ${userData.fullname}`);

      // Hash the password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user
      const user = await prisma.users.create({
        data: {
          fullname: userData.fullname,
          email: userData.email,
          phone: userData.phone,
          password: hashedPassword,
          roles: userData.roles,
          tier: userData.tier,
          isVerified: userData.isVerified,
          status: 'ACTIVE',
        },
      });

      // Create user profile
      const nameParts = userData.fullname.split(' ');
      await prisma.userProfile.create({
        data: {
          userId: user.id,
          firstName: nameParts[0],
          lastName: nameParts[nameParts.length - 1],
          middleName: nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : null,
          address: `${Math.floor(Math.random() * 1000) + 1} Sample Street, Lagos, Nigeria`,
          status: 'ACTIVE',
        },
      });

      // Create wallet with initial balance
      await prisma.wallet.create({
        data: {
          userId: user.id,
          balance: walletBalances[i],
          currency: 'NGN',
        },
      });

      // Create some sample transactions for each user
      const wallet = await prisma.wallet.findUnique({
        where: { userId: user.id },
      });

      if (wallet) {
        // Create a few sample transactions
        const transactionTypes = ['CREDIT', 'DEBIT'] as const;
        const statuses = ['SUCCESS', 'PENDING'] as const;

        for (let j = 0; j < 3; j++) {
          const isCredit = Math.random() > 0.5;
          const amount = Math.floor(Math.random() * 10000) + 1000; // Random amount between 1000-11000

          await prisma.transactions.create({
            data: {
              walletId: wallet.id,
              type: isCredit ? 'CREDIT' : 'DEBIT',
              amount: amount,
              reference: `TXN-${user.id}-${Date.now()}-${j}`,
              status: statuses[Math.floor(Math.random() * statuses.length)],
              description: isCredit
                ? `Credit transaction for ${userData.fullname}`
                : `Debit transaction for ${userData.fullname}`,
            },
          });
        }
      }

      // Create a welcome notification
      await prisma.notifications.create({
        data: {
          userId: user.id,
          title: 'Welcome!',
          message: `Welcome to the platform, ${userData.fullname}! Your account has been created successfully.`,
          isRead: false,
        },
      });
    }

    // Create some platform settings
    console.log('⚙️ Creating platform settings...');
    await prisma.settings.createMany({
      data: [
        { key: 'platform_name', value: 'BIA Platform' },
        { key: 'maintenance_mode', value: 'false' },
        { key: 'registration_enabled', value: 'true' },
        { key: 'max_daily_transaction', value: '1000000' },
        { key: 'platform_email', value: 'support@biaplatform.com' },
      ],
    });

    // Create transaction limits for each tier
    console.log('📊 Creating transaction limits...');
    await prisma.transactionLimit.createMany({
      data: [
        {
          tier: 'BASIC',
          dailyLimit: 50000.00,
          monthlyLimit: 500000.00,
          singleTxLimit: 25000.00,
        },
        {
          tier: 'SILVER',
          dailyLimit: 100000.00,
          monthlyLimit: 1000000.00,
          singleTxLimit: 50000.00,
        },
        {
          tier: 'GOLD',
          dailyLimit: 250000.00,
          monthlyLimit: 2500000.00,
          singleTxLimit: 100000.00,
        },
        {
          tier: 'PLATINUM',
          dailyLimit: 500000.00,
          monthlyLimit: 5000000.00,
          singleTxLimit: 250000.00,
        },
      ],
    });

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Created ${sampleUsers.length} users (1 admin, ${sampleUsers.length - 1} regular users)`);
    console.log('- Created user profiles for all users');
    console.log('- Created wallets with initial balances');
    console.log('- Created sample transactions');
    console.log('- Created welcome notifications');
    console.log('- Created platform settings');
    console.log('- Created transaction limits for all tiers');

    console.log('\n🔑 Login credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('Users: [email] / password123');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
