import u from 'umbrellajs';
import Chart from 'chart.js/auto';
import ymaps from 'ymaps';

export class RenderElem {
  constructor() {}

  static loginForm() {
    return u('<form>')
      .addClass('login-form', 'main__login-from')
      .append(
        u('<h1>').addClass('title', 'login-form__title').text('Вход в аккаунт')
      )
      .append(
        u('<div>')
          .addClass('login-form__input-wrapper', 'login-wrapper')
          .append(u('<span>').addClass('login-form__descr').text('Логин'))
          .append(u('<input>').addClass('login-form__input', 'login'))
      )
      .append(
        u('<div>')
          .addClass('login-form__input-wrapper', 'password-wrapper')
          .append(u('<span>').addClass('login-form__descr').text('Пароль'))
          .append(
            u('<input>')
              .addClass('login-form__input', 'password')
              .attr('type', 'password')
          )
      )
      .append(u('<button>').addClass('login-form__button').text('Войти'));
  }

  static cleanErrors(elem) {
    elem.find('.error').each((node) => {
      u(node).remove();
    });
    elem.find('.error-input').each((node) => {
      u(node).removeClass('error-input');
    });
  }

  static error(elem, message, classname = 'error') {
    elem.find('input').addClass('error-input');
    elem.append(
      u('<span>')
        .addClass(classname)
        .text(message)
        .attr('style', `top:${elem.nodes[0].clientHeight}px`)
    );
  }

  static spinner(elem) {
    elem.append(u('<div>').addClass('spinner'));
  }

  static navMenu(elem) {
    const nav = u('<div>')
      .addClass('header__nav')
      .append(
        u('<button>')
          .text('Банкоматы')
          .attr({ 'data-value': 'banks', disabled: 'disabled' })
      )
      .append(
        u('<button>')
          .text('Счета')
          .attr({ 'data-value': 'account', disabled: 'disabled' })
      )
      .append(
        u('<button>')
          .text('Валюта')
          .attr({ 'data-value': 'currency', disabled: 'disabled' })
      )
      .append(
        u('<button>')
          .text('Выйти')
          .attr({ 'data-value': 'exit', disabled: 'disabled' })
      );
    nav.children().addClass('header__nav-btn');
    elem.append(nav);
  }

  static initDropdownInput(value, dropdownMenu, list, input) {
    const valuesList = [];
    dropdownMenu.children().each((elem) => {
      const el = u(elem);
      if (!el.text().startsWith(value)) {
        el.remove();
      } else {
        valuesList.push(el.text());
      }
    });

    dropdownMenu.parent().on('click', (e) => {
      e.dropdown = true;
    });

    if (list != null) {
      for (let i of list) {
        if (dropdownMenu.children().nodes.length > 9) break;
        if (i.startsWith(value) && !valuesList.includes(i)) {
          dropdownMenu.append(u('<li>').text(i));
        }
      }
    }

    if (dropdownMenu.children().nodes.length > 0) {
      dropdownMenu.closest('.dropdown-wrapper').addClass('dropdown-menu--open');
      dropdownMenu.children().each((el) => {
        u(el).on('click', (e) => {
          e.dropdown = true;
          input.value = u(el).text();
          u(input).removeClass('error-input');
          u('.main__form-tranz-wrapper-number').find('.error').remove();
          dropdownMenu
            .closest('.dropdown-wrapper')
            .removeClass('dropdown-menu--open');
        });
      });
    } else {
      dropdownMenu
        .closest('.dropdown-wrapper')
        .removeClass('dropdown-menu--open');
    }
  }

