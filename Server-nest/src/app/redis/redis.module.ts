import { RedisModule as NestRedisModule } from '@nestjs-modules/ioredis';
import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';

@Module({
  providers: [RedisService],
  controllers: [],
  exports: [RedisService],
  imports: [
    NestRedisModule.forRoot({
      url: 'redis://159.223.178.49:6379',
      type: 'single',

      options: {
        password: 'olotasksredis@123',
      },
    }),
  ],
})
export class RedisModule {}
