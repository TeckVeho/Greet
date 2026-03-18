import { DialogGlobalSearch } from '@/components/dialogs'
import { SidebarTrigger } from '../ui/sidebar'

export const Header: React.FC = () => {
	return (
		<header className='surface-glass flex h-14 items-center justify-between rounded-2xl border border-border/80 px-4 md:px-6'>
			<SidebarTrigger className='size-5 text-muted-foreground' />
			<DialogGlobalSearch />
		</header>
	)
}
