export type FoodCategory =
  | 'com'
  | 'bun-pho'
  | 'banh-xoi'
  | 'mon-chinh-khac'
  | 'an-vat'
  | 'trang-mieng';

export type FoodGroup = 'main' | 'snack' | 'dessert';

export type FoodMode = 'main' | 'snack' | 'dessert' | 'all';

export type MealTime = 'sang' | 'trua' | 'toi';

export type MealTimeFilter = MealTime | 'any';

export type MoodId =
  | 'tired-light'
  | 'starving'
  | 'budget-saver'
  | 'treat-yourself'
  | 'sweet-tooth'
  | 'random-any';

export type MoodTag = 'light' | 'filling' | 'budget' | 'treat' | 'sweet' | 'warm' | 'crispy';

export type DishVessel =
  | 'rice-plate'
  | 'soup-bowl'
  | 'dry-bowl'
  | 'bamboo-tray'
  | 'banh-mi'
  | 'steamed-bun'
  | 'leaf-wrap'
  | 'sticky-rice'
  | 'skillet'
  | 'snack-plate'
  | 'dessert-cup'
  | 'ice-cone';

export interface DishVisualSpec {
  vessel: DishVessel;
  bgFrom: string;
  bgTo: string;
  mainColor: string;
  accentColor: string;
  garnishColor: string;
  variant: number;
}

export interface FoodItem {
  id: number;
  name: string;
  minPrice: number;
  maxPrice: number;
  category: FoodCategory;
  group: FoodGroup;
  mealTypes: MealTime[];
  description: string;
  imageUrl: string;
  imageAlt: string;
  isVegetarian: boolean;
  tags: MoodTag[];
  visual: DishVisualSpec;
}

export interface HistoryEntry {
  uid: string;
  foodId: number;
  foodName: string;
  minPrice: number;
  maxPrice: number;
  category: FoodCategory;
  chosenAt: string;
}

export interface ComboResult {
  main: FoodItem;
  dessert: FoodItem;
  minTotal: number;
  maxTotal: number;
}
