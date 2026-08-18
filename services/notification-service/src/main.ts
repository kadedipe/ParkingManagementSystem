// ============================================================================
// Main Application - Notification Service Entry Point
// ============================================================================

// parking-management-system/services/notification-service/src/main.ts

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import * as helmet from 'helmet';
import * as cors from 'cors';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('NotificationService');

  // Enable compression
  app.use(compression());

  // Enable helmet
  app.use(helmet());

  // Enable CORS
  app.use(cors({
    origin: configService.get('CORS_ORIGIN', '*'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }));

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Global filters
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Notification Service API')
    .setDescription('Notification management microservice API')
    .setVersion('2.0.0')
    .addTag('notifications')
    .addTag('templates')
    .addTag('preferences')
    .addTag('devices')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Setup microservice
  const microserviceOptions: MicroserviceOptions = {
    transport: Transport.REDIS,
    options: {
      host: configService.get('REDIS_HOST', 'redis'),
      port: configService.get('REDIS_PORT', 6379),
      password: configService.get('REDIS_PASSWORD', ''),
      retryAttempts: 5,
      retryDelay: 1000,
    },
  };

  app.connectMicroservice(microserviceOptions);
  await app.startAllMicroservices();

  // Start HTTP server
  const port = configService.get('PORT', 3005);
  await app.listen(port);

  logger.log(`Notification service running on port ${port}`);
  logger.log(`Swagger documentation available at http://localhost:${port}/api/docs`);
}

bootstrap().catch((err) => {
  console.error('Failed to start notification service:', err);
  process.exit(1);
});