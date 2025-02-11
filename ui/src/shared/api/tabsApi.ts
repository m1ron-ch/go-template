import { baseApi } from './baseApi'

export const tabsApi = baseApi.injectEndpoints({
  endpoints: build => ({
    getTabs: build.query<any, void>({
      providesTags: ['Tabs'],
      query: () => ({
        method: 'GET',
        url: 'tabs',
      }),
    }),
  }),
})

export const { useGetTabsQuery } = tabsApi
