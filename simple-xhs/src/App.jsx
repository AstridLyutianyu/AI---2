import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Feed from './pages/Feed'
import CreatePost from './pages/CreatePost'
import PostDetail from './pages/PostDetail'
import Auth from './pages/Auth'
import Navbar from './components/Navbar'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <BrowserRouter>
      <div className="max-w-2xl mx-auto bg-white min-h-screen shadow-lg">
        <Navbar session={session} />
        <main className="p-4 pb-20">
          <Routes>
            <Route path="/" element={session ? <Feed session={session} /> : <Navigate to="/auth" />} />
            <Route path="/create" element={session ? <CreatePost session={session} /> : <Navigate to="/auth" />} />
            <Route path="/post/:id" element={session ? <PostDetail session={session} /> : <Navigate to="/auth" />} />
            <Route path="/auth" element={<Auth setSession={setSession} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App