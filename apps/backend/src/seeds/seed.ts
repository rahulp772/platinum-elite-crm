import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not, IsNull } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { Lead } from '../leads/entities/lead.entity';
import { LeadStatus, LeadSource } from '../leads/enums/lead.enum';

const TENANTS = [
  { name: 'Platinum Elite Realty', domain: 'platinum-elite.com' },
  { name: 'Luxury Homes Global', domain: 'luxury-homes.com' },
  { name: 'Apex Properties', domain: 'apex-props.com' },
  { name: 'Skyline Estates', domain: 'skyline-estates.com' },
  { name: 'Royal Heritage Realty', domain: 'royal-heritage.com' },
];

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

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    private dataSource: DataSource,
  ) {}

  async onModuleInit() {
    console.log('=== RUNNING SEED ON STARTUP ===');
    // await this.seed();
  }

  async seed() {
    console.log('🌱 Starting database seed...');

    await this.clearDatabase();
    await this.seedTenantsAndRoles();
    await this.seedSuperAdmin();
    await this.seedLeads();

    console.log('✅ Seed completed successfully!');
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

      // Create 1 Admin
      const adminUser = this.userRepository.create({
        email: `admin@${tenantData.domain}`,
        password: hashedPassword,
        name: `${tenantData.name} Admin`,
        tenantId: tenant.id,
        roleId: rolesMap['Admin'].id,
        isSuperAdmin: false,
      });
      await this.userRepository.save(adminUser);

      // Create 1 Manager
      const managerUser = this.userRepository.create({
        email: `manager@${tenantData.domain}`,
        password: hashedPassword,
        name: `${tenantData.name} Manager`,
        tenantId: tenant.id,
        roleId: rolesMap['Manager'].id,
        isSuperAdmin: false,
      });
      await this.userRepository.save(managerUser);

      // Create 2 Team Leads
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

      // Create 4 Agents
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
      'James',
      'Mary',
      'John',
      'Patricia',
      'Robert',
      'Jennifer',
      'Michael',
      'Linda',
      'William',
      'Elizabeth',
      'David',
      'Barbara',
      'Richard',
      'Susan',
      'Joseph',
      'Jessica',
      'Thomas',
      'Sarah',
      'Charles',
      'Karen',
      'Daniel',
      'Nancy',
      'Matthew',
      'Lisa',
      'Anthony',
      'Betty',
      'Mark',
      'Margaret',
      'Steven',
      'Sandra',
      'Paul',
      'Ashley',
      'Andrew',
      'Kimberly',
      'Joshua',
      'Emily',
      'Kenneth',
      'Donna',
      'Kevin',
      'Carol',
      'Brian',
      'Michelle',
      'George',
      'Dorothy',
      'Edward',
      'Carolyn',
      'Ronald',
      'Judith',
      'Timothy',
      'Ruth',
      'Jason',
      'Cynthia',
    ];
    const lastNames = [
      'Smith',
      'Johnson',
      'Williams',
      'Brown',
      'Jones',
      'Garcia',
      'Miller',
      'Davis',
      'Rodriguez',
      'Martinez',
      'Hernandez',
      'Lopez',
      'Gonzalez',
      'Wilson',
      'Anderson',
      'Thomas',
      'Taylor',
      'Moore',
      'Jackson',
      'Martin',
      'Lee',
      'Perez',
      'Thompson',
      'White',
      'Harris',
      'Sanchez',
      'Clark',
      'Ramirez',
      'Lewis',
      'Robinson',
      'Walker',
      'Young',
      'Allen',
      'King',
      'Wright',
      'Scott',
      'Torres',
      'Nguyen',
      'Hill',
      'Flores',
      'Green',
      'Adams',
      'Nelson',
      'Baker',
      'Hall',
      'Rivera',
      'Campbell',
      'Mitchell',
      'Carter',
      'Roberts',
    ];
    const locations = [
      'Manhattan, NY',
      'Brooklyn, NY',
      'Queens, NY',
      'Bronx, NY',
      'Staten Island, NY',
      'Los Angeles, CA',
      'Miami, FL',
      'Chicago, IL',
      'San Francisco, CA',
      'Boston, MA',
      'Seattle, WA',
      'Austin, TX',
      'Denver, CO',
      'Phoenix, AZ',
      'Las Vegas, NV',
    ];
    const propertyTypes = [
      'Apartment',
      'House',
      'Condo',
      'Townhouse',
      'Penthouse',
      'Commercial',
    ];
    const sources = [
      LeadSource.WEBSITE,
      LeadSource.REFERRAL,
      LeadSource.SOCIAL,
      LeadSource.COLD_CALL,
      LeadSource.EVENT,
    ];
    const statuses = [
      LeadStatus.NEW,
      LeadStatus.CONTACTED,
      LeadStatus.QUALIFIED,
      LeadStatus.INTERESTED,
      LeadStatus.NOT_INTERESTED,
      LeadStatus.LOST,
    ];

    for (let i = 0; i < 60; i++) {
      const firstName =
        firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const propertyType =
        propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
      const source = sources[Math.floor(Math.random() * sources.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const budgetMin = Math.floor(Math.random() * 10 + 1) * 100000;
      const budgetMax = budgetMin + Math.floor(Math.random() * 5 + 1) * 100000;
      const assignedTo =
        users.length > 0
          ? users[Math.floor(Math.random() * users.length)]
          : null;
      const hasFollowUp = Math.random() > 0.5;
      const followUpAt = hasFollowUp
        ? new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000)
        : undefined;

      const leadData: Partial<Lead> = {
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
        phone: `+1 (${Math.floor(Math.random() * 900 + 100)}) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        status,
        source,
        budgetMin,
        budgetMax,
        preferredLocation: location,
        propertyType,
        notes: `Interested in ${propertyType} in ${location}. Budget: ₹${budgetMin.toLocaleString()}-₹${budgetMax.toLocaleString()}.`,
        assignedToId: assignedTo?.id || undefined,
        tenantId,
        lastContact: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        ),
        followUpAt,
      };

      await this.leadRepository.save(leadData);
    }

    console.log(`   Created ${60} leads`);
  }
}
