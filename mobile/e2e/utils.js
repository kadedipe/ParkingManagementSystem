// ============================================================================
// E2E Utilities - Helper Functions for E2E Tests
// ============================================================================

// parking-management-system/mobile/e2e/utils.js

import { device, element, by, waitFor } from 'detox';

/**
 * Wait for element to appear
 */
export const waitForElement = async (elementId, timeout = 10000) => {
  await waitFor(element(by.id(elementId)))
    .toBeVisible()
    .withTimeout(timeout);
};

/**
 * Tap element by ID
 */
export const tapElement = async (elementId) => {
  await element(by.id(elementId)).tap();
};

/**
 * Type text into input
 */
export const typeText = async (elementId, text) => {
  await element(by.id(elementId)).typeText(text);
};

/**
 * Clear text from input
 */
export const clearText = async (elementId) => {
  await element(by.id(elementId)).clearText();
};

/**
 * Scroll to element
 */
export const scrollToElement = async (elementId, scrollViewId = 'scrollView') => {
  await waitFor(element(by.id(elementId)))
    .toBeVisible()
    .whileElement(by.id(scrollViewId))
    .scroll(50, 'down');
};

/**
 * Swipe element
 */
export const swipeElement = async (elementId, direction, speed = 'fast') => {
  await element(by.id(elementId)).swipe(direction, speed);
};

/**
 * Take screenshot
 */
export const takeScreenshot = async (name) => {
  await device.takeScreenshot(name);
};

/**
 * Login user
 */
export const loginUser = async (email, password) => {
  await waitForElement('emailInput');
  await typeText('emailInput', email);
  await typeText('passwordInput', password);
  await tapElement('loginButton');
  await waitForElement('homeScreen');
};

/**
 * Logout user
 */
export const logoutUser = async () => {
  await tapElement('profileTab');
  await tapElement('settingsButton');
  await tapElement('logoutButton');
  await tapElement('confirmLogoutButton');
  await waitForElement('loginScreen');
};

/**
 * Navigate to tab
 */
export const navigateToTab = async (tabName) => {
  await tapElement(`${tabName}Tab`);
};

/**
 * Create booking
 */
export const createBooking = async (parkingId, spotId) => {
  await navigateToTab('parking');
  await tapElement(`parkingCard_${parkingId}`);
  await tapElement(`spot_${spotId}`);
  await tapElement('bookNowButton');
  await tapElement('confirmBookingButton');
  await waitForElement('bookingConfirmation');
};

/**
 * Get random string
 */
export const getRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Get random email
 */
export const getRandomEmail = () => {
  return `test_${getRandomString(6)}@example.com`;
};

/**
 * Get random password
 */
export const getRandomPassword = () => {
  return `Test@${getRandomString(8)}`;
};