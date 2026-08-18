// ============================================================================
// Parking Controller - Parking Service Controllers
// ============================================================================

// parking-management-system/services/parking-service/src/controllers/parking.controller.ts

import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ParkingService } from '../services/parking.service';
import { ParkingLotService } from '../services/parking-lot.service';
import { ParkingSpotService } from '../services/parking-spot.service';
import { AvailabilityService } from '../services/availability.service';
import { PricingService } from '../services/pricing.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CreateParkingLotDto } from '../dto/create-parking-lot.dto';
import { UpdateParkingLotDto } from '../dto/update-parking-lot.dto';
import { CreateParkingSpotDto } from '../dto/create-parking-spot.dto';
import { UpdateParkingSpotDto } from '../dto/update-parking-spot.dto';
import { CheckAvailabilityDto } from '../dto/check-availability.dto';
import { CalculatePriceDto } from '../dto/calculate-price.dto';
import { UserRole } from '../../common/enums/user-role.enum';
import { ResponseHandler } from '../../common/utils/response-handler';

@ApiTags('parking')
@Controller('api/v1/parking')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ParkingController {
  constructor(
    private readonly parkingService: ParkingService,
    private readonly parkingLotService: ParkingLotService,
    private readonly parkingSpotService: ParkingSpotService,
    private readonly availabilityService: AvailabilityService,
    private readonly pricingService: PricingService,
  ) {}

  // ============================================================================
  // Parking Lot Management
  // ============================================================================

  @Post('lots')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new parking lot' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Parking lot created' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createParkingLot(@Body() createParkingLotDto: CreateParkingLotDto) {
    const result = await this.parkingLotService.createParkingLot(createParkingLotDto);
    return ResponseHandler.success(result, 'Parking lot created successfully', HttpStatus.CREATED);
  }

  @Get('lots')
  @ApiOperation({ summary: 'Get all parking lots' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Parking lots retrieved' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async getParkingLots(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('latitude') latitude?: number,
    @Query('longitude') longitude?: number,
    @Query('radius') radius?: number,
    @Query('amenities') amenities?: string,
    @Query('minRating') minRating?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('sortBy') sortBy?: string,
  ) {
    const filters = {
      search,
      latitude,
      longitude,
      radius,
      amenities: amenities ? amenities.split(',') : undefined,
      minRating,
      maxPrice,
      sortBy,
    };
    
    const result = await this.parkingLotService.getParkingLots(page, limit, filters);
    return ResponseHandler.success(result, 'Parking lots retrieved successfully');
  }

  @Get('lots/:id')
  @ApiOperation({ summary: 'Get parking lot by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Parking lot retrieved' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Parking lot not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async getParkingLotById(@Param('id') id: string) {
    const result = await this.parkingLotService.getParkingLotById(id);
    return ResponseHandler.success(result, 'Parking lot retrieved successfully');
  }

  @Put('lots/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update parking lot' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Parking lot updated' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Parking lot not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  async updateParkingLot(
    @Param('id') id: string,
    @Body() updateParkingLotDto: UpdateParkingLotDto,
  ) {
    const result = await this.parkingLotService.updateParkingLot(id, updateParkingLotDto);
    return ResponseHandler.success(result, 'Parking lot updated successfully');
  }

  @Patch('lots/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Partially update parking lot' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Parking lot updated' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Parking lot not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  async patchParkingLot(
    @Param('id') id: string,
    @Body() updateParkingLotDto: UpdateParkingLotDto,
  ) {
    const result = await this.parkingLotService.patchParkingLot(id, updateParkingLotDto);
    return ResponseHandler.success(result, 'Parking lot updated successfully');
  }

  @Delete('lots/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete parking lot' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Parking lot deleted' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Parking lot not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  async deleteParkingLot(@Param('id') id: string) {
    await this.parkingLotService.deleteParkingLot(id);
    return ResponseHandler.success(null, 'Parking lot deleted successfully', HttpStatus.NO_CONTENT);
  }

  // ============================================================================
  // Parking Spot Management
  // ============================================================================

  @Post('lots/:lotId/spots')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create parking spot' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Parking spot created' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  async createParkingSpot(
    @Param('lotId') lotId: string,
    @Body() createParkingSpotDto: CreateParkingSpotDto,
  ) {
    const result = await this.parkingSpotService.createParkingSpot(lotId, createParkingSpotDto);
    return ResponseHandler.success(result, 'Parking spot created successfully', HttpStatus.CREATED);
  }

  @Get('lots/:lotId/spots')
  @ApiOperation({ summary: 'Get parking spots by lot' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Parking spots retrieved' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async getParkingSpots(
    @Param('lotId') lotId: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    const result = await this.parkingSpotService.getParkingSpots(lotId, { status, type });
    return ResponseHandler.success(result, 'Parking spots retrieved successfully');
  }

  @Get('spots/:id')
  @ApiOperation({ summary: 'Get parking spot by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Parking spot retrieved' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Parking spot not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async getParkingSpotById(@Param('id') id: string) {
    const result = await this.parkingSpotService.getParkingSpotById(id);
    return ResponseHandler.success(result, 'Parking spot retrieved successfully');
  }

  @Patch('spots/:id/status')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update parking spot status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Parking spot updated' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Parking spot not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  async updateParkingSpotStatus(
    @Param('id') id: string,
    @Body() updateParkingSpotDto: UpdateParkingSpotDto,
  ) {
    const result = await this.parkingSpotService.updateParkingSpotStatus(id, updateParkingSpotDto);
    return ResponseHandler.success(result, 'Parking spot updated successfully');
  }

  // ============================================================================
  // Availability Management
  // ============================================================================

  @Get('availability')
  @ApiOperation({ summary: 'Check parking availability' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Availability checked' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async checkAvailability(@Query() checkAvailabilityDto: CheckAvailabilityDto) {
    const result = await this.availabilityService.checkAvailability(checkAvailabilityDto);
    return ResponseHandler.success(result, 'Availability checked successfully');
  }

  @Get('lots/:id/availability')
  @ApiOperation({ summary: 'Get parking lot availability' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Availability retrieved' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Parking lot not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async getLotAvailability(
    @Param('id') id: string,
    @Query('date') date?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ) {
    const result = await this.availabilityService.getLotAvailability(id, {
      date,
      startTime,
      endTime,
    });
    return ResponseHandler.success(result, 'Availability retrieved successfully');
  }

  @Get('lots/:id/occupancy')
  @ApiOperation({ summary: 'Get parking lot occupancy' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Occupancy retrieved' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Parking lot not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async getLotOccupancy(@Param('id') id: string) {
    const result = await this.availabilityService.getLotOccupancy(id);
    return ResponseHandler.success(result, 'Occupancy retrieved successfully');
  }

  // ============================================================================
  // Pricing Management
  // ============================================================================

  @Post('pricing/calculate')
  @ApiOperation({ summary: 'Calculate parking price' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Price calculated' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async calculatePrice(@Body() calculatePriceDto: CalculatePriceDto) {
    const result = await this.pricingService.calculatePrice(calculatePriceDto);
    return ResponseHandler.success(result, 'Price calculated successfully');
  }

  @Get('lots/:id/pricing')
  @ApiOperation({ summary: 'Get parking lot pricing' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Pricing retrieved' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Parking lot not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async getLotPricing(
    @Param('id') id: string,
    @Query('duration') duration?: number,
    @Query('vehicleType') vehicleType?: string,
  ) {
    const result = await this.pricingService.getLotPricing(id, { duration, vehicleType });
    return ResponseHandler.success(result, 'Pricing retrieved successfully');
  }
}