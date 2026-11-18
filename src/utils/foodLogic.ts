import type {
  ComboResult,
  FoodCategory,
  FoodItem,
  FoodMode,
  FoodTag,
  MealTimeFilter,
  VibeFilterId,
} from '../types/food';

export interface FilterCriteria {
  mode: FoodMode;
  maxBudget: number | null; // null = không giới hạn (Tất cả)
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
    id: 'warm',
    emoji: '🍜',
    label: 'Ăn gì đó nóng nóng',
    hint: 'Ưu tiên mấy món nước, cháo hoặc đồ nóng hổi ấm bụng.',
    requiredTag: 'warm',
  },
  {
    id: 'spicy',
    emoji: '🌶️',
    label: 'Thèm cay',
    hint: 'Lọc các món có vị cay tê kích thích vị giác.',
    requiredTag: 'spicy',
  },
  {
    id: 'crispy',
    emoji: '🍗',
    label: 'Thèm đồ chiên',
    hint: 'Lọc gà rán, khoai chiên, nem rán và các món giòn rụm.',
    requiredTag: 'crispy',
  },
  {
    id: 'seafood',
    emoji: '🐚',
    label: 'Đi ăn ốc không?',
    hint: 'Lọc ốc, ngao và các món hải sản.',
    requiredTag: 'seafood',
  },
  {
    id: 'western',
    emoji: '🍕',
    label: 'Muốn ăn đồ Tây',
    hint: 'Lọc pizza, hamburger, mì Ý, phô mai que...',
    requiredTag: 'western',
  },
  {
    id: 'street-food',
    emoji: '🛵',
    label: 'Ăn vặt vỉa hè',
    hint: 'Lọc ốc, bánh tráng, thịt xiên, bánh đúc nóng, bánh rán mặn...',
    requiredTag: 'street-food',
  },
  {
    id: 'budget',
    emoji: '💸',
    label: 'Hôm nay tiết kiệm',
    hint: 'Lọc các món bình dân cực mềm cho ví sinh viên (≤ 35k).',
    requiredTag: 'budget',
  },
  {
    id: 'sweet',
    emoji: '🍧',
    label: 'Thèm ngọt',
    hint: 'Lọc chè, sữa chua, caramen, kem và món ngọt.',
    requiredTag: 'sweet',
  },
];

export function formatKPrice(vnd: number): string {
  return `${Math.round(vnd / 1000)}k`;
}

export function formatPriceRange(minPrice: number, maxPrice: number): string {
  return `${formatKPrice(minPrice)}–${formatKPrice(maxPrice)}`;
}

export function formatBudgetLabel(maxBudget: number | null): string {
  if (maxBudget === null) return 'Tất cả';
  return `${maxBudget.toLocaleString('vi-VN')}đ`;
}

export function filterByBudget(foods: FoodItem[], budget: number | null): FoodItem[] {
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
    return food.tags.includes('budget') || food.maxPrice <= 35000;
  }
  const option = VIBE_OPTIONS.find((v) => v.id === vibe);
  if (!option || !option.requiredTag) return true;
  return food.tags.includes(option.requiredTag);
}

export function filterFoods(foods: FoodItem[], criteria: FilterCriteria): FoodItem[] {
  const byMode = foods.filter((food) => matchesMode(food, criteria.mode));
  const byBudget = filterByBudget(byMode, criteria.maxBudget);
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

  // If fewer than 1 option remains outside the 5-roll window, allow re-use while avoiding immediate repeat
  if (candidates.length === 0) {
    const immediateLastId = recentFoodIds[0] ?? null;
    candidates =
      eligiblePool.length > 1 && immediateLastId !== null
        ? eligiblePool.filter((item) => item.id !== immediateLastId)
        : eligiblePool;
  }

  // Prefer avoiding the same category 3 times in a row when other eligible categories exist
  if (recentCategories.length >= 2 && recentCategories[0] === recentCategories[1]) {
    const blockedCategory = recentCategories[0];
    const diverseCandidates = candidates.filter((item) => item.category !== blockedCategory);
    if (diverseCandidates.length > 0) {
      candidates = diverseCandidates;
    }
  }

  const idx = Math.floor(rng() * candidates.length);
  return candidates[Math.min(idx, candidates.length - 1)] ?? eligiblePool[0];
}

export function pickRandomCombo(
  foods: FoodItem[],
  comboBudget: number | null,
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
  maxBudget: number | null = null
): FoodItem[] {
  const budgetFiltered = filterByBudget(foods, maxBudget);
  const normalizedQuery = normalizeVietnamese(query.trim().toLowerCase());
  return budgetFiltered.filter((food) => {
    if (category !== 'all' && food.category !== category) return false;
    if (onlyVegetarian && !food.isVegetarian) return false;
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
