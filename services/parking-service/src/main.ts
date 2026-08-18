// ============================================================================
// Main Application - Parking Service Entry Point
// ============================================================================

// parking-management-system/services/parking-service/src/main.ts

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import * as helmet from 'helmet';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('ParkingService');

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

  // Enable validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Parking Service API')
    .setDescription('Parking management microservice API')
    .setVersion('2.0.0')
    .addTag('parking')
    .addTag('spots')
    .addTag('availability')
    .addTag('pricing')
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
  const port = configService.get('PORT', 3002);
  await app.listen(port);

  logger.log(`Parking service running on port ${port}`);
  logger.log(`Swagger documentation available at http://localhost:${port}/api/docs`);
}

bootstrap().catch((err) => {
  console.error('Failed to start parking service:', err);
  process.exit(1);
});