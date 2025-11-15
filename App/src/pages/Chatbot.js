import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  getFirestore,
  collection,
  getDocs
} from "firebase/firestore";
import { app } from "../services/firebase_";

const db = getFirestore(app);

function Chatbot() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! 👋 Ask me anything about Karnataka bills & initiatives." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [contextData, setContextData] = useState(null);

  /* ----------------------------------------------------
      FETCH FIRESTORE DATA (Initiatives + Bills)
  ---------------------------------------------------- */
  useEffect(() => {
    const fetchContext = async () => {
      try {
        const iniSnap = await getDocs(collection(db, "initiatives"));
        const billSnap = await getDocs(collection(db, "bills"));

        const initiatives = iniSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        const bills = billSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setContextData({ initiatives, bills });
      } catch (err) {
        console.error(err);
      }
    };

    fetchContext();
  }, []);

  /* ----------------------------------------------------
      OLLAMA CHAT CALL
  ---------------------------------------------------- */
  const callOllama = async (history, contextData) => {
    const systemContext =
      "You are a helpful assistant for explaining Karnataka government initiatives and bills. " +
      "Use the following JSON data as your ONLY knowledge base unless the user asks general questions. And do not answer anything outside this context.\n\n" +
      JSON.stringify(contextData, null, 2);

    const messagesForOllama = [
      { role: "system", content: systemContext },
      ...history.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text,
      })),
    ];

    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "tinyllama:latest",
        messages: messagesForOllama,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error("Ollama API failed");
    }

    const data = await response.json();
    return data?.message?.content || "No response from Ollama.";
  };

  /* ----------------------------------------------------
      SEND MESSAGE
  ---------------------------------------------------- */
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const newUserMsg = { role: "user", text: input.trim() };
    const updatedHistory = [...messages, newUserMsg];

    setMessages(updatedHistory);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const reply = await callOllama(updatedHistory, contextData);
      const botMsg = { role: "assistant", text: reply };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setError("Failed to connect to local LLM");
    }

    setLoading(false);
  };

  /* ----------------------------------------------------
      ENTER KEY SEND
  ---------------------------------------------------- */
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ----------------------------------------------------
      UI
  ---------------------------------------------------- */
  return (
    <div style={styles.page}>
      <div style={styles.chatContainer}>
        <header style={styles.header}>
          <h1 style={styles.title}>Belaku AI Assistant</h1>
        </header>

        <div style={styles.messagesContainer}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                ...styles.message,
                ...(m.role === "user" ? styles.userMessage : styles.botMessage),
              }}
            >
              <div style={styles.messageRole}>
                {m.role === "user" ? "You" : "Assistant"}
              </div>

              <div style={styles.messageText}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {m.text}
                </ReactMarkdown>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ ...styles.message, ...styles.botMessage }}>
              <div style={styles.messageRole}>Assistant</div>
              <div>Thinking…</div>
            </div>
          )}
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {/* Input Area */}
        <div style={styles.inputArea}>
          <textarea
            style={styles.textarea}
            rows={2}
            placeholder="Ask about initiatives or bills..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <button
            style={{
              ...styles.button,
              ...(loading || !input.trim() ? styles.buttonDisabled : {}),
            }}
            onClick={handleSend}
            disabled={loading || !input.trim()}
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------
      UI STYLES
---------------------------------------------------- */
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #060b23, #0f172a)",
    padding: "20px",
    display: "flex",
    justifyContent: "center",
  },
  chatContainer: {
    width: "100%",
    maxWidth: "800px",
    background: "rgba(15, 23, 42, 0.9)",
    borderRadius: "16px",
    padding: "16px",
    border: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    paddingBottom: "6px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    marginBottom: "10px",
  },
  title: {
    margin: 0,
    color: "#e5e7eb",
    fontSize: "18px",
  },
  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    padding: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  message: {
    padding: "8px 10px",
    borderRadius: "10px",
    maxWidth: "80%",
  },
  userMessage: {
    background: "#2563eb",
    color: "#fff",
    alignSelf: "flex-end",
  },
  botMessage: {
    background: "#0f172a",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    alignSelf: "flex-start",
  },
  messageRole: {
    fontSize: "10px",
    opacity: 0.7,
  },
  messageText: { fontSize: "14px" },
  inputArea: {
    display: "flex",
    gap: "8px",
    marginTop: "10px",
  },
  textarea: {
    flex: 1,
    padding: "10px",
    background: "#020617",
    color: "#fff",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.2)",
  },
  button: {
    padding: "10px 18px",
    borderRadius: "20px",
    border: "none",
    background: "#6366f1",
    color: "#fff",
    cursor: "pointer",
  },
  buttonDisabled: { opacity: 0.5, cursor: "not-allowed" },
  error: {
    color: "#f87171",
    background: "rgba(127, 29, 29, 0.3)",
    padding: "6px",
    borderRadius: "8px",
    marginBottom: "8px",
  },
};

export default Chatbot;
