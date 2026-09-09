import { NotFoundException } from '@nestjs/common';
import { EmployersService } from '../employers/employers.service';

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
    jest.resetAllMocks();

    service = new EmployersService(
      repository as any,
    );
  });

  describe('create', () => {
    it('should create an employer profile', async () => {
      const data = {
        userId: 2,
        companyName: 'NovaTech',
        companyDesc: 'Entreprise tech',
      };

      repository.create.mockReturnValue(data);

      repository.save.mockResolvedValue({
        ...data,
      });

      const result = await service.create(data);

      expect(repository.create).toHaveBeenCalledWith(data);

      expect(repository.save).toHaveBeenCalledWith(data);

      expect(result).toEqual(data);
    });
  });

  describe('findAll', () => {
    it('should return all employers', async () => {
      const employers = [
        {
          userId: 2,
          companyName: 'NovaTech',
        },
        {
          userId: 3,
          companyName: 'Epitech',
        },
      ];

      repository.find.mockResolvedValue(employers);

      const result = await service.findAll();

      expect(result).toEqual(employers);

      expect(repository.find).toHaveBeenCalledWith({
        relations: {
          user: true,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return an employer', async () => {
      const employer = {
        userId: 2,
        companyName: 'NovaTech',
      };

      repository.findOne.mockResolvedValue(employer);

      const result = await service.findOne(2);

      expect(result).toEqual(employer);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          userId: 2,
        },
        relations: {
          user: true,
        },
      });
    });

    it('should return null when employer does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('findPublic', () => {
    it('should return only public employer data', async () => {
      const employer = {
        userId: 2,
        companyName: 'NovaTech',
        companyDesc: 'Entreprise spécialisée dans le développement.',
        verifiedAt: new Date(),
      };

      repository.findOne.mockResolvedValue(employer);

      const result = await service.findPublic(2);

      expect(result).toEqual(employer);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          userId: 2,
        },
        select: {
          userId: true,
          companyName: true,
          companyDesc: true,
          verifiedAt: true,
        },
      });
    });

    it('should reject unknown public employer', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.findPublic(999),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('validate', () => {
    it('should verify an employer', async () => {
      const employer = {
        userId: 2,
        verifiedAt: null,
      };

      repository.findOne.mockResolvedValue(employer);

      repository.save.mockImplementation(
        async (value) => value,
      );

      const result = await service.validate(2);

      expect(result.verifiedAt).toBeInstanceOf(Date);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          userId: 2,
        },
      });

      expect(repository.save).toHaveBeenCalledWith(
        employer,
      );
    });

    it('should reject verification when employer does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.validate(999),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('resetValidation', () => {
    it('should remove employer verification', async () => {
      const employer = {
        userId: 2,
        verifiedAt: new Date(),
      };

      repository.findOne.mockResolvedValue(employer);

      repository.save.mockImplementation(
        async (value) => value,
      );

      const result =
        await service.resetValidation(2);

      expect(result.verifiedAt).toBeNull();

      expect(repository.save).toHaveBeenCalledWith(
        employer,
      );
    });

    it('should reject removing verification from unknown employer', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.resetValidation(999),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update employer profile', async () => {
      const employer = {
        userId: 2,
        companyName: 'Ancien nom',
        companyDesc: 'Ancienne description',
      };

      repository.findOne.mockResolvedValue(employer);

      repository.save.mockImplementation(
        async (value) => value,
      );

      const result = await service.update(
        2,
        {
          companyName: 'Nouveau nom',
          companyDesc: 'Nouvelle description',
        } as any,
      );

      expect(result.companyName).toBe(
        'Nouveau nom',
      );

      expect(result.companyDesc).toBe(
        'Nouvelle description',
      );

      expect(repository.save).toHaveBeenCalledWith(
        employer,
      );
    });

    it('should reject update when employer does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.update(
          999,
          {
            companyName: 'Test',
          } as any,
        ),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove employer profile', async () => {
      repository.delete.mockResolvedValue({
        affected: 1,
      });

      const result = await service.remove(2);

      expect(repository.delete).toHaveBeenCalledWith({
        userId: 2,
      });

      expect(result).toEqual({
        affected: 1,
      });
    });
  });
});
