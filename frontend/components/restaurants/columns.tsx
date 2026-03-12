'use client'

import { Avatar, AvatarFallback, AvatarImage, Badge } from '@/components/ui'
import type { RestaurantListItem } from '@/lib/api/restaurants'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import Link from 'next/link'

export const RestaurantColumns: ColumnDef<RestaurantListItem>[] = [
	{
		accessorKey: 'coverImage',
		header: '写真',
		cell: ({ getValue, row }) => {
			const avatarUrl = getValue<string>()
			return (
				<Avatar className='rounded-none'>
					<AvatarImage src={avatarUrl} className='object-cover' />
					<AvatarFallback>{row.original.name.charAt(0)}</AvatarFallback>
				</Avatar>
			)
		},
	},
	{
		accessorKey: 'url',
		header: 'URL',
		cell: ({ getValue, row }) => {
			const url = getValue<string>()
			return (
				<a href={url} target='_blank' rel='noopener noreferrer'>
					url
				</a>
			)
		},
	},

	{
		accessorKey: 'name',
		header: '店名',
		cell: ({ getValue, row }) => {
			const name = getValue<string>()
			return (
				<Link
					href={`/restaurants/${row.original.id}`}
					className='font-medium underline text-blue-500'
				>
					{name}
				</Link>
			)
		},
	},
	{
		accessorKey: 'area',
		header: 'エリア',
	},
	{
		accessorKey: 'genres',
		header: 'ジャンル',
		cell: ({ getValue }) => {
			const genres = getValue<string[]>()
			return (
				<div className='flex flex-wrap gap-2'>
					{genres.map(genre => (
						<Badge key={genre} variant='genre'>
							{genre}
						</Badge>
					))}
				</div>
			)
		},
	},
	{
		accessorKey: 'hasPrivateRoom',
		header: '個室あり',
		cell: ({ getValue }) => {
			const hasPrivateRoom = getValue<boolean>()
			return (
				<Badge variant={hasPrivateRoom ? 'success' : 'danger'}>
					{hasPrivateRoom ? 'あり' : 'なし'}
				</Badge>
			)
		},
	},
	{
		accessorKey: 'address',
		header: '住所',
	},
	{
		accessorKey: 'phone',
		header: '電話番号',
	},
	{
		accessorKey: 'icon',
		header: 'アイコン',
	},
	{
		accessorKey: 'createdBy.name',
		header: '登録者',
	},
	{
		accessorKey: 'reviewCount',
		header: 'レビュー数',
		cell: ({ getValue }) => {
			const reviewCount = getValue<number>()
			return reviewCount ?? 0
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
	// {
	// 	accessorKey: 'lastLoginAt',
	// 	header: '最終ログイン',
	// 	cell: ({ getValue }) => {
	// 		return (
	// 			<div className='flex flex-col'>
	// 				<span>{format(getValue<Date>(), 'MM/dd/yyyy')}</span>
	// 				<span>{format(getValue<Date>(), 'HH:mm')}</span>
	// 			</div>
	// 		)
	// 	},
	// },

	// {
	// 	id: 'actions',
	// 	header: 'アクション',
	// 	cell: ({ row }) => {
	// 		const [isLoading, setIsloading] = useState<boolean>(false)
	// 		const user_id = row.original.id
	// 		const handleDelete = async () => {
	// 			try {
	// 				setIsloading(true)
	// 				await deleteUser(user_id)
	// 			} catch (err) {
	// 				toast.error('ユーザーの削除に失敗しました。')
	// 			} finally {
	// 				setIsloading(false)
	// 			}
	// 		}
	// 		return (
	// 			<div className='flex items-center gap-3'>
	// 				<DialogUpdateUser
	// 					trigger={
	// 						<Button variant='secondary' size='sm'>
	// 							編集
	// 						</Button>
	// 					}
	// 					user_data={row.original}
	// 				/>

	// 				<DialogWarning
	// 					deleteAction={handleDelete}
	// 					deleting={isLoading}
	// 					description='このユーザーを削除してもよろしいですか？この操作は元に戻すことができません。'
	// 					trigger={
	// 						<Button
	// 							variant='secondary'
	// 							size='sm'
	// 							className='text-red-600 hover:bg-red-50 hover:text-red-700'
	// 						>
	// 							削除
	// 						</Button>
	// 					}
	// 					actionButtonText={'削除'}
	// 					deletingText='削除中...'
	// 				/>
	// 			</div>
	// 		)
	// 	},
	// },
]
