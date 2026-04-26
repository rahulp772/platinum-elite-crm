#!/usr/bin/env node

require('dotenv').config({ path: require('path').join(__dirname, '..', 'apps', 'backend', '.env') });

const bcrypt = require('bcryptjs');
const pg = require('pg');

const DEMO_PASSWORD = 'Admin@123';

const DEMO_TENANT_NAMES = [
  'Platinum Elite Realty',
  'Luxury Homes Global',
  'Apex Properties',
  'Skyline Estates',
  'Royal Heritage Realty',
];

const BASE_PERMISSIONS = [
  'leads:read', 'leads:write', 'deals:read', 'deals:write',
  'properties:read', 'properties:write', 'tasks:read', 'tasks:write',
  'reports:read', 'settings:write', 'users:read', 'users:write', 'roles:write',
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
      'INSERT INTO tenants (name, domain, "isDemo") VALUES ($1, $2, true) RETURNING id',
      [`${tenantName} (Demo)`, demoDomain]
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
      'INSERT INTO users (email, password, name, "tenantId", "roleId", "isSuperAdmin", timezone) VALUES ($1, $2, $3, $4, $5, false, $6) RETURNING id',
      [`admin@${demoDomain}`, hashedPassword, 'Admin User', tenantId, rolesMap['Admin'], 'Asia/Kolkata']
    );
    await db.query(
      'INSERT INTO users (email, password, name, "tenantId", "roleId", "isSuperAdmin", timezone) VALUES ($1, $2, $3, $4, $5, false, $6) RETURNING id',
      [`manager@${demoDomain}`, hashedPassword, 'Manager User', tenantId, rolesMap['Manager'], 'Asia/Kolkata']
    );

    for (let j = 1; j <= 2; j++) {
      await db.query(
        'INSERT INTO users (email, password, name, "tenantId", "roleId", "isSuperAdmin", timezone) VALUES ($1, $2, $3, $4, $5, false, $6)',
        [`lead${j}@${demoDomain}`, hashedPassword, `Team Lead ${j}`, tenantId, rolesMap['Team Lead'], 'Asia/Kolkata']
      );
    }

    for (let j = 1; j <= 4; j++) {
      await db.query(
        'INSERT INTO users (email, password, name, "tenantId", "roleId", "isSuperAdmin", timezone) VALUES ($1, $2, $3, $4, $5, false, $6)',
        [`agent${j}@${demoDomain}`, hashedPassword, `Agent ${j}`, tenantId, rolesMap['Agent'], 'Asia/Kolkata']
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

  if (agentIds.length === 0) {
    console.log(`   ⚠️  No agents found for demo data seeding`);
    return;
  }

  const propertyData = [
    { title: 'Modern Downtown Apartment', price: 850000, type: 'apartment', beds: 2, baths: 2, sqft: 1200, city: 'Manhattan', state: 'NY', features: ['Gym', 'Pool', 'Doorman'] },
    { title: 'Luxury Waterfront Villa', price: 4500000, type: 'house', beds: 5, baths: 6, sqft: 5200, city: 'Miami', state: 'FL', features: ['Pool', 'Ocean View'] },
    { title: 'Cozy Urban Studio', price: 325000, type: 'apartment', beds: 1, baths: 1, sqft: 650, city: 'Brooklyn', state: 'NY', features: ['Rooftop', 'Laundry'] },
    { title: 'Spacious Family Home', price: 875000, type: 'house', beds: 4, baths: 3, sqft: 2800, city: 'Westchester', state: 'NY', features: ['Backyard', 'Garage'] },
    { title: 'Penthouse Suite', price: 2200000, type: 'condo', beds: 3, baths: 3, sqft: 2400, city: 'Manhattan', state: 'NY', features: ['Terrace', 'Concierge'] },
    { title: 'Charming Townhouse', price: 975000, type: 'townhouse', beds: 3, baths: 2, sqft: 2200, city: 'Brooklyn', state: 'NY', features: ['Garden', 'Exposed Brick'] },
    { title: 'Modern Loft', price: 695000, type: 'apartment', beds: 2, baths: 2, sqft: 1600, city: 'Queens', state: 'NY', features: ['High Ceilings'] },
    { title: 'Waterfront Condo', price: 1150000, type: 'condo', beds: 2, baths: 2, sqft: 1450, city: 'Jersey City', state: 'NJ', features: ['Marina', 'Pool'] },
    { title: 'Historic Brownstone', price: 1650000, type: 'townhouse', beds: 4, baths: 3, sqft: 3100, city: 'Manhattan', state: 'NY', features: ['Garden'] },
    { title: 'Suburban Ranch', price: 545000, type: 'house', beds: 3, baths: 2, sqft: 1650, city: 'Hoboken', state: 'NJ', features: ['Backyard'] },
    { title: 'Commercial Space', price: 2500000, type: 'commercial', beds: 0, baths: 2, sqft: 4500, city: 'Manhattan', state: 'NY', features: ['Parking'] },
    { title: 'Executive Estate', price: 3500000, type: 'house', beds: 6, baths: 7, sqft: 8500, city: 'Greenwich', state: 'CT', features: ['Pool', 'Wine Cellar'] },
  ];

  const propertyIds = [];
  for (const data of propertyData) {
    const agentId = agentIds[Math.floor(Math.random() * agentIds.length)];
    const result = await db.query(
      `INSERT INTO properties (title, description, price, status, type, address, city, state, "zipCode", bedrooms, bathrooms, sqft, "yearBuilt", images, features, "agentId", "tenantId") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING id`,
      [
        data.title,
        `Beautiful ${data.title} in ${data.city}, ${data.state}.`,
        data.price,
        Math.random() > 0.2 ? 'available' : 'pending',
        data.type,
        `${Math.floor(Math.random() * 999) + 1} Main Street`,
        data.city,
        data.state,
        String(10000 + Math.floor(Math.random() * 90000)),
        data.beds,
        data.baths,
        data.sqft,
        1990 + Math.floor(Math.random() * 35),
        JSON.stringify(['https://images.unsplash.com/photo-1568605114967-8130f3a36994']),
        JSON.stringify(data.features),
        agentId,
        tenantId
      ]
    );
    propertyIds.push(result.rows[0].id);
  }

  const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  const locations = ['Manhattan, NY', 'Brooklyn, NY', 'Queens, NY', 'Miami, FL', 'Los Angeles, CA'];
  const statuses = ['new', 'contacted', 'qualified', 'interested', 'negotiation'];
  const sources = ['website', 'referral', 'social', 'cold_call'];

  for (let i = 0; i < 50; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const userId = userIds[Math.floor(Math.random() * userIds.length)];
    const budgetMin = Math.floor(Math.random() * 10 + 1) * 100000;
    const budgetMax = budgetMin + Math.floor(Math.random() * 5 + 2) * 100000;

    await db.query(
      `INSERT INTO leads (name, email, phone, status, source, "budgetMin", "budgetMax", "preferredLocation", "propertyType", notes, "assignedToId", "tenantId", "lastContact") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
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
        new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      ]
    );
  }

  const stages = ['lead', 'negotiation', 'under_contract', 'closed'];
  const priorities = ['low', 'medium', 'high'];
  const customerNames = ['Alice Freeman', 'Bob Miller', 'Carol Smith', 'David Johnson', 'Emma Wilson', 'Frank Brown', 'Grace Lee', 'Henry Davis', 'Ivy Martinez', 'Jack Garcia'];

  for (let i = 0; i < 10; i++) {
    const userId = userIds[Math.floor(Math.random() * userIds.length)];
    const propId = propertyIds[Math.floor(Math.random() * Math.min(propertyIds.length, 5))];

    await db.query(
      `INSERT INTO deals (title, value, stage, "customerName", "customerEmail", "propertyId", "agentId", "tenantId", priority, "expectedCloseDate") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        `Property Purchase - Deal ${i + 1}`,
        500000 + Math.floor(Math.random() * 3000000),
        stages[Math.floor(Math.random() * stages.length)],
        customerNames[i],
        `${customerNames[i].toLowerCase().replace(' ', '.')}@email.com`,
        propId,
        userId,
        tenantId,
        priorities[Math.floor(Math.random() * priorities.length)],
        new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000)
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

  for (let i = 0; i < 20; i++) {
    const userId = userIds[Math.floor(Math.random() * userIds.length)];

    await db.query(
      `INSERT INTO tasks (title, description, status, priority, type, "dueDate", "assignedToId", "createdById", "tenantId") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        taskTitles[i % taskTitles.length],
        `Task details for ${taskTitles[i % taskTitles.length]}. Follow up required.`,
        i < 12 ? 'todo' : i < 17 ? 'in_progress' : 'done',
        priorities[Math.floor(Math.random() * priorities.length)],
        types[Math.floor(Math.random() * types.length)],
        new Date(Date.now() + (Math.random() * 30 - 5) * 24 * 60 * 60 * 1000),
        userId,
        userId,
        tenantId
      ]
    );
  }

  console.log(`      - Created 12 properties, 50 leads, 10 deals, 20 tasks`);
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