describe('login visual accessibility', () => {
  it('renders a protected route after restoring an authenticated session', () => {
    cy.intercept('GET', '**/auth/me', {
      statusCode: 200,
      body: {
        id: 'dashboard-user',
        email: 'dashboard@example.com',
        firstName: 'Dashboard',
        role: 'user',
      },
    });
    cy.intercept('GET', '**/notifications*', {
      statusCode: 200,
      body: { items: [], unreadCount: 0, total: 0 },
    });
    cy.intercept('GET', '**/parking/spots*', {
      statusCode: 200,
      body: { items: [], total: 0 },
    });

    cy.visit('/parking', {
      onBeforeLoad(win) {
        win.localStorage.setItem('auth_token', 'valid-dashboard-token');
      },
    });

    // Rendering this protected route proves the authenticated App effects,
    // including the welcome toast callback, completed without a render crash.
    cy.contains('Find Parking', { timeout: 10000 }).should('be.visible');
    cy.contains('Loading application...').should('not.exist');
  });

  it('does not request protected notification data before login', () => {
    let notificationRequests = 0;

    cy.intercept('GET', '**/notifications*', (request) => {
      notificationRequests += 1;
      request.reply({ statusCode: 401, body: { detail: 'Unauthorized' } });
    });

    cy.visit('/login');
    cy.get('input[placeholder="Enter your email"]', { timeout: 10000 })
      .should('be.visible');
    cy.wait(1000).then(() => {
      expect(notificationRequests).to.equal(0);
    });
  });

  it('recovers from a stale token when session validation hangs', () => {
    const startedAt = Date.now();

    cy.intercept('GET', '**/auth/me', {
      delay: 12000,
      statusCode: 200,
      body: { user: { id: 'late-user' } },
    }).as('hangingSession');

    cy.visit('/login', {
      onBeforeLoad(win) {
        win.localStorage.setItem('auth_token', 'stale-token');
        win.localStorage.setItem('refresh_token', 'stale-refresh-token');
        win.localStorage.setItem('user_data', JSON.stringify({ id: 'stale-user' }));
      },
    });

    cy.get('input[placeholder="Enter your email"]', { timeout: 10000 })
      .should('be.visible')
      .then(() => {
        expect(Date.now() - startedAt).to.be.lessThan(10000);
      });

    cy.window().then((win) => {
      expect(win.localStorage.getItem('auth_token')).to.equal(null);
      expect(win.localStorage.getItem('refresh_token')).to.equal(null);
      expect(win.localStorage.getItem('user_data')).to.equal(null);
    });
  });

  it('renders an opaque card with a clickable email field', () => {
    cy.visit('/login');

    cy.contains('Welcome Back!')
      .closest('.MuiPaper-root')
      .should('be.visible')
      .then(($card) => {
