'use client'

import { DialogUpdateUser, DialogWarning } from '@/components/dialogs'
import { Avatar, AvatarFallback, AvatarImage, Badge, Button } from '@/components/ui'
import { deleteUser } from '@/lib/api/users'
import { User } from '@/lib/types'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { useState } from 'react'
import { toast } from 'sonner'
import { SheetCompanyView } from '../sheets/sheet-company-view'

export const UserColumns: ColumnDef<User>[] = [
	{
		accessorKey: 'name',
		header: '名前',
		cell: ({ row, getValue }) => {
			const name = getValue<string>()
			const avatarUrl = row.original.avatar || undefined

			return (
				<div className='flex items-center gap-3'>
					<Avatar className='h-9 w-9'>
						<AvatarImage src={avatarUrl} alt={name} />
						<AvatarFallback>{name?.charAt(0) || '?'}</AvatarFallback>
					</Avatar>
					<span>{name}</span>
				</div>
			)
		},
	},
	{
		accessorKey: 'email',
		header: 'メールアドレス',
	},
	{
		accessorKey: 'company.name',
		header: '会社',
		cell: ({ getValue, row }) => {
			const value = getValue<string>()
			return (
				<SheetCompanyView
					trigger={<span className='text-blue-500 underline cursor-pointer'>{value}</span>}
					company_data={row.original.company || null}
				/>
			)
		},
	},
	{
		accessorKey: 'department',
		header: '部署',
	},
	{
		accessorKey: 'role',
		header: '権限',
		cell: ({ getValue }) => {
			const role = getValue<string>()
			return (
				<Badge variant={role === 'admin' ? 'chinese' : 'french'}>
					{role === 'admin' ? '管理者' : '一般ユーザー'}
				</Badge>
			)
		},
	},
	{
		accessorKey: 'createdAt',
		header: '登録日',
		cell: ({ getValue }) => {
			const value = getValue<string | Date | null>()
			if (!value) {
				return <span className='text-muted-foreground'>-</span>
			}

			const date = new Date(value)
			if (Number.isNaN(date.getTime())) {
				return <span className='text-muted-foreground'>-</span>
			}

			return (
				<div className='flex flex-col'>
					<span>{format(date, 'MM/dd/yyyy')}</span>
					<span>{format(date, 'HH:mm')}</span>
				</div>
			)
		},
	},
	{
		accessorKey: 'lastLoginAt',
		header: '最終ログイン',
		cell: ({ getValue }) => {
			const value = getValue<string | Date | null>()
			if (!value) {
				return <span className='text-muted-foreground'>未ログイン</span>
			}

			const date = new Date(value)
			if (Number.isNaN(date.getTime())) {
				return <span className='text-muted-foreground'>未ログイン</span>
			}

			return (
				<div className='flex flex-col'>
					<span>{format(date, 'MM/dd/yyyy')}</span>
					<span>{format(date, 'HH:mm')}</span>
				</div>
			)
		},
	},

	{
		id: 'actions',
		header: '操作',
		cell: ({ row }) => {
			const [isLoading, setIsloading] = useState<boolean>(false)
			const user_id = row.original.id
			const handleDelete = async () => {
				try {
					setIsloading(true)
					await deleteUser(user_id)
				} catch (err) {
					toast.error('ユーザーの削除に失敗しました。')
				} finally {
					setIsloading(false)
				}
			}
			return (
				<div className='flex items-center gap-3'>
					<DialogUpdateUser
						trigger={
							<Button variant='secondary' size='sm'>
								編集
							</Button>
						}
						user_data={row.original}
					/>

					<DialogWarning
						deleteAction={handleDelete}
						deleting={isLoading}
						description='このユーザーを削除してもよろしいですか？この操作は元に戻すことができません。'
						trigger={
							<Button
								variant='secondary'
								size='sm'
								className='text-red-600 hover:bg-red-50 hover:text-red-700'
							>
								削除
							</Button>
						}
						actionButtonText={'削除'}
						deletingText='削除中...'
					/>
				</div>
			)
		},
	},
]
