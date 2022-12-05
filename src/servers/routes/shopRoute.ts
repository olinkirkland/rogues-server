import express from 'express';
import { addGold, addItem } from '../../controllers/resource-controller';
import authenticate from '../../middlewares/authenticate';
import identify from '../../middlewares/identify';
const prices = require('../../../data/prices.json');
const sales = require('../../../data/sales.json');

const router = express.Router();
export default router;

router.get('/', authenticate, identify, async (req, res) => {
  const user = req.user;
  if (!user) return res.sendStatus(404);

  // Customize the shop for this user
  const shop = { prices: prices, sales: sales };

  res.send(shop);
});

router.post('/buy', authenticate, identify, async (req, res) => {
  const user = req.user;
  if (!user) return res.sendStatus(404);

  if (user.inventory.indexOf(req.body.itemID) !== -1) return res.status(400);

  const item = prices.find((price) => price.id === req.body.item);
  if (!item) return res.sendStatus(400);

  const price = getFinalItemPrice(item);
  if (user.gold >= price) {
    addItem(user.id, item.id);
    addGold(user.id, -price);
    console.log('🛒', `${user.name} bought item ${item.id} for ${price} gold`);
    return res.sendStatus(200);
  }
  return res.sendStatus(402);
});

// Get the final price of an item
function getFinalItemPrice(item) {
  let discount = 0;
  sales.forEach((sale) => {
    sale.discounts.forEach((d) => {
      if (d.id === item.id) discount = d.percent;
    });
  });

  let price = Math.floor(item.price - item.price * (discount / 100));
  return price;
}
