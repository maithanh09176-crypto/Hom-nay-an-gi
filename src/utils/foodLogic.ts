import type {
  ComboResult,
  FoodCategory,
  FoodItem,
  FoodMode,
  MealTimeFilter,
  MoodId,
  MoodTag,
} from '../types/food';

export interface FilterCriteria {
  mode: FoodMode;
  maxBudget: number | null; // null = không giới hạn
  mealTime: MealTimeFilter;
  mood: MoodId;
}

export const MOOD_OPTIONS: Array<{
  id: MoodId;
  emoji: string;
  label: string;
  hint: string;
  preferredTags: MoodTag[];
}> = [
  {
    id: 'tired-light',
    emoji: '🥹',
    label: 'Hơi mệt, muốn ăn nhẹ',
    hint: 'Ưu tiên món ấm, thanh nhẹ, dễ tiêu nha.',
    preferredTags: ['light', 'warm'],
  },
  {
    id: 'starving',
    emoji: '🤤',
    label: 'Đói lắm rồi!',
    hint: 'Chọn món chắc bụng để nạp lại năng lượng liền!',
    preferredTags: ['filling'],
  },
  {
    id: 'budget-saver',
    emoji: '💸',
    label: 'Cuối tháng tiết kiệm',
    hint: 'Ưu tiên mấy món ngon-bổ-rẻ hợp ví sinh viên.',
    preferredTags: ['budget'],
  },
  {
    id: 'treat-yourself',
    emoji: '😋',
    label: 'Muốn ăn một bữa thật ngon',
    hint: 'Tự thưởng cho bản thân một bữa chất lượng chút nhé!',
    preferredTags: ['treat'],
  },
  {
    id: 'sweet-tooth',
    emoji: '🍬',
    label: 'Thèm đồ ngọt',
    hint: 'Ưu tiên các món ngọt dịu, mát lạnh để lên mood.',
    preferredTags: ['sweet'],
  },
  {
    id: 'random-any',
    emoji: '🤔',
    label: 'Không biết, random đại đi!',
    hint: 'Để vũ trụ tự do sắp xếp bữa hôm nay cho bạn.',
    preferredTags: [],
  },
];

export function formatKPrice(vnd: number): string {
  return `${Math.round(vnd / 1000)}k`;
}

export function formatPriceRange(minPrice: number, maxPrice: number): string {
  return `${formatKPrice(minPrice)}–${formatKPrice(maxPrice)}`;
}

export function formatBudgetLabel(maxBudget: number | null): string {
  if (maxBudget === null) return 'Không giới hạn';
  return `${maxBudget.toLocaleString('vi-VN')}đ`;
}

export function matchesMode(food: FoodItem, mode: FoodMode): boolean {
  if (mode === 'all') return true;
  return food.group === mode;
}

export function filterFoods(foods: FoodItem[], criteria: FilterCriteria): FoodItem[] {
  return foods.filter((food) => {
    if (!matchesMode(food, criteria.mode)) return false;
    if (criteria.maxBudget !== null && food.maxPrice > criteria.maxBudget) return false;
    if (criteria.mealTime !== 'any' && !food.mealTypes.includes(criteria.mealTime)) return false;
    return true;
  });
}

export function getMoodWeight(food: FoodItem, mood: MoodId): number {
  if (mood === 'random-any') return 1;
  const option = MOOD_OPTIONS.find((m) => m.id === mood);
  if (!option) return 1;

  let score = 1;
  for (const tag of option.preferredTags) {
    if (food.tags.includes(tag)) {
      score += 3;
    }
  }
  if (mood === 'budget-saver' && food.maxPrice <= 35000) {
    score += 3;
  }
  if (mood === 'sweet-tooth' && food.group === 'dessert') {
    score += 4;
  }
  return score;
}

export function pickRandomFood(
  pool: FoodItem[],
  lastFoodId: number | null,
  mood: MoodId = 'random-any',
  rng: () => number = Math.random
): FoodItem | null {
  if (pool.length === 0) return null;

  const candidates =
    pool.length > 1 && lastFoodId !== null
      ? pool.filter((item) => item.id !== lastFoodId)
      : pool;

  const weights = candidates.map((item) => getMoodWeight(item, mood));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  if (totalWeight <= 0) {
    const idx = Math.floor(rng() * candidates.length);
    return candidates[Math.min(idx, candidates.length - 1)];
  }

  let threshold = rng() * totalWeight;
  for (let i = 0; i < candidates.length; i++) {
    threshold -= weights[i];
    if (threshold <= 0) {
      return candidates[i];
    }
  }
  return candidates[candidates.length - 1];
}

export function pickRandomCombo(
  foods: FoodItem[],
  comboBudget: number | null,
  lastComboPair: [number, number] | null = null,
  rng: () => number = Math.random
): ComboResult | null {
  const mains = foods.filter((f) => f.group === 'main');
  const desserts = foods.filter((f) => f.group === 'dessert');

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
  onlyVegetarian: boolean
): FoodItem[] {
  const normalizedQuery = normalizeVietnamese(query.trim().toLowerCase());
  return foods.filter((food) => {
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
