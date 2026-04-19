import { useState } from 'react'
import { supabase } from './lib/supabaseClient'

function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    const result = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    if (result.error) {
      setErrorMsg(result.error.message)
    }

    setLoading(false)
  }

  return (
    <div className="auth-container">
      <h2>{isSignUp ? 'Create Account' : 'Sign In'}</h2>

      {errorMsg && <p className="error-message">{errorMsg}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>

      <p className="toggle-auth" onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp
          ? 'Already have an account? Sign In'
          : 'Need an account? Sign Up'}
      </p>
    </div>
  )
}

export default Auth