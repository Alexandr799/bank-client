export class BankingApi {
  constructor() {}

  static pushlogin(log, pass) {
    return fetch('http://localhost:5000/login', {
      method: 'POST',
      body: JSON.stringify({ login: log, password: pass }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => {
        if (399 < res.status && res.status < 500) {
          const err = new Error('Что то пошло не так попробуйте еще раз!');
          err.type = 400;
          throw err;
        }
        if (res.status > 499) {
          const err = new Error('Что то пошло не так попробуйте еще раз!');
          err.type = 500;
          throw err;
        }
        return res.json();
      })
      .then((res) => {
        const data = res;
        if (data.error === 'No such user') {
          const err = new Error('Вы ввели неверный логин!');
          err.type = 'login';
          throw err;
        } else if (data.error === 'Invalid password') {
          const err = new Error('Вы ввели не верный пароль!');
          err.type = 'password';
          throw err;
        }
        return data;
      });
  }

  static pullAccaunts(token) {
    return fetch('http://localhost:5000/accounts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Basic ${token}`,
      },
    })
      .then((res) => {
        if (399 < res.status && res.status < 500) {
          const err = new Error(
            'Что то пошло не так попробуйте перезагрузить позже!'
          );
          err.type = 400;
          throw err;
        }
        if (res.status > 499) {
          const err = new Error(
            'Что то пошло не так попробуйте перезагрузить позже!'
          );
          err.type = 500;
          throw err;
        }
        return res.json();
      })
      .then((res) => {
        if (res.error === 'Unauthorized') {
          const err = new Error();
          err.type = 'Unauthorized';
          throw err;
        }
        return res;
      });
  }

  static pullDetailsAccaunts(token, id) {
    return fetch(`http://localhost:5000/account/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Basic ${token}`,
      },
    })
      .then((res) => {
        if (399 < res.status && res.status < 500) {
          const err = new Error(
            'Что то пошло не так попробуйте перезагрузить позже!'
          );
          err.type = 400;
          throw err;
        }
        if (res.status > 499) {
          const err = new Error(
            'Что то пошло не так попробуйте перезагрузить позже!'
          );
          err.type = 500;
          throw err;
        }
        return res.json();
      })
      .then((res) => {
        if (res.error === 'Unauthorized') {
          const err = new Error();
          err.type = 'Unauthorized';
          throw err;
        }
        if (res.error === 'No such account') {
          const err = new Error();
          err.type = 'No such account';
          throw err;
        }
        return res;
      });
  }

  static getBanks() {
    return fetch(`http://localhost:5000/banksAdress`)
      .then((res) => {
        if (399 < res.status && res.status < 500) {
          const err = new Error('Что то пошло не так попробуйте еще раз!');
          err.type = 400;
          throw err;
        }
        if (res.status > 499) {
          const err = new Error('Что то пошло не так попробуйте еще раз!');
          err.type = 500;
          throw err;
        }
        return res.json();
      })
      .then((data) => {
        return data;
      });
  }

  static createAccount(token) {
    return fetch('http://localhost:5000/create-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Basic ${token}`,
      },
    })
      .then((res) => {
        if (399 < res.status && res.status < 500) {
          const err = new Error('Что то пошло не так попробуйте еще раз!');
          err.type = 400;
          throw err;
        }
        if (res.status > 499) {
          const err = new Error('Что то пошло не так попробуйте еще раз!');
          err.type = 500;
          throw err;
        }
        return res.json();
      })
      .then((data) => {
        if (data.error === 'Unauthorized') {
          const err = new Error();
          err.type = 'Unauthorized';
          throw err;
        }
        return data;
      });
  }

  static async transferFunds(from, to, amount, token) {
    return fetch('http://localhost:5000/transfer-funds', {
      method: 'POST',
      body: JSON.stringify({
        from,
        to,
        amount,
      }),
      headers: {
        'Content-Type': 'application/json',
        authorization: `Basic ${token}`,
      },
    })
      .then((res) => {
        if (399 < res.status && res.status < 500) {
          const err = new Error('Что то пошло не так попробуйте еще раз!');
          err.type = 400;
          throw err;
        }
        if (res.status > 499) {
          const err = new Error('Что то пошло не так попробуйте еще раз!');
          err.type = 500;
          throw err;
        }
        return res.json();
      })
      .then((res) => {
        if (res.error === 'Unauthorized') {
          const err = new Error();
          err.type = 'Unauthorized';
          throw err;
        }
        return res;
      });
  }

  static getCurrencyAccounts(token) {
    return fetch('http://localhost:5000/currencies', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Basic ${token}`,
      },
    })
      .then((res) => {
        if (399 < res.status && res.status < 500) {
          const err = new Error('Что то пошло не так попробуйте еще раз!');
          err.type = 400;
          throw err;
        }
        if (res.status > 499) {
          const err = new Error('Что то пошло не так попробуйте еще раз!');
          err.type = 500;
          throw err;
        }
        return res.json();
      })
      .then((res) => {
        if (res.error === 'Unauthorized') {
          const err = new Error();
          err.type = 'Unauthorized';
          throw err;
        }
        return res;
      });
  }

  static getKnownCurrwncies() {
    return fetch('http://localhost:5000/all-currencies')
      .then((res) => {
        if (399 < res.status && res.status < 500) {
          const err = new Error('Что то пошло не так попробуйте еще раз!');
          err.type = 400;
          throw err;
        }
        if (res.status > 499) {
          const err = new Error('Что то пошло не так попробуйте еще раз!');
          err.type = 500;
          throw err;
        }
        return res.json();
      })
      .then((res) => {
        if (res.error === 'Unauthorized') {
          const err = new Error();
          err.type = 'Unauthorized';
          throw err;
        }
        return res;
      });
  }

  static exchangeCurrency(from, to, amount, token) {
    return fetch('http://localhost:5000/currency-buy', {
      method: 'POST',
      body: JSON.stringify({
        from,
        to,
        amount,
      }),
      headers: {
        'Content-Type': 'application/json',
        authorization: `Basic ${token}`,
      },
    })
      .then((res) => {
        if (399 < res.status && res.status < 500) {
          const err = new Error('Что то пошло не так попробуйте еще раз!');
          err.type = 400;
          throw err;
        }
        if (res.status > 499) {
          const err = new Error('Что то пошло не так попробуйте еще раз!');
          err.type = 500;
          throw err;
        }
        return res.json();
      })
      .then((res) => {
        if (res.error === 'Unauthorized') {
          const err = new Error();
          err.type = 'Unauthorized';
          throw err;
        }
        if (res.error === 'Overdraft prevented') {
          const err = new Error('Некорректное значение перевода');
          err.type = 'Overdraft';
          throw err;
        }
        if (res.error === 'Unknown currency code') {
          const err = new Error('Передан неверный валютный код');
          err.type = 'Unknown';
          throw err;
        }
        if (res.error === 'Invalid amount') {
          const err = new Error(
            'Не указана сумма перевода, или она отрицательная'
          );
          err.type = 'Invalid';
          throw err;
        }
        if (res.error === 'Not enough currency') {
          const err = new Error('На валютном счёте списания нет средств');
          err.type = 'NotEnough';
          throw err;
        }
        return res;
      });
  }

  static getChangedCurrency() {
    return new WebSocket('ws://localhost:5000/currency-feed');
  }
}
