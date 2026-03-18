import { DialogGlobalSearch } from '@/components/dialogs'
import { SidebarTrigger } from '../ui/sidebar'
import { ThemeToggle } from './theme-toggle'

export const Header: React.FC = () => {
	return (
		<header className='surface-glass flex h-14 items-center justify-between rounded-2xl border border-border/80 px-4 md:px-6'>
			<div className='gap-5 flex items-center justify-center'>
				<SidebarTrigger className='size-5 text-muted-foreground' />
				<DialogGlobalSearch />
			</div>
			<ThemeToggle />
		</header>
	)
}
