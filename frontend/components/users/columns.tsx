'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User } from '@/lib/types'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { DialogDeleteItem } from '../dialogs/dialog-delete-item'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
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
			return <Badge variant={role === 'admin' ? 'chinese' : 'genre'}>{role.toUpperCase()}</Badge>
		},
	},
	{
		accessorKey: 'icon',
		header: 'アイコン',
	},
	{
		accessorKey: 'createdAt',
		header: '作成日',
		cell: ({ getValue }) => {
			return <span>{format(getValue<Date>(), 'MM/dd/yyyy')}</span>
		},
	},
	{
		accessorKey: 'lastLoginAt',
		header: '最終ログイン',
		cell: ({ getValue }) => {
			return <span>{format(getValue<Date>(), 'MM/dd/yyyy')}</span>
		},
	},
	{
		accessorKey: 'company.name',
		header: '会社名',
	},
	{
		accessorKey: 'actions',
		header: 'アクション',
		cell: () => {
			return (
				<div className='flex items-center gap-3'>
					<Button variant='secondary' size='sm'>
						編集
					</Button>
					<DialogDeleteItem
						deleteAction={() => {}}
						deleting={false}
						trigger={
							<Button
								variant='secondary'
								size='sm'
								className='text-red-600 hover:bg-red-50 hover:text-red-700'
							>
								削除
							</Button>
						}
					/>
				</div>
			)
		},
	},
]
