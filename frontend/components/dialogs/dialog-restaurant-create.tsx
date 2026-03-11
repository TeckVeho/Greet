'use client'

import {
	Button,
	Checkbox,
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
	Label,
	ScrollArea,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Spinner,
} from '@/components/ui'
import { createRestaurant, uploadRestaurantImage } from '@/lib/api/restaurants'
import { AREA_OPTIONS, GENRE_OPTIONS, PRICE_RANGE_OPTIONS } from '@/lib/constants'
import { queryClient } from '@/lib/query-client'
import { onError } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import Image from 'next/image'
import * as React from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { ButtonRemoveImage } from '../button-remove'

interface RestaurantFormDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

const schema = z.object({
	name: z.string().min(1, '店名は必須です'),
	area: z.enum(AREA_OPTIONS.map(opt => opt.value)),
	genre: z.enum(GENRE_OPTIONS.map(opt => opt.value)),
	hasPrivateRoom: z.boolean(),
	smokingAllowed: z.boolean(),
	priceRange: z.enum(PRICE_RANGE_OPTIONS.map(opt => opt.value)),
	address: z.string().optional(),
	phone: z.string().optional(),
	url: z.string().url().optional(),
	icon: z.string().optional(),
	coverImage: z.instanceof(File).optional(),
})
type RestaurantFormData = z.infer<typeof schema>
const icons = [
	{ icon: '🍽️', label: '食器' },
	{ icon: '🍣', label: '寿司' },
	{ icon: '🥩', label: '肉' },
	{ icon: '🍷', label: 'ワイン' },
	{ icon: '🍝', label: 'パスタ' },
	{ icon: '🍜', label: 'ラーメン' },
	{
		icon: '🥘',
		label: '鍋',
	},
	{
		icon: '🍱',
		label: '和食',
	},
	{
		icon: '🥟',
		label: '中華',
	},
	{
		icon: '🍔',
		label: '洋食',
	},
]
export function DialogRestaurantCreate({ open, onOpenChange }: RestaurantFormDialogProps) {
	const [isSubmitting, setIsSubmitting] = React.useState(false)

	const form = useForm({
		resolver: zodResolver(schema),
		mode: 'onChange',
		defaultValues: {
			address: '',
			phone: '',
			url: '',
			icon: '🍽️',
			area: 'GINZA',
			genre: 'SUSHI',
			coverImage: undefined,
			hasPrivateRoom: false,
			smokingAllowed: false,
			priceRange: 'RANGE_20000',
			name: '',
		},
	})
	const onSubmit: SubmitHandler<RestaurantFormData> = async data => {
		setIsSubmitting(true)
		try {
			let coverImageUrl = ''

			if (data.coverImage instanceof File) {
				coverImageUrl = await uploadRestaurantImage(data.coverImage)
			}

			const payload = {
				...data,
				coverImage: coverImageUrl || undefined,
				genres: [data.genre],
			}

			await createRestaurant(payload)
			await queryClient.invalidateQueries({ queryKey: ['restaurants'] })
			onOpenChange(false)
			form.reset()
			toast.success('飲食店を登録しました')
		} catch (err) {
			let errorMessage = '登録に失敗しました'

			if (axios.isAxiosError(err)) {
				const serverData = err.response?.data

				errorMessage = serverData?.error?.message

				console.error('Server xatoligi:', serverData)
			} else if (err instanceof Error) {
				errorMessage = err.message
			}

			toast.error(errorMessage)
		} finally {
			setIsSubmitting(false)
		}
	}
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='px-2 max-w-200' aria-describedby={undefined}>
				<DialogHeader className='px-5'>
					<DialogTitle>新規飲食店登録</DialogTitle>
				</DialogHeader>
				<ScrollArea className='max-h-[75vh]'>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit, onError)}
							className='px-5'
							id='form-create-restaurant'
						>
							<div className='space-y-4'>
								{/* カバー画像 */}
								<div className='space-y-2'>
									<FormField
										control={form.control}
										name='coverImage'
										render={({ field }) => (
											<FormItem>
												<FormLabel>カバー画像</FormLabel>
												<FormControl>
													<div>
														<input
															type='file'
															className='sr-only'
															accept='image/jpeg,image/png,image/webp,image/gif'
															id='cover-image-input'
															onChange={e => {
																const file = e.target.files?.[0]
																const url = file ? URL.createObjectURL(file) : null
																if (file) field.onChange(file)
															}}
														/>
														{field.value instanceof File ? (
															<div className='relative flex items-center justify-center w-full h-32 rounded-lg overflow-hidden bg-zinc-100'>
																<Image
																	src={URL.createObjectURL(field.value)}
																	alt='image restaourant'
																	width={200}
																	height={200}
																	className='w-full h-full object-cover'
																/>
																<ButtonRemoveImage
																	onClick={() => {
																		field.onChange(undefined)
																	}}
																/>
															</div>
														) : (
															<button
																type='button'
																onClick={() =>
																	document.getElementById('cover-image-input')?.click()
																}
																className='flex w-full h-32 items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer'
															>
																<div className='text-center'>
																	<div className='text-2xl mb-1'>📷</div>
																	<div className='text-sm text-zinc-500'>
																		クリックして画像をアップロード
																	</div>
																	<div className='text-xs text-zinc-400 mt-1'>
																		JPEG, PNG, WebP, GIF（最大10MB）
																	</div>
																</div>
															</button>
														)}
													</div>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									{/* 店名 */}
									<FormField
										control={form.control}
										name='name'
										render={({ field }) => (
											<FormItem>
												<FormLabel>店名 *</FormLabel>
												<FormControl>
													<Input {...field} placeholder='例: 銀座 鮨 さいとう' />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name='icon'
										render={({ field }) => (
											<FormItem>
												<FormLabel>アイコン *</FormLabel>
												<FormControl>
													<Select value={field.value} onValueChange={field.onChange}>
														<SelectTrigger>
															<SelectValue placeholder='アイコンを選択' />
														</SelectTrigger>
														<SelectContent>
															{icons.map(i => (
																<SelectItem key={i.label} value={i.icon}>
																	{i.icon} {i.label}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
										<FormField
											control={form.control}
											name='area'
											render={({ field }) => (
												<FormItem>
													<FormLabel>エリア *</FormLabel>
													<FormControl>
														<Select value={field.value} onValueChange={field.onChange}>
															<SelectTrigger>
																<SelectValue placeholder='エリアを選択' />
															</SelectTrigger>
															<SelectContent>
																{AREA_OPTIONS.map(opt => (
																	<SelectItem key={opt.value} value={opt.value}>
																		{opt.label}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name='genre'
											render={({ field }) => (
												<FormItem>
													<FormLabel>ジャンル *</FormLabel>
													<FormControl>
														<Select value={field.value} onValueChange={field.onChange}>
															<SelectTrigger>
																<SelectValue placeholder='ジャンルを選択' />
															</SelectTrigger>
															<SelectContent>
																{GENRE_OPTIONS.map(opt => (
																	<SelectItem key={opt.value} value={opt.value}>
																		{opt.label}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
									<FormField
										control={form.control}
										name='address'
										render={({ field }) => (
											<FormItem>
												<FormLabel>住所</FormLabel>
												<FormControl>
													<Input {...field} placeholder='例: 東京都中央区銀座4-2-15' />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
										<FormField
											control={form.control}
											name='phone'
											render={({ field }) => (
												<FormItem>
													<FormLabel>電話番号</FormLabel>
													<FormControl>
														<Input {...field} placeholder='03-1234-5678' />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name='url'
											render={({ field }) => (
												<FormItem>
													<FormLabel>Google Map URL</FormLabel>
													<FormControl>
														<Input {...field} placeholder='https://maps.app.goo.gl/...' />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
									<FormField
										control={form.control}
										name='priceRange'
										render={({ field }) => (
											<FormItem>
												<FormLabel>価格帯 *</FormLabel>
												<FormControl>
													<Select value={field.value} onValueChange={field.onChange}>
														<SelectTrigger>
															<SelectValue placeholder='価格帯を選択' />
														</SelectTrigger>
														<SelectContent>
															{PRICE_RANGE_OPTIONS.map(opt => (
																<SelectItem key={opt.value} value={opt.value}>
																	{opt.label}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<div className='flex items-center gap-5'>
										<FormField
											control={form.control}
											name='hasPrivateRoom'
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<div className='flex items-center space-x-2'>
															<Checkbox
																onChange={field.onChange}
																defaultChecked={field.value}
																id={'has_private_room_checkbox'}
															/>
															<Label htmlFor='has_private_room_checkbox'>個室あり </Label>
														</div>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name='smokingAllowed'
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<div className='flex items-center space-x-2'>
															<Checkbox onChange={field.onChange} defaultChecked={field.value} />
															<Label htmlFor='smoking_allowed_checkbox'>喫煙可 </Label>
														</div>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</div>
							</div>
						</form>
					</Form>
				</ScrollArea>
				<DialogFooter>
					<Button
						type='button'
						variant='secondary'
						onClick={() => onOpenChange(false)}
						disabled={isSubmitting}
					>
						キャンセル
					</Button>
					<Button type='submit' disabled={isSubmitting} form='form-create-restaurant'>
						{isSubmitting ? <Spinner text={'登録中...'} /> : '登録'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
