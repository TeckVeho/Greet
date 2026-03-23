'use client'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Input,
	Label,
	Spinner,
} from '@/components/ui'
import { Section } from '@/components/ui/section'
import { useAuth } from '@/lib/auth-context'
import { format } from 'date-fns'
import Image from 'next/image'

const ProfileField = ({ label, value }: { label: string; value?: string | Date | null }) => {
	const displayValue = value instanceof Date ? format(value, 'yyyy-MM-dd HH:mm:ss') : (value ?? '-')

	return (
		<div className='space-y-2'>
			<Label>{label}</Label>
			<Input value={displayValue} disabled readOnly />
		</div>
	)
}

export default function Page() {
	const { user, isLoading } = useAuth()
	if (isLoading) {
		return <Spinner type='page-loading' />
	}
	return (
		<Section>
			<div className='mb-8'>
				<div className='mb-2 flex items-center gap-2'>
					<span className='text-2xl md:text-3xl'>🙍</span>
					<h1 className='text-2xl md:text-3xl font-bold '>プロフィール</h1>
				</div>
				<p className='text-sm text-muted-foreground'>ユーザー情報の表示専用ページ</p>
			</div>

			<div className='grid gap-6 lg:grid-cols-3 w-full'>
				<Card className='lg:col-span-1'>
					<CardHeader>
						<CardTitle className='text-lg'>基本情報</CardTitle>
						<CardDescription>プロフィールの概要</CardDescription>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='flex items-center gap-3 rounded-md p-3 border/input bg-background'>
							<div className='flex h-12 w-12 items-center justify-center rounded-full text-xl shadow-sm'>
								{user?.avatar ? (
									<Image src={user?.avatar} alt='Avatar' width={48} height={48} />
								) : (
									user?.icon
								)}
							</div>
							<div>
								<p className='font-medium '>{user?.name}</p>
								<p className='text-sm text-muted-foreground'>{user?.email}</p>
							</div>
						</div>

						<ProfileField label='ロール' value={user?.role} />
						<ProfileField label='部署' value={user?.department} />
					</CardContent>
				</Card>

				<Card className='lg:col-span-2'>
					<CardHeader>
						<CardTitle className='text-lg'>詳細情報</CardTitle>
						<CardDescription>すべての項目は読み取り専用です</CardDescription>
					</CardHeader>
					<CardContent className='grid gap-4 md:grid-cols-2'>
						<ProfileField label='名前' value={user?.name} />
						<ProfileField label='メールアドレス' value={user?.email} />
						<ProfileField label='アイコン' value={user?.icon} />
						<ProfileField label='会社コード' value={user?.company?.code} />
						<div className='md:col-span-2'>
							<ProfileField label='会社名' value={user?.company?.name} />
						</div>
						<ProfileField label='作成日時' value={user?.createdAt} />
						<ProfileField label='最終ログイン' value={user?.lastLogin} />
					</CardContent>
				</Card>
			</div>
		</Section>
	)
}
