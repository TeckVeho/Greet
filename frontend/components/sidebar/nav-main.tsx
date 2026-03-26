'use client'

import { type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from '@/components/ui/sidebar'

export function NavMain({
	items,
}: {
	items: {
		title: string
		url: string
		icon?: LucideIcon
	}[]
}) {
	const pathname = usePathname()
	const { setOpenMobile } = useSidebar()
	return (
		<SidebarGroup>
			<SidebarMenu>
				{items.map(item => (
					<SidebarMenuItem key={item.title}>
						<SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
							<Link
								href={item.url}
								onClick={() => {
									setOpenMobile(false)
								}}
							>
								{item.icon && <item.icon />}
								<span>{item.title}</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	)
}
