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
		header: 'Avatar',
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
		header: 'Name',
	},
	{
		accessorKey: 'email',
		header: 'Email',
	},
	{
		accessorKey: 'department',
		header: 'Department',
	},
	{
		accessorKey: 'role',
		header: 'Role',
		cell: ({ getValue }) => {
			const role = getValue<string>()
			return <Badge variant={role === 'admin' ? 'chinese' : 'genre'}>{role.toUpperCase()}</Badge>
		},
	},
	{
		accessorKey: 'icon',
		header: 'Icon',
	},
	{
		accessorKey: 'createdAt',
		header: 'Joined in',
		cell: ({ getValue }) => {
			return <span>{format(getValue<Date>(), 'MM-dd-yyyy')}</span>
		},
	},
	{
		accessorKey: 'lastLoginAt',
		header: 'Last Login',
		cell: ({ getValue }) => {
			return <span>{format(getValue<Date>(), 'MM-dd-yyyy')}</span>
		},
	},
	{
		accessorKey: 'company.name',
		header: 'Company name',
	},
	{
		accessorKey: 'actions',
		header: 'Actions',
		cell: () => {
			return (
				<div>
					<Button variant='ghost' size='sm'>
						編集
					</Button>
					<DialogDeleteItem
						deleteAction={() => {}}
						deleting={false}
						trigger={
							<Button
								variant='ghost'
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
