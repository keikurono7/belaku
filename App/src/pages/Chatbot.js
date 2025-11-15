import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const GEMINI_API_KEY = "AIzaSyB5F9tBapGRfjqwYRvChHl_dLRS2vuQdgg";

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! 👋 Ask me Anything!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Build full conversation context for Gemini
  const buildContentsForGemini = (history) =>
    history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.text }],
    }));

  const callGemini = async (historyWithUser) => {
    const contents = buildContentsForGemini(historyWithUser);

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
        GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contents }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Error from Gemini API");
    }

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't generate a response.";

    return text;
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage = { role: "user", text: trimmed };
    const historyWithUser = [...messages, userMessage];

    // Update UI immediately
    setMessages(historyWithUser);
    setInput("");
    setError("");
    setLoading(true);

    try {
      // Send full history + new user msg
      const reply = await callGemini(historyWithUser);
      const botMessage = { role: "assistant", text: reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.chatContainer}>
        <header style={styles.header}>
          <h1 style={styles.title}>Chatbot</h1>
        </header>

        <div style={styles.messagesContainer}>
          {messages.map((m, index) => (
            <div
              key={index}
              style={{
                ...styles.message,
                ...(m.role === "user" ? styles.userMessage : styles.botMessage),
              }}
            >
              <div style={styles.messageRole}>
                {m.role === "user" ? "You" : "Bot"}
              </div>
              <div style={styles.messageText}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ inline, className, children, ...props }) {
                      const isBlock = !inline;
                      return isBlock ? (
                        <pre style={styles.codeBlock}>
                          <code {...props}>{children}</code>
                        </pre>
                      ) : (
                        <code style={styles.inlineCode} {...props}>
                          {children}
                        </code>
                      );
                    },
                    a({ children, ...props }) {
                      return (
                        <a
                          {...props}
                          style={{ color: "#93c5fd", textDecoration: "underline" }}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {children}
                        </a>
                      );
                    },
                  }}
                >
                  {m.text}
                </ReactMarkdown>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ ...styles.message, ...styles.botMessage }}>
              <div style={styles.messageRole}>Bot</div>
              <div style={styles.messageText}>Thinking…</div>
            </div>
          )}
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.inputArea}>
          <textarea
            style={styles.textarea}
            rows={2}
            placeholder="Ask something... (Shift+Enter for new line, Enter to send)"
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

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #060b23, #111827)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    boxSizing: "border-box",
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  chatContainer: {
    width: "100%",
    maxWidth: "800px",
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    borderRadius: "18px",
    padding: "16px",
    boxSizing: "border-box",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    border: "1px solid rgba(148, 163, 184, 0.2)",
  },
  header: {
    borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
    paddingBottom: "8px",
    marginBottom: "4px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  title: {
    margin: 0,
    fontSize: "20px",
    color: "#e5e7eb",
  },
  subtitle: {
    fontSize: "12px",
    color: "#9ca3af",
  },
  messagesContainer: {
    flex: 1,
    minHeight: "280px",
    maxHeight: "480px",
    overflowY: "auto",
    padding: "8px 4px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  message: {
    padding: "8px 10px",
    borderRadius: "12px",
    maxWidth: "80%",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    fontSize: "14px",
    lineHeight: 1.45,
    wordBreak: "break-word",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#2563eb",
    color: "#eff6ff",
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#020617",
    border: "1px solid rgba(148, 163, 184, 0.3)",
    color: "#e5e7eb",
  },
  messageRole: {
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    opacity: 0.7,
  },
  messageText: {
    fontSize: "14px",
  },
  codeBlock: {
    marginTop: "4px",
    padding: "8px",
    borderRadius: "8px",
    backgroundColor: "#020617",
    border: "1px solid rgba(148, 163, 184, 0.4)",
    overflowX: "auto",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: "13px",
  },
  inlineCode: {
    padding: "2px 4px",
    borderRadius: "4px",
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    border: "1px solid rgba(148, 163, 184, 0.4)",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: "13px",
  },
  inputArea: {
    display: "flex",
    gap: "8px",
    alignItems: "flex-end",
    paddingTop: "8px",
    borderTop: "1px solid rgba(148, 163, 184, 0.2)",
  },
  textarea: {
    flex: 1,
    resize: "none",
    borderRadius: "12px",
    border: "1px solid rgba(148, 163, 184, 0.6)",
    padding: "8px 10px",
    backgroundColor: "#020617",
    color: "#e5e7eb",
    fontFamily: "inherit",
    fontSize: "14px",
    outline: "none",
  },
  button: {
    border: "none",
    borderRadius: "999px",
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    background:
      "radial-gradient(circle at 0 0, #38bdf8, transparent 60%), radial-gradient(circle at 100% 0, #a855f7, transparent 60%)",
    color: "#f9fafb",
    minWidth: "90px",
    transition: "transform 0.1s ease, box-shadow 0.1s ease, opacity 0.1s ease",
    boxShadow: "0 10px 20px rgba(15, 23, 42, 0.7)",
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
    boxShadow: "none",
  },
  error: {
    fontSize: "12px",
    color: "#fecaca",
    backgroundColor: "rgba(127, 29, 29, 0.5)",
    padding: "6px 8px",
    borderRadius: "8px",
  },
};

export default Chatbot;
