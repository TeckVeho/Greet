'use client'

import { Avatar, AvatarFallback, AvatarImage, Badge } from '@/components/ui'
import { AREA_LABELS, GENRE_LABELS, PRICE_RANGE_LABELS } from '@/lib/constants'
import { Restaurant } from '@/lib/types'
import { ColumnDef } from '@tanstack/react-table'
import { Check, X } from 'lucide-react'
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
				<Link href={`/restaurants/${row.original.id}`} className='font-medium  hover:text-blue-500'>
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
				<div className='flex flex-wrap gap-2'>
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
		accessorKey: 'priceRange',
		header: '価格帯',
		cell: ({ getValue }) => {
			const priceRange = getValue<string>()
			return <span>{PRICE_RANGE_LABELS[priceRange]}</span>
		},
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
		accessorKey: 'reviews',
		header: '利用者',
		cell: ({ getValue, row }) => {
			const reviews = getValue<{ author: { icon: string } }[]>() || []
			const limit = 3
			const displayReviews = reviews.slice(0, limit)
			const remainingCount = reviews.length - limit

			return (
				<div className='flex -space-x-2 overflow-hidden p-1'>
					{displayReviews.map((review, index) => (
						<Avatar className='shadow-sm hover:z-10 ' key={index}>
							<AvatarFallback className='bg-muted text-[10px]'>
								{review.author.icon ? review.author.icon : row.original.name.charAt(0)}
							</AvatarFallback>
						</Avatar>
					))}

					{remainingCount > 0 && (
						<div className='flex h-10 w-10 items-center justify-center rounded-full  bg-muted text-[12px] font-medium text-muted-foreground shadow-sm'>
							+{remainingCount}
						</div>
					)}
				</div>
			)
		},
	},
	// {
	// 	accessorKey: 'url',
	// 	header: 'URL',
	// 	cell: ({ getValue }) => {
	// 		const url = getValue<string>()
	// 		return (
	// 			<a
	// 				href={url}
	// 				target='_blank'
	// 				rel='noopener noreferrer'
	// 				className='font-medium underline text-blue-500'
	// 			>
	// 				Google Mapで見る
	// 			</a>
	// 		)
	// 	},
	// },
	// {
	// 	accessorKey: 'createdAt',
	// 	header: '作成日',
	// 	cell: ({ getValue }) => {
	// 		return (
	// 			<div className='flex flex-col'>
	// 				<span>{format(getValue<Date>(), 'MM/dd/yyyy')}</span>
	// 				<span>{format(getValue<Date>(), 'HH:mm')}</span>
	// 			</div>
	// 		)
	// 	},
	// },
]
