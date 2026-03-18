'use client'

import { Header } from '@/components/header'
import { AppSidebar } from '@/components/sidebar/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import * as React from 'react'
interface AppLayoutProps {
	children: React.ReactNode
}

export default function Layout({ children }: AppLayoutProps) {
	const [isSearchOpen, setIsSearchOpen] = React.useState(false)

	// キーボードショートカット (Cmd+K / Ctrl+K) で検索を開く
	React.useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault()
				setIsSearchOpen(true)
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
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
			<AppSidebar variant='floating' />
			<SidebarInset className='min-w-0'>
				<div className='sticky top-0 z-30 px-2 pt-2 md:px-3'>
					<Header />
				</div>

				<div className='page-section flex-1 px-2 pb-4 pt-2 md:px-3 md:pb-6 md:pt-3'>
					<div className='mx-auto w-full max-w-screen-2xl'>{children}</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
