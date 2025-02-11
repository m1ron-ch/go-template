import { createBrowserRouter, Navigate, RouterProvider as Provider } from 'react-router-dom';

import NotFoundPage from '@/pages/NotFound/NotFoundPage';
import { AuthLayout, LoginPage, RootLayout } from '@/pages';
// ИМПОРТИРУЕМ privateRoutes (описаны ниже):
import { privateRoutes } from './routerSettings'; 
import { NewsList } from '@/pages/GhostPages/NewsList';
import { TermsConditions } from '@/pages/GhostPages/TermsConditions';
import { OrderService } from '@/pages/GhostPages/OrderService';
import { ContactUs } from '@/pages/GhostPages/ContactUs';
import Campaing from '@/pages/GhostPages/Campaing/Campaing';
import AwaitingPublicationPage from '@/pages/GhostPages/AwaitingPublicationPage/AwaitingPublicationPage';
import LeakedPage from '@/pages/GhostPages/LeakedPage/LeakedPage';
import { NewsDetail } from '@/pages/GhostPages/NewsDetail';
import { AwaitingPublicationDetail } from '@/pages/GhostPages/AwaitingPublicationDetail';
import { LealedDetail } from '@/pages/GhostPages/LealedDetail';

export const router = createBrowserRouter([
  // ПУБЛИЧНАЯ ГЛАВНАЯ (пример)
  {
    path: '/',
    element: <RootLayout />, // или <div>Главная публичная страница</div>
    children: [
      {
        index: true,
        element: <Navigate to="/news" replace />,
      },
      // { path: 'contact', element: <ContactPage /> },
      { path: 'news', element: <NewsList /> },
      { path: 'news/:id', element: <NewsDetail /> },
      { path: 'terms-and-conditions', element: <TermsConditions /> },
      { path: 'order-service', element: <OrderService /> },
      { path: 'contact', element: <ContactUs /> },
      { path: 'campaing', element: <Campaing /> },
      { path: 'leaked-data', element: <LeakedPage /> },
      { path: 'leaked-data/:id', element: <LealedDetail /> },
      { path: 'awaiting-publication', element: <AwaitingPublicationPage /> },
      { path: 'awaiting-publication/:id', element: <AwaitingPublicationDetail /> },
      { path: 'chat', element: <AwaitingPublicationPage /> },
      // { path: 'terms-and-conditions', element: <TermsPage /> },
      // { path: 'order-service', element: <OrderServicePage /> },
    ],
  },
  // СТРАНИЦА ЛОГИНА (публичная)
  {
    path: '/login',
    // path: '/account/authentication/credentials/verification/authorization/secure/signin/ZxYwVuTsRqPoNmLkJiHgFeDcBa9876543210QwErTyUiOpAsDfGhJkLzXcVbNm',
    element: <LoginPage />,
  },
  // ПРИВАТНАЯ ЧАСТЬ /admin
  {
    path: '/admin',
    element: <AuthLayout />,  // тут проверяется авторизация
    children: privateRoutes,  // все админ-маршруты (см. ниже)
  },
  // 404
  {
    path: '/404',
    element: <NotFoundPage />,
  },
  // Любой неизвестный маршрут => 404
  {
    path: '*',
    element: <Navigate to="/404" replace />,
  },
]);

export const RouterProvider = () => <Provider router={router} />;
