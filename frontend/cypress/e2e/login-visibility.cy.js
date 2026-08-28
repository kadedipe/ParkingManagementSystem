describe('login visual accessibility', () => {
  it('renders an opaque card with a clickable email field', () => {
    cy.visit('/login');

    cy.contains('Welcome Back!')
      .closest('.MuiPaper-root')
      .should('be.visible')
      .then(($card) => {
        expect(getComputedStyle($card[0]).opacity).to.equal('1');
        const rect = $card[0].getBoundingClientRect();
        const viewportCenter = window.innerWidth / 2;
        const cardCenter = rect.left + rect.width / 2;
        expect(Math.abs(cardCenter - viewportCenter)).to.be.lessThan(2);
      });

    cy.get('input[placeholder="Enter your email"]')
      .should('be.visible')
      .and('not.be.disabled')
      .then(($input) => {
        const input = $input[0];
        const rect = input.getBoundingClientRect();
        const target = document.elementFromPoint(
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
