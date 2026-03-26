'use client'

import Image from 'next/image'
import Link from 'next/link'

export function MainLogo() {
	return (
		<Link
			href='/'
			className='block rounded-lg px-1 py-1 outline-none transition-opacity hover:opacity-75 focus-visible:ring-2 focus-visible:ring-sidebar-ring'
		>
			{/* Expanded: full logo + tagline stacked — mirrors the login page layout */}
			<div className='flex flex-col items-center gap-1 group-data-[collapsible=icon]:hidden'>
				<Image
					src='/newlogogreet.png'
					alt='Greet'
					width={140}
					height={93}
					className='block h-auto w-[140px]'
					priority
				/>
				<span
					className='text-xs font-semibold tracking-widest'
					style={{ color: '#7C4F2A' }}
				>
					接待を、戦略に。
				</span>
			</div>

			{/* Collapsed: circle emblem only (crop technique — see sizing notes) */}
			<div className='hidden group-data-[collapsible=icon]:flex h-8 w-8 overflow-hidden rounded-md'>
				<Image
					src='/newlogogreet.png'
					alt='Greet'
					width={128}
					height={85}
					className='block h-auto w-[128px] -translate-x-[8px] -translate-y-[26px]'
					priority
				/>
			</div>
		</Link>
	)
}
