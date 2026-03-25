'use client'

import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	PaginationState,
	useReactTable,
	VisibilityState,
} from '@tanstack/react-table'

import {
	Button,
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui'
import { Settings2 } from 'lucide-react'
import { Dispatch, SetStateAction, useState } from 'react'
import { Pagination } from '../pagination'
import { Skeleton } from '../ui'

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[]
	data: TData[]
	setPagination?: Dispatch<SetStateAction<PaginationState>>
	pagination?: PaginationState
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
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
	const safeData = Array.isArray(data) ? data : []
	const table = useReactTable({
		data: safeData,
		columns,
		rowCount: total,
		state: {
			pagination,
			columnVisibility,
		},
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		manualPagination: true,
	})
	const rows = table.getRowModel()?.rows ?? []
	return (
		<>
			<div className='overflow-x-auto border border-muted-foreground/30 rounded-lg relative '>
				<DropdownMenu>
					<DropdownMenuTrigger asChild className='absolute top-1 right-1 z-10'>
						<Button variant='default' className='rounded-full' size={'icon'}>
							<Settings2 className='size-4' />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align='end'>
						{table
							.getAllColumns()
							.filter(column => column.getCanHide())
							.map(column => {
								return (
									<DropdownMenuCheckboxItem
										key={column.id}
										className='capitalize'
										checked={column.getIsVisible()}
										onCheckedChange={value => column.toggleVisibility(!!value)}
									>
										{typeof column.columnDef.header === 'string'
											? column.columnDef.header
											: column.id}
									</DropdownMenuCheckboxItem>
								)
							})}
					</DropdownMenuContent>
				</DropdownMenu>
				<Table className='min-w-max'>
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
						) : rows.length > 0 ? (
							rows.map(row => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && 'selected'}
									className='transition-colors hover:bg-muted/40'
								>
									{row.getVisibleCells().map(cell => (
										<TableCell key={cell.id} className='text-sm whitespace-nowrap'>
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
									データが見つかりませんでした。
									<br />
									検索条件を変更してみてください。
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className='flex items-center justify-between mt-4'>
				<span className='whitespace-nowrap'>{total} 件の飲食店</span>
				{typeof pagination?.pageIndex === 'number' &&
					typeof pagination.pageSize === 'number' &&
					setPagination && (
						<Pagination
							totalPages={table.getPageCount()}
							pageIndex={pagination.pageIndex}
							pageSize={pagination.pageSize}
							onPageChange={pageIndex => setPagination(prev => ({ ...prev, pageIndex }))}
							onPageSizeChange={pageSize => setPagination({ pageIndex: 0, pageSize })}
						/>
					)}
			</div>
		</>
	)
}
