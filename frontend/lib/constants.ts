// Prisma enum key → Japanese label mappings

export const AREA_LABELS: Record<string, string> = {
  GINZA: '銀座',
  AKASAKA: '赤坂',
  ROPPONGI: '六本木',
  SHIMBASHI: '新橋',
  AZABU: '麻布',
  EBIISU: '恵比寿',
  OMOTESANDO: '表参道',
  OTHER: 'その他',
}

export const GENRE_LABELS: Record<string, string> = {
  SUSHI: '寿司',
  FRENCH: 'フレンチ',
  ITALIAN: 'イタリアン',
  WASHOKU: '和食',
  CHINESE: '中華',
  TEPPANYAKI: '鉄板焼き',
  YAKINIKU: '焼肉',
  TEMPURA: '天ぷら',
  KAPPO: '割烹',
  OTHER: 'その他',
}

export const PRICE_RANGE_LABELS: Record<string, string> = {
  RANGE_5000: '~¥5,000',
  RANGE_10000: '¥5,000~¥10,000',
  RANGE_20000: '¥10,000~¥20,000',
  RANGE_OVER: '¥20,000~',
  UNKNOWN: '要確認',
}

export const AREA_OPTIONS = Object.entries(AREA_LABELS).map(([value, label]) => ({ value, label }))
export const GENRE_OPTIONS = Object.entries(GENRE_LABELS).map(([value, label]) => ({ value, label }))
export const PRICE_RANGE_OPTIONS = Object.entries(PRICE_RANGE_LABELS).map(([value, label]) => ({
  value,
  label,
}))

/** Returns the Japanese label for an area enum key, falling back to the raw value */
export function areaLabel(key: string): string {
  return AREA_LABELS[key] ?? key
}

/** Returns the Japanese label for a genre enum key, falling back to the raw value */
export function genreLabel(key: string): string {
  return GENRE_LABELS[key] ?? key
}

/** Returns the Japanese label for a priceRange enum key, falling back to the raw value */
export function priceRangeLabel(key: string): string {
  return PRICE_RANGE_LABELS[key] ?? key
}
