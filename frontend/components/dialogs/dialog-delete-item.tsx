import { ReactNode, useState } from 'react'

import { Button } from '../ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '../ui/dialog'
import { Spinner } from '../ui/spinner'
interface DialogDeleteItemProps {
	className?: string
	trigger: ReactNode
	title?: string
	description?: string
	actionButtonText?: string
	cancelButtonText?: string
	deleteAction: () => void
	deleting: boolean
}

export const DialogDeleteItem: React.FC<DialogDeleteItemProps> = ({
	className,
	trigger,
	title = '削除の確認',
	description = 'この操作は元に戻すことができません。続行してもよろしいですか？',
	actionButtonText = '削除',
	cancelButtonText = 'キャンセル',
	deleteAction,
	deleting,
}) => {
	const [isOpen, setIsOpen] = useState<boolean>(false)
	return (
		<Dialog onOpenChange={setIsOpen} open={isOpen}>
			<DialogTrigger asChild className={className}>
				{trigger}
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant='denger' onClick={() => deleteAction()}>
						{deleting ? <Spinner /> : actionButtonText}
					</Button>
					<Button>{cancelButtonText}</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
