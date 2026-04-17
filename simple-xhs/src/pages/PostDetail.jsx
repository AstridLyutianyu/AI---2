import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function PostDetail({ session }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const loadPost = async () => {
    const { data: postData } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()

    if (!postData) {
      navigate('/')
      return
    }

    const { count: likeCount } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', id)

    const { data: userLike } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', session.user.id)
      .maybeSingle()

    postData.likesCount = likeCount || 0
    postData.likedByUser = !!userLike
    setPost(postData)
  }

  const loadComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', id)
      .order('created_at', { ascending: true })
    setComments(data || [])
  }

  const toggleLike = async () => {
    if (post.likedByUser) {
      await supabase
        .from('likes')
        .delete()
        .eq('post_id', id)
        .eq('user_id', session.user.id)
      setPost({ ...post, likesCount: post.likesCount - 1, likedByUser: false })
    } else {
      await supabase
        .from('likes')
        .insert({ post_id: id, user_id: session.user.id })
      setPost({ ...post, likesCount: post.likesCount + 1, likedByUser: true })
    }
  }

  const submitComment = async () => {
    if (!newComment.trim()) return
    setSubmitting(true)
    const { error } = await supabase.from('comments').insert({
      post_id: id,
      user_id: session.user.id,
      user_email: session.user.email,
      content: newComment
    })
    if (!error) {
      setNewComment('')
      await loadComments()
    } else {
      alert('评论失败: ' + error.message)
    }
    setSubmitting(false)
  }

  useEffect(() => {
    loadPost()
    loadComments()
    setLoading(false)
  }, [id])

  if (loading) return <div className="text-center py-10">加载中...</div>
  if (!post) return null

  return (
    <div>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden mb-5">
        <div className="p-4 pb-2 flex items-center gap-2 border-b">
          <button onClick={() => navigate(-1)} className="text-gray-500 mr-2">
            ← 返回
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-400 to-red-400 flex items-center justify-center text-white text-xs font-bold">
            {(post.user_email || 'U')[0].toUpperCase()}
          </div>
          <span className="text-sm font-medium">{post.user_email?.split('@')[0] || '用户'}</span>
          <span className="text-xs text-gray-400 ml-auto">
            {new Date(post.created_at).toLocaleString()}
          </span>
        </div>
        <div className="p-4">
          <p className="text-gray-800 mb-3">{post.content}</p>
          {post.image_url && (
            <img src={post.image_url} className="w-full rounded-xl border max-h-96 object-contain bg-gray-50" />
          )}
        </div>
        <div className="flex items-center gap-5 px-4 py-3 border-t">
          <button onClick={toggleLike} className={`flex items-center gap-1 text-sm ${post.likedByUser ? 'text-red-500' : 'text-gray-500'}`}>
            <i className={`${post.likedByUser ? 'fas' : 'far'} fa-heart`}></i> {post.likesCount}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border">
        <h3 className="font-semibold mb-3">评论 · {comments.length}</h3>
        <div className="flex gap-2 mb-4">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="写一条评论..."
            className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-300"
          />
          <button
            onClick={submitComment}
            disabled={submitting || !newComment.trim()}
            className="bg-red-500 text-white px-4 py-2 rounded-full text-sm disabled:opacity-50"
          >
            发送
          </button>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {comments.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-4">暂无评论，来抢沙发吧~</div>
          )}
          {comments.map(cmt => (
            <div key={cmt.id} className="border-b pb-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <i className="fas fa-user-circle"></i> {cmt.user_email?.split('@')[0] || '匿名'} · {new Date(cmt.created_at).toLocaleString()}
              </div>
              <p className="text-sm text-gray-700 mt-1">{cmt.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}