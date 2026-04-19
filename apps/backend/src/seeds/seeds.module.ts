import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Tenant, Role, User])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedsModule {}