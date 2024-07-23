import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from '../models/schemas/notification.schema';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  async getRecentlyNotifications(userId: string): Promise<Notification[]> {
    return this.notificationModel
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany({ user: userId }, { isRead: true });
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.notificationModel.findByIdAndUpdate(notificationId, {
      isRead: true,
    });
  }

  async createNotification(notification: Notification): Promise<Notification> {
    return await this.notificationModel.create(notification);
  }

  async createNotifications(
    notifications: Notification[],
  ): Promise<Notification[]> {
    return await this.notificationModel.insertMany(notifications);
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await this.notificationModel.findByIdAndDelete(notificationId);
  }

  async deleteAllNotifications(userId: string): Promise<void> {
    await this.notificationModel.deleteMany({ user: userId });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      user: userId,
      isRead: false,
    });
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    return this.notificationModel.find({ user: userId, isRead: false });
  }

  async getNotificationById(notificationId: string): Promise<Notification> {
    return this.notificationModel.findById(notificationId);
  }

  async getNotificationsByCardId(cardId: string): Promise<Notification[]> {
    return this.notificationModel.find({ 'card.id': cardId });
  }

  async getNotificationsByBoardId(boardId: string): Promise<Notification[]> {
    return await this.notificationModel.find({ 'board.id': boardId });
  }
}
