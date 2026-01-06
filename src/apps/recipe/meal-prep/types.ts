export enum MealType {
  BREAKFAST = 'BREAKFAST',
  BRUNCH = 'BRUNCH',
  LUNCH = 'LUNCH',
  DINNER = 'DINNER'
}

export enum DishAttribute {
  // Spice
  SPICY = 'SPICY',
  MILD = 'MILD',

  // Taste
  SOUR = 'SOUR',
  SWEET = 'SWEET',
  SAVORY = 'SAVORY',
  BITTER = 'BITTER',
  UMAMI = 'UMAMI',

  // Dietary
  VEGETARIAN = 'VEGETARIAN',
  VEGAN = 'VEGAN',
  MEAT = 'MEAT',
  SEAFOOD = 'SEAFOOD',
  POULTRY = 'POULTRY',
  DAIRY_FREE = 'DAIRY_FREE',
  GLUTEN_FREE = 'GLUTEN_FREE',

  // Cuisine
  ASIAN = 'ASIAN',
  EUROPEAN = 'EUROPEAN',
  MEDITERRANEAN = 'MEDITERRANEAN',
  MEXICAN = 'MEXICAN',
  INDIAN = 'INDIAN',
  ITALIAN = 'ITALIAN',
  CHINESE = 'CHINESE',
  JAPANESE = 'JAPANESE',
  THAI = 'THAI',
  MIDDLE_EASTERN = 'MIDDLE_EASTERN',
  AMERICAN = 'AMERICAN',
  LATIN_AMERICAN = 'LATIN_AMERICAN',

  // Characteristics
  HEALTHY = 'HEALTHY',
  COMFORT_FOOD = 'COMFORT_FOOD',
  LIGHT = 'LIGHT',
  HEAVY = 'HEAVY',
  PROTEIN_RICH = 'PROTEIN_RICH',
  LOW_CARB = 'LOW_CARB',
  HIGH_FIBER = 'HIGH_FIBER',
  FRESH = 'FRESH',
  WARM = 'WARM',
  COLD = 'COLD',
  CRISPY = 'CRISPY',
  CREAMY = 'CREAMY',
  GRILLED = 'GRILLED',
  BAKED = 'BAKED',
  FRIED = 'FRIED',
  RAW = 'RAW'
}

export interface MealPreference {
  type: MealType
  preparationTime: number
  attributes: DishAttribute[]
}

export interface MealRecommendation {
  id: string
  dishName: string
  preparationTime: number
  description: string
}

export interface MealPrepCategory {
  id: string
  categoryName: string
  mealRecommendations: MealRecommendation[]
}

export interface CreatePlanRequest {
  userInput?: string
  mealPreferences: MealPreference[]
}

export interface CreatePlanResponse {
  id: string
  response: MealPrepCategory[]
}

export interface RefreshCategoryResponse {
  id: string
  categoryName: string
  mealRecommendations: MealRecommendation[]
}

export interface Ingredient {
  name: string
  quantity: number
  unitType: string
}

export interface DishDetail {
  id: string
  name: string
  description: string
  preparationTime: number
  type?: MealType
  attributes?: DishAttribute[]
  ingredients: Ingredient[]
}

export interface WeeklyMenuResponse {
  dishList: DishDetail[]
  groceryList: Ingredient[]
}

// Attribute groups for UI organization
export const ATTRIBUTE_GROUPS = {
  dietary: [
    DishAttribute.VEGETARIAN,
    DishAttribute.VEGAN,
    DishAttribute.MEAT,
    DishAttribute.SEAFOOD,
    DishAttribute.POULTRY,
    DishAttribute.DAIRY_FREE,
    DishAttribute.GLUTEN_FREE
  ],
  cuisine: [
    DishAttribute.ASIAN,
    DishAttribute.EUROPEAN,
    DishAttribute.MEDITERRANEAN,
    DishAttribute.MEXICAN,
    DishAttribute.INDIAN,
    DishAttribute.ITALIAN,
    DishAttribute.CHINESE,
    DishAttribute.JAPANESE,
    DishAttribute.THAI,
    DishAttribute.MIDDLE_EASTERN,
    DishAttribute.AMERICAN,
    DishAttribute.LATIN_AMERICAN
  ],
  taste: [
    DishAttribute.SOUR,
    DishAttribute.SWEET,
    DishAttribute.SAVORY,
    DishAttribute.BITTER,
    DishAttribute.UMAMI,
    DishAttribute.SPICY,
    DishAttribute.MILD
  ],
  characteristics: [
    DishAttribute.HEALTHY,
    DishAttribute.COMFORT_FOOD,
    DishAttribute.LIGHT,
    DishAttribute.HEAVY,
    DishAttribute.PROTEIN_RICH,
    DishAttribute.LOW_CARB,
    DishAttribute.HIGH_FIBER,
    DishAttribute.FRESH,
    DishAttribute.WARM,
    DishAttribute.COLD,
    DishAttribute.CRISPY,
    DishAttribute.CREAMY,
    DishAttribute.GRILLED,
    DishAttribute.BAKED,
    DishAttribute.FRIED,
    DishAttribute.RAW
  ]
} as const

// Helper to get human-readable labels
export function formatMealType(type: MealType): string {
  const labels: Record<MealType, string> = {
    [MealType.BREAKFAST]: 'Breakfast',
    [MealType.BRUNCH]: 'Brunch',
    [MealType.LUNCH]: 'Lunch',
    [MealType.DINNER]: 'Dinner'
  }
  return labels[type]
}

export function formatAttribute(attribute: DishAttribute): string {
  return attribute
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}
