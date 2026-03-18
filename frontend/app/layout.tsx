import { AuthProvider } from '@/lib/auth-context'
import { FavoritesProvider } from '@/lib/favorites-context'
import { Providers } from '@/providers/providers'
import type { Metadata } from 'next'
import { Cormorant_Garamond, Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

const cormorant = Cormorant_Garamond({
	variable: '--font-logo',
	subsets: ['latin'],
	weight: ['500', '600'],
})

export const metadata: Metadata = {
	title: 'Greet（グリート）| 接待を、戦略に。',
	description: '接待を、戦略に。Greet（グリート）は接待に最適な飲食店情報を一元管理します。',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='ja' suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} app-shell antialiased`}
				suppressHydrationWarning
			>
				<Toaster richColors position='top-center' />
				<Providers>
					<AuthProvider>
						<FavoritesProvider>{children}</FavoritesProvider>
					</AuthProvider>
				</Providers>
			</body>
		</html>
	)
}
