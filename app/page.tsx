'use client';

import { useEffect, useMemo, useState } from 'react';
import { modelOptions, ModelOption } from '@/lib/models';

type Message = {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
};

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState('default');
  const [customSession, setCustomSession] = useState('default');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelId, setModelId] = useState(modelOptions[0]?.id ?? '');
  const [modelMeta, setModelMeta] = useState<ModelOption>(modelOptions[0]);

  async function parseResponse(res: Response) {
    const text = await res.text();
    if (!text.trim()) {
      return {};
    }
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(text || 'Response was not valid JSON.');
    }
  }

  async function parseResponse(res: Response) {
    const text = await res.text();
    if (!text) {
      throw new Error('Server returned an empty response.');
    }
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(text);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/messages?sessionId=${encodeURIComponent(sessionId)}`, {
      signal: controller.signal
    })
      .then((res) => parseResponse(res))
      .then((data) => setMessages(data.messages || []))
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError('Failed to load conversation.');
        }
      });
    return () => controller.abort();
  }, [sessionId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    const userMessage = input;
    setInput('');
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: 'user',
        content: userMessage,
        created_at: new Date().toISOString()
      }
    ]);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: userMessage, sessionId, modelId })
      });
      const data = await parseResponse(res);
      if (!res.ok) {
        throw new Error(data?.error || `Server error (${res.status})`);
      }
      setMessages(data.messages || []);
      if (data.model?.id) {
        setModelId(data.model.id);
        setModelMeta(data.model);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function handleSessionUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const clean = customSession.trim() || 'default';
    setSessionId(clean);
  }

  const placeholder = useMemo(
    () =>
      loading
        ? 'Waiting for the uncensored model to respond...'
        : 'Ask anything. The conversation is stored securely on the server.',
    [loading]
  );

  const activeModel = useMemo(
    () => modelOptions.find((option) => option.id === modelId) || modelMeta,
    [modelId, modelMeta]
  );

  return (
    <main style={{ minHeight: '100vh' }}>
      <div
        style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: '2rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}
      >
        <header>
          <p style={{ color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            Uncensored OpenRouter Chat
          </p>
          <h1 style={{ marginBottom: '0.5rem' }}>Your AI, your rules.</h1>
          <p style={{ color: 'var(--muted)', maxWidth: 640 }}>
            This chat interface calls uncensored models from OpenRouter. Conversations are persisted on the
            server inside a private SQLite database so you can pick up exactly where you left off.
          </p>
        </header>

        <section
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center'
          }}
        >
          <form onSubmit={handleSessionUpdate} style={{ display: 'flex', gap: '0.5rem', flex: '1 1 260px' }}>
            <input
              value={customSession}
              onChange={(e) => setCustomSession(e.target.value)}
              placeholder="Conversation ID"
              aria-label="Conversation ID"
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                borderRadius: 999,
                border: '1px solid #1f2937',
                background: 'var(--card)',
                color: 'var(--foreground)'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: 999,
                border: 'none',
                background: 'var(--accent)',
                color: '#000',
                fontWeight: 600
              }}
            >
              Load
            </button>
          </form>
          <div style={{ color: 'var(--muted)' }}>Active session: {sessionId}</div>
        </section>

        <section
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center'
          }}
        >
          <label style={{ flex: '1 1 260px' }}>
            <span style={{ display: 'block', marginBottom: '0.35rem', color: 'var(--muted)', fontSize: '0.85rem' }}>
              Choose an OpenRouter model
            </span>
            <select
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 12,
                border: '1px solid #1f2937',
                background: 'var(--card)',
                color: 'var(--foreground)'
              }}
            >
              {modelOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label} · {option.censored ? 'Censored' : 'Uncensored'}
                </option>
              ))}
            </select>
          </label>
          <div style={{ color: 'var(--muted)', flex: '1 1 200px' }}>
            Active model: {activeModel.label} ({activeModel.censored ? 'Censored' : 'Uncensored'})
          </div>
        </section>

        <section
          style={{
            background: 'var(--card)',
            borderRadius: 24,
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            minHeight: '50vh'
          }}
        >
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.length === 0 && <p style={{ color: 'var(--muted)' }}>No messages yet. Say hello!</p>}
            {messages.map((message) => (
              <div
                key={`${message.id}-${message.created_at}`}
                style={{
                  alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                  background: message.role === 'user' ? 'var(--accent)' : '#1f2937',
                  color: message.role === 'user' ? '#111' : 'var(--foreground)',
                  padding: '0.75rem 1rem',
                  borderRadius: 18,
                  maxWidth: '85%'
                }}
              >
                <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '0.25rem' }}>
                  {message.role === 'assistant' ? 'Model' : 'You'}
                </div>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{message.content}</div>
              </div>
            ))}
          </div>

          {error && (
            <div style={{ color: '#fca5a5', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              rows={2}
              style={{
                flex: 1,
                resize: 'none',
                borderRadius: 16,
                border: '1px solid #1f2937',
                background: '#0f172a',
                color: 'var(--foreground)',
                padding: '0.85rem 1rem'
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                borderRadius: 16,
                border: 'none',
                background: loading ? '#94a3b8' : 'var(--accent)',
                color: '#111',
                fontWeight: 700,
                padding: '0 1.5rem',
                cursor: loading ? 'wait' : 'pointer'
              }}
            >
              {loading ? 'Thinking…' : 'Send'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
