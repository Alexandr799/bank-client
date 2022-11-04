import u from 'umbrellajs';
import { RenderElem, Page } from './render.js';
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
  console.log(name, path);
  u('title').text(name);
  const href = window.location.origin + '/' + path;
  history.pushState(null, '', href);

  if (path === 'check') {
    u('.main').html('');
    RenderElem.spinner(u('main'));
    await BankingApi.pullAccaunts(localStorage.getItem('token'))
      .then((res) => {
        Page.accautsHead(u('.main'), res.payload);
        u('.check__item').each((node) => {
          u(node)
            .find('button')
            .on('click', () => {
              const n = 'Детали счета';
              const p =
                'check?details=' + u(node).find('.check__item-id').text();
              console.log(n, p);
              navigationLoader(n, p);
            });
        });
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

  if (path === 'exit') {
    exitApp();
    return;
  }

  if (path.startsWith('check?details=')) {
    u('main').html('');

    initNav('check');
  }
}
