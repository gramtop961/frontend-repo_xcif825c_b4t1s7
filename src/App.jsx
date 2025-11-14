import { useEffect, useRef, useState } from 'react'
import { Camera, Image, PenSquare, Upload } from 'lucide-react'
import CanvasPad from './components/CanvasPad'

function App() {
  const [tab, setTab] = useState('type')
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const solveText = async () => {
    if (!query.trim()) return
    setLoading(true)
    setAnswer('')
    try {
      const res = await fetch(`${backend}/api/solve/text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })
      const data = await res.json()
      setAnswer(data.answer || 'No answer returned')
    } catch (e) {
      setAnswer(`Error: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  const solveImageBlob = async (blob) => {
    setLoading(true)
    setAnswer('')
    try {
      const form = new FormData()
      form.append('image', blob, 'problem.png')
      form.append('query', query)
      const res = await fetch(`${backend}/api/solve/image`, {
        method: 'POST',
        body: form
      })
      const data = await res.json()
      setAnswer(data.answer || 'No answer returned')
    } catch (e) {
      setAnswer(`Error: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  const onFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImagePreview(URL.createObjectURL(file))
    await solveImageBlob(file)
    e.target.value = ''
  }

  const onCameraCapture = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImagePreview(URL.createObjectURL(file))
    await solveImageBlob(file)
    e.target.value = ''
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50 p-4">
      <div className="max-w-md mx-auto">
        <header className="py-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">MathSnap Tutor</h1>
          <p className="text-gray-600 text-sm">Draw, snap, upload, or type your problem. Get step-by-step help.</p>
        </header>

        <div className="grid grid-cols-4 gap-2 text-sm mb-4">
          <button onClick={() => setTab('type')} className={`flex items-center justify-center gap-2 px-3 py-2 rounded ${tab==='type' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border'}`}>Type</button>
          <button onClick={() => setTab('draw')} className={`flex items-center justify-center gap-2 px-3 py-2 rounded ${tab==='draw' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border'}`}><PenSquare size={16}/>Draw</button>
          <button onClick={() => { setTab('upload'); fileInputRef.current?.click() }} className={`flex items-center justify-center gap-2 px-3 py-2 rounded ${tab==='upload' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border'}`}><Upload size={16}/>Upload</button>
          <button onClick={() => { setTab('camera'); cameraInputRef.current?.click() }} className={`flex items-center justify-center gap-2 px-3 py-2 rounded ${tab==='camera' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border'}`}><Camera size={16}/>Camera</button>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onCameraCapture} />

        {tab === 'type' && (
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <textarea value={query} onChange={(e)=>setQuery(e.target.value)} rows={5} placeholder="Type your math problem here..." className="w-full outline-none resize-y text-gray-900" />
            <button onClick={solveText} disabled={loading} className="mt-3 w-full bg-indigo-600 text-white rounded py-2 disabled:opacity-60">{loading ? 'Solving...' : 'Solve'}</button>
          </div>
        )}

        {tab === 'draw' && (
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <CanvasPad onSubmit={solveImageBlob} disabled={loading} />
          </div>
        )}

        {imagePreview && (
          <div className="mt-4 bg-white p-2 border rounded">
            <div className="text-sm text-gray-600 mb-1">Last image</div>
            <img src={imagePreview} alt="preview" className="rounded w-full" />
          </div>
        )}

        <div className="mt-4 bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-sm text-gray-600 mb-2">Answer</div>
          <pre className="whitespace-pre-wrap text-gray-900 text-sm">{answer || 'Your solution will appear here.'}</pre>
        </div>

        <footer className="text-center text-xs text-gray-500 mt-6">
          Powered by Gemini. Make sure your server has an API key configured.
        </footer>
      </div>
    </div>
  )
}

export default App
