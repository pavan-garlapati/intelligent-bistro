import { Router } from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MENU_PATH = join(__dirname, '..', 'data', 'menu.json');

const MENU = JSON.parse(readFileSync(MENU_PATH, 'utf-8')).items;
console.log(`Menu loaded: ${MENU.length} items`);

export function getMenu() {
  return MENU;
}

export async function loadMenu() {
  return MENU;
}

function groupByCategory(items) {
  const grouped = { starters: [], mains: [], drinks: [], desserts: [] };
  const map = {
    Starters: 'starters',
    Mains: 'mains',
    Drinks: 'drinks',
    Desserts: 'desserts',
  };
  for (const item of items) {
    const key = map[item.category];
    if (key) grouped[key].push(item);
  }
  return grouped;
}

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const items = await loadMenu();
    res.json(groupByCategory(items));
  } catch (err) {
    next(err);
  }
});

router.get('/search', async (req, res, next) => {
  try {
    const q = (req.query.q || '').toString().trim().toLowerCase();
    if (!q) return res.json([]);
    const items = await loadMenu();
    const matches = items.filter((item) => {
      const haystack = [
        item.name,
        item.description,
        ...(item.tags || []),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
    res.json(matches);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const items = await loadMenu();
    const item = items.find((i) => i.id === req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

export default router;