  static initNav(router, path) {
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

  static activateNavMenu(elem) {
    elem.children().each((el) => {
      el.removeAttribute('disabled');
    });
  }

  static renderUlSocketList(data, elem) {
    if (data.type != 'EXCHANGE_RATE_CHANGE' || data.change === 0) return;
    const className =
      data.change === -1
        ? 'currency-change-minus-item'
        : 'currency-change-plus-item';
    elem.attr('style', 'display:none;');
    elem.prepend(
      u('<li>')
        .addClass(className)
        .append(u('<span>').text(`${data.from}/${data.to}`))
        .append(u('<span>').text(data.rate))
    );
    const countLi = elem.children().nodes.length;
    if (countLi > 20) {
      elem.attr('style', 'display:block;');
      elem.children().last().remove();
      u('.spinner').remove();
    }
  }
}

class Page {
  constructor(elemPaste, data = {}) {
    this.elemPaste = elemPaste;
    this.data = data;
  }

  parseMethods(btnActionObj) {
    for (let btn of btnActionObj) {
      u(btn[0]).on(btn[1][1], btn[1][0]);
    }
  }
}

export class HeadPage extends Page {
  render(elem, accs) {
    const container = u('<div>').addClass('container', 'main__container');
    elem.append(container);
    container
      .append(
        u('<h1>')
          .addClass('title', 'main__title', 'main__title-accauts')
          .text('Ваши счета')
      )
      .append(
        u('<div>')
          .addClass('dropdown-wrapper', 'dropdown-sort-wrapper')
          .html(
            `<svg width="11" height="6" viewBox="0 0 11 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0.951904 0.5L5.9519 5.5L10.9519 0.5L0.951904 0.5Z" fill="#182233"/>
          </svg>`
          )
          .append(u('<span>').text('Сортировка'))
          .append(
            u('<ul>')
              .addClass('dropdown-menu')
              .append(u('<li>').text('По номеру').addClass('number-sort'))
              .append(u('<li>').text('По балансу').addClass('balance-sort'))
              .append(
                u('<li>').text('По последней тразакции').addClass('data-sort')
              )
          )
      )
      .append(
        u('<button>').addClass('account__button').text('Создать новый счёт')
      );
    const gridAccs = u('<ul>').addClass('account__list');
    for (let a of accs) {
      let balance = String(a.balance);
      balance =
        balance.replace(/(\d{1,3}(?=(?:\d\d\d)+(?!\d)))/g, '$1' + ' ') + ' ₽';
      let lastDateTrans;
      if (a.transactions.length > 0) {
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
        lastDateTrans = `${day + ' ' + month + ' ' + year}`;
      } else {
        lastDateTrans = '';
      }
      const listItem = u('<li>')
        .addClass('account__item')
        .attr({
          'data-id': a.account,
          'data-balance': a.balance === 0 ? '0' : a.balance,
          'data-date': a.transactions[0] ? a.transactions[0].date : '0',
        })
        .append(u('<span>').text(`${a.account}`).addClass('account__item-id'))
        .append(u('<span>').text(`${balance}`).addClass('account__item-price'))
        .append(
          u('<span>')
            .text('Последняя транзакция')
            .addClass('account__item-last')
        )
        .append(
          u('<span>').text(`${lastDateTrans}`).addClass('account__item-date')
        )
        .append(
          u('<button>')
            .text('Открыть')
            .addClass('account__item-btn')
            .attr('data-id', `${a.account}`)
        );
      gridAccs.append(listItem);
    }
    container.append(gridAccs);
  }

  updateList(accs, func) {
    u('.account__list').html('');
    const gridAccs = u('.account__list');
    for (let a of accs) {
      let balance = String(a.balance);
      balance =
        balance.replace(/(\d{1,3}(?=(?:\d\d\d)+(?!\d)))/g, '$1' + ' ') + ' ₽';
      let lastDateTrans;
      if (a.transactions.length > 0) {
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
        lastDateTrans = `${day + ' ' + month + ' ' + year}`;
      } else {
        lastDateTrans = '';
      }
      const listItem = u('<li>')
        .attr({
          'data-id': a.account,
          'data-balance': a.balance === 0 ? '0' : a.balance,
          'data-date': a.transactions[0] ? a.transactions[0].date : '0',
        })
        .addClass('account__item')
        .append(u('<span>').text(`${a.account}`).addClass('account__item-id'))
        .append(u('<span>').text(`${balance}`).addClass('account__item-price'))
        .append(
          u('<span>')
            .text('Последняя транзакция')
            .addClass('account__item-last')
        )
        .append(
          u('<span>').text(`${lastDateTrans}`).addClass('account__item-date')
        )
        .append(
          u('<button>')
            .text('Открыть')
            .addClass('account__item-btn')
            .attr('data-id', `${a.account}`)
            .on('click', func)
        );
      gridAccs.append(listItem);
    }
  }

