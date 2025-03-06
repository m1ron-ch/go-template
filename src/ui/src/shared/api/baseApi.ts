import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { AppSettings } from '../const'

export const baseApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: AppSettings.API_URL,
    credentials: 'include',
  }),
  endpoints: () => ({}),
  reducerPath: 'baseApi',
  tagTypes: ['News', 'Pages', 'Users', 'Tabs', 'Logs'],
})
