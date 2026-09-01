import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Job } from './entities/job.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
  ) {}


  async create(data: Partial<Job>) {
    const job = this.jobRepository.create(data);
    return await this.jobRepository.save(job);
  }

  findAll() {
    return this.jobRepository.find();
  }

  findOne(id: number) {
    return this.jobRepository.findOne({where: {id}});
  }

  async findByEmployer(employerId: number): Promise<Job[]> {
    return this.jobRepository.find({ where: {employerId}, relations: {employer: true}, order: {createdAt: 'DESC'},
    });
  }

  async findNearby(lat: number, lng: number, radius: number) {
    const jobs = await this.jobRepository.find({where: {archivedAt: IsNull()}});

    return jobs.filter((job) => {
      if (!job.lat || ! job.lng) {
        return false; 
      }
      const distance = this.calcdist(lat, lng, Number(job.lat), Number(job.lng));
      return distance <= radius;
    });
  }

  async archive(id: number): Promise<Job> {
    const job = await this.jobRepository.findOne({where: {id}});
    if (!job)
      throw new NotFoundException("Proposition non trouvée.");

    job.archivedAt = new Date();
    return await this.jobRepository.save(job);
  }

  remove(id: number) {
    return this.jobRepository.delete({id});
  }


  private calcdist(Alat: number, Alng: number, Blat: number, Blng: number): number {
      const R = 6371.0
      const Deltalat = Blat * (Math.PI / 180.0) - Alat * (Math.PI / 180.0)
      const Deltalng = Blng * (Math.PI / 180.0) - Alng * (Math.PI / 180.0)

      const a = Math.sin(Deltalat / 2) ** 2 +
                 Math.cos(Alat * (Math.PI / 180.0)) * Math.cos(Blat * (Math.PI / 180.0)) *
                 Math.sin(Deltalng / 2) ** 2 

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

      return R * c;

  }
}
