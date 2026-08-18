// ============================================================================
// Profile E2E Tests - Profile Flow End-to-End Tests
// ============================================================================

// parking-management-system/mobile/e2e/profile.e2e.js

import { device, element, by } from 'detox';
import { 
  waitForElement, 
  tapElement, 
  typeText, 
  loginUser,
  getRandomString,
} from './utils';

describe('Profile Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
    await loginUser('test@example.com', 'Test@123456');
    await tapElement('profileTab');
    await waitForElement('profileScreen');
  });

  describe('Profile Display', () => {
    test('should display user information', async () => {
      await waitForElement('userName');
      await waitForElement('userEmail');
      await waitForElement('userAvatar');
    });

    test('should display profile stats', async () => {
      await waitForElement('bookingCount');
      await waitForElement('vehicleCount');
      await waitForElement('pointsBalance');
    });
  });

  describe('Edit Profile', () => {
    test('should navigate to edit profile', async () => {
      await tapElement('editProfileButton');
      await waitForElement('editProfileScreen');
    });

    test('should show validation errors', async () => {
      await typeText('nameInput', '');
      await tapElement('saveProfileButton');
      await waitForElement('nameError');
    });

    test('should update profile successfully', async () => {
      const newName = `Test User ${getRandomString(4)}`;
      await typeText('nameInput', newName);
      await tapElement('saveProfileButton');
      await waitForElement('profileUpdated');
      await waitForElement('userName', 5000);
    });
  });

  describe('Vehicles', () => {
    test('should navigate to vehicles', async () => {
      await tapElement('vehiclesButton');
      await waitForElement('vehiclesScreen');
    });

    test('should add new vehicle', async () => {
      await tapElement('addVehicleButton');
      await waitForElement('addVehicleForm');
      await typeText('vehicleNameInput', 'Tesla Model 3');
      await typeText('plateNumberInput', 'ABC-1234');
      await tapElement('saveVehicleButton');
      await waitForElement('vehicleAdded');
    });

    test('should set default vehicle', async () => {
      await tapElement('vehicleCard_1');
      await tapElement('setDefaultButton');
      await waitForElement('defaultVehicleSet');
    });

    test('should delete vehicle', async () => {
      await tapElement('vehicleCard_1');
      await tapElement('deleteButton');
      await tapElement('confirmDeleteButton');
      await waitForElement('vehicleDeleted');
    });
  });

  describe('Settings', () => {
    test('should navigate to settings', async () => {
      await tapElement('settingsButton');
      await waitForElement('settingsScreen');
    });

    test('should toggle dark mode', async () => {
      await tapElement('darkModeToggle');
      await waitForElement('darkModeEnabled');
    });

    test('should change language', async () => {
      await tapElement('languageButton');
      await tapElement('spanishLanguage');
      await waitForElement('languageChanged');
    });

    test('should navigate back', async () => {
      await tapElement('backButton');
      await waitForElement('profileScreen');
    });
  });
});