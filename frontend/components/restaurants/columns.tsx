'use client'

import { Avatar, AvatarFallback, AvatarImage, Badge } from '@/components/ui'
import { Restaurant } from '@/lib/types'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import Link from 'next/link'
import { SheetReviewView } from '../sheets/sheet-review-view'

export const RestaurantColumns: ColumnDef<Restaurant>[] = [
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
				<Badge variant={hasPrivateRoom ? 'success' : 'danger'} className='whitespace-nowrap'>
					{hasPrivateRoom ? 'あり' : 'なし'}
				</Badge>
			)
		},
	},
	{
		accessorKey: 'smokingAllowed',
		header: '喫煙可',
		cell: ({ getValue }) => {
			const smokingAllowed = getValue<boolean>()
			return (
				<Badge variant={smokingAllowed ? 'success' : 'danger'} className='whitespace-nowrap'>
					{smokingAllowed ? 'あり' : 'なし'}
				</Badge>
			)
		},
	},
	{
		accessorKey: 'address',
		header: '住所',
		cell: ({ getValue }) => {
			const address = getValue<string>()
			return address ? <span>{address}</span> : <Badge variant={'danger'}>なし</Badge>
		},
	},
	{
		accessorKey: 'phone',
		header: '電話番号',
		cell: ({ getValue }) => {
			const phone = getValue<string>()
			return phone ? <span>{phone}</span> : <Badge variant={'danger'}>なし</Badge>
		},
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
		cell: ({ getValue, row }) => {
			const reviewCount = getValue<number>()
			const reviewIsValid = reviewCount > 0
			return reviewIsValid ? (
				<SheetReviewView
					reviews={row.original.reviews}
					trigger={<span className={'underline text-blue-500 cursor-pointer'}>{reviewCount}</span>}
				/>
			) : (
				0
			)
		},
	},
	{
		accessorKey: 'url',
		header: 'URL',
		cell: ({ getValue }) => {
			const url = getValue<string>()
			return (
				<a
					href={url}
					target='_blank'
					rel='noopener noreferrer'
					className='font-medium underline text-blue-500'
				>
					Google Mapで見る
				</a>
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
]
