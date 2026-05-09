import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { User } from '../users/entities/user.entity';
import { TransactionsService } from '../transactions/transactions.service';
import { TransactionType, TransactionStatus } from '../transactions/entities/transaction.entity';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    private transactionsService: TransactionsService,
  ) {}

  async findOne(id: string) {
    const tenant = await this.tenantRepository.findOne({ where: { id } });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return tenant;
  }

  async findAll() {
    return this.tenantRepository.find();
  }

  async update(id: string, updateData: Partial<Tenant>, currentUser: User) {
    const tenant = await this.findOne(id);

    if (currentUser.tenantId !== id && !currentUser.isSuperAdmin) {
      throw new ForbiddenException('You can only update your own tenant');
    }

    const oldPlanName = tenant.planName;
    const newPlanName = updateData.planName;

    if (newPlanName && newPlanName !== oldPlanName) {
      await this.transactionsService.createTransaction({
        tenantId: id,
        userId: currentUser.id,
        type: oldPlanName ? TransactionType.UPGRADE : TransactionType.SUBSCRIPTION,
        amount: 0,
        planName: newPlanName,
        status: TransactionStatus.COMPLETED,
        description: `Plan changed from ${oldPlanName || 'None'} to ${newPlanName}`,
        billingDate: new Date(),
        nextBillingDate: updateData.subscriptionEndDate || undefined,
      });
    }

    Object.assign(tenant, updateData);
    return this.tenantRepository.save(tenant);
  }
}
