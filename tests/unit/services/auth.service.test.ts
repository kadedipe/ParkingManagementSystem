// ============================================================================
// Auth Service Tests - Authentication Service Unit Tests
// ============================================================================

// parking-management-system/tests/unit/services/auth.service.test.ts

import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../../../src/services/auth.service';
import { User } from '../../../src/models/user.model';
import { generateMockUser, generateMockRepository, createMockRequest } from '../utils/test-utils';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  const mockUser = generateMockUser();
  const mockRepository = generateMockRepository();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
            verify: jest.fn().mockReturnValue({ id: mockUser.id })
          }
        },
        {
          provide: 'ConfigService',
          useValue: {
            get: jest.fn()
          }
        }
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      
      const result = await authService.validateUser(mockUser.email, 'password123');
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      
      await expect(
        authService.validateUser('invalid@email.com', 'password123')
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      mockRepository.findOne.mockResolvedValue({
        ...mockUser,
        password: 'hashedPassword'
      });
      
      await expect(
        authService.validateUser(mockUser.email, 'wrongpassword')
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return tokens when login is successful', async () => {
      const result = await authService.login(mockUser);
      
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.refreshToken).toBe('mock-jwt-token');
    });
  });

  describe('register', () => {
    const registerData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!'
    };

    it('should create a new user when registration is successful', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({
        ...registerData,
        id: 'new-user-id'
      });
      mockRepository.save.mockResolvedValue({
        ...registerData,
        id: 'new-user-id'
      });
      
      const result = await authService.register(registerData);
      
      expect(result).toHaveProperty('id');
      expect(result.email).toBe(registerData.email);
      expect(result.name).toBe(registerData.name);
    });

    it('should throw BadRequestException when email already exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      
      await expect(authService.register(registerData)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('refreshToken', () => {
    it('should return new tokens when refresh token is valid', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      
      const result = await authService.refreshToken('valid-refresh-token');
      
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      
      await expect(
        authService.refreshToken('invalid-refresh-token')
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('should send reset email when user exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      
      const result = await authService.forgotPassword(mockUser.email);
      
      expect(result).toHaveProperty('message');
      expect(result.message).toContain('reset link sent');
    });

    it('should throw BadRequestException when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      
      await expect(
        authService.forgotPassword('nonexistent@email.com')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('resetPassword', () => {
    it('should reset password when token is valid', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      const newPassword = 'NewPassword123!';
      
      const result = await authService.resetPassword('valid-token', newPassword);
      
      expect(result).toHaveProperty('message');
      expect(result.message).toContain('Password reset successfully');
    });

    it('should throw BadRequestException when token is invalid', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      
      await expect(
        authService.resetPassword('invalid-token', 'NewPassword123!')
      ).rejects.toThrow(BadRequestException);
    });
  });
});