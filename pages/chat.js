'use client'

import { useState, useEffect, useRef } from 'react'

export default function ChatPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  // Carregar mensagens ao montar
  useEffect(() => {
    fetchMessages()
  }, [])

  // Auto-scroll para última mensagem
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/chat')
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
        setError(null)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      setError('Erro ao carregar mensagens do servidor.')
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!input.trim()) return

    setLoading(true)

    try {
      // Enviar mensagem para OpenAI
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
        }),
      })

      if (res.ok) {
        const { userMessage, assistantMessage } = await res.json()
        setMessages((prev) => [...prev, userMessage, assistantMessage])
        setInput('')
        setError(null)
      } else {
        const err = await res.json()
        console.error('Error:', err)

        const friendly =
          err.details ||
          err.error ||
          'Ocorreu um erro ao falar com a IA. Tente novamente em alguns instantes.'

        // Exibir erro de forma amigável na UI
        setError(friendly)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setError('Erro ao enviar mensagem. Verifique sua conexão e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: '#0066cc', 
        color: 'white', 
        padding: '20px', 
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: 0 }}>Mythic Chat</h1>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.9 }}>Prepare para OpenAI 🚀</p>
      </div>

      {/* Messages Container */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {messages.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#999',
            fontSize: '16px'
          }}>
            Nenhuma mensagem ainda. Comece a conversa! 💬
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: msg.author === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '5px'
              }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  backgroundColor: msg.author === 'user' ? '#0066cc' : '#e0e0e0',
                  color: msg.author === 'user' ? 'white' : '#333',
                  wordWrap: 'break-word',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>
                  {msg.content}
                </p>
                <span style={{
                  fontSize: '11px',
                  opacity: msg.author === 'user' ? 0.8 : 0.6,
                  display: 'block'
                }}>
                  {new Date(msg.createdAt).toLocaleTimeString('pt-BR')}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{
        padding: '20px',
        backgroundColor: 'white',
        borderTop: '1px solid #ddd'
      }}>
        {error && (
          <div
            style={{
              marginBottom: '10px',
              padding: '10px 14px',
              borderRadius: '6px',
              backgroundColor: '#ffe6e6',
              color: '#990000',
              border: '1px solid #ffb3b3',
              fontSize: '13px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#990000',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              ×
            </button>
          </div>
        )}
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '24px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.3s',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'text'
            }}
            onFocus={(e) => e.target.style.borderColor = '#0066cc'}
            onBlur={(e) => e.target.style.borderColor = '#ddd'}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '24px',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'background-color 0.3s',
              opacity: loading || !input.trim() ? 0.6 : 1
            }}
            onMouseEnter={(e) => !loading && !input.trim() ? null : e.target.style.backgroundColor = '#0052a3'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#0066cc'}
          >
            {loading ? '⏳' : '➤ Enviar'}
          </button>
        </form>
      </div>
    </div>
  )
}
