import { useState, useRef, useEffect } from 'react'

const QUICK_PROMPTS = [
  '¿Cómo podría mejorar este párrafo?',
  '¿Falta algún detalle importante?',
  'Ayudame a empezar el próximo capítulo',
  '¿Está claro lo que quiero decir?',
]

const MOCK_RESPONSE = `Estoy acá para ayudarte a escribir tus memorias. 🌸

Cuando conectes la integración con la IA, voy a poder leer lo que escribiste y ayudarte a:
• Mejorar párrafos
• Agregar detalles
• Seguir el hilo del relato

Por ahora, seguí escribiendo — ¡lo estás haciendo muy bien!`

function Message({ role, content }) {
  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-base leading-relaxed ${
        role === 'user'
          ? 'bg-amber-600 text-white rounded-br-sm'
          : 'bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-100 rounded-bl-sm'
      }`}>
        {content}
      </div>
    </div>
  )
}

export default function AiChat({ editorContent }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola! Soy tu asistente de escritura. ¿En qué te puedo ayudar hoy? 😊' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function sendMessage(text) {
    if (!text.trim()) return
    const userMsg = { role: 'user', content: text.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // Mock: simular delay de respuesta
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: MOCK_RESPONSE }])
      setLoading(false)
    }, 1200)
  }

  function handleSubmit(e) {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-stone-200 dark:border-stone-700 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">✨</span>
          <div>
            <p className="font-semibold text-stone-800 dark:text-stone-100 text-base">Asistente de escritura</p>
            <p className="text-xs text-amber-600 dark:text-amber-400">Modo de prueba</p>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <Message key={i} role={msg.role} content={msg.content} />
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-stone-100 dark:bg-stone-700 rounded-2xl rounded-bl-sm px-4 py-3">
              <span className="flex gap-1">
                <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Botones rápidos */}
      <div className="px-4 pb-2 flex-shrink-0">
        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.map(prompt => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-full border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-4 pb-4 pt-2 flex-shrink-0 border-t border-stone-200 dark:border-stone-700">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
            }}
            placeholder="Escribí tu pregunta acá…"
            rows={2}
            className="flex-1 resize-none px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-amber-400 text-base"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white rounded-xl transition-colors flex-shrink-0"
          >
            →
          </button>
        </div>
      </form>
    </div>
  )
}
