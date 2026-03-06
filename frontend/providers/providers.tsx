import { QueryClientProvider } from './query-client-provider'

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	return <QueryClientProvider>{children}</QueryClientProvider>
}