  init(btnActionObj) {
    this.render(this.elemPaste, this.data);
    this.parseMethods(btnActionObj);
    return;
  }
}

export class DetailsPage extends Page {
  cleanData(transactions, balanceCurrent, lastTrans, countStat, ourFrom) {
    const monthsList = [
      '1.Янв',
      '1.Фев',
      '1.Мар',
      '1.Апр',
      '1.Май',
      '1.Июн',
      '1.Июл',
      '1.Авг',
      '1.Сен',
      '1.Окт',
      '1.Ноя',
      '1.Дек',
    ];
    let m = lastTrans.getMonth();
    let y = lastTrans.getFullYear();
    const data = [];
    let balance = balanceCurrent;
    let counter = countStat;
    for (let i = transactions.length - 1; i >= 0; i--) {
      const transDate = new Date(transactions[i].date);
      if (m != transDate.getMonth() || y != transDate.getFullYear()) {
        data.push([`${y}г. ` + monthsList[m], balance]);
        m = transDate.getMonth();
        y = transDate.getFullYear();
        counter = counter - 1;
      }
      balance =
        transactions[i].from === ourFrom
          ? balance + transactions[i].amount
          : balance - transactions[i].amount;
      if (counter === 0) break;
    }
    const dataKeys = data.map((el) => {
      return el[0];
    });

    const dataVal = data.map((el) => {
      return el[1];
    });
    return [dataKeys.reverse(), dataVal.reverse()];
  }

  cleanDataStructor(transactions, ourFrom, lastTrans, countStat) {
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
    let m = lastTrans.getMonth();
    let y = lastTrans.getFullYear();
    const data = [];
    let counter = countStat;
    let plusTrans = 0;
    let minusTrans = 0;
    const labels = [];
    for (let i = transactions.length - 1; i >= 0; i--) {
      const transDate = new Date(transactions[i].date);
      if (m != transDate.getMonth() || y != transDate.getFullYear()) {
        labels.push(`${y}г. ` + monthsList[m]);
        data.push([plusTrans, minusTrans]);
        m = transDate.getMonth();
        y = transDate.getFullYear();
        plusTrans = 0;
        minusTrans = 0;
        counter = counter - 1;
      }
      transactions[i].from === ourFrom
        ? (minusTrans = minusTrans + transactions[i].amount * -1)
        : (plusTrans = plusTrans + transactions[i].amount);
      if (i === 0 && !labels.includes(`${y}г. ` + monthsList[m])) {
        labels.push(`${y}г. ` + monthsList[m]);
        data.push([plusTrans, minusTrans]);
      }
      if (counter === 0) break;
    }

    const dataValPlus = data.map((el) => {
      return el[0];
    });

    const dataValMinus = data.map((el) => {
      return el[1];
    });
    return [labels.reverse(), dataValPlus.reverse(), dataValMinus.reverse()];
  }

  renderBalance(elem, accs) {
    const balance = u('<div>').addClass('main__balance');
    elem.append(balance);
    balance.append(u('<span>').text('Баланс'));
    let count = accs.balance.toString();
    count = count.replace(/(\d{1,3}(?=(?:\d\d\d)+(?!\d)))/g, '$1' + ' ') + ' ₽';
    balance.append(u('<span>').text(count).addClass('amount-balance'));
  }

  updateBalance(res) {
    let data = res.toString();
    data = data.replace(/(\d{1,3}(?=(?:\d\d\d)+(?!\d)))/g, '$1' + ' ') + ' ₽';
    u('.amount-balance').text(data);
  }

