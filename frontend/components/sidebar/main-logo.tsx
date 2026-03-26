'use client'

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import Image from 'next/image'
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
						<div
							className='flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/20 shadow-sm'
							style={{ width: 40, height: 27, backgroundColor: '#FDFCF9' }}
						>
							<Image
								src='/logogreet.svg'
								alt='Greet'
								width={40}
								height={27}
								className='block h-full w-full object-cover'
								priority
							/>
						</div>
						<div className='grid flex-1 text-left text-sm leading-tight'>
							<span
								className='truncate font-semibold'
								style={{ fontFamily: 'var(--font-logo), serif' }}
							>
								Greet
							</span>
							<span className='truncate text-xs text-muted-foreground'>接待を、戦略に。</span>
						</div>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		</Link>
	)
}
