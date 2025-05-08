const express = require('express');
const app = express();
app.use(express.json());

class User {
  constructor() {
    this.balance = 0;
    this.coinsPerClick = 1;
    this.passiveIncomePerSecond = 1;
  }
}

const users = new User();

// Додаємо coinsPerClick до балансу
app.post('/click', (req, res) => {
  if (!users) {
    return res.status(404).json({ error: 'Користувача не знайдено' });
  }
  if (users.coinsPerClick < 0) {
    return res.status(400).json({ error: 'coinsPerClick не може бути менше 0' });
  }
  users.balance += users.coinsPerClick;
  if (users.balance < 0) {
    return res.status(409).json({ error: 'Баланс не може бути менше 0' });
  }
  res.status(200).json({ balance: users.balance });
});

// Додаємо passiveIncomePerSecond до балансу
app.post('/passive-income', (req, res) => {
  if (!users) {
    return res.status(404).json({ error: 'Користувача не знайдено' });
  }
  if (users.passiveIncomePerSecond < 0) {
    return res.status(400).json({ error: 'passiveIncomePerSecond не може бути менше 0' });
  }
  users.balance += users.passiveIncomePerSecond;
  if (users.balance < 0) {
    return res.status(409).json({ error: 'Баланс не може бути менше 0' });
  }
  res.status(200).json({ balance: users.balance });
});

// Запуск сервера
app.listen(3000, () => {
  console.log('Server started on port 3000');
});

module.exports = users; // Экспортируем объект users