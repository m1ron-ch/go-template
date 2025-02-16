import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.scss';

const NotFoundPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1>404 - Not Found</h1>
      <p>Страница, которую вы ищете, не существует.</p>
      <Link to="/" className={styles.button}>
        Вернуться на главную
      </Link>
    </div>
  );
};

export default NotFoundPage;
