import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Navbar({ session }) {
  const location = useLocation()

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  if (!session) {
    return (
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <i className="fab fa-sistrix text-2xl text-red-500"></i>
          <span className="font-bold text-xl">简单版小红书</span>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <i className="fab fa-sistrix text-2xl text-red-500"></i>
        <span className="font-bold text-xl bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">简单版小红书</span>
      </div>
      <div className="flex gap-4 items-center">
        <Link to="/" className={`text-gray-600 hover:text-red-500 ${location.pathname === '/' ? 'text-red-500 font-semibold' : ''}`}>
          <i className="fas fa-home"></i> 首页
        </Link>
        <Link to="/create" className={`text-gray-600 hover:text-red-500 ${location.pathname === '/create' ? 'text-red-500 font-semibold' : ''}`}>
          <i className="fas fa-plus-circle"></i> 发布
        </Link>
        <button onClick={logout} className="text-gray-500 hover:text-gray-800 text-sm">
          <i className="fas fa-sign-out-alt"></i> 退出
        </button>
      </div>
    </header>
  )
}