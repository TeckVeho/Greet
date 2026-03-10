'use client'

import { CompanyListItem, listCompanies } from '@/lib/api/companies'
import { useQuery } from '@tanstack/react-query'

export const useCompanies = () => {
	return useQuery<{ companies: CompanyListItem[] }>({
		queryKey: ['companies'],
		queryFn: listCompanies,
		placeholderData: data => data,
	})
}
