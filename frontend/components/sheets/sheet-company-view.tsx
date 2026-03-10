'use client'

import {
	Input,
	Label,
	Separator,
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui'
import { Company } from '@/lib/types'
import { format } from 'date-fns'
import { Building2, Calendar, Hash, Tag } from 'lucide-react'
import { ReactNode } from 'react'

export const SheetCompanyView: React.FC<{ trigger: ReactNode; company_data: Company | null }> = ({
	trigger,
	company_data,
}) => {
	if (!company_data) return null

	return (
		<Sheet>
			<SheetTrigger asChild>{trigger}</SheetTrigger>
			<SheetContent className='sm:max-w-md border-l border-border bg-background'>
				<SheetHeader className='space-y-2 pb-6'>
					<div className='flex items-center gap-2 text-primary'>
						<Building2 className='h-5 w-5' />
						<SheetTitle className='text-xl font-bold'>会社名詳細</SheetTitle>
					</div>
					<SheetDescription className='text-muted-foreground'>
						選択された会社の基本情報と登録内容を確認できます。
					</SheetDescription>
				</SheetHeader>

				<Separator className='mb-6 bg-border/50' />

				<div className='space-y-6'>
					{/* 会社名 */}
					<div className='space-y-2'>
						<Label className='text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2'>
							<Building2 className='h-3.5 w-3.5' /> 会社名
						</Label>
						<Input
							value={company_data.name}
							disabled
							className='bg-muted/30 border-muted text-foreground opacity-100 cursor-default'
						/>
					</div>

					{/* アイコン / 部署数 */}
					<div className='space-y-2'>
						<Label className='text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2'>
							<Tag className='h-3.5 w-3.5' /> アイコン
						</Label>
						<Input
							value={company_data.icon || '未設定'}
							disabled
							className='bg-muted/30 border-muted text-foreground opacity-100 cursor-default'
						/>
					</div>

					{/* 企業コード */}
					<div className='space-y-2'>
						<Label className='text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2'>
							<Hash className='h-3.5 w-3.5' /> 企業コード
						</Label>
						<Input
							value={company_data.code}
							disabled
							className='bg-muted/30 border-muted text-foreground opacity-100 cursor-default'
						/>
					</div>

					{/* 登録日時 */}
					<div className='space-y-2'>
						<Label className='text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2'>
							<Calendar className='h-3.5 w-3.5' /> 登録時間
						</Label>
						<Input
							value={format(new Date(company_data.createdAt), 'yyyy/MM/dd HH:mm')}
							disabled
							className='bg-muted/30 border-muted text-foreground opacity-100 cursor-default'
						/>
					</div>
				</div>

				{/* Optional: Footer decoration or action button */}
				{/* <div className='mt-12 p-4 rounded-xl bg-accent/30 border border-accent/50'>
					<p className='text-xs text-accent-foreground leading-relaxed italic'>
						※ この情報は閲覧専用です。変更が必要な場合は管理者設定から編集を行ってください。
					</p>
				</div> */}
			</SheetContent>
		</Sheet>
	)
}
