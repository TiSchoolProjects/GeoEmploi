import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async create(receverId: number, applicationId: number, title: string,): Promise<Notification> {
    const notif = this.notificationRepository.create({receverId, applicationId,
        title: 'Nouvelle candidature', message: `Nouvelle candidature pour l'offre: "${title}".`, readAt: null});
    return this.notificationRepository.save(notif);
  }

  async findMe(receverId: number): Promise<Notification[]> {
    return this.notificationRepository.find({where: {receverId}, order: {createdAt: 'DESC'},});
  }

  async nbrUnread(receverId: number) : Promise<number> {
    return this.notificationRepository.count({
      where: {receverId, readAt: IsNull(),},});
  }

  async markRead(id: number, receverId: number,): Promise<Notification> {
    const notif = await this.notificationRepository.findOne({
      where: {id, receverId},});

      if (!notif) {
        throw new NotFoundException("Notification introuvable.");
      }
      if (!notif.readAt) {
        notif.readAt = new Date();
        await this.notificationRepository.save(notif);
      }
      return notif;
  }
}
