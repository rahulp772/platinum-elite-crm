import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from './entities/transaction.entity';
import { Tenant } from '../tenants/entities/tenant.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async findAll(tenantId: string) {
    return this.transactionRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async createTransaction(data: {
    tenantId: string;
    userId?: string;
    type: TransactionType;
    amount: number;
    currency?: string;
    planName?: string;
    planTier?: number;
    description?: string;
    status?: TransactionStatus;
    paymentMethod?: string;
    transactionId?: string;
    billingDate?: Date;
    nextBillingDate?: Date;
  }) {
    const tenant = await this.tenantRepository.findOne({
      where: { id: data.tenantId },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const transaction = this.transactionRepository.create({
      ...data,
      currency: data.currency || 'INR',
      status: data.status || TransactionStatus.COMPLETED,
      tenant: tenant,
      invoiceNumber,
    });

    return this.transactionRepository.save(transaction);
  }

  async findOne(id: string, tenantId: string) {
    return this.transactionRepository.findOne({
      where: { id, tenantId },
    });
  }
}
