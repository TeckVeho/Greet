import * as React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import {
  Controller,
  type Control,
  type ControllerRenderProps,
  type FieldValues,
  type Path,
} from 'react-hook-form'
import { DialogRestaurantCreate } from '@/components/dialogs/dialog-restaurant-create'
import { createRestaurant, uploadRestaurantImage } from '@/lib/api/restaurants'
import { queryClient } from '@/lib/query-client'
import { toast } from 'sonner'

jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt} />,
}))

jest.mock('@/components/ui', () => {
  const Box = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div {...props}>{children}</div>
  )

  type MockFieldValues = FieldValues
  type MockFormFieldProps = {
    control: Control<MockFieldValues>
    name: Path<MockFieldValues>
    render: (props: {
      field: ControllerRenderProps<MockFieldValues, Path<MockFieldValues>>
    }) => React.ReactElement
  }

  return {
    Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
      <button {...props}>{children}</button>
    ),
      Combobox: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      ComboboxChip: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
      ComboboxChips: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      ComboboxChipsInput: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
      ComboboxContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      ComboboxEmpty: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      ComboboxItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      ComboboxList: ({ children }: { children: React.ReactNode }) => (
        <div>{typeof children === 'function' ? children({ value: 'SUSHI', label: '寿司' }) : children}</div>
      ),
      ComboboxValue: ({ children, placeholder }: { children?: React.ReactNode; placeholder?: string }) => (
        <span>{typeof children === 'function' ? children([]) : children ?? placeholder}</span>
      ),
    Checkbox: ({ onChange, defaultChecked, id }: { onChange?: (value: boolean) => void; defaultChecked?: boolean; id?: string }) => (
      <input
        type='checkbox'
        id={id}
        defaultChecked={defaultChecked}
        onChange={event => onChange?.(event.target.checked)}
      />
    ),
    Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
      open ? <div>{children}</div> : null,
    DialogContent: Box,
    DialogFooter: Box,
    DialogHeader: Box,
    DialogTitle: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
    Form: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    FormControl: Box,
    FormField: ({ control, name, render }: MockFormFieldProps) => (
      <Controller control={control} name={name} render={render} />
    ),
    FormItem: Box,
    FormLabel: ({ children }: { children: React.ReactNode }) => <label>{children}</label>,
    FormMessage: () => null,
    Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
    Label: ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
      <label htmlFor={htmlFor}>{children}</label>
    ),
    ScrollArea: Box,
    Select: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    SelectContent: Box,
    SelectItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    SelectTrigger: Box,
    SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
    Spinner: ({ text }: { text?: string }) => <span>{text}</span>,
    useComboboxAnchor: () => ({ current: null }),
  }
})

jest.mock('@/lib/api/restaurants', () => ({
  createRestaurant: jest.fn(),
  uploadRestaurantImage: jest.fn(),
}))

jest.mock('@/lib/query-client', () => ({
  queryClient: {
    invalidateQueries: jest.fn(),
  },
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

jest.mock('@/components/button-remove', () => ({
  ButtonRemoveImage: ({ onClick }: { onClick: () => void }) => (
    <button type='button' onClick={onClick}>
      remove-image
    </button>
  ),
}))

const mockCreateRestaurant = createRestaurant as jest.MockedFunction<typeof createRestaurant>
const mockUploadRestaurantImage = uploadRestaurantImage as jest.MockedFunction<
  typeof uploadRestaurantImage
>
const mockInvalidateQueries = queryClient.invalidateQueries as jest.Mock

describe('DialogRestaurantCreate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    Object.defineProperty(URL, 'createObjectURL', {
      writable: true,
      value: jest.fn(() => 'blob:preview'),
    })
  })

  it('open=true でフォームを表示する', () => {
    render(<DialogRestaurantCreate open onOpenChange={jest.fn()} />)

    expect(screen.getByText('新規飲食店登録')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '登録' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument()
  })

  it('キャンセル押下で onOpenChange(false) を呼ぶ', () => {
    const onOpenChange = jest.fn()
    render(<DialogRestaurantCreate open onOpenChange={onOpenChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'キャンセル' }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('正常 submit で飲食店作成、キャッシュ更新、トースト表示を行う', async () => {
    const onOpenChange = jest.fn()
    mockCreateRestaurant.mockResolvedValue({} as never)
    mockInvalidateQueries.mockResolvedValue(undefined)

    render(<DialogRestaurantCreate open onOpenChange={onOpenChange} />)

    fireEvent.change(screen.getByPlaceholderText('例: 銀座 鮨 さいとう'), {
      target: { value: '銀座 鮨 さいとう' },
    })
    fireEvent.change(screen.getByPlaceholderText('https://maps.app.goo.gl/...'), {
      target: { value: 'https://maps.example.com/store' },
    })
    fireEvent.click(screen.getByRole('button', { name: '登録' }))

    await waitFor(() => {
      expect(mockCreateRestaurant).toHaveBeenCalledWith(
        expect.objectContaining({
          name: '銀座 鮨 さいとう',
          url: 'https://maps.example.com/store',
          area: 'GINZA',
          genres: ['SUSHI'],
          coverImage: undefined,
        }),
      )
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['restaurants'] })
      expect(onOpenChange).toHaveBeenCalledWith(false)
      expect(toast.success).toHaveBeenCalledWith('飲食店を登録しました')
    })
  })

  it('画像付き submit では先に uploadRestaurantImage を呼ぶ', async () => {
    mockUploadRestaurantImage.mockResolvedValue('https://cdn.example.com/rest.jpg')
    mockCreateRestaurant.mockResolvedValue({} as never)
    mockInvalidateQueries.mockResolvedValue(undefined)

    const { container } = render(<DialogRestaurantCreate open onOpenChange={jest.fn()} />)

    fireEvent.change(screen.getByPlaceholderText('例: 銀座 鮨 さいとう'), {
      target: { value: '画像付き店舗' },
    })
    fireEvent.change(screen.getByPlaceholderText('https://maps.app.goo.gl/...'), {
      target: { value: 'https://maps.example.com/with-image' },
    })

    const fileInput = container.querySelector('#cover-image-input') as HTMLInputElement
    const file = new File(['image'], 'cover.png', { type: 'image/png' })
    fireEvent.change(fileInput, { target: { files: [file] } })

    fireEvent.click(screen.getByRole('button', { name: '登録' }))

    await waitFor(() => {
      expect(mockUploadRestaurantImage).toHaveBeenCalledWith(file)
      expect(mockCreateRestaurant).toHaveBeenCalledWith(
        expect.objectContaining({
          name: '画像付き店舗',
          coverImage: 'https://cdn.example.com/rest.jpg',
          genres: ['SUSHI'],
        }),
      )
    })
  })

  it('API エラー時は error toast を表示する', async () => {
    mockCreateRestaurant.mockRejectedValue(new Error('登録に失敗しました'))

    render(<DialogRestaurantCreate open onOpenChange={jest.fn()} />)

    fireEvent.change(screen.getByPlaceholderText('例: 銀座 鮨 さいとう'), {
      target: { value: '失敗店舗' },
    })
    fireEvent.change(screen.getByPlaceholderText('https://maps.app.goo.gl/...'), {
      target: { value: 'https://maps.example.com/error' },
    })
    fireEvent.click(screen.getByRole('button', { name: '登録' }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('登録に失敗しました')
    })
  })
})
