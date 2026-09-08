import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Application, ApplicationStatus } from './entities/application.entity';
import { Repository } from 'typeorm';
import { Job } from '../jobs/entities/job.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { UserRole } from '../auth/roles.enum';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private AppRepository: Repository<Application>,

    @InjectRepository(Job)
    private JobRepository: Repository<Job>,
    private readonly notificationsService: NotificationsService,
  ) { }

  private async getEmployerId(jobId: number): Promise<number> {
    const job = await this.JobRepository.findOneBy({ id: jobId });

    if (!job || job.archivedAt !== null) {
      throw new NotFoundException("Candidature non trouvée.");;
    }

    return job.employerId;
  }

  async apply(jobSeekerId: number, jobId: number): Promise<Application> {
    const job = await this.JobRepository.findOne({ where: { id: jobId }, });

    if (!job || job.archivedAt !== null) {
      throw new NotFoundException("L'offre demandée n'existe pas.");
    }

    const exist = await this.AppRepository.findOne({ where: { jobSeekerId, jobId } });

    if (exist) {
      throw new ConflictException("Vous avez déja postulé.");
    }

    const app = this.AppRepository.create({ jobSeekerId, jobId, status: ApplicationStatus.WAITING });

    const savedApp = await this.AppRepository.save(app);

    await this.notificationsService.create(job.employerId, savedApp.id, job.title,);

    return savedApp;
  }

  findAll() {
    return this.AppRepository.find();
  }

  async findOne(id: number, currentUser: { userId: number; role: UserRole }) {
    const application = await this.AppRepository.findOne({ where: {id},
          relations: {job: true,
          jobSeeker: {seekerProfile: true},},});

    if (!application) {
      throw new NotFoundException("Candidature non trouvée.");;
    }

    if (currentUser.role === UserRole.ADMIN) {
      return application;
    }

    const employerId = await this.getEmployerId(application.jobId);

    if ((currentUser.role === UserRole.SEEKER && currentUser.userId !== application.jobSeekerId)
      || (currentUser.role === UserRole.EMPLOYER && currentUser.userId !== employerId)) {
      throw new ForbiddenException("Vous n'avez pas la permission.");
    }

    return application;
  }

  async findbySeekerId(jobSeekerId: number): Promise<Application[]> {
    return this.AppRepository.find({
      where: { jobSeekerId }, relations: { job: true }, order: { createdAt: 'DESC' },
    });
  }

  async findbyJobId(jobId: number, currentUser: { userId: number; role: UserRole }): Promise<Application[]> {
    const applications = await this.AppRepository.find({
      where: { jobId }, relations: { jobSeeker: {seekerProfile: true} }, order: { createdAt: 'DESC' },
    });

    if (!applications) {
      throw new NotFoundException("Candidatures non trouvées.");;
    }

    if (currentUser.role === UserRole.ADMIN) {
      return applications;
    }

    const employerId = await this.getEmployerId(jobId);

    if (currentUser.role === UserRole.EMPLOYER && currentUser.userId !== employerId) {
      throw new ForbiddenException("Vous n'avez pas la permission.");
    }

    return applications;
  }

  async updateStatus(id: number, status: ApplicationStatus, currentUser: { userId: number; role: UserRole }): Promise<Application> {
    const app = await this.AppRepository.findOne({ where: { id } });

    if (!app) {
      throw new NotFoundException("Candidature non trouvée.");
    }

    app.status = status;

    if (currentUser.role == UserRole.ADMIN) {
      return await this.AppRepository.save(app);
    }

    const employerId = await this.getEmployerId(app.jobId);

    if (currentUser.role === UserRole.EMPLOYER && currentUser.userId !== employerId) {
      throw new ForbiddenException("Vous n'avez pas la permission.");
    }

    return await this.AppRepository.save(app);
  }

  async remove(id: number, currentUser: { userId: number; role: UserRole }): Promise<void> {
    const application = await this.AppRepository.findOneBy({ id });

    if (!application) {
      throw new NotFoundException("Candidature non trouvée.");;
    }

    if (currentUser.role === UserRole.ADMIN) {
      await this.AppRepository.remove(application);
      return;
    }

    if (currentUser.role === UserRole.SEEKER && currentUser.userId !== application.jobSeekerId) {
      throw new ForbiddenException("Vous n'avez pas la permission.");
    }

    await this.AppRepository.remove(application);
  }
}
