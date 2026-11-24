import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { GraduationCap, Mail, LockKeyhole, Eye, EyeOff, ArrowUpRight, Check } from '../components/Icons'
import { useAuth } from '../context/AuthContext'

export default function Auth({ mode = 'login' }) {
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const signup = mode === 'signup'
  const forgot = mode === 'forgot'

  const submit = async event => {
    event.preventDefault()
    setError('')
    if (forgot) {
      if (!form.email.includes('@')) return setError('Enter a valid email address.')
      setSent(true)
      return
    }
    if (signup && form.name.trim().length < 2) return setError('Please enter your full name.')
    setLoading(true)
    try {
      if (signup) {
        await register(form.email, form.password, form.name)
        navigate('/dashboard')
      } else {
        await login(form.email, form.password)
        navigate(params.get('next') || '/dashboard')
      }
    } catch (submitError) {
      setError(submitError.message || 'Could not connect to LearnHub. Check that the API is running and try again.')
    } finally {
      setLoading(false)
    }
  }

  return <div className="auth-page">
    <div className="auth-side">
      <Link to="/" className="brand"><span className="brand-mark"><GraduationCap size={21}/></span><span>learn<span className="brand-accent">hub</span></span></Link>
      <div className="auth-art"><div className="auth-art-circle"/><div className="auth-formula">∫ f(x) dx</div><div className="auth-quote">Great things are done by a series of small things brought together.</div><span className="auth-attribution">— VINCENT VAN GOGH</span></div>
      <div className="auth-side-bottom">A little progress each day adds up.</div>
    </div>
    <main className="auth-main">
      <div className="auth-mobile-brand"><Link to="/" className="brand"><span className="brand-mark"><GraduationCap size={21}/></span><span>learn<span className="brand-accent">hub</span></span></Link></div>
      <div className="auth-box">
        {sent ? <>
          <span className="auth-success-icon"><Check size={22}/></span>
          <h1>Password recovery is not connected yet.</h1>
          <p>The reset flow is ready to connect to the LearnHub API for <b>{form.email}</b>.</p>
          <Link className="button-primary auth-submit" to="/login">Back to log in</Link>
        </> : <>
          <div className="section-kicker">{signup ? 'YOUR NEXT CHAPTER STARTS HERE' : forgot ? 'ACCOUNT RECOVERY' : 'WELCOME BACK'}</div>
          <h1>{signup ? 'Create your account' : forgot ? 'Reset your password' : 'Good to see you.'}</h1>
          <p className="auth-sub">{signup ? 'A calmer semester is just around the corner.' : 'Your next lesson is waiting right where you left it.'}</p>
          <form onSubmit={submit}>
            {signup && <label className="auth-field"><span>FULL NAME</span><div><input required minLength={2} maxLength={160} value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="e.g. Ananya Sharma"/></div></label>}
            <label className="auth-field"><span>EMAIL ADDRESS</span><div><Mail size={17}/><input required type="email" maxLength={320} value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} placeholder="you@university.edu"/></div></label>
            {!forgot && <label className="auth-field"><span>PASSWORD</span><div><LockKeyhole size={17}/><input required minLength={signup ? 12 : 1} maxLength={256} type={visible ? 'text' : 'password'} value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} placeholder={signup ? 'At least 12 characters' : 'Your password'}/><button type="button" className="icon-button" onClick={() => setVisible(!visible)} aria-label="Toggle password visibility">{visible ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div></label>}
            {!signup && !forgot && <div className="forgot-row"><span>Keep your learning in sync.</span><Link to="/forgot-password">Forgot password?</Link></div>}
            {error && <div className="auth-error" role="alert">{error}</div>}
            <button className="button-primary auth-submit" type="submit" disabled={loading}>{loading ? 'Please wait…' : forgot ? 'Prepare reset request' : signup ? 'Create account' : 'Log in'} <ArrowUpRight size={16}/></button>
          </form>
          <div className="auth-switch">{signup ? 'Already have an account?' : forgot ? 'Remember your password?' : 'New to LearnHub?'} <Link to={signup || forgot ? '/login' : '/signup'}>{signup || forgot ? 'Log in' : 'Create your account'}</Link></div>
          <div className="auth-demo-note">Administrator accounts are provisioned by the deployment administrator.</div>
        </>}
      </div>
      <div className="auth-bottom-links"><Link to="/">← Back to LearnHub</Link><span>By continuing, you agree to our <a href="mailto:support@learnhub.example">Terms</a> and <a href="mailto:support@learnhub.example">Privacy Policy</a>.</span></div>
    </main>
  </div>
}
