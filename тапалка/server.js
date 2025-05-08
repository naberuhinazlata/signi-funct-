const express = require('express');
const crypto = require('crypto');
const users = require('./index.js'); // Импортируем объект users
const app = express();
app.use(express.json());


let upgrades = [
  { id: 1, name: "Click Accelerator", description: "speed of earning x10", price: 40000 },
  { id: 2, name: "Coin Multiplier", description: "ClickCoins per click x10", price: 50000 },
  { id: 3, name: "Power Tap", description: "ClickCoins per click x2", price: 20000 },
];

// Отримати список усіх апгрейдів
app.get('/upgrades', (req, res) => {
  res.json(upgrades);
});

// Отримати один апгрейд
app.get('/upgrades/:id', (req, res) => {
  const upgrade1 = upgrades.find(u => u.id === parseInt(req.params.id));
  if (!upgrade1) {
    return res.status(404).json({ error: "Upgrade не знайдено" });
  }
  res.json(upgrade1);
});

// Додати новий апгрейд
app.post('/upgrades', (req, res) => {
  const { name, description, price } = req.body;

  if (!name || !description || typeof price !== 'number' || price < 0) {
    return res.status(400).json({ error: "Недійсні вхідні дані" });
  }

  if (!name.trim() || !description.trim()) {
    return res.status(400).json({ error: "Назва та опис не можуть бути пустими" });
  }

  const newUpgrade = {
    id: upgrades.length ? upgrades[upgrades.length - 1].id + 1 : 1,
    name,
    description,
    price,
  };

  upgrades.push(newUpgrade);
  res.status(201).json(newUpgrade);
});

// Оновити апгрейд
app.put('/upgrades/:id', (req, res) => {
  const { name, description, price } = req.body;
  const upgrade1 = upgrades.find(u => u.id === parseInt(req.params.id));

  if (!upgrade1) {
    return res.status(404).json({ error: "Upgrade не знайдено" });
  } // Перевірка на існування апгрейду

  if (!name || !description || typeof price !== 'number' || price < 0) {
    return res.status(400).json({ error: "Недійсні вхідні дані" });
  } // Перевірка на валідність даних

  if (!name.trim() || !description.trim()) {
    return res.status(400).json({ error: "Назва та опис не можуть бути пустими" });
  } //Перевірка на пусті поля

  upgrade1.name = name;
  upgrade1.description = description;
  upgrade1.price = price;

  res.json(upgrade1);
});

// Видалити апгрейд
app.delete('/upgrades/:id', (req, res) => {
  const upgradeIndex = upgrades.findIndex(u => u.id === parseInt(req.params.id));

  if (upgradeIndex === -1) {
    return res.status(404).json({ error: "Upgrade не знайдено" });
  }

  upgrades.splice(upgradeIndex, 1);
  res.status(204).send();
});

let user = []; // Масив для зберігання користувачів

// Реєстрація
app.post('/sign-up', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email і пароль обов'язкові" });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: "Пароль має бути не коротшим за 8 символів" });
  }

  const existingUser = user.find(user => user.email === email);
  if (existingUser) {
    return res.status(400).json({ error: "Користувач із таким email вже існує" });
  }

  const hashedPassword = await bcrypt.hash(password, 10); // Хешування пароля
  user.push({ email, password: hashedPassword });

  res.status(201).json({ message: "Реєстрація успішна!" });
});

// Авторизація
app.post('/sign-in', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email і пароль обов'язкові" });
  }

  const user = users.find(user => user.email === email);
  if (!user) {
    return res.status(401).json({ error: "Невірний email або пароль" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: "Невірний email або пароль" });
  }

  const token = crypto.randomBytes(16).toString('hex'); // Генерація токена
  res.status(200).json({ token });
});

// Список доступних апгрейдів
const upgrade = [
  { id: "click-accelerator", name: "Click Accelerator", price: 40000, type: "multiplyClick", value: 10 },
  { id: "passive-boost", name: "Passive Boost", price: 30000, type: "addPassive", value: 5 },
  { id: "click-bonus", name: "Click Bonus", price: 20000, type: "addClick", value: 2 },
  { id: "passive-multiplier", name: "Passive Multiplier", price: 50000, type: "multiplyPassive", value: 2 },
];

// Ендпоінт для покупки апгрейду
app.post('/buy-upgrade', (req, res) => {
  const { userId, upgradeId } = req.body;

// Перевірка наявності користувача
if (!user) {
  return res.status(404).json({ error: "Користувача не знайдено" });
}

// Знаходимо апгрейд
const upgrade = upgrades.find(u => u.id === upgradeId);
if (!upgrade) {
  return res.status(404).json({ error: "Апгрейд не знайдено" });
}

// Перевірка балансу користувача
if (user.balance < upgrade.price) {
  return res.status(400).json({ error: "Недостатньо коштів для покупки апгрейду" });
}

// Знімаємо ціну апгрейду з балансу
user.balance -= upgrade.price;

// Застосовуємо ефект апгрейду
switch (upgrade.type) {  //конструкция, которая позволяет выполнять инструкции исходя из значения выражений
  case "multiplyClick":
  user.coinsPerClick *= upgrade.value;
  break; //Оператор break прерывает выполнение текущего цикла
  case "addClick":
  user.coinsPerClick += upgrade.value;
  break;
  case "multiplyPassive":
  user.passiveIncomePerSecond *= upgrade.value;
  break;
  case "addPassive":
  user.passiveIncomePerSecond += upgrade.value;
  break;
  default:
  return res.status(409).json({ error: "Невірний тип ефекту апгрейду" });
}

// Повертаємо оновлені дані користувача
res.status(200).json({
  balance: user.balance,
  coinsPerClick: user.coinsPerClick,
  passiveIncomePerSecond: user.passiveIncomePerSecond,
});
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});