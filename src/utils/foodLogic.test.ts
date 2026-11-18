import test from 'node:test';
import assert from 'node:assert/strict';
import { FOODS } from '../data/foods';
import {
  SAVING_MODE_MAX_BUDGET,
  filterByBudget,
  filterFoods,
  formatPriceRange,
  getEffectiveBudget,
  isFoodStillEligible,
  normalizeVietnamese,
  pickRandomCombo,
  pickRandomFood,
  searchAndFilterMenu,
  shuffleFoodsFisherYates,
} from './foodLogic';

// Test 1: Dataset completeness — exactly 184 unique dishes, 1..184, 0 duplicate names, com === 10
test('Dataset has exactly 184 unique dishes (IDs 1..184), 0 duplicate names, and com <= 10', () => {
  assert.equal(FOODS.length, 184);

  const ids = new Set(FOODS.map((f) => f.id));
  assert.equal(ids.size, 184);
  for (let i = 1; i <= 184; i++) {
    assert.equal(ids.has(i), true, `Missing food ID ${i}`);
  }

  const normalizedNames = FOODS.map((f) => normalizeVietnamese(f.name.trim().toLowerCase()));
  assert.equal(new Set(normalizedNames).size, 184, 'Duplicate dish names detected');

  const comCount = FOODS.filter((f) => f.category === 'com').length;
  assert.equal(comCount, 10);

  // Verify new saving-mode dishes 169-176 are snack, not main
  for (let id = 169; id <= 176; id++) {
    const item = FOODS.find((f) => f.id === id);
    assert.ok(item, `Missing ID ${id}`);
    assert.equal(item.mealKind, 'snack', `ID ${id} (${item.name}) must be snack`);
    assert.equal(item.maxPrice <= SAVING_MODE_MAX_BUDGET, true, `ID ${id} must be <= 35k`);
  }

  // Ensure no duplicate external imageUrl across dishes
  const nonEmptyUrls = FOODS.map((f) => f.imageUrl).filter(Boolean);
  assert.equal(new Set(nonEmptyUrls).size, nonEmptyUrls.length);

  // Ensure integer VND pricing and min <= typical <= max
  for (const food of FOODS) {
    assert.equal(Number.isInteger(food.minPrice), true);
    assert.equal(Number.isInteger(food.maxPrice), true);
    assert.equal(food.minPrice > 0, true);
    assert.equal(food.minPrice <= food.maxPrice, true);
    if (food.typicalPrice !== undefined) {
      assert.equal(Number.isInteger(food.typicalPrice), true);
      assert.equal(food.typicalPrice >= food.minPrice && food.typicalPrice <= food.maxPrice, true);
    }
  }
});

// Test 2: Strict budget filtering across 25k, 35k, 55k
test('Strict budget filtering enforces maxPrice <= budget across 25k, 35k, 55k', () => {
  const res25 = filterByBudget(FOODS, 25000);
  assert.equal(res25.length > 0, true);
  assert.equal(res25.every((f) => f.maxPrice <= 25000), true);
  assert.equal(res25.some((f) => f.id === 43), true); // Bánh mì que 10-20k
  assert.equal(res25.some((f) => f.id === 54), true); // Xôi đỗ 15-25k
  assert.equal(res25.some((f) => f.id === 118), true); // Trứng vịt lộn 10-15k
  assert.equal(res25.some((f) => f.id === 76), false); // Bánh tráng trộn 20-35k
  assert.equal(res25.some((f) => f.id === 11), false); // Phở bò 35-55k
  assert.equal(res25.some((f) => f.id === 101), false); // Pizza mini 95-150k

  const res35 = filterByBudget(FOODS, 35000);
  assert.equal(res35.length > 0, true);
  assert.equal(res35.every((f) => f.maxPrice <= 35000), true);
  assert.equal(res35.some((f) => f.id === 101), false);

  const res55 = filterByBudget(FOODS, 55000);
  assert.equal(res55.length > 0, true);
  assert.equal(res55.every((f) => f.maxPrice <= 55000), true);
  assert.equal(res55.some((f) => f.id === 111), false); // Ốc xào me 45-95k
  assert.equal(res55.some((f) => f.id === 101), false); // Pizza mini 95-150k
});

