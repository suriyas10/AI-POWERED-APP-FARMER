'use client'

import { useEffect, useState } from 'react'

export default function TaskApp() {
  const [user, setUser]             = useState(null)
  const [email, setEmail]           = useState('')
  const [loginError, setLoginError] = useState('')

  const [tasks, setTasks]           = useState([])
  const [taskName, setTaskName]     = useState('')

  const [subject, setSubject]       = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [aiLoading, setAiLoading]   = useState(false)
  const [aiError, setAiError]       = useState('')

  // Restore session
  useEffect(() => {
    const saved = localStorage.getItem('studentUser')
    if (saved) {
      setUser(JSON.parse(saved))
      fetchTasks()
    }
  }, [])

  // ── Auth ──────────────────────────────────────────────────
  async function login() {
    setLoginError('')
    if (!email || !email.includes('@')) {
      setLoginError('Please enter a valid email.')
      return
    }
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) { setLoginError(data.error || 'Login failed'); return }
      localStorage.setItem('studentUser', JSON.stringify(data.user))
      setUser(data.user)
      fetchTasks()
    } catch {
      setLoginError('Network error. Please try again.')
    }
  }

  function logout() {
    localStorage.removeItem('studentUser')
    setUser(null)
    setTasks([])
    setEmail('')
    setSuggestions([])
  }

  // ── Tasks CRUD ────────────────────────────────────────────
  async function fetchTasks() {
    try {
      const res = await fetch('/api/tasks')
      const data = await res.json()
      setTasks(data.tasks || [])
    } catch {}
  }

  async function addTask(title, priority = 'medium') {
    if (!title.trim()) return
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), priority }),
    })
    setTaskName('')
    fetchTasks()
  }

  async function toggleTask(task) {
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !task.completed }),
    })
    fetchTasks()
  }

  async function deleteTask(id) {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    fetchTasks()
  }

  // ── AI Feature ────────────────────────────────────────────
  async function getSuggestions() {
    if (!subject.trim()) { setAiError('Please enter a subject first.'); return }
    setAiError('')
    setSuggestions([])
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject }),
      })
      const data = await res.json()
      if (!res.ok) { setAiError(data.error || 'AI failed. Try again.'); return }
      setSuggestions(data.suggestions || [])
    } catch {
      setAiError('Network error. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }

  async function addAllSuggestions() {
    for (const s of suggestions) {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: s.title, priority: s.priority }),
      })
    }
    setSuggestions([])
    setSubject('')
    fetchTasks()
  }

  function priorityClass(p) {
    if (p === 'high')   return 'priority-high'
    if (p === 'low')    return 'priority-low'
    return 'priority-medium'
  }

  // ── Login screen ──────────────────────────────────────────
  if (!user) {
    return (
      <main className="container">
        <h1>📚 Student Daily Planner</h1>
        <p className="subtitle">Stay organised with AI-powered task suggestions</p>

        <div className="card">
          <h2>Login</h2>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && login()}
          />
          {loginError && <p className="error-msg">{loginError}</p>}
          <button className="btn-primary" onClick={login}>Login</button>
        </div>

        <div className="card">
          <h2>What you get</h2>
          <ul style={{ paddingLeft: '1.2rem', lineHeight: '2', fontSize: '0.9rem', color: '#374151' }}>
            <li>Create, complete and delete daily tasks</li>
            <li>AI suggests 3 tasks for any subject you're studying</li>
            <li>Simple email login — no password needed</li>
          </ul>
        </div>
      </main>
    )
  }

  // ── Main app ──────────────────────────────────────────────
  const pending   = tasks.filter((t) => !t.completed)
  const completed = tasks.filter((t) =>  t.completed)

  return (
    <main className="container">
      <h1>📚 Student Daily Planner</h1>

      {/* User bar */}
      <div className="card">
        <div className="user-bar">
          <p>Welcome, <span>{user.name || user.email}</span></p>
          <button className="btn-secondary btn-sm" onClick={logout}>Logout</button>
        </div>
      </div>

      {/* Add task */}
      <div className="card">
        <h2>Add a Task</h2>
        <div className="add-row">
          <input
            type="text"
            placeholder="e.g. Read chapter 3"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask(taskName)}
          />
          <button className="btn-primary" onClick={() => addTask(taskName)}>Add</button>
        </div>
      </div>

      {/* AI Task Suggester */}
      <div className="card ai-section">
        <h2>✨ AI Task Suggester</h2>
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.75rem' }}>
          Tell Claude what you're studying — it will suggest 3 tasks for you.
        </p>
        <div className="add-row">
          <input
            type="text"
            placeholder="e.g. calculus, biology exam, essay writing…"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && getSuggestions()}
          />
          <button className="btn-primary" onClick={getSuggestions} disabled={aiLoading}>
            {aiLoading ? 'Thinking…' : 'Suggest'}
          </button>
        </div>

        {aiLoading && (
          <p className="loading-msg">
            <span className="spinner"></span> Claude is thinking…
          </p>
        )}

        {aiError && <p className="error-msg">{aiError}</p>}

        {suggestions.length > 0 && (
          <div className="ai-result">
            {suggestions.map((s, i) => (
              <div key={i} className="suggestion-card">
                <span>{s.title}</span>
                <span className={`priority-badge ${priorityClass(s.priority)}`}>{s.priority}</span>
                <button
                  className="btn-success btn-sm"
                  onClick={() => {
                    addTask(s.title, s.priority)
                    setSuggestions((prev) => prev.filter((_, idx) => idx !== i))
                  }}
                >
                  + Add
                </button>
              </div>
            ))}
            <div className="add-all-row">
              <button className="btn-primary btn-sm" onClick={addAllSuggestions}>
                Add all 3 tasks
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pending tasks */}
      <div className="card">
        <h2>Pending Tasks ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="empty">No pending tasks — nice work! 🎉</p>
        ) : (
          <div className="task-list">
            {pending.map((task) => (
              <div key={task.id} className="task-item">
                <span className="task-title">{task.title}</span>
                <span className={`priority-badge ${priorityClass(task.priority)}`}>{task.priority}</span>
                <div className="task-actions">
                  <button className="btn-success btn-sm" onClick={() => toggleTask(task)}>Done</button>
                  <button className="btn-danger btn-sm" onClick={() => deleteTask(task.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed tasks */}
      {completed.length > 0 && (
        <div className="card">
          <h2>Completed ({completed.length})</h2>
          <div className="task-list">
            {completed.map((task) => (
              <div key={task.id} className="task-item completed">
                <span className="task-title">{task.title}</span>
                <div className="task-actions">
                  <button className="btn-secondary btn-sm" onClick={() => toggleTask(task)}>Undo</button>
                  <button className="btn-danger btn-sm" onClick={() => deleteTask(task.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* About */}
      <div className="card">
        <h2>About</h2>
        <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: '1.7' }}>
          Student Daily Planner helps you manage academic tasks with an AI assistant powered by Claude.
          Enter any subject and get instant, relevant study task suggestions — then track your progress
          by completing and deleting tasks throughout the day.
        </p>
      </div>
    </main>
  )
}
