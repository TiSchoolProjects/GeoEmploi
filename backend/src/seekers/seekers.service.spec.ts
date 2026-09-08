import { NotFoundException } from '@nestjs/common';
import { SeekersService } from './seekers.service';

describe('SeekersService', () => {
  const repository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  let service: SeekersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SeekersService(repository as any);
  });

  it('crée un profil seeker', async () => {
    repository.create.mockReturnValue({ userId: 3, skills: ['NestJS'] });
    repository.save.mockImplementation(async (value) => value);

    await expect(service.create({ userId: 3, skills: ['NestJS'] })).resolves.toEqual({
      userId: 3,
      skills: ['NestJS'],
    });
  });

  it('retourne un seeker existant', async () => {
    repository.findOne.mockResolvedValue({ userId: 3 });
    await expect(service.findOne(3)).resolves.toEqual({ userId: 3 });
  });

  it('retourne 404 si le seeker n’existe pas', async () => {
    repository.findOne.mockResolvedValue(null);
    await expect(service.findOne(999)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('met à jour le profil seeker', async () => {
    const seeker = { userId: 3, skills: ['JS'], experience: '1 an' };
    repository.findOne.mockResolvedValue(seeker);
    repository.save.mockImplementation(async (value) => value);

    const result = await service.update(3, {
      skills: ['NestJS'],
      experience: '2 ans',
    } as any);

    expect(result.skills).toEqual(['NestJS']);
    expect(result.experience).toBe('2 ans');
  });

  it('supprime le profil seeker', async () => {
    repository.delete.mockResolvedValue({ affected: 1 });
    await service.remove(3);
    expect(repository.delete).toHaveBeenCalledWith({ userId: 3 });
  });
  it('should find seeker', async () => {
    repository.findOne.mockResolvedValue({
      userId: 3,
    });

    const result = await service.findOne(3);

    expect(result?.userId).toBe(3);
  });

  it('should reject missing seeker', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(
      service.findOne(999),
    ).rejects.toThrow(NotFoundException);
  });

  it('should return seekers list', async () => {
    repository.find.mockResolvedValue([
      { userId: 1 },
      { userId: 2 },
    ]);

    const result = await service.findAll();

    expect(result).toHaveLength(2);
  });

  it('should update seeker profile', async () => {
    repository.findOne.mockResolvedValue({
      userId: 3,
      skills: [],
    });

    repository.save.mockImplementation(
      async (v) => v,
    );

    const result = await service.update(
      3,
      {
        skills: ['NestJS'],
      } as any,
    );

    expect(result.skills)
      .toContain('NestJS');
  });
});

