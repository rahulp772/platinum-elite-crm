import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not, IsNull } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { AgentProfile } from '../users/entities/agent-profile.entity';
import { Lead } from '../leads/entities/lead.entity';
import { LeadStatus, LeadSource } from '../leads/enums/lead.enum';
import { Property } from '../properties/entities/property.entity';
import {
  PropertyStatus,
  PropertyType,
} from '../properties/enums/property.enum';
import { Deal } from '../deals/entities/deal.entity';
import { Task } from '../tasks/entities/task.entity';
import { TaskStatus, TaskPriority, TaskType } from '../tasks/enums/task.enum';
import { Builder } from '../builders/entities/builder.entity';

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
  'chat:read',
  'chat:write',
];

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(AgentProfile)
    private agentProfileRepository: Repository<AgentProfile>,
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @InjectRepository(Deal)
    private dealRepository: Repository<Deal>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Builder)
    private builderRepository: Repository<Builder>,
    private dataSource: DataSource,
  ) {}

  async seed() {
    console.log('🌱 Starting database seed...');
    await this.seedTenantsAndRoles();
    await this.seedSuperAdmin();
    await this.seedBuilders();
    await this.seedLeads();
    await this.seedProperties();
    await this.seedTasks();
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
    await this.dataSource.query('DELETE FROM builders');

    await this.dataSource.query('DELETE FROM agent_profiles');

    await this.dataSource.query('DELETE FROM users');
    await this.dataSource.query('DELETE FROM roles');
    await this.dataSource.query('DELETE FROM tenants');
    console.log('   Database cleared.');
  }

  private async seedTenantsAndRoles() {
    console.log('🏢 Creating tenants, roles, and users...');

    const TENANTS = [
      { name: 'MakeItCRM Realty', domain: 'makeitcrm.com' },
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

      const teamLeadUsers: User[] = [];
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
        teamLeadUsers.push(teamLead);
      }

      const agentUsers: User[] = [];
      for (let i = 1; i <= 4; i++) {
        const name = i === 1 ? 'Anjali Sharma' : `Agent ${i}`;
        const email =
          i === 1
            ? `anjali@${tenantData.domain}`
            : `agent${i}@${tenantData.domain}`;
        const agent = this.userRepository.create({
          email,
          password: hashedPassword,
          name,
          tenantId: tenant.id,
          roleId: rolesMap['Agent'].id,
          isSuperAdmin: false,
        });
        const savedAgent = await this.userRepository.save(agent);

        const profile = this.agentProfileRepository.create({
          userId: savedAgent.id,
          experienceLevel: i === 1 ? 'senior' : i === 2 ? 'mid' : 'junior',
          closingRate:
            i === 1 ? 65 : i === 2 ? 45 : Math.floor(Math.random() * 30 + 10),
          activeLeadCount: 0,
          locationSpecializations:
            i === 1 ? ['Manhattan, NY', 'Brooklyn, NY'] : [],
          budgetSpecializations: i === 1 ? ['5000000-15000000'] : [],
        });
        await this.agentProfileRepository.save(profile);

        agentUsers.push(savedAgent);
      }

      console.log(`   Created 8 users for ${tenant.name} (includes Anjali)`);
    }

    console.log('   Tenants, roles, and users seeded.');
  }

  private async seedBuilders() {
    console.log('🏢 Seeding Indian builders...');
    const tenants = await this.tenantRepository.find();
    const tenantId = tenants[0].id;

    const BUILDERS = [
      {
        name: 'Sobha Realty',
        description:
          'International luxury real estate developer with a reputation for quality.',
        website: 'https://www.sobharealty.com',
        foundedYear: 1976,
        headquarters: 'Dubai / Bangalore',
        totalProjects: 150,
        completedProjects: 120,
        ongoingProjects: 30,
        logo: 'https://api.dicebear.com/7.x/initials/svg?seed=Sobha',
      },
      {
        name: 'DLF Limited',
        description: 'One of the largest real estate developers in India.',
        website: 'https://www.dlf.in',
        foundedYear: 1946,
        headquarters: 'New Delhi',
        totalProjects: 200,
        completedProjects: 180,
        ongoingProjects: 20,
        logo: 'https://api.dicebear.com/7.x/initials/svg?seed=DLF',
      },
      {
        name: 'Godrej Properties',
        description:
          'Brings the Godrej Group philosophy of innovation, sustainability, and excellence to the real estate industry.',
        website: 'https://www.godrejproperties.com',
        foundedYear: 1990,
        headquarters: 'Mumbai',
        totalProjects: 120,
        completedProjects: 80,
        ongoingProjects: 40,
        logo: 'https://api.dicebear.com/7.x/initials/svg?seed=Godrej',
      },
      {
        name: 'Lodha Group',
        description: "India's No.1 real estate developer by residential sales.",
        website: 'https://www.lodhagroup.in',
        foundedYear: 1980,
        headquarters: 'Mumbai',
        totalProjects: 100,
        completedProjects: 70,
        ongoingProjects: 30,
        logo: 'https://api.dicebear.com/7.x/initials/svg?seed=Lodha',
      },
      {
        name: 'Prestige Group',
        description: 'Leading real estate developer in South India.',
        website: 'https://www.prestigeconstructions.com',
        foundedYear: 1986,
        headquarters: 'Bangalore',
        totalProjects: 250,
        completedProjects: 210,
        ongoingProjects: 40,
        logo: 'https://api.dicebear.com/7.x/initials/svg?seed=Prestige',
      },
    ];

    for (const builderData of BUILDERS) {
      const builder = this.builderRepository.create({
        ...builderData,
        tenantId,
      });
      await this.builderRepository.save(builder);
    }
    console.log(`   Seeded ${BUILDERS.length} builders.`);
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
    const builders = await this.builderRepository.find();
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
    ];
    const locations = [
      'Gurugram',
      'Mumbai',
      'Bangalore',
      'Pune',
      'Noida',
      'Hyderabad',
      'Chennai',
      'Kolkata',
    ];

    for (let i = 0; i < 60; i++) {
      const firstName =
        firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const budgetMin = Math.floor(Math.random() * 10 + 1) * 100000;
      const budgetMax = budgetMin + Math.floor(Math.random() * 5 + 1) * 100000;
      const assignedTo =
        users.length > 0
          ? users[Math.floor(Math.random() * users.length)]
          : null;
      const hasFollowUp = Math.random() > 0.5;
      const builderId =
        Math.random() > 0.3
          ? builders[Math.floor(Math.random() * builders.length)].id
          : undefined;

      const leadData: Partial<Lead> = {
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
        phone: `+1 (${Math.floor(Math.random() * 900 + 100)}) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        status: [
          LeadStatus.NEW,
          LeadStatus.CONTACTED,
          LeadStatus.QUALIFIED,
          LeadStatus.INTERESTED,
          LeadStatus.LOST,
        ][Math.floor(Math.random() * 5)],
        source: [
          LeadSource.WEBSITE,
          LeadSource.REFERRAL,
          LeadSource.SOCIAL,
          LeadSource.COLD_CALL,
        ][Math.floor(Math.random() * 4)],
        budgetMin,
        budgetMax,
        preferredLocation: location,
        propertyType: ['Apartment', 'House', 'Condo', 'Townhouse'][
          Math.floor(Math.random() * 4)
        ],
        notes: `Interested in ${location}. Budget: ₹${budgetMin.toLocaleString()}-₹${budgetMax.toLocaleString()}.`,
        assignedToId: assignedTo?.id || undefined,
        tenantId,
        lastContact: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        ),
        followUpAt: hasFollowUp
          ? new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000)
          : undefined,
        builderId,
      };

      await this.leadRepository.save(leadData);
    }

    console.log(`   Created 60 leads`);
  }

  private async seedProperties() {
    console.log('🏠 Seeding properties...');

    const tenants = await this.tenantRepository.find();
    const users = await this.userRepository.find({
      where: { tenantId: Not(IsNull()) },
    });
    const builders = await this.builderRepository.find();
    const tenantId = tenants[0].id;
    const agent = users.find((u) => u.name === 'Anjali Sharma') || users[0];

    const sampleImages = [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      'https://images.unsplash.com/photo-1600210492493-0946911120ea?w=800',
      'https://images.unsplash.com/photo-1600573472591-ee6981cf81c0?w=800',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
    ];

    const properties = [
      {
        title: 'Sobha Zenith Sector 89',
        description:
          'Luxury 3 BHK apartment with world-class amenities and premium finishes.',
        price: 25000000,
        status: PropertyStatus.AVAILABLE,
        type: PropertyType.APARTMENT,
        address: 'Sector 89, New Gurgaon',
        city: 'Gurugram',
        state: 'Haryana',
        zipCode: '122001',
        bedrooms: 3,
        bathrooms: 3,
        sqft: 1850,
        carpetArea: 1250,
        superBuiltUpArea: 1850,
        reraNumber: 'RC/REP/HARERA/GGM/789/2024',
        reraAuthority: 'HARERA',
        constructionStatus: 'Under Construction',
        possessionDate: new Date('2026-12-31'),
        builderId: builders.find((b) => b.name === 'Sobha Realty')?.id,
        images: sampleImages.slice(0, 4),
        views: 450,
      },
      {
        title: 'DLF Ultima Phase 2',
        description:
          'Premium living in the heart of Gurgaon with lush green surroundings.',
        price: 32000000,
        status: PropertyStatus.AVAILABLE,
        type: PropertyType.APARTMENT,
        address: 'Sector 81, DLF Gardencity',
        city: 'Gurugram',
        state: 'Haryana',
        zipCode: '122004',
        bedrooms: 4,
        bathrooms: 4,
        sqft: 2200,
        carpetArea: 1600,
        superBuiltUpArea: 2200,
        reraNumber: 'RC/REP/HARERA/GGM/456/2023',
        reraAuthority: 'HARERA',
        constructionStatus: 'Ready to Move',
        possessionDate: new Date('2024-06-01'),
        builderId: builders.find((b) => b.name === 'DLF Limited')?.id,
        images: sampleImages.slice(2, 6),
        views: 890,
      },
      {
        title: 'Godrej Woodsman Estate',
        description: 'Experience the forest-themed luxury living in Bangalore.',
        price: 18000000,
        status: PropertyStatus.AVAILABLE,
        type: PropertyType.APARTMENT,
        address: 'Hebbal',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560024',
        bedrooms: 3,
        bathrooms: 2,
        sqft: 1650,
        carpetArea: 1100,
        superBuiltUpArea: 1650,
        reraNumber: 'PRM/KA/RERA/1251/309/PR/171014/000123',
        reraAuthority: 'KRERA',
        constructionStatus: 'Ready to Move',
        builderId: builders.find((b) => b.name === 'Godrej Properties')?.id,
        images: sampleImages.slice(4, 8),
        views: 320,
      },
      {
        title: 'Lodha World One',
        description:
          'Iconic skyscraper in Mumbai offering unparalleled luxury.',
        price: 85000000,
        status: PropertyStatus.AVAILABLE,
        type: PropertyType.CONDO,
        address: 'Upper Worli',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400013',
        bedrooms: 4,
        bathrooms: 5,
        sqft: 3500,
        carpetArea: 2400,
        superBuiltUpArea: 3500,
        reraNumber: 'P51900008345',
        reraAuthority: 'MahaRERA',
        constructionStatus: 'Ready to Move',
        builderId: builders.find((b) => b.name === 'Lodha Group')?.id,
        images: sampleImages.slice(6, 10),
        views: 1250,
      },
      {
        title: 'Prestige Falcon City',
        description:
          'Mixed-use development with retail and residential spaces.',
        price: 21000000,
        status: PropertyStatus.PENDING,
        type: PropertyType.APARTMENT,
        address: 'Kanakapura Road',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560062',
        bedrooms: 2,
        bathrooms: 2,
        sqft: 1350,
        carpetArea: 950,
        superBuiltUpArea: 1350,
        reraNumber: 'PRM/KA/RERA/1251/310/PR/170913/000114',
        reraAuthority: 'KRERA',
        constructionStatus: 'Ready to Move',
        builderId: builders.find((b) => b.name === 'Prestige Group')?.id,
        images: sampleImages.slice(0, 3),
        views: 210,
      },
    ];

    for (const prop of properties) {
      await this.propertyRepository.save({
        ...prop,
        agentId: agent?.id,
        tenantId,
        features: [
          'Clubhouse',
          'Gym',
          'Swimming Pool',
          'Security',
          'Power Backup',
        ],
        listed: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
        yearBuilt: 2020 + Math.floor(Math.random() * 4),
      });
    }

    console.log(`   Created 5 properties`);
  }

  private async seedTasks() {
    console.log('📋 Seeding tasks...');

    const users = await this.userRepository.find({
      where: { tenantId: Not(IsNull()) },
    });
    const anjali = users.find((u) => u.name === 'Anjali Sharma') || users[0];

    const taskTemplates = [
      {
        title: 'Follow up with James Smith - Manhattan apartment interest',
        description:
          'James called yesterday about the 2 BHK in Manhattan. Needs pricing details.',
        priority: TaskPriority.HIGH,
        type: TaskType.CALL,
      },
      {
        title: 'Schedule site visit for Jennifer Lopez',
        description:
          'Pre-approved buyer. Interested in Brooklyn properties between 80L-1.2Cr.',
        priority: TaskPriority.HIGH,
        type: TaskType.MEETING,
      },
      {
        title: 'Send property options to Robert',
        description:
          'Robert asked for 3 BHK options in Queens under 1Cr. Send listings.',
        priority: TaskPriority.MEDIUM,
        type: TaskType.EMAIL,
      },
      {
        title: 'Prepare offer documents for 45 Park Ave unit',
        description: 'Client ready to make an offer. Need docs ready by EOD.',
        priority: TaskPriority.HIGH,
        type: TaskType.DEADLINE,
      },
      {
        title: 'Call Michael re: property viewing confirmation',
        description:
          "Michael requested a viewing but hasn't confirmed. Follow up.",
        priority: TaskPriority.MEDIUM,
        type: TaskType.CALL,
      },
      {
        title: 'Send brochure to Sarah - Bandra project',
        description:
          'Sarah is interested in the new Bandra launch. Send digital brochure.',
        priority: TaskPriority.LOW,
        type: TaskType.EMAIL,
      },
      {
        title: 'Follow up with David - closed leads',
        description: 'David has 3 hot leads from last week. Check status.',
        priority: TaskPriority.HIGH,
        type: TaskType.CALL,
      },
      {
        title: 'Update CRM notes for recent visits',
        description: 'Log visit feedback for all properties shown this week.',
        priority: TaskPriority.MEDIUM,
        type: TaskType.TODO,
      },
      {
        title: 'Team meeting preparation',
        description:
          'Prepare presentation for Friday team meeting. Include pipeline update.',
        priority: TaskPriority.MEDIUM,
        type: TaskType.MEETING,
      },
      {
        title: 'Send WhatsApp details to Linda',
        description:
          'Linda asked for the WhatsApp group link for property updates.',
        priority: TaskPriority.LOW,
        type: TaskType.CALL,
      },
      {
        title: 'Review contracts for unit 1201 and 1202',
        description: 'Check contracts before sending to clients for signature.',
        priority: TaskPriority.HIGH,
        type: TaskType.DEADLINE,
      },
      {
        title: 'Call Thomas about rental inquiry',
        description:
          'Thomas submitted an inquiry for a 3-month rental. Call back.',
        priority: TaskPriority.MEDIUM,
        type: TaskType.CALL,
      },
      {
        title: 'Update lead status for Barbara Johnson',
        description:
          'Barbara went silent after second visit. Mark status and follow up.',
        priority: TaskPriority.LOW,
        type: TaskType.TODO,
      },
      {
        title: 'Prepare comparative market analysis',
        description: 'CMA for Park Avenue property. Need for client meeting.',
        priority: TaskPriority.MEDIUM,
        type: TaskType.TODO,
      },
      {
        title: 'Confirm appointment with Richard Fox',
        description: 'Richard is 10 min late. Call to confirm ETA.',
        priority: TaskPriority.LOW,
        type: TaskType.CALL,
      },
      {
        title: 'Email new listings to Susan',
        description:
          'Susan wants all listings above 2Cr in South Mumbai. Filter and send.',
        priority: TaskPriority.LOW,
        type: TaskType.EMAIL,
      },
      {
        title: 'Site visit with Joseph - Andheri project',
        description: 'Scheduled at 3 PM. Confirm with Joseph and prep keys.',
        priority: TaskPriority.HIGH,
        type: TaskType.MEETING,
      },
      {
        title: 'Submit token for unit 502',
        description: 'Client agreed. Submit token before 6 PM cutoff.',
        priority: TaskPriority.HIGH,
        type: TaskType.DEADLINE,
      },
      {
        title: 'Welcome call to new lead - Jessica',
        description:
          'New lead from website. Introduce yourself and set expectations.',
        priority: TaskPriority.MEDIUM,
        type: TaskType.CALL,
      },
      {
        title: 'Log all week 1 activities',
        description:
          'Update lead statuses from this week before reports are due.',
        priority: TaskPriority.LOW,
        type: TaskType.TODO,
      },
    ];

    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;

    for (const template of taskTemplates) {
      const daysOffset = Math.floor(Math.random() * 14) - 5;
      const hour = Math.floor(Math.random() * 10) + 9;
      const dueDate = new Date(now.getTime() + daysOffset * dayMs);
      dueDate.setHours(hour, Math.floor(Math.random() * 60), 0, 0);

      const assignedUser =
        Math.random() > 0.4
          ? anjali
          : users[Math.floor(Math.random() * users.length)];

      const status =
        dueDate < now
          ? TaskStatus.TODO
          : Math.random() > 0.7
            ? TaskStatus.DONE
            : TaskStatus.TODO;

      const task = this.taskRepository.create({
        title: template.title,
        description: template.description,
        status,
        priority: template.priority,
        type: template.type,
        dueDate,
        assignedToId: assignedUser.id,
        createdById: assignedUser.id,
        tenantId: anjali.tenantId,
      });

      await this.taskRepository.save(task);
    }

    console.log(
      `   Created ${taskTemplates.length} tasks assigned to Anjali Sharma`,
    );
  }
}
