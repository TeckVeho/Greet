'use client'

import { UserFormDialog } from '@/components/dialogs'
import {
	Button,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Spinner,
} from '@/components/ui'
import { DataTable, UserColumns } from '@/components/users'
import { useUsers } from '@/hooks/use-users'
import { listCompanies, type CompanyListItem } from '@/lib/api/companies'
import { createUser } from '@/lib/api/users'
import { useAuth } from '@/lib/auth-context'
import type { User } from '@/lib/types'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { PaginationState } from '@tanstack/react-table'
import { useRouter } from 'next/navigation'
import * as React from 'react'

export default function UsersPage() {
	const router = useRouter()
	const [pagination, setPagination] = React.useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	})
	const { user: currentUser } = useAuth()
	const [searchQuery, setSearchQuery] = React.useState('')
	const {
		data: usersData,
		isLoading: isLoadingUsers,
		isFetching: isFetchingUsers,
	} = useUsers({
		limit: pagination.pageSize,
		page: pagination.pageIndex + 1,
		search: searchQuery,
	})
	const { data: companiesData } = useQuery<{ companies: CompanyListItem[] }>({
		queryKey: ['companies'],
		queryFn: listCompanies,
	})
	const queryClient = useQueryClient()
	const [companyFilter, setCompanyFilter] = React.useState<string>('all')
	const [isDialogOpen, setIsDialogOpen] = React.useState(false)
	const [isSaving, setIsSaving] = React.useState(false)
	const companies = companiesData?.companies ?? []

	// 管理者権限チェック
	React.useEffect(() => {
		if (currentUser && currentUser.role !== 'admin') {
			router.push('/')
		}
	}, [currentUser, router])

	if (isLoadingUsers) {
		return <Spinner type='page-loading' />
	}

	// 管理者以外は表示しない
	if (!currentUser || currentUser.role !== 'admin') {
		return null
	}

	const handleSaveUser = async (userData: Partial<User> & { password?: string }) => {
		if (!userData.name || !userData.email || !userData.role || !userData.password) {
			return
		}
		setIsSaving(true)
		try {
			await createUser({
				name: userData.name,
				email: userData.email,
				password: userData.password,
				role: userData.role,
				department: userData.department,
			})
			await queryClient.invalidateQueries({ queryKey: ['users'] })
			setIsDialogOpen(false)
		} catch (e) {
			console.error('Failed to create user', e)
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<>
			<div className='mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8'>
				{/* ページヘッダー */}
				<div className='mb-8'>
					<div className='mb-2 flex items-center gap-2'>
						<span className='text-2xl md:text-3xl'>👥</span>
						<h1 className='text-2xl md:text-3xl font-bold text-zinc-900'>ユーザー管理</h1>
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
								{companies.map(company => (
									<SelectItem key={company.id} value={company.id}>
										{company.icon} {company.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Button onClick={() => setIsDialogOpen(true)}>
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
				<DataTable
					columns={UserColumns}
					data={usersData?.users!}
					pagination={pagination}
					setPagination={setPagination}
					total={usersData?.meta.total}
					isLoading={isFetchingUsers}
				/>
			</div>

			<UserFormDialog
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				mode='create'
				companies={companies}
				onSave={handleSaveUser}
				isSaving={isSaving}
			/>
		</>
	)
}
