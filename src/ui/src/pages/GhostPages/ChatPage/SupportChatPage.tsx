import React, { useEffect, useState, useRef, useMemo } from 'react'
import { Layout, Input, Button, Tag, Space } from 'antd'
import s from './ChatsPage.module.scss'
import { AppSettings } from '@/shared'
import { SendOutlined } from '@ant-design/icons'

interface User {
  user_id: number
  login: string
  role_id: number
}

interface Message {
  id: number
  text: string
  sender: 'me' | 'other'
  sender_name: string
  isRead: boolean
  created_at: string
}

interface Chat {
  id: number
  name: string
  lastMessage: string
  messages: Message[]
  count_un_read: number
}

// Примеры утилит
function isToday(date: Date) {
  const now = new Date()
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  )
}

// function formatDateOrTime(dateString: string) {
//   const date = new Date(dateString)
//   if (isToday(date)) {
//     // e.g. "13:22"
//     return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//   } else {
//     // e.g. "17.02.2025"
//     return date.toLocaleDateString('ru-RU', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric',
//     })
//   }
// }

export const SupportChatPage: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null)
  const [currUser, setCurrUser] = useState<User | null>(null)

  // Признак, что мы УЖЕ загрузили сообщения (чтобы не делать повторный fetch при каждом ререндере)
  const [messagesLoaded, setMessagesLoaded] = useState(false)

  // WebSocket
  const [chatWs, setChatWs] = useState<WebSocket | null>(null)
  const [chatStatus, setChatStatus] = useState<'Connected' | 'Disconnected'>('Disconnected')

  const [newMsg, setNewMsg] = useState('')
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // 1) Загружаем юзера и сам чат (ID, name, count_un_read) — без messages
  useEffect(() => {
    // А) Загружаем текущего пользователя
    fetch(`${AppSettings.API_URL}/auth/me`, { credentials: 'include' })
      .then(res => res.json())
      .then(setCurrUser)
      .catch(() => setCurrUser(null))

    // Б) Загружаем «один чат» (ID, name) по /chats/u/v1
    fetch(`${AppSettings.API_URL}/chats/u/v1`, { credentials: 'include' })
      .then(r => r.json())
      .then((chatData: any) => {
        const prepared: Chat = {
          id: chatData.id,
          name: chatData.name,
          lastMessage: chatData.last_message ?? '',
          count_un_read: chatData.count_un_read ?? 0,
          messages: [],
        }
        setChat(prepared)
      })
      .catch(err => console.error('Load chat error:', err))
  }, [])

  // 2) Когда у нас уже есть `chat` и `currUser`, грузим MESSAGES и открываем WS — но только если messagesLoaded = false
  useEffect(() => {
    if (!chat) return
    if (!currUser) return
    if (messagesLoaded) return // <- предотвратим повторный fetch

    // ========== ЗАГРУЗКА СООБЩЕНИЙ ==========
    fetch(`${AppSettings.API_URL}/chats/${chat.id}/messages`, { credentials: 'include' })
      .then(r => r.json())
      .then((msgs: any[]) => {
        const mapped: Message[] = msgs.map(m => ({
          id: m.id,
          text: m.content,
          sender: m.sender.role_id === currUser.role_id ? 'me' : 'other',
          sender_name: m.sender.role_id === 1 ? 'Admin' : (m.sender.login || '???'),
          isRead: m.is_read,
          created_at: m.created_at,
        }))
        setChat(prev => {
          if (!prev) return prev
          return { ...prev, messages: mapped }
        })
        setMessagesLoaded(true) // после успешной загрузки ставим флаг
      })
      .catch(e => console.error('Load messages error:', e))

    // ========== WS ПОДКЛЮЧЕНИЕ ==========
    const ws = new WebSocket(`ws://${AppSettings.WEBSOCKET_URL}/ws/chat?chat_id=${chat.id}&user_id=${currUser.user_id}`)
    console.log(`ws://${AppSettings.WEBSOCKET_URL}/ws/chat?chat_id=${chat.id}&user_id=${currUser.user_id}`);
    ws.onopen = () => {
      setChatStatus('Connected')
      console.log('[SupportChatPage] WebSocket connected')
    }
    ws.onclose = () => {
      setChatStatus('Disconnected')
      console.log('[SupportChatPage] WebSocket disconnected')
    }
    ws.onmessage = evt => {
      const data = JSON.parse(evt.data)
      switch (data.action) {
        case 'create':
          onWsCreate(data)
          break
        case 'edit':
          onWsEdit(data)
          break
        case 'delete':
          onWsDelete(data)
          break
        case 'read_messages':
          onWsRead(data)
          break
        default:
          console.warn('WS unknown action:', data.action)
      }
    }
    setChatWs(ws)

    return () => {
      ws.close()
    }
  }, [chat, currUser, messagesLoaded]) // если chat или currUser меняется, эффект мог бы заново сработать, но мы защищены проверкой if (!messagesLoaded)

  // ======== Обработка входящих WS-сообщений =========
  function onWsCreate(data: any) {
    setChat(prev => {
      if (!prev) return prev
      const isFromMe = (data.sender_id === currUser?.user_id)
      const newMsg: Message = {
        id: data.message_id,
        text: data.content,
        sender: isFromMe ? 'me' : 'other',
        sender_name: data.role_id === 1 ? 'Admin' : data.login,
        isRead: false,
        created_at: new Date().toISOString(),
      }
      return { ...prev, messages: [...prev.messages, newMsg] }
    })
  }

  function onWsEdit(data: any) {
    setChat(prev => {
      if (!prev) return prev
      const updated = prev.messages.map(m =>
        m.id === data.message_id
          ? { ...m, text: data.content }
          : m
      )
      return { ...prev, messages: updated }
    })
  }

  function onWsDelete(data: any) {
    setChat(prev => {
      if (!prev) return prev
      const filtered = prev.messages.filter(m => m.id !== data.message_id)
      return { ...prev, messages: filtered }
    })
  }

  function onWsRead(data: any) {
    setChat(prev => {
      if (!prev) return prev
      const { sender_id } = data
      if (sender_id === currUser?.user_id) {
        // Я открыл чат -> «other» сообщения стали прочитанными
        const updated = prev.messages.map(m =>
          m.sender === 'other' ? { ...m, isRead: true } : m
        )
        return { ...prev, messages: updated }
      } else {
        // Собеседник открыл чат -> «my» сообщения стали прочитанными
        const updated = prev.messages.map(m =>
          m.sender === 'me' ? { ...m, isRead: true } : m
        )
        return { ...prev, messages: updated }
      }
    })
  }

  // ======== Автоскролл при изменении списка сообщений ========
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat?.messages])

  // ======== Отправка нового сообщения ========
  function handleSendMessage() {
    if (!newMsg.trim() || !chatWs) return
    chatWs.send(JSON.stringify({
      action: 'create',
      content: newMsg,
    }))
    setNewMsg('')
  }

  // ======== Группировка по датам (если нужна) ========
  function groupMessagesByDate(messages: Message[]) {
    return messages.reduce((acc, msg) => {
      const dateObj = new Date(msg.created_at)
      const dateKey = dateObj.toLocaleDateString('ru-RU', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      })
      if (!acc[dateKey]) acc[dateKey] = []
      acc[dateKey].push(msg)
      return acc
    }, {} as Record<string, Message[]>)
  }

  function formatChatDateLabel(dateString: string) {
    const [day, month, year] = dateString.split('.')
    const dateObj = new Date(+year, +month - 1, +day)
    if (isToday(dateObj)) {
      return 'Today'
    } else {
      return dateString
    }
  }

  const groupedMessages = useMemo(() => {
    if (!chat) return {}
    return groupMessagesByDate(chat.messages)
  }, [chat])

  const dateKeys = Object.keys(groupedMessages).sort((a, b) => {
    const da = new Date(a.split('.').reverse().join('-'))
    const db = new Date(b.split('.').reverse().join('-'))
    return da.getTime() - db.getTime()
  })

  if (!chat) {
    return <div>Loading chat info...</div>
  }

  return (
    <Layout className={s.chatsPage} style={{ height: '100vh' }}>
      <div className={s.chatHeader}>
        <Space>
          <b>Support Chat:</b> {chat.name}
          {chatStatus === 'Connected' ? (
            <Tag color="green">Connected</Tag>
          ) : (
            <Tag color="red">Disconnected</Tag>
          )}
        </Space>
      </div>

      <div className={s.messagesContainer}>
        {dateKeys.map(dateKey => {
          const msgs = groupedMessages[dateKey]
          return (
            <div key={dateKey}>
              <div className={s.dateDivider}>
                {formatChatDateLabel(dateKey)}
              </div>
              {msgs.map(m => {
                const isMe = m.sender === 'me'
                return (
                  <div
                    key={m.id}
                    className={`${s.messageItem} ${isMe ? s.myMessage : s.otherMessage}`}
                  >
                    <div className={s.sender}><b>{m.sender_name}</b></div>
                    <div className={s.messageText}>{m.text}</div>
                    <div className={s.checks}>
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {m.isRead && isMe && (
                        <span className={s.readMark}>
                          <span className={s.checkOne}>✓</span>
                          <span className={s.checkTwo}>✓</span>
                        </span>
                      )}
                      {!m.isRead && isMe && <span className={s.unreadMark}>✓</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <div
        className={s.inputSection}
        style={{ display: 'flex', gap: '8px' }}
      >
        <Input.TextArea
          rows={2}
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          onPressEnter={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          placeholder="Type your message..."
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSendMessage}
        />
      </div>
    </Layout>
  )
}
