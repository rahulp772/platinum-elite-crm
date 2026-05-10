#!/usr/bin/env node

require('dotenv').config({ path: require('path').join(__dirname, '..', 'apps', 'backend', '.env') });

const bcrypt = require('bcryptjs');
const pg = require('pg');

const DEMO_PASSWORD = 'Admin@123';

const DEMO_TENANT_NAMES = [
  'MakeItCRM Bharat Realty',
  'Elite India Properties',
  'Apex Bharat Estates',
  'Varanasi Heritage Realty',
  'Mumbai Elite Homes',
];


const BASE_PERMISSIONS = [
  'leads:read', 'leads:write', 'deals:read', 'deals:write',
  'properties:read', 'properties:write', 'tasks:read', 'tasks:write',
  'reports:read', 'settings:write', 'users:read', 'users:write', 'roles:write',
  'chat:read', 'chat:write',
  'builders:read', 'builders:write',
];


async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'menu';

  const config = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'platinum_crm',
  };

  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║              DEMO TENANT MANAGER                              ║');
  console.log('╠═══════════════════════════════════════════════════════════════╣');

  const db = new pg.Client({
    host: config.host,
    port: config.port,
    user: config.username,
    password: config.password,
    database: config.database,
  });

  try {
    await db.connect();

    switch (command) {
      case 'create':
        const count = Math.min(Math.max(parseInt(args[1]) || 1, 1), 5);
        console.log(`║  Creating ${count} demo tenant(s)...                                ║`);
        console.log('╚══════════════════════════════════════════════════════════════════╝');
        await createDemoTenants(db, count);
        break;

      case 'refresh':
        console.log('║  Refreshing demo data...                                     ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝');
        await refreshDemoTenants(db);
        break;

      case 'delete':
        console.log('║  Deleting all demo tenants...                                ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝');
        await deleteDemoTenants(db);
        break;

      case 'status':
        console.log('║  Viewing demo tenant status...                               ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝');
        await showStatus(db);
        break;

      case 'help':
        console.log('║  Available Commands                                          ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝');
        console.log('\n   Usage: node scripts/demo-manager.js <command> [options]');
        console.log('\n   Commands:');
        console.log('     create [n]   Create n demo tenants (default: 1, max: 5)');
        console.log('     refresh      Refresh all demo tenant data');
        console.log('     delete       Delete all demo tenants');
        console.log('     status       Show current demo tenant status');
        console.log('     help         Show this help message');
        console.log('\n   Examples:');
        console.log('     node scripts/demo-manager.js create      # Create 1 tenant');
        console.log('     node scripts/demo-manager.js create 3    # Create 3 tenants');
        console.log('     node scripts/demo-manager.js refresh     # Refresh demo data');
        console.log('     node scripts/demo-manager.js delete      # Delete all demo tenants');
        console.log('     node scripts/demo-manager.js status      # View status\n');
        break;

      default:
        console.log('║  Welcome! Choose an option:                                   ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝');
        console.log('\n   1. Create Demo Tenants (Recommended for first-time setup)');
        console.log('   2. Refresh Demo Data (Reset all demo data to defaults)');
        console.log('   3. Delete Demo Tenants (Clean up all demo data)');
        console.log('   4. View Current Demo Status');
        console.log('   5. Exit');
        console.log('\n   Run with arguments: node scripts/demo-manager.js <command>');
        console.log('   For help: node scripts/demo-manager.js help\n');
    }
  } catch (err) {
    console.error('Error:', err.message);
    console.error('\n   Make sure the database is running and environment variables are set.');
    console.error('   Required: DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE\n');
  } finally {
    await db.end();
  }
}

