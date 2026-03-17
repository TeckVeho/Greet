'use client'

import { Coffee, MapPin, Shield, Star } from 'lucide-react'
import * as React from 'react'

import { MainLogo } from '@/components/sidebar/main-logo'
import { NavMain } from '@/components/sidebar/nav-main'
import { NavUser } from '@/components/sidebar/nav-user'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from '@/components/ui/sidebar'
import { useAuth } from '@/lib/auth-context'

// This is sample data.
const data = {
	user: {
		name: 'shadcn',
		email: 'm@example.com',
		avatar: '/avatars/shadcn.jpg',
	},

	navMain: [
		{
			title: 'すべての飲食店リスト',
			url: '/',
			icon: Coffee,
		},
		{
			title: 'エリア別',
			url: '/area',
			icon: MapPin,
		},
		{
			title: 'ジャンル別',
			url: '/genre',
			icon: Coffee,
		},
		{
			title: 'お気に入り',
			url: '/favorites',
			icon: Star,
		},
	],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { user } = useAuth()
	const navItems = React.useMemo(() => {
		if (user?.role === 'admin') {
			return [
				...data.navMain,
				{
					title: 'ユーザー管理',
					url: '/admin/users',
					icon: Shield,
				},
			]
		}

		return data.navMain
	}, [user?.role])

	return (
		<Sidebar collapsible='icon' {...props}>
			<SidebarHeader>
				<MainLogo />
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={navItems} />
				{/* <NavProjects projects={data.projects} /> */}
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={user ? user : data.user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	)
}
