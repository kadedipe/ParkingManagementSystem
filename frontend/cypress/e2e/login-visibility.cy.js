describe('login visual accessibility', () => {
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
        expect(getComputedStyle($card[0]).opacity).to.equal('1');
        const card = $card[0];
        const rect = card.getBoundingClientRect();
        const appViewportWidth = card.ownerDocument.documentElement.clientWidth;
        const viewportCenter = appViewportWidth / 2;
        const cardCenter = rect.left + rect.width / 2;
        expect(Math.abs(cardCenter - viewportCenter)).to.be.lessThan(2);
      });

    cy.get('input[placeholder="Enter your email"]')
      .should('be.visible')
      .and('not.be.disabled')
      .then(($input) => {
        const input = $input[0];
        const rect = input.getBoundingClientRect();
        const target = input.ownerDocument.elementFromPoint(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
        );

        expect(target === input || input.contains(target)).to.equal(true);
      })
      .click()
      .should('be.focused')
      .type('not-an-email')
      .blur();

    cy.contains('Please enter a valid email address').should('be.visible');
    cy.contains('button', 'Sign In').should('be.disabled');
    cy.get('input[placeholder="Enter your password"]').should('be.visible');
    cy.contains('button', 'Forgot password?').should('be.visible');
    cy.contains('button', 'Sign up').should('be.visible');
    cy.contains('a', 'Back to Home').should('have.attr', 'href', '/');
  });
});
