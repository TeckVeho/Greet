'use client'

import * as React from 'react'
import { loginApi } from './api/auth'
import { getCompanyById } from './mock-companies'
import { User } from './types'

interface AuthContextType {
	user: User | null
	login: (email: string, password: string) => Promise<boolean>
	logout: () => void
	isLoading: boolean
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

// モックユーザーデータ（実際にはAPIから取得）
const MOCK_USERS: Array<User & { password: string }> = [
	{
		id: '1',
		email: 'admin@example.com',
		password: 'admin123',
		name: '管理者',
		role: 'admin',
		companyId: 'c1',
		department: '経営企画部',
		createdAt: new Date('2024-01-01'),
		lastLogin: new Date(),
	},
	{
		id: '2',
		email: 'user@example.com',
		password: 'user123',
		name: '山田太郎',
		role: 'user',
		companyId: 'c1',
		department: '営業部',
		createdAt: new Date('2024-01-15'),
		lastLogin: new Date(),
	},
	{
		id: '4',
		email: 'suzuki@example.com',
		password: 'suzuki123',
		name: '鈴木一郎',
		role: 'user',
		companyId: 'c2',
		department: 'マーケティング部',
		createdAt: new Date('2024-02-01'),
		lastLogin: new Date(),
	},
	{
		id: '6',
		email: 'takahashi@example.com',
		password: 'takahashi123',
		name: '高橋三郎',
		role: 'user',
		companyId: 'c3',
		department: '海外事業部',
		createdAt: new Date('2024-02-10'),
		lastLogin: new Date(),
	},
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = React.useState<User | null>(null)
	const [isLoading, setIsLoading] = React.useState(true)

	React.useEffect(() => {
		// ローカルストレージから認証情報を復元
		const storedUser = localStorage.getItem('user')
		if (storedUser) {
			setUser(JSON.parse(storedUser))
		}
		setIsLoading(false)
	}, [])

	const login = async (email: string, password: string): Promise<boolean> => {
		setIsLoading(true)
		try {
			// 実際にはAPIコール
			const loginedUser = await loginApi({ email: email, password: password })

			if (loginedUser.user) {
				// 会社情報を付加
				const userWithCompany = {
					...loginedUser.user,
					company: getCompanyById(loginedUser.user.companyId),
				}
				setUser(userWithCompany)
				localStorage.setItem('user', JSON.stringify(userWithCompany))
				return true
			}
			return false
		} finally {
			setIsLoading(false)
		}
	}

	const logout = () => {
		setUser(null)
		localStorage.removeItem('user')
	}

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
