import * as React from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import { FavoritesProvider, useFavorites } from '@/lib/favorites-context'
import { useAuth } from '@/lib/auth-context'
import { addFavorite, listFavorites, removeFavorite, type FavoriteItem } from '@/lib/api/favorites'
import type { User } from '@/lib/types'

jest.mock('@/lib/auth-context', () => ({
  useAuth: jest.fn(),
}))

jest.mock('@/lib/api/favorites', () => ({
  addFavorite: jest.fn(),
  listFavorites: jest.fn(),
  removeFavorite: jest.fn(),
}))

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockListFavorites = listFavorites as jest.MockedFunction<typeof listFavorites>
const mockAddFavorite = addFavorite as jest.MockedFunction<typeof addFavorite>
const mockRemoveFavorite = removeFavorite as jest.MockedFunction<typeof removeFavorite>

type AuthContextValue = ReturnType<typeof useAuth>

function createFavoriteItem(id: string, restaurantId: string): FavoriteItem {
  return {
    id,
    createdAt: '2026-03-12',
    restaurant: { id: restaurantId } as FavoriteItem['restaurant'],
  }
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <FavoritesProvider>{children}</FavoritesProvider>
      </QueryClientProvider>
    )
  }
}

describe('FavoritesContext', () => {
  const mockLogout: AuthContextValue['logout'] = jest.fn()
  const mockLogin: AuthContextValue['login'] = jest.fn(async () => true)
  const mockUser: User = {
    id: 'user-1',
    email: 'user@example.com',
    name: 'Test User',
    role: 'user',
    companyId: 'company-1',
    createdAt: new Date('2026-03-12'),
  }
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    mockUseAuth.mockReturnValue({
      user: mockUser,
      login: mockLogin,
      logout: mockLogout,
      isLoading: false,
    })
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('ログイン済みユーザーの favorites を API から読み込む', async () => {
    localStorage.setItem('token', 'token-1')
    mockListFavorites.mockResolvedValue([
      createFavoriteItem('fav-1', 'rest-1'),
      createFavoriteItem('fav-2', 'rest-2'),
    ])

    const { result } = renderHook(() => useFavorites(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.favorites).toEqual(['rest-1', 'rest-2'])
    })
  })

  it('user がいない場合は favorites を空にする', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      login: mockLogin,
      logout: mockLogout,
      isLoading: false,
    })

    const { result } = renderHook(() => useFavorites(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.favorites).toEqual([])
    })
    expect(mockListFavorites).not.toHaveBeenCalled()
  })

  it('token がない場合は logout を呼んで favorites を空にする', async () => {
    const { result } = renderHook(() => useFavorites(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.favorites).toEqual([])
      expect(mockLogout).toHaveBeenCalled()
    })
  })

  it('401 で favorites 読み込みに失敗した場合は logout する', async () => {
    localStorage.setItem('token', 'token-1')
    jest.spyOn(axios, 'isAxiosError').mockReturnValue(true)
    mockListFavorites.mockRejectedValue({ isAxiosError: true, response: { status: 401 } })

    const { result } = renderHook(() => useFavorites(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.favorites).toEqual([])
      expect(mockLogout).toHaveBeenCalled()
    })
  })

  it('addFavorite は楽観的更新を行う', async () => {
    localStorage.setItem('token', 'token-1')
    mockListFavorites.mockResolvedValue([])
    let resolveAdd!: (value: Awaited<ReturnType<typeof addFavorite>>) => void
    mockAddFavorite.mockReturnValue(
      new Promise(resolve => {
        resolveAdd = resolve
      }),
    )

    const { result } = renderHook(() => useFavorites(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.favorites).toEqual([]))

    act(() => {
      result.current.addFavorite('rest-3')
    })

    expect(result.current.favorites).toEqual(['rest-3'])

    await act(async () => {
      resolveAdd({
        id: 'fav-3',
        userId: 'user-1',
        restaurantId: 'rest-3',
        createdAt: '2026-03-12',
      })
    })
  })

  it('addFavorite 失敗時はロールバックする', async () => {
    localStorage.setItem('token', 'token-1')
    mockListFavorites.mockResolvedValue([])
    mockAddFavorite.mockRejectedValue(new Error('failed'))

    const { result } = renderHook(() => useFavorites(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.favorites).toEqual([]))

    act(() => {
      result.current.addFavorite('rest-3')
    })

    expect(result.current.favorites).toEqual(['rest-3'])

    await waitFor(() => {
      expect(result.current.favorites).toEqual([])
    })
  })

  it('removeFavorite は楽観的更新を行う', async () => {
    localStorage.setItem('token', 'token-1')
    mockListFavorites.mockResolvedValue([createFavoriteItem('fav-1', 'rest-1')])
    mockRemoveFavorite.mockResolvedValue(undefined)

    const { result } = renderHook(() => useFavorites(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.favorites).toEqual(['rest-1']))

    act(() => {
      result.current.removeFavorite('rest-1')
    })

    expect(result.current.favorites).toEqual([])
  })

  it('removeFavorite 失敗時はロールバックする', async () => {
    localStorage.setItem('token', 'token-1')
    mockListFavorites.mockResolvedValue([createFavoriteItem('fav-1', 'rest-1')])
    mockRemoveFavorite.mockRejectedValue(new Error('failed'))

    const { result } = renderHook(() => useFavorites(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.favorites).toEqual(['rest-1']))

    act(() => {
      result.current.removeFavorite('rest-1')
    })

    expect(result.current.favorites).toEqual([])

    await waitFor(() => {
      expect(result.current.favorites).toEqual(['rest-1'])
    })
  })

  it('toggleFavorite は未登録なら追加、登録済みなら削除する', async () => {
    localStorage.setItem('token', 'token-1')
    mockListFavorites.mockResolvedValue([])
    mockAddFavorite.mockResolvedValue({
      id: 'fav-1',
      userId: 'user-1',
      restaurantId: 'rest-1',
      createdAt: '2026-03-12',
    })
    mockRemoveFavorite.mockResolvedValue(undefined)

    const { result } = renderHook(() => useFavorites(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.favorites).toEqual([]))

    act(() => {
      result.current.toggleFavorite('rest-1')
    })
    await waitFor(() => expect(result.current.isFavorite('rest-1')).toBe(true))

    act(() => {
      result.current.toggleFavorite('rest-1')
    })
    await waitFor(() => expect(result.current.isFavorite('rest-1')).toBe(false))
  })

  it('Provider 外で useFavorites を使うとエラーになる', () => {
    expect(() => renderHook(() => useFavorites())).toThrow(
      'useFavorites must be used within a FavoritesProvider',
    )
  })
})
