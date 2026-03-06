'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { UserColumns } from '@/components/users/columns'
import { DataTable } from '@/components/users/data-table'
import { useUsers } from '@/hooks/use-users'
import { useAuth } from '@/lib/auth-context'
import { mockCompanies } from '@/lib/mock-companies'
import { mockUsers } from '@/lib/mock-users'
import { User } from '@/lib/types'
import { useRouter } from 'next/navigation'
import * as React from 'react'

export default function UsersPage() {
	const router = useRouter()
	const { user: currentUser } = useAuth()
	const { data: users, isPending: isPendingUsers, error: errorUsers } = useUsers()
	const [filteredUsers, setFilteredUsers] = React.useState<User[]>(mockUsers)
	const [searchQuery, setSearchQuery] = React.useState('')
	const [companyFilter, setCompanyFilter] = React.useState<string>('all')
	const [isDialogOpen, setIsDialogOpen] = React.useState(false)
	const [editingUser, setEditingUser] = React.useState<User | undefined>()
	const [dialogMode, setDialogMode] = React.useState<'create' | 'edit'>('create')

	// 管理者権限チェック
	React.useEffect(() => {
		if (currentUser && currentUser.role !== 'admin') {
			router.push('/')
		}
	}, [currentUser, router])

	if (isPendingUsers) {
		return <Spinner type='page-loading' />
	}

	// 検索・会社フィルター
	// React.useEffect(() => {
	// 	let filtered = users

	// 	// 会社フィルター
	// 	if (companyFilter !== 'all') {
	// 		filtered = filtered.filter(user => user.companyId === companyFilter)
	// 	}

	// 	// 検索クエリフィルター
	// 	if (searchQuery) {
	// 		const query = searchQuery.toLowerCase()
	// 		filtered = filtered.filter(
	// 			user =>
	// 				user.name.toLowerCase().includes(query) ||
	// 				user.email.toLowerCase().includes(query) ||
	// 				user.department?.toLowerCase().includes(query) ||
	// 				user.company?.name.toLowerCase().includes(query),
	// 		)
	// 	}

	// 	setFilteredUsers(filtered)
	// }, [searchQuery, companyFilter, users])

	// const handleNewUser = () => {
	// 	setDialogMode('create')
	// 	setEditingUser(undefined)
	// 	setIsDialogOpen(true)
	// }

	// const handleEditUser = (user: User) => {
	// 	setDialogMode('edit')
	// 	setEditingUser(user)
	// 	setIsDialogOpen(true)
	// }

	// const handleDeleteUser = (userId: string) => {
	// 	if (window.confirm('このユーザーを削除してもよろしいですか？')) {
	// 		setUsers(users?.data.filter(u => u.id !== userId))
	// 	}
	// }

	// const handleSaveUser = (userData: Partial<User>) => {
	// 	if (dialogMode === 'create') {
	// 		const newUser: User = {
	// 			id: Math.random().toString(36).substring(7),
	// 			name: userData.name!,
	// 			email: userData.email!,
	// 			role: userData.role || 'user',
	// 			companyId: userData.companyId!,
	// 			company: getCompanyById(userData.companyId!),
	// 			department: userData.department,
	// 			createdAt: new Date(),
	// 		}
	// 		setUsers([...users?.data, newUser])
	// 	} else if (editingUser) {
	// 		setUsers(
	// 			users?.data.map(u =>
	// 				u.id === editingUser.id
	// 					? {
	// 							...u,
	// 							...userData,
	// 							company: userData.companyId ? getCompanyById(userData.companyId) : u.company,
	// 						}
	// 					: u,
	// 			),
	// 		)
	// 	}
	// }

	// 管理者以外は表示しない
	if (!currentUser || currentUser.role !== 'admin') {
		return null
	}

	return (
		<>
			<div className='mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8'>
				{/* ページヘッダー */}
				<div className='mb-8'>
					<div className='mb-2 flex items-center gap-2'>
						<span className='text-2xl md:text-3xl'>👥</span>
						<h1
							className='text-2xl md:text-3xl font-bold text-zinc-900'
							onClick={() => {
								console.log(users)
							}}
						>
							ユーザー管理
						</h1>
					</div>
					<p className='text-sm text-zinc-500'>システムを利用するユーザーの管理</p>
				</div>

				{/* 検索・フィルター・追加バー */}
				<div className='mb-6 space-y-3'>
					<div className='flex flex-col gap-3 md:flex-row md:items-center'>
						<div className='relative flex-1'>
							<svg
								className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400'
								fill='none'
								strokeWidth='2'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									d='M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z'
								/>
							</svg>
							<Input
								type='search'
								placeholder='名前、メールアドレス、部署、会社名で検索...'
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
								className='pl-10'
							/>
						</div>
						<Select value={companyFilter} onValueChange={setCompanyFilter}>
							<SelectTrigger className='w-full md:w-60'>
								<SelectValue placeholder='会社で絞り込み' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>全ての会社</SelectItem>
								{mockCompanies.map(company => (
									<SelectItem key={company.id} value={company.id}>
										{company.icon} {company.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Button>
							<svg
								className='mr-2 h-4 w-4'
								fill='none'
								strokeWidth='2'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path strokeLinecap='round' strokeLinejoin='round' d='M12 4.5v15m7.5-7.5h-15' />
							</svg>
							新規ユーザー
						</Button>
					</div>
				</div>

				{/* テーブル */}
				<div className='rounded-lg'>
					<DataTable columns={UserColumns} data={users?.data ?? []} />
					{/* <UserTable users={filteredUsers} onEdit={handleEditUser} onDelete={handleDeleteUser} /> */}
				</div>

				{/* 件数表示 */}
				<div className='mt-4 text-sm text-zinc-500'>{filteredUsers.length} 件のユーザー</div>
			</div>

			{/* ユーザー登録・編集モーダル */}
			{/* <UserFormDialog
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				mode={dialogMode}
				user={editingUser}
				onSave={handleSaveUser}
			/> */}
		</>
	)
}
