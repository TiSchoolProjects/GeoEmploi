import { ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRole } from './roles.enum';
import { UserStatus } from '../users/entities/user.entity';
import { compare, hash } from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

const compareMock = compare as jest.MockedFunction<typeof compare>;
const hashMock = hash as jest.MockedFunction<typeof hash>;

describe('AuthService', () => {
  const usersService = { findbyEmail: jest.fn() };
  const jwtService = { sign: jest.fn() };
  const configService = { get: jest.fn().mockReturnValue(10) };
  const dataSource = { transaction: jest.fn() };

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    configService.get.mockReturnValue(10);
    service = new AuthService(
      dataSource as any,
      configService as any,
      usersService as any,
      jwtService as any,
    );
  });

  it('retourne null si l’utilisateur est suspendu', async () => {
    usersService.findbyEmail.mockResolvedValue({ status: UserStatus.SUSPENDED });
    await expect(service.validateUser('a@b.fr', 'secret')).resolves.toBeNull();
    expect(compareMock).not.toHaveBeenCalled();
  });

  it('retourne l’utilisateur sans mot de passe si le login est valide', async () => {
    usersService.findbyEmail.mockResolvedValue({
      id: 2,
      email: 'a@b.fr',
      password: 'hash',
      status: UserStatus.ACTIVE,
      role: UserRole.SEEKER,
    });
    compareMock.mockResolvedValue(true as never);

    const result = await service.validateUser('a@b.fr', 'secret');

    expect(result).toEqual({
      id: 2,
      email: 'a@b.fr',
      status: UserStatus.ACTIVE,
      role: UserRole.SEEKER,
    });
  });

  it('génère un JWT au login', async () => {
    jwtService.sign.mockReturnValue('token-test');

    await expect(
      service.login({ id: 2, email: 'a@b.fr', role: UserRole.EMPLOYER }),
    ).resolves.toEqual({ access_token: 'token-test' });

    expect(jwtService.sign).toHaveBeenCalledWith({
      email: 'a@b.fr',
      sub: 2,
      role: UserRole.EMPLOYER,
    });
  });

  it('refuse une inscription seeker si l’email existe déjà', async () => {
    dataSource.transaction.mockImplementation(async (callback: any) =>
      callback({ findOne: jest.fn().mockResolvedValue({ id: 1 }) }),
    );

    await expect(
      service.registerSeeker({ email: 'used@x.fr' } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('crée le user et le profil seeker dans une transaction', async () => {
    hashMock.mockResolvedValue('hashed' as never);
    const manager = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((_entity, data) => ({ ...data })),
      save: jest.fn()
        .mockResolvedValueOnce({ id: 7 })
        .mockResolvedValueOnce({ userId: 7 }),
    };
    dataSource.transaction.mockImplementation(async (callback: any) => callback(manager));

    const result = await service.registerSeeker({
      firstname: 'Jean',
      lastname: 'Test',
      email: 'jean@test.fr',
      password: 'secret',
      skills: ['NestJS'],
      experience: '2 ans',
      availability: 'Immédiate',
    } as any);

    expect(result).toEqual({ message: 'Compte Chercheur créé avec succès.' });
    expect(hashMock).toHaveBeenCalledWith('secret', 10);
    expect(manager.save).toHaveBeenCalledTimes(2);
  }); 
});
