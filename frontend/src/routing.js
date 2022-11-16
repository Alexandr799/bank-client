import u from 'umbrellajs';
import 'simplebar/dist/simplebar.css';
import {
  RenderElem,
  HeadPage,
  DetailsPage,
  HistoryPage,
  BanksPage,
  CurrencyPage,
} from './render.js';
import { BankingApi } from './api.js';
import Navigo from 'navigo';
import {
  validateSum,
  validateAccountNumber,
  lengthValidation,
  notNullSumValid,
  deleteDodInSum,
} from './validation.js';

export function initRouter() {
  function initAutorization() {
    u('.main').html('');
    u('.main').append(RenderElem.loginForm());
    const inputPassword = document.querySelector('.password');
    const inputLogin = document.querySelector('.login');
    inputLogin.addEventListener('input', (e) => {
      e.currentTarget.value = e.currentTarget.value.trim();
      u(e.currentTarget).removeClass('error-input');
      u('.login-wrapper').find('.error').remove();
    });
    inputPassword.addEventListener('input', (e) => {
      e.currentTarget.value = e.currentTarget.value.trim();
      u(e.currentTarget).removeClass('error-input');
      u('.password-wrapper').find('.error').remove();
    });
    u('.main__login-from').on('submit', async (e) => {
      e.preventDefault();
      RenderElem.cleanErrors(u(e.currentTarget));
      RenderElem.spinner(u('.login-form'));
      const password = inputPassword.value;
      const login = inputLogin.value;
      let invalid;
      if (!lengthValidation(login, 6)) {
        RenderElem.error(
          u('.login-wrapper'),
          'Логин должен содержать не менее 6 символов'
        );
        inputLogin.value = '';
        invalid = true;
      }
      if (!lengthValidation(password, 6)) {
        RenderElem.error(
          u('.password-wrapper'),
          'Пароль должен содержать не менее 6 символов'
        );
        inputPassword.value = '';
        invalid = true;
      }
      if (invalid) {
        u('.spinner').remove();
        return;
      }
      await BankingApi.pushlogin(login, password)
        .then(async (res) => {
          localStorage.setItem('token', res.payload.token);
          router.navigate('account');
        })
        .catch((err) => {
          if (err.type === 'login') {
            RenderElem.error(u('.login-wrapper'), err.message);
            inputLogin.value = '';
          } else if (err.type === 'password') {
            RenderElem.error(u('.password-wrapper'), err.message);
            inputPassword.value = '';
          } else if (err.type === 400) {
            RenderElem.error(u('.password-wrapper'), err.message);
            console.log('Какая то ошибка на стороне клиента!');
          } else if (err.type === 500) {
            RenderElem.error(u('.password-wrapper'), err.message);
            console.log('Какая то ошибка на стороне сервера!');
          } else {
            throw err;
          }
        })
        .finally(() => {
          u('.spinner').remove();
        });
    });
  }

  function accountToken(token) {
    if (token === null) {
      u('title').text('Coin');
      history.pushState({}, 'Coin', window.location.origin);
      u('.header__nav').remove();
      initAutorization();
      return true;
    } else {
      return false;
    }
  }

  function exitApp() {
    localStorage.removeItem('token');
    const href = window.location.origin;
    history.pushState(null, '', href);
    u('title').text('Coin');
    u('.header__nav').remove();
    u('.main').html('');
    initAutorization();
  }

  async function newAccountInit(CurrentPage, token) {
    RenderElem.spinner(u('main'));
    u('button').attr('disabled', 'disabled');
    await BankingApi.createAccount(token)
      .then(async () => {
        const accs = await BankingApi.pullAccaunts(token);
        CurrentPage.updateList(accs.payload, (e) => {
          router.navigate(
            `account/details/${u(e.currentTarget).attr('data-id')}`
          );
        });
      })
      .catch(async (err) => {
        if (err.type === 'Unauthorized') {
          exitApp();
        } else if (err.type === 400) {
          u('main').html('');
          RenderElem.error(u('main'), err.message, 'error-big');
          console.log('Какая то ошибка на стороне клиента!');
        } else if (err.type === 500) {
          u('main').html('');
          RenderElem.error(u('main'), err.message, 'error-big');
          console.log('Какая то ошибка на стороне сервера!');
        } else {
          throw err;
        }
      })
      .finally(() => {
        u('.spinner').remove();
        u('button').each((el) => {
          el.removeAttribute('disabled');
        });
      });
  }

  async function makeTranzaction(e, CurrentPage, thisAccauntNumber) {
    const form = u(e.currentTarget);
    const numberInput = form.find('.main__form-tranz-number').nodes[0];
    const sumInput = form.find('.main__form-tranz-count').nodes[0];
    sumInput.blur();
    numberInput.blur();
    const number = numberInput.value;
    const sum = sumInput.value;
    let invalid;
    if (!lengthValidation(number, 5)) {
      RenderElem.error(
        u('.main__form-tranz-wrapper-number'),
        'Минимальное значение номера счета 5 символов'
      );
      numberInput.value = '';
      invalid = true;
    }
    if (!lengthValidation(sum, 1)) {
      RenderElem.error(
        u('.main__form-tranz-wrapper-count'),
        'Введите сумму для перевода'
      );
      sumInput.value = '';
      invalid = true;
    }
    let bal = u('.amount-balance').text().replace(/\s/g, '').replace('₽', '');
    bal = Number(bal);
    if (Number(sum) > bal) {
      RenderElem.error(
        u('.main__form-tranz-wrapper-count'),
        'Недостаточно средств на балансе'
      );
      sumInput.value = '';
      invalid = true;
    }
    if (number === thisAccauntNumber) {
      RenderElem.error(
        u('.main__form-tranz-wrapper-number'),
        'Нельзя перевести средства самому себе!'
      );
      numberInput.value = '';
      invalid = true;
    }
    if (invalid) {
      return;
    }
    let from = location.pathname.split('/');
    from = from[from.length - 1];
    const token = localStorage.getItem('token');
    RenderElem.spinner(u('main'));
    u('button').attr('disabled', 'disabled');
    await BankingApi.transferFunds(from, number, sum, token)
      .then((res) => {
        CurrentPage.updateBalance(res.payload.balance);
        CurrentPage.appendInTable(res.payload);
      })
      .catch((err) => {
        if (err.type === 'Unauthorized') {
          exitApp();
        } else if (err.type === 400) {
          u('main').html('');
          RenderElem.error(u('main'), err.message, 'error-big');
          console.log('Какая то ошибка на стороне клиента!');
        } else if (err.type === 500) {
          u('main').html('');
          RenderElem.error(u('main'), err.message, 'error-big');
          console.log('Какая то ошибка на стороне сервера!');
        } else {
          throw err;
        }
      })
      .finally(() => {
        u('.spinner').remove();
        u('button').each((el) => {
          el.removeAttribute('disabled');
        });
        numberInput.value = '';
        sumInput.value = '';
      });
    return true;
  }

  async function chargeCurence(from, to, token, input, CurrentPage) {
    const inputWrapper = u(input).closest('.currency-charge-input-wrapper');
    input.blur();
    if (from === to) {
      RenderElem.error(inputWrapper, 'Некорректный выбор валют');
      input.value = '';
      return;
    }
    if (input.value.length === 0) {
      RenderElem.error(inputWrapper, 'Введите сумму');
      input.value = '';
      return;
    }
    RenderElem.spinner(u('main'));
    u('button').attr('disabled', 'disabled');
    const amount = Number(input.value);
    await BankingApi.exchangeCurrency(from, to, amount, token)
      .then((res) => {
        CurrentPage.updateAccaunts(res.payload);
      })
      .catch((err) => {
        const errorsTypeFromServer = [
          'Overdraft',
          'Unknown',
          'Invalid',
          'NotEnough',
        ];
        if (err.type === 'Unauthorized') {
          exitApp();
        } else if (err.type === 400) {
          u('main').html('');
          RenderElem.error(u('main'), err.message, 'error-big');
          console.log('Какая то ошибка на стороне клиента!');
        } else if (err.type === 500) {
          u('main').html('');
          RenderElem.error(u('main'), err.message, 'error-big');
          console.log('Какая то ошибка на стороне сервера!');
        } else if (errorsTypeFromServer.includes(err.type)) {
          RenderElem.error(inputWrapper, err.message);
          input.value = '';
        } else {
          throw err;
        }
      })
      .finally(() => {
        u('.spinner').remove();
        u('button').each((el) => {
          el.removeAttribute('disabled');
        });
        input.value = '';
      });
  }

  const router = new Navigo('/');
  let socket;

  router.on('/', () => {
    const token = localStorage.getItem('token');
    if (accountToken(token)) return;
    router.navigate('account');
  });

  router.on('/account', async () => {
    const token = localStorage.getItem('token');
    if (accountToken(token)) return;
    u('title').text('Счета');
    u('main').html('');
    RenderElem.initNav(router, 'account');
    RenderElem.spinner(u('main'));
    await BankingApi.pullAccaunts(token)
      .then((res) => {
        const CurrentPage = new HeadPage(u('.main'), res.payload);
        const actions = [
          [
            '.account__item-btn',
            [
              (e) => {
                router.navigate(
                  `account/details/${u(e.currentTarget).attr('data-id')}`
                );
              },
              'click',
            ],
          ],
          [
            '.account__button',
            [
              async () => {
                await newAccountInit(CurrentPage, token);
              },
              'click',
            ],
          ],
          [
            '.dropdown-sort-wrapper',
            [
              (e) => {
                e.dropdown = true;
                u(e.currentTarget).toggleClass('dropdown-menu--open');
              },
              'click',
            ],
          ],
          [
            'body',
            [
              (e) => {
                if (e.dropdown) return;
                if (u('.dropdown-wrapper').hasClass('dropdown-menu--open')) {
                  u('.dropdown-wrapper').removeClass('dropdown-menu--open');
                }
              },
              'click',
            ],
          ],
          [
            '.balance-sort',
            [
              (e) => {
                e.dropdown = true;
                const data = u('.account__item').clone().nodes;
                const sortedData = data.sort((a, b) => {
                  return (
                    Number(u(a).attr('data-balance')) -
                    Number(u(b).attr('data-balance'))
                  );
                });
                u('.account__list').html('');
                u('.account__list').append(sortedData);
              },
              'click',
            ],
          ],
          [
            '.number-sort',
            [
              (e) => {
                e.dropdown = true;
                const data = u('.account__item').clone().nodes;
                const sortedData = data.sort((a, b) => {
                  return (
                    Number(u(a).attr('data-id')) - Number(u(b).attr('data-id'))
                  );
                });
                u('.account__list').html('');
                u('.account__list').append(sortedData);
              },
              'click',
            ],
          ],
          [
            '.data-sort',
            [
              (e) => {
                e.dropdown = true;
                const data = u('.account__item').clone().nodes;
                const sortedData = data.sort((a, b) => {
                  if (
                    new Date(u(a).attr('data-date')) >
                    new Date(u(b).attr('data-date'))
                  ) {
                    return 1;
                  } else {
                    return -1;
                  }
                });
                u('.account__list').html('');
                u('.account__list').append(sortedData);
              },
              'click',
            ],
          ],
        ];
        CurrentPage.init(actions);
      })
      .catch(async (err) => {
        if (err.type === 'Unauthorized') {
          exitApp();
        } else if (err.type === 400) {
          RenderElem.error(u('main'), err.message, 'error-big');
          console.log('Какая то ошибка на стороне клиента!');
        } else if (err.type === 500) {
          RenderElem.error(u('main'), err.message, 'error-big');
          console.log('Какая то ошибка на стороне сервера!');
        } else {
          throw err;
        }
      })
      .finally(() => {
        u('.spinner').remove();
        RenderElem.activateNavMenu(u('.header__nav'));
      });
    return;
  });

  router.on('account/details/:id', async ({ data }) => {
    const token = localStorage.getItem('token');
    if (accountToken(token)) return;
    u('main').html('');
    RenderElem.initNav(router);
    u('title').text('Детали счета');
    RenderElem.spinner(u('main'));
    const id = data.id;
    await BankingApi.pullDetailsAccaunts(token, id)
      .then((res) => {
        const CurrentPage = new DetailsPage(u('.main'), res.payload);
        const actions = [
          [
            'body',
            [
              (e) => {
                if (e.dropdown) return;
                if (u('.dropdown-wrapper ').hasClass('dropdown-menu--open')) {
                  u('.dropdown-wrapper ').removeClass('dropdown-menu--open');
                }
              },
              'click',
            ],
          ],
          [
            '.to-history',
            [
              () => {
                router.navigate(
                  `account/details/history/${res.payload.account}`
                );
              },
              'click',
            ],
          ],
          [
            '.account__button-back',
            [
              () => {
                router.navigate('account');
              },
              'click',
            ],
          ],
          [
            '.main__form-tranz-details',
            [
              async (e) => {
                e.preventDefault();
                RenderElem.cleanErrors(u(e.currentTarget));
                const number = u(e.currentTarget).find(
                  '.main__form-tranz-number'
                ).nodes[0].value;
                const pathname = location.pathname.split('/');
                const validTrans = await makeTranzaction(
                  e,
                  CurrentPage,
                  pathname[pathname.length - 1]
                );
                if (validTrans) {
                  let saveNumbers = JSON.parse(localStorage.getItem('accs'));
                  if (saveNumbers) {
                    if (!saveNumbers.includes(number)) {
                      saveNumbers.push(number);
                      localStorage.setItem('accs', JSON.stringify(saveNumbers));
                    }
                  } else {
                    localStorage.setItem('accs', JSON.stringify([number]));
                  }
                }
              },
              'submit',
            ],
          ],
          [
            '.main__form-tranz-count',
            [
              (e) => {
                e.currentTarget.value = validateSum(
                  e.currentTarget.value,
                  e.inputType
                );
                if (e.currentTarget.value.length > 0) {
                  u(e.currentTarget).removeClass('error-input');
                  u('.main__form-tranz-wrapper-count').find('.error').remove();
                }
              },
              'input',
            ],
          ],
          [
            '.main__form-tranz-count',
            [
              (e) => {
                e.currentTarget.value = notNullSumValid(e.currentTarget.value);
                e.currentTarget.value = deleteDodInSum(e.currentTarget.value);
              },
              'blur',
            ],
          ],
          [
            '.main__form-tranz-number',
            [
              (e) => {
                e.currentTarget.value = validateAccountNumber(
                  e.currentTarget.value
                );
                if (e.currentTarget.value.length > 0) {
                  u(e.currentTarget).removeClass('error-input');
                  u('.main__form-tranz-wrapper-number').find('.error').remove();
                }
                const wrapper = u(e.currentTarget)
                  .parent()
                  .find('.dropdown-menu');
                RenderElem.initDropdownInput(
                  e.currentTarget.value,
                  wrapper,
                  JSON.parse(localStorage.getItem('accs')),
                  e.currentTarget
                );
              },
              'input',
            ],
          ],
          [
            '.main__form-tranz-number',
            [
              (e) => {
                const wrapper = u(e.currentTarget)
                  .parent()
                  .find('.dropdown-menu');
                RenderElem.initDropdownInput(
                  e.currentTarget.value,
                  wrapper,
                  JSON.parse(localStorage.getItem('accs')),
                  e.currentTarget
                );
              },
              'focus',
            ],
          ],
        ];
        CurrentPage.init(actions);
      })
      .catch(async (err) => {
        if (err.type === 'Unauthorized') {
          exitApp();
        } else if (err.type === 400) {
          RenderElem.error(u('main'), err.message, 'error-big');
          console.log('Какая то ошибка на стороне клиента!');
        } else if (err.type === 500) {
          RenderElem.error(u('main'), err.message, 'error-big');
          console.log('Какая то ошибка на стороне сервера!');
        } else {
          throw err;
        }
      })
      .finally(() => {
        u('.spinner').remove();
        RenderElem.activateNavMenu(u('.header__nav'));
      });
    return;
  });

  router.on('account/details/history/:id', async ({ data }) => {
    const token = localStorage.getItem('token');
    if (accountToken(token)) return;
    u('main').html('');
    RenderElem.initNav(router);
    u('title').text('История баланса');
    RenderElem.spinner(u('main'));
    const id = data.id;
    await BankingApi.pullDetailsAccaunts(token, id)
      .then((res) => {
        const CurrentPage = new HistoryPage(u('.main'), res.payload);
        const actions = [
          [
            '.account__button-back',
            [
              () => {
                router.navigate(`account/details/${id}`);
              },
              'click',
            ],
          ],
        ];

        CurrentPage.init(actions);
      })
      .catch(async (err) => {
        if (err.type === 'Unauthorized') {
          exitApp();
        } else if (err.type === 400) {
          RenderElem.error(u('main'), err.message, 'error-big');
          console.log('Какая то ошибка на стороне клиента!');
        } else if (err.type === 500) {
          RenderElem.error(u('main'), err.message, 'error-big');
          console.log('Какая то ошибка на стороне сервера!');
        } else {
          throw err;
        }
      })
      .finally(() => {
        u('.spinner').remove();
        RenderElem.activateNavMenu(u('.header__nav'));
      });
    return;
  });

  router.on('/banks', async () => {
    const token = localStorage.getItem('token');
    if (accountToken(token)) return;
    u('main').html('');
    u('title').text('Банкоматы');
    RenderElem.initNav(router, 'banks');
    const data = JSON.parse(localStorage.getItem('GeoBanks'));
    if (data != null) {
      const CurrentPage = new BanksPage(u('.main'), data);
      CurrentPage.init();
      RenderElem.activateNavMenu(u('.header__nav'));
      BankingApi.getBanks().then((res) => {
        CurrentPage.updateMap(res.payload);
      });
    } else {
      RenderElem.spinner(u('main'));
      await BankingApi.getBanks()
        .then((res) => {
          localStorage.setItem('GeoBanks', JSON.stringify(res.payload));
          const CurrentPage = new BanksPage(u('.main'), res.payload);
          CurrentPage.init();
        })
        .catch((err) => {
          if (err.type === 400) {
            RenderElem.error(u('main'), err.message, 'error-big');
            console.log('Какая то ошибка на стороне клиента!');
          } else if (err.type === 500) {
            RenderElem.error(u('main'), err.message, 'error-big');
            console.log('Какая то ошибка на стороне сервера!');
          } else if (err.type === 'Unauthorized') {
            exitApp();
          } else {
            throw err;
          }
        })
        .finally(() => {
          u('.spinner').remove();
          RenderElem.activateNavMenu(u('.header__nav'));
        });
    }
  });

  router.on('/currency', async () => {
    const token = localStorage.getItem('token');
    if (accountToken(token)) return;
    u('main').html('');
    u('title').text('Валютный обмен');
    RenderElem.initNav(router, 'currency');
    await Promise.all([
      BankingApi.getCurrencyAccounts(token),
      BankingApi.getKnownCurrwncies(),
    ])
      .then((res) => {
        const CurrentPage = new CurrencyPage(u('.main'), res);
        CurrentPage.init([
          [
            '.dropdown-currency-wrapper',
            [
              (e) => {
                e.dropdown = true;
                u(e.currentTarget).toggleClass('dropdown-menu--open');
              },
              'click',
            ],
          ],
          [
            'body',
            [
              (e) => {
                if (e.dropdown) return;
                if (u('.dropdown-wrapper').hasClass('dropdown-menu--open')) {
                  u('.dropdown-wrapper').removeClass('dropdown-menu--open');
                }
              },
              'click',
            ],
          ],
          [
            '.currency-charge-input',
            [
              (e) => {
                e.currentTarget.value = validateSum(
                  e.currentTarget.value,
                  e.inputType
                );
                if (e.currentTarget.value.length > 0) {
                  u(e.currentTarget).removeClass('error-input');
                  u('.currency-charge-input-wrapper').find('.error').remove();
                }
              },
              'input',
            ],
          ],
          [
            '.currency-charge',
            [
              async (e) => {
                e.preventDefault();
                RenderElem.cleanErrors(u(e.currentTarget));
                const from = u(e.currentTarget)
                  .find('.currency-charge-from-menu .dropdown-value')
                  .text();

                const to = u(e.currentTarget)
                  .find('.currency-charge-to-menu .dropdown-value')
                  .text();
                const token = localStorage.getItem('token');
                const input = u(e.currentTarget).find('.currency-charge-input');
                await chargeCurence(
                  from,
                  to,
                  token,
                  input.nodes[0],
                  CurrentPage
                );
              },
              'submit',
            ],
          ],
          [
            '.currency-charge-input',
            [
              (e) => {
                e.currentTarget.value = notNullSumValid(e.currentTarget.value);
                e.currentTarget.value = deleteDodInSum(e.currentTarget.value);
              },
              'blur',
            ],
          ],
        ]);
      })
      .catch(async (err) => {
        if (err.type === 400) {
          RenderElem.error(u('main'), err.message, 'error-big');
          console.log('Какая то ошибка на стороне клиента!');
        } else if (err.type === 500) {
          RenderElem.error(u('main'), err, 'error-big');
          console.log('Какая то ошибка на стороне сервера!');
        } else if (err.type === 'Unauthorized') {
          exitApp();
        } else {
          throw err;
        }
      })
      .finally(() => {
        u('.spinner').remove();
        RenderElem.activateNavMenu(u('.header__nav'));
      });
    RenderElem.spinner(u('.currency-change-wrapper'));
    if (!socket) {
      socket = BankingApi.getChangedCurrency();
      socket.onmessage = function (e) {
        const data = JSON.parse(e.data);
        RenderElem.renderUlSocketList(data, u('.currency-change-list'));
      };
    }
  });

  router.on('/exit', () => {
    exitApp();
    router.navigate('/');
  });

  router.resolve();
}
