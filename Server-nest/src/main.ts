import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthGuard } from './guards/auth.guard';
import { ValidationPipe } from '@nestjs/common';
import { RedisService } from './app/redis/redis.service';
import { UserService } from './app/services/user.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);
  const redisService = app.get(RedisService);
  const userService = app.get(UserService);
  app.useGlobalGuards(new AuthGuard(reflector, redisService, userService));
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  await app.listen(process.env.PORT, '0.0.0.0', () => {
    console.log('Server started on port', process.env.PORT);
  });
}
bootstrap();
