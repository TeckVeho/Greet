import { fireEvent, render, screen } from '@testing-library/react'
import { SearchFilterBar } from '@/components/search-filter-bar'

describe('SearchFilterBar', () => {
  it('検索入力時に onSearchChange を呼ぶ', () => {
    const onSearchChange = jest.fn()

    render(
      <SearchFilterBar
        onSearchChange={onSearchChange}
        onFilterClick={jest.fn()}
        searchValue=''
      />,
    )

    fireEvent.change(screen.getByPlaceholderText('店名、エリア、ジャンルで検索...'), {
      target: { value: '銀座' },
    })

    expect(onSearchChange).toHaveBeenCalledWith('銀座')
  })

  it('フィルターボタンクリック時に onFilterClick を呼ぶ', () => {
    const onFilterClick = jest.fn()

    render(
      <SearchFilterBar
        onSearchChange={jest.fn()}
        onFilterClick={onFilterClick}
        searchValue=''
      />,
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

    expect(onViewModeChange).toHaveBeenNthCalledWith(1, 'table')
    expect(onViewModeChange).toHaveBeenNthCalledWith(2, 'cards')
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
