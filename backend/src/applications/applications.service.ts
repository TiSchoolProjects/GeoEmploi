import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Application, ApplicationStatus } from './entities/application.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application) 
    private AppRepository: Repository<Application>,
  ) {}

  async apply(jobSeekerId: number, jobId: number): Promise<Application> {
    const exist = await this.AppRepository.findOne({where : {jobSeekerId, jobId}});

    if (exist) {
      throw new ConflictException("Vous avez déja postulé.");
    }

    const app = this.AppRepository.create({jobSeekerId, jobId, status: ApplicationStatus.WAITING});

    return this.AppRepository.save(app);
  }

  findAll() {
    return this.AppRepository.find();
  }

  findOne(id: number) {
    return this.AppRepository.findBy({id});
  }

  async findbySeekerId(jobSeekerId: number): Promise<Application[]> {
    return this.AppRepository.find({ where: {jobSeekerId}, relations: {jobSeeker: true}, order: {createdAt: 'DESC'},
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
