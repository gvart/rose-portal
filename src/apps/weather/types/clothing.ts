export enum BodyPart {
  HEAD = 'HEAD',
  UPPER_BODY = 'UPPER_BODY',
  LOWER_BODY = 'LOWER_BODY',
  FEET = 'FEET',
  OTHER = 'OTHER'
}

export enum ClothingItem {
  // Head
  BEANIE = 'BEANIE',
  CAP = 'CAP',
  HAT = 'HAT',
  SUN_HAT = 'SUN_HAT',
  HEADBAND = 'HEADBAND',
  EAR_MUFFS = 'EAR_MUFFS',
  HOOD = 'HOOD',

  // Upper Body
  T_SHIRT = 'T_SHIRT',
  LONG_SLEEVE_SHIRT = 'LONG_SLEEVE_SHIRT',
  POLO_SHIRT = 'POLO_SHIRT',
  SWEATER = 'SWEATER',
  CARDIGAN = 'CARDIGAN',
  HOODIE = 'HOODIE',
  SWEATSHIRT = 'SWEATSHIRT',
  LIGHT_JACKET = 'LIGHT_JACKET',
  HEAVY_JACKET = 'HEAVY_JACKET',
  WINTER_COAT = 'WINTER_COAT',
  RAIN_JACKET = 'RAIN_JACKET',
  WINDBREAKER = 'WINDBREAKER',
  VEST = 'VEST',
  BLAZER = 'BLAZER',
  TANK_TOP = 'TANK_TOP',

  // Lower Body
  SHORTS = 'SHORTS',
  LONG_PANTS = 'LONG_PANTS',
  JEANS = 'JEANS',
  LEGGINGS = 'LEGGINGS',
  JOGGERS = 'JOGGERS',
  SWEATPANTS = 'SWEATPANTS',
  SKIRT = 'SKIRT',
  CARGO_PANTS = 'CARGO_PANTS',

  // Feet
  SANDALS = 'SANDALS',
  SNEAKERS = 'SNEAKERS',
  BOOTS = 'BOOTS',
  RAIN_BOOTS = 'RAIN_BOOTS',
  WINTER_BOOTS = 'WINTER_BOOTS',
  DRESS_SHOES = 'DRESS_SHOES',
  FLIP_FLOPS = 'FLIP_FLOPS',
  ATHLETIC_SHOES = 'ATHLETIC_SHOES',

  // Other/Accessories
  SCARF = 'SCARF',
  GLOVES = 'GLOVES',
  MITTENS = 'MITTENS',
  SUNGLASSES = 'SUNGLASSES',
  UMBRELLA = 'UMBRELLA',
  BELT = 'BELT',
  SOCKS = 'SOCKS',
  WARM_SOCKS = 'WARM_SOCKS',
  WATCH = 'WATCH'
}

export interface WeatherSummary {
  temperature: number
  apparentTemperature: number
  precipitation: number
  windSpeed: number
  cloudCover: number
}

export interface ClothingRecommendationResponse {
  recommendations: Record<BodyPart, ClothingItem[]>
  description: string
  weatherSummary: WeatherSummary
}

