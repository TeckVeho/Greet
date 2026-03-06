'use client'
import { queryClient } from '@/lib/query-client'
import { QueryClientProvider as QueryClientProviderAsTag } from '@tanstack/react-query'

export const QueryClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	return <QueryClientProviderAsTag client={queryClient}>{children}</QueryClientProviderAsTag>
}
