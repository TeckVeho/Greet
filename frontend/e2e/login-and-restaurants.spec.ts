import { expect, test } from '@playwright/test'

test.describe('E2E #1-#3: login and restaurant list/search', () => {
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
    await page.addInitScript(() => {
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
})
