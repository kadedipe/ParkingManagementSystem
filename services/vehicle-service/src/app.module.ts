// ============================================================================
// App Module - Vehicle Service Module
// ============================================================================

// parking-management-system/services/vehicle-service/src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

import { VehicleController } from './controllers/vehicle.controller';
import { MakeController } from './controllers/make.controller';
import { ModelController } from './controllers/model.controller';
import { VehicleService } from './services/vehicle.service';
import { MakeService } from './services/make.service';
import { ModelService } from './services/model.service';
import { VehicleRepository } from './repositories/vehicle.repository';
import { MakeRepository } from './repositories/make.repository';
import { ModelRepository } from './repositories/model.repository';
import {
  Vehicle,
  Make,
  Model,
  VehicleType,
  VehicleFeature,
  VehicleImage,
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
        username: configService.get('DB_USER', 'vehicle_user'),
        password: configService.get('DB_PASSWORD', 'password'),
        database: configService.get('DB_NAME', 'vehicle_db'),
        entities: [Vehicle, Make, Model, VehicleType, VehicleFeature, VehicleImage],
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
  ],
  controllers: [VehicleController, MakeController, ModelController],
  providers: [
    VehicleService,
    MakeService,
    ModelService,
    VehicleRepository,
    MakeRepository,
    ModelRepository,
  ],
  exports: [VehicleService, MakeService, ModelService],
})
export class AppModule {}