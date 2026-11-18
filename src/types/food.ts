export type FoodCategory =
  | 'com'
  | 'bun-pho'
  | 'banh-xoi'
  | 'mon-chinh-khac'
  | 'pizza'
  | 'ga-ran'
  | 'hai-san'
  | 'do-tay'
  | 'an-vat'
  | 'trang-mieng';

export type MealKind = 'main' | 'snack' | 'dessert';

export type FoodMode = MealKind | 'all';

export type MealTime = 'sang' | 'trua' | 'toi';

export type MealTimeFilter = MealTime | 'any';

export type Budget = number | null;

export type VibeFilterId =
  | 'all'
  | 'hot'
  | 'spicy'
  | 'fried'
  | 'snails_seafood'
  | 'western'
  | 'street_food'
  | 'budget'
  | 'sweet';

export type FoodTag =
  | 'light'
  | 'filling'
  | 'budget'
  | 'treat'
  | 'sweet'
  | 'hot'
  | 'fried'
  | 'spicy'
  | 'snails_seafood'
  | 'western'
  | 'street_food';

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
  | 'ice-cone'
  | 'pizza'
  | 'burger'
  | 'fried-chicken'
  | 'seafood-bowl'
  | 'skewer';

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
  typicalPrice?: number;
  category: FoodCategory;
  mealKind: MealKind;
  mealTypes: MealTime[];
  description: string;
  imageUrl: string;
  imageAlt: string;
  isVegetarian: boolean;
  tags: FoodTag[];
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
