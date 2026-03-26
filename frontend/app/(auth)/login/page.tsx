'use client'

import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	Input,
	InputPassword,
	Label,
	Spinner,
} from '@/components/ui'
import { useAuth } from '@/lib/auth-context'
import axios from 'axios'
import Image from 'next/image'
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
		<div className='relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12 bg-gradient-to-br from-amber-50 via-orange-50/40 to-stone-100 dark:from-stone-950 dark:via-stone-900 dark:to-neutral-950'>
			{/* Warm ambient glow — top-right */}
			<div className='pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full bg-amber-200/50 blur-[120px] dark:bg-amber-900/20' />
			{/* Warm ambient glow — bottom-left */}
			<div className='pointer-events-none absolute -bottom-40 -left-40 h-[560px] w-[560px] rounded-full bg-orange-200/40 blur-[120px] dark:bg-orange-900/15' />
			{/* Subtle center glow */}
			<div className='pointer-events-none absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-100/60 blur-[90px] dark:bg-amber-950/30' />

			<Card className='relative z-10 w-full max-w-md border-white/40 bg-white/75 shadow-2xl backdrop-blur-md dark:border-white/10 dark:bg-stone-900/70'>
				<CardHeader className='space-y-1 pb-8 pt-10'>
					{/* Logo + tagline grouped tightly together */}
					<div className='flex flex-col items-center -space-y-5'>
						<Image
							src='/newlogogreet.png'
							alt='Greet'
							width={220}
							height={147}
							className='block h-auto w-[220px] -mb-8'
							priority
						/>
						<p
							className='text-center text-sm font-semibold tracking-widest -mt-3'
							style={{ color: '#7C4F2A' }}
						>
							接待を、戦略に。
						</p>
					</div>
					<CardDescription className='text-center'>
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
								className='border-input bg-background/80'
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
								className='border-input bg-background/80 rounded-2xl'
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
