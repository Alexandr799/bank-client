import u from 'umbrellajs';
import {
  RenderElem,
  HeadPage,
  DetailsPage,
  HistoryPage,
  BanksPage,
} from './render.js';
import { BankingApi } from './api.js';
import Navigo from 'navigo';

export function initRouter() {
  function initAutorization() {
    u('.main').append(RenderElem.loginForm());
    u('.login-form__button').on('click', async (e) => {
      e.preventDefault();
      RenderElem.cleanErrors(u('.login-form'));
      RenderElem.spinner(u('.login-form'));
      const password = document.querySelector('.password').value;
      const login = document.querySelector('.login').value;
      await BankingApi.pushlogin(login, password)
        .then(async (res) => {
          localStorage.setItem('token', res.payload.token);
          router.navigate('check');
        })
        .catch((err) => {
          if (err.type === 'login') {
            RenderElem.error(u('.login-wrapper'), err);
          } else if (err.type === 'password') {
            RenderElem.error(u('.password-wrapper'), err);
          } else if (err.type === 400) {
            RenderElem.error(u('.password-wrapper'), err);
            console.log('Какая то ошибка на стороне клиента!');
          } else if (err.type === 500) {
            RenderElem.error(u('.password-wrapper'), err);
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

  function checkToken(token) {
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

  function initNav(path) {
    if (document.querySelector('.header__nav') === null) {
      RenderElem.navMenu(u('.header__line'));
      u('.header__nav-btn').each((node) => {
        u(node).on('click', async () => {
          const p = u(node).attr('data-value');
          router.navigate(p);
        });
      });
    }
    u(`.header__nav-btn`).removeClass('header__nav-btn--active');
    if (!path) return;
    u(`.header__nav-btn[data-value=${path}]`).addClass(
      'header__nav-btn--active'
    );
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

  const router = new Navigo('/');

  router.on('/', () => {
    const token = localStorage.getItem('token');
    if (checkToken(token)) return;
    router.navigate('check');
  });

  router.on('/check', async () => {
    const token = localStorage.getItem('token');
    if (checkToken(token)) return;
    u('title').text('Счета');
    u('main').html('');
    initNav('check');
    RenderElem.spinner(u('main'));
    await BankingApi.pullAccaunts(token)
      .then((res) => {
        const CurrentPage = new HeadPage(u('.main'), res.payload);
        const actions = {
          '.check__item-btn': (e) => {
            router.navigate(
              `check/details/${u(e.currentTarget).attr('data-id')}`
            );
          },
          '.check__button': async () => {
            RenderElem.spinner(u('main'));
            u('button').attr('disabled', 'disabled');
            await BankingApi.createAccount(token)
              .then(async () => {
                const accs = await BankingApi.pullAccaunts(token);
                console.log(accs);
                CurrentPage.updateList(accs.payload);
              })
              .catch(async (err) => {
                if (err.type === 'Unauthorized') {
                  exitApp();
                } else if (err.type === 400) {
                  u('main').html('');
                  RenderElem.error(u('main'), err, 'error-big');
                  console.log('Какая то ошибка на стороне клиента!');
                } else if (err.type === 500) {
                  u('main').html('');
                  RenderElem.error(u('main'), err, 'error-big');
                  console.log('Какая то ошибка на стороне сервера!');
                } else {
                  throw err;
                }
              })
              .finally(() => {
                u('.spinner').remove();
                document.querySelectorAll('button').forEach((el) => {
                  el.removeAttribute('disabled');
                });
              });
          },
        };
        CurrentPage.init(actions);
      })
      .catch(async (err) => {
        if (err.type === 'Unauthorized') {
          exitApp();
        } else if (err.type === 400) {
          RenderElem.error(u('main'), err, 'error-big');
          console.log('Какая то ошибка на стороне клиента!');
        } else if (err.type === 500) {
          RenderElem.error(u('main'), err, 'error-big');
          console.log('Какая то ошибка на стороне сервера!');
        } else {
          throw err;
        }
      })
      .finally(() => {
        u('.spinner').remove();
      });
    return;
  });

  router.on('check/details/:id', async ({ data }) => {
    const token = localStorage.getItem('token');
    if (checkToken(token)) return;
    u('main').html('');
    initNav();
    u('title').text('Детали счета');
    RenderElem.spinner(u('main'));
    const id = data.id;
    await BankingApi.pullDetailsAccaunts(token, id)
      .then((res) => {
        const CurrentPage = new DetailsPage(u('.main'), res.payload);
        const actions = {
          '.to-history': () => {
            router.navigate(`check/details/history/${res.payload.account}`);
          },
          '.check__button-back': () => {
            router.navigate('check');
          },
        };
        CurrentPage.init(actions);
      })
      .catch(async (err) => {
        if (err.type === 'Unauthorized') {
          exitApp();
        } else if (err.type === 400) {
          RenderElem.error(u('main'), err, 'error-big');
          console.log('Какая то ошибка на стороне клиента!');
        } else if (err.type === 500) {
          RenderElem.error(u('main'), err, 'error-big');
          console.log('Какая то ошибка на стороне сервера!');
        } else {
          throw err;
        }
      })
      .finally(() => {
        u('.spinner').remove();
      });
    initNav();
    return;
  });

  router.on('check/details/history/:id', async ({ data }) => {
    const token = localStorage.getItem('token');
    if (checkToken(token)) return;
    u('main').html('');
    initNav();
    u('title').text('История баланса');
    RenderElem.spinner(u('main'));
    const id = data.id;
    await BankingApi.pullDetailsAccaunts(token, id)
      .then((res) => {
        const CurrentPage = new HistoryPage(u('.main'), res.payload);
        const actions = {
          '.check__button-back': () => {
            router.navigate(`check/details/${id}`);
          },
        };
        CurrentPage.init(actions);
      })
      .catch(async (err) => {
        if (err.type === 'Unauthorized') {
          exitApp();
        } else if (err.type === 400) {
          RenderElem.error(u('main'), err, 'error-big');
          console.log('Какая то ошибка на стороне клиента!');
        } else if (err.type === 500) {
          RenderElem.error(u('main'), err, 'error-big');
          console.log('Какая то ошибка на стороне сервера!');
        } else {
          throw err;
        }
      })
      .finally(() => {
        u('.spinner').remove();
      });
    return;
  });

  router.on('/banks', async () => {
    const token = localStorage.getItem('token');
    if (checkToken(token)) return;
    u('main').html('');
    u('title').text('Банкоматы');
    initNav('banks');
    RenderElem.spinner(u('main'));
    await BankingApi.getBanks()
      .then((res) => {
        const CurrentPage = new BanksPage(u('.main'), res.payload);
        CurrentPage.init();
      })
      .catch(async (err) => {
        if (err.type === 400) {
          RenderElem.error(u('main'), err, 'error-big');
          console.log('Какая то ошибка на стороне клиента!');
        } else if (err.type === 500) {
          RenderElem.error(u('main'), err, 'error-big');
          console.log('Какая то ошибка на стороне сервера!');
        } else {
          throw err;
        }
      })
      .finally(() => {
        u('.spinner').remove();
      });
  });

  router.on('/exit', () => {
    exitApp();
    router.navigate('/');
  });

  router.resolve();
}
