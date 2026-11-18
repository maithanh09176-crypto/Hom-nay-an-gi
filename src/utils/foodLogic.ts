import type {
  Budget,
  ComboResult,
  FoodCategory,
  FoodItem,
  FoodMode,
  FoodTag,
  MealTimeFilter,
  VibeFilterId,
} from '../types/food';

export const SAVING_MODE_MAX_BUDGET = 35000;

export interface FilterCriteria {
  mode: FoodMode;
  maxBudget: Budget; // null = không giới hạn (Tất cả)
  mealTime: MealTimeFilter;
  vibe: VibeFilterId;
}

export const VIBE_OPTIONS: Array<{
  id: VibeFilterId;
  emoji: string;
  label: string;
  hint: string;
  requiredTag: FoodTag | null;
}> = [
  {
    id: 'hot',
    emoji: '🍜',
    label: 'Ăn gì đó nóng nóng',
    hint: 'Ưu tiên phở, bún, cháo, bánh canh hoặc món nóng hổi ấm bụng.',
    requiredTag: 'hot',
  },
  {
    id: 'spicy',
    emoji: '🌶️',
    label: 'Thèm cay',
    hint: 'Lọc các món có vị cay tê kích thích vị giác.',
    requiredTag: 'spicy',
  },
  {
    id: 'fried',
    emoji: '🍗',
    label: 'Thèm đồ chiên',
    hint: 'Lọc gà rán, khoai chiên, nem rán, phô mai que giòn rụm.',
    requiredTag: 'fried',
  },
  {
    id: 'snails_seafood',
    emoji: '🐚',
    label: 'Ốc thế nào',
    hint: 'Lọc ốc luộc, ốc xào me, ngao, sò, hàu và hải sản nhâm nhi.',
    requiredTag: 'snails_seafood',
  },
  {
    id: 'western',
    emoji: '🍕',
    label: 'Muốn ăn đồ Tây',
    hint: 'Lọc pizza, hamburger, mì Ý, hot dog, taco, salad...',
    requiredTag: 'western',
  },
  {
    id: 'street_food',
    emoji: '🛵',
    label: 'Ăn vặt vỉa hè',
    hint: 'Lọc bánh tráng, thịt xiên, nem chua rán, phá lấu, bánh đúc nóng...',
    requiredTag: 'street_food',
  },
  {
    id: 'budget',
    emoji: '💸',
    label: 'Hôm nay tiết kiệm',
    hint: 'Lọc toàn bộ 184 món có giá tối đa ≤ 35k (hoặc giữ mức thấp hơn nếu bạn đã chọn).',
    requiredTag: null,
  },
  {
    id: 'sweet',
    emoji: '🍧',
    label: 'Thèm ngọt',
    hint: 'Lọc chè, sữa chua, caramen, panna cotta, tiramisu, kem...',
    requiredTag: 'sweet',
  },
];

export function formatKPrice(vnd: number): string {
  return `${Math.round(vnd / 1000)}k`;
}

export function formatPriceRange(minPrice: number, maxPrice: number): string {
  return `${formatKPrice(minPrice)}–${formatKPrice(maxPrice)}`;
}

export function formatBudgetLabel(maxBudget: Budget): string {
  if (maxBudget === null) return 'Tất cả';
  return `${maxBudget.toLocaleString('vi-VN')}đ`;
}

export function getEffectiveBudget(budget: Budget, vibe: VibeFilterId): Budget {
  if (vibe !== 'budget') return budget;
  if (budget !== null && budget < SAVING_MODE_MAX_BUDGET) {
    return budget;
  }
  return SAVING_MODE_MAX_BUDGET;
}

export function filterByBudget(foods: FoodItem[], budget: Budget): FoodItem[] {
  if (budget === null) return foods;
  return foods.filter((food) => food.maxPrice <= budget);
}

export function matchesMode(food: FoodItem, mode: FoodMode): boolean {
  if (mode === 'all') return true;
  return food.mealKind === mode;
}

export function matchesVibe(food: FoodItem, vibe: VibeFilterId): boolean {
  if (vibe === 'all') return true;
  if (vibe === 'budget') {
    return food.maxPrice <= SAVING_MODE_MAX_BUDGET;
  }
  const option = VIBE_OPTIONS.find((v) => v.id === vibe);
  if (!option || !option.requiredTag) return true;
  return food.tags.includes(option.requiredTag);
}

export function filterFoods(foods: FoodItem[], criteria: FilterCriteria): FoodItem[] {
  const effectiveBudget = getEffectiveBudget(criteria.maxBudget, criteria.vibe);
  const byMode = foods.filter((food) => matchesMode(food, criteria.mode));
  const byBudget = filterByBudget(byMode, effectiveBudget);
  return byBudget.filter((food) => {
    if (criteria.mealTime !== 'any' && !food.mealTypes.includes(criteria.mealTime)) {
      return false;
    }
    if (!matchesVibe(food, criteria.vibe)) {
      return false;
    }
    return true;
  });
}

