import { Company } from "./types"

export const mockCompanies: Company[] = [
  {
    id: "c1",
    name: "株式会社サンプル商事",
    code: "SAMPLE01",
    icon: "🏢",
    createdAt: new Date("2020-01-01"),
  },
  {
    id: "c2",
    name: "テクノロジー株式会社",
    code: "TECH02",
    icon: "💻",
    createdAt: new Date("2021-03-15"),
  },
  {
    id: "c3",
    name: "グローバル商社",
    code: "GLOBAL03",
    icon: "🌏",
    createdAt: new Date("2019-06-01"),
  },
]

// 会社IDから会社情報を取得するヘルパー関数
export function getCompanyById(companyId: string): Company | undefined {
  return mockCompanies.find((c) => c.id === companyId)
}
