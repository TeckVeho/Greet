import * as React from 'react'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '@/lib/auth-context'

// ── Mocks ──

const mockLoginApi = jest.fn()
const mockClear = jest.fn()

jest.mock('@/lib/api/auth', () => ({
  loginApi: (...args: unknown[]) => mockLoginApi(...args),
}))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// ── Helpers ──

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  // Spy on clear()
  queryClient.clear = mockClear
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    )
  }
}

// ── Tests ──

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()
  })

  describe('初期状態', () => {
    it('初期状態ではuserがnull', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      // Wait for useEffect to finish
      await act(async () => {})

      expect(result.current.user).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })

    it('localStorageにユーザー情報がある場合、復元される', async () => {
      const storedUser = {
        id: 'user-1',
        name: 'テストユーザー',
        email: 'test@example.com',
        role: 'user',
        companyId: 'company-1',
      }
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(storedUser))

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      await act(async () => {})

      expect(result.current.user).toEqual(storedUser)
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('login', () => {
    it('ログイン成功時にユーザー情報がセットされtrueを返す', async () => {
      const mockUser = {
        id: 'user-1',
        name: 'テスト',
        email: 'test@example.com',
        role: 'user',
        companyId: 'company-1',
      }
      mockLoginApi.mockResolvedValue({ user: mockUser, token: 'jwt-token' })

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })
      await act(async () => {})

      let loginResult: boolean = false
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'password')
      })

      expect(loginResult).toBe(true)
      expect(result.current.user).toEqual(mockUser)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser))
    })

    it('ログイン成功時にqueryClient.clearが呼ばれる', async () => {
      mockLoginApi.mockResolvedValue({
        user: { id: 'u1', name: 'N', email: 'e', role: 'user', companyId: 'c1' },
        token: 'tok',
      })

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })
      await act(async () => {})

      await act(async () => {
        await result.current.login('e', 'p')
      })

      expect(mockClear).toHaveBeenCalled()
    })

    it('ログインAPIがuserなしの場合falseを返す', async () => {
      mockLoginApi.mockResolvedValue({ user: null, token: null })

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })
      await act(async () => {})

      let loginResult: boolean = true
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'wrong')
      })

      expect(loginResult).toBe(false)
      expect(result.current.user).toBeNull()
    })

    it('ログイン中はisLoadingがtrueになる', async () => {
      let resolveLogin: (v: unknown) => void
      mockLoginApi.mockReturnValue(new Promise(r => { resolveLogin = r }))

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })
      await act(async () => {})

      expect(result.current.isLoading).toBe(false)

      // Start login but don't resolve yet
      let loginPromise: Promise<boolean>
      act(() => {
        loginPromise = result.current.login('e', 'p')
      })

      expect(result.current.isLoading).toBe(true)

      // Resolve
      await act(async () => {
        resolveLogin!({ user: { id: '1', name: 'N' }, token: 't' })
        await loginPromise!
      })

      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('logout', () => {
    it('ログアウト時にユーザー情報がクリアされる', async () => {
      mockLoginApi.mockResolvedValue({
        user: { id: 'u1', name: 'N', email: 'e', role: 'user', companyId: 'c1' },
        token: 'tok',
      })

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })
      await act(async () => {})

      // Login first
      await act(async () => {
        await result.current.login('e', 'p')
      })
      expect(result.current.user).not.toBeNull()

      // Logout
      act(() => {
        result.current.logout()
      })

      expect(result.current.user).toBeNull()
    })

    it('ログアウト時にlocalStorageからuser/tokenが削除される', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })
      await act(async () => {})

      act(() => {
        result.current.logout()
      })

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
    })

    it('ログアウト時にqueryClient.clearが呼ばれる', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })
      await act(async () => {})

      act(() => {
        result.current.logout()
      })

      expect(mockClear).toHaveBeenCalled()
    })
  })

  describe('useAuth エラー', () => {
    it('AuthProvider外でuseAuthを使うとエラーをスローする', () => {
      // Suppress console.error for expected error
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useAuth())
      }).toThrow('useAuth must be used within an AuthProvider')

      spy.mockRestore()
    })
  })
})
