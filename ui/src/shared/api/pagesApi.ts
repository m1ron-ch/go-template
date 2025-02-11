import { baseApi } from './baseApi'

type GetPagesRequestType = {
  limit: number
  start: number
}

type GetPageByIdRequestType = { id: string }

export const pagesApi = baseApi.injectEndpoints({
  endpoints: build => ({
    getPageById: build.query<any, GetPageByIdRequestType>({
      providesTags: ['Pages', { id: 'List', type: 'Pages' }],
      query: ({ id }) => ({
        method: 'GET',
        url: `/pages/${id}`,
      }),
    }),
    getPages: build.query<any, GetPagesRequestType | void>({
      providesTags: ['Pages'],
      query: params => ({
        method: 'GET',
        params: params ?? {},
        url: 'pages',
      }),
    }),
  }),
})

export const { useGetPageByIdQuery, useGetPagesQuery } = pagesApi
