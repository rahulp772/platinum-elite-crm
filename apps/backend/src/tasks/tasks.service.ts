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

  async create(createTaskDto: CreateTaskDto, currentUser: User) {
    const { assignedToId, ...taskData } = createTaskDto;
    let assignedTo = currentUser;

    if (assignedToId) {
      const user = await this.userRepository.findOne({
        where: { id: assignedToId },
      });
      if (!user) {
        throw new NotFoundException(`User with ID ${assignedToId} not found`);
      }
      assignedTo = user;
    }

    const task = this.taskRepository.create({
      ...taskData,
      assignedTo,
      tenantId: currentUser.tenantId,
    });
    return this.taskRepository.save(task);
  }

  async findAll(user: User) {
    const where = user.isSuperAdmin ? {} : { tenantId: user.tenantId };
    return this.taskRepository.find({ where, relations: ['assignedTo'] });
  }

  async findOne(id: string, user: User) {
    const where = user.isSuperAdmin ? { id } : { id, tenantId: user.tenantId };
    const task = await this.taskRepository.findOne({
      where,
      relations: ['assignedTo'],
    });
    if (!task) {
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
