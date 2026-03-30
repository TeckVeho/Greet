'use client'

import {
	Button,
	Checkbox,
	Combobox,
	ComboboxChip,
	ComboboxChips,
	ComboboxChipsInput,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxItem,
	ComboboxList,
	ComboboxValue,
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
	useComboboxAnchor,
} from '@/components/ui'
import { createRestaurant, uploadRestaurantImage } from '@/lib/api/restaurants'
import { AREA_OPTIONS, GENRE_OPTIONS, icons, PRICE_RANGE_OPTIONS } from '@/lib/constants'
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

const optionalText = z.union([z.string(), z.undefined()]).transform(value => {
	if (typeof value !== 'string') return undefined
	const trimmed = value.trim()
	return trimmed.length > 0 ? trimmed : undefined
})

const optionalPhone = z
	.union([z.string(), z.undefined()])
	.refine(value => {
		if (typeof value !== 'string') return true
		if (value.trim().length === 0) return true
		return /^[0-9()+\-\s]{8,20}$/.test(value)
	}, '電話番号の形式が正しくありません')
	.transform(value => {
		if (typeof value !== 'string') return undefined
		const trimmed = value.trim()
		return trimmed.length > 0 ? trimmed : undefined
	})

const optionalUrl = z
	.union([z.string(), z.undefined()])
	.refine(value => {
		if (typeof value !== 'string') return true
		if (value.trim().length === 0) return true
		return z.string().url().safeParse(value).success
	}, '有効なURLを入力してください')
	.transform(value => {
		if (typeof value !== 'string') return undefined
		const trimmed = value.trim()
		return trimmed.length > 0 ? trimmed : undefined
	})

const schema = z.object({
	name: z.string().min(1, '店名は必須です'),
	area: z.enum(AREA_OPTIONS.map(opt => opt.value)),
	genres: z.array(z.enum(GENRE_OPTIONS.map(opt => opt.value))),
	hasPrivateRoom: z.boolean(),
	smokingAllowed: z.boolean(),
	priceRange: z.enum(PRICE_RANGE_OPTIONS.map(opt => opt.value)),
	address: optionalText,
	phone: optionalPhone,
	url: optionalUrl,
	icon: optionalText,
	coverImage: z.instanceof(File).optional(),
})
type RestaurantFormData = z.infer<typeof schema>
type RestaurantFormInput = z.input<typeof schema>

export function DialogRestaurantCreate({ open, onOpenChange }: RestaurantFormDialogProps) {
	const [isSubmitting, setIsSubmitting] = React.useState(false)
	const anchor = useComboboxAnchor()
	const form = useForm<RestaurantFormInput, any, RestaurantFormData>({
		resolver: zodResolver(schema),
		mode: 'onChange',
		defaultValues: {
			address: '',
			phone: '',
			url: '',
			icon: '🍽️',
			area: 'GINZA',
			genres: [GENRE_OPTIONS[0].value],
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
															<div className='relative flex items-center justify-center w-full h-32 rounded-lg overflow-hidden '>
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
																className='flex w-full h-32 rounded-lg border border-dashed bg-accent transition-colors cursor-pointer items-center justify-center'
															>
																<div className='text-center'>
																	<div className='text-2xl mb-1'>📷</div>
																	<div className='text-sm text-muted-foreground'>
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
												<FormLabel required>店名</FormLabel>
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
												<FormLabel required>アイコン</FormLabel>
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
													<FormLabel required>エリア</FormLabel>
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
											name='genres'
											render={({ field }) => (
												<FormItem>
													<FormLabel required>ジャンル</FormLabel>
													<FormControl>
														<Combobox
															multiple
															autoHighlight
															items={GENRE_OPTIONS}
															onValueChange={values => {
																field.onChange(values)
															}}
															value={field.value}
														>
															<ComboboxChips ref={anchor} className='w-full'>
																<ComboboxValue>
																	{items => (
																		<>
																			{items.map((item: string) => {
																				const label =
																					GENRE_OPTIONS.find(opt => opt.value === item)?.label ??
																					item
																				return (
																					<ComboboxChip key={item} onClick={() => {}}>
																						{label}
																					</ComboboxChip>
																				)
																			})}
																			<ComboboxChipsInput />
																		</>
																	)}
																</ComboboxValue>
															</ComboboxChips>
															<ComboboxContent anchor={anchor}>
																<ComboboxEmpty>No items found.</ComboboxEmpty>
																<ComboboxList>
																	{item => (
																		<ComboboxItem key={item.value} value={item.value}>
																			{item.label}
																		</ComboboxItem>
																	)}
																</ComboboxList>
															</ComboboxContent>
														</Combobox>
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
												<FormLabel required>価格帯</FormLabel>
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
																onCheckedChange={field.onChange}
																checked={field.value}
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
															<Checkbox onCheckedChange={field.onChange} checked={field.value} />
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
				<DialogFooter className='max-sm:gap-3'>
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
