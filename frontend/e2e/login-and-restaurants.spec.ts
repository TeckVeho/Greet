import { expect, test } from '@playwright/test'

const nowIso = () => new Date().toISOString()

function seedLoggedInSession(
  page: import('@playwright/test').Page,
  role: 'admin' | 'user' = 'admin',
) {
  return page.addInitScript(({ role }) => {
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: 'user-1',
        email: role === 'admin' ? 'admin@example.com' : 'user@example.com',
        name: role === 'admin' ? '管理者ユーザー' : '一般ユーザー',
        role,
        companyId: 'company-1',
        createdAt: new Date().toISOString(),
      }),
    )
    localStorage.setItem('token', 'e2e-valid-token')
  }, { role })
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
          meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
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
          meta: { total: items.length, page: 1, limit: 10, totalPages: 1 },
        }),
      })
    })

    await page.goto('/')

    await expect(page.getByText('銀座 鮨 さいとう')).toBeVisible()
    await expect(page.getByText('赤坂 ビストロ')).toBeVisible()

    await page.getByPlaceholder('店名、エリア、ジャンル、住所で検索...').fill('銀座')

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
          meta: { total: items.length, page: 1, limit: 10, totalPages: 1 },
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
          meta: { total: restaurants.length, page: 1, limit: 10, totalPages: 1 },
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
          meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
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

