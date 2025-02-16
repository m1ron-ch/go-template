import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'

import s from './ListItemLink.module.scss'

type Props = {
  children?: ReactNode
  path: string
  title: string
}

export const ListItemLink = ({ children, path, title }: Props) => {
  const url = useLocation()

  const isSelected = url.pathname.split('/')[1] === path.slice(1)

  return (
    <ListItem
      disablePadding
      sx={{
        '&& .Mui-selected': {
          bgcolor: 'rgb(2 110 252 / 15%)',
        },
        color: 'black',
      }}
    >
      <ListItemButton component={Link} selected={isSelected} to={path}>
        <ListItemIcon
          sx={{
            color: 'black',
          }}
        >
          {children}
        </ListItemIcon>
        <ListItemText className={s.text} primary={title} />
      </ListItemButton>
    </ListItem>
  )
}
