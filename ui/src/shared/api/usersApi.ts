import { UserRole, UserType } from '../types'
import { baseApi } from './baseApi'

type GetUserByIdRequestType = { id: string }

type AddUserRequestType = {
  f_name: string
  l_name: string
  login: string
  m_name: string
  password: string
  role_id: UserRole
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: build => ({
    addUser: build.mutation<void, AddUserRequestType>({
      query: body => ({
        body,
        method: 'POST',
        url: 'user/add',
      }),
    }),
    getUserById: build.query<UserType, GetUserByIdRequestType>({
      providesTags: ['Users', { id: 'List', type: 'Users' }],
      query: ({ id }) => ({
        method: 'GET',
        url: `/user/${id}`,
      }),
    }),
    getUsers: build.query<UserType[], void>({
      providesTags: ['Users'],
      query: () => ({
        method: 'GET',
        url: 'users',
      }),
    }),
  }),
})

export const { useAddUserMutation, useGetUserByIdQuery, useGetUsersQuery } = usersApi