test.describe('E2E #7-#11: favorites, category pages, admin access, global search', () => {
  test('7) お気に入り追加・削除・一覧確認', async ({ page }) => {
    await seedLoggedInSession(page)

    const restaurant = {
      id: 'r-fav-1',
      name: 'お気に入り確認店',
      area: 'GINZA',
      genres: ['SUSHI'],
      hasPrivateRoom: true,
      smokingAllowed: false,
      priceRange: 'RANGE_10000',
      address: '東京都中央区1-2-3',
      phone: '03-9999-0000',
      url: 'https://example.com/favorite',
      icon: '🍣',
      reviewCount: 0,
      reviews: [],
      averageRating: null,
      createdBy: { id: 'user-1', name: '管理者ユーザー', icon: '👤' },
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }
    let favoriteIds: string[] = []

    await page.route('**/api/restaurants**', async route => {
      const url = route.request().url()

      if (url.endsWith('/api/restaurants/r-fav-1')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: restaurant,
          }),
        })
        return
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [restaurant],
          meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
        }),
      })
    })

    await page.route('**/api/favorites', async route => {
      if (route.request().method() === 'POST') {
        favoriteIds = ['r-fav-1']
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'fav-1',
              userId: 'user-1',
              restaurantId: 'r-fav-1',
              createdAt: nowIso(),
            },
          }),
        })
        return
      }

      const items = favoriteIds.includes('r-fav-1')
        ? [{ id: 'fav-1', restaurant, createdAt: nowIso() }]
        : []

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: items }),
      })
    })

    await page.route('**/api/favorites/r-fav-1', async route => {
      favoriteIds = []
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { message: 'お気に入りを解除しました' },
        }),
      })
    })

    await page.goto('/')
    await page.getByRole('link', { name: /お気に入り確認店/ }).click()

    const favoriteButton = page.getByTitle('お気に入りに追加')
    await favoriteButton.click()
    await expect(page.getByTitle('お気に入りから削除')).toBeVisible()

    await page.goto('/favorites')
    await expect(page.getByRole('heading', { name: 'お気に入り', level: 1 })).toBeVisible()
    await expect(page.getByText('お気に入り確認店')).toBeVisible()

    await page.goto('/restaurants/r-fav-1')
    await page.getByTitle('お気に入りから削除').click()
    await expect(page.getByTitle('お気に入りに追加')).toBeVisible()

    await page.goto('/favorites')
    await expect(page.getByText('お気に入りがありません')).toBeVisible()
  })

  test('8) エリア別・ジャンル別ページ', async ({ page }) => {
    await seedLoggedInSession(page)

    const restaurants = [
      {
        id: 'r-area-1',
        name: '銀座テスト寿司',
        area: 'GINZA',
        genres: ['SUSHI'],
        hasPrivateRoom: true,
        smokingAllowed: false,
        priceRange: 'RANGE_20000',
        address: '東京都中央区',
        phone: '03-1111-0001',
        url: 'https://example.com/ginza-sushi',
        icon: '🍣',
        reviewCount: 2,
        reviews: [],
        averageRating: 4.5,
        createdBy: { id: 'user-1', name: '管理者ユーザー', icon: '👤' },
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
      {
        id: 'r-area-2',
        name: '赤坂イタリアン',
        area: 'AKASAKA',
        genres: ['ITALIAN'],
        hasPrivateRoom: false,
        smokingAllowed: false,
        priceRange: 'RANGE_10000',
        address: '東京都港区',
        phone: '03-1111-0002',
        url: 'https://example.com/akasaka-italian',
        icon: '🍝',
        reviewCount: 1,
        reviews: [],
        averageRating: 4,
        createdBy: { id: 'user-1', name: '管理者ユーザー', icon: '👤' },
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
    ]

    await page.route('**/api/restaurants**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: restaurants,
          meta: { total: restaurants.length, page: 1, limit: 10, totalPages: 1 },
        }),
      })
    })

    await page.route('**/api/favorites', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      })
    })

    await page.goto('/area')
    await expect(page.getByRole('heading', { name: 'エリア別' })).toBeVisible()
    await page.getByRole('button', { name: /銀座/ }).click()
    await expect(page.getByText('銀座テスト寿司')).toBeVisible()
    await expect(page.getByText('赤坂イタリアン')).toHaveCount(0)

    await page.goto('/genre')
    await expect(page.getByRole('heading', { name: 'ジャンル別' })).toBeVisible()
    await page.getByRole('button', { name: /イタリアン/ }).click()
    await expect(page.getByText('赤坂イタリアン')).toBeVisible()
    await expect(page.getByText('銀座テスト寿司')).toHaveCount(0)
  })

  test('9) 管理者: ユーザー管理ページアクセス', async ({ page }) => {
    await seedLoggedInSession(page, 'admin')

    await page.route('**/api/restaurants**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [],
          meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
        }),
      })
    })

    await page.route('**/api/favorites', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      })
    })

    await page.route('**/api/users**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 'user-1',
              name: '管理者ユーザー',
              email: 'admin@example.com',
              role: 'admin',
              companyId: 'company-1',
              company: { id: 'company-1', name: '管理会社' },
              createdAt: nowIso(),
              lastLoginAt: nowIso(),
            },
          ],
          meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
        }),
      })
    })

    await page.route('**/api/companies', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 'company-1',
              name: '管理会社',
              code: 'ADMIN',
              icon: '🏢',
              userCount: 1,
              createdAt: nowIso(),
            },
          ],
        }),
      })
    })

    await page.goto('/')
    await expect(page.getByRole('link', { name: 'ユーザー管理' })).toBeVisible()
    await page.getByRole('link', { name: 'ユーザー管理' }).click()

    await expect(page).toHaveURL(/\/admin\/users$/)
    await expect(page.getByRole('heading', { name: 'ユーザー管理' })).toBeVisible()
    await expect(page.getByRole('cell', { name: '管理者ユーザー' })).toBeVisible()
  })

  test('10) 一般ユーザー: 管理者ページへのアクセス制御', async ({ page }) => {
    await seedLoggedInSession(page, 'user')

    await page.route('**/api/restaurants**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 'r-1',
              name: '一般ユーザー閲覧店',
              area: 'GINZA',
              genres: ['SUSHI'],
              hasPrivateRoom: false,
              smokingAllowed: false,
              priceRange: 'RANGE_10000',
              address: '東京都中央区',
              phone: '03-0000-1111',
              url: 'https://example.com/visible',
              icon: '🍣',
              reviewCount: 0,
              reviews: [],
              averageRating: null,
              createdBy: { id: 'user-1', name: '一般ユーザー', icon: '👤' },
              createdAt: nowIso(),
              updatedAt: nowIso(),
            },
          ],
          meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
        }),
      })
    })

    await page.route('**/api/favorites', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      })
    })

    await page.route('**/api/users**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [],
          meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
        }),
      })
    })

    await page.route('**/api/companies', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      })
    })

    await page.goto('/')
    await expect(page.getByRole('link', { name: 'ユーザー管理' })).toHaveCount(0)

    await page.goto('/admin/users')
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByText('飲食店データベース')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'ユーザー管理' })).toHaveCount(0)
  })

  test('11) グローバル検索（Cmd+K）', async ({ page }) => {
    await seedLoggedInSession(page)

    const restaurants = [
      {
        id: 'r-search-1',
        name: 'グローバル検索対象店',
        area: 'GINZA',
        genres: ['SUSHI'],
        hasPrivateRoom: true,
        smokingAllowed: false,
        priceRange: 'RANGE_10000',
        address: '東京都中央区5-5-5',
        phone: '03-5555-5555',
        url: 'https://example.com/search-target',
        icon: '🍣',
        reviewCount: 0,
        reviews: [],
        averageRating: null,
        createdBy: { id: 'user-1', name: '管理者ユーザー', icon: '👤' },
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
      {
        id: 'r-search-2',
        name: '別の店舗',
        area: 'AKASAKA',
        genres: ['FRENCH'],
        hasPrivateRoom: false,
        smokingAllowed: false,
        priceRange: 'RANGE_20000',
        address: '東京都港区6-6-6',
        phone: '03-6666-6666',
        url: 'https://example.com/search-other',
        icon: '🍷',
        reviewCount: 0,
        reviews: [],
        averageRating: null,
        createdBy: { id: 'user-1', name: '管理者ユーザー', icon: '👤' },
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
    ]

    await page.route('**/api/restaurants**', async route => {
      const url = route.request().url()

      if (url.endsWith('/api/restaurants/r-search-1')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: restaurants[0],
          }),
        })
        return
      }

      const parsed = new URL(url)
      const search = (parsed.searchParams.get('search') ?? '').trim()
      const items = search.length
        ? restaurants.filter(item => item.name.includes(search))
        : restaurants

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: items,
          meta: { total: items.length, page: 1, limit: 10, totalPages: 1 },
        }),
      })
    })

    await page.route('**/api/favorites', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      })
    })

    await page.goto('/')
    await page.keyboard.press('Control+K')

    const searchDialog = page.getByRole('dialog')
    await expect(searchDialog).toBeVisible()
    await expect(searchDialog.getByPlaceholder('店名、エリア、ジャンル、住所で検索...')).toBeVisible()

    await searchDialog.getByPlaceholder('店名、エリア、ジャンル、住所で検索...').fill('グローバル')
    await expect(searchDialog.getByText('グローバル検索対象店')).toBeVisible()
    await expect(searchDialog.getByText('別の店舗')).toHaveCount(0)

    await searchDialog.getByRole('button', { name: /グローバル検索対象店/ }).click()
    await expect(page).toHaveURL(/\/restaurants\/r-search-1$/)
    await expect(page.getByRole('heading', { name: 'グローバル検索対象店' })).toBeVisible()
  })
})
