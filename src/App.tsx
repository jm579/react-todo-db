import { useState, useEffect } from 'react'
// @ts-expect-error Supabase client has no TS types in this project
import { supabase } from './lib/supabaseClient'
// @ts-expect-error Auth file from Auth in this project
import Auth from './Auth'
import './App.css'

type Todo = {
  id: number
  text: string
  created_at: string
}

type User = {
  id: string
  email: string
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)

  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  // 📥 Fetch todos (RLS handles filtering automatically)
  async function fetchTodos() {
    setLoading(true)

    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error(error.message)
    } else {
      setTodos((data as Todo[]) || [])
    }

    setLoading(false)
  }

  // 🔐 AUTH LISTENER (core requirement)
  useEffect(() => {
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange(
  (_event: string, session: { user?: { id: string; email?: string } } | null) => {
    const currentUser = session?.user

    if (currentUser) {
      setUser({
        id: currentUser.id,
        email: currentUser.email || ''
      })

      fetchTodos()
    } else {
      setUser(null)
      setTodos([])
    }

    setAuthLoading(false)
  }
)

    return () => subscription.unsubscribe()
  }, [])

  // ➕ Add todo (user_id auto-filled via auth.uid())
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const { data, error } = await supabase
      .from('todos')
      .insert({ text: inputValue.trim() })
      .select()

    if (error) {
      console.error(error.message)
    } else if (data) {
      setTodos([...todos, data[0]])
      setInputValue('')
    }
  }

  // ❌ Delete todo
  const deleteTodo = async (id: number) => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)

    if (!error) {
      setTodos(todos.filter(todo => todo.id !== id))
    }
  }

  // 🚪 Sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  // ⏳ Loading auth state
  if (authLoading) {
    return (
      <div className="app">
        <p>Loading...</p>
      </div>
    )
  }

  // 🔐 NOT LOGGED IN → Auth screen
  if (!user) {
    return (
      <div className="app">
        <h1>React Todo App</h1>
        <Auth />
      </div>
    )
  }

  // ✅ LOGGED IN → Todo app
  return (
    <div className="app">
      <div className="header">
        <h1>React Todo App</h1>

        <div>
          <span>{user.email}</span>
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add a new todo..."
        />
        <button type="submit">Add</button>
      </form>

      {loading ? (
        <p>Loading todos...</p>
      ) : (
        <ul>
          {todos.map(todo => (
            <li key={todo.id}>
              {todo.text}
              <button onClick={() => deleteTodo(todo.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App
