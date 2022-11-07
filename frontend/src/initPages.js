import u from 'umbrellajs';
import { RenderElem, HeadPage, DetailsPage, HistoryPage } from './render.js';
import { BankingApi } from './api.js';

export function initAutorization() {
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
        u('.main').html('');
        const href = window.location.href + 'check';
        history.pushState(null, '', href);
        await navigationLoader('Счета', 'check');
      })
      .catch((err) => {
        if (err.type === 'login') {
          RenderElem.error(u('.login-wrapper'), err);
        } else if (err.type === 'password') {
          RenderElem.error(u('.password-wrapper'), err);
        } else {
          throw err;
        }
      })
      .finally(() => {
        u('.spinner').remove();
      });
  });
}

function initNav(path) {
  if (document.querySelector('.header__nav') === null) {
    RenderElem.navMenu(u('.header__line'));
    u('.header__nav-btn').each((node) => {
      u(node).on('click', async () => {
        const namePath = {
          check: 'Счета',
          atm: 'Банкоматы',
          currency: 'Валюта',
          exit: '',
        };
        const p = u(node).attr('data-value');
        await navigationLoader(namePath[p], p);
      });
    });
  }
  u(`.header__nav-btn`).removeClass('header__nav-btn--active');
  if (!path) return;
  u(`.header__nav-btn[data-value=${path}]`).addClass('header__nav-btn--active');
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

export async function navigationLoader(name, path) {
  u('title').text(name);
  const href = window.location.origin + '/' + path;
  history.pushState(null, '', href);

  RenderElem.spinner(u('main'));
  const token = localStorage.getItem('token');

  if (path === 'check') {
    await BankingApi.pullAccaunts(token)
      .then((res) => {
        const CurrentPage = new HeadPage(u('.main'), res.payload);
        const actions = {
          '.check__item-btn': () => {
            navigationLoader(
              'Детали счета',
              `check?details=${u('.check__item-btn').attr('data-id')}`
            );
          },
        };
        CurrentPage.init(actions);
      })
      .catch(async (err) => {
        if (err.type === 'Unauthorized') {
          exitApp();
        } else {
          throw err;
        }
      })
      .finally(() => {
        u('.spinner').remove();
      });
    initNav(path);
    return;
  }

  if (path.startsWith('check?details=')) {
    const id = window.location.search.split('=')[1];
    await BankingApi.pullDetailsAccaunts(token, id)
      .then((res) => {
        const CurrentPage = new DetailsPage(u('.main'), res.payload);
        const actions = {
          '.to-history': () => {
            navigationLoader(
              'История баланса',
              `check?history=${res.payload.account}`
            );
          },
          '.check__button-back': () => {
            navigationLoader('Счета', `check`);
          },
        };
        CurrentPage.init(actions);
      })
      .catch(async (err) => {
        if (err.type === 'Unauthorized') {
          exitApp();
        } else {
          throw err;
        }
      })
      .finally(() => {
        u('.spinner').remove();
      });
    initNav();
    return;
  }

  if (path.startsWith('check?history=')) {
    const id = window.location.search.split('=')[1];
    await BankingApi.pullDetailsAccaunts(token, id)
      .then((res) => {
        const CurrentPage = new HistoryPage(u('.main'), res.payload);
        const actions = {
          '.to-history': () => {
            navigationLoader(
              'История баланса',
              `check?history=${res.payload.account}`
            );
          },
          '.check__button-back': () => {
            navigationLoader('Счета', `check`);
          },
        };
        CurrentPage.init(actions);
      })
      .catch(async (err) => {
        if (err.type === 'Unauthorized') {
          exitApp();
        } else {
          throw err;
        }
      })
      .finally(() => {
        u('.spinner').remove();
      });
    initNav();
    return;
  }

  if (path === 'exit') {
    exitApp();
    return;
  }
}
