import { QueryClientProvider } from './query-client-provider'
import { ThemeProvider } from './theme-provider'

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	return (
		<QueryClientProvider>
			<ThemeProvider>{children}</ThemeProvider>
		</QueryClientProvider>
	)
}