  appendInTable(accs) {
    const ourFrom = accs.account;
    const trans = accs.transactions[accs.transactions.length - 1];
    const elemTable = u('.main__history-table').children('.main__history-row')
      .nodes.length;
    if (elemTable > 9) u('.main__history-row').last().remove();
    const row = u('<div>').addClass('main__history-row');
    row.append(u('<div>').text(trans.from));
    row.append(u('<div>').text(trans.to));
    let amount = trans.amount;
    const classAmount = trans.from === ourFrom ? 'credit' : 'debit';
    amount = trans.from === ourFrom ? `-${amount} ₽` : `+${amount} ₽`;
    row.append(u('<div>').text(amount).addClass(classAmount));
    let date = new Date(trans.date);
    const day = date.getDate().toString();
    const month = date.getMonth().toString();
    const year = date.getFullYear().toString();
    date = day + '.' + month + '.' + year;
    row.append(u('<div>').text(date));
    u('.main__table-head').after(row);
  }

  renderTable(elem, accs, countRow) {
    const ourFrom = accs.account;
    const table = u('<div>').addClass('main__history-table');
    const wrapperTable = u('<div>')
      .addClass('main__table-wrapper', 'to-history')
      .append(u('<h3>').addClass('main__table-title').text('История переводов'))
      .append(table);
    elem.append(wrapperTable);
    const head = u('<div>').addClass('main__table-head');
    table.append(head);
    for (let i of ['Счёт отправителя', 'Счёт получателя', 'Сумма', 'Дата']) {
      head.append(u('<div>').text(i));
    }
    const trans = accs.transactions;
    if (accs.transactions.length === 0) {
      u('.main__history-table').append(
        u('<div>')
          .addClass('table__null')
          .text('Здесь будет история транзаций, но пока ее нет...')
      );
      return;
    }
    for (let i = trans.length - 1; i > trans.length - 1 - countRow; i--) {
      if (i < 0) break;
      const row = u('<div>').addClass('main__history-row');
      row.append(u('<div>').text(trans[i].from));
      row.append(u('<div>').text(trans[i].to));
      let amount = trans[i].amount;
      const classAmount = trans[i].from === ourFrom ? 'credit' : 'debit';
      amount = trans[i].from === ourFrom ? `-${amount} ₽` : `+${amount} ₽`;
      row.append(u('<div>').text(amount).addClass(classAmount));
      let date = new Date(trans[i].date);
      const day = date.getDate().toString();
      let month = date.getMonth() + 1;
      month = month.toString();
      const year = date.getFullYear().toString();
      date = day + '.' + month + '.' + year;
      row.append(u('<div>').text(date));
      table.append(row);
    }
  }