// Icon mapping for clothing items (MDI icons from Iconify)
export const CLOTHING_ICONS: Record<ClothingItem, { icon?: string; emoji: string; label: string }> = {
  // Head
  [ClothingItem.BEANIE]: { icon: 'mdi:hat-fedora', emoji: '🧢', label: 'Beanie' },
  [ClothingItem.CAP]: { icon: 'mdi:hat-fedora', emoji: '🧢', label: 'Cap' },
  [ClothingItem.HAT]: { icon: 'mdi:hat-fedora', emoji: '🎩', label: 'Hat' },
  [ClothingItem.SUN_HAT]: { icon: 'mdi:hat-fedora', emoji: '👒', label: 'Sun Hat' },
  [ClothingItem.HEADBAND]: { emoji: '🎀', label: 'Headband' },
  [ClothingItem.EAR_MUFFS]: { emoji: '🎧', label: 'Ear Muffs' },
  [ClothingItem.HOOD]: { emoji: '🧥', label: 'Hood' },

  // Upper Body
  [ClothingItem.T_SHIRT]: { icon: 'mdi:tshirt-crew', emoji: '👕', label: 'T-Shirt' },
  [ClothingItem.LONG_SLEEVE_SHIRT]: { icon: 'mdi:tshirt-crew', emoji: '👔', label: 'Long Sleeve Shirt' },
  [ClothingItem.POLO_SHIRT]: { icon: 'mdi:tshirt-crew', emoji: '👕', label: 'Polo Shirt' },
  [ClothingItem.SWEATER]: { icon: 'mdi:hanger', emoji: '🧶', label: 'Sweater' },
  [ClothingItem.CARDIGAN]: { icon: 'mdi:hanger', emoji: '🧥', label: 'Cardigan' },
  [ClothingItem.HOODIE]: { icon: 'mdi:hanger', emoji: '🧥', label: 'Hoodie' },
  [ClothingItem.SWEATSHIRT]: { icon: 'mdi:hanger', emoji: '👕', label: 'Sweatshirt' },
  [ClothingItem.LIGHT_JACKET]: { icon: 'mdi:coat-rack', emoji: '🧥', label: 'Light Jacket' },
  [ClothingItem.HEAVY_JACKET]: { icon: 'mdi:coat-rack', emoji: '🧥', label: 'Heavy Jacket' },
  [ClothingItem.WINTER_COAT]: { icon: 'mdi:coat-rack', emoji: '🧥', label: 'Winter Coat' },
  [ClothingItem.RAIN_JACKET]: { icon: 'mdi:weather-pouring', emoji: '🧥', label: 'Rain Jacket' },
  [ClothingItem.WINDBREAKER]: { icon: 'mdi:weather-windy', emoji: '🧥', label: 'Windbreaker' },
  [ClothingItem.VEST]: { icon: 'mdi:hanger', emoji: '🦺', label: 'Vest' },
  [ClothingItem.BLAZER]: { icon: 'mdi:hanger', emoji: '🧥', label: 'Blazer' },
  [ClothingItem.TANK_TOP]: { icon: 'mdi:tshirt-crew', emoji: '🎽', label: 'Tank Top' },

  // Lower Body
  [ClothingItem.SHORTS]: { icon: 'mdi:rectangle', emoji: '🩳', label: 'Shorts' },
  [ClothingItem.LONG_PANTS]: { icon: 'mdi:rectangle-outline', emoji: '👖', label: 'Long Pants' },
  [ClothingItem.JEANS]: { icon: 'mdi:rectangle-outline', emoji: '👖', label: 'Jeans' },
  [ClothingItem.LEGGINGS]: { icon: 'mdi:rectangle-outline', emoji: '🩱', label: 'Leggings' },
  [ClothingItem.JOGGERS]: { icon: 'mdi:run', emoji: '👖', label: 'Joggers' },
  [ClothingItem.SWEATPANTS]: { icon: 'mdi:rectangle-outline', emoji: '👖', label: 'Sweatpants' },
  [ClothingItem.SKIRT]: { icon: 'mdi:triangle', emoji: '👗', label: 'Skirt' },
  [ClothingItem.CARGO_PANTS]: { icon: 'mdi:rectangle-outline', emoji: '👖', label: 'Cargo Pants' },

  // Feet
  [ClothingItem.SANDALS]: { icon: 'mdi:shoe-print', emoji: '👡', label: 'Sandals' },
  [ClothingItem.SNEAKERS]: { icon: 'mdi:shoe-sneaker', emoji: '👟', label: 'Sneakers' },
  [ClothingItem.BOOTS]: { icon: 'mdi:shoe-formal', emoji: '🥾', label: 'Boots' },
  [ClothingItem.RAIN_BOOTS]: { icon: 'mdi:shoe-formal', emoji: '🥾', label: 'Rain Boots' },
  [ClothingItem.WINTER_BOOTS]: { icon: 'mdi:shoe-formal', emoji: '🥾', label: 'Winter Boots' },
  [ClothingItem.DRESS_SHOES]: { icon: 'mdi:shoe-formal', emoji: '👞', label: 'Dress Shoes' },
  [ClothingItem.FLIP_FLOPS]: { icon: 'mdi:shoe-print', emoji: '🩴', label: 'Flip Flops' },
  [ClothingItem.ATHLETIC_SHOES]: { icon: 'mdi:shoe-sneaker', emoji: '👟', label: 'Athletic Shoes' },

  // Other/Accessories
  [ClothingItem.SCARF]: { icon: 'mdi:scarf', emoji: '🧣', label: 'Scarf' },
  [ClothingItem.GLOVES]: { icon: 'mdi:hand-back-right', emoji: '🧤', label: 'Gloves' },
  [ClothingItem.MITTENS]: { icon: 'mdi:hand-back-right', emoji: '🧤', label: 'Mittens' },
  [ClothingItem.SUNGLASSES]: { icon: 'mdi:sunglasses', emoji: '🕶️', label: 'Sunglasses' },
  [ClothingItem.UMBRELLA]: { icon: 'mdi:umbrella', emoji: '☂️', label: 'Umbrella' },
  [ClothingItem.BELT]: { icon: 'mdi:minus-circle', emoji: '⚫', label: 'Belt' },
  [ClothingItem.SOCKS]: { icon: 'mdi:foot-print', emoji: '🧦', label: 'Socks' },
  [ClothingItem.WARM_SOCKS]: { icon: 'mdi:foot-print', emoji: '🧦', label: 'Warm Socks' },
  [ClothingItem.WATCH]: { icon: 'mdi:watch', emoji: '⌚', label: 'Watch' }
}

// Helper to get body part display name
export function getBodyPartLabel(bodyPart: BodyPart): string {
  const labels: Record<BodyPart, string> = {
    [BodyPart.HEAD]: 'Head',
    [BodyPart.UPPER_BODY]: 'Upper Body',
    [BodyPart.LOWER_BODY]: 'Lower Body',
    [BodyPart.FEET]: 'Feet',
    [BodyPart.OTHER]: 'Accessories'
  }
  return labels[bodyPart]
}
