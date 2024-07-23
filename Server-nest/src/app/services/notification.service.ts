import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from '../models/schemas/notification.schema';
import { ObjectId } from 'mongodb';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  async getRecentlyNotifications(
    userId: string,
  ): Promise<{ notifications: Notification[]; unreadCount: number }> {
    const unreadCount = await this.notificationModel.countDocuments({
      user: new ObjectId(userId),
      isRead: false,
    });
    const notis = await this.notificationModel
      .find({ user: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
    return { unreadCount, notifications: notis };
  }

  async markAllAsRead(userId: string): Promise<any> {
    return await this.notificationModel.updateMany(
      { user: new ObjectId(userId) },
      { isRead: true },
    );
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
    return await this.notificationModel.countDocuments({
      user: new ObjectId(userId),
      isRead: false,
    });
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    return this.notificationModel.find({
      user: new ObjectId(userId),
      isRead: false,
    });
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
