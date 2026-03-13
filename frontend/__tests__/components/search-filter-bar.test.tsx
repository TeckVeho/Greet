import { SearchFilterBar } from '@/components/restaurants/search-filter-bar'
import { fireEvent, render, screen } from '@testing-library/react'
jest.mock('@/components/ui', () => {
	const Box = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
		<div {...props}>{children}</div>
	)
	return {
		Button: ({ children, onClick, title }: { children?: React.ReactNode; onClick?: () => void; title?: string }) => (
			<button onClick={onClick} title={title}>{children}</button>
		),
		Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
		InputGroup: Box,
		InputGroupInput: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
		InputGroupAddon: Box,
		Select: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
		SelectContent: Box,
		SelectGroup: Box,
		SelectItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
		SelectTrigger: Box,
		SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
		useComboboxAnchor: () => ({ current: null }),
	}
})

import * as React from 'react'

describe('SearchFilterBar', () => {
	it('検索入力時に onSearchChange を呼ぶ', () => {
		const onSearchChange = jest.fn()

		render(
			<SearchFilterBar onSearchChange={onSearchChange} onFilterClick={jest.fn()} searchValue='' />,
		)

		fireEvent.change(screen.getByPlaceholderText('店名、エリア、ジャンルで検索...'), {
			target: { value: '銀座' },
		})

		expect(onSearchChange).toHaveBeenCalledWith('銀座')
	})

	it('フィルターボタンクリック時に onFilterClick を呼ぶ', () => {
		const onFilterClick = jest.fn()

		render(
			<SearchFilterBar onSearchChange={jest.fn()} onFilterClick={onFilterClick} searchValue='' />,
		)

		fireEvent.click(screen.getByRole('button', { name: 'フィルター' }))

		expect(onFilterClick).toHaveBeenCalledTimes(1)
	})

	it('activeFilterCount が 0 より大きいとバッジを表示する', () => {
		render(
			<SearchFilterBar
				onSearchChange={jest.fn()}
				onFilterClick={jest.fn()}
				searchValue=''
				activeFilterCount={3}
			/>,
		)

		expect(screen.getByText('3')).toBeInTheDocument()
	})

	it('view mode ボタン押下で onViewModeChange を呼ぶ', () => {
		const onViewModeChange = jest.fn()

		render(
			<SearchFilterBar
				onSearchChange={jest.fn()}
				onFilterClick={jest.fn()}
				onViewModeChange={onViewModeChange}
				viewMode='table'
				searchValue=''
			/>,
		)

		fireEvent.click(screen.getByTitle('テーブル表示'))
		fireEvent.click(screen.getByTitle('カード表示'))

		// title='テーブル表示' is on the LayoutGrid (cards) button → triggers 'cards'
		// title='カード表示'   is on the Table button → triggers 'table'
		expect(onViewModeChange).toHaveBeenNthCalledWith(1, 'cards')
		expect(onViewModeChange).toHaveBeenNthCalledWith(2, 'table')
	})

	it('新規登録ボタン押下で onNewClick を呼ぶ', () => {
		const onNewClick = jest.fn()

		render(
			<SearchFilterBar
				onSearchChange={jest.fn()}
				onFilterClick={jest.fn()}
				onNewClick={onNewClick}
				searchValue=''
			/>,
		)

		fireEvent.click(screen.getByRole('button', { name: '新規登録' }))

		expect(onNewClick).toHaveBeenCalledTimes(1)
	})

	it('検索文字列があるときクリアアイコン押下で空文字を返す', () => {
		const onSearchChange = jest.fn()
		const { container } = render(
			<SearchFilterBar
				onSearchChange={onSearchChange}
				onFilterClick={jest.fn()}
				searchValue='寿司'
			/>,
		)

		const clearButton = container.querySelector('svg.cursor-pointer')
		expect(clearButton).not.toBeNull()

		fireEvent.click(clearButton as Element)

		expect(onSearchChange).toHaveBeenCalledWith('')
	})
})
