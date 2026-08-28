describe('login visual accessibility', () => {
  it('renders an opaque card with a clickable email field', () => {
    cy.visit('/login');

    cy.contains('Welcome Back!')
      .closest('.MuiPaper-root')
      .should('be.visible')
      .then(($card) => {
        expect(getComputedStyle($card[0]).opacity).to.equal('1');
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
      .should('be.focused');
  });
});