export function isFoodStillEligible(
  selectedFood: FoodItem | null,
  eligiblePool: readonly FoodItem[]
): boolean {
  if (!selectedFood) return false;
  return eligiblePool.some((item) => item.id === selectedFood.id);
}

export function shuffleFoodsFisherYates<T>(
  items: readonly T[],
  rng: () => number = Math.random
): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickRandomFood(
  eligiblePool: FoodItem[],
  recentFoodIds: number[] = [],
  recentCategories: FoodCategory[] = [],
  rng: () => number = Math.random
): FoodItem | null {
  if (eligiblePool.length === 0) return null;

  // Prefer dishes not in the last 5 rolls
  const recentSet = new Set(recentFoodIds.slice(0, 5));
  let candidates = eligiblePool.filter((item) => !recentSet.has(item.id));

  // If all eligible items were recently rolled, avoid immediate repeat when >1 item exists
  if (candidates.length === 0) {
    const immediateLastId = recentFoodIds[0] ?? null;
    candidates =
      eligiblePool.length > 1 && immediateLastId !== null
        ? eligiblePool.filter((item) => item.id !== immediateLastId)
        : eligiblePool;
  }

  // Prefer diversity across categories (avoid same category 3 times consecutively when possible)
  if (recentCategories.length >= 2 && recentCategories[0] === recentCategories[1]) {
    const blockedCategory = recentCategories[0];
    const diverseCandidates = candidates.filter((item) => item.category !== blockedCategory);
    if (diverseCandidates.length > 0) {
      candidates = diverseCandidates;
    }
  } else if (recentCategories.length >= 1) {
    const lastCategory = recentCategories[0];
    const diverseCandidates = candidates.filter((item) => item.category !== lastCategory);
    if (diverseCandidates.length >= 3) {
      candidates = diverseCandidates;
    }
  }

  const idx = Math.floor(rng() * candidates.length);
  return candidates[Math.min(idx, candidates.length - 1)] ?? eligiblePool[0];
}

export function pickRandomCombo(
  foods: FoodItem[],
  comboBudget: Budget,
  lastComboPair: [number, number] | null = null,
  rng: () => number = Math.random
): ComboResult | null {
  const mains = foods.filter((f) => f.mealKind === 'main');
  const desserts = foods.filter((f) => f.mealKind === 'dessert');

  const validPairs: Array<{ main: FoodItem; dessert: FoodItem }> = [];
  for (const main of mains) {
    for (const dessert of desserts) {
      const combinedMax = main.maxPrice + dessert.maxPrice;
      if (comboBudget === null || combinedMax <= comboBudget) {
        validPairs.push({ main, dessert });
      }
    }
  }

  if (validPairs.length === 0) return null;

  const nonRepeatingPairs =
    validPairs.length > 1 && lastComboPair !== null
      ? validPairs.filter(
          (p) => !(p.main.id === lastComboPair[0] && p.dessert.id === lastComboPair[1])
        )
      : validPairs;

  const pool = nonRepeatingPairs.length > 0 ? nonRepeatingPairs : validPairs;
  const chosen = pool[Math.floor(rng() * pool.length)] ?? pool[0];

  return {
    main: chosen.main,
    dessert: chosen.dessert,
    minTotal: chosen.main.minPrice + chosen.dessert.minPrice,
    maxTotal: chosen.main.maxPrice + chosen.dessert.maxPrice,
  };
}

export function searchAndFilterMenu(
  foods: FoodItem[],
  query: string,
  category: FoodCategory | 'all',
  onlyVegetarian: boolean,
  maxBudget: Budget = null,
  vibe: VibeFilterId = 'all'
): FoodItem[] {
  const effectiveBudget = getEffectiveBudget(maxBudget, vibe);
  const budgetFiltered = filterByBudget(foods, effectiveBudget);
  const normalizedQuery = normalizeVietnamese(query.trim().toLowerCase());
  return budgetFiltered.filter((food) => {
    if (category !== 'all' && food.category !== category) return false;
    if (onlyVegetarian && !food.isVegetarian) return false;
    if (!matchesVibe(food, vibe)) return false;
    if (!normalizedQuery) return true;
    const normalizedName = normalizeVietnamese(food.name.toLowerCase());
    const normalizedDesc = normalizeVietnamese(food.description.toLowerCase());
    return (
      normalizedName.includes(normalizedQuery) ||
      normalizedDesc.includes(normalizedQuery) ||
      food.name.toLowerCase().includes(query.trim().toLowerCase())
    );
  });
}

export function normalizeVietnamese(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}
