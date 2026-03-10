import {
	Button,
	Dialog,
	DialogBody,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui'
import { useCompanies } from '@/hooks/use-companies'
import { updateUser } from '@/lib/api/users'
import { User } from '@/lib/types'
import { onError } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { SubmitHandler, useForm } from 'react-hook-form'
import { z } from 'zod'

const formSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters long'),
	email: z.string().email('Invalid email address'),
	role: z.enum(['user', 'admin'], 'Role must be either user or admin'),
	icon: z.string().optional(),
	companyId: z.string(),
})
type FormValues = z.infer<typeof formSchema>
export const DialogUpdateUser: React.FC<{ user_data: User; trigger: React.ReactNode }> = ({
	user_data,
	trigger,
}) => {
	const { data: companies } = useCompanies()
	const form = useForm<FormValues>({
		mode: 'onChange',
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: user_data.name,
			email: user_data.email,
			role: user_data.role,
			icon: user_data.icon || '',
			companyId: user_data.companyId || '',
		},
	})
	const onSubmit: SubmitHandler<FormValues> = data => {
		updateUser(user_data.id, data)
	}
	return (
		<Dialog>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>ユーザー情報を更新</DialogTitle>
					<DialogDescription>以下のユーザー情報をお書き換えください。</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit, onError)}>
						<DialogBody className='grid grid-cols-2 gap-3'>
							<FormField
								control={form.control}
								name='name'
								render={({ field }) => (
									<FormItem>
										<FormLabel>お名前</FormLabel>
										<FormControl>
											<Input {...field} placeholder='Enter your name' autoComplete='off' />
										</FormControl>
										{/* <FormDescription>Provide your full name.</FormDescription> */}
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='email'
								render={({ field }) => (
									<FormItem>
										<FormLabel>メールアドレス</FormLabel>
										<FormControl>
											<Input {...field} placeholder='Enter your email' autoComplete='off' />
										</FormControl>
										{/* <FormDescription>Provide your full name.</FormDescription> */}
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='icon'
								render={({ field }) => (
									<FormItem>
										<FormLabel>アイコン</FormLabel>
										<FormControl>
											<Input {...field} placeholder='Enter icon URL' autoComplete='off' />
										</FormControl>
										{/* <FormDescription>Provide your full name.</FormDescription> */}
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='role'
								render={({ field }) => (
									<FormItem>
										<FormLabel>ロール</FormLabel>
										<FormControl>
											<Select onValueChange={field.onChange} value={field.value}>
												<SelectTrigger className='w-full'>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectGroup>
														<SelectItem value='user'>ユーザ</SelectItem>
														<SelectItem value='admin'>アドミン</SelectItem>
													</SelectGroup>
												</SelectContent>
											</Select>
										</FormControl>
										{/* <FormDescription>Provide your full name.</FormDescription> */}
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='companyId'
								render={({ field }) => (
									<FormItem>
										<FormLabel>会社</FormLabel>
										<FormControl>
											<Select onValueChange={field.onChange} value={field.value}>
												<SelectTrigger className='w-full'>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectGroup>
														{companies?.companies.map(company => (
															<SelectItem key={company.id} value={company.id}>
																{company.icon} {company.name}
															</SelectItem>
														))}
													</SelectGroup>
												</SelectContent>
											</Select>
										</FormControl>
										{/* <FormDescription>Provide your full name.</FormDescription> */}
										<FormMessage />
									</FormItem>
								)}
							/>
						</DialogBody>
						<DialogFooter>
							<Button type='submit'>更新</Button>
							<DialogClose asChild id='dialog-update-user-close-button'>
								<Button type='button' variant='secondary'>
									キャンセル
								</Button>
							</DialogClose>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
