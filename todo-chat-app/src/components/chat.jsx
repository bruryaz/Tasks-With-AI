import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function ChatApp() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [tasks, setTasks] = useState([]);
  const messagesEndRef = useRef(null);

  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:8000/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input) return;
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await axios.post("http://localhost:8000/manage-task", { text: input });
      const botMessage = { role: "bot", content: res.data.response };
      setMessages((prev) => [...prev, botMessage]);
      fetchTasks(); // עדכון המשימות אחרי כל שליחה
    } catch (err) {
      console.error(err);
      const botMessage = { role: "bot", content: "שגיאה בשרת. נסה שוב." };
      setMessages((prev) => [...prev, botMessage]);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif", backgroundColor: "#121212", color: "#fff" }}>
      
      {/* צד שמאל - משימות */}
      <div style={{ width: "25%", borderRight: "1px solid #333", padding: "1rem", backgroundColor: "#1e1e1e" }}>
        <h3>📋 משימות נוכחיות</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {tasks.map((task, i) => (
            <li key={i} style={{ padding: "0.5rem", marginBottom: "0.5rem", backgroundColor: "#2c2c2c", borderRadius: "8px" }}>
              <b>{task.title}</b><br />
              <small style={{ color: "#bbb" }}>{task.description}</small>
            </li>
          ))}
        </ul>
      </div>

      {/* צד ימין - צ'אט */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, padding: "1rem", overflowY: "auto", display: "flex", flexDirection: "column" }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                backgroundColor: msg.role === "user" ? "#4caf50" : "#333",
                color: msg.role === "user" ? "#fff" : "#eee",
                padding: "0.5rem 1rem",
                borderRadius: "20px",
                marginBottom: "0.5rem",
                maxWidth: "70%",
                wordWrap: "break-word"
              }}
            >
              {msg.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* אינפוט */}
        <div style={{ display: "flex", padding: "1rem", borderTop: "1px solid #333", backgroundColor: "#1e1e1e" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="כתוב כאן..."
            style={{
              flex: 1,
              padding: "0.75rem 1rem",
              borderRadius: "25px",
              border: "1px solid #555",
              marginRight: "0.5rem",
              outline: "none",
              backgroundColor: "#2c2c2c",
              color: "#fff"
            }}
          />
          <button
            onClick={sendMessage}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "25px",
              border: "none",
              backgroundColor: "#4caf50",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            שלח
          </button>
        </div>
      </div>
    </div>
  );
}
