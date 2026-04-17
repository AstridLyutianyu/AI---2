import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function CreatePost({ session }) {
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const uploadImage = async () => {
    if (!imageFile) return null
    setUploading(true)
    const fileName = `${Date.now()}_${imageFile.name}`
    const { error } = await supabase.storage
      .from('post-images')
      .upload(fileName, imageFile)
    if (error) {
      alert('上传失败: ' + error.message)
      setUploading(false)
      return null
    }
    const { data } = supabase.storage.from('post-images').getPublicUrl(fileName)
    setUploading(false)
    return data.publicUrl
  }

  const handleSubmit = async () => {
    if (!content.trim()) return
    setSubmitting(true)
    const imageUrl = await uploadImage()
    const { error } = await supabase.from('posts').insert({
      content,
      image_url: imageUrl,
      user_id: session.user.id,
      user_email: session.user.email
    })
    if (error) alert('发布失败: ' + error.message)
    else navigate('/')
    setSubmitting(false)
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border">
      <h2 className="font-bold text-xl mb-4">发布新笔记</h2>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows="4"
        placeholder="分享你的想法..."
        className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-200"
      />
      <div className="mt-3">
        <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm" />
        {imagePreview && <img src={imagePreview} className="mt-3 w-full h-40 object-cover rounded-xl" />}
      </div>
      <button
        onClick={handleSubmit}
        disabled={!content.trim() || uploading || submitting}
        className="w-full mt-5 bg-red-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
      >
        {submitting ? '发布中...' : '发布笔记'}
      </button>
    </div>
  )
}