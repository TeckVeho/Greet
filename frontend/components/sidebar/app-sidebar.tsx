'use client'

import { Coffee, MapPin, Star, Users } from 'lucide-react'
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
import { Separator } from '../ui'

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
		{
			title: 'ユーザー管理',
			url: '/admin/users',
			icon: Users,
		},
	],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { user } = useAuth()

	const filteredNavMain = data.navMain.filter(item => {
		if (item.url.startsWith('/admin')) {
			return user?.role === 'admin'
		}
		return true
	})

	return (
		<Sidebar collapsible='icon' {...props}>
			<SidebarHeader>
				<MainLogo />
			</SidebarHeader>
			<SidebarContent>
				<Separator />
				<NavMain items={filteredNavMain} />
			</SidebarContent>
			<Separator />
			<SidebarFooter>
				<NavUser user={user ? user : data.user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	)
}
