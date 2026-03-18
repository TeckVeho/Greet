import { ThemeProvider as Provider } from 'next-themes'

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	return (
		<Provider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
			{children}
		</Provider>
	)
}
