import { DialogGlobalSearch } from '@/components/dialogs'
import { SidebarTrigger } from '../ui/sidebar'

export const Header: React.FC = () => {
	return (
		<header className='sticky top-2 z-30 flex h-13 items-center justify-between border border-border bg-background/95 backdrop-blur-sm px-6 rounded-lg shadow-sm w-full'>
			<SidebarTrigger className='size-5 text-muted-foreground' />
			<DialogGlobalSearch />
		</header>
	)
}
