import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './dto/task.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/dto/user.entity';
import { Logger } from '@nestjs/common';
@Injectable()
export class TasksService {
  private logger = new Logger('Task Services');
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}
  // getAllTasks() {
  //   return this.tasks;
  // }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description } = createTaskDto;
    const task = this.tasksRepository.create({
      title,
      description,
      status: TaskStatus.OPEN,
      user,
    });
    await this.tasksRepository.save(task);
    return task;
  }

  // createTask(createTaskDto: CreateTaskDto): Task {
  //   const { title, description } = createTaskDto;
  //   const task: Task = {
  //     id: uuid(),
  //     title,
  //     description,
  //     taskStatus: TaskStatus.OPEN,
  //   };
  //   this.tasks.push(task);
  //   return task;
  // }

  async getTaskById(id: string, user: User): Promise<Task> {
    const found = await this.tasksRepository.findOne({
      where: {
        id: id,
        user: user,
      },
    });

    if (!found) {
      throw new NotFoundException(`Task with ${id} not found`);
    }
    return found;
  }

  // getTaskById(id: string): Task {
  //   const found = this.tasks.find((task) => id === task.id);
  //   if (!found) {
  //     throw new NotFoundException(`Task with ${id} not found`);
  //   }
  //   return found;
  // }

  async deleteTask(id: string, user: User): Promise<void> {
    const result = await this.tasksRepository.delete({ id: id, user: user });

    if (result.affected == 0) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    // console.log(result);
  }
  // deleteTask(id: string): void {
  //   const found = this.getTaskById(id);
  //   this.tasks = this.tasks.filter((task) => task.id !== found.id);
  // }

  async updateTaskStatus(
    id: string,
    status: TaskStatus,
    user: User,
  ): Promise<Task> {
    const task = await this.getTaskById(id, user);

    task.status = status;
    await this.tasksRepository.save(task);

    return task;
  }

  async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    const query = this.tasksRepository.createQueryBuilder('task');
    query.where({ user });
    const { status, search } = filterDto;

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      //the query is between curly braces because other wise when we wnat to use the fileter
      //it will show the task which belongs to another user also
      query.andWhere(
        '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }
    try {
      const tasks = await query.getMany();
      return tasks;
    } catch (error) {
      this.logger.error(
        `Failed to get tasks for user "${
          user.username
        }". Filters: ${JSON.stringify(filterDto)}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }
  // updateTaskStatus(id: string, status: TaskStatus) {
  //   const task = this.getTaskById(id);
  //   console.log(task);
  //   task.taskStatus = status;
  //   return task;
  // }
  // getTaskWIthFilters(filterDto: GetTasksFilterDto): Task[] {
  //   const { taskStatus, search } = filterDto;
  //   //define a temporary array to hold the result
  //   let tasks = this.getAllTasks();
  //   //do something with status
  //   if (taskStatus) {
  //     tasks = tasks.filter((task) => task.taskStatus === taskStatus);
  //   }
  //   //with something with search
  //   if (search) {
  //     tasks = tasks.filter((task) => {
  //       if (
  //         task.title.toLowerCase().includes(search) ||
  //         task.description.toLowerCase().includes(search)
  //       ) {
  //         return true;
  //       } else {
  //         return false;
  //       }
  //     });
  //   }
  //   //return final result
  //   return tasks;
  // }
}
