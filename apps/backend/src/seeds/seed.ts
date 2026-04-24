import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not, IsNull } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { Lead } from '../leads/entities/lead.entity';
import { LeadStatus, LeadSource } from '../leads/enums/lead.enum';
import { Property } from '../properties/entities/property.entity';
import { PropertyStatus, PropertyType } from '../properties/enums/property.enum';
import { Deal } from '../deals/entities/deal.entity';
import { DealStage, DealPriority } from '../deals/enums/deal.enum';
import { Task } from '../tasks/entities/task.entity';
import { TaskStatus, TaskPriority, TaskType } from '../tasks/enums/task.enum';
import { Team } from '../teams/entities/team.entity';
import { Conversation } from '../chat/entities/conversation.entity';
import { Message } from '../chat/entities/message.entity';

const BASE_PERMISSIONS = [
  'leads:read',
  'leads:write',
  'deals:read',
  'deals:write',
  'properties:read',
  'properties:write',
  'tasks:read',
  'tasks:write',
  'reports:read',
  'settings:write',
  'users:read',
  'users:write',
  'roles:write',
];

const DEMO_TENANT_NAMES = [
  'Platinum Elite Realty',
  'Luxury Homes Global',
  'Apex Properties',
  'Skyline Estates',
  'Royal Heritage Realty',
];

