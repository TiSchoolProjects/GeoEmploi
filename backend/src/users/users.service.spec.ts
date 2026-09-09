import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserStatus } from './entities/user.entity';
import { hash } from 'bcrypt';

jest.mock('bcrypt', () => ({ hash: jest.fn() }));
const hashMock = hash as jest.MockedFunction<typeof hash>;

describe('UsersService', () => {
  const repository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const configService = { get: jest.fn().mockReturnValue(10) };

  let service: UsersService;

  beforeEach(() => {
    jest.clearAllMocks();
    configService.get.mockReturnValue(10);
    service = new UsersService(repository as any, configService as any);
  });

  it('hash le mot de passe à la création', async () => {
    hashMock.mockResolvedValue('hashed-password' as never);
    repository.create.mockImplementation((value) => value);
    repository.save.mockImplementation(async (value) => ({ id: 1, ...value }));

    const result = await service.create({
      email: 'test@test.fr',
      password: 'secret',
    } as any);

    expect(hashMock).toHaveBeenCalledWith('secret', 10);
    expect(result.password).toBe('hashed-password');
  });

  it('met à jour le statut utilisateur', async () => {
    const user = { id: 2, status: UserStatus.ACTIVE };
    repository.findOne.mockResolvedValue(user);
    repository.save.mockImplementation(async (value) => value);

    const result = await service.UpdateStatus(2, { status: UserStatus.SUSPENDED });

    expect(result.status).toBe(UserStatus.SUSPENDED);
  });

  it('retourne 404 lors de la mise à jour d’un utilisateur inexistant', async () => {
    repository.findOne.mockResolvedValue(null);
    await expect(
      service.UpdateUser(999, { firstname: 'Test' } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('refuse une adresse email déjà utilisée par un autre compte', async () => {
    repository.findOne
      .mockResolvedValueOnce({ id: 2, email: 'ancien@test.fr' })
      .mockResolvedValueOnce({ id: 3, email: 'pris@test.fr' });

    await expect(
      service.UpdateUser(2, { email: 'pris@test.fr' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('met à jour les informations utilisateur', async () => {
    const user = { id: 2, firstname: 'Ancien', email: 'a@test.fr' };
    repository.findOne
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(null);
    repository.save.mockImplementation(async (value) => value);

    const result = await service.UpdateUser(2, {
      firstname: 'Nouveau',
      email: 'nouveau@test.fr',
    });

    expect(result.firstname).toBe('Nouveau');
    expect(result.email).toBe('nouveau@test.fr');
  });
  it('should find user by id', async () => {
    repository.findOneBy.mockResolvedValue({
      id: 1,
    });

    const result = await service.findOne(1);

    expect(result?.id).toBe(1);
  });

  it('should find user by email', async () => {
    const getOne = jest.fn().mockResolvedValue({
      id: 1,
      email: 'test@test.fr',
    });

    const queryBuilder = {
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne,
    };

    repository.createQueryBuilder
      .mockReturnValue(queryBuilder);

    const result = await service.findbyEmail(
      'test@test.fr',
    );

    expect(result?.email)
      .toBe('test@test.fr');

    expect(repository.createQueryBuilder)
      .toHaveBeenCalledWith('user');
  });

  it('should return all users', async () => {
    repository.find.mockResolvedValue([
      { id: 1 },
      { id: 2 },
    ]);

    const result = await service.findAll();

    expect(result).toHaveLength(2);
  });

  it('should delete user', async () => {
    repository.delete.mockResolvedValue({
      affected: 1,
    });

    await service.remove(1);

    expect(repository.delete)
      .toHaveBeenCalledWith({id : 1});
  });

  it('should update user', async () => {
    const user = {
      id: 1,
      firstname: 'Jean',
      email: 'jean@test.fr',
    };

    repository.findOne.mockReset();

    repository.findOne
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(null);

    repository.save.mockImplementation(
      async (value) => value,
    );

    const result = await service.UpdateUser(
      1,
      {
        firstname: 'Paul',
        email: 'paul@test.fr',
      } as any,
    );

    expect(result.firstname).toBe('Paul');
    expect(result.email).toBe('paul@test.fr');
  });
});

