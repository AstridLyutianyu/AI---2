import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'

export default function Feed({ session }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const loadPosts = async () => {
    const { data: postsData } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    for (let post of postsData || []) {
      const { count: likeCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id)

      const { data: userLike } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', session.user.id)
        .maybeSingle()

      const { count: commentCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id)

      post.likesCount = likeCount || 0
      post.likedByUser = !!userLike
      post.commentsCount = commentCount || 0
    }
    setPosts(postsData || [])
    setLoading(false)
  }

  const toggleLike = async (post) => {
    if (post.likedByUser) {
      await supabase
        .from('likes')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', session.user.id)
      post.likesCount -= 1
      post.likedByUser = false
    } else {
      await supabase
        .from('likes')
        .insert({ post_id: post.id, user_id: session.user.id })
      post.likesCount += 1
      post.likedByUser = true
    }
    setPosts([...posts])
  }

  useEffect(() => { loadPosts() }, [])

  if (loading) return <div className="text-center py-10">加载中...</div>

  return (
    <div>
      <h2 className="font-bold text-xl mb-4">发现笔记</h2>
      {posts.length === 0 && <div className="text-center text-gray-400">暂无帖子，发布第一条吧～</div>}
      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-4 pb-2 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-400 to-red-400 flex items-center justify-center text-white text-xs font-bold">
                {(post.user_email || 'U')[0].toUpperCase()}
              </div>
              <span className="text-sm font-medium">{post.user_email?.split('@')[0] || '用户'}</span>
              <span className="text-xs text-gray-400 ml-auto">{new Date(post.created_at).toLocaleString()}</span>
            </div>
            <div className="px-4 pb-2">
              <p className="text-gray-800 text-sm">{post.content}</p>
            </div>
            {post.image_url && (
              <div className="px-4 pb-3">
                <img src={post.image_url} className="w-full h-64 object-cover rounded-xl" />
              </div>
            )}
            <div className="flex items-center gap-5 px-4 py-3 border-t">
              <button onClick={() => toggleLike(post)} className={`flex items-center gap-1 text-sm ${post.likedByUser ? 'text-red-500' : 'text-gray-500'}`}>
                <i className={`${post.likedByUser ? 'fas' : 'far'} fa-heart`}></i> {post.likesCount}
              </button>
              <Link to={`/post/${post.id}`} className="flex items-center gap-1 text-sm text-gray-500">
                <i className="far fa-comment"></i> {post.commentsCount}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}