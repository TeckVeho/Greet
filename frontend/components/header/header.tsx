import { DialogGlobalSearch } from '@/components/dialogs'
import { SidebarTrigger } from '../ui/sidebar'

export const Header: React.FC = () => {
	return (
		<header className='flex h-13 items-center justify-between border-b border-border bg-background/95 px-4 shadow-sm backdrop-blur-sm md:rounded-lg md:border md:px-6'>
			<SidebarTrigger className='size-5 text-muted-foreground' />
			<DialogGlobalSearch />
		</header>
	)
}
