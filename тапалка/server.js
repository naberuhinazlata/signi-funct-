const express = require('express');

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
  const upgrade = upgrades.find(u => u.id === parseInt(req.params.id));
  if (!upgrade) {
    return res.status(404).json({ error: "Upgrade не знайдено" });
  }
  res.json(upgrade);
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
  const upgrade = upgrades.find(u => u.id === parseInt(req.params.id));

  if (!upgrade) {
    return res.status(404).json({ error: "Upgrade не знайдено" });
  } // Перевірка на існування апгрейду

  if (!name || !description || typeof price !== 'number' || price < 0) {
    return res.status(400).json({ error: "Недійсні вхідні дані" });
  } // Перевірка на валідність даних

  if (!name.trim() || !description.trim()) {
    return res.status(400).json({ error: "Назва та опис не можуть бути пустими" });
  } //Перевірка на пусті поля

  upgrade.name = name;
  upgrade.description = description;
  upgrade.price = price;

  res.json(upgrade);
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

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});