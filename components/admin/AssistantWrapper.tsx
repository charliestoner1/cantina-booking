// components/admin/AssistantWrapper.tsx
// Client Component Wrapper - Full AI Chat
'use client'

import { useEffect, useRef, useState } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function AssistantWrapper() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hi! I'm your Cantina bar management assistant. Ask me about reservations, inventory, revenue, or top customers!",
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return

    const userMessage = messageText.trim()
    setInput('')
    setIsLoading(true)

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: messages,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.message },
      ])
    } catch (error) {
      console.error('Error:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const quickQuestions = [
    'What bottles are we low on?',
    'Who has tables tonight?',
    "Show me this month's top spenders",
  ]

  return (
    <>
      {/* Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '60px',
            height: '60px',
            backgroundColor: '#14b8a6',
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            zIndex: 9999,
            fontSize: '24px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          💬
        </button>
      )}

      {/* Chat */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '400px',
            height: '600px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
              color: 'white',
              padding: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                Bar Manager AI
              </div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>
                Powered by Claude
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              backgroundColor: '#f9fafb',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent:
                    msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    lineHeight: '1.4',
                    whiteSpace: 'pre-wrap',
                    ...(msg.role === 'user'
                      ? {
                          backgroundColor: '#14b8a6',
                          color: 'white',
                        }
                      : {
                          backgroundColor: 'white',
                          color: '#1f2937',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                          border: '1px solid #e5e7eb',
                        }),
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    backgroundColor: 'white',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    gap: '4px',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#14b8a6',
                      animation: 'bounce 1s infinite',
                    }}
                  ></div>
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#14b8a6',
                      animation: 'bounce 1s infinite 0.2s',
                    }}
                  ></div>
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#14b8a6',
                      animation: 'bounce 1s infinite 0.4s',
                    }}
                  ></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div
              style={{
                padding: '12px 16px',
                borderTop: '1px solid #e5e7eb',
                backgroundColor: 'white',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  color: '#6b7280',
                  marginBottom: '8px',
                }}
              >
                Try these:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    style={{
                      fontSize: '11px',
                      padding: '6px 10px',
                      backgroundColor: '#f3f4f6',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: '#4b5563',
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            style={{
              padding: '16px',
              borderTop: '1px solid #e5e7eb',
              backgroundColor: 'white',
              display: 'flex',
              gap: '8px',
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              style={{
                padding: '10px 20px',
                backgroundColor:
                  input.trim() && !isLoading ? '#14b8a6' : '#d1d5db',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                fontSize: '18px',
              }}
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  )
}
