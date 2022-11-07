import u from 'umbrellajs';
import { navigationLoader, initAutorization } from './initPages.js';
import logo from './assert/img/Logo.svg';
import './normalize.css';
import '../node_modules/choices.js/public/assets/styles/choices.min.css';
import './style.scss';

u('body').append(u('<header>').addClass('header'));
u('body').append(u('<main>').addClass('main'));
u('.header').append(u('<div>').addClass('container'));
u('.container').append(
  u('<div>')
    .addClass('header__line')
    .append(
      u('<img>').attr({ src: logo, alt: 'Логотип' }).addClass('header__logo')
    )
);

window.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (token === null) {
    u('title').text('Coin');
    history.pushState(null, '', window.location.origin);
    u('.header__nav').remove();
    initAutorization();
    return false;
  }

  const namePath = {
    check: 'Счета',
    atm: 'Банкоматы',
    currency: 'Валюта',
  };

  let path = window.location.href.replace(window.location.origin, '');
  path = path.substring(1);
  navigationLoader(
    namePath[path] ? namePath[path] : 'Счета',
    path ? path : 'check'
  );
});

u('.qwe').on('click', () => {
  const href = window.location.origin + `#${Math.random()}`;
  history.pushState(null, '', href);
});

window.addEventListener('hashchange', () => {
  console.log(window.location.hash);
});
