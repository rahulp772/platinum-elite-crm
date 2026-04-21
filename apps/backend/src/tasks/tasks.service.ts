import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User } from '../users/entities/user.entity';

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

  async create(createTaskDto: CreateTaskDto, currentUser: User) {
    const { assignedToId, ...taskData } = createTaskDto;
    let assignedTo = currentUser;

    if (assignedToId) {
      const user = await this.userRepository.findOne({
        where: { id: assignedToId },
        relations: ['role'],
      });
      if (!user) {
        throw new NotFoundException(`User with ID ${assignedToId} not found`);
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

  async findAll(currentUser: User) {
    if (currentUser.isSuperAdmin) {
      return this.taskRepository.find({
        relations: ['assignedTo', 'createdBy'],
      });
    }

    const userWithRole = await this.getUserWithRole(currentUser.id);
    if (!userWithRole || !userWithRole.role) {
      return this.taskRepository.find({
        where: { assignedTo: currentUser },
        relations: ['assignedTo', 'createdBy'],
      });
    }

    const currentLevel = userWithRole.role.level || 0;

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
      .setParameters(subQuery.getParameters())
      .getMany();
  }

  async findOne(id: string, currentUser: User) {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignedTo', 'createdBy'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    if (currentUser.isSuperAdmin) {
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
        where: { id: assignedToId },
      });
      if (!assignedToUser) {
        throw new NotFoundException(`User with ID ${assignedToId} not found`);
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
