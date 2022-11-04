import u from 'umbrellajs';
import Choices from 'choices.js';

export class RenderElem {
  constructor() {}

  static loginForm() {
    return u('<form>')
      .addClass('login-form', 'main__login-from')
      .append(
        u('<h1>').addClass('title', 'login-form__title').html('Вход в аккаунт')
      )
      .append(
        u('<div>')
          .addClass('login-form__input-wrapper', 'login-wrapper')
          .append(u('<span>').addClass('login-form__descr').html('Логин'))
          .append(u('<input>').addClass('login-form__input', 'login'))
      )
      .append(
        u('<div>')
          .addClass('login-form__input-wrapper', 'password-wrapper')
          .append(u('<span>').addClass('login-form__descr').html('Пароль'))
          .append(
            u('<input>')
              .addClass('login-form__input', 'password')
              .attr('type', 'password')
          )
      )
      .append(u('<button>').addClass('login-form__button').html('Войти'));
  }

  static cleanErrors(elem) {
    elem.find('.error').each((node) => {
      u(node).remove();
    });
    elem.find('.error-input').each((node) => {
      u(node).removeClass('error-input');
    });
  }

  static error(elem, error) {
    elem.find('input').addClass('error-input');
    elem.before(u('<span>').addClass('error').text(error.message));
  }

  static spinner(elem) {
    elem.append(u('<div>').addClass('spinner'));
  }

  static navMenu(elem) {
    const nav = u('<div>')
      .addClass('header__nav')
      .append(u('<button>').text('Банкоматы').attr('data-value', 'atm'))
      .append(u('<button>').text('Счета').attr('data-value', 'check'))
      .append(u('<button>').text('Валюта').attr('data-value', 'currency'))
      .append(u('<button>').text('Выйти').attr('data-value', 'exit'));
    nav.children().addClass('header__nav-btn');
    elem.append(nav);
  }

  static accautsHead(elem, accs) {
    elem.html('');
    const container = u('<div>').addClass('container', 'main__container');
    elem.append(container);
    container
      .append(u('<h1>').addClass('title', 'main__title').text('Ваши счета'))
      .append(
        u('<select>').html(`<option value="">Сортировка</option>
			<option value="number">По номеру</option>
			<option value="balance">По балансу</option>
			<option value="transaction">По последней транзакции</option>`)
      )
      .append(
        u('<button>').addClass('check__button').text('Создать новый счёт')
      );
    const gridAccs = u('<ul>').addClass('check__list');
    for (let a of accs) {
      let balance = String(a.balance);
      balance =
        balance.replace(/(\d{1,3}(?=(?:\d\d\d)+(?!\d)))/g, '$1' + ' ') + ' ₽';
      const date = new Date(a.transactions[0].date);
      const year = date.getFullYear().toString();
      const day = (date.getDay() - 1).toString();
      const month = [
        'Января',
        'Февраля',
        'Марта',
        'Апреля',
        'Мая',
        'Июня',
        'Июля',
        'Августа',
        'Сентября',
        'Октября',
        'Ноября',
        'Дерабря',
      ][date.getMonth()];
      const listItem = u('<li>')
        .addClass('check__item')
        .append(u('<span>').text(`${a.account}`).addClass('check__item-id'))
        .append(u('<span>').text(`${balance}`).addClass('check__item-price'))
        .append(
          u('<span>').text('Последняя транзакция').addClass('check__item-last')
        )
        .append(
          u('<span>')
            .text(`${day + ' ' + month + ' ' + year}`)
            .addClass('check__item-date')
        )
        .append(u('<button>').text('Открыть').addClass('check__item-btn'));
      gridAccs.append(listItem);
    }
    container.append(gridAccs);
    new Choices('select', {
      placeholder: false,
      allowHTML: true,
      searchEnabled: false,
      duplicateItemsAllowed: false,
      itemSelectText: '',
    });
  }
}

export class Page {
  constructor(elemPaste, data) {
    this.elemPaste = elemPaste;
    this.data = data;
  }

  static accautsHead(elem, accs) {
    elem.html('');
    const container = u('<div>').addClass('container', 'main__container');
    elem.append(container);
    container
      .append(u('<h1>').addClass('title', 'main__title').text('Ваши счета'))
      .append(
        u('<select>').html(`<option value="">Сортировка</option>
			<option value="number">По номеру</option>
			<option value="balance">По балансу</option>
			<option value="transaction">По последней транзакции</option>`)
      )
      .append(
        u('<button>').addClass('check__button').text('Создать новый счёт')
      );
    const gridAccs = u('<ul>').addClass('check__list');
    for (let a of accs) {
      let balance = String(a.balance);
      balance =
        balance.replace(/(\d{1,3}(?=(?:\d\d\d)+(?!\d)))/g, '$1' + ' ') + ' ₽';
      const date = new Date(a.transactions[0].date);
      const year = date.getFullYear().toString();
      const day = (date.getDay() - 1).toString();
      const month = [
        'Января',
        'Февраля',
        'Марта',
        'Апреля',
        'Мая',
        'Июня',
        'Июля',
        'Августа',
        'Сентября',
        'Октября',
        'Ноября',
        'Дерабря',
      ][date.getMonth()];
      const listItem = u('<li>')
        .addClass('check__item')
        .append(u('<span>').text(`${a.account}`).addClass('check__item-id'))
        .append(u('<span>').text(`${balance}`).addClass('check__item-price'))
        .append(
          u('<span>').text('Последняя транзакция').addClass('check__item-last')
        )
        .append(
          u('<span>')
            .text(`${day + ' ' + month + ' ' + year}`)
            .addClass('check__item-date')
        )
        .append(u('<button>').text('Открыть').addClass('check__item-btn'));
      gridAccs.append(listItem);
    }
    container.append(gridAccs);
    new Choices('select', {
      placeholder: false,
      allowHTML: true,
      searchEnabled: false,
      duplicateItemsAllowed: false,
      itemSelectText: '',
    });
  }

  static accautsDetails(elem, accs) {}
}
