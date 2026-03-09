'use client'

import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { createRestaurant, deleteRestaurantImage, uploadRestaurantImage } from '@/lib/api/restaurants'
import {
	AREA_OPTIONS,
	GENRE_OPTIONS,
	PRICE_RANGE_OPTIONS,
} from '@/lib/constants'
import { useAuth } from '@/lib/auth-context'
import * as React from 'react'
import Image from 'next/image'
import { useQueryClient } from '@tanstack/react-query'

interface RestaurantFormDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	mode: 'create' | 'edit'
	onSuccess?: () => void
}

export function RestaurantFormDialog({
	open,
	onOpenChange,
	mode,
	onSuccess,
}: RestaurantFormDialogProps) {
	const { user } = useAuth()
	const queryClient = useQueryClient()
	const [isSubmitting, setIsSubmitting] = React.useState(false)
	const [isUploading, setIsUploading] = React.useState(false)
	const [error, setError] = React.useState<string | null>(null)
	const fileInputRef = React.useRef<HTMLInputElement>(null)

	const [formData, setFormData] = React.useState({
		name: '',
		area: 'GINZA',
		genre: 'SUSHI',
		hasPrivateRoom: false,
		priceRange: 'RANGE_20000',
		address: '',
		phone: '',
		url: '',
		smokingAllowed: false,
		icon: '🍽️',
		coverImage: '',
	})

	// Local preview before upload completes
	const [imagePreview, setImagePreview] = React.useState<string | null>(null)

	React.useEffect(() => {
		if (open) {
			setFormData({
				name: '',
				area: 'GINZA',
				genre: 'SUSHI',
				hasPrivateRoom: false,
				priceRange: 'RANGE_20000',
				address: '',
				phone: '',
				url: '',
				smokingAllowed: false,
				icon: '🍽️',
				coverImage: '',
			})
			setImagePreview(null)
			setError(null)
		}
	}, [open])

	const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		// Show local preview immediately
		const localUrl = URL.createObjectURL(file)
		setImagePreview(localUrl)
		setIsUploading(true)
		setError(null)

		try {
			// Delete old image from S3 if replacing
			if (formData.coverImage) {
				await deleteRestaurantImage(formData.coverImage).catch(() => {})
			}

			const uploadedUrl = await uploadRestaurantImage(file)
			setFormData(prev => ({ ...prev, coverImage: uploadedUrl }))
			setImagePreview(null) // Clear local preview, use uploaded URL
		} catch (err) {
			setError(err instanceof Error ? err.message : '画像のアップロードに失敗しました')
			setImagePreview(null)
		} finally {
			setIsUploading(false)
			// Reset input so the same file can be re-selected
			if (fileInputRef.current) fileInputRef.current.value = ''
		}
	}

	const handleImageRemove = async () => {
		if (formData.coverImage) {
			try {
				await deleteRestaurantImage(formData.coverImage)
			} catch {
				// Best effort — don't block the user
			}
		}
		setFormData(prev => ({ ...prev, coverImage: '' }))
		setImagePreview(null)
		if (fileInputRef.current) fileInputRef.current.value = ''
	}

	const displayImage = imagePreview || formData.coverImage || null

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!user) return

		setIsSubmitting(true)
		setError(null)

		try {
			await createRestaurant({
				name: formData.name,
				area: formData.area,
				hasPrivateRoom: formData.hasPrivateRoom,
				smokingAllowed: formData.smokingAllowed,
				priceRange: formData.priceRange,
				address: formData.address || undefined,
				phone: formData.phone || undefined,
				url: formData.url || undefined,
				coverImage: formData.coverImage || undefined,
				icon: formData.icon || undefined,
				genres: [formData.genre],
			})

			await queryClient.invalidateQueries({ queryKey: ['restaurants'] })
			onOpenChange(false)
			onSuccess?.()
		} catch (err) {
			setError(err instanceof Error ? err.message : '登録に失敗しました')
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
	) => {
		const { name, value, type } = e.target
		setFormData(prev => ({
			...prev,
			[name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
		}))
	}

	const handleSelectChange = (name: string, value: string) => {
		setFormData(prev => ({ ...prev, [name]: value }))
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{mode === 'create' ? '新規飲食店登録' : '飲食店情報編集'}</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit}>
					<div>
						<div className='space-y-4'>
							{/* カバー画像 */}
							<div className='space-y-2'>
								<Label>カバー画像</Label>
								{displayImage ? (
									<div className='relative w-full h-48 rounded-lg overflow-hidden bg-zinc-100'>
										<Image
											src={displayImage}
											alt='カバー画像プレビュー'
											fill
											className='object-cover'
											unoptimized
										/>
										{isUploading && (
											<div className='absolute inset-0 bg-black/40 flex items-center justify-center'>
												<div className='text-white text-sm font-medium'>アップロード中...</div>
											</div>
										)}
										<div className='absolute top-2 right-2 flex gap-2'>
											<button
												type='button'
												onClick={() => fileInputRef.current?.click()}
												disabled={isUploading}
												className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-sm transition-colors text-sm'
												title='画像を変更'
											>
												✏️
											</button>
											<button
												type='button'
												onClick={handleImageRemove}
												disabled={isUploading}
												className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-sm transition-colors text-sm'
												title='画像を削除'
											>
												🗑️
											</button>
										</div>
									</div>
								) : (
									<button
										type='button'
										onClick={() => fileInputRef.current?.click()}
										disabled={isUploading}
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
								<input
									ref={fileInputRef}
									type='file'
									accept='image/jpeg,image/png,image/webp,image/gif'
									onChange={handleImageSelect}
									className='hidden'
								/>
							</div>

							{/* 店名 */}
							<div className='space-y-2'>
								<Label htmlFor='name'>店名 *</Label>
								<Input
									id='name'
									name='name'
									value={formData.name}
									onChange={handleChange}
									placeholder='例: 銀座 鮨 さいとう'
									required
								/>
							</div>

							{/* アイコン */}
							<div className='space-y-2'>
								<Label htmlFor='icon'>アイコン</Label>
								<Select
									value={formData.icon}
									onValueChange={value => handleSelectChange('icon', value)}
								>
									<SelectTrigger>
										<SelectValue placeholder='アイコンを選択' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='🍽️'>🍽️ 食器</SelectItem>
										<SelectItem value='🍣'>🍣 寿司</SelectItem>
										<SelectItem value='🥩'>🥩 肉</SelectItem>
										<SelectItem value='🍷'>🍷 ワイン</SelectItem>
										<SelectItem value='🍝'>🍝 パスタ</SelectItem>
										<SelectItem value='🍜'>🍜 ラーメン</SelectItem>
										<SelectItem value='🥘'>🥘 鍋</SelectItem>
										<SelectItem value='🍱'>🍱 和食</SelectItem>
										<SelectItem value='🥟'>🥟 中華</SelectItem>
										<SelectItem value='🍔'>🍔 洋食</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* エリアとジャンル */}
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='area'>エリア *</Label>
									<Select
										value={formData.area}
										onValueChange={value => handleSelectChange('area', value)}
									>
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
								</div>

								<div className='space-y-2'>
									<Label htmlFor='genre'>ジャンル *</Label>
									<Select
										value={formData.genre}
										onValueChange={value => handleSelectChange('genre', value)}
									>
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
								</div>
							</div>

							{/* 住所 */}
							<div className='space-y-2'>
								<Label htmlFor='address'>住所</Label>
								<Input
									id='address'
									name='address'
									value={formData.address}
									onChange={handleChange}
									placeholder='例: 東京都中央区銀座4-2-15'
								/>
							</div>

							{/* 電話番号とURL */}
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='phone'>電話番号</Label>
									<Input
										id='phone'
										name='phone'
										value={formData.phone}
										onChange={handleChange}
										placeholder='03-1234-5678'
									/>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='url'>Google Map URL</Label>
									<Input
										id='url'
										name='url'
										type='url'
										value={formData.url}
										onChange={handleChange}
										placeholder='https://maps.app.goo.gl/...'
									/>
								</div>
							</div>

							{/* 価格帯 */}
							<div className='space-y-2'>
								<Label htmlFor='priceRange'>価格帯 *</Label>
								<Select
									value={formData.priceRange}
									onValueChange={value => handleSelectChange('priceRange', value)}
								>
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
							</div>

							{/* チェックボックス */}
							<div className='flex gap-6'>
								<div className='flex items-center gap-2'>
									<input
										type='checkbox'
										id='hasPrivateRoom'
										name='hasPrivateRoom'
										checked={formData.hasPrivateRoom}
										onChange={handleChange}
										className='h-4 w-4 rounded border-zinc-300'
									/>
									<Label htmlFor='hasPrivateRoom' className='cursor-pointer'>
										個室あり
									</Label>
								</div>

								<div className='flex items-center gap-2'>
									<input
										type='checkbox'
										id='smokingAllowed'
										name='smokingAllowed'
										checked={formData.smokingAllowed}
										onChange={handleChange}
										className='h-4 w-4 rounded border-zinc-300'
									/>
									<Label htmlFor='smokingAllowed' className='cursor-pointer'>
										喫煙可
									</Label>
								</div>
							</div>

							{error && (
								<p className='text-sm text-red-600'>{error}</p>
							)}
						</div>
					</div>

					<DialogFooter>
						<Button
							type='button'
							variant='secondary'
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}
						>
							キャンセル
						</Button>
						<Button type='submit' disabled={isSubmitting}>
							{isSubmitting ? '登録中...' : mode === 'create' ? '登録' : '更新'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
