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
import { Restaurant } from '@/lib/types'
import * as React from 'react'

interface RestaurantFormDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	restaurant?: Restaurant
	mode: 'create' | 'edit'
}

export function RestaurantFormDialog({
	open,
	onOpenChange,
	restaurant,
	mode,
}: RestaurantFormDialogProps) {
	const [formData, setFormData] = React.useState({
		name: restaurant?.name || '',
		area: restaurant?.area || '銀座',
		genres: restaurant?.genres[0] || '寿司',
		hasPrivateRoom: restaurant?.hasPrivateRoom || false,
		priceRange: restaurant?.priceRange || '¥10,000~¥20,000',
		address: restaurant?.address || '',
		phone: restaurant?.phone || '',
		url: restaurant?.url || '',
		smokingAllowed: restaurant?.smokingAllowed || false,
		icon: restaurant?.icon || '🍽️',
	})

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		// TODO: 実際のデータ保存処理
		console.log('Form submitted:', formData)
		onOpenChange(false)
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
		setFormData(prev => ({
			...prev,
			[name]: value,
		}))
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
											<SelectItem value='銀座'>銀座</SelectItem>
											<SelectItem value='赤坂'>赤坂</SelectItem>
											<SelectItem value='六本木'>六本木</SelectItem>
											<SelectItem value='新橋'>新橋</SelectItem>
											<SelectItem value='麻布'>麻布</SelectItem>
											<SelectItem value='恵比寿'>恵比寿</SelectItem>
											<SelectItem value='表参道'>表参道</SelectItem>
											<SelectItem value='その他'>その他</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='genres'>ジャンル *</Label>
									<Select
										value={formData.genres}
										onValueChange={value => handleSelectChange('genres', value)}
									>
										<SelectTrigger>
											<SelectValue placeholder='ジャンルを選択' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='寿司'>寿司</SelectItem>
											<SelectItem value='和食'>和食</SelectItem>
											<SelectItem value='フレンチ'>フレンチ</SelectItem>
											<SelectItem value='イタリアン'>イタリアン</SelectItem>
											<SelectItem value='焼肉'>焼肉</SelectItem>
											<SelectItem value='中華'>中華</SelectItem>
											<SelectItem value='天ぷら'>天ぷら</SelectItem>
											<SelectItem value='割烹'>割烹</SelectItem>
											<SelectItem value='鉄板焼き'>鉄板焼き</SelectItem>
											<SelectItem value='その他'>その他</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							{/* 住所 */}
							<div className='space-y-2'>
								<Label htmlFor='address'>住所 *</Label>
								<Input
									id='address'
									name='address'
									value={formData.address}
									onChange={handleChange}
									placeholder='例: 東京都中央区銀座4-2-15'
									required
								/>
							</div>

							{/* 電話番号とURL */}
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='phone'>電話番号 *</Label>
									<Input
										id='phone'
										name='phone'
										value={formData.phone}
										onChange={handleChange}
										placeholder='03-1234-5678'
										required
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
										<SelectItem value='¥3,000~¥5,000'>¥3,000~¥5,000</SelectItem>
										<SelectItem value='¥5,000~¥10,000'>¥5,000~¥10,000</SelectItem>
										<SelectItem value='¥10,000~¥20,000'>¥10,000~¥20,000</SelectItem>
										<SelectItem value='¥20,000~¥30,000'>¥20,000~¥30,000</SelectItem>
										<SelectItem value='¥30,000~'>¥30,000~</SelectItem>
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
						</div>
					</div>

					<DialogFooter>
						<Button type='button' variant='secondary' onClick={() => onOpenChange(false)}>
							キャンセル
						</Button>
						<Button type='submit'>{mode === 'create' ? '登録' : '更新'}</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
