'use client'

import * as React from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { loginApi } from './api/auth'
import { User } from './types'

interface AuthContextType {
	user: User | null
	login: (email: string, password: string) => Promise<boolean>
	logout: () => void
	isLoading: boolean
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = React.useState<User | null>(null)
	const [isLoading, setIsLoading] = React.useState(true)
	const queryClient = useQueryClient()

	React.useEffect(() => {
		// ローカルストレージから認証情報を復元
		const storedUser = localStorage.getItem('user')
		if (storedUser) {
			setUser(JSON.parse(storedUser))
		}
		setIsLoading(false)
	}, [])

	const login = React.useCallback(async (email: string, password: string): Promise<boolean> => {
		setIsLoading(true)
		try {
			const loginedUser = await loginApi({ email: email, password: password })

			if (loginedUser.user) {
				// 別ユーザーのキャッシュが残らないよう古いクエリキャッシュを全消去
				queryClient.clear()
				setUser(loginedUser.user)
				localStorage.setItem('user', JSON.stringify(loginedUser.user))
				return true
			}
			return false
		} finally {
			setIsLoading(false)
		}
	}, [queryClient])

	const logout = React.useCallback(() => {
		setUser(null)
		localStorage.removeItem('user')
		// JWT トークンを必ず削除してリクエストが旧ユーザーの権限で送られないようにする
		localStorage.removeItem('token')
		// 別ユーザーのデータが次のログインに漏れないようキャッシュを全消去
		queryClient.clear()
	}, [queryClient])

	return (
		<AuthContext.Provider value={{ user, login, logout, isLoading }}>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	const context = React.useContext(AuthContext)
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}
