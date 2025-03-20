import { createBrowserRouter, Navigate, RouterProvider as Provider } from 'react-router-dom';

import NotFoundPage from '@/pages/NotFound/NotFoundPage';
import { AuthLayout, LoginPage, RootLayout } from '@/pages';
// ИМПОРТИРУЕМ privateRoutes (описаны ниже):
import { privateRoutes } from './routerSettings'; 
import { NewsList } from '@/pages/GhostPages/NewsList';
import { TermsConditions } from '@/pages/GhostPages/TermsConditions';
import { OrderService } from '@/pages/GhostPages/OrderService';
import { ContactUs } from '@/pages/GhostPages/ContactUs';
import AwaitingPublicationPage from '@/pages/GhostPages/AwaitingPublicationPage/AwaitingPublicationPage';
import LeakedPage from '@/pages/GhostPages/LeakedPage/LeakedPage';
import { NewsDetail } from '@/pages/GhostPages/NewsDetail';
import { AwaitingPublicationDetail } from '@/pages/GhostPages/AwaitingPublicationDetail';
import { LealedDetail } from '@/pages/GhostPages/LealedDetail';
import Campaign from '@/pages/GhostPages/Campaign/Campaign';
import { SupportChatPage } from '@/pages/GhostPages/ChatPage/SupportChatPage';

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
      { path: 'campaign', element: <Campaign /> },
      { path: 'leaked-data', element: <LeakedPage /> },
      { path: 'leaked-data/:id', element: <LealedDetail /> },
      { path: 'awaiting-publication', element: <AwaitingPublicationPage /> },
      { path: 'awaiting-publication/:id', element: <AwaitingPublicationDetail /> },
      { path: 'chat', element: <AwaitingPublicationPage /> },
      { path: 'support', element: <SupportChatPage /> },
      // { path: 'terms-and-conditions', element: <TermsPage /> },
      // { path: 'order-service', element: <OrderServicePage /> },
    ],
  },
  // СТРАНИЦА ЛОГИНА (публичная)
  {
    //path: '/login',
    path: '/ZxYwVuTsRqPoNmLkJiHgFeDcBa9876543210QwErTyUiOpAsDf/GhJkLzXcVbNmZxYwVuTsRqPoNmLkJiHgFeDcBa9876543210Qw/ErTyUiOpAsDfGhJkLzXcVbNmZxYwVuTsRqPoNmLkJiHgFeDcBa/9876543210QwErTyUiOpAsDfGhJkLzXcVbNmZxYwVuTsRqPoNm/LkJiHgFeDcBa9876543210QwErTyUiOpAsDfGhJkLzXcVbNmZx/YwVuTsRqPoNmLkJiHgFeDcBa9876543210QwErTyUiOpAsDfGh/JkLzXcVbNmZxYwVuTsRqPoNmLkJiHgFeDcBa9876543210QwEr/TyUiOpAsDfGhJkLzXcVbNmZxYwVuTsRqPoNmLkJiHgFeDcBa98/76543210QwErTyUiOpAsDfGhJkLzXcVbNmZxYwVuTsRqPoNmLk/JiHgFeDcBa9876543210QwErTyUiOpAsDfGhJkLzXcVbNmZxYw/VuTsRqPoNmLkJiHgFeDcBa9876543210QwErTyUiOpAsDfGhJk/LzXcVbNmZxYwVuTsRqPoNmLkJiHgFeDcBa9876543210QwErTy/UiOpAsDfGhJkLzXcVbNmZxYwVuTsRqPoNmLkJiHgFeDcBa9876/543210QwErTyUiOpAsDfGhJkLzXcVbNmZxYwVuTsRqPoNmLkJi/HgFeDcBa9876543210QwErTyUiOpAsDfGhJkLzXcVbNmZxYwVu/TsRqPoNmLkJiHgFeDcBa9876543210QwErTyUiOpAsDfGhJkLz/XcVbNmZxYwVuTsRqPoNmLkJiHgFeDcBa9876543210QwErTyUi/OpAsDfGhJkLzXcVbNmZxYwVuTsRqPoNmLkJiHgFeDcBa987654/3210QwErTyUiOpAsDfGhJkLzXcVbNmZxYwVuTsRqPoNmLkJiHg/FeDcBa9876543210QwErTyUiOpAsDfGhJkLzXcVbNmZxYwVuTs/RqPoNmLkJiHgFeDcBa9876543210QwErTyUiOpAsDfGhJkLzXc/VbNmZxYwVuTsRqPoNmLkJiHgFeDcBa9876543210QwErTyUiOp/AsDfGhJkLzXcVbNmZxYwVuTsRqPoNmLkJiHgFeDcBa98765432/10QwErTyUiOpAsDfGhJkLzXcVbNmZxYwVuTsRqPoNmLkJiHgFe/DcBa9876543210QwErTyUiOpAsDfGhJkLzXcVbNm',
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