const DEMO_PASSWORD = 'Admin@123';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @InjectRepository(Deal)
    private dealRepository: Repository<Deal>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private dataSource: DataSource,
  ) {}

  async seed() {
    console.log('🌱 Starting database seed...');
    await this.seedTenantsAndRoles();
    await this.seedSuperAdmin();
    await this.seedLeads();
    console.log('✅ Seed completed successfully!');
  }

  async seedDemoTenants(count: number = 1) {
    console.log(`🌱 Creating ${count} demo tenant(s)...`);

    for (let i = 1; i <= count; i++) {
      const tenantNum = i <= 5 ? i : 1;
      const tenantName = DEMO_TENANT_NAMES[tenantNum - 1];
      const demoDomain = `demo${i}.com`;

      const existingTenant = await this.tenantRepository.findOne({
        where: { domain: demoDomain, isDemo: true },
      });
      
      if (existingTenant) {
        console.log(`   Demo tenant ${demoDomain} already exists, skipping...`);
        continue;
      }

      const tenant = this.tenantRepository.create({
        name: `${tenantName} (Demo)`,
        domain: demoDomain,
        isDemo: true,
      });
      await this.tenantRepository.save(tenant);
      console.log(`   ✅ Created demo tenant: ${tenantName}`);

      const roleDefinitions = [
        { name: 'Admin', level: 100, permissions: BASE_PERMISSIONS },
        { name: 'Manager', level: 80, permissions: [
          ...BASE_PERMISSIONS.filter((p) => p !== 'roles:write'),
          'users:read',
          'users:write',
        ]},
        { name: 'Team Lead', level: 50, permissions: [
          'leads:read',
          'leads:write',
          'deals:read',
          'deals:write',
          'properties:read',
          'properties:write',
          'tasks:read',
          'tasks:write',
          'users:read',
        ]},
        { name: 'Agent', level: 10, permissions: [
          'leads:read',
          'leads:write',
          'properties:read',
          'tasks:read',
          'tasks:write',
        ]},
      ];

      const rolesMap: Record<string, Role> = {};
      for (const roleDef of roleDefinitions) {
        const role = this.roleRepository.create({
          ...roleDef,
          tenantId: tenant.id,
          isSystem: roleDef.name === 'Admin',
        });
        await this.roleRepository.save(role);
        rolesMap[roleDef.name] = role;
      }

      const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

      const admin = this.userRepository.create({
        email: `admin@${demoDomain}`,
        password: hashedPassword,
        name: 'Admin User',
        tenantId: tenant.id,
        roleId: rolesMap['Admin'].id,
        isSuperAdmin: false,
      });
      await this.userRepository.save(admin);

      const manager = this.userRepository.create({
        email: `manager@${demoDomain}`,
        password: hashedPassword,
        name: 'Manager User',
        tenantId: tenant.id,
        roleId: rolesMap['Manager'].id,
        isSuperAdmin: false,
      });
      await this.userRepository.save(manager);

      const teamLeads: User[] = [];
      for (let j = 1; j <= 2; j++) {
        const lead = this.userRepository.create({
          email: `lead${j}@${demoDomain}`,
          password: hashedPassword,
          name: `Team Lead ${j}`,
          tenantId: tenant.id,
          roleId: rolesMap['Team Lead'].id,
          isSuperAdmin: false,
        });
        await this.userRepository.save(lead);
        teamLeads.push(lead);
      }

      const agents: User[] = [];
      for (let j = 1; j <= 4; j++) {
        const agent = this.userRepository.create({
          email: `agent${j}@${demoDomain}`,
          password: hashedPassword,
          name: `Agent ${j}`,
          tenantId: tenant.id,
          roleId: rolesMap['Agent'].id,
          isSuperAdmin: false,
        });
        await this.userRepository.save(agent);
        agents.push(agent);
      }

      console.log(`   ✅ Created users: admin@${demoDomain}, manager@${demoDomain}, leads, agents`);

      await this.seedDemoData(tenant.id, [...teamLeads, ...agents]);

      const team1 = this.teamRepository.create({
        name: 'Sales Team A',
        tenantId: tenant.id,
        teamLeadId: teamLeads[0].id,
      });
      await this.teamRepository.save(team1);
    }

    console.log('✅ Demo tenant(s) created successfully!');
    console.log(`   Login credentials: admin@demo1.com / ${DEMO_PASSWORD}`);
    console.log(`                or: manager@demo1.com / ${DEMO_PASSWORD}`);
    console.log(`                or: agent1@demo1.com / ${DEMO_PASSWORD}`);
  }

  private async seedDemoData(tenantId: string, users: User[]) {
    console.log(`   📊 Seeding demo data for tenant ${tenantId}...`);

    const allUsers = users;
    const agents = users.filter(u => u.email.includes('agent'));

    const properties = await this.createDemoProperties(tenantId, agents);
    await this.createDemoLeads(tenantId, allUsers);
    await this.createDemoDeals(tenantId, properties, allUsers);
    await this.createDemoTasks(tenantId, allUsers);
    await this.createDemoConversations(tenantId, allUsers);

    console.log(`   ✅ Demo data seeded successfully`);
  }

  private async createDemoProperties(tenantId: string, agents: User[]): Promise<Property[]> {
    const propertyData = [
      { title: 'Modern Downtown Apartment', price: 850000, type: PropertyType.APARTMENT, beds: 2, baths: 2, sqft: 1200, city: 'Manhattan', state: 'NY', features: ['Gym', 'Pool', 'Doorman'], images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00'] },
      { title: 'Luxury Waterfront Villa', price: 4500000, type: PropertyType.HOUSE, beds: 5, baths: 6, sqft: 5200, city: 'Miami', state: 'FL', features: ['Pool', 'Ocean View', 'Private Dock'], images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811'] },
      { title: 'Cozy Urban Studio', price: 325000, type: PropertyType.APARTMENT, beds: 1, baths: 1, sqft: 650, city: 'Brooklyn', state: 'NY', features: ['Rooftop', 'Laundry'], images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'] },
      { title: 'Spacious Family Home', price: 875000, type: PropertyType.HOUSE, beds: 4, baths: 3, sqft: 2800, city: 'Westchester', state: 'NY', features: ['Backyard', 'Garage', 'Fireplace'], images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994'] },
      { title: 'Penthouse Suite', price: 2200000, type: PropertyType.CONDO, beds: 3, baths: 3, sqft: 2400, city: 'Manhattan', state: 'NY', features: ['Terrace', 'Concierge', 'Gym'], images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c'] },
      { title: 'Charming Townhouse', price: 975000, type: PropertyType.TOWNHOUSE, beds: 3, baths: 2, sqft: 2200, city: 'Brooklyn', state: 'NY', features: ['Garden', 'Exposed Brick'], images: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914'] },
      { title: 'Modern Loft', price: 695000, type: PropertyType.APARTMENT, beds: 2, baths: 2, sqft: 1600, city: 'Queens', state: 'NY', features: ['High Ceilings', 'Parking'], images: ['https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3'] },
      { title: 'Waterfront Condo', price: 1150000, type: PropertyType.CONDO, beds: 2, baths: 2, sqft: 1450, city: 'Jersey City', state: 'NJ', features: ['Marina', 'Pool', 'Balcony'], images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c'] },
      { title: 'Historic Brownstone', price: 1650000, type: PropertyType.TOWNHOUSE, beds: 4, baths: 3, sqft: 3100, city: 'Manhattan', state: 'NY', features: ['Garden', 'Original Details'], images: ['https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde'] },
      { title: 'Suburban Ranch', price: 545000, type: PropertyType.HOUSE, beds: 3, baths: 2, sqft: 1650, city: 'Hoboken', state: 'NJ', features: ['Backyard', 'Garage'], images: ['https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea'] },
      { title: 'Commercial Space', price: 2500000, type: PropertyType.COMMERCIAL, beds: 0, baths: 2, sqft: 4500, city: 'Manhattan', state: 'NY', features: ['Parking', 'Loading Dock'], images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab'] },
      { title: 'Executive Estate', price: 3500000, type: PropertyType.HOUSE, beds: 6, baths: 7, sqft: 8500, city: 'Greenwich', state: 'CT', features: ['Pool', 'Wine Cellar', 'Theater'], images: ['https://images.unsplash.com/photo-1600047509358-9dc75507daeb'] },
    ];

    const properties: Property[] = [];
    for (const data of propertyData) {
      const agent = agents[Math.floor(Math.random() * agents.length)];
      const prop = this.propertyRepository.create({
        title: data.title,
        description: `Beautiful ${data.title} in ${data.city}, ${data.state}. A stunning property with modern amenities.`,
        price: data.price,
        status: Math.random() > 0.2 ? PropertyStatus.AVAILABLE : PropertyStatus.PENDING,
        type: data.type,
        address: `${Math.floor(Math.random() * 999) + 1} ${['Main', 'Oak', 'Park', 'Lake', 'Hill'][Math.floor(Math.random() * 5)]} Street`,
        city: data.city,
        state: data.state,
        zipCode: String(10000 + Math.floor(Math.random() * 90000)),
        bedrooms: data.beds,
        bathrooms: data.baths,
        sqft: data.sqft,
        yearBuilt: 1990 + Math.floor(Math.random() * 35),
        images: data.images,
        features: data.features,
        agent: agent,
        tenantId: tenantId,
      } as any);
      const savedProp = await this.propertyRepository.save(prop);
      const savedProperty = Array.isArray(savedProp) ? savedProp[0] : savedProp;
      properties.push(savedProperty);
    }

    console.log(`      - Created ${properties.length} properties`);
    return properties;
  }

  private async createDemoLeads(tenantId: string, users: User[]) {
    const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Sarah', 'Jessica', 'Thomas', 'Karen'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Anderson', 'Taylor', 'Wilson', 'Thomas', 'Moore', 'Jackson'];
    const locations = ['Manhattan, NY', 'Brooklyn, NY', 'Queens, NY', 'Miami, FL', 'Los Angeles, CA', 'Chicago, IL', 'San Francisco, CA', 'Boston, MA'];
    const sources = [LeadSource.WEBSITE, LeadSource.REFERRAL, LeadSource.SOCIAL, LeadSource.COLD_CALL];
    const statuses = [LeadStatus.NEW, LeadStatus.CONTACTED, LeadStatus.QUALIFIED, LeadStatus.INTERESTED, LeadStatus.NEGOTIATION];

    for (let i = 0; i < 50; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const budgetMin = Math.floor(Math.random() * 10 + 1) * 100000;
      const budgetMax = budgetMin + Math.floor(Math.random() * 5 + 2) * 100000;

      const lead = this.leadRepository.create({
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
        phone: `+1 (${Math.floor(Math.random() * 900 + 100)}) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
        budgetMin,
        budgetMax,
        preferredLocation: locations[Math.floor(Math.random() * locations.length)],
        propertyType: ['Apartment', 'House', 'Condo', 'Townhouse'][Math.floor(Math.random() * 4)],
        notes: `Interested in real estate. Budget: $${budgetMin.toLocaleString()}-$${budgetMax.toLocaleString()}`,
        assignedToId: user.id,
        tenantId: tenantId,
        lastContact: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        followUpAt: Math.random() > 0.3 ? new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000) : null,
      } as any);
      await this.leadRepository.save(lead);
    }

    console.log(`      - Created 50 leads`);
  }

  private async createDemoDeals(tenantId: string, properties: Property[], users: User[]) {
    const stages = [DealStage.LEAD, DealStage.NEGOTIATION, DealStage.UNDER_CONTRACT, DealStage.CLOSED];
    const priorities = [DealPriority.LOW, DealPriority.MEDIUM, DealPriority.HIGH];
    const customerNames = ['Alice Freeman', 'Bob Miller', 'Carol Smith', 'David Johnson', 'Emma Wilson', 'Frank Brown', 'Grace Lee', 'Henry Davis', 'Ivy Martinez', 'Jack Garcia'];
    
    const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];

    for (let i = 0; i < 10; i++) {
      const prop = properties[Math.floor(Math.random() * Math.min(properties.length, 5))];
      const user = users[Math.floor(Math.random() * users.length)];
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

      const deal = this.dealRepository.create({
        title: `${prop.title} - Purchase`,
        value: prop.price * (0.9 + Math.random() * 0.2),
        stage: stages[Math.floor(Math.random() * stages.length)],
        customerName: customerNames[i] || `${firstName} ${lastName}`,
        customerEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
        property: prop,
        agent: user,
        tenantId: tenantId,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        expectedCloseDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000),
      } as any);
      await this.dealRepository.save(deal);
    }

    console.log(`      - Created 10 deals`);
  }

  private async createDemoTasks(tenantId: string, users: User[]) {
    const taskTitles = [
      'Call lead about property viewing',
      'Follow up on pending deal',
      'Prepare contract for closing',
      'Schedule property tour',
      'Send market analysis report',
      'Review offers with client',
      'Update CRM with new lead info',
      'Prepare listing presentation',
      'Coordinate with mortgage broker',
      'Schedule open house event',
      'Follow up on site visit feedback',
      'Negotiate terms with buyer',
      'Review inspection report',
      'Update property listing details',
      'Schedule team meeting',
      'Prepare marketing materials',
      'Contact new leads from website',
      'Review pending contracts',
      'Schedule appraisal appointment',
      'Follow up on loan approval',
    ];

    const types = [TaskType.CALL, TaskType.EMAIL, TaskType.MEETING, TaskType.DEADLINE, TaskType.TODO];
    const statuses = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE];
    const priorities = [TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH];

    for (let i = 0; i < 20; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const status = i < 12 ? statuses[0] : i < 17 ? statuses[1] : statuses[2];

      const task = this.taskRepository.create({
        title: taskTitles[i % taskTitles.length],
        description: `Task details for ${taskTitles[i % taskTitles.length]}. Follow up required.`,
        status: status,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        type: types[Math.floor(Math.random() * types.length)],
        dueDate: new Date(Date.now() + (Math.random() * 30 - 5) * 24 * 60 * 60 * 1000),
        assignedToId: user.id,
        createdById: user.id,
        tenantId: tenantId,
      } as any);
      await this.taskRepository.save(task);
    }

    console.log(`      - Created 20 tasks`);
  }

  private async createDemoConversations(tenantId: string, users: User[]) {
    if (users.length < 2) return;

    const subjectOptions = [
      'Quick question about the downtown property',
      'Following up on our meeting',
      'New lead from website',
      'Contract review request',
      'Schedule viewing for client',
    ];

    for (let i = 0; i < 3; i++) {
      const user1 = users[Math.floor(Math.random() * users.length)];
      let user2 = users[Math.floor(Math.random() * users.length)];
      while (user2.id === user1.id && users.length > 1) {
        user2 = users[Math.floor(Math.random() * users.length)];
      }

      const conv = this.conversationRepository.create({
        tenantId: tenantId,
      });
      await this.conversationRepository.save(conv);

      const message1 = this.messageRepository.create({
        content: `Hi! ${subjectOptions[i]}. Let me know when you're available to discuss.`,
        senderId: user1.id,
        conversationId: conv.id,
        tenantId: tenantId,
        read: true,
      });
      await this.messageRepository.save(message1);

      const message2 = this.messageRepository.create({
        content: 'Sure, I can help with that. How about a call this afternoon?',
        senderId: user2.id,
        conversationId: conv.id,
        tenantId: tenantId,
        read: false,
      });
      await this.messageRepository.save(message2);
    }

    console.log(`      - Created 3 conversations`);
  }

  async refreshDemoTenants() {
    console.log('🔄 Refreshing demo tenant data...');

    const demoTenants = await this.tenantRepository.find({
      where: { isDemo: true },
    });

    for (const tenant of demoTenants) {
      console.log(`   Refreshing ${tenant.name}...`);

      await this.clearTenantData(tenant.id);

      const users = await this.userRepository.find({
        where: { tenantId: tenant.id },
      });

      if (users.length > 0) {
        await this.seedDemoData(tenant.id, users);
      }
    }

    console.log('✅ Demo tenants refreshed successfully!');
  }

  async deleteDemoTenants() {
    console.log('🗑️  Deleting demo tenants...');

    const demoTenants = await this.tenantRepository.find({
      where: { isDemo: true },
    });

    for (const tenant of demoTenants) {
      console.log(`   Deleting ${tenant.name}...`);
      await this.clearTenantData(tenant.id);
      await this.tenantRepository.delete(tenant.id);
    }

    console.log('✅ All demo tenants deleted successfully!');
  }

  async clearTenantData(tenantId: string) {
    await this.messageRepository.delete({ tenantId });
    await this.conversationRepository.delete({ tenantId });
    await this.taskRepository.delete({ tenantId });
    await this.dealRepository.delete({ tenantId });
    await this.leadRepository.delete({ tenantId });
    await this.propertyRepository.delete({ tenantId });
    await this.teamRepository.delete({ tenantId });
    await this.userRepository.delete({ tenantId });
    await this.roleRepository.delete({ tenantId });
  }

  async getDemoTenants() {
    return this.tenantRepository.find({
      where: { isDemo: true },
    });
  }

  private async clearDatabase() {
    console.log('🧹 Clearing database...');

    await this.dataSource.query('DELETE FROM messages');
    await this.dataSource.query('DELETE FROM conversations');
    await this.dataSource.query('DELETE FROM property_favorites');
    await this.dataSource.query('DELETE FROM tasks');
    await this.dataSource.query('DELETE FROM deals');
    await this.dataSource.query('DELETE FROM leads');
    await this.dataSource.query('DELETE FROM properties');
    await this.dataSource.query('DELETE FROM users');
    await this.dataSource.query('DELETE FROM roles');
    await this.dataSource.query('DELETE FROM tenants');

    console.log('   Database cleared.');
  }

  private async seedTenantsAndRoles() {
    console.log('🏢 Creating tenants, roles, and users...');

    const TENANTS = [
      { name: 'Platinum Elite Realty', domain: 'platinum-elite.com' },
      { name: 'Luxury Homes Global', domain: 'luxury-homes.com' },
      { name: 'Apex Properties', domain: 'apex-props.com' },
      { name: 'Skyline Estates', domain: 'skyline-estates.com' },
      { name: 'Royal Heritage Realty', domain: 'royal-heritage.com' },
    ];

    const roleDefinitions = [
      {
        name: 'Admin',
        level: 100,
        permissions: BASE_PERMISSIONS,
        isSystem: true,
      },
      {
        name: 'Manager',
        level: 80,
        permissions: [
          ...BASE_PERMISSIONS.filter((p) => p !== 'roles:write'),
          'users:read',
          'users:write',
        ],
        isSystem: false,
      },
      {
        name: 'Team Lead',
        level: 50,
        permissions: [
          'leads:read',
          'leads:write',
          'deals:read',
          'deals:write',
          'properties:read',
          'properties:write',
          'tasks:read',
          'tasks:write',
          'users:read',
        ],
        isSystem: false,
      },
      {
        name: 'Agent',
        level: 10,
        permissions: [
          'leads:read',
          'leads:write',
          'properties:read',
          'tasks:read',
          'tasks:write',
        ],
        isSystem: false,
      },
    ];

    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    for (const tenantData of TENANTS) {
      const tenant = this.tenantRepository.create(tenantData);
      await this.tenantRepository.save(tenant);
      console.log(`   Created tenant: ${tenant.name}`);

      const rolesMap: Record<string, Role> = {};
      for (const roleDef of roleDefinitions) {
        const role = this.roleRepository.create({
          ...roleDef,
          description: `${roleDef.name} role for ${tenant.name}`,
          tenantId: tenant.id,
        });
        await this.roleRepository.save(role);
        rolesMap[roleDef.name] = role;
      }

      const adminUser = this.userRepository.create({
        email: `admin@${tenantData.domain}`,
        password: hashedPassword,
        name: `${tenantData.name} Admin`,
        tenantId: tenant.id,
        roleId: rolesMap['Admin'].id,
        isSuperAdmin: false,
      });
      await this.userRepository.save(adminUser);

      const managerUser = this.userRepository.create({
        email: `manager@${tenantData.domain}`,
        password: hashedPassword,
        name: `${tenantData.name} Manager`,
        tenantId: tenant.id,
        roleId: rolesMap['Manager'].id,
        isSuperAdmin: false,
      });
      await this.userRepository.save(managerUser);

      for (let i = 1; i <= 2; i++) {
        const teamLead = this.userRepository.create({
          email: `lead${i}@${tenantData.domain}`,
          password: hashedPassword,
          name: `Team Lead ${i}`,
          tenantId: tenant.id,
          roleId: rolesMap['Team Lead'].id,
          isSuperAdmin: false,
        });
        await this.userRepository.save(teamLead);
      }

      for (let i = 1; i <= 4; i++) {
        const agent = this.userRepository.create({
          email: `agent${i}@${tenantData.domain}`,
          password: hashedPassword,
          name: `Agent ${i}`,
          tenantId: tenant.id,
          roleId: rolesMap['Agent'].id,
          isSuperAdmin: false,
        });
        await this.userRepository.save(agent);
      }

      console.log(`   Created 8 users for ${tenant.name}`);
    }

    console.log('   Tenants, roles, and users seeded.');
  }

  private async seedSuperAdmin() {
    console.log('👑 Creating super admin...');

    const superAdminRole = this.roleRepository.create({
      name: 'Super Admin',
      description: 'System-wide admin access',
      permissions: BASE_PERMISSIONS,
      isSystem: true,
      level: 200,
      tenantId: null as any,
    });
    await this.roleRepository.save(superAdminRole);

    const hashedPassword = await bcrypt.hash('admin@123', 10);
    const superAdmin = this.userRepository.create({
      email: 'admin@crm.com',
      password: hashedPassword,
      name: 'Super Admin',
      isSuperAdmin: true,
      roleId: superAdminRole.id,
    });
    await this.userRepository.save(superAdmin);

    console.log('   Created super admin: admin@crm.com / admin@123');
  }

  private async seedLeads() {
    console.log('📇 Seeding leads...');

    const tenants = await this.tenantRepository.find();
    const users = await this.userRepository.find({
      where: { tenantId: Not(IsNull()) },
    });
    const tenantId = tenants[0].id;

    const firstNames = [
      'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer',
      'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara',
      'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah',
      'Charles', 'Karen', 'Daniel', 'Nancy', 'Matthew', 'Lisa',
    ];
    const lastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia',
      'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez',
      'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore',
      'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
    ];
    const locations = [
      'Manhattan, NY', 'Brooklyn, NY', 'Queens, NY', 'Bronx, NY',
      'Los Angeles, CA', 'Miami, FL', 'Chicago, IL', 'San Francisco, CA',
    ];

    for (let i = 0; i < 60; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const budgetMin = Math.floor(Math.random() * 10 + 1) * 100000;
      const budgetMax = budgetMin + Math.floor(Math.random() * 5 + 1) * 100000;
      const assignedTo = users.length > 0 ? users[Math.floor(Math.random() * users.length)] : null;
      const hasFollowUp = Math.random() > 0.5;

      const leadData: Partial<Lead> = {
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
        phone: `+1 (${Math.floor(Math.random() * 900 + 100)}) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        status: [LeadStatus.NEW, LeadStatus.CONTACTED, LeadStatus.QUALIFIED, LeadStatus.INTERESTED, LeadStatus.LOST][Math.floor(Math.random() * 5)],
        source: [LeadSource.WEBSITE, LeadSource.REFERRAL, LeadSource.SOCIAL, LeadSource.COLD_CALL][Math.floor(Math.random() * 4)],
        budgetMin,
        budgetMax,
        preferredLocation: location,
        propertyType: ['Apartment', 'House', 'Condo', 'Townhouse'][Math.floor(Math.random() * 4)],
        notes: `Interested in ${location}. Budget: ₹${budgetMin.toLocaleString()}-₹${budgetMax.toLocaleString()}.`,
        assignedToId: assignedTo?.id || undefined,
        tenantId,
        lastContact: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        followUpAt: hasFollowUp ? new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
      };

      await this.leadRepository.save(leadData);
    }

    console.log(`   Created 60 leads`);
  }
}