import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.use((req, res, next) => {
    console.log(`Original request: ${req.originalUrl}`);
    next();
  });

  await app.listen(process.env.PORT || 4000);
}

bootstrap();
