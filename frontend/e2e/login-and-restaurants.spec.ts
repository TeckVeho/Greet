import { expect, test } from '@playwright/test'

const nowIso = () => new Date().toISOString()

function seedLoggedInSession(page: import('@playwright/test').Page) {
  return page.addInitScript(() => {
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: 'user-1',
        email: 'admin@example.com',
        name: '管理者ユーザー',
        role: 'admin',
        companyId: 'company-1',
        createdAt: new Date().toISOString(),
      }),
    )
    localStorage.setItem('token', 'e2e-valid-token')
  })
}

test.describe('E2E #1-#6: login, list/search, filter, create, detail/review', () => {
  test('1) ログインフロー（正常）', async ({ page }) => {
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            token: 'e2e-valid-token',
            user: {
              id: 'user-1',
              email: 'admin@example.com',
              name: '管理者ユーザー',
              role: 'admin',
              companyId: 'company-1',
              createdAt: new Date().toISOString(),
            },
          },
        }),
      })
    })

    await page.route('**/api/restaurants**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 'r-1',
              name: '銀座 鮨 さいとう',
              area: 'GINZA',
              genres: ['SUSHI'],
              hasPrivateRoom: false,
              smokingAllowed: false,
              priceRange: 'RANGE_20000',
              address: '東京都中央区',
              phone: '03-0000-0000',
              url: 'https://example.com',
              icon: '🍣',
              reviewCount: 0,
              reviews: [],
              averageRating: null,
              createdBy: { id: 'user-1', name: '管理者ユーザー', icon: '👤' },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          meta: { total: 1, page: 1, limit: 10, total_pages: 1 },
        }),
      })
    })

    await page.goto('/login')
    await page.getByLabel('メールアドレス').fill('admin@example.com')
    await page.getByLabel('パスワード').fill('password123')
    await page.getByRole('button', { name: 'ログイン' }).click()

    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByText('飲食店データベース')).toBeVisible()
    await expect(page.getByText('銀座 鮨 さいとう')).toBeVisible()
  })

  test('2) ログインフロー（エラー表示）', async ({ page }) => {
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'メールアドレスまたはパスワードが正しくありません',
          },
        }),
      })
    })

    await page.goto('/login')
    await page.getByLabel('メールアドレス').fill('admin@example.com')
    await page.getByLabel('パスワード').fill('wrong-password')
    await page.getByRole('button', { name: 'ログイン' }).click()

    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByText('ログインに失敗しました。もう一度お試しください。')).toBeVisible()
  })

  test('3) 飲食店一覧表示・検索', async ({ page }) => {
    await seedLoggedInSession(page)

    await page.route('**/api/restaurants**', async route => {
      const url = new URL(route.request().url())
      const search = (url.searchParams.get('search') ?? '').trim()

      const allItems = [
        {
          id: 'r-1',
          name: '銀座 鮨 さいとう',
          area: 'GINZA',
          genres: ['SUSHI'],
          hasPrivateRoom: false,
          smokingAllowed: false,
          priceRange: 'RANGE_20000',
          address: '東京都中央区',
          phone: '03-0000-0000',
          url: 'https://example.com',
          icon: '🍣',
          reviewCount: 0,
          reviews: [],
          averageRating: null,
          createdBy: { id: 'user-1', name: '管理者ユーザー', icon: '👤' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'r-2',
          name: '赤坂 ビストロ',
          area: 'AKASAKA',
          genres: ['FRENCH'],
          hasPrivateRoom: true,
          smokingAllowed: false,
          priceRange: 'RANGE_10000',
          address: '東京都港区',
          phone: '03-1111-1111',
          url: 'https://example.org',
          icon: '🍷',
          reviewCount: 0,
          reviews: [],
          averageRating: null,
          createdBy: { id: 'user-1', name: '管理者ユーザー', icon: '👤' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      const items = search.length
        ? allItems.filter(item => item.name.includes(search))
        : allItems

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: items,
          meta: { total: items.length, page: 1, limit: 10, total_pages: 1 },
        }),
      })
    })

    await page.goto('/')

    await expect(page.getByText('銀座 鮨 さいとう')).toBeVisible()
    await expect(page.getByText('赤坂 ビストロ')).toBeVisible()

    await page.getByPlaceholder('店名、エリア、ジャンルで検索...').fill('銀座')

    await expect(page.getByText('銀座 鮨 さいとう')).toBeVisible()
    await expect(page.getByText('赤坂 ビストロ')).toHaveCount(0)
  })

  test('4) フィルター適用・解除', async ({ page }) => {
    await seedLoggedInSession(page)

    await page.route('**/api/restaurants**', async route => {
      const url = new URL(route.request().url())
      const areas = url.searchParams.getAll('areas')
      const genres = url.searchParams.getAll('genres')

      const allItems = [
        {
          id: 'r-1',
          name: '本店 寿司あおい',
          area: 'GINZA',
          genres: ['SUSHI'],
          hasPrivateRoom: true,
          smokingAllowed: false,
          priceRange: 'RANGE_20000',
          address: '東京都中央区',
          phone: '03-0000-0001',
          url: 'https://example.com/ginza',
          icon: '🍣',
          reviewCount: 0,
          reviews: [],
          averageRating: null,
          createdBy: { id: 'user-1', name: '管理者ユーザー', icon: '👤' },
          createdAt: nowIso(),
          updatedAt: nowIso(),
        },
        {
          id: 'r-2',
          name: '赤坂 グリル峰',
          area: 'AKASAKA',
          genres: ['FRENCH'],
          hasPrivateRoom: false,
          smokingAllowed: false,
          priceRange: 'RANGE_10000',
          address: '東京都港区',
          phone: '03-0000-0002',
          url: 'https://example.com/akasaka',
          icon: '🍷',
          reviewCount: 0,
          reviews: [],
          averageRating: null,
          createdBy: { id: 'user-1', name: '管理者ユーザー', icon: '👤' },
          createdAt: nowIso(),
          updatedAt: nowIso(),
        },
        {
          id: 'r-3',
          name: '銀座 炉端いぶし',
          area: 'GINZA',
          genres: ['WASHOKU'],
          hasPrivateRoom: false,
          smokingAllowed: false,
          priceRange: 'RANGE_10000',
          address: '東京都中央区',
          phone: '03-0000-0003',
          url: 'https://example.com/robata',
          icon: '🍽️',
          reviewCount: 0,
          reviews: [],
          averageRating: null,
          createdBy: { id: 'user-1', name: '管理者ユーザー', icon: '👤' },
          createdAt: nowIso(),
          updatedAt: nowIso(),
        },
      ]

      const items = allItems.filter(item => {
        const areaMatch = areas.length === 0 || areas.includes(item.area)
        const genreMatch = genres.length === 0 || genres.some(g => item.genres.includes(g))
        return areaMatch && genreMatch
      })

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: items,
          meta: { total: items.length, page: 1, limit: 10, total_pages: 1 },
        }),
      })
    })

    await page.goto('/')

    await expect(page.getByText('本店 寿司あおい')).toBeVisible()
    await expect(page.getByText('赤坂 グリル峰')).toBeVisible()
    await expect(page.getByText('銀座 炉端いぶし')).toBeVisible()

    await page.getByRole('button', { name: 'フィルター' }).click()

    const filterDialog = page.getByRole('dialog', { name: 'フィルター' })
    await filterDialog.getByRole('button', { name: '銀座' }).click()
    await filterDialog.getByRole('button', { name: '寿司' }).click()
    await filterDialog.getByRole('button', { name: '適用' }).click()

    await expect(page.getByText('本店 寿司あおい')).toBeVisible()
    await expect(page.getByText('赤坂 グリル峰')).toHaveCount(0)
    await expect(page.getByText('銀座 炉端いぶし')).toHaveCount(0)

    await page.getByRole('button', { name: 'フィルター' }).click()
    await filterDialog.getByRole('button', { name: 'リセット' }).click()
    await filterDialog.getByRole('button', { name: '適用' }).click()

    await expect(page.getByText('本店 寿司あおい')).toBeVisible()
    await expect(page.getByText('赤坂 グリル峰')).toBeVisible()
    await expect(page.getByText('銀座 炉端いぶし')).toBeVisible()
  })

  test('5) 飲食店登録フロー', async ({ page }) => {
    await seedLoggedInSession(page)

    const restaurants = [
      {
        id: 'r-1',
        name: '既存レストラン',
        area: 'GINZA',
        genres: ['SUSHI'],
        hasPrivateRoom: false,
        smokingAllowed: false,
        priceRange: 'RANGE_20000',
        address: '東京都中央区',
        phone: '03-0000-0000',
        url: 'https://example.com/base',
        icon: '🍣',
        reviewCount: 0,
        reviews: [],
        averageRating: null,
        createdBy: { id: 'user-1', name: '管理者ユーザー', icon: '👤' },
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
    ]

    await page.route('**/api/restaurants**', async route => {
      if (route.request().method() === 'POST') {
        const payload = route.request().postDataJSON() as Record<string, unknown>
        const created = {
          id: `r-${restaurants.length + 1}`,
          name: String(payload.name),
          area: String(payload.area ?? 'GINZA'),
          genres: Array.isArray(payload.genres) ? payload.genres : ['SUSHI'],
          hasPrivateRoom: Boolean(payload.hasPrivateRoom),
          smokingAllowed: Boolean(payload.smokingAllowed),
          priceRange: String(payload.priceRange ?? 'RANGE_20000'),
          address: String(payload.address ?? ''),
          phone: String(payload.phone ?? ''),
          url: String(payload.url ?? ''),
          icon: String(payload.icon ?? '🍽️'),
          reviewCount: 0,
          reviews: [],
          averageRating: null,
          createdBy: { id: 'user-1', name: '管理者ユーザー', icon: '👤' },
          createdAt: nowIso(),
          updatedAt: nowIso(),
        }
        restaurants.unshift(created)

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: created }),
        })
        return
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: restaurants,
          meta: { total: restaurants.length, page: 1, limit: 10, total_pages: 1 },
        }),
      })
    })

    await page.goto('/')

    await page.getByRole('button', { name: '新規登録' }).first().click()
    await expect(page.getByRole('dialog', { name: '新規飲食店登録' })).toBeVisible()

    await page.getByPlaceholder('例: 銀座 鮨 さいとう').fill('E2E 登録レストラン')
    await page.getByPlaceholder('https://maps.app.goo.gl/...').fill('https://maps.example.com/e2e')
    await page.getByRole('button', { name: '登録' }).click()

    await expect(page.getByRole('dialog', { name: '新規飲食店登録' })).toHaveCount(0)
    await expect(page.getByText('E2E 登録レストラン')).toBeVisible()
  })

  test('6) 飲食店詳細表示・レビュー投稿', async ({ page }) => {
    await seedLoggedInSession(page)

    const restaurant = {
      id: 'r-detail-1',
      name: 'レビュー対象店',
      area: 'GINZA',
      genres: ['SUSHI'],
      hasPrivateRoom: true,
      smokingAllowed: false,
      priceRange: 'RANGE_20000',
      address: '東京都中央区銀座1-1-1',
      phone: '03-2222-2222',
      url: 'https://example.com/detail',
      icon: '🍣',
      reviewCount: 0,
      reviews: [] as Array<{
        id: string
        occasion: string
        result: string
        rating: number
        createdAt: string
        author: { id: string; name: string; icon?: string }
      }>,
      averageRating: null,
      createdBy: { id: 'user-1', name: '管理者ユーザー', icon: '👤' },
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }

    await page.route('**/api/restaurants**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [restaurant],
          meta: { total: 1, page: 1, limit: 10, total_pages: 1 },
        }),
      })
    })

    await page.route('**/api/restaurants/r-detail-1', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            ...restaurant,
            reviewCount: restaurant.reviews.length,
            reviews: restaurant.reviews,
          },
        }),
      })
    })

    await page.route('**/api/restaurants/r-detail-1/reviews', async route => {
      const payload = route.request().postDataJSON() as {
        occasion: string
        result: string
        rating?: number
      }

      const review = {
        id: `review-${restaurant.reviews.length + 1}`,
        occasion: payload.occasion,
        result: payload.result,
        rating: payload.rating ?? 5,
        author: {
          id: 'user-1',
          name: '管理者ユーザー',
          icon: '👤',
        },
        createdAt: nowIso(),
      }

      restaurant.reviews.unshift(review)

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: review.id,
            restaurantId: restaurant.id,
            occasion: review.occasion,
            result: review.result,
            rating: review.rating,
            author: review.author,
            createdAt: review.createdAt,
          },
        }),
      })
    })

    await page.goto('/')
    await page.getByRole('link', { name: /レビュー対象店/ }).click()

    await expect(page).toHaveURL(/\/restaurants\/r-detail-1$/)
    await expect(page.getByRole('heading', { name: 'レビュー対象店' })).toBeVisible()
    await expect(page.getByText('東京都中央区銀座1-1-1')).toBeVisible()

    await page.getByRole('button', { name: 'レビューを書く' }).click()
    const reviewDialog = page.getByRole('dialog', { name: 'レビューを投稿' })

    await reviewDialog
      .getByPlaceholder('例: 重要な取引先との接待、社内の役員会食など')
      .fill('役員との会食')
    await reviewDialog
      .getByPlaceholder(
        '例: 料理の質が高く、個室でゆっくり商談できた。先方も満足していただけた様子。',
      )
      .fill('個室で落ち着いて会話でき、先方の評価も高かった。')
    await reviewDialog.locator('button[title="4つ星"]').click()
    await reviewDialog.getByRole('button', { name: '投稿する' }).click()

    await expect(page.getByText('利用シーン：')).toBeVisible()
    await expect(page.getByText('役員との会食')).toBeVisible()
    await expect(page.getByText('結果：')).toBeVisible()
    await expect(page.getByText('個室で落ち着いて会話でき、先方の評価も高かった。')).toBeVisible()
  })
})
