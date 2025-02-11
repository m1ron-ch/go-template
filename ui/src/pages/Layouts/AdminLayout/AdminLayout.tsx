import { Outlet } from 'react-router-dom';
import { Header } from '@/widgets';
import s from './AdminLayout.module.scss';

export const AdminLayout = () => {
  return (
    <div className={s.root}>
      <Header />
      <Outlet />
    </div>
  );
};
