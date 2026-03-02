const areaValues = ['銀座', '赤坂', '六本木', '新橋', '麻布', '恵比寿', '表参道', 'その他'] as const

const genreValues = [
  '寿司',
  'フレンチ',
  'イタリアン',
  '和食',
  '中華',
  '鉄板焼き',
  '焼肉',
  '天ぷら',
  '割烹',
  'その他',
] as const

const priceRangeValues = [
  'range_5000',
  'range_10000',
  'range_20000',
  'range_over',
  '要確認',
] as const

const priceRangeDisplayValues = ['~5000', '5000~10000', '10000~20000', '20000~', '要確認'] as const

const priceRangeDisplayToEnum: Record<string, string> = {
  '~5000': 'range_5000',
  '5000~10000': 'range_10000',
  '10000~20000': 'range_20000',
  '20000~': 'range_over',
  要確認: '要確認',
}
const sortByValues = ['createdAt', 'name', 'priceRange', 'reviewCount', 'rating'] as const
const sortOrderValues = ['asc', 'desc'] as const
