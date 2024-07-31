import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { User } from '../models/schemas/user.shema';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async SetUserData(user: User) {
    if (!user) return;
    return await this.redis.set(
      `user_${user._id.toString()}`,
      JSON.stringify(user),
      'EX',
      1800,
    );
  }

  async GetUserData(id) {
    const data = await this.redis.get(`user_${id}`);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  }

  async removeUserCache(id) {
    return await this.redis.del(`user_${id}`);
  }

  async removeData(key: string) {
    return await this.redis.del(key);
  }
}
