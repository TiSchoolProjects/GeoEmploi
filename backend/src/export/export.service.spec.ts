import { NotFoundException, StreamableFile } from '@nestjs/common';
import { ExportService } from './export.service';
import { UserRole } from '../auth/roles.enum';

async function readJson(file: StreamableFile) {
  const chunks: Buffer[] = [];
  for await (const chunk of file.getStream()) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

describe('ExportService', () => {
  const userService = { findOne: jest.fn() };
  const seekerService = { findOne: jest.fn() };
  const employerService = { findOne: jest.fn() };
  const jobService = { findByEmployer: jest.fn() };
  const applicationService = { findbySeekerId: jest.fn() };
  const notificationService = { findMe: jest.fn() };
  const coordinatesService = { convertLambert: jest.fn() };

  let service: ExportService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ExportService(
      userService as any,
      seekerService as any,
      employerService as any,
      jobService as any,
      applicationService as any,
      notificationService as any,
      coordinatesService as any,
    );
  });

  it('exporte un employeur en Lambert-93 sans lat/lng WGS84', async () => {
    employerService.findOne.mockResolvedValue({ userId: 2, companyName: 'NovaTech' });
    jobService.findByEmployer.mockResolvedValue([
      {
        id: 1,
        commune: 'Orléans',
        lat: '47.8735690',
        lng: '1.9113580',
        locationPrecision: 'commune',
      },
    ]);
    notificationService.findMe.mockResolvedValue([]);
    coordinatesService.convertLambert.mockReturnValue({ x: 618618.42, y: 6753135.96 });

    const data = await readJson(await service.export(2, UserRole.EMPLOYER));

    expect(data.jobs[0]).toEqual(expect.objectContaining({
      commune: 'Orléans',
      lambert93: {
        epsg: 'EPSG:2154',
        x: 618618.42,
        y: 6753135.96,
      },
    }));
    expect(data.jobs[0]).not.toHaveProperty('lat');
    expect(data.jobs[0]).not.toHaveProperty('lng');
  });

  it('n’ajoute pas de Lambert-93 si le job n’a pas de coordonnées', async () => {
    employerService.findOne.mockResolvedValue({ userId: 2 });
    jobService.findByEmployer.mockResolvedValue([
      { id: 1, commune: 'Commune à vérifier', lat: null, lng: null },
    ]);
    notificationService.findMe.mockResolvedValue([]);

    const data = await readJson(await service.export(2, UserRole.EMPLOYER));

    expect(data.jobs[0]).not.toHaveProperty('lat');
    expect(data.jobs[0]).not.toHaveProperty('lng');
    expect(data.jobs[0]).not.toHaveProperty('lambert93');
  });

  it('convertit aussi les jobs contenus dans les candidatures seeker', async () => {
    seekerService.findOne.mockResolvedValue({ userId: 3, skills: ['NestJS'] });
    applicationService.findbySeekerId.mockResolvedValue([
      {
        id: 10,
        job: {
          id: 1,
          commune: 'Orléans',
          lat: '47.8735690',
          lng: '1.9113580',
        },
      },
    ]);
    coordinatesService.convertLambert.mockReturnValue({ x: 618618.42, y: 6753135.96 });

    const data = await readJson(await service.export(3, UserRole.SEEKER));

    expect(data.applications[0].job.lambert93.epsg).toBe('EPSG:2154');
    expect(data.applications[0].job).not.toHaveProperty('lat');
    expect(data.applications[0].job).not.toHaveProperty('lng');
  });

  it('exporte le profil admin', async () => {
    userService.findOne.mockResolvedValue({ id: 1, role: UserRole.ADMIN });

    const data = await readJson(await service.export(1, UserRole.ADMIN));

    expect(data.profile).toEqual({ id: 1, role: UserRole.ADMIN });
  });

  it('retourne 404 si le profil employeur est introuvable', async () => {
    employerService.findOne.mockResolvedValue(null);

    await expect(service.export(999, UserRole.EMPLOYER)).rejects.toBeInstanceOf(NotFoundException);
  });
  it('should export Lambert-93 for employer jobs', async () => {
    employerService.findOne.mockResolvedValue({
      userId: 2,
    });

    jobService.findByEmployer.mockResolvedValue([
      {
        id: 1,
        commune: 'Orléans',
        lat: '47.8735690',
        lng: '1.9113580',
      },
    ]);

    notificationService.findMe.mockResolvedValue([]);

    coordinatesService.convertLambert.mockReturnValue({
      x: 618618.42,
      y: 6753135.96,
    });

    const file =
      await service.export(
        2,
        UserRole.EMPLOYER,
      );

    expect(file).toBeDefined();
  });

  it('should call Lambert conversion for geocoded job', async () => {
    employerService.findOne.mockResolvedValue({
      userId: 2,
    });

    jobService.findByEmployer.mockResolvedValue([
      {
        lat: '47.8735690',
        lng: '1.9113580',
      },
    ]);

    notificationService.findMe.mockResolvedValue([]);

    coordinatesService.convertLambert.mockReturnValue({
      x: 1,
      y: 2,
    });

    await service.export(
      2,
      UserRole.EMPLOYER,
    );

    expect(
      coordinatesService.convertLambert,
    ).toHaveBeenCalledWith(
      47.873569,
      1.911358,
    );
  });

  it('should not convert job without coordinates', async () => {
    employerService.findOne.mockResolvedValue({
      userId: 2,
    });

    jobService.findByEmployer.mockResolvedValue([
      {
        commune: 'zebi',
        lat: null,
        lng: null,
      },
    ]);

    notificationService.findMe.mockResolvedValue([]);

    await service.export(
      2,
      UserRole.EMPLOYER,
    );

    expect(
      coordinatesService.convertLambert,
    ).not.toHaveBeenCalled();
  });

  it('should export seeker applications', async () => {
    seekerService.findOne.mockResolvedValue({
      userId: 3,
    });

    applicationService.findbySeekerId.mockResolvedValue([]);

    const result =
      await service.export(
        3,
        UserRole.SEEKER,
      );

    expect(result).toBeDefined();
  });
});

