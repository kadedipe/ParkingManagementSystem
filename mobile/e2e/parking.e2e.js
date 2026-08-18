// ============================================================================
// Parking E2E Tests - Parking Flow End-to-End Tests
// ============================================================================

// parking-management-system/mobile/e2e/parking.e2e.js

import { device, element, by } from 'detox';
import { 
  waitForElement, 
  tapElement, 
  typeText, 
  loginUser,
  scrollToElement,
} from './utils';

describe('Parking Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
    await loginUser('test@example.com', 'Test@123456');
  });

  describe('Parking List', () => {
    test('should display parking lots', async () => {
      await tapElement('parkingTab');
      await waitForElement('parkingList');
    });

    test('should show parking card details', async () => {
      await waitForElement('parkingCard_1');
      await scrollToElement('parkingCard_5', 'parkingList');
    });

    test('should search for parking', async () => {
      await typeText('searchInput', 'Downtown');
      await tapElement('searchButton');
      await waitForElement('searchResults');
    });

    test('should filter parking by availability', async () => {
      await tapElement('filterButton');
      await tapElement('availableFilter');
      await tapElement('applyFilterButton');
      await waitForElement('filteredResults');
    });

    test('should sort parking by price', async () => {
      await tapElement('sortButton');
      await tapElement('priceSortOption');
      await waitForElement('sortedResults');
    });
  });

  describe('Parking Details', () => {
    test('should navigate to parking details', async () => {
      await tapElement('parkingCard_1');
      await waitForElement('parkingDetailsScreen');
    });

    test('should display parking information', async () => {
      await waitForElement('parkingName');
      await waitForElement('parkingAddress');
      await waitForElement('parkingPrice');
      await waitForElement('parkingRating');
    });

    test('should show available spots', async () => {
      await scrollToElement('spotSection', 'parkingDetailsScroll');
      await waitForElement('spot_A1');
    });

    test('should select a parking spot', async () => {
      await tapElement('spot_A1');
      await waitForElement('selectedSpot');
    });

    test('should navigate to booking', async () => {
      await tapElement('bookNowButton');
      await waitForElement('bookingScreen');
    });
  });

  describe('Parking Map', () => {
    test('should navigate to map view', async () => {
      await tapElement('mapViewButton');
      await waitForElement('parkingMap');
    });

    test('should show parking markers', async () => {
      await waitForElement('parkingMarker_1');
    });

    test('should show parking details on marker tap', async () => {
      await tapElement('parkingMarker_1');
      await waitForElement('markerCallout');
    });
  });
});