async function createDemoTenants(db, count) {
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (let i = 1; i <= count; i++) {
    const tenantNum = i <= 5 ? i : 1;
    const tenantName = DEMO_TENANT_NAMES[tenantNum - 1];
    const demoDomain = `demo${i}.com`;

    const existingTenant = await db.query(
      'SELECT id FROM tenants WHERE domain = $1 AND "isDemo" = true',
      [demoDomain]
    );

    if (existingTenant.rows.length > 0) {
      console.log(`   Demo tenant ${demoDomain} already exists, skipping...`);
      continue;
    }

    const tenantResult = await db.query(
      'INSERT INTO tenants (name, domain, "isDemo", timezone) VALUES ($1, $2, true, $3) RETURNING id',
      [`${tenantName} (Demo)`, demoDomain, 'Asia/Kolkata']
    );
    const tenantId = tenantResult.rows[0].id;
    console.log(`   ✅ Created demo tenant: ${tenantName}`);

    const roleDefinitions = [
      { name: 'Admin', level: 100, permissions: BASE_PERMISSIONS },
      { name: 'Manager', level: 80, permissions: [...BASE_PERMISSIONS.filter(p => p !== 'roles:write'), 'users:read', 'users:write'] },
      { name: 'Team Lead', level: 50, permissions: ['leads:read', 'leads:write', 'deals:read', 'deals:write', 'properties:read', 'properties:write', 'tasks:read', 'tasks:write', 'users:read'] },
      { name: 'Agent', level: 10, permissions: ['leads:read', 'leads:write', 'properties:read', 'tasks:read', 'tasks:write'] },
    ];

    const rolesMap = {};
    for (const roleDef of roleDefinitions) {
      const roleResult = await db.query(
        'INSERT INTO roles (name, "tenantId", permissions, "level", "isSystem") VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [roleDef.name, tenantId, JSON.stringify(roleDef.permissions), roleDef.level, roleDef.name === 'Admin']
      );
      rolesMap[roleDef.name] = roleResult.rows[0].id;
    }

    const adminResult = await db.query(
      'INSERT INTO users (email, password, name, "tenantId", "roleId", "isSuperAdmin", timezone, phone, "jobTitle", "isOnboardingComplete") VALUES ($1, $2, $3, $4, $5, false, $6, $7, $8, true) RETURNING id',
      [`admin@${demoDomain}`, hashedPassword, 'Rahul Sharma', tenantId, rolesMap['Admin'], 'Asia/Kolkata', '+91 98765 43210', 'Admin']
    );
    await db.query(
      'INSERT INTO users (email, password, name, "tenantId", "roleId", "isSuperAdmin", timezone, phone, "jobTitle", "isOnboardingComplete") VALUES ($1, $2, $3, $4, $5, false, $6, $7, $8, true) RETURNING id',
      [`manager@${demoDomain}`, hashedPassword, 'Priya Patel', tenantId, rolesMap['Manager'], 'Asia/Kolkata', '+91 98765 43211', 'Manager']
    );

    const teamLeadNames = ['Vikram Singh', 'Anjali Kumar'];
    for (let j = 1; j <= 2; j++) {
      await db.query(
        'INSERT INTO users (email, password, name, "tenantId", "roleId", "isSuperAdmin", timezone, phone, "jobTitle", "isOnboardingComplete") VALUES ($1, $2, $3, $4, $5, false, $6, $7, $8, true)',
        [`lead${j}@${demoDomain}`, hashedPassword, teamLeadNames[j-1], tenantId, rolesMap['Team Lead'], 'Asia/Kolkata', `+91 98765 ${43220 + j}`, 'Team Lead']
      );
    }

    const agentNames = ['Amit Gupta', 'Sneha Reddy', 'Raj Malhotra', 'Kavita Singh'];
    for (let j = 1; j <= 4; j++) {
      await db.query(
        'INSERT INTO users (email, password, name, "tenantId", "roleId", "isSuperAdmin", timezone, phone, "jobTitle", "isOnboardingComplete") VALUES ($1, $2, $3, $4, $5, false, $6, $7, $8, true)',
        [`agent${j}@${demoDomain}`, hashedPassword, agentNames[j-1], tenantId, rolesMap['Agent'], 'Asia/Kolkata', `+91 98765 ${43230 + j}`, 'Real Estate Agent']
      );
    }

    console.log(`   ✅ Created users: admin@${demoDomain}, manager@${demoDomain}, leads, agents`);

    await seedDemoData(db, tenantId);
  }

  console.log('✅ Demo tenant(s) created successfully!');
  console.log(`   Login credentials: admin@demo1.com / ${DEMO_PASSWORD}`);
  console.log(`                      manager@demo1.com / ${DEMO_PASSWORD}`);
  console.log(`                      agent1@demo1.com / ${DEMO_PASSWORD}`);
}

