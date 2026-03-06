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
	title = 'Delete item',
	description = 'This action cannot be undone. Are you sure you want to continue?',
	actionButtonText = 'Delete',
	cancelButtonText = 'Cancel',
	deleteAction,
	deleting,
}) => {
	const [isOpen, setIsOpen] = useState<boolean>(false)
	return (
		<Dialog onOpenChange={setIsOpen} open={isOpen}>
			<DialogTrigger className={className}>{trigger}</DialogTrigger>
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