// Test 3: Gen Z vibe tag accuracy rules
test('Gen Z 8 vibes follow exact culinary tag rules', () => {
  const snailsPool = filterFoods(FOODS, {
    mode: 'all',
    maxBudget: null,
    mealTime: 'any',
    vibe: 'snails_seafood',
  });
  const streetPool = filterFoods(FOODS, {
    mode: 'all',
    maxBudget: null,
    mealTime: 'any',
    vibe: 'street_food',
  });
  const westernPool = filterFoods(FOODS, {
    mode: 'all',
    maxBudget: null,
    mealTime: 'any',
    vibe: 'western',
  });
  const spicyPool = filterFoods(FOODS, {
    mode: 'all',
    maxBudget: null,
    mealTime: 'any',
    vibe: 'spicy',
  });
  const hotPool = filterFoods(FOODS, {
    mode: 'all',
    maxBudget: null,
    mealTime: 'any',
    vibe: 'hot',
  });

  // Bún ốc (ID 18) must NOT be in "Ốc thế nào" or "Ăn vặt vỉa hè"
  assert.equal(snailsPool.some((f) => f.id === 18), false);
  assert.equal(streetPool.some((f) => f.id === 18), false);

  // Japanese/Korean dishes must NOT be in "Muốn ăn đồ Tây"
  const nonWesternAsianIds = [33, 36, 81, 107, 114, 123, 124, 129, 130, 135];
  for (const id of nonWesternAsianIds) {
    assert.equal(
      westernPool.some((f) => f.id === id),
      false,
      `ID ${id} must not be classified as western`
    );
  }

  // Ốc cà na xào sả ớt (ID 147) must match spicy, snails_seafood, street_food, and hot
  assert.equal(spicyPool.some((f) => f.id === 147), true);
  assert.equal(snailsPool.some((f) => f.id === 147), true);
  assert.equal(streetPool.some((f) => f.id === 147), true);
  assert.equal(hotPool.some((f) => f.id === 147), true);

  // All 8 vibes should return healthy non-empty pools at null budget
  const vibes = [
    'hot',
    'spicy',
    'fried',
    'snails_seafood',
    'western',
    'street_food',
    'budget',
    'sweet',
  ] as const;
  for (const vibe of vibes) {
    const pool = filterFoods(FOODS, {
      mode: 'all',
      maxBudget: null,
      mealTime: 'any',
      vibe,
    });
    assert.equal(pool.length >= 12, true, `Vibe ${vibe} should have at least 12 dishes`);
  }
});

// Test 4: "Hôm nay tiết kiệm" mode behavior
test('Saving mode (vibe: budget) filters all 184 dishes <= 35k and preserves lower user budget', () => {
  assert.equal(getEffectiveBudget(null, 'budget'), 35000);
  assert.equal(getEffectiveBudget(75000, 'budget'), 35000);
  assert.equal(getEffectiveBudget(25000, 'budget'), 25000);
  assert.equal(getEffectiveBudget(75000, 'all'), 75000);

  const savingAll = filterFoods(FOODS, {
    mode: 'all',
    maxBudget: null,
    mealTime: 'any',
    vibe: 'budget',
  });
  assert.equal(savingAll.every((f) => f.maxPrice <= 35000), true);
  // Snack IDs 169-176 included in 'all'
  assert.equal(savingAll.some((f) => f.id === 169), true);
  assert.equal(savingAll.some((f) => f.id === 176), true);

  // When user budget is already 25k, saving mode respects 25k
  const saving25k = filterFoods(FOODS, {
    mode: 'all',
    maxBudget: 25000,
    mealTime: 'any',
    vibe: 'budget',
  });
  assert.equal(saving25k.every((f) => f.maxPrice <= 25000), true);

  // When mode is 'main', snack items 169-176 are excluded
  const savingMains = filterFoods(FOODS, {
    mode: 'main',
    maxBudget: 35000,
    mealTime: 'any',
    vibe: 'budget',
  });
  assert.equal(savingMains.some((f) => f.id >= 169 && f.id <= 176), false);
});

