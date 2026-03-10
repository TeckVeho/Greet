'use client'

import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	PaginationState,
	useReactTable,
} from '@tanstack/react-table'

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Dispatch, SetStateAction } from 'react'
import { Pagination } from '../pagination'
import { Skeleton } from '../ui'

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[]
	data: TData[]
	setPagination: Dispatch<SetStateAction<PaginationState>>
	pagination: PaginationState
	total?: number
	isLoading?: boolean
}

export function DataTable<TData, TValue>({
	columns,
	data,
	total,
	pagination,
	setPagination,
	isLoading,
}: DataTableProps<TData, TValue>) {
	const table = useReactTable({
		data,
		columns,
		rowCount: total,
		state: {
			pagination,
		},
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
	})

	return (
		<>
			<div className='overflow-hidden border border-muted-foreground/30 rounded-lg'>
				<Table>
					<TableHeader className='bg-muted/60'>
						{table.getHeaderGroups().map(headerGroup => (
							<TableRow key={headerGroup.id} className='hover:bg-transparent'>
								{headerGroup.headers.map(header => (
									<TableHead
										key={header.id}
										className='text-sm font-semibold text-muted-foreground'
									>
										{header.isPlaceholder
											? null
											: flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>

					<TableBody className='bg-card'>
						{isLoading ? (
							Array.from({ length: 5 }).map((_, index) => (
								<TableRow key={index} className='transition-colors hover:bg-muted/40'>
									<TableCell colSpan={columns.length}>
										<Skeleton className='min-h-5' />
									</TableCell>
								</TableRow>
							))
						) : table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map(row => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && 'selected'}
									className='transition-colors hover:bg-muted/40'
								>
									{row.getVisibleCells().map(cell => (
										<TableCell key={cell.id} className='text-sm'>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className='h-24 text-center text-muted-foreground'
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className='flex items-center justify-between mt-4'>
				<span className='whitespace-nowrap'>人数 {total}</span>
				<Pagination
					totalPages={table.getPageCount()}
					pageIndex={pagination.pageIndex}
					pageSize={pagination.pageSize}
					onPageChange={pageIndex => setPagination(prev => ({ ...prev, pageIndex }))}
					onPageSizeChange={pageSize => setPagination({ pageIndex: 0, pageSize })}
				/>
			</div>
		</>
	)
}
