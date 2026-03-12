'use client'

import * as React from 'react'
import { PaginationState } from '@tanstack/react-table'
import { DataTable, RestaurantColumns } from '@/components/restaurants'
import type { RestaurantListItem } from '@/lib/api/restaurants'

interface RestaurantTableProps {
  restaurants: RestaurantListItem[]
}

export function RestaurantTable({ restaurants }: RestaurantTableProps) {
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [restaurants])

  const pageStart = pagination.pageIndex * pagination.pageSize
  const pageEnd = pageStart + pagination.pageSize
  const pagedData = React.useMemo(
    () => restaurants.slice(pageStart, pageEnd),
    [restaurants, pageStart, pageEnd],
  )

  return (
    <DataTable
      columns={RestaurantColumns}
      data={pagedData}
      total={restaurants.length}
      pagination={pagination}
      setPagination={setPagination}
      isLoading={false}
    />
  )
}
