import { baseApi } from './baseApi'

type GetLogsRequestType = {
  limit: number
  start: number
}

type GetLogByIdRequestType = { id: string }

export const logsApi = baseApi.injectEndpoints({
  endpoints: build => ({
    getLogById: build.query<any, GetLogByIdRequestType>({
      providesTags: ['Logs', { id: 'List', type: 'Logs' }],
      query: ({ id }) => ({
        method: 'GET',
        url: `/logs/${id}`,
      }),
    }),
    getLogs: build.query<any, GetLogsRequestType | void>({
      providesTags: ['Logs'],
      query: params => ({
        method: 'GET',
        params: params ?? {},
        url: 'logs',
      }),
    }),
  }),
})

export const { useGetLogByIdQuery, useGetLogsQuery } = logsApi
