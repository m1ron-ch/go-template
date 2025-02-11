import React, { useEffect, useState, useRef } from 'react'
import { Layout, List, Avatar, Input, Modal, Dropdown, MenuProps, Button, Popconfirm } from 'antd'
import s from './ChatsPage.module.scss'
import { AppSettings } from '@/shared'

const { Sider } = Layout

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
}

interface Chat {
  id: number
  name: string
  lastMessage: string
  messages: Message[]
}

export const ChatsPage: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChatId, setActiveChatId] = useState<number | null>(null)
  const [newMsg, setNewMsg] = useState('')
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editText, setEditText] = useState('')
  const [editMessageId, setEditMessageId] = useState<number | null>(null)
  const [currUser, setCurrUser] = useState<User | null>(null)
  const [ws, setWs] = useState<WebSocket | null>(null)

  // ref для автопрокрутки
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const activeChat = chats.find(c => c.id === activeChatId) || null

  // При первом рендере получаем список чатов и текущего пользователя
  useEffect(() => {
    fetch(`${AppSettings.API_URL}/chats`, { method: 'GET', credentials: 'include' })
      .then(res => res.json())
      .then((data: any[]) => {
        const updatedChats = data.map(item => ({
          id: item.id,
          name: item.name,
          lastMessage: item.last_message ? item.last_message : <i>Empty chat</i>,
          messages: [] as Message[],
        }))
        setChats(updatedChats)
      })
      .catch(console.error)

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

  // Автоскролл вниз, когда меняется чат или список сообщений
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activeChatId, activeChat?.messages])

  // При выборе чата — делаем fetch сообщений и открываем WS
  const handleSelectChat = async (id: number) => {
    setActiveChatId(id)
    
    // Закрыть предыдущий WS, если был
    if (ws) {
      ws.close()
      setWs(null)
    }

    // Открываем новый WebSocket для выбранного чата
    console.log(`id: ${id}`);
    console.log(`curr user: ${currUser?.user_id}`);
    const newWs = new WebSocket(`ws://localhost:8080/ws/chat?chat_id=${id}&user_id=${currUser?.user_id}`)

    newWs.onopen = () => {
      console.log('WS connected to chat', id)
    }
    newWs.onmessage = (evt) => {
      const data = JSON.parse(evt.data)
      console.log('WS message:', data)

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
        default:
          console.warn('unknown WS action:', data.action)
      }
    }
    newWs.onclose = () => {
      console.log('WS disconnected from chat', id)
    }

    setWs(newWs)

    try {
      // Получаем все сообщения этого чата
      const res = await fetch(`${AppSettings.API_URL}/chats/${id}/messages`, {
        method: 'GET',
        credentials: 'include',
      })
      const data = await res.json()
      // Преобразуем в структуру Message
      const mappedMessages: Message[] = data.map((m: any) => ({
        id: m.id,
        text: m.content,
        sender: m.sender.role_id === 1 ? 'me' : 'other',
        sender_name: m.sender.role_id === 1 ? "campaign's representative/recovery company" : m.sender?.login ,
        isRead: true,
      }))
      setChats(prev =>
        prev.map(chat =>
          chat.id === id
            ? {
                ...chat,
                messages: mappedMessages,
                lastMessage: mappedMessages.length > 0
                  ? mappedMessages[mappedMessages.length - 1].text
                  : '',
              }
            : chat
        )
      )
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  // ======== Обработка входящих WS-событий ========
  const handleWsCreateMessage = (data: any) => {
    setChats(prevChats =>
      prevChats.map(chat => {
        console.log(chat.id)
        console.log(data.chat_id)
        if (chat.id !== data.chat_id) return chat 
        console.log(data)
        return {
          ...chat,
          messages: [...chat.messages, {
            id: data.message_id,
            text: data.content,
            sender: data.sender_id === currUser?.user_id ? 'me' : 'other',
            sender_name: data.role_id === 1 ? "campaign's representative/recovery company" : data.login,
            isRead: false,
          }],
          lastMessage: data.content,
        }
      })
    )
  }

  const handleWsEditMessage = (data: any) => {
    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id !== activeChatId) return chat

        const updated = chat.messages.map(m =>
          m.id === data.message_id
            ? { ...m, text: data.content }
            : m
        )
        const lastMsg = updated.length > 0 ? updated[updated.length - 1].text : ''
        return { ...chat, messages: updated, lastMessage: lastMsg }
      })
    )
  }

  const handleWsDeleteMessage = (data: any) => {
    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id !== activeChatId) return chat

        const filtered = chat.messages.filter(m => m.id !== data.message_id)
        const lastMsg = filtered.length > 0 ? filtered[filtered.length - 1].text : ''
        return { ...chat, messages: filtered, lastMessage: lastMsg }
      })
    )
  }

  // ======== Отправка (Create) ========
  const handleSendMessage = () => {
    if (!newMsg.trim() || !ws) return
    // Отправляем действие "create" по WS:
    ws.send(JSON.stringify({
      action: 'create',
      content: newMsg,
    }))
    setNewMsg('')
  }

  // ======== Edit ========
  const handleEditMessage = (msgId: number, text: string) => {
    setEditMessageId(msgId)
    setEditText(text)
    setEditModalVisible(true)
  }

  const handleSaveEdit = () => {
    if (!ws || editMessageId == null) return
    ws.send(JSON.stringify({
      action: 'edit',
      message_id: editMessageId,
      content: editText,
    }))
    setEditModalVisible(false)
    setEditMessageId(null)
    setEditText('')
  }

  // ======== Delete ========
  const handleDeleteMessage = (msgId: number) => {
    if (!ws) return
    ws.send(JSON.stringify({
      action: 'delete',
      message_id: msgId,
    }))
  }

  // Меню «правый клик» для сообщений (Edit / Delete)
  const getMenuItems = (msgId: number, msgText: string): MenuProps['items'] => [
    {
      key: 'edit',
      label: 'Edit',
      onClick: () => handleEditMessage(msgId, msgText),
    },
    {
      key: 'delete',
      label: 'Delete',
      onClick: () => handleDeleteMessage(msgId),
    },
  ]

  return (
    <Layout className={s.chatsPage}>
      <Sider width={280} theme="light" className={s.sider}>
        <List
          dataSource={chats}
          renderItem={(chat) => (
            <List.Item
              className={chat.id === activeChatId ? s.activeChat : ''}
              onClick={() => handleSelectChat(chat.id)}
            >
              <List.Item.Meta
                style={{ marginLeft: '15px' }}
                avatar={<Avatar>{chat.name[0]}</Avatar>}
                title={chat.name}
                description={chat.lastMessage}
              />
            </List.Item>
          )}
        />
      </Sider>

      <Layout className={s.rightSide}>
        {activeChat ? (
          <>
            <div className={s.chatHeader}>{activeChat.name}</div>
            <div className={s.messagesContainer}>
              {activeChat.messages.map((m) => {
                const isMe = m.sender === 'me'
                const menuItems = getMenuItems(m.id, m.text)

                return (
                  <Dropdown key={m.id} menu={{ items: menuItems }} trigger={['contextMenu']}>
                    <div className={`${s.messageItem} ${isMe ? s.myMessage : s.otherMessage}`}>
                      <div className={s.sender}><b>{m.sender_name}</b></div>
                      <div className={s.messageText}>{m.text}</div>
                      {/* Пример отображения «прочитано/не прочитано» */}
                      <div className={s.checks}>
                        {m.isRead && isMe && (
                          <span className={s.readMark}>
                            <span className={s.checkOne}>✓</span>
                            <span className={s.checkTwo}>✓</span>
                          </span>
                        )}
                        {!m.isRead && isMe && <span className={s.unreadMark}>✓</span>}
                      </div>
                    </div>
                  </Dropdown>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className={s.inputSection}>
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
              <Popconfirm
                title="did you check the message attentively?"
                onConfirm={handleSendMessage}  // колбэк вызывается только после нажатия "Yes"
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="primary"
                  style={{ marginLeft: 8, marginTop: 8 }}
                >
                  Send
                </Button>
              </Popconfirm>
            </div>
          </>
        ) : (
          <div className={s.noChatSelected}>Select a chat</div>
        )}
      </Layout>

      <Modal
        title="Edit Message"
        open={editModalVisible}
        onOk={handleSaveEdit}
        onCancel={() => setEditModalVisible(false)}
      >
        <Input.TextArea
          rows={4}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
        />
      </Modal>
    </Layout>
  )
}
