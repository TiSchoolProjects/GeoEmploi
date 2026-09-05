import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Application, ApplicationStatus } from './entities/application.entity';
import { Repository } from 'typeorm';
import { Job } from '../jobs/entities/job.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application) 
    private AppRepository: Repository<Application>,

    @InjectRepository(Job)
    private JobRepository: Repository<Job>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async apply(jobSeekerId: number, jobId: number): Promise<Application> {
    const job = await this.JobRepository.findOne({where: {id: jobId},});

    if (!job) {
      throw new NotFoundException("L'offre demandée n'existe pas.");
    }

    const exist = await this.AppRepository.findOne({where : {jobSeekerId, jobId}});

    if (exist) {
      throw new ConflictException("Vous avez déja postulé.");
    }

    const app = this.AppRepository.create({jobSeekerId, jobId, status: ApplicationStatus.WAITING});

    const savedApp = await this.AppRepository.save(app);

    await this.notificationsService.create(job.employerId, savedApp.id, job.title,);

    return savedApp;
  }

  findAll() {
    return this.AppRepository.find();
  }

  findOne(id: number) {
    return this.AppRepository.findOneBy({id});
  }

  async findbySeekerId(jobSeekerId: number): Promise<Application[]> {
    return this.AppRepository.find({ where: {jobSeekerId}, relations: {job: true}, order: {createdAt: 'DESC'},
    });
  }

  async findbyJobId(jobId: number): Promise<Application[]> {
    return this.AppRepository.find({ where: {jobId}, relations: {jobSeeker: true}, order: {createdAt: 'DESC'},
    });
  }

  async UpdateStatus(id: number, status: ApplicationStatus): Promise<Application> {
    const app = await this.AppRepository.findOne({where: {id}});

    if (!app) {
      throw new NotFoundException("Candidature non trouvée.");
    }

    app.status = status;
    return await this.AppRepository.save(app);
  }

  async remove(id: number): Promise<void> {
    const app = await this.AppRepository.findOne({where: {id}, });

    if (!app) {
      throw new NotFoundException('Candidature non trouvée.');
    }

    await this.AppRepository.remove(app);
  }
}
