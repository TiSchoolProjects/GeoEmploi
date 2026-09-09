import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { JobsService } from './jobs.service';
import { GeoCodingStatus } from './entities/job.entity';
import { UserRole } from '../auth/roles.enum';

describe('JobsService', () => {
  const jobRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
    increment: jest.fn(),
  };

  const employerRepository = {
    findOne: jest.fn(),
  };

  let service: JobsService;
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.resetAllMocks();

    service = new JobsService(
      jobRepository as any,
      employerRepository as any,
    );
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  describe('geocodeAdress', () => {
    it('should geocode a valid commune', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          features: [
            {
              properties: {
                city: 'Paris',
                name: 'Paris',
                score: 0.95,
              },
              geometry: {
                coordinates: [2.347, 48.859],
              },
            },
          ],
        }),
      }) as any;

      const result = await service.geocodeAdress('Paris');

      expect(result.commune).toBe('Paris');
      expect(result.lat).toBe(48.859);
      expect(result.lng).toBe(2.347);
      expect(result.geocodingScore).toBe(0.95);
      expect(result.geocodingSource).toBe('api-adresse');
      expect(result.GeocodingStatus).toBe(
        GeoCodingStatus.VALID,
      );
      expect(result.geocodedAt).toBeInstanceOf(Date);
    });

    it('should return geocoding failure when no result exists', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          features: [],
        }),
      }) as any;

      const result =
        await service.geocodeAdress('Commune inconnue');

      expect(result.lat).toBeNull();
      expect(result.lng).toBeNull();
      expect(result.geocodingScore).toBeNull();
      expect(result.geocodedAt).toBeNull();
      expect(result.GeocodingStatus).toBe(
        GeoCodingStatus.TO_VERIFY,
      );
    });

    it('should reject a geocoding result with a low score', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          features: [
            {
              properties: {
                city: 'Test',
                score: 0.4,
              },
              geometry: {
                coordinates: [2, 48],
              },
            },
          ],
        }),
      }) as any;

      const result =
        await service.geocodeAdress('Test');

      expect(result.lat).toBeNull();
      expect(result.lng).toBeNull();
      expect(result.GeocodingStatus).toBe(
        GeoCodingStatus.TO_VERIFY,
      );
    });

    it('should return geocoding failure when API fails', async () => {
      global.fetch = jest.fn().mockRejectedValue(
        new Error('API indisponible'),
      ) as any;

      const result =
        await service.geocodeAdress('Paris');

      expect(result.lat).toBeNull();
      expect(result.lng).toBeNull();
      expect(result.GeocodingStatus).toBe(
        GeoCodingStatus.TO_VERIFY,
      );
    });

    it('should return geocoding failure when API response is not ok', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      }) as any;

      const result =
        await service.geocodeAdress('Paris');

      expect(result.lat).toBeNull();
      expect(result.lng).toBeNull();
      expect(result.GeocodingStatus).toBe(
        GeoCodingStatus.TO_VERIFY,
      );
    });
  });

  describe('create', () => {
    it('should reject creation without commune', async () => {
      await expect(
        service.create(
          {
            title: 'Développeur',
          },
          2,
        ),
      ).rejects.toBeInstanceOf(
        BadRequestException,
      );

      expect(
        employerRepository.findOne,
      ).not.toHaveBeenCalled();
    });

    it('should reject creation when employer profile does not exist', async () => {
      jest
        .spyOn(service, 'geocodeAdress')
        .mockResolvedValue({
          commune: 'Paris',
          lat: 48.859,
          lng: 2.347,
          GeocodingStatus:
            GeoCodingStatus.VALID,
        });

      employerRepository.findOne.mockResolvedValue(
        null,
      );

      await expect(
        service.create(
          {
            commune: 'Paris',
            title: 'Développeur',
          },
          2,
        ),
      ).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('should reject creation from an unverified employer', async () => {
      jest
        .spyOn(service, 'geocodeAdress')
        .mockResolvedValue({
          commune: 'Paris',
          lat: 48.859,
          lng: 2.347,
          GeocodingStatus:
            GeoCodingStatus.VALID,
        });

      employerRepository.findOne.mockResolvedValue({
        userId: 2,
        verifiedAt: null,
      });

      await expect(
        service.create(
          {
            commune: 'Paris',
            title: 'Développeur',
          },
          2,
        ),
      ).rejects.toBeInstanceOf(
        ForbiddenException,
      );

      expect(jobRepository.save).not.toHaveBeenCalled();
    });

    it('should create a job for a verified employer', async () => {
      employerRepository.findOne.mockResolvedValue({
        userId: 2,
        verifiedAt: new Date(),
      });

      jest
        .spyOn(service, 'geocodeAdress')
        .mockResolvedValue({
          commune: 'Paris',
          lat: 48.859,
          lng: 2.347,
          geocodingSource: 'api-adresse',
          geocodingScore: 0.95,
          geocodedAt: new Date(),
          GeocodingStatus:
            GeoCodingStatus.VALID,
        });

      const createdJob = {
        employerId: 2,
        title: 'Développeur NestJS',
        description: 'Description',
        commune: 'Paris',
        lat: 48.859,
        lng: 2.347,
        locationPrecision: 'commune',
      };

      jobRepository.create.mockReturnValue(
        createdJob,
      );

      jobRepository.save.mockResolvedValue({
        id: 1,
        ...createdJob,
      });

      const result = await service.create(
        {
          title: 'Développeur NestJS',
          description: 'Description',
          commune: 'Paris',
        },
        2,
      );

      expect(
        employerRepository.findOne,
      ).toHaveBeenCalledWith({
        where: {
          userId: 2,
        },
      });

      expect(jobRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          employerId: 2,
          title: 'Développeur NestJS',
          commune: 'Paris',
          locationPrecision: 'commune',
        }),
      );

      expect(jobRepository.save).toHaveBeenCalled();

      expect(result.id).toBe(1);
    });

    it('should override employerId supplied in body', async () => {
      employerRepository.findOne.mockResolvedValue({
        userId: 2,
        verifiedAt: new Date(),
      });

      jest
        .spyOn(service, 'geocodeAdress')
        .mockResolvedValue({
          commune: 'Paris',
          lat: 48.859,
          lng: 2.347,
          GeocodingStatus:
            GeoCodingStatus.VALID,
        });

      jobRepository.create.mockImplementation(
        (value) => value,
      );

      jobRepository.save.mockImplementation(
        async (value) => value,
      );

      const result = await service.create(
        {
          employerId: 999,
          title: 'Développeur',
          commune: 'Paris',
        },
        2,
      );

      expect(result.employerId).toBe(2);

      expect(jobRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          employerId: 2,
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return active jobs', async () => {
      const jobs = [
        {
          id: 1,
          title: 'Job 1',
        },
        {
          id: 2,
          title: 'Job 2',
        },
      ];

      jobRepository.find.mockResolvedValue(jobs);

      const result = await service.findAll();

      expect(result).toEqual(jobs);
      expect(jobRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an active job', async () => {
      const job = {
        id: 1,
        title: 'Développeur',
        archivedAt: null,
      };

      jobRepository.findOne.mockResolvedValue(job);

      const result = await service.findOne(1);

      expect(result).toEqual(job);

      expect(
        jobRepository.findOne,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: 1,
          }),
        }),
      );
    });

    it('should return null when no active job exists', async () => {
      jobRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('findByEmployer', () => {
    it('should return jobs from an employer', async () => {
      const jobs = [
        {
          id: 1,
          employerId: 2,
        },
        {
          id: 2,
          employerId: 2,
        },
      ];

      jobRepository.find.mockResolvedValue(jobs);

      const result =
        await service.findByEmployer(2);

      expect(result).toEqual(jobs);

      expect(jobRepository.find).toHaveBeenCalledWith({
        where: {
          employerId: 2,
        },
        relations: {
          employer: true,
        },
        order: {
          createdAt: 'DESC',
        },
      });
    });
  });

  describe('findNearby', () => {
    it('should return only jobs inside radius', async () => {
      jobRepository.find.mockResolvedValue([
        {
          id: 1,
          lat: 48.8566,
          lng: 2.3522,
        },
        {
          id: 2,
          lat: 43.2965,
          lng: 5.3698,
        },
      ]);

      const result = await service.findNearby(
        48.8566,
        2.3522,
        50,
      );

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it('should ignore jobs without coordinates', async () => {
      jobRepository.find.mockResolvedValue([
        {
          id: 1,
          lat: null,
          lng: null,
        },
      ]);

      const result = await service.findNearby(
        48.8566,
        2.3522,
        50,
      );

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should reject update when job does not exist', async () => {
      jobRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(
          999,
          {
            title: 'Test',
          } as any,
          2,
          UserRole.EMPLOYER,
        ),
      ).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should reject update from another employer', async () => {
      jobRepository.findOne.mockResolvedValue({
        id: 1,
        employerId: 10,
        commune: 'Paris',
      });

      await expect(
        service.update(
          1,
          {
            title: 'Test',
          } as any,
          2,
          UserRole.EMPLOYER,
        ),
      ).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('should allow employer to update own job', async () => {
      const job = {
        id: 1,
        employerId: 2,
        title: 'Ancien titre',
        commune: 'Paris',
      };

      jobRepository.findOne.mockResolvedValue(job);

      jobRepository.save.mockImplementation(
        async (value) => value,
      );

      const result = await service.update(
        1,
        {
          title: 'Nouveau titre',
        } as any,
        2,
        UserRole.EMPLOYER,
      );

      expect(result.title).toBe(
        'Nouveau titre',
      );

      expect(jobRepository.save).toHaveBeenCalledWith(
        job,
      );
    });

    it('should allow admin to update any job', async () => {
      const job = {
        id: 1,
        employerId: 10,
        title: 'Ancien titre',
        commune: 'Paris',
      };

      jobRepository.findOne.mockResolvedValue(job);

      jobRepository.save.mockImplementation(
        async (value) => value,
      );

      const result = await service.update(
        1,
        {
          title: 'Modifié admin',
        } as any,
        999,
        UserRole.ADMIN,
      );

      expect(result.title).toBe(
        'Modifié admin',
      );
    });

    it('should geocode again when commune changes', async () => {
      const job = {
        id: 1,
        employerId: 2,
        commune: 'Paris',
        lat: 48.859,
        lng: 2.347,
      };

      jobRepository.findOne.mockResolvedValue(job);

      jest
        .spyOn(service, 'geocodeAdress')
        .mockResolvedValue({
          commune: 'Lyon',
          lat: 45.764,
          lng: 4.8357,
          GeocodingStatus:
            GeoCodingStatus.VALID,
        });

      jobRepository.save.mockImplementation(
        async (value) => value,
      );

      const result = await service.update(
        1,
        {
          commune: 'Lyon',
        } as any,
        2,
        UserRole.EMPLOYER,
      );

      expect(
        service.geocodeAdress,
      ).toHaveBeenCalledWith('Lyon');

      expect(result.commune).toBe('Lyon');
      expect(result.lat).toBe(45.764);
      expect(result.lng).toBe(4.8357);
    });
  });

  describe('archive', () => {
    it('should archive a job', async () => {
      const job = {
        id: 1,
        archivedAt: null,
      };

      jobRepository.findOne.mockResolvedValue(job);

      jobRepository.save.mockImplementation(
        async (value) => value,
      );

      const result = await service.archive(1);

      expect(result.archivedAt).toBeInstanceOf(Date);
      expect(jobRepository.save).toHaveBeenCalledWith(
        job,
      );
    });

    it('should reject archive when job does not exist', async () => {
      jobRepository.findOne.mockResolvedValue(null);

      await expect(
        service.archive(999),
      ).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should reject deletion when job does not exist', async () => {
      jobRepository.findOne.mockResolvedValue(null);

      await expect(
        service.remove(
          999,
          2,
          UserRole.EMPLOYER,
        ),
      ).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should reject deletion from another employer', async () => {
      jobRepository.findOne.mockResolvedValue({
        id: 1,
        employerId: 10,
      });

      await expect(
        service.remove(
          1,
          2,
          UserRole.EMPLOYER,
        ),
      ).rejects.toBeInstanceOf(
        ForbiddenException,
      );

      expect(
        jobRepository.remove,
      ).not.toHaveBeenCalled();
    });

    it('should allow owner to delete a job', async () => {
      const job = {
        id: 1,
        employerId: 2,
      };

      jobRepository.findOne.mockResolvedValue(job);
      jobRepository.remove.mockResolvedValue(job);

      await service.remove(
        1,
        2,
        UserRole.EMPLOYER,
      );

      expect(jobRepository.remove).toHaveBeenCalledWith(
        job,
      );
    });

    it('should allow admin to delete a job', async () => {
      const job = {
        id: 1,
        employerId: 2,
      };

      jobRepository.findOne.mockResolvedValue(job);
      jobRepository.remove.mockResolvedValue(job);

      await service.remove(
        1,
        999,
        UserRole.ADMIN,
      );

      expect(jobRepository.remove).toHaveBeenCalledWith(
        job,
      );
    });
  });

  describe('archiveAfter30days', () => {
    it('should archive jobs older than 30 days', async () => {
      jobRepository.update.mockResolvedValue({
        affected: 3,
      });

      const result =
        await service.archiveAfter30days();

      expect(result).toBe(3);
      expect(jobRepository.update).toHaveBeenCalledTimes(
        1,
      );
    });

    it('should return zero when no job is archived', async () => {
      jobRepository.update.mockResolvedValue({
        affected: 0,
      });

      const result =
        await service.archiveAfter30days();

      expect(result).toBe(0);
    });

    it('should return zero when affected is undefined', async () => {
      jobRepository.update.mockResolvedValue({
        affected: undefined,
      });

      const result =
        await service.archiveAfter30days();

      expect(result).toBe(0);
    });
  });

  describe('purgeArchiveJobs', () => {
    it('should return zero when there is nothing to purge', async () => {
      jobRepository.find.mockResolvedValue([]);

      const result =
        await service.purgeArchiveJobs();

      expect(result.deleted).toBe(0);
      expect(result.limDate).toBeInstanceOf(Date);

      expect(
        jobRepository.remove,
      ).not.toHaveBeenCalled();
    });

    it('should purge jobs older than retention period', async () => {
      const jobs = [
        {
          id: 1,
        },
        {
          id: 2,
        },
      ];

      jobRepository.find.mockResolvedValue(jobs);
      jobRepository.remove.mockResolvedValue(jobs);

      const result =
        await service.purgeArchiveJobs();

      expect(result.deleted).toBe(2);
      expect(result.limDate).toBeInstanceOf(Date);

      expect(jobRepository.remove).toHaveBeenCalledWith(
        jobs,
      );
    });
  });

  describe('findAdmin', () => {
    it('should return jobs waiting for geocoding verification', async () => {
      const jobs = [
        {
          id: 1,
          GeocodingStatus:
            GeoCodingStatus.TO_VERIFY,
        },
      ];

      jobRepository.find.mockResolvedValue(jobs);

      const result = await service.findAdmin();

      expect(result).toEqual(jobs);

      expect(jobRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          relations: {
            employer: true,
          },
          order: {
            createdAt: 'DESC',
          },
        }),
      );
    });
  });

  describe('incrementView', () => {
    it('should increment job views', async () => {
      jobRepository.findOne.mockResolvedValue({
        id: 1,
        views: 4,
      });

      jobRepository.increment.mockResolvedValue({
        affected: 1,
      });

      const result =
        await service.incrementView(1);

      expect(
        jobRepository.increment,
      ).toHaveBeenCalledWith(
        {
          id: 1,
        },
        'views',
        1,
      );

      expect(result).toEqual({
        affected: 1,
      });
    });

    it('should reject increment when job does not exist', async () => {
      jobRepository.findOne.mockResolvedValue(null);

      await expect(
        service.incrementView(999),
      ).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(
        jobRepository.increment,
      ).not.toHaveBeenCalled();
    });
  });

  describe('getView', () => {
    it('should return job view count', async () => {
      jobRepository.findOne.mockResolvedValue({
        id: 1,
        views: 42,
      });

      const result = await service.getView(1);

      expect(result).toBe(42);
    });

    it('should reject when job does not exist', async () => {
      jobRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getView(999),
      ).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
