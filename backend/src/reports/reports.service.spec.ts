import { ConflictException, NotFoundException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportReason, ReportStatus } from './entities/report.entity';

describe('ReportsService', () => {
  const reportRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };
  const jobRepository = { findOne: jest.fn() };

  let service: ReportsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReportsService(reportRepository as any, jobRepository as any);
  });

  it('refuse un signalement si l’offre n’existe pas', async () => {
    jobRepository.findOne.mockResolvedValue(null);

    await expect(
      service.create(1, 2, { reason: ReportReason.FRAUD, description: 'Offre frauduleuse' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('refuse un signalement pending en double', async () => {
    jobRepository.findOne.mockResolvedValue({ id: 1 });
    reportRepository.findOne.mockResolvedValue({ id: 10, status: ReportStatus.PENDING });

    await expect(
      service.create(1, 2, { reason: ReportReason.FRAUD, description: 'Offre frauduleuse' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('crée un signalement', async () => {
    jobRepository.findOne.mockResolvedValue({ id: 1 });
    reportRepository.findOne.mockResolvedValue(null);
    reportRepository.create.mockImplementation((value) => value);
    reportRepository.save.mockImplementation(async (value) => ({ id: 5, ...value }));

    const result = await service.create(1, 2, {
      reason: ReportReason.MISLEADING,
      description: 'Description trompeuse',
    });

    expect(result.status).toBe(ReportStatus.PENDING);
    expect(result.id).toBe(5);
  });

  it('résout un signalement', async () => {
    const report = { id: 5, status: ReportStatus.PENDING, resolvedAt: null };
    reportRepository.findOne.mockResolvedValue(report);
    reportRepository.save.mockImplementation(async (value) => value);

    const result = await service.resolve(5);

    expect(result.status).toBe(ReportStatus.RESOLVED);
    expect(result.resolvedAt).toBeInstanceOf(Date);
  });

  it('retourne 404 pour un signalement inexistant', async () => {
    reportRepository.findOne.mockResolvedValue(null);
    await expect(service.resolve(999)).rejects.toBeInstanceOf(NotFoundException);
  });
  it('should reject report when job does not exist', async () => {
    jobRepository.findOne.mockResolvedValue(null);

    await expect(
      service.create(1, 999, {
        reason: 'fraud',
      } as any),
    ).rejects.toThrow();
  });

  it('should reject duplicate pending report', async () => {
    jobRepository.findOne.mockResolvedValue({
      id: 1,
    });

    reportRepository.findOne.mockResolvedValue({
      id: 2,
      status: 'pending',
    });

    await expect(
      service.create(1, 1, {
        reason: 'fraud',
      } as any),
    ).rejects.toThrow();
  });

  it('should create report', async () => {
    jobRepository.findOne.mockResolvedValue({
      id: 1,
    });

    reportRepository.findOne.mockResolvedValue(null);

    reportRepository.create.mockImplementation(
      (value) => value,
    );

    reportRepository.save.mockImplementation(
      async (value) => ({
        id: 10,
        ...value,
      }),
    );

    const result = await service.create(
      1,
      3,
      {
        reason: 'fraud',
        description: 'Offre suspecte',
      } as any,
    );

    expect(result.id).toBe(10);
    expect(result.jobId).toBe(1);
    expect(result.reporterId).toBe(3);
    expect(result.status).toBe('pending');
  });

  it('should return all reports', async () => {
    reportRepository.find.mockResolvedValue([
      { id: 1 },
      { id: 2 },
    ]);

    const result = await service.findAll();

    expect(result).toHaveLength(2);
  });

  it('should resolve report', async () => {
    reportRepository.findOne.mockResolvedValue({
      id: 1,
      status: 'pending',
    });

    reportRepository.save.mockImplementation(
      async (v) => v,
    );

    const result =
      await service.resolve(1);

    expect(result.status)
      .toBe('resolved');
  });

  it('should reject resolving unknown report', async () => {
    reportRepository.findOne.mockResolvedValue(null);

    await expect(
      service.resolve(999),
    ).rejects.toThrow();
  });
});

