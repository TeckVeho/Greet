'use client'

import { GlobalSearchDialog } from '@/components/global-search-dialog'
import { Header } from '@/components/header'
import { Sidebar } from '@/components/sidebar'
import { cn } from '@/lib/utils'
import * as React from 'react'

interface AppLayoutProps {
	children: React.ReactNode
}

export default function Layout({ children }: AppLayoutProps) {
	const [isCollapsed, setIsCollapsed] = React.useState(false)
	const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
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
		<div className='relative min-h-screen bg-white'>
			<Sidebar
				isCollapsed={isCollapsed}
				isMobileMenuOpen={isMobileMenuOpen}
				onMobileMenuClose={() => setIsMobileMenuOpen(false)}
			/>

			{/* メインコンテンツエリア */}
			<div
				className={cn(
					'transition-all duration-300',
					isCollapsed ? 'ml-0 md:ml-16' : 'ml-0 md:ml-64',
				)}
			>
				{/* トップバー */}
				<Header
					isCollapsed={isCollapsed}
					setIsCollapsed={setIsCollapsed}
					isMobileMenuOpen={isMobileMenuOpen}
					setIsMobileMenuOpen={setIsMobileMenuOpen}
					setIsSearchOpen={setIsSearchOpen}
				/>

				{/* ページコンテンツ */}
				<main>{children}</main>
			</div>

			{/* グローバル検索ダイアログ */}
			<GlobalSearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
		</div>
	)
}
