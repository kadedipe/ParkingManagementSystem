// ============================================================================
// App Module - Parking Service Module
// ============================================================================

// parking-management-system/services/parking-service/src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

import { ParkingController } from './controllers/parking.controller';
import { ParkingService } from './services/parking.service';
import { ParkingLotService } from './services/parking-lot.service';
import { ParkingSpotService } from './services/parking-spot.service';
import { AvailabilityService } from './services/availability.service';
import { PricingService } from './services/pricing.service';
import { ParkingLotRepository } from './repositories/parking-lot.repository';
import { ParkingSpotRepository } from './repositories/parking-spot.repository';
import { ParkingLot, ParkingSpot, PricingRule } from './entities';

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
        username: configService.get('DB_USER', 'parking_user'),
        password: configService.get('DB_PASSWORD', 'password'),
        database: configService.get('DB_NAME', 'parking_db'),
        entities: [ParkingLot, ParkingSpot, PricingRule],
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
  controllers: [ParkingController],
  providers: [
    ParkingService,
    ParkingLotService,
    ParkingSpotService,
    AvailabilityService,
    PricingService,
    ParkingLotRepository,
    ParkingSpotRepository,
  ],
  exports: [ParkingService, ParkingLotService],
})
export class AppModule {}