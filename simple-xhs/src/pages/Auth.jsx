import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth({ setSession }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email || !password) return
    setLoading(true)

    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) alert('登录失败: ' + error.message)
      else setSession(data.session)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) alert('注册失败: ' + error.message)
      else alert('注册成功！请登录')
    }
    setLoading(false)
  }

  return (
    <div className="py-8">
      <div className="bg-white rounded-2xl p-6 shadow-sm border max-w-md mx-auto">
        <div className="text-center mb-6">
          <i className="fab fa-sistrix text-4xl text-red-500"></i>
          <h2 className="text-2xl font-bold mt-2">{isLogin ? '欢迎回来' : '创建账号'}</h2>
          <p className="text-gray-500 text-sm">{isLogin ? '使用邮箱登录' : '注册新账户体验社区'}</p>
        </div>
        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="邮箱"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-300"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密码（至少6位）"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-300"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold shadow-md hover:bg-red-600 transition disabled:opacity-50"
          >
            {loading ? '处理中...' : isLogin ? '登录' : '注册'}
          </button>
          <p className="text-center text-sm text-gray-500">
            {isLogin ? '还没有账号？' : '已有账号？'}
            <button onClick={() => setIsLogin(!isLogin)} className="text-red-500 font-medium ml-1">
              {isLogin ? '立即注册' : '去登录'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}