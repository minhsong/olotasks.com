import { Controller, Get, Param, Req } from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('/recently')
  @Roles([])
  async getRecentlyNotifications(@Req() req) {
    const user = req.user;
    return await this.notificationService.getRecentlyNotifications(user.id);
  }

  @Get('/unread-count')
  @Roles([])
  async getUnreadCount(@Req() req) {
    return await this.notificationService.getUnreadCount(req.user.id);
  }

  @Get('/unread')
  @Roles([])
  async getUnreadNotifications(@Req() req) {
    return await this.notificationService.getUnreadNotifications(req.user.id);
  }

  @Get('/mark-all-as-read')
  @Roles([])
  async markAllAsRead(@Req() req) {
    return await this.notificationService.markAllAsRead(req.user.id);
  }

  @Get('/mark-as-read/:id')
  @Roles([])
  async markAsRead(@Req() req) {
    return await this.notificationService.markAsRead(req.params.id);
  }

  @Get('/delete/:id')
  @Roles([])
  async deleteNotification(@Req() req) {
    return await this.notificationService.deleteNotification(req.params.id);
  }

  @Get('/delete-all')
  @Roles([])
  async deleteAllNotifications(@Req() req) {
    return await this.notificationService.deleteAllNotifications(req.user.id);
  }

  @Get('/:id')
  @Roles([])
  async getNotificationById(@Req() req, @Param() params) {
    const { id } = params;
    return await this.notificationService.getNotificationById(id);
  }

  @Get('/create')
  @Roles([])
  async createNotification(@Req() req) {
    const notification = req.body;
    return await this.notificationService.createNotification(notification);
  }

  @Get('/get-by-card/:id')
  @Roles([])
  async getNotificationsByCardId(@Req() req, @Param() params) {
    const { id } = params;
    return await this.notificationService.getNotificationsByCardId(id);
  }

  @Get('/get-by-board/:id')
  @Roles([])
  async getNotificationsByBoardId(@Req() req, @Param() params) {
    const { id } = params;
    return await this.notificationService.getNotificationsByBoardId(id);
  }
}