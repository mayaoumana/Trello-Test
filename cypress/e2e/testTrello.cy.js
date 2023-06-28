import '../support/commands';
import 'cypress-real-events/support';
import 'cypress-file-upload';



describe('Test Cartes', () => {
    let data;

    beforeEach(() => {

      cy.readFile('cypress/fixtures/data.json').then((jsonData) => {
      
        data = jsonData;
        
      });
    });
   
    it('Créer Tableau', () => {

    //Connexion
    cy.login();
    //intercepte pour vérifier création de tableau
    cy.intercept('POST','https://api-gateway.trello.com/gateway/api/gasv3/api/v1/batch').as('createTable');
    
    //Clicker sur boutton créer 
    cy.get('[data-testid="header-create-menu-button"]').click();
    //Clicker sur créer  un tableau
    cy.get('[data-testid="header-create-board-button"] > .kgXqyT2weJmrQm').click();
    //Saisir le nom tableau
    cy.get('[data-testid="create-board-title-input"]').type(data.tableName);
    //Clicker sur créer
    cy.get('[data-testid="create-board-submit-button"]').click();

    //Vérifier la création de tableau
    cy.wait('@createTable').then((interception) => {
      // Vérifier le statut de la requête
      expect(interception.response.statusCode).to.equal(200);
      
    });
    //Vérifier le nom de la  table créer
    cy.get('[data-testid="board-name-display"]').should('contain.text',"Projet Java");

   
   
    });

    it('Fermer un Tableau', () => {
    //Connexion
    cy.login();
  
    cy.get(':nth-child(1) > .board-tile > .board-tile-details').click();
    cy.get(':nth-child(1) > .board-tile > .board-tile-fade').click({force: true});
    cy.get(':nth-child(1) > .yhkRJjjbRlcC1Q > .RNC8UUAwghG9uA > .frrHNIWnTojsww').click({force: true});
    //Click pour fermer tableau
    cy.get('.aIwo0vvYqaDzfq > .frrHNIWnTojsww').click();
    //Click pour confirmer la fermeture
    cy.get('.q2PzD_Dkq1FVX3 > .bxgKMAm3lq5BpA').click();
     
    })

    it('Suppression un tableau', () => {
      //Connexion
      cy.login();

      cy.get('.js-react-root > .bxgKMAm3lq5BpA').click();
      //Click pour supprimer tableau
      cy.get(':nth-child(1) > .lMnv4oqGwScA_k > [data-testid="close-board-delete-board-button"]').click();
      //Click pour confirmer suppression tableau
      cy.get('[data-testid="close-board-delete-board-confirm-button"]').click()
      //Assertion qui vérifie que le tableau a été supprimé
      cy.get('body').should('contain', 'Tableau supprimé');
 
      //Fermer
      cy.get('.iQIJMv98X1MtTG > .nch-icon > [data-testid="CloseIcon"]')
   
  });

    it('Ajouter une carte', () => {
    
    //Intercept pour vérifier la création de la carte 
    cy.intercept('POST', 'https://trello.com/1/cards').as('createCard');


    //Connexion
    cy.login();

    //Se rendre sur le tableau
    cy.get('.board-tile-details').click();
    cy.get('[href="/b/OMe1Kd00/test-tableau"]').click();

    //Ajouter une carte à la première liste
    //Click sur Ajouter dans la première liste
    cy.get(':nth-child(1) > .list > .card-composer-container > .open-card-composer > .js-add-a-card').click();
    //Saisir le nom de la carte
    cy.get('[placeholder="Saisissez un titre pour cette carte…"]').type(data.nameCard1);
    //Click sur Ajouter
    cy.get('.cc-controls-section > .nch-button').click();
    //Fermer l'ajout
    cy.get('.cc-controls-section > .icon-lg').click();

    //Vérification de la création de la carte
    cy.wait('@createCard').then((interception) => {
        // Vérifier le statut de la requête
        expect(interception.response.statusCode).to.equal(200);
      
        // Vérifier le corps de la réponse
        const responseBody = interception.response.body;
        expect(responseBody.name).to.equal(data.nameCard1);
        //Récuperer id de la carte
        data.idCard1 = responseBody.idShort;
        //Ajouter id au fichier data
        cy.updateDataJson(data);

        
      });
 
    });

    it('Ajouter un membre à la carte', () => {

    //Intercept pour vérifier l'ajout du memebre à la carte
    cy.intercept('POST', `https://trello.com/1/cards/*/idMembers`).as('addMember');

    //Connexion
    cy.login();

    //Se rendre sur le tableau
    cy.get('.board-tile-details').click();
    cy.get('[href="/b/OMe1Kd00/test-tableau"]').click();

    //Choisir la carte crée par id 
    cy.contains(`span.card-short-id.hide`, `#${data.idCard1}`).click({ force: true });

    //Attribuer un membre
    cy.get('.js-change-card-members').click();
    cy.get('.name').click();
    cy.get('.pop-over-header-close-btn').click();
    cy.get('.icon-md').click();

    //Vérification de la création de la carte
    cy.wait('@addMember').then((interception) => {
    // Vérifier le statut de la requête
    expect(interception.response.statusCode).to.equal(200);
        
    // Vérifier le corps de la réponse
    const responseBody = interception.response.body[0].nonPublic;

    cy.log(responseBody.fullName);
    expect(responseBody.fullName).to.equal(data.fullName);
   
    });

    });
    it('Ajouter une date début et une date de fin à la carte', () => {

    cy.intercept('PUT',`https://trello.com/1/cards/*`).as('addDate');
     
    //Connexion
    cy.login();

    //Se rendre sur le tableau
    cy.get('.board-tile-details').click();
    cy.get('[href="/b/OMe1Kd00/test-tableau"]').click();

    //Choisir la carte crée par id 
    cy.contains(`span.card-short-id.hide`, `#${data.idCard1}`).click({ force: true });
    //Sélectionner date
    cy.get('[data-testid="card-back-due-date-button"]').click();
    //Choisir 27 comme date du fin
    cy.get('.css-1o0bik5').contains('27').click();
    //Sélectionner date debut
    //cy.contains('div.qiRZsRWzF1UVUP').click();
    cy.get(':nth-child(1) > .qiRZsRWzF1UVUP > .x__X83c1QM1uFb').click();                       
  
    //Choisir 22 comme date du début
    cy.get('.css-1o0bik5').contains('22').click();
    cy.get('[data-testid="save-date-button"]').click();

    //Vérification de lajout de la date
    cy.wait('@addDate').then((interception) => {
      // Vérifier le statut de la requête
      expect(interception.response.statusCode).to.equal(200);
      // Vérifier la date
      const responseBody = interception.response.body.badges
      expect(responseBody.due).contains("2023-06-27");



      
    });

    });

    it('Ajouter un fichier à la carte', () => {
      //Connexion
      cy.login();

      cy.intercept('POST',`https://trello.com/1/cards/*/attachments`).as('attachement');
     
      //Se rendre sur le tableau
      cy.get('.board-tile-details').click();
      cy.get('[href="/b/OMe1Kd00/test-tableau"]').click();

      //Choisir la carte crée par id 
      cy.contains(`span.card-short-id.hide`, `#${data.idCard1}`).click({ force: true });

      cy.get(".u-clearfix > .js-attach").click();
      cy.get(".js-attach-file").attachFile(data.fileName);
      cy.get(".js-add-attachment-url").click();
      cy.get(".attachment-thumbnail-name").contains(data.fileName);

      //Intercepte pour vérifierl'ajout d'attachement
      cy.wait('@attachement').then( (interception)=> {
          // Vérifier le statut de la requête
      expect(interception.response.statusCode).to.equal(200);
      // Vérifier le nom de fichier
      const responseBody = interception.response.body;
      //Vérifier le nom de fichier
      expect(responseBody.name).contains(data.fileName);

      });
  
    });
  

    it('Déplacer une carte',() => {
    
    //Connexion
    cy.login();

    //Se rendre sur le tableau
    cy.get('.board-tile-details').click();
    cy.get('[href="/b/OMe1Kd00/test-tableau"]').click();
    cy.viewport(1000, 600);

    //L'element draggable .drag la source
   cy.get('a.list-card.js-member-droppable.ui-droppable[data-testid="trello-card"][href*="learn-python"]')
   .drag(':nth-child(2) > .list > [data-testid="list-header"] > .list-header-target',{force:true});


  
    });

    it('Supprimer une carte', () => {

      //Connexion
      cy.login();

      //Se rendre sur le tableau
      cy.get('.board-tile-details').click();
      cy.get('[href="/b/OMe1Kd00/test-tableau"]').click();

      //Choisir la carte crée par id 
      cy.contains(`span.card-short-id.hide`, `#${data.idCard1}`).click({ force: true });
      //Click Archiver
      cy.get('.js-archive-card').click();
      //Click Supprimer
      cy.get('.js-delete-card').click();
      //Confirmer la suppression
      cy.get('.pop-over-content > :nth-child(1) > div > [data-testid]').click();
      //cy.get('.board-menu-header-close-button').click();
    });
            

    it.skip("API creat a card request", () => {
      cy.request({
        method: "POST",
        url: `https://api.trello.com/1/cards?idList=${data.idList}&key=${data.APIKey}&token=${data.token}`,
        failOnStatusCode: false,
        headers: {
          Accept: "application/json",
        },
        body: {
          name: "Im the bosse",
          desc: "No we are the bosses",
        },
      }).then((interception) => {
        //Vérifier la reponse de la requête
        expect(interception.status).to.eq(200);

        const responseBody = interception.body;
        //Récuperer id de la carte
        data.idCard2 = responseBody.id;
        //Ajouter id au fichier data
        cy.updateDataJson(data);

      });
    });




  
            });
            
     
           
  
          
            





