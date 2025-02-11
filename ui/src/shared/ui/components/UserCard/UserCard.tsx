import { UserRole, UserType } from '@/shared/types'
import { getDate } from '@/shared/utils'
import { Card, Typography } from '@mui/material'

import s from './UserCard.module.scss'

const accountStatus = {
  1: 'Активен',
  2: 'Заблокирован',
  3: 'Удален',
}

export const UserCard = ({
  f_name,
  l_name,
  last_login,
  login,
  m_name,
  role_id,
  status,
}: UserType) => {
  return (
    <Card className={s.card}>
      <Typography gutterBottom variant={'h3'}>
        Логин: <span className={s.text}>{login}</span>
      </Typography>
      <Typography gutterBottom variant={'h3'}>
        ФИО: <span className={s.text}>{`${f_name} ${l_name} ${m_name}`}</span>
      </Typography>
      <Typography gutterBottom variant={'h3'}>
        Роль:
        <span className={s.text}>
          {role_id === UserRole.SuperAdmin ? 'Супер администратор' : 'Администратор'}
        </span>
      </Typography>
      <Typography gutterBottom variant={'h3'}>
        Крайний вход в систему:{' '}
        <span className={s.text}>{last_login ? getDate(last_login).toString() : ''}</span>
      </Typography>
      <Typography gutterBottom variant={'h3'}>
        Статус пользователя:
        <span className={s.text}>{accountStatus[status] || 'не определен'}</span>
      </Typography>
    </Card>
  )
}
