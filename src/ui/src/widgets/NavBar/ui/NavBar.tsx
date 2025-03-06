import { AppSettings, ListItemLink, ROUTES } from '@/shared'
import {
  ReadOutlined,
  FileSearchOutlined,
  FileProtectOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  MessageOutlined,
  PhoneOutlined,
  PictureOutlined,
  FileOutlined,
} from '@ant-design/icons'
import { List, Tooltip } from '@mui/material'
import clsx from 'clsx'
import { useEffect, useState } from 'react'

type Props = {
  className?: string
}

const iconStyle = { fontSize: '22px' }

export const NavBar = ({ className }: Props) => {
  const [leakedCount, setLeakedCount] = useState<number | null>(null)

  useEffect(() => {
    fetch(`${AppSettings.API_URL}/leaked-not-accepted`, {
      method: 'GET',
      credentials: 'include',
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json()
          console.log(data.count)
          setLeakedCount(data.count)
        } else {
          setLeakedCount(null)
        }
      })
      .catch(() => {
        setLeakedCount(null)
      })
  }, [])


  return (
    <nav className={clsx(className)}>
      <List>
        <ListItemLink path={ROUTES.NEWS} title={'News'}>
          <ReadOutlined style={iconStyle} />
        </ListItemLink>
        <Tooltip title="Number of data awaiting approval and publication">
          <ListItemLink path={ROUTES.LEAKED_DATA} title={`Leaked Data (${leakedCount})`}>
            <FileSearchOutlined style={iconStyle} />
          </ListItemLink>
        </Tooltip>
        <ListItemLink path={ROUTES.TERMS_AND_CONDITIONS} title={'Terms and Conditions'}>
          <FileProtectOutlined style={iconStyle} />
        </ListItemLink>
        <ListItemLink path={ROUTES.ORDER_SERVICE} title={'Order a service'}>
          <ShoppingCartOutlined style={iconStyle} />
        </ListItemLink>
        <ListItemLink path={ROUTES.CONTACT_US} title={'Contact Us'}>
          <PhoneOutlined style={iconStyle} />
        </ListItemLink>
        <ListItemLink path={ROUTES.USERS} title={'Users'}>
          <TeamOutlined style={iconStyle} />
        </ListItemLink>
        <ListItemLink path={ROUTES.CHATS} title={'Chats'}>
          <MessageOutlined style={iconStyle} />
        </ListItemLink>
        <ListItemLink path={ROUTES.MEDIA} title={'Media'}>
          <PictureOutlined style={iconStyle} />
        </ListItemLink>
        <ListItemLink path={ROUTES.FILES} title={'Files'}>
          <FileOutlined style={iconStyle} />
        </ListItemLink>
      </List>
    </nav>
  )
}
