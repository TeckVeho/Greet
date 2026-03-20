'use client'

import {
	Button,
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Form as FormUi,
	Input,
	InputPassword,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui'

import { UserFormDialogProps } from '@/lib/types'
import { onError } from '@/lib/utils'
import { schemaCreate, schemaUpdate } from '@/schemas/user.schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import * as React from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import z from 'zod'

type UserFormData = z.infer<typeof schemaCreate | typeof schemaUpdate>
export function DialogUserCreate({
	open,
	onOpenChange,
	mode,
	user,
	onSave,
	companies = [],
	isSaving = false,
}: UserFormDialogProps) {
	const formCreateUser = useForm<UserFormData>({
		mode: 'onChange',
		defaultValues: {
			name: '',
			email: '',
			password: '',
			role: 'user',
			department: '',
			companyId: '',
		},
		resolver: zodResolver(mode === 'create' ? schemaCreate : schemaUpdate),
	})
	const formUpdateUser = useForm<UserFormData>({
		mode: 'onChange',
		defaultValues: {
			name: '',
			email: '',
			role: 'user',
			department: '',
			companyId: '',
		},
		resolver: zodResolver(mode === 'create' ? schemaCreate : schemaUpdate),
	})

	React.useEffect(() => {
		if (mode === 'edit' && user) {
			formUpdateUser.reset({
				name: user.name,
				email: user.email,
				password: '',
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
	}, [mode, user, open])

	const onSubmit: SubmitHandler<UserFormData> = data => {
		onSave(data)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle>{mode === 'create' ? '新規ユーザー登録' : 'ユーザー情報編集'}</DialogTitle>
				</DialogHeader>
				<FormUi {...(mode === 'edit' ? formUpdateUser : formCreateUser)}>
					<form
						onSubmit={
							mode === 'edit'
								? formUpdateUser.handleSubmit(onSubmit, onError)
								: formCreateUser.handleSubmit(onSubmit, onError)
						}
					>
						<DialogBody>
							<div className='space-y-4'>
								{/* 名前 */}
								<FormField
									control={mode === 'edit' ? formUpdateUser.control : formCreateUser.control}
									name='name'
									render={({ field }) => (
										<FormItem>
											<FormLabel required>名前</FormLabel>
											<FormControl>
												<Input {...field} placeholder='例: 山田太郎' required />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								{/* メールアドレス */}
								<FormField
									control={mode === 'edit' ? formUpdateUser.control : formCreateUser.control}
									name='email'
									render={({ field }) => (
										<FormItem>
											<FormLabel required>メールアドレス</FormLabel>
											<FormControl>
												<Input {...field} type='email' placeholder='yamada@example.com' required />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className='flex items-center gap-4'>
									{/* 所属会社 */}
									<FormField
										control={mode === 'edit' ? formUpdateUser.control : formCreateUser.control}
										name='companyId'
										render={({ field }) => (
											<FormItem className='flex-1'>
												<FormLabel required>所属会社</FormLabel>
												<FormControl>
													<Select value={field.value} onValueChange={field.onChange}>
														<SelectTrigger className='mb-0'>
															<SelectValue placeholder='会社を選択' />
														</SelectTrigger>
														<SelectContent>
															{companies.map(company => (
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

									{/* 部署 */}
									<FormField
										control={mode === 'edit' ? formUpdateUser.control : formCreateUser.control}
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
								{/* 権限 */}
								<FormField
									control={mode === 'edit' ? formUpdateUser.control : formCreateUser.control}
									name='role'
									render={({ field }) => (
										<FormItem className='flex-1'>
											<FormLabel required>ユーザー権限</FormLabel>
											<FormControl>
												<Select value={field.value} onValueChange={field.onChange}>
													<SelectTrigger>
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

								{/* パスワード（新規作成時のみ） */}
								{mode === 'create' && (
									<FormField
										control={formCreateUser.control}
										name='password'
										render={({ field }) => (
											<FormItem className='flex-1'>
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

						<DialogFooter>
							<Button
								type='button'
								variant='secondary'
								onClick={() => onOpenChange(false)}
								disabled={isSaving}
							>
								キャンセル
							</Button>
							<Button type='submit' disabled={isSaving}>
								{isSaving ? '保存中...' : mode === 'create' ? '登録' : '更新'}
							</Button>
						</DialogFooter>
					</form>
				</FormUi>
			</DialogContent>
		</Dialog>
	)
}
