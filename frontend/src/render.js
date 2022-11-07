import u from 'umbrellajs';
import Choices from 'choices.js';
import Chart from 'chart.js/auto';

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
}

class Page {
  constructor(elemPaste, data = {}) {
    this.elemPaste = elemPaste;
    this.data = data;
  }

  parseMethods(btnActionObj) {
    for (let btn of Object.keys(btnActionObj)) {
      u(btn).on('click', () => {
        btnActionObj[btn]();
      });
    }
  }
}

export class HeadPage extends Page {
  render(elem, accs) {
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
      const day = date.getDate().toString();
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
        .append(
          u('<button>')
            .text('Открыть')
            .addClass('check__item-btn')
            .attr('data-id', `${a.account}`)
        );
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

  init(btnActionObj) {
    this.render(this.elemPaste, this.data);
    this.parseMethods(btnActionObj);
    return;
  }
}

export class DetailsPage extends Page {
  cleanData(transactions, balanceCurrent, lastTrans, countStat) {
    const monthsList = [
      'Янв',
      'Фев',
      'Мар',
      'Апр',
      'Май',
      'Июн',
      'Июл',
      'Авг',
      'Сен',
      'Окт',
      'Ноя',
      'Дек',
    ];
    const month = lastTrans.getMonth();
    let m = month;
    const data = [];
    let balance = balanceCurrent;
    for (let i = transactions.length - 1; i > 0; i--) {
      if (m <= month - countStat) break;
      const transDate = new Date(transactions[i].date);
      if (transDate.getMonth() < m) {
        data.push([monthsList[m - 1], balance]);
        m--;
      }
      balance = balance - transactions[i].amount;
      if (m < 0) {
        m = 12;
      }
    }
    const dataKeys = data.map((el) => {
      return el[0];
    });

    const dataVal = data.map((el) => {
      return el[1];
    });
    return [dataKeys.reverse(), dataVal.reverse()];
  }

  render(elem, accs) {
    elem.html('');
    const container = u('<div>').addClass('container', 'main__container');
    elem.append(container);
    container
      .append(
        u('<h1>')
          .addClass('title', 'main__title', 'main__title-details')
          .text('Просмотр счёта')
      )
      .append(
        u('<h2>')
          .addClass('subtitle', 'main__subtitle')
          .text(`№${accs.account}`)
      )
      .append(
        u('<button>')
          .addClass('check__button', 'check__button-back')
          .text('Вернуться назад')
      );

    const form = u('<form>').addClass('main__form-tranz-details');
    container.append(form);
    form
      .append(
        u('<h3>')
          .addClass('title-form', 'main__title-form')
          .html('Новый перевод')
      )
      .append(
        u('<div>')
          .addClass('main__form-tranz-wrapper-number')
          .append(
            u('<span>')
              .text('Номер счёта получателя')
              .addClass('main__form-tranz-descr')
          )
          .append(
            u('<select>')
              .addClass('main__form-tranz-number')
              .attr('placeholder', 'Введите номер счета')
          )
      )
      .append(
        u('<div>')
          .addClass('main__form-tranz-wrapper-count')
          .append(
            u('<span>')
              .text('Сумма перевода')
              .addClass('main__form-tranz-descr')
          )
          .append(
            u('<input>')
              .addClass('main__form-tranz-count')
              .attr('placeholder', 'Введите сумму')
          )
      )
      .append(u('<button>').addClass('main__form-tranz-btn').html('Отправить'));

    new Choices('select', {
      placeholder: false,
      allowHTML: true,
      searchEnabled: false,
      duplicateItemsAllowed: false,
      itemSelectText: '',
    });

    container.append(
      u('<h3>').addClass('main__table-title').text('История переводов')
    );

    const table = u('<div>').addClass('main__history-table');
    container.append(table);
    const head = u('<div>').addClass('main__table-head', 'to-history');
    table.append(head);
    for (let i of ['Счёт отправителя', 'Счёт получателя', 'Сумма', 'Дата']) {
      head.append(u('<div>').text(i));
    }
    const trans = accs.transactions;
    for (let i = trans.length; i > trans.length - 10; i--) {
      const row = u('<div>').addClass('main__history-row');
      row.append(u('<div>').text(trans[i - 1].from));
      row.append(u('<div>').text(trans[i - 1].to));
      let amount = trans[i - 1].amount;
      const classAmount = amount > 0 ? 'debit' : 'credit';
      amount = amount > 0 ? `+${amount} ₽` : `-${amount} ₽`;
      row.append(u('<div>').text(amount).addClass(classAmount));
      let date = new Date(trans[i - 1].date);
      const day = date.getDate().toString();
      const month = date.getMonth().toString();
      const year = date.getFullYear().toString();
      date = day + '.' + month + '.' + year;
      row.append(u('<div>').text(date));
      table.append(row);
    }

    const balance = u('<div>').addClass('main__balance');
    container.append(balance);
    balance.append(u('<span>').text('Баланс'));
    let count = accs.balance.toString();
    count = count.replace(/(\d{1,3}(?=(?:\d\d\d)+(?!\d)))/g, '$1' + ' ') + ' ₽';
    balance.append(u('<span>').text(count));

    container.append(
      u('<div>')
        .addClass('main__grafic', 'to-history')
        .append(
          u('<h3>').addClass('main__grafic-title').text('Динамика баланса')
        )
        .append(u('<canvas>').attr('id', 'plot'))
    );
    let data = this.cleanData(
      accs.transactions,
      accs.balance,
      new Date(accs.transactions[accs.transactions.length - 1].date),
      6
    );
    const maxValue = Math.max.apply(null, data[1]);
    const minValue = Math.min.apply(null, data[1]);

    data = {
      labels: data[0],
      datasets: [
        {
          label: '',
          backgroundColor: 'rgb(17, 106, 204)',
          borderColor: 'rgb(17, 106, 204)',
          data: data[1],
        },
      ],
    };

    const chartAreaBorder = {
      id: 'chartAreaBorder',
      beforeDraw(chart, args, options) {
        const {
          ctx,
          chartArea: { left, top, width, height },
        } = chart;
        ctx.save();
        ctx.strokeStyle = options.borderColor;
        ctx.lineWidth = options.borderWidth;
        ctx.setLineDash(options.borderDash || []);
        ctx.lineDashOffset = options.borderDashOffset;
        ctx.strokeRect(left, top, width, height);
        ctx.restore();
      },
    };

    const options = {
      scales: {
        x: {
          grid: {
            color: 'rgba(0, 0, 0, 0)',
          },
          ticks: {
            font: {
              family: 'sans-serif',
              weight: 700,
              size: 20,
            },
            color: 'black',
          },
        },
        y: {
          grid: {
            color: 'rgba(0, 0, 0, 0)',
          },
          ticks: {
            font: {
              family: 'sans-serif',
              size: 20,
            },
            color: 'black',
          },
          position: 'right',
          max: maxValue,
          min: minValue,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        chartAreaBorder: {
          borderColor: 'black',
          borderWidth: 1,
        },
      },
    };

    const config = {
      type: 'bar',
      data: data,
      options: options,
      plugins: [chartAreaBorder],
    };

    new Chart(document.getElementById('plot'), config);
  }

  init(btnActionObj) {
    this.render(this.elemPaste, this.data);
    this.parseMethods(btnActionObj);
    return;
  }
}

export class HistoryPage extends Page {
  render(elem, accs) {
    elem.html('');
    const container = u('<div>').addClass('container', 'main__container');
    elem.append(container);
  }

  init(btnActionObj) {
    this.render(this.elemPaste, this.data);
    this.parseMethods(btnActionObj);
    return;
  }
}
