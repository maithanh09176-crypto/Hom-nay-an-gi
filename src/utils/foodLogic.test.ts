import test from 'node:test';
import assert from 'node:assert/strict';
import { FOODS } from '../data/foods';
import {
  filterByBudget,
  filterFoods,
  formatPriceRange,
  isFoodStillEligible,
  pickRandomCombo,
  pickRandomFood,
  searchAndFilterMenu,
  shuffleFoodsFisherYates,
} from './foodLogic';

// Test 7 & Test 8: Độ đầy đủ dữ liệu (120 món, 120 ID duy nhất, đúng 10 món cơm, 78 main, 30 snack, 12 dessert)
test('Test 7 & Test 8: dataset has exactly 120 unique dishes, 10 com, 78 main, 30 snack, 12 dessert', () => {
  assert.equal(FOODS.length, 120);

  const ids = new Set(FOODS.map((f) => f.id));
  assert.equal(ids.size, 120);
  for (let i = 1; i <= 120; i++) {
    assert.equal(ids.has(i), true, `Missing food ID ${i}`);
  }

  const comCount = FOODS.filter((f) => f.category === 'com').length;
  const mainCount = FOODS.filter((f) => f.mealKind === 'main').length;
  const snackCount = FOODS.filter((f) => f.mealKind === 'snack').length;
  const dessertCount = FOODS.filter((f) => f.mealKind === 'dessert').length;

  assert.equal(comCount, 10);
  assert.equal(mainCount, 78);
  assert.equal(snackCount, 30);
  assert.equal(dessertCount, 12);

  // Verify specific mealKind assignments for new items 101-120
  const mainNewIds = [101, 106, 107, 108, 109, 119];
  for (const id of mainNewIds) {
    const item = FOODS.find((f) => f.id === id);
    assert.equal(item?.mealKind, 'main', `ID ${id} must be main`);
  }
  const snackNewIds = [102, 103, 104, 105, 110, 111, 112, 113, 114, 115, 116, 117, 118, 120];
  for (const id of snackNewIds) {
    const item = FOODS.find((f) => f.id === id);
    assert.equal(item?.mealKind, 'snack', `ID ${id} must be snack`);
  }

  // Ensure no duplicate external imageUrl across dishes
  const nonEmptyUrls = FOODS.map((f) => f.imageUrl).filter(Boolean);
  assert.equal(new Set(nonEmptyUrls).size, nonEmptyUrls.length);

  // Ensure integer VND pricing and min <= typical <= max
  for (const food of FOODS) {
    assert.equal(Number.isInteger(food.minPrice), true);
    assert.equal(Number.isInteger(food.maxPrice), true);
    assert.equal(food.minPrice <= food.maxPrice, true);
    if (food.typicalPrice !== undefined) {
      assert.equal(Number.isInteger(food.typicalPrice), true);
      assert.equal(food.typicalPrice >= food.minPrice && food.typicalPrice <= food.maxPrice, true);
    }
  }
});

// Test 1: Ngân sách 25k -> mọi món hợp lệ phải có maxPrice <= 25000
test('Test 1: budget 25k strictly enforces maxPrice <= 25000 (excludes 30-50k, pho, pizza)', () => {
  const result = filterByBudget(FOODS, 25000);
  assert.equal(result.length > 0, true);
  assert.equal(result.every((f) => f.maxPrice <= 25000), true);

  // Explicit examples from specification
  assert.equal(result.some((f) => f.id === 43), true); // Bánh mì que 10-20k
  assert.equal(result.some((f) => f.id === 54), true); // Xôi đỗ 15-25k
  assert.equal(result.some((f) => f.id === 118), true); // Trứng vịt lộn 10-15k
  assert.equal(result.some((f) => f.id === 76), false); // Bánh tráng trộn 20-35k
  assert.equal(result.some((f) => f.id === 11), false); // Phở bò 35-55k
  assert.equal(result.some((f) => f.id === 101), false); // Pizza mini 95-150k
});

// Test 2: Ngân sách 35k -> mọi món hợp lệ phải có maxPrice <= 35000
test('Test 2: budget 35k strictly enforces maxPrice <= 35000', () => {
  const result = filterByBudget(FOODS, 35000);
  assert.equal(result.length > 0, true);
  assert.equal(result.every((f) => f.maxPrice <= 35000), true);
  assert.equal(result.some((f) => f.id === 101), false);
});