  renderStdGrafic(elem, accs, countCol, className) {
    elem.append(
      u('<div>')
        .addClass(className, 'to-history')
        .append(
          u('<h3>').addClass('main__grafic-title').text('Динамика баланса')
        )
        .append(u('<canvas>').attr('id', 'plot'))
    );
    if (accs.transactions.length === 0) {
      u(`.${className}`).append(
        u('<div>')
          .addClass('grafic__null')
          .text('Тут будет отображаться статистика баланса по месяцам...')
      );
      return;
    }
    let data = this.cleanData(
      accs.transactions,
      accs.balance,
      new Date(accs.transactions[accs.transactions.length - 1].date),
      countCol,
      accs.account
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
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            color: 'rgba(0, 0, 0, 0)',
          },
          ticks: {
            font: {
              family: 'sans-serif',
              weight: 400,
              size: 14,
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

  renderStructorGrafic(elem, accs, countCol, className) {
    elem.append(
      u('<div>')
        .addClass(className, 'to-history')
        .append(
          u('<h3>')
            .addClass('main__grafic-title')
            .text('Соотношение входящих исходящих транзакций')
        )
        .append(u('<canvas>').attr('id', 'plot-1'))
    );
    let data = this.cleanDataStructor(
      accs.transactions,
      accs.account,
      new Date(accs.transactions[accs.transactions.length - 1].date),
      countCol
    );

    data = {
      labels: data[0],
      datasets: [
        {
          label: '',
          backgroundColor: 'rgb(118, 202, 102)',
          borderColor: 'rgb(118, 202, 102)',
          data: data[1],
        },
        {
          label: '',
          backgroundColor: 'rgb(253, 78, 93)',
          borderColor: 'rgb(253, 78, 93)',
          data: data[2],
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
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: true,
          grid: {
            color: 'rgba(0, 0, 0, 0)',
          },
          ticks: {
            font: {
              family: 'sans-serif',
              weight: 400,
              size: 14,
            },
            color: 'black',
          },
        },
        y: {
          stacked: true,
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

    new Chart(document.getElementById('plot-1'), config);
  }

  render(elem, accs) {
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
          .addClass('account__button', 'account__button-back')
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
            u('<div>')
              .addClass('dropdown-wrapper')
              .append(
                u('<input>')
                  .addClass('main__form-tranz-number')
                  .attr('placeholder', 'Введите номер счета')
                  .attr('type', 'tel')
              )
              .append(u('<ul>').addClass('dropdown-menu'))
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
              .attr('type', 'tel')
          )
      )
      .append(u('<button>').addClass('main__form-tranz-btn').html('Отправить'));

    const itemAccount = localStorage.getItem('accs');
    const variable = [];
    if (itemAccount != null) {
      const items = JSON.parse(itemAccount);
      let iter = 1;
      for (let i of items) {
        variable.push({
          value: i,
          label: i,
          id: iter,
        });
        iter++;
      }
    }

    this.renderTable(container, accs, 10);

    this.renderBalance(container, accs);

    this.renderStdGrafic(container, accs, 6, 'main__grafic');
  }

  init(btnActionObj) {
    this.render(this.elemPaste, this.data);
    this.parseMethods(btnActionObj);
    return;
  }
}

export class HistoryPage extends DetailsPage {
  render(elem, accs) {
    const container = u('<div>').addClass('container', 'main__container');
    elem.append(container);
    container
      .append(
        u('<h1>')
          .addClass('title', 'main__title', 'main__title-details')
          .text('История баланса')
      )
      .append(
        u('<h2>')
          .addClass('subtitle', 'main__subtitle')
          .text(`№${accs.account}`)
      )
      .append(
        u('<button>')
          .addClass('account__button', 'account__button-back')
          .text('Вернуться назад')
      );

    this.renderStdGrafic(container, accs, 12, 'main__grafic-big');

    this.renderStructorGrafic(container, accs, 12, 'main__grafic-big');

    this.renderTable(container, accs, 25);

    this.renderBalance(container, accs);
  }

  init(btnActionObj) {
    this.render(this.elemPaste, this.data);
    this.parseMethods(btnActionObj);
    return;
  }
}

export class BanksPage extends Page {
  async init() {
    const elem = this.elemPaste;
    const accs = this.data;
    const container = u('<div>').addClass('container', 'main__container');
    elem.append(container);
    container.append(
      u('<h1>')
        .addClass('title', 'main__title', 'main__title-bank')
        .text('Карта банкоматов')
    );
    container.append(
      u('<div>')
        .addClass('main__map')
        .attr({ id: 'map', style: 'width: 100%; height: 728px' })
    );
    const maps = await ymaps.load(
      'https://api-maps.yandex.ru/2.1/?apikey=bb1c3efc-6633-4fea-9d91-743ce21c05a3&lang=ru_RU'
    );
    let myMap = new maps.Map('map', {
      center: [55.76, 37.64],
      zoom: 10,
    });
    for (let i of accs) {
      let myGeoObject = new maps.GeoObject({
        geometry: {
          coordinates: [i.lat, i.lon],
          type: 'Point',
        },
      });
      myMap.geoObjects.add(myGeoObject);
    }
  }
}

export class CurrencyPage extends Page {
  renderDropdown(list, value) {
    const menu = u('<ul>')
      .addClass('dropdown-menu')
      .data('simplebar', 'simplebar');
    for (let i of list) {
      const li = u('<li>').text(i);
      li.on('click', (e) => {
        e.dropdown = true;
        u(e.currentTarget)
          .closest('.dropdown-currency-wrapper')
          .find('.dropdown-value')
          .text(e.currentTarget.textContent);
      });
      menu.append(li);
    }
    const res = u('<div>')
      .addClass('dropdown-wrapper', 'dropdown-currency-wrapper')
      .html(
        `<svg width="11" height="6" viewBox="0 0 11 6" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0.951904 0.5L5.9519 5.5L10.9519 0.5L0.951904 0.5Z" fill="#182233"/>
    </svg>`
      )
      .append(u('<span>').text(value).addClass('dropdown-value'))
      .append(menu);

    return res;
  }

  renderItemsAccs(currencyAccount, currencyListElem) {
    for (let key of Object.keys(currencyAccount)) {
      if (currencyAccount[key].amount === 0) continue;
      let balance = currencyAccount[key].amount.toString();
      balance = balance.replace(/(\d{1,3}(?=(?:\d\d\d)+(?!\d)))/g, '$1' + ' ');
      if (balance.split('.')[1]) {
        balance =
          balance.split('.')[0] +
          `.${balance.split('.')[1].replace(/\s/g, '')}`;
      } else {
        balance = balance.split('.')[0];
      }
      const li = u('<li>')
        .addClass('currency-item')
        .append(u('<span>').addClass('currency-item-name').text(key))
        .append(u('<span>').addClass('currency-item-value').text(balance));
      currencyListElem.append(li);
    }
  }

  render(elem, accs) {
    const currencyAccount = accs[0].payload;
    const currencyList = accs[1].payload;
    const container = u('<div>').addClass(
      'container',
      'main__container',
      'container-currency'
    );
    elem.append(container);
    container.append(
      u('<h1>')
        .addClass('title', 'main__title', 'main__title-currency')
        .text('Карта банкоматов')
        .text('Валютный обмен')
    );
    const row = u('<div>').addClass('container-currency__row');
    row
      .append(
        u('<div>')
          .addClass('container-currency__col')
          .append(
            u('<div>')
              .addClass('currency-list-wrapper')
              .append(
                u('<h2>').text('Ваши валюты').addClass('currency-subtitle')
              )
          )
          .append(
            u('<form>')
              .addClass('currency-charge')
              .append(
                u('<h2>').text('Обмен валюты').addClass('currency-subtitle')
              )
          )
      )
      .append(
        u('<div>')
          .addClass('container-currency__col')
          .append(
            u('<div>')
              .addClass('currency-change-wrapper')
              .append(
                u('<h2>')
                  .text('Изменение курсов в реальном времени')
                  .addClass('currency-subtitle')
              )
          )
      );
    container.append(row);
    const currencyListElem = u('<ul>').addClass('currency-list');
    const currencyListChangeElem = u('<ul>').addClass('currency-change-list');
    u('.currency-list-wrapper').append(currencyListElem);
    u('.currency-change-wrapper').append(currencyListChangeElem);
    this.renderItemsAccs(currencyAccount, currencyListElem);
    u('.currency-charge')
      .append(u('<div>').text('Из').addClass('currency-charge-from'))
      .append(
        this.renderDropdown(currencyList, currencyList[0]).addClass(
          'currency-charge-from-menu'
        )
      )
      .append(u('<div>').text('В').addClass('currency-charge-to'))
      .append(
        this.renderDropdown(
          currencyList,
          currencyList[currencyList.length - 1]
        ).addClass('currency-charge-to-menu')
      )
      .append(
        u('<div>')
          .addClass('currency-charge-input-wrapper')
          .append(u('<input>').addClass('currency-charge-input'))
      )
      .append(u('<div>').text('Сумма').addClass('currency-charge-sum'))
      .append(
        u('<button>').text('Обменять').addClass('currency-charge-button')
      );
  }

  updateAccaunts(accs) {
    u('.currency-list').html('');
    this.renderItemsAccs(accs, u('.currency-list'));
  }

  init(btnActionObj) {
    this.render(this.elemPaste, this.data);
    this.parseMethods(btnActionObj);
    return;
  }
}