async function seedDemoData(db, tenantId) {
  console.log(`   📊 Seeding demo data...`);

  const agents = await db.query(
    'SELECT id FROM users WHERE "tenantId" = $1 AND email LIKE \'agent%@demo%.com\'',
    [tenantId]
  );
  const allUsers = await db.query('SELECT id FROM users WHERE "tenantId" = $1', [tenantId]);

  const agentIds = agents.rows.map(r => r.id);
  const userIds = allUsers.rows.map(r => r.id);

  // Dynamic counts for this tenant (50-100 range)
  const propertyCount = 50 + Math.floor(Math.random() * 51);
  const leadCount = 80 + Math.floor(Math.random() * 71);
  const taskCount = 60 + Math.floor(Math.random() * 61);
  const dealCount = 15 + Math.floor(Math.random() * 16);

  const MS_IN_DAY = 24 * 60 * 60 * 1000;
  const THREE_MONTHS_MS = 90 * MS_IN_DAY;
  const FOUR_MONTHS_MS = 120 * MS_IN_DAY;


  if (agentIds.length === 0) {
    console.log(`   ⚠️  No agents found for demo data seeding`);
    return;
  }

  // Seed Builders
  const buildersData = [
    { name: 'Sobha Realty', description: 'One of the most respected developers in India, known for high quality.', website: 'https://www.sobha.com', headquarters: 'Bangalore' },
    { name: 'DLF Limited', description: 'Leading commercial and residential developer with projects across India.', website: 'https://www.dlf.in', headquarters: 'Gurugram' },
    { name: 'Godrej Properties', description: 'Bringing the Godrej Group philosophy of innovation, sustainability, and excellence.', website: 'https://www.godrejproperties.com', headquarters: 'Mumbai' },
    { name: 'Lodha Group', description: 'Premier real estate developer in Mumbai and London.', website: 'https://www.lodhagroup.in', headquarters: 'Mumbai' },
    { name: 'Prestige Group', description: 'Leading property developers in South India.', website: 'https://www.prestigeconstructions.com', headquarters: 'Bangalore' },
  ];

  const builderIds = [];
  for (const b of buildersData) {
    const result = await db.query(
      'INSERT INTO builders (name, description, website, headquarters, "tenantId", "totalProjects", "completedProjects") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [b.name, b.description, b.website, b.headquarters, tenantId, 15 + Math.floor(Math.random() * 10), 10 + Math.floor(Math.random() * 5)]
    );
    builderIds.push(result.rows[0].id);
  }
  console.log(`      - Created 5 builders`);


  const propertyData = [
    { title: 'Sobha Zenith Luxury Apartment', price: 25000000, type: 'apartment', beds: 3, baths: 3, sqft: 1850, city: 'Gurugram', state: 'Haryana', rera: 'HRERA-PKL-78-2023', ratePerSqft: 13514 },
    { title: 'DLF The Aralias', price: 150000000, type: 'house', beds: 4, baths: 5, sqft: 5000, city: 'Gurugram', state: 'Haryana', rera: 'HRERA-PKL-12-2022', ratePerSqft: 30000 },
    { title: 'Godrej Skyview Highrise', price: 18000000, type: 'apartment', beds: 2, baths: 2, sqft: 1250, city: 'Mumbai', state: 'Maharashtra', rera: 'P51800001234', ratePerSqft: 14400 },
    { title: 'Lodha World One Residence', price: 85000000, type: 'condo', beds: 3, baths: 4, sqft: 2800, city: 'Mumbai', state: 'Maharashtra', rera: 'P51900000001', ratePerSqft: 30357 },
    { title: 'Prestige Lakeside Habitat', price: 21000000, type: 'apartment', beds: 3, baths: 3, sqft: 1650, city: 'Bangalore', state: 'Karnataka', rera: 'PRM/KA/RERA/1251/446/PR/170915', ratePerSqft: 12727 },
    { title: 'Modern Studio in Pune', price: 6500000, type: 'apartment', beds: 1, baths: 1, sqft: 650, city: 'Pune', state: 'Maharashtra', rera: 'P52100000111', ratePerSqft: 10000 },
    { title: 'Spacious Row House', price: 32000000, type: 'townhouse', beds: 4, baths: 4, sqft: 3200, city: 'Noida', state: 'Uttar Pradesh', rera: 'UPRERAPRJ1234', ratePerSqft: 10000 },
    { title: 'Executive Villa in Hyderabad', price: 55000000, type: 'house', beds: 5, baths: 5, sqft: 4500, city: 'Hyderabad', state: 'Telangana', rera: 'P02400001234', ratePerSqft: 12222 },
    { title: 'Chennai Coastal Apartment', price: 12000000, type: 'apartment', beds: 2, baths: 2, sqft: 1100, city: 'Chennai', state: 'Tamil Nadu', rera: 'TN/01/Building/0001/2023', ratePerSqft: 10909 },
    { title: 'Kolkata Heritage Estate', price: 28000000, type: 'house', beds: 4, baths: 3, sqft: 2600, city: 'Kolkata', state: 'West Bengal', rera: 'WBRERA/P/KOL/2023/000123', ratePerSqft: 10769 },
    // Land/Plot type properties (5 samples)
    { title: 'G Square Orchid Ville Plots', price: 26000000, type: 'land', beds: null, baths: null, sqft: 2400, city: 'Chennai', state: 'Tamil Nadu', rera: 'TN/29/Layout/0227/2022', totalLandArea: 4.68, unitCount: 31, minPlotSize: 2400, maxPlotSize: 3045, ratePerSqft: 10833, dtcpApproval: 'CMDA', constructionStatus: 'Ready to Construct' },
    { title: 'Emerald River Plots', price: 15000000, type: 'land', beds: null, baths: null, sqft: 1800, city: 'Bangalore', state: 'Karnataka', rera: 'PRM/KA/RERA/1251/447', totalLandArea: 2.5, unitCount: 15, minPlotSize: 1200, maxPlotSize: 2400, ratePerSqft: 8333, dtcpApproval: 'DTCP', constructionStatus: 'Ready to Construct' },
    { title: 'Coastal Paradise Township', price: 8500000, type: 'land', beds: null, baths: null, sqft: 1000, city: 'Mumbai', state: 'Maharashtra', rera: 'P51800005678', totalLandArea: 10.5, unitCount: 85, minPlotSize: 1000, maxPlotSize: 2000, ratePerSqft: 8500, dtcpApproval: 'DTCP & RERA', constructionStatus: 'Under Construction' },
    { title: 'Sunrise Valley Plots', price: 4500000, type: 'land', beds: null, baths: null, sqft: 800, city: 'Pune', state: 'Maharashtra', rera: 'P52100004567', totalLandArea: 1.8, unitCount: 22, minPlotSize: 800, maxPlotSize: 1500, ratePerSqft: 5625, dtcpApproval: 'CMDA', constructionStatus: 'Ready to Construct' },
    { title: 'Green Valley Residential Plots', price: 12000000, type: 'land', beds: null, baths: null, sqft: 2000, city: 'Hyderabad', state: 'Telangana', rera: 'P02400006789', totalLandArea: 3.2, unitCount: 20, minPlotSize: 2000, maxPlotSize: 3000, ratePerSqft: 6000, dtcpApproval: 'DTCP & RERA', constructionStatus: 'Ready to Construct' },
  ];


  const sampleImages = [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
  ];

  const propertyIds = [];
  for (let i = 0; i < propertyCount; i++) {
    const data = propertyData[i % propertyData.length];
    const agentId = agentIds[Math.floor(Math.random() * agentIds.length)];
    const builderId = builderIds[Math.floor(Math.random() * builderIds.length)];
    
    // Randomize titles slightly
    const variations = ['Classic', 'Elite', 'Premium', 'Royal', 'Grand', 'Supreme'];
    const title = variations[Math.floor(Math.random() * variations.length)] + ' ' + data.title + ' ' + (i + 1);

    // Assign different images based on index
    const startIdx = (i * 2) % sampleImages.length;
    const propertyImages = sampleImages.slice(startIdx, startIdx + 4);
    if (propertyImages.length < 4) {
      propertyImages.push(...sampleImages.slice(0, 4 - propertyImages.length));
    }

    const listedDate = new Date(Date.now() - (Math.random() * FOUR_MONTHS_MS));
    const ratePerSqft = data.ratePerSqft || Math.round(data.price / data.sqft);
    const computedCarpetArea = data.beds ? data.sqft * 0.8 : null;
    const computedBasePrice = data.price * 0.9;

    const result = await db.query(
      `INSERT INTO properties (title, description, price, status, type, address, city, state, "zipCode", bedrooms, bathrooms, sqft, "yearBuilt", images, features, "agentId", "tenantId", "reraNumber", "builderId", "carpetArea", "basePrice", "pricePerSqft", "totalLandArea", "unitCount", "minPlotSize", "maxPlotSize", "ratePerSqft", "dtcpApproval", "constructionStatus", listed) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15::jsonb, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30) RETURNING id`,
      [
        title,
        data.type === 'land' 
          ? `Premium residential plot in ${data.city}, ${data.state}. CMDA approved gated community with world-class amenities. Excellent connectivity and location.`
          : `Beautiful ${title} in ${data.city}, ${data.state}. High quality finishes and prime location.`,
        data.price + (Math.floor(Math.random() * 20 - 10) * 100000),
        Math.random() > 0.3 ? 'available' : Math.random() > 0.5 ? 'pending' : 'sold',
        data.type,
        `${Math.floor(Math.random() * 999) + 1} Park Street`,
        data.city,
        data.state,
        String(110001 + Math.floor(Math.random() * 9000)),
        data.beds || null,
        data.baths || null,
        data.sqft,
        data.type !== 'land' ? 2010 + Math.floor(Math.random() * 15) : null,
        propertyImages.join(','),
        data.type === 'land' 
          ? JSON.stringify(['24x7 Security', 'CCTV Surveillance', 'Black Top Roads', 'Street Lights', 'Rain Water Harvesting', 'Garden', 'Play Area', 'Clubhouse'])
          : JSON.stringify(['Gated Community', 'Power Backup', 'Security', 'Clubhouse']),
        agentId,
        tenantId,
        data.rera + '-' + (i + 100),
        builderId,
        computedCarpetArea,
        computedBasePrice,
        ratePerSqft,
        data.totalLandArea || null,
        data.unitCount || null,
        data.minPlotSize || null,
        data.maxPlotSize || null,
        ratePerSqft,
        data.dtcpApproval || null,
        data.constructionStatus || null,
        listedDate
      ]
    );
    propertyIds.push(result.rows[0].id);
  }

  // Create floor plans for land/plot type properties
  console.log('      - Creating floor plans for plot properties...');
  const floorPlanTemplates = [
    { plotSize: 1000, price: 8500000, label: 'Type A' },
    { plotSize: 1200, price: 10200000, label: 'Type B' },
    { plotSize: 1500, price: 12750000, label: 'Type C' },
    { plotSize: 1800, price: 15300000, label: 'Type D' },
    { plotSize: 2000, price: 17000000, label: 'Type E' },
    { plotSize: 2400, price: 20400000, label: 'Type F' },
    { plotSize: 3000, price: 25500000, label: 'Type G' },
    { plotSize: 3045, price: 25900000, label: 'Premium' },
  ];

  // Get all land type property IDs
  const landPropertyIds = [];
  for (let i = 0; i < propertyCount; i++) {
    const data = propertyData[i % propertyData.length];
    if (data.type === 'land') {
      landPropertyIds.push(propertyIds[i]);
    }
  }

  // Insert floor plans for land properties
  for (const propId of landPropertyIds) {
    const numFloorPlans = 3 + Math.floor(Math.random() * 3); // 3-5 floor plans per property
    const shuffled = floorPlanTemplates.sort(() => 0.5 - Math.random());
    
    for (let j = 0; j < numFloorPlans; j++) {
      const fp = shuffled[j];
      await db.query(
        `INSERT INTO floor_plans ("propertyId", "plotSize", "price", label, "tenantId") VALUES ($1, $2, $3, $4, $5)`,
        [propId, fp.plotSize, fp.price, fp.label, tenantId]
      );
    }
  }

  // Create nearby infrastructure for properties
  console.log('      - Creating nearby infrastructure...');
  const nearbyInfrastructureData = [
    // Schools
    { category: 'school', name: 'Delhi Public School', distance: '2 km' },
    { category: 'school', name: 'KV Army School', distance: '3 km' },
    { category: 'school', name: 'Mount Carmel College', distance: '1.5 km' },
    { category: 'school', name: 'Little Flowers School', distance: '800 m' },
    // Hospitals
    { category: 'hospital', name: 'Apollo Hospital', distance: '4 km' },
    { category: 'hospital', name: 'Fortis Healthcare', distance: '5 km' },
    { category: 'hospital', name: 'Medanta Hospital', distance: '6 km' },
    { category: 'hospital', name: 'City Hospital', distance: '1 km' },
    // Transit
    { category: 'transit', name: 'Metro Station', distance: '1 km' },
    { category: 'transit', name: 'Bus Stand', distance: '500 m' },
    { category: 'transit', name: 'Railway Station', distance: '3 km' },
    { category: 'transit', name: 'Airport', distance: '15 km' },
    // Restaurants
    { category: 'restaurant', name: 'The Taj Hotel', distance: '5 km' },
    { category: 'restaurant', name: 'Dominos Pizza', distance: '1 km' },
    { category: 'restaurant', name: 'Hotel Udupi', distance: '800 m' },
    // Shopping
    { category: 'shopping', name: 'Mall of India', distance: '3 km' },
    { category: 'shopping', name: 'Local Market', distance: '500 m' },
    { category: 'shopping', name: 'Reliance Fresh', distance: '1 km' },
    // Resorts
    { category: 'resort', name: 'Beach Resort', distance: '8 km' },
    { category: 'resort', name: 'Hill View Resort', distance: '12 km' },
  ];

  // Add nearby infrastructure for land properties (showcase feature)
  for (const propId of landPropertyIds) {
    const numEntries = 5 + Math.floor(Math.random() * 6); // 5-10 entries per property
    const shuffled = nearbyInfrastructureData.sort(() => 0.5 - Math.random());
    
    for (let j = 0; j < numEntries; j++) {
      const ni = shuffled[j];
      await db.query(
        `INSERT INTO nearby_infrastructures ("propertyId", category, name, distance, "tenantId") VALUES ($1, $2, $3, $4, $5)`,
        [propId, ni.category, ni.name, ni.distance, tenantId]
      );
    }
  }

  const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth'];
  const lastNames = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Patel', 'Reddy', 'Iyer', 'Nair', 'Chopra', 'Malhotra'];
  const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Gurugram'];

  const statuses = ['new', 'contacted', 'qualified', 'interested', 'negotiation'];
  const sources = ['website', 'referral', 'social', 'cold_call'];

  for (let i = 0; i < leadCount; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const userId = userIds[Math.floor(Math.random() * userIds.length)];
    const budgetMin = Math.floor(Math.random() * 10 + 1) * 100000;
    const budgetMax = budgetMin + Math.floor(Math.random() * 5 + 2) * 100000;
    const createdAt = new Date(Date.now() - (Math.random() * THREE_MONTHS_MS));
    const lastContact = new Date(createdAt.getTime() + (Math.random() * (Date.now() - createdAt.getTime())));

    await db.query(
      `INSERT INTO leads (name, email, phone, status, source, "budgetMin", "budgetMax", "preferredLocation", "propertyType", notes, "assignedToId", "tenantId", "lastContact", "builderId", "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,


      [
        `${firstName} ${lastName}`,
        `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
        `+1 ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        statuses[Math.floor(Math.random() * statuses.length)],
        sources[Math.floor(Math.random() * sources.length)],
        budgetMin,
        budgetMax,
        locations[Math.floor(Math.random() * locations.length)],
        ['1 BHK', '2 BHK', '3 BHK', 'Penthouse', 'Villa'][Math.floor(Math.random() * 5)],
        `Interested in real estate. Budget: $${budgetMin.toLocaleString()}-$${budgetMax.toLocaleString()}`,
        userId,
        tenantId,
        lastContact,
        Math.random() > 0.4 ? builderIds[Math.floor(Math.random() * builderIds.length)] : null,
        createdAt
      ]
    );
  }



  const stages = ['lead', 'negotiation', 'under_contract', 'closed'];
  const priorities = ['low', 'medium', 'high'];
  const customerNames = ['Alice Freeman', 'Bob Miller', 'Carol Smith', 'David Johnson', 'Emma Wilson', 'Frank Brown', 'Grace Lee', 'Henry Davis', 'Ivy Martinez', 'Jack Garcia'];

  for (let i = 0; i < dealCount; i++) {
    const userId = userIds[Math.floor(Math.random() * userIds.length)];
    const propId = propertyIds[Math.floor(Math.random() * propertyIds.length)];
    const createdAt = new Date(Date.now() - (Math.random() * THREE_MONTHS_MS));
    const customerName = customerNames[i % customerNames.length] + ' ' + (i + 1);

    await db.query(
      `INSERT INTO deals (title, value, stage, "customerName", "customerEmail", "propertyId", "agentId", "tenantId", priority, "expectedCloseDate", "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,

      [
        `Property Purchase - Deal ${i + 1}`,
        500000 + Math.floor(Math.random() * 3000000),
        stages[Math.floor(Math.random() * stages.length)],
        customerName,
        `${customerName.toLowerCase().replace(' ', '.')}@email.com`,
        propId,
        userId,
        tenantId,
        priorities[Math.floor(Math.random() * priorities.length)],
        new Date(Date.now() + Math.random() * 90 * MS_IN_DAY),
        createdAt
      ]
    );
  }


  const taskTitles = [
    'Call lead about property viewing', 'Follow up on pending deal', 'Prepare contract for closing',
    'Schedule property tour', 'Send market analysis report', 'Review offers with client',
    'Update CRM with new lead info', 'Prepare listing presentation', 'Schedule open house event',
    'Follow up on site visit feedback', 'Negotiate terms with buyer', 'Review inspection report',
    'Update property listing details', 'Schedule team meeting', 'Prepare marketing materials'
  ];
  const types = ['call', 'email', 'meeting', 'deadline', 'todo'];

  for (let i = 0; i < taskCount; i++) {
    const userId = userIds[Math.floor(Math.random() * userIds.length)];
    const createdAt = new Date(Date.now() - (Math.random() * THREE_MONTHS_MS));
    const dueDate = new Date(createdAt.getTime() + (Math.random() * (FOUR_MONTHS_MS)));

    await db.query(
      `INSERT INTO tasks (title, description, status, priority, type, "dueDate", "assignedToId", "createdById", "tenantId", "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,

      [
        taskTitles[i % taskTitles.length],
        `Task details for ${taskTitles[i % taskTitles.length]}. Follow up required.`,
        i < 12 ? 'todo' : i < 17 ? 'in_progress' : 'done',
        priorities[Math.floor(Math.random() * priorities.length)],
        types[Math.floor(Math.random() * types.length)],
        new Date(Date.now() + (Math.random() * 30 - 5) * 24 * 60 * 60 * 1000),
        userId,
        userId,
        tenantId,
        createdAt
      ]
    );
  }

  console.log(`      - Created ${propertyCount} properties, ${leadCount} leads, ${dealCount} deals, ${taskCount} tasks`);
}


async function refreshDemoTenants(db) {
  const tenants = await db.query('SELECT id, name FROM tenants WHERE "isDemo" = true');

  if (tenants.rows.length === 0) {
    console.log('\n   No demo tenants found to refresh.');
    console.log('   Run: node scripts/demo-manager.js create\n');
    return;
  }

  for (const tenant of tenants.rows) {
    console.log(`   Refreshing ${tenant.name}...`);

    await db.query('DELETE FROM messages WHERE "tenantId" = $1', [tenant.id]);
    await db.query('DELETE FROM conversations WHERE "tenantId" = $1', [tenant.id]);
    await db.query('DELETE FROM tasks WHERE "tenantId" = $1', [tenant.id]);
    await db.query('DELETE FROM deals WHERE "tenantId" = $1', [tenant.id]);
    await db.query('DELETE FROM leads WHERE "tenantId" = $1', [tenant.id]);
    await db.query('DELETE FROM properties WHERE "tenantId" = $1', [tenant.id]);
    await db.query('DELETE FROM builders WHERE "tenantId" = $1', [tenant.id]);


    await seedDemoData(db, tenant.id);
  }

  console.log('✅ Demo tenants refreshed successfully!');
}

async function deleteDemoTenants(db) {
  const tenants = await db.query('SELECT id, name FROM tenants WHERE "isDemo" = true');

  if (tenants.rows.length === 0) {
    console.log('\n   No demo tenants found to delete.\n');
    return;
  }

  for (const tenant of tenants.rows) {
    console.log(`   Deleting ${tenant.name}...`);
    await db.query('DELETE FROM messages WHERE "tenantId" = $1', [tenant.id]);
    await db.query('DELETE FROM conversations WHERE "tenantId" = $1', [tenant.id]);
    await db.query('DELETE FROM tasks WHERE "tenantId" = $1', [tenant.id]);
    await db.query('DELETE FROM deals WHERE "tenantId" = $1', [tenant.id]);
    await db.query('DELETE FROM leads WHERE "tenantId" = $1', [tenant.id]);
    await db.query('DELETE FROM properties WHERE "tenantId" = $1', [tenant.id]);
    await db.query('DELETE FROM builders WHERE "tenantId" = $1', [tenant.id]);

    await db.query('DELETE FROM users WHERE "tenantId" = $1', [tenant.id]);
    await db.query('DELETE FROM roles WHERE "tenantId" = $1', [tenant.id]);
    await db.query('DELETE FROM tenants WHERE id = $1', [tenant.id]);
  }

  console.log('✅ All demo tenants deleted successfully!');
}

async function showStatus(db) {
  const tenants = await db.query('SELECT name, domain, "createdAt" FROM tenants WHERE "isDemo" = true');

  if (tenants.rows.length === 0) {
    console.log('\n   No demo tenants found.');
    console.log('   Run: node scripts/demo-manager.js create [1-5]\n');
  } else {
    console.log('\n   Demo Tenants:');
    for (const tenant of tenants.rows) {
      console.log(`   - ${tenant.name} (${tenant.domain}) - Created: ${new Date(tenant.createdAt).toLocaleDateString()}`);
    }
    console.log('\n   Credentials (all use password: ' + DEMO_PASSWORD + '):');
    console.log('   - admin@demo1.com    (Admin role)');
    console.log('   - manager@demo1.com (Manager role)');
    console.log('   - lead1@demo1.com   (Team Lead role)');
    console.log('   - agent1@demo1.com  (Agent role)\n');
  }
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});