import {
	Pagination as PaginationComponent,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui'
import { cn } from '@/lib/utils'
export const Pagination: React.FC<{ className?: string }> = ({ className }) => {
	return (
		<PaginationComponent className={cn('', className)}>
			<PaginationContent>
				<PaginationItem>
					<PaginationPrevious href='#' />
				</PaginationItem>
				<PaginationItem>
					<PaginationLink href='#'>1</PaginationLink>
				</PaginationItem>
				<PaginationItem>
					<PaginationLink href='#' isActive>
						2
					</PaginationLink>
				</PaginationItem>
				<PaginationItem>
					<PaginationLink href='#'>3</PaginationLink>
				</PaginationItem>
				<PaginationItem>
					<PaginationEllipsis />
				</PaginationItem>
				<PaginationItem>
					<PaginationNext href='#' />
				</PaginationItem>
			</PaginationContent>
		</PaginationComponent>
	)
}
