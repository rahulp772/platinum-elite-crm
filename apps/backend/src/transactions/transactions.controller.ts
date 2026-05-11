import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async findAll(@Request() req: { user: User }) {
    const transactions = await this.transactionsService.findAll(
      req.user.tenantId,
    );
    return { data: transactions, success: true };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: { user: User }) {
    const transaction = await this.transactionsService.findOne(
      id,
      req.user.tenantId,
    );
    return { data: transaction, success: true };
  }
}
