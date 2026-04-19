import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';

const TENANTS = [
  { name: 'Platinum Elite Realty', domain: 'platinum.elite' },
  { name: 'Luxury Homes Inc', domain: 'luxury.homes' },
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

const ROLES_PER_TENANT = [
  {
    name: 'Admin',
    description: 'Full access to all features',
    permissions: BASE_PERMISSIONS,
    isSystem: true,
  },
  {
    name: 'Senior Agent',
    description: 'Can manage leads, properties, and deals',
    permissions: [
      'leads:read',
      'leads:write',
      'deals:read',
      'deals:write',
      'properties:read',
      'properties:write',
      'tasks:read',
      'tasks:write',
    ],
    isSystem: false,
  },
  {
    name: 'Junior Agent',
    description: 'Can view leads and properties',
    permissions: [
      'leads:read',
      'properties:read',
      'tasks:read',
    ],
    isSystem: false,
  },
];

const SYSTEM_ROLES = [
  {
    name: 'Super Admin',
    description: 'System-wide admin access',
    permissions: BASE_PERMISSIONS,
    isSystem: true,
  },
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
    private dataSource: DataSource,
  ) { }

  async onModuleInit() {
    // Run seed automatically on startup
    // await this.seed();
  }

  async seed() {
    console.log('🌱 Starting database seed...');

    await this.clearDatabase();
    await this.seedTenantsAndRoles();
    await this.seedSuperAdmin();

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
    console.log('🏢 Creating tenants and roles...');

    for (const tenantData of TENANTS) {
      const tenant = this.tenantRepository.create(tenantData);
      await this.tenantRepository.save(tenant);
      console.log(`   Created tenant: ${tenant.name}`);

      for (const roleData of ROLES_PER_TENANT) {
        const role = this.roleRepository.create({
          ...roleData,
          tenantId: tenant.id,
        });
        await this.roleRepository.save(role);
        console.log(`   Created role: ${role.name} for ${tenant.name}`);
      }
    }

    console.log('   Tenants and roles seeded.');
  }

  private async seedSuperAdmin() {
    console.log('👑 Creating super admin...');

    const superAdminRole = this.roleRepository.create({
      name: 'Super Admin',
      description: 'System-wide admin access',
      permissions: BASE_PERMISSIONS,
      isSystem: true,
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
}