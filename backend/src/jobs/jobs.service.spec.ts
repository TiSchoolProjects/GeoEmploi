import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { GeoCodingStatus } from './entities/job.entity';
import { UserRole } from '../auth/roles.enum';

describe('JobsService', () => {
  const repository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
    increment: jest.fn(),
  };

  let service: JobsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new JobsService(repository as any);
  });

  it('refuse la création sans commune', async () => {
    await expect(service.create({ title: 'Test' } as any)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('crée une offre avec précision commune', async () => {
    jest.spyOn(service, 'geocodeAdress').mockResolvedValue({
      commune: 'Orléans',
      lat: 47.873569,
      lng: 1.911358,
      GeocodingStatus: GeoCodingStatus.VALID,
    });
    repository.create.mockImplementation((value) => value);
    repository.save.mockImplementation(async (value) => ({ id: 1, ...value }));

    const result = await service.create({
      title: 'Dev',
      description: 'Test',
      commune: 'Orléans',
      employerId: 2,
    });

    expect(result.locationPrecision).toBe('commune');
    expect(result.commune).toBe('Orléans');
  });

  it('retourne to_verify si le géocodage ne trouve rien', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ features: [] }),
    }) as any;

    const result = await service.geocodeAdress('zebi');

    expect(result.GeocodingStatus).toBe(GeoCodingStatus.TO_VERIFY);
    expect(result.lat).toBeNull();
    expect(result.lng).toBeNull();
  });

  it('refuse la modification d’une offre appartenant à un autre employeur', async () => {
    repository.findOne.mockResolvedValue({ id: 1, employerId: 99, commune: 'Paris' });

    await expect(
      service.update(1, { title: 'Hack' } as any, 2, UserRole.EMPLOYER),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('archive une offre', async () => {
    const job = { id: 1, archivedAt: null };
    repository.findOne.mockResolvedValue(job);
    repository.save.mockImplementation(async (value) => value);

    const result = await service.archive(1);

    expect(result.archivedAt).toBeInstanceOf(Date);
  });

  it('archive automatiquement les offres de plus de 30 jours', async () => {
    repository.update.mockResolvedValue({ affected: 3 });
    await expect(service.archiveAfter30days()).resolves.toBe(3);
    expect(repository.update).toHaveBeenCalledTimes(1);
  });

  it('purge les offres archivées de plus de 90 jours', async () => {
    const oldJobs = [{ id: 1 }, { id: 2 }];
    repository.find.mockResolvedValue(oldJobs);
    repository.remove.mockResolvedValue(oldJobs);

    const result = await service.purgeArchiveJobs();

    expect(result.deleted).toBe(2);
    expect(repository.remove).toHaveBeenCalledWith(oldJobs);
  });

  it('ne purge rien quand aucune offre n’est éligible', async () => {
    repository.find.mockResolvedValue([]);

    const result = await service.purgeArchiveJobs();

    expect(result.deleted).toBe(0);
    expect(repository.remove).not.toHaveBeenCalled();
  });

  it('refuse la suppression d’une offre qui n’appartient pas à l’employeur', async () => {
    repository.findOne.mockResolvedValue({ id: 1, employerId: 99 });

    await expect(service.remove(1, 2, UserRole.EMPLOYER)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('retourne une erreur sur une vue d’offre inexistante', async () => {
    repository.findOne.mockResolvedValue(null);
    await expect(service.getView(999)).rejects.toBeInstanceOf(NotFoundException);
  });
  it('should reject job creation without commune', async () => {
    await expect(
      service.create({
        title: 'Test',
        description: 'Test',
        commune: '',
        employerId: 1,
      } as any),
    ).rejects.toThrow();
  });

  it('should create a job with commune precision', async () => {
    jest.spyOn(service, 'geocodeAdress')
      .mockResolvedValue({
        commune: 'Rennes',
        locationPrecision: 'commune',
        lat: 48.1 as any,
        lng: -1.6 as any,
      });

    repository.create.mockImplementation(
      (value) => value,
    );

    repository.save.mockImplementation(
      async (value) => ({
        id: 1,
        ...value,
      }),
    );

    const result = await service.create({
      title: 'Dev',
      description: 'Test',
      commune: 'Rennes',
      employerId: 2,
    } as any);

    expect(result.locationPrecision)
      .toBe('commune');
  });

  it('should set geocoding status to verify when commune is invalid', async () => {
    jest.spyOn(service, 'geocodeAdress')
      .mockResolvedValue({
        commune: 'Commune à vérifier',
        GeocodingStatus: 'to_verify' as any,
        lat: null,
        lng: null,
      });

    repository.create.mockImplementation(
      (value) => value,
    );
    repository.save.mockImplementation(
      async (value) => value,
    );

    const result = await service.create({
      title: 'Test',
      description: 'Test',
      commune: 'zzzzinvalid',
      employerId: 1,
    } as any);

    expect(result.GeocodingStatus)
      .toBe('to_verify');
  });

  it('should return active jobs', async () => {
    repository.find.mockResolvedValue([
      { id: 1, archivedAt: null },
    ]);

    const result = await service.findAll();

    expect(result).toHaveLength(1);
  });

  it('should hide archived job in findOne', async () => {
    repository.findOne.mockResolvedValue(null);

    const result = await service.findOne(1);

    expect(result).toBeNull();

    expect(repository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: 1,
        }),
      }),
    );
  });

  it('should return active job in findOne', async () => {
    repository.findOne.mockResolvedValue({
      id: 1,
      archivedAt: null,
    });

    const result = await service.findOne(1);

    expect(result?.id).toBe(1);
  });

  it('should delete employer job', async () => {
    repository.findOne.mockResolvedValue({
      id: 1,
      employerId: 2,
    });

    repository.remove.mockResolvedValue({
      id: 1,
    });

    await service.remove(1, 2, UserRole.EMPLOYER);

    expect(repository.remove)
      .toHaveBeenCalled();
  });

  it('should reject deleting another employer job', async () => {
    repository.findOne.mockResolvedValue({
      id: 1,
      employerId: 999,
    });

    await expect(
      service.remove(1, 2, UserRole.EMPLOYER),
    ).rejects.toThrow();
  });

  it('should archive jobs older than 30 days', async () => {
    repository.update.mockResolvedValue({
      affected: 2,
    });

    const result =
      await service.archiveAfter30days();

    expect(result).toBe(2);

    expect(repository.update)
      .toHaveBeenCalledTimes(1);
  });

  it('should archive zero jobs when none are eligible', async () => {
    repository.update.mockResolvedValue({
      affected: 0,
    });

    const result =
      await service.archiveAfter30days();

    expect(result).toBe(0);

    expect(repository.update)
      .toHaveBeenCalledTimes(1);
  });

  it('should purge old archived jobs', async () => {
    repository.find.mockResolvedValue([
      {
        id: 1,
        archivedAt: new Date(),
        createdAt: new Date(
          Date.now() - 100 * 86400000,
        ),
      },
    ]);

    repository.remove.mockResolvedValue([]);

    const result =
      await service.purgeArchiveJobs();

    expect(result.deleted).toBe(1);
  });

  it('should purge zero jobs when none are eligible', async () => {
    repository.find.mockResolvedValue([]);

    const result =
      await service.purgeArchiveJobs();

    expect(result.deleted).toBe(0);
  });
});

