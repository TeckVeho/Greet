'use client'

import * as React from 'react'
import { PaginationState } from '@tanstack/react-table'
import { DataCards } from '@/components/restaurants'
import type { RestaurantListItem } from '@/lib/api/restaurants'
import type { Restaurant } from '@/lib/types'

interface RestaurantCardsProps {
  restaurants: Array<Restaurant | RestaurantListItem>
}

function toRestaurantModel(item: Restaurant | RestaurantListItem): Restaurant {
  if ('reviews' in item && Array.isArray(item.reviews)) {
    return {
      ...item,
      address: item.address ?? '',
      phone: item.phone ?? '',
      icon: item.icon ?? '🍴',
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    }
  }

  return {
    id: item.id,
    name: item.name,
    area: item.area,
    genres: item.genres,
    hasPrivateRoom: item.hasPrivateRoom,
    priceRange: item.priceRange,
    address: item.address ?? '',
    phone: item.phone ?? '',
    url: item.url,
    smokingAllowed: item.smokingAllowed,
    coverImage: item.coverImage,
    icon: item.icon ?? '🍴',
    reviews: [],
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  }
}

export function RestaurantCards({ restaurants }: RestaurantCardsProps) {
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 12,
  })

  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [restaurants])

  const mappedRestaurants = React.useMemo(
    () => restaurants.map(toRestaurantModel),
    [restaurants],
  )

  const pageStart = pagination.pageIndex * pagination.pageSize
  const pageEnd = pageStart + pagination.pageSize
  const pagedData = React.useMemo(
    () => mappedRestaurants.slice(pageStart, pageEnd),
    [mappedRestaurants, pageStart, pageEnd],
  )

  return (
    <DataCards
      data={pagedData}
      total={mappedRestaurants.length}
      pagination={pagination}
      setPagination={setPagination}
      isLoading={false}
    />
  )
}
