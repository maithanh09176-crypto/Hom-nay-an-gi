import test from 'node:test';
import assert from 'node:assert/strict';
import { FOODS } from '../data/foods';
import {
  filterFoods,
  formatPriceRange,
  pickRandomCombo,
  pickRandomFood,
  searchAndFilterMenu,
} from './foodLogic';

test('dataset strictly contains 100 unique dishes with exact group and category counts', () => {
  assert.equal(FOODS.length, 100);

  const ids = new Set(FOODS.map((f) => f.id));
  assert.equal(ids.size, 100);
  for (let i = 1; i <= 100; i++) {
    assert.equal(ids.has(i), true, `Missing food ID ${i}`);
  }

  const comCount = FOODS.filter((f) => f.category === 'com').length;
  const bunPhoCount = FOODS.filter((f) => f.category === 'bun-pho').length;
  const banhXoiCount = FOODS.filter((f) => f.category === 'banh-xoi').length;
  const otherMainCount = FOODS.filter((f) => f.category === 'mon-chinh-khac').length;
  const mainCount = FOODS.filter((f) => f.group === 'main').length;
  const snackCount = FOODS.filter((f) => f.group === 'snack').length;
  const dessertCount = FOODS.filter((f) => f.group === 'dessert').length;

  assert.equal(comCount, 10);
  assert.equal(bunPhoCount, 28);
  assert.equal(banhXoiCount, 20);
  assert.equal(otherMainCount, 14);
  assert.equal(mainCount, 72);
  assert.equal(snackCount, 16);
  assert.equal(dessertCount, 12);

  // Ensure no duplicate external imageUrl across dishes
  const nonEmptyUrls = FOODS.map((f) => f.imageUrl).filter(Boolean);
  assert.equal(new Set(nonEmptyUrls).size, nonEmptyUrls.length);

  // Ensure integer VND pricing and min <= max
  for (const food of FOODS) {
    assert.equal(Number.isInteger(food.minPrice), true);
    assert.equal(Number.isInteger(food.maxPrice), true);
    assert.equal(food.minPrice <= food.maxPrice, true);
    assert.equal(food.mealTypes.length > 0, true);
  }
});

test('filterFoods strictly respects category mode and maxPrice budget', () => {
  const mainUnder40 = filterFoods(FOODS, {
    mode: 'main',
    maxBudget: 40000,
    mealTime: 'any',
    mood: 'random-any',
  });
  assert.equal(mainUnder40.length > 0, true);
  for (const item of mainUnder40) {
    assert.equal(item.group, 'main');
    assert.equal(item.maxPrice <= 40000, true);
  }

  const snacks = filterFoods(FOODS, {
    mode: 'snack',
    maxBudget: null,
    mealTime: 'any',
    mood: 'random-any',
  });
  assert.equal(snacks.length, 16);
  assert.equal(snacks.every((f) => f.group === 'snack'), true);

  const desserts = filterFoods(FOODS, {
    mode: 'dessert',
    maxBudget: null,
    mealTime: 'any',
    mood: 'random-any',
  });
  assert.equal(desserts.length, 12);
  assert.equal(desserts.every((f) => f.group === 'dessert'), true);

  const impossibleBudget = filterFoods(FOODS, {
    mode: 'main',
    maxBudget: 5000,
    mealTime: 'any',
    mood: 'random-any',
  });
  assert.equal(impossibleBudget.length, 0);
});

test('pickRandomFood never repeats consecutive item when more than 1 option exists', () => {
  const pool = FOODS.slice(0, 3);
  for (let i = 0; i < 30; i++) {
    const picked = pickRandomFood(pool, 1, 'random-any');
    assert.ok(picked);
    assert.notEqual(picked.id, 1);
  }

  const singlePool = [FOODS[0]];
  const singlePicked = pickRandomFood(singlePool, 1, 'random-any');
  assert.equal(singlePicked?.id, 1);
});

test('pickRandomCombo always combines 1 main + 1 dessert within budget and sums prices accurately', () => {
  const combo = pickRandomCombo(FOODS, 60000);
  assert.ok(combo);
  assert.equal(combo.main.group, 'main');
  assert.equal(combo.dessert.group, 'dessert');
  assert.equal(combo.minTotal, combo.main.minPrice + combo.dessert.minPrice);
  assert.equal(combo.maxTotal, combo.main.maxPrice + combo.dessert.maxPrice);
  assert.equal(combo.maxTotal <= 60000, true);

  const impossibleCombo = pickRandomCombo(FOODS, 15000);
  assert.equal(impossibleCombo, null);
});

test('searchAndFilterMenu supports Vietnamese diacritic-insensitive search and vegetarian filter', () => {
  const phoResults = searchAndFilterMenu(FOODS, 'pho bo', 'all', false);
  assert.equal(phoResults.some((f) => f.id === 11), true);

  const vegResults = searchAndFilterMenu(FOODS, '', 'all', true);
  assert.equal(vegResults.every((f) => f.isVegetarian), true);
  assert.equal(vegResults.some((f) => f.id === 11), false); // Phở bò is not vegetarian

  assert.equal(formatPriceRange(35000, 55000), '35k–55k');
});
