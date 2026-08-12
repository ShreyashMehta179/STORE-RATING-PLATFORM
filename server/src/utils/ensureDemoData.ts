import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export async function ensureDemoData() {
  console.log('🌱 Checking & ensuring StoreHub Indianized demo dataset (safe & non-destructive)...');

  const defaultPassword = await bcrypt.hash('Password123!', 10);

  // 1. Ensure Admin Account
  const admin = await prisma.user.upsert({
    where: { email: 'admin@storehub.com' },
    update: { role: Role.ADMIN, isActive: true },
    create: {
      name: 'Shreyash Nilesh Mehta - Administrator',
      email: 'admin@storehub.com',
      password: defaultPassword,
      address: '100 Commercial Plaza, MG Road, Shivajinagar, Pune, Maharashtra 411005',
      role: Role.ADMIN,
      isActive: true,
      lastLoginAt: new Date(),
    },
  });

  // 2. Ensure 8 Indian Store Owners
  const ownersData = [
    { name: 'Priya Deshmukh - Store Owner', email: 'owner1@storehub.com', address: '45 Rajarampuri 5th Lane, Kolhapur, Maharashtra 416008' },
    { name: 'Rohan Patil - Store Owner', email: 'owner2@storehub.com', address: '102 FC Road, Shivajinagar, Pune, Maharashtra 411004' },
    { name: 'Aarav Mehta - Store Owner', email: 'owner3@storehub.com', address: '88 MG Road, Indiranagar, Bengaluru, Karnataka 560038' },
    { name: 'Neha Desai - Store Owner', email: 'neha@storehub.com', address: '204 Powai Plaza, Hiranandani, Mumbai, Maharashtra 400076' },
    { name: 'Vikram Joshi - Store Owner', email: 'vikram@storehub.com', address: '15 Banjara Hills Road No 2, Hyderabad, Telangana 500034' },
    { name: 'Kavya Nair - Store Owner', email: 'kavya@storehub.com', address: '34 Connaught Place, Inner Circle, New Delhi 110001' },
    { name: 'Aditya Shah - Store Owner', email: 'aditya.owner@storehub.com', address: '12 Salt Lake Sector V, Kolkata, West Bengal 700091' },
    { name: 'Sneha Kulkarni - Store Owner', email: 'sneha.owner@storehub.com', address: '77 College Road, Nashik, Maharashtra 422005' },
  ];

  const owners: Record<string, any> = {};
  for (const o of ownersData) {
    const ownerUser = await prisma.user.upsert({
      where: { email: o.email },
      update: { role: Role.STORE_OWNER, isActive: true },
      create: {
        name: o.name,
        email: o.email,
        password: defaultPassword,
        address: o.address,
        role: Role.STORE_OWNER,
        isActive: true,
      },
    });
    owners[o.email] = ownerUser;
  }

  // 3. Ensure Indian Customer Accounts
  const customersData = [
    { name: 'Aarav Mehta - Valued Customer', email: 'user1@storehub.com' },
    { name: 'Ananya Sharma - Local Guide', email: 'user2@storehub.com' },
    { name: 'Rohan Patil - Food Enthusiast', email: 'user3@storehub.com' },
    { name: 'Priya Deshmukh - Daily Customer', email: 'user4@storehub.com' },
    { name: 'Sneha Joshi - Verified Reviewer', email: 'user5@storehub.com' },
    { name: 'Rahul Kulkarni - Community Guide', email: 'user6@storehub.com' },
    { name: 'Ishita Shah - Verified Customer', email: 'user7@storehub.com' },
    { name: 'Aditya Verma - Tech Reviewer', email: 'user8@storehub.com' },
    { name: 'Neha Desai - Daily Customer', email: 'user9@storehub.com' },
    { name: 'Vedant More - Retail Guide', email: 'user10@storehub.com' },
  ];

  const customerUsers: any[] = [];
  for (const c of customersData) {
    const cust = await prisma.user.upsert({
      where: { email: c.email },
      update: { isActive: true },
      create: {
        name: c.name,
        email: c.email,
        password: defaultPassword,
        address: 'MG Road, City Center, India',
        role: Role.USER,
        isActive: true,
      },
    });
    customerUsers.push(cust);
  }

  // 4. Ensure 20 Indian Stores
  const storesData = [
    {
      name: 'Deccan Brew House',
      email: 'contact@deccanbrew.in',
      address: 'FC Road, Shivajinagar, Pune, Maharashtra 411004',
      ownerEmail: 'owner2@storehub.com',
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
      ownerEmail: 'owner3@storehub.com',
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
      ownerEmail: 'owner2@storehub.com',
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
      ownerEmail: 'owner1@storehub.com',
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
      ownerEmail: 'owner2@storehub.com',
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
      ownerEmail: 'vikram@storehub.com',
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
      ownerEmail: 'neha@storehub.com',
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
      ownerEmail: 'neha@storehub.com',
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
      ownerEmail: 'owner1@storehub.com',
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
      ownerEmail: 'owner1@storehub.com',
      category: 'Bakery & Sweets',
      description: 'Famous heritage bakery known for mawa cakes, khari biscuits, rusk, and festive sweet boxes.',
      phone: '+91 94220 88990',
      website: 'https://shreeganeshbakery.example.in',
      imageUrl: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Reliance Digital Hub',
      email: 'store.digital@reliancedigital.in',
      address: 'Phoenix Marketcity, Viman Nagar, Pune, Maharashtra 411014',
      ownerEmail: 'aditya.owner@storehub.com',
      category: 'Electronics & Gadgets',
      description: 'Latest smartphones, laptops, smart TVs, home appliances, and expert technical support.',
      phone: '+91 98900 12345',
      website: 'https://reliancedigital.example.in',
      imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Croma Electronics',
      email: 'care@croma.example.in',
      address: 'Koramangala 8th Block, Bengaluru, Karnataka 560095',
      ownerEmail: 'owner3@storehub.com',
      category: 'Electronics & Gadgets',
      description: 'Premier electronics mega store with live demo zones, gadget insurance, and flexible EMI plans.',
      phone: '+91 98450 99887',
      website: 'https://croma.example.in',
      imageUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Vijay Sales Mega Store',
      email: 'info@vijaysales.example.in',
      address: 'Prabhadevi Main Road, Mumbai, Maharashtra 400025',
      ownerEmail: 'neha@storehub.com',
      category: 'Electronics & Gadgets',
      description: 'Trusted multi-brand electronics retailer offering festive deals, extended warranty, and instant delivery.',
      phone: '+91 98200 77665',
      website: 'https://vijaysales.example.in',
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'FabIndia Ethnic Wear',
      email: 'style@fabindia.example.in',
      address: 'Khan Market, New Delhi 110003',
      ownerEmail: 'kavya@storehub.com',
      category: 'Fashion & Apparel',
      description: 'Handcrafted cotton kurtas, silk sarees, sustainable home linen, and organic apparel.',
      phone: '+91 98110 55443',
      website: 'https://fabindia.example.in',
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Manyavar Mohey Ethnic',
      email: 'wedding@manyavar.example.in',
      address: 'JM Road, Deccan Gymkhana, Pune, Maharashtra 411004',
      ownerEmail: 'owner2@storehub.com',
      category: 'Fashion & Apparel',
      description: 'Exclusive wedding sherwanis, lehengas, Indo-western suits, and festive designer menswear.',
      phone: '+91 98230 44332',
      website: 'https://manyavar.example.in',
      imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Zudio Fashion Store',
      email: 'help@zudio.example.in',
      address: 'Aundh Main Road, Pune, Maharashtra 411007',
      ownerEmail: 'sneha.owner@storehub.com',
      category: 'Fashion & Apparel',
      description: 'Trendy, affordable daily fashion apparel, footwear, athleisure, and beauty accessories for youth.',
      phone: '+91 98500 33221',
      website: 'https://zudio.example.in',
      imageUrl: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Apollo Pharmacy & Wellness',
      email: 'care@apollopharmacy.example.in',
      address: 'Law College Road, Erandwane, Pune, Maharashtra 411004',
      ownerEmail: 'sneha.owner@storehub.com',
      category: 'Pharmacy & Wellness',
      description: '24/7 retail pharmacy providing genuine medicines, wellness supplements, personal care, and lab tests.',
      phone: '+91 98600 22110',
      website: 'https://apollopharmacy.example.in',
      imageUrl: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'MedPlus Health Mart',
      email: 'support@medplus.example.in',
      address: 'Hitech City Main Road, Hyderabad, Telangana 500081',
      ownerEmail: 'vikram@storehub.com',
      category: 'Pharmacy & Wellness',
      description: 'Discounted medicines, diagnostic healthcare products, orthopedic care, and baby essentials.',
      phone: '+91 98480 11009',
      website: 'https://medplus.example.in',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Nature Basket Organic Grocery',
      email: 'fresh@naturesbasket.example.in',
      address: 'Bandra West, Hill Road, Mumbai, Maharashtra 400050',
      ownerEmail: 'neha@storehub.com',
      category: 'Supermarkets & Grocery',
      description: 'Gourmet organic produce, imported cheeses, artisan breads, cold-pressed oils, and health foods.',
      phone: '+91 98210 99001',
      website: 'https://naturesbasket.example.in',
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'More Megastore Supermarket',
      email: 'customer.care@moremega.example.in',
      address: 'Sarjapur Main Road, Bengaluru, Karnataka 560102',
      ownerEmail: 'owner3@storehub.com',
      category: 'Supermarkets & Grocery',
      description: 'Complete family supermarket with fresh farm vegetables, daily staples, home essentials, and snacks.',
      phone: '+91 98440 88776',
      website: 'https://moremega.example.in',
      imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=800&auto=format&fit=crop',
    },
  ];

  let storesAddedCount = 0;
  const createdStores: any[] = [];

  for (const s of storesData) {
    const owner = owners[s.ownerEmail] || owners['owner1@storehub.com'] || admin;
    let existingStore = await prisma.store.findFirst({ where: { name: s.name } });

    if (!existingStore) {
      existingStore = await prisma.store.create({
        data: {
          name: s.name,
          email: s.email,
          address: s.address,
          category: s.category,
          description: s.description,
          phone: s.phone,
          website: s.website,
          imageUrl: s.imageUrl,
          isActive: true,
          ownerId: owner.id,
        },
      });
      storesAddedCount++;
    }
    createdStores.push(existingStore);
  }

  // 5. Ensure Demo Ratings
  let ratingsAddedCount = 0;
  const sampleComments = [
    'Outstanding service, top quality products, highly recommend!',
    'Great experience! Staff was very courteous and helpful.',
    'Delicious food and lovely ambience. Will definitely visit again!',
    'Very clean store, good variety, and fair prices.',
    'Prompt service and polite staff. 5 stars!',
    'Excellent value for money and smooth experience.',
    'Good store overall, but wait times during peak hours can be improved.',
    'Fantastic place! Loved the authentic vibes and quality.',
  ];

  if (customerUsers.length > 0 && createdStores.length > 0) {
    for (const store of createdStores) {
      for (let i = 0; i < Math.min(3, customerUsers.length); i++) {
        const user = customerUsers[i];
        const existingRating = await prisma.rating.findFirst({
          where: {
            storeId: store.id,
            userId: user.id,
          },
        });

        if (!existingRating) {
          const score = 4 + (i % 2); // 4 or 5 star
          await prisma.rating.create({
            data: {
              rating: score,
              review: sampleComments[(store.name.length + i) % sampleComments.length],
              storeId: store.id,
              userId: user.id,
            },
          });
          ratingsAddedCount++;
        }
      }
    }
  }

  console.log(`✅ Safe Demo Data Check Complete: Added ${storesAddedCount} stores, ${ratingsAddedCount} ratings.`);
  return { storesAddedCount, ratingsAddedCount };
}
