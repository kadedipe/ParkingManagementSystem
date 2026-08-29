const user = {
  id: 'faculty-review-user',
  email: 'review@example.edu',
  firstName: 'Kolapo',
  role: 'admin',
};

const authenticate = () => {
  cy.intercept('GET', '**/auth/me', { statusCode: 200, body: { user } });
  cy.intercept('GET', '**/v1/charging-stations/**', {
    statusCode: 200,
    body: [
      {
        id: 'station-001',
        name: 'Main Campus EV Hub',
        status: 'active',
        total_connectors: 8,
        available_connectors: 5,
        occupied_connectors: 3,
        power_level: 'DC fast',
        price_per_kwh: 0.42,
        address: { street: 'Faculty Avenue', city: 'Campus' },
      },
    ],
  });
  cy.intercept('GET', '**/parking/spots*', {
    statusCode: 200,
    body: {
      total: 2,
      items: [
        { id: 'spot-a1', number: 'A-01', status: 'available', type: 'standard', pricePerHour: 2.5 },
        { id: 'spot-e2', number: 'EV-02', status: 'available', type: 'ev_charging', pricePerHour: 4.0 },
      ],
    },
  });
  cy.visit('/dashboard', {
    onBeforeLoad(win) {
      win.localStorage.setItem('auth_token', 'faculty-evidence-token');
    },
  });
};

describe('faculty running-state evidence', () => {
  it('renders the parking management interface', () => {
    authenticate();
    cy.visit('/parking');
    cy.contains('Find Parking', { timeout: 10000 }).should('be.visible');
    cy.contains('Search for available parking spots').should('be.visible');
    cy.screenshot('01-parking-management-running', { capture: 'fullPage' });
  });

  it('renders the EV charging management interface', () => {
    authenticate();
    cy.visit('/charging');
    cy.contains('EV Charging Management', { timeout: 10000 }).should('be.visible');
    cy.contains('Main Campus EV Hub').should('be.visible');
    cy.contains('Available now').should('be.visible');
    cy.screenshot('02-ev-charging-running', { capture: 'fullPage' });
  });
});
