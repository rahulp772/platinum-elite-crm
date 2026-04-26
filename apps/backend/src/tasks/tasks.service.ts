import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { TaskStatus } from './enums/task.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User } from '../users/entities/user.entity';

export interface TaskQueryDto {
  page?: number;
  limit?: number;
  status?: string;
  dueDate?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private async getUserWithRole(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });
  }

  private getBaseQuery(currentUser: User) {
    const isGlobalAdmin = currentUser.isSuperAdmin && !currentUser.tenantId;
    if (isGlobalAdmin) {
      return this.taskRepository.createQueryBuilder('task').leftJoinAndSelect('task.assignedTo', 'assignedTo').leftJoinAndSelect('task.createdBy', 'createdBy');
    }
    const userWithRole = currentUser.role;
    const currentLevel = userWithRole?.level || 0;
    const subQuery = this.userRepository
      .createQueryBuilder('user')
      .select('user.id')
      .leftJoin('user.role', 'role')
      .where('user.tenantId = :tenantId', { tenantId: currentUser.tenantId })
      .andWhere('role.level < :level', { level: currentLevel });
    return this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignedTo', 'assignedTo')
      .leftJoinAndSelect('assignedTo.role', 'assignedToRole')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      .where('task.tenantId = :tenantId', { tenantId: currentUser.tenantId })
      .andWhere(
        '(task.assignedToId = :userId OR task.createdById = :userId OR (task.assignedToId IN (' +
          subQuery.getQuery() +
          ')))',
        { userId: currentUser.id },
      )
      .setParameters(subQuery.getParameters());
  }

  async create(createTaskDto: CreateTaskDto, currentUser: User) {
    const { assignedToId, ...taskData } = createTaskDto;
    let assignedTo = currentUser;

    if (assignedToId) {
      const user = await this.userRepository.findOne({
        where: { id: assignedToId, tenantId: currentUser.tenantId },
        relations: ['role'],
      });
      if (!user) {
        throw new NotFoundException(`User with ID ${assignedToId} not found in your tenant`);
      }
      assignedTo = user;
    }

    const task = this.taskRepository.create({
      ...taskData,
      assignedTo,
      createdBy: currentUser,
      createdById: currentUser.id,
      tenantId: currentUser.tenantId,
    });
    return this.taskRepository.save(task);
  }

  async findAll(currentUser: User, query: TaskQueryDto = {}) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 20));
    const offset = (page - 1) * limit;

    const qb = this.getBaseQuery(currentUser);

    if (query.status && query.status !== 'all') {
      qb.andWhere('task.status = :status', { status: query.status });
    }

    const [data, total] = await qb
      .orderBy('task.dueDate', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + data.length < total,
    };
  }

async count(currentUser: User, status?: string): Promise<{ total: number; overdue: number; today: number; tomorrow: number }> {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const endOfToday = new Date(now)
    endOfToday.setHours(23, 59, 59, 999)
    const tomorrowStart = new Date(now)
    tomorrowStart.setDate(tomorrowStart.getDate() + 1)
    tomorrowStart.setHours(0, 0, 0, 0)
    const tomorrowEnd = new Date(tomorrowStart)
    tomorrowEnd.setHours(23, 59, 59, 999)

    const overdue = await this.taskRepository
      .createQueryBuilder('task')
      .where('task.tenantId = :tenantId', { tenantId: currentUser.tenantId })
      .andWhere('task.dueDate < :now', { now })
      .andWhere('task.status = :status', { status: TaskStatus.TODO })
      .getCount()

    const today = await this.taskRepository
      .createQueryBuilder('task')
      .where('task.tenantId = :tenantId', { tenantId: currentUser.tenantId })
      .andWhere('task.dueDate >= :now', { now })
      .andWhere('task.dueDate <= :endOfToday', { endOfToday })
      .andWhere('task.status = :status', { status: TaskStatus.TODO })
      .getCount()

    const tomorrowCount = await this.taskRepository
      .createQueryBuilder('task')
      .where('task.tenantId = :tenantId', { tenantId: currentUser.tenantId })
      .andWhere('task.dueDate >= :tomorrowStart', { tomorrowStart })
      .andWhere('task.dueDate <= :tomorrowEnd', { tomorrowEnd })
      .andWhere('task.status = :status', { status: TaskStatus.TODO })
      .getCount()

    const total = await this.taskRepository.count({
      where: { tenantId: currentUser.tenantId },
    })

    return { total, overdue, today, tomorrow: tomorrowCount }
  }

  async findOne(id: string, currentUser: User) {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignedTo', 'createdBy'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    const isGlobalAdmin = currentUser.isSuperAdmin && !currentUser.tenantId;
    if (isGlobalAdmin) {
      return task;
    }

    const userWithRole = await this.getUserWithRole(currentUser.id);
    if (!userWithRole || !userWithRole.role) {
      if (
        task.assignedToId === currentUser.id ||
        task.createdById === currentUser.id
      ) {
        return task;
      }
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    const currentLevel = userWithRole.role.level || 0;
    const assignedToLevel = task.assignedTo?.role?.level || 0;

    const hasAccess =
      task.assignedToId === currentUser.id ||
      task.createdById === currentUser.id ||
      (assignedToLevel < currentLevel &&
        task.tenantId === currentUser.tenantId);

    if (!hasAccess) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, user: User) {
    const task = await this.findOne(id, user);
    const { assignedToId, ...taskData } = updateTaskDto;

    if (assignedToId) {
      const assignedToUser = await this.userRepository.findOne({
        where: { id: assignedToId, tenantId: user.tenantId },
      });
      if (!assignedToUser) {
        throw new NotFoundException(`User with ID ${assignedToId} not found in your tenant`);
      }
      task.assignedTo = assignedToUser;
    }

    Object.assign(task, taskData);
    return this.taskRepository.save(task);
  }

  async remove(id: string, user: User) {
    const task = await this.findOne(id, user);
    await this.taskRepository.remove(task);
    return { message: 'Task deleted successfully' };
  }
}
