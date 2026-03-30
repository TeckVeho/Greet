'use client'

import {
	changeUserPassword,
	createUser,
	listUsers,
	updateUser,
	type UsersListResponse,
} from '@/lib/api/users'
import { queryClient } from '@/lib/query-client'
import { useMutation, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'

export const useUsers = ({
	page,
	limit,
	search,
	companyId = undefined,
}: {
	page: number
	limit: number
	search: string
	companyId: string | undefined
}) => {
	return useQuery<UsersListResponse>({
		queryKey: ['users', page, limit, search, companyId],
		queryFn: () => listUsers({ page, limit, search, companyId }),
		placeholderData: data => data,
	})
}
export const useCreateUser = () => {
	return useMutation({
		mutationKey: ['createUser'],
		mutationFn: async (userData: FormData) => await createUser(userData),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['users'] })
		},
		onError: e => {
			console.error('Failed to create user', e)
			if (axios.isAxiosError(e)) {
				const message = e.response?.data?.error?.message
				toast.error(message || 'ユーザー登録に失敗しました。')
			} else {
				toast.error('ユーザー登録に失敗しました。')
			}
		},
	})
}
export const useUpdateUser = (id?: string) => {
	return useMutation({
		mutationKey: ['updateUser', id],
		mutationFn: async (userData: FormData) => {
			if (!id) return Promise.reject(new Error('User ID is required for updating user'))
			return await updateUser(id, userData)
		},
		onError: e => {
			console.error('Failed to update user', e)
			if (axios.isAxiosError(e)) {
				const message = e.response?.data?.error?.message
				toast.error(message || 'ユーザー更新に失敗しました。')
			} else {
				toast.error('ユーザー更新に失敗しました。')
			}
		},
	})
}

export const useChangeUserPassword = (id?: string) => {
	return useMutation({
		mutationKey: ['changeUserPassword', id],
		mutationFn: async (password: string) => {
			if (!id) return Promise.reject(new Error('User ID is required for password update'))
			return await changeUserPassword(id, { password })
		},
		onError: e => {
			console.error('Failed to change user password', e)
			if (axios.isAxiosError(e)) {
				const message = e.response?.data?.error?.message
				toast.error(message || 'パスワード更新に失敗しました。')
			} else {
				toast.error('パスワード更新に失敗しました。')
			}
		},
	})
}
