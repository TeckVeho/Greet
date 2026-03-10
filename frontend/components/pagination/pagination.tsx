import {
	Button,
	Pagination as PaginationComponent,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from '@/components/ui'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, List } from 'lucide-react'
import { SelectGroup } from '../ui/select'
interface PaginationProps {
	className?: string
	pageIndex: number
	pageSize: number
	totalPages: number
	onPageChange: (pageIndex: number) => void
	onPageSizeChange: (size: number) => void
}
export const Pagination: React.FC<PaginationProps> = ({
	className,
	pageIndex,
	pageSize,
	totalPages,
	onPageChange,
	onPageSizeChange,
}) => {
	const currentPage = pageIndex + 1
	const getPageNumbers = () => {
		const pages: (number | string)[] = []
		const siblingCount = 1

		if (totalPages <= 5) {
			return Array.from({ length: totalPages }, (_, i) => i + 1)
		}

		const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
		const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)

		const shouldShowLeftDots = leftSiblingIndex > 2
		const shouldShowRightDots = rightSiblingIndex < totalPages - 1

		pages.push(1)

		if (shouldShowLeftDots) {
			pages.push('ellipsis-left')
		} else if (leftSiblingIndex > 1) {
			for (let i = 2; i < leftSiblingIndex; i++) {}
		}

		let start = Math.max(2, currentPage - 1)
		let end = Math.min(totalPages - 1, currentPage + 1)

		if (currentPage <= 2) end = 4
		if (currentPage >= totalPages - 1) start = totalPages - 3

		for (let i = start; i <= end; i++) {
			if (i > 1 && i < totalPages) {
				pages.push(i)
			}
		}

		if (shouldShowRightDots) {
			pages.push('ellipsis-right')
		}

		if (totalPages > 1) {
			pages.push(totalPages)
		}

		return pages
	}

	const allPages = getPageNumbers()
	return (
		<div className='flex items-center gap-5'>
			<PaginationComponent className={cn('justify-end', className)}>
				<PaginationContent>
					<PaginationItem>
						<Button
							variant='secondary'
							className='cursor-pointer'
							disabled={pageIndex === 0}
							onClick={e => {
								e.preventDefault()
								onPageChange(Math.max(0, pageIndex - 1))
							}}
						>
							<ChevronLeft className={'size-5 text-muted-foreground'} />前
						</Button>
					</PaginationItem>
					<div className='flex items-center gap-3 mx-3'>
						{allPages.map((page, index) => (
							<PaginationItem key={index}>
								{typeof page === 'number' ? (
									<PaginationLink
										isActive={page === currentPage}
										href='#'
										onClick={e => {
											e.preventDefault()
											onPageChange(page - 1)
										}}
									>
										{page}
									</PaginationLink>
								) : (
									<PaginationEllipsis />
								)}
							</PaginationItem>
						))}
					</div>

					<PaginationItem>
						<Button
							variant='secondary'
							className='cursor-pointer'
							disabled={pageIndex === totalPages - 1}
							onClick={e => {
								e.preventDefault()
								onPageChange(Math.min(totalPages - 1, pageIndex + 1))
							}}
						>
							次
							<ChevronRight className={'size-5 text-muted-foreground'} />
						</Button>
					</PaginationItem>
				</PaginationContent>
			</PaginationComponent>
			<Select value={String(pageSize)} onValueChange={value => onPageSizeChange(Number(value))}>
				<SelectTrigger className='hidden gap-3 md:flex whitespace-nowrap'>
					<List className='text-brand-primary size-5' />
					{pageSize} ページごとの
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						{[5, 10, 20, 30, 50].map(v => (
							<SelectItem key={v} value={String(v)}>
								{v} ページごとの
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
		</div>
	)
}
