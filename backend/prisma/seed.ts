import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { Area, Genre, PriceRange, PrismaClient, Role } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import 'dotenv/config'

const dbUrl = new URL(process.env.DATABASE_URL!)
const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port, 10) || 3306,
  user: decodeURIComponent(dbUrl.username),
  password: decodeURIComponent(dbUrl.password),
  database: dbUrl.pathname.slice(1),
  connectionLimit: 5,
  idleTimeout: 60,
  acquireTimeout: 10_000,
  connectTimeout: 10_000,
})
const prisma = new PrismaClient({ adapter })

const SALT_ROUNDS = 12

const ADDITIONAL_COMPANY_NAMES = [
  'エブリー二十四',
  '株式会社ダイエックス九州',
  '株式会社ダイエックス中四国',
  '株式会社ダイエックス関西',
  '株式会社ダイエックス中部',
  '株式会社ダイエックス東京',
  '大宝レックス株式会社',
  'ダイセー物流株式会社',
  'ダイセー物流',
  'ダイセー整備株式会社',
  'daisei every24(thailand)',
  'pkt every24',
  'ダイセー倉庫運輸',
  'ダイセーエコロジー株式会社',
  'ダイセーロジスティクス',
  'ヒタチ',
  'イズミ物流(株)',
  'ダイセーセントレックス',
  'メジャーサービスジャパン',
  'グローバルエアカーゴ',
  'ダイセー阿波急行',
  'ダイセーsdc',
  'ダイセー北海道',
  'ダイセー日研',
  '日新トランスポート',
  'ダイセーフロンティア株式会社',
  '美和流通株式会社',
  'pt．daisei log indonesia',
  'ダイセーロジスティクス研究所',
  'ダイセーホールディングス株式会社',
  'ビジュアルテクノロジー株式会社',
  'Ｄａｉｓｅｉ　ＶＥＨＯ　Ｗｏｒｋｓ　Ｃｏ，．Ｌｔｄ',
  'dx研究所',
  'ジェットエイト株式会社',
  'フーズアンドフーズ株式会社',
  '株式会社箱根湯本ホテル',
  '箱根暁庵株式会社',
  '箱根ベーカリー株式会社',
  'さざなみ南海リゾート株式会社',
  '橋本毛織株式会社',
  'パシフィックオーシャン株式会社',
  '大盛丸',
  '大宝レックス',
  '天津大盛運輸有限公司',
  'marco polo cargo corporation',
  'novashield',
]

