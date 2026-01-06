export interface RecipeRequest {
  dishName: string
  question: string
}

export type IngredientUnitType =
  | 'GRAM'
  | 'KILOGRAM'
  | 'LITER'
  | 'MILLILITER'
  | 'TEA_SPOON'
  | 'TABLE_SPOON'
  | 'UNIT'

export interface Ingredient {
  name: string
  quantity: number
  unitType: IngredientUnitType
}

export interface RecipeResponse {
  dishName: string
  recipe: string
  preparationTime: number
  ingredients: Ingredient[]
}

export interface Recommendation {
  dishName: string
  description: string
}

export interface RecommendationsRequest {
  description: string
}

export type RecommendationsResponse = Recommendation[]
