"use client"

import { useState, useEffect, useRef } from "react"
import {
  Send,
  Bot,
  User,
  CheckCircle,
  Clock,
  Play,
  Pause,
  X,
  MessageCircle,
  Brain,
  Sparkles,
  Calendar,
  Tag,
  FileText,
  AlertCircle,
} from "lucide-react"

export default function ChatApp() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([
    { role: "bot", content: "שלום! אני כאן לעזור לך לנהל משימות. מה תרצה לעשות היום?", timestamp: new Date() },
  ])
  const [tasks, setTasks] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [backgroundEffect, setBackgroundEffect] = useState(0)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px"
    }
  }

  const getTaskIcon = (status) => {
    switch (status) {
      case 1:
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 2:
        return <Play className="w-5 h-5 text-blue-400" />
      case 3:
        return <X className="w-5 h-5 text-red-400" />
      case 4:
        return <Pause className="w-5 h-5 text-orange-400" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 1:
        return "הושלמה"
      case 2:
        return "בביצוע"
      case 3:
        return "בוטלה"
      case 4:
        return "מושהית"
      default:
        return "ממתינה"
    }
  }

  const getTaskBorderColor = (status) => {
    switch (status) {
      case 1:
        return "border-green-500/50 bg-green-500/10"
      case 2:
        return "border-blue-500/50 bg-blue-500/10"
      case 3:
        return "border-red-500/50 bg-red-500/10"
      case 4:
        return "border-orange-500/50 bg-orange-500/10"
      default:
        return "border-gray-500/50 bg-gray-500/10"
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return null
    try {
      const date = new Date(dateString)
      const now = new Date()

      // חישוב הפרש בימים לפי תאריך בלבד
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const targetDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const diffTime = targetDay - today
      const diffDays = diffTime / (1000 * 60 * 60 * 24)

      const timeStr = date.toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })

      if (diffDays === 0) return `היום ${timeStr}`
      if (diffDays === 1) return `מחר ${timeStr}`
      if (diffDays === -1) return `אתמול ${timeStr}`
      if (diffDays > 0 && diffDays <= 7) return `בעוד ${diffDays} ימים ${timeStr}`
      if (diffDays < 0 && diffDays >= -7) return `לפני ${Math.abs(diffDays)} ימים ${timeStr}`

      return (
        date.toLocaleDateString("he-IL", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }) + ` ${timeStr}`
      )
    } catch (error) {
      return dateString
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const interval = setInterval(() => {
      setBackgroundEffect((prev) => prev + 1)
    }, 100)
    return () => clearInterval(interval)
  }, [])

  const fetchTasks = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/tasks")
      const data = await res.json()
      setTasks(data)
      console.log("[v0] Tasks updated:", data.length)
    } catch (error) {
      console.error("Error fetching tasks:", error)
    }
  }

  useEffect(() => {
    fetchTasks()
    // Refresh tasks every 30 seconds
    const interval = setInterval(fetchTasks, 30000)
    return () => clearInterval(interval)
  }, [])

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { role: "user", content: input, timestamp: new Date() }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/manage-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userMessage.content }),
      })

      const data = await res.json()
      const botMessage = {
        role: "bot",
        content: data.response || "מצטער, משהו השתבש בבקשה.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])

      setTimeout(() => {
        fetchTasks()
      }, 500)
    } catch (error) {
      console.error("Error sending message:", error)
      const botMessage = {
        role: "bot",
        content: "לא הצלחתי להתחבר לשרת.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleInputChange = (e) => {
    setInput(e.target.value)
    adjustTextareaHeight()
  }

  return (
    <div
      className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden relative"
      dir="rtl"
    >
      {/* רקע אנימציה */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"
          style={{
            left: `${50 + Math.sin(backgroundEffect * 0.02) * 20}%`,
            top: `${50 + Math.cos(backgroundEffect * 0.015) * 15}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
        <div
          className="absolute w-64 h-64 bg-gradient-to-r from-pink-500/20 to-cyan-500/20 rounded-full blur-2xl animate-pulse"
          style={{
            right: `${30 + Math.sin(backgroundEffect * 0.025) * 10}%`,
            top: `${20 + Math.cos(backgroundEffect * 0.02) * 10}%`,
            animationDelay: "1s",
          }}
        />
      </div>

      <div className="w-96 bg-black/40 backdrop-blur-xl border-l border-purple-500/30 p-6 relative overflow-y-auto">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                משימות פעילות
              </h3>
              <p className="text-sm text-gray-400">סה"כ {tasks.length} משימות</p>
            </div>
          </div>

          <div className="space-y-4">
            {tasks.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">אין משימות כרגע</p>
                <p className="text-sm text-gray-500">הוסף משימה חדשה בצ'אט</p>
              </div>
            ) : (
              tasks.map((task, i) => (
                <div
                  key={task.id || i}
                  className={`p-5 backdrop-blur-sm rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/25 ${getTaskBorderColor(task.status)}`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {/* Header with status and type */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getTaskIcon(task.status)}
                      <span className="text-sm font-medium text-gray-300">{getStatusText(task.status)}</span>
                    </div>
                    {task.type && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded-full">
                        <Tag className="w-3 h-3 text-purple-400" />
                        <span className="text-xs text-purple-300">{task.type}</span>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h4 className="font-bold text-white mb-2 text-lg leading-tight">{task.title}</h4>

                  {/* Description */}
                  {task.description && (
                    <div className="flex items-start gap-2 mb-3">
                      <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-300 leading-relaxed">{task.description}</p>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="space-y-2">
                    {task.date_start && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span className="text-gray-400">התחלה:</span>
                        <span className="text-blue-300 font-medium">{formatDate(task.date_start)}</span>
                      </div>
                    )}

                    {task.date_finish && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-green-400" />
                        <span className="text-gray-400">סיום:</span>
                        <span className="text-green-300 font-medium">{formatDate(task.date_finish)}</span>
                      </div>
                    )}
                  </div>

                  {/* Task ID for reference */}
                  {task.id && (
                    <div className="mt-3 pt-3 border-t border-gray-600/30">
                      <span className="text-xs text-gray-500">מזהה: {task.id}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* צד שמאל - צ'אט */}
      <div className="flex-1 flex flex-col relative">
        {/* הדר */}
        <div className="bg-black/40 backdrop-blur-xl border-b border-purple-500/30 p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse" />
            </div>
            <div>
              <h2 className="font-bold text-lg">AI Assistant</h2>
              <p className="text-sm text-gray-400">מחובר ומוכן לעזור</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400 animate-spin" style={{ animationDuration: "3s" }} />
              <span className="text-sm text-gray-400">מופעל בבינה מלאכותית</span>
            </div>
          </div>
        </div>

        {/* אזור הודעות */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"} animate-fadeInUp`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div
                  className={`flex items-start gap-3 max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl ${msg.role === "bot" ? "ml-auto flex-row-reverse" : "flex-row"}`}
                >
                  {msg.role === "user" && (
                    /* Maintained consistent avatar proportions */
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`p-4 rounded-2xl backdrop-blur-sm shadow-lg transform hover:scale-105 transition-all duration-300 ${msg.role === "user"
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-blue-500/25"
                        : "bg-gradient-to-r from-slate-800/90 to-slate-700/90 text-gray-100 shadow-purple-500/25"
                      }`}
                    style={{ textAlign: "right" }}
                  >
                    <p className="leading-relaxed">{msg.content}</p>
                    <div className="text-xs opacity-70 mt-2">
                      {msg.timestamp?.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  {msg.role === "bot" && (
                    /* Maintained consistent avatar proportions */
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-end animate-fadeInUp">
                <div className="flex items-start gap-3 flex-row-reverse">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white animate-pulse" />
                  </div>
                  <div
                    className="bg-gradient-to-r from-slate-800/90 to-slate-700/90 p-4 rounded-2xl backdrop-blur-sm shadow-lg"
                    style={{ textAlign: "right" }}
                  >
                    <div className="flex items-center gap-2 flex-row-reverse">
                      <span className="text-sm text-gray-400">הבוט חושב...</span>
                      <div className="flex space-x-1">
                        <div
                          className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>

        {/* אזור הקלדה */}
        <div className="bg-black/40 backdrop-blur-xl border-t border-purple-500/30 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur animate-pulse" />
              <div className="relative flex items-end gap-4 bg-slate-800/80 backdrop-blur-sm rounded-2xl p-2 border border-purple-500/30">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="הקלד הודעה... (Enter לשליחה, Shift+Enter לשורה חדשה) 💭"
                  className="flex-1 bg-transparent px-6 py-3 text-white placeholder-gray-400 outline-none text-lg text-right resize-none min-h-[48px] max-h-[120px]"
                  style={{ direction: "rtl" }}
                  disabled={isTyping}
                  rows={1}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isTyping}
                  className="group relative p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full 
                           hover:from-blue-400 hover:to-purple-500 transition-all duration-300 
                           hover:scale-110 hover:shadow-lg hover:shadow-purple-500/50
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex-shrink-0"
                >
                  <Send className="w-5 h-5 text-white transform group-hover:translate-x-1 transition-transform duration-200" />
                  <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-active:scale-100 transition-transform duration-200" />
                </button>
              </div>
              <div className="mt-3 text-center">
                <div className="inline-flex items-center gap-2 text-sm text-gray-400">
                  <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: "2s" }} />
                  <span>מופעל על ידי בינה מלאכותית מתקדמת</span>
                  <Sparkles
                    className="w-4 h-4 animate-spin"
                    style={{ animationDuration: "2s", animationDirection: "reverse" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes glowPulse { 0%,100% { box-shadow:0 0 20px rgba(168,85,247,0.4); } 50% { box-shadow:0 0 40px rgba(168,85,247,0.8); } }
        @keyframes floatAnimation { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
        .animate-glow { animation: glowPulse 2s ease-in-out infinite; }
        .animate-float { animation: floatAnimation 3s ease-in-out infinite; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: rgba(30, 30, 30, 0.5); border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #8b5cf6, #06b6d4); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: linear-gradient(to bottom, #7c3aed, #0891b2); }
        .message-glow { filter: drop-shadow(0 0 10px rgba(168,85,247,0.3)); }
        .task-hover { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
        .task-hover:hover { transform: translateY(-2px) scale(1.02); filter: brightness(1.1); }
        div#root { width: 100%; }
      `}</style>
    </div>
  )
}
