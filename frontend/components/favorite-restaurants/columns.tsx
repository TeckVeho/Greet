'use client'

import { Avatar, AvatarFallback, AvatarImage, Badge } from '@/components/ui'
import { AREA_LABELS, GENRE_LABELS, PRICE_RANGE_LABELS } from '@/lib/constants'
import { useFavorites } from '@/lib/favorites-context'
import { Restaurant } from '@/lib/types'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Check, X } from 'lucide-react'
import Link from 'next/link'
import { OutlineStar, Rating } from '../rating'
import { SheetReviewView } from '../sheets/sheet-review-view'

export const favoriteRestaurantsColumns: ColumnDef<Restaurant>[] = [
	{
		id: 'rate',
		header: 'お気に入り',
		cell: ({ row }) => {
			const restaurant = row.original
			const { isFavorite, toggleFavorite } = useFavorites()
			const isFav = isFavorite(restaurant.id)
			return (
				<Badge
					onClick={e => {
						e.preventDefault()
						e.stopPropagation()
						toggleFavorite(restaurant.id)
					}}
					className='h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border/70 bg-card/90 shadow-sm transition-colors hover:bg-card'
				>
					{isFav ? (
						<Rating rate={1} max={1} className='[&_svg]:size-5! [&>div]:size-5!' />
					) : (
						<OutlineStar className='[&_svg]:size-5! [&>div]:size-5!' />
					)}
				</Badge>
			)
		},
	},
	{
		accessorKey: 'coverImage',
		header: '写真',
		cell: ({ getValue, row }) => {
			const avatarUrl = getValue<string>()
			return (
				<Avatar className='rounded-none'>
					<AvatarImage src={avatarUrl} className='object-cover' />
					<AvatarFallback className='rounded-none'>{row.original.name.charAt(0)}</AvatarFallback>
				</Avatar>
			)
		},
	},
	{
		accessorKey: 'createdBy.name',
		header: '登録者',
		cell: ({ row }) => {
			return <span className='whitespace-nowrap'>{row.original.createdBy?.name || '-'}</span>
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
					className='font-medium hover:text-blue-500 whitespace-nowrap'
				>
					{row.original.icon} {name}
				</Link>
			)
		},
	},
	{
		accessorKey: 'area',
		header: 'エリア',
		cell: ({ getValue }) => {
			const area = getValue<string>()
			return <Badge className='whitespace-nowrap'>{AREA_LABELS[area]}</Badge>
		},
	},
	{
		accessorKey: 'genres',
		header: 'ジャンル',
		cell: ({ getValue }) => {
			const genres = getValue<string[]>()
			return (
				<div className='flex flex-wrap gap-2 min-w-37.5'>
					{genres.map(genre => (
						<Badge key={genre} variant='genre' className='whitespace-nowrap'>
							{GENRE_LABELS[genre]}
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
			return hasPrivateRoom ? (
				<Check className='text-green-500 size-4' />
			) : (
				<X className=' size-4' />
			)
		},
	},
	{
		accessorKey: 'smokingAllowed',
		header: '喫煙可',
		cell: ({ getValue }) => {
			const smokingAllowed = getValue<boolean>()
			return <Badge className='whitespace-nowrap'>{smokingAllowed ? '可' : '不可'}</Badge>
		},
	},
	{
		accessorKey: 'address',
		header: '住所',
		cell: ({ getValue }) => {
			const address = getValue<string>()
			return address ? (
				<span className='whitespace-nowrap'>{address}</span>
			) : (
				<Badge variant={'danger'}>なし</Badge>
			)
		},
	},
	{
		accessorKey: 'phone',
		header: '電話番号',
		cell: ({ getValue }) => {
			const phone = getValue<string>()
			return phone ? (
				<span className='whitespace-nowrap'>{phone}</span>
			) : (
				<Badge variant={'danger'}>なし</Badge>
			)
		},
	},
	{
		accessorKey: 'priceRange',
		header: '価格帯',
		cell: ({ getValue }) => {
			const priceRange = getValue<string>()
			return <span>{PRICE_RANGE_LABELS[priceRange]}</span>
		},
	},
	{
		accessorKey: 'createdBy',
		header: '登録者',
		cell: ({ row }) => row.original.createdBy?.name ?? '削除済みユーザー',
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
