import { NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  const repository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    findOne: jest.fn(),
  };

  let service: NotificationsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NotificationsService(repository as any);
  });

  it('crée une notification de nouvelle candidature', async () => {
    const notif = { receverId: 2, applicationId: 5, title: 'Nouvelle candidature' };
    repository.create.mockReturnValue(notif);
    repository.save.mockResolvedValue({ id: 1, ...notif });

    const result = await service.create(2, 5, 'Développeur');

    expect(result.id).toBe(1);
    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
      receverId: 2,
      applicationId: 5,
      title: 'Nouvelle candidature',
      readAt: null,
    }));
  });

  it('compte les notifications non lues', async () => {
    repository.count.mockResolvedValue(4);
    await expect(service.nbrUnread(2)).resolves.toBe(4);
  });

  it('marque une notification comme lue', async () => {
    const notif = { id: 1, receverId: 2, readAt: null };
    repository.findOne.mockResolvedValue(notif);
    repository.save.mockImplementation(async (value) => value);

    const result = await service.markRead(1, 2);

    expect(result.readAt).toBeInstanceOf(Date);
    expect(repository.save).toHaveBeenCalled();
  });

  it('ne sauvegarde pas à nouveau une notification déjà lue', async () => {
    const readAt = new Date();
    repository.findOne.mockResolvedValue({ id: 1, receverId: 2, readAt });

    const result = await service.markRead(1, 2);

    expect(result.readAt).toBe(readAt);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('retourne 404 si la notification n’appartient pas au destinataire', async () => {
    repository.findOne.mockResolvedValue(null);
    await expect(service.markRead(1, 99)).rejects.toBeInstanceOf(NotFoundException);
  });
  it('should create notification', async () => {
    repository.create.mockReturnValue({
      userId: 1,
      message: 'Test',
    });

    repository.save.mockResolvedValue({
      id: 1,
    });

    const result =
      await service.create(
        1,
        42,
        'Test',
      );

    expect(result.id).toBe(1);
  });

  it('should return my notifications', async () => {
    repository.find.mockResolvedValue([
      { id: 1 },
      { id: 2 },
    ]);

    const result =
      await service.findMe(1);

    expect(result).toHaveLength(2);
  });

  it('should count unread notifications', async () => {
    repository.count.mockResolvedValue(3);

    const result =
      await service.nbrUnread(1);

    expect(result).toBe(3);
  });

  it('should mark notification as read', async () => {
    repository.findOne.mockResolvedValue({
      id: 1,
      readAt: null,
    });

    repository.save.mockImplementation(
      async (v) => v,
    );

    const result =
      await service.markRead(1, 1);

    expect(result.readAt)
      .toBeInstanceOf(Date);
  });

  it('should reject missing notification', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(
      service.markRead(999, 1),
    ).rejects.toThrow();
  });

  it('should preserve already read notification', async () => {
    const readAt = new Date();

    repository.findOne.mockResolvedValue({
      id: 1,
      readAt,
    });

    repository.save.mockImplementation(
      async (v) => v,
    );

    const result =
      await service.markRead(1, 1);

    expect(result.readAt).toEqual(readAt);
  });
});

