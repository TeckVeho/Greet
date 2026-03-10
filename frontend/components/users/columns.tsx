'use client'

import { DialogWarning } from '@/components/dialogs'
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
		accessorKey: 'avatar',
		header: 'アバター',
		cell: ({ getValue, row }) => {
			const avatarUrl = getValue<string>()
			return (
				<Avatar>
					<AvatarImage src={avatarUrl} />
					<AvatarFallback>{row.original.name.charAt(0)}</AvatarFallback>
				</Avatar>
			)
		},
	},
	{
		accessorKey: 'name',
		header: '名前',
	},
	{
		accessorKey: 'email',
		header: 'メールアドレス',
	},
	{
		accessorKey: 'department',
		header: '部署',
	},
	{
		accessorKey: 'role',
		header: 'ロール',
		cell: ({ getValue }) => {
			const role = getValue<string>()
			return <Badge variant={role === 'admin' ? 'chinese' : 'french'}>{role.toUpperCase()}</Badge>
		},
	},
	{
		accessorKey: 'icon',
		header: 'アイコン',
	},
	{
		accessorKey: 'company.name',
		header: '会社名',
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
		accessorKey: 'createdAt',
		header: '作成日',
		cell: ({ getValue }) => {
			return (
				<div className='flex flex-col'>
					<span>{format(getValue<Date>(), 'MM/dd/yyyy')}</span>
					<span>{format(getValue<Date>(), 'HH:mm')}</span>
				</div>
			)
		},
	},
	{
		accessorKey: 'lastLoginAt',
		header: '最終ログイン',
		cell: ({ getValue }) => {
			return (
				<div className='flex flex-col'>
					<span>{format(getValue<Date>(), 'MM/dd/yyyy')}</span>
					<span>{format(getValue<Date>(), 'HH:mm')}</span>
				</div>
			)
		},
	},

	{
		id: 'actions',
		header: 'アクション',
		cell: ({ row }) => {
			const [isLoading, setIsloading] = useState<boolean>(false)
			const user_id = row.original.id
			const handleDelete = async () => {
				try {
					setIsloading(true)
					await deleteUser(user_id)
				} catch (err) {
					console.log(err)
					toast.error('ユーザーの削除に失敗しました。')
				} finally {
					setIsloading(false)
				}
			}
			return (
				<div className='flex items-center gap-3'>
					<Button variant='secondary' size='sm'>
						編集
					</Button>

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
