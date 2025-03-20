import React, { useEffect, useState, useRef } from 'react'
import { Layout, List, Avatar, Input, Button, Tag, Space, Badge } from 'antd'
import s from './ChatsPage.module.scss'
import { AppSettings } from '@/shared'
import { SendOutlined } from '@ant-design/icons'

const { Sider } = Layout

function isToday(date: Date) {
  const now = new Date()
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  )
}


function formatDateOrTime(dateString: string) {
  const date = new Date(dateString)
  if (isToday(date)) {
    // e.g. "13:22"
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } else {
    // e.g. "17.02.2025"
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }
}

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
  lastMessageTime?: string
}

interface ChatsPageProps {
  leaked_id: number
}

export const ChatsPage: React.FC<ChatsPageProps> = ({ leaked_id }) => {
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChatId, setActiveChatId] = useState<number | null>(null)
  const [newMsg, setNewMsg] = useState('')
  const [currUser, setCurrUser] = useState<User | null>(null)

  // WebSocket для «активного» чата
  const [chatWs, setChatWs] = useState<WebSocket | null>(null)
  const [chatStatus, setChatStatus] = useState<string>('')

  // «Глобальный» WebSocket (для обновлений по всем чатам)
  const [_, setGlobalWs] = useState<WebSocket | null>(null)

  // ref для автопрокрутки вниз
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const activeChat = chats.find(c => c.id === activeChatId) || null

  // ======= 1) Загружаем список чатов (левая колонка) и текущего пользователя =======
  useEffect(() => {
    fetch(`${AppSettings.API_URL}/chats_user/${leaked_id}`, {
      method: 'GET',
      credentials: 'include',
    })
      .then(res => res.json())
      .then((data: any[]) => {
        const updatedChats = data.map(item => {
          return {
            id: item.id,
            name: item.name,
            lastMessage: item.last_message ? item.last_message : <i>Empty chat</i>,
            lastMessageTime: item.created_at ? formatDateOrTime(item.created_at) : '',
            messages: [],
            count_un_read: item.count_un_read,
          }
        })
        setChats(updatedChats)
      })
      .catch(console.error)

    // Получаем данные о текущем пользователе
    fetch(`${AppSettings.API_URL}/auth/me`, {
      method: 'GET',
      credentials: 'include',
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json()
          setCurrUser(data)
        } else {
          setCurrUser(null)
        }
      })
      .catch(() => {
        setCurrUser(null)
      })
  }, [])

  // ======= 2) Автоскролл при смене чата или при добавлении сообщений =======
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activeChatId, activeChat?.messages])

  // ======= 3) «Глобальный» WebSocket (слушаем события для всех чатов) =======
  useEffect(() => {
    if (!currUser) return

    // Допустим, на сервере есть ws://.../ws/user?user_id=...
    const ws = new WebSocket(`ws://${AppSettings.WEBSOCKET_URL}/ws/user?user_id=${currUser.user_id}`)

    ws.onopen = () => {
      console.log('[globalWs] connected')
    }
    ws.onclose = () => {
      console.log('[globalWs] disconnected')
    }

    ws.onmessage = (evt) => {
      const data = JSON.parse(evt.data)
      console.log('[globalWs] message:', data)
      // Сервер шлёт события: { action: 'create'|'edit'|'delete', chat_id, ... }
      switch (data.action) {
        case 'create':
          onGlobalCreate(data)
          break
        case 'edit':
          onGlobalEdit(data)
          break
        case 'delete':
          onGlobalDelete(data)
          break
        default:
          console.warn('[globalWs] unknown action', data.action)
      }
    }

    setGlobalWs(ws)

    // При размонтировании компонента — закрываем
    return () => {
      ws.close()
    }
  }, [currUser])

  // ===== Обработчики «глобальных» событий (обновляем ленту чатов) =====
  function onGlobalCreate(data: any) {
    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id !== data.chat_id) {
          return chat
        }

        // Автор сообщения — текущий пользователь?
        const isFromMe = data.sender_id === currUser?.user_id
        const newMessage: Message = {
          id: data.message_id,
          text: data.content,
          sender: isFromMe ? 'me' : 'other',
          sender_name: data.role_id === 1
            ? "campaign's representative/recovery company"
            : data.login,
          isRead: false,
          created_at: new Date().toISOString(), // или data.created_at, если оно приходит
        }

        // Если чат не активен и сообщение не от меня — наращиваем count_un_read
        let newCount = chat.count_un_read
        if (!isFromMe && activeChatId !== chat.id) {
          newCount = chat.count_un_read + 1
        }

        // Подмешаем сообщение в список, но только если этот чат сейчас открыт
        // (или хотим хранить историю в любом случае — тогда добавляем всегда).
        const updatedMessages = (activeChatId === chat.id)
          ? [...chat.messages, newMessage]
          : chat.messages

        return {
          ...chat,
          messages: updatedMessages,
          lastMessage: data.content,
          count_un_read: newCount,
          lastMessageTime: formatDateOrTime(newMessage.created_at),
        }
      })
    )
  }

  function onGlobalEdit(data: any) {
    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id !== data.chat_id) return chat

        const updatedMessages = chat.messages.map(m =>
          m.id === data.message_id ? { ...m, text: data.content } : m
        )
        // Если редактируем последнее, обновляем lastMessage
        let lastMsg = chat.lastMessage
        const lastMsgId = chat.messages[chat.messages.length - 1]?.id
        if (lastMsgId === data.message_id) {
          lastMsg = data.content
        }

        return {
          ...chat,
          messages: updatedMessages,
          lastMessage: lastMsg,
        }
      })
    )
  }

  function onGlobalDelete(data: any) {
    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id !== data.chat_id) return chat

        const filtered = chat.messages.filter(m => m.id !== data.message_id)
        // Если удалили последнее
        let lastMsg = chat.lastMessage
        if (chat.messages[chat.messages.length - 1]?.id === data.message_id) {
          lastMsg = filtered.length
            ? filtered[filtered.length - 1].text
            : ''
        }

        return {
          ...chat,
          messages: filtered,
          lastMessage: lastMsg,
        }
      })
    )
  }

  // ======= 4) Локальный WebSocket для «активного» чата (edit/delete/create) =======
  const handleSelectChat = async (chatId: number) => {
    setActiveChatId(chatId)

    // Закрываем предыдущий сокет для старого чата (если был)
    if (chatWs) {
      chatWs.onopen = null
      chatWs.onmessage = null
      chatWs.onclose = null
      chatWs.close()
      setChatWs(null)
    }

    // Открываем новый WebSocket для выбранного чата
    const newWs = new WebSocket(
      `ws://${AppSettings.WEBSOCKET_URL}/ws/chat?chat_id=${chatId}&user_id=${currUser?.user_id}`
    )

    newWs.onopen = () => {
      setChatStatus('Connected')
      console.log('[chatWs] connected to chat', chatId)
    }
    newWs.onmessage = (evt) => {
      const data = JSON.parse(evt.data)
      console.log('[chatWs] message:', data)

      switch (data.action) {
        case 'create':
          handleWsCreateMessage(data)
          break
        case 'edit':
          handleWsEditMessage(data)
          break
        case 'delete':
          handleWsDeleteMessage(data)
          break
        case 'read_messages':
          onGlobalReadMessages(data)
          break
        default:
          console.warn('[chatWs] unknown action:', data.action)
      }
    }
    newWs.onclose = () => {
      setChatStatus('Disconnected')
      console.log('[chatWs] disconnected from chat', chatId)
    }
    setChatWs(newWs)

    // После открытия чата грузим историю сообщений
    try {
      const res = await fetch(`${AppSettings.API_URL}/chats/${chatId}/messages`, {
        method: 'GET',
        credentials: 'include',
      })
      const data = await res.json()

      // Преобразуем к Message
      const mappedMessages: Message[] = data.map((m: any) => ({
        id: m.id,
        text: m.content,
        sender: m.sender.role_id != 1 ? 'me' : 'other',
        sender_name: m.sender.role_id === 1
          ? "campaign's representative/recovery company"
          : m.sender?.login,
        isRead: m.is_read,
        created_at: m.created_at,
      }))

      // Обновляем нужный чат в стейте
      setChats(prev =>
        prev.map(chat =>
          chat.id === chatId
            ? {
                ...chat,
                messages: mappedMessages,
                lastMessage: mappedMessages.length > 0
                  ? mappedMessages[mappedMessages.length - 1].text
                  : '',
                lastMessageTime: mappedMessages.length > 0
                  ? formatDateOrTime(mappedMessages[mappedMessages.length - 1].created_at)
                  : '',
                count_un_read: 0,
                // Можно обнулить count_un_read, если считаем, что все прочитаны при открытии
              }
            : chat
        )
      )
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  // ======= 5) Обработка входящих WS-событий (только для активного чата) =======
  const handleWsCreateMessage = (data: any) => {
    // Просто дополняем список сообщений в этом чате
    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id !== data.chat_id) return chat

        const newMsg: Message = {
          id: data.message_id,
          text: data.content,
          sender: data.sender_id === currUser?.user_id ? 'me' : 'other',
          sender_name: data.role_id === 1
            ? "campaign's representative/recovery company"
            : data.login,
          isRead: false,
          created_at: new Date().toISOString(),
        }

        return {
          ...chat,
          messages: [...chat.messages, newMsg],
          lastMessage: data.content,
        }
      })
    )
  }

  const handleWsEditMessage = (data: any) => {
    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id !== data.chat_id) return chat

        const updatedMessages = chat.messages.map(m =>
          m.id === data.message_id
            ? { ...m, text: data.content }
            : m
        )
        const lastMsg =
          updatedMessages.length > 0
            ? updatedMessages[updatedMessages.length - 1].text
            : ''

        return {
          ...chat,
          messages: updatedMessages,
          lastMessage: lastMsg,
        }
      })
    )
  }

  const handleWsDeleteMessage = (data: any) => {
    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id !== data.chat_id) return chat

        const filtered = chat.messages.filter(m => m.id !== data.message_id)
        const lastMsg = filtered.length > 0
          ? filtered[filtered.length - 1].text
          : ''

        return {
          ...chat,
          messages: filtered,
          lastMessage: lastMsg,
        }
      })
    )
  }

  // ======= 6) Отправка нового сообщения (Create) =======
  const handleSendMessage = () => {
    if (!newMsg.trim() || !chatWs) return

    chatWs.send(JSON.stringify({
      action: 'create',
      content: newMsg,
    }))
    setNewMsg('')
  }

  function groupMessagesByDate(messages: Message[]) {
    return messages.reduce((acc, msg) => {
      const dateObj = new Date(msg.created_at)
      
      // Example: use just the YYYY-MM-DD part, or do a localeDateString as a “group key”.
      // Alternatively, keep it as e.g. "2025-02-17" if you want a simpler key format.
      const dateKey = dateObj.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
  
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(msg)
      return acc
    }, {} as Record<string, Message[]>)
  }

  function onGlobalReadMessages(data: any) {
    const { chat_id, sender_id } = data
    if (!currUser) return
  
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id !== chat_id) {
          return chat
        }
  
        // Если `sender_id === currUser.user_id`, значит **я** (текущий пользователь) открыл чат,
        // а сервер распространил событие «read_messages» всем остальным.
        //
        // Если `sender_id !== currUser.user_id`, значит собеседник открыл чат,
        // и нам надо пометить «наши» (sender: 'me') сообщения как прочитанные.
        //
        // Так как в вашем коде "sender" хранится как 'me' / 'other', 
        // то можно разделить логику:
  
        let updatedMessages
        if (sender_id === currUser.user_id) {
          // Я прочитал (для моей же клиентской копии обычно это уже учтено,
          // но если хотите синхронизировать и на моём фронте, можно сделать так):
          //
          // Помечаем все входящие для меня (т.е. sender === 'other') как isRead = true,
          // потому что я их только что открыл.
          updatedMessages = chat.messages.map((m) =>
            m.sender === 'other'
              ? { ...m, isRead: true }
              : m
          )
  
          return {
            ...chat,
            messages: updatedMessages,
            // Я открыл чат — у меня count_un_read = 0
            count_un_read: 0,
          }
        } else {
          // Собеседник прочитал наши сообщения
          // => помечаем мои исходящие (sender === 'me') как isRead = true
          updatedMessages = chat.messages.map((m) =>
            m.sender === 'me'
              ? { ...m, isRead: true }
              : m
          )
  
          // Количество моих непрочитанных (с его стороны) в UI обычно не нужно обнулять,
          // но вы можете при желании следить и за этим счётчиком.
          // Обычно здесь обнуляют "наши" unread, если мы хотим считать,
          // что чат в целом «очищен» от непрочитанных.
  
          return {
            ...chat,
            messages: updatedMessages,
          }
        }
      })
    )
  }

  function formatChatDateLabel(dateString: string) {
    // Our dateString is "DD.MM.YYYY" from above
    // Convert it back to a Date
    const [day, month, year] = dateString.split('.')
    const dateObj = new Date(+year, +month - 1, +day)
  
    if (isToday(dateObj)) {
      return 'Today'
    } else {
      return dateString // e.g. "17.02.2025"
    }
  }

  const groupedMessages = React.useMemo(() => {
    if (!activeChat) return {}
  
    return groupMessagesByDate(activeChat.messages)
  }, [activeChat])
  
  const dateKeys = Object.keys(groupedMessages)
  
  // Optionally sort dateKeys by actual date:
  dateKeys.sort((a, b) => {
    // Convert "17.02.2025" -> date object
    const da = new Date(a.split('.').reverse().join('-'))
    const db = new Date(b.split('.').reverse().join('-'))
    return da.getTime() - db.getTime()
  })

  // Меню при ПКМ на сообщение
  // const getMenuItems = (msgId: number, msgText: string): MenuProps['items'] => [
  //   {
  //     key: 'edit',
  //     label: 'Edit',
  //     onClick: () => handleEditMessage(msgId, msgText),
  //   },
  //   {
  //     key: 'delete',
  //     label: 'Delete',
  //     onClick: () => handleDeleteMessage(msgId),
  //   },
  // ]

  return (
    <Layout className={s.chatsPage}>
      {/* Левая колонка со списком чатов */}
      <Sider width={280} theme="light" className={s.sider}>
        <List
          dataSource={chats}
          renderItem={(chat) => (
            <List.Item
              onClick={() => handleSelectChat(chat.id)}
              style={{ cursor: 'pointer', padding: '8px 16px' }}
            >
              <div style={{ width: '100%' }}>
                {/* Верхняя часть: аватар + имя чата (слева), дата последнего сообщения (справа) */}
                <div 
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 4
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar style={{ marginRight: 8 }}>{chat.name?.[0]}</Avatar>
                    <strong>{chat.name}</strong>
                  </div>
                  <span style={{ color: '#999' }}>{chat.lastMessageTime}</span>
                </div>

                {/* Нижняя часть: последнее сообщение (слева), счётчик непрочитанных (справа) */}
                <div 
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ color: '#555' }}>{chat.lastMessage}</span>
                  {chat.count_un_read > 0 && (
                    <Badge
                      count={chat.count_un_read}
                      style={{ backgroundColor: '#52c41a' }}
                    />
                  )}
                </div>
              </div>
            </List.Item>
          )}
        />
      </Sider>

      {/* Правая часть: шапка, список сообщений, поле ввода */}
      <Layout className={s.rightSide}>
        {activeChat ? (
          <>
            <div className={s.chatHeader}>
              <Space>
                {activeChat.name} 
                {chatStatus === 'Connected' ? (
                  <Tag color='green'>Connected</Tag>
                ) : (
                  <Tag color='red'>Disconnected</Tag>
                )}
              </Space>
            </div>

            <div className={s.messagesContainer}>
              {dateKeys.map(dateKey => {
                const messagesForDate = groupedMessages[dateKey]

                return (
                  <div key={dateKey}>
                    {/* Centered date divider */}
                    <div className={s.dateDivider}>
                      {formatChatDateLabel(dateKey)}
                    </div>
                    
                    {messagesForDate.map((m) => {
                      const isMe = m.sender === 'me'
                      // const menuItems = getMenuItems(m.id, m.text)

                      return (
                        <div className={`${s.messageItem} ${isMe ? s.myMessage : s.otherMessage}`}>
                          <div className={s.sender}><b>{m.sender_name}</b></div>
                          <div className={s.messageText}>{m.text}</div>

                          <div className={s.checks}>
                            {/* If you want to show time for the message itself: */}
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
              {/* «якорь» для автоскролла */}
              <div ref={messagesEndRef} />
            </div>

            <div className={s.inputSection} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ flex: 1 }}>
                <Input.TextArea
                  rows={2}
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onPressEnter={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                  placeholder="Type your message..."
                  style={{ width: '100%' }}
                />
              </div>
              
              <Button type="primary" onClick={handleSendMessage} icon={<SendOutlined />} />
            </div>
          </>
        ) : (
          <div className={s.noChatSelected}>Select a chat</div>
        )}
      </Layout>
    </Layout>
  )
}