// Test 3: Ngân sách 55k -> mọi món hợp lệ phải có maxPrice <= 55000
test('Test 3: budget 55k strictly enforces maxPrice <= 55000', () => {
  const result = filterByBudget(FOODS, 55000);
  assert.equal(result.length > 0, true);
  assert.equal(result.every((f) => f.maxPrice <= 55000), true);
  assert.equal(result.some((f) => f.id === 111), false); // Ốc xào me 45-95k excluded
  assert.equal(result.some((f) => f.id === 101), false); // Pizza mini 95-150k excluded
});

// Test 4: Không có món phù hợp -> không tự ý chọn món từ danh sách không giới hạn
test('Test 4: impossible filter combination returns empty pool and null random result', () => {
  const impossible = filterFoods(FOODS, {
    mode: 'main',
    maxBudget: 25000,
    mealTime: 'any',
    vibe: 'western', // Pizza mini (95-150k), Hamburger gà (35-60k), Mì Ý (40-65k) all > 25k
  });
  assert.equal(impossible.length, 0);
  assert.equal(pickRandomFood(impossible, [], []), null);

  const impossibleCombo = pickRandomCombo(FOODS, 20000);
  assert.equal(impossibleCombo, null);
});

// Test 5: Random luôn thuộc danh sách đã lọc và tránh lặp 5 món gần nhất + đa dạng nhóm
test('Test 5: pickRandomFood always picks from filtered pool and avoids recent 5 when possible', () => {
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
});

// Test 6: Trộn thực đơn Fisher-Yates không giữ nguyên thứ tự ID 1..120
test('Test 6: shuffleFoodsFisherYates produces non-ID-ordered permutation preserving all 120 items', () => {
  const shuffled = shuffleFoodsFisherYates(FOODS);
  assert.equal(shuffled.length, 120);
  assert.equal(new Set(shuffled.map((f) => f.id)).size, 120);
  const sameOrder = shuffled.every((f, idx) => f.id === FOODS[idx].id);
  assert.equal(sameOrder, false);
});

// Combo & Gen Z vibe tags & Search tests
test('Gen Z vibes strictly filter by authentic tags and combo sums maxPrice accurately', () => {
  const spicyFoods = filterFoods(FOODS, {
    mode: 'all',
    maxBudget: null,
    mealTime: 'any',
    vibe: 'spicy',
  });
  assert.equal(spicyFoods.some((f) => f.id === 106), true); // Mì chua cay
  assert.equal(spicyFoods.some((f) => f.id === 36), true); // Mì cay Hàn Quốc
  assert.equal(spicyFoods.every((f) => f.tags.includes('spicy')), true);

  const combo = pickRandomCombo(FOODS, 60000);
  assert.ok(combo);
  assert.equal(combo.main.mealKind, 'main');
  assert.equal(combo.dessert.mealKind, 'dessert');
  assert.equal(combo.maxTotal <= 60000, true);

  const budgetSearch = searchAndFilterMenu(FOODS, '', 'all', false, 25000);
  assert.equal(budgetSearch.every((f) => f.maxPrice <= 25000), true);
  assert.equal(formatPriceRange(35000, 55000), '35k–55k');
});

// Test 9: Thay đổi ngân sách khi đang có kết quả cũ -> kết quả không hợp lệ phải bị loại bỏ
test('Test 9: isFoodStillEligible invalidates previously selected high-price food when budget lowers to 25k', () => {
  const highPriceFood = FOODS.find((f) => f.id === 101); // Pizza mini 95k-150k
  const affordableFood = FOODS.find((f) => f.id === 43); // Bánh mì que 10k-20k
  assert.ok(highPriceFood);
  assert.ok(affordableFood);

  const poolAll = filterFoods(FOODS, {
    mode: 'all',
    maxBudget: null,
    mealTime: 'any',
    vibe: 'all',
  });
  assert.equal(isFoodStillEligible(highPriceFood, poolAll), true);

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

// Category diversity: avoid picking same category 3 times in a row when alternatives exist
test('pickRandomFood avoids picking same category 3 times consecutively when other categories exist', () => {
  const pool = filterFoods(FOODS, {
    mode: 'main',
    maxBudget: 55000,
    mealTime: 'any',
    vibe: 'all',
  });
  const picked = pickRandomFood(pool, [1, 2], ['com', 'com'], () => 0);
  assert.ok(picked);
  assert.notEqual(picked.category, 'com');
});

