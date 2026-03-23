'use client'

import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
	Input,
	InputPassword,
	Label,
	Spinner,
} from '@/components/ui'
import { useAuth } from '@/lib/auth-context'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { toast } from 'sonner'

export default function LoginPage() {
	const router = useRouter()
	const { login, user } = useAuth()
	const [email, setEmail] = React.useState('')
	const [password, setPassword] = React.useState('')
	const [error, setError] = React.useState('')
	const [isLoading, setIsLoading] = React.useState(false)

	// すでにログインしている場合はホームにリダイレクト
	React.useEffect(() => {
		if (user) {
			router.push('/')
		}
	}, [user, router])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		setIsLoading(true)

		try {
			const success = await login(email, password)
			if (success) {
				router.push('/')
				toast.success('ログインに成功しました！')
			} else {
				setError('メールアドレスまたはパスワードが正しくありません')
			}
		} catch (err) {
			// Keep login failure UX consistent across backend error variants.
			if (axios.isAxiosError(err)) {
				setError('ログインに失敗しました。もう一度お試しください。')
			} else {
				setError('ログインに失敗しました。もう一度お試しください。')
			}
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className='flex min-h-screen items-center justify-center bg-background px-4 py-12'>
			<Card className='w-full max-w-md border-border bg-card shadow-lg'>
				<CardHeader className='space-y-1'>
					<div className='mb-2 flex justify-center'>
						<span className='text-4xl'>✨</span>
					</div>
					<CardTitle
						className='text-center text-2xl text-foreground'
						style={{ fontFamily: 'var(--font-logo), serif' }}
					>
						Greet
					</CardTitle>
					<p className='text-center text-sm text-muted-foreground'>接待を、戦略に。</p>
					<CardDescription className='text-center pt-1'>
						アカウント情報を入力してログインしてください
					</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit}>
					<CardContent className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='email' className='text-foreground'>
								メールアドレス
							</Label>
							<Input
								id='email'
								type='email'
								placeholder='example@company.com'
								value={email}
								onChange={e => setEmail(e.target.value)}
								required
								disabled={isLoading}
								className='border-input bg-background'
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='password' className='text-foreground'>
								パスワード
							</Label>
							<InputPassword
								id='password'
								value={password}
								onChange={e => setPassword(e.target.value)}
								required
								disabled={isLoading}
								className='border-input bg-background rounded-2xl'
							/>
						</div>
						{error && (
							<div className='rounded-md bg-destructive/10 p-3 text-sm text-destructive'>
								{error}
							</div>
						)}
					</CardContent>
					<CardFooter className='flex flex-col space-y-4'>
						<Button type='submit' className='w-full' disabled={isLoading}>
							{isLoading ? (
								<span className='flex items-center justify-center gap-2'>
									<Spinner text='ログイン中...' />
								</span>
							) : (
								'ログイン'
							)}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	)
}
