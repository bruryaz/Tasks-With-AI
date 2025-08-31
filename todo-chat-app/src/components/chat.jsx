import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, CheckCircle, Clock, Zap, MessageCircle, Brain, Sparkles } from "lucide-react";

export default function ChatApp() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "bot", content: "שלום! אני כאן לעזור לך לנהל משימות. מה תרצה לעשות היום?", timestamp: new Date() }
  ]);
  const [tasks, setTasks] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [backgroundEffect, setBackgroundEffect] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBackgroundEffect(prev => prev + 1);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // טעינת משימות מהשרת בזמן הטעינה
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/tasks");
        const data = await res.json();
        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/manage-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      const data = await res.json();
      const botMessage = {
        role: "bot",
        content: data.response || "מצטער, משהו השתבש בבקשה.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);

      // עדכון משימות אקראי (או אפשר לעדכן לפי תגובת השרת)
      if (Math.random() > 0.5) {
        const newTask = {
          title: input.slice(0, 20) + "...",
          description: "משימה חדשה שנוצרה מהצ'אט",
          status: "pending"
        };
        setTasks(prev => [...prev, newTask]);
      }

    } catch (error) {
      console.error("Error sending message:", error);
      const botMessage = {
        role: "bot",
        content: "לא הצלחתי להתחבר לשרת.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const getTaskIcon = (status) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "in_progress": return <Clock className="w-4 h-4 text-yellow-400" />;
      default: return <Zap className="w-4 h-4 text-blue-400" />;
    }
  };

  const getTaskBorderColor = (status) => {
    switch (status) {
      case "completed": return "border-green-500/50";
      case "in_progress": return "border-yellow-500/50";
      default: return "border-blue-500/50";
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden relative" dir="rtl">
      {/* רקע אנימציה */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"
          style={{
            left: `${50 + Math.sin(backgroundEffect * 0.02) * 20}%`,
            top: `${50 + Math.cos(backgroundEffect * 0.015) * 15}%`,
            transform: 'translate(-50%, -50%)'
          }}
        />
        <div
          className="absolute w-64 h-64 bg-gradient-to-r from-pink-500/20 to-cyan-500/20 rounded-full blur-2xl animate-pulse"
          style={{
            right: `${30 + Math.sin(backgroundEffect * 0.025) * 10}%`,
            top: `${20 + Math.cos(backgroundEffect * 0.02) * 10}%`,
            animationDelay: '1s'
          }}
        />
      </div>

      {/* צד ימין - משימות */}
      <div className="w-80 bg-black/40 backdrop-blur-xl border-l border-purple-500/30 p-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              משימות פעילות
            </h3>
          </div>
          <div className="space-y-4">
            {tasks.map((task, i) => (
              <div
                key={i}
                className={`p-4 bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-xl border ${getTaskBorderColor(task.status)} 
                           transform hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/25
                           animate-pulse`}
                style={{ animationDelay: `${i * 0.2}s`, animationDuration: '2s', animationIterationCount: 1 }}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getTaskIcon(task.status)}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">{task.title}</h4>
                    <p className="text-sm text-gray-300 leading-relaxed">{task.description}</p>
                  </div>
                </div>
              </div>
            ))}
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
              <Sparkles className="w-5 h-5 text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
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
                <div className={`flex items-start gap-3 max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl ${msg.role === "bot" ? "ml-auto flex-row-reverse" : "flex-row"}`}>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`p-4 rounded-2xl backdrop-blur-sm shadow-lg transform hover:scale-105 transition-all duration-300 ${msg.role === "user"
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-blue-500/25"
                        : "bg-gradient-to-r from-slate-800/90 to-slate-700/90 text-gray-100 shadow-purple-500/25"
                      }`}
                    style={{ textAlign: 'right' }}
                  >
                    <p className="leading-relaxed">{msg.content}</p>
                    <div className="text-xs opacity-70 mt-2">
                      {msg.timestamp?.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {msg.role === "bot" && (
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
                  <div className="bg-gradient-to-r from-slate-800/90 to-slate-700/90 p-4 rounded-2xl backdrop-blur-sm shadow-lg" style={{ textAlign: 'right' }}>
                    <div className="flex items-center gap-2 flex-row-reverse">
                      <span className="text-sm text-gray-400">הבוט חושב...</span>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur animate-pulse" />
              <div className="relative flex items-center gap-4 bg-slate-800/80 backdrop-blur-sm rounded-full p-2 border border-purple-500/30">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="הקלד הודעה... 💭"
                  className="flex-1 bg-transparent px-6 py-3 text-white placeholder-gray-400 outline-none text-lg text-right"
                  style={{ direction: 'rtl' }}
                  disabled={isTyping}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isTyping}
                  className="group relative p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full 
                           hover:from-blue-400 hover:to-purple-500 transition-all duration-300 
                           hover:scale-110 hover:shadow-lg hover:shadow-purple-500/50
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Send className="w-5 h-5 text-white transform group-hover:translate-x-1 transition-transform duration-200" />
                  <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-active:scale-100 transition-transform duration-200" />
                </button>
              </div>
              <div className="mt-3 text-center">
                <div className="inline-flex items-center gap-2 text-sm text-gray-400">
                  <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '2s' }} />
                  <span>מופעל על ידי בינה מלאכותית מתקדמת</span>
                  <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
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
  );
}
