import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateJobDto } from './dto/update-job.dto';
import { Job, GeoCodingStatus } from './entities/job.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThanOrEqual, Repository } from 'typeorm';
import { UserRole } from '../auth/roles.enum';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
  ) { }

  private geocodingFail(): Partial<Job> {
    return {
      lat: null,
      lng: null,
      GeocodingStatus: GeoCodingStatus.TO_VERIFY,
      geocodingScore: null,
      geocodingSource: 'api-adresse',
      geocodedAt: null,
    };
  }

  async geocodeAdress(address: string): Promise<Partial<Job>> {
    const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(address)}&limit=1`;
    try {
      const reponse = await fetch(url);

      if (!reponse.ok) {
        throw new Error(`Erreur Api: ${reponse.status} ${reponse.statusText}`);
      }

      const data = await reponse.json();
      const feats = data.features;

      if (!feats || feats.length === 0) {
        return this.geocodingFail();
      }



      const first = feats[0];

      if (first.properties.score < 0.7) {
        return this.geocodingFail();
      }

      const [lng, lat] = first.geometry.coordinates;
      const score = first.properties.score;

      return {
        lat: lat,
        lng: lng,
        geocodingSource: 'api-adresse',
        geocodingScore: score,
        geocodedAt: new Date(),
        GeocodingStatus: GeoCodingStatus.VALID,
      }
    } catch {
      return this.geocodingFail();
    }
  }


  async create(data: Partial<Job>) {
    if (!data.adress) {
      throw new BadRequestException("Adresse obligatoire.")
    }
    const geoc = await this.geocodeAdress(data.adress);

    const job = this.jobRepository.create({
      ...data,
      ...geoc,
    });
    return await this.jobRepository.save(job);
  }

  findAll() {
    return this.jobRepository.find({where: {archivedAt: IsNull(),},});
  }

  findOne(id: number) {
    return this.jobRepository.findOne({ where: { id } });
  }

  async findByEmployer(employerId: number): Promise<Job[]> {
    return this.jobRepository.find({
      where: { employerId }, relations: { employer: true }, order: { createdAt: 'DESC' },
    });
  }

  async findNearby(lat: number, lng: number, radius: number) {
    const jobs = await this.jobRepository.find({ where: { archivedAt: IsNull() } });

    return jobs.filter((job) => {
      if (job.lat == null || job.lng == null) {
        return false;
      }
      const distance = this.calcdist(lat, lng, Number(job.lat), Number(job.lng));
      return distance <= radius;
    });
  }

  async update(id: number, updateJobDto: UpdateJobDto, curId: number, role: UserRole): Promise<Job> {
    const job = await this.jobRepository.findOne({ where: { id } });

    if (!job) {
      throw new NotFoundException("Offre non trouvé.");
    }
    if (role !== UserRole.ADMIN && job.employerId !== curId) {
      throw new ForbiddenException("Vous ne pouvez pas modifié cette offre");
    }

    const changed = updateJobDto.adress !== undefined && updateJobDto.adress != job.adress;

    Object.assign(job, updateJobDto);

    if (changed && updateJobDto.adress) {
      const geocoding = await this.geocodeAdress(updateJobDto.adress);
      Object.assign(job, geocoding);
    }
    return await this.jobRepository.save(job);
  }

  async archive(id: number): Promise<Job> {
    const job = await this.jobRepository.findOne({ where: { id } });
    if (!job)
      throw new NotFoundException("Offre non trouvée.");

    job.archivedAt = new Date();
    return await this.jobRepository.save(job);
  }

  async remove(id: number, curId: number, role: UserRole): Promise<void> {
    const job = await this.jobRepository.findOne({ where: { id }, });

    if (!job) {
      throw new NotFoundException("Offre non trouvée.");
    }

    if (role !== UserRole.ADMIN && job.employerId !== curId) {
      throw new ForbiddenException("Cette offre ne vous appartient pas.");
    }

    await this.jobRepository.remove(job);
  }

  async archiveAfter30days(): Promise<number> {
    const dateLim = new Date();
    dateLim.setDate(dateLim.getDate() - 30);

    const res = await this.jobRepository.update(
      {archivedAt: IsNull(), createdAt: LessThanOrEqual(dateLim)},
      {archivedAt: new Date(),},);
    
    return res.affected ?? 0;
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

  async findAdmin(): Promise<Job[]> {
    return this.jobRepository.find({where: {GeocodingStatus: GeoCodingStatus.TO_VERIFY, archivedAt: IsNull(),},
      relations: {employer: true,}, order: {createdAt: 'DESC',},});
  }

}
