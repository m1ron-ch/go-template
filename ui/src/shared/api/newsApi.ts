import { baseApi } from './baseApi'

type GetNewsRequestType = {
  limit: number
  start: number
}

type GetNewsResponseType = {
  create_at: string
  id: number
  localization: {
    content_by: string
    content_ru: string
    id: string
    preview_by: string
    preview_ru: string
    title_by: string
    title_ru: string
  }
  update_at: string
  user: {
    f_name: string
    id: number
    l_name: string
    m_name: string
  }
}

type GetNewsByIdRequestType = { id: string }

export const newsApi = baseApi.injectEndpoints({
  endpoints: build => ({
    getNews: build.query<GetNewsResponseType[], GetNewsRequestType | void>({
      providesTags: ['News'],
      query: params => ({
        method: 'GET',
        params: params ?? {},
        url: 'news',
      }),
    }),
    getNewsById: build.query<any, GetNewsByIdRequestType>({
      providesTags: ['News', { id: 'List', type: 'News' }],
      query: ({ id }) => ({
        method: 'GET',
        url: `/news/${id}`,
      }),
    }),
  }),
})

export const { useGetNewsByIdQuery, useGetNewsQuery } = newsApi
