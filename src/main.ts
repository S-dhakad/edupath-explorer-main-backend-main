import { mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
  const config = app.get(ConfigService);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(compression());
  app.use(mongoSanitize());
  app.useWebSocketAdapter(new IoAdapter(app));

  app.enableCors({
    origin: config.get<any>('cors.origin'),
    credentials: true,
  });

  const uploadDirName = config.get<string>('media.uploadDir') || 'uploads';
  const uploadRoot = join(process.cwd(), uploadDirName);
  const videosDir = join(uploadRoot, 'videos');
  const kycDir = join(uploadRoot, 'kyc');
  const mediaDir = join(uploadRoot, 'media');
  if (!existsSync(videosDir)) {
    mkdirSync(videosDir, { recursive: true });
  }
  if (!existsSync(kycDir)) {
    mkdirSync(kycDir, { recursive: true });
  }
  if (!existsSync(mediaDir)) {
    mkdirSync(mediaDir, { recursive: true });
  }
  app.useStaticAssets(uploadRoot, { prefix: '/uploads/' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('EduPath Affiliate API')
    .setDescription('Production backend for course marketplace, wallets, referrals, and admin.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  // eslint-disable-next-line no-console
  console.log(`API http://localhost:${port}  Swagger /api/docs`);
}
bootstrap();
