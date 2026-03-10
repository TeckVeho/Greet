'use client'

import { DialogDeleteItem } from '@/components/dialogs'
import { Avatar, AvatarFallback, AvatarImage, Badge, Button } from '@/components/ui'
import { User } from '@/lib/types'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'

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
					/>
				</div>
			)
		},
	},
]
