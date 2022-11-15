import u from 'umbrellajs';
import logo from './assert/img/Logo.svg';
import { initRouter } from './routing.js';
import 'simplebar';
import './normalize.css';
import '../node_modules/choices.js/public/assets/styles/choices.min.css';
import 'simplebar/dist/simplebar.css';
import './style.scss';
import './media.scss';

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

window.addEventListener('DOMContentLoaded', () => {
  initRouter();
});
