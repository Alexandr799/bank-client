export class BankingApi {
  constructor() {}

  static pushlogin(log, pass) {
    return fetch('http://localhost:3000/login', {
      method: 'POST',
      body: JSON.stringify({ login: log, password: pass }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => {
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
    return fetch('http://localhost:3000/accounts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Basic ${token}`,
      },
    })
      .then((res) => {
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
}
