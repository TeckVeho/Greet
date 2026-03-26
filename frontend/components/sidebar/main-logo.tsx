'use client'

import Image from 'next/image'
import Link from 'next/link'

export function MainLogo() {
	return (
		<Link
			href='/'
			className='block rounded-lg px-1 py-1 outline-none transition-opacity hover:opacity-75 focus-visible:ring-2 focus-visible:ring-sidebar-ring'
		>
			{/* Expanded: full logo + tagline */}
			<div className='flex flex-col items-center group-data-[collapsible=icon]:hidden -mt-3 -ml-1'> 
				{/* -mt-3 → 3px tepaga ko'tarish */}
				{/* -ml-1 → 1px chapga surish */}
				
				<Image
					src='/newlogogreet.png'
					alt='Greet'
					width={140}
					height={93}
					className='block h-auto w-[140px] -mb-5'
					priority
				/>
				<span
					className='text-xs font-semibold tracking-widest -mt-2'
					style={{ color: '#7C4F2A' }}
				>
					接待を、戦略に。
				</span>
			</div>

			{/* Collapsed: circle emblem only */}
			<div className='hidden group-data-[collapsible=icon]:flex h-8 w-8 overflow-hidden rounded-full'>
				<Image
					src='/newlogogreet.png'
					alt='Greet'
					width={128}
					height={85}
					className='block h-auto w-[128px] -translate-x-[7px] -translate-y-[22px]' 
					priority
				/>
			</div>
		</Link>
	)
}