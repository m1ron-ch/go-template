import { RouteObject } from 'react-router-dom'

import {

  PagesPage,

  UsersPage,
  NewsPage,
  LeakedPageTabs,
  MediaPage,
  // MetricaPage
} from '@/pages'
import { ChatsPage } from '@/pages/AdminPages/ChatsPage'
import { ContactUs } from '@/pages/AdminPages/ContactUs'
import { OrderService } from '@/pages/AdminPages/OrderService'
import { TermsConditions } from '@/pages/AdminPages/TermsConditions'
import { Awaiting } from '@/pages/AdminPages/Awaiting'
import { FilesPage } from '@/pages/AdminPages/FilesPage'

/**
 * ВАЖНО:
 * Здесь указываем "короткие" пути (без /admin), 
 * так как они станут "дочерними" для path: '/admin' в router.tsx
 */
export const privateRoutes: RouteObject[] = [
  // => /admin/pages
  { path: 'pages', element: <PagesPage /> },

  // => /admin/urls
  { path: 'chats', element: <ChatsPage /> },

  // => /admin/news
  { path: 'news', element: <NewsPage /> },

  // => /admin/users
  { path: 'users', element: <UsersPage /> },

  // => /admin/logs
  { path: 'order-service', element: <OrderService /> },

  // => /admin/media
  { path: 'leaked-data', element: <LeakedPageTabs /> },

  // => /admin/settings
  { path: 'terms-and-conditions', element: <TermsConditions /> },

  { path: 'contact_us', element: <ContactUs /> },

  { path: 'awaiting-publication', element: <Awaiting /> },

  { path: 'media', element: <MediaPage /> },
  { path: 'files', element: <FilesPage /> },

  // Если нужно
  // { path: 'statistic', element: <MetricaPage /> },
]
