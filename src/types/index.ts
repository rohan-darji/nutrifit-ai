
export interface User {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
}

export interface NutrientBreakdown {
  carbohydrates: string;
  protein: string;
  fats: string;
  fiber: string;
  sugar: string;
}

export interface FoodItem {
  item: string;
  calories: number;
}

export interface NutritionResult {
  total_calories: number;
  food_items: FoodItem[];
  healthiness: string;
  nutrient_breakdown: NutrientBreakdown;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
