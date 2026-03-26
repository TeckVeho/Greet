'use client'

import {
	Button,
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Form as FormUi,
	Input,
	InputPassword,
	ScrollArea,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui'
import { useCompanies } from '@/hooks/use-companies'
import { useCreateUser, useUpdateUser } from '@/hooks/use-users'

import { UserFormDialogProps } from '@/lib/types'
import { onError } from '@/lib/utils'
import { schemaCreate, schemaUpdate } from '@/schemas/user.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import * as React from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import z from 'zod'
import { ButtonRemoveImage } from '../button-remove'

export type UserCreateFormData = z.infer<typeof schemaCreate>
export type UserUpdateFormData = z.infer<typeof schemaUpdate>
export function DialogUserCreateOrUpdate({ mode, user, trigger }: UserFormDialogProps) {
	const [open, setOpen] = React.useState(false)
	const { data: companiesData, isPending: isPendingCompanies } = useCompanies()
	const { mutateAsync: createUser, isPending: creating } = useCreateUser()
	const { mutateAsync: updateUser, isPending: updating } = useUpdateUser(user?.id)
	const formCreateUser = useForm<UserCreateFormData>({
		mode: 'onSubmit',
		defaultValues: {
			name: '',
			email: '',
			password: '',
			role: 'user',
			department: '',
			companyId: '',
		},
		resolver: zodResolver(schemaCreate),
	})
	const formUpdateUser = useForm<UserUpdateFormData>({
		mode: 'onChange',
		defaultValues: {
			name: '',
			email: '',
			role: 'user',
			department: '',
			companyId: '',
		},
		resolver: zodResolver(schemaUpdate),
	})

	React.useEffect(() => {
		if (mode === 'update' && user) {
			formUpdateUser.reset({
				avatar: user.avatar,
				name: user.name,
				email: user.email,
				role: user.role,
				department: user.department,
				companyId: user.companyId,
			})
		} else {
			formCreateUser.reset({
				name: '',
				email: '',
				password: '',
				role: 'user',
				department: '',
				companyId: '',
			})
		}
	}, [mode, user])
	const isUpdate = mode === 'update'
	const form = isUpdate ? formUpdateUser : (formCreateUser as UseFormReturn<any>)
	const fileInputRef = React.useRef<HTMLInputElement>(null)
	const onSubmit = (data: any) => {
		const formData = new FormData()

		// Hamma fieldlarni FormData ga solamiz
		Object.keys(data).forEach(key => {
			if (data[key] !== undefined) {
				formData.append(key, data[key])
			}
		})
		if (isUpdate) {
			updateUser(formData, {
				onSuccess: () => {
					formUpdateUser.reset()
					setOpen(false)
				},
			})
		} else {
			createUser(formData, {
				onSuccess: () => {
					formCreateUser.reset()
					setOpen(false)
				},
			})
		}
	}
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
			<DialogContent aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle>{mode === 'create' ? '新規ユーザー登録' : 'ユーザー情報編集'}</DialogTitle>
				</DialogHeader>
				<FormUi {...form}>
					<form
						onSubmit={
							mode === 'update'
								? formUpdateUser.handleSubmit(onSubmit, onError)
								: formCreateUser.handleSubmit(onSubmit, onError)
						}
					>
						<ScrollArea className='max-h-[75vh]'>
							<DialogBody>
								<div className='space-y-4'>
									{/* avatar */}
									<FormField
										control={form.control}
										name='avatar'
										render={({ field }) => (
											<FormItem>
												<FormLabel>プロフィール画像</FormLabel>
												<FormControl>
													<div>
														<input
															ref={fileInputRef}
															type='file'
															className='sr-only'
															accept='image/jpeg,image/png,image/webp,image/gif'
															id='avatar-input'
															onChange={e => field.onChange(e.target.files?.[0])}
														/>
														{/* uploaded image */}
														{field.value instanceof File ? (
															<div className='relative flex items-center justify-center w-full h-32 rounded-lg overflow-hidden'>
																<Image
																	src={URL.createObjectURL(field.value)}
																	alt='image restaourant'
																	width={200}
																	height={200}
																	className='w-full h-full object-cover'
																/>
																<ButtonRemoveImage
																	onClick={() => {
																		field.onChange(null)
																		if (fileInputRef.current) {
																			fileInputRef.current.value = ''
																		}
																	}}
																/>
															</div>
														) : // update時の既存画像
														typeof field.value === 'string' ? (
															<div className='relative flex items-center justify-center w-full h-32 rounded-lg overflow-hidden bg-zinc-100'>
																<img
																	src={field.value}
																	alt='image restaourant'
																	width={200}
																	height={200}
																	className='w-full h-full object-cover'
																/>
																<ButtonRemoveImage
																	onClick={() => {
																		field.onChange(null)
																		if (fileInputRef.current) {
																			fileInputRef.current.value = ''
																		}
																	}}
																/>
															</div>
														) : (
															<button
																type='button'
																onClick={() => document.getElementById('avatar-input')?.click()}
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
									{/* 名前 */}
									<FormField
										control={form.control}
										name='name'
										render={({ field }) => (
											<FormItem>
												<FormLabel required>お名前</FormLabel>
												<FormControl>
													<Input {...field} placeholder='例: 山田太郎' required />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									{/* メールアドレス */}
									<FormField
										control={form.control}
										name='email'
										render={({ field }) => (
											<FormItem>
												<FormLabel required>メールアドレス</FormLabel>
												<FormControl>
													<Input
														{...field}
														type='email'
														placeholder='yamada@example.com'
														required
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<div className='flex items-center gap-4'>
										{/* 部署 */}
										<FormField
											control={form.control}
											name='department'
											render={({ field }) => (
												<FormItem className='flex-1'>
													<FormLabel>部署</FormLabel>
													<FormControl>
														<Input {...field} type='text' placeholder='営業部' />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
									<div className='flex items-center gap-4'>
										{/* 所属会社 */}
										<FormField
											control={form.control}
											name='companyId'
											render={({ field }) => (
												<FormItem className='flex-1'>
													<FormLabel required>所属会社</FormLabel>
													<FormControl>
														<Select value={field.value} onValueChange={field.onChange}>
															<SelectTrigger className='m-0'>
																<SelectValue placeholder='会社を選択' />
															</SelectTrigger>
															<SelectContent className='max-h-70'>
																{isPendingCompanies
																	? 'Loading...'
																	: companiesData?.companies.map(company => (
																			<SelectItem key={company.id} value={company.id}>
																				{company.icon} {company.name}
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
											name='role'
											render={({ field }) => (
												<FormItem className='flex-1'>
													<FormLabel required>ユーザー権限</FormLabel>
													<FormControl>
														<Select value={field.value} onValueChange={field.onChange}>
															<SelectTrigger className='mb-0'>
																<SelectValue placeholder='権限を選択' />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value='user'>一般ユーザー</SelectItem>
																<SelectItem value='admin'>管理者</SelectItem>
															</SelectContent>
														</Select>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									{/* パスワード（新規作成時のみ） */}
									{mode === 'create' && (
										<FormField
											control={formCreateUser.control}
											name='password'
											render={({ field }) => (
												<FormItem>
													<FormLabel required>パスワード</FormLabel>
													<FormControl>
														<InputPassword {...field} placeholder='6文字以上' required />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									)}
								</div>
							</DialogBody>
						</ScrollArea>

						<DialogFooter className='max-sm:gap-3 mt-5'>
							<Button
								type='button'
								variant='secondary'
								onClick={() => setOpen(false)}
								disabled={creating || updating}
							>
								キャンセル
							</Button>
							<Button type='submit' disabled={creating || updating}>
								{creating || updating ? '保存中...' : mode === 'create' ? '登録' : '更新'}
							</Button>
						</DialogFooter>
					</form>
				</FormUi>
			</DialogContent>
		</Dialog>
	)
}
