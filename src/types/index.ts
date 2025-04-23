export interface User {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string | null;
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
  is_safe_to_consume: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
