import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Report, ReportStatus } from './entities/report.entity';
import { Repository } from 'typeorm';
import { Job } from '../jobs/entities/job.entity';


@Injectable()
export class ReportsService {
  constructor(@InjectRepository(Report)
              private reportRepository : Repository<Report>,
              @InjectRepository(Job)
              private jobRepository: Repository<Job>,
  ) {}

  async create(jobId: number, reporterId: number, createReportDto: CreateReportDto): Promise<Report> {
    const job = await this.jobRepository.findOne({where: {id: jobId,},});

    if (!job) {
      throw new NotFoundException("Offre non trouvée.");
    }

    const exist = await this.reportRepository.findOne({where: {jobId, reporterId, status: ReportStatus.PENDING,},});

    if (exist) {
      throw new ConflictException("Vous avez déja signalé cette offre.",);
    }

    const report = this.reportRepository.create({jobId, reporterId, reason: createReportDto.reason, description: createReportDto.description, status: ReportStatus.PENDING});
    return await this.reportRepository.save(report);
  }

  async findAll(): Promise<Report[]> {
    return this.reportRepository.find({relations: {job: true, reporter: true,}, order: {createdAt: 'DESC',},});
  }

  async resolve(id :number): Promise<Report> {
    const report = await this.reportRepository.findOne({where: {id,},});

    if (!report) {
      throw new NotFoundException("Signalement non trouvé.",);
    }

    report.status = ReportStatus.RESOLVED;
    report.resolvedAt = new Date();

    return await this.reportRepository.save(report);
  }
}
