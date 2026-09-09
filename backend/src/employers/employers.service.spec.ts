import { NotFoundException } from '@nestjs/common';
import { EmployersService } from './employers.service';

describe('EmployersService', () => {
  const repository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  let service: EmployersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EmployersService(repository as any);
  });

  it('crée un profil employeur', async () => {
    repository.create.mockReturnValue({ userId: 2, companyName: 'NovaTech' });
    repository.save.mockImplementation(async (value) => value);

    await expect(
      service.create({ userId: 2, companyName: 'NovaTech' }),
    ).resolves.toEqual({ userId: 2, companyName: 'NovaTech' });
  });

  it('valide un employeur', async () => {
    const employer = { userId: 2, verifiedAt: null };
    repository.findOne.mockResolvedValue(employer);
    repository.save.mockImplementation(async (value) => value);

    const result = await service.validate(2);

    expect(result.verifiedAt).toBeInstanceOf(Date);
  });

  it('retire la validation d’un employeur', async () => {
    const employer = { userId: 2, verifiedAt: new Date() };
    repository.findOne.mockResolvedValue(employer);
    repository.save.mockImplementation(async (value) => value);

    const result = await service.resetValidation(2);

    expect(result.verifiedAt).toBeNull();
  });

  it('refuse la validation si le compte n’existe pas', async () => {
    repository.findOne.mockResolvedValue(null);
    await expect(service.validate(999)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('met à jour le profil employeur', async () => {
    const employer = { userId: 2, companyName: 'Ancien nom' };
    repository.findOne.mockResolvedValue(employer);
    repository.save.mockImplementation(async (value) => value);

    const result = await service.update(2, { companyName: 'Nouveau nom' } as any);

    expect(result.companyName).toBe('Nouveau nom');
  });
  it('should find employer', async () => {
    repository.findOne.mockResolvedValue({
      userId: 2,
    });

    const result = await service.findOne(2);

    expect(result?.userId).toBe(2);
  });

  it('should return null for unknown employer', async () => {
    repository.findOne.mockResolvedValue(null);

    expect(
      await service.findOne(999),
    ).toBeNull();
  });

  it('should verify employer', async () => {
    repository.findOne.mockResolvedValue({
      userId: 2,
      verifiedAt: null,
    });

    repository.save.mockImplementation(
      async (v) => v,
    );

    const result = await service.validate(2);

    expect(result.verifiedAt)
      .toBeInstanceOf(Date);
  });

  it('should remove employer verification', async () => {
    repository.findOne.mockResolvedValue({
      userId: 2,
      verifiedAt: new Date(),
    });

    repository.save.mockImplementation(
      async (v) => v,
    );

    const result =
      await service.resetValidation(2);

    expect(result.verifiedAt).toBeNull();
  });

  it('should return employers list', async () => {
    repository.find.mockResolvedValue([
      { userId: 1 },
      { userId: 2 },
    ]);

    const result = await service.findAll();

    expect(result).toHaveLength(2);
  });
});

