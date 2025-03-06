import { baseApi } from './baseApi'

type LoginRequestType = {
  login: string
  password: string
}

export const authApi = baseApi.injectEndpoints({
  endpoints: build => ({
    login: build.mutation<void, LoginRequestType>({
      query: body => ({
        body,
        method: 'POST',
        url: 'login',
      }),
    }),
    logout: build.mutation<void, void>({
      query: body => ({
        body,
        method: 'POST',
        url: 'logout',
      }),
    }),
  }),
})

export const { useLoginMutation, useLogoutMutation } = authApi
