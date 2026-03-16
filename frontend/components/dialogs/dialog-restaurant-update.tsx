import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import {
	deleteRestaurantImage,
	updateRestaurant,
	uploadRestaurantImage,
} from '@/lib/api/restaurants'
import { AREA_OPTIONS, GENRE_OPTIONS, icons, PRICE_RANGE_OPTIONS } from '@/lib/constants'
import { queryClient } from '@/lib/query-client'
import { Restaurant } from '@/lib/types'
import { onError } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { ButtonRemoveImage } from '../button-remove'
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
} from '../ui'
const schema = z.object({
	name: z.string().min(1, '店名は必須です'),
	area: z.enum(AREA_OPTIONS.map(opt => opt.value)),
	genres: z.array(z.enum(GENRE_OPTIONS.map(opt => opt.value))),
	hasPrivateRoom: z.boolean(),
	smokingAllowed: z.boolean(),
	priceRange: z.enum(PRICE_RANGE_OPTIONS.map(opt => opt.value)),
	address: z.string().optional(),
	phone: z.string().optional(),
	url: z.string().url().optional(),
	icon: z.string().optional(),
	coverImage: z.instanceof(File).optional(),
})
type FormValues = z.infer<typeof schema>
export const DialogRestaurantUpdate: React.FC<{
	trigger: React.ReactNode
	restaurant: Restaurant
	id: string
}> = ({ trigger, restaurant, id }) => {
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
	const [isOpen, setIsOpen] = useState<boolean>(false)
	const anchor = useComboboxAnchor()
	const form = useForm({
		resolver: zodResolver(schema),
		mode: 'onChange',
		defaultValues: {
			address: '',
			phone: '',
			url: '',
			icon: '',
			area: 'GINZA',
			genres: [GENRE_OPTIONS[0].value],
			coverImage: undefined,
			hasPrivateRoom: false,
			smokingAllowed: false,
			priceRange: 'RANGE_20000',
			name: '',
		},
	})

	const onSubmit: SubmitHandler<FormValues> = async data => {
		setIsSubmitting(true)
		try {
			let coverImageUrl: string | undefined
			const existingCoverImage =
				typeof restaurant.coverImage === 'string' && restaurant.coverImage.trim().length > 0
					? restaurant.coverImage
					: undefined

			if (data.coverImage instanceof File) {
				coverImageUrl = await uploadRestaurantImage(data.coverImage)
			}

			const { coverImage, ...safeData } = data
			const payload = coverImageUrl ? { ...safeData, coverImage: coverImageUrl } : safeData

			const res = await updateRestaurant(id, payload)

			if (coverImageUrl && existingCoverImage && existingCoverImage !== coverImageUrl) {
				await deleteRestaurantImage(existingCoverImage).catch(() => {})
			}

			toast.success('変更されました。')
			setIsOpen(false)
			queryClient.invalidateQueries({ queryKey: ['restaurant', id] })
		} catch (err) {
			console.log(err)
			toast.error('更新に失敗しました')
		} finally {
			setIsSubmitting(false)
		}
	}
	useEffect(() => {
		if (restaurant) {
			form.reset({
				name: restaurant.name,
				area: restaurant.area,
				address: restaurant.address ?? '',
				phone: restaurant.phone ?? '',
				url: restaurant.url ?? '',
				genres: restaurant.genres,
				hasPrivateRoom: restaurant.hasPrivateRoom,
				smokingAllowed: restaurant.smokingAllowed,
				icon: restaurant.icon ?? '',
				priceRange: restaurant.priceRange,
			})
		}
	}, [restaurant, form])
	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent className='px-2 max-w-200' aria-describedby={undefined}>
				<DialogHeader className='px-5'>
					<DialogTitle>飲食店情報を更新</DialogTitle>
				</DialogHeader>
				<ScrollArea className='max-h-[75vh]'>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit, onError)}
							className='px-5'
							id='form-update-restaurant'
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
																if (file) field.onChange(file)
															}}
														/>
														{field.value instanceof File ? (
															<div className='relative flex items-center justify-center w-full h-32 rounded-lg overflow-hidden bg-zinc-100'>
																<Image
																	src={
																		URL.createObjectURL(field.value)
																			? URL.createObjectURL(field.value)
																			: restaurant.coverImage || ''
																	}
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
											name='genres'
											render={({ field }) => (
												<FormItem>
													<FormLabel>ジャンル *</FormLabel>
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
				<DialogFooter>
					<DialogClose asChild>
						<Button type='button' variant='secondary' disabled={isSubmitting}>
							キャンセル
						</Button>
					</DialogClose>
					<Button type='submit' form='form-update-restaurant' disabled={isSubmitting}>
						{isSubmitting ? <Spinner text={'更新中...'} /> : '更新'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
