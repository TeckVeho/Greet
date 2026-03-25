'use client'

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import Link from 'next/link'

export function MainLogo() {
	return (
		<Link href='/'>
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton
						size='lg'
						className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
					>
						<div className='flex aspect-square size-8 items-center justify-center rounded-lg  text-sidebar-primary-foreground text-xl'>
							✨
						</div>
						<div className='grid flex-1 text-left text-sm leading-tight'>
							<span className='truncate font-semibold'>Greet</span>
							<span className='truncate text-xs'>接待を、戦略に。</span>
						</div>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		</Link>
	)
}
