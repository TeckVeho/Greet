'use client'

import { Header } from '@/components/header'
import { AppSidebar } from '@/components/sidebar/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import * as React from 'react'
interface AppLayoutProps {
	children: React.ReactNode
}

export default function Layout({ children }: AppLayoutProps) {
	const [isMounted, setIsMounted] = React.useState(false)

	React.useEffect(() => {
		setIsMounted(true)
	}, [])

	return (
		<SidebarProvider
			style={
				{
					'--sidebar-width': '16rem',
					'--sidebar-width-mobile': '5rem',
				} as React.CSSProperties
			}
		>
			{isMounted ? <AppSidebar variant='floating' /> : null}
			<SidebarInset className='min-w-0'>
				<div className='sticky top-0 z-30 px-2 pt-2 md:px-3'>
					{isMounted ? (
						<Header />
					) : (
						<div className='surface-glass h-14 rounded-2xl border border-border/80' />
					)}
				</div>

				<div className='page-section flex-1 px-2 pb-4 pt-2 md:px-3 md:pb-6 md:pt-3'>
					<div className='mx-auto w-full max-w-screen-2xl'>{children}</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
