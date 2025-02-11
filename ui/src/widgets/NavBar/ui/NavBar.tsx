import { ListItemLink, ROUTES } from '@/shared'
import {
  ReadOutlined,
  FileSearchOutlined,
  FileProtectOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  MessageOutlined,
  PhoneOutlined,
} from '@ant-design/icons'
import { List } from '@mui/material'
import clsx from 'clsx'

type Props = {
  className?: string
}

const iconStyle = { fontSize: '22px' }

export const NavBar = ({ className }: Props) => {
  return (
    <nav className={clsx(className)}>
      <List>
        <ListItemLink path={ROUTES.NEWS} title={'News'}>
          <ReadOutlined style={iconStyle} />
        </ListItemLink>
        <ListItemLink path={ROUTES.LEAKED_DATA} title={'Leaked Data'}>
          <FileSearchOutlined style={iconStyle} />
        </ListItemLink>
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
      </List>
    </nav>
  )
}