async function main() {
  const passwordHash = await bcrypt.hash('password123', SALT_ROUNDS)

  const companyGreet = await prisma.company.upsert({
    where: { code: 'GREET' },
    update: {},
    create: {
      name: '株式会社グリート',
      code: 'GREET',
      icon: '🏢',
    },
  })
  const companyYamada = await prisma.company.upsert({
    where: { code: 'YAMADA' },
    update: {},
    create: {
      name: '山田商事',
      code: 'YAMADA',
      icon: '🏬',
    },
  })
  const companySuzuki = await prisma.company.upsert({
    where: { code: 'SUZUKI' },
    update: {},
    create: {
      name: '鈴木物産',
      code: 'SUZUKI',
      icon: '🏭',
    },
  })

  await Promise.all(
    ADDITIONAL_COMPANY_NAMES.map((name, index) =>
      prisma.company.upsert({
        where: { code: `DAISEI_${String(index + 1).padStart(3, '0')}` },
        update: { name },
        create: {
          name,
          code: `DAISEI_${String(index + 1).padStart(3, '0')}`,
          icon: '🏢',
        },
      }),
    ),
  )

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash,
      name: '管理者 太郎',
      role: Role.admin,
      department: '総務部',
      companyId: companyGreet.id,
    },
  })

  const user1 = await prisma.user.upsert({
    where: { email: 'user1@example.com' },
    update: {},
    create: {
      email: 'user1@example.com',
      passwordHash,
      name: '山田 花子',
      role: Role.user,
      department: '営業部',
      companyId: companyYamada.id,
    },
  })
  const user2 = await prisma.user.upsert({
    where: { email: 'user2@example.com' },
    update: {},
    create: {
      email: 'user2@example.com',
      passwordHash,
      name: '鈴木 一郎',
      role: Role.user,
      department: '営業部',
      companyId: companySuzuki.id,
    },
  })
  const user3 = await prisma.user.upsert({
    where: { email: 'user3@example.com' },
    update: {},
    create: {
      email: 'user3@example.com',
      passwordHash,
      name: '佐藤 次郎',
      role: Role.user,
      department: 'マーケティング部',
      companyId: companyGreet.id,
    },
  })
  const user4 = await prisma.user.upsert({
    where: { email: 'user4@example.com' },
    update: {},
    create: {
      email: 'user4@example.com',
      passwordHash,
      name: '田中 三郎',
      role: Role.user,
      department: '人事部',
      companyId: companyYamada.id,
    },
  })
  const user5 = await prisma.user.upsert({
    where: { email: 'user5@example.com' },
    update: {},
    create: {
      email: 'user5@example.com',
      passwordHash,
      name: '高橋 四郎',
      role: Role.user,
      department: '開発部',
      companyId: companySuzuki.id,
    },
  })
  const user6 = await prisma.user.upsert({
    where: { email: 'user6@example.com' },
    update: {},
    create: {
      email: 'user6@example.com',
      passwordHash,
      name: '伊藤 五郎',
      role: Role.user,
      department: '経理部',
      companyId: companyGreet.id,
    },
  })
  const seedUsers = [
    {
      email: 'user10@example.com',
      name: '佐藤 健太',
      dept: 'IT部',
      icon: '💻',
      comp: companyGreet.id,
    },
    {
      email: 'user11@example.com',
      name: '渡辺 陽子',
      dept: '広報部',
      icon: '📣',
      comp: companyYamada.id,
    },
    {
      email: 'user12@example.com',
      name: '小林 直樹',
      dept: '法務部',
      icon: '⚖️',
      comp: companySuzuki.id,
    },
    {
      email: 'user13@example.com',
      name: '加藤 沙織',
      dept: '企画部',
      icon: '📝',
      comp: companyGreet.id,
    },
    {
      email: 'user14@example.com',
      name: '吉田 拓也',
      dept: '物流部',
      icon: '🚚',
      comp: companyYamada.id,
    },
    {
      email: 'user15@example.com',
      name: '佐々木 舞',
      dept: 'カスタマーサポート',
      icon: '🎧',
      comp: companySuzuki.id,
    },
    {
      email: 'user16@example.com',
      name: '山口 俊一',
      dept: '戦略室',
      icon: '♟️',
      comp: companyGreet.id,
    },
    {
      email: 'user17@example.com',
      name: '松本 恵',
      dept: 'デザイン部',
      icon: '🎨',
      comp: companyYamada.id,
    },
    {
      email: 'user18@example.com',
      name: '井上 隆',
      dept: '購買部',
      icon: '🛒',
      comp: companySuzuki.id,
    },
    {
      email: 'user19@example.com',
      name: '木村 結衣',
      dept: '秘書室',
      icon: '📅',
      comp: companyGreet.id,
    },
    {
      email: 'user20@example.com',
      name: '林 大輔',
      dept: '情報セキュリティ',
      icon: '🛡️',
      comp: companyYamada.id,
    },
    {
      email: 'user21@example.com',
      name: '清水 亮',
      dept: '研究開発',
      icon: '🧪',
      comp: companySuzuki.id,
    },
    {
      email: 'user22@example.com',
      name: '山崎 奈々',
      dept: '海外事業部',
      icon: '✈️',
      comp: companyGreet.id,
    },
    {
      email: 'user23@example.com',
      name: '池田 剛',
      dept: '施設管理',
      icon: '🏗️',
      comp: companyYamada.id,
    },
    {
      email: 'user24@example.com',
      name: '橋本 芽衣',
      dept: '福利厚生',
      icon: '🍎',
      comp: companySuzuki.id,
    },
    {
      email: 'user25@example.com',
      name: '阿部 健一',
      dept: '品質管理',
      icon: '🔍',
      comp: companyGreet.id,
    },
    {
      email: 'user26@example.com',
      name: '森 智子',
      dept: 'トレーニング',
      icon: '📚',
      comp: companyYamada.id,
    },
    {
      email: 'user27@example.com',
      name: '中島 裕太',
      dept: 'インフラ部',
      icon: '☁️',
      comp: companySuzuki.id,
    },
    {
      email: 'user28@example.com',
      name: '前田 瑞希',
      dept: 'イベント企画',
      icon: '🎈',
      comp: companyGreet.id,
    },
    {
      email: 'user29@example.com',
      name: '岡田 慎吾',
      dept: '広告宣伝',
      icon: '📺',
      comp: companyYamada.id,
    },
  ]

  for (const u of seedUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        passwordHash,
        name: u.name,
        role: Role.user,
        department: u.dept,
        companyId: u.comp,
      },
    })
  }

  const restaurantGinza = await prisma.restaurant.upsert({
    where: { id: 'seed-rest-ginza' },
    update: {},
    create: {
      id: 'seed-rest-ginza',
      name: '銀座 しのはら',
      area: Area.GINZA,
      hasPrivateRoom: true,
      priceRange: PriceRange.RANGE_OVER,
      address: '東京都中央区銀座6-3-12',
      phone: '03-1234-5678',
      url: 'https://example.com/ginza',
      smokingAllowed: false,
      icon: '🍱',
      createdById: adminUser.id,
      companyId: companyGreet.id,
    },
  })
  await prisma.restaurantGenre.createMany({
    data: [
      { restaurantId: restaurantGinza.id, genre: Genre.WASHOKU },
      { restaurantId: restaurantGinza.id, genre: Genre.KAPPO },
    ],
    skipDuplicates: true,
  })
  const restaurantAkasaka = await prisma.restaurant.upsert({
    where: { id: 'seed-rest-akasaka' },
    update: {},
    create: {
      id: 'seed-rest-akasaka',
      name: '赤坂 フレンチ亭',
      area: Area.AKASAKA,
      hasPrivateRoom: true,
      priceRange: PriceRange.RANGE_20000,
      address: '東京都港区赤坂2-14-1',
      smokingAllowed: false,
      icon: '🍷',
      createdById: user1.id,
      companyId: companyYamada.id,
    },
  })
  await prisma.restaurantGenre.createMany({
    data: [{ restaurantId: restaurantAkasaka.id, genre: Genre.FRENCH }],
    skipDuplicates: true,
  })
  const restaurantRoppongi = await prisma.restaurant.upsert({
    where: { id: 'seed-rest-roppongi' },
    update: {},
    create: {
      id: 'seed-rest-roppongi',
      name: '六本木 焼肉 黒毛和牛',
      area: Area.ROPPONGI,
      hasPrivateRoom: true,
      priceRange: PriceRange.RANGE_10000,
      icon: '🥩',
      createdById: user2.id,
      companyId: companySuzuki.id,
    },
  })
  await prisma.restaurantGenre.createMany({
    data: [{ restaurantId: restaurantRoppongi.id, genre: Genre.YAKINIKU }],
    skipDuplicates: true,
  })
  const restaurantShimbashi = await prisma.restaurant.upsert({
    where: { id: 'seed-rest-shimbashi' },
    update: {},
    create: {
      id: 'seed-rest-shimbashi',
      name: '新橋 寿司 海鮮',
      area: Area.SHIMBASHI,
      hasPrivateRoom: false,
      priceRange: PriceRange.RANGE_20000,
      icon: '🍣',
      createdById: user3.id,
      companyId: companyGreet.id,
    },
  })
  await prisma.restaurantGenre.createMany({
    data: [{ restaurantId: restaurantShimbashi.id, genre: Genre.SUSHI }],
    skipDuplicates: true,
  })
  const restaurantEbisu = await prisma.restaurant.upsert({
    where: { id: 'seed-rest-ebisu' },
    update: {},
    create: {
      id: 'seed-rest-ebisu',
      name: '恵比寿 イタリアン',
      area: Area.EBIISU,
      hasPrivateRoom: true,
      priceRange: PriceRange.RANGE_10000,
      icon: '🍝',
      createdById: user4.id,
      companyId: companyYamada.id,
    },
  })
  await prisma.restaurantGenre.createMany({
    data: [{ restaurantId: restaurantEbisu.id, genre: Genre.ITALIAN }],
    skipDuplicates: true,
  })

  await prisma.review.upsert({
    where: { id: 'seed-review-1' },
    update: {},
    create: {
      id: 'seed-review-1',
      restaurantId: restaurantGinza.id,
      authorId: user1.id,
      occasion: '部長クラス接待',
      result: '非常に喜んでいただけました。個室が静かで会話もしやすい。',
      rating: 5,
    },
  })
  await prisma.review.upsert({
    where: { id: 'seed-review-2' },
    update: {},
    create: {
      id: 'seed-review-2',
      restaurantId: restaurantGinza.id,
      authorId: user2.id,
      occasion: '取引先との打ち上げ',
      result: '料理のクオリティが高く、コースも満足いただけた。',
      rating: 4,
    },
  })
  await prisma.review.upsert({
    where: { id: 'seed-review-3' },
    update: {},
    create: {
      id: 'seed-review-3',
      restaurantId: restaurantGinza.id,
      authorId: adminUser.id,
      occasion: '役員接待',
      result: '落ち着いた空間で重要な商談がまとまった。',
      rating: 5,
    },
  })
  await prisma.review.upsert({
    where: { id: 'seed-review-4' },
    update: {},
    create: {
      id: 'seed-review-4',
      restaurantId: restaurantAkasaka.id,
      authorId: user3.id,
      occasion: '記念日ディナー',
      result: 'フレンチのコースが丁寧で、接待にも最適。',
      rating: 5,
    },
  })
  await prisma.review.upsert({
    where: { id: 'seed-review-5' },
    update: {},
    create: {
      id: 'seed-review-5',
      restaurantId: restaurantAkasaka.id,
      authorId: user4.id,
      occasion: '取締役接待',
      result: '個室でプライベートな雰囲気。ワインのペアリングも良かった。',
      rating: 4,
    },
  })
  await prisma.review.upsert({
    where: { id: 'seed-review-6' },
    update: {},
    create: {
      id: 'seed-review-6',
      restaurantId: restaurantRoppongi.id,
      authorId: user5.id,
      occasion: '若手社員の慰労',
      result: '焼肉の質が高く、ボリュームもあり満足。',
      rating: 4,
    },
  })
  await prisma.review.upsert({
    where: { id: 'seed-review-7' },
    update: {},
    create: {
      id: 'seed-review-7',
      restaurantId: restaurantRoppongi.id,
      authorId: user6.id,
      occasion: '営業接待',
      result: '個室でにぎやかに。コスパも良い。',
      rating: 5,
    },
  })
  await prisma.review.upsert({
    where: { id: 'seed-review-8' },
    update: {},
    create: {
      id: 'seed-review-8',
      restaurantId: restaurantShimbashi.id,
      authorId: adminUser.id,
      occasion: '経理部接待',
      result: '鮮度の良いネタで、お客様にも好評だった。',
      rating: 5,
    },
  })
  await prisma.review.upsert({
    where: { id: 'seed-review-9' },
    update: {},
    create: {
      id: 'seed-review-9',
      restaurantId: restaurantEbisu.id,
      authorId: user1.id,
      occasion: 'カジュアル接待',
      result: 'イタリアンで気軽に利用。パスタが美味しい。',
      rating: 4,
    },
  })

  console.log('Seed completed: 3 companies, 7 users, 5 restaurants, 9 reviews.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
