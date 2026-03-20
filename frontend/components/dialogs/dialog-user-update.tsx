import { useCompanies } from '@/hooks/use-companies'
import { updateUser } from '@/lib/api/users'
import type { User } from '@/lib/types'
import * as React from 'react'
import { toast } from 'sonner'
import { DialogUserCreate } from './dialog-user-create'

export const DialogUpdateUser: React.FC<{ user_data: User; trigger: React.ReactNode }> = ({
	user_data,
	trigger,
}) => {
	const { data: companiesData } = useCompanies()
	const [open, setOpen] = React.useState(false)
	const [isSaving, setIsSaving] = React.useState(false)
	const companies = companiesData?.companies ?? []

	const handleSave = async (user: Partial<User> & { password?: string }) => {
		setIsSaving(true)
		try {
			await updateUser(user_data.id, {
				name: user.name,
				email: user.email,
				role: user.role,
				department: user.department,
				companyId: user.companyId,
				icon: user.icon,
			})
			setOpen(false)
		} catch {
			toast.error('ユーザー更新に失敗しました。')
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<>
			<span onClick={() => setOpen(true)}>{trigger}</span>
			<DialogUserCreate
				open={open}
				onOpenChange={setOpen}
				mode='edit'
				user={user_data}
				onSave={handleSave}
				companies={companies}
				isSaving={isSaving}
			/>
		</>
	)
}
