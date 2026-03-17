'use client'

import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/lib/auth-context'
import { menuItems } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
interface SidebarProps {
	isCollapsed: boolean
	isMobileMenuOpen?: boolean
	onMobileMenuClose?: () => void
}

export function Sidebar({
	isCollapsed,
	isMobileMenuOpen = false,
	onMobileMenuClose,
}: SidebarProps) {
	const pathname = usePathname()
	const router = useRouter()
	const { user, logout } = useAuth()

	const handleLogout = () => {
		logout()
		router.push('/login')
	}

	// Reusable class for ALL sliding text spans
	const slideText = cn(
		'overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out',
		isCollapsed ? 'max-w-0 opacity-0 -translate-x-2 ml-0' : 'max-w-xs opacity-100 translate-x-0',
	)

	return (
		<>
			{/* Mobile overlay */}
			{isMobileMenuOpen && (
				<div
					className='fixed inset-0 z-40 bg-black/50 md:hidden animate-in fade-in duration-300'
					onClick={onMobileMenuClose}
					aria-hidden='true'
				/>
			)}

			<aside
				className={cn(
					'fixed left-0 top-0 z-50 h-screen border-r border-[#A67B6B] bg-[#B8958A]',
					'transition-all duration-300 ease-in-out',
					'transform md:transform-none',
					isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
					isCollapsed ? 'w-16' : 'w-64',
				)}
			>
				<div className='flex h-full flex-col overflow-hidden'>
					{/* ── LOGO ── */}
					<div className='flex h-14 items-center border-b border-[#A67B6B] px-4'>
						<span className='text-xl min-w-5 shrink-0'>✨</span>
						<div className={cn(slideText, 'ml-3 flex flex-col')}>
							<h2 className='text-lg font-semibold tracking-wide text-white font-serif leading-tight'>
								Greet
							</h2>
							<p className='text-[10px] text-white/85'>接待を、戦略に。</p>
						</div>
					</div>

					{/* ── NAVIGATION ── */}
					<nav className='flex-1 space-y-1 p-3'>
						{menuItems.map(item => {
							const isActive = pathname === item.href
							return (
								<Link
									key={item.href}
									href={item.href}
									onClick={() => {
										if (onMobileMenuClose && window.innerWidth < 768) {
											onMobileMenuClose()
										}
									}}
									className={cn(
										'group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium',
										'transition-all duration-300 ease-in-out',
										isActive
											? 'bg-[#A67B6B] text-white shadow-md'
											: 'text-white/90 hover:bg-white/10 hover:text-white',
										isCollapsed && 'justify-center px-2',
									)}
								>
									<span className='text-lg shrink-0'>{item.icon}</span>
									<span
										className={cn(
											'overflow-hidden whitespace-nowrap',
											'transition-all duration-300 ease-in-out',
											isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-40 opacity-100 ml-3',
										)}
									>
										{item.title}
									</span>
								</Link>
							)
						})}
					</nav>

					{/* ── FOOTER — USER INFO ── */}
					<div className='border-t border-[#A67B6B] p-3'>
						{user ? (
							<div className='flex flex-col gap-2'>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<div
											className={cn(
												'flex items-center rounded-xl px-2 py-2 gap-3',
												'transition-all duration-300 ease-in-out ',
												isCollapsed ? 'justify-center gap-0' : 'bg-white/10',
											)}
										>
											<Avatar className='h-8 w-8 shrink-0 flex items-start justify-start'>
												<AvatarImage src={user.avatar} />
												<AvatarFallback className='bg-[#A67B6B] text-white'>
													{user.name.charAt(0)}
												</AvatarFallback>
											</Avatar>
											<div
												className={cn(
													'overflow-hidden whitespace-nowrap',
													'transition-all duration-300 ease-in-out',
													isCollapsed ? 'max-w-0 opacity-0' : ' opacity-100',
												)}
											>
												<div className='truncate text-sm font-medium text-white'>{user.name}</div>
												<div className='truncate text-[10px] text-white/70'>
													{user.role === 'admin' ? '管理者' : '一般'}
												</div>
											</div>
										</div>
									</DropdownMenuTrigger>
									<DropdownMenuContent side='right'>
										<DropdownMenuGroup>
											<DropdownMenuLabel>My Account</DropdownMenuLabel>
											<DropdownMenuItem>Profile</DropdownMenuItem>
											<DropdownMenuItem>Billing</DropdownMenuItem>
										</DropdownMenuGroup>
										<DropdownMenuSeparator />
										<DropdownMenuGroup>
											<DropdownMenuItem>Team</DropdownMenuItem>
											<DropdownMenuItem>Subscription</DropdownMenuItem>
										</DropdownMenuGroup>
									</DropdownMenuContent>
								</DropdownMenu>

								<Button
									variant='ghost'
									onClick={handleLogout}
									className={cn(
										'w-full text-white/90 hover:bg-white/10 hover:text-white',
										'transition-all duration-300 ease-in-out',
										isCollapsed ? 'justify-center px-2' : 'justify-start px-3',
									)}
								>
									<span className='shrink-0'>
										<LogOut />
									</span>
									<span
										className={cn(
											'overflow-hidden whitespace-nowrap',
											'transition-all duration-300 ease-in-out',
											isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-30 opacity-100 ml-3',
										)}
									>
										ログアウト
									</span>
								</Button>
							</div>
						) : (
							<Link
								href='/login'
								className={cn(
									'flex items-center rounded-xl px-3 py-2',
									'text-sm text-white/90 hover:bg-white/10',
									'transition-all duration-300 ease-in-out',
									isCollapsed && 'justify-center px-2',
								)}
							>
								<span className='text-lg shrink-0'>🔑</span>
								<span
									className={cn(
										'overflow-hidden whitespace-nowrap',
										'transition-all duration-300 ease-in-out',
										isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-30 opacity-100 ml-3',
									)}
								>
									ログイン
								</span>
							</Link>
						)}
					</div>
				</div>
			</aside>
		</>
	)
}