// Test 5: Impossible filter returns empty pool without fallback to unlimited list
test('Impossible filter combination returns empty pool and null random result', () => {
  const impossible = filterFoods(FOODS, {
    mode: 'main',
    maxBudget: 25000,
    mealTime: 'any',
    vibe: 'western',
  });
  assert.equal(impossible.length, 0);
  assert.equal(pickRandomFood(impossible, [], []), null);
  assert.equal(pickRandomCombo(FOODS, 20000), null);
});

// Test 6: Randomizer avoids recent 5 dishes and avoids 3 consecutive repeats of same category
test('pickRandomFood picks strictly from filtered pool, avoids recent 5, and diversifies categories', () => {
  const pool = filterFoods(FOODS, {
    mode: 'snack',
    maxBudget: 35000,
    mealTime: 'any',
    vibe: 'all',
  });
  assert.equal(pool.every((f) => f.mealKind === 'snack' && f.maxPrice <= 35000), true);

  const poolIds = new Set(pool.map((f) => f.id));
  const recent: number[] = [];
  for (let i = 0; i < 20; i++) {
    const picked = pickRandomFood(pool, recent, []);
    assert.ok(picked);
    assert.equal(poolIds.has(picked.id), true);
    if (pool.length > 5) {
      assert.equal(recent.slice(0, 5).includes(picked.id), false);
    }
    recent.unshift(picked.id);
  }

  const mainPool = filterFoods(FOODS, {
    mode: 'main',
    maxBudget: 55000,
    mealTime: 'any',
    vibe: 'all',
  });
  const diversePick = pickRandomFood(mainPool, [1, 2], ['com', 'com'], () => 0);
  assert.ok(diversePick);
  assert.notEqual(diversePick.category, 'com');
});

// Test 7: Fisher-Yates shuffle preserves all 184 dishes in a randomized permutation
test('shuffleFoodsFisherYates shuffles all 184 items without losing or duplicating any', () => {
  const shuffled = shuffleFoodsFisherYates(FOODS);
  assert.equal(shuffled.length, 184);
  assert.equal(new Set(shuffled.map((f) => f.id)).size, 184);
  const sameOrder = shuffled.every((f, idx) => f.id === FOODS[idx].id);
  assert.equal(sameOrder, false);
});

// Test 8: Menu search + vibe + budget + Combo + Re-validation (Test 9)
test('searchAndFilterMenu, pickRandomCombo, and isFoodStillEligible work consistently', () => {
  const combo = pickRandomCombo(FOODS, 60000);
  assert.ok(combo);
  assert.equal(combo.main.mealKind, 'main');
  assert.equal(combo.dessert.mealKind, 'dessert');
  assert.equal(combo.maxTotal <= 60000, true);

  const budgetSearch = searchAndFilterMenu(FOODS, '', 'all', false, 25000, 'all');
  assert.equal(budgetSearch.every((f) => f.maxPrice <= 25000), true);

  const snailSearch = searchAndFilterMenu(FOODS, '', 'all', false, null, 'snails_seafood');
  assert.equal(snailSearch.some((f) => f.id === 147), true);
  assert.equal(snailSearch.some((f) => f.id === 18), false);

  assert.equal(formatPriceRange(35000, 55000), '35k–55k');

  const highPriceFood = FOODS.find((f) => f.id === 101); // Pizza mini 95k-150k
  const affordableFood = FOODS.find((f) => f.id === 43); // Bánh mì que 10k-20k
  assert.ok(highPriceFood);
  assert.ok(affordableFood);

  const pool25k = filterFoods(FOODS, {
    mode: 'all',
    maxBudget: 25000,
    mealTime: 'any',
    vibe: 'all',
  });
  assert.equal(isFoodStillEligible(highPriceFood, pool25k), false);
  assert.equal(isFoodStillEligible(affordableFood, pool25k), true);
  assert.equal(isFoodStillEligible(null, pool25k), false);
});
