function loadingElem(elem, print = true) {
  cy.get('body').then(($body) => {
    const el = $body.find(elem).length;
    if (el === 0) {
      cy.wait(1);
      loadingElem(elem);
    } else {
      if (print) cy.log(`Открылась страница ${$body.find(elem).text()}`);
    }
  });
}

function checkDeleteElem(elem, print = false) {
  cy.get('body').then(($body) => {
    const el = $body.find(elem).length;
    if (el != 0) {
      cy.wait(1);
      checkDeleteElem(elem);
    } else {
      if (print) cy.log(`Удалился элемент ${$body.find(elem).text()}`);
    }
  });
}

function checkTranzaction(Accaut, moneynow, value) {
  cy.get('.main__form-tranz-number').type(Accaut);
  cy.get('.main__form-tranz-count').type(value);
  cy.get('.main__form-tranz-btn').click();
  checkDeleteElem('.spinner');
  cy.get('.main__balance span:last').then(($balance) => {
    const bal = $balance.text().replace(/[^\d]+/g, '');
    expect(Number(bal)).to.equal(Number(moneynow) - value);
    cy.log('Значение баланса уменьшилось на сумму перевода');
  });
}

describe('Тесты базового функционала приложение COIN', () => {
  beforeEach(() => {
    cy.viewport(1600, 800);
  });
  it('Формы авторизации', () => {
    cy.visit('http://localhost:8080/');
    cy.log('Проверяем localStorage, если нет токена попадаем на авторизацию');
    cy.log(`Локал Сторидж = ${localStorage.getItem('token')}`);
    cy.get('main').should(($main) => {
      expect($main).to.have.length(1);
      expect($main.first()).to.contain('Вход в аккаунт');
    });
    cy.log(`Пробуем сразу зайти`);
    cy.get('.login-form__button').click();
    cy.url().should('eq', 'http://localhost:8080/');
    cy.get('form')
      .find('.login-wrapper')
      .find('.error')
      .should(($error) => {
        expect($error).to.contain('Логин должен содержать не менее 6 символов');
      });
    cy.get('form')
      .find('.password-wrapper')
      .find('.error')
      .should(($error) => {
        expect($error).to.contain(
          'Пароль должен содержать не менее 6 символов'
        );
      });

    cy.log(`Пробуем ввести неверный Логин и верный Пароль`);
    cy.get('.login').type('qweqwqqwe');
    cy.get('.password').type('skillbox');
    cy.get('.login-form__button').click();
    cy.url().should('eq', 'http://localhost:8080/');
    cy.get('form')
      .find('.login-wrapper')
      .find('.error')
      .should(($error) => {
        expect($error).to.contain('Вы ввели неверный логин!');
      });

    cy.log(`Пробуем ввести верный Логин и неверный Пароль`);
    cy.get('.login').type('developer');
    cy.get('.password').type('ddddddddddd');
    cy.get('.login-form__button').click();
    cy.url().should('eq', 'http://localhost:8080/');
    cy.get('form')
      .find('.password-wrapper')
      .find('.error')
      .should(($error) => {
        expect($error).to.contain('Вы ввели не верный пароль!');
      });

    cy.log(`Вводим верный пароль и логин`);
    cy.get('.password').type('skillbox');
    cy.get('.login-form__button').click();
    loadingElem('.main__title-accauts');
    cy.url().should('eq', 'http://localhost:8080/account');
    cy.get('h1').should(($title) => {
      expect($title).to.contain('Ваши счета');
    });
    cy.log(
      'Теперь после входа мы можем перейти на любую страницу сайта и нас не будет выкидывать в авторизацию!'
    );

    cy.visit('http://localhost:8080/');
    loadingElem('.main__title-accauts');
    cy.url().should('eq', 'http://localhost:8080/account');

    cy.visit('http://localhost:8080/banks');
    loadingElem('.main__title-bank');
    cy.url().should('eq', 'http://localhost:8080/banks');

    cy.visit('http://localhost:8080/currency');
    loadingElem('.main__title-currency');
    cy.url().should('eq', 'http://localhost:8080/currency');

    cy.visit('http://localhost:8080/account');
    loadingElem('.main__title-accauts');
    cy.url().should('eq', 'http://localhost:8080/account');

    cy.log(
      'Теперь выйдем из приложение и нас перебросит на страницу с авторизацией'
    );

    cy.get('.header__nav-btn[data-value="exit"]').click();
    cy.url().should('eq', 'http://localhost:8080/');
  });

  it('Проверка функционала счетов', () => {
    cy.visit('http://localhost:8080/');
    cy.get('.login').type('developer');
    cy.get('.password').type('skillbox');
    cy.get('.login-form__button').click();

    cy.log('Проверяем наличие карточек счетов и их количество');
    cy.get('.account__item').then(($list) => {
      let countAccaunt = $list.length;
      countAccaunt++;
      cy.get('.account__button').click();
      checkDeleteElem('.spinner');
      cy.get('.account__item').then(($listnew) => {
        expect($listnew).to.have.length(countAccaunt);
        cy.log('Количество счетов увеличилось на 1');
      });

      cy.get(`.account__item:nth-child(${countAccaunt})`).then(($acc) => {
        const numberFromAccaunt = '40722756838703371035835487';
        const moneyInToAccauts = $acc
          .find('.account__item-price')
          .text()
          .replace(/[^\d]+/g, '');
        const numberToAccaut = $acc.find('.account__item-id').text();
        cy.log('Проверяем счет на котором точно есть деньги');
        cy.get(`.account__item[data-id="${numberFromAccaunt}"]`).then(
          ($item) => {
            const moneyInFromAccauts = $item
              .find('.account__item-price')
              .text()
              .replace(/[^\d]+/g, '');
            cy.get(
              `.account__item-btn[data-id="${numberFromAccaunt}"]`
            ).click();
            cy.get('.main__balance span:last').then(($balance) => {
              const bal = $balance.text().replace(/[^\d]+/g, '');
              expect(Number(bal)).to.equal(Number(moneyInFromAccauts));
              cy.log('Значение в балансе  совпадает с балансом карточки');
            });
            checkTranzaction(numberToAccaut, moneyInFromAccauts, 10000);
            cy.get('.account__button-back').click();
            cy.get(`.account__item[data-id="${numberToAccaut}"]`).then(
              ($item) => {
                const newMoneyInToAccautst = $item
                  .find('.account__item-price')
                  .text()
                  .replace(/[^\d]+/g, '');
                expect(Number(newMoneyInToAccautst)).to.equal(
                  Number(moneyInToAccauts) + 10000
                );
                cy.log(
                  'Значение баланса нового счета увеличилось на сумму перевода'
                );
              }
            );
            const newAccauntNumber = numberToAccaut;
            const sumNewAccaunt = moneyInToAccauts + 10000;
            cy.get('.account__item:nth-child(1)').then(($item) => {
              const accauntForTrans = $item.attr('data-id');
              cy.get(
                `.account__item-btn[data-id="${newAccauntNumber}"]`
              ).click();
              cy.get('.main__balance span:last').then(($balance) => {
                const bal = $balance.text().replace(/[^\d]+/g, '');
                expect(Number(bal)).to.equal(Number(sumNewAccaunt));
                cy.log('Значение в балансе  совпадает с балансом карточки');
              });
              checkTranzaction(accauntForTrans, sumNewAccaunt, 5000);
            });
          }
        );
      });
    });
  });
});
