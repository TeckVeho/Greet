'use client'

import { UserFormDialog } from '@/components/dialogs'
import {
	Button,
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Spinner,
} from '@/components/ui'
import { DataTable, UserColumns } from '@/components/users'
import { useCompanies } from '@/hooks/use-companies'
import { useUsers } from '@/hooks/use-users'
import { createUser } from '@/lib/api/users'
import { useAuth } from '@/lib/auth-context'
import type { User } from '@/lib/types'
import { useQueryClient } from '@tanstack/react-query'
import { PaginationState } from '@tanstack/react-table'
import { Plus, SearchIcon, X } from 'lucide-react'
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
	const [companyIdQuery, setCompanyIdQuery] = React.useState<string | 'all'>('all')
	const {
		data: usersData,
		isLoading: isLoadingUsers,
		isFetching: isFetchingUsers,
	} = useUsers({
		limit: pagination.pageSize,
		page: pagination.pageIndex + 1,
		search: searchQuery,
		companyId: companyIdQuery === 'all' ? undefined : companyIdQuery,
	})
	const { data: companiesData, isPending: isPendingCompanies } = useCompanies()
	const queryClient = useQueryClient()
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
						<InputGroup>
							<InputGroupInput
								placeholder='名前、メールアドレス、部署、会社名で検索...'
								onChange={e => setSearchQuery(e.target.value)}
								value={searchQuery}
							/>
							<InputGroupAddon>
								<SearchIcon />
							</InputGroupAddon>

							<InputGroupAddon align='inline-end'>
								{searchQuery ? (
									<X
										className='cursor-pointer'
										onClick={() => {
											setSearchQuery('')
										}}
									/>
								) : (
									''
								)}
							</InputGroupAddon>
						</InputGroup>

						<Select
							value={companyIdQuery}
							onValueChange={setCompanyIdQuery}
							disabled={isPendingCompanies}
						>
							<SelectTrigger className='w-full md:w-60'>
								<SelectValue
									placeholder={isPendingCompanies ? '読み込み中...' : '会社で絞り込み'}
								/>
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
							<Plus />
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
