import { useEffect, useRef, useState } from 'react'

export default function CanvasPad({ onSubmit, disabled }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const isDrawing = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const [penSize, setPenSize] = useState(4)

  useEffect(() => {
    const canvas = canvasRef.current
    const dpr = window.devicePixelRatio || 1
    const parent = containerRef.current
    const rect = parent.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.width * dpr * 1.2 // keep a 5:6 ratio for mobile
    canvas.style.width = rect.width + 'px'
    canvas.style.height = canvas.height / dpr + 'px'
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const getPos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  const start = (e) => {
    e.preventDefault()
    isDrawing.current = true
    lastPos.current = getPos(e)
  }

  const move = (e) => {
    if (!isDrawing.current) return
    const ctx = canvasRef.current.getContext('2d')
    ctx.strokeStyle = '#111827' // gray-900
    ctx.lineWidth = penSize
    ctx.lineCap = 'round'
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    lastPos.current = pos
  }

  const end = () => {
    isDrawing.current = false
  }

  const clear = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const submit = async () => {
    if (disabled) return
    const canvas = canvasRef.current
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!blob) return
    onSubmit(blob)
  }

  return (
    <div className="w-full" ref={containerRef}>
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="touch-none bg-white w-full"
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
        />
      </div>
      <div className="flex items-center justify-between mt-3 gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Pen</label>
          <input
            type="range"
            min="2"
            max="12"
            value={penSize}
            onChange={(e) => setPenSize(parseInt(e.target.value))}
          />
        </div>
        <div className="flex gap-2">
          <button onClick={clear} className="px-3 py-2 rounded bg-gray-100 text-gray-700">Clear</button>
          <button onClick={submit} disabled={disabled} className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-60">Solve</button>
        </div>
      </div>
    </div>
  )
}
