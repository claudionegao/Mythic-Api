'use client'

import { useEffect, useState } from 'react'

export default function ChatUsagePage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await fetch('/api/chat/usage')
        if (!res.ok) {
          throw new Error('Erro ao carregar uso de tokens')
        }
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUsage()
  }, [])

  if (loading) {
    return <div style={{ padding: 20 }}>Carregando...</div>
  }

  if (error) {
    return <div style={{ padding: 20, color: 'red' }}>Erro: {error}</div>
  }

  const { totals, lastUsages } = data || {}

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Uso de Tokens - Chat Gemini</h1>

      {/* Resumo geral */}
      <section
        style={{
          marginTop: '20px',
          padding: '15px',
          borderRadius: '8px',
          backgroundColor: '#f5f5f5',
          border: '1px solid #ddd',
        }}
      >
        <h2 style={{ marginTop: 0 }}>Resumo</h2>
        <p>
          <strong>Chamadas totais:</strong> {totals?.calls ?? 0}
        </p>
        <p>
          <strong>Tokens de prompt:</strong> {totals?.promptTokens ?? 0}
        </p>
        <p>
          <strong>Tokens de resposta:</strong> {totals?.completionTokens ?? 0}
        </p>
        <p>
          <strong>Tokens totais:</strong> {totals?.totalTokens ?? 0}
        </p>
        <p>
          <strong>Tokens de "thoughts":</strong> {totals?.thoughtsTokens ?? 0}
        </p>
      </section>

      {/* Histórico recente */}
      <section style={{ marginTop: '30px' }}>
        <h2>Últimas chamadas</h2>
        {(!lastUsages || lastUsages.length === 0) && <p>Nenhum registro ainda.</p>}

        {lastUsages && lastUsages.length > 0 && (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
              marginTop: '10px',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#eee' }}>
                <th style={{ border: '1px solid #ccc', padding: '6px' }}>Quando</th>
                <th style={{ border: '1px solid #ccc', padding: '6px' }}>Modelo</th>
                <th style={{ border: '1px solid #ccc', padding: '6px' }}>Prompt</th>
                <th style={{ border: '1px solid #ccc', padding: '6px' }}>Resposta</th>
                <th style={{ border: '1px solid #ccc', padding: '6px' }}>Total</th>
                <th style={{ border: '1px solid #ccc', padding: '6px' }}>Thoughts</th>
              </tr>
            </thead>
            <tbody>
              {lastUsages.map((u) => (
                <tr key={u.id}>
                  <td style={{ border: '1px solid #ccc', padding: '6px' }}>
                    {new Date(u.createdAt).toLocaleString('pt-BR')}
                  </td>
                  <td style={{ border: '1px solid #ccc', padding: '6px' }}>{u.model}</td>
                  <td style={{ border: '1px solid #ccc', padding: '6px' }}>{u.promptTokens}</td>
                  <td style={{ border: '1px solid #ccc', padding: '6px' }}>{u.completionTokens}</td>
                  <td style={{ border: '1px solid #ccc', padding: '6px' }}>{u.totalTokens}</td>
                  <td style={{ border: '1px solid #ccc', padding: '6px' }}>{u.thoughtsTokens ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
