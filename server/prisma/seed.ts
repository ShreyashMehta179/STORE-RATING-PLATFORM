import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting StoreHub database seeding (Indianized dataset)...');

  // Clean existing database records safely
  await prisma.activityLog.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = await bcrypt.hash('Password123!', 10);

  // 1. Create System Administrator (Name 20-60 chars)
  const admin = await prisma.user.create({
    data: {
      name: 'Shreyash Nilesh Mehta - Administrator',
      email: 'admin@storehub.com',
      password: defaultPassword,
      address: '100 Commercial Plaza, MG Road, Shivajinagar, Pune, Maharashtra 411005',
      role: Role.ADMIN,
      isActive: true,
      lastLoginAt: new Date(),
    },
  });
  console.log('✅ Created Admin user:', admin.email);

  // 2. Create 8 Indian Store Owners (Names 20-60 chars)
  const owner1 = await prisma.user.create({
    data: {
      name: 'Priya Deshmukh - Store Owner',
      email: 'owner1@storehub.com',
      password: defaultPassword,
      address: '45 Rajarampuri 5th Lane, Kolhapur, Maharashtra 416008',
      role: Role.STORE_OWNER,
      isActive: true,
      lastLoginAt: new Date(Date.now() - 3600000 * 5),
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      name: 'Rohan Patil - Store Owner',
      email: 'owner2@storehub.com',
      password: defaultPassword,
      address: '102 FC Road, Shivajinagar, Pune, Maharashtra 411004',
      role: Role.STORE_OWNER,
      isActive: true,
      lastLoginAt: new Date(Date.now() - 3600000 * 12),
    },
  });

  const owner3 = await prisma.user.create({
    data: {
      name: 'Aarav Mehta - Store Owner',
      email: 'owner3@storehub.com',
      password: defaultPassword,
      address: '88 MG Road, Indiranagar, Bengaluru, Karnataka 560038',
      role: Role.STORE_OWNER,
      isActive: true,
      lastLoginAt: new Date(Date.now() - 3600000 * 24),
    },
  });

  const owner4 = await prisma.user.create({
    data: {
      name: 'Neha Desai - Store Owner',
      email: 'neha@storehub.com',
      password: defaultPassword,
      address: '204 Powai Plaza, Hiranandani, Mumbai, Maharashtra 400076',
      role: Role.STORE_OWNER,
      isActive: true,
      lastLoginAt: new Date(Date.now() - 3600000 * 36),
    },
  });

  const owner5 = await prisma.user.create({
    data: {
      name: 'Vikram Joshi - Store Owner',
      email: 'vikram@storehub.com',
      password: defaultPassword,
      address: '15 Banjara Hills Road No 2, Hyderabad, Telangana 500034',
      role: Role.STORE_OWNER,
      isActive: true,
      lastLoginAt: new Date(Date.now() - 3600000 * 48),
    },
  });

  const owner6 = await prisma.user.create({
    data: {
      name: 'Kavya Nair - Store Owner',
      email: 'kavya@storehub.com',
      password: defaultPassword,
      address: '34 Connaught Place, Inner Circle, New Delhi 110001',
      role: Role.STORE_OWNER,
      isActive: true,
      lastLoginAt: new Date(Date.now() - 3600000 * 60),
    },
  });

  const owner7 = await prisma.user.create({
    data: {
      name: 'Aditya Shah - Store Owner',
      email: 'aditya.owner@storehub.com',
      password: defaultPassword,
      address: '12 Salt Lake Sector V, Kolkata, West Bengal 700091',
      role: Role.STORE_OWNER,
      isActive: true,
      lastLoginAt: new Date(Date.now() - 3600000 * 72),
    },
  });

  const owner8 = await prisma.user.create({
    data: {
      name: 'Sneha Kulkarni - Store Owner',
      email: 'sneha.owner@storehub.com',
      password: defaultPassword,
      address: '77 College Road, Nashik, Maharashtra 422005',
      role: Role.STORE_OWNER,
      isActive: true,
      lastLoginAt: new Date(Date.now() - 3600000 * 80),
    },
  });

  const ownersList = [owner1, owner2, owner3, owner4, owner5, owner6, owner7, owner8];
  console.log(`✅ Created ${ownersList.length} Indian Store Owners`);

  // 3. Create 16 Indian Customer Accounts (Names 20-60 chars)
  const customersData = [
    { name: 'Aarav Mehta - Valued Customer', email: 'aarav@storehub.com', altEmail: 'user1@storehub.com' },
    { name: 'Ananya Sharma - Local Guide', email: 'ananya@storehub.com', altEmail: 'user2@storehub.com' },
    { name: 'Rohan Patil - Food Enthusiast', email: 'rohan.user@storehub.com', altEmail: 'user3@storehub.com' },
    { name: 'Priya Deshmukh - Daily Customer', email: 'priya.user@storehub.com', altEmail: 'user4@storehub.com' },
    { name: 'Sneha Joshi - Verified Reviewer', email: 'sneha@storehub.com', altEmail: 'user5@storehub.com' },
    { name: 'Rahul Kulkarni - Community Guide', email: 'rahul@storehub.com', altEmail: 'user6@storehub.com' },
    { name: 'Ishita Shah - Verified Customer', email: 'ishita@storehub.com', altEmail: 'user7@storehub.com' },
    { name: 'Aditya Verma - Tech Reviewer', email: 'aditya@storehub.com', altEmail: 'user8@storehub.com' },
    { name: 'Neha Desai - Daily Customer', email: 'neha.user@storehub.com', altEmail: 'user9@storehub.com' },
    { name: 'Vedant More - Retail Guide', email: 'vedant@storehub.com', altEmail: 'user10@storehub.com' },
    { name: 'Aditi Pawar - Verified Member', email: 'aditi@storehub.com' },
    { name: 'Omkar Jadhav - Local Reviewer', email: 'omkar@storehub.com' },
    { name: 'Sakshi Chavan - Verified Guide', email: 'sakshi@storehub.com' },
    { name: 'Kunal Gupta - Community Member', email: 'kunal@storehub.com' },
    { name: 'Pooja Nair - Retail Enthusiast', email: 'pooja@storehub.com' },
    { name: 'Arjun Malhotra - Food Critic', email: 'arjun@storehub.com' },
  ];

  const normalUsers = [];
  for (const u of customersData) {
    // Primary account
    const user = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        password: defaultPassword,
        address: '15 Swapnagandhi Housing Society, Kothrud, Pune, Maharashtra 411038',
        role: Role.USER,
        isActive: true,
        lastLoginAt: new Date(Date.now() - Math.random() * 86400000 * 7),
      },
    });
    normalUsers.push(user);

    // If altEmail exists (to satisfy user1@storehub.com - user10@storehub.com test compatibility), add backup account
    if (u.altEmail) {
      const altUser = await prisma.user.create({
        data: {
          name: u.name,
          email: u.altEmail,
          password: defaultPassword,
          address: '22 Viman Nagar Main Road, Pune, Maharashtra 411014',
          role: Role.USER,
          isActive: true,
          lastLoginAt: new Date(Date.now() - Math.random() * 86400000 * 7),
        },
      });
      normalUsers.push(altUser);
    }
  }
  console.log(`✅ Created ${normalUsers.length} Indian Customer Accounts`);

  // 4. Create 20 Realistic Indian Stores
  const storesData = [
    {
      name: 'Deccan Brew House',
      email: 'contact@deccanbrew.in',
      address: 'FC Road, Shivajinagar, Pune, Maharashtra 411004',
      ownerId: owner2.id,
      category: 'Cafes & Beverages',
      description: 'Specialty organic filter coffee, artisanal chai, fresh bun maska, and cozy study atmosphere.',
      phone: '+91 98765 43210',
      website: 'https://deccanbrew.example.in',
      imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Spice Route Kitchen',
      email: 'info@spiceroute.in',
      address: 'MG Road, Indiranagar, Bengaluru, Karnataka 560038',
      ownerId: owner3.id,
      category: 'Restaurants & Dining',
      description: 'Authentic South & North Indian delicacies prepared with traditional spice blends and fresh local ingredients.',
      phone: '+91 91234 56789',
      website: 'https://spiceroute.example.in',
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Mitti Coffee & Café',
      email: 'hello@mitticafe.in',
      address: 'Baner Road, High Street, Pune, Maharashtra 411045',
      ownerId: owner2.id,
      category: 'Cafes & Beverages',
      description: 'Cozy eco-cafe serving kulhad chai, cold brews, gourmet sandwiches, and fresh baked snacks.',
      phone: '+91 99887 66554',
      website: 'https://mitticafe.example.in',
      imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Maharashtra Rasoi',
      email: 'dine@maharashtrarasoi.in',
      address: 'Rajarampuri 3rd Lane, Kolhapur, Maharashtra 416008',
      ownerId: owner1.id,
      category: 'Restaurants & Dining',
      description: 'Authentic Kolhapuri & Maharashtrian thali prepared with secret family recipes and rich spices.',
      phone: '+91 97654 32109',
      website: 'https://maharashtrarasoi.example.in',
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Tadka Junction',
      email: 'order@tadkajunction.in',
      address: 'Viman Nagar Main Road, Pune, Maharashtra 411014',
      ownerId: owner2.id,
      category: 'Restaurants & Dining',
      description: 'Lively family restaurant specializing in Punjabi tandoori, butter chicken, and garlic naans.',
      phone: '+91 98220 11223',
      website: 'https://tadkajunction.example.in',
      imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Desi Zaika Restaurant',
      email: 'contact@desizaika.in',
      address: 'Banjara Hills Road No 12, Hyderabad, Telangana 500034',
      ownerId: owner5.id,
      category: 'Restaurants & Dining',
      description: 'Famous Hyderabadi dum biryani, kebabs, and authentic Mughlai specialties in a royal ambience.',
      phone: '+91 98490 55667',
      website: 'https://desizaika.example.in',
      imageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'The Curry Courtyard',
      email: 'info@currycourtyard.in',
      address: 'Central Avenue, Powai, Mumbai, Maharashtra 400076',
      ownerId: owner4.id,
      category: 'Restaurants & Dining',
      description: 'Fine dining Indian restaurant featuring coastal curries, tandoori grills, and gourmet desserts.',
      phone: '+91 98190 33445',
      website: 'https://currycourtyard.example.in',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Konkan Spice House',
      email: 'hello@konkanspice.in',
      address: 'Andheri West, Link Road, Mumbai, Maharashtra 400053',
      ownerId: owner4.id,
      category: 'Restaurants & Dining',
      description: 'Fresh seafood delicacies, Malvani fish thali, and authentic Konkani coconut curries.',
      phone: '+91 99200 44556',
      website: 'https://konkanspice.example.in',
      imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Mithaas Bakery & Sweets',
      email: 'orders@mithaasbakery.in',
      address: 'Koregaon Park Lane 6, Pune, Maharashtra 411001',
      ownerId: owner1.id,
      category: 'Bakery & Sweets',
      description: 'Artisanal Indian sweets, fresh pastries, custom celebratory cakes, and traditional dry fruit mithai.',
      phone: '+91 98810 66778',
      website: 'https://mithaasbakery.example.in',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Shree Ganesh Bakery',
      email: 'support@shreeganeshbakery.in',
      address: 'Laxmi Road, City Center, Pune, Maharashtra 411030',
      ownerId: owner1.id,
      category: 'Bakery & Sweets',
      description: 'Famous heritage bakery known for mawa cakes, khari biscuits, rusk, and festive sweet boxes.',
      phone: '+91 94220 88990',
      website: 'https://shreeganeshbakery.example.in',
      imageUrl: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Bharat Bakers',
      email: 'contact@bharatbakers.in',
      address: 'Salt Lake Sector 1, Kolkata, West Bengal 700064',
      ownerId: owner7.id,
      category: 'Bakery & Sweets',
      description: 'Traditional Bengali sweets, roshogolla, sandesh, fresh fruit tarts, and oven-baked cookies.',
      phone: '+91 98300 12345',
      website: 'https://bharatbakers.example.in',
      imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Vastra Fashion Studio',
      email: 'style@vastrafashion.in',
      address: 'Commercial Street, Bengaluru, Karnataka 560001',
      ownerId: owner3.id,
      category: 'Fashion & Apparel',
      description: 'Contemporary designer ethnic wear, handloom sarees, embroidered kurtis, and wedding attire.',
      phone: '+91 98450 67890',
      website: 'https://vastrafashion.example.in',
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Indie Threads Boutique',
      email: 'hello@indiethreads.in',
      address: 'Bandra West, Hill Road, Mumbai, Maharashtra 400050',
      ownerId: owner4.id,
      category: 'Fashion & Apparel',
      description: 'Sustainable cotton apparel, handcrafted Indo-Western fusion wear, and artisanal accessories.',
      phone: '+91 98200 99887',
      website: 'https://indiethreads.example.in',
      imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Desi Vogue',
      email: 'contact@desivogue.in',
      address: 'Connaught Place Block A, New Delhi 110001',
      ownerId: owner6.id,
      category: 'Fashion & Apparel',
      description: 'Chic urban ethnic fashion, silk dupattas, designer lehengas, and handcrafted jewelry accessories.',
      phone: '+91 98110 22334',
      website: 'https://desivogue.example.in',
      imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'FreshKart Groceries',
      email: 'store@freshkart.in',
      address: 'Kothrud Depot Circle, Pune, Maharashtra 411038',
      ownerId: owner2.id,
      category: 'Grocery & Supermarket',
      description: 'Farm-fresh local vegetables, organic staples, dairy products, cold-pressed oils, and daily household essentials.',
      phone: '+91 98900 11224',
      website: 'https://freshkart.example.in',
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Apna Daily Mart',
      email: 'info@apnadailymart.in',
      address: 'Ghodbunder Road, Thane West, Thane, Maharashtra 400607',
      ownerId: owner4.id,
      category: 'Grocery & Supermarket',
      description: 'Neighborhood supermarket with fresh produce, Indian pantry spices, snacks, and personal care supplies.',
      phone: '+91 97690 33446',
      website: 'https://apnadailymart.example.in',
      imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Glow & Grace Salon',
      email: 'care@glowandgrace.in',
      address: '100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038',
      ownerId: owner3.id,
      category: 'Beauty & Personal Care',
      description: 'Premium unisex salon & spa offering herbal facials, hair styling, bridal makeup, and wellness treatments.',
      phone: '+91 98800 55443',
      website: 'https://glowandgrace.example.in',
      imageUrl: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'FitIndia Wellness Club',
      email: 'fit@fitindiaclub.in',
      address: 'Jubilee Hills Check Post, Hyderabad, Telangana 500033',
      ownerId: owner5.id,
      category: 'Health & Fitness',
      description: 'Modern fitness center featuring cardio equipment, strength training, yoga sessions, and personal trainers.',
      phone: '+91 98480 77889',
      website: 'https://fitindiaclub.example.in',
      imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'SmartTech Electronics',
      email: 'sales@smarttechelectronics.in',
      address: 'Lamington Road, Grant Road, Mumbai, Maharashtra 400007',
      ownerId: owner4.id,
      category: 'Electronics & Technology',
      description: 'Trusted tech hub for laptops, smartphones, custom gaming PC builds, audio gear, and expert repairs.',
      phone: '+91 98210 88776',
      website: 'https://smarttechelectronics.example.in',
      imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Kitab Ghar',
      email: 'contact@kitabghar.in',
      address: 'College Road, Near RY Kulkarni Circle, Nashik, Maharashtra 422005',
      ownerId: owner8.id,
      category: 'Bookstores & Stationery',
      description: 'Independent bookstore with Indian literature, academic titles, fiction classics, stationery, and cozy reading space.',
      phone: '+91 94230 44557',
      website: 'https://kitabghar.example.in',
      imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=800&auto=format&fit=crop',
    },
  ];

  const stores = [];
  for (const s of storesData) {
    const store = await prisma.store.create({
      data: s,
    });
    stores.push(store);
  }
  console.log(`✅ Created ${stores.length} Indian Stores across multiple categories & cities`);

  // 5. Create 75+ Authentic Indian Customer Ratings & Reviews
  const indianReviews = [
    { rating: 5, text: 'Authentic Maharashtrian flavours. Highly recommended!' },
    { rating: 5, text: 'Excellent filter coffee and really fast service. Loved the ambience!' },
    { rating: 4, text: 'Great place for family dinner on weekends. Food quality is top notch.' },
    { rating: 5, text: 'One of my favourite places in Pune! Friendly staff and clean environment.' },
    { rating: 4, text: 'Very satisfied with my visit. Good pricing and generous portion sizes.' },
    { rating: 5, text: 'Beautiful collection of ethnic wear with great craftsmanship.' },
    { rating: 4, text: 'Fresh food and reasonable prices. Will definitely visit again.' },
    { rating: 5, text: 'Outstanding quality and very polite management team!' },
    { rating: 3, text: 'Decent experience. Food was good but seating was a bit crowded during peak hours.' },
    { rating: 5, text: 'Top tier customer experience! 10/10 recommendation for friends and family.' },
    { rating: 4, text: 'Very clean store with plenty of fresh produce options.' },
    { rating: 4, text: 'Great service and authentic taste! Loved the filter chai and bun maska.' },
    { rating: 5, text: 'Wonderful atmosphere and extremely helpful staff members.' },
    { rating: 3, text: 'Good quality items, though parking space near the store can be difficult.' },
  ];

  let ratingCount = 0;
  for (const store of stores) {
    // Pick random subset of unique users for each store
    const shuffledUsers = [...normalUsers].sort(() => 0.5 - Math.random());
    const userCountForStore = 4 + Math.floor(Math.random() * 3); // 4 to 6 ratings per store

    for (let i = 0; i < userCountForStore; i++) {
      const user = shuffledUsers[i];
      const reviewSample = indianReviews[Math.floor(Math.random() * indianReviews.length)];

      const daysAgo = Math.floor(Math.random() * 90);
      const createdAt = new Date(Date.now() - daysAgo * 86400000);

      try {
        await prisma.rating.create({
          data: {
            userId: user.id,
            storeId: store.id,
            rating: reviewSample.rating,
            review: reviewSample.text,
            createdAt,
            updatedAt: createdAt,
          },
        });

        // Add to favorites for 4 and 5 star ratings
        if (reviewSample.rating >= 4 && Math.random() > 0.4) {
          await prisma.favorite.create({
            data: {
              userId: user.id,
              storeId: store.id,
              createdAt,
            },
          }).catch(() => {}); // catch duplicate unique constraint silently
        }

        ratingCount++;
      } catch (err) {
        // catch duplicate rating constraint silently if any
      }
    }
  }

  console.log(`✅ Created ${ratingCount} authentic Indian store ratings & favorites`);

  // 6. Create Seed Activity Logs with Indian context
  const activityActions = [
    { action: 'USER_REGISTERED', entity: 'USER', details: { note: 'Aarav Mehta registered on StoreHub' } },
    { action: 'STORE_CREATED', entity: 'STORE', details: { note: 'Admin created Deccan Brew House listing' } },
    { action: 'RATING_SUBMITTED', entity: 'RATING', details: { note: 'Ananya Sharma rated Spice Route Kitchen 5 stars' } },
    { action: 'STORE_UPDATED', entity: 'STORE', details: { note: 'Priya Deshmukh updated Maharashtra Rasoi details' } },
    { action: 'FAVORITE_ADDED', entity: 'FAVORITE', details: { note: 'Rohan Patil added Mitti Coffee & Café to favorites' } },
  ];

  for (let i = 0; i < 20; i++) {
    const act = activityActions[i % activityActions.length];
    const randomUser = normalUsers[i % normalUsers.length];
    await prisma.activityLog.create({
      data: {
        userId: randomUser.id,
        action: act.action,
        entity: act.entity,
        entityId: stores[i % stores.length].id,
        metadata: act.details,
        createdAt: new Date(Date.now() - i * 3600000 * 6),
      },
    });
  }

  console.log('✅ Created Activity Logs');
  console.log('🚀 StoreHub Indianized database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
