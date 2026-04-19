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
      const user = await this.userRepository.findOne({ where: { id: assignedToId } });
      if (!user) {
        throw new NotFoundException(`User with ID ${assignedToId} not found`);
      }
      assignedTo = user;
    }

    const task = this.taskRepository.create({
      ...taskData,
      assignedTo,
    });
    return this.taskRepository.save(task);
  }

  async findAll() {
    return this.taskRepository.find({ relations: ['assignedTo'] });
  }

  async findOne(id: string) {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignedTo'],
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.findOne(id);
    const { assignedToId, ...taskData } = updateTaskDto;

    if (assignedToId) {
      const assignedToUser = await this.userRepository.findOne({ where: { id: assignedToId } });
      if (!assignedToUser) {
        throw new NotFoundException(`User with ID ${assignedToId} not found`);
      }
      task.assignedTo = assignedToUser;
    }

    Object.assign(task, taskData);
    return this.taskRepository.save(task);
  }

  async remove(id: string) {
    const task = await this.findOne(id);
    await this.taskRepository.remove(task);
    return { message: 'Task deleted successfully' };
  }
}
