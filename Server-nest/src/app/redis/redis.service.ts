import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async SetUserData(id, data) {
    return await this.redis.set(`user_${id}`, JSON.stringify(data), 'EX', 1800);
  }

  async GetUserData(id) {
    const data = await this.redis.get(`user_${id}`);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  }
}
