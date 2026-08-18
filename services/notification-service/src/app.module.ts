// ============================================================================
// App Module - Notification Service Module
// ============================================================================

// parking-management-system/services/notification-service/src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bull';
import { redisStore } from 'cache-manager-redis-yet';

import { NotificationController } from './controllers/notification.controller';
import { TemplateController } from './controllers/template.controller';
import { PreferenceController } from './controllers/preference.controller';
import { DeviceController } from './controllers/device.controller';
import { NotificationService } from './services/notification.service';
import { EmailService } from './services/email.service';
import { PushService } from './services/push.service';
import { SmsService } from './services/sms.service';
import { TemplateService } from './services/template.service';
import { PreferenceService } from './services/preference.service';
import { DeviceService } from './services/device.service';
import { NotificationProcessor } from './processors/notification.processor';
import {
  Notification,
  NotificationTemplate,
  NotificationPreference,
  Device,
  NotificationLog,
} from './entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.production'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USER', 'notification_user'),
        password: configService.get('DB_PASSWORD', 'password'),
        database: configService.get('DB_NAME', 'notification_db'),
        entities: [
          Notification,
          NotificationTemplate,
          NotificationPreference,
          Device,
          NotificationLog,
        ],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
        migrations: ['src/migrations/*.ts'],
        migrationsRun: true,
        ssl: configService.get('DB_SSL') === 'true',
        extra: {
          max: 20,
          idleTimeoutMillis: 30000,
        },
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: '7d',
        },
      }),
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          url: `redis://${configService.get('REDIS_HOST')}:${configService.get('REDIS_PORT')}`,
          password: configService.get('REDIS_PASSWORD'),
          ttl: 60 * 60, // 1 hour
        }),
        isGlobal: true,
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD'),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: {
            age: 3600,
            count: 1000,
          },
          removeOnFail: {
            age: 86400,
            count: 10000,
          },
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'email',
    }),
    BullModule.registerQueue({
      name: 'push',
    }),
    BullModule.registerQueue({
      name: 'sms',
    }),
  ],
  controllers: [
    NotificationController,
    TemplateController,
    PreferenceController,
    DeviceController,
  ],
  providers: [
    NotificationService,
    EmailService,
    PushService,
    SmsService,
    TemplateService,
    PreferenceService,
    DeviceService,
    NotificationProcessor,
  ],
  exports: [
    NotificationService,
    EmailService,
    PushService,
    SmsService,
    TemplateService,
  ],
})
export class AppModule {}