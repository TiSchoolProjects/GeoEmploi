import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationStatus } from './entities/application.entity';
import { UserRole } from '../auth/roles.enum';

describe('ApplicationsService', () => {
  const appRepository = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const jobRepository = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
  };

  const notificationsService = {
    create: jest.fn(),
  };

  let service: ApplicationsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ApplicationsService(
      appRepository as any,
      jobRepository as any,
      notificationsService as any,
    );
  });

  it('crée une candidature et notifie l’employeur', async () => {
    const job = { id: 10, employerId: 2, title: 'Développeur', archivedAt: null };
    const created = { jobSeekerId: 3, jobId: 10, status: ApplicationStatus.WAITING };
    const saved = { id: 50, ...created };

    jobRepository.findOne.mockResolvedValue(job);
    appRepository.findOne.mockResolvedValue(null);
    appRepository.create.mockReturnValue(created);
    appRepository.save.mockResolvedValue(saved);

    await expect(service.apply(3, 10)).resolves.toEqual(saved);
    expect(notificationsService.create).toHaveBeenCalledWith(2, 50, 'Développeur');
  });

  it('refuse une candidature en double', async () => {
    jobRepository.findOne.mockResolvedValue({ id: 10, employerId: 2, archivedAt: null });
    appRepository.findOne.mockResolvedValue({ id: 1 });

    await expect(service.apply(3, 10)).rejects.toBeInstanceOf(ConflictException);
  });

  it('refuse une candidature sur une offre archivée', async () => {
    jobRepository.findOne.mockResolvedValue({ id: 10, employerId: 2, archivedAt: new Date() });

    await expect(service.apply(3, 10)).rejects.toBeInstanceOf(NotFoundException);
    expect(appRepository.save).not.toHaveBeenCalled();
  });

  it('refuse à un employeur de lire une candidature qui ne lui appartient pas', async () => {
    appRepository.findOne.mockResolvedValue({
      id: 4,
      jobId: 10,
      jobSeekerId: 3,
      job: {},
    });
    jobRepository.findOneBy.mockResolvedValue({ id: 10, employerId: 99, archivedAt: null });

    await expect(
      service.findOne(4, { userId: 2, role: UserRole.EMPLOYER }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('permet à l’admin de modifier le statut', async () => {
    const application = { id: 4, jobId: 10, status: ApplicationStatus.WAITING };
    appRepository.findOne.mockResolvedValue(application);
    appRepository.save.mockImplementation(async (value) => value);

    const result = await service.updateStatus(
      4,
      ApplicationStatus.ACCEPTED,
      { userId: 1, role: UserRole.ADMIN },
    );

    expect(result.status).toBe(ApplicationStatus.ACCEPTED);
    expect(appRepository.save).toHaveBeenCalled();
  });
  it('should reject application when job does not exist', async () => {
    jobRepository.findOne.mockResolvedValue(null);

    await expect(
      service.apply(1, 999),
    ).rejects.toThrow();
  });

  it('should reject application when job is archived', async () => {
    jobRepository.findOne.mockResolvedValue({
      id: 1,
      archivedAt: new Date(),
    });

    await expect(
      service.apply(2, 1),
    ).rejects.toThrow();
  });

  it('should reject duplicate application', async () => {
    jobRepository.findOne.mockResolvedValue({
      id: 1,
      archivedAt: null,
      employerId: 2,
    });

    appRepository.findOne.mockResolvedValue({
      id: 10,
    });

    await expect(
      service.apply(3, 1),
    ).rejects.toThrow();
  });

  it('should create application', async () => {
    jobRepository.findOne.mockResolvedValue({
      id: 1,
      employerId: 2,
      archivedAt: null,
    });

    appRepository.findOne.mockResolvedValue(null);

    appRepository.create.mockReturnValue({
      jobId: 1,
      jobSeekerId: 3,
    });

    appRepository.save.mockResolvedValue({
      id: 20,
      jobId: 1,
      jobSeekerId: 3,
    });

    const result = await service.apply(3, 1);

    expect(result.id).toBe(20);
  });

  it('should create employer notification after applying', async () => {
    jobRepository.findOne.mockResolvedValue({
      id: 1,
      employerId: 2,
      archivedAt: null,
    });

    appRepository.findOne.mockResolvedValue(null);
    appRepository.create.mockReturnValue({});
    appRepository.save.mockResolvedValue({
      id: 1,
    });

    await service.apply(3, 1);

    expect(notificationsService.create).toHaveBeenCalled();
  });

  it('should return applications for seeker', async () => {
    appRepository.find.mockResolvedValue([
      { id: 1 },
      { id: 2 },
    ]);

    const result =
      await service.findbySeekerId(3);

    expect(result).toHaveLength(2);
  });

  it('should return applications for employer', async () => {
     appRepository.find.mockResolvedValue([
    { id: 1 },
  ]);

  jobRepository.findOneBy.mockResolvedValue({
    id: 10,
    employerId: 2,
    archivedAt: null,
  });

  const result = await service.findbyJobId(
    10,
    {
      userId: 2,
      role: UserRole.EMPLOYER,
    },
  );

  expect(result).toHaveLength(1);
  });

  it('should update application status', async () => {
    appRepository.findOne.mockResolvedValue({
      id: 1,
      jobId: 10,
      status: ApplicationStatus.WAITING,
    });

    jobRepository.findOneBy.mockResolvedValue({
      id: 10,
      employerId: 2,
      archivedAt: null,
    });

    appRepository.save.mockImplementation(
      async (value) => value,
    );

    const result = await service.updateStatus(
      1,
      ApplicationStatus.ACCEPTED,
      {
        userId: 2,
        role: UserRole.EMPLOYER,
      },
    );

    expect(result.status)
      .toBe(ApplicationStatus.ACCEPTED);
  });

  it('should reject update when application does not exist', async () => {
    appRepository.findOne.mockResolvedValue(null);

    await expect(
      service.updateStatus(
        999,
        ApplicationStatus.ACCEPTED,
        {
          userId: 2,
          role: UserRole.EMPLOYER,
        },
      ),
    ).rejects.toThrow();
  });

  it('should save application only once', async () => {
    jobRepository.findOne.mockResolvedValue({
      id: 1,
      employerId: 2,
      archivedAt: null,
    });

    appRepository.findOne.mockResolvedValue(null);
    appRepository.create.mockReturnValue({});
    appRepository.save.mockResolvedValue({ id: 1 });

    await service.apply(3, 1);

    expect(
      appRepository.save,
    ).toHaveBeenCalledTimes(1);
  });
});

