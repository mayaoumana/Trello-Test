// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

require('@4tw/cypress-drag-drop')



//fonction de connexion
Cypress.Commands.add('login', () => {
    cy.intercept('GET','https://trello.com/1/Members/me?organizations=all&organization_fields=products%2Cmemberships&fields=').as('login');
    cy.visit(Cypress.env('url'));
    cy.get('.Buttonsstyles__ButtonGroup-sc-1jwidxo-3 > [href="/login"]').click();
    cy.get('#user').type(Cypress.env('mail'));
    cy.get('#login').click();

    cy.origin('https://id.atlassian.com', () => {

      cy.get('#password').type(Cypress.env('password'));
      cy.get('#login-submit').click();
    
    });
    cy.wait('@login').then((interception) => {
      const responseBody = interception.response.body;

      // Vérifier le statut de la requête
      expect(interception.response.statusCode).to.equal(200);
      expect(responseBody.id).eq(Cypress.env('id'));


    });
   
  });

  //fonction update data.json
  Cypress.Commands.add('updateDataJson', (updatedData) => {
    cy.readFile('cypress/fixtures/data.json').then((jsonData) => {
      const mergedData = { ...jsonData, ...updatedData };
      cy.writeFile('cypress/fixtures/data.json', mergedData);
    });
  });


  Cypress.Commands.add("dragTo", { prevSubject: "element" }, (subject, targetEl) => {
    cy.wrap(subject).trigger("dragstart");
    cy.get(targetEl).trigger("drop");
  }
